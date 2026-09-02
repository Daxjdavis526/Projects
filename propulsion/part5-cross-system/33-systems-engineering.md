# Module 33 — Systems Engineering for Propulsion
Part V · Prerequisites: Parts I–IV · Estimated time: 8 h

Nobody has ever lost a vehicle because the injector pressure drop was 19 %
instead of 20 %. Vehicles are lost at interfaces: because the tank could not
hold the pump inlet above vapour pressure at the end of the burn, because a
redline fired on a failed sensor rather than a failed engine, because the
feed-line acoustic mode and the first longitudinal structural mode drifted
into each other as propellant drained, because the thrust vector was 0.3° off
the centre of mass and the reaction control system ran out of hydrazine
holding it. The propulsion engineer who only understands the engine is a
component engineer. The one who can state, defend and verify the twenty-odd
numbers that cross the boundary between the engine and everything else is a
propulsion *systems* engineer, and that is the job most propulsion engineers
are actually paid to do. This module is about those numbers: where they come
from, how much margin belongs on each, how you prove you met them, and what
the review board will ask you when you claim you did.

---

## 1. Learning objectives

After this module you should be able to:

1. **Flow a requirement down four levels** — mission → vehicle → engine →
   component — writing each as a verifiable "shall" statement with a parent,
   a rationale, and a verification method, and show the arithmetic that
   connects each child to its parent.
2. **Enumerate the propulsion interface** to structures, thermal, guidance
   and control, avionics, tankage, the spacecraft and the launch vehicle,
   naming for each the one or two quantities that actually drive the design.
3. **Compute the net positive suction head available** at a pump inlet from
   tank pressure, propellant vapour pressure, liquid column and vehicle
   acceleration, and invert it to size the required tank ullage pressure at
   end of burn.
4. **Derive and apply the sensitivities** $\partial \Delta v/\partial I_{sp}$
   and $\partial \Delta v/\partial m_f$, and combine independent
   uncertainties by root-sum-square into a Δv standard deviation.
5. **Distinguish design margin from demonstrated margin**, apply mass growth
   allowance by design maturity, and state the factors of safety and life
   factors that a propulsion structure or pressure component must carry.
6. **Build and stress-test a weighted trade matrix**: score options against a
   datum, compute the weighted ranking, then sweep the weights and report the
   range over which the recommendation survives.
7. **Write a verification matrix** that assigns inspection, analysis, test or
   demonstration to every requirement, and explain why a requirement with no
   verification method is not a requirement.
8. **Lay out a qualification campaign** — qualification versus protoflight,
   test levels relative to the maximum predicted environment, and the order
   of the environmental sequence — and say what each test is protecting
   against.
9. **State what a propulsion engineer must bring** to a system requirements
   review, preliminary design review, critical design review, test readiness
   review and flight readiness review, and what closes each.
10. **Diagnose an interface failure** — pogo, an engine-out that the guidance
    could not absorb, a redline that fired on a sensor — and name the
    interface requirement that was missing or wrong.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| velocity increment | $\Delta v$ | m/s | ideal impulsive velocity change, $I_{sp}g_0\ln(m_0/m_f)$ |
| specific impulse | $I_{sp}$ | s | impulse per unit propellant weight; here always vacuum unless stated |
| effective exhaust velocity | $c$ | m/s | $I_{sp}g_0$ |
| initial / final mass | $m_0$, $m_f$ | kg | stage plus payload at ignition and at cut-off |
| usable propellant | $m_p$ | kg | propellant actually expelled through the engine |
| loaded propellant | $m_{load}$ | kg | usable propellant plus residuals and reserves |
| residuals | $m_{res}$ | kg | trapped, unusable and hold-back propellant at cut-off |
| dry (inert) mass | $m_d$ | kg | stage mass with all fluids removed |
| mass growth allowance | MGA | — | fractional mass allowance applied to a current best estimate by maturity |
| current best estimate | CBE | kg | today's honest mass prediction, no allowance added |
| thrust | $F$ | N | vacuum unless stated |
| chamber pressure | $p_c$ | Pa | stagnation at the injector face |
| mixture ratio | MR | — | oxidiser mass flow / fuel mass flow |
| mass flow | $\dot m$ | kg/s | total propellant flow through the engine |
| net positive suction head, available | $\mathrm{NPSH}_a$ | m | head at the pump inlet above the propellant's vapour head |
| net positive suction head, required | $\mathrm{NPSH}_r$ | m | head the pump needs to avoid unacceptable cavitation |
| tank ullage pressure | $p_t$ | Pa | gas pressure over the liquid |
| vapour pressure | $p_v$ | Pa | saturation pressure at the bulk liquid temperature |
| propellant density | $\rho$ | kg/m³ | at the tank bulk condition |
| liquid column height | $z$ | m | from the free surface to the pump inlet along the acceleration vector |
| axial acceleration | $a$ | m/s² | vehicle acceleration at the station of interest |
| gimbal angle | $\delta$ | rad (deg) | engine deflection from the null axis |
| gimbal rate | $\dot\delta$ | rad/s (deg/s) | commanded angular rate of the engine |
| thrust misalignment | $e$ | m | effective lateral offset of the thrust line from the centre of mass |
| control moment | $M_c$ | N·m | moment the propulsion system can generate about the centre of mass |
| moment arm | $L$ | m | gimbal plane to vehicle centre of mass |
| impulse bit | $I_{bit}$ | N·s | impulse of one minimum commanded pulse of a reaction control thruster |
| maximum predicted environment | MPE | varies | the highest environment the hardware is predicted to see in flight, at a stated statistical level |
| factor of safety | FS | — | ratio of design allowable to limit load |
| proof factor | $k_{pr}$ | — | multiple of maximum design pressure applied in a proof test |
| burst factor | $k_b$ | — | multiple of maximum design pressure the article must survive without rupture |
| maximum design pressure | MDP | Pa | highest pressure the component can see, including transients and failure of one control |
| service life factor | $N_f$ | — | multiple of expected life cycles or seconds demonstrated in test |
| slosh frequency | $f_s$ | Hz | first lateral free-surface mode of a propellant tank |
| pogo | — | — | closed-loop instability between vehicle longitudinal structure and the propulsion feed system |
| accumulator compliance | $C$ | m³/Pa | volume change per unit pressure change of a gas-charged feed-line device |

---

## 3. Theory

### 3.1 What the propulsion systems engineer actually owns

A liquid rocket engine has perhaps a dozen numbers on its data sheet. The
interface control document between that engine and the stage it flies on has
two hundred. That ratio is the whole subject. The engine designer owns the
inside of the engine; the propulsion systems engineer owns the boundary — and
the boundary is where the programme lives or dies, because it is the only
place where two organisations, two analysis models and two sets of
assumptions have to agree in writing. [J]

The boundary has a physical form and a paper form. Physically it is a set of
planes and connections: the gimbal block or thrust cone bolt circle, the
propellant inlet flanges, the electrical connector to the engine controller,
the pneumatic and purge ports, the drain and the instrumentation harness.
On paper it is the interface control document, and every line of it is one of
five kinds of statement:

1. **What the engine does to the vehicle** — thrust and its transient shape,
   side loads during start, gimbal reaction moments, vibration and acoustic
   input, base heating, plume radiation and impingement.
2. **What the vehicle must do for the engine** — inlet pressure and
   temperature at the pump or valve, NPSH, purge gas flow and pressure,
   electrical power quality, chill-down provisions, thermal conditioning,
   and the alignment tolerance of the mounting plane.
3. **Shared geometry and mass** — engine envelope including the maximum
   gimbal excursion, dry mass, centre of gravity, moments of inertia about
   the gimbal axes.
4. **Shared timing** — the command and telemetry protocol, the sequence and
   allowed jitter of start, throttle and shutdown commands, the redline
   response time.
5. **Shared failure behaviour** — what the engine does when the vehicle
   misbehaves, what the vehicle does when the engine misbehaves, and who is
   allowed to command a shutdown.

Every one of the sections below is an elaboration of one of those five, and
the recurring lesson is the same: the interface requirement is almost never
the number the engine designer cares about most. The engine designer cares
about $c^*$ efficiency; the stage cares about the ±2 % thrust tolerance,
because that tolerance sizes the propellant residual. The pump designer cares
about suction specific speed; the tank designer cares about the single number
$\mathrm{NPSH}_r$, because it sets ullage pressure, which sets pressurant
mass, which sets tank wall thickness. [J]

### 3.2 Requirements flow-down

A requirement flows down when a parent statement at one level, combined with
an analysis and a set of allocations, produces child statements at the next
level that are individually verifiable and that collectively guarantee the
parent. Four levels are conventional for a launch vehicle or an in-space
stage:

```
Level 0  MISSION    payload mass, target orbit, launch window, reliability
   |                (customer's language: "1,500 kg to GTO")
Level 1  VEHICLE    stage delta-v, stage masses, thrust-to-weight, burn time,
   |                staging conditions, control authority
Level 2  ENGINE     thrust, Isp, mixture ratio, dry mass, envelope, start/stop
   |                transient, throttle range, life, restarts, inlet conditions
Level 3  COMPONENT  pump discharge pressure, injector delta-p, turbine inlet
                    temperature, wall temperature limit, bearing DN, valve
                    response time
```

Two properties make this a flow-down and not a wish list. First, **each child
has exactly one parent**, and the analysis that connects them is recorded. If
you cannot say which parent a requirement serves, you have a preference, not
a requirement, and it should be deleted before it costs somebody mass.
Second, **every requirement carries a verification method** (§3.16). A
statement that cannot be shown true by inspection, analysis, test or
demonstration is not a requirement; it is an aspiration, and the review board
will strike it. [M]

**The anatomy of a requirement.** Four fields, always:

- **Statement.** One "shall", one subject, one measurable predicate, with
  units and a tolerance. *"The engine shall deliver 22.5 ± 0.7 kN vacuum
  thrust at the nominal inlet conditions of Table 4-2."* Not "shall deliver
  approximately 22.5 kN"; not "shall deliver high thrust"; and never two
  shalls in one sentence, because you cannot pass half a requirement.
- **Parent.** The identifier of the requirement above it.
- **Rationale.** Why this number and not another. The rationale field is the
  most valuable and most often empty field in any requirements database. Two
  years later, when somebody wants to relax 22.5 kN to 21 kN, the rationale
  is the only thing that tells you whether the number came from a control
  authority analysis with no room in it or from a round-number habit.
- **Verification method and level.** Inspection, analysis, test or
  demonstration; at component, engine, stage or vehicle level.

**TBD and TBR.** A number that does not exist yet is marked "to be
determined"; a number that exists but is not trusted is marked "to be
resolved". Both are legitimate at the start of a programme and both are
poison at the end. Programmes track two counts on a chart at every review:
open TBDs and open TBRs, with a named owner and a closure date for each. The
rule of thumb is that all TBDs close by the preliminary design review and all
TBRs by the critical design review; in practice a small tail of them survives
into qualification, and each survivor is an argument waiting to happen. [M]

**The allocation problem.** Flow-down is not division; it is budgeting under
uncertainty. If the stage needs 2,557 m/s and you have three contributors to
Δv error (specific impulse, dry mass, residuals), you do not give each a third
of the error budget. You give the largest share to the contributor whose
uncertainty is hardest to reduce, because the budget is a statement about
what you will spend money to control. §3.14 and Worked Example 2 do this
arithmetic.

### 3.3 The structures interface

**Thrust structure loads.** The engine pushes on the vehicle through the
gimbal bearing or the thrust cone. The primary load is the axial thrust, but
the sizing case is almost never steady axial thrust at nominal. It is one of:

