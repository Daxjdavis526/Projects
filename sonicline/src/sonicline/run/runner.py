"""Run OpenFOAM executables, locally or through WSL2 on Windows.

A runner turns an argument list and a case directory into a process whose
output goes to a log file. Every pipeline stage is a direct call to an
OpenFOAM executable; there are no shell scripts in between. The only shell
involved is the one that sources OpenFOAM's environment file, once, to
capture the environment it sets.
"""

from __future__ import annotations

import os
import platform
import shlex
import subprocess
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath, PureWindowsPath

_CANDIDATES = (
    "/usr/lib/openfoam/openfoam2512/etc/bashrc",
    "/usr/lib/openfoam/openfoam2606/etc/bashrc",
    "/opt/openfoam2512/etc/bashrc",
)


class OpenFOAMNotFound(RuntimeError):
    pass


@dataclass
class Process:
    popen: subprocess.Popen
    log: Path

    def poll(self) -> int | None:
        return self.popen.poll()

    def wait(self) -> int:
        return self.popen.wait()

    def terminate(self) -> None:
        if self.popen.poll() is None:
            self.popen.terminate()


@dataclass
class LocalRunner:
    """OpenFOAM installed on this (Linux) machine."""

    bashrc: Path | None = None
    _env: dict[str, str] | None = field(default=None, repr=False)

    def __post_init__(self) -> None:
        if self.bashrc is None:
            override = os.environ.get("SONICLINE_OPENFOAM_BASHRC")
            found = [Path(p) for p in ((override,) if override else _CANDIDATES) if p and Path(p).is_file()]
            if not found:
                raise OpenFOAMNotFound(
                    "No OpenFOAM installation found. Install ESI OpenFOAM v2512 "
                    "(apt install openfoam2512) or set SONICLINE_OPENFOAM_BASHRC to its etc/bashrc."
                )
            self.bashrc = found[0]

    @property
    def env(self) -> dict[str, str]:
        if self._env is None:
            out = subprocess.run(
                ["bash", "-c", f"source {shlex.quote(str(self.bashrc))} >/dev/null 2>&1; env -0"],
                capture_output=True, check=True,
            ).stdout.decode("utf-8", errors="replace")
            env = dict(item.split("=", 1) for item in out.split("\0") if "=" in item)
            if hasattr(os, "geteuid") and os.geteuid() == 0:  # containers run as root
                env.setdefault("OMPI_ALLOW_RUN_AS_ROOT", "1")
                env.setdefault("OMPI_ALLOW_RUN_AS_ROOT_CONFIRM", "1")
            # Open MPI counts physical cores as slots, so on a machine with
            # hyperthreads (a CI runner: 4 vCPUs, 2 cores) "-np <cpus>" is
            # refused outright. The process count is the user's choice.
            env.setdefault("OMPI_MCA_rmaps_base_oversubscribe", "1")
            self._env = env
        return self._env

    @property
    def version(self) -> str:
        e = self.env
        return f"{e.get('WM_PROJECT', 'OpenFOAM')}-{e.get('WM_PROJECT_VERSION', '?')} (api {e.get('FOAM_API', '?')})"

    def describe(self) -> dict:
        return {"backend": "local", "openfoam": self.version, "bashrc": str(self.bashrc),
                "host": platform.node(), "platform": platform.platform()}

    def start(self, args: list[str], cwd: Path, log: Path) -> Process:
        log.parent.mkdir(parents=True, exist_ok=True)
        handle = open(log, "w", encoding="utf-8")
        env = dict(self.env, PWD=str(Path(cwd).resolve()))
        popen = subprocess.Popen([str(a) for a in args], cwd=cwd, env=env, stdout=handle,
                                 stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
        handle.close()  # the child holds its own descriptor
        return Process(popen, log)

    def run(self, args: list[str], cwd: Path, log: Path) -> int:
        return self.start(args, cwd, log).wait()


def windows_to_wsl(path: Path | str) -> str:
    """C:\\Users\\me\\runs -> /mnt/c/Users/me/runs; \\\\wsl.localhost\\Ubuntu\\home\\me -> /home/me."""
    p = PureWindowsPath(str(path))
    if p.drive.startswith("\\\\"):
        parts = p.parts[1:]  # drop \\wsl.localhost\Distro\
        return str(PurePosixPath("/", *parts))
    drive = p.drive.rstrip(":").lower()
    return str(PurePosixPath("/mnt", drive, *p.parts[1:]))


@dataclass
class WSLRunner:
    """OpenFOAM inside a WSL2 distribution, driven from native Windows.

    Case directories are best kept on the distribution's own filesystem
    (``\\\\wsl.localhost\\<distro>\\home\\...``); OpenFOAM's many small files are
    slow on /mnt/c.
    """

    distro: str = "Ubuntu-24.04"
    bashrc: str = "/usr/lib/openfoam/openfoam2512/etc/bashrc"

    def command(self, args: list[str], cwd: Path) -> list[str]:
        inner = (f"source {shlex.quote(self.bashrc)} >/dev/null 2>&1 && "
                 f"export OMPI_MCA_rmaps_base_oversubscribe=${{OMPI_MCA_rmaps_base_oversubscribe:-1}} && "
                 f"cd {shlex.quote(windows_to_wsl(cwd))} && exec "
                 + " ".join(shlex.quote(str(a)) for a in args))
        return ["wsl.exe", "-d", self.distro, "--", "bash", "-c", inner]

    @property
    def version(self) -> str:
        out = subprocess.run(
            ["wsl.exe", "-d", self.distro, "--", "bash", "-c",
             f"source {shlex.quote(self.bashrc)} >/dev/null 2>&1; "
             "echo \"$WM_PROJECT-$WM_PROJECT_VERSION (api $FOAM_API)\""],
            capture_output=True, text=True,
        )
        return out.stdout.strip() or "unknown"

    def describe(self) -> dict:
        return {"backend": "wsl2", "distro": self.distro, "openfoam": self.version,
                "bashrc": self.bashrc, "host": platform.node(), "platform": platform.platform()}

    def start(self, args: list[str], cwd: Path, log: Path) -> Process:
        log.parent.mkdir(parents=True, exist_ok=True)
        handle = open(log, "w", encoding="utf-8")
        popen = subprocess.Popen(self.command(args, cwd), stdout=handle, stderr=subprocess.STDOUT,
                                 stdin=subprocess.DEVNULL)
        handle.close()
        return Process(popen, log)

    def run(self, args: list[str], cwd: Path, log: Path) -> int:
        return self.start(args, cwd, log).wait()


def default_runner():
    """WSL2 on Windows, the local installation elsewhere."""
    if platform.system() == "Windows":
        return WSLRunner()
    return LocalRunner()
