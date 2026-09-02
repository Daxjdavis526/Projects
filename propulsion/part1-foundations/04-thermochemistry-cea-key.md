# Module 04 — Thermochemistry and CEA · Answer key

Solutions to the problems and quiz in
[04-thermochemistry-cea.md](04-thermochemistry-cea.md). Do not read this until you have
written your own answers down.

---

## K1. Problem solutions

### Conceptual

**C1.** $c^* \propto \sqrt{T_0/\mathcal{M}}/\Gamma(\gamma)\cdot\sqrt{R_u}$, and $T_0$ is
identical, so the ratio is $\sqrt{\mathcal{M}_B/\mathcal{M}_A} = \sqrt{22/12} = 1.354$:
combination A gives 35 % more $c^*$. $\gamma$ cannot rescue B because $\Gamma(\gamma)$
varies only from about 0.63 to 0.68 across every chemical rocket exhaust — a 7 % span
against a 35 % effect. Even the most favourable plausible $\gamma$ difference moves the
answer by a few percent. What a grader wants: the square-root scaling stated explicitly,
the numerical ratio, and the bound on the $\Gamma$ effect rather than a hand-wave.

**C2.** The dominant dissociation reactions create moles of gas: H$_2$O → H$_2$ + ½O$_2$
has $\Delta n = +\tfrac12$; H$_2$ → 2H has $\Delta n = +1$. Le Chatelier: raising the
pressure of a system that reacts by increasing its mole count pushes the equilibrium back
toward the fewer-moles side, i.e. toward the recombined products. Less dissociation means
less enthalpy locked in broken bonds, so more of the heat release appears as sensible
heat and $T_0$ rises.

The saturation: $\alpha \to 0$ as $p \to \infty$, but the flame temperature does not rise
without bound because it is asymptoting to the *no-dissociation* adiabatic flame
temperature — 3926 K for the $r=6$ case (§5.2), which is the ceiling. Each successive
factor of ten in pressure buys less, because the remaining dissociation to suppress is
smaller: 20 → 200 bar bought 254 K, and 200 → 2000 bar would buy well under 150 K, most
of which is unreachable because the material and structural cost of chamber pressure
grows much faster than that. [J]

**C3.** *Strongest version:* in equilibrium flow, every joule absorbed by dissociation in
the chamber is returned by recombination in the nozzle before the gas exits. Total
enthalpy is conserved, and $I_{sp}$ depends on the total enthalpy drop from chamber
stagnation to exit static, so dissociation is bookkeeping and cancels exactly.

*Where it fails:* three places.

1. **It does not all come back.** Recombination is a finite-rate process. The flow freezes
   somewhere in the diverging section (§3.7), and whatever is still dissociated at the
   freezing point is carried out of the nozzle as chemical energy — 17.5 s in the §3.7
   example between the two bounds.
2. **Even in true equilibrium, the argument is incomplete.** Dissociation changes
   $\mathcal{M}$ and $\gamma$ as well as $T$, and the exit state on an isentrope from a
   dissociated chamber is not the same exit state as on an isentrope from an
   undissociated one at the same enthalpy. The exhaust is genuinely a different gas.
3. **It ignores everything else that depends on $T_0$.** Even if $I_{sp}$ were unaffected,
   $T_0$ sets the gas-side heat flux, the wall temperature, and therefore the cooling
   design. A 324 K error there is not neutral.

The colleague is *nearly* right about equilibrium flow $I_{sp}$ specifically — the
sensitivity of $I_{sp}$ to dissociation really is much weaker than the sensitivity of
$T_0$ — and saying so is worth marks. Concluding that it can be ignored is not.

**C4.** (i) $r$ is the quantity the hardware sets and the control system trims — orifice
areas and pump discharge pressures produce a mass-flow split, not an equivalence ratio.
(ii) $r$ maps directly to tank volumes, $(r/\rho_o):(1/\rho_f)$, which is what sizes the
stage. (iii) $r_{st}$ is ill-defined for RP-1 and for any propellant specified by
properties rather than formula, so $\phi$ inherits an uncertainty $r$ does not have.
(iv) The optimum is nowhere near $\phi=1$, so the normalisation buys no intuition.

**Reason (i) still applies** even if every propellant were a pure compound: the injector
and the pumps still set mass flows. Reason (ii) also survives; reasons (iii) and (iv) are
the ones that would weaken. A strong answer names (i) as the one that survives, because
it is a statement about hardware rather than about chemistry.

**C5.** The equilibrium $c_p$ includes a *reaction* term: heating the mixture at constant
pressure both raises its temperature and shifts its composition further toward
dissociation, and the enthalpy of that shift is charged to $c_p$. The frozen value is the
mixture-averaged $c_p$ of the species as they stand.

(a) **Bartz:** use the **frozen** value, or at least know which one Bartz's correlation
was calibrated against. Bartz's correlation is a Nusselt-number form fitted with
conventional gas properties [Bartz57]; feeding it a reaction-inflated $c_p$ roughly
doubles the predicted heat-transfer coefficient. [J]

(b) **Nozzle isentropic relations:** neither $c_p$ directly — use `GAMMAs`, which is
built from the equilibrium $c_p$ *and* the two volume derivatives (Eq. 3.8), and is the
only exponent that makes $pV^\gamma = $ const locally true.

(c) **Enthalpy loss to the wall:** use the **equilibrium** value, because on the
timescale of chamber residence the composition really does re-equilibrate as the gas
cools. $\Delta T \approx \Delta h/c_{p,eq} = 0.01 \times 986/7.32 \approx 1.3$ K — which
is also the answer to "does chamber heat loss matter for $T_0$?": no.

**C6.** They are optimising different objective functions.

The RL10 is an upper-stage engine: its stage is small, the $\Delta V$ is applied high in
the gravity well where $I_{sp}$ has maximum leverage, and its tank penalty per second of
$I_{sp}$ is low. It therefore sits essentially on the theoretical $I_{sp}$ optimum
($r \approx 5$). It is also a closed expander, where hydrogen flow *is* turbine power, so
a lower $r$ is cycle-convenient as well.

