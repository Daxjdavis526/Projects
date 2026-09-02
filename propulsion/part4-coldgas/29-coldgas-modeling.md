# Module 29 — Cold-Gas Performance Modeling
Part IV · Prerequisites: modules 01, 02, 03, 28 · Estimated time: 7 h

A cold-gas thruster has no combustion, no ignition, no mixture ratio, no
chamber cooling and no throat erosion. Every difficulty it has left is in
the state of the gas in the tank and the state of the boundary layer in the
nozzle, and both of those are routinely got wrong. The two failures I have
seen repeatedly are the same failure twice: somebody sizes the tank with
$m = pV/RT$ and loses ten to fifteen percent of the propellant load to
compressibility, and somebody quotes the ideal 77 s of nitrogen for a
0.15 mm throat and loses another twenty-five percent to viscosity. Put the
two together and the flight system delivers about two-thirds of the total
impulse on the requirements page. Nothing about that is subtle physics; it
is arithmetic that was skipped. This module is the arithmetic.

---

## 1. Learning objectives

After this module you can:

- Compute the mass of gas in a storage tank from $p$, $V$, $T$ including a
  compressibility correction, and state the sign and size of the error made
  by ignoring $Z$.
- Derive the polytropic tank-state relation and identify which exponent
  $n$ applies to a given blowdown from the thermal time constants of the
  hardware.
- Derive the choked mass flow $\dot m = \Gamma p_0 A_t/\sqrt{RT_0}$ from
  continuity plus the isentropic relations, and apply it to a cold gas.
- Compute exit velocity, thrust, vacuum thrust coefficient and $I_{sp}$ for
  a cold-gas nozzle at a stated area ratio, and reproduce the Part IV gas
  table with the course library.
- Estimate the throat Reynolds number of a small nozzle and apply a
  low-Reynolds-number efficiency to $C_F$ and $I_{sp}$, citing the source of
  the correlation and its uncertainty.
- Derive and solve the blowdown ODE $\dot p(t)$ for a fixed-throat tank in
  both the isothermal and the adiabatic limits, and compute the delivered
  total impulse as a closed-form integral of thrust over the blowdown.
- Compute usable propellant fraction for isothermal, adiabatic and
  polytropic blowdown and explain why the adiabatic number is smaller.
- Model an impulse bit with a first-order valve, predict the minimum
  reliable bit, and explain why symmetric rise and fall times do not by
  themselves bias the impulse.
- Convert a helium leak-rate specification into a five-year propellant loss
  in grams and compare it against the propellant budget.
- Predict the temperature at a regulator outlet from the Joule–Thomson
  coefficient, and say which gases cool and which heat.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| tank (storage) pressure | $p_t$ | Pa | absolute gas pressure in the storage vessel |
| plenum / stagnation pressure | $p_0$ | Pa | stagnation pressure at the thruster inlet, upstream of the throat |
| initial, final tank pressure | $p_i$, $p_f$ | Pa | at start and end of a blowdown |
| regulated pressure | $p_{reg}$ | Pa | regulator outlet setpoint |
| exit static pressure | $p_e$ | Pa | static pressure at the nozzle exit plane |
| ambient pressure | $p_a$ | Pa | back pressure; $0$ in vacuum |
| tank volume | $V$ | m³ | internal gas volume |
| stagnation temperature | $T_0$ | K | gas total temperature at the thruster inlet |
| tank temperature | $T_t$ | K | bulk gas temperature in the storage vessel |
| exit static temperature | $T_e$ | K | static temperature at the exit plane |
| gas density | $\rho$ | kg/m³ | mass per unit volume |
| molar mass | $\mathcal{M}$ | kg/kmol | of the propellant gas |
| specific gas constant | $R$ | J/(kg·K) | $R = R_u/\mathcal{M}$, $R_u=8314.46$ J/(kmol·K) |
| ratio of specific heats | $\gamma$ | — | $c_p/c_v$ |
| compressibility factor | $Z$ | — | $Z = pv/(RT)$; $Z=1$ is ideal gas |
| polytropic exponent | $n$ | — | exponent in $pV^{\,n}=\text{const}$ for the tank gas |
| Vandenkerckhove function | $\Gamma$ | — | $\Gamma=\sqrt{\gamma}\left(\tfrac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$ |
| mass flow rate | $\dot m$ | kg/s | through the throat |
| throat area | $A_t$ | m² | geometric minimum flow area |
| throat diameter | $D_t$ | m | $D_t=\sqrt{4A_t/\pi}$ |
| exit area | $A_e$ | m² | nozzle exit plane area |
| area ratio | $\varepsilon$ | — | $A_e/A_t$ |
| exit Mach number | $M_e$ | — | at the exit plane |
| exit velocity | $v_e$ | m/s | axial exhaust velocity, ideal 1-D |
| characteristic velocity | $c^*$ | m/s | $c^*=\sqrt{RT_0}/\Gamma$ |
| thrust coefficient | $C_F$ | — | $F/(p_0A_t)$ |
| effective exhaust velocity | $c$ | m/s | $c=c^*C_F = F/\dot m$ |
| specific impulse | $I_{sp}$ | s | $c/g_0$, $g_0=9.80665$ m/s² |
| thrust | $F$ | N | |
| total impulse | $I_{tot}$ | N·s | $\int F\,dt$ |
| impulse bit | $I_{bit}$ | N·s | impulse of one commanded pulse |
| discharge coefficient | $C_d$ | — | actual $\dot m$ ÷ ideal choked $\dot m$ |
| divergence efficiency | $\lambda$ | — | $(1+\cos\alpha)/2$ for a cone of half-angle $\alpha$ |
| nozzle half-angle | $\alpha$ | rad (quoted in °) | divergent-cone half-angle |
| viscous efficiency | $\eta_{visc}$ | — | fraction of ideal $C_F$ surviving boundary-layer loss |
| $I_{sp}$ efficiency | $\eta_{I}$ | — | $I_{sp,\text{measured}}/I_{sp,\text{ideal}}$ |
| throat Reynolds number | $Re_t$ | — | $4\dot m/(\pi D_t\mu_t)$ |
| dynamic viscosity | $\mu$ | Pa·s | gas viscosity at the stated state |
| blowdown time constant | $\tau$ | s | $V/(\Gamma A_t\sqrt{RT_0})$ |
| valve fill / empty time constant | $\tau_f$, $\tau_e$ | s | first-order plenum charge and discharge constants |
| valve dead time | $t_d$ | s | command-to-motion delay |
| commanded on-time | $t_{on}$ | s | electrical pulse width |
| leak throughput | $Q_L$ | std cm³/s | volumetric leak referred to 273.15 K, 101325 Pa |
| Joule–Thomson coefficient | $\mu_{JT}$ | K/Pa (quoted K/bar) | $(\partial T/\partial p)_h$ |
| usable mass fraction | $\phi$ | — | mass expelled ÷ mass loaded |

---

## 3. Theory

### 3.1 The tank is the propulsion system

For a chemical engine the interesting physics is inside the chamber. For a
cold-gas system the chamber is a tee fitting. Everything that determines
performance is either upstream (how much gas is in the tank, at what state,
and how that state changes as you use it) or inside the boundary layer of a
nozzle small enough that the boundary layer is a significant fraction of the
throat. So this module is organised the same way: tank state first, nozzle
second, and the coupling between them — the blowdown — third.

Throughout, the working gas is treated as calorically perfect in the nozzle
($\gamma$ constant) and as a real gas in the tank. That split looks
inconsistent and is deliberate: in the tank the gas sits at 200–300 bar
where $Z$ departs from 1 by 10–20 %, while in the nozzle it has already
been throttled to a few bar where $Z-1 < 0.005$ and the ideal-gas nozzle
relations are excellent. [A] The error you make by using ideal-gas nozzle
relations downstream of a regulator is smaller than the error in $\gamma$
itself.

### 3.2 Tank state: the ideal gas and its 15 % lie

The ideal-gas law gives the stored mass directly:

$$m = \frac{p V}{R T}, \qquad R = \frac{R_u}{\mathcal{M}}$$

> **Eq. 3.1** — variables: $m$ [kg], $p$ [Pa], $V$ [m³], $R$ [J/(kg·K)],
> $T$ [K]. Meaning: mass of gas stored in a fixed volume at a measured
> pressure and temperature. Assumes: molecules point-like, no intermolecular
> forces. Fails when: the molar volume approaches the molecular
> co-volume — in practice above ~50 bar for any gas, and at any pressure
> within ~50 K of the critical temperature. [F]

The real-gas correction is one dimensionless number:

$$m = \frac{p V}{Z\,R\,T}, \qquad Z \equiv \frac{p v}{R T}$$

> **Eq. 3.2** — $Z$ is the compressibility factor, dimensionless, $v$ is
> specific volume [m³/kg]. Meaning: $Z$ is the factor by which the real gas
> departs from ideal at that $(p,T)$. Assumes: single phase, equilibrium.
> Fails when: two-phase (then there is no single $Z$; use a saturation
> table). [F]

The sign matters and students get it backwards. Above the Boyle
temperature — which for nitrogen, helium, argon and hydrogen at 300 K is
well below the storage temperature — repulsive forces dominate and $Z>1$,
so **the tank holds less gas than the ideal-gas law says**. Cold-gas tanks
are always in this regime because they are stored at 200–300 bar at room
temperature.

| gas at 300 K | $Z$ @ 20 bar | @ 100 bar | @ 200 bar | @ 240 bar | @ 300 bar |
|---|---|---|---|---|---|
| N₂ | ≈1.00 | ≈1.04 | ≈1.10 | ≈1.13 | ≈1.19 |
| He | ≈1.01 | ≈1.05 | ≈1.11 | ≈1.13 | ≈1.17 |
| Ar | ≈0.99 | ≈0.97 | ≈1.01 | ≈1.04 | ≈1.10 |

> **Table 3.1** [E], confidence **C**. These are recalled from
> `[NIST-WB]`-class data, not read off a REFPROP run for this module, and
> the Part IV verification worksheet flags exactly this column as
> `NEEDS PRIMARY`. Use them to size the sensitivity of your design, not to
> load a flight tank. For a flight load, run `[REFPROP]` or the NIST
> WebBook isotherm at your actual soak temperature. The *shape* of the
> table — $Z$ rising monotonically with $p$, crossing 1 somewhere in the
> tens of bar, reaching 1.1–1.2 at COPV pressures — is solid. [F]

Do not attempt to recover $Z$ from a cubic equation of state and call it
done. Van der Waals gives $Z=1.04$ and Redlich–Kwong $Z=1.06$ for nitrogen
at 300 K, 240 bar; both underpredict a value that is closer to 1.13.
Truncating the virial series at the second coefficient is worse still: with
$B(300\ \mathrm{K}) \approx -4.2$ cm³/mol for N₂ the two-term series returns
$Z<1$, the wrong side of unity, because at 140 cm³/mol the third virial
coefficient is larger than the second in magnitude and opposite in sign.
[A] Cubic EOS are for phase behaviour; for high-pressure density use a
multiparameter reference equation.

**What the error costs.** Loaded mass scales as $1/Z$. A 13 % error in
loaded mass is a 13 % error in total impulse, which for a station-keeping
budget is the difference between a five-year and a four-year-four-month
mission. It is also, and this is the part that gets people, an error in the
*direction that flatters the design*, so it survives review.

### 3.3 Density, and why it is quoted two ways

$$\rho = \frac{p}{Z R T}$$

> **Eq. 3.3** — $\rho$ [kg/m³]. Same assumptions as Eq. 3.2. Meaning:
> propellant packing density. This is the number that decides whether a
> cold-gas system fits in a CubeSat. [F]

Two derived figures of merit follow, and it is worth keeping them apart:

$$\text{impulse density} \equiv \frac{I_{tot}}{V_{prop}} = \rho\, I_{sp}\, g_0
\qquad
\text{impulse per wet mass} \equiv \frac{I_{tot}}{m_{prop}+m_{tank}+m_{dry}}$$

> **Eq. 3.4** — impulse density [N·s/m³, quoted N·s/cm³]; impulse per wet
> mass [N·s/kg]. Meaning: the first is volume-limited packaging, the second
> is mass-limited packaging. Assumes: $I_{sp}$ constant over the discharge.
> Fails when: a blowdown system's $I_{sp}$ falls with tank temperature —
> then use the integral of §3.9. [F]

Helium at 241 bar and 300 K stores only ≈0.06–0.07 N·s per cm³ of tank
volume, while liquid R-236fa at its own ≈2.7 bar vapour pressure stores
≈0.53–0.58 N·s/cm³: the refrigerant wins on impulse density by roughly
eight to one despite its lower $I_{sp}$ (Modules 28 and 31 work the
arithmetic; an earlier draft of the reference worksheet mis-stated these
as 7.1 and 5.8 N·s/cm³). On impulse per wet mass the gap narrows but
does not reverse, because the helium needs a 241 bar COPV around it and
the R-236fa needs a 2.7 bar can. That single fact is why
every flown CubeSat cold-gas module uses a liquefiable propellant and no
launch vehicle uses one. [M] `[NASA-SOA]`, `[MarCO]`

### 3.4 Tank temperature during blowdown: three answers, one of them right

Take gas out of a closed tank and the gas left behind does work expanding
into the volume vacated. Where the energy comes from determines the
temperature history, and there are three limits.

**Isothermal ($n=1$).** The tank walls and the spacecraft supply heat as
fast as the gas expands. $T_t = T_i$, so $p \propto m$.

**Adiabatic ($n=\gamma$).** No heat crosses the tank wall on the timescale
of the discharge. The gas remaining in the tank has undergone a reversible
adiabatic expansion — reversible because the gas *left in the tank* has not
been throttled; only the gas that departed through the throat was. That is
the subtle step, so state it explicitly: consider the parcel of gas that
will still be in the tank at the end. It never crosses the orifice. It only
expands quasi-statically against the departing gas. Therefore it follows
$pv^\gamma = $ const. [F]

**Polytropic ($1 < n < \gamma$).** Reality. Some heat leaks in from the
wall, not enough to hold temperature.

Derive the polytropic form from the first law for the closed control volume
containing only the remaining gas, mass $m_r$, volume $V_r(t)$:

$$\delta q = du + p\,dv \quad\Rightarrow\quad \delta q = c_v\,dT + p\,dv$$

Model the wall heat input as a fixed fraction of the expansion work,
$\delta q = (1-\kappa)\,p\,dv$ with $0\le\kappa\le1$ — $\kappa=0$ is
isothermal-with-perfect-heat-supply only in the limit, $\kappa=1$ is
adiabatic. Then $c_v\,dT = -\kappa\,p\,dv$, and with $p = RT/v$:

$$\frac{dT}{T} = -\frac{\kappa R}{c_v}\frac{dv}{v} = -\kappa(\gamma-1)\frac{dv}{v}$$

Integrating, $Tv^{\kappa(\gamma-1)}=$ const, i.e. $pv^{\,n}=$ const with

$$\boxed{\;n = 1 + \kappa(\gamma-1)\;}$$

> **Eq. 3.5** — $n$ dimensionless; $\kappa$ is the fraction of expansion
> work not made up by wall heat transfer. Meaning: a one-parameter
> interpolation between isothermal and adiabatic tank behaviour. Assumes:
> $\kappa$ constant through the discharge, perfect gas, spatially uniform
> tank gas. Fails when: the discharge is long enough that $\kappa$ drifts
> (it does — early in a fast blowdown the gas is near-adiabatic, late in it
> the wall has caught up), or when the tank gas stratifies, which it does in
> any tank taller than it is wide in microgravity with no convection. [A]

The associated state relations, which you will use constantly:

$$\frac{T_t}{T_i}=\left(\frac{p_t}{p_i}\right)^{\frac{n-1}{n}},
\qquad
\frac{\rho_t}{\rho_i}=\left(\frac{p_t}{p_i}\right)^{1/n}$$

> **Eq. 3.6** — Meaning: tank temperature and density as a function of tank
> pressure alone, once $n$ is chosen. Assumes: ideal gas, uniform tank.
> Fails when: $Z\neq1$ (at 200 bar the exponent that fits real nitrogen is
> not exactly $\gamma$), or the propellant is a saturated liquid, in which
> case the tank pressure is the vapour pressure and this relation is
> replaced by the saturation curve. [F]/[A]

**Which $n$?** [J] Compare the discharge time to the tank thermal time
constant $\tau_{th}\sim m_{wall}c_{wall}/(hA_{wall})$. For a 0.4 L
aluminium-lined COPV, $m_{wall}c_{wall}\approx 200$ J/K and a natural-
convection-free internal $h$ of order 20 W/(m²K) over 0.03 m² gives
$\tau_{th}\approx 300$ s. So: a 10-second continuous burn is adiabatic; a
one-hour attitude-hold duty cycle at 5 % duty is isothermal; a 200-second
delta-v burn is polytropic with $n\approx1.2$. In flight, cold-gas systems
that fire in millisecond pulses with seconds between them are *always*
isothermal at the tank and it is the plenum, not the tank, that sees the
adiabatic transient.

**Self-pressurising liquids are the exception that proves the rule.** With
a saturated liquid (R-236fa at 2.7 bar, n-butane at 2.6 bar), withdrawing
vapour drops the pressure, which drops the saturation temperature, which
drives evaporation, which absorbs the latent heat from the remaining
liquid. The tank pressure is therefore pinned to the vapour-pressure curve
and falls only as fast as the liquid cools. Because the latent heat of
R-236fa is ~160 kJ/kg and its liquid $c_p$ ~1.2 kJ/(kg·K), boiling off 1 %
of the liquid cools the rest by ~1.3 K, which moves the vapour pressure by
about 3 %. That is why MarCO-class systems behave like weakly regulated
systems with no regulator. [F] `[MarCO]`

### 3.5 Choked mass flow, derived

Continuity at the throat, with the flow choked ($M=1$):

$$\dot m = \rho_t^{*} a^{*} A_t$$

where the star denotes throat conditions. Use the isentropic relations
referred to the plenum stagnation state $(p_0,T_0)$:

$$\frac{T^*}{T_0}=\frac{2}{\gamma+1},\qquad
\frac{p^*}{p_0}=\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma}{\gamma-1}},\qquad
\rho^*=\frac{p^*}{RT^*},\qquad a^*=\sqrt{\gamma R T^*}$$

