# Part IV Exam — Answer Key
Cold-gas thrusters, modules 28–31 · 100 points

Every number below was computed with `tools/rocket.py` and is registered in
`tools/examples/exam-part4.py`. Constants: $g_0 = 9.80665$ m/s²,
$R_u = 8314.46$ J/(kmol·K). Nitrogen $R = 296.797$ J/(kg·K), $\gamma = 1.400$,
$\Gamma = 0.684731$. R-236fa $R = 54.686$ J/(kg·K), $\gamma = 1.08$,
$\Gamma = 0.624$.

**How to grade.** Method first. A correct setup with an arithmetic slip loses at
most 30 % of the marks for that part. A right number from a wrong setup scores
zero. Marks explicitly attached below to *stating an assumption*, *naming a
confidence label*, or *saying what would change the answer* are not decoration:
this course's failure mode is students who can compute and cannot judge.

---

# Section A — Principles and gas selection (20 marks)

## A1 — Multiple choice (5 marks, 1 each)

### A1.1 — **(b) 39 s**

`ideal_isp_vac(gamma=1.667, R=99.22, T0=300, eps=50)` = **38.92 s** for krypton
($\mathcal{M} = 83.798$ kg/kmol, $R = 8314.46/83.798 = 99.22$ J/(kg·K)).

*Why the distractors are wrong.*
(a) 26 s is realized **xenon**, not ideal krypton — a factor confusion between
two heavy monatomics and between ideal and realized.
(c) 56 s is **argon** at $\varepsilon = 50$; picking it means reading the wrong
row, or estimating $1/\sqrt{\mathcal{M}}$ from argon without carrying the
molar-mass ratio properly.
(d) 77 s is nitrogen — the number students reach for when they have not
internalised that $I_{sp} \propto \sqrt{T_0/\mathcal{M}}$ punishes a
84 kg/kmol gas by $\sqrt{28/84} = 0.58$.

### A1.2 — **(b) xenon is higher by about 1.4×**

$\rho I_{sp} g_0$: xenon $2740 \times 31.1 \times 9.80665 = 8.36\times10^{5}$
N·s/m³ = **0.836 N·s/cm³**; R-236fa
$1360 \times 43.2 \times 9.80665 = 5.76\times10^{5}$ = **0.576 N·s/cm³**.
Ratio **1.45 in xenon's favour**.

*Why the distractors are wrong.* (a) and (d) invert the ranking — the trap is
assuming that because xenon has the worst $I_{sp}$ in the table it must have
the worst impulse density; it has the *best*, because 2.74 g/cm³ beats
1.36 g/cm³ by more than 43.2 s beats 31.1 s. (c) would require the density
ratio and the $I_{sp}$ ratio to cancel, which they nearly do for helium versus
R-236fa but not here.

**Grading note.** A student who picks (b) *and* adds that xenon is still the
wrong choice — cost, a 241-bar vessel, and the fact that you do not spend a
precious-metal-priced propellant on limit cycling — should be given the mark
plus a nod. That is the Level 3 answer.

### A1.3 — **(c) toxic, attacks copper alloys, condenses on optics**

*Why the distractors are wrong.* (a) 10.6 bar is a low-pressure can, not a
COPV — an order of magnitude below the ~100 bar threshold that drags in a
qualification programme. (b) $\gamma = 1.31$ is perfectly ordinary and gives a
$C_F$ between the diatomics and the refrigerants; ammonia's 104.7 s is the
*best* liquefiable figure in the table, so a thrust-coefficient objection is
self-contradicting. (d) 0.60 g/cm³ is comparable to butane's 0.57 and is
entirely usable; ammonia loses on chemistry, not on physics.

### A1.4 — **(c) supercritical fluid requiring a real equation of state**

$T_c(\mathrm{Xe}) = 289.7$ K, so at 300 K there is no liquid phase at any
pressure and the fluid is supercritical. (a) and (b) require $T < T_c$. (d) is
wrong in the opposite direction: $T/T_c = 1.04$ and $p/p_c \approx 4$, which is
the region where $Z$ is a strong function of both variables and the ideal-gas
law is worthless.

### A1.5 — **(b) low-Reynolds-number wetted-area friction**

The divergent section is longer, colder and at lower local Reynolds number than
the throat, so its boundary-layer momentum deficit grows with added length
faster than the ideal $C_F$ gain (3.5 % from $\varepsilon = 20$ to 100 for
$\gamma = 1.4$) returns. (a) is wrong: there is no heat load — the gas is
colder than the wall. (c) is wrong: a nozzle over-expands and separates against
a *back pressure*, which vacuum does not supply; separation is a sea-level test
problem. (d) is a real effect for CO₂ and the refrigerants but nitrogen's
supercooled exit flow does not have time to nucleate, and in any case
condensation does not set the area-ratio optimum.

---

## A2 — Propellant screening (7 marks)

### (i) GN₂ stored density (2 marks)

$$\rho = \frac{p}{ZRT} = \frac{15\times10^{5}}{1.00 \times 296.797 \times 293.15} = \mathbf{17.24\ kg/m^3} = 0.0172\ \mathrm{g/cm^3}$$

**Why $Z = 1$ is acceptable at 15 bar and not at 240 bar.** Compressibility is a
molar-volume effect: at 15 bar the molar volume is ~1.6 L/mol and the
intermolecular co-volume is a negligible fraction of it, so $Z$ departs from
unity by well under 1 % (Module 29 Table 3.1 gives $Z \approx 1.00$ for N₂ at
20 bar). At 240 bar the molar volume has fallen by a factor of 16, repulsive
forces dominate, and $Z \approx 1.13$ — a 13 % error in loaded mass, in the
direction that flatters the design.

*1 mark for the number, 1 mark for a reason that names molar volume or
intermolecular spacing. A student who merely writes "low pressure" gets half.*

### (ii) Impulse density and delivered impulse in 0.90 L (3 marks)

$\Lambda = \rho I_{sp} g_0$; delivered impulse $= \Lambda \times 9.00\times10^{-4}\ \mathrm{m^3}$.

| candidate | $\rho$ (kg/m³) | $I_{sp}$ (s) | $\Lambda$ (N·s/m³) | $\Lambda$ (N·s/cm³) | $I_t$ in 0.90 L (N·s) |
|---|---|---|---|---|---|
| GN₂ at 15 bar | 17.24 | 69 | $1.167\times10^{4}$ | 0.0117 | **10.5** |
| n-butane | 570 | 65 | $3.633\times10^{5}$ | 0.363 | **327** |
| R-236fa | 1360 | 40 | $5.335\times10^{5}$ | 0.533 | **480** |
| SF₆ | 1400 | 38 | $5.217\times10^{5}$ | 0.522 | **470** |

*1 mark for the correct formula and units, 1 for the GN₂ row (the one that
requires (i)), 1 for the remaining three.*

### (iii) Elimination and recommendation (2 marks)

- **GN₂ at 15 bar fails on volume**, and not marginally: 10.5 N·s against a
  300 N·s requirement, short by a factor of **29**. The pressure cap has
  destroyed it, because a stored gas's impulse density is directly proportional
  to storage pressure and 15 bar is two orders of magnitude below the pressure
  at which nitrogen becomes a serious propellant.
- **SF₆ fails on pressure**: 21 bar exceeds the 15 bar cap. It would otherwise
  have closed comfortably at 470 N·s. Note that it fails on a *launch-provider*
  constraint, not a physics one — worth saying, because that is the kind of
  constraint that can sometimes be renegotiated and the volume one cannot.
