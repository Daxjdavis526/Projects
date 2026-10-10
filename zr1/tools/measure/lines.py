"""Character lines of the car, traced in calibrated views and triangulated.

Each line is a named record: which side it is on ('L' / 'R' / 'C' for the
centre plane), the snapping mode (an 'edge' between light and dark, or a
'ridge' for a thin dark gap line), and per view a hand-placed hint
polyline in that image's pixels. Building a line snaps every hint onto the
image, reconstructs the 3-D curve from the best pair of views, refines it
against all of them (curves.refine) and reports pixel residuals per view.
Right-side traces of an 'L' line are used mirrored, and vice versa.
"""

from __future__ import annotations

import json
import numpy as np
import cv2

from camera import Camera
from trace import snap, load
from curves import init_two_view, refine, MIRROR


class LineSet:
    def __init__(self, cams: dict, images: dict):
        self.cams = cams          # view name -> Camera
        self.images = images      # view name -> image path
        self._img = {}
        self.lines = {}           # name -> record
        self.result = {}          # name -> (X (n,3), stats, snapped traces)

    def img(self, v):
        if v not in self._img:
            self._img[v] = load(self.images[v])
        return self._img[v]

    def add(self, name, side, mode, traces: dict, closed=False, partial=()):
        self.lines[name] = dict(side=side, mode=mode, traces={k: [list(map(float, p)) for p in v]
                                                              for k, v in traces.items()},
                                closed=closed, partial=list(partial))

    def wire(self, v, anchors, closed=False):
        """Live-wire path through the anchors along image edges (OpenCV's
        intelligent scissors, on a local crop for speed)."""
        A = np.asarray(anchors, float)
        if closed:
            A = np.concatenate([A, A[:1]])
        im = self.img(v)
        pad = 40
        x0, y0 = max(int(A[:, 0].min()) - pad, 0), max(int(A[:, 1].min()) - pad, 0)
        x1, y1 = min(int(A[:, 0].max()) + pad, im.shape[1]), min(int(A[:, 1].max()) + pad, im.shape[0])
        crop = np.ascontiguousarray(im[y0:y1, x0:x1])
        tool = cv2.segmentation.IntelligentScissorsMB()
        tool.setEdgeFeatureCannyParameters(16, 50)
        tool.setGradientMagnitudeMaxLimit(200)
        tool.applyImage(crop)
        path = []
        for a, b in zip(A[:-1], A[1:]):
            tool.buildMap((int(round(a[0] - x0)), int(round(a[1] - y0))))
            c = tool.getContour((int(round(b[0] - x0)), int(round(b[1] - y0))))
            c = c.reshape(-1, 2)[::-1] if len(c) else np.array([a - [x0, y0], b - [x0, y0]])
            path.extend(c.tolist() if not path else c[1:].tolist())
        return np.array(path, float) + [x0, y0]

    def build(self, name, band=6.0, n=40, log=print):
        L = self.lines[name]
        snapped = {}
        for v, hint in L['traces'].items():
            h = np.array(hint)
            if L['mode'].startswith('wire'):
                h = self.wire(v, h, L['closed'])
                h = h[::3] if len(h) > 9 else h
                mode, b = ('ridge' if L['mode'] == 'wire-ridge' else 'edge'), 2.5
            else:
                mode, b = L['mode'], band
            q, s = snap(self.img(v), h, band=b, mode=mode, closed=L['closed'] and not L['mode'].startswith('wire'))
            snapped[v] = q[s > 0.12]
        # Views seeing the line's twin on the other side contribute mirrored.
        def mirrored(v):
            c = self.cams[v]
            side_seen = 'L' if c.centre[1] < 0 else 'R'
            return L['side'] in ('L', 'R') and side_seen != L['side']
        vs = list(snapped)
        best, X0 = None, None
        for i in range(len(vs)):
            for j in range(i + 1, len(vs)):
                a, b = vs[i], vs[j]
                try:
                    Xa = init_two_view(self.cams[a], snapped[a], self.cams[b], snapped[b], mirrored(a), mirrored(b), n=n)
                except Exception:
                    continue
                if len(Xa) < 5:
                    continue
                ca, cb = self.cams[a].centre, self.cams[b].centre
                m = Xa.mean(0)
                ang = np.degrees(np.arccos(np.clip(((ca - m) / np.linalg.norm(ca - m)) @ ((cb - m) / np.linalg.norm(cb - m)), -1, 1)))
                score = min(ang, 40) * len(Xa)
                if best is None or score > best:
                    best, X0 = score, Xa
        if X0 is None:
            raise RuntimeError(f'{name}: no usable view pair')
        obs = [(self.cams[v], snapped[v], mirrored(v), v in L['partial']) for v in vs]
        X, stats = refine(X0, obs, n=n, fix_y0=(L['side'] == 'C'))
        self.result[name] = (X, {v: stats[i] for i, v in enumerate(vs)}, snapped)
        log(f"{name:28s} " + "  ".join(f"{v}: {stats[i][0]:.2f}/{stats[i][1]:.1f}px" for i, v in enumerate(vs)))
        return X

    def save(self, path):
        json.dump({'lines': self.lines,
                   'result': {k: {'X': v[0].tolist(), 'stats': {kk: list(vv) for kk, vv in v[1].items()}}
                              for k, v in self.result.items()}}, open(path, 'w'), indent=0)

    def load(self, path):
        d = json.load(open(path))
        self.lines = d['lines']
        for k, v in d.get('result', {}).items():
            self.result[k] = (np.array(v['X']), {kk: tuple(vv) for kk, vv in v['stats'].items()}, {})

    def overlay(self, view, out, names=None, scale=0.6):
        im = self.img(view).copy()
        cam = self.cams[view]
        for nm, (X, st, sn) in self.result.items():
            if names and nm not in names:
                continue
            for P, col in ((X, (0, 0, 255)), (X @ MIRROR, (255, 0, 255))):
                uv = cam.project(P)
                if np.all(cam.to_cam(P)[:, 2] > 0):
                    cv2.polylines(im, [np.round(uv).astype(np.int32)], False, col, 2)
            if view in sn:
                for p in sn[view]:
                    cv2.circle(im, (int(p[0]), int(p[1])), 1, (0, 255, 0), -1)
        cv2.imwrite(out, cv2.resize(im, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA))


