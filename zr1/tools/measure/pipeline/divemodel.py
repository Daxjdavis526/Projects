from frontmodel import *
VIEWS = ['deg01', 'deg02', 'deg42', 'deg43', 29, 28, 27, 1, 2, 3, 4, 5, 6, 7, 26]
BOX = ((-900, 760, 150), (-250, 1080, 520))
def meshes(p):
    out = []
    for s in (1, -1):
        ya, yb = sorted([s * p['dy0'], s * p['dy1']])
        out.append(prism_mesh(dive_outline(p), ya, yb))
    V, F, o = [], [], 0
    for v, f in out:
        V.append(v); F.append(f + o); o += len(v)
    return np.concatenate(V), np.concatenate(F)
P0 = dict(dx1=-620.0, dz1=300.0, dx2=-420.0, dz2=420.0, dt=10.0, dy0=900.0, dy1=1000.0)