The RS-25 is a core-stage engine on a vehicle whose hydrogen tank dominates length,
insulated area, aerodynamic load and dry mass. Moving from 5.0 to 6.03 cuts hydrogen
volume by about 20 % for a cost of 1–2 s of $I_{sp}$, and the vehicle-level payload
derivative makes that trade clearly positive. It is also fuel-rich staged combustion,
where the main-chamber $r$ is the outcome of a preburner/turbine/coolant power balance
rather than a free choice.

Both are right because "optimum" is only defined relative to a stated objective, and the
two stages have different ones. A strong answer names the objective in each case.

**C7.** $(\partial \ln V/\partial \ln p)_T = -1.00000$ is the ideal-gas value for a
**non-reacting** mixture: at fixed temperature, halving the pressure exactly doubles the
volume, no more. Printing exactly $-1$ at the exit says CEA found *no composition change*
from a pressure perturbation there — the chemistry is finished, the exhaust is a frozen
mixture of stable species, and any further expansion is pure gas dynamics.

A value of $-1.004$ at the exit would mean the exhaust is still reacting: there is still
recoverable chemical energy leaving the nozzle, the equilibrium and frozen answers still
differ meaningfully at that station, and the kinetic (finite-rate) loss is likely to be
larger than usual. It would also warn you that extending the nozzle would recover more
than the pure area-ratio gain suggests. Practically, you would see it on a very hot, very
fuel-rich, or low-area-ratio case.

**C8.** Both are optimistic because CEA expands the products as a **single fluid**: the
condensed Al$_2$O$_3$ is assumed to be at the same velocity and the same temperature as
the gas at every station. In reality the particles are ~1–10 µm, have far more inertia per
unit drag area than the gas, and accelerate more slowly (velocity lag) and cool more
slowly (thermal lag). Particles that leave the nozzle slower than the gas contribute less
momentum than CEA credits them with, and particles that leave hotter than the gas carry
away enthalpy that never became kinetic energy.

The loss neither bound captures is the **two-phase flow loss**, typically 1–5 % of
$I_{sp}$ for an aluminised composite propellant, and it is a function of particle size
distribution and nozzle scale — it gets worse for small motors, because the residence
time available for the particles to equilibrate with the gas is shorter relative to the
relaxation time. It is computed with a separate two-phase nozzle code, not by choosing a
different CEA option. See Module 24.

### Calculation

**N1.** Ethanol: C$_2$H$_5$OH, $\mathcal{M} = 2(12.011) + 6(1.008) + 15.999 = 46.069$
kg/kmol. Note it already contains one oxygen atom.

$$\mathrm{C_2H_5OH} + 3\,\mathrm{O_2} \longrightarrow 2\,\mathrm{CO_2} + 3\,\mathrm{H_2O}$$

Check oxygen: right side has $4 + 3 = 7$ atoms; left side has 1 (from the fuel) $+\;6$
(from 3 O$_2$) $= 7$. ✓ Forgetting the fuel's own oxygen and writing 3.5 O$_2$ is the
classic error here.

$$r_{st} = \frac{3 \times 31.998}{46.069} = \frac{95.994}{46.069} = 2.084$$

At the V-2's $r = 1.18$, treating the fuel as pure ethanol gives
$\phi = 2.084/1.18 = 1.77$ — extraordinarily rich.

But the fuel is 75 % ethanol / 25 % water by mass. Per kg of fuel there is only 0.75 kg of
ethanol, needing $0.75 \times 2.084 = 1.563$ kg of oxygen, so the stoichiometric ratio
*of the actual fuel* is $r_{st} = 1.563$ and $\phi = 1.563/1.18 = 1.32$ — squarely in the
normal band for a fuel-rich engine.

**What the water does:** it is inert ballast and a heat sink. It absorbs sensible
enthalpy and its own latent heat, dropping $T_0$ by several hundred kelvin, which is
exactly what a 1942 engine with a mild-steel chamber and marginal film cooling needed. It
costs $I_{sp}$ twice over — it is dead mass and it lowers $T_0$ — and it was accepted
because chamber survival, not performance, was the binding constraint. The dilution was
also convenient industrially: 75 % ethanol is a standard product and does not require the
final dehydration step. [H]

**N2.** Basis 1 kmol CH$_4$ = 16.043 kg. Oxidizer mass $= 3.6 \times 16.043 = 57.755$ kg
$= 57.755/31.998 = 1.8050$ kmol O$_2$.

Complete combustion needs 2 kmol O$_2$ per kmol CH$_4$, and we have only 1.805, so
oxygen is the limiting reactant (as it must be — $r = 3.6 < r_{st} = 3.989$). Burning
$x$ kmol of CH$_4$ completely consumes $2x$ O$_2$, so $x = 0.9025$:

$$0.9025\,\mathrm{CH_4} + 1.8050\,\mathrm{O_2} \to 0.9025\,\mathrm{CO_2} + 1.8050\,\mathrm{H_2O},
\quad \text{plus } 0.0975\ \mathrm{CH_4} \text{ unburnt}$$

Total moles $= 0.9025 + 1.8050 + 0.0975 = 2.8050$ kmol; total mass
$= 16.043 + 57.755 = 73.798$ kg.

$$\mathcal{M} = \frac{73.798}{2.8050} = 26.31\ \mathrm{kg/kmol}$$

**Why the real $\mathcal{M}$ is much lower** (CEA gives roughly 22–23 for methalox at
$r=3.6$): the assumed product list is chemically absurd. At 3500 K, methane does not
survive — it pyrolyses in microseconds. A fuel-rich methane flame does not partition into
"fully burnt" and "untouched CH$_4$"; it reaches equilibrium among CO, CO$_2$, H$_2$O,
H$_2$, OH, H and O. The two big effects both cut $\mathcal{M}$: (i) the shift from CO$_2$
(44) to CO (28) converts one heavy molecule into a lighter one *and* liberates half an
oxygen to make more light species; (ii) the excess hydrogen appears as H$_2$
($\mathcal{M} = 2$), which is the single most powerful mole-count multiplier available.
Dissociation to OH and H cuts it further. The lesson is general: **assuming an unrealistic
product list biases $\mathcal{M}$ high, and therefore $I_{sp}$ low**, in the opposite
direction to the flame-temperature error. The two errors do not reliably cancel.

**N3.** Basis 1 kmol O$_2$ = 31.998 kg; fuel $= 31.998/5.0 = 6.3996$ kg
$= 3.1744$ kmol H$_2$.

