# Part IV Exam — Cold-Gas Thrusters
Modules 28–31 · 2.5 hours · 100 points · closed book except the sheets listed below

---

## Instructions

**Time.** 150 minutes. The paper is weighted at roughly 1.5 minutes per mark;
Section B is the longest and you should protect about 50 minutes for it.

**Permitted material.** `reference/equation-sheet.md`, a calculator, and the
Part IV gas-property table (Module 28 §4.1 / verification worksheet §B.1). You
may use `tools/rocket.py` if you are sitting this at a machine; every number in
the key was produced with it. No module text, no keys, no notes.

**Constants.** $g_0 = 9.80665\ \mathrm{m/s^2}$;
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$;
$\mu_0 = 4\pi\times10^{-7}\ \mathrm{H/m}$.
Standard conditions for leak rates: 273.15 K, 101 325 Pa.
Nitrogen: $\mathcal{M} = 28.014$ kg/kmol, $\gamma = 1.400$.
R-236fa: $\mathcal{M} = 152.04$ kg/kmol, $\gamma = 1.08$.
Helium: $\mathcal{M} = 4.003$ kg/kmol.

**Rules of the house.**

- SI units throughout. Every answer carries a unit and a sensible number of
  significant figures — three is almost always right, and quoting six on a
  quantity whose input was confidence C is itself an error.
- Calculation questions are graded on method first. A correct setup with an
  arithmetic slip loses at most 30 % of the marks for that part; a correct
  number arrived at from a wrong setup scores zero.
- Where a question asks you to *state an assumption* or *say what would change
  your answer*, those words carry marks. Answers that are only arithmetic will
  not reach full credit.
- Where a figure you are given is flagged in the course as confidence C or
  `NEEDS PRIMARY`, say so in your answer. Using it silently loses a mark;
  refusing to use it at all also loses a mark. Use it, and label it.

**Sections.**

| section | topic | marks |
|---|---|---|
| A | Principles and gas selection | 20 |
| B | Performance modeling — derivations, blowdown and regulated flow | 35 |
| C | Hardware and constraints — tanks, regulators, valves, leak budgets, MIB | 25 |
| D | Systems and data interpretation | 20 |
| | **total** | **100** |

---

# Section A — Principles and gas selection (20 marks)

## A1 (5 marks) — Multiple choice

One mark each. Choose one option. No working required, but a one-line
justification will earn partial credit if your choice is wrong.

**A1.1** A spacecraft already carries krypton at 120 bar for a Hall thruster
and proposes tapping it for cold-gas attitude control. Its *ideal* vacuum
specific impulse at $T_0 = 300$ K and $\varepsilon = 50$ is closest to:

&nbsp;&nbsp;(a) 26 s &nbsp;&nbsp;(b) 39 s &nbsp;&nbsp;(c) 56 s &nbsp;&nbsp;(d) 77 s

**A1.2** Ranked by **impulse density** $\rho\,I_{sp}g_0$ using the course
table's stored densities and ideal $I_{sp}$ at $\varepsilon = 50$, xenon at
241 bar compared with R-236fa as a saturated liquid:

&nbsp;&nbsp;(a) xenon is lower by about 1.4× &nbsp;&nbsp;(b) xenon is higher by about 1.4×
&nbsp;&nbsp;(c) they are equal to within 5 % &nbsp;&nbsp;(d) xenon is lower by about 8×

**A1.3** Ammonia has the highest ideal specific impulse of any liquefiable
cold-gas propellant in the course table (104.7 s at $\varepsilon = 50$) and is
essentially never flown on a CubeSat. The decisive reason is:

&nbsp;&nbsp;(a) its vapour pressure of ~10.6 bar demands a COPV
&nbsp;&nbsp;(b) its $\gamma$ of 1.31 gives a poor thrust coefficient
&nbsp;&nbsp;(c) it is toxic, attacks copper alloys, and condenses on optics
&nbsp;&nbsp;(d) its storage density of 0.60 g/cm³ is too low to be useful

**A1.4** Xenon held at 300 K and 241 bar is best described as:

&nbsp;&nbsp;(a) a saturated liquid under its own vapour pressure
&nbsp;&nbsp;(b) a two-phase mixture whose quality depends on fill fraction
&nbsp;&nbsp;(c) a supercritical fluid requiring a real equation of state
&nbsp;&nbsp;(d) an ideal gas, since $T \gg T_c$

