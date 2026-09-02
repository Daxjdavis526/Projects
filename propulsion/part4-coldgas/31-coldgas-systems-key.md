# Module 31 — Real Cold-Gas Systems — Answer key
Part IV · Key for `31-coldgas-systems.md`

$g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K), $R_{N_2} = 296.80$ J/(kg·K).
Every numerical answer is reproduced by `tools/examples/31.py` against
`tools/rocket.py`.

---

## K1. Problem solutions

### Conceptual

**C1 — HHMU oxygen vs MMU nitrogen.**

*HHMU (1965), gaseous oxygen.* The dominating constraint was **commonality with
what the spacecraft already carried**. Gemini already had high-pressure GOX
bottles, fill hardware, and a crew trained to handle them; the HHMU was a
hand-held accessory on a programme with no mass or volume margin for a
dedicated propellant system, and a small leak of oxygen into a
partial-pressure-oxygen cabin was survivable rather than catastrophic. Oxygen
is a *poor* propellant on its merits ($M = 32$, so $I_{sp}$ between nitrogen
and argon) and an actively hazardous one to store at 234 bar, but the
integration argument beat the propulsion argument. [H]

*MMU (1984), gaseous nitrogen.* The dominating constraint was **hazard to the
crew and the Orbiter**. The MMU operated within metres of a suited crewmember
and of a crewed vehicle, and had to be brought back into the payload bay.
Nitrogen is inert: it creates no toxic-exposure case, no oxidiser-enrichment
case near a pure-oxygen suit loop, no plume-chemistry case on Orbiter
radiators and windows.

*Why they point at different gases.* The HHMU's constraint was **what was
already on board**; the MMU's was **what is safe next to people and next to an
oxygen-rich suit**. Oxygen satisfies the first and fails the second — the very
property that made GOX acceptable on Gemini (it is what you breathe) makes it
unacceptable as a large stored inventory beside a pressurised suit and an
Orbiter. Nitrogen satisfies the second and, by 1984, also the first, because
the Shuttle carried GN₂ servicing.

**C2 — Helium rebuttal.**

*Two sentences.* Specific impulse is the wrong figure of merit for a
volume-limited spacecraft; the right one is impulse density $\rho I_{sp} g_0$,
and helium is the worst propellant in the entire table on that metric.
Furthermore the comparison ignores the tank: helium must be stored at ~241 bar
in a COPV that will weigh more than the propellant and that drags a
pressure-vessel qualification programme behind it.

*Quantitative.* From §3.2: helium at 0.04 g/cm³ and 178.1 s gives
$0.04\times10^3 \times 178.1 \times 9.80665 = 6.99\times10^4$ N·s/m³ =
**0.070 N·s/cm³**. R-236fa at 1.36 g/cm³ and 43.2 s gives **0.576 N·s/cm³** —
**8.2× more impulse per unit propellant volume** despite one quarter of the
specific impulse. Nitrogen at 241 bar gives 0.211, still 3× helium.

Credit is lost for arguing only "helium leaks" — true and secondary. The
governing argument is Eq. 3.4.

**C3 — Same safety objective, opposite feed architectures.**

The objective is identical (*the crewmember must get home*); the **mission
profile** is not, and the feed architecture follows the profile.

*MMU:* a working tool used for hours, tens of metres from the Orbiter, doing
satellite retrieval. A failure mid-task strands a crewmember at range. The
safety response is **redundancy**: two fully independent regulated legs, either
one flyable alone, so that no single failure between tank and nozzle is
mission-ending. Regulation is affordable because the unit is 148 kg and has the
mass budget for two regulators.

*SAFER:* a contingency device, dormant for months, used once, at short range.
Its dominant failure mode is not "a component fails during use" but "a
component has silently degraded during dormancy." The safety response is
**fewer parts**: no regulator to take a set, no crossfeed to leak, one tank and
one valve. Redundancy would add exactly the kind of quiescent hardware that the
dormancy failure mode attacks.

**The general rule:** redundancy protects against random in-use failure;
simplicity protects against latent dormant failure. Which one you buy depends
on which failure the mission profile exposes you to. [J]

**C4 — The 40–110 s band.**

110 s is unreachable by any *unheated* gas a small spacecraft would fly.
Nitrogen's ideal ceiling at $T_0 = 300$ K is 76.8 s and butane's is 69.2 s;
only hydrogen (285.6 s) and helium (178.1 s) exceed 110 s, and no CubeSat flies
241-bar hydrogen or accepts helium's impulse density. The band therefore
silently merges **cold gas** and **warm gas (resistojet)**: to reach the top of
it the propellant must be heated, because $I_{sp}\propto\sqrt{T_0}$ is the only
lever available once the propellant is fixed. CHIPS is the proof — 82 s from a
refrigerant whose cold ideal is 43.2 s, at the cost of tens of watts.

**C5 — Cold gas on launch vehicles.**

Cold gas is rare because at launcher scale the required impulse is large enough
that the ~70 s $I_{sp}$ penalty, plus the mass of the high-pressure tankage
that a stored gas demands, exceeds the mass of a ~230 s hydrazine system with
its tanks, catalyst beds and thermal control. Impulse-to-mass is the losing
metric and it loses by a factor of roughly three.

What is different about the Falcon 9 booster return: the *propulsive* task is
small (a flip and a coast, tens of seconds of firing, not tens of minutes)
while the *operational* requirements are severe — the system must work in
vacuum and in dense atmosphere, must be ready instantly with no ullage
settling, no preheat and no ignition, must restart an effectively unbounded
number of times through a multi-minute coast and a limit cycle, and must leave
nothing behind that complicates recovery, inspection and reflight by people. On
a stage where the propellant is not being carried to orbit, buying all of that
with specific impulse is a good trade.

**C6 — The reviewer's claim.**

Both halves are wrong. **Hubble has no thrusters at all** — attitude control is
reaction wheels and magnetic torquers, a deliberate contamination decision
because the optics could not tolerate plume deposition and the mission had no
Δv requirement wheels could not meet. **Centaur's settling and attitude
thrusters are hydrogen peroxide monopropellant on early vehicles and hydrazine
on later ones**; gaseous hydrogen and helium appear only for tank
pressurisation and, on some variants, vented-GH₂ settling thrust, which is a
vent rather than a propulsion subsystem. Since neither vehicle uses cold gas,
the conclusion has no support — and the real evidence points the other way:
cold gas *does not* scale, which is exactly why large vehicles use
monopropellants.

**C7 — Steady 90 %, pulsed 50 %.**