Products: 2 H$_2$O + 1.1744 H$_2$; $n = 3.1744$ kmol; mass 38.398 kg;
$\mathcal{M} = 12.096$ kg/kmol.

Reactant enthalpy: $-12{,}979 + 3.1744(-9012) = -41{,}587$ kJ.

Available: $483{,}652 - 41{,}587 = 442{,}065$ kJ.

To 1000 K: $2(25{,}980) + 1.1744(20{,}680) = 51{,}960 + 24{,}287 = 76{,}247$ kJ.
Above 1000 K: $442{,}065 - 76{,}247 = 365{,}818$ kJ.

$$A = 2(42.88) + 1.1744(28.43) = 119.15\ \mathrm{kJ/K}, \qquad
B = 2(4.414\times10^{-3}) + 1.1744(2.861\times10^{-3}) = 1.2188\times10^{-2}$$

$$6.094\times10^{-3}T^2 + 119.15\,T - 491{,}061 = 0$$
$$T = \frac{-119.15 + \sqrt{14{,}197 + 11{,}969}}{1.2188\times10^{-2}} = \frac{42.61}{1.2188\times10^{-2}} = \boxed{3496\ \mathrm{K}}$$

Equilibrium gives 3356 K, so the hand answer is **140 K (4.2 %) high**.

Note the trend, which is the point of the problem: at $r=6$ the error was 324 K (9.0 %);
at $r=5$ it is 140 K (4.2 %). Dissociation is strongly nonlinear in temperature (the
$K_p$ table in §3.5 rises by a factor of 4 from 3000 to 3600 K), so the hand calculation
degrades rapidly as you approach stoichiometric and is nearly adequate for cool storable
propellants. Full marks require noticing that.

**N4.** $R(5.0) = 8314.46/11.904 = 698.46$ J/(kg·K); $R(7.0) = 8314.46/15.120 = 549.90$
J/(kg·K).

$\Gamma(1.1672) = \sqrt{1.1672}(2/2.1672)^{2.1672/0.3344} = 1.08037 \times 0.59432 = 0.64208$
$\Gamma(1.1371) = \sqrt{1.1371}(2/2.1371)^{2.1371/0.2742} = 1.06635 \times 0.59647 = 0.63604$

$$c^*(5.0) = \frac{\sqrt{698.46 \times 3356}}{0.64208} = \frac{1531.0}{0.64208} = 2384\ \mathrm{m/s}\quad(\text{table } 2382,\ 0.1\,\%)$$
$$c^*(7.0) = \frac{\sqrt{549.90 \times 3721.9}}{0.63604} = \frac{1430.6}{0.63604} = 2249\ \mathrm{m/s}\quad(\text{table } 2250,\ 0.05\,\%)$$

Percentage changes from $r=5$ to $r=7$:

| quantity | at 5.0 | at 7.0 | change |
|---|---|---|---|
| $T_0$ | 3356 | 3721.9 | $+10.9\,\%$ |
| $\mathcal{M}$ | 11.904 | 15.120 | $+27.0\,\%$ |
| $T_0/\mathcal{M}$ | 281.9 | 246.2 | $-12.7\,\%$ |
| $\sqrt{T_0/\mathcal{M}}$ | 16.79 | 15.69 | $-6.6\,\%$ |
| $\Gamma$ | 0.64208 | 0.63604 | $-0.94\,\%$ |
| $c^*$ | 2384 | 2249 | $-5.6\,\%$ |

Verification: $-6.6\,\% + 0.94\,\% = -5.7\,\%$, against the direct $-5.6\,\%$. ✓ $c^*$
tracks $\sqrt{T_0/\mathcal{M}}$ with a sub-1 % correction from $\Gamma$, exactly as
Eq. 3.2 says.

**N5.** At 3000 K, $K_p = 10^{-1.349} = 0.04477$. Solve Eq. 3.7 at $p = 100$ bar:

$$\frac{\alpha(\alpha/2)^{1/2}}{1-\alpha}\left(\frac{100}{1+\alpha/2}\right)^{1/2} = 0.04477$$

Iterating: $\alpha = 0.030 \to 0.0392$; $\alpha = 0.035 \to 0.0476$;
$\alpha = 0.0337 \to 0.0448$. So $\boxed{\alpha \approx 0.034}$.

At 3600 K, $K_p = 0.2414$, and the same iteration gives $\alpha = 0.100$: try
$\alpha = 0.10$, LHS $= (0.10)(0.2236)/(0.90) \times (100/1.05)^{1/2}
= 0.02485 \times 9.759 = 0.2425$. ✓ So $\boxed{\alpha \approx 0.10}$.

**Which has more leverage.** Raising $T$ by 600 K (a factor 1.20) tripled $\alpha$.
Raising $p$ by a factor of ten at fixed 3600 K (§3.5 table: 20 bar → 200 bar) only halved
it, from 0.164 to 0.080. **Temperature dominates, by a wide margin.**

The reason is structural. $K_p = \exp(-\Delta G^\circ/R_uT)$ is *exponential* in $1/T$
with a large $\Delta H^\circ$ (about 250 MJ/kmol here), so $K_p$ changes by orders of
magnitude over a few hundred kelvin. Pressure enters Eq. 3.7 only algebraically, through
$p^{\Delta n} = p^{1/2}$, so at small $\alpha$ the balance $\alpha^{3/2} \propto p^{-1/2}$
gives $\alpha \propto p^{-1/3}$ — a tenfold pressure change moves $\alpha$ by only a
factor of 2.15. That $p^{-1/3}$ is worth remembering: it is why chamber pressure is a
weak lever on flame temperature and a strong one on $C_F$.

**N6.** $r = 850/340 = 2.500$. $\dot m = 850 + 340 = 1190$ kg/s.

$$c^*_{del} = \frac{p_c A_t}{\dot m} = \frac{68.0\times10^5 \times 0.3050}{1190} = \frac{2.074\times10^6}{1190} = 1743\ \mathrm{m/s}$$

$$\eta_{c^*} = \frac{1743}{1795} = \boxed{0.971}$$

