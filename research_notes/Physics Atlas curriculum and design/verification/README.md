# Verification scripts

The scripts the researchers wrote to recompute answer keys, benchmark values
and library measurements cited in the notes one folder up. They were run in a
throwaway session scratchpad, so paths inside them may point at locations that
no longer exist (a Python venv with sympy/scipy, downloaded data files).
Results files are the outputs captured at the time.

| folder | backs |
|---|---|
| `gr_pathway/` | `gr_specialization_pathway.md`: symbolic checks (vacuum equations, Friedmann, orbits) and numeric answers |
| `gr_math/` | `gr_math_tensors_and_geometry.md` (`verify.py`–`verify4.py`, `out*.txt`) and `gr_math_pdes_analysis_numerics.md` (`verify_*.py`) |
| `intro_modern_physics/` | constants and answer anchors in `intro_and_modern_physics_content_map.md` |
| `labs_computing/` | Pantheon+, Mercury, pendulum and numerics checks in `labs_research_and_computing.md` |
| `learning_model/` | mastery-model simulations in `learning_science_and_engagement.md` |
| `architecture_bench/` | KaTeX/MathJax/answer-checker timings and package-size measurements in `technical_architecture.md` |
