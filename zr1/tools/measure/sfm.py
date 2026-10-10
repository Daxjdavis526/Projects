"""Feature tracks across calibrated frames, triangulated into 3-D points.

SIFT features inside each frame's car mask are matched between frames a
step or two apart, kept only when they satisfy the epipolar constraint of
the current cameras, chained into tracks, and triangulated. Specular
highlights on the paint move with the view; they fail the epipolar test or
the reprojection test and are dropped, and the robust loss of the bundle
solve discounts the few that slip through.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera, triangulate
from curves import fundamental


def features(img: np.ndarray, mask: np.ndarray, n: int = 4000):
    g = img[:, :, :3] if img.ndim == 3 else img
    if g.ndim == 3 and img.shape[2] == 4:
        a = img[:, :, 3:4].astype(np.float32) / 255
        g = (img[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    g = cv2.cvtColor(g, cv2.COLOR_BGR2GRAY)
    m = cv2.erode(mask.astype(np.uint8), np.ones((5, 5), np.uint8))
    sift = cv2.SIFT_create(nfeatures=n, contrastThreshold=0.02)
    kp, des = sift.detectAndCompute(g, m)
    return np.array([k.pt for k in kp], float).reshape(-1, 2), des


def match(f1, f2, c1: Camera, c2: Camera, ratio=0.78, epi=2.5):
    (p1, d1), (p2, d2) = f1, f2
    if d1 is None or d2 is None or len(p1) < 2 or len(p2) < 2:
        return []
    bf = cv2.BFMatcher(cv2.NORM_L2)
    out = []
    F = fundamental(c1, c2)
    for m in bf.knnMatch(d1, d2, k=2):
        if len(m) < 2 or m[0].distance > ratio * m[1].distance:
            continue
        i, j = m[0].queryIdx, m[0].trainIdx
        x1 = np.array([*p1[i], 1.0])
        x2 = np.array([*p2[j], 1.0])
        l2 = F @ x1
        d = abs(x2 @ l2) / np.hypot(l2[0], l2[1])
        if d < epi:
            out.append((i, j))
    return out


def tracks(feats: dict, cams: dict, steps=(1, 2), cyclic_n: int | None = None):
    """Union-find tracks over pairwise matches between frames `steps` apart."""
    parent = {}

    def find(a):
        while parent.setdefault(a, a) != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    keys = sorted(feats)
    for a in keys:
        for s in steps:
            b = a + s
            if cyclic_n and b > cyclic_n:
                b -= cyclic_n
            if b not in feats:
                continue
            for i, j in match(feats[a], feats[b], cams[a], cams[b]):
                ra, rb = find((a, i)), find((b, j))
                if ra != rb:
                    parent[ra] = rb
    groups = {}
    for node in list(parent):
        groups.setdefault(find(node), []).append(node)
    out = []
    for g in groups.values():
        frames = [k for k, _ in g]
        if len(set(frames)) != len(frames) or len(g) < 3:
            continue   # a track may visit each frame once, and needs 3 views
        out.append(sorted(g))
    return out


def triangulate_tracks(trs, feats, cams, max_err=2.0, min_angle_deg=4.0):
    pts, keep = [], []
    for tr in trs:
        cs = [cams[k] for k, _ in tr]
        uvs = [feats[k][0][i] for k, i in tr]
        X = triangulate(cs, uvs)
        if not np.all(np.isfinite(X)):
            continue
        errs = [np.linalg.norm(c.project(X)[0] - uv) for c, uv in zip(cs, uvs)]
        rays = [c.centre - X for c in cs]
        rays = [r / np.linalg.norm(r) for r in rays]
        ang = max(np.degrees(np.arccos(np.clip(rays[0] @ r, -1, 1))) for r in rays[1:])
        front = all(c.to_cam(X)[0, 2] > 0 for c in cs)
        if front and max(errs) < max_err and ang >= min_angle_deg:
            pts.append(X)
            keep.append(tr)
    return np.array(pts).reshape(-1, 3), keep
