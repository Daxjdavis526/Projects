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
# extension -> the library name its Make/files declares
LIBRARIES = {"viscousWork": "libsoniclineFvOptions", "virialGas": "libsoniclineVirialGas"}
PURPOSE = {"viscousWork": "viscous runs", "virialGas": "the virial real gas"}
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
    return h.hexdigest()[:10]


def library_name(extension: str = "viscousWork") -> str:
    return f"{LIBRARIES[extension]}_{source_hash(extension)}"


def ensure_built(runner, work_dir: Path, extension: str = "viscousWork") -> str:
    """Build the extension library if this version is not installed yet;
    returns the file name to list in controlDict ``libs``."""
    name = library_name(extension)
    lib_file = f"{name}.so"
    probe = work_dir / "log.extension-probe"
    work_dir.mkdir(parents=True, exist_ok=True)
    if runner.run(["bash", "-c", f'test -f "$FOAM_USER_LIBBIN/{lib_file}"'], work_dir, probe) == 0:
        return lib_file
    build = work_dir / extension
    if build.exists():
        shutil.rmtree(build)
    shutil.copytree(HERE / extension, build, ignore=shutil.ignore_patterns("lnInclude", "linux64*"))
    files = build / "Make" / "files"
    files.write_text(files.read_text(encoding="utf-8").replace(
        LIBRARIES[extension], name), encoding="utf-8", newline="\n")
    log = work_dir / "log.wmake"
    if runner.run(["wmake", "libso"], build, log) != 0 or \
            runner.run(["bash", "-c", f'test -f "$FOAM_USER_LIBBIN/{lib_file}"'], work_dir, probe) != 0:
        tail = log.read_text(encoding="utf-8", errors="replace").strip().splitlines()[-8:]
        raise ExtensionBuildError(
            f"could not build the {extension} extension, which {PURPOSE[extension]} need. Install "
            "OpenFOAM's development package (apt install openfoam2512-dev) and a C++ compiler.\n"
            + "\n".join(tail))
    return lib_file
