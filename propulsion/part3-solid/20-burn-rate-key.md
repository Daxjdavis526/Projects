# Module 20 — Solid Combustion and Burn Rate — Answer Key

Key for [`20-burn-rate.md`](20-burn-rate.md). Contains full solutions to the
problems, quiz answers with explanations, the trade-study reference solution
and rubric, and the wrong answers students actually give.

Constants and generic propellant throughout, as in the module:
$a = 3.2\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵, $n = 0.35$, $\rho_p = 1750$ kg/m³,
$c^* = 1500$ m/s, $\sigma_p = 0.0020$ K⁻¹, $\gamma = 1.18$
($\Gamma = 0.6446$), $g_0 = 9.80665$ m/s². Numbers are carried at full
precision and reported to four significant figures; last-digit differences
from your own arithmetic are not errors.

The governing relations used constantly below:

$$p_c = (a\rho_pc^*K_n)^{\frac{1}{1-n}},\quad
r = ap_c^{\,n},\quad
\dot m = \rho_pA_br = \frac{p_cA_t}{c^*},\quad
\pi_K = \frac{\sigma_p}{1-n},\quad
\frac{\delta p_c}{p_c} = \frac{1}{1-n}\sum\frac{\delta(\cdot)}{(\cdot)}$$

At $n = 0.35$ the amplification exponent is $1/(1-n) = 1.5385$. Memorise it
for this key; almost every answer uses it.

---

## K1. Problem solutions

### Conceptual

**C1 — Doubling the length at fixed cross-section, throat, and propellant.**

The trap is that "doubling total impulse" sounds like a scaling operation, but
only $A_b$ was scaled. For an internal-burning grain of unchanged
cross-section, $A_b \propto$ length, so $A_b$ doubles while $A_t$ is fixed:
$K_n$ doubles.

$$\frac{p_{c,2}}{p_{c,1}} = 2^{1/(1-n)} = 2^{1.5385} = 2.904$$

**Chamber pressure nearly triples.** Thrust $F = C_fp_cA_t$ rises by the same
factor (2.90×, a little more once $C_f$ is corrected for the higher
$p_c/p_a$). Burn rate rises as $r \propto p_c^{\,n} = 2.904^{0.35} = 1.443$,
so with the web unchanged the burn time falls to $1/1.443 = 0.693$ of nominal.
Check on total impulse: $2.904\times0.693 = 2.01 \approx 2$ ✓ — the impulse did
double, as promised, but by a route nobody intended.

**Correct design action:** to double impulse at constant pressure, double
$A_t$ as well, keeping $K_n$ fixed. Then $p_c$ is unchanged, thrust doubles,
burn time is unchanged, and the case does not need redesigning.

**Least trustworthy prediction, and why:** the pressure. Three reasons, any
one of which earns the mark. (i) $a$ and $n$ were fitted over a bounded
pressure range; a factor-2.9 extrapolation is outside it and the propellant
may plateau, or $n$ may rise. (ii) At the doubled length with the same port,
the aft-end mass flux roughly doubles while the port area is unchanged, so
erosive burning that was absent is now likely, and it feeds back (WE4) — the
real pressure would be higher still. (iii) The motor almost certainly exceeds
MEOP, so the question of what pressure it reaches is academic.

**C2 — Graphical stability.**

Both curves start at the origin. Discharge $\dot m_{noz} = pA_t/c^*$ is a
straight line through the origin. Generation $\dot m_{gen} = \rho_pA_bap^n$ is
a power law through the origin.

- **$n = 0.4$:** the generation curve is *concave* — it rises steeply near
  zero (infinite slope at $p=0$) and flattens. It therefore starts above the
  line and crosses it once, from above to below. Right of the crossing,
  discharge > generation, so $dp/dt<0$ and $p$ returns to $p_{eq}$; left of it,
  generation > discharge, so $p$ rises to $p_{eq}$. **Single, globally stable
  equilibrium.**
- **$n = 1.3$:** the generation curve is *convex* — zero slope at the origin,
  rising ever more steeply. It starts *below* the line and crosses it once,
  from below to above. Right of the crossing, generation > discharge, so
  $p$ rises, which increases the excess: **runaway**. Left of it, discharge >
  generation, so $p$ falls to zero: **extinction**. The crossing is an
  unstable equilibrium; the motor either bursts or goes out.

Full marks require the arrow argument (which side of the crossing, which way
$p$ moves), not just "concave is stable".

**C3 — Why $\pi_K > \sigma_p$, physically.**

$\sigma_p$ is measured at *constant pressure*: a warmer grain needs less heat
from the flame to raise its surface from $T_i$ to $T_s$, so the surface eats
into the solid faster. In a motor the pressure is not held constant. The
faster-burning surface makes more gas per second; the throat is fixed and can
only pass more gas at higher pressure; so the pressure rises. But a higher
pressure moves the flame closer to the surface and raises the burn rate again
— a positive feedback which converges (because $n<1$) at a burn rate and
pressure both higher than the constant-pressure prediction. **The
constant-pressure sensitivity is only the first round of a converging
feedback loop; $1/(1-n)$ is the sum of the series.**

**C4 — The flat region.**

This is **plateau burning** ($n \approx 0$ over that band). Mechanism: at lower
pressure the luminous flame stands off beyond a chemical induction region (the
dark zone in a double-base or nitramine propellant, or an equivalent
flame-standoff effect in a catalysed composite) and does not feed the surface
efficiently. As pressure rises, two effects partly cancel: the flame moves
closer (raising $r$) while the reaction that controls the standoff saturates
or is catalytically short-circuited, so the net heat feedback to the surface
stops increasing. Lead and copper salts in double-base propellants produce
this deliberately by catalysing the NO₂→NO step.

*Advantage of operating there:* $1/(1-n) \to 1$. Chamber pressure becomes
insensitive to $K_n$ error, throat erosion, grain-crack $A_b$ excursions, and
lot scatter in $a$; and $\pi_K = \sigma_p/(1-n) \to \sigma_p$, so temperature
sensitivity collapses to its minimum. A plateau propellant is the safest
propellant a designer can be given.

*Hazard:* the plateau has edges. Operate near the upper edge and any excursion
carries you into a region where $n$ jumps — sometimes sharply — and the motor
behaves like a different design. Worse, some plateau propellants have a *mesa*
($n<0$) region followed by a steep rise; extrapolating an $r=ap^n$ fit from the
flat band into either neighbour is a serious error. The propellant must be
characterised across the whole credible pressure excursion, not just at
nominal.

**C5 — The shared mechanism.**

Both are **convective augmentation of the heat flux to the burning surface by
gas moving parallel to it.** In erosive burning the parallel velocity is the
steady mean flow down the port; in velocity-coupled combustion instability it
is the oscillating velocity of an acoustic mode, which is largest at a
*pressure node* — i.e. precisely where the pressure-coupled response is
smallest. Both increase $r$ relative to $ap^n$; both are moderated by the
blowing (transpiration) of gas leaving the surface.

