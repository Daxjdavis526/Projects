"""Collect fitted add-on parts into Projects/zr1/data/addons.json."""
import json, sys, os, numpy as np
import wingmodel as W
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '../../../data/') + 'addons.json'
doc = json.load(open(OUT)) if os.path.exists(OUT) else {'note': '', 'parts': []}
doc['note'] = ('Add-on parts fitted to the calibrated reference views (tools/measure, outline overlays): '
               'lofts are closed rings of points (mm), prisms are outlines extruded along an axis; mirror = also on the left.')
def put(part):
    doc['parts'] = [p for p in doc['parts'] if p['name'] != part['name']] + [part]
def wing(p):
    q = dict(p)
    Y = p['Y']
    rings = []
    sec = W.airfoil(tc=p['tc'], camber=p['camber'])
    Yx = p['ep_y'] + p['ep_t'] / 2
    for y in np.linspace(-Yx, Yx, 61):
        s = (y / Y) ** 2
        c = p['c0'] + p['kc'] * s
        a = np.radians(p['a0'] + p['ka'] * s)
        x = sec[:, 0] * c; z = sec[:, 1] * c
        xr = x * np.cos(a) - z * np.sin(a); zr = x * np.sin(a) + z * np.cos(a)
        rings.append(np.round(np.stack([p['x0'] + p['kx'] * s + xr, np.full(len(xr), y), p['z0'] + p['kz'] * s + zr], 1), 2).tolist())
    return dict(name='Wing', material='Visible carbon fiber (ZTK wing, endplates and uprights)', finish='carbon', voxel_mm=2.0,
                outside_body=True,
                lofts=[dict(rings=rings)],
                prisms=[dict(axis='y', outline=np.round(p['ep_poly'], 1).tolist(), lo=p['ep_y'], hi=p['ep_y'] + p['ep_t'], mirror=True),
                        dict(axis='y', outline=np.round(p['up_poly'], 1).tolist(), lo=p['up_y'] - p['up_t'] / 2, hi=p['up_y'] + p['up_t'] / 2, mirror=True)])
def splitter(p):
    import splittermodel as S
    q = dict(S.P0); q.update(p)
    return dict(name='Front splitter', material='Visible carbon fiber (ZTK front splitter)', finish='carbon', voxel_mm=1.5,
                outside_body=True,
                prisms=[dict(axis='z', outline=np.round(S.outline(q), 1).tolist(), lo=q['z0'], hi=q['z0'] + q['t'])])
def dive(p):
    import divemodel as D
    q = dict(D.P0); q.update(p)
    return dict(name='Dive planes', material='Visible carbon fiber (ZTK dive planes)', finish='carbon', voxel_mm=1.2,
                outside_body=True,
                prisms=[dict(axis='y', outline=np.round(D.dive_outline(q), 1).tolist(), lo=q['dy0'], hi=q['dy1'], mirror=True)])
def mirrors(p):
    import mirrormodel as Mm
    q = dict(Mm.P0); q.update(p)
    c, h, r, R = Mm.housing(q)
    # the right-hand side (y > 0) element; the crate mirrors it
    M = np.diag([1, -1, 1.0])
    housing = dict(name='Mirrors', material='Arctic White (G8G) mirror housings', finish='white', voxel_mm=1.5, outside_body=True,
                   boxes=[dict(centre=(M @ c).round(2).tolist(), half=np.round(h, 2).tolist(), radius=round(r, 2),
                               axes=(M @ R @ M).round(5).tolist(), mirror=True)])
    stalk = dict(name='Mirror stalks', material='Gloss black', finish='gloss_black', voxel_mm=1.2, outside_body=True,
                 capsules=[dict(a=(M @ [q['ax'], q['ay'], q['az']]).round(2).tolist(), b=(M @ [q['bx'], q['by'], q['bz']]).round(2).tolist(),
                                radius=round(abs(q['sr']), 2), mirror=True)])
    return housing, stalk
def mirrors_hull():
    import trimesh
    m = trimesh.load('mirror_housing.ply', process=False)
    V = np.asarray(m.vertices) * [1, -1, 1.0]           # the right-hand copy (y > 0)
    F = np.asarray(m.faces)[:, ::-1]                     # reflection flips the winding
    housing = dict(name='Mirrors', material='Arctic White (G8G) mirror housings', finish='white', voxel_mm=1.5,
                   meshes=[dict(vertices=np.round(V, 2).tolist(), triangles=F.tolist(), mirror=True)])
    stalk = dict(name='Mirror stalks', material='Gloss black', finish='gloss_black', voxel_mm=1.2, outside_body=True,
                 capsules=[dict(a=[745.0, 903.0, 872.0], b=[800.0, 900.0, 832.0], radius=15.0, mirror=True)])
    return housing, stalk