**A1.5** Flown CubeSat cold-gas nozzles rarely exceed $\varepsilon \approx 50$
even though the ideal thrust coefficient keeps rising with area ratio. The
governing reason is:

&nbsp;&nbsp;(a) the heat load on the divergent section
&nbsp;&nbsp;(b) at low throat Reynolds number the wetted-area friction of a longer
divergent grows faster than the ideal $C_F$ gain
&nbsp;&nbsp;(c) the nozzle would separate in vacuum
&nbsp;&nbsp;(d) condensation of nitrogen at the exit plane

---

## A2 (7 marks) — Propellant screening against a volume and pressure cap

A 16U rideshare payload requires **300 N·s of delivered total impulse**. The
propulsion allocation gives **0.90 L of propellant volume** (tank internal
volume, ignoring wall thickness), and the launch provider imposes a hard cap of
**15 bar** on any stored pressure. Tank and spacecraft temperature is 293.15 K.

Four candidates:

| | propellant | storage state | $\rho$ (g/cm³) | realized $I_{sp}$ (s) |
|---|---|---|---|---|
| (a) | GN₂ | gas at 15 bar | compute it | 69 |
| (b) | n-butane | saturated liquid, ~2.6 bar | 0.57 | 65 |
| (c) | R-236fa | saturated liquid, ~2.7 bar | 1.36 | 40 |
| (d) | SF₆ | saturated liquid, ~21 bar | 1.40 | 38 |

**(i)** (2) Compute the stored density of GN₂ at 15 bar and 293.15 K, treating
it as ideal, and justify in one line why $Z = 1$ is acceptable here when it is
not at 240 bar.

**(ii)** (3) Compute the impulse density $\rho I_{sp} g_0$ of each candidate in
N·s/cm³, and the total impulse each would deliver in the 0.90 L allocation.

**(iii)** (2) Eliminate the candidates that fail, name the constraint each one
fails, and recommend one of the survivors. Defend the recommendation against
the runner-up in one sentence, and state the confidence label attached to the
density column you have just used.

---

## A3 (8 marks) — Two propellants that look right and are not

**(i)** (4) A designer proposes **carbon dioxide** for a 6U CubeSat, arguing
that it liquefies at room temperature, stores at 0.6–0.7 g/cm³, and
self-pressurises — the MarCO architecture with 50 % more specific impulse.

State the **two** physical objections to CO₂ that would stop this in review.
For the first, give the tank-temperature condition that triggers it and say
what the system reverts to. For the second, name the thermodynamic boundary
being crossed and where in the hardware the consequence appears.

**(ii)** (4) **Air** has an ideal $I_{sp}$ within 2 % of nitrogen's, is free,
and is available on every test stand on Earth. It has never flown as a
spacecraft cold-gas propellant. Give **three distinct** technical reasons, each
tied to a specific component or interface of the system rather than to
performance.

---

# Section B — Performance modeling (35 marks)

## B1 (10 marks) — Derivation: the blowdown ODE

A tank of fixed internal volume $V$ contains a perfect gas of specific gas
constant $R$ and ratio of specific heats $\gamma$. It discharges through a
single fixed throat of area $A_t$ into vacuum. There is no regulator, so the
tank *is* the plenum. The throat is choked throughout.

**(i)** (5) Starting from the choked mass-flow relation
$\dot m = \Gamma p_t A_t/\sqrt{R T_t}$ and a mass balance on the tank, derive
the governing ordinary differential equation and solve it for the
**isothermal** case ($T_t = T_i$ held by heat transfer from the structure).
State the time constant $\tau$ explicitly in terms of $V$, $\Gamma$, $A_t$, $R$
and $T_i$, and show that $\tau$ is also equal to $m_i/\dot m_i$.

**(ii)** (2) Show that the thrust history follows $F(t) = F_i e^{-t/\tau}$ in
vacuum, stating the one property of $C_F$ that this relies on, and hence that
the total impulse delivered between $p_i$ and $p_f$ is
$I_{tot} = F_i \tau\,(1 - p_f/p_i)$.

**(iii)** (3) For the **adiabatic** case the same $\tau_i$ appears but the
solution becomes algebraic rather than exponential:

$$x(t) \equiv \frac{\rho_t}{\rho_i} = \left[1+\frac{\gamma-1}{2}\frac{t}{\tau_i}\right]^{-\frac{2}{\gamma-1}},\qquad \frac{p_t}{p_i}=x^{\gamma}$$

