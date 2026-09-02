# Module 11 — Cooling Systems: Answer Key

Sections K1–K4 only. Every numerical answer here is reproduced by
`tools/examples/11.py` where the arithmetic maps onto a `tools/rocket.py`
function; the rest is checkable by hand from the equations named.

Standing conventions: $g_0 = 9.80665$ m/s², all temperatures in K, all
pressures in Pa unless a bar figure is stated. Where a problem admits a range
of defensible assumptions, the key states the assumption used and marks the
tolerance a grader should accept.

---

## K1. Problem solutions

### Conceptual

**C1 — Why better coolant-side heat transfer increases the heat flux.**

Eq. 3.4 is $q'' = (T_{aw} - T_b) / (1/h_g + t_w/k_w + 1/h_{c,\mathrm{eff}})$.
The numerator does not contain $h_{c,\mathrm{eff}}$ at all: the driving
potential is set by the *gas* and the *coolant bulk*, both of which are fixed by
combustion and by the propellant feed. Raising $h_{c,\mathrm{eff}}$ shrinks one
term in the denominator, so $q''$ rises. Physically: a colder wall presents a
larger $T_{aw} - T_{wg}$ to the gas, and the gas responds by delivering more
heat.

Engineers do it anyway because $q''$ is not what they are trying to control.
The controlled quantities are $T_{wg}$ (liner strength, creep, LCF life) and
$T_{wc}$ (coolant decomposition), and both fall as $h_{c,\mathrm{eff}}$ rises.
The extra heat load is paid for in coolant bulk temperature rise and pump work,
which are cheaper than a cracked liner.

*Full marks* require both halves: the algebra of why $q''$ rises, and the
statement that wall temperature — not heat flux — is the design objective.

**C2 — Milled channels in the MCC, tubes in the nozzle.**

Any three of:

1. **Flux.** The MCC throat sees of order 160 MW/m² at 206 bar; the nozzle at
   large area ratio sees two orders of magnitude less. Only the throat needs the
   thermal performance a milled copper channel gives.
2. **Wall geometry.** A round tube's hot wall is curved, so the thickness of
   metal between gas and coolant varies around the crown, and the crown — which
   sees the highest gas-side flux — has the least coolant-side area behind it. A
   milled channel has a flat hot wall of uniform, chosen thickness.
3. **Lands as fins.** Milled lands are solid copper of chosen width and
   conduct as designed fins ($\Phi \approx 1.8$–2.0). Between adjacent tubes
   there is only a braze fillet, which conducts poorly.
4. **Area and mass.** A copper liner over the full nozzle area would be
   enormously heavy and expensive; 1,080 thin brazed tubes are far lighter for a
   surface that only needs modest cooling.
5. **Compliance.** A tube bundle is structurally compliant and accommodates the
   large thermal growth of a 3 m bell without cracking; a monolithic milled
   liner of that size would not.
6. **Independent sizing.** In a milled channel $A_{ch}$ and $D_h$ are
   independently selectable and can be varied continuously along the contour by
   varying milling depth. A tube's cross-section couples them.

**C3 — Doubling channel height at the throat.**

The intended benefit is that $A_{ch}$ doubles, so $V_c$ halves and, since
$\Delta p \propto V^2/D_h$, the pressure drop falls by roughly 4×.

The two cancelling effects:

- **$h_c$ falls.** $h_c \propto V^{0.8}D_h^{-0.2}$, so halving $V$ costs about
  43 % of $h_c$ before the $D_h$ term partly recovers it.
- **Fin efficiency collapses.** $\eta_f = \tanh(mh_{ch})/(mh_{ch})$ falls
  roughly as $1/h_{ch}$ once $mh_{ch} > 2$, so the area enhancement $\Phi =
  (w + 2\eta_f h_{ch})/p_{ch}$ barely moves — the extra land length is not
  conducting. Problem N3 is the arithmetic: doubling $h_{ch}$ from 4.5 to 9.0 mm
  raises $\Phi$ only from 1.83 to 1.85, a 1 % gain, because $\eta_f$ halves from
  0.41 to 0.21.

**(a) RP-1:** the $h_c$ loss dominates. RP-1 has no $\Delta p$ headroom to
spare and a hard $T_{wc}$ constraint; losing 40 % of $h_c$ is unaffordable and
the trade is bad.

**(b) Hydrogen:** the $\Delta p$ gain dominates and the trade is good. WE2's
hydrogen case at $AR = 2$ runs 611 m/s and 128 bar/m; at $AR = 6$ it runs
226 m/s and 17.9 bar/m — a 7× reduction in pressure gradient for 150 K more
wall temperature, and hydrogen has 150 K to give because it has no
decomposition limit. This is exactly why HARCC designs exist and why they
appear on hydrogen and methane engines rather than on kerosene ones.

**C4 — Radiative cooling scalings.**

Rejection: $q''_{rad} = \varepsilon_{em}\sigma_{SB}T_w^4$. At $\varepsilon =
0.85$ and $T_w = 1600$ K (the coated-niobium service limit) this is 0.32 MW/m².
That is a *ceiling* set by materials, and $T_w^4$ means you cannot buy much more
without a better material.

Demand: $q'' = h_g(T_{aw} - T_w)$ with $h_g \propto p_c^{0.8}D_t^{-0.2}$
(Bartz). An R-4D-class thruster runs $p_c \approx 6.9$ bar; an F-1 runs
$p_c \approx 70$ bar with a throat two orders of magnitude larger in area. The
$p_c^{0.8}$ term alone is a factor of ~6.5, and the R-4D additionally runs a
fuel-film-cooled wall that reduces the effective driving temperature.

The result is 0.32 MW/m² available against ~50 MW/m² required: radiative
cooling is short by a factor of about 150 at a booster throat, and matched at a
small thruster or far downstream in a nozzle where $(A_t/A)^{0.9}$ has already
reduced $h_g$ by two orders of magnitude. Full marks require the $T^4$ ceiling,
the $p_c^{0.8}$ scaling, and a number for the mismatch.

**C5 — Why the F-1's GG curtain is free and its injector film is not.**

Eq. 3.17 gives the penalty as $x_{fc}(1 - I_{sp,film}/I_{sp,core})$. It is a
penalty because the film propellant *could have* been burned at the core mixture
ratio and expanded through the nozzle at core performance, and instead it is
burned fuel-rich against the wall.

Gas-generator exhaust has already been debited. In a GG cycle, 2–3 % of the
propellant is spent driving the turbine and is exhausted at low performance; the
cycle accounting has already charged that loss against $I_{sp}$. Routing that
same exhaust down the nozzle wall as a curtain does not remove any additional
propellant from the core and does not reduce the exhaust's own already-counted
performance. The marginal cost is zero. (Strictly it is slightly *negative* —
the curtain adds a little pressure-area thrust in the extension — but that is a
second-order effect and should not be claimed without a calculation.)

The injector-face fuel film is live core propellant, diverted before it does
anything useful. It carries the full Eq. 3.17 penalty.

The general lesson, which is what a strong answer says: **pay for film cooling
with a flow you have already written off.** Vulcain 2's turbine-exhaust film on
the lower nozzle is the same trick.

**C6 — The closed expander thrust ceiling.**

Available power: the jacket pickup is $Q = \int q''\,dA$, i.e. flux times wetted
area. At fixed $p_c$, wetted area scales as $D^2$ but $h_g \propto D_t^{-0.2}$
falls as the engine grows, so $Q \propto D^{1.8}$ — sublinear in throat area,
i.e. **sublinear in thrust**.

Required power: pump shaft power is $P \propto \dot m \Delta p/\rho$, and
$\Delta p$ must cover $p_c$ plus injector plus jacket drop. $\dot m \propto A_t
\propto D^2$, so at fixed $p_c$, $P \propto D^2$ — **linear in thrust**.

