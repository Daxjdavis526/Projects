# Module 07 — Injectors: answer key

Solutions to the problems and quiz in
[module 07](07-injectors.md). Equation numbers refer to that file.

---

## K1. Problem solutions

### Conceptual

**C1.** The phenomenon is **cavitation progressing to hydraulic flip**. Mechanism:
flow separates at the sharp inlet corner and forms a vena contracta where the
local static pressure is below the downstream pressure by roughly the contracted
jet's dynamic head. As $\Delta p$ is raised at fixed upstream pressure the
cavitation number $K = (p_1-p_v)/(p_1-p_2)$ falls; below $K \approx 1.8$–$2.0$ a
vapour cavity grows from the corner and $C_d \approx C_c\sqrt{K}$ (Eq. 3.4). When
the cavity reaches the orifice exit, downstream gas is ingested, the jet detaches
from the bore entirely, and $C_d$ steps to the contraction coefficient
$C_c \approx 0.61$ — which is exactly the 0.62 measured. The change from frothy
to glassy is the visual signature: a cavitating-but-attached jet is aerated and
rough, a flipped jet is a smooth detached column [Nurick76].

Two geometric changes that move the transition out of the operating range:
1. **Round the inlet** ($r/d \gtrsim 0.1$). Suppressing inlet separation removes
   the vena contracta that drives the local pressure below $p_v$; cavitation
   inception moves to a much lower $K$ and the transition becomes gradual rather
   than a step.
2. **Lengthen the orifice** (raise $L/D$ to 4–5). A longer bore lets the flow
   reattach downstream of the cavity, so the cavity cannot reach the exit and gas
   cannot be ingested — the orifice may cavitate but it will not flip.

A third, non-geometric answer that earns full credit if argued: raise the
chamber-side back pressure or the manifold pressure to raise $K$ out of the
cavitating band.

**C2.** With $\tau = 0$, Eq. 3.7 reduces to $t_s\dot p' + (1+k)p' = 0$, whose root
is $s = -(1+k)/t_s$: real, negative, and made *more* negative by increasing $k$.
Physically, a rise in $p_c$ immediately reduces $\Delta p$ and therefore the
injected flow, which immediately reduces the pressure — instantaneous negative
feedback, and the larger the gain the faster the decay.

With $\tau > 0$ the reduction in flow does not reach the chamber as reduced heat
release until $\tau$ later. If $\tau$ is near half the oscillation period, the
"corrective" flow reduction arrives when the pressure is already falling, and it
*deepens* the trough — the negative feedback has been phase-shifted into positive
feedback. The condition is captured by $1 + k\cos\omega\tau = 0$, which requires
$\cos\omega\tau < 0$, i.e. $\omega\tau > \pi/2$.

The frequency is set jointly by $\tau$ and $t_s$ through
$\omega\tau = \pi - \arctan(\omega t_s)$. The time lag dominates: to first order,
$\omega \approx \pi/\tau$ reduced by the chamber's own phase lag, so the
combustion time lag is the physical quantity that sets where the mode appears.
Full credit requires naming $\tau$; partial credit for "chamber volume" alone.

**C3.** Engine B (unlike doublets) has the **higher $\eta_{c^*}$**: the element
itself performs inter-propellant mixing at the impingement point, in a sheet only
tens of micrometres thick, so mixing is on the scale of the element. A like-on-like
doublet does no inter-propellant mixing at all at the element; the two propellants
meet only by turbulent entrainment between adjacent fans, which is a much slower
and coarser process.

Engine A (like doublets) requires the **larger $L^*$**, for the same reason —
mixing is the rate-limiting step and it happens over a longer axial distance.

Engine B is **more likely to go high-frequency unstable**. Faster mixing puts the
heat release closer to the injector face, where the transverse acoustic modes have
their pressure antinode; the Rayleigh criterion is then more easily satisfied.
Engine A's heat release is spread further downstream and is correspondingly harder
to drive. This is the performance-versus-stability trade in its cleanest form, and
it is why the F-1 ended up with a deliberately detuned pattern and 13 baffle
compartments [OY93], and why like-doublets are common on large kerosene engines.

**C4.** A shear coaxial element atomizes by having a fast, low-density gas stream
strip a liquid column. The two governing groups are
$\mathrm{VR} = V_g/V_l$ and $J = \rho_g V_g^2/(\rho_l V_l^2)$ (Eq. 3.19).

For LOX/LH2 the fuel is injected as a gas or a low-density supercritical fluid at
200–400 m/s against a liquid oxygen column at 20–40 m/s: $\mathrm{VR} = 10$–$20$
and $J$ of order 1–10, comfortably in the regime where the gas can penetrate and
disrupt the liquid core. Atomization is essentially free.

For LOX/RP-1 both propellants are *liquids* of comparable density injected at
comparable velocity. $\mathrm{VR} \approx 1$ and $J \approx 1$ only if you force
enormous velocity differences, which the pressure budget will not allow; in
practice $\mathrm{VR}$ is near unity and there is no shear layer worth the name.
The element degenerates into two concentric parallel streams — a showerhead in
disguise — with no mechanism to atomize and none to mix. Hence LOX/kerosene
engines use impinging, swirl or pintle elements, all of which create their own
relative velocity or their own sheet, rather than borrowing one from the fuel.

**C5.** Two reasons uniform mixture ratio is wrong:

1. **The wall.** A uniform face puts a stoichiometric (or design-$MR$) flame
   against the chamber wall. Gas-side temperature at $MR = 2.3$ for LOX/RP-1 is
   ~3500 K; no wall and no cooling jacket survives that heat flux for a useful
   life. The outer region must be fuel-rich so that the boundary layer is cooler
   and chemically reducing.
2. **The mean mixture ratio at the throat.** The film-cooling and outer-row fuel
   eventually mixes into the core downstream. If the core were already at design
   $MR$, the engine would run fuel-rich overall. The core is therefore biased to
   compensate.

The correct target profile is a **prescribed radial stratification**: core at or
slightly oxidizer-rich of the design mixture ratio, a transition region, and an
outer annulus that is markedly fuel-rich, plus (usually) a dedicated ring of pure
fuel film-cooling orifices at the periphery. The acceptance criterion on the
patternator is deviation from *that* profile, not global uniformity.

**C6.** Combustion instability at high frequency requires the Rayleigh criterion:
heat release must be added in phase with the local acoustic pressure oscillation.
The transverse (tangential and radial) acoustic modes of a cylindrical chamber
have their largest pressure amplitudes near the injector face and along the wall,
and the amplitude decays axially away from the face over roughly one chamber
radius.

A faster-mixing pattern completes atomization, vaporization and reaction in a
shorter axial distance, which concentrates the heat release exactly in the region
of maximum acoustic pressure. It also shortens the combustion time lag $\tau$,
which moves the response into the phase relationship that drives kilohertz modes
rather than chug. Both effects increase the driving.