You are **not** asked to derive this. Instead: explain in physical terms why an
adiabatic tank reaches a given final pressure in **less** time than an
isothermal one, even though both start at the same $\dot m$; and state which of
the two limits a metal-walled tank pulsing at 5 % duty over an hour actually
sits in, with the reason.

---

## B2 (13 marks) — Unregulated blowdown, both limits

A GN₂ blowdown thruster module has an internal volume $V = 0.600$ L charged to
$p_i = 30.0$ bar at $T_i = 290$ K. A single thruster has a throat of
$D_t = 0.250$ mm and a conical nozzle of $\varepsilon = 40$, firing
continuously into vacuum until the tank falls to 6.00 bar. Take $Z = 1.00$.

**(i)** (2) Compute $\Gamma$, $c^*$, the vacuum $C_F$ at $\varepsilon = 40$, and
the ideal vacuum $I_{sp}$ at this tank temperature.

**(ii)** (3) Compute $A_t$, the initial stored mass $m_i$, the initial mass flow
$\dot m_i$ and the initial thrust $F_i$.

**(iii)** (3) Compute the blowdown time constant $\tau$ by both routes given in
B1(i), the time to reach 6.00 bar, the isothermal usable mass fraction
$\phi_{iso}$, and the isothermal total impulse. Verify the impulse by the
second route of B1(ii).

**(iv)** (4) Now assume the tank is thermally isolated. Compute the final tank
temperature, $\phi_{adiab}$, the time to reach 6.00 bar, and the total impulse
from

$$I_{tot} = C_F\,c^*_i\,m_i\,\frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{\frac{\gamma+1}{2}}\right]$$

State the percentage impulse loss against the isothermal case.

**(v)** (1) Two separate penalties combine to produce that loss. Name them, and
say which of the two is *not* captured by $\phi_{adiab}$ alone.

---

## B3 (12 marks) — Regulated thruster, Reynolds number, and the area-ratio trade

The same propellant. A regulated thruster is required to deliver **10.0 mN** of
vacuum thrust from a plenum held at $p_0 = 4.00$ bar and $T_0 = 290$ K, through
a conical nozzle of $\varepsilon = 40$ with a 15° divergent half-angle.

Use $\mu_{293} = 1.76\times10^{-5}$ Pa·s for nitrogen, scaled as $T^{0.7}$, and
the course correlations

$$\eta_{visc} = 1 - \frac{b(\varepsilon)}{\sqrt{Re_t}},\qquad b(\varepsilon) = 10\sqrt{\varepsilon/50},\qquad \lambda = \tfrac12(1+\cos\alpha),\qquad \eta_I = \lambda\,\eta_{visc}$$

**(i)** (4) Compute $C_F$, the throat area and diameter, and the mass flow.

**(ii)** (4) Compute the throat static temperature $T^*$, the throat viscosity
$\mu^*$, the throat Reynolds number $Re_t$, then $\eta_{visc}$, $\lambda$,
$\eta_I$ and the delivered $I_{sp}$.

**(iii)** (3) Repeat (i) and (ii) for the **same thrust at $\varepsilon = 20$**
and state which nozzle delivers more specific impulse and by how much. Account
for the result in one sentence, naming what is given up and what is recovered.

**(iv)** (1) State the confidence label of the correlation you used in (ii) and
(iii), its quoted uncertainty, and what you would do before putting either
number in a flight prediction.

---

# Section C — Hardware and constraints (25 marks)

## C1 (8 marks) — Leak budget

A smallsat propulsion module holds **950 g of GN₂**. The requirement is that no
more than **2.5 % of the propellant** may be lost to leakage over a **6.0-year**
mission (use 365.25 days per year). The module has **8 thruster valve seats**,
**2 further seats** (one latching isolation valve, one fill/drain valve), and
**14 mechanical joints**.

**(i)** (2) Compute the allowable mass loss, the allowable mass-loss rate, and
the total allowable leak rate in **scc/h of GN₂**. Show the standard-density
conversion.

**(ii)** (3) Allocate the budget as 55 % to the eight thruster seats, 15 % to
the two other seats, 20 % to the fourteen joints, and 10 % unallocated margin.
Give the per-item budget for each of the three groups, in scc/s of GN₂.

**(iii)** (2) Convert the per-thruster-seat number to a **helium** specification
for acceptance testing. State the flow regime you assumed, the numerical factor
it produces, and what the factor would become in the other regime.

