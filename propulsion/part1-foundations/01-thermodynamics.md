# Module 01 — Thermodynamics for Propulsion
Part I · Prerequisites: undergraduate thermodynamics and calculus · Estimated time: 6–8 h

A rocket engine is a thermodynamic machine with almost no moving parts in its
hot section, and that is exactly what makes it dangerous to reason about
casually. There is no piston whose position tells you the state, no shaft whose
torque you can measure, no heat exchanger you can instrument on both sides. You
get a pressure tap on the injector face, a couple of flowmeters upstream, and a
load cell. Everything else — the temperature in the chamber, the composition of
the gas, how much of the chemical energy actually became directed kinetic energy
— is inferred from a thermodynamic model. If the model is wrong, every number
downstream of it is wrong, and it is wrong *silently*. A test engineer who
divides the measured chamber pressure by a hand-computed ideal characteristic
velocity, gets $\eta_{c^*} = 1.01$, and writes it in the report has not
discovered a 101 % efficient combustor; they have discovered that their
reference model was built on the wrong gas assumption, or that the pressure tap
was at the injector end and the model wanted throat stagnation. This module is
about building the model correctly, knowing which of its assumptions is the
weakest at any given station in the engine, and knowing what each assumption
costs you in seconds of specific impulse when it breaks.

---

## 1. Learning objectives

After this module you can:

1. Write the integral control-volume statements of mass, momentum and energy
   conservation for a steady-flow rocket engine, and identify the term in the
   momentum equation that becomes thrust.
2. Derive the steady-flow energy equation from the first law and use it to show
   that stagnation enthalpy is constant through an adiabatic nozzle, with or
   without friction.
3. Compute stagnation temperature, pressure and enthalpy at any station given
   static properties and Mach number, and state precisely which of the three is
   conserved under which conditions.
4. Explain what a chamber-pressure measurement physically is, compute the
   injector-face to throat-stagnation pressure drop for a given contraction
   ratio, and correct a published $p_c$ between the two conventions.
5. Quantify entropy generation from a stagnation-pressure loss and convert it
   into lost exhaust velocity and lost specific impulse.
6. Select between calorically perfect, thermally perfect and real-gas models for
   a given station in the engine (tank, pump inlet, chamber, nozzle exit) and
   estimate the error of the simpler choice.
7. Compute the molar mass, gas constant, specific heat and $\gamma$ of a
   combustion-product mixture from its mole fractions.
8. Set up and solve an adiabatic-flame-temperature energy balance for a
   simplified reaction, and explain quantitatively why the answer exceeds the
   equilibrium value.
9. Explain, using $K_p$ and Le Chatelier's principle, why the degree of
   dissociation falls roughly as $p^{-1/3}$ and therefore why chamber
   temperature saturates with chamber pressure.
10. Estimate the specific-impulse difference between frozen and shifting-
    equilibrium nozzle flow, and state which real engines sit near which limit.
11. Compute $\eta_{c^*}$ from test data and list the three distinct physical
    losses it silently lumps together.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| area | $A$ | m² | flow cross-sectional area |
| throat area | $A_t$ | m² | minimum area of the nozzle |
| speed of sound | $a$ | m/s | $\sqrt{\gamma R T}$ for a calorically perfect gas |
| effective exhaust velocity | $c$ | m/s | $F/\dot m$; equals $c^* C_F$ |
| characteristic velocity | $c^*$ | m/s | $p_{0}A_t/\dot m$; a combustor figure of merit |
| specific heat at constant pressure | $c_p$ | J/(kg·K) | $(\partial h/\partial T)_p$ |
| specific heat at constant volume | $c_v$ | J/(kg·K) | $(\partial u/\partial T)_v$ |
| molar specific heat | $\bar c_{p,i}$ | J/(mol·K) | per mole of species $i$ |
| thrust coefficient | $C_F$ | — | $F/(p_0 A_t)$; a nozzle figure of merit |
| thrust | $F$ | N | axial reaction force on the engine mount |
| standard gravity | $g_0$ | m/s² | 9.80665, a unit conversion only |
| specific enthalpy | $h$ | J/kg | $u + p/\rho$ |
| stagnation (total) enthalpy | $h_0$ | J/kg | $h + V^2/2$ |
| standard enthalpy of formation | $\Delta_f H^\circ_i$ | J/mol | enthalpy to form species $i$ from elements at 298.15 K, 1 bar |
| specific impulse | $I_{sp}$ | s | $c/g_0$ |
| equilibrium constant (pressure) | $K_p$ | — | $\prod (p_i/p^\circ)^{\nu_i}$ at equilibrium |
| mass flow rate | $\dot m$ | kg/s | |
| Mach number | $M$ | — | $V/a$ |
| molar mass | $\mathcal{M}$ | kg/kmol | mixture or species |
| mixture ratio | $r$ (or MR) | — | oxidiser mass flow / fuel mass flow |
| static pressure | $p$ | Pa | thermodynamic pressure in the moving fluid |
| stagnation (total) pressure | $p_0$ | Pa | pressure after isentropic deceleration to rest |
| chamber pressure | $p_c$ | Pa | see §3.8 — the convention matters |
| ambient pressure | $p_a$ | Pa | |
| exit-plane static pressure | $p_e$ | Pa | |
| heat added per unit mass | $q$ | J/kg | |
| specific gas constant | $R$ | J/(kg·K) | $R_u/\mathcal{M}$ |
| universal gas constant | $R_u$ | J/(kmol·K) | 8314.46 |
| specific entropy | $s$ | J/(kg·K) | |
| entropy generated per unit mass | $s_{gen}$ | J/(kg·K) | irreversibility measure |
| static temperature | $T$ | K | |
| stagnation temperature | $T_0$ | K | |
| specific internal energy | $u$ | J/kg | |
| velocity magnitude | $V$ | m/s | flow speed in the engine frame |
| shaft work per unit mass | $w_s$ | J/kg | positive out of the control volume |
| mole fraction of species $i$ | $x_i$ | — | $n_i/n_{tot}$ |
| mass fraction of species $i$ | $Y_i$ | — | $m_i/m_{tot}$ |
| degree of dissociation | $\alpha$ | — | fraction of a species dissociated at equilibrium |
| ratio of specific heats | $\gamma$ | — | $c_p/c_v$ |
| expansion (area) ratio | $\varepsilon$ | — | $A_e/A_t$ |
| contraction ratio | $\varepsilon_c$ | — | $A_c/A_t$ |
| combustion efficiency | $\eta_{c^*}$ | — | $c^*_{delivered}/c^*_{ideal}$ |
| density | $\rho$ | kg/m³ | |
| compressibility factor | $Z$ | — | $p/(\rho R T)$; 1 for an ideal gas |

Constants used throughout: $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p^\circ = 1\ \mathrm{bar}$,
$T^\circ = 298.15\ \mathrm{K}$.

---

## 3. Theory

### 3.1 Why everything in this course is a control volume

A rocket engine has no closed system in it worth analysing. Propellant enters,
combustion products leave, and nothing is ever returned to its initial state.
The correct primitive is therefore the **control volume** (CV): a fixed region
of space with mass crossing its boundary, across which we write the integral
conservation laws. Every performance parameter in this course —
$\dot m$, $F$, $c^*$, $C_F$, $I_{sp}$ — is a control-volume result.

Two CV choices recur, and confusing them is the source of a large fraction of
undergraduate errors:

```
   CV-A: "the whole engine"                CV-B: "one flow station to another"
   ┌───────────────────────────┐
   │  propellant in            │            ┌────────┐
   │      ↓                    │            │        │
   │  [injector][chamber][noz]─┼──→ exhaust │ 1 ──→ 2│   station-to-station,
   │                           │            │        │   used for nozzle flow,
   └───────────────────────────┘            └────────┘   diffusers, ducts
   used for THRUST                          used for STATE CHANGES
```

CV-A gives you the force on the mount. CV-B gives you the thermodynamic path
between two stations. They answer different questions and the pressure terms
enter differently. [F]

Throughout, we assume **steady flow**: $\partial/\partial t = 0$ inside the CV.
For a liquid engine at mainstage this is excellent; for start-up, shutdown,
throttle transients and every combustion-instability problem it is false, and
Modules 13 and 15 restore the time derivatives.

### 3.2 Conservation of mass

For a CV with a single inlet and outlet and steady flow,

$$\frac{d}{dt}\int_{CV}\rho\,dV + \oint_{CS}\rho(\mathbf{V}\!\cdot\!\mathbf{n})\,dA = 0
\quad\Longrightarrow\quad \dot m = \rho_1 V_1 A_1 = \rho_2 V_2 A_2$$

> **Eq. 3.1** — variables: $\rho$ density [kg/m³], $V$ velocity normal to the
> area [m/s], $A$ area [m²], $\dot m$ mass flow [kg/s]. Meaning: mass is neither
> created nor destroyed, so the flux through every station of a duct is the
> same. Assumes: steady flow, one-dimensional (uniform) properties across each
> station, no mass addition through the walls. Fails when: film-cooling or
> gas-generator exhaust is injected downstream of the injector (the F-1 dumps
> turbine exhaust into the nozzle extension, so $\dot m$ at the exit plane is
> **not** $\dot m$ at the throat); when boundary-layer blockage makes the
> one-dimensional assumption poor near the throat; during transients.

The mass equation is the one nobody gets wrong and everybody forgets to check
the assumptions of. In a chamber with 10 % fuel-film cooling injected at the
wall, the gas passing the throat is not the gas that left the injector core, and
its mixture ratio, molar mass and temperature are all different. That is a mass
bookkeeping failure, and it shows up later as an unexplained $\eta_{c^*}$
deficit. [F]

### 3.3 Conservation of momentum, and where thrust comes from

This is the preview of Module 03, and it is worth doing carefully once.

Take CV-A, a surface enclosing the entire engine, cutting the propellant feed
lines upstream and the exhaust at the nozzle exit plane. Steady flow, $x$ along
the thrust axis. The integral momentum theorem is

$$\sum F_x = \oint_{CS} \rho\,u\,(\mathbf{V}\!\cdot\!\mathbf{n})\,dA$$

The forces on the CV are (i) the reaction from the engine mount, $-F$ if $F$ is
the thrust delivered to the vehicle, and (ii) the pressure integral over the
whole control surface, $-\oint p\,n_x\,dA$.

The trick is to split the pressure into an ambient part and an excess:
$p = p_a + (p - p_a)$. Because $\oint n_x\,dA = 0$ over any closed surface, the
uniform $p_a$ contributes exactly nothing. Everywhere on the CV boundary except
the exit plane the gas is at ambient, so $(p - p_a) = 0$ there. Only the exit
plane survives, contributing $(p_e - p_a)A_e$.

The momentum flux is $\dot m V_e$ out of the exit and (for a vehicle at rest, or
in the engine frame) essentially zero in through the propellant lines — liquid
propellant enters at a few metres per second against an exhaust at several
thousand. Collecting:

$$\boxed{\;F = \dot m V_e + (p_e - p_a)A_e\;}$$

> **Eq. 3.2** — variables: $F$ thrust [N], $\dot m$ propellant mass flow [kg/s],
> $V_e$ mass-averaged axial exit velocity [m/s], $p_e$ exit-plane static
> pressure [Pa], $p_a$ ambient pressure [Pa], $A_e$ exit area [m²]. Meaning:
> thrust is the rate at which the engine throws momentum backwards, plus a
> pressure term that exists only because the nozzle is finite. Assumes: steady,
> one-dimensional exit flow, uniform $p_e$ across the exit plane, negligible
> inlet momentum, $p_a$ uniform over the external surface. Fails when: the flow
> separates inside the nozzle (then $p_e$ is not the wall pressure and $A_e$ is
> not the geometric exit area — Module 09); when the exit flow is strongly
> non-uniform or has significant radial velocity (divergence loss); for
> air-breathing engines, where the inlet momentum term is the whole game.

Two consequences worth internalising now.

**Thrust is a pressure integral on the walls, not a push on the atmosphere.**
An equivalent derivation takes the CV as the *inner* wetted surface of the
chamber and nozzle. Then $F = \int (p_i - p_a)\,dA_x$ over the injector face,
chamber walls and nozzle contour. The engine works in vacuum for the same reason
it works at sea level: the injector-face end of the chamber has no matching area
downstream to cancel its pressure. [F]

**The pressure term is why a nozzle can be over- or under-expanded.** $V_e$ rises
monotonically with $\varepsilon$; $(p_e - p_a)A_e$ goes negative once
$p_e < p_a$. The optimum is $p_e = p_a$. Module 03 proves it; here just note
that the trade lives entirely inside Eq. 3.2. [F]

### 3.4 Conservation of energy: the steady-flow energy equation

Start from the first law for a control volume:

$$\frac{dE_{CV}}{dt} = \dot Q - \dot W_s + \sum_{in}\dot m\left(h + \tfrac{V^2}{2} + gz\right) - \sum_{out}\dot m\left(h + \tfrac{V^2}{2} + gz\right)$$

Here $\dot W_s$ is *shaft* work; the flow work $p v$ done pushing fluid across
the boundary has already been absorbed into the enthalpy $h = u + p/\rho$, which
is the entire reason enthalpy exists (§3.5). For steady flow with one inlet and
one outlet, dividing by $\dot m$ and dropping the gravitational term (in a
rocket chamber $g\,\Delta z \sim 10\ \mathrm{J/kg}$ against enthalpies of
$10^7\ \mathrm{J/kg}$; ignore it):

