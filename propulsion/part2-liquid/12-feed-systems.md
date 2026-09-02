# Module 12 — Feed Systems and Turbopumps
Part II · Prerequisites: modules 03, 05, 07, 11 · Estimated time: 8 h

The thrust chamber is the part of the engine everyone photographs, and it is
the part that almost never kills you. The feed system is what kills you. A
turbopump is a machine that must deliver several hundred bar of head, at flows
of hundreds of kilograms a second, through a fluid that boils at 90 K on one
side of a seal and burns anything it touches on the other, driven by a turbine
whose inlet gas is hot enough to soften the blades, on bearings lubricated by
liquid oxygen, spinning fast enough that the impeller rim is running at
two-thirds of the material's own burst speed — and it must do all of that in
the two seconds between "start" and "mainstage", every time, with no
opportunity to warm up. The Space Shuttle programme spent more engineering
effort on the high-pressure fuel turbopump than on the combustion chamber,
the injector and the nozzle put together, and still had bearings and
subsynchronous whirl as open items a decade after first flight [Biggs89].
The alternative — pressure feeding — is genuinely simple and genuinely
reliable, and it puts a hard ceiling on chamber pressure that no amount of
cleverness removes, because the ceiling is set by the mass of a pressure
vessel, which is set by thermodynamics and the strength of aluminium. This
module is about where that ceiling sits, why, and what you buy when you decide
to pay for a turbopump instead.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. Build a complete tank-to-injector pressure budget for a pressure-fed
   engine, including chamber pressure, injector drop, cooling-jacket drop,
   line friction, minor losses and acceleration head, and state which term
   dominates.
2. Derive the mass of a pressurised propellant tank as a function of tank
   pressure and volume, and use it to explain why pressure-fed chamber
   pressure saturates near 2–3 MPa.
3. Size a stored-gas pressurant system: ideal-gas requirement, collapse
   factor, bottle blow-down, and the mass penalty of the bottle itself.
   Choose between helium, nitrogen and autogenous pressurisation and defend
   the choice.
4. Compute the pressure and thrust decay of a blowdown system for a given
   blowdown ratio, and convert it into an $I_{sp}$ and total-impulse penalty.
5. Derive the Euler turbomachine equation and use it to relate impeller tip
   speed, blade backsweep, slip and delivered head; compute pump head, flow,
   shaft power and efficiency for a real engine's propellant flows.
6. Compute specific speed and use it to select impeller type (radial,
   mixed-flow, axial) and to decide whether a circuit needs staging.
7. Compute NPSH available from a tank state and NPSH required from suction
   specific speed; decide whether a given pump needs an inducer, a lower
   shaft speed, or a boost pump.
8. Apply the affinity laws to scale a pump between thrust levels and explain
   quantitatively why small engines run at high rpm and why their suction
   requirement does not scale down.
9. Size the turbine flow needed to drive a given pump set from a gas
   generator at a stated inlet temperature and pressure ratio, and convert
   that flow into an engine-level $I_{sp}$ loss.
10. Explain the seal, bearing and rotordynamic architecture of a real
    turbopump, and argue why a specific engine chose single-shaft, geared,
    dual-shaft or full-flow layout.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Volumetric flow rate | $Q$ | m³/s | $\dot m/\rho$ through a pump |
| Pump head rise | $H$ | m | $\Delta p/(\rho g_0)$; energy per unit weight of fluid |
| Pump pressure rise | $\Delta p_p$ | Pa | discharge minus inlet static pressure |
| Shaft speed | $N$, $\omega$ | rpm, rad/s | $\omega = 2\pi N/60$ |
| Impeller tip (peripheral) speed | $u_2$ | m/s | $\omega D_2/2$ at the impeller exit radius |
| Impeller exit diameter | $D_2$ | m | outer diameter of the impeller |
| Impeller exit blade width | $b_2$ | m | passage height at the impeller rim |
| Meridional velocity | $c_{m2}$ | m/s | radial (through-flow) velocity component at impeller exit |
| Tangential (whirl) velocity | $c_{u2}$ | m/s | absolute tangential velocity component at impeller exit |
| Blade angle at exit | $\beta_2$ | ° | blade angle measured from the tangential direction |
| Slip factor | $\sigma$ | — | ratio of actual to ideal whirl imparted; $<1$ |
| Head coefficient | $\psi$ | — | $g_0 H/u_2^2$ |
| Flow coefficient | $\phi$ | — | $c_{m2}/u_2$ |
| Specific speed | $N_s$ | — | $\omega\sqrt{Q}/(g_0 H)^{3/4}$ (SI, dimensionless form) |
| Suction specific speed | $N_{ss}$ | — | $\omega\sqrt{Q}/(g_0\,\mathrm{NPSH})^{3/4}$ |
| Net positive suction head, available | NPSHa | m | head above vapour pressure at the pump inlet |
| Net positive suction head, required | NPSHr | m | NPSHa below which the pump loses head (usually the 2–3 % head-loss point) |
| Thermodynamic suppression head | TSH | m | apparent NPSH gain from evaporative cooling of the cavity |
| Pump efficiency | $\eta_p$ | — | fluid power out / shaft power in |
| Hydraulic efficiency | $\eta_h$ | — | actual head / Euler head |
| Turbine efficiency | $\eta_t$ | — | shaft power out / isentropic enthalpy drop × flow |
| Turbine pressure ratio | $\pi_t$ | — | inlet stagnation / exit static pressure |
| Blade speed ratio | $U/C_0$ | — | turbine blade speed over isentropic spouting velocity |
| Darcy friction factor | $f$ | — | in $\Delta p = f(L/D)\tfrac12\rho V^2$ |
| Minor-loss coefficient | $K$ | — | in $\Delta p = K\tfrac12\rho V^2$ |
| Blowdown ratio | $BR$ | — | initial ullage pressure / final ullage pressure |
| Collapse factor | $Z_c$ | — | actual pressurant mass / ideal isothermal mass |
| Pressurant gas constant | $R_g$ | J/(kg·K) | $R_u/\mathcal{M}_g$ |
| Tank ullage volume | $V_u$ | m³ | gas volume above the liquid |
| Material specific strength | $\sigma/\rho$ | J/kg (m²/s²) | allowable stress over density |
| DN number | $DN$ | mm·rpm | bearing bore diameter (mm) × shaft speed (rpm) |
| Critical speed | $N_{cr}$ | rpm | shaft speed at which a rotor bending mode is excited |
| Total impulse | $I_t$ | N·s | $\int F\,dt$ |

---

## 3. Theory

### 3.1 What a feed system is for, stated as a pressure budget

Everything in this module follows from one accounting identity. Propellant
leaves a tank at some pressure and arrives in the combustion chamber at
$p_c$. Between the two it loses pressure to every resistance in the path, and
whatever supplies that pressure — a gas bottle or a pump — must supply the
sum. [F]

$$p_{\text{supply}} = p_{c,\text{inj}} + \Delta p_{\text{inj}} + \Delta p_{\text{cool}} + \Delta p_{\text{line}} + \Delta p_{\text{valve}} \pm \Delta p_{\text{accel}} \pm \Delta p_{\text{dyn}}$$

> **Eq. 3.1** — variables: $p_{\text{supply}}$ tank ullage pressure (pressure-fed)
> or pump discharge pressure (pump-fed) [Pa]; $p_{c,\text{inj}}$ chamber
> pressure at the injector face [Pa]; $\Delta p_{\text{inj}}$ injector
> pressure drop [Pa]; $\Delta p_{\text{cool}}$ regenerative-jacket drop [Pa],
> zero on the oxidiser side of almost every engine; $\Delta p_{\text{line}}$,
> $\Delta p_{\text{valve}}$ distributed and lumped feed-line losses [Pa];
> $\Delta p_{\text{accel}} = \rho a z$ the head from vehicle acceleration
> across the height $z$ between liquid surface and injector [Pa];
> $\Delta p_{\text{dyn}} = \tfrac12\rho V^2$ the dynamic head converted at the
> injector inlet [Pa]. Assumes: steady flow, single phase, no significant
> density change along the path. Fails when: the coolant goes supercritical
> and expands (Module 11 — the RS-25 hydrogen jacket density falls by a
> factor of three between inlet and outlet, so $\Delta p_{\text{cool}}$ is
> not a simple friction term), or when the propellant flashes in the line.

Three observations before any analysis:

- **$p_{c,\text{inj}}$ is not the $p_c$ you used for nozzle sizing.** The
  injector-end stagnation pressure exceeds the nozzle stagnation pressure by
  the Rayleigh loss of heat addition in a finite-area chamber (Module 06).
  For the reference engine used here it is about 3 % higher. Feed systems are
  sized on the injector-end value; nozzles on the nozzle-stagnation value.
  Mixing them is the single most common bookkeeping error in engine sizing
  [_verify-liquid §18].
- **The injector drop is not waste.** It is the loop gain that keeps the
  chamber from talking back to the feed system (Module 07 §3.4). You cannot
  reduce it to zero to save tank pressure; below about 10 % of $p_c$ on a
  liquid circuit you get chug.
- **The budget is different for the two propellants**, because only one of
  them normally goes through the cooling jacket. On a regeneratively cooled
  kerosene engine the fuel side carries 30–50 bar of jacket drop the oxidiser
  side does not. A pressure-fed system with one regulator therefore
  over-pressurises the oxidiser tank and trims it back with a cavitating
  venturi or a fixed orifice; a pump-fed system simply builds a fuel pump
  with more head.

---

## PART A — PRESSURE-FED SYSTEMS

### 3.2 The tank pressure budget in practice

Take a storable-propellant upper-stage engine: $p_c = 12$ bar at the injector
face, injector drop 25 % of $p_c$, a modest regenerative jacket on the fuel
side, and short lines. The budget is:

| term | fuel side (bar) | oxidiser side (bar) | why |
|---|---|---|---|
| $p_{c,\text{inj}}$ | 12.0 | 12.0 | design chamber pressure |
| $\Delta p_{\text{inj}}$ | 3.0 | 3.0 | 25 % of $p_c$; stability and atomisation |
| $\Delta p_{\text{cool}}$ | 2.0 | — | fuel-cooled chamber only |
| $\Delta p_{\text{line}} + \Delta p_{\text{valve}}$ | 1.0 | 1.0 | isolation valve, main valve, filter, bends |
| acceleration/hydrostatic reserve | 0.5 | 0.5 | worst-case low-liquid, high-$g$ |
| **required ullage pressure** | **18.5** | **16.5** | |

The stage flies one regulator at 18.5 bar and trims the oxidiser side. That
6.5 bar of "overhead" above $p_c$ — 54 % of chamber pressure — is the
structural tax of pressure feeding, and it is the quantity that makes the
next section's arithmetic come out the way it does. [F]

### 3.3 Tank mass, and why pressure-fed chamber pressure stops at 2–3 MPa

A thin-walled sphere of radius $R$ under internal pressure $p$ has membrane
stress $\sigma = pR/(2t)$. Setting $t = pR/(2\sigma)$ and $m = \rho\,4\pi R^2 t$:

$$m_{\text{sph}} = \rho\,4\pi R^2\frac{pR}{2\sigma} = 2\pi\rho\frac{pR^3}{\sigma}
= \frac{3}{2}\,\frac{p V}{\sigma/\rho}$$

using $V = \tfrac43\pi R^3$. For a cylinder with hemispherical ends the hoop
stress is $pR/t$, twice the sphere's, so the barrel section costs
$2\,pV/(\sigma/\rho)$. With a design factor $j$ on the maximum expected
operating pressure, a real tank lands at

$$\boxed{\;m_{\text{tank}} \approx k_t\,j\,\frac{p_t V}{\sigma/\rho}\;}
\qquad k_t \approx 1.5\ (\text{sphere}) \to 2.0\ (\text{cylinder})$$

> **Eq. 3.2** — variables: $m_{\text{tank}}$ tank wall mass [kg]; $p_t$ tank
> pressure [Pa]; $V$ enclosed volume [m³]; $\sigma/\rho$ material specific
> strength [J/kg]; $j$ design factor (1.25–1.5 on yield for flight tanks,
> [AIAA-S-080]). Assumes: membrane (thin-wall) behaviour, pressure-dominated
> design, no buckling or launch-load case governing. Fails when: the tank is
> stability-critical rather than strength-critical (a large, lightly
> pressurised booster tank is sized by compressive buckling — see [SP-8007] —
> and Eq. 3.2 then *underestimates* mass badly); also fails for COPVs, where
> the liner carries no load and the figure of merit is $pV/W$ instead.

**Read what Eq. 3.2 says.** Tank mass is proportional to $p_t V$ — to the
*stored pressure–volume energy*, not to pressure or volume alone. And $p_t$
is, from §3.2, roughly $1.3$–$1.6\,p_c$. So

$$m_{\text{tank}} \propto p_c \times V_{\text{prop}} \propto p_c \times \frac{I_t}{I_{sp}g_0\rho_{\text{bulk}}}$$

The propellant tank mass of a pressure-fed stage rises *linearly with chamber
pressure at fixed total impulse*. Meanwhile the benefit of chamber pressure
is weak: from Module 03, $C_F$ at fixed area ratio improves only
logarithmically with $p_c$, and the real gains (smaller nozzle for a given
$\varepsilon$, higher $\varepsilon$ in a given envelope) saturate. [F]

Numbers make it concrete. Aluminium 2219 at 400 MPa allowable and
2 840 kg/m³ gives $\sigma/\rho = 1.41\times10^5$ J/kg. With $k_t j = 2.25$:

$$\frac{m_{\text{tank}}}{p_t V} = \frac{2.25}{1.41\times10^5} = 1.60\times10^{-5}\ \mathrm{kg/J}$$

For a stage carrying 10 m³ of propellant (about 11.6 t of NTO/MMH):

| $p_c$ | $p_t$ | tank wall mass | as % of propellant |
|---|---|---|---|
| 7 bar (SPS class) | 11 bar | 176 kg | 1.5 % |
| 12 bar | 18.5 bar | 296 kg | 2.6 % |
| 25 bar | 36 bar | 576 kg | 5.0 % |
| 50 bar | 70 bar | 1 120 kg | 9.7 % |
| 100 bar (RE-500 class) | 130 bar | 2 080 kg | 18 % |

And that is only the tank wall. The pressurant system roughly doubles it
(§3.5). By 5 MPa chamber pressure the pressurisation hardware is a fifth of
the propellant mass and you have thrown away more stage performance than the
higher $p_c$ could ever return. **The practical ceiling on pressure-fed
chamber pressure is 2–3 MPa (20–30 bar) for anything that burns for more
than a minute** — not because a 130 bar tank cannot be built, but because it
is not worth building. [F], with the boundary being [J].

The exception proves the rule: **SuperDraco runs $p_c = 69$ bar
(1 000 psi) pressure-fed** [_verify-liquid]. It gets away with it because it
carries only 1 388 kg of propellant (≈1.16 m³) and burns for ~25 s. Plug
1.16 m³ and $p_t \approx 80$ bar into the same coefficients and the whole
pressurisation penalty is about 260 kg — affordable on a capsule, absurd on
a stage. Total impulse, not thrust, is what decides. [F]

### 3.4 Pressurant gases: helium, nitrogen, autogenous

The pressurant must occupy the volume the propellant vacates, at the required
pressure, without condensing, freezing, dissolving in the propellant or
reacting with it. Its mass, ideal-gas, is

$$m_g = \frac{p_t V}{R_g T_g},\qquad R_g = \frac{R_u}{\mathcal{M}_g}$$

> **Eq. 3.3** — variables: $m_g$ pressurant mass [kg]; $p_t$ tank pressure
> [Pa]; $V$ volume to be displaced [m³]; $R_g$ specific gas constant of the
> pressurant [J/(kg·K)]; $T_g$ gas temperature in the tank [K]. Assumes:
> ideal gas, uniform ullage temperature, gas fills exactly the propellant
> volume, no dissolution. Fails when: the gas is cold and dense (helium at
> 300 bar is 17 % denser than ideal), when the ullage stratifies (it always
> does), and when the gas dissolves in the liquid (helium in LOX and in NTO
> is a real loss, of order 1–3 % of the gas [SP-8112]).

The mass is inversely proportional to $R_g$, i.e. proportional to molar mass.
That single fact decides the trade.

| gas | $\mathcal{M}$ (kg/kmol) | $R_g$ (J/kg·K) | relative mass at same $p_t,V,T$ | notes |
|---|---|---|---|---|
| **Helium** | 4.003 | 2 077 | **1.00** | seven times lighter than N₂ for the same job. Leaks through everything; $Z = 1.17$ at 300 bar/293 K so the *bottle* must be bigger than ideal-gas sizing says. Does not condense at LOX or LH₂ temperature. |
| **Nitrogen** | 28.01 | 296.8 | 7.00 | cheap, dense, easy to seal, non-cryogenic handling. Condenses at LOX temperature (77 K at 1 bar) — never used to pressurise LOX cryogenically, though the R-7 does use liquid nitrogen boiled off deliberately [_verify-liquid]. Fine for storables and for cold-gas systems. |
| **Argon** | 39.95 | 208.1 | 9.98 | used where inertness matters more than mass. |
| **Autogenous (own vapour)** | fuel- or oxidiser-dependent | — | — | no separate gas, no separate bottle, no dissolution mismatch. Requires a heat source: a heat exchanger on the turbine exhaust (RS-25, Merlin) or tapped hot gas. Only available on pump-fed engines that have hot gas to spare, or on cryogens that can be boiled. |

**The helium/nitrogen decision is almost always mass versus cost.** Helium
wins by a factor of seven on gas mass and by nearly as much on bottle mass,
so anything that flies far uses helium. Nitrogen survives on ground support
equipment, on cold-gas attitude systems where the gas *is* the propellant
(Module 28), and on cheap storable stages where seven times a small number is
still a small number.

**Autogenous pressurisation** deserves its own paragraph because it changes
the architecture rather than the numbers. Gaseous oxygen bled from the pump
discharge through a heat exchanger pressurises the LOX tank; gaseous methane
or hydrogen does the same for the fuel tank. You delete the helium bottle,
the helium regulator and the helium fill-and-drain entirely. Falcon 9's first
stage and Starship both do this; the RS-25 pressurises the External Tank
autogenously with GH₂ and GO₂ tapped from the engine [SSME-Orient]. The
costs are that (i) it only works while the engine is running, so you still
need a start bottle, (ii) hot oxygen in a tank ullage is a materials problem,
and (iii) the heat exchanger is a new single-point failure in the hot-gas
path. It is not available to a pressure-fed system at all, which has no hot
gas — with one historical exception, *chemical* pressurisation, in which a
small gas generator's products pressurise the tanks directly. It was studied
extensively, flown rarely, and abandoned because the hot combustion products
attack the propellant they sit on [SP-8112].

