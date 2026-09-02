# Module 28 — Cold-Gas Principles: Answer Key

Solutions to the problems and quiz in
[`28-coldgas-principles.md`](28-coldgas-principles.md). Every numerical answer
here is recomputed with `tools/rocket.py`; the machine-checkable subset is in
`tools/examples/28.py`. Constants: $g_0 = 9.80665$ m/s²,
$R_u = 8314.46$ J/(kmol·K). Unless stated otherwise, gas properties come from
§4.1 of the module, the realization discount is Eq. 3.12 (0.90 for continuous
firing), and stagnation temperature is 300 K.

Grading note, per the course README: method first. A correct setup with an
arithmetic slip loses at most 30 % of the marks; a correct number reached by a
wrong route scores zero.

---

## K1. Problem solutions

### Conceptual

**P1 — Doubling storage pressure from 200 to 400 bar.**

Eq. 3.6 gives $m_{tank}/m_p = \tfrac32(\rho_m/\sigma_{allow})ZRT$, which contains
no storage pressure at all. In the thin-wall membrane limit the tank mass is set
by the *stored $pV$ product*, and $pV = Z m_p R T$ is fixed once the propellant
load and temperature are fixed. So:

- **Unchanged:** tank membrane mass per kilogram of propellant.
- **Halved:** tank internal volume, $V = Z m_p R T/p$.
- **Slightly worse:** the compressibility factor rises with pressure — for N₂ at
  300 K, $Z$ goes from about 1.14 at 200 bar to about 1.45 at 400 bar — so the
  actual tank mass *increases* by roughly the ratio of the $Z$ values, on the
  order of 20 %, and the volume falls by less than a factor of two.
- **Also worse, and off the equation:** thicker walls move the vessel away from
  the thin-wall assumption; the fill compressor, the fill/drain hardware, the
  regulator's inlet rating, the proof and burst test facility, and the
  fracture-control programme all get harder.

The correct statement of the trade is: **raise pressure when volume is the
binding constraint, never to save mass.** A student who says "it saves mass
because the tank is smaller" has confused mass with volume.

**P2 — Helium warming at the regulator, cooling in the nozzle.**

Two different processes.

*Regulator (throttle):* no shaft work, no significant change in kinetic energy
across the restriction, adiabatic ⇒ **isenthalpic**. The temperature change is
governed by $\mu_{JT} = (\partial T/\partial p)_h$ (Eq. 3.7). For an ideal gas
$\mu_{JT} = 0$; for a real gas its sign depends on whether attraction or
repulsion dominates. Helium at 300 K is far above its maximum inversion
temperature (~40 K), so repulsion dominates, $\mu_{JT} < 0$, and dropping the
pressure *raises* the temperature.

*Nozzle:* the flow does work on the fluid downstream of it, converting enthalpy
into directed kinetic energy. This is **isentropic**, not isenthalpic, and
$T/T_0 = (p/p_0)^{(\gamma-1)/\gamma}$ falls monotonically with pressure for every
gas. Helium cools in a nozzle exactly like nitrogen does.

The distinguishing feature: in the throttle the enthalpy is conserved and stays
in the fluid; in the nozzle enthalpy is converted to kinetic energy and leaves.
Property held constant: $h$ in the throttle, $s$ in the nozzle.

**P3 — Argon lighter than butane but lower $I_{sp}$.**

From Eq. 3.3, $I_{sp}^{max} \propto \sqrt{\dfrac{2\gamma}{(\gamma-1)}\cdot\dfrac{1}{M}}$.
The responsible group is the prefactor $\sqrt{2\gamma/(\gamma-1)}$:

| | $\gamma$ | $\sqrt{2\gamma/(\gamma-1)}$ | $M$ | $1/\sqrt{M}$ | product |
|---|---|---|---|---|---|
| Ar | 1.667 | 3.74 | 39.95 | 0.158 | 0.592 |
| n-butane | 1.09 | 5.02 | 58.12 | 0.131 | 0.659 |

