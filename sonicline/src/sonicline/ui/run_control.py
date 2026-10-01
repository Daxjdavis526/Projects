"""Runs a simulation as a separate process and follows it.

The run is ``sonicline run --events json`` in a QProcess: its JSON event
lines drive the stage display and the log, and a timer reads the solver's
function-object tables (mass flow, thrust, residuals) for the live plots --
the same files the pipeline's convergence monitor reads. Cancelling writes
the pipeline's cancel file, so the run stops its solver and records itself
as cancelled; killing the process is the fallback.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PySide6 import QtCore

from ..post import results
from ..project import Project, RunInfo, read_run
from ..run import convergence, pipeline


def live_series(run_dir: Path) -> dict[str, tuple[np.ndarray, np.ndarray]]:
    """Iteration series for the live plots, from the run's tables."""
    tables = results.read_tables(Path(run_dir) / "case")
    out: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    inlet, exit_ = tables.get("mdot_inlet"), tables.get("mdot_exit")
    if inlet is not None and len(inlet.time):
        out["inlet mass flow"] = (inlet.time, -inlet.values["sum(phi)"])
    if exit_ is not None and len(exit_.time):
        out["exit mass flow"] = (exit_.time, exit_.values["sum(phi)"])
    mom, pf = tables.get("momentum_exit"), tables.get("pforce_exit")
    if mom is not None and pf is not None and len(mom.time) and len(pf.time):
        t, thrust = convergence.exit_thrust_series(mom, pf)
        out["exit thrust"] = (t, thrust)
    res = tables.get("residuals")
    if res is not None and len(res.time):
        for col, v in res.values.items():
            if col.endswith("_initial") and np.ndim(v) == 1:
                out["residual " + col[: -len("_initial")]] = (res.time, v)
    return out


class RunController(QtCore.QObject):
    event = QtCore.Signal(str, str, dict)  # stage, message, data
    series = QtCore.Signal(dict)  # live_series
    finished = QtCore.Signal(object)  # RunInfo
    started = QtCore.Signal(str)  # run directory

    def __init__(self, parent=None, poll_ms: int = 1500):
        super().__init__(parent)
        self.process: QtCore.QProcess | None = None
        self.run_dir: Path | None = None
        self.simulation: str | None = None
        self._buffer = b""
        self._timer = QtCore.QTimer(self)
        self._timer.setInterval(poll_ms)
        self._timer.timeout.connect(self._poll)

    @property
    def running(self) -> bool:
        return self.process is not None and self.process.state() != QtCore.QProcess.NotRunning

    def start(self, project: Project, sim_id: str, processors: int = 1, images: bool = True) -> Path:
        if self.running:
            raise RuntimeError("a run is already in progress")
        self.run_dir = project.new_run(sim_id)
        self.simulation = sim_id
        self.start_command(project.run_command(sim_id, self.run_dir, processors, images), self.run_dir)
        return self.run_dir

    def start_command(self, cmd: list[str], run_dir: Path) -> None:
        """Start any command that speaks the JSON event protocol."""
        self.run_dir = Path(run_dir)
        self._buffer = b""
        proc = QtCore.QProcess(self)
        proc.setProcessChannelMode(QtCore.QProcess.SeparateChannels)
        proc.readyReadStandardOutput.connect(self._read)
        proc.readyReadStandardError.connect(self._read_err)
        proc.finished.connect(self._done)
        self.process = proc
        proc.start(cmd[0], cmd[1:])
        self._timer.start()
        self.started.emit(str(self.run_dir))

    def cancel(self) -> None:
        if self.running and self.run_dir is not None:
            pipeline.request_cancel(self.run_dir)
            self.event.emit("cancel", "cancel requested", {})
            # If the pipeline cannot respond (stuck before its solve loop),
            # stop the process after a grace period.
            QtCore.QTimer.singleShot(30000, self._kill_if_running)

    def _kill_if_running(self):
        if self.running:
            self.process.kill()

    def feed(self, chunk: bytes) -> None:
        """Parse JSON event lines (public for tests)."""
        self._buffer += chunk
        *lines, self._buffer = self._buffer.split(b"\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                self.event.emit(e.get("stage", "?"), e.get("message", ""), e.get("data") or {})
            except json.JSONDecodeError:
                self.event.emit("output", line.decode(errors="replace"), {})

    def _read(self):
        self.feed(bytes(self.process.readAllStandardOutput()))

    def _read_err(self):
        text = bytes(self.process.readAllStandardError()).decode(errors="replace").strip()
        if text:
            self.event.emit("stderr", text, {})

    def _poll(self):
        if self.run_dir is not None and (self.run_dir / "case").is_dir():
            try:
                data = live_series(self.run_dir)
            except (OSError, ValueError, KeyError):
                return  # a table mid-write; next tick
            if data:
                self.series.emit(data)

    def _done(self, *args):
        self._timer.stop()
        self._poll()
        if self._buffer:
            self.feed(b"\n")
        info: RunInfo = read_run(self.run_dir, self.simulation or "?")
        if info.status == "running":  # the process died without a manifest
            info = RunInfo(info.id, info.simulation, info.path, "failed", "not_trustworthy",
                           info.started, None)
        self.finished.emit(info)