**Acceptable.** 97.1 % is normal-to-good for a kerolox impinging-element injector
(the band is 0.96–0.98, §3.10), and if the engine uses fuel-film cooling at the wall then
some of the 2.9 % is a deliberate purchase rather than a defect. It is not good enough for
a hydrogen coaxial-shear injector, where you would expect 0.98–0.995, so the number only
means "acceptable" once you know what kind of injector you are grading.

**With the cold throat area** ($0.3050 \times 0.993 = 0.3029$ m²):
$c^*_{del} = 1731$ m/s and $\eta_{c^*} = 0.964$. A 0.7 % error in throat area is a 0.7 %
error in $\eta_{c^*}$, straight through. That is the same size as the difference between
a good injector and a mediocre one, which is why hot throat area — measured or computed
from thermal growth and erosion — is not an optional refinement. Report it, or your
efficiency number is not comparable with anyone else's.

**N7.** From the sea-level column: 380.9 (ε=5), 395.8 (10), 395.2 (20), 384.5 (30). The
maximum lies between ε = 10 and ε = 20, near **ε ≈ 13–15**, at about **396 s**.

Exit pressure there. Interpolating logarithmically between $p_e = 1.5918$ bar at ε = 10
and 0.6338 bar at ε = 20, the exponent is
$k = \ln(0.6338/1.5918)/\ln 2 = -1.329$, so at ε = 14:

$$p_e = 1.5918 \times 1.4^{-1.329} = 1.5918 \times 0.639 = 1.02\ \mathrm{bar}$$

**Comment.** $p_e = 1.02$ bar and $p_a = 1.013$ bar: **the sea-level $I_{sp}$ maximum
occurs exactly where the nozzle is perfectly expanded.** That is not a coincidence in the
data; it is a theorem. Differentiating $F = \dot m v_e + (p_e - p_a)A_e$ with respect to
$A_e$ along the nozzle contour gives $dF/dA_e = (p_e - p_a)$, which is zero precisely at
$p_e = p_a$. Recovering that result from a table of numbers is the point of the problem;
quoting it from memory without checking is worth half marks.

**N8.** The gas generator dumps 4 % of total flow at 180 s; 96 % goes through the main
chamber and nozzle at $I_c$:

$$340 = 0.96\,I_c + 0.04(180) = 0.96\,I_c + 7.2 \quad\Rightarrow\quad I_c = \frac{332.8}{0.96} = 346.7\ \mathrm{s}$$

So the cycle efficiency is $\eta_{cycle} = 340/346.7 = 0.981$, and

$$\eta_{c^*}\,\eta_{C_F} = \frac{346.7}{366} = 0.9472 \quad\Rightarrow\quad
\eta_{C_F} = \frac{0.9472}{0.965} = \boxed{0.981}$$

**Verdict: good, at the top of the normal band.** §3.10 puts $\eta_{C_F}$ at 0.95–0.99;
98.1 % implies an optimised bell contour with modest divergence loss, a healthy
throat-Reynolds-number regime, and no separation. The interesting observation is the
arithmetic: the *cycle* costs 1.9 % and the *nozzle* costs 1.9 %, so half of this
engine's total 7.1 % shortfall from CEA is a cycle choice made on a whiteboard years
before any hardware existed. That is the argument for staged combustion in one line.

### Engineering reasoning

**R1.** Ranked by likelihood:

1. **One of them is quoting `Isp` and the other `Ivac`.** In the §3.9 block those two rows
   differ by 16.3 s at ε = 77.5 — almost exactly the gap in question. This is the single
   most common CEA reading error and it should be your first hypothesis. *Check:* which
   row was copied. If the block is not available, ask whether the quoted number includes
   the $p_eA_e$ term.
2. **Reactant phase or temperature.** Gaseous O$_2$/H$_2$ at 298.15 K versus cryogenic
   liquids is 250 K of flame temperature (§5.2), worth roughly 1.7 % on $c^*$ and 7–8 s
   of $I_{sp}$. *Check:* the `TEMP` and `ENERGY` columns of the reactant table. This is a
   large enough effect to explain half the gap on its own, and it combines with others.
3. **Frozen versus equilibrium, or a different `nfz` station.** 17.5 s in the §3.7
   example, but both runs are *labelled* equilibrium, so this requires the label to be
   wrong — possible if one run used `nfz=2` (freeze at the throat) and the header was
   copied from the equilibrium half of a combined run. *Check:* whether `M, (1/n)` changes
   between the throat and exit columns. If it is constant, the run is frozen regardless of
   the header.
4. **Different chamber pressure, or infinite-area versus finite-area combustor.**
   The `fac` option costs a fraction of a percent, 1–2 s. Too small alone; a contributor.
   *Check:* the `Pinj` line and whether an `INJECTOR` column is present.
5. **Different reactant thermochemistry** — for RP-1, a different empirical formula and
   heat of formation. Worth about 1 s. *Check:* the reactant name and `ENERGY`.

The **one line to check first in both blocks is the reactant table**, because it settles
hypothesis 2 and is where a silent error is most likely; the one *number* to check first
is whether the quoted figure is on the `Ivac` or the `Isp` row.

**R2.** **The $\eta_{c^*}$ curve.** An inverted parabola peaking at $r = 2.4$ is the
signature of an injector whose *mixing* is optimised for a design momentum ratio. Injector
element performance — impingement point, spray fan overlap, momentum ratio — is set by the
relative velocities of the two streams, which change as you move $r$ away from the design
point at fixed $p_c$. At $r = 2.0$ there is more fuel than the element was designed to
atomise and disperse; at $r = 2.8$ there is more oxidizer. Both give a broader distribution
of local mixture ratios, and because $c^*(r)$ is concave, spreading the local mixture ratio
always reduces the mean $c^*$. The 3.5-point drop at $r=2.0$ is somewhat larger than the
2.0-point drop at 2.8, which is consistent with kerosene being the harder of the two to
vaporise.

**The thermocouple trend.** Monotonic rise across the whole sweep, with no peak, is
exactly right: $T_0$ for kerolox rises monotonically with $r$ toward stoichiometric at
3.41, and gas-side heat flux follows. The absence of a peak *confirms* that the whole
sweep stayed fuel-rich, which is a useful independent check that the flowmeters are not
lying about which side of stoichiometric you are on.