- **Start transient overshoot.** Many engines overshoot their steady thrust
  during the start transient, and staged-combustion and gas-generator engines
  can exhibit a chamber-pressure spike as the turbopump spins up faster than
  the mixture ratio settles. A 10–20 % overshoot lasting tens of
  milliseconds is a routine design case. [E]
- **Simultaneous gimbal and thrust.** With the engine deflected by $\delta$,
  the axial component is $F\cos\delta$ and a lateral component $F\sin\delta$
  appears at the gimbal plane, producing a bending moment $F L \sin\delta$ at
  the vehicle centre of mass, where $L$ is the gimbal-plane-to-cg distance.
- **Engine-out asymmetry.** On a multi-engine stage the loss of one outboard
  engine puts a permanent lateral offset into the thrust vector, and the
  thrust structure must carry the resulting torsion and bending for the rest
  of the burn (§3.6 and §6.2).
- **Side loads during nozzle start-up at sea level.** An overexpanded nozzle
  starting at atmospheric pressure experiences asymmetric flow separation and
  a transient lateral load that can exceed the gimbal actuator capability;
  this is why large first-stage nozzles are structurally sized by a transient
  that lasts a fraction of a second [SB, SP-8120].

$$M_c = F\,L\,\sin\delta \qquad\text{and}\qquad F_{lat} = F\sin\delta$$

> **Eq. 3.1** — variables: $M_c$ control moment about the vehicle cg [N·m];
> $F$ engine thrust [N]; $L$ distance from gimbal plane to cg [m]; $\delta$
> gimbal angle [rad]; $F_{lat}$ lateral force at the gimbal plane [N].
> Meaning: gimballing converts a fraction of thrust into a control moment,
> and the thrust structure must react the lateral component. Assumes: rigid
> vehicle, thrust line through the gimbal point, single engine or symmetric
> cluster. Fails when: the vehicle is flexible enough that the bending mode
> couples with the control loop (the classic thrust-vector-control/bending
> interaction), or when the engine's own centre of mass offset from the
> gimbal point adds an inertial term during rapid gimballing.

**Gimbal loads.** Gimballing an engine is not free. The actuator must
overcome (i) the gimbal bearing friction moment, (ii) the inertial moment of
the engine mass about the gimbal axis, $J\ddot\delta$, (iii) the restoring
moment of the propellant flex ducts and the electrical harness, which for
large cryogenic ducts is substantial and pressure-dependent, and (iv) any
aerodynamic moment on the nozzle at low altitude. Item (iii) is the one that
surprises people: a high-pressure flex duct behaves like a stiff spring whose
rate rises with internal pressure, so the actuator sizing case is at maximum
chamber pressure, not at start. [E] [SP-8123]

The interface requirement that comes out of this is a pair of numbers the
guidance engineer will ask for on day one: **maximum gimbal angle** (typically
±5° to ±10.5° for a launch vehicle main engine, ±3° to ±6° for an upper stage)
and **maximum gimbal rate** (typically 5–30 °/s). Both are control-authority
numbers, not engine numbers, and both cost mass — actuator, hydraulic or
electromechanical power, and the envelope the deflected nozzle sweeps.

**Engine mass and centre of gravity.** The engine is often the single densest
item on the stage and it hangs at the aft end, at the end of the longest
moment arm. Three numbers cross the interface: dry mass, cg location in the
engine coordinate frame, and the moments of inertia about the two gimbal
axes. All three must be stated *as installed*, meaning with the gimbal
bearing, the heat shield, the controller and the harness included — and this
is exactly the ambiguity behind the RS-25's two published dry masses,
3,177 kg (7,004 lb) for the bare powerhead-plus-nozzle against 3,526 kg
(7,775 lb) for the manufacturer's installed figure [SB]. A 350 kg
disagreement on one engine is a stage-level mass problem, and it exists
purely because two organisations drew the boundary in different places. Write
the boundary into the interface document with a drawing, not a sentence. [J]

**Vibration environments.** The engine is both a source and a receiver. As a
source it delivers to the stage: broadband random vibration from combustion
and turbomachinery, discrete tones at pump shaft and blade-passing
frequencies, low-frequency thrust oscillation, and — for a first stage — an
acoustic field at lift-off that is reflected from the pad and is usually the
sizing environment for everything on the vehicle. As a receiver it must
survive the stage's transportation, lift-off acoustics, transonic buffet, and
its own neighbours' output.

The paper form of this is the **maximum predicted environment**, a random
vibration power spectral density in g²/Hz, an acoustic level in dB, and a
shock response spectrum, each stated at a statistical level (commonly
P95/50 — the level exceeded by no more than 5 % of flights, estimated with
50 % confidence). Qualification levels are then set above the MPE by a margin
(§3.17) [STD-7001, SMC-S-016]. The propulsion engineer's obligation here is
twofold: deliver a defensible source specification early, because everybody
else's structural design waits on it, and refuse to accept a receiver
specification whose margin has been silently eaten by three organisations
each adding their own 3 dB.

### 3.4 Pogo and the accumulator

Pogo is the closed-loop instability formed when the vehicle's longitudinal
structural mode, the propellant feed line, and the engine's response to inlet
pressure close a positive feedback loop. The mechanism is worth stating in
full because it is the canonical propulsion–structures interface failure and
because every element of it belongs to a different engineering group. [F]

1. The vehicle oscillates longitudinally at a structural frequency $f_s$
   (first "accordion" mode, typically 5–25 Hz for a large launch vehicle,
   rising through the burn as propellant drains).
2. That oscillation accelerates the propellant column in the feed lines,
   modulating the pump inlet pressure at $f_s$.
3. The pump converts inlet pressure oscillation to discharge pressure and
   flow oscillation, which modulates chamber pressure and therefore thrust.
4. Thrust oscillation at $f_s$ drives the structural mode. If the loop gain
   exceeds unity with the right phase, the amplitude grows.

The feed system's own dynamics set the phase. A liquid-filled line of
inertance $I = \rho \ell / A$ terminated by a compliance $C$ behaves as a
Helmholtz-type resonator with

$$f_{feed} = \frac{1}{2\pi}\sqrt{\frac{1}{I\,C}}, \qquad I = \frac{\rho \ell}{A}$$

> **Eq. 3.2** — variables: $f_{feed}$ feed-system resonant frequency [Hz];
> $I$ line inertance [kg/m⁴]; $C$ compliance [m³/Pa]; $\rho$ propellant
> density [kg/m³]; $\ell$ line length [m]; $A$ line flow area [m²].
> Meaning: the feed line is a mass-spring system whose "mass" is the
> propellant column and whose "spring" is whatever is compressible — trapped
> gas, line elasticity, or a deliberate accumulator. Assumes: lumped
> parameters, single dominant compliance, incompressible liquid elsewhere,
> no distributed wave effects. Fails when: line length approaches a quarter
> acoustic wavelength, when the pump inducer cavitates (cavitation
> compliance is nonlinear and flow-dependent), or when two lines interact.

**The fix is to move $f_{feed}$ away from $f_s$, and the cheapest way to move
it is to add compliance $C$ at the pump inlet** — a gas-charged accumulator, a
volume of helium or of the propellant's own vapour held in a standpipe at the
pump inlet. Adding compliance lowers $f_{feed}$ as $C^{-1/2}$, decoupling the
feed line from the structure and adding damping. The Saturn V programme
learned this the expensive way: the S-IC exhibited pogo on early flights and
was treated by filling the LOX prevalve cavities with helium, and the S-II
centre engine shut down 132 s early on Apollo 13 because of a pogo oscillation
in that engine's LOX feed system, after which an accumulator was fitted to the
S-II centre engine LOX line [SP-4206]. The Shuttle's main propulsion system
carried a pogo suppression accumulator on the LOX side of each RS-25 from the
start, because by then nobody was willing to fly a hydrogen–oxygen vehicle
without one [SSME-Orient]. [H]

What the propulsion engineer owes the structures and loads group is not "the
engine is fine". It is a **pump transfer function**: the complex gain from
inlet pressure perturbation to discharge flow and chamber pressure
perturbation, as a function of frequency, inlet pressure, and — critically —
inducer cavitation state, because cavitation compliance is what makes the
loop gain rise as tank pressure falls near the end of a burn. That transfer
function is measured on a pump test stand with a deliberate inlet pressure
oscillator, and it is one of the few propulsion deliverables whose customer
is entirely outside propulsion. [M] [SP-8109]

### 3.5 The thermal interface

Four distinct problems live here, and they have almost nothing to do with
each other except that they all arrive on the same interface document.

**Base heating.** The exhaust plumes of a clustered stage entrain ambient air,
recirculate, and can carry hot gas *forward* into the base region between and
around the nozzles. Two mechanisms: convective recirculation, which grows as
the plumes expand at altitude and begin to interact, and radiation from the
plume itself. Base heating is worst not at lift-off but at intermediate
altitude where the plumes have expanded enough to merge but the atmosphere is
still dense enough to support recirculation. It sizes the base heat shield,
the engine compartment insulation, and sometimes the routing of every line in
the aft skirt. The propulsion engineer supplies the plume: species, temperature
and pressure fields, and the afterburning behaviour of a fuel-rich exhaust
when it meets atmospheric oxygen — which is why gas-generator engines with
fuel-rich turbine exhaust dumped overboard, such as the F-1 with its
film-cooling curtain of generator exhaust, produce a hotter base environment
than their chamber gases alone would suggest [F1-R3896]. [E]

**Plume radiation.** A rocket plume radiates strongly in the infrared from
H₂O and CO₂ bands and, for aluminised solids, as a near-grey body from
condensed Al₂O₃ at 2,000–3,000 K. Radiative flux to a surface scales as
$\varepsilon\sigma T^4$ times a view factor, so the design variables the
propulsion engineer controls are plume temperature (set by propellant choice)
and geometry (nozzle exit position and spacing). For an aluminised solid
booster strapped to a core stage, plume radiation onto the core is often the
sizing thermal load on the core's aft insulation. [F]

**Cryogenic soak.** A cryogenic tank cools everything it touches. The engine
sits below the tank, the lines run through the aft compartment, and after
loading, the whole aft end soaks toward propellant temperature for hours. The
consequences: local air liquefaction and even oxygen enrichment on lines
below 90 K (a fire hazard, and the reason lines are purged and insulated
rather than left bare), embrittlement of anything that was chosen for room
temperature, differential contraction across bolted joints that were torqued
at 293 K, and viscosity changes in actuator fluids. Cryogenic soak is a
*duration* problem: a two-hour hold at the pad is a different thermal case
from a nominal count, and launch-hold thermal cases are a routine cause of
late design changes. [M]

**Engine compartment purge and conditioning.** The aft compartment is purged
with dry nitrogen or helium before and during loading, for three reasons that
are frequently confused: (i) **inerting** — keeping the oxygen concentration
below the flammability limit so that a hydrogen leak cannot find an oxidiser;
(ii) **moisture exclusion** — keeping humid air off surfaces below 273 K,
because ice on a valve or a gimbal bearing is a mechanism failure; (iii)
**thermal conditioning** — holding components within their operating range,
which sometimes means warming them. Helium is used where hydrogen is present
because nitrogen freezes at LH₂ temperature; that single fact drives a large
part of a hydrogen vehicle's ground helium budget, and helium supply has
delayed real launches [G-095]. The interface numbers are purge gas flow rate,
supply pressure and temperature, and the compartment oxygen concentration
that must be demonstrated before the count proceeds.

### 3.6 The guidance, navigation and control interface

GN&C asks propulsion for six things. Each of them is an engine requirement
that has nothing to do with performance.

**1. Thrust vector authority.** The control system must generate enough moment
to counter the worst-case disturbance with margin. Setting the required
gimbal angle:

$$F\,L\,\sin\delta_{req} \;\ge\; M_{dist} \;=\; F\,e \;+\; M_{aero} \;+\; M_{misc}$$

> **Eq. 3.3** — variables: $\delta_{req}$ required gimbal angle [rad]; $L$
> gimbal-plane-to-cg arm [m]; $e$ effective thrust misalignment [m];
> $M_{aero}$ aerodynamic moment from angle of attack and wind [N·m];
> $M_{misc}$ everything else (engine-out asymmetry, slosh, cg lateral
> offset). Meaning: gimbal authority is sized by disturbances, not by
> steering. Assumes: rigid body, single gimballed engine, small angles.
> Fails when: multiple engines share the load unequally, when the vehicle is
> flexible (bending modes need extra authority and rate), or when the
> disturbance is dynamic rather than quasi-static.

Typical practice allocates the total authority roughly: one third to steering
and trajectory shaping, one third to wind and aerodynamic disturbance, one
third to misalignment, cg offset and margin. Then rounds up. [J]

**2. Gimbal rate.** Authority is not enough; the control loop needs bandwidth.
The gimbal actuator's rate limit and its frequency response set the maximum
usable control bandwidth, which must sit well above the rigid-body control
frequency and, ideally, below the first bending mode — or, if it cannot, the
bending mode must be actively filtered, and now the propulsion actuator's
phase lag is inside a structural stability argument. This is why the actuator
transfer function, not just its rate limit, is an interface deliverable. [M]

**3. Thrust rise and tail-off shape.** Guidance integrates thrust. What it
needs is not the steady value but the *repeatability of the impulse in the
transients*: the impulse delivered between the start command and 90 % thrust,
and between the cut-off command and zero thrust. Tail-off impulse is the
dominant cut-off error source for a stage that terminates a burn on a
velocity condition, because tail-off is where the propellant left in the
manifolds and cooling jacket burns at a falling and poorly repeatable mixture
ratio. A spread of ±5 % on tail-off impulse, on an upper stage that delivers
1 % of its total impulse after the cut-off command, is a direct injection
accuracy error. Solid motors are much worse: the tail-off of a large solid is
long, low and variable, which is exactly why precision upper stages are
liquid.

**4. Engine-out.** "Engine-out capability" means the vehicle can complete the
mission, or reach a safe abort, after losing one engine. It is a system
property, not an engine property, and it costs: the remaining engines must
have thrust margin or the burn must lengthen (which costs gravity loss and
Δv); the control system must have authority for the asymmetric thrust; the
thrust structure must carry the asymmetric load; and the failure detection
must be fast and correct enough to shut the failed engine down before it
damages its neighbours. The last is the hard part, and it is an avionics
problem (§3.7).

**5. Throttle profile.** Two constraints usually shape it. Near maximum
dynamic pressure the vehicle throttles down to limit aerodynamic loads on the
structure — the Shuttle's "throttle bucket" to 67 % around max-Q is the
canonical case [SSME-Orient] — and late in a burn the vehicle throttles down
to limit axial acceleration, either for structural reasons or for crew or
payload g-limits, typically 3 g for crew and 4–6 g for structures. The engine
requirement that falls out is a throttle *range*, a throttle *rate* (%/s), and
a guarantee of stable combustion and adequate cooling at every point in
between — the low end of the range is where combustion stability margin and
injector pressure drop are worst, because injector Δp falls as the square of
flow while chamber pressure falls only linearly.

**6. Reaction control impulse bit.** The attitude controller's needs flow down
to the smallest impulse the thruster must deliver. For a spacecraft that must
hold a pointing deadband $\theta_{db}$ about an axis with inertia $J$, using
thrusters at moment arm $r$ producing thrust $F$ for a minimum on-time
$t_{min}$:

$$I_{bit} = F\,t_{min}, \qquad \Delta\omega = \frac{I_{bit}\,r}{J}, \qquad
T_{limit} = \frac{4\,\theta_{db}}{\Delta\omega}$$

> **Eq. 3.4** — variables: $I_{bit}$ impulse bit [N·s]; $\Delta\omega$ rate
> change per pulse [rad/s]; $J$ inertia about the control axis [kg·m²]; $r$
> moment arm [m]; $\theta_{db}$ half-width of the attitude deadband [rad];
> $T_{limit}$ limit-cycle period [s]. Meaning: the impulse bit sets how
> finely the controller can hold attitude and therefore how much propellant a
> limit cycle costs per orbit. Assumes: pure couple, rigid body, no external
> torque, symmetric deadband, negligible pulse duration compared with the
> limit cycle. Fails when: external torques (gravity gradient, drag, solar
> pressure) dominate, in which case propellant use is set by the torque, not
> the deadband; or when the pulse is so short that the thruster never reaches
> steady state and $I_{bit}$ is neither $F t_{min}$ nor repeatable.

The last clause is the interface trap. Below some on-time, typically 5–20 ms
for a small monopropellant or cold-gas thruster, the impulse bit becomes
strongly nonlinear and its repeatability degrades from a few per cent to tens
of per cent (Module 30). The controller designer will happily ask for a 2 ms
pulse; the propulsion engineer's job is to say what its scatter will be, and
to put the *minimum repeatable impulse bit and its 3σ scatter* in the
interface document rather than the minimum electrical pulse width.

**Thrust misalignment.** Every engine's thrust vector is offset from its
geometric axis by manufacturing tolerance (throat and nozzle asymmetry,
injector pattern non-uniformity) and from the vehicle cg by assembly
tolerance and by cg migration as propellant drains. The two combine into an
effective offset $e$ that produces a constant disturbance torque $Fe$. On a
gimballed stage this is absorbed by trimming the gimbal; on a fixed-thruster
spacecraft it is absorbed by the reaction control system, and it can dominate
the RCS propellant budget. A 500 N apogee engine with a 1 mm effective offset
and a 0.2° angular misalignment on a 2 m arm produces roughly
$500 \times (0.001 + 0.0035) = 2.3$ N·m of disturbance torque, which over a
30-minute burn is 4,100 N·s of angular impulse to be absorbed. That number,
not the thruster's specific impulse, is usually what sizes the RCS tank. [J]

### 3.7 The avionics interface

**The engine controller.** A modern liquid engine carries its own computer.
The archetype is the RS-25 controller: a dual-redundant digital unit mounted
on the engine, which performs engine start and shutdown sequencing,
closed-loop control of thrust (by modulating the oxidiser preburner valve to
hold chamber pressure) and of mixture ratio (by modulating the fuel preburner
and main oxidiser valves), continuous monitoring of engine parameters against
redline limits, and telemetry formatting [SSME-Orient, Biggs89]. Putting the
controller *on* the engine rather than in the vehicle avionics bay is a
deliberate architectural choice with clear consequences: the vehicle sends
high-level commands ("start", "throttle to 104.5 %", "shut down") rather than
valve positions, the engine's control laws and redlines are qualified with
the engine as a unit, and an engine can be swapped without revalidating
vehicle software. The cost is a computer that must survive the engine's own
vibration and thermal environment, which is among the harshest on the
vehicle.

**The sensor set.** What an engine measures is decided by three different
customers and it shows. Control sensors (chamber pressure, a small number of
valve positions, pump speeds) must be fast, redundant and flight-qualified.
Redline sensors (turbine discharge temperatures, pump bearing or seal
temperatures, secondary seal cavity pressures) must be redundant *and* must
fail in a detectable way. Health and development instrumentation (accelerometers
on the turbopumps, strain gauges, additional temperatures) is usually the
first thing deleted for mass and the first thing wanted after a failure.
[J] The right practice is to design the harness and data system to carry
development instrumentation to the end of qualification, and to fly a reduced
but not empty set.

**Redlines.** A redline is a parameter limit that, when exceeded, commands an
engine shutdown. The design of a redline is a probability trade with two
error modes and they are not symmetric:

- A **missed detection** lets a failing engine run to destruction — turbine
  overtemperature to blade failure, bearing failure to shaft seizure, a
  hydrogen leak to a compartment fire.
- A **false alarm** shuts down a healthy engine. On the pad, that is a scrub.
  In flight on a single-engine stage, that is loss of mission.

Which error you protect against depends ruthlessly on flight phase, and good
practice is to change the redline set with phase: tight redlines with rapid
shutdown authority during the ground start sequence, when a shutdown costs a
scrub and nothing else, and progressively fewer and looser redlines after
lift-off, when a shutdown costs the mission. Some parameters are *inhibited*
entirely after a certain time. That is not sloppiness; it is a considered
statement that after lift-off, an engine that is degrading is still better
than an engine that is off. [M]

The other half of redline design is **sensor fault accommodation**. A redline
implemented as "shut down if this temperature exceeds X" will shut down on an
open circuit. The corrective architecture is dual or triple sensors with
qualification logic: a channel is disqualified if it disagrees with its mate
by more than a threshold, or if it moves faster than physically possible, or
if it reads outside the instrument range; and shutdown requires two qualified
channels in agreement. The RS-25's history contains the textbook illustration
(§6.1). [H]

**Command timing.** The vehicle and the engine must agree on time. The
interface specifies command latency and jitter, the response time from
command receipt to valve motion, the telemetry frame rate and its time-tagging
accuracy, and the behaviour on loss of communication — which must be defined,
because "the engine keeps doing what it was doing" and "the engine shuts down"
are both defensible and only one of them is in your document. For a staged
vehicle the sequencing tolerances matter enormously: the interval between
upper-stage ignition and lower-stage separation, the ullage settling burn
duration before a restart, and the allowed jitter on each.

**Health monitoring.** Beyond redlines, modern practice adds algorithms that
watch trends rather than limits — rate of change of a temperature, deviation
of a parameter from a model prediction, spectral content of an accelerometer
signal at pump synchronous frequency. The value is highest between flights
(deciding whether to pull an engine) and in ground test; giving such an
algorithm shutdown authority in flight is a much larger step, and programmes
have been cautious about it for exactly the false-alarm reason above. [M]

### 3.8 The tank interface

**Net positive suction head is the interface requirement.** Everything else on
this list is negotiable; this one is a physical inequality, and if it is
violated the pump cavitates, head collapses, flow oscillates, and the engine
either shuts down or destroys itself in seconds. State it once, in metres of
propellant column, and design the whole stage around it. [F]

$$\mathrm{NPSH}_a = \frac{p_t - p_v - \Delta p_{line}}{\rho\,g_0} + \frac{z\,a}{g_0}
\;\ge\; k_{NPSH}\,\mathrm{NPSH}_r$$

> **Eq. 3.5** — variables: $\mathrm{NPSH}_a$ available head at the pump inlet
> [m]; $p_t$ tank ullage pressure [Pa]; $p_v$ propellant vapour pressure at
> the bulk temperature [Pa]; $\Delta p_{line}$ friction and dynamic pressure
> loss from tank outlet to pump inlet [Pa]; $\rho$ liquid density [kg/m³];
> $z$ liquid column height above the inlet [m]; $a$ axial acceleration
> [m/s²]; $g_0 = 9.80665$ m/s²; $k_{NPSH}$ the required margin factor,
> typically 1.5 on head or an equivalent absolute margin. Meaning: the pump
> inlet must sit a stated head above the point at which the propellant boils.
> Assumes: steady flow, uniform bulk temperature, no vapour ingestion, no
> thermal stratification in the tank. Fails when: the surface layer is warmer
> than the bulk (stratification raises the effective $p_v$ at the surface but
> the relevant $p_v$ is at the *inlet* temperature — get this backwards and
> you will over- or under-pressurise the tank), when sloshing uncovers the
> outlet, or when the acceleration is not aligned with $z$.