*Why an unstable motor runs at higher mean pressure (the DC shift):* the
augmentation depends on the *magnitude* of the velocity, not its sign, so it
does not average out over a cycle. Over one acoustic period the surface spends
half the cycle with flow one way and half the other, and is augmented in both.
The time-averaged burn rate therefore rises, mean $\dot m$ rises, and with a
fixed throat the mean pressure rises with it. This is why an instability can
exceed MEOP even at a modest oscillation amplitude, and why oscillation
amplitude alone is not an adequate acceptance criterion.

**C6 — Aluminium particle size as a stability specification.**

Condensed Al₂O₃ droplets in the gas do not follow an acoustic oscillation
exactly; they lag, and the relative motion dissipates acoustic energy through
Stokes drag. The damping per unit mass of particles is maximised when the
particle velocity relaxation time matches the acoustic period:

$$\omega\tau_p \approx 1,\qquad \tau_p = \frac{\rho_{p,part}\,d^2}{18\mu}
\;\Longrightarrow\;
d_{opt} = \sqrt{\frac{18\mu}{\rho_{p,part}\,\omega}}$$

Particles much smaller than $d_{opt}$ follow the gas and dissipate nothing;
much larger and they are effectively stationary and again exchange little
energy per cycle. With $\rho = 3960$ kg/m³ and $\mu = 8\times10^{-5}$ Pa·s:
$d_{opt} \approx 24\ \mu$m at 100 Hz, $11\ \mu$m at 500 Hz, $5.4\ \mu$m at
2 kHz — the production aluminium powder range. Because $d_{opt}\propto
\omega^{-1/2}$, a single powder size cannot be optimal for every mode, and a
motor whose mode frequencies sweep during the burn will be well damped for
only part of its firing.

**C7 — Two 15 % pressure excesses of different shape.**

*Hump that decays in ~4 s:* **erosive burning.** The augmentation depends on
port mass flux $G = \dot m/A_p$; $A_p$ is smallest at ignition and grows
monotonically as the grain regresses, so $G$ falls and the augmentation shuts
itself off. The excess is largest at $t=0$ and self-extinguishing.

*Excess that starts small and grows:* **a propellant–liner debond (or a
propagating crack).** The exposed area grows as gas works its way further along
the debond, so the uncounted $A_b$ increases with time. It is not
self-limiting; it typically ends in case overheat at the debond azimuth or an
overpressure.

*The physical reason the shapes differ:* the erosive mechanism is driven by a
geometric quantity ($A_p$) that the burn itself increases, giving negative
feedback; the debond mechanism is driven by a quantity ($A_b$) that the burn
itself also increases, giving positive feedback. **Same sign of pressure error,
opposite sign of feedback, hence opposite trend.** A one-line diagnostic: an
erosive hump correlates across a motor family with initial $J$; a debond
correlates with nothing but that unit's build record.

**C8 — Quasi-steady assumption, $L^*=1.5$ m, $r=6$ mm/s.**

The two competing time scales:

$$\tau_{fill} = \frac{L^*}{c^*\Gamma^2} = \frac{1.5}{1500\times0.6446^2}
= 2.407\times10^{-3}\ \mathrm{s}$$
$$\text{pressure relaxation} = \frac{\tau_{fill}}{1-n} = \frac{2.407\ \mathrm{ms}}{0.65} = 3.702\ \mathrm{ms}$$
$$\tau_{th} = \frac{\alpha}{r^2} = \frac{2\times10^{-7}}{(6\times10^{-3})^2} = 5.556\times10^{-3}\ \mathrm{s} = 5.556\ \mathrm{ms}$$

The assumption is: *the chamber and the propellant surface both reach their
new equilibrium much faster than the geometry ($K_n$) changes.* During the
main burn $K_n$ changes on a scale of seconds, so with millisecond relaxation
the ratio is $\sim10^3$ and the assumption is excellent.

It fails: (i) **during the ignition transient**, where pressure changes by its
full value in a few milliseconds — comparable to both relaxation times;
(ii) **during tail-off**, where the trace changes on the same millisecond
scale; (iii) **in any acoustic oscillation**, whose period (ms or less) is at
or below $\tau_{th}$, so the surface response lags the pressure and $r=ap^n$
is simply not the constitutive law any more.

Note here that $\tau_{th} = 5.6$ ms *exceeds* the pressure relaxation time of
3.7 ms. That ordering is the warning sign for $L^*$ instability: the chamber
can change pressure faster than the solid can change its burn rate.

### Calculation

**N1.**

$$A_t = \frac{\pi(0.075)^2}{4} = 4.418\times10^{-3}\ \mathrm{m^2},\qquad
K_n = \frac{1.85}{4.418\times10^{-3}} = 418.8$$

$$p_c = \left[(3.2\times10^{-5})(1750)(1500)(418.8)\right]^{1.5385} = 9.868\times10^{6}\ \mathrm{Pa}$$

$$\boxed{p_c = 9.868\ \mathrm{MPa}\ (1431\ \mathrm{psia})}$$

$$r = 3.2\times10^{-5}(9.868\times10^{6})^{0.35} = 8.977\ \mathrm{mm/s}$$
$$\dot m = \rho_pA_br = 1750\times1.85\times8.977\times10^{-3} = 29.06\ \mathrm{kg/s}$$
Cross-check: $p_cA_t/c^* = 9.868\times10^6\times4.418\times10^{-3}/1500 = 29.06$ kg/s ✓
$$F = C_fp_cA_t = 1.60\times9.868\times10^{6}\times4.418\times10^{-3} = 69.75\ \mathrm{kN}$$

**N2.** Solve $a$ from the quoted point:
$$a = \frac{r}{p^{n}} = \frac{6.5\times10^{-3}\ \mathrm{m/s}}{(6.9\times10^{6}\ \mathrm{Pa})^{0.30}}
= \frac{6.5\times10^{-3}}{112.6} = 5.771\times10^{-5}\ \mathrm{m\,s^{-1}Pa^{-0.30}}$$

$$r(10\ \mathrm{MPa}) = 5.771\times10^{-5}\times(10^{7})^{0.30} = 7.265\ \mathrm{mm/s}$$

Sanity: pressure up 45 %, rate up 11.8 %. $1.449^{0.30} = 1.118$ ✓ — the
low exponent is doing its job.

**N3.** $A_b = 350\times7.854\times10^{-3} = 2.749$ m² is fixed. Required
$K_n$ for 10.0 MPa:
$$K_n = \frac{p_c^{\,1-n}}{a\rho_pc^*} = \frac{(10^{7})^{0.65}}{(3.2\times10^{-5})(1750)(1500)}
= \frac{3.548\times10^{4}}{84.0} = 422.4$$
$$A_t = \frac{A_b}{K_n} = \frac{2.749}{422.4} = 6.508\times10^{-3}\ \mathrm{m^2}
\;\Longrightarrow\; D_t = 0.09103\ \mathrm{m} = 91.03\ \mathrm{mm}$$

An **8.97 % reduction in throat diameter** (17.1 % in area) buys a 33.6 %
pressure rise. Thrust:
$$\frac{F_2}{F_1} = \frac{p_{c,2}A_{t,2}}{p_{c,1}A_{t,1}} = \frac{10.0\times6.508\times10^{-3}}{7.488\times7.854\times10^{-3}} = 1.107$$
so thrust rises **10.7 %**, from 91.16 kN to 100.9 kN. Note again how much
smaller the thrust change is than the pressure change — the general result
$\delta F/F = [n/(1-n)]\,\delta p_c/p_c \cdot$ … or directly, $F\propto
p_cA_t \propto A_t^{1 - 1/(1-n)} = A_t^{-n/(1-n)} = A_t^{-0.538}$.

