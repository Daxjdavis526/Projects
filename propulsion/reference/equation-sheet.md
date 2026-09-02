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
| 05 | [Propellants](#module-05--propellants) | 3.1–3.10 |
| 06 | [Combustion chambers](#module-06--combustion-chambers) | 3.1–3.15 |
| 07 | [Injectors](#module-07--injectors) | 3.1–3.23 |
| 08 | [Ignition systems](#module-08--ignition-systems) | 3.1–3.7 |
| 09 | [Nozzles](#module-09--nozzles) | 3.1–3.14 |
| 10 | [Heat transfer](#module-10--heat-transfer) | 3.1–3.11 |
| 11 | [Cooling systems](#module-11--cooling-systems) | 3.1–3.19 |
| 12 | [Feed systems and turbopumps](#module-12--feed-systems-and-turbopumps) | 3.1–3.20 |
| 13 | [Engine cycles](#module-13--engine-cycles) | 3.1–3.9 |
| 14 | [Valves and plumbing](#module-14--valves-plumbing-and-engine-hardware) | 3.1–3.18 |
| 15 | [Combustion instability](#module-15--combustion-instability) | 3.1–3.15 |
| 16 | [Structures and materials](#module-16--structures-and-materials) | 3.1–3.10 |
| 17 | [Manufacturing](#module-17--manufacturing) | 3.1–3.8 |
| 18 | [Testing and instrumentation](#module-18--engine-testing-and-instrumentation) | 3.1–3.23 |
| 19 | [Solid propellant fundamentals](#module-19--solid-propellant-fundamentals) | 3.1–3.5 |
| 20 | [Solid combustion and burn rate](#module-20--solid-combustion-and-burn-rate) | 3.1–3.14 |
| 21 | [Grain geometry](#module-21--grain-geometry) | 3.1–3.11 |
| 22 | [Solid motor cases](#module-22--solid-motor-cases) | 3.1–3.12 |
| 23 | [Insulation and liners](#module-23--insulation-and-liners) | 3.1–3.6 |
| 24 | [Solid rocket nozzles](#module-24--solid-rocket-nozzles) | 3.1–3.18 |
| 25 | [Solid rocket manufacturing](#module-25--solid-rocket-manufacturing) | 3.1–3.9 |
| 26 | [Historical large solid motors](#module-26--historical-large-solid-motors) | 3.1–3.2, 5.1 |
| 27 | [Modern defense propulsion](#module-27--modern-defense-propulsion-engineering) | 3.1–3.11 |
| 28 | [Cold-gas principles](#module-28--cold-gas-principles) | 3.1–3.18 |
| 29 | [Cold-gas performance modeling](#module-29--cold-gas-performance-modeling) | 3.1–3.22 (+3.12a) |
| 30 | [Cold-gas hardware](#module-30--cold-gas-hardware) | 3.1–3.10 |
| 31 | [Real cold-gas systems](#module-31--real-cold-gas-systems) | 3.1–3.6, 5.1 |
| 32 | [Liquid vs solid vs cold gas](#module-32--liquid-vs-solid-vs-cold-gas) | 3.1–3.10 |
| 33 | [Systems engineering](#module-33--systems-engineering-for-propulsion) | 3.1–3.11 |
| 34 | [Failure case studies](#module-34--failure-case-studies) | 3.1, 5.1–5.3 |
| 35 | [Historical evolution](#module-35--historical-evolution) | 5.1–5.3 |
| 36 | [Modern engineering methods](#module-36--modern-engineering-methods) | 3.1–3.21 |

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

## Module 15 — Combustion Instability

### 15-3.1 — Linearised acoustic equations with heat release

$$\bar\rho\, \frac{\partial \mathbf{u}'}{\partial t} + \nabla p' = 0$$

- **Variables** — $p'$ pressure perturbation [Pa]; $\mathbf u'$ velocity perturbation [m/s]; $q'$ heat-release-rate perturbation per unit volume [W/m³]; $\bar p$ mean pressure [Pa]; $\bar\rho$ mean density [kg/m³]; $\gamma$ [—].
- **Meaning** — the momentum equation for a fluid element, paired with a pressure equation in which compressing the gas *or* adding heat to it raises the pressure. Together they are the foundation of all acoustic instability analysis.
- **Assumes** — small perturbations; zero mean flow; uniform mean state; no viscosity; no body force; ideal gas.
- **Fails when** — the mean-flow Mach number is not small (a rocket chamber runs at Ma ≈ 0.2–0.35, so mean-flow terms are a real 20–35 % effect); the mean temperature varies strongly along the chamber, which it does.
- **Tag** [F] [A] · **Code** —

### 15-3.2 — Acoustic energy equation

$$\frac{\partial}{\partial t}\underbrace{\left[\frac{p'^2}{2\gamma\bar p} + \frac{\bar\rho\,|\mathbf u'|^2}{2}\right]}_{E} + \nabla\!\cdot(p'\mathbf u') = \frac{\gamma-1}{\gamma\bar p}\,p'q'$$

- **Variables** — $E$ acoustic energy density [J/m³], the sum of a compression term and a kinetic term; $p'\mathbf u'$ acoustic intensity [W/m²]; $q'$ [W/m³].
- **Meaning** — acoustic energy in a volume changes only by flux through its boundary or by the source term $p'q'$.
- **Assumes** — everything in 15-3.1.
- **Fails when** — mean flow carries energy across the boundary. In a rocket the nozzle is exactly such a boundary and is the single largest damping term.
- **Tag** [F] [A] · **Code** —

### 15-3.3 — Rayleigh criterion, energy form

$$\underbrace{\frac{\gamma-1}{\gamma\bar p}\oint_T\!\!\int_V p'\,q'\;dV\,dt}_{\text{driving}} = \underbrace{\oint_T\!\!\oint_S p'\,\mathbf u'\!\cdot\!\mathbf n\;dS\,dt + \mathcal{D}}_{\text{damping}}$$

- **Variables** — $S$ chamber boundary [m²]; $\mathbf n$ outward normal [—]; $\mathcal D$ all dissipative losses the linear inviscid model omits (viscous and thermal boundary layers, droplet drag, relative-motion losses, mass and momentum exchange with the spray) [W].
- **Meaning** — a mode grows if heat release does net positive work on it over a cycle faster than the boundaries and dissipation remove energy. Heat added *in phase with* pressure drives; heat added out of phase damps.
- **Assumes** — periodic oscillation; linear acoustics; small mean flow.
- **Fails when** — the amplitude is large enough that the acoustics are nonlinear (steepened, shock-like fronts are normal at limit-cycle amplitudes of 20–50 % of $p_c$). The energy balance still holds conceptually but $q'$ and $\mathcal D$ both become amplitude-dependent — which is the entire reason limit cycles exist.
- **Tag** [F] · **Code** —

### 15-3.4 — Chamber fill (stay) time

$$\tau_c = \frac{V_c}{R T_c}\cdot\frac{c^*}{A_t} = \frac{L^*\,c^*}{R T_c} = \frac{L^*}{\Gamma^2\,c^*}$$

- **Variables** — $\tau_c$ chamber fill time [s]; $L^* = V_c/A_t$ [m]; $c^*$ [m/s]; $R$ [J/(kg·K)]; $T_c$ [K]; $\Gamma$ Vandenkerckhove function [—]. The last form uses $c^* = \sqrt{RT_c}/\Gamma$, so $RT_c = (\Gamma c^*)^2$.
- **Meaning** — the time constant with which chamber pressure responds to a flow imbalance: the RC time of the chamber treated as a capacitance drained through a fixed conductance.
- **Assumes** — uniform chamber gas properties; choked throat; ideal gas; all injected mass instantly in the gas phase.
- **Fails when** — a substantial fraction of the chamber volume holds liquid and unburned spray, exactly the case near the injector. $\tau_c$ is an *upper bound* on true gas residence time, typically by 10–30 % in a kerosene engine.
- **Tag** [F] [A] · **Code** `residence_time(Vc, rho_c, mdot)`
- **Alias** — 06-3.5, 07-3.6.

### 15-3.5 — Chug feedback equation

$$\tau_c\,\dot p'(t) + p'(t) + k\,p'(t-\tau) = 0$$

- **Variables** — $k$ dimensionless injector feedback gain [—]; $\tau$ combustion time lag [s]; $\tau_c$ [s]; $p'$ [Pa].
- **Meaning** — the chamber is a first-order lag closed by a delayed feedback whose strength is set by how soft the injector is.
- **Assumes** — one lumped chamber mode (chug, not screech); a stiff feed system with no line inertance and no manifold compliance; a constant lag $\tau$ that does not respond to pressure; non-cavitating orifices.
- **Fails when** — feed-line inertance is significant (it usually is, and it makes things worse); the orifices cavitate, so $\dot m$ is independent of $p_c$, $k \to 0$, and the mode disappears; $\tau$ responds to pressure — the Crocco generalisation, 15-3.10.
- **Tag** [F] [A] · **Code** —
- **Alias** — 07-3.7, identical with $t_s$ for $\tau_c$.

### 15-3.6 — Chug stability criterion

$$\text{stable if}\quad \frac{\Delta p_{inj}}{p_c} > \frac{1}{2\sqrt{1+(\omega\tau_c)^2}}$$

- **Variables** — $\omega$ neutral-mode angular frequency [rad/s], from the transcendental phase condition; $\Delta p_{inj}$ [Pa]; $p_c$ [Pa]; $\tau_c$ [s].
- **Meaning** — given a chamber capacitance and a combustion lag, there is a maximum injector softness the loop tolerates. This is the derivation of the 15–25 % injector-stiffness rule.
- **Assumes** — as 15-3.5.
- **Fails when** — the feed system contributes its own resonance, adding a second oscillator that can produce a *lower* critical gain at a different frequency — the usual reason a chamber that passes this check chugs anyway.
- **Tag** [F] [E] · **Code** —
- **Alias** — 07-3.8 gives the same result as $k_{crit}$.

### 15-3.7 — Feed-line (inertance–compliance) resonance

$$f_{feed} = \frac{1}{2\pi\sqrt{IC}}$$

- **Variables** — $f_{feed}$ [Hz]; $I$ inertance [kg/m⁴] ($I = \rho\ell/A$); $C$ compliance [m⁵/N]; $\ell$ line length [m]; $A$ line flow area [m²].
- **Meaning** — the fluid column in the feed line, sprung on whatever compressibility exists downstream, is a mass–spring resonator; if its frequency is near the chug frequency the two lock together and the margin from 15-3.6 evaporates.
- **Assumes** — lumped line; a single dominant compliance.
- **Fails when** — the line is long enough that distributed (organ-pipe) behaviour matters, i.e. $\ell$ exceeds about a tenth of an acoustic wavelength in the liquid.
- **Tag** [F] · **Code** —

### 15-3.8 — Entropy-wave (convective-acoustic) period

$$T_{ent} = \frac{L_{cyl}}{\bar u} + \frac{L_{cyl}}{c-\bar u}$$

- **Variables** — $T_{ent}$ [s]; $L_{cyl}$ chamber length [m]; $\bar u$ mean chamber gas velocity [m/s]; $c$ speed of sound [m/s].
- **Meaning** — the period of the convective-acoustic loop that couples the injector to the nozzle: a hot spot convects down, converts to pressure at the nozzle, and the wave returns upstream.
- **Assumes** — a compact nozzle that converts entropy to pressure at one station; negligible diffusion of the entropy spot; uniform $\bar u$.
- **Fails when** — the spot diffuses or is destroyed by turbulence over the chamber length, which it partly does — why entropy modes are weak in long chambers.
- **Tag** [F] [A] · **Code** —

### 15-3.9 — Chamber acoustic eigenfrequencies

$$f_{mnq} = \frac{c}{2\pi}\sqrt{\left(\frac{\alpha_{mn}}{R_c}\right)^{\!2} + \left(\frac{q\pi}{L_{cyl}}\right)^{\!2}}$$

- **Variables** — $m$ azimuthal (tangential) order, number of nodal diameters [—]; $n$ radial order [—]; $q$ longitudinal order [—]; $\alpha_{mn}$ the $n$-th non-trivial root of $J_m'(x)=0$ [—]; $R_c$ chamber radius [m]; $L_{cyl}$ barrel length [m]; $c$ [m/s].
- **Meaning** — the natural resonant frequencies of the gas column; 1T ($m{=}1,n{=}1,q{=}0$) is almost always the dangerous one.
- **Assumes** — rigid walls; uniform gas; no mean flow; a hard-walled closed end at the nozzle.
- **Fails when** — (i) the nozzle end is not rigid — it is a partially transmitting boundary that radiates energy away, shifting frequencies down a few percent and providing dominant damping; (ii) the chamber has a strong axial temperature gradient (the first 20 % is far cooler), lowering effective $c$ near the face; (iii) the chamber is not a plain cylinder. Expect the measured mode within 10–20 %.
- **Tag** [F] [A] · **Code** `a_sound(gamma, R, T)`
- **Alias** — 06-3.15 and 18-3.14 are the $m{=}1$, $n{=}1$, $q{=}0$ special case, $f_{1T} = 1.8412c/(\pi D_c)$.

### 15-3.10 — Crocco $n$–$\tau$ combustion response

$$\frac{\dot m_b'(t)}{\bar{\dot m}_b} = n\left[\frac{p'(t)}{\bar p} - \frac{p'(t-\tau)}{\bar p}\right]$$

- **Variables** — $\dot m_b'$ perturbation of the rate at which propellant is converted to hot gas [kg/s]; $n$ **interaction index**, the pressure sensitivity of the rate-controlling process [—]; $\tau$ **sensitive time lag** [s].
- **Meaning** — combustion responds to the *difference* between pressure now and pressure one lag ago; this pure differencing operator is what produces the strong frequency dependence.
- **Assumes** — a single lag common to all elements; a single sensitivity exponent; small perturbations; no velocity coupling.
- **Fails when** — velocity coupling matters (transverse velocity shredding a spray is a first-order effect in real transverse instability and is *not* in this model); there is a spread of lags across the face (there always is, and it is stabilising); at limit-cycle amplitudes where the response saturates.
- **Tag** [E] [A] · **Code** —

### 15-3.11 — Neutral stability boundary

$$\omega\tau_c = \cot\!\left(\frac{\omega\tau}{2}\right), \qquad n_{crit} = \frac{1}{1-\cos\omega\tau} = \frac{1}{2\sin^2(\omega\tau/2)}$$

- **Variables** — $\omega$ [rad/s]; $\tau_c$ [s]; $\tau$ [s]; $n_{crit}$ [—].
- **Meaning** — solve the first for $\omega$ given $\tau$ and $\tau_c$, then evaluate the second; if the propellant's actual $n$ exceeds $n_{crit}$ the chamber is linearly unstable at that frequency. This generates the classic Crocco stability map.
- **Assumes** — a lumped chamber, valid only for modes whose wavelength exceeds the chamber dimensions (chug and $L^*$ modes, not acoustics); constant $n$ and $\tau$.
- **Fails when** — applied to an acoustic mode, where the correct treatment distributes the response over the mode shape and adds nozzle and wall damping.
- **Tag** [F] [A] · **Code** —

### 15-3.12 — Baffled lowest transverse mode

$$f_{1T}^{baffled} = \frac{\alpha_{N/2,1}\;c}{\pi D_c}$$

- **Variables** — $N$ number of baffle compartments [—]; $\alpha_{\nu,1}$ first non-trivial root of $J_\nu'(x)=0$ for possibly non-integer order $\nu = N/2$ [—], well approximated by $\alpha_{\nu,1} \approx \nu + 0.8086\nu^{1/3} + 0.0725\nu^{-1/3} - 0.0510\nu^{-1}$ (0.1 % for $\nu \ge 1$); $c$ [m/s]; $D_c$ [m].
- **Meaning** — radial blades divide the chamber into sectors that cannot support $m=1$; the lowest admissible order becomes $m = N/2$, raising the lowest transverse mode by the factor $\alpha_{N/2,1}/1.8412$.
- **Assumes** — blades running the full radius, acoustically rigid, extending far enough axially to cover the region where the mode is driven.
- **Fails when** — the blades are too short: beyond the blade tips the full unbaffled mode reappears, so a short baffle simply moves the problem downstream.
- **Tag** [F] [A] · **Code** —

### 15-3.13 — Quarter-wave cavity tuning

$$f_{cav} = \frac{c_{cav}}{4\,L_{eff}}, \qquad L_{eff} = L_{cav} + \Delta L$$

- **Variables** — $c_{cav}$ speed of sound in the *cavity* gas [m/s]; $L_{cav}$ geometric depth [m]; $\Delta L$ end correction, ≈ 0.4–0.8 times the aperture's characteristic dimension [m].
- **Meaning** — at this frequency the aperture sees a velocity antinode and the absorber is maximally effective.
- **Assumes** — plane waves in the tube; uniform cavity gas; an aperture small compared with the wavelength.
- **Fails when** — the cavity gas temperature is not what you assumed — and it never is. Cavity gas temperature is the dominant uncertainty in acoustic-cavity design.
- **Tag** [F] [J] · **Code** —

### 15-3.14 — Helmholtz absorber tuning

$$f_{H} = \frac{c_{cav}}{2\pi}\sqrt{\frac{A_n}{V\,L_{eff}}}$$

- **Variables** — $V$ cavity volume [m³]; $A_n$ total neck area [m²]; $L_{eff}$ neck length plus end corrections [m]; $c_{cav}$ [m/s].
- **Meaning** — the gas plug in the neck is the mass, the gas in the cavity the spring.
- **Assumes** — $V$ small compared with $(\lambda/2\pi)^3$ so cavity pressure is uniform; linear amplitudes.
- **Fails when** — the acoustic particle velocity in the neck becomes large enough for jetting and separation — normal at instability amplitudes, and it *increases* damping while lowering the effective tuning. Nonlinear absorbers are more forgiving than linear theory suggests.
- **Tag** [F] · **Code** —
- **Alias** — 14-3.18, 18-3.13 (same Helmholtz formula for instrumentation cavities).

### 15-3.15 — Damping rate from a decay trace

$$\alpha_d = \frac{\ln(\hat p_0/\hat p)}{t}, \qquad \text{“10 \% in } t_{10}\text{”} \Rightarrow \alpha_d = \frac{\ln 10}{t_{10}} = \frac{2.303}{t_{10}}$$

- **Variables** — $\alpha_d$ damping rate [1/s]; $\hat p$ envelope amplitude [Pa]; $t_{10}$ time to decay to 10 % of peak [s].
- **Meaning** — converts a stability-rating acceptance criterion ("recovers within 40 ms of a bomb") into the quantity an analysis produces.
- **Assumes** — a single mode decaying exponentially. Read the envelope of the band-pass-filtered dynamic pressure, not the raw trace.
- **Fails when** — two modes with different decay rates are present (the envelope has a knee); the response is a decaying *limit cycle*, which decays much more slowly than exponentially near the end.
- **Tag** [E] [J] · **Code** —

---

## Module 16 — Structures and Materials

### 16-3.1 — Through-wall temperature drop

$$\Delta T_w = T_{wg} - T_{wc} = \frac{q''\, t}{k}$$

- **Variables** — $\Delta T_w$ [K]; $q''$ gas-side heat flux [W/m²]; $t$ wall thickness [m]; $k$ thermal conductivity [W/(m·K)].
- **Meaning** — how much temperature difference the wall must carry to pass the flux; the input to every thermal-stress calculation.
- **Assumes** — 1-D conduction; constant $k$; no internal heat generation; thin wall relative to radius.
- **Fails when** — the land between channels is comparable in width to its thickness (2-D fin effects, 10–30 % errors); $k$ varies strongly across the gradient; in a coating where contact resistance dominates.
- **Tag** [F] · **Code** `wall_dT(q, t, k)`
- **Alias** — 10-3.7, 11-3.5.

### 16-3.2 — Thermal stress in a restrained plate

$$\sigma_{th} = \frac{E\,\alpha\,\Delta T_w}{2\,(1-\nu)}$$

- **Variables** — $\sigma_{th}$ [Pa]; $E$ modulus at the local temperature [Pa]; $\alpha$ CTE [1/K]; $\Delta T_w$ [K]; $\nu$ [—].
- **Meaning** — the in-plane stress produced purely by the temperature gradient in a fully restrained flat plate.
- **Assumes** — full biaxial in-plane restraint; linear gradient; elastic response; temperature-independent properties.
- **Fails when** — the computed stress exceeds yield, which for a copper liner it always does. It is then not a stress but an *indicator* that the wall is cycling plastically, and a strain-based life method is required.
- **Tag** [F] [A] · **Code** `thermal_stress_hoop(E, alpha, dT, nu)`
- **Alias** — 10-3.8, 11-3.14.

### 16-3.3 — Thermal-stress figure of merit

$$M_{ts} = \frac{k\,F_{ty}\,(1-\nu)}{E\,\alpha}\qquad [\mathrm{W/m}]$$

- **Variables** — $M_{ts}$ [W/m]; $k$ [W/(m·K)]; $F_{ty}$ tensile yield strength [Pa]; $\nu$ [—]; $E$ [Pa]; $\alpha$ [1/K].
- **Meaning** — proportional to the heat flux a restrained wall of unit thickness can carry before first yield; a single number that ranks materials for cooled-wall service and explains why copper alloys dominate.
- **Assumes** — yield-limited failure; elastic up to yield; restrained plate.
- **Fails when** — ranked at room temperature for a wall that runs at 800 K (evaluate it hot); temperature capability rather than thermal stress is the limit (2219 aluminium scores brilliantly and melts at 900 K); the failure mode is oxidation, blanching or creep rather than yield.
- **Tag** [E] [J] · **Code** —

### 16-3.4 — Larson–Miller parameter

$$P_{LM} = T\left(C + \log_{10} t_r\right)$$

- **Variables** — $T$ absolute temperature [K]; $t_r$ time to rupture [h]; $C$ material constant [—], conventionally 20 for most superalloys; $P_{LM}$ [K], almost always quoted divided by 1000.
- **Meaning** — rupture life at a given stress depends on temperature and time only through this combination, so one master curve of stress versus $P_{LM}$ replaces a family of stress–time curves.
- **Assumes** — a single dominant creep mechanism over the fitted range; $C$ appropriate to the alloy (values 15–25 are used; the fitted $C$ and the data must come from the same source).
- **Fails when** — extrapolated far outside the tested range. The classic error is extrapolating past a microstructural instability — for Inconel 718, γ″ overaging above about 925 K. The equation cannot know the alloy has changed.
- **Tag** [E] · **Code** —

### 16-3.5 — Basquin high-cycle fatigue law

$$\sigma_a = \sigma'_f \,(2N_f)^{b}$$

- **Variables** — $\sigma_a$ stress amplitude [Pa]; $\sigma'_f$ fatigue strength coefficient [Pa], roughly $F_{tu}$ for many alloys; $2N_f$ reversals to failure [—]; $b$ Basquin exponent [—], typically −0.05 to −0.12.
- **Meaning** — the elastic branch of the life curve.
- **Assumes** — fully reversed loading; no mean stress; no environment effect; smooth specimen.
- **Fails when** — a mean stress is present (use Goodman or Morrow); there is a notch (use $K_f$); a hydrogen environment, which can remove the endurance limit entirely.
- **Tag** [E] · **Code** —

### 16-3.6 — Coffin–Manson low-cycle fatigue law

$$\frac{\Delta\varepsilon_p}{2} = \varepsilon'_f\,(2N_f)^{c}$$

- **Variables** — $\Delta\varepsilon_p$ plastic strain range [—]; $\varepsilon'_f$ fatigue ductility coefficient [—], of the order of true fracture ductility; $c$ [—], typically −0.5 to −0.7.
- **Meaning** — in the plastic regime, life is bought with ductility, not with strength. This is why annealed high-conductivity copper outlives a stronger, less ductile alloy in a regen liner.
- **Assumes** — isothermal; stable hysteresis loop; no environmental interaction; no creep hold time.
- **Fails when** — the cycle has a hold at temperature (creep–fatigue interaction shortens life, sometimes by 10×); the temperature varies within the cycle (thermomechanical fatigue, worse still); oxidation attacks the crack tip.
- **Tag** [E] · **Code** —

### 16-3.7 — Combined strain–life curve

$$\frac{\Delta\varepsilon_t}{2} = \frac{\sigma'_f}{E}\,(2N_f)^{b} + \varepsilon'_f\,(2N_f)^{c}$$

- **Variables** — as 16-3.5 and 16-3.6; $\Delta\varepsilon_t$ total (elastic plus plastic) strain range per cycle [—]; $E$ [Pa].
- **Meaning** — one curve from $10^0$ to $10^8$ cycles, plastic term dominating on the left and elastic on the right; they cross at the *transition life*, a few thousand reversals for copper alloys.
- **Assumes** — the four constants come from tests at the operating temperature, in the operating environment.
- **Fails when** — they do not. Hydrogen, oxygen, hold time and mean stress each move the curve, and the constants are not transferable between temperatures. Solve for $N_f$ by iteration; there is no closed form.
- **Tag** [E] · **Code** —

### 16-3.8 — Stress intensity factor

$$K = Y\,\sigma\,\sqrt{\pi a}$$

- **Variables** — $K$ [Pa·√m]; $Y$ geometry factor of order 1 [—] (1.12 for a surface flaw in a plate); $\sigma$ remote stress [Pa]; $a$ crack depth [m].
- **Meaning** — the amplitude of the crack-tip stress field; the crack runs when $K$ reaches $K_{Ic}$. The basis of all fracture control on pressure vessels.
- **Assumes** — linear-elastic behaviour; small-scale yielding (plastic zone small compared with $a$ and with the ligament); plane strain.
- **Fails when** — the material is very tough and thin (use $J$ or CTOD); the plastic zone is large.
- **Tag** [F] · **Code** —

### 16-3.9 — Paris crack-growth law

$$\frac{da}{dN} = C\,(\Delta K)^{m}$$

- **Variables** — $da/dN$ [m/cycle]; $\Delta K$ stress-intensity range [Pa·√m]; $C$, $m$ material constants [—]; $m \approx 3$ for steels and nickel alloys.
- **Meaning** — the middle, log-linear part of the crack-growth curve; integrating it gives safe-life inspection intervals.
- **Assumes** — constant amplitude; $\Delta K$ above threshold and below the fast-fracture regime; no environmental acceleration.
- **Fails when** — spectacularly, in hydrogen: gaseous hydrogen can raise $da/dN$ by one to two orders of magnitude in susceptible alloys at the same $\Delta K$.
- **Tag** [E] · **Code** —

### 16-3.10 — Thermal strain range per cycle

$$\Delta\varepsilon_{grad} = \frac{\alpha}{2(1-\nu)}\cdot\frac{q''\,t}{k}$$

- **Variables** — as 16-3.1 and 16-3.2; $\Delta\varepsilon_{grad}$ [—].
- **Meaning** — the strain range delivered per cycle by the through-thickness gradient alone in a fully restrained wall. The *strain* is kinematic even though the stress is not elastic, which is why the strain form survives yielding and the stress form does not.
- **Assumes** — linear gradient; full restraint; elastic-equivalent kinematics.
- **Fails when** — used as a complete answer. It omits the mean-temperature term, pressure-induced strain, the channel-geometry stress concentration, and any ratcheting. A real liner's total strain range is typically 1.5–3× this, and comes from a nonlinear thermal-structural FE analysis.
- **Tag** [A] [J] · **Code** —

---

## Module 17 — Manufacturing

### 17-3.1 — Cutting-tool deflection

$$\delta_{tip} = \frac{F_c L^3}{3EI},\qquad I = \frac{\pi d^4}{64}$$

- **Variables** — $\delta_{tip}$ tool tip deflection [m]; $F_c$ lateral cutting force [N]; $L$ unsupported tool length [m]; $E$ tool Young's modulus [Pa], ≈ 600 GPa for tungsten carbide; $I$ second moment of area [m⁴]; $d$ tool diameter [m].
- **Meaning** — the cutter bends away from the cut, so the machined wall is thicker than programmed and tapers with depth. The $L^3$ and $d^4$ dependences are why deep, narrow cooling channels are hard.
- **Assumes** — a solid cylindrical cantilever with a point load; elastic response; rigid holder.
- **Fails when** — the tool is fluted (real $I$ is 60–80 % of the solid value); holder or spindle compliance dominates; chatter makes the problem dynamic rather than static.
- **Tag** [F] [A] · **Code** —

### 17-3.2 — Orifice tolerance propagation

$$\frac{\delta \dot m}{\dot m} = \frac{\delta C_d}{C_d} + 2\frac{\delta d}{d}$$

- **Variables** — $\dot m$ orifice mass flow [kg/s]; $C_d$ [—]; $d$ orifice diameter [m].
- **Meaning** — a diameter error is *doubled* in the flow error, and the edge-condition error enters directly. This is why injector orifice tolerances are so tight.
- **Assumes** — incompressible single-phase flow at fixed $\Delta p$ and $\rho$; $C_d$ independent of $d$ over the tolerance band.
- **Fails when** — the orifice cavitates or hydraulically flips (then $C_d$ jumps discontinuously); the flow is two-phase.
- **Tag** [F] · **Code** `rel_unc_power(rel, exponent)`, `rel_unc_product(*rel)`

### 17-3.3 — Capillary driving pressure in a braze joint

$$\Delta p_{cap} = \frac{2\sigma\cos\theta}{\delta}$$

- **Variables** — $\Delta p_{cap}$ [Pa]; $\sigma$ liquid filler surface tension [N/m], ~1–1.9 N/m for molten braze alloys; $\theta$ contact angle of the filler on the base metal [rad]; $\delta$ joint clearance [m].
- **Meaning** — the narrower the gap, the harder the filler is pulled in; this is why braze clearances are specified in tens of microns.
- **Assumes** — parallel surfaces; clean and wettable; filler fully molten and free of oxide skin.
- **Fails when** — $\theta > 90°$ (no wetting: the filler balls up and does not enter at all); the gap is so small that viscous resistance stalls the flow; the joint is not vented and trapped gas blocks the fill.
- **Tag** [F] [E] · **Code** —

### 17-3.4 — Faraday electroforming law

$$m = \frac{M\, I\, t\, \eta_c}{n F},\qquad
s = \frac{M\, j\, t\, \eta_c}{n F \rho}$$

- **Variables** — $m$ deposited mass [kg]; $M$ molar mass of the deposited metal [kg/mol], 0.05869 for Ni; $I$ current [A]; $j$ current density [A/m²]; $t$ time [s]; $\eta_c$ cathode current efficiency [—], ~0.95–1.0 for nickel sulphamate; $n$ electrons per ion [—], 2 for Ni²⁺; $F$ Faraday constant 96 485 [C/mol]; $\rho$ deposit density [kg/m³], 8900 for Ni; $s$ thickness [m].
- **Meaning** — deposition rate is set by current density alone; this is how tubular-wall chamber closeouts and electroformed nickel jackets are built.
- **Assumes** — uniform current distribution; no side reactions; steady bath chemistry.
- **Fails when** — the current distribution is non-uniform (it always is — throwing power); hydrogen evolution takes part of the current; mass transport of Ni²⁺ to the surface limits the rate.
- **Tag** [F] · **Code** —

### 17-3.5 — Shear-forming sine law

$$t_f = t_0 \sin\alpha$$

- **Variables** — $t_f$ formed wall thickness [m]; $t_0$ blank thickness [m]; $\alpha$ angle between the mandrel wall and the plane of the original blank [rad].
- **Meaning** — in single-pass shear forming the wall thins exactly as the sine of that angle, so a mandrel wall at 30° halves the wall thickness. It lets you compute the blank from the finished part.
- **Assumes** — single-pass shear spinning of a flat blank over a conical mandrel; no circumferential strain; no thinning from the roller path itself.
- **Fails when** — multiple passes redistribute material; the part is not conical; the material's formability is exceeded and it tears or wrinkles.
- **Tag** [F] [A] · **Code** —

### 17-3.6 — Volumetric energy density (laser powder bed fusion)

$$E_v = \frac{P_\ell}{v_s\, h_s\, t_\ell}$$

- **Variables** — $E_v$ [J/m³]; $P_\ell$ laser power [W]; $v_s$ scan speed [m/s]; $h_s$ hatch spacing [m]; $t_\ell$ layer thickness [m].
- **Meaning** — energy deposited per unit volume of powder processed; the single most useful lumped process parameter for LPBF.
- **Assumes** — constant absorptivity and a stable melt pool; ignores beam diameter, spot shape, scan strategy, preheat and gas flow, all of which matter.
- **Fails when** — comparing different machines or alloys. $E_v$ is not transferable, and two parameter sets with the same $E_v$ can give completely different microstructures.
- **Tag** [E] [F] · **Code** —

### 17-3.7 — Colebrook friction factor for AM channel roughness

$$\frac{1}{\sqrt{f}} = -2\log_{10}\!\left(\frac{k_s/D_h}{3.7} + \frac{2.51}{\mathrm{Re}\sqrt{f}}\right)$$

- **Variables** — $f$ Darcy friction factor [—]; $k_s$ equivalent sand-grain roughness [m]; $D_h$ [m]; Re [—].
- **Meaning** — implicit relation for turbulent friction in a rough pipe, spanning smooth to fully rough. As-built AM channels have $k_s$ of 20–50 µm, which in a 1 mm channel is a fully-rough regime.
- **Assumes** — fully developed turbulent flow in a circular duct with uniform sand-grain roughness.
- **Fails when** — the flow is developing (the entrance region is much of a rocket channel); the duct is a high-aspect-ratio rectangle (use $D_h$ and accept a few percent); curvature induces secondary flow; the coolant is supercritical with strong property variation — all true in a real regenerative channel.
- **Tag** [E] [A] · **Code** —
- **Alias** — 11-3.11 (Haaland explicit form), 12-3.7.

### 17-3.8 — Rough-wall heat-transfer enhancement

$$\frac{\mathrm{Nu}}{\mathrm{Nu}_{smooth}} = \left(\frac{f}{f_{smooth}}\right)^{n},
\qquad n = 0.68\,\mathrm{Pr}^{0.215}$$

- **Variables** — Nu rough-wall Nusselt number [—]; $\mathrm{Nu}_{smooth}$ smooth-wall value from Dittus–Boelter or Gnielinski [—]; $f$, $f_{smooth}$ friction factors [—]; Pr [—].
- **Meaning** — heat transfer rises with roughness, but sublinearly in $f$ once form drag dominates: AM roughness buys some cooling and costs more pressure drop.
- **Assumes** — $f/f_{smooth} \le 3$; beyond that the enhancement saturates.
- **Fails when** — the roughness is not sand-grain-like (AM roughness is irregular and partly re-entrant); high-aspect-ratio channels where only part of the perimeter is rough.
- **Tag** [E] [J] · **Code** —

---

## Module 18 — Engine Testing and Instrumentation

### 18-3.1 — Life margin

$$t_{qual} \ge k_{life}\, t_{flight}$$

- **Variables** — $t$ accumulated operating time or cycles [s or cycles]; $k_{life}$ life factor [—], 1.2 to 4 depending on agency and criticality.
- **Meaning** — the demonstrated-life rule that governs how much ground testing an engine must accumulate.
- **Assumes** — damage accumulates monotonically with the demonstrated variable (time, cycles, thermal excursions).
- **Fails when** — the damage mechanism is not the one you accelerated. A coking limit is not demonstrated by a cryogenic cycle count, and LCF life demonstrated on 100 s firings tells you little about a 480 s firing whose wall reaches a different steady temperature.
- **Tag** [J] · **Code** —

### 18-3.2 — Proof and burst pressure factors

$$p_{proof} = k_p\,\mathrm{MEOP}, \qquad p_{burst} \ge k_b\,\mathrm{MEOP}$$

- **Variables** — $p_{proof}$, $p_{burst}$ [Pa]; $k_p$, $k_b$ [—]. Typical metallic values $k_p \approx 1.1$–1.5, $k_b \approx 1.5$–2.0; exact numbers are set by the governing standard and *have changed between revisions*, so quote the revision.
- **Meaning** — proof pressure produces a stress below yield in the intended design and above yield only in a local defect, so a defective part deforms or leaks visibly while a good one is unaffected.
- **Assumes** — that stress relationship holds.
- **Fails when** — the flaw is a fatigue-critical crack too small to grow at proof pressure. Proof testing screens gross defects and is not a substitute for fracture control.
- **Tag** [J] · **Code** —
- **Alias** — 14-3.11 relates MEOP to MDP through relief-device tolerance.

### 18-3.3 — Stored energy of a pressurised gas volume

$$E = \frac{p V}{\gamma - 1}\left[1 - \left(\frac{p_a}{p}\right)^{(\gamma-1)/\gamma}\right]$$

- **Variables** — $p$ vessel pressure [Pa]; $V$ internal volume [m³]; $\gamma$ [—]; $p_a$ ambient [Pa]; $E$ [J].
- **Meaning** — the hazard number for a pneumatic system. A 50 L bottle at 30 MPa holds $E \approx 3.7$ MJ ≈ 0.8 kg TNT equivalent (1 kg TNT ≈ 4.6 MJ); the same 50 L of *water* at 30 MPa holds under 20 kJ. This is the whole argument for hydrostatic rather than pneumatic proof testing.
- **Assumes** — ideal gas; isentropic; instantaneous release; no fragment kinetic energy accounted.
- **Fails when** — used as an upper bound in the direction that matters: fragments carry additional energy and the real hazard is fragment throw, not overpressure.
- **Tag** [F] [A] · **Code** —

### 18-3.4 — Discharge coefficient from cold flow

$$C_d = \frac{\dot m}{A\sqrt{2\rho\,\Delta p}}$$

- **Variables** — $\dot m$ [kg/s]; $A$ geometric orifice area [m²]; $\rho$ liquid density [kg/m³]; $\Delta p$ static pressure drop across the element [Pa].
- **Meaning** — 07-3.1 rearranged as the measurement that actually produces $C_d$.
- **Assumes** — incompressible, single-phase, steady flow; $\Delta p$ measured manifold-static to receiver-static.
- **Fails when** — the orifice cavitates (then $C_d \approx 0.61\sqrt{K}$ with $K$ the cavitation number) or hydraulically flips, at which point $C_d$ drops discontinuously and no smooth correlation applies.
- **Tag** [F] · **Code** `orifice_mdot(Cd, A, rho, dp)` inverted

### 18-3.5 — Cold-flow simulant similarity

$$V_{sim} = V_{prop}\sqrt{\frac{\rho_{prop}\sigma_{sim}}{\rho_{sim}\sigma_{prop}}}\ \ (\text{match We}),
\qquad
\frac{\nu_{sim}}{\nu_{prop}} = \frac{V_{sim}}{V_{prop}}\ \ (\text{match Re})$$

- **Variables** — $\mathrm{We} = \rho V^2 d/\sigma$; $\mathrm{Re} = \rho V d/\mu$; $\nu = \mu/\rho$ kinematic viscosity [m²/s]; $V$ [m/s]; $\sigma$ [N/m]; $\rho$ [kg/m³]; $d$ fixed by geometry [m].
- **Meaning** — two similarity conditions, one free variable. You cannot match both.
- **Assumes** — geometric similarity; isothermal, single-phase injection.
- **Fails when** — always, in the sense above; you choose which to match. Standard practice is to match We (breakup is surface-tension-limited), accept the Re mismatch, then bound the error by testing at two Re values.
- **Tag** [A] [J] · **Code** `weber(...)`, `reynolds(...)`

### 18-3.6 — Slug calorimeter

$$q'' = \rho c_p \delta \frac{dT}{dt}$$

- **Variables** — $q''$ local heat flux [W/m²]; $\rho$ [kg/m³], $c_p$ [J/(kg·K)], $\delta$ [m] density, specific heat and thickness of the isolated slug; $dT/dt$ measured [K/s].
- **Meaning** — the standard direct measurement of local wall heat flux in a hot fire.
- **Assumes** — the slug is thermally isolated from its surroundings (a machined gap or low-conductivity mount); lumped ($Bi \ll 0.1$); the measurement taken early enough that the back face is still cold.
- **Fails when** — lateral conduction is not blocked; the slug's temperature rise changes the gas-side driving potential $(T_{aw}-T_{wg})$ appreciably — use the early, nearly linear part of the trace.
- **Tag** [F] · **Code** —

### 18-3.7 — Measured characteristic velocity

$$c^*_{meas} = \frac{p_{c,ns} A_t}{\dot m}$$

- **Variables** — $p_{c,ns}$ nozzle-entrance stagnation pressure [Pa]; $A_t$ **hot** throat area [m²]; $\dot m = \dot m_o + \dot m_f$ [kg/s].
- **Meaning** — the primary reduced quantity from every hot fire.
- **Assumes** — a choked throat (always true above a few bar); 1-D flow at the throat; $\dot m$ is the *total* flow through the throat — excluding any film coolant or turbine exhaust that bypasses the chamber, excluding nothing that enters it.
- **Fails when** — the wrong pressure station is used; the error is silent and several percent.
- **Tag** [F] · **Code** `c_star(...)` for the ideal comparison
- **Alias** — 01-3.18, 06-3.14.

### 18-3.8 — Measured thrust coefficient and specific impulse

$$C_{f,meas} = \frac{F}{p_{c,ns} A_t}, \qquad
I_{sp,meas} = \frac{F}{\dot m g_0} = \frac{c^*_{meas}\,C_{f,meas}}{g_0}$$

- **Variables** — $F$ measured axial thrust at the stand's ambient pressure [N]; other symbols as 18-3.7.
- **Meaning** — the nozzle half of the reduction, and the identity that ties the two together.
- **Assumes** — $F$ is corrected for tare and for the momentum and pressure reactions of every line crossing the thrust-measuring boundary.
- **Fails when** — the reported $F$ is a raw load-cell reading. Uncorrected line reactions are a percent-level error that looks like real performance.
- **Tag** [F] · **Code** `isp_from_c(c_eff)`, `c_eff(c_star_val, Cf_val)`

### 18-3.9 — Efficiencies against a stated reference

$$\eta_{c^*} = \frac{c^*_{meas}}{c^*_{ideal}}, \qquad \eta_{C_f} = \frac{C_{f,meas}}{C_{f,ideal}}$$

- **Variables** — ideal values computed for the *measured* mixture ratio, chamber pressure, area ratio and ambient pressure. All [—].
- **Meaning** — the standard efficiency pair, with the essential caveat attached.
- **Assumes** — the reference is stated. One-dimensional equilibrium (ODE) is the JANNAF convention; a number quoted against a frozen or kinetic reference is a different number.
- **Fails when** — compared between programmes without a stated reference, which is most of the time. **A quoted "$c^*$ efficiency" without its reference method is not a number.**
- **Tag** [F] [J] · **Code** —
- **Alias** — 03-3.15, 06-3.14.

### 18-3.10 — Injector-face to nozzle-entrance pressure correction

$$\frac{p_{c,ns}}{p_{c,inj}} = \frac{\left(1+\frac{\gamma-1}{2}M_c^2\right)^{\gamma/(\gamma-1)}}{1+\gamma M_c^2}$$

- **Variables** — $M_c$ Mach number at the nozzle entrance, from inverting the subsonic branch of the area relation at $\varepsilon_c = A_c/A_t$ [—]; $\gamma$ [—].
- **Meaning** — the correction that reconciles a measured injector-face pressure with the stagnation pressure $c^*$ is defined against. The correction is 1–2 % for $\varepsilon_c \ge 3$ and grows sharply below $\varepsilon_c = 2$.
- **Assumes** — constant-area frictionless heat addition from face to nozzle entrance; uniform 1-D properties; combustion complete at the nozzle entrance.
- **Fails when** — the chamber is highly convergent from the face (not constant-area); combustion continues into the nozzle, which pushes the real loss further.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.8, 06-3.9.

### 18-3.11 — Hot throat area

$$A_t(T) = A_{t,0}\,[1 + \alpha (T - T_0)]^2$$

- **Variables** — $A_t(T)$ hot throat area [m²]; $A_{t,0}$ cold area [m²]; $\alpha$ linear CTE [1/K]; $T - T_0$ throat wall temperature rise [K].
- **Meaning** — the throat you measured cold is not the throat that flowed. For a copper-alloy throat at 700 K rise, $\alpha \approx 17\times10^{-6}$ K⁻¹ gives a **2.4 %** area increase — larger than most people's entire uncertainty budget.
- **Assumes** — uniform temperature around the throat; free expansion; no erosion.
- **Fails when** — ablative and graphite throats, which erode monotonically; regeneratively cooled throats under hoop restraint, which cannot expand freely.
- **Tag** [F] [A] · **Code** —

### 18-3.12 — Quarter-wave resonance of a pressure line

$$f_{1/4} = \frac{a}{4L}$$

- **Variables** — $a$ speed of sound in the fluid filling the line [m/s]; $L$ line length [m].
- **Meaning** — a long sense line is an organ pipe; it amplifies at $f_{1/4}$ and lies about everything above it.
- **Assumes** — uniform line; closed at the transducer, open (to the chamber) at the other end; negligible damping.
- **Fails when** — the line is long enough that viscous attenuation dominates before the resonance builds; the line contains a two-phase or stratified fluid, in which case $a$ is neither known nor constant.
- **Tag** [F] · **Code** —

### 18-3.13 — Helmholtz resonance of a transducer cavity

$$f_H = \frac{a}{2\pi}\sqrt{\frac{A}{V L_{eff}}}, \qquad L_{eff} = L + 0.6\,r$$

- **Variables** — $A$ passage cross-sectional area [m²]; $L_{eff}$ passage length with end correction [m]; $r$ passage radius [m]; $V$ cavity volume [m³]; $a$ [m/s].
- **Meaning** — the short-passage counterpart of 18-3.12; the lumped model that applies when all dimensions are much less than a wavelength.
- **Assumes** — lumped acoustic system; rigid walls; no mean flow.
- **Fails when** — the passage is long relative to a wavelength, at which point 18-3.12 is the right model.
- **Tag** [F] · **Code** —
- **Alias** — 14-3.18, 15-3.14.

### 18-3.14 — First tangential mode (instrumentation planning)

$$f_{1T} = \frac{1.8412\,a_c}{\pi D_c}$$

- **Variables** — $a_c$ chamber sound speed [m/s]; $D_c$ chamber diameter [m]; 1.8412 the first zero of $J_1'$ [—].
- **Meaning** — tells you which decade to instrument and filter for.
- **Assumes** — cylindrical chamber; uniform temperature; hard walls.
- **Fails when** — real chambers, by 10–20 %, because temperature and hence $a_c$ vary axially and radially. Use it to know *which decade* to look in, not to identify a mode by frequency alone.
- **Tag** [F] [A] · **Code** `a_sound(gamma, R, T)`
- **Alias** — 06-3.15, 15-3.9.

### 18-3.15 — Thermocouple first-order response

$$\tau\frac{dT_i}{dt} + T_i = T_{true}, \qquad \tau = \frac{\rho c_p V}{h A} \approx \frac{\rho c_p d}{6h}$$

- **Variables** — $T_i$ indicated temperature [K]; $T_{true}$ true temperature [K]; $\tau$ time constant [s]; $h$ local convective coefficient [W/(m²·K)]; $d$ bead diameter [m]; $\rho$ [kg/m³]; $c_p$ [J/(kg·K)].
- **Meaning** — a thermocouple is a first-order lag; the bead diameter sets the bandwidth.
- **Assumes** — lumped junction ($Bi \ll 0.1$); a single dominant heat path; constant properties.
- **Fails when** — the junction also radiates (hot gas, cold walls: it reads low by up to hundreds of kelvin); conduction down the leads is significant (stem loss — why sheathed TCs are inserted at least 10 sheath diameters); a protective sheath adds its own much larger $\tau$.
- **Tag** [F] · **Code** —

### 18-3.16 — Accelerometer usable bandwidth

$$f \le \frac{f_{mount}}{3}$$

- **Variables** — $f_{mount}$ mounted resonance frequency [Hz].
- **Meaning** — the usable band of a mounted accelerometer. Stud mounting gives $f_{mount}$ of 30–50 kHz; adhesive 10–20 kHz; a magnet 2–7 kHz; a handheld probe under 1 kHz.
- **Assumes** — a rigid structure under the mount.
- **Fails when** — the *structure* resonates below the mount. Bracket-mounted accelerometers routinely report the bracket, not the engine.
- **Tag** [E] [J] · **Code** —

### 18-3.17 — Nyquist sampling criterion

$$f_s > 2 f_{max}$$

- **Variables** — $f_s$ sample rate [Hz]; $f_{max}$ highest frequency of interest [Hz].
- **Meaning** — energy above $f_s/2$ **aliases** down to $|f - n f_s|$ and is indistinguishable from real low-frequency content. Anti-alias filter before you sample, always.
- **Assumes** — ideal sampling.
- **Fails when** — treated as a *sufficient* condition. 2× is the theoretical minimum for reconstruction; practical measurement uses 5–10× for waveform fidelity and 2.56× as the standard for spectral analysis.
- **Tag** [F] · **Code** —

### 18-3.18 — Quantization error

$$q = \frac{\mathrm{FS}}{2^N}, \qquad \varepsilon_{RMS} = \frac{q}{\sqrt{12}}$$

- **Variables** — FS converter full-scale span [in engineering units]; $N$ bits [—]; $q$ code width; $\varepsilon_{RMS}$ RMS quantization noise.
- **Meaning** — usually negligible: a 16-bit converter on a 0–10 MPa channel has $q = 153$ Pa and 44 Pa RMS noise, against a 0.25 % FS transducer error of 25 kPa. **The lesson is ranging, not bits**: a 70 bar transducer on a 5 bar signal wastes 14 of 16 bits, and the FS error term scales with the range, not the reading.
- **Assumes** — the signal spans many codes.
- **Fails when** — a small signal sits on a large range; quantization noise is then correlated with the signal and shows up as distortion.
- **Tag** [F] · **Code** —

### 18-3.19 — General uncertainty propagation

$$u_y^2 = \sum_i \left(\frac{\partial f}{\partial x_i}\right)^2 u_{x_i}^2$$

- **Variables** — $u$ standard uncertainty in the units of the quantity; $y = f(x_1,\dots,x_n)$.
- **Meaning** — the root-sum-square combination of independent contributions.
- **Assumes** — independence (no shared systematic error); local linearity over the range $\pm u$.
- **Fails when** — two channels share a calibration standard or a common temperature error. Correlated errors add *linearly*, not in quadrature, and can be much larger than the RSS suggests. This is the single most common way an uncertainty budget lies.
- **Tag** [F] · **Code** `rss(*terms)`

### 18-3.20 — Relative uncertainty of a power-law product

$$\frac{u_y}{y} = \sqrt{\sum_i a_i^2 \left(\frac{u_{x_i}}{x_i}\right)^2}$$

- **Variables** — $a_i$ the exponent of $x_i$ in $y = \prod x_i^{a_i}$ [—].
- **Meaning** — a quantity depending on the square of a measured diameter inherits *twice* that diameter's relative uncertainty. Note the essential asymmetry: **products combine relative uncertainties; sums combine absolute ones.**
- **Assumes** — independence.
- **Fails when** — inputs are correlated, as in 18-3.19.
- **Tag** [F] · **Code** `rel_unc_product(*rel)`, `rel_unc_power(rel, exponent)`

### 18-3.21 — $I_{sp}$ uncertainty

$$\frac{\partial I_{sp}}{\partial F} = \frac{I_{sp}}{F},
\quad
\frac{\partial I_{sp}}{\partial \dot m} = -\frac{I_{sp}}{\dot m}
\quad\Rightarrow\quad
\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{\left(\frac{u_F}{F}\right)^2 + \left(\frac{u_{\dot m}}{\dot m}\right)^2}$$

- **Variables** — $F$ [N]; $\dot m$ [kg/s]; $u$ standard uncertainties; $g_0$ is a defined constant and contributes nothing.
- **Meaning** — specific-impulse uncertainty is the quadrature sum of thrust and flow uncertainty, and nothing else.
- **Assumes** — $F$ and $\dot m$ independently measured.
- **Fails when** — that is *false*: if the reduction used a flow computed from $p_c$ and $c^*$, the two are perfectly correlated and this formula understates the uncertainty badly. Common in hobbyist and early-programme data.
- **Tag** [F] · **Code** `rss(*terms)`

### 18-3.22 — Quantity–distance scaling

$$R = K\,W^{1/3}$$

- **Variables** — $R$ required separation [m]; $W$ net explosive weight or propellant TNT equivalent [kg]; $K$ scaling constant set by the protection level required (personnel, inhabited building, public traffic route) [m/kg$^{1/3}$].
- **Meaning** — blast overpressure scales with the cube root of energy, so separation distance does too.
- **Assumes** — an idealised free-field blast and a stated equivalence factor for the propellant combination; LOX/hydrocarbon and LOX/LH₂ have very different published factors and the numbers are facility-specific.
- **Fails when** — fragment throw governs, which it frequently does at large $W$; cryogenic vapour-cloud drift governs the downwind hazard rather than blast.
- **Tag** [E] [J] · **Code** —

### 18-3.23 — Redline setting with latency

$$\text{redline} = \text{limit} - \underbrace{\dot X\, t_{lat}}_{\text{latency}} - \underbrace{k\,u_X}_{\text{measurement}} - \underbrace{\Delta X_{scatter}}_{\text{normal variation}}$$

$$t_{lat} = \tau_{sensor} + t_{filter} + t_{sample} + t_{logic} + t_{valve}$$

- **Variables** — $\dot X$ rate of change of the monitored parameter [unit/s]; $t_{lat}$ total detection-to-action latency [s]; $u_X$ measurement uncertainty; $k$ coverage factor [—]; $\Delta X_{scatter}$ normal engine-to-engine and run-to-run variation.
- **Meaning** — a redline must be set far enough below the limit that the system can act in time. Typical magnitudes: $\tau_{sensor}$ 1–500 ms (a sheathed thermocouple is the worst offender by two orders of magnitude); $t_{filter}$ 1–50 ms; $t_{sample}$ 1–2 intervals plus the $N$-consecutive-samples persistence requirement (a deliberate purchase of latency to avoid nuisance shutdowns); $t_{logic}$ 1–20 ms including any two-out-of-three voting; $t_{valve}$ 20–200 ms plus chamber blowdown.
- **Assumes** — each stage is serial.
- **Fails when** — the sensor is not measuring the failing thing at all: a wall thermocouple 30 mm from a burn-through sees it late or never.
- **Tag** [J] · **Code** —

---

# Part III — Solid rocket motors (modules 19–27)

## Module 19 — Solid Propellant Fundamentals

### 19-3.1 — Gas generation rate

$$\dot m_{gen} = \rho_p A_b r$$

- **Variables** — $\dot m_{gen}$ gas generation rate [kg/s]; $\rho_p$ propellant density [kg/m³]; $A_b$ instantaneous burning surface area [m²]; $r$ burning rate [m/s].
- **Meaning** — the propellant is consumed by sweeping a surface through a solid of known density. The supply side of every solid-motor ballistic calculation.
- **Assumes** — the surface burns uniformly and normal to itself; no unburned propellant is ejected; the grain is homogeneous at the scale of the regression.
- **Fails when** — the grain is cracked (so $A_b$ is not the design surface); slivers or unbonded chunks are expelled; erosive burning makes $r$ a function of position; near ignition and tail-off when the surface is not yet or no longer fully lit.
- **Tag** [F] · **Code** —
- **Alias** — 20-3.1, 21-3.1 (left-hand side).

### 19-3.2 — Choked nozzle discharge

$$\dot m_{out} = \frac{\Gamma\, p_c A_t}{\sqrt{R T_c}} = \frac{p_c A_t}{c^*}, \qquad \Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $p_c$ chamber stagnation pressure [Pa]; $A_t$ throat area [m²]; $R = R_u/\bar M$ [J/(kg·K)]; $T_c$ [K]; $c^*$ [m/s]; $\Gamma$ [—].
- **Meaning** — a choked throat is a fixed-conductance valve whose conductance depends only on the gas and the area. The demand side of the balance.
- **Assumes** — choked, quasi-steady, calorically perfect single-phase gas; no throat erosion.
- **Fails when** — the throat erodes (it always does, a few percent over a long burn); a large condensed fraction makes "the gas" a poor description; during the chamber-filling transient.
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`
- **Alias** — 02-3.10, 03-3.7.

### 19-3.3 — Equilibrium chamber pressure

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}}, \qquad K_n = \frac{A_b}{A_t}$$

- **Variables** — $a$ burn-rate coefficient [m·s⁻¹·Pa⁻ⁿ]; $n$ pressure exponent [—]; $\rho_p$ [kg/m³]; $c^*$ [m/s]; $K_n$ burning-area-to-throat-area ratio [—]; $p_c$ [Pa].
- **Meaning** — chamber pressure is set by the propellant ($a$, $n$, $\rho_p$, $c^*$) and by one geometric number ($K_n$). This is the design equation of solid internal ballistics.
- **Assumes** — steady state; Vieille's law valid over the pressure range; $n < 1$.
- **Fails when** — $n \ge 1$, in which case the equilibrium is unstable and the motor either extinguishes or runs away. This is the single hardest constraint on propellant formulation and why no flown propellant has $n$ near unity.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(a, n, rho_p, Ab, At, c_star_val)`
- **Alias** — 20-3.7, 21-3.2, identical.

### 19-3.4 — Solid-motor specific impulse

$$I_{sp} = \frac{c^* C_F}{g_0}, \qquad c^* = \frac{\sqrt{R T_c}}{\Gamma} = \frac{1}{\Gamma}\sqrt{\frac{R_u T_c}{\bar M}}$$

- **Variables** — $c^*$ [m/s]; $C_F$ [—]; $g_0 = 9.80665$ m/s²; $R_u = 8314.46$ J/(kmol·K); $T_c$ [K]; $\bar M$ mean molar mass [kg/kmol]; $\Gamma$ [—].
- **Meaning** — performance splits cleanly into a chemistry term ($c^*$) and a nozzle-and-altitude term ($C_F$), just as for liquids. Aluminised AP composites land at 240–270 s vacuum because $\bar M$ is high (HCl, Al₂O₃) even though $T_c$ is high.
- **Assumes** — ideal, 1-D, equilibrium or frozen single-phase expansion of a calorically perfect gas.
- **Fails when** — a condensed phase is present, which is exactly the solid-motor case; the flow is not fully expanded or separates; $\gamma$ varies strongly through the nozzle.
- **Tag** [F] [A] · **Code** `c_star(...)`, `c_eff(...)`, `isp_from_c(...)`
- **Alias** — 03-3.10.

### 19-3.5 — Density impulse

$$I_d = \rho_p I_{sp}$$

- **Variables** — $I_d$ [kg·s/m³]; $\rho_p$ propellant bulk density [kg/m³]; $I_{sp}$ [s].
- **Meaning** — total impulse deliverable per unit *volume* of propellant; the metric on which solids beat liquids decisively (1750 kg/m³ × 265 s versus 1030 × 340 for kerolox).
- **Assumes** — nothing beyond definitions, but the comparison is only fair between systems at the same expansion ratio and against the same back pressure.
- **Fails when** — the mission is $\Delta v$-limited with a generous volume budget (then $I_{sp}$ alone wins); tankage/case mass rather than propellant volume dominates.
- **Tag** [F] · **Code** `density_isp(rho, isp)`
- **Alias** — 05-3.3, 32.

---

## Module 20 — Solid Combustion and Burn Rate

### 20-3.1 — Gas generation rate (with the gas-displacement correction)

$$\dot m_{gen} = \rho_p A_b r$$

- **Variables** — as 19-3.1.
- **Meaning** — mass of solid converted to gas per second. Strictly the gas *added to the port* is $(\rho_p - \rho_g)A_b r$, because the vacated volume already held gas; at $p_c = 7.5$ MPa with $\rho_g \approx 8$ kg/m³ against $\rho_p = 1750$ kg/m³ that correction is 0.46 % and is conventionally absorbed into the $c^*$ efficiency.
- **Assumes** — the whole surface burns at the same rate; the propellant is homogeneous at the scale of the surface.
- **Fails when** — an unbonded region or crack suddenly exposes new $A_b$; part of the surface is inhibited or debonded; erosive burning makes $r$ position-dependent.
- **Tag** [F], [A] for the neglected $\rho_g$ term · **Code** —

### 20-3.2 — Subsurface thermal profile

$$T(x) = T_i + (T_s - T_i)\exp\!\left(\frac{r x}{\alpha}\right), \qquad x \le 0$$

- **Variables** — $x$ measured into the solid, negative into cold propellant [m]; $T_i$ bulk soak temperature [K]; $T_s$ surface temperature [K]; $r$ [m/s]; $\alpha$ thermal diffusivity [m²/s].
- **Meaning** — the preheated layer is an exponential of e-folding depth $\delta_{th} = \alpha/r$, typically tens of microns. Its thermal relaxation time $\tau_{th} = \alpha/r^2$ sets the frequency above which the burn rate cannot follow pressure.
- **Assumes** — steady 1-D regression; constant properties; no subsurface reaction; no radiation absorption below the surface.
- **Fails when** — an energetic plasticiser reacts below the surface (nitrate-ester systems do); $r$ changes on a timescale comparable to $\tau_{th}$; near an embedded oxidiser particle, where the field is not 1-D.
- **Tag** [F] · **Code** —

### 20-3.3 — Summerfield granular-diffusion-flame linearisation

$$\frac{p}{r} = a' + b'p^{1/3}$$

- **Variables** — $p$ [Pa]; $r$ [m/s]; $a'$, $b'$ empirical constants [SI-consistent].
- **Meaning** — plotting $p/r$ against $p^{1/3}$ linearises composite burn-rate data over a useful range; the intercept is the kinetics-controlled term and the slope the diffusion-controlled term.
- **Assumes** — AP-composite propellant; monomodal oxidiser; no metal; no erosive flow.
- **Fails when** — the propellant is aluminised (metal changes the near-surface energy balance); at very high pressure where the flame collapses to the surface; for nitramine or double-base propellants, which have no granular diffusion structure.
- **Tag** [E] · **Code** —

### 20-3.4 — Saint-Robert / Vieille law

$$r = a\,p^{\,n}$$

- **Variables** — $r$ [m/s]; $p$ [Pa]; $a$ [m·s⁻¹·Pa⁻ⁿ]; $n$ [—].
- **Meaning** — the propellant's constitutive law, measured not derived; $n$ is typically 0.2–0.5 for AP composites.
- **Assumes** — fixed initial temperature $T_i$; no cross-flow over the surface; quasi-steady combustion (pressure changing slowly compared with $\tau_{th}$); pressure inside the fitted range.
- **Fails when** — extrapolated outside the fitted range (extrapolating across a plateau is a common and expensive error); during the ignition transient and tail-off where $dp/dt$ is large; in the aft end of a high-$G$ port; at very low pressure, below the *deflagration limit* (typically 0.5–1.5 MPa for AP composites) where combustion is not sustained at all.
- **Tag** [E] · **Code** `vieille_burn_rate(a, p, n)`

### 20-3.5 — Burn-rate coefficient unit conversion

$$a_{\mathrm{SI}} = a_{[\mathrm{mm/s,MPa}]}\times 10^{-3}\times\left(10^{-6}\right)^{n}$$

- **Variables** — $a_{\mathrm{SI}}$ [m·s⁻¹·Pa⁻ⁿ]; $a_{[\mathrm{mm/s,MPa}]}$ the coefficient as usually tabulated; $n$ [—], dimensionless and unchanged between systems.
- **Meaning** — the conversion that must be done before any SI calculation. $a$ carries the units of the whole law, so it changes by $10^{-3}\cdot(10^{-6})^n$, not by a simple factor.
- **Assumes** — the same $n$ in both systems, which is true.
- **Fails when** — someone has quoted "$a$" for a law written as $r = a(p/p_{ref})^n$, a different and much safer convention. **Always check whether a reference pressure is present.**
- **Tag** [F] · **Code** —

### 20-3.6 — Lumped chamber mass balance

$$\frac{d}{dt}\left(\rho_g V_c\right) = \rho_p A_b r - \frac{p_c A_t}{c^*}$$

- **Variables** — $\rho_g$ port gas density [kg/m³]; $V_c$ free port volume [m³]; other symbols as above.
- **Meaning** — gas accumulates in the port at the difference between what the surface makes and what the throat passes. Setting the derivative to zero gives 20-3.7.
- **Assumes** — choked nozzle; uniform port properties (a lumped chamber); $c^*$ constant; no gas storage in cracks or the igniter cavity.
- **Fails when** — the nozzle is not yet choked (early ignition transient); the port is long and slender enough that head-to-aft pressure drop is not negligible; significant mass is stored in an unvented crack.
- **Tag** [F] · **Code** —

### 20-3.7 — Equilibrium pressure (design equation)

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}},\qquad K_n \equiv \frac{A_b}{A_t}$$

- **Variables** — as 19-3.3.
- **Meaning** — everything the designer controls appears once: chemistry in $a$, $n$, $\rho_p$, $c^*$; geometry in $K_n$.
- **Assumes** — everything in 20-3.6, plus $n < 1$ (else no stable root), plus quasi-steady operation.
- **Fails when** — erosive burning makes $r$ position-dependent; during transients; when $A_t$ changes fast enough that equilibrium is not reached — which, given a relaxation time of a few milliseconds, essentially never happens in a large motor.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(a, n, rho_p, Ab, At, c_star_val)`

### 20-3.8 — Pressure-perturbation decay and the $n<1$ condition

$$\frac{d\varepsilon}{dt} = -\frac{(1-n)}{\tau_{fill}}\,\varepsilon,
\qquad \tau_{fill} \equiv \frac{V_c}{A_t c^*\Gamma^2} = \frac{L^*}{c^*\Gamma^2}$$

- **Variables** — $\varepsilon$ fractional pressure perturbation [—]; $\tau_{fill}$ chamber filling time [s]; $L^* = V_c/A_t$ [m]; $\Gamma$ [—].
- **Meaning** — perturbations decay exponentially with time constant $\tau_{fill}/(1-n)$. The closer $n$ is to 1 the slower the motor recovers from an upset; at $n > 1$ the exponent changes sign and perturbations grow. This is the dynamic proof of the $n < 1$ requirement.
- **Assumes** — lumped chamber; quasi-steady burn rate (the surface responds instantly); constant $T_0$; choked throat; small perturbation.
- **Fails when** — the perturbation period approaches the solid-phase relaxation time $\tau_{th} = \alpha/r^2$; the burn rate then lags pressure and this analysis is invalid.
- **Tag** [F] · **Code** —
- **Alias** — $\tau_{fill}$ is identical to the $t_s$ of 06-3.5 and $\tau_c$ of 15-3.4.

### 20-3.9 — Temperature sensitivity of burn rate

$$\sigma_p \equiv \left(\frac{\partial \ln r}{\partial T_i}\right)_p
\;\Longrightarrow\;
\frac{r_2}{r_1} = \exp\!\left[\sigma_p (T_{i,2}-T_{i,1})\right]$$

- **Variables** — $\sigma_p$ [1/K], typically 0.001–0.004 K⁻¹; $T_i$ initial (soak) temperature [K].
- **Meaning** — fractional change in burn rate per kelvin of soak temperature, measured **at constant pressure** — in a strand burner or closed bomb, not in a motor.
- **Assumes** — $\sigma_p$ constant over the range; the grain uniformly soaked.
- **Fails when** — the range spans a binder glass transition or an ingredient phase change (plasticised binders can transition inside the military −54 °C to +71 °C range); the grain is *not* uniformly soaked — a thick grain takes days to equilibrate, and a rapid transfer from a cold magazine to a warm launcher leaves a gradient.
- **Tag** [E] · **Code** `temperature_sensitivity_pressure(sigma_p, dT)`

### 20-3.10 — Temperature sensitivity of chamber pressure

$$\pi_K \equiv \left(\frac{\partial \ln p_c}{\partial T_i}\right)_{K_n} = \frac{\sigma_p}{1-n}$$

- **Variables** — $\pi_K$ [1/K]; $\sigma_p$ [1/K]; $n$ [—].
- **Meaning** — the temperature sensitivity of *chamber pressure* is that of *burn rate* amplified by the same $1/(1-n)$ that amplifies everything else. This drives the hot-day MEOP factor.
- **Assumes** — $n$ independent of $T_i$ (good to first order); fixed geometry; equilibrium operation; $c^*$ and $\rho_p$ temperature-independent (grain thermal expansion is a $10^{-4}$/K effect on $\rho_p$ and is neglected).
- **Fails when** — $n$ itself varies with temperature; outside the qualified temperature range.
- **Tag** [F] · **Code** `pressure_sensitivity_pi_K(sigma_p, n)`

### 20-3.11 — Lenoir–Robillard erosive burning

$$r = \underbrace{a p^{n}}_{r_0} + \underbrace{\frac{\alpha_{LR}\,G^{0.8}}{D_h^{0.2}}\exp\!\left(-\frac{\beta_{LR}\,\rho_p r}{G}\right)}_{r_e}$$

- **Variables** — $G$ local port mass flux [kg/(m²·s)]; $D_h$ port hydraulic diameter [m]; $\alpha_{LR}$, $\beta_{LR}$ empirical constants fitted per propellant.
- **Meaning** — the erosive term is a turbulent-convection heat-transfer law — the $G^{0.8}D_h^{-0.2}$ group is exactly the Dittus–Boelter/Colburn scaling of Module 10 — multiplied by a blowing correction: gas leaving the surface at $\rho_p r$ thickens the boundary layer and *shields* the surface.
- **Assumes** — turbulent, fully developed, subsonic port flow; constants fitted to this propellant at this pressure.
- **Fails when** — extrapolated to another propellant (the constants are not transferable); in the port entrance region; near a slot or fin where the flow is 3-D; at transonic port Mach numbers. Note $r$ appears on both sides — the equation is implicit and must be solved iteratively.
- **Tag** [E] · **Code** —

### 20-3.12 — Threshold-flux erosive model

$$r = a p^n + k\,\langle G - G_{th}\rangle, \qquad \langle x\rangle = \max(x,0)$$

- **Variables** — $k$ erosive slope [m³/kg]; $G_{th}$ threshold flux [kg/(m²·s)]; $G$ [kg/(m²·s)].
- **Meaning** — below a threshold flux the boundary layer's blowing shield wins and there is no augmentation; above it, augmentation is roughly linear in the excess.
- **Assumes** — constants fitted to data; single propellant; subsonic port.
- **Fails when** — used outside the fit; it will always understate the sharp onset seen in some data. A teaching and preliminary-design model, not a qualification model.
- **Tag** [E] [A] · **Code** —

### 20-3.13 — Solid-motor acoustic modes

$$f_{1L} = \frac{a_g}{2L_c}, \qquad
f_{1T} = \frac{1.8412\,a_g}{\pi D}, \qquad
a_g = \sqrt{\gamma R_g T_0}$$

- **Variables** — $f_{1L}$, $f_{1T}$ first longitudinal and first tangential frequencies [Hz]; $a_g$ speed of sound in the combustion gas [m/s]; $L_c$ chamber length [m]; $D$ port diameter [m]; 1.8412 the first zero of $J_1'$ [—].
- **Meaning** — the discrete frequencies the chamber will ring at. In a large solid, 1L is the dangerous one (tens of Hz) and it couples to vehicle structure — the "thrust oscillation" problem of the Shuttle SRB and Ares I.
- **Assumes** — uniform gas properties; simple cylindrical geometry; rigid walls; no mean-flow correction.
- **Fails when** — the port is star-shaped or slotted (transverse mode shapes are then not Bessel functions); the gas is heavily particle-laden (effective sound speed drops); and as the grain burns back and $L_c$, $D$ change — **the mode frequencies sweep during the burn, which is why instability often appears only in a window of the trace**.
- **Tag** [F] · **Code** `a_sound(gamma, R, T)`
- **Alias** — 06-3.15, 15-3.9, 18-3.14 give the same $f_{1T}$.

### 20-3.14 — Ballistic influence coefficients

$$\frac{\delta p_c}{p_c} = \frac{1}{1-n}\left[\frac{\delta A_b}{A_b} - \frac{\delta A_t}{A_t} + \frac{\delta a}{a} + \frac{\delta c^*}{c^*} + \frac{\delta \rho_p}{\rho_p}\right]$$

- **Variables** — fractional perturbations of each input [—].
- **Meaning** — the influence-coefficient form of 20-3.7; the equation used to build a ballistic error budget. Every input error is amplified by $1/(1-n)$.
- **Assumes** — small perturbations; $n$ constant.
- **Fails when** — perturbations are large (use 20-3.7 directly); the perturbation itself changes $n$ — a grain crack does not just raise $A_b$, it exposes surface at a location with different flow conditions.
- **Tag** [F] · **Code** —
- **Alias** — 21-3.4 and 23-3.6 are special cases with only the $A_b$ term.

---

## Module 21 — Grain Geometry

### 21-3.1 — Quasi-steady mass balance

$$\rho_p A_b r = \frac{p_c A_t}{c^*}$$

- **Variables** — $\rho_p$ [kg/m³]; $A_b$ [m²]; $r$ [m/s]; $p_c$ [Pa]; $A_t$ [m²]; $c^*$ [m/s].
- **Meaning** — gas generated by surface regression equals gas leaving a choked throat.
- **Assumes** — quasi-steady (chamber gas mass is small compared with what flows through it in one filling time); uniform $p_c$ over the burning surface; no erosive burning; no throat erosion; complete and prompt combustion.
- **Fails when** — during ignition transient and tail-off; at high port mass flux (erosive burning); when the throat erodes appreciably.
- **Tag** [F] · **Code** —

### 21-3.2 — Equilibrium pressure from $K_n$

$$p_c = \left( a\,\rho_p\, c^*\, K_n \right)^{\frac{1}{1-n}}, \qquad K_n \equiv \frac{A_b}{A_t}$$

- **Variables** — as 19-3.3.
- **Meaning** — chamber pressure is set entirely by the *area ratio* $K_n$ and the propellant's ballistic constants. Grain design is therefore the design of the $K_n(u)$ curve.
- **Assumes** — everything in 21-3.1, plus $n < 1$.
- **Fails when** — $n \to 1$; $a$ shifts with initial grain temperature; erosive burning makes $r$ position-dependent.
- **Tag** [F], with [E] inherited from the rate law · **Code** `solid_equilibrium_pressure(...)`

### 21-3.3 — Thrust from burning area

$$F = C_F\, p_c\, A_t = C_F\, c^*\, \rho_p\, A_b\, r$$

- **Variables** — $F$ [N]; $C_F$ [—]; $p_c$ [Pa]; $A_t$ [m²]; $c^*$ [m/s]; $\rho_p$ [kg/m³]; $A_b$ [m²]; $r$ [m/s].
- **Meaning** — with $A_t$, $C_F$ and the propellant fixed, thrust is proportional to $A_b r$; since $r$ itself rises with $p_c$ which rises with $A_b$, thrust is a *superlinear* function of burning area.
- **Assumes** — fixed, attached nozzle flow.
- **Fails when** — the nozzle separates; throat erosion changes $A_t$ during the burn.
- **Tag** [F] · **Code** —

### 21-3.4 — Burning-area amplification law

$$\frac{\delta p_c}{p_c} = \frac{1}{1-n}\,\frac{\delta A_b}{A_b}
\qquad\text{and}\qquad
\frac{\delta F}{F} \approx \frac{1}{1-n}\,\frac{\delta A_b}{A_b}$$

- **Variables** — fractional perturbations [—]; $n$ [—].
- **Meaning** — a fractional error or variation in burning area shows up in chamber pressure amplified by $1/(1-n)$. A 10 % area error at $n = 0.35$ is a 15 % pressure error.
- **Assumes** — small perturbations; fixed $A_t$; $C_F$ weakly dependent on $p_c$.
- **Fails when** — excursions are large (use 21-3.2 directly); $n$ near 1.
- **Tag** [F] · **Code** —

### 21-3.5 — Level-set (eikonal) surface regression

$$\frac{\partial \phi}{\partial t} + r\,\lvert \nabla \phi \rvert = 0$$

- **Variables** — $\phi$ signed distance function [m]; $r$ local burn rate [m/s]; $t$ [s].
- **Meaning** — the zero level set of $\phi$ is the burning surface, and it propagates normal to itself. This is the general burn-back statement that every modern grain-design code solves numerically.
- **Assumes** — $r$ may depend on position and time but not on surface curvature.
- **Fails when** — the surface meets an inert boundary (liner, inhibitor, case) — those are boundary conditions, not part of the PDE; the propellant is inhomogeneous at the scale of interest.
- **Tag** [F] · **Code** —

### 21-3.6 — Star-grain reference geometry

$$s_0 = \lvert AV\rvert = R_p\,\frac{\sin\beta}{\sin(\beta+\theta)},
\qquad
R_i = \lvert OV\rvert = R_p\,\frac{\sin\theta}{\sin(\beta+\theta)}$$

- **Variables** — $s_0$ flank length [m]; $R_i$ valley radius [m]; $R_p$ apex radius [m]; $\beta = \pi/N$ [rad]; $\theta$ flank half-angle [rad]; $N$ point count [—].
- **Meaning** — the sharp star is fully determined by $(N, R_p, \theta)$.
- **Assumes** — $\beta + \theta < \pi/2$, i.e. the propellant spokes actually point inward.
- **Fails when** — that inequality is violated; the outline then self-intersects.
- **Tag** [F] · **Code** —

### 21-3.7 — Star burning perimeter, Phase I

$$P(u) = 2N\,s_0 + 2N\left[\left(\frac{\pi}{2}-\theta\right) - \cot(\beta+\theta)\right] u$$

- **Variables** — $P$ burning perimeter [m]; $u = f + y$ total offset (fillet plus web burned) [m]; $N$, $\theta$, $\beta$, $s_0$ as 21-3.6.
- **Meaning** — **the burning perimeter of a star grain is exactly linear in burned distance**, with a slope that depends only on $N$ and $\theta$ — not on $R_p$, not on $f$, not on the case radius. This is why stars are the classical neutral-burn geometry.
- **Assumes** — prismatic grain (constant section, inhibited ends); uniform burn rate; Phase I (the flanks have not yet vanished and the tips have not reached the liner).
- **Fails when** — outside Phase I; use 21-3.10.
- **Tag** [F] · **Code** —

### 21-3.8 — Star port area, Phase I

$$A_{port}(u) = A_0 + P_0\,u + \tfrac{1}{2}\,P'\,u^2,
\qquad A_0 = N R_p R_i \sin\beta, \quad P_0 = 2Ns_0, \quad P' = dP/du$$

- **Variables** — $A_{port}$ port cross-sectional area [m²]; $A_0$ area of the sharp reference polygon [m²]; $P_0$ initial perimeter [m]; $P'$ perimeter slope [—].
- **Meaning** — exact quadratic; gives volumetric loading and port-to-throat ratio at any web position, which is what sets erosive-burning risk.
- **Assumes** — Phase I.
- **Fails when** — outside Phase I.
- **Tag** [F] · **Code** —

### 21-3.9 — Neutrality condition for a star

$$\frac{\pi}{2} - \theta = \cot\!\left(\frac{\pi}{N} + \theta\right)$$

- **Variables** — $N$ point count [—]; $\theta$ flank half-angle [rad].
- **Meaning** — a single transcendental relation for an exactly neutral star. **Neutrality is a property of the angles alone**; the radii set the web, burn time and loading, but not the shape of the trace.
- **Assumes** — Phase I throughout the burn.
- **Fails when** — the burn leaves Phase I before web-out.
- **Tag** [F] · **Code** —

### 21-3.10 — Star burning perimeter, Phase II

$$P(u) = N u \left[\pi + 2\beta - 2\arccos\!\left(\frac{R_p\sin\beta}{u}\right)\right], \qquad u \ge u_1$$

- **Variables** — $u_1$ offset at which the flat flanks vanish [m]; other symbols as above.
- **Meaning** — once the flat flanks are gone the star has forgotten it was a star; as $u \to \infty$ the bracket tends to $2\beta = 2\pi/N$ and $P \to 2\pi u$, a plain circular bore. It joins 21-3.7 continuously at $u_1$.
- **Assumes** — the arcs have not reached the liner.
- **Fails when** — the tips touch the liner; the burn then becomes a sliver problem.
- **Tag** [F] · **Code** —

### 21-3.11 — Star sizing for whole-web neutrality

$$R_o - R_p \lesssim u_1 = R_p\,\frac{\sin\beta}{\cos(\beta+\theta)}
\quad\Longrightarrow\quad
R_p \ge \frac{R_o}{1 + \sin\beta/\cos(\beta+\theta)}$$

- **Variables** — $R_o$ case (outer grain) radius [m]; $R_p$ apex radius [m]; $u_1$ [m]; $\beta$, $\theta$ [rad].
- **Meaning** — the sizing rule that keeps the star in Phase I for its whole web. It forces the star points out toward the case, which thins the web and enlarges the port — the mechanism by which neutrality costs volumetric loading and burn time.
- **Assumes** — the geometry of 21-3.6.
- **Fails when** — treated as an equality rather than an inequality; the "$\lesssim$" is a judgment call about how much Phase-II regressivity is acceptable.
- **Tag** [J] on the inequality; the equality is geometry · **Code** —

---

## Module 22 — Solid Motor Cases

### 22-3.1 — Hoop (circumferential) membrane stress

$$\sigma_\theta = \frac{pR}{t}$$

- **Variables** — $\sigma_\theta$ [Pa]; $p$ internal gauge pressure [Pa]; $R$ internal radius [m]; $t$ wall thickness [m].
- **Meaning** — the circumferential tension that keeps the cylinder from unzipping along a generator; it is the sizing stress for every motor case.
- **Assumes** — thin wall ($t/R \lesssim 0.1$); membrane behaviour (no through-thickness bending); uniform pressure; far from discontinuities.
- **Fails when** — within about $\sqrt{Rt}$ of any dome junction, joint, boss or thickness step, where bending boundary layers add local stress; for thick walls, where the Lamé solution must be used and the inner-surface stress exceeds this.
- **Tag** [F] · **Code** —
- **Alias** — 14-3.17 uses $\sigma_\theta = pD/2t$, the same relation with diameter.

### 22-3.2 — Axial membrane stress

$$\sigma_z = \frac{pR}{2t} = \frac{\sigma_\theta}{2}$$

- **Variables** — as 22-3.1; $\sigma_z$ meridional membrane stress [Pa].
- **Meaning** — the axial tension that carries the pressure load on the domes back through the cylinder; exactly half the hoop stress, which is why the critical flaw orientation is axial.
- **Assumes** — closed vessel; pressure-only loading; thin wall.
- **Fails when** — external axial load is present. A gimballed nozzle, stack compression, or a bending moment adds to or subtracts from this; in a booster at max-Q the compressive side of the bending distribution can drive $\sigma_z$ negative and turn the case into a buckling problem.
- **Tag** [F] · **Code** —

### 22-3.3 — Laplace–Young membrane shell equation

$$\frac{\sigma_1}{r_1} + \frac{\sigma_2}{r_2} = \frac{p}{t}$$

- **Variables** — $\sigma_1$ meridional and $\sigma_2$ circumferential membrane stress [Pa]; $r_1$, $r_2$ principal radii of curvature [m]; $p$ [Pa]; $t$ [m].
- **Meaning** — pressure is carried by the *curvature* of the shell, not by bending. It is the design equation for domes.
- **Assumes** — membrane state (no moments); smooth continuous shape; thickness small compared with both radii.
- **Fails when** — at the dome–cylinder junction of any dome that is not tangent-continuous *and* curvature-compatible; near the polar opening. Both need a bending analysis or local thickening.
- **Tag** [F] · **Code** —

### 22-3.4 — MEOP build-up

$$\mathrm{MEOP} = p_{c,\mathrm{nom}} \times k_{T} \times k_{\mathrm{ign}} \times k_{\mathrm{mfg}} \times k_{\mathrm{stat}}$$

- **Variables** — $p_{c,\mathrm{nom}}$ nominal equilibrium chamber pressure [Pa]; $k_T$ hot-day temperature-sensitivity factor from $\pi_K = \sigma_p/(1-n)$ ($\sigma_p = 0.002$ K⁻¹ with $n = 0.35$ gives $\pi_K \approx 0.0031$ K⁻¹, so +30 K of conditioning is about +9.7 % pressure); $k_{\mathrm{ign}}$ ignition-transient overshoot; $k_{\mathrm{mfg}}$ burn-rate and throat-area manufacturing tolerance; $k_{\mathrm{stat}}$ statistical allowance (typically a 3σ / 99.865 % upper bound). All [—].
- **Meaning** — the design pressure is a *worst credible stack*, not a mean.
- **Assumes** — the factors are independent and multiplicative.
- **Fails when** — a factor is not independent (throat erosion and burn rate are correlated through the same propellant batch); a genuinely off-nominal event — a grain crack raising burning area — is outside the stack entirely.
- **Tag** [E] [J] · **Code** `pressure_sensitivity_pi_K(sigma_p, n)` for $k_T$

### 22-3.5 — Burst and proof pressures

$$p_b = j_b\,\mathrm{MEOP}, \qquad p_{pr} = j_{pr}\,\mathrm{MEOP}$$

- **Variables** — $j_b$ burst (ultimate) factor [—]; $j_{pr}$ proof factor [—]; pressures [Pa].
- **Meaning** — the case must not rupture below $p_b$, and every flight article is taken to $p_{pr}$ as an acceptance screen.
- **Assumes** — ambient-temperature material allowables unless the case runs hot.
- **Fails when** — the case is hot at the moment of peak pressure. A thin steel case under a failed insulation panel loses strength fast and the burst factor evaporates.
- **Tag** [J] · **Code** —
- **Alias** — 18-3.2 gives the same relation in liquid-engine test language ($k_p$, $k_b$).

### 22-3.6 — Critical surface-flaw depth

$$a_c = \frac{1}{\pi}\left(\frac{K_{Ic}}{1.12\,\sigma}\right)^{2}$$

- **Variables** — $a_c$ flaw depth at instability [m]; $K_{Ic}$ plane-strain fracture toughness [Pa·m$^{1/2}$]; $\sigma$ membrane stress normal to the flaw [Pa] (use the hoop stress; the critical flaw is axial); 1.12 the free-surface correction [—]; $Q$ flaw-shape parameter [—], 1.0 for a long shallow flaw to ~2.4 for a semicircular one.
- **Meaning** — the flaw size NDE must be able to find with confidence. This is why high-strength steel cases are sized by *toughness*, not strength: raising $\sigma$ shrinks $a_c$ quadratically until it falls below inspection capability.
- **Assumes** — linear-elastic fracture mechanics; plane strain (thickness large compared with the plastic zone); a flaw normal to the maximum principal stress.
- **Fails when** — thin sections, where plane stress raises apparent toughness; residual stress from welds or forming, which must be added to $\sigma$; environmentally assisted cracking, where the governing threshold is $K_{ISCC} \ll K_{Ic}$.
- **Tag** [F] · **Code** —
- **Alias** — 16-3.8 rearranged for $a$ at $K = K_{Ic}$.

### 22-3.7 — Joint-rotation seal rate condition

$$\dot{\delta}_{\mathrm{seal}} \ge \dot{\delta}_{\mathrm{gap}}$$

- **Variables** — $\dot\delta$ rates of seal recovery and gap opening [m/s]; the gap opens on the ignition-rise timescale, order 0.3–0.6 s.
- **Meaning** — the seal is maintained only if the O-ring's own elastic recovery plus the pressure pushing it into the gap can close the gap as fast as the gap opens. **This is a rate-matched seal, not a static one** — the physics behind the Challenger clevis-joint failure.
- **Assumes** — the ring is seated with design squeeze at the moment of ignition.
- **Fails when** — elastomer stiffness rises: an O-ring's response time is strongly temperature-dependent, and a fluorocarbon elastomer below its glass-transition-influenced range responds far more slowly than the same ring at 25 °C.
- **Tag** [F] · **Code** —

### 22-3.8 — Netting analysis of a filament-wound cylinder

$$t_\alpha = \frac{pR}{2\sigma_f\cos^2\alpha},\qquad
t_{90} = \frac{pR}{\sigma_f}\left(1-\frac{\tan^{2}\alpha}{2}\right),\qquad
t_L = \frac{t_\alpha + t_{90}}{V_f}$$

- **Variables** — $t_\alpha$, $t_{90}$ fibre-only layer thicknesses for helical and hoop plies [m]; $\alpha$ helical winding angle from the motor axis [rad]; $\sigma_f$ delivered fibre allowable [Pa]; $V_f$ fibre volume fraction [—]; $t_L$ physical laminate thickness [m].
- **Meaning** — a direct force balance telling you how much fibre to put in each direction.
- **Assumes** — the resin carries nothing; fibres straight and equally stressed; membrane state; no interlaminar or bending stress; perfect fibre translation.
- **Fails when** — near bosses, skirts and any discontinuity; in compression or shear (netting says a composite has zero compressive strength — wrong but usefully conservative); whenever fibre waviness, tow-drop or cure residual stress reduces translation. Real burst pressures run below netting prediction unless $\sigma_f$ is calibrated on burst tests of the same construction.
- **Tag** [E] · **Code** —

### 22-3.9 — Geodesic winding angle from the polar opening

$$\sin\alpha = \frac{r_0}{R}$$

- **Variables** — $r_0$ polar opening (boss) radius [m]; $R$ cylinder radius [m]; $\alpha$ helical angle at the cylinder [rad].
- **Meaning** — the boss size dictates the winding angle; you do not get to choose them independently.
- **Assumes** — geodesic (frictionless) winding on a surface of revolution; constant $r_0$ at both ends.
- **Fails when** — non-geodesic winding exploits fibre friction to hold off-geodesic paths (used deliberately to open the design space); the case has different fore and aft boss diameters.
- **Tag** [F] · **Code** —

### 22-3.10 — Vessel performance index

$$\frac{pV}{W} = \frac{2}{3}\frac{\sigma}{\rho g_0}\quad\text{(sphere)}$$

- **Variables** — $\sigma$ material allowable at burst [Pa]; $\rho$ density [kg/m³]; $g_0$ [m/s²]; $pV/W$ [m].
- **Meaning** — the material-only merit of a pressure vessel; higher is a lighter case for the same pressure and volume. The units are metres — an energy per unit weight, i.e. the height the vessel could lift itself to on its own stored gas energy.
- **Assumes** — membrane cylinder or sphere; no domes, bosses, joints, skirts, insulation or minimum-gauge constraint; isotropic material at a single allowable.
- **Fails when** — real hardware carries 25–50 % parasitic mass on top; anisotropic composites require the netting-derived effective value; minimum gauge, handling or non-pressure loads set the thickness instead of $\sigma$.
- **Tag** [F] · **Code** —
- **Alias** — 12-3.6 uses the same index for pressurant bottles.

### 22-3.11 — Netting-based vessel index

$$\frac{pV}{W}\bigg|_{\mathrm{netting}} = \frac{\sigma_f V_f}{3\rho\, g_0}$$

- **Variables** — $\sigma_f$ delivered fibre allowable [Pa]; $V_f$ fibre volume fraction [—]; $\rho$ *laminate* density [kg/m³]; $g_0$ [m/s²].
- **Meaning** — the composite equivalent of 22-3.10, with the factor 3 rather than 2 paying for the 1.5× fibre penalty of a cylinder that is not a pure isotensoid sphere.
- **Assumes** — netting theory; fibre translation captured in $\sigma_f$.
- **Fails when** — everywhere netting fails (see 22-3.8).
- **Tag** [E] · **Code** —

### 22-3.12 — Motor mass fraction from the vessel index

$$\zeta = \frac{m_p}{m_p + m_{\mathrm{case}} + m_{\mathrm{other}}}
= \left[1 + \frac{p_b}{\eta_V \rho_p g_0 (PV/W)} + \frac{m_{\mathrm{other}}}{\eta_V V\rho_p}\right]^{-1}$$

- **Variables** — $\zeta$ propellant mass fraction [—]; $\eta_V$ volumetric loading fraction [—]; $\rho_p$ propellant density [kg/m³]; $m_{\mathrm{other}}$ nozzle + insulation + igniter + skirts + TVC [kg]; $V$ case internal volume [m³]; $p_b$ burst pressure [Pa].
- **Meaning** — the whole case-design argument in one line: mass fraction improves with a better vessel index, a higher propellant density, a fuller case, and a *lower* design pressure.
- **Assumes** — the case is membrane-sized.
- **Fails when** — small motors, where $m_{\mathrm{other}}$ dominates and the case material barely matters.
- **Tag** [F] · **Code** —

---

## Module 23 — Insulation and Liners

### 23-3.1 — Ablation surface energy balance

$$q_{\text{conv}}\,\phi_b + q_{\text{rad}} = \rho_i\,\dot{s}_c\,H_{\text{eff}} + q_{\text{cond,in}}$$

- **Variables** — $q_{\text{conv}}$ convective flux with no blowing [W/m²]; $\phi_b$ blowing-reduction factor [—], 0.4–0.7 typical; $q_{\text{rad}}$ radiative flux from the particle-laden gas [W/m²]; $\rho_i$ insulation density [kg/m³]; $\dot s_c$ char rate [m/s]; $H_{\text{eff}}$ effective heat of ablation [J/kg]; $q_{\text{cond,in}}$ flux conducted into the virgin substrate [W/m²].
- **Meaning** — incident heat is split between consuming material and heating what remains. Ablation works because pyrolysis gas blows into the boundary layer and cuts the convective flux.
- **Assumes** — quasi-steady ablation; 1-D through-thickness conduction; no in-depth radiation absorption.
- **Fails when** — the char is stripped mechanically rather than thermally (particle impingement, high shear), in which case recession is set by momentum, not energy, and this underpredicts badly; during the first few seconds, when the transient conduction term dominates.
- **Tag** [F] [A] · **Code** —

### 23-3.2 — Recession-rate correlation

$$\dot{s} = \dot{s}_0 + C_G\,G^{m}\,p^{k}$$

- **Variables** — $\dot s$ total surface recession rate [m/s]; $\dot s_0$ zero-crossflow (radiation- and conduction-limited) rate [m/s]; $G$ local mass flux [kg/(m²·s)]; $p$ local static pressure [Pa]; $C_G$, $m$, $k$ fitted constants for one material at one propellant flame condition, typically $m \approx 0.6$–1.0 and $k \approx 0.1$–0.3.
- **Meaning** — a floor set by radiation plus a crossflow-driven term; the practical sizing tool for insulation thickness distribution.
- **Assumes** — the fit was made on the *same* propellant, the same material lot, and a comparable geometry.
- **Fails when** — extrapolated to another propellant (particle size distribution changes impingement); to a stagnation or impingement geometry (this is a boundary-layer correlation and impingement is not); below the exposure time at which the char layer reaches quasi-steady thickness. **There is no universal correlation**; published constants are order-of-magnitude only.
- **Tag** [E] [J] · **Code** —

### 23-3.3 — Short-exposure char depth

$$\delta_c(t) \approx C\sqrt{\kappa\, t}, \qquad \kappa = \frac{k_i}{\rho_i c_{p,i}}$$

- **Variables** — $\delta_c$ char depth [m]; $\kappa$ thermal diffusivity of the virgin insulator [m²/s]; $t$ time [s]; $C$ an $O(1)$ constant set by the ratio of pyrolysis temperature to surface temperature [—].
- **Meaning** — for short exposures char depth grows as $\sqrt{t}$, not linearly. Short-exposure stations (a submerged nozzle's forward face, an aft dome exposed only late) must be sized with this, not a linear rate.
- **Assumes** — semi-infinite solid; constant properties; surface temperature stepped at $t = 0$.
- **Fails when** — the char thickness becomes large enough for blowing and char conduction to control, i.e. after roughly $\delta_c^2/\kappa$ seconds. For a filled EPDM with $\kappa \approx 1.6\times10^{-7}$ m²/s and $\delta_c = 3$ mm that is about 60 s — most of a booster burn.
- **Tag** [A] [J] · **Code** —

### 23-3.4 — Insulation thickness sizing

$$t_{\text{ins}}(x) = \mathrm{FS}\cdot\delta_c(x) + \delta_{\text{res}} + \delta_{\text{mfg}}$$

- **Variables** — $t_{\text{ins}}$ design thickness [m]; FS safety factor on predicted char depth [—], typically 1.5–2.0 for a new design, 1.25–1.5 where flight or full-scale static data exist; $\delta_{\text{res}}$ required residual *virgin* layer keeping the bondline below its temperature limit [m], typically 1–3 mm; $\delta_{\text{mfg}}$ manufacturing tolerance allowance [m].
- **Meaning** — never let the char front reach the case, and never let it reach the case *plus a thermal buffer*.
- **Assumes** — the recession prediction is unbiased, so FS covers scatter, not error.
- **Fails when** — the model is extrapolated: the FS then covers nothing, because the mean is wrong. **A factor of 1.5 on a prediction that is 2× low is not conservative.** This is the single most common way insulation sizing goes wrong.
- **Tag** [J] · **Code** —

### 23-3.5 — Bore hoop strain from case–grain CTE mismatch

$$\varepsilon_\theta(a) = \frac{\Delta T\big[\,2\alpha_c b^2 - (3\alpha_p - \alpha_c)(b^2-a^2)\,\big]}{2a^2}$$

- **Variables** — $\varepsilon_\theta(a)$ hoop strain at the bore [—]; $\Delta T = T - T_{sf}$ [K], negative on cooldown from the stress-free (cure) temperature; $\alpha_p$, $\alpha_c$ linear CTE of propellant and case [1/K]; $a$, $b$ bore and outer grain radii [m].
- **Meaning** — a CTE mismatch of order $10^{-3}$ over a 100 K cooldown is amplified at the bore by roughly $3(b^2-a^2)/(2a^2)$ — a factor of 10–25 for a thick-web grain. This is why case-bonded grains crack in cold storage.
- **Assumes** — perfectly rigid case; perfectly incompressible propellant ($\nu = 0.5$); plane strain with axial strain following the case; uniform temperature; linear elastic behaviour; no liner or insulation compliance.
- **Fails when** — any of those is relaxed: a composite case is not rigid (which helps); $\nu = 0.4995$ not 0.5 (relieving a few percent); the temperature is not uniform during a transient; propellant is viscoelastic, so a slow cooldown relaxes stress a fast one does not. **A screening number that tells you whether you have a problem, never a qualification analysis** — real work is nonlinear viscoelastic FE with a time–temperature-shifted relaxation modulus.
- **Tag** [A] · **Code** —

### 23-3.6 — Pressure amplification of a burning-area defect

$$\frac{p_2}{p_1} = \left(\frac{A_{b,2}}{A_{b,1}}\right)^{\!1/(1-n)}$$

- **Variables** — $p$ equilibrium chamber pressure [Pa]; $A_b$ burning area [m²]; $n$ Vieille exponent [—].
- **Meaning** — the pressure amplifies the area error by $1/(1-n)$, typically 1.4–1.8 and up to 3+ for a high-exponent double-base propellant. This is why an unbond or crack that exposes extra surface is a burst risk, not a performance nuisance.
- **Assumes** — quasi-steady operation ($A_b$ changing slowly compared with the filling time $\approx V_c/(c^*A_t)$); the nozzle stays choked; same $c^*$.
- **Fails when** — the area change is sudden — a crack opening at ignition is *not* quasi-steady and the transient overshoot exceeds the equilibrium value; $n \ge 1$, where no equilibrium exists at all.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)` evaluated at both areas
- **Alias** — 20-3.14, 21-3.4 in ratio form.

---

## Module 24 — Solid Rocket Nozzles

### 24-3.1 — Motor mass fraction

$$\lambda_m = \frac{m_p}{m_p + m_{inert}}$$

- **Variables** — $m_p$ propellant mass [kg]; $m_{inert}$ everything else [kg]; $\lambda_m$ [—].
- **Meaning** — the fraction of stage mass that is useful; the nozzle is often 10–20 % of $m_{inert}$, which is why solid nozzle mass matters so much.
- **Assumes** — single-stage accounting with no residuals.
- **Fails when** — comparing stages of very different $I_{sp}$; use $\Delta v$ then.
- **Tag** [F] [J] · **Code** —
- **Alias** — 22-3.12 writes it $\zeta$.

### 24-3.2 — Adiabatic wall temperature

$$T_{aw} = T_c\,\frac{1 + r\,\frac{\gamma-1}{2}M^2}{1 + \frac{\gamma-1}{2}M^2},
\qquad r \approx \mathrm{Pr}^{1/3} \approx 0.9$$

- **Variables** — $T_c$ chamber (flame) temperature [K]; $M$ local Mach number [—]; $r$ recovery factor [—]; $\gamma$ [—].
- **Meaning** — the temperature an insulated wall reaches in a high-speed boundary layer; the driving potential for nozzle heating.
- **Assumes** — calorically perfect gas; turbulent boundary layer.
- **Fails when** — the boundary layer is strongly two-phase: particle impacts deposit energy this expression does not contain, and the effective $\gamma$ and Pr of the mixture are not those of the gas.
- **Tag** [F] [A] · **Code** `adiabatic_wall_T(T0, gamma, Mach, r=0.9)`
- **Alias** — 10-3.2, identical.

### 24-3.3 — Bartz correlation (solid-motor form)

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\right)_0
\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{r_c}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

- **Variables** — $D_t$ throat diameter [m]; $r_c$ throat longitudinal radius of curvature [m]; $\sigma$ property-variation factor [—]; subscript 0 = chamber stagnation; $p_c$ [Pa]; $c^*$ [m/s].
- **Meaning** — turbulent pipe-flow correlation adapted to a nozzle; the same equation as 10-3.4 with $r_c$ written for the curvature radius.
- **Assumes** — single-phase gas; attached turbulent boundary layer; no particles.
- **Fails when** — accuracy is ±20–30 % at the throat and worse elsewhere; **in a metallized solid it is worse still**, because the particle-laden boundary layer is not the gas it assumes.
- **Tag** [E] · **Code** `bartz_hg(Dt, mu0, cp0, Pr0, p0, c_star_val, rc, A_ratio, sigma)`
- **Alias** — 10-3.4; Module 10 calls the curvature radius $R_u$, Module 24 calls it $r_c$ (the `rocket.py` name).

### 24-3.4 — Radiation from the particle cloud

$$q_{rad} = \epsilon_r\,\sigma_{SB}\left(T_g^4 - T_w^4\right)$$

- **Variables** — $\epsilon_r$ effective cloud emissivity [—]; $\sigma_{SB} = 5.670\times10^{-8}$ W/(m²·K⁴); $T_g$ radiating gas/particle temperature [K]; $T_w$ wall temperature [K].
- **Meaning** — net radiant exchange between an optically thick alumina cloud and the wall. In a metallized motor radiation is 10–30 % of chamber heat load, far more than in a liquid engine.
- **Assumes** — grey, optically thick, uniform-temperature cloud; grey wall.
- **Fails when** — in the exit cone, where the cloud thins and cools and optical thickness drops below unity; at low aluminium loading. $\epsilon_r$ is commonly taken as 0.3–0.9 and **is the weakest number in the analysis**.
- **Tag** [A] · **Code** —
- **Alias** — 10-3.11, 11-3.3.

### 24-3.5 — Particle Stokes number

$$\mathrm{Stk} = \frac{\tau_v\,u}{L_c},\qquad
\tau_v = \frac{\rho_{Al_2O_3}\,d_p^2}{18\,\mu}$$

- **Variables** — Stk [—]; $\tau_v$ particle velocity relaxation time [s]; $u$ local gas speed [m/s]; $L_c$ characteristic turning length [m]; $\rho_{Al_2O_3} \approx 3000$ kg/m³ for molten alumina; $d_p$ particle diameter [m]; $\mu$ gas viscosity [Pa·s].
- **Meaning** — ratio of particle response time to flow time. $\mathrm{Stk} \ll 1$: particles follow the gas. $\mathrm{Stk} \gtrsim 1$: they fly straight and hit the wall — the mechanism behind submerged-nozzle nose erosion and slag accumulation.
- **Assumes** — Stokes drag, which requires particle Reynolds number $\lesssim 1$.
- **Fails when** — at nozzle conditions $\mathrm{Re}_p$ is 5–30, so $\tau_v$ must be corrected; for agglomerates and for particles that shatter on impact.
- **Tag** [F] [A] · **Code** —

### 24-3.6 — Transient conduction into a semi-infinite liner

$$\frac{T(x,t)-T_i}{T_s-T_i} = \mathrm{erfc}\!\left(\frac{x}{2\sqrt{\alpha t}}\right)$$

- **Variables** — $T_i$ initial temperature [K]; $T_s$ imposed surface temperature [K]; $x$ depth [m]; $\alpha = k/(\rho c)$ thermal diffusivity [m²/s]; $t$ [s].
- **Meaning** — how deep the heat has got; the right *sizing* tool for liner thickness.
- **Assumes** — constant properties; a step change in surface temperature; no ablation; no internal decomposition; semi-infinite body.
- **Fails when** — the thermal penetration depth approaches the liner thickness (use a finite-slab or numerical solution); quantitatively in a charring ablator, where pyrolysis-gas blowing and the moving surface both matter.
- **Tag** [A] · **Code** —
- **Alias** — 10-3.9 is the constant-flux counterpart; 23-3.3 the char-depth version.

### 24-3.7 — Carbon-throat gasification reactions

$$\mathrm{C(s)} + \mathrm{OH} \rightarrow \mathrm{CO} + \mathrm{H}$$

- **Variables** — reaction with H₂O, CO₂ and OH as the attacking species; $\chi_{ox}$ their combined mole fraction [—].
- **Meaning** — the throat is not "melting" or "burning" in the O₂ sense; it is being **gasified by steam and carbon dioxide**. Both principal reactions are strongly endothermic, which is a partial self-limitation — the reaction cools the surface it attacks.
- **Assumes** — carbon is the surface material; the local gas has the chamber-equilibrium composition.
- **Fails when** — the surface is silica or a metal; at the low-temperature limit where kinetics rather than transport control the rate.
- **Tag** [F] · **Code** —

### 24-3.8 — Throat erosion rate scaling

$$\dot s \propto p_c^{0.8}\,D_t^{-0.2}\,\chi_{ox}$$

- **Variables** — $\dot s$ radial recession rate [m/s]; $p_c$ [Pa]; $D_t$ throat diameter [m]; $\chi_{ox}$ combined mole fraction of oxidising species (H₂O + CO₂ + OH) [—].
- **Meaning** — erosion is a transport-limited surface reaction, so it inherits Bartz's pressure scaling. This is why fuel-rich formulations and lower $p_c$ both reduce erosion.
- **Assumes** — diffusion control (surface above ~2500 K); a carbon surface; no particle contribution.
- **Fails when** — at low pressure and low temperature (kinetics-controlled, much weaker pressure dependence); in the entrance region of a submerged nozzle where impingement dominates. Reported exponents run 0.6–0.9; 0.8 is the standard engineering value.
- **Tag** [E] [J] · **Code** —

### 24-3.9 — Equilibrium chamber pressure

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}},\qquad K_n = \frac{A_b}{A_t}$$

- **Variables** — as 19-3.3.
- **Meaning** — repeated here because throat erosion enters ballistics only through $A_t$ in $K_n$.
- **Assumes** — quasi-steady operation; $n < 1$; uniform $p_c$; no erosive burning.
- **Fails when** — during ignition and tail-off transients; $n \to 1$.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)`

### 24-3.10 — Master rate equation for $p_c$

$$\frac{1}{p_c}\frac{dp_c}{dt} = \frac{1}{1-n}\left[\frac{1}{A_b}\frac{dA_b}{dt} - \frac{1}{A_t}\frac{dA_t}{dt}\right]$$

- **Variables** — fractional rates [1/s]; $n$ [—].
- **Meaning** — fractional chamber-pressure rate is the difference of the fractional burning-area rate and the fractional throat-area rate, amplified by $1/(1-n)$. For APCP at $n = 0.35$ the factor is 1.54; at $n = 0.6$ it is 2.5. **This is why the pressure exponent is a nozzle designer's problem, not only a chemist's.**
- **Assumes** — 24-3.9's assumptions.
- **Fails when** — 24-3.9 fails.
- **Tag** [F] · **Code** —
- **Alias** — the differential form of 20-3.14.

### 24-3.11 — Pressure decay with a constant-rate eroding throat

$$\frac{p_c(t)}{p_c(0)} = \left(1 + \frac{\dot s\,t}{r_{t0}}\right)^{-\frac{2}{1-n}}$$

- **Variables** — $\dot s$ recession rate [m/s]; $r_{t0}$ initial throat radius [m]; $n$ [—]; $t$ [s].
- **Meaning** — closed-form pressure decay of a neutral-grain motor with a constant-rate eroding throat; explains the characteristic regressive tail of a long-burning solid.
- **Assumes** — neutral grain; constant $\dot s$; circular throat; quasi-steady $p_c$; constant $c^*$.
- **Fails when** — erosion is pressure-dependent (24-3.8); the grain is not neutral (superpose the $A_b$ term of 24-3.10); the insert is breached.
- **Tag** [F] [A] · **Code** —

### 24-3.12 — Thrust with an eroding throat

$$\frac{F(t)}{F(0)} = \left(1+\frac{\dot s t}{r_{t0}}\right)^{2}\left(1+\frac{\dot s t}{r_{t0}}\right)^{-\frac{2}{1-n}}
= \left(1+\frac{\dot s t}{r_{t0}}\right)^{-\frac{2n}{1-n}}$$

- **Variables** — as 24-3.11.
- **Meaning** — the throat grows (raising thrust for a given pressure) while pressure falls, and the two partly cancel. The surviving exponent is $-2n/(1-n)$, which vanishes as $n \to 0$: **a zero-exponent propellant would hold thrust perfectly constant under throat erosion.** One more reason low-$n$ propellants are prized, quite apart from stability.
- **Assumes** — constant $C_F$; it ignores the small $C_F$ loss from falling $\varepsilon = A_e/A_t$.
- **Fails when** — the $C_F$ change is not negligible (high-$\varepsilon$ upper-stage motors); erosion is not constant-rate.
- **Tag** [F] [A] · **Code** —

### 24-3.13 — Volumetric loading efficiency

$$\eta_V = \frac{V_p}{V_{env}}$$

- **Variables** — $V_p$ propellant volume [m³]; $V_{env}$ cylindrical envelope volume the stage may occupy [m³]; $\eta_V$ [—].
- **Meaning** — how much of the space you were given contains propellant; the metric that justifies a submerged nozzle.
- **Assumes** — a defined envelope.
- **Fails when** — the envelope is not the binding constraint (a strap-on limited by attach-point loads, for instance).
- **Tag** [F] [J] · **Code** —

### 24-3.14 — Conical divergence loss

$$\lambda_d = \frac{1+\cos\alpha}{2}$$

- **Variables** — $\alpha$ cone half-angle [rad]; $\lambda_d$ [—].
- **Meaning** — the fraction of momentum flux that is axial. For $\alpha = 15°$, $\lambda_d = 0.983$ — the classic 1.7 % loss.
- **Assumes** — conical nozzle with uniform-magnitude exit velocity on a spherical cap; no boundary layer; no particles.
- **Fails when** — contoured (bell) nozzles, for which $\lambda_d$ must be computed from the actual exit-plane flow-angle distribution; it fails to capture two-phase effects entirely, and in a metallized motor the particle lag loss is larger than the divergence loss.
- **Tag** [F] [A] · **Code** —
- **Alias** — 09-3.6, identical.

### 24-3.15 — Extendable exit cone payoff

$$\Delta I_{sp} = \frac{c^*}{g_0}\left[C_F(\varepsilon_2) - C_F(\varepsilon_1)\right]$$

- **Variables** — $c^*$ [m/s]; $C_F$ vacuum thrust coefficient at each area ratio [—]; $g_0 = 9.80665$ m/s²; $\Delta I_{sp}$ [s].
- **Meaning** — the specific-impulse payoff of deploying an extension; typically 10–20 s for a doubling of $\varepsilon$ on an upper-stage motor.
- **Assumes** — vacuum operation; ideal 1-D expansion; the same $c^*$; and that the deployed cone achieves its ideal $C_F$, which for two-phase flow it does not.
- **Fails when** — the extension is deployed at non-negligible ambient pressure.
- **Tag** [F] [A] · **Code** `Cf(gamma, eps, p0, 0.0)` at each $\varepsilon$

### 24-3.16 — Gimbal side force and axial loss

$$F_s = F\sin\delta \approx F\delta, \qquad
\Delta F_{axial} = -F(1-\cos\delta) \approx -\tfrac{1}{2}F\delta^2$$

- **Variables** — $F$ axial thrust [N]; $\delta$ deflection [rad]; $F_s$ side force [N].
- **Meaning** — gimballing trades a *second-order* axial loss for a *first-order* side force. At $\delta = 8°$ the axial loss is 1.0 %; at 3° it is 0.14 %. **Gimballing is cheap in $I_{sp}$**, which is why it wins whenever the mechanism can be built.
- **Assumes** — the whole exhaust momentum vector rotates rigidly with the nozzle; the flow stays attached.
- **Fails when** — at large $\delta$, where the internal flow field is genuinely asymmetric.
- **Tag** [F] [A] · **Code** —

### 24-3.17 — Flexseal actuator torque

$$M_{act} = k_s\,\delta + c\,\dot\delta + M_{offset}(p_c)$$

- **Variables** — $M_{act}$ actuator torque [N·m]; $k_s$ bearing spring rate [N·m/rad]; $c$ damping [N·m·s/rad]; $\delta$ [rad]; $\dot\delta$ [rad/s]; $M_{offset}$ pressure-dependent offset torque, arising because the bearing's centre of rotation and the pressure-load centroid do not coincide [N·m].
- **Meaning** — the actuator fights a spring, a damper, and a pressure bias; sizing it requires all three.
- **Assumes** — small deflections; a linear elastomer.
- **Fails when** — at low temperature, where elastomer stiffness rises sharply (the same temperature-dependent-elastomer physics that destroyed *Challenger*, in a different component); at high rates where the elastomer is viscoelastic.
- **Tag** [F] [E] · **Code** —

### 24-3.18 — Liquid injection TVC amplification

$$F_s = K_A\,\dot m_i\,u_i, \qquad K_A \approx 1.5-3$$

- **Variables** — $K_A$ amplification factor [—]; $\dot m_i$ injectant mass flow [kg/s]; $u_i$ injectant velocity [m/s]; $F_s$ side force [N].
- **Meaning** — the shock-induced wall pressure field does most of the work, not the injectant's own momentum — hence $K_A > 1$.
- **Assumes** — injection into supersonic flow at an area ratio where the shock stays inside the nozzle.
- **Fails when** — the injection port is too far aft (the shock exits the nozzle and amplification collapses) or too far forward (interaction with the throat). $K_A$ is determined by test; published values vary widely with injectant and geometry.
- **Tag** [E] · **Code** —

---

## Module 25 — Solid Rocket Manufacturing

### 25-3.1 — Batches per motor

$$N_b = \left\lceil \frac{M_p}{m_b} \right\rceil$$

- **Variables** — $N_b$ batches per motor [—]; $M_p$ propellant mass per motor [kg]; $m_b$ mixer working batch mass [kg].
- **Meaning** — the number of independent mixes that must be blended into one grain; each is a separate source of ballistic variation.
- **Assumes** — each batch is fully discharged; no batch shared between motors.
- **Fails when** — the plant deliberately splits a batch across articles (tactical rate production does exactly this, and the lot structure is then inverted — one mix, many motors).
- **Tag** [F] [J] · **Code** —

### 25-3.2 — Mixers required by pot life

$$N_{\rm mixers} \ge \left\lceil \frac{N_b}{\left\lfloor t_{\rm pot}/t_{\rm mix} \right\rfloor} \right\rceil$$

- **Variables** — $N_{\rm mixers}$ mixers running in parallel [—]; $N_b$ [—]; $t_{\rm pot}$ propellant working life [s]; $t_{\rm mix}$ mix cycle time per batch per mixer [s].
- **Meaning** — the cast window is bounded by the working life of the *first* batch, so the plant must produce all $N_b$ batches within $t_{\rm pot}$. This is why a large-motor plant is a batch of mixers, not one big one.
- **Assumes** — identical mixers, staggered starts, and a casting fixture that can accept batches as fast as they arrive.
- **Fails when** — the cast rate rather than the mix rate is limiting (very large motors); the working life is temperature-dependent enough that a hot day changes $N_{\rm mixers}$.
- **Tag** [F] [J] · **Code** —

### 25-3.3 — Cure shrinkage plus thermal strain

$$\varepsilon_f = \alpha\,\Delta T + \tfrac{1}{3}\,\varepsilon_{\rm chem,vol}$$

- **Variables** — $\varepsilon_f$ imposed isotropic free (stress-free) linear strain [—]; $\alpha$ propellant linear CTE [1/K]; $\Delta T = T_{sf} - T_{\rm use}$ [K]; $\varepsilon_{\rm chem,vol}$ volumetric cure shrinkage [—]; with $\varepsilon_\theta$ bore hoop strain [—], $b$ grain outer radius [m], $a_i$ bore radius [m].
- **Meaning** — all the shrinkage a case-bonded grain wants to do shows up as strain at the bore, amplified by roughly the square of the web-to-bore ratio. Cure shrinkage adds directly to thermal shrinkage and is often the larger term.
- **Assumes** — rigid case; incompressible propellant; long cylinder (plane strain, no end effects); linear elasticity; uniform temperature.
- **Fails when** — at the grain ends and at any slot or fin (finite elements and a stress-concentration factor needed); for a compliant composite case (which relieves some strain); over long hold times where viscoelastic stress relaxes but strain does not; for thin-web grains where $b/a_i \to 1$ and the formula correctly but uselessly returns almost zero.
- **Tag** [A] · **Code** —
- **Alias** — 23-3.5, 27-3.2 are the same physics with different groupings.

### 25-3.4 — Radiographic contrast

$$\frac{\Delta I}{I} \simeq \mu\,\Delta x \qquad (\mu\,\Delta x \ll 1)$$

- **Variables** — $I$, $I_0$ transmitted and incident intensity [W/m² or counts]; $\mu$ linear attenuation coefficient [1/m]; $\mu/\rho$ mass attenuation coefficient [m²/kg]; $\rho$ [kg/m³]; $x$ path length through material [m]; $\Delta x$ path length of material replaced by void [m].
- **Meaning** — radiographic contrast is proportional to the *missing material along the beam*, not to the flaw's volume. A planar unbond parallel to the beam is invisible; the same unbond edge-on is obvious. This is why radiography and ultrasonics are complementary.
- **Assumes** — a narrow monoenergetic beam; no scatter; a linear detector response.
- **Fails when** — thick sections, where Compton scatter build-up fills in the shadow and reduces real contrast well below $\mu\Delta x$; polyenergetic sources, where beam hardening changes $\mu$ along the path.
- **Tag** [F] [A] · **Code** —

### 25-3.5 — Arrhenius aging acceleration

$$\frac{t_2}{t_1} = \exp\!\left[\frac{E_a}{R_u}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)\right]$$

- **Variables** — $t_1, t_2$ times to reach the same extent of degradation at $T_1, T_2$ [s]; $E_a$ apparent activation energy [J/mol]; $R_u = 8.31446$ J/(mol·K) — note the **per-mole** value here; $T$ [K].
- **Meaning** — the acceleration factor between an oven-aged coupon and a stored motor; the whole basis of accelerated-aging surveillance.
- **Assumes** — a *single* rate-limiting mechanism with Arrhenius temperature dependence, and no change of mechanism over the range.
- **Fails when** — aging is controlled by more than one mechanism with different $E_a$, which for a composite propellant is essentially always. Raising the temperature reweights the mechanisms, **so the oven ages the coupon by a route the magazine never takes.** This is the main event, not a footnote.
- **Tag** [E] [A] · **Code** —
- **Alias** — 27-3.3, identical with $R_u$ in J/(kmol·K) and $E_a$ in J/kmol. ⚠ Check which molar basis a quoted $E_a$ uses.

### 25-3.6 — Production line rate

$$\dot N = \eta_a \cdot \min_s \left(\frac{N_s}{t_s}\right)$$

- **Variables** — $\dot N$ motors per unit time [1/s or 1/month]; $\eta_a$ line availability [—]; $N_s$ parallel units at station $s$ [—]; $t_s$ occupancy of one unit at station $s$ per motor [s].
- **Meaning** — a serial line runs at the rate of its tightest station; adding capacity anywhere else changes nothing. This is why solid-motor lead times are 12–36 months and cannot be shortened by money alone.
- **Assumes** — stations independent; buffers between them; one motor occupies one unit.
- **Fails when** — stations are *coupled*: the mix–cast pair is coupled by pot life (25-3.2), so mixers and the casting pit cannot be sized independently; and when the product mix is not uniform.
- **Tag** [F] [J] · **Code** —

### 25-3.7 — Equilibrium pressure (production context)

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}}, \qquad K_n = \frac{A_b}{A_t}$$

- **Variables** — as 19-3.3.
- **Meaning** — restated because $a$, $\rho_p$ and $c^*$ are all *manufactured* quantities with lot-to-lot scatter.
- **Assumes** — quasi-steady operation; uniform pressure; no erosive burning; $n < 1$; constant $c^*$ and $\rho_p$.
- **Fails when** — during ignition and tail-off; with significant throat erosion (which lowers $K_n$ through $A_t$ during the burn); $n \to 1$.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)`

### 25-3.8 — Manufacturing variation amplification

$$\frac{\delta p_c}{p_c} = \frac{1}{1-n}\left(\frac{\delta a}{a} + \frac{\delta \rho_p}{\rho_p} + \frac{\delta c^*}{c^*} + \frac{\delta K_n}{K_n}\right)$$

- **Variables** — small fractional perturbations [—]; $n$ [—].
- **Meaning** — **every manufacturing variation is amplified by $1/(1-n)$ when it reaches chamber pressure.** For $n = 0.35$ that factor is 1.54; at $n = 0.6$ it is 2.5. This is the quantitative case for process control.
- **Assumes** — small, independent perturbations.
- **Fails when** — excursions are large (this is a linearisation of a power law); variations are correlated — a mix off in $a$ is often off in $\rho_p$ too, and the errors then do not combine in quadrature.
- **Tag** [F] · **Code** `rss(*terms)` for the independent case
- **Alias** — 20-3.14, 21-3.4.

### 25-3.9 — Soak-temperature effect on burn rate and pressure

$$\frac{r(T_i)}{r(T_{i,\rm ref})} = \exp\!\left[\sigma_p\,(T_i - T_{i,\rm ref})\right],
\qquad \pi_K = \frac{\sigma_p}{1-n}$$

- **Variables** — $T_i$ initial bulk propellant temperature [K]; $\sigma_p$ [1/K]; $\pi_K$ [1/K]; $n$ [—].
- **Meaning** — the propellant's bulk temperature before ignition shifts the whole burn-rate curve, and the shift is amplified into pressure.
- **Assumes** — $\sigma_p$ constant over the range; the grain thermally soaked to uniform $T_i$.
- **Fails when** — the grain has a thermal gradient (a motor pulled from cold storage onto a hot pad is not at one temperature); outside the calibrated range.
- **Tag** [E] [J] · **Code** `temperature_sensitivity_pressure(sigma_p, dT)`, `pressure_sensitivity_pi_K(sigma_p, n)`
- **Alias** — 20-3.9, 20-3.10, 27-3.5, 27-3.6.

---

## Module 26 — Historical Large Solid Motors

### 26-3.1 — Tsiolkovsky rocket equation (stage form)

$$\Delta v = I_{sp}\,g_0 \ln\!\frac{m_p+m_i+m_u}{m_i+m_u}$$

- **Variables** — $I_{sp}$ [s]; $g_0 = 9.80665$ m/s²; $m_p$ propellant mass [kg]; $m_i$ motor inert mass [kg]; $m_u$ everything above the stage [kg].
- **Meaning** — the ideal velocity increment from burning $m_p$; the only fair basis for comparing motor architectures.
- **Assumes** — constant $I_{sp}$; no gravity or drag losses; all of $m_i$ carried to burnout.
- **Fails when** — the stage is a strap-on jettisoned before burnout; $I_{sp}$ varies strongly through the trajectory — for a first-stage solid it runs from SL to near-vacuum values, so use a flight average and label it an approximation.
- **Tag** [F], [A] with a flight-average $I_{sp}$ · **Code** `tsiolkovsky_dv(isp, m0, mf)`
- **Alias** — 05-3.1 solved for $m_p$ instead.

### 26-3.2 — $\Delta v$ in terms of mass fraction

$$\Delta v = I_{sp}\,g_0 \ln\!\frac{m_p/\zeta + m_u}{m_p(1/\zeta - 1) + m_u}$$

- **Variables** — as 26-3.1 plus $\zeta = m_p/(m_p+m_i)$ propellant mass fraction [—].
- **Meaning** — $\Delta v$ in terms of the two numbers a case designer actually controls: $m_p$ and $\zeta$. Segmentation costs perhaps 1–2 points of $\zeta$; this converts that into velocity.
- **Assumes** — everything in 26-3.1.
- **Fails when** — $m_i$ contains items that are not case — TVC injectant tanks, recovery parachutes, separation motors — which is exactly the PSLV S139 and Shuttle RSRM situation. **$\zeta$ is a *stage* property, not a case property.**
- **Tag** [F] · **Code** `tsiolkovsky_dv(isp, m0, mf)`

### 26-3.3 — Total impulse

$$I_t = m_p I_{sp} g_0$$

- **Variables** — $I_t$ total impulse [N·s]; $m_p$ propellant mass [kg]; $I_{sp}$ [s]; $g_0$ [m/s²].
- **Meaning** — specific impulse *is* impulse per unit weight of propellant, so this is a definition, not a model. It is the standard way to reconstruct an average thrust from published motor data ($\bar F = I_t/t_b$).
- **Assumes** — all propellant is consumed; $I_{sp}$ is the delivered, mission-average value on the stated pressure basis.
- **Fails when** — there is significant slag or unburned sliver residual; the quoted $I_{sp}$ is theoretical rather than delivered.
- **Tag** [F] · **Code** —

---

## Module 27 — Modern Defense Propulsion Engineering

### 27-3.1 — Equilibrium chamber pressure

$$p_c = \left( a\,\rho_p\, c^*\, K_n \right)^{\frac{1}{1-n}} , \qquad K_n = \frac{A_b}{A_t}$$

- **Variables** — as 19-3.3.
- **Meaning** — mass generated at the burning surface equals mass discharged through the choked throat. Tactical and strategic motors obey exactly the same equation as boosters; requirements, not physics, separate them.
- **Assumes** — quasi-steady operation (chamber filling time $\ll$ burn time); spatially uniform $p_c$; no erosive burning; $c^*$ independent of pressure; $n < 1$.
- **Fails when** — in the ignition transient or tail-off; the port Mach number drives erosive burning; $n \to 1$, at which point the equilibrium is unstable.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)`

### 27-3.2 — Bore strain from CTE mismatch (scaling form)

$$\varepsilon_{\theta,\text{bore}} \approx (\alpha_p - \alpha_c)\,\Delta T \cdot f\!\left(\frac{b}{a}, \nu_p\right)$$

- **Variables** — $\alpha_p$, $\alpha_c$ propellant and case CTE [1/K]; $\Delta T$ excursion from the stress-free (cure) temperature [K]; $b/a$ outer/inner radius ratio [—]; $\nu_p$ propellant Poisson ratio [—], ≈ 0.4995 (nearly incompressible); $f$ geometry factor of order 1–3 that grows as the web thickens and the bore shrinks.
- **Meaning** — cooling a case-bonded grain puts the bore in tension because the propellant wants to shrink and the case will not let it. The determinant of the low-temperature end of the storage envelope.
- **Assumes** — linear elasticity; plane strain; perfect bond; no stress relaxation.
- **Fails when** — viscoelastic relaxation is significant (i.e. always, for slow cooldowns); near $T_g$, where the modulus changes by orders of magnitude; at any geometric discontinuity — slots, fins, star points — where finite elements are needed. **Use for scaling arguments only.**
- **Tag** [A] · **Code** —
- **Alias** — 23-3.5, 25-3.3.

### 27-3.3 — Accelerated aging transfer

$$t_{\text{field}} = t_{\text{oven}}\,\exp\!\left[\frac{E_a}{R_u}\left(\frac{1}{T_{\text{field}}}-\frac{1}{T_{\text{oven}}}\right)\right]$$

- **Variables** — $t$ [s]; $E_a$ apparent activation energy of the property change being tracked [J/kmol]; $R_u = 8314.46$ J/(kmol·K); $T$ [K].
- **Meaning** — one dominant thermally activated process controls the property, so time and temperature trade logarithmically.
- **Assumes** — a single mechanism with temperature-independent $E_a$; no change of mechanism over the interval; no diffusion limitation.
- **Fails when** — the oven temperature crosses a phase or glass transition; migration (a diffusion process with different temperature dependence) rather than crosslinking controls; the acceleration factor is large enough that a slow field mechanism never expresses itself in the oven. **Treat a large extrapolation factor as a hypothesis to be checked against real-time data, never as a substitute for it.**
- **Tag** [E] [A] [J] · **Code** —
- **Alias** — 25-3.5. ⚠ Note the molar basis: J/kmol with $R_u = 8314.46$ here, J/mol with $R_u = 8.31446$ in Module 25.

### 27-3.4 — Chamber fill time

$$t_{\text{fill}} \sim \frac{V_c}{ c^*\!A_t } \ln\!\frac{p_{c}}{p_{0}}$$

- **Variables** — $V_c$ free chamber volume at ignition [m³]; $A_t$ [m²]; $c^*$ [m/s]; $p_0$ ambient [Pa]; $p_c$ target [Pa].
- **Meaning** — the chamber is a plenum filled by the burning surface and drained by a choked throat; the time constant is the ratio of volume to the throat's volumetric discharge capability. It sets the minimum achievable ignition-to-full-thrust time, which for a tactical missile is a top-level requirement.
- **Assumes** — the whole grain surface ignites promptly; constant $c^*$; no heat loss; ideal gas.
- **Fails when** — flame spreading over the grain is slow compared with filling (long thin ports, low-flux igniters, cold grain) — precisely the tactical cold-start case.
- **Tag** [A] · **Code** —
- **Alias** — the same group $V_c/(c^*A_t) = L^*/c^*$ appears as $\tau_{fill}$ in 20-3.8 and $\tau_c$ in 15-3.4.

### 27-3.5 — Burn rate with soak temperature

$$r(T_i,p_c) = a_0\,e^{\sigma_p (T_i-T_{\text{ref}})}\;p_c^{\,n}$$

- **Variables** — $\sigma_p$ [1/K]; $T_i$ bulk propellant soak temperature [K]; $T_{\text{ref}}$ the reference temperature at which $a_0$ was measured [K]; $a_0$ [m·s⁻¹·Pa⁻ⁿ]; $n$ [—].
- **Meaning** — a hotter grain starts closer to its surface reaction temperature, so less of the flame's heat feedback is spent warming the solid and the surface regresses faster.
- **Assumes** — $\sigma_p$ constant over the range (it is not exactly — it usually grows slightly at cold); uniform bulk temperature; no change of combustion mechanism.
- **Fails when** — the grain is not thermally soaked (a large motor takes days to equilibrate; a partial soak gives a *radially varying* burn rate); below $T_g$, where the propellant's physical state has changed.
- **Tag** [E] · **Code** `vieille_burn_rate(a, p, n)` with $a = a_0 e^{\sigma_p\Delta T}$

### 27-3.6 — Hot-day / cold-day pressure ratio

$$\pi_K \equiv \left(\frac{\partial \ln p_c}{\partial T_i}\right)_{K_n} = \frac{\sigma_p}{1-n}, \qquad \frac{p_{c,2}}{p_{c,1}} = \exp\!\left[\frac{\sigma_p\,\Delta T}{1-n}\right]$$

- **Variables** — $\pi_K$ [1/K]; $\sigma_p$ [1/K]; $n$ [—]; $\Delta T$ [K].
- **Meaning** — the burn-rate shift feeds back through the pressure–burn-rate coupling and is *amplified* by $1/(1-n)$. Over the military −54 °C to +71 °C envelope this is a factor of 1.5–2 in chamber pressure, and it sizes the case.
- **Assumes** — 27-3.1's assumptions plus constant $A_t$ (no significant throat erosion) and constant $c^*$.
- **Fails when** — $n$ is large (the amplification becomes violent); the nozzle erodes appreciably during the burn, lowering effective $K_n$ and partially offsetting the hot-day rise.
- **Tag** [F] given [E] inputs · **Code** `pressure_sensitivity_pi_K(sigma_p, n)`, `temperature_sensitivity_pressure(sigma_p, dT)`

### 27-3.7 — Zero-failure reliability demonstration

$$R_{\text{LB}} = (1-C)^{1/N}, \qquad N = \frac{\ln(1-C)}{\ln R_{\text{LB}}}$$

- **Variables** — $N$ number of independent successful trials [—]; $C$ confidence level [—]; $R_{\text{LB}}$ demonstrated lower bound on reliability [—].
- **Meaning** — with zero failures the binomial likelihood is $R^N$, and the $C$-level bound is the $R$ that would have produced this run with probability $1-C$. Demonstrating $R = 0.999$ at 90 % confidence needs 2302 successes — which is why nobody demonstrates it that way.
- **Assumes** — independent, identically distributed trials from the population you are making claims about; no failures at all; the tested article representative of the fielded one.
- **Fails when** — motors are *not* iid, the usual reality: a lot shares a propellant mix, a liner batch and an operator. A correlated failure mechanism inside one lot makes $N$ an overstatement of the true information content.
- **Tag** [F] statistics, [J] on the independence caveat · **Code** —

### 27-3.8 — Boost–sustain thrust ratio

$$\frac{F_{b}}{F_{s}} = \frac{p_{c,b}}{p_{c,s}} = \left[\frac{a_b A_{b,b}}{a_s A_{b,s}}\right]^{\frac{1}{1-n}}$$

- **Variables** — subscripts $b$ boost, $s$ sustain; $a$ burn-rate coefficients of the two propellants (equal if one propellant is used) [m·s⁻¹·Pa⁻ⁿ]; $A_b$ burning areas [m²]; $n$ [—].
- **Meaning** — with a shared choked throat, thrust ratio is pressure ratio, and pressure ratio is the (area × rate) ratio raised to $1/(1-n)$. Boost/sustain ratios of 5–10 come from area ratios of only 3–5.
- **Assumes** — same $c^*$, $\rho_p$ and $C_F$ for both phases; negligible throat erosion between phases; quasi-steady operation in each.
- **Fails when** — the two propellants have materially different $c^*$ (carry it explicitly then); the sustain pressure falls below the propellant's stable-combustion limit, at which point 27-3.1 stops describing anything real.
- **Tag** [F] given [E] inputs · **Code** —

### 27-3.9 — Throttling a solid by throat area

$$p_c \propto A_t^{-\frac{1}{1-n}}, \qquad F = C_F\,p_c\,A_t \propto A_t^{-\frac{n}{1-n}}$$

- **Variables** — $A_t$ instantaneous throat area [m²]; $n$ [—].
- **Meaning** — closing the throat raises chamber pressure and, provided $n > 0$, raises thrust — but thrust sensitivity is governed by $n/(1-n)$, which is *small* for the low-exponent propellants everybody uses for stability. At $n = 0.35$ a two-to-one throat closure changes thrust by only $2^{0.538} = 1.45$ while chamber pressure changes by $2^{1.538} = 2.9$. **You pay a lot of pressure for a little thrust modulation.**
- **Assumes** — quasi-steady operation (the throat moves slowly compared with chamber fill time); no change in $c^*$ or $C_F$ with pressure; no erosive burning.
- **Fails when** — actuation is fast enough to excite the chamber's $L^*$ dynamics; the pressure excursion takes the motor outside its stable combustion band.
- **Tag** [F] given [E] inputs · **Code** —

### 27-3.10 — Hybrid regression rate

$$\dot r = a\,G_{ox}^{\,n}$$

- **Variables** — $\dot r$ regression rate [m/s]; $G_{ox} = \dot m_{ox}/A_{port}$ oxidiser mass flux [kg/(m²·s)]; $a$ [SI units that make the law dimensional]; $n \approx 0.5$–0.8 for classical polymeric fuels [—]. Often carries a weak $x^{-m}$ axial term.
- **Meaning** — regression is set by convective heat transfer through a turbulent boundary layer, so it follows the **mass flux, not the chamber pressure** — the defining difference between a hybrid and a solid.
- **Assumes** — diffusion-limited turbulent combustion; no radiation-dominated regime; no melting/entrainment mechanism; fully developed flow.
- **Fails when** — the fuel is a *liquefying* fuel such as paraffin, where a melt layer is entrained as droplets and regression rates several times the classical value are observed; at very low flux, where radiation and chemical kinetics take over; near the port entrance, where the boundary layer is still developing.
- **Tag** [E] · **Code** —
- **Alias** — ⚠ $a$ and $n$ here are *not* the Vieille constants of 20-3.4; the independent variable is flux, not pressure.

### 27-3.11 — Hybrid fuel flow and the $n = 0.5$ crossover

$$\dot m_f = \rho_f\,\pi D L\,\dot r = \rho_f \pi D L\, a \left(\frac{4\dot m_{ox}}{\pi D^2}\right)^{n} \propto D^{\,1-2n}$$

- **Variables** — $\rho_f$ fuel density [kg/m³]; $D$ port diameter [m]; $L$ port length [m]; $\dot m_{ox}$ [kg/s]; $n$ [—].
- **Meaning** — as the port opens, its area grows faster than its perimeter, so flux and regression rate fall; **whether the fuel flow rises or falls depends entirely on whether $n$ is below or above 0.5.** This is why hybrid O/F shift is a first-order design problem.
- **Assumes** — single circular port; uniform regression; $G$ evaluated on oxidiser only; constant $\dot m_{ox}$.
- **Fails when** — fuel mass flow is a significant part of the total flux (use $G_{tot}$, which flattens the shift); the oxidiser feed is blowdown rather than regulated; multi-port or non-circular geometry.
- **Tag** [F] given 27-3.10 · **Code** —

---

# Part IV — Cold-gas thrusters (modules 28–31)

## Module 28 — Cold-Gas Principles

### 28-3.1 — Stagnation enthalpy conversion

$$h_0 = h_e + \tfrac{1}{2}v_e^2$$

- **Variables** — $h_0$, $h_e$ specific stagnation and exit static enthalpy [J/kg]; $v_e$ exit velocity [m/s].
- **Meaning** — all the kinetic energy at the exit was enthalpy in the plenum. A cold-gas thruster is a *stored-enthalpy* device with no chemistry at all.
- **Assumes** — adiabatic; no shaft work; no body forces; steady flow; single phase.
- **Fails when** — the flow condenses in the nozzle (a real risk for CO₂ and refrigerants); the thruster is pulsing so fast the flow is not quasi-steady; wall heat transfer is comparable to the enthalpy flux — which for a small cold-gas nozzle it can be, because the gas is cold and the wall is not.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.4, 02-3.1.

### 28-3.2 — Ideal exit velocity

$$v_e = \sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}$$

- **Variables** — $R = R_u/M$ [J/(kg·K)]; $T_0$ [K]; $p_e/p_0$ exit-to-plenum static pressure ratio [—]; $\gamma$ [—].
- **Meaning** — the nozzle converts $c_pT_0$ into $\tfrac12 v_e^2$ with an efficiency set by the pressure ratio. Identical in form to the hot-chamber result of Module 02.
- **Assumes** — isentropic, calorically perfect, frozen composition (trivially true — nothing reacts), attached flow.
- **Fails when** — $\gamma$ varies significantly over the expansion (polyatomic refrigerants); the boundary layer occupies a large fraction of the throat — Reynolds numbers here are $10^3$–$10^4$, not $10^6$; condensation releases latent heat and breaks the isentrope.
- **Tag** [F] · **Code** `exit_velocity(gamma, R, T0, p0, pe)`
- **Alias** — 03-3.6, 29-3.8.

### 28-3.3 — The $\sqrt{T_0/M}$ ceiling

$$c_{max} = \sqrt{\frac{2\gamma}{\gamma-1}\cdot\frac{R_u T_0}{M}}, \qquad I_{sp}^{max} = \frac{c_{max}}{g_0}$$

- **Variables** — $R_u = 8314.46$ J/(kmol·K); $T_0$ [K]; $M$ molar mass [kg/kmol]; $c_{max}$ [m/s].
- **Meaning** — the absolute upper bound on specific impulse for a given gas at a given stagnation temperature, achievable only with an infinitely large nozzle in perfect vacuum. Helium 179 s, nitrogen 77 s, butane 68 s at 300 K.
- **Assumes** — everything 28-3.2 assumes, plus complete expansion.
- **Fails when** — the gas liquefies or solidifies before reaching that state — which it always does. Treat it as an asymptote you approach, never reach.
- **Tag** [F] · **Code** `ideal_isp_vac(gamma, R, T0, eps)` for the finite-$\varepsilon$ value

### 28-3.4 — Real-gas storage density

$$pV = Z\,m\,R\,T \qquad\Longleftrightarrow\qquad \rho_s = \frac{p}{Z R T}$$

- **Variables** — $p$ tank pressure [Pa]; $V$ tank internal volume [m³]; $m$ stored mass [kg]; $Z$ compressibility factor [—]; $T$ [K]; $\rho_s$ storage density [kg/m³].
- **Meaning** — $Z$ is the correction between what the ideal gas law says you loaded and what you actually loaded; for N₂ at 240 bar $Z \approx 1.13$, a 13 % error if ignored.
- **Assumes** — single phase; thermal equilibrium.
- **Fails when** — the gas is near or below its critical point, where $Z$ is a strong function of both $p$ and $T$ and a single number is meaningless.
- **Tag** [F] [A] · **Code** `stored_gas_mass(p, V, R, T, Z)`
- **Alias** — 29-3.2, 29-3.3.

### 28-3.5 — Spherical tank mass

$$m_{tank} = \frac{3}{2}\,\frac{\rho_m}{\sigma_{allow}}\,p\,V$$

- **Variables** — $\rho_m$ tank material density [kg/m³]; $\sigma_{allow}$ allowable membrane stress [Pa], ultimate strength over burst factor; $p$ [Pa]; $V$ [m³].
- **Meaning** — pressure-vessel mass is proportional to the *stored $pV$ product*, not to pressure or volume separately, with the constant being the inverse of specific strength.
- **Assumes** — thin wall ($t/r \lesssim 0.1$); spherical; membrane-stress-limited; no bosses, liner or minimum gauge.
- **Fails when** — the design is governed by minimum manufacturable gauge (low-pressure tanks), by fracture control, or by boss and mounting hardware, which for a small tank can exceed the membrane mass.
- **Tag** [F] [A] · **Code** —
- **Alias** — 12-3.2, 22-3.10, 30-3.2.

### 28-3.6 — Tank mass per unit propellant is pressure-independent

$$\frac{m_{tank}}{m_p} = \frac{3}{2}\,\frac{\rho_m}{\sigma_{allow}}\,Z R T = \frac{3}{2}\,\frac{\rho_m}{\sigma_{allow}}\,\frac{Z R_u T}{M}$$

- **Variables** — as 28-3.4 and 28-3.5; $m_p$ stored propellant mass [kg].
- **Meaning** — **tank mass per kilogram of propellant depends on the gas only through $ZR_uT/M$ and is completely independent of storage pressure.** Raising pressure buys volume, not mass. This is the central result of cold-gas system design and the reason heavy gases win on mass as well as volume.
- **Assumes** — everything in 28-3.5, plus that the tank is stress-limited rather than gauge-limited.
- **Fails when** — minimum gauge governs; the pressure is high enough that $Z$ becomes a strong function of $p$ (above ~400 bar for N₂ this matters).
- **Tag** [F] · **Code** —

### 28-3.7 — Joule–Thomson coefficient

$$\mu_{JT} \equiv \left(\frac{\partial T}{\partial p}\right)_h = \frac{1}{c_p}\left[T\left(\frac{\partial v}{\partial T}\right)_p - v\right]$$

- **Variables** — $\mu_{JT}$ [K/Pa]; $c_p$ [J/(kg·K)]; $v$ specific volume [m³/kg]; $T$ [K].
- **Meaning** — throttling cools the gas if $\mu_{JT} > 0$ and warms it if $\mu_{JT} < 0$. Nitrogen chills its regulator; helium (inversion temperature ~45 K) warms slightly.
- **Assumes** — adiabatic throttle; no kinetic-energy change across the restriction (true for a regulator, *not* for a nozzle).
- **Fails when** — the process is not adiabatic (long lines, small flows); two phases are present.
- **Tag** [F] · **Code** —
- **Alias** — 29-3.22.

### 28-3.8 — Blowdown usable-mass bounds

$$\text{isothermal: } \frac{m_f}{m_i} = \frac{p_f}{p_i}, \qquad \text{adiabatic: } \frac{m_f}{m_i} = \left(\frac{p_f}{p_i}\right)^{1/\gamma},\quad \frac{T_f}{T_i} = \left(\frac{p_f}{p_i}\right)^{\frac{\gamma-1}{\gamma}}$$

- **Variables** — subscripts $i$, $f$ initial and final tank state; $\gamma$ [—].
- **Meaning** — the usable mass fraction of a blowdown tank between two pressures, bounded by perfect wall heat transfer (isothermal, best case) and none (adiabatic, worst case).
- **Assumes** — ideal gas ($Z = 1$; a real high-pressure blowdown must be integrated with $Z(p,T)$); uniform tank state; no residual heating.
- **Fails when** — the gas liquefies; the discharge is fast compared with the tank's thermal time constant. The real case is always between the bounds and usually much closer to isothermal for a metal tank emptying over hours.
- **Tag** [F] [A] · **Code** `usable_fraction(p_i, p_f, isothermal, gamma)`
- **Alias** — 12-3.9, 29-3.17, 29-3.19.

### 28-3.9 — Clausius–Clapeyron and tank self-cooling

$$\frac{d\ln p_{vap}}{dT} = \frac{\Delta h_{vap}}{R T^2}, \qquad \Delta T \approx -\frac{m_{vap}\,\Delta h_{vap}}{m_{liq}c_{liq} + m_{tank}c_{tank}}$$

- **Variables** — $p_{vap}$ [Pa]; $\Delta h_{vap}$ latent heat [J/kg]; $m_{vap}$ mass evaporated in the burn [kg]; $c$ specific heat capacity [J/(kg·K)]; $R$ [J/(kg·K)].
- **Meaning** — for a saturated-liquid propellant (butane, R-236fa) a long continuous burn cools the tank and drops the feed pressure; a short pulse followed by a long coast does not, because the tank re-warms from the spacecraft.
- **Assumes** — uniform tank temperature; ideal vapour; $\Delta h_{vap}$ constant over the interval; no heater.
- **Fails when** — the burn is long enough that a thermal gradient forms in the liquid (stratification); the liquid runs low and the vapour space dominates.
- **Tag** [F] [A] · **Code** —
- **Alias** — 30-3.10 writes it on a molar basis.

### 28-3.10 — Choked mass flow

$$\dot m = \Gamma\,\frac{p_0 A_t}{\sqrt{R T_0}}, \qquad \Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — $\dot m$ [kg/s]; $p_0$ [Pa]; $A_t$ [m²]; $R$ [J/(kg·K)]; $T_0$ [K]; $\Gamma$ [—] — 0.6847 for $\gamma = 1.4$, 0.7268 for $\gamma = 5/3$, 0.6247 for $\gamma = 1.08$.
- **Meaning** — mass flow is set by upstream *stagnation* conditions and throat area alone; downstream pressure has no influence once choked.
- **Assumes** — choked, inviscid, 1-D, calorically perfect.
- **Fails when** — the throat Reynolds number is low enough that the boundary layer occupies an appreciable fraction of the throat — which for a 0.2 mm throat at 3 bar it does. Real cold-gas throats have $C_d$ of 0.85–0.98, small ones at the bottom. **Multiply by $C_d$.**
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`
- **Alias** — 02-3.10, 03-3.7, 19-3.2, 29-3.7.

### 28-3.11 — $c^*$, $C_F$ factorisation for cold gas

$$c^* = \frac{\sqrt{R T_0}}{\Gamma}, \qquad F = C_F\,p_0 A_t = \dot m\, c^* C_F = \dot m\, I_{sp}\,g_0$$

- **Variables** — $c^*$ [m/s]; $C_F$ [—] at the nozzle's $\varepsilon$ and ambient pressure; $F$ [N]; $I_{sp}$ [s].
- **Meaning** — the clean separation of gas properties ($c^*$) from nozzle geometry ($C_F$) established in Module 03 holds unchanged for cold gas.
- **Assumes** — as 28-3.10, plus attached, isentropic nozzle flow.
- **Fails when** — the nozzle is separated — only an issue for sea-level testing of a vacuum-optimised cold-gas nozzle, and a real issue, because $\varepsilon = 50$ against 1 bar separates violently.
- **Tag** [F] · **Code** `c_star(...)`, `Cf(...)`, `c_eff(...)`
- **Alias** — 03-3.10.

### 28-3.12 — The 0.90 rule

$$I_{sp}^{real} \approx 0.90 \times I_{sp}^{ideal}$$

- **Variables** — $I_{sp}$ [s].
- **Meaning** — about 10 % of the ideal impulse is lost. Valid for continuous firing of a well-made cold-gas thruster with $\varepsilon$ between 20 and 100 at $T_0 \approx 300$ K.
- **Assumes** — steady operation.
- **Fails when** — **badly, for pulsed operation**, where realised $I_{sp}$ can fall to 50–70 % of ideal because a large fraction of every pulse is spent in the valve transient. SAFER's implied ~40 s against a 77 s ideal is exactly this effect.
- **Tag** [E] · **Code** —
- **Alias** — 31-3.5, identical.

### 28-3.13 — Impulse bit

$$I_{bit} \approx F_{ss}\left(t_{on} - \tfrac{t_r}{2} + \tfrac{t_f}{2}\right) + m_d\,c$$

- **Variables** — $F_{ss}$ steady-state thrust [N]; $t_{on}$ commanded on-time [s]; $t_r$, $t_f$ rise and fall times [s]; $m_d$ gas mass resident in the dead volume between valve seat and throat [kg]; $c = I_{sp}g_0$ effective exhaust velocity [m/s].
- **Meaning** — the impulse bit is the commanded on-time corrected for the two transients plus the tail from blowing down the dead volume. Minimising dead volume is the single biggest lever on MIB.
- **Assumes** — linear rise and fall (real traces are S-shaped but the trapezoid integral is within a few percent); $t_{on} > t_r$; quasi-steady nozzle flow.
- **Fails when** — $t_{on} \lesssim t_r$: the valve never reaches full lift, thrust never reaches $F_{ss}$, and the impulse bit becomes a strongly nonlinear, poorly repeatable function of $t_{on}$. **This is the regime the MIB definition exists to keep you out of.**
- **Tag** [E] [A] · **Code** `impulse_bit(F, t_on, t_rise, t_fall)`
- **Alias** — 29-3.20 (first-order form), 31-3.6.

### 28-3.14 — Couple torque and angular acceleration

$$\tau = 2FL, \qquad \alpha = \frac{\tau}{I}$$

- **Variables** — $\tau$ torque [N·m]; $F$ thrust per thruster [N]; $L$ moment arm from centre of mass to each thruster's line of action [m]; $I$ moment of inertia [kg·m²]; $\alpha$ angular acceleration [rad/s²].
- **Meaning** — a couple rotates without translating, which is why attitude-control thrusters come in pairs.
- **Assumes** — rigid body; thrusters aligned; centre of mass known.
- **Fails when** — the c.m. moves as propellant depletes (it does); thrust mismatch leaves a residual force (5 % mismatch on a 50 mN pair is 2.5 mN net, which over a year is 79 N·s of unwanted $\Delta v$); the alignment tolerance is comparable to $L$/length.
- **Tag** [F] · **Code** —

### 28-3.15 — Limit-cycle propellant consumption

$$\omega_{lc} = \frac{I_{bit}L}{I}, \qquad t_{cycle} = \frac{2\theta_{db}}{\omega_{lc}}, \qquad \dot m_{lc} = \frac{I_{bit}^2 L}{I\,\theta_{db}\,I_{sp}g_0}$$

- **Variables** — $\omega_{lc}$ limit-cycle rate [rad/s]; $\theta_{db}$ deadband half-width [rad]; $t_{cycle}$ time to drift across the full deadband [s]; $\dot m_{lc}$ time-averaged propellant consumption for one axis [kg/s]; $I_{bit}$ [N·s]; $I$ [kg·m²]; $L$ [m].
- **Meaning** — the propellant cost of holding attitude with no external disturbance. Note $\dot m_{lc} \propto I_{bit}^2$: **halving the minimum impulse bit quarters the limit-cycle propellant.**
- **Assumes** — no disturbance torque; rate-reversal control law; one pair firing per boundary crossing; repeatable $I_{bit}$.
- **Fails when** — a disturbance torque is present (use 28-3.16 instead; the two regimes are different, not simply additive); sensor noise exceeds the deadband, in which case the controller fires on noise and consumption is set by the noise, not the physics.
- **Tag** [F] · **Code** —

### 28-3.16 — Secular-disturbance impulse budget

$$H = \tau_d\,t, \qquad I_{t,required} = \frac{2\tau_d t}{L}$$

- **Variables** — $H$ accumulated angular momentum [N·m·s]; $\tau_d$ secular disturbance torque [N·m]; $t$ mission duration [s]; $L$ moment arm [m]; $I_{t,required}$ total *propellant* impulse summed over both thrusters of the pair [N·s].
- **Meaning** — a constant-direction disturbance costs propellant at a fixed rate and the deadband does not help.
- **Assumes** — the disturbance is genuinely secular.
- **Fails when** — the disturbance is cyclic. A gravity-gradient torque on a nadir-pointing spacecraft averages to nearly zero over an orbit, so budgeting it as secular over-sizes the system by orders of magnitude. **Deciding which components of $\tau_d$ are secular is the hardest judgment in the whole budget.**
- **Tag** [F] [J] · **Code** —

### 28-3.17 — Slew impulse cost

$$\alpha = \frac{4\theta}{t_s^2}, \qquad H_{slew} = \frac{4I\theta}{t_s}, \qquad I_{t,slew} = \frac{4I\theta}{L\,t_s}$$

- **Variables** — $\theta$ slew angle [rad]; $t_s$ slew duration [s]; $I$ [kg·m²]; $L$ [m]; $I_{t,slew}$ propellant impulse summed over the pair, per slew [N·s].
- **Meaning** — the cost of a slew scales linearly with angle and inversely with the time allowed: **fast slews are expensive.**
- **Assumes** — rigid body; bang-bang profile; no coasting phase; thrust much larger than disturbances.
- **Fails when** — the slew is long enough that a coast phase is used (which reduces cost, so this is conservative); flexible modes force a shaped command profile.
- **Tag** [F] [J] · **Code** —

### 28-3.18 — Impulse density

$$\Lambda = \rho_s\,I_{sp}\,g_0$$

- **Variables** — $\rho_s$ storage density [kg/m³]; $I_{sp}$ [s]; $\Lambda$ [N·s/m³].
- **Meaning** — how much impulse fits in a litre of tank; the figure of merit that makes butane beat nitrogen at CubeSat scale despite a lower $I_{sp}$.
- **Assumes** — tank internal volume is the binding constraint; tank wall thickness ignored.
- **Fails when** — mass, not volume, is the constraint; use $I_{sp}$ directly then.
- **Tag** [F] · **Code** `density_isp(rho, isp)` (differs by $g_0$)
- **Alias** — 05-3.3 and 19-3.5 write $I_d = \rho I_{sp}$ without the $g_0$; 29-3.4 and 31-3.4 use this form. ⚠ Check whether a quoted "density impulse" carries $g_0$.

---

## Module 29 — Cold-Gas Performance Modeling

### 29-3.1 — Ideal-gas tank mass

$$m = \frac{p V}{R T}, \qquad R = \frac{R_u}{\mathcal{M}}$$

- **Variables** — $m$ [kg]; $p$ [Pa]; $V$ [m³]; $R$ [J/(kg·K)]; $T$ [K]; $\mathcal{M}$ [kg/kmol].
- **Meaning** — mass of gas stored in a fixed volume at a measured pressure and temperature.
- **Assumes** — point-like molecules; no intermolecular forces.
- **Fails when** — the molar volume approaches the molecular co-volume — in practice above ~50 bar for any gas, and at any pressure within ~50 K of the critical temperature. At 240 bar the error is ~15 %.
- **Tag** [F] · **Code** `stored_gas_mass(p, V, R, T, Z=1.0)`

### 29-3.2 — Real-gas tank mass

$$m = \frac{p V}{Z\,R\,T}, \qquad Z \equiv \frac{p v}{R T}$$

- **Variables** — $Z$ compressibility factor [—]; $v$ specific volume [m³/kg].
- **Meaning** — $Z$ is the factor by which the real gas departs from ideal at that $(p,T)$.
- **Assumes** — single phase; equilibrium.
- **Fails when** — two-phase; there is then no single $Z$ and a saturation table must be used.
- **Tag** [F] · **Code** `stored_gas_mass(p, V, R, T, Z)`

### 29-3.3 — Storage density

$$\rho = \frac{p}{Z R T}$$

- **Variables** — $\rho$ [kg/m³]; other symbols as 29-3.2.
- **Meaning** — propellant packing density; the number that decides whether a cold-gas system fits in a CubeSat.
- **Assumes** — as 29-3.2.
- **Fails when** — as 29-3.2.
- **Tag** [F] · **Code** —

### 29-3.4 — Impulse density and impulse per wet mass

$$\frac{I_{tot}}{V_{prop}} = \rho\, I_{sp}\, g_0
\qquad
\frac{I_{tot}}{m_{prop}+m_{tank}+m_{dry}}$$

- **Variables** — impulse density [N·s/m³, often quoted N·s/cm³]; impulse per wet mass [N·s/kg]; $\rho$ [kg/m³]; $I_{sp}$ [s].
- **Meaning** — the first is volume-limited packaging, the second mass-limited. A cold-gas system is almost always one or the other, rarely both.
- **Assumes** — $I_{sp}$ constant over the discharge.
- **Fails when** — a blowdown system's $I_{sp}$ falls with tank temperature; use the integral of 29-3.18 then.
- **Tag** [F] · **Code** `density_isp(rho, isp)`
- **Alias** — 28-3.18, 31-3.4.

### 29-3.5 — Polytropic exponent for tank blowdown

$$n = 1 + \kappa(\gamma-1)$$

- **Variables** — $n$ [—]; $\kappa$ the fraction of expansion work *not* made up by wall heat transfer [—]; $\gamma$ [—]. $\kappa = 0$ gives isothermal, $\kappa = 1$ adiabatic.
- **Meaning** — a one-parameter interpolation between isothermal and adiabatic tank behaviour, which is what real tanks do.
- **Assumes** — $\kappa$ constant through the discharge; perfect gas; spatially uniform tank gas.
- **Fails when** — the discharge is long enough that $\kappa$ drifts (early in a fast blowdown the gas is near-adiabatic, late in it the wall has caught up); the tank gas stratifies, which it does in any tank taller than it is wide in microgravity with no convection.
- **Tag** [A] · **Code** `blowdown_pressure(p_i, V_i, V, n)`

### 29-3.6 — Tank state along a polytrope

$$\frac{T_t}{T_i}=\left(\frac{p_t}{p_i}\right)^{\frac{n-1}{n}},
\qquad
\frac{\rho_t}{\rho_i}=\left(\frac{p_t}{p_i}\right)^{1/n}$$

- **Variables** — subscripts $t$, $i$ instantaneous and initial; $n$ [—].
- **Meaning** — tank temperature and density as functions of tank pressure alone, once $n$ is chosen.
- **Assumes** — ideal gas; uniform tank.
- **Fails when** — $Z \neq 1$ (at 200 bar the exponent that fits real nitrogen is not exactly $\gamma$); the propellant is a saturated liquid, in which case tank pressure is the vapour pressure and this is replaced by the saturation curve.
- **Tag** [F] [A] · **Code** —

### 29-3.7 — Choked mass flow

$$\dot m = \Gamma\,\frac{p_0 A_t}{\sqrt{R T_0}},\qquad
\Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Variables** — as 28-3.10.
- **Meaning** — with the throat choked, mass flow is set by upstream stagnation state and throat area and is completely independent of anything downstream.
- **Assumes** — choked ($p_0/p_a$ above ~1.9); 1-D; isentropic to the throat; calorically perfect; inviscid.
- **Fails when** — the nozzle unchokes (a cold-gas thruster firing in atmosphere at low plenum pressure); $Re_t \lesssim 10^3$, where the boundary layer blocks enough of the throat that a discharge coefficient is mandatory.
- **Tag** [F] · **Code** `choked_mdot(gamma, R, T0, p0, At)`

### 29-3.8 — Exit velocity

$$v_e = \sqrt{2c_pT_0\left(1-\frac{T_e}{T_0}\right)}
= \sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}$$

- **Variables** — $c_p$ [J/(kg·K)]; $T_0$, $T_e$ [K]; $R$ [J/(kg·K)]; $p_e/p_0$ [—]; $v_e$ [m/s].
- **Meaning** — all the enthalpy you convert becomes kinetic energy.
- **Assumes** — isentropic; calorically perfect; 1-D; no heat loss; exit flow fully expanded and attached.
- **Fails when** — the gas condenses in the nozzle (a real risk for CO₂ and refrigerants); $\gamma$ varies enough across the 250 K temperature drop to matter, which it does for polyatomics.
- **Tag** [F] · **Code** `exit_velocity(gamma, R, T0, p0, pe)`

### 29-3.9 — Thrust

$$F = \dot m v_e + (p_e-p_a)A_e$$

- **Variables** — $F$ [N]; $\dot m$ [kg/s]; $v_e$ [m/s]; $p_e$, $p_a$ [Pa]; $A_e$ [m²].
- **Meaning** — rate of momentum leaving the control volume plus the unbalanced pressure force on the exit plane.
- **Assumes** — steady; uniform exit profile; axial flow.
- **Fails when** — the flow separates inside the nozzle (only in atmospheric testing of a high-$\varepsilon$ cold-gas nozzle — a 50:1 nitrogen nozzle at 20 bar will separate violently on a sea-level stand); the exit profile is non-uniform, which at low $Re$ it always is.
- **Tag** [F] · **Code** `thrust(mdot, ve, pe, pa, Ae)`
- **Alias** — 01-3.2, 02-3.23, 03-3.2.

### 29-3.10 — Thrust coefficient

$$C_F \equiv \frac{F}{p_0A_t}
=\sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}
\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}
+\frac{p_e-p_a}{p_0}\varepsilon$$

- **Variables** — $C_F$ [—]; $\varepsilon = A_e/A_t$ [—]; other symbols as above.
- **Meaning** — how much thrust the nozzle gets out of a given throat and plenum pressure; the nozzle's own figure of merit, cleanly separated from the propellant's ($c^*$).
- **Assumes** — as 29-3.8, plus $p_e$ obtained from $\varepsilon$ by the isentropic area–Mach relation.
- **Fails when** — viscous blockage changes the effective $\varepsilon$, which is the entire subject of 29-3.11 to 29-3.13.
- **Tag** [F] · **Code** `Cf(gamma, eps, p0, pa, pe=None)`
- **Alias** — 03-3.9, identical.

### 29-3.11 — Throat Reynolds number

$$Re_t = \frac{\rho^* a^* D_t}{\mu^*} = \frac{4\dot m}{\pi D_t \mu^*}$$

- **Variables** — $Re_t$ [—]; $\mu^*$ [Pa·s] evaluated at the throat static temperature $T^* = 2T_0/(\gamma+1)$; $D_t$ [m]; $\dot m$ [kg/s]. The second form follows from $\dot m = \rho^*a^*\pi D_t^2/4$ and is the one to use, because $\dot m$ is usually what you know.
- **Meaning** — ratio of inertial to viscous forces at the smallest section; the single number that decides whether a micronozzle works.
- **Assumes** — choked flow.
- **Fails when** — the flow is rarefied enough that the continuum assumption goes (Knudsen number above ~0.01 — reached in micronozzles below ~20 µm throat, or at plenum pressures below ~0.1 bar).
- **Tag** [F] · **Code** `reynolds(rho, v, L, mu)`
- **Alias** — 30-3.9, identical.

### 29-3.12 — Viscous discharge and efficiency corrections

$$C_d \approx 1 - \frac{a}{\sqrt{Re_t}},\qquad
\eta_{visc} \approx 1 - \frac{b}{\sqrt{Re_t}}$$

- **Variables** — $C_d$, $\eta_{visc}$ [—]; $a \approx 5$, $b \approx 10$ for a conical nozzle of $\varepsilon \approx 50$ and 15° half-angle.
- **Meaning** — laminar boundary-layer blockage at the throat ($C_d$) and momentum-deficit plus friction loss over the whole nozzle ($\eta_{visc}$). At $Re_t = 10^4$ that is a 5 % flow loss and a 10 % impulse loss.
- **Assumes** — laminar, attached, continuum flow; a cold wall not far from the recovery temperature.
- **Fails when** — $Re_t \lesssim 500$, where the boundary layers merge and the loss grows faster than $Re^{-1/2}$; above $Re_t \sim 10^5$, where transition puts you on a different curve. Accuracy ±0.05 on $\eta_{visc}$; fitted to a trend, not to a single data set. **Re-read the source figures before using this for a flight prediction.**
- **Tag** [E] · **Code** —

### 29-3.12a — $\varepsilon$-dependence of the viscous constant

$$b(\varepsilon) \approx 10\sqrt{\varepsilon/50}$$

- **Variables** — $b$ [—]; $\varepsilon$ [—].
- **Meaning** — a heuristic, not a fit, calibrated so the $\varepsilon$-dependence of $\eta_{visc}$ crosses that of ideal $C_F$ at around $Re_t \sim 10^4$ — where the published data put the crossover. It exists so the $\varepsilon$ trade can be made quantitatively on the back of an envelope.
- **Assumes** — the geometry family of 29-3.12.
- **Fails when** — outside $20 \le \varepsilon \le 100$. **Do not present it to a customer as a correlation.**
- **Tag** [A] [J] · **Code** —

### 29-3.13 — Assembled small-nozzle performance

$$\lambda = \frac{1+\cos\alpha}{2}, \qquad
\eta_I = \lambda\,\eta_{visc}, \qquad
I_{sp} = \eta_I\,I_{sp,\text{ideal}}, \qquad
F = C_d\,\dot m_{ideal}\,\eta_I\,I_{sp,\text{ideal}}\,g_0$$

- **Variables** — $\lambda$ divergence efficiency [—], 0.983 at $\alpha = 15°$; $\eta_I$ overall impulse efficiency [—].
- **Meaning** — the axial component of a radially diverging exhaust, times the viscous survival fraction. This chain is how a cold-gas thruster's real $I_{sp}$ is predicted.
- **Assumes** — uniform source flow.
- **Fails when** — the exit profile is viscous-dominated, at which point $\lambda$ and $\eta_{visc}$ are no longer separable and only the measured $C_F$ means anything.
- **Tag** [A] [E] · **Code** —
- **Alias** — 09-3.6, 24-3.14 for $\lambda$.

### 29-3.14 — Isothermal blowdown pressure decay

$$p_t(t) = p_i\,e^{-t/\tau},\qquad
\tau = \frac{V}{\Gamma A_t\sqrt{RT_i}} = \frac{V\,c^*}{A_t R T_i}$$

- **Variables** — $\tau$ [s]; $V$ tank volume [m³]; $A_t$ [m²]; $R$ [J/(kg·K)]; $T_i$ [K]; $\Gamma$ [—].
- **Meaning** — an unregulated fixed-throat gas tank is an RC circuit: the "capacitance" is $V/RT$ and the "conductance" is the choked orifice. $\tau$ is also exactly $m_i/\dot m_i$ — the time to empty the tank at the *initial* flow rate.
- **Assumes** — isothermal tank; choked throat throughout; ideal gas; no regulator.
- **Fails when** — the throat unchokes near the end (in vacuum it never does; on the bench it does when $p_t < 1.9\,p_a$); the discharge is fast enough to be non-isothermal.
- **Tag** [F] · **Code** —

### 29-3.15 — Adiabatic blowdown

$$x(t) = \left[1+\frac{\gamma-1}{2}\frac{t}{\tau_i}\right]^{-\frac{2}{\gamma-1}},
\quad
\frac{p_t}{p_i}=x^\gamma,
\quad
\frac{T_t}{T_i}=x^{\gamma-1}=\left[1+\frac{\gamma-1}{2}\frac{t}{\tau_i}\right]^{-2}$$

- **Variables** — $x$ density ratio [—]; $\tau_i$ initial time constant [s]; $\gamma$ [—]. For $\gamma = 1.4$: $p_t/p_i = (1+0.2\,t/\tau_i)^{-7}$.
- **Meaning** — an adiabatic blowdown is *algebraic*, not exponential: it starts faster than the isothermal case and then hangs on with a long cold tail.
- **Assumes** — reversible adiabatic expansion of the retained gas; ideal gas; choked throat.
- **Fails when** — the wall supplies heat (it always supplies some); the gas condenses in the tank — nitrogen at 20 bar saturates at 114 K, so a deep adiabatic blowdown from 200 bar can in principle reach the two-phase region.
- **Tag** [F] · **Code** —

### 29-3.16 — Regulated (constant-flow) tank decay

$$p_t(t) = p_i - \frac{\dot m R T_i}{V}\,t \quad (\text{isothermal tank})$$

- **Variables** — $\dot m$ constant regulated flow [kg/s]; $V$ [m³]; $R$ [J/(kg·K)]; $T_i$ [K].
- **Meaning** — constant thrust, constant flow, linear tank decay, until the tank falls to the regulator dropout pressure $p_{lock} \approx p_{reg} + \Delta p_{reg}$ (typically 1–2 bar of droop plus line loss). Below that the system reverts to blowdown.
- **Assumes** — regulator in regulation; isothermal tank.
- **Fails when** — the regulator locks up, at which point 29-3.14 takes over.
- **Tag** [F] · **Code** —

### 29-3.17 — Total impulse, isothermal

$$I_{tot} = C_F\,c^*\,(m_i-m_f) = I_{sp}g_0\,\phi\,m_i,
\qquad \phi_{iso}=1-\frac{p_f}{p_i}$$

- **Variables** — $I_{tot}$ [N·s]; $\phi$ usable mass fraction [—]; $m_i$, $m_f$ [kg].
- **Meaning** — at constant temperature the usable fraction is just the pressure fraction you throw away.
- **Assumes** — isothermal; ideal gas; constant $C_F$.
- **Fails when** — $Z$ varies over the pressure range ($Z$ is 1.13 at 240 bar and 1.00 at 20 bar, so $\phi_{iso}$ from pressures alone is optimistic by a few percent); the thruster's minimum operating pressure is set by $Re_t$ rather than by choking.
- **Tag** [F] · **Code** `usable_fraction(p_i, p_f, isothermal=True)`

### 29-3.18 — Total impulse, adiabatic

$$I_{tot}=C_F\frac{\sqrt{RT_i}}{\Gamma}\int_{m_f}^{m_i}\left(\frac{m}{m_i}\right)^{\frac{\gamma-1}{2}}dm
= C_F c^*_i\,m_i\,\frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{\frac{\gamma+1}{2}}\right]$$

- **Variables** — $c^*_i$ initial characteristic velocity [m/s]; $m_i$, $m_f$ [kg]; $\gamma$ [—]. For $\gamma = 1.4$ the bracket exponent is 1.2 and the prefactor 0.833.
- **Meaning** — closed-form total impulse for an adiabatic blowdown, with the $2/(\gamma+1)$ factor carrying the $I_{sp}$ decay as the tank cools.
- **Assumes** — adiabatic tank; constant $C_F$; ideal gas.
- **Fails when** — the nozzle's $Re_t$ collapses as $\dot m$ falls, which it does; the cold tail of an adiabatic blowdown is delivered at a *lower* $I_{sp}$ than even this predicts.
- **Tag** [F] · **Code** —

### 29-3.19 — Usable mass fraction, adiabatic

$$\phi_{adiab} = 1-\left(\frac{p_f}{p_i}\right)^{1/\gamma}$$

- **Variables** — $\phi$ [—]; $p_f/p_i$ [—]; $\gamma$ [—].
- **Meaning** — usable mass fraction when the tank cools. It is *smaller* than the isothermal value because at a given cutoff pressure the cold gas is **denser**, so more mass is stranded. For $p_f/p_i = 0.2$ and $\gamma = 1.4$: $\phi_{iso} = 0.800$ but $\phi_{adiab} = 0.683$. You lose 15 % of the propellant *and* what you do expel comes out at a declining $I_{sp}$ — both penalties, same cause.
- **Assumes** — adiabatic; ideal gas; same cutoff pressure.
- **Fails when** — the tank exchanges heat, which it does; the real answer sits between 29-3.17 and this.
- **Tag** [F] · **Code** `usable_fraction(p_i, p_f, isothermal=False, gamma=...)`

### 29-3.20 — Impulse bit from first-order plenum dynamics

$$I_{bit}=F\big[t_{on}+(\tau_e-\tau_f)k\big]$$

- **Variables** — $I_{bit}$ [N·s]; $F$ steady thrust [N]; $t_{on}$ [s]; $\tau_f$ fill time constant [s]; $\tau_e$ empty (tail-off) time constant [s]; $k$ a factor of order 1 from the exponential integrals [—].
- **Meaning** — **if $\tau_e = \tau_f$ the impulse bit is exactly $Ft_{on}$, for any pulse width.** A symmetric first-order thruster has no impulse-bit bias at all; all the bias comes from asymmetry. Real thrusters are asymmetric, because the valve opens against an orifice much larger than the throat but closes into a plenum that can only drain through the throat, so $\tau_e > \tau_f$ and short pulses deliver *more* than $Ft_{on}$.
- **Assumes** — linear first-order plenum; valve motion fast compared with $\tau_f$; choked throughout.
- **Fails when** — $t_{on}$ is comparable to the valve's mechanical dead time $t_d$ (subtract $t_d$ from $t_{on}$; the scatter in $t_d$ then dominates repeatability); the plenum unchokes during the tail.
- **Tag** [A] · **Code** `impulse_bit(F, t_on, t_rise, t_fall)` implements the trapezoidal equivalent, which agrees to a few percent for $t_{on} \gtrsim 3\tau_f$ and diverges below that
- **Alias** — 28-3.13, 31-3.6.

### 29-3.21 — Leakage mass over mission life

$$m_{leak} = Q_L\,t_{mission}\,\frac{p_{std}\,(10^{-6}\ \mathrm{m^3})}{R\,T_{std}}$$

- **Variables** — $m_{leak}$ [kg]; $Q_L$ [std cm³/s]; $t_{mission}$ [s]; $p_{std}$, $T_{std}$ standard conditions. One std cm³ is $1.786\times10^{-7}$ kg of helium and $1.250\times10^{-6}$ kg of nitrogen.
- **Meaning** — turns a leak specification into grams; for a multi-year mission the leak budget often exceeds the manoeuvre budget.
- **Assumes** — constant $Q_L$ over life (optimistic — seals relax and elastomers cold-flow); leak measured at the service $\Delta p$.
- **Fails when** — the specification was taken at 1 bar $\Delta p$ and the system runs at 200 bar. Viscous leaks scale roughly as $\Delta p^2$, molecular leaks as $\Delta p$.
- **Tag** [F] [E] · **Code** —

### 29-3.22 — Joule–Thomson temperature change

$$\Delta T = \int_{p_1}^{p_2}\mu_{JT}\,dp \approx \mu_{JT}\,(p_2-p_1)$$

- **Variables** — $\mu_{JT} = (\partial T/\partial p)_h$ [K/Pa]; $\Delta T$ [K].
- **Meaning** — throttling a real gas changes its temperature even though no work is done and no heat added, because internal energy contains a configurational term. This is what freezes regulators and seats.
- **Assumes** — $\mu_{JT}$ constant over the pressure drop (it is not — it falls with pressure); steady flow; adiabatic throttle.
- **Fails when** — the gas is near saturation, where throttling can condense it.
- **Tag** [F] [E] · **Code** —
- **Alias** — 28-3.7.

---

## Module 30 — Cold-Gas Hardware

### 30-3.1 — Spherical membrane stress

$$\sigma = \frac{p r}{2 t}, \qquad t = \frac{p r}{2\sigma}$$

- **Variables** — $\sigma$ membrane stress [Pa]; $p$ internal pressure [Pa]; $r$ internal radius [m]; $t$ wall thickness [m].
- **Meaning** — a sphere carries pressure in pure biaxial membrane tension, equal in every direction — half the hoop stress of a cylinder at the same radius, which is why gas bottles are spheres.
- **Assumes** — $t/r \ll 1$ (below ~1/10 the peak-stress error is under 5 %); no bending; no discontinuity; uniform material.
- **Fails when** — at the boss, the girth weld, and any thickness step — which is where real tanks actually fail, and why the NASA monograph spends most of its length on discontinuity stresses rather than on this equation.
- **Tag** [F] · **Code** —
- **Alias** — 22-3.1/3.2 for the cylinder.

### 30-3.2 — Vessel performance factor

$$\frac{PV}{W} = \frac{p_\mathrm{MEOP} V}{m g_0}$$

- **Variables** — $p_\mathrm{MEOP}$ [Pa]; $V$ internal volume [m³]; $m$ vessel mass [kg]; $g_0 = 9.80665$ m/s²; $PV/W$ [m].
- **Meaning** — stored pressure–volume energy per unit weight; dimensionally a length, quoted in metres or inches. It collapses material choice, construction type and geometry into one comparable number.
- **Assumes** — nothing; it is a definition.
- **Fails when** — volume, not mass, is the binding constraint — which at CubeSat scale it usually is.
- **Tag** [F] · **Code** —
- **Alias** — 12-3.6, 22-3.10, 31-5.1.

### 30-3.3 — Leak-before-burst condition

$$K_{Ic} > \sigma_\mathrm{op}\sqrt{\pi t}\,\cdot C$$

- **Variables** — $K_{Ic}$ plane-strain fracture toughness [Pa·m$^{1/2}$]; $\sigma_\mathrm{op}$ operating membrane stress [Pa]; $t$ wall thickness [m]; $C$ geometry factor of order unity for a through-thickness flaw [—].
- **Meaning** — a through-wall crack of length comparable to the wall thickness must remain stable, so the tank leaks harmlessly rather than bursting. LBB favours **thin walls in tough materials at moderate stress**: titanium and 2219/6061 aluminium give it, very high-strength steels do not. **A COPV cannot claim LBB at all** — its failure mode is composite stress rupture, which has no growing inspectable flaw.
- **Assumes** — LEFM validity; plane strain; a specific flaw shape. The real assessment is a full damage-tolerance analysis with a proof-test-screened initial flaw size, not this inequality.
- **Fails when** — the material is thick enough to be genuinely plane-strain and tough enough that LEFM under-predicts; the flaw is in a weld heat-affected zone with different properties from the parent.
- **Tag** [F] [A] · **Code** —
- **Alias** — 16-3.8, 22-3.6.

### 30-3.4 — Steady-state permeation through a liner

$$\dot{n} = \frac{P_\mathrm{perm} A \,\Delta p}{t_\mathrm{lin}}$$

- **Variables** — $\dot n$ permeation rate [mol/s or scc/s]; $P_\mathrm{perm}$ permeability of the liner material to the gas [mol·m/(m²·s·Pa)]; $A$ liner area [m²]; $\Delta p$ partial-pressure difference [Pa]; $t_\mathrm{lin}$ liner thickness [m].
- **Meaning** — solution-diffusion transport of gas through a solid wall: **a true leak with no hole in it.** It is why spaceflight COPVs are metal-lined (Type III) and not polymer-lined (Type IV) — helium permeation through a polymer is irrelevant over a 5-minute automotive cycle and fatal over a five-year mission.
- **Assumes** — steady state; Fickian diffusion; no liner damage.
- **Fails when** — the liner has microcracked (exactly what a buckled liner produces), in which case transport is through cracks and the permeability model does not apply.
- **Tag** [F] · **Code** —

### 30-3.5 — Regulator force balance

$$p_\mathrm{out} A_s = F_0 - k x \pm p_\mathrm{in} A_\mathrm{seat}$$

- **Variables** — $p_\mathrm{out}$, $p_\mathrm{in}$ outlet and inlet pressures [Pa]; $A_s$ sensing area [m²]; $F_0$ spring preload at zero lift [N]; $k$ spring rate [N/m]; $x$ poppet lift [m]; $A_\mathrm{seat}$ unbalanced seat area [m²].
- **Meaning** — a quasi-static force balance on the moving assembly; the sign on the last term depends on whether the poppet opens with or against inlet pressure.
- **Assumes** — quasi-static (no dynamics); frictionless; no flow-induced force; diaphragm effective area constant with deflection.
- **Fails when** — the regulator is oscillating (a dynamic problem this tells you nothing about); the diaphragm effective area changes appreciably with stroke.
- **Tag** [F] · **Code** —
- **Alias** — 14-3.10 with the flow-force term shown explicitly.

### 30-3.6 — Regulator droop

$$\Delta p_\mathrm{droop} = \frac{k\,\dot m \sqrt{R T}}{A_s\,C_d\,\pi d_s\,\Gamma\, p_\mathrm{in}}$$

- **Variables** — $\dot m$ mass flow [kg/s]; $\Gamma$ [—]; $R$ [J/(kg·K)]; $T$ [K]; $C_d$ seat discharge coefficient [—]; $d_s$ seat diameter [m]; $k$ [N/m]; $A_s$ [m²]; $p_\mathrm{in}$ [Pa].
- **Meaning** — droop is proportional to demanded flow and inversely proportional to inlet pressure, sensing area and seat circumference. A regulator droops most at high flow and *end of mission*, when inlet pressure is lowest.
- **Assumes** — the seat annulus is choked (true whenever $p_\mathrm{in}/p_\mathrm{out} > \sim 2$); lift small compared with $d_s/4$, so the annulus and not the seat bore is the throat.
- **Fails when** — lift approaches full open (the bore chokes instead and droop saturates); at low pressure ratio.
- **Tag** [F] [A] · **Code** —

### 30-3.7 — Solenoid magnetic force

$$F_\mathrm{mag} = \frac{\mu_0 N^2 I^2 A_p}{2 g^2}$$

- **Variables** — $\mu_0 = 4\pi\times10^{-7}$ H/m; $N$ turns [—]; $I$ coil current [A]; $A_p$ pole face area [m²]; $g$ air gap [m]; $F_\mathrm{mag}$ [N].
- **Meaning** — force is the gradient of stored magnetic energy with gap; it goes as the square of ampere-turns and inversely as the square of the gap — which is why a solenoid valve snaps closed and why pull-in is the hard part, not hold.
- **Assumes** — all reluctance in the air gap (iron infinitely permeable); no saturation; no fringing; a single gap.
- **Fails when** — the iron saturates. Above roughly 1.5–2.0 T in soft magnetic iron or 430F stainless the force stops rising as $I^2$ and goes nearly linear — **why brute-forcing a marginal valve with more current stops working.**
- **Tag** [F] [A] · **Code** —

### 30-3.8 — Solenoid electrical rise time

$$t_\mathrm{elec} = \tau \ln\!\left(\frac{1}{1 - I_\mathrm{pi}R/V}\right)$$

- **Variables** — $\tau = L/R$ [s]; $L$ coil inductance [H]; $R$ coil resistance [Ω]; $V$ drive voltage [V]; $I_\mathrm{pi}$ pull-in current [A].
- **Meaning** — first-order electrical rise of a series R–L circuit; the first term of the valve's total response time, before any mechanical motion.
- **Assumes** — constant $L$ — which is false, because $L$ depends on the gap and therefore changes as the armature moves; the honest treatment solves the coupled electromechanical problem.
- **Fails when** — $I_\mathrm{pi}R \ge V$ (the valve never pulls in); eddy currents in a solid magnetic circuit slow the flux rise appreciably beyond $L/R$.
- **Tag** [F] [A] · **Code** —

### 30-3.9 — Throat Reynolds number

$$Re_t = \frac{\rho^{*} a^{*} D_t}{\mu^{*}}$$

- **Variables** — $\rho^*$, $a^*$, $\mu^*$ density [kg/m³], sonic velocity [m/s] and dynamic viscosity [Pa·s] at throat conditions; $D_t$ [m].
- **Meaning** — the ratio of inertial to viscous transport at the throat; it sets boundary-layer thickness as a fraction of throat radius.
- **Assumes** — choked flow; throat properties from isentropic relations.
- **Fails when** — the flow is not choked; the gas is not adequately ideal (a saturated refrigerant near its vapour dome is not).
- **Tag** [F] · **Code** `reynolds(rho, v, L, mu)`
- **Alias** — 29-3.11.

### 30-3.9b — Micronozzle discharge coefficient

$$C_d \approx 1 - \frac{C}{\sqrt{Re_t}}, \qquad C \approx 2.5\!-\!3.5$$

- **Variables** — $C_d$ [—]; $Re_t$ [—]; $C$ an empirical constant depending on throat radius-of-curvature ratio and wall temperature [—].
- **Meaning** — the displacement thickness of the throat boundary layer shrinks the effective flow area. This is the same functional form ISO 9300 uses for critical-flow venturi nozzles.
- **Assumes** — laminar throat boundary layer; smooth wall; axisymmetric throat.
- **Fails when** — the throat boundary layer transitions (higher $Re_t$, rough wall); $Re_t \lesssim 300$, where the whole flow is viscous-dominated and no boundary-layer decomposition is valid.
- **Tag** [E] [A] · **Code** —
- **Alias** — 29-3.12 uses $a \approx 5$ for the same form; the constants differ because the geometries differ. Pick one and say which.

### 30-3.10 — Vapour-pressure sensitivity

$$\frac{d \ln p_v}{dT} = \frac{\Delta H_\mathrm{vap}}{R T^2} \quad\Rightarrow\quad \frac{\Delta p_v}{p_v} \approx \frac{\Delta H_\mathrm{vap}}{R T}\,\frac{\Delta T}{T}$$

- **Variables** — $p_v$ vapour pressure [Pa]; $\Delta H_\mathrm{vap}$ molar enthalpy of vaporisation [J/mol]; $R = 8.31446$ J/(mol·K); $T$ [K].
- **Meaning** — vapour pressure is exponential in temperature, with sensitivity set by the latent heat. For a saturated-liquid cold-gas system the feed pressure *is* the vapour pressure, so a few kelvin of spacecraft temperature swing is a large thrust swing.
- **Assumes** — $\Delta H_\mathrm{vap}$ constant over the interval; ideal vapour; incompressible liquid.
- **Fails when** — near the critical point, where $\Delta H_\mathrm{vap} \to 0$ and the relation collapses. Relevant for CO₂ (critical 304.1 K) and xenon (289.7 K), both of which are **supercritical or nearly so at room temperature** and must not be modelled as saturated liquids there.
- **Tag** [F] [A] · **Code** —
- **Alias** — 28-3.9 on a mass basis with $R$ in J/(kg·K).

---

## Module 31 — Real Cold-Gas Systems

### 31-3.1 — Total impulse and Tsiolkovsky

$$I_t = I_{sp}\, g_0\, m_p \qquad\text{and}\qquad \Delta v = I_{sp}\, g_0 \ln\!\frac{m_0}{m_0-m_p}$$

- **Variables** — $I_t$ total impulse [N·s]; $I_{sp}$ [s]; $g_0 = 9.80665$ m/s²; $m_p$ expelled propellant mass [kg]; $m_0$ initial total mass of everything being accelerated [kg]; $\Delta v$ [m/s].
- **Meaning** — the first is the definition of $I_{sp}$; the second is Tsiolkovsky. Together they are the five-line audit of any published cold-gas specification.
- **Assumes** — a single impulsive burn; constant $I_{sp}$; no external forces; and — the assumption that actually breaks — that $m_0$ is *the mass the published $\Delta v$ referred to*.
- **Fails when** — the manoeuvre is a long low-thrust burn against gravity gradient or drag; $I_{sp}$ varies over a blowdown (it does, by 5–15 %); the thrusters fire in opposing pairs for attitude control, consuming propellant with zero net $\Delta v$.
- **Tag** [F] [A] · **Code** `tsiolkovsky_dv(isp, m0, mf)`, `propellant_for_dv(isp, m_final, dv)`
- **Alias** — 05-3.1, 26-3.1, 26-3.3.

### 31-3.2 — Small-mass-ratio $\Delta v$

$$\Delta v \approx \frac{I_t}{m_0} = \frac{I_{sp}\,g_0\,m_p}{m_0}$$

- **Variables** — as 31-3.1.
- **Meaning** — for small mass ratios, $\Delta v$ is just total impulse divided by the mass being pushed — a mental-arithmetic first pass.
- **Assumes** — $m_p/m_0 \ll 1$.
- **Fails when** — $m_p/m_0 \gtrsim 0.2$, where it under-predicts by more than 10 %. For every system in this module $m_p/m_0 < 0.15$, so it is good to a few percent. **Use it for the first pass and 31-3.1 when writing the number down.**
- **Tag** [A] [J] · **Code** —

### 31-3.3 — $I_{sp}$ scales as $\sqrt{T_0/M}$

$$I_{sp} \propto \sqrt{\frac{T_0}{M}}$$

- **Variables** — $T_0$ plenum stagnation temperature [K]; $M$ molar mass [kg/kmol].
- **Meaning** — a cold-gas thruster's performance is set almost entirely by what the gas weighs, because $T_0$ is fixed at whatever the spacecraft happens to be.
- **Assumes** — ideal gas; frozen flow; same $\gamma$ and same $\varepsilon$ across the comparison.
- **Fails when** — $\gamma$ differs substantially — polyatomic refrigerants at $\gamma \approx 1.08$ have a noticeably higher $C_F$ than diatomics at 1.40, clawing back part of the molar-mass penalty; the gas is heated, which breaks the "cold" in cold gas.
- **Tag** [F] [A] · **Code** —
- **Alias** — 04-3.2 for the hot-gas version.

### 31-3.4 — Impulse per unit propellant volume

$$\frac{I_t}{V} = \rho\, I_{sp}\, g_0$$

- **Variables** — $I_t/V$ [N·s/m³]; $\rho$ stored density at the storage state [kg/m³]; $I_{sp}$ [s].
- **Meaning** — this, not $I_{sp}$, is the figure of merit for a volume-limited vehicle.
- **Assumes** — the whole stored mass is usable (it is not; multiply by $\eta_u$); the tank volume equals the propellant volume (it does not — wall, boss and mounting add volume and, more importantly, mass).
- **Fails when** — tank mass is comparable to propellant mass, which for high-pressure gas at CubeSat scale it always is.
- **Tag** [F] [A] · **Code** `density_isp(rho, isp)`
- **Alias** — 28-3.18, 29-3.4.

### 31-3.5 — The 0.90 rule

$$I_{sp,\ \mathrm{real}} \approx 0.90\; I_{sp,\ \mathrm{ideal}}$$

- **Variables** — $I_{sp}$ [s].
- **Meaning** — a well-designed steady-flow cold-gas thruster delivers about 90 % of its frozen-ideal specific impulse.
- **Assumes** — steady flow; a nozzle large enough that the boundary layer does not dominate the throat; a plenum at ambient spacecraft temperature.
- **Fails when** — **the thruster is pulsed. This is the single most important caveat in the chapter** — pulsed delivery can fall to half the ideal.
- **Tag** [E] · **Code** —
- **Alias** — 28-3.12.

### 31-3.6 — Trapezoidal impulse bit

$$I_{bit} \approx F\left(t_{on} - \tfrac{1}{2}t_{rise} + \tfrac{1}{2}t_{fall}\right)$$

- **Variables** — $I_{bit}$ [N·s]; $F$ steady thrust [N]; $t_{on}$ commanded valve-open time [s]; $t_{rise}$, $t_{fall}$ valve opening and closing transient durations [s].
- **Meaning** — the trapezoidal approximation to a pulse.
- **Assumes** — the thruster reaches steady flow within the pulse, i.e. $t_{on} \gg t_{rise}$.
- **Fails when** — $t_{on}$ approaches $t_{rise}$ — precisely the regime micronewton-resolution systems operate in. There the impulse bit is dominated by the transient and **must be characterised by test, not computed.**
- **Tag** [A] [J] · **Code** `impulse_bit(F, t_on, t_rise, t_fall)`
- **Alias** — 28-3.13, 29-3.20.

### 31-5.1 — Tank mass from the performance factor

$$m_{tank} \approx \frac{p V}{g_0\,(pV/W)}$$

- **Variables** — $m_{tank}$ [kg]; $p$ design pressure [Pa]; $V$ internal volume [m³]; $pV/W$ tank performance factor [m]; $g_0$ [m/s²].
- **Meaning** — for a membrane pressure vessel, wall mass scales with the stored $pV$ product, so $pV/W$ is nearly constant across sizes for a given material and design.
- **Assumes** — membrane-dominated design at the stated burst factor.
- **Fails when** — **at small scale**, where minimum gauge, the boss and the liner dominate and the achieved $pV/W$ collapses — exactly the CubeSat regime.
- **Tag** [F] [A] · **Code** —
- **Alias** — 12-3.6, 30-3.2.

---

# Part V — Cross-system (modules 32–36)

## Module 32 — Liquid vs Solid vs Cold Gas

### 32-3.1 — Specific impulse factorisation

$$I_{sp} = \frac{c^{*}C_F}{g_0},\qquad c^{*}=\frac{\sqrt{R T_c}}{\Gamma}
= \frac{1}{\Gamma}\sqrt{\frac{R_u T_c}{\mathcal{M}}}$$

- **Variables** — $c^*$ [m/s]; $C_F$ [—]; $T_c$ chamber temperature [K]; $\mathcal{M}$ exhaust molar mass [kg/kmol]; $R_u = 8314.46$ J/(kmol·K); $\Gamma$ [—].
- **Meaning** — everything the propellant contributes enters through $\sqrt{T_c/\mathcal{M}}$; everything the nozzle contributes enters through $C_F$. This one equation explains the whole liquid/solid/cold-gas $I_{sp}$ ranking: 450 s, 265 s, 70 s.
- **Assumes** — 1-D flow; chemically frozen or shifting equilibrium as declared; calorically perfect; no condensed phase.
- **Fails when** — the exhaust carries a condensed phase (solids); the gas is not calorically perfect (cold refrigerants near saturation); boundary layers are a large fraction of the throat (µN thrusters).
- **Tag** [F] · **Code** `c_star(...)`, `Cf(...)`, `isp_from_c(c_eff(...))`
- **Alias** — 03-3.10, 04-3.1, 19-3.4, 28-3.11.

### 32-3.2 — Thrust

$$F = C_F\,p_c A_t = \dot m\, c$$

- **Variables** — $F$ [N]; $C_F$ [—]; $p_c$ [Pa]; $A_t$ [m²]; $\dot m$ [kg/s]; $c$ effective exhaust velocity [m/s].
- **Meaning** — thrust is a pressure–area product, or equivalently a momentum flux. Both readings are needed: the first explains why solids scale to meganewtons cheaply, the second why cold gas cannot.
- **Assumes** — choked throat; quasi-1-D flow.
- **Fails when** — the transitional and slip-flow regimes where $Re_t \lesssim 10^3$; unchoked operation at end-of-blowdown.
- **Tag** [F] · **Code** `thrust(...)`, `Cf(...)`

### 32-3.3 — Density impulse (volumetric form)

$$I_v = \rho_b\,I_{sp}\,g_0 \quad[\mathrm{N\,s/m^3}]$$

- **Variables** — $\rho_b$ bulk propellant density at the flight mixture ratio [kg/m³]; $I_{sp}$ [s]; $g_0 = 9.80665$ m/s².
- **Meaning** — total impulse obtainable from one cubic metre of propellant; the metric on which solids beat liquids and butane beats nitrogen.
- **Assumes** — the tank volume is dominated by propellant — false for cold gas, where the tank *wall* is the mass.
- **Fails when** — tank mass, not propellant mass, closes the design.
- **Tag** [F] · **Code** `density_isp(rho, isp)` (differs by $g_0$)
- **Alias** — 05-3.3 and 19-3.5 omit $g_0$; 28-3.18, 29-3.4, 31-3.4 include it. State which.

### 32-3.4 — Bulk density of a propellant pair

$$\rho_b = \frac{1+O\!/\!F}{\dfrac{O\!/\!F}{\rho_{ox}}+\dfrac{1}{\rho_{f}}}$$

- **Variables** — $O\!/\!F$ mixture ratio [—]; $\rho_{ox}$, $\rho_f$ densities at storage temperature [kg/m³].
- **Meaning** — the density of the propellant *pair* as loaded, which is what sizes tanks.
- **Assumes** — no ullage; no residuals.
- **Fails when** — the tanks are not sized to the flight mixture ratio (deliberate propellant bias).
- **Tag** [F] · **Code** —
- **Alias** — 05-3.2, identical with $r$ for $O\!/\!F$.

### 32-3.5 — Tank mass from the performance factor

$$m_{tank} = \frac{pV}{g_0\,(pV/W)}$$

- **Variables** — $p$ operating pressure [Pa]; $V$ internal volume [m³]; $pV/W$ tank performance factor [m], 5 000 m for a conservative metallic vessel to 15 000 m for a flight COPV.
- **Meaning** — tank mass is proportional to stored *energy*, not to stored mass.
- **Assumes** — membrane-mode stress; no boss or mount mass.
- **Fails when** — small tanks, where minimum gauge and boss mass dominate.
- **Tag** [E] · **Code** —
- **Alias** — 12-3.6, 22-3.10, 30-3.2, 31-5.1.

### 32-3.6 — Solid-motor equilibrium pressure

$$p_c = \left(a\,\rho_p\,c^{*}\,K_n\right)^{1/(1-n)},\qquad K_n = A_b/A_t$$

- **Variables** — as 19-3.3.
- **Meaning** — restated in the comparison context because it is the reason a solid cannot be throttled or shut down: pressure is fixed by geometry that is itself being consumed.
- **Assumes** — $n < 1$ for stable equilibrium; quasi-steady burning; no erosive burning.
- **Fails when** — during the ignition transient; erosive burning at high port Mach number; near burnout with slivers.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)`

### 32-3.7 — Zero-failure reliability lower bound

$$p_L = \alpha^{1/n}\qquad(f=0)$$

- **Variables** — $\alpha = 1 -$ confidence [—]; $n$ trials [—]; $p_L$ reliability lower bound [—].
- **Meaning** — the smallest reliability consistent with observing $n$ consecutive successes at the stated confidence. It is why "0.999 reliability" claims for low-flight-count systems are assertions, not demonstrations.
- **Assumes** — independent, identically distributed trials with a single binary outcome.
- **Fails when** — trials are not independent (a common-cause manufacturing lot); the configuration changed mid-record; "success" is defined after the fact.
- **Tag** [F] · **Code** —
- **Alias** — 27-3.7, identical with $C = 1-\alpha$ and $N = n$.

### 32-3.8 — Propellant mass with a mass-model closure

$$m_p = \frac{(m_{pay}+m_{fix})\left(e^{\Delta v/c}-1\right)}{1-k\left(e^{\Delta v/c}-1\right)}$$

- **Variables** — $m_{pay}$ everything that is not the propulsion system [kg]; $m_{fix}$ fixed inert mass [kg]; $k$ variable inert fraction [—]; $c = I_{sp}g_0$ [m/s]; $\Delta v$ [m/s].
- **Meaning** — solves the rocket equation and the mass-model equation simultaneously; the only honest way to compare propulsion classes.
- **Assumes** — a single impulsive burn; $k$ constant with scale.
- **Fails when** — **$k(e^{\Delta v/c}-1) \ge 1$: the denominator goes to zero or negative and no finite propellant mass closes the design.** That is a physical statement, not an algebra artefact — each extra kilogram of propellant drags in more than a kilogram of tank.
- **Tag** [F] · **Code** —

### 32-3.9 — $\Delta v$ ceiling of a propulsion class

$$\Delta v_{max} = c\,\ln\!\left(1+\frac{1}{k}\right)$$

- **Variables** — $c = I_{sp}g_0$ [m/s]; $k$ variable inert fraction [—].
- **Meaning** — the asymptotic $\Delta v$ ceiling of a propulsion class at infinite mass; the hard boundary that 32-3.8 approaches.
- **Assumes** — $m_{fix}$ negligible.
- **Fails when** — used as a design target. Approaching it means an absurd mass; the practical ceiling is far below.
- **Tag** [F] · **Code** —

### 32-3.10 — Break-even total impulse between two classes

$$I_t^{*} = \frac{m_{fix,2}-m_{fix,1}}{\dfrac{1+k_1}{I_{sp,1}g_0}-\dfrac{1+k_2}{I_{sp,2}g_0}}$$

- **Variables** — subscript 1 the lighter-fixed-mass, lower-$I_{sp}$ class (cold gas); 2 the heavier-fixed-mass, higher-$I_{sp}$ class (monopropellant); $I_t^*$ [N·s].
- **Meaning** — the total impulse at which the higher-performing class's fixed mass is paid back. Below it, cold gas wins on mass; above it, it does not.
- **Assumes** — both $k$ values scale-independent; both classes can meet the non-mass requirements.
- **Fails when** — the fixed masses are themselves functions of total impulse, which is true at the extremes.
- **Tag** [F] · **Code** —

---

## Module 33 — Systems Engineering for Propulsion

### 33-3.1 — Gimbal control moment and lateral force

$$M_c = F\,L\,\sin\delta \qquad\text{and}\qquad F_{lat} = F\sin\delta$$

- **Variables** — $M_c$ control moment about the vehicle cg [N·m]; $F$ engine thrust [N]; $L$ distance from gimbal plane to cg [m]; $\delta$ gimbal angle [rad]; $F_{lat}$ lateral force at the gimbal plane [N].
- **Meaning** — gimballing converts a fraction of thrust into a control moment, and the thrust structure must react the lateral component. $F_{lat}$, not $M_c$, sizes the thrust structure.
- **Assumes** — rigid vehicle; thrust line through the gimbal point; single engine or symmetric cluster.
- **Fails when** — the vehicle is flexible enough that a bending mode couples with the control loop (the classic TVC/bending interaction); the engine's own centre-of-mass offset from the gimbal point adds an inertial term during rapid gimballing.
- **Tag** [F] · **Code** —
- **Alias** — 24-3.16 for the axial-loss counterpart.

### 33-3.2 — Feed-system resonance (pogo)

$$f_{feed} = \frac{1}{2\pi}\sqrt{\frac{1}{I\,C}}, \qquad I = \frac{\rho \ell}{A}$$

- **Variables** — $f_{feed}$ [Hz]; $I$ line inertance [kg/m⁴]; $C$ compliance [m³/Pa]; $\rho$ propellant density [kg/m³]; $\ell$ line length [m]; $A$ line flow area [m²].
- **Meaning** — the feed line is a mass–spring system whose "mass" is the propellant column and whose "spring" is whatever is compressible — trapped gas, line elasticity, or a deliberate accumulator. The pogo fix is to *detune* it by adding compliance.
- **Assumes** — lumped parameters; a single dominant compliance; incompressible liquid elsewhere; no distributed wave effects.
- **Fails when** — line length approaches a quarter acoustic wavelength; the pump inducer cavitates (cavitation compliance is nonlinear and flow-dependent); two lines interact.
- **Tag** [F] [A] · **Code** —
- **Alias** — 15-3.7, identical.

### 33-3.3 — Gimbal authority requirement

$$F\,L\,\sin\delta_{req} \ge M_{dist} = F\,e + M_{aero} + M_{misc}$$

- **Variables** — $\delta_{req}$ required gimbal angle [rad]; $L$ gimbal-plane-to-cg arm [m]; $e$ effective thrust misalignment [m]; $M_{aero}$ aerodynamic moment from angle of attack and wind [N·m]; $M_{misc}$ engine-out asymmetry, slosh, cg lateral offset [N·m].
- **Meaning** — **gimbal authority is sized by disturbances, not by steering.** Note the thrust cancels in the misalignment term: a bigger engine does not help against its own misalignment.
- **Assumes** — rigid body; a single gimballed engine; small angles.
- **Fails when** — multiple engines share the load unequally; the vehicle is flexible (bending modes need extra authority and rate); the disturbance is dynamic rather than quasi-static.
- **Tag** [F] [J] · **Code** —

### 33-3.4 — Impulse bit, rate change, limit-cycle period

$$I_{bit} = F\,t_{min}, \qquad \Delta\omega = \frac{I_{bit}\,r}{J}, \qquad
T_{limit} = \frac{4\,\theta_{db}}{\Delta\omega}$$

- **Variables** — $I_{bit}$ [N·s]; $F$ [N]; $t_{min}$ minimum on-time [s]; $\Delta\omega$ rate change per pulse [rad/s]; $J$ inertia about the control axis [kg·m²]; $r$ moment arm [m]; $\theta_{db}$ half-width of the attitude deadband [rad]; $T_{limit}$ limit-cycle period [s].
- **Meaning** — the impulse bit sets how finely the controller can hold attitude and therefore how much propellant a limit cycle costs per orbit.
- **Assumes** — pure couple; rigid body; no external torque; symmetric deadband; pulse duration negligible against the limit cycle.
- **Fails when** — external torques (gravity gradient, drag, solar pressure) dominate, in which case propellant use is set by the torque, not the deadband; the pulse is so short the thruster never reaches steady state and $I_{bit}$ is neither $Ft_{min}$ nor repeatable.
- **Tag** [F] · **Code** `impulse_bit(F, t_on, t_rise, t_fall)`
- **Alias** — 28-3.15 gives the propellant-consumption form.

### 33-3.5 — NPSH requirement with margin

$$\mathrm{NPSH}_a = \frac{p_t - p_v - \Delta p_{line}}{\rho\,g_0} + \frac{z\,a}{g_0}
\ge k_{NPSH}\,\mathrm{NPSH}_r$$

- **Variables** — as 12-3.15, plus $k_{NPSH}$ the required margin factor [—], typically 1.5 on head or an equivalent absolute margin.
- **Meaning** — the pump inlet must sit a stated head above the point at which propellant boils. This inequality is the tank–engine interface requirement: it sets tank ullage pressure and hence tank mass.
- **Assumes** — steady flow; uniform bulk temperature; no vapour ingestion; no thermal stratification.
- **Fails when** — the surface layer is warmer than the bulk (stratification raises the effective $p_v$ at the surface, but the relevant $p_v$ is at the *inlet* temperature — get this backwards and you will over- or under-pressurise the tank); sloshing uncovers the outlet; the acceleration is not aligned with $z$.
- **Tag** [F] [J] · **Code** `npsh_available(...)`, `suction_specific_speed_SI(...)`
- **Alias** — 05-3.9, 12-3.15.

### 33-3.6 — First slosh mode frequency

$$\omega_1^2 = \frac{1.841\,a}{R}\tanh\!\left(\frac{1.841\,h}{R}\right)$$

- **Variables** — $\omega_1$ first slosh mode angular frequency [rad/s]; $a$ axial acceleration [m/s²]; $R$ tank radius [m]; $h$ liquid depth [m]; 1.841 is the first zero of $J_1'$ [—].
- **Meaning** — the free surface behaves as a pendulum whose frequency scales as $\sqrt{a/R}$. If it lands near a control-loop or bending frequency, the vehicle can go unstable.
- **Assumes** — right circular cylinder; inviscid liquid; small amplitude; flat-bottomed geometry; no baffles.
- **Fails when** — amplitude is large (the mode goes nonlinear and can rotate); the tank is a sphere or has a domed bottom; baffles are present — which is the point of baffles, since they add damping without much changing frequency.
- **Tag** [F] [A] · **Code** —
- **Alias** — the 1.841 (or 1.8412) Bessel root also appears in 06-3.15, 15-3.9, 18-3.14, 20-3.13 for the 1T acoustic mode.

### 33-3.7 — Weighted trade-study score

$$S_j = \sum_{i=1}^{n} w_i\,s_{ij}, \qquad \sum_i w_i = 100$$

- **Variables** — $S_j$ total score of option $j$ [—]; $w_i$ weight of criterion $i$ [—]; $s_{ij}$ score of option $j$ on criterion $i$, relative to the datum [—].
- **Meaning** — a linear scalarisation of a multi-objective problem.
- **Assumes** — criteria are independent; preferences are linear in each score; trade-offs between criteria are constant (one point of mass is always worth the same amount of schedule).
- **Fails when** — any of those is false, which is usually — and especially when one criterion has a hard threshold, in which case **it is a constraint and does not belong in the sum.**
- **Tag** [J] · **Code** —

### 33-3.8 — $\Delta v$ sensitivity to $I_{sp}$

$$\frac{\partial \Delta v}{\partial I_{sp}} = g_0\ln\frac{m_0}{m_f} = \frac{\Delta v}{I_{sp}}
\quad\Longrightarrow\quad \frac{\delta(\Delta v)}{\Delta v} = \frac{\delta I_{sp}}{I_{sp}}$$

- **Variables** — $m_0$, $m_f$ initial and final mass [kg]; $I_{sp}$ [s]; $\Delta v$ [m/s].
- **Meaning** — **$\Delta v$ is exactly as sensitive to specific impulse in relative terms as it is possible to be**: a 1 % $I_{sp}$ shortfall is a 1 % $\Delta v$ shortfall, always, at any mass ratio.
- **Assumes** — the propellant load is fixed (a real vehicle whose tanks are already full).
- **Fails when** — the comparison is made at fixed $\Delta v$ instead; a lower $I_{sp}$ then demands exponentially more propellant and the sensitivity is much worse than 1:1.
- **Tag** [F] · **Code** —

### 33-3.9 — $\Delta v$ sensitivity to dry mass

$$\frac{\partial \Delta v}{\partial m_d} = c\left(\frac{1}{m_0}-\frac{1}{m_f}\right) = -\,c\,\frac{m_p}{m_0\,m_f}$$

- **Variables** — $c = I_{sp}g_0$ [m/s]; $m_p = m_0 - m_f$ usable propellant [kg]; $m_d$ dry mass [kg].
- **Meaning** — added inert mass costs $\Delta v$ in proportion to the propellant mass fraction: brutal on a stage with a large mass ratio, mild on one with a small ratio.
- **Assumes** — propellant load fixed.
- **Fails when** — the added mass forces a propellant offload (volume-limited stage), which makes it worse; the stage is resized around it, which is a different calculation entirely.
- **Tag** [F] · **Code** —

### 33-3.10 — $\Delta v$ sensitivity to residuals

$$\frac{\partial \Delta v}{\partial m_{res}} = -\frac{c}{m_f}$$

- **Variables** — $m_{res}$ unusable residual propellant [kg]; $c$ [m/s]; $m_f$ [kg].
- **Meaning** — a kilogram left in the tank costs strictly more than a kilogram of dry mass, because it was carried the whole way and delivered no impulse.
- **Assumes** — $m_0$ fixed (the propellant was loaded).
- **Fails when** — the residual is known in advance and simply not loaded, in which case it behaves like 33-3.9.
- **Tag** [F] · **Code** —

### 33-3.11 — $\Delta v$ uncertainty propagation

$$\sigma_{\Delta v} = \sqrt{\sum_k \left(\frac{\partial \Delta v}{\partial x_k}\right)^2 \sigma_{x_k}^2}$$

- **Variables** — $\sigma_{x_k}$ standard deviation of input $k$; $\sigma_{\Delta v}$ [m/s].
- **Meaning** — first-order propagation of independent uncertainties, using the sensitivities of 33-3.8 to 33-3.10.
- **Assumes** — independence; small perturbations so the model is locally linear; inputs meaningfully described by a standard deviation.
- **Fails when** — inputs are correlated ($I_{sp}$ and mixture ratio are; dry mass and residuals often are, because a heavier stage has more line volume); the distribution is skewed or bounded (**mass growth is one-sided — hardware rarely comes in light**); a term is large enough that curvature matters.
- **Tag** [F] [J] · **Code** `rss(*terms)`
- **Alias** — 18-3.19.

---

## Module 34 — Failure Case Studies

### 34-3.1 — WLF time–temperature shift factor

$$\log_{10} a_T = \frac{-C_1 (T - T_g)}{C_2 + (T - T_g)} , \qquad \tau(T) = a_T\,\tau(T_{\text{ref}})$$

- **Variables** — $a_T$ shift factor [—]; $T$ [K]; $T_g$ glass transition temperature [K]; $C_1 \approx 17.44$, $C_2 \approx 51.6$ K the "universal" WLF constants referenced to $T_g$.
- **Meaning** — every viscoelastic response time of a polymer scales by the same factor $a_T$, so **a seal that recovers in seconds at room temperature can take hours 25 K colder.** This is the quantitative heart of the Challenger O-ring failure and of every cold-temperature elastomer problem in this course.
- **Assumes** — amorphous polymer; thermorheological simplicity; $T_g < T < T_g + 100$ K.
- **Fails when** — the polymer crystallises, is highly filled, or is chemically aged; outside that temperature window, where $a_T$ diverges unphysically. The universal constants are a fallback — a real material is fitted.
- **Tag** [E] · **Code** —
- **Alias** — the physics behind 22-3.7 and 24-3.17.

### 34-5.1 — Pressure signature of an area fault

$$\frac{p_2}{p_1} = \left(\frac{A_{b,2}/A_{b,1}}{A_{t,2}/A_{t,1}}\right)^{1/(1-n)},
\qquad \frac{1}{1-n} = \frac{1}{0.65} = 1.5385$$

- **Variables** — $A_b$ burning area [m²]; $A_t$ throat area [m²]; $n$ [—]; $p$ [Pa].
- **Meaning** — area errors are amplified by $1/(1-n)$ in pressure; reading a pressure–time trace backwards is how solid-motor faults are diagnosed. A grain crack raises $A_b$; a nozzle washout raises $A_t$; the two move pressure in opposite directions.
- **Assumes** — quasi-steady; unchanged $c^*$; choked nozzle.
- **Fails when** — the area change is faster than the chamber filling time $V_c/(c^*A_t)$, typically 10–50 ms, in which case the transient overshoots.
- **Tag** [F] · **Code** `solid_equilibrium_pressure(...)` at both states
- **Alias** — 20-3.14, 23-3.6, 24-3.10.

### 34-5.2 — Stored energy of a burst vessel

$$E = \frac{pV}{\gamma-1}\left[1 - \left(\frac{p_a}{p}\right)^{(\gamma-1)/\gamma}\right]$$

- **Variables** — $E$ available work [J]; $p$, $V$ vessel pressure [Pa] and volume [m³]; $\gamma$ [—]; $p_a$ ambient pressure [Pa].
- **Meaning** — the mechanical work a burst vessel can do on its surroundings; the number behind COPV hazard analysis and pad keep-out zones.
- **Assumes** — ideal gas; isentropic; no heat transfer during the burst.
- **Fails when** — $Z \neq 1$ (helium at 380 bar and 90 K has $Z \approx 1.2$, so this *underestimates* the mass and hence the energy by roughly that factor); the burst is slow enough to be near-isothermal, which gives more energy.
- **Tag** [A] · **Code** —
- **Alias** — 18-3.3, identical.

### 34-5.3 — Rotating-cavitation excitation frequency

$$f_{\text{exc}} = (\lambda - 1)\,\Omega$$

- **Variables** — $\lambda$ propagation ratio [—]; $\Omega$ shaft frequency [Hz]; $f_{\text{exc}}$ blade excitation frequency [Hz].
- **Meaning** — super-synchronous rotating cavitation loads the blade at the *difference* frequency, which is small compared with shaft speed but still hundreds of hertz — enough to accumulate millions of high-cycle-fatigue cycles in a short burn.
- **Assumes** — a single dominant propagating cell.
- **Fails when** — multiple cells or cavitation surge (an axial, roughly system-synchronous mode) dominate instead.
- **Tag** [F] · **Code** —

---

## Module 35 — Historical Evolution

### 35-5.1 — Exponential chamber-pressure trend

$$\ln p_c = a + k\,t,\qquad k = 0.04725\ \mathrm{yr^{-1}},\qquad t_{2} = \frac{\ln 2}{k} = 14.7\ \mathrm{yr}$$

- **Variables** — $p_c$ chamber pressure [bar]; $t$ calendar year; $k$ fitted exponential rate [1/yr]; $t_2$ doubling time [yr].
- **Meaning** — the frontier chamber pressure of flown engines has doubled roughly every 15 years, from the V-2's 15 bar to the RD-170's 250 bar.
- **Assumes** — the frontier is a single exponential process.
- **Fails when** — the process is bounded, which it is: material temperature capability, cooling, and turbomachinery power all impose ceilings, and the trend has visibly flattened since the 1980s. **A fitted exponential extrapolated past its physical limit is the standard way historical trend analysis lies.**
- **Tag** [E] [J] · **Code** —

### 35-5.2 — Thrust coefficient (for the $I_{sp}$ decomposition)

$$C_F = \sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]} + \frac{p_e-p_a}{p_c}\varepsilon$$

- **Variables** — $c^*$ [m/s]; $R$ specific gas constant [J/(kg·K)]; $T_0$ chamber stagnation temperature [K]; $\mathcal{M}$ molar mass [kg/kmol]; $\gamma$ [—]; $\varepsilon = A_e/A_t$ [—]; $p_a$ [Pa]; $\eta$ lumped $c^*$ efficiency [—].
- **Meaning** — used with $c^* = \sqrt{RT_0}/\Gamma$ to decompose the V-2 → RD-180 specific-impulse gain into its causes: propellant chemistry, chamber pressure, expansion ratio, and combustion efficiency. The answer is that most of the gain came from $\varepsilon$ and $p_c$, not from chemistry.
- **Assumes** — calorically perfect gas; frozen composition; isentropic attached flow; 1-D exit.
- **Fails when** — the exit is separated; real-gas effects are understated. Use CEA for design.
- **Tag** [F] [A] · **Code** `Cf(gamma, eps, p0, pa)`, `c_star(gamma, R, T0)`
- **Alias** — 03-3.9, 29-3.10.

### 35-5.3 — Solid-motor mass fraction versus year

$$\zeta = b_0 + b_1 t,\qquad b_1 = 3.98\times10^{-4}\ \mathrm{yr^{-1}} = 0.004\ \text{per decade},\qquad R^2 = 0.059$$

- **Variables** — $\zeta$ propellant mass fraction [—]; $t$ calendar year; $b_1$ slope [1/yr]; $R^2$ coefficient of determination [—].
- **Meaning** — ordinary least squares on flown motors. **$R^2 = 0.059$ says the year explains 5.9 % of the variance — essentially none.** Solid mass fraction is set by motor size and mission class, not by date; this is the module's negative result and it is deliberate.
- **Assumes** — year is the explanatory variable.
- **Fails when** — read as a trend at all. Quote the $R^2$ whenever you quote the slope; a slope without its $R^2$ is an assertion.
- **Tag** [E] [J] · **Code** —

---

## Module 36 — Modern Engineering Methods

### 36-3.1 — Grid convergence index

$$\mathrm{GCI}_{\text{fine}} = \frac{F_s\,\lvert \epsilon_{21}\rvert}{r^{\,p}-1},\qquad \epsilon_{21}=\frac{\phi_2-\phi_1}{\phi_1},\qquad r=\frac{h_2}{h_1}$$

- **Variables** — $\phi_1, \phi_2$ the quantity of interest on the fine and coarse grids [any unit]; $h$ representative cell size [m]; $r$ refinement ratio [—]; $p$ observed order of accuracy [—]; $F_s$ safety factor [—], 1.25 with three grids, 3 with two.
- **Meaning** — an error band on the fine-grid answer expressed as a percentage; the standard way to report that a CFD result is grid-converged.
- **Assumes** — the grids are in the **asymptotic range**, i.e. the error is already dominated by the leading truncation term; the solution is smooth; the refinement is uniform.
- **Fails when** — the three grid answers are not monotone (very common in separated or reacting flow); the observed $p$ comes out negative or far above the scheme's formal order; limiters and shock capturing make the scheme locally first-order.
- **Tag** [F] for the estimator, [J] for the safety factor · **Code** —

### 36-3.2 — Constrained Gibbs minimisation

$$\min_{n_j}\ G=\sum_j n_j\left(\mu_j^\circ(T)+R_uT\ln\frac{n_j p}{n_{\text{tot}}p^\circ}\right)\quad\text{s.t.}\quad \sum_j a_{ij}n_j=b_i$$

- **Variables** — $n_j$ moles of species $j$ [kmol]; $\mu_j^\circ$ standard chemical potential [J/kmol] from the NASA polynomial fits; $a_{ij}$ atoms of element $i$ in species $j$ [—]; $b_i$ total moles of element $i$ [kmol]; $R_u = 8314.46$ J/(kmol·K); $p^\circ$ standard pressure.
- **Meaning** — chemical equilibrium is the composition of lowest free energy consistent with the atoms you put in. **This is literally what CEA solves.**
- **Assumes** — ideal-gas mixture (with optional condensed phases); infinite residence time; uniform state; and critically, that every relevant species is *in the species list*.
- **Fails when** — chemistry is slow relative to the flow (recombination freeze in a nozzle); the mixture is not uniform (every real injector); real-gas effects matter (dense LOX near the injector); a species that should have been included was not.
- **Tag** [F] · **Code** —
- **Alias** — 01-3.14, 04-3.5 for the polynomial.

### 36-3.3 — Engine balance, quasi-steady form

$$\dot m_{\text{total}} = \frac{p_c A_t}{c^*(r,p_c)}$$

- **Variables** — as Modules 12–13; $H$ pump head [m]; $N$ shaft speed [rad/s]; $\eta_p$, $\eta_t$ efficiencies [—]; $\Pi$ turbine pressure ratio [—]; $c^*$ [m/s] interpolated from an equilibrium table; $r$ mixture ratio [—].
- **Meaning** — the engine's operating point is the simultaneous solution of "everything that must add up": choked-throat flow, pump and turbine maps, line and injector resistances, and the cycle power balance of 13-3.3.
- **Assumes** — quasi-steady flow; lumped components; incompressible pumps; no distributed dynamics; maps valid at the operating point.
- **Fails when** — any element is choked in a way the map does not represent; two-phase flow appears (chill-down, cavitation, coolant boiling); the pump operates far off its map; any transient faster than the component filling times.
- **Tag** [F] for the conservation statements, [E] for the maps · **Code** `choked_mdot`, `pump_power`, `turbine_power`

### 36-3.4 — Transient lumped-parameter model

$$L\frac{d\dot m}{dt} = A\,(p_1-p_2) - \Delta p_{\text{loss}},\qquad I\frac{dN}{dt}=\frac{P_{\text{turb}}-P_{\text{pump}}}{N}$$

- **Variables** — $V$ lumped volume [m³]; $\rho$ [kg/m³]; $e$ specific internal energy [J/kg]; $L = \ell/A$ line inertance [1/m]; $I$ rotor polar inertia [kg·m²]; $N$ shaft speed [rad/s]; $P$ powers [W].
- **Meaning** — mass, energy and momentum storage in every volume and line, plus rotor spin-up: the model that predicts a start transient.
- **Assumes** — 1-D lines; lumped volumes small compared with the acoustic wavelength of interest; a valid equation of state (usually REFPROP/NIST for cryogens).
- **Fails when** — acoustic behaviour matters (this model cannot represent a chamber acoustic mode); the volume is not well-mixed; two-phase flow needs a real slip model rather than homogeneous equilibrium.
- **Tag** [F] · **Code** —

### 36-3.5 — Marched regenerative-channel model

$$q = \frac{T_{aw}-T_{c}}{\dfrac{1}{h_g}+\dfrac{t_w}{k_w}+\dfrac{1}{\eta_f h_c}},\qquad \dot m_c c_p \frac{dT_c}{dx}=q\,P_{\text{heated}},\qquad \frac{dp_c}{dx}=-f\frac{\rho u^2}{2D_h}$$

- **Variables** — $t_w$ wall thickness [m]; $k_w$ wall conductivity [W/(m·K)]; $h_c$ coolant-side coefficient [W/(m²·K)] from a Dittus–Boelter-type correlation; $\eta_f$ fin efficiency of the channel rib [—]; $P_{\text{heated}}$ heated perimeter per unit length [m]; $f$ Darcy friction factor [—]; $D_h$ [m]; $T_c$ coolant bulk temperature [K].
- **Meaning** — a series thermal resistance at every axial station, marched downstream with the coolant's energy and momentum equations. This is how every regenerative jacket is actually sized.
- **Assumes** — 1-D conduction through the wall; circumferentially uniform gas-side flux; fully developed single-phase coolant; correlations valid at the local state.
- **Fails when** — the coolant is near-critical (methane at 100–200 bar is *not* near-critical, hydrogen at 40 bar is); there is a circumferential streak; curvature or secondary flows matter; the channel is not straight; nucleate or film boiling appears.
- **Tag** [F] for the resistance network, [E] for every correlation in it · **Code** `heat_flux`, `wall_dT`, `dittus_boelter`, `coolant_bulk_rise`
- **Alias** — 10-3.6, 11-3.4/3.6/3.7/3.10.

### 36-3.6 — Reacting species transport

$$\frac{\partial(\rho Y_k)}{\partial t}+\nabla\!\cdot(\rho\mathbf{u}Y_k)=\nabla\!\cdot(\rho D_k\nabla Y_k)+\dot\omega_k$$

- **Variables** — $\rho$ [kg/m³]; $\mathbf{u}$ [m/s]; $p$ [Pa]; $\boldsymbol{\tau}$ viscous stress [Pa]; $Y_k$ mass fraction of species $k$ [—]; $D_k$ diffusivity [m²/s]; $\dot\omega_k$ net chemical production rate [kg/(m³·s)].
- **Meaning** — the Navier–Stokes equations with reacting species; the governing system every combustion CFD code discretises.
- **Assumes** — continuum ($Kn \ll 1$ — true everywhere in a chamber, not true in the far plume of a cold-gas thruster); Newtonian fluid; Fickian diffusion.
- **Fails when** — the equation of state is wrong (dense supercritical injection); radiation is a significant energy path (soot-forming propellants); the species set is inadequate.
- **Tag** [F] · **Code** —

### 36-3.7 — DNS cell-count scaling

$$N_{\text{cells}}\sim\left(\frac{L}{\eta_K}\right)^{3}\sim Re_L^{9/4}$$

- **Variables** — $L$ integral length scale [m]; $\eta_K$ Kolmogorov length [m]; $Re_L = uL/\nu$ [—].
- **Meaning** — resolving every eddy costs the cube of the scale separation. This is why DNS of a full rocket chamber is and will remain impossible, and why turbulence modelling exists.
- **Assumes** — homogeneous isotropic turbulence scaling; a wall-bounded flow is worse.
- **Fails when** — combustion adds a flame thickness smaller than $\eta_K$, which it often does; the estimate is then not even a bound.
- **Tag** [F] · **Code** —

### 36-3.8 — Boussinesq hypothesis and the SST eddy viscosity

$$-\overline{\rho u_i'u_j'} = \mu_t\left(\frac{\partial \bar u_i}{\partial x_j}+\frac{\partial \bar u_j}{\partial x_i}-\frac{2}{3}\frac{\partial \bar u_k}{\partial x_k}\delta_{ij}\right)-\frac{2}{3}\rho k\,\delta_{ij},\qquad \mu_t=\frac{\rho a_1 k}{\max(a_1\omega,\;S F_2)}$$

- **Variables** — $\mu_t$ turbulent viscosity [Pa·s]; $k$ turbulent kinetic energy [m²/s²]; $\omega$ specific dissipation rate [1/s]; $S$ strain-rate magnitude [1/s]; $a_1 = 0.31$ [—]; $F_2$ blending function [—].
- **Meaning** — turbulent momentum transport is represented as a large extra viscosity aligned with the mean strain.
- **Assumes** — local equilibrium of turbulence production and dissipation; alignment of the Reynolds stress tensor with the mean strain tensor.
- **Fails when** — the flow has strong streamline curvature, strong swirl, significant rotation, large separated regions, or strong density gradients — **i.e. in every one of the flows a rocket injector produces.**
- **Tag** [E] [J] — a *calibrated* model, not a derived one · **Code** —

### 36-3.9 — Presumed-PDF flamelet closure

$$\tilde\phi = \int\!\!\int \phi(Z,C)\,\tilde P(Z)\,\tilde P(C)\,dZ\,dC$$

- **Variables** — $\phi$ any thermochemical quantity; $Z$ mixture fraction [—]; $C$ progress variable [—]; $\tilde P$ presumed sub-filter PDFs (usually a beta function for $Z$, a delta or beta for $C$).
- **Meaning** — replaces an expensive chemistry integration with a table lookup and a presumed-PDF convolution; the reason combustion CFD is affordable at all.
- **Assumes** — thin flame ($Ka < 1$); unity-ish Lewis numbers; statistical independence of $Z$ and $C$; equilibrium of the flame structure with local strain.
- **Fails when** — the flame is thickened by turbulence ($Ka > 1$); during ignition and extinction (transient flamelets); for partially premixed and multi-stream problems — **a staged-combustion chamber has *three* streams (main oxidiser, main fuel, preburner gas) and a single $Z$ cannot describe three streams**; and near walls.
- **Tag** [E] [A] · **Code** —

### 36-3.10 — Lagrangian droplet drag and evaporation

$$m_d\frac{d\mathbf{u}_d}{dt}=\frac{1}{2}C_D\rho_g A_d\lvert\mathbf{u}_g-\mathbf{u}_d\rvert(\mathbf{u}_g-\mathbf{u}_d)+m_d\mathbf{g},\qquad \frac{dm_d}{dt}=-\pi d\,\rho_g D\,\mathrm{Sh}\,\ln(1+B_M)$$

- **Variables** — $m_d$ droplet mass [kg]; $d$ diameter [m]; $C_D$ drag coefficient [—]; $A_d$ frontal area [m²]; Sh Sherwood number [—]; $B_M$ Spalding mass-transfer number [—]; $D$ diffusivity [m²/s].
- **Meaning** — a droplet is a point that feels drag and evaporates, exchanging mass, momentum and energy with the gas cell it occupies. The $\ln(1+B_M)$ is the same Spalding factor as the $d^2$ law of 07-3.14.
- **Assumes** — dilute spray (droplets do not see each other); spherical drops much smaller than the cell; a subcritical droplet with a distinct surface; a known initial droplet size distribution.
- **Fails when** — the spray is dense near the injector — **it always is, and the region where breakup actually happens is precisely where the dilute assumption is invalid**; the drop is supercritical (no surface, no latent heat — the whole formulation collapses); the cell size is comparable to the drop.
- **Tag** [E] [A] · **Code** —
- **Alias** — 07-3.14, 07-3.15.

### 36-3.11 — Method of characteristics compatibility relation

$$\theta \pm \nu(M) = \text{const along } C_\mp,\qquad \nu(M)=\sqrt{\frac{\gamma+1}{\gamma-1}}\arctan\!\sqrt{\frac{\gamma-1}{\gamma+1}(M^2-1)}-\arctan\!\sqrt{M^2-1}$$

- **Variables** — $\theta$ flow angle [rad]; $\nu$ Prandtl–Meyer function [rad]; $M$ [—]; $\gamma$ [—].
- **Meaning** — in supersonic irrotational flow, $\theta \pm \nu$ is constant along characteristic lines, which turns contour design into a marching algebra problem. It is still the right tool for a nozzle contour; RANS is for checking it.
- **Assumes** — steady; supersonic throughout; irrotational; isentropic; calorically perfect (or a corrected $\gamma$); no viscosity.
- **Fails when** — shocks appear inside the nozzle; the transonic throat region (handled by a separate transonic start line); the flow separates; the boundary layer is thick.
- **Tag** [F] · **Code** —
- **Alias** — 02-3.19 gives $\nu(M)$ alone.

### 36-3.12 — Conjugate heat transfer interface conditions

$$T_{g,\text{wall}}=T_{s,\text{wall}},\qquad -k_g\left.\frac{\partial T}{\partial n}\right|_g=-k_s\left.\frac{\partial T}{\partial n}\right|_s$$

- **Variables** — $k_g$, $k_s$ gas and solid conductivity [W/(m·K)]; $n$ wall-normal coordinate [m].
- **Meaning** — **the wall temperature is an *output* of the coupled problem, not an input to a decoupled one.** This is the modern replacement for guessing $T_{wg}$ and iterating.
- **Assumes** — no contact resistance (a real issue at braze joints and AM part-to-part interfaces); all three domains resolved adequately.
- **Fails when** — the thermal time constants of the three domains differ by orders of magnitude and the coupling scheme is not designed for it (gas-side response microseconds, wall conduction milliseconds, coolant bulk tens of milliseconds); the coupling is under-relaxed to the point of a converged-looking but unconverged answer.
- **Tag** [F] · **Code** —

### 36-3.13 — Bartz correlation (as a CFD sanity check)

$$h_g=\frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{Pr^{0.6}}\right)_0\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{r_c}\right)^{0.1}\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

- **Variables** — as 10-3.4; $\sigma$ property-variation correction [—].
- **Meaning** — a Dittus–Boelter-type turbulent pipe correlation reshaped for a nozzle. Its role in a modern workflow is as the **order-of-magnitude check on a conjugate-CFD result**: if the CFD disagrees with Bartz by more than a factor of ~1.5 at the throat, suspect the CFD.
- **Assumes** — attached turbulent boundary layer; chamber-stagnation properties; no film cooling; no injector-driven maldistribution.
- **Fails when** — those hold poorly. The original paper calls it a *rapid estimate*; the honest band is ±20–30 % at the throat and worse elsewhere.
- **Tag** [E] · **Code** `bartz_hg(...)`, `bartz_sigma(...)`
- **Alias** — 10-3.4, 24-3.3.

### 36-3.14 — Elastic thermal stress (as a plasticity index)

$$\sigma_{\text{th}}=\frac{E\,\alpha\,\Delta T}{2(1-\nu)}$$

- **Variables** — $E$ [Pa]; $\alpha$ [1/K]; $\Delta T$ through-thickness temperature drop [K]; $\nu$ [—].
- **Meaning** — a fully constrained wall with a linear through-thickness gradient. In a modern workflow its only use is to tell you *how far* into plasticity you are before running the nonlinear analysis.
- **Assumes** — elastic; fully constrained; linear gradient; temperature-independent properties.
- **Fails when** — immediately: for a copper liner at a 250 K gradient it predicts stresses far above yield, so the real answer is plastic.
- **Tag** [F] as a bound, [A] as an answer · **Code** `thermal_stress_hoop(E, alpha, dT, nu)`
- **Alias** — 10-3.8, 11-3.14, 16-3.2.

### 36-3.15 — Coffin–Manson low-cycle fatigue

$$\frac{\Delta\varepsilon_p}{2}=\varepsilon_f'\,(2N_f)^{c}$$

- **Variables** — $\Delta\varepsilon_p$ plastic strain range [—]; $\varepsilon_f'$ fatigue ductility coefficient [—]; $c$ fatigue ductility exponent [—], typically −0.5 to −0.7; $N_f$ cycles to failure [—].
- **Meaning** — log-linear relation between plastic strain amplitude and life; the acceptance criterion for a reusable chamber liner.
- **Assumes** — isothermal, uniaxial, fully reversed cycling on the material the coefficients were measured on; no creep, no environment, no mean stress.
- **Fails when** — the cycle is thermomechanical rather than isothermal (TMF is materially worse at the same strain range); hold-time creep interacts; the environment attacks the surface — **hydrogen blanching of copper liners is precisely this**; the material is not the coupon material, which for an AM liner it is not.
- **Tag** [E] · **Code** —
- **Alias** — 16-3.6, identical.

### 36-3.16 — Multidisciplinary design optimisation statement

$$\min_{\mathbf{x}}\ f(\mathbf{x},\mathbf{y})\quad\text{s.t.}\quad \mathbf{g}(\mathbf{x},\mathbf{y})\le0,\quad \mathbf{h}(\mathbf{x},\mathbf{y})=0,\quad \mathbf{y}=\mathbf{Y}(\mathbf{x},\mathbf{y})$$

- **Variables** — $\mathbf{x}$ design variables; $\mathbf{y}$ coupling variables (outputs of one discipline that are inputs to another); $\mathbf{g}$, $\mathbf{h}$ inequality and equality constraints.
- **Meaning** — the last equation is what makes it *multidisciplinary*: the coupling variables must be self-consistent, a fixed-point problem nested inside the optimisation.
- **Assumes** — disciplinary analyses are deterministic, reasonably smooth, and cheap enough to call many times.
- **Fails when** — an analysis is noisy (CFD with a convergence tolerance is a noisy function); discontinuous (a design change that switches which constraint is active); or takes hours, in which case surrogates are needed.
- **Tag** [F] as a statement, [J] as a practice · **Code** —

### 36-3.17 — Topology optimisation (SIMP compliance minimisation)

$$\min_{\boldsymbol\rho}\ C=\mathbf{u}^\mathsf{T}\mathbf{K}(\boldsymbol\rho)\mathbf{u}\quad\text{s.t.}\quad \mathbf{K}(\boldsymbol\rho)\mathbf{u}=\mathbf{f},\quad \sum_e \rho_e v_e \le V^{*}$$

- **Variables** — $\rho_e$ element pseudo-density [—]; $p$ penalisation exponent [—]; $C$ compliance [J]; $v_e$ element volume [m³]; $V^*$ volume budget [m³].
- **Meaning** — penalisation makes intermediate densities structurally inefficient, so the optimiser drives elements to 0 or 1 and a discrete shape emerges. This is what produces the organic-looking AM brackets and manifolds.
- **Assumes** — linear elasticity; a single load case (or a weighted set); stiffness as the objective.
- **Fails when** — the real driver is strength, buckling, fatigue or a thermal gradient rather than stiffness. Compliance minimisation will happily produce thin members that buckle or notch-sensitive junctions that crack. Also mesh-dependent and prone to checkerboarding without a density filter of radius $r_{\min}$, which then sets the minimum feature size.
- **Tag** [F] [E] · **Code** —

### 36-3.18 — Gaussian-process surrogate

$$\hat\mu(\mathbf{x}_*)=\mathbf{k}_*^\mathsf{T}(\mathbf{K}+\sigma_n^2\mathbf{I})^{-1}\mathbf{y},\qquad \hat\sigma^2(\mathbf{x}_*)=k(\mathbf{x}_*,\mathbf{x}_*)-\mathbf{k}_*^\mathsf{T}(\mathbf{K}+\sigma_n^2\mathbf{I})^{-1}\mathbf{k}_*$$

- **Variables** — $\mathbf{K}$ the $n\times n$ covariance matrix of training inputs; $\mathbf{k}_*$ covariance vector between $\mathbf{x}_*$ and the training points; $\sigma_n^2$ observation noise; $\mathbf{y}$ training outputs.
- **Meaning** — the prediction is a weighted average of nearby observations, and the variance grows as you move away from data — which is what makes it usable for design-of-experiments and Bayesian optimisation.
- **Assumes** — the chosen kernel's smoothness and stationarity are appropriate; the data is noise-consistent.
- **Fails when** — the function has a discontinuity or sharp regime change (a stationary kernel cannot represent it); dimensionality is high (>15–20 without structure); and importantly, **the variance estimate is only valid *under the assumed kernel*, so a confidently wrong kernel gives confidently wrong error bars.** Cost is $O(n^3)$ to fit.
- **Tag** [F] [E] · **Code** —

### 36-3.19 — Monte Carlo estimator and its standard error

$$\hat\mu=\frac{1}{N}\sum_{i=1}^{N}f(\mathbf{x}_i),\qquad \mathrm{SE}(\hat\mu)=\frac{\hat\sigma}{\sqrt{N}}$$

- **Variables** — $N$ sample count [—]; $\hat\sigma$ sample standard deviation of the output.
- **Meaning** — the estimate's own error falls as $N^{-1/2}$ **independent of dimension**, which is why Monte Carlo beats quadrature above about five uncertain inputs.
- **Assumes** — independent samples from a correctly specified joint input distribution; the model deterministic and defined everywhere in the sample space.
- **Fails when** — the input distributions are guessed, the usual case — **the answer's credibility is capped by the inputs' credibility**; inputs are correlated and the correlation is ignored; the quantity of interest is a far-tail probability, where $N^{-1/2}$ is ruinously slow and importance sampling or a limit-state method is needed.
- **Tag** [F] · **Code** —

### 36-3.20 — Logarithmic sensitivity propagation

$$\left(\frac{\sigma_f}{f}\right)^2\approx\sum_i\left(\frac{\partial \ln f}{\partial \ln x_i}\right)^2\left(\frac{\sigma_{x_i}}{x_i}\right)^2$$

- **Variables** — logarithmic sensitivities $\partial\ln f/\partial\ln x_i$ [—], which for a product of powers are just the exponents.
- **Meaning** — for a product-of-powers relationship, relative uncertainties add in quadrature weighted by the exponents.
- **Assumes** — linear response over the uncertainty range; independent inputs; an approximately normal output distribution.
- **Fails when** — the model is nonlinear over the input range (an engine balance near a constraint boundary certainly is); a constraint activates; the output distribution is skewed — and it can never produce the tail shape, only a variance.
- **Tag** [F] · **Code** `rel_unc_product(*rel)`, `rel_unc_power(rel, exponent)`
- **Alias** — 18-3.20, identical.

### 36-3.21 — Sobol sensitivity indices

$$S_i=\frac{\mathrm{Var}_{x_i}\!\left(\mathbb{E}[f\mid x_i]\right)}{\mathrm{Var}(f)},\qquad S_{Ti}=1-\frac{\mathrm{Var}_{\mathbf{x}_{\sim i}}\!\left(\mathbb{E}[f\mid \mathbf{x}_{\sim i}]\right)}{\mathrm{Var}(f)}$$

- **Variables** — $\mathbf{x}_{\sim i}$ all inputs except $i$; $S_i$ first-order index [—]; $S_{Ti}$ total index [—].
- **Meaning** — $S_i$ is the fraction of output variance removed by learning $x_i$ exactly; $S_{Ti}$ additionally includes $x_i$'s interactions, so $S_{Ti}-S_i$ measures interaction. This is how you decide which measurement to improve.
- **Assumes** — independent inputs; correlated inputs need a generalised decomposition.
- **Fails when** — inputs are strongly correlated; the indices are then not interpretable.
- **Tag** [F] · **Code** —

---

# VI — Dimensionless groups

Every group below appears somewhere in the course. Each entry gives the
definition, the physical ratio it expresses, the value or range that matters in
propulsion, and where in the course it decides something.

## Fluid dynamics and flow regime

### Mach number

$$M = \frac{V}{a}, \qquad a = \sqrt{\gamma R T}$$

- **Variables** — $V$ local flow speed [m/s]; $a$ local speed of sound [m/s]; $\gamma$ [—]; $R$ [J/(kg·K)]; $T$ *static* temperature [K].
- **Ratio** — inertial to elastic (compressibility) forces; equivalently, kinetic to thermal energy.
- **Where it decides something** — $M = 1$ at the throat is the whole basis of choked flow (02-3.10). Chamber $M \approx 0.1$–0.35 sets the Rayleigh loss (06-3.9). Exit $M$ of 3–5 sets $\varepsilon$ and separation behaviour (02-3.22).
- **Code** `a_sound(gamma, R, T)`, `mach_from_area_ratio(...)`, `mach_from_pressure_ratio(...)`
- ⚠ Uses **static** temperature. Using $T_0$ is a common and large error at high $M$.

### Reynolds number

$$\mathrm{Re} = \frac{\rho V L}{\mu} = \frac{V L}{\nu}$$

- **Variables** — $\rho$ [kg/m³]; $V$ [m/s]; $L$ characteristic length [m]; $\mu$ dynamic viscosity [Pa·s]; $\nu = \mu/\rho$ kinematic viscosity [m²/s].
- **Ratio** — inertial to viscous forces.
- **Where it decides something** — coolant-channel $\mathrm{Re} > 10^4$ validates Dittus–Boelter (11-3.7). Throat $Re_t$ of $10^3$–$10^4$ sets the discharge coefficient and viscous loss of a cold-gas micronozzle (29-3.11, 29-3.12, 30-3.9b). Droplet $\mathrm{Re}_d$ sets the convection correction to evaporation (07-3.15). DNS cost scales as $\mathrm{Re}^{9/4}$ (36-3.7).
- **Code** `reynolds(rho, v, L, mu)`
- **Alias** — $L$ is $D_h$ in channels, $D_t$ at a throat, $d$ for a droplet or jet. Always state it.

### Weber number

$$\mathrm{We} = \frac{\rho V^2 L}{\sigma}$$

- **Variables** — $\rho$ [kg/m³] (gas density for $\mathrm{We}_g$, liquid for $\mathrm{We}_l$); $V$ [m/s] (relative velocity for $\mathrm{We}_g$); $L$ [m]; $\sigma$ surface tension [N/m].
- **Ratio** — aerodynamic disruptive force to surface-tension restoring force.
- **Where it decides something** — primary atomization regime (07-3.10). Droplet $\mathrm{We}_g \gtrsim 12$ means secondary breakup rather than evaporation (07-3.15). Cold-flow simulant similarity is normally matched on We, not Re (18-3.5).
- **Code** `weber(rho, v, L, sigma)`
- ⚠ Collapses entirely above the propellant's critical pressure, where $\sigma \to 0$ — the regime of a LOX post in a 200+ bar staged-combustion chamber.

### Ohnesorge number

$$\mathrm{Oh} = \frac{\mu_l}{\sqrt{\rho_l \sigma L}} = \frac{\sqrt{\mathrm{We}_l}}{\mathrm{Re}}$$

- **Variables** — $\mu_l$ liquid dynamic viscosity [Pa·s]; $\rho_l$ [kg/m³]; $\sigma$ [N/m]; $L$ [m].
- **Ratio** — viscous damping of surface waves to surface-tension restoring force. Note it contains no velocity: it is a property of the *liquid and the length scale*, not of the flow.
- **Where it decides something** — large Oh means the liquid resists breakup and produces ligaments rather than drops (07-3.11); it separates the breakup regimes on the classical Ohnesorge–Reynolds map.
- **Code** `ohnesorge(mu, rho, sigma, L)`

### Knudsen number

$$\mathrm{Kn} = \frac{\lambda_{mfp}}{L}$$

- **Variables** — $\lambda_{mfp}$ molecular mean free path [m]; $L$ characteristic length [m].
- **Ratio** — molecular mean free path to flow scale; the validity test for the continuum assumption.
- **Where it decides something** — $\mathrm{Kn} \lesssim 0.01$ is required for continuum CFD (36-3.6). It is violated in micronozzles below ~20 µm throat, at plenum pressures below ~0.1 bar (29-3.11), and always in the far plume of a cold-gas thruster. Above $\mathrm{Kn} \approx 0.1$ the correct tool is DSMC, not Navier–Stokes.
- **Code** —

### Strouhal number

$$\mathrm{St} = \frac{f L}{V} \qquad\Longleftrightarrow\qquad f_s = \mathrm{St}\,\frac{v}{q}$$

- **Variables** — $f$ shedding or oscillation frequency [Hz]; $L$ characteristic length [m]; $V$ velocity [m/s]. In the bellows form, $q$ is the convolution pitch [m].
- **Ratio** — a dimensionless frequency: how many oscillation cycles occur in one flow-transit time.
- **Where it decides something** — vortex shedding over bellows convolutions and the high-cycle fatigue that follows (14-3.16). The fix — an internal liner — removes the flow from the convolutions entirely.
- **Code** —

## Heat and mass transfer

### Prandtl number

$$\mathrm{Pr} = \frac{c_p \mu}{k} = \frac{\nu}{\alpha_d}$$

- **Variables** — $c_p$ [J/(kg·K)]; $\mu$ [Pa·s]; $k$ thermal conductivity [W/(m·K)]; $\nu$ [m²/s]; $\alpha_d$ thermal diffusivity [m²/s].
- **Ratio** — momentum diffusivity to thermal diffusivity; the relative thickness of the velocity and thermal boundary layers. A fluid property, not a flow property.
- **Values** — ~0.7 for combustion gases; 0.6–160 is the Dittus–Boelter validity band; near-critical hydrogen and methane leave it violently.
- **Where it decides something** — the $\mathrm{Pr}^{-0.6}$ in Bartz (10-3.4); the $\mathrm{Pr}^{0.4}$ in Dittus–Boelter (11-3.7); the recovery factor $r \approx \mathrm{Pr}^{1/3} \approx 0.9$ turbulent, $\mathrm{Pr}^{1/2}$ laminar (10-3.1).
- **Code** —

### Nusselt number

$$\mathrm{Nu} = \frac{h L}{k} \qquad\text{e.g.}\qquad \mathrm{Nu} = 0.023\,\mathrm{Re}^{0.8}\mathrm{Pr}^{n}$$

- **Variables** — $h$ convective heat-transfer coefficient [W/(m²·K)]; $L$ characteristic length [m], usually $D_h$; $k$ *fluid* thermal conductivity [W/(m·K)].
- **Ratio** — convective to conductive heat transfer at the wall; equivalently, the dimensionless temperature gradient at the surface.
- **Where it decides something** — every convective correlation in the course is a Nu correlation in disguise: Dittus–Boelter (11-3.7), Sieder–Tate (11-3.8), Bartz (10-3.4), the Lenoir–Robillard erosive-burning term (20-3.11), and the roughness enhancement of 17-3.8.
- **Code** `dittus_boelter(k, D, Re, Pr, n)`
- ⚠ $k$ is the *fluid* conductivity. Using the wall's is a classic error.

### Biot number

$$\mathrm{Bi} = \frac{h L_c}{k_s}$$

- **Variables** — $h$ external film coefficient [W/(m²·K)]; $L_c$ characteristic solid dimension [m], typically thickness or volume/area; $k_s$ *solid* thermal conductivity [W/(m·K)].
- **Ratio** — external convective resistance to internal conductive resistance in the *solid*. The mirror image of Nu, which uses the fluid conductivity.
- **Where it decides something** — $\mathrm{Bi} \ll 0.1$ validates the lumped-capacitance heat-sink wall (11-3.2). For copper at $t_w \sim 20$ mm and $h_g \sim 10^4$ W/(m²·K), $\mathrm{Bi} \approx 0.5$ — marginal, and the front face runs hotter than lumped analysis says. $\mathrm{Bi} \ll 0.1$ also validates the slug calorimeter (18-3.6) and the lumped thermocouple bead (18-3.15).
- **Code** —

### Fourier number

$$\mathrm{Fo} = \frac{\alpha_d t}{L^2}, \qquad \alpha_d = \frac{k}{\rho c}$$

- **Variables** — $\alpha_d$ thermal diffusivity [m²/s]; $t$ time [s]; $L$ characteristic length [m].
- **Ratio** — dimensionless time for transient conduction: how far the thermal wave has penetrated relative to the body size.
- **Where it decides something** — the semi-infinite solutions of 10-3.9, 23-3.3 and 24-3.6 are valid only while $\mathrm{Fo} \lesssim 0.05$–0.1, i.e. while the back face has not felt the pulse. Beyond that the wall heats bodily and the heat-sink survival time of 10-3.10 no longer applies. It is also the parameter that separates the $\sqrt{t}$ char-growth regime from the linear-recession regime in insulation sizing.
- **Code** —

### Spalding transfer number

$$B = \frac{c_{p,g}(T_\infty - T_s)}{h_{fg}} \quad(\text{thermal}), \qquad B_M = \frac{Y_{F,s}-Y_{F,\infty}}{1-Y_{F,s}} \quad(\text{mass})$$

- **Variables** — $c_{p,g}$ film specific heat [J/(kg·K)]; $T_\infty$, $T_s$ far-field and surface temperature [K]; $h_{fg}$ latent heat [J/kg]; $Y_F$ fuel mass fraction [—].
- **Ratio** — driving potential for evaporation to the energy (or mass) needed to evaporate.
- **Where it decides something** — the $\ln(1+B)$ in the $d^2$ evaporation law (07-3.14) and in the Lagrangian droplet mass equation (36-3.10).
- **Code** —

## Turbomachinery

### Specific speed

$$N_s = \frac{\omega\sqrt{Q}}{(g_0 H)^{3/4}}$$

- **Variables** — $\omega$ [rad/s]; $Q$ volumetric flow per stage per flow path [m³/s]; $H$ head rise per stage [m]; $g_0$ [m/s²].
- **Ratio** — a dimensionless shape parameter: it selects the machine type. Low $N_s$ → radial centrifugal, high $N_s$ → axial.
- **Where it decides something** — the first choice in any turbopump layout (12-3.14).
- **Code** `specific_speed_SI(omega, Q, H)`
- ⚠ **US practice uses $N_s = N\sqrt{Q}/H^{3/4}$ with rpm, US gpm and feet — larger than the SI dimensionless value by a factor of 2733.** A number near 1 is dimensionless; a number near 2000 is US. Never mix them.

### Suction specific speed

$$N_{ss} = \frac{\omega\sqrt{Q}}{(g_0\,\mathrm{NPSH})^{3/4}}$$

- **Variables** — as above with NPSH [m] in place of $H$.
- **Ratio** — how hard the inlet can suck before cavitating; the figure of merit for an inducer.
- **Values (SI dimensionless)** — 2–3 plain impeller, no inducer; 4–6 with a modest inducer; 7–10 a well-designed rocket inducer; >10 claimed on some hydrogen inducers exploiting thermodynamic suppression.
- **Where it decides something** — sets $\mathrm{NPSH}_r$ and therefore tank ullage pressure and tank mass (12-3.16, 33-3.5).
- **Code** `suction_specific_speed_SI(omega, Q, NPSH)`
- ⚠ Same 2733 factor to the US form. Also: NPSH at 3 % head loss is *not* NPSH at incipient cavitation (2–3× higher) and *not* NPSH free of rotating cavitation (higher still).

## Propulsion-specific groups

### Vandenkerckhove function $\Gamma$

$$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

- **Values** — 0.6247 at $\gamma = 1.08$; 0.6485 at 1.20; 0.6584 at 1.25; 0.6847 at 1.40; 0.7268 at $\gamma = 5/3$. **It spans only 0.62–0.73 across every gas in this course**, which is why $c^*$ is dominated by $\sqrt{T_0/\mathcal{M}}$ and only weakly by $\gamma$.
- **Where it decides something** — choked mass flow (02-3.10), $c^*$ (03-3.8), residence time (06-3.5), chamber fill time (20-3.8).
- **Code** `gamma_function(gamma)`

### Thrust coefficient $C_F$ and expansion ratio $\varepsilon$

$$C_F = \frac{F}{p_c A_t}, \qquad \varepsilon = \frac{A_e}{A_t}, \qquad \varepsilon_c = \frac{A_c}{A_t}$$

- **Values** — $C_F$ 1.3–1.6 sea level, 1.7–2.0 vacuum at moderate $\varepsilon$; theoretical vacuum maximum $\sqrt{2\gamma^2/(\gamma-1)\cdot(2/(\gamma+1))^{(\gamma+1)/(\gamma-1)}} \approx 2.25$ at $\gamma = 1.2$. $\varepsilon$ 5–40 for first stages, 40–300 for upper stages. $\varepsilon_c$ 2–6.
- **Code** `Cf(gamma, eps, p0, pa, pe)`, `area_ratio(gamma, Mach)`

### Mixture ratio, equivalence ratio, $K_n$

$$r = O\!/\!F = \frac{\dot m_{ox}}{\dot m_f}, \qquad \phi = \frac{r_{st}}{r}, \qquad K_n = \frac{A_b}{A_t}$$

- **Where it decides something** — $r$ sets $T_c$ and $\mathcal{M}$ and hence $c^*$ (04-3.3). $K_n$ is the entire geometric input to solid-motor equilibrium pressure (19-3.3); it typically runs 150–400 for APCP.
- ⚠ $\phi > 1$ is fuel-rich; $r > r_{st}$ is oxidiser-rich. Rocket practice runs fuel-rich of the $T_c$ peak because $\mathcal{M}$ falls faster than $T_c$.

### Cavitation number

$$K = \frac{p_1 - p_v}{p_1 - p_2} \qquad\text{(injector, 07-3.3)}, \qquad \sigma = \frac{p_1 - p_v}{p_1 - p_2} \qquad\text{(valve, 14-3.6)}$$

- ⚠ Several definitions circulate — some use $(p_2-p_v)/(p_1-p_2)$, others the reciprocal. **State which you are using.** Note $\sigma$ here is a cavitation index, not stress and not the Bartz property correction.

### Stokes number

$$\mathrm{Stk} = \frac{\tau_v u}{L_c}, \qquad \tau_v = \frac{\rho_p d_p^2}{18\mu}$$

- **Ratio** — particle response time to flow time. $\mathrm{Stk} \ll 1$: particles follow the gas. $\mathrm{Stk} \gtrsim 1$: they fly straight and impinge.
- **Where it decides something** — alumina impingement on submerged solid-nozzle noses and the two-phase $I_{sp}$ lag (24-3.5).

### Larson–Miller and WLF shift

$$P_{LM} = T(C + \log_{10}t_r) \qquad\text{(16-3.4)}, \qquad \log_{10}a_T = \frac{-C_1(T-T_g)}{C_2 + (T-T_g)} \qquad\text{(34-3.1)}$$

- Both are time–temperature equivalence parameters: the first for metal creep rupture, the second for polymer viscoelastic response. Both fail the same way — by extrapolation past a change of mechanism.

---

# VII — Constants and conversions

## Defined constants used throughout

| symbol | value | unit | note |
|---|---|---|---|
| $g_0$ | 9.80665 | m/s² | **exactly**; a defined unit conversion in $I_{sp}$, *not* local gravity |
| $R_u$ | 8314.46 | J/(kmol·K) | course default; `rocket.RU` |
| $R_u$ | 8.31446 | J/(mol·K) | same constant, per-mole basis — used in 25-3.5 and 30-3.10 |
| $\sigma_{SB}$ | $5.670\times10^{-8}$ | W/(m²·K⁴) | Stefan–Boltzmann |
| $F$ (Faraday) | 96 485 | C/mol | electroforming, 17-3.4 |
| $\mu_0$ | $4\pi\times10^{-7}$ | H/m | solenoid force, 30-3.7 |
| $p^\circ$ | 1 | bar = $10^5$ Pa | thermochemical standard state |
| $T^\circ$ | 298.15 | K | thermochemical reference |
| $J_1'$ first zero | 1.8412 | — | first tangential acoustic mode; also written 1.841 in slosh (33-3.6) |

⚠ **Molar basis.** $R_u = 8314.46$ J/(kmol·K) pairs with $\mathcal{M}$ in kg/kmol and $E_a$ in J/kmol; $R_u = 8.31446$ J/(mol·K) pairs with molar quantities in J/mol. Mixing them is a factor-of-1000 error and it looks plausible. Check the exponent on any quoted activation energy.

## Pressure

| from | to | multiply by |
|---|---|---|
| psi | Pa | 6894.757 |
| psi | bar | 0.0689476 |
| bar | Pa | $10^{5}$ (exact) |
| bar | MPa | 0.1 |
| MPa | Pa | $10^{6}$ (exact) |
| MPa | psi | 145.038 |
| atm | Pa | 101 325 (exact) |
| torr | Pa | 133.322 |

Useful anchors: 1 bar ≈ 14.5 psi; 100 bar = 10 MPa ≈ 1450 psi; a 3000 psi bottle is 207 bar; a 10 000 psi COPV is 690 bar.

⚠ **psia versus psig.** US propulsion data is normally psia (absolute). A psig figure is 14.7 psi lower. Chamber pressures are always absolute; some hydraulic and pneumatic schematics are gauge. If a source does not say, and the number is below ~30 psi, suspect gauge.

## Force, mass, length

| from | to | multiply by |
|---|---|---|
| lbf | N | 4.448222 |
| N | lbf | 0.2248089 |
| kgf | N | 9.80665 (exact) |
| lbm | kg | 0.45359237 (exact) |
| kg | lbm | 2.204623 |
| slug | kg | 14.5939 |
| in | mm | 25.4 (exact) |
| in | m | 0.0254 (exact) |
| ft | m | 0.3048 (exact) |
| in² | m² | $6.4516\times10^{-4}$ (exact) |
| in³ | m³ | $1.638706\times10^{-5}$ |
| US gal | m³ | $3.785412\times10^{-3}$ |
| L | m³ | $10^{-3}$ (exact) |

Useful anchors: 1 lbf ≈ 4.45 N, so 1 000 000 lbf ≈ 4.45 MN (F-1 sea-level thrust is 6.77 MN ≈ 1.52 Mlbf); 1 kN ≈ 225 lbf.

## Flow, density, and derived

| from | to | multiply by |
|---|---|---|
| lbm/s | kg/s | 0.45359237 |
| US gpm | m³/s | $6.30902\times10^{-5}$ |
| m³/h | m³/s | $2.7\overline{7}\times10^{-4}$ |
| lbm/in³ | kg/m³ | 27 679.9 |
| lbm/ft³ | kg/m³ | 16.0185 |
| Btu/(lbm·°F) | J/(kg·K) | 4186.8 |
| Btu/(ft²·s) | W/m² | 11 356.5 |
| ksi·√in | Pa·√m | $1.0988\times10^{6}$ |
| ksi | MPa | 6.894757 |
| cP (centipoise) | Pa·s | $10^{-3}$ |
| cSt (centistokes) | m²/s | $10^{-6}$ |

⚠ **Valve coefficients.** $C_v$ and $K_v$ (14-3.3) are unit-bearing empirical indices, not dimensionless. Convert to an effective area before using them anywhere on this sheet: $C_dA\ [\mathrm{m^2}] = 1.698\times10^{-5}\,C_v = 1.963\times10^{-5}\,K_v$ (14-3.4).

⚠ **Burn-rate coefficient.** $a$ in $r = ap^n$ carries the units of the whole law. From the usual mm/s–MPa tabulation to SI: $a_{\mathrm{SI}} = a_{[\mathrm{mm/s,MPa}]}\times10^{-3}\times(10^{-6})^{n}$ (20-3.5). Check whether the source instead writes $r = a(p/p_{ref})^n$, which is a different and safer convention.

⚠ **Pump specific speed.** $N_{s,\mathrm{US}} = 2733\,N_{s,\mathrm{SI}}$, same for $N_{ss}$ (12-3.14, 12-3.16).

## Temperature

$$T[\mathrm{K}] = T[\mathrm{^\circ C}] + 273.15, \qquad
T[\mathrm{^\circ R}] = 1.8\,T[\mathrm{K}], \qquad
T[\mathrm{^\circ F}] = 1.8\,T[\mathrm{^\circ C}] + 32$$

- Rankine is the absolute scale that pairs with Fahrenheit: $T[\mathrm{^\circ R}] = T[\mathrm{^\circ F}] + 459.67$.
- **Temperature *differences*** convert without the offset: $\Delta T[\mathrm{K}] = \Delta T[\mathrm{^\circ C}]$, and $\Delta T[\mathrm{K}] = \Delta T[\mathrm{^\circ R}]/1.8$. This matters for CTE, $\sigma_p$, and every $\Delta T$ on this sheet.
- Anchors: LH2 NBP 20.3 K; LOX NBP 90.2 K; LCH4 NBP 111.7 K; 0 °C = 273.15 K = 491.67 °R; the military storage envelope −54 °C to +71 °C is 219.15 K to 344.15 K.

## $I_{sp}$ unit conventions

| convention | symbol | unit | relation |
|---|---|---|---|
| specific impulse (seconds) | $I_{sp}$ | s | $I_{sp} = F/(\dot m g_0) = c/g_0$ |
| mass-specific impulse | $I_{sp,m}$, $c$ | N·s/kg = m/s | $c = I_{sp}\,g_0$ |
| effective exhaust velocity | $c$ | m/s | identical to $I_{sp,m}$ |
| density impulse (no $g_0$) | $I_d$ | kg·s/m³ | $I_d = \rho I_{sp}$ — 05-3.3, 19-3.5 |
| density impulse (with $g_0$) | $I_v$, $\Lambda$ | N·s/m³ | $I_v = \rho I_{sp} g_0$ — 28-3.18, 29-3.4, 31-3.4, 32-3.3 |
| total impulse | $I_t$ | N·s | $I_t = m_p I_{sp} g_0$ — 26-3.3 |

Rules the course holds to:

- "$I_{sp}$" always means **seconds** unless stated. 1 s of $I_{sp}$ = 9.80665 m/s of $c$.
- Always state the ambient condition: **vacuum** or **sea level**. An unqualified $I_{sp}$ for a real engine is not a number.
- Always state the expansion ratio alongside a vacuum $I_{sp}$; it is meaningless without one.
- Always state the reference method for an *efficiency*: ODE (one-dimensional equilibrium) is the JANNAF convention, and a number quoted against a frozen or kinetic reference is a different number (18-3.9).
- $g_0$ is exact and carries no uncertainty; it therefore contributes nothing to the $I_{sp}$ uncertainty budget (18-3.21).
- ⚠ Two "density impulse" conventions are in use, differing by a factor of $g_0$. Both appear in this course, in the modules noted above. Check units before comparing published figures.

## Chamber-pressure station conventions

Three different stations are all called "$p_c$" in the literature, and they differ
by 2–8 %:

| station | symbol used here | what it is |
|---|---|---|
| injector face | $p_{c,\mathrm{inj}}$, $p_{inj}$ | static pressure at the face, where $u \approx 0$ so it is also the stagnation pressure there |
| nozzle stagnation | $p_{c,\mathrm{ns}}$, $p_{0,t}$, $p_0$ | stagnation pressure at the nozzle entrance, *after* the Rayleigh loss — this is the station $c^*$ is defined against |
| throat static | — | rarely quoted; lower again by the isentropic factor at $M=1$ |

Convert between the first two with 01-3.8 / 06-3.9 / 18-3.10. The correction is
1–2 % for $\varepsilon_c \ge 3$ and grows sharply below $\varepsilon_c = 2$. The
course default is that $p_c$ means the **injector-face** value unless stated,
following `README.md`; but $c^*$ is always referenced to **nozzle stagnation**.
Getting these two crossed inflates $\eta_{c^*}$ by several percent and is the
single most common silent error in reduced test data.