$$q - w_s = \left(h_2 + \frac{V_2^2}{2}\right) - \left(h_1 + \frac{V_1^2}{2}\right) = h_{0,2} - h_{0,1}$$

> **Eq. 3.3** — the **steady-flow energy equation** (SFEE). Variables: $q$ heat
> added per unit mass [J/kg], $w_s$ shaft work extracted per unit mass [J/kg],
> $h$ static enthalpy [J/kg], $V$ velocity [m/s], $h_0 = h + V^2/2$ stagnation
> enthalpy [J/kg]. Meaning: whatever heat you add and work you do not extract
> shows up as stagnation enthalpy. Assumes: steady, adiabatic walls unless $q$
> is retained, single inlet/outlet, uniform properties at each station,
> negligible potential energy. Fails when: the flow is unsteady (acoustic
> instability, start transient); when mass is added between stations with a
> different $h_0$ (film cooling, turbine-exhaust dump).

**The rocket nozzle case.** A nozzle has no shaft ($w_s = 0$) and, over the
residence time of a gas parcel, exchanges very little heat with the wall
compared with its own enthalpy ($q \approx 0$; typically $<1\%$ of $h_0$ even in
a hard-worked regeneratively cooled chamber). Therefore

$$h_0 = h + \frac{V^2}{2} = \text{constant through the nozzle}$$

> **Eq. 3.4** — variables as above. Meaning: a nozzle converts enthalpy to
> kinetic energy at constant total. Assumes: adiabatic, no shaft work, steady,
> no mass addition. **Note what it does *not* assume: reversibility.** Eq. 3.4
> holds across friction, across a shock wave, across a region of chemical
> reaction — anywhere the walls are adiabatic and no work crosses the boundary.
> Fails when: the wall heat flux is a significant fraction of the enthalpy flux
> (small thrusters with high surface-to-volume ratio; radiation-cooled chambers
> at low $\dot m$), or when film coolant with a different $h_0$ mixes in.

This is the single most useful equation in the course. For a calorically perfect
gas ($h = c_p T$) it becomes $V = \sqrt{2c_p(T_0 - T)}$, which is the entire
basis of nozzle performance estimation. [F] Note carefully: **$T_0$ is constant
in adiabatic flow, $p_0$ is not.** $T_0$ is an energy statement; $p_0$ is an
availability statement, and availability is destroyed by every irreversibility
(§3.6). Students who conflate the two produce nozzles that appear to violate the
second law.

### 3.5 Enthalpy versus internal energy: why enthalpy is the currency

Internal energy $u$ is the thermodynamic state variable of a *closed* system.
Enthalpy $h = u + p/\rho$ is the state variable of a *flowing* one, and the
difference is exactly the flow work $p/\rho$ that the upstream fluid must do to
shove a unit mass across the control surface against the local pressure.

Put concretely: to move 1 kg of chamber gas at 200 bar and 13.8 kg/kmol,
3600 K through a plane, the fluid behind it must do

$$\frac{p}{\rho} = RT = 600.5 \times 3600 = 2.16\ \mathrm{MJ/kg}$$

of work. That is not a small correction — it is roughly 16 % of the gas's
enthalpy. Any bookkeeping in a flow device that tracks $u$ instead of $h$ must
carry that term explicitly and will eventually drop it. [F]

Consequences that matter operationally:

- The energy released by combustion at **constant pressure** is $-\Delta H$, not
  $-\Delta U$. A rocket chamber is (to first order) a constant-pressure
  combustor, so tabulated **enthalpies** of formation are the right data. A
  closed bomb calorimeter measures $\Delta U$; the difference is
  $\Delta(pV) = \Delta n\,R_u T$ and is not negligible for reactions that change
  mole count. Solid-motor closed-bomb data need this correction. [F]
- Turbine and pump work are $\Delta h_0$, not $\Delta u$. Module 12 uses
  $P = \dot m\,\Delta h_0$ throughout.
- Stagnation enthalpy, not stagnation temperature, is what is conserved when the
  gas is not calorically perfect. $h_0 = \mathrm{const}$ is exact under Eq. 3.4's
  assumptions; $T_0 = \mathrm{const}$ additionally requires $c_p$ constant, and
  in a rocket nozzle spanning 3600 K to 1200 K, $c_p$ varies by roughly 15 %.
  [F][A]

### 3.6 The second law, entropy generation, and why nozzle losses are entropy

The second law for a control volume in steady flow:

$$\dot m (s_2 - s_1) = \int \frac{\delta \dot Q}{T} + \dot S_{gen},\qquad \dot S_{gen}\ge 0$$

For adiabatic flow ($\delta \dot Q = 0$) this reduces to
$s_2 - s_1 = s_{gen} \ge 0$: entropy can only rise. Combine that with the Gibbs
relation for an ideal gas between two states,

$$s_2 - s_1 = c_p\ln\frac{T_2}{T_1} - R\ln\frac{p_2}{p_1}$$

and evaluate it between the two *stagnation* states. Because the stagnation
state is reached isentropically from the static state by definition, and because
$T_{0}$ is constant in adiabatic flow, the temperature term vanishes and

$$\boxed{\;s_{gen} = -R\ln\frac{p_{0,2}}{p_{0,1}}\;}$$

> **Eq. 3.5** — variables: $s_{gen}$ entropy generated per unit mass
> [J/(kg·K)], $R$ specific gas constant [J/(kg·K)], $p_0$ stagnation pressure
> [Pa]. Meaning: **in adiabatic flow, stagnation-pressure loss *is*
> irreversibility.** They are the same physical statement in different units.
> Assumes: adiabatic, steady, ideal gas, constant composition (or a consistent
> multi-component entropy). Fails when: heat is added or removed (then $T_0$
> changes and both terms survive); across a region of chemical reaction, where
> the composition change contributes an entropy of mixing.

Every loss mechanism in a nozzle is a producer of $s_{gen}$ and therefore a
destroyer of $p_0$:

| mechanism | where | typical $p_0$ loss |
|---|---|---|
| combustion + area contraction in the chamber | injector face → throat | 1–8 % [A] |
| wall friction / boundary layer | throat → exit | 0.5–2 % [E] |
| shock waves (overexpanded, separated, or from contour discontinuity) | divergent section | up to tens of % [E] |
| finite-rate chemistry (frozen recombination) | throat → exit | appears as lost $h_0$ availability, not $p_0$ |
| mixing of unlike streams (film coolant, GG exhaust) | chamber and nozzle | 1–3 % [A] |

**How much is a percent of $p_0$ worth?** Use the Gouy–Stodola result: lost
available work $= T_{sink}\,s_{gen}$. Take the RS-25-class gas of §5.2
($R = 600.5$ J/(kg·K)), a 2 % $p_0$ loss inside the divergent section at fixed
exit pressure, and an exit static temperature of 1205 K:

$$s_{gen} = -600.5\ln(0.98) = 12.13\ \mathrm{J/(kg\,K)}$$
$$\text{lost work} = 1205 \times 12.13 = 14.6\ \mathrm{kJ/kg}$$

against a kinetic energy $V_e^2/2 = 8.96\ \mathrm{MJ/kg}$. Predicted velocity
loss $\Delta V_e \approx 14\,620/4234 = 3.5\ \mathrm{m/s}$. Recomputing the exit
velocity directly with $0.98\,p_0$ and the same $p_e$ gives 4230.6 m/s against
4234.0 m/s — a loss of 3.46 m/s, or **0.35 s of $I_{sp}$**. The two methods agree
to 1 %. [F]

That number is worth remembering: a 2 % stagnation-pressure loss *inside the
supersonic section* costs about a third of a second. This is why nozzle
contour optimisation (Module 09) fights over fractions of a percent — and also
why an *upstream* $p_0$ loss, in the chamber, is a completely different and much
more expensive animal (§3.8).

### 3.7 Stagnation quantities

Define the **stagnation state** at a point as the state the fluid would reach if
brought to rest adiabatically and reversibly. From Eq. 3.4 with $V_2 = 0$:

$$h_0 = h + \frac{V^2}{2}$$

For a calorically perfect gas, $h = c_p T$ and $c_p = \gamma R/(\gamma - 1)$, so

$$c_p T_0 = c_p T + \frac{V^2}{2} \;\Longrightarrow\;
\frac{T_0}{T} = 1 + \frac{V^2}{2c_pT} = 1 + \frac{\gamma - 1}{2}M^2$$

using $V^2 = M^2\gamma R T$ and $c_p T = \gamma R T/(\gamma-1)$.

$$\boxed{\;\frac{T_0}{T} = 1 + \frac{\gamma-1}{2}M^2\;}$$

> **Eq. 3.6** — variables: $T_0$ stagnation temperature [K], $T$ static
> temperature [K], $M$ Mach number, $\gamma$ ratio of specific heats. Meaning:
> the temperature rise from stopping the flow. Assumes: adiabatic, calorically
> perfect gas. Fails when: $c_p$ varies appreciably over the range $T$ to $T_0$
> — in a rocket nozzle at $M = 4.5$ this is a 15–20 % effect on $c_p$ and the
> relation should be replaced by $h_0 = h + V^2/2$ with tabulated $h(T)$.

Because the deceleration is *by definition* isentropic, the pressure and density
ratios follow from the isentropic relation $p/\rho^\gamma = \mathrm{const}$ and
the ideal gas law:

$$\frac{p_0}{p} = \left(\frac{T_0}{T}\right)^{\frac{\gamma}{\gamma-1}} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}},
\qquad
\frac{\rho_0}{\rho} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{1}{\gamma-1}}$$

> **Eq. 3.7** — variables as above plus $p_0$ stagnation pressure [Pa],
> $\rho_0$ stagnation density [kg/m³]. Meaning: the pressure recovered by
> stopping the flow ideally. Assumes: calorically perfect, and — crucially —
> that the *definition* of the stagnation state uses an isentropic deceleration
> even when the actual flow is not isentropic. Fails when: used to infer a
> conserved quantity. $p_0$ is a *local* property; it is constant only in
> isentropic flow.

**The single most important distinction in this section.** In adiabatic flow
without work:

- $h_0$ is **conserved** — always, exactly.
- $T_0$ is **conserved** if additionally $c_p$ is constant.
- $p_0$ is **conserved only if the flow is also reversible.** Any friction,
  shock, mixing or unsteadiness destroys it, per Eq. 3.5.

Nearly every conceptual error in compressible-flow homework and a large fraction
of real engineering errors reduce to treating $p_0$ as if it were $h_0$. [F]

### 3.8 What "chamber pressure" physically is

$p_c$ is the headline number of every engine datasheet, and it is not one
number. Consider what happens between the injector face and the throat.

At the injector face, the gas is essentially at rest ($V \approx 0$), so the
static pressure measured by a tap there *is* the stagnation pressure. Moving
downstream, combustion adds heat, the gas accelerates, and by the end of the
cylindrical section it is moving at a Mach number set by the contraction ratio
$\varepsilon_c = A_c/A_t$. That acceleration must be paid for out of the pressure
field, so the static pressure has fallen. And because the acceleration was
driven by heat addition — a Rayleigh-line process — the **stagnation** pressure
has fallen too.

Do the momentum balance on a constant-area chamber CV from the injector face
(station 1, $V\approx0$) to the chamber exit (station 2):

$$p_1 A + \dot m V_1 = p_2 A + \dot m V_2 \;\Longrightarrow\; p_1 = p_2 + \rho_2 V_2^2 = p_2(1 + \gamma M_2^2)$$

using $\rho V^2 = \gamma p M^2$. Then the stagnation pressure at station 2 is
$p_{0,2} = p_2\,(1 + \tfrac{\gamma-1}{2}M_2^2)^{\gamma/(\gamma-1)}$, so

$$\boxed{\;\frac{p_{0,2}}{p_{inj}} = \frac{\left(1 + \frac{\gamma-1}{2}M_2^2\right)^{\frac{\gamma}{\gamma-1}}}{1 + \gamma M_2^2}\;}$$

> **Eq. 3.8** — variables: $p_{inj}$ injector-face pressure [Pa], $p_{0,2}$
> stagnation pressure at the chamber exit / nozzle entrance [Pa], $M_2$ chamber
> exit Mach number, set by $\varepsilon_c$ through the isentropic area relation.
> Meaning: the stagnation-pressure penalty for burning in a finite-area chamber.
> Assumes: constant area, frictionless walls, all heat release complete by
> station 2, one-dimensional, calorically perfect. Fails when: the chamber is
> convergent (many small thrusters), when a large fraction of the heat release
> occurs in the convergent section, or when $\varepsilon_c$ is so low that
> $M_2 \gtrsim 0.4$ and the one-dimensional treatment is poor.

For $\varepsilon_c = 3$ and $\gamma = 1.19$ the loss is 2.3 % (§5.1). For
$\varepsilon_c = 2$ and $\gamma = 1.20$ it is 5.1 %. For $\varepsilon_c = 1.5$ it
exceeds 9 %. **This is the physics behind the design rule that contraction ratio
should not go below about 2, and preferably sits at 2.5–4 for large engines.**
[F][J]

