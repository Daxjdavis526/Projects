# Module 03 — Answer key: Rocket Performance

Answers to the problems and quiz in
[`03-performance.md`](03-performance.md). Every number here was computed with
`tools/rocket.py`; the reproducible cases are registered in
`tools/examples/03.py`.

Constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K).

---

## K1. Problem solutions

### Conceptual

**P1.** Firing the same hardware at $p_a = 101\,325$ Pa and then at 5 kPa:

| quantity | changes? | direction | why |
|---|---|---|---|
| $\dot m$ | no | — | the throat is choked; downstream pressure cannot propagate upstream past $M = 1$ |
| $A_t$ | no | — | geometry (barring erosion) |
| $c^*$ | no | — | $c^* = p_c A_t/\dot m$, and none of the three changed |
| $C_f$ | **yes** | **up** | the pressure term $(p_e - p_a)\varepsilon/p_c$ becomes less negative (or more positive) as $p_a$ falls |
| $I_{sp}$ | **yes** | **up** | $I_{sp} = c^* C_f/g_0$ and only $C_f$ moved |

The magnitude: $\Delta C_f = (p_{a,SL} - p_{a,alt})\varepsilon/p_c$. This is the
whole reason $c^*$ and $C_f$ are separated — $c^*$ is a property of the chamber
that the test cell cannot change, and $C_f$ carries the entire environmental
dependence. A grader should want to see the student say "choked" for $\dot m$.

**P2.** The pressure-thrust term is the residue of a pressure integral over the
engine's *own* surfaces, not a force transmitted through the exhaust to the
atmosphere. The argument: over a closed control surface, a *uniform* pressure
exerts zero net force. So the ambient pressure acting everywhere contributes
nothing, and the only thing left is the difference between the actual exit-plane
pressure $p_e$ and the uniform $p_a$ that was notionally applied there —
i.e. $(p_e - p_a)A_e$.

The alternative control volume: draw it on the *inside* wetted surface of the
engine — injector face, chamber wall, convergent contour, divergent contour —
and on the outside of the metal. Then thrust is
$F = \int_{\text{inner}} p\,\hat n_x\,dA - \int_{\text{outer}} p_a\,\hat n_x\,dA$,
with no exit plane and no momentum flux appearing. To evaluate it you need the
**pressure distribution along the entire contour**, which means you need the
contour geometry and a solution of the internal flow — far more information
than the exit-plane form requires. That is precisely why nobody does it this
way for hand calculations, and precisely why CFD post-processors do exactly
this as an independent check on the one-dimensional answer.

**P3.** Choose **engine B** and work on the chamber.

$\eta_{c^*}$ contains mixing, atomisation, vaporisation, mixture-ratio
distribution, heat loss and film cooling — a 0.93 means several per cent is
being left on the table by the injector, and injector development (element
resizing, patternation, pattern changes) is a well-trodden path with large
available gains. The F-1's "Project Go" moved combustion behaviour enormously
across 210 injector designs.

$\eta_{C_f}$ at 0.93 in engine A is already near the floor of what a nozzle
loses, and the remaining terms — divergence, boundary layer, kinetics — are
each worth 1–2 % and are constrained by hard physics. Recovering 2 % from a
nozzle means a new contour, a new length, probably a new cooling circuit, and
a requalification. Recovering 2 % from an injector means a new faceplate.

The counter-argument, which a strong answer states: if engine A's 0.93 is
caused by *operating near separation* rather than by contour quality, then a
modest reduction in $\varepsilon$ recovers it cheaply, and A becomes the better
target. So the honest answer is "B, unless A's low $C_f$ is a separation
problem" — and the diagnostic is a wall static-pressure survey.

**P4.** $c^* = \sqrt{RT_0}/\Gamma(\gamma) = \sqrt{R_u T_0/\mathcal{M}}/\Gamma$.
Since $R_u$ is a constant and $\Gamma$ moves by ~3 % over all realistic
$\gamma$ (0.628 at 1.10 to 0.685 at 1.40), $c^*$ is controlled almost entirely
by $\sqrt{T_0/\mathcal{M}}$.

Both appear under the same square root, so a 10 % rise in $T_0$ and a 10 % fall
in $\mathcal{M}$ give the same 4.9 % gain in $c^*$ *arithmetically*. The reason
lower $\mathcal{M}$ is worth more in practice is that it is nearly free while
higher $T_0$ is not:

- $T_0$ is bounded by dissociation. Above ~3 600 K, adding energy mostly
  breaks molecules apart rather than raising temperature, so the return on
  richer stoichiometry saturates.
- Higher $T_0$ raises heat flux (roughly linearly in $T_{aw}$, Module 10),
  which costs cooling capacity, wall life, and often a copper alloy.
- Lowering $\mathcal{M}$ costs you only propellant density and tank volume.

This is exactly why engines run **fuel-rich** rather than at stoichiometric:
$MR = 6$ for LOX/LH2 rather than the stoichiometric 8, because the excess
hydrogen drops $\mathcal{M}$ faster than it drops $T_0$. The $c^*$ optimum sits
on the fuel-rich side of stoichiometric for essentially every combination.

**P5.** Three independent reasons:

1. **Separation and side loads (structural, not performance).** Doubling
   $\varepsilon$ halves $p_e$. If the original $p_e/p_a$ was 0.6, the new one is
   0.3 — below Summerfield's 0.4 and probably below Schmucker's threshold. The
   consequence is an unsteady, asymmetric separation line producing lateral
   loads on the nozzle and gimbal bearing during start and during any low-$p_c$
   throttle excursion. This has ended nozzle extensions.
2. **Mass.** Bell surface area grows roughly as $\varepsilon$, so nozzle mass
   roughly doubles. On a first stage the $\Delta v$ value of that mass is
   modest but not zero, and it lands on the gimbal actuators, the thrust
   structure, and the engine's own thrust-to-weight.
3. **Packaging.** Exit diameter grows as $\sqrt{\varepsilon}$ — a factor of
   1.41. On a clustered first stage (the F-1's five engines, Falcon 9's nine)
   the base area is fixed and the engines are already close-packed with
   gimbal clearance. There may simply be no room, which is a hard no rather
   than a trade.

A fourth, if the student is thinking about the vehicle: the "1 % sea-level
penalty" is evaluated at $p_a = 101$ kPa, but the loss is largest exactly when
thrust matters most — off the pad, at low velocity, where gravity losses are
being paid. The trajectory-integrated penalty is worse than the instantaneous
one suggests.

