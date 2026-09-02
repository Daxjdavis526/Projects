# Module 02 — Compressible Flow and Nozzles
Part I · Prerequisites: module 01 · Estimated time: 8 h

A nozzle is the only part of a rocket engine that converts thermal energy into
directed momentum, and it is the part most often designed by someone copying an
area ratio out of a table. That is how you end up with a first stage whose
nozzle separates asymmetrically at 40 seconds into flight and rips its own
gimbal actuators off the mount. Everything in this module exists because a
compressible flow does the opposite of what your incompressible intuition
predicts: push harder on a choked throat and nothing downstream notices; open
the area and the flow speeds *up*; lower the back pressure below a certain value
and the nozzle stops caring about it entirely. Get the sign of $dA/dV$ wrong once
and you will design a converging nozzle for a supersonic exhaust. Get the
separation criterion wrong once and you will find out what a side load is on the
test stand, at full scale, with witnesses.

---

## 1. Learning objectives

After this module you should be able to:

1. Derive the speed of sound from a control volume around a weak pressure wave,
   and state exactly which assumptions make it $a=\sqrt{\gamma R T}$.
2. Derive the isentropic stagnation relations $T_0/T$, $p_0/p$, $\rho_0/\rho$
   from the steady-flow energy equation, and explain why $T_0$ is conserved
   across a shock but $p_0$ is not.
3. Derive the area–velocity relation and use it to explain, without hand-waving,
   why a throat exists and why the throat is sonic when the nozzle is flowing
   supersonically.
4. Compute Mach number, static pressure, static temperature, density and
   velocity at any station of a nozzle given $\gamma$ and the local area ratio.
5. Classify a converging–diverging nozzle's operating regime from
   $p_0/p_{\text{amb}}$ and $\varepsilon$, and sketch the wall pressure
   distribution for each regime.
6. Derive the normal-shock (Rankine–Hugoniot) relations for a perfect gas,
   compute the stagnation-pressure loss and entropy rise, and locate a shock
   inside a nozzle for a given back pressure.
7. Use oblique-shock and Prandtl–Meyer relations to explain the geometry of an
   overexpanded and an underexpanded plume, including Mach diamonds.
8. Estimate flow separation location in an overexpanded nozzle with the
   Summerfield and Schmucker criteria, state their disagreement honestly, and
   explain free versus restricted shock separation.
9. Quantify how thrust and specific impulse change with altitude for a fixed
   nozzle, and explain the sea-level/vacuum $I_{sp}$ gap of a real engine.
10. Recommend an expansion ratio for a given stage, and defend it against the
    separation and side-load constraint rather than against $I_{sp}$ alone.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| speed of sound | $a$ | m/s | propagation speed of an infinitesimal pressure disturbance in the fluid |
| Mach number | $M$ | – | $V/a$; ratio of flow speed to local speed of sound |
| static pressure | $p$ | Pa | pressure measured by an instrument moving with the fluid |
| static temperature | $T$ | K | thermodynamic temperature of the fluid in its own frame |
| density | $\rho$ | kg/m³ | mass per unit volume |
| velocity | $V$ | m/s | flow speed along the nozzle axis (quasi-1D) |
| stagnation (total) pressure | $p_0$ | Pa | pressure reached by isentropically decelerating the flow to rest |
| stagnation temperature | $T_0$ | K | temperature reached by adiabatically decelerating the flow to rest |
| stagnation density | $\rho_0$ | kg/m³ | $p_0/(RT_0)$ |
| ratio of specific heats | $\gamma$ | – | $c_p/c_v$; ~1.13–1.30 for rocket exhaust, 1.4 for cold air |
| specific gas constant | $R$ | J/(kg·K) | $R_u/\mathcal{M}$, with $R_u = 8314.46$ J/(kmol·K) |
| molar mass | $\mathcal{M}$ | kg/kmol | mass per mole of the exhaust mixture |
| specific heat at constant pressure | $c_p$ | J/(kg·K) | $\gamma R/(\gamma-1)$ for a calorically perfect gas |
| throat area | $A_t$ | m² | minimum cross-sectional area of the nozzle |
| sonic reference area | $A^*$ | m² | area at which the flow would be sonic at the *local* stagnation state |
| exit area | $A_e$ | m² | nozzle exit plane area |
| expansion (area) ratio | $\varepsilon$ | – | $A_e/A_t$ |
| local area ratio | $A/A^*$ | – | ratio of local area to the sonic reference area |
| exit Mach number | $M_e$ | – | Mach number at the nozzle exit plane |
| exit pressure | $p_e$ | Pa | static pressure at the nozzle exit plane |
| ambient pressure | $p_a$ | Pa | atmospheric pressure outside the nozzle |
| back pressure | $p_b$ | Pa | pressure imposed on the nozzle exit by the downstream environment |
| mass flow rate | $\dot m$ | kg/s | mass per unit time through the nozzle |
| specific entropy | $s$ | J/(kg·K) | entropy per unit mass |
| Mach angle | $\mu$ | rad | $\arcsin(1/M)$; angle of a weak wave to the flow |
| Prandtl–Meyer function | $\nu(M)$ | rad | total turning angle to accelerate isentropically from $M=1$ to $M$ |
| oblique-shock wave angle | $\beta$ | rad | angle between an oblique shock and the upstream flow |
| flow deflection angle | $\theta$ | rad | angle through which an oblique shock turns the flow |
| separation pressure | $p_{sep}$ | Pa | wall static pressure at which the boundary layer separates |
| separation area ratio | $\varepsilon_{sep}$ | – | $A/A_t$ at the separation point |
| thrust | $F$ | N | axial force produced by the engine |
| thrust coefficient | $C_F$ | – | $F/(p_0 A_t)$; the nozzle's contribution to thrust |
| characteristic velocity | $c^*$ | m/s | $p_0 A_t/\dot m$; the chamber's contribution to thrust |
| specific impulse | $I_{sp}$ | s | $F/(\dot m g_0)$, with $g_0 = 9.80665$ m/s² |

Subscripts: $0$ stagnation, $t$ throat, $e$ exit, $a$ ambient, $1$ upstream of a
shock, $2$ downstream of a shock, $n$ component normal to an oblique shock.

---

## 3. Theory

### 3.1 What "compressible" buys you and what it costs

In module 01 you treated the chamber as a reservoir of hot gas at $p_0$, $T_0$.
The nozzle's job is to convert the enthalpy of that reservoir into kinetic
energy. The steady-flow energy equation for an adiabatic duct with no shaft work
says the total enthalpy is constant:

$$h + \tfrac{1}{2}V^2 = h_0 = \text{const}$$

> **Eq. 3.1** — variables: $h$ static specific enthalpy (J/kg), $V$ velocity
> (m/s), $h_0$ stagnation enthalpy (J/kg). Means: every joule of kinetic energy
> comes out of enthalpy; a nozzle is an enthalpy-to-velocity converter and
> nothing else. Assumes: steady, adiabatic, no body forces, no shaft work.
> Fails when: heat is added or removed (film-cooled walls, afterburning of a
> fuel-rich plume), or when chemistry releases energy during the expansion —
> then $h_0$ drifts and you need the reacting-flow treatment of module 04. [F]

For a calorically perfect gas $h = c_p T$ and Eq. 3.1 becomes
$c_p T + V^2/2 = c_p T_0$. Note immediately what this gives you: the *maximum*
velocity, obtained by expanding to $T \to 0$, is
$V_{\max} = \sqrt{2 c_p T_0} = \sqrt{2\gamma R T_0/(\gamma-1)}$. For a LOX/LH₂
exhaust with $\mathcal{M}=13.5$ kg/kmol, $T_0 = 3600$ K, $\gamma = 1.2$:
$R = 615.9$ J/(kg·K) and $V_{\max} = 5763$ m/s. Real engines reach 4200–4500 m/s
because you cannot expand to zero pressure with a finite nozzle. That single
number tells you the whole game: you are trying to buy the last 25% of a
thermodynamic limit with nozzle area, and area costs mass, length and — as
§3.14 will show — structural grief.

Compressibility is what makes this non-trivial. In an incompressible flow,
continuity is $AV = \text{const}$: open the area, slow the flow. In a
compressible flow, $\rho A V = \text{const}$, and above $M=1$ the density falls
faster than the velocity rises, so the area must *increase* to keep accelerating.
Everything strange about nozzles descends from that competition. To make it
quantitative we first need $a$.

### 3.2 The speed of sound, derived

Consider a plane pressure disturbance of infinitesimal strength moving into
still gas at $p$, $\rho$, $T$. Put the control volume *on the wave* so the flow
is steady: gas enters the wave at speed $a$ (the wave speed, seen from the wave)
with density $\rho$, and leaves at $a + dV$ with density $\rho + d\rho$ and
pressure $p + dp$.

```
        moving frame (steady)
   ρ, p, T                 ρ+dρ, p+dp
   ──────►  a       │       ──────►  a+dV
                    │
                 wave front
```

Continuity across the control volume:

$$\rho a = (\rho + d\rho)(a + dV) \;\Rightarrow\; a\,d\rho + \rho\,dV = 0$$

(dropping the second-order term $d\rho\,dV$). Momentum, with pressure forces on
the two faces and no friction over an infinitesimal length:

$$p - (p+dp) = \rho a\left[(a+dV) - a\right] \;\Rightarrow\; dp = -\rho a\, dV$$

Eliminate $dV$ between the two:

$$a^2 = \frac{dp}{d\rho}$$

The disturbance is infinitesimal, so it is reversible; it is fast, so there is
no time for heat conduction, so it is adiabatic. Reversible plus adiabatic is
isentropic, so the derivative is taken at constant entropy:

$$a = \sqrt{\left(\frac{\partial p}{\partial \rho}\right)_s}$$

> **Eq. 3.2** — variables: $a$ (m/s), $p$ (Pa), $\rho$ (kg/m³), $s$ (J/(kg·K)).
> Means: sound speed is set by how stiff the fluid is to isentropic
> compression. Assumes: infinitesimal amplitude (so reversible), adiabatic,
> no dispersion. Fails when: the disturbance is finite — a shock is a
> *finite* compression, is irreversible, and travels faster than $a$; also
> fails in two-phase flow, where $(\partial p/\partial\rho)_s$ collapses and
> sound speeds of tens of m/s are possible. [F]

For a perfect gas, $p = \rho R T$ and isentropic means $p/\rho^\gamma =$ const,
so $(\partial p/\partial\rho)_s = \gamma p/\rho = \gamma R T$:

$$a = \sqrt{\gamma R T} = \sqrt{\gamma R_u T/\mathcal{M}}$$

> **Eq. 3.3** — variables: $\gamma$ (–), $R$ (J/(kg·K)), $T$ (K). Means: sound
> speed depends only on the *local static* temperature and gas composition, not
> on pressure. Assumes: thermally and calorically perfect gas, single phase,
> equilibrium composition. Fails when: the gas is dissociating (the effective
> $\gamma$ and $\mathcal{M}$ both change through the nozzle), or condensed phase
> is present (Al₂O₃ in a solid motor — see module 24). [F]

Two consequences worth internalising. First, $a \propto \sqrt{T/\mathcal{M}}$:
hydrogen-rich exhaust has a sound speed roughly twice that of a kerosene
exhaust at the same temperature, which is the entire reason LOX/LH₂ engines have
high $I_{sp}$ and why they need enormous nozzles to exploit it. For LOX/LH₂ at
3600 K, $a_0 = \sqrt{1.2 \times 615.9 \times 3600} = 1631$ m/s; for LOX/RP-1 at
3600 K with $\mathcal{M}=22$, $R = 377.9$ J/(kg·K) and $a_0 = 1278$ m/s.
Second, $a$ falls as the gas expands and cools, so $M = V/a$ rises for *two*
reasons in a nozzle — $V$ up and $a$ down. That is why exit Mach numbers of 4–6
are ordinary in rocketry and rare in aeronautics.

### 3.3 What the Mach number actually means

$M = V/a$ is usually introduced as a bookkeeping ratio. It is better understood
as the ratio of two speeds of information transfer: how fast the fluid is being
carried downstream, versus how fast the fluid can tell its upstream neighbours
that something has changed. Pressure information travels at $a$ relative to the
fluid. In a subsonic flow ($M<1$) it travels upstream at $a - V > 0$: the
nozzle exit can inform the chamber about the back pressure, and it does. In a
supersonic flow ($M>1$) it cannot: $a - V < 0$, every disturbance is swept
downstream, and the upstream flow is *deaf*. This is not an analogy; it is the
mechanism behind choking (§3.6) and behind the fact that a rocket in vacuum and
the same rocket at sea level have identical chamber conditions.

