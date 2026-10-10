"""Pinhole cameras for the reference images, and the geometry used to solve them.

World frame (the model's frame, full-scale millimetres): origin on the ground
under the centre of the front axle; x rearward along the car, y toward the
car's right, z up. Right-handed.

Camera frame (OpenCV's): x right, y down, z forward along the view. A world
point X maps to the image by  Xc = R X + t,  u = f Xc/Zc + cx,  v = f Yc/Zc + cy.
Lens distortion is not modelled: configurator renders and drawings have none,
and photographs are only used where their distortion is below a pixel over
the car (checked per image by the residuals).
"""

from __future__ import annotations

import dataclasses
import numpy as np
import cv2


@dataclasses.dataclass
class Camera:
    f: float            # focal length, pixels
    cx: float           # principal point, pixels
    cy: float
    rvec: np.ndarray    # Rodrigues rotation, world -> camera
    tvec: np.ndarray    # translation, camera frame, mm
    w: int = 0          # image size, pixels
    h: int = 0

    @property
    def R(self) -> np.ndarray:
        return cv2.Rodrigues(np.asarray(self.rvec, float))[0]

    @property
    def K(self) -> np.ndarray:
        return np.array([[self.f, 0, self.cx], [0, self.f, self.cy], [0, 0, 1.0]])

    @property
    def centre(self) -> np.ndarray:
        """Camera centre in world coordinates."""
        return -self.R.T @ np.asarray(self.tvec, float)

    def to_cam(self, X: np.ndarray) -> np.ndarray:
        return (self.R @ np.asarray(X, float).reshape(-1, 3).T).T + np.asarray(self.tvec, float)

    def project(self, X: np.ndarray) -> np.ndarray:
        Xc = self.to_cam(X)
        return np.stack([self.f * Xc[:, 0] / Xc[:, 2] + self.cx,
                         self.f * Xc[:, 1] / Xc[:, 2] + self.cy], axis=1)

    def ray(self, uv: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Unit world-space ray directions through pixels `uv` (N,2), and the origin."""
        uv = np.asarray(uv, float).reshape(-1, 2)
        d = np.stack([(uv[:, 0] - self.cx) / self.f, (uv[:, 1] - self.cy) / self.f,
                      np.ones(len(uv))], axis=1)
        d = (self.R.T @ d.T).T
        return self.centre, d / np.linalg.norm(d, axis=1, keepdims=True)

    def as_dict(self) -> dict:
        return {"f": self.f, "cx": self.cx, "cy": self.cy, "rvec": list(map(float, self.rvec)),
                "tvec": list(map(float, self.tvec)), "w": self.w, "h": self.h}

    @staticmethod
    def from_dict(d: dict) -> "Camera":
        return Camera(d["f"], d["cx"], d["cy"], np.array(d["rvec"], float),
                      np.array(d["tvec"], float), d.get("w", 0), d.get("h", 0))

    @staticmethod
    def look_at(eye, target, f, w, h, up=(0, 0, 1)) -> "Camera":
        """A camera at `eye` looking at `target` with world `up` pointing up in the image."""
        eye, target, up = (np.asarray(a, float) for a in (eye, target, up))
        z = target - eye
        z /= np.linalg.norm(z)
        x = np.cross(z, up)
        x /= np.linalg.norm(x)
        y = np.cross(z, x)
        R = np.stack([x, y, z])
        return Camera(f, w / 2, h / 2, cv2.Rodrigues(R)[0].ravel(), -R @ eye, w, h)


def circle_points(centre, normal, radius, n=64, a0=0.0, a1=2 * np.pi) -> np.ndarray:
    """Points on a 3-D circle (or arc from a0 to a1, radians about `normal`)."""
    c, nrm = np.asarray(centre, float), np.asarray(normal, float)
    nrm = nrm / np.linalg.norm(nrm)
    ref = np.array([0, 0, 1.0]) if abs(nrm[2]) < 0.9 else np.array([1.0, 0, 0])
    e1 = np.cross(nrm, ref)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(nrm, e1)
    a = np.linspace(a0, a1, n, endpoint=(a1 - a0) < 2 * np.pi - 1e-9)
    return c + radius * (np.cos(a)[:, None] * e1 + np.sin(a)[:, None] * e2)


def circle_conic(cam: Camera, centre, normal, radius) -> np.ndarray:
    """The image conic C (3x3, x^T C x = 0) of a 3-D circle seen by `cam`."""
    c, nrm = np.asarray(centre, float), np.asarray(normal, float)
    nrm = nrm / np.linalg.norm(nrm)
    ref = np.array([0, 0, 1.0]) if abs(nrm[2]) < 0.9 else np.array([1.0, 0, 0])
    e1 = np.cross(nrm, ref)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(nrm, e1)
    # Plane coordinates (a, b, 1) -> image homogeneous: H = K [R e1, R e2, R c + t].
    R, t = cam.R, np.asarray(cam.tvec, float)
    H = cam.K @ np.stack([R @ e1, R @ e2, R @ c + t], axis=1)
    C0 = np.diag([1.0, 1.0, -radius ** 2])
    Hi = np.linalg.inv(H)
    C = Hi.T @ C0 @ Hi
    return C / np.linalg.norm(C)


def sampson(C: np.ndarray, uv: np.ndarray) -> np.ndarray:
    """First-order (Sampson) distance, pixels, of image points to conic C."""
    x = np.concatenate([np.asarray(uv, float).reshape(-1, 2), np.ones((len(uv), 1))], axis=1)
    Cx = x @ C.T
    alg = np.sum(x * Cx, axis=1)
    g = 2 * Cx[:, :2]
    return alg / np.maximum(np.linalg.norm(g, axis=1), 1e-12)


def triangulate(cams: list[Camera], uvs: list[np.ndarray]) -> np.ndarray:
    """Linear least-squares triangulation of one point seen in several cameras."""
    A = []
    for cam, uv in zip(cams, uvs):
        P = cam.K @ np.concatenate([cam.R, np.asarray(cam.tvec, float).reshape(3, 1)], axis=1)
        u, v = np.asarray(uv, float).ravel()
        A.append(u * P[2] - P[0])
        A.append(v * P[2] - P[1])
    _, _, Vt = np.linalg.svd(np.array(A))
    X = Vt[-1]
    return X[:3] / X[3]