Substitute:

$$\dot m = \frac{p_0}{RT_0}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma}{\gamma-1}}
\cdot\frac{\gamma+1}{2}\cdot\sqrt{\gamma R T_0 \frac{2}{\gamma+1}}\;A_t$$

Collecting the powers of $2/(\gamma+1)$ — the exponent is
$\frac{\gamma}{\gamma-1}-1+\frac{1}{2}=\frac{\gamma+1}{2(\gamma-1)}$ — gives

$$\boxed{\;\dot m = \Gamma\,\frac{p_0 A_t}{\sqrt{R T_0}},\qquad
\Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}\;}$$

> **Eq. 3.7** — $\dot m$ [kg/s], $p_0$ [Pa], $A_t$ [m²], $R$ [J/(kg·K)],
> $T_0$ [K]. Meaning: with the throat choked, mass flow is set by the
> upstream stagnation state and the throat area and is completely
> independent of anything downstream. Assumes: choked ($p_0/p_a$ above
> ~1.9), one-dimensional, isentropic to the throat, calorically perfect,
> inviscid. Fails when: the nozzle unchokes (a cold-gas thruster firing in
> atmosphere at low plenum pressure), or $Re_t \lesssim 10^3$ where the
> boundary layer blocks enough of the throat that a discharge coefficient
> is mandatory. [F] Implemented as `rocket.choked_mdot`.

Equivalently, $\dot m = p_0 A_t/c^*$ with $c^*=\sqrt{RT_0}/\Gamma$
(`rocket.c_star`). For a cold gas $c^*$ is a pure property of the
propellant and its temperature: nitrogen at 300 K has $c^*=435.8$ m/s
against 1780 m/s for LOX/LH₂. That single ratio is the whole story of why
cold gas is a 70-second propellant.

$\Gamma$ is weakly dependent on $\gamma$: 0.6847 at $\gamma=1.40$ (N₂),
0.7262 at $\gamma=1.667$ (He), 0.6241 at $\gamma=1.08$ (R-236fa). A 20 %
change in $\gamma$ moves $\Gamma$ by 6 %. [F]

### 3.6 Exit velocity, thrust, $C_F$

Energy conservation along a streamline from the plenum to the exit, adiabatic
and reversible, with $h = c_pT$ and $c_p = \gamma R/(\gamma-1)$:

$$c_pT_0 = c_pT_e + \tfrac12 v_e^2
\;\Rightarrow\;
v_e = \sqrt{2c_pT_0\left(1-\frac{T_e}{T_0}\right)}
= \sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}$$

> **Eq. 3.8** — $v_e$ [m/s]. Meaning: all the enthalpy you convert becomes
> kinetic energy. Assumes: isentropic, calorically perfect, 1-D, no heat
> loss, exit flow fully expanded and attached. Fails when: the gas
> condenses in the nozzle (real risk for CO₂ and refrigerants — see §7),
> or $\gamma$ varies enough across the 250 K temperature drop to matter
> (it does for polyatomics). [F] `rocket.exit_velocity`.

Note the limiting velocity: as $p_e/p_0\to0$,
$v_{max}=\sqrt{2\gamma RT_0/(\gamma-1)}$, which for N₂ at 293.15 K is
780.4 m/s. No area ratio will ever get a room-temperature nitrogen thruster
past $780.4/9.80665 = 79.6$ s of momentum $I_{sp}$. Every design argument about
expansion ratio in a cold-gas system is an argument about how close to that
asymptote you can afford to get.

Thrust is momentum flux plus the pressure term:

$$F = \dot m v_e + (p_e-p_a)A_e$$

> **Eq. 3.9** — $F$ [N], $A_e$ [m²]. Meaning: rate of momentum leaving the
> control volume plus the unbalanced pressure force on the exit plane.
> Assumes: steady, uniform exit profile, axial flow. Fails when: the flow
> separates inside the nozzle (only in atmospheric testing of a
> high-$\varepsilon$ cold-gas nozzle — a 50:1 nitrogen nozzle at 20 bar
> will separate violently on a sea-level test stand), or when the exit
> profile is non-uniform, which at low $Re$ it always is. [F]
> `rocket.thrust`.

Non-dimensionalise on $p_0A_t$:

$$C_F \equiv \frac{F}{p_0A_t}
=\sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}
\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}
+\frac{p_e-p_a}{p_0}\varepsilon$$

> **Eq. 3.10** — $C_F$ dimensionless. Meaning: how much thrust the nozzle
> gets out of a given throat and plenum pressure; the nozzle's own figure of
> merit, cleanly separated from the propellant's ($c^*$). Assumes: as
> Eq. 3.8, plus $p_e$ obtained from $\varepsilon$ by the isentropic
> area–Mach relation. Fails when: viscous blockage changes the effective
> $\varepsilon$, which is the entire subject of §3.7. [F] `rocket.Cf`.

and $F = C_F\,c^*\,\dot m$, $c = c^*C_F$, $I_{sp}=c/g_0$.

**Cold-gas $C_F$ is high and boring.** In vacuum with $\gamma=1.4$ and
$\varepsilon=50$, $C_F=1.7292$; at $\varepsilon=20$ it is 1.6899 and at
$\varepsilon=100$ it is 1.7498. Going from 20:1 to 100:1 — five times the
nozzle length and a large increase in wetted area — buys 3.5 % of ideal
thrust coefficient. On a *chemical* engine that trade is often worth it
because the absolute $I_{sp}$ gain is 10 s. On a cold-gas thruster it is
2.6 s (74.23 → 76.87 s at 293.15 K) and it comes with a viscous penalty that at small scale exceeds the
gain. This is the first place where cold-gas design departs from
liquid-engine intuition. [J]

### 3.7 Small nozzles: the boundary layer eats the gain

A cold-gas thruster delivering 25 mN at 4 bar has a 0.15 mm throat. At that
scale the boundary layer is not a correction; it is a design variable.

**Throat Reynolds number.** Define it on throat diameter and throat
conditions:

$$Re_t = \frac{\rho^* a^* D_t}{\mu^*} = \frac{4\dot m}{\pi D_t \mu^*}$$

> **Eq. 3.11** — $Re_t$ dimensionless, $\mu^*$ [Pa·s] evaluated at the
> throat static temperature $T^*=2T_0/(\gamma+1)$. The second form follows
> from $\dot m = \rho^*a^*\pi D_t^2/4$ and is the one to use because
> $\dot m$ is usually what you know. Meaning: ratio of inertial to viscous
> forces at the smallest section. Assumes: choked. Fails when: the flow is
> rarefied enough that the continuum assumption goes (Knudsen number above
> ~0.01 — reached in micronozzles below ~20 μm throat, or at plenum
> pressures below ~0.1 bar). [F]

Two scalings fall straight out and both are uncomfortable. At fixed
$I_{sp}$ and fixed $p_0$, $\dot m\propto F$ and $D_t\propto\sqrt{F}$, so
$Re_t\propto\sqrt{F}$: **halving the thrust costs you 30 % of your Reynolds
number.** At fixed thrust, $D_t\propto p_0^{-1/2}$ so
$Re_t\propto\sqrt{p_0}$: **running at lower plenum pressure to get a smaller
impulse bit also degrades the nozzle.** The two knobs a small-satellite
designer reaches for — less thrust, less pressure — both push into the
viscous regime.

**What the data says.** Spisz, Brinich and Jack measured thrust
coefficients of low-thrust conical nozzles down to throat Reynolds numbers
of order $10^2$ and found $C_F$ falling steeply below $Re_t\sim10^3$
`[Spisz65]`. Grisnik, Smith and Saltz repeated and extended the work with a
systematic sweep of area ratio and half-angle at low $Re$, and reported the
result that matters for design: **the optimum area ratio falls as Reynolds
number falls**, because added divergent length adds wetted area (friction,
which scales with area) faster than it adds pressure thrust (which
saturates) `[Grisnik87]`. Rothe's electron-beam density measurements showed
that below $Re_t\approx10^3$ there is no inviscid core left in a small
conical nozzle at all — the boundary layers from opposite walls have merged
and the "nozzle" is a viscous duct `[Rothe71]`. Bayt and Breuer's MIT
micronozzle work extended the picture to etched planar micronozzles and
confirmed both the $Re^{-1/2}$ scaling of the loss and the collapse of the
optimum $\varepsilon$ `[Bayt99]`.