**(iv)** (1) A vendor offers the thruster valve with a hard metal seat rated at
$1\times10^{-3}$ scc/s GHe. State whether it closes, with the arithmetic in one
line, and name the property of a soft seat that changes the answer.

---

## C2 (5 marks) — Regulator behaviour

A single-stage regulator has a **1.0 mm** seat diameter and a **22 mm** sensing
diaphragm, and holds a **6.0 bar** setpoint.

**(i)** (2) Compute the supply pressure effect $\partial p_{out}/\partial p_{in}$
and the setpoint shift as the tank falls from 250 bar to 35 bar. Express the
shift both in bar and as a percentage of the setpoint.

**(ii)** (2) On the bench, at 250 bar inlet and full rated flow, the droop is
measured at 0.9 % of setpoint. Predict the droop at 35 bar inlet at the same
flow, stating the scaling you used and the one assumption behind it. Comment on
what this means for an acceptance test performed only at beginning-of-life
inlet pressure.

**(iii)** (1) The low-pressure section downstream of this regulator must be
rated to one specific pressure. Name it, and say why it is not 6.0 bar.

---

## C3 (4 marks) — Solenoid force and response

A thruster solenoid has $N = 1000$ turns, coil resistance $R = 50\ \Omega$,
inductance $L = 36$ mH at the open gap, a pole-face diameter of 5.5 mm, a
working gap of 0.28 mm, and is driven from 28 V. Pull-in requires 0.40 A. The
seat diameter is 1.0 mm.

**(i)** (2) Compute the magnetic force at pull-in current, and the pressure
force on the seat at a 6 bar plenum and at a 250 bar tank. State whether this
valve can serve as the high-pressure isolation valve, with the number that
decides it.

**(ii)** (2) Compute the electrical component of the opening delay, the holding
current with the gap closed to 0.05 mm, and the pull-in and hold dissipations.
State in one sentence why peak-and-hold drive is not an optimisation on a
CubeSat.

---

## C4 (8 marks) — Impulse bit, repeatability, and throat tolerance

A thruster delivers a steady-state vacuum thrust of **35.0 mN**. Its valve has
an opening delay $t_{op} = 3.5$ ms, a closing delay $t_{cl} = 2.2$ ms, a thrust
rise transition of 1.0 ms and a fall transition of 1.6 ms. Command timing
jitter is ±0.25 ms. Use

$$t_{eff} = t_{cmd} - t_{op} + t_{cl},\qquad I_{bit} = F\left(t_{eff} - \tfrac12 t_{rise} + \tfrac12 t_{fall}\right)$$

**(i)** (3) Compute the impulse bit for commanded pulses of 12.0 ms and 4.0 ms,
and the jitter-driven fractional spread at each.

**(ii)** (2) The requirement is a minimum impulse bit $\le 0.15$ mN·s delivered
with a scatter no worse than ±10 %. State whether the 4.0 ms command meets both
halves of the requirement, and identify the pulse length below which the
trapezoidal model stops being valid at all, with the reason.

**(iii)** (2) The nozzle throat is 0.220 mm nominal, held to ±7 μm. The plenum
pressure is regulated to ±2.0 % and the discharge coefficient is known to
±2.5 %. Compute the thrust uncertainty from the throat alone, the combined RSS
uncertainty, and the fraction of the **variance** contributed by the throat.

**(iv)** (1) Name the fix that reduces the throat term to a fraction of a
percent without tightening the machining tolerance, and state what it costs.

---

# Section D — Systems and data interpretation (20 marks)

## D1 (8 marks) — Reading a regulated system's telemetry

A 6U spacecraft carries a regulated GN₂ system: a **2.00 L** tank charged to
**200.0 bar**, a regulator set to **5.00 bar**, a **40 cm³** low-pressure volume
(plenum plus manifold) downstream of it, a relief valve that cracks at **8.0
bar**, and four thrusters of **25 mN** each with a delivered $I_{sp}$ of 68 s.
Bus temperature is flat at 293.15 ± 0.3 K. Take $Z = 1.10$, constant over the
interval.

Thirty days of telemetry show:

- The **tank** pressure is flat between firing campaigns and falls in straight
  segments during them, from 200.0 bar to **167.7 bar** over a total of **1800
  thruster-seconds** of accumulated on-time summed across all thrusters.