**P6.** $C_f$ contains no chemistry because $RT_0$ cancels exactly when the
momentum flux $\dot m u_e$ is divided by $p_c A_t$: $\dot m$ carries
$1/\sqrt{RT_0}$ (Eq. 3.7) and $u_e$ carries $\sqrt{RT_0}$ (Eq. 3.6). What
survives is a function of $\gamma$ and pressure ratio only.

$c^*$ contains no downstream geometry because the throat is **choked**.
Information cannot propagate upstream through a sonic throat, so the chamber
does not know what nozzle is attached.

**The single assumption that makes both true is that the throat is choked and
the flow through it is one-dimensional and isentropic** with a well-defined
$A_t$. Break it and both statements fail together:

- If $p_c/p_a < \sim 1.9$ the nozzle unchokes, $\dot m$ becomes a function of
  $p_a$, and $c^*$ acquires an ambient dependence. (Relevant to a cold-gas
  thruster at end of blowdown, Module 29.)
- If the throat boundary layer is thick — small thrusters, low Reynolds number
  — the effective sonic area differs from the geometric $A_t$, and since the
  same $A_t$ appears in both $c^*$ and $C_f$, the error contaminates both and
  the two efficiencies stop being independent.
- If the throat erodes, $A_t$ is time-varying and shared between the two.

**P7.** Solid motor: **two-phase flow loss** dominates. Aluminised propellants
produce condensed Al₂O₃ droplets that make up 25–35 % of the exhaust mass.
These particles lag the gas in velocity (they cannot be accelerated fast enough
by drag in the short nozzle residence time) and in temperature (they leave
still hot, carrying away enthalpy). 1–4 % is typical; the loss grows with
particle size and with shorter nozzles.

Liquid engine (clean bipropellant): two-phase loss is essentially zero, so
$\eta_{C_f} = 0.94$ points at **divergence and boundary layer**, and if it is
that low, most likely **operating near or in separation** or a short conical
nozzle. A well-contoured bell in vacuum should reach 0.98.

The reason they differ is chemistry, not geometry: whether the exhaust has a
condensed phase in it.

### Calculation

**P8.**

(a) $R = 8314.46/21.0 = \mathbf{395.93}$ J/(kg·K).
$$\Gamma(1.15) = \sqrt{1.15}\left(\frac{2}{2.15}\right)^{\frac{2.15}{0.30}} = 1.07238 \times (0.930233)^{7.1667} = \mathbf{0.63864}$$

(b) $\sqrt{RT_0} = \sqrt{395.93 \times 3450} = \sqrt{1\,365\,959} = 1\,168.7$ m/s.
$$c^*_{ideal} = 1168.7/0.63864 = \mathbf{1\,830.0\ m/s}$$

(c) $A_t = \frac{\pi}{4}(0.120)^2 = 1.13097\times10^{-2}$ m².
$$\dot m = \frac{p_c A_t}{c^*} = \frac{8.0\times10^6 \times 1.13097\times10^{-2}}{1830.0} = \mathbf{49.44\ kg/s}$$

(d) With $\eta_{c^*} = 0.94$, $c^* = 1\,720.2$ m/s and
$\dot m = 90\,477.6/1720.2 = \mathbf{52.60\ kg/s}$ — **6.4 % higher**.

The sign trips people up. $c^*$ is in the *denominator*. A chamber with poor
combustion produces cooler, heavier gas, which has lower sonic velocity at the
throat, which means it takes **more** mass flow to hold up the same chamber
pressure behind the same throat. Poor $\eta_{c^*}$ costs you propellant per
unit of chamber pressure, which is exactly why it costs you $I_{sp}$.

**P9.** $R = 8314.46/22.0 = 377.93$ J/(kg·K); $\Gamma(1.22) = 0.65239$.

$$c^* = \frac{\sqrt{377.93 \times 3300}}{0.65239} = \frac{1116.9}{0.65239} = \mathbf{1\,711.8\ m/s}$$

Area–Mach inversion at $\varepsilon = 60$, $\gamma = 1.22$: $M_e = \mathbf{4.6617}$.
$$\frac{p_e}{p_c} = \left(1 + \frac{0.22}{2}(4.6617)^2\right)^{-1.22/0.22} = 1.1469\times10^{-3}
\;\Rightarrow\; p_e = \mathbf{4\,587\ Pa}$$
$$C_{f,vac} = 1.8243 + (1.1469\times10^{-3})(60) = 1.8243 + 0.0688 = \mathbf{1.89312}$$
$$I_{sp,vac} = \frac{1711.8 \times 1.89312}{9.80665} = \mathbf{330.5\ s}$$
$$A_t = \frac{100\,000}{1.89312 \times 4.0\times10^6} = \mathbf{1.32057\times10^{-2}\ m^2},\quad D_t = \mathbf{0.1297\ m}$$
$$A_e = 60 A_t = \mathbf{0.7923\ m^2},\quad D_e = \mathbf{1.0044\ m}$$
$$\dot m = \frac{4.0\times10^6 \times 1.32057\times10^{-2}}{1711.8} = \mathbf{30.86\ kg/s}$$

Sanity: 330 s vacuum on a storable-class $c^*$ of 1 712 m/s at $\varepsilon = 60$
is in the right neighbourhood for an N₂O₄/MMH apogee engine.

**P10.** Numbers read from `reference/_verify-liquid.md`, with their caveats:

| engine | $p_c$ | $\varepsilon$ | $I_{sp}$ | caveat carried |
|---|---|---|---|---|
| F-1 (SL) | 70 bar (1 015 psia) | 16 | 263 s | $p_c$ **contested**, 965–1 125 psia across sources; the file recommends 70 bar injector-end and says "do not let the textbook print a single unqualified value". $I_{sp}$ is 263 s flight-block, 260 s early block; enginehistory.org says 265.4 s. |
| RS-25 @109 % (vac) | 206.4 bar (2 994 psia) | 69 (manufacturer) | 452.3 s | $\varepsilon$ **contested** — 69:1 (L3Harris and Wikipedia infobox) vs 77.5:1 (NASA/Rocketdyne training material) vs 78:1. $p_c$ is one of the best-attested numbers in the file. |
| RD-180 (SL) | 267 bar (3 870 psia) | 36.87 | 311 s | High confidence on the full performance set. But Russian practice quotes **nozzle-stagnation** $p_c$, US practice injector-end — the systemic caveat (item 18) applies to any comparison against the RS-25's 206 bar. |