**Why it matters commercially.** $c^* = p_0 A_t/\dot m$ is defined with the
*throat stagnation* pressure. A test stand measures the *injector-face*
pressure. If you divide the injector-face pressure by the ideal $c^*$ you
overstate the engine's combustion efficiency by exactly the Eq. 3.8 factor — 2 %
for a big chamber, 5 % for a tight one. Conversely, if you size a throat from a
quoted $p_c$ without knowing which convention it used, your throat area is
2–5 % wrong and your thrust with it.

The verification file for this course flags this as **the single largest
recurring source of apparent disagreement** in published engine data: American
Apollo-era practice quotes injector-end pressure, Soviet and Russian practice
quotes nozzle stagnation pressure, which is a few percent lower. Comparing the
RD-180's 267 bar against the RS-25's 206 bar without saying so overstates the
gap. [H][M] The F-1's chamber pressure appears in the literature as 965, 982,
1015 and 1125 psia; at least part of that 16 % spread is measurement station,
and part is development peak versus flight rating. This course quotes
$\approx 70$ bar (1015 psia) injector-end for the F-1 and states the range.

**Course convention** (from the README): $p_c$ means the stagnation pressure at
the injector face unless stated otherwise, and the text flags where a source used
throat stagnation.

### 3.9 Calorically perfect, thermally perfect, and real gases

Three nested models, each with a well-defined domain of validity.

**Calorically perfect (CPG):** $pv = RT$ *and* $c_p, c_v, \gamma$ constant. All
the closed-form relations of §3.7 and all of Module 02 assume this.

**Thermally perfect (TPG):** $pv = RT$ but $c_p = c_p(T)$. Enthalpy is still a
function of temperature alone, $h(T) = \int c_p\,dT$, but the isentropic
relations must be integrated numerically or read from gas tables. This is what
CEA does for the "frozen" case.

**Real gas:** $pv = ZRT$ with $Z = Z(p,T) \ne 1$, plus $h = h(p,T)$ —
intermolecular forces make enthalpy pressure-dependent. Requires an equation of
state (Peng–Robinson, Benedict–Webb–Rubin, Helmholtz-energy formulations such as
those behind [REFPROP]) or tabulated data [NIST-WB].

Which one where:

| station | condition | model | why |
|---|---|---|---|
| combustion chamber | 3000–3800 K, 30–260 bar | **thermally perfect, reacting** | very hot, so $Z\to1$ despite the pressure: the reduced temperature is enormous. But $c_p(T)$ varies strongly and composition shifts. |
| nozzle throat → exit | 3500 → 1200 K, 200 → 0.2 bar | **thermally perfect**; CPG is a usable [A] | $Z \approx 1$ everywhere; $c_p$ varies ~15 % |
| pressurant bottle | GHe, 300 K, 200–400 bar | **real gas, $Z$ matters** | helium at 300 bar, 300 K has $Z \approx 1.2$; ideal-gas sizing under-predicts the required bottle volume by ~17 % [A][NIST-WB] |
| cold-gas plenum | GN₂, 293 K, 200 bar | **real gas, mildly** | $Z$ within a few percent of 1 but the blowdown integral is sensitive; Module 29 |
| cryogenic pump inlet | LOX 90 K / LH₂ 20 K, 2–6 bar | **liquid; ideal gas meaningless** | use $\rho$ and $p_{vap}$ from [NIST-WB]/[REFPROP]. LOX at its normal boiling point is ~1141 kg/m³; LH₂ ~70.8 kg/m³; RP-1 ~810 kg/m³ [E] |
| LH₂ pump discharge | 20–60 K, 200–400 bar | **strongly real** | hydrogen near the critical region: $\rho$, $c_p$ and sound speed all deviate from ideal by tens of percent. Getting this wrong mis-sizes the pump and the regen jacket. |

> **[J] Engineering judgment.** In the hot section, use CPG for hand analysis and
> to build intuition; use CEA (Module 04) for any number that goes into a design
> or a report. In the cold section, *never* use the ideal gas law for a
> cryogen or a high-pressure pressurant without checking $Z$. The single most
> common real-gas error in a student project is sizing a helium bottle with
> $m = pV/RT$ and finding on the test stand that the tank empties early.

**Why $Z \to 1$ in the chamber despite 200 bar.** Compressibility deviates when
the mean intermolecular potential energy is comparable to $kT$. Reduced
temperature $T_r = T/T_c$ for water at 3600 K is $3600/647 = 5.6$; reduced
pressure $p_r = 206/220 = 0.94$. On any generalised compressibility chart, $T_r
> 2$ with $p_r < 1$ sits solidly at $Z \approx 1.00$. The chamber is a benign
place thermodynamically; it is the *cold* end of the engine where real-gas
behaviour bites. [F]

### 3.10 Specific heats, $\gamma$, gas constant, molar mass

For an ideal gas of molar mass $\mathcal{M}$:

$$R = \frac{R_u}{\mathcal{M}},\qquad c_p - c_v = R,\qquad \gamma = \frac{c_p}{c_v},\qquad c_p = \frac{\gamma R}{\gamma-1},\qquad c_v = \frac{R}{\gamma-1}$$

> **Eq. 3.9** — variables: $R$ specific gas constant [J/(kg·K)], $R_u$ universal
> gas constant 8314.46 [J/(kmol·K)], $\mathcal{M}$ molar mass [kg/kmol],
> $c_p, c_v$ specific heats [J/(kg·K)], $\gamma$ dimensionless. Meaning: two
> numbers ($\mathcal{M}$ and $\gamma$) fix the entire thermodynamic behaviour of
> an ideal gas. Assumes: ideal gas, $c_p$ evaluated at the relevant temperature.
> Fails when: $Z \ne 1$; when the composition is shifting, in which case
> $\mathcal{M}$ itself is a function of state.

**Why $\gamma$ is what it is.** From kinetic theory, each fully excited quadratic
degree of freedom contributes $\tfrac12 R$ to $c_v$. A monatomic gas has 3
translational modes: $c_v = \tfrac32 R$, $\gamma = 5/3 = 1.667$. A diatomic gas
adds 2 rotational modes: $c_v = \tfrac52 R$, $\gamma = 7/5 = 1.4$ at moderate
temperature, falling as vibration switches on. A triatomic bent molecule like
H₂O has 3 translational, 3 rotational and 3 vibrational modes; with vibration
fully excited at 3600 K, $c_v \to \tfrac{6}{1}\cdot\tfrac12 R + \ldots$ and
$\gamma$ falls toward 1.15. **Rocket exhaust has low $\gamma$ because it is hot
and made of polyatomic molecules with many excited vibrational modes.** [F]

Ranges to memorise: monatomic 1.667; air at 300 K 1.400; nitrogen cold gas 1.40;
helium 1.667; LOX/LH₂ chamber gas 1.19–1.22; kerolox 1.20–1.24; solid-motor
AP/HTPB exhaust 1.15–1.20; hydrazine decomposition products 1.27–1.34. Lower
$\gamma$ is *good* for a nozzle: it means more of the enthalpy is recoverable
before the temperature bottoms out, and $C_F$ rises. Lower $\mathcal{M}$ is very
good: $c^* \propto \sqrt{T_0/\mathcal{M}}$. [F]

### 3.11 Mixtures: Dalton, mass and mole fractions, mixture properties

Combustion products are always a mixture, so every property is a weighted
average. Dalton's law for a mixture of ideal gases at temperature $T$ in volume
$V$: each species exerts its partial pressure as if alone,

$$p = \sum_i p_i,\qquad p_i = x_i\,p,\qquad x_i = \frac{n_i}{\sum_j n_j}$$

> **Eq. 3.10** — variables: $p_i$ partial pressure of species $i$ [Pa], $x_i$
> mole fraction, $n_i$ moles. Meaning: mole fraction and pressure fraction are
> the same thing for an ideal gas mixture. Assumes: ideal gas, no intermolecular
> interaction between species. Fails when: $Z \ne 1$, or in a dense supercritical
> mixture near a critical locus (relevant to injection, Module 07, not here).

Conversions:

$$\mathcal{M} = \sum_i x_i \mathcal{M}_i,\qquad Y_i = \frac{x_i\mathcal{M}_i}{\mathcal{M}},\qquad x_i = \frac{Y_i/\mathcal{M}_i}{\sum_j Y_j/\mathcal{M}_j}$$

$$\bar c_p = \sum_i x_i \bar c_{p,i}\ \ [\mathrm{J/(mol\,K)}],\qquad
c_p = \frac{\bar c_p}{\mathcal{M}}\times 10^3\ \ [\mathrm{J/(kg\,K)}],\qquad
c_p = \sum_i Y_i c_{p,i}$$

$$R = \frac{R_u}{\mathcal{M}},\qquad \gamma = \frac{c_p}{c_p - R}$$

> **Eq. 3.11** — variables: $\mathcal{M}$ mixture molar mass [kg/kmol],
> $\mathcal{M}_i$ species molar mass [kg/kmol], $x_i$ mole fraction, $Y_i$ mass
> fraction, $\bar c_{p,i}$ molar specific heat [J/(mol·K)]. Meaning: mixture
> properties are mole-weighted on a molar basis and mass-weighted on a mass
> basis; mixing the two is the classic error. Assumes: ideal gas mixture, each
> species at the mixture temperature. Fails when: composition shifts with state
> (then $\gamma$ from this formula is the **frozen** $\gamma$, which is *not*
> the isentropic exponent of the reacting mixture — see §3.14).

Worked in full in §5.2 for an RS-25-class product mixture: mole fractions
dominated by H₂O and H₂ with a few percent OH give
$\mathcal{M} = 13.84$ kg/kmol, $R = 600.5$ J/(kg·K), $c_p = 3742$ J/(kg·K),
$\gamma = 1.191$.

Note the asymmetry that makes hydrogen engines what they are: in that mixture
H₂ is **24.9 % by mole** but only **3.6 % by mass**. Excess hydrogen is an
enormously effective molar-mass reducer per kilogram of propellant carried,
which is the whole reason LOX/LH₂ engines run fuel-rich (§3.16). [F]

### 3.12 Combustion thermodynamics: the preview

Module 04 does thermochemistry properly. Two ideas are needed now.

**Enthalpy of formation.** Chemical energy is bookkept by assigning every species
a standard enthalpy of formation $\Delta_f H^\circ$ at 298.15 K and 1 bar, with
elements in their reference states set to zero. The absolute enthalpy of a
species at temperature $T$ is then

$$H_i(T) = \Delta_f H^\circ_i + \left[H_i(T) - H_i(298.15)\right]$$

the second term being the tabulated **sensible** enthalpy from [JANAF] or the
CEA thermodynamic database [RP-1311].

> **Eq. 3.12** — variables: $H_i(T)$ absolute molar enthalpy [J/mol],
> $\Delta_f H^\circ_i$ standard enthalpy of formation [J/mol], the bracket the
> sensible enthalpy increment [J/mol]. Meaning: one consistent enthalpy scale
> that lets chemical and thermal energy be added. Assumes: ideal gas, standard
> state 1 bar. Fails when: the species is a condensed phase (then include the
> phase-change enthalpy explicitly — Al₂O₃ in solid motors, Module 20), or when
> the propellant enters as a cryogenic liquid rather than a 298 K gas (see
> below).

**Adiabatic flame temperature.** For a constant-pressure, adiabatic combustor
with no work, Eq. 3.3 says $h_{0,products} = h_{0,reactants}$. Velocities are
small at both ends of a chamber, so

$$\sum_{prod} n_j \left[\Delta_f H^\circ_j + \int_{298}^{T_{ad}}\bar c_{p,j}\,dT\right]
= \sum_{react} n_i \left[\Delta_f H^\circ_i + \int_{298}^{T_{in}}\bar c_{p,i}\,dT\right]$$

> **Eq. 3.13** — variables: $n$ moles, $T_{ad}$ adiabatic flame temperature [K],
> $T_{in}$ reactant inlet temperature [K]. Meaning: all the chemical energy
> released goes into heating the products; solve implicitly for $T_{ad}$.
> Assumes: adiabatic (no wall heat loss), constant pressure, complete specified
> reaction, kinetic energy negligible at both stations. Fails when: the product
> set is assumed rather than computed — if you neglect dissociation the answer is
> too high, badly so above ~2500 K (§3.15 and §5.3).

**The cryogenic propellant correction.** Reactants do not enter at 298 K as
gases. Liquid hydrogen at 20.3 K and liquid oxygen at 90.2 K carry *negative*
enthalpy relative to their 298 K gaseous reference: roughly
$-9.0\ \mathrm{kJ/mol}$ for LH₂ and $-13.0\ \mathrm{kJ/mol}$ for LOX
[CEA][NIST-WB]. That energy has to come out of the flame. In §5.3 it costs
259 K of flame temperature — not a rounding error. [F]

### 3.13 Chemical equilibrium: Gibbs minimisation, $K_p$, Le Chatelier

At 3600 K the products are not what a balanced stoichiometric equation says they
are. The composition is set by **equilibrium**: at fixed temperature and
pressure, a closed reacting system moves to the composition that minimises the
Gibbs free energy

$$G = \sum_i n_i \mu_i,\qquad \mu_i = \mu_i^\circ(T) + R_u T \ln\frac{p_i}{p^\circ}$$

subject to conservation of each chemical element.

