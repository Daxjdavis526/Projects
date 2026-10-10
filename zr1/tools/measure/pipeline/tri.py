import numpy as np
from addon_obs import cam_of
def tri(obs):
    """obs: {view: (u, v)} -> least-squares 3-D point and per-view reprojection error (px)."""
    A = np.zeros((3, 3)); b = np.zeros(3); rays = []
    for v, uv in obs.items():
        cam = cam_of(v)
        o, d = cam.ray(np.array([uv], float))
        o, d = np.asarray(o, float).ravel(), np.asarray(d, float).ravel(); d /= np.linalg.norm(d)
        P = np.eye(3) - np.outer(d, d); A += P; b += P @ o
    X = np.linalg.solve(A, b)
    err = {v: round(float(np.linalg.norm(cam_of(v).project(X[None])[0] - np.array(uv))), 1) for v, uv in obs.items()}
    return X, err