Computed $C_f$ and reconstructed $c^* = I_{sp}g_0/C_f$:

| engine | $\gamma$ | $M_e$ | $p_e$ (Pa) | $C_f$ | implied $c^*$ |
|---|---|---|---|---|---|
| F-1 | 1.21 | 3.642 | 45 925 | 1.5580 | **1 655 m/s** (LOX/RP-1) |
| RS-25 | 1.19 | 4.553 | 22 595 | 1.9393 | **2 287 m/s** (LOX/LH2) |
| RD-180 | 1.20 | 4.183 | 61 819 | 1.7375 | **1 755 m/s** (LOX/RP-1) |

**Are the two kerolox values consistent?** They differ by 6.0 % (1 655 vs
1 755), and the difference is in the direction physics predicts:

- The RD-180 runs at 267 bar against the F-1's 70 bar. Higher pressure
  suppresses dissociation, raising the effective $T_0$ and completing
  combustion in less residence time — worth 1–2 % of ideal $c^*$.
- The F-1 dumps fuel-rich gas-generator exhaust into the nozzle extension as
  film cooling and runs a heavily film-cooled chamber; both are deliberate
  $c^*$ losses. The RD-180 is staged combustion — the preburner flow all goes
  through the main chamber, nothing is dumped.
- The F-1 is 1960s injector technology at a scale nobody had attempted;
  the RD-180 is the culmination of the RD-170 line.

So $\eta_{c^*} \approx 0.94$ for the F-1 and $\approx 0.998$ for the RD-180
against a nominal ideal of ~1 759 m/s. **The RD-180 number is the suspicious
one**: an implied efficiency of 0.998 is not achievable, which means the
assumed $\gamma = 1.20$ / $T_0$ / $\mathcal{M}$ are wrong for oxidiser-rich
staged combustion at 267 bar (the real gas is oxygen-rich, hotter, and heavier
than the assumed values). Full marks require the student to notice this and
distrust the model rather than credit the engine.

**P11.** With $\varepsilon = 77.5$: $M_e = 4.6332$, $p_e = 19\,543$ Pa,
$C_{f,vac} = 1.94790$, so $c^* = 452.3\times9.80665/1.94790 = \mathbf{2\,277\ m/s}$
against 2 287 m/s at $\varepsilon = 69$.

**Change: 0.44 %** for a 12.3 % change in area ratio.

The lesson: **performance data cannot settle the expansion-ratio dispute.** Both
values reproduce the published $I_{sp}$ to well inside the uncertainty of the
thermochemistry assumptions (which are worth several per cent) and inside the
measurement uncertainty of $I_{sp}$ itself. The vacuum $C_f$ curve is simply too
flat out at $\varepsilon \approx 70$ for $I_{sp}$ to be a sensitive
discriminator. Resolving 69 vs 77.5 requires a dimensioned drawing or a
measurement, which is exactly what `_verify-liquid` recommends. Anyone who
claims to have settled it by back-computing from $I_{sp}$ has fooled themselves.

**P12.** $p_c = 70$ bar, $\gamma = 1.21$, $p_a = 101\,325$ Pa at sea level.

(a) $p_c/p_a = 69.08$. Inverting the isentropic pressure relation:
$M_e = 3.2154$, hence $\boldsymbol{\varepsilon^{opt} = 8.797}$.

(b) $C_{f,SL}(\varepsilon = 8.797) = \mathbf{1.59310}$ (the maximum);
$C_{f,SL}(\varepsilon = 16) = \mathbf{1.55800}$. The over-expanded nozzle gives
up **2.20 %** at sea level.

(c) $C_{f,vac}(8.797) = \mathbf{1.72044}$; $C_{f,vac}(16) = \mathbf{1.78960}$.
The bigger nozzle gains **4.02 %** in vacuum.

(d) $C_f$ at the two flight altitudes:

| | $p_a = 54.0$ kPa (5 km) | $p_a = 12.0$ kPa (15 km) | weighted (0.2/0.8) |
|---|---|---|---|
| $\varepsilon = 8.797$ | 1.65255 | 1.70530 | **1.69475** |
| $\varepsilon = 16$ | 1.66612 | 1.76206 | **1.74288** |

$\varepsilon = 16$ wins by **2.84 %** on the burn-time-weighted average, and
it wins at *both* altitudes, not just the high one. **Recommend $\varepsilon = 16$.**

Separation check at sea level:
- $\varepsilon = 8.797$: $p_e = p_a$ by construction, ratio 1.0 — no risk.
- $\varepsilon = 16$: $M_e = 3.6419$, $p_e = 45\,925$ Pa,
  $p_e/p_a = 0.453$ — above Summerfield's 0.4; Schmucker gives
  $p_{sep} = 32.7$ kPa, and $45.9 > 32.7$, so **attached, with about 40 %
  margin on the Schmucker criterion**. Tight but acceptable, and note the F-1
  itself sat exactly here.

A complete answer also observes that a weighting that gave any significant time
below ~2 km, or any requirement to throttle deeply at low altitude, would erode
the margin and might push the recommendation back toward a smaller
$\varepsilon$.

**P13.** $A_t = 1.13097\times10^{-2}$ m² from P8(c).
$$V_c = L^* A_t = 1.05 \times 1.13097\times10^{-2} = \mathbf{1.1875\times10^{-2}\ m^3 = 11.88\ L}$$
$$A_c = 2.5 A_t = 2.8274\times10^{-2}\ \mathrm{m^2} \quad\Rightarrow\quad D_c = \mathbf{0.1897\ m}$$
$$L_c \approx \frac{V_c}{A_c} = \mathbf{0.420\ m}$$

**The assumption:** that the entire chamber volume is the cylinder — i.e. the
convergent section contributes nothing. It does contribute, typically 10–20 %
of $V_c$ for a contraction ratio of 2.5 and a conventional 30–45° convergence
half-angle. So this estimate **overestimates $L_c$ by 10–20 %**; the true
cylindrical length is more like 0.34–0.38 m. Stating the direction of the error
is the point of the question; a student who writes 0.420 m without qualification
has not understood what $L^*$ measures.

**P14.** $A_t = \frac{\pi}{4}(0.0750)^2 = 4.4179\times10^{-3}$ m²;
$p_c A_t = 24\,298$ N.

$$c^*_{meas} = \frac{24\,298}{14.6} = \mathbf{1\,664.3\ m/s}$$