> **Eq. 3.14** — variables: $G$ Gibbs free energy [J], $n_i$ moles of species
> $i$, $\mu_i$ chemical potential [J/mol], $\mu_i^\circ$ standard-state chemical
> potential [J/mol], $p_i$ partial pressure [Pa]. Meaning: the equilibrium
> composition is the one that cannot lower $G$ by any element-conserving
> reshuffle. Assumes: ideal-gas mixture, constant $T$ and $p$, sufficient time to
> equilibrate. Fails when: residence time is short compared with reaction times
> (Module 04 and §3.14); when condensed phases must be included with their own
> chemical potentials.

**This is exactly what CEA solves** [CEA][RP-1311]: it minimises $G$ over a
species list subject to element balances, and it does so without ever writing a
balanced equation. That is the modern method and it is why CEA can handle 30
species without the user specifying reactions.

The classical route to the same answer, for a single reaction, is the
equilibrium constant. For a reaction $\sum \nu_i A_i = 0$,

$$K_p(T) = \prod_i \left(\frac{p_i}{p^\circ}\right)^{\nu_i} = \exp\!\left(-\frac{\Delta G^\circ(T)}{R_u T}\right)$$

> **Eq. 3.15** — variables: $K_p$ dimensionless equilibrium constant,
> $\nu_i$ stoichiometric coefficients (positive for products), $\Delta G^\circ$
> standard Gibbs free energy change of reaction [J/mol], $p^\circ = 1$ bar.
> Meaning: $K_p$ is a pure function of temperature; pressure enters only through
> the partial pressures. Assumes: ideal gas, single reaction, standard state 1
> bar. Fails when: several coupled equilibria matter simultaneously (the usual
> case in a rocket chamber — use Gibbs minimisation).

**Le Chatelier applied to dissociation.** Take the decomposition
$\mathrm{H_2O \rightleftharpoons H_2 + \tfrac12 O_2}$. One mole of reactant
becomes 1.5 moles of products: the reaction increases mole count, therefore
increases volume at fixed pressure, therefore **raising the pressure pushes it
backwards**. Quantitatively, let $\alpha$ be the dissociated fraction of an
initially pure H₂O charge. Moles: $(1-\alpha)$ H₂O, $\alpha$ H₂, $\alpha/2$ O₂,
total $1 + \alpha/2$. Then

$$K_p = \frac{x_{H_2}\,x_{O_2}^{1/2}}{x_{H_2O}}\left(\frac{p}{p^\circ}\right)^{1/2}
= \frac{\alpha\,(\alpha/2)^{1/2}}{(1-\alpha)(1+\alpha/2)^{1/2}}\left(\frac{p}{p^\circ}\right)^{1/2}$$

For $\alpha \ll 1$ this collapses to $K_p \approx \alpha^{3/2}p^{1/2}/\sqrt2$, so

$$\boxed{\;\alpha \approx \left(\sqrt2\,K_p\right)^{2/3}\left(\frac{p}{p^\circ}\right)^{-1/3}\;}$$

> **Eq. 3.16** — variables: $\alpha$ degree of dissociation, $K_p$ equilibrium
> constant at the local temperature, $p$ pressure [Pa or bar consistently with
> $p^\circ$]. Meaning: **dissociation falls as the cube root of pressure.**
> Assumes: single reaction, pure H₂O feed, $\alpha \ll 1$, ideal gas. Fails when:
> $\alpha \gtrsim 0.15$ (the small-$\alpha$ form then errs by ~10 % and more), or
> when excess fuel or oxidiser shifts the equilibrium by common-ion effect — a
> fuel-rich mixture has far less H₂O dissociation than this because the H₂ is
> already there.

Numerically, with $\Delta G^\circ \approx +41$ kJ/mol at 3600 K [JANAF],
$K_p = 0.254$, and solving the full expression gives $\alpha = 0.387$ at 1 bar,
0.146 at 32.8 bar (RL10 chamber pressure), 0.115 at 70 bar (F-1), and 0.082 at
206.4 bar (RS-25). The cube-root scaling predicts a factor 1.85 between the RL10
and RS-25 chambers; the exact solution gives 1.78. [A]

### 3.14 Frozen versus equilibrium (shifting) flow, and recombination

A gas parcel takes roughly 0.1–1 ms to travel from the throat to the exit plane
of a large nozzle. Recombination reactions such as
$\mathrm{H + OH + M \rightarrow H_2O + M}$ are three-body and their rates fall
steeply as density falls. So there is a competition: chemistry wants to
recombine (releasing energy, because the dissociated species carry positive
enthalpy of formation), and the expansion keeps pulling the temperature and
density down until the chemistry can no longer keep up.

Two limiting idealisations bracket the truth:

- **Equilibrium (shifting) flow.** Composition re-equilibrates instantaneously at
  every station. Recombination releases its chemical enthalpy into the flow,
  raising the local temperature and hence the enthalpy available for
  acceleration. This is the **upper bound** on performance.
- **Frozen flow.** Composition is fixed at its chamber value all the way to the
  exit. None of the dissociation energy is recovered. This is the **lower
  bound**.

> **[F]** Real nozzles start near equilibrium (dense, hot, fast chemistry near the
> throat) and freeze somewhere in the divergent section, typically between
> $\varepsilon \approx 5$ and $\varepsilon \approx 25$ depending on pressure and
> propellant. The correct calculation is finite-rate kinetics; the standard
> engineering practice is to compute both bounds with CEA and take equilibrium
> minus a kinetic-loss allowance, or to use the JANNAF methodology [CPIA-246].

The size of the gap is set by how much chemical energy is stored in dissociated
species. For the RS-25-class chamber mixture of §5.2, complete recombination
would release **0.79 MJ/kg** — see §5.4 — which is worth up to 18 s of $I_{sp}$ on
a 450 s engine, about 4 %. For a cooler, higher-molar-mass propellant such as
storable N₂O₄/MMH at 3000 K, dissociation is much milder and the frozen-to-
equilibrium gap is typically 1–2 %. For solid motors with condensed Al₂O₃ the
story is different again (Module 20): there the dominant departure is two-phase
lag, not chemistry.

There is a second-order effect that works the other way. Recombination *reduces
the mole count*, so it raises the molar mass. In §5.4 the fully recombined exit
mixture has $\mathcal{M} = 14.14$ against 13.84 in the chamber. Higher
$\mathcal{M}$ hurts. It does not come close to cancelling the energy release, but
it is why the equilibrium gain is not simply proportional to the stored chemical
energy. [F]

### 3.15 Dissociation, and why $T_c$ saturates with chamber pressure

Put Eq. 3.16 together with Eq. 3.13 and the picture is complete.

Raising chamber pressure suppresses dissociation ($\alpha \propto p^{-1/3}$).
Less dissociation means more of the fuel's chemical energy appears as sensible
heat rather than as stored bond energy, so the flame temperature rises. But the
dependence is a cube root, and the recovered energy is itself only a fraction of
the total: going from 70 bar to 210 bar cuts $\alpha$ by a factor 1.44 and buys
perhaps 60–120 K of flame temperature for LOX/LH₂. [A]

$$T_c(p) \approx T_{c,\infty} - k\,p^{-1/3}$$

> **Eq. 3.17** — a scaling, not a design equation. Variables: $T_{c,\infty}$ the
> no-dissociation flame temperature [K], $k$ a propellant-dependent constant.
> Meaning: chamber temperature approaches the no-dissociation value from below
> as $p^{-1/3}$, so it **saturates**. Assumes: dissociation dominated by a single
> mole-increasing equilibrium, fixed mixture ratio. Fails when: several
> dissociation equilibria with different $\Delta n$ compete; when condensed
> phases appear or disappear over the pressure range.

The engineering consequence is important and often misstated. **Chamber pressure
does not buy you specific impulse through temperature.** It buys $I_{sp}$ almost
entirely through the *nozzle*: a higher $p_c$ at fixed $p_e$ means a bigger
usable pressure ratio and a higher $C_F$, and (for a given vehicle base area) it
permits a larger $\varepsilon$. The temperature gain is real but small and
saturating. Meanwhile the heat flux scales roughly as $p_c^{0.8}$ (Bartz,
[Bartz57], Module 10) and the structural and turbomachinery costs scale worse
than linearly. Anyone who justifies a high-pressure staged-combustion cycle by
"hotter chamber" has the argument backwards. [F][J]

### 3.16 Chamber temperature versus mixture ratio

For a given propellant pair, $T_c$ peaks near stoichiometric — slightly on the
fuel-rich side, because dissociation is worst exactly where the temperature is
highest and shifting a little rich costs less temperature than it saves in
dissociation. But **$T_c$ is not the objective**. From Module 03,
$c^* \propto \sqrt{T_0/\mathcal{M}}$, and $\mathcal{M}$ rises monotonically with
mixture ratio for a hydrogen-fuelled engine because the excess H₂ is what keeps
$\mathcal{M}$ low. So the $I_{sp}$ optimum sits well fuel-rich of the
temperature optimum.

Indicative shape for LOX/LH₂ at $p_c \approx 200$ bar, equilibrium
([CEA]-class values, illustrative only — **run CEA before using any of these
numbers for design**; stoichiometric MR for H₂/O₂ is 7.94):

| MR (O/F) | $T_c$ [K] | $\mathcal{M}$ [kg/kmol] | $T_c/\mathcal{M}$ | $\sqrt{T_c/\mathcal{M}}$ |
|---|---|---|---|---|
| 3.0 | ~2570 | ~8.9 | 289 | 17.0 |
| 4.0 | ~2980 | ~10.0 | 298 | 17.3 |
| 5.0 | ~3320 | ~11.8 | 281 | 16.8 |
| 6.0 | ~3600 | ~13.8 | 261 | 16.2 |
| 7.0 | ~3790 | ~15.6 | 243 | 15.6 |
| 8.0 | ~3890 | ~17.4 | 224 | 15.0 |

[A] Read the last column: $c^*$ peaks near MR ≈ 4, while $T_c$ is still climbing
steeply at MR = 8. The two optima are nowhere near each other, and the
temperature optimum is the one nobody designs to.

**So why does the RS-25 run at 6.03 and the RL10A-3-3A at 5.0?** Because $I_{sp}$
is not the only objective:

- **Tank volume.** Liquid hydrogen is 70.8 kg/m³. Moving from MR 5 to MR 6 cuts
  the hydrogen mass fraction by about 16 %, and hydrogen tankage dominates the
  dry mass and the aerodynamic length of a hydrogen stage. For a core stage that
  flies through the atmosphere, that trade pushes hard toward higher MR.
- **Density impulse.** $\rho I_{sp}$, not $I_{sp}$, is the right figure of merit
  when tank mass matters (Modules 03 and 32).
- **Turbine drive.** In a fuel-rich staged-combustion engine the preburner needs
  a large hydrogen flow at low temperature; the overall MR and the preburner MR
  are coupled.
- **Wall temperature.** $T_c$ at MR 6 is ~600 K hotter than at MR 4.5. Every
  kelvin has to be removed through the liner.

The RS-25's 6.03 and the RL10's 5.0 are the same physics with different
weightings: the RL10 is an upper stage where $I_{sp}$ dominates and the stage is
already volume-designed; the RS-25 is a core-stage engine on a vehicle whose
hydrogen tank is most of its length. [M][J]

Kerolox behaves differently because RP-1 is dense (~810 kg/m³) and its products
include CO and CO₂ with $\mathcal{M}$ of 28 and 44. Stoichiometric LOX/RP-1 is
about 3.4; the F-1 runs 2.27, i.e. equivalence ratio ≈ 1.5, deeply fuel-rich.
Part of that is the $\mathcal{M}$ argument, and part is that a fuel-rich chamber
is a *cooler* chamber and the F-1's tube-wall liner and film-cooling budget
needed it to be. [H]

### 3.17 Combustion efficiency $\eta_{c^*}$, and what it hides

The standard combustor figure of merit:

$$c^*_{delivered} = \frac{p_{0,t}\,A_t}{\dot m},\qquad
\eta_{c^*} = \frac{c^*_{delivered}}{c^*_{ideal}},\qquad
c^*_{ideal} = \frac{\sqrt{R T_0}}{\Gamma(\gamma)},\quad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.18** — variables: $p_{0,t}$ **throat stagnation** pressure [Pa], $A_t$
> throat area [m²], $\dot m$ total propellant mass flow [kg/s], $R$ and $T_0$
> from the assumed combustion model. Meaning: how close the combustor comes to
> releasing all the chemical energy and delivering it as a fully mixed,
> equilibrium gas at the throat. Assumes: choked throat, one-dimensional,
> known $A_t$, known and correct reference model. Fails when: $A_t$ has eroded or
> thermally grown (solid motors, ablative chambers); when $\dot m$ omits film
> coolant or turbine exhaust; when $p_c$ is the injector-face value; when the
> reference $c^*_{ideal}$ uses a different chemistry assumption than the one you
> think it does.

Typical values: 0.92–0.995. Below 0.92 something is genuinely wrong. Above 1.00
your reference is wrong, not your engine.

**$\eta_{c^*}$ is a wastebasket.** It lumps together at least four distinct
physical deficits that have completely different fixes:

1. **Incomplete mixing.** Unlike-propellant streams that never met. Fixed by
   injector pattern (Module 07). Signature: $\eta_{c^*}$ improves with chamber
   length ($L^*$), and streaking shows on the wall.
