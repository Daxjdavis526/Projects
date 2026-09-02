# Module 09 — Nozzles — Answer key
Part II · Key to `09-nozzles.md`

Grading follows the course convention: **method first**. A correct setup with
an arithmetic slip loses at most 30 % of the marks for that part; a correct
number reached by a wrong method scores zero. Where a problem has a defensible
answer either way, the marks are for the argument, not the conclusion.

All numbers below were computed with `tools/rocket.py`; the entries are
registered in `tools/examples/09.py`.

---

## K1. Problem solutions

### Conceptual

**C1 — vacuum chamber versus sea-level stand, same $p_c$, attached flow.**

| quantity | changes? | reason |
|---|---|---|
| $\dot m$ | **No** | set by the choked throat: $\dot m = \Gamma p_c A_t/\sqrt{RT_0}$. The throat cannot know what the ambient pressure is; information cannot propagate upstream through sonic flow. |
| $c^*$ | **No** | $c^* = p_cA_t/\dot m$, and neither factor changed. This is the whole reason $c^*$ is the chamber's figure of merit — it is ambient-independent by construction. |
| $p_e$ | **No** | fixed by $\varepsilon$ and $\gamma$ through Eq. 3.5. Attached flow only; if the sea-level case separates, this answer flips. |
| $M_e$ | **No** | same reason. |
| $C_F$ | **Yes** | the pressure term $(p_e-p_a)\varepsilon/p_c$ changes by $p_a\varepsilon/p_c$. |
| $I_{sp}$ | **Yes** | $I_{sp} = c^*C_F/g_0$ and $C_F$ changed. |

*Marking:* full marks require the "information cannot travel upstream through
the sonic throat" argument for $\dot m$, and the attached-flow caveat on $p_e$.
A student who says $p_e$ changes has the single most common misconception in
this module and loses the part outright.

**C2 — why $R_d \ll R_u$.**
They are protecting different things. The **upstream** arc governs how sharply
the subsonic flow must turn as it approaches the sonic line; making it generous
($1.5\,r_t$) keeps the sonic line nearly flat, keeps $C_d$ near 0.99, and keeps
the Bartz $(D_t/R_u)^{0.1}$ throat heat-flux term down. There is no length
penalty worth caring about because the convergent is short and contributes no
thrust. The **downstream** arc exists only to get the wall from 0° to
$\theta_n \approx 22$–28° as fast as the flow will tolerate; every millimetre
spent there is a millimetre of nozzle length not spent expanding, so it is made
as tight as the internal shock structure allows — $0.382\,r_t$.

Swap them: a tight upstream arc ($0.382\,r_t$) strongly curves the sonic line,
drops $C_d$ towards 0.97 (so the engine passes less flow than the geometry says
and every $c^*$ reduction from that stand is biased), and raises the throat
heat flux by $(1.5/0.382)^{0.1} \approx 1.15$, i.e. 15 %, exactly where the
margin is thinnest. A generous downstream arc ($1.5\,r_t$) adds roughly
$1.5\,r_t\sin\theta_n \approx 0.56\,r_t$ of axial length spent turning rather
than expanding, and it forces the parabola to start further out and flatter,
which either lengthens the nozzle or costs $C_F$.

**C3 — separation margin versus chamber pressure.**
The 300 bar engine, by a factor of three. Write the separation margin as the
ratio of exit pressure to the criterion pressure:
$$\frac{p_e}{p_a} = \frac{p_e}{p_c}\cdot\frac{p_c}{p_a}$$
The first factor is fixed by $\varepsilon$ and $\gamma$ alone. So at fixed
$\varepsilon$, **separation margin scales linearly with $p_c/p_a$.** Equivalently,
at a fixed $p_e/p_a$ target, tripling $p_c$ lets you carry roughly three times
the exit-to-throat *pressure* ratio, which (because $p_e/p_c \sim
\varepsilon^{-\gamma}$ approximately for large $\varepsilon$) is a large
increase in permissible $\varepsilon$. This is the whole reason a 300 bar
staged-combustion booster engine can fly $\varepsilon \approx 34$ at sea level
while a 100 bar gas-generator engine sits at 16 (§6.5).

**C4 — why wetted area does not fall in proportion to length.**
The bell is *convex outward* relative to the straight cone: it leaves the
throat at $\theta_n \approx 22°$, well above the cone's 15°, so it is further
from the axis than the cone over most of its length, and $S_w = \int 2\pi r
\,ds$ weights radius directly. Shortening a bell reduces the integration
length but raises the mean radius over that length, so the two effects partly
cancel. Numerically (§3.8) an 80 % bell is 86.8 % as wet; a 100 % bell is
**108 %** as wet as the cone it is the same length as.

It matters more than the mass saving whenever the binding constraint is
**heat load into the coolant or coolant pressure drop** rather than mass:
a regeneratively cooled booster on a tight $\Delta p$ budget, or an expander
-cycle engine where the wetted area is the power source and you may actually
*want* it (Module 13). It matters less on a vacuum upper stage with a
radiatively cooled skirt, where the extra area is uncooled and nearly free.

**C5 — why $(1+\cos\alpha)/2$ fails for a bell, and what you need instead.**
Eq. 3.6 was derived by assuming *source flow*: uniform velocity magnitude
directed radially from a virtual apex, spread over a spherical cap of
half-angle $\alpha$. A conical nozzle approximately produces that. A bell does
not: its contour is designed precisely so that the flow is turned *back*
towards axial, so the exit-plane flow angle varies from $\approx\theta_e$ at
the wall to $\approx 0$ on the axis, and the velocity magnitude is not uniform
either. Applying Eq. 3.6 with $\alpha = \theta_e$ therefore assumes every
streamline is at the wall angle, which is the worst case.

To compute $\lambda$ for a bell properly you need the **exit-plane
distributions** of flow angle $\theta(r)$, velocity $v(r)$ and density
$\rho(r)$ from a method-of-characteristics or CFD solution, and then
$$\lambda = \frac{\int \rho v^2\cos\theta\,dA}{\int \rho v^2\,dA}$$
`[SP-8120 §3.2]`.

**C6 — checks before raising $\varepsilon$ from 130 to 285 with a fixed
extension.** In order of how likely each is to block the change:

1. **Interstage / fairing envelope.** The exit diameter grows by
   $\sqrt{285/130} = 1.48$, and the nozzle length by roughly the same factor.
   This is a geometric fact and it is the usual killer (§6.4).
2. **Mass and where it lands.** The extension is burnout mass, which is the
   most expensive mass on the vehicle; it must be worth more than the ~16 s of
   $I_{sp}$ it buys.