- **Butane closes** at 327 N·s — 9 % margin.
- **R-236fa closes** at 480 N·s — 60 % margin.

**Recommendation: R-236fa.** It carries 60 % margin against 9 %, at essentially
the same tank pressure, and it is a non-flammable fire-suppression agent, which
removes a rideshare flammability review that butane requires. Butane's higher
$I_{sp}$ buys nothing here because the binding constraint is volume, not mass.

**Confidence.** The stored-density column is **confidence C /
`NEEDS PRIMARY`** in `reference/_verify-solid-coldgas.md` §B.1 — recalled from
literature, not read from `[NIST-WB]` or `[REFPROP]`. The *ranking* is safe;
the 9 % butane margin is not, because it is smaller than the uncertainty in the
number that produced it. That asymmetry is itself an argument for R-236fa.

*1 mark for correctly eliminating both failures with the right constraint named
for each; 1 mark for a defended recommendation. **Deduct 1 (from the section,
not below zero) if the confidence label is not mentioned anywhere in A2** —
the paper's instructions require it.*

---

## A3 — Two propellants that look right and are not (8 marks)

### (i) Carbon dioxide (4 marks)

**Objection 1 — the critical temperature is 304.1 K, barely above room
temperature.** Above about 31 °C there is no liquid phase at all: the tank
contents become a **supercritical fluid** and the system reverts to a
high-pressure gaseous blowdown at something near the 67 bar vapour pressure
rather than a constant-pressure self-pressurising feed. The whole architectural
benefit — constant feed pressure, thin can, no regulator — evaporates as a
function of *tank temperature*, which on a small spacecraft is not tightly
controlled. A propellant whose feed architecture changes character at a
temperature the bus routinely reaches is not a design, it is a hazard.
*(2 marks: 1 for naming $T_c = 304.1$ K and the ~31 °C threshold, 1 for saying
what the system reverts to.)*

**Objection 2 — expansion crosses the sublimation line.** CO₂'s triple point is
216.6 K at 5.18 bar. Expanding from a few bar of feed pressure to vacuum takes
the flow straight through the solid–vapour boundary, and **dry ice forms in the
throat and on the valve seat**. The symptoms are thrust decaying over seconds
during a long pulse, recovery after a coast, and rising impulse-bit scatter;
the evidence is a mass flow inferred from plenum decay that falls below the
choked-flow prediction at constant $p_0$. Systems that use CO₂ successfully
heat it upstream — at which point you have acquired a power budget and should
ask why not butane or a refrigerant.
*(2 marks: 1 for the sublimation line with the triple point, 1 for locating the
consequence in the throat/seat rather than in the tank.)*

**Also creditable, not required:** CO₂ at 67 bar is not a "thin can" — it is a
pressure vessel, so even in the liquefiable regime it loses the low-pressure
qualification-path argument that makes R-236fa attractive.

### (ii) Air (4 marks)

Any three of the following, each tied to hardware. *(1⅓ marks each, rounded in
the student's favour; 0 for any answer that argues only from $I_{sp}$, since
the question explicitly excludes that.)*

1. **Oxygen content adjacent to lubricants, elastomers and organics.** A
   high-pressure oxidiser is an ignition hazard at every seal, seat and
   fitting in the system, and adiabatic compression on rapid valve opening is a
   known ignition mechanism. Every wetted material would need oxygen-service
   qualification and cleaning to an oxygen-clean standard, which is a different
   and much more expensive cleanliness regime than the particulate control the
   rest of the system needs.
2. **Water vapour freezes in the throat.** The static temperature at a
   nitrogen-class throat is $T_0/(1+(\gamma-1)/2) \approx 250$ K and far colder
   downstream. Trace moisture ices the 0.1–0.5 mm throat and the valve seat,
   producing exactly the thrust-decay-and-recovery signature of the CO₂ failure
   above. This drives a propellant dryness specification in parts per million
   and a drying step in the fill operation.
3. **CO₂ content** brings its own condensation and sublimation behaviour into
   an otherwise well-behaved diatomic expansion, so the propellant is not a
   single fluid with a single $\gamma$.
4. **Contamination and oxidation of external surfaces.** An oxygen-bearing
   plume deposited on optics, radiators and solar arrays is a
   materials-compatibility problem the inert gases do not have.
5. **Ground-support and range-safety consequence:** a high-pressure air bottle
   is treated as an oxidiser system, with the attendant separation, handling
   and documentation requirements.

**The one-line summary a grader should look for:** air's problem is not that it
is a poor propellant — it is a good one — but that it is three fluids, one of
which is an oxidiser and one of which freezes.

---

# Section B — Performance modeling (35 marks)

## B1 — Derivation: the blowdown ODE (10 marks)

### (i) Isothermal ODE and solution (5 marks)

**Mass balance.** The tank is a closed control volume of fixed $V$ losing mass
through the throat:

$$\frac{dm}{dt} = -\dot m = -\Gamma\,\frac{p_t A_t}{\sqrt{R T_t}}$$

**Close it with the tank state.** Isothermal means $T_t = T_i$ for all time, so
the ideal-gas law gives $m = p_t V/(R T_i)$ and, because $V$, $R$ and $T_i$ are
constants,

$$\frac{dm}{dt} = \frac{V}{R T_i}\frac{dp_t}{dt}$$

**Substitute.**

$$\frac{V}{R T_i}\frac{dp_t}{dt} = -\Gamma\frac{p_t A_t}{\sqrt{R T_i}}
\quad\Longrightarrow\quad
\frac{dp_t}{dt} = -\underbrace{\frac{\Gamma A_t \sqrt{R T_i}}{V}}_{1/\tau}\,p_t$$

This is first-order linear and homogeneous. Separating and integrating from
$p_t(0) = p_i$:

$$\boxed{\;p_t(t) = p_i\,e^{-t/\tau},\qquad \tau = \frac{V}{\Gamma A_t\sqrt{R T_i}}\;}$$

**$\tau = m_i/\dot m_i$.**

$$\frac{m_i}{\dot m_i} = \frac{p_i V/(R T_i)}{\Gamma p_i A_t/\sqrt{R T_i}} = \frac{V}{R T_i}\cdot\frac{\sqrt{R T_i}}{\Gamma A_t} = \frac{V}{\Gamma A_t \sqrt{R T_i}} = \tau \quad\checkmark$$

So $\tau$ is the time the tank would take to empty at its *initial* flow rate —
which is why an exponential blowdown is an RC circuit with capacitance
$V/(RT)$ and conductance set by the choked orifice.

*Marks: 1 mass balance; 1 closing with $m = p_tV/RT_i$ and recognising the
constants; 1 correct ODE; 1 solution with $\tau$ stated explicitly; 1 the
$m_i/\dot m_i$ identity shown, not asserted.*

### (ii) Thrust history and total impulse (2 marks)

$F = C_F p_t A_t$ by definition of the thrust coefficient. **In vacuum $C_F$ is
a function of $\gamma$ and $\varepsilon$ only** — the ambient term
$(p_e - p_a)\varepsilon/p_0$ becomes $(p_e/p_0)\varepsilon$, and $p_e/p_0$ is
fixed by the area–Mach relation, so $C_F$ does not move as $p_t$ falls. Hence

$$F(t) = C_F A_t\,p_i e^{-t/\tau} = F_i e^{-t/\tau},\qquad \dot m(t) = \dot m_i e^{-t/\tau}$$

$$I_{tot} = \int_0^{t_b} F_i e^{-t/\tau}dt = F_i\tau\left(1-e^{-t_b/\tau}\right) = F_i\tau\left(1-\frac{p_f}{p_i}\right)$$

