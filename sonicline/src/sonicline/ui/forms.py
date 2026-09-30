"""Form widgets bound to a Draft by dotted path. Values are shown in
engineering units (mm, bar, degrees) and stored in SI; an entry that does
not parse turns red and leaves the draft unchanged."""

from __future__ import annotations

import math
from typing import Callable

from PySide6 import QtCore, QtWidgets

from ..project.draft import Draft

# unit label -> (to SI, from SI)
UNITS: dict[str, tuple[Callable[[float], float], Callable[[float], float]]] = {
    "mm": (lambda v: v * 1e-3, lambda v: v * 1e3),
    "bar": (lambda v: v * 1e5, lambda v: v * 1e-5),
    "K": (lambda v: v, lambda v: v),
    "g/s": (lambda v: v * 1e-3, lambda v: v * 1e3),
    "deg": (math.radians, math.degrees),
    "": (lambda v: v, lambda v: v),
}


class QuantityEdit(QtWidgets.QLineEdit):
    """A number bound to ``draft`` at ``path``; ``scale`` maps the shown
    number to the stored one beyond the unit (e.g. diameter -> radius)."""

    edited = QtCore.Signal()

    def __init__(self, draft_getter: Callable[[], Draft], path: str, unit: str = "",
                 tooltip: str = "", scale: float = 1.0, minimum: float | None = None,
                 default: float | None = None, parent=None):
        super().__init__(parent)
        self._draft = draft_getter
        self.path, self.unit, self.scale, self.minimum, self.default = path, unit, scale, minimum, default
        self.setToolTip(tooltip)
        self.setMaximumWidth(120)
        self.editingFinished.connect(self._commit)

    def refresh(self) -> None:
        v = self._draft().get(self.path, self.default)
        if isinstance(v, (int, float)):
            shown = UNITS[self.unit][1](v) / self.scale
            self.setText(f"{shown:.6g}")
        elif v is None:
            self.setText("")
        else:
            self.setText(str(v))  # a quantity string such as "20 bar"
        self._mark(True)

    def value(self) -> float | None:
        try:
            v = float(self.text().replace(",", "."))
        except ValueError:
            return None
        if not math.isfinite(v) or (self.minimum is not None and v < self.minimum):
            return None
        return v

    def _commit(self) -> None:
        v = self.value()
        if v is None:
            self._mark(False)
            return
        self._mark(True)
        self._draft().set(self.path, UNITS[self.unit][0](v * self.scale))
        self.edited.emit()

    def _mark(self, ok: bool) -> None:
        self.setStyleSheet("" if ok else "background: #ffe3e3;")


class ChoiceBox(QtWidgets.QComboBox):
    """A choice among (label, value) pairs bound to a path."""

    edited = QtCore.Signal()

    def __init__(self, draft_getter: Callable[[], Draft], path: str,
                 choices: list[tuple[str, object]], tooltip: str = "", default=None, parent=None):
        super().__init__(parent)
        self._draft = draft_getter
        self.path, self.choices, self.default = path, choices, default
        for label, _ in choices:
            self.addItem(label)
        self.setToolTip(tooltip)
        self.currentIndexChanged.connect(self._commit)
        self._loading = False

    def refresh(self) -> None:
        v = self._draft().get(self.path, self.default)
        values = [c[1] for c in self.choices]
        self._loading = True
        self.setCurrentIndex(values.index(v) if v in values else 0)
        self._loading = False

    def value(self):
        return self.choices[self.currentIndex()][1]

    def _commit(self, *_):
        if self._loading:
            return
        self._draft().set(self.path, self.value())
        self.edited.emit()


def row(form: QtWidgets.QFormLayout, label: str, widget: QtWidgets.QWidget, unit: str = "") -> None:
    if unit:
        box = QtWidgets.QWidget()
        h = QtWidgets.QHBoxLayout(box)
        h.setContentsMargins(0, 0, 0, 0)
        h.addWidget(widget)
        h.addWidget(QtWidgets.QLabel(unit))
        h.addStretch(1)
        form.addRow(label, box)
    else:
        form.addRow(label, widget)


class Worker(QtCore.QObject):
    """Runs a function on the thread pool and reports back on the GUI
    thread. Kept alive by ``Worker.active`` until it reports."""

    done = QtCore.Signal(object)
    failed = QtCore.Signal(str)
    active: set = set()

    def __init__(self, fn: Callable[[], object]):
        super().__init__()
        self.fn = fn
        # Released on the GUI thread, once its result has been delivered.
        self.done.connect(self._release)
        self.failed.connect(self._release)

    def _release(self, *_):
        Worker.active.discard(self)

    def start(self, synchronous: bool = False) -> "Worker":
        Worker.active.add(self)
        if synchronous:
            self._run()
        else:
            QtCore.QThreadPool.globalInstance().start(self._run)
        return self

    def _run(self):
        try:
            result = self.fn()
        except Exception as e:  # reported to the user, not raised on a pool thread
            self.failed.emit(f"{type(e).__name__}: {e}")
        else:
            self.done.emit(result)
