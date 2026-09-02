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

