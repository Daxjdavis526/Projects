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