using $p_f/p_i = e^{-t_b/\tau}$ from (i).

*Marks: 1 for $F \propto p_t$ **with the constancy of vacuum $C_F$ stated as the
reason** — a student who simply asserts $F \propto p$ gets half; 1 for the
integral evaluated to the closed form.*

### (iii) Why adiabatic is faster, and which limit is real (3 marks)

**Why faster (2 marks).** Both cases start at the same $\dot m_i$ because the
initial state is identical. Thereafter the adiabatic tank loses pressure by
*two* routes instead of one: mass leaves, **and** the gas remaining behind cools
as it expands against the departing gas, following $pv^\gamma = $ const. Since
$p = \rho R T$ and both $\rho$ and $T$ are falling, pressure falls faster per
unit mass expelled than in the isothermal case, where only $\rho$ falls. So the
tank reaches any given $p_f$ sooner — after expelling *less* mass. That is the
same fact as $\phi_{adiab} < \phi_{iso}$ seen on the time axis instead of the
mass axis.

A common wrong answer: "the mass flow is higher because the gas is colder, and
$\dot m \propto 1/\sqrt{T}$." This is backwards in effect — $\dot m$ falls
faster in the adiabatic case because $p_t$ falls faster, and the
$1/\sqrt{T_t}$ factor only partly offsets it. Award 1 of 2 for an answer that
gets the conclusion by this route.

**Which limit (1 mark).** **Isothermal.** The comparison is between the
discharge time and the tank's thermal time constant
$\tau_{th} \sim m_{wall}c_{wall}/(hA_{wall})$, which for a small metal-walled
tank is of order hundreds of seconds. A 5 % duty cycle over an hour means the
gas is drawn off in short pulses separated by long dwells during which the wall
and the bus re-supply the expansion work, so the tank never departs measurably
from bus temperature. Cold-gas systems firing millisecond pulses are *always*
isothermal at the tank; it is the plenum, not the tank, that sees the adiabatic
transient.

---

## B2 — Unregulated blowdown, both limits (13 marks)

Given: $V = 6.00\times10^{-4}$ m³, $p_i = 3.00\times10^{6}$ Pa,
$T_i = 290$ K, $D_t = 2.50\times10^{-4}$ m, $\varepsilon = 40$,
$p_f = 6.00\times10^{5}$ Pa, GN₂, vacuum, $Z = 1$.

### (i) Gas and nozzle properties (2 marks)

$$\Gamma = \sqrt{1.4}\left(\frac{2}{2.4}\right)^{\frac{2.4}{0.8}} = \mathbf{0.684731}$$

$$c^* = \frac{\sqrt{R T_i}}{\Gamma} = \frac{\sqrt{296.797\times290}}{0.684731} = \frac{293.38}{0.684731} = \mathbf{428.46\ m/s}$$

$$C_F^{vac}(\gamma=1.4,\ \varepsilon=40) = \mathbf{1.7210}$$

$$I_{sp}^{ideal} = \frac{c^*C_F}{g_0} = \frac{428.46\times1.7210}{9.80665} = \mathbf{75.19\ s}$$

*Cross-check for the student: the course table gives 76.8 s for N₂ at
$\varepsilon = 50$ and 300 K; scaling by $\sqrt{290/300} = 0.9832$ and stepping
down to $\varepsilon = 40$ lands at 75.2 s. ✓*

### (ii) Throat, mass and initial conditions (3 marks)

$$A_t = \frac{\pi}{4}(2.50\times10^{-4})^2 = \mathbf{4.909\times10^{-8}\ m^2}\ (0.0491\ \mathrm{mm^2})$$

$$m_i = \frac{p_i V}{R T_i} = \frac{3.00\times10^{6}\times6.00\times10^{-4}}{296.797\times290} = \frac{1800}{86\,071} = \mathbf{0.02091\ kg} = 20.91\ \mathrm{g}$$

$$\dot m_i = \Gamma\frac{p_i A_t}{\sqrt{RT_i}} = \frac{0.684731\times3.00\times10^{6}\times4.909\times10^{-8}}{293.38} = \mathbf{3.437\times10^{-4}\ kg/s} = 343.7\ \mathrm{mg/s}$$

$$F_i = C_F p_i A_t = 1.7210\times3.00\times10^{6}\times4.909\times10^{-8} = \mathbf{0.2534\ N} = 253.4\ \mathrm{mN}$$

### (iii) Isothermal blowdown (3 marks)

$$\tau = \frac{V}{\Gamma A_t\sqrt{RT_i}} = \frac{6.00\times10^{-4}}{0.684731\times4.909\times10^{-8}\times293.38} = \mathbf{60.85\ s}$$

$$\text{check: } \frac{m_i}{\dot m_i} = \frac{0.020913}{3.437\times10^{-4}} = 60.85\ \mathrm{s}\ \checkmark$$

$$t(6\ \mathrm{bar}) = \tau\ln\frac{p_i}{p_f} = 60.85\times\ln 5 = 60.85\times1.6094 = \mathbf{97.9\ s}$$

$$\phi_{iso} = 1-\frac{p_f}{p_i} = 1-0.200 = \mathbf{0.800}$$

$$I_{tot,iso} = \phi\,m_i\,I_{sp}g_0 = 0.800\times0.020913\times75.19\times9.80665 = \mathbf{12.34\ N\cdot s}$$

$$\text{check: } F_i\tau\left(1-\frac{p_f}{p_i}\right) = 0.2534\times60.85\times0.800 = 12.34\ \mathrm{N\cdot s}\ \checkmark$$

*The second route is worth a mark on its own. It is the fastest sanity check in
the subject and students skip it.*

### (iv) Adiabatic blowdown (4 marks)

$$T_f = T_i\left(\frac{p_f}{p_i}\right)^{\frac{\gamma-1}{\gamma}} = 290\times(0.200)^{0.2857} = 290\times0.6314 = \mathbf{183.1\ K}$$

— a **107 K drop**, which is a materials problem before it is a performance
problem: every elastomer in that tank is far below its glass transition.

$$\phi_{adiab} = 1-\left(\frac{p_f}{p_i}\right)^{1/\gamma} = 1-(0.200)^{0.7143} = 1-0.3168 = \mathbf{0.683}$$

$$m_f = (1-\phi)m_i = 6.624\ \mathrm{g},\qquad m_{used} = 14.29\ \mathrm{g}$$

$$t_f = \frac{2\tau}{\gamma-1}\left[\left(\frac{\rho_f}{\rho_i}\right)^{-\frac{\gamma-1}{2}}-1\right] = \frac{2\times60.85}{0.4}\left(0.3168^{-0.2}-1\right) = 304.2\times0.2585 = \mathbf{78.6\ s}$$

$$I_{tot,adiab} = C_F c^*_i m_i \frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{1.2}\right] = 1.7210\times428.46\times0.020913\times0.8333\times[1-0.2555]$$
$$= \mathbf{9.62\ N\cdot s}$$

$$\text{loss} = 1-\frac{9.62}{12.34} = \mathbf{22.1\ \%}$$

*Sanity: the mean delivered $I_{sp}$ over the adiabatic discharge is
$9.616/(0.014288\times9.80665) = 68.6$ s against 75.19 s at the start and
$75.19\sqrt{183.1/290} = 59.7$ s at cutoff. All three are ordered correctly.*

### (v) The two penalties (1 mark)

1. **Stranded propellant.** At the same cutoff pressure the cold gas is denser,
   so more mass is left behind: 6.62 g against 4.18 g isothermally.
2. **A declining specific impulse on the propellant you do expel**, because
   $c^* \propto \sqrt{T_t}$ and $T_t$ is falling throughout.