Butane's low $\gamma$ buys 34 % on the prefactor and its higher molar mass costs
17 %, so it wins overall by about 11 % — which is the direction of the tabulated
56.4 s versus 69.2 s (the tabulated gap is larger still, ~23 %, because finite
$\varepsilon$ favours the low-$\gamma$ gas: a low-$\gamma$ gas has not finished
expanding at $\varepsilon = 50$ and keeps gaining, which is why butane's
$\varepsilon = 20 \to 100$ swing is 10.6 % against argon's 1.4 %).

*Physical reason:* $\gamma = c_p/c_v$ is low when the molecule has many internal
degrees of freedom. Argon is monatomic — it stores energy only in translation,
so at 300 K it holds $\tfrac32 RT$ per unit mass and that is all the nozzle can
convert. Butane is a 14-atom molecule with rotational and vibrational modes; it
holds far more enthalpy per unit $RT$, and as the gas expands and cools those
modes dump their energy back into translation and keep pushing. **The gas with
more places to store energy has more energy to give.** (The caveat is §3.7's
non-equilibrium point: at 10⁻⁵ s residence times the vibrational modes cannot
fully relax, so butane does not collect all of what this argument promises,
which is part of why polyatomic propellants sit at the bottom of the efficiency
band.)

**P4 — Missing components.**

1. **Filter**, between the isolation valve and the regulator. It prevents a
   particle from lodging on the regulator seat (leading to regulator creep and
   plenum overpressure) or on a thruster valve seat (leading to a stuck-open
   thruster, which is the failure that destroys the mission). It goes *upstream*
   of the regulator because the regulator seat is the most contamination-
   sensitive item in the chain and because it is the item you cannot power-cycle
   your way out of.
2. **Relief valve or burst disc**, on the plenum downstream of the regulator. It
   prevents a regulator that fails open from putting 300 bar into a manifold
   qualified for 5 bar, which bursts the plenum, vents the entire propellant load
   in seconds, and imparts an uncontrolled Δv and tumble.

Full credit also for noting the absence of pressure transducers (tank and
plenum) — without a plenum transducer you cannot know your thrust, which makes
the impulse bit uncalibratable — and for noting that a single isolation valve
does not satisfy the usual two-inhibit range-safety requirement.

**P5 — Vapour-pressure feed versus gaseous blowdown.**

In a gaseous blowdown, the tank pressure is set by the gas remaining:
$p = ZmRT/V$, so as mass leaves, $p$ falls, and since $\dot m \propto p_0$ and
$F \propto p_0$ (Eq. 3.10, 3.11), thrust falls in direct proportion.

In a vapour-pressure system the tank contains saturated liquid plus vapour. The
pressure is $p_{vap}(T)$, a function of temperature *only* — it does not depend
on how much liquid remains, because evaporating more liquid simply replaces the
vapour that left. Feed pressure, and therefore thrust, is constant from full
tank to the last drop.

**The exception:** a burn long enough that the latent heat of vaporization cools
the tank faster than the spacecraft can re-warm it (Eq. 3.9). Then $T$ falls,
$p_{vap}(T)$ falls with it exponentially through Clausius–Clapeyron, and thrust
decays — recovering over the tank's thermal time constant after the burn ends.
Short pulses separated by long coasts do not do this; long continuous burns do.

**P6 — 68 s continuous, 41 s pulsed, both correct.**

The 0.90 discount of Eq. 3.12 applies to steady firing. Pulsed operation loses
far more. Ranked by expected magnitude for a solenoid-class thruster:

1. **Valve transients.** During $t_r$ the valve is not at full lift, the plenum
   is feeding a partially open orifice, and the nozzle is not fully started —
   flow leaves at well below the design exit velocity. For a 5 ms pulse with a
   4 ms rise, most of the pulse is transient. This is the dominant term.
2. **Dead-volume blowdown.** The gas between seat and throat leaves after the
   command ends, at falling pressure, through an increasingly unstarted nozzle,
   and contributes mass with poor specific impulse. From WE2, that is ~23 % of
   the mass in a minimum bit.
3. **Nozzle starting transient.** A supersonic nozzle needs a finite time to
   establish the shock system and the boundary layer; before then, part of the
   diverging section is separated or subsonic and $C_F$ is well below its
   steady value. Timescale: the flow-through time plus a few boundary-layer
   development times, i.e. tens of microseconds for the gas but longer for the
   boundary layer to reach its steady thickness.
4. **Enhanced heat transfer.** Wall temperature does not follow the pulse, so a
   pulsed thruster's wall is closer to spacecraft temperature throughout,
   changing the boundary-layer state relative to the steady case.

SAFER's ~40 s implied $I_{sp}$ against a 76.8 s ideal is the flight-data
instance of exactly this [SAFER95].

**P7 — Filter placement.**

Because the regulator is more vulnerable than the thruster valves and its
failure is less recoverable. A regulator holds a seat closed against 300 bar
with a spring-loaded poppet whose sealing land is a knife edge; a particle
trapped there causes creep, which raises plenum pressure, which either lifts the
relief valve (losing propellant) or, if the relief is undersized, bursts the
plenum. A particle on a thruster valve seat causes a stuck-open thruster —
serious, but *isolable* with a latching valve on that branch if the architecture
provides one.

There is also a generation argument: the filter cannot catch what is generated
downstream of it, and the regulator itself generates particles (poppet and seat
wear). Fully protected designs therefore put a second, finer filter (or
individual screens at each thruster valve) downstream as well, which is what
most flight modules actually do. A single-filter design puts it where the
irrecoverable failure is.

**P8 — "A thruster pair wastes half the propellant."**

*Counter-argument.* A single thruster produces $\tau = FL$ **and** a net force
$F$ through the centre of mass. The torque is what you wanted; the force is a
parasitic Δv you did not. Over a mission of $N$ pulses that force integrates to a
real orbit perturbation: from WE3, 379 N·s per axis per year applied one-sidedly
to a 50 kg spacecraft is 7.6 m/s per year of unwanted Δv, in a direction fixed by
the disturbance geometry. For anything with an orbit-maintenance or
station-keeping requirement, correcting that costs more than the couple saved.
There is also a control-law argument: with a couple, the rotational and
translational channels decouple, so the attitude controller does not have to be
coordinated with the orbit controller.

*Where the reviewer is right.* When the parasitic Δv is harmless or actively
useful. The clear case is **drag makeup in low Earth orbit**: the secular
disturbance is drag-driven and always in the same body direction, so one-sided
thrusting can be oriented to counter the drag at the same time as it dumps the
momentum, doing two jobs with one propellant expenditure. Spin-stabilized
spacecraft and simple deorbit-only systems are the other cases. The general rule
[J]: use couples when the Δv budget is tight or the orbit is precise; use
one-sided control when the disturbance is one-sided and the resulting Δv is
either wanted or negligible.

### Calculation

**P9 — Argon at $\varepsilon = 40$.**

$R = 8314.46/39.948 = 208.13$ J/(kg·K).
`ideal_isp_vac(1.667, 208.13, 300, 40)` = **56.27 s**.
`ideal_isp_vac(1.667, 208.13, 250, 40)` = **51.36 s**.

Ratio $51.36/56.27 = 0.9129$. Predicted from Eq. 3.3:
$\sqrt{250/300} = 0.9129$. They agree to five figures, which they must —
$T_0$ enters only inside $\sqrt{RT_0}$ and every other factor
($\gamma$, $\varepsilon$, $p_e/p_0$) is temperature-independent for a calorically
perfect gas. **This is why a cold tank is a direct $I_{sp}$ loss** (§3.5).

**P10 — Sizing a 250 mN nitrogen thruster.**

$R = 296.80$ J/(kg·K), $\gamma = 1.400$, $\Gamma = 0.68473$.

Ideal $I_{sp}$ at $\varepsilon = 60$: `ideal_isp_vac` = 77.11 s; realized
$0.90 \times 77.11 = 69.40$ s; $c = 69.40 \times 9.80665 = 680.6$ m/s.

$$\dot m = \frac{F}{c} = \frac{0.250}{680.6} = 3.673\times10^{-4}\ \mathrm{kg/s} = \mathbf{367\ mg/s}$$

From Eq. 3.10, $A_t = \dot m\sqrt{RT_0}/(\Gamma p_0)$ with
$\sqrt{RT_0} = 298.40$ m/s:

$$A_t = \frac{3.673\times10^{-4}\times298.40}{0.68473\times6\times10^{5}} = 2.668\times10^{-7}\ \mathrm{m^2}$$

$$D_t = 2\sqrt{A_t/\pi} = \mathbf{0.583\ mm}, \qquad D_e = D_t\sqrt{60} = \mathbf{4.51\ mm}$$

*Cross-check:* $C_F$ at $\varepsilon = 60$, vacuum, $\gamma = 1.4$ is 1.7352, so
the ideal thrust is $C_F p_0 A_t = 0.278$ N; times the 0.90 discount gives
0.250 N. Consistent.

**P11 — 180 g of butane on a 4.0 kg CubeSat.**

Realized $I_{sp}$ range from §4.1: 60–70 s.
$m_0 = 4.000$ kg, $m_f = 3.820$ kg, $m_0/m_f = 1.0471$, $\ln = 0.046$.

$$\Delta v = I_{sp}g_0\ln(m_0/m_f): \quad 60\ \mathrm{s} \to \mathbf{27.1\ m/s}, \qquad 70\ \mathrm{s} \to \mathbf{31.6\ m/s}$$

Volume at $\rho_s = 0.57$ g/cm³: $180/0.57 = \mathbf{316\ cm^3}$ of liquid.

*Comment.* 316 cm³ of propellant fits in 1U (1000 cm³) with room to spare —
about 32 % fill by volume — and the balance is tank wall, ullage (you must leave
vapour space; a liquid-full tank at 2.6 bar becomes a hydraulically locked tank
that ruptures on a 10 K warm-up), valves, plenum, and electronics. A 30–50 %
propellant volume fraction is normal for a flight module and this one is
comfortably inside it. Compare GomSpace's NanoProp CGP3, which carries 60 g in a
3U bus — this design is three times more aggressive and still credible.

**P12 — Impulse bit with dead volume.**

$F_{ss} = 0.120$ N, $t_r = 6$ ms, $t_f = 9$ ms.

20 ms command, Eq. 3.13 first term:
$0.120\,(0.020 - 0.003 + 0.0045) = 0.120 \times 0.0215 = 2.580\times10^{-3}$ N·s.

8 ms command:
$0.120\,(0.008 - 0.003 + 0.0045) = 0.120 \times 0.0095 = 1.140\times10^{-3}$ N·s.

Dead volume: $R = 296.80$ J/(kg·K),

$$m_d = \frac{4\times10^{5}\times45\times10^{-9}}{296.80\times300} = 2.022\times10^{-7}\ \mathrm{kg} = 202\ \mathrm{\mu g}$$

$c = 68 \times 9.80665 = 666.9$ m/s, so $\Delta I = 2.022\times10^{-7}\times666.9 = 1.348\times10^{-4}$ N·s.

$$I_{bit}(20\ \mathrm{ms}) = 2.580 + 0.135 = \mathbf{2.715\ mN\cdot s}$$
$$MIB(8\ \mathrm{ms}) = 1.140 + 0.135 = \mathbf{1.275\ mN\cdot s}$$

Dead-volume fraction of the MIB: $0.135/1.275 = \mathbf{10.6\ \%}$.

*Comment.* Lower than WE2's 23 % because this thruster is more than twice as
powerful, so the fixed offset is a smaller share. The dead-volume tail is an
*absolute* offset, so it hurts small thrusters far more than large ones — which
is precisely the wrong way round, since small thrusters exist to give small
bits.

**P13 — Blowdown from 300 bar to 30 bar.**

Isothermal (Eq. 3.8): usable fraction $= 1 - 30/300 = \mathbf{0.900}$.
Adiabatic: $1 - (30/300)^{1/1.4} = 1 - 0.1931 = \mathbf{0.807}$.
Adiabatic final temperature: $T_f = 300\,(0.1)^{0.2857} = \mathbf{155.4\ K}$.

$I_{sp}$ scales as $\sqrt{T_0}$ (P9), so the end-of-life $I_{sp}$ under the
adiabatic bound is $\sqrt{155.4/300} = \mathbf{0.720}$ of beginning-of-life —
a 28 % loss.

*Comment.* Neither bound is the real answer. A metal tank emptying over hours or
days is close to isothermal because the wall heat capacity vastly exceeds the
gas's; a tank emptied in seconds is close to adiabatic. The value of the two
bounds is that they tell you *how much the answer can move* — here, 9 % on
usable mass and 28 % on end-of-life $I_{sp}$ — which tells you whether you need
a transient thermal model. For a 300:30 bar blowdown you do. Note also that
$Z$ falls from ~1.25 at 300 bar to ~1.01 at 30 bar, so the isothermal usable
fraction is really slightly better than 0.900; a full analysis integrates with a
real equation of state [NIST-WB].

**P14 — Limit cycle for a 120 kg spacecraft.**

$I_{bit} = 2.0\times10^{-3}$ N·s, $L = 0.4$ m, $I = 15$ kg·m²,
$\theta_{db} = 0.5° = 8.727\times10^{-3}$ rad, $I_{sp} = 70$ s
($c = 686.5$ m/s).

$$\omega_{lc} = \frac{I_{bit}L}{I} = \frac{2.0\times10^{-3}\times0.4}{15} = 5.333\times10^{-5}\ \mathrm{rad/s} = \mathbf{11.0\ {}^\circ/hr}$$

$$t_{cycle} = \frac{2\theta_{db}}{\omega_{lc}} = \frac{2\times8.727\times10^{-3}}{5.333\times10^{-5}} = \mathbf{327\ s} = 5.45\ \mathrm{min}$$

Pulses per year: $3.156\times10^{7}/327.2 = 9.643\times10^{4}$.
Propellant (two thrusters per pulse):

$$m = \frac{2 I_{bit} N}{c} = \frac{2\times2.0\times10^{-3}\times9.643\times10^{4}}{686.5} = \mathbf{0.562\ kg/yr\ per\ axis}$$

*Comment.* An order of magnitude above WE3's limit-cycle number, entirely
because $I_{bit}$ is six times larger and Eq. 3.15 is quadratic in it. Three axes
for three years is 5.1 kg — no longer negligible. Full marks require noticing
that and saying so.

**P15 — Impulse density ranking.**

$\Lambda = \rho_s I_{sp}g_0$, using §4.1 realized midpoints and tabulated
storage densities:

| gas | $\rho_s$ (kg/m³) | $I_{sp}$ (s) | $\Lambda$ (N·s/cm³) | rank |
|---|---|---|---|---|
| Xe | 2740 | 27 | **0.725** | 1 |
| R-236fa | 1360 | 40 | **0.533** | 2 |
| n-butane | 570 | 65 | **0.363** | 3 |
| Ar | 440 | 50 | **0.216** | 4 |
| N₂ | 280 | 69 | **0.189** | 5 |
| (He, for reference) | 40 | 160 | **0.063** | — |

Ranking is almost exactly the reverse of the $I_{sp}$ ranking. That is the point
of Eq. 3.18.

**The two entries I would refuse to defend.**

1. **Xenon.** Its storage density of 2.74 g/cm³ is quoted at 241 bar and 300 K,
   but xenon's critical temperature is 289.7 K, so at 300 K it is a
   *supercritical fluid* a few kelvin above $T_c$ — the region where density is
   most violently sensitive to temperature and where no simple $Z$ exists. A few
   degrees of tank warming can change the density by tens of percent. Quoting a
   single number for supercritical xenon at 300 K is not defensible without a
   real equation of state and a stated tank temperature tolerance.
2. **Helium (and, by the same argument, all the gaseous entries).** The
   storage-density column of the source table is confidence **C** and implies
   $Z \approx 0.97$ across the board — it is an ideal-gas calculation. The real
   values are 15–25 % lower for N₂, Ar and He at these pressures (§3.3). Any
   ranking built on that column is directionally right and quantitatively soft.

Credit is also given for refusing to defend n-butane or R-236fa on the grounds
that their $\gamma$ values (and hence their ideal $I_{sp}$) are flagged
confidence **C** in the source worksheet. Refusing to defend *N₂* would be
wrong: it is the best-characterized entry in the table.

**P16 — Tapping the xenon tank.**

$$I_t = m\,I_{sp}\,g_0 = 2.0 \times 27 \times 9.80665 = \mathbf{529.6\ N\cdot s}$$

Nitrogen delivering the same total impulse at 69 s:

$$m_{N_2} = \frac{529.6}{69 \times 9.80665} = \mathbf{0.783\ kg}$$

So the xenon tap costs 2.0 kg of propellant where nitrogen would cost 0.78 kg —
1.22 kg more propellant mass.

**Is the tap worth it?** Yes, and comfortably, provided the xenon is genuinely
surplus. The nitrogen alternative is not 0.78 kg; it is 0.78 kg of nitrogen
*plus* its own tank. From Eq. 3.6 with a Ti sphere,
$m_{tank} = 1.049\times10^{-5}\times0.783\times(1.25\times296.8\times300) = 0.91$ kg,
plus a fill valve, an isolation valve, a regulator or a blowdown line, a relief
device, transducers, brackets and harness — realistically 2.0–2.5 kg of added
dry mass and a second pressurant system to qualify. The xenon tap adds a
manifold tee and one valve.

**Where the argument fails, and you must say so.** (i) If the xenon is *not*
surplus, 2.0 kg of xenon is 2.0 kg not available to the Hall thruster at 1600 s,
i.e. about 31,000 N·s of forgone primary propulsion — sixty times the impulse
you just bought. Spending xenon on cold gas is defensible only for the fraction
of the load that is unusable residual, or for a genuinely small allocation.
(ii) Xenon costs on the order of a thousand dollars per kilogram; nitrogen costs
nothing. (iii) The xenon feed system runs at 100–150 bar with a flow controller
designed for milligram-per-second steady flow, not for millisecond pulses;
tapping it means either a separate low-pressure branch with its own regulator —
which erases much of the simplicity argument — or accepting large blowdown
variation. [J] My recommendation: tap it for the residual and for coarse
attitude control, but do not budget the mission's Δv against it.

### Engineering reasoning

**P17 — Plenum droop with smooth tank decay, recovering in 20 minutes.**

**Diagnosis: Joule–Thomson freeze-down of the regulator** (§3.4, §7.2). The
evidence chain:

- The *tank* pressure decays smoothly with no inflection — so the propellant is
  leaving at the expected rate and there is no upstream blockage or leak.
- The *plenum* is flat for 60 s, then droops — a thermal time constant, not a
  hydraulic one. Sixty seconds is far too long for a flow transient and about
  right for a small stainless regulator body to be cooled by the throttled gas.
- Recovery in ~20 minutes *after the flow stops* is the giveaway. Nothing
  hydraulic recovers when the flow stops; a thermal mass re-warming by
  conduction from the mounting structure does, and its time constant is minutes
  to tens of minutes.

Nitrogen at 300 K is well below its inversion temperature (~620 K), so throttling
from 300 bar to 5 bar cools it, and the regulator body follows. As the seat and
the reference spring cool, the spring rate and the seal's compression set both
change, and the regulated set point drifts down.

**Confirming measurement.** A thermocouple or RTD bonded to the regulator body,
logged with the plenum transducer. If the diagnosis is right, the body
temperature falls with the same 60 s onset and the same ~20 min recovery time
constant as the pressure, and the two traces are collinear when plotted against
each other. A second confirmation: repeat the firing with the regulator wrapped
in insulation — the droop should get *worse* (less conduction from structure),
which distinguishes it from any mechanism that depends on flow.

**Fix.** In order of cost: (1) a 1–2 W heater patch on the regulator body with a
thermostat, which is nearly always sufficient; (2) improve the conductive path
to the (warm) structure by changing the mount, which costs nothing but is often
enough on its own; (3) requalify the seals to the observed minimum temperature,
or move to a metal-seated regulator; (4) if the mission profile permits, break
long burns into segments and let the regulator re-warm between them.

*Wrong answers that look right:* "regulator droop with flow" — droop is
instantaneous with flow and does not recover slowly afterwards. "Tank cooling" —
the tank pressure trace shows no inflection, and tank cooling would show up as
tank pressure falling *faster* than mass depletion predicts.

**P18 — Bimodal impulse-bit histogram, 78 % at 0.42, 22 % at 0.26 mN·s.**

**What is happening: the valve is on the edge of its full-lift threshold.** The
commanded pulse width is close to the solenoid's pull-in time, so on most pulses
the armature reaches the stop and the thruster delivers full $F_{ss}$ for the
remainder of the command (0.42 mN·s), and on the rest it does not — the armature
travels partway, the orifice is throttled, and the pulse delivers a smaller,
poorly repeatable bit (0.26 mN·s). Constant plenum pressure rules out a feed
cause; the sharp bimodality with almost nothing between rules out a continuously
varying parameter and points to a bistable mechanical event, which is what
armature seating is.

The underlying variable is almost certainly pull-in time, which moves with coil
temperature (copper resistance rises ~0.4 %/K, reducing current for a fixed drive
voltage), with drive voltage, and with the differential pressure holding the
poppet shut. A test sequence with rising duty cycle will heat the coil
progressively, and the fraction in the low mode should grow through the run —
check the ordering of the two populations against time before doing anything
else.

**What I would change first.** Increase the commanded pulse width and re-run,
mapping $I_{bit}$ against $t_{on}$ from well below to well above the current
setting. There will be a knee: below it the bit is bimodal and scattered, above
it the bit is unimodal and linear in $t_{on}$. **Set the MIB at least 1.5 ms
above the knee** and accept the larger minimum bit. Only if that MIB fails the
pointing requirement do you go after the valve — with a higher drive voltage or
a peak-and-hold driver, which shortens and stabilizes pull-in at no cost in
hardware.

**Expected histogram afterwards.** Unimodal, approximately Gaussian, standard
deviation of a few percent of the mean, mean larger than 0.42 mN·s in proportion
to the increased $t_{on}$. If it is still bimodal after moving well past the
knee, the mechanism is not pull-in and you should look at the seat (intermittent
contamination) or at the drive electronics.

**P19 — Refrigerant thrust decaying 48 → 31 mN over a 200 s burn, recovering in 12 min.**

**Mechanism: self-refrigeration of the saturated propellant, governed by
Eq. 3.9.** Evaporating liquid to feed the thruster removes latent heat from the
tank at a rate $\dot m\,\Delta h_{vap}$. With no heater, that energy comes out of
the thermal mass of the liquid and the tank wall, so the tank temperature falls,
and because vapour pressure follows Clausius–Clapeyron,
$d\ln p_{vap}/dT = \Delta h_{vap}/(RT^2)$, the feed pressure falls exponentially
in $-1/T$. Thrust is proportional to feed pressure (Eq. 3.10, 3.11), so a 35 %
thrust decay corresponds to a 35 % pressure decay, and with a typical
refrigerant's $\Delta h_{vap}$ that is on the order of 10–15 K of tank cooling.
The 12 minute recovery is the tank re-warming to the bus temperature by
conduction and radiation — a purely thermal time constant, which is why it is the
same after every long burn and independent of how much propellant is left.

The diagnostic that distinguishes this from every other cause: **the recovery
happens with no propellant flow and no commands**, and the tank pressure recovers
to its *original* value, not to a lower one. A leak would not recover; a
blockage would not recover on a thermal time constant; a blowdown would never
recover at all.

**Two design changes and their costs.**

1. **A tank heater with a thermostat**, sized to replace $\dot m\,\Delta h_{vap}$
   during the burn. For 200 s at the module's flow rate this is a few watts. Cost:
   power during the burn — which for a CubeSat is a real constraint and directly
   competes with the payload; plus the heater, the thermostat, the harness, and a
   thermal model to size it.
2. **Segment the burn.** Break the 200 s manoeuvre into, say, eight 25 s burns
   separated by 12 minute coasts. Cost: the manoeuvre now takes two hours instead
   of three minutes, which spreads it over a significant arc of the orbit and
   degrades the Δv pointing accuracy; and it complicates the sequence and the
   navigation solution. Free in hardware, expensive in operations.

Also acceptable: increase the tank's thermal mass or conductive coupling to a
warm bus panel (cheap, but limited authority); or accept the decay and *model*
it in the burn planner so that the commanded burn duration is corrected — which
costs nothing but requires a calibrated thermal model and gives up on
closed-loop simplicity.

**P20 — Reconciling 80 s and 73 s for "nitrogen cold gas".**

In order:

1. **Is one of them ideal and the other measured?** This is the question that
   resolves this particular pair, and it resolves it immediately: 73/80 = 0.91,
   which is exactly the realization ratio of Eq. 3.12. The verification
   worksheet's cross-check against a published cold-gas table found precisely
   this pairing — 80 theoretical, 73 measured — and a ~0.91 ratio across the
   whole table. **Ask this first.**
2. **What expansion ratio?** For nitrogen the $\varepsilon = 20 \to 100$ spread
   is only 75.1 → 77.8 s, so $\varepsilon$ alone cannot explain a 7 s gap — but
   it must be pinned down before any comparison is meaningful, and for a
   low-$\gamma$ propellant it would explain a gap this size on its own.
3. **What stagnation temperature?** $I_{sp} \propto \sqrt{T_0}$, so 80 s at
   300 K becomes 76.3 s at 273 K. Cold-gas tables are quoted at 0 °C at least as
   often as at 300 K, and that alone is 4.6 %.
4. **Vacuum or sea level?** A cold-gas nozzle at $\varepsilon = 50$ tested at
   ambient is separated and delivers dramatically less; conversely a
   "sea-level-corrected" number computed to vacuum by adding $p_e\varepsilon/p_0$
   without checking for separation is optimistic.
5. **Continuous or pulsed?** If one figure is a pulsed-duty average it can be
   40–70 % of ideal (P6), which would explain a far larger gap than this one.
6. **Was $g_0$ or local $g$ used, and is the number really in seconds?** Rare,
   but it happens in older and in translated sources.

The general lesson, and the reason the worksheet insists on it: **a cold-gas
$I_{sp}$ without $T_0$, $\varepsilon$, and "ideal or measured" attached is not a
number, it is a rumour.**

---

## K3. Trade-study reference solution

### P21 — 12U technology demonstrator: propellant selection

**Reference assumptions** (a strong answer states its own and they need not
match these exactly, but they must be stated):

- Spacecraft wet mass 14 kg; treat it as constant for Δv purposes and use the
  rocket equation with $m_f = 14$ kg (conservative).
- Realized $I_{sp}$: N₂ 69 s, n-butane 65 s, R-236fa 40 s, R-134a warm 82 s
  (§4.1).
- Minimum impulse bit: 0.33 mN·s for a conventional solenoid (WE2 class);
  0.05 mN·s for a microvalve module of the VACCO/GomSpace class. This
  distinction matters more than the propellant choice, and a strong answer says
  so.
- Tank volume allocation: about 2000 cm³ of the 3000 cm³ envelope, the rest
  being valves, plenum, electronics and structure.
- Mission 2 years; $\theta_{db} = 0.5° = 8.727\times10^{-3}$ rad;
  $I = 0.35$ kg·m²; $L = 0.11$ m.

**Step 1 — Option (a), GN₂ at 12 bar, dies immediately on the pressure cap.**

$$\rho_s = \frac{p}{ZRT} = \frac{12\times10^{5}}{1.0\times296.8\times293} = 13.8\ \mathrm{kg/m^3}$$

The entire 2000 cm³ allocation holds **27.6 g** of nitrogen, worth
**18.7 N·s** of total impulse. The Δv requirement alone needs about 357 N·s.
Option (a) is short by a factor of nineteen. Gaseous storage is viable only at
150–300 bar, and the rideshare provider has forbidden that without a COPV
qualification the schedule cannot absorb. **Rejected: the binding constraint is
the 12-bar cap, and it is fatal, not marginal.**

This is the most important single result of the trade and a strong answer leads
with it. The pressure cap does not disadvantage gaseous storage; it eliminates
it.

**Step 2 — The attitude-control requirement as written cannot be met by cold gas
at all, and the correct response is to challenge it.**

Taking the 1.5 μN·m as fully secular on all three axes for 2 years (Eq. 3.16):

$$H = 1.5\times10^{-6}\times6.311\times10^{7} = 94.7\ \mathrm{N\cdot m\cdot s\ per\ axis}$$

$$I_t = \frac{2H}{2L}\times2 = \frac{H}{L}\times... = 861\ \mathrm{N\cdot s\ per\ axis} \Rightarrow \mathbf{2582\ N\cdot s\ for\ three\ axes}$$

At butane's 65 s that is **4.05 kg of propellant, 7100 cm³** — more than twice
the entire 3U propulsion allocation, before a single metre per second of Δv.
**No propellant on the table closes this**; R-236fa would need 6.6 kg and
4800 cm³, and the warm R-134a option 3.2 kg and 2700 cm³ with a power budget it
does not have.

The correct engineering response is not to pick the least-bad propellant. It is
to observe that **a 550 km sun-synchronous orbit has a magnetic field**, and that
magnetorquers dump secular momentum at zero propellant cost, which is why
essentially every LEO CubeSat carries them. It is also to observe that the
dominant component of a 1.5 μN·m disturbance on a nadir- or sun-pointing 12U is
gravity-gradient and aerodynamic, both of which are largely *cyclic* over an
orbit and therefore do not accumulate secularly at all — so 1.5 μN·m is almost
certainly a peak, not a secular mean, and budgeting it as secular over-sizes the
system by an order of magnitude.

**A recommendation that does not raise this point should not receive more than
half marks on the trade study, regardless of how well the arithmetic is done.**

**Step 3 — Re-budget with magnetorquers handling secular momentum.**

Cold gas is then responsible for the Δv and the limit cycle.

*Δv, 25 m/s against $m_f = 14$ kg* (`propellant_for_dv`):

| option | $I_{sp}$ (s) | $m_p$ (kg) | $\rho_s$ (kg/m³) | volume (cm³) |
|---|---|---|---|---|
| (b) n-butane | 65 | 0.560 | 570 | 982 |
| (c) R-236fa | 40 | 0.921 | 1360 | 677 |
| (d) R-134a warm | 82 | 0.442 | 1190 | 371 |

*Limit cycle, 3 axes, 2 years* (Eq. 3.15), microvalve MIB 0.05 mN·s:
$\omega_{lc} = 1.571\times10^{-5}$ rad/s, $t_{cycle} = 1111$ s,
5.68 × 10⁴ pulses per axis over two years:

- at 65 s: 0.027 kg for three axes
- at 40 s: 0.043 kg for three axes

Negligible. But **with a conventional solenoid at 0.33 mN·s the same calculation
gives 1.17 kg** — twice the Δv propellant — because Eq. 3.15 is quadratic in the
impulse bit. Valve selection, not propellant selection, decides whether the
limit-cycle line matters.

*Totals:*

| option | propellant (kg) | volume (cm³) | fits 2000 cm³? | binding constraint |
|---|---|---|---|---|
| (a) GN₂ 12 bar | — | 25,900 for Δv alone | **no, by 13×** | storage pressure cap |
| (b) n-butane | 0.587 | 1029 | **yes**, 51 % fill | flammability review |
| (c) R-236fa | 0.964 | 709 | **yes**, 35 % fill | $I_{sp}$ (mass) |
| (d) R-134a warm | ~0.49 | ~412 | **yes**, 21 % fill | electrical power |

**Step 4 — Option (d) fails on power, and it fails in an instructive way.**

15 W during firing against a 12 W average / 20 W peak bus is not a hard
violation — you can fire within the 20 W peak if the payload is off and the burn
is short. But three things kill it. (i) The Δv manoeuvre is a continuous burn of
several minutes at 15 W, which exceeds the *average* available power and must
therefore be drawn from the battery and segmented, negating much of the
efficiency gain in operations. (ii) A resistojet has a warm-up transient of
seconds; every attitude-control pulse would either be cold (giving ~45 s, not
82 s) or would require pre-heating, which multiplies the energy cost per pulse by
orders of magnitude. In practice a warm-gas module is used *warm for Δv and cold
for attitude control*, so the 82 s applies to only the Δv line. (iii) It adds a
heater, a controller, thermal isolation and a qualification programme, on a
technology demonstrator whose schedule is already the driving constraint.

Recomputing (d) honestly — 82 s for Δv, ~45 s cold for the limit cycle — gives
0.442 + 0.039 = 0.48 kg, saving 0.11 kg over butane, for 15 W and a new
subsystem. **Rejected on power and complexity, not on performance.**

### Recommendation

**Recommend (b), n-butane, self-pressurizing at ~2.6 bar, with a microvalve
thruster module and magnetorquers for secular momentum management.**

Justification:

1. It satisfies the 12-bar cap with a factor-of-four margin, so the pressure
   vessel is a low-pressure welded can and there is no COPV qualification and no
   schedule risk. This is the constraint that killed option (a) and it is the
   constraint the mission is actually built around.
2. It has the best $I_{sp}$ of any option compatible with that cap, so it carries
   the largest Δv reserve for a fixed volume: 0.587 kg in 1029 cm³ leaves nearly
   1000 cm³ of the tank allocation spare, which at 570 kg/m³ is another 0.57 kg
   and roughly 25 m/s of growth margin — real insurance on a technology
   demonstrator whose Δv requirement will grow.
3. Self-pressurizing feed means constant thrust with no regulator, no relief
   valve and no high-pressure isolation valve — three components, three failure
   modes and roughly half a kilogram removed.
4. It is flight-proven at this exact scale and architecture (GomSpace NanoProp on
   TW-1 in 2015 and GOMX-4B in 2018), which for a technology demonstrator on a
   fixed schedule is worth more than any of the above.

**Against the runner-up, (c) R-236fa.** R-236fa is denser and non-flammable, and
its 709 cm³ leaves more volume margin. It loses on propellant mass — 0.964 kg
against 0.587 kg, i.e. 2.7 % of the spacecraft's wet mass given away — and, more
importantly, on *growth*: at 40 s, the spare tank volume converts to Δv at only
60 % of butane's rate. For a mission whose stated requirement is a 25 m/s phasing
manoeuvre, i.e. a mission with a real Δv line, the higher $I_{sp}$ is the right
purchase.

**What would change the recommendation.**

- **If the rideshare provider or the primary payload objects to a flammable
  propellant**, switch to (c) immediately. This is a review-schedule question, not
  a technical one, and it is exactly the question MarCO answered in favour of
  R-236fa. Ask it in the first week, not the last.
- **If the volume allocation drops below about 1200 cm³** for the tank, butane no
  longer fits with useful margin and (c) becomes the only option that does.
- **If the Δv requirement grows beyond about 45 m/s**, no low-pressure
  liquefiable propellant closes in 3U and the trade reopens as
  "warm gas versus a COPV waiver versus a green monopropellant."
- **If magnetorquers cannot be accommodated** — an unlikely but not impossible
  outcome for a magnetically sensitive payload — then no cold-gas option closes
  and the propulsion system cannot meet the attitude requirement as written. The
  requirement must be renegotiated or reaction wheels added.
- **If the selected thruster module's MIB is solenoid-class rather than
  microvalve-class**, the limit-cycle line jumps from 0.03 kg to 1.17 kg and
  butane's volume margin evaporates. Verify the MIB with the supplier before
  committing; do not take it from a datasheet's "typical" column.

### Rubric

**A strong answer must contain:**

- The observation that option (a) is eliminated by the 12-bar cap, with the
  storage-density arithmetic that shows it is eliminated by an order of
  magnitude, not marginally (20 marks).
- Correct rocket-equation propellant masses and correct volumes from the storage
  densities, for at least three options (20 marks).
- A limit-cycle calculation using Eq. 3.15, with an explicitly stated assumed
  MIB, and the observation that the result is quadratic in the MIB (15 marks).
- The challenge to the disturbance-torque requirement — recognizing that
  rejecting 1.5 μN·m secularly on three axes for two years is beyond any
  cold-gas system in this volume, and naming magnetorquers and/or the
  cyclic-versus-secular distinction as the resolution (20 marks).
- A defensible recommendation with an explicit comparison against the runner-up
  and at least three named conditions that would change it (15 marks).
- Correct units throughout, and every $I_{sp}$ figure tagged as ideal or realized
  (10 marks).

**Loses marks for:**

- Recommending helium or any gaseous propellant without addressing the pressure
  cap (automatic fail of the volume analysis).
- Selecting on $I_{sp}$ alone, i.e. reproducing the ranking of §4.1 and choosing
  the top entry that is liquefiable, without computing volumes.
- Budgeting the 1.5 μN·m disturbance without comment, arriving at a number that
  does not fit, and then declaring the mission infeasible without proposing the
  standard resolution.
- Using ideal $I_{sp}$ values from §4.1 without the realization discount (a
  systematic 10 % optimism throughout).
- Quoting a Δv without stating the mass it was computed against.
- Choosing (d) without a power-profile analysis; the option is not
  *technically* infeasible, and an answer that rejects it purely on "15 > 12"
  has not engaged with peak versus average power or with the cold-pulse /
  warm-burn split that real warm-gas modules use.

---

## K2. Quiz answers

**Q1 (8) — (b) $\sqrt{T_0/M}$.**
From Eq. 3.3, $c_{max} = \sqrt{2\gamma/(\gamma-1)\cdot R_uT_0/M}$; $T_0$ and $M$
appear only inside the square root, in that ratio.
(a) is wrong on the sign of the $M$ dependence — heavier gas gives *less*
$I_{sp}$, not more. (c) $T_0/M$ is the group that appears *inside* the root and
is the classic dropped-square-root error; it would predict that halving $M$
doubles $I_{sp}$, whereas it actually multiplies it by 1.41. (d) is wrong
because $p_0$ does not appear in $I_{sp}$ at all for an ideal expansion —
chamber pressure sets thrust and mass flow, not specific impulse. (Note that
$\gamma$ also matters through the prefactor; the question asks which *group* it
is proportional to, and the $\gamma$ prefactor is a separate factor.)

**Q2 (8) — (b) leaves it unchanged.**
Eq. 3.6: $m_{tank}/m_p = \tfrac32(\rho_m/\sigma_{allow})ZRT$, with no $p$. The
membrane mass is fixed by the stored $pV$ product, and $pV$ is fixed by the
propellant load. What halves is the volume.
(a) is the intuitive and wrong answer — it confuses volume with mass. (c) and (d)
are wrong in the other direction; (c) would be right if wall thickness scaled
with pressure at fixed *volume*, which is not the case here because the volume
is not fixed. Half credit for (c) with an explicit argument that $Z$ rises with
pressure, since the true answer is "unchanged, plus a ~20 % penalty from $Z$."

**Q3 (10) — helium warms; the others cool.**
Governing property: the Joule–Thomson coefficient
$\mu_{JT} = (\partial T/\partial p)_h$ (Eq. 3.7). Numerical criterion: the gas
cools on throttling if its temperature is **below** its maximum inversion
temperature, and warms if above. Approximate maximum inversion temperatures:
He ≈ 40 K, N₂ ≈ 620 K, Ar ≈ 720 K, CO₂ ≈ 1500 K. At 300 K, helium alone is
above its inversion temperature, so $\mu_{JT} < 0$ and it warms; N₂, Ar and CO₂
are all below theirs, so they cool. Full marks require both the property and the
criterion; naming helium alone is worth 4.

**Q4 (12) — helium through a 0.25 mm throat.**

$R = 8314.46/4.003 = 2077.06$ J/(kg·K); $\gamma = 1.667$, so
$\Gamma = 0.72680$; $\sqrt{RT_0} = \sqrt{2077.06\times300} = 789.4$ m/s.
$A_t = \tfrac\pi4(0.25\times10^{-3})^2 = 4.909\times10^{-8}$ m².

$$\dot m = \frac{0.72680\times4\times10^{5}\times4.909\times10^{-8}}{789.4} = 1.806\times10^{-5}\ \mathrm{kg/s} = \mathbf{18.1\ mg/s}$$

$I_{sp}$: ideal 178.06 s at $\varepsilon = 50$; §4.1's realized band is
150–165 s, and Eq. 3.12's 0.90 discount gives 160.3 s.

$$F = \dot m\,I_{sp}\,g_0 = 1.806\times10^{-5}\times160.3\times9.80665 = 0.0284\ \mathrm{N} = \mathbf{28.4\ mN}$$

Marks: 4 for $\Gamma$ and $A_t$, 4 for the mass flow, 4 for the thrust with the
discount applied. Using the ideal 178 s loses 2 (answer 31.5 mN).

**Q5 (10) — impulse bit, 40 mN, $t_r$ = 5 ms, $t_f$ = 8 ms, 12 ms command.**

$$I_{bit} = F_{ss}\left(t_{on} - \tfrac{t_r}{2} + \tfrac{t_f}{2}\right) = 0.040\,(0.012 - 0.0025 + 0.004) = 0.040\times0.0135 = \mathbf{0.540\ mN\cdot s}$$

Compare $F_{ss}t_{on} = 0.040\times0.012 = 0.480$ mN·s. The actual bit is
**12.5 % larger**, because the fall time (8 ms) exceeds the rise time (5 ms):
the valve keeps flowing for longer after the command ends than it takes to reach
full thrust after the command begins. A design that used $F_{ss}t_{on}$ would
systematically under-deliver its commanded attitude corrections by 12.5 %, which
a closed-loop controller would absorb at a cost in propellant and an open-loop
sequence would not absorb at all.

**Q6 (12) — limit cycle, $I$ = 5 kg·m², $L$ = 0.3 m, MIB 1.0 mN·s, ±0.75°.**

$$\omega_{lc} = \frac{I_{bit}L}{I} = \frac{1.0\times10^{-3}\times0.3}{5} = 6.00\times10^{-5}\ \mathrm{rad/s} = \mathbf{12.4\ {}^\circ/hr}$$

$\theta_{db} = 0.75° = 0.013090$ rad, so
$t_{cycle} = 2\times0.013090/6.00\times10^{-5} = 436.3$ s (7.3 min), giving
$3.156\times10^{7}/436.3 = 7.232\times10^{4}$ pulses per year.
With $c = 65\times9.80665 = 637.4$ m/s and two thrusters per pulse:

$$m = \frac{2\times1.0\times10^{-3}\times7.232\times10^{4}}{637.4} = \mathbf{0.227\ kg/yr\ per\ axis}$$

Marks: 4 for $\omega_{lc}$ (including the degrees-per-hour conversion), 4 for the
pulse count, 4 for the propellant. Forgetting the factor of two for the second
thruster of the pair loses 3 and is the most common error.

**Q7 (10) — MarCO's choice of R-236fa.**

Any two of the following, each with its number:

- **Storage density: 1360 kg/m³ against nitrogen's ~250–280 kg/m³ at 241 bar**,
  a factor of about five. MarCO's 755 N·s needs 1.92 kg of R-236fa in 1.4 L; the
  same impulse in nitrogen is 1.11 kg in about 4.1 L of tank internal volume.
  A 6U CubeSat is 10 L in total, and the propulsion module occupied a fraction
  of that.
- **Storage pressure: 2.7 bar against ~240 bar**, a factor of ninety. That is
  the difference between a welded aluminium can and a composite-overwrapped
  pressure vessel with a fracture-control programme, a proof-and-burst campaign,
  and a launch-safety review that a rideshare secondary payload's schedule
  cannot absorb.
- **Component count**: vapour-pressure feed eliminates the regulator, the relief
  valve and the high-pressure isolation valve outright.
- **Impulse density** (Eq. 3.18): 0.53 N·s/cm³ against nitrogen's 0.19 — R-236fa
  delivers 2.8 times the impulse per unit of tank volume despite 58 % of the
  specific impulse.

Answers that only say "it is denser" without a number score 4. Answers that say
"it has higher $I_{sp}$" score zero and reveal that the entire point of the
module has been missed.

**Q8 (10) — the impossible density pair.**

**What is wrong:** at fixed temperature, the density of a single-phase fluid
increases monotonically with pressure. A table that lists 0.28 g/cm³ at 241 bar
and 0.25 g/cm³ at 300 bar for the same gas at the same temperature is
thermodynamically impossible; it violates the requirement that the isothermal
compressibility be positive, which is a stability condition, not an
approximation.

**What it tells you about how they were produced:** the numbers are not from a
consistent equation of state. Back out the implied $Z$ from
$Z = p/(\rho RT)$: at 241 bar and 300 K, $Z = 0.97$; the real value is about 1.2.
The figures are essentially ideal-gas values, recalled or transcribed from
different sources at different (unstated) temperatures. The source file itself
labels the column confidence **C** and `NEEDS PRIMARY`, which is the correct
disposition.

**What to do before using either:** get real densities from [NIST-WB] or
[REFPROP] at the actual fill pressure *and* the actual fill temperature — noting
that fill temperature is not ambient, because compressing a gas into a tank
heats it, and the load you get depends on the tank's temperature when the fill
valve closes. Use the tabulated column only for ranking gases against each
other, never for sizing a tank.

Full marks require all three parts. Noticing the impossibility alone is worth 4.

**Q9 (10) — no relief valve downstream of the regulator.**

*Failure sequence.* A particle lodges on the regulator seat, or the poppet
galls, or the reference diaphragm tears — any of which leaves the regulator
unable to close. Tank pressure (up to 300 bar) is now applied to a plenum and
distribution manifold designed and proof-tested for a few times the 5 bar
regulated pressure. The manifold, a weld, a fitting or a thruster-valve body
bursts. The entire propellant load vents in seconds through the rupture, which
is an uncontrolled, off-axis, high-thrust impulse: the spacecraft acquires a
large Δv in an arbitrary direction and a body rate far beyond what the attitude
control system could null even if it still had propellant, which it does not.
Fragments from the burst may sever harness or damage adjacent hardware. The
vehicle is lost.

*Sizing requirement.* The relief device must be able to pass the **full mass
flow that the failed-open regulator can deliver at maximum tank pressure**,
while holding the plenum below its maximum design pressure — not merely relieve
a slow creep. That means sizing its flow area against the choked flow through
the regulator's own maximum open area at full tank pressure, with the relief
device's set point below the plenum's proof pressure and its full-flow pressure
below the plenum's burst pressure. A burst disc sized for creep relief only is a
common and serious design error. Note also that a relief valve that reseats is
preferable to a burst disc, which vents the whole load once opened.

**Q10 (10) — reaction wheels instead of cold gas.**

*What wheels eliminate.* The **slew** line and the **limit-cycle** line — 59 %
and 5 % of WE3's budget, or 64 % in total. Wheels exchange momentum with the
spacecraft body internally, so a slew costs electrical energy and no propellant,
and attitude holding inside a deadband costs nothing at all because a wheel can
apply an arbitrarily small, continuously variable torque with no minimum impulse
bit. That last point is the deeper one: wheels have no MIB, so Eq. 3.15 does not
apply to them, and pointing performance improves by orders of magnitude at the
same time as the propellant bill falls.

*What wheels do not eliminate.* The **secular disturbance** line — 36 % of WE3's
budget. A wheel absorbs momentum; it does not destroy it. Under a constant
external torque the wheel spins up until it saturates, and the accumulated
momentum must then be dumped to something outside the spacecraft: thrusters, or
magnetorquers if there is a usable magnetic field. In WE3's orbit magnetorquers
would work and the propellant bill would fall essentially to zero; in
geostationary orbit, in deep space, or around a body with no field, the momentum
dump is a thruster job and 36 % of the budget survives. Wheels also add mass
(typically 0.2–1 kg each, and you need three or four), power, exported vibration
at the wheel frequency, and a wear-out failure mode with a finite bearing life.

*When the substitution stops paying.* Wheels win when the *time-integrated
control effort* is large enough that the propellant they save exceeds the mass
they add. Roughly [J]: a wheel set of 1–3 kg replaces about 0.9 kg/yr of slew
propellant plus 0.07 kg/yr of limit-cycle propellant in WE3, so it pays back in
about 1–3 years for an agile spacecraft and never for a mission of a few months.
It stops paying when the mission is short, when the spacecraft is small enough
that the wheel set is a large fraction of the dry mass (below roughly 5–10 kg
this bites hard, which is why 1U and 3U CubeSats often go without), when the
slew requirement is absent, or when there is no external torque source available
for momentum dumping and the thrusters have to be carried anyway — in which case
you have paid for both systems. The judgment: **wheels are bought for pointing
performance and agility first, and propellant second; a programme that justifies
them on propellant alone usually finds the payback period is longer than the
mission.**

---

## K4. Common wrong answers and what they reveal

**"Helium is the best cold-gas propellant."**
Reveals that the student has read the $I_{sp}$ column and stopped. It is the
single most common error on this material. The diagnostic follow-up: ask them to
compute the tank mass with Eq. 3.6. The step they are missing is not arithmetic,
it is the recognition that a cold-gas system's mass is dominated by a component
that does not appear in the rocket equation.

**Storing at higher pressure "to save tank mass."**
Reveals a confusion between mass and volume, and an unfamiliarity with the fact
that pressure vessel mass scales with $pV$. Worth probing further, because the
same confusion produces wrong answers about pressurant tanks in Module 12 and
about COPV sizing generally.

**Dropping the square root: "halving the molar mass doubles $I_{sp}$."**
Reveals that Eq. 3.3 has been memorized as a proportionality rather than
derived. The correction is to make them derive it from the steady-flow energy
equation once; students who have done the derivation do not make this error
again.

**Computing the impulse bit as $F_{ss}t_{on}$.**
Reveals that the valve has been treated as an ideal switch. Typically 10–40 %
low, and always in the same direction when $t_f > t_r$, which is the usual case.
The deeper problem is that such a student has no model of *where* impulse-bit
scatter comes from, and will therefore not be able to diagnose P18.

**Forgetting the factor of two for the second thruster of a couple.**
Reveals that the student has computed torque correctly and then budgeted
propellant against the torque rather than against the mass flow. Costs a factor
of two on every attitude-control propellant estimate. Catch it by asking how many
valves opened.

**Treating every disturbance torque as secular.**
Reveals inexperience rather than misunderstanding, and it is the single most
expensive error in a real preliminary design because it over-sizes the propellant
by an order of magnitude and can drive a programme to reject a viable
architecture. The correction is to ask, for each disturbance, "does this torque
have the same sign in inertial space one orbit from now?"

**Quoting a Δv with no reference mass.**
Reveals that the student thinks Δv is a property of a propulsion system. It is a
property of a propulsion system *and* a spacecraft. This is the error behind the
MMU inconsistency (§6.1) and behind the two different published MarCO Δv figures
(§6.3), and a student who has internalized it will catch both without prompting.

**Confusing Joule–Thomson cooling with nozzle expansion cooling.**
Reveals that "isenthalpic" and "isentropic" are being used interchangeably.
Diagnostic: ask what happens to helium in each. A student who says helium warms
in the nozzle has the concepts genuinely inverted; a student who says helium
cools in both has simply not met Joule–Thomson.

**Using ideal $I_{sp}$ throughout without the realization discount.**
Reveals a habit rather than an error of understanding, but it produces a
systematic 10 % optimism in every propellant mass, which compounds with the
20 % $Z$ error into a 30 % undersized system. In pulsed operation the same habit
produces a 45 % error. Insist on the tag "ideal" or "realized" attached to every
$I_{sp}$ figure written down.

**Declaring cold gas "too simple to need analysis."**
Reveals that the student has counted components rather than traced couplings.
The cure is P21: a trade with four options in which the winning argument turns on
a rideshare provider's pressure cap, and the correct recommendation requires
challenging a requirement rather than answering it.