Read the equation as a design tool and it tells you everything about the
interface. The worst case is **end of burn**: $z$ is smallest, $\Delta p_{line}$
is at full flow, and the tank has been drained so ullage pressure is hardest
to hold. It is *not* the worst case for acceleration, which is highest at the
end — which is why long, high-acceleration burns are kind to pumps and short
coasting restarts are cruel. Note also that $\rho g_0$ is the exchange rate
between metres of head and pascals of tank pressure: for liquid oxygen that is
11.2 kPa per metre; for liquid hydrogen it is 0.69 kPa per metre. Hydrogen
needs *more* metres of NPSH but each metre is sixteen times cheaper in tank
pressure. That single ratio explains most of the architectural difference
between hydrogen and dense-propellant stages. [F]

Three ways to satisfy the inequality, in increasing order of cost:

1. **Raise tank pressure.** Costs pressurant mass and tank wall thickness, and
   both scale with tank volume, which is largest for hydrogen. Cheap for a
   pressure-stabilised tank that needs the pressure anyway.
2. **Subcool the propellant.** Load the propellant below its boiling point so
   $p_v$ falls. Densified propellant buys NPSH *and* volume simultaneously and
   costs ground complexity and a boil-off clock during the count. [M]
3. **Add a boost pump.** A low-speed, low-head inducer stage upstream of the
   main pump that tolerates far lower inlet head and raises the pressure into
   the main pump. Costs hardware, mass, complexity and a drive. This is the
   architecture of the RS-25 with its low-pressure fuel and oxidiser
   turbopumps ahead of the high-pressure units, and it is exactly what allowed
   the Shuttle External Tank to run at a low ullage pressure and therefore a
   thin wall [SP-8107, SSME-Orient]. The mass moved from the tank to the
   engine; the system got lighter.

**Ullage and pressurisation.** Ullage volume is not just gas space; it is a
requirement in its own right, sized by thermal expansion of the loaded
propellant over the allowed hold time, by the volume needed to keep the
pressurant temperature and mass sensible, and by the need to never fill the
tank completely (a liquid-full tank has essentially infinite pressure
stiffness and will burst on a thermal transient). Pressurisation systems are
covered in Module 12 and [SP-8112]; what matters here is the interface number:
the tank must deliver a stated pressure at the outlet **over the whole burn
including the transients**, and the pressurant mass estimate must include the
factor of 2–3 by which real pressurant demand exceeds the isothermal ideal,
because the incoming gas cools against the cold liquid and the cold tank wall.
Sizing a helium bottle from $m = p V/(R T)$ at ambient temperature and no
margin is the most common mistake in a first stage design. [E]

**Slosh.** Liquid in a partly full tank has lateral free-surface modes. For a
cylindrical tank of radius $R$ with liquid depth $h$ under acceleration $a$,
the first antisymmetric mode is

$$\omega_1^2 = \frac{1.841\,a}{R}\tanh\!\left(\frac{1.841\,h}{R}\right)$$

> **Eq. 3.6** — variables: $\omega_1$ first slosh mode angular frequency
> [rad/s]; $a$ axial acceleration [m/s²]; $R$ tank radius [m]; $h$ liquid
> depth [m]; 1.841 is the first zero of $J_1'$. Meaning: the free surface
> behaves as a pendulum whose frequency scales as $\sqrt{a/R}$. Assumes:
> right circular cylinder, inviscid liquid, small amplitude, flat-bottomed
> geometry, no baffles. Fails when: amplitude is large (the mode goes
> nonlinear and can rotate), when the tank is a sphere or has a domed bottom,
> or when baffles are present — which is the point of baffles, since they add
> damping without much changing frequency.

The interface issue is that $\omega_1$ falls as acceleration falls and changes
continuously as the tank drains, so during a long burn the slosh frequency
sweeps through a range — and if it sweeps through the control system's
rigid-body frequency, the controller and the liquid can exchange energy. The
propulsion engineer supplies the equivalent mechanical model (a pendulum or
spring-mass with mass, frequency and damping as functions of fill fraction)
and, if damping is inadequate, ring or radial baffles. Damping ratios of
0.5–1 % are typical unbaffled; baffles raise this several-fold. [E]

**Residuals and reserves.** Two different quantities, routinely conflated:

- **Residuals** are propellant you cannot use: liquid trapped below the tank
  outlet, held in lines, sumps, cooling jackets and the engine at shutdown,
  vapour in the ullage, and the hold-back needed to prevent gas ingestion.
  Residuals are a *design* quantity, typically 0.5–2 % of the load, and they
  are dead mass at cut-off — they hurt Δv twice, once because you carried them
  and once because you did not burn them.
- **Reserves** are usable propellant deliberately held back to cover
  dispersions: performance below prediction, higher drag, a longer burn. A
  flight performance reserve is sized statistically, commonly at 3σ of the
  Δv dispersion, and if the flight goes nominally it is simply not used.

**Loading accuracy and propellant utilisation.** You cannot load a tank
exactly. Loading accuracy comes from level sensing (point sensors,
capacitance probes), flow metering, and mass measurement, and 0.2–0.5 % of
load is a good number for a cryogenic stage. Combined with mixture ratio
error in the engine, a loading error means one tank runs dry before the
other, and whatever is in the other tank is pure dead mass. Two remedies:
**bias the load** — deliberately load slightly more of the propellant whose
early depletion is more benign, accepting a small performance loss for a
guaranteed outcome — or **close the loop** with a propellant utilisation
system that measures both tank levels and trims the engine mixture ratio to
drive both to zero simultaneously. The J-2 did exactly this, with a PU valve
that shifted mixture ratio between 4.5:1 and 5.5:1, trading thrust
(780–1,000 kN) against specific impulse, used both to burn the tanks dry
together and to manage the S-II's acceleration [SP-4206]. [H]

**Geysering.** A long vertical downcomer full of cryogenic liquid, warmed
along its length, can boil locally; the vapour bubble rises and expands, and
because the column above is heavy the bubble accelerates, expelling a slug of
liquid upward into the tank. The column then refills, hammering the line — a
pressure surge capable of rupturing it. The problem is specific to tall
vehicles with long, unfilled-flow lines during the pre-launch hold, and the
standard fixes are a helium bubbling line that keeps the column circulating,
a recirculation line back to the tank, or insulating the downcomer. It is one
of those failure modes that belongs to nobody: the tank group says it is a
line problem, the engine group says it is a tank problem, and it will remain
unowned until it hurts somebody. Own it. [H] [J]

### 3.9 The spacecraft interface

Spacecraft propulsion adds interfaces that a launch vehicle does not have.

**Plume impingement and contamination.** A thruster firing near a solar array,
a radiator, a star tracker or an optical instrument does two kinds of damage.
Mechanically, the plume applies a force and a torque — often opposing the very
manoeuvre being commanded, so that a poorly placed thruster delivers less than
half its nominal impulse to the vehicle. Thermally, it heats the surface.
Chemically, it deposits: unburned propellant, combustion products, and for
hydrazine thrusters ammonia and hydrazine themselves, which condense on cold
surfaces and degrade optical and thermal-control coatings. Contamination
budgets are written in micrograms per square centimetre and are enforced by
plume analysis (a Direct Simulation Monte Carlo calculation of the rarefied
far field) plus keep-out zones. The propulsion engineer's deliverable is the
plume flow field and the species list; the accepted mitigation is geometry —
cant the thrusters, accept the cosine loss.

**Thermal.** Thruster valves and catalyst beds have minimum temperatures below
which they must not be fired (a cold hydrazine catalyst bed suffers a rough
start and shortened life; a cold bipropellant valve may not seal), and
propellant lines running outside a heated compartment must be kept above the
propellant freezing point — 274.7 K for pure hydrazine, which is above the
temperature of most spacecraft structure in shadow. So every hydrazine
spacecraft carries redundant line heaters and a thermostat architecture, and
the heater power budget is a propulsion-owned number that lands on the power
system. [M]

**Safety inhibits.** Any energetic system that can fire while people are near
it, or while it is mated to a launch vehicle, must have inhibits: independent
physical or electrical barriers between the stored energy and the actuator.
The standard range safety architecture requires **three independent inhibits**
for catastrophic hazards and two for critical hazards, with each inhibit
separately verifiable and no single failure capable of removing more than one.
In propulsion this means, for example, a latching isolation valve, a separate
arm-enable relay, and a software inhibit, with monitoring on each. Designing
these in late is expensive; designing them in at the concept stage is nearly
free. [M]

**Leak-before-burst.** A pressure vessel can fail two ways: a crack can grow
through the wall and vent (leak) or grow unstably along it and rupture
(burst). Leak-before-burst is the design condition in which the critical crack
length for unstable growth exceeds the wall thickness, so any crack that
reaches through-thickness leaks detectably before it reaches critical length.
It is demonstrated by fracture mechanics — the initial flaw assumed to be the
largest the inspection method could miss, grown by the expected pressure and
thermal cycles times the service life factor — and it is what lets a metallic
tank be qualified without a proof-test-every-flight regime. Composite
overwrapped vessels do not generally exhibit leak-before-burst and are handled
under a different, damage-tolerance-based régime [AIAA-S-080, AIAA-S-081]. [M]

### 3.10 The launch vehicle interface

**Staging.** The separation event is a propulsion event at both ends: the
lower stage must shut down cleanly and stop thrusting (which for a solid means
either accepting the tail-off or actively terminating thrust), separation
devices fire, and the upper stage must ignite with its propellant settled
against the tank outlets. The interface numbers are the shutdown-to-separation
delay, the separation impulse and its dispersion, the tip-off rates imparted,
the allowable relative attitude at ignition, and — the one that bites — the
**ullage settling** requirement: how much acceleration, for how long, before
the upper-stage main engine may start. Settling is provided by small solid
motors or by the reaction control system, and its duration is a propulsion
requirement derived from a fluid-dynamics analysis of a moving free surface
in near-zero gravity, which is one of the least certain analyses on the
vehicle. [J]

**MECO and SECO precision.** Injection accuracy is set almost entirely by the
cut-off event. Guidance can compensate for a low-thrust or low-Isp engine by
burning longer, so steady-state performance errors are largely self-correcting
— what it cannot compensate for is the impulse delivered *after* the cut-off
command, because by then the vehicle has stopped steering. The error budget
for a cut-off therefore contains: tail-off impulse mean and dispersion,
command latency, accelerometer scale factor and bias, and the residual
uncertainty in vehicle mass. The propulsion contribution is dominated by
tail-off, and tail-off repeatability is improved by fast-closing valves,
minimal manifold volume downstream of the valve, and a repeatable purge.

**Propellant utilisation.** See §3.8. At vehicle level, the PU system is a
Δv-recovery device: it converts what would be an outage (unusable propellant
in one tank) into usable impulse, at the cost of running the engine off
optimum mixture ratio for part of the burn. The trade is straightforward: the
Isp loss from a mixture-ratio excursion is second-order near the optimum
(Module 03), while the Δv loss from an outage is first-order in the outage
mass. PU almost always wins on a large cryogenic stage and almost never
justifies itself on a small storable one, where a biased load is sufficient.
[J]

### 3.11 The manufacturing and test engineering interface

**Design for inspection.** Every weld you cannot inspect is a weld you will
argue about. The propulsion structures that fail — injector faces, cooling
channel closeouts, manifold-to-chamber joints, turbopump volute welds — often
fail at exactly the features that are hardest to reach with a probe. Design
for inspection means: choose joint geometries that permit radiography or
ultrasonic access; allow room for a borescope; specify a surface finish good
enough for dye penetrant; and, for additively manufactured parts, accept that
computed tomography is the only volumetric method available and that its
resolution limits the largest flaw you can *fail to find*, which is precisely
the flaw size your fracture mechanics must assume [GradlAM]. The link between
inspection capability and the assumed initial flaw size is the most
under-appreciated connection in propulsion structures. [J]