*Steady-flow losses (three):*
1. **Throat boundary layer.** At cold-gas Reynolds numbers the displacement
   thickness is a significant fraction of a small throat, reducing the
   effective throat area and the momentum flux.
2. **Heat transfer during expansion.** The gas cools rapidly below wall
   temperature in the divergent section; heat flows in from the wall, but the
   process is irreversible and the entropy generated is unavailable work.
3. **Non-equilibrium (frozen) expansion.** A polyatomic propellant cannot relax
   its vibrational modes in the ~microsecond residence time of a small nozzle,
   so part of the internal energy never converts to directed kinetic energy.
   This is worst for the refrigerants and butane, best for the monatomics.

*Additional pulsed losses (two):*
4. **Dead-volume charge and discharge.** Every opening must fill the volume
   between valve seat and throat before the nozzle chokes; that mass leaves at
   low velocity. Every closing leaves that volume full, and it bleeds out at
   falling, eventually unchoked, pressure. If the dead-volume mass is
   comparable to the mass flowed during the commanded pulse, half the
   propellant produces a fraction of its potential impulse.
5. **Transient (unchoked) flow fractions.** During $t_{rise}$ and $t_{fall}$ the
   nozzle is not choked and the expansion is not the design expansion, so that
   propellant is expelled at well below the steady exhaust velocity.

SAFER's ratio of 0.52 is the combined effect at a millisecond duty cycle.

**C8 — Why MarCO's ACS thrusters are canted.**

1. **Torque authority without a moment arm problem.** A canted thruster
   produces a torque about the vehicle axes with a usable moment arm from a
   module that must fit inside a 6U envelope, where a body-normal nozzle on a
   small face would have almost no arm. Canting also lets four thrusters
   synthesise torques about all three axes, which four body-normal nozzles on
   one face cannot.
2. **Plume management.** A canted nozzle directs the plume away from
   deployables — MarCO carried a deployable reflectarray and solar arrays —
   reducing impingement torque (which corrupts the very control the thruster is
   trying to exert) and reducing condensable deposition on the array and the
   antenna.

Also acceptable: canting couples ACS firings less strongly into the translation
axis, so attitude control does not corrupt a TCM in progress.

### Calculation

**N1.** GN₂, $V = 2.0$ L $= 2.0\times10^{-3}$ m³, $p_i = 250$ bar,
$T = 293$ K, $p_f = 4$ bar.

(a) $m_i = \dfrac{p_i V}{RT} = \dfrac{250\times10^5 \times 2.0\times10^{-3}}
{296.80 \times 293} = \dfrac{5.0\times10^4}{86{,}963} = \mathbf{0.575\ kg}$

(b) Isothermal: $\eta_u = 1 - p_f/p_i = 1 - 4/250 = \mathbf{0.984}$

(c) $m_u = 0.575 \times 0.984 = \mathbf{0.566\ kg}$

(d) $I_t = I_{sp} g_0 m_u = 70 \times 9.80665 \times 0.5658 = \mathbf{388\ N\,s}$

(e) Adiabatic: $\eta_u = 1 - (p_f/p_i)^{1/\gamma} = 1 - (0.016)^{1/1.4}
= 1 - 0.0521 = \mathbf{0.948}$, giving $I_t = \mathbf{374\ N\,s}$.

*Which bounds reality.* Both are bounds. A real discharge over minutes-to-hours
is nearly isothermal, because the tank wall and the spacecraft supply heat far
faster than the gas is removed; a rapid discharge over seconds approaches
adiabatic and the gas cools, which is why the adiabatic case leaves more mass
behind. **Real systems sit close to the isothermal bound**, but the adiabatic
value is the one to quote for a single fast burn, and the 3.7 % spread between
them is small compared with the uncertainty in realized $I_{sp}$.

**N2.** $V = I_t/(\rho I_{sp} g_0)$, using the §3.2 impulse-density column.

| propellant | $\rho I_{sp} g_0$ (N·s/cm³) | $V$ for 500 N·s |
|---|---|---|
| GN₂ @ 241 bar | 0.211 | **2,370 cm³** |
| n-butane | 0.387 | **1,292 cm³** |
| R-236fa | 0.576 | **868 cm³** |

Tank mass for the GN₂ case, Eq. 5.1 with $pV/W = 8{,}000$ m:
$pV = 241\times10^5 \times 2.370\times10^{-3} = 5.71\times10^4$ J,
$m_{tank} = 5.71\times10^4/(8{,}000 \times 9.80665) = \mathbf{0.728\ kg}$,
against a propellant mass of $2{,}370 \times 0.28 = \mathbf{0.664\ kg}$.

**The tank outweighs the propellant.** That single line is the answer to
"why not just use nitrogen," and note that $pV/W = 8{,}000$ m is *optimistic*
at this size — at a realistic 5,000 m the tank is 1.16 kg, 1.75× the
propellant.

**N3.** $m_0 = 4.000$ kg, $m_p = 0.080$ kg, $I_{sp} = 65$ s,
$c = 637.43$ m/s.

Exact: $\Delta v = 637.43 \ln(4.000/3.920) = 637.43 \times 0.0202027
= \mathbf{12.88\ m/s}$

Linearised (Eq. 3.2): $\Delta v \approx I_{sp}g_0 m_p/m_0 = 637.43 \times
0.080/4.000 = \mathbf{12.75\ m/s}$

Error: $\mathbf{-1.0\ \%}$ (the linearisation under-predicts). At
$m_p/m_0 = 0.02$ this is expected; compare Worked Example 3, where
$m_p/m_0 = 0.14$ gave $-7.3$ %.

**N4.** $m_0 = 140$ kg, $m_p = 1.4$ kg, $\Delta v = 3.05$ m/s.

$$I_{sp} = \frac{3.05}{9.80665 \times \ln(140/138.6)}
= \frac{3.05}{9.80665 \times 0.0100503} = \mathbf{30.9\ s}$$

*Comment.* The implied $I_{sp}$ falls from 39.8 s to 30.9 s — a 22 % change —
for a 22 % change in an assumed reference mass that no source states.
**This does not undermine the SAFER specification; it undermines the practice
of quoting an implied $I_{sp}$ without the reference mass.** Both 31 s and 40 s
are credible pulse-mode values, so the qualitative conclusion (SAFER delivers
roughly half its ideal $I_{sp}$, and it closes) is robust; the specific number
is not. Compare with MMU, where *no* plausible reference mass makes the
specification close — that is a qualitatively different failure.

**N5.** $I_{bit} = F(t_{on} - \tfrac12 t_{rise} + \tfrac12 t_{fall})$,
$F = 0.050$ N, $t_{rise} = 1.2$ ms, $t_{fall} = 0.9$ ms, so the correction is
$-0.15$ ms.

