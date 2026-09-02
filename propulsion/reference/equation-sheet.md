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