- The **plenum** transducer reads 5.00 bar during and immediately after every
  firing. Between campaigns it rises steadily, reaching **6.40 bar** at the end
  of the final **6.0-day** quiescent period.
- No thruster was commanded during the quiescent periods.

**(i)** (2) Two distinct mechanisms are visible in this trace. Name each, say
which feature of the trace identifies it, and state which one is nominal
behaviour and which is a fault.

**(ii)** (2) From the tank decay and the accumulated on-time, compute the total
propellant consumed and the mean mass flow. Check it against the thruster
specification and say what the agreement tells you.

**(iii)** (2) From the plenum rise, compute the leak rate past the closed
regulator seat in kg/s and in scc/s of GN₂, and convert it to an equivalent
helium specification. The module was procured against $1\times10^{-4}$ scc/s
GHe. State whether it complies and by what factor.

**(iv)** (1) Compute when the relief valve will lift if the trend continues, and
state whether your estimate is optimistic or conservative, with the reason.

**(v)** (1) State the consequence for the mission once the relief valve lifts,
and give the one architectural change that contains this fault. Say what the
change does *not* protect against.

---

## D2 (8 marks) — System sizing: AURA-6

**AURA-6** is a 6U Earth-observation CubeSat, **9.5 kg wet**, in a 500 km
sun-synchronous orbit. Its propulsion requirements are:

| requirement | value |
|---|---|
| delivered total impulse | 240 N·s |
| thrust per thruster, beginning of life | 20–30 mN |
| minimum impulse bit | ≤ 0.20 mN·s |
| propellant volume allocation | 600 cm³ (tank internal volume) |
| stored pressure cap (rideshare) | 10 bar |
| mission duration | 3.0 years |
| propellant lost to leakage | ≤ 3 % |
| tank fill fraction | 90 % of internal volume |

Design the system. Take $T_0 = 293.15$ K and a nozzle area ratio
$\varepsilon = 30$. Where the course gives a flight-demonstrated realized
$I_{sp}$ for the architecture you choose, use it — and also carry the
0.90-rule value, because they disagree here and the disagreement is the point.

**(i)** (2) Select the propellant. Justify it against the pressure cap in one
sentence, then compute the ideal vacuum $I_{sp}$ at $\varepsilon = 30$ and
293.15 K, and the propellant mass and volume required for 240 N·s, **twice**:
once at the flight-demonstrated 40 s and once at 0.90 × ideal. State whether
each fits the 600 cm³ allocation at 90 % fill, and which number you would take
to a preliminary design review.

**(ii)** (2) Size the nozzle for 25 mN at the propellant's own vapour pressure
of 2.7 bar: compute $C_F$, $A_t$, $D_t$, $D_e$ and $\dot m$. Comment on the
manufacturing route the throat diameter implies.

**(iii)** (2) Size the valve command: compute the maximum effective on-time that
meets the MIB requirement at 25 mN, and the number of minimum-impulse pulses
contained in the total impulse. State what you would ask the valve vendor for
before believing a quoted "number of firings", and why.

**(iv)** (1) Size the tank as a sphere at 90 % fill: compute the radius, the
stress-limited membrane thickness at a burst factor of 1.5 for 6061-T6
($\sigma_{tu} = 310$ MPa, $\rho_m = 2700$ kg/m³), and the mass at a 1.0 mm
minimum manufacturable gauge. State which of the two thicknesses governs and
what that tells you about Eq. 3.5 of Module 28.

**(v)** (1) Compute the total allowable external leak rate in scc/h of the
propellant and its helium equivalent under molecular scaling. State the
construction decision that this number drives.

---

## D3 (4 marks) — Why did they design it that way?

The Gemini hand-held maneuvering unit (1965) had **3 nozzles**. The Manned
Maneuvering Unit (1984) had **24**. SAFER (1994) has **24** — while carrying
roughly **4 %** of the MMU's total impulse and existing to perform a single
manoeuvre.

**(i)** (2) Explain why the nozzle count jumped from 3 to 24 between 1965 and
1984. Name the specific in-flight observation that drove it and the physical
quantity that was not being controlled.

**(ii)** (1) Explain why SAFER did **not** scale the nozzle count down with its
impulse, in terms of what its user's mass properties and initial state are
known to be.

**(iii)** (1) Would a modern engineer building an EVA self-rescue aid choose 24
nozzles again? Answer yes or no and give the single strongest reason, then name
one element of SAFER's architecture you *would* change and what it buys.

---

*End of paper.*