| $t_{on}$ | $I_{bit}$ |
|---|---|
| 100 ms | $0.050 \times 0.09985 = \mathbf{4.99\ mN\,s}$ |
| 10 ms | $0.050 \times 0.00985 = \mathbf{0.493\ mN\,s}$ |
| 2 ms | $0.050 \times 0.00185 = \mathbf{0.0925\ mN\,s}$ |

**Stop trusting it at 2 ms.** There $t_{on}/t_{rise} = 1.7$, so the thruster
spends most of the pulse in the transient and never reaches steady choked flow
at the design plenum pressure. The trapezoidal model assumes it does. At that
duty cycle the impulse bit must be measured on a thrust stand and tabulated
against commanded on-time; the model is a means of interpolating measurements,
not of replacing them. At 10 ms ($t_{on}/t_{rise} = 8.3$) the model is
serviceable but worth checking; at 100 ms it is fine.

**N6.** $F_{net} = m a$ with $a = 0.091$ m/s².

| reference mass | net thrust | per thruster (4 firing) |
|---|---|---|
| 148 kg | 13.5 N | 3.37 N |
| 231 kg | 21.0 N | 5.26 N |
| 340 kg | 30.9 N | 7.73 N |

*Comment.* The per-thruster thrust varies by a factor of 2.3 across the
plausible reference masses — the same factor that makes the Δv ambiguous. **Any
published MMU per-thruster thrust figure is therefore either a primary
measurement or a reconstruction with an unstated reference mass, and you cannot
tell which by looking at it.** The 7.6 N figure that circulates is the 340 kg
reconstruction (§3.4.2), and it is labelled conf C in this course for exactly
this reason. The general lesson: in a specification with one unstated
assumption, *every* derived quantity inherits the ambiguity, so you cannot use
one derived quantity to check another.

**N7.** $I_{sp} \propto \sqrt{T_0}$:

$$I_{sp,hot} = 43.2 \times \sqrt{\frac{1050}{300}} = 43.2 \times 1.8708
= \mathbf{80.8\ s}$$

Against CHIPS' published 82 s: the estimate is 1.4 % low. **One-sentence
account:** the scaling holds because $c^*\propto\sqrt{T_0}$ at fixed $\gamma$
and $M$, and the small residual is because the estimate compares a *heated
ideal* with a *published realized* value — heating raises the Reynolds number
and reduces the relative boundary-layer loss, and it also puts the polyatomic
propellant into a temperature range where vibrational relaxation is faster, so
the hot thruster's efficiency is higher than the cold one's and partly cancels
the ~0.9 discount.

**N8.** $m_0 = 12.0$ kg, $I_t = 755$ N·s, $I_{sp} = 40$ s,
$c = 392.27$ m/s. Available propellant $m_p = 755/392.27 = 1.925$ kg.

*TCM.* $m_f = 12.0/e^{25/392.27} = 12.0/e^{0.063731} = 12.0/1.065806
= 11.259$ kg, so the manoeuvre consumes $12.000 - 11.259 = \mathbf{0.741\ kg}$.

*Attitude control.* Six months $= 182.6$ days at 0.4 N·s/day
$= 73.0$ N·s, consuming $73.0/392.27 = \mathbf{0.186\ kg}$.

*Total consumed:* $0.741 + 0.186 = \mathbf{0.927\ kg}$ against 1.925 kg
available.

**The budget closes with 0.998 kg of margin — 52 % of the load.** Full marks
require the observation that the ACS allocation is under a fifth of the TCM
cost here, but that ratio inverts for a long mission: at three years the ACS
term alone is 438 N·s and the margin is gone. **State the mission duration
whenever you quote a cold-gas margin.**

### Engineering reasoning

**E1 — Audit of "2.2 kg GN₂, 55 kg system, Δv 8 m/s."**

*Run the audit.* Take $I_{sp} = 70$ s (steady-flow GN₂), $c = 686.47$ m/s.

Against the system alone, $m_0 = 55$ kg:
$\Delta v = 686.47 \ln(55.0/52.8) = 686.47 \times 0.040822 = 28.0$ m/s —
3.5× the published figure.

Against a system-plus-suited-crew reference, solve for $m_0$ at 8 m/s:
$k = e^{8/686.47} = 1.011717$, $m_0 = 2.2 \times 1.011717/0.011717 =
\mathbf{190\ kg}$.

*Does it close?* **Yes, and cleanly.** A 55 kg aid plus a ~135 kg suited
crewmember is 190 kg, which is an entirely ordinary reference mass for a
crewed maneuvering aid. The specification is therefore self-consistent under the
natural reading: **Δv is quoted against the aid plus its user.** Contrast MMU
(WE2), where no plausible reference mass works.

*Cross-check the alternative $I_{sp}$.* If the device were pulse-dominated at
SAFER-like 40 s, the required $m_0$ would be 109 kg — too light for aid plus
crew, too heavy for the aid alone. So the specification implicitly assumes
steady-flow performance, which is a claim about the duty cycle.

*What to ask the vendor.* In order:
1. **The reference mass** the 8 m/s is quoted against — the single number that
   makes the specification a specification.
2. **The measured $I_{sp}$ or measured impulse bit**, and the duty cycle it was
   measured at. The steady-flow assumption is doing all the work.
3. **The usable propellant fraction**, i.e. the blowdown cut-off pressure —
   2.2 kg *loaded* is not 2.2 kg *usable*.
4. Whether the Δv is available after the attitude-hold allocation, or before it.

**E2 — Formation-flying pair, 30 m/s over two years, no deposition on the
partner's optics.**

*The constraints, ranked.* (i) No condensable deposition on the partner's
optical payload — this is a *hard* requirement about the other vehicle and is
the discriminator. (ii) Two-year dormancy-and-operation life. (iii) 30 m/s over
two years, which is a *small* budget. (iv) 6U volume.

*Cold-gas refrigerant (R-236fa).* Impulse required for a 12 kg spacecraft at
30 m/s is roughly $I_t \approx m_0 \Delta v = 360$ N·s plus an ACS allocation;
at 40 s that is $m_p = 12(1-e^{-30/392.27}) = 0.88$ kg, and at
1.36 g/cm³ that is **~650 cm³** of propellant before the ACS allocation —
comfortable in 6U. Non-toxic,
non-flammable, low tank pressure, no plume chemistry, no condensables of
concern on a warm surface, microsecond-response impulse bits with no warm-up.
Only real cost: $I_{sp}$, and the budget is small enough not to care.