Equivalently, $M^2 = V^2/(\gamma R T) \propto$ (directed kinetic energy)/(random
thermal energy). At $M = 4.7$, roughly 92% of the energy that started as random
molecular motion in the chamber has been converted into one-directional motion.
That, in one sentence, is what a nozzle does.

The weak-wave picture also gives the Mach angle. A point disturbance in a
supersonic stream emits sound spheres of radius $at$ whose centres convect
$Vt$ downstream; the envelope is a cone of half-angle

$$\mu = \arcsin\frac{1}{M}$$

> **Eq. 3.4** — variables: $\mu$ (rad), $M$ (–). Means: the angle at which weak
> (Mach) waves lean back in a supersonic stream; the steeper the wave, the lower
> the Mach number. Assumes: steady uniform supersonic flow, infinitesimal
> disturbance. Fails when: the disturbance is finite (then it steepens into an
> oblique shock at $\beta > \mu$), or $M \le 1$. [F]

At $M_e = 4.71$ (the RS-25 exit, §5.2), $\mu = 12.3°$ — the reason the shock
structure in a rocket plume is stretched into long thin cells rather than
compact diamonds.

### 3.4 Stagnation state and the isentropic relations

Define the stagnation state as the state the fluid would reach if brought to
rest. Bring it to rest *adiabatically* and Eq. 3.1 gives $c_p T_0 = c_p T +
V^2/2$. Divide by $c_p T$ and substitute $c_p = \gamma R/(\gamma - 1)$ and
$V^2 = M^2 \gamma R T$:

$$\frac{T_0}{T} = 1 + \frac{V^2}{2c_pT} = 1 + \frac{M^2\gamma R T}{2T\gamma R/(\gamma-1)} = 1 + \frac{\gamma-1}{2}M^2$$

> **Eq. 3.5** — variables: $T_0$, $T$ (K), $M$ (–), $\gamma$ (–). Means: the
> temperature the flow would recover if stopped; equivalently, a measure of how
> much of the thermal energy has been converted to kinetic energy. Assumes:
> adiabatic, calorically perfect gas. **Does not assume reversibility** — $T_0$
> is conserved across a shock, across friction, across anything adiabatic.
> Fails when: heat is added/removed, or $c_p$ varies strongly with $T$ (in a
> real rocket nozzle $c_p$ falls by 10–20% from chamber to exit; see module 04
> for the frozen-versus-equilibrium correction). [F]

If in addition the deceleration is *reversible*, the isentropic relation
$p/\rho^\gamma =$ const together with $p=\rho R T$ gives $p \propto
T^{\gamma/(\gamma-1)}$ and $\rho \propto T^{1/(\gamma-1)}$, so:

$$\frac{p_0}{p} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}}
\qquad
\frac{\rho_0}{\rho} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{1}{\gamma-1}}$$

> **Eq. 3.6, 3.7** — variables as above; $p$ (Pa), $\rho$ (kg/m³). Means:
> the pressure and density a station would recover on isentropic
> stagnation. Assumes: adiabatic **and reversible**, calorically perfect gas.
> Fails when: entropy is generated — across a shock, in a separated region, in
> a boundary layer, or in a strongly non-equilibrium expansion. $p_0$ is the
> quantity that *records* irreversibility: any loss shows up as $p_0$ falling
> while $T_0$ stays put. [F]

That asymmetry is the single most useful diagnostic in this module. $T_0$ is
conserved by adiabaticity; $p_0$ is conserved only by reversibility. So a
measured drop in stagnation pressure between two stations, with no heat
transfer, is a direct measurement of entropy generated:

$$\Delta s = -R\ln\frac{p_{0,2}}{p_{0,1}}$$

> **Eq. 3.8** — variables: $\Delta s$ (J/(kg·K)), $p_0$ (Pa), $R$ (J/(kg·K)).
> Means: stagnation-pressure ratio *is* entropy generation, in disguise.
> Assumes: adiabatic ($T_{0,1}=T_{0,2}$), perfect gas. Fails when: heat is
> exchanged, in which case $T_0$ changes too and the full Gibbs relation is
> needed. [F]

At $M=1$ the ratios take fixed values that are worth memorising for the two
$\gamma$ values you will meet most. Setting $M=1$ in Eqs. 3.5–3.7:

| quantity | general | $\gamma=1.2$ | $\gamma=1.4$ |
|---|---|---|---|
| $T^*/T_0$ | $2/(\gamma+1)$ | 0.9091 | 0.8333 |
| $p^*/p_0$ | $[2/(\gamma+1)]^{\gamma/(\gamma-1)}$ | 0.5645 | 0.5283 |
| $\rho^*/\rho_0$ | $[2/(\gamma+1)]^{1/(\gamma-1)}$ | 0.6209 | 0.6339 |

The throat of every chemical rocket sits at roughly 56% of chamber pressure and
91% of chamber temperature. If a test article's throat static tap reads far from
$0.56\,p_c$, either the tap is in the wrong place, the flow is not choked, or
your $\gamma$ is wrong. [J]

### 3.5 Quasi-one-dimensional flow and the area–velocity relation

Model the nozzle as a duct of slowly varying area $A(x)$ with uniform properties
across each station. This is the **quasi-1D** approximation: it is a lie about
the radial direction that costs a few percent in a well-designed bell nozzle and
much more in a short one (module 09 handles the divergence loss). Under it,
steady conservation gives:

- continuity: $\rho A V = \dot m = \text{const}$, so $\dfrac{d\rho}{\rho} + \dfrac{dA}{A} + \dfrac{dV}{V} = 0$
- momentum (frictionless, no body force): $dp = -\rho V\,dV$ (the Euler equation)
- isentropic: $dp = a^2 d\rho$

Substitute the last two into the first. From Euler, $d\rho = dp/a^2 =
-\rho V dV/a^2$, so $d\rho/\rho = -M^2\,dV/V$. Then

$$-M^2\frac{dV}{V} + \frac{dA}{A} + \frac{dV}{V} = 0
\qquad\Longrightarrow\qquad
\boxed{\;\frac{dA}{A} = \left(M^2 - 1\right)\frac{dV}{V}\;}$$

> **Eq. 3.9 (area–velocity relation)** — variables: $A$ (m²), $V$ (m/s), $M$ (–).
> Means: whether opening the duct accelerates or decelerates the flow depends
> entirely on the sign of $M^2-1$. Assumes: steady, quasi-1D, isentropic,
> frictionless, no heat addition, no mass addition. Fails when: the wall
> boundary layer is thick (an effective-area correction is needed), where there
> is mass addition (film cooling, turbine-exhaust dump into the nozzle as on the
> F-1), or across a shock. [F]

Read it carefully, because three of the four cases are counter-intuitive:

- $M<1$, $dA<0$ ⟹ $dV>0$. Subsonic converging duct accelerates. (Intuitive.)
- $M<1$, $dA>0$ ⟹ $dV<0$. Subsonic diffuser decelerates. (Intuitive.)
- $M>1$, $dA>0$ ⟹ $dV>0$. **Supersonic diverging duct accelerates.** Because
  $\rho$ falls faster than $V$ rises, area must grow to pass the same $\dot m$.
- $M>1$, $dA<0$ ⟹ $dV<0$. Supersonic converging duct decelerates — this is how
  a supersonic diffuser works, and why a supersonic inlet is shaped like a
  nozzle run backwards.
- $M=1$ ⟹ $dA = 0$. **The sonic point can only occur at an area extremum.**

That last line is the derivation of the throat. It does not say a throat is
sonic; it says that *if* the flow is sonic anywhere, it is at a station where
$dA=0$. Combined with the requirement that a continuous acceleration from
subsonic to supersonic must pass through $M=1$, it says: to get supersonic
exhaust you must have a converging section, then a minimum, then a diverging
section. There is no other shape that works. Every rocket nozzle on Earth is a
consequence of the sign of $M^2-1$.

The converse subtlety, which trips people up: an area minimum does *not* have to
be sonic. Eq. 3.9 at $dA=0$ is satisfied either by $M=1$ or by $dV=0$. The
second branch is a fully subsonic nozzle whose throat is the point of maximum
velocity and minimum pressure, with the flow decelerating again downstream —
a Venturi. Which branch nature takes is decided by the back pressure, and that
is §3.9.

### 3.6 Choking, and why the throat goes sonic

Take a converging–diverging nozzle fed from a fixed reservoir at $p_0$, $T_0$
and lower the back pressure $p_b$ from $p_0$ downwards.

At $p_b$ slightly below $p_0$, the flow is subsonic everywhere, the throat is
the fastest point, and mass flow increases as $p_b$ falls: the downstream
environment is signalling upstream, and the flow responds. Continue lowering
$p_b$ and the throat Mach number rises until it reaches exactly 1. At that
instant the throat becomes an information barrier: pressure disturbances at the
throat travel upstream at $a - V = 0$ and stand still. Lower $p_b$ further and
the news cannot propagate past the throat. The chamber conditions, the throat
conditions and the mass flow all freeze. The nozzle is **choked**.

Quantitatively: mass flux $G = \rho V = \rho_0 a_0 \, M \,
(1+\frac{\gamma-1}{2}M^2)^{-\frac{\gamma+1}{2(\gamma-1)}}$, which is maximised
at $M=1$ (differentiate and set to zero; the derivative vanishes only there).
The maximum mass flux the duct can pass at a given stagnation state occurs at
sonic conditions, and the throat, being the smallest area, is where the flow
first reaches that limit. Evaluating at $M=1$ and multiplying by $A_t$:

$$\dot m = \frac{p_0 A_t}{\sqrt{R T_0}}\,\Gamma(\gamma),
\qquad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.10 (choked mass flow)** — variables: $\dot m$ (kg/s), $p_0$ (Pa),
> $A_t$ (m²), $R$ (J/(kg·K)), $T_0$ (K). Means: a choked throat is a mass-flow
> metering device set by the stagnation state and throat area alone. Assumes:
> choked ($p_0/p_b > $ the critical ratio), perfect gas, uniform 1D throat flow,
> no boundary layer. Fails when: the discharge coefficient departs from 1 —
> real throats pass 0.97–0.99 of Eq. 3.10 because of the wall boundary layer and
> throat curvature; and when the throat erodes (solid motors, module 24), $A_t$
> is not constant. [F]

$\Gamma(1.2) = 0.6485$, $\Gamma(1.3) = 0.6673$, $\Gamma(1.4) = 0.6847$. Note the
weak dependence — a 17% error in $\gamma$ moves $\dot m$ by 5%. This is why
$c^* = p_0 A_t/\dot m = \sqrt{RT_0}/\Gamma$ is such a robust figure of merit
(module 03).

**This is the fact that makes rocketry tractable.** Because the throat is
choked from ignition to shutdown, the chamber does not know whether it is at sea
level or in vacuum. Chamber pressure, mass flow, mixture ratio and $c^*$ are
altitude-independent. *All* altitude effects on a rocket engine live downstream
of the throat, in $C_F$. Hold on to that; §3.16 is built on it.

### 3.7 The area–Mach relation

We now want the local Mach number as a function of local area. Write $\dot m$
at an arbitrary station and at the sonic reference station $A^*$ and set them
equal ($\dot m$ and $p_0,T_0$ are common):

$$\rho A V = \rho^* A^* a^*$$

$$\frac{A}{A^*} = \frac{\rho^*}{\rho}\frac{a^*}{V}
= \frac{\rho^*/\rho_0}{\rho/\rho_0}\cdot\frac{1}{M}\sqrt{\frac{T^*}{T}}$$

Substituting Eqs. 3.5 and 3.7 and the $M=1$ values from §3.4, and collecting:

$$\frac{A}{A^*} = \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.11 (area–Mach relation)** — variables: $A$ (m²), $A^*$ (m²), $M$ (–),
> $\gamma$ (–). Means: the geometry alone fixes the Mach number of an isentropic
> flow. Assumes: isentropic, quasi-1D, calorically perfect, choked (so $A^*=A_t$).
> Fails when: a shock has occurred upstream (then $A^*$ jumps — see §3.10), when
> the flow has separated (the effective $A$ is the separated jet's area, not the
> wall's), or when the boundary layer is a significant fraction of the radius.
> [F]

Two properties matter operationally. First, $A/A^*$ has a minimum of 1 at $M=1$
and two roots for every $A/A^* > 1$: one subsonic, one supersonic. Geometry
alone does not tell you which; the back pressure does. Second, the supersonic
branch is brutally flat at high $\varepsilon$: for $\gamma=1.2$, going from
$\varepsilon=77.5$ to $\varepsilon=165$ moves $M_e$ only from 4.71 to 5.26, and
$p_e/p_0$ from $9.0\times10^{-4}$ to $3.5\times10^{-4}$. Each additional second
of vacuum $I_{sp}$ costs disproportionately more nozzle. The RL10B-2's 285:1
extension is the extreme statement of that trade — and it exists only because a
carbon–carbon skirt can be *stowed* and deployed after staging.

Eq. 3.11 cannot be inverted in closed form; every implementation (including
`tools/rocket.py:mach_from_area_ratio`) does a bracketed bisection on the branch
you ask for.

### 3.8 The full station table

Given $\gamma$, $A/A_t$ and the choice of branch you now have everything:

1. $M$ from Eq. 3.11 (numerically).
2. $T/T_0$ from Eq. 3.5, $p/p_0$ from Eq. 3.6, $\rho/\rho_0$ from Eq. 3.7.
3. $a = \sqrt{\gamma R T}$, $V = Ma$.
4. $\dot m$ from Eq. 3.10 — constant, so it is a check, not a computation.

Worked example 5.1 does this for a $\gamma=1.2$, $\varepsilon=16$ nozzle
station by station. Do it once by hand. After that, use the library.

### 3.9 The converging–diverging nozzle versus back pressure

Fix the nozzle ($\gamma$, $\varepsilon$) and the chamber ($p_0$, $T_0$). Lower
$p_b$ from $p_0$ to zero. The flow passes through a sequence of regimes. Below
is the classic wall-pressure-distribution figure — the one reproduced in
[SB §3.3], in [Anderson-MCF ch. 5] and in [HP ch. 3], and worth drawing from
memory in an interview:

```
 p/p0
 1.0 ┤────╮                                       curve  regime
     │     ╲╮                                     ─────  ──────
     │      ╲╲╮ (a)  venturi, unchoked            (a) subsonic throughout
     │       ╲╲╲──────────────────── (a)          (b) first choked, subsonic exit
 0.56┤────────●╲╲╮                                (c) normal shock inside
     │      throat╲╲───────────────  (b)          (d) shock at exit plane
     │            ╲ ╲╮   ┌──────────  (c)         (e) overexpanded, oblique shocks
     │             ╲ ╲───┘                        (f) design (ideally expanded)
     │              ╲    ┌───────────  (d)        (g) underexpanded, expansion fans
     │               ╲╲──┘
     │                ╲╲╲╲───────────  (e)  ← wall p above pa, jump up outside
     │                 ╲╲╲╲╲──────────  (f)  ← pe = pa exactly
     │                  ╲╲╲╲╲╲─────────  (g)  ← wall p below pa, expands outside
   0 ┼───────┴──────────────────────────► x
     inlet  throat                  exit
```

Regime by regime, with the physics:

**(a) Subsonic throughout ("venturi").** $p_b$ just below $p_0$. Throat is the
minimum pressure; the diverging section acts as a diffuser and recovers
pressure. $\dot m$ depends on $p_b$. Nothing is choked. Rockets never operate
here except momentarily during start-up, but ground test facilities with
altitude simulation live here during pump-down and it matters for the diffuser
design (module 18).

**(b) First choked.** $p_b$ has fallen to the value at which the throat exactly
reaches $M=1$ while the diverging section is still entirely subsonic. For
$\gamma=1.2$, $\varepsilon=16$ this occurs at $p_b/p_0 = 0.9992$ — remarkably
close to $p_0$, because the subsonic root of Eq. 3.11 at $\varepsilon=16$ is
$M = 0.037$. From now on $\dot m$ is frozen at the Eq. 3.10 value.

**(c) Normal shock inside the diverging section.** For $p_b$ below the (b)
value, the flow accelerates supersonically past the throat, then must be
compressed to match $p_b$ at the exit. It does so through a normal shock
standing at the station where the resulting downstream subsonic diffusion
happens to deliver exactly $p_b$ at the exit plane. Lower $p_b$ ⟹ the shock
moves *downstream* and gets stronger. This is the regime with the worst
performance in the whole catalogue (§3.10).

**(d) Shock at the exit plane.** The limiting case of (c). For our
$\gamma=1.2$, $\varepsilon=16$, $p_0=7.0$ MPa example, the shock sits at the lip
when $p_b = 667$ kPa. Regime (c) therefore spans $6994 > p_b > 667$ kPa; it is a
*narrow* window in $p_b/p_0$ terms (0.999 down to 0.095) but an enormous one in
absolute pressure, and every engine traverses it during start-up.

**(e) Overexpanded, oblique shocks outside.** For $667 > p_b > 47.4$ kPa the
nozzle flows full and supersonically to the exit at $p_e = 47.4$ kPa, and the
compression to $p_b$ happens *outside*, through oblique shocks that spring from
the lip and cross on the axis (§3.11). The flow inside is unaffected by $p_b$ —
this is the choking argument again, applied at the exit plane. But this is only
true of an *inviscid* analysis: the real boundary layer can be pushed off the
wall by the adverse pressure jump, which drags the shock system back inside the
nozzle (§3.14). That is why (e) is where nozzles get destroyed.

**(f) Design point (ideally expanded).** $p_b = p_e$. No waves at the lip; the
plume leaves as a clean parallel column. Maximum thrust *for that nozzle at that
ambient pressure*.

**(g) Underexpanded, expansion fans outside.** $p_b < p_e$. The jet continues
expanding after leaving the nozzle through Prandtl–Meyer fans anchored at the
lip (§3.12), overexpands relative to ambient, gets compressed back by reflected
waves, and repeats — Mach diamonds (§3.13). Every rocket in vacuum is deeply
underexpanded. It costs performance relative to an infinitely long nozzle, but
that expansion happens outside the hardware where it exerts no useful axial
force on anything.

The single most important structural fact about this list: the transition
between regimes is set by $p_b/p_0$ and $\varepsilon$, and for a launch vehicle
$p_b$ falls by three orders of magnitude in six minutes. Your engine will pass
through most of these regimes on every flight.

### 3.10 Normal shocks

A normal shock is a discontinuity — in practice a few molecular mean free paths
thick, so on the scale of a nozzle it *is* a discontinuity — across which a
supersonic flow becomes subsonic. Derive it from a control volume that straddles
the shock, with constant area (the shock is thin, so $A_1 = A_2$), adiabatic
walls (nothing has time to conduct), and no friction on the side walls (there
are none over that length):

$$\rho_1 V_1 = \rho_2 V_2 \tag{mass}$$
$$p_1 + \rho_1 V_1^2 = p_2 + \rho_2 V_2^2 \tag{momentum}$$
$$h_1 + \tfrac{1}{2}V_1^2 = h_2 + \tfrac{1}{2}V_2^2 \tag{energy}$$

These three, with $p=\rho R T$ and $h = c_p T$, are the **Rankine–Hugoniot**
conditions. Solve them. Write $\rho V^2 = \gamma p M^2$ (since $\rho V^2 =
\rho M^2 \gamma R T = \gamma p M^2$); the momentum equation becomes

$$p_1(1+\gamma M_1^2) = p_2(1+\gamma M_2^2) \;\Rightarrow\;
\frac{p_2}{p_1} = \frac{1+\gamma M_1^2}{1+\gamma M_2^2} \tag{i}$$

Energy with Eq. 3.5 gives $T_{0,1} = T_{0,2}$, i.e.

$$\frac{T_2}{T_1} = \frac{1+\frac{\gamma-1}{2}M_1^2}{1+\frac{\gamma-1}{2}M_2^2} \tag{ii}$$

Mass with $\rho = p/RT$ and $V = M\sqrt{\gamma R T}$ gives
$p_1 M_1/\sqrt{T_1} = p_2 M_2/\sqrt{T_2}$, i.e.

$$\frac{p_2}{p_1} = \frac{M_1}{M_2}\sqrt{\frac{T_2}{T_1}} \tag{iii}$$

Substituting (i) and (ii) into (iii) yields a quadratic in $M_2^2$ whose trivial
root is $M_2 = M_1$ (no shock) and whose non-trivial root is:

$$M_2^2 = \frac{1+\frac{\gamma-1}{2}M_1^2}{\gamma M_1^2 - \frac{\gamma-1}{2}}$$

> **Eq. 3.12** — variables: $M_1$, $M_2$ (–), $\gamma$ (–). Means: the
> downstream Mach number of a normal shock, always $<1$ for $M_1>1$. Assumes:
> steady, adiabatic, constant-area, perfect gas, no body forces. Fails when: the
> gas dissociates or vibrationally relaxes across the shock (real rocket exhaust
> at $M>4$ does — the perfect-gas result overpredicts $T_2$), or the "shock" is
> actually a thick separation-induced compression system. [F]

Back-substituting into (i):

$$\frac{p_2}{p_1} = 1 + \frac{2\gamma}{\gamma+1}\left(M_1^2-1\right)$$

> **Eq. 3.13 (normal-shock static pressure ratio)** — variables as above; $p$
> (Pa). Means: shock strength grows roughly as $M_1^2$; a $M_1=4.7$ shock
> compresses by a factor of 24. Assumes: as Eq. 3.12. Fails when: the same
> conditions fail; also, note this is *static* pressure — the stagnation
> pressure goes the other way. [F]

And the density and temperature ratios follow:

$$\frac{\rho_2}{\rho_1} = \frac{(\gamma+1)M_1^2}{(\gamma-1)M_1^2+2},
\qquad
\frac{T_2}{T_1} = \frac{p_2/p_1}{\rho_2/\rho_1}$$

> **Eq. 3.14, 3.15** — Means: the density ratio saturates at
> $(\gamma+1)/(\gamma-1)$ = 11 for $\gamma=1.2$ no matter how strong the shock,
> while the temperature ratio grows without bound. That saturation is why
> hypersonic shock layers are thin and hot. Assumes/fails: as Eq. 3.12. [F]

**Entropy rise and stagnation pressure loss.** Combining Eq. 3.13–3.15 with the
Gibbs relation for a perfect gas, $\Delta s = c_p\ln(T_2/T_1) - R\ln(p_2/p_1)$,
and using Eq. 3.8, gives the stagnation-pressure ratio $p_{0,2}/p_{0,1} =
e^{-\Delta s/R}$. For $\gamma=1.2$ and LOX/LH₂ exhaust ($R=615.9$ J/(kg·K)):

| $M_1$ | $p_2/p_1$ | $M_2$ | $\Delta s$ (J/(kg·K)) | $p_{0,2}/p_{0,1}$ |
|---|---|---|---|---|
| 1.2 | 1.48 | 0.838 | 4.7 | 0.992 |
| 1.5 | 2.36 | 0.686 | 50.0 | 0.922 |
| 2.0 | 4.27 | 0.546 | 240 | 0.677 |
| 3.0 | 9.73 | 0.421 | 906 | 0.230 |
| 4.0 | 17.4 | 0.369 | 1723 | 0.061 |
| 4.71 | 24.1 | 0.348 | 2312 | 0.023 |

Two things to notice, both of which matter more than the algebra. First,
$\Delta s > 0$ always for $M_1 > 1$, and setting $M_1 < 1$ in Eq. 3.13 gives
$\Delta s < 0$: **expansion shocks are forbidden by the second law**. That is
the only reason the shock in the table goes the way it does. Second, the loss is
negligible for weak shocks ($M_1 = 1.2$ costs 0.8% of $p_0$) and catastrophic
for strong ones ($M_1 = 4.7$ destroys 97.7% of it).

**Why a normal shock in a nozzle is the worst case.** The stagnation pressure
after the shock is what the remaining nozzle has to work with. Thrust scales
with $p_0$ at fixed $A_t$; destroy $p_0$ and you destroy thrust. Worse, the
subsonic flow downstream of the shock *decelerates* in the diverging section
(Eq. 3.9, subsonic branch), converting the little velocity that survived back
into static pressure. In the $\varepsilon=16$, $p_0=7$ MPa example of §5.1, a
shock standing at $A/A_t = 5.2$ leaves the flow at $M_{exit} = 0.129$ — the
nozzle is producing a trickle of momentum flux and a large exit pressure, i.e.
almost no thrust and a very unhappy structure. A rocket engine never operates in
this regime deliberately. It passes through it in the first tens of
milliseconds of start-up, and *that* transient is what shakes nozzles apart
(§3.15).

Locating a shock inside a nozzle for a given $p_b$ is a standard exercise with
one trick: **$A^*$ changes across the shock.** Since $\dot m$ and $T_0$ are
unchanged but $p_0$ falls, Eq. 3.10 requires $A^*_2/A^*_1 = p_{0,1}/p_{0,2} > 1$.
Downstream of the shock the flow is on the subsonic branch of Eq. 3.11
evaluated with the *new*, larger $A^*$. Worked example 5.4 and problem C6 do
this.

### 3.11 Oblique shocks

Real nozzle exits do not produce normal shocks; they produce oblique ones,
because the flow must be *turned* as well as compressed. An oblique shock is
exactly a normal shock in the frame that translates along the wave: decompose
the upstream velocity into components normal ($V_{n1} = V_1\sin\beta$) and
tangential ($V_{t}$) to the wave. The tangential component is unchanged (no
pressure gradient along the wave); the normal component obeys every normal-shock
relation with $M_{n1} = M_1\sin\beta$:

$$\frac{p_2}{p_1} = 1+\frac{2\gamma}{\gamma+1}\left(M_1^2\sin^2\beta - 1\right),
\qquad
M_2 = \frac{M_{n2}}{\sin(\beta-\theta)}$$

> **Eq. 3.16, 3.17** — variables: $\beta$ wave angle (rad), $\theta$ deflection
> (rad), $M_{n2}$ from Eq. 3.12 with $M_{n1}=M_1\sin\beta$. Means: an oblique
> shock is a normal shock plus a ride-along tangential velocity; it compresses
> and turns without necessarily going subsonic. Assumes: straight, steady,
> planar (or locally planar) wave; perfect gas. Fails when: the wave is curved
> strongly (then the flow behind is rotational), or when $\theta$ exceeds the
> maximum for that $M_1$ and the shock detaches into a bow shock. [F]

The geometric closure is the θ–β–M relation:

$$\tan\theta = 2\cot\beta\,\frac{M_1^2\sin^2\beta-1}{M_1^2(\gamma+\cos 2\beta)+2}$$

> **Eq. 3.18 (θ–β–M)** — Means: for a given upstream Mach number and required
> turning angle there are two solutions, a weak shock (small $\beta$,
> supersonic downstream) and a strong shock (large $\beta$, subsonic
> downstream); free jets take the weak one. Assumes: attached, straight,
> two-dimensional or conical-equivalent wave. Fails when: $\theta > \theta_{max}$
> — the shock detaches; and at $\theta=0$, where the solutions degenerate to
> $\beta=\mu$ (a Mach wave) and $\beta=90°$ (a normal shock). [F]

For an overexpanded plume, the required pressure jump sets $M_{n1}$, hence
$\beta$, hence $\theta$. RS-25 at sea level (§5.2): $M_e=4.71$, $p_e = 18.7$
kPa, needs $p_a/p_e = 5.42$, giving $M_{n1} = 2.25$, $\beta = 28.5°$ and a
deflection of $\theta = 20.2°$. The plume physically necks inward by twenty
degrees at the lip — which is precisely what a Shuttle launch photograph shows.

### 3.12 Prandtl–Meyer expansion

The opposite process: turning a supersonic flow *away* from itself through a
centred fan of Mach waves. Each wave is infinitesimal, so the process is
isentropic — this is the crucial asymmetry with shocks. Integrating the
differential turning relation $d\theta = \sqrt{M^2-1}\,dV/V$ gives the
Prandtl–Meyer function:

$$\nu(M) = \sqrt{\frac{\gamma+1}{\gamma-1}}\arctan\sqrt{\frac{\gamma-1}{\gamma+1}(M^2-1)} - \arctan\sqrt{M^2-1}$$

> **Eq. 3.19 (Prandtl–Meyer function)** — variables: $\nu$ (rad), $M$ (–).
> Means: the angle through which a sonic flow must be turned to reach $M$
> isentropically; the turn required between two states is
> $\Delta\theta = \nu(M_2)-\nu(M_1)$. Assumes: steady, isentropic, 2D planar
> (the axisymmetric case needs characteristics — see [ZH Vol. 2]), perfect gas.
> Fails when: the required turn exceeds $\nu_{max} = \frac{\pi}{2}
> (\sqrt{(\gamma+1)/(\gamma-1)}-1)$, which is $130.5°$ for $\gamma=1.2$;
> beyond that a vacuum forms. [F]

For $\gamma=1.2$: $\nu(4.71) = 102.0°$. Expanding an RS-25 exhaust at 20 km,
where $p_a = 5.47$ kPa and $p_e = 18.7$ kPa, requires reaching $M=5.43$ with
$\nu = 113.4°$, so the plume boundary turns outward by $11.4°$ at the lip. Note
the asymmetry with §3.11: at sea level the flow is turned inward 20° through a
shock and loses stagnation pressure; at altitude it is turned outward 11°
through a fan and loses nothing. Expansion is free; compression is not.

Prandtl–Meyer theory is also the basis of nozzle contour design: the diverging
wall of a bell nozzle *is* a designed sequence of expansion waves, and the
[Rao58] optimum contour is the wall shape that terminates the expansion with a
uniform, axial exit flow at minimum length. Module 09 develops this.

### 3.13 Plume structure and Mach diamonds

Put §3.11 and §3.12 together and the plume shock-cell structure falls out.

*Underexpanded* ($p_e > p_a$, i.e. every rocket at altitude): the jet expands
through a fan at the lip, overshoots (it expands past $p_a$ because it has
inertia), is turned back by an intercepting oblique shock, overshoots the other
way, and repeats. The waves reflect off the free jet boundary — a constant-
pressure surface — and a compression reflects off a free boundary as an
expansion, which is why the pattern is periodic rather than damped. At high
pressure ratios the intercepting shocks meet on the axis and a **Mach disk**, a
normal shock, forms; the flow through the disk is subsonic and hot, which is
what makes the diamonds visible as bright nodes.

*Overexpanded* ($p_e < p_a$, sea-level operation of a high-$\varepsilon$
engine): the same cell structure, but the sequence starts with an oblique
shock rather than a fan.

The cell spacing follows the classic Prandtl estimate

$$L \approx 1.306\, D_e \sqrt{M_e^2 - 1}$$

> **Eq. 3.20** — variables: $L$ cell length (m), $D_e$ exit diameter (m), $M_e$
> (–). Means: the axial wavelength of the shock-cell pattern. Assumes: a
> slightly imperfectly expanded jet, weak waves, no mixing. Fails when: the
> pressure ratio is large (real first cells are longer than this), when the
> shear layer grows quickly, and always for the far cells, which mixing erases.
> [E], [A]

RS-25 at sea level: $D_e = 2.37$ m, $M_e = 4.71$, so $L \approx 14$ m. F-1:
$D_e = 3.55$ m, $M_e = 3.60$, $L \approx 16$ m. Those are the right order for
launch photographs, which is all this correlation is good for. [J]

One more caution: a real rocket plume is chemically active. The visible diamonds
in a kerosene or hydrogen plume are often *afterburning* of fuel-rich exhaust
with entrained atmospheric oxygen, brightest where the Mach disk raises the
temperature. The wave structure and the luminous structure are correlated but
not the same thing. Do not read plume brightness as a quantitative shock
diagnostic.

### 3.14 Flow separation in overexpanded nozzles

Everything above §3.9(e) assumed inviscid flow. It is now time to pay for that.

The wall boundary layer arrives at the exit region with low momentum. If the
flow outside it must go through a compression — the oblique-shock system of an
overexpanded plume — that adverse pressure gradient is communicated *upstream*
through the subsonic part of the boundary layer. If it is strong enough, the
boundary layer separates: it lifts off the wall, an oblique shock forms at the
separation point, and ambient air is entrained into the recirculating region
downstream. The nozzle is then effectively shortened; the wall downstream of
separation sees ambient-ish pressure rather than the low pressure the isentropic
solution predicts.

The engineering question is where. The oldest answer, and still the one every
propulsion engineer quotes first, is [SFS54]:

$$p_{sep} \approx 0.4\,p_a$$

> **Eq. 3.21 (Summerfield criterion)** — variables: $p_{sep}$ wall static
> pressure at separation (Pa), $p_a$ ambient (Pa). Means: the flow separates
> where the wall pressure has fallen to roughly 40% of ambient. Assumes:
> conical nozzle, turbulent boundary layer, steady operation. Fails when: the
> nozzle is a thrust-optimised contour (restricted shock separation changes the
> answer entirely), at high chamber pressure, and in transients. The constant is
> quoted anywhere from 0.25 to 0.45 in the literature. [E]

Summerfield's criterion is dimensionally naive: it makes the separation pressure
independent of Mach number, when the physics — the ability of a boundary layer
to survive a pressure jump — obviously depends on how strong that jump is.
Schmucker's survey [Schmucker73] collected every criterion then in circulation
(Summerfield, Schilling, Kalt–Badal, and others) and showed they disagree by
tens of percent. The correlation usually attributed to Schmucker is:

$$\frac{p_{sep}}{p_a} = \left(1.88\,M_{sep} - 1\right)^{-0.64}$$

> **Eq. 3.22 (Schmucker criterion)** — variables: $M_{sep}$ Mach number just
> upstream of separation (–). Means: the higher the local Mach number, the lower
> the wall pressure the boundary layer can survive before separating — the
> physically sensible trend Summerfield lacks. Assumes: turbulent attached
> boundary layer, conical or near-conical wall, steady. Fails when: the contour
> is strongly thrust-optimised (RSS regime), during transients, and outside the
> $M \approx 2\text{–}5$ range from which it was fitted. Solve it
> simultaneously with Eq. 3.11 and 3.6, since $M_{sep}$ and the wall pressure
> are both functions of the same station. [E]

The modern reference is Östlund's review [OMK05] and the underlying thesis
[Ostlund02], which are what you should actually read before choosing a
criterion for hardware. Their central contribution is the distinction between
two separation topologies:

- **Free shock separation (FSS).** The boundary layer separates and *never*
  reattaches; the separated jet flows on to the exit as a free jet surrounded
  by a recirculating region open to ambient. The wall pressure downstream of
  separation rises to slightly below ambient and stays there. This is what
  conical nozzles do, and what the classical criteria describe.
- **Restricted shock separation (RSS).** In thrust-optimised (Rao-type)
  contours, the internal shock generated near the throat interacts with the
  separation shock in such a way that the separated shear layer *reattaches* to
  the wall, trapping a closed recirculation bubble. Downstream of reattachment
  the wall pressure jumps well *above* ambient. This was first identified on
  cold-flow models and then in J-2S and Vulcain testing.

The transition between FSS and RSS is not gradual: as chamber pressure rises
during start-up, the separation pattern flips from FSS to RSS (and can flip
back during shutdown), and it can do so *asymmetrically* around the
circumference. That flip is a step change in the wall pressure distribution. It
is the dominant side-load mechanism in high-area-ratio bell nozzles, and it is
the reason a thrust-optimised contour — which is better than a cone at every
steady operating point — is *worse* in the start transient. [F], [OMK05]

**Practical consequence.** A criterion like Eq. 3.21 or 3.22 tells you whether
your steady sea-level operating point is inside or outside the separation
envelope. It does not tell you what happens between $t=0$ and mainstage. For
that you need transient analysis, subscale cold-flow testing, and — historically
— a strain-gauged nozzle on a test stand.

### 3.15 Side loads

If separation were axisymmetric it would cost performance and nothing else. It
is not. The separation line wanders circumferentially by a few percent of the
exit radius, driven by turbulence, by asymmetry in the incoming flow, and, in
the FSS↔RSS transition, by which side flips first. An asymmetric pressure
distribution over an area the size of a nozzle exit produces a lateral force:

$$F_{side} = \oint p(\theta, x)\,\hat{n}\;dA$$

For a nozzle with a 2.4 m exit and a pressure asymmetry of only 10 kPa over a
quarter of the exit area, the lateral force is of order 10 kN — applied to a
structure cantilevered off a gimbal bearing, at a frequency that can excite the
nozzle's bending modes. Measured SSME start-transient side loads are in the
hundreds of kN; the Vulcain 2 nozzle's side loads during the FSS/RSS transition
were severe enough to be a programme-level issue and drove nozzle stiffening and
start-sequence changes [OMK05], [Ostlund02].

Mitigations, in rough order of how often they are used [M]:

1. **Sequence the start** so that chamber pressure rises fast through the
   dangerous window (the shorter the traverse, the less impulse the loads
   deliver).
2. **Stiffen the nozzle and the gimbal mount** so the loads are survivable
   rather than avoided.
3. **Truncate the contour** — accept a lower $\varepsilon$ and a lower vacuum
   $I_{sp}$ in exchange for staying out of the separation regime at sea level.
   This is why booster engines rarely exceed $\varepsilon \approx 25$–40.
4. **Cold-flow subscale testing** of the exact contour, which is how the
   FSS/RSS behaviour is actually established before hot fire.
5. **Dual-bell and altitude-compensating contours** [R] — proposed for decades,
   flown by nobody at scale.

### 3.16 Altitude effects on thrust and the sea-level/vacuum $I_{sp}$ gap

Thrust is momentum flux plus a pressure term:

$$F = \dot m V_e + (p_e - p_a)A_e$$

> **Eq. 3.23 (rocket thrust equation)** — variables: $F$ (N), $\dot m$ (kg/s),
> $V_e$ (m/s), $p_e$, $p_a$ (Pa), $A_e$ (m²). Means: the pressure term is the
> net force from ambient pressure failing to act on the exit plane. Assumes:
> uniform, axial exit flow (quasi-1D); attached flow to the exit. Fails when:
> the nozzle has separated — then $A_e$ and $p_e$ are those of the separated
> jet, not the hardware. Derived properly in module 03. [F]

Because $\dot m$, $V_e$, $p_e$ and $A_e$ are all fixed by the choked-throat
argument of §3.6, the *only* altitude-dependent term is $-p_a A_e$:

$$\frac{dF}{dp_a} = -A_e$$

A vacuum-to-sea-level thrust difference is therefore exactly $p_{a,SL}A_e$, to
the accuracy of the quasi-1D model. For the RS-25 ($A_e = 4.42$ m² at
$\varepsilon = 77.5$): $101325 \times 4.42 = 448$ kN. Published RS-25 figures at
109% are 2279 kN vacuum and 1860 kN sea level, a difference of 419 kN — 7% from
the prediction, which is about what you expect once the real $\varepsilon$
ambiguity (§6.1) and nozzle losses are accounted for.

In coefficient form (module 03), $C_F = C_{F,vac} - \varepsilon\,p_a/p_0$, so:

$$\frac{I_{sp,SL}}{I_{sp,vac}} = \frac{C_{F,SL}}{C_{F,vac}} = 1 - \frac{\varepsilon\, p_a}{p_0\,C_{F,vac}}$$

> **Eq. 3.24** — variables: $\varepsilon$ (–), $p_a$ (Pa), $p_0$ (Pa). Means:
> the whole sea-level $I_{sp}$ penalty is a single term, $\varepsilon p_a/p_0$.
> Assumes: same nozzle, attached flow, choked throat, $c^*$ unchanged with
> altitude (it is). Fails when: the nozzle separates at sea level, in which case
> the real sea-level $I_{sp}$ is *higher* than this predicts, because separation
> shortens the nozzle and removes the most negative part of the pressure
> integral. [F]

Check it against hardware, with $\gamma = 1.2$:

| engine | $\varepsilon$ | $p_0$ (MPa) | predicted $C_{F,SL}/C_{F,vac}$ | published $I_{sp,SL}/I_{sp,vac}$ |
|---|---|---|---|---|
| RS-25 | 77.5 | 20.64 | 0.803 | 366/452.3 = 0.809 |
| F-1 | 16 | 7.0 | 0.871 | 263/304 = 0.865 |
| Merlin 1D (SL) | 16 | 9.7 | 0.907 | 282/311 = 0.907 |

Agreement to better than 1% on three engines with three different propellants,
from a model with one fitted parameter ($\gamma$) that was not fitted. That is
how much of rocket nozzle performance is just Eq. 3.11 and Eq. 3.23. The
remaining percent is divergence loss, boundary layer, kinetics and combustion
efficiency, and modules 03, 04 and 09 spend a great deal of effort on it.

The design consequence: $\varepsilon$ is a *stage-dependent* variable, not an
engine-quality metric. Increasing $\varepsilon$ always increases vacuum $I_{sp}$
and always decreases sea-level $I_{sp}$. A first stage picks $\varepsilon$ to
maximise integrated impulse over the trajectory subject to not separating; an
upper stage picks the largest $\varepsilon$ that fits inside the interstage and
the mass budget. Merlin 1D flies both answers on the same vehicle: 16:1 on the
nine sea-level engines, 165:1 on the vacuum engine, same powerhead.

### 3.17 Where this model stops being true

State the failures explicitly, because everything above is a first-order model:

- **Calorically perfect gas.** Real exhaust has $c_p(T)$ and a composition that
  shifts as it cools. $\gamma$ is not constant along the nozzle; the standard
  practice is to use an effective $\gamma$ fitted to the expansion, or to run
  [CEA] and use its area-ratio output directly. Error in $I_{sp}$ from a single-
  $\gamma$ model: typically 1–3%. [A]
- **Frozen versus equilibrium expansion.** Whether recombination reactions keep
  up with the expansion sets how much dissociation energy is recovered. Real
  engines lie between the two bounds. Module 04.
- **Quasi-1D.** The exit flow of a bell nozzle is not axial; the divergence loss
  is $\lambda = (1+\cos\alpha)/2$ for a cone and better for a Rao contour.
  Module 09.
- **Boundary layer.** Displaces the effective area (1% or so of $A_t$) and
  contributes drag; also, it is the thing that separates.
- **Two-phase flow.** Condensed Al₂O₃ in a solid motor does not follow the gas
  and does not expand; it costs several percent of $I_{sp}$ and changes the
  effective $\gamma$. Module 24.

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| $\gamma$ (rocket exhaust) | 1.13–1.30 | 1.13 (LOX/LH₂-rich, hot) | 1.30 (cold gas N₂ is 1.40; module 28) |
| chamber $T_0$ | 1000–3700 K | ~300 K cold gas | 3670 K LOX/LH₂ at optimum O/F |
| exhaust $\mathcal{M}$ | 10–30 kg/kmol | ~13.5 (LOX/LH₂) | ~29 (N₂O₄/MMH) |
| $p^*/p_0$ | 0.53–0.57 | — | fixed by $\gamma$ alone |
| $\varepsilon$, booster (sea level) | 12–40 | 8 (V-2, 3.5) | 40 (RS-68A, 21.5) |
| $\varepsilon$, upper stage / vacuum | 40–300 | 45 (Vulcain 1) | 285 (RL10B-2, deployed) |
| $M_e$ | 2.5–6 | 2.5 ($\varepsilon\approx 4$) | 5.7 ($\varepsilon=285$) |
| $p_e/p_0$ | $10^{-4}$–$10^{-1}$ | $8\times10^{-5}$ (RL10B-2) | $10^{-1}$ (short conical) |
| $p_e$, sea-level engine | 40–80 kPa | 18.7 kPa (RS-25, extreme) | 80 kPa |
| $p_e/p_a$ at liftoff | 0.15–0.8 | 0.18 (RS-25) | 0.65 (Merlin 1D SL) |
| $I_{sp,SL}/I_{sp,vac}$ | 0.80–0.93 | 0.80 (RS-25) | 0.93 (low-$\varepsilon$ booster) |
| throat mass flux $\rho^*V^*$ | 2000–5000 kg/(m²·s) | — | scales with $p_0/\sqrt{T_0}$ |
| separation $p_{sep}/p_a$ | 0.25–0.45 | criteria disagree by tens of % | see [Schmucker73] |
| start-transient side load | $10^1$–$10^2$ kN | small engines | SSME/Vulcain class |

Extremes worth naming: **RL10B-2** at $\varepsilon = 285$ (deployed) holds the
flown $I_{sp}$ record at 465.5 s vacuum; **RS-25** runs the most overexpanded
sea-level nozzle ever flown at $p_e/p_a \approx 0.18$; the **V-2** at
$\varepsilon \approx 3.5$ is the other end of history entirely.

---

## 5. Worked examples

All four are reproduced by `tools/examples/02.py` and computed with
`tools/rocket.py`. Where a number here differs from a hand calculation in the
last digit, the library value governs.

### 5.1 Full isentropic station table, $\gamma = 1.2$, $\varepsilon = 16$

**Given.** An F-1-scale gas-generator engine. Exhaust: $\mathcal{M} = 22$
kg/kmol, $\gamma = 1.2$ (both [A] — see module 04 for where these come from).
Chamber: $p_0 = 7.0$ MPa (70 bar, 1015 psia — the F-1's nominal, and note §6.2
on how contested that is), $T_0 = 3600$ K. Throat area $A_t = 0.618$ m²
($D_t = 0.887$ m). $\varepsilon = 16$.

**Step 1 — gas properties.**
$R = R_u/\mathcal{M} = 8314.46/22 = 377.9$ J/(kg·K).
$a_0 = \sqrt{\gamma R T_0} = \sqrt{1.2\times377.9\times3600} = 1278$ m/s.

**Step 2 — mass flow (Eq. 3.10).**
$\Gamma(1.2) = \sqrt{1.2}\,(2/2.2)^{2.2/0.4} = 0.6485$.
$$\dot m = \frac{7.0\times10^6 \times 0.618}{\sqrt{377.9\times3600}}\times0.6485 = 2405\ \text{kg/s}$$

**Step 3 — station table.** For each station, get $M$ from Eq. 3.11 (subsonic
root upstream of the throat, supersonic root downstream), then Eqs. 3.5–3.7,
then $a$ and $V$.

| station | $A/A_t$ | branch | $M$ | $T/T_0$ | $p/p_0$ | $\rho/\rho_0$ | $T$ (K) | $p$ (MPa) | $V$ (m/s) |
|---|---|---|---|---|---|---|---|---|---|
| injector face | ∞ | sub | 0 | 1.0000 | 1.000000 | 1.00000 | 3600 | 7.000 | 0 |
| converging | 3.0 | sub | 0.202 | 0.9959 | 0.97591 | 0.97988 | 3585 | 6.831 | 257 |
| converging | 1.5 | sub | 0.438 | 0.9812 | 0.89215 | 0.90928 | 3532 | 6.245 | 555 |
| **throat** | 1.0 | — | 1.000 | 0.9091 | 0.56447 | 0.62092 | 3273 | 3.951 | 1218 |
| diverging | 2.0 | super | 2.055 | 0.7031 | 0.12078 | 0.17178 | 2531 | 0.845 | 2202 |
| diverging | 4.0 | super | 2.619 | 0.5931 | 0.04351 | 0.07337 | 2135 | 0.305 | 2578 |
| diverging | 8.0 | super | 3.122 | 0.5064 | 0.01687 | 0.03331 | 1823 | 0.118 | 2839 |
| **exit** | 16.0 | super | 3.604 | 0.4349 | 0.00677 | 0.01557 | 1566 | 0.0474 | 3037 |

**Step 4 — read the physics off the table.** Half of the velocity (1218 of
3037 m/s) is produced in the converging section and the throat; the other half
takes a sixteen-fold area increase. The static temperature falls by 2034 K,
which is where the kinetic energy came from. The exit pressure is 47.4 kPa —
*below* sea-level ambient of 101.3 kPa, so this engine is overexpanded at
liftoff with $p_e/p_a = 0.47$.

**Step 5 — separation check.** Summerfield (Eq. 3.21) gives
$p_{sep}= 0.4 \times 101325 = 40.5$ kPa. The exit wall pressure of 47.4 kPa is
above that, so no separation is predicted at sea level. Schmucker (Eq. 3.22)
with $M_e = 3.604$: $p_{sep}/p_a = (1.88\times3.604-1)^{-0.64} = 0.278$, i.e.
28.2 kPa — also below the exit pressure. Both criteria agree: this nozzle runs
full at sea level, comfortably. That is exactly why $\varepsilon = 16$ was
chosen (§6.2).

**Sanity check.** Published F-1 total flow is 2577 kg/s (reference/_verify-liquid.md, F-1 entry).
We computed 2405 kg/s, 6.7% low. The gap is not an error in Eq. 3.10; it is the
chamber pressure. The F-1's $p_c$ is quoted at 965, 982, 1015 and 1125 psia in
different sources, and $\dot m \propto p_0$: at 1125 psia (77.6 bar) the same
throat passes 2665 kg/s. This is a good early lesson in reading engine data —
the equation is fine, the input is contested.

### 5.2 At what altitude does an $\varepsilon = 77.5$, $p_0 = 20.6$ MPa nozzle stop being overexpanded?

**Given.** The RS-25 at 109% power level: $p_0 = 20.64$ MPa (2994 psia,
206.4 bar — one of the best-attested numbers in the engine database),
$\varepsilon = 77.5$. **Caveat, and it is a real one:** the RS-25's expansion
ratio is contested — 69:1 on the L3Harris datasheet and Wikipedia's infobox,
77.5:1 in NASA/Rocketdyne training material and most of the aerodynamics
literature, 78:1 in places. See §6.1. This example uses 77.5 as specified;
§6.1 works the 69:1 case so you can see how much it moves. $\gamma = 1.2$,
$\mathcal{M} = 13.5$ kg/kmol, $T_0 = 3600$ K [A].

**Step 1 — exit Mach number.** Invert Eq. 3.11 on the supersonic branch:
$M_e = 4.707$.

**Step 2 — exit pressure.** Eq. 3.6:
$$\frac{p_0}{p_e} = \left(1+0.1\times4.707^2\right)^{6} = 1.1048\times10^{3}
\;\Rightarrow\;
p_e = \frac{20.64\times10^6}{1104.8} = 18.68\ \text{kPa}$$

**Step 3 — find the altitude where $p_a = p_e$.** Using the 1976 US Standard
Atmosphere: $p_a = 18.68$ kPa lies in the isothermal stratosphere
($T = 216.65$ K above 11 km, where $p_{11} = 22.632$ kPa):
$$h = 11000 + \frac{R_{air}T}{g_0}\ln\frac{p_{11}}{p_e}
= 11000 + \frac{287.05\times216.65}{9.80665}\ln\frac{22632}{18682} = 11000 + 1216$$
$$\boxed{h \approx 12.2\ \text{km}}$$

**Step 4 — the trajectory in context.**

| $h$ (km) | $p_a$ (kPa) | $p_e/p_a$ | regime |
|---|---|---|---|
| 0 | 101.3 | 0.184 | deeply overexpanded |
| 5 | 54.0 | 0.346 | overexpanded |
| 10 | 26.4 | 0.707 | overexpanded |
| 12.2 | 18.7 | 1.00 | **ideally expanded** |
| 15 | 12.0 | 1.55 | underexpanded |
| 20 | 5.47 | 3.41 | underexpanded |

**Sanity check.** A Shuttle stack passed 12 km at roughly T+60 s, near max-Q and
shortly before SRB separation. So the RS-25 is overexpanded for the first minute
of an 8.5-minute burn and underexpanded for the remaining seven and a half —
which is the correct design choice for an engine that burns almost all its
propellant above 12 km. The engine is *optimised for vacuum and tolerated at sea
level*, and the whole of §3.14 exists because of that decision.

### 5.3 Where does that nozzle separate at sea level? (Schmucker)

**Given.** Same nozzle, sea level, $p_a = 101.325$ kPa.

**Step 1 — set up the simultaneous condition.** Separation occurs at the station
where the isentropic wall pressure equals the criterion pressure:
$$\frac{p_0}{\left(1+\frac{\gamma-1}{2}M^2\right)^{\gamma/(\gamma-1)}} = p_a\left(1.88M-1\right)^{-0.64}$$
One equation, one unknown $M$. Left side falls steeply with $M$; right side
falls slowly; there is a single root between $M=1$ and $M_e$.

**Step 2 — solve.** Bisection between $M = 1.5$ and $M_e = 4.707$ gives
$$M_{sep} = 4.476,\qquad p_{wall} = 28.11\ \text{kPa},\qquad p_{sep}/p_a = 0.277$$

**Step 3 — convert to a location.** Eq. 3.11 at $M = 4.476$:
$A_{sep}/A_t = 56.0$. The nozzle is $\varepsilon = 77.5$, so separation is
predicted at 72% of the exit area — in radius terms $r_{sep}/r_e =
\sqrt{56.0/77.5} = 0.85$, i.e. about 85% of the way out in radius and, for a
bell contour, roughly 90% of the way along the axis.

**Step 4 — the same calculation with Summerfield.** $p_{sep} = 0.4\times101325
= 40.5$ kPa; solving Eq. 3.6 for the station with that wall pressure gives
$M_{sep} = 4.273$ and $A_{sep}/A_t = 42.0$ — separation at 54% of exit area, far
deeper into the nozzle.

**Step 5 — read the disagreement honestly.** Two respectable criteria put the
separation point at $\varepsilon = 42.0$ and $\varepsilon = 56.0$ on the same
hardware at the same operating point. That is a 33% disagreement in area, which
is exactly the scatter [Schmucker73] documents and [OMK05] explains. If you are
sizing a nozzle you use the conservative one; if you are predicting side loads
you cannot use either one alone.

**Sanity check, and it is an uncomfortable one.** The RS-25 is *observed* to
flow full at mainstage at sea level. Both criteria predict it should not. The
resolution is §3.14: the RS-25 nozzle is a thrust-optimised contour, and both
criteria were fitted overwhelmingly to conical nozzles in free shock
separation. In a TOC at high chamber pressure the separated layer reattaches
(RSS), so "separated" and "flowing full" are not the exclusive alternatives the
criteria assume. What the criteria *do* correctly tell you is that this nozzle
lives right at the edge, and that the start transient — when $p_0$ is a fraction
of 20.6 MPa and the criteria bite hard — is where the trouble is. That is
precisely the observed history (§6.1). [J]

### 5.4 Normal-shock pressure ratio at $M_e$, and the shock-in-nozzle case

**Part A — normal shock at the exit Mach number.** $\gamma = 1.2$, $M_1 = M_e =
4.707$. Eq. 3.13:
$$\frac{p_2}{p_1} = 1 + \frac{2\times1.2}{2.2}\left(4.707^2-1\right)
= 1 + 1.0909\times21.16 = 24.08$$
With $p_1 = p_e = 18.68$ kPa, $p_2 = 450$ kPa. Eq. 3.12 gives $M_2 = 0.348$.
Entropy rise (with $R = 615.9$ J/(kg·K)): $\Delta s = 2312$ J/(kg·K), so
$p_{0,2}/p_{0,1} = e^{-2312/615.9} = 0.023$. **A normal shock at the RS-25 exit
Mach number would destroy 97.7% of the stagnation pressure.**

Why this matters even though it never happens at the exit plane: it bounds the
worst case. Any shock system inside the nozzle costs somewhere between nothing
(a Mach wave) and this. It also explains why the *oblique* shocks of §3.11 are
the benign outcome: at sea level the plume needs only $p_2/p_1 = 5.42$, which is
a $M_{n1} = 2.25$ normal component — $p_{0}$ loss of about 46% in the shocked
streamtube, not 97.7%, and only in the outer part of the jet.

**Part B — shock inside the $\varepsilon=16$ nozzle of §5.1.** Take the same
engine with a back pressure of 2.0 MPa (a sea-level-start engine during a
chamber-pressure ramp, or a nozzle in an altitude chamber that has not pumped
down). Where does the shock stand?

Procedure: for a trial shock station $A_s/A_t$, (i) get $M_1$ from Eq. 3.11
supersonic; (ii) $M_2$ from Eq. 3.12; (iii) $p_{0,2}/p_{0,1} = (p_2/p_1)\cdot
(p_{0,2}/p_2)\cdot(p_1/p_{0,1})$ from Eqs. 3.6 and 3.13; (iv) the new sonic area
$A_2^* = A_1^*\,p_{0,1}/p_{0,2}$, so the exit sees $A_e/A_2^* = \varepsilon\,
p_{0,2}/p_{0,1}$; (v) $M_{exit}$ from Eq. 3.11 **subsonic**; (vi) $p_{exit} =
p_{0,2}/(p_0/p)(M_{exit})$. Iterate on $A_s/A_t$ until $p_{exit} = p_b$.

| $A_s/A_t$ | $M_1$ | $M_2$ | $p_{0,2}/p_{0,1}$ | $M_{exit}$ | $p_{exit}$ (kPa) |
|---|---|---|---|---|---|
| 2.0 | 2.055 | 0.535 | 0.646 | 0.057 | 4514 |
| 4.0 | 2.619 | 0.455 | 0.364 | 0.102 | 2531 |
| **5.21** | **2.816** | **0.436** | **0.289** | **0.129** | **2000** |
| 8.0 | 3.122 | 0.413 | 0.197 | 0.192 | 1347 |
| 16.0 | 3.604 | 0.385 | 0.104 | 0.385 | 667 |

So at $p_b = 2.0$ MPa the shock stands at $A/A_t = 5.21$. Note the exit Mach
number: 0.129. The engine at that instant is producing a momentum flux
corresponding to an exit velocity of only 165 m/s, against 3037 m/s when flowing
full. **Thrust during a shock-in-nozzle transient is a small fraction of
mainstage thrust**, which is why start transients look the way they do on a
thrust trace and why nobody designs an engine to operate here.

**Sanity check.** The table's last row reproduces the regime-(d) boundary quoted
in §3.9: shock at the exit plane at $p_b = 667$ kPa. Below that, no shock fits
inside the nozzle and the compression moves outside as oblique shocks — the
regime the entire rest of this module worries about.

---

## 6. Real engines: why did they design it that way?

### 6.1 RS-25 / SSME — the most overexpanded nozzle ever flown [H]/[M]

**The choice.** $\varepsilon = 77.5$ (or 69; see below) on an engine that starts
at sea level, giving $p_e/p_a = 0.18$ at liftoff — a factor of 5.4
overexpansion, far past every classical separation criterion.

**Why.** The SSME burns for 8.5 minutes and is above 12 km for seven and a half
of them. Integrated over the trajectory, the vacuum $I_{sp}$ dominates the
mission; the sea-level penalty is paid for one minute while the SRBs are
providing 71% of the stack's thrust anyway. With $p_0 = 20.6$ MPa the engine can
afford a huge area ratio without an absurd exit diameter, because
$p_e = p_0/1104.8$ regardless of $p_0$'s value — high chamber pressure is what
*buys* a high area ratio at sea level. That is the fundamental reason staged
combustion and large $\varepsilon$ go together.

**The alternatives available in 1971.** A conical or lower-$\varepsilon$ bell
(safe at sea level, ~15 s less vacuum $I_{sp}$); an extendible nozzle (deployment
mechanism on a reusable engine that must also survive re-entry heating on the
orbiter — rejected); air-start only (impossible for the Shuttle architecture,
which lights the SSMEs on the pad to verify them before SRB ignition, itself a
consequential safety decision).

**What it cost.** Start-transient side loads. During the ~5 s start sequence the
chamber pressure climbs from zero to 20 MPa, and the nozzle passes through the
whole of §3.9 (c)→(e), with the separation line sweeping down the contour and
the FSS/RSS pattern flipping. This is a documented driver of the nozzle
structural design and the start sequence; the SSME development history is
candid about how much of the programme went into transient behaviour of the
turbomachinery and nozzle [Biggs89], [SSME-Orient].

**The expansion-ratio caveat you must carry.** The reference file flags this as
the classic contested figure: 69:1 (L3Harris datasheet and the Wikipedia
infobox, labelled "area ratio"), 77.5:1 (NASA/Rocketdyne training material and
most aerodynamic analyses), 78:1 (Wikipedia body text). At $\varepsilon = 69$
the same $p_0$ gives $M_e = 4.62$ and $p_e = 21.6$ kPa, moving the
ideal-expansion altitude from 12.2 km to 11.3 km and $p_e/p_a$ at liftoff from
0.184 to 0.213 — conclusions unchanged, third digits different. Print the
geometric value with its source and say the other exists; do not silently pick
one.

**Would a modern engineer choose the same?** For a vehicle with the same
architecture, yes — and did: the RS-25 flies unmodified on SLS. For a new
vehicle, the answer is increasingly no, because nobody is building
hydrogen-fuelled, pad-started, reusable-engine boosters any more; the trend is
lower $\varepsilon$ at higher chamber pressure on methane. [J]

### 6.2 F-1 — why $\varepsilon = 16$ [H]

**The choice.** $\varepsilon = 16$ including the nozzle extension, $p_c \approx
70$ bar, $p_e = 47$ kPa. Undisputed in the sources, unlike the chamber pressure.

**Why.** The F-1 is a pure first-stage engine: it burns from liftoff to 61 km,
but the S-IC's job is done in 165 s and most of the impulse is delivered low.
More importantly, $p_c$ is only 70 bar, so a large $\varepsilon$ would put
$p_e$ far below the separation limit — at $\varepsilon = 40$ and 70 bar,
$p_e = 12$ kPa, i.e. $p_e/p_a = 0.12$, comfortably into separation by any
criterion, on a 3.7 m nozzle with no experience base for side loads at that
scale in 1962. $\varepsilon = 16$ puts $p_e/p_a = 0.47$ at liftoff: above the
Summerfield line by a factor of 1.2, above Schmucker by 1.7. It is a
*deliberately conservative* choice by an engineering team that had to make five
of these work simultaneously under a manned vehicle.

**The alternatives.** A bigger bell (more vacuum $I_{sp}$, separation risk, more
mass at the worst possible place on the vehicle); a two-position nozzle
(unthinkable at that scale in 1962). Rocketdyne also had a specific asset: the
gas-generator exhaust is dumped as a film-cooling curtain into the nozzle
extension, which both cools the extension and slightly raises the wall pressure
near the exit — a helpful, if unquantified in the open literature, margin
against separation. [J]

**Would a modern engineer choose the same?** At 70 bar, yes. The way to a better
first-stage nozzle is not more area, it is more chamber pressure; that is what
every modern booster engine has done.

### 6.3 Merlin 1D versus Merlin 1D Vacuum — the same argument twice [M]

**The choice.** $\varepsilon = 16$ on the sea-level engine (up from 14.5 on
Merlin 1C), $\varepsilon = 165$ on MVac, from the same powerhead at the same
$p_c \approx 9.7$ MPa (a company figure, not independently verified).

**Why.** Identical logic to §6.2 for the booster engine: at 97 bar,
$\varepsilon = 16$ gives $p_e = 65.7$ kPa and $p_e/p_a = 0.65$ — the most
conservative sea-level nozzle in this chapter, and appropriate for an engine
that must also throttle to 40% (at which $p_c$ and therefore $p_e$ fall
proportionally, and $p_e/p_a$ drops to 0.26 — *now* it is near the separation
line, which is a constraint on the throttle range that has nothing to do with
the injector). MVac at 165:1 gives $p_e = 3.4$ kPa and is never asked to run in
atmosphere. The published $I_{sp}$ spread — 311 s vacuum for the sea-level
engine, 348 s for MVac, both from the same chamber — is the cleanest available
demonstration that expansion ratio, not chamber quality, sets the difference.

**Would a modern engineer choose the same?** Yes; this is now standard practice
for any booster/upper-stage pair. Note the caveat in the reference file that
Wikipedia's MVac infobox has at times carried 311 s in the vacuum field; use
348 s.

### 6.4 RL10B-2 — $\varepsilon = 285$ and what it takes [M]

**The choice.** A carbon–carbon extendible skirt taking the nozzle from 77:1
retracted to 285:1 deployed, ~2.5 m long, exit diameter just over 2.1 m, worth
about 30 s of $I_{sp}$; the engine holds the flown record at 465.5 s vacuum.
(The reference file flags 280:1 as a rounding that appears in secondary tables;
285:1 comes from the nozzle-development literature. Chamber pressure is *not*
reliably published — Astronautix's ~44 bar is low-confidence and this course
does not print it as data.)

**Why.** Eq. 3.11's flatness. At $\varepsilon = 77$, $p_e/p_0 = 9.1\times10^{-4}$;
at 285, $2.2\times10^{-4}$. In vacuum, every pascal of $p_e$ you fail to convert
is thrust you did not get, and there is no ambient pressure to punish you. The
only limits are mass, length and the interstage. The extendible nozzle attacks
the length limit directly: package for 77:1, fly at 285:1.

**What it cost.** A deployment mechanism that is a single-point failure with no
meaningful abort mode, and a radiatively cooled skirt that constrains the
thermal design of everything around it.

**Would a modern engineer choose the same?** For a hydrogen upper stage where
the stage is length-constrained, yes — and the RL10 family still flies. For a
new clean-sheet stage, the mechanism risk pushes toward a fixed nozzle at
somewhat lower $\varepsilon$ unless the mission is very energy-hungry. [J]

### 6.5 Vulcain 2 — the textbook side-load case [H]/[M]

**The choice.** A thrust-optimised contour at $\varepsilon = 58.2$, $p_c =
117.3$ bar, ground-started, on Ariane 5's core stage, which lights before the
boosters.

**Why it is in this module.** Vulcain is the best-documented European case of
the FSS↔RSS transition problem of §3.14: during the start transient the
separation topology in the thrust-optimised contour flips, generating
asymmetric loads on a large, ground-started nozzle. [OMK05] and [Ostlund02] —
both written from the European programme's experience — treat it as a central
case study, and Östlund's thesis is the single best open document on the
mechanism. The engineering answers were contour and structural: stiffening,
start-sequence management, and extensive subscale cold-flow characterisation
before hot fire.

**The other lesson from Vulcain.** Vulcain 2's vacuum $I_{sp}$ (429 s) is
*lower* than Vulcain 1's (431 s) despite higher chamber pressure and a bigger
nozzle (58.2 versus 45.1), because the mixture ratio went from 5.3 to 6.1 to buy
thrust and density. The optimum for a vehicle is not the optimum for an engine.
That belongs to module 04, but it is worth noticing here that $\varepsilon$ is
never optimised alone.

**Note:** sea-level thrust for Vulcain 2 is commonly quoted around 960 kN but is
not reliably sourced; this course does not print it as data.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The central trade-off

Choosing $\varepsilon$ is choosing where on the trajectory to be right:

| raise $\varepsilon$ | effect |
|---|---|
| vacuum $I_{sp}$ | up (asymptotically) |
| sea-level $I_{sp}$ | down, linearly in $\varepsilon p_a/p_0$ |
| nozzle mass and length | up, roughly as $\varepsilon$ for a fixed contour percentage |
| separation risk at sea level | up, sharply |
| side loads in the start transient | up, sharply |
| exit-plane heat load, plume radiation to the base | changes (module 10) |
| gimbal clearance and base-area packing | worse |

The correct method is trajectory-integrated: maximise $\int F\,dt$ or, properly,
the delivered $\Delta V$, subject to the separation constraint at the worst
ambient condition and to the structural side-load capability. A single-point
"optimum expansion ratio for sea level" is almost never the right answer for a
first stage, and never for an upper stage.

### 7.2 Failure modes

**Flow separation with asymmetric side loads.**
*Mechanism*: overexpanded operation drives boundary-layer separation; the
separation line is unsteady and non-axisymmetric; FSS↔RSS transition in a TOC
adds a step change.
*Symptom*: lateral acceleration of the nozzle, gimbal actuator load spikes,
nozzle bending-mode response, in the worst case buckling of the exit cone or
failure of the actuator attachments.
*Evidence*: strain gauges on the nozzle and actuator load cells during start;
high-speed video of the plume showing an asymmetric, flapping shock; wall static
taps showing a pressure rise at different axial stations at different
circumferential positions.
*Fix*: shorten/truncate the contour, stiffen the structure, speed the start
transient through the window, characterise with subscale cold flow first.
[SP-8120], [OMK05].

**Shock-induced separation causing local overheating.**
*Mechanism*: a separation bubble raises local wall pressure and heat flux above
the attached-flow design value; the reattachment point is a heat-transfer peak.
*Symptom*: a circumferential band of discoloration/erosion at a fixed area
ratio.
*Evidence*: post-test inspection; thermocouples showing a local peak where the
1D model says the flux should be falling.
*Fix*: keep the separation point out of the cooled section, or design the
cooling for it.

**Throat erosion changing $A_t$ (mostly solids; ablatives in liquids).**
*Mechanism*: $A_t$ grows, so by Eq. 3.10 $\dot m$ at fixed $p_0$ grows, and by
$\varepsilon = A_e/A_t$ the expansion ratio *falls*.
*Symptom*: chamber pressure decay through the burn, $I_{sp}$ drift.
*Evidence*: $p_c$ trace, post-test throat measurement.
*Fix*: module 24.

**Unstart / re-ingestion in altitude test facilities.**
*Mechanism*: the diffuser cannot maintain the low back pressure; the nozzle
un-chokes or a shock is driven up inside.
*Symptom*: sudden thrust drop, back pressure spike, sometimes hardware damage.
*Fix*: diffuser sizing (module 18).

### 7.3 Materials, manufacturing, testing — briefly

**Materials.** The nozzle sees the entire pressure and temperature range of the
module. The throat sees the highest heat flux anywhere in the engine (module 10)
and the exit skirt sees temperatures low enough that radiation cooling works —
which is why nozzle extensions are made of things that would be absurd at the
throat: niobium alloy (Merlin Vac, visibly cherry-red in flight and normal),
carbon–carbon (RL10B-2), or nothing at all but a film of turbine exhaust
(F-1). The station table of §5.1 is what tells you where the material transition
can be.

**Manufacturing.** Contour accuracy matters more than intuition suggests near
the throat, where $dA/dx$ is largest and a manufacturing deviation moves the
sonic line; it matters less far downstream, where $dM/d(A/A_t)$ is small (§3.7).
This is why throat inserts are ground and the exit cone is not.

**Testing.** What is measured: chamber pressure — injector-end and, if you are
careful, throat-stagnation, which differ by a few percent and are the source of
half the literature's disagreements about $p_c$ (see `reference/_verify-liquid.md`,
contested figure 18); wall static pressure at a series of area ratios; thrust on a calibrated stand;
nozzle strain and actuator loads for side loads; and high-speed video of the
plume. What the data looks like when it is wrong: a wall static tap reading
close to ambient where the isentropic solution says it should read a fifth of
ambient is a separated nozzle, and the axial station where that transition
occurs is your measured $\varepsilon_{sep}$ — compare it against §5.3 and you
will find out which criterion your hardware believes.