**Recommendation:** operate at **$r \approx 2.35$–2.40**, i.e. at or just fuel-rich of the
$\eta_{c^*}$ peak. Taking the peak exactly gives best combustion efficiency; biasing
slightly rich costs a fraction of a point of $\eta_{c^*}$ and buys wall margin, and the
excursion box is then centred with more margin on the hot side, where the consequences are
asymmetric — a cold excursion costs performance, a hot one costs hardware.

**Additional data wanted:**
- **Delivered $I_{sp}$ (or $C_F$) across the same sweep.** $\eta_{c^*}$ peaking at 2.4
  does not prove $I_{sp}$ peaks at 2.4; theoretical $c^*$ is still falling with $r$ over
  this range, so the *delivered* optimum may sit lower.
- **Coolant outlet temperature and channel wall temperature**, to find where the coking
  margin runs out — the binding constraint may be the coolant, not the gas side.
- **Stability rating (bomb or pulse-gun tests) at each $r$**, because a hotter mixture is
  a stronger instability driver and the stability boundary may cut the range before either
  performance or cooling does.
- **Repeat points and flowmeter recalibration**, because a monotonic instrument bias
  would tilt the whole $\eta_{c^*}$ curve and could move the apparent peak by 0.1 in $r$.

**R3.** **The calculation to demand.** Not "2.4 s of $I_{sp}$ versus 1.1 m of tank" —
those are not commensurable quantities. Demand a **payload delta**:

$$\Delta m_{pl} = \frac{\partial m_{pl}}{\partial I_{sp}}\,\Delta I_{sp} + \frac{\partial m_{pl}}{\partial m_{dry}}\,\Delta m_{dry}$$

evaluated for this vehicle on its reference mission, with both partials computed from the
same trajectory model, not from rules of thumb.

**Three quantities needed from the vehicle side:**
1. The stage's $\Delta V$ and mass ratio, which set $\partial m_{pl}/\partial I_{sp}$
   through the rocket equation — the higher the $\Delta V$, the more a second of $I_{sp}$
   is worth, and for a hydrogen upper stage it is worth a lot.
2. The stage's **dry mass per metre of tank barrel**, including the tank wall, the
   insulation, the associated structure and the aerodynamic-load-driven mass — not just
   the barrel skin, which is the number engine people usually get quoted and which is far
   too small.
3. $\partial m_{pl}/\partial m_{dry}$ for this stage, which is close to $-1$ for an upper
   stage but is not $-1$, and is much smaller in magnitude for a booster.

**Also demand from the engine side:** the wall heat flux and coolant margin at $r = 5.8$
across the whole mixture-ratio excursion box, the turbine inlet temperature and cycle
power balance at the new point, and whether the injector's design momentum ratio still
lands near its $\eta_{c^*}$ peak — the CEA $\Delta I_{sp}$ of 2.4 s is theoretical, and a
1 % loss of $\eta_{c^*}$ from an off-design injector would be 4.5 s and would swamp it.

**Condition under which the trade is clearly good:** when $\Delta m_{pl} > 0$ with margin
after the engine-side penalties are included, *and* the wall and turbine limits are still
met at the hot corner of the excursion box, *and* the injector's $\eta_{c^*}$ has been
measured at the new $r$ rather than assumed. Absent the third, you are trading a certain
2.4 s against an unquantified risk of several more.

**Counter-argument worth stating:** on a stage that is volume-constrained by a fairing or
a launch-mount rather than by mass, the 1.1 m may be worth far more than any payload
partial suggests — it may be the difference between fitting and not fitting. If that is
the situation, say so; it is a hard constraint, not a trade.

**R4.** Measured 285 s is **below both bounds**, which immediately tells you the answer is
not "we should have used frozen instead of equilibrium". Something outside the CEA model
is taking 7 s (2.4 %) below even the pessimistic bound.

*Explanation 1 — nozzle and viscous losses.* At 22 N with $\varepsilon = 100$, the throat
diameter is of order 1 mm. The boundary layer occupies a large fraction of the exit area,
the throat Reynolds number is low, and the divergence and friction losses that are 1–2 %
on a large engine are 5–10 % on this one. Radiation heat loss from a radiatively cooled
chamber and nozzle also breaks the adiabatic assumption in a way it does not on a
regeneratively cooled engine, where the heat comes back.

*Explanation 2 — combustion efficiency.* Small hypergolic thrusters have very short
residence times and often deliberately heavy fuel-film cooling of the wall, so a real
$\eta_{c^*}$ of 0.94–0.97 is normal. If the quoted 285 s came from pulsed rather than
steady-state firing, the start and shutdown transients alone can cost 10–30 % at short
pulse widths, which would dwarf everything else.

*The measurement that distinguishes them:* **measure $c^*$ directly** from steady-state
chamber pressure, hot throat area and the two propellant flows. $c^*$ is blind to
everything downstream of the throat, so a healthy $\eta_{c^*}$ with low delivered $I_{sp}$
convicts the nozzle, and a low $\eta_{c^*}$ convicts the injector or the residence time.
Instrumenting $p_c$ on a 22 N thruster is intrusive, so the practical version is a
short-nozzle (low-$\varepsilon$) comparison firing, which isolates $C_F$.

*Which I would bet on:* **the nozzle, with the caveat about pulse mode.** At this scale
$C_F$ losses are the dominant term and they scale the wrong way with size; combustion in a
hypergolic thruster is fast and usually fine. But the first question I would actually ask
is whether the 285 s was measured steady-state or pulsed, because if it was pulsed the
entire comparison against a steady-state CEA number is invalid and no further physics is
needed to explain it.

---

## K2. Quiz answers

**Q1 (8) — (c) 7.9.** $r_{st} = 31.998/(2\times2.016) = 7.936$.
(a) 4.0 is roughly the methalox value. (b) 6.0 is the RS-25's *operating* ratio, and
choosing it is the diagnostic error this whole module exists to prevent — it means you
have confused where engines run with where the chemistry balances. (d) 8.9 has no
referent; it is 8 with the molar masses fumbled.

**Q2 (8) — (b).** `GAMMAs` is $-(\partial \ln p/\partial \ln V)_s$, the local isentropic
exponent of the *reacting* mixture (Eq. 3.8).
(a) is the frozen $c_p/c_v$, which for the §3.9 chamber is 1.191 against `GAMMAs` 1.147 —
a real 4 % difference. (c) is $T_0/T$, a flow quantity, not a property. (d) confuses
$\gamma$ with the vandenkerckhove function $\Gamma(\gamma) = 0.638$ — a different symbol
and a different number.

