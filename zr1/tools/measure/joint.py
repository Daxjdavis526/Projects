"""One bundle solve over every reference image.

Cameras come in two kinds: frames of a turntable spin (one shared rig,
spin.frame_camera) and free cameras (focal length, principal point and
pose each; the configurator renders are crops whose optical centre need
not be the image centre). Points come in three kinds: fixed-by-scalars
(wheel hubs and tyre contacts, from wheelbase, track and solved heights),
mirrored landmark pairs (one free base point, observed on either side),
and free points (feature tracks).

Residuals are pixels in each image's own resolution; per-image weights
let a coarser image count for less.
"""

from __future__ import annotations

import numpy as np
from scipy.optimize import least_squares
from scipy.sparse import lil_matrix

from camera import Camera
from spin import frame_camera, KEYS

TF, TR, WB = 1685.0, 1678.0, 2723.0
TREAD = {"F": 275.0, "R": 345.0}


def fixed_point(name, sc):
    """Hubs 'FL'... (spin wheels), 'cFL'... (configurator SOG wheels: own
    face offsets), tyre-bottom contacts 'gFL'..."""
    if name.startswith("g"):
        a, s = name[1], name[2]
        y = (TF if a == "F" else TR) / 2 + 0.42 * TREAD[a]
        return np.array([0.0 if a == "F" else WB, -y if s == "L" else y, 0.0])
    pre = ""
    if name.startswith("c"):
        pre, name = "c", name[1:]
    a, s = name[0], name[1]
    off = sc[pre + ("df" if a == "F" else "dr")]
    y = (TF if a == "F" else TR) / 2 + off
    return np.array([0.0 if a == "F" else WB, -y if s == "L" else y, sc["hf" if a == "F" else "hr"]])


