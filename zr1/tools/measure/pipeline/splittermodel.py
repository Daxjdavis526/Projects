from frontmodel import *
VIEWS = ['deg01', 'deg02', 'deg42', 'deg43', 29, 28, 27, 1, 2, 3, 26, 25]
BOX = ((-1250, -1000, 40), (-650, 1000, 240))
FR = [0.0, 0.2, 0.4, 0.6, 0.8, 0.93, 1.0]
def outline(p, n=60):
    W = p['W']
    s = np.linspace(-1, 1, n)
    xk = [p['f%d' % i] for i in range(len(FR))]
    xf = np.interp(np.abs(s), FR, xk)
    front = np.stack([xf, s * W], 1)
    return np.concatenate([front, [[p['xr'], W], [p['xr'], -W]]])
def meshes(p):
    return prism_z(outline(p), p['z0'], p['z0'] + p['t'])
_x = lambda s: -818.2 + 121.0 * s ** 2 + 106.8 * s ** 8
P0 = dict(W=943.6, xr=-650.0, z0=89.5, t=31.1, **{'f%d' % i: float(_x(f)) for i, f in enumerate(FR)})
P0['f0'] -= 60.0