**Q3 (10) — 2324 m/s.**
$R = 8314.46/13.619 = 610.50$ J/(kg·K).
$\Gamma = \sqrt{1.1473}\,(2/2.1473)^{2.1473/0.2946} = 1.07112 \times 0.59578 = 0.63815$.
$c^* = \sqrt{610.50 \times 3601.60}/0.63815 = 1482.8/0.63815 = \boxed{2324\ \mathrm{m/s}}$.
Full marks require the units on $R$ and the correct exponent
$(\gamma+1)/(2(\gamma-1)) = 7.289$; the most common slip is $(\gamma+1)/(\gamma-1)$,
which gives $\Gamma = 0.355$ and a $c^*$ of 4180 m/s — physically impossible and worth
catching from the magnitude alone.

**Q4 (10) — $c^*$ falls by 6.7 %.**
$R(8) = 8314.46/16.383 = 507.51$; $\Gamma(1.1345) = 0.63553$;
$c^* = \sqrt{507.51\times3743.6}/0.63553 = 1378.4/0.63553 = 2169$ m/s.
$2169/2324 = 0.9334$, i.e. $\boxed{-6.7\,\%}$.

Sign explanation: from $r=6$ to $r=8$, $T_0$ rises only 3.9 % while $\mathcal{M}$ rises
20.3 %, so $T_0/\mathcal{M}$ falls and $c^*$ falls with its square root — you are near the
flame-temperature plateau but the mole count keeps climbing.

**Q5 (8) — (b).** About +250 K (3348 → 3602 K over 20 → 200 bar), by suppressing
dissociation: the dissociation reactions increase the mole count, so pressure pushes them
back (Le Chatelier).
(a) inverts the physics — compression of a *reacting* mixture raises $T$, and in any case
the chamber process is heat addition, not compression. (c) is the right mechanism with the
wrong magnitude; 800 K would require far more dissociation than exists at 20 bar and is a
useful thing to be able to reject on the numbers. (d) is the widespread half-truth: the
$C_F$ benefit is indeed the larger one, but $T_0$ is *not* independent of pressure.

**Q6 (12).**
(i) **Dissociation.** At 3600 K, part of the product H$_2$O is broken into OH, H, O and
O$_2$. Those bonds cost enthalpy that never appears as sensible heat, so the equilibrium
temperature is lower than the fixed-product-list calculation. (4 marks)

(ii) The stored chemical energy is 1293 kJ/kg. Converting to a temperature using the
frozen specific heat — frozen, because we are asking how much hotter the *same* gas would
be if that energy were released, not how it responds to further reaction:

$$\Delta T = \frac{1293\ \mathrm{kJ/kg}}{3.80\ \mathrm{kJ/(kg\,K)}} = 340\ \mathrm{K}$$

against the observed gap of $3926 - 3602 = 324$ K. Agreement to 5 %, which is as good as
the estimate deserves given that $c_p$ itself varies over the 324 K interval. The
mechanism accounts for the gap. (8 marks)

Using the equilibrium $c_p$ of 7.32 here gives 177 K and does *not* close the gap; a
student who notices that and explains why frozen is the right choice earns full marks even
with arithmetic slips elsewhere.

**Q7 (10) — ε ≈ 40.5, $I_{vac}$ ≈ 452 s.**
$p_e = 0.25$ bar lies between ε = 40 (0.2545 bar) and ε = 50 (0.1899 bar).

$$f = \frac{\ln(0.25/0.2545)}{\ln(0.1899/0.2545)} = \frac{-0.01784}{-0.29271} = 0.0609$$
$$\varepsilon = 40\left(\frac{50}{40}\right)^{0.0609} = 40 \times 1.0137 = 40.5$$

$I_{vac} = 451.8 + 0.0609(456.2 - 451.8) = 451.8 + 0.27 = \boxed{452.1\ \mathrm{s}}$

Linear interpolation on ε instead of logarithmic gives ε = 40.7 and the same $I_{sp}$ to
0.1 s; both are acceptable here because the interval is narrow. Marks are lost for
interpolating on the wrong pair of rows, or for interpolating $p_e$ linearly across a
wide interval, where the error becomes several percent.

**Q8 (12).**
$$I_{sp,pred} = 0.98 \times 0.985 \times 460 = \boxed{444.2\ \mathrm{s}}$$
Measured 438 s; shortfall 6.2 s = 1.4 %. (4 marks)

Two most likely explanations (4 marks):
1. **The assumed $\eta_{C_F}$ of 0.985 is too generous** — most plausibly because the
   kinetic (finite-rate) loss was not counted. The 460 s is an *equilibrium* number, and
   at high area ratio the real expansion freezes short of full recombination; 1–1.5 % is
   the normal size of that loss and it accounts for the entire shortfall on its own.
2. **A measurement or definition mismatch** — the CEA run used the default infinite-area
   combustor while $p_c$ was measured injector-end (or the throat area used in $\eta_{c^*}$
   was cold rather than hot), so the 0.98 is not the $\eta_{c^*}$ you think it is; or the
   thrust/flow instrumentation has a systematic bias.

Distinguishing measurement (4 marks): **repeat the test at a substantially different area
ratio** (a short nozzle, or a different nozzle extension) with the same injector and
chamber. A kinetic loss grows with area ratio; a $c^*$ or instrumentation error does not.
If a single test is all you get, the alternative is to re-derive $\eta_{c^*}$ from a
carefully measured *hot* throat area and injector-end $p_c$ with the finite-area-combustor
CEA option, which settles explanation 2 without new hardware. Answers that propose
"measure $c^*$" alone get partial credit — $\eta_{c^*}$ was already given, so the useful
question is whether it was measured consistently.

**Q9 (10).** Vulcain 2 raised the mixture ratio from 5.3 to 6.1. That crosses the vacuum
$I_{sp}$ optimum (near 5.0 for LOX/LH2) and moves oxidizer-ward, raising $\mathcal{M}$
faster than it raises $T_0$ and costing more $I_{sp}$ than the higher $p_c$ (100 → 117.3
bar) and larger $\varepsilon$ (45.1 → 58.2) together return. Net: $-2$ s.