---

## 8. Misconceptions and what engineers actually care about

**"Lowering the ambient pressure increases the mass flow."** No. Once the throat
is choked, $\dot m$ is set by $p_0$, $T_0$, $A_t$ and $\gamma$ alone (Eq. 3.10).
Ambient pressure affects thrust only through the $-p_a A_e$ term and through
separation. This is why chamber pressure does not change between a sea-level and
a vacuum firing of the same engine.

**"A converging nozzle can produce supersonic flow if you push hard enough."**
No. Eq. 3.9 forbids it: a converging duct can accelerate subsonic flow at most
to $M=1$ at its exit. Raising $p_0$ further just raises $\dot m$ and moves the
expansion outside the nozzle, where it is wasted.

**"The throat is where the flow is fastest."** Only in a subsonic (venturi)
flow. In a choked nozzle the exit is by far the fastest station: 3037 m/s versus
1218 m/s at the throat in §5.1. The throat is where the *mass flux* $\rho V$ is
maximum, which is a different quantity.

**"Overexpanded means the nozzle is separated."** No. Overexpanded means
$p_e < p_a$. Separation is a viscous phenomenon that begins somewhere below
$p_e/p_a \approx 0.3$–0.4 and depends on Mach number, contour and transients. The
F-1 was overexpanded at liftoff and flowed full; the RS-25 is overexpanded by a
factor of 5.4 and flows full at mainstage. The two words are not synonyms.

