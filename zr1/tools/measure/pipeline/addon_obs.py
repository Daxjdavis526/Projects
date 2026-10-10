"""Observed masks for an add-on part in each view.

label 1: opaque, dark (carbon) pixel not covered by the body skin;
label 0: background, or white paint;
label 2: don't care (dark pixel the body skin also covers: could be the
part in front of glass/carbon of the body, or the body itself).
Restricted to the projection of a 3-D box around the part."""
import sys, pickle, numpy as np, cv2
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import paint
from spin import frame_camera
J = pickle.load(open('joint_all1.pkl', 'rb'))

def cam_of(v):
    return frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]

def box_mask(cam, lo, hi, mirror=True):
    m = np.zeros((cam.h, cam.w), np.uint8)
    for s in ([1, -1] if mirror else [1]):
        c = np.array([[x, y * s, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])], float)
        uv = cam.project(c)
        hull = cv2.convexHull(np.round(uv).astype(np.int32))
        cv2.fillConvexPoly(m, hull, 1)
    return m > 0

def observe(views, V, F, lo, hi, dark=95, white=True, mode='dark'):
    out = {}
    for v in views:
        cam = cam_of(v)
        w, _ = paint.pair(v)
        a = w[:, :, 3]
        lum = w[:, :, :3].astype(float).mean(2)
        sk = np.zeros((cam.h, cam.w), np.uint8)
        cv2.fillPoly(sk, list(np.round(cam.project(V)[F] * 4).astype(np.int32)), 1, shift=2)
        sk = cv2.dilate(cv2.morphologyEx(sk, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)), np.ones((3, 3), np.uint8)) > 0
        bm = box_mask(cam, lo, hi)
        lab = np.full((cam.h, cam.w), 2, np.uint8)
        # the car is fully opaque; the ground shadow is black at alpha < 255
        lab[a < 254] = 0
        if white:
            lab[(a >= 254) & (lum > 170)] = 0
        if mode == 'any':
            lab[(a >= 254) & ~sk] = 1
        else:
            lab[(a >= 254) & (lum < dark) & ~sk] = 1
        lab[~bm] = 3            # outside the region: ignored
        out[v] = (cam, lab)
    return out