$R = 8314.46/22.5 = 369.53$ J/(kg·K); $\Gamma(1.20) = 0.64853$:
$$c^*_{ideal} = \frac{\sqrt{369.53 \times 3500}}{0.64853} = \frac{1137.3}{0.64853} = \mathbf{1\,753.6\ m/s}$$
$$\eta_{c^*} = 1664.3/1753.6 = \mathbf{0.9491}$$

$$C_{f,meas} = \frac{36\,500}{24\,298} = \mathbf{1.5022}$$

At $\varepsilon = 12$, $\gamma = 1.20$: $M_e = 3.4052$, $p_e = 54\,225$ Pa, so
the pressure term is $(54\,225 - 101\,325)\times12/5.5\times10^6 = -0.1028$ and
$C_{f,ideal} = 1.6462 - 0.1028 = \mathbf{1.54344}$.
$$\eta_{C_f} = 1.5022/1.54344 = \mathbf{0.9733}$$
$$\eta_{ov} = 0.9491 \times 0.9733 = \mathbf{0.9238}$$
$$I_{sp,meas} = \frac{36\,500}{14.6 \times 9.80665} = \mathbf{254.9\ s}$$
(against an ideal $1753.6\times1.54344/9.80665 = 276.0$ s.)

**Separation check.** $p_e/p_a = 54\,225/101\,325 = 0.535$, above
Summerfield's 0.4. Schmucker at $M_e = 3.4052$ gives $p_{sep} = 34.4$ kPa, and
$54.2 > 34.4$. **The flow is attached with good margin, so $\eta_{C_f} = 0.973$
is trustworthy** — it represents genuine divergence and boundary-layer losses,
not a separated nozzle masquerading as a bad contour. Had the margin been thin,
the correct statement would be that $C_{f,ideal}$ is not the right reference and
$\eta_{C_f}$ is meaningless.

**P15.**

(a) $\lambda = \frac{1 + \cos 17.5°}{2} = \frac{1 + 0.953717}{2} = \mathbf{0.97686}$ (a 2.31 % loss).

(b) $\eta_{C_f} = 0.97686 \times 0.990 \times 0.985 = \mathbf{0.9526}$.

(c) Recovering 80 % of the divergence loss: the loss falls from 2.314 % to
0.463 %, so $\lambda_{bell} = \mathbf{0.99537}$ and
$$\eta_{C_f} = 0.99537 \times 0.990 \times 0.985 = \mathbf{0.9706}$$
$$\Delta I_{sp} = 340 \times \left(\frac{0.9706}{0.9526} - 1\right) = \mathbf{+6.4\ s}$$

Comment worth marks: 6.4 s is a large number — comparable to what a whole
cycle change buys — obtained purely by re-shaping a wall. That is why Rao's
1958 contour method [Rao58] was adopted essentially universally within a
decade, and why nobody has flown a purely conical nozzle on a serious engine
since.

### Engineering reasoning

**P16.** *Flat $p_c$, flat flows, thrust falling 3 %.*

$c^*_{meas} = p_c A_t/\dot m$ uses only the three quantities that are **not**
changing, so **$c^*$ is constant and the chamber is fine**. All of the loss is
in $C_f = F/(p_c A_t)$, which falls 3 %. The fault is downstream of the throat.

| candidate | effect on $c^*_{meas}$ | effect on $C_{f,meas}$ | signature |
|---|---|---|---|
| **Progressive flow separation** (nozzle cooling down, or a slow ambient/cell-pressure rise) | none | falls | wall static taps show a pressure plateau moving upstream; plume shows an asymmetric shock structure |
| **Nozzle extension damage / burn-through** — a hole downstream vents flow at the wrong angle and reduces effective $A_e$ | none | falls | thermocouples on the extension; visible plume asymmetry; post-test inspection |
| **Load-cell drift or a growing line-force tare** (a propellant line stiffening thermally and taking axial load) | none | *apparently* falls | the thrust stand's calibration check after the run does not repeat; the fault vanishes if the run is repeated with the line re-routed |
| **Throat erosion** | falls too (if using cold $A_t$) | rises | ruled out here, because $c^*$ would move |

**The discriminating measurement: a row of static-pressure taps along the
divergent wall.** Separation produces an unmistakable signature — pressure
rising to a plateau near $p_a$ at some axial station, and that station moving
during the run. If the wall pressures follow the ideal isentropic distribution
all the way to the exit, the nozzle flow is fine and the problem is either
structural (hole) or the thrust measurement itself, which the post-run
calibration check settles.

**P17.** *$p_c$ drooping 4 %, thrust falling 4 %, flows constant.*

$C_f = F/(p_c A_t)$ is **unchanged** (both numerator and denominator fell 4 %),
so the nozzle is behaving. $c^* = p_c A_t/\dot m$ has fallen 4 % **if you use
the cold throat area** — but that is the trap. The two consistent explanations:

1. **Throat erosion.** $A_t$ grows by 4 %; then $p_c = \dot m c^*/A_t$ falls by
   4 % at constant true $c^*$, and $F = C_f p_c A_t$ is unchanged by the area
   growth but falls with $p_c$... which does not close. Working it properly:
   with $\dot m$ and $c^*$ fixed and $A_t$ growing 4 %, $p_c$ falls 3.8 %,
   $p_c A_t$ is essentially constant, and $F$ should be essentially constant
   too. **So pure erosion does not reproduce the observation.** A good student
   catches this.
2. **A genuine $c^*$ decay at constant $A_t$.** With $A_t$ and $\dot m$ fixed,
   $p_c \propto c^*$ and $F = C_f p_c A_t \propto c^*$ — both fall by the same
   4 %, and $C_f$ is unchanged. **This matches exactly.** Causes: mixture-ratio
   drift (a valve creeping, a propellant temperature changing so density and
   therefore the flow split changes), progressive injector element blockage,
   or increasing heat loss.

**Why this is a different fault from P16.** In P16 the ratio $F/p_c$ changed,
which can only be the nozzle. Here $F/p_c$ is constant and both fell, which can
only be the chamber (or the throat area, which the analysis above rules out).
$F/p_c A_t$ and $p_c A_t/\dot m$ are two independent windows, and this pair of
problems exists to show that reading them together localises the fault while
reading either alone does not.

The confirming measurement: mixture ratio from the two flowmeters, and a
post-test throat inspection to eliminate erosion definitively.

**P18.** $F_{vac} = 65$ kN, $I_{sp,vac} = 462$ s, $p_c = 60$ bar,
$\varepsilon = 130$, LOX/LH2.