The objective that made it correct was **thrust and hydrogen tank volume for Ariane 5
ECA**: the mixture-ratio increase is the single largest source of the 1140 → 1359 kN
uprate, and the smaller hydrogen volume shortens the main stage. A vehicle-level payload
gain bought with an engine-level $I_{sp}$ loss. Full marks require naming the vehicle
objective, not just the chemistry.

The corroborating detail worth a mark: the richer mixture raised wall heat flux enough
that Vulcain 2 needed turbine-exhaust film cooling on the lower nozzle that Vulcain 1 did
not, which is the cooling penalty of the same trade made physical.

**Q10 (12).**
**Quote the frozen number, or something very close to it** (4 marks). Justification: a
5 N thruster runs at a few bar of chamber pressure with a residence time of order a
millisecond; the expansion to $\varepsilon = 100$ drops the static temperature and density
so far and so fast that recombination rates collapse almost immediately downstream of the
throat. The Bray freezing point is very early, so the physical answer sits close to the
frozen bound. (For a 2 MN engine at 200 bar the reverse is true.) Note also that for
N$_2$O$_4$/hydrazine the two bounds are only 1.5–3 % apart, so the choice matters less
than it would for hydrogen.

**Two further corrections** (8 marks; any two of the following, with a size):
- **Nozzle/viscous efficiency at very small scale**: the throat is well under a
  millimetre, the boundary layer occupies a large fraction of the exit area, and the
  throat Reynolds number is low. Expect $\eta_{C_F}$ of 0.85–0.95, i.e. **5–15 %** —
  by far the largest correction and the one that distinguishes a 5 N thruster from a
  large engine.
- **Pulse-mode duty cycle**: attitude-control thrusters mostly fire in short pulses.
  Start and shutdown transients cost **10–40 %** of steady-state $I_{sp}$ at pulse widths
  below about 50 ms, and the specification the spacecraft team actually needs is the
  minimum-impulse-bit and the $I_{sp}$-versus-pulse-width curve, not a steady-state number.
- **Combustion efficiency and film cooling**: $\eta_{c^*}$ of **0.93–0.97** for a small
  hypergolic thruster with a cooled wall.
- **Heat loss**: a radiation-cooled chamber is not adiabatic; **1–3 %**.

The answer that matters to the spacecraft team is a table of delivered $I_{sp}$ against
pulse width and duty cycle, not a single number. An answer that gives one number without
that caveat loses marks however well the physics is argued.

---

## K3. Trade-study reference solution (T1)

**Recommendation: Option C, $r = 3.6$ ($\phi = 1.11$).**

**(a) Objective.** For a reusable first stage that returns to the launch site, the
objective is **not** engine $I_{sp}$. It is delivered payload subject to holding the
landing reserve, and the two things that move it most are (i) the propellant mass that
must be carried to orbit *and* back, and (ii) the bulk propellant density, which sets
tank length and therefore stage dry mass, aerodynamic loads and landing-leg base. The
problem statement makes this explicit: 8 % of first-stage propellant is returned unused
as landing reserve, so every kilogram of tankage is carried through the whole flight
profile and back. In that regime **bulk density is worth an unusual amount** relative to
$I_{sp}$.

**(b) The $\sqrt{T_0/\mathcal{M}}$ argument.** For LOX/CH$_4$ at 250 bar, the theoretical
$I_{sp}$ optimum sits near $r \approx 3.2$–3.4 — fuel-rich of stoichiometric 3.99, for
the reason in §3.6, but much less fuel-rich in $\phi$ terms than a hydrogen engine because
excess methane pyrolyses to CO, H$_2$, CH$_4$ and soot rather than surviving as a very
light gas. The $T_0$/$\mathcal{M}$ curve for methalox is *flat* over roughly $r = 3.1$ to
3.7: moving from 3.4 to 3.6 costs of order 1–2 s of vacuum $I_{sp}$, about 0.3–0.6 %.
Moving to 3.8 costs perhaps 3–4 s and is where the curve starts to bite. Moving to 3.0
costs 1–2 s in the other direction and gains nothing.

Against that, LOX at 1141 kg/m³ against liquid methane at 423 kg/m³ means bulk density
rises steadily with $r$: from $r = 3.0$ to $r = 3.6$ the mixture density rises by roughly
6 %, which on a stage whose dry mass scales with tank volume is worth more than 2 s.

**(c) Cooling and cycle constraints.**

- *Chamber wall, 800 K limit.* $T_0$ rises with $r$ toward stoichiometric, and at 250 bar
  the gas-side heat flux is already extreme (Bartz scales as $p_c^{0.8}$ [Bartz57]).
  Option D at $\phi = 1.05$ is within 5 % of stoichiometric and is the hottest of the four
  by roughly 100 K — that is a real threat to the 800 K wall limit and to 20-flight life,
  because reusable-engine wall life is dominated by low-cycle thermal fatigue whose
  cycle count falls steeply with peak wall temperature. Option D is rejected primarily
  here, not on $I_{sp}$.
- *Coolant capacity.* Methane is an excellent regenerative coolant with no serious coking
  limit below about 900 K, unlike RP-1. That removes the constraint that forces kerolox
  engines rich, and is a large part of why the answer for methalox is closer to
  stoichiometric than for kerosene. But at $r = 3.6$ the methane flow is only 22 % of
  total, so coolant flow is the binding heat-balance term and it shrinks as $r$ rises —
  another argument against D.
- *Preburners, 900 K limit.* Full-flow staged combustion means *both* preburners must hold
  turbine inlet temperature below 900 K, which is achieved by running each far from
  stoichiometric in its own direction (very fuel-rich and very oxidizer-rich). Those two
  preburner mixture ratios are set by the turbine limit, and the main-chamber $r$ then
  falls out of the total flow balance. This constrains $r$ far less than it would in a
  gas-generator cycle — there is no dumped flow and no film-cooling budget to feed — which
  is the third reason the answer is allowed to sit close to stoichiometric.

**Rejecting the others.**
- **A ($r = 3.0$):** gives up 6 % of bulk density and 1–2 s of $I_{sp}$ simultaneously.
  It is on the wrong side of the flat optimum and buys only wall margin you do not need
  once you have methane cooling. Reject.