$\phi_{adiab}$ captures only the **first**. The second is carried by the
$2/(\gamma+1) = 0.833$ prefactor in the impulse integral. Decomposing the
22.1 % loss: the mass term contributes $0.683/0.800 = 0.854$ and the mean-$I_{sp}$
term the remaining $0.780/0.854 = 0.913$.

*Full mark requires naming both **and** correctly assigning which one
$\phi_{adiab}$ misses. Naming both without the assignment: half.*

---

## B3 — Regulated thruster and the area-ratio trade (12 marks)

Given: $F = 1.00\times10^{-2}$ N, $p_0 = 4.00\times10^{5}$ Pa, $T_0 = 290$ K,
$\varepsilon = 40$, $\alpha = 15°$, GN₂, vacuum.

### (i) Nozzle sizing (4 marks)

$$C_F^{vac}(1.4,\ 40) = \mathbf{1.7210}$$

$$A_t = \frac{F}{C_F p_0} = \frac{1.00\times10^{-2}}{1.7210\times4.00\times10^{5}} = \mathbf{1.453\times10^{-8}\ m^2}$$

$$D_t = \sqrt{\frac{4A_t}{\pi}} = 1.360\times10^{-4}\ \mathrm{m} = \mathbf{136.0\ \mu m}$$

$$\dot m = \Gamma\frac{p_0 A_t}{\sqrt{RT_0}} = \frac{0.684731\times4.00\times10^{5}\times1.453\times10^{-8}}{293.38} = \mathbf{1.356\times10^{-5}\ kg/s} = 13.56\ \mathrm{mg/s}$$

### (ii) Reynolds number and efficiencies (4 marks)

$$T^* = \frac{2T_0}{\gamma+1} = \frac{580}{2.4} = \mathbf{241.7\ K}$$

$$\mu^* = 1.76\times10^{-5}\left(\frac{241.7}{293}\right)^{0.7} = \mathbf{1.538\times10^{-5}\ Pa\cdot s}$$

$$Re_t = \frac{4\dot m}{\pi D_t \mu^*} = \frac{4\times1.356\times10^{-5}}{\pi\times1.360\times10^{-4}\times1.538\times10^{-5}} = \mathbf{8.26\times10^{3}}$$

$$b(40) = 10\sqrt{40/50} = 8.944,\qquad \eta_{visc} = 1-\frac{8.944}{\sqrt{8255}} = 1-0.0984 = \mathbf{0.902}$$

$$\lambda = \tfrac12(1+\cos15°) = \mathbf{0.9830},\qquad \eta_I = 0.9830\times0.902 = \mathbf{0.886}$$

$$I_{sp}^{ideal}(\varepsilon=40,\ 290\ \mathrm{K}) = 75.19\ \mathrm{s}\ \Longrightarrow\ I_{sp}^{delivered} = 0.886\times75.19 = \mathbf{66.6\ s}$$

### (iii) The same thrust at $\varepsilon = 20$ (3 marks)

$$C_F^{vac}(1.4,\ 20) = 1.6899,\quad A_t = 1.479\times10^{-8}\ \mathrm{m^2},\quad D_t = \mathbf{137.2\ \mu m}$$
$$\dot m = 1.381\times10^{-5}\ \mathrm{kg/s},\quad Re_t = \mathbf{8.33\times10^{3}}$$
$$b(20) = 10\sqrt{0.4} = 6.325,\quad \eta_{visc} = 1-\frac{6.325}{\sqrt{8331}} = \mathbf{0.931},\quad \eta_I = 0.915$$
$$I_{sp}^{ideal}(\varepsilon=20) = 73.83\ \mathrm{s}\ \Longrightarrow\ I_{sp}^{delivered} = \mathbf{67.5\ s}$$

**The short nozzle wins by 0.9 s.** It gives up **1.36 s of ideal $I_{sp}$** (the
$C_F$ penalty of halving the area ratio) and recovers **2.9 percentage points of
viscous efficiency** (0.902 → 0.931) because the divergent section has roughly
$\sqrt{2}$ less wetted wall to drag against at essentially unchanged $Re_t$.
Note that $Re_t$ barely moves (8255 → 8331): the throat is set by thrust and
plenum pressure, not by area ratio, which is exactly why the trade is decided
by $b(\varepsilon)$ alone.

*Marks: 1 for the $\varepsilon = 20$ sizing, 1 for the corrected $I_{sp}$,
1 for the "gives up / recovers" accounting. A student who reports only that
$\varepsilon = 20$ wins, without the two competing terms, gets 2 of 3.*

### (iv) Confidence (1 mark)

Eq. 3.12/3.12a of Module 29 is **[E]/[A]** — an empirical form fitted to the
*trend* of the low-Reynolds-number nozzle literature rather than to a single
data set, with a quoted uncertainty of **±0.05 on $\eta_{visc}$**, and the
$b(\varepsilon)$ heuristic is explicitly labelled "not a correlation" and
bounded to $20 \le \varepsilon \le 100$. ±0.05 on $\eta_{visc}$ is ±3.8 s here
— **four times the 0.9 s difference the trade turned on**. Before a flight
prediction: read the source $C_F$-versus-$Re$ figures directly, and better,
measure this nozzle on a thrust stand over a plenum-pressure sweep and extract
$C_d$ and $C_F$ separately.

*The mark is for recognising that the uncertainty swamps the result. A student
who states the label but not that consequence gets half.*

---

# Section C — Hardware and constraints (25 marks)

## C1 — Leak budget (8 marks)

### (i) Total allowable leak rate (2 marks)

$$m_{loss} = 0.025\times0.950 = \mathbf{0.02375\ kg} = 23.75\ \mathrm{g}$$
$$t = 6.0\times365.25\times24\times3600 = 1.8935\times10^{8}\ \mathrm{s}$$
$$\dot m_{leak} = \frac{0.02375}{1.8935\times10^{8}} = \mathbf{1.254\times10^{-10}\ kg/s} = 4.516\times10^{-4}\ \mathrm{g/h}$$

Standard density of nitrogen at 273.15 K, 101 325 Pa:

$$\rho_{std} = \frac{p_{std}\mathcal{M}}{R_u T_{std}} = \frac{101325\times28.014}{8314.46\times273.15} = 1.2498\ \mathrm{kg/m^3} = 1.2498\times10^{-6}\ \mathrm{kg/scc}$$

$$\dot V_{total} = \frac{1.254\times10^{-10}}{1.2498\times10^{-6}} = 1.004\times10^{-4}\ \mathrm{scc/s} = \mathbf{0.361\ scc/h\ (GN_2)}$$

### (ii) Allocation (3 marks)

| group | count | share of 0.361 scc/h | per item (scc/h) | per item (scc/s GN₂) |
|---|---|---|---|---|
| Thruster valve seats | 8 | 0.1987 | 0.02484 | **$6.90\times10^{-6}$** |
| Latch + fill seats | 2 | 0.0542 | 0.02710 | **$7.53\times10^{-6}$** |
| Mechanical joints | 14 | 0.0722 | 0.005161 | **$1.43\times10^{-6}$** |
| Margin | — | 0.0361 | — | — |

### (iii) Helium conversion (2 marks)

A seat leak of $10^{-6}$–$10^{-5}$ scc/s is in the **molecular (Knudsen)
regime**: the mean free path exceeds the leak-path dimension, and throughput
scales as $\mathcal{M}^{-1/2}$. Helium therefore flows

$$\sqrt{\frac{\mathcal{M}_{N_2}}{\mathcal{M}_{He}}} = \sqrt{\frac{28.014}{4.003}} = \mathbf{2.645\times}$$