3. **Cooling.** The regen circuit cannot be extended (coolant enthalpy and
   $\Delta p$), so this is a radiative or C–C skirt decision, with its material,
   cost and lead-time consequences.
4. **Structure and gimbal.** A longer, larger nozzle raises the gimballed
   inertia and lowers the first bending mode, which interacts with the TVC
   control bandwidth and with any start-transient load.

*(Separation is deliberately not on this list: a 285:1 upper-stage nozzle never
starts at sea level.)*

**C7 — why RSS produces above-ambient wall pressures, and why the sign matters.**
A thrust-optimised contour turns the flow hard immediately downstream of the
throat and then turns it back. That recompression generates an **internal
shock** propagating from the region near the throat towards the wall further
downstream. When the boundary layer separates, this internal shock interacts
with the separation shock in such a way that the separated shear layer is
turned back onto the wall and **reattaches**, enclosing a recirculation bubble.
Downstream of reattachment the flow has been compressed twice — through the
separation shock and again through the reattachment compression — so the wall
static pressure overshoots ambient, typically to 1.1–1.3 $p_a$.

The sign matters because side load is driven by the *difference* between the
two halves of the circumference (Eq. 3.14). In pure FSS both sides sit slightly
below ambient, so a circumferential asymmetry produces at most
$\Delta p \sim 0.3\,p_a$ over a short band. In an FSS/RSS split one side is
above ambient and the other well below, giving $\Delta p \sim 0.9\,p_a$ over a
band that can be most of the nozzle. §5.3 puts numbers on it: ~8 kN versus
~180 kN.

**C8 — why high-$\varepsilon$ nozzles end the regen circuit.**
Two independent budgets run out.

*Enthalpy:* the coolant can only absorb $\dot m_{cool}c_p\Delta T$ before it
reaches its own limit — RP-1 cokes above roughly 700 K, hydrogen must arrive at
the turbine inlet at a specified temperature for the cycle to close, and a
storable fuel decomposes. A 285:1 nozzle has an enormous wetted area and, even
at low flux, the integrated heat load exceeds what the coolant flow can take.

*Pressure:* channel or tube pressure drop scales roughly with length over
hydraulic diameter times dynamic head; multiplying the channel length by a
factor of several multiplies $\Delta p$ correspondingly, and that $\Delta p$
comes straight out of the pump discharge pressure, i.e. out of the cycle.

Two ways the remainder is handled, with real engines:
- **Radiative**: Merlin 1D Vacuum's niobium-alloy skirt from $\varepsilon = 16$
  outward; RL10B-2's carbon–carbon extension from $\varepsilon = 77$ outward.
- **Ablative**: RS-68/RS-68A's entire nozzle is ablative with only the chamber
  regen; the LMDE and Apollo SPS use ablative chambers with radiative skirts.
- (A third acceptable answer: **dumped-film cooling** — the F-1's GG-exhaust
  curtain over its nozzle extension, and Vulcain 2's turbine-exhaust film on
  the lower nozzle.)

### Calculation

**P1 — geometry of a 180 kN LOX/LH2 upper-stage engine, $\varepsilon = 240$.**

$\gamma = 1.20$, so at $\varepsilon = 240$: $M_e = 5.5384$, $p_e/p_c =
2.207\times10^{-4}$, and
$$C_{F,vac} = 2.0040$$
$$A_t = \frac{F}{p_c C_{F,vac}} = \frac{180\,000}{60\times10^{5}\times2.0040}
= 0.0149703\ \mathrm{m^2}
\quad\Rightarrow\quad D_t = 138.1\ \mathrm{mm}$$
$$A_e = 240 A_t = 3.5929\ \mathrm{m^2} \quad\Rightarrow\quad D_e = 2.139\ \mathrm{m}$$
$r_t = 69.03$ mm. Conical length, Eq. 3.7:
$$L_{cone} = \frac{0.06903(\sqrt{240}-1) + 1.5(0.06903)(0.035276)}{0.267949}
= \frac{0.99617 + 0.003653}{0.267949} = 3.747\ \mathrm{m}$$
$$L_{80\%} = 0.80\times3.747 = \boxed{2.998\ \mathrm{m}}$$

Cross-check: $\dot m = p_cA_t/c^* = (60\times10^5)(0.0149703)/2290 = 39.2$ kg/s.

**P2 — performance.**
$$I_{sp,vac,ideal} = \frac{c^*C_{F,vac}}{g_0} = \frac{2290\times2.0040}{9.80665} = 468.0\ \mathrm{s}$$
$$I_{sp,vac} = 0.975\times468.0 = \boxed{456.3\ \mathrm{s}}$$

The engine described is **Vinci** — 180 kN, 60 bar, $\varepsilon = 240$,
published $I_{sp,vac} = 457.2$ s [_verify-liquid, Vinci block]. The
reconstruction is **0.9 s (0.2 %) low**, which is far better agreement than the
model deserves and should be read the way Module 03 WE3 reads it: the frozen
single-$\gamma$ model *under*predicts hydrogen exhaust velocity (no
recombination) while $\eta_n = 0.975$ *over*states the losses for a
well-designed vacuum bell, and the two errors cancel. Full marks require
naming that cancellation, not just noting the agreement.

**P3 — largest $\varepsilon$ at sea level, $p_c = 70$ bar, $\gamma = 1.20$.**

*Summerfield.* Require $p_e \ge 0.4p_a = 40\,530$ Pa. Then $p_c/p_e = 172.7$,
so $M_e = 3.6876$ and
$$\varepsilon_{max} = 18.05$$

*Schmucker.* Solve $p_e(\varepsilon) = p_a(1.88M_e-1)^{-0.64}$ simultaneously:
$M_e = 3.8212$, $p_e = p_{sep} = 31\,573$ Pa, and
$$\varepsilon_{max} = 21.90$$

**Difference: 21.3 %** in area ratio. Schmucker is the less conservative here
because it accounts for the Mach number the boundary layer has to survive.

*Marking:* the essential content is that these are two different answers to the
same question and that a designer would take the conservative one and add
margin — F-1 and Merlin both sit at 16, comfortably inside both.

**P4 — 60 % bell of the §5.1 contour, $\theta_n = 26°$, $\theta_e = 16°$.**
$r_t = 99.665$ mm, $r_e = 398.661$ mm, $R_d = 0.382r_t = 38.072$ mm,
$L_{cone} = 1.13555$ m, so $L_{60} = 0.68133$ m.