**"An underexpanded nozzle is wasting performance you could recover."** Only in
the sense that an infinitely long nozzle would do better. The expansion still
happens; it just happens outside the hardware where it pushes on nothing. Adding
area to recover it costs mass and — for a stage that also flies low — separation
risk. Every real $\varepsilon$ is this compromise.

**"Stagnation pressure is conserved in adiabatic flow."** Total *temperature* is
conserved in adiabatic flow. Total pressure is conserved only in *isentropic*
flow. The difference is the entire content of Eq. 3.8 and the reason a shock is
expensive.

**"Isp is a property of the propellant combination."** It is a property of the
propellant, the chamber, the nozzle and the altitude. Merlin 1D and Merlin 1D
Vacuum share propellants and a powerhead and differ by 37 s because of
$\varepsilon$ alone.

**"The Mach diamonds show where the shocks are."** They show where the
*luminosity* is, which in a fuel-rich plume is largely afterburning with
entrained air, brightest behind the Mach disks. Correlated, not identical. In a
vacuum plume there are no diamonds to see at all, and the wave structure is
still there.

### What engineers actually care about

1. **$\varepsilon$ and the separation margin at the worst ambient condition.**
   Not the nominal one — the throttled, off-nominal, engine-out one.
2. **The start and shutdown transients.** Steady-state performance is a
   spreadsheet. The transient is where the hardware breaks, and it is where the
   side loads live.