*Green monopropellant.* Roughly five times the $I_{sp}$, so a fifth of the
propellant mass — irrelevant, because the budget already closes. Against it:
the plume contains condensable decomposition products aimed at a partner's
optics at 1–10 km; a catalyst bed needs preheat power before every pulse,
destroying the fine-granularity response; and the propellant loading is a
schedule and safety burden on a rideshare.

*Electric propulsion.* Best $I_{sp}$ by an order of magnitude, and for a 30 m/s
budget that is again irrelevant. Against it: thrust is µN-class with a
continuous power draw, so manoeuvres take days and the formation-control
authority may be inadequate; and — decisively — an ion or Hall plume sprays
charge-exchange ions and, for iodine, a condensable that plates out on cold
surfaces. Pointing that at a partner's optical payload is the failure mode you
were told to avoid.

**Recommendation: the cold-gas refrigerant system.** [J] The stated constraints
make $I_{sp}$ irrelevant (30 m/s closes easily), make contamination decisive
(cold gas wins outright), and make impulse granularity valuable (cold gas wins
again). The higher-$I_{sp}$ options are solving a problem this mission does not
have and creating one it explicitly does.

*The single test result that would change my mind:* a **measured leak rate over
a representative dormant period** showing that the refrigerant module cannot
hold propellant for two years — the module must survive integration plus
launch delay plus two years of operations, and a leak rate that consumes a
significant fraction of ~700 cm³ of propellant over that span would force a
sealed high-pressure or monopropellant architecture despite the contamination
penalty. (Accept also: a plume-deposition test showing the refrigerant *does*
condense on the partner's cold optics, which would eliminate all chemical
options and force a reaction-wheel-plus-drag-modulation approach.)

**E3 — Data interpretation: the blowdown trace with a leak.**

**(a) What the trace says.** Two mechanisms are superimposed.

1. **Commanded consumption** — the two abrupt steps on days 6 and 15, each
   ~21.5 bar, which coincide with commanded burns. This is the system working.
2. **An uncommanded continuous loss** — the straight-line droop in *all three*
   segments where no firings were commanded, at 0.340, 0.350 and 0.353 bar/day
   (days 0–5, 6–14, 15–30 respectively). **A healthy blowdown system's
   pressure is flat between firings.** It is not flat, the droop is present
   from day 0 (before any firing), and the rate is essentially constant at
   ~0.35 bar/day across a pressure range from 200 bar down to 147 bar. This is
   a leak.

Note the diagnostic detail: **the droop rate does not scale with tank
pressure** (a factor of 1.36 in pressure produces a 4 % change in droop rate,
within the read precision). That is characteristic of a leak through a
**choked** path — the leak orifice is sonic, so mass flow scales with upstream
pressure, but the *fractional* rate of pressure fall is what a choked leak
holds roughly constant only over modest pressure ranges. Award full credit for
either reading; what matters is recognising a constant-slope droop independent
of duty cycle.

**(b) Leak rate.** Take the mean droop $dp/dt = 0.35$ bar/day.

$$\frac{dp}{dt} = \frac{0.35\times10^{5}\ \mathrm{Pa}}{86{,}400\ \mathrm{s}}
= 0.4051\ \mathrm{Pa/s}$$

From $m = pV/(RT)$ at constant $V$ and $T$:

$$\dot m_L = \frac{V}{RT}\frac{dp}{dt}
= \frac{1.20\times10^{-3}}{296.80 \times 293} \times 0.4051
= \frac{1.20\times10^{-3}}{86{,}962} \times 0.4051
= \mathbf{5.59\times10^{-9}\ kg/s}$$

$= 4.83\times10^{-4}$ kg/day $= 0.483$ g/day.

In standard volumetric units, with $\rho_{std} = p_{std}/(R T_{std}) =
101{,}325/(296.80 \times 273.15) = 1.2498$ kg/m³:

$$\dot V_{std} = \frac{5.59\times10^{-9}}{1.2498} = 4.47\times10^{-9}\ \mathrm{m^3/s}
= 4.47\times10^{-3}\ \mathrm{cm^3/s} = \mathbf{0.268\ scc/min}$$

**(c) Mass consumed by each burn.** Correct each step for the leak by taking
the pressure immediately before and after the step. Burn 1: 198.0 → 176.5 bar,
$\Delta p = 21.5$ bar. Burn 2: 173.7 → 152.0 bar, $\Delta p = 21.7$ bar.

$$\Delta m = \frac{V \Delta p}{RT} = \frac{1.20\times10^{-3} \times 21.5\times10^5}
{86{,}962} = \mathbf{0.0297\ kg} \quad\text{(burn 1)}$$

$$\Delta m = \frac{1.20\times10^{-3} \times 21.7\times10^5}{86{,}962}
= \mathbf{0.0299\ kg} \quad\text{(burn 2)}$$

The two burns are essentially identical, as they should be for two identical
commanded firings — a useful confirmation that the *thrusters* are healthy and
the problem is elsewhere.

**(d) Two-year projection.** Mass remaining at day 30 ($p = 146.7$ bar):

$$m_{30} = \frac{146.7\times10^5 \times 1.20\times10^{-3}}{86{,}962}
= \mathbf{0.202\ kg}$$

Loss over two more years at 0.483 g/day would be $0.483 \times 730.5 =
\mathbf{0.353\ kg}$ — **more than remains in the tank.** So the correct answer
is not a number of grams but a date:

$$t_{empty} = \frac{0.202}{4.83\times10^{-4}} = \mathbf{419\ days}$$

**The leak alone empties the tank about 14 months from now, with no
manoeuvring at all.** Expressed as lost capability, the whole remaining
inventory is worth

$$\Delta v = \frac{I_{sp} g_0 m_{30}}{m_{sc}}
= \frac{70 \times 9.80665 \times 0.202}{8.0} = \mathbf{17.4\ m/s}$$

for an 8 kg spacecraft — i.e. the leak will consume the entire remaining Δv
budget of 17.4 m/s within 14 months. **This is a mission-ending finding, not a
housekeeping one, and the correct response to it is an immediate operational
change** (isolate the manifold between burns if a latching isolation valve
exists; re-plan the mission to spend the propellant on useful manoeuvres before
it leaks away).

**(e) Is it a thermal artefact?** No, and two things in the data rule it out:

1. **Temperature telemetry is flat at 293 ± 0.5 K throughout.** A 0.35 bar/day
   droop at 200 bar corresponds, via $p \propto T$ at constant mass, to
   $\Delta T = T\,\Delta p/p = 293 \times 0.35/200 = 0.51$ K per day, i.e.
   **15 K over the thirty days.** The measured temperature did not move
   0.5 K.