**The LMDE's cryogenic helium** is the most interesting variant in the
historical record. The Apollo Lunar Module descent stage stored its helium
**supercritical and cold**, not at ambient temperature [_verify-liquid].
Helium density at, say, 6 K and 100 bar is roughly twenty times its
room-temperature density at the same pressure, so the bottle shrinks
enormously; the gas is then warmed through a heat exchanger on its way to the
tanks. The price is a cryogenic bottle with an unavoidable boil-off clock —
acceptable on a vehicle with a mission measured in days, unacceptable on
anything that must loiter.

### 3.5 Sizing the pressurant system honestly: collapse factor and the bottle

Eq. 3.3 gives the gas in the propellant tank at the end of the burn, assuming
the gas is at a single known temperature. It is not. Gas entering the ullage
is warm (it came from a bottle, was throttled across a regulator, and may
have been heated deliberately); the liquid surface and the tank wall are
cold; the gas expands as it fills. Real ullage gas ends up colder and denser
than the inlet gas, so you need **more** of it. The industry accounts for
this with a **collapse factor**:

$$m_{g,\text{req}} = Z_c\,\frac{p_t V}{R_g T_{g,\text{in}}}$$

> **Eq. 3.4** — variables: $Z_c$ collapse factor [—], $T_{g,\text{in}}$ the
> temperature of the gas as delivered to the tank [K]. Assumes: $Z_c$ is
> calibrated for the tank geometry, fill fraction, ramp rate and propellant.
> Typical values [E]: 1.0–1.2 for a small, fast-emptying tank with warm gas
> into a storable; 1.3–1.6 for a large storable tank over a long burn;
> **2–4 for helium into liquid hydrogen**, where the wall and liquid are at
> 20 K and the incoming helium is at 250 K or more. Fails when: used outside
> the geometry it was fitted to. [SP-8112] gives the analysis that replaces
> guessing, and it is a genuinely two-dimensional transient heat-and-mass
> transfer problem, not a coefficient.

Two consequences worth internalising:

1. **Collapse factor is why hydrogen stages are so unpleasant to pressurise.**
   Helium into an LH₂ tank can need two to four times the ideal mass. This is
   a large part of why cryogenic upper stages went autogenous.
2. **Heating the pressurant is real mass savings.** $m_g \propto 1/T_g$, so
   delivering the gas at 500 K instead of 250 K halves the requirement.
   Hence heated helium: the bottle is submerged in LOX (cold and dense for
   storage) and the gas passes through a heat exchanger in the turbine
   exhaust or the gas generator before reaching the ullage. Centaur, the
   Atlas family and most large storable stages all do some version of this.
   The catch is that the heat exchanger must work *before* the engine is
   running.

**The bottle is not free.** Gas stored at $p_i$ and blown down to $p_f$
delivers only the difference:

$$m_{\text{delivered}} = \frac{V_b}{R_g T_b}\left(\frac{p_i}{Z_i} - \frac{p_f}{Z_f}\right)$$

> **Eq. 3.5** — variables: $V_b$ bottle volume [m³]; $p_i,p_f$ initial and
> final bottle pressure [Pa]; $Z_i,Z_f$ compressibility factors [—];
> $T_b$ bottle gas temperature [K]. Assumes: isothermal blowdown — i.e. the
> bottle has time to re-absorb heat from its surroundings. Fails when: the
> blowdown is fast. Adiabatic blowdown of helium from 300 bar drops the
> bottle gas temperature by well over 100 K, the residual gas is denser than
> the isothermal calculation says, and you deliver **less** than Eq. 3.5
> predicts. Real systems are between the two and are usually sized on the
> adiabatic case with the isothermal case as the optimistic bound.

$p_f$ cannot fall to $p_t$: a regulator needs 2–4 bar of differential to
control, so a system regulating to 18.5 bar goes into "lockup" somewhere
around 21–22 bar and the remaining gas is dead mass. That residual is
typically 6–10 % of the load.

Finally the bottle wall. Modern COPVs are quoted by performance factor
$pV/W$ (units of metres): $1.0$–$1.8\times10^4$ m for flight-qualified
carbon-overwrapped vessels, so

$$m_{\text{bottle}} = \frac{p_i V_b}{g_0\,(pV/W)}$$

> **Eq. 3.6** — variables: $pV/W$ vessel performance factor [m]. Assumes:
> burst-pressure-governed design with the standard COPV factors of safety
> ([AIAA-S-081]). Fails when: stress rupture, impact damage tolerance or
> liner buckling govern instead — which for long-duration missions they
> frequently do, and the achievable $pV/W$ drops.

Add it up and the rule of thumb is: **a stored-helium system costs roughly
5–6 kg of hardware and gas per kilogram of helium actually delivered to the
ullage**, and the whole pressurisation package (propellant tanks + gas +
bottle) costs about $2.8\times10^{-5}$ kg per joule of $p_tV$. That
coefficient is what §3.7 uses to find the crossover with a turbopump.

### 3.6 Regulators, valves, lines and the losses in them

**Regulators.** A pressure regulator is a control loop with a spring, a
sensing element and a poppet. Three properties matter [SP-8080]:

- **Droop**: outlet pressure falls as flow rises, because the poppet must
  open further and the spring force changes. 5–10 % droop across the flow
  range is ordinary. Your pressure budget must close at the *high-flow, low
  inlet pressure* corner, which is the end of the burn.
- **Lockup**: the outlet pressure the regulator settles at when flow stops,
  always above the setpoint. It sets the tank's relief-valve setting and
  therefore the tank's design pressure, and therefore the tank mass. A
  regulator with 1 bar of lockup on an 18.5 bar system adds 5 % to tank
  pressure and 5 % to tank mass for nothing.
- **Instability**: regulators can and do oscillate against the compliance of
  the downstream volume. The classic fix is an orifice in the sense line.

Redundancy practice is a **series-parallel** arrangement: two regulators in
series (so one failing open does not overpressurise) with each leg
duplicated in parallel (so one failing closed does not starve the engine).
The Apollo SPS used exactly this philosophy throughout its valve trains, and
it is the reason the SPS is the standard example of designing reliability by
*removing mechanisms* rather than adding them [_verify-liquid].

**Line losses.** Distributed friction follows Darcy–Weisbach:

$$\Delta p_f = f\,\frac{L}{D}\,\frac{1}{2}\rho V^2, \qquad
\frac{1}{\sqrt f} = -2\log_{10}\!\left(\frac{\varepsilon/D}{3.7} + \frac{2.51}{Re\sqrt f}\right)$$

> **Eq. 3.7** — variables: $f$ Darcy friction factor [—]; $L$ line length [m];
> $D$ internal diameter [m]; $\rho$ density [kg/m³]; $V$ bulk velocity [m/s];
> $\varepsilon$ absolute roughness [m] (1.5 µm for drawn stainless, 45 µm for
> commercial steel); $Re = \rho V D/\mu$. Colebrook is implicit; the explicit
> Swamee–Jain form $f = 0.25/[\log_{10}(\varepsilon/3.7D + 5.74/Re^{0.9})]^2$
> is within 1 % over $5\times10^3 < Re < 10^8$ and is what the worked examples
> use. Assumes: fully developed, single-phase, incompressible, steady flow in
> a straight round pipe. Fails when: the line is short relative to its
> entrance length (rocket feed lines usually are — $L/D$ of 10–20 is common,
> and the friction term is then small compared to the fittings anyway),
> two-phase, or flowing a supercritical coolant whose density changes.

Minor losses are handled with $K$-factors:

$$\Delta p_m = \left(\sum K_i\right)\frac{1}{2}\rho V^2$$

> **Eq. 3.8** — typical $K$ [E]: sharp-edged tank outlet 0.5, well-rounded
> inlet 0.05, 90° long-radius elbow 0.2–0.3, mitre bend 1.1, fully open
> ball valve 0.05–0.1, fully open globe/poppet main valve 3–10, orifice
> plate to suit, sudden expansion $(1-A_1/A_2)^2$, bellows 2–4 per
> convolution set, filter 5–30 depending on mesh and cleanliness. Assumes:
> turbulent flow, components far enough apart not to interact. Fails when:
> fittings are adjacent (a bend immediately downstream of a valve can be
> much worse than the sum), or when a filter loads with debris — which is
> exactly the failure that shows up as a slowly rising $\Delta p$ across a
> test series and ends with a starved engine.

**The lesson from running the numbers** (WE2 does it): in a rocket feed line,
**friction is negligible and fittings dominate**. A 100 mm RP-1 line
flowing 50 kg/s at 8 m/s over 1.2 m loses 0.044 bar to friction and 0.54 bar
to one tank outlet, two elbows and a main valve. Design effort belongs on the
valve and the bend radii, not on polishing the pipe. Lines are sized to hold
velocity in the **4–10 m/s** band for liquids: faster costs pressure and
raises water-hammer loads at valve closure; slower makes the line and its
contained propellant mass (which you must accelerate, and which is dead mass
at burnout) too heavy. [E]

**Water hammer** deserves a line of its own. Closing a main valve on a
column of liquid produces the Joukowsky pressure rise $\Delta p = \rho a
\Delta V$, where $a$ is the acoustic speed in the line including wall
compliance ($\approx$1 200 m/s for LOX in a stiff steel line). Stopping
8 m/s of LOX gives $1140\times1200\times8 = 109$ bar. This is why main valves
have controlled closure rates, why lines carry accumulators, and why
[SP-8123] spends as much space on bellows fatigue as it does on sizing.

### 3.7 Blowdown systems, and what they cost

A **regulated** system holds tank pressure constant and carries a bottle. A
**blowdown** system deletes the bottle, regulator and their failure modes:
the tank is loaded with a large ullage at high pressure and simply allowed to
expand as propellant leaves. Nothing moves except the propellant valve.

The ullage follows a polytrope:

$$p = p_i\left(\frac{V_{u,i}}{V_u}\right)^n, \qquad
BR \equiv \frac{p_i}{p_f} = \left(\frac{V_{u,f}}{V_{u,i}}\right)^n$$

> **Eq. 3.9** — variables: $p_i,p_f$ initial and final ullage pressure [Pa];
> $V_{u,i}, V_{u,f}$ initial and final ullage volume [m³]; $n$ polytropic
> exponent [—]. $n = 1$ isothermal (slow burn, good heat transfer from the
> propellant and tank wall — the usual assumption for long storable burns);
> $n = \gamma$ adiabatic ($1.67$ for helium, $1.40$ for N₂ — the right bound
> for a fast burn). Assumes: uniform ullage, no condensation, no gas
> dissolving. Fails when: the burn is long enough that the tank exchanges
> significant heat with the environment (then $n<1$ is possible), or when
> propellant vapour contributes to ullage pressure — which for a volatile
> propellant it does.

Chamber pressure tracks tank pressure. With a fixed-area injector and an
incompressible liquid, $\dot m \propto \sqrt{\Delta p_{\text{inj}}}$ while
$p_c \propto \dot m$, so at first order

$$\frac{p_c(t)}{p_{c,i}} \approx \frac{p_t(t) }{p_{t,i}}\ \text{(to within the } \Delta p \text{ split)},
\qquad \frac{F(t)}{F_i} \approx \frac{p_c(t)}{p_{c,i}}$$

and $I_{sp}$ falls too, because $C_F$ degrades as $p_c/p_a$ drops and $\eta_{c^*}$
degrades as the injector drop collapses.

**The blowdown ratio is the whole trade.** For a required *final* tank
pressure $p_f$ set by the engine, a blowdown ratio $BR$ forces:

- initial tank pressure $p_i = BR\times p_f$ — so the tank is designed for the
  *initial* pressure and its mass scales with $BR$;
- initial ullage fraction $V_{u,i}/(V_{u,i}+V_{\text{prop}}) = BR^{-1/n}$ —
  so at $BR=4$, isothermal, the tank must be **25 % gas at loading**, i.e.
  a third larger than the propellant it carries.

Both effects push tank mass up as $BR$ rises; the thrust and $I_{sp}$ decay
push performance down as $BR$ rises. In practice:

| $BR$ | thrust decay | typical use |
|---|---|---|
| 1.0 (regulated) | none | anything with a long burn or a tight thrust tolerance |
| 1.5–2.5 | −33 % to −60 % | small spacecraft monopropellant and bipropellant systems, most smallsat RCS |
| 3–4 | −67 % to −75 % | simple, short-lived systems where mass is dominated by something else |
| >4 | — | essentially never; the tank penalty and the off-design injector both become intolerable |

**Blowdown is a reliability and cost architecture, not a performance one.**
It is chosen when the pressurant hardware's failure modes (regulator fails
open → tank burst; regulator fails closed → dead vehicle) are judged worse
than the performance loss, or when the total impulse is small enough that
nobody cares. Most spacecraft monopropellant hydrazine systems are blowdown;
most bipropellant main-engine systems are regulated.

### 3.8 Pressure-fed engines in the record

| engine | $p_c$ | pressurant | why this architecture |
|---|---|---|---|
| **Apollo SPS (AJ10-137)** | ~6.9 bar (100 psia, *low confidence* [_verify-liquid]) | 1.11 m³ (39.2 ft³) helium at 25 MPa (3 600 psi), regulated | Only engine that could return the crew from lunar orbit. Designed so that no mechanism has to work more than once. 750 s burn capability, multiple restarts. Low $p_c$ is deliberate: it makes the tanks light *and* the ablative chamber survivable. |
| **LM descent (LMDE)** | 7.6 bar at 100 %, **0.76 bar at 10 %** | **supercritical cold helium**, warmed before use | Deep throttling (10–60 %, with the 60–100 % band prohibited for nozzle-erosion reasons) demanded the variable-area pintle injector. Cold helium storage was chosen purely to shrink the bottle on a mass-critical lander. |
| **Shuttle OMS (AJ10-190)** | 8.6 bar (125 psia) | helium, regulated | 1 000 starts and 15 h cumulative burn, certified for 100 missions — the only reusable AJ10. Reusability, not performance, set every choice. |
| **Aestus** | **11 bar (160 psia)** | helium, regulated | Ariane 5 storable upper stage: 1 100 s burn, multiple re-ignitions, 324 s $I_{sp}$ from an **84:1** nozzle. Proof that low $p_c$ need not mean low $I_{sp}$ *in vacuum* — you buy back the performance with area ratio, which is cheap in vacuum and impossible at sea level. A pump-fed successor (Aestus II / RS-72) was built and tested and **never flew**. |
| **SuperDraco** | **69 bar (1 000 psi)** | helium | The outlier. Only affordable because the propellant load is 1 388 kg and the burn is ~25 s. Regeneratively cooled and 20–100 % throttleable because it must be restartable and reusable as an abort engine. |
| **Cold-gas thrusters** | 1–10 bar | *the gas is the propellant* | The degenerate case of blowdown: no liquid, no injector, no combustion. Everything in §3.7 applies directly, with $n=\gamma$ and $BR$ often 10:1 or more because the usable-mass fraction, not thrust flatness, is what matters. See Modules 28–31. |

The pattern is unmistakable: **pressure-fed chamber pressure clusters at
7–12 bar for anything that burns for minutes, and only breaks 20 bar when the
burn is short.** That is Eq. 3.2 asserting itself.

---

## PART B — PUMP-FED SYSTEMS

### 3.9 Why pumps: deriving the crossover

Put a pump in and the tanks only need enough pressure to keep the pump from
cavitating — typically 2–4 bar rather than 1.3 $p_c$. What you pay is the
turbopump's own mass, plus the propellant its turbine consumes.

Let the total pressurisation penalty of the pressure-fed option be

$$M_{\text{press}} = C_p\,\Delta p_t\,V, \qquad
C_p = \underbrace{\frac{k_t j}{\sigma/\rho}}_{\text{tank wall}}
 + \underbrace{\frac{Z_c}{R_g T_g}\left(1 + \frac{m_{\text{bottle}}}{m_g}\right)}_{\text{gas + bottle}}$$

and let the turbopump option cost

$$M_{TP} = m_0 + k_{TP}\,P_{\text{pump}}, \qquad
P_{\text{pump}} = \frac{\dot m\,\Delta p_p}{\rho\,\eta_p}$$

where $m_0$ is the irreducible floor — housings, turbine, bearings, seals,
gas generator, controls — that a turbopump has regardless of how small the
engine is, and $k_{TP}$ is the marginal mass per watt.

With $V = \dot m t_b/\rho$ and $\Delta p_p \approx \Delta p_t$ (both raise the
propellant from tank to injector), set the two equal:

$$C_p\,\Delta p_t\,\frac{\dot m t_b}{\rho} = m_0 + k_{TP}\frac{\dot m \Delta p_t}{\rho\,\eta_p}$$

$$\boxed{\;t_{b,\text{crit}} = \frac{\rho\,m_0}{C_p\,\Delta p_t\,\dot m} \;+\; \frac{k_{TP}}{C_p\,\eta_p}\;}$$

> **Eq. 3.10** — variables: $t_{b,\text{crit}}$ burn time at which the two
> architectures weigh the same [s]; $\rho$ bulk propellant density [kg/m³];
> $m_0$ turbopump fixed mass [kg]; $C_p$ pressurisation penalty coefficient
> [kg/J]; $\Delta p_t$ pressure the feed system must generate [Pa]; $\dot m$
> total propellant flow [kg/s]; $k_{TP}$ turbopump marginal mass [kg/W];
> $\eta_p$ pump efficiency. Assumes: mass is the only currency; tanks are
> strength-critical; both architectures deliver the same $\Delta p$; turbine
> propellant consumption and gas-generator plumbing are inside $m_0$ and
> $k_{TP}$. Fails when: reliability, restart count, development cost or
> schedule dominate — which is often. Treat the result as the *mass* answer,
> not the *design* answer. [J]

Evaluate it. Aluminium tanks and a helium system give $C_p = 2.8\times10^{-5}$
kg/J (§3.5). Take $k_{TP} = 2\times10^{-5}$ kg/W (20 kg/MW — a rough fit to
the F-1's ~1 400 kg at 41 MW and rather pessimistic against the RS-25 HPFTP's
53 MW), $\eta_p = 0.70$, and a turbopump floor $m_0 = 25$ kg [J].

The **second term is 1.0 s**. It is negligible. That is the headline: *on the
margin, pumps are almost free.* Doubling the pressure rise doubles both the
tank penalty and the pump power, and the pump wins by a factor of nearly
thirty every time.

