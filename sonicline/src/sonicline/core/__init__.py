"""Solver-independent core: units, gas properties, analytical theory, the
simulation definition and its validation.

Nothing in this package knows OpenFOAM syntax, and nothing imports Qt, VTK
or gmsh. tests/test_architecture.py enforces that.
"""