- **B ($r = 3.4$):** defensible, and the best choice if the vehicle were expendable or if
  wall life proved to be the binding constraint. Roughly 1 s better in $I_{sp}$ than C and
  about 3 % worse in bulk density. This is the genuine alternative and a strong answer
  says so.
- **D ($r = 3.8$):** rejected on the wall temperature limit, on 20-flight life, and on
  shrinking coolant flow — all three at once, and none of them recoverable by design
  changes that do not cost more than the trade is worth.

**(d) What would most change the recommendation.** A **wall-temperature and low-cycle-fatigue
life prediction across $r = 3.2$ to 3.8**, calibrated against a subscale hot-fire at 250
bar with the actual liner alloy and channel geometry. If 20-flight life turns out to be
achievable only below about $r = 3.4$, the answer becomes B immediately, and no amount of
density argument overturns it — reuse economics are dominated by engine life, and an
engine that needs a liner inspection every five flights is not the engine that was
specified.

A distant second is the **vehicle payload partial with respect to bulk density**. The
recommendation rests on the claim that 6 % of density beats 1–2 s of $I_{sp}$ for an
RTLS first stage; that claim is quantitative and belongs to the vehicle team, not the
engine team, and should be requested in writing rather than assumed.

### Rubric

**A strong answer must contain:**
- An explicit statement of the objective being optimised, and recognition that it is not
  engine $I_{sp}$ (this is the single most important discriminator).
- A quantitative $\sqrt{T_0/\mathcal{M}}$ argument, including the observation that the
  methalox optimum is *flat* over the candidate range, so the $I_{sp}$ differences between
  A, B and C are small (1–4 s) and other constraints dominate.
- The stoichiometric value 3.99 computed or quoted, and the recognition that all four
  options are fuel-rich.
- Rejection of D on a *named* physical limit (wall temperature, coolant flow, or fatigue
  life), not on $I_{sp}$.
- Recognition that methane's cooling behaviour is qualitatively different from RP-1's, and
  that full-flow staged combustion decouples main-chamber $r$ from the film-cooling and
  turbine-drive budgets.
- A single, falsifiable piece of information named in part (d).

**Loses marks for:**
- Recommending the option nearest stoichiometric because "combustion is most complete", or
  the richest option because "engines run fuel-rich" — both are the reasoning this module
  exists to correct.
- Treating the $I_{sp}$ differences as decisive when they are 0.3–1 % and the density
  differences are 3–6 %.
- Ignoring the reuse requirement, or treating 20-flight life as a materials footnote
  rather than the constraint that most likely binds.
- Quoting a Raptor mixture ratio as an authority. Raptor's 3.6 is a company claim and is
  evidence that the answer is plausible, not evidence that it is right; using it as the
  justification rather than as a cross-check is a failure of method.
- Any recommendation that does not state what would change it.

---

## K4. Common wrong answers and what they reveal

**"The optimum mixture ratio is stoichiometric, because that is where all the fuel
burns."** The single most common error, and it reveals that the student is optimising
$T_0$ rather than $\sqrt{T_0/\mathcal{M}}$ — i.e. has not internalised Eq. 3.2. It is
usually accompanied by an inability to say what the exhaust is *made of*. The cure is to
compute $\mathcal{M}$ at two mixture ratios and look at it.

**"Engines run fuel-rich to protect the walls."** Half right, and revealing because it
shows the student has a mechanism but has attached it to the wrong effect. Test them with:
"If you had an indestructible chamber wall, what mixture ratio would you run?" A student
who says "stoichiometric" has the misconception; one who says "still fuel-rich, near the
$I_{sp}$ optimum" has it right and merely over-weighted the cooling argument.

**Forgetting the fuel's own oxygen (ethanol, nitric acid, N$_2$O, hydrogen peroxide).**
Produces an $r_{st}$ that is 15–50 % too high. Reveals mechanical formula-balancing
without atom bookkeeping. Always count atoms on both sides.

**Treating liquid reactants as gases at 298.15 K.** Worth 250 K on a LOX/LH2 flame. It
reveals a student who has learned "heats of formation are zero for elements" as a rule
rather than as a statement about a specific reference state. The diagnostic question is
"zero *at what temperature and in what phase?*"

**Using a constant $c_p$, or a $c_p$ evaluated at 298 K, in the enthalpy balance.**
Produces flame temperatures of 6000–8000 K, which should be rejected on sight — nothing
in chemical propulsion exceeds about 4600 K (that is roughly the ceiling for the hottest
practical combination). A student who reports 7000 K without flinching has stopped
sanity-checking, which is worse than the arithmetic error.

**Confusing CEA's `Isp` row with vacuum specific impulse.** 16 s in the §3.9 example.
Reveals that the student read the output as a table of labels rather than as a
one-dimensional flow solution. The tell is that they cannot say what `Isp` *is* the
specific impulse *of*.

**Using chamber `GAMMAs` for a high-area-ratio $C_F$ and expecting three-figure accuracy.**
Reveals a student who has correctly learned to use $\gamma_s$ instead of frozen
$c_p/c_v$ and has then over-trusted it. $\gamma$ varies from 1.147 to 1.257 down the
nozzle in the §3.9 block; a single value is a 1–5 % approximation, which is fine for
trends and not fine for a delivered-performance prediction.

**Applying frozen flow "to be conservative".** Reveals a student who has not distinguished
a bound from an estimate. Conservatism applied in the wrong place is a design error: a
stage sized on frozen $I_{sp}$ carries propellant it does not need, which costs payload
just as surely as an optimistic estimate costs margin.

**Quoting $\eta_{c^*}$ without stating the throat area basis or the $p_c$ measurement
station.** Reveals inexperience with test data rather than with theory. A 0.7 % throat
area error is a 0.7 % efficiency error, and injector-end versus nozzle-stagnation $p_c$
is another 1–3 %. Two labs quoting "97 %" may not be measuring the same thing.

**Believing manufacturer or company-claimed numbers at face value.** Every Raptor figure
in this module is a SpaceX claim, several traceable to social-media posts; Merlin's
mixture ratio is not published at all. A student who writes "Raptor runs at 3.6" without
the qualifier has not absorbed the course's epistemic conventions, and in an interview it
is the qualifier — not the number — that demonstrates judgment.