2. **The droop rate is nearly constant in absolute terms (bar/day) while the
   pressure falls by 27 %.** A thermal artefact would produce a droop
   *proportional to pressure*, so the rate would have fallen by 27 % as well.
   It did not (0.340 → 0.353 bar/day, and slightly *increasing*).

*Additional measurement to be certain:* the tank's own **skin temperature**
measured at the tank, not the spacecraft bus, logged at the same cadence as
pressure, so that $p/T$ can be formed and plotted directly. If $p/T$ still
droops, the loss is mass. (Accept also: a ground-based helium mass-spectrometer
leak check on the flight-spare unit at flight pressure, to see whether the
build has a systemic leak path.)

**(f) Two most probable causes, and the containing design change.**

1. **A thruster valve seat leaking** — a particle trapped on the poppet seat
   during assembly or shaken loose at launch, or a seat scored by high-cycle
   impact. Note that the droop was present from day 0, *before* any commanded
   firing, which points at a build or launch-vibration cause rather than
   cycling wear. **Containment:** a **latching isolation valve upstream of the
   manifold**, commanded closed between manoeuvres. With one, a leaking
   thruster valve loses only the manifold volume, not the tank. Plus
   filtration immediately upstream of every valve and hard particulate control
   during assembly.
2. **A leaking mechanical joint** — a fitting, boss seal or transducer port,
   with an elastomeric seal that took a compression set during storage or that
   relaxed after launch loads. **Containment:** eliminate the joint — an
   all-welded or additively manufactured integrated tank/manifold/nozzle
   assembly (§7.4), which is precisely why the flown CubeSat modules are built
   that way. Failing that, metal-to-metal seals and a leak-rate budget
   allocated per joint with acceptance testing at flight pressure over a
   representative dwell.

Deduct marks for answering only "there is a leak" without the rate, and for
computing the burn masses from the day-boundary pressures without noticing that
the leak biases them.

**E4 — The inconsistent datasheet.**

*The inconsistency.* **R-236fa cannot produce 65 s of specific impulse as a
cold gas.** Its ideal vacuum $I_{sp}$ at $T_0 = 300$ K is 43.2 s at
$\varepsilon = 50$ (43.2 s is the *ceiling*, achieved at zero loss), and a real
system delivers ~0.9 of that, ≈ 39 s. The quoted 65 s is **50 % above the
thermodynamic ceiling** for that propellant at room temperature.

*Quantify.* At the quoted 65 s, 220 N·s implies $m_p = 220/(65 \times 9.80665)
= 0.345$ kg, a 31 % propellant mass fraction of the 1.1 kg wet mass. At the
correct ~40 s, the same total impulse needs $m_p = 220/392.27 = 0.561$ kg — a
**51 % mass fraction**, which is right in line with MarCO's measured 55 %
(WE3). So the datasheet's own wet mass *supports* the 40 s reading and
contradicts the 65 s reading.

