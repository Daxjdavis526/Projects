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

