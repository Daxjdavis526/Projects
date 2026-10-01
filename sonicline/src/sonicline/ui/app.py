"""Entry point: ``sonicline ui [project]`` or ``sonicline-ui [project]``."""

from __future__ import annotations

import os
import sys
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    os.environ.setdefault("QT_API", "pyside6")
    from PySide6 import QtWidgets

    from ..project import Project, ProjectError
    from .main_window import MainWindow

    app = QtWidgets.QApplication.instance() or QtWidgets.QApplication([sys.argv[0]])
    app.setApplicationName("SONICLINE")
    project = None
    if argv:
        path = Path(argv[0])
        try:
            project = Project.open(path) if (path / "project.json").exists() else Project.create(path)
        except ProjectError as e:
            print(f"error: {e}", file=sys.stderr)
            return 2
    window = MainWindow(project)
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