faster than nitrogen through the same defect. Requiring the *nitrogen* leak to
be $\le 6.90\times10^{-6}$ scc/s means the *measured helium* leak must be

$$\dot V_{He} \le 2.645\times6.90\times10^{-6} = \mathbf{1.83\times10^{-5}\ scc/s\ GHe}$$

In the **viscous (Poiseuille) regime** throughput scales as $1/\mu$ and, with
$\mu_{He}/\mu_{N_2} \approx 1.1$, helium would leak about **0.89×** as fast —
*slower*. The conversion factor therefore spans 0.89 to 2.65, a factor of three
straddling unity, and there is no universal number. Specifying in GHe and
testing in GHe is conservative for the small leaks a multi-year budget cares
about.

*1 mark for the 2.645 factor applied in the right direction (a student who
divides instead of multiplying has loosened the spec by 7× and gets zero for
this part); 1 mark for naming both regimes with the other factor.*

### (iv) The hard-seat vendor (1 mark)

$10^{-3}$ scc/s GHe corresponds to $10^{-3}/2.645 = 3.78\times10^{-4}$ scc/s of
GN₂ — **3.8× the entire system's allowance** of $1.004\times10^{-4}$ scc/s, from
a single seat. Eight of them exceed the budget by a factor of 30. **It does not
close, and no reallocation can save it.**

The property of a soft seat that changes the answer is **compliance**: a
polymer land deforms around surface-finish asperities and around a trapped
particle, embedding it rather than being propped open by it, which is what makes
$10^{-4}$–$10^{-6}$ scc/s GHe routinely achievable. The costs bought with it are
cold flow of the polymer under sustained seat load (leakage rises with time at
temperature), a narrower temperature range, and an outgassing qualification.

---

## C2 — Regulator behaviour (5 marks)

### (i) Supply pressure effect (2 marks)

$$SPE = \frac{\partial p_{out}}{\partial p_{in}} = \frac{A_{seat}}{A_s} = \left(\frac{d_s}{D_{diaphragm}}\right)^2 = \left(\frac{1.0}{22}\right)^2 = \mathbf{2.07\times10^{-3}}$$

$$\Delta p_{out} = 2.07\times10^{-3}\times(250-35)\ \mathrm{bar} = \mathbf{0.444\ bar} = \mathbf{7.4\ \%\ of\ the\ 6.0\ bar\ setpoint}$$

7.4 % is not negligible: on a blowdown-free system it appears directly as a
7.4 % drift in thrust and in impulse bit over the mission, which an
attitude-control law tuned at beginning of life will see as a slow calibration
error. This is the argument for a two-stage regulator, whose SPE is the product
of the stages.

### (ii) Droop at end of life (2 marks)

From $\Delta p_{droop} = k\dot m\sqrt{RT}/(A_s C_d \pi d_s \Gamma\,p_{in})$ at
fixed flow, everything except $p_{in}$ is constant, so
$\Delta p_{droop} \propto 1/p_{in}$:

$$\Delta p_{droop}(35\ \mathrm{bar}) = 0.9\ \%\times\frac{250}{35} = \mathbf{6.4\ \%\ of\ setpoint}$$

**Assumption:** the seat annulus remains the choking section — i.e. the poppet
lift stays small compared with $d_s/4$ so that the annulus, not the seat bore,
is the throat. If the poppet reaches full open the bore chokes instead and droop
saturates rather than continuing to grow.

**Consequence for acceptance testing:** a regulator tested only at 250 bar inlet
has been characterised in the single condition where it looks best. It will
appear flat on the bench and droop visibly in the last third of the mission,
exactly when the thrust calibration is least well known. **Test at end-of-life
inlet pressure or you have not tested it.**

### (iii) Downstream rating (1 mark)

The low-pressure section must be rated to the **lockup pressure**, not the
6.0 bar setpoint. At zero flow the poppet must be seated to stop flow, the
loading spring is at maximum extension, and
$p_{lock} = (F_0 \pm p_{in}A_{seat})/A_s$ — always *above* the flowing setpoint.
Rating to 6.0 bar rates the hardware to a pressure the regulator is guaranteed
to exceed every time flow stops.

*Creditable addition, not required: lockup is the rating for normal operation.
The **fail-open** case is a separate and larger requirement, handled either by
rating the whole low-pressure section to tank MEOP or by a relief device sized
for the regulator's full fail-open flow.*

---

## C3 — Solenoid force and response (4 marks)

### (i) Force balance (2 marks)

$$A_p = \frac{\pi}{4}(5.5\times10^{-3})^2 = 2.376\times10^{-5}\ \mathrm{m^2}$$

$$F_{mag} = \frac{\mu_0 N^2 I^2 A_p}{2g^2} = \frac{(4\pi\times10^{-7})(1000)^2(0.40)^2(2.376\times10^{-5})}{2(2.8\times10^{-4})^2} = \mathbf{30.5\ N}$$

$$A_{seat} = \frac{\pi}{4}(1.0\times10^{-3})^2 = 7.854\times10^{-7}\ \mathrm{m^2}$$

$$F_p(6\ \mathrm{bar}) = 7.854\times10^{-7}\times6.0\times10^{5} = \mathbf{0.47\ N}\qquad F_p(250\ \mathrm{bar}) = \mathbf{19.6\ N}$$

**It cannot serve as the high-pressure isolation valve.** The deciding number is
$19.6/30.5 = \mathbf{64\ \%}$: the pressure force alone consumes two-thirds of
the available magnetic force before the return-spring preload, seat friction and
any manufacturing or temperature margin are counted. At 6 bar the same valve has
a 65:1 margin. This is precisely the argument for putting thruster valves
**downstream** of the regulator and using a latching, pilot-operated or
pyrotechnic valve upstream.

### (ii) Response and power (2 marks)

$$I_{final} = \frac{V}{R} = \frac{28}{50} = 0.560\ \mathrm{A},\qquad \tau = \frac{L}{R} = \frac{0.036}{50} = 0.720\ \mathrm{ms}$$

$$t_{elec} = \tau\ln\left(\frac{1}{1-I_{pi}/I_{final}}\right) = 0.720\ln\left(\frac{1}{1-0.714}\right) = 0.720\times1.253 = \mathbf{0.90\ ms}$$

Add 1–2 ms of armature travel against inertia, spring and gas damping: total
opening delay **2–3 ms**, consistent with the 2–5 ms band for small spacecraft
solenoids.

$$I_{hold} = I_{pi}\frac{g_{closed}}{g_{open}} = 0.40\times\frac{0.05}{0.28} = \mathbf{0.071\ A}\ (\text{take } 0.10\ \mathrm{A\ for\ margin})$$

$$P_{pull-in} = I_{final}^2R = 0.560^2\times50 = \mathbf{15.7\ W},\qquad P_{hold} = 0.10^2\times50 = \mathbf{0.50\ W}$$

**Why peak-and-hold is not an optimisation:** 15.7 W exceeds the entire
orbit-average power of most 3U and many 6U CubeSats, so a valve that must be
held open continuously at pull-in current cannot be used at all; 0.5 W is a
rounding error. Peak-and-hold is what makes a solenoid usable on a small
spacecraft in the first place, and it works only because the $1/g^2$ dependence
makes the closed-gap force 31× larger at the same current.

---

## C4 — Impulse bit, repeatability, throat tolerance (8 marks)

### (i) Impulse bits and scatter (3 marks)