Worse, only about 10 % of $Q$ becomes shaft work (WE4: 7.18 MW in, 0.64 MW
out), because the turbine pressure ratio in a closed expander is small — the
turbine discharge must still be above chamber pressure plus injector drop, so
$pr$ is limited to roughly 1.3–1.6, and $[1 - pr^{-(\gamma-1)/\gamma}] \approx
0.10$.

Demand grows as $D^2$, supply as $D^{1.8}$, and the supply is already only 10 %
efficient. The margin closes somewhere around 300–500 kN, which is why the RL10
family has stayed at 73–110 kN. Escapes: expander *bleed* (LE-5B, BE-3U), which
breaks the constraint that the turbine be fed by the whole fuel flow and lets
$pr$ be large because the flow is dumped; or a preburner.

**C7 — Jacket $\Delta p$ up 8 % over twelve fires at constant flow.**

*Cause:* coking of the coolant-side channel wall.

*Mechanism:* the coolant-side wall is above the RP-1 catalytic coking threshold
(~560–590 K). Sulfur in the fuel and the catalytically active copper or nickel
surface nucleate carbon deposits. The deposit reduces the effective flow area
and increases roughness, so $\Delta p$ rises at fixed flow. It also adds thermal
resistance ($k \approx 0.1$–1 W/(m·K), of order 1/1000 that of copper), which
raises $T_{wc}$, which accelerates deposition — the process is Arrhenius in wall
temperature and therefore self-accelerating. Left alone it ends in a throat
burn-through, typically before the deposit is thick enough to be obvious in a
flow number.

*Next two measurements:*

1. **A cold-flow $\Delta p$-versus-flow sweep** on the assembled jacket,
   compared against the acceptance-test curve from before the series. This
   separates a distributed area reduction (curve shifts up over the whole flow
   range in a way consistent with $\Delta p \propto \dot m^{1.8}$) from a
   discrete blockage (a much steeper shift), and quantifies how much area has
   been lost.
2. **Borescope inspection of the throat channels**, looking for a dark tenacious
   film, plus a review of the coolant outlet-temperature trend for the same
   series. A rising outlet temperature at constant flow and power confirms that
   heat load has not fallen, so the $\Delta p$ rise is area, not flow.

Acceptable alternatives for the second: fuel-sample sulfur assay, or a wall
thermocouple trend at the throat. Credit any answer that distinguishes
"distributed deposit" from "discrete blockage or debris" and says how.

**C8 — Transpiration-cooled face, not wall.**

*Why the face works.* The injector face has no room for cooling channels — it is
perforated by hundreds of injection elements — but it sees recirculating hot gas
and must be cooled. It is a flat, structurally supported disc, so a porous
sintered plate's low strength is not a problem. The flow path through it is
short (millimetres) and the pressure field across it is nearly uniform, so flow
distribution is controllable. The J-2 and RS-25 both use a porous sintered
stainless face transpiration-cooled with hydrogen.

*Why the wall does not.* Three reasons: (1) a porous chamber wall is
structurally weak, and the chamber wall is a pressure vessel; (2) the pores clog
— with coke, with contamination, with oxide — and a clogged pore is a local
burn-through with no warning; (3) the axial pressure gradient along a chamber
and nozzle is large, so the local transpiration flow rate through a porous wall
is set by the local $\Delta p$ rather than by where the heat load is, and it
distributes itself exactly wrong (most flow where the chamber pressure is
lowest, i.e. downstream, where the flux is also lowest).

Full marks: at least two of the three wall objections, plus the observation
that the face is the one place where all three are absent.

---

### Calculation

**N1.** $h_g = 1.5\times10^{4}$, $T_{aw} = 3500$, $t_w = 0.8$ mm, $k_w = 320$,
$h_{c,\mathrm{eff}} = 7.0\times10^{4}$, $T_b = 420$.

$$R_g = 1/1.5\times10^{4} = 6.6667\times10^{-5}\ \mathrm{m^2K/W}$$
$$R_w = 0.0008/320 = 2.500\times10^{-6}$$
$$R_c = 1/7.0\times10^{4} = 1.4286\times10^{-5}$$
$$R_{tot} = 8.3452\times10^{-5}\ \mathrm{m^2K/W}$$

Shares: **gas 79.9 %, wall 3.0 %, coolant 17.1 %.**

$$q'' = \frac{3500-420}{8.3452\times10^{-5}} = \mathbf{3.691\times10^{7}\ W/m^2 = 36.9\ MW/m^2}$$
$$T_{wg} = 3500 - 3.691\times10^{7}/1.5\times10^{4} = 3500 - 2460.5 = \mathbf{1039.5\ K}$$
$$\Delta T_w = 3.691\times10^{7}\times0.0008/320 = \mathbf{92.3\ K}$$
$$T_{wc} = 420 + 3.691\times10^{7}/7.0\times10^{4} = 420 + 527.2 = \mathbf{947.2\ K}$$

*Comment a grader should look for:* the gas side is 80 % of the resistance, so
this design is gas-side limited; and $T_{wc} = 947$ K would be catastrophic for
kerosene and marginal even for methane.

**N2.** Same, with $k_w = 25$ W/(m·K).

$$R_w = 0.0008/25 = 3.200\times10^{-5},\qquad R_{tot} = 1.12952\times10^{-4}$$
$$q'' = \mathbf{2.727\times10^{7}\ W/m^2},\qquad
T_{wg} = 3500 - 1817.9 = \mathbf{1682.1\ K}$$
$$\Delta T_w = \mathbf{872.6\ K},\qquad T_{wc} = \mathbf{809.5\ K}$$

$T_{wg}$ rises from 1039.5 K to 1682.1 K — **a 643 K increase** — and the wall
now contributes 28.3 % of the total resistance instead of 3.0 %.

To restore $T_{wg} = 1039.5$ K the flux must return to
$3.691\times10^{7}$ W/m², so

$$\frac{t}{25} = \frac{3500-420}{3.691\times10^{7}} - \frac{1}{1.5\times10^{4}} - \frac{1}{7.0\times10^{4}} = 2.500\times10^{-6}$$
$$t = \mathbf{0.0625\ mm = 62.5\ \mu m}$$

**Not manufacturable.** A 62 µm hot wall cannot be machined, printed, brazed,
or inspected, and would have no erosion allowance and no buckling margin
whatsoever. The correct conclusion is that an Inconel liner cannot simply be
thinned to match copper — it must instead run at a lower heat flux, which means
lower $p_c$, or film cooling, or both. This is §6.6's argument in one
calculation.

**N3.** $h_c = 5.5\times10^{4}$, $k_w = 300$, $t_L = 1.3$ mm, $w = 1.6$ mm,
pitch $= w + t_L = 2.9$ mm.

$$m = \sqrt{\frac{2\times5.5\times10^{4}}{300\times1.3\times10^{-3}}} = \sqrt{\frac{1.10\times10^{5}}{0.39}} = \mathbf{531.1\ m^{-1}}$$

At $h_{ch} = 4.5$ mm:
$$m h_{ch} = 2.390,\quad \eta_f = \tanh(2.390)/2.390 = 0.98338/2.390 = \mathbf{0.4115}$$
$$\Phi = \frac{1.6 + 2(0.4115)(4.5)}{2.9} = \frac{5.304}{2.9} = \mathbf{1.829},\qquad
h_{c,\mathrm{eff}} = \mathbf{1.006\times10^{5}\ W/(m^2K)}$$

At $h_{ch} = 9.0$ mm (same $w$, $t_L$, $h_c$):
$$m h_{ch} = 4.780,\quad \eta_f = \mathbf{0.2092},\qquad
\Phi = \frac{1.6 + 3.766}{2.9} = \mathbf{1.850},\qquad
h_{c,\mathrm{eff}} = \mathbf{1.018\times10^{5}}$$