Conversely, spreading heat release axially — showerhead patterns, like-doublets,
recessed posts, lower injection velocity — reduces coupling and costs $\eta_{c^*}$.
There is no way to have both, which is why baffles and acoustic cavities exist:
they attack the acoustics instead of the combustion.

**C7.** A fully cavitating orifice is hydraulically choked: from Eq. 3.4,
$\dot m = C_c A\sqrt{2\rho(p_1-p_v)}$, which contains no $p_2$. The flow is
therefore completely insensitive to chamber pressure, the injector feedback gain
$k = p_c/2\Delta p$ effectively goes to zero, and Eq. 3.7 loses its feedback term
entirely. Chug cannot occur. This is why cavitating venturis are the standard
feed-line fix.

Two reasons a designer might refuse:
1. **Atomization and mixing get worse.** Nurick showed cavitation degrades mixing
   uniformity in circular orifices, and if the cavity reaches the exit the orifice
   flips, $C_d$ drops to 0.61, and the spray cone collapses. You buy chug margin
   with $\eta_{c^*}$.
2. **Operating-point sensitivity and metering loss.** The transition into and out
   of cavitation is abrupt, and one circuit can cavitate while the other does not
   — an uncommanded mixture-ratio shift. Also, $\dot m$ now depends on
   $p_v$, hence on propellant temperature, which is poorly controlled;
   the injector has stopped being a reliable meter. A third acceptable answer:
   the required upstream pressure is higher, costing pump work or tank pressure.

**C8.** The "missing" discharge is not lost energy; it is **area**. A swirl
element converts a large part of the pressure drop into *tangential* velocity.
At the exit the liquid occupies only an annular fraction $\varphi$ of the
geometric area, with a gas core on the axis, and only the axial component of the
velocity contributes to throughflow. Eq. 3.21 makes this explicit:
$C_d = \sqrt{\varphi^3/(2-\varphi)}$, so at $\varphi = 0.5$, $C_d = 0.29$.

This is not a loss to be engineered away because the tangential velocity is the
*product*: it is what spreads the liquid into a thin conical sheet that
disintegrates into a fine spray at low axial velocity and low $\Delta p$. Remove
the swirl and you recover $C_d$ and lose the atomization mechanism. The design
consequence is simply that swirl elements need larger exit orifices for the same
flow — which is itself an advantage, because large orifices are easier to
manufacture repeatably and much harder to block.

### Calculation

**N1.** Total effective area from Eq. 3.1:
$$A_{tot} = \frac{\dot m}{C_d\sqrt{2\rho\Delta p}}
= \frac{68}{0.78\sqrt{2(1140)(1.8\times10^6)}}
= \frac{68}{0.78 \times 64\,062} = 1.361\times10^{-3}\ \mathrm{m^2}$$

Area of one 1.6 mm orifice: $a = \pi(1.6\times10^{-3})^2/4 = 2.011\times10^{-6}$ m².

$$N = \frac{1.361\times10^{-3}}{2.011\times10^{-6}} = 677\ \text{orifices}$$

Jet velocity $V = 0.78\sqrt{2(1.8\times10^6)/1140} = 43.8$ m/s.

At $L/D = 4$, orifice length $= 6.4$ mm, so the faceplate must be at least
6.4 mm thick in the oxidizer circuit (plus whatever the manifold closeout needs).

*Grading:* full credit needs $A_{tot}$, $N$ rounded sensibly (677, or "about
680"), and 6.4 mm. Quoting $N$ to five figures shows the student does not
understand that $C_d$ is known to ±5 % at best, which makes $N$ uncertain by the
same amount.

**N2.** $V = 43.8$ m/s, $d = 1.6$ mm.
$$\mathrm{We}_l = \frac{(1140)(43.8)^2(1.6\times10^{-3})}{0.013} = 2.70\times10^{5}$$
$$\mathrm{Re} = \frac{(1140)(43.8)(1.6\times10^{-3})}{1.9\times10^{-4}} = 4.21\times10^{5}$$
$$\mathrm{Oh} = \frac{1.9\times10^{-4}}{\sqrt{(1140)(0.013)(1.6\times10^{-3})}}
= \frac{1.9\times10^{-4}}{0.1540} = 1.23\times10^{-3}$$
(check: $\sqrt{2.70\times10^5}/4.21\times10^5 = 1.23\times10^{-3}$ ✓)

Chamber gas: $R = 8314.46/22 = 377.9$ J/(kg·K),
$\rho_g = 9.0\times10^6/((377.9)(3400)) = 7.00$ kg/m³, so
$$\mathrm{We}_g = \frac{(7.00)(43.8)^2(1.6\times10^{-3})}{0.013} = 1.66\times10^{3}$$

$\mathrm{We}_g \gg 40.3$: **atomization regime**, breakup within a few diameters
of the exit. $\mathrm{Oh} \approx 10^{-3}$ is very low — LOX has low viscosity and
low surface tension — so viscosity plays no role and the breakup is
aerodynamic/surface-tension controlled.

**N3.** $\dot m_o = 1.65 \times 0.025 = 0.04125$ kg/s.

Velocities at $\Delta p = 5$ bar, $C_d = 0.80$:
$$V_f = 0.80\sqrt{\frac{10^6}{875}} = 27.04\ \mathrm{m/s},\qquad
V_o = 0.80\sqrt{\frac{10^6}{1440}} = 21.08\ \mathrm{m/s}$$

Areas and diameters:
$$A_f = \frac{0.025}{(875)(27.04)} = 1.056\times10^{-6}\ \mathrm{m^2}
\Rightarrow d_f = \mathbf{1.160\ mm}$$
$$A_o = \frac{0.04125}{(1440)(21.08)} = 1.359\times10^{-6}\ \mathrm{m^2}
\Rightarrow d_o = \mathbf{1.315\ mm}$$

Rupe parameter (Eq. 3.18):
$$R_u = \frac{(1440)(21.08)^2(1.315\times10^{-3})}{(875)(27.04)^2(1.160\times10^{-3})}
= \frac{841.4}{741.9} = \mathbf{1.13}$$
$$\mathrm{TMR} = \frac{(0.04125)(21.08)}{(0.025)(27.04)} = \mathbf{1.29}$$

**Verdict: essentially balanced.** $R_u = 1.13$ is within the flat region around
Rupe's optimum; the oxidizer carries 13 % excess diameter-weighted momentum,
which will deflect the resultant slightly toward the fuel side but not enough to
stratify the fan badly. A strong answer says so and does *not* redesign.

If the student is asked to improve it anyway, the two quantified fixes are:
- reduce oxidizer $\Delta p$ to $\Delta p_o = \rho_o V_o'^2/(2C_d^2)$ with
  $V_o' = V_o(1.13)^{-2/3} = 19.4$ m/s, giving $\Delta p_o = 4.23$ bar (a mild
  15 % reduction, still 85 % of the fuel-side drop — acceptable here, unlike the
  RP-1 case of WE3);
- or leave it alone, which for hypergolic N2O4/MMH is the better engineering
  answer, since these propellants' mixing is helped by the reaction and the
  larger risk is reactive stream separation, not momentum imbalance.

