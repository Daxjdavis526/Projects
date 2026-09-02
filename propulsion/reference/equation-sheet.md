# Equation Sheet

Every governing equation used in PROPULSION, in module order, with variables and
SI units, physical meaning, assumptions, failure modes, epistemic tag, and the
`tools/rocket.py` function that evaluates it where one exists.

**Numbering.** Each entry is tagged `MM-E.N` where `MM` is the module number
(01–36) and `E.N` is that module's own equation number, so `09-3.4` is Eq. 3.4
of Module 09. Follow the reference back into the module text for the derivation
and the worked example.

**Units.** SI throughout, as in the course. $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. Where a formula is customarily written
with US customary units (burn-rate coefficients, `Ns` for pumps, `psi` heads)
the entry says so explicitly — those are the equations that bite.

**Epistemic tags** (course convention, `README.md`):

| tag | meaning |
|---|---|
| **[F]** | fundamental: derivable from conservation laws or thermodynamics |
| **[E]** | empirical correlation: fitted to data, valid inside a stated range |
| **[A]** | approximation: a simplification whose error you should be able to estimate |
| **[J]** | engineering judgment: a defensible choice, not a derivation |

A single equation may carry more than one tag: an exact relation applied under a
simplifying assumption is `[F] [A]`; a correlation whose constant is chosen by
house practice is `[E] [J]`.

**Aliases.** The same physics is written with different symbols in different
modules — $c$ and $I_{sp,m}$, $u_e$ and $V_e$ and $c_e$, $\varepsilon$ and
$A_e/A_t$, $p_c$ and $p_0$ and $p_{0,t}$. Where two modules write the same
equation differently, the entry carries an **Alias** line. §VI collects the
systematic ones.

---

## Index