*Which number to trust least: the $I_{sp}$.* Three reasons. It is the only one
that violates a physical bound. It is the number a vendor is most tempted to
quote optimistically, or to quote for the wrong propellant in a product family
(65 s is close to n-butane's realized 60–70 s, so this looks like a
copy-paste from the butane variant's datasheet). And it is the number that a
customer cannot check without a thrust stand, whereas total impulse and wet
mass are checkable by weighing and by a discharge test.

*What to conclude:* trust the total impulse and the wet mass, treat the $I_{sp}$
as erroneous, and ask the vendor for the plenum temperature — because if the
system is *heated*, 65 s becomes achievable and the datasheet is not wrong, it
is merely omitting that it is a warm-gas system.

**E5 — Three-sentence review comment.**

> The MMU's published 110–130 ft/s cannot be reconciled with its published
> 11.8 kg GN₂ load at any credible cold-gas specific impulse: at a realistic
> 70 s the impulse available is ~8,100 N·s, which gives 24 m/s against a
> 340 kg MMU-plus-crew and 57 m/s against the 148 kg unit alone, and the
> published figure matches neither — it closes only against an unstated
> ~231 kg reference mass, or against a propellant load 37–62 % larger than
> stated. The proposal therefore rests on a specification with an unresolved
> internal inconsistency, and the derived claim ("35 m/s to a 150 kg vehicle")
> inherits it: 11.8 kg at 70 s against 150 kg gives 56 m/s, so the proposal is
> in fact quoting a figure that is *conservative* under one reading and
> unachievable under another, without saying which. Please re-derive the
> requirement from SAFER instead — 1.4 kg, 3.05 m/s, 224 bar, 37.7 kg system,
> which closes at ~40 s — and state the reference mass explicitly in the
> Δv budget.

---

## K2. Quiz answers with explanations

**Q1 (8) — (c) SAFER.**
(a) Wrong: Hubble has no thrusters at all; attitude control is reaction wheels
and magnetic torquers, chosen deliberately to avoid plume contamination of the
optics. (b) Wrong: Centaur's settling and attitude thrusters are hydrogen
peroxide on early vehicles and hydrazine on later ones; GH₂/He appear for tank
pressurisation and, on some variants, vented settling thrust — not a cold-gas
propulsion subsystem. (d) Wrong: Ariane 5 EPS is a storable hypergolic stage
with hydrazine attitude control. (c) Correct: SAFER is GN₂, 24 thrusters,
224 bar, 1.4 kg, 3.05 m/s.

**Q2 (8) — (a) 77.8 s.**
Going from $\varepsilon = 50$ to 100 gains 1.3 % for $\gamma = 1.4$ (76.8 →
77.8 s). (d) is wrong because there *is* a gain, but the point of the question
is that it is nearly negligible: (b) and (c) would require the exhaust to gain
9–20 % of velocity from the last half of the expansion, which the isentropic
relations forbid at this $\gamma$. **This is why cold-gas nozzles are short.**

**Q3 (10).**
$$I_{sp} = \frac{\Delta v}{g_0 \ln[m_0/(m_0-m_p)]}
= \frac{3.05}{9.80665 \times \ln(180/178.6)}
= \frac{3.05}{9.80665 \times 0.0078074} = \mathbf{39.8\ s}$$
*Why so far below 76.8 s:* SAFER fires in millisecond bursts, so a large
fraction of each pulse is spent charging and discharging the dead volume
between valve seat and throat at unchoked or low-pressure conditions, and much
of the impulse goes into automatic attitude hold, which produces couples with
zero net Δv. (4 marks for the arithmetic, 4 for the number, 2 for a mechanism —
either the dead-volume/transient argument or the attitude-hold argument earns
the marks; both earn full credit.)

**Q4 (10).**
GN₂ at 241 bar: $200 \times 0.211 = \mathbf{42.2\ N\,s}$.
R-236fa: $200 \times 0.576 = \mathbf{115.2\ N\,s}$.
**R-236fa wins by a factor of 2.73**, despite having 56 % of nitrogen's
specific impulse. Full credit requires the factor and the observation that the
comparison ignores the tank, which makes the real margin larger still — the
nitrogen needs a 241-bar COPV and the R-236fa a 2.7-bar can.

**Q5 (8) — (c).**
The module's analysis (WE2, step 5) *excludes* a SAFER-like ~40 s $I_{sp}$: at
40 s, 36 m/s requires a reference mass of 134.6 kg, which is less than the
MMU's own loaded mass of 148 kg and therefore impossible. (a) and (b) are the
two surviving hypotheses, and (d) is not excluded either — the published figure
could simply be optimistic. Only (c) is ruled out by physics.

**Q6 (12).**
$m_i = \dfrac{300\times10^5 \times 0.8\times10^{-3}}{296.80 \times 293}
= \dfrac{2.4\times10^4}{86{,}962} = 0.276$ kg.
$\eta_u = 1 - 6/300 = 0.980$. $m_u = 0.276 \times 0.980 = \mathbf{0.270\ kg}$.
$I_t = 68 \times 9.80665 \times 0.2705 = \mathbf{180\ N\,s}$.
(4 marks stored mass, 3 usable fraction, 5 total impulse with units. A common
error is forgetting $\eta_u$ entirely, which costs 3 marks; using 300 bar in
Pa incorrectly, e.g. $3\times10^5$, is a unit error costing 6.)

**Q7 (10).** Any three of:
1. **No conditioning or ignition** — ready the instant the solenoid is
   commanded, in vacuum, at any attitude, with no ullage settling, no preheat,
   no catalyst bed to warm.
2. **Effectively unbounded restarts** across the flip and the multi-minute
   coast limit cycle; cycle life is a clean valve-seat problem.
3. **Works across the whole flight regime**, vacuum through high dynamic
   pressure, including where the grid fins have no authority.
4. **Inert for recovery and reflight** — nothing toxic to decontaminate, no
   exclusion zone, no residuals to drain, benign on the pad.
*The parameter sacrificed:* **specific impulse** (of order 70 s for GN₂ versus
~230 s for hydrazine), and with it the mass of the high-pressure tankage.
(3 marks per requirement to a maximum of 9, plus 1 for naming $I_{sp}$. Deduct
2 for quoting any Falcon 9 thrust, $I_{sp}$, pressure or total-impulse figure —
SpaceX publishes none of them.)

**Q8 (12).**
*Mechanism (4):* **evaporative cooling of the saturated liquid.** A sustained
burn draws the latent heat of vaporisation from the bulk propellant faster than
the spacecraft can supply it; the liquid temperature falls; vapour pressure
follows the saturation curve down; the plenum pressure and therefore the thrust
fall with it. Recovery over twenty minutes is the tank re-warming from the bus.
*Data to plot (4):* **tank pressure against tank temperature, overlaid on the
R-236fa saturation curve.** If the operating point tracks the saturation line
during the burn and walks back up it during the dwell, the mechanism is
confirmed. (Also acceptable: thrust and tank temperature against time, showing
the same time constant on the recovery.)
*Two fixes with costs (4):*
- **Duty-cycle limits** — cap burn duration and enforce a dwell. Cost: longer
  manoeuvres, more complex sequencing, and reduced control authority when it is
  most needed.
- **A conductive thermal path from the bus into the tank, or an active
  vaporiser heater.** Cost: mass, power (tens of watts for a heater), and a
  thermal-design coupling that can drive the tank the wrong way during eclipse.
(Accept also: oversize the tank so a given burn consumes a smaller fraction and
the temperature excursion is smaller — cost is volume.)

**Q9 (12).**
**Recommend R-236fa.**
*The calculation (6):* R-236fa at a realized 40 s needs
$m_p = 400/(40 \times 9.80665) = 1.020$ kg, and at 1.36 g/cm³ that is
$1.020/0.00136 = \mathbf{750\ cm^3} = 0.75$ L — inside the 1.0 L allocation
with room for the module structure. GN₂ at 200 bar stores
$0.28 \times (200/241) = 0.232$ g/cm³, and at a realized 70 s needs
$m_p = 400/(70 \times 9.80665) = 0.583$ kg, i.e.
$0.583/0.000232 = \mathbf{2{,}510\ cm^3} = 2.5$ L of propellant alone —
**2.5× the entire allocation before the COPV wall.** The nitrogen option does
not fit and the argument ends there.
*The non-numerical argument (6):* the rideshare provider treats a >100 bar
vessel as a schedule risk, and a 200-bar COPV commits the programme to a
pressure-vessel qualification path — burst article, proof history, compliance
documentation, range-safety review — that a 2.7-bar aluminium can does not. On
a 6U CubeSat, **tank pressure sets the qualification path, and the
qualification path sets the schedule.** Full credit also for noting that
self-pressurisation removes the regulator, i.e. removes a part and a failure
mode.

**Q10 (10).**
*Why it cannot be true (4):* argon is monatomic with $M = 39.95$, and its
**ideal** vacuum $I_{sp}$ at $T_0 = 300$ K and $\varepsilon = 50$ is 56.4 s. A
real system delivers ~0.9 of that, ~50 s. 120 s is **more than twice the
thermodynamic ceiling** at room temperature, and no nozzle, no matter how
good, can exceed it — $I_{sp} \le c^* C_F^{max}/g_0$ is set by the gas and the
expansion, not by workmanship.
*What they most likely mean (3):* the system is **heated** — a resistojet or
arcjet. From $I_{sp}\propto\sqrt{T_0}$, reaching 120 s from a 56.4 s ideal
needs $T_0 \approx 300 \times (120/56.4)^2 \approx 1{,}360$ K, plus efficiency
corrections. It is a warm-gas or electrothermal device being marketed under the
cold-gas heading, exactly as the NASA small-spacecraft "40–110 s" band silently
does.
*What to ask for (3):* the **plenum stagnation temperature and the electrical
power required to sustain it during a burn**, plus the expansion ratio and the
$T_0$ at which the $I_{sp}$ was measured. (Accept also: the measured thrust and
mass-flow traces from which the $I_{sp}$ was derived, and the duty cycle.)

---

## K3. Trade-study reference solution (T1)

**Requirements restated.** 18 kg wet 12U; 20 m/s phasing + 15 m/s de-orbit =
**35 m/s of Δv**; 12 months of three-axis control at **20 μN·s** impulse-bit
resolution; **25 W** orbit-average power; **1.5 L** volume for propulsion;
**>100 bar is a schedule penalty**.

### Step 1 — Δv propellant requirement per option

$m_p = m_0(1 - e^{-\Delta v/(I_{sp}g_0)})$ with $m_0 = 18$ kg,
$\Delta v = 35$ m/s. Add an attitude-control allocation; a defensible one for a
12-month optical campaign on a 12U in LEO is **150 N·s** (state your
assumption — any figure between 80 and 300 N·s, stated and justified, earns
full marks).

| option | realized $I_{sp}$ | $m_p$ for 35 m/s | ACS mass (150 N·s) | total $m_p$ | stored $\rho$ | **propellant volume** |
|---|---|---|---|---|---|---|
| **A** GN₂ 241 bar regulated | 70 s | 0.895 kg | 0.219 kg | **1.113 kg** | 0.28 g/cm³ | **3,980 cm³** |
| **B** R-236fa | 40 s | 1.536 kg | 0.382 kg | **1.919 kg** | 1.36 g/cm³ | **1,410 cm³** |
| **C** n-butane | 65 s | 0.962 kg | 0.235 kg | **1.197 kg** | 0.57 g/cm³ | **2,100 cm³** |
| **D** R-236fa warm | 82 s | 0.767 kg | 0.187 kg | **0.953 kg** | 1.36 g/cm³ | **701 cm³** |

(Volumes are propellant only, $V = m_p/\rho$. Δv propellant from
$m_p = m_0(1-e^{-\Delta v/I_{sp}g_0})$ at $m_0 = 18$ kg; ACS mass
$= I_t/(I_{sp}g_0)$. **Note the volumes are computed from realized $I_{sp}$ and
stored density directly, not from the §3.2 impulse-density column, which uses
*ideal* $I_{sp}$ — using the table's 0.211 for GN₂ would understate the
nitrogen volume by 10 %.** Marks are not lost for using the table provided the
inconsistency is noticed.)

**Only options B and D fit inside 1.5 L on propellant volume alone.**

### Step 2 — Tank mass where a pressure vessel is involved

Only option A. $V = 3{,}980$ cm³ $= 3.98\times10^{-3}$ m³ at 241 bar:
$pV = 241\times10^5 \times 3.98\times10^{-3} = 9.58\times10^4$ J. At a
realistic small-COPV $pV/W = 8{,}000$ m, $m_{tank} = 1.22$ kg — **more than the
1.113 kg of propellant it holds.** At an optimistic 15,000 m it is 0.65 kg.
Options B, C and D need only a low-pressure can, tens of grams.

### Step 3 — Which requirement each rejected option fails

- **A (GN₂) fails twice over.** 3,980 cm³ of propellant against a 1.5 L
  total allocation — 2.7× over *before* the COPV wall, the regulator, the
  manifold or the thrusters, and the COPV itself weighs more than the
  propellant (Step 2). **And** it fails the pressure constraint independently:
  241 bar triggers the rideshare schedule penalty explicitly named in the
  requirements. Two independent hard failures. Reject.
- **C (butane) also fails volume**, which is the answer most students miss.
  Butane is the *mass*-efficient cold option (1.197 kg against B's 1.919 kg)
  and this makes it look attractive — but at 0.57 g/cm³ it needs **2,100 cm³**,
  which is 1.4× the entire allocation. Butane buys its $I_{sp}$ with density,
  and on a volume-limited bus that is the wrong currency. **Secondary
  objection:** a flammable hydrocarbon on a rideshare manifest is a review and
  manifest risk on a programme the requirements tell us is
  schedule-sensitive. Reject on volume; note the flammability as a second
  reason. An answer that rejects C *only* on flammability has not done the
  arithmetic.
- **D (warm gas) is the volume winner (701 cm³) and the mass winner
  (0.953 kg)**
  and it fails on **power and on impulse-bit resolution**. A CHIPS-class heater
  draws tens of watts during a burn against a 25 W orbit-average budget on a
  spacecraft whose primary mission is a 12-month optical campaign — the burns
  and the payload will contend for the same power. Worse, the heater's thermal
  mass imposes a warm-up before each firing, which destroys the fine, fast,
  unheated impulse bit that the **20 μN·s** requirement demands. You would end
  up running the ACS *cold* (43 s) and the Δv burns *hot* (82 s), which is
  defensible — but then you have both systems' complexity and both systems'
  failure modes.

### Step 4 — Recommendation

**Recommend B: R-236fa self-pressurising cold gas.** [J]

It is the only *unheated* option that fits: 1,410 cm³ of propellant against
a 1.5 L allocation; the tank is a ~2.7 bar can, far below the 100 bar
threshold; the system draws essentially no power except valve actuation,
leaving the 25 W for the payload; and an unheated micro-valve delivers the
fastest, most repeatable, lowest-quantum impulse bit of any option, which is
what the 20 μN·s requirement is really asking for. It gives up specific
impulse — 1.919 kg of propellant against option A's 1.113 kg — and that is the
right thing to give up, because the mass budget is not the binding constraint
and the volume, pressure and power budgets all are.

**A strong answer notes the tightness honestly.** 1,410 cm³ inside a 1.5 L
allocation leaves ~90 cm³ for tank wall, valves, manifold and electronics,
which is not achievable. The real recommendation is therefore **B with a
descoped ACS allocation**, or **B plus reaction wheels carrying the
fine-pointing duty**, dropping the propulsion ACS allocation from 150 N·s to
~40 N·s: total propellant 1.638 kg, **1,205 cm³**, leaving ~295 cm³ for
hardware — which does close on a flight-proven module form factor. Saying
"B, and here is what has to give" is a better answer than "B" alone.

### Step 5 — Largest risk and the test that retires it

**Largest risk: propellant retention over the full timeline.** The module is
built, integrated, waits for a rideshare (typically 6–18 months), then must
operate for 12+ months. At 1.96 kg of propellant the absolute leak-rate budget
is more forgiving than a NanoProp-class system's, but the *volume* is at its
limit, so there is no margin to absorb a loss. Secondary risk: evaporative
cooling during the 20 m/s phasing burn (§7.2) reducing thrust and stretching
the manoeuvre.

**Test that retires it:** a **flight-representative module sealed at flight
propellant load and held for a period representing the worst-case
integration-plus-launch-delay dwell**, with tank pressure and temperature
logged, reduced to a leak rate by the $p/T$ method of Problem E3, and compared
against a per-joint leak-rate allocation. Run it after vibration and thermal
cycling, not before — the day-0 droop in E3 is exactly the failure this
sequencing catches. Retire the secondary risk with a **long-duration burn on a
thrust stand at flight duty cycle**, plotting thrust and tank temperature to
confirm the saturation-curve excursion is within the manoeuvre plan.

### Step 6 — Confidence caveats (required for full marks)

The following inputs are conf C or worse and limit the recommendation:
- **Stored densities** (0.28 g/cm³ for GN₂, 1.36 for R-236fa, 0.57 for butane)
  are literature-recalled, flagged `NEEDS PRIMARY` against NIST REFPROP. Every
  volume above scales inversely with them. Recompute against [NIST-WB] before
  committing.
- **$\gamma$ for the refrigerants and butane** is a single approximate value
  for a real gas near saturation; the ideal $I_{sp}$ values inherit that
  approximation.
- **The 0.90 efficiency factor** is a steady-flow rule. The ACS allocation is
  pulsed, so the true ACS propellant could be 1.5–1.8× the figures above (§3.3,
  WE1). **This is the single largest numerical uncertainty in the trade** and it
  pushes option B's volume further past the allocation, reinforcing the Step 4
  caveat about descoping.
- **CHIPS' 82 s** is conf B and its power draw is not quoted here at all, so
  option D's rejection rests on an order-of-magnitude power argument, not a
  number.

### Rubric

| element | marks |
|---|---|
| Propellant mass sized for 35 m/s per option, with the rocket equation, correct $I_{sp}$ per option | 15 |
| ACS allocation stated, justified, and converted to propellant mass | 10 |
| Volume computed for each option from $\rho I_{sp}$ and compared with 1.5 L | 15 |
| Eq. 5.1 applied to option A with a stated $pV/W$, and the conclusion that the tank outweighs its propellant | 10 |
| Each rejected option tied to the specific requirement it fails (A: volume *and* pressure; C: flammability/manifest; D: power *and* impulse-bit) | 15 |
| A clear recommendation with the trade named ($I_{sp}$ given up because mass is not binding) | 10 |
| Honest treatment of option B's volume tightness and a stated descope | 10 |
| Largest risk identified and a specific, sequenced test named to retire it | 10 |
| Confidence caveats on conf-C inputs and their effect on the recommendation | 5 |

**Automatic deductions:** −10 for recommending option A on $I_{sp}$ grounds
without computing the volume; −10 for any answer that omits the ACS allocation
entirely (a 12-month optical campaign's ACS impulse is comparable to its Δv
impulse); −5 for quoting a propellant volume without stating the density used;
−5 for treating the 0.90 efficiency factor as applying to the pulsed ACS
allocation.

---

## K4. Common wrong answers, and what they reveal

**1. "Helium, because it has the highest $I_{sp}$."**
Reveals that the student has learned Eq. 3.3 and not Eq. 3.4. The tell is that
they never compute a volume. Every real cold-gas selection is volume-driven,
and the ordering of $\rho I_{sp}$ is almost the reverse of the ordering of
$I_{sp}$. Fix: make them build the §3.2 table themselves from the density and
$I_{sp}$ columns; the inversion is unmissable once they have multiplied.

**2. Using the 0.90 efficiency rule on a pulsed system.**
Reveals that they read §3.3 as a fact rather than as a conditional. This is the
error that under-sizes tanks by 40 % and it is the most expensive mistake in
the module. The tell is a Δv budget with no duty cycle in it. SAFER's 0.52 is
the counter-example to memorise.

**3. Quoting a Δv without a reference mass — or checking a Δv against the
wrong one.**
Reveals that they treat a specification as data rather than as a claim with
hidden premises. Almost every disagreement in the cold-gas literature is this
one error. Fix: require every Δv in their own work to be written as
"$\Delta v$ = X m/s against $m_0$ = Y kg," always, including when it seems
obvious.

**4. Putting Hubble, Centaur, Sputnik or Vanguard in a cold-gas list.**
Reveals that they have searched rather than read. Each is a category error with
a different cause: Hubble has *no* thrusters (contamination decision), Centaur
uses monopropellants (with GH₂/He only for pressurisation and vented settling),
and the Sputnik/Vanguard claim has no source at all. The deeper problem is that
they have not internalised that "I could not find a source" is a publishable
result and "I found it on three websites" is not.

**5. Averaging the MMU discrepancy away — e.g. "call it 30 m/s."**
Reveals a preference for a number over a correct statement. The two hypotheses
(unstated ~231 kg reference mass; larger propellant load) have different
engineering implications, and a split-the-difference figure supports neither.
The professional answer is to state the discrepancy, give both branches, and
name the document that would settle it.

**6. Reading the leak trace as "the thrusters are firing more than commanded."**
Reveals that they did not look at days 0–5, where the droop exists *before any
firing*. It also reveals a failure to check the shape: consumption produces
steps, leakage produces slope. Any diagnosis that does not distinguish those
two signatures has not used the data.

**7. Computing the E3 leak rate from a single pair of endpoints spanning a
burn.**
Reveals that they did not segment the trace. Mixing a 21.5 bar commanded step
into a leak calculation over-states the leak by two orders of magnitude. The
discipline is: identify the quiescent segments first, fit those, then attribute
the residual to commanded events.

**8. Treating the resistojet as "a better cold-gas thruster."**
Reveals that they costed the $I_{sp}$ gain and not the power. A resistojet is a
small electric thruster in cold-gas plumbing and belongs in an electric-
propulsion trade. The tell is a warm-gas recommendation on a
power-constrained bus with no watts in the answer.

**9. Quoting Falcon 9 thrust or $I_{sp}$ figures.**
Reveals that they took an enthusiast site as a source. SpaceX publishes none of
these numbers. In an interview this is the single fastest way to lose a
reviewer's confidence, because the person across the table usually knows that
the figure is unpublished.

**10. Assuming the propellant mass fraction of a CubeSat module is small.**
Reveals unfamiliarity with the low-pressure architecture. MarCO's module is
55 % propellant by mass because a 2.7-bar can weighs almost nothing. Students
who assume a 20–30 % fraction (correct for a high-pressure gas system)
mis-diagnose consistent datasheets as inconsistent — and, in E4, will get the
right answer for the wrong reason.

**11. Answering C3 with "SAFER is cheaper."**
Reveals that they read cost where the requirement said reliability. SAFER's
simplicity is not an economy measure; it is a response to a *dormancy* failure
mode that redundancy makes worse, not better. Students who miss this also tend
to add redundancy to every design in the capstone.