*Note the contrast with WE3:* the storable pair at $MR = 1.65$ is nearly balanced
at equal $\Delta p$ because the density ratio (1.65) nearly cancels the mixture
ratio; the LOX/RP-1 pair at $MR = 2.27$ with a density ratio of 1.41 is not. The
balance is a property of the propellant combination, not of the designer's skill.

**N4.** $R = 8314.46/22 = 377.9$ J/(kg·K);
$\rho_g = 7.0\times10^6/((377.9)(3300)) = 5.61$ kg/m³.

$$K_v = \frac{8(0.20)}{(800)(2400)}\ln(1+7) = (8.333\times10^{-7})(2.0794)
= 1.733\times10^{-6}\ \mathrm{m^2/s}$$
$$\mathrm{Re}_d = \frac{(5.61)(40)(150\times10^{-6})}{7.5\times10^{-5}} = 449$$
$$K_{v,\mathrm{eff}} = 1.733\times10^{-6}\left(1+0.3\sqrt{449}(0.8)^{1/3}\right)
= 1.733\times10^{-6}(6.90) = 1.196\times10^{-5}\ \mathrm{m^2/s}$$
$$t_v = \frac{(150\times10^{-6})^2}{1.196\times10^{-5}} = 1.88\times10^{-3}\ \mathrm{s}
= \mathbf{1.88\ ms}$$

Minimum $L^*$ from Eq. 3.16, requiring $t_s \geq t_v$:
$$L^* \geq \frac{t_v\,p_c}{\rho_c c^*} = \frac{(1.88\times10^{-3})(7.0\times10^{6})}{(5.61)(1750)}
= \mathbf{1.34\ m}$$

**Comparison:** this is at the top of module 06's 0.8–1.3 m band for LOX/RP-1 and
above it for storables. The reading is that a 150 μm SMD is *coarse* for a 70 bar
chamber — the injector is the problem, not the chamber. Halving the SMD to 75 μm
would cut $t_v$ by a factor of 3.0 (the $d^2$ law alone gives 4, partly offset
by the weaker convection correction at smaller $\mathrm{Re}_d$) to 0.63 ms, and
bring the required $L^*$ to 0.45 m. Full credit requires the comparison and the
conclusion, not just the number.

**N5.** Solve $\omega\tau + \arctan(\omega t_s) = \pi$, then
$k_{crit} = \sqrt{1+(\omega t_s)^2}$ and $(\Delta p/p_c)_{min} = 1/(2k_{crit})$.

| case | $\omega$ (rad/s) | $f$ (Hz) | $\omega t_s$ | $k_{crit}$ | $(\Delta p/p_c)_{min}$ |
|---|---|---|---|---|---|
| $t_s = 2.2$ ms, $\tau = 1.2$ ms | 1547 | **246** | 3.40 | 3.55 | **14.1 %** |
| $t_s = 0.8$ ms, $\tau = 1.2$ ms | 1812 | **288** | 1.45 | 1.76 | **28.4 %** |

**Trend:** shortening the chamber stay time *raises* the required pressure drop —
from 14 % to 28 % for a factor 2.75 reduction in $t_s$. The chamber gas volume
acts as a capacitance that absorbs flow fluctuations; take it away and the
injector must supply all the damping itself. The engineering consequence is that
small, light, high-$p_c$ chambers are the chug-prone ones, and that shrinking
$L^*$ to save mass has a hidden cost in required injector $\Delta p$ and therefore
in pump discharge pressure. Students who predict the opposite (reasoning that
"more volume means more to destabilise") should be shown $k_{crit}$ explicitly.

**N6.** Total orifice area:
$$\sum A_{or} = 400 \times \frac{\pi(1.2\times10^{-3})^2}{4} = 4.524\times10^{-4}\ \mathrm{m^2}$$

From Eq. 3.5, for $\delta\dot m/\dot m \le 0.02$ with $C_d = 0.75$:
$$\frac{V_{man}}{V} = \sqrt{\frac{2(0.02)}{C_d^2}} = \sqrt{\frac{0.04}{0.5625}} = 0.267$$
$$A_{man} \geq \frac{\sum A_{or}}{0.267} = \frac{4.524\times10^{-4}}{0.267}
= 1.696\times10^{-3}\ \mathrm{m^2}$$

Equivalent circular duct: $D = \sqrt{4A_{man}/\pi} = \mathbf{46.5\ mm}$.

The area ratio is 3.75, consistent with the 4–6 rule of thumb. A good answer notes
that this is a *minimum on the cross-section carrying the full flow*: in a ring
manifold fed from two opposed inlets each half of the ring carries half the flow,
so each half-ring may be sized on $\sum A_{or}/2$ — which is one of the reasons
symmetric feeds are used.

**N7.** For a fixed-area injector, $\Delta p \propto \dot m^2$ and (approximately)
$\dot m \propto F$, $p_c \propto F$. At 10 % thrust:
$$\frac{\Delta p_{10\%}}{\Delta p_{100\%}} = (0.10)^2 = \mathbf{0.01}$$
$$\left.\frac{\Delta p}{p_c}\right|_{10\%} = 20\%\times\frac{0.01}{0.10} = \mathbf{2.0\ \%}$$

Two percent is a factor of eight below any plausible chug threshold (WE5 gave
16.7 % for a comparable chamber, and the LMDE's long combustion lag at 0.76 bar
chamber pressure would demand more, not less). The injector would have essentially
no authority over the flow: chamber pressure fluctuations would modulate the
injected flow almost one-for-one.

**What it proves:** a fixed-area injector cannot throttle 10:1, full stop. The
LMDE's 10:1 range (46.7 kN to 4.67 kN, 110 psia to 11 psia) was achievable *only*
because Elverum's **variable-area pintle** shrinks the injection area as the flow
falls, holding $\Delta p$ and injection velocity roughly constant and therefore
holding $\Delta p/p_c$ roughly constant — in fact rising, since $p_c$ falls while
$\Delta p$ does not. That is the single design feature that made the Apollo lunar
landing profile possible, and it is why the same lineage reappears on the Merlin
[Dressler00].

**N8.** Total flow:
$$\dot m = \frac{F}{I_{sp}g_0} = \frac{100\,000}{(355)(9.80665)} = 28.72\ \mathrm{kg/s}$$
$$\dot m_o = 28.72\times\frac{3.4}{4.4} = 22.20\ \mathrm{kg/s},\qquad
\dot m_f = 6.53\ \mathrm{kg/s}$$

At $\Delta p = 0.20 \times 60\ \mathrm{bar} = 12$ bar $= 1.2\times10^6$ Pa,
$C_d = 0.80$:
$$V_o = 0.80\sqrt{\frac{2.4\times10^6}{1140}} = 36.7\ \mathrm{m/s},\qquad
V_f = 0.80\sqrt{\frac{2.4\times10^6}{423}} = 60.3\ \mathrm{m/s}$$
$$A_{o,tot} = \frac{22.20}{(1140)(36.7)} = 5.304\times10^{-4}\ \mathrm{m^2},\qquad
A_{f,tot} = \frac{6.53}{(423)(60.3)} = 2.561\times10^{-4}\ \mathrm{m^2}$$

