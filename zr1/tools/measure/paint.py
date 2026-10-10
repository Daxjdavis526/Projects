"""The painted skin, isolated by rendering the same car in two paints.

The configurator and the 360 colorizer render any paint with the same
cameras. Subtracting the Torch Red render from the Arctic White one leaves
zero wherever the surface is not paint (glass, carbon, black trim, lamps,
grilles, wheels) and, on the paint, the difference of the two diffuse
albedos times the light arriving there: the clear-coat reflections are the
same in both renders and cancel. So the difference image is a clean
diffuse-shading image of the painted body alone, and its zero level is the
exact outline of every painted panel.
"""

from __future__ import annotations

import numpy as np
import cv2

import os
REFS = os.environ.get('ZR1_REFS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'refs'))


def pair(view):
    """(white, red) RGBA renders of a calibrated view: an int is a spin frame,
    'degNN' a configurator angle."""
    if isinstance(view, (int, np.integer)):
        w = cv2.imread(f'{REFS}/chevrolet-360-colorizer/my27-3lz-g8g/my27-corvette-3lz-g8g-ext.{view:03d}.png', cv2.IMREAD_UNCHANGED)
        r = cv2.imread(f'{REFS}/paint/my27-gkz/ext.{view:03d}.png', cv2.IMREAD_UNCHANGED)
    else:
        w = cv2.imread(f'{REFS}/configurator/2025_3LZ_G8G_ZTK_SOG_J6B_3A9/ext_{view}_transparent.png', cv2.IMREAD_UNCHANGED)
        r = cv2.imread(f'{REFS}/paint/cfg2025-gkz/ext_{view}_transparent.png', cv2.IMREAD_UNCHANGED)
    return w, r


def shading(view):
    """Diffuse shading of the paint (float, green channel: white minus red),
    the paint mask, and the car mask (opaque pixels)."""
    w, r = pair(view)
    car = w[:, :, 3] >= 254
    d = w[:, :, 1].astype(np.float32) - r[:, :, 1].astype(np.float32)
    paint = (d > 15) & car
    paint = cv2.morphologyEx(paint.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    return np.where(paint, d, 0).astype(np.float32), paint, car


def boundary_edges(paint, car, margin=5):
    """Pixels on the paint mask's boundary, away from the car's outer outline."""
    p = paint.astype(np.uint8)
    e = (p - cv2.erode(p, np.ones((3, 3), np.uint8))) > 0
    e |= (cv2.dilate(p, np.ones((3, 3), np.uint8)) - p) > 0
    inner = cv2.erode(car.astype(np.uint8), np.ones((2 * margin + 1, 2 * margin + 1), np.uint8)) > 0
    return e & inner