**Acceptance test criteria.** Every flight engine is hot-fired before delivery
(with rare exceptions for small thrusters accepted on lot sampling). The
acceptance test verifies workmanship, not design: it runs at flight-like
conditions for a short duration and checks that measured performance and
health parameters fall inside acceptance bands. The bands are the hard part.
Set them at 3σ of the qualification population and you accept engines that are
drifting; set them at 1σ and you reject good hardware and start arguing about
waivers. Good practice sets acceptance limits on parameters that are
*diagnostic* — pump discharge pressure at a given flow, turbine temperature at
a given power level, the start transient's time to 90 % chamber pressure —
rather than on delivered performance alone, because a workmanship defect shows
up in a diagnostic parameter long before it shows up in Isp. [M] [SP-8041]

**First article.** The first unit built to the released drawings, by the
production process, with production tooling and production personnel, is
inspected exhaustively against every dimension and process specification.
Its purpose is to verify the *process*, not the part. The propulsion-specific
trap is that the first article is usually built by the most experienced people
in the shop, which is exactly the condition that will not obtain for unit 40.
[J]

### 3.12 Method: trade studies

A trade study is a decision made in public. Its output is not a number but an
argument that a reviewer can attack, and its value lies almost entirely in the
attacking.

**The procedure.**

1. **State the decision and the constraints.** What is being chosen, from what
   set, subject to what non-negotiables. Constraints are not criteria: an
   option that violates a constraint is eliminated, not penalised. Confusing
   the two is the most common structural error in a trade study, and it always
   works in favour of the option somebody already liked.
2. **Choose criteria that are independent and complete.** Independent, because
   scoring "mass" and "propellant density" separately double-counts;
   complete, because a criterion you omit is a criterion you have weighted
   zero.
3. **Choose a datum.** The Pugh method scores every option *relative to a
   reference option* on each criterion — better (+), same (0), worse (−), or
   on a −2…+2 scale — rather than in absolute units. This is deliberate: human
   judgment is far more reliable at comparison than at absolute rating, and
   the datum keeps everyone honest about what "good" means.
4. **Weight the criteria** and compute a weighted score.
5. **Sweep the weights and report the range over which the answer holds.**
   This step is the study. The rest is bookkeeping.
6. **Recommend, and state what would change the recommendation.**

$$S_j = \sum_{i=1}^{n} w_i\,s_{ij}, \qquad \sum_i w_i = 100$$

> **Eq. 3.7** — variables: $S_j$ total score of option $j$ [—]; $w_i$ weight of
> criterion $i$ [—]; $s_{ij}$ score of option $j$ on criterion $i$, relative to
> the datum [—]. Meaning: a linear scalarisation of a multi-objective problem.
> Assumes: criteria are independent, preferences are linear in each score, and
> trade-offs between criteria are constant (one point of mass is always worth
> the same amount of schedule). Fails when: any of those assumptions is
> false — which is usually — and especially when one criterion has a hard
> threshold, in which case it is a constraint and does not belong in the sum.

**The trap of false precision.** A weighted matrix produces numbers like 62.4
and 58.7, and everyone in the room starts treating a 6 % difference as a
result. It is not. The scores are ordinal judgments dressed as cardinal
numbers, the weights were chosen in a meeting, and neither carries three
significant figures. There are exactly two honest ways to report a trade
matrix: (i) as a ranking with an explicit statement of how far the weights
must move to change it, or (ii) as a decision that the matrix *did not*
resolve, in which case say so and go find the discriminating analysis or test.
Worked Example 4 shows a matrix in which the winner changes three times as one
weight moves across its plausible range — which is the normal case, not a
pathological one. [J]

The productive use of a trade matrix is diagnostic rather than decisional:
it tells you *which criterion the decision is really about*. If the ranking
flips when the schedule weight moves from 30 to 35, then the decision is a
schedule decision, and you should stop scoring and go get a better schedule
estimate.

### 3.13 Method: margins

**Design margin versus demonstrated margin.** These are different quantities
and programmes have been lost by confusing them.

- **Design margin** is the ratio between a design allowable and a predicted
  load, computed by analysis. It exists in a spreadsheet.
- **Demonstrated margin** is the ratio between a condition at which hardware
  has actually been shown to survive or perform and the condition it must meet
  in flight. It exists in a test report.

Design margin is worth what your analysis is worth. Demonstrated margin is
worth what your test was representative of. A programme that has 40 % design
margin on turbine blade life and has never run a blade past nominal duration
has *no* demonstrated margin, and a review board is entitled to say so.

**Structural factors of safety.** The convention is to define a **limit load**
(the maximum expected in service), then require:

| quantity | typical factor on limit | note |
|---|---|---|
| yield | 1.1–1.25 | no detrimental permanent deformation |
| ultimate | 1.4 | for structures verified by analysis plus test |
| pressure vessel proof | 1.1–1.5 × MDP | applied to every flight article |
| pressure vessel burst | 1.5 × MDP (metallic) | demonstrated on qualification articles |
| lines and fittings, small diameter | 4.0 × MDP burst | historically 4.0 for lines under about 38 mm |
| service life (cycles or time) | 4× expected | fatigue and fracture life demonstration |

> These are the *shape* of the standard factors, not a substitute for the
> governing document. Actual numbers depend on the programme, on whether the
> article is crewed, on whether verification is by analysis alone or by test,
> and on the revision of the standard invoked. Read the contract's tailoring
> of [STD-5001], [AIAA-S-080] and [AIAA-S-081] before using any number in this
> table. [M]

The 4× life factor is the one propulsion engineers meet most often: to certify
an engine for a 500 s mission duty cycle you demonstrate 2,000 s on
qualification engines, and to certify $n$ starts you demonstrate $4n$. It is
not arbitrary — it is a crude but effective allowance for the scatter in
fatigue life, which for a well-controlled metallic component is comfortably a
factor of 4 between the mean and the lower tail, and for a weld or an
additively manufactured part can be more. [E]

**Thermal margins.** Component qualification temperatures are set beyond the
predicted extremes by a margin, and acceptance temperatures beyond the
predicted extremes by a smaller one; margins in the range 10–15 K for
qualification and 5–10 K for acceptance are common practice, with a separate
*uncertainty* margin added to the analytical prediction itself while the model
is unvalidated (often ±20 K until a thermal balance test is run, reduced to
±5–10 K afterwards). Inside the engine, the equivalent statement is a hot-gas
wall temperature limit set 50–150 K below the material's capability, because
the Bartz-class heat-transfer correlations behind the prediction are
themselves only good to ±20–30 % (Module 10). [E] [J]

**Specific impulse margin.** Programme practice is to size the vehicle on a
specific impulse **below** the current best prediction, holding 1–2 % in
reserve. The reason is asymmetry: Isp shortfalls are common and expensive,
Isp surpluses are free. The reserve is retired in stages as evidence arrives —
full margin at concept, reduced after component and injector testing, reduced
again after the first full engine hot fire, and set to the demonstrated value
minus test uncertainty once a qualification population exists. Note the
interaction with test uncertainty: a hot-fire measurement of vacuum Isp on a
sea-level stand, corrected to vacuum, carries perhaps ±0.5–1 % of its own, so
"demonstrated Isp" is never a single number [CPIA-246]. [M]

**Mass growth allowance.** Hardware gets heavier between concept and flight,
always, and by amounts that are statistically predictable from design
maturity. Programmes therefore apply an allowance to each current best
estimate and hold an additional system-level margin on top. A representative
maturity table, in the style of the AIAA mass-properties guidance (S-120 for
mass properties control and G-020 for the estimating practice):

| maturity of the estimate | MGA on CBE |
|---|---|
| conceptual / scaled from analogy, no drawings | 25–30 % |
| preliminary layout, sized by analysis | 15–20 % |
| detailed design, drawings released | 5–10 % |
| existing qualified hardware, new application | 3–5 % |
| existing hardware, identical application | 1–2 % |
| measured on the actual article | 0 (measurement uncertainty only) |

> Nomenclature varies between organisations (basic mass, predicted mass,
> allocated mass, "not-to-exceed"), and the specific percentages are
> organisational practice rather than physics. What does not vary is the
> discipline: MGA is applied *per item by that item's own maturity*, never as
> a single flat percentage on the total, because a stage that is 70 % heritage
> hardware and 30 % new does not have the same growth risk as one that is the
> reverse. [M]

On top of item-level MGA sits **system margin**, held by the programme and not
by the subsystems, typically 10–15 % at the preliminary design review, 5–8 %
at the critical design review, and approaching zero at flight. The single most
useful thing a propulsion engineer can do at a mass review is to state, on one
line: *this is the CBE, this is the MGA and its basis, this is the allocation,
and this is how much of the allocation I have left.* Anyone who reports a
single number is reporting one they have not thought about. [J]

### 3.14 Method: uncertainty analysis

Take the rocket equation as the performance model and propagate. [F]

$$\Delta v = I_{sp}\,g_0 \ln\!\frac{m_0}{m_f}$$

Differentiate with respect to specific impulse, holding masses fixed:

$$\frac{\partial \Delta v}{\partial I_{sp}} = g_0\ln\frac{m_0}{m_f} = \frac{\Delta v}{I_{sp}}
\quad\Longrightarrow\quad \frac{\delta(\Delta v)}{\Delta v} = \frac{\delta I_{sp}}{I_{sp}}$$

> **Eq. 3.8** — variables as above. Meaning: **Δv is exactly as sensitive to
> specific impulse in relative terms as it is possible to be** — a 1 % Isp
> shortfall is a 1 % Δv shortfall, always, at any mass ratio. Assumes: the
> propellant load is fixed (a real vehicle whose tanks are already full).
> Fails when: the comparison is made at fixed Δv instead — then a lower Isp
> demands exponentially more propellant, and the sensitivity is much worse
> than 1:1.

Now differentiate with respect to a dry-mass increment $\delta m_d$ that
appears in **both** $m_0$ and $m_f$ (the propellant load is unchanged; the
stage simply got heavier):

$$\frac{\partial \Delta v}{\partial m_d} = c\left(\frac{1}{m_0}-\frac{1}{m_f}\right)
= -\,c\,\frac{m_p}{m_0\,m_f}$$

> **Eq. 3.9** — variables: $c = I_{sp}g_0$ [m/s]; $m_p = m_0-m_f$ usable
> propellant [kg]. Meaning: added inert mass costs Δv in proportion to the
> propellant mass fraction; on a stage with a large mass ratio it is brutal,
> on a stage with a small one it is mild. Assumes: propellant load fixed.
> Fails when: the added mass forces a propellant offload (volume-limited
> stage), which makes it worse, or when the stage is resized around it, which
> is a different calculation entirely.

And with respect to residual propellant $\delta m_{res}$, which raises $m_f$
alone because the propellant was loaded and then not burned:

$$\frac{\partial \Delta v}{\partial m_{res}} = -\frac{c}{m_f}$$

> **Eq. 3.10** — Meaning: a kilogram left in the tank costs strictly more than
> a kilogram of dry mass, because it was carried but delivered no impulse.
> Assumes: $m_0$ fixed (the propellant was loaded). Fails when: the residual
> is known in advance and simply not loaded, in which case it behaves like
> Eq. 3.9.

For independent contributors, combine by root-sum-square:

$$\sigma_{\Delta v} = \sqrt{\sum_k \left(\frac{\partial \Delta v}{\partial x_k}\right)^2 \sigma_{x_k}^2}$$