2. **Incomplete vaporisation.** Droplets that leave the throat still liquid.
   Signature: strong dependence on $L^*$ and on injection $\Delta p$; worse at
   low chamber pressure and with high-boiling fuels.
3. **Deliberate mixture-ratio maldistribution.** Fuel-film cooling puts a cold,
   very fuel-rich layer on the wall. That layer's $c^*$ is far below the core's,
   and the engine-average $\eta_{c^*}$ drops even though combustion in the core
   is perfect. The F-1 and the V-2 both paid several percent of $c^*$ for wall
   survival. [H]
4. **Reference-model error.** Frozen versus equilibrium, injector-face versus
   throat stagnation pressure, wrong $\gamma$, wrong $T_0$, unaccounted-for
   turbine exhaust in $\dot m$.

Item 4 is not a property of the engine at all, and it is the one that produces
$\eta_{c^*} > 1$. Try it: take the RS-25's published vacuum $I_{sp}$ of 452.3 s
and $\varepsilon = 69$, back out $c^*$ using an ideal frozen $C_F$, and compare
with a frozen ideal $c^*$ computed from $\gamma = 1.191$, $\mathcal{M} = 13.84$,
$T_0 = 3600$ K. You get $c^*_{delivered} = 2289$ m/s against $c^*_{ideal} = 2273$
m/s: $\eta_{c^*} = 1.007$. The engine has not broken thermodynamics. The
*frozen* reference is simply too low, because the real nozzle recovers a good
part of the recombination energy (§3.14) — and because the ideal $C_F$ used in the
back-out ignores divergence and boundary-layer losses, which inflates the
apparent $c^*$. **Always state the reference model alongside an efficiency.**
[F][J]

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| chamber stagnation temperature $T_0$ | 1200–3900 K | cold gas / monopropellant (Module 28: GN₂ at ~290 K) | LOX/LH₂ near stoichiometric, ~3890 K [A] |
| exhaust molar mass $\mathcal{M}$ | 9–30 kg/kmol | LOX/LH₂ at low MR (~9–12) | LOX/RP-1 (~21–23), N₂O₄/MMH (~21–24) |
| $\gamma$ (frozen, chamber) | 1.14–1.28 | AP/HTPB solid with Al₂O₃, ~1.15 | hydrazine products ~1.27–1.34; GN₂ cold gas 1.40 |
| specific gas constant $R$ | 280–900 J/(kg·K) | kerolox ~370–400 | LOX/LH₂ ~600–700 |
| chamber pressure $p_c$ | 5–270 bar | AJ10 SPS Apollo service module, ~6.9 bar; R-4D ~7 bar | RD-180 267 bar; RS-25 206.4 bar at 109 % [F-1 ≈70 bar] |
| contraction ratio $\varepsilon_c$ | 1.5–10 | large boosters, 2–3 | small thrusters, 5–10 |
| injector-face to throat-stagnation $p_0$ loss | 1–9 % | $\varepsilon_c \ge 4$: <1.5 % | $\varepsilon_c = 1.5$: >9 % |
| $c^*$ (ideal) | 1500–2400 m/s | solid AP/HTPB ~1550–1600 | LOX/LH₂ ~2280–2380 |
| $\eta_{c^*}$ | 0.92–0.995 | V-2, ~0.94 (quoted in the verification file); F-1 ~0.94 [A] | modern coaxial-injector hydrogen engines, >0.99 |
| frozen-to-equilibrium $I_{sp}$ gap | 1–5 % | storables at moderate $T_c$, 1–2 % | LOX/LH₂ at high $\varepsilon$, ~4 % |
| compressibility $Z$, GHe pressurant | 1.0–1.3 | low pressure | 300 bar / 300 K, ~1.2 [A][NIST-WB] |

Engine-specific figures in this table come from `reference/_verify-liquid.md`
and carry its caveats. In particular the F-1's chamber pressure is contested
across 965–1125 psia and this course prints ≈70 bar (1015 psia) injector-end;
the RS-25's expansion ratio is printed as 69:1 (the manufacturer's figure) with
the widely quoted 77.5:1 flagged as a different reference area. Temperature,
$\gamma$ and $\mathcal{M}$ figures are CEA-class computed values, not measured
engine data, and are labelled [A] wherever they appear.

---

## 5. Worked examples

Constants: $g_0 = 9.80665\ \mathrm{m/s^2}$, $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$.
All four examples are reproduced in `tools/examples/01.py` and recomputed by
`tools/rocket.py`.

### 5.1 Example 1 — Stagnation quantities in an RS-25-class chamber

**Given.** A LOX/LH₂ combustion chamber operating at the RS-25's 109 % power
level: injector-face pressure $p_{inj} = 206.4\ \mathrm{bar} = 2.064\times10^7$ Pa
(2994 psia, from the verification file; Wikipedia and L3Harris agree exactly on
this figure, which makes it one of the best-attested numbers in the engine
literature). Chamber stagnation temperature $T_0 = 3600$ K, gas properties
$\gamma = 1.1912$, $\mathcal{M} = 13.845$ kg/kmol (derived in Example 2).
Contraction ratio $\varepsilon_c = A_c/A_t = 3.0$ [J].

**Find.** Chamber-exit Mach number, static temperature and pressure, gas
velocity; then the injector-face to chamber-exit stagnation-pressure loss and
what it does to the choked mass flow.

**Step 1 — gas constant and $c_p$.**
$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46}{13.845} = 600.54\ \mathrm{J/(kg\,K)}$$
$$c_p = \frac{\gamma R}{\gamma-1} = \frac{1.1912\times600.54}{0.1912} = 3742.1\ \mathrm{J/(kg\,K)}$$

**Step 2 — chamber Mach number from the area ratio.** Invert
$A/A^* = \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$
for the **subsonic** root at $A/A^* = 3.0$
(`rocket.mach_from_area_ratio(1.1912, 3.0, supersonic=False)`):

$$M_2 = 0.2020$$

**Step 3 — static conditions at the chamber exit** (isentropic from the
stagnation state, Eqs. 3.6–3.7):

$$\frac{T_0}{T} = 1 + \frac{0.1912}{2}(0.2020)^2 = 1.003901 \;\Rightarrow\; T_2 = \frac{3600}{1.003901} = 3586.0\ \mathrm{K}$$
$$\frac{p_0}{p} = (1.003901)^{1.1912/0.1912} = 1.02455 \;\Rightarrow\; p_2^{isen} = \frac{206.4}{1.02455} = 201.45\ \mathrm{bar}$$

**Step 4 — velocity, and a check on the energy equation.**
$$a_2 = \sqrt{\gamma R T_2} = \sqrt{1.1912\times600.54\times3586.0} = 1601.6\ \mathrm{m/s}$$
$$V_2 = M_2 a_2 = 0.2020\times1601.6 = 323.5\ \mathrm{m/s}$$

Check against Eq. 3.4: $c_p(T_0 - T_2) = 3742.1\times(3600-3586.0) = 52\,337\ \mathrm{J/kg}$
and $V_2^2/2 = 323.5^2/2 = 52\,337\ \mathrm{J/kg}$ ✓. Units:
$\mathrm{J/kg = m^2/s^2}$.

**Step 5 — the real stagnation-pressure loss.** Step 3 assumed the contraction
was isentropic, which it is not: the acceleration was produced by heat release,
a Rayleigh process. Use the momentum balance of Eq. 3.8 instead:

$$p_2 = \frac{p_{inj}}{1+\gamma M_2^2} = \frac{206.4}{1 + 1.1912\times0.2020^2} = \frac{206.4}{1.04861} = 196.83\ \mathrm{bar}$$
$$p_{0,2} = p_2\left(1+\frac{\gamma-1}{2}M_2^2\right)^{\frac{\gamma}{\gamma-1}} = 196.83\times1.02455 = 201.67\ \mathrm{bar}$$

$$\frac{p_{0,2}}{p_{inj}} = 0.97706 \quad\Longrightarrow\quad \textbf{2.29 \% stagnation-pressure loss}$$

**Step 6 — throat conditions and the consequence.**
$$T^* = \frac{T_0}{1+\frac{\gamma-1}{2}} = \frac{3600}{1.0956} = 3285.9\ \mathrm{K},\qquad
p^* = \frac{p_{0,2}}{(1.0956)^{6.230}} = 114.2\ \mathrm{bar}$$

Choked mass flux $\dot m/A_t = \Gamma(\gamma)\,p_0/\sqrt{RT_0}$ is
9079.5 kg/(s·m²) if you use the injector-face pressure and 8871.3 kg/(s·m²) if
you use the correct throat stagnation pressure — a 2.29 % difference.

**Entropy accounting.** $s_{gen} = -R\ln(0.97706) = 13.94\ \mathrm{J/(kg\,K)}$.
This is the irreversibility of burning in a finite-area chamber; it is
unavoidable and it is why the contraction ratio is a design variable.

**Sanity check.** The static pressure a chamber-wall tap near the throat entrance
would read is 196.8 bar against 206.4 at the injector face — a 4.6 % axial
gradient, which is exactly the order of magnitude seen on instrumented chambers.
And the 2.3 % stagnation loss means a designer sizing $A_t$ from the *injector*
pressure would undersize the throat by 2.3 % and overshoot the target thrust by
about the same. That error is larger than most of the losses Module 09 spends a
chapter minimising.

### 5.2 Example 2 — Mixture properties of a LOX/LH₂ product gas

**Given.** A combustion-product composition representative of LOX/LH₂ at
MR = 6.0 and $p_c \approx 206$ bar, expressed as mole fractions
([CEA]-class values, illustrative — the point is the method):

| species | $x_i$ | $\mathcal{M}_i$ [kg/kmol] | $\bar c_{p,i}$ at 3600 K [J/(mol·K)] |
|---|---|---|---|
| H₂O | 0.7115 | 18.0153 | 57.6 |
| H₂ | 0.2490 | 2.0159 | 38.3 |
| OH | 0.0263 | 17.0073 | 37.4 |
| H | 0.0106 | 1.0079 | 20.786 |
| O | 0.0010 | 15.9994 | 20.9 |
| O₂ | 0.0016 | 31.9988 | 40.8 |

($\sum x_i = 1.0000$; molar $c_p$ values from [JANAF] at 3600 K; H is monatomic
so $\bar c_p = \tfrac52 R_u/1000 = 20.786$ exactly.)

**Find.** $\mathcal{M}$, $R$, $c_p$, $c_v$, $\gamma$, mass fractions, and $c^*$.

**Step 1 — molar mass** (Eq. 3.11, mole-weighted):

$$\mathcal{M} = \sum_i x_i\mathcal{M}_i$$

| species | $x_i\mathcal{M}_i$ | $Y_i = x_i\mathcal{M}_i/\mathcal{M}$ |
|---|---|---|
| H₂O | 12.8179 | 0.9258 |
| H₂ | 0.5020 | 0.0363 |
| OH | 0.4473 | 0.0323 |
| H | 0.0107 | 0.0008 |
| O | 0.0160 | 0.0012 |
| O₂ | 0.0512 | 0.0037 |
| **sum** | **13.845** | **1.0000** |

$$\mathcal{M} = 13.845\ \mathrm{kg/kmol}$$

Note the headline: hydrogen is a quarter of the mixture *by mole* and 3.6 % *by
mass*. This is the entire economic argument for hydrogen.

**Step 2 — gas constant.**
$$R = \frac{8314.46}{13.845} = 600.54\ \mathrm{J/(kg\,K)}$$

**Step 3 — molar and mass specific heat.**
$$\bar c_p = \sum_i x_i\bar c_{p,i}$$
$$= 0.7115(57.6) + 0.2490(38.3) + 0.0263(37.4) + 0.0106(20.786) + 0.0010(20.9) + 0.0016(40.8)$$
$$= 40.982 + 9.537 + 0.984 + 0.220 + 0.021 + 0.065 = 51.809\ \mathrm{J/(mol\,K)}$$

Convert to a mass basis. $\bar c_p$ is per **mole**; $\mathcal{M}$ is in kg per
**kmol**, i.e. g per mol:
$$c_p = \frac{51.809\ \mathrm{J/(mol\,K)}}{13.845\ \mathrm{g/mol}}\times 1000\ \mathrm{g/kg} = 3742.1\ \mathrm{J/(kg\,K)}$$

**Step 4 — $c_v$ and $\gamma$.**
$$c_v = c_p - R = 3742.1 - 600.5 = 3141.5\ \mathrm{J/(kg\,K)}$$
$$\gamma = \frac{c_p}{c_v} = \frac{3742.1}{3141.5} = \mathbf{1.1912}$$

**Step 5 — characteristic velocity.**
$$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}} = 0.6413$$
$$c^*_{ideal} = \frac{\sqrt{RT_0}}{\Gamma} = \frac{\sqrt{600.54\times3600}}{0.6413} = \frac{1470.4}{0.6413} = 2273\ \mathrm{m/s}$$

