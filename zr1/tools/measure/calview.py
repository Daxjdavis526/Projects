"""Calibrating a free camera (a configurator render) against the spin.

Starting from a rough camera (hand-read landmarks and PnP), the view's
landmarks and the spin's tracked points are searched near their predicted
positions by warped-patch correlation, the joint solve re-run, matches
whose residual exceeds a threshold dropped, and the search narrowed, until
the set stops changing.
"""

from __future__ import annotations

import numpy as np
import cv2
from scipy.optimize import least_squares

from camera import Camera
from spin import frame_camera
import xmatch


def pnp(P3, P2, w, h, f_range=(1500, 30000)):
    """Camera (focal, pose; principal point at the centre) from >= 5 2-D/3-D pairs."""
    P3, P2 = np.asarray(P3, float), np.asarray(P2, float)
    best = None
    for f in np.geomspace(*f_range, 50):
        K = np.array([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])
        ok, rv, tv = cv2.solvePnP(P3, P2, K, None, flags=cv2.SOLVEPNP_SQPNP)
        if not ok:
            continue
        pr = cv2.projectPoints(P3, rv, tv, K, None)[0].reshape(-1, 2)
        e = np.sqrt(np.mean(np.sum((pr - P2) ** 2, 1)))
        if best is None or e < best[0]:
            best = (e, f, rv, tv)
    _, f, rv, tv = best

    def res(x):
        c = Camera(x[0], w / 2, h / 2, x[1:4], x[4:7], w, h)
        return (c.project(P3) - P2).ravel()
    s = least_squares(res, np.concatenate([[f], rv.ravel(), tv.ravel()]), loss="soft_l1", f_scale=3.0)
    cam = Camera(s.x[0], w / 2, h / 2, s.x[1:4], s.x[4:7], w, h)
    return cam, np.linalg.norm(s.fun.reshape(-1, 2), axis=1)


def guided(J, view, img, spin_imgs, spin_obs, search=8, min_ncc=0.88, max_angle=30.0, half=12):
    """Matches of the spin's landmarks and tracked points in `view`.

    spin_imgs / spin_obs may also hold calibrated free views (string keys)
    as sources, alongside spin frames (integer keys)."""
    cam = J.free_cams[view]
    alpha = img[:, :, 3] if img.shape[2] == 4 else np.full(img.shape[:2], 255, np.uint8)
    scams = {k: (frame_camera(J.rig, k, *J.rig_size) if isinstance(k, int) else J.free_cams[k])
             for k in spin_imgs if k != view}
    out = []
    H, W = img.shape[:2]
    for n, ob in spin_obs.items():
        X = J.point(n, J.sc, J.base, J.free)
        if cam.to_cam(X)[0, 2] <= 0:
            continue
        uv = cam.project(X)[0]
        if not (2 * half < uv[0] < W - 2 * half and 2 * half < uv[1] < H - 2 * half):
            continue
        if alpha[int(uv[1]), int(uv[0])] < 250:
            continue
        vd = (cam.centre - X) / np.linalg.norm(cam.centre - X)
        cos = {j: vd @ ((scams[j].centre - X) / np.linalg.norm(scams[j].centre - X)) for j in ob if j in scams}
        if not cos:
            continue
        k = max(cos, key=cos.get)
        if cos[k] < np.cos(np.radians(max_angle)):
            continue
        q, c = xmatch.find(spin_imgs[k], scams[k], ob[k], img, cam, X, half=half, search=search,
                           min_ncc=min_ncc)
        if q is not None:
            out.append((n, q, c))
    return out


def calibrate(J, view, img, spin_imgs, spin_obs, searches=(25, 12, 6, 4), max_res=3.0,
              free_pp=True, log=print, max_angle=30.0, min_ncc=0.88, keep=()):
    """`keep`: hand-read observations (name, uv) always included."""
    for s in searches:
        m = guided(J, view, img, spin_imgs, spin_obs, search=s, max_angle=max_angle, min_ncc=min_ncc)
        got = {n for n, _, _ in m}
        m += [(n, np.asarray(uv, float), 1.0) for n, uv in keep if n not in got]
        J.obs = [o for o in J.obs if o[0] != view] + [(view, n, q, 1.0) for n, q, c in m]
        if not free_pp:
            J.pp_prior[view] = 0.5
        J.solve(max_nfev=60)
        rep, e = J.report()
        idx = J._by_img[view]
        bad = {J.obs[i][1] for i in idx if e[i] > max_res}
        if bad:
            J.obs = [o for o in J.obs if not (o[0] == view and o[1] in bad)]
            J.solve(max_nfev=40)
            rep, e = J.report()
        cam = J.free_cams[view]
        ee = e[J._by_img[view]]
        log(f"  {view} search {s}: {len(ee)} matches, rms {np.sqrt(np.mean(ee ** 2)):.2f} median "
            f"{np.median(ee):.2f} max {ee.max():.2f} px; f {cam.f:.0f}, pp ({cam.cx:.0f},{cam.cy:.0f}), "
            f"centre {np.round(cam.centre).astype(int)}")
    return J