def dive_tri():
    # triangulated (tri.py, four views): rear-upper tip (-403, 1010, 296),
    # reprojection <= 4.4 px; front-lower end where it meets the splitter
    # (-613, 955, 196). The blade's outer edge runs between them; it is 8 mm
    # thick and reaches 90 mm inboard (clipped to the outside of the body).
    A, B = np.array([-613.0, 955.0, 196.0]), np.array([-403.0, 1010.0, 296.0])
    rings = []
    for P in (A, B):
        y_out, z = P[1], P[2]
        rings.append([[P[0], y_out - 90.0, z - 4.0], [P[0], y_out, z - 4.0], [P[0], y_out, z + 4.0], [P[0], y_out - 90.0, z + 4.0]])
    return dict(name='Dive planes', material='Visible carbon fiber (ZTK dive planes)', finish='carbon', voxel_mm=1.2,
                outside_body=True, lofts=[dict(rings=rings, mirror=True)])
def skirts():
    # triangulated (frame 7 and deg02, <= 3.4 px): blade from x 380 to 2310,
    # lower edge z 140, upper 172; outer face y 976 at the front, 928 at the
    # rear; 80 mm deep into the body (clipped to its outside)
    rings = []
    for x in np.linspace(380.0, 2310.0, 6):
        t = (x - 380.0) / 1930.0
        yo = 976.0 + t * (928.0 - 976.0)
        rings.append([[x, yo - 80.0, 140.0], [x, yo, 140.0], [x, yo, 172.0], [x, yo - 80.0, 172.0]])
    return dict(name='Side skirts', material='Visible carbon fiber (rocker blades)', finish='carbon', voxel_mm=1.5,
                outside_body=True, lofts=[dict(rings=rings, mirror=True)])
def exhaust():
    # triangulated tip centres (frame 14 and deg03, < 1 px): y +-59.1 / +-178.7,
    # z 326, faces at x 3584 (inner) / 3572 (outer); outer radius 52 mm
    tips = []
    for y, xf in [(59.1, 3584.0), (178.7, 3572.0)]:
        tips.append(dict(centre=[xf - 150.0, y, 326.0], axis='x', length=150.0, r_in=45.0, r_out=52.0, mirror=True))
    tip = dict(name='Exhaust tips', material='Polished stainless (quad centre exit)', finish='exhaust', voxel_mm=1.0, tubes=tips)
    hexo = [[0.0, 255.0], [270.0, 255.0], [305.0, 300.0], [275.0, 398.0], [0.0, 398.0]]
    full = hexo + [[-p[0], p[1]] for p in hexo[::-1][1:-1]]
    housing = dict(name='Exhaust housing', material='Satin black', finish='satin_black', voxel_mm=2.0, outside_body=True,
                   prisms=[dict(axis='x', outline=full, lo=3450.0, hi=3562.0)],
                   subtract_tubes=[dict(centre=[3400.0, y, 326.0], axis='x', length=400.0, r_in=0.0, r_out=52.5, mirror=True) for y in (59.1, 178.7)])
    return tip, housing
def gurney():
    # triangulated (front view 29 with deg43 / deg05, <= 4.4 px): centre top
    # (-553, 0, 729), ends (-379, +-471, 718); a 6 mm blade 40 mm tall
    rings = []
    for y in np.linspace(-471.0, 471.0, 25):
        s = (y / 471.0) ** 2
        xc = -553.0 + 174.0 * s
        zt = 729.0 - 11.0 * s
        rings.append([[xc - 3.0, y, zt - 40.0], [xc + 3.0, y, zt - 40.0], [xc + 3.0, y, zt], [xc - 3.0, y, zt]])
    return dict(name='Hood Gurney', material='Visible carbon fiber (ZTK hood Gurney)', finish='carbon', voxel_mm=1.0,
                cut_body=True, lofts=[dict(rings=rings)])
def splitter_skin():
    d = json.load(open('splitter_skin.json'))
    return dict(name='Front splitter', material='Visible carbon fiber (ZTK front splitter)', finish='carbon', voxel_mm=1.5,
                cut_body=True,
                prisms=[dict(axis='z', outline=d['outline'], lo=d['z0'], hi=d['z0'] + d['t']),
                        # the corner end plates rising from the tips (front view:
                        # outer edge at |y| 950, top z 330; side view: from the tip back ~90 mm)
                        dict(axis='y', outline=[[-895.0, 110.0], [-795.0, 110.0], [-800.0, 330.0], [-858.0, 336.0]],
                             lo=932.0, hi=952.0, mirror=True)])
if __name__ == '__main__':
    what = sys.argv[1]
    if what == 'wing':
        put(wing(json.load(open('wing_fit.json'))))
    if what == 'splitter':
        put(splitter(json.load(open('splitter_fit2.json'))))
    if what == 'splitter_skin':
        put(splitter_skin())
    if what == 'gurney':
        put(gurney())
    if what == 'skirts':
        put(skirts())
    if what == 'exhaust':
        for part in exhaust():
            put(part)
    if what == 'dive_tri':
        put(dive_tri())
    if what == 'dive':
        put(dive(json.load(open('dive_fit.json'))))
    if what == 'mirrors_hull':
        for part in mirrors_hull():
            put(part)
    if what == 'mirrors':
        for part in mirrors(json.load(open('mirror_fit.json'))):
            put(part)
    json.dump(doc, open(OUT, 'w'))
    print([p['name'] for p in doc['parts']])