**Comment.** Doubling the channel height doubles the geometric land area but
raises $h_{c,\mathrm{eff}}$ by only **1.2 %**, because $\eta_f$ halves. Beyond
$mh_{ch} \approx 2.5$ the land tip is thermally dead: it is at coolant
temperature and conducts nothing. Tall channels buy pressure-drop relief and
almost no heat transfer. (Note this calculation holds $h_c$ fixed; in a real
design the taller channel also halves the velocity, which reduces $h_c$ by ~43 %
and makes the trade worse still.)

**N4.** $\rho = 250$, $c_p = 3300$, $k = 0.085$, $\mu = 3.5\times10^{-5}$,
$\dot m = 0.18$ kg/s, $w = 1.8$ mm, $h_{ch} = 5.0$ mm.

$$A_{ch} = 9.00\times10^{-6}\ \mathrm{m^2},\qquad
D_h = \frac{4\times9.00\times10^{-6}}{2\times6.8\times10^{-3}} = \mathbf{2.647\ mm}$$
$$V_c = \frac{0.18}{250\times9.00\times10^{-6}} = \mathbf{80.0\ m/s}$$
$$Re_c = \frac{250\times80.0\times2.647\times10^{-3}}{3.5\times10^{-5}} = \mathbf{1.513\times10^{6}}$$
$$Pr_c = \frac{3300\times3.5\times10^{-5}}{0.085} = \mathbf{1.359}$$
$$h_c = 0.023\times\frac{0.085}{2.647\times10^{-3}}\times(1.513\times10^{6})^{0.8}\times1.359^{0.4} = \mathbf{7.335\times10^{4}\ W/(m^2K)}$$

Smooth duct: $f = 0.184(1.513\times10^{6})^{-0.2} = 0.010687$

$$dp/dx = \frac{f}{D_h}\cdot\frac{\rho V^2}{2} = \frac{0.010687}{2.647\times10^{-3}}\times\frac{250\times80^2}{2} = 4.038\times0.8\times10^{6} = \mathbf{3.23\times10^{6}\ Pa/m = 32.3\ bar/m}$$

As-printed, $\epsilon = 18$ µm, $\epsilon/D_h = 0.00680$. Haaland:

$$\frac{1}{\sqrt f} = -1.8\log_{10}\left[\left(\frac{0.00680}{3.7}\right)^{1.11} + \frac{6.9}{1.513\times10^{6}}\right] \Rightarrow f = \mathbf{0.03352}$$
$$dp/dx = \mathbf{101.3\ bar/m}$$

**The roughness multiplies the pressure gradient by 3.14.** At this Reynolds
number the flow is in the fully rough regime, where $f$ is independent of $Re$
and set entirely by $\epsilon/D_h$ — so no amount of design cleverness recovers
it. Post-process the channels or design for the rough number. Accept answers
within ±5 % on $f$ (Colebrook iteration gives ~0.0334 rather than 0.0335).

**N5.** $\Delta T_b = Q/(\dot m_f c_p)$, $Q = 20.0$ MW.

| coolant | $\dot m_f$ | $c_p$ | $\Delta T_b$ | inlet | exit | limit | verdict |
|---|---|---|---|---|---|---|---|
| RP-1 | 52.0 | 2280 | **168.7 K** | 300 | **468.7 K** | 590 K (coking) | bulk OK, but only 121 K of margin before the *bulk* itself cokes — and the wall runs hundreds of K hotter than the bulk, so the wall limit is violated long before this one |
| CH₄ | 39.8 | 3050 | **164.8 K** | 120 | **284.8 K** | 900–950 K | comfortable; note it crosses $T_{pc} \approx 230$ K on the way, so watch density collapse and $\Delta p$ |
| LH₂ | 19.4 | 13,600 | **75.8 K** | 50 | **125.8 K** | none | comfortable; the constraint is $\Delta p$, not temperature |

**The point of the problem** is that hydrogen carries the smallest mass flow and
still has the smallest bulk rise, because its $c_p$ is six times kerosene's.
Full marks require noting that the *bulk* limit is not the binding one for RP-1
— the *wall* limit is, and it is violated at far lower bulk temperatures.

**N6.** $D_c = 0.30$ m, $L_{film} = 0.30$ m, $\bar q'' = 12$ MW/m².

$$\Delta h_{film} = 2150(505-300) + 2.9\times10^{5} = 4.408\times10^{5} + 2.9\times10^{5} = 7.308\times10^{5}\ \mathrm{J/kg}$$
$$\dot m_{film} = \frac{1.2\times10^{7}\times\pi\times0.30\times0.30}{7.308\times10^{5}} = \frac{3.393\times10^{6}}{7.308\times10^{5}} = \mathbf{4.64\ kg/s}$$
$$x_{fc} = 4.64/210 = \mathbf{2.21\ \%}$$

$I_{sp}$ penalty (Eq. 3.17):

- $I_{sp,film}/I_{sp,core} = 0.65$: $0.0221\times0.35 = \mathbf{0.77\ \%}$
- $I_{sp,film}/I_{sp,core} = 0.80$: $0.0221\times0.20 = \mathbf{0.44\ \%}$

With the 1.5–2× entrainment allowance: $\dot m_{film} = $ **6.96–9.29 kg/s**,
$x_{fc} = $ **3.3–4.4 %**, penalty **0.66–1.55 %**. On a 300 s engine that is
**2–5 s**.

*Grader note:* the entrainment allowance is the part students omit. Eq. 3.15
assumes every joule of wall heat over $L_{film}$ goes into the film and that
none of the film is stripped into the core. Both are wrong in the same
direction, so the bare answer is a lower bound and must be stated as one.

**N7.** Continuous:

$$t_{abl} = 1.4 \times 0.11\times10^{-3}\ \mathrm{m/s} \times 480\ \mathrm{s} + 3.0\times10^{-3} = 0.07392 + 0.003 = \mathbf{76.9\ mm}$$

Pulsed: 600 × 0.8 s = 480 s of accumulated burn, but at 1.6× the recession rate,
i.e. 768 s equivalent:

$$t_{abl} = 1.4 \times 0.11\times10^{-3} \times 768 + 3.0\times10^{-3} = 0.11827 + 0.003 = \mathbf{121.3\ mm}$$

**A 58 % thickness increase for the same total burn time.** Full marks require
naming *why* pulsed recession is worse: between pulses the char layer cools,
contracts and cracks, and on the next pulse the fresh hot gas reaches virgin
material through the cracks rather than being insulated by an intact char. The
practical consequence is that an ablative engine's liner cannot be sized from
total burn time alone — the duty cycle must be specified, and a
restart-heavy profile is far more demanding than a single long burn.

**N8.** Solve $0.85\sigma_{SB}T_w^4 = 220(2400 - T_w)$ by Newton iteration:

$$T_w = \mathbf{1445\ K},\qquad q''_{rad} = 0.85\times5.670\times10^{-8}\times1445^4 = \mathbf{210\ kW/m^2}$$

Check: $220 \times (2400-1445) = 210$ kW/m². Balanced.

**Silicide-coated niobium: yes**, with margin — its service limit is about
1600 K and the equilibrium is 1445 K. But the margin is only 155 K, and it is
consumed by view-factor blockage (a clustered stage where extensions radiate to
each other), by any local hot streak, and by the coating's degradation with
cycles. A design engineer would want more.

**Carbon–carbon: comfortably yes** (limit 2000 K+), and it would allow the
radiative section to begin further upstream at higher flux, buying area ratio —
which is exactly the RL10B-2's argument.

*Grader note:* accept 1440–1450 K. The common error is to forget that $T_w$
appears on both sides and to solve $\varepsilon\sigma T_w^4 = h_g T_{aw}$, which
gives 1636 K and is wrong by 190 K.