**Sanity check.** Published $\gamma$ for LOX/LH₂ chamber gas is 1.19–1.20 and
$\mathcal{M}$ is quoted between 13.5 and 13.9 depending on the source and the
exact MR and pressure; $c^*$ for the RS-25 is usually quoted near 2300 m/s. All
three land where they should. **The caveat that matters:** this $\gamma = 1.1912$
is the **frozen** ratio of specific heats — the mixture treated as chemically
inert. CEA also reports an *isentropic exponent* for the equilibrium mixture that
is lower (typically 1.13–1.15 for this gas) because re-equilibration adds an
extra energy-storage mode. They are different numbers for different purposes: use
the frozen $\gamma$ in the frozen relations, and CEA's equilibrium output for
equilibrium performance. Substituting one for the other is a common and
expensive mistake.

### 5.3 Example 3 — Adiabatic flame temperature of H₂/O₂, dissociation neglected

**Given.** LOX/LH₂ at mixture ratio $r = 6.0$ (mass basis), constant pressure,
adiabatic, and — the assumption under test — **complete reaction to H₂O and
excess H₂ only, no dissociation.**

**Step 1 — stoichiometry per mole of H₂.**
$$n_{O_2} = r\,\frac{\mathcal{M}_{H_2}}{\mathcal{M}_{O_2}} = 6.0\times\frac{2.0159}{31.9988} = 0.37800\ \mathrm{mol\ O_2\ per\ mol\ H_2}$$

Stoichiometric would be 0.5, so this is fuel-rich (equivalence ratio 1.32).
Oxygen is fully consumed:
$$\mathrm{H_2} + 0.378\,\mathrm{O_2} \rightarrow 0.756\,\mathrm{H_2O} + 0.244\,\mathrm{H_2}$$

Element check — H: $2(0.756) + 2(0.244) = 2.000$ ✓; O: $0.756 = 2(0.378)$ ✓.

**Step 2 — energy released.** With $\Delta_f H^\circ(\mathrm{H_2O,g}) =
-241.826\ \mathrm{kJ/mol}$ and zero for H₂ and O₂ [JANAF]:
$$Q = 0.75599\times241.826 = 182.82\ \mathrm{kJ}\ \text{per mole of H}_2\ \text{burned}$$

**Step 3 — case (a): reactants enter as gases at 298.15 K.** Solve
$$0.75599\left[H_{H_2O}(T)-H_{H_2O}(298)\right] + 0.24401\left[H_{H_2}(T)-H_{H_2}(298)\right] = 182.82\ \mathrm{kJ}$$
using [JANAF] sensible enthalpies (kJ/mol):

| $T$ [K] | H₂O | H₂ | LHS [kJ] |
|---|---|---|---|
| 3500 | 154.768 | 107.555 | 143.25 |
| 4000 | 183.463 | 126.846 | 169.65 |
| 4250 | ~198.03 | ~136.72 | 183.07 |
| 4500 | ~212.6 | ~146.6 | 196.50 |

Interpolating to LHS = 182.82:
$$\boxed{T_{ad} = 4245\ \mathrm{K}}$$

**Step 4 — case (b): reactants enter as cryogenic liquids.** LH₂ at 20.3 K and
LOX at 90.2 K carry enthalpies of formation of roughly $-9.012$ and
$-12.979\ \mathrm{kJ/mol}$ relative to the 298 K gaseous references
[CEA][NIST-WB]. Reactant enthalpy per mole of H₂:
$$1(-9.012) + 0.378(-12.979) = -13.918\ \mathrm{kJ}$$
so only $182.82 - 13.92 = 168.90\ \mathrm{kJ}$ is available for heating products:
$$\boxed{T_{ad} = 3986\ \mathrm{K}}$$

**Step 5 — compare with reality.** CEA with equilibrium chemistry at these
conditions gives a chamber temperature near **3600 K** for LOX/LH₂ at MR 6 and
$p_c \approx 200$ bar; that is also the value commonly quoted for the RS-25.
(This figure is *not* in `reference/_verify-liquid.md`, which does not publish
chamber temperatures; it is a CEA-class value and should be regenerated in
Module 04 before being used for design.)

| model | $T$ [K] | error vs equilibrium |
|---|---|---|
| no dissociation, 298 K gaseous reactants | 4245 | +645 K (+18 %) |
| no dissociation, cryogenic liquid reactants | 3986 | +386 K (+11 %) |
| equilibrium (CEA-class) | ~3600 | — |

**Sanity check and the lesson.** Two separate errors, each worth hundreds of
kelvin, and they have different characters. The cryogenic-enthalpy term is a
bookkeeping omission — it is exactly calculable and there is no excuse for it.
The remaining 386 K is **physics**: about 5 % of the product moles at 3600 K are
H, OH, O and O₂, and the energy required to make them was taken out of the flame.
Notice also that the no-dissociation product mixture has
$\mathcal{M} = 14.11$ kg/kmol against 13.845 for the equilibrium mixture — so
neglecting dissociation gets the temperature *and* the molar mass wrong in the
same direction that partially cancels in $c^* \propto \sqrt{T_0/\mathcal{M}}$:
$\sqrt{3986/14.11} = 16.81$ against $\sqrt{3600/13.845} = 16.12$, still a 4.3 %
$c^*$ overestimate. **Errors in $T_0$ and $\mathcal{M}$ partially cancel in
performance but not enough to ignore, and they do not cancel at all in the heat
flux, which sees $T_0$ directly.** [F]

Repeat this exercise at MR 4.0 (Problem C4) and the gap shrinks to under 100 K,
because the flame is 1000 K cooler and dissociation is a strong function of
temperature. That is the shape of the whole phenomenon.

### 5.4 Example 4 — Frozen versus equilibrium $I_{sp}$

**Given.** The chamber gas of Example 2 ($\gamma = 1.1912$,
$\mathcal{M} = 13.845$, $R = 600.54$ J/(kg·K), $T_0 = 3600$ K), expanded from
$p_0 = 206.4$ bar through $\varepsilon = 69$ (the RS-25's geometric area ratio
per the manufacturer's datasheet; note that ~77.5:1 is widely quoted against a
different reference area — see the verification file) into vacuum.

**Step 1 — frozen expansion, calorically perfect.** Invert the area-Mach
relation for the supersonic root at $\varepsilon = 69$:
$$M_e = 4.5615,\qquad \frac{p_0}{p_e} = 918.2 \Rightarrow p_e = 22\,480\ \mathrm{Pa} = 0.2248\ \mathrm{bar},\qquad T_e = 1204.5\ \mathrm{K}$$
$$V_e = \sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]} = 4234.0\ \mathrm{m/s}$$
$$C_{F,vac} = 1.9377,\qquad c^*_{ideal} = 2273\ \mathrm{m/s}$$
$$c = c^*C_F = 4405\ \mathrm{m/s} \Rightarrow \boxed{I_{sp,frozen} = \frac{4405}{9.80665} = 449.2\ \mathrm{s}}$$

**Step 2 — how much chemical energy is still in the gas?** Compute the mixture's
enthalpy of formation per mole of mixture, then the enthalpy of formation of the
same elements fully recombined.

Chamber, using $\Delta_f H^\circ$ [kJ/mol]: H₂O −241.826, H₂ 0, OH +38.987,
H +217.998, O +249.180, O₂ 0:
$$H_f^{chamber} = 0.7115(-241.826)+0.0263(38.987)+0.0106(217.998)+0.0010(249.180) = -168.474\ \mathrm{kJ/mol_{mix}}$$

Element inventory per mole of mixture:
$$n_H = 2(0.7115)+2(0.2490)+0.0263+0.0106 = 1.9579,\qquad n_O = 0.7115+0.0263+0.0010+2(0.0016) = 0.7420$$

Fuel-rich, so all oxygen ends as water:
$$0.7420\ \mathrm{H_2O} + \tfrac12(1.9579 - 1.4840) = 0.7420\ \mathrm{H_2O} + 0.2369\ \mathrm{H_2},\quad n_{tot} = 0.9789$$
$$H_f^{recombined} = 0.7420(-241.826) = -179.435\ \mathrm{kJ/mol_{mix}}$$

$$\Delta h_{chem} = -168.474 - (-179.435) = 10.961\ \mathrm{kJ/mol_{mix}}
= \frac{10\,961\ \mathrm{J/mol}}{0.013845\ \mathrm{kg/mol}} = \mathbf{0.792\ MJ/kg}$$

Also note $\mathcal{M}$ rises to $13.845/0.9789 = 14.14$ kg/kmol on full
recombination — the penalty that partly offsets the energy gain.

**Step 3 — bound the equilibrium performance.** If every joule of that were
released and converted to directed kinetic energy,
$$c_{eq} = \sqrt{c_{frozen}^2 + 2\Delta h_{chem}} = \sqrt{4405^2 + 2(0.792\times10^6)} = 4581\ \mathrm{m/s}$$
$$I_{sp,eq}^{max} = 467.2\ \mathrm{s}$$

| recombination completeness | $c$ [m/s] | $I_{sp}$ [s] | gain over frozen |
|---|---|---|---|
| 0 % (frozen) | 4405 | 449.2 | — |
| 60 % | 4512 | 460.1 | +10.9 s |
| 80 % | 4547 | 463.6 | +14.4 s |
| 100 % (equilibrium bound) | 4581 | 467.2 | +18.0 s |

**Step 4 — reality check against the engine.** The RS-25's published vacuum
specific impulse is **452.3 s** (verification file; L3Harris rounds to 452).
That sits between the frozen ideal (449.2 s) and the equilibrium bound (467.2 s),
much closer to the frozen end — but that comparison is doing more work than it
looks, because the *delivered* value already carries every real loss the ideal
calculation omits: divergence, boundary layer, finite-rate kinetics, injector
mixing, and the film-cooled wall layer. A defensible reading is: ideal
equilibrium is around 460–467 s, the engine delivers 452.3 s, and the
2–3 % shortfall is the sum of the real losses. [J]

**Sanity check and the honest caveat.** The frozen number here, 449.2 s, is
computed with $c_p$ evaluated at 3600 K and held constant all the way to 1205 K,
where the real $c_p$ of this mixture is about 15 % lower. That calorically
perfect assumption overstates the recoverable enthalpy; a thermally perfect
calculation with tabulated $c_p(T)$ moves the frozen answer by a few seconds,
not by tens, because the exit temperature also shifts and the two effects partly
cancel. [A] The purpose of this hand calculation is to establish the *size* of
the frozen-to-equilibrium gap — about 4 % for a hydrogen engine at high area
ratio — and to show where it comes from. For a number that goes into a design,
run CEA both ways (Module 04) and apply a JANNAF kinetic-loss factor
[CPIA-246].

---

## 6. Real engines: why did they design it that way?

### 6.1 Rocketdyne F-1 (Saturn V S-IC, first flight 1967) — the fuel-rich kerolox compromise [H]

The F-1 burns LOX/RP-1 at **MR 2.27**, against a stoichiometric ratio near 3.4.
That is an equivalence ratio of about 1.5 — deeply fuel-rich, and it costs
flame temperature.

The thermodynamic reasons are three, and they compound. First, molar mass: rich
kerolox produces CO ($\mathcal{M} = 28$) and H₂ ($\mathcal{M} = 2$) rather than
CO₂ (44) and H₂O (18), so the mixture's $\mathcal{M}$ falls toward ~21–23 kg/kmol
and $c^* \propto \sqrt{T_0/\mathcal{M}}$ is helped on the denominator even as the
numerator drops. Second, dissociation: at stoichiometric the flame would be hot
enough that a substantial fraction of the energy would go into breaking bonds
rather than raising temperature, so the marginal return on moving toward
stoichiometric is much less than the no-dissociation calculation suggests.
Third, and decisively for 1962: **wall temperature**. The F-1's chamber is a
178-tube brazed regenerative wall with the gas generator's fuel-rich exhaust
dumped as a film-cooling curtain over the nozzle extension. That architecture
survives because the core gas is not as hot as it could be.

The price is visible in the efficiency. Backing out $c^*$ from the published
sea-level $I_{sp}$ of 263 s at $\varepsilon = 16$ and $p_c \approx 70$ bar, with
an ideal $C_F$ for $\gamma = 1.22$, gives $c^*_{delivered} \approx 1663$ m/s
against an ideal $c^*$ of about 1772 m/s for a CEA-class $T_0 \approx 3570$ K and
$\mathcal{M} \approx 22.2$: $\eta_{c^*} \approx 0.94$. [A] Some of that 6 % is
genuine mixing and vaporisation loss in an injector that took roughly 2000 tests
and 210 designs to stabilise; a large part of it is the deliberate fuel-rich
film layer on the wall, which is a *design choice showing up as an efficiency
number*. That is §3.17's point made concrete.

**Would a modern engineer do the same?** For an expendable kerolox booster,
largely yes — the MR would move up slightly (Merlin and RD-180 class engines run
richer than stoichiometric but less extreme), the chamber pressure would triple,
and the film-cooling fraction would fall because modern channel-wall
manufacturing and copper-alloy liners take more heat flux. The fuel-rich choice
itself is not obsolete; the *amount* of it is.

### 6.2 Aerojet Rocketdyne RS-25 (Shuttle, 1981; now SLS) — MR 6.03 and the tank-volume argument [H][M]

The RS-25 runs LOX/LH₂ at **MR 6.03** and 206.4 bar. Section 3.16's table says
$c^*$ peaks near MR 4. So the engine is deliberately about 2 MR units away from
its own $I_{sp}$ optimum, giving up perhaps 5–8 seconds.