For 90 elements (one orifice of each per element):
$$d_o = \sqrt{\frac{4(5.304\times10^{-4})}{90\pi}} = \mathbf{2.74\ mm},\qquad
d_f = \sqrt{\frac{4(2.561\times10^{-4})}{90\pi}} = \mathbf{1.90\ mm}$$

Credit for noticing, unprompted, that the Rupe parameter of this element is
$R_u = (1140)(36.7)^2(2.74\times10^{-3})/((423)(60.3)^2(1.90\times10^{-3})) = 1.44$
— oxidizer-dominated, the same problem as WE3, with the same fix available
(split the oxidizer into two orifices per element, giving $R_u = 1.02$).

### Engineering reasoning

**R1.** *Engine 1 — repeatable, present from test one, unchanging.* This is a
**wall streak** caused by a fixed geometric defect: a mis-drilled or mis-aimed
outer-row element, a missed impingement sending an unatomized jet at the wall, or
a blocked fuel orifice in the outer row leaving that azimuth locally
oxidizer-rich. The distinguishing evidence is that it is **azimuthally localised,
present from the first firing, and does not evolve**. Confirm by patternating the
injector cold and looking for a mass-flux or mixture-ratio anomaly at that
azimuth, and by per-orifice flow checks on the outer row. The 2 % $c^*$ deficit is
consistent: propellant delivered to the wall at the wrong mixture ratio is
propellant not burning at the design ratio.

*Fix:* re-drill or re-aim the offending element, or if the pattern is
systematically wrong at that azimuth, resize the outer-row fuel orifices and add
film-cooling orifices there.

*Engine 2 — nominal $c^*$, wall temperature climbing 15 K per test.* This is
**progressive**, so it is not a fixed geometry defect. Candidates: coking or
carbon deposition in the film-cooling orifices or coolant channels progressively
reducing film flow (RP-1); erosion of the injector face or of an outer-row orifice
progressively changing its aim; or coolant-channel fouling. The distinguishing
evidence is the *trend*: a defect that is machined in does not change, a
degradation mechanism does. Confirm by flow-checking the film-cooling circuit
before and after a test series and by borescoping the face.

*Fix:* different from engine 1 — this is a life and cleanliness problem, not a
geometry problem. Increase film-cooling flow margin, change the coolant-side
wall temperature to stay below the coking threshold (module 11), improve
filtration, and set an inspection interval.

*Grading:* the marks are for using **repeatability versus trend** as the
discriminator and for giving genuinely different fixes. A student who diagnoses
both as "streaking" and prescribes more film cooling for both has missed the
point.

**R2.** *Spectrum A — 340 Hz, on chamber and both manifolds, sharp.* This is
**chug**. The identifying evidence is threefold: the frequency is in the 50–500 Hz
band; it appears on the feed-system transducers, which an acoustic chamber mode
cannot do because the injector orifices isolate the manifolds acoustically; and it
is spatially uniform. It is the mode of Eq. 3.7–3.8.

*Fix:* raise the injector $\Delta p$ (increase $k_{crit}$ margin by reducing $k$),
or install a cavitating venturi in the feed line, or change feed-line length or
add a compliance to detune the feed system.

*Spectrum B — 4.2 kHz, chamber only, growing 0.5 % → 4 % over four tests.* This
is **high-frequency (screech) instability**, almost certainly a transverse chamber
acoustic mode; the growing amplitude across tests indicates the engine is close
to the stability boundary and something (hardware wear, small build differences,
a slightly different operating point) is pushing it across. Its absence from the
manifolds confirms it is a chamber acoustic mode, not a feed-coupled one.

*Fix:* attack the acoustics or the heat-release distribution — baffles, acoustic
cavities tuned to the mode, increased LOX post recess, changed element spacing,
or a deliberately slower-mixing pattern.

**The conflict, which is the point of the question:** raising injector $\Delta p$
to fix spectrum A raises injection velocity, sharpens atomization, and moves heat
release *closer to the face and earlier in time* — which increases the driving of
spectrum B. Conversely, detuning the pattern to fix B (slower mixing, recess,
lower velocity) reduces $\Delta p$ authority or at least does nothing for chug.
The two fixes pull in opposite directions, and an engine with both problems needs
the acoustic fix (cavities or baffles) plus the $\Delta p$ fix, not one traded
against the other.

**R3.** *Quantitative evaluation.* At full thrust the design is presumably around
$\Delta p/p_c = 20$ %. At 55 % thrust with a fixed-area injector,
$$\left.\frac{\Delta p}{p_c}\right|_{55\%} = 20\%\times\frac{0.55^2}{0.55}
= 20\%\times0.55 = 11\ \%$$
which is below the ~15–17 % a hydrocarbon chamber typically needs — consistent
with the observed chug.

Doubling the injector drop gives 40 % at full thrust and 22 % at 55 %. That does
fix the chug. What it costs:
- **Pump discharge pressure rises by 20 % of $p_c$**, i.e. by the full extra
  $\Delta p$, on both circuits. Turbine power rises proportionally (Eq. 3.9); on a
  gas-generator cycle that is more GG flow dumped overboard and a direct $I_{sp}$
  loss; on a staged-combustion cycle it is preburner temperature or turbine flow
  that must come from somewhere.
- **Injection velocity rises by $\sqrt2$**, which changes atomization, mixing,
  spray impingement location on the wall, and heat-release distribution — i.e. it
  invalidates the thermal and stability qualification already performed at full
  thrust, and moves the engine toward the high-frequency boundary (R2).
- Orifices shrink by $2^{-1/4} = 0.84$, worsening contamination sensitivity.

*Two alternatives:*
1. **Dual-manifold (dual-orifice) injector.** Two independently valved sets of
   orifices; at low thrust one set is shut off, so the *active* area falls with
   flow and $\Delta p$ stays high. Cost: extra valve, extra manifold, a
   discontinuity in the pattern at the switch point, and a transient to qualify.
2. **Cavitating venturis in the feed lines.** Choke the flow upstream so that
   $\dot m$ is set by upstream pressure alone and is independent of $p_c$;
   $k \to 0$ and chug is eliminated regardless of injector drop. Cost: a
   significant permanent pressure drop and hence pump work, and the venturi must
   stay cavitating across the whole range.
3. (Also acceptable) **A variable-area pintle**, if the programme can accept a
   redesign — the LMDE solution.

A strong answer notes that the team's proposal is not wrong, merely expensive, and
that the right decision depends on whether the engine has pressure budget to
spare and on whether the full-thrust stability qualification can be repeated.