| § | contents |
|---|---|
| [I](#part-i--foundations-modules-0104) | Foundations — modules 01–04 |
| [II](#part-ii--bipropellant-liquid-engines-modules-0518) | Bipropellant liquid engines — modules 05–18 |
| [III](#part-iii--solid-rocket-motors-modules-1927) | Solid rocket motors — modules 19–27 |
| [IV](#part-iv--cold-gas-thrusters-modules-2831) | Cold-gas thrusters — modules 28–31 |
| [V](#part-v--cross-system-modules-3236) | Cross-system — modules 32–36 |
| [VI](#vi--dimensionless-groups) | Dimensionless groups |
| [VII](#vii--constants-and-conversions) | Constants and conversions |

### Modules

| # | module | equations |
|---|---|---|
| 01 | [Thermodynamics for propulsion](#module-01--thermodynamics-for-propulsion) | 3.1–3.18 |
| 02 | [Compressible flow and nozzles](#module-02--compressible-flow-and-nozzles) | 3.1–3.24 |
| 03 | [Rocket performance](#module-03--rocket-performance-thrust-c-c_f-i_sp) | 3.1–3.15 |
| 04 | [Thermochemistry and CEA](#module-04--thermochemistry-and-cea) | 3.1–3.9 |
| 05 | [Propellants](#module-05--propellants) | — |
| 06 | [Combustion chambers](#module-06--combustion-chambers) | — |
| 07 | [Injectors](#module-07--injectors) | — |
| 08 | [Ignition systems](#module-08--ignition-systems) | — |
| 09 | [Nozzles](#module-09--nozzles) | — |
| 10 | [Heat transfer](#module-10--heat-transfer) | — |
| 11 | [Cooling systems](#module-11--cooling-systems) | — |
| 12 | [Feed systems and turbopumps](#module-12--feed-systems-and-turbopumps) | — |
| 13 | [Engine cycles](#module-13--engine-cycles) | — |
| 14 | [Valves and plumbing](#module-14--valves-plumbing-and-engine-hardware) | — |
| 15 | [Combustion instability](#module-15--combustion-instability) | — |
| 16 | [Structures and materials](#module-16--structures-and-materials) | — |
| 17 | [Manufacturing](#module-17--manufacturing) | — |
| 18 | [Testing and instrumentation](#module-18--engine-testing-and-instrumentation) | — |
| 19 | [Solid propellant fundamentals](#module-19--solid-propellant-fundamentals) | — |
| 20 | [Combustion and burn rate](#module-20--combustion-and-burn-rate) | — |
| 21 | [Grain geometry](#module-21--grain-geometry) | — |
| 22 | [Motor cases](#module-22--motor-cases) | — |
| 23 | [Insulation and liners](#module-23--insulation-and-liners) | — |
| 24 | [Solid rocket nozzles](#module-24--solid-rocket-nozzles) | — |
| 25 | [Solid rocket manufacturing](#module-25--solid-rocket-manufacturing) | — |
| 26 | [Historical large solid motors](#module-26--historical-large-solid-motors) | — |
| 27 | [Modern defense propulsion](#module-27--modern-defense-propulsion-engineering) | — |
| 28 | [Cold-gas principles](#module-28--cold-gas-principles) | — |
| 29 | [Cold-gas performance modeling](#module-29--cold-gas-performance-modeling) | — |
| 30 | [Cold-gas hardware](#module-30--cold-gas-hardware) | — |
| 31 | [Real cold-gas systems](#module-31--real-cold-gas-systems) | — |
| 32 | [Liquid vs solid vs cold gas](#module-32--liquid-vs-solid-vs-cold-gas) | — |
| 33 | [Systems engineering](#module-33--systems-engineering-for-propulsion) | — |
| 34 | [Failure case studies](#module-34--failure-case-studies) | — |
| 35 | [Historical evolution](#module-35--historical-evolution) | — |
| 36 | [Modern engineering methods](#module-36--modern-engineering-methods) | — |

---

# Part I — Foundations (modules 01–04)

## Module 01 — Thermodynamics for Propulsion

### 01-3.1 — Conservation of mass (steady control volume)

$$\frac{d}{dt}\int_{CV}\rho\,dV + \oint_{CS}\rho(\mathbf{V}\!\cdot\!\mathbf{n})\,dA = 0
\quad\Longrightarrow\quad \dot m = \rho_1 V_1 A_1 = \rho_2 V_2 A_2$$

- **Variables** — $\rho$ density [kg/m³]; $V$ velocity normal to the area [m/s]; $A$ area [m²]; $\dot m$ mass flow [kg/s].
- **Meaning** — mass is neither created nor destroyed, so the flux through every station of a duct is the same.
- **Assumes** — steady flow; one-dimensional (uniform) properties across each station; no mass addition through the walls.
- **Fails when** — film cooling or gas-generator exhaust is injected downstream of the injector (the F-1 dumps turbine exhaust into the nozzle extension, so exit-plane $\dot m \neq$ throat $\dot m$); boundary-layer blockage spoils the 1-D assumption near the throat; during transients.
- **Tag** [F] · **Code** —

### 01-3.2 — Thrust equation (momentum theorem on the whole engine)

$$F = \dot m V_e + (p_e - p_a)A_e$$

- **Variables** — $F$ thrust [N]; $\dot m$ propellant mass flow [kg/s]; $V_e$ mass-averaged axial exit velocity [m/s]; $p_e$ exit-plane static pressure [Pa]; $p_a$ ambient pressure [Pa]; $A_e$ exit area [m²].
- **Meaning** — thrust is the rate at which the engine throws momentum backwards, plus a pressure term that exists only because the nozzle is finite.
- **Assumes** — steady, one-dimensional exit flow; uniform $p_e$ across the exit plane; negligible inlet momentum; $p_a$ uniform over the external surface.
- **Fails when** — flow separates inside the nozzle (then $p_e$ is not the wall pressure and $A_e$ is not the geometric exit area, Module 09); the exit flow is strongly non-uniform or has significant radial velocity (divergence loss); air-breathing engines, where inlet momentum is the whole game.
- **Tag** [F] · **Code** `thrust(mdot, ve, pe, pa, Ae)`
- **Alias** — identical to 02-3.23 and 03-3.2; Module 03 writes $u_e$ for $V_e$.

### 01-3.3 — Steady-flow energy equation (SFEE)

$$q - w_s = \left(h_2 + \frac{V_2^2}{2}\right) - \left(h_1 + \frac{V_1^2}{2}\right) = h_{0,2} - h_{0,1}$$

- **Variables** — $q$ heat added per unit mass [J/kg]; $w_s$ shaft work extracted per unit mass [J/kg]; $h$ static enthalpy [J/kg]; $V$ velocity [m/s]; $h_0 = h + V^2/2$ stagnation enthalpy [J/kg].
- **Meaning** — whatever heat you add and work you do not extract shows up as stagnation enthalpy.
- **Assumes** — steady; adiabatic walls unless $q$ is retained; single inlet/outlet; uniform properties at each station; negligible potential energy.
- **Fails when** — the flow is unsteady (acoustic instability, start transient); mass is added between stations with a different $h_0$ (film cooling, turbine-exhaust dump).
- **Tag** [F] · **Code** —

### 01-3.4 — Stagnation enthalpy conserved through a nozzle

$$h_0 = h + \frac{V^2}{2} = \text{constant through the nozzle}$$

- **Variables** — as 01-3.3.
- **Meaning** — a nozzle converts enthalpy to kinetic energy at constant total.
- **Assumes** — adiabatic, no shaft work, steady, no mass addition. It does **not** assume reversibility: it holds across friction, across a shock, across a reacting region.
- **Fails when** — wall heat flux is a significant fraction of the enthalpy flux (small thrusters with high surface-to-volume ratio; radiation-cooled chambers at low $\dot m$); film coolant with a different $h_0$ mixes in.
- **Tag** [F] · **Code** —
- **Alias** — 02-3.1 writes the same statement as $h + \tfrac12 V^2 = h_0 = \mathrm{const}$.

### 01-3.5 — Entropy generation from stagnation-pressure loss

$$s_{gen} = -R\ln\frac{p_{0,2}}{p_{0,1}}$$

- **Variables** — $s_{gen}$ entropy generated per unit mass [J/(kg·K)]; $R$ specific gas constant [J/(kg·K)]; $p_0$ stagnation pressure [Pa].
- **Meaning** — in adiabatic flow, stagnation-pressure loss *is* irreversibility; the two are the same statement in different units.
- **Assumes** — adiabatic, steady, ideal gas, constant composition (or a consistent multi-component entropy).
- **Fails when** — heat is added or removed (then $T_0$ changes and both terms survive); across a reacting region, where composition change contributes an entropy of mixing.
- **Tag** [F] · **Code** —
- **Alias** — 02-3.8 writes it as $\Delta s$.

### 01-3.6 — Isentropic stagnation temperature ratio

$$\frac{T_0}{T} = 1 + \frac{\gamma-1}{2}M^2$$

- **Variables** — $T_0$ stagnation temperature [K]; $T$ static temperature [K]; $M$ Mach number [—]; $\gamma$ ratio of specific heats [—].
- **Meaning** — the temperature rise from stopping the flow.
- **Assumes** — adiabatic, calorically perfect gas. (Reversibility is *not* required.)
- **Fails when** — $c_p$ varies appreciably between $T$ and $T_0$; in a rocket nozzle at $M = 4.5$ that is a 15–20 % effect on $c_p$, and $h_0 = h + V^2/2$ with tabulated $h(T)$ should be used instead.
- **Tag** [F] · **Code** `T0_over_T(gamma, Mach)`
- **Alias** — 02-3.5, identical.

### 01-3.7 — Isentropic stagnation pressure and density ratios

$$\frac{p_0}{p} = \left(\frac{T_0}{T}\right)^{\frac{\gamma}{\gamma-1}} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}},
\qquad
\frac{\rho_0}{\rho} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{1}{\gamma-1}}$$

- **Variables** — as 01-3.6, plus $p_0$ stagnation pressure [Pa]; $p$ static pressure [Pa]; $\rho_0,\rho$ densities [kg/m³].
- **Meaning** — the pressure and density recovered by stopping the flow isentropically.
- **Assumes** — calorically perfect gas, and that the *definition* of the stagnation state uses an isentropic deceleration even when the real flow is not isentropic.
- **Fails when** — used as a conserved quantity. $p_0$ is a *local* property, constant only in isentropic flow.
- **Tag** [F] · **Code** `p0_over_p(gamma, Mach)`
- **Alias** — 02-3.6, 02-3.7.

### 01-3.8 — Injector-face to throat-stagnation pressure ratio (Rayleigh-type chamber loss)

$$\frac{p_{0,2}}{p_{inj}} = \frac{\left(1 + \frac{\gamma-1}{2}M_2^2\right)^{\frac{\gamma}{\gamma-1}}}{1 + \gamma M_2^2}$$

- **Variables** — $p_{inj}$ injector-face pressure [Pa]; $p_{0,2}$ stagnation pressure at chamber exit / nozzle entrance [Pa]; $M_2$ chamber-exit Mach number [—], set by $\varepsilon_c$ through the isentropic area relation.
- **Meaning** — the stagnation-pressure penalty for burning in a finite-area chamber; the reason a published $p_c$ must state its measurement station.
- **Assumes** — constant area, frictionless walls, all heat release complete by station 2, one-dimensional, calorically perfect.
- **Fails when** — the chamber is convergent (many small thrusters); a large fraction of heat release occurs in the convergent section; $\varepsilon_c$ so low that $M_2 \gtrsim 0.4$ and the 1-D treatment is poor.
- **Tag** [F] [J] · **Code** —

### 01-3.9 — Ideal-gas specific-heat relations

$$R = \frac{R_u}{\mathcal{M}},\qquad c_p - c_v = R,\qquad \gamma = \frac{c_p}{c_v},\qquad c_p = \frac{\gamma R}{\gamma-1},\qquad c_v = \frac{R}{\gamma-1}$$

- **Variables** — $R$ specific gas constant [J/(kg·K)]; $R_u = 8314.46$ [J/(kmol·K)]; $\mathcal{M}$ molar mass [kg/kmol]; $c_p, c_v$ specific heats [J/(kg·K)]; $\gamma$ [—].
- **Meaning** — two numbers, $\mathcal{M}$ and $\gamma$, fix the entire thermodynamic behaviour of an ideal gas.
- **Assumes** — ideal gas; $c_p$ evaluated at the relevant temperature.
- **Fails when** — $Z \neq 1$; the composition is shifting, in which case $\mathcal{M}$ is itself a function of state.
- **Tag** [F] · **Code** `R_specific(M)`

### 01-3.10 — Dalton's law and mole fractions

$$p = \sum_i p_i,\qquad p_i = x_i\,p,\qquad x_i = \frac{n_i}{\sum_j n_j}$$

- **Variables** — $p_i$ partial pressure of species $i$ [Pa]; $x_i$ mole fraction [—]; $n_i$ moles [mol or kmol].
- **Meaning** — for an ideal-gas mixture, mole fraction and pressure fraction are the same thing.
- **Assumes** — ideal gas; no intermolecular interaction between species.
- **Fails when** — $Z \neq 1$; a dense supercritical mixture near a critical locus (relevant to injection, Module 07).
- **Tag** [F] · **Code** —

### 01-3.11 — Mixture gas constant and frozen $\gamma$

$$R = \frac{R_u}{\mathcal{M}},\qquad \gamma = \frac{c_p}{c_p - R}$$

- **Variables** — $\mathcal{M}$ mixture molar mass [kg/kmol]; $\mathcal{M}_i$ species molar mass [kg/kmol]; $x_i$ mole fraction [—]; $Y_i$ mass fraction [—]; $\bar c_{p,i}$ molar specific heat [J/(mol·K)].
- **Meaning** — mixture properties are mole-weighted on a molar basis and mass-weighted on a mass basis; mixing the two bases is the classic error.
- **Assumes** — ideal-gas mixture, each species at the mixture temperature.
- **Fails when** — composition shifts with state; the $\gamma$ from this formula is then the **frozen** $\gamma$, which is *not* the isentropic exponent of the reacting mixture (see 04-3.8).
- **Tag** [F] · **Code** `R_specific(M)`

### 01-3.12 — Absolute enthalpy on a formation scale

$$H_i(T) = \Delta_f H^\circ_i + \left[H_i(T) - H_i(298.15)\right]$$

- **Variables** — $H_i(T)$ absolute molar enthalpy [J/mol]; $\Delta_f H^\circ_i$ standard enthalpy of formation at 298.15 K, 1 bar [J/mol]; bracket = sensible enthalpy increment [J/mol].
- **Meaning** — one consistent enthalpy scale on which chemical and thermal energy can be added.
- **Assumes** — ideal gas; standard state 1 bar.
- **Fails when** — the species is a condensed phase (include the phase-change enthalpy explicitly — Al₂O₃ in solid motors, Module 20); the propellant enters as a cryogenic liquid rather than a 298 K gas.
- **Tag** [F] · **Code** —

### 01-3.13 — Adiabatic flame temperature energy balance

$$\sum_{prod} n_j \left[\Delta_f H^\circ_j + \int_{298}^{T_{ad}}\bar c_{p,j}\,dT\right]
= \sum_{react} n_i \left[\Delta_f H^\circ_i + \int_{298}^{T_{in}}\bar c_{p,i}\,dT\right]$$

- **Variables** — $n$ moles [mol]; $T_{ad}$ adiabatic flame temperature [K]; $T_{in}$ reactant inlet temperature [K]; $\bar c_p$ molar specific heat [J/(mol·K)].
- **Meaning** — all chemical energy released goes into heating the products; solve implicitly for $T_{ad}$.
- **Assumes** — adiabatic (no wall heat loss), constant pressure, complete specified reaction, negligible kinetic energy at both stations.
- **Fails when** — the product set is assumed rather than computed; neglecting dissociation makes the answer too high, badly so above ~2500 K.
- **Tag** [F] · **Code** —
- **Alias** — 04-3.4, written per kmol with $\Delta_f h^\circ$.

### 01-3.14 — Gibbs energy and chemical potential

$$G = \sum_i n_i \mu_i,\qquad \mu_i = \mu_i^\circ(T) + R_u T \ln\frac{p_i}{p^\circ}$$

- **Variables** — $G$ Gibbs free energy [J]; $n_i$ moles of species $i$ [mol]; $\mu_i$ chemical potential [J/mol]; $\mu_i^\circ$ standard-state chemical potential [J/mol]; $p_i$ partial pressure [Pa]; $p^\circ = 1$ bar.
- **Meaning** — the equilibrium composition is the one that cannot lower $G$ by any element-conserving reshuffle. This is what CEA minimises.
- **Assumes** — ideal-gas mixture; constant $T$ and $p$; sufficient time to equilibrate.
- **Fails when** — residence time is short compared with reaction times (Module 04); condensed phases must be included with their own chemical potentials.
- **Tag** [F] · **Code** —

### 01-3.15 — Equilibrium constant $K_p$

$$K_p(T) = \prod_i \left(\frac{p_i}{p^\circ}\right)^{\nu_i} = \exp\!\left(-\frac{\Delta G^\circ(T)}{R_u T}\right)$$

- **Variables** — $K_p$ [—]; $\nu_i$ stoichiometric coefficients, positive for products [—]; $\Delta G^\circ$ standard Gibbs energy change of reaction [J/mol]; $p^\circ = 1$ bar.
- **Meaning** — $K_p$ is a pure function of temperature; pressure enters only through the partial pressures.
- **Assumes** — ideal gas, single reaction, standard state 1 bar.
- **Fails when** — several coupled equilibria matter simultaneously, which is the usual case in a rocket chamber; use Gibbs minimisation instead.
- **Tag** [F] · **Code** —
- **Alias** — 04-3.6, identical (Module 04 uses J/kmol and quotes $p_i$ in bar).

### 01-3.16 — Degree of dissociation scales as $p^{-1/3}$

$$\alpha \approx \left(\sqrt2\,K_p\right)^{2/3}\left(\frac{p}{p^\circ}\right)^{-1/3}$$

- **Variables** — $\alpha$ degree of dissociation [—]; $K_p$ equilibrium constant at the local temperature [—]; $p$ pressure [Pa or bar, consistently with $p^\circ$].
- **Meaning** — dissociation falls as the cube root of pressure — the reason raising $p_c$ buys back flame temperature.
- **Assumes** — single reaction, pure H₂O feed, $\alpha \ll 1$, ideal gas.
- **Fails when** — $\alpha \gtrsim 0.15$ (the small-$\alpha$ form then errs by ~10 % or more); excess fuel or oxidiser shifts the equilibrium by a common-ion effect — a fuel-rich mixture dissociates far less H₂O than this predicts.
- **Tag** [A] · **Code** —

### 01-3.17 — Chamber-temperature saturation with pressure

$$T_c(p) \approx T_{c,\infty} - k\,p^{-1/3}$$

- **Variables** — $T_c$ chamber temperature [K]; $T_{c,\infty}$ no-dissociation flame temperature [K]; $k$ propellant-dependent constant [K·Pa$^{1/3}$].
- **Meaning** — chamber temperature approaches the no-dissociation value from below as $p^{-1/3}$, so it *saturates*: doubling $p_c$ does not double the thermodynamic benefit. A scaling, not a design equation.
- **Assumes** — dissociation dominated by a single mole-increasing equilibrium; fixed mixture ratio.
- **Fails when** — several dissociation equilibria with different $\Delta n$ compete; condensed phases appear or disappear over the pressure range.
- **Tag** [F] [J] · **Code** —

### 01-3.18 — Delivered $c^*$, ideal $c^*$, and combustion efficiency

$$c^*_{delivered} = \frac{p_{0,t}\,A_t}{\dot m},\qquad
\eta_{c^*} = \frac{c^*_{delivered}}{c^*_{ideal}},\qquad
c^*_{ideal} = \frac{\sqrt{R T_0}}{\Gamma(\gamma)},\quad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $p_{0,t}$ **throat stagnation** pressure [Pa]; $A_t$ throat area [m²]; $\dot m$ total propellant mass flow [kg/s]; $R$ [J/(kg·K)] and $T_0$ [K] from the assumed combustion model; $\Gamma$ Vandenkerckhove function [—].
- **Meaning** — how close the combustor comes to releasing all the chemical energy and delivering it as a fully mixed equilibrium gas at the throat.
- **Assumes** — choked throat, one-dimensional flow, known $A_t$, and a correct and *stated* reference model.
- **Fails when** — $A_t$ has eroded or thermally grown (solid motors, ablative chambers); $\dot m$ omits film coolant or turbine exhaust; $p_c$ is the injector-face value rather than throat stagnation; the reference $c^*_{ideal}$ uses a different chemistry assumption than you think.
- **Tag** [F] · **Code** `c_star(gamma, R, T0)`, `gamma_function(gamma)`
- **Alias** — 03-3.8 and 04-3.1 write the ideal form; $\Gamma(\gamma)$ is the Vandenkerckhove function throughout.

---

## Module 02 — Compressible Flow and Nozzles

### 02-3.1 — Energy equation for a nozzle

$$h + \tfrac{1}{2}V^2 = h_0 = \text{const}$$

- **Variables** — $h$ static specific enthalpy [J/kg]; $V$ velocity [m/s]; $h_0$ stagnation enthalpy [J/kg].
- **Meaning** — every joule of kinetic energy comes out of enthalpy; a nozzle is an enthalpy-to-velocity converter and nothing else.
- **Assumes** — steady, adiabatic, no body forces, no shaft work.
- **Fails when** — heat is added or removed (film-cooled walls, afterburning of a fuel-rich plume); chemistry releases energy during the expansion, so $h_0$ drifts and the reacting-flow treatment of Module 04 is needed.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.4.

### 02-3.2 — Speed of sound, thermodynamic definition

$$a = \sqrt{\left(\frac{\partial p}{\partial \rho}\right)_s}$$

- **Variables** — $a$ [m/s]; $p$ [Pa]; $\rho$ [kg/m³]; $s$ specific entropy [J/(kg·K)].
- **Meaning** — sound speed is set by how stiff the fluid is to isentropic compression.
- **Assumes** — infinitesimal amplitude (hence reversible), adiabatic, no dispersion.
- **Fails when** — the disturbance is finite: a shock is a *finite*, irreversible compression that travels faster than $a$. Also fails in two-phase flow, where $(\partial p/\partial\rho)_s$ collapses and sound speeds of tens of m/s occur.
- **Tag** [F] · **Code** —

### 02-3.3 — Speed of sound, perfect gas

$$a = \sqrt{\gamma R T} = \sqrt{\gamma R_u T/\mathcal{M}}$$

- **Variables** — $\gamma$ [—]; $R$ [J/(kg·K)]; $T$ static temperature [K]; $\mathcal{M}$ molar mass [kg/kmol].
- **Meaning** — sound speed depends only on local *static* temperature and composition, not on pressure.
- **Assumes** — thermally and calorically perfect gas, single phase, equilibrium composition.
- **Fails when** — the gas is dissociating (effective $\gamma$ and $\mathcal{M}$ both change through the nozzle); condensed phase is present (Al₂O₃ in a solid motor, Module 24).
- **Tag** [F] · **Code** `a_sound(gamma, R, T)`

### 02-3.4 — Mach angle

$$\mu = \arcsin\frac{1}{M}$$

- **Variables** — $\mu$ Mach angle [rad]; $M$ Mach number [—].
- **Meaning** — the angle at which weak (Mach) waves lean back in a supersonic stream; the steeper the wave, the lower the Mach number.
- **Assumes** — steady uniform supersonic flow; infinitesimal disturbance.
- **Fails when** — the disturbance is finite (it steepens into an oblique shock at $\beta > \mu$); $M \le 1$.
- **Tag** [F] · **Code** —

### 02-3.5 — Stagnation temperature ratio, derived

$$\frac{T_0}{T} = 1 + \frac{V^2}{2c_pT} = 1 + \frac{\gamma-1}{2}M^2$$

- **Variables** — $T_0$, $T$ [K]; $M$ [—]; $\gamma$ [—]; $c_p$ [J/(kg·K)]; $V$ [m/s].
- **Meaning** — the temperature the flow would recover if stopped; a measure of how much thermal energy has become kinetic.
- **Assumes** — adiabatic, calorically perfect gas. **Does not assume reversibility** — $T_0$ is conserved across a shock, across friction, across anything adiabatic.
- **Fails when** — heat is added or removed; $c_p$ varies strongly with $T$ (in a real rocket nozzle $c_p$ falls 10–20 % from chamber to exit).
- **Tag** [F] · **Code** `T0_over_T(gamma, Mach)`
- **Alias** — 01-3.6.

### 02-3.6, 02-3.7 — Isentropic pressure and density ratios

$$\frac{p_0}{p} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}}
\qquad
\frac{\rho_0}{\rho} = \left(1 + \frac{\gamma-1}{2}M^2\right)^{\frac{1}{\gamma-1}}$$

- **Variables** — as 02-3.5; $p$ [Pa]; $\rho$ [kg/m³].
- **Meaning** — the pressure and density a station would recover on isentropic stagnation.
- **Assumes** — adiabatic **and reversible**, calorically perfect gas.
- **Fails when** — entropy is generated: across a shock, in a separated region, in a boundary layer, in a strongly non-equilibrium expansion. $p_0$ is the quantity that *records* irreversibility — it falls while $T_0$ stays put.
- **Tag** [F] · **Code** `p0_over_p(gamma, Mach)`
- **Alias** — 01-3.7.

### 02-3.8 — Entropy rise from stagnation-pressure loss

$$\Delta s = -R\ln\frac{p_{0,2}}{p_{0,1}}$$

- **Variables** — $\Delta s$ [J/(kg·K)]; $p_0$ [Pa]; $R$ [J/(kg·K)].
- **Meaning** — stagnation-pressure ratio *is* entropy generation in disguise.
- **Assumes** — adiabatic ($T_{0,1} = T_{0,2}$), perfect gas.
- **Fails when** — heat is exchanged, so $T_0$ changes too and the full Gibbs relation is needed.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.5.

### 02-3.9 — Area–velocity relation

$$\frac{dA}{A} = \left(M^2 - 1\right)\frac{dV}{V}$$

- **Variables** — $A$ area [m²]; $V$ velocity [m/s]; $M$ [—].
- **Meaning** — whether opening the duct accelerates or decelerates the flow depends entirely on the sign of $M^2-1$. This is why a supersonic nozzle must be convergent–divergent.
- **Assumes** — steady, quasi-1-D, isentropic, frictionless, no heat addition, no mass addition.
- **Fails when** — the wall boundary layer is thick (an effective-area correction is needed); mass is added (film cooling, turbine-exhaust dump as on the F-1); across a shock.
- **Tag** [F] · **Code** —

### 02-3.10 — Choked mass flow

$$\dot m = \frac{p_0 A_t}{\sqrt{R T_0}}\,\Gamma(\gamma),
\qquad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $\dot m$ [kg/s]; $p_0$ [Pa]; $A_t$ [m²]; $R$ [J/(kg·K)]; $T_0$ [K]; $\Gamma$ [—].
- **Meaning** — a choked throat is a mass-flow metering device set by the stagnation state and throat area alone, independent of everything downstream.
- **Assumes** — choked ($p_0/p_b$ above the critical ratio), perfect gas, uniform 1-D throat flow, no boundary layer.
- **Fails when** — the discharge coefficient departs from 1 — real throats pass 0.97–0.99 of this because of wall boundary layer and throat curvature; the throat erodes (solid motors, Module 24) so $A_t$ is not constant.
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`
- **Alias** — 03-3.7; $\Gamma$ is the Vandenkerckhove function.

### 02-3.11 — Area–Mach relation

$$\frac{A}{A^*} = \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $A$ local area [m²]; $A^*$ sonic (throat) area [m²]; $M$ [—]; $\gamma$ [—].
- **Meaning** — geometry alone fixes the Mach number of an isentropic flow; there is one subsonic and one supersonic root for each area ratio.
- **Assumes** — isentropic, quasi-1-D, calorically perfect, choked (so $A^* = A_t$).
- **Fails when** — a shock has occurred upstream (then $A^*$ jumps); the flow has separated (effective $A$ is the separated jet's area, not the wall's); the boundary layer is a significant fraction of the radius.
- **Tag** [F] · **Code** `area_ratio(gamma, Mach)`; invert with `mach_from_area_ratio(gamma, eps, supersonic)`
- **Alias** — $A/A^* = \varepsilon$ when evaluated at the exit plane.

### 02-3.12 — Normal shock, downstream Mach number

$$M_2^2 = \frac{1+\frac{\gamma-1}{2}M_1^2}{\gamma M_1^2 - \frac{\gamma-1}{2}}$$

- **Variables** — $M_1$, $M_2$ [—]; $\gamma$ [—].
- **Meaning** — the downstream Mach number of a normal shock, always $<1$ for $M_1>1$.
- **Assumes** — steady, adiabatic, constant-area, perfect gas, no body forces.
- **Fails when** — the gas dissociates or vibrationally relaxes across the shock (real rocket exhaust at $M>4$ does, and the perfect-gas result then overpredicts $T_2$); the "shock" is really a thick separation-induced compression system.
- **Tag** [F] · **Code** `normal_shock_M2(gamma, M1)`

### 02-3.13 — Normal shock, static pressure ratio

$$\frac{p_2}{p_1} = 1 + \frac{2\gamma}{\gamma+1}\left(M_1^2-1\right)$$

- **Variables** — $p_1, p_2$ static pressures [Pa]; $M_1$ [—]; $\gamma$ [—].
- **Meaning** — shock strength grows roughly as $M_1^2$; an $M_1 = 4.7$ shock compresses by a factor of ~24.
- **Assumes** — as 02-3.12.
- **Fails when** — as 02-3.12. Note this is *static* pressure; the stagnation pressure moves the other way.
- **Tag** [F] · **Code** `normal_shock_p2_p1(gamma, M1)`

### 02-3.14, 02-3.15 — Normal shock, density and temperature ratios

$$\frac{\rho_2}{\rho_1} = \frac{(\gamma+1)M_1^2}{(\gamma-1)M_1^2+2},
\qquad
\frac{T_2}{T_1} = \frac{p_2/p_1}{\rho_2/\rho_1}$$

- **Variables** — $\rho$ [kg/m³]; $T$ [K]; $M_1$ [—]; $\gamma$ [—].
- **Meaning** — the density ratio saturates at $(\gamma+1)/(\gamma-1) = 11$ for $\gamma = 1.2$ however strong the shock, while the temperature ratio grows without bound. That saturation is why hypersonic shock layers are thin and hot.
- **Assumes** — as 02-3.12.
- **Fails when** — as 02-3.12.
- **Tag** [F] · **Code** —

### 02-3.16, 02-3.17 — Oblique shock relations

$$\frac{p_2}{p_1} = 1+\frac{2\gamma}{\gamma+1}\left(M_1^2\sin^2\beta - 1\right),
\qquad
M_2 = \frac{M_{n2}}{\sin(\beta-\theta)}$$

- **Variables** — $\beta$ wave angle [rad]; $\theta$ deflection angle [rad]; $M_{n1} = M_1\sin\beta$ normal component upstream [—]; $M_{n2}$ from 02-3.12 [—].
- **Meaning** — an oblique shock is a normal shock plus a ride-along tangential velocity; it compresses and turns without necessarily going subsonic.
- **Assumes** — straight, steady, planar (or locally planar) wave; perfect gas.
- **Fails when** — the wave is strongly curved (flow behind is then rotational); $\theta$ exceeds the maximum for that $M_1$ and the shock detaches into a bow shock.
- **Tag** [F] · **Code** —

### 02-3.18 — θ–β–M relation

$$\tan\theta = 2\cot\beta\,\frac{M_1^2\sin^2\beta-1}{M_1^2(\gamma+\cos 2\beta)+2}$$

- **Variables** — $\theta$ [rad]; $\beta$ [rad]; $M_1$ [—]; $\gamma$ [—].
- **Meaning** — for a given upstream Mach number and required turning angle there are two solutions, a weak shock (small $\beta$, supersonic downstream) and a strong shock (large $\beta$, subsonic downstream). Free jets take the weak one.
- **Assumes** — attached, straight, two-dimensional (or conical-equivalent) wave.
- **Fails when** — $\theta > \theta_{max}$ and the shock detaches; at $\theta = 0$ the solutions degenerate to $\beta = \mu$ (a Mach wave) and $\beta = 90°$ (a normal shock).
- **Tag** [F] · **Code** —

### 02-3.19 — Prandtl–Meyer function

$$\nu(M) = \sqrt{\frac{\gamma+1}{\gamma-1}}\arctan\sqrt{\frac{\gamma-1}{\gamma+1}(M^2-1)} - \arctan\sqrt{M^2-1}$$

- **Variables** — $\nu$ [rad]; $M$ [—]; $\gamma$ [—].
- **Meaning** — the angle through which a sonic flow must be turned to reach $M$ isentropically; the turn between two states is $\Delta\theta = \nu(M_2)-\nu(M_1)$. It is the backbone of method-of-characteristics nozzle design.
- **Assumes** — steady, isentropic, 2-D planar (the axisymmetric case needs characteristics), perfect gas.
- **Fails when** — the required turn exceeds $\nu_{max} = \frac{\pi}{2}\left(\sqrt{(\gamma+1)/(\gamma-1)}-1\right)$, which is 130.5° for $\gamma = 1.2$; beyond that a vacuum forms.
- **Tag** [F] · **Code** —

### 02-3.20 — Shock-cell (Mach diamond) spacing

$$L \approx 1.306\, D_e \sqrt{M_e^2 - 1}$$

- **Variables** — $L$ cell length [m]; $D_e$ exit diameter [m]; $M_e$ exit Mach number [—].
- **Meaning** — the axial wavelength of the shock-cell pattern in an imperfectly expanded plume.
- **Assumes** — slightly imperfectly expanded jet, weak waves, no mixing.
- **Fails when** — the pressure ratio is large (real first cells are longer than this); the shear layer grows quickly; always for the far cells, which mixing erases.
- **Tag** [E] [A] · **Code** —

### 02-3.21 — Summerfield separation criterion

$$p_{sep} \approx 0.4\,p_a$$

- **Variables** — $p_{sep}$ wall static pressure at separation [Pa]; $p_a$ ambient pressure [Pa].
- **Meaning** — the flow separates where the wall pressure has fallen to roughly 40 % of ambient.
- **Assumes** — conical nozzle, turbulent boundary layer, steady operation.
- **Fails when** — the nozzle is a thrust-optimised contour (restricted shock separation changes the answer entirely); at high chamber pressure; in transients. The constant is quoted anywhere from 0.25 to 0.45.
- **Tag** [E] · **Code** `summerfield_separation_pressure(p0, frac=0.4)`
- **Alias** — 03-3.12 states it as $p_e/p_a \gtrsim 0.4$ for attached flow.

### 02-3.22 — Schmucker separation criterion

$$\frac{p_{sep}}{p_a} = \left(1.88\,M_{sep} - 1\right)^{-0.64}$$

- **Variables** — $M_{sep}$ Mach number just upstream of separation [—]; $p_{sep}$ [Pa]; $p_a$ [Pa].
- **Meaning** — the higher the local Mach number, the lower the wall pressure the boundary layer can survive before separating — the physically sensible trend Summerfield lacks.
- **Assumes** — turbulent attached boundary layer, conical or near-conical wall, steady flow.
- **Fails when** — the contour is strongly thrust-optimised (restricted-shock-separation regime); during transients; outside the $M \approx 2$–5 range it was fitted on. Solve simultaneously with 02-3.11 and 02-3.6, since $M_{sep}$ and wall pressure are both functions of the same station.
- **Tag** [E] · **Code** `schmucker_separation(pa, Me)`
- **Alias** — 03-3.13, identical with $M_e$ for $M_{sep}$.

### 02-3.23 — Rocket thrust equation

$$F = \dot m V_e + (p_e - p_a)A_e$$

- **Variables** — $F$ [N]; $\dot m$ [kg/s]; $V_e$ [m/s]; $p_e$, $p_a$ [Pa]; $A_e$ [m²].
- **Meaning** — the pressure term is the net force from ambient pressure failing to act on the exit plane.
- **Assumes** — uniform, axial exit flow (quasi-1-D); attached flow to the exit.
- **Fails when** — the nozzle has separated: $A_e$ and $p_e$ are then those of the separated jet, not the hardware.
- **Tag** [F] · **Code** `thrust(mdot, ve, pe, pa, Ae)`
- **Alias** — 01-3.2, 03-3.2.

### 02-3.24 — Sea-level / vacuum $I_{sp}$ ratio

$$\frac{I_{sp,SL}}{I_{sp,vac}} = \frac{C_{F,SL}}{C_{F,vac}} = 1 - \frac{\varepsilon\, p_a}{p_0\,C_{F,vac}}$$

- **Variables** — $\varepsilon = A_e/A_t$ [—]; $p_a$ [Pa]; $p_0$ chamber stagnation pressure [Pa]; $C_F$ [—].
- **Meaning** — the whole sea-level $I_{sp}$ penalty is a single term, $\varepsilon p_a/p_0$. This is why high-$\varepsilon$ upper-stage nozzles cannot be flown at sea level.
- **Assumes** — same nozzle, attached flow, choked throat, $c^*$ unchanged with altitude (it is).
- **Fails when** — the nozzle separates at sea level, in which case real sea-level $I_{sp}$ is *higher* than predicted, because separation shortens the effective nozzle and removes the most negative part of the pressure integral.
- **Tag** [F] · **Code** —

---

## Module 03 — Rocket Performance: Thrust, c\*, $C_f$, $I_{sp}$

### 03-3.1 — Integral momentum theorem

$$\sum F_x = \oint_{CS} \rho\, u_x \,(\mathbf{u}\cdot \mathbf{\hat n})\, dA$$

- **Variables** — $\rho$ gas density [kg/m³]; $u_x$ axial velocity [m/s]; $\mathbf{\hat n}$ outward unit normal [—]; $dA$ area element [m²].
- **Meaning** — the net axial force on the control volume equals the net rate at which axial momentum leaves it. Thrust is a momentum-flux bookkeeping result, not a "push against the air".
- **Assumes** — steady state; fixed (non-accelerating) control volume; negligible axial body force.
- **Fails when** — the engine is starting, shutting down, or throttling fast enough that chamber gas mass changes appreciably; the unsteady term $\partial/\partial t\int\rho u_x dV$ is then not small, which is exactly why start-transient thrust traces overshoot and ring.
- **Tag** [F] · **Code** —

### 03-3.2 — The thrust equation

$$F = \dot m\, u_e + (p_e - p_a)\,A_e$$

- **Variables** — $F$ [N]; $\dot m$ [kg/s]; $u_e$ mass-averaged axial exit velocity [m/s]; $p_e$ exit static pressure [Pa]; $p_a$ ambient static pressure [Pa]; $A_e$ [m²].
- **Meaning** — thrust is momentum flux out of the nozzle plus the pressure imbalance on the exit plane.
- **Assumes** — steady flow; 1-D uniform exit conditions; propellant enters with negligible axial momentum; the entire external surface sees the same $p_a$.
- **Fails when** — the exit profile is strongly non-uniform (short bells, plug nozzles); the flow has separated inside the nozzle so "$A_e$" is not the flowing area; base-flow recirculation makes the pressure outside the nozzle differ from free-stream ambient.
- **Tag** [F] · **Code** `thrust(mdot, ve, pe, pa, Ae)`
- **Alias** — 01-3.2, 02-3.23. Module 03 uses $u_e$; Modules 01–02 use $V_e$.

### 03-3.3 — Marginal thrust of the last ring of nozzle

$$\frac{dF}{dA_e} = p_e - p_a$$

- **Variables** — $F$ [N]; $A_e$ [m²]; $p_e$, $p_a$ [Pa].
- **Meaning** — the marginal thrust from the last ring of nozzle wall is the pressure difference acting on it; setting it to zero gives optimum expansion, $p_e = p_a$.
- **Assumes** — steady, inviscid, isentropic, attached, 1-D flow; fixed $p_c$ and $\dot m$; massless nozzle extension.
- **Fails when** — adding area causes separation ($dF/dA_e$ is then not merely negative but discontinuous); it also ignores the mass of the added structure, which on a real vehicle is the term that actually decides the answer.
- **Tag** [F] [J] · **Code** `optimum_eps_for_pa(gamma, p0, pa)` gives the $\varepsilon$ where $p_e = p_a$
- **Alias** — 09 restates the same optimum as $p_e = p_a$.

### 03-3.4 — Effective exhaust velocity

$$c \equiv \frac{F}{\dot m} = u_e + \frac{(p_e - p_a)A_e}{\dot m}$$

- **Variables** — $c$ [m/s]; $F$ [N]; $\dot m$ [kg/s].
- **Meaning** — the velocity at which propellant would have to leave, with no pressure thrust, to produce the observed thrust.
- **Assumes** — nothing beyond 03-3.2.
- **Fails when** — treated as a physical velocity. $c$ is not the speed of any gas parcel: at sea level with an over-expanded nozzle $c < u_e$, and nothing is moving at $c$.
- **Tag** [F] · **Code** `c_eff(c_star_val, Cf_val)` (equivalent form $c = c^* C_f$)

### 03-3.5 — Specific impulse

$$I_{sp} = \frac{F}{\dot m\, g_0} = \frac{c}{g_0}\ \ [\mathrm{s}]
\qquad
I_{sp,m} = \frac{F}{\dot m} = c\ \ [\mathrm{N\,s/kg} = \mathrm{m/s}]$$

- **Variables** — $I_{sp}$ [s]; $I_{sp,m}$ mass-specific impulse [N·s/kg = m/s]; $g_0 = 9.80665$ m/s² exactly, a *defined* constant, not local gravity.
- **Meaning** — how much impulse you get per unit of propellant consumed.
- **Assumes** — steady operation; for a real engine, the ambient condition (SL or vacuum) must be quoted or the number is meaningless.
- **Fails when** — propellant *volume* or *density* is the binding constraint; then density impulse (Module 32) is the right figure of merit.
- **Tag** [F] · **Code** `isp_from_c(c_eff)`
- **Alias** — $I_{sp,m} \equiv c$; some sources call $c$ "effective exhaust velocity" and others "mass specific impulse".

### 03-3.6 — Ideal exit velocity

$$u_e = \sqrt{\frac{2\gamma}{\gamma-1}\,R\,T_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}$$

- **Variables** — $u_e$ [m/s]; $R = R_u/\mathcal{M}$ [J/(kg·K)]; $T_0$ chamber stagnation temperature [K]; $p_0 = p_c$ [Pa]; $p_e$ [Pa]; $\gamma$ [—].
- **Meaning** — all thermal energy released between chamber and exit that is not still stored as enthalpy at the exit appears as directed kinetic energy. Note the $\sqrt{T_0/\mathcal{M}}$ scaling that drives all propellant selection.
- **Assumes** — adiabatic, reversible, 1-D, calorically perfect gas with constant $\gamma$, chemically frozen composition, negligible chamber velocity.
- **Fails when** — two-phase flow; chemically reacting flow where recombination releases heat downstream; near the exit of a highly over-expanded nozzle where the flow is not isentropic.
- **Tag** [F] [A] · **Code** `exit_velocity(gamma, R, T0, p0, pe)`

### 03-3.7 — Choked mass flow and the Vandenkerckhove function

$$\dot m = \frac{\Gamma(\gamma)\, p_0\, A_t}{\sqrt{R\,T_0}},
\qquad
\Gamma(\gamma) \equiv \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $\Gamma$ [—]; $p_0$ [Pa]; $A_t$ [m²]; $R$ [J/(kg·K)]; $T_0$ [K]; $\dot m$ [kg/s].
- **Meaning** — once the throat is choked, mass flow is set by chamber conditions and throat area alone, completely independent of what happens downstream.
- **Assumes** — steady, isentropic, 1-D, calorically perfect gas, sonic throat, uniform throat profile.
- **Fails when** — the nozzle is unchoked ($p_c/p_a$ below about 1.9); the throat boundary layer is thick enough that effective area differs from geometric (small thrusters, low Reynolds number); the throat is eroding.
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`, `gamma_function(gamma)`
- **Alias** — 02-3.10. $\Gamma(\gamma)$ ranges only 0.63–0.68 across all chemical rocket exhausts.

### 03-3.8 — Characteristic velocity

$$c^* \equiv \frac{p_c\, A_t}{\dot m} = \frac{\sqrt{R\,T_0}}{\Gamma(\gamma)}$$

- **Variables** — $c^*$ [m/s]; $p_c$ chamber stagnation pressure [Pa]; $A_t$ [m²]; $\dot m$ [kg/s]; $R$ [J/(kg·K)]; $T_0$ [K].
- **Meaning** — a figure of merit for the chamber and propellant combination: how much stagnation pressure a given mass flow can hold up behind a given throat.
- **Assumes** — the defining form (left) assumes only a choked throat and a measurable stagnation pressure; the *ideal* form (right) additionally assumes complete combustion to equilibrium at $T_0$, calorically perfect gas, and no heat loss.
- **Fails when** — $p_c$ is measured somewhere other than the chamber stagnation station. This is the single largest source of $c^*$ disagreements between sources.
- **Tag** [F] · **Code** `c_star(gamma, R, T0)`
- **Alias** — 01-3.18, 04-3.1.

### 03-3.9 — Thrust coefficient

$$C_f = \underbrace{\sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}}_{\text{momentum}}
+ \underbrace{\frac{p_e-p_a}{p_c}\,\varepsilon}_{\text{pressure}}$$

- **Variables** — $C_f$ [—]; $\varepsilon = A_e/A_t$ [—]; $p_e$ [Pa] obtained from $\varepsilon$ and $\gamma$ via the isentropic area relation; $p_a$ [Pa]; $p_c$ [Pa].
- **Meaning** — the factor by which the nozzle amplifies the force that chamber pressure exerts on the throat area; a pure figure of merit for the nozzle.
- **Assumes** — isentropic, attached, 1-D, calorically perfect, chemically frozen flow; uniform axial exit velocity.
- **Fails when** — the nozzle separates (real $C_f$ is then *higher* than the formula, because a separated nozzle behaves as a shorter one); it also neglects divergence, boundary layer and finite-rate chemistry, all folded into $\eta_{C_f}$.
- **Tag** [F] · **Code** `Cf(gamma, eps, p0, pa, pe=None)`
- **Alias** — written $C_F$ in Modules 01, 02, 04 and $C_f$ in Module 03; the same quantity.

### 03-3.10 — The performance factorisation

$$F = C_f\, p_c\, A_t
\qquad
\dot m = \frac{p_c A_t}{c^*}
\qquad
I_{sp} = \frac{c^* C_f}{g_0}
\qquad
c = c^* C_f$$

- **Variables** — all as above.
- **Meaning** — $c^*$ is everything upstream of and including the throat (chamber, propellants, combustion); $C_f$ is everything downstream (nozzle expansion, ambient pressure). This split is the organising idea of the whole course.
- **Assumes** — the same $p_c$ station is used in both, and $A_t$ is the same area in both.
- **Fails when** — throat erosion changes $A_t$ during the burn; $A_t$ then appears in both and the two efficiencies stop being independent.
- **Tag** [F] · **Code** `c_eff(c_star_val, Cf_val)`, `isp_from_c(c_eff)`

### 03-3.11 — Throat area from thrust

$$A_t = \frac{F}{C_f\, p_c}$$

- **Variables** — $A_t$ [m²]; $F$ [N]; $C_f$ [—]; $p_c$ [Pa].
- **Meaning** — throat area is the primary sizing dimension of the whole engine; everything else scales from it.
- **Assumes** — $C_f$ known, which requires $\varepsilon$, $\gamma$ and the design ambient pressure to be chosen first.
- **Fails when** — the design point is not the point where you actually need the thrust; a first-stage engine sized on sea-level thrust over-performs in vacuum by 8–12 %.
- **Tag** [F] · **Code** `throat_area_from_thrust(F, p0, Cf_val)`

### 03-3.12 — Summerfield separation criterion (performance form)

$$\frac{p_e}{p_a} \gtrsim 0.4 \quad\text{for attached flow}$$

- **Variables** — $p_e$ ideal exit static pressure [Pa]; $p_a$ ambient [Pa].
- **Meaning** — a nozzle flowing with $p_e$ below about 40 % of ambient will separate; this caps usable sea-level $\varepsilon$.
- **Assumes** — conical or conventional bell, cold wall, steady operation.
- **Fails when** — treated as a sharp rule. It is a fit, not a physical threshold; observed separation ratios range 0.25–0.5 with contour, wall temperature and Reynolds number, and it is notably conservative for high-$p_c$ bells.
- **Tag** [E] · **Code** `summerfield_separation_pressure(p0, frac=0.4)`
- **Alias** — 02-3.21.

### 03-3.13 — Schmucker separation criterion (performance form)

$$\frac{p_{sep}}{p_a} = (1.88\,M_e - 1)^{-0.64}$$

- **Variables** — $M_e$ ideal exit Mach number [—]; $p_{sep}$ wall pressure at separation [Pa]; $p_a$ [Pa].
- **Meaning** — separation is delayed to lower pressure ratios at higher exit Mach number, because the boundary layer is thinner and more energetic.
- **Assumes** — over-expanded conventional nozzles; free-shock separation (not restricted-shock).
- **Fails when** — the restricted-shock-separation pattern of some thrust-optimised parabolic contours (RS-25, Vulcain 2 both show it), where separated flow reattaches and produces much larger side loads.
- **Tag** [E] · **Code** `schmucker_separation(pa, Me)`
- **Alias** — 02-3.22.

### 03-3.14 — Characteristic length $L^*$

$$L^* \equiv \frac{V_c}{A_t}$$

- **Variables** — $L^*$ [m]; $V_c$ chamber volume from injector face to throat plane *including* the convergent section [m³]; $A_t$ [m²].
- **Meaning** — a proxy for gas residence time, since $t_s = V_c\rho_c/\dot m = L^*\rho_c c^*/p_c$ and $\rho_c c^*/p_c$ varies little across propellant combinations.
- **Assumes** — the chamber is the dominant combustion volume; geometry effects beyond volume are second order.
- **Fails when** — applied outside the propellant/injector combination it was calibrated on. An $L^*$ from a LOX/LH2 coaxial engine tells you nothing about a hypergolic pintle.
- **Tag** [E] · **Code** `chamber_volume_from_Lstar(Lstar, At)`, `residence_time(Vc, rho_c, mdot)`
- **Alias** — Module 06 uses the same definition; US practice quotes $L^*$ in inches.

### 03-3.15 — Efficiency decomposition

$$\eta_{c^*} = \frac{c^*_{meas}}{c^*_{ideal}},
\qquad
\eta_{C_f} = \frac{C_{f,meas}}{C_{f,ideal}},
\qquad
\eta_{ov} = \frac{I_{sp,meas}}{I_{sp,ideal}} = \eta_{c^*}\,\eta_{C_f}$$

- **Variables** — measured values from a hot fire; ideal values from a thermochemical code (Module 04) at the same $p_c$, $MR$, $\varepsilon$ and $p_a$. All [—].
- **Meaning** — the fraction of theoretical performance actually delivered, split by responsible subsystem: combustor versus nozzle.
- **Assumes** — the ideal calculation used the *same* assumptions the convention expects (usually shifting-equilibrium chamber, frozen or equilibrium nozzle), and this must be stated or the efficiency is meaningless.
- **Fails when** — compared between organisations with different ideal baselines. JANNAF standardised this precisely because everyone's "efficiency" meant something different.
- **Tag** [F] [E] · **Code** —
- **Alias** — 04-3.9 adds a third factor $\eta_{cycle}$.

---

## Module 04 — Thermochemistry and CEA

### 04-3.1 — Characteristic velocity from thermochemistry

$$c^* = \frac{\sqrt{R T_0}}{\Gamma(\gamma)}, \qquad \Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $c^*$ [m/s]; $R = R_u/\mathcal{M}$ [J/(kg·K)]; $T_0$ chamber stagnation temperature [K]; $\gamma$ [—].
- **Meaning** — the throat's ability to convert chamber thermal energy into choked mass flux; the single number a thermochemical code exists to produce.
- **Assumes** — ideal gas, calorically perfect, isentropic, 1-D, choked throat, uniform chamber.
- **Fails when** — composition or $\gamma$ vary strongly through the throat (they do); the gas is two-phase.
- **Tag** [F] · **Code** `c_star(gamma, R, T0)`
- **Alias** — 01-3.18, 03-3.8.

### 04-3.2 — The $T_0/\mathcal{M}$ scaling

$$c^* = \frac{1}{\Gamma(\gamma)}\sqrt{\frac{R_u T_0}{\mathcal{M}}} \;\propto\; \sqrt{\frac{T_0}{\mathcal{M}}}$$

- **Variables** — $R_u = 8314.46$ [J/(kmol·K)]; $T_0$ [K]; $\mathcal{M}$ mixture molar mass [kg/kmol].
- **Meaning** — the central result of the module. Everything a propellant chemist can do for you sits in the group $T_0/\mathcal{M}$, with only a weak dependence on $\gamma$ through $\Gamma$ (0.63–0.68 across all chemical rocket exhausts). It is why hydrogen wins on $I_{sp}$ despite a lower flame temperature than kerosene.
- **Assumes** — as 04-3.1.
- **Fails when** — as 04-3.1.
- **Tag** [F] · **Code** `c_star(gamma, R_specific(M), T0)`

### 04-3.3 — Mixture ratio, mass fractions, equivalence ratio

$$Y_f = \frac{1}{1+r}, \qquad Y_o = \frac{r}{1+r}, \qquad \phi = \frac{r_{st}}{r}$$

- **Variables** — $r$ (or MR, O/F) oxidiser-to-fuel mass-flow ratio [—]; $r_{st}$ stoichiometric mixture ratio [—]; $Y_f$, $Y_o$ fuel and oxidiser mass fractions of total propellant flow [—]; $\phi$ equivalence ratio [—].
- **Meaning** — definitions relating the rocket convention (O/F) to the combustion convention ($\phi$). CEA prints `%FUEL` $= 100\,Y_f$.
- **Assumes** — nothing; these are definitions.
- **Fails when** — the propellants contain oxygen or nitrogen in ways that make "how much oxidiser is required" ambiguous; CEA then prints two different equivalence ratios (`R,EQ.RATIO`, `PHI,EQ.RATIO`) that no longer coincide.
- **Tag** [F] · **Code** —
- **Alias** — Module 01 lists $r$ (or MR); Module 05 and later use O/F.

### 04-3.4 — Adiabatic flame temperature (per kmol)

$$\sum_{\text{prod}} n_i\left[\Delta_f h^\circ_i + \int_{298.15}^{T_{ad}} c_{p,i}(T)\,dT\right] = \sum_{\text{react}} n_j\, h_j(T_j)$$

- **Variables** — $n$ kmol of each species per unit basis; $\Delta_f h^\circ$ standard enthalpy of formation at 298.15 K [J/kmol]; $c_p(T)$ molar heat capacity [J/(kmol·K)]; $T_{ad}$ adiabatic flame temperature [K]; $h_j(T_j)$ absolute enthalpy of reactant $j$ *at the temperature and phase it is actually injected in* [J/kmol].
- **Meaning** — chemical energy released becomes sensible enthalpy of the products.
- **Assumes** — adiabatic, no shaft work, negligible chamber kinetic energy, complete mixing, and (in the hand version) a fixed product list.
- **Fails when** — the chamber loses significant heat to a regenerative jacket (0.5–2 % of total enthalpy — small but not zero); mixing is incomplete; and badly, when the product list is wrong, which by hand it always is.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.13, same balance per mole.

### 04-3.5 — NASA polynomial for $c_p^\circ(T)$

$$\frac{c_p^\circ(T)}{R_u} = a_1 + a_2 T + a_3 T^2 + a_4 T^3 + a_5 T^4$$

- **Variables** — $a_i$ species- and range-specific fitted coefficients [—, with implied powers of K$^{-1}$]; $T$ [K]; $R_u$ [J/(kmol·K)].
- **Meaning** — the tabulated thermodynamic input every equilibrium code runs on. CEA uses a 9-coefficient extension with two extra inverse-power terms for better low-temperature behaviour.
- **Assumes** — ideal gas.
- **Fails when** — used outside its fitted temperature range. Every set carries a range (typically 200–1000 K and 1000–6000 K); extrapolating past the top of the high range is the most common way to get a silently wrong flame temperature.
- **Tag** [F] · **Code** —

### 04-3.6 — Equilibrium constant

$$K_p(T) = \prod_i \left(\frac{p_i}{p^\circ}\right)^{\nu_i} = \exp\!\left(-\frac{\Delta G^\circ(T)}{R_u T}\right)$$

- **Variables** — $p_i$ partial pressure of species $i$ [bar]; $p^\circ = 1$ bar; $\nu_i$ stoichiometric coefficient, positive for products [—]; $\Delta G^\circ(T)$ standard Gibbs energy change of reaction [J/kmol]; $R_u$ [J/(kmol·K)].
- **Meaning** — $K_p$ is fixed by temperature alone; pressure enters only through the partial pressures.
- **Assumes** — ideal-gas mixture, standard state 1 bar.
- **Fails when** — real-gas effects matter. At 200 bar and 3600 K they are small (a percent or two on $Z$), but at 300+ bar in an oxygen-rich preburner they are not negligible.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.15.

### 04-3.7 — Water-dissociation equilibrium in terms of $\alpha$

$$K_p = \frac{\alpha\,(\alpha/2)^{1/2}}{1-\alpha}\left(\frac{p}{p^\circ(1+\alpha/2)}\right)^{1/2}$$

- **Variables** — $\alpha$ dissociated fraction of the initial H₂O [—]; $p$ total pressure [bar]; $p^\circ = 1$ bar.
- **Meaning** — the explicit $p^{1/2}$ is $p^{\Delta n}$ with $\Delta n = +\tfrac12$ moles of gas created per mole reacted; raising pressure suppresses dissociation.
- **Assumes** — only this one reaction; ideal gas.
- **Fails when** — other dissociation channels compete, which for real exhaust they do.
- **Tag** [F] · **Code** —

### 04-3.8 — Isentropic exponent $\gamma_s$ of a reacting mixture

$$\gamma_s = \frac{c_p/c_v}{-\left(\partial \ln V/\partial \ln p\right)_T}, \qquad
c_p - c_v = -\frac{R\left[(\partial \ln V/\partial \ln T)_p\right]^2}{(\partial \ln V/\partial \ln p)_T}$$

- **Variables** — $c_p$, $c_v$ equilibrium specific heats [J/(kg·K)]; $R$ specific gas constant of the local mixture [J/(kg·K)]; $V$ specific volume [m³/kg].
- **Meaning** — $\gamma_s$ is the exponent that makes $pV^{\gamma_s} = \mathrm{const}$ locally true along the isentrope, which is what nozzle relations need. For a reacting mixture $c_p/c_v$ is *not* that number.
- **Assumes** — ideal-gas mixture with reaction.
- **Fails when** — real-gas or condensed phases are present.
- **Tag** [F] · **Code** —
- **Alias** — CEA prints `GAMMAs`; the frozen $\gamma$ of 01-3.11 is a different number (1.191 vs 1.147 in the module's worked block). Use $\gamma_s$ for nozzle flow unless the expansion is genuinely frozen.

### 04-3.9 — CEA $I_{sp}$ to delivered $I_{sp}$

$$I_{sp,\text{del}} = \eta_{c^*} \cdot \eta_{C_F} \cdot \eta_{\text{cycle}} \cdot I_{sp,\text{CEA}}$$

- **Variables** — $\eta_{c^*}$ combustion (characteristic-velocity) efficiency [—]; $\eta_{C_F}$ nozzle efficiency [—]; $\eta_{\text{cycle}}$ penalty for propellant that does not pass through the main chamber at full expansion [—]; $I_{sp}$ [s].
- **Meaning** — multiplicative bookkeeping of independent loss mechanisms; the bridge from a code output to a number you can put in a proposal.
- **Assumes** — the efficiencies are separable, which is an approximation: injector quality affects the boundary layer, and divergence loss is coupled to the core flow profile.
- **Fails when** — losses are large enough to interact (deeply throttled operation, severe separation).
- **Tag** [E] · **Code** —
- **Alias** — 03-3.15 without the cycle term.

---

# Part II — Bipropellant liquid engines (modules 05–18)

## Module 05 — Propellants

### 05-3.1 — Propellant mass for a $\Delta v$ (Tsiolkovsky, solved for $m_p$)

$$m_p = m_f\left[\exp\!\left(\frac{\Delta v}{I_{sp} g_0}\right) - 1\right]$$

- **Variables** — $m_p$ propellant mass [kg]; $m_f$ burnout mass [kg] (payload + structure + engine + residuals); $\Delta v$ [m/s]; $I_{sp}$ [s]; $g_0 = 9.80665$ m/s².
- **Meaning** — the propellant a stage must carry; the exponential is why an $I_{sp}$ point is worth so much on a high-$\Delta v$ stage.
- **Assumes** — constant $I_{sp}$; no gravity or drag losses; impulsive-equivalent burn.
- **Fails when** — throttling or altitude change $I_{sp}$ appreciably; the stage burns long enough that gravity loss is a first-order term. Integrate the trajectory instead.
- **Tag** [F] · **Code** `propellant_for_dv(isp, m_final, dv)`
- **Alias** — the same relation appears as 28-3.x / 32 in $\Delta v$ form, `tsiolkovsky_dv(isp, m0, mf)`.

### 05-3.2 — Bulk propellant density

$$\rho_b = \frac{1+r}{\dfrac{r}{\rho_{ox}} + \dfrac{1}{\rho_{f}}}$$

- **Variables** — $\rho_b$ bulk density of the loaded propellant [kg/m³]; $r$ mixture ratio [—]; $\rho_{ox},\rho_f$ oxidiser and fuel densities *at tank conditions* [kg/m³].
- **Meaning** — the density of the propellant as a system, which is what sizes the tanks.
- **Assumes** — both propellants loaded at the stated temperatures with no residuals; ullage counted separately.
- **Fails when** — one propellant is densified or subcooled and the other is not and you use handbook NBP densities for both; a 10 % error in LOX density is a 10 % error in tank length.
- **Tag** [F] · **Code** —

### 05-3.3 — Density impulse

$$I_d = \rho_b\, I_{sp}$$

- **Variables** — $I_d$ density impulse [kg·s/m³]; $\rho_b$ [kg/m³]; $I_{sp}$ [s].
- **Meaning** — impulse delivered per unit of tank volume; the figure of merit that makes RP-1 and storables competitive with hydrogen on first stages.
- **Assumes** — tank mass and structural mass scale with volume — true for a first stage inside a fixed-diameter vehicle, false for a stage whose mass is dominated by a fixed avionics/engine allocation.
- **Fails when** — the vehicle is mass-limited rather than volume-limited; $I_{sp}$ alone is then the right metric.
- **Tag** [A] · **Code** `density_isp(rho, isp)`
- **Alias** — Module 32 writes $\rho I_{sp}$; some sources define it with $\rho$ relative to water, giving a dimensionless number.

### 05-3.4 — Characteristic velocity (propellant-selection form)

$$c^* = \frac{\sqrt{R T_0}}{\Gamma(\gamma)}, \qquad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $c^*$ [m/s]; $R = R_u/\mathcal{M}$ [J/(kg·K)]; $T_0$ chamber stagnation temperature [K]; $\gamma$ [—].
- **Meaning** — the chamber's contribution to performance, independent of the nozzle.
- **Assumes** — choked throat, 1-D, calorically perfect gas at the chamber state, complete and adiabatic combustion.
- **Fails when** — $\gamma$ varies strongly through the nozzle (it does, by 0.03–0.06 for hot hydrocarbon flames); combustion is incomplete ($\eta_{c^*} < 1$); two-phase products are present. Real engines deliver $\eta_{c^*} = 0.92$–0.995 of this.
- **Tag** [F] · **Code** `c_star(gamma, R, T0)`
- **Alias** — 01-3.18, 03-3.8, 04-3.1, 06-3.3.

### 05-3.5 — Arrhenius ignition delay

$$\tau_{ign} = A\exp\!\left(\frac{E_a}{R_u T}\right)$$

- **Variables** — $\tau_{ign}$ ignition delay [s]; $A$ pre-exponential factor [s]; $E_a$ apparent activation energy [J/kmol]; $R_u = 8314.46$ J/(kmol·K); $T$ propellant temperature [K].
- **Meaning** — hypergolic ignition is a chemical rate process, so delay rises steeply as propellants get cold. This is why cold-soaked hypergols produce hard starts.
- **Assumes** — a single rate-controlling step; well-mixed contact.
- **Fails when** — mixing rather than chemistry limits the process (coarse injector elements); the propellants are cold enough that one freezes on contact.
- **Tag** [E] · **Code** —

### 05-3.6 — Coolant-side wall temperature and Dittus–Boelter film coefficient

$$T_{wc} = T_{b} + \frac{q''}{h}, \qquad
h = 0.023\,\frac{k}{D_h}\,Re^{0.8}Pr^{0.4}$$

- **Variables** — $T_{wc}$ coolant-side wall temperature [K]; $T_b$ coolant bulk temperature [K]; $q''$ local heat flux [W/m²]; $h$ coolant-side film coefficient [W/(m²·K)]; $k$ coolant thermal conductivity [W/(m·K)]; $D_h$ hydraulic diameter [m]; $Re$, $Pr$ [—] at bulk conditions.
- **Meaning** — the film temperature drop that sets whether the fuel cokes; the coking limit is a *wall* temperature, not a bulk temperature.
- **Assumes** — fully developed turbulent single-phase flow; moderate property variation; smooth straight channel.
- **Fails when** — the coolant is near or above its critical point (property variation is violent); the channel is curved or has a high aspect ratio; roughness or ribbing augments $h$ — corrections of 1.2–2× are routine. Accuracy ±20–25 % at best.
- **Tag** [E] [J] · **Code** `dittus_boelter(k, D, Re, Pr, n=0.4)`
- **Alias** — 10 and 11 use the same correlation with $n = 0.4$ (heating) or 0.3 (cooling).

### 05-3.7 — Cryogenic boil-off rate

$$\dot m_{bo} = \frac{\dot Q}{h_{fg}}$$

- **Variables** — $\dot m_{bo}$ boil-off rate [kg/s]; $\dot Q$ heat leak into the liquid [W]; $h_{fg}$ latent heat at tank pressure [J/kg].
- **Meaning** — the vent rate needed to hold tank pressure.
- **Assumes** — saturated liquid; vented (constant-pressure) tank; all heat reaching the liquid rather than superheating the ullage.
- **Fails when** — the tank is locked up (pressure rises instead of mass leaving); the liquid is subcooled (heat is absorbed sensibly first); thermal stratification concentrates heat in the surface layer — stratification can double the apparent pressure-rise rate.
- **Tag** [F] · **Code** —

### 05-3.8 — Thermal contraction on chill-down

$$\frac{\Delta L}{L} = \int_{T_1}^{T_2}\alpha(T)\,dT$$

- **Variables** — $\Delta L/L$ contraction strain [—]; $\alpha(T)$ coefficient of thermal expansion [1/K]; $T$ [K].
- **Meaning** — how much a structure moves on chill-down; the reason bellows, sliding joints and flex lines are not optional.
- **Assumes** — unconstrained, isotropic material.
- **Fails when** — the integral is replaced by $\bar\alpha\,\Delta T$ using a room-temperature $\bar\alpha$; $\alpha$ falls by a factor of two or more toward absolute zero, so the room-temperature value badly overpredicts.
- **Tag** [F] · **Code** —

### 05-3.9 — Available NPSH

$$\mathrm{NPSH}_a = \frac{p_{tank} - p_v - \Delta p_{line}}{\rho g_0} + z\frac{a}{g_0}$$

- **Variables** — $\mathrm{NPSH}_a$ [m]; $p_{tank}$ ullage pressure [Pa]; $p_v$ vapour pressure at the local liquid temperature [Pa]; $\Delta p_{line}$ feed-line loss [Pa]; $\rho$ [kg/m³]; $z$ liquid column height above the inlet [m]; $a$ vehicle axial acceleration [m/s²]; $g_0$ [m/s²].
- **Meaning** — the margin against cavitation at the impeller inlet.
- **Assumes** — steady flow; uniform inlet temperature.
- **Fails when** — the liquid is stratified (surface layer warmer, $p_v$ higher than bulk); during the start transient; trapped gas is ingested after a low-g coast.
- **Tag** [F] · **Code** `npsh_available(p_tank, p_vapor, rho, z, dp_line, accel)`
- **Alias** — 12 writes the identical expression; US pump practice quotes NPSH in feet.

### 05-3.10 — Expander-cycle turbine power ceiling

$$P_{turb} = \eta_t\,\dot m_f\,c_p\,T_{in}\left[1 - \pi^{-(\gamma-1)/\gamma}\right]
\quad\text{with}\quad \dot m_f c_p \Delta T = \dot Q_{jacket}$$

- **Variables** — $P_{turb}$ turbine shaft power [W]; $\eta_t$ turbine efficiency [—]; $\dot m_f$ fuel flow [kg/s]; $c_p$ [J/(kg·K)]; $T_{in}$ turbine inlet temperature [K]; $\pi$ turbine pressure ratio [—]; $\dot Q_{jacket}$ heat picked up in the cooling jacket [W].
- **Meaning** — an expander engine's power is capped by the heat its own chamber can deliver to its own fuel. This single coupling is why expanders do not scale past a few hundred kN.
- **Assumes** — ideal-gas turbine; adiabatic ducting.
- **Fails when** — the coolant is strongly supercritical; use real-fluid enthalpy differences, not $c_p\Delta T$.
- **Tag** [F] · **Code** `turbine_power(mdot, cp, T_in, pr, gamma, eta)`
- **Alias** — 12 and 13 write the same turbine-power law; $\pi$ here is `pr` in code.

---

## Module 06 — Combustion Chambers

### 06-3.1 — Residence-time sizing rule

$$t_s \gtrsim 3\,\bigl(t_{v} + t_{mix}\bigr)$$

- **Variables** — $t_s$ mean gas residence time [s]; $t_v$ droplet vaporization time [s]; $t_{mix}$ turbulent mixing time [s].
- **Meaning** — the chamber must hold the propellant for several times longer than the slowest preparation process, because these are distributions, not single values, and the tail of the drop-size distribution sets the last percent of $c^*$.
- **Assumes** — vaporization and mixing proceed in parallel with reaction; the factor of ~3 is an engineering allowance, not a theorem.
- **Fails when** — the spray has a coarse tail (a plugged or eroded element); film cooling deliberately puts unburned fuel at the wall; propellants are injected supercritically and "vaporization" is not a phase change at all.
- **Tag** [J] on the factor 3, [F] on the structure · **Code** —

### 06-3.2 — Mean residence time

$$t_s = \frac{m_{gas}}{\dot m} = \frac{\rho_c V_c}{\dot m}$$

- **Variables** — $m_{gas}$ gas resident in the chamber [kg]; $\rho_c$ chamber gas density [kg/m³]; $V_c$ chamber volume [m³]; $\dot m$ total mass flow [kg/s].
- **Meaning** — the definition of mean residence time for steady flow through a fixed volume.
- **Assumes** — the chamber contains only gas at stagnation density — exactly what is false near the injector, where the volume holds liquid ligaments and droplets at 500–1200 kg/m³ rather than gas at 5–15 kg/m³.
- **Fails when** — used as a *physical* stay time near the injector face. It remains an exact bookkeeping identity for the gas phase.
- **Tag** [F] as an identity, [A] as a physical stay time · **Code** `residence_time(Vc, rho_c, mdot)`
- **Alias** — 07-3.6 writes it as $t_s = L^*\rho_c c^*/p_c$.

### 06-3.3 — Choked mass flow as the definition of $c^*$

$$\dot m = \frac{p_{c,\mathrm{ns}} A_t}{c^*}, \qquad c^* = \frac{\sqrt{R T_c}}{\Gamma}, \qquad \Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $p_{c,\mathrm{ns}}$ nozzle stagnation pressure [Pa]; $A_t$ throat area [m²]; $c^*$ [m/s]; $R$ [J/(kg·K)]; $T_c$ chamber stagnation temperature [K]; $\Gamma$ [—].
- **Meaning** — the choked-throat mass-flow law rearranged as the definition of $c^*$.
- **Assumes** — 1-D, calorically perfect, chemically frozen or fully equilibrated flow with a sonic throat.
- **Fails when** — the throat is not choked (start-up, deep throttling below ~10 % with a fixed throat); two-phase or strongly non-equilibrium flow makes a single $\gamma$ meaningless.
- **Tag** [F] · **Code** `choked_mdot(...)`, `c_star(gamma, R, T0)`
- **Alias** — 03-3.7/3.8. Note $p_{c,\mathrm{ns}}$ ("nozzle stagnation") is the same station as $p_{0,t}$ in Module 01.

### 06-3.4 — Characteristic length

$$L^* \equiv \frac{V_c}{A_t}$$

- **Variables** — $L^*$ [m]; $V_c$ chamber volume from injector face to throat plane [m³]; $A_t$ [m²].
- **Meaning** — a normalised measure of how much volume is provided per unit throughput. $L^*$ has units of length but is *not* a physical length: it is the length the chamber would have as a constant-area duct of throat cross-section holding the same volume.
- **Assumes** — nothing; it is a definition.
- **Fails when** — used as a *design rule* across propellant combinations, injector types, or chamber pressures far outside the data set it was tabulated from.
- **Tag** [E] as a design rule; a definition otherwise · **Code** `chamber_volume_from_Lstar(Lstar, At)`
- **Alias** — 03-3.14, identical; US practice tabulates $L^*$ in inches (1 m = 39.37 in).

### 06-3.5 — Residence time from $L^*$ — pressure cancels

$$t_s = \frac{L^*}{\Gamma^2\, c^*}$$

- **Variables** — $t_s$ [s]; $L^*$ [m]; $\Gamma$ Vandenkerckhove function [—]; $c^*$ [m/s].
- **Meaning** — **chamber pressure cancels out completely.** For a given propellant and $L^*$, residence time is fixed regardless of chamber pressure or engine size. This is why $L^*$ survived as a design parameter for seventy years.
- **Assumes** — gas at chamber stagnation density throughout $V_c$ (06-3.2's assumption); choked throat; single $\gamma$.
- **Fails when** — used as a physical stay time near the injector; and across propellants — a large $c^*$ (hydrogen) gives a *shorter* residence time at the same $L^*$.
- **Tag** [F] · **Code** —

### 06-3.6 — Contraction ratio from chamber Mach number

$$\varepsilon_c = \frac{1}{\mathrm{Ma}}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}\mathrm{Ma}^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $\varepsilon_c = A_c/A_t$ contraction ratio [—]; $\mathrm{Ma}$ Mach number at the end of the barrel [—]; $\gamma$ [—].
- **Meaning** — the isentropic area relation evaluated on the subsonic root; it converts a chosen chamber Mach number into a barrel diameter.
- **Assumes** — isentropic, 1-D, calorically perfect flow between barrel exit and throat, with combustion already complete.
- **Fails when** — upstream of combustion completion, where heat addition makes the flow non-isentropic (06-3.8/3.9); in the boundary layer.
- **Tag** [F] · **Code** `area_ratio(gamma, Mach)`; `mach_from_area_ratio(gamma, eps, supersonic=False)`
- **Alias** — 02-3.11 with $A/A^* = \varepsilon_c$ on the subsonic branch.

### 06-3.7 — Chamber mass flux

$$G = \frac{\dot m}{A_c} = \frac{p_{c}}{c^*\,\varepsilon_c}$$

- **Variables** — $G$ chamber mass flux [kg/(m²·s)]; $\dot m$ [kg/s]; $A_c$ chamber cross-section [m²]; $p_c$ [Pa]; $c^*$ [m/s]; $\varepsilon_c$ [—].
- **Meaning** — the propellant throughput each square metre of injector face must handle, which sets element density and hence element size.
- **Assumes** — choked throat; uniform flow across the face.
- **Fails when** — the face is deliberately non-uniform (a fuel-rich outer row, a baffled centre), where local flux differs substantially from the mean.
- **Tag** [F] · **Code** —

### 06-3.8 — Static pressure drop from acceleration in a constant-area chamber

$$\frac{p_{1}}{p_{2}} = 1 + \gamma\,\mathrm{Ma}_2^2$$

- **Variables** — $p_1$ static pressure at the injector face [Pa]; $p_2$ static pressure at the barrel exit [Pa]; $\mathrm{Ma}_2$ barrel-exit Mach number [—]; $\gamma$ [—].
- **Meaning** — accelerating the gas from rest costs static pressure, by exactly the momentum flux it acquires.
- **Assumes** — constant area; no wall friction; negligible inlet velocity; perfect gas.
- **Fails when** — the area changes (the convergent section); wall friction is significant (a further, usually smaller, loss).
- **Tag** [F] · **Code** —

### 06-3.9 — Rayleigh stagnation-pressure loss across the chamber

$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}} = \frac{\left(1+\frac{\gamma-1}{2}\mathrm{Ma}_2^2\right)^{\frac{\gamma}{\gamma-1}}}{1+\gamma\,\mathrm{Ma}_2^2}$$

- **Variables** — $p_{c,\mathrm{ns}}$ nozzle stagnation pressure [Pa]; $p_{c,\mathrm{inj}}$ injector-end stagnation pressure [Pa] (equal to the static pressure there, since $u \approx 0$); $\mathrm{Ma}_2$ barrel-exit Mach number [—].
- **Meaning** — **heat addition in a duct destroys stagnation pressure.** A genuine thermodynamic loss, not a bookkeeping artefact: the entropy rise from adding heat to a moving gas is irreversible. Typically 2–8 % of $p_c$.
- **Assumes** — constant area; frictionless; perfect gas; all heat added upstream of station 2; $\mathrm{Ma}_1 \approx 0$.
- **Fails when** — a large fraction of the heat is released in the convergent section (an under-length chamber); the barrel is short enough that friction and heat-transfer losses are comparable.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.8, identical; Module 01 writes $p_{inj}$ and $p_{0,2}$.

### 06-3.10 — Thrust coefficient with ambient back-pressure

$$C_F = C_{F,\mathrm{vac}}(\gamma,\varepsilon) - \frac{p_a\,\varepsilon}{p_c}$$

- **Variables** — $C_F$ [—]; $C_{F,\mathrm{vac}}$ vacuum value, a function of $\gamma$ and $\varepsilon$ only [—]; $p_a$ [Pa]; $\varepsilon$ [—]; $p_c$ nozzle stagnation pressure [Pa].
- **Meaning** — the ambient back-pressure penalty scales as $1/p_c$, so raising chamber pressure directly buys back sea-level thrust.
- **Assumes** — attached, isentropic nozzle flow.
- **Fails when** — the nozzle separates, which is precisely what limits $\varepsilon$ at low $p_c$ (Module 09).
- **Tag** [F] · **Code** `Cf(gamma, eps, p0, pa)`
- **Alias** — 02-3.24 and 03-3.9 are the same statement rearranged.

### 06-3.11 — Barrel mass scaling with chamber pressure

$$m_{barrel} \propto p_c \cdot p_c^{-1}\cdot p_c^{-1/2} = p_c^{-1/2}$$

- **Variables** — $m_{barrel}$ pressure-containing barrel mass [kg]; $\rho_m$ wall material density [kg/m³]; $\sigma_{all}$ allowable stress [Pa]; $p_c$ [Pa].
- **Meaning** — at fixed thrust the chamber pressure vessel gets *lighter* as chamber pressure rises: the shrinkage in size beats the growth in wall thickness.
- **Assumes** — thin-wall hoop stress governs; geometric similarity; constant $\sigma_{all}$ and $L^*$.
- **Fails when** — wall thickness is set by thermal gradient and low-cycle fatigue rather than hoop stress — the case for every regeneratively cooled chamber above ~100 bar, where the hot-gas wall is 0.6–1.0 mm because of the temperature drop it must sustain, not the pressure.
- **Tag** [F] as derived, [A] in application · **Code** —

### 06-3.12 — $L^*$ from chamber geometry

$$L^* = L_{cyl}\,\varepsilon_c + \frac{1}{3}\sqrt{\frac{A_t}{\pi}}\;\cot\theta_c\left(\varepsilon_c^{3/2}-1\right)$$

- **Variables** — $L^*$ [m]; $L_{cyl}$ cylindrical section length [m]; $\varepsilon_c$ [—]; $A_t$ [m²]; $\theta_c$ convergent half-angle [rad].
- **Meaning** — the explicit link between the design parameter $L^*$ and the physical geometry, so a chosen $L^*$ and $\varepsilon_c$ produce a barrel length.
- **Assumes** — a pure conical convergent section with a sharp throat corner.
- **Fails when** — the real throat is rounded with radius $R_u$, removing a sliver of volume; typically 1–3 % of $V_c$, inside the uncertainty on $L^*$ itself.
- **Tag** [F] as derived, [A] against real hardware · **Code** —

### 06-3.13 — Chamber pressure budget

$$p_{disch} = p_{c,\mathrm{ns}} + \underbrace{\Delta p_{\mathrm{Rayleigh}}}_{2-8\%\ p_c} + \underbrace{\Delta p_{inj}}_{15-25\%\ p_c} + \underbrace{\Delta p_{jacket}}_{10-30\%\ p_c} + \underbrace{\Delta p_{lines,valves}}_{2-5\%\ p_c}$$

- **Variables** — $p_{disch}$ pump discharge pressure [Pa]; each $\Delta p$ [Pa].
- **Meaning** — the pump works against the sum of every loss between it and the nozzle, and the chamber contributes two of them. This budget is the first thing to write on a new engine.
- **Assumes** — a regeneratively cooled pump-fed engine. A pressure-fed engine replaces $p_{disch}$ with tank pressure; the arithmetic is otherwise identical.
- **Fails when** — expander cycles, where the jacket drop is not a loss but the power source; tap-off and staged-combustion cycles, where the turbine drop enters differently.
- **Tag** [F] on the structure, [E] on the ranges · **Code** —

### 06-3.14 — Combustion efficiency, measurement form

$$\eta_{c^*} = \frac{c^*_{\mathrm{delivered}}}{c^*_{\mathrm{theoretical}}} = \frac{p_{c,\mathrm{ns}}\,A_t/\dot m}{\sqrt{R T_c}/\Gamma}$$

- **Variables** — $\eta_{c^*}$ [—]; $p_{c,\mathrm{ns}}$ nozzle stagnation pressure [Pa]; $A_t$ throat area *at temperature and pressure*, not the cold drawing dimension [m²]; $\dot m$ total flow including film-cooling flow [kg/s]; denominator from CEA at the *overall* mixture ratio and chamber pressure.
- **Meaning** — the fraction of the theoretically available chamber energy release the engine actually achieves.
- **Assumes** — you know all four measured quantities to better than the ~1 % you are trying to resolve.
- **Fails when** — $p_c$ is measured at the injector end (inflates $\eta_{c^*}$ by 2–8 %); $A_t$ is the cold value (the throat grows with thermal expansion and erodes with time); $\dot m$ omits film coolant.
- **Tag** [F] [E] · **Code** —
- **Alias** — 01-3.18, 03-3.15.

### 06-3.15 — First tangential acoustic mode

$$f_{1T} = \frac{1.8412\,a}{\pi D_c}, \qquad a = \sqrt{\gamma R T_c}$$

- **Variables** — $f_{1T}$ first tangential mode frequency [Hz]; $a$ chamber speed of sound [m/s]; $D_c$ chamber diameter [m]; 1.8412 is the first zero of $J_1'$ [—].
- **Meaning** — the lowest transverse acoustic resonance a rigid-walled cylindrical chamber can support; it tells you which frequency band to instrument.
- **Assumes** — rigid walls, uniform gas properties, no mean flow, a cylinder much shorter than a wavelength axially.
- **Fails when** — the real chamber has a strong axial temperature gradient, a convergent end, and mean flow; expect the real mode within 10–20 % of this.
- **Tag** [F] [A] · **Code** `a_sound(gamma, R, T)`
- **Alias** — Module 15 develops the full Bessel mode set; this is its $m=1$, $n=1$ member.

---

## Module 07 — Injectors

### 07-3.1 — Incompressible orifice flow

$$\dot m = C_d\, A\, \sqrt{2\rho\,\Delta p}, \qquad \Delta p = p_1 - p_2$$

- **Variables** — $\dot m$ mass flow through one orifice [kg/s]; $C_d$ discharge coefficient [—]; $A$ geometric orifice area [m²]; $\rho$ liquid density [kg/m³]; $\Delta p$ pressure drop across the orifice [Pa].
- **Meaning** — the orifice converts a static pressure difference into a jet, imperfectly. The governing equation of every injector.
- **Assumes** — steady, incompressible, single-phase, non-cavitating flow; manifold velocity negligible compared with orifice velocity; $\rho$ constant across the orifice.
- **Fails when** — the orifice cavitates (07-3.4); the propellant is a gas or near critical; the manifold dynamic head is not negligible (07-3.5); transients on a timescale comparable with the manifold acoustic time.
- **Tag** [F] · **Code** `orifice_mdot(Cd, A, rho, dp)`
- **Alias** — 14 and 30 use the same equation for valves and cold-gas orifices.

### 07-3.2 — Orifice jet velocity

$$V = C_d\sqrt{\frac{2\Delta p}{\rho}}$$

- **Variables** — $V$ jet velocity [m/s]; other symbols as 07-3.1.
- **Meaning** — the momentum-carrying velocity, which is what atomization and mixing actually respond to.
- **Assumes** — as 07-3.1, and that all of the discharge deficit appears as a velocity deficit rather than an area deficit.
- **Fails when** — the jet is separated from the wall: the physical jet area is then $C_c A$ with $C_c \approx 0.61$ and the velocity is close to ideal. The distinction matters for momentum-ratio calculations and is a standard source of quiet error.
- **Tag** [F] [J] · **Code** `orifice_velocity(Cd, rho, dp)`

### 07-3.3 — Cavitation number

$$K = \frac{p_1 - p_v}{p_1 - p_2}$$

- **Variables** — $K$ cavitation number [—]; $p_1$ upstream (manifold) pressure [Pa]; $p_2$ downstream (chamber) pressure [Pa]; $p_v$ liquid vapour pressure at bulk temperature [Pa].
- **Meaning** — the margin to vaporization measured against the pressure drop being taken; $K \to 1$ is the onset of cavitation.
- **Assumes** — bulk liquid at a known temperature; no dissolved gas.
- **Fails when** — the propellant is a cryogen near saturation, where $p_v$ is a strong function of a temperature you do not know accurately; dissolved helium from the pressurization system comes out of solution and triggers cavitation early.
- **Tag** [F] · **Code** —

### 07-3.4 — Fully cavitating (hydraulically flipped) orifice

$$\dot m = C_c A\sqrt{2\rho\,(p_1-p_v)}$$

- **Variables** — $C_c \approx 0.61$ contraction coefficient of a sharp-edged orifice [—]; other symbols as above.
- **Meaning** — a fully cavitating orifice is hydraulically choked: its flow no longer depends on chamber pressure at all, which decouples the injector from chamber-pressure feedback and kills chug.
- **Assumes** — sharp-edged inlet; fully developed cavity; single-component liquid.
- **Fails when** — the inlet is rounded (cavitation inception is delayed and the transition much less abrupt); the cavity is unsteady and the orifice oscillates between states.
- **Tag** [E] [J] · **Code** —

### 07-3.5 — Manifold-induced distribution error

$$\frac{\delta \dot m}{\dot m} \approx \frac{1}{2}\,C_d^2\left(\frac{V_{man}}{V}\right)^2
= \frac{1}{2}\,C_d^2\left(\frac{\sum A_{or}}{A_{man}}\right)^2$$

- **Variables** — $V_{man}$ mean manifold velocity [m/s]; $V$ orifice jet velocity [m/s]; $\sum A_{or}$ total effective orifice area fed by that manifold cross-section [m²]; $A_{man}$ manifold cross-sectional area [m²].
- **Meaning** — distribution error scales with the *square* of the manifold-to-orifice area ratio, so a modest oversize on the manifold buys a lot of uniformity.
- **Assumes** — the manifold is a simple duct with no separation; the full dynamic head appears as a static-pressure excursion (conservative).
- **Fails when** — the manifold has sharp turns; a single tangential inlet feeds a ring (superimposing a swirl-driven radial gradient); dead-ended branches ring acoustically.
- **Tag** [E] · **Code** —

### 07-3.6 — Stay time in terms of $L^*$

$$t_s \equiv \frac{V_c \rho_c}{\dot m} = \frac{L^* \rho_c c^*}{p_c}$$

- **Variables** — $V_c$ [m³]; $\rho_c$ chamber gas density [kg/m³]; $\dot m$ [kg/s]; $L^*$ [m]; $c^*$ [m/s]; $p_c$ [Pa].
- **Meaning** — the mean time a gas element spends in the chamber, and the time constant with which chamber pressure responds to a flow imbalance.
- **Assumes** — uniform chamber properties; choked throat; ideal gas.
- **Fails when** — a large fraction of chamber volume is liquid and unburned spray, which is exactly the case near the injector. $t_s$ is an upper bound on the *gas* residence time.
- **Tag** [F] · **Code** `residence_time(Vc, rho_c, mdot)`
- **Alias** — 06-3.2, 06-3.5.

### 07-3.7 — Chug (low-frequency) feedback equation

$$t_s\,\dot p'(t) + p'(t) + k\,p'(t-\tau) = 0$$

- **Variables** — $t_s$ stay time [s]; $\tau$ combustion time lag [s]; $k$ dimensionless injector feedback gain [—]; $p'$ chamber pressure perturbation [Pa].
- **Meaning** — the chamber is a first-order lag closed by a delayed negative feedback through the injector; chug is the instability of that loop.
- **Assumes** — a single lumped chamber mode (no acoustics — this is chug, not screech); a stiff feed system with no line inertance or manifold compliance; constant $\tau$; a non-cavitating injector.
- **Fails when** — feed-line inertance is significant (it usually is, and it makes stability *worse*); the injector cavitates ($k \to 0$ and the mode disappears); $\tau$ itself responds to pressure — the Crocco $n$–$\tau$ generalisation of Module 15.
- **Tag** [F] [A] · **Code** —

### 07-3.8 — Critical chug gain

$$k_{crit} = \sqrt{1 + (\omega t_s)^2}, \qquad \omega\tau = \pi - \arctan(\omega t_s)$$

- **Variables** — $k_{crit}$ critical feedback gain [—]; $\omega$ neutral-mode angular frequency [rad/s]; $t_s$ [s]; $\tau$ [s].
- **Meaning** — given a chamber stay time and a combustion lag there is a maximum injector feedback gain the loop tolerates; exceed it and the chug mode grows. This is the derivation behind the 15–25 % $\Delta p_{inj}/p_c$ rule.
- **Assumes** — everything in 07-3.7.
- **Fails when** — the feed system contributes its own resonance, adding a second oscillator that can produce a lower critical gain at a different frequency.
- **Tag** [F] [A] · **Code** —

### 07-3.9 — Pump power cost of the injector drop

$$P = \frac{\dot m\,\Delta p}{\rho\,\eta_p}$$

- **Variables** — $P$ shaft power attributable to the injector drop [W]; $\dot m$ circuit flow [kg/s]; $\Delta p$ injector drop [Pa]; $\rho$ [kg/m³]; $\eta_p$ pump efficiency [—].
- **Meaning** — the direct energy cost of the injector's hydraulic resistance; the price paid for stability margin.
- **Assumes** — incompressible pumping; efficiency known.
- **Fails when** — the circuit is also the regenerative-cooling circuit and the jacket drop dominates, which is common; the injector drop is then a modest fraction of a much larger number.
- **Tag** [F] · **Code** `pump_power(mdot, dp, rho, eta)`

### 07-3.10 — Gas and liquid Weber numbers

$$\mathrm{We}_g = \frac{\rho_g V_{rel}^2 d}{\sigma}, \qquad
\mathrm{We}_l = \frac{\rho_l V^2 d}{\sigma}$$

- **Variables** — $\rho_g$, $\rho_l$ gas and liquid density [kg/m³]; $V_{rel}$ relative velocity between jet and gas [m/s]; $V$ jet velocity [m/s]; $d$ jet diameter [m]; $\sigma$ surface tension [N/m].
- **Meaning** — how hard the gas is pulling the surface apart relative to how hard surface tension holds it together; the controlling group for primary atomization.
- **Assumes** — a defined characteristic length (jet diameter, sheet thickness, or drop diameter — say which); constant $\sigma$.
- **Fails when** — the chamber is near or above the propellant's critical pressure, where $\sigma \to 0$ and the framework collapses into turbulent mixing of two supercritical fluids — the regime a LOX post in a 200+ bar staged-combustion chamber actually operates in.
- **Tag** [F] · **Code** `weber(rho, v, L, sigma)`

### 07-3.11 — Ohnesorge number

$$\mathrm{Oh} = \frac{\mu_l}{\sqrt{\rho_l \sigma d}} = \frac{\sqrt{\mathrm{We}_l}}{\mathrm{Re}}$$

- **Variables** — $\mu_l$ liquid dynamic viscosity [Pa·s]; $\rho_l$ [kg/m³]; $\sigma$ [N/m]; $d$ [m].
- **Meaning** — viscous damping of surface waves relative to the surface-tension restoring force; large Oh means the liquid resists breakup and produces ligaments rather than drops.
- **Assumes** — Newtonian liquid.
- **Fails when** — gelled or slurried propellants (non-Newtonian) are used; an effective viscosity must then be defined at the relevant shear rate.
- **Tag** [F] · **Code** `ohnesorge(mu, rho, sigma, L)`

### 07-3.12 — Sauter mean diameter (definition)

$$D_{32} = \frac{\sum_i n_i d_i^3}{\sum_i n_i d_i^2}$$

- **Variables** — $n_i$ number of drops in size class $i$ [—]; $d_i$ class diameter [m]; $D_{32}$ [m].
- **Meaning** — the single diameter that reproduces the spray's evaporation-relevant surface area.
- **Assumes** — the drop-size distribution is known.
- **Fails when** — the spray is strongly bimodal (common for impinging elements: a fine spray plus a coarse core); a single SMD then hides the very population that determines whether combustion completes.
- **Tag** [F] · **Code** —

### 07-3.13 — Prefilming/airblast SMD correlation

$$\mathrm{SMD} = A\,d_h\left(\frac{\sigma}{\rho_g U_R^2 d_h}\right)^{a}
\left(\frac{\rho_l}{\rho_g}\right)^{b}\left(1+\frac{1}{\mathrm{ALR}}\right)^{c}
+ B\,d_h\left(\frac{\mu_l^2}{\sigma\rho_l d_h}\right)^{1/2}
\left(1+\frac{1}{\mathrm{ALR}}\right)^{c}$$

- **Variables** — $d_h$ characteristic atomizer dimension (film thickness or annulus gap) [m]; $U_R$ gas–liquid relative velocity [m/s]; $\mathrm{ALR}$ gas-to-liquid mass flow ratio [—]; $A$, $B$, $a$, $b$, $c$ fitted constants ($a \approx 0.4$–0.6, $b \approx 0.1$, $c \approx 0.4$–1).
- **Meaning** — the first term is the surface-tension-limited size, the second the viscosity-limited size; whichever is larger controls.
- **Assumes** — a prefilming or annular geometry with a genuine gas stream doing the work.
- **Fails when** — applied to an impinging element (there is no ALR); at rocket chamber densities far outside the gas-turbine data it was fitted on.
- **Tag** [E] · **Code** —

### 07-3.14 — $d^2$ evaporation law

$$d^2(t) = d_0^2 - K_v t, \qquad K_v = \frac{8 k_g}{\rho_l c_{p,g}}\ln(1+B)$$

- **Variables** — $d_0$ initial drop diameter [m]; $K_v$ evaporation constant [m²/s]; $k_g$ gas thermal conductivity in the film [W/(m·K)]; $c_{p,g}$ gas specific heat in the film [J/(kg·K)]; $\rho_l$ [kg/m³]; $B$ Spalding transfer number [—].
- **Meaning** — drop *area* falls linearly with time, so lifetime scales as $d_0^2$. Halving SMD quarters the vaporization time — the single strongest lever on chamber length.
- **Assumes** — quasi-steady, spherically symmetric, stagnant surroundings, constant properties, no droplet interaction, no combustion at the drop surface.
- **Fails when** — drops shield one another (dense spray near the injector — real lifetimes are longer than predicted); the drop is in supercritical surroundings (no surface exists); convection is significant, which it always is.
- **Tag** [F] [A] · **Code** —

### 07-3.15 — Convection-corrected evaporation constant (Ranz–Marshall form)

$$K_{v,\mathrm{eff}} = K_v\left(1 + 0.3\,\mathrm{Re}_d^{1/2}\mathrm{Pr}^{1/3}\right)$$

- **Variables** — $\mathrm{Re}_d = \rho_g V_{rel} d/\mu_g$ droplet Reynolds number [—]; $\mathrm{Pr}$ gas Prandtl number [—].
- **Meaning** — relative motion thins the diffusion film around the drop and speeds evaporation, by up to an order of magnitude in a rocket chamber.
- **Assumes** — $\mathrm{Re}_d < 10^4$; no drop deformation.
- **Fails when** — $\mathrm{We}_g$ on the *droplet* exceeds about 12, in which case the drop shatters rather than evaporating — secondary breakup, a different and faster process.
- **Tag** [E] · **Code** `reynolds(rho, v, L, mu)`

### 07-3.16 — $L^*$ as an atomization requirement

$$t_v \lesssim t_s \quad\Longrightarrow\quad
L^* \gtrsim \frac{p_c\,d_0^2}{\rho_c c^* K_{v,\mathrm{eff}}}$$

- **Variables** — as 07-3.6 and 07-3.14/3.15.
- **Meaning** — **$L^*$ is an atomization requirement wearing a geometric disguise.** The tabulated $L^*$ values of Module 06 (0.8–1.3 m for LOX/RP-1, 0.6–0.9 m for LOX/LH2, 0.5–0.8 m for storables) are the historical record of what SMD the injectors of the era achieved.
- **Assumes** — vaporization is rate-controlling, not mixing or chemical kinetics.
- **Fails when** — mixing is the slow step (poorly designed unlike-impinging patterns, badly matched momenta); the propellant is gaseous at injection, where there is no $d^2$ law at all and $L^*$ can be far smaller.
- **Tag** [F] [A] · **Code** —

### 07-3.17 — Rupe mixing efficiency $E_m$

$$E_m = 100\left(1 - \sum_{r_i > \bar r} w_i\,\frac{r_i-\bar r}{\bar r}
- \sum_{r_i < \bar r} w_i\,\frac{\bar r - r_i}{1-\bar r}\right)$$

- **Variables** — $r_i$ collected mass fraction of the reference propellant in cell $i$ [—]; $\bar r$ overall mass fraction [—]; $w_i$ cell $i$'s fraction of total collected mass [—]; $E_m$ [%].
- **Meaning** — a mass-weighted measure of how far the local mixture ratio departs from the intended one, normalised so perfect uniformity is 100 % and complete segregation 0 %.
- **Assumes** — non-reacting simulants with matched density and viscosity ratios; the collection plane is representative.
- **Fails when** — the real propellants have vaporization rates so different that gas-phase mixing dominates — the hydrogen case. $E_m$ is a poor predictor for shear-coaxial LOX/LH2 elements and a good one for impinging storable and kerosene elements.
- **Tag** [E] · **Code** —

### 07-3.18 — Rupe momentum criterion

$$R_u = \frac{\rho_o V_o^2 d_o}{\rho_f V_f^2 d_f}$$

- **Variables** — $\rho$ [kg/m³], $V$ jet velocity [m/s], $d$ orifice diameter [m] of the oxidiser and fuel streams; $R_u$ Rupe number [—].
- **Meaning** — the ratio of the two streams' momentum fluxes weighted by their diameters — equivalently $\mathrm{TMR}\times(d_f/d_o)$ — with best mixing near $R_u = 1$.
- **Assumes** — equal impingement angles about the element axis; free jets that actually meet; a non-cavitating discharge so the jet fills the bore.
- **Fails when** — impingement is asymmetric by design; either orifice is cavitating (the effective jet diameter is $\sqrt{C_c}\,d$, not $d$); like-on-like doublets, where mixing is not an element-level phenomenon at all.
- **Tag** [E] [J] · **Code** `momentum_ratio(mdot_o, v_o, mdot_f, v_f)` (TMR form)
- **Alias** — ⚠ $R_u$ here is the **Rupe number**, not the universal gas constant $R_u = 8314.46$ J/(kmol·K) used everywhere else in the course. Context disambiguates; the collision is unfortunate.

### 07-3.19 — Shear-coaxial velocity and momentum-flux ratios

$$\mathrm{VR} = \frac{V_g}{V_l}, \qquad J = \frac{\rho_g V_g^2}{\rho_l V_l^2}$$

- **Variables** — $V_g$, $V_l$ gas-annulus and liquid-post exit velocities [m/s]; $\rho_g$, $\rho_l$ corresponding densities [kg/m³]; VR, $J$ [—].
- **Meaning** — VR governs the shear that strips the liquid; $J$ governs whether the gas stream can actually penetrate and disrupt the liquid core rather than just flowing past.
- **Assumes** — both streams at design flow; concentric annulus.
- **Fails when** — the propellant is injected supercritically (LOX at 200+ bar), where the density ratio is small, surface tension negligible, and the element behaves as a variable-density turbulent mixing layer rather than an atomizer.
- **Tag** [E] · **Code** —

### 07-3.20 — Swirl number (geometric)

$$A_s = \frac{R_n R_{in}}{n\,r_{in}^2}$$

- **Variables** — $A_s$ geometric swirl parameter [—]; $R_n$ exit-orifice radius [m]; $R_{in}$ radius from element axis to the centre of the tangential inlet ports [m]; $n$ number of tangential ports [—]; $r_{in}$ tangential port radius [m].
- **Meaning** — the ratio of angular momentum supplied to axial throughflow; the single parameter that fixes an ideal swirl element's discharge coefficient, filling coefficient and cone angle.
- **Assumes** — inviscid liquid; no boundary layer in the swirl chamber; exit flow at maximum discharge for the given angular momentum.
- **Fails when** — viscosity matters (small elements, viscous fuels) and the effective $A_s$ must be corrected downward; at very low $\Delta p$, where the gas core may not form at all.
- **Tag** [F] [A] · **Code** —

### 07-3.21 — Ideal swirl-element filling coefficient and $C_d$

$$A_s = \frac{(1-\varphi)\sqrt{2}}{\varphi\sqrt{\varphi}}, \qquad
C_d = \sqrt{\frac{\varphi^3}{2-\varphi}}$$

- **Variables** — $\varphi$ filling coefficient, the liquid-occupied fraction of the exit area [—]; $A_s$ [—]; $C_d$ [—].
- **Meaning** — a strongly swirling element has a large gas core, a small liquid-occupied area, and therefore an intrinsically low $C_d$: $A_s = 2$ gives $\varphi = 0.5$ and $C_d = 0.29$, about a third of a plain orifice's.
- **Assumes** — inviscid ideal swirl.
- **Fails when** — viscous losses in the swirl chamber are significant, which raises $C_d$ above ideal in small hardware.
- **Tag** [F] [A] · **Code** —

### 07-3.22 — Total momentum ratio (pintle)

$$\mathrm{TMR} = \frac{\dot m_{rad} V_{rad}}{\dot m_{ax} V_{ax}}$$

- **Variables** — $\dot m$ mass flow [kg/s] and $V$ injection velocity [m/s] of the radial and axial streams; TMR [—].
- **Meaning** — TMR sets how deeply the radial jets penetrate the axial sheet and hence the angle of the combined spray cone; TMR near 1 puts the spray at roughly 45° and is the usual design region.
- **Assumes** — both streams' velocities computed consistently (see the $C_c$ warning under 07-3.2).
- **Fails when** — the blockage factor is so low that radial jets are discrete and the sheet leaks between them, or so high that the radial flow becomes a sheet itself and the penetration model changes.
- **Tag** [E] [J] · **Code** `momentum_ratio(mdot_o, v_o, mdot_f, v_f)`

### 07-3.23 — Element count

$$N = \frac{\dot m}{\rho\,V\,A_{or}} = \frac{\dot m}{C_d\,A_{or}\sqrt{2\rho\Delta p}}$$

- **Variables** — $N$ number of orifices in that circuit [—]; other symbols as 07-3.1.
- **Meaning** — once $\Delta p$ is fixed (from stability) and orifice diameter is fixed (from atomization and manufacturing), element count is not a free choice — it is determined.
- **Assumes** — identical orifices.
- **Fails when** — the pattern deliberately uses several orifice sizes, which most real injectors do.
- **Tag** [F] · **Code** `orifice_mdot(Cd, A, rho, dp)` inverted

---

## Module 08 — Ignition Systems

### 08-3.1 — Propellant accumulation during ignition delay

$$m_{acc} = \dot m_{st}\,\tau_d = \phi\,\dot m\,\tau_d$$

- **Variables** — $m_{acc}$ accumulated propellant [kg]; $\dot m_{st}$ total start-transient flow into the chamber [kg/s]; $\phi$ its fraction of mainstage flow [—]; $\dot m$ mainstage flow [kg/s]; $\tau_d$ ignition delay from first propellant entry [s].
- **Meaning** — accumulation is linear in delay; this is the quantity that turns a late ignition into a hard start.
- **Assumes** — constant flow during the delay; nothing drains out.
- **Fails when** — the chamber has a large drain or the start flow is strongly time-varying. In a real pump-fed start $\dot m_{st}$ ramps and $m_{acc} = \int \dot m_{st}\,dt$ must be integrated from the actual valve schedule.
- **Tag** [F] · **Code** —

### 08-3.2 — Constant-volume explosion pressure

$$p_{CV} = \frac{(\gamma-1)\,m_{acc}\,\Delta h_c}{V_c} = \frac{m_{acc}RT_v}{V_c}$$

- **Variables** — $p_{CV}$ [Pa]; $\gamma$ product ratio of specific heats [—]; $\Delta h_c$ net heat release per kg of mixture [J/kg]; $V_c$ free chamber volume [m³]; $R$ product gas constant [J/(kg·K)]; $T_v = (\gamma-1)\Delta h_c/R$ constant-volume flame temperature from a cold initial state [K].
- **Meaning** — the pressure a chamber sees if its accumulated charge burns before anything can escape. Compare with the structural limit to size the delay budget.
- **Assumes** — instantaneous combustion; no venting; no heat loss to walls; perfect gas with constant $\gamma$; all of $m_{acc}$ at a burnable mixture ratio.
- **Fails when** — a substantial fraction of $m_{acc}$ is liquid film that burns slowly (reduces $p$); the accumulation detonates rather than deflagrates (raises local pressure well above $p_{CV}$ through shock reflection).
- **Tag** [F] [A] · **Code** —

### 08-3.3 — Vented peak pressure during an accumulation burn

$$p_{peak} = p_{CV}\,\frac{\tau_e}{t_b}\Bigl(1-e^{-t_b/\tau_e}\Bigr)$$

- **Variables** — $p_{peak}$ peak chamber pressure [Pa]; $\tau_e$ chamber vent time constant [s]; $t_b$ time over which the accumulated mass releases its energy [s]; $\Gamma$ Vandenkerckhove function [—] enters $\tau_e$.
- **Meaning** — the throat relieves the overpressure only to the extent that combustion is slow compared with the chamber's own blowdown time. Two limits worth memorising: $t_b \ll \tau_e$ gives $p_{peak}\to p_{CV}$ (the throat is irrelevant); $t_b \gg \tau_e$ gives $p_{peak}\to \dot m_{in}c^*/A_t$, which is just a normal start.
- **Assumes** — lumped chamber; constant product temperature; choked throat from $t = 0$; constant burn rate.
- **Fails when** — $t_b$ is so short the process is a detonation (the lumped assumption dies with it); combustion is so slow the chamber simply transitions into a normal start, which is the successful case.
- **Tag** [F] [A] · **Code** —

### 08-3.4 — Maximum allowable ignition delay

$$\tau_{d,max} = \frac{p_{lim}V_c}{\phi\,\dot m\,R\,T_v}\qquad\text{(unvented, conservative)}$$

- **Variables** — $\tau_{d,max}$ [s]; $p_{lim}$ peak chamber pressure the structure is qualified to [Pa]; $V_c$ [m³]; $\phi$ [—]; $\dot m$ [kg/s]; $R$ [J/(kg·K)]; $T_v$ [K].
- **Meaning** — the ignition-delay budget is set by structure, not by chemistry. This is why "ignition detected within X ms" is a redline, not a preference.
- **Assumes** — 08-3.2's assumptions plus constant start flow.
- **Fails when** — the structural limit is not a pressure but an impulse; thin-walled regen chambers can survive a very short spike above static proof pressure, and this is sometimes credited — but only with test evidence.
- **Tag** [F] [J] · **Code** —

### 08-3.5 — Minimum ignition energy

$$\mathrm{MIE} \sim \rho_u c_p (T_f-T_u)\,\frac{\pi}{6}d_q^3$$

- **Variables** — MIE [J]; $\rho_u$ unburned gas density [kg/m³]; $c_p$ [J/(kg·K)]; $T_f$, $T_u$ flame and unburned temperatures [K]; $d_q$ quenching distance [m].
- **Meaning** — MIE is a *geometric* statement: you must heat a critical volume, not deposit a critical energy density.
- **Assumes** — spherical kernel; constant properties; quenching distance as the critical scale.
- **Fails when** — the mixture is flowing (convection strips the kernel); the mixture is two-phase (droplets absorb spark energy in vaporization); at high pressure, where $d_q$ shrinks and the scaling breaks down against electrode geometry.
- **Tag** [E] [A] · **Code** —

### 08-3.6 — Igniter flow fraction

$$f_{ig} = \frac{\dot m_{ig}}{\dot m}\quad\text{typically}\quad 0.001\ \text{to}\ 0.02$$

- **Variables** — $f_{ig}$ igniter flow fraction [—]; $\dot m_{ig}$ igniter propellant flow [kg/s]; $\dot m$ mainstage flow [kg/s].
- **Meaning** — an empirical band, not a derivation: igniters below it tend to be blown out, igniters above it pay mass and complexity for nothing.
- **Assumes** — a torch whose jet is aimed into the main injector's flow field.
- **Fails when** — the main chamber is very large relative to the igniter's jet penetration; penetration, not flow fraction, is then binding, and multiple igniters or a centrally located one is required.
- **Tag** [E] [J] · **Code** —

### 08-3.7 — Igniter throat sizing

$$A_{t,ig} = \frac{\dot m_{ig}\,c^*_{ig}}{p_{ig}},\qquad p_{ig}\gtrsim 1.2\,p_c$$

- **Variables** — $A_{t,ig}$ igniter throat area [m²]; $\dot m_{ig}$ [kg/s]; $c^*_{ig}$ the igniter's own characteristic velocity at its deliberately fuel-rich (hence cool) mixture ratio [m/s]; $p_{ig}$ igniter chamber pressure [Pa]; $p_c$ main chamber pressure [Pa].
- **Meaning** — the igniter is a choked-flow device that must stay choked against main chamber pressure at every point in the start and, if it runs through mainstage, at full $p_c$.
- **Assumes** — choked igniter throat; steady flow.
- **Fails when** — the igniter is shut off at mainstage (it then need only exceed chamber pressure at the moment of ignition); the igniter is fed from a blowdown bottle whose pressure decays.
- **Tag** [F] [J] on the 1.2 factor · **Code** `throat_area_from_thrust`-style rearrangement of `choked_mdot`

---

## Module 09 — Nozzles

### 09-3.1 — Throat area from mass flow

$$A_t = \frac{\dot m\,c^*}{p_c}$$

- **Variables** — $A_t$ throat area [m²]; $\dot m$ total propellant mass flow [kg/s]; $c^*$ delivered characteristic velocity [m/s]; $p_c$ chamber stagnation pressure [Pa].
- **Meaning** — the throat is the area that will pass the required flow at the required chamber pressure.
- **Assumes** — choked flow; $c^*$ referenced to the same pressure station as $p_c$; the *same* $A_t$ definition (geometric, not effective).
- **Fails when** — the nozzle is unchoked (start-up, deep throttle at low $p_c$ against significant back pressure); $c^*$ was measured against a different pressure tap; the throat has eroded (a solid-motor problem — in a liquid engine a throat changing size is a failure).
- **Tag** [F] · **Code** rearrangement of `choked_mdot(...)`
- **Alias** — 06-3.3 inverted.

### 09-3.2 — Throat area from thrust

$$A_t = \frac{F}{p_c\,C_F}$$

- **Variables** — $F$ thrust at the stated ambient pressure [N]; $C_F$ thrust coefficient at that ambient pressure [—]; $p_c$ [Pa].
- **Meaning** — the throat is the area that turns available chamber pressure into required thrust, given how good the nozzle is.
- **Assumes** — $C_F$ and $F$ refer to the same $p_a$; $C_F$ includes the nozzle efficiency you actually expect.
- **Fails when** — the flow is separated (the attached-flow $C_F$ is then wrong); and silently, when a vacuum $C_F$ is used with a sea-level thrust requirement.
- **Tag** [F] [J] · **Code** `throat_area_from_thrust(F, p0, Cf_val)`
- **Alias** — 03-3.11.

### 09-3.3 — Throat arc geometry

$$x_N = R_d\sin\theta_n,\qquad r_N = r_t + R_d\left(1-\cos\theta_n\right)$$

- **Variables** — $(x_N, r_N)$ coordinates of the downstream arc's end, the contour's inflection point [m], measured from the throat plane on the axis; $R_d$ downstream throat radius of curvature [m]; $r_t$ throat radius [m]; $\theta_n$ initial wall angle at the inflection [rad].
- **Meaning** — where the bell contour proper begins.
- **Assumes** — a circular arc tangent to the throat plane.
- **Fails when** — the contour is defined by a full method-of-characteristics solution that does not use a circular arc, as some modern designs do not.
- **Tag** [F] [J] · **Code** —

### 09-3.4 — Chamber Mach number from contraction ratio

$$\varepsilon_c = \frac{1}{M_c}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M_c^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $\varepsilon_c$ contraction ratio [—]; $M_c$ chamber Mach number [—]; $\gamma$ [—].
- **Meaning** — how fast the gas is already moving when it reaches the injector-face end of the convergent section.
- **Assumes** — isentropic, uniform, no heat addition *in the convergent* (heat addition happens upstream).
- **Fails when** — combustion is still occurring in the convergent, which it is in a short chamber, and which is why the real chamber pressure profile is not isentropic.
- **Tag** [F] [A] · **Code** `mach_from_area_ratio(gamma, eps, supersonic=False)`
- **Alias** — 02-3.11, 06-3.6.

### 09-3.5 — Exit pressure ratio and expansion ratio

$$\frac{p_e}{p_c} = \left(1+\frac{\gamma-1}{2}M_e^2\right)^{-\frac{\gamma}{\gamma-1}},
\qquad
\varepsilon = \frac{1}{M_e}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M_e^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $M_e$ exit Mach number [—]; $\varepsilon = A_e/A_t$ [—]; $p_e$, $p_c$ [Pa].
- **Meaning** — fix the area ratio and you have fixed the exit pressure ratio; there is no other knob.
- **Assumes** — isentropic, calorically perfect, attached, 1-D flow.
- **Fails when** — the flow separates (then $p_e$ is *not* the wall pressure at the exit); real-gas or finite-rate effects shift $\gamma$ along the nozzle (they do, by 0.02–0.05 in a hydrogen engine); in the transonic region near the throat where the 1-D assumption is worst.
- **Tag** [F] [A] · **Code** `area_ratio`, `p0_over_p`, `mach_from_area_ratio`

### 09-3.6 — Conical divergence efficiency

$$\lambda = \frac{1+\cos\alpha}{2}$$

- **Variables** — $\lambda$ divergence efficiency [—]; $\alpha$ cone half-angle [rad].
- **Meaning** — the fraction of exit momentum flux that points along the axis; multiply the *momentum* term of $C_F$ by it. For the reference 15° cone, $\lambda = 0.983$.
- **Assumes** — conical nozzle; uniform speed on a spherical exit cap; source flow from a virtual apex; no boundary layer.
- **Fails when** — the contour is not conical (a bell's exit flow is not uniform source flow, and this is not a valid estimate for it); it also says nothing about friction or chemistry. Applies to the momentum term only — the pressure term $(p_e - p_a)A_e$ is already axial.
- **Tag** [F] [A] · **Code** —

### 09-3.7 — Conical nozzle length

$$L_n = \frac{r_t\left(\sqrt{\varepsilon}-1\right) + R_d\left(\sec\alpha - 1\right)}{\tan\alpha}$$

- **Variables** — $L_n$ axial length from throat plane to exit plane [m]; $r_t$ throat radius [m]; $\varepsilon$ [—]; $R_d$ downstream throat radius of curvature [m] (take $1.5\,r_t$ for the reference 15° cone); $\alpha$ [rad].
- **Meaning** — the length a conical nozzle needs; the baseline against which "80 % bell" is defined.
- **Assumes** — circular throat arc tangent to a straight cone.
- **Fails when** — the contour is not conical. The first term dominates; the arc term is a few per cent.
- **Tag** [F] · **Code** —

### 09-3.8 — Rao parabolic (quadratic Bézier) contour

$$\begin{pmatrix}x(t)\\ r(t)\end{pmatrix} = (1-t)^2\begin{pmatrix}x_N\\ r_N\end{pmatrix} + 2(1-t)t\begin{pmatrix}x_Q\\ r_Q\end{pmatrix} + t^2\begin{pmatrix}L_n\\ r_e\end{pmatrix},\qquad t\in[0,1]$$

- **Variables** — $t$ curve parameter [—]; $(x_N, r_N)$ inflection point [m]; $(x_Q, r_Q)$ tangent-intersection control point [m]; $(L_n, r_e)$ exit point [m].
- **Meaning** — a two-parameter ($\theta_n$, $\theta_e$) family that reproduces the method-of-characteristics optimum contour closely enough for hardware.
- **Assumes** — the $\theta_n, \theta_e$ pair is taken from the Rao charts for the intended $\varepsilon$ and percentage length; throat arc $R_d = 0.382\,r_t$.
- **Fails when** — the nozzle is very short (below ~60 % bell, where the parabola departs noticeably from the optimum); at very high $\varepsilon$ where the exit-lip characteristic assumptions weaken; and always in the sense that the true optimum is a viscous, reacting, 3-D problem this does not touch.
- **Tag** [E] · **Code** —

### 09-3.9 — Friction (boundary-layer) efficiency, order of magnitude

$$\eta_f \approx 1 - \frac{\bar\tau_w S_w}{F}$$

- **Variables** — $\eta_f$ [—]; $\bar\tau_w$ mean wall shear stress [Pa]; $S_w$ wetted area of the divergent [m²]; $F$ thrust [N].
- **Meaning** — the friction loss is a drag force over a thrust; typically 0.5–1.5 % of $C_F$.
- **Assumes** — shear can be represented by a mean value; ignores the displacement effect, so it *over*states the loss.
- **Fails when** — the flow is separated; there is significant film or transpiration cooling (which thickens the layer and changes $\bar\tau_w$ substantially); very small nozzles where the boundary layer is a large fraction of the radius and may be laminar. Use for scaling, not prediction; the real calculation is a boundary-layer code on the actual contour, as JANNAF requires.
- **Tag** [A] [E] · **Code** —

### 09-3.10 — Nozzle efficiency budget

$$\eta_n = \lambda\;\eta_f\;\eta_{kin}\;\eta_{2\phi},
\qquad C_{F,\,delivered} = \eta_n\,C_{F,\,ideal}$$

- **Variables** — $\lambda$ divergence [—]; $\eta_f$ friction/boundary layer [—]; $\eta_{kin}$ kinetic (finite-rate chemistry) [—]; $\eta_{2\phi}$ two-phase (condensed-phase lag; unity for a liquid engine with no condensed products) [—].
- **Meaning** — the multiplicative loss chain from the ideal 1-D equilibrium nozzle to the real one.
- **Assumes** — the losses are independent enough to multiply, which is an approximation: film cooling couples $\eta_f$ and $\eta_{kin}$, and separation couples everything.
- **Fails when** — the flow separates; the budget is then meaningless and the separated $C_F$ must be obtained directly. The rigorous version is the JANNAF simplified/standard methodology, which contracts are written against.
- **Tag** [E] · **Code** —
- **Alias** — the $\eta_{C_f}$ of 03-3.15 is $\eta_n$ here, decomposed.

### 09-3.11 — Thrust versus altitude at fixed geometry

$$F(h) = C_{F,vac}\,p_c A_t - p_a(h)\,A_e = p_c A_t\left[C_{F,vac} - \frac{p_a(h)}{p_c}\varepsilon\right]$$

- **Variables** — $F(h)$ thrust at altitude $h$ [N]; $p_a(h)$ ambient pressure [Pa]; $C_{F,vac}$ [—]; $\varepsilon$ [—].
- **Meaning** — a nozzle's thrust rises with altitude by exactly the ambient force on its exit area, and the vacuum term is a pure geometry constant.
- **Assumes** — attached flow at all altitudes of interest; fixed $p_c$ (the engine is not throttled).
- **Fails when** — the flow separates at low altitude; the effective $A_e$ is then the separated area, not the geometric one.
- **Tag** [F] · **Code** `Cf(gamma, eps, p0, pa)`

### 09-3.12 — Break-even ambient pressure between two expansion ratios

$$p_{a,\,BE} = p_c\,\frac{C_{F,vac}(\varepsilon_2)-C_{F,vac}(\varepsilon_1)}{\varepsilon_2-\varepsilon_1}$$

- **Variables** — $p_{a,BE}$ break-even ambient pressure [Pa]; $C_{F,vac}$ vacuum thrust coefficient, a function of $\gamma$ and $\varepsilon$ only [—].
- **Meaning** — below this ambient pressure (above this altitude) the larger nozzle wins; above it the smaller one does. This is the whole altitude-optimisation trade in one line.
- **Assumes** — same throat, same $p_c$, attached flow in both — check the larger nozzle against a separation criterion at sea level before believing the low-altitude end.
- **Fails when** — the comparison is at constant *thrust* rather than constant throat (the throats then differ and so does the whole engine); the larger nozzle separates. Convert $p_{a,BE}$ to altitude with a standard atmosphere.
- **Tag** [F] · **Code** `Cf(gamma, eps, p0, 0.0)` for each $\varepsilon$

### 09-3.13 — The two separation criteria side by side

$$\text{Summerfield: } p_{sep} \approx 0.4\,p_a
\qquad
\text{Schmucker: } \frac{p_{sep}}{p_a} = \left(1.88\,M_{sep}-1\right)^{-0.64}$$

- **Variables** — $p_{sep}$ wall static pressure at separation [Pa]; $p_a$ [Pa]; $M_{sep}$ local Mach number just upstream of separation [—].
- **Meaning** — the wall pressure a turbulent boundary layer can survive before the adverse gradient from ambient recompression pushes it off the wall.
- **Assumes** — conical or near-conical wall; turbulent attached layer; steady operation.
- **Fails when** — the contour is thrust-optimised and the separation is restricted (RSS); during start and shutdown transients; outside the $M \approx 2$–5 fit range for Schmucker. The two criteria routinely disagree by 20–40 % in separation *area*, and in marginal cases about whether the nozzle separates at all.
- **Tag** [E] · **Code** `summerfield_separation_pressure(p0, frac)`, `schmucker_separation(pa, Me)`
- **Alias** — 02-3.21/3.22, 03-3.12/3.13.

### 09-3.14 — Half-and-half side-load model

$$F_{side} = 2\,\Delta p\int_{x_1}^{x_2} r(x)\,dx \approx 2\,\Delta p\,\bar r\,\Delta x$$

- **Variables** — $F_{side}$ lateral force [N]; $\Delta p = |p_A - p_B|$ circumferential pressure difference [Pa]; $\bar r$ mean wall radius over the band [m]; $\Delta x$ axial extent of the asymmetry [m].
- **Meaning** — an asymmetric wall pressure over an area produces a lateral force equal to twice the pressure difference times the *projected* side area of the band. This is what breaks gimbal actuators during start transients.
- **Assumes** — a clean half-and-half circumferential split (the worst realistic case for a given $\Delta p$ and $\Delta x$); nearly cylindrical wall over the band; quasi-steady.
- **Fails when** — the asymmetry is a smoothly varying tilt rather than a step (the answer is then smaller by a factor of order 2); it also says nothing about the *frequency content*, which is what determines whether the nozzle's bending modes are excited.
- **Tag** [F] [A] · **Code** —

---

## Module 10 — Heat Transfer

### 10-3.1 — Recovery factor

$$r \equiv \frac{T_{aw}-T_\infty}{T_0-T_\infty}$$

- **Variables** — $r$ recovery factor [—]; $T_{aw}$ adiabatic wall temperature [K]; $T_\infty$ local free-stream static temperature [K]; $T_0$ local stagnation temperature [K].
- **Meaning** — the fraction of free-stream kinetic energy actually recovered as temperature rise at an insulated wall. $r \approx \mathrm{Pr}^{1/3} \approx 0.9$ turbulent, $\mathrm{Pr}^{1/2} \approx 0.85$ laminar.
- **Assumes** — a boundary layer in local equilibrium; constant Pr.
- **Fails when** — the gas is chemically reacting inside the boundary layer with a different effective Pr (it is, mildly, in a rocket); the boundary layer is separated.
- **Tag** [F] [E] · **Code** —

### 10-3.2 — Adiabatic wall temperature

$$T_{aw} = T_\infty\left[1 + r\frac{\gamma-1}{2}M^2\right]
= T_0\,\frac{1+r\frac{\gamma-1}{2}M^2}{1+\frac{\gamma-1}{2}M^2}$$

- **Variables** — $T_{aw}$ [K]; $T_0$ chamber stagnation temperature [K]; $\gamma$ [—]; $M$ local Mach number [—]; $r$ [—].
- **Meaning** — the temperature the gas "presents" to the wall as a driving potential. It is *not* $T_0$ and it is *not* $T_\infty$; using either is a common and large error.
- **Assumes** — calorically perfect gas; adiabatic stagnation upstream; constant $r$.
- **Fails when** — recombination in the boundary layer releases chemical energy at the wall (a real effect in H₂/O₂, worth up to a few percent); the free stream is not isentropic (after a shock in an over-expanded nozzle).
- **Tag** [F] · **Code** `adiabatic_wall_T(T0, gamma, Mach, r=0.9)`

### 10-3.3 — Gas-side film coefficient definition

$$q'' = h_g\,(T_{aw}-T_{wg})$$

- **Variables** — $q''$ heat flux [W/m²]; $h_g$ gas-side film coefficient [W/(m²·K)]; $T_{aw}$ [K]; $T_{wg}$ gas-side wall temperature [K].
- **Meaning** — Newton's law of cooling on the gas side; the definition of $h_g$.
- **Assumes** — $h_g$ independent of $T_{wg}$ — which is *false* in a rocket, because the Bartz $\sigma$ depends on $T_{wg}$; the equation must therefore be solved iteratively with the wall model.
- **Fails when** — film cooling, a soot layer, or ablation puts something between gas and wall, in which case $h_g$ is no longer the resistance that matters.
- **Tag** [F] · **Code** `heat_flux(hg, Taw, Twg)`
- **Alias** — 11-3.1 is the same equation with worked numbers.

### 10-3.4 — Bartz correlation

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\right)_0
\left(\frac{p_0}{c^*}\right)^{0.8}\left(\frac{D_t}{R_u}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

- **Variables** — $h_g$ [W/(m²·K)]; $D_t$ throat diameter [m]; $\mu_0$ stagnation viscosity [Pa·s]; $c_{p0}$ stagnation specific heat [J/(kg·K)]; $\mathrm{Pr}_0$ stagnation Prandtl number [—]; $p_0$ chamber stagnation pressure [Pa]; $c^*$ [m/s] — use the **delivered** value, because $p_0/c^*$ *is* the throat mass flux $\dot m/A_t$; $R_u$ throat upstream wall radius of curvature [m]; $A/A_t$ local area ratio [—]; $\sigma$ property correction [—].
- **Meaning** — a fully developed turbulent pipe-flow heat-transfer coefficient re-expressed in rocket variables and corrected for property variation and throat curvature. The workhorse of chamber thermal design.
- **Assumes** — attached turbulent boundary layer; smooth wall; quasi-1-D area distribution; no film cooling; no deposits; properties frozen at the stagnation composition.
- **Fails when** — any of those is broken. Accuracy ±20–30 % at the throat, worse in the chamber and far downstream.
- **Tag** [E] · **Code** `bartz_hg(Dt, mu0, cp0, Pr0, p0, c_star_val, rc, A_ratio, sigma)`
- **Alias** — ⚠ $R_u$ here is the throat wall **radius of curvature** [m], not the universal gas constant. `rocket.py` names it `rc`.

### 10-3.5 — Bartz property correction $\sigma$

$$\sigma = \left[\frac{1}{2}\frac{T_{wg}}{T_0}\left(1+\frac{\gamma-1}{2}M^2\right)
+\frac{1}{2}\right]^{-0.68}\left(1+\frac{\gamma-1}{2}M^2\right)^{-0.12}$$

- **Variables** — $\sigma$ [—]; $T_{wg}$ gas-side wall temperature [K]; $T_0$ [K]; $\gamma$ [—]; $M$ [—].
- **Meaning** — corrects a stagnation-property coefficient for the real density and viscosity inside the boundary layer.
- **Assumes** — $\rho \propto T^{-1}$ at constant pressure; $\mu \propto T^{0.6}$; arithmetic-mean reference temperature.
- **Fails when** — the wall is hot enough that $T_{wg}/T_0 \to 1$ (then $\sigma \to 1$ and the correction is pointless); the gas composition changes across the layer (recombination); the wall is transpiration-cooled.
- **Tag** [E] [A] · **Code** `bartz_sigma(gamma, Mach, Tw_over_T0)`

### 10-3.6 — Series thermal resistance chain

$$q'' = \frac{T_{aw}-T_{co}}{\dfrac{1}{h_g}+\dfrac{t_w}{k}+\dfrac{1}{h_c}}
= \frac{T_{aw}-T_{co}}{R''_{tot}}$$

- **Variables** — $q''$ [W/m²]; $T_{aw}$ [K]; $T_{co}$ coolant bulk temperature [K]; $h_g, h_c$ [W/(m²·K)]; $t_w$ wall thickness [m]; $k$ wall conductivity [W/(m·K)]; $R''_{tot}$ [m²·K/W].
- **Meaning** — series thermal resistances add; the biggest one governs the design.
- **Assumes** — steady state; 1-D conduction; no internal heat generation; constant $k$; perfect contact between layers; $h_c$ referenced to the *plain* wall area (a ribbed or finned channel needs a fin-efficiency multiplier, Module 11).
- **Fails when** — transient (start-up, throttle step); there is contact resistance at a braze or bond line; circumferential conduction into channel lands matters (it does — the 1-D answer is conservative).
- **Tag** [F] · **Code** `heat_flux`, `wall_dT(q, t, k)`
- **Alias** — 11-3.4 with $h_{c,\mathrm{eff}}$ in place of $h_c$.

### 10-3.7 — Recovering the wall temperatures

$$T_{wg}=T_{aw}-\frac{q''}{h_g},\qquad
\Delta T_{wall}=\frac{q''t_w}{k},\qquad
T_{wc}=T_{wg}-\Delta T_{wall}$$

- **Variables** — $T_{wg}$ gas-side wall temperature [K]; $T_{wc}$ coolant-side wall temperature [K]; $\Delta T_{wall}$ through-wall drop [K]; others as 10-3.6.
- **Meaning** — the order of operations matters: you do **not** get to pick $T_{wg}$; it is an *output* of the resistance chain.
- **Assumes** — as 10-3.6.
- **Fails when** — as 10-3.6.
- **Tag** [F] · **Code** `wall_dT(q, t, k)`

### 10-3.8 — Elastic thermal stress in a constrained wall

$$\sigma_{th}=\frac{E\,\alpha\,\Delta T_{wall}}{2(1-\nu)}
=\frac{E\,\alpha\,q''\,t_w}{2\,k\,(1-\nu)}$$

- **Variables** — $\sigma_{th}$ [Pa]; $E$ Young's modulus at temperature [Pa]; $\alpha$ linear thermal expansion coefficient [1/K]; $\Delta T_{wall} = q'' t_w/k$ [K]; $\nu$ Poisson's ratio [—].
- **Meaning** — the in-plane stress generated by a linear gradient in a fully constrained plate: compressive on the hot face, tensile on the cold face. The driver of low-cycle fatigue in every regen liner.
- **Assumes** — linear elasticity; linear temperature profile; full in-plane constraint; temperature-independent properties; no superposed pressure or mechanical load.
- **Fails when** — $\sigma_{th} > \sigma_y$, which it always is for a rocket liner. After that the elastic answer is an *index*, not a stress, and an elastic-plastic cyclic analysis is required.
- **Tag** [F] [A] · **Code** `thermal_stress_hoop(E, alpha, dT, nu)`
- **Alias** — 11-3.14, identical.

### 10-3.9 — Semi-infinite solid under constant flux

$$T_s(t)-T_i = \frac{2q''}{k}\sqrt{\frac{\alpha_d t}{\pi}},
\qquad \alpha_d=\frac{k}{\rho_s c_s}$$

- **Variables** — $T_s$ surface temperature [K]; $T_i$ initial uniform temperature [K]; $q''$ constant applied flux [W/m²]; $k$ [W/(m·K)]; $\alpha_d$ thermal diffusivity [m²/s]; $\rho_s$ [kg/m³]; $c_s$ [J/(kg·K)]; $t$ time [s].
- **Meaning** — how fast an uncooled wall heats up under a fixed flux.
- **Assumes** — constant properties; constant flux; a body thick enough that the back face has not felt the pulse.
- **Fails when** — the thermal wave reaches the back face, i.e. $2\sqrt{\alpha_d t} \gtrsim L$; the wall then heats bodily and the temperature rise accelerates.
- **Tag** [F] · **Code** —

### 10-3.10 — Heat-sink survival time

$$t_{surv} = \frac{\pi}{\alpha_d}\left(\frac{k\,\Delta T_{allow}}{2q''}\right)^2
= \frac{\pi\,\rho_s c_s k \,\Delta T_{allow}^2}{4\,q''^2}$$

- **Variables** — $t_{surv}$ [s]; $\Delta T_{allow}$ allowable surface temperature rise [K]; $\rho_s c_s k$ [W²·s/(m⁴·K²)]; $q''$ [W/m²].
- **Meaning** — two scalings matter: $t_{surv}\propto q''^{-2}$ (halving the flux quadruples run time) and $t_{surv}\propto \rho_s c_s k$, the **thermal effusivity squared**. The group $\sqrt{\rho_s c_s k}$, not $k$ alone, makes a good heat sink — which is why copper and, surprisingly, graphite both work.
- **Assumes** — as 10-3.9.
- **Fails when** — as 10-3.9; also for a wall thin enough to saturate before $t_{surv}$.
- **Tag** [F] [A] · **Code** —

### 10-3.11 — Radiation from combustion gases to the wall

$$q''_{rad}=\varepsilon_w'\,\varepsilon_g\,\sigma_{SB}\left(T_g^4 - T_{wg}^4\right)$$

- **Variables** — $q''_{rad}$ [W/m²]; $\varepsilon_g$ gas emissivity [—]; $\varepsilon_w' \approx (\varepsilon_w+1)/2$ effective wall emissivity factor for a grey wall in a gas-filled enclosure [—]; $\sigma_{SB} = 5.670\times10^{-8}$ W/(m²·K⁴); $T_g$ gas temperature [K]; $T_{wg}$ [K].
- **Meaning** — net radiant exchange between an isothermal grey gas and its bounding wall; typically 5–20 % of chamber flux for sooty hydrocarbons, much less for H₂/O₂.
- **Assumes** — isothermal gas volume; grey gas; grey diffuse wall; no scattering.
- **Fails when** — the gas has a strong temperature gradient (it does in the nozzle — the chamber assumption is much better); soot loading is high enough to make the medium optically thick and the mean-beam-length idea meaningless.
- **Tag** [E] [A] · **Code** —

---

## Module 11 — Cooling Systems

### 11-3.1 — The flux the wall must reject

$$q'' = h_g\,(T_{aw} - T_{wg})$$

- **Variables** — $q''$ wall heat flux [W/m²]; $h_g$ [W/(m²·K)]; $T_{aw}$ [K]; $T_{wg}$ [K]. For a typical high-$p_c$ chamber: $1.8\times10^4 \times (3567-800) \approx 5\times10^7$ W/m².
- **Meaning** — the wall temperature you *choose* fixes the flux you must *remove*. Rocket throats run at $10^7$–$10^8$ W/m², two orders above a gas-turbine blade.
- **Assumes** — $h_g$ independent of $T_{wg}$ (it is not — see the Bartz $\sigma$); steady state; no radiation term.
- **Fails when** — the wall is soot-coated or carbon-deposited (both reduce effective $h_g$); radiation from soot particles is significant (hydrocarbon engines at low $p_c$); near an injection film where $T_{aw}$ is not the free-stream recovery temperature.
- **Tag** [F] · **Code** `heat_flux(hg, Taw, Twg)`
- **Alias** — 10-3.3.

### 11-3.2 — Lumped heat-sink wall

$$\rho_w c_{p,w} t_w \frac{dT_w}{dt} = q''$$

- **Variables** — $\rho_w$ wall density [kg/m³]; $c_{p,w}$ wall specific heat [J/(kg·K)]; $t_w$ wall thickness [m]; $q''$ [W/m²]; $t$ time [s]; $T_w$ [K].
- **Meaning** — lumped capacitance: the whole wall thickness heats uniformly, and burn duration is set by how much heat the wall can swallow.
- **Assumes** — Biot number $h_g t_w/k_w \ll 1$. For copper at $t_w \sim 20$ mm and $h_g \sim 10^4$ this is marginal ($Bi \approx 0.5$) — the real wall has a significant internal gradient and the front face runs hotter.
- **Fails when** — thin walls; poor conductors; any burn long enough for the back face to reach the front-face temperature.
- **Tag** [F] [A] · **Code** —

### 11-3.3 — Radiative cooling

$$q''_{rad} = \varepsilon_{em}\,\sigma_{SB}\,(T_w^4 - T_\infty^4)$$

- **Variables** — $\varepsilon_{em}$ surface emissivity [—]; $\sigma_{SB} = 5.670\times10^{-8}$ W/(m²·K⁴); $T_w$ outer wall temperature [K]; $T_\infty$ sink temperature [K] — effectively 0 for deep space, but **not** for a nozzle extension seeing the vehicle base or another engine's plume.
- **Meaning** — the only heat rejection available when there is no coolant; $T^4$ means radiative cooling is only viable above ~1300 K.
- **Assumes** — grey diffuse surface; unobstructed view to the sink.
- **Fails when** — view factors are blocked (nozzle extensions radiate to each other in a clustered stage); the coating providing $\varepsilon_{em}$ has spalled; above the coating's service temperature.
- **Tag** [F] · **Code** —

### 11-3.4 — Regenerative wall as a series resistance

$$q'' = \frac{T_{aw} - T_b}{\dfrac{1}{h_g} + \dfrac{t_w}{k_w} + \dfrac{1}{h_{c,\mathrm{eff}}}}$$

- **Variables** — $T_{aw}$ [K]; $T_b$ coolant bulk temperature at this station [K]; $h_g$ [W/(m²·K)]; $t_w$ hot-wall thickness [m]; $k_w$ liner conductivity [W/(m·K)]; $h_{c,\mathrm{eff}}$ coolant-side coefficient referred to gas-side area [W/(m²·K)].
- **Meaning** — the whole regenerative cooling problem in one line: three resistances, and the biggest one governs.
- **Assumes** — 1-D radial conduction; steady state; no contact resistance at a braze or closeout joint; constant properties across the wall; no circumferential variation.
- **Fails when** — the wall is thick relative to the channel pitch (land conduction is then 2-D and this underestimates $T_{wg}$ over the land); at a braze joint with real contact resistance; transiently during start and shutdown, where the liner's thermal time constant (milliseconds for 1 mm of copper) matters for low-cycle fatigue.
- **Tag** [F] · **Code** `heat_flux`, `wall_dT`
- **Alias** — 10-3.6.

### 11-3.5 — The three temperatures that matter

$$T_{wg} = T_{aw} - \frac{q''}{h_g}, \qquad
\Delta T_w = \frac{q'' t_w}{k_w}, \qquad
T_{wc} = T_b + \frac{q''}{h_{c,\mathrm{eff}}}$$

- **Variables** — as 11-3.4; all temperatures [K].
- **Meaning** — $T_{wg}$ is limited by the liner alloy's strength and creep; $\Delta T_w$ drives the thermal strain that causes low-cycle fatigue and the "dog-house" bulge failure; $T_{wc}$ is limited by coolant decomposition — coking for hydrocarbons, nothing much for hydrogen.
- **Assumes** — as 11-3.4.
- **Fails when** — as 11-3.4.
- **Tag** [F] · **Code** `wall_dT(q, t, k)`
- **Alias** — 10-3.7, 05-3.6 (the $T_{wc}$ form).

### 11-3.6 — Land-as-fin effectiveness

$$m = \sqrt{\frac{2 h_c}{k_w t_L}}, \qquad
\eta_f = \frac{\tanh(m\,h_{ch})}{m\,h_{ch}}, \qquad
\Phi = \frac{w + 2\eta_f h_{ch}}{p_{ch}}, \qquad
h_{c,\mathrm{eff}} = \Phi\, h_c$$

- **Variables** — $m$ fin parameter [1/m]; $h_c$ coolant-side coefficient on the wetted channel surface [W/(m²·K)]; $k_w$ [W/(m·K)]; $t_L$ land width [m]; $h_{ch}$ channel height [m]; $w$ channel width [m]; $p_{ch}$ pitch [m]; $\eta_f$ fin efficiency [—]; $\Phi$ area enhancement referred to gas-side area [—].
- **Meaning** — the lands are the reason a milled channel beats a plain annulus by a factor of two.
- **Assumes** — 1-D conduction along the land; uniform $h_c$ over the land; adiabatic tip; constant $k_w$.
- **Fails when** — the land is short and thick (not a fin at all; 2-D conduction needed); the aspect ratio is very high (the tip is not adiabatic and $h_c$ is not uniform down a tall narrow slot); $k_w$ falls sharply with temperature, as it does for copper alloys above ~700 K.
- **Tag** [F] [A] · **Code** —

### 11-3.7 — Dittus–Boelter coolant-side coefficient

$$h_c = 0.023\,\frac{k_c}{D_h}\,Re_c^{0.8}\,Pr_c^{n}, \qquad n = 0.4\ \text{(heating)}$$

- **Variables** — $h_c$ [W/(m²·K)]; $k_c$ coolant thermal conductivity [W/(m·K)]; $D_h$ hydraulic diameter [m]; $Re_c = \rho_c V_c D_h/\mu_c$ [—]; $Pr_c = c_{p,c}\mu_c/k_c$ [—]; $n = 0.4$ heating, 0.3 cooling.
- **Meaning** — turbulent forced convection in a smooth round tube; the default coolant-side model.
- **Assumes** — $Re > 10^4$; $0.6 < Pr < 160$; $L/D > 10$; fully developed; **small property variation across the boundary layer**; smooth wall; no curvature.
- **Fails when** — the wall-to-bulk temperature ratio is large (always, in a rocket jacket — hence the corrections); near the critical point; in boiling; in a strongly curved passage; in a rectangular duct at high aspect ratio (use $D_h$ and accept ±15 %). Accuracy in a rocket channel **±25 % at best**, systematically optimistic for supercritical fluids near $T_{pc}$.
- **Tag** [E] · **Code** `dittus_boelter(k, D, Re, Pr, n=0.4)`
- **Alias** — 05-3.6, 10 companion to Bartz.

### 11-3.8 — Sieder–Tate wall-viscosity correction

$$h_c = 0.027\,\frac{k_c}{D_h}\,Re_c^{0.8}\,Pr_c^{1/3}\left(\frac{\mu_b}{\mu_w}\right)^{0.14}$$

- **Variables** — as 11-3.7, plus $\mu_b$ viscosity at bulk temperature and $\mu_w$ at wall temperature [Pa·s].
- **Meaning** — corrects for property distortion across a thermal boundary layer with a large $\Delta T$.
- **Assumes** — as 11-3.7, but tolerates larger property variation.
- **Fails when** — near critical; in boiling; for gases, where the correction should be a temperature ratio rather than a viscosity ratio.
- **Tag** [E] · **Code** —

### 11-3.9 — Curvature (Dean) enhancement

$$\frac{h_{c,\mathrm{curved}}}{h_{c,\mathrm{straight}}} = \left[Re_c\left(\frac{D_h}{2R_c}\right)^{2}\right]^{0.05}$$

- **Variables** — $R_c$ radius of curvature of the channel centreline in the meridional plane [m]; $D_h$ [m]; $Re_c$ [—].
- **Meaning** — an empirical Dean-number correction; the concave side of a curved channel transfers more heat.
- **Assumes** — turbulent, mild curvature, single phase.
- **Fails when** — curvature is sharp enough to separate the flow; on the convex side, where curvature *suppresses* turbulence and heat transfer falls. Use as a design allowance, not a prediction; measured values scatter by a factor of two.
- **Tag** [E] · **Code** —

### 11-3.10 — Darcy–Weisbach channel pressure drop

$$\Delta p_f = f\,\frac{L}{D_h}\,\frac{\rho_c V_c^2}{2}$$

- **Variables** — $\Delta p_f$ [Pa]; $f$ Darcy friction factor [—]; $L$ channel length along the path [m]; $D_h$ [m]; $\rho_c$ [kg/m³]; $V_c$ [m/s].
- **Meaning** — frictional loss in the cooling channel; typically 10–30 % of $p_c$ and a major term in the pump budget.
- **Assumes** — fully developed; incompressible; constant properties; constant area.
- **Fails when** — coolant density changes along the channel (always, in a heated channel — integrate in segments); the channel area is tapered (integrate); at very high heat flux, where the near-wall viscosity change alters $f$.
- **Tag** [F] [E] · **Code** —

### 11-3.11 — Haaland friction factor

$$\frac{1}{\sqrt f} = -1.8\log_{10}\left[\left(\frac{\epsilon/D_h}{3.7}\right)^{1.11} + \frac{6.9}{Re}\right]$$

- **Variables** — $f$ [—]; $\epsilon$ absolute roughness [m]; $D_h$ [m]; $Re$ [—].
- **Meaning** — an explicit approximation to Colebrook for a rough turbulent duct; within 2 % of the implicit solution.
- **Assumes** — fully rough or transitional turbulent flow; circular-duct equivalence via $D_h$.
- **Fails when** — laminar; roughness elements comparable to $D_h$ (as in some additively manufactured channels, where $\epsilon/D_h$ can exceed the correlation's range).
- **Tag** [E] · **Code** —

### 11-3.12 — Fuel-pump discharge pressure budget

$$p_{\mathrm{pump,disch}} = p_{c,\mathrm{inj}} + \Delta p_{\mathrm{inj}} + \Delta p_j + \Delta p_{\mathrm{lines,valves}}$$

- **Variables** — all pressures [Pa]; $\Delta p_j$ jacket drop.
- **Meaning** — the fuel pump discharge pressure budget; every pascal of jacket drop is pump work.
- **Assumes** — fuel is the coolant and the circuit is jacket-then-injector, the usual arrangement.
- **Fails when** — the coolant is a separate fluid (Viking's water); a dump-cooled or bleed circuit discharges to a turbine or overboard rather than to the injector.
- **Tag** [F] · **Code** —
- **Alias** — 06-3.13 with the Rayleigh term shown separately.

### 11-3.13 — The $h_c$–$\Delta p$ trade

$$h_c \propto V^{0.8} D_h^{-0.2} \propto A_{ch}^{-0.9}, \qquad
\Delta p \propto \frac{V^{1.8}}{D_h^{1.2}} \propto A_{ch}^{-2.4}$$

- **Variables** — $A_{ch}$ channel flow area [m²]; $V$ coolant velocity [m/s]; $D_h$ [m].
- **Meaning** — **halving the channel area buys 87 % more $h_c$ and costs 5.3× the pressure drop.** The central design tension of a regenerative jacket.
- **Assumes** — Dittus–Boelter; $f = 0.184 Re^{-0.2}$; fixed aspect ratio; fixed mass flow; constant properties.
- **Fails when** — very low $Re$; the supercritical deterioration regime; where fin efficiency changes materially (a taller channel at fixed width has worse $\eta_f$, which this ignores).
- **Tag** [F] [A] · **Code** —

### 11-3.14 — Elastic thermal stress in a restrained liner

$$\sigma_{th} \approx \frac{E\,\alpha\,\Delta T_w}{2(1-\nu)}$$

- **Variables** — $E$ Young's modulus [Pa]; $\alpha$ coefficient of thermal expansion [1/K]; $\Delta T_w$ through-wall temperature difference [K]; $\nu$ [—].
- **Meaning** — the elastic thermal stress in a fully restrained wall with a linear through-thickness gradient.
- **Assumes** — elastic; fully restrained; linear gradient; temperature-independent properties.
- **Fails when** — immediately, because a real copper liner **yields** on the first cycle. This tells you the elastic stress you would need; when it exceeds yield (it always does, by 2–5×) you are in the low-cycle-fatigue regime and must design to strain, not stress.
- **Tag** [F] [A] · **Code** `thermal_stress_hoop(E, alpha, dT, nu)`
- **Alias** — 10-3.8, identical.

### 11-3.15 — Film-cooling enthalpy capacity

$$\Delta h_{film} = c_{p,\ell}\,(T_{sat} - T_{inj}) + h_{fg}$$

- **Variables** — $\Delta h_{film}$ enthalpy the film absorbs per kg [J/kg]; $c_{p,\ell}$ liquid specific heat [J/(kg·K)]; $T_{sat}$ effective vaporisation temperature at chamber pressure [K]; $T_{inj}$ injection temperature [K]; $h_{fg}$ latent heat [J/kg]; with $\dot m_{film}$ [kg/s], $\bar q''$ mean wall flux over the filmed length [W/m²], $D_c$ chamber diameter [m], $L_{film}$ length over which the film survives [m].
- **Meaning** — sizes the film flow for a required covered length.
- **Assumes** — all wall heat over $L_{film}$ goes into the film; the film stays attached and uniform; no entrainment loss into the core; no combustion of the film.
- **Fails when** — on every one of those to some degree. **Entrainment by the high-velocity core is the dominant loss mechanism** and can carry away 30–60 % of the film before it has done its job. Use as a lower bound and apply a 1.5–2× factor.
- **Tag** [E] [J] · **Code** `coolant_bulk_rise(Q, mdot, cp)` for the sensible part

### 11-3.16 — Film-cooling effectiveness

$$\eta_{fc} = \frac{T_{aw} - T_{aw,\mathrm{film}}}{T_{aw} - T_{c,\mathrm{inj}}}$$

- **Variables** — $\eta_{fc}$ [—]; $T_{aw,\mathrm{film}}$ effective adiabatic wall temperature with film present [K]; $T_{c,\mathrm{inj}}$ film injection temperature [K].
- **Meaning** — the fraction of available temperature depression the film actually delivers.
- **Assumes** — the film mixes only with the boundary layer.
- **Fails when** — $\eta_{fc}$ decays along the chamber roughly as $x^{-0.5}$ to $x^{-0.8}$ and is essentially spent within 10–20 slot heights on a high-shear rocket wall — which is why film is injected from the **injector face** for the barrel and needs a **separate slot** to protect the throat.
- **Tag** [E] · **Code** —

### 11-3.17 — Performance penalty of film cooling

$$\frac{I_{sp}}{I_{sp,core}} = (1 - x_{fc}) + x_{fc}\,\frac{I_{sp,film}}{I_{sp,core}}
\quad\Rightarrow\quad
\frac{\Delta I_{sp}}{I_{sp}} = x_{fc}\left(1 - \frac{I_{sp,film}}{I_{sp,core}}\right)$$

- **Variables** — $x_{fc}$ film flow as a fraction of *total* engine flow [—]; $I_{sp,film}/I_{sp,core}$ effective performance ratio of the film stream, typically **0.6–0.8** for a fuel film in a hydrocarbon engine.
- **Meaning** — a stream-thrust weighted average: 5 % film at a 0.7 ratio costs 1.5 % $I_{sp}$.
- **Assumes** — the two streams do not interact — wrong, but conservative in the right direction; ignores the small *benefit* that a cooler wall boundary layer slightly reduces the boundary-layer $I_{sp}$ loss.
- **Fails when** — gas-generator exhaust is used as film (the F-1's nozzle curtain): that flow was already committed as a cycle loss and the marginal penalty is **zero**. Do not double-count it.
- **Tag** [E] · **Code** —

### 11-3.18 — Ablative liner thickness

$$t_{abl} = FS \cdot \dot s \cdot t_{burn} + t_{residual}$$

- **Variables** — $t_{abl}$ liner thickness [m]; $FS$ factor of safety, typically 1.3–1.5 [—]; $\dot s$ recession rate [m/s]; $t_{burn}$ total accumulated burn time [s]; $t_{residual}$ virgin material that must remain at end of life [m].
- **Meaning** — linear-recession sizing for an ablative chamber or throat.
- **Assumes** — steady char-front recession, reached after a transient of a few seconds.
- **Fails when** — pulsed duty (the char cools and cracks between pulses, and recession per second is higher than in a continuous burn); at the throat, where mechanical erosion adds to chemical ablation; restart-heavy profiles.
- **Tag** [E] [J] · **Code** —

### 11-3.19 — Radiation-cooled equilibrium wall temperature

$$\varepsilon_{em}\sigma_{SB}T_w^4 = h_g(T_{aw} - T_w)$$

- **Variables** — $\varepsilon_{em}$ [—]; $\sigma_{SB}$ [W/(m²·K⁴)]; $T_w$ [K]; $h_g$ [W/(m²·K)]; $T_{aw}$ [K].
- **Meaning** — the wall floats at whatever temperature balances convective input against radiative output. Solve iteratively; this sets the material choice for a radiation-cooled skirt.
- **Assumes** — no conduction along the wall (good for a thin niobium skirt, bad near a cooled joint); full view to a cold sink.
- **Fails when** — at the attachment joint to the cooled chamber, where axial conduction sets up a severe gradient — and where radiative nozzle extensions actually crack.
- **Tag** [F] · **Code** —

---

## Module 12 — Feed Systems and Turbopumps

### 12-3.1 — Feed-system pressure budget

$$p_{\text{supply}} = p_{c,\text{inj}} + \Delta p_{\text{inj}} + \Delta p_{\text{cool}} + \Delta p_{\text{line}} + \Delta p_{\text{valve}} \pm \Delta p_{\text{accel}} \pm \Delta p_{\text{dyn}}$$

- **Variables** — $p_{\text{supply}}$ tank ullage pressure (pressure-fed) or pump discharge pressure (pump-fed) [Pa]; $p_{c,\text{inj}}$ chamber pressure at the injector face [Pa]; $\Delta p_{\text{inj}}$ injector drop [Pa]; $\Delta p_{\text{cool}}$ regenerative-jacket drop [Pa], zero on the oxidiser side of almost every engine; $\Delta p_{\text{line}}$, $\Delta p_{\text{valve}}$ distributed and lumped losses [Pa]; $\Delta p_{\text{accel}} = \rho a z$ head from vehicle acceleration over height $z$ [Pa]; $\Delta p_{\text{dyn}} = \tfrac12\rho V^2$ dynamic head at the injector inlet [Pa].
- **Meaning** — everything the feed system must produce, itemised. The first sheet of paper on any engine.
- **Assumes** — steady flow; single phase; no significant density change along the path.
- **Fails when** — the coolant goes supercritical and expands (the RS-25 hydrogen jacket density falls threefold between inlet and outlet, so $\Delta p_{\text{cool}}$ is not a simple friction term); the propellant flashes in the line.
- **Tag** [F] · **Code** —
- **Alias** — 06-3.13, 11-3.12, 13-3.1, 14-3.5 are the same budget at different levels of detail.

### 12-3.2 — Tank wall mass

$$m_{\text{tank}} \approx k_t\,j\,\frac{p_t V}{\sigma/\rho}
\qquad k_t \approx 1.5\ (\text{sphere}) \to 2.0\ (\text{cylinder})$$

- **Variables** — $m_{\text{tank}}$ tank wall mass [kg]; $p_t$ tank pressure [Pa]; $V$ enclosed volume [m³]; $\sigma/\rho$ material specific strength [J/kg]; $j$ design factor, 1.25–1.5 on yield for flight tanks [—]; $k_t$ shape factor [—].
- **Meaning** — tank mass is proportional to $p_t V$ over specific strength; this is why pressure-fed chamber pressure stops at 2–3 MPa.
- **Assumes** — membrane (thin-wall) behaviour; pressure-dominated design; no buckling or launch-load case governing.
- **Fails when** — the tank is stability-critical rather than strength-critical (a large, lightly pressurised booster tank is sized by compressive buckling, and this then *underestimates* mass badly); for COPVs, where the liner carries no load and the figure of merit is $pV/W$ instead.
- **Tag** [F] [E] · **Code** —
- **Alias** — 13-3.6 writes it as $m_{tank} \approx p_{tank}V\rho_s\Phi/\sigma$ with $\Phi \approx 2$–3.

### 12-3.3 — Ideal pressurant mass

$$m_g = \frac{p_t V}{R_g T_g},\qquad R_g = \frac{R_u}{\mathcal{M}_g}$$

- **Variables** — $m_g$ pressurant mass [kg]; $p_t$ tank pressure [Pa]; $V$ volume to be displaced [m³]; $R_g$ specific gas constant of the pressurant [J/(kg·K)]; $T_g$ gas temperature in the tank [K]; $\mathcal{M}_g$ [kg/kmol].
- **Meaning** — the ideal-gas pressurant inventory; helium's low $\mathcal{M}$ is exactly why it is used despite the cost.
- **Assumes** — ideal gas; uniform ullage temperature; gas fills exactly the propellant volume; no dissolution.
- **Fails when** — the gas is cold and dense (helium at 300 bar is 17 % denser than ideal); the ullage stratifies (it always does); the gas dissolves in the liquid (helium in LOX and NTO is a real loss, order 1–3 %).
- **Tag** [F] [A] · **Code** `pressurant_mass(p_tank, V_prop, R_g, T_g)`

### 12-3.4 — Pressurant with collapse factor

$$m_{g,\text{req}} = Z_c\,\frac{p_t V}{R_g T_{g,\text{in}}}$$

- **Variables** — $Z_c$ collapse factor [—]; $T_{g,\text{in}}$ temperature of the gas as delivered to the tank [K]; others as 12-3.3.
- **Meaning** — the real inventory, after the ullage gas cools against cold walls and cold liquid. Typical $Z_c$: 1.0–1.2 for a small, fast-emptying tank with warm gas into a storable; 1.3–1.6 for a large storable tank over a long burn; **2–4 for helium into liquid hydrogen**, where the wall and liquid sit at 20 K and the incoming helium is at 250 K or more.
- **Assumes** — $Z_c$ is calibrated for the tank geometry, fill fraction, ramp rate and propellant.
- **Fails when** — used outside the geometry it was fitted to. The honest replacement is a two-dimensional transient heat-and-mass-transfer analysis, not a coefficient.
- **Tag** [E] [J] · **Code** —

### 12-3.5 — Deliverable mass from a blowdown bottle

$$m_{\text{delivered}} = \frac{V_b}{R_g T_b}\left(\frac{p_i}{Z_i} - \frac{p_f}{Z_f}\right)$$

- **Variables** — $V_b$ bottle volume [m³]; $p_i, p_f$ initial and final bottle pressure [Pa]; $Z_i, Z_f$ compressibility factors [—]; $T_b$ bottle gas temperature [K]; $R_g$ [J/(kg·K)].
- **Meaning** — how much gas a high-pressure bottle actually gives up between two pressures.
- **Assumes** — isothermal blowdown, i.e. the bottle has time to re-absorb heat from its surroundings.
- **Fails when** — the blowdown is fast. Adiabatic blowdown of helium from 300 bar drops the bottle gas temperature by well over 100 K; the residual gas is denser than the isothermal calculation says and you deliver **less** than predicted. Real systems sit between and are usually sized on the adiabatic case with the isothermal case as the optimistic bound.
- **Tag** [F] [A] · **Code** `stored_gas_mass(p, V, R, T, Z)`

### 12-3.6 — Pressurant bottle mass

$$m_{\text{bottle}} = \frac{p_i V_b}{g_0\,(pV/W)}$$

- **Variables** — $m_{\text{bottle}}$ [kg]; $p_i$ initial pressure [Pa]; $V_b$ [m³]; $pV/W$ vessel performance factor [m]; $g_0$ [m/s²].
- **Meaning** — the mass of the pressure vessel itself, from a single figure of merit that spans metal and composite tanks.
- **Assumes** — burst-pressure-governed design with the standard COPV factors of safety.
- **Fails when** — stress rupture, impact damage tolerance or liner buckling govern instead — which for long-duration missions they frequently do, and the achievable $pV/W$ drops.
- **Tag** [E] [J] · **Code** —

### 12-3.7 — Line friction loss and Colebrook friction factor

$$\Delta p_f = f\,\frac{L}{D}\,\frac{1}{2}\rho V^2, \qquad
\frac{1}{\sqrt f} = -2\log_{10}\!\left(\frac{\varepsilon/D}{3.7} + \frac{2.51}{Re\sqrt f}\right)$$

- **Variables** — $f$ Darcy friction factor [—]; $L$ line length [m]; $D$ internal diameter [m]; $\rho$ [kg/m³]; $V$ bulk velocity [m/s]; $\varepsilon$ absolute roughness [m] (1.5 µm drawn stainless, 45 µm commercial steel); $Re = \rho V D/\mu$ [—].
- **Meaning** — distributed friction in a feed line. Colebrook is implicit; the explicit Swamee–Jain form $f = 0.25/[\log_{10}(\varepsilon/3.7D + 5.74/Re^{0.9})]^2$ is within 1 % over $5\times10^3 < Re < 10^8$ and is what the worked examples use.
- **Assumes** — fully developed, single-phase, incompressible, steady flow in a straight round pipe.
- **Fails when** — the line is short relative to its entrance length (rocket feed lines usually are, $L/D$ of 10–20, and friction is then small compared with fittings); two-phase flow; a supercritical coolant whose density changes.
- **Tag** [F] [E] · **Code** —
- **Alias** — 11-3.10/3.11 use Darcy–Weisbach with Haaland instead of Colebrook.

### 12-3.8 — Minor (fitting) losses

$$\Delta p_m = \left(\sum K_i\right)\frac{1}{2}\rho V^2$$

- **Variables** — $K_i$ loss coefficients [—]; $\rho$ [kg/m³]; $V$ [m/s].
- **Meaning** — the losses that actually dominate a short rocket feed line. Typical $K$: sharp-edged tank outlet 0.5; well-rounded inlet 0.05; 90° long-radius elbow 0.2–0.3; mitre bend 1.1; open ball valve 0.05–0.1; open globe/poppet main valve 3–10; sudden expansion $(1-A_1/A_2)^2$; bellows 2–4 per convolution set; filter 5–30 depending on mesh and cleanliness.
- **Assumes** — turbulent flow; components far enough apart not to interact.
- **Fails when** — fittings are adjacent (a bend immediately downstream of a valve can be much worse than the sum); a filter loads with debris — the failure that shows up as a slowly rising $\Delta p$ across a test series and ends with a starved engine.
- **Tag** [E] · **Code** —

### 12-3.9 — Polytropic blowdown of a tank ullage

$$p = p_i\left(\frac{V_{u,i}}{V_u}\right)^n, \qquad
BR \equiv \frac{p_i}{p_f} = \left(\frac{V_{u,f}}{V_{u,i}}\right)^n$$

- **Variables** — $p_i, p_f$ initial and final ullage pressure [Pa]; $V_{u,i}, V_{u,f}$ initial and final ullage volume [m³]; $n$ polytropic exponent [—]; $BR$ blowdown ratio [—].
- **Meaning** — how tank pressure decays as propellant leaves. $n = 1$ isothermal (slow burn, good heat transfer — the usual assumption for long storable burns); $n = \gamma$ adiabatic (1.67 helium, 1.40 N₂ — the right bound for a fast burn).
- **Assumes** — uniform ullage; no condensation; no gas dissolving.
- **Fails when** — the burn is long enough that the tank exchanges significant heat with the environment (then $n < 1$ is possible); propellant vapour contributes to ullage pressure, which for a volatile propellant it does.
- **Tag** [F] [A] · **Code** `blowdown_pressure(p_i, V_i, V, n)`
- **Alias** — 28/29 use the same law for cold-gas tanks; `usable_fraction` derives from it.

### 12-3.10 — Pressure-fed / pump-fed crossover burn time

$$t_{b,\text{crit}} = \frac{\rho\,m_0}{C_p\,\Delta p_t\,\dot m} + \frac{k_{TP}}{C_p\,\eta_p}$$

- **Variables** — $t_{b,\text{crit}}$ burn time at which the two architectures weigh the same [s]; $\rho$ bulk propellant density [kg/m³]; $m_0$ turbopump fixed mass [kg]; $C_p$ pressurisation penalty coefficient [kg/J]; $\Delta p_t$ pressure the feed system must generate [Pa]; $\dot m$ total propellant flow [kg/s]; $k_{TP}$ turbopump marginal mass [kg/W]; $\eta_p$ [—].
- **Meaning** — short burns favour pressure-fed, long burns favour pumps, and this is where the line sits.
- **Assumes** — mass is the only currency; tanks are strength-critical; both architectures deliver the same $\Delta p$; turbine propellant consumption and gas-generator plumbing are inside $m_0$ and $k_{TP}$.
- **Fails when** — reliability, restart count, development cost or schedule dominate, which is often. Treat the result as the *mass* answer, not the *design* answer.
- **Tag** [J] · **Code** —

### 12-3.11 — Euler turbomachine equation

$$H_{\text{Euler}} = \frac{u_2 c_{u2}}{g_0}$$

- **Variables** — $H_{\text{Euler}}$ ideal head rise [m]; $u_2 = \omega D_2/2$ impeller tip speed [m/s]; $c_{u2}$ absolute tangential velocity of fluid leaving the impeller [m/s]; $g_0$ [m/s²].
- **Meaning** — **notice what is absent: the fluid.** Euler head depends only on velocities. A pump develops the same *head* on hydrogen as on LOX at the same speed — and therefore fourteen times less *pressure*. The single most important sentence in turbopump design.
- **Assumes** — steady, axisymmetric, uniform flow at inlet and exit; no pre-whirl; all shaft work goes into angular momentum of the through-flow.
- **Fails when** — there is significant disc friction or recirculation (both real, and why actual head is 10–20 % below Euler head even before the diffuser); leakage past the front shroud recirculates flow.
- **Tag** [F] · **Code** `pump_head(dp, rho)` for the inverse relation

### 12-3.12 — Slip and the exit velocity triangle

$$c_{u2} = \sigma u_2 - \frac{c_{m2}}{\tan\beta_2},
\qquad c_{m2} = \frac{Q}{\pi D_2 b_2}$$

- **Variables** — $\sigma$ slip factor [—]; $\beta_2$ blade exit angle from tangential [rad or °]; $c_{m2}$ meridional velocity at impeller exit [m/s]; $b_2$ exit blade width [m]; $Q$ volumetric flow [m³/s]; $D_2$ [m].
- **Meaning** — the real tangential velocity is less than blade speed because the flow slips; backswept blades ($\beta_2 < 90°$) trade head for a stable, rising head–flow curve.
- **Assumes** — full blade passages; no blockage correction (real blades block 5–10 % of the area — include it or you will over-predict $c_{m2}$).
- **Fails when** — at very low flow the passage stalls and the whole velocity-triangle picture breaks down.
- **Tag** [F] [E] · **Code** —

### 12-3.13 — Pump shaft power and efficiency chain

$$P_{\text{shaft}} = \frac{\dot m\,\Delta p_p}{\rho\,\eta_p}
= \frac{\dot m\,g_0 H}{\eta_p}, \qquad
\eta_p = \eta_h\,\eta_v\,\eta_m$$

- **Variables** — $P_{\text{shaft}}$ [W]; $\dot m$ [kg/s]; $\Delta p_p$ pump pressure rise [Pa]; $\rho$ [kg/m³]; $H$ head [m]; $\eta_h$ hydraulic (blade and diffuser losses), $\eta_v$ volumetric (seal and balance-piston leakage), $\eta_m$ mechanical (disc friction, bearing and seal drag) [—].
- **Meaning** — the power one pump absorbs, and where it is lost. Typical rocket values: $\eta_p = 0.55$–0.65 for small or low-specific-speed stages, 0.70–0.80 for well-matched large stages. Terrestrial process pumps reach 0.88; rocket pumps trade efficiency for mass and suction performance.
- **Assumes** — incompressible flow.
- **Fails when** — hydrogen at high pressure ratio, where the density rise through the pump is 10–20 % and $\int dp/\rho$ must be integrated instead.
- **Tag** [F] [E] · **Code** `pump_power(mdot, dp, rho, eta)`, `pump_head(dp, rho)`
- **Alias** — 13-3.2, identical.

### 12-3.14 — Specific speed

$$N_s = \frac{\omega\sqrt{Q}}{(g_0 H)^{3/4}}$$

- **Variables** — $N_s$ [—, dimensionless SI form]; $\omega$ [rad/s]; $Q$ volumetric flow through one stage, one flow path [m³/s]; $H$ head rise *per stage* [m]; $g_0$ [m/s²].
- **Meaning** — the one number that picks the machine type: low $N_s$ → radial centrifugal, high $N_s$ → axial.
- **Assumes** — geometric similarity; single stage; single suction.
- **Fails when** — the machine is far off its best efficiency point. **⚠ Units:** US practice uses $N_s = N\sqrt{Q}/H^{3/4}$ with $N$ in rpm, $Q$ in US gpm, $H$ in feet, which is larger than the SI dimensionless value by a factor of **2733**. The NASA monographs use the US form; a number near 1 is dimensionless, a number near 2000 is US. Never mix them.
- **Tag** [F] · **Code** `specific_speed_SI(omega, Q, H)`

### 12-3.15 — Available NPSH

$$\mathrm{NPSH_a} = \frac{p_t - p_v - \Delta p_{\text{line}}}{\rho g_0} + z\,\frac{a}{g_0}$$

- **Variables** — $\mathrm{NPSH_a}$ [m]; $p_t$ tank ullage pressure [Pa]; $p_v$ propellant vapour pressure **at the local bulk temperature** [Pa]; $\Delta p_{\text{line}}$ suction-line loss [Pa]; $\rho$ [kg/m³]; $z$ height of liquid surface above the pump inlet [m]; $a$ axial acceleration [m/s²].
- **Meaning** — the head margin above vaporisation available at the impeller eye.
- **Assumes** — steady flow; uniform liquid temperature; no entrained vapour.
- **Fails when** — the propellant is stratified (a cryogen warms at the surface and the *bulk* is colder than saturation, which helps; but a self-pressurised tank's liquid at the outlet may be at saturation, the worst case); during transients — a throttle step, stage separation, or the start of a slosh cycle can take NPSH away for a few hundred milliseconds.
- **Tag** [F] · **Code** `npsh_available(p_tank, p_vapor, rho, z, dp_line, accel)`
- **Alias** — 05-3.9, identical.

### 12-3.16 — Suction specific speed and required NPSH

$$N_{ss} = \frac{\omega\sqrt{Q}}{(g_0\,\mathrm{NPSH})^{3/4}}
\qquad\Longrightarrow\qquad
\mathrm{NPSH_r} = \frac{1}{g_0}\left(\frac{\omega\sqrt{Q}}{N_{ss}}\right)^{4/3}$$

- **Variables** — $N_{ss}$ [—, SI dimensionless; multiply by 2733 for the US rpm–gpm–ft form]; $\mathrm{NPSH_r}$ the NPSH at which the stage loses a defined amount of head, conventionally 2 % or 3 % [m].
- **Meaning** — how hard a given inducer can suck. Typical attainable $N_{ss}$: **2–3** plain centrifugal impeller with no inducer; **4–6** with a modest inducer; **7–10** a well-designed rocket inducer; **>10** claimed on some hydrogen inducers exploiting thermodynamic effects.
- **Assumes** — geometric and cavitation similarity; a fixed definition of "required".
- **Fails when** — the criterion changes. NPSH at 3 % head loss is not NPSH at incipient cavitation (which can be 2–3× higher), and is not NPSH free of rotating cavitation (higher still). Suppressing head loss and suppressing cavitation instability are different requirements.
- **Tag** [F] [E] · **Code** `suction_specific_speed_SI(omega, Q, NPSH)`

### 12-3.17 — Thermodynamic suppression head

$$B \sim \frac{\rho_l}{\rho_v}\cdot\frac{c_{p,l}\,\Delta T}{h_{fg}},
\qquad
\mathrm{TSH} \approx \frac{1}{\rho_l g_0}\frac{dp_v}{dT}\,\Delta T$$

- **Variables** — $B$ thermodynamic parameter [—]; $\rho_l, \rho_v$ liquid and vapour density [kg/m³]; $c_{p,l}$ [J/(kg·K)]; $h_{fg}$ latent heat [J/kg]; $\Delta T$ local temperature depression [K]; $dp_v/dT$ slope of the vapour-pressure curve [Pa/K]; TSH [m].
- **Meaning** — why cryogens cheat: vaporising a little liquid cools the surroundings, lowering local $p_v$ and suppressing further cavitation. Hydrogen benefits enormously, water and storables barely at all.
- **Assumes** — thermal equilibrium between cavity and surrounding liquid, a strong assumption at high speed.
- **Fails when** — used predictively. TSH is taken as a *credit* validated by test, never as a design margin taken on faith.
- **Tag** [E] [J] · **Code** —

### 12-3.18 — Pump affinity laws

$$\frac{Q_2}{Q_1} = \frac{N_2}{N_1}\left(\frac{D_2}{D_1}\right)^3,\qquad
\frac{H_2}{H_1} = \left(\frac{N_2}{N_1}\right)^2\left(\frac{D_2}{D_1}\right)^2,\qquad
\frac{P_2}{P_1} = \frac{\rho_2}{\rho_1}\left(\frac{N_2}{N_1}\right)^3\left(\frac{D_2}{D_1}\right)^5$$

- **Variables** — $Q$ [m³/s]; $H$ [m]; $P$ [W]; $N$ rotational speed [rpm or rad/s, consistently]; $D$ impeller diameter [m]; $\rho$ [kg/m³].
- **Meaning** — how a geometrically similar pump scales with speed and size.
- **Assumes** — geometric similarity; equal efficiency; equal flow coefficient; no cavitation; incompressible flow.
- **Fails when** — Reynolds number changes enough to move efficiency (small pumps are less efficient — the "size effect"); tip clearance does not scale (it never does — clearances are set by tolerance and thermal growth, so small pumps have proportionally larger clearances and lose more); cavitation intervenes.
- **Tag** [F] [A] · **Code** —

### 12-3.19 — Tip-speed limit from material strength

$$u_{2,\max} \approx \sqrt{\frac{\sigma_{\text{allow}}}{k\,\rho_{\text{mat}}}}$$

- **Variables** — $u_{2,\max}$ [m/s]; $\sigma_{\text{allow}}$ allowable stress at temperature after knockdowns for low-cycle fatigue and any LOX ignition-sensitivity constraint [Pa]; $\rho_{\text{mat}}$ material density [kg/m³]; $k$ geometry factor [—].
- **Meaning** — the hard ceiling on impeller tip speed, and therefore on head per stage; specific strength is the whole story.
- **Assumes** — elastic; isothermal; no stress concentration.
- **Fails when** — at blade roots and the eye fillet, where the concentration factor and low-cycle-fatigue life actually govern; for hydrogen-wetted parts, where hydrogen environment embrittlement can halve the usable strength of a nickel alloy (Module 16).
- **Tag** [F] [A] · **Code** —

### 12-3.20 — Turbine shaft power

$$P_t = \eta_t\,\dot m_t\,c_p\,T_{t,\text{in}}\left[1 - \pi_t^{-(\gamma-1)/\gamma}\right]$$

- **Variables** — $P_t$ [W]; $\eta_t$ turbine total-to-static efficiency [—]; $\dot m_t$ turbine gas flow [kg/s]; $c_p$ [J/(kg·K)]; $T_{t,\text{in}}$ turbine inlet stagnation temperature [K]; $\pi_t$ total-to-static pressure ratio [—]; $\gamma$ [—].
- **Meaning** — the power available from expanding drive gas; the supply side of every cycle balance.
- **Assumes** — calorically perfect gas; adiabatic; no chemical change through the turbine.
- **Fails when** — the gas recombines or reacts across the stage (fuel-rich kerolox gas contains unburned species and soot, and effective $c_p$ is not the frozen value); the flow is choked in a way that fixes $\dot m$ independent of pressure ratio.
- **Tag** [F] · **Code** `turbine_power(mdot, cp, T_in, pr, gamma, eta)`
- **Alias** — 05-3.10, 13-3.3.

---

## Module 13 — Engine Cycles

### 13-3.1 — Pump discharge requirement

$$p_d = p_c + \Delta p_{inj} + \Delta p_j + \Delta p_{lines} + \Delta p_{valves}$$

- **Variables** — all pressures [Pa]; $p_d$ pump discharge; $\Delta p_j$ jacket drop.
- **Meaning** — the pump (or the tank) must supply chamber pressure plus every downstream loss. The demand side of the cycle balance.
- **Assumes** — steady state; no significant dynamic-head recovery at the injector.
- **Fails when** — the coolant is a two-phase or supercritical fluid whose density changes so much through the jacket that "a pressure drop" is not a single well-defined number; a turbine sits in the middle of the circuit, in which case its drop appears here too.
- **Tag** [F] · **Code** —
- **Alias** — 06-3.13, 11-3.12, 12-3.1, 14-3.5.

### 13-3.2 — Pump power (per pump)

$$P_{pump,j} = \frac{\dot m_{p,j}\,\Delta p_{p,j}}{\rho_j\,\eta_{p,j}}$$

- **Variables** — $\dot m_p$ [kg/s]; $\Delta p_p$ [Pa]; $\rho$ [kg/m³]; $\eta_p$ [—]; $P$ [W].
- **Meaning** — shaft power absorbed by one pump.
- **Assumes** — incompressible liquid; single phase; no leakage or axial-thrust-balance flow charged elsewhere.
- **Fails when** — the fluid is compressible over the pressure rise (liquid hydrogen at 500 bar genuinely is, a few percent error); balance-piston and bearing-coolant bleeds are a significant fraction of the flow, which they are on hydrogen pumps.
- **Tag** [F] · **Code** `pump_power(mdot, dp, rho, eta)`
- **Alias** — 12-3.13, 07-3.9.

### 13-3.3 — The cycle equation

$$\eta_t\,\dot m_t\,c_p\,T_t\left[1-\pi_t^{-\frac{\gamma_t-1}{\gamma_t}}\right] = \frac{1}{\eta_m}\sum_j \frac{\dot m_{p,j}\,\Delta p_{p,j}}{\rho_j\,\eta_{p,j}}$$

- **Variables** — $\eta_t$ turbine efficiency [—]; $\dot m_t$ turbine drive flow [kg/s]; $c_p$ [J/(kg·K)] and $\gamma_t$ [—] of the drive gas; $T_t$ turbine inlet stagnation temperature [K]; $\pi_t$ turbine pressure ratio [—]; $\eta_m$ mechanical efficiency [—]; one term per pump on the right. Both sides [W].
- **Meaning** — **this single equation determines every cycle.** Turbine supply equals pump demand; the architecture is whatever makes both sides balance at the desired $p_c$.
- **Assumes** — steady state; calorically perfect drive gas; adiabatic turbine; one shaft (apply per shaft for multi-shaft engines).
- **Fails when** — the drive gas condenses or reacts across the turbine (hot fuel-rich gas keeps reacting, raising effective $c_p$ by several percent); $\gamma_t$ and $c_p$ vary strongly across the expansion (they do for hydrogen-rich gas); a gearbox loss is large enough that $\eta_m$ is not near unity (the RL10's gearbox runs 0.96–0.97).
- **Tag** [F] · **Code** `turbine_power(...)` = $\sum$ `pump_power(...)`

### 13-3.4 — Gas-generator flow fraction

$$f_{gg} \approx \frac{K\,p_c}{\bar\rho\;\eta_t\eta_m\eta_p\, c_p T_t\left[1-\pi_t^{-(\gamma_t-1)/\gamma_t}\right]}$$

- **Variables** — $f_{gg}$ fraction of total flow sent to the gas generator [—]; $K \approx 1.4$–1.6 the dimensionless factor by which pump discharge exceeds $p_c$ [—]; $\bar\rho$ mean propellant density [kg/m³]; efficiencies [—]; $c_p$ [J/(kg·K)]; $T_t$ [K]; $\pi_t$ [—].
- **Meaning** — **the fraction of propellant an open cycle must throw away is directly proportional to chamber pressure and inversely proportional to propellant density.** This is why open-cycle hydrogen engines pay so much and open-cycle kerolox engines less.
- **Assumes** — both pumps at similar $\Delta p$; one turbine.
- **Fails when** — the two circuits have very different discharge pressures (hydrogen engines, where the fuel jacket adds tens of bar); use the full sum then.
- **Tag** [F] · **Code** —

### 13-3.5 — Closed vs open chamber-pressure ratio

$$\frac{p_{c,\text{closed}}}{p_{c,\text{open}}} \sim \frac{\dot m_{t,c}\,T_{t,c}\left[1-\pi_{t,c}^{-\kappa}\right]}{\dot m_{t,o}\,T_{t,o}\left[1-\pi_{t,o}^{-\kappa}\right]},\qquad \kappa=\frac{\gamma_t-1}{\gamma_t}$$

- **Variables** — subscripts $c$, $o$ closed and open cycle; $\dot m_t$ [kg/s]; $T_t$ [K]; $\pi_t$ [—]; $\kappa$ [—].
- **Meaning** — the chamber pressure a cycle can reach scales as the total turbine power it can generate; a closed cycle runs *all* the propellant through the turbine, so $\dot m_t$ is an order of magnitude larger.
- **Assumes** — same propellants; same efficiencies; pump discharge dominated by $p_c$.
- **Fails when** — the structural or thermal limit binds before the power limit does — the BE-4's 140 bar is a choice, not a capability ceiling.
- **Tag** [J] · **Code** —

### 13-3.6 — Pressure-fed tank mass

$$m_{tank} \approx \frac{p_{tank}\,V\,\rho_s}{\sigma}\cdot\Phi$$

- **Variables** — $m_{tank}$ [kg]; $p_{tank}$ [Pa]; $V$ tank volume [m³]; $\rho_s$ material density [kg/m³]; $\sigma$ allowable stress [Pa]; $\Phi \approx 2$–3 shape and safety-factor multiplier [—].
- **Meaning** — **tank mass is proportional to pressure times volume**, so a pressure-fed system pays for chamber pressure in structure, linearly, over the whole propellant volume.
- **Assumes** — membrane stress; thin wall.
- **Fails when** — buckling rather than burst sizes the wall (large low-pressure tanks); a common bulkhead changes the geometry.
- **Tag** [F] [A] · **Code** —
- **Alias** — 12-3.2 with $k_t j$ in place of $\Phi$.

### 13-3.7 — Expander turbine inlet temperature

$$T_t = T_{in} + \frac{Q}{\dot m_f\,c_{p,f}},\qquad Q = \int_{A_w} q\,dA$$

- **Variables** — $T_t$ turbine inlet temperature [K]; $T_{in}$ pump discharge temperature [K]; $Q$ total heat pickup [W]; $\dot m_f$ fuel flow [kg/s]; $c_{p,f}$ coolant specific heat [J/(kg·K)]; $q$ local gas-side heat flux [W/m²]; $A_w$ wetted regen area [m²].
- **Meaning** — **the expander's turbine inlet temperature is a heat-transfer result, not a design choice.** Everything about the cycle follows from how much heat the chamber can push into the fuel.
- **Assumes** — all fuel is the coolant; no bypass; single-phase supercritical hydrogen.
- **Fails when** — part of the fuel bypasses the jacket (a common trim); $c_p$ varies strongly across the pseudo-critical region — for hydrogen above ~15 bar it is well-behaved, for methane near its critical point it is not, one reason a methane expander is hard.
- **Tag** [F] · **Code** `coolant_bulk_rise(Q, mdot, cp)`

### 13-3.8 — Expander scaling wall

$$\frac{\text{available}}{\text{required}} \propto p_c^{-1.2}\,D_t^{-0.2}$$

- **Variables** — $p_c$ [Pa]; $D_t$ throat diameter [m].
- **Meaning** — the expander margin degrades **strongly with chamber pressure** and only weakly with engine diameter: heat pickup scales with wetted area while required power scales with $p_c$ and flow. This is why closed expanders stop around 60–70 bar.
- **Assumes** — geometric similarity; Bartz scaling; constant efficiencies; constant jacket pressure drop.
- **Fails when** — the jacket pressure drop is *not* constant — and it is not, which turns a weak scaling into a hard wall.
- **Tag** [F] [J] · **Code** —

### 13-3.9 — Electric-pump battery mass fraction

$$\frac{m_{batt}}{m_{prop}} = \frac{\overline{\Delta p}}{\bar\rho\;\eta_p\,\eta_{inv}\eta_{mot}\,e_b}$$

- **Variables** — $\overline{\Delta p}$ flow-weighted mean pump pressure rise [Pa]; $\bar\rho$ flow-weighted mean propellant density [kg/m³]; $\eta_p, \eta_{inv}, \eta_{mot}$ pump, inverter and motor efficiencies [—]; $e_b$ **usable** battery specific energy [J/kg].
- **Meaning** — **an electric-pump stage pays a fixed fraction of its propellant mass in permanent dead battery mass**, proportional to chamber pressure and inversely proportional to propellant density and battery specific energy.
- **Assumes** — constant thrust and mixture ratio; one battery for the whole burn.
- **Fails when** — packs are jettisoned mid-burn (which is exactly what Rocket Lab does, changing the stage $\Delta v$ integral rather than this ratio); the battery is sized by *power* (C-rate) rather than energy, the case for very short burns.
- **Tag** [F] [E] · **Code** —

---

## Module 14 — Valves, Plumbing, and Engine Hardware

### 14-3.1 — Orifice flow, mass and volumetric forms

$$\dot m = C_d A \sqrt{2\rho\,\Delta p}, \qquad Q = \frac{\dot m}{\rho} = C_d A \sqrt{\frac{2\Delta p}{\rho}}$$

- **Variables** — $\dot m$ [kg/s]; $Q$ [m³/s]; $C_d$ [—]; $A$ reference geometric area [m²]; $\rho$ [kg/m³]; $\Delta p$ [Pa].
- **Meaning** — a restriction converts pressure into kinetic energy, and flow scales as the square root of the drop.
- **Assumes** — single-phase incompressible liquid; no cavitation; steady flow; $\Delta p$ measured between stations far enough from the restriction that velocity heads are recovered or accounted for.
- **Fails when** — the fluid cavitates or flashes (flow chokes and becomes independent of downstream pressure); the fluid is a gas beyond the critical pressure ratio; the flow is transient on the acoustic transit timescale of the component.
- **Tag** [F] · **Code** `orifice_mdot(Cd, A, rho, dp)`
- **Alias** — 07-3.1.

### 14-3.2 — Series effective areas

$$\frac{1}{(C_dA)_{tot}^2} = \sum_i \frac{1}{(C_dA)_i^2}$$

- **Variables** — $(C_dA)_i$ effective areas of components in series [m²].
- **Meaning** — series resistances add in *pressure drop* at fixed flow, and since $\Delta p \propto \dot m^2/(C_dA)^2$, the reciprocal squares add.
- **Assumes** — incompressible flow; no pressure-recovery interaction between adjacent components; each $C_d$ measured in a configuration resembling its installed one.
- **Fails when** — components are close-coupled so the downstream one sees a distorted profile (a valve immediately after an elbow can lose 20 % of its $C_d$); any component cavitates.
- **Tag** [F] · **Code** —

### 14-3.3 — Valve flow coefficients $C_v$ and $K_v$

$$C_v = Q_{[\mathrm{US\ gpm}]}\sqrt{\frac{SG}{\Delta p_{[\mathrm{psi}]}}}, \qquad K_v = Q_{[\mathrm{m^3/h}]}\sqrt{\frac{SG}{\Delta p_{[\mathrm{bar}]}}}$$

- **Variables** — $SG$ specific gravity relative to water at 60 °F, $\rho/999$ kg/m³ [—]; $Q$ volumetric flow in the stated unit; $\Delta p$ in the stated unit.
- **Meaning** — a purely empirical capacity index, defined so the same number sizes any liquid by scaling with $\sqrt{SG}$.
- **Assumes** — fully turbulent, non-cavitating, incompressible flow, with the component in the standard straight-pipe test fixture.
- **Fails when** — the flow is laminar (very viscous propellant, small trim); cavitation limits the flow; the installed piping differs from the test fixture — the honest correction is a piping-geometry factor $F_P$, where a lot of quiet error lives.
- **Tag** [E] · **Code** —
- **Alias** — ⚠ these are *not* SI; convert with 14-3.4 before using them in any equation on this sheet.

### 14-3.4 — $C_v$ / $K_v$ to effective area

$$C_dA = 1.698\times10^{-5}\,C_v = 1.963\times10^{-5}\,K_v \quad [\mathrm{m^2}]$$

- **Variables** — $C_dA$ effective flow area [m²]; $C_v$, $K_v$ [—, unit-bearing].
- **Meaning** — a $C_v$ of 1000 is an effective area of 17.0 cm², about a 47 mm hole. **Use this to sanity-check vendor data**: if a quoted $C_v$ implies an effective area larger than the valve's own bore, the number is wrong or was measured with pressure recovery included.
- **Assumes** — everything 14-3.1 and 14-3.3 assume.
- **Fails when** — in the same places.
- **Tag** [F] · **Code** —

### 14-3.5 — Pump discharge budget (full form)

$$p_{pump,disch} = p_c + \Delta p_{inj} + \Delta p_{cool} + \Delta p_{valve} + \Delta p_{line} + \Delta p_{manifold} + \rho g h + \tfrac12\rho v^2$$

- **Variables** — all pressures [Pa]; $\rho g h$ static head (small in flight, not small on a test stand); $\tfrac12\rho v^2$ dynamic head at the pump discharge station.
- **Meaning** — the pump must produce every one of these terms, and each costs turbine power.
- **Assumes** — steady state; single phase; one-dimensional.
- **Fails when** — during transients; in the coolant jacket wherever the fluid is supercritical and its density changes by a factor of three along the passage.
- **Tag** [F] [E] · **Code** —
- **Alias** — 06-3.13, 11-3.12, 12-3.1, 13-3.1.

### 14-3.6 — Valve cavitation index

$$\sigma = \frac{p_1 - p_v}{p_1 - p_2}$$

- **Variables** — $\sigma$ cavitation index [—]; $p_1$ upstream static pressure [Pa]; $p_2$ downstream static pressure [Pa]; $p_v$ vapour pressure at the local liquid temperature [Pa].
- **Meaning** — the numerator is the available margin against boiling, the denominator the pressure the valve is asked to throw away. Large $\sigma$ is safe.
- **Assumes** — single-phase upstream; quasi-steady flow; $p_v$ at the *actual* bulk temperature, which for a partially chilled line is not the tank temperature.
- **Fails when** — the liquid is near critical (LOX above ~50 bar, LH2 above ~13 bar) so surface tension collapses; for saturated propellants, where $p_1 - p_v \to 0$ by construction. Several definitions circulate — some use $(p_2-p_v)/(p_1-p_2)$, others the reciprocal. **State which you are using.**
- **Tag** [E] [J] · **Code** —
- **Alias** — 07-3.3 writes the same group as $K$. ⚠ $\sigma$ here is a cavitation index, not stress or the Bartz correction.

### 14-3.7 — Joukowsky water-hammer surge

$$\Delta p_J = \rho\, a\, \Delta v$$

- **Variables** — $\Delta p_J$ pressure rise at the valve [Pa]; $\rho$ [kg/m³]; $a$ pressure-wave speed in the fluid–pipe system [m/s]; $\Delta v$ change in mean line velocity [m/s].
- **Meaning** — stopping a liquid column converts its momentum into pressure through a wave; the conversion factor is the acoustic impedance $\rho a$, about $9.3\times10^5$ Pa per (m/s) for LOX in a thin steel line.
- **Assumes** — closure faster than the pipe period $2L/a$; rigid supports; no cavitation; no line friction; 1-D; small perturbation.
- **Fails when** — the reflected rarefaction drives pressure below $p_v$ — the column then separates, a vapour cavity forms, and its collapse produces a *second* surge that can exceed the first; closure is slower than $2L/a$ (use 14-3.9); a large gas pocket cushions the event but makes it nonlinear.
- **Tag** [F] · **Code** —

### 14-3.8 — Korteweg wave speed

$$a = \frac{\sqrt{K_f/\rho}}{\sqrt{1 + \dfrac{K_f D}{E t}}}$$

- **Variables** — $a$ [m/s]; $K_f$ liquid bulk modulus [Pa]; $\rho$ [kg/m³]; $D$ pipe inside diameter [m]; $E$ wall Young's modulus at operating temperature [Pa]; $t$ wall thickness [m].
- **Meaning** — the effective compressibility is the liquid's own plus the pipe's radial compliance in series; a thin, large-diameter, soft pipe slows the wave and reduces the surge.
- **Assumes** — thin wall ($D/t > 20$); linear elastic wall; axially unrestrained line; single-phase liquid.
- **Fails when** — the pipe is thick-walled or heavily reinforced; the line is a bellows or flexible hose (their radial compliance is enormous and $a$ can drop by half); even 0.1 % free gas is entrained, which can halve $a$ again.
- **Tag** [F] · **Code** —

### 14-3.9 — Slow-closure surge (Michaud / Allievi)

$$\Delta p \approx \Delta p_J \cdot \frac{2L/a}{t_c} = \frac{2\rho L\,\Delta v}{t_c} \qquad (t_c > 2L/a)$$

- **Variables** — $L$ line length from valve to the nearest large-volume reflecting boundary [m]; $t_c$ effective closure time [s]; other symbols as 14-3.7.
- **Meaning** — for slow closure the surge is set by decelerating the *whole column* over $t_c$, i.e. $\rho L\,dv/dt$, with a factor 2 from the reflection bookkeeping.
- **Assumes** — linear valve closure characteristic in *flow* (not in stroke); frictionless line; a single reflecting boundary.
- **Fails when** — the valve's flow-versus-stroke characteristic is strongly nonlinear, which it always is: a ball valve passes most of its flow in the last 20 % of closure, so the *effective* $t_c$ can be a quarter of the mechanical stroke time. This is the most common error in surge analysis; using the effective time is the conservative direction.
- **Tag** [F] [J] · **Code** —

### 14-3.10 — Regulator force balance

$$p_{out}A_s = F_0 - kx + p_{in}A_{seat} + F_{flow}(x)$$

- **Variables** — $p_{out}$ regulated outlet pressure [Pa]; $A_s$ sensing area [m²]; $F_0$ spring preload [N]; $k$ spring rate [N/m]; $x$ poppet lift [m]; $p_{in}$ inlet pressure [Pa]; $A_{seat}$ seat area [m²]; $F_{flow}(x)$ Bernoulli/jet reaction force on the poppet [N].
- **Meaning** — the regulator holds outlet pressure by trading spring force against sensing force; opening the poppet compresses the spring, which *lowers* the equilibrium outlet pressure — the origin of droop.
- **Assumes** — quasi-steady operation; no friction; incompressible or slowly varying flow.
- **Fails when** — the flow-force term becomes comparable to the spring term (large lift, high $\Delta p$); friction and stiction dominate at small motions; poppet dynamics couple with the downstream volume to produce oscillation.
- **Tag** [F] [E] · **Code** —

### 14-3.11 — Burst-disk / relief tolerance stack

$$\mathrm{MDP} \ \ge\ p_{burst,max} = p_{burst,nom}(1+\tau) \ \ge\ \mathrm{MEOP}\,\frac{(1+\tau)}{(1-\tau)}$$

- **Variables** — $\tau$ fractional tolerance on burst or relief set pressure [—]; MEOP maximum expected operating pressure [Pa]; MDP maximum design pressure the structure must be qualified to [Pa].
- **Meaning** — the disk must never open in nominal service (its *minimum* burst above MEOP) and the structure must survive its *maximum* burst. With $\tau = 5$ % this gives MDP $\ge$ 1.105 MEOP — the origin of the "a burst disk costs you 10 % of your structural margin" rule.
- **Assumes** — symmetric tolerance band, same hot and cold.
- **Fails when** — temperature shifts the burst pressure (it does); the disk has been pressure-cycled toward fatigue.
- **Tag** [E] [J] · **Code** —

### 14-3.12 — Choked gas flow through a relief path

$$\dot m = \Gamma(\gamma)\,\frac{C_dA\, p_0}{\sqrt{R T_0}}, \qquad \Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $p_0$, $T_0$ stagnation pressure [Pa] and temperature [K] upstream of the throat; $R$ [J/(kg·K)]; $C_dA$ effective throat area [m²]; $\Gamma$ [—].
- **Meaning** — a choked orifice passes mass in proportion to upstream pressure and inversely to $\sqrt{T_0}$; nothing downstream matters.
- **Assumes** — pressure ratio above critical (2.05 for helium, 1.89 for nitrogen); calorically perfect gas; adiabatic flow.
- **Fails when** — real-gas effects matter (helium at 25 MPa and 300 K has $Z \approx 1.13$, so the ideal-gas mass flow is a few percent optimistic); the flow is not choked.
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`
- **Alias** — 02-3.10, 03-3.7, with $C_dA$ in place of $A_t$.

### 14-3.13 — Relief-to-regulator area ratio

$$\frac{(C_dA)_{relief}}{(C_dA)_{reg}} = \frac{p_{supply}}{p_{relief}}\sqrt{\frac{T_{relief}}{T_{supply}}}$$

- **Variables** — effective areas [m²]; $p$ [Pa]; $T$ [K].
- **Meaning** — **the relief valve must be bigger than the failed regulator's seat by roughly the pressure ratio it is protecting against.** A regulator failed open at 300 bar into a 20 bar system needs a relief path ~15× its seat area.
- **Assumes** — both flows choked; same gas; $C_d$ absorbed into each area.
- **Fails when** — the relief valve is not choked (low set pressures near ambient); the regulator's failure mode is partial rather than full opening — *not* conservative to assume, so use full open.
- **Tag** [F] [J] · **Code** —

### 14-3.14 — Manifold maldistribution

$$\frac{\delta \dot m}{\dot m} \approx \frac12\frac{\tfrac12\rho v_m^2}{\Delta p_{inj}} = \frac{C_d^2}{2}\left(\frac{\sum A_{or}}{A_m}\right)^{2} = \frac{C_d^2}{2\,AR^2}$$

- **Variables** — $AR = A_m/\sum A_{or}$ manifold area ratio [—]; $C_d$ orifice discharge coefficient [—]; $\delta\dot m/\dot m$ fractional spread in per-orifice flow between dead end and inlet [—]; $v_m$ manifold velocity [m/s].
- **Meaning** — the manifold's own dynamic head becomes a static-pressure gradient across the face; flow goes as $\sqrt{\Delta p}$, hence the factor of one half.
- **Assumes** — full stagnation recovery at the dead end, none at the inlet; a 1-D manifold; uniform orifices.
- **Fails when** — the manifold is an annulus fed tangentially (a swirl component makes the problem 2-D); the manifold is short compared with its own diameter; the flow separates off the inlet.
- **Tag** [E] · **Code** —
- **Alias** — 07-3.5, same result with $V_{man}/V$ instead of $AR$.

### 14-3.15 — Bellows squirm pressure

$$p_{sq} \approx \frac{\pi^2 (EI)_{eq}}{(KL)^2\,A_{eff}}$$

- **Variables** — $p_{sq}$ squirm pressure [Pa]; $(EI)_{eq}$ equivalent bending stiffness of the convoluted shell [N·m²]; $L$ bellows live length [m]; $K$ end-fixity factor (1.0 pinned–pinned, 0.5 fixed–fixed) [—]; $A_{eff}$ pressure-effective area [m²].
- **Meaning** — squirm is Euler buckling with the pressure thrust as the load. **The practical design rule: keep the live length short.** Get flexibility from more, shallower convolutions or a gimbal ring, not from length.
- **Assumes** — symmetric convolutions; no lateral offset; no external axial load.
- **Fails when** — the bellows is already offset or angulated (any initial imperfection lowers $p_{sq}$ sharply); the convolutions are unequal, since one soft convolution localises deformation and produces *in-plane* squirm at much lower pressure.
- **Tag** [F] [A] · **Code** —

### 14-3.16 — Bellows convolution shedding frequency

$$f_s = St\,\frac{v}{q}$$

- **Variables** — $f_s$ shedding frequency [Hz]; $St$ Strouhal number [—]; $v$ mean flow velocity [m/s]; $q$ convolution pitch [m].
- **Meaning** — the convolutions are a periodic cavity array and the shear layer over them oscillates at a frequency set by pitch and velocity; if it coincides with a shell mode the bellows fails by high-cycle fatigue.
- **Assumes** — fully developed turbulent flow; no internal liner.
- **Fails when** — an internal liner (a smooth sleeve inside the bellows) is fitted — which is precisely the fix, because it removes the flow from the convolutions altogether.
- **Tag** [E] · **Code** —

### 14-3.17 — Thin-wall hoop stress and minimum wall

$$\sigma_\theta = \frac{p D}{2t} \quad\Rightarrow\quad t \ge \frac{p_{MDP}\,D\,\mathrm{FS}}{2\,\sigma_{allow}}$$

- **Variables** — $\sigma_\theta$ hoop stress [Pa]; $p$ internal pressure [Pa]; $D$ inside diameter [m]; $t$ wall thickness [m]; FS factor of safety [—]; $\sigma_{allow}$ material allowable at temperature [Pa].
- **Meaning** — for a thin cylinder the hoop stress is twice the axial, so hoop governs.
- **Assumes** — $D/t > 10$; no bending; no external pressure; no stress concentration.
- **Fails when** — the tube is bent (the outer wall thins and the inner wall wrinkles — hence minimum bend-radius rules); at fittings and welds (apply a weld efficiency factor); under external pressure or vacuum-jacket collapse, which is a *buckling* problem, not a strength problem. Representative factors: 1.5 on yield and 2.5 on ultimate for lines, 4.0 for hoses.
- **Tag** [F] [J] · **Code** —
- **Alias** — 22-3.x uses the same hoop relation for motor cases.

### 14-3.18 — Helmholtz resonance of a pressure tap

$$f_H = \frac{c}{2\pi}\sqrt{\frac{A}{V L_{eff}}}$$

- **Variables** — $f_H$ [Hz]; $c$ speed of sound in the fluid *in the line* [m/s]; $A$ tap/line cross-sectional area [m²]; $V$ cavity volume at the transducer [m³]; $L_{eff}$ effective neck length including end corrections [m].
- **Meaning** — the tap line and transducer cavity resonate, amplifying pressure fluctuations near $f_H$ and attenuating those well above it. A bad port lies about the amplitude and the frequency at once.
- **Assumes** — lumped acoustic behaviour, $\lambda \gg L$.
- **Fails when** — the line is long enough to be an organ pipe instead (use quarter-wave resonances); the fluid in the line is two-phase, in which case $c$ is unknowable and so is everything else.
- **Tag** [F] · **Code** —

---