> **Eq. 3.11** — variables: $\sigma_{x_k}$ standard deviation of input $k$;
> $\sigma_{\Delta v}$ resulting standard deviation of Δv [m/s]. Meaning: the
> first-order propagation of independent uncertainties. Assumes:
> independence, small perturbations so the model is locally linear, and
> inputs that are meaningfully described by a standard deviation. Fails when:
> inputs are correlated (Isp and mixture ratio are; dry mass and residuals
> often are, because a heavier stage usually has more line volume), when the
> distribution is skewed or bounded (mass growth is one-sided — hardware
> rarely comes in light), or when a term is large enough that curvature
> matters.

**When to Monte Carlo instead.** Run a Monte Carlo when any of the RSS
assumptions fails: correlated inputs, one-sided or bounded distributions,
discrete outcomes (an engine either restarts or does not), or a model with
thresholds. Do *not* run one to add rigour to a linear model — for the
rocket equation over a few per cent, the Monte Carlo standard deviation and
the RSS estimate agree to better than 1 %, as Worked Example 2 demonstrates,
and the Monte Carlo's only real contribution is the shape of the tails. The
common failure mode of Monte Carlo analysis in propulsion is not the method;
it is feeding it input distributions that were invented in a meeting and then
reporting the 99.87th percentile of them to three significant figures. [J]

### 3.15 Method: sensitivity analysis and influence coefficients

An influence coefficient is a partial derivative expressed in units an
engineer can argue about. They are the currency of design meetings, and every
propulsion engineer should carry a handful for their own system:

| coefficient | typical magnitude | what it is for |
|---|---|---|
| $\partial I_{sp}/\partial \mathrm{MR}$ | 5–30 s per unit MR near the optimum, and zero *at* it | sizing PU authority and mixture-ratio tolerance |
| $\partial I_{sp}/\partial p_c$ | ~0.5–2 s per bar at low $p_c$, falling towards zero above ~100 bar | deciding whether more chamber pressure is worth the pump |
| $\partial I_{sp}/\partial \varepsilon$ | large at low $\varepsilon$, ~0.05–0.2 s per unit area ratio near $\varepsilon=100$ | nozzle length and mass trade |
| $\partial F/\partial p_c$ | $F/p_c$ (linear at fixed geometry) | throttling authority, and the throttle-to-Δp relationship |
| $\partial \Delta v/\partial I_{sp}$ | $\Delta v/I_{sp}$ | Eq. 3.8 |
| $\partial \Delta v/\partial m_d$ | Eq. 3.9 | mass reserve negotiations |
| $\partial(\text{payload})/\partial m_d$ | typically −1 kg per kg on an upper stage | the number the customer understands |

Two rules of use. First, **a derivative at the optimum is zero, and that is
information**: $\partial I_{sp}/\partial \mathrm{MR} = 0$ at the optimum
mixture ratio is precisely why running off-optimum for propellant utilisation
is cheap, and why a mixture-ratio tolerance of ±2 % costs almost no
performance while a 2 % thrust tolerance costs real residuals. Second,
**quote the range over which the linearisation holds**. An influence
coefficient with no stated validity range will eventually be extrapolated by
someone in a hurry.

### 3.16 Verification and validation

The definitions are not interchangeable and the distinction is the single
most frequently botched item in a design review. [M]

- **Verification** answers *did we build the thing right?* — does the article
  meet its specified requirements. Its reference is the specification.
- **Validation** answers *did we build the right thing?* — does the article,
  meeting its specification, actually satisfy the need. Its reference is the
  mission.

An engine that meets every line of its specification and cannot start after a
five-hour coast because nobody wrote a coast requirement is verified and not
validated. That is not a hypothetical; it is the standard way in-space stages
fail.

**Verification methods.** Every requirement is assigned exactly one primary
method, and the four are not interchangeable:

| method | what it is | when it is appropriate | propulsion example |
|---|---|---|---|
| **Inspection** | examination against a drawing or document, without operating the article | physical characteristics: dimensions, mass, markings, material certifications | "engine dry mass shall not exceed 120 kg" — weigh it |
| **Analysis** | mathematical modelling, similarity to qualified hardware, or extrapolation from test | conditions that cannot be created on the ground, or that would destroy the article | vacuum Isp of a high-area-ratio nozzle, from sea-level test plus nozzle analysis |
| **Test** | operating the article under controlled conditions with instrumentation and pass/fail criteria | anything you can afford to do and that carries risk | hot-fire duration, start transient, redline function |
| **Demonstration** | operating the article to show a functional capability, usually without detailed instrumentation | operability, procedures, human interfaces | "the engine shall be removable and replaceable in 8 hours" |

The verification matrix is a table with one row per requirement and columns
for method, level (component / engine / stage / vehicle), the procedure that
implements it, and the report that closes it. It is the programme's actual
plan for proving it is done, and it is the artefact the review board spends
its time in. Two rules that survive contact with reality: **analysis that
verifies a requirement must itself be validated against test data**, and
**a requirement verified at a level above the one where the risk lives is
usually not verified at all** — proving on a stage hot fire that the engine
delivers thrust does not verify that the engine delivers thrust *after four
restarts at the cold end of the inlet temperature range*.

### 3.17 Qualification

**Qualification versus protoflight.** Two philosophies.

- **Qualification (dedicated).** Build a dedicated qualification article,
  identical to flight, and test it at qualification levels for qualification
  durations — levels above the maximum predicted environment and durations
  several times the mission. The article accumulates damage and is not flown.
  Flight articles then receive only acceptance testing at the MPE. This is
  the conservative route: full margin demonstrated, on hardware you were
  prepared to break.
- **Protoflight.** Test a *flight* article at qualification amplitude but
  acceptance duration, and then fly it. This saves the cost of a dedicated
  article and the schedule of building it, at the price of flying hardware
  that has seen levels above flight. It suits small programmes, single-unit
  missions and mature designs; it is a poor fit for anything with a fatigue-
  or wear-driven failure mode, which describes most rotating propulsion
  machinery. [M] [SMC-S-016]

**Test levels.** The structure is always the same even though the numbers are
revision-dependent: acceptance testing is performed at the maximum predicted
environment; qualification adds an amplitude margin (commonly 3 dB on random
vibration and acoustics, 6 dB on shock) and a duration or cycle margin
(commonly 2–3× the acceptance duration); protoflight uses qualification
amplitude with acceptance duration. Thermal qualification adds 10–15 K beyond
the predicted extremes and requires a number of thermal cycles well above the
mission's. **Read the invoked revision of [SMC-S-016] and [STD-7001] rather
than these numbers**, and read the programme's tailoring of them, which is
where the arguments actually are.

**The environmental sequence.** Order matters, because the purpose of the
sequence is to find defects, and a defect found after the wrong test tells you
nothing about which test caused it. The conventional order for a propulsion
component:

```
inspection / mass properties / proof pressure
        |
functional and performance baseline
        |
vibration  (random, then sine if required)   <- workmanship defects surface here
        |
shock
        |
thermal cycling / thermal vacuum
        |
functional and performance repeat  <- compare against baseline
        |
life / duration (hot fire, cycles)
        |
burst or destructive examination (qualification article only)
```

Two principles govern it. First, **functional tests bracket every
environment**, so that a change in performance can be attributed to the
environment that preceded it. Second, **the destructive tests come last**, and
the article that goes to burst has already accumulated the full environmental
history, so the demonstrated burst margin is a margin on used hardware rather
than on new. [M]

**What is being protected against.** Vibration and acoustics find workmanship:
cold solder joints, unlocked fasteners, chafed harnesses, cracked braze.
Thermal vacuum finds design and materials problems: seals that leak cold,
lubricants that migrate, mechanisms that bind on differential contraction,
and — for propulsion specifically — valves whose actuation force rises past
the actuator's capability at the cold extreme. Life testing finds wear-out:
bearings, seals, catalyst beds, and thermal fatigue of cooled walls. Each is
looking for a different failure population and none substitutes for another.

### 3.18 Reviews: what a propulsion engineer brings

A review is a gate at which the programme decides whether it has earned the
right to spend the next tranche of money. The propulsion engineer's material
at each is different in kind, not just in maturity.

**System requirements review (SRR).** *Question: do we understand what is
being asked?* Bring: the propulsion requirements set traced to mission
requirements, with rationale; the mission Δv budget and its assumptions; the
propellant and cycle trade study with its sensitivity sweep; the environments
you will impose on everyone else (a first cut at thrust, vibration, base
heating) and the ones you need from them (inlet conditions, thermal
environment, power); a list of every TBD and TBR with an owner. What closes
it: agreement that the requirements are complete, consistent, verifiable, and
achievable.

**Preliminary design review (PDR).** *Question: is the design approach sound
and does it close?* Bring: the engine or system concept with a power balance
that closes; a mass statement with CBE, MGA and allocation; performance
predictions with margin policy stated; the failure modes and effects analysis
at functional level; the interface control document at draft; the preliminary
verification matrix; long-lead procurement identified; the risk register with
mitigations. What closes it: a design that can be shown to meet requirements
with margin, and a credible plan to verify it. The most common propulsion
failure at PDR is a power balance or a thermal balance that closes only at
nominal, with no statement of what happens at the corners of the tolerance
box.

**Critical design review (CDR).** *Question: is it ready to build?* Bring:
released drawings and specifications; the completed structural, thermal and
dynamic analyses with margins of safety; qualification test plans with levels
and pass/fail criteria; the completed verification matrix with every
requirement assigned; component qualification status; the interface control
document signed by both sides; closed TBRs; and — the item most often
missing — the analysis showing behaviour at the *worst-case combination* of
tolerances, not the worst case of each in isolation. What closes it:
authorisation to manufacture.

**Test readiness review (TRR).** *Question: are we ready to run this specific
test safely and get usable data?* Bring: the test objectives mapped to the
requirements they verify; the procedure with the sequence and abort criteria;
the instrumentation list with ranges, accuracies and sample rates, and the
demonstration that they are adequate for the measurement uncertainty you
promised; redline settings for the test article and the facility; the hazard
analysis; the data reduction plan *written before the test*; and the
disposition of every open discrepancy on the article. What closes it: nothing
outstanding that could cost you the article or the data.

**Flight readiness review (FRR).** *Question: is this specific article ready
to fly this specific mission?* Bring: as-built configuration against
as-designed, with every deviation and waiver listed and dispositioned;
acceptance test results with trends against the population; the closure of
every verification item; open anomalies from previous flights or from this
article's own history with rationale for flying; the flight-specific
predictions (duty cycle, propellant load, expected performance with
dispersions); and the constraints and commit criteria you are imposing on the
count. What closes it: a signature, and the willingness to give it.

The pattern is worth stating plainly, because it is the whole of systems
engineering compressed: **SRR is about requirements, PDR about feasibility,
CDR about completeness, TRR about safety and data, FRR about this particular
article.** An engineer who brings CDR material to SRR wastes everyone's time;
an engineer who brings SRR material to CDR has a programme in trouble. [J]

---

## 4. Typical engineering ranges

