Verification results (standard meshes)

| case | check | CFD | reference | error | tolerance | result |
|---|---|---|---|---|---|---|
| V1 | discharge coefficient vs Kliegel-Levine | 0.993827 | 0.994048 | -2.21e-04 | 2e-03 | pass |
| V1 | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94557 | 4.94361 | +0.040 % | 0.5 % | pass |
| V1 | mass conservation, inlet vs exit | -3.17359e-06 | 0 | -3.17e-06 | 1e-04 | pass |
| V1 | thrust: exit plane vs wall + feed | -0.000211991 | 0 | -2.12e-04 | 5e-03 | pass |
| V2 | shock position on the axis vs quasi-1D (fraction of diverging length) | 0.00226228 | 0 | +2.26e-03 | 2e-02 | pass |
| V2 | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.00105605 | 0 | -1.06e-03 | 2e-02 | pass |
| V2 | choked discharge coefficient vs Kliegel-Levine | 0.999975 | 0.999948 | +2.71e-05 | 2e-03 | pass |
| V2 | mass conservation, inlet vs exit | -7.53501e-06 | 0 | -7.54e-06 | 1e-04 | pass |
| V2 | thrust: exit plane vs wall + feed | 3.08569e-05 | 0 | +3.09e-05 | 5e-03 | pass |
| V4a | choked discharge coefficient vs Kliegel-Levine | 0.994586 | 0.994048 | +5.39e-04 | 2e-03 | pass |
| V4a | mass conservation, inlet vs exit | -5.71664e-07 | 0 | -5.72e-07 | 1e-04 | pass |
| V4a | thrust: exit plane vs wall + feed | -0.000201914 | 0 | -2.02e-04 | 5e-03 | pass |
| V4b | subsonic mass flow vs isentropic (pe = pa) | 0.00102631 | 0.00102799 | -0.163 % | 0.5 % | pass |
| V4b | mass conservation, inlet vs exit | -9.19981e-06 | 0 | -9.20e-06 | 3e-04 | pass |
| V4b | thrust: exit plane vs wall + feed | -0.000363901 | 0 | -3.64e-04 | 5e-03 | pass |
| V1 (o_grid_3d) | discharge coefficient vs Kliegel-Levine | 0.993494 | 0.994048 | -5.53e-04 | 2e-03 | pass |
| V1 (o_grid_3d) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.93943 | 4.94361 | -0.085 % | 0.5 % | pass |
| V1 (o_grid_3d) | mass conservation, inlet vs exit | -3.43499e-07 | 0 | -3.43e-07 | 1e-04 | pass |
| V1 (o_grid_3d) | thrust: exit plane vs wall + feed | -0.000247122 | 0 | -2.47e-04 | 5e-03 | pass |
| V6 | 3D vs wedge: mass flow | 0.00716126 | 0.00716366 | -0.033 % | 0.2 % | pass |
| V6 | 3D vs wedge: thrust | 4.93943 | 4.94557 | -0.124 % | 0.3 % | pass |
| V1 (rhoCentralFoam) | discharge coefficient vs Kliegel-Levine | 0.993278 | 0.994048 | -7.70e-04 | 2e-03 | pass |
| V1 (rhoCentralFoam) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94883 | 4.94361 | +0.106 % | 0.5 % | pass |
| V1 (rhoCentralFoam) | mass conservation, inlet vs exit | 2.85992e-05 | 0 | +2.86e-05 | 1e-04 | pass |
| V1 (rhoCentralFoam) | thrust: exit plane vs wall + feed | 1.20197e-05 | 0 | +1.20e-05 | 5e-03 | pass |
| V7 | central vs PIMPLE: mass flow | 0.0071597 | 0.00716366 | -0.055 % | 0.1 % | pass |
| V7 | central vs PIMPLE: thrust | 4.94883 | 4.94557 | +0.066 % | 0.2 % | pass |