The **first term is the whole story**, and it scales as $1/\dot m$. For the
20 kN storable engine of WE1 ($\dot m = 6.37$ kg/s, $\Delta p_t = 15.5$ bar,
$\rho = 1158$ kg/m³) it gives $t_{b,\text{crit}} \approx 105$ s.

So: **pressure feeding wins below roughly a hundred seconds of burn at 20 kN,
and the crossover time falls as $1/\dot m$** — at 500 kN it is under 5 s.
Anything the size of a booster engine should be pump-fed on mass grounds
before it has finished starting.

**Then why is Aestus pressure-fed, at 29.6 kN and 1 100 s?** Run the numbers:
its EPS stage carries roughly 8.4 m³ at about 15 bar, so
$C_p\Delta p_t V \approx 307$ kg of tank and pressurisation hardware, against
a turbopump of perhaps 40–60 kg. Pressure feeding costs that stage about a
quarter of a tonne. ArianeGroup built the pump-fed successor, tested it, and
flew the pressure-fed engine for twenty-one years anyway. The reasons are not
in Eq. 3.10: a restartable storable upper stage with no rotating machinery
has a failure tree you can draw on one page, its development was already
paid for, and 250 kg of GTO performance was worth less than the risk of a
new turbopump. **Eq. 3.10 tells you what mass says. It does not tell you what
the programme will decide, and you should say so out loud when you present
it.** [J]

### 3.10 Centrifugal pumps: the Euler equation, derived

A centrifugal pump raises pressure by doing work on the fluid with a rotating
blade row and then converting the resulting kinetic energy to pressure in a
stationary diffuser or volute. The work is set by angular momentum.

Apply conservation of angular momentum to a control volume around the
impeller. The torque on the shaft equals the rate of change of angular
momentum of the through-flow:

$$T = \dot m\,(r_2 c_{u2} - r_1 c_{u1})$$

Shaft power is $P = T\omega$, and with $u = \omega r$:

$$P = \dot m\,(u_2 c_{u2} - u_1 c_{u1})$$

Divide by $\dot m g_0$ to get head, and take $c_{u1}=0$ (no pre-whirl — true
for a plain axial inlet, and the reason inducers with pre-whirl need a
correction):

$$\boxed{\;H_{\text{Euler}} = \frac{u_2 c_{u2}}{g_0}\;}$$

> **Eq. 3.11 (Euler turbomachine equation)** — variables: $H_{\text{Euler}}$
> ideal head rise [m]; $u_2 = \omega D_2/2$ impeller tip speed [m/s];
> $c_{u2}$ absolute tangential velocity of the fluid leaving the impeller
> [m/s]. Assumes: steady, axisymmetric, uniform flow at inlet and exit; no
> pre-whirl; all shaft work goes into angular momentum of the through-flow.
> Fails when: there is significant disc friction or recirculation (both are
> real, and are why actual head is 10–20 % below Euler head even before the
> diffuser), or when leakage past the front shroud recirculates flow.
> **Notice what is absent: the fluid.** Euler head depends only on velocities.
> A pump develops the same *head* on hydrogen as on LOX at the same speed —
> and therefore fourteen times less *pressure*. This is the single most
> important sentence in turbopump design.

Now put blade geometry in. The relative velocity at the impeller exit leaves
along the blade at angle $\beta_2$ from the tangential direction, so
$c_{u2} = u_2 - c_{m2}/\tan\beta_2$. Real blades cannot fully turn the flow —
the finite blade count lets the flow "slip" backwards relative to the blade —
which is captured by a slip factor $\sigma \approx 0.8$–$0.9$ (Wiesner,
Stanitz and Stodola all give correlations; they agree to a few percent for
$Z \ge 6$ blades [Japikse]):

$$c_{u2} = \sigma u_2 - \frac{c_{m2}}{\tan\beta_2},
\qquad c_{m2} = \frac{Q}{\pi D_2 b_2}$$

> **Eq. 3.12** — variables: $\sigma$ slip factor [—]; $\beta_2$ blade exit
> angle from tangential [°]; $c_{m2}$ meridional velocity at the impeller
> exit [m/s]; $b_2$ exit blade width [m]. Assumes: full blade passages, no
> blockage correction (real blades block 5–10 % of the area — include it or
> you will over-predict $c_{m2}$). Fails at very low flow, where the passage
> stalls and the whole velocity-triangle picture breaks down.

**Backsweep.** $\beta_2 = 90°$ (radial blades) gives the most head per unit
tip speed, and a **rising** head-flow characteristic at low flow, which is
unstable. $\beta_2 = 20$–$35°$ backswept gives less head but a monotonically
falling $H$–$Q$ curve, which is stable, and better efficiency. Almost every
rocket pump is backswept in this range. [F]/[M]

**Nondimensionalise.** Define

$$\psi = \frac{g_0 H}{u_2^2}\ \ (\text{head coefficient}),\qquad
\phi = \frac{c_{m2}}{u_2}\ \ (\text{flow coefficient})$$

so Eq. 3.11–3.12 become $\psi_{\text{Euler}} = \sigma - \phi/\tan\beta_2$,
and the delivered $\psi = \eta_h\psi_{\text{Euler}}$. Rocket centrifugal
stages run $\psi = 0.45$–$0.60$ and $\phi = 0.08$–$0.20$. [E], [SP-8109]

$\psi$ is the design tool you use first, because it inverts to tip speed:

$$u_2 = \sqrt{\frac{g_0 H}{\psi}}$$

**Head is bought with tip speed and nothing else.** A stage delivering
2 000 m of head at $\psi=0.5$ needs $u_2 = 198$ m/s no matter how large or
small the pump is. Want more head from one stage? Spin the rim faster, and
meet §3.14's stress limit. Want the same head from a smaller pump? Spin it
faster still.

**Power and efficiency.**

$$P_{\text{shaft}} = \frac{\dot m\,\Delta p_p}{\rho\,\eta_p}
= \frac{\dot m\,g_0 H}{\eta_p}, \qquad
\eta_p = \eta_h\,\eta_v\,\eta_m$$

> **Eq. 3.13** — variables: $\eta_p$ overall pump efficiency, the product of
> hydraulic efficiency $\eta_h$ (blade and diffuser losses), volumetric
> efficiency $\eta_v$ (front-seal and balance-piston leakage recirculating
> to inlet), and mechanical efficiency $\eta_m$ (disc friction on the
> impeller back face, bearing and seal drag). Assumes: incompressible.
> Fails for hydrogen at high pressure ratio, where the density rise through
> the pump is 10–20 % and you must integrate $\int dp/\rho$ instead. Typical
> rocket values [E]: $\eta_p = 0.55$–$0.65$ for small or low-specific-speed
> stages, $0.70$–$0.80$ for well-matched large stages. Terrestrial process
> pumps reach 0.88; rocket pumps do not, because they trade efficiency for
> mass and for suction performance.

**Volute and diffuser.** The impeller discharges with $c_{u2}$ of order
$0.5$–$0.6\,u_2$ — for the LOX pump of WE2, 83 m/s, whose dynamic head is
about 39 bar, a third of the total rise. Recovering it is not optional. Two
options: a **vaned diffuser** (a row of stationary blades; higher peak
efficiency, narrower operating range, and a source of blade-passing
excitation at $Z_{\text{imp}}\times Z_{\text{diff}}$ frequencies), or a
**volute** (a spiral collector of increasing area; wider range, lower peak
efficiency, and a source of a once-per-revolution radial side load away from
the design point, which the bearings must carry). Rocket pumps use both;
volutes dominate where throttling range matters, vaned diffusers where peak
efficiency at one point matters. [SP-8109]

### 3.11 Specific speed: the one number that picks the machine

Combine $\psi$ and $\phi$ so the diameter cancels:

$$N_s = \frac{\omega\sqrt{Q}}{(g_0 H)^{3/4}}$$

> **Eq. 3.14** — variables: $\omega$ [rad/s]; $Q$ volumetric flow through one
> stage, one flow path [m³/s]; $H$ head rise *per stage* [m]. This is the
> dimensionless SI form. **Beware the units.** US practice uses
> $N_s = N\sqrt{Q}/H^{3/4}$ with $N$ in rpm, $Q$ in US gpm and $H$ in feet,
> which is larger than the SI dimensionless value by a factor of 2 733. The
> 1960s–70s NASA monographs use the US form throughout [SP-8109], [SP-8107];
> [Brennen-Pumps] uses the dimensionless form. A number near 1 is
> dimensionless; a number near 2 000 is US. Never mix them.
> Assumes: geometric similarity, single stage, single suction. Fails as a
> selector when the machine is far off its best efficiency point.

Specific speed answers *what shape of impeller* the duty wants:

| $N_s$ (SI, dimensionless) | US equivalent | impeller type | where you meet it |
|---|---|---|---|
| 0.1–0.3 | 270–820 | narrow radial, often multistage | high-head/low-flow: RP-1 and storable fuel pumps, LH₂ first stages |
| 0.3–0.8 | 820–2 200 | radial (Francis) centrifugal | the bulk of rocket LOX and fuel pumps |
| 0.8–1.5 | 2 200–4 100 | mixed flow | large-flow LOX pumps, boost pumps |
| 1.5–4.0 | 4 100–11 000 | axial | LH₂ multistage pumps, inducers, low-pressure boost stages |

The design use is mechanical: compute $N_s$ for your duty, and if it falls
below about 0.3 the impeller wants to be so narrow that $\eta_p$ collapses
and disc friction dominates. **The two fixes are to raise $\omega$ or to
split the head across $k$ stages**, which raises $N_s$ by $k^{3/4}$. A fuel
pump at $N_s = 0.31$ split into two stages moves to $0.53$ — squarely in the
good band. That, and nothing more mysterious, is why high-head pumps are
multistage: the RS-25 HPFTP is a **three-stage centrifugal** machine
[_verify-liquid] because one hydrogen stage at 35 360 rpm cannot make
50 000 m of head at a sensible $N_s$ and a survivable tip speed.

### 3.12 Axial pumps

When $N_s$ exceeds about 1.5 the flow is too large and the head per stage too
small for a radial machine, and the impeller degenerates into a propeller.
Axial stages develop head by turning the flow with an aerofoil cascade;
because the mean radius is nearly the same at inlet and outlet, the
centrifugal contribution vanishes and all the head comes from the blade's
lift. Head per stage is therefore small — $\psi$ of order 0.15–0.3 against
0.5 for a centrifugal — so axial pumps are always multistage. [F], [SP-8125]

The compensations are decisive for hydrogen:

- **Flow area per unit frontal area is high**, and LH₂'s low density (70.8
  kg/m³) means enormous volumetric flow for modest mass flow. The J-2 pumped
  hydrogen at roughly 39 kg/s — but that is 0.55 m³/s, five times the
  volumetric flow of the LOX side despite being a fifth of the mass flow.
- **Efficiency is high** when the stage count is right, because the flow is
  never turned through 90° and back.
- **Axial length replaces diameter**, which suits a slender engine and lowers
  the rotor's polar moment.

The costs are that a multistage axial rotor is long, and long rotors have low
bending critical speeds (§3.16); that each stage needs its own stator; and
that off-design behaviour is stall, which is abrupt, rather than the gentle
head droop of a centrifugal.

**The historical arc is instructive.** The **J-2 fuel pump was a 7-stage
axial machine at 27 000 rpm** [_verify-liquid]. Its successor **J-2X replaced
it with a centrifugal fuel pump** — the programme listed this as one of its
four principal design changes. The RS-25 uses a **3-stage centrifugal** HPFTP
and keeps the axial architecture only for the **low-pressure fuel turbopump**
(LPFTP, an axial stage at 16 185 rpm). The verdict of sixty years: axial
pumps belong where the volumetric flow is huge and the head per stage is
small — i.e. as boost stages and inducers — while the main head rise is
better made centrifugally.

### 3.13 Inducers, cavitation and NPSH

#### 3.13.1 The problem

A centrifugal impeller accelerates fluid on the suction side of its leading
edge. If the local static pressure there falls to the propellant's vapour
pressure, the liquid boils. Vapour bubbles are swept into the higher-pressure
passage and collapse violently, which does three things, in increasing order
of seriousness:

1. **Erodes** the blade — pitting on the suction side within millimetres of
   the leading edge, the classic cavitation signature.
2. **Blocks** the passage with vapour, so the stage stops making head. The
   engine's whole pressure schedule collapses within a fraction of a second.
3. **Oscillates.** Rotating cavitation and auto-oscillation (cavitation
   surge) make the cavity length modulate periodically, which modulates the
   flow, which excites the feed line and the structure. This is the mechanism
   underneath **POGO**, previewed in §3.18.

#### 3.13.2 NPSH available, derived

Write the steady Bernoulli/energy equation from the liquid free surface in
the tank (state $t$) to the pump inlet (state $1$), in a vehicle accelerating
at $a$:

$$\frac{p_t}{\rho} + a z = \frac{p_1}{\rho} + \frac{V_1^2}{2} + \frac{\Delta p_{\text{line}}}{\rho}$$

NPSH is defined as the *total* head at the pump inlet in excess of the head
corresponding to vapour pressure:

$$\mathrm{NPSH_a} \equiv \frac{p_1 + \tfrac12\rho V_1^2 - p_v}{\rho g_0}$$

Substituting,

$$\boxed{\;\mathrm{NPSH_a} = \frac{p_t - p_v - \Delta p_{\text{line}}}{\rho g_0} + z\,\frac{a}{g_0}\;}$$

> **Eq. 3.15** — variables: $\mathrm{NPSH_a}$ available net positive suction
> head [m]; $p_t$ tank ullage pressure [Pa]; $p_v$ propellant vapour pressure
> **at the local bulk temperature** [Pa]; $\Delta p_{\text{line}}$ suction-line
> loss from tank to pump inlet [Pa]; $\rho$ liquid density [kg/m³]; $z$
> height of liquid surface above the pump inlet [m]; $a$ axial acceleration
> [m/s²]. Assumes: steady flow, uniform liquid temperature, no vapour
> entrained. Fails when: the propellant is stratified (a cryogen sitting in a
> tank warms at the surface and the *bulk* is colder than saturation, which
> helps; but a self-pressurised tank's liquid at the outlet may be at
> saturation, which is the worst case), or during transients — a throttle
> step, a stage separation, or the start of a slosh cycle can take NPSH away
> for a few hundred milliseconds.

Read the terms. **$p_t - p_v$ is what pressurisation buys you.** A tank
pressurised with helium over subcooled LOX has a large margin; a
**self-pressurised (autogenous) tank, where the ullage gas is the propellant's
own vapour in equilibrium with the liquid, has $p_t = p_v$ and gets nothing
from tank pressure at all** — the whole NPSH must come from the $z\,a/g_0$
term. That is a real architecture (it is one of the reasons boost pumps
exist) and it is the first thing to check when someone tells you their
autogenous system needs no boost stage.

The $z\,a/g_0$ term also explains why NPSH is worst at two moments: at
**start**, when $a \approx g_0$ (or zero, on orbit) and the liquid column is
tall but the acceleration is small; and at **burnout**, when $a$ may be large
but $z\to0$. Every engine has a "minimum NPSH" point in its start box and it
is usually right at ignition.

#### 3.13.3 NPSH required and suction specific speed

Cavitation onset is a similarity problem like head rise, and it
nondimensionalises the same way:

$$N_{ss} = \frac{\omega\sqrt{Q}}{(g_0\,\mathrm{NPSH})^{3/4}}
\qquad\Longrightarrow\qquad
\mathrm{NPSH_r} = \frac{1}{g_0}\left(\frac{\omega\sqrt{Q}}{N_{ss}}\right)^{4/3}$$

> **Eq. 3.16** — variables: $N_{ss}$ suction specific speed [—, SI
> dimensionless form; multiply by 2 733 for the US rpm–gpm–ft form];
> $\mathrm{NPSH_r}$ the NPSH at which the stage loses a defined amount of
> head, conventionally 2 % or 3 %. Assumes: geometric and cavitation
> similarity; a fixed definition of "required". Fails when: the criterion
> changes (NPSH at 3 % head loss is not NPSH at incipient cavitation, which
> can be 2–3× higher, and it is not NPSH free of rotating cavitation, which
> can be higher still — [Brennen-Pumps] is emphatic that suppressing head
> loss and suppressing cavitation instability are different requirements).
> Typical attainable $N_{ss}$ [E], [SP-8052]:
> **2–3** plain centrifugal impeller, no inducer;
> **4–6** impeller with a modest inducer;
> **7–10** a well-designed rocket inducer;
> **>10** claimed on some hydrogen inducers exploiting thermodynamic effects.

$\mathrm{NPSH_r} \propto \omega^{4/3}$. Suction is the hard constraint on
shaft speed, and it is the reason no rocket pump runs as fast as its stress
limit would allow.

#### 3.13.4 Inducers

An **inducer** is a low-solidity axial screw mounted on the shaft ahead of
the main impeller. It has two or three long, thin, highly swept blades at a
very shallow inlet angle (typically **6–12°** from tangential at the tip,
opening to 15–25° at hub) and generates only enough head — 5–10 % of the
stage total — to push the main impeller's inlet above its own cavitation
limit. [SP-8052]

Why it works, mechanically: the inducer is *designed to cavitate*. It runs
with a stable sheet cavity attached along the blade suction surface, and its
low blade loading, high solidity and shallow angle mean the cavity closes
inside the passage rather than choking it. Head is developed downstream of
the cavity. A conventional impeller cannot do that because its blade loading
is an order of magnitude higher.

What sets the design:

- **Inlet tip flow coefficient** $\phi_{t1} = c_{m1}/u_{t1} \approx 0.06$–$0.12$.
  Lower gives better suction performance and worse stability margin.
- **Incidence-to-blade-angle ratio.** The blade angle is roughly twice the
  flow angle, so the cavity forms at design point and is stable.
- **Tip clearance**, which is the dominant single parameter for both
  suction performance and rotating cavitation. Tight is better and tight
  is hard on a shaft that grows thermally and moves dynamically.

Inducers introduce failure modes of their own, and the record is unambiguous
about their severity. **Rotating cavitation** — a cavity pattern that
propagates around the blade row at a fraction of, or faster than, shaft speed
— produces a rotating pressure field that loads the blades at a frequency
unrelated to any structural design case. **The H-II Flight 8 failure of
15 November 1999 was an LE-7 LH₂ turbopump inducer failure**
[_verify-liquid], and the LE-7A that replaced it *reduced* chamber pressure
from 12.7 to 12.0 MPa to buy turbopump margin — an explicit, published,
performance-for-reliability de-rating that every student should know about.

#### 3.13.5 Thermodynamic suppression head: why cryogens cheat