$$x_N = R_d\sin 26° = 0.016690\ \mathrm{m},\qquad
r_N = r_t + R_d(1-\cos 26°) = 0.103518\ \mathrm{m}$$
$$m_n = \tan 26° = 0.487733,\qquad m_e = \tan 16° = 0.286745$$
$$x_Q = \frac{(0.398661 - 0.286745\times0.68133)-(0.103518-0.487733\times0.016690)}{0.487733-0.286745}
= 0.53693\ \mathrm{m}$$
$$r_Q = 0.103518 + 0.487733(0.53693-0.016690) = 0.357255\ \mathrm{m}$$

$Q = (0.5369,\,0.3573)$ m lies strictly between $N$ and $E$ in both coordinates,
so the parabola is **well-behaved** — monotonic in $x$ and $r$, tangent to the
throat arc at $\theta_n$ and to the exit at $\theta_e$, no inflection or
overshoot. The exit angle check is automatic: a quadratic Bézier's terminal
tangent is $E-Q$, whose slope is $(0.398661-0.357255)/(0.68133-0.53693) =
0.2867 = \tan 16°$. ✓

*Comment expected:* the 60 % bell needs both a steeper start (26° vs 22°) and a
steeper finish (16° vs 11°) than the 80 % bell of §5.1. The steeper exit angle
is where the loss is — divergence efficiency drops, which is exactly the price
of the 227 mm saved. Shorten further and the control point eventually walks
outside the $N$–$E$ box, at which point the parabolic approximation stops
representing the Rao optimum at all.

**P5 — break-even, $\varepsilon = 20$ vs 40, $p_c = 100$ bar, $A_t = 0.02$ m².**
$$C_{F,vac}(20) = 1.8205,\qquad C_{F,vac}(40) = 1.8843$$
$$p_{a,BE} = 10^{7}\times\frac{1.8843-1.8205}{40-20} = 10^{7}\times\frac{0.063807}{20} = 31.90\ \mathrm{kPa}$$
$$h_{BE} = 11\,000 + \frac{287.05\times216.65}{9.80665}\ln\frac{22\,632}{31\,903}\;?$$
No — 31.90 kPa is *above* the 11 km tropopause pressure of 22.63 kPa, so use the
troposphere branch:
$$h_{BE} = \frac{288.15}{0.0065}\left[1-\left(\frac{31\,903}{101\,325}\right)^{0.19026}\right] = \boxed{8.75\ \mathrm{km}}$$

Thrust:
$$F_{SL}: \quad \varepsilon=20 \to 323.6\ \mathrm{kN};\quad \varepsilon=40 \to 295.8\ \mathrm{kN}\quad(\Delta = -27.8\ \mathrm{kN})$$
$$F_{30\,\mathrm{km}}:\quad 363.6\ \mathrm{kN}\ \mathrm{vs}\ 376.0\ \mathrm{kN}\quad(\Delta = +12.3\ \mathrm{kN})$$

**The mark is lost without this caveat:** at $\varepsilon = 40$,
$p_e = 20.87$ kPa, against a Schmucker separation pressure of 29.24 kPa and a
Summerfield value of 40.53 kPa. **Both criteria say this nozzle is separated at
sea level.** The $\varepsilon = 40$ sea-level thrust of 295.8 kN is therefore
*not* physical — the attached-flow $C_F$ formula does not apply — and the real
sea-level thrust would be higher than 295.8 kN but is not computable from
Eq. 3.11. A student who reports 295.8 kN without flagging this has done the
arithmetic and missed the engineering.

**P6 — side load and dynamics.**
Eq. 3.14 with $\Delta p = (1.15-0.30)p_a = 0.85\times101\,325 = 86.1$ kPa,
$\bar r = 0.95$ m, $\Delta x = 0.60$ m:
$$F_{side} = 2\times86\,126\times0.95\times0.60 = \boxed{98.2\ \mathrm{kN}}$$

*Dynamics.* The first bending mode's period is $1/35 = 28.6$ ms; the transient
lasts 40 ms, i.e. **about 1.4 cycles**. This is neither a quasi-static load nor
a resonant one. It is a **shock/impulse** loading: for a step or half-sine load
of duration comparable to the natural period, the dynamic amplification factor
approaches 2, so the structure should be designed to roughly 200 kN equivalent
static, not 98 kN. True resonant build-up would require many cycles of
excitation at 35 Hz, which a single 40 ms event cannot deliver — but if the
FSS/RSS pattern *oscillates* during the transition (which it does), the
excitation is broadband and can contain energy at 35 Hz, and then the concern
is real. Full marks require distinguishing "impulse with DAF ≈ 2" from
"resonance", and noting that a repeatedly flipping separation pattern is the
case where resonance genuinely applies.

**P7 — sea-level exit pressure ranking ($\gamma = 1.20$).**

| engine | $\varepsilon$ | $p_c$ (bar) | $M_e$ | $p_e$ (kPa) | $p_e/p_a$ | Schmucker $p_{sep}$ (kPa) |
|---|---|---|---|---|---|---|
| Merlin 1D | 16 | 97.0 | 3.604 | 65.67 | **0.648** | 32.98 |
| F-1 | 16 | 70.0 | 3.604 | 47.39 | 0.468 | 32.98 |
| RS-68A | 21.5 | 102.6 | 3.808 | 47.39 | 0.468 | 31.65 |
| RS-25 (ε=69) | 69 | 206.4 | 4.624 | 21.62 | 0.213 | 27.46 |
| RS-25 (ε=77.5) | 77.5 | 206.4 | 4.707 | 18.68 | **0.184** | 27.11 |

**The RS-25 is closest to separation by a wide margin, and is the only one the
criteria say is separated** ($p_e < p_{sep}$ on both criteria, at either area
ratio). The other three sit 40–100 % above their Schmucker separation pressure.

The lesson to state: the RS-25 is a *sustainer*, ideally expanded at ~12 km,
and it is deliberately operated outside the criteria at lift-off because most
of its 8.5-minute burn is above 12 km. It gets away with it because it is a
thrust-optimised contour in restricted shock separation (§5.3), and it pays for
it in start-transient side loads. Note also the coincidence that the F-1 and
RS-68A land on identical $p_e$ — different $\varepsilon$, different $p_c$, same
$p_e/p_c \times p_c$.