**N4.** Reference $+20$ °C, so $\Delta T = -60$ K at $-40$ °C and $+40$ K at
$+60$ °C.

*Propellant 1* ($\sigma_p = 0.0020$, $n = 0.35$): $\pi_K = 0.0020/0.65 =
3.077\times10^{-3}$ K⁻¹.
$$p_{cold} = 7.00\,e^{-0.1846} = 5.820\ \mathrm{MPa},\qquad
p_{hot} = 7.00\,e^{0.1231} = 7.917\ \mathrm{MPa}$$
$$\frac{p_{hot}}{p_{cold}} = e^{\pi_K\times100} = 1.360$$

*Propellant 2* ($\sigma_p = 0.0045$, $n = 0.62$): $\pi_K = 0.0045/0.38 =
1.184\times10^{-2}$ K⁻¹ — nearly four times larger.
$$p_{cold} = 7.00\,e^{-0.7105} = 3.440\ \mathrm{MPa},\qquad
p_{hot} = 7.00\,e^{0.4737} = 11.24\ \mathrm{MPa}$$
$$\frac{p_{hot}}{p_{cold}} = 3.268$$

**Case-design consequence.** With propellant 1 the case is sized against
7.92 MPa; with propellant 2 against 11.24 MPa, 42 % higher, for the same
nominal motor. For a thin-walled pressure vessel the membrane thickness and
hence case mass scale roughly with design pressure, so propellant 2 costs
roughly 40 % of the case mass — a large fraction of the inert mass of a
composite-cased motor — before any of the other consequences (grain-crack
sensitivity, lot-scatter amplification, tighter $A_b$ tolerance) are counted.
The cold end is a problem too: at 3.44 MPa the motor is approaching the
deflagration limit region for many composites, $C_f$ and $I_{sp}$ are degraded,
and the burn time is 3.3 times the hot-day value — which the guidance and the
thermal protection must both tolerate.

**N5.** $A_t(t) = A_{t,0}(1+0.06\,t/90)$, $A_b$ constant at
$350\,A_{t,0}$, so $K_n(t) = 350/f$ with $f = A_t/A_{t,0}$:
$$p_c(t) = p_{c,0}f^{-1/(1-n)} = 7.488\,f^{-1.5385}\ \mathrm{MPa},\qquad
F(t) = C_fp_c(t)A_t(t) = F_0\,f^{-0.5385}$$

| $t$ [s] | $f = A_t/A_{t,0}$ | $p_c$ [MPa] | $F$ [kN] |
|---|---|---|---|
| 0 | 1.000 | 7.488 | 91.16 |
| 30 | 1.020 | 7.264 | 90.19 |
| 60 | 1.040 | 7.050 | 89.25 |
| 90 | 1.060 | 6.846 | 88.34 |

Over the burn: **$p_c$ falls 8.57 %, thrust falls only 3.09 %.** The ratio of
the two is $n/(1-n)\div 1/(1-n) = n = 0.35$… more precisely, in logarithmic
terms $\ln(0.9143)/\ln(0.9691) = 2.86 = 1/n$ — the pressure signal is $1/n$
times the thrust signal. This is the quantitative form of "instrument the
pressure, not just the thrust."

**N6.**
$$J = \frac{A_p}{A_t} = \frac{1.10\times10^{-2}}{6.0\times10^{-3}} = 1.833$$
Subsonic root of $A/A^* = 1.833$ at $\gamma = 1.18$: $M_{port} = 0.345$.
Both indicators are in the danger zone ($J<2$, $M>0.3$).

$$G = \frac{\dot m}{A_p} = \frac{30}{1.10\times10^{-2}} = 2727\ \mathrm{kg/(m^2s)}$$
$$\Delta r = k(G-G_{th}) = 1.8\times10^{-6}(2727-1200) = 2.749\times10^{-3}\ \mathrm{m/s} = 2.75\ \mathrm{mm/s}$$

**Is a coupled solution necessary? Yes, emphatically.** $\Delta r$ is of the
same order as the whole non-erosive burn rate (8–9 mm/s at these pressures),
so it is not a small perturbation: the extra mass will raise $p_c$, which
raises $\dot m$, which raises $G$, which raises $\Delta r$ again. WE4 showed
this loop converging roughly 18 % above the first-pass prediction for a
comparable case. A single evaluation understates the answer, and the error is
in the unconservative direction — which is the worst kind.

**N7.** $A_t(t) = A_{t,0}(1+0.04\,t/90)$; $K_n$ referred to the original
throat, so $p_c = p_{c,noero}\,f^{-1.5385}$.

| $t$ [s] | $K_n$ | $f$ | $p_c$ no erosion [MPa] | $p_c$ with erosion [MPa] | change |
|---|---|---|---|---|---|
| 10 | 358 | 1.00444 | 7.753 | 7.700 | −0.68 % |
| 40 | 332 | 1.01778 | 6.904 | 6.719 | −2.67 % |
| 75 | 250 | 1.03333 | 4.462 | 4.243 | −4.92 % |

**Reading it:** throat erosion tilts the whole trace downward and steepens the
regressive back half. It does *not* move the peak much (the peak occurs early,
before much erosion has happened), so the MEOP-setting point is largely
unaffected — but the total impulse and the burnout condition are. An engineer
sizing the case can be sloppy about erosion; an engineer predicting burnout
velocity cannot.

**N8.**

*(a) RSRM.* Using the module's inferred $A_t = 1.44$ m² (§6.1, flagged [A]),
nominal $p_c = 6.25$ MPa `[NASA-SRB]`/`[WP]` conf B, and $c^* = 1550$ m/s:
$$\dot m = \frac{p_cA_t}{c^*} = \frac{6.25\times10^{6}\times1.44}{1550} = 5806\ \mathrm{kg/s}$$
From the propellant load and action time:
$$\bar{\dot m} = \frac{500{,}000\ \mathrm{kg}}{123.5\ \mathrm{s}} = 4049\ \mathrm{kg/s}$$

The instantaneous figure is 43 % above the mean. **This is not an
inconsistency, it is the thrust shaping.** $A_t$ was inferred from *peak*
thrust (14.7 MN at ≈t+20 s) and the pressure used is nominal, so the 5806 kg/s
is a near-peak flow while 4049 kg/s is the burn average. Cross-check with
thrust: mean thrust $\approx \bar{\dot m}\,I_{sp,SL}\,g_0 = 4049\times242\times9.80665
= 9.61$ MN against a 14.7 MN peak, a peak-to-mean ratio of 1.53 — consistent
with the deep max-Q bucket described in §6.1. Full marks require the student
to *notice* the discrepancy and resolve it as peak-versus-mean rather than
declaring one number wrong.

*(b) Star 48B.*
$$\bar{\dot m} = \frac{2009\ \mathrm{kg}}{87\ \mathrm{s}} = 23.09\ \mathrm{kg/s}$$
$$c^* = \frac{p_cA_t}{\dot m} = \frac{4.0\times10^{6}\times0.0155}{23.09} = 2685\ \mathrm{m/s}$$