**R4.** *Chain of causation.* As-built AM surface roughness inside a small printed
orifice is a substantial fraction of the diameter, so the effective flow area is
reduced and the friction loss increased: $C_d$ falls from 0.81 to 0.68, a 16 %
reduction. Since $\dot m = C_d A\sqrt{2\rho\Delta p}$, a circuit whose $C_d$ falls
by 16 % passes 16 % less flow at the same $\Delta p$ — unless the *other* circuit
falls by a different amount. The 3 % oxidizer-rich mixture ratio says exactly
that: the two circuits' $C_d$ degraded by different amounts, because their orifice
diameters, orientations relative to the build direction, and internal geometries
differ. Build orientation matters: a hole printed with its axis vertical has
different roughness and different overhang-induced distortion from one printed
horizontally. The 6 % scatter between nominally identical orifices is the
signature of a process whose local geometry is not repeatable — powder
size distribution, laser scan strategy at the hole edge, and partially sintered
particles at the bore.

*What to measure to confirm:* per-orifice flow test on both circuits (does the
scatter correlate with position on the plate or with build orientation?); CT scan
or destructive sectioning of representative orifices to measure actual bore
diameter and roughness against the model; and surface roughness $R_a$ inside the
bore.

*Two fixes with consequences:*
1. **Machine the metering orifices after printing** — print the manifolds and
   structure, then drill or EDM and deburr the final orifices, and inlet-radius
   them. Recovers handbook $C_d$ and collapses the scatter. Costs a machining
   operation and access: the orifice must be reachable, which constrains the
   printed geometry.
2. **Re-size the printed orifices to the measured $C_d$ and accept it.** Cheap,
   fast, and it fixes the mixture ratio. But it does nothing about the 6 %
   scatter, which becomes element-to-element mixture-ratio variation across the
   face and therefore a streaking risk; and it makes the design dependent on a
   specific build recipe, so any change of machine, powder lot or orientation
   requires requalification. Acceptable only if the scatter is shown to be
   random rather than spatially clustered.

Also creditable: abrasive-flow machining or chemical polishing of the internal
passages to reduce roughness without conventional machining access.

**R5.** *Mechanism 1 — reactive stream separation at low velocity.* Hypergolic
propellants react on contact. During a short pulse the injection velocity is
building up through the manifold-fill transient and is well below steady state,
so the momentum of the two jets at the impingement point is low while the gas
generated by the surface reaction is not. The gas blows the streams apart before
they mix, mixing efficiency collapses, and $I_{sp}$ falls. This mechanism is
specific to unlike-impinging hypergolic elements and is a known reason for a
minimum reliable pulse width.

*Mechanism 2 — manifold fill and dribble volume.* At the start of every pulse the
manifolds and the volume downstream of the valves must fill, and at the end the
propellant trapped between the valve and the orifice ("dribble volume") drains
into the chamber unatomized and at whatever mixture ratio the two dribble volumes
happen to produce. Both are fixed quantities per pulse, so their fractional cost
grows as pulse width shrinks — a pure transient-loss mechanism with nothing to do
with the element type.

*The test that distinguishes them.* Vary the pulse width at constant everything
else and plot delivered impulse against commanded pulse width. Mechanism 2 gives
an **offset**: the impulse-versus-width line is straight, with the steady-state
slope, but displaced by a fixed impulse loss per pulse (and the $I_{sp}$ deficit
scales as $1/t_{on}$). Mechanism 1 gives a **slope change**: performance is
genuinely worse *while* the pulse is short and the velocity is low, so the
efficiency itself is degraded and the curve is non-linear, and it should improve
if the feed pressure is raised (raising velocity faster) at the same pulse width.

A second discriminator: mechanism 2 is sensitive to dribble volume, so
repeating with a valve mounted closer to the face should reduce the offset and
leave a mechanism-1 loss untouched.

### Mini trade study

See K3.

---

## K2. Quiz answers with explanations

**Q1 (8 pts) — (b) 0.65.**
At $L/D = 1.2$ with a sharp inlet the flow separates at the corner and the vena
contracta sits near the exit; reattachment is marginal, so $C_d$ is close to the
contraction coefficient. (a) 0.45 is far too low for any plain orifice — that is
swirl-element territory. (c) 0.85 requires $L/D \geq 3$ with reattachment, or a
rounded inlet. (d) 0.98 is not achievable in a real orifice; it would require an
essentially loss-free contraction. Note also that $L/D \approx 1$ is the *worst*
place to design to, because the reattachment is bistable and $C_d$ scatters.

**Q2 (8 pts) — (b) provide chug margin by decoupling the chamber from the feed
system.**
This is the derivation of §3.4: $\Delta p/p_c$ is the inverse of the injector
feedback gain $k = p_c/2\Delta p$, and the stability requirement
$k < \sqrt{1+(\omega t_s)^2}$ produces the 15–25 % band for realistic $\tau$.
(a) is a real *benefit* — velocity and hence atomization improve with $\Delta p$ —
but not the reason for the specific number; you can atomize adequately at 10 %.
(c) is wrong and is the classic confusion: pressure drop does very little for
high-frequency instability and can make it worse. (d) inverts the causality:
uniform mixture ratio depends on manifold-to-orifice area ratio and on
manufacturing repeatability, not on the absolute drop.

**Q3 (12 pts).**
$$A = \frac{\dot m}{C_d\sqrt{2\rho\Delta p}}
= \frac{0.045}{0.76\sqrt{2(790)(1.4\times10^6)}}
= \frac{0.045}{0.76\times47\,033} = 1.259\times10^{-6}\ \mathrm{m^2}$$
$$d = \sqrt{4A/\pi} = \mathbf{1.27\ mm}$$
$$V = C_d\sqrt{2\Delta p/\rho} = 0.76\sqrt{\frac{2.8\times10^6}{790}}
= 0.76(59.53) = \mathbf{45.2\ m/s}$$
*Marking:* 6 pts for $d$, 4 for $V$, 2 for units carried correctly. A common slip
is to compute $V = \sqrt{2\Delta p/\rho}$ without $C_d$ (59.5 m/s) — that is the
ideal velocity, and using it in a momentum-ratio calculation is the error warned
about under Eq. 3.2.

**Q4 (10 pts).**
Method 1, directly:
$$\mathrm{Oh} = \frac{\mu}{\sqrt{\rho\sigma d}}
= \frac{1.1\times10^{-3}}{\sqrt{(790)(0.025)(1.266\times10^{-3})}}
= \frac{1.1\times10^{-3}}{0.1581} = 6.96\times10^{-3}$$
Method 2, via $\sqrt{\mathrm{We}_l}/\mathrm{Re}$:
$$\mathrm{We}_l = \frac{(790)(45.2)^2(1.266\times10^{-3})}{0.025} = 8.19\times10^{4},\quad
\mathrm{Re} = \frac{(790)(45.2)(1.266\times10^{-3})}{1.1\times10^{-3}} = 4.11\times10^{4}$$
$$\frac{\sqrt{8.19\times10^{4}}}{4.11\times10^{4}} = \frac{286.2}{41\,141}
= 6.96\times10^{-3}\ \checkmark$$