**P8 — 0.4 mm of throat recession on a 60 mm throat.**
$$A_{t0} = \pi(0.060)^2 = 0.0113097\ \mathrm{m^2},\qquad
A_{t1} = \pi(0.0604)^2 = 0.0114610\ \mathrm{m^2}$$
$$\frac{A_{t1}}{A_{t0}} = 1.01338 \quad\Rightarrow\quad \textbf{+1.34\% throat area}$$
$$\varepsilon: 16 \to 16/1.01338 = 15.79 \quad(-1.32\%)$$
At constant $\dot m$ and constant $c^*$, $p_c = \dot m c^*/A_t$, so
$$\frac{p_{c1}}{p_{c0}} = \frac{A_{t0}}{A_{t1}} = 0.9868 \quad\Rightarrow\quad \textbf{−1.32\% chamber pressure}$$
$$C_{F,vac}: 1.7971 \to 1.7956 \quad(-0.08\%)$$
Vacuum thrust $F = C_F p_c A_t$ scales as $C_F \dot m c^*$, so thrust falls
by 0.08 % — essentially nothing.

**Would you accept it?** In a *liquid* engine, **no**, and the performance
numbers are not why. A regeneratively cooled liquid throat that recesses
0.4 mm is losing wall material at the point of peak heat flux; the wall is
thinning towards a coolant channel, and the process is progressive. The
performance impact is negligible and the structural implication is
disqualifying. In an *ablative* engine (LMDE, RS-68 nozzle, or any solid motor,
Module 24) the same 0.4 mm is entirely normal and is budgeted for. Full marks
require separating "performance consequence" from "acceptability", and noting
that they point opposite ways.

### Engineering reasoning

**R1 — $\eta_{C_f} = 0.93$, $\eta_{c^*} = 0.97$, wall taps reading 41/39/40 kPa
at 60/80/95 % of the divergent.**

*Diagnosis:* the nozzle is **separated**, and separation is **upstream of the
60 % station**. Three pieces of evidence converge:

1. The three taps read essentially the same pressure over 35 % of the nozzle
   length. Attached isentropic flow cannot do that — the pressure must fall
   monotonically. A flat plateau is the signature of a separated region.
2. The plateau value, 39–41 kPa, is $0.39$–$0.40\,p_a$ — precisely the
   Summerfield plateau.
3. $\eta_{c^*}$ is healthy at 0.97, so the chamber, injector and combustion are
   fine. The loss is entirely downstream of the throat. That combination —
   good $c^*$, bad $C_F$ — points at the nozzle and nowhere else.

*What next:*
- Do **not** touch the contour yet. First establish whether this is design
  intent (the nozzle is simply overexpanded on this stand at this $p_c$) or an
  anomaly. Compute the predicted separation station from Eq. 3.13 at the test
  $p_c$; if it lands upstream of 60 %, the hardware is behaving as physics
  says and the test point is the problem.
- Add wall taps upstream (20 %, 40 %) to bracket the separation station.
- Re-run at higher $p_c$ if the engine allows it; the separation station should
  move downstream and $\eta_{C_f}$ should recover. That is the confirming
  experiment.
- Only if the separation station is *not* where the criteria say — or if it is
  circumferentially asymmetric — start looking for a contour defect, a step at
  a weld, or an upstream flow distortion.

*Counter-argument to address for full marks:* one could propose that the low
$\eta_{C_f}$ is a thrust-measurement or $A_t$ error. The wall-pressure plateau
rules that out; a load-cell error does not produce a flat pressure profile.

**R2 — two nozzles, identical geometric throat, $R_u/r_t = 1.5$ versus 0.6.**

*Prediction.* The tight-radius unit has a more strongly curved sonic line, so
its discharge coefficient is lower — roughly $C_d \approx 0.975$ against
$\approx 0.99$, a 1.5 % difference `[SP-8120 §2.1]`. Consequences on the stand:

- At **fixed $p_c$**, the tight unit passes about **1.5 % less mass flow**.
- At **fixed $\dot m$** (the usual case, since the feed system sets flow), the
  tight unit runs about **1.5 % higher $p_c$**.
- Either way, the *reduced* $c^* = p_cA_{t,geom}/\dot m$ comes out about
  **1.5 % higher** on the tight unit — which looks like better combustion
  efficiency and is nothing of the kind. This is the trap.
- $C_F = F/(p_cA_{t,geom})$ comes out correspondingly **lower**, so $I_{sp}$ —
  the product — is unchanged, as it must be, since the nozzle contour
  downstream is identical.
