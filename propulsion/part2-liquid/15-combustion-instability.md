# Module 15 — Combustion Instability
Part II · Prerequisites: modules 06, 07, 12 · Estimated time: 7 h

An engine that is 2 % down on $c^*$ is a disappointment. An engine that is
unstable is a hole in the test stand. Combustion instability is the only failure
mode in this course that can take a chamber from nominal to destroyed inside
fifty milliseconds, with no warning on any of the low-frequency instruments the
control room is watching, and it is the failure mode that has consumed more
development schedule than any other in the history of liquid propulsion — two
years and roughly two thousand full-scale tests on the F-1 alone. It is also the
one subject where the accepted engineering practice is still, in 2026,
*detonate a small explosive charge inside the running engine and see if it
recovers*, because no analysis anyone trusts will tell you the limit-cycle
amplitude. This module is about what drives the oscillation, why the driving is
a phase relationship rather than an energy quantity, how the three frequency
bands are three genuinely different problems with three incompatible fixes, and
how you demonstrate — not argue — that a chamber is stable.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. Classify an observed oscillation as chug, buzz or screech from its frequency,
   its amplitude, and the transducers that see it, and name the coupling
   mechanism appropriate to that band.
2. Derive the lumped-parameter chug model from mass conservation in the chamber
   plus orifice hydraulics plus a combustion time lag, obtain the chamber fill
   time $\tau_c = L^*/(\Gamma^2 c^*)$, and evaluate the neutral-stability
   condition on $\Delta p_{inj}/p_c$.
3. State and derive the Rayleigh criterion from the linearised acoustic energy
   equation, and use the phase between $p'$ and $q'$ to argue whether a given
   mechanism drives or damps a given mode.
4. Compute the acoustic mode frequencies (1L, 1T, 2T, 1R, and combined) of a
   cylindrical chamber from the Bessel-root table, and say which transducer or
   accelerometer would see each.
5. Explain the Crocco–Cheng sensitive time-lag model, compute the neutral
   interaction index $n$ for a lumped chamber, and read a stability map.
6. Size a quarter-wave acoustic cavity or Helmholtz resonator for a target mode,
   including the effect of the uncertain cavity gas temperature.
7. Choose a baffle compartment count that moves the lowest transverse mode above
   a target frequency, and state what the baffle costs.
8. Specify a stability-rating programme — bomb, pulse gun, directed gas flow —
   and apply a damping-rate criterion to a dynamic-pressure trace.
9. Explain why swirl-coaxial and pintle injectors are comparatively stable and
   why large like-on-like doublet elements are not, in terms of where the heat
   release sits and how fast it responds.
10. Read a hot-fire dynamic-pressure PSD and a two-transducer phase plot and say
    which mode is present, whether it is standing or spinning, and whether the
    engine met its dynamic-stability requirement.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Chamber pressure | $p_c$ | Pa | mean (steady) chamber pressure at the injector face |
| Pressure perturbation | $p'$ | Pa | unsteady part of chamber pressure, $p = p_c + p'$ |
| Peak-to-peak amplitude | $\hat p_{pp}$ | Pa | full swing of $p'$ over a cycle, usually quoted as % of $p_c$ |
| Heat-release perturbation | $q'$ | W/m³ | unsteady volumetric heat release rate |
| Speed of sound (chamber) | $c$ | m/s | $\sqrt{\gamma R T_c}$ in the burned gas |
| Chamber diameter | $D_c$ | m | barrel inside diameter |
| Chamber (barrel) length | $L_{cyl}$ | m | injector face to start of convergence |
| Characteristic length | $L^*$ | m | $V_c/A_t$ (Module 06) |
| Chamber fill / stay time | $\tau_c$ | s | gas residence time, $L^*/(\Gamma^2 c^*)$ |
| Combustion time lag | $\tau$ | s | injection-to-heat-release delay |
| Sensitive time lag | $\tau$ | s | in the Crocco model, the pressure-sensitive part of the total lag |
| Interaction index | $n$ | — | Crocco pressure sensitivity of the burning rate |
| Injector feedback gain | $k$ | — | $p_c/(2\Delta p_{inj})$, the chug loop gain |
| Injector pressure drop | $\Delta p_{inj}$ | Pa | manifold-to-chamber drop across the orifices |
| Mode frequency | $f$ | Hz | frequency of a chamber acoustic mode |
| Angular frequency | $\omega$ | rad/s | $2\pi f$ |
| Bessel eigenvalue | $\alpha_{mn}$ | — | $n$-th root of $J_m'(x)=0$; sets transverse mode frequency |
| Azimuthal order | $m$ | — | number of pressure nodal diameters (tangential index) |
| Radial order | $n$ | — | radial mode index |
| Longitudinal order | $q$ | — | number of half-waves along the chamber axis |
| Growth rate | $\alpha_g$ | s⁻¹ | real part of the complex frequency; $p' \propto e^{\alpha_g t}$ |
| Damping rate | $\alpha_d$ | s⁻¹ | $-\alpha_g$ when the mode decays |
| Damping ratio | $\zeta$ | — | $\alpha_d/\omega$ for a lightly damped mode |
| Quality factor | $Q$ | — | $1/(2\zeta)$; sharpness of a resonance |
| Line inertance | $I$ | kg/m⁴ | $\rho \ell / A$ for a feed line of length $\ell$, area $A$ |
| Line/accumulator compliance | $C$ | m⁵/N | $dV/dp$ of the fluid volume, including any gas pocket |
| Nozzle admittance | $Y$ | — | ratio of velocity to pressure perturbation at the nozzle entrance |
| Response function | $R$ | — | $(\dot m'/\bar{\dot m})/(p'/p_c)$ for the combustion process |
| Structural mode frequency | $f_s$ | Hz | first longitudinal (POGO) mode of the loaded vehicle |
| Cavity depth | $L_{cav}$ | m | quarter-wave resonator length |
| Baffle compartment count | $N$ | — | number of sectors the baffle blades divide the face into |
| Baffle blade length | $L_b$ | m | axial projection of the baffle from the injector face |

---

## 3. Theory

### 3.1 What "combustion instability" actually is

A rocket chamber is a resonant cavity containing a distributed, extremely
energetic, and *responsive* heat source. Roughly 2 GW of chemical power passes
through a cubic decimetre of an F-1 chamber. If one part in a thousand of that
power is delivered in phase with a pressure oscillation, the oscillation grows.
Nothing about instability requires an external forcing function: the combustion
supplies both the energy and — because it is sensitive to pressure and velocity
— the feedback.

The definition used throughout the literature is operational, not theoretical
[SP-194 §1.2]:

> **Combustion instability** is a self-excited oscillation of chamber pressure
> (and everything coupled to it) sustained by an in-phase coupling between the
> unsteady heat release and the oscillation, at an amplitude large enough to
> matter. "Large enough to matter" is conventionally $\hat p_{pp} > 5\%$ of
> $p_c$; below that the chamber is merely *rough*.

Two distinctions do a lot of work.

**Linear versus nonlinear.** A *linearly unstable* chamber departs from steady
operation spontaneously: infinitesimal noise grows. A *nonlinearly* (or
*dynamically*) unstable chamber is stable to small disturbances but unstable to
large ones — there is a threshold amplitude above which the oscillation grows to
a limit cycle. Most flight engines that have failed in service were nonlinearly
unstable, which is precisely why stability rating uses a finite-amplitude pulse
rather than waiting to see whether the engine goes unstable on its own **[F]**
[SP-8113 §2.1].

**Driving versus damping.** An oscillation grows when driving exceeds damping. A
great deal of stability engineering is not about reducing driving (which is
combustion, and you want that) but about adding damping — resonators, baffles,
nozzle losses — until the balance tips. Stated that way, the design problem
becomes an energy budget, and §3.3 makes that budget explicit.

**What it costs when you lose.** Instability multiplies the wall heat flux. The
mechanism is not mysterious: a transverse acoustic mode drives a gas velocity of
order $p'/(\rho c)$ tangentially along the chamber wall, at frequencies of
kilohertz. That velocity scrubs away the thermal boundary layer and any film
coolant layer, and it re-establishes the layer from scratch every half cycle. The
observed multiplication of gas-side heat flux is a factor of **2 to 10**, with
factors near the injector face highest [SP-194 §1.3][LRECI]. A chamber designed
with 30 % margin on wall temperature does not survive a factor of four. Typical
time to burn-through under a developed transverse instability is **tens to
hundreds of milliseconds**, which is why the F-1 acceptance criterion was
expressed in milliseconds and not seconds.

### 3.2 Classification by frequency and mechanism

The classification is by frequency band, and it survives because the bands
correspond to genuinely different physics — different oscillating element,
different feedback path, different fix **[F]**.

| band | usual names | frequency | oscillating element | feedback path | primary fix |
|---|---|---|---|---|---|
| Low | chugging, chug, feed-system instability | 10–500 Hz | chamber gas volume (a capacitance) plus feed-line fluid column | injector $\Delta p$ modulated by $p_c$, delayed by the combustion lag | raise $\Delta p/p_c$; cavitating venturi; stiffen or detune the line |
| Low (vehicle) | POGO | 5–60 Hz | vehicle structure plus the whole feed system | thrust oscillation → structural acceleration → line pressure → thrust | gas accumulator in the feed line |
| Low (chamber) | $L^*$ instability | 20–200 Hz | chamber volume and the vaporization process | chamber pressure modulates vaporization rate, which modulates chamber pressure | reduce $L^*$; raise $p_c$ |
| Intermediate | buzz, entropy waves, manifold coupling | 200–1000 Hz | injector manifold/dome acoustics, or convected hot spots | manifold resonance, or convective-plus-acoustic loop through the nozzle | change manifold volume; add manifold resistance |
| High | screech, screaming, acoustic instability | 1000–15 000 Hz | the chamber gas itself, as an acoustic resonator | atomization/vaporization/mixing response to acoustic pressure and velocity | baffles, acoustic cavities, element redesign |

Two cautions on the table.

First, **the bands overlap and the boundaries are conventions**, not physics.
A 600 Hz oscillation in a small thruster may be its first longitudinal acoustic
mode; a 600 Hz oscillation in an F-1-sized chamber is not (§3.8 puts the F-1's
first tangential mode at several hundred hertz, which is precisely why the F-1 is
the awkward case that breaks the tidy classification).

Second, **the fixes conflict**. Raising injector $\Delta p$ is the standard chug
fix and does essentially nothing for screech. Making the injector mix and
vaporize faster raises $\eta_{c^*}$ and makes screech *worse*, because it moves
heat release toward the face where the transverse acoustic pressure amplitude is
largest (Module 07 §3.12). A chamber that is comfortably stable in all three
bands has usually given up two or three points of $c^*$ efficiency and several
percent of chamber pressure to get there **[J]**.

### 3.3 The Rayleigh criterion

Everything else in this module is a special case of one statement, made by
Rayleigh in 1878 for singing flames and unchanged since: *heat added in phase
with the pressure oscillation drives the oscillation.* Here is the derivation,
because the assumptions in it are where the real arguments happen.

Take the linearised equations for a perturbation about a uniform, quiescent mean
state ($\bar u = 0$, uniform $\bar p$, $\bar \rho$), with an unsteady volumetric
heat release $q'$:

$$\frac{\partial p'}{\partial t} + \gamma \bar p\, \nabla\!\cdot\mathbf{u}' = (\gamma-1)\,q'$$

$$\bar\rho\, \frac{\partial \mathbf{u}'}{\partial t} + \nabla p' = 0$$

> **Eq. 3.1** — variables: $p'$ pressure perturbation [Pa]; $\mathbf u'$ velocity
> perturbation [m/s]; $q'$ heat release rate perturbation per unit volume
> [W/m³]; $\bar p$, $\bar\rho$ mean pressure [Pa] and density [kg/m³]; $\gamma$
> ratio of specific heats [—]. Meaning: the first is the energy equation written
> for pressure — compressing the gas *or* adding heat to it raises the pressure;
> the second is Newton's law for a fluid element. Assumes: small perturbations,
> zero mean flow, uniform mean state, no viscosity, no body force, ideal gas.
> Fails when: the mean flow Mach number is not small (a rocket chamber runs at
> $\mathrm{Ma}\approx 0.2$–0.35, so mean-flow terms are a real 20–35 % effect and
> a full treatment retains them [Culick68]), or when the mean temperature varies
> strongly along the chamber (it does).

Multiply the first equation by $p'/(\gamma\bar p)$, take the dot product of the
second with $\mathbf u'$, and add. The $\nabla\cdot$ and $\nabla$ terms combine
into a divergence:

$$\frac{\partial}{\partial t}\underbrace{\left[\frac{p'^2}{2\gamma\bar p} + \frac{\bar\rho\,|\mathbf u'|^2}{2}\right]}_{\textstyle E\ \text{(acoustic energy density)}} + \nabla\!\cdot(p'\mathbf u') = \frac{\gamma-1}{\gamma\bar p}\,p'q'$$

> **Eq. 3.2** — variables: $E$ acoustic energy density [J/m³], the sum of a
> "potential" (compression) and a "kinetic" term. Meaning: acoustic energy in a
> volume changes only by flux through its boundary ($p'\mathbf u'$, the acoustic
> intensity) or by the source term $p'q'$. Assumes: everything in Eq. 3.1.
> Fails when: mean flow carries energy across the boundary — in a rocket the
> nozzle is exactly such a boundary and is the single largest damping term.

Integrate over the chamber volume $V$ and over one period $T$ of the oscillation.
For a periodic (limit-cycle or neutrally stable) oscillation the left-hand
energy term integrates to zero over a cycle, leaving:

$$\boxed{\ \underbrace{\frac{\gamma-1}{\gamma\bar p}\oint_T\!\!\int_V p'\,q'\;dV\,dt}_{\text{driving}} \;=\; \underbrace{\oint_T\!\!\oint_S p'\,\mathbf u'\!\cdot\!\mathbf n\;dS\,dt \;+\; \mathcal{D}}_{\text{damping}}\ }$$

> **Eq. 3.3 (Rayleigh criterion, energy form)** — variables: $S$ chamber boundary
> [m²]; $\mathbf n$ outward normal; $\mathcal D$ all the dissipative losses the
> linear inviscid model does not contain (viscous and thermal boundary layers,
> droplet drag, relative-motion losses, mass and momentum exchange with the
> spray) [W]. Meaning: a mode grows if the heat release does net positive work
> on it over a cycle faster than the boundaries and dissipation remove energy.
> Assumes: periodic oscillation, linear acoustics, small mean flow. Fails when:
> the amplitude is large enough that the acoustics are nonlinear (steepened
> waves, shock-like fronts — normal at limit-cycle amplitudes of 20–50 % of
> $p_c$), in which case the energy balance still holds conceptually but $q'$ and
> $\mathcal D$ both become amplitude-dependent, which is the entire reason limit
> cycles exist.

The famous phase statement follows immediately. Write $p' = \hat p\cos\omega t$
and $q' = \hat q\cos(\omega t - \theta)$. Then

$$\oint_T p'q'\,dt = \tfrac{1}{2}\,\hat p\,\hat q\,T\cos\theta$$

so the driving is positive when $|\theta| < 90°$ and negative — *damping* — when
$|\theta| > 90°$ **[F]**. Three consequences worth internalising:

1. **Magnitude of $q'$ is not the issue; phase is.** A combustion process that
   responds enormously to pressure but 180° out of phase is a damper. This is why
   "make the combustion less responsive" is a crude fix and "move the heat
   release to a different axial station" is a good one — moving it changes both
   $p'$ (through the mode shape) and $\theta$ (through the convective delay).
2. **Where the heat release sits matters as much as when.** The integral is
   weighted by the local $p'$. For a transverse mode, $|p'|$ is maximum at the
   wall and at the centre and zero on a nodal diameter. Heat release concentrated
   near the injector face, where a purely transverse mode has full pressure
   amplitude, is worst; heat release spread over an axial distance comparable to
   a quarter-wavelength partially cancels.
3. **You can beat driving with damping.** You do not have to eliminate the
   in-phase heat release. Resonators, baffles and nozzle damping all add to the
   right-hand side. This is what practical stabilisation actually does.

For a **longitudinal** mode the same criterion produces the classic result that
heat release near a pressure antinode drives and heat release near a pressure
node does not — the reason the injector-face region is the dangerous place to
burn, since it is a pressure antinode for every longitudinal and every transverse
mode of a closed-end chamber.

### 3.4 Low frequency: chugging

#### The physical loop

Chamber pressure rises. The rise back-pressures the injector, reducing
$\Delta p_{inj}$ and therefore the injected flow. Less flow means, after the
combustion delay $\tau$, less heat release and a falling chamber pressure. The
falling pressure increases $\Delta p_{inj}$ and the flow surges. If the delay is
right relative to the chamber's own response time, the loop oscillates. Note
immediately that the injector feedback is *negative* (more $p_c$ → less flow):
**it is stabilising on its own, and only the time lag makes it destabilising.**
That sentence is the whole of chug theory.

#### The chamber as a capacitance, and the fill time

Treat the chamber as one lumped gas volume with a choked throat (Module 06
§3.2):

$$\frac{V_c}{R T_c}\frac{dp_c}{dt} = \dot m_{in}(t) - \dot m_{out}(t), \qquad \dot m_{out} = \frac{p_c A_t}{c^*}$$

Linearise about the operating point, $p_c \to p_c + p'$, and divide through by
$\partial \dot m_{out}/\partial p_c = A_t/c^*$. The coefficient of $\dot p'$ that
emerges is the **chamber fill time** (equivalently the gas stay time):

$$\tau_c \;=\; \frac{V_c}{R T_c}\cdot\frac{c^*}{A_t} \;=\; \frac{L^*\,c^*}{R T_c} \;=\; \boxed{\ \frac{L^*}{\Gamma^2\,c^*}\ }$$

> **Eq. 3.4** — variables: $\tau_c$ chamber fill (stay) time [s]; $L^* = V_c/A_t$
> characteristic length [m]; $c^*$ characteristic velocity [m/s]; $R$ specific
> gas constant [J/(kg·K)]; $T_c$ chamber temperature [K]; $\Gamma =
> \sqrt{\gamma}\,(2/(\gamma+1))^{(\gamma+1)/2(\gamma-1)}$ the Vandenkerckhove
> function [—]. The last form uses $c^* = \sqrt{RT_c}/\Gamma$, so $RT_c =
> (\Gamma c^*)^2$. Meaning: the time constant with which chamber pressure
> responds to a flow imbalance — the RC time of the chamber treated as an
> electrical capacitance drained through a fixed conductance. Assumes: uniform
> chamber gas properties, choked throat, ideal gas, all injected mass instantly
> in the gas phase. Fails when: a substantial fraction of the chamber volume is
> occupied by liquid and unburned spray, which is exactly the case near the
> injector — $\tau_c$ is therefore an *upper bound* on the true gas residence
> time, typically by 10–30 % in a kerosene engine.

The last form is worth memorising: **$\tau_c$ depends only on $L^*$ and the
propellant combination**, not on chamber pressure, not on thrust, not on size.
Doubling $L^*$ doubles the chamber's capacitance. For $L^* = 1.05$ m,
$\gamma = 1.20$ ($\Gamma = 0.6485$) and $c^* = 1689$ m/s, $\tau_c = 1.48$ ms —
the value used throughout the worked examples.

#### Closing the loop with the injector

From the orifice equation (Module 07 §3.2), with the manifold pressure held
constant by a stiff feed system, $\dot m_{in} \propto \sqrt{p_{man}-p_c}$, so

$$\frac{\partial \dot m_{in}}{\partial p_c} = -\frac{\dot m}{2\,\Delta p_{inj}}$$

and the injected propellant does not release its heat on arrival — it must
atomize, heat, vaporize and react, taking the combustion time lag $\tau$. The
flow that matters to the chamber energy balance at time $t$ is the flow injected
at $t-\tau$. Define the loop gain

$$k \equiv \frac{p_c}{2\,\Delta p_{inj}}$$

and the linearised chamber equation becomes a **delay-differential equation**:

$$\tau_c\,\dot p'(t) \;+\; p'(t) \;+\; k\,p'(t-\tau) \;=\; 0$$

> **Eq. 3.5** — variables: $k$ dimensionless injector feedback gain [—]; $\tau$
> combustion time lag [s]; others as above. Meaning: the chamber is a first-order
> lag closed by a delayed feedback whose strength is set by how soft the injector
> is. Assumes: one lumped chamber mode (no acoustics — this is chug, not
> screech); a stiff feed system with no line inertance and no manifold
> compliance; a constant lag $\tau$ that does not itself respond to pressure;
> non-cavitating orifices. Fails when: feed-line inertance is significant (it
> usually is, and it makes things worse — see below); when the orifices cavitate,
> in which case $\dot m$ is independent of $p_c$, $k \to 0$, and the mode
> disappears entirely; or when $\tau$ responds to pressure, which is the Crocco
> generalisation of §3.9.

With $\tau = 0$ the characteristic root is $s = -(1+k)/\tau_c$: always stable, and
more stable the softer the injector. The delay is the villain.

Substituting $p' = \hat p\,e^{st}$ gives the characteristic equation
$\tau_c s + 1 + k e^{-s\tau} = 0$. Neutral stability is $s = i\omega$, whose real
and imaginary parts are

$$1 + k\cos\omega\tau = 0, \qquad \omega\tau_c - k\sin\omega\tau = 0$$

Eliminating $k$ from the pair gives the frequency condition, and squaring and
adding gives the gain condition:

$$\omega\tau + \arctan(\omega\tau_c) = \pi, \qquad k_{crit} = \sqrt{1+(\omega\tau_c)^2}$$

$$\boxed{\ \text{stable if}\quad \frac{\Delta p_{inj}}{p_c} \;>\; \frac{1}{2\sqrt{1+(\omega\tau_c)^2}}\ }$$

> **Eq. 3.6 (chug criterion)** — variables: $\omega$ neutral-mode angular
> frequency [rad/s], obtained by solving the transcendental phase condition;
> others as above. Meaning: given a chamber capacitance and a combustion lag,
> there is a maximum injector softness the loop tolerates. Assumes: as Eq. 3.5.
> Fails when: the feed system contributes its own resonance, which adds a second
> oscillator and can produce a *lower* critical gain at a different frequency —
> the usual reason a chamber that passes this check chugs anyway.

Evaluated for the reference chamber ($\tau_c = 1.48$ ms):

| $\tau$ (ms) | chug $f$ (Hz) | $k_{crit}$ | required $\Delta p_{inj}/p_c$ |
|---|---|---|---|
| 0.8 | 369 | 3.57 | 14.0 % |
| 1.0 | 304 | 3.00 | 16.7 % |
| 1.2 | 260 | 2.62 | 19.1 % |
| 1.5 | 216 | 2.24 | 22.3 % |

Kerosene and storable lags are 0.7–1.5 ms; the predicted frequencies of 200–400
Hz are exactly where chug is observed; and the requirement lands on 14–22 %.
**The textbook "15–25 % of $p_c$" rule is this table** [F][E], and it also tells
you when to leave the rule: hydrogen vaporizes almost on contact ($\tau \sim$
0.2–0.4 ms), which is why hydrogen engines run fuel-side drops of 10–15 % and are
fine, and why expander-cycle engines can afford to (Module 13).

#### The Summerfield form, and what it leaves out

Summerfield's 1951 analysis — the first of these, and the one usually credited
with the "injector pressure drop is the stabiliser" result — is the same balance
written for a chamber whose fill time is short compared with the lag, in which
case $\omega\tau_c \ll 1$, $\omega\tau \to \pi$, and the criterion collapses to
the memorable

$$\frac{\Delta p_{inj}}{p_c} > \frac{1}{2}\cdot\frac{1}{\sqrt{1+(\omega\tau_c)^2}} \;\longrightarrow\; \frac{1}{2}\ \ \text{as}\ \ \tau_c\to0$$

i.e. **a chamber with no capacitance needs an injector drop of half the chamber
pressure**, and every bit of chamber volume you have buys you margin below that
[H], as presented in [SP-194 §3.2] and [SB]. The practical reading: **small,
short-$L^*$, high-$p_c$ chambers are the chug-prone ones**, because $\tau_c$
is small and $k_{crit}$ approaches 1. At $\tau = 1.2$ ms, a chamber with
$\tau_c = 2.2$ ms needs 16 % while one with $\tau_c = 0.8$ ms needs 26 %.

What the lumped model leaves out is the feed line. A real line has **inertance**
$I = \rho\ell/A$ and the manifold has **compliance** $C$ (from trapped gas,
line elasticity, and liquid compressibility). Together they are a second-order
oscillator with

$$f_{feed} = \frac{1}{2\pi\sqrt{IC}}$$

> **Eq. 3.7** — variables: $I$ inertance [kg/m⁴]; $C$ compliance [m⁵/N]; $\ell$
> line length [m]; $A$ line flow area [m²]. Meaning: the fluid column in the feed
> line, sprung on whatever compressibility exists downstream, is a mass-spring
> resonator with its own frequency, and if that frequency is near the chug
> frequency the two lock together and the margin computed from Eq. 3.6
> evaporates. Assumes: lumped line, single dominant compliance. Fails when: the
> line is long enough that distributed (organ-pipe) behaviour matters, i.e. when
> $\ell$ exceeds about a tenth of an acoustic wavelength in the liquid.

Two standard fixes follow directly. **A cavitating venturi** in the feed line
chokes the liquid flow, making $\dot m$ independent of everything downstream:
$k \to 0$ and the coupling is cut, at the cost of a permanent pressure loss.
**A line accumulator** deliberately adds compliance to move $f_{feed}$ far from
the chug band. Both are Module 12 hardware doing Module 15 work.

### 3.5 $L^*$ instability

A distinct low-frequency mode, seen mostly in **low-pressure chambers with large
$L^*$**, and one that behaves in the opposite direction from chug: increasing
$L^*$ makes it *worse*, not better [H][SP-194 §3.4]. The coupling is between the
chamber volume and the *vaporization* rate rather than the injector. In a
low-pressure chamber, the propellant vaporization rate depends strongly on
chamber pressure (through the saturation temperature and the droplet heat
transfer), and a large chamber volume supplies both a long delay and a large
capacitance. Frequencies are 20–200 Hz, amplitudes are usually modest, and it
appears and disappears as chamber pressure is changed — the classic diagnostic
signature. It is a real hazard for small storable thrusters and for engines run
far below design $p_c$ during throttling. The fix is to reduce $L^*$ or raise
$p_c$; raising injector $\Delta p$ does very little, which is what tells you it
is $L^*$ instability and not chug.

### 3.6 POGO: the vehicle-scale cousin

Take the chug loop and make the oscillating mass the *entire vehicle*. The
sequence:

1. A structural oscillation at the vehicle's first longitudinal mode $f_s$
   (typically 5–25 Hz on a large launch vehicle, falling through the burn as
   propellant drains) accelerates the tanks and the feed lines axially.
2. That acceleration modulates the pressure at the pump inlet — a column of LOX
   30 m long under $\pm 0.5g$ of axial oscillation is a substantial pressure
   perturbation.
3. Inlet pressure modulates pump discharge pressure, therefore injector flow,
   therefore chamber pressure, therefore **thrust**.
4. Thrust oscillation drives the structure. The loop is closed.

The name is onomatopoeic — the vehicle bounces like a pogo stick — and it is not
a laboratory curiosity: it produced ±0.6 g at 11 Hz on Gemini/Titan II, forced a
redesign, and returned on the Saturn V S-IC and again, severely, on the Apollo 6
S-II [SP-4206][Hunley07]. Crewed-flight limits are on the order of ±0.25 g at
the seat because human tolerance, not structural strength, is the binding
constraint **[H]**.

The engineering handle is the same as for chug: the feed line is an inertance and
you tune it with compliance. A **POGO accumulator** — a gas-filled bottle or a
gas-charged bellows teed into the LOX line just upstream of the pump — adds
compliance $C \approx V_g/(n\,p_g)$ for a gas volume $V_g$ at pressure $p_g$ with
polytropic exponent $n$, dropping the feed-line resonance below the structural
mode so the two cannot exchange energy.

> **Worked estimate.** LOX line: $\ell = 25$ m, $A = 0.05$ m², $\rho = 1140$
> kg/m³ → $I = \rho\ell/A = 5.7\times10^5$ kg/m⁴. As a bare quarter-wave column
> with a liquid wave speed of ~1000 m/s the line resonates near $a/4\ell =
> \mathbf{10\ Hz}$ — squarely on top of a large vehicle's first longitudinal
> mode. To move the coupled resonance to 3 Hz you need $C = 1/[(2\pi f)^2 I] =
> 4.9\times10^{-9}$ m⁵/N, i.e. a gas volume $V_g = C n p_g = 4.9\times10^{-9}
> \times 1.4 \times 3\times10^5 \approx \mathbf{2\ litres}$ of helium at 3 bar.
> Two litres of gas to fix a vehicle-scale instability is the best
> price-performance ratio in this module. **[A]**, generic numbers.

POGO belongs in a propulsion course because *the engine is in the loop and the
engine team owns the fix*, but the analysis is a vehicle-level coupled
structural-hydraulic-engine model, and the engine's contribution to it is
characterised by a measured **pump transfer function** (inlet pressure
perturbation to discharge pressure perturbation, including cavitation compliance
in the inducer, which is itself a strong function of NPSH — Module 12,
[Brennen-Pumps]).

### 3.7 Intermediate frequency: buzz, entropy waves, manifold coupling

The 200–1000 Hz band is the least tidy, because three different mechanisms live
there and they are hard to tell apart from a single pressure trace.

**Injector manifold and dome acoustics.** The manifold behind the injector face
is a fluid-filled cavity with its own acoustic modes; the orifices are its
inertance. If a manifold mode falls near a chamber mode or near the combustion
response peak, the manifold acts as a resonant amplifier of the flow
perturbation. The signature is a frequency that shifts when the *manifold* is
changed and does not shift when the chamber is lengthened. Fixes are to change
manifold volume, split the manifold, or add distributed resistance so the
manifold mode is heavily damped [SP-8089][SP-194 §3.5].

**Entropy (convective) waves.** A fluctuation in mixture ratio or in vaporization
produces a *temperature* fluctuation — an entropy spot — that is convected
downstream at the mean gas velocity, not the sound speed. When the spot reaches
the converging nozzle it is accelerated, and an accelerating temperature
non-uniformity generates a pressure wave that travels back upstream at $c-\bar u$.
The loop time is

$$T_{ent} = \frac{L_{cyl}}{\bar u} + \frac{L_{cyl}}{c-\bar u}$$

> **Eq. 3.8** — variables: $L_{cyl}$ chamber length [m]; $\bar u$ mean chamber gas
> velocity [m/s]; $c$ speed of sound [m/s]. Meaning: the period of the
> convective-acoustic loop that couples the injector to the nozzle. Assumes: a
> compact nozzle that converts entropy to pressure at one station, negligible
> diffusion of the entropy spot, uniform $\bar u$. Fails when: the spot diffuses
> or is destroyed by turbulence over the chamber length (usually it partly does,
> which is why entropy modes are weak in long chambers).

For the reference chamber ($L_{cyl} = 0.5$ m, $\bar u = 300$ m/s, $c = 1200$
m/s), $T_{ent} = 1.67 + 0.56 = 2.22$ ms, i.e. **450 Hz** — the middle of the
intermediate band, and a frequency with no acoustic mode near it. Because
$\bar u \ll c$, the convective leg dominates and **the entropy-mode frequency
scales with chamber length over gas velocity**, which is a distinguishing test:
it moves strongly with chamber length and with mixture ratio, while an acoustic
mode moves only with $\sqrt{T_c}$ and diameter.

**Buzz** is the generic name for the resulting few-hundred-hertz oscillation, and
in practice it is often a *coupled* manifold-and-entropy phenomenon. It is
usually a nuisance rather than a killer — amplitudes of 2–10 % of $p_c$ — but it
fatigues injector hardware and it is a reliable precursor: a chamber that buzzes
at one operating point frequently screeches at another.

### 3.8 High frequency: the chamber as an acoustic cavity

#### The eigenvalue problem

Idealise the chamber as a rigid-walled cylinder of radius $R_c = D_c/2$ and
length $L_{cyl}$, closed at both ends, filled with uniform gas at sound speed
$c$. The wave equation $\nabla^2 p' = c^{-2}\partial^2 p'/\partial t^2$ separates
in cylindrical coordinates, and the solutions are

$$p'(r,\theta,z,t) = \hat p\; J_m\!\left(\alpha_{mn}\frac{r}{R_c}\right)\cos(m\theta)\;\cos\!\left(\frac{q\pi z}{L_{cyl}}\right)e^{i\omega t}$$

with the rigid-wall condition $\partial p'/\partial r = 0$ at $r = R_c$ requiring
$J_m'(\alpha_{mn}) = 0$. The frequency follows from the dispersion relation:

$$f_{mnq} = \frac{c}{2\pi}\sqrt{\left(\frac{\alpha_{mn}}{R_c}\right)^{\!2} + \left(\frac{q\pi}{L_{cyl}}\right)^{\!2}}$$

> **Eq. 3.9** — variables: $m$ azimuthal (tangential) order, the number of nodal
> diameters [—]; $n$ radial order [—]; $q$ longitudinal order [—];
> $\alpha_{mn}$ the $n$-th non-trivial root of $J_m'(x)=0$ [—]; $R_c$ chamber
> radius [m]; $L_{cyl}$ barrel length [m]; $c$ speed of sound in the chamber gas
> [m/s]. Meaning: the natural resonant frequencies of the gas column. Assumes:
> rigid walls, uniform gas, no mean flow, a hard-walled closed end at the nozzle.
> Fails when: (i) the nozzle end is not rigid — it is a partially transmitting
> boundary that radiates energy away, which shifts frequencies down by a few
> percent and provides the dominant damping; (ii) the chamber has a strong axial
> temperature gradient (it does — the first 20 % of the chamber is far cooler
> than the burned gas), which lowers the effective $c$ near the face; (iii) the
> chamber is not a plain cylinder. **Expect the measured mode within 10–20 % of
> Eq. 3.9** [A][SP-194 §3.6][LRECI].

Two limits are worth writing out. Pure **longitudinal** modes ($m = n = 0$):

$$f_{00q} = \frac{q\,c}{2L_{cyl}}$$

Pure **transverse** modes ($q = 0$), which are the dangerous ones in large
engines:

$$f_{mn0} = \frac{\alpha_{mn}\,c}{2\pi R_c} = \frac{\alpha_{mn}\,c}{\pi D_c}$$

and a combined mode is the Pythagorean sum, $f = \sqrt{f_{mn0}^2 + f_{00q}^2}$.

#### The Bessel-root table

| mode | name | $m$ | $n$ | $\alpha_{mn}$ | pressure pattern |
|---|---|---|---|---|---|
| 1T | first tangential | 1 | 1 | **1.8412** | one nodal diameter; max at wall, opposite signs across the chamber |
| 2T | second tangential | 2 | 1 | **3.0542** | two nodal diameters (a "cloverleaf") |
| 3T | third tangential | 3 | 1 | 4.2012 | three nodal diameters |
| 1R | first radial | 0 | 2 | **3.8317** | one nodal circle; axisymmetric "breathing" |
| 4T | fourth tangential | 4 | 1 | 5.3176 | four nodal diameters |
| 1T1R | combined | 1 | 2 | 5.3314 | one nodal diameter and one nodal circle |
| 2R | second radial | 0 | 3 | 7.0156 | two nodal circles |

($\alpha_{01} = 0$ is the trivial uniform mode; the radial modes are the zeros of
$J_0' = -J_1$, hence 3.8317 and 7.0156, the familiar $J_1$ zeros.)

The ordering — **1T below 2T below 1R** — is universal and is the reason the
first tangential mode is the one every stability programme fights: it is the
lowest-frequency transverse mode, it is therefore the closest to the combustion
response peak, and it is the least damped.

#### Standing versus spinning tangential modes

$\cos m\theta$ and $\sin m\theta$ are degenerate — same frequency, orthogonal
orientation. Any combination is also a solution, including the travelling
combination $\cos(m\theta - \omega t)$, a **spinning** tangential mode in which
the pressure maximum rotates around the chamber at $\omega/m$. Real chambers show
both, and often a standing mode that slowly precesses. This matters for two
practical reasons: a spinning 1T concentrates its heat-flux damage in a rotating
band that scours the *whole* circumference (rather than two opposite stripes),
and the diagnostic is a **phase measurement between two circumferentially spaced
transducers** — a constant 180° phase between diametrically opposite transducers
means a standing 1T oriented across them, while a phase that ramps linearly with
azimuth means a spinning mode.

#### Real-engine scale

**Reference chamber** ($D_c = 0.50$ m, $L_{cyl} = 0.50$ m, $c = 1200$ m/s):
1L 1200 Hz, 1T 1407 Hz, 1T1L 1849 Hz, 2T 2333 Hz, 1R 2927 Hz. Worked in full in
WE1.

**F-1 scale.** The F-1's throat diameter follows from its published thrust,
$p_c$ and $\varepsilon$ as $D_t \approx 0.891$ m (Module 06 §6.3), and for
plausible contraction ratios of 1.4–1.8 the barrel is $D_c \approx 1.05$–1.20 m
[A] — the verification file does not publish a chamber diameter, so this is a
derived estimate, not a quoted dimension. With fully burned LOX/RP-1 gas
($\gamma = 1.22$, $M = 23.3$ kg/kmol, $T_c = 3600$ K, $c = 1252$ m/s) that gives

$$f_{1T} \approx \frac{1.8412 \times 1252}{\pi \times 1.13} \approx 650\ \mathrm{Hz}$$

with a plausible range of 610–700 Hz. The gas near the injector face, where the
mode is driven, is neither fully burned nor at $T_c$; with an effective sound
speed of 800–1000 m/s the same geometry gives **415–520 Hz**. That bracket
straddles the several-hundred-hertz band in which the F-1's instability was
actually reported [OY93], and it makes the pedagogically important point: the
F-1's first tangential mode sat at a frequency that a naive classification would
call "intermediate". Large chambers have low acoustic frequencies, and the
frequency bands in §3.2 are conventions about mechanism, not about hertz.

**RS-25 scale.** From 2,279 kN vacuum at 206.4 bar with $\varepsilon = 69$ and
$\gamma = 1.20$, $C_{F,vac} = 1.927$ and $A_t = 0.0573$ m², so $D_t = 0.270$ m;
with a contraction ratio near 2.5–3.2, $D_c \approx 0.43$–0.48 m [A]. LOX/LH₂ at
$M = 13.5$ kg/kmol and $T_c = 3550$ K gives $c = 1620$ m/s — **35 % higher than a
kerosene engine's**, purely because of the low molar mass. Hence

$$f_{1T} \approx \frac{1.8412 \times 1620}{\pi \times 0.465} \approx 2000\ \mathrm{Hz}$$

**Two structural facts fall out of this comparison and they explain most of
engine stability history [F]:**

1. **Bigger chamber → lower frequency.** $f_{1T} \propto 1/D_c$. Scaling an
   engine up moves its transverse modes *down*, toward the frequencies at which
   atomization and vaporization respond most strongly (roughly the inverse of the
   droplet lifetime, order 1–5 kHz). This is why instability is a big-engine
   problem, and why it appeared on the F-1 and not on the H-1 that preceded it.
2. **Hydrogen → higher frequency.** A LOX/LH₂ chamber of the same diameter has
   modes 30–40 % higher than a kerosene chamber, and hydrogen's combustion
   response is fast and its droplets nonexistent. Hydrogen engines are not immune
   — the RS-25 carries acoustic cavities for good reason — but their problems are
   different: LOX-post-driven and higher in frequency.

### 3.9 The Crocco–Cheng sensitive time-lag model

#### The idea

Crocco and Cheng's 1956 model [CC56] is still the analytical framework the field
argues in, and its virtue is that it compresses everything unknowable about the
combustion — atomization, droplet heating, vaporization, mixing, chemical
kinetics — into **two numbers**.

Split the total time from injection to heat release into an *insensitive* part
(during which nothing that happens depends on chamber pressure) and a
**sensitive time lag** $\tau$, during which the rate of the pressure-sensitive
processes scales as some power of pressure. Formally, a fluid element injected at
$t-\tau_{tot}$ burns when the accumulated "preparation" reaches a threshold:

$$\int_{t-\tau}^{t} f\big(p(t')\big)\,dt' = \text{const}$$

Perturb: $f \propto p^n$, so $f'/\bar f = n\,p'/\bar p$, and the requirement that
the integral stay constant makes the *lag itself* fluctuate. Working through the
perturbation of the burning rate gives the central result:

$$\frac{\dot m_b'(t)}{\bar{\dot m}_b} \;=\; n\left[\frac{p'(t)}{\bar p} - \frac{p'(t-\tau)}{\bar p}\right]$$

> **Eq. 3.10 (the $n$–$\tau$ law)** — variables: $\dot m_b'$ perturbation of the
> rate at which propellant is converted to hot gas [kg/s]; $n$ **interaction
> index**, the pressure sensitivity exponent of the rate-controlling process
> [—]; $\tau$ **sensitive time lag** [s]. Meaning: the combustion responds to the
> *difference* between pressure now and pressure one lag ago — the response is a
> pure differencing operator, and it is exactly this differencing that produces
> the strong frequency dependence. Assumes: a single lag common to all elements,
> a single sensitivity exponent, small perturbations, no velocity coupling.
> Fails when: velocity coupling matters (transverse velocity shredding a spray
> is a first-order effect in real transverse instability, and it is *not* in this
> model), when there is a spread of lags across the face (there always is, and it
> is stabilising), or at limit-cycle amplitudes where the response saturates.

In the frequency domain, with $p' \propto e^{i\omega t}$, the response function is

$$R(\omega) = \frac{\dot m_b'/\bar{\dot m}_b}{p'/\bar p} = n\left(1 - e^{-i\omega\tau}\right) = 2n\sin\!\left(\frac{\omega\tau}{2}\right)e^{\,i(\pi-\omega\tau)/2}$$

which is the useful form: **magnitude $2n|\sin(\omega\tau/2)|$, maximum at
$\omega\tau = \pi$** — i.e. when the lag is exactly half a period of the mode.
That is the sentence to remember. A mode is most strongly driven when
$\tau \approx T/2 = 1/(2f)$. For $\tau = 1$ ms the worst mode is at 500 Hz; for a
hydrogen engine with $\tau = 0.25$ ms it is at 2 kHz. **The combination of the
chamber's mode frequencies and the propellant's lag decides which mode you get
into trouble with**, and it is the reason changing the propellant, the element
size or the chamber diameter can each independently fix or cause an instability.

#### The neutral-stability boundary and the stability map

Close the loop for the lumped (low-frequency) chamber: substitute the $n$–$\tau$
response into the chamber capacitance equation of §3.4, replacing the injector
feedback with combustion feedback:

$$\tau_c\,\dot p' + p' = n\big[p'(t) - p'(t-\tau)\big]$$

Setting $p' = \hat p e^{i\omega t}$ and separating real and imaginary parts:

$$1 = n\,(1-\cos\omega\tau), \qquad \omega\tau_c = n\sin\omega\tau$$

Dividing the second by the first and using the half-angle identities gives a
remarkably clean pair:

$$\boxed{\ \omega\tau_c = \cot\!\left(\frac{\omega\tau}{2}\right), \qquad n_{crit} = \frac{1}{1-\cos\omega\tau} = \frac{1}{2\sin^2(\omega\tau/2)}\ }$$

> **Eq. 3.11** — variables as above. Meaning: solve the first for $\omega$ given
> $\tau$ and $\tau_c$, then evaluate the second; if the propellant's actual $n$
> exceeds $n_{crit}$ the chamber is linearly unstable at that frequency.
> Assumes: lumped chamber (valid only for modes whose wavelength exceeds the
> chamber dimensions — chug and $L^*$ modes, not acoustics), constant $n$ and
> $\tau$. Fails when: applied to an acoustic mode, where the correct treatment
> distributes the response over the mode shape and adds nozzle and wall damping.

The limiting case is famous. As $\tau_c \to 0$, $\omega\tau \to \pi$ and
$n_{crit} \to 1/2$: **a chamber with negligible capacitance is unstable whenever
$n > 1/2$**, and since measured interaction indices for storable and kerosene
propellants are typically 0.3–1.0 [SP-194 §4][LRECI], the margin is genuinely
thin. For the reference chamber ($\tau_c = 1.48$ ms):

| $\tau$ (ms) | $f$ (Hz) | $\omega\tau$ (rad) | $n_{crit}$ |
|---|---|---|---|
| 0.8 | 198 | 0.996 | 2.19 |
| 1.2 | 158 | 1.194 | 1.58 |
| 2.0 | 118 | 1.481 | 1.10 |

The chamber's capacitance is doing a great deal of work: it raises the required
$n$ from 0.5 to 1.1–2.2.

**The stability map.** Plot the neutral curve in the $(\tau, n)$ plane — or, more
usually, $(\omega\tau, n)$ — for each acoustic mode of interest. Each mode
contributes a U-shaped curve with a minimum near $\omega\tau = \pi$; the region
above the lowest curve is unstable. An engine is a *point* on that plane
(its propellant fixes $n$, its element design fixes $\tau$), and the design
question is how far below the lowest curve that point sits. Three moves are
available: **lower $n$** (change propellant or element type — the least
controllable), **shift $\tau$** (element size, impingement distance, recess —
moving the point horizontally out from under a mode's minimum), and **push the
curves up** (add damping — resonators and baffles raise $n_{crit}$ for the mode
they attack). The last is the only one that reliably works on a mature design,
which is why the hardware of §3.13 exists.

**What the map cannot do.** It is a linear theory. It tells you whether an
infinitesimal disturbance grows; it says nothing about the limit-cycle
amplitude, nothing about the threshold amplitude for a nonlinearly unstable
chamber, and $n$ and $\tau$ are not predicted from first principles — they are
fitted to test data from the very engine you are trying to certify. That is not
a reason to discard it; it is a reason to treat it as a framework for
*organising* test data rather than as a predictor. Every honest account of the
model says so, including [CC56] itself.

### 3.10 Mechanisms of coupling: what actually responds

The $n$–$\tau$ model hides the mechanism. Here is what is inside it, roughly in
order of importance for high-frequency transverse instability [SP-194 §2][LRECI]
[OY93]:

**Atomization response.** A transverse acoustic mode produces a gas *velocity*
oscillation of amplitude $u' = p'/(\rho c)$, which at 10 % of a 100-bar chamber
pressure with $\rho = 8$ kg/m³ and $c = 1200$ m/s is $u' \approx 100$ m/s
transverse — comparable to the injection velocity. That oscillating cross-flow
periodically strips and re-forms the liquid sheets and jets, modulating the drop
size at the acoustic frequency. Because vaporization rate goes roughly as
$1/d^2$, a modest drop-size modulation is a large heat-release modulation. This
is **velocity coupling** and it is why transverse modes are so much more
dangerous than longitudinal ones: a longitudinal mode's velocity antinode is at
the nozzle end, far from the spray, whereas a transverse mode's is right across
the injector face.

**The Klystron effect.** Named by analogy with the microwave tube. The
oscillating pressure at the injector face modulates the injection *velocity* of
each jet — faster during the low-pressure part of the cycle, slower during the
high-pressure part. Droplets injected at different times therefore travel at
different speeds, and downstream they **bunch**: fast drops catch slow ones, so
a smooth velocity modulation at the face becomes a strong *density* modulation
some distance downstream, with a delay equal to the bunching distance over the
mean velocity. The heat release is then modulated at the acoustic frequency at
precisely the axial station where the bunching is tightest. It is a mechanism
that converts a small perturbation at the face into a large one downstream, and
its delay is geometric — you can move it by changing injection velocity or
element length **[F]**, [SP-194 §2.3].

**Hydrodynamic instability of impinging fans.** Two impinging jets produce a
liquid sheet that is already unstable — it flaps, with a natural frequency set by
the jet velocity, orifice diameter and impingement angle (Module 07 §3.5). If
that natural flapping frequency lands near a chamber acoustic mode, the sheet
locks to it, and the whole element becomes a phase-locked, high-gain oscillator
converting steady flow into pulsed heat release. This is the single best
explanation of why the F-1's large like-on-like doublets were so troublesome:
element hydrodynamic frequencies scale roughly as $v_{inj}/d_{orifice}$, so
**bigger orifices flap slower**, and the F-1's big orifices flapped in the same
band as its low-frequency 1T mode **[E]/[J]**, [OY93][LRECI].

**Vaporization response.** The rate-controlling step for kerosene and storables.
Droplet vaporization rate depends on pressure through gas density, on temperature
through the driving $\Delta T$, and on relative velocity through the convective
correction. The response has a characteristic time equal to the droplet lifetime
(0.5–3 ms for 100–200 μm kerosene drops), and it peaks — like everything else —
when the acoustic period is about twice that. Hydrogen is the exception: above
its critical pressure there is no droplet and no latent heat, the LOX jet
undergoes a continuous transcritical density change, and the "vaporization
response" is really a turbulent mixing response, faster and less pressure
sensitive.

**Mixing response.** Even with drop size and vaporization fixed, the local
mixture ratio can oscillate — the acoustic velocity displaces the oxidizer and
fuel sprays differently because their momenta differ. Since $T_c$ near
stoichiometric is a steep function of mixture ratio, a mixture-ratio oscillation
is a heat-release oscillation with essentially zero delay. This is the mechanism
that makes *unlike*-impinging elements more responsive than *like*-impinging
ones, and it is one of the few arguments in favour of like-on-like patterns.

### 3.11 Element type and stability

The design conclusion of §3.10 is that stability is largely decided by the
injector element, and specifically by **how much of the heat release sits close
to the face and how fast it can respond**. [J]/[H], and this is the practical
knowledge that separates a first design from a second one.

| element | why it behaves as it does | stability reputation |
|---|---|---|
| **Like-on-like doublet, large elements** | Coarse sprays, long vaporization lag, self-impinging fans with a hydrodynamic flapping frequency that scales as $v/d$ and lands low for large orifices. Heat release concentrated a short distance from the face. | Poor at large scale — the F-1 problem. Acceptable at small scale where $d$ is small and $f_{1T}$ is high. |
| **Unlike doublet / triplet** | Mixes faster (good for $\eta_{c^*}$), but mixture ratio is directly modulated by transverse velocity, so the mixing response is strong and nearly instantaneous. | Poor-to-moderate; almost always requires baffles at booster scale (Titan LR87/LR91, [_verify-liquid]). |
| **Shear coaxial (LOX post + fuel annulus)** | Heat release distributed over a long axial development length; the LOX core takes time to break up. But the posts themselves are slender cantilevers in a transverse acoustic field and can fail by high-cycle fatigue, and the recess depth changes the lag by tens of percent. | Moderate. The RS-25 needed acoustic cavities; the J-2 lineage was manageable. Hydrogen's short lag pushes the trouble to higher frequency. |
| **Swirl coaxial** | The propellant leaves as a thin conical *sheet* with a large surface area and a wide spray angle. Break-up is dominated by the sheet's own centrifugal dynamics rather than by the ambient gas, so an imposed transverse gas velocity perturbs it much less. Heat release is spread over a large volume. | Good. This is the Soviet/Russian standard practice — RD-253, RD-170 family, RD-180, and by SpaceX's account Raptor 2 onward [_verify-liquid]. |
| **Pintle** | One element. There is no element-to-element coupling, no fan-to-fan phasing, and no periodic face pattern for a tangential mode to lock onto. The spray is a single radial sheet intercepting an axial annular flow, and much of the heat release is well downstream and near the wall — where a 1T mode has high pressure but the mixing is comparatively insensitive. Additionally the pintle's radial sheet is a strong acoustic obstruction near the face. | Very good. TRW fired a large family of pintle engines without encountering a high-frequency instability, and reports no dedicated stabilisation devices on the LMDE [Dressler00]. This claim comes from the vendor; treat "inherently stable" as strongly supported by service history and weakly supported by theory. |

Two qualifications on the pintle, because it is the most over-claimed item in the
table. First, pintles are not immune to *chug* — a single element still has an
injector $\Delta p$ and a combustion lag, and pintle engines throttle deeply,
which is exactly the regime where $\Delta p/p_c$ collapses (Module 07 §3.4).
Second, "inherently stable" is a statement about *high-frequency transverse*
modes, which is where the historical evidence is.

### 3.12 Damping: the other side of the ledger

Eq. 3.3 has two sides, and the right-hand side is where the engineering leverage
is. The damping mechanisms available in a rocket chamber, in rough order of
magnitude [SP-194 §8][SP-8113 §2.3]:

- **Nozzle damping.** The converging nozzle is not a rigid wall; acoustic energy
  convects and radiates out through it. This is usually the *largest* natural
  damping term, and it is strongly mode-dependent: longitudinal modes lose a lot
  through the nozzle, purely transverse modes lose relatively little (their
  velocity is perpendicular to the flow direction). Quantified by the **nozzle
  admittance**, computed from a linearised solution of the flow in the
  convergent section [Culick68][SP-194 §3.6]. This asymmetry is the fundamental
  reason transverse modes are the ones that survive.
- **Acoustic absorbers** — quarter-wave cavities, Helmholtz resonators, slotted
  liners. Deliberate, tunable, and the main tool for high-frequency modes (§3.13).
- **Baffles.** Not primarily absorbers: they restructure the mode so the
  vulnerable one no longer exists at a vulnerable frequency, and they add viscous
  and vortex-shedding losses at the blade edges (§3.13).
- **Droplet and particle drag.** Relative motion between the oscillating gas and
  the (much heavier) droplets dissipates energy. This is significant, and it has a
  perverse consequence: **finer sprays damp less**, because small drops follow the
  gas. Improving atomization therefore raises both the driving and reduces the
  damping. It is the clearest example in propulsion of a performance improvement
  that is a stability regression.
- **Viscous and thermal boundary-layer losses** at the wall. Small in a big
  chamber (they scale with surface-to-volume ratio) but not negligible in a small
  one — one of the reasons small thrusters are quieter than scaling suggests.
- **Mean-flow convection.** Any energy in the acoustic field is convected toward
  the nozzle at $\bar u$; at $\mathrm{Ma}\approx0.3$ this is a real term.

### 3.13 Stabilisation hardware

#### Baffles

A baffle is an array of blades projecting from the injector face into the
chamber. It works in three ways, and only the first is dominant [SP-8113 §3]:

1. **It changes the eigenvalue problem.** With $N$ radial blades running from the
   centre to the wall, the chamber near the face is divided into $N$ sectors of
   angle $2\pi/N$ with rigid radial walls. In a sector, the azimuthal solution
   must satisfy $\partial p'/\partial\theta = 0$ on both radial walls, so the
   admissible azimuthal orders are $m = jN/2$ for $j = 1, 2, \dots$ — the lowest
   is $m = N/2$, not $m = 1$. The 1T mode *cannot exist* inside a compartment.
   The lowest transverse frequency the baffled region supports is

   $$f_{1T}^{baffled} = \frac{\alpha_{N/2,1}\;c}{\pi D_c}$$

   > **Eq. 3.12** — variables: $N$ number of compartments [—]; $\alpha_{\nu,1}$
   > first non-trivial root of $J_\nu'(x)=0$ for (possibly non-integer) order
   > $\nu = N/2$ [—]. A good approximation for the root is
   > $\alpha_{\nu,1} \approx \nu + 0.8086\,\nu^{1/3} + 0.0725\,\nu^{-1/3} -
   > 0.0510\,\nu^{-1}$, accurate to 0.1 % for $\nu \ge 1$. Meaning: the baffle
   > raises the lowest transverse mode by the factor
   > $\alpha_{N/2,1}/1.8412$. Assumes: blades that run the full radius, are
   > acoustically rigid, and extend far enough axially to cover the region where
   > the mode is driven. Fails when: the blades are too short — beyond the blade
   > tips the full unbaffled mode reappears, so a baffle that is too short simply
   > moves the problem downstream.

   Sample values for the reference chamber ($D_c = 0.5$ m, $c = 1200$ m/s,
   unbaffled $f_{1T} = 1407$ Hz):

   | $N$ | $\nu = N/2$ | $\alpha_{\nu,1}$ | lowest transverse $f$ (Hz) | ratio to 1T |
   |---|---|---|---|---|
   | 3 | 1.5 | 2.460 | 1879 | 1.34 |
   | 4 | 2.0 | 3.054 | 2333 | 1.66 |
   | 5 | 2.5 | 3.632 | 2775 | 1.97 |
   | 6 | 3.0 | 4.201 | 3209 | 2.28 |
   | 8 | 4.0 | 5.318 | 4062 | 2.89 |
   | 13 | 6.5 | 8.041 | 6143 | 4.37 |

2. **It shields the spray from transverse velocity.** Inside a compartment the
   transverse gas velocity at the acoustic frequency is greatly reduced, which
   cuts the velocity-coupling term of §3.10 directly.
3. **It dissipates.** Vortex shedding from the blade tips converts acoustic
   energy to turbulence. A real but second-order effect.

**Blade length is the design parameter that gets underestimated.** The baffle
must extend axially past the region where the coupling occurs — i.e. past most of
the heat-release zone, not merely past the sprays. Design practice puts $L_b$ at
roughly 0.1–0.3 $D_c$ [E][SP-8113], and the honest statement is that it was set
by test on every programme that ever needed it.

**What baffles cost.** (i) They are in the hottest, highest-heat-flux region of
the engine and must be cooled — the F-1's are copper, fed from the fuel circuit
and consuming fuel that is then injected off-pattern. (ii) They occupy chamber
volume in which combustion is being *organised* rather than completed, so the
effective $L^*$ is lower than the geometric one (Module 06 §6.3). (iii) They
disturb the injection pattern near the blades, costing $\eta_{c^*}$ — typically
0.5–2 %. (iv) They are a structural and thermal-fatigue liability: a burned-off
baffle blade is a piece of copper travelling down a nozzle.

#### Acoustic cavities and quarter-wave tubes

An absorber is a small volume of gas coupled to the chamber through an aperture,
tuned so that near its resonance the gas in the aperture moves with large
amplitude and out of phase with the chamber pressure, doing negative work on the
mode and dissipating the energy viscously in the aperture. Two geometries:

**Quarter-wave tube.** A tube of depth $L_{cav}$, closed at the far end, resonates
when the depth is a quarter wavelength:

$$f_{cav} = \frac{c_{cav}}{4\,L_{eff}}, \qquad L_{eff} = L_{cav} + \Delta L$$

> **Eq. 3.13** — variables: $c_{cav}$ speed of sound in the *cavity* gas [m/s];
> $L_{cav}$ geometric depth [m]; $\Delta L$ end correction, ≈ 0.4–0.8 times the
> aperture's characteristic dimension [m]. Meaning: at this frequency the aperture
> sees a velocity antinode and the absorber is maximally effective. Assumes:
> plane waves in the tube, uniform cavity gas, aperture small compared with the
> wavelength. Fails when: the cavity gas temperature is not what you assumed —
> and it never is.

**Helmholtz resonator.** A volume $V$ connected through necks of total area
$A_n$ and effective length $L_{eff}$:

$$f_{H} = \frac{c_{cav}}{2\pi}\sqrt{\frac{A_n}{V\,L_{eff}}}$$

> **Eq. 3.14** — variables: $V$ cavity volume [m³]; $A_n$ total neck area [m²];
> $L_{eff}$ neck length plus end corrections [m]. Meaning: the gas plug in the
> neck is the mass, the gas in the cavity is the spring. Assumes: $V$ small
> compared with $(\lambda/2\pi)^3$ so the cavity pressure is uniform; linear
> amplitudes. Fails when: the acoustic particle velocity in the neck becomes
> large enough for jetting and separation (which is normal at instability
> amplitudes, and *increases* the damping while lowering the effective tuning —
> nonlinear absorbers are more forgiving than the linear theory suggests).

**The cavity gas temperature is the whole problem.** The absorber is tuned by
$c_{cav} = \sqrt{\gamma R T_{cav}}$, and $T_{cav}$ depends on how the cavity is
purged. With a fuel or inert purge the cavity may run at 700–1500 K; unpurged it
fills with combustion gas near $T_c$. Between 800 K and 3300 K the sound speed
varies by a factor of two, so the *same hardware* is tuned to two frequencies an
octave apart (WE3 works this through). Consequences in practice:

- Cavities are made **several different depths** on one injector, so the assembly
  covers a band rather than a line — deliberately detuning some of them.
- The purge flow rate is a *stability* parameter, not just a cooling parameter.
- The resonator's bandwidth is set by its damping; a well-designed rocket
  absorber is deliberately lossy ($Q$ of order 5–20), trading peak absorption for
  a usable band **[J]**.

The RS-25 uses acoustic-resonator cavities in the injector face and no baffles
[_verify-liquid, RS-25 block] — the choice is coupled to the fact that its 1T mode
is near 2 kHz, where a cavity of a few centimetres' depth is practical. A cavity
tuned to the F-1's several-hundred-hertz 1T would need to be tens of centimetres
deep, which is why the F-1 got baffles instead. **Frequency, not fashion, decides
between a baffle and a cavity [J].** Acoustic cavities and quarter-wave slots are
widely reported on the J-2, on Titan-family injectors and on Vulcain; the
verification file confirms baffles on the Titan LR87/LR91 injectors and cavities
on the RS-25, and does not confirm the others — treat those attributions as
unverified here.

#### Injector redesign

The cheapest fixes if you can afford them early enough, all acting on $\tau$, $n$
or the axial distribution of heat release:

- **Smaller elements, more of them.** Raises the hydrodynamic frequency of the
  spray out of the acoustic band and shortens the vaporization lag. Costs
  manufacturing complexity and face cooling.
- **Higher $\Delta p_{inj}$.** Buys chug margin directly (Eq. 3.6), and raises
  injection velocity, which shortens $\tau$. Costs pump power (Module 07 §3.4).
- **Impingement distance.** Moving the impingement point away from the face moves
  the heat release to a lower-$|p'|$ region for a longitudinal mode and delays
  the response.
- **LOX post recess** on coaxial elements. Recessing the post so the shear layer
  develops inside a cup changes the lag substantially and — in most reported
  work — improves stability, at some cost in post thermal environment.
- **Deliberate pattern non-uniformity.** A pattern with a distribution of element
  sizes or a de-tuned outer row spreads $\tau$ across the face, and a *spread* of
  lags is stabilising because the $\sin(\omega\tau/2)$ responses no longer add in
  phase. This is the least intuitive and most useful trick in the box **[J]**.

#### Chamber geometry

Changing $D_c$ moves every transverse mode; changing $L_{cyl}$ moves the
longitudinal ones. Since $f_{1T}\propto 1/D_c$ and contraction ratio sets $D_c$
for a given throat, **the contraction ratio is a stability parameter** (Module 06
§3.12). This is genuinely used: if the 1T sits on the combustion response peak,
a few percent of $D_c$ moves it off. It is also the reason the Soviet
multi-chamber architecture works so well as a stability strategy — see §6.

### 3.14 Stability rating: how you prove it

Since a chamber can be linearly stable and nonlinearly unstable, "it ran for 100
seconds without going unstable" is not evidence. The accepted practice, codified
in [SP-8113] and unchanged in principle since, is to **disturb the running engine
deliberately and measure how fast the disturbance decays** [F]/[M].

**The three disturbance sources.**

| method | what it is | disturbance character | comments |
|---|---|---|---|
| **Bomb** | a small explosive charge in a case, mounted through the chamber wall or on the injector face, initiated at steady state | Sharp, broadband, large amplitude (tens of percent of $p_c$ locally); excites everything at once | The most severe and the most standard. Position matters: near the injector face and off-axis to excite tangential modes. The case fragments must be benign. |
| **Pulse gun** | a small gun that fires a slug of gas (or a projectile) through a burst diaphragm into the chamber | Directional, repeatable, tunable amplitude, less broadband | Better for parametric work — you can sweep amplitude to find the *threshold* for nonlinear instability, which a bomb cannot do |
| **Directed gas flow** | a jet of inert or fuel gas injected tangentially at the chamber wall | Continuous, non-explosive, moderate amplitude | Used where explosives are impractical, and to excite a specific mode continuously |

**The criterion.** The engine must return to its pre-disturbance noise level
within a specified time, and both the time and the reference amplitude are
programme-specific. [SP-8113]'s **dynamic stability** definition is the standard
one: the engine is dynamically stable if, following a disturbance of specified
magnitude, the resulting oscillation **damps to within the pre-pulse noise band
within a specified interval**, for a specified number of pulses at specified
operating conditions. Common practice expresses the requirement as **decay to
10 % of the peak disturbance amplitude within a stated time**, typically 10–50
ms. The F-1's requirement was recovery within **45 ms** after a bomb detonated
near the injector centre at full thrust [_verify-liquid, F-1 block][OY93].

Converting a criterion to a damping rate is one line. For an exponentially
decaying mode $\hat p(t) = \hat p_0 e^{-\alpha_d t}$:

$$\alpha_d = \frac{\ln(\hat p_0/\hat p)}{t}, \qquad \text{"10 \% in } t_{10}\text{"} \Rightarrow \alpha_d = \frac{\ln 10}{t_{10}} = \frac{2.303}{t_{10}}$$

> **Eq. 3.15** — variables: $\alpha_d$ damping rate [s⁻¹]; $t_{10}$ time to decay
> to 10 % of peak [s]. Meaning: converts a test acceptance criterion into the
> quantity an analysis produces. Assumes: a single mode decaying exponentially —
> read off the envelope of the band-pass-filtered dynamic pressure, not the raw
> trace. Fails when: two modes with different decay rates are present (the
> envelope has a knee), or when the response is a decaying *limit cycle*, which
> decays much more slowly than exponentially near the end.

So a 45 ms requirement is $\alpha_d \ge 51$ s⁻¹ and a 20 ms requirement is
$\alpha_d \ge 115$ s⁻¹. It is worth relating that to a damping ratio: at 500 Hz,
$\alpha_d = 51$ s⁻¹ is $\zeta = \alpha_d/\omega = 0.016$, i.e. $Q \approx 30$.
**A "dynamically stable" rocket chamber is a very lightly damped resonator that
happens to be net-stable** — which is exactly why the margin is fragile and why
small design changes flip it.

**How many pulses, and where.** A rating programme pulses at several operating
points (mixture ratio and thrust extremes, not just nominal), at more than one
bomb location, and repeats — a single successful recovery is not statistical
evidence. Programmes that shortcut this have been embarrassed later.

### 3.15 Modern analysis methods

The state of practice, honestly stated: **no method predicts limit-cycle
amplitude reliably enough to replace the bomb test** [M]. What has changed since
[SP-194] is the ability to compute the pieces.

- **Linear acoustic solvers.** Finite-element Helmholtz solvers give the mode
  shapes and frequencies of the real (non-cylindrical, non-uniform-temperature)
  chamber including nozzle admittance, in minutes. This has essentially retired
  hand calculation of mode frequencies except as a sanity check — but Eq. 3.9 is
  still how you check the solver.
- **Flame transfer / describing functions.** Measure or compute the heat-release
  response to an imposed pressure or velocity oscillation as a function of
  frequency *and amplitude* (a flame describing function), then feed it into the
  acoustic solver. This is the modern replacement for $n$ and $\tau$, and it is
  amplitude-dependent, so it can predict limit cycles in principle.
- **Large-eddy simulation with real-fluid thermodynamics.** LOX/LH₂ and LOX/CH₄
  chambers run above the critical pressure of both propellants, so the classic
  droplet picture is wrong and the physics is a variable-density turbulent mixing
  layer with strongly non-ideal thermodynamics. LES with a real-fluid equation of
  state, sometimes Euler–Lagrange for the sub-critical spray region, is the
  research standard [R][LRTC][OY93]. Cost is the limitation: a full engine at
  flight scale for enough cycles to establish a limit cycle is still a heroic
  computation.
- **Model rocket combustors.** The most useful experimental development of the
  last twenty years: small, optically accessible, deliberately *unstable*
  combustors with a variable acoustic length, run at realistic pressures, that
  produce repeatable self-excited instability for model validation. The Purdue
  continuously-variable-resonance combustor and the AFRL/industry rigs of that
  family are the reference examples [R]. They exist because full-scale data is
  expensive, sparse, and rarely instrumented well enough to validate anything.
- **Company claims.** SpaceX has stated that Raptor is stable across its
  operating range and has attributed this partly to the coaxial swirl element.
  There is no public data — no PSD, no bomb-test result, no damping rate. Treat
  it as a claim, consistent with what is known about swirl elements, and
  unverified [_verify-liquid, Raptor block].

### 3.16 Cross-reference: solid motors

Solid motors have the same Rayleigh criterion and much of the same acoustic
machinery, with three differences (Module 20):

- The response function is the **pressure-coupled response function** of the
  burning surface, $R_p = (\dot r'/\bar{\dot r})/(p'/\bar p)$, derived from the
  unsteady solid-phase heat conduction and gas-phase flame [Culick68]. It peaks
  at a frequency set by the solid thermal wave, typically 500–3000 Hz.
- The dominant mode is usually **longitudinal**, because the grain port is a long
  duct rather than a squat cylinder.
- The dominant damping is **particle damping** from aluminium-oxide droplets, and
  it is tuned by the particle size distribution — a design parameter with no
  liquid-engine analogue.

The measurement analogue of the bomb test is the **T-burner**, which measures the
response function directly. Velocity coupling and vortex shedding from segment
joints (a documented Space Shuttle SRB phenomenon) are the solid-motor versions
of the coupling mechanisms in §3.10.

---

## 4. Typical engineering ranges

| quantity | typical | range | who sits at the extremes |
|---|---|---|---|
| Chug frequency | 100–400 Hz | 10–500 Hz | small thrusters high; large chambers low |
| Buzz / intermediate | 300–700 Hz | 200–1000 Hz | manifold-dominated cases |
| 1T frequency, kerosene booster | 500–900 Hz | 400–1500 Hz | F-1 lowest (largest $D_c$) |
| 1T frequency, LOX/LH₂ | 1500–3000 Hz | 1000–4000 Hz | RS-25 ≈ 2 kHz [A] |
| 1T frequency, small storable thruster | 5–15 kHz | 3–20 kHz | R-4D-class highest |
| POGO / structural mode | 5–25 Hz | 3–60 Hz | drops through a burn as tanks empty |
| "Rough combustion" threshold | 5 % of $p_c$ pk-pk | 2–10 % | programme-specific |
| Developed instability amplitude | 20–50 % of $p_c$ pk-pk | 10–100 %+ | limit cycles above 100 % are recorded |
| Heat-flux multiplication when unstable | ×3–5 | ×2–10 | near-face wall worst |
| Injector $\Delta p/p_c$ | 0.15–0.25 | 0.10–0.35 | hydrogen circuits at 0.10–0.15 |
| Combustion time lag $\tau$ | 0.8–1.5 ms (RP-1, storable) | 0.2–3 ms | LH₂ 0.2–0.4 ms; large-element RP-1 up to 3 ms |
| Interaction index $n$ | 0.3–1.0 | 0.1–1.5 | fitted, never predicted |
| Chamber fill time $\tau_c$ | 1.0–1.5 ms | 0.7–2.5 ms | tracks $L^*$ exactly (Eq. 3.4) |
| Damping rate required (dynamic stability) | 50–150 s⁻¹ | 30–250 s⁻¹ | F-1: 45 ms ⇒ ≈51 s⁻¹ |
| Damping ratio $\zeta$ of a chamber mode | 0.01–0.05 | 0.005–0.1 | $Q$ of 10–100 |
| Baffle compartments | 3–13 | 3–20 | F-1 at 13 |
| Baffle blade length $L_b$ | 0.1–0.3 $D_c$ | 0.05–0.4 $D_c$ | set by test |
| Baffle $\eta_{c^*}$ penalty | 0.5–2 % | 0–3 % | [E] |
| Acoustic cavity depth | 20–80 mm | 10–200 mm | scales as $c_{cav}/4f$ |
| Cavity open-area fraction of face | 2–8 % | 1–15 % | [E], [SP-8113] |
| POGO accumulator gas volume | 1–20 L | 0.5–50 L | scales with line inertance |

---

## 5. Worked examples

Throughout, the **reference chamber** is: LOX/RP-1, $\gamma = 1.20$,
$M = 22.86$ kg/kmol ($R = 363.7$ J/(kg·K)), $T_c = 3300$ K, so
$c = \sqrt{\gamma R T_c} = 1200$ m/s and $c^* = \sqrt{RT_c}/\Gamma = 1689$ m/s
with $\Gamma(1.20) = 0.6485$. Geometry: $D_c = 0.500$ m, $L_{cyl} = 0.500$ m,
$\varepsilon_c = 1.9$ so $A_c = 0.1963$ m², $A_t = 0.10334$ m²,
$D_t = 0.3627$ m. Operating: $p_c = 100$ bar, $L^* = 1.05$ m,
$\dot m = p_cA_t/c^* = 612$ kg/s. These are registered in
`tools/examples/15.py`.

### WE1 — Acoustic mode frequencies, and which instrument sees which mode

**Given.** The reference chamber. **Find** the 1L, 1T, 2T, 1R and 1T1L mode
frequencies, and say what a chamber-mounted lateral accelerometer would show.

**Step 1 — sound speed.** $R = R_u/M = 8314.46/22.86 = 363.7$ J/(kg·K);
$c = \sqrt{1.20 \times 363.7 \times 3300} = \sqrt{1.4400\times10^6} =
\mathbf{1200\ m/s}$.

**Step 2 — longitudinal.** $f_{1L} = c/(2L_{cyl}) = 1200/(2\times0.500) =
\mathbf{1200\ Hz}$. ($f_{2L} = 2400$ Hz.)

**Step 3 — transverse.** $\pi D_c = \pi\times0.500 = 1.5708$ m, so
$f_{mn0} = \alpha_{mn}\times 1200/1.5708 = 763.9\,\alpha_{mn}$:

| mode | $\alpha_{mn}$ | $f$ (Hz) |
|---|---|---|
| 1T | 1.8412 | **1407** |
| 2T | 3.0542 | **2333** |
| 3T | 4.2012 | 3209 |
| 1R | 3.8317 | **2927** |
| 1T1R | 5.3314 | 4073 |

**Step 4 — combined 1T1L.** $f = \sqrt{1407^2 + 1200^2} = \sqrt{1.980\times10^6
+ 1.440\times10^6} = \mathbf{1849\ Hz}$.

**Step 5 — what sees what.** A mode exerts a net force on the chamber only if
its pressure distribution has a net resultant.

- **1T ($m=1$):** pressure is high on one side and low on the other, so the
  integrated wall pressure has a **net lateral force** at 1407 Hz. A lateral
  accelerometer on the chamber sees it clearly, and two diametrically opposite
  dynamic-pressure transducers read **180° out of phase**. This is the mode you
  detect from outside the engine.
- **2T ($m=2$):** four alternating lobes; the net lateral force cancels. A
  lateral accelerometer sees little, but the *shell* is being ovalised at 2333
  Hz, so a strain gauge or an accelerometer sensitive to the shell's ovalising
  mode may pick it up. Transducers 90° apart read 180° out of phase.
- **1R ($m=0$):** axisymmetric. No lateral force at all; it appears as a
  **hoop-strain and axial** signal, and all circumferential transducers read
  **in phase**.
- **1L:** axisymmetric, produces an axial thrust oscillation — visible on the
  thrust-mount load cell if the mount's own response reaches 1200 Hz (it usually
  does not) and on axial accelerometers.

> **Sanity check.** $f_{1T}/f_{1L} = 1407/1200 = 1.17$ for a chamber whose length
> equals its diameter, and 1T sits above 1L only because $\alpha_{11}/\pi =
> 0.586$ against $0.5$ for the longitudinal mode. In any chamber longer than
> $0.586\,D_c$ — i.e. essentially all of them — the **1L mode is the lowest
> acoustic mode**, and yet 1T is the one that destroys engines. That is the
> Rayleigh criterion talking: the nozzle damps 1L heavily and 1T hardly at all.

### WE2 — Chug stability for two injector pressure drops

**Given.** The reference chamber; combustion time lag $\tau = 1.2$ ms (LOX/RP-1
with moderately coarse elements). Two candidate designs: $\Delta p_{inj}/p_c =
0.15$ (15 bar) and $0.25$ (25 bar). **Find** whether each chugs, at what
frequency, and how fast the mode grows or decays.

**Step 1 — chamber fill time.** Eq. 3.4:

$$\tau_c = \frac{L^*}{\Gamma^2 c^*} = \frac{1.05}{(0.6485)^2 \times 1689.3} = \frac{1.05}{710.5} = \mathbf{1.478\ ms}$$

Cross-check the long way: $\rho_c = p_c/(RT_c) = 10^7/(363.7\times3300) =
8.332$ kg/m³; $V_c = L^*A_t = 1.05\times0.10334 = 0.10851$ m³;
$\tau_c = V_c\rho_c/\dot m = 0.10851\times8.332/611.7 = 1.478$ ms. ✓

**Step 2 — neutral-stability point.** Solve $\omega\tau + \arctan(\omega\tau_c) =
\pi$ with $\tau = 1.2$ ms, $\tau_c = 1.478$ ms. Iterating: $\omega = 1636$ rad/s.
Check: $\omega\tau = 1.963$; $\arctan(1636\times1.478\times10^{-3}) =
\arctan(2.418) = 1.179$; sum $= 3.142 = \pi$ ✓. So $f_{neutral} =
1636/2\pi = 260$ Hz, and

$$k_{crit} = \sqrt{1+(\omega\tau_c)^2} = \sqrt{1+2.418^2} = \sqrt{6.847} = 2.616$$

$$\left(\frac{\Delta p_{inj}}{p_c}\right)_{min} = \frac{1}{2k_{crit}} = \frac{1}{5.232} = \mathbf{19.1\ \%}$$

**Step 3 — evaluate the two designs.**

| design | $k = p_c/(2\Delta p)$ | vs $k_{crit} = 2.616$ | verdict |
|---|---|---|---|
| $\Delta p/p_c = 0.15$ | 3.333 | **exceeds** | unstable |
| $\Delta p/p_c = 0.25$ | 2.000 | below by 24 % | stable |

**Step 4 — growth and decay rates.** Solve $\tau_c s + 1 + k e^{-s\tau} = 0$ for
the complex root (Newton iteration from $s = i\,2\pi\times260$):

| design | $s$ (s⁻¹) | $f = \Im(s)/2\pi$ | interpretation |
|---|---|---|---|
| 0.15 | $+151.4 + 1688.9i$ | **269 Hz** | grows; amplitude doubles in $\ln2/151.4 = \mathbf{4.6\ ms}$ |
| 0.20 | $-28.2 + 1625.3i$ | 259 Hz | marginal; decays to 10 % in 82 ms — fails a 45 ms criterion |
| 0.25 | $-166.1 + 1570.9i$ | **250 Hz** | decays to 10 % in $\ln10/166.1 = \mathbf{13.9\ ms}$ |

**Step 5 — read the result as a designer.** The 15 % design does not merely fail;
it doubles in 4.6 ms, so a startup transient reaches limit-cycle amplitude within
about 30 ms of ignition — before the engine reaches mainstage. The 20 % design
is *linearly* stable but takes 82 ms to damp, which would fail an F-1-class 45 ms
dynamic-stability requirement. **Only the 25 % design meets both.** This is the
quantitative content of "20 % is a floor, not a target".

> **Sanity check.** 250–270 Hz is squarely in the observed chug band. And the
> criterion reproduces the textbook 15–25 % rule from two parameters: sweeping
> $\tau$ from 0.8 to 1.5 ms gives thresholds of 14.0 %, 16.7 %, 19.1 % and
> 22.3 % — the whole published range of the rule of thumb generated by the whole
> plausible range of $\tau$.

### WE3 — Quarter-wave cavity for the 1T mode, with hot cavity gas

**Given.** Suppress the reference chamber's 1T mode at $f_{1T} = 1407$ Hz with
quarter-wave cavities around the injector periphery. Cavity gas is a fuel-purged
mixture; take $\gamma_{cav} = 1.25$, $R = 363.7$ J/(kg·K), and consider
$T_{cav} = 1200$ K as the design assumption. Aperture slots 8 mm wide.

**Step 1 — cavity sound speed.**
$c_{cav} = \sqrt{1.25 \times 363.7 \times 1200} = \sqrt{5.456\times10^5} =
\mathbf{738.6\ m/s}$ — 38 % below the chamber's 1200 m/s, purely because of
temperature.

**Step 2 — depth.**

$$L_{eff} = \frac{c_{cav}}{4f_{1T}} = \frac{738.6}{4\times1406.6} = 0.1313\ \mathrm{m} = \mathbf{131\ mm}$$

Subtract the end correction, $\Delta L \approx 0.4 \times 8\ \mathrm{mm} = 3.2$
mm: **geometric depth ≈ 128 mm.**

**Step 3 — the temperature sensitivity, which is the point of the example.**

| assumed $T_{cav}$ | $c_{cav}$ (m/s) | required depth (mm) |
|---|---|---|
| 800 K (heavy purge) | 615 | 109 |
| 1200 K (design) | 739 | 131 |
| 1800 K (light purge) | 894 | 159 |
| 3300 K (no purge, chamber gas) | 1200 | 213 |

If you build the 131 mm cavity and it actually runs at 1800 K, its resonance
moves to $c/(4L) = 894/(4\times0.1313) = \mathbf{1702\ Hz}$ — **21 % high**, and
it is no longer absorbing at 1407 Hz to any useful degree unless its $Q$ is below
about 5. Conversely a design that assumed chamber-temperature gas would be 62 %
too deep.

**Step 4 — the Helmholtz alternative.** For a compact resonator, Eq. 3.14 with
six 8 mm-diameter necks ($A_n = 3.016\times10^{-4}$ m²), neck length 20 mm plus
end corrections ($L_{eff} = 23.2$ mm) and the same 739 m/s:

$$V = \frac{A_n c_{cav}^2}{(2\pi f)^2 L_{eff}} = \frac{3.016\times10^{-4}\times 5.456\times10^5}{(8838)^2 \times 0.0232} = 9.1\times10^{-5}\ \mathrm{m^3} = \mathbf{91\ cm^3}$$

A 91 cm³ cavity is far more compact than a 131 mm-deep tube, which is why
injector-face resonators are usually Helmholtz-type. It is also *more* sensitive
to neck geometry and to erosion of the necks.

**Step 5 — the design response.** Because $T_{cav}$ is uncertain by ±40 % and
$f \propto \sqrt{T_{cav}}$, tuning uncertainty is ±18 %. Practice: make three or
four cavity depths spanning ±20 % around the target, accept lower peak
absorption, and get a usable band. Verify by cold-flow acoustic testing of the
injector with a driver, then confirm on the hot-fire bomb test.

> **Sanity check.** 100–150 mm of cavity depth for a 1.4 kHz mode is exactly the
> scale of real hardware, and it explains the design split of §3.13: the RS-25's
> ≈2 kHz 1T needs ~90 mm at 1200 K, which fits in an injector; the F-1's ≈500 Hz
> 1T would need **370 mm**, which does not. F-1 got baffles.

### WE4 — Choosing a baffle compartment count

**Given.** The reference chamber has an unbaffled $f_{1T} = 1407$ Hz. The
combustion response (from $|R| = 2n|\sin(\omega\tau/2)|$ with $\tau = 1.2$ ms)
peaks at $f = 1/(2\tau) = 417$ Hz and stays strong up to about 2 kHz, falling off
above. **Requirement:** move the lowest transverse mode above **3000 Hz**, where
the measured response is small and the nozzle and viscous damping are larger.

**Step 1 — what eigenvalue is needed.** From Eq. 3.12,

$$\alpha_{\nu,1} \ge \frac{\pi D_c f_{target}}{c} = \frac{1.5708 \times 3000}{1200} = 3.927$$

**Step 2 — read off the compartment count.** Using $\nu = N/2$ and the root
approximation:

| $N$ | $\nu$ | $\alpha_{\nu,1}$ | $f$ (Hz) | meets 3000 Hz? |
|---|---|---|---|---|
| 4 | 2.0 | 3.054 | 2333 | no |
| 5 | 2.5 | 3.632 | 2775 | no |
| **6** | **3.0** | **4.201** | **3209** | **yes** |
| 8 | 4.0 | 5.318 | 4062 | yes, with margin |

**Choose $N = 6$**: six radial blades, lowest transverse mode 3209 Hz, a factor
2.28 above the unbaffled 1T.

**Step 3 — blade length.** The blades must cover the region where the mode is
driven. Take the heat-release zone to extend roughly one vaporization length from
the face; with injection velocity ~30 m/s and $\tau = 1.2$ ms that is ~36 mm for
the *first* heat release, and the bulk of it is complete by 2–3 times that. Design
guidance of $L_b = 0.1$–$0.3\,D_c$ gives **50–150 mm**; take $L_b = 100$ mm
(0.2 $D_c$) and expect it to be adjusted by test **[J]**.

**Step 4 — count the cost.** Six blades 100 mm long across a 500 mm face is
roughly $6 \times 0.100 \times 0.250 \times 2$ faces $= 0.30$ m² of additional
hot surface to cool, in the highest-flux region of the engine. The blades occupy
about 1.5 % of the barrel volume, disturb the pattern in perhaps 10 % of the face
area, and should be budgeted at **1–2 % of $\eta_{c^*}$** [E].

**Step 5 — sanity-check against the F-1.** Thirteen compartments corresponds to
$\nu = 6.5$, $\alpha \approx 8.04$, a factor **4.37** above 1T. Applied to the
F-1's own geometry ($D_c \approx 1.13$ m, near-face $c \approx 900$ m/s giving an
unbaffled 1T near 467 Hz), the baffled compartment's lowest transverse mode is
$8.04\times900/(\pi\times1.13) = \mathbf{2040\ Hz}$ — an octave and a half above
the mode that was destroying engines, and above the band where the F-1's coarse
sprays responded strongly. Thirteen compartments looks like overkill until you
notice that the F-1 team had already been beaten by 3-, 5- and 7-compartment
designs.

> **Sanity check.** The scaling $\alpha_{N/2,1}\approx N/2$ for large $N$ means
> **frequency ratio ≈ $N/(2\times1.8412) = N/3.68$** — a quick mental rule: a
> 4-compartment baffle buys you a factor of about 1.1 per compartment above
> three. Doubling compartments does not double the frequency, which is why
> baffle counts saturate around 10–15 and other measures take over.

---

## 6. Real engines — why did they design it that way?

### 6.1 F-1 (Rocketdyne, 1959–1973) — the programme that defined the discipline

**The choice.** A flat-face impinging injector with a mixed doublet-and-triplet
pattern, in the final **"5U(f)"** configuration, with a **copper baffle assembly
dividing the face into 13 compartments**, fuel-cooled, and a qualification
requirement of recovery from a bomb detonated near the injector centre at full
thrust within **45 ms** [_verify-liquid, F-1 block][OY93].

**Why the F-1 had the problem at all.** Three factors compounded, and every one of
them is a scaling argument from this module.

1. **The chamber is enormous, so the modes are low.** $D_c \approx 1.1$ m puts
   $f_{1T}$ at 450–700 Hz depending on where in the chamber you evaluate the
   sound speed (§3.8). That is the low end of the acoustic band and the *high*
   end of where coarse kerosene sprays respond.
2. **The elements are large, so $\tau$ is long and the sprays are coarse.**
   2,577 kg/s through a face about a metre across means large orifices and
   correspondingly coarse drops (Module 06 §6.3, Module 07). Response peaks near
   $f = 1/(2\tau)$; with $\tau$ of 1–2 ms that is 250–500 Hz. **The chamber's 1T
   frequency and the combustion's response peak were on top of each other.**
   That coincidence, not any single design error, is the F-1 story.
3. **Like-on-like and unlike doublets with large orifices flap slowly** (§3.10),
   putting a hydrodynamic element frequency in the same band.

**What they did about it: 1962–1965.** The verification file records roughly
**2,000 tests across 210 injector designs, 15 baffle designs and 14 injector
configurations** in a concentrated effort between 1962 and 1964
[_verify-liquid, F-1 block] — the effort recorded there as "Project Go" and
generally referred to in the Apollo literature as "Project First"; the naming is
not consistent across sources and the course does not resolve it. [OY93] is the
definitive technical account. What matters is the *method*, because it is the
method that survived:

- **Instrument everything, at bandwidth.** High-frequency dynamic-pressure
  transducers in the chamber wall at several azimuths, plus accelerometers, at
  sample rates that resolve the modes. Without phase between azimuthally spaced
  transducers you cannot tell a 1T from a 1L, and much early testing was wasted
  because of it.
- **Force the instability rather than wait for it.** The bomb turned a
  statistical question ("will it go unstable in service?") into a deterministic
  one ("does it recover in 45 ms?").
- **Iterate the pattern *and* the baffle together.** The 13-compartment baffle
  was arrived at by testing progressively more compartments; each increment
  raised the lowest supportable transverse frequency (§3.13, WE4), and they
  stopped when recovery times met the criterion with margin.
- **Accept the performance loss.** The final pattern was a deliberately detuned,
  compromised performer. Rocketdyne traded $c^*$ efficiency for stability
  knowingly.

**Alternatives available in 1962.** Acoustic cavities were understood in
principle but a cavity for a 500 Hz mode needs ~370 mm of depth (WE3) — not
available in an injector. Smaller elements in much greater number would have
raised the response frequency but were a manufacturing reach for a 1 m face in
1962. Multiple smaller chambers — the Soviet answer — was rejected early as a
vehicle-integration and plumbing problem. Given the constraints, **baffles were
the only tool of the right size.**

**Would a modern engineer do the same?** They would run a Helmholtz solver and an
LES campaign first, they would take the element size down, and they would
seriously consider a pintle. They would still baffle it, and they would still
bomb-test it. Nothing has replaced the bomb.

### 6.2 RS-25 (Rocketdyne, 1972–present) — cavities, not baffles

**The choice.** Coaxial shear injector, 600 main elements, an augmented spark
igniter at the centre, and **acoustic-resonator cavities in the injector face**
— and no baffles [_verify-liquid, RS-25 block].

**Why.** Hydrogen moves the whole problem up in frequency. The RS-25's 1T sits
near 2 kHz (§3.8), where (i) an absorber of practical depth (~90 mm at 1200 K) is
tunable, (ii) the spray response of a hydrogen shear element is weaker than a
coarse kerosene spray's, and (iii) baffles would sit in a 206 bar hydrogen-oxygen
environment with a wall heat flux that makes cooling them a genuine problem. Add
that the main injector is also the exit of two fuel-rich preburners — the RS-25's
main injector receives hot hydrogen-rich gas, not liquid, on the fuel side, which
changes the response entirely.

**What it did not fix.** The RS-25's development instability problems were
substantially *LOX post* problems — slender posts in a high-velocity crossflow,
failing by high-cycle fatigue — and preburner and turbopump dynamics, not classic
1T screech [Biggs89]. That is an instructive distinction: at high chamber
pressure with hydrogen, the dominant unsteady-flow failure mode moves from
"the chamber sings" to "a component fatigues in a high-frequency flow field."
The fix was structural (post design, shields), not acoustic.

**Would a modern engineer do the same?** Yes — and they do: face-mounted
resonators are standard on modern hydrogen engines. The design lesson to carry is
that the choice between baffle and cavity is decided by the mode frequency and
the available depth, not by preference.

### 6.3 Titan LR87 / LR91 (Aerojet, 1955–2005) — baffles on a storable

**The choice.** Unlike-impinging doublets on hypergolic N₂O₄/Aerozine 50, with
**baffled injectors** on both stages [_verify-liquid, LR87 and LR91 blocks].

**Why.** Hypergolic propellants ignite on contact, which removes the ignition
problem and does *nothing* for stability — arguably it makes stability harder,
because the reaction begins in the liquid phase very close to the face, which is
precisely where the transverse modes have their pressure antinode. Unlike
doublets also couple mixture ratio directly to transverse velocity (§3.10). Both
stages needed baffles, and the Titan family carried them unchanged for forty
years.

**The cautionary case in the same propellant family** is the Apollo **Lunar
Module Ascent Engine**: Bell could not solve its combustion instability, and the
flight injector was supplied by Rocketdyne [_verify-liquid, APS block]. An engine
with no igniter, no pumps, no gimbal, no redundancy and one job still needed a
second contractor's injector to be stable. **Hypergolic does not mean stable.**

### 6.4 RD-170 family and Soviet practice (Glushko, 1976 onward) — solve it with geometry

**The choice.** Oxidizer-rich staged combustion with **four combustion chambers
fed by a single turbopump** (RD-170/171), two chambers (RD-180), one chamber
(RD-191), all using **coaxial swirl** injection [_verify-liquid].

**Why this is a stability architecture as much as a packaging one [J].** The
RD-170 delivers 7.25 MN sea level — more than the F-1 — but no chamber in it is
larger than an RD-191's. Four smaller chambers means four *smaller diameters*
means transverse mode frequencies roughly $\sqrt{4} = 2$ times higher than a
single chamber of the same total area would have, moving them away from the
response peak. Combine that with swirl elements, whose sheet breakup is
comparatively insensitive to imposed transverse gas velocity (§3.11), and the
architecture attacks the problem from both sides — geometry and element type.
It is the mirror image of the American approach, which took the single big
chamber and fixed it with hardware.

**The costs are real and the file states them:** four chambers where one would be
preferable, enormous complexity, and a single turbopump failure loses all thrust.
The comparison is a genuinely open engineering argument, not a settled one.
Western practice went to the single large chamber and paid for it in development;
Soviet practice avoided the development cost and paid for it in parts count and
mass for the life of the programme.

### 6.5 LMDE and Merlin (TRW 1964, SpaceX 2011) — one element

**The choice.** A single central pintle element: LMDE with a **variable-area**
pintle for 10:1 throttling, Merlin 1D with a fixed-geometry pintle
[_verify-liquid][Dressler00].

**Why it is stable [J].** Everything in §3.10 that makes a multi-element face
dangerous requires *elements*: element-to-element phasing, a periodic pattern for
a tangential mode to lock onto, spray fans with a hydrodynamic frequency. A
pintle has one element, a radial sheet that intersects an axial flow well away
from the face, and heat release distributed over a large volume near the wall.
TRW's own account is that pintle engines were fired across a wide range of sizes
and propellants without encountering high-frequency instability and without
stabilisation devices. It is vendor testimony backed by a long service record —
strong evidence, weak theory.

**What it does not fix.** Chug. The LMDE ran 110 psia at full thrust and
**11 psia at 10 %** — a 10:1 chamber-pressure turndown — and holding
$\Delta p_{inj}/p_c$ across that range is exactly why the pintle had to be
variable-area (Module 07 §3.10, [Casiano10]). The Merlin's throttle range is
narrower for the same reason.

**Would a modern engineer choose it?** For a throttling lander or a
cost-and-cadence-driven booster, yes, and SpaceX did. For a large hydrogen
staged-combustion engine, no — the pintle's mixing is not competitive with a
coaxial face at high $\eta_{c^*}$ requirements.

### 6.6 Raptor (SpaceX, 2016–present) — claims

**The claim.** Coaxial swirl injection from Raptor 2 onward, at 300–330 bar,
with SpaceX reporting stable operation across the throttle range
[_verify-liquid, Raptor block; all figures are company claims].

**What can be said.** The element choice is consistent with the Soviet/Russian
practice that has the best public stability record for hydrocarbon
staged-combustion engines, and methane's vaporization behaviour at 300 bar is
supercritical — no droplets, a mixing-controlled response, which shifts the
problem toward higher frequency and away from the classical spray-response
mechanisms. The chamber is small (Raptor's thrust per chamber is a third of the
F-1's at four times the pressure), so its transverse modes are high.

**What cannot be said.** There is no public PSD, no published bomb-test result,
no damping rate, no mode identification. Treat "Raptor is stable" as a claim,
plausible on mechanism, unverified in data. This is the course's standard
position on Raptor and it applies with particular force here, because stability
is exactly the kind of property a programme discovers late and does not announce.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The standing trade-offs

| move | helps | hurts |
|---|---|---|
| ↑ $\Delta p_{inj}$ | chug margin (quadratically in $k$), shorter $\tau$ | pump power, turbine flow, $\eta$ of the cycle; nothing for screech |
| ↑ $L^*$ | chug margin (bigger $\tau_c$) | mass, cooled area, $L^*$ instability, *lowers* nothing in the acoustic band |
| ↑ $\varepsilon_c$ (bigger $D_c$) | Rayleigh loss, wall flux, face area | **lowers all transverse mode frequencies** toward the response peak |
| finer atomization | $\eta_{c^*}$, shorter chamber | *raises* combustion response and *reduces* droplet damping — a double stability penalty |
| baffles | kills 1T outright | cooling, $\eta_{c^*}$, mass, a new failure mode |
| acoustic cavities | tunable damping, no pattern disturbance | face volume, purge flow, tuning uncertainty, only works in a band |
| pintle / swirl elements | inherent high-frequency margin | mixing performance, and for pintles a hard throttling-vs-chug coupling |
| smaller multiple chambers | raises all transverse frequencies | parts count, mass, plumbing, common-mode turbopump risk |

The single most important structural fact is in row 4: **the things that make an
injector perform well make it less stable.** Every stability fix in §3.13 is
buying back margin that performance optimisation spent.

### 7.2 Failure modes

**Wall burn-through under a transverse mode.**
*Mechanism:* the acoustic transverse velocity ($u' = p'/\rho c$, of order
100 m/s at 10 % amplitude) destroys the thermal boundary layer and strips film
cooling; gas-side heat flux multiplies by 2–10.
*Symptom:* a longitudinal streak or a circumferential band of erosion,
melted-through channel or tube walls, coolant into the chamber, immediate
$p_c$ loss.
*Evidence:* the damage is *azimuthally patterned* — two opposite stripes for a
standing 1T, a uniform band for a spinning 1T or a radial mode. Undamaged
hardware between the stripes is diagnostic; a uniform overheat is a cooling
failure, not an instability.
*Fix:* stabilise. Adding cooling to survive an instability is not a fix and does
not work.

**Injector-face burnout.**
*Mechanism:* the same scrubbing, applied to the face's own film or transpiration
cooling, plus the recirculation an acoustic field sets up between elements.
*Symptom:* melted face, eroded orifice lands, elements merged into craters,
often worst near the outer row or at a baffle root.
*Evidence:* face damage with an $m$-fold symmetry; the F-1 and LMAE programmes
both saw this.
*Fix:* baffles or cavities; more face cooling as a palliative.

**Baffle blade failure.**
*Mechanism:* thermal fatigue and coolant starvation at the blade tip, which is a
thin copper fin in the highest-flux region.
*Symptom:* a missing or eroded blade found post-test; and — the reason it
matters — **the instability returns** once the compartment is opened.
*Evidence:* correlate blade condition with a rise in dynamic-pressure amplitude
during the run.
*Fix:* cool the blades from the fuel circuit, keep the tip thick, accept the
$\eta_{c^*}$ penalty.

**LOX post fatigue (coaxial injectors).**
*Mechanism:* slender posts in a transverse acoustic velocity field are
cantilevers in cross-flow; vortex shedding or acoustic excitation near a post
bending mode gives high-cycle fatigue in seconds.
*Symptom:* cracked or liberated posts, downstream damage.
*Evidence:* the RS-25 development history [Biggs89].
*Fix:* structural — shields, post stiffening, tip geometry — not acoustic.

**Pump-side and cavitation coupling.**
*Mechanism:* an inducer's cavitation compliance changes the feed-line dynamics,
coupling to chug or POGO; rotating cavitation adds its own excitation at a
fraction of shaft speed.
*Symptom:* an oscillation whose frequency tracks NPSH or shaft speed rather than
chamber conditions.
*Evidence:* frequency scales with pump rpm — the diagnostic that distinguishes it
from everything else in this module.
*Fix:* NPSH margin, inducer redesign, accumulator ([Brennen-Pumps][SP-8052]).

### 7.3 Materials

Stabilisation hardware lives in the worst thermal environment in the engine.
Baffles are **copper alloys** (the F-1's are copper) for the same reason chamber
liners are: conductivity, not strength — the blade must conduct heat to its
coolant faster than the gas delivers it, and its yield strength at temperature
is almost irrelevant compared with its ability to stay cool (Module 10, 16).
Acoustic cavity walls are part of the injector body — usually a nickel alloy or
stainless — and their failure mode is *erosion of the neck*, which detunes the
resonator progressively over a service life. Additive manufacturing has changed
this area substantially: resonator cavities and internal purge passages that were
impossible to braze are now printed as part of the injector body [Gradl18]
[GradlAM], which makes multi-depth cavity arrays cheap and is one of the few
unambiguous stability wins of the last decade [M].

### 7.4 Manufacturing

Two manufacturing facts drive stability outcomes. First, **element-to-element
dimensional scatter is stabilising**, because it spreads $\tau$ across the face
(§3.13) — a perfectly uniform injector is, other things equal, a more coherent
oscillator than a slightly scattered one. This is not an argument for sloppy
manufacturing (scatter also costs mixture-ratio uniformity and therefore
$\eta_{c^*}$ and wall compatibility), but it is a real effect and it is why
"we tightened the tolerances and it went unstable" is a story that has actually
happened **[J]**. Second, baffles and their coolant passages are among the
hardest features to braze or weld into an injector face, and a baffle
retrofitted late is expensive in a way that a designed-in one is not — which is
an argument for building the first injector with baffle *provisions* even if the
first design omits them.

### 7.5 Testing

**What is measured.**

- **High-frequency dynamic pressure** — piezoelectric transducers, flush or
  recess-mounted through cooled adapters, in the chamber wall at **at least three
  azimuths** and preferably at two axial stations. Bandwidth to at least 3× the
  highest mode of interest; 20–50 kHz sampling is normal.
- **Static $p_c$** on a conventional low-frequency transducer. This is the trap:
  it is heavily damped and pneumatically low-passed, and a chamber in a 30 %
  limit cycle can show only a few percent DC shift on the static gauge. **Never
  clear a chamber for stability on static instrumentation.**
- **Accelerometers** on the chamber, injector dome and thrust structure — they
  see 1T well, 2T and 1R poorly (WE1).
- **Feed-line dynamic pressure** upstream and downstream of the pump, to separate
  chamber-driven from feed-driven oscillation.

**What the data looks like when it is wrong.**

- **PSD:** a discrete, narrow peak rising 20–40 dB above the broadband
  combustion-noise floor, at a frequency that matches a computed mode. Broadband
  roughness is a raised floor with no peak — a different problem.
- **Phase between azimuthal transducers:** 180° at diametrically opposite ports →
  standing 1T; a linear ramp with azimuth → spinning 1T; in-phase everywhere →
  a radial or longitudinal mode.
- **Frequency behaviour with operating point:** an acoustic mode scales with
  $\sqrt{T_c}$, so it moves modestly with mixture ratio and barely at all with
  $p_c$. Chug moves strongly with $\Delta p_{inj}$ and $p_c$. An entropy mode
  moves with chamber length over gas velocity. A pump-coupled mode tracks shaft
  speed. **Frequency-versus-operating-point is the most powerful diagnostic you
  have** and it costs nothing but a throttle sweep.
- **The trap:** $c^*$ efficiency often *rises* during an instability, because the
  oscillation mixes violently. A performance improvement accompanied by a new
  discrete tone is not good news.

**Bomb and pulse-gun procedure at the level this course covers:** disturb at
steady state, at more than one operating point and more than one location,
record the band-pass-filtered envelope of the dynamic pressure, fit an
exponential to it, and report the damping rate against the requirement
(Eq. 3.15). Repeat enough times to have a statistic. Details of charge design and
handling are outside this course's scope boundary.

---

## 8. Misconceptions and what engineers actually care about

**"Instability means the engine is burning badly."** No — an unstable engine is
frequently burning *better*, in the sense of higher $c^*$ efficiency, because a
violent oscillation is a superb mixer. Instability is about the *phase* of heat
release relative to pressure, not about the amount.

**"A high injector pressure drop fixes combustion instability."** It fixes
*chug*. It does essentially nothing for high-frequency transverse modes, which
are driven by the atomization and mixing response to acoustic pressure and
velocity in the chamber, not by feed-system coupling. Programmes have lost months
raising $\Delta p$ against a screech problem.

**"Bigger chambers are safer because they have more damping."** Bigger chambers
have *lower* transverse mode frequencies, which moves them toward the combustion
response peak, and a lower surface-to-volume ratio, which reduces boundary-layer
damping. Instability is a big-engine problem.

**"Hypergolic propellants are stable because they ignite instantly."** Instant
ignition puts the heat release right at the injector face — a pressure antinode
for every mode. The Titan engines and the LM ascent engine all needed
stabilisation work.

**"If the static chamber-pressure trace is smooth, the engine is stable."** The
static transducer is low-passed by its sense line and its own dynamics. A 25 %
peak-to-peak 2 kHz oscillation can look like a 2 % ripple on it. This
misconception has destroyed hardware.

**"The $n$–$\tau$ model predicts instability."** It predicts whether a mode is
linearly driven, given $n$ and $\tau$ that were fitted to test data from a
similar engine. It says nothing about limit-cycle amplitude, nothing about the
threshold for a nonlinearly unstable chamber, and it contains no velocity
coupling. It is a framework for organising data, not a design tool you can trust
unsupervised.

**"Baffles absorb acoustic energy."** Mostly they don't. They change the
boundary conditions so that the dangerous low-order transverse modes cannot exist
in the region where they would be driven. Absorption at the blade edges is a
second-order bonus.

**"An engine that ran 500 seconds without incident is stable."** It is stable to
whatever disturbances happened to occur. Nonlinear instability requires a finite
trigger; the trigger in service may be a start transient, a throttle step, or a
piece of debris. This is why dynamic stability is *rated*, not observed.

### What engineers actually care about

1. **Where are my modes, and where is my combustion response?** The distance
   between the 1T frequency and $1/(2\tau)$ is the single number that predicts
   trouble, and both ends of it are estimable before hardware exists.
2. **What is my damping rate after a pulse, in milliseconds?** This is the number
   in the requirement, the number in the test report, and the number a programme
   manager can act on. Everything else is a means to it.
3. **How much $\Delta p_{inj}$ margin do I have at the *worst* operating point?**
   Not at nominal — at minimum throttle, at off-nominal mixture ratio, at the
   coldest propellant temperature.
4. **What does my dynamic-pressure PSD look like across the whole operating box?**
   Trend it. A tone that appears at one corner of the box at 3 % amplitude is a
   tone that will be at 30 % somewhere you have not tested.
5. **What is the earliest point at which I could still add baffles or
   resonators?** Because the answer determines whether an instability found in
   development is a six-month problem or a two-year one.

---

## 9. Mastery levels

**Level 1 — Familiarity.** Explain in plain language why heat release in phase
with pressure drives an oscillation. Name the three frequency bands, their
approximate ranges, and one fix for each. State that $f_{1T} \propto c/D_c$ and
that bigger chambers have lower modes. Name two engines whose stability solution
you can describe in a sentence (F-1 baffles, RS-25 cavities).

**Level 2 — Working engineering knowledge.** Compute the 1L, 1T, 2T and 1R
frequencies of a given chamber from the Bessel-root table and $c=\sqrt{\gamma R
T_c}$. Derive $\tau_c = L^*/(\Gamma^2 c^*)$ and evaluate the chug criterion for a
given $\tau$ and $\Delta p/p_c$, including whether a marginal case meets a stated
damping-rate requirement. Size a quarter-wave cavity including the cavity gas
temperature effect, and choose a baffle count for a target frequency. State the
$n$–$\tau$ response function and where it peaks. Read a PSD and an
azimuthal-phase plot and identify the mode. Quote typical ranges for $\tau$, $n$,
$\Delta p/p_c$, amplitude thresholds and damping rates from memory.

**Level 3 — Interview mastery.** Given an unfamiliar engine's geometry,
propellant and a described anomaly, produce a ranked hypothesis list with the
frequency estimates that justify the ranking, say what measurement would
discriminate between the top two, and propose fixes with their costs in
performance, mass and schedule. Argue both sides of baffles versus cavities for a
specific engine and say what decides it. Explain why the F-1's problem was a
coincidence of two frequencies rather than a design error, and why the Soviet
multi-chamber architecture attacks the same problem differently. State honestly
what modern CFD can and cannot predict, and defend why the bomb test survives.

---

## 10. Problems

### Conceptual

**C1.** An engine shows a 2.4 kHz tone. Two dynamic-pressure transducers 180°
apart on the chamber wall read in phase; a third at 90° reads in phase with both.
A lateral accelerometer on the chamber shows nothing at 2.4 kHz. Which mode is
it, and what does the accelerometer result rule out?

**C2.** Explain, using the Rayleigh criterion, why heat release concentrated near
the injector face is worse for a longitudinal mode than the same heat release
concentrated at mid-chamber. Then explain why the injector face is a bad place
for heat release for a *transverse* mode as well, for a different reason.

**C3.** A colleague proposes fixing a 3 kHz screech by increasing the injector
pressure drop from 18 % to 28 % of $p_c$. State what will actually happen and
why, and what the change will cost.

**C4.** Why does improving atomization (finer drops) hurt stability twice?

**C5.** An engine is linearly stable but nonlinearly unstable. Describe an
experiment that would reveal this and one that would not, and explain why the
distinction determines the entire structure of a stability-rating programme.

**C6.** The $n$–$\tau$ response function has magnitude $2n|\sin(\omega\tau/2)|$.
Explain physically why the response is *zero* at $\omega\tau = 2\pi$, and what
design action that suggests for a chamber whose problematic mode is known.

**C7.** Give three measurements that distinguish an entropy-wave (convective)
oscillation from an acoustic longitudinal mode at the same frequency.

**C8.** Why is a spinning tangential mode often more damaging to a chamber wall
than a standing one of the same amplitude, even though the peak pressure is the
same?

### Calculation

**N1.** A LOX/LH₂ chamber has $D_c = 0.34$ m, $L_{cyl} = 0.28$ m, $T_c = 3500$ K,
$M = 13.0$ kg/kmol, $\gamma = 1.19$. Compute $c$, and the 1L, 1T, 2T, 1R and
1T1L frequencies.

**N2.** For a chamber with $L^* = 0.9$ m, $\gamma = 1.22$ and $c^* = 1780$ m/s,
compute $\tau_c$. Then, for $\tau = 1.0$ ms, find the neutral chug frequency, the
critical gain, and the minimum $\Delta p_{inj}/p_c$.

**N3.** Using the engine of N2 with a design $\Delta p_{inj}/p_c = 0.22$, find
the complex root of $\tau_c s + 1 + k e^{-s\tau} = 0$ nearest the neutral
frequency, and state the time for a disturbance to decay to 10 % of its peak.
Does the engine meet a 30 ms dynamic-stability requirement?

**N4.** A quarter-wave cavity must absorb a 2,050 Hz 1T mode. The cavity gas is
estimated at $T_{cav} = 1400 \pm 400$ K with $\gamma = 1.26$ and
$R = 600$ J/(kg·K) (hydrogen-rich). Compute the design depth and the depths that
would be correct at the two extremes of the temperature estimate. What fractional
tuning error results from the temperature uncertainty?

**N5.** A chamber has $D_c = 0.62$ m and $c = 1150$ m/s. How many baffle
compartments are required to place the lowest transverse mode above 2,600 Hz?
Give the resulting frequency and the ratio to the unbaffled 1T.

**N6.** A vehicle's first longitudinal structural mode is at 9 Hz. A LOX feed
line has $\ell = 18$ m, $A = 0.038$ m², $\rho = 1140$ kg/m³. Compute the line
inertance, and the accumulator gas volume required to place the feed-line
resonance at 3.5 Hz, assuming helium at 4 bar with $n = 1.4$.

**N7.** Using the F-1 figures in `reference/_verify-liquid.md` (thrust, $p_c$,
$\varepsilon$) and Module 06's derived $D_t = 0.891$ m, estimate $f_{1T}$ for
contraction ratios of 1.5 and 1.75 with $c = 1250$ m/s. Then repeat with an
effective near-face sound speed of 900 m/s and comment on the spread.

**N8.** An engine's dynamic-pressure trace after a bomb shows a 1T tone whose
band-passed envelope falls from 42 bar peak to 6.5 bar in 12 ms. Compute the
damping rate, the damping ratio at $f = 1350$ Hz, the quality factor, and the
time to reach 10 % of peak. Does it meet a 45 ms requirement?

### Engineering reasoning

**R1.** A new 1.2 MN LOX/RP-1 engine runs smoothly at 100 % thrust and develops a
480 Hz oscillation at 12 % of $p_c$ when throttled to 65 %. At 65 % the chamber
pressure is 65 bar and the injector $\Delta p$ has fallen from 20 bar to 8.5 bar.
Diagnose it, state the two measurements that would confirm your diagnosis, and
propose a fix with its cost.

**R2.** Two engines of identical thrust and chamber pressure — one LOX/RP-1 with
a 0.95 m chamber, one LOX/LH₂ with a 0.40 m chamber — are both found unstable at
the 1T mode. Explain why the two programmes will end up with different hardware
solutions, and predict what each will be.

**R3.** You are shown a PSD from a hot-fire test: a broadband floor rising
smoothly from 100 Hz to 10 kHz, plus one sharp peak at 1,880 Hz that is 28 dB
above the floor, plus a small peak at 3,760 Hz. A second test at 8 % higher
mixture ratio shows the peaks at 1,915 Hz and 3,830 Hz. What are the peaks, and
what does the frequency shift tell you about the mechanism?

**R4.** An injector is redesigned to raise $\eta_{c^*}$ from 0.955 to 0.975 by
halving the element size and doubling the element count. Argue, using specific
mechanisms from §3.10 and §3.12, what this does to stability, and say what you
would do to protect the programme before the first hot fire.

**R5.** A baffle blade is found half burned away after an otherwise successful
120 s test, and the dynamic-pressure amplitude at 1T rose from 1.5 % to 6 % of
$p_c$ over the last 30 s of the run. Reconstruct the sequence of events and say
what you would change.

### Mini trade study

**T1.** You are the stability lead on a new 1.5 MN LOX/methane booster engine.
Chamber: $D_c = 0.46$ m, $L_{cyl} = 0.42$ m, $p_c = 150$ bar, $T_c = 3550$ K,
$M = 21.5$ kg/kmol, $\gamma = 1.19$. The injector is a 350-element shear coaxial
face. The first hot-fire series produces a 3 %-amplitude tone at the 1T
frequency at nominal conditions and 14 % at the low-mixture-ratio corner of the
operating box, with a post-bomb recovery time of 68 ms against a 40 ms
requirement.

Four options are on the table, with the programme 14 months from first flight:

- **A.** Add a 5-compartment baffle to the existing injector.
- **B.** Add an array of Helmholtz resonators around the injector periphery.
- **C.** Redesign the injector to 600 smaller elements with 25 % higher
  $\Delta p$ and increased LOX-post recess.
- **D.** Increase the contraction ratio by 15 % (a new chamber) to move the 1T
  mode, keeping the injector.

Constraints: no more than 1.5 % $\eta_{c^*}$ loss; no more than 8 months of
schedule; the chamber liner and cooling design is already qualified and
requalifying it costs 6 months; the injector is additively manufactured, so a
new injector build is 10 weeks.

Compute the relevant frequencies for the baseline and for option D. Recommend
one option (or a combination), justify it quantitatively, and state what test
would confirm the fix and what you would do if it failed.

---

## 11. Quiz (100 points)

**Q1 (8).** The first tangential mode of a cylindrical chamber has $f =
\alpha c/(\pi D_c)$. What is $\alpha$, and what mathematical condition defines
it?

**Q2 (8).** Multiple choice. A chamber's transverse modes are found to be 30 %
higher in frequency than predicted. The most likely cause is:
(a) the chamber is shorter than assumed; (b) the assumed chamber temperature was
too low; (c) the injector $\Delta p$ is higher than assumed; (d) the nozzle is
not choked.

**Q3 (12).** For a chamber with $L^* = 1.15$ m, $\gamma = 1.21$, $c^* = 1750$
m/s: compute $\Gamma$, then $\tau_c$. For $\tau = 1.3$ ms compute the neutral
chug frequency and the minimum $\Delta p_{inj}/p_c$.

**Q4 (10).** State the Rayleigh criterion in words and in an integral form, and
say what phase relationship between $p'$ and $q'$ marks the boundary between
driving and damping.

**Q5 (10).** Multiple choice. An engine passes a 60-second hot fire with a smooth
static $p_c$ trace, then fails on its next test with wall burn-through in 80 ms.
The most likely explanation is:
(a) a manufacturing defect in the chamber wall; (b) the engine was nonlinearly
unstable and the second test contained a trigger; (c) the coolant flow rate was
low on the second test; (d) the static transducer failed on the first test.

**Q6 (12).** A 1,650 Hz mode must be absorbed by quarter-wave cavities. The
cavity gas is at 1,100 K with $\gamma = 1.24$, $R = 380$ J/(kg·K). Compute the
sound speed and the required depth. If the cavity actually runs at 1,600 K, to
what frequency is that hardware tuned?

**Q7 (10).** Why does the $n$–$\tau$ response function peak at $\omega\tau =
\pi$? Answer with the physical argument, not the algebra.

**Q8 (10).** A chamber with $D_c = 0.55$ m and $c = 1180$ m/s needs its lowest
transverse mode above 2,800 Hz. How many baffle compartments? Show the eigenvalue
you needed and the compartment count that delivers it.

**Q9 (10).** Name three mechanisms by which an acoustic oscillation modulates the
heat release in a liquid engine, and for each say whether it responds to acoustic
*pressure* or acoustic *velocity*.

**Q10 (10).** An acceptance criterion requires decay to 10 % of the peak
disturbance within 25 ms. Compute the required damping rate. At a mode frequency
of 900 Hz, what damping ratio and quality factor does that correspond to, and is
that a heavily or lightly damped system?

---

## 12. Further reading

- **[SP-194]** Harrje & Reardon, *Liquid Propellant Rocket Combustion
  Instability* — the foundational compendium. Read §2 for mechanisms, §3 for the
  low- and intermediate-frequency analyses, §8 for damping. Free on NTRS. Its
  analysis is linear; read it knowing the nonlinear picture came later.
- **[LRECI]** Yang & Anderson, *Liquid Rocket Engine Combustion Instability* —
  the modern successor. Read the engine case studies first; they make the theory
  legible in a way the analysis chapters do not.
- **[OY93]** Oefelein & Yang, "Comprehensive Review of Liquid-Propellant
  Combustion Instabilities in F-1 Engines" — the single best case study in the
  field, and honest that the fix was achieved by testing rather than theory.
- **[SP-8113]** *Liquid Rocket Engine Combustion Stabilization Devices* — how to
  size baffles and absorbers, what they cost, and the dynamic-stability
  definition. The hardware complement to [SP-194].
- **[CC56]** Crocco & Cheng, *Theory of Combustion Instability in Liquid
  Propellant Rocket Motors* — the origin of $n$ and $\tau$. Read it for the
  structure of the argument and for its own statement of its limits.
- **[SP-8089]** Gill & Nurick, *Liquid Rocket Engine Injectors* — the design
  rules for elements and manifolds that this module treats as given.
- **[Culick68]** Culick's review of unsteady solid-propellant burning — for the
  response-function formalism and, in his later work, the acoustic mode expansion
  that underlies modern stability analysis in both liquid and solid systems.
- **[Biggs89]** "Space Shuttle Main Engine: The First Ten Years" — for what
  high-frequency flow-induced failures actually look like on a real programme
  when they are structural rather than acoustic.
- **[Dressler00]** TRW pintle engine heritage — the open-literature basis for the
  pintle stability claim. Vendor testimony; read it as such.
- **[Casiano10]** Throttling review — for why $\Delta p/p_c$ collapses under
  throttling and the full catalogue of mitigations.
- **[LRTC]** *Liquid Rocket Thrust Chambers* — for the modern modelling chapters,
  including real-fluid effects at supercritical pressure.