When a cavity forms in a cryogenic liquid, the latent heat of vaporisation
must come from the surrounding liquid, which therefore **cools**. Cooler
liquid has a lower vapour pressure, which *suppresses* further vaporisation.
The cavity is smaller than an isothermal analysis predicts, and the pump
behaves as though it had more NPSH than it does. The bonus is called
**thermodynamic suppression head**.

Its magnitude scales with a parameter of the form

$$B \sim \frac{\rho_l}{\rho_v}\cdot\frac{c_{p,l}\,\Delta T}{h_{fg}},
\qquad
\mathrm{TSH} \approx \frac{1}{\rho_l g_0}\frac{dp_v}{dT}\,\Delta T$$

> **Eq. 3.17** — variables: $\rho_l,\rho_v$ liquid and vapour density
> [kg/m³]; $c_{p,l}$ liquid specific heat [J/(kg·K)]; $h_{fg}$ latent heat
> [J/kg]; $\Delta T$ the local temperature depression [K]; $dp_v/dT$ the
> slope of the vapour-pressure curve [Pa/K]. Assumes: thermal equilibrium
> between cavity and surrounding liquid, which is a strong assumption at high
> speed. Fails as a predictive tool — TSH is used as a *credit* validated by
> test, never as a design margin taken on faith [Brennen-Pumps].

Run the two propellants at their normal boiling points [NIST]:

| | LOX at 90.2 K | LH₂ at 20.3 K |
|---|---|---|
| $\rho_l/\rho_v$ | ≈ 255 | ≈ 53 |
| $c_{p,l}/h_{fg}$ (1/K) | 0.0080 | 0.0217 |
| $dp_v/dT$ (kPa/K) | ≈ 8.4 | ≈ 7.3 |
| TSH per K of local cooling | 0.75 m | **10.5 m** |

**Hydrogen gets an order of magnitude more benefit than oxygen**, because its
liquid density is 16 times lower so the same pressure change is a much larger
head. This is a large part of why hydrogen inducers achieve $N_{ss}$ values
that would be impossible in water, and why **water-flow testing of a
cryogenic inducer under-predicts its flight suction performance** — a
systematic conservatism the test engineer must be able to quantify rather
than merely assert.

Storable propellants at ambient temperature get essentially nothing: NTO and
MMH are far from their critical points, the density ratio is large but
$c_p/h_{fg}$ is small, and the vapour-pressure slope is modest. Their pumps
must be sized on cold, isothermal cavitation physics.

#### 3.13.6 Boost pumps, and why the RS-25 has two of them

If NPSHa is fixed by the vehicle (tank pressure costs stage mass; $z$ is set
by the layout; $a$ is set by the trajectory) and NPSHr rises as
$\omega^{4/3}$, then a high-pressure pump fast enough to make 500 bar simply
cannot ingest propellant at 3 bar. There are three ways out, and the RS-25
uses the third:

1. **Raise tank pressure.** Costs stage mass, and on the Shuttle's External
   Tank that mass is on the critical path for the whole vehicle.
2. **Slow the pump down.** Costs a larger, heavier pump, or a gearbox.
3. **Put a slow, high-suction-performance stage in front of the fast one.**

That third option is the **boost pump** or **low-pressure turbopump**. The
RS-25's arrangement is the textbook case [_verify-liquid], [SSME-Orient]:

| unit | type | speed | job |
|---|---|---|---|
| **LPFTP** | axial | ~16 185 rpm | raises LH₂ from tank pressure to a few bar so the HPFTP will not cavitate. Driven by a hydraulic turbine using high-pressure liquid hydrogen tapped from the HPFTP discharge. |
| **HPFTP** | 3-stage centrifugal | ~35 360 rpm, 53.05 MW (71 140 hp) | makes the pressure. Discharge ~7 000 psi (483 bar). |
| **LPOTP** | — | ~5 150 rpm | boosts LOX for the HPOTP. Driven by a liquid-oxygen turbine. |
| **HPOTP** | 2-stage centrifugal (main + preburner boost on one shaft) | ~28 120 rpm, 17.34 MW (23 260 hp) | makes main and preburner LOX pressure. |

Four pumps, four turbines, two of which run on liquid rather than hot gas.
The LPOTP at 5 150 rpm is running seven times slower than the HPOTP; that
speed ratio is exactly Eq. 3.16 being obeyed. **The complexity is not
gratuitous. It is the price of 206 bar chamber pressure at External Tank
ullage pressures, and the alternative — pressurising the ET to what the HPFTP
would otherwise need — would have cost more mass than four turbopumps.**

### 3.14 Affinity laws, scaling, and why small engines spin fast

For geometrically similar pumps at similar flow coefficients:

$$\frac{Q_2}{Q_1} = \frac{N_2}{N_1}\left(\frac{D_2}{D_1}\right)^3,\qquad
\frac{H_2}{H_1} = \left(\frac{N_2}{N_1}\right)^2\left(\frac{D_2}{D_1}\right)^2,\qquad
\frac{P_2}{P_1} = \frac{\rho_2}{\rho_1}\left(\frac{N_2}{N_1}\right)^3\left(\frac{D_2}{D_1}\right)^5$$

> **Eq. 3.18 (affinity laws)** — variables as defined; $N$ may be in rpm or
> rad/s provided it is consistent. Assumes: geometric similarity, equal
> efficiency, equal flow coefficient, no cavitation, incompressible.
> Fails when: Reynolds number changes enough to move efficiency (small pumps
> are less efficient — the "size effect"), when tip clearance does not scale
> (it never does; clearances are set by manufacturing tolerance and thermal
> growth, so small pumps have proportionally larger clearances and lose
> more), and when cavitation intervenes.

Now the design question that actually matters. **Scale an engine down at
constant chamber pressure.** Thrust and mass flow scale as some factor $s$;
head is unchanged, because $p_c$ and every $\Delta p$ in Eq. 3.1 are
unchanged. Then from $N_s = \omega\sqrt{Q}/(g_0H)^{3/4}$ held constant:

$$\omega \propto Q^{-1/2} \propto s^{-1/2}, \qquad D \propto \omega^{-1} \propto s^{1/2}$$

(the second follows from $H\propto N^2D^2$ at constant $H$).

**Shaft speed goes as the inverse square root of thrust.** Cut thrust by a
factor of 25 and the pump must spin five times faster. The record confirms
it with startling consistency:

| engine | thrust | pump speed |
|---|---|---|
| F-1 | 6 770 kN SL | 5 488 rpm |
| RD-107A | 839 kN SL (4 chambers, 1 pump) | steam-turbine driven, single shaft |
| Merlin 1D | 845 kN SL | ~36 000 rpm |
| RS-25 HPFTP | 2 279 kN vac | 35 360 rpm |
| Vulcain 2 LH₂ pump | 1 359 kN vac | ~36 500 rpm *(medium confidence)* |
| RD-0146 fuel pump | 68.6 kN vac | **>120 000 rpm** |
| Rutherford (electric) | 25 kN | 40 000 rpm motors |

Two corollaries fall straight out:

- **Tip speed is invariant under this scaling.** $u_2 = \omega D/2$, and
  $\omega\propto s^{-1/2}$ while $D\propto s^{1/2}$. Which is as it must be,
  since $u_2 = \sqrt{g_0H/\psi}$ and $H$ did not change. Small pumps are not
  more highly stressed at the rim; they are just faster.
- **Suction requirement is invariant too.** $\omega\sqrt{Q}$ is unchanged, so
  by Eq. 3.16 $\mathrm{NPSH_r}$ is unchanged. **A 100 kN engine needs the same
  tank pressure as a 500 kN engine.** Pressurisation system requirements do
  not scale down with the vehicle, which is one of the quiet reasons small
  launchers have a worse dry-mass fraction than big ones.

**Tip speed and stress.** The limit on $u_2$ is the impeller's own hoop and
radial stress. For a rotating disc the peak stress is
$\sigma \approx k\rho u_2^2$ with $k$ between about 0.4 (thin uniform disc,
central hole) and 0.75 depending on geometry, so

$$u_{2,\max} \approx \sqrt{\frac{\sigma_{\text{allow}}}{k\,\rho_{\text{mat}}}}$$

> **Eq. 3.19** — variables: $\sigma_{\text{allow}}$ allowable stress at
> temperature, after knockdowns for low-cycle fatigue and (for LOX-wetted
> parts) any ignition-sensitivity constraint on the alloy [Pa];
> $\rho_{\text{mat}}$ material density [kg/m³]; $k$ geometry factor.
> Assumes: elastic, isothermal, no stress concentration. Fails at the blade
> roots and the eye fillet, where the concentration factor and the
> low-cycle-fatigue life actually govern; and for hydrogen-wetted parts,
> where hydrogen environment embrittlement can halve the usable strength of
> a nickel alloy (Module 16).

For Inconel 718 ($\sigma_{\text{allow}}\approx 900$ MPa after knockdowns,
$\rho = 8 190$ kg/m³, $k=0.6$): $u_{2,\max} \approx 428$ m/s. For titanium
6Al-4V ($800$ MPa, $4 430$ kg/m³): $u_{2,\max}\approx 549$ m/s — which is why
titanium impellers are attractive, and why they are forbidden in liquid
oxygen, where titanium is ignition-sensitive to impact. Real practice runs
**300–500 m/s** on hydrogen stages and **150–250 m/s** on LOX and kerosene
stages [E], [SP-8109]. The oxygen limit is not stress; it is that any
rubbing contact in a LOX pump at high rubbing velocity is an ignition source,
so clearances, materials and rub tolerance govern long before the disc does.

### 3.15 Seals

The seal package is where a turbopump is most likely to kill you, because it
is the only place where fuel, oxidiser and hot gas are separated by
millimetres of moving hardware.

- **Wear-ring / labyrinth seals** control leakage from impeller discharge back
  to inlet. Leakage is lost work (it appears in $\eta_v$) and it sets the
  axial thrust balance.
- **Axial thrust balance.** An impeller sees a large net axial force from the
  pressure difference across its discs. Uncontrolled, it exceeds any
  practical thrust bearing. Rocket pumps use **balance pistons** — a
  controlled-leakage cavity whose pressure varies with axial position,
  producing a stiff restoring force — and/or back-shroud balance holes. The
  balance piston is a servo-mechanism nobody drew as one, and its failure
  mode is bearing overload. [SP-8107]
- **The interpropellant seal (IPS)** is the critical one on any single-shaft
  pump that carries a fuel impeller and an oxidiser impeller on one shaft.
  Between them, along the shaft, are two dynamic seals with a **drained,
  purged cavity** between: a fuel-side seal, a vented and helium- (or
  nitrogen-) purged intermediate cavity, and an oxidiser-side seal. Leakage
  from either seal goes into the purge and overboard, never into the other
  propellant. **The purge is not a nicety. It is the primary safety feature
  of a single-shaft turbopump**, and its pressure is monitored on every test
  and every flight.

Two philosophies, both defensible:

- **RS-25 / dual-shaft:** put the fuel and oxidiser on *separate machines* and
  the interpropellant-seal problem largely disappears. The HPOTP still needs
  a seal between the LOX pump and its hot fuel-rich turbine gas, and it is
  the most heavily instrumented seal on the engine — three seals with two
  purged and drained cavities, because hot hydrogen-rich gas meeting liquid
  oxygen is the failure that ends the vehicle.
- **RD-180 / single-shaft, oxidiser-rich:** the entire turbine works in
  **oxygen-rich** gas, so there is no fuel on the turbine side to keep apart
  from the LOX. The seal problem is transformed into a *materials* problem:
  everything in the hot oxygen path is coated with an **inert enamel**
  [_verify-liquid]. That coating is the single technology that made ORSC
  survivable, and it is why the West spent thirty years believing the cycle
  was impossible. The Russians did not solve the seal; they removed the
  reason for it.

### 3.16 Bearings

| type | how it works | DN limit | where used |
|---|---|---|---|
| **Rolling element** (angular-contact ball, some roller) | Hertzian contact, cage-guided | ~1.5–2.5 million mm·rpm in rocket service; ~3 M with hybrid Si₃N₄ balls | the historical default: F-1, J-2, RS-25 (original), Merlin |
| **Hydrostatic** | externally pressurised propellant film in recessed pockets; stiffness set by supply pressure and orifice restriction | no DN limit in the same sense; limited by film stability and available supply pressure | **BE-4** [_verify-liquid], the RS-25 Block II HPFTP's revised design philosophy, and most modern reusable-engine studies |
| **Hydrodynamic / foil** | self-generated film | rarely used in liquid rocket pumps — the fluid film is the propellant, and startup rubbing in LOX is unacceptable | experimental |

**Lubrication is the propellant.** There is no oil in a rocket turbopump; a
grease or oil would freeze at 90 K, react with LOX, or be washed away.
Bearings run in the pumped fluid, which means:

- **Liquid oxygen and liquid hydrogen are terrible lubricants.** Their
  viscosities are 0.19 mPa·s and 0.013 mPa·s respectively, against 10–100
  mPa·s for a bearing oil. The elastohydrodynamic film that separates a ball
  from a race in an oil-lubricated bearing essentially does not form. Contact
  is metal-to-metal, and life is set by wear, not by fatigue.
- **The cage does the lubricating.** The standard solution is a
  **PTFE-based (Armalon / glass-fibre-reinforced PTFE) cage** that transfer-films
  a few microns of PTFE onto the races. It works, it wears out, and it sets
  the inspection interval.
- **Coolant flow is a design requirement.** The NK-33 explicitly requires
  **subcooled liquid oxygen for bearing cooling** [_verify-liquid], which
  constrains ground operations forty years after the engine was built.
- **Rolling-element bearings in LOX are an ignition hazard** whenever the film
  breaks down. Bearing distress in a LOX pump is not a maintenance item; it
  is an engine loss.

The RS-25's bearings were the single most persistent development problem on
the engine. Turbopump bearing life on the original HPFTP was measured in a
handful of flights, and the Block II redesign — the reason for a new HPFTP,
first flown STS-104 in 2001 [_verify-liquid] — was substantially about
bearings and rotordynamics [Biggs89]. **Blue Origin's choice of hydrostatic
bearings on the BE-4 is a direct response to exactly this history**: a
hydrostatic film has no rolling contact, no cage and no wear mechanism at
speed, and its life is therefore limited by the number of start/stop
transients rather than by run time. For an engine designed around reuse that
is the right trade; for an expendable engine the added complexity of a
high-pressure bearing supply circuit is not worth it. [J]

### 3.17 Rotordynamics

A turbopump rotor is a flexible shaft carrying heavy discs on compliant
bearing supports and running inside close-clearance seals full of moving
fluid. It has bending critical speeds, and the fluid in its seals and
impellers exerts *cross-coupled* forces that can drive instability.

- **Critical speeds.** The rotor is designed to run either **subcritical**
  (below the first bending mode — safe, but forces a short, stiff, large-
  diameter shaft, which conflicts with wanting a small pump) or
  **supercritical** (above it, passing through the critical speed rapidly on
  the start transient, with damping sized to survive the pass). Hydrogen
  pumps, which are long and multistage, are frequently supercritical.
- **Synchronous vibration** at 1× shaft speed is unbalance. It is annoying,
  it wears bearings and it is fixable by balancing.
- **Subsynchronous whirl** is not fixable by balancing, and it is the one that
  destroys machines. A cross-coupled force — from the tangential pressure
  distribution in a seal or impeller, or from internal friction in a shrink
  fit — acts perpendicular to the shaft's displacement, in the direction of
  whirl. If it exceeds the available damping, the orbit grows without bound
  at a frequency near a fraction of running speed (typically 0.4–0.9×). The
  rotor rubs, and the rub in a LOX pump is an ignition source.

**The RS-25 HPFTP is the canonical case and it should be taught as one.**
The early HPFTP exhibited subsynchronous whirl at high power levels; the
programme's own account [Biggs89] describes the sequence of fixes —
stiffening the bearing supports, changing seal geometry to reduce
cross-coupling, adding damping — and the fact that the problem was not
finally retired until the Block II pump. What makes it a teaching case is
that the instability appeared *only above a power level threshold*, so it was
invisible in early testing, and that the engineering community had to develop
the analysis (Alford-type cross-coupling in seals and impellers, and the
damping-seal work that followed) largely because of this machine.

**Practical countermeasures**, roughly in order of how often they are used:
damping seals (deliberately roughened or honeycomb stators that convert
cross-coupling into damping), squeeze-film dampers at the bearings, stiffer
and better-aligned bearing carriers, reduced seal clearances, and — last
resort — changing the operating speed range.

### 3.18 POGO, previewed

Cavitation compliance in the pump inlet acts as a soft spring in the feed
line. That spring, the inertia of the propellant column, and the
longitudinal structural mode of the vehicle can close a loop: structure
oscillates → acceleration modulates the pump inlet pressure → cavity volume
modulates → flow and hence thrust modulate → structure is driven. The gain
depends on the cavitation compliance, which depends on NPSH, which is why
**POGO is a feed-system problem that manifests as a structural one**. The
standard fix is a gas-filled **accumulator** in the oxidiser suction line,
tuned to detune the loop — the Saturn V's F-1 accumulators and the Shuttle's
LOX accumulator are the flown examples. Module 15 develops the coupled
model; the point here is only that the compliance comes from §3.13, not from
anywhere else.

### 3.19 Turbines

The turbine converts hot-gas enthalpy to shaft work. Rocket turbines occupy a
corner of turbomachinery that gas-turbine practice does not cover: very high
pressure ratio, very low flow, short life, and an absolute premium on mass.

**Ideal work and flow requirement.**

$$P_t = \eta_t\,\dot m_t\,c_p\,T_{t,\text{in}}\left[1 - \pi_t^{-(\gamma-1)/\gamma}\right]$$

> **Eq. 3.20** — variables: $P_t$ shaft power [W]; $\eta_t$ turbine total-to-
> static efficiency [—]; $\dot m_t$ turbine gas flow [kg/s]; $c_p$ gas
> specific heat [J/(kg·K)]; $T_{t,\text{in}}$ turbine inlet stagnation
> temperature [K]; $\pi_t$ total-to-static pressure ratio [—]; $\gamma$ ratio
> of specific heats. Assumes: calorically perfect gas, adiabatic, no
> chemical change through the turbine. Fails when: the gas recombines or
> reacts across the stage (fuel-rich kerolox gas contains unburned species
> and soot; the effective $c_p$ is not the frozen value), and when the flow
> is choked in a way that fixes $\dot m$ independent of the pressure ratio.

The equation says the three levers are $T_{\text{in}}$, $\pi_t$ and
$\eta_t$. All three are constrained:

- **$T_{\text{in}}$ is limited by uncooled blade material.** Rocket turbine
  blades are almost never cooled — there is no bleed air, the duty cycle is
  minutes, and the mass cost is unacceptable. Gas-generator engines therefore
  run **deliberately far off stoichiometric** to keep the gas cool:
  **900–1 200 K is the normal fuel-rich GG band**, achieved at mixture ratios
  around 0.3–0.4 for kerolox instead of 2.3. Staged-combustion preburners run
  hotter — 950–1 100 K fuel-rich on the RS-25, and oxidiser-rich preburners
  on Russian engines run in the same range but in an *oxidising* atmosphere,
  which is a far harder materials problem.
- **$\pi_t$ is set by the cycle.** A gas-generator turbine exhausts to
  ambient or to a low-pressure dump nozzle, so $\pi_t$ of 20–40 is available
  and the turbine is small. A staged-combustion turbine exhausts *into the
  main chamber*, so $\pi_t$ is only 1.3–2.0 and the turbine must pass the
  entire propellant flow to make the same power. That single difference is
  most of what distinguishes the two cycles mechanically (Module 13).
- **$\eta_t$ is limited by blade speed ratio.** Peak efficiency for an
  impulse stage occurs at $U/C_0 \approx 0.45$–$0.50$; for a reaction stage at
  $\approx 0.7$. With $\pi_t = 30$ the spouting velocity $C_0$ is well over
  1 500 m/s, so $U/C_0$ optimum would demand blade speeds no material can
  survive. **Rocket GG turbines therefore run at $U/C_0$ of 0.2–0.3 and accept
  $\eta_t = 0.5$–$0.65$.** Staged-combustion turbines, with their low pressure
  ratio, sit much closer to optimum and reach $\eta_t = 0.75$–$0.85$.

**Impulse versus reaction.** An *impulse* stage expands the gas entirely in
the stationary nozzles and the rotor merely turns the flow at constant static
pressure; a *reaction* stage expands across both. Impulse stages tolerate
huge pressure ratios in one blade row, tolerate **partial admission**, and
have no axial thrust from pressure drop across the rotor. Reaction stages
are more efficient but need full admission and full annulus pressure
containment. **Gas-generator engines use impulse turbines, usually two-row
velocity-compounded (a Curtis stage); staged-combustion engines use reaction
turbines.** The F-1's two-stage turbine and the J-2's turbines are impulse;
the RS-25's are reaction.

**Partial admission** means feeding gas to only a fraction of the nozzle
annulus. When the flow is very small and the pressure ratio very large, a
full-admission stage would need blades so short that tip clearance and
end-wall losses swamp it. Admitting the same flow through, say, 30 % of the
arc lets you use blades three times taller. The costs are a windage loss on
the unpumped arc and, importantly, a **once-per-revolution impulsive load on
every blade as it enters and leaves the admitted arc** — a fatigue driver
that has to be designed for explicitly. [SP-8110]

### 3.20 Turbopump architectures

| architecture | description | examples | why |
|---|---|---|---|
| **Single shaft, direct drive** | one turbine, both impellers, one shaft | **F-1** (5 488 rpm, 41 MW), **Merlin 1D** (~36 000 rpm, ~7.5 MW), **RD-107/108**, **RD-180**, **RD-0120**, **BE-4** | Fewest parts, one bearing set, one turbine. Requires both pumps to want the same speed — which, when the propellant densities are within a factor of two (kerolox, methalox, storables), they roughly do. The interpropellant seal is the price. |
| **Single shaft, geared** | one turbine, gearbox splitting to two pump speeds | **RL10** (LH₂ pump ~31 000 rpm, geared down to the LOX pump), **H-1**, **RS-27**, **MB-3** | Lets the LH₂ pump run fast and the LOX pump slow, from one turbine. Buys the speed ratio without a second turbine. Costs a gearbox: lubrication, wear, a torsional mode, and a hard power ceiling ([SP-8100] is the design reference and it is a short book because gearing does not scale). |
| **Two separate turbopumps, series turbines** | independent shafts; one gas stream through both turbines in series | **J-2** (7-stage axial fuel pump at 27 000 rpm; single-stage centrifugal LOX pump at 8 600 rpm) | Each pump gets its own speed with no gearbox. Series gas flow makes the mixture ratio partly self-regulating: if the fuel turbine speeds up it takes more energy, leaving less for the LOX turbine. |
| **Two separate turbopumps, parallel turbines, plus boost pumps** | fully independent shafts, own preburners | **RS-25** (LPFTP + HPFTP, LPOTP + HPOTP; two preburners) | Complete freedom in speed selection for each fluid, and the boost pumps decouple suction performance from the high-pressure pump speed. Maximum performance, maximum parts count, maximum cost. |
| **Full-flow staged combustion pair** | an oxidiser-rich preburner drives the LOX pump; a fuel-rich preburner drives the fuel pump; both exhausts enter the main chamber | **Raptor** (*all figures company claims* [_verify-liquid]); previously only the never-flown **RD-270** and the test-only Integrated Powerhead Demonstrator | Each turbine runs in a gas of its own propellant, so **the interpropellant seal problem disappears entirely** — there is no fuel/oxidiser interface on either shaft. Both turbines run relatively cool for their power because they pass the whole flow. The cost is two preburners, two full-flow turbines and the hardest ignition and start sequencing problem in the business. |

**Real turbopump data**, all from `reference/_verify-liquid.md` with its
confidence labels carried:

| engine | shaft(s) | speed (rpm) | shaft power | discharge / notes |
|---|---|---|---|---|
| **V-2** | single, steam turbine | 4 000 | ~430 kW (580 hp) | ~68 kg/s LOX, ~55 kg/s alcohol; $p_c$ 15.2 bar |
| **Redstone A-7** | single, steam turbine | 4 718 | 565 kW (758 hp) | |
| **F-1** | single, 2-stage impulse turbine | **5 488** (Wikipedia rounds to 5 500) | **41 MW (55 000 bhp)** | single-stage centrifugal on each propellant; no gearbox |
| **J-2** | two, turbines in series | fuel **27 000**, ox **8 600** | not published | fuel 7-stage axial; ox single-stage centrifugal |
| **RL10A-3-3A** | single + gearbox | LH₂ ~**31 000** *(medium confidence)* | not published | 2-stage centrifugal LH₂; single-stage centrifugal LOX on the slow shaft |
| **RS-25 LPFTP** | axial | ~**16 185** | — | LH₂ boost, hydraulic-turbine driven |
| **RS-25 HPFTP** | 3-stage centrifugal | ~**35 360** | **53.05 MW (71 140 hp)** | discharge ~7 000 psi (483 bar) |
| **RS-25 LPOTP** | — | ~**5 150** | — | LOX boost |
| **RS-25 HPOTP** | 2-stage centrifugal (main + preburner boost) | ~**28 120** | **17.34 MW (23 260 hp)** | |
| **Merlin 1D** | single shaft, dual impeller | ~**36 000** *(company figure)* | ~**7.5 MW (10 000 hp)** *(company figure)* | one shaft carries LOX and RP-1 impellers and the turbine |
| **Vulcain 1** | two | LOX 13 600; LH₂ 34 000 | LOX 3 MW; LH₂ 12 MW | |
| **Vulcain 2** | two | LOX ~12 300; LH₂ ~**36 500** *(medium confidence)* | not published | |
| **RD-170/171** | single | not published | **~170 MW** (article body) / **192 MW** (spec table) — **contested** | most powerful rocket turbopump ever built either way; ~3× the RS-25 HPFTP |
| **RD-180** | single, ox-rich | not published | not published (RD-170 scales to roughly half) | two chambers on one turbopump |
| **BE-4** | single, ox-rich | not published | ~**56 MW (75 000 hp)** | **hydrostatic bearings** |
| **RD-0146** | two | fuel **>120 000** | not published | highest published rocket turbopump speed |
| **Rutherford** | electric | 40 000 | 2 × 37 kW (50 hp) motors | no turbine at all; batteries |
| **Raptor** | two (FFSC) | **not published** | **not published** | company has released neither figure |

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| Pressure-fed $p_c$ | **7–25 bar** | Aestus 11 bar, SPS ~6.9 bar | **SuperDraco 69 bar** (short burn, tiny propellant load) |
| Pressure-fed tank pressure / $p_c$ | 1.3–1.6 | short, uncooled, low-$\Delta p$ injectors | 1.8+ on regeneratively cooled pressure-fed engines |
| Injector $\Delta p/p_c$, liquid | 15–25 % | ~10 % on expander hydrogen circuits | 30 %+ on deep-throttling and small thrusters |
| Regen jacket $\Delta p$ | 10–60 bar | 2 bar on a small storable | >100 bar on high-$p_c$ hydrogen (Module 11) |
| Feed-line liquid velocity | 4–10 m/s | 3 m/s on a suction line where NPSH is tight | 15 m/s on a short discharge line |
| Blowdown ratio | 1.5–4 | regulated systems, $BR=1$ | cold-gas systems, 10:1 or more |
| Collapse factor $Z_c$ | 1.1–1.6 storable | 1.0 small, fast, warm gas | **2–4** helium into LH₂ |
| COPV performance factor $pV/W$ | 1.0–1.8 ×10⁴ m | metallic bottles, ~0.3×10⁴ | best carbon overwrap |
| Pump efficiency $\eta_p$ | 0.60–0.78 | 0.5 on very low $N_s$ or very small pumps | 0.80 on a large, well-matched LOX stage |
| Head coefficient $\psi$ | 0.45–0.60 | 0.15–0.3 for an axial stage | 0.65 with radial blades |
| Flow coefficient $\phi$ | 0.08–0.20 | 0.06 at an inducer tip | 0.25 mixed-flow |
| Specific speed $N_s$ (SI) | 0.3–1.2 | 0.15 (high-head fuel stage) | 3+ (axial LH₂, inducers) |
| Suction specific speed $N_{ss}$ | 4–10 with inducer | 2–3 without | >10 claimed on LH₂ with thermodynamic credit |
| NPSHa | 10–60 m | ~5 m on a saturated tank in coast | 100 m+ downstream of a boost pump |
| Impeller tip speed $u_2$ | 150–250 m/s (LOX, RP-1); 300–500 m/s (LH₂) | | Inconel/Ti stress limit 430–550 m/s |
| Shaft speed | 5 000–40 000 rpm | F-1 5 488 | **RD-0146 >120 000** |
| Bearing DN | 1.0–2.5 million mm·rpm | | 3 M with hybrid ceramic |
| GG turbine inlet temperature | 900–1 200 K | 800 K on a very conservative design | 1 100 K preburner (RS-25) |
| GG turbine $\pi_t$ | 15–40 | | staged combustion: **1.3–2.0** |
| GG turbine $\eta_t$ | 0.50–0.65 | 0.45 partial admission, very high $\pi_t$ | 0.85 reaction stage in staged combustion |
| Turbine flow fraction (GG cycle) | **2–4 %** of total | 2 % on a well-optimised engine | 5 %+ on early or low-$\eta_t$ designs |
| Pump power per unit thrust | **5–8 W/N** at $p_c\approx100$ bar | 1 W/N at 20 bar | 20+ W/N at 300 bar staged combustion |

---

## 5. Worked examples

Two reference machines are used. **PF-20** is a fictional pressure-fed
storable upper-stage engine. **RE-500** is the Module 03 reference engine as
carried forward in Modules 06 and 07:

| RE-500 parameter | value |
|---|---|
| Propellants / $MR$ | LOX / RP-1, 2.35 |
| Nozzle-stagnation $p_c$ | 100 bar |
| Injector-end $p_{c,\text{inj}}$ | 103 bar |
| Total flow $\dot m$ | 170.03 kg/s |
| Oxidiser flow | 119.27 kg/s |
| Fuel flow | 50.76 kg/s |
| $\rho_{\text{LOX}}$ / $\rho_{\text{RP-1}}$ | 1 140 / 810 kg/m³ |
| $I_{sp}$ vac | 303.3 s |

Every number below is reproduced by `tools/examples/12.py`.

---

### WE1 — Tank pressure and pressurant mass for a 20 kN storable engine (PF-20)

**Requirement.** $F_{\text{vac}} = 20$ kN, $I_{sp,\text{vac}} = 320$ s,
NTO/MMH at $MR = 1.65$, $p_c = 12$ bar at the injector face, burn time
$t_b = 400$ s, regeneratively (fuel) cooled chamber. Helium pressurisation,
regulated, bottle at 31 MPa (310 bar) and 293 K.

**Step 1 — flows and volumes.**

$$\dot m = \frac{F}{I_{sp}g_0} = \frac{20\,000}{320\times9.80665} = 6.373\ \mathrm{kg/s}$$

$$\dot m_{ox} = \frac{1.65}{2.65}\times6.373 = 3.968\ \mathrm{kg/s},\qquad
\dot m_f = 2.405\ \mathrm{kg/s}$$

Over 400 s: $m_{ox} = 1\,587$ kg, $m_f = 962.0$ kg, total 2 549 kg.
With $\rho_{\mathrm{NTO}} = 1\,443$ kg/m³ and $\rho_{\mathrm{MMH}} = 874$
kg/m³ (Module 05):

$$V_{ox} = 1.100\ \mathrm{m^3},\qquad V_f = 1.101\ \mathrm{m^3},\qquad V = 2.201\ \mathrm{m^3}$$

(The near-equality of the two volumes at $MR\approx1.65$ is not a
coincidence; it is why NTO/MMH stages get two identical tanks. Bulk density
$= 2\,549/2.201 = 1\,158$ kg/m³.)

**Step 2 — tank pressure budget** (from §3.2):

fuel side $= 12.0 + 3.0 + 2.0 + 1.0 + 0.5 = \mathbf{18.5}$ bar;
oxidiser side $= 12.0 + 3.0 + 1.0 + 0.5 = \mathbf{16.5}$ bar.
Regulate both at 18.5 bar and trim the oxidiser with a fixed orifice.

**Step 3 — ideal pressurant mass** (Eq. 3.3), $R_{\mathrm{He}} =
8314.46/4.0026 = 2\,077.3$ J/(kg·K), $T_g = 293$ K:

$$m_{g,\text{ideal}} = \frac{p_t V}{R_g T_g} = \frac{1.85\times10^6 \times 2.201}{2077.3\times293}
= \frac{4.072\times10^6}{608\,650} = 6.689\ \mathrm{kg}$$

**Step 4 — collapse factor.** Warm helium into ambient-temperature storables
over a 400 s burn: take $Z_c = 1.35$ [E], [SP-8112]:

$$m_{g} = 1.35\times6.689 = \mathbf{9.03\ kg}$$

**Step 5 — bottle.** Blow down from 31 MPa to a regulator lockup floor of
2.1 MPa, isothermal at 293 K, with real-gas compressibility $Z_i = 1.17$ at
310 bar and $Z_f = 1.01$ (Eq. 3.5):

$$\frac{m_{\text{del}}}{V_b} = \frac{1}{R_gT}\left(\frac{p_i}{Z_i}-\frac{p_f}{Z_f}\right)
= \frac{2.650\times10^7 - 2.079\times10^6}{608\,650} = 40.12\ \mathrm{kg/m^3}$$

$$V_b = \frac{9.03}{40.12} = 0.2251\ \mathrm{m^3} = \mathbf{225\ L}$$

Note the penalty for ignoring real-gas behaviour: with $Z=1$ throughout you
would size a 190 L bottle and run out of helium 16 % early. Note also that
a *fast* blowdown is adiabatic, the bottle gas cools, and you deliver less
still — flight systems are sized on the adiabatic case.

**Step 6 — hardware mass.** COPV at $pV/W = 1.5\times10^4$ m (Eq. 3.6):

$$m_{\text{bottle}} = \frac{3.1\times10^7\times0.2251}{9.80665\times1.5\times10^4} = \mathbf{47.4\ kg}$$

Propellant tanks, aluminium 2219, $\sigma/\rho = 1.408\times10^5$ J/kg,
$k_tj = 2.25$ (Eq. 3.2):

$$m_{\text{tank}} = 2.25\times\frac{1.85\times10^6\times2.201}{1.408\times10^5} = \mathbf{65.0\ kg}$$

**Total pressurisation package: 9.0 + 47.4 + 65.0 = 121.4 kg**, against
2 549 kg of propellant — **4.8 %**. That is the honest cost of pressure
feeding at 12 bar. Repeat the arithmetic at $p_c = 50$ bar and it becomes
20 %.

**Step 7 — blowdown variant.** Delete the bottle and regulator; load the
tanks with ullage and let them decay to 18.5 bar at burnout, $BR = 4$,
isothermal ($n=1$, Eq. 3.9):

$$\frac{V_{u,i}}{V_{u,i}+V} = \frac{1}{BR} = 0.25 \Rightarrow V_{u,i} = \frac{0.25}{0.75}\times2.201 = 0.734\ \mathrm{m^3}$$