- **Throat heat flux is higher by $(1.5/0.6)^{0.1} = 1.096$, about 10 %**
  (Bartz's $(D_t/R_u)^{0.1}$ term). This is the consequence that actually
  matters.

*How to confirm.* Measure, do not infer. (a) CMM or optical scan the throat
region contour on both units — this is definitive and takes an afternoon.
(b) Compare throat-region wall thermocouples and coolant outlet temperature
rise between units; a 10 % flux difference at the throat is measurable.
(c) Cross-plot $\eta_{c^*}$ against unit serial number: if the "high $c^*$"
units are exactly the tight-radius units, the correlation is the answer.

*The systems point:* a $c^*$ that varies between nominally identical units by
1.5 % with no combustion explanation should always send you to the throat
geometry and the $p_c$ tap before you send you to the injector.

**R3 — tube-wall to laser-welded sandwich at slightly lower thrust.**

*For:* 90 % fewer parts removes hundreds of braze joints, each an inspection
item and each a potential leak path (§7.2). Touch labour, inspection hours and
scrap rate all fall; the reference file records 40 % lower cost and 30 % faster
production for Vulcain 2.1. On a programme flying a handful of times a year,
*schedule* and *supplier risk* may matter more than unit cost: a design that
needs fewer specialist braze technicians is a design that can still be built in
ten years. Reliability arguably improves — the dominant tube-wall failure mode
is a braze void, and the new design does not have brazes.

*Against:* the thrust is *lower* (Vulcain 2.1: 1,324 kN against Vulcain 2's
1,359 kN), which is a direct payload loss unless the vehicle was oversized. The
new construction is heavier per unit cooled area than a tube wall, which is
part of why (Vulcain 2.1's dry mass is 2,000 kg against Vulcain 2's 1,800 kg).
A change of this size requires full requalification — thermal, structural,
hot-fire — which is a large cost paid up front against savings realised over
many units. And the flight history resets: a mature, flight-proven nozzle is
being replaced with a new one.

*What settles it.* (1) The **production rate over the remaining programme
life**: unit savings only beat requalification cost above some number of
engines, and that number is computable. (2) Whether the **vehicle can absorb
the 2.6 % thrust reduction and the 200 kg** — if the trajectory has margin,
this is free; if not, it is a payload penalty that must be priced. (3) The
**supplier situation for brazed tube assemblies**: if the skill base is
disappearing, the decision is made for you.

*Verdict:* [J] the change is right for a programme with a long remaining
production run and trajectory margin — which is Ariane 6's situation — and
wrong for a programme with ten engines left to build.

**R4 — 2.6 m interstage, currently $\varepsilon = 130$, marketing wants 285:1
performance.**

*The physical facts first.* At $\gamma = 1.20$: $C_{F,vac}(130) = 1.9689$,
$C_{F,vac}(240) = 2.0040$, $C_{F,vac}(285) = 2.0129$. Anchoring on an RL10-class
$I_{sp} = 449.7$ s at $\varepsilon = 130$:

| option | $\varepsilon$ | $I_{sp,vac}$ | exit diameter (relative) | notes |
|---|---|---|---|---|
| Do nothing | 130 | 449.7 s | 1.00 | baseline |
| Fixed larger bell | 190 | ≈ 454.8 s | 1.21 | fits 2.6 m if the current exit is ≤ 2.1 m |
| Fixed 285:1 | 285 | ≈ 459.8 s | 1.48 | **almost certainly does not fit** |
| Extendable to 285 | 77 → 285 | 465.5 s achievable *with the RL10B-2's own chamber*; ≈ 460 s on this chamber | stowed 0.77 | mechanism, single-point failure |

*The key correction to make to marketing:* the RL10B-2's 465.5 s is not
attributable to the 285:1 nozzle alone. §5.4 shows the nozzle is worth
**16–18 s** relative to $\varepsilon = 77$–85, and the manufacturer's family
table shows a **14.5 s** step between the RL10A-4-2 and the RL10B-2. Going from
130 to 285 on *this* engine buys about **10 s**, not 16 s, because the $C_F$
curve is already flat at 130. That single number changes the entire business
case.

*Recommendation:* [J] **Grow the fixed nozzle to the largest $\varepsilon$ the
2.6 m interstage will hold** (roughly 180–200:1 if the current exit is around
2.0 m), gaining ≈5 s with no mechanism. Reject the extendable option unless
the mission is genuinely performance-limited by a margin larger than 10 s,
because the extendable buys only ~5 s beyond the fixed growth and costs a
single-point-failure deployment with no abort mode.

*What would change the answer:* if the interstage is *not* actually fixed — if
the stage is early enough in design to size the interstage around the nozzle —
then size it around a fixed 285:1 and skip the mechanism entirely, which is
what a clean-sheet design should do (§6.4).

**R5 — 180 kN lateral transient at 22 % $p_c$, 30 ms, not at mainstage, not on
the next unit.**

*Three candidates:*

1. **FSS→RSS transition asymmetry.** At 22 % of full $p_c$ the separation point
   is well up the nozzle (§5.3 Step 2 puts it around 43 % of exit radius at
   20 %), and this is exactly the window where the topology flips. The magnitude
   is right: §5.3 case B gives ~180 kN for an RS-25-class nozzle.
2. **Start-sequence asymmetry.** An asymmetric propellant lead, an off-centre
   ignition, or a non-uniform chamber pressure rise gives a circumferentially
   non-uniform flow into the nozzle, biasing which side separates first.
3. **Unit-specific hardware asymmetry.** Ovality, a weld step, a contour
   mismatch at a joint, or a coolant-channel manifold asymmetry that biases the
   separation line to a fixed azimuth on that unit.

*How to discriminate:*
- **Azimuth repeatability across starts on the same unit.** If the load vector
  points the same way every start, it is hardware (3) or a fixed sequence
  asymmetry (2). If the azimuth is random, it is flow topology (1).
- **Correlate with the start sequence.** Overlay the load event on the valve
  timing and $p_c$ trace. If the event tracks a specific $p_c$ (i.e. a specific
  NPR), it is (1); if it tracks a valve, it is (2).
- **Metrology on the suspect unit.** Ovality and contour scan of the nozzle
  exit, and comparison against the unit that did not show the load.
- **Subscale cold flow of the contour**, which establishes the NPR at which
  FSS↔RSS occurs and whether that NPR corresponds to 22 % $p_c$.

*Which would I bet on:* [J] **(1), the topology flip, with (3) as the reason it
appeared on this unit and not the next.** The evidence for (1) is the timing
(22 % $p_c$ is squarely in the transition window), the magnitude (matches the
FSS/RSS estimate, and is two orders of magnitude above what wander can produce),
and the fact that it does not recur at mainstage (the flip is a one-way event
once $p_c$ is up). The non-recurrence on the next unit is *not* evidence against
(1), because the flip's azimuth and severity are sensitive to small geometric
asymmetries — which is exactly why it is a *statistical* qualification problem
and why programmes qualify against a load envelope rather than a measured
value. The dangerous wrong conclusion is "it was a one-off on that unit"; the
right conclusion is "we have now measured one sample from a distribution and we
do not know its tail."

---

## K2. Quiz answers with explanations

**Q1 (6) — (b), a 15° conical nozzle of the same $\varepsilon$ and throat
radius.**
(a) is the most common wrong answer and is wrong because the Rao optimum's
length is itself a design input, not a fixed reference. (c) is wrong because
"same exit diameter" is not the convention and would give a different number
(the cone reference must have the same $\varepsilon$ *and* the same $r_t$).
(d) is wrong because the convention concerns the divergent only, not the
engine. Deduct nothing for a student who adds that some texts use a sharp
-throat cone reference, shifting the number by a point or two — that is correct
and shows they have read §3.7.

**Q2 (6) — (a), $0.382\,r_t$.**
(b) $1.5\,r_t$ is the *upstream* radius. (c) is not a convention anyone uses.
(d) is superficially attractive but wrong: the exit tangency is enforced by the
parabola, not by the throat arc; the arc's job is to reach $\theta_n$, the
*initial* angle.

**Q3 (8) — (c) $C_F$ and (e) $I_{sp}$ only.**
$M_e$ and $p_e$ are fixed by $\varepsilon$ and $\gamma$ for attached flow;
$\dot m$ and $c^*$ are set at the choked throat and cannot be influenced from
downstream. Award 8 for exactly {c, e}; 4 for {c, e} plus one extra; 0 if
either (b) or (d) is selected, since each represents a fundamental
misunderstanding this module exists to correct.

**Q4 (12) — $\gamma = 1.20$, $\varepsilon = 36$, $p_c = 80$ bar.**
$$M_e = 4.1659,\qquad \frac{p_c}{p_e} = (1+0.1\times4.1659^2)^{6} = 419.0
\quad\Rightarrow\quad p_e = 19.09\ \mathrm{kPa}$$
$$C_{F,vac} = 1.8754$$
$$C_{F,SL} = C_{F,vac} - \frac{p_a}{p_c}\varepsilon = 1.8754 - \frac{101\,325}{8\times10^{6}}\times36 = 1.8754 - 0.4560 = 1.4194$$
Summerfield: $p_{sep} = 0.4\times101\,325 = 40.53$ kPa, and
$p_e = 19.09$ kPa $\ll 40.53$ kPa, so **Summerfield predicts separated flow**.
(Schmucker also predicts separation: $p_{sep} = 29.62$ kPa $> p_e$.)

*Marking:* 3 for $M_e$, 3 for $p_e$, 2 for $C_{F,vac}$, 2 for $C_{F,SL}$, 2 for
the separation verdict. **Deduct 2 more** from any answer that reports
$C_{F,SL} = 1.4194$ as the engine's actual sea-level performance without noting
that the attached-flow formula does not apply to a separated nozzle — the whole
point of the last part is that the number just computed is not physical.

**Q5 (12) — break-even, $\varepsilon = 12$ vs 22, $p_c = 90$ bar.**
$$C_{F,vac}(12) = 1.7645,\qquad C_{F,vac}(22) = 1.8300$$
$$p_{a,BE} = 90\times10^{5}\times\frac{1.8300-1.7645}{22-12} = 90\times10^{5}\times\frac{0.065489}{10} = 58.94\ \mathrm{kPa}$$
Troposphere branch:
$$h_{BE} = \frac{288.15}{0.0065}\left[1-\left(\frac{58\,940}{101\,325}\right)^{0.19026}\right] = \boxed{4.34\ \mathrm{km}}$$

*Marking:* 4 for the two $C_{F,vac}$ values, 4 for Eq. 3.12 correctly applied
(the $\varepsilon_2-\varepsilon_1$ denominator is where students err), 4 for the
atmosphere conversion with the correct branch. A student who uses the
stratosphere formula at 59 kPa has not checked which layer they are in and
loses 4.

**Q6 (10) — 15° cone, $r_t = 80$ mm, $\varepsilon = 40$.**
$$L_{cone} = \frac{0.080(\sqrt{40}-1)+1.5(0.080)(\sec15°-1)}{\tan15°}
= \frac{0.42596+0.004233}{0.267949} = \boxed{1.6055\ \mathrm{m}}$$
$$\lambda = \frac{1+\cos15°}{2} = \boxed{0.98296}\quad(1.70\%\ \mathrm{loss})$$
$$L_{75\%} = 0.75\times1.6055 = \boxed{1.2041\ \mathrm{m}}$$
(For reference, $r_e = r_t\sqrt{40} = 0.5060$ m, $D_e = 1.012$ m.)

*Marking:* 4/3/3. Accept 1.586 m for the cone if the arc term is neglected
(sharp-throat form), provided the student says so.

**Q7 (10) — why $(1+\cos\theta_e)/2$ fails for a bell.**
Expected content: Eq. 3.6 assumes source flow — uniform speed, every streamline
at the local cone angle, on a spherical cap. A bell's exit flow is not like
that: the wall angle is $\theta_e$ but the flow turns progressively towards
axial away from the wall, so most of the mass flux leaves at angles well below
$\theta_e$. Applying the formula with $\alpha = \theta_e$ therefore assumes the
worst case for every streamline, and it is a **lower bound** on the true
$\lambda$. For $\theta_e = 11°$ it gives 0.9908 against a design-practice value
around 0.99–0.995, which is consistent with a lower bound that is nearly tight
at small exit angles.

*Marking:* 4 for the source-flow assumption, 3 for the non-uniform exit angle,
3 for "lower bound" **with a reason**. A student who says "upper bound" has the
sign of the argument backwards and gets at most 4.

**Q8 (12) — 285 vs 280, unknown $p_c$, asked for $I_{sp}$ at 77:1.**

What you **can** answer, and confidently:
- **The ratio of vacuum $I_{sp}$ between any two area ratios**, because vacuum
  $C_F$ is a function of $\gamma$ and $\varepsilon$ only (§3.5). $p_c$ cancels
  identically. With $\gamma = 1.20$: $C_{F,vac}(77)/C_{F,vac}(285) = 0.96104$,
  so $I_{sp}(77) = 0.96104\times465.5 = 447.4$ s, a loss of **18.1 s**.
- **That the 285-versus-280 dispute is immaterial**: $C_{F,vac}(280)/C_{F,vac}(285)
  = 0.99955$, worth **0.21 s** — an order of magnitude below the uncertainty in
  $\gamma$. Say so and move on.

What you **cannot** answer:
- The *absolute* $I_{sp}$ from first principles, because that needs $c^*$, which
  needs $T_0$, $\mathcal M$ and $\gamma$ from a thermochemical calculation at
  the actual $p_c$ and mixture ratio — and $p_c$ is not published. You are
  anchoring on a *measured* 465.5 s, not predicting it.
- Anything about sea-level performance, where $p_a\varepsilon/p_c$ requires
  $p_c$ explicitly.
- The delivered $I_{sp}$ to better than a few seconds, because the answer is
  sensitive to $\gamma$: over $\gamma = 1.14$–1.25 the loss ranges from 23.2 s
  to 14.7 s (§5.4 Step 5).

*Marking:* 5 for identifying that vacuum $C_F$ is $p_c$-independent and using a
ratio, 3 for the number, 2 for dismissing 280-vs-285 quantitatively, 2 for
naming what remains unanswerable and why. An answer that simply asserts
"can't be done without $p_c$" scores 2; an answer that invents a chamber
pressure scores 0.

**Q9 (12) — lengthening a booster nozzle from 70 % to 85 % bell at fixed
$\varepsilon$.**

Any three of the following, each with a reject condition:

1. **Separation and side loads.** Lengthening at fixed $\varepsilon$ does not
   change $p_e$, so the steady separation criterion is unchanged — but the
   contour changes, and with it the internal shock structure and the FSS/RSS
   behaviour. *Reject if* subscale cold flow shows the RSS transition moving
   into the start window or the predicted side load rising.
2. **Cooling.** The wetted area rises by roughly 20 % (§3.8 table), so the
   coolant heat pickup and channel pressure drop both rise. *Reject if* the
   coolant outlet temperature exceeds the coking or turbine-inlet limit, or the
   pump discharge pressure cannot cover the extra $\Delta p$.
3. **Mass and the gimbal.** More nozzle mass, further aft, lowers the first
   bending mode and raises gimballed inertia. *Reject if* the bending mode
   moves into the TVC control bandwidth or the actuators cannot slew the new
   inertia at the required rate.
4. **Vehicle envelope.** Engine length grows; base heating, plume impingement
   on neighbouring engines, and the launch-mount interface all change.
   *Reject if* the engine no longer fits the gimbal envelope.
5. **The gain itself.** From 70 % to 85 % bell the divergence efficiency
   improves by only a few tenths of a per cent. *Reject if* the friction loss
   from 20 % more wetted area eats the divergence gain — which at booster scale
   it very nearly does.

*Marking:* 4 per item, up to 12. An item without a stated reject condition
scores 2. Item 5 — noticing that the gain may be zero net — earns full marks on
its own merits and is the answer a strong candidate gives first.

**Q10 (12) — truncated ideal contour vs aggressive thrust-optimised contour.**

*The 0.4 % $C_F$ advantage of B:* the thrust-optimised contour is the solution
to Rao's variational problem — it maximises axial thrust at that length by
turning hard immediately downstream of the throat and recompressing
isentropically back towards axial. A truncated ideal contour is simply an ideal
(shock-free) contour cut short; it is shock-free but not thrust-optimal at that
length. 0.4 % is the right magnitude.

*The 4× side-load disadvantage of B:* turning hard near the throat is exactly
what generates the strong internal shock. That internal shock is what makes
restricted shock separation possible, and RSS is what produces above-ambient
wall pressures on one side of the nozzle while the other side is below ambient
(§3.12, C7). A truncated ideal contour has a much weaker internal shock and
tends to stay in free shock separation, where §5.3 shows the loads are an order
of magnitude smaller.

*Which to fly on a first stage:* [J] **A, the truncated ideal contour**, and the
argument is asymmetric. The 0.4 % of $C_F$ is worth roughly 1.2 s of $I_{sp}$
on a 300 s booster engine — real, but recoverable elsewhere (mixture ratio,
$\eta_{c^*}$, a slightly higher $\varepsilon$). The 4× side load is a
*structural* requirement: it sizes the nozzle shell, the stiffening rings, the
chamber-to-nozzle joint and the gimbal bearing, and its tail is poorly known
because it is a transient statistical event (R5). You can buy back 0.4 % of
$C_F$; you cannot buy back a nozzle that has torn off.

*The counter-argument that must be acknowledged for full marks:* if the vehicle
is performance-critical and the structure has already been qualified to the
higher load — which is the RS-25's situation, since it has flown that contour
since 1981 — then B is the right answer, because the load is a known,
qualified quantity and the 0.4 % is free payload. **The decision depends on
whether the structure is a new design or an existing qualified one**, and a
student who says that gets full marks regardless of which contour they pick.

*Marking:* 4 for the $C_F$ mechanism, 4 for the side-load mechanism, 4 for a
defended choice that acknowledges the counter-argument.

---

## K3. Trade-study reference solution (T1)

**Restating the problem.** Methalox upper stage, $F_{vac} = 250$ kN,
$p_c = 120$ bar, $\gamma = 1.16$, $c^* = 1\,850$ m/s delivered, restartable, up
to 600 s cumulative burn, interstage inner diameter **2.2 m**, axial envelope
**2.4 m**, 12 flights per year, unit cost matters.

**Step 1 — compute all four options.** Vacuum $C_F$ depends only on $\gamma$
and $\varepsilon$. Take $\eta_n = 0.975$ for the fixed bells: $\lambda \approx
0.99$ for an 80 % bell, $\eta_f \approx 0.99$, $\eta_{kin} \approx 0.995$ for
methalox (much less dissociation to recover than hydrogen), product 0.975. [J]

| option | $\varepsilon$ | $C_{F,vac}$ | $A_t$ (m²) | $D_t$ (mm) | $D_e$ (m) | $L_{80\%}$ (m) | $I_{sp,vac}$ |
|---|---|---|---|---|---|---|---|
| **A** regen to 25 + C-103 | 100 | 2.0102 | 0.01036 | 114.9 | 1.149 | 1.552 | **369.7 s** |
| **B** regen to 25 + C–C | 150 | 2.0410 | 0.01021 | 114.0 | 1.396 | 1.923 | **375.4 s** |
| **C** extendable, C–C | 90 → 260 | 2.0017 → 2.0788 | 0.01002 | 113.0 | 1.092 → 1.821 | 1.468 stowed / 2.559 deployed | **368.2 → 382.4 s** |
| **D** full regen, 70 % bell | 60 | 1.9672 | 0.01059 | 116.1 | 0.899 | 1.031 (70 %) | **361.8 s** |

**Step 2 — envelope check, which eliminates one option immediately.**
All four exit diameters fit inside 2.2 m. On axial envelope (2.4 m):

- A: 1.552 m — fits with 0.85 m to spare.
- B: 1.923 m — fits with 0.48 m to spare.
- C: 2.559 m deployed **exceeds the 2.4 m envelope**, which is precisely why it
  needs a mechanism; stowed at 1.468 m it fits easily. So C is *feasible* but
  only because of the mechanism, which is the point of the option.
- D: 1.031 m — trivially fits.

**Step 3 — the performance ladder relative to the baseline.**
Taking D as the floor: A is +7.9 s, B is +13.6 s, C is +20.6 s. The interesting
increments are **B over A: +5.7 s** and **C over B: +7.0 s**.

**Step 4 — cost the increments.**

- *A → B* costs a carbon–carbon skirt instead of a coated-niobium one, at
  $\varepsilon = 150$ rather than 100. C–C is expensive, has weeks of
  densification lead time, and needs oxidation protection — but at **12 units
  per year** that is a manageable supply-chain problem, and C-103 at
  $\varepsilon = 150$ would be heavy (density 8.6 vs 1.8 g/cm³) over a much
  larger skirt area. Note also that C-103 is *life-limited by its silicide
  coating*, and this engine restarts and accumulates 600 s per flight.
- *B → C* costs a **deployment mechanism**: a single-point failure with no
  abort mode, plus qualification of deployment after launch loads and thermal
  cycling, plus the mass of rails and actuators. Buying 7.0 s.
- *D* is the only option whose divergent is fully regeneratively cooled — no
  skirt material problem, no coating life limit, simplest possible hardware —
  and it gives up 13.6 s to B for that.

**Step 5 — recommendation.**

[J] **Recommend B: fixed bell, $\varepsilon = 150$, regeneratively cooled to
$\varepsilon = 25$ then a carbon–carbon skirt, 80 % bell.**

The argument in one line: B extracts nearly all of the available $I_{sp}$ that
does not require a mechanism, and it does so inside the given envelope with
0.48 m of margin.

In full:
- **Against A:** 5.7 s for a skirt material change is cheap. A's advantage is
  cost and a mature supply chain; its problem is that a coated-niobium skirt on
  a restartable engine accumulating 600 s per flight is a coating-life item, and
  C-103 mass at $\varepsilon = 150$ would be worse than the C–C it replaces.
- **Against C:** 7.0 s does not justify a single-point-failure mechanism when
  the envelope does not force it. C exists to defeat a packaging constraint;
  here the packaging constraint is not binding at $\varepsilon = 150$. Adding a
  mechanism to buy $I_{sp}$ you could get by other means is the wrong reason to
  add a mechanism (contrast §6.4, where the RL10B-2 had no alternative).
- **Against D:** 13.6 s is too much to give up for construction simplicity on an
  **upper stage**, where $I_{sp}$ is worth three to five times what it is worth
  on a first stage. D would be the right answer for a booster.

**The single piece of missing information that would most change the answer:**
the **stage's mass ratio and the $\Delta v$ margin** — i.e. how many kilograms
of payload one second of $I_{sp}$ is worth. If the stage is performance-critical
by more than ~7 s, C becomes defensible; if the stage has generous margin, A or
even D wins on cost and the whole C–C supply chain disappears from the
programme. A close second is the **carbon–carbon skirt's mass and cost at
$\varepsilon = 150$ against C-103 at $\varepsilon = 100$**, since that is the
A-versus-B decision reduced to two numbers.

### Rubric

**A strong answer must contain:**
- Correct $C_{F,vac}$ for each option, with the observation that $p_c$ does not
  enter the vacuum calculation.
- A **stated and justified** $\eta_n$, broken into $\lambda$, $\eta_f$,
  $\eta_{kin}$ — not a number pulled from the air.
- An **envelope check** that uses the 2.4 m axial constraint and identifies that
  it is what makes option C's mechanism necessary.
- Comparison of the **increments** (B−A, C−B), not just the absolute $I_{sp}$
  values. The decision is about what each step buys.
- Explicit treatment of the **12 flights per year**: it makes carbon–carbon lead
  time manageable and makes a mechanism's qualification cost amortise slowly.
- A recommendation with a **counter-argument acknowledged**, and a named missing
  input.

**Loses marks for:**
- Computing sea-level performance for any option (this is a vacuum engine; the
  question of separation does not arise).
- Choosing C because it has the highest $I_{sp}$, without pricing the mechanism
  or noticing that the envelope does not force it.
- Choosing D because it is simplest, without pricing 13.6 s on an upper stage.
- Any $\eta_n$ above about 0.98 or below 0.95 without justification.
- Ignoring the coating-life issue for C-103 on a restartable, long-burn engine.
- Treating "$\varepsilon = 260$ deployed" as free performance — the mechanism,
  its mass, and its failure mode are the entire content of that option.

---

## K4. Common wrong answers, and what they reveal

**"Exit pressure falls when you go to vacuum."** The single most common error on
this material. It reveals that the student is thinking of the nozzle as a duct
whose downstream end is set by the ambient, rather than as a supersonic device
whose interior is causally isolated from downstream conditions. The corrective
is the choked-throat argument: nothing downstream of the sonic line can send
information upstream, and nothing outside the exit can send information into a
supersonic exit flow. Ambient pressure enters only through the $(p_e-p_a)A_e$
bookkeeping term — or by separating the boundary layer, which is a *viscous*
mechanism, not an inviscid one.

**Reporting a sea-level $C_F$ for a separated nozzle.** Students compute
$C_F = C_{F,vac} - p_a\varepsilon/p_c$ dutifully, get 1.42 for a nozzle that
every criterion says is separated, and report it. This reveals a failure to
carry the assumptions attached to an equation — the attached-flow $C_F$
expression has "attached" in its name. The habit to build: *every time you use
Eq. 3.11 at a non-zero $p_a$, check separation first.*

**Using $(1+\cos\alpha)/2$ for a bell.** Reveals that the student memorised the
formula without the derivation. The derivation assumes source flow on a
spherical cap; a bell exists specifically to violate that assumption. The
symptom is a student who confidently reports $\lambda = 0.996$ for an 80 % bell
with $\theta_e = 8°$ and does not notice that they have just claimed the bell is
better than physics allows.

**"80 % of the Rao optimum length."** Reveals reading a textbook figure caption
rather than the definition. It matters because the two references differ by tens
of per cent and someone will build hardware from your number.

**Treating $\varepsilon$ as an exact published quantity.** Students look up
"RS-25: 69" and use it to five significant figures. The RS-25 section (§6.2)
exists to inoculate against this. The deeper error is not knowing that "throat
area" is itself ambiguous (geometric vs effective), which also means that every
$c^*$ from a test stand carries the same ambiguity.

**Explaining side loads as "the flow separates unevenly".** True but useless. It
reveals that the student has the phenomenon but not the magnitude. §5.3 exists
to show that uneven separation *within* free shock separation produces ~8 kN on
a nozzle where hundreds of kN are measured; the physics that matters is the
FSS↔RSS topology flip, and a student who cannot say that has a description
rather than an explanation.

**Advocating aerospikes without the thermal argument.** A student who says
"aerospikes are better but industry is conservative" has read a popular article.
The correct answer names the cooled-surface-area-per-unit-thrust problem, notes
that J-2T and XRS-2200 were built and fired, and observes that the concept fails
on hardware grounds rather than aerodynamic ones. Symmetrically, a student who
dismisses aerospikes as "they don't work" is also wrong — the compensation is
real and measured.

**Quoting the "~30 s" for the RL10B-2 extension.** It is in circulation, it is
in this course's own reference file, and §5.4 shows the gas dynamics cannot
support it at any plausible $\gamma$, while the manufacturer's family table
gives 14.5 s. A student who reproduces the number without checking it has done
exactly what the number's propagation depended on. The habit to build: when a
round number and a calculation disagree, the calculation is usually right and
the round number usually has no primary source.

**Optimising the convergent.** Occasionally a student spends a page on the
convergent contour. It reveals a failure to rank effort by consequence: the
convergent is subsonic, contributes essentially no thrust, is 1/6 of the
divergent's length, and a mediocre one costs a fraction of a per cent. The
divergent is where all the performance and all the trouble live.