**Interpretation:** $\mathrm{Oh} \approx 7\times10^{-3} \ll 0.1$ means viscous
damping of surface waves is negligible compared with surface tension. The breakup
is controlled by aerodynamic force against surface tension, so the liquid's
viscosity does not enter the drop-size correlation in any important way, and
changes in fuel temperature (which move $\mu$ a lot and $\sigma$ a little) will
barely change atomization. That would not be true for a gelled propellant or a
cold viscous fuel with $\mathrm{Oh} > 0.1$.

**Q5 (8 pts) — (c) it drops $C_d$ to about 0.61 and collapses the spray cone.**
(a) is backwards on both counts. (b) is the correct description of a *cavitating*
orifice made independent of **downstream** pressure — the statement as written
(independent of *upstream* pressure) is wrong in any regime, since Eq. 3.4 depends
explicitly on $p_1$. (d) is wrong: flip depends on inlet geometry and cavitation
number, and happens readily with room-temperature storables and water.

**Q6 (12 pts).** Solve $\omega(0.9\times10^{-3}) + \arctan(\omega\times1.9\times10^{-3}) = \pi$:
$\omega = 2028$ rad/s, so $f = \mathbf{323\ Hz}$.
$\omega t_s = 3.85$, so
$$k_{crit} = \sqrt{1+3.85^2} = 3.98,\qquad
\left(\frac{\Delta p}{p_c}\right)_{min} = \frac{1}{2(3.98)} = \mathbf{12.6\ \%}$$
**Is 18 % acceptable?** Yes, with margin: $k = 1/(2\times0.18) = 2.78$ against
$k_{crit} = 3.98$, a gain margin of 1.43 (about 3.1 dB). That is a reasonable but
not generous margin; full credit requires stating the margin, not just "yes".
Credit also for noting that the model neglects feed-line inertance, which erodes
the margin, and that $\tau$ is uncertain — at $\tau = 1.3$ ms the requirement
would rise to about 17 % and 18 % would be marginal.

**Q7 (10 pts).** $R_u = 5200/2100 = \mathbf{2.48}$.
**Prediction:** the oxidizer stream carries roughly 2.5 times the
diameter-weighted momentum of the fuel stream, so at the impingement point the
oxidizer punches through and carries the fuel with it. The resulting sheet is
deflected toward the original fuel-jet side, the spray fan is asymmetric, and the
mixture ratio is stratified across the fan — oxidizer-rich on one side. Mixing
efficiency will be well below the achievable optimum and, if this is an outer-row
element, the deflected fan is a wall-streak risk.

**A change that balances it without reducing either $\Delta p$:** split the
oxidizer into two orifices per element, converting the doublet into an O-F-O
triplet. At constant $\dot m_o$ and constant $\Delta p$, each orifice has
$d_o' = d_o/\sqrt2$, so $R_u$ falls by $\sqrt2$ to 1.75. Splitting into three
gives $R_u = 2.48/\sqrt3 = 1.43$; four gives 1.24. Equivalently and equally
creditable: raise the *fuel* pressure drop rather than lowering the oxidizer's
(which raises $\rho_f V_f^2 d_f \propto \Delta p_f^{3/2}$, so
$\Delta p_f$ must rise by $2.48^{2/3} = 1.83\times$) — correct, but it costs pump
head, so the triplet is the better answer.

**Q8 (10 pts).** 2 pts each:

| engine | element |
|---|---|
| J-2 | **shear coaxial** — 614 concentric LOX posts with fuel annuli, through a porous sintered faceplate |
| RD-170 | **coaxial swirl** |
| Merlin 1D | **pintle** (single central element, fixed area) |
| Apollo SPS (AJ10-137) | **unlike-impinging doublet**, unbaffled |
| Aestus | **coaxial swirl**, 132 elements |

Example justification (any one, well argued, for the remaining 0 pts of credit —
this part is graded within the 10): *the Aestus runs at 11 bar chamber pressure as
a pressure-fed upper stage, where every bar of injector $\Delta p$ is a bar of
tank pressure across the whole propellant volume and therefore tank mass. A swirl
element atomizes by centrifugal sheet spreading rather than by kinetic energy, so
it produces a fine spray at low $\Delta p$ where an impinging doublet would not.
That is how the engine reaches 324 s from an 11 bar chamber.*

**Q9 (12 pts).** At 35 % thrust with a fixed-area injector,
$\Delta p \propto \dot m^2 \propto F^2$ and $p_c \propto F$:
$$\left.\frac{\Delta p}{p_c}\right|_{35\%} = 22\%\times\frac{0.35^2}{0.35}
= 22\%\times0.35 = \mathbf{7.7\ \%}$$
Well below any plausible chug threshold.

*Mitigation 1 — dual-manifold (dual-orifice) injector.* A second set of orifices,
separately valved, is shut off below a threshold thrust; the active area halves,
so at 35 % thrust the flow per active orifice is 70 % of design and
$\Delta p$ is 49 % of design against a $p_c$ of 35 %, giving 31 %. *Reason to
reject:* the switch is a discontinuity — a thrust and mixture-ratio transient
mid-throttle, plus an extra valve, an extra manifold, and a pattern that changes
character across the switch point, all of which must be qualified.

*Mitigation 2 — cavitating venturis upstream of the injector.* Choke each feed
line so the flow is set by upstream pressure alone and is independent of chamber
pressure; the injector feedback gain goes to zero and chug is impossible at any
$\Delta p/p_c$. *Reason to reject:* the venturi imposes a large permanent pressure
drop that the pumps must supply at *all* thrust levels, and it must remain
cavitating across the entire range — if it unchokes at some operating point the
protection vanishes exactly where it was needed.

