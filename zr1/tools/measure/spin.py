"""The turntable model for a 360-degree spin of renders.

Every frame of a spin is the same camera looking at the car turned about a
vertical axis by a fixed step. So the whole set of cameras is a handful of
numbers: focal length, camera distance and height from the axis, the height
it aims at, its roll, where the axis stands in the car's frame, the angle of
the first frame, and the step. Solving those few from wheel hubs and ground
contacts in many frames calibrates every frame at once, and far more
robustly than solving each frame alone.
"""

from __future__ import annotations

import numpy as np
import cv2
from scipy.optimize import least_squares

from camera import Camera

KEYS = ["f", "D", "H", "ht", "roll", "cx", "cy", "th0", "step"]


def rz(a: float) -> np.ndarray:
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])


def frame_camera(p: dict, k: int, w: int, h: int) -> Camera:
    """The camera of frame k (1-based) in the CAR's frame."""
    th = np.radians(p["th0"] + p["step"] * (k - 1))
    # Camera in the turntable frame: on +x at distance D, height H, aimed
    # at (0, 0, ht), rolled about its view axis.
    cam_t = Camera.look_at([p["D"], 0, p["H"]], [0, 0, p["ht"]], p["f"], w, h)
    Rr = cv2.Rodrigues(np.array([0, 0, np.radians(p["roll"])]))[0]
    R_t = Rr @ cam_t.R
    t_t = Rr @ np.asarray(cam_t.tvec)
    # Car -> turntable:  X_t = Rz(th) (X - c)
    Rz_ = rz(th)
    c = np.array([p["cx"], p["cy"], 0.0])
    R = R_t @ Rz_
    t = t_t - R_t @ Rz_ @ c
    return Camera(p["f"], w / 2, h / 2, cv2.Rodrigues(R)[0].ravel(), t, w, h)


def solve(p0: dict, obs, scalars0: dict, point_fn, fixed=("step",), w=1500, h=750,
          free_points: dict | None = None, f_scale: float = 2.0, max_nfev: int = 200):
    """Fit the turntable and named scalars to point observations.

    obs: (frame, name, uv) triples; point_fn(name, scalars, points) gives the
    3-D position of a named point from the scalars and the free points.
    Returns (params, scalars, points, per-observation residuals)."""
    keys = [k for k in KEYS if k not in fixed]
    sk = list(scalars0)
    fp = dict(free_points or {})
    pk = list(fp)

    def unpack(x):
        p = dict(p0)
        p.update({k: x[i] for i, k in enumerate(keys)})
        o = len(keys)
        sc = {k: x[o + i] for i, k in enumerate(sk)}
        o += len(sk)
        pts = {k: x[o + 3 * i:o + 3 * i + 3] for i, k in enumerate(pk)}
        return p, sc, pts

    by_frame = {}
    for i, (k, name, uv) in enumerate(obs):
        by_frame.setdefault(k, []).append(i)
    UV = np.array([uv for _, _, uv in obs], float).reshape(-1, 2)

    def res(x):
        p, sc, pts = unpack(x)
        r = np.zeros((len(obs), 2))
        for k, idx in by_frame.items():
            cam = frame_camera(p, k, w, h)
            X = np.array([point_fn(obs[i][1], sc, pts) for i in idx])
            r[idx] = cam.project(X) - UV[idx]
        return r.ravel()

    x0 = np.concatenate([[p0[k] for k in keys], [scalars0[k] for k in sk]] +
                        [fp[k] for k in pk])
    # Sparsity: every residual depends on the rig and the scalars; a free
    # point's residuals also on its own three coordinates.
    from scipy.sparse import lil_matrix
    nglob = len(keys) + len(sk)
    J = lil_matrix((2 * len(obs), len(x0)), dtype=int)
    J[:, :nglob] = 1
    pidx = {k: i for i, k in enumerate(pk)}
    for r_, (_, name, _) in enumerate(obs):
        if name in pidx:
            o = nglob + 3 * pidx[name]
            J[2 * r_:2 * r_ + 2, o:o + 3] = 1
    sol = least_squares(res, x0, jac_sparsity=J, loss="soft_l1", f_scale=f_scale,
                        x_scale="jac", max_nfev=max_nfev)
    p, sc, pts = unpack(sol.x)
    return p, sc, pts, res(sol.x).reshape(-1, 2)