**N9.** With $T_{in} = 180$ K instead of 220 K:

$$Q_{jacket} = 2.810 \times 14{,}600 \times (180-45) = \mathbf{5.54\ MW}$$

(down from 7.18 MW — a 23 % reduction, exactly the ratio of the temperature
rises).

For 480 kW of shaft power at $\eta_t = 0.70$:

$$480{,}000 = 0.70 \times 2.810 \times 14{,}600 \times 180 \times \left[1 - pr^{-0.2857}\right]$$
$$\left[1 - pr^{-0.2857}\right] = \frac{480{,}000}{5.169\times10^{6}} = 0.09286 \Rightarrow pr = \mathbf{1.406}$$

**Is that compatible with a 32.8 bar chamber?** Yes, but only just. The turbine
must discharge above chamber pressure plus injector $\Delta p$ — say
$32.8 \times 1.2 \approx 39$ bar — so turbine inlet must be at least
$39 \times 1.406 = 55$ bar, and the pump must supply that plus the jacket
$\Delta p$: pump discharge of order 70–75 bar. That is consistent with the
~62 bar assumed in WE4 only if the jacket $\Delta p$ is small, which it is not
in an expander. The honest answer is that **a 180 K turbine inlet leaves no
margin**: the cycle balance closes on paper and fails on a cold start, on a
degraded jacket, or on an off-nominal mixture ratio. This is why real expander
cycles are designed with 25–40 % power margin, and why the LE-5B's designers
were willing to pay 5 s of $I_{sp}$ to escape the constraint entirely by going
to a bleed cycle.

---

### Engineering reasoning

**R1 — Two streaks.**

**Chamber A: dark axial streak from the injector face, fading before the
throat.** This is a **film-cooling or injector streak**, not a channel problem.
The origin at the face is diagnostic: a channel-flow defect cannot produce a
feature that starts at the face and *fades* — coolant-side problems get worse
downstream as the coolant heats and the flux rises. A dark deposit specifically
suggests a locally fuel-rich wall region, i.e. either a film orifice flowing
more than its neighbours or an element whose fan is biased toward the wall. The
fading indicates the film is being consumed, as it should be.

*Mechanism:* local mixture-ratio maldistribution at the face — a misdrilled or
partly blocked orifice, or an element with an off-nominal $\Delta p$ split.

*Next measurement:* a **water-flow test of the injector**, per-orifice or
per-sector, with the film circuit flowed separately, and a borescope of the film
orifice at the streak's circumferential position. Compare against the acceptance
flow numbers. Thermal paint or phosphor thermography on a repeat fire will
confirm the streak's angular position is fixed to the injector, not to the
chamber.

**Chamber B: bright hot streak starting ~30 mm upstream of the throat and
continuing downstream.** This is a **coolant-side** problem — a starved,
blocked, or debonded channel. The origin is diagnostic in the other direction:
the streak begins where the flux first exceeds what the degraded channel can
carry, which is just upstream of the throat, and continues because the channel
stays degraded. A film problem cannot start there; there is no film source.

*Mechanism:* one of (i) a blocked channel (debris, a printing defect, coke),
(ii) manifold maldistribution starving one sector, or (iii) a closeout debond
that has lifted the hot wall off the coolant.

*Next measurement:* **cold-flow the jacket with sector-resolved or per-channel
instrumentation** and compare against the acceptance curve. A blocked channel
gives a locally high $\Delta p$ and a low flow in that channel; a debond gives a
locally *low* $\Delta p$ (the blister is a larger flow area) with a hot wall.
Follow with ultrasonic inspection of the bond line at that position. If cold
flow is clean, the answer is coking and the sectioned throat will show it.

*Full marks* require using the **axial origin** as the primary discriminator and
naming a test that distinguishes blockage from debond.

**R2 — Uprating 75 → 105 bar with unchanged hardware.**

*Assumptions (state them).* Fixed thrust chamber geometry, fixed channel
schedule, fixed mixture ratio, so $\dot m \propto p_c$ and coolant density
roughly constant. Bartz: $h_g \propto p_c^{0.8}$. Coolant side:
$V_c \propto \dot m \propto p_c$, so $h_c \propto V_c^{0.8} \propto p_c^{0.8}$
— **the same exponent**. Taking the RE-500 values as the 100-bar reference
($h_g = 1.82\times10^{4}$, $h_{c,\mathrm{eff}} = 8.04\times10^{4}$,
$t_w/k_w = 2.81\times10^{-6}$, $T_{aw} = 3567$ K, $T_b = 400$ K):

| | 75 bar | 105 bar | change |
|---|---|---|---|
| $h_g$ (W/m²K) | 14,460 | 18,920 | ×1.31 |
| $h_{c,\mathrm{eff}}$ (W/m²K) | 63,900 | 83,630 | ×1.31 |
| $q''$ (MW/m²) | 36.1 | **46.8** | **×1.30** |
| $T_{wg}$ (K) | 1067 | **1092** | **+25 K** |
| $\Delta T_w$ (K) | 102 | **132** | +30 K |
| $T_{wc}$ (K) | 966 | **960** | **−6 K** |
| $dp/dx$ | 1.0 | **×1.83** | $\propto V^{1.8}$ |
| $\Delta T_b$ | 1.0 | **×0.93** | $Q\propto p_c^{0.8}$, $\dot m\propto p_c$ |

**The counter-intuitive and correct result: the wall temperatures barely move.**
Heat flux rises 30 %, but so does the coolant-side coefficient, because the
coolant velocity rose with the flow. $T_{wc}$ actually falls slightly.
$\Delta T_w$ rises 30 K, which matters for LCF but is not a step change.

**What does change badly is the pressure drop**, which rises by a factor of 1.83
— from perhaps 34 bar to 62 bar in the RE-500-scale example — on top of a 30 bar
increase in chamber pressure. The fuel pump discharge requirement rises from
roughly 118 bar to roughly 190 bar, a 61 % increase, and the pump power rises by
more than that because the flow rose too.

*Three recommendations, in priority order:*

1. **Re-open the channel area schedule away from the throat.** The velocity
   increase is uniform along the circuit but the heat flux increase is not
   uniformly needed; widening the barrel and nozzle channels recovers most of
   the $\Delta p$ at almost no thermal cost (Eq. 3.13's asymmetric exponents run
   in your favour here). Verify with a cold-flow test.
2. **Re-qualify the turbopump and the LCF life**, not the cooling. The binding
   constraints are the fuel pump discharge pressure and head rise, and the
   liner cycle count at a 30 K larger $\Delta T_w$. Neither is a cooling
   redesign; both are programme risks that must be retired before flight.
3. **Add or increase injector film cooling** only if the LCF analysis shows the
   liner will not make its cycle count. Film is the tool for reducing $q''$, and
   $q''$ is what has risen; but it costs $I_{sp}$, so it is the third answer, not
   the first.

*What loses marks:* asserting that $T_{wc}$ rises 30 % because the flux does.
It does not, because the coolant flow rose with $p_c$. A student who does not
notice that $h_c$ and $h_g$ share the same $p_c^{0.8}$ exponent gets the physics
of the whole problem backwards.

**R3 — Two $\Delta p$ trend curves.**

*Curve 1 (RP-1): flat for 200 s, then rising with increasing slope.* This is the
classic coking signature. The flat portion is the incubation period: the wall is
above the catalytic coking threshold but the deposit has not yet nucleated
enough to reduce flow area measurably. Once nucleated, the deposit adds thermal
resistance, which raises $T_{wc}$, which raises the deposition rate — the
process is Arrhenius in wall temperature, so the curve is concave upward. The
increasing slope is the signature that distinguishes coking from a one-off
blockage (which produces a step) or from gradual erosion (which would lower
$\Delta p$).

