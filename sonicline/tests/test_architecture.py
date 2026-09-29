"""Dependency rules from DESIGN.md section 4.1, enforced on the source."""

import ast
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "src" / "sonicline"

# Heavy or UI libraries the solver-independent core must never import.
FORBIDDEN_IN_CORE = {"vtk", "vtkmodules", "pyvista", "pyvistaqt", "PySide6", "PyQt6",
                     "pyqtgraph", "gmsh", "trimesh", "classy_blocks", "matplotlib"}
# Sibling packages the core must not depend on.
FORBIDDEN_SIBLINGS = {"foam", "mesh", "geometry", "run", "monitor", "post", "metrics",
                      "project", "ui", "cli"}
QT = {"PySide6", "PyQt6", "PyQt5", "pyvistaqt", "pyqtgraph"}


def _imports(path: Path):
    """Yield absolute dotted names of every import in a module."""
    package = ".".join(path.relative_to(SRC.parent).with_suffix("").parts[:-1])
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                yield a.name
        elif isinstance(node, ast.ImportFrom):
            if node.level:
                base = package.split(".")
                base = base[: len(base) - (node.level - 1)]
                yield ".".join(base + ([node.module] if node.module else []))
            else:
                yield node.module


CORE_FILES = sorted((SRC / "core").rglob("*.py"))


@pytest.mark.parametrize("path", CORE_FILES, ids=lambda p: str(p.relative_to(SRC)))
def test_core_is_independent(path):
    for name in _imports(path):
        top = name.split(".")[0]
        assert top not in FORBIDDEN_IN_CORE, f"{path.name} imports {name}"
        parts = name.split(".")
        if parts[0] == "sonicline" and len(parts) > 1:
            assert parts[1] not in FORBIDDEN_SIBLINGS, f"{path.name} imports {name}"
            assert parts[1] == "core" or parts[1] == "__init__", f"{path.name} imports {name}"


def test_only_foam_package_mentions_openfoam_dictionaries():
    """OpenFOAM dictionary syntax lives in sonicline.foam alone."""
    for path in SRC.rglob("*.py"):
        if "foam" in path.relative_to(SRC).parts[:1]:
            continue
        text = path.read_text(encoding="utf-8")
        assert "FoamFile" not in text, f"{path} contains OpenFOAM dictionary syntax"


@pytest.mark.parametrize("path", sorted(p for p in SRC.rglob("*.py") if "ui" not in p.relative_to(SRC).parts[:1]),
                         ids=lambda p: str(p.relative_to(SRC)))
def test_only_the_ui_package_imports_qt(path):
    """The UI is a client of a UI-free application (DESIGN.md section 3.7)."""
    for name in _imports(path):
        assert name.split(".")[0] not in QT, f"{path.relative_to(SRC)} imports {name}"
