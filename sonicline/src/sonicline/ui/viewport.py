"""The 3D viewport: renders plain-data scenes (sonicline.post.scene) with
pyvista. Without a usable OpenGL context, or with SONICLINE_NO_3D=1 (the
offscreen test mode), it is a labelled placeholder that keeps the same
interface, so the rest of the UI never depends on VTK being able to draw.
"""

from __future__ import annotations

import os

from PySide6 import QtCore, QtWidgets

from ..post.scene import Surface

# Colours by surface role.
ROLE_COLOURS = {"wall": "#b8bec6", "inlet": "#4c8bf5", "exit": "#f5a04c", "wedge": "#d9dde2",
                "empty": "#d9dde2", "patch": "#9fd3a0", "symmetryPlane": "#e0c0e0"}


class Viewport(QtWidgets.QWidget):
    picked = QtCore.Signal(float, float, float)  # a point picked on a surface

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        self.plotter = None
        self.caption = QtWidgets.QLabel("")
        self.caption.setStyleSheet("color: #555; padding: 2px 6px;")
        if os.environ.get("SONICLINE_NO_3D") != "1":
            try:
                from pyvistaqt import QtInteractor

                self.plotter = QtInteractor(self)
                self.plotter.set_background("white")
                layout.addWidget(self.plotter.interactor, 1)
            except Exception as e:  # no OpenGL: keep the UI usable
                self.plotter = None
                self._placeholder(layout, f"3D view unavailable ({type(e).__name__})")
        else:
            self._placeholder(layout, "3D view disabled")
        layout.addWidget(self.caption)
        self.surfaces: list[Surface] = []

    def _placeholder(self, layout, text):
        label = QtWidgets.QLabel(text)
        label.setAlignment(QtCore.Qt.AlignCenter)
        label.setStyleSheet("background: #f4f5f7; color: #777;")
        layout.addWidget(label, 1)

    @property
    def active(self) -> bool:
        return self.plotter is not None

    def show_surfaces(self, surfaces: list[Surface], caption: str = "", edges: bool = False,
                      view: str = "iso") -> None:
        self.surfaces = surfaces
        self.caption.setText(caption)
        if not self.active:
            return
        import numpy as np
        import pyvista as pv

        p = self.plotter
        p.clear()
        for s in surfaces:
            faces = np.hstack([[len(poly), *poly] for poly in s.polygons]).astype(np.int64)
            mesh = pv.PolyData(np.asarray(s.points, dtype=float), faces)
            opacity = 0.35 if s.role == "wall" and not edges else 1.0
            p.add_mesh(mesh, color=ROLE_COLOURS.get(s.role, "#cccccc"), show_edges=edges,
                       edge_color="#555566", line_width=0.5, opacity=opacity, name=s.name,
                       pickable=True)
        p.add_axes()
        if view == "side":
            p.view_xy()
        else:
            p.view_isometric()
        p.reset_camera()

    def enable_picking(self) -> None:
        if self.active:
            self.plotter.enable_point_picking(
                callback=lambda point: self.picked.emit(*map(float, point)),
                show_message=False, left_clicking=True, use_picker=True)

    def screenshot(self, path: str) -> bool:
        if not self.active:
            return False
        self.plotter.screenshot(path)
        return True

    def close_plotter(self) -> None:
        if self.active:
            self.plotter.close()