**This is not credible.** No AP/Al composite has $c^*$ above about 1600 m/s;
2685 m/s is LOX/LH₂ territory. The mass flow is the solid number here — it
comes from two confidence-B figures (propellant mass and burn time) and needs
no assumptions. The failure is therefore in the *assumed* $p_c$ and $A_t$,
neither of which appears in `_verify-solid-coldgas.md`; they were invented for
this problem, and inventing them produced nonsense. Inverting with a credible
$c^* = 1550$ m/s gives
$$A_t = \frac{\dot m\,c^*}{p_c} = \frac{23.09\times1550}{4.0\times10^{6}} = 8.95\times10^{-3}\ \mathrm{m^2}
\;\Rightarrow\; D_t = 107\ \mathrm{mm}$$
which is a plausible throat for a 66 kN motor.

**What this tells you about confidence labels.** The Star 48B entry in the
verification file gives propellant mass, burn time, thrust and $I_{sp}$ at
conf B–C but carries **no chamber pressure and no throat area**. That absence
is information: it means nobody in this course's source chain has read a
primary document that states them. The right move is to say "not reliably
published" and derive what you can from the mass balance, exactly as above —
not to borrow a plausible-looking number from a secondary source and treat the
resulting $c^*$ as a finding.

### Engineering reasoning

**R1 — Pressure 8 % high after $t=20$ s, thrust 3 % high, throat 2 % small.**

Set up Eq. 3.14 at $n = 0.35$:
$$\frac{\delta p_c}{p_c} = 1.5385\left[\frac{\delta A_b}{A_b} - \frac{\delta A_t}{A_t} + \frac{\delta a}{a} + \frac{\delta c^*}{c^*}\right]$$
The measured throat is 2 % *small* in area, so $\delta A_t/A_t = -0.02$
contributes $+1.5385\times0.02 = +3.08$ %. The remaining $8 - 3.08 = 4.9$ %
requires $\delta A_b/A_b + \delta a/a + \delta c^*/c^* = +3.2$ %.

**The two most likely explanations.**

1. **The throat did not erode as the prediction assumed — or slag deposited in
   it.** If the ballistic prediction carried, say, a $+4$ % area erosion
   allowance and the post-test throat is $-2$ % against nominal, the modelled
   and actual areas differ by ~6 %, worth $1.5385\times0.06 = 9.2$ % of
   pressure — enough to explain the whole excess on its own. Aluminised
   propellants deposit Al₂O₃ slag; a partially slagged throat is *smaller*
   than nominal, and it also spoils nozzle efficiency, which is consistent
   with the thrust running lower than the pressure implies.
2. **Extra burning surface appearing at $t\approx20$ s** — a propellant–liner
   debond or a crack that opened during the burn. The timing is the evidence:
   a wrong propellant lot ($\delta a$) or a wrong grain model ($\delta A_b$ at
   $t=0$) would have shown from the first second, not from $t=20$ s. A
   progressive $A_b$ error would show a *growing* excess (C7) — so check
   whether the 8 % is flat or rising.

**The thrust number is itself a clue.** With $\delta p_c/p_c = +8$ % and
$\delta A_t/A_t = -2$ %, thrust at constant $C_f$ should be
$1.08\times0.98 = +5.8$ %, and a smaller throat at fixed exit area *raises*
$\varepsilon$ and hence $C_f$, pushing it higher still. Measured thrust is only
$+3$ %. Something is eating 3 % of $C_f$ or the thrust measurement is
mis-calibrated. A slagged, roughened throat degrades $C_f$ — which supports
explanation 1.

**The single additional measurement that discriminates:** compute the
**delivered $c^*$ from the closed mass balance**,
$c^*_{del} = \int p_c A_t(t)\,dt \,/\, m_p$, using a *measured* throat-area
history (pre-fire metrology plus post-test metrology, ideally with an
intermediate X-ray or a $C_f$-inversion of the simultaneous thrust and
pressure records). An $A_t$ error propagates straight into $c^*_{del}$ and will
return an impossible efficiency ($\eta_{c^*}>1$, or well below the qualified
value); an $A_b$ or $a$ error will return the correct $c^*_{del}$ while the
burn time comes out short. **The mass balance separates area errors from
rate errors; nothing else on the stand does.**

**R2 — Hot motor: $t_b$ −12 %, $p_{peak}$ +14 %, total impulse +4 %.**

The invariant-impulse argument of §3.7 assumed $I_{sp}$ is independent of
$p_c$. It is not.

- **$C_f$ rises with $p_c$.** At $\varepsilon = 8$, $\gamma = 1.18$, sea level:
  $C_f(7.00\ \mathrm{MPa}) = 1.6081$, $C_f(7.98\ \mathrm{MPa}) = 1.6224$ — a
  gain of **0.88 %**. (Physically: the same nozzle at higher chamber pressure
  has a higher $p_e/p_a$, so less over- or under-expansion loss.)
- **$c^*$ efficiency rises with $p_c$.** Higher pressure means faster gas-phase
  kinetics, more complete aluminium combustion within the residence time, less
  kinetic and two-phase lag. A 1–2 % gain in $\eta_{c^*}$ over a 14 % pressure
  rise is entirely ordinary.
- **Tail-off and sliver losses are smaller for the hot motor.** The cold motor
  spends longer at low pressure near the deflagration limit, where $C_f$ and
  $I_{sp}$ are worst and where some propellant may not be consumed at all.

Adding these: ~0.9 % from $C_f$, 1–2 % from $\eta_{c^*}$, ~1 % from
tail-off/sliver — **about 3–4 %, of the right sign and the right size.** The
sign is right: total impulse should rise with conditioning temperature, and the
"invariant impulse" statement in §3.7 is explicitly a first-order one. A
student who says "the hot motor burned more propellant" has the wrong answer:
the propellant load is identical.

**R3 — 400 Hz, ±4 %, mean +6 %, in a 15–35 s window.**

**Phenomenon:** acoustic combustion instability with a DC shift. 400 Hz is far
above any bulk/$L^*$ mode (tens of hertz) so this is a chamber acoustic mode;
with $a_g \approx 1050$ m/s, 400 Hz corresponds to a first tangential in a port
of about 1.5 m diameter or a first longitudinal in a 1.3 m chamber — compute
whichever matches the hardware to identify the mode. The +6 % mean is the DC
shift (C5).

**Why it appears and disappears in a window.** Three reasons, and a strong
answer gives at least two:
1. **The mode frequency sweeps.** As the grain regresses the port diameter and
   free length grow, so $f_{1T}$ falls and $f_{1L}$ falls. The mode passes
   through the band where the propellant's pressure- and velocity-coupled
   response function is largest, and then out of it.
2. **The gain changes.** The response function peaks near
   $f \sim r^2/(2\pi\alpha)$; $r$ changes with $p_c$ through the burn, moving
   the peak.
3. **The damping changes.** Particle damping is optimal at $\omega\tau_p\approx1$
   for a fixed particle size, so it is well matched only over part of the
   frequency sweep; nozzle damping and the surface-area-to-volume ratio also
   change as the grain burns back.