$$\dot m = \frac{F}{I_{sp}g_0} = \frac{65\,000}{462 \times 9.80665} = 14.35\ \mathrm{kg/s}$$

Assume $\gamma = 1.19$ (hydrogen-rich exhaust; anything from 1.18 to 1.22 is
defensible and changes the answer by under 1 %). At $\varepsilon = 130$:
$M_e = 4.9928$, $p_e/p_c = 4.977\times10^{-4}$, giving
$$C_{f,vac} = 1.9188 + (4.977\times10^{-4})(130) = \mathbf{1.98355}$$
$$c^*_{implied} = \frac{I_{sp}g_0}{C_f} = \frac{462 \times 9.80665}{1.98355} = \mathbf{2\,284\ m/s}$$

Also: $A_t = F/(C_f p_c) = 65\,000/(1.98355\times6.0\times10^6) = 5.462\times10^{-3}$
m² ($D_t = 83.4$ mm), and $D_e = 0.951$ m — a plausible upper-stage geometry.

**Acceptance band.** Ideal LOX/LH2 $c^*$ at $MR \approx 5.5$–6 is
2 300–2 400 m/s, and $\eta_{ov}$ for a real engine is 0.94–0.98. So a
believable implied $c^*$ is roughly **2 160–2 350 m/s**. The implied 2 284 m/s
sits at $\eta_{ov} \approx 0.96$ — squarely inside. **The datasheet is
consistent.**

Cross-check against a real engine: the RL10B-2 achieves 465.5 s at
$\varepsilon = 285$; 462 s at $\varepsilon = 130$ and only 60 bar is slightly
optimistic but not absurd for a closed expander. If the implied $c^*$ had come
out above ~2 400 m/s the datasheet would be claiming an impossible combustion
efficiency; below ~2 100 m/s the engine would be unusually poor for hydrogen
and you would ask why.

**P19.** Throttling from 100 % to 40 % by reducing $p_c$ at constant $A_t$ and
constant $MR$:

- **$c^*$:** nearly constant. It depends on $T_0$, $\mathcal{M}$, $\gamma$,
  which move only through the mild pressure dependence of equilibrium
  composition (lower $p_c$ means slightly more dissociation, slightly lower
  $T_0$). Expect 1–2 % loss over a 2.5:1 throttle. A second-order effect worth
  more at deep throttle is degraded atomisation as injector $\Delta p$ falls
  with $\dot m^2$ — that can cost several per cent of $\eta_{c^*}$ and is the
  real reason deep throttling is hard (Module 07).
- **$C_f$:** falls, and this is the dominant effect. $\varepsilon$ and $\gamma$
  are fixed so $p_e \propto p_c$, while $p_a$ is fixed. The pressure term
  $(p_e - p_a)\varepsilon/p_c$ becomes steadily more negative.
- **$I_{sp}$:** falls, tracking $C_f$.
- **$\varepsilon^{opt}$:** falls, because $p_c/p_a$ falls. The fixed nozzle
  becomes progressively more over-expanded relative to its own optimum.

**Numerical separation check**, $\varepsilon = 25$, $\gamma = 1.20$,
$p_{c,100\%} = 100$ bar, sea level. $M_e = 3.9128$, $p_e/p_c = 3.804\times10^{-3}$.
Schmucker: $p_{sep}/p_a = (1.88\times3.9128 - 1)^{-0.64} = 0.306$.

| throttle | $p_c$ (bar) | $p_e$ (Pa) | $p_e/p_a$ | $C_{f,SL}$ | status |
|---|---|---|---|---|---|
| 100 % | 100 | 38 043 | 0.375 | 1.5891 | below Summerfield 0.4, **above** Schmucker 0.306 — marginal |
| 80 % | 80 | 30 434 | 0.300 | 1.5257 | **at the Schmucker limit** |
| 60 % | 60 | 22 826 | 0.225 | 1.4202 | separated |
| 50 % | 50 | 19 021 | 0.188 | 1.3358 | separated |
| 40 % | 40 | 15 217 | 0.150 | 1.2091 | deeply separated |

**Worry starts at about 80 % throttle**, where the nozzle reaches the Schmucker
threshold. Below that the flow separates, the real $C_f$ departs (upward) from
the table because the nozzle is effectively shorter than it looks, and — the
actual concern — the separation line becomes unsteady and asymmetric,
generating side loads on the gimbal. Note that the *performance* consequence of
separation is mild and the *structural* consequence is not. This is why
first-stage engines with big nozzles are throttled at altitude, not on the pad,
and why Falcon 9's landing burn runs on fewer engines at higher per-engine
thrust rather than on all nine deeply throttled.

**P20.** Four legitimate reasons, all of which have caused real disputes:

1. **Different ambient reference.** Sea-level, vacuum, or "altitude" at a
   specific test-cell pressure. A 1.5 % difference is easily an altitude-cell
   figure versus a true-vacuum extrapolation.
2. **Different $p_c$ measurement station.** Injector-end static versus nozzle
   stagnation differ by a few per cent (`_verify-liquid`, systemic item 18).
   Since $c^*$ and $C_f$ both scale with the assumed $p_c$, the derived
   performance shifts.
3. **Different ideal baseline for the efficiency**, or different assumed
   $\varepsilon$. The RS-25's 69-vs-77.5 dispute is exactly this; so is
   equilibrium versus frozen nozzle expansion in the thermochemical reference.
4. **Different operating point.** Power level (the RS-25's 100 / 104.5 / 109 %
   columns), mixture ratio (the J-2's PU valve moved $MR$ between 4.5 and 5.5,
   which moves $I_{sp}$ by several seconds), or engine block/uprate (the F-1's
   early 260 s versus flight-block 263 s).

A fifth, if the student is thorough: **measurement uncertainty**. A 0.5 %
thrust uncertainty and a 1 % flow uncertainty combine by root-sum-square to
about 1.1 % on $I_{sp}$, so a 1.5 % disagreement may not be a disagreement at
all.

**What to ask for:** the test data package — the ambient reference and cell
pressure, the $p_c$ tap location and transducer calibration, the flowmeter
calibration and the fluid conditions at the meter, the throat area measurement
(pre and post), the power level and mixture ratio at the data slice, the
thermochemical reference case and its assumptions (equilibrium or frozen), and
the uncertainty budget. Without the last one the comparison cannot be closed
either way.

---

## K2. Quiz answers