It buys three things. **Tank volume**: at MR 4 the vehicle carries 50 % more
hydrogen by mass, in a propellant with a density of 70.8 kg/m³ — the External
Tank was already 8.4 m in diameter and most of the stack's length. **Chamber
temperature and heat flux**, which at MR 4 would actually be *lower* — that one
works against the argument, and is a real cost of running at 6.03: the NARloy-Z
liner with 390 milled channels and an electroformed nickel closeout exists
because of it. **Turbomachinery**: less hydrogen means smaller hydrogen pumps,
and hydrogen pumps are the hard ones — the HPFTP is a three-stage centrifugal
machine at 35,360 rpm absorbing 53 MW.

The 206.4 bar chamber pressure is likewise not about temperature. Per §3.15, the
temperature gain from 100 bar to 206 bar is under 100 K. What 206 bar buys is
$C_F$: a bigger pressure ratio into the same nozzle, permitting $\varepsilon = 69$
inside the orbiter's base area. The cost is a heat flux scaling as roughly
$p_c^{0.8}$ and a fuel-rich staged-combustion cycle with two preburners.

**Would a modern engineer do the same?** For a reusable hydrogen core engine,
probably not at that pressure — the RS-25 is now flown expendably on SLS, which
is a fair verdict on how much the reusability premise justified the complexity.
But the MR choice would survive essentially unchanged, because the tank-volume
physics has not changed.

### 6.3 Pratt & Whitney RL10A-3-3A (Centaur, 1962 family) — MR 5.0 and the low-pressure expander [H]

The RL10 runs the same propellants at **MR 5.0** and only **32.8 bar**, and
reaches 444–445 s vacuum at $\varepsilon = 61$.

Both numbers are set by the mission and the cycle, not by thermodynamics alone.
Being an upper stage, $I_{sp}$ dominates and stage volume is a weaker constraint,
so the MR moves down toward the $c^*$ optimum. Being a **closed expander**, the
chamber pressure is capped by the heat balance: all the turbine power comes from
heat picked up in the chamber wall, which scales with wetted area ($\propto D^2$)
while thrust scales with throat area — so $p_c$ has a hard ceiling. 32.8 bar is
where that balance closed for a 73.4 kN engine in 1958-era materials.

The thermodynamic consequence that matters for this module: at 32.8 bar,
dissociation is roughly 1.8× worse than at 206 bar (§3.13), so the RL10's
chamber sits further from its no-dissociation flame temperature than the RS-25's
does. It still reaches 444 s because $\varepsilon = 61$ and a low MR give it a
low-$\mathcal{M}$, high-$C_F$ expansion — and because a hydrogen nozzle expanding
into vacuum recovers a good fraction of the recombination energy on the way out.
**The RL10 is the clearest demonstration in the fleet that chamber pressure is
not what makes specific impulse.**

**Would a modern engineer do the same?** Yes, and they do: the RL10 has been in
continuous production for over six decades, and Vinci and RD-0146 are the same
architecture. The limitation is thrust, not efficiency, which is why scaling up
requires expander bleed or a preburner.

### 6.4 Where dissociation actually drives the optimum mixture ratio [F]

Put §3.15 and §3.16 together. If there were no dissociation, the flame
temperature would rise monotonically to stoichiometric and the $c^*$ optimum
would sit closer to it. Dissociation caps the temperature exactly where the
temperature is highest — i.e. near stoichiometric — flattening the top of the
$T_c$ curve and pushing its peak slightly rich. The $c^*$ optimum, already fuel-
rich because of $\mathcal{M}$, moves *further* rich because the marginal
temperature gain from adding oxidiser is being eaten by dissociation.

The magnitude is propellant-dependent:

- **LOX/LH₂**: strong effect. Stoichiometric 7.94, $T_c$ peak near 7.5–8,
  $c^*$ optimum near 4, engines fly at 5.0–6.0. [A]
- **LOX/RP-1**: moderate. Stoichiometric ~3.4, engines fly at 2.2–2.7. Much of
  that offset is soot and wall-temperature management as well as dissociation.
- **N₂O₄/MMH storables**: mild. $T_c \approx 3000$ K is cool enough that
  dissociation is a small correction, and engines fly close to 1.6–2.0 against a
  stoichiometric near 2.5.
- **Cold gas** (Module 28): none. There is no chemistry, $T_0$ is whatever the
  tank is at, and $I_{sp}$ is set entirely by $\sqrt{T_0/\mathcal{M}}$ — which is
  why cold-gas systems use helium or hydrogen when they can afford the tankage
  and nitrogen when they cannot.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 Trade-offs owned by this module

| decision | pulls one way | pulls the other | who usually wins |
|---|---|---|---|
| mixture ratio | high MR: less tank volume, smaller H₂ pumps | low MR: higher $c^*$, cooler wall | mission-dependent; core stages go high, upper stages go low |
| chamber pressure | high: better $C_F$, smaller engine, larger $\varepsilon$ in a given base area | high: heat flux $\propto p_c^{0.8}$, heavier structure, harder cycle | $p_c$ rises until the cooling or the turbopump says stop |
| contraction ratio | high: lower $p_0$ loss, lower gas velocity at the injector | high: bigger, heavier chamber, more wall area to cool | 2.5–4 for large engines; smaller engines run higher |
| film cooling fraction | more: wall survives | more: $\eta_{c^*}$ falls, directly | set by liner temperature limit, then minimised |

### 7.2 Failure modes traceable to a thermodynamic modelling error

**Throat sized on the wrong chamber pressure.** *Mechanism:* $A_t$ computed from
injector-face $p_c$ where the correct quantity is throat stagnation pressure, or
vice versa. *Symptom:* delivered thrust off target by 2–5 % at the correct
propellant flow; $\eta_{c^*}$ apparently >1 or absurdly low. *Evidence:* the
error is a fixed multiplicative factor, identical across the throttle range, and
matches Eq. 3.8 evaluated at the engine's contraction ratio. *Fix:* state the
measurement station on every pressure in the data reduction, and correct with
Eq. 3.8.

**Pressurant bottle sized with the ideal gas law.** *Mechanism:* $Z \approx 1.2$
for helium at 300 bar ignored. *Symptom:* tank pressure decays faster than
predicted; the last few percent of propellant is unusable. *Evidence:* blowdown
curve departs from prediction increasingly as the bottle empties and cools.
*Fix:* real-gas properties [NIST-WB], and a thermal model of the bottle — the
gas also cools as it expands, which is a second, larger error (Module 12).

**Frozen reference used to grade an engine that runs near equilibrium.**
*Mechanism:* §3.17 item 4. *Symptom:* $\eta_{c^*} > 1$. *Evidence:* recompute
against an equilibrium reference and the number falls below 1. *Fix:* state the
chemistry model with every efficiency.

**Adiabatic flame temperature used for the wall heat load.** *Mechanism:* using
Eq. 3.13 without dissociation gives a $T_0$ several hundred kelvin too high, and
the recovery temperature drives heat flux linearly. *Symptom:* the cooling
circuit is over-designed (expensive) or, if a different error goes the other
way, under-designed (liner burn-through). *Fix:* CEA, and Module 10's recovery
factor.

### 7.3 Materials, manufacturing, testing

This module's content is mostly upstream of hardware, but three connections are
worth flagging now.

**Materials.** The liner material choice is a direct consequence of $T_0$ and
$p_c$. NARloy-Z (Cu–Ag–Zr) on the RS-25 exists because 206 bar at ~3600 K
produces a heat flux that only a high-conductivity copper alloy can conduct away
fast enough to keep the hot-gas-side wall below its limit. Every kelvin of $T_0$
you accept in the mixture-ratio trade lands on that alloy.

**Manufacturing.** Contraction ratio is not free: raising $\varepsilon_c$ to cut
the Eq. 3.8 loss makes the chamber larger, which means more milled channels
(390 on the RS-25 main combustion chamber), more braze joints, more mass. Modern
additive manufacturing changes the cost curve here but not the physics
[GradlAM].

**Testing.** What is actually measured is $p_c$ at one or two taps, propellant
flows from turbine or venturi meters, thrust from a load cell, and — if you are
lucky — a throat area from a pre-test and post-test measurement. **$T_0$ is
essentially never measured directly**; thermocouples do not survive, and optical
methods give you a line-of-sight average of a radiating, sooting, non-uniform
gas. Chamber temperature in every engine table you will ever read is a *computed*
number. Treat it accordingly: it inherits every assumption in the thermochemical
model. Module 18 covers the instrumentation and the uncertainty propagation.

---

## 8. Misconceptions and what engineers actually care about

**"Stagnation pressure is conserved in adiabatic flow."** No — stagnation
*enthalpy* is. $p_0$ falls whenever entropy is generated, which is everywhere
real. Eq. 3.5 makes the two statements identical: a 2 % $p_0$ loss *is*
12 J/(kg·K) of entropy generation.

**"Higher chamber pressure means a hotter chamber, which means more $I_{sp}$."**
Pressure raises $T_c$ only weakly and with saturating returns ($\alpha \propto
p^{-1/3}$), and $c^*$ depends on $\sqrt{T_0}$, so the effect is doubly damped.
Chamber pressure buys $I_{sp}$ through the nozzle pressure ratio and through
permitting a larger $\varepsilon$ in a given envelope.

**"Run at stoichiometric for maximum performance."** Maximum *temperature*, not
maximum performance. $c^* \propto \sqrt{T_0/\mathcal{M}}$, and running fuel-rich
lowers $\mathcal{M}$ faster than it lowers $T_0$ for hydrogen — and it protects
the wall. Every flying bipropellant engine runs fuel-rich.

**"$\gamma$ is 1.4."** That is diatomic gas at room temperature. Rocket exhaust
is 1.14–1.25 because it is hot and polyatomic with vibrational modes excited.
Using 1.4 in a nozzle calculation errs $C_F$ by several percent and $A/A^*$ by
much more.

**"The frozen $\gamma$ from the mixture is the isentropic exponent."** Only for
frozen flow. In an equilibrium expansion the composition shifts, adding an energy
storage mode, and the effective isentropic exponent is lower — for the mixture of
§5.2, roughly 1.13–1.15 versus a frozen 1.19. CEA reports both; they are not
interchangeable.

**"An adiabatic flame temperature calculation with a balanced equation gives the
chamber temperature."** It gives an upper bound that is 300–700 K too high for
hydrogen or kerosene flames, because 4–6 % of the product moles are dissociated
radicals whose formation absorbed energy. The error shrinks fast as the flame
cools.

**"$\eta_{c^*}$ measures how well the propellants burned."** It measures the
ratio of a measured quantity to a modelled one. Change the model — frozen to
equilibrium, injector-face to throat stagnation, $\dot m$ with or without film
coolant — and the number moves by several percent without any hardware changing.

**"Thrust comes from the exhaust pushing against the atmosphere."** Thrust is the
integral of $(p_i - p_a)$ over the internal wetted surface; the atmosphere only
appears as the $-p_aA_e$ term, which *reduces* thrust. Rockets work better in
vacuum.

### What engineers actually care about

1. **$c^*$ and $\eta_{c^*}$, and which reference model produced them.** This is
   the daily currency of combustion-device development. Every test report opens
   with it, and every argument about whether an injector change helped is an
   argument about $\eta_{c^*}$ inside its uncertainty band.
2. **$T_0$ and its uncertainty**, because it sets the heat load, which sets the
   liner, which sets the whole cooling architecture and a large fraction of the
   engine's cost.
3. **$\mathcal{M}$ and $\gamma$ of the product gas**, because they set $c^*$ and
   $C_F$ respectively, and because they are the inputs everyone borrows from
   someone else's CEA run without checking the mixture ratio it was run at.
4. **Which pressure a datasheet means.** A propulsion engineer reading a
   competitor's or a heritage engine's numbers spends real time working out
   whether $p_c$ is injector-face or throat stagnation before comparing anything.
5. **Where the flow froze.** For any high-area-ratio engine, the kinetic loss
   between equilibrium and delivered $I_{sp}$ is worth several seconds and is the
   difference between a performance prediction that lands and one that does not.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can state the three conservation laws in
control-volume form and say what each is used for in an engine. You can explain
in plain language why stagnation enthalpy is conserved in a nozzle but stagnation
pressure is not, why rocket exhaust has $\gamma$ near 1.2 rather than 1.4, and
why engines run fuel-rich. You can name two engines with different mixture ratios
and say why they differ.

**Level 2 — Working engineering knowledge.** Given mole fractions you compute
$\mathcal{M}$, $R$, $c_p$, $\gamma$ and $c^*$ with correct units. Given
$p_{inj}$, $\gamma$ and $\varepsilon_c$ you compute the chamber Mach number and
the injector-to-throat stagnation-pressure loss, and you correct a published
$p_c$ between conventions. You set up and solve an adiabatic-flame-temperature
balance including the cryogenic reactant enthalpy, and you can say how far the
answer is from equilibrium and why. You quote typical ranges for $T_0$,
$\mathcal{M}$, $\gamma$, $p_c$, $\eta_{c^*}$ from memory and you know which
assumption fails first at each station of the engine.

**Level 3 — Interview mastery.** Given an unfamiliar engine's datasheet you can
say which pressure convention it probably used and how you would confirm it; you
can look at an $\eta_{c^*}$ of 1.02 and diagnose the reference-model error rather
than the hardware; you can argue both sides of a mixture-ratio choice for a
specified vehicle and say what you would compute to settle it; you can estimate
the frozen-to-equilibrium spread for a propellant you have not used before from
its flame temperature and product species, and say where in the nozzle you expect
the chemistry to freeze and what that costs.