def _faces_side(cam, side):
    """Does this camera look at the car's `side` ('L' = y<0, 'R' = y>0)?"""
    return (cam.centre[1] < 0) == (side == 'L')


def propagate(LS: 'LineSet', name, candidates, band=5.0, min_strength=0.25, max_med_px=3.0,
              rounds=2, log=print, max_rms=2.5):
    """Project a reconstructed line into other views, snap it there, keep the
    views that agree, and re-solve the curve from all of them."""
    L = LS.lines[name]
    for rnd in range(rounds):
        X, stats, snapped = LS.result[name]
        added = []
        for v in candidates:
            if v in L['traces'] or v in L.get('rejected', []):
                continue
            cam = LS.cams[v]
            side_seen = 'L' if cam.centre[1] < 0 else 'R'
            twin = L['side'] in ('L', 'R') and side_seen != L['side']
            P = X @ MIRROR if twin else X
            if np.any(cam.to_cam(P)[:, 2] <= 0):
                continue
            uv = cam.project(P)
            h, w = LS.img(v).shape[:2]
            if uv[:, 0].min() < 5 or uv[:, 1].min() < 5 or uv[:, 0].max() > w - 5 or uv[:, 1].max() > h - 5:
                continue
            mode = 'ridge' if 'ridge' in L['mode'] else 'edge'
            q, s = snap(LS.img(v), uv, band=band, mode=mode)
            from trace import resample
            pr = resample(uv, 2.0)
            med = float(np.median(np.linalg.norm(q - pr[:len(q)], axis=1))) if len(q) == len(pr) else 99
            if s.mean() >= min_strength and med <= max_med_px:
                L['traces'][v] = [list(map(float, p)) for p in q[::4]]
                L.setdefault('auto', []).append(v)
                added.append((v, round(float(s.mean()), 2), round(med, 2)))
        LS.build(name, log=lambda *a: None)
        # Drop automatically added views that disagree, then re-solve.
        for _ in range(40):
            X, stats, _ = LS.result[name]
            bad = [k for k, v in stats.items() if k in L.get('auto', []) and v[0] > max_rms]
            if not bad:
                break
            worst = max(bad, key=lambda k: stats[k][0])
            del L['traces'][worst]
            L['auto'].remove(worst)
            L.setdefault('rejected', []).append(worst)
            LS.build(name, log=lambda *a: None)
        X, stats, _ = LS.result[name]
        log(f"{name}: round {rnd}: {len(stats)} views, rms median {np.median([v[0] for v in stats.values()]):.2f} "
            f"max {max(v[0] for v in stats.values()):.2f} px; rejected {L.get('rejected', [])}")
        if not added:
            break


def seed_from_surface(LS: 'LineSet', name, view, mesh, log=print):
    """Initial 3-D curve from ONE view's trace: snap it, cast its rays onto
    a proxy surface (any closed mesh near the car) and take the hits."""
    import trimesh
    L = LS.lines[name]
    hint = np.array(L['traces'][view])
    mode = 'ridge' if 'ridge' in L['mode'] else 'edge'
    q, s = snap(LS.img(view), hint, band=6.0, mode=mode, closed=L['closed'])
    q = q[s > 0.12]
    cam = LS.cams[view]
    o, d = cam.ray(q)
    side_seen = 'L' if cam.centre[1] < 0 else 'R'
    locs, idx_ray, _ = mesh.ray.intersects_location(np.repeat(o[None], len(d), 0), d, multiple_hits=False)
    X = np.full((len(q), 3), np.nan)
    X[idx_ray] = locs
    ok = np.all(np.isfinite(X), axis=1)
    X = X[ok]
    if L['side'] in ('L', 'R') and side_seen != L['side']:
        X = X @ MIRROR
    LS.result[name] = (X, {}, {view: q})
    log(f"{name}: seeded from {view} on the proxy surface ({ok.sum()}/{len(q)} rays hit)")
    return X


def propagate_from_seed(LS, name, candidates, log=print):
    """Coarse-to-fine propagation from a surface seed."""
    L = LS.lines[name]
    X = LS.result[name][0]
    # make it a proper result so build/refine can start from it
    from curves import refine as _refine
    for band, med, rms in ((14.0, 9.0, 8.0), (8.0, 5.0, 4.0), (5.0, 3.0, 2.5)):
        if L.get('auto'):
            for v in list(L['auto']):
                del L['traces'][v]
            L['auto'] = []
        L['rejected'] = []
        LS.result[name] = (X, LS.result[name][1], LS.result[name][2])
        propagate(LS, name, candidates, band=band, max_med_px=med, max_rms=rms, rounds=1, log=log)
        X = LS.result[name][0]
    return X