| quantity | typical range | extremes and who sits there |
|---|---|---|
| gimbal angle, launch vehicle main engine | ±5° to ±10.5° | RS-25 gimbals ±10.5° in pitch and yaw; upper-stage engines often ±3–4° |
| gimbal rate | 5–30 °/s | rate limits are set by the first bending mode and actuator power |
| thrust tolerance, engine specification | ±2 % to ±3 % of nominal | tight tolerances cost acceptance-test rejections and buy residual margin |
| Isp margin held at concept | 1–2 % | retired progressively as test evidence arrives |
| MGA, preliminary design | 15–20 % of CBE | conceptual estimates carry 25–30 % |
| system-level mass margin at PDR | 10–15 % | approaching 0 % at flight |
| propellant residuals | 0.5–2 % of load | pressure-fed storable systems at the low end; long, complex cryogenic feed systems at the high end |
| flight performance reserve | ~3σ of Δv dispersion | typically 0.5–2 % of stage Δv |
| loading accuracy, cryogenic stage | 0.2–0.5 % of load | drives outage and PU system need |
| $\mathrm{NPSH}_r$, main pump (as head) | 5–30 m of propellant | hydrogen at the high end in metres, low end in pascals |
| NPSH margin factor $k_{NPSH}$ | 1.3–2.0 on $\mathrm{NPSH}_r$ | or an absolute margin where $\mathrm{NPSH}_r$ is small |
| upper-stage tank ullage pressure | 1.5–4 bar | LH₂ tanks at the low end; dense-propellant tanks higher for the same head |
| structural ultimate factor of safety | 1.4 on limit | crewed and pressurised systems can carry more |
| pressure-vessel burst factor | 1.5 × MDP metallic | small lines and fittings historically 4.0 |
| service life demonstration factor | 4× mission duration and cycles | the near-universal engine qualification rule |
| qualification vibration margin | +3 dB over MPE, 2–3× duration | shock commonly +6 dB |
| qualification thermal margin | 10–15 K beyond predicted extremes | acceptance 5–10 K |
| slosh damping, unbaffled | 0.5–1 % of critical | baffles raise this several-fold |
| pogo-relevant structural frequency | 5–25 Hz, rising through the burn | large launch vehicles; the S-II and Titan II are the classic cases |
| RCS minimum repeatable impulse bit | 10⁻³ to 10⁻¹ N·s | cold gas at the low end; 400–500 N bipropellant thrusters at the high end |
| thrust misalignment, effective | 0.5–3 mm equivalent offset | drives RCS sizing on fixed-thruster spacecraft |

---

## 5. Worked examples

### WE1 — Full flow-down: 1,500 kg to geostationary transfer orbit

**The mission requirement.** *"The system shall deliver a 1,500 kg spacecraft
to a geostationary transfer orbit of 185 km × 35,786 km at 28.5° inclination."*
The launch vehicle delivers the stage and payload to a 185 km circular
parking orbit at 28.5°; the upper stage performs the transfer injection.

**Level 0 → Level 1: the Δv requirement.**
Circular velocity at $r_p = 6{,}563$ km (185 km altitude, $\mu = 398{,}600.4$
km³/s²):

$$v_c = \sqrt{\mu/r_p} = \sqrt{398{,}600.4/6{,}563} = 7.7932\ \mathrm{km/s}$$

Perigee velocity of the transfer ellipse with $r_a = 42{,}164$ km, so
$a = (6{,}563+42{,}164)/2 = 24{,}363.5$ km:

$$v_p = \sqrt{\mu\left(\frac{2}{r_p}-\frac{1}{a}\right)}
= \sqrt{398{,}600.4\,(3.04739\times10^{-4}-4.10450\times10^{-5})} = 10.2522\ \mathrm{km/s}$$

$$\Delta v_{ideal} = 10.2522 - 7.7932 = 2.459\ \mathrm{km/s} = 2{,}459\ \mathrm{m/s}$$

Now add the two allowances that convert an impulsive orbital-mechanics number
into a stage requirement: **2 % for finite-burn and steering losses** (the burn
is several minutes long, so the thrust is not applied impulsively at perigee)
and **2 % for trajectory dispersions and unmodelled effects**. Both are [J]
allocations, and both are recorded with that rationale.

$$\Delta v_{req} = 2{,}459 \times 1.04 = 2{,}557\ \mathrm{m/s}$$

> **L1-01.** *The upper stage shall provide a velocity increment of not less
> than 2,557 m/s to a 1,500 kg payload.* Parent: mission. Rationale: 2,459
> m/s impulsive GTO injection from a 185 km parking orbit, plus 2 % finite
> burn and 2 % dispersion allowance. Verification: analysis, closed by stage
> performance model validated against engine acceptance data.

**Level 1: stage sizing.** Inputs and their status:

| item | value | basis |
|---|---|---|
| payload | 1,500 kg | requirement |
| stage dry mass, CBE | 600 kg | preliminary layout |
| mass growth allowance | 15 % | preliminary-design maturity |
| stage dry mass, allocated | 690 kg | CBE × 1.15 |
| residuals + reserves | 1.2 % of loaded propellant | design estimate |
| engine $I_{sp}$, predicted (CBE) | 365 s vacuum | cycle analysis, LOX/CH₄ gas generator |
| engine $I_{sp}$, design value | 360 s vacuum | 1.4 % Isp margin held |

Sizing is implicit because residuals scale with the propellant load. Iterate
$m_f = m_{pl} + m_d + 0.012\,m_p$ with
$m_p = m_f\left(e^{\Delta v/(I_{sp}g_0)}-1\right)$ until it converges:

$$m_p = 2{,}358.6\ \mathrm{kg}, \quad m_{res} = 28.3\ \mathrm{kg},
\quad m_{load} = 2{,}386.9\ \mathrm{kg}$$
$$m_f = 1{,}500 + 690 + 28.3 = 2{,}218.3\ \mathrm{kg}, \qquad
m_0 = 4{,}576.9\ \mathrm{kg}$$

Check: $\Delta v = 360 \times 9.80665 \times \ln(4{,}576.9/2{,}218.3) = 2{,}557$
m/s. Stage inert fraction $690/(690+2{,}386.9) = 0.224$ — high, and honestly
so: a 2.4 t cryogenic stage is small, and tank and insulation mass does not
scale down with propellant.

**Level 1 → Level 2: thrust.** Two constraints. Initial acceleration should be
around 0.5 $g_0$ for an upper stage (much lower and gravity/finite-burn losses
exceed the 2 % allowance; much higher and the engine and thrust structure grow
for no benefit). Take $F = 22.5$ kN:

$$a_0 = \frac{22{,}500}{4{,}576.9\times 9.80665} = 0.501\,g_0, \qquad
a_f = \frac{22{,}500}{2{,}218.3\times 9.80665} = 1.034\,g_0$$

$$\dot m = \frac{F}{I_{sp,CBE}\,g_0} = \frac{22{,}500}{365\times9.80665}
= 6.286\ \mathrm{kg/s}, \qquad t_b = \frac{2{,}358.6}{6.286} = 375\ \mathrm{s}$$

At MR = 3.4: $\dot m_{ox} = 4.857$ kg/s, $\dot m_f = 1.429$ kg/s. Propellant
volumes at load: LOX $1{,}845/1{,}141 = 1.617$ m³, LCH₄ $542/423 = 1.282$ m³.

**Level 2: the engine specification.**

| ID | requirement | parent | rationale | verification |
|---|---|---|---|---|
| E-01 | Vacuum thrust shall be 22.5 kN ± 3 % at nominal inlet conditions | L1-02 | 0.50 $g_0$ initial acceleration; ±3 % is the tightest band achievable at acceptance without excessive rejection | test (acceptance hot fire), analysis to vacuum |
| E-02 | Vacuum specific impulse shall be not less than 360 s | L1-01 | 365 s predicted, 1.4 % margin held per programme Isp policy | test + analysis |
| E-03 | Mixture ratio shall be 3.40 ± 2 % | L1-03 | tank volume split and outage control; Isp is second-order in MR at the optimum | test |
| E-04 | Engine dry mass, as installed, shall not exceed 120 kg | L1-04 | stage dry-mass allocation; "as installed" defined by ICD drawing 4-1 | inspection (weigh) |
| E-05 | Engine shall fit a 1.30 m diameter × 1.85 m envelope including ±4° gimbal sweep | L1-05 | interstage inner diameter, minus clearance | inspection |
| E-06 | Engine shall support 4 starts and 900 s cumulative firing | L1-06 | mission needs 2 starts and 375 s; margin for a contingency second burn | test, 4× life factor → 16 starts, 3,600 s on qualification engines |
| E-07 | Engine shall gimbal ±4° at not less than 10 °/s | L1-07 | control authority and rate analysis | test |
| E-08 | Engine shall operate with $\mathrm{NPSH}_a \ge 15$ m LOX, 12 m LCH₄ at the inlet flanges | L1-08 | pump suction performance; this is the tank interface requirement | test (pump inducer suction test) |

Note E-06: the 4× service life factor turns a 2-start, 375 s mission into a
16-start, 3,600 s qualification campaign. That is not padding; it is most of
the engine test programme's cost, and it is decided by one line in a standard.

**Level 2 → Level 3: component requirements.** With $p_c = 60$ bar and
$\varepsilon = 100$, from Module 03:

$$C_F = 2.010\ (\gamma = 1.16,\ \varepsilon = 100,\ \text{vacuum})$$
$$A_t = \frac{F}{p_c C_F} = \frac{22{,}500}{60\times10^5 \times 2.010}
= 1.866\times10^{-3}\ \mathrm{m^2} \Rightarrow D_t = 48.7\ \mathrm{mm},\ D_e = 487\ \mathrm{mm}$$
$$c^*_{req} = \frac{I_{sp}g_0}{C_F} = \frac{365\times9.80665}{2.010} = 1{,}781\ \mathrm{m/s}$$

Pump discharge pressures follow from a pressure budget along each feed path:

| station | fuel path (bar) | oxidiser path (bar) |
|---|---|---|
| chamber (injector face) | 60.0 | 60.0 |
| injector pressure drop | +12.0 (0.20 $p_c$) | +15.0 (0.25 $p_c$) |
| regenerative jacket | +20.0 | — |
| valves, lines, orifices | +5.0 | +4.0 |
| **required pump discharge** | **97.0** | **79.0** |

> **L3 requirements.** *The fuel pump shall deliver not less than 97 bar at
> 1.43 kg/s at the design point.* *The oxidiser pump shall deliver not less
> than 79 bar at 4.86 kg/s.* *The main injector fuel-side pressure drop shall
> be 12.0 ± 1.0 bar at the design flow.* *The hot-gas wall temperature shall
> not exceed 800 K at any point at 105 % of rated power* (the material limit
> is 900 K; 100 K of thermal margin is held against the ±20–30 % accuracy of
> the heat-transfer prediction).

**Sanity check.** The result is a 22.5 kN, 365 s, 120 kg vacuum engine at
$p_c = 60$ bar and $\varepsilon = 100$. For comparison, the storable Aestus
delivers 29.6 kN at 324 s and about 111 kg, and the RL10A-3-3A delivers 73.4
kN at 444 s and roughly 136 kg [SB]. Our fictional engine sits sensibly
between them in thrust-to-weight (19:1) and in specific impulse for its
propellant combination. Nothing in the flow-down is physically surprising,
which is the point of doing it in this order.

### WE2 — Δv uncertainty from Isp, dry mass and residuals

Take the stage of WE1 at its design point: $I_{sp} = 360$ s, $m_0 = 4{,}576.9$
kg, $m_f = 2{,}218.3$ kg, $\Delta v = 2{,}557.0$ m/s, $c = I_{sp}g_0 = 3{,}530.4$
m/s, loaded propellant 2,386.9 kg, allocated dry mass 690 kg. Three
independent uncertainties, each stated as a 1σ:

- specific impulse: ±1 % → $\sigma_{I} = 3.60$ s
- dry mass: ±3 % → $\sigma_{m_d} = 20.7$ kg
- residuals: ±0.5 % of loaded propellant → $\sigma_{res} = 11.93$ kg

**Sensitivities** (Eqs. 3.8–3.10):

