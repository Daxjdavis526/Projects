"""The project store: a directory holding a thruster's geometry, its
simulation definitions and every run made from them (DESIGN.md section 4.3).

```
MyThruster.sonicline/
  project.json                     name, created, app version
  geometry/<sha256>.step           imported files, content-addressed
  simulations/<sim-id>/definition.json
  runs/<run-id>/                   one pipeline run directory each (manifest,
                                   case, metrics, ...), immutable once finished
```

No Qt here: the desktop UI and scripts use the same store. A run is started
as a separate process (``run_command``), so a solver or pipeline crash never
takes the caller down; it is cancelled through the pipeline's cancel file.
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from .. import __version__
from ..core import model

PROJECT_FILE = "project.json"
SUFFIX = ".sonicline"


class ProjectError(RuntimeError):
    pass


@dataclass(frozen=True)
class SimulationInfo:
    id: str
    name: str
    path: Path  # the definition file


@dataclass(frozen=True)
class RunInfo:
    id: str
    simulation: str
    path: Path
    status: str  # running, or the pipeline's final status
    trust: str | None
    started: str | None
    finished: str | None
    mass_flow: float | None = None  # kg/s
    thrust: float | None = None  # N
    isp: float | None = None  # s

    @property
    def finished_ok(self) -> bool:
        return self.status == "completed" and self.trust != "not_trustworthy"


def _slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:40] or "simulation"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Project:
    def __init__(self, root: Path):
        self.root = Path(root)
        meta = self.root / PROJECT_FILE
        if not meta.is_file():
            raise ProjectError(f"{self.root} is not a SONICLINE project (no {PROJECT_FILE})")
        self.meta = json.loads(meta.read_text(encoding="utf-8"))

    # -- lifecycle ------------------------------------------------------------

    @classmethod
    def create(cls, path: Path, name: str | None = None) -> "Project":
        root = Path(path)
        if root.suffix != SUFFIX:
            root = root.with_name(root.name + SUFFIX)
        if (root / PROJECT_FILE).exists():
            raise ProjectError(f"{root} already holds a project")
        for sub in ("geometry", "simulations", "runs"):
            (root / sub).mkdir(parents=True, exist_ok=True)
        meta = {"name": name or root.stem, "created": _now(), "app_version": __version__,
                "format": 1}
        (root / PROJECT_FILE).write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
        return cls(root)

    @classmethod
    def open(cls, path: Path) -> "Project":
        return cls(Path(path))

    @property
    def name(self) -> str:
        return self.meta.get("name", self.root.stem)

    # -- geometry ---------------------------------------------------------------

    def import_geometry(self, source: Path) -> str:
        """Copy a CAD file into the project under its content hash. Returns
        the path to put in a definition (relative to the project root)."""
        source = Path(source)
        h = hashlib.sha256(source.read_bytes()).hexdigest()
        rel = Path("geometry") / f"{h}{source.suffix.lower()}"
        target = self.root / rel
        if not target.exists():
            shutil.copyfile(source, target)
        return rel.as_posix()

    # -- simulations ------------------------------------------------------------

    def simulations(self) -> list[SimulationInfo]:
        out = []
        for d in sorted((self.root / "simulations").iterdir()):
            f = d / "definition.json"
            if f.is_file():
                try:
                    name = json.loads(f.read_text(encoding="utf-8")).get("name", d.name)
                except json.JSONDecodeError:
                    name = d.name
                out.append(SimulationInfo(d.name, name, f))
        return out

    def save_simulation(self, defn: model.SimulationDefinition, sim_id: str | None = None) -> str:
        """Save a definition; a new one gets an id from its name."""
        if sim_id is None:
            base = _slug(defn.name)
            sim_id, n = base, 2
            while (self.root / "simulations" / sim_id).exists():
                sim_id, n = f"{base}-{n}", n + 1
        d = self.root / "simulations" / sim_id
        d.mkdir(parents=True, exist_ok=True)
        model.save(defn, d / "definition.json")
        return sim_id

    def load_simulation(self, sim_id: str) -> model.SimulationDefinition:
        return model.load(self.root / "simulations" / sim_id / "definition.json")

    # -- runs -------------------------------------------------------------------

    def new_run(self, sim_id: str) -> Path:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        run_id, n = f"{stamp}-{sim_id}", 2
        while (self.root / "runs" / run_id).exists():
            run_id, n = f"{stamp}-{sim_id}-{n}", n + 1
        d = self.root / "runs" / run_id
        d.mkdir(parents=True)
        (d / "simulation").write_text(sim_id + "\n", encoding="utf-8")
        return d

    def run_command(self, sim_id: str, run_dir: Path, processors: int = 1,
                    images: bool = True) -> list[str]:
        """The command that runs ``sim_id`` into ``run_dir`` with JSON events
        on stdout. Relative CAD paths resolve against the project root,
        where the definition is copied first."""
        snapshot = run_dir / "input.json"
        shutil.copyfile(self.root / "simulations" / sim_id / "definition.json", snapshot)
        # CAD paths in a project definition are relative to the project root.
        defn = json.loads(snapshot.read_text(encoding="utf-8"))
        geom = defn.get("geometry", {})
        if geom.get("type") == "cad_file" and not Path(geom["path"]).is_absolute():
            geom["path"] = str((self.root / geom["path"]).resolve())
            snapshot.write_text(json.dumps(defn, indent=2) + "\n", encoding="utf-8")
        cmd = [sys.executable, "-m", "sonicline", "run", str(snapshot), "--out", str(run_dir),
               "--events", "json", "--processors", str(max(1, processors))]
        if not images:
            cmd.append("--no-images")
        return cmd

    def runs(self, sim_id: str | None = None) -> list[RunInfo]:
        out = []
        for d in sorted((self.root / "runs").iterdir(), reverse=True):
            if not d.is_dir():
                continue
            sim = (d / "simulation").read_text(encoding="utf-8").strip() if (d / "simulation").exists() else "?"
            if sim_id is not None and sim != sim_id:
                continue
            out.append(read_run(d, sim))
        return out


def read_run(run_dir: Path, simulation: str = "?") -> RunInfo:
    """A run's state from its files: finished runs have a manifest with a
    status; a run without one is still going (or was killed)."""
    run_dir = Path(run_dir)
    manifest, metrics = {}, {}
    try:
        manifest = json.loads((run_dir / "manifest.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        pass
    try:
        metrics = json.loads((run_dir / "metrics.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        pass
    status = manifest.get("status", "running")
    return RunInfo(
        run_dir.name, simulation, run_dir, status, manifest.get("trust"),
        manifest.get("started"), manifest.get("finished"),
        (metrics.get("mass_flow") or {}).get("inlet"),
        (metrics.get("thrust") or {}).get("total"),
        (metrics.get("specific_impulse") or {}).get("cfd"),
    )