3. **$p_e/p_a$ across the whole trajectory**, not at a design point, because
   that curve is what determines both the integrated impulse and the separation
   exposure.
4. **What $p_c$ actually means in the number you were given** — injector-end or
   nozzle-stagnation. A few percent, systematically, on every derived quantity.
5. **Where the contour deviates from the design intent**, because throat-region
   geometry errors propagate into everything: $\dot m$, $c^*$, $\varepsilon$ and
   the heat flux.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can explain in plain language why a nozzle has a
throat, why the throat is sonic, and what overexpanded and underexpanded mean.
You can state that thrust rises with altitude and say why (the $-p_a A_e$ term).
You can name two engines at opposite ends of the $\varepsilon$ range (F-1 at 16,
RL10B-2 at 285) and say why each is right for its stage.

**Level 2 — Working engineering knowledge.** Given $\gamma$, $\varepsilon$,
$p_0$, $T_0$ and $\mathcal{M}$, you can produce the full station table, the
mass flow, the exit conditions and the altitude of ideal expansion, with correct
units, without help. You can apply Eq. 3.21 and 3.22, state that they disagree
and by how much, and locate a normal shock inside a nozzle for a given back
pressure including the $A^*$ change. You know the $M=1$ property ratios for
$\gamma = 1.2$ from memory and can quote typical $\varepsilon$ ranges for
boosters and upper stages.