**The correlation to use.** Boundary-layer displacement on a laminar wall
grows as $Re^{-1/2}$, so both the discharge coefficient and the thrust
coefficient take the form $1 - \text{const}\cdot Re^{-1/2}$:

$$C_d \approx 1 - \frac{a}{\sqrt{Re_t}},\qquad
\eta_{visc} \approx 1 - \frac{b}{\sqrt{Re_t}}$$

> **Eq. 3.12** — $C_d$ and $\eta_{visc}$ dimensionless. $a\approx5$,
> $b\approx10$ for a conical nozzle of $\varepsilon\approx50$ and 15°
> half-angle. Meaning: laminar boundary-layer blockage at the throat
> ($C_d$) and momentum-deficit plus friction loss over the whole nozzle
> ($\eta_{visc}$). Assumes: laminar, attached, continuum, cold wall not far
> from the recovery temperature. Fails when: $Re_t\lesssim500$, where the
> boundary layers merge and the loss grows faster than $Re^{-1/2}$; and
> above $Re_t\sim10^5$ where transition puts you on a different curve.
> [E], ±0.05 on $\eta_{visc}$; fitted to the trend of `[Spisz65]` and
> `[Grisnik87]`, not to a single data set. **Re-read the source figures
> before you use this for a flight prediction.**

The coefficient $b$ carries the area-ratio dependence, because a longer
divergent section has more wetted wall. A crude but serviceable heuristic
that reproduces the observed collapse of the optimum area ratio is

$$b(\varepsilon) \approx 10\sqrt{\varepsilon/50}$$

> **Eq. 3.12a** — [A], a heuristic, not a fit. It is calibrated so that the
> $\varepsilon$-dependence of $\eta_{visc}$ crosses the
> $\varepsilon$-dependence of ideal $C_F$ at around $Re_t\sim10^4$, which
> is where `[Grisnik87]` puts the crossover. Do not use it outside
> $20\le\varepsilon\le100$, and do not present it to a customer as a
> correlation. It exists so that you can make the $\varepsilon$ trade
> quantitatively on the back of an envelope instead of hand-waving.

| $Re_t$ | $\eta_{visc}$ (Eq. 3.12, $b=10$) | comment |
|---|---|---|
| 300 | 0.42 | model invalid; expect worse |
| 1,000 | 0.68 | merged boundary layers `[Rothe71]` |
| 3,000 | 0.82 | typical 1 mN CubeSat thruster |
| 10,000 | 0.90 | typical 10–30 mN CubeSat thruster |
| 30,000 | 0.94 | |
| 10⁵ | 0.968 | |
| 3.5×10⁵ | 0.983 | 3.6 N EVA-class thruster |

Combine with the divergence loss for a conical nozzle:

$$\lambda = \frac{1+\cos\alpha}{2}, \qquad
\eta_I = \lambda\,\eta_{visc}, \qquad
I_{sp} = \eta_I\,I_{sp,\text{ideal}}, \qquad
F = C_d\,\dot m_{ideal}\,\eta_I\,I_{sp,\text{ideal}}\,g_0$$

> **Eq. 3.13** — $\lambda$, $\eta_I$ dimensionless. $\alpha=15°$ gives
> $\lambda=0.983$. Meaning: the axial component of a radially-diverging
> exhaust, times the viscous survival fraction. Assumes: uniform source
> flow. Fails when: the exit profile is viscous-dominated, at which point
> $\lambda$ and $\eta_{visc}$ are no longer separable and only the measured
> $C_F$ means anything. [A]

**Consistency with the Part IV table.** The verification worksheet notes
that across the standard published cold-gas table the ratio of measured to
theoretical $I_{sp}$ is about **0.91**, and recommends that single discount
factor as the thing to teach. Eq. 3.13 with $\lambda=0.983$ reproduces
$\eta_I=0.91$ at $\eta_{visc}=0.926$, i.e. $Re_t\approx1.8\times10^4$ —
squarely in the range of a laboratory-scale cold-gas thruster of a few
newtons at a few bar. The correlation and the empirical discount agree,
which is the only reason to trust either. [E]

**The design consequence.** [J] If your $Re_t$ is below about 3,000, stop
increasing $\varepsilon$. Take a shorter, fatter nozzle ($\varepsilon$
15–30), accept the 3 % ideal-$C_F$ loss, and keep the 8 % you would
otherwise pay in wall friction. And when someone hands you a cold-gas
thruster spec quoting 76 s for nitrogen, ask for the throat diameter before
you believe it.

### 3.8 Blowdown: the pressure-decay ODE

Fixed throat, no regulator, tank of volume $V$. Mass leaves at the choked
rate, evaluated at the *tank* state because in an unregulated system the
tank is the plenum:

$$\frac{dm}{dt} = -\Gamma\frac{p_t A_t}{\sqrt{R T_t}}$$

**Isothermal case.** $T_t=T_i$ constant, $m = p_tV/(RT_i)$, so
$dm/dt = (V/RT_i)\,dp_t/dt$ and

$$\frac{V}{RT_i}\frac{dp_t}{dt} = -\Gamma\frac{p_tA_t}{\sqrt{RT_i}}
\quad\Longrightarrow\quad
\frac{dp_t}{dt} = -\frac{\Gamma A_t\sqrt{RT_i}}{V}\,p_t$$

which is first-order linear with solution

$$\boxed{\;p_t(t) = p_i\,e^{-t/\tau},\qquad
\tau = \frac{V}{\Gamma A_t\sqrt{RT_i}} = \frac{V\,c^*}{A_t R T_i}\;}$$

> **Eq. 3.14** — $\tau$ [s]. Meaning: an unregulated fixed-throat gas tank
> is an RC circuit; the "capacitance" is $V/RT$ and the "conductance" is
> the choked orifice. $\tau$ is also exactly $m_i/\dot m_i$ — the time to
> empty the tank at the *initial* flow rate. Assumes: isothermal tank,
> choked throat throughout, ideal gas, no regulator. Fails when: the throat
> unchokes near the end (in vacuum it never does; on the bench it does when
> $p_t < 1.9\,p_a$), or the discharge is fast enough to be non-isothermal
> (§3.4). [F]

Since $F = C_F p_t A_t$ with $C_F$ essentially constant in vacuum,

$$F(t) = F_i e^{-t/\tau},\qquad \dot m(t)=\dot m_i e^{-t/\tau}$$

**Thrust falls by the same factor as pressure.** A 5:1 blowdown is a 5:1
thrust variation, and the attitude-control law has to close over all of it.
That is the argument for a regulator in one line.

**Adiabatic case.** Now $T_t$ falls with $p_t$. Work in density. With
$m=\rho V$, $p=\rho RT$ and $T=T_i(\rho/\rho_i)^{\gamma-1}$:

$$\frac{p_t}{\sqrt{RT_t}} = \frac{\rho_t R T_t}{\sqrt{RT_t}} = \rho_t\sqrt{RT_t}$$

so

$$V\frac{d\rho_t}{dt} = -\Gamma A_t \rho_t\sqrt{RT_i}\left(\frac{\rho_t}{\rho_i}\right)^{\frac{\gamma-1}{2}}$$

Let $x=\rho_t/\rho_i$ and $\tau_i = V/(\Gamma A_t\sqrt{RT_i})$ (the same
time constant, evaluated at the initial temperature):

$$\frac{dx}{dt} = -\frac{1}{\tau_i}x^{\frac{\gamma+1}{2}}$$

Separate and integrate from $x=1$:

$$\boxed{\;x(t) = \left[1+\frac{\gamma-1}{2}\frac{t}{\tau_i}\right]^{-\frac{2}{\gamma-1}},
\quad
\frac{p_t}{p_i}=x^\gamma,
\quad
\frac{T_t}{T_i}=x^{\gamma-1}=\left[1+\frac{\gamma-1}{2}\frac{t}{\tau_i}\right]^{-2}}$$

> **Eq. 3.15** — dimensionless ratios. For $\gamma=1.4$:
> $p_t/p_i = (1+0.2\,t/\tau_i)^{-7}$. Meaning: an adiabatic blowdown is
> *algebraic*, not exponential — it starts faster than the isothermal case
> (same initial $\dot m$, less gas-mass capacity per unit pressure once
> cooling starts) and then hangs on with a long cold tail. Assumes:
> reversible adiabatic expansion of the retained gas, ideal gas, choked
> throat. Fails when: the wall supplies heat (it always supplies some), or
> the gas condenses in the tank — nitrogen at 20 bar saturates at 114 K,
> so a deep adiabatic blowdown from 200 bar can in principle reach the
> two-phase region. [F]

Both limits share the same $\tau$, which is the useful practical point:
**you can size the burn time from the isothermal $\tau$ and be within tens
of percent regardless of which regime you are in.**

**Regulated case, for contrast.** With a regulator holding $p_0=p_{reg}$,
$\dot m$ is constant, so $dm/dt$ is constant and the *tank* pressure decays
**linearly**:

$$p_t(t) = p_i - \frac{\dot m R T_i}{V}\,t \quad (\text{isothermal tank})$$

> **Eq. 3.16** — Meaning: constant thrust, constant flow, linear tank
> decay, until the tank falls to the regulator dropout pressure
> $p_{lock}\approx p_{reg}+\Delta p_{reg}$ (typically 1–2 bar of regulator
> droop plus line loss). Below that the system reverts to blowdown.
> Assumes: regulator in regulation, isothermal tank. Fails when: the
> regulator locks up, at which point Eq. 3.14 takes over. [F]

### 3.9 Total impulse from a tank

Total impulse is the integral of thrust over the discharge. Do it as a
change of variable from $t$ to $m$, which removes the ODE entirely:

$$I_{tot}=\int_0^{t_b} F\,dt = \int_0^{t_b} c\,\dot m\,dt
= \int_{m_f}^{m_i} c^*(T_t)\,C_F\,dm$$

**Isothermal.** $c^*$ is constant, so

$$I_{tot} = C_F\,c^*\,(m_i-m_f) = I_{sp}g_0\,\phi\,m_i,
\qquad \phi_{iso}=1-\frac{p_f}{p_i}$$

> **Eq. 3.17** — $I_{tot}$ [N·s], $\phi$ dimensionless. Meaning: at constant
> temperature the usable fraction is just the pressure fraction you throw
> away. Assumes: isothermal, ideal gas, constant $C_F$. Fails when: $Z$
> varies over the pressure range (it does — $Z$ is 1.13 at 240 bar and 1.00
> at 20 bar, so $\phi_{iso}$ computed from pressures alone is optimistic by
> a few percent); or the thruster's minimum operating pressure is set by
> $Re_t$ rather than by choking. [F] `rocket.usable_fraction(..., isothermal=True)`.

Equivalently $I_{tot} = F_i\tau(1-p_f/p_i)$, which is a nice check: the
area under an exponential from $p_i$ to $p_f$.

**Adiabatic.** Now $c^*\propto\sqrt{T_t}$ and $T_t/T_i=(m/m_i)^{\gamma-1}$:

$$I_{tot}=C_F\frac{\sqrt{RT_i}}{\Gamma}\int_{m_f}^{m_i}\left(\frac{m}{m_i}\right)^{\frac{\gamma-1}{2}}dm
= C_F c^*_i\,m_i\,\frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{\frac{\gamma+1}{2}}\right]$$

> **Eq. 3.18** — Meaning: closed-form total impulse for an adiabatic
> blowdown, with the $2/(\gamma+1)$ factor carrying the $I_{sp}$ decay. For
> $\gamma=1.4$ the bracket exponent is 1.2 and the prefactor is 0.833.
> Assumes: adiabatic tank, constant $C_F$, ideal gas. Fails when: the
> nozzle's $Re_t$ collapses as $\dot m$ falls, which it does — the cold
> tail of an adiabatic blowdown is delivered at a *lower* $I_{sp}$ than
> even this equation predicts. [F]

$$\phi_{adiab} = 1-\left(\frac{p_f}{p_i}\right)^{1/\gamma}$$

> **Eq. 3.19** — Meaning: usable mass fraction when the tank cools. Assumes:
> adiabatic, ideal gas, same cutoff pressure. **Why it is smaller than the
> isothermal value:** at a given cutoff pressure the cold gas is *denser*,
> so more mass is stranded. For $p_f/p_i=0.2$ and $\gamma=1.4$:
> $\phi_{iso}=0.800$ but $\phi_{adiab}=0.683$. You lose 15 % of the
> propellant *and* the propellant you do expel comes out at a declining
> $I_{sp}$. Both penalties, same cause. [F]
> `rocket.usable_fraction(..., isothermal=False, gamma=...)`.

### 3.10 Valve dynamics and the impulse bit