$$t_{eff} = t_{cmd} - 3.5 + 2.2 = t_{cmd} - 1.3\ \mathrm{ms}$$
$$I_{bit} = F\left(t_{eff} - 0.5 + 0.8\right)\ \mathrm{ms} = F\,(t_{eff}+0.3)\ \mathrm{ms}$$

| $t_{cmd}$ | $t_{eff}$ | $I_{bit}$ | jitter ±0.25 ms | spread |
|---|---|---|---|---|
| 12.0 ms | 10.7 ms | $0.035\times0.0110 = \mathbf{3.85\times10^{-4}}$ N·s = **0.385 mN·s** | ±8.75×10⁻⁶ N·s | **±2.3 %** |
| 4.0 ms | 2.7 ms | $0.035\times0.0030 = \mathbf{1.05\times10^{-4}}$ N·s = **0.105 mN·s** | ±8.75×10⁻⁶ N·s | **±8.3 %** |

Note the **sign structure**: the fall transition is longer than the rise, so the
+0.3 ms term *adds* impulse — the bit is larger than $F t_{eff}$, not smaller.
Students consistently guess this backwards.

### (ii) Against the requirement (2 marks)

The 4.0 ms command gives **0.105 mN·s ≤ 0.15 mN·s ✓** and **±8.3 % ≤ ±10 % ✓**.
**Both halves are met**, with the scatter margin the tighter of the two.

The model stops being valid as $t_{cmd}$ approaches $t_{op} = 3.5$ ms. Below
that the valve never reaches full lift, so $F$ is no longer the steady-state
thrust, the trapezoid is no longer the right shape, and the impulse becomes a
strongly nonlinear and poorly repeatable function of $t_{cmd}$ — pulse-to-pulse
scatter then grows faster than the timing jitter alone predicts and the
distribution can go bimodal. That regime is exactly what the MIB definition
exists to keep the system out of. A 4.0 ms command sits only 0.5 ms above it,
which is thin: a defensible design would either raise the command length and
accept a coarser bit, or reduce $F$ so that the same 4 ms buys a smaller bit.

*1 mark for the two-part verdict; 1 mark for identifying $t_{cmd} \to t_{op}$
with the full-lift reason. A student who says "when $t_{cmd}$ is small" without
tying it to $t_{op}$ gets half.*

### (iii) Thrust uncertainty (2 marks)

$$\frac{\delta A_t}{A_t} = 2\frac{\delta D_t}{D_t} = 2\times\frac{7}{220} = \mathbf{\pm6.36\ \%}$$

Since $F = C_d C_F p_0 A_t$ and the three contributors are independent,

$$\frac{\delta F}{F} = \sqrt{0.0636^2+0.020^2+0.025^2} = \sqrt{0.004045+0.000400+0.000625} = \mathbf{\pm7.12\ \%}$$

$$\text{throat share of variance} = \frac{0.004045}{0.005070} = \mathbf{79.8\ \%}$$

### (iv) The fix (1 mark)

**Measure and record each flight nozzle's actual throat** — optically or with an
air gauge — and use the measured $A_t$ in the flight software's thrust model.
That replaces the machining tolerance with the *measurement* uncertainty, a
fraction of a percent, and collapses the dominant variance term.

**What it costs:** nothing in hardware — it costs bookkeeping. Every nozzle
becomes a serialised item with a data record that must survive integration, and
the flight software must carry a per-thruster calibration table rather than one
constant. That discipline is the cost, and programmes lose it at integration
more often than they lose the measurement.

*Creditable addition: this matters far more for a paired torque couple than for
a Δv burn — two nominally identical thrusters each at ±6.4 % produce a net
uncommanded force of up to 13 % of one thruster's output.*

---

# Section D — Systems and data interpretation (20 marks)

## D1 — Reading a regulated system's telemetry (8 marks)

### (i) The two mechanisms (2 marks)

**Mechanism 1 — nominal regulated consumption.** The *tank* pressure falls in
straight segments only during firing campaigns and is flat between them. That is
the signature of a regulator in regulation: with $p_0$ held constant, $\dot m$ is
constant, so $dm/dt$ is constant and the tank decays **linearly** with
accumulated on-time rather than exponentially. This is correct behaviour.

**Mechanism 2 — regulator seat creep (a fault).** The *plenum* transducer walks
upward between campaigns, from 5.00 bar toward tank pressure, with no commanded
flow. A regulator holds its outlet closed by seating a poppet; a leaking seat
integrates into a downstream volume that, in a system that pulses for
milliseconds and then sits for days, is closed almost all of the time. Creep is
not droop's opposite and it is not a setpoint error — it is a seat leak filling
a dead-ended volume, and it does not stop until something relieves it.

*1 mark each. A student who calls the plenum rise "regulator droop" has the
sign and the physics backwards and gets zero for that half.*

### (ii) Consumption check (2 marks)

$$\Delta p = 200.0-167.7 = 32.3\ \mathrm{bar} = 3.23\times10^{6}\ \mathrm{Pa}$$

$$m_{used} = \frac{\Delta p\,V}{Z R T} = \frac{3.23\times10^{6}\times2.00\times10^{-3}}{1.10\times296.797\times293.15} = \frac{6460}{95\,708} = \mathbf{0.0675\ kg} = 67.5\ \mathrm{g}$$

$$\bar{\dot m} = \frac{0.0675}{1800} = \mathbf{3.750\times10^{-5}\ kg/s}$$

Specification check, one thruster:

$$\dot m_{spec} = \frac{F}{I_{sp}g_0} = \frac{0.025}{68\times9.80665} = 3.749\times10^{-5}\ \mathrm{kg/s}$$

**The agreement is 0.03 %.** What that tells you: the thrusters are performing at
their specified thrust and specific impulse, the regulator is delivering its
setpoint during firings, and — importantly — **there is no gross propellant loss
hiding in the tank bookkeeping**. The fault found in (iii) is small in mass
terms and would never have been caught from the tank trace; it was caught
because someone put a transducer on the plenum. That is why the plenum
transducer is in the schematic.

### (iii) The regulator seat leak (2 marks)

$$\Delta m = \frac{\Delta p_{plenum} V_{plenum}}{R T} = \frac{1.40\times10^{5}\times40\times10^{-6}}{296.797\times293.15} = \frac{5.60}{87\,001} = 6.44\times10^{-5}\ \mathrm{kg}$$

over $6.0\ \mathrm{d} = 5.184\times10^{5}$ s:

$$\dot m_{leak} = \mathbf{1.242\times10^{-10}\ kg/s}$$

$$\dot V = \frac{1.242\times10^{-10}}{1.2498\times10^{-6}} = \mathbf{9.93\times10^{-5}\ scc/s\ GN_2} = 0.358\ \mathrm{scc/h}$$

$$\dot V_{He} = 2.645\times9.93\times10^{-5} = \mathbf{2.63\times10^{-4}\ scc/s\ GHe}$$

Against the procurement specification of $1\times10^{-4}$ scc/s GHe the seat is
**non-compliant by a factor of 2.6**.

*The molecular-flow assumption should be stated. A student who quotes the GN₂
number as if it were the GHe specification has understated the violation by
2.6× and gets 1 of 2.*

### (iv) When the relief valve lifts (1 mark)

Creep rate $= 1.40\ \mathrm{bar}/6.0\ \mathrm{d} = 0.233$ bar/day. From 6.40 bar
to the 8.0 bar cracking pressure:

$$t = \frac{8.0-6.40}{0.233} = \mathbf{6.9\ days}$$

