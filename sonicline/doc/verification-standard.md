Verification results (standard meshes)

| case | check | CFD | reference | error | tolerance | result |
|---|---|---|---|---|---|---|
| V1 | discharge coefficient vs Kliegel-Levine | 0.993827 | 0.994048 | -2.20e-04 | 2e-03 | pass |
| V1 | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94557 | 4.94361 | +0.040 % | 0.5 % | pass |
| V1 | mass conservation, inlet vs exit | -2.59068e-06 | 0 | -2.59e-06 | 1e-04 | pass |
| V1 | thrust: exit plane vs wall + feed | -0.000211923 | 0 | -2.12e-04 | 5e-03 | pass |
| V2 | shock position on the axis vs quasi-1D (fraction of diverging length) | 0.00223705 | 0 | +2.24e-03 | 2e-02 | pass |
| V2 | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.00107208 | 0 | -1.07e-03 | 2e-02 | pass |
| V2 | choked discharge coefficient vs Kliegel-Levine | 0.999974 | 0.999948 | +2.60e-05 | 2e-03 | pass |
| V2 | mass conservation, inlet vs exit | 1.94929e-05 | 0 | +1.95e-05 | 1e-04 | pass |
| V2 | thrust: exit plane vs wall + feed | 7.08983e-05 | 0 | +7.09e-05 | 5e-03 | pass |
| V3a | shock position on the axis vs quasi-1D (fraction of diverging length) | -0.0254138 | 0 | -2.54e-02 | 1e-01 | pass |
| V3a | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.0710808 | 0 | -7.11e-02 | 1e-01 | pass |
| V3a | choked discharge coefficient vs Kliegel-Levine | 0.993277 | 0.994048 | -7.71e-04 | 2e-03 | pass |
| V3a | mass conservation, inlet vs exit | -7.0567e-06 | 0 | -7.06e-06 | 1e-04 | pass |
| V3a | thrust: exit plane vs wall + feed | 5.98598e-06 | 0 | +5.99e-06 | 5e-03 | pass |
| V3b | shock position on the axis vs quasi-1D (fraction of diverging length) | 0.0625406 | 0 | +6.25e-02 | 1e-01 | pass |
| V3b | shock position at the wall vs quasi-1D (fraction of diverging length) | -0.0399086 | 0 | -3.99e-02 | 1e-01 | pass |
| V3b | choked discharge coefficient vs Kliegel-Levine | 0.993291 | 0.994048 | -7.57e-04 | 2e-03 | pass |
| V3b | mass conservation, inlet vs exit | 1.84872e-05 | 0 | +1.85e-05 | 1e-04 | pass |
| V3b | thrust: exit plane vs wall + feed | -8.25029e-06 | 0 | -8.25e-06 | 5e-03 | pass |
| V4a | choked discharge coefficient vs Kliegel-Levine | 0.994583 | 0.994048 | +5.35e-04 | 2e-03 | pass |
| V4a | mass conservation, inlet vs exit | -1.70942e-06 | 0 | -1.71e-06 | 1e-04 | pass |
| V4a | thrust: exit plane vs wall + feed | -0.000200956 | 0 | -2.01e-04 | 5e-03 | pass |
| V4b | subsonic mass flow vs isentropic (pe = pa) | 0.00102607 | 0.00102799 | -0.186 % | 0.5 % | pass |
| V4b | mass conservation, inlet vs exit | -1.07675e-05 | 0 | -1.08e-05 | 3e-04 | pass |
| V4b | thrust: exit plane vs wall + feed | -0.000331787 | 0 | -3.32e-04 | 5e-03 | pass |
| V5 (Rc/Rt 0.625) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 0.625 | 0.981654 | 0.981657 | -3.51e-06 | 5e-04 | pass |
| V5 (Rc/Rt 1) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 1 | 0.989535 | 0.989497 | +3.84e-05 | 5e-04 | pass |
| V5 (Rc/Rt 2) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 2 | 0.996173 | 0.996179 | -6.02e-06 | 5e-04 | pass |
| V5 (Rc/Rt 4) | extrapolated Cd vs Kliegel-Levine, Rc/Rt = 4 | 0.998836 | 0.998812 | +2.35e-05 | 5e-04 | pass |
| V1 (o_grid_3d) | discharge coefficient vs Kliegel-Levine | 0.993494 | 0.994048 | -5.53e-04 | 2e-03 | pass |
| V1 (o_grid_3d) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.93942 | 4.94361 | -0.085 % | 0.5 % | pass |
| V1 (o_grid_3d) | mass conservation, inlet vs exit | 1.32952e-06 | 0 | +1.33e-06 | 1e-04 | pass |
| V1 (o_grid_3d) | thrust: exit plane vs wall + feed | -0.000246911 | 0 | -2.47e-04 | 5e-03 | pass |
| V6 | 3D vs wedge: mass flow | 0.00716126 | 0.00716366 | -0.033 % | 0.2 % | pass |
| V6 | 3D vs wedge: thrust | 4.93942 | 4.94557 | -0.124 % | 0.3 % | pass |
| V1 (rhoCentralFoam) | discharge coefficient vs Kliegel-Levine | 0.993255 | 0.994048 | -7.92e-04 | 2e-03 | pass |
| V1 (rhoCentralFoam) | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 4.94888 | 4.94361 | +0.107 % | 0.5 % | pass |
| V1 (rhoCentralFoam) | mass conservation, inlet vs exit | -1.12311e-05 | 0 | -1.12e-05 | 1e-04 | pass |
| V1 (rhoCentralFoam) | thrust: exit plane vs wall + feed | 3.19746e-06 | 0 | +3.20e-06 | 5e-03 | pass |
| V7 | central vs PIMPLE: mass flow | 0.00715954 | 0.00716366 | -0.058 % | 0.1 % | pass |
| V7 | central vs PIMPLE: thrust | 4.94888 | 4.94557 | +0.067 % | 0.2 % | pass |
| V10-perfect | discharge coefficient vs Kliegel-Levine | 0.993828 | 0.994048 | -2.20e-04 | 2e-03 | pass |
| V10-perfect | vacuum thrust vs 1D x Cd(K-L) x divergence factor | 14.8367 | 14.8308 | +0.040 % | 0.5 % | pass |
| V10-perfect | mass conservation, inlet vs exit | -2.16012e-06 | 0 | -2.16e-06 | 1e-04 | pass |
| V10-perfect | thrust: exit plane vs wall + feed | -0.000211915 | 0 | -2.12e-04 | 5e-03 | pass |
| V10-pr | discharge coefficient vs Kliegel-Levine | 0.99374 | 0.994048 | -3.08e-04 | 2e-03 | pass |
| V10-pr | mass conservation, inlet vs exit | -2.25699e-06 | 0 | -2.26e-06 | 1e-04 | pass |
| V10-pr | thrust: exit plane vs wall + feed | -0.00021456 | 0 | -2.15e-04 | 5e-03 | pass |
| V10 | mass flow, Peng-Robinson / perfect gas | 1.01305 | 1.01314 | -0.009 % | 0.02 % | pass |