**Q1 (8) — (b).** The pressure term $(p_e - p_a)A_e$ grows as $p_a$ falls;
with $p_a = 0$ the whole term $p_e A_e$ is retained as thrust.
(a) is wrong because there is no significant aerodynamic drag on the exhaust in
the thrust bookkeeping. (c) is wrong because $u_e$ is set by $p_c/p_e$, which
depends on $\varepsilon$ and $\gamma$, not on ambient. (d) is wrong because the
throat is choked and $\dot m$ is fixed by chamber conditions alone.

**Q2 (8) — (c).** $C_f = f(\gamma, \varepsilon, p_a/p_c)$; adding a nozzle
extension changes $\varepsilon$ and nothing upstream of the throat.
(a), (b) and (d) all act on $c^* = \sqrt{RT_0}/\Gamma$ through $T_0$,
$\mathcal{M}$ or combustion completeness. Note (b) is a partial trap: changing
$MR$ also changes $\gamma$ slightly, so it touches $C_f$ a little — but its
first-order effect is on $c^*$, and (c) is the only option with *no* effect on
$c^*$.

**Q3 (10).**
$$\Gamma(1.25) = \sqrt{1.25}\left(\frac{2}{2.25}\right)^{\frac{2.25}{0.50}} = 1.118034 \times (0.888889)^{4.5} = \mathbf{0.65806}$$

The group $\Gamma p_0 A_t/\sqrt{RT_0}$ is the **choked mass flow rate**: the
maximum mass flow that can pass a throat of area $A_t$ given chamber stagnation
conditions $p_0$, $T_0$ and gas properties $\gamma$, $R$. It is independent of
everything downstream of the throat, which is what makes $c^*$ a chamber-only
figure of merit. Full marks require both the number and that statement.

**Q4 (12).** $\gamma = 1.20$, $\varepsilon = 22$: $M_e = 3.8244$,
$p_e/p_c = 4.4840\times10^{-3}$, $p_e = 53\,808$ Pa.

$$C_{f,vac} = 1.73136 + (4.4840\times10^{-3})(22) = \mathbf{1.83000}$$
$$C_{f,SL} = 1.83000 - \frac{101\,325 \times 22}{1.20\times10^7} = 1.83000 - 0.18576 = \mathbf{1.64424}$$
$$\frac{F_{vac}}{F_{SL}} = \frac{1.83000}{1.64424} = 1.1130 \Rightarrow \mathbf{+11.30\%}$$

Note that the increase is exactly $p_a A_e/F_{SL} = p_a\varepsilon/(C_{f,SL}p_c) = 0.18576/1.64424 = 11.30$ %, which is the check every student should do.

**Q5 (12).** $p_c A_t = 9.0\times10^6 \times 0.0125 = 112\,500$ N.
$$c^*_{meas} = \frac{112\,500}{62.0} = \mathbf{1\,814.5\ m/s}, \qquad
C_{f,meas} = \frac{208\,000}{112\,500} = \mathbf{1.84889}$$
$$I_{sp} = \frac{208\,000}{62.0 \times 9.80665} = \mathbf{342.1\ s}$$
$$\eta_{c^*} = \frac{1814.5}{1900} = \mathbf{0.9550}, \quad
\eta_{C_f} = \frac{1.84889}{1.90} = \mathbf{0.9731}, \quad
\eta_{ov} = \mathbf{0.9293}$$

**Investigate the chamber/injector.** $\eta_{C_f} = 0.973$ is normal for a real
nozzle (divergence plus boundary layer plus kinetics accounts for it);
$\eta_{c^*} = 0.955$ means 4.5 % of the chemical energy is not reaching the
throat as stagnation pressure. Candidates in order: mixture-ratio
maldistribution, atomisation, film-cooling flow fraction — and, before any of
those, verify the $p_c$ transducer station and the flowmeter calibration.

**Q6 (10), 2.5 each.**

(a) **False.** $g_0$ is a defined constant (9.80665 m/s²), not local gravity.
$I_{sp}$ in seconds is identical on the Moon.

(b) **False.** Optimum expansion maximises $C_f$ *at a given ambient pressure*.
The maximum possible $C_f$ for a given $\gamma$ is the vacuum,
infinite-expansion limit $C_{f,max} = \sqrt{\frac{2\gamma^2}{\gamma-1}(\frac{2}{\gamma+1})^{\frac{\gamma+1}{\gamma-1}}}$
— 2.2466 at $\gamma = 1.2$ — which no finite nozzle at finite $p_a$ reaches.

(c) **True, to first order** — with a caveat that earns the marks. $F = C_f p_c A_t$, and $C_f$ depends only on $\gamma$, $\varepsilon$ and $p_a/p_c$, so at
fixed $p_c$ and fixed $\varepsilon$ (i.e. $A_e$ doubles too) thrust doubles
exactly. If $A_e$ is held fixed while $A_t$ doubles, $\varepsilon$ halves and
$C_f$ falls, so thrust less than doubles. And holding $p_c$ fixed while
doubling $A_t$ requires doubling $\dot m$, which is a feed-system statement,
not a free choice.

(d) **True.** $c^* = p_c A_t/\dot m$ requires only three measurements — chamber
pressure, throat area, mass flow. $\gamma$ and $T_0$ are needed only to compute
the *ideal* $c^*$ for comparison.

**Q7 (10).** A first stage flies from $p_a = 101$ kPa to effectively zero in
about two minutes, so no fixed nozzle is optimal for more than an instant; the
$C_f$ curve near its peak is flat, so over-expanding costs only ~1–2 % at sea
level while gaining 4–10 % in vacuum, and the vehicle spends most of the burn
at altitude where the gain applies. The designer therefore pushes $\varepsilon$
past the sea-level optimum deliberately. **The limit that stops them is flow
separation** — once $p_e/p_a$ falls below roughly 0.3–0.4 the boundary layer
detaches, and the resulting unsteady, asymmetric separation generates side
loads on the nozzle and gimbal bearing that are a structural problem, not
merely a performance one. (Packaging and mass are also real limits and earn
partial credit, but separation is the *physical* limit asked for.)

**Q8 (10).**

| | change | why |
|---|---|---|
| nozzle length | **shorter** (~80 % of the equivalent cone) | the bell turns the flow back toward axial near the exit, so it does not need the full cone length to reach the same $\varepsilon$ |
| nozzle mass | **lower** | less wall area to build and cool |
| divergence loss | **much lower** — $\lambda$ from ~0.983 to ~0.995 | the exit flow is nearly axial by design [Rao58] |
| boundary-layer loss | **slightly lower or unchanged** | less wetted area (shorter), but higher local Mach numbers and a stronger adverse gradient near the exit partly offset it |