**The estimate is sound in its physics and optimistic in practice.** Sound
because the leak is choked at the seat — 200 bar upstream against 6–8 bar
downstream is a pressure ratio far above the critical 1.9 — so the mass leak
rate is independent of the downstream pressure and the extrapolation is genuinely
linear. Optimistic because seat leakage does not hold steady: a particle works
its way further into the land, a polymer seat continues to cold-flow, and each
thermal cycle moves the seat load. The realistic expectation is that it lifts
sooner than 6.9 days.

### (v) Consequence and containment (1 mark)

**Consequence.** Once the relief valve cracks, the tank is connected to vacuum
through the leaking regulator seat and an open relief path, and the propellant
bleeds away continuously with no thrust produced. Worse, a relief valve that has
lifted may not reseat cleanly against a contaminated seat, so a transient
overpressure event converts into a *permanent* leak path and the mission ends
early with a smooth, unremarkable tank decay that looks exactly like normal
consumption.

**The architectural fix:** a **latching isolation valve upstream of the
regulator**, commanded closed between firing campaigns. It is the only one of
the three standard defences that addresses creep, because it removes the
pressure source rather than relieving its consequences. It requires the plenum
transducer (present here), the fault-management logic to act on it, and position
telemetry on the latch valve itself.

**What it does not protect against:** a leaking *thruster* valve seat, which is
downstream of it; and a regulator that fails open *during* a campaign, when the
latch valve is necessarily open — that case still needs the relief path sized
for full fail-open flow, or a low-pressure section rated to tank MEOP.

---

## D2 — System sizing: AURA-6 (8 marks)

### (i) Propellant selection and mass (2 marks)

**Propellant: R-236fa, stored as a self-pressurising saturated liquid at its own
vapour pressure of ~2.7 bar.** The 10 bar cap eliminates every stored gas: from
A2's arithmetic, nitrogen at 10 bar has an impulse density of about 0.008
N·s/cm³ and would need roughly 30 L of propellant volume for 240 N·s against a
600 cm³ allocation. Butane closes on the physics but is flammable; SF₆ and CO₂
exceed the cap on vapour pressure alone. R-236fa is the flight-proven answer at
this scale and it is non-flammable.

$$I_{sp}^{ideal}(\gamma=1.08,\ \varepsilon=30,\ 293.15\ \mathrm{K}) = \mathbf{41.32\ s}$$

| basis | $I_{sp}$ | $m_p = I_t/(I_{sp}g_0)$ | $V_{prop} = m_p/1360$ | tank at 90 % fill | fits 600 cm³? |
|---|---|---|---|---|---|
| flight-demonstrated | 40.0 s | **0.612 kg** | **450 cm³** | 500 cm³ | ✓ (17 % margin) |
| 0.90 × ideal | 37.19 s | **0.658 kg** | **484 cm³** | 538 cm³ | ✓ (10 % margin) |

**Take 37.19 s and 0.658 kg to the review.** The flight-demonstrated 40 s implies
$\eta_I = 40/41.32 = 0.97$ against the $\varepsilon = 30$ ideal at this
temperature — *above* the 0.85–0.95 steady-flow band, and far above what a
pulsed duty cycle delivers. It is a vendor/flight figure for one specific piece
of hardware, not a design allowable for new hardware. The 7.6 % extra propellant
is cheap; discovering at end of life that the system was sized on someone else's
best case is not.

*1 mark for the propellant with the pressure-cap justification; 1 mark for both
mass/volume pairs **and** a defended choice between them. A student who computes
only one basis gets half of the second mark.*

### (ii) Nozzle (2 marks)

$$C_F^{vac}(\gamma=1.08,\ \varepsilon=30) = \mathbf{1.998}$$

$$A_t = \frac{F}{C_F p_0} = \frac{0.025}{1.998\times2.70\times10^{5}} = \mathbf{4.635\times10^{-8}\ m^2}$$

$$D_t = \sqrt{4A_t/\pi} = \mathbf{0.243\ mm},\qquad D_e = D_t\sqrt{30} = \mathbf{1.331\ mm}$$

$$\dot m = \Gamma\frac{p_0A_t}{\sqrt{RT_0}} = \mathbf{6.17\times10^{-5}\ kg/s} = 61.7\ \mathrm{mg/s}$$

Check: $F/(\dot m g_0) = 41.3$ s = the ideal $I_{sp}$ ✓.

**Manufacturing.** 0.243 mm is at the lower boundary of what careful
micro-drilling holds; below ~0.2 mm the routes are EDM, laser drilling or
etched-and-diffusion-bonded laminates. The tolerance, not the aerodynamics, is
what decides: at a good machine-shop ±7 μm the throat area is uncertain by
$2\times7/243 = \pm5.8$ %, which flows straight into thrust and, for a
paired torque couple, into an uncommanded net force. Contour is irrelevant at
this scale — take a 15° cone you can inspect over a bell you cannot.

### (iii) Valve command and cycle life (2 marks)

$$t_{eff,max} = \frac{I_{bit,max}}{F} = \frac{2.00\times10^{-4}}{0.025} = \mathbf{8.0\ ms}$$

Comfortably within a small solenoid's range: with a 3–4 ms opening delay a
commanded pulse of roughly 9–10 ms lands on an 8 ms effective on-time, and a
micro-valve would do it in a fraction of that.

$$N_{pulses} = \frac{I_t}{I_{bit}} = \frac{240}{2.00\times10^{-4}} = \mathbf{1.2\times10^{6}}$$

**Ask the vendor for the qualification cycle count, separately, in writing.** A
quoted "number of firings" in this product class is frequently *total impulse
divided by minimum impulse bit* — an arithmetic identity, not a life test. The
tell is exactly the number just computed: $240/1.2\times10^{6} = 0.20$ mN·s, the
quoted MIB, to the digit. If the mission actually needs 1.2 million actuations,
that figure is not evidence the valve survives them; and conversely a duty cycle
using 20 ms rather than 8 ms pulses exhausts the propellant in a fraction of the
advertised firings while nowhere near the valve's mechanical life.

### (iv) Tank (1 mark)

Sizing on the conservative propellant load, $V_{tank} = 484/0.90 = 538$ cm³:

$$r = \left(\frac{3V}{4\pi}\right)^{1/3} = \mathbf{50.4\ mm}\ (D = 100.9\ \mathrm{mm}),\qquad A = 4\pi r^2 = 0.0320\ \mathrm{m^2}$$

$$t_{stress} = \frac{FS_u\,p\,r}{2\sigma_{tu}} = \frac{1.5\times2.70\times10^{5}\times0.0504}{2\times310\times10^{6}} = \mathbf{33\ \mu m}$$

$$m_{tank} = A\,t_{min}\,\rho_m = 0.0320\times1.0\times10^{-3}\times2700 = \mathbf{86\ g}$$

**Minimum gauge governs, by a factor of 30.** This is the "fails when" clause of
Module 28's Eq. 3.5 doing real work: at 2.7 bar the tank mass is not
proportional to $pV$ at all — it is set by what can be handled, welded and
carried through integration without denting. Every conclusion that flows from
"tank mass $\propto pV$" is void in this regime, which is precisely why the
low-pressure architecture wins so decisively at CubeSat scale.

*Sanity check worth a nod: a 100.9 mm sphere does not fit inside a 6U bus whose
smallest dimension is 100 mm. The real article is a conformal welded box, not a
sphere — which is the other half of why MarCO-class modules are built as a
single welded structure that happens to contain propellant.*

### (v) Leak budget (1 mark)

$$m_{allow} = 0.03\times0.658 = 0.01974\ \mathrm{kg},\qquad t = 3.0\times365.25\times24\times3600 = 9.467\times10^{7}\ \mathrm{s}$$