*Also acceptable:* a variable-area (pintle or moving-sleeve) injector — reject on
mechanism complexity and hot moving parts; or gas injection (adding a small
inert or fuel-rich gas flow to raise the injector's effective stiffness) — reject
on system complexity and performance loss.

**Q10 (10 pts).** Two most probable explanations for $E_m = 84$ % and a good
patternation map but $\eta_{c^*} = 0.93$:

1. **Vaporization, not mixing, is the limiting process.** $E_m$ and patternation
   are both cold-flow measurements of *where the mass goes*, and neither measures
   drop size — cold flow at atmospheric back pressure is not an atomization test
   (WE2). If the SMD is coarse, drops leave the chamber before evaporating and
   $c^*$ suffers no matter how well the mass was distributed. Eq. 3.16 is the
   check: is $t_v > t_s$?
2. **Film cooling and wall-boundary flow are being charged against $c^*$.**
   Propellant that is deliberately routed along the wall as a fuel-rich film does
   not burn at the design mixture ratio, and if $\eta_{c^*}$ is computed against
   equilibrium CEA at the *overall* mixture ratio with *total* flow, a 3–5 % film
   budget alone accounts for several points. This is a bookkeeping problem, not a
   hardware problem.

*The single distinguishing measurement:* recompute $\eta_{c^*}$ with the film-
cooling flow removed from the core flow and the core mixture ratio corrected —
i.e. compare measured $c^*$ against CEA for the *core* mixture ratio and core
flow only. If the deficit disappears, it was explanation 2. If it persists, it is
explanation 1, and the follow-up is a hot-fire $L^*$ variation (or a
back-pressurised spray measurement) to confirm vaporization-limited combustion.

Also creditable as a third candidate, worth partial credit if the discriminating
test is stated: a leak between manifolds or a blocked circuit changing the true
mixture ratio away from the assumed one — distinguished by an independent
flowmeter check on each circuit.

---

## K3. Trade-study reference solution (T1)

### The problem restated

100 kN vacuum methalox, $p_c = 60$ bar, $MR = 3.4$, pump-fed, **40–100 % throttle
with five restarts**, $L^* \leq 1.1$ m, regeneratively cooled chamber with 500 s
cumulative life, 50 engines per year.

### Baseline numbers everyone should compute first

From N8: $\dot m = 28.7$ kg/s, $\dot m_o = 22.2$ kg/s, $\dot m_f = 6.5$ kg/s. At
$\Delta p/p_c = 20$ % (12 bar), $V_o = 36.7$ m/s, $V_f = 60.3$ m/s,
$A_{o,tot} = 5.30$ cm², $A_{f,tot} = 2.56$ cm².

**The binding constraint is the 40 % throttle point.** For any fixed-area
injector,
$$\left.\frac{\Delta p}{p_c}\right|_{40\%} = 20\%\times0.40 = 8.0\ \%$$
against a requirement that, for a chamber with $t_s \approx L^*\rho_c c^*/p_c
\approx 1.4$ ms and a methane/LOX time lag of roughly 0.6–1.0 ms, is somewhere
between 12 % and 17 % (Eq. 3.8). **Every fixed-area option fails chug at 40 %
thrust unless the full-thrust drop is raised.** The required full-thrust drop to
hold 15 % at 40 % thrust is $15\%/0.40 = 37.5$ %, which is 22.5 bar on each
circuit — a substantial pump-head penalty, roughly doubling the injector's
contribution to discharge pressure. That single calculation should organise the
whole answer.

### Option-by-option

**(a) Fixed-area pintle.**
- *Chug at 40 %:* still 8 % on a fixed-area pintle — the pintle geometry does not
  by itself solve the square law. But a pintle is uniquely easy to make
  variable-area (a moving sleeve), and the Merlin's demonstrated 40–100 % on a
  fixed-area pintle indicates the architecture tolerates the low drop better in
  practice, plausibly because the single annular element is not susceptible to the
  element-to-element flow redistribution that makes a multi-element face
  chug-sensitive. Treat this as empirical, not proven [J].
- *$\eta_{c^*}$:* the weakest of the four, typically 1–2 points below a developed
  multi-element face, because mixing is coarse.
- *High-frequency stability:* the best of the four by a wide margin, on a strong
  empirical record [Dressler00].
- *Wall/face:* the face is largely structure and is easy to keep cool; but the
  spray cone impinges on the wall at a defined station and must be managed, and
  the pintle tip is a hot loaded part in the middle of the flame with a 500 s life
  requirement.
- *Manufacturing at 50/yr:* the cheapest. One element to make, one to inspect, no
  hole pattern, no braze-critical faceplate.
- *Development risk:* lowest. One element to develop and characterise.

**(b) Shear coaxial, ~90 elements.**
- *Physics check first:* both propellants are **liquids** here (LOX and LCH4).
  $V_f/V_o = 60.3/36.7 = 1.64$ and
  $J = \rho_f V_f^2/(\rho_o V_o^2) = (423)(60.3)^2/((1140)(36.7)^2) = 1.00$.
  Velocity ratio 1.6 against the 10–20 that makes a shear coaxial element work.
  **There is no gas stream to do the shearing.** This option is close to
  physically inappropriate as specified, and saying so is the single most valuable
  observation a student can make.
- It becomes viable only if the fuel is injected as a *gas* — which a
  gas-generator or tap-off cycle, or a fuel-rich preburner in a staged-combustion
  cycle, would in fact provide. If the "staged-combustion-class" feed means
  fuel-rich hot gas at the injector, the option transforms: $\rho_f$ drops by an
  order of magnitude, $V_f$ rises to 200 m/s or more, VR and $J$ land in the right
  band, and this becomes a strong candidate with excellent atomization and a face
  that is easy to transpiration-cool.
- *A complete answer states this conditionality explicitly.*

**(c) Unlike-doublet impinging, ~180 elements.**
- *Chug at 40 %:* 8 %, fails, needs the 37.5 % full-thrust drop.
- *$\eta_{c^*}$:* the highest achievable of the four if developed properly.
- *High-frequency stability:* the highest risk. 180 elements in a ring pattern is
  exactly the geometry that couples to transverse modes, and methalox time lags
  are short. Expect to need baffles or acoustic cavities, and budget for them in
  mass and in face cooling.
- *Wall/face:* well-understood; outer-row biasing and film-cooling rings are
  standard. Doublet fans must be oriented to avoid wall impingement.
- *Throttling:* worst. Impinging elements degrade badly as velocity falls — the
  jets miss, the sheet thickens, atomization coarsens, and reactive/momentum
  balance shifts. 40 % thrust means 63 % of design velocity and 40 % of design
  momentum.
- *Manufacturing at 50/yr:* ~360 precisely angled orifices per engine, each
  needing flow verification, plus a braze-critical assembly. At 50 units/year this
  is the dominant recurring cost.
- *Development risk:* highest, and historically measured in years [OY93].

**(d) Swirl coaxial, ~90 elements.**
- *Chug at 40 %:* same square-law problem, but with an important mitigation: swirl
  elements tolerate low $\Delta p$ far better than impinging ones, because
  atomization comes from centrifugal sheet spreading rather than from kinetic
  energy. The *spray quality* at 40 % thrust is much less degraded than option
  (c)'s. The chug requirement is unchanged and still needs the higher design drop.
- *$\eta_{c^*}$:* good, comparable to (c) in mature designs. This is the Russian
  standard for exactly this propellant class, and SpaceX states Raptor uses
  coaxial swirl (a company claim).
- *High-frequency stability:* moderate. Better than (c) — the distributed sheet
  spreads heat release axially — but worse than the pintle.
- *Wall/face:* good; the hollow cone can be aimed, and the outer row can be
  biased fuel-rich straightforwardly.
- *Manufacturing at 50/yr:* moderate. Swirl elements have large orifices
  (low $C_d$, Eq. 3.21) that are tolerant and hard to block, but each element is a
  small assembly with tangential ports — this is a strong candidate for additive
  manufacturing of the element bodies, with the metering ports finished
  conventionally.
- *Development risk:* moderate, and lower than (c) because swirl elements are less
  sensitive to dimensional error than impinging ones (no impingement to miss).

### Recommendation

**Option (a), a pintle — specifically a variable-area pintle if the throttle
requirement is treated as firm, and a fixed-area pintle at an elevated
full-thrust $\Delta p$ of about 30 % if it is not.**

The reasoning, in order of weight:
1. The **40 % throttle requirement with five restarts** is the binding constraint,
   and the pintle is the only one of the four architectures with a demonstrated
   answer to it — the LMDE at 10:1 and the Merlin at 40–100 %.
2. **50 engines per year** makes recurring manufacturing and inspection cost a
   first-order term, and the pintle collapses it.
3. **High-frequency stability** is the largest schedule risk in any new
   combustion device, and the pintle has the best record; the alternative (c)
   has the worst.
4. The $\eta_{c^*}$ penalty of 1–2 points is real and is the price paid. On a
   100 kN engine at 355 s that is roughly 4–7 s of $I_{sp}$, which for most
   missions is a worse trade than a two-year development slip.

### The two strongest arguments against the recommendation

1. **Performance.** If this is an upper-stage or in-space engine where $I_{sp}$
   is the figure of merit, giving up 1–2 points of $\eta_{c^*}$ is exactly the
   wrong trade, and option (d) — swirl coaxial at an elevated design $\Delta p$ —
   gives most of the throttle tolerance with better mixing.
2. **Chamber life.** The pintle's spray cone impinges on the wall at a defined
   axial station, and the 500 s cumulative life requirement on a regeneratively
   cooled wall makes that a real risk. A multi-element face distributes the heat
   load more evenly and gives finer control over the wall boundary layer. If
   thermal analysis shows the pintle's impingement station cannot be cooled, the
   recommendation flips to (d).

### The single test that would most quickly show the recommendation is wrong

**A short-duration hot fire on a heat-sink (calorimetric) chamber with
axially distributed wall thermocouples, run at 100 %, 60 % and 40 % thrust.**
It measures, in one test series, the three things the recommendation depends on:
$\eta_{c^*}$ at each throttle point (is the mixing penalty 1 point or 4?), the
axial heat-flux profile (does the spray cone put an unmanageable peak at one
station?), and the chug behaviour at 40 % (does the low $\Delta p/p_c$ actually
produce an oscillation?). No cold-flow test answers any of the three.

### Rubric

**A strong answer must contain:**
- The $\Delta p/p_c = 20\% \times 0.40 = 8$ % calculation, or equivalent, and the
  recognition that this is the binding constraint that discriminates the options.
- The observation that option (b) as specified has VR ≈ 1.6 and $J$ ≈ 1 with two
  liquid propellants, and is therefore inappropriate unless the fuel arrives as a
  gas — with the conditional case stated.
- A quantitative $\eta_{c^*}$ trade, not merely "the pintle performs worse".
- Explicit treatment of the 50-units/year production constraint, which most
  students ignore.
- A named test, with what it would show and why cold flow would not.
- Named real engines supporting each option.

**Loses marks for:**
- Recommending the impinging face on the grounds of "highest performance" without
  addressing throttling, stability risk or manufacturing cost.
- Treating "pintle = stable" as an axiom rather than a strong empirical record
  with a plausible mechanism.
- Any answer that does not notice that a fixed-area injector cannot hold chug
  margin at 40 % thrust.
- Quoting Raptor figures without the company-claim caveat.
- Inventing numbers for engines rather than taking them from the course data.

---

## K4. Common wrong answers and what they reveal

**Using ideal velocity instead of $C_d$-corrected velocity in a momentum
calculation.** Writing $V = \sqrt{2\Delta p/\rho}$ into a Rupe or TMR calculation
overstates momentum by $1/C_d^2 \approx 1.8$ on both streams. It usually cancels
in a *ratio* — which is why students get away with it — but it does not cancel
when the two circuits have different $C_d$, and it never cancels in a pintle TMR
against a gas stream. It reveals that the student has not internalised that $C_d$
is a real, measured, circuit-specific number.

**Treating $C_d$ as a constant of the hole.** The same orifice has three
different $C_d$ values depending on whether it is running full, cavitating, or
flipped, plus a Reynolds dependence at low flow. Students who size an injector at
one $C_d$ and never revisit it at the throttle points are reproducing a real
development failure.

**Believing more pressure drop always improves stability.** This is the single
most common serious error. It conflates chug (feed-coupled, fixed by $\Delta p$)
with screech (acoustic, made *worse* by the higher injection velocity and the
heat release moved toward the face). It reveals a student who has learned the
15–25 % rule as a fact rather than as the output of a specific model with specific
assumptions.

**Getting the chug trend with $t_s$ backwards.** Many students reason that a
larger chamber has "more to destabilise" and predict that long-$L^*$ chambers
need more pressure drop. The algebra says the opposite:
$k_{crit} = \sqrt{1+(\omega t_s)^2}$ increases with $t_s$, so chamber volume is a
stabilising capacitance. The error reveals reasoning by analogy rather than from
the characteristic equation.

**Confusing $E_m$ with $\eta_{c^*}$.** They are correlated but not the same
quantity. $E_m$ is a cold-flow uniformity index measured on collected mass;
$\eta_{c^*}$ is a hot-fire performance ratio that also contains vaporization,
kinetics, and any film-cooling bookkeeping. An injector can have $E_m = 85$ % and
$\eta_{c^*} = 0.93$, and diagnosing which one is the problem is a real skill
(Q10).

**Using cold-flow drop-size data as if it were chamber atomization.** WE2 shows
$\mathrm{We}_g$ at chamber density is seven times its bench value in air. Students
who present atmospheric spray measurements as evidence about in-chamber SMD are
making a factor-of-two error in drop size and a factor-of-four error in
vaporization time.

**Applying the Ingebo or Lefebvre correlations as if they were physics.** Both are
fitted correlations with constants that vary between sources and that were
obtained outside rocket conditions. Quoting an SMD to three significant figures
from either one reveals a student who has not read the caveats in [LM].

**Treating $L^*$ as an independent chamber design variable.** $L^*$ is an
atomization requirement in disguise (Eq. 3.16). Students who pick $L^*$ from a
table and then design an injector, rather than checking that the injector's SMD
is consistent with the chosen $L^*$, have the causality backwards — and will not
be able to explain why a better injector permits a lighter chamber.

**Assuming uniform mixture ratio across the face is the goal.** Reveals that the
student has thought about performance and not about the wall. Every flown injector
is stratified.

**Naming the pintle as unconditionally superior.** Usually traceable to reading
vendor literature [Dressler00] uncritically. The pintle's stability record is
strong and its manufacturing advantage is real, but it gives up mixing fineness,
it puts a loaded hot part on the axis, and it is not immune to chug — which is a
feed-system phenomenon indifferent to element count.

**Quoting Raptor or other in-development figures as verified data.** Every Raptor
number in this course is a company claim, several originating in social-media
statements rather than documents. Using them without attribution is a
data-hygiene failure, and it is exactly the habit that gets an engineer into
trouble in a design review.