Command a valve open for $t_{on}$ and the thrust does not square up. The
plenum downstream of the valve has volume $V_p$ and drains through the
throat, so it charges and discharges with first-order time constants of the
same form as Eq. 3.14:

$$\tau_e = \frac{V_p}{\Gamma A_t\sqrt{RT_0}}\quad(\text{emptying}),
\qquad \tau_f \approx \frac{\tau_e}{1+A_v/A_t}\quad(\text{filling})$$

Model thrust as first-order rise to $F$ with constant $\tau_f$ while the
valve is open and first-order decay with $\tau_e$ after it shuts. With
$k \equiv 1-e^{-t_{on}/\tau_f}$ the delivered impulse is

$$I_{bit}=F\Big[t_{on}-\tau_f k\Big]+F\,k\,\tau_e
=\boxed{\;F\big[t_{on}+(\tau_e-\tau_f)k\big]\;}$$

> **Eq. 3.20** — $I_{bit}$ [N·s]. Meaning: the impulse of a single pulse
> including the rise deficit and the tail-off surplus. **Read the result:
> if $\tau_e=\tau_f$ the impulse bit is exactly $F t_{on}$, for any pulse
> width.** A symmetric first-order thruster has no impulse-bit bias at all.
> All the bias comes from asymmetry — and real thrusters are asymmetric,
> because the valve opens against an orifice that is much larger than the
> throat but closes into a plenum that can only drain through the throat,
> so $\tau_e > \tau_f$ and short pulses deliver *more* than $Ft_{on}$.
> Assumes: linear first-order plenum, valve motion fast compared with
> $\tau_f$, choked throughout. Fails when: $t_{on}$ is comparable to the
> valve's mechanical dead time $t_d$ (then subtract $t_d$ from $t_{on}$ and
> the scatter in $t_d$ becomes the dominant repeatability term), or the
> plenum unchokes during the tail. [A] The course library's
> `rocket.impulse_bit` implements the equivalent trapezoidal approximation
> $F(t_{on}-t_{rise}/2+t_{fall}/2)$, which agrees with Eq. 3.20 to a few
> percent for $t_{on}\gtrsim3\tau_f$ and diverges below that.

**Minimum impulse bit.** Two things set it. The *hardware* floor is
$F\cdot t_{on,min}$ where $t_{on,min}$ is the shortest pulse the valve will
repeat — typically 5–10 ms for a solenoid poppet, under 1 ms for a
piezoelectric or a chemically-etched micro-valve of the `[MarCO]` ChEMS
type. The *repeatability* floor is what actually matters for a pointing
budget: $\partial I_{bit}/\partial t_{on} = F[1+(\tau_e-\tau_f)e^{-t_{on}/\tau_f}/\tau_f]$,
which for $t_{on}\ll\tau_f$ approaches $F\,\tau_e/\tau_f$ — so the impulse
sensitivity to timing jitter is *amplified* at short pulse widths by the
asymmetry ratio. [F] This is why vendors quote a "minimum impulse bit" and
a separate "resolution" (GomSpace quote 1 mN thrust and 5 μN resolution for
the NanoProp CGP3, which is a statement about thrust modulation, not pulse
width) and why the honest way to specify a thruster is a measured
$I_{bit}$ distribution, not a single number. [M]

### 3.11 Leakage over mission life

A cold-gas system has no propellant that can freeze, decompose or settle —
its long-duration failure mode is that the propellant leaves without
producing thrust. Leak rates are specified as helium throughput at a stated
$\Delta p$, in std cm³/s (1 std cm³ = 1 cm³ at 273.15 K, 101325 Pa).

$$m_{leak} = Q_L\,t_{mission}\,\frac{p_{std}\,(10^{-6}\ \mathrm{m^3})}{R\,T_{std}}$$

> **Eq. 3.21** — $m_{leak}$ [kg], $Q_L$ [std cm³/s], $t$ [s]. Meaning: turn
> a leak specification into grams. One std cm³ is $1.786\times10^{-7}$ kg
> of helium and $1.250\times10^{-6}$ kg of nitrogen. Assumes: constant
> $Q_L$ over life (optimistic — seals relax and elastomers cold-flow),
> leak measured at the service $\Delta p$. Fails when: the specification
> was taken at 1 bar $\Delta p$ and the system runs at 200 bar; viscous
> leaks scale roughly as $\Delta p^2$, molecular leaks as $\Delta p$. [F]

Converting a helium specification to the service gas: in **molecular**
(Knudsen) flow, throughput scales as $\mathcal{M}^{-1/2}$, so nitrogen
leaks at $\sqrt{4.003/28.014}=0.378$ times the helium rate. In **viscous**
(Poiseuille) flow it scales as $1/\mu$, and nitrogen's viscosity is about
0.9 times helium's at room temperature, so the two gases leak at nearly the
same rate. **Which regime you are in is not a detail:** the two answers
differ by a factor of 2.6. [E] Real spacecraft leak paths — metal C-seals,
welded joints, valve seats — are usually in the molecular or transition
regime, so $\mathcal{M}^{-1/2}$ is the standard assumption and it is
conservative to also check the viscous number. [J]

This is the strongest argument for the JPL/Lightsey school of printing the
plenum, feed passages and nozzles as a single part: joints dominate the
leak budget, so remove the joints. `[MarCO]` [M]

### 3.12 Thermal effects

**Tank heating from the spacecraft.** A cold-gas tank in thermal contact
with a warm bus is a free performance improvement, because $c^*\propto
\sqrt{T_0}$ and hence $I_{sp}\propto\sqrt{T_0}$. Going from 273 K to 313 K
is $\sqrt{313/273}=1.071$ — 7 % more $I_{sp}$ for no propellant. It is also
a free performance *penalty* if the tank is cold-biased: a 253 K tank gives
$\sqrt{253/293}=0.930$. [F] The gradient is worth quantifying for the
review board: **$\partial I_{sp}/\partial T_0 = I_{sp}/(2T_0)$, i.e. 0.130 s per kelvin for a 76 s nitrogen thruster at 293.15 K.** A 20 K thermal
uncertainty is a 2.6 s $I_{sp}$ uncertainty, comparable to the entire
$\varepsilon$ 20→100 trade.

Warm gas takes this further: resistively heating the gas to 600 K would
raise ideal $I_{sp}$ by $\sqrt{2}$. CHIPS reports 82 s from a refrigerant
whose cold-gas ideal is ~43 s — a factor of 1.9, which is more than
$\sqrt{2}$ because heating also changes the effective $\gamma$ and moves the
gas away from its condensation limit. That system is an electrothermal
resistojet, not a cold-gas thruster, and the course treats it as such — but
the comparison is the entire economic argument for warm gas. [M]

**Joule–Thomson at the regulator.** A regulator is an isenthalpic throttle.
The temperature change is

$$\Delta T = \int_{p_1}^{p_2}\mu_{JT}\,dp \approx \mu_{JT}\,(p_2-p_1)$$

> **Eq. 3.22** — $\mu_{JT}=(\partial T/\partial p)_h$ [K/Pa]. Meaning:
> throttling a real gas changes its temperature even though no work is
> done and no heat is added, because the internal energy contains a
> configurational term. Assumes: $\mu_{JT}$ constant over the pressure
> drop (it is not — it falls with pressure), steady flow, adiabatic
> throttle. Fails when: the gas is near saturation, where throttling can
> condense it. [F]