**Three fixes, increasing programme cost.**
1. *Cheapest:* tighten or change the **aluminium particle-size specification**,
   or add a few percent of inert refractory damping powder, to move the
   particle-damping optimum onto the offending frequency. No tooling change, a
   propellant-lot re-qualification.
2. *Middle:* **geometric mode-breaking** — cut axial slots or add fins to the
   grain, or fit a resonance rod, to destroy the transverse mode shape or
   detune the cavity. Requires new casting mandrels and a re-verification of
   $A_b(t)$, hence a new ballistic prediction and static test.
3. *Most expensive:* **reformulate the propellant** to lower its response
   function, or redesign the motor's $L/D$ and port profile. Full
   re-qualification: strand, T-burner, subscale, full-scale, structural
   re-analysis of the grain.

Note the ordering matches historical practice: programmes reach for the
particle-size knob first because it is the only one that does not invalidate
the qualification data set.

**R4 — Trading $n=0.32$, $\sigma_p=0.0018$ for $n=0.55$, $\sigma_p=0.0035$ to
gain 3 % $c^*$.**

$$\pi_{K,1} = \frac{0.0018}{0.68} = 2.647\times10^{-3}\ \mathrm{K^{-1}},\qquad
\pi_{K,2} = \frac{0.0035}{0.45} = 7.778\times10^{-3}\ \mathrm{K^{-1}}$$

Over a 100 K band ($\pm50$ K about the reference), the hot-day pressure factors
are
$$e^{\pi_{K,1}\times50} = 1.1415,\qquad e^{\pi_{K,2}\times50} = 1.4753$$
so the hot-day pressure — and therefore MEOP, and therefore the case membrane
thickness at a fixed safety factor — rises by
$$\frac{1.4753}{1.1415} = 1.292 \quad\Rightarrow\quad \textbf{+29 \%}$$

Lot scatter compounds it: a $\pm3$ % scatter in $a$ becomes $\pm4.41$ % of
pressure at $n=0.32$ and $\pm6.67$ % at $n=0.55$. A 20 % $A_b$ excursion from a
crack gives $1.20^{1.471}=1.31$ against $1.20^{2.222}=1.51$.

**The argument.** For a thin-walled pressure vessel at fixed volume, case mass
scales roughly with MEOP, so a 29 % MEOP increase is close to a 29 % case-mass
increase. For a filament-wound stage with, say, a 0.92 propellant mass
fraction, the case and inert mass is ~8 % of stage mass; +29 % of that is
+2.3 % of stage mass. The gain is 3 % on $c^*$, which is roughly 3 % on
$I_{sp}$ (at fixed $C_f$).

Through the rocket equation, 3 % on $I_{sp}$ beats 2.3 % on inert mass for
most staging arrangements — **but only just, and the tie is broken by
everything that is not in the $\Delta v$ sum:**
- the 1.4 safety factor is on MEOP, so the *hot-day, cracked-grain, erosive*
  worst case moves further out too, and it moves faster than linearly;
- the cold end is now at $e^{-0.389} = 0.68$ of nominal pressure, a 32 %
  underpressure, with the associated $I_{sp}$, burn-time and possible
  deflagration-limit problems;
- the qualification burden roughly doubles: the propellant must be
  characterised over a wider pressure range because the motor now visits one.

**Recommendation: reject**, unless the mission's $\Delta v$ margin is under
about 1 % and there is no other mass to find. [J] The 3 % $c^*$ is real but
the exponent change is a structural, manufacturing, and qualification cost that
appears in four places at once. If the energy is genuinely needed, the correct
move is to look for a formulation with the higher $c^*$ *and* an $n$ near 0.35
— which is precisely what propellant development programmes spend their money
on.

**R5 — Why the RSRM grain shaping is a pressure problem.**

Thrust is $F = C_f\,p_c\,A_t$, and $p_c = (a\rho_pc^*K_n)^{1/(1-n)}$. With
$A_t$ fixed by the nozzle and $C_f$ nearly constant, **shaping $F(t)$ is
identical to shaping $p_c(t)$, which is identical to shaping $K_n(t)$, which is
identical to shaping $A_b(t)$** — that is what the 11-point star does. But the
shaping is not one-for-one: a $K_n$ excursion appears in pressure amplified by
$1/(1-n)$, so the *pressure* trace is more peaked than the $A_b$ trace. Any
grain shaped to give a deep thrust bucket necessarily gives a deeper relative
pressure bucket, and — crucially — the early peak that precedes the bucket is
correspondingly higher in pressure than in thrust.

**What the case designer had to be told first.** The peak $K_n$ and the
hot-day, worst-lot, erosive stack applied to it — i.e. the MEOP — because the
case membrane, and on the RSRM specifically the **field joints**, are sized
against that number. Joint rotation on the original tang-and-clevis design was
driven by internal pressure; the peak of the shaped trace is precisely the
condition that opened the joint gap. `[Rogers86]`,
`reference/_verify-solid-coldgas.md` §A.1

So the dependency runs both ways and had to be closed iteratively: the grain
designer cannot finish until told the maximum pressure the case and joints will
accept, and the case designer cannot size until told the peak of the shaped
trace. **That coupling — a thrust-shape requirement propagating through
$1/(1-n)$ into a structural requirement — is the single most important systems
lesson in solid-motor design**, and it is why grain design and case design are
never sequential activities.

---

## K2. Quiz answers with explanations

**Q1 (8 pts) — (c) 7.4 %.**

$$\frac{\delta p_c}{p_c} = (1.04)^{1/(1-0.45)} - 1 = 1.04^{1.818} - 1 = 0.0739 = 7.39\ \%$$

(a) 4.0 % assumes the error passes through unamplified — the classic error of
forgetting the exponent entirely. (b) 5.8 % is $1.04^{1+n}$, a garbled
exponent. (d) 9.1 % is $1.04^{1/n}$ — the right idea with $n$ and $1-n$
swapped, which is the second most common slip on this material.

**Q2 (8 pts).**
$$\pi_K = \frac{\sigma_p}{1-n} = \frac{0.0025}{0.60} = 4.167\times10^{-3}\ \mathrm{K^{-1}}$$
$$\Delta T = 55 - (-25) = 80\ \mathrm{K}
\;\Longrightarrow\;
\frac{p_{hot}}{p_{cold}} = e^{4.167\times10^{-3}\times80} = e^{0.3333} = \boxed{1.396}$$

A 40 % pressure spread across the qualification band. Full marks require
$\pi_K$ (not $\sigma_p$) in the exponent; using $\sigma_p$ gives 1.221 and
loses half the marks — it is the single most common error on this material.

**Q3 (10 pts) — (b).**

Erosive burning is driven by the *mass flux* of gas flowing parallel to the
surface. Flux accumulates from head end to nozzle and the port is at its
smallest at ignition, so $G$ peaks at the aft end at early time and decays as
the port opens.

(a) Wrong twice: the pressure is highest at the head end but pressure is not
the driver, and the head end has the *lowest* mass flux (essentially zero at
the forward closure). (c) Wrong: the correlation is in $G^{0.8}$, a convective
heat-transfer scaling, not in $p$. (d) Wrong and dangerously so: raising $r$
raises $\dot m$, and with $A_t$ fixed the only way the nozzle passes more mass
is at higher pressure — the erosive hump *is* a pressure event, which is why
it sizes MEOP (WE4).