**The most uncertain is the boundary-layer loss.** It is a viscous, Reynolds-
and wall-temperature-dependent quantity that a one-dimensional method cannot
predict; it requires a boundary-layer code or test data, and its sign for a
given contour change is not obvious a priori. The other three follow from
geometry and the divergence integral.

**Q9 (10) — judgment.** Two reasons to withhold judgment:

1. **Measurement uncertainty.** A 0.7 % improvement is inside the typical
   0.8–1.2 % uncertainty on $c^*$ (thrust 0.25–0.5 %, $p_c$ 0.3–0.5 %,
   $\dot m$ 0.5–1 %, $A_t$ 0.2–0.5 %, combined by root-sum-square). The two
   numbers may be statistically indistinguishable.
2. **Confounding variables.** Was anything else different — propellant
   temperature, mixture ratio, throat area after the previous run's erosion,
   a re-calibrated transducer, a different data slice, a different ambient? A
   single before/after pair cannot separate the injector change from any of
   these.

**What to require:** multiple runs of each configuration to establish scatter;
a documented uncertainty budget; the same hardware, instrumentation and data
reduction on both sides; matched operating points ($p_c$, $MR$, propellant
temperatures) verified rather than assumed; and ideally the injector change
tested in both directions (revert and re-fit). If the improvement survives
that, it is real.

**Q10 (10) — judgment.** Neither answer is wrong; the marks are for the
reasoning.

*Case for 80 bar / gas generator.* $c^*$ barely cares about chamber pressure —
maybe 1–2 % between 80 and 250 bar — so the propellant-side performance is
nearly the same. The GG cycle costs 1–3 % of flow overboard, which is a real
$I_{sp}$ hit, but you get a vastly simpler engine: lower pump discharge
pressure, lower turbine power, no oxidiser-rich hot gas and therefore no need
for the enamel-coating technology that only Energomash has demonstrated at
scale. Heat flux scales roughly as $p_c^{0.8}$, so 80 bar is about 40 % of the
250 bar heat load — a far easier cooling problem. Development risk and cost are
much lower. Merlin 1D is the existence proof.

*Case for 250 bar / ORSC.* $A_t = F/(C_f p_c)$ scales as $1/p_c$, so the engine
is roughly a third the throat area and much smaller and lighter for the same
thrust — better thrust-to-weight, better packaging in a clustered base.
$\varepsilon^{opt}$ at sea level rises from ~10 to ~28, so you can carry a much
bigger nozzle without separating, which is worth several per cent of $C_f$ at
altitude on top of the closed cycle's recovery of the GG flow. Total $I_{sp}$
gain over the GG option is of order 8–12 %. RD-180 is the existence proof.

*What decides it:* (i) whether the vehicle is reusable — reuse rewards
$I_{sp}$ and thrust-to-weight enough to justify the cycle, and punishes the GG
turbine's exposure; (ii) the organisation's demonstrated experience with
oxidiser-rich hot-gas materials, which is the actual gate, not the
thermodynamics; (iii) the mission $\Delta v$ margin — if the vehicle closes
comfortably at 80 bar, the 250 bar development cost buys nothing; (iv)
production rate, since a simple engine built 400 times a year may beat an
efficient one built 20 times. A strong answer names the materials issue as the
decider rather than the performance arithmetic.

---

## K3. Trade-study reference solution (P21)

### Setup

$\gamma = 1.21$, $\mathcal{M} = 23.0$ kg/kmol, $T_0 = 3\,550$ K:
$R = 361.5$ J/(kg·K), $\Gamma(1.21) = 0.65047$,
$$c^*_{ideal} = \frac{\sqrt{361.5 \times 3550}}{0.65047} = 1\,741.6\ \mathrm{m/s},
\qquad c^* = 0.96 \times 1741.6 = 1\,671.9\ \mathrm{m/s}$$

Geometry per option: $A_t = F/(C_{f,vac}p_c)$, $R_e = R_t\sqrt{\varepsilon}$,
cone length $L = (R_e - R_t)/\tan 15°$, lateral surface
$S = \pi(R_t + R_e)(R_e - R_t)/\sin 15°$, nozzle mass $= 18S$.

Mission closure: $m_f = M_p/(e^{\Delta v/(I_{sp}g_0)} - 1)$ with
$M_p = 4\,500$ kg and $\Delta v = 3\,600$ m/s; payload
$= m_f - 800 - m_{nozzle}$.

### Results

| | A ($\varepsilon = 40$) | B ($\varepsilon = 80$) | C ($\varepsilon = 130$) | D (130 deployed / 55 stowed) |
|---|---|---|---|---|
| $C_{f,vac}$ | 1.8738 | 1.9244 | 1.9548 | 1.9548 |
| $I_{sp,vac}$ (s) | 319.5 | 328.1 | 333.3 | 333.3 |
| $A_t$ (m²) | 0.011644 | 0.011337 | 0.011162 | 0.011162 |
| $D_t$ (m) | 0.1218 | 0.1201 | 0.1192 | 0.1192 |
| $D_e$ (m) | 0.770 | 1.075 | 1.359 | 1.359 deployed |
| bell length (m) | 1.210 | 1.781 | 2.314 | **1.448 stowed** |
| bell surface (m²) | 1.755 | 3.461 | 5.563 | 5.563 |
| nozzle mass (kg) | 31.6 | 62.3 | 100.1 | **122.1** (incl. 22 kg mechanism) |
| fits $D < 1.45$ m? | yes | yes | yes | yes |
| fits $L < 2.00$ m? | yes | yes | **NO (2.31 m)** | yes (1.45 m stowed) |
| $m_f$ at closure (kg) | 2 087.7 | 2 183.0 | 2 240.2 | 2 240.2 |
| **payload (kg)** | **1 256.1** | **1 320.7** | (1 340.1) | **1 318.1** |

### Recommendation

**Option B, $\varepsilon = 80$, fixed bell.**

**The argument.** Option C has the best payload on paper (1 340 kg) but
**violates the 2.00 m length budget by 0.31 m** and is therefore not a
candidate. That leaves B and D, and the striking result is that they are within
**2.6 kg of payload out of ~1 320 kg — 0.2 %.** D's 5.2 s of extra $I_{sp}$
(333.3 vs 328.1) is almost exactly cancelled by its 59.8 kg of extra nozzle and
mechanism mass.

