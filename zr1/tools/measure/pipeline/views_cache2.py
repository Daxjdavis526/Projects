# Build and cache the fitting views (masks, exclusion zones, outlines).
import sys, numpy as np, cv2, json, pickle, time
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from spin import frame_camera
from hull import alpha_masks
from fit import ViewData
import paint
S = __import__('os').environ.get('ZR1_SCRATCH', '..')
J = pickle.load(open(S + '/work/joint_all1.pkl', 'rb'))
occ = np.load(S + '/work/hull_all_occ.npy'); meta = json.load(open(S + '/work/hull_all.json'))
lo, vox = np.array(meta['lo']), meta['vox']
TF, TR, WB = 1685.0, 1678.0, 2723.0
ii = np.argwhere(occ); P = lo + ii * vox
def box(P, x, y, z):
    yy = np.abs(P[:, 1])
    return (P[:, 0] >= x[0]) & (P[:, 0] <= x[1]) & (yy >= y[0]) & (yy <= y[1]) & (P[:, 2] >= z[0]) & (P[:, 2] <= z[1])
ex = (box(P, (2950, 3950), (0, 2000), (1040, 1500)) | box(P, (3420, 3700), (280, 480), (880, 1110)) |
      box(P, (-1400, -700), (0, 2000), (-50, 190)) | box(P, (-820, -180), (840, 1200), (170, 430)))
MIR = P[box(P, (540, 960), (930, 1200), (790, 1090))]
EX = [P[ex]]
for x, T, R, W, h in [(0.0, TF, 338.0, 275.0, J.sc['hf']), (WB, TR, 352.0, 345.0, J.sc['hr'])]:
    a = np.linspace(0, 2 * np.pi, 180, endpoint=False)
    for s in (-1, 1):
        for yy in np.linspace(T / 2 - W / 2 - 25, T / 2 + W / 2 + 40, 12):
            for r in np.linspace(0, R + 22, 10):
                EX.append(np.stack([x + r * np.cos(a), np.full_like(a, s * yy), h + r * np.sin(a)], 1))
EX = np.concatenate(EX)
np.save(S + '/work/exclusion_pts.npy', EX)
def excl_mask(cam, PTS=None):
    PTS = EX if PTS is None else PTS
    uv, z = cam.project(PTS), cam.to_cam(PTS)[:, 2]
    m = np.zeros((cam.h, cam.w), np.uint8)
    rad = np.clip(vox * cam.f / z * 0.9, 1, 30).astype(int)
    for (u, v), r in zip(np.round(uv).astype(int), rad):
        if 0 <= u < cam.w and 0 <= v < cam.h: cv2.circle(m, (u, v), int(r), 1, -1)
    return cv2.dilate(m, np.ones((5, 5), np.uint8))
views = []
for k in range(1, 31):
    im = cv2.imread(S + f'/refs/chevrolet-360-colorizer/my26-3lz-g8g/my26-corvette-3lz-g8g-ext.{k:03d}.png', cv2.IMREAD_UNCHANGED)
    car, unk = alpha_masks(im); cam = frame_camera(J.rig, k, 1500, 750)
    _, pm, _ = paint.shading(k)
    pm = cv2.erode(pm.astype(np.uint8), np.ones((3, 3), np.uint8))
    views.append(ViewData(k, cam, car, unk, (excl_mask(cam) & (1 - pm)) | excl_mask(cam, MIR)))
for v in ['deg01', 'deg02', 'deg03', 'deg04', 'deg05', 'deg07', 'deg42', 'deg43']:
    im = cv2.imread(S + f'/refs/configurator/2025_3LZ_G8G_ZTK_SOG_J6B_3A9/ext_{v}_transparent.png', cv2.IMREAD_UNCHANGED)
    car, unk = alpha_masks(im); cam = J.free_cams[v]
    _, pm, _ = paint.shading(v)
    pm = cv2.erode(pm.astype(np.uint8), np.ones((3, 3), np.uint8))
    views.append(ViewData(v, cam, car, unk, (excl_mask(cam) & (1 - pm)) | excl_mask(cam, MIR)))
pickle.dump(views, open(S + '/work/fit_views2.pkl', 'wb'))
print('cached', len(views), 'views')