**Q4 (12 pts).**
$$A_t = \frac{\pi(0.12)^2}{4} = 1.131\times10^{-2}\ \mathrm{m^2},\qquad
K_n = \frac{3.60}{1.131\times10^{-2}} = 318.3$$
$$p_c = \left[(3.2\times10^{-5})(1750)(1500)(318.3)\right]^{1.5385} = 6.471\times10^{6}\ \mathrm{Pa} = \boxed{6.471\ \mathrm{MPa}\ (938.5\ \mathrm{psia})}$$
$$r = 3.2\times10^{-5}(6.471\times10^{6})^{0.35} = 7.744\ \mathrm{mm/s}$$
$$\dot m = 1750\times3.60\times7.744\times10^{-3} = 48.79\ \mathrm{kg/s}
\quad\left(=\frac{p_cA_t}{c^*} = 48.79\ \mathrm{kg/s}\ \checkmark\right)$$

Marks: 3 for $K_n$, 4 for $p_c$, 2 for $r$, 3 for $\dot m$ *with* the
cross-check. Computing $\dot m$ only one way loses the cross-check mark.

**Q5 (10 pts).**
$$A_{t,2} = \frac{\pi(0.1225)^2}{4} = 1.179\times10^{-2}\ \mathrm{m^2},\qquad
\frac{A_{t,2}}{A_{t,1}} = 1.0421$$
$$p_{c,2} = 6.471\times(1.0421)^{-1.5385} = 6.073\ \mathrm{MPa}\qquad(\mathbf{-6.15\ \%})$$
$$\frac{F_2}{F_1} = \frac{p_{c,2}A_{t,2}}{p_{c,1}A_{t,1}} = 0.9385\times1.0421 = 0.9780
\qquad(\mathbf{-2.20\ \%})$$

The 2.8:1 ratio between the pressure change and the thrust change is $1/n$.
Answering only the pressure loses half the marks; the comparison is the point.

**Q6 (10 pts) — T / F / F / F.**

**(a) True.** The propellant mass is fixed and $I_{sp}$ depends only weakly on
$p_c$, so total impulse is approximately temperature-invariant to first order.
The hot motor trades thrust for burn time. (Second order, it is a few percent
higher — see R2 — so "approximately" is doing real work in the statement.)

**(b) False.** $n>1$ is not a margin problem, it is a *stability* problem: the
equilibrium is unstable (§3.6, C2), so any perturbation runs away. No amount
of case margin fixes a positive feedback loop; the motor bursts or extinguishes
regardless.

**(c) False.** Tail-off carries 2–5 % of total impulse and is the *least
repeatable* part of the trace, so for orbit insertion it is a primary error
source (§6.2, Star 48B).

**(d) False.** $L^*$ instability is a *bulk* (non-acoustic) mode: the whole
chamber pressure rises and falls together at tens of hertz, with no spatial
wave structure. It arises when the chamber filling time approaches the solid
phase's thermal relaxation time. Acoustic instability involves standing waves
at frequencies set by chamber dimensions.

**Q7 (12 pts).**
$$\Gamma(\gamma = 1.16) = \sqrt{1.16}\left(\frac{2}{2.16}\right)^{2.16/0.32} = 0.6406$$
$$\tau_{fill} = \frac{L^*}{c^*\Gamma^2} = \frac{1.2}{1520\times0.6406^2} = 1.924\times10^{-3}\ \mathrm{s} = \boxed{1.924\ \mathrm{ms}}$$
$$\text{pressure relaxation} = \frac{\tau_{fill}}{1-n} = \frac{1.924}{0.62} = \boxed{3.102\ \mathrm{ms}}$$
$$\tau_{th} = \frac{\alpha}{r^2} = \frac{2.2\times10^{-7}}{(11\times10^{-3})^2} = 1.818\times10^{-3}\ \mathrm{s} = \boxed{1.818\ \mathrm{ms}}$$

**Susceptible? Yes — flag it.** The three time scales are 1.9, 3.1 and 1.8 ms:
all the same order. The quasi-steady assumption behind $r=ap^n$ requires
$\tau_{th} \ll$ the pressure relaxation time, and here the ratio is only 1.7.
The chamber can change pressure on nearly the same time scale as the
propellant's thermal wave can respond, so the burn rate will lag the pressure
and the bulk mode can be driven. Expected frequency: of order
$1/(2\pi\times3.1\ \mathrm{ms}) \approx 50$ Hz — a low-frequency chug, not an
acoustic tone.

Mitigations worth a mark: raise $L^*$ (more free volume), raise $p_c$ (which
raises $r$ and shrinks $\tau_{th}$ as $1/r^2$ — the strongest lever), or
reformulate. Note that $L^*$ is smallest at ignition when the port is smallest,
so if this motor chugs it will chug *early*.

**Q8 (10 pts) — (b) post-test throat area measurement.**

$A_t$ appears in the mass balance and in Eq. 3.7 with the opposite sign to
$a$ and $A_b$, so measuring it directly removes one unknown and lets the
remaining pressure excess be attributed. Combined with the propellant mass and
$\int p_c\,dt$ it closes the mass balance and yields $c^*_{del}$.

(a) Thrust is the *least* sensitive quantity to throat area — $\delta F/F =
-[n/(1-n)]\delta A_t/A_t$, a factor $n$ smaller than the pressure signal
(WE3, N5, Q5) — so it discriminates worst of all the options.
(c) Case strain gives you hoop stress, i.e. pressure again; it adds no
independent information about which term produced the pressure.
(d) $\int p_c\,dt$ alone is insufficient because the mass balance is
$m_p = \int p_cA_t\,dt/c^*$ — without $A_t$ you cannot separate an area error
from a $c^*$ error, which is exactly the ambiguity in question.

**Q9 (10 pts).**

*Feature produced:* the star perforation gives the forward segment a **head-end
regressive-then-neutral** surface history, which combined with the aft
segments' double-truncated-cone perforation produces the RSRM's characteristic
trace — a rise to peak thrust of ≈14.7 MN `/motor`, `max`, sea level at about
t+20 s, then a **pronounced mid-burn bucket** and a partial recovery, over an
action time of 123–124 s. `[NASA-SRB]`, `[WP]` conf B (thrust), A (burn time).

*Why the programme wanted it:* the Shuttle passes through maximum dynamic
pressure at roughly t+55–60 s. The boosters supply about 80 % of liftoff thrust
and cannot be throttled; the SSMEs can throttle but lack the authority to
protect the stack alone. The thrust reduction through max-Q therefore had to be
built into the grain geometry — a "throttle" made of casting tooling.

*The alternative and its cost:* a neutral-burning grain plus structural margin
on the ET and the orbiter to carry the higher max-Q loads. That is a mass
penalty on every flight, on the vehicle rather than the expendable booster —
the worst place to put it. (Also acceptable: reduce liftoff thrust overall, at
the cost of trajectory and abort-mode performance.)