class Joint:
    def __init__(self, rig: dict, scalars: dict, rig_size=(1500, 750)):
        self.rig = dict(rig)
        self.rig_fixed = {"step"}
        self.rig_size = rig_size
        self.sc = dict(scalars)
        self.sc_fixed: set[str] = set()
        self.free_cams: dict[str, Camera] = {}
        self.base: dict[str, np.ndarray] = {}     # mirrored landmark bases ('lm:<base>')
        self.free: dict[str, np.ndarray] = {}     # free points
        self.obs: list[tuple] = []                # (image, point name, uv, weight)
        self.pp_prior: dict[str, float] = {}      # free camera -> sigma (px) pulling pp to centre

    def cam(self, img, rig=None, cams=None):
        if isinstance(img, int):
            return frame_camera(rig or self.rig, img, *self.rig_size)
        return (cams or self.free_cams)[img]

    def point(self, name, sc, base, free):
        if name in free:
            return free[name]
        if name.startswith("lm:"):
            _, b, side = name.split(":")
            X = base["lm:" + b].copy()
            X[1] = -abs(X[1]) if side == "L" else (abs(X[1]) if side == "R" else 0.0)
            return X
        return fixed_point(name, sc)

    def _layout(self):
        self._rk = [k for k in KEYS if k not in self.rig_fixed]
        self._sk = [k for k in self.sc if k not in self.sc_fixed]
        self._ck = list(self.free_cams)
        self._bk = list(self.base)
        self._fk = list(self.free)
        o = len(self._rk) + len(self._sk)
        self._co = {c: o + 9 * i for i, c in enumerate(self._ck)}
        o += 9 * len(self._ck)
        self._bo = {b: o + 3 * i for i, b in enumerate(self._bk)}
        o += 3 * len(self._bk)
        self._fo = {f: o + 3 * i for i, f in enumerate(self._fk)}
        o += 3 * len(self._fk)
        self.n = o

    def _pack(self):
        x = [self.rig[k] for k in self._rk] + [self.sc[k] for k in self._sk]
        for c in self._ck:
            cm = self.free_cams[c]
            x += [cm.f, *np.ravel(cm.rvec), *np.ravel(cm.tvec), cm.cx, cm.cy]
        for b in self._bk:
            x += list(self.base[b])
        for f in self._fk:
            x += list(self.free[f])
        return np.array(x, float)

    def _unpack(self, x):
        rig = dict(self.rig)
        rig.update({k: x[i] for i, k in enumerate(self._rk)})
        o = len(self._rk)
        sc = dict(self.sc)
        sc.update({k: x[o + i] for i, k in enumerate(self._sk)})
        cams = {}
        for c, o in self._co.items():
            cm = self.free_cams[c]
            cams[c] = Camera(x[o], x[o + 7], x[o + 8], x[o + 1:o + 4].copy(), x[o + 4:o + 7].copy(), cm.w, cm.h)
        base = {b: x[o:o + 3].copy() for b, o in self._bo.items()}
        free = {f: x[o:o + 3].copy() for f, o in self._fo.items()}
        return rig, sc, cams, base, free

    def residuals(self, x):
        rig, sc, cams, base, free = self._unpack(x)
        r = np.zeros((len(self.obs), 2))
        for img, idx in self._by_img.items():
            cam = frame_camera(rig, img, *self.rig_size) if isinstance(img, int) else cams[img]
            X = np.array([self.point(self.obs[i][1], sc, base, free) for i in idx])
            r[idx] = (cam.project(X) - self._UV[idx]) * self._W[idx, None]
        pri = [((cams[v].cx - cams[v].w / 2) / s, (cams[v].cy - cams[v].h / 2) / s)
               for v, s in self.pp_prior.items() if v in cams]
        return np.concatenate([r.ravel(), np.ravel(pri)]) if pri else r.ravel()

    def solve(self, f_scale=1.5, max_nfev=100, verbose=0):
        self._layout()
        self._by_img = {}
        for i, (img, *_rest) in enumerate(self.obs):
            self._by_img.setdefault(img, []).append(i)
        self._UV = np.array([o[2] for o in self.obs], float).reshape(-1, 2)
        self._W = np.array([o[3] if len(o) > 3 else 1.0 for o in self.obs], float)
        J = lil_matrix((2 * len(self.obs), self.n), dtype=int)
        nr, ns = len(self._rk), len(self._sk)
        for i, (img, name, *_rest) in enumerate(self.obs):
            rows = slice(2 * i, 2 * i + 2)
            J[rows, nr:nr + ns] = 1
            if isinstance(img, int):
                J[rows, :nr] = 1
            else:
                o = self._co[img]
                J[rows, o:o + 9] = 1
            if name in self._fo:
                J[rows, self._fo[name]:self._fo[name] + 3] = 1
            elif name.startswith("lm:"):
                o = self._bo["lm:" + name.split(":")[1]]
                J[rows, o:o + 3] = 1
        pri = [v for v in self.pp_prior if v in self._co]
        if pri:
            Jp = lil_matrix((2 * len(pri), self.n), dtype=int)
            for i, v in enumerate(pri):
                Jp[2 * i:2 * i + 2, self._co[v] + 7:self._co[v] + 9] = 1
            from scipy.sparse import vstack
            J = vstack([J, Jp]).tolil()
        sol = least_squares(self.residuals, self._pack(), jac_sparsity=J, loss="soft_l1",
                            f_scale=f_scale, x_scale="jac", max_nfev=max_nfev, verbose=verbose)
        self.rig, self.sc, self.free_cams, self.base, self.free = self._unpack(sol.x)
        return sol

    def report(self, x=None):
        r = (self.residuals(self._pack()) if x is None else self.residuals(x))[:2 * len(self.obs)].reshape(-1, 2)
        e = np.linalg.norm(r, axis=1) / self._W
        out = {}
        for img, idx in self._by_img.items():
            ee = e[idx]
            out[img] = (len(idx), float(np.sqrt(np.mean(ee ** 2))), float(np.median(ee)), float(ee.max()))
        return out, e