$$\frac{\partial \Delta v}{\partial I_{sp}} = \frac{\Delta v}{I_{sp}}
= \frac{2557.0}{360} = 7.103\ \mathrm{m/s\ per\ s}$$

$$\frac{\partial \Delta v}{\partial m_d} = c\left(\frac{1}{m_0}-\frac{1}{m_f}\right)
= 3530.4\,(2.18488\times10^{-4} - 4.50795\times10^{-4}) = -0.8201\ \mathrm{m/s\ per\ kg}$$

$$\frac{\partial \Delta v}{\partial m_{res}} = -\frac{c}{m_f}
= -\frac{3530.4}{2218.3} = -1.5915\ \mathrm{m/s\ per\ kg}$$

**Contributions:**

| source | 1σ input | sensitivity | 1σ Δv contribution | share of variance |
|---|---|---|---|---|
| specific impulse | 3.60 s | 7.103 m/s per s | 25.57 m/s | 50.2 % |
| dry mass | 20.7 kg | −0.8201 m/s per kg | 16.98 m/s | 22.1 % |
| residuals | 11.93 kg | −1.5915 m/s per kg | 18.99 m/s | 27.7 % |

$$\sigma_{\Delta v} = \sqrt{25.57^2 + 16.98^2 + 18.99^2} = \sqrt{1{,}302.7}
= 36.09\ \mathrm{m/s} = 1.41\,\%\ \mathrm{of}\ \Delta v$$

**Monte Carlo cross-check.** Drawing 10⁵ samples with Gaussian inputs (Isp
1 % relative, dry mass increment applied to both $m_0$ and $m_f$, residual
increment applied to $m_f$ only) gives a mean of 2,557.2 m/s and a standard
deviation of **36.08 m/s** — agreement with the RSS estimate to 0.03 %. The
model is linear over this range; the Monte Carlo adds nothing but confidence
that the derivatives were taken correctly. That is a legitimate use of it.

**Interpretation, which is the actual deliverable.** The 3σ Δv shortfall is
108.3 m/s. The margin held in WE1 was 4 % of 2,459 m/s, i.e. **98 m/s** — so
the flight performance reserve covers only **2.7σ**, not the 3σ the programme
requires. Three options, in increasing order of cost:

1. Reduce the residual uncertainty. Residuals contribute 27.7 % of the
   variance from a quantity that is *knowable*: drain-and-weigh tests on the
   stage, a better sump design, and a measured shutdown propellant inventory
   could plausibly halve $\sigma_{res}$ to 0.25 %, which drops
   $\sigma_{\Delta v}$ to 31.7 m/s and 3σ to 95.1 m/s — inside the margin, for
   the cost of one test series.
2. Tighten the Isp uncertainty by testing more engines, which shrinks the
   dominant term but slowly, as $1/\sqrt{n}$ on the mean while doing nothing
   for the unit-to-unit spread.
3. Load 30 kg more propellant, which costs 30 kg of payload at the ~1:1
   exchange rate of an upper stage.

Option 1 is right, and it is the answer only because the variance was
decomposed. A single number "σ = 36 m/s" would not have told anyone what to
do. **Sanity check:** 1.4 % Δv dispersion at 1σ is typical for a well-
characterised upper stage; flight performance reserves in the 0.5–2 % range
are standard practice [Humble].

### WE3 — The NPSH interface: required tank pressure at end of burn

The oxidiser pump of the WE1 engine has $\mathrm{NPSH}_r = 10$ m of liquid
oxygen at the design flow, and the programme requires a margin factor
$k_{NPSH} = 1.5$, so $\mathrm{NPSH}_a \ge 15$ m must hold **at the worst
point of the burn**. Conditions at that point:

| quantity | value | note |
|---|---|---|
| propellant | LOX at 92 K bulk | slightly warm from tank soak |
| density $\rho$ | 1,141 kg/m³ | at 92 K |
| vapour pressure $p_v$ | 120 kPa | saturation at 92 K [NIST-WB] |
| liquid column $z$ | 0.25 m | end of burn, near-empty tank |
| acceleration $a$ | 10.14 m/s² (1.034 $g_0$) | from WE1, burnout |
| feed line loss $\Delta p_{line}$ | 18 kPa | at 4.86 kg/s |

Invert Eq. 3.5 for the required ullage pressure:

$$p_t = p_v + \Delta p_{line} + \rho g_0\left(\mathrm{NPSH}_{req} - \frac{z\,a}{g_0}\right)$$

$$\frac{z\,a}{g_0} = \frac{0.25\times 10.14}{9.80665} = 0.2585\ \mathrm{m}
\qquad \rho g_0 = 1{,}141\times 9.80665 = 11{,}189\ \mathrm{Pa/m}$$

$$p_t = 120{,}000 + 18{,}000 + 11{,}189\,(15 - 0.2585)
= 120{,}000 + 18{,}000 + 164{,}946 = 302{,}946\ \mathrm{Pa}$$

$$\boxed{p_t \ge 3.03\ \mathrm{bar}\ (43.9\ \mathrm{psia})}$$

Check by forward substitution: $\mathrm{NPSH}_a = (302{,}946-120{,}000-18{,}000)/11{,}189
+ 0.2585 = 14.75 + 0.26 = 15.00$ m. ✓

**The same calculation on the fuel side.** Liquid methane at 115 K:
$\rho = 423$ kg/m³, $p_v = 145$ kPa, $\mathrm{NPSH}_r = 12$ m so
$\mathrm{NPSH}_{req} = 18$ m, $\Delta p_{line} = 8$ kPa. Now
$\rho g_0 = 4{,}148$ Pa/m:

$$p_t = 145{,}000 + 8{,}000 + 4{,}148\,(18-0.2585) = 226{,}600\ \mathrm{Pa} = 2.27\ \mathrm{bar}$$

**Read the two results together — this is the lesson.** The methane pump
demands *more* head (18 m against 15 m) yet needs *less* tank pressure (2.27
bar against 3.03 bar), because head converts to pressure through $\rho g_0$,
and methane is 2.7 times less dense. Repeat the exercise with hydrogen
($\rho = 70.8$ kg/m³, $\rho g_0 = 694$ Pa/m) and 30 m of required head costs
only 0.21 bar of tank pressure above vapour pressure. **The lower the
propellant density, the cheaper NPSH is in tank pressure, and the more
expensive everything else about the tank is.**

**Consequences that fall out of this one number.** Ideal-gas helium pressurant
to displace the propellant volumes at 250 K:

$$m_{He} = \frac{p_t V}{R T} : \quad \text{LOX tank } \frac{3.03\times10^5 \times 1.617}{2077.06\times 250} = 0.944\ \mathrm{kg},
\quad \text{CH}_4 \text{ tank } \frac{2.27\times10^5\times1.282}{2077.06\times250} = 0.560\ \mathrm{kg}$$

Total 1.50 kg ideal. **Multiply by 2 to 3** for the real system: incoming gas
cools against cold liquid and cold walls, so the mass required to hold
pressure is far above the isothermal ideal [SP-8112]. Call it 3.5–4.5 kg of
helium, plus a bottle to hold it. That bottle mass lands in the stage dry mass
of WE1 — and if it grows, Eq. 3.9 says it costs 0.82 m/s per kg of Δv. The
chain from *pump inducer suction performance* to *stage Δv* is four steps
long and every step is a different engineering group.

**Sanity check.** Upper-stage tank pressures of 2–4 bar for dense propellants
and 1.5–2.5 bar for hydrogen are the normal published range, and the RS-25's
low-pressure boost pumps exist precisely so the Shuttle External Tank could
run at the low end of it [SP-8107].

### WE4 — Pugh matrix for three engine options, and a sensitivity flip

The upper stage of WE1 needs an engine. Three candidates, with the LOX/CH₄
gas-generator engine (option B, the WE1 baseline) as the **datum**:

- **A — LOX/LH₂ closed expander**, $I_{sp} \approx 450$ s. New development at
  this thrust class.
- **B — LOX/CH₄ gas generator**, $I_{sp} \approx 365$ s. Datum.
- **C — N₂O₄/MMH pressure-fed**, $I_{sp} \approx 320$ s. Derived from
  qualified hardware.

Scores relative to the datum on a −2…+2 scale, and initial weights:

| criterion | $w_i$ | A | B | C |
|---|---|---|---|---|
| delivered performance (payload to GTO) | 30 | +2 | 0 | −2 |
| stage dry mass and tank volume | 20 | −2 | 0 | 0 |
| development schedule risk | 20 | −1 | 0 | +2 |
| recurring cost | 15 | −2 | 0 | +1 |
| restart and long-coast capability | 10 | 0 | 0 | +2 |
| ground operations complexity | 5 | −2 | 0 | −1 |
| **weighted total** | **100** | **−40** | **0** | **+10** |

Arithmetic for A: $30(2)+20(-2)+20(-1)+15(-2)+10(0)+5(-2) = 60-40-20-30-10 = -40$.
For C: $30(-2)+20(0)+20(2)+15(1)+10(2)+5(-1) = -60+40+15+20-5 = +10$.

**Ranking: C > B > A.** The storable pressure-fed stage wins. If you stop
here, you write that in the report and somebody builds it.

**Now sweep.** The two criteria that carry the argument are performance and
schedule. Trade weight between them, holding the other four fixed, with
$w_{perf} = x$ and $w_{sched} = 50 - x$:

$$S_A(x) = 2x - (50-x) - 80 = 3x - 130, \qquad S_C(x) = -2x + 2(50-x) + 30 = 130 - 4x,
\qquad S_B = 0$$

(The constant −80 in $S_A$ is A's fixed contributions: $20(-2)+15(-2)+10(0)+5(-2)$.
The +30 in $S_C$ is $20(0)+15(1)+10(2)+5(-1)$.)

| $w_{perf}$ | $S_A$ | $S_B$ | $S_C$ | winner |
|---|---|---|---|---|
| 20 | −70 | 0 | +50 | C |
| 30 | −40 | 0 | +10 | C |
| **32.5** | −32.5 | 0 | **0** | B/C tie |
| 35 | −25 | 0 | −10 | **B** |
| 40 | −10 | 0 | −30 | B |
| **43.3** | **0** | 0 | −43 | A/B tie |
| 45 | +5 | 0 | −50 | **A** |
| 50 | +20 | 0 | −70 | A |

**The winner changes twice inside a range of weights that no one could defend
choosing between.** Move the performance weight from 30 to 45 — a change any
programme manager could make with a straight face after one customer meeting —
and the recommendation goes from the storable pressure-fed stage to the
hydrogen expander, passing through the methane baseline on the way.

**What to report.** Not "C wins, score +10". Report this:

> The trade does not resolve on the criteria as weighted. The recommendation
> is controlled entirely by the relative weight of delivered performance and
> schedule risk: option C is preferred if performance is weighted below ~32,
> option B between ~32 and ~43, option A above ~43. The programme should
> decide the performance-versus-schedule priority explicitly, and should fund
> a firmer schedule estimate for option A, whose −1 schedule score is the
> least well supported number in the matrix. On present information, option B
> is recommended as the choice that is never worse than second and is first
> across the widest weight band.

That last sentence is a real and defensible criterion — minimax regret — and
it is a better answer than the raw score, because it acknowledges that the
weights are uncertain instead of pretending they are data.

**Sanity check.** The result matches history: methane and kerosene
gas-generator engines dominate new mid-size upper stages, hydrogen expanders
persist where performance dominates and schedule does not (the RL10 lineage),
and storable pressure-fed stages persist where restart, storability and
heritage dominate (Aestus, and the whole class of spacecraft apogee engines)
[SB, SLPRE].