*Consequence for ballistic prediction accuracy:* a star grain's $A_b(t)$ is a
much harder function to predict than a cylinder's. The star tips and fillets
have small radii whose regression is sensitive to casting tolerance; the points
burn out at a different time from the valleys, producing a slope discontinuity;
and any of that error is amplified into pressure by $1/(1-n)$. The RSRM's trace
was therefore tuned empirically across a large static-firing programme rather
than predicted outright — and the prediction is least accurate exactly where
the peak is, early in the burn.

**Q10 (10 pts).**

Reason with the exponent $\pi_K\Delta T = \sigma_p\Delta T/(1-n)$, and note
that $\sigma_p$ is common to both:

$$\frac{\text{tactical exponent}}{\text{booster exponent}} =
\frac{\Delta T_{tac}/(1-n_{tac})}{\Delta T_{boost}/(1-n_{boost})}
= \frac{125/0.35}{40/0.70} = \frac{357}{57.1} = 6.25$$

**The tactical motor's exponent is 6.25 times larger.** Taking a
representative $\sigma_p = 0.002$ K⁻¹: the booster's hot/cold pressure ratio is
$e^{0.114} \approx 1.12$ (about 12 %); the tactical motor's is
$e^{0.714} \approx 2.0$ — **a factor of two between a cold and a hot round.**

*Implication for case mass fraction.* The tactical case must be sized for
roughly twice the cold-day operating pressure while the booster case is sized
for about 12 % above it. At a fixed safety factor, case mass scales roughly
with design pressure, so the tactical motor carries a case that looks grossly
overbuilt for its nominal operating point and it pays a substantially worse
inert mass fraction for it. This — not manufacturing or materials — is the main
reason a tactical motor's mass fraction is poorer than a launch booster's
despite the booster's much larger and heavier hardware. Two independent factors
compound: the wider qualification band (a *requirement*) and the higher $n$ (a
*propellant choice* made for energy and burn rate). Only the second is
negotiable.

Marks: 4 for the correct comparison and the 6.25 ratio, 3 for a numerical
estimate of both ratios, 3 for the case-mass argument. A student who says "the
tactical motor, because its band is wider" without noticing that $n$ also
differs gets 4 of 10 — the band alone accounts for a factor of 3.1, and the
exponent accounts for the other 2.

---

## K3. Trade-study reference solution and rubric

### The problem restated

First-stage solid motor: $I_t = 2.4\times10^7$ N·s, $\rho_p = 1780$ kg/m³,
$c^*_{ref} = 1520$ m/s, outer diameter 1.6 m, conditioning $-20$ °C to
$+45$ °C (reference $+20$ °C, so $-40$ K / $+25$ K), filament-wound composite
case.

### Step 1 — Screen on $\pi_K$ and the exponent

$$\pi_K = \frac{\sigma_p}{1-n}$$

| option | $n$ | $\sigma_p$ [K⁻¹] | $\pi_K$ [K⁻¹] | $1/(1-n)$ |
|---|---|---|---|---|
| A | 0.30 | 0.0018 | $2.57\times10^{-3}$ | 1.429 |
| B | 0.48 | 0.0026 | $5.00\times10^{-3}$ | 1.923 |
| C | 0.18 | 0.0015 | $1.83\times10^{-3}$ | 1.220 |
| D | 0.72 | 0.0042 | $1.50\times10^{-2}$ | 3.571 |

**Option D is eliminated here.** $\pi_K = 0.015$ K⁻¹ means 1.5 % pressure per
kelvin; over the 65 K band the pressure ratio is $e^{0.975} = 2.65$. No
first-stage case is worth building around that, and the 3 % $c^*$ does not pay
for it. Every downstream sensitivity is amplified by 3.571 as well.

### Step 2 — Pick a nominal pressure and compute $K_n$

Take $p_c = 7.0$ MPa nominal. It is a defensible choice for a filament-wound
composite case: high enough for good $C_f$ and a compact motor, low enough
that the case stays light and the throat erosion stays manageable. (Any
nominal in 6–9 MPa with a stated reason is acceptable.)

$$K_n = \frac{p_c^{\,1-n}}{a\,\rho_p\,c^*},\qquad c^* = 1520\times(\text{relative})$$

| option | $r$ at 7 MPa [mm/s] | $K_n$ required |
|---|---|---|
| A | 8.0 | 323 |
| B | 9.5 | 270 |
| C | 7.0 | 375 |
| D | 12.0 | 209 |

All are buildable. Note the pattern: **the faster propellant needs the smaller
burning surface for the same pressure**, which for a fixed motor diameter means
a less aggressive grain — fewer star points, thicker web, better structural
margin, and less sliver. That is a real secondary advantage of B over C.

### Step 3 — Build the MEOP stack

Multiplicative factors applied to nominal, all in the unconservative direction:

| factor | A | B | C | D |
|---|---|---|---|---|
| Hot day, $+25$ K: $e^{\pi_K\times25}$ | 1.066 | 1.133 | 1.047 | 1.455 |
| Lot scatter $+3$ % on $a$: $1.03^{1/(1-n)}$ | 1.043 | 1.058 | 1.037 | 1.111 |
| $A_b$ prediction $+2$ %: $1.02^{1/(1-n)}$ | 1.029 | 1.039 | 1.024 | 1.073 |
| Erosive + ignition overshoot | 1.08 | 1.08 | 1.08 | 1.08 |
| **Combined stack** | **1.236** | **1.346** | **1.201** | **1.874** |
| **MEOP at $p_c = 7.0$ MPa** | **8.65 MPa** | **9.42 MPa** | **8.41 MPa** | **13.1 MPa** |

Cold-day check ($-40$ K): A $\to$ 6.31 MPa, B $\to$ 5.73 MPa, C $\to$
6.50 MPa, D $\to$ 3.84 MPa. Only D approaches a pressure at which $C_f$,
$I_{sp}$ and combustion stability all become questionable.

### Step 4 — Recommend

**Recommendation: Option A.** [J]

*Against C.* C has the best stack (8.41 MPa, 3 % lower MEOP than A) and the
lowest $\pi_K$ — genuinely attractive, and a defensible alternative answer.
But it costs 1.5 % of $c^*$, which is 1.5 % of $I_{sp}$ on a first stage, and
it needs $K_n = 375$ against A's 323 — a 16 % larger burning surface in the
same 1.6 m envelope. That means a more aggressive perforation, a thinner web
for the same burn time, more sliver, and a worse grain structural margin. The
MEOP saving (8.41 vs 8.65 MPa, ~3 % of case mass, i.e. a few tenths of a
percent of stage mass) does not pay for 1.5 % of $I_{sp}$.

*Against B.* B buys 1 % of $c^*$ and a faster burn for a 9 % higher MEOP
(9.42 vs 8.65 MPa) and, more seriously, an amplification exponent of 1.923
against 1.429. Every future surprise — a grain crack, a fast lot, a throat that
does not erode as predicted — costs 35 % more pressure with B than with A. On a
first stage, where the grain is largest, the thermal cycling worst and the
structural margins tightest, that is the wrong direction. B would be the right
answer for an upper stage in a benign thermal environment.

*Against D.* Eliminated in step 1. Its MEOP is 13.1 MPa, 51 % above A's, for
3 % of $c^*$. The case-mass penalty alone swamps the gain, and the cold-day
pressure of 3.84 MPa is a performance and stability liability.