For nitrogen at 300 K, $\mu_{JT}\approx +0.15$ K/bar averaged over a
200→5 bar drop, so the gas leaves the regulator roughly **30 K colder**
than the tank. For **helium at 300 K, $\mu_{JT}$ is negative**
($\approx-0.06$ K/bar; helium's inversion temperature is 45 K), so
throttled helium comes out about **12 K warmer**. [E] Both numbers are
order-of-magnitude and depend on the pressure history; verify against
`[NIST-WB]` for a real design.

Two consequences. First, a JT-cooled nitrogen plenum reduces $I_{sp}$ by
$\sqrt{263/293}=0.948$, a 5 % hit, unless the plenum is long enough or well
enough coupled to the structure to re-warm the gas. **Most flight designs
deliberately put thermal mass between the regulator and the thruster for
exactly this reason** and it is the sort of detail that looks like plumbing
routing on the drawing and is actually a performance decision. [J] Second,
a JT-cooled refrigerant can condense downstream of the regulator, which
turns a gas thruster into a two-phase thruster with unpredictable impulse
bits. Self-pressurising systems avoid this by keeping the pressure drop
small and by putting the vaporiser upstream. [M]

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| tank pressure, stored gas | 150–310 bar | 20–30 bar plenum-blowdown smallsats | SAFER at **224 bar**; 310 bar COPVs |
| tank pressure, self-pressurising liquid | 2–11 bar | n-butane ≈2.6 bar | ammonia ≈10.6 bar |
| plenum / regulated pressure | 1–20 bar | GomSpace NanoProp, 1–4 bar | EVA-class units |
| thrust per thruster | 10 μN – 4 N | GomSpace 1 mN, 5 μN resolution | NASA SoA class tops at **3.6 N**; SAFER ~3.6 N/thruster (**unverified**) |
| throat diameter | 0.03–1.5 mm | micro-etched CubeSat nozzles | EVA-class 3.6 N unit ≈1.15 mm |
| area ratio | 15–100 | low-$Re$ optimum falls to 15–30 | high-$Re$, thrust-optimised |
| throat Reynolds number | 10² – 10⁶ | micronozzles, deep blowdown | multi-newton thrusters |
| $\eta_I = I_{sp}/I_{sp,ideal}$ | 0.55–0.95 | $Re_t\sim500$ | $Re_t>10^5$ |
| ideal vacuum $I_{sp}$, $\varepsilon$=50, 300 K | 31–286 s | Xe 31.1 s | H₂ 285.6 s |
| realized $I_{sp}$ | 26–73 s cold; 82–110 s warm | Xe ~26–28 s | H₂ ~250–272 s (not flown as cold gas) |
| N₂ ideal $I_{sp}$, $\varepsilon$=50, 300 K | **76.8 s** | 75.1 s at $\varepsilon$=20 | 77.8 s at $\varepsilon$=100 |
| N₂ realized $I_{sp}$ | **65–73 s** | short-pulse, small nozzle | large thruster, warm tank |
| R-236fa realized $I_{sp}$ | ≈40 s cold | | ≈82 s warm-gas (CHIPS) |
| total impulse, CubeSat module | 44–755 N·s | VACCO Standard MiPS 0.3U, **44 N·s** | MarCO MiPS, **755 N·s** at 3.49 kg |
| impulse per wet mass, flight module | 150–250 N·s/kg | | MarCO: **216 N·s/kg** |
| number of firings | 10⁴ – 2×10⁶ | | VACCO Micro MiPS, **1,860,000** |
| minimum impulse bit | 10⁻⁶ – 10⁻³ N·s | micro-valve, sub-ms | solenoid poppet, 5–10 ms |
| leak specification | 10⁻⁶ – 10⁻⁴ std cm³/s He | all-welded module | valve-seat class |
| $\mu_{JT}$ at 300 K | −0.06 to +0.22 K/bar | He (heats) | N₂, Ar (cool) |

Sources: the Part IV gas table and system tables in the verification
worksheet, `[NASA-SOA]`, `[MarCO]`, `[SAFER95]`. Figures marked
**unverified** are `NEEDS PRIMARY` in the worksheet and must not be used in
a design.

---

## 5. Worked examples

All examples use $g_0=9.80665$ m/s², $R_u=8314.46$ J/(kmol·K). Nitrogen:
$\mathcal{M}=28.014$ kg/kmol, $R=296.797$ J/(kg·K), $\gamma=1.400$.
Every number below is recomputed by `tools/examples/29.py`.

### WE1 — GN₂ tank state, with and without the compressibility correction

**Given.** A 1.00 L (1.00×10⁻³ m³) COPV charged to 240 bar
(2.40×10⁷ Pa, 3,480 psia) at 293.15 K.

**Ideal gas.**
$$m = \frac{pV}{RT}=\frac{2.40\times10^7\times1.00\times10^{-3}}{296.797\times293.15}
=\frac{2.40\times10^4}{87{,}000}=\mathbf{0.2758\ kg}$$
$\rho = 275.8$ kg/m³.

**With $Z=1.13$** (Table 3.1, N₂ at 240 bar, 293 K):
$$m = \frac{0.2758}{1.13}=\mathbf{0.2441\ kg},\qquad \rho=244.1\ \mathrm{kg/m^3}$$

The ideal-gas answer is **13.0 % high**. At a realized $I_{sp}$ of 69 s the
difference is $0.0317\times69\times9.80665 = 21.4$ N·s of total impulse
that does not exist.

**Sanity check.** SAFER carries **1.4 kg of GN₂ at 224 bar**
(3,250 psi) — both figures confidence A `[SAFER95]`. Inverting Eq. 3.2 at
$Z=1.12$ and 293.15 K:
$$V=\frac{mZRT}{p}=\frac{1.4\times1.12\times296.797\times293.15}{2.24\times10^7}
=6.09\times10^{-3}\ \mathrm{m^3}=\mathbf{6.1\ L}$$
Six litres split between two bottles in a 37.7 kg backpack is entirely
credible for the hardware in the photographs. The ideal-gas calculation
would have said 5.4 L, which would have had the designer buying tanks 11 %
too small.

### WE2 — Sizing a 3.6 N GN₂ thruster (EVA class)

**Given.** N₂, regulated plenum $p_0=2.0$ MPa (20 bar, 290 psia),
$T_0=293.15$ K, conical nozzle $\varepsilon=50$, vacuum ($p_a=0$),
required $F=3.6$ N (0.81 lbf).

**Step 1 — $c^*$.** $\Gamma=\sqrt{1.4}(2/2.4)^{2.4/0.8}=0.684731$.
$$c^*=\frac{\sqrt{RT_0}}{\Gamma}=\frac{\sqrt{296.797\times293.15}}{0.684731}
=\frac{294.96}{0.684731}=\mathbf{430.78\ m/s}$$

**Step 2 — exit conditions.** Inverting the area–Mach relation at
$\varepsilon=50$ gives $M_e=5.914$. Then
$p_e = p_0/(1+0.2M_e^2)^{3.5}=2.0\times10^6/1445=\mathbf{1384\ Pa}$
($p_e/p_0=6.92\times10^{-4}$) and
$T_e=T_0/(1+0.2M_e^2)=293.15/7.996=\mathbf{36.7\ K}$.

That exit temperature is worth pausing on: nitrogen liquefies at 77 K at
1 bar and its triple point is 63 K. At 1384 Pa the saturation temperature
is about 55 K, so 36.7 K is *below* it — the flow is supersaturated and in
principle should condense. In practice the residence time in a millimetre
nozzle is ~10 μs and nucleation does not have time to occur, so the flow
stays in a metastable supercooled state. [E] This is a real effect for CO₂
and refrigerants, where it does occur and does cost $I_{sp}$; see §7.

**Step 3 — $C_F$ and $I_{sp}$.**
$$C_F=\sqrt{\frac{2(1.4)^2}{0.4}\left(\frac{2}{2.4}\right)^{6}\left[1-(6.92\times10^{-4})^{0.2857}\right]}
+6.92\times10^{-4}\times50 = 1.6946+0.0346=\mathbf{1.7292}$$
$$I_{sp,ideal}=\frac{c^*C_F}{g_0}=\frac{430.78\times1.7292}{9.80665}=\mathbf{75.96\ s}$$

Cross-check against the Part IV gas table: N₂ at $T_0=300$ K, $\varepsilon=50$
is listed at **76.8 s**. Scaling by $\sqrt{293.15/300}=0.9885$ gives
75.9 s. ✓

**Step 4 — throat and flow.**
$$A_t=\frac{F}{p_0C_F}=\frac{3.6}{2.0\times10^6\times1.7292}=1.041\times10^{-6}\ \mathrm{m^2}
\;\Rightarrow\; D_t=\mathbf{1.151\ mm}$$
$$\dot m=\Gamma\frac{p_0A_t}{\sqrt{RT_0}}=0.684731\times\frac{2.0\times10^6\times1.041\times10^{-6}}{294.96}
=\mathbf{4.833\ g/s}$$
$A_e=50A_t=5.205\times10^{-5}$ m², $D_e=8.14$ mm.

**Step 5 — check by the momentum + pressure form.**
$v_e=\sqrt{2\times3.5\times296.797\times293.15\,[1-(6.92\times10^{-4})^{0.2857}]}=729.97$ m/s.
$$F=\dot m v_e+p_eA_e = 4.833\times10^{-3}\times729.97 + 1384\times5.205\times10^{-5}
= 3.528+0.072=\mathbf{3.600\ N}\ ✓$$
The pressure term is **2.0 %** of thrust. On a vacuum cold-gas thruster it
is never negligible and never dominant.

**Sanity check.** SAFER's per-thruster figure is quoted at ≈3.6 N but is
**confidence C / NEEDS PRIMARY** in the verification worksheet, so treat
this as a design of an EVA-*class* thruster rather than a reconstruction of
SAFER. What does close: 24 thrusters at 3.6 N with a 1.15 mm throat each,
fed from 6 L at 224 bar, is a coherent system. What does not close is the
MMU $\Delta v$: 11.8 kg of GN₂ at 70 s gives 8,100 N·s, and against a 340 kg
suited-astronaut-plus-MMU mass that is 24 m/s, not the published 33–40 m/s.
The published figure cannot be reconciled without knowing the reference
mass, and the course says so rather than picking one.

### WE3 — Reynolds number and the viscous penalty, two scales

**Given.** (a) The 3.6 N thruster of WE2. (b) A 1.00 mN CubeSat thruster,
same gas, $\varepsilon=50$, $p_0=2.0$ bar, $T_0=293.15$ K.

**Throat state.** $T^*=2T_0/(\gamma+1)=244.29$ K. Nitrogen viscosity at
293 K is 1.76×10⁻⁵ Pa·s; scaling as $T^{0.7}$ gives
$\mu^*=1.549\times10^{-5}$ Pa·s. [E]

**(a)** $\dot m = 4.833\times10^{-3}$ kg/s, $D_t=1.151$ mm:
$$Re_t=\frac{4\dot m}{\pi D_t\mu^*}
=\frac{4\times4.833\times10^{-3}}{\pi\times1.151\times10^{-3}\times1.549\times10^{-5}}
=\mathbf{3.45\times10^{5}}$$
$\eta_{visc}=1-10/\sqrt{3.45\times10^5}=0.983$; with $\lambda=0.983$ (15°
cone), $\eta_I=0.966$ and $I_{sp}=73.4$ s. **In the 65–73 s realized band
for nitrogen.** ✓

**(b)** $C_F=1.7292$ still, so $A_t=1.00\times10^{-3}/(2.0\times10^5\times1.7292)=2.892\times10^{-9}$ m²,
$D_t=\mathbf{60.7\ \mu m}$, $\dot m = 1.342\times10^{-6}$ kg/s:
$$Re_t=\frac{4\times1.342\times10^{-6}}{\pi\times6.07\times10^{-5}\times1.549\times10^{-5}}=\mathbf{1.82\times10^{3}}$$
$\eta_{visc}=1-10/42.7=0.766$, $\eta_I=0.753$, $I_{sp}=\mathbf{57.2\ s}$.

**The result.** The same gas, the same nozzle contour, the same expansion
ratio, and a 22 % $I_{sp}$ difference — entirely because one throat is
1.15 mm and the other is 61 μm. Anyone quoting "nitrogen is a 70-second
propellant" without a throat diameter is quoting a number they cannot
defend.

**Sanity check.** Redo (b) at $\varepsilon=20$: $C_F=1.6899$,
$D_t=61.4$ μm, $\dot m=1.374\times10^{-6}$ kg/s, $Re_t=1.84\times10^3$
(essentially unchanged), ideal $I_{sp}=74.23$ s at 293.15 K. By Eq. 3.12a,
$b(20)=6.32$, so $\eta_{visc}=0.853$, $\eta_I=0.838$ and
$I_{sp}=\mathbf{62.2\ s}$. **The shorter nozzle wins by 5.1 s** — it gives
up 1.7 s of ideal $I_{sp}$ and recovers 6.8 s of viscous loss. That is
Grisnik's result reproduced on the back of an envelope `[Grisnik87]`, and
it is the reason CubeSat cold-gas nozzles are stubby.

### WE4 — Unregulated blowdown: $p(t)$, $F(t)$, and total impulse

**Given.** A plenum-blowdown GN₂ module: $V=0.400$ L, $p_i=20$ bar,
$T_i=293.15$ K held isothermal by the bus, one thruster with
$D_t=0.150$ mm ($A_t=1.767\times10^{-8}$ m²), $\varepsilon=50$, vacuum.
Firing continuous until $p_t=4$ bar (5:1 blowdown).

**Time constant.**
$$\tau=\frac{V}{\Gamma A_t\sqrt{RT_i}}
=\frac{4.00\times10^{-4}}{0.684731\times1.767\times10^{-8}\times294.96}
=\mathbf{112.1\ s}$$
Check by the other route: $\tau = Vc^*/(A_tRT_i)= (4.00\times10^{-4}\times430.78)/(1.767\times10^{-8}\times87{,}000)=112.1$ s ✓

**Initial state.** $m_i = p_iV/(RT_i)=\mathbf{9.195\ g}$ (at 20 bar,
$Z\approx1.00$, so no correction needed — this is the pay-off of a
low-pressure architecture).
$$F_i=C_Fp_iA_t=1.7292\times2.0\times10^6\times1.767\times10^{-8}=\mathbf{61.1\ mN}$$
$$\dot m_i=\Gamma p_iA_t/\sqrt{RT_i}=\mathbf{82.0\ mg/s};\quad
m_i/\dot m_i=112.1\ \mathrm{s}=\tau\ ✓$$

**Trajectory.** $p_t(t)=20\,e^{-t/112.1}$ bar, $F(t)=61.1\,e^{-t/112.1}$ mN.

| $t$ (s) | $p_t$ (bar) | $F$ (mN) |
|---|---|---|
| 0 | 20.00 | 61.1 |
| 50 | 12.79 | 39.1 |
| 100 | 8.18 | 25.0 |
| 150 | 5.23 | 16.0 |
| 180.4 | 4.00 | 12.2 |

Time to 5:1: $t=\tau\ln5=112.1\times1.6094=\mathbf{180.4\ s}$.

**Total impulse.**
$\phi_{iso}=1-4/20=0.800$, $m_{used}=7.356$ g, and with the ideal
$I_{sp}=75.96$ s:
$$I_{tot}=\phi m_i I_{sp}g_0 = 0.800\times9.195\times10^{-3}\times75.96\times9.80665=\mathbf{5.479\ N\!\cdot\!s}$$
Check against $F_i\tau(1-p_f/p_i)=0.0611\times112.1\times0.8=5.479$ N·s ✓

At the realized level, $Re_t$ starts at $4.50\times10^4$ (at 20 bar) and
ends at $8.99\times10^3$ (at 4 bar), so $\eta_I$ runs from 0.937 down to
0.879. Integrating $\eta_I(p)\,I_{sp,ideal}\,g_0\,dm$ over the discharge
gives a delivered impulse of **5.03 N·s**, **8.1 % below ideal**. Note that
the viscous loss *grows* as the tank empties — the last gas out is the
worst gas out, and that is a general feature of blowdown systems.

**Sanity check.** VACCO's Standard MiPS (0.3U) delivers **44 N·s**. This
0.4 L module at 20 bar delivers about a tenth of that from a tenth of the
stored energy, which is the right scaling; MiPS gets there with a
self-pressurising liquid at 1.36 g/cm³ instead of a gas at 0.023 g/cm³.

### WE5 — The same blowdown, adiabatic; and the polytropic middle

**Given.** As WE4, but the tank is thermally isolated (say a 180-second
continuous delta-v burn on a spacecraft whose tank sits on standoffs).

**Temperature.**
$$T_f=T_i\left(\frac{p_f}{p_i}\right)^{\frac{\gamma-1}{\gamma}}
=293.15\times(0.20)^{0.2857}=293.15\times0.6314=\mathbf{185.1\ K}$$
A **108 K drop**. Any elastomeric seal in that tank is now well below its
glass transition, and the strain gauges on a composite overwrap are reading
a thermal contraction they were not calibrated for.

**Usable fraction.**
$$\phi_{adiab}=1-(0.20)^{1/1.4}=1-0.3168=\mathbf{0.683}$$
against $\phi_{iso}=0.800$. **14.6 % of the propellant is stranded by
cooling alone.**

**Duration.** From Eq. 3.15 with $x_f=(p_f/p_i)^{1/\gamma}=0.3168$:
$$t_f = \frac{2\tau_i}{\gamma-1}\left(x_f^{-\frac{\gamma-1}{2}}-1\right)
=\frac{2\times112.1}{0.4}\left(0.3168^{-0.2}-1\right)
=560.4\times0.2585=\mathbf{144.9\ s}$$
The adiabatic tank reaches 4 bar in 145 s, against 180 s isothermal —
**faster**, because the pressure is falling both from mass loss and from
cooling.

**Impulse.** $m_f=x_f m_i=2.913$ g, $m_{used}=6.282$ g, and by Eq. 3.18:
$$I_{tot}=C_F c^*_i m_i\frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{1.2}\right]
=1.7292\times430.78\times9.195\times10^{-3}\times0.8333\times[1-0.2555]$$
$$=\mathbf{4.271\ N\!\cdot\!s}$$
against 5.479 N·s isothermal — a **22 % loss**. The average $I_{sp}$ over
the discharge is $4.271/(6.282\times10^{-3}\times9.80665)=69.3$ s, and the
instantaneous $I_{sp}$ at cutoff is
$75.96\sqrt{185.1/293.15}=\mathbf{60.4\ s}$.

**Polytropic reality, $n=1.2$.**
$T_f=293.15\times0.20^{1/6}=224.2$ K (a 69 K drop);
$\phi=1-0.20^{1/1.2}=0.739$. Between the limits, as it must be, and closer
to the adiabatic end — because $n=1.2$ corresponds to $\kappa=0.5$ in
Eq. 3.5, i.e. the wall supplies only half the expansion work.