**Level 3 — Interview mastery.** Given an unfamiliar engine's $\varepsilon$,
$p_c$ and mission, you can predict whether it separates at sea level, argue
which separation criterion you would use and why, identify what you would
measure on the stand to confirm it (wall static taps versus area ratio, nozzle
strain, actuator loads), and name the programme that hit the same problem
(SSME, Vulcain 2, J-2S). You can argue both sides of a high-$\varepsilon$
booster nozzle — trajectory-integrated impulse versus side-load risk and mass —
and say what you would need to know to decide. Given a wall-pressure plot from a
test, you can say which regime of §3.9 the nozzle is in and whether the shock
is inside or outside.

---

## 10. Problems

### Conceptual

**P1.** A choked converging–diverging nozzle is firing into a vacuum chamber.
The chamber pressure (ambient) is slowly raised. Describe, in order, what
happens inside the nozzle, and identify the ambient pressure at which the flow
inside the nozzle first changes at all. State your assumption about viscosity
and say how the real answer differs.

**P2.** Derive, from Eq. 3.9 alone, why an area minimum is a *necessary* but not
a *sufficient* condition for sonic flow. Give a physical example of an area
minimum that is not sonic.

**P3.** Total temperature is conserved across a normal shock but total pressure
is not. Explain both facts from the conservation laws, without quoting the
shock relations.