### Step 5 — Data to demand from the supplier before committing

A strong answer names at least four of these:

1. **$r(p)$ over the full credible excursion**, not just around nominal —
   at minimum from the cold-day, low-$K_n$ end to the MEOP end (here roughly
   5 to 9 MPa), so that the constancy of $n$ can be checked and any plateau or
   mesa located.
2. **$\sigma_p$ measured at three or more temperatures across the band**, not
   extrapolated from two, and with a statement of whether $n$ itself is
   temperature dependent.
3. **Lot-to-lot statistics on $a$**: the ±3 % in the stack is an assumption.
   Demand the actual distribution from production history, with the acceptance
   limits and the sample size.
4. **The strand-to-motor scale factor** for this propellant, with the subscale
   motor data it was derived from. A design built on strand data alone will run
   a few percent off.
5. **Erosive-burning characterisation** — either Lenoir–Robillard constants or
   measured data from motors of known $J$ — since the 8 % allowance in the
   stack is a placeholder.
6. **Pressure-coupled response function data (T-burner)** across the frequency
   band the motor's modes will sweep, with an explicit statement of the
   reduction method and the scatter.
7. **Mechanical properties over the temperature band** (for the grain
   structural analysis of Module 22/23) and the propellant's aluminium
   particle-size specification, since it is a damping parameter (C6).

### Rubric

| element | marks | what earns them |
|---|---|---|
| Computes $\pi_K$ for all four | 10 | Correct $\sigma_p/(1-n)$; identifies D as an outlier |
| Chooses and justifies a nominal $p_c$ | 10 | Any 6–9 MPa with a stated reason (case mass, $C_f$, throat erosion) |
| Computes $K_n$ for the chosen options | 10 | Correct inversion of Eq. 3.7 with the relative $c^*$ applied |
| Builds the MEOP stack multiplicatively | 20 | All four factors present, each amplified by $1/(1-n)$ where appropriate. **Applying the lot and $A_b$ scatter without the $1/(1-n)$ amplification is the single biggest markable error** |
| Checks the cold end | 10 | Notices D's 3.84 MPa and its consequences |
| Recommends with a quantified argument | 20 | Compares MEOP/case mass against $c^*$/$I_{sp}$ in commensurate units; argues against each rejected option specifically, not generically |
| Names the supplier data required | 15 | At least four items, with a reason for each |
| Voice and honesty | 5 | States which numbers are assumptions; tags judgment as judgment |

**Automatic deductions.** −10 for choosing D on the strength of its $c^*$
without computing its stack. −10 for stacking factors additively rather than
multiplicatively. −5 for quoting a burn-rate coefficient without its units or
its $n$. −5 for any statement that the case can simply be made stronger to
accommodate a high $\pi_K$ without costing mass.

**Alternative acceptable recommendation.** Option C, if the answer argues
explicitly that the mission is inert-mass-critical and grain-structurally
comfortable, and quantifies the $I_{sp}$ loss it is accepting. Option B is
acceptable only with an explicit statement that the thermal environment is
benign and the grain structural margin is generous — and even then it should
be flagged as the higher-risk choice.

---

## K4. Common wrong answers and what they reveal

**Using $\sigma_p$ where $\pi_K$ belongs.** By far the most common error on
this module. It reveals that the student memorised "temperature sensitivity"
as one concept instead of two, and — more seriously — that they have not
internalised that a motor is a feedback loop: the pressure responds to the
burn-rate change, and then the burn rate responds to the pressure change.
Anyone making this error will also under-predict every other pressure
excursion in the module.

**Forgetting the $1/(1-n)$ amplification on an input error.** Students
correctly write $p_c = (a\rho_pc^*K_n)^{1/(1-n)}$ and then say "a 3 % error in
$a$ gives a 3 % error in $p_c$." It reveals the equation was memorised rather
than differentiated. The fix is to practise the logarithmic form (Eq. 3.14)
until it is reflexive.

**Believing chamber pressure depends on how much propellant is loaded.** This
is the single most persistent misconception in solid-motor internal ballistics.
It reveals a liquid-engine mental model (more propellant flow $\to$ more
pressure) transplanted without noticing that in a solid the "flow rate" is set
by surface area, not by a valve. The diagnostic question that exposes it: "what
happens to $p_c$ if I make the motor twice as long?" (C1) — and note the
correct answer there is *not* "nothing", it is "it nearly triples, because you
forgot to scale $A_t$."

**Evaluating an erosive-burning correlation once and stopping.** Reveals that
the student has not noticed the loop closes. It is a particularly damaging
error because it is unconservative: the single-pass answer is always lower than
the truth (WE4, N6).

**Treating $n<1$ as an empirical observation rather than a stability
requirement.** Students write "propellants usually have $n$ between 0.2 and
0.5" and stop. It reveals that they have not connected the burn-rate law to
the chamber mass balance at all. Ask them to sketch the two curves (C2); the
ones who cannot are the ones who will later design a motor around a propellant
characterised only near nominal.

**Reading throat erosion off the thrust trace.** Reveals no feel for the
relative sensitivities. Thrust is $n$ times less sensitive to $A_t$ than
pressure is; at $n = 0.35$ that is a factor of 2.9, and at $n = 0.2$ a factor
of 5. Students who make this error also tend to propose instrumenting test
articles with a load cell and nothing else.

**Confusing $L^*$ instability with acoustic instability.** Usually shows as
answering "acoustic" to Q7 or quoting a chamber-dimension frequency for a bulk
mode. It reveals that the student has not separated the *time scales* (chamber
filling versus thermal wave) from the *length scales* (acoustic wavelengths).
The tell is a numerical answer in the hundreds of hertz for a bulk mode, or
tens of hertz for a tangential mode.

**Quoting "Star 48B $I_{sp}$ = 286 s" or "= 292 s" without the nozzle.**
Reveals that the student took a number from a table without reading its
qualifier. Both values are correct, for different expansion ratios
(`reference/_verify-solid-coldgas.md`, contested figures §3). The same failure
mode produces per-vehicle thrust quoted as per-motor, which is a factor-of-two
error on Titan and Ariane 5.

**Assuming total impulse is exactly temperature invariant.** Reveals over-trust
in a first-order statement that the module explicitly labels as first-order.
The honest answer (R2) identifies $C_f(p_c)$, $\eta_{c^*}(p_c)$, and tail-off
losses as the second-order terms and gets the sign right.

**Adding MEOP stack factors instead of multiplying them.** Reveals a habit of
treating percentages as additive quantities. It gives the wrong answer in the
unconservative direction whenever the factors are large, which is precisely
the high-$n$ case where it matters most: for option D above, adding the
excesses ($0.455 + 0.111 + 0.073 + 0.080$) gives 1.72 against the correct
1.87.

**Inventing a chamber pressure or throat area for a real motor.** N8(b) is
built to catch this. When a needed number is absent from the verification file,
the correct response is "not reliably published" plus whatever the mass balance
will give you — not a plausible-looking figure from a secondary source. The
$c^* = 2685$ m/s that results from doing it the wrong way is the tell, and a
student who reports it without flinching has stopped sanity-checking.