**Sanity check.** The rule of thumb `[SB §6]` for gas-pressurised blowdown
systems — that the real exponent for a metal tank of ordinary wall mass
over a burn of tens to hundreds of seconds sits at $n\approx1.1$–$1.3$ —
puts this case at $\phi\approx0.72$–$0.76$. Any design that budgets
$\phi_{iso}=0.80$ for a continuous burn is 6–10 % optimistic.

### WE6 — A regulated system: constant thrust, linear tank decay, residuals

**Given.** $V=0.400$ L GN₂ COPV at $p_i=200$ bar, 293.15 K, $Z=1.10$;
regulator set to $p_{reg}=5$ bar with lockup at $p_{lock}=6$ bar; one
thruster sized for 25 mN at $\varepsilon=50$; tank isothermal (pulsed duty
cycle).

**Loaded mass.**
$$m_t=\frac{p_iV}{ZRT}=\frac{2.00\times10^7\times4.00\times10^{-4}}{1.10\times296.797\times293.15}=\mathbf{83.6\ g}$$
(the ideal-gas answer, 92.0 g, is 10 % high).

**Thruster.**
$A_t=F/(C_Fp_{reg})=0.025/(1.7292\times5\times10^5)=2.892\times10^{-8}$ m²,
$D_t=\mathbf{0.192\ mm}$;
$\dot m=\Gamma p_{reg}A_t/\sqrt{RT_0}=\mathbf{33.56\ mg/s}$;
$I_{sp}=F/(\dot m g_0)=75.96$ s ideal, and with
$Re_t = 4\dot m/(\pi D_t\mu^*)=1.438\times10^4$,
$\eta_I=0.983(1-10/119.9)=0.901$, giving $I_{sp}=\mathbf{68.4\ s}$
realized.

**Tank decay.** From Eq. 3.16,
$$\frac{dp_t}{dt}=-\frac{\dot m RT_i}{V}
=-\frac{3.356\times10^{-5}\times296.797\times293.15}{4.00\times10^{-4}}
=-7.30\times10^3\ \mathrm{Pa/s}=\mathbf{-0.073\ bar/s}$$
i.e. 73 bar per 1000 s of accumulated on-time. Linear, not exponential —
the regulator has converted the exponential into a ramp, which is exactly
what it is for.

**Residual and usable.** At lockup, $m_{res}=p_{lock}V/(RT)=2.76$ g. Usable
$=83.6-2.8=\mathbf{80.8\ g}$, i.e. $\phi=\mathbf{96.7\ \%}$ — against
$\phi=0.80$ for the 5:1 blowdown of WE4. **The regulator buys 21 % more
propellant out of the same tank, on top of holding thrust constant.** It
costs mass, a single-point failure mode (regulators fail open, which
overpressurises everything downstream, which is why flight systems carry a
relief valve and a burst disc) and a Joule–Thomson temperature drop.

**Total impulse and duration.**
$$I_{tot}=80.8\times10^{-3}\times68.44\times9.80665=\mathbf{54.2\ N\!\cdot\!s}$$
Accumulated on-time $=80.8\times10^{-3}/3.356\times10^{-5}=2408$ s = 40 min.

**Sanity check.** VACCO's Standard MiPS 0.3U is 44 N·s and the modular
family scales 82–515 N·s. A 0.4 L 200 bar nitrogen system landing at
54 N·s is in the right family — but it needs a 200 bar COPV, and the MiPS
does the same job at 2.7 bar. That is the trade in one line.

### WE7 — Impulse bit with a first-order valve

**Given.** The 25 mN thruster of WE6. Plenum emptying constant
$\tau_e=5$ ms, filling constant $\tau_f=3$ ms, negligible dead time.

Using Eq. 3.20, $I_{bit}=F[t_{on}+(\tau_e-\tau_f)(1-e^{-t_{on}/\tau_f})]$:

| $t_{on}$ (ms) | $k=1-e^{-t_{on}/\tau_f}$ | $I_{bit}$ (μN·s) | ideal $Ft_{on}$ (μN·s) | error |
|---|---|---|---|---|
| 50 | 1.000 | 1300 | 1250 | +4.0 % |
| 20 | 0.999 | 550 | 500 | +10.0 % |
| 10 | 0.964 | 298 | 250 | +19.3 % |
| 5 | 0.811 | 166 | 125 | +32.4 % |
| 2 | 0.487 | 74 | 50 | +48.7 % |

**Read the trend.** Short pulses deliver *more* impulse than $Ft_{on}$,
not less, because the tail-off through a small throat lasts longer than the
rise. Students consistently guess the sign wrong.

**Repeatability.** At $t_{on}=5$ ms, a ±10 % timing jitter gives
$I_{bit}$ = 151, 166, 180 μN·s — a ±8.8 % impulse spread, *less* than the
±10 % timing spread, because the tail is insensitive to when the valve
shut. At $t_{on}=50$ ms the same ±10 % gives ±9.6 %. The asymmetry is
mildly stabilising here; it would be destabilising if $\tau_f>\tau_e$.

**Library cross-check.** `rocket.impulse_bit(0.025, 0.010, 2.2×0.003,
2.2×0.005)` returns 305 μN·s against Eq. 3.20's 298 μN·s — 2 % apart,
which is the accuracy of the trapezoidal approximation at
$t_{on}=3.3\tau_f$.

**Sanity check.** GomSpace quote 1 mN thrust with 5 μN resolution for
NanoProp CGP3. At 1 mN, a 166 μN·s bit corresponds to $t_{on}=5$ ms scaled
by 25 — i.e. 6.6 μN·s. Their resolution figure is a thrust-modulation
number, not a pulse-width number; the two are not comparable, and the
course flags that because vendor data sheets routinely put them in the same
table.

### WE8 — Five-year leakage budget

**Given.** The WE6 system: 83.6 g of GN₂, 5-year mission
($1.578\times10^8$ s). Module specification: total external leakage
$\le1\times10^{-4}$ std cm³/s helium at operating $\Delta p$.

**Mass per std cm³.** For helium,
$p_{std}V/(R_{He}T_{std}) = 101325\times10^{-6}/(2077.1\times273.15)=1.786\times10^{-7}$ kg.
For nitrogen, $101325\times10^{-6}/(296.797\times273.15)=1.250\times10^{-6}$ kg.

**Convert the helium spec to nitrogen service.** Molecular flow:
$Q_{N_2}=Q_{He}\sqrt{\mathcal{M}_{He}/\mathcal{M}_{N_2}}
=1\times10^{-4}\times0.378=3.78\times10^{-5}$ std cm³/s.

**Five-year loss.**
$$m_{leak}=3.78\times10^{-5}\times1.578\times10^{8}\times1.250\times10^{-6}
=\mathbf{7.46\ g}$$
which is **8.9 % of the propellant load**. Unacceptable.

**Tighten the spec.** At $1\times10^{-5}$ scc/s He: 0.75 g, **0.89 %** —
acceptable as a line item. At $1\times10^{-6}$: 0.075 g, **0.09 %** —
negligible, and achievable only with an all-welded module and metal-seated
latching valves.

**If the leak is viscous instead of molecular**, nitrogen leaks at roughly
$\mu_{He}/\mu_{N_2}\approx1.1$ times the helium rate rather than 0.378, and
every number above multiplies by 2.9: the $10^{-5}$ spec then costs 2.2 g,
2.6 % of the load. **Specify the leak regime, or specify the leak in the
service gas.** [J]

**Sanity check.** VACCO quote up to 1,860,000 firings for the Micro MiPS.
A system that can be commanded nearly two million times over years is one
whose designers took the seat-leakage budget seriously; the firing count
and the leak rate are the same engineering problem seen from two sides.

---

## 6. Real engines

### SAFER (1994 flight test, 1995 report) — why 224 bar and 1.4 kg

**Design choice.** GN₂ at 224 bar, 1.4 kg of propellant, 24 thrusters,
3.05 m/s of $\Delta v$, in a 37.7 kg backpack `[SAFER95]`.

**The alternatives available.** By 1994 hydrazine monopropellant thrusters
were mature and would have given 220 s instead of ~40 s — five times the
$\Delta v$ per kilogram. Compressed helium would have given 2.3 times
nitrogen's $I_{sp}$. Neither was chosen.

**Why the choice made sense.** SAFER is worn by a human being, fired
centimetres from a pressure suit, and must be certified to sit inertly on
an airlock wall for years and then work first time. Hydrazine is toxic and
its exhaust is hot; helium leaks through everything, which for a device
that spends its life in storage is disqualifying. Nitrogen is the working
fluid of the ISS airlock, it is inert, it can be recharged on orbit from
existing supplies, and its exhaust is cold. The requirement was not
$\Delta v$ per kilogram — it was **3.05 m/s, once, with certainty, next to
a person**. `[SAFER95]`

**The number that closes.** 1.4 kg at 3.05 m/s against a ~180 kg suited
crew member implies $I_{sp}\approx40$ s, well below the 77 s ideal. That is
credible for a thruster firing millisecond bursts through a small nozzle
with a cold plenum, and it is the honest cold-gas number for this course —
about half of ideal, not 90 % of it. The verification worksheet recommends
SAFER over MMU as the worked example for exactly this reason.

**Would a modern engineer choose the same?** Yes, and NASA did — SAFER is
still flown. [M]

### MarCO / VACCO Micro CubeSat Propulsion System (2018) — why a refrigerant

**Design choice.** R-236fa stored as a self-pressurising saturated liquid
at ~2.7 bar, 8 thrusters, 755 N·s total impulse, 3.49 kg wet, >40 m/s of
$\Delta v$, in a single all-welded aluminium module `[MarCO]`.

**The alternatives.** GN₂ at 200 bar would have given 69 s against 40 s.
Butane would have given ~65 s at 2.6 bar. Hydrazine would have given 220 s.

**Why the choice made sense.** Compute the two competing figures of merit.
R-236fa stores at 1.36 g/cm³ against 0.023 g/cm³ for nitrogen at 200 bar —
a factor of 59 in density, against a factor of 1.7 in $I_{sp}$. Impulse per
unit propellant volume therefore favours the refrigerant by a factor of
~35. Then add the tank: a 200 bar COPV is a pressure vessel with a
qualification programme, a burst disc, and a launch-safety case as a
secondary payload on someone else's rocket; a 2.7 bar can is a welded
aluminium box. MarCO's propulsion module is a *structure* that happens to
contain propellant. **The propellant choice was a systems decision, not a
performance decision**, and it is the single best illustration of that
principle in the course.

**Check the closure.** 755 N·s at ~40 s implies
$755/(40\times9.80665)=1.925$ kg of propellant in a 3.49 kg module — a 55 %
propellant mass fraction for a system that includes eight thrusters, the
valves and the electronics. That is a very good number and it is only
achievable at low tank pressure.

**Would a modern engineer choose the same?** For a volume-limited,
launch-safety-constrained secondary payload, yes, and the whole industry
has: VACCO, GomSpace and the Lightsey-lineage academic systems all use
liquefiable propellants. For a mass-limited primary spacecraft with its own
launch, no — the $I_{sp}$ penalty stops being free. [M]

### GomSpace NanoProp CGP3 (flown TW-1, 2015) — why butane and 1 mN

**Design choice.** n-butane, self-pressurising at 1–4 bar, four thrusters
at 1 mN each with 5 μN resolution, ~60 g of propellant, up to 15 m/s for a
2.66 kg satellite.

**Why.** Butane's ideal $I_{sp}$ at $\varepsilon=50$ and 300 K is 69.2 s —
*better than nitrogen's 76.8 s on a volumetric basis by a factor of 25*,
because it stores at 0.57 g/cm³ at 2.6 bar. And 1 mN is not a limitation,
it is the requirement: a 2.66 kg 3U CubeSat needs milli-newtons for
formation flying, and a larger thruster would have made the minimum impulse
bit too coarse for the pointing budget. The 5 μN resolution figure is a
throttling claim and should be read as such.

**The catch this course insists on.** At 1 mN and 2 bar the throat is
~60 μm and $Re_t\approx1800$, so the delivered $I_{sp}$ is nearer 55 s than
69 s. Butane's advantage over nitrogen survives that — it is a volumetric
argument, not an $I_{sp}$ argument — but the data sheet number does not.
[J]

### Falcon 9 first-stage GN₂ system (2013–) — why cold gas on a launcher

**Design choice.** Gaseous nitrogen, two clusters of four thrusters in the
interstage, used to flip the booster after separation and hold attitude
through the exo-atmospheric coast.

**The alternatives.** Hydrazine (higher $I_{sp}$, toxic, needs catalyst-bed
preheat), or the main engines (cannot be used at the required attitude
rates or in the required direction).

**Why cold gas.** The thrusters must work in vacuum and in dense
atmosphere, must not require ignition or ullage settling, and must restart
an arbitrary number of times over a ten-minute coast with no warm-up. A
cold-gas thruster is the only device that does all four with a
part count of one moving element. The total impulse required is small
compared with the vehicle, so the $I_{sp}$ penalty is affordable — and that
is precisely why cold gas is *rare* on launch vehicles: the moment the
required impulse becomes a significant fraction of the stage's, a 70-second
propellant is disqualifying.