$$\dot m = \mathbf{2.085\times10^{-10}\ kg/s}$$

$$\rho_{std}(\mathrm{R\text{-}236fa}) = \frac{101325\times152.04}{8314.46\times273.15} = 6.783\ \mathrm{kg/m^3} = 6.783\times10^{-6}\ \mathrm{kg/scc}$$

$$\dot V = \frac{2.085\times10^{-10}}{6.783\times10^{-6}} = 3.07\times10^{-5}\ \mathrm{scc/s} = \mathbf{0.111\ scc/h\ (R\text{-}236fa)}$$

$$\dot V_{He} = \sqrt{\frac{152.04}{4.003}}\times3.07\times10^{-5} = 6.163\times3.07\times10^{-5} = \mathbf{1.89\times10^{-4}\ scc/s\ GHe}$$

**The construction decision this drives: an all-welded monolithic module.**
$1.9\times10^{-4}$ scc/s GHe is the *whole system* budget, and a flareless or
flare fitting sits at $10^{-6}$–$10^{-4}$ scc/s each — so a handful of
mechanical joints consumes it entirely before a single valve seat is counted.
Weld or machine the tank, plenum, feed passages and nozzles as one part, and put
soft-seated micro-valves at the only interfaces that must move. The leak budget,
not the performance budget, is what selects the manufacturing route.

---

## D3 — Why did they design it that way? (4 marks)

### (i) 3 nozzles to 24 (2 marks)

**The observation.** On Gemini 4 (3 June 1965) Ed White reported that the
hand-held maneuvering unit's line of action did not pass through his combined
centre of mass — astronaut plus suit plus umbilical, a mass distribution he
could neither know nor hold constant. Every translation command therefore
arrived with an unwanted torque attached, which he had to null by feel, in a
pressurised glove, while tumbling. He ran the unit dry in minutes.

**The quantity that was not being controlled: torque** — or equivalently, force
and torque were not independently commandable. Three nozzles on a hand-held body
give the operator one force vector whose line of action is wherever he happens
to be holding it; the moment arm is an uncontrolled variable.

**Why 24 fixes it.** Four clusters of six mounted rigidly at the corners of a
backpack give the control electronics enough independent thrusters to synthesise
**any commanded force and any commanded torque separately** — full six degrees
of freedom — with the redundancy to lose an entire cluster and stay
controllable. The human commands what he wants to happen; the control law, not
his proprioception, resolves it into nozzle openings. The nozzle count is set by
the **dimensionality of the control problem (6 DOF, plus redundancy)**, not by
the impulse.

*1 mark for the Gemini 4 observation with the uncontrolled torque named; 1 mark
for tying 24 to 6-DOF authority rather than to thrust or impulse.*

### (ii) Why SAFER did not scale it down (1 mark)

Because the two things that set the nozzle count are properties of the *user*,
not of the impulse budget, and they are unchanged:

- **The user's mass properties are unknown and variable.** A suited crewmember
  with tools, a tether, and an unknown body configuration has an inertia tensor
  and a centre of mass that the system cannot know. Six-degree-of-freedom
  authority means the control law never has to.
- **The user's initial state is, by definition, a tumble.** SAFER is deployed
  only after separation has already gone wrong. Automatic attitude hold must
  arrest an arbitrary tumble *before* any translation is useful, and arresting an
  arbitrary tumble requires torque authority about every axis in both senses.

Impulse scales with the Δv requirement; control authority scales with the
dimensionality of the problem. SAFER carries 4 % of the impulse and 100 % of the
control problem.

### (iii) A modern design (1 mark)

**Yes — 24 again.** The strongest single reason is that the argument above is
not a technology argument and has not aged: the user's mass properties are still
unknown, the initial state is still a tumble, and the alternative to full 6-DOF
authority is a control law that must estimate the crewmember's inertia in real
time from a device that has one shot at working. SAFER has flown essentially
unchanged for three decades because a first-principles analysis converges on it.

**What to change: the valves and the seats.** Modern latching micro-valves with
soft seats and metal-to-metal isolation would cut the standby leak rate of a
device that spends years dormant on an airlock wall, which lengthens the
recertification interval and reduces the amount of nitrogen that has to be
carried as leak margin. That is an operations and logistics gain, not a
performance one — which is the right kind of improvement for contingency
hardware.

*Also creditable: characterising $t_r$ and $t_f$ versus temperature and putting
the calibration in the controller, which would recover part of the pulsed-mode
$I_{sp}$ penalty that puts SAFER at ~40 s against a 76.8 s ideal.*

---

# Mark summary

| question | topic | marks | calculation? |
|---|---|---|---|
| A1 | Multiple choice — gas properties and selection | 5 | partly |
| A2 | Screening against volume and pressure caps | 7 | yes |
| A3 | CO₂ and air — two propellants that look right | 8 | no |
| B1 | Derivation: blowdown ODE, $\tau$, total impulse | 10 | yes |
| B2 | Blowdown, isothermal and adiabatic | 13 | yes |
| B3 | Regulated thruster, $Re_t$, area-ratio trade | 12 | yes |
| C1 | Leak budget and helium conversion | 8 | yes |
| C2 | Regulator SPE, droop, lockup | 5 | yes |
| C3 | Solenoid force, delay, peak-and-hold | 4 | yes |
| C4 | Impulse bit, scatter, throat tolerance | 8 | yes |
| D1 | Regulated-system telemetry interpretation | 8 | yes |
| D2 | Full sizing: AURA-6, tank to valve to nozzle | 8 | yes |
| D3 | Why 24 nozzles | 4 | no |
| | **total** | **100** | **~72 % calculation** |

**Grade bands** (course scale): 90–100 interview mastery; 75–89 working
engineering knowledge; 60–74 familiarity; below 60, re-read modules 28–31
before proceeding to Part V.

---

# Common wrong answers, and what they reveal

1. **Sizing the tank in B2 or D2 with $m = pV/RT$ at high pressure.** At 240–300
   bar the ideal-gas law is 10–15 % optimistic, and optimistic in the direction
   that makes the design look like it closes. B2 deliberately sets $p_i$ at
   30 bar so that $Z = 1$ is *correct* — a student who applies a compressibility
   correction there has learned a rule rather than a criterion.
2. **Getting the sign of the transient term in $I_{bit}$ backwards.** The rise
   subtracts, the fall adds. When $t_f > t_r$ the impulse bit is *larger* than
   $F t_{eff}$. This is the single most reliable error in Part IV.
3. **Dividing rather than multiplying by 2.645** in a helium conversion. It
   loosens the specification by a factor of seven and it survives review because
   the number still looks small.
4. **Quoting $\phi_{iso}$ for a continuous burn.** The adiabatic bound strands
   15 % more propellant *and* delivers what is left at a declining $I_{sp}$.
   Both penalties, one cause.
5. **Ranking cold-gas propellants by $I_{sp}$ when the constraint is volume.**
   Every question in Section A and D2 punishes this, and it is the error that
   MarCO exists to correct.
6. **Treating a vendor's "number of firings" as a life test.** Divide it into the
   total impulse; if you get the quoted minimum impulse bit exactly, you have
   been handed arithmetic, not data.
7. **Using a confidence-C number silently.** The stored-density column of the
   verification worksheet is the one every Part IV answer leans on and the one
   that has never been read from `[NIST-WB]` or `[REFPROP]`. Use it, label it,
   and say what would change if it moved.
8. **Reporting six significant figures from a ±0.05 correlation.** B3(iv) exists
   because the area-ratio trade turned on 0.9 s and the correlation carries
   ±3.8 s. Precision is not accuracy.
