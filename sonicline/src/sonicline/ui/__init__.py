"""The desktop application (PySide6 + pyvista + pyqtgraph; the ``ui``
extra). It is a client of the UI-free packages: it edits definitions
through sonicline.project.draft, stores them with sonicline.project, draws
sonicline.post.scene surfaces, and runs the same pipeline as the CLI in a
separate process. No other package imports Qt (tests/test_architecture.py).
"""


def main(argv: list[str] | None = None) -> int:
    from .app import main as run

    return run(argv)