**No performance numbers are quoted here.** SpaceX does not publish thrust,
$I_{sp}$, tank pressure or total impulse for this system, and the figures
circulating on enthusiast sites have no traceable origin. The verification
worksheet marks all of them confidence D.

**Would a modern engineer choose the same?** Yes; every reusable booster
concept since has done the same thing. [M]

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### Trade-offs

**Regulated vs blowdown.** A regulator gives constant thrust, near-complete
tank utilisation ($\phi\approx0.97$ vs 0.80 for a 5:1 blowdown, WE4/WE6),
and a nozzle that always runs at its design Reynolds number. It costs
150–400 g, a failure mode, and 30 K of Joule–Thomson cooling. **[J] Below
about 100 N·s of total impulse the regulator mass exceeds the propellant it
saves and blowdown wins; above about 500 N·s the regulator always wins.**
In between, the deciding factor is usually whether the control law can
tolerate a 5:1 thrust variation.

**Expansion ratio.** The ideal-$C_F$ gain from $\varepsilon$ 20→100 is
3.6 %. The viscous loss over the same range at $Re_t\sim2000$ is 8–10 %.
Above $Re_t\sim10^4$ the gain wins; below $\sim3\times10^3$ the loss wins.
Design $\varepsilon$ from $Re_t$, not from a chemical-engine habit.

**Light gas vs dense gas.** $I_{sp}\propto\mathcal{M}^{-1/2}$;
storage density scales the other way and faster. The crossover is entirely
about whether mass or volume binds, and for anything CubeSat-sized volume
binds. Helium loses twice: low density *and* the highest leak rate of any
propellant.

### Failure modes

**Regulator fails open.** *Mechanism*: contamination on the seat, or a
diaphragm rupture. *Symptom*: downstream pressure rises to tank pressure;
thrust jumps by the pressure ratio (40× in the WE6 system); plenum and
lines see 200 bar. *Evidence*: plenum transducer at tank pressure, relief
valve or burst disc actuation, propellant consumed in seconds.
*Fix*: relief valve and burst disc downstream of every regulator, sized for
full tank flow through the regulator's failed-open area; filtration
upstream (10 μm absolute is typical); latch valve isolation.

**Nozzle blockage by particulate.** *Mechanism*: a 60 μm throat is
comparable to the particle sizes that survive ordinary cleanliness levels.
*Symptom*: thrust down on one thruster, attitude drift with a signature
that maps to a single nozzle. *Evidence*: paired-thruster impulse asymmetry
in the attitude-control telemetry; on the ground, flow-versus-pressure
falling off the choked line. *Fix*: absolute filtration at 5–10 μm
immediately upstream of each thruster, not just at the tank outlet; and
build the filter *into* the thruster body so there is no joint between them.

**Condensation in the nozzle or downstream of the regulator.**
*Mechanism*: refrigerants and CO₂ expand into their two-phase region.
*Symptom*: $I_{sp}$ below prediction and, worse, erratic impulse bits.
*Evidence*: measured $C_F$ below ideal by more than the $Re$ correlation
explains; thrust-stand traces with pulse-to-pulse scatter far above the
timing jitter. *Fix*: heat the plenum (which is the first step toward a
warm-gas system), reduce $\varepsilon$ so the exit stays out of the dome,
or change propellant.

**Slow leak through a valve seat.** *Mechanism*: elastomer seat cold-flow
or a particle held on a metal seat. *Symptom*: tank pressure decaying with
no commanded firings. *Evidence*: the tank transducer trend — this is the
one failure mode that flight telemetry detects trivially and early.
*Fix*: series latch valve normally closed between firing campaigns; metal
seats for the isolation valve, elastomer only for the fast thruster valve.

**Two-phase feed from a self-pressurising tank in microgravity.**
*Mechanism*: with no settling acceleration, liquid can reach the outlet.
*Symptom*: an impulse bit 10–100× nominal, followed by a cold tank.
*Evidence*: attitude-rate steps inconsistent with the commanded pulse.
*Fix*: a phase-separating device — porous vane, propellant management
device, or (the CubeSat answer) a wick and a vaporiser plenum between tank
and valve.

### Materials

Tanks: aluminium-lined carbon-overwrapped pressure vessels for stored gas
(6061 or 7075 liner, T700/T1000-class fibre), because the liner is the
permeation barrier and the overwrap is the strength. Titanium 6Al-4V for
all-metal tanks where permeation matters more than mass. Thin-wall welded
aluminium for self-pressurising liquids, where the pressure is 2–3 bar and
the wall is set by handling stiffness, not stress. Seals: metal C-seals or
welded joints wherever the joint holds propellant for years; elastomer
(EPDM, or PCTFE for the seat itself) only in the fast valve where
elastic recovery is needed. Note the adiabatic-blowdown temperature drop of
WE5 — 108 K — and check every elastomer against it.

### Manufacturing

The dominant modern trend is **monolithic construction**: print or EDM the
plenum, the feed passages and the nozzles as one part so that the leak
budget has no joints in it `[MarCO]` [M]. The manufacturing limit is the
throat. A 60 μm throat with a controlled contour is not a drilling
operation; it is EDM, laser drilling, or DRIE in silicon (the micronozzle
route `[Bayt99]`). Throat diameter tolerance flows straight into thrust
tolerance: $F\propto A_t\propto D_t^2$, so a ±2 μm tolerance on a 60 μm
throat is ±6.7 % on thrust, which is usually the largest single term in the
thrust uncertainty budget.

### Testing

**What is measured.** Thrust on a torsional or flexure thrust stand with
$\mu$N-level resolution; mass flow by tank-mass loss or a Coriolis meter;
plenum pressure and temperature; vacuum chamber pressure (which must stay
below about $p_e/2$ or the nozzle is not doing what it will do in flight —
for a 50:1 nitrogen nozzle at 20 bar, $p_e=1384$ Pa, so the chamber must
hold below ~700 Pa *at full flow*, which is a pumping requirement, not a
base-pressure requirement).

**Deriving $C_F$ and $C_d$ separately.** $C_d = \dot m_{meas}/\dot m_{ideal}$
from Eq. 3.7 and the measured $p_0$, $T_0$; $C_F = F_{meas}/(p_0A_t)$.
Plotting both against $Re_t$ over a plenum-pressure sweep is the standard
low-$Re$ nozzle characterisation and is exactly what `[Spisz65]` and
`[Grisnik87]` did.

**What the data looks like when it is wrong.** A $C_d$ above 1 means the
throat area is bigger than the drawing (or $p_0$ is being measured
downstream of a loss). A $C_F$ that falls with increasing $p_0$ means the
vacuum chamber is not keeping up and the nozzle is separating. A $C_F$ that
falls with *decreasing* $p_0$ along a $Re^{-1/2}$ line is the real viscous
signature. Impulse-bit scatter that grows as $t_{on}$ falls is Eq. 3.20
telling you that you are in the tail-dominated regime.

---

## 8. Misconceptions and what engineers actually care about

**"Cold gas has an $I_{sp}$ of about 70 seconds."** It has an ideal
$I_{sp}$ of 76.8 s for nitrogen at 300 K and $\varepsilon=50$, and a
delivered $I_{sp}$ anywhere from 40 s (SAFER, short pulses, small nozzle)
to 73 s (large thruster, warm tank). The spread is a factor of 1.8 and it
is dominated by throat Reynolds number and pulse duty, not by the gas.

**"Higher expansion ratio is better."** Only above $Re_t\sim10^4$. Below
that, added wetted area costs more friction than the added pressure thrust
is worth, and the optimum $\varepsilon$ falls `[Grisnik87]`.

**"The tank empties isothermally, so use $\phi=1-p_f/p_i$."** Only if the
discharge is slow compared with the tank's thermal time constant. A
continuous burn is closer to adiabatic, where $\phi=1-(p_f/p_i)^{1/\gamma}$
— 15 % less propellant *and* a declining $I_{sp}$ on the propellant you do
get.

**"$m=pV/RT$ is good enough for a tank."** It is 10–15 % optimistic at
200–300 bar, and optimistic in the direction that makes the design look
like it closes.

**"Adiabatic blowdown means the gas in the tank was throttled, so use the
isenthalpic relation."** No. The gas *remaining* in the tank expands
reversibly against the departing gas and follows $pv^\gamma$. Only the gas
that crossed the orifice was throttled, and it has left.

**"Short pulses deliver less than $F\,t_{on}$."** Usually more. The
plenum drains through the throat after the valve shuts, and that tail is
longer than the fill transient. Only a thruster with $\tau_f>\tau_e$
under-delivers.

**"Helium is the best cold gas because it has the highest $I_{sp}$ of the
practical gases."** Highest $I_{sp}$, lowest storage density, highest leak
rate, and it needs the heaviest tank. On a volume- or tank-mass-limited
vehicle it is close to the worst choice, which is why nothing flies it as
a primary cold-gas propellant.

**"Cold gas can't condense — there's no combustion."** The exit static
temperature in WE2 was 36.7 K. Nitrogen survives that only because
nucleation is slower than the residence time. CO₂ and refrigerants do not.

### What engineers actually care about

1. **Delivered total impulse at end of life**, not $I_{sp}$: the number
   that has $Z$, $\phi$, $\eta_I$ and five years of leakage already in it.
2. **The impulse-bit distribution**, not the minimum impulse bit: pointing
   budgets close on the spread, not the mean.
3. **Throat Reynolds number**, because it sets $\eta_I$, sets the optimum
   $\varepsilon$, and is the one number that tells you whether a vendor's
   $I_{sp}$ claim is defensible.
4. **The leak rate and its regime**, because it is the only failure mode
   that consumes propellant while the spacecraft is doing nothing.
5. **Tank thermal state**, because $I_{sp}\propto\sqrt{T_0}$ and because
   the adiabatic temperature drop is a materials problem before it is a
   performance problem.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can state that cold-gas $I_{sp}$ scales as
$\sqrt{T_0/\mathcal{M}}$ and that stored impulse density scales the other
way; sketch $p(t)$ for a blowdown and for a regulated system and say which
is exponential and which is linear; name SAFER and MarCO and say which
propellant each uses and why.

**Level 2 — Working engineering knowledge.** Given
$\mathcal{M},\gamma,T_0,p_0,\varepsilon,F$ you can size the throat, compute
$\dot m$, $c^*$, $C_F$, $I_{sp}$ and $Re_t$ with correct units; compute
stored mass with a $Z$ correction; derive and solve the isothermal blowdown
ODE; compute usable fraction in both limits; convert a helium leak spec
into grams per year. You can quote from memory that nitrogen's ideal
$I_{sp}$ at $\varepsilon=50$, 300 K is ~77 s, that realized is ~65–73 s,
that a CubeSat refrigerant system is ~40 s, and that $\Gamma=0.685$ for
$\gamma=1.4$.

**Level 3 — Interview mastery.** Given an unfamiliar cold-gas thruster
data sheet you can decide whether the quoted $I_{sp}$ is defensible by
estimating $Re_t$ from thrust and pressure alone; argue the
regulated-vs-blowdown trade with numbers for a stated total impulse; choose
between a stored gas and a self-pressurising liquid from the volume, mass
and launch-safety constraints and defend the choice against the $I_{sp}$
argument; look at a thrust-stand trace and say whether the scatter is
timing jitter, tail-dominated pulse dynamics, condensation, or a partially
blocked throat; and name the historical system that faced the same problem.

---

## 10. Problems

### Conceptual

**C1.** Explain why the gas remaining in an adiabatically blowing-down tank
follows $pv^{\gamma}=$ const rather than an isenthalpic path, given that the
gas leaving the tank is being throttled through an orifice.

**C2.** A vendor quotes 76 s $I_{sp}$ for a 0.5 mN nitrogen thruster at
1.5 bar plenum pressure. Without computing anything exactly, state two
reasons the number is not credible and identify the single piece of missing
information you would ask for first.

**C3.** At a fixed thrust requirement, explain why lowering the plenum
pressure to obtain a finer impulse bit degrades $I_{sp}$. Give the scaling
of $Re_t$ with $p_0$ and with $F$.

**C4.** A helium system and a nitrogen system have identical tanks,
identical thrusters and identical total impulse requirements. Which needs
the larger tank volume, and which is more likely to fail its end-of-life
propellant budget? Explain both answers.

**C5.** Sketch, on the same axes, tank pressure versus accumulated on-time
for (a) an unregulated fixed-throat blowdown and (b) a regulated system
that later drops out of regulation. Label the time constant and the lockup
pressure.

**C6.** Why does a regulator make a nitrogen plenum *colder* and a helium
plenum *warmer*? What is the consequence of each for delivered $I_{sp}$?

**C7.** Explain why a first-order thruster with equal fill and empty time
constants has no impulse-bit bias at any pulse width, and identify the
physical reason real thrusters do not satisfy that condition.

**C8.** The verification worksheet for this course records a
measured-to-theoretical $I_{sp}$ ratio of about 0.91 across the standard
published cold-gas table, but SAFER's flight-derived $I_{sp}$ is about 40 s
against an ideal 77 s — a ratio of 0.52. Reconcile the two.

