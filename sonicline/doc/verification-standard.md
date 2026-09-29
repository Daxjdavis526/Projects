Verification results (standard meshes)

| case | check | CFD | reference | error | tolerance | result |
|---|---|---|---|---|---|---|
| V1 | discharge coefficient vs Kliegel-Levine | 0.993827 | 0.994048 | -2.20e-04 | 2e-03 | pass |
| V1 | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94557 | 4.94361 | +0.040 % | 0.5 % | pass |
| V1 | mass conservation, inlet vs exit | -2.6193e-06 | 0 | -2.62e-06 | 1e-04 | pass |
| V1 | thrust: exit plane vs wall + feed | -0.00021194 | 0 | -2.12e-04 | 5e-03 | pass |
| V2 | shock position on the axis vs quasi-1D (fraction of diverging length) | 0.00221091 | 0 | +2.21e-03 | 2e-02 | pass |
| V2 | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.00105619 | 0 | -1.06e-03 | 2e-02 | pass |
| V2 | choked discharge coefficient vs Kliegel-Levine | 0.999974 | 0.999948 | +2.61e-05 | 2e-03 | pass |
| V2 | mass conservation, inlet vs exit | 6.98567e-06 | 0 | +6.99e-06 | 1e-04 | pass |
| V2 | thrust: exit plane vs wall + feed | 5.56935e-05 | 0 | +5.57e-05 | 5e-03 | pass |
| V3a | shock position on the axis vs quasi-1D (fraction of diverging length) | -0.0254405 | 0 | -2.54e-02 | 1e-01 | pass |
| V3a | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.0710623 | 0 | -7.11e-02 | 1e-01 | pass |
| V3a | choked discharge coefficient vs Kliegel-Levine | 0.993275 | 0.994048 | -7.72e-04 | 2e-03 | pass |
| V3a | mass conservation, inlet vs exit | -1.4717e-05 | 0 | -1.47e-05 | 1e-04 | pass |
| V3a | thrust: exit plane vs wall + feed | 3.92565e-06 | 0 | +3.93e-06 | 5e-03 | pass |
| V3b | shock position on the axis vs quasi-1D (fraction of diverging length) | 0.0625388 | 0 | +6.25e-02 | 1e-01 | pass |
| V3b | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.0399321 | 0 | -3.99e-02 | 1e-01 | pass |
| V3b | choked discharge coefficient vs Kliegel-Levine | 0.993291 | 0.994048 | -7.56e-04 | 2e-03 | pass |
| V3b | mass conservation, inlet vs exit | 1.26895e-05 | 0 | +1.27e-05 | 1e-04 | pass |
| V3b | thrust: exit plane vs wall + feed | -1.97718e-06 | 0 | -1.98e-06 | 5e-03 | pass |
| V4a | choked discharge coefficient vs Kliegel-Levine | 0.994581 | 0.994048 | +5.34e-04 | 2e-03 | pass |
| V4a | mass conservation, inlet vs exit | -3.87968e-06 | 0 | -3.88e-06 | 1e-04 | pass |
| V4a | thrust: exit plane vs wall + feed | -0.000201173 | 0 | -2.01e-04 | 5e-03 | pass |
| V4b | subsonic mass flow vs isentropic (pe = pa) | 0.00102606 | 0.00102799 | -0.188 % | 0.5 % | pass |
| V4b | mass conservation, inlet vs exit | -3.60705e-06 | 0 | -3.61e-06 | 3e-04 | pass |
| V4b | thrust: exit plane vs wall + feed | -0.000324918 | 0 | -3.25e-04 | 5e-03 | pass |
| V5 (Rc/Rt 0.625) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 0.625 | 0.981676 | 0.981657 | +1.85e-05 | 5e-04 | pass |
| V5 (Rc/Rt 1) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 1 | 0.989526 | 0.989497 | +2.87e-05 | 5e-04 | pass |
| V5 (Rc/Rt 2) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 2 | 0.996177 | 0.996179 | -1.88e-06 | 5e-04 | pass |
| V5 (Rc/Rt 4) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 4 | 0.998838 | 0.998812 | +2.57e-05 | 5e-04 | pass |
| V1 (o_grid_3d) | discharge coefficient vs Kliegel-Levine | 0.993494 | 0.994048 | -5.53e-04 | 2e-03 | pass |
| V1 (o_grid_3d) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.93942 | 4.94361 | -0.085 % | 0.5 % | pass |
| V1 (o_grid_3d) | mass conservation, inlet vs exit | 6.12682e-07 | 0 | +6.13e-07 | 1e-04 | pass |
| V1 (o_grid_3d) | thrust: exit plane vs wall + feed | -0.000246997 | 0 | -2.47e-04 | 5e-03 | pass |
| V6 | 3D vs wedge: mass flow | 0.00716126 | 0.00716366 | -0.033 % | 0.2 % | pass |
| V6 | 3D vs wedge: thrust | 4.93942 | 4.94557 | -0.124 % | 0.3 % | pass |
| V1 (rhoCentralFoam) | discharge coefficient vs Kliegel-Levine | 0.993266 | 0.994048 | -7.82e-04 | 2e-03 | pass |
| V1 (rhoCentralFoam) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94898 | 4.94361 | +0.109 % | 0.5 % | pass |
| V1 (rhoCentralFoam) | mass conservation, inlet vs exit | -1.01608e-05 | 0 | -1.02e-05 | 1e-04 | pass |
| V1 (rhoCentralFoam) | thrust: exit plane vs wall + feed | -2.10733e-06 | 0 | -2.11e-06 | 5e-03 | pass |
| V7 | central vs PIMPLE: mass flow | 0.00715961 | 0.00716366 | -0.056 % | 0.1 % | pass |
| V7 | central vs PIMPLE: thrust | 4.94898 | 4.94557 | +0.069 % | 0.2 % | pass |
| V9a | Cd vs ISO 9300 toroidal venturi | 0.983127 | 0.98379 | -0.067 % | 0.3 % | pass |
| V9a | mass conservation, inlet vs exit | -7.55128e-06 | 0 | -7.55e-06 | 1e-04 | pass |
| V9a | thrust: exit plane vs wall + feed | 0.000261275 | 0 | +2.61e-04 | 5e-03 | pass |
| V9b | Cd vs ISO 9300 toroidal venturi | 0.991517 | 0.990507 | +0.102 % | 0.3 % | pass |
| V9b | mass conservation, inlet vs exit | -1.69553e-05 | 0 | -1.70e-05 | 1e-04 | pass |
| V9b | thrust: exit plane vs wall + feed | 0.000187161 | 0 | +1.87e-04 | 5e-03 | pass |
| V9c | Cd vs ISO 9300 toroidal venturi | 0.9831 | 0.983789 | -0.070 % | 0.3 % | pass |
| V9c | mass conservation, inlet vs exit | -7.61001e-06 | 0 | -7.61e-06 | 1e-04 | pass |
| V9c | thrust: exit plane vs wall + feed | 0.00026551 | 0 | +2.66e-04 | 5e-03 | pass |
| V9d | Cd vs ISO 9300 toroidal venturi | 0.99051 | 0.990504 | +0.001 % | 0.3 % | pass |
| V9d | mass conservation, inlet vs exit | -3.49726e-06 | 0 | -3.50e-06 | 1e-04 | pass |
| V9d | thrust: exit plane vs wall + feed | 0.00023356 | 0 | +2.34e-04 | 5e-03 | pass |
| V10-perfect | discharge coefficient vs Kliegel-Levine | 0.993827 | 0.994048 | -2.20e-04 | 2e-03 | pass |
| V10-perfect | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 14.8367 | 14.8308 | +0.040 % | 0.5 % | pass |
| V10-perfect | mass conservation, inlet vs exit | -2.56428e-06 | 0 | -2.56e-06 | 1e-04 | pass |
| V10-perfect | thrust: exit plane vs wall + feed | -0.000211935 | 0 | -2.12e-04 | 5e-03 | pass |
| V10-pr | discharge coefficient vs Kliegel-Levine | 0.99374 | 0.994048 | -3.08e-04 | 2e-03 | pass |
| V10-pr | mass conservation, inlet vs exit | -2.18448e-06 | 0 | -2.18e-06 | 1e-04 | pass |
| V10-pr | thrust: exit plane vs wall + feed | -0.000214468 | 0 | -2.14e-04 | 5e-03 | pass |
| V10 | mass flow, Peng-Robinson / perfect gas | 1.01305 | 1.01314 | -0.009 % | 0.02 % | pass |
| V11 (NPR 2.46) | orifices within the test's spanwise spread +- 0.02 (of 10) | 9 | 10 | -1.00e+00 | 1e+00 | pass |
| V11 (NPR 2.46) | separation between the same orifices as the test (p/pt at 0.429 and 0.560 either side of 0.30) | 1 | 1 | +0.00e+00 | 0e+00 | pass |
| V11 (NPR 8.91) | orifices within the test's spanwise spread +- 0.02 (of 10) | 9 | 10 | -1.00e+00 | 1e+00 | pass |