Once the performance difference is that small, the decision is made entirely by
reliability, cost and schedule, and every one of those points at B:

- D adds a deployment mechanism that must actuate once, in flight, after stage
  separation, with **no abort mode** — if it fails to deploy the stage is
  either stuck with $\varepsilon = 55$ (recoverable, some payload lost) or, in
  a partial deployment, has an asymmetric nozzle and an uncontrollable thrust
  vector (loss of mission). `_verify-liquid` records exactly this criticism of
  the RL10B-2: "a single-point failure with no meaningful abort mode".
- D adds carbon–carbon manufacturing, a translation mechanism, and a
  deployment qualification programme to a *small launcher*, which is precisely
  the class of vehicle least able to absorb that cost.
- B is a plain fixed bell that fits, with 0.22 m of length margin and 0.37 m of
  diameter margin.

**Quantified difference against the runner-up:** B beats D by 2.6 kg of payload
(+0.2 %) and beats A by 64.6 kg (+5.1 %).

**What would flip the recommendation.** Any of:

- **A longer engine bay.** At 2.40 m, option C becomes legal and wins outright
  by 19 kg over B with no mechanism at all. This is the single highest-value
  change and should be raised with the vehicle team before the nozzle is
  frozen — a 0.4 m stretch of an interstage is usually cheaper than an
  extendible nozzle.
- **A lighter nozzle.** The 18 kg/m² figure is the whole argument. At
  10 kg/m² (a thin radiatively cooled niobium or C–C extension rather than a
  cooled metallic one), D's mass penalty shrinks and D beats B by roughly
  25 kg. A student who identifies the mass model as the sensitive assumption
  and says so has understood the problem.
- **A higher required $\Delta v$.** The payload sensitivity to $I_{sp}$ grows
  with $\Delta v$; above roughly 4 500 m/s the 5.2 s starts to outweigh the
  60 kg.
- **Reuse or a second burn** that changes the mass accounting.

### Rubric

A strong answer must contain:

- All four $C_{f,vac}$ values computed, not estimated from a chart, and the
  observation that $C_f$ is nearly flat from 80 to 130 (+1.6 % for a 63 %
  increase in area ratio).
- Both packaging constraints checked explicitly, and option C **eliminated on
  length**, not on performance.
- A payload number for every feasible option, from the rocket equation, with
  the nozzle mass actually included in the burnout mass.
- The recognition that B and D are effectively tied, and a decision made on
  reliability grounds with the argument stated.
- A named sensitivity: which single assumption, if changed, flips the answer.

Marks are lost for: recommending C without noticing it does not fit;
recommending D on $I_{sp}$ alone without carrying its mass; treating "0.9 kg
payload per kg" style rules of thumb as a substitute for the rocket equation
when the mission model is given; failing to state the deployment reliability
argument; and quoting $I_{sp}$ to more figures than the $\eta_{c^*} = 0.96$
assumption supports.

An answer that recommends **D** can still earn full marks **if** it argues that
the 2.6 kg deficit is inside the uncertainty of the 18 kg/m² mass model — which
is true — and then makes the case that the extendible architecture buys growth
margin for later blocks. That is a defensible engineering position. What is not
defensible is choosing D without noticing that on the stated numbers it loses.

---

## K4. Common wrong answers, and what they reveal

**"Thrust increases in vacuum because there is no air resistance."**
Reveals that the student has not internalised the thrust equation. There is no
drag term in it; the entire effect is $p_a A_e$. This answer usually travels
with the belief that rockets push against air.

**Dividing by $g_0$ twice, or using local gravity.**
Writing $I_{sp} = F/(\dot m g)$ with $g = 9.81$ "at sea level" and then
worrying about altitude. Reveals that $g_0$ is being treated as a physical
gravity rather than a defined unit-conversion constant. Symptom: answers that
change with altitude by 0.3 %.

**Getting the sign of $\eta_{c^*}$ backwards on mass flow (P8d).**
Concluding that poor combustion efficiency means *less* mass flow. Reveals that
$c^*$ is being thought of as a velocity that the gas has, rather than as
$p_c A_t/\dot m$. Cure: always write the defining ratio before reasoning about
direction.

**Computing $C_{f,ideal}$ for a separated nozzle and reporting the resulting
$\eta_{C_f}$.**
Produces efficiencies above 1.0 (because a separated nozzle outperforms the
ideal attached calculation at that $\varepsilon$) and the student reports them
without alarm. Reveals no separation check in the workflow. Any $\eta > 1$
should stop the calculation immediately.

**Treating $\varepsilon$ and $p_c/p_e$ as independent inputs.**
Specifying both, and then being surprised they disagree. For a given $\gamma$,
one determines the other through the area–Mach relation. Reveals that Module 02
was not absorbed.

**Believing $c^*$ improves substantially with chamber pressure.**
Attributing the RD-180's performance to 267 bar raising $c^*$. It raises $c^*$
by 1–2 %; what it really does is shrink the engine and permit a much larger
sea-level $\varepsilon$. Reveals confusion between chemical performance and
nozzle performance — the exact confusion the $c^*$/$C_f$ split exists to
prevent.

**Reporting a reconstructed $\eta_{ov}$ above 0.99 without comment.**
The RD-180 case in P10. Reveals a student who trusts arithmetic over physics.
An efficiency that high means the *inputs* are wrong, and the correct response
is to distrust the assumed $\gamma$, $T_0$ and $\mathcal{M}$.

**Quoting engine numbers without their caveats.**
Writing "the F-1 ran at 70 bar" or "the RS-25 has $\varepsilon = 69$" flat, when
`_verify-liquid` marks the first as contested across 965–1 125 psia and the
second as contested between 69, 77.5 and 78. Reveals a student who has not
learned that in this field the provenance of a number is part of the number.
In an interview this is the difference between someone who has read a datasheet
and someone who has worked with one.

**Using $L^*$ as if it were a chamber length.**
Multiplying $L^*$ by something, or comparing $L^*$ directly to $L_c$. It is
$V_c/A_t$ — a volume over an area — and two chambers with the same $L^*$ can
have very different shapes and very different performance. Reveals that the
empirical, calibrated nature of the parameter has not landed.

**Ignoring nozzle mass in a trade study.**
Choosing the largest feasible $\varepsilon$ every time. Reveals that the
student is optimising the engine rather than the vehicle. The correct instinct,
every time, is to carry the mass through the rocket equation — as P21
demonstrates, the answer can invert.