*Curve 2 (RP-2): flat for 900 s.* RP-2's sulfur specification is 0.1 ppm against
RP-1's 30 ppm. Sulfur is the catalyst for the low-temperature deposition
mechanism, so removing it does not eliminate coking — the thermal mechanism
still operates above ~700 K bulk — but it lengthens the incubation period by
roughly an order of magnitude, which is what the data show (900 s versus 200 s
before onset, 4.5×; heated-tube data in the literature support roughly an
order-of-magnitude reduction in deposition rate).

*Conclusion.* The two fuels are chemically near-identical as propellants and
give the same performance; the difference is entirely a coolant-life difference,
and it is worth 4–5× the channel life for no performance cost and a modest
procurement cost. **For any regeneratively cooled kerosene engine intended for
reuse, the low-sulfur grade is the cheapest life improvement available.**

*What a careful answer adds:* this does not prove RP-2 is a better *coolant* —
its thermophysical properties are essentially the same. It proves that the
failure mode being observed is catalytic, not thermal. If both engines had gone
flat-then-rising at 200 s, the mechanism would have been thermal cracking and
the fuel change would not have helped.

**R4 — RS-68A ablative nozzle versus RS-25 tube-wall nozzle.**

*Why the same propellants gave opposite answers.* Because the design objective
was different, and cooling architecture is chosen by objective before it is
chosen by physics.

- **RS-25** was designed for **reuse** — nominally 55 missions per engine — at
  206 bar, with performance as a first-order requirement (it flew on a vehicle
  whose payload was set by its $I_{sp}$). An ablative nozzle is single-use by
  definition, so it was never an option. A tube-wall regenerative nozzle at
  69:1 also *feeds the cycle*: the hydrogen picks up heat that goes into the
  preburners. Cost was not the driver; the programme spent whatever it took.
- **RS-68** was designed under an explicit **"design for minimum cost"** brief
  for the EELV competition, targeting roughly 80 % fewer parts than the RS-25.
  It is expendable by design. At 102.6 bar with $\varepsilon = 21.5$, an
  ablative silica/carbon-phenolic nozzle is dramatically cheaper than 1,080
  brazed tubes, needs no manifolds, no braze NDE, and no cooling analysis. The
  price is a low expansion ratio (the nozzle is mass-limited because ablative is
  heavy), an $I_{sp}$ of 411.9 s against the RS-25's 452.3 s, and a
  thrust-to-weight of 47:1 against 73:1. The programme judged that trade
  correct, and it flew for 22 years.

*For a reusable booster engine: the regenerative tube-wall or channel-wall
nozzle, without hesitation.* Ablative is disqualified by definition — the liner
recedes, so the nozzle contour changes between flights, the throat area drifts,
and the engine must be rebuilt. There is no inspection that makes a partially
ablated nozzle flight-worthy for an indeterminate next mission. The reusability
requirement removes the option before any thermal analysis begins.

*The counter-argument, and it deserves a hearing:* if the reuse target is low
(say 5 flights) and the nozzle is a **replaceable module**, an ablative skirt
that is swapped between flights can be cheaper over the programme than a
regenerative one that must be inspected. Titan's LR87 used exactly that
philosophy for a different reason. The argument fails for a booster because
nozzle replacement is not a quick turnaround operation and rapid reuse is the
whole point.

**R5 — The 250 bar printed-Inconel methalox claim.**

*The three least credible claims, in order:*

1. **An as-printed Inconel 718 channel wall at 250 bar.** At 250 bar the throat
   flux scales from the RE-500's 45 MW/m² at 100 bar by roughly $(2.5)^{0.8} =
   2.08$, so of order 90–100 MW/m². Through an Inconel wall ($k = 25$) at even
   0.45 mm, $\Delta T_w = q''t_w/k_w = 9.5\times10^{7}\times0.00045/25 =
   1710$ K. That is not a wall; it is a fuse. The claim is not marginal, it is
   off by a large factor.
   *Settling calculation:* Eq. 3.5, one line, with their own stated flux. Ask
   for their $\Delta T_w$ number.
   *Expected reality:* either a copper-alloy liner, or a chamber pressure of
   80–120 bar rather than 250, or a hot wall so thin it cannot be inspected.

2. **No film cooling at 250 bar.** Even with a copper liner, WE2 shows methane
   holding $T_{wc}$ at 638 K at 100 bar; at 250 bar with the flux doubled the
   coolant-side $\Delta T$ roughly doubles unless the velocity doubles too,
   which it does (flow scales with $p_c$) — so methane may in fact survive
   without film. But with Inconel it cannot, and no clean-sheet 250 bar engine
   in the public record runs with zero film.
   *Settling test:* a heat-flux-matched calorimeter chamber, or a short-duration
   subscale hot fire with wall thermocouples at the throat.
   *Expected reality:* 1–3 % fuel film.

3. **Jacket $\Delta p$ of 25 bar.** For an as-printed channel, Haaland with
   $\epsilon/D_h \approx 0.007$ gives a friction factor roughly 3× the
   smooth-duct value (N4). A 250 bar methalox engine at 500 kN has a methane
   flow of order 100 kg/s at a density that collapses through the pseudo-critical
   region, so the velocity rises sharply along the channel. 25 bar over a full
   circuit at that flux and that roughness is not credible.
   *Settling test:* cold-flow the actual printed part — not a coupon — at the
   design Reynolds number. This is the cheapest test on the list and it should
   have been done already.
   *Expected reality:* 50–90 bar, and probably more before the channel schedule
   is optimised.

*What a strong answer adds:* the three claims are not independent. The Inconel
choice forces film cooling, film cooling reduces the flux which relaxes the
$\Delta p$ requirement, and the honest design point is somewhere quite different
from the one proposed. Ask them for the resistance budget (Eq. 3.4) at the
throat; if they cannot produce it, nothing else in the proposal is trustworthy.

---

## K2. Quiz answers with explanations

**Q1 (8 pts). Answer: (b) gas side, ~78 %.**

From WE1: $1/h_g = 5.50\times10^{-5}$ (78.3 %), $t_w/k_w = 2.81\times10^{-6}$
(4.0 %), $1/h_{c,\mathrm{eff}} = 1.24\times10^{-5}$ (17.7 %).

- (a) is wrong because it understates the gas side by half; students pick it
  when they confuse "the gas side is where the heat comes from" with "the gas
  side is a small resistance."
- (c) is wrong and reveals the most common misconception in the module: with a
  0.9 mm copper wall the metal is nearly transparent thermally. It only becomes
  a major resistance in a low-conductivity liner (N2: 28 % in Inconel) or with a
  coke deposit.
- (d) is wrong; the coolant side is roughly 18 %, and if it were 60 % the design
  would be badly under-cooled.

**Q2 (8 pts).** $h_c \propto A_{ch}^{-0.9}$ and $\Delta p \propto
A_{ch}^{-2.4}$ (Eq. 3.13). Halving the area:

$$h_c \times 2^{0.9} = \mathbf{\times 1.87}, \qquad \Delta p \times 2^{2.4} = \mathbf{\times 5.28}$$

Accept ×1.9 and ×5.3. The point being tested is the exponent mismatch — you buy
87 % more heat transfer for 5.3× the pressure drop — which is why channels are
tapered and narrowed only at the throat.

**Q3 (12 pts).**

$$R_{tot} = \frac{1}{1.8\times10^{4}} + \frac{0.0009}{320} + \frac{1}{8.0\times10^{4}}
= 5.5556\times10^{-5} + 2.8125\times10^{-6} + 1.2500\times10^{-5} = 7.0868\times10^{-5}$$
$$q'' = \frac{3560 - 400}{7.0868\times10^{-5}} = \mathbf{4.459\times10^{7}\ W/m^2 = 44.6\ MW/m^2}$$
$$T_{wc} = 400 + \frac{4.459\times10^{7}}{8.0\times10^{4}} = 400 + 557.4 = \mathbf{957.4\ K}$$