---

## 10. Problems

### Conceptual

**P1.** A nozzle is adiabatic but has significant wall friction. State what
happens to $h_0$, $T_0$, $p_0$ and $s$ between the throat and the exit, and give
the reason for each in one sentence.

**P2.** Explain, without algebra, why enthalpy rather than internal energy is the
natural energy variable for a flow device. Then estimate the flow-work term
$p/\rho$ as a fraction of $h$ for an LOX/LH₂ chamber gas at 3600 K,
$\mathcal{M} = 13.845$, $c_p = 3742$ J/(kg·K), taking $h = c_pT$.

**P3.** Two engines have identical $\gamma$, $\mathcal{M}$ and $T_0$, but one has
$\varepsilon_c = 1.8$ and the other $\varepsilon_c = 4.0$. Both quote the same
injector-face chamber pressure. Which delivers more thrust for the same throat
area, and by roughly what percentage?

**P4.** A colleague computes an adiabatic flame temperature of 4245 K for
LOX/LH₂ at MR 6 and proposes it as the input to the regenerative-cooling
analysis. Give three separate reasons the number is wrong and rank them by
magnitude.

**P5.** Why does raising chamber pressure suppress dissociation? Answer twice:
once with Le Chatelier's principle in words, once with the $K_p$ expression.

**P6.** A test report gives $\eta_{c^*} = 1.02$ for a LOX/LH₂ engine. List four
distinct explanations, and for each state the single measurement or recomputation
that would confirm or eliminate it.

**P7.** An engineer argues that a cold-gas thruster should use argon rather than
helium because argon has $\gamma = 1.667$, the same as helium, and is far cheaper
and denser. Evaluate the argument thermodynamically.

**P8.** In §3.14 the fully recombined exit mixture has a *higher* molar mass than
the chamber mixture. Explain physically why recombination raises $\mathcal{M}$,
and say whether this helps or hurts $I_{sp}$ and why the net effect is still
positive.

### Calculation

**C1.** A kerolox product gas has $\gamma = 1.22$ and $\mathcal{M} = 22.2$
kg/kmol. Compute $R$, $c_p$ and $c_v$, and verify $c_p - c_v = R$.

**C2.** A chamber operates with $\gamma = 1.20$, $\mathcal{M} = 22.0$ kg/kmol,
$T_0 = 3400$ K, injector-face pressure 70 bar, contraction ratio $\varepsilon_c
= 2.0$. Compute (a) the chamber-exit Mach number; (b) static temperature and
pressure there; (c) the gas velocity; (d) the injector-face to chamber-exit
stagnation-pressure loss in percent; (e) the entropy generated per kilogram;
(f) the ideal $c^*$. Comment on how (d) compares with the $\varepsilon_c = 3.0$
case in §5.1.

**C3.** A LOX/RP-1 product mixture has mole fractions H₂O 0.30, CO 0.24, CO₂
0.16, H₂ 0.20, OH 0.04, H 0.03, O₂ 0.01, O 0.02. Using molar specific heats at
3500 K of H₂O 57.6, CO 36.5, CO₂ 61.0, H₂ 38.3, OH 37.4, H 20.786, O₂ 40.8, O
20.9 J/(mol·K), compute $\mathcal{M}$, all eight mass fractions, $R$, $c_p$,
$c_v$, $\gamma$, and $c^*_{ideal}$ at $T_0 = 3500$ K. Compare $\mathcal{M}$ and
$\gamma$ with the LOX/LH₂ values of §5.2 and say what each difference does to
performance.

**C4.** Repeat Example 3 at MR = 4.0 for both the 298 K gaseous-reactant case and
the cryogenic-liquid case. Compare the cryogenic result with a CEA-class
equilibrium value of ~2980 K and state, with a physical reason, why the
no-dissociation error is smaller here than at MR 6.

**C5.** For the H₂O dissociation equilibrium at 3600 K,
$\Delta G^\circ = +41.0$ kJ/mol. (a) Compute $K_p$. (b) Use the small-$\alpha$
form of Eq. 3.16 to estimate $\alpha$ at 32.8 bar and at 206.4 bar. (c) Compute
the exact $\alpha$ at both pressures from the full expression and quantify the
error of the approximation. (d) State what the result implies about comparing the
RL10's and the RS-25's chamber temperatures.

**C6.** A hot-fire test gives: throat area $A_t = 0.0500$ m², injector-face
chamber pressure 100 bar, total propellant flow 290.0 kg/s. The propellant is
predicted by CEA to give $T_0 = 3500$ K, $\mathcal{M} = 21.0$ kg/kmol,
$\gamma = 1.20$. (a) Compute $c^*_{delivered}$ and $\eta_{c^*}$ as reported.
(b) The chamber has $\varepsilon_c = 2.5$. Correct the chamber pressure to throat
stagnation and recompute $\eta_{c^*}$. (c) Which of the two numbers would you put
in a report, and what would you write next to it?

**C7.** Using the RS-25 gas of §5.2 and Example 4's exit conditions, compute the
$I_{sp}$ penalty of a 4 % stagnation-pressure loss occurring entirely inside the
divergent section at fixed exit pressure. Do it twice: directly from the exit-
velocity relation, and via Gouy–Stodola with $T_e = 1205$ K. Comment on the
agreement.

### Engineering reasoning

**R1.** You are handed two datasheets for the same engine from different decades.
One gives $p_c = 206$ bar and $\varepsilon = 69$; the other gives $p_c = 200$ bar
and $\varepsilon = 77.5$. Both quote the same thrust and $I_{sp}$. Explain what is
most likely going on, and describe the single calculation you would perform to
test your explanation.

**R2.** A development programme is choosing between raising chamber pressure from
100 to 150 bar and raising expansion ratio from 40 to 60, at fixed thrust. Argue
each side on thermodynamic grounds only, then say what non-thermodynamic
constraint most likely decides it and why.

**R3.** A hot-fire campaign shows $\eta_{c^*}$ rising from 0.93 to 0.97 as the
chamber is lengthened from $L^* = 0.8$ m to $L^* = 1.4$ m, then flattening.
Interpret the shape of that curve. What loss mechanism dominates at the low end,
what remains at the high end, and what would you measure next?

**R4.** A test plot shows chamber pressure at the injector face and at a tap
just upstream of the throat, over a throttle ramp from 60 % to 105 %. The
difference between the two taps grows from 3.5 % to 4.9 % of the injector value
across the ramp. Is this consistent with the theory of §3.8? What would make the
difference *shrink* with increasing power level, and would that worry you?

**R5.** An upper-stage engine using storable N₂O₄/MMH delivers a vacuum $I_{sp}$
within 1 % of its CEA equilibrium prediction, while a LOX/LH₂ engine of similar
area ratio falls 3 % short. Both have excellent injectors. Give the most likely
physical explanation and say what you would compute to confirm it.

### Mini trade study

**T1.** You are setting the nominal mixture ratio for a new LOX/LH₂ **upper-stage**
engine, 100 kN vacuum thrust, $\varepsilon = 80$, closed expander cycle, for a
launch vehicle whose fairing diameter is fixed and whose stage length is already
at the limit the structure can take. Candidate mixture ratios: **4.5, 5.0, 5.5,
6.0**.

Using §3.16, Example 2's method, and the engine data in
`reference/_verify-liquid.md`, produce a recommendation. You must address, with
numbers or explicit reasoning: (i) the $c^*$ and hence $I_{sp}$ variation across
the range; (ii) the propellant bulk density and hence tank volume variation;
(iii) the chamber temperature and its effect on the wall, remembering that a
closed expander needs a *specified* heat pickup in the chamber wall to run its
turbine at all; (iv) the hydrogen pump size and speed; (v) what would change your
recommendation if the same engine were a booster-stage engine instead. State
which constraint you regard as binding and what you would compute or test next to
retire the biggest uncertainty.

---

## 11. Quiz (100 points)

**Q1 (6).** In steady adiabatic flow with no shaft work, which of the following
is exactly conserved regardless of friction?
(a) $T_0$  (b) $p_0$  (c) $h_0$  (d) $s$

**Q2 (6).** A rocket exhaust has $\gamma = 1.18$ rather than air's 1.40 mainly
because:
(a) it is at much higher pressure
(b) it is hot and polyatomic, so vibrational modes are excited
(c) it has a lower molar mass
(d) it is a mixture rather than a pure substance

**Q3 (8).** A gas with $\gamma = 1.20$ flows at $M = 0.30$. Compute $T_0/T$ and
$p_0/p$ to four significant figures.

**Q4 (10).** A chamber with $\varepsilon_c = 2.5$ and $\gamma = 1.21$ has an
injector-face pressure of 120 bar. Compute the throat stagnation pressure and
state the percentage loss. Show the chamber-exit Mach number you used.

**Q5 (10).** A product mixture is 60 % H₂O, 30 % H₂, 10 % OH by **mole**.
Compute $\mathcal{M}$ and the mass fraction of H₂. (Molar masses: 18.0153,
2.0159, 17.0073 kg/kmol.)

**Q6 (10).** Using the mixture of Q5 with molar $c_p$ values 57.6, 38.3 and 37.4
J/(mol·K), compute $c_p$ in J/(kg·K), $R$, and $\gamma$.

**Q7 (12).** For $\mathrm{H_2O \rightleftharpoons H_2 + \tfrac12 O_2}$, the
degree of dissociation of an initially pure H₂O charge is 0.082 at 206 bar.
(a) Estimate it at 25 bar using the small-$\alpha$ scaling. (b) State one reason
the estimate is optimistic and one reason a real fuel-rich rocket chamber
dissociates *less* than this calculation predicts at either pressure.

**Q8 (12).** An engine test gives $A_t = 0.030$ m², injector-face $p_c = 85$ bar,
$\dot m = 145$ kg/s, and CEA predicts $c^*_{ideal} = 1830$ m/s. The contraction
ratio is 3.5 and $\gamma = 1.21$. Compute $\eta_{c^*}$ (a) as naively reported
and (b) with the pressure corrected to throat stagnation. Which do you report and
why?

**Q9 (13).** A LOX/LH₂ engine's chamber gas stores 0.65 MJ/kg of chemical energy
in dissociated species. Its frozen ideal vacuum $I_{sp}$ at the design area ratio
is 441 s. (a) Compute the equilibrium upper bound on $I_{sp}$. (b) The engine
delivers 448 s. Estimate what fraction of the recombination energy the nozzle
recovered, assuming for this estimate that all other losses are zero, and say why
that assumption makes your answer an *over*estimate of the recovered fraction.

**Q10 (13).** You are asked to recommend whether a new kerolox booster engine
should run MR 2.3 or MR 2.8, given that the vehicle is volume-limited rather than
mass-limited and the chamber uses a channel-wall copper liner with a firm
hot-gas-wall temperature limit. Give your recommendation and defend it in no more
than 150 words, naming the two quantities you would compute first.

---

## 12. Further reading

- **[SB]** *Rocket Propulsion Elements*, chapters on basic relations and
  thermochemistry — the default first reference for $c^*$, $C_F$ and the
  ideal-rocket assumptions. Cite the edition: chapter and equation numbering
  moves between the 7th, 8th and 9th.
- **[HP]** Hill & Peterson, *Mechanics and Thermodynamics of Propulsion*, 2nd ed.
  Read it for the derivations that [SB] asserts, particularly the control-volume
  energy analysis and the chemical-equilibrium treatment.
- **[Anderson-MCF]** *Modern Compressible Flow*, chapters 3 and 5. The cleanest
  treatment of stagnation properties, the area-Mach relation, and the meaning of
  $p_0$ loss. Its historical asides explain why the conventions exist.
- **[ZH]** Zucrow & Hoffman, *Gas Dynamics* Vol. 1. Go here when you want the
  entropy and availability accounting done rigorously rather than asserted.
- **[CEA]** and **[RP-1311]** Gordon & McBride. Read RP-1311 Part I for the Gibbs
  minimisation formulation and the frozen-versus-equilibrium options; you will use
  it constantly from Module 04 onward. **[CEARUN]** is the web front end if you do
  not want to build the Fortran.
- **[JANAF]** NIST-JANAF Thermochemical Tables. The source of every
  $\Delta_f H^\circ$ and sensible-enthalpy number in this module. Learn to read
  the table headers; the $\Delta_f G^\circ$ column is what feeds $K_p$.
- **[NIST-WB]** and **[REFPROP]** for real-fluid properties of cryogens and
  pressurants. This is where you go the moment $Z \ne 1$ matters.
- **[MIT16512]** Martinez-Sanchez, MIT OCW 16.512, early lectures. Terse,
  mathematical, and covers nozzle flow with real-gas and kinetic effects at
  exactly the level this module previews.
- **[CPIA-246]** JANNAF Rocket Engine Performance Prediction and Evaluation.
  The standard methodology for turning an ideal CEA number into a predicted
  delivered $I_{sp}$, including the kinetic loss that §3.14 is about. Access is
  restricted; know that it exists and what it standardises.
- **[HH]** Huzel & Huang, chapter 1. The design-engineer's version of everything
  above, in US customary units, with the assumptions that Rocketdyne actually
  used.
