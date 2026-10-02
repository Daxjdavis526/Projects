"""OpenFOAM extensions SONICLINE compiles for itself.

``viscousWork`` (an fvOption) adds the viscous-work term rhoPimpleFoam's
energy equation lacks; see viscousWork/viscousWork.H for the physics.
``virialGas`` (thermophysics) is the virial real-gas equation of state; see
virialGas/virialGas.H.

Each is built with wmake into the user's OpenFOAM library directory the
first time it is needed. The library name carries a hash of the source, so
a changed source builds a new library and a stale one is never loaded.
Building needs OpenFOAM's development package (``openfoam2512-dev``) and a
C++ compiler; a runtime-coded source would too, and OpenFOAM refuses to
compile those at all when run as root.
"""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
# extension -> the library (or application) name its Make/files declares
LIBRARIES = {"viscousWork": "libsoniclineFvOptions", "virialGas": "libsoniclineVirialGas",
             "slipCentralFoam": "soniclineCentralFoam"}
PURPOSE = {"viscousWork": "viscous runs", "virialGas": "the virial real gas",
           "slipCentralFoam": "slip walls on rhoCentralFoam"}
APPLICATIONS = {"slipCentralFoam"}  # built with wmake into $FOAM_USER_APPBIN

# Applications built from the installed OpenFOAM's own source: the files
# copied from it, and the edits applied, each (file, anchor, replacement).
# An anchor that is not found stops the build: a different OpenFOAM version
# must be looked at, not patched blind.
FROM_OPENFOAM = {"slipCentralFoam": "$FOAM_SOLVERS/compressible/rhoCentralFoam"}
PATCHES = {"slipCentralFoam": [
    ("rhoCentralFoam.C", '#include "fvCFD.H"\n',
     '#include "fvCFD.H"\n#include "wallFvPatch.H"\n'),
    ("rhoCentralFoam.C", "          & (a_pos*U_pos + a_neg*U_neg)\n        );\n",
     "          & (a_pos*U_pos + a_neg*U_neg)\n        );\n"
     "\n"
     "        // SONICLINE: no viscous work crosses a stationary wall. With\n"
     "        // velocity slip the wall face holds tau & U_slip; at a still wall\n"
     "        // that sliding friction stays in the gas (DESIGN.md finding 76).\n"
     "        forAll(mesh.boundary(), patchi)\n"
     "        {\n"
     "            if (isA<wallFvPatch>(mesh.boundary()[patchi]))\n"
     "            {\n"
     "                sigmaDotU.boundaryFieldRef()[patchi] = Zero;\n"
     "            }\n"
     "        }\n"),
]}
SOURCE = HERE / "viscousWork"


class ExtensionBuildError(RuntimeError):
    pass


def source_hash(extension: str = "viscousWork") -> str:
    source = HERE / extension
    h = hashlib.sha256()
    for f in sorted(source.rglob("*")):
        if f.is_file() and "lnInclude" not in f.parts and "linux64" not in str(f):
            h.update(f.relative_to(source).as_posix().encode())
            h.update(f.read_bytes())
    h.update(repr(PATCHES.get(extension, ())).encode())
    return h.hexdigest()[:10]


def library_name(extension: str = "viscousWork") -> str:
    return f"{LIBRARIES[extension]}_{source_hash(extension)}"


def ensure_built(runner, work_dir: Path, extension: str = "viscousWork") -> str:
    """Build the extension if this version is not installed yet; returns the
    file name to list in controlDict ``libs`` (a library) or the executable
    to run (an application)."""
    name = library_name(extension)
    app = extension in APPLICATIONS
    target = name if app else f"{name}.so"
    where = "$FOAM_USER_APPBIN" if app else "$FOAM_USER_LIBBIN"
    probe = work_dir / "log.extension-probe"
    work_dir.mkdir(parents=True, exist_ok=True)
    if runner.run(["bash", "-c", f'test -f "{where}/{target}"'], work_dir, probe) == 0:
        return target
    build = work_dir / extension
    if build.exists():
        shutil.rmtree(build)
    shutil.copytree(HERE / extension, build, ignore=shutil.ignore_patterns("lnInclude", "linux64*"))
    files = build / "Make" / "files"
    files.write_text(files.read_text(encoding="utf-8").replace(
        LIBRARIES[extension], name), encoding="utf-8", newline="\n")
    log = work_dir / "log.wmake"
    if extension in FROM_OPENFOAM:
        _from_openfoam(runner, build, extension, log)
    if runner.run(["wmake"] if app else ["wmake", "libso"], build, log) != 0 or \
            runner.run(["bash", "-c", f'test -f "{where}/{target}"'], work_dir, probe) != 0:
        tail = log.read_text(encoding="utf-8", errors="replace").strip().splitlines()[-8:]
        raise ExtensionBuildError(
            f"could not build the {extension} extension, which {PURPOSE[extension]} need. Install "
            "OpenFOAM's development package (apt install openfoam2512-dev) and a C++ compiler.\n"
            + "\n".join(tail))
    return target


def _from_openfoam(runner, build: Path, extension: str, log: Path) -> None:
    """Copy the installed solver's source (no subdirectories) into ``build``
    and apply PATCHES to it."""
    source = FROM_OPENFOAM[extension]
    if runner.run(["bash", "-c", f'cp "{source}"/*.C "{source}"/*.H .'], build, log) != 0:
        raise ExtensionBuildError(f"could not copy OpenFOAM's source from {source}: is openfoam2512-dev installed?")
    for name, anchor, replacement in PATCHES[extension]:
        f = build / name
        text = f.read_text(encoding="utf-8")
        if text.count(anchor) != 1:
            raise ExtensionBuildError(
                f"the {extension} patch does not fit this OpenFOAM's {name}: its anchor is found "
                f"{text.count(anchor)} times, not once. This OpenFOAM version needs the patch reviewed.")
        f.write_text(text.replace(anchor, replacement), encoding="utf-8", newline="\n")