**P4.** Two engines have identical $c^*$, identical $p_c$ and identical throat
area. One has $\varepsilon = 20$, the other $\varepsilon = 200$. Compare their
sea-level thrust, vacuum thrust, sea-level $I_{sp}$ and vacuum $I_{sp}$
qualitatively, and say which comparison is most likely to be misleading in a
datasheet.

**P5.** Why is expansion through a Prandtl–Meyer fan isentropic while
compression through an oblique shock is not, when both are "just" a turn of a
supersonic flow? Answer from the second law, not by asserting the result.

**P6.** A thrust-optimised contour outperforms a cone at every steady operating
point but is more dangerous during start. Explain the mechanism.

**P7.** Explain why raising chamber pressure allows a larger expansion ratio at
sea level without additional separation risk, and state the limit of that
argument.

### Calculation

Use $\gamma = 1.2$ and $R_u = 8314.46$ J/(kmol·K) unless told otherwise.

**C1.** A LOX/CH₄ engine has $T_0 = 3500$ K, $\mathcal{M} = 20$ kg/kmol,
$p_0 = 30$ MPa, $A_t = 0.02$ m². Compute $R$, $a_0$, the throat static pressure
and temperature, the throat velocity, and $\dot m$.

**C2.** For the engine of C1 with $\varepsilon = 40$: find $M_e$, $p_e$, $T_e$,
$V_e$, and the altitude of ideal expansion using the standard atmosphere table
in §5.2 (interpolate).

**C3.** For the same engine, apply both the Summerfield and Schmucker criteria
at sea level. Does it separate? At what area ratio, if so? State the
disagreement between the criteria as a percentage of exit area.

**C4.** A normal shock stands in a nozzle at a station where $M_1 = 2.8$.
Compute $M_2$, $p_2/p_1$, $T_2/T_1$, $\rho_2/\rho_1$, $\Delta s$ (take
$R = 400$ J/(kg·K)) and $p_{0,2}/p_{0,1}$.

**C5.** The same nozzle as C1/C2 is tested in a facility whose diffuser can hold
the exit at 40 kPa. Is the nozzle flowing full? Show the calculation, and state
what you would measure to confirm.

**C6.** A $\gamma = 1.2$, $\varepsilon = 25$ nozzle runs at $p_0 = 5$ MPa. Find
the back pressure that puts a normal shock exactly at $A/A_t = 10$, and the exit
Mach number and exit pressure in that condition.

**C7.** Take the F-1 station table of §5.1. Compute the thrust at sea level and
in vacuum from Eq. 3.23 using $\dot m = 2577$ kg/s (the published value),
$V_e$ from the table, $p_e$ from the table, and $A_e = \varepsilon A_t$.
Compare with the published 6770 kN sea level / 7770 kN vacuum, and account for
the discrepancy in one sentence.

**C8.** An engine with $\varepsilon = 165$ and $p_0 = 9.7$ MPa is accidentally
fired at sea level. Compute $p_e$, $p_e/p_a$, the Schmucker separation station,
and the fraction of the nozzle (by area ratio) that is running separated.

### Engineering reasoning

**R1.** You are handed a wall-static-pressure plot from a hot fire of a
$\gamma = 1.2$, $\varepsilon = 60$ nozzle at $p_0 = 10$ MPa, ambient 101 kPa.
Pressure falls smoothly along the contour to $A/A_t = 30$, then rises abruptly
to about 80 kPa and stays roughly flat to the exit. Say what happened, compute
$p_{sep}/p_a$ from the data, say which criterion in §3.14 your hardware agrees
with, and state whether the topology is FSS or RSS and how you can tell from
this plot alone.

**R2.** Two sources quote an engine's expansion ratio as 69 and 77.5. You need
$p_e$ for a plume-impingement analysis. Describe how you would decide which to
use, what the consequence of being wrong is, and what single measurement would
settle it.

**R3.** A first-stage engine passes acceptance testing at sea level but suffers
actuator-load exceedances only on engines built after a contour tooling change.
Give three candidate mechanisms and the test that discriminates between them.

**R4.** An upper-stage engine's vacuum $I_{sp}$ comes in 4 s below prediction.
The chamber pressure, mixture ratio and mass flow all match. Where do you look,
in what order, and why?

### Mini trade study

**T1.** You are setting the expansion ratio for the first-stage engine of a
two-stage methalox launch vehicle. $p_c = 25$ MPa, $\gamma = 1.2$,
$\mathcal{M} = 20$ kg/kmol, $T_0 = 3500$ K, sea-level start, booster burns to
70 km, staging at $t = 150$ s with roughly 55% of the propellant burned below
15 km. The base of the vehicle can accommodate an exit diameter up to 1.8 m per
engine; nine engines. Options:

- **A.** $\varepsilon = 20$ — conservative; underexpanded even at sea level.
- **B.** $\varepsilon = 34$ — ideally expanded at about 3.7 km.
- **C.** $\varepsilon = 55$ — ideally expanded at about 8.1 km, optimised for
  the upper half of the burn, and accepting sea-level overexpansion.
- **D.** $\varepsilon = 34$ with a dual-bell contour.

Recommend one. Your answer must include: $p_e$ and $p_e/p_a$ at sea level for
each option; the Schmucker separation check at sea level *and* at the 40%
throttle condition; an estimate of the vacuum $I_{sp}$ difference between the
options; the side-load argument; and an explicit statement of what you would
test before committing.

---

## 11. Quiz (100 marks)

**Q1 (8).** State the two conservation laws applied to a control volume on a
weak wave, and the assumption that turns $dp/d\rho$ into $(\partial
p/\partial\rho)_s$.

**Q2 (8).** For $\gamma = 1.2$, give $T^*/T_0$, $p^*/p_0$ and $\rho^*/\rho_0$ to
three decimal places.

**Q3 (10).** Multiple choice. In a choked converging–diverging nozzle, lowering
the ambient pressure from 50 kPa to 5 kPa changes: (a) mass flow; (b) chamber
pressure; (c) exit Mach number; (d) thrust; (e) none of these. Choose all that
apply and justify in one sentence each.

**Q4 (12).** A nozzle has $\gamma = 1.2$, $\varepsilon = 60$, $p_0 = 15$ MPa.
Compute $M_e$ and $p_e$. Is it overexpanded at 10 km ($p_a = 26.4$ kPa)?

**Q5 (12).** A normal shock at $M_1 = 3.5$, $\gamma = 1.2$. Compute $p_2/p_1$
and $M_2$, and state the fraction of stagnation pressure lost (take
$R = 500$ J/(kg·K)).

**Q6 (10).** Multiple choice. The area–velocity relation $dA/A = (M^2-1)dV/V$
implies that a supersonic flow in a converging duct: (a) accelerates;
(b) decelerates; (c) chokes; (d) is impossible. Justify.

**Q7 (12).** An engine with $\varepsilon = 45$, $p_0 = 12$ MPa is started at sea
level. Apply Schmucker: at what area ratio does it separate, if at all? Show the
two-equation setup.

**Q8 (10).** Judgment. Your programme wants +6 s of vacuum $I_{sp}$ on a
sea-level-start booster engine and proposes raising $\varepsilon$ from 22 to 34.
Give the two questions you would ask before agreeing, and say what data would
answer each.

**Q9 (10).** Judgment. A datasheet lists an engine's $I_{sp}$ as 348 s with no
qualifier. What are the three things you must establish before using that
number in a $\Delta V$ budget, and why does each matter?

**Q10 (8).** Explain, in no more than four sentences, why a rocket engine's
chamber pressure is unaffected by altitude but its thrust is not.

---

## 12. Further reading

- **[Anderson-MCF]**, chapters on quasi-one-dimensional flow, normal shocks and
  oblique shocks and expansion waves. The cleanest derivations of everything in
  §3.2–§3.12, with the historical context that explains why the conventions are
  what they are. If you read one thing after this module, read this.
- **[SB §3.3]** — nozzle theory and the isentropic relations in propulsion
  notation, with the classic back-pressure figure and worked engine examples.
  Cite the edition; chapter numbering shifts between the 7th–10th.
- **[HP ch. 3]** — derives what [SB] asserts, with a clearer treatment of the
  thermodynamics behind the isentropic relations.
- **[ZH Vol. 1]** for one-dimensional and wave flow; **[ZH Vol. 2]** for the
  method of characteristics, which is what actually generates a bell contour and
  the axisymmetric version of §3.12.
- **[OMK05]** — the modern review of supersonic flow separation: FSS versus RSS,
  the transition, side-load mechanisms, and a critical comparison of every
  separation criterion. Read this before choosing a criterion for hardware.
- **[Ostlund02]** — the open-access thesis behind [OMK05], with the experimental
  detail the review compresses. The best single document on start-transient side
  loads.
- **[Schmucker73]** — the systematic survey of separation criteria, with their
  scatter shown honestly. Read it to understand *why* §5.3 gives two answers.
- **[SFS54]** — the original 0.4 criterion. Three pages; read it to see how
  little was needed to be useful, and how much has been asked of it since.
- **[SP-8120]** — NASA design practice for liquid rocket nozzles: contour
  design, performance losses, extensions, separation and side loads. The bridge
  between [Rao58] and hardware.
- **[Rao58]**, **[Rao60]** — the optimum contour and the parabolic approximation
  that made it usable. Everything called an "80% bell" descends from the
  one-page follow-up.
- **[MIT16512]** — free graduate lecture notes; the nozzle-flow lectures cover
  real-gas and kinetic corrections to §3.17 concisely.