### Calculation

**P1.** A 0.75 L tank is charged with argon to 250 bar at 288 K. Compute
the stored mass (a) ideally and (b) with $Z$ read from Table 3.1
(interpolate). Compute the ideal vacuum $I_{sp}$ at $\varepsilon=40$ and
288 K using the course library, and the total impulse assuming
$\eta_I=0.90$ and a 5:1 blowdown at constant temperature.

**P2.** **Size a GN₂ system.** Required: total impulse 50 N·s delivered,
minimum impulse bit $\le1.0\times10^{-4}$ N·s. Constraints: regulated
plenum at 4 bar, $T_0=293.15$ K, conical nozzle $\varepsilon=50$ with 15°
half-angle, solenoid valve with a minimum repeatable on-time of 8 ms and
$\tau_e=\tau_f$. Tank charged to 200 bar at 293.15 K with $Z=1.10$;
regulator lockup at 5 bar. Find: thrust per thruster, throat diameter,
$Re_t$, $\eta_I$, delivered $I_{sp}$, propellant mass, tank volume, total
accumulated on-time, and the number of minimum-bit pulses available.

**P3.** **Pressure–time and thrust–time for a blowdown.** A GN₂ module has
$V=0.250$ L, $p_i=25$ bar, $T_i=293.15$ K, one thruster with
$D_t=0.200$ mm, $\varepsilon=50$, firing continuously in vacuum. Compute
$\tau$, $F_i$, $m_i$, and tabulate $p_t$ and $F$ at $t=0,50,100,150,200$ s
for the isothermal case. Then compute the time to reach 5 bar and the total
impulse delivered down to 5 bar, isothermally. Repeat the time-to-5-bar and
the total impulse for the adiabatic case and state the percentage
difference in both.

**P4.** **He vs N₂ vs R-236fa in a 3U CubeSat.** A propulsion module is
allocated 1.5U of a 3U bus. After structure, valves and electronics,
0.600 L of internal propellant volume is available. Options: (a) helium at
300 bar, $Z=1.17$; (b) nitrogen at 300 bar, $Z=1.19$; (c) R-236fa as a
saturated liquid at 2.7 bar, $\rho_L=1.36$ g/cm³, 90 % fill. Assume
$\eta_I=0.90$, $\varepsilon=50$, $T_0=293.15$ K. Model the high-pressure
tank as a thin-walled sphere with $m_{tank}=1.5\,pV/(\sigma/\rho_m)$ using
Ti-6Al-4V at $\sigma_{allow}=500$ MPa, $\rho_m=4430$ kg/m³, and the
low-pressure can as a minimum-gauge 100 g aluminium vessel. For each
option compute stored propellant mass, ideal and realized $I_{sp}$, total
impulse, tank mass, impulse per unit propellant volume, and impulse per
wet mass (propellant + tank only). Rank them and compare your best figure
against MarCO's flight value of 755 N·s in 3.49 kg.

**P5.** **Isp penalty at $Re\sim1000$.** A GN₂ thruster is required to
produce 1.00 mN at a plenum pressure of 0.60 bar, $T_0=293.15$ K,
$\varepsilon=50$, 15° half-angle. Compute $A_t$, $D_t$, $\dot m$, $T^*$,
$\mu^*$ (use $\mu_{293}=1.76\times10^{-5}$ Pa·s scaled as $T^{0.7}$) and
$Re_t$. Then estimate $\eta_{visc}$, $\lambda$, $\eta_I$ and the delivered
$I_{sp}$, and state the $I_{sp}$ penalty in seconds and in percent relative
to ideal. Comment on the validity of Eq. 3.12 at this Reynolds number and
say what you would do about $\varepsilon$.

**P6.** A tank blows down adiabatically from 200 bar to 20 bar. Compute the
final tank temperature and the usable mass fraction for (a) nitrogen
($\gamma=1.400$), (b) helium ($\gamma=1.667$), (c) R-236fa vapour
($\gamma=1.08$). Comment on which gas suffers most and why, and on which
result you would trust least.

**P7.** A 25 mN thruster has $\tau_f=2$ ms and $\tau_e=6$ ms. Compute
$I_{bit}$ for $t_{on}=$ 3, 6, 12 and 40 ms and the percentage deviation
from $Ft_{on}$. Then compute $\partial I_{bit}/\partial t_{on}$ at
$t_{on}=3$ ms and express the impulse repeatability that results from a
±0.3 ms timing jitter.

**P8.** A module holds 120 g of GN₂ and is specified at
$5\times10^{-5}$ std cm³/s helium total external leakage. Compute the
propellant lost over a 7-year mission assuming (a) molecular flow scaling
and (b) viscous flow scaling with $\mu_{He}/\mu_{N_2}=1.10$. Express both
as a percentage of the load, and state the specification you would write
instead if the allowable end-of-life loss is 1 %.

### Engineering reasoning

**R1.** A thrust-stand campaign sweeps plenum pressure from 0.5 to 8 bar on
a single thruster and reports $C_F$ rising monotonically with $p_0$ and
levelling off above 4 bar. A colleague says this proves the vacuum chamber
is undersized. Give the alternative explanation, say what single additional
measurement would distinguish the two, and say which you would bet on.

**R2.** Flight telemetry from a 6U CubeSat shows tank pressure falling
0.4 bar per week with the latch valve commanded closed and no firings.
The tank is 0.5 L at an initial 180 bar of GN₂ at 290 K, and the bus
temperature is stable. Compute the implied leak rate in std cm³/s of
nitrogen, convert it to an equivalent helium specification under molecular
scaling, and state where in the system you would look first and why.

**R3.** Two identical thrusters on opposite sides of a spacecraft are
commanded with identical 6 ms pulses. Over a month, one accumulates 8 %
more impulse than the other, and the discrepancy grows slowly. Give three
candidate mechanisms, say what each would do to the $C_d$ and $C_F$ you
would measure on the ground, and rank them by likelihood.

**R4.** A design review presents a blowdown cold-gas system sized with
$\phi=1-p_f/p_i$ for a single 300-second continuous delta-v burn. State
what is wrong, estimate the size of the error for a 6:1 blowdown of
nitrogen, and say what you would ask the thermal analyst for.

**R5.** A vendor data sheet lists "$I_{sp}$: 65 s; thrust: 10 mN; minimum
impulse bit: 50 μN·s; expansion ratio: 100:1." Estimate the throat
Reynolds number implied and state whether the $I_{sp}$, the $\varepsilon$,
or both are inconsistent with the rest of the sheet. What plenum pressure
would you need to make the numbers close?

### Mini trade study

**T1.** A 12U smallsat in LEO needs **220 N·s** of total impulse for drag
make-up and momentum dumping over a 4-year mission, in pulses no larger
than $5\times10^{-4}$ N·s, from a module of no more than **1.2 kg wet** and
**1.2 L**. It launches as a rideshare, so the launch provider imposes a
strong preference against stored energy above 10 bar. Four options:

- **A.** GN₂ at 250 bar in a Ti COPV, regulated to 5 bar.
- **B.** GN₂ at 25 bar in an aluminium tank, unregulated blowdown to 5 bar.
- **C.** R-236fa self-pressurising at 2.7 bar, unregulated.
- **D.** n-butane self-pressurising at 2.6 bar, unregulated, with a heated
  vaporiser plenum (adds 60 g and 2 W when firing).

Size each option (propellant mass, tank volume, tank mass, delivered
$I_{sp}$ including a Reynolds-number estimate, delivered total impulse,
minimum impulse bit). Recommend one and justify it against the mass, volume
and launch-safety constraints. State explicitly which constraint binds for
each option, and what you would have to measure to retire the largest
uncertainty in your recommendation.

---

## 11. Quiz (100 points)

**Q1 (8).** For nitrogen at 293.15 K, compute $\Gamma$ and $c^*$ to four
significant figures.

**Q2 (8).** Multiple choice. Ignoring the compressibility factor when
sizing a 250 bar nitrogen tank at 300 K makes the predicted stored mass:
(a) about 13 % low; (b) about 13 % high; (c) about 5 % low; (d) correct to
better than 1 %, since $Z\to1$ at high pressure.

**Q3 (12).** A cold-gas thruster has $V=0.30$ L, $p_i=18$ bar,
$T_i=293.15$ K, $D_t=0.18$ mm, nitrogen, isothermal. Compute the blowdown
time constant and the time to fall to 6 bar.

**Q4 (8).** Multiple choice. In an adiabatic blowdown to the same final
pressure, compared with an isothermal one, the usable mass fraction is:
(a) larger, because the gas is denser and more mass leaves; (b) smaller,
because the gas is denser and more mass is stranded; (c) identical, since
$\phi$ depends only on the pressure ratio; (d) larger, because $I_{sp}$
falls so more mass must be expelled.

**Q5 (12).** A 2.0 mN nitrogen thruster runs at $p_0=3.0$ bar,
$T_0=293.15$ K, $\varepsilon=50$. Compute $D_t$, $\dot m$ and $Re_t$, and
estimate the delivered $I_{sp}$ using Eq. 3.12 with $b=10$ and a 15° cone.

**Q6 (8).** Multiple choice. A thruster with $\tau_f=4$ ms and
$\tau_e=2$ ms commanded for 3 ms will deliver an impulse bit that is:
(a) greater than $Ft_{on}$; (b) less than $Ft_{on}$; (c) exactly
$Ft_{on}$; (d) indeterminate without the dead time.

**Q7 (10).** Judgment. A programme wants to raise the expansion ratio of a
flight-qualified 1 mN CubeSat thruster from 30:1 to 80:1 to "recover
$I_{sp}$." The throat is 55 μm. In three sentences, say what you expect to
happen and what you would propose instead.

**Q8 (12).** A helium leak specification of $2\times10^{-5}$ std cm³/s is
applied to a module holding 60 g of nitrogen for 6 years. Compute the loss
in grams and as a percentage of the load under molecular scaling. State the
one assumption in your answer that could change it by a factor of ~3.

**Q9 (10).** Judgment. You are given two candidate architectures for a 3U
CubeSat requiring 90 N·s: a 200 bar GN₂ blowdown system and a 2.7 bar
R-236fa system. Both close on paper. Give the two questions you would ask
the mission systems engineer before choosing, and say which way each answer
would push you.

**Q10 (12).** A regulator drops 200 bar to 6 bar on nitrogen with
$\mu_{JT}\approx0.15$ K/bar. Estimate the plenum temperature and the
resulting fractional change in $I_{sp}$ relative to a 293 K plenum. State
what you would do about it and what it would cost.

---

## 12. Further reading

- `[SB §7]` Sutton & Biblarz — the cold-gas and monopropellant sections for
  the standard treatment and the tabulated gas properties; read it for the
  system-level context, not for low-$Re$ nozzle physics, which it does not
  cover.
- `[Spisz65]` Spisz, Brinich & Jack, *Thrust Coefficients of Low-Thrust
  Nozzles*, NASA TN D-3056 — the primary data set behind every
  low-Reynolds-number nozzle correlation in this module. Read the $C_F$
  versus $Re$ figures directly before using Eq. 3.12 in a design.
- `[Grisnik87]` Grisnik, Smith & Saltz, *Experimental Study of Low
  Reynolds Number Nozzles*, NASA TM-89858 / AIAA-87-0992 — the systematic
  sweep of area ratio and half-angle at low $Re$; the source for "optimum
  $\varepsilon$ falls as $Re$ falls."
- `[Rothe71]` Rothe, "Electron-Beam Studies of Viscous Flow in Supersonic
  Nozzles" — the measurement that shows there is no inviscid core below
  $Re_t\sim10^3$. Read it for the physical picture, not for a correlation.
- `[Bayt99]` Bayt, *Analysis, Fabrication and Testing of a MEMS-based
  Micropropulsion System*, MIT — the extension of the low-$Re$ picture to
  etched micronozzles, and the manufacturing constraints on a 50 μm throat.
- `[NASA-SOA]` NASA, *State of the Art of Small Spacecraft Technology*,
  in-space propulsion chapter — the current envelope of flown cold-gas
  hardware, with the two governing trades stated explicitly. Updated
  regularly; cite the edition.
- `[MarCO]` VACCO / JPL MarCO Micro CubeSat Propulsion System datasheet —
  the flight-proven self-pressurising refrigerant architecture. Vendor
  literature: performance figures are nominal, not flight-measured.
- `[SAFER95]` Meade, *First Flight Test Results of the SAFER Propulsion
  Unit*, NASA 1995 — a genuinely small, genuinely flown cold-gas system
  with published performance. The best available primary source for what a
  real short-pulse GN₂ thruster delivers.
- `[NIST-WB]` / `[REFPROP]` NIST Chemistry WebBook and REFPROP — for $Z$,
  $\mu$, $\mu_{JT}$ and saturation data. Do not size a flight tank without
  one of them.
- `[Anderson-MCF]` Anderson, *Modern Compressible Flow* — for the
  quasi-1-D relations of §3.5 and §3.6 derived properly, and for the
  boundary-layer displacement argument behind Eq. 3.12.
