"""Joint solve of the reference cameras and the 3-D points seen in them.

Unknowns: per image a camera (focal length, rotation, translation; images of
one render session can share a focal length), per named 3-D point its
position (a left/right pair shares one point mirrored in y), and a few named
scalars (e.g. wheel-centre heights) shared by every image.

Observations:
  point   — a pixel position of a named 3-D point (known or unknown);
  circle  — pixels on the image of a 3-D circle (a wheel's rim or tyre),
            scored by their Sampson distance to the projected conic, so the
            pixels need not correspond to any particular point on it.

Residuals are pixels, so the reported RMS is a reprojection error a reader
can compare with the image resolution directly.
"""

from __future__ import annotations

import dataclasses
import numpy as np
import cv2
from scipy.optimize import least_squares
from scipy.sparse import lil_matrix

from camera import Camera, circle_conic, sampson


@dataclasses.dataclass
class Circle:
    """A 3-D circle whose centre/normal/radius are functions of the scalars."""
    centre: callable    # scalars dict -> (3,)
    normal: tuple
    radius: callable    # scalars dict -> float


class Problem:
    def __init__(self):
        self.cams: dict[str, Camera] = {}
        self.cam_group: dict[str, str] = {}       # image -> focal group
        self.fixed_f: set[str] = set()
        self.points: dict[str, np.ndarray] = {}   # unknown 3-D points
        self.known: dict[str, np.ndarray] = {}    # fixed 3-D points
        self.mirror: dict[str, tuple[str, float]] = {}  # name -> (base, sign of y)
        self.scalars: dict[str, float] = {}
        self.fixed_scalars: set[str] = set()
        self.circles: dict[str, Circle] = {}
        self.obs_pt: list[tuple[str, str, np.ndarray, float]] = []
        self.obs_circ: list[tuple[str, str, np.ndarray, float]] = []

    # ---- building
    def camera(self, name, cam: Camera, group=None, fix_f=False):
        self.cams[name] = cam
        self.cam_group[name] = group or name
        if fix_f:
            self.fixed_f.add(self.cam_group[name])

    def point(self, name, guess, mirrored=False):
        """An unknown 3-D point; mirrored=True also defines name+'.m' at -y."""
        self.points[name] = np.asarray(guess, float)
        if mirrored:
            self.mirror[name + ".m"] = (name, -1.0)

    def scalar(self, name, value, fixed=False):
        self.scalars[name] = float(value)
        if fixed:
            self.fixed_scalars.add(name)

    def see(self, img, pt, uv, weight=1.0):
        self.obs_pt.append((img, pt, np.asarray(uv, float), weight))

    def see_circle(self, img, circ, uvs, weight=1.0):
        self.obs_circ.append((img, circ, np.asarray(uvs, float).reshape(-1, 2), weight))

    # ---- packing
    def _layout(self):
        groups = sorted({g for g in self.cam_group.values() if g not in self.fixed_f})
        self._groups = {g: i for i, g in enumerate(groups)}
        o = len(groups)
        self._cam_off = {}
        for n in self.cams:
            self._cam_off[n] = o
            o += 6
        self._pt_off = {}
        for n in self.points:
            self._pt_off[n] = o
            o += 3
        self._sc_off = {}
        for n in self.scalars:
            if n not in self.fixed_scalars:
                self._sc_off[n] = o
                o += 1
        self.n = o

    def _pack(self):
        x = np.zeros(self.n)
        for n, c in self.cams.items():
            g = self.cam_group[n]
            if g in self._groups:
                x[self._groups[g]] = c.f
            x[self._cam_off[n]:self._cam_off[n] + 3] = np.ravel(c.rvec)
            x[self._cam_off[n] + 3:self._cam_off[n] + 6] = np.ravel(c.tvec)
        for n, p in self.points.items():
            x[self._pt_off[n]:self._pt_off[n] + 3] = p
        for n, o in self._sc_off.items():
            x[o] = self.scalars[n]
        return x

    def _unpack(self, x):
        cams = {}
        for n, c in self.cams.items():
            g = self.cam_group[n]
            f = x[self._groups[g]] if g in self._groups else c.f
            o = self._cam_off[n]
            cams[n] = Camera(f, c.cx, c.cy, x[o:o + 3].copy(), x[o + 3:o + 6].copy(), c.w, c.h)
        pts = {n: x[o:o + 3].copy() for n, o in self._pt_off.items()}
        sc = dict(self.scalars)
        for n, o in self._sc_off.items():
            sc[n] = x[o]
        return cams, pts, sc

    def _xyz(self, name, pts):
        if name in pts:
            return pts[name]
        if name in self.known:
            return self.known[name]
        base, s = self.mirror[name]
        p = pts[base].copy()
        p[1] *= s
        return p

    def _deps(self, img, pt=None, circ=None):
        d = [self._cam_off[img] + k for k in range(6)]
        g = self.cam_group[img]
        if g in self._groups:
            d.append(self._groups[g])
        if pt is not None:
            base = self.mirror.get(pt, (pt,))[0]
            if base in self._pt_off:
                d += [self._pt_off[base] + k for k in range(3)]
        if circ is not None:
            d += list(self._sc_off.values())   # circles may read any scalar
        return d

    def residuals(self, x):
        cams, pts, sc = self._unpack(x)
        r = []
        for img, pt, uv, w in self.obs_pt:
            r.extend(w * (cams[img].project(self._xyz(pt, pts))[0] - uv))
        for img, cn, uvs, w in self.obs_circ:
            c = self.circles[cn]
            C = circle_conic(cams[img], c.centre(sc), c.normal, c.radius(sc))
            r.extend(w * sampson(C, uvs))
        return np.array(r)

    def solve(self, verbose=0, loss="soft_l1", f_scale=2.0):
        self._layout()
        x0 = self._pack()
        m = 2 * len(self.obs_pt) + sum(len(u) for _, _, u, _ in self.obs_circ)
        J = lil_matrix((m, self.n), dtype=int)
        row = 0
        for img, pt, _, _ in self.obs_pt:
            for c in self._deps(img, pt=pt):
                J[row:row + 2, c] = 1
            row += 2
        for img, cn, uvs, _ in self.obs_circ:
            for c in self._deps(img, circ=cn):
                J[row:row + len(uvs), c] = 1
            row += len(uvs)
        res = least_squares(self.residuals, x0, jac_sparsity=J, loss=loss, f_scale=f_scale,
                            x_scale="jac", verbose=verbose, max_nfev=2000)
        self.cams, pts, self.scalars = self._unpack(res.x)
        self.points.update(pts)
        return res

    def init_each(self, focal_factors=(0.6, 1.0, 1.6, 2.5, 4.0), verbose=False):
        """Solve each camera alone against the FIXED geometry it sees (known
        points and circles, scalars at their current values), from several
        focal-length starts, keeping the best. A joint solve started from
        these converges; one started from rough guesses often does not."""
        for img, cam0 in list(self.cams.items()):
            best = None
            for k in focal_factors:
                sub = Problem()
                sub.circles, sub.known, sub.mirror = self.circles, self.known, {}
                sub.scalars = dict(self.scalars)
                sub.fixed_scalars = set(self.scalars)
                f = cam0.w * k * 0.5 if cam0.w else cam0.f * k
                # Keep the view direction, move the camera along it so the
                # framing stays about the same at the new focal length.
                tgt = cam0.centre + 4000 * (cam0.R.T @ np.array([0, 0, 1.0]))
                eye = tgt + (cam0.centre - tgt) * (f / cam0.f)
                sub.camera(img, Camera.look_at(eye, tgt, f, cam0.w, cam0.h))
                sub.obs_pt = [o for o in self.obs_pt if o[0] == img and o[1] in self.known]
                sub.obs_circ = [o for o in self.obs_circ if o[0] == img]
                if not sub.obs_pt and not sub.obs_circ:
                    break
                try:
                    r = sub.solve(loss="linear")
                except Exception:
                    continue
                cost = float(np.mean(np.square(r.fun))) if len(r.fun) else 0.0
                in_front = all(sub.cams[img].to_cam(X)[0, 2] > 0 for X in self.known.values())
                if in_front and (best is None or cost < best[0]):
                    best = (cost, sub.cams[img])
                if verbose:
                    print(img, k, cost, in_front)
            if best is not None:
                self.cams[img] = best[1]

    def report(self) -> str:
        cams, pts, sc = self._unpack(self._pack())
        lines = []
        for img in self.cams:
            rp = [np.linalg.norm(cams[img].project(self._xyz(pt, pts))[0] - uv)
                  for i, pt, uv, _ in self.obs_pt if i == img]
            rc = []
            for i, cn, uvs, _ in self.obs_circ:
                if i == img:
                    c = self.circles[cn]
                    rc.extend(np.abs(sampson(circle_conic(cams[img], c.centre(sc), c.normal, c.radius(sc)), uvs)))
            cam = cams[img]
            lines.append(f"{img:28s} f={cam.f:8.1f}px  centre={np.round(cam.centre).astype(int)}  "
                         f"points n={len(rp)} rms={np.sqrt(np.mean(np.square(rp))) if rp else 0:.2f}px "
                         f"max={max(rp) if rp else 0:.2f}  circles n={len(rc)} rms={np.sqrt(np.mean(np.square(rc))) if rc else 0:.2f}px")
        return "\n".join(lines)