so the tanks must be 2.934 m³ — **33 % larger** than the propellant — and
designed for $p_i = 4\times18.5 = \mathbf{74\ bar}$. Check with
`blowdown_pressure(7.4e6, 0.7336, 2.9342, 1.0) = 1.85\times10^6$ Pa. ✓

Tank mass now scales with the *initial* pressure and the *larger* volume:
$2.25\times(7.4\times10^6\times2.934)/1.408\times10^5 = \mathbf{347\ kg}$,
nearly triple the entire regulated package — and thrust would fall by 75 %
across the burn. **For this engine, blowdown is not a candidate.** It becomes
one only when the propellant load is small enough that 33 % extra tank volume
is cheap, which is why you find it on RCS and monopropellant systems and not
on main engines.

**Sanity check.** The Apollo SPS carried 1.11 m³ (39.2 ft³) of helium at
25 MPa for a stage of roughly 18 500 kg of propellant [_verify-liquid]. Our
225 L for 2 549 kg scales to about 1.6 m³ for the SPS load — the same order,
and the SPS does better because its chamber pressure is roughly half ours and
it uses heated helium. The comparison is consistent.

---

### WE2 — Head and power for the RE-500 fuel and LOX pumps

**Step 1 — discharge pressure budgets** (Eq. 3.1). Cooling-jacket drop
35 bar (Module 11, kerosene-cooled milled channels at 100 bar); injector drop
20 bar (20 % of $p_c$, Module 07); line and valve losses 5 bar. Tank
pressures 3.0 bar (fuel) and 3.5 bar (LOX).

| | fuel (RP-1) | oxidiser (LOX) |
|---|---|---|
| $p_{c,\text{inj}}$ | 103 bar | 103 bar |
| injector $\Delta p$ | 20 | 20 |
| jacket $\Delta p$ | 35 | — |
| line + valve | 5 | 5 |
| **pump discharge** | **163 bar** | **128 bar** |
| pump inlet | 3.0 | 3.5 |
| **$\Delta p_p$** | **160 bar** | **124.5 bar** |

**Step 2 — head** (`pump_head`):

$$H_f = \frac{1.60\times10^7}{810\times9.80665} = \mathbf{2\,014\ m},\qquad
H_o = \frac{1.245\times10^7}{1140\times9.80665} = \mathbf{1\,114\ m}$$

The fuel pump makes **80 % more head** than the oxidiser pump while moving
**43 % of the mass** — entirely because RP-1 is 29 % less dense *and* carries
the cooling jacket. This asymmetry is the reason single-shaft pumps are hard
and dual-shaft pumps exist.

**Step 3 — volumetric flow and power** (`pump_power`), $\eta_f = 0.70$ (low
specific speed), $\eta_o = 0.75$:

$$Q_f = \frac{50.76}{810} = 0.06266\ \mathrm{m^3/s}, \qquad Q_o = \frac{119.27}{1140} = 0.10463\ \mathrm{m^3/s}$$

$$P_f = \frac{50.76\times1.60\times10^7}{810\times0.70} = \mathbf{1.432\ MW},\qquad
P_o = \frac{119.27\times1.245\times10^7}{1140\times0.75} = \mathbf{1.737\ MW}$$

**Total shaft power 3.169 MW** for a 500 kN engine — **6.34 W per newton of
thrust.**

**Step 4 — specific speed** (`specific_speed_SI`) at a single-shaft
$N = 20\,000$ rpm ($\omega = 2\,094.4$ rad/s):

$$N_{s,f} = \frac{2094.4\sqrt{0.06266}}{(9.80665\times2014)^{3/4}} = \frac{524.2}{1665.7} = \mathbf{0.315}$$

$$N_{s,o} = \frac{2094.4\sqrt{0.10463}}{(9.80665\times1114)^{3/4}} = \frac{677.5}{1067.0} = \mathbf{0.634}$$

The LOX pump at $N_s = 0.63$ is a comfortable single-stage radial machine.
**The fuel pump at $N_s = 0.315$ is at the bottom of the usable band** —
narrow passages, high disc friction, and the 0.70 efficiency assumed above is
generous. Splitting it into two stages raises $N_s$ by $2^{3/4} = 1.68$ to
**0.53**, which is why real high-head fuel pumps are staged.

**Step 5 — geometry from the head coefficient.** Take $\psi = 0.50$:

$$u_{2,o} = \sqrt{\frac{9.80665\times1114}{0.50}} = 147.8\ \mathrm{m/s}
\quad\Rightarrow\quad D_{2,o} = \frac{2u_2}{\omega} = \mathbf{141\ mm}$$

$$u_{2,f} = \sqrt{\frac{9.80665\times2014}{0.50}} = 198.8\ \mathrm{m/s}
\quad\Rightarrow\quad D_{2,f} = \mathbf{190\ mm}$$

Both tip speeds are well inside the 150–250 m/s band for LOX and kerosene
service (§3.14).

**Step 6 — Euler cross-check on the LOX impeller.** With $b_2 = 12$ mm,
$\beta_2 = 25°$, slip factor $\sigma = 0.85$ (Eq. 3.12):

$$c_{m2} = \frac{Q}{\pi D_2 b_2} = \frac{0.10463}{\pi\times0.141\times0.012} = 19.7\ \mathrm{m/s}
\qquad (\phi = 19.7/147.8 = 0.13\ \checkmark)$$

$$c_{u2} = 0.85\times147.8 - \frac{19.7}{\tan 25°} = 125.6 - 42.2 = 83.4\ \mathrm{m/s}$$

$$H_{\text{Euler}} = \frac{u_2 c_{u2}}{g_0} = \frac{147.8\times83.4}{9.80665} = 1\,258\ \mathrm{m}$$

$$\eta_h = \frac{1\,114}{1\,258} = \mathbf{0.886}$$

An 88.6 % hydraulic efficiency with an overall 75 % is exactly the right
relationship: the remaining 12 % is leakage past the wear rings and disc
friction on the impeller back face. If the arithmetic had demanded
$\eta_h > 1$, the design would be infeasible and the response would be more
tip speed or less backsweep.

**Sanity check.** F-1: 41 MW at 6 770 kN sea level = 6.06 W/N at $p_c\approx70$
bar. Merlin 1D: ~7.5 MW at 845 kN = 8.9 W/N at 97 bar (company figures).
RE-500's 6.34 W/N at 100 bar sits between them. ✓

---

### WE3 — NPSH check for the RE-500 LOX pump, and whether it needs an inducer

**Given.** LOX tank at $p_t = 2.5$ bar; liquid at its normal boiling point,
90.2 K, so $p_v = 1.013$ bar [NIST]; suction line loss 0.35 bar; liquid
surface 8.0 m above the pump inlet; vehicle at 1 $g_0$ at ignition.

**Step 1 — NPSH available** (`npsh_available`, Eq. 3.15):

$$\mathrm{NPSH_a} = \frac{2.5\times10^5 - 1.013\times10^5 - 0.35\times10^5}{1140\times9.80665} + 8.0\times\frac{g_0}{g_0}
= 10.17 + 8.00 = \mathbf{18.17\ m}$$

**The tank pressure buys only 10.2 m.** The static column buys 8.0 m and
disappears as the tank empties. Note also the worst case: if the tank were
**self-pressurised** with GOX so $p_t = p_v$, the whole first term would be
$-0.35\times10^5/(1140 g_0) = -3.13$ m and NPSHa would be **4.87 m**. That
single line is the argument for helium over autogenous pressurisation on a
suction-critical circuit.

**Step 2 — NPSH required at 20 000 rpm** (Eq. 3.16), $\omega\sqrt{Q} =
2094.4\times\sqrt{0.10463} = 677.5$:

| architecture | $N_{ss}$ | $\mathrm{NPSH_r}$ |
|---|---|---|
| plain impeller, no inducer | 2.5 | **178.8 m** |
| impeller + modest inducer | 4.0 | 95.6 m |
| impeller + good rocket inducer | 8.0 | **37.9 m** |
| aggressive LH₂-class inducer | 10.0 | 28.2 m |

**Every option fails against 18.17 m available.** Even the best inducer needs
twice the NPSH the vehicle can supply. The pump cannot run at 20 000 rpm off
a 2.5 bar tank. This is not a marginal call.

**Step 3 — the three fixes, quantified.**

*(a) Slow the pump down.* Invert Eq. 3.16 at $N_{ss} = 8$:

$$\omega_{\max} = \frac{N_{ss}\,(g_0\,\mathrm{NPSH_a})^{3/4}}{\sqrt{Q}}
= \frac{8\times(9.80665\times18.17)^{3/4}}{0.3235} = \frac{8\times48.77}{0.3235} = 1\,206\ \mathrm{rad/s}$$

$$N_{\max} = \mathbf{11\,519\ rpm}$$

At that speed $u_2$ is unchanged (still 147.8 m/s) so $D_2$ must grow to
$2\times147.8/1206 = \mathbf{245\ mm}$ — a 74 % larger, substantially heavier
impeller, and a shaft speed that no longer matches the fuel pump's needs. On
one shaft, the fuel pump would also drop to 11 519 rpm, its $N_s$ would fall
to 0.181, and it would need three or four stages. **This is precisely the
argument that produces a gearbox or a second turbopump.**

*(b) Raise tank pressure.* Keep 20 000 rpm and $N_{ss}=8$, so
$\mathrm{NPSH_r} = 37.92$ m. Solve Eq. 3.15 for $p_t$:

$$p_t = (37.92 - 8.00)\times1140\times9.80665 + 1.013\times10^5 + 0.35\times10^5 = \mathbf{4.71\ bar}$$

Nearly double the tank pressure. On a booster stage with, say, 25 m³ of LOX,
that is $2.2\times10^5$ Pa extra $\times$ 25 m³ $\times 1.6\times10^{-5}$
kg/J $\approx 88$ kg of tank — cheap compared with a gearbox, which is why
**modestly raising tank pressure is the first thing anyone tries**, and why
booster LOX tanks run 3–5 bar rather than 2.

*(c) Add a boost pump.* A low-pressure stage at, say, 4 000 rpm and
$N_{ss}=8$ requires only
$\mathrm{NPSH_r} = [(419\times0.3235)/8]^{4/3}/g_0 = 4.9$ m — comfortably
inside 18.17 m — and delivers 5–8 bar to the main pump inlet, which then has
$\mathrm{NPSH_a}$ of 45–70 m and can run at 20 000 rpm or faster. **This is
the RS-25's architecture, derived from first principles in four lines.**

**Step 4 — the thermodynamic credit.** LOX gives about **0.75 m of TSH per
kelvin** of local cooling (§3.13.5), so a couple of kelvin of evaporative
suppression is worth 1–2 m — real, but not enough to change any decision
here. Run the same calculation on **liquid hydrogen** and the credit is
**10.5 m/K**, which does change decisions, and is why LH₂ inducers routinely
achieve suction performance that would be impossible on water.

**Sanity check.** The RS-25 does exactly what this analysis recommends: a
5 150 rpm LPOTP feeding a 28 120 rpm HPOTP, a ratio of 5.5, against the
ratio of $20\,000/11\,519 = 1.74$ this example needs at a far lower chamber
pressure. The requirement scales the way the equations say it does. ✓

---

### WE4 — Turbine flow to drive the RE-500 pumps from a gas generator at 900 K

**Given.** Pump shaft power 3.169 MW (WE2), plus 5 % for bearing, seal and
balance-piston parasitics: $P_t = 3.328$ MW required at the turbine shaft.
Fuel-rich LOX/RP-1 gas generator at $MR_{gg} = 0.35$, turbine inlet
temperature 900 K, inlet pressure 62 bar, exhaust to a dump nozzle at
1.8 bar. Two-row velocity-compounded impulse turbine, $\eta_t = 0.60$.

**Step 1 — gas properties.** Fuel-rich kerolox GG products at 900 K:
$\mathcal{M} \approx 16.0$ kg/kmol, $\gamma \approx 1.25$ (Module 04, frozen).

$$R = \frac{8314.46}{16.0} = 519.7\ \mathrm{J/(kg\,K)},\qquad
c_p = \frac{\gamma R}{\gamma-1} = \frac{1.25\times519.7}{0.25} = 2\,598\ \mathrm{J/(kg\,K)}$$

**Step 2 — pressure ratio and available work.**

$$\pi_t = \frac{62}{1.8} = 34.44,\qquad
\pi_t^{-(\gamma-1)/\gamma} = 34.44^{-0.20} = 0.4928$$

$$\Delta h_{\text{is}} = c_p T_{\text{in}}\left[1-0.4928\right] = 2598\times900\times0.5072 = 1.186\ \mathrm{MJ/kg}$$

**Step 3 — flow** (`turbine_power`, Eq. 3.20 inverted):

$$\dot m_t = \frac{P_t}{\eta_t\,\Delta h_{\text{is}}} = \frac{3.328\times10^6}{0.60\times1.186\times10^6} = \mathbf{4.675\ kg/s}$$

That is **2.75 % of the 170.03 kg/s main flow** (2.68 % of the engine's
174.7 kg/s total).

**Step 4 — gas-generator propellant split.** At $MR_{gg} = 0.35$:
$\dot m_{ox,gg} = 1.212$ kg/s, $\dot m_{f,gg} = 3.463$ kg/s. Note that the
gas generator burns **more fuel than the whole PF-20 engine of WE1**, and
throws it away.

**Step 5 — $I_{sp}$ penalty.** The turbine exhaust does produce some thrust
through its dump nozzle; take $I_{sp,gg} \approx 95$ s [J] (low $T$, poor
expansion, high molar mass relative to the main flow):

$$I_{sp,\text{eff}} = \frac{170.03\times303.3 + 4.675\times95}{174.71} = \mathbf{297.7\ s}$$

**A loss of 5.6 s, or 1.8 %.** That number — a couple of percent of flow, a
couple of percent of $I_{sp}$ — is the entire open-cycle penalty, and it is
what a staged-combustion cycle spends its complexity to recover (Module 13).

**Step 6 — what happens if you get greedy.** Raise the turbine inlet
temperature to 1 100 K and the required flow falls to 3.82 kg/s, saving 1.0 s
of $I_{sp}$. Raise it to 1 400 K and you save another 0.9 s — and you are now
above the uncooled-blade limit for any reasonable superalloy, and the
gas-generator mixture ratio is high enough that free oxygen begins attacking
the turbine. This is why GG inlet temperature sits at 900–1 200 K: the
$I_{sp}$ available above it is small and the metallurgical cost is not.

**Sanity check.** The J-2's gas generator consumed "~2–3 % of propellant"
[_verify-liquid]. The F-1 dumped its GG exhaust as film cooling for the
nozzle extension, recovering part of the loss. Our 2.75 % is squarely in the
historical band. ✓

---

### WE5 — Affinity-law scaling of the RE-500 pumps to a 100 kN engine

**Given.** Same propellants, same chamber pressure, same $\Delta p$ budget,
same $N_s$ (i.e. geometrically similar impellers), thrust scaled by
$s = 0.2$. All flows scale by $s$; **all heads are unchanged** because every
term in Eq. 3.1 is unchanged.

**Step 1 — shaft speed.** Hold $N_s = \omega\sqrt{Q}/(g_0H)^{3/4}$ with $H$
fixed:

$$\frac{\omega_2}{\omega_1} = \sqrt{\frac{Q_1}{Q_2}} = \frac{1}{\sqrt{0.2}} = 2.236$$

$$N_2 = 2.236\times20\,000 = \mathbf{44\,721\ rpm}$$

**Step 2 — diameter.** From $H \propto N^2D^2$ at constant $H$:

$$\frac{D_2}{D_1} = \frac{\omega_1}{\omega_2} = 0.4472$$

LOX impeller: 141 mm → **63 mm**. Fuel impeller: 190 mm → **81 mm**.

**Step 3 — tip speed.** $u_2 = \omega D/2$ is **unchanged**: 147.8 m/s (LOX)
and 198.8 m/s (fuel). It has to be — the head did not change and $\psi$ did
not change. **The small engine is not more highly stressed at the rim.**

**Step 4 — power.** $P \propto \dot m$ at fixed head and efficiency, so
$P_2 = 0.2P_1$: **0.286 MW fuel, 0.347 MW LOX, 0.634 MW total.** (Check
against the affinity form: $\rho N^3D^5 \Rightarrow 2.236^3\times0.4472^5 =
11.18\times0.01789 = 0.200$ ✓.)

In practice you will *not* achieve the same efficiency: tip clearances do not
scale, surface roughness does not scale, and the Reynolds number falls.
Expect 3–6 points of efficiency loss, so the real power is 5–10 % higher than
the affinity laws promise. [E]

**Step 5 — the result that matters.** Suction specific speed depends on
$\omega\sqrt{Q}$:

$$\omega_2\sqrt{Q_2} = 2.236\,\omega_1 \times \sqrt{0.2\,Q_1} = 2.236\times0.4472\,\omega_1\sqrt{Q_1} = \omega_1\sqrt{Q_1}$$

**Exactly unchanged: 677.5 in both cases.** Therefore $\mathrm{NPSH_r}$ is
identical — 37.9 m at $N_{ss} = 8$ for both the 500 kN and the 100 kN engine.

**The 100 kN engine needs exactly the same tank pressure as the 500 kN
engine.** Pressurisation requirements, boost-pump requirements and NPSH
margins do not shrink when the vehicle does. On a small launcher those fixed
requirements are a larger fraction of a smaller stage, which is one of the
structural reasons small launch vehicles have worse mass fractions than
large ones — and one of the reasons Rocket Lab put **electric motors** on
Rutherford, which decouples pump speed from any turbine and lets the
designer choose 40 000 rpm freely.

**Sanity check.** Merlin 1D at 845 kN runs ~36 000 rpm; RD-0146 at 68.6 kN
runs >120 000 rpm [_verify-liquid]. The ratio of thrusts is 12.3; the
$s^{-1/2}$ rule predicts a speed ratio of 3.5, giving 126 000 rpm from
Merlin's 36 000. The published figure is >120 000. For a scaling law with no
fitted constants, applied across two unrelated engines on different
propellants and different cycles, that is a remarkably good result. ✓

---

## 6. Real engines: why did they design it that way?

### 6.1 RL10 — the gearbox (1962, historical, still in production)

**The choice.** A single turbine on a high-speed shaft carries a two-stage
centrifugal hydrogen pump at ~31 000 rpm and drives a single-stage
centrifugal LOX pump through a **reduction gearbox** on a slower shaft
[_verify-liquid].

**Why.** LH₂ and LOX differ in density by a factor of **16**. From Eq. 3.11,
the head required for a given pressure rise is $\Delta p/(\rho g_0)$: at the
RL10's 32.8 bar chamber pressure the hydrogen pump needs roughly 6 000 m of
head and the oxygen pump about 400 m. From $u_2 = \sqrt{g_0H/\psi}$ the tip
speeds differ by a factor of four, and from $N_s$ the desired shaft speeds
differ by rather more. Put them on one shaft and either the hydrogen pump is
too slow (needing four or five stages and an enormous rotor) or the LOX pump
is far too fast (cavitating hopelessly — WE3's problem, magnified).

**Alternatives available in 1958.** (i) Two independent turbopumps — chosen
later by the J-2 and RS-25, but it means two turbines and two bearing sets on
an engine whose entire mass budget is 136 kg. (ii) One shaft, accept the
mismatch — impossible for LOX suction. (iii) Gears. In 1958, gearing was
mature aircraft-accessory technology and turbopump-on-turbopump integration
was not.

**Would a modern engineer choose it?** For an engine of this size and this
propellant combination, **yes, and they do** — the RL10 is still in
production sixty-four years later and the gearbox is described in the
literature as one of its most-copied features. Gears cap power (which is why
no large engine is geared) and add a torsional mode and a lubrication
problem, but at 73 kN they are lighter than a second turbine. The relevant
design reference, [SP-8100], exists because of this engine and its H-1 and
MB-3 contemporaries.

### 6.2 J-2 — the 7-stage axial fuel pump (1966, historical)

**The choice.** A **7-stage axial** LH₂ pump at 27 000 rpm and a single-stage
centrifugal LOX pump at 8 600 rpm, on **separate shafts**, with the gas
generator exhaust passing through the fuel turbine and *then* the oxidiser
turbine in series [_verify-liquid].

**Why axial.** Hydrogen's density of 70.8 kg/m³ makes its *volumetric* flow
enormous — at the J-2's flow the LH₂ side moves several times the volume the
LOX side does, at a fifth of the mass. That drives $N_s$ into the axial band
(§3.11–3.12), where an axial cascade is more efficient and packages into a
slender diameter. Seven stages because axial $\psi$ is only 0.15–0.3.

**Why series turbines.** It gives mixture-ratio self-regulation for free: the
fuel turbine takes its work first, and any excess speed on the fuel side
reduces the energy available to the oxidiser side, pushing the ratio back.
On an engine that had to shift mixture ratio between 4.5:1 and 5.5:1 with a
propellant-utilisation valve, self-regulation was worth having.

**Would a modern engineer choose it?** **No, and the programme itself said
so.** The J-2X explicitly replaced the axial fuel pump with a **centrifugal**
one and listed the change as one of its four principal design deltas
[_verify-liquid]. The reasons are rotordynamic and mechanical: a 7-stage
axial rotor is long, its first bending critical speed is low, and every stage
is a stall risk and a stack of tolerances. The RS-25 kept axial only for the
*low-pressure* boost stage, where $N_s$ genuinely demands it. The verdict of
sixty years is that axial pumps in rocket service belong in the boost stage,
not the main stage.

### 6.3 RS-25 — four pumps, two of them boost pumps (1981, historical/modern)

**The choice.** LPFTP (axial, 16 185 rpm, hydraulic-turbine driven), HPFTP
(3-stage centrifugal, 35 360 rpm, 53.05 MW), LPOTP (5 150 rpm), HPOTP
(2-stage centrifugal, 28 120 rpm, 17.34 MW). Two separate preburners
[_verify-liquid], [SSME-Orient].

**Why.** WE3 is the whole argument. At 206 bar chamber pressure the high-
pressure pumps must run at 28 000–35 000 rpm; at those speeds Eq. 3.16 puts
$\mathrm{NPSH_r}$ far beyond anything the External Tank could supply at a
tolerable ullage pressure. The alternative to boost pumps was to pressurise
the ET harder, and on the Shuttle the ET's mass was on the critical path for
the whole system. Four turbopumps were cheaper in mass than a heavier tank.

Two further consequences worth noticing:
- **The boost turbines are hydraulic, not hot-gas.** The LPFTP is driven by
  liquid hydrogen tapped from HPFTP discharge; the LPOTP by liquid oxygen.
  No new hot-gas circuit, no new seal problem.
- **The dual-shaft layout eliminates the interpropellant seal on the fuel
  side entirely** — but creates the hardest seal on the engine on the HPOTP,
  where fuel-rich hot gas drives a liquid-oxygen pump. That seal has three
  elements and two purged, drained cavities, and it is the most instrumented
  interface on the vehicle.

**Would a modern engineer choose it?** For a reusable 206 bar hydrogen
engine, something very like it is forced. But note that the **RD-0120**
achieved 219 bar and 455 s with a **single-shaft** turbopump driving both
pumps [_verify-liquid] — proof that the RS-25's dual-shaft complexity was a
choice and not a necessity, and a control experiment worth arguing about.

### 6.4 F-1 — one shaft, no gearbox, 5 488 rpm (1967, historical)

**The choice.** A two-stage impulse turbine and one single-stage centrifugal
impeller per propellant, all on one shaft at 5 488 rpm, 41 MW
[_verify-liquid].

**Why it works here and not on the RL10.** LOX (1 141 kg/m³) and RP-1
(810 kg/m³) differ in density by only 40 %, so the head requirements differ
by only 40 % and one shaft speed suits both. And at 2 577 kg/s the flows are
so large that $N_s$ is high even at 5 488 rpm — the machine is enormous, so
it does not need to spin. From §3.14, $\omega\propto s^{-1/2}$: an engine
this size *should* run at a few thousand rpm, and it does.

**The alternatives.** Gears at 41 MW were not credible in 1960 and are not
credible now — [SP-8100] does not contemplate that power. Two turbopumps
would have doubled the seals, bearings and turbine count on a component
already at the edge of what could be manufactured.

**Would a modern engineer choose it?** For a kerolox engine of any size,
**yes**. Merlin, RD-107, RD-180, RD-0120 and BE-4 are all single-shaft. The
propellant density ratio is what decides, and for everything except hydrogen
it favours a single shaft.

### 6.5 Merlin 1D — single shaft, dual impeller, ~36 000 rpm (2013, modern)

**The choice.** One shaft carries the LOX impeller, the RP-1 impeller and the
turbine; ~36 000 rpm, ~7.5 MW; gas-generator cycle (company figures
[_verify-liquid]).

**Why.** Same density argument as the F-1, applied to an engine one-eighth
the thrust — and §3.14 says the speed should therefore be about $\sqrt8=2.8$
times higher. 5 488 × 2.8 = 15 400; Merlin runs at 36 000, higher still,
because it also runs 97 bar against the F-1's ~70 bar (more head, more tip
speed, more rpm at similar diameter).

**The design signature is what SpaceX did with the pressure they had.** The
TVC actuators run on **RP-1 tapped from the pump discharge and returned to
the pump inlet** — no separate hydraulic system, no hydraulic fluid to run
out. That is a feed-system decision, not an actuator decision, and it removed
a failure mode that has ended other vehicles.

**Would a modern engineer choose it?** It *is* the modern choice. What is
notable is what SpaceX did **not** do: no boost pumps, no gearbox, no staged
combustion. The engine is optimised for cost and production rate, and
accepts 97 bar and a GG cycle as the price. Hundreds of engines a year is a
performance metric too.

### 6.6 RD-180 — single shaft, oxidiser-rich (2000, modern)

**The choice.** One shaft, one **oxygen-rich preburner**, two combustion
chambers, 267 bar chamber pressure, 47–100 % throttle [_verify-liquid].

**Why oxidiser-rich.** In a *fuel*-rich staged-combustion engine the turbine
gas is fuel-rich, so a single-shaft layout puts hot fuel-rich gas within
millimetres of liquid oxygen and needs the seal architecture the RS-25 HPOTP
has. Go **oxidiser**-rich and the turbine gas is chemically the same species
family as the pumped oxidiser: **the interpropellant problem on the turbine
end simply does not exist.** That is what makes a single shaft viable at
267 bar.

**What it costs.** Everything in the hot oxygen path — turbine blades,
manifolds, ducts, injector faces — must survive oxygen at 500+ K and high
pressure, where most alloys will ignite if they are scratched. The Russian
solution is an **inert enamel coating on every wetted metal surface**
[_verify-liquid]. It is the single technology that made the cycle possible
and the reason Western programmes spent three decades believing ORSC was
impossible: they were solving the wrong problem (seals) instead of the right
one (coatings).

**Would a modern engineer choose it?** They have: **BE-4 is oxidiser-rich
staged combustion with a single ox-rich preburner driving both pumps**, and
it is the first US-designed ORSC engine to fly [_verify-liquid]. Note that
Blue Origin deliberately chose **140 bar**, half the RD-180's chamber
pressure, and **hydrostatic bearings**, both for life rather than for
performance — the clearest example in the record of a turbopump designed
around reuse.

### 6.7 Raptor — the full-flow pair (2026, modern, all figures claimed)

**The choice.** Two mechanically independent turbopumps: an oxidiser-rich
preburner drives the LOX pump, a fuel-rich preburner drives the CH₄ pump, and
both preburner exhausts enter the main chamber. Every gram of propellant
passes through a turbine [_verify-liquid].

**Why.** It is the only architecture in which *neither* shaft has a
fuel/oxidiser interface: each turbine runs in gas made from the propellant
its pump is pumping. The interpropellant seal — the component this module has
returned to four times — is deleted. Because both turbines pass the full
flow, each can make its power at a low pressure ratio and a modest
temperature, which extends turbine life.

**What it costs.** Two preburners, two full-flow turbines, and a start
sequence in which two independent hot-gas loops must light, spin up and
converge on a mixture ratio without either running away. Only the never-flown
Soviet RD-270 and the ground-test Integrated Powerhead Demonstrator preceded
it; Raptor is the first FFSC engine ever flown.

**Honesty note.** SpaceX has published **neither turbopump speed nor shaft
power** for any Raptor variant, and the chamber pressure, $I_{sp}$, dry mass
and thrust-to-weight figures are company claims with no independent
verification — several first stated on social media rather than in any
document [_verify-liquid §4]. Present the architecture as fact; present the
numbers as claims.

---

## 7. Trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs, compactly

| decision | in favour | against | who decides |
|---|---|---|---|
| Pressure-fed vs pump-fed | simplicity, reliability, restart count, no start transient, low cost | tank + pressurant mass scaling as $p_cV$; hard $p_c$ ceiling | total impulse (Eq. 3.10), not thrust |
| Regulated vs blowdown | flat thrust, smaller tanks | one more active component whose failure modes are severe | total impulse and thrust tolerance |
| He vs N₂ | 7× less mass | leaks, costs, real-gas sizing | how far it flies |
| Stored vs autogenous | stored works before start; autogenous deletes the bottle | autogenous needs hot gas and a heat exchanger | whether there is an engine running |
| Single shaft vs dual | one turbine, one bearing set, fewer parts | needs matched speeds; needs an interpropellant seal | propellant density ratio |
| Geared vs separate turbopumps | one turbine at two speeds | power ceiling, lubrication, torsional mode | engine size |
| Inducer vs boost pump vs tank pressure | inducer is cheapest; boost pump is most capable | inducer brings rotating cavitation; boost pump brings a whole extra machine | how far NPSHr exceeds NPSHa |
| Rolling vs hydrostatic bearings | rolling is simple and proven | hydrostatic needs a supply circuit but has no wear at speed | expendable vs reusable |
| Impulse vs reaction turbine | impulse tolerates huge $\pi_t$ and partial admission | reaction is more efficient at low $\pi_t$ | the engine cycle |

### 7.2 Failure modes

| failure | mechanism | symptom | evidence | fix |
|---|---|---|---|---|
| **Cavitation head breakdown** | inlet static pressure reaches $p_v$; vapour blocks the impeller eye | pump discharge pressure collapses in <100 ms; chamber pressure follows; engine shuts down or runs rough | pump $\Delta p$ falls while speed holds; inlet pressure at or below $p_v$; suction-side leading-edge pitting at teardown | raise tank pressure; add or re-profile the inducer; reduce speed; add a boost pump |
| **Rotating cavitation** | cavity pattern propagates around the inducer blade row at ~1.1–1.3× or ~0.5–0.9× shaft speed | blade high-cycle fatigue; a discrete non-synchronous line in the accelerometer spectrum | strain gauges on inducer blades; a spectral line at a non-integer multiple of $N$ | tip clearance control; blade angle and sweep redesign; raise NPSH; [SP-8052], [Brennen-Pumps]. **The LE-7 H-II Flight 8 loss was an inducer failure** |
| **Subsynchronous whirl** | fluid cross-coupling in seals and impellers exceeds damping | orbit grows at 0.4–0.9× $N$ above a power threshold; rub, then destruction | proximity probes showing a growing non-synchronous orbit; onset tied to power level not to speed alone | damping (honeycomb) seals; squeeze-film dampers; stiffer bearing carriers. **The RS-25 HPFTP history** [Biggs89] |
| **Bearing distress** | propellant is a poor lubricant; cage transfer film wears out | rising bearing temperature and vibration; metallic debris in drain | post-test borescope; spectrometric analysis of the drain; DN and load history | reduce DN; hybrid ceramic balls; coolant-flow redesign; **go hydrostatic** |
| **Interpropellant seal leakage** | dynamic seal wear, or thermal distortion of the housing | purge-cavity pressure rise or drain flow increase; in the worst case, fuel and oxidiser meeting inside the pump | purge and drain instrumentation on every test | never operate without purge; monitor drain flow as a redline; separate shafts, or go FFSC |
| **Turbine blade failure** | thermal fatigue from start transients, HCF from partial-admission or nozzle-passing excitation, creep at temperature | speed excursion, unbalance, secondary damage | blade-count-order lines in the spectrum; metallurgical section | reduce $T_{\text{in}}$; full admission; damping features; directionally solidified or single-crystal alloys |
| **Regulator failure open** | poppet hangs or seat erodes | tank overpressure → relief valve or tank rupture | tank pressure above setpoint with flow demand unchanged | series redundancy; burst disc plus relief; the SPS philosophy |
| **Filter blockage** | debris accumulation | slowly rising $\Delta p$ across a test series, then flow starvation | trend the filter $\Delta p$ across every test, not just this one | cleanliness control; larger element; upstream screens |
| **Water hammer** | fast valve closure on a moving liquid column | pressure spike $\rho a\Delta V$; bellows squirm; line rupture | high-response transducers near the valve | controlled closure rate; accumulators; [SP-8123] |
| **POGO** | cavitation compliance couples the feed line to the vehicle longitudinal mode | 5–25 Hz vehicle oscillation, thrust modulation | vehicle accelerometers plus pump inlet pressure | suction-line accumulator; NPSH management. Module 15 |

### 7.3 Materials

- **Impellers:** Inconel 718 for strength and cryogenic toughness, and
  because it is not ignition-sensitive in oxygen. **Titanium 6Al-4V is
  attractive for its 25 % better specific strength and is forbidden in LOX**
  (impact-sensitive; a rub is an ignition). Aluminium 7075 and A356 on
  low-duty and low-temperature pumps. Monel and copper alloys where oxygen
  compatibility dominates over strength.
- **Housings:** cast or forged Inconel, stainless 347/321, or aluminium for
  low-pressure boost stages. Hydrogen-wetted parts must be screened for
  **hydrogen environment embrittlement**, which can halve the usable strength
  of high-strength nickel alloys (Module 16).
- **Turbine blades:** cast nickel superalloys, directionally solidified on
  the more demanding engines; the RS-25's turbine blades are among the most
  highly stressed non-cooled blades in any machine. Oxidiser-rich turbines
  (RD-180, BE-4) require the **inert enamel coating** discussed in §6.6.
- **Bearing cages:** glass-fibre-reinforced PTFE (Armalon and relatives), for
  transfer-film lubrication. **Balls:** 440C stainless historically, silicon
  nitride (hybrid bearings) increasingly.
- **Tanks:** aluminium 2219 and 2195 (Al-Li) for propellant tanks; titanium
  6Al-4V liners with carbon overwrap for helium bottles. Note that the
  material choice for a *pressurant* bottle is governed by stress rupture
  over the mission life, not by short-term burst.

### 7.4 Manufacturing

- **Impellers** are 5-axis milled from forged billet, or investment cast,
  or — increasingly — **printed and then finish-machined**. Additive
  manufacturing has changed rocket turbomachinery more than almost any other
  component, because a shrouded impeller with curved internal passages is
  close to unmakeable any other way and closed shrouds are worth several
  points of efficiency [Gradl22]. Vulcain's programme used
  **powder-metallurgy turbopump impellers** decades before the current wave
  [_verify-liquid].
- **Balance** is the whole game on a 36 000 rpm rotor. Components are
  individually balanced, the stack is balanced as assembled, and the
  assembly sequence is recorded so it can be reproduced. Residual unbalance
  of a few gram-millimetres is the target.
- **Clearances** are set by the difference between thermal growth of a
  30 K rotor and a 300 K housing during chilldown, plus dynamic deflection,
  plus manufacturing tolerance. This is why tip clearance cannot be scaled
  down with the pump (WE5), and why small pumps are less efficient.
- **Cleanliness** is a manufacturing requirement, not a housekeeping one.
  Particulate that would be irrelevant in a hydraulic system is an ignition
  source in a LOX pump and a blockage in a 0.5 mm injector orifice. The
  Antares Orb-3 loss was traced to an AJ26 turbopump with corrosion and
  **manufacturing debris** in a forty-year-old engine [_verify-liquid].

### 7.5 Testing

| what | instrument | what "wrong" looks like |
|---|---|---|
| Pump $\Delta p$ vs $Q$ vs $N$ | inlet/outlet static pressure, turbine flowmeter or venturi, magnetic speed pickup | the $H$–$Q$ curve does not overlay the water-flow calibration; a flat or rising region at low flow means stall |
| Suction performance | throttle the inlet valve at constant $N$ and $Q$ and plot head vs NPSH | the "knee" where head drops 2–3 %; a knee at higher NPSH than predicted means the inducer is not performing |
| Rotordynamics | two proximity probes 90° apart at each bearing; casing accelerometers | a growing orbit at a non-integer fraction of $N$, appearing above a power threshold — whirl, not unbalance |
| Blade and inducer loads | strain gauges through a slip ring or telemetry; often only in development | spectral content at non-synchronous frequencies, or at blade-passing orders |
| Seal integrity | purge-cavity pressure, drain-line flow and temperature | any rise in drain flow. This is a redline, not a trend |
| Bearing health | bearing race and coolant temperatures, casing accelerometer band energy | temperature rising test over test at constant duty |
| Turbine | inlet gas temperature (multiple thermocouples — the GG stratifies), inlet/outlet pressure, speed | a temperature spread across the annulus greater than ~50 K means bad GG mixing and blade-life problems |
| Feed system dynamics | high-response (>2 kHz) pressure transducers at pump inlet, injector manifold, chamber | coherent oscillation between line and chamber = chug or POGO precursor |
| Tank and pressurant | ullage pressure and temperature at several heights, bottle pressure and temperature | ullage temperature far below the model = higher collapse factor than assumed; you will run out of helium |

**Water flow is where a pump is characterised.** It is cheap, safe and
instrumentable, and $H$–$Q$–$N$ scales by the affinity laws. What water flow
**cannot** tell you: suction performance in a cryogen (thermodynamic
suppression head means the cryogenic pump does better, and by an amount you
must quantify rather than assume — §3.13.5), bearing behaviour in the real
fluid, seal behaviour at cryogenic temperature, and anything about the
turbine. Those need a real propellant and, eventually, a real engine.

---

## 8. Misconceptions, and what engineers actually care about

**"Pressure-fed engines are low-performance."** No — they are *low chamber
pressure*, which is a different statement. Aestus makes **324 s at 11 bar**
because in vacuum you can buy back the performance with an 84:1 nozzle
[_verify-liquid]. What pressure feeding actually costs is *sea-level*
performance (you cannot run a large area ratio at sea level) and *stage mass
fraction* (tanks and pressurant). Vacuum $I_{sp}$ is barely affected.

**"A pump raises pressure."** A pump raises **head**. $H = \Delta p/(\rho
g_0)$, and Euler's equation (Eq. 3.11) contains no density at all. The same
impeller at the same speed produces the same head on hydrogen as on oxygen —
and therefore **one-sixteenth the pressure rise**. Every architectural
difference between hydrogen and hydrocarbon turbopumps descends from this
one sentence.

**"NPSH is about pressure."** NPSH is about the **margin between local
pressure and the propellant's vapour pressure at its actual temperature**. A
tank at 5 bar full of saturated LOX has less usable NPSH than a tank at
2.5 bar full of LOX subcooled by 5 K. Self-pressurised tanks are the trap:
$p_t = p_v$ and the pressure term vanishes entirely.

**"An inducer prevents cavitation."** An inducer is **designed to cavitate**.
It tolerates a stable attached cavity that a highly loaded main impeller
could not, and delivers enough head to keep the main impeller out of trouble.
Its own failure modes — rotating cavitation, auto-oscillation — are
cavitation phenomena, and they broke the LE-7.

**"Smaller engines have smaller, gentler turbopumps."** They have *faster*
ones. $\omega\propto F^{-1/2}$ at constant chamber pressure (WE5). RD-0146,
at 68.6 kN, runs its fuel pump above **120 000 rpm** — the highest published
rocket turbopump speed [_verify-liquid]. And their NPSH requirement does not
shrink at all.

**"The gas generator wastes 2 % of the propellant, so it costs 2 % of
$I_{sp}$."** Slightly pessimistic: the turbine exhaust produces *some*
thrust, so WE4's 2.75 % of flow costs 1.8 % of $I_{sp}$. The F-1 did better
still by dumping the exhaust into the nozzle extension as film cooling,
which converts part of the loss into a cooling function it would otherwise
have paid for separately.

**"Helium is helium; use the ideal gas law."** At 310 bar and 293 K helium's
compressibility factor is about **1.17** — it is 17 % *less* dense than ideal.
Size a bottle on $Z=1$ and you will be 16 % short of gas (WE1). Meanwhile the
gas in the propellant tank ullage needs a **collapse factor** of 1.3–1.6 for
storables and 2–4 for hydrogen. Both corrections go the same way: you need
more helium than the textbook equation says.

**"Reliability favours pressure feeding, so more reliable vehicles should use
it."** It favours pressure feeding *at small total impulse*. A booster stage
pressure-fed to 100 bar would carry so much tank and helium mass (WE-style
arithmetic gives roughly **9.8 t of tankage and pressurant for a 160 s
RE-500 burn**) that it could not reach orbit at all. There is no reliability
benefit in a vehicle that does not fly.

### What engineers in this area actually spend their day on

1. **NPSH margin across the whole flight box**, not at the design point:
   start transient, throttle steps, slosh, propellant thermal stratification,
   burnout. It is the constraint that most often forces a change.
2. **The pressure budget closing at the worst corner.** End of burn, lowest
   tank pressure, highest flow, hottest coolant, with the regulator drooping.
   Everyone's budget closes at the nominal point.
3. **Rotordynamic margin**, expressed as the separation between running speed
   and every critical speed, and as the log-decrement of every mode over the
   power range. Not "does it run" but "how much damping do I have".
4. **Seal and purge integrity**, because it is the only failure mode that
   loses the vehicle in under a second.
5. **Turbine inlet temperature and its spread**, because blade life is
   exponential in temperature and the gas generator does not mix perfectly.
6. **Mass**, constantly: every kilogram in a pressurisation system or a
   turbopump comes off the payload one-for-one on an upper stage.

---

## 9. Mastery levels

**Level 1 — Familiarity.** Explain in plain language why a pressure-fed
engine has a low chamber pressure and a pump-fed one does not; name the parts
of a turbopump (inducer, impeller, volute/diffuser, turbine, bearings, seals)
and say what each does; state what cavitation is and why it matters; name
two pressure-fed and two pump-fed engines and their approximate chamber
pressures; sketch which way head, flow and power move when shaft speed rises.

**Level 2 — Working engineering knowledge.** Build a tank-to-injector
pressure budget and size a helium system including collapse factor, real-gas
correction and bottle mass; compute pump head, flow, power, specific speed
and tip speed for a stated engine; compute NPSHa from a tank state and NPSHr
from a suction specific speed and say whether the design closes; apply the
affinity laws to scale a pump and state what does *not* scale; size turbine
flow from a stated inlet temperature and pressure ratio and convert it to an
$I_{sp}$ penalty; quote the ranges in §4 from memory to within a factor
appropriate to each; read a pump $H$–$Q$ curve or a suction-performance
knee and say what is wrong.

**Level 3 — Interview mastery.** Given an unfamiliar engine's propellants,
thrust, chamber pressure and mission, propose a feed-system architecture —
pressure-fed or pumped, single-shaft or dual, geared or not, inducer or boost
pump — and defend every branch with a number; given a described failure
(a discharge-pressure collapse, a non-synchronous vibration line, a rising
bearing temperature, a purge-cavity pressure rise) name the two most likely
mechanisms, the measurement that would distinguish them, and the historical
programme that has been there; argue both sides of the RS-25-vs-RD-0120
dual-shaft question, the RL10 gearbox, and the pressure-fed Aestus decision,
and say which way you would go and what would change your mind.

---

## 10. Problems

### Conceptual

**C1.** A colleague proposes eliminating the injector pressure drop on a
pressure-fed engine to reduce tank pressure by 25 % of $p_c$. Give two
independent reasons this is a bad idea, one from Module 07 and one from this
module.

**C2.** Explain, using Euler's equation and nothing else, why a hydrogen
turbopump and an oxygen turbopump for the same engine want radically
different shaft speeds. Then explain the two architectures that resolve the
conflict and name an engine that uses each.

**C3.** A tank is pressurised with its own propellant vapour (autogenous,
saturated). Its ullage pressure is 4 bar — higher than a neighbouring
helium-pressurised tank at 2.5 bar. Which pump has more NPSH available, and
why? What single additional piece of information would settle it definitively?

**C4.** Why is an inducer's blade angle at the tip only 6–12° from
tangential, when a main impeller's exit blade angle is 20–35°? Answer in
terms of what each blade row is trying to do.

**C5.** State two reasons a gas-generator turbine runs at a blade speed ratio
of 0.2–0.3 when its peak efficiency would occur near 0.45, and explain why a
staged-combustion turbine does not have this problem.

**C6.** The RD-180 puts both pumps and an oxidiser-rich turbine on one shaft
at 267 bar. Explain why this is *easier* than putting both pumps and a
fuel-rich turbine on one shaft, and name the technology that makes it
possible.

**C7.** Rotating cavitation and subsynchronous whirl both show up as
non-synchronous lines in a vibration spectrum. Describe two measurements or
observations that would let you tell them apart on a test stand.

**C8.** A pressure-fed system and a pump-fed system are compared purely on
mass and the pump wins by a wide margin. Give three reasons a real programme
might still choose pressure feeding, and name a flown engine for each.

### Calculation

**N1.** A storable pressure-fed engine runs $p_c = 10$ bar at the injector
face with a 22 % injector drop, a 1.5 bar cooling jacket on the fuel side,
0.8 bar of line and valve loss, and 0.4 bar of acceleration reserve. Compute
the required fuel-side and oxidiser-side ullage pressures, and the ratio
$p_t/p_c$ on each side.

**N2.** The same engine carries 3.4 m³ of propellant and is pressurised with
helium at 300 K, collapse factor 1.4. Compute (a) the ideal pressurant mass,
(b) the actual mass required, (c) the mass required if nitrogen were used
instead, and (d) the mass required if the helium were heated to 500 K
before entering the ullage.

**N3.** A blowdown system must deliver 14 bar at burnout with $BR = 2.5$,
isothermal, carrying 0.8 m³ of propellant. Compute the initial ullage
volume, the total tank volume, the initial tank pressure, and the ratio of
initial to final thrust.

**N4.** An engine's fuel pump must raise 42 kg/s of RP-1
($\rho = 810$ kg/m³) from 3.2 bar to 172 bar at $\eta_p = 0.68$. Compute the
head, the volumetric flow, the shaft power, and the specific speed at
24 000 rpm. State whether one stage is appropriate and justify it.

**N5.** For the pump of N4, take $\psi = 0.52$ and compute the impeller tip
speed and exit diameter. Then, with $b_2 = 6$ mm, $\beta_2 = 28°$ and
$\sigma = 0.86$, compute the Euler head and the implied hydraulic efficiency.
Comment on whether the design is feasible.

**N6.** A LOX pump runs at 26 000 rpm passing 0.085 m³/s. The tank is at
3.2 bar, LOX is subcooled to 88 K ($p_v = 0.74$ bar [NIST]), the suction line
loses 0.30 bar, and the liquid surface is 4.5 m above the inlet at 2.0 $g_0$.
Compute NPSHa, and the suction specific speed the pump would have to achieve.
Is that achievable with an inducer? If not, compute the maximum shaft speed
that is.

**N7.** A gas generator supplies 1 050 K gas with $\mathcal{M} = 15.5$ kg/kmol
and $\gamma = 1.26$ to a turbine at 55 bar, exhausting at 2.2 bar with
$\eta_t = 0.58$. The turbine must deliver 8.4 MW. Compute the gas flow, and
the fraction of a 320 kg/s engine flow it represents.

**N8.** Scale the pump of N4 to an engine of one-third the thrust at the same
chamber pressure. Compute the new shaft speed, impeller diameter, tip speed,
shaft power, and NPSH required relative to the original. State which of these
five quantities are unchanged and why.

**N9.** Using the engine database entries for the F-1, the RS-25 HPFTP and
the Merlin 1D, compute the shaft power per unit sea-level thrust (W/N) for
each. Comment on the ordering and relate it to each engine's chamber
pressure and cycle.

### Engineering reasoning

**R1.** A development engine shows the following across a test series: pump
discharge pressure normal, chamber pressure normal, but the pump inlet
pressure transducer shows a growing 180 Hz oscillation whose amplitude scales
with power level, and the shaft runs at 21 600 rpm. Identify the two most
likely mechanisms, say which frequency ratio each would produce, and state
the one measurement that would settle it.

**R2.** A vacuum upper-stage engine is being designed for 30 kN and 900 s of
cumulative burn across eight restarts. The customer asks for pressure feeding
"for reliability". Using Eq. 3.10 with sensible coefficients, compute the
crossover burn time and present the mass case. Then present the reliability
case honestly, including at least one argument the mass case cannot address.

**R3.** A pump's suction-performance test in water shows a 3 % head-loss knee
at NPSH = 24 m. In liquid hydrogen, the same pump at the same $\omega\sqrt Q$
shows the knee at 11 m. Explain the mechanism, estimate the local temperature
depression implied, and say why you would nevertheless not certify the pump
on the 11 m figure without further test.

**R4.** An engine team has a fuel pump at $N_s = 0.19$ and an efficiency of
0.58. They propose to fix it by raising shaft speed 40 %. Evaluate that
proposal: what happens to $N_s$, to NPSHr, to tip speed, and to the LOX pump
if it is on the same shaft? Propose an alternative and justify it.

**R5.** The LE-7 was lost to an LH₂ turbopump inducer failure, and the LE-7A
that replaced it runs at *lower* chamber pressure (12.0 vs 12.7 MPa)
[_verify-liquid]. Explain the chain of reasoning from "inducer failed" to
"reduce chamber pressure", using the equations of §3.13 to say what
quantities changed and by how much, qualitatively.

### Mini trade study

**T1.** You are designing the feed system for a **reusable** 400 kN methalox
booster engine at $p_c = 150$ bar, required to fly 50 times with inspection
but no overhaul, and to restart in flight for landing. LOX and LCH₄ densities
differ by only ~2.7×. Choose between:

- **(A)** single-shaft, gas-generator cycle, rolling-element bearings,
  inducers on both pumps, helium-pressurised tanks;
- **(B)** single-shaft, oxidiser-rich staged combustion, hydrostatic
  bearings, autogenous pressurisation with a helium start bottle;
- **(C)** dual-shaft full-flow staged combustion, hydrostatic bearings,
  autogenous pressurisation;
- **(D)** single-shaft gas generator with electric-motor-driven boost pumps
  and autogenous pressurisation.

Constraints: dry mass target 900 kg; 50-flight life with the bearings and
seals as the life-limiting items; restart capability without a consumable
igniter fluid; development schedule of five years. Recommend one, state the
three quantities you would compute first to defend it, and name the single
risk most likely to defeat your choice.

---

## 11. Quiz (100 points)

**Q1 (8 pts).** A pump develops 1 800 m of head. Compute the pressure rise
for (a) liquid hydrogen at 70.8 kg/m³ and (b) liquid oxygen at 1 140 kg/m³.
State in one sentence what this implies about single-shaft LOX/LH₂
turbopumps.

**Q2 (8 pts).** Multiple choice. A tank is pressurised with the propellant's
own saturated vapour. NPSH available at the pump inlet is:
(a) larger than with helium at the same tank pressure, because the gas is
compatible; (b) equal, because NPSH depends only on tank pressure;
(c) determined almost entirely by the liquid column and acceleration, because
$p_t - p_v \approx 0$; (d) undefined. Explain your answer.

**Q3 (12 pts).** A helium system must displace 5.0 m³ at 22 bar. Gas enters
the ullage at 320 K with a collapse factor of 1.45. Compute the required
helium mass. Then compute the bottle volume if it is charged to 27.5 MPa
($Z = 1.15$) and regulated down until lockup at 2.6 MPa ($Z = 1.01$), at
290 K.

**Q4 (10 pts).** Multiple choice, with justification. The dominant reason
rocket gas-generator turbines run at $\eta_t \approx 0.6$ rather than 0.85
is: (a) hot-gas leakage past the shroud; (b) the blade speed ratio $U/C_0$ is
far below optimum because the pressure ratio is very high; (c) partial
admission losses; (d) the gas is chemically reacting through the stage.

**Q5 (12 pts).** A LOX pump passes 0.062 m³/s at 32 000 rpm. The tank is at
2.8 bar, $p_v = 1.05$ bar, $\rho = 1\,140$ kg/m³, suction line loss 0.25 bar,
liquid 3.0 m above the inlet at 1.4 $g_0$. Compute NPSHa and the required
$N_{ss}$. State whether the design is feasible and what you would change.

**Q6 (10 pts).** Explain in no more than five sentences why the RS-25 needs
two low-pressure turbopumps but the F-1 needs none, referring to at least two
equations from this module by number.

**Q7 (10 pts).** An engine is scaled from 800 kN to 200 kN at constant
chamber pressure and constant specific speed. State what happens to each of:
shaft speed, impeller diameter, tip speed, shaft power, NPSH required, and
required tank pressure. Give the scaling factor for each.

**Q8 (10 pts).** A turbopump shows a vibration line at 0.62× shaft speed that
appears only above 85 % power and grows with power. Name the phenomenon,
state the physical mechanism in one sentence, name the historical engine
whose development is the standard case study, and give two fixes.

**Q9 (10 pts).** Engineering judgment. A pressure-fed 25 kN storable engine
with a 600 s burn is proposed for a satellite servicing vehicle that must be
storable for five years and restart 40 times. Eq. 3.10 says a turbopump would
be lighter. Give the strongest argument for pressure feeding anyway, and the
strongest argument against it, and say which you would act on.

**Q10 (10 pts).** From the data table in §3.20, the RD-170's turbopump power
is given as either ~170 MW or 192 MW. (a) State how the course requires you
to present a contested figure like this. (b) Using the lower figure and the
RD-170's 7 900 kN sea-level thrust, compute the shaft power per newton and
compare it to the RE-500 value from WE2. (c) Explain the difference in terms
of chamber pressure and cycle.

---

## 12. Further reading

- **[SP-8107]** *Turbopump Systems for Liquid Rocket Engines* — start here.
  Architecture selection, shaft arrangement, axial thrust balance, seals and
  bearings, and how the turbopump talks to the engine cycle. Read it before
  any of the component monographs.
- **[SP-8052]** Jakobsen & Keller, *Liquid Rocket Engine Turbopump Inducers* —
  the design rules for inducers: blade angles, tip clearance, suction
  performance, and rotating cavitation. Pair with Brennen.
- **[Brennen-Pumps]** Brennen, *Hydrodynamics of Pumps* — the physics behind
  SP-8052. Cavitation, thermodynamic effects, rotordynamic forces and
  cavitation-induced instability, by someone who worked on rocket pumps.
  **Free full text from the author.** Chapters 2–8 are this module's
  §§3.10–3.18 done properly.
- **[SP-8109]** *Liquid Rocket Engine Centrifugal Flow Turbopumps* — impeller
  and diffuser sizing, head–flow prediction, off-design and stall, and
  material choice for LOX and LH₂ service. The design manual for §3.10.
- **[SP-8125]** Scheer et al., *Liquid Rocket Engine Axial-Flow Turbopumps* —
  narrow but definitive on multistage axial LH₂ pumps; the J-2 fuel pump's
  design world.
- **[SP-8110]** *Liquid Rocket Engine Turbines* — turbine design for the
  partial-admission, very-high-pressure-ratio regime that the gas-turbine
  literature does not cover. Blade stress and thermal issues included.
- **[SP-8112]** *Pressurization Systems for Liquid Rockets* — the reference
  for §§3.4–3.5. Stored-gas, autogenous and chemical pressurisation, gas
  requirement calculation, collapse factors, and the ullage heat-and-mass
  transfer problem done honestly rather than with a coefficient.
- **[SP-8080]** *Liquid Rocket Pressure Regulators, Relief Valves, Check
  Valves, Burst Disks, and Explosive Valves* — the components of §3.6 and
  their failure modes. Read alongside [SP-8094] and [SP-8097] (Module 14).
- **[SP-8123]** *Liquid Rocket Lines, Bellows, Flexible Hoses, and Filters* —
  line sizing, flow-induced vibration, bellows fatigue and squirm, and
  filtration. Directly relevant to water hammer and POGO.
- **[SP-8100]** *Liquid Rocket Engine Turbopump Gears* and **[SP-8101]**
  *Shafts and Couplings* — the RL10 gearbox and the rotordynamics of §3.17,
  in period language. Use SP-8101 with Brennen; its rotordynamics is
  pre-modern.
- **[Biggs89]** "Space Shuttle Main Engine: The First Ten Years" — the
  insider narrative of turbopump bearings, subsynchronous whirl and the
  test-stand incidents. **Free full text.** The best account anywhere of what
  it actually costs to develop a staged-combustion turbopump.
- **[SSME-Orient]** *Space Shuttle Main Engine Orientation* — the clearest
  diagrams of a four-turbopump staged-combustion powerhead, valve by valve.
- **[Japikse]** Japikse, Marscher & Furst, *Centrifugal Pump Design and
  Performance* — impeller and diffuser loss models, slip factors, and the
  mechanical integration. Written for industrial pumps: translate the
  specific-speed ranges before applying them to a LOX pump.