**No.** 957 K is **367 K above** the 590 K coking limit. The design is not
marginal; it is a different design. (For completeness: $T_{wg} = 1083$ K,
$\Delta T_w = 125$ K.)

Marking: 6 pts for $q''$, 4 for $T_{wc}$, 2 for the correct verdict *with the
margin quantified*. A bare "no" without the number scores 1 of the 2.

**Q4 (8 pts). Answer: (c) it minimises the jacket pressure drop.**

Routing hydrogen through the entire nozzle **maximises** the jacket pressure
drop — it is the longest possible path. The RL10 accepts that cost because
(a), (b) and (d) are all true and all point the same way: the turbine needs
enthalpy, the nozzle is where the wetted area is, and the jacket *is* the power
cycle, so pickup is the objective function. This is the one design in the course
where you deliberately route coolant the expensive way.

**Q5 (12 pts).**

$$m = \sqrt{\frac{2 \times 6.0\times10^{4}}{320 \times 1.4\times10^{-3}}} = \sqrt{\frac{1.20\times10^{5}}{0.448}} = \mathbf{517.6\ m^{-1}}$$
$$m h_{ch} = 517.6 \times 0.005 = 2.588, \qquad
\eta_f = \frac{\tanh 2.588}{2.588} = \frac{0.98878}{2.588} = \mathbf{0.3821}$$
$$\Phi = \frac{2.0 + 2(0.3821)(5.0)}{3.4} = \frac{5.821}{3.4} = \mathbf{1.712}$$
$$h_{c,\mathrm{eff}} = 1.712 \times 6.0\times10^{4} = \mathbf{1.027\times10^{5}\ W/(m^2K)}$$

Marking: 3 pts each for $m$, $\eta_f$, $\Phi$, $h_{c,\mathrm{eff}}$. The common
error is to use $\Phi = (w + 2h_{ch})/p_{ch} = 3.53$ — omitting $\eta_f$ — which
overstates $h_{c,\mathrm{eff}}$ by a factor of 2.1 and would produce a wall
temperature prediction hundreds of kelvin optimistic. That specific error loses
6 of the 12.

**Q6 (8 pts).** **Heat flux.** The main combustion chamber throat sees of order
160 MW/m²; the nozzle at high area ratio sees two orders of magnitude less
(Bartz: $q'' \propto (A_t/A)^{0.9}$). Only the throat requires the flat, thin,
high-conductivity hot wall and the solid conducting lands that milling a copper
liner provides; the nozzle needs cheap, light, compliant surface area, and 1,080
thin brazed tubes are the best way to buy it.

Also acceptable for full marks: the tube's curved hot wall puts its minimum
coolant-side area at the crown where the gas-side flux is highest, which is
survivable at nozzle fluxes and fatal at throat fluxes.

**Q7 (12 pts).**

$$\Delta T_b = \frac{22\times10^{6}}{45 \times 2280} = \frac{22\times10^{6}}{102{,}600} = \mathbf{214.4\ K}$$
$$T_{b,exit} = 305 + 214.4 = \mathbf{519.4\ K}$$

**Marginal, and effectively unacceptable.** The bulk exit temperature is 71 K
below the 590 K coking threshold — but the threshold applies to the
**coolant-side wall**, which in any real channel runs several hundred kelvin
above the bulk (WE1: bulk 400 K, wall 961 K). A bulk of 519 K at the exit
guarantees a wall far above 590 K over the last part of the circuit.

*What to change*, in order of preference:

1. **Reverse the routing.** If this is a parallel-flow circuit, make it
   counter-flow so the hottest coolant is at the low-flux end.
2. **Reduce $Q$ with film cooling** — the barrel is the largest single
   contributor and the easiest to film-cool.
3. **Raise the coolant flow** if mixture ratio allows (it usually does not), or
   split the circuit so only part of the length is in series.
4. **Lower the inlet temperature** — worth only 5 K here, and not usually
   available.

Marking: 5 pts for $\Delta T_b$, 3 for the exit temperature, 4 for the verdict
*and* a change. An answer that says "acceptable, 519 < 590" scores at most 8 —
it has confused the bulk limit with the wall limit, which is the single most
consequential confusion in this module.

**Q8 (8 pts).** **Supercritical heat-transfer deterioration near the
pseudo-critical temperature.** Methane at jacket pressure has
$T_{pc} \approx 225$–235 K; where the bulk crosses it, the near-wall density
gradient suppresses turbulent transport and $h_c$ falls below the
Dittus–Boelter prediction, by up to a factor of two at high flux and modest mass
flux. The band is narrow because $T_{pc}$ is crossed over a narrow bulk
temperature range, and it **moves with power level** because the bulk
temperature profile along the channel shifts when the heat load and the flow
both change — which is precisely the reported symptom, and is what rules out a
geometric defect (which would stay put).

*Confirming change:* **raise the jacket pressure.** $T_{pc}$ rises with
pressure, so the anomalous band should move to a different axial station in a
predictable direction. Equally acceptable: raise the coolant mass flux at fixed
power, which should suppress the deterioration entirely by pushing the channel
back into the forced-convection-dominated regime. Either answer demonstrates
that the student is testing the *mechanism*, not just the symptom.

**Q9 (12 pts).** 40 kN, N₂O₄/MMH, 15 bar, pressure-fed apogee engine, 3,000 s
total burn, no reuse.

**Chosen architecture: an ablative chamber with a radiatively cooled nozzle
extension**, plus fuel-film cooling from the injector. This is the Apollo SPS
architecture and it is the right one for exactly the same reasons.

*Rejected 1 — regenerative cooling.* At $p_c = 15$ bar the flux is low
($h_g \propto p_c^{0.8}$: about 1/6 of a 100-bar engine's), so the *thermal*
case is easy. It is rejected on two quantitative grounds. First, jacket
$\Delta p$: a pressure-fed system's tank pressure must exceed
$p_c + \Delta p_{inj} + \Delta p_j$, and even a modest 8 bar jacket drop on a
15 bar chamber raises tank pressure by more than 50 %, which drives tank wall
thickness and pressurant mass directly — the mass penalty lands on the *tanks*,
not the engine. Second, MMH is a poor coolant with low $c_p$ and low $k$ and it
decomposes thermally; the Viking programme's answer to cooling a hypergolic
engine was to carry a *separate water tank*, which tells you how bad the fuel is
at the job.

*Rejected 2 — fully radiative (film-cooled, no ablative).* This is the R-4D
architecture and it works at 490 N. At 40 kN the throat diameter is roughly 80×
larger in area, and while $h_g$ falls only as $D_t^{-0.2}$, the *total* heat
load scales with area. More decisively, the equilibrium wall temperature from
Eq. 3.19 at this chamber pressure would exceed the coated-niobium limit at the
throat, and a fully radiative 40 kN chamber would need refractory metal over a
large area — expensive, heavy, and with a coating whose life over 3,000 s is not
demonstrated. Radiative is retained for the *extension*, where the flux has
fallen by two orders of magnitude, which is where it belongs.

*Why ablative wins:* 3,000 s at, say, 0.05 mm/s throat recession with FS 1.4 and
3 mm residual is $1.4\times0.05\times3000 + 3 = 213$ mm — thick, but this is a
low-flux chamber and the real rate would be lower; a real SPS-class liner is
tens of millimetres. There is no reuse requirement, so a finite-life liner costs
nothing. There is no pump, no jacket, no $\Delta p$ to feed, and — the decisive
point for an apogee engine — **no cooling-related failure mode that can be
triggered by a restart after a long cold coast.** The SPS performed every lunar
orbit insertion and trans-Earth injection without a failure, on this
architecture, for exactly this reason.

Marking: 4 pts for a defensible choice with the duty cycle cited, 4 pts for each
rejection *with a number attached*. A rejection with no quantitative grounds
scores 1 of 4.

**Q10 (12 pts).**

*The connection.* Film cooling and $c^*$ efficiency are the same phenomenon seen
from two directions. The film is fuel injected along the wall at a local mixture
ratio far below the core value. It does not mix with the core, it burns
incompletely or not at all, and it leaves the nozzle as unreacted or
partially-reacted fuel-rich gas at low temperature. $c^*$ is
$p_c A_t/\dot m$ — a measure of how much of the propellant's chemical energy
actually appeared as chamber stagnation enthalpy — so propellant that is
deliberately kept out of the combustion appears directly as a $c^*$ deficit.

A modern engine achieves ~97 % because its remaining losses are mixing and
vaporisation inefficiency in the core. The V-2's ~94 % is that same core loss
*plus* a wall layer that never burned properly. Roughly 3 points of $c^*$
efficiency is the film's signature, and it is consistent with a film fraction of
a few percent of total flow burning at very poor efficiency.

*The $I_{sp}$ cost.* At $MR = 1.6$ the fuel is $1/(1+1.6) = 38.46\,\%$ of total
flow, so 10 % of the fuel is

$$x_{fc} = \frac{0.10}{1+1.6} = \mathbf{3.85\ \%\ of\ total\ flow}$$

By Eq. 3.17 with $I_{sp,film}/I_{sp,core} = 0.7$:

$$\frac{\Delta I_{sp}}{I_{sp}} = 0.0385 \times (1 - 0.7) = \mathbf{1.15\ \%}$$

On a ~200 s engine that is about **2.3 s**.

*What the strongest answers add:* the 1.15 % from Eq. 3.17 and the ~3 % $c^*$
deficit are **not additive** — they are two partly-overlapping accountings of
the same lost energy, and quoting 4 % would be double-counting. Eq. 3.17's
$I_{sp,film}/I_{sp,core} = 0.7$ is already an assertion about how badly the film
burns. Full marks require the correct $x_{fc}$ (the $MR$ conversion is the trap;
students who answer 10 % score at most 6), the penalty, and an honest statement
about which losses are the same loss.

---

## K3. Trade-study reference solution (T1)

**900 kN LOX/methane, 180 bar, 30 flights between overhauls, 160 s per flight,
throat diameter ~240 mm. In-house L-PBF (400 mm build volume), CNC, brazing
vendor. No electroforming, no DED. $T_{wc} < 900$ K, $\Delta p_j < 55$ bar,
120 demonstrated LCF cycles.**

### Recommendation: **(B) — L-PBF GRCop-42 liner in two axial segments with an L-PBF Inconel 718 closeout, plus a 2 % injector-face fuel film.**

### Quantitative justification

**1. The wall temperature constraint eliminates Inconel outright.**

At 180 bar, scale the RE-500 throat flux by $(180/100)^{0.8} = 1.55$ and adjust
for the smaller throat ($D_t = 240$ mm vs 197 mm gives $h_g \times
(197/240)^{0.2} = 0.96$): $q'' \approx 45.1 \times 1.55 \times 0.96 \approx
67$ MW/m² before film cooling, perhaps 50 MW/m² with a 2 % film.

Through the wall (Eq. 3.5), at $q'' = 50$ MW/m²:

| liner | $k_w$ | $t_w$ | $\Delta T_w$ |
|---|---|---|---|
| GRCop-42 | 310 | 0.9 mm | **145 K** |
| Inconel 718 | 25 | 0.45 mm | **900 K** |

Option (C)'s 0.45 mm Inconel wall carries a 900 K gradient. Even if the
coolant-side face sat at 400 K, the gas-side face would be at 1300 K, above the
useful strength of Inconel 718 and far outside any LCF life that reaches 120
cycles. **(C) is eliminated on Eq. 3.5 alone**, and no amount of film cooling
recovers it — you would need to remove two-thirds of the heat flux, which no
film delivers at the throat (WE3, Step 4).

*What to measure:* a heat-flux-matched subscale hot fire with throat wall
thermocouples, or a calorimeter chamber, to confirm the 67 MW/m² estimate to
±25 %. Bartz is not good enough to bet a programme on.

**2. Channel geometry and $\Delta p$ favour a printed copper liner over a tube
wall.**

Throat circumference $= \pi \times 0.240 = 754$ mm. Option (D)'s 220 tubes gives
a 3.43 mm pitch — feasible. But a tube wall has no designed lands: the
inter-tube braze fillet conducts poorly, so $\Phi \approx 1.1$–1.3 against a
milled or printed channel's 1.7–1.9. To reach the same $h_{c,\mathrm{eff}}$ the
tube wall must run roughly 50 % higher coolant velocity, and $\Delta p \propto
V^{1.8}$ means **2.2× the pressure drop**. Against a 55 bar budget on a 180 bar
engine that is very likely disqualifying.

Worse, (D)'s stainless tubes have $k \approx 15$ W/(m·K) — *worse than Inconel*.
At 0.4 mm wall and 50 MW/m² that is a 1330 K gradient. **(D) is eliminated on
the same grounds as (C)**, and the tube-wall architecture only ever worked at
high flux because the RL10 and F-1 ran at 33 and 70 bar respectively, not 180.

*What to measure:* cold-flow a tube-wall coupon assembly and a printed-channel
coupon at matched Reynolds number and compare $\Delta p$ and the inferred
$\Phi$ from a heated test.

**3. The manufacturing base decides between (A) and (B).**

Both (A) and (B) are GRCop-42 channel walls and both are thermally sound. The
difference is process:

- **(A)** requires milling ~200 channels into a 240 mm-throat contoured liner
  and furnace-brazing an Inconel jacket over every land. The company has CNC and
  a braze vendor, so it is feasible — but the braze joint is the failure mode
  (§7.2), it must be 100 % NDE'd over the full land length, and it is
  vendor-dependent, which is schedule risk on a programme where "development
  schedule matters more" than recurring cost.
- **(B)** puts the liner and the closeout inside the company. The 400 mm build
  volume forces two axial segments and one circumferential weld — a real
  constraint, but a girth weld in a low-stress region away from the throat is a
  well-understood joint, far better understood than 200 brazed lands.

**(B) wins on schedule and on process control.** It also unlocks the geometry
freedom of §3.12.5: tapered channel area schedules, bifurcating channels at the
throat to keep land width sane at the smallest circumference, and integral
manifolds — all of which help the 55 bar $\Delta p$ budget directly.

**4. The film budget.** 2 % of total flow. At $MR = 3.4$ the fuel is 22.7 % of
flow, so 2 % of total is 8.8 % of the fuel. By Eq. 3.17 at
$I_{sp,film}/I_{sp,core} = 0.75$, the penalty is $0.02 \times 0.25 = 0.5\,\%$ —
roughly 1.7 s on a ~340 s engine. That is a cheap insurance premium against a
throat that Bartz has under-predicted, and it also protects the liner's LCF life
by reducing $\Delta T_w$.

### The strongest argument against (B), and its mitigation

**The circumferential weld in a GRCop-42 liner.** Weld metal in a
dispersion-strengthened Cu–Cr–Nb alloy does not retain the Cr₂Nb precipitate
structure that gives GRCop its creep and LCF advantage over plain copper — the
precipitates coarsen or dissolve in the fusion zone and the heat-affected zone,
so the weld is a local soft spot with unknown and probably poor cycle life. On a
liner that must demonstrate 120 cycles, an uncharacterised joint is exactly the
wrong thing to have.

*Mitigation, in order:*

1. **Put the weld where it does not matter.** Locate the joint in the barrel or
   the divergent section, at least two chamber diameters from the throat, where
   $q''$ is a third of the peak and $\Delta T_w$ is correspondingly small. This
   is a design choice available at no cost and it removes most of the risk.
2. **Characterise it properly.** Build a coupon-level LCF programme on welded
   GRCop-42 at the relevant $\Delta T_w$ and cycle count, with a demonstrated
   factor of 4. This is 6–9 months and must start before the liner design is
   frozen.
3. **Consider a mechanical joint instead.** A bolted or brazed flange in the
   jacket with a continuous liner is not possible across a build volume limit,
   but a friction-stir or electron-beam weld with a controlled HAZ is
   demonstrably better than fusion welding for this alloy family.
4. **Have (A) as the fallback.** If the weld cannot be qualified, the milled
   liner with a brazed jacket is thermally identical and the programme loses
   schedule, not architecture. Keep the milling fixture design alive as a
   parallel path until the weld coupon data are in.

### Rubric

**A strong answer must contain:**

- A **numerical throat heat flux estimate** scaled from a stated baseline with
  the $p_c^{0.8}$ and $D_t^{-0.2}$ exponents shown, with an honest error band
  on Bartz.
- **Eq. 3.5 applied to at least two candidate liner materials**, producing
  $\Delta T_w$ values that eliminate the low-conductivity options
  quantitatively. Eliminating Inconel or stainless by assertion is not enough.
- A **channel-count feasibility check** against the 754 mm throat circumference,
  showing awareness that pitch, not thermal performance, may be the binding
  constraint at a small throat.
- A **$\Delta p$ argument** referencing the 55 bar budget, ideally with the
  $\Phi$ difference between tube-wall and channel-wall constructions.
- An explicit statement of **what would be measured or tested** to confirm each
  argument, naming the test (calorimeter chamber, cold flow, LCF coupon), not
  just "we would test it."
- A named **strongest counter-argument with a mitigation plan** that includes a
  fallback architecture.

**Loses marks for:**

- Choosing (C) or (D) without computing $\Delta T_w$. Both are defensible-looking
  and both fail by an order of magnitude; the point of the question is that the
  arithmetic, not intuition, eliminates them.
- Treating the build-volume limit as a showstopper for (B) without considering
  weld placement. Constraints are to be designed around.
- Ignoring the "schedule matters more than recurring cost" instruction and
  choosing (A) purely on unit cost. The trade statement said which axis
  dominates; answers that optimise the wrong axis lose 25 % regardless of the
  quality of the analysis.
- Quoting a film-cooling budget without converting it to an $I_{sp}$ number.
  Film is a real cost and must be priced.
- Asserting that GRCop-42 is "better than NARloy-Z" without saying in what —
  the answer is LCF life and blanching resistance, not conductivity, which is
  slightly worse.

**Full credit** does not require choosing (B). A well-argued (A) with the same
quantitative work, choosing process maturity over schedule and explicitly
accepting the braze NDE burden, is equally defensible and should score the same.
The marks are for the argument, not the conclusion. (C) and (D) cannot score
full credit because they violate a hard constraint that the provided data are
sufficient to detect.

---

## K4. Common wrong answers and what they reveal

**"Improving the coolant reduces the heat flux."** The most common error in the
module, and it reveals that the student is thinking of $q''$ as a fixed quantity
to be disposed of rather than as the *output* of a resistance network with a
fixed driving potential. The correction is to write Eq. 3.4 and observe that
$h_{c,\mathrm{eff}}$ appears only in the denominator. Students who make this
error also tend to size coolant pumps too small, because they expect the heat
load to fall when they improve the channel.

**Confusing the coolant bulk temperature limit with the coolant-side wall
temperature limit** (Q7). This is the most *consequential* error, because it
produces designs that look fine on paper. The coking threshold is a **wall**
temperature; the wall runs several hundred kelvin above the bulk in any real
channel (WE1: bulk 400 K, wall 961 K). A student who checks only the bulk will
sign off a chamber that cokes shut. Whenever a coking check appears, the
question is "what is $T_{wc}$", never "what is $T_b$".

**Omitting the fin efficiency from the area enhancement** (Q5). Writing
$\Phi = (w + 2h_{ch})/p_{ch}$ instead of $(w + 2\eta_f h_{ch})/p_{ch}$
overstates $h_{c,\mathrm{eff}}$ by a factor of two and produces wall temperature
predictions hundreds of kelvin optimistic. It reveals that the student has
treated the land as a perfectly conducting extension of the wall rather than as
a fin with a temperature gradient along it. The diagnostic question is: what is
the temperature at the tip of the land? If it is not close to the coolant bulk,
$\eta_f$ is not 1.

**Believing that taller channels are strictly better** (C3, N3). The intuition
is that more wetted area is more cooling. The arithmetic says otherwise: past
$mh_{ch} \approx 2.5$ the added land length is thermally dead. This error is
usually accompanied by not checking the velocity — a taller channel at fixed
flow is a slower channel, and $h_c \propto V^{0.8}$.

**Sizing an ablative from total burn time without asking about the duty cycle**
(N7). A 58 % thickness error in the worked case. It reveals a mental model where
ablation is a simple integral of time, rather than a char-front process whose
rate depends on whether the char survives between firings. The LMDE's forbidden
throttle band is the historical evidence that duty cycle matters.

**Solving the radiative equilibrium without iterating** (N8). Writing
$\varepsilon\sigma T_w^4 = h_g T_{aw}$ instead of $h_g(T_{aw} - T_w)$ gives
1636 K instead of 1445 K, and turns a design with 155 K of margin against the
niobium coating limit into one with none. It reveals a student who did not
notice that the wall temperature appears on both sides of the balance.

**Assuming heat flux scaling implies wall temperature scaling** (R2). "Chamber
pressure up 40 %, so heat flux up 30 %, so the wall runs 30 % hotter." It does
not, because the coolant flow also rose with $p_c$, so $h_c$ rose by the same
$p_c^{0.8}$ factor and $T_{wc} - T_b$ is nearly invariant. The student who makes
this error will over-design the cooling and under-design the turbopump — which
is the wrong way round, because the pump is where the uprate actually hurts.

**Quoting a film-cooling flow from Eq. 3.15 without the entrainment allowance**
(N6, WE3). The bare energy balance is a lower bound: it assumes the film stays
attached, spreads uniformly, and loses nothing to the core. In a real chamber
the high-velocity core strips 30–60 % of the film. A design sized on the bare
number will run short of film exactly where it is needed. The tell is a student
who reports a single film flow with three significant figures and no band.

**Adding the $c^*$ efficiency loss and the Eq. 3.17 $I_{sp}$ penalty together**
(Q10). They overlap: Eq. 3.17's $I_{sp,film}/I_{sp,core}$ ratio is *already* an
assertion about how badly the film burns, which is the same energy the $c^*$
deficit measures. Double-counting produces a penalty roughly twice the truth.
The general lesson is that $c^*$ efficiency and $I_{sp}$ efficiency are not
independent accounts.

**Treating Bartz as a prediction rather than an estimate.** Students quote
45.1 MW/m² to four significant figures and then design a wall to a 20 K
temperature margin. Bartz is ±20–30 % at the throat and worse in the barrel. The
correct posture is to carry the band explicitly, design to the pessimistic end,
and plan a calorimeter test. Any answer in this module that reports a wall
temperature without an error band has missed the point of §5's standing caveat.

**Claiming an engine cooling architecture that the course reference does not
document.** Aestus, Kestrel, Merlin 1A, the RD-170's liner alloy, and the J-2S's
nozzle cooling all have widely-repeated answers in the secondary literature and
none of them are in the verified reference. The professional habit is to say
"not reliably published" and move on. A student who writes "Aestus was ablative"
because they read it somewhere has learned the wrong lesson from the whole
course, which is that a number without a provenance is not data.
