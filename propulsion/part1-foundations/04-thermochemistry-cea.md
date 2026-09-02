# Module 04 — Thermochemistry and CEA
Part I · Prerequisites: modules 01, 02, 03 · Estimated time: 7 h

Every performance number in Module 03 assumed you were handed $T_0$, $\mathcal{M}$ and
$\gamma$. Nobody hands you those. They come out of a chemical equilibrium calculation,
and the moment you start doing that calculation yourself you discover that the two
things you were taught in freshman chemistry — balance the equation, use the heat of
formation — give an answer several hundred kelvin too hot and an $I_{sp}$ ten to twenty
seconds too high. I have watched a team size a regenerative jacket off a hand-computed
adiabatic flame temperature with dissociation neglected, and then wonder why the test
article did not burn through: they had over-designed by 400 K, which is lucky. The
failure mode in the other direction — picking a mixture ratio off a stoichiometric
calculation because "that is where combustion is complete" — is not lucky. It puts you
1.5 units of O/F away from the optimum, costs you thirty seconds of $I_{sp}$, and melts
your chamber. This module is about getting $T_0$, $\mathcal{M}$ and $\gamma$ right, and
about knowing exactly how much of what NASA CEA prints you are entitled to believe.

---

## 1. Learning objectives

By the end of this module you can:

1. Write and balance the combustion equation for LOX/LH2, LOX/CH4, LOX/RP-1 (as
   CH$_{1.95}$), N$_2$O$_4$/MMH and N$_2$O$_4$/UDMH, and compute the stoichiometric
   mixture ratio by mass for each to three significant figures.
2. Convert between mixture ratio $r$, fuel mass fraction, equivalence ratio $\phi$ and
   oxidizer-to-fuel molar ratio, and explain why rocket engineers use O/F by mass rather
   than $\phi$.
3. Compute an adiabatic flame temperature by hand from heats of formation and a $c_p(T)$
   polynomial, with dissociation neglected, and state the sign and rough size of the
   error you have just committed.
4. Write the equilibrium constant for H$_2$O $\rightleftharpoons$ H$_2$ + ½O$_2$ and for
   OH formation, predict from Le Chatelier which way chamber pressure and mixture ratio
   move the dissociated fraction, and estimate the flame-temperature penalty.
5. Explain, quantitatively, why $I_{sp} \propto \sqrt{T_0/\mathcal{M}}$ drives the
   optimum mixture ratio *fuel-rich* of stoichiometric, and compute how far.
6. State what CEA's "frozen" and "equilibrium" options each assume, which one bounds
   reality from which side, and where the real nozzle sits between them.
7. Read a CEA rocket output block line by line — including `(dLV/dLP)t`, `GAMMAs`,
   `CSTAR`, `CF`, `Ivac` and `Isp` — and use it to size a throat and pick an area ratio.
8. Convert a CEA theoretical $I_{sp}$ into an expected delivered $I_{sp}$ using
   combustion, nozzle and cycle efficiencies, and defend each factor.
9. Name four regimes in which CEA's answer is physically wrong and say what you would
   use instead.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| mixture ratio (O/F) | $r$ | — | oxidizer mass flow divided by fuel mass flow, $\dot m_o/\dot m_f$ |
| stoichiometric mixture ratio | $r_{st}$ | — | the $r$ at which oxidizer exactly consumes fuel to fully oxidised products |
| equivalence ratio | $\phi$ | — | $r_{st}/r$; $\phi>1$ fuel-rich, $\phi<1$ oxidizer-rich |
| fuel mass fraction | $Y_f$ | — | $\dot m_f/(\dot m_o + \dot m_f) = 1/(1+r)$ |
| molar mass of exhaust | $\mathcal{M}$ | kg/kmol | mass-weighted mean molar mass of the product mixture |
| universal gas constant | $R_u$ | J/(kmol·K) | 8314.46 |
| specific gas constant | $R$ | J/(kg·K) | $R_u/\mathcal{M}$ |
| standard enthalpy of formation | $\Delta_f h^\circ$ | J/kmol | enthalpy to form one kmol of species from elements in their reference states at 298.15 K, 1 bar |
| absolute (formation-referenced) enthalpy | $h(T)$ | J/kmol | $\Delta_f h^\circ + \int_{298.15}^{T} c_p\,dT$ |
| molar heat capacity at constant pressure | $c_p$ | J/(kmol·K) | for the frozen mixture unless stated |
| adiabatic flame temperature | $T_{ad}$ | K | product temperature when all reaction enthalpy goes into sensible heat, no heat loss, no work |
| chamber stagnation temperature | $T_0$ | K | $T_{ad}$ at chamber pressure; the combustion temperature used in performance |
| equilibrium constant (pressure basis) | $K_p$ | — | $\prod (p_i/p^\circ)^{\nu_i}$ at equilibrium; $p^\circ = 1$ bar |
| degree of dissociation | $\alpha$ | — | fraction of a species dissociated at equilibrium |
| isentropic exponent (CEA `GAMMAs`) | $\gamma_s$ | — | $-(\partial \ln p/\partial \ln v)_s$; equals $c_p/c_v$ only for an ideal frozen mixture |
| frozen specific-heat ratio | $\gamma_f$ | — | $c_p/c_v$ with composition held fixed |
| volume derivatives | $(\partial\ln V/\partial\ln p)_T$, $(\partial\ln V/\partial\ln T)_p$ | — | CEA's `(dLV/dLP)t`, `(dLV/dLT)p`; measure departure from ideal-mixture behaviour caused by reaction |
| characteristic velocity | $c^*$ | m/s | $p_0 A_t/\dot m$ |
| thrust coefficient | $C_F$ | — | $F/(p_0 A_t)$ |
| area (expansion) ratio | $\varepsilon$ | — | $A_e/A_t$ |
| vacuum specific impulse | $I_{vac}$ | s (or m/s) | $(\dot m v_e + p_e A_e)/(\dot m g_0)$ |
| $c^*$ efficiency | $\eta_{c^*}$ | — | delivered $c^*$ divided by theoretical $c^*$ |
| nozzle (thrust-coefficient) efficiency | $\eta_{C_F}$ | — | delivered $C_F$ divided by theoretical $C_F$ at the same $\varepsilon$ |
| Damköhler number | $Da$ | — | flow residence time divided by chemical time; $Da \gg 1$ equilibrium, $Da \ll 1$ frozen |

---

## 3. Theory

### 3.1 What the thermochemistry has to deliver

Module 03 gave the two results that matter:

$$c^* = \frac{\sqrt{R T_0}}{\Gamma(\gamma)}, \qquad \Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.1** — variables: $c^*$ characteristic velocity (m/s), $R = R_u/\mathcal{M}$
> specific gas constant (J/(kg·K)), $T_0$ chamber stagnation temperature (K), $\gamma$
> ratio of specific heats. Meaning: the throat's ability to convert chamber thermal
> energy into choked mass flux. Assumes: ideal gas, calorically perfect, isentropic,
> one-dimensional, choked throat, uniform chamber. Fails when: composition or $\gamma$
> vary strongly through the throat (they do — see §3.7), or when the gas is
> two-phase. [F]

Substituting $R = R_u/\mathcal{M}$:

$$c^* = \frac{1}{\Gamma(\gamma)}\sqrt{\frac{R_u T_0}{\mathcal{M}}} \;\propto\; \sqrt{\frac{T_0}{\mathcal{M}}}$$

> **Eq. 3.2** — the central result of this module. Everything a propellant chemist can do
> for you is contained in the group $T_0/\mathcal{M}$ and a weak dependence on $\gamma$
> through $\Gamma$, which varies only from about 0.63 to 0.68 across all chemical rocket
> exhausts. Assumes: as Eq. 3.1. [F]

So the thermochemistry has exactly three deliverables: $T_0$, $\mathcal{M}$, and
$\gamma$. Get those and Module 03 does the rest. The rest of this module is the
machinery for getting them, and the honest accounting of how wrong they are.

Notice immediately what Eq. 3.2 says about propellant selection. A hot flame is worth
having, but only as the square root, and it is competing against $\mathcal{M}$ in the
denominator on equal footing. Halving the exhaust molar mass is worth exactly as much as
doubling the flame temperature — and halving the molar mass is much easier. That single
observation explains hydrogen, and it explains why the best mixture ratio is not the one
that burns hottest.

### 3.2 Stoichiometry of real propellant pairs

Stoichiometry is bookkeeping: conserve atoms. The only subtlety in rocketry is that
several real "compounds" are not compounds.

**Hydrogen/oxygen.**

$$2\,\mathrm{H_2} + \mathrm{O_2} \longrightarrow 2\,\mathrm{H_2O}$$

$$r_{st} = \frac{1 \times 31.998}{2 \times 2.016} = 7.936$$

**Methane/oxygen.**

$$\mathrm{CH_4} + 2\,\mathrm{O_2} \longrightarrow \mathrm{CO_2} + 2\,\mathrm{H_2O}$$

$$r_{st} = \frac{2 \times 31.998}{16.043} = 3.989$$

**RP-1/oxygen.** RP-1 is not a compound. It is a narrow-cut, low-aromatic, low-sulphur
kerosene — a mixture of alkanes, cycloalkanes and a little aromatic content, specified
by physical properties and impurity limits rather than by structure. For thermochemistry
it is represented by an *empirical formula* fitted to its measured carbon-to-hydrogen
ratio: conventionally CH$_{1.95}$ to CH$_{1.97}$, occasionally CH$_{1.953}$, with a
heat of formation fitted to its measured heat of combustion. [E] The exact figure varies
between refinery batches and between sources; use the one that comes with the heat of
formation you are using, and do not mix them. Taking CH$_{1.95}$:

$$\mathrm{CH_{1.95}} + 1.4875\,\mathrm{O_2} \longrightarrow \mathrm{CO_2} + 0.975\,\mathrm{H_2O}$$

The O$_2$ coefficient is $1 + x/4$ for CH$_x$: one O$_2$ to make CO$_2$, and $x/4$ to
make $x/2$ waters. With $\mathcal{M}(\mathrm{CH_{1.95}}) = 12.011 + 1.95\times1.008 = 13.977$ kg/kmol,

$$r_{st} = \frac{1.4875 \times 31.998}{13.977} = 3.406$$

**N$_2$O$_4$/MMH.** Monomethylhydrazine, CH$_3$NHNH$_2$ = CH$_6$N$_2$, $\mathcal{M} = 46.073$.
Nitrogen tetroxide $\mathcal{M} = 92.010$ and supplies four oxygen atoms per molecule.
The fuel's own nitrogen leaves as N$_2$ and takes no oxygen with it — this is the whole
attraction of hydrazine-family fuels.

$$\mathrm{CH_6N_2} + 1.25\,\mathrm{N_2O_4} \longrightarrow \mathrm{CO_2} + 3\,\mathrm{H_2O} + 2.25\,\mathrm{N_2}$$

Check: oxygen required is 2 (for CO$_2$) + 3 (for 3 H$_2$O) = 5 atoms, and
$1.25 \times 4 = 5$. Nitrogen: $2 + 2.5 = 4.5$ atoms = 2.25 N$_2$.

$$r_{st} = \frac{1.25 \times 92.010}{46.073} = 2.496$$

**N$_2$O$_4$/UDMH.** Unsymmetrical dimethylhydrazine, (CH$_3$)$_2$NNH$_2$ = C$_2$H$_8$N$_2$,
$\mathcal{M} = 60.100$.

$$\mathrm{C_2H_8N_2} + 2\,\mathrm{N_2O_4} \longrightarrow 2\,\mathrm{CO_2} + 4\,\mathrm{H_2O} + 3\,\mathrm{N_2}$$

Oxygen required: $4 + 4 = 8$ atoms; $2 \times 4 = 8$. ✓

$$r_{st} = \frac{2 \times 92.010}{60.100} = 3.062$$

For completeness, Aerozine-50 (50/50 UDMH/N$_2$H$_4$ by mass — the Titan and Apollo SPS
fuel) requires, per 100 kg: 0.8319 kmol UDMH needing 2 N$_2$O$_4$ each, plus 1.5603 kmol
N$_2$H$_4$ needing 0.5 each, giving 2.4440 kmol = 224.85 kg of oxidizer, so
$r_{st} = 2.249$.

| pair | balanced equation | $r_{st}$ (mass) | typical engine $r$ | $\phi$ at that $r$ |
|---|---|---|---|---|
| LH2/LOX | 2H$_2$ + O$_2$ → 2H$_2$O | **7.936** | 5.0–6.1 | 1.30–1.59 |
| CH$_4$/LOX | CH$_4$ + 2O$_2$ → CO$_2$ + 2H$_2$O | **3.989** | 3.4–3.7 | 1.08–1.17 |
| RP-1/LOX | CH$_{1.95}$ + 1.4875 O$_2$ → CO$_2$ + 0.975 H$_2$O | **3.406** | 2.27–2.72 | 1.25–1.50 |
| MMH/N$_2$O$_4$ | CH$_6$N$_2$ + 1.25 N$_2$O$_4$ → CO$_2$ + 3H$_2$O + 2.25N$_2$ | **2.496** | 1.6–1.9 | 1.31–1.56 |
| UDMH/N$_2$O$_4$ | C$_2$H$_8$N$_2$ + 2N$_2$O$_4$ → 2CO$_2$ + 4H$_2$O + 3N$_2$ | **3.062** | 1.7–1.9 | 1.61–1.80 |

Every flying engine in that table runs fuel-rich. Not one is within 10 % of
stoichiometric. §3.6 is why.

> A warning on the RP-1 row. Two different quantities are called "the stoichiometric O/F
> of kerolox" in the literature: 3.41 (from CH$_{1.95}$) and 3.4–3.5 from other formula
> fits. They are the same number to the precision the propellant specification supports.
> If you see 3.6, someone has used a different empirical formula or included the
> oxidizer's own oxygen twice. [J]

### 3.3 Mixture ratio, equivalence ratio, and why rocket people use O/F

Combustion science runs on the equivalence ratio $\phi = r_{st}/r$, because $\phi$
normalises across fuels: $\phi = 1$ means the same thing for methane and for kerosene.
Rocket engineering runs on $r$ = O/F by mass instead. There are four reasons, and they
are all practical rather than principled. [J]

1. **$r$ is what the hardware sets.** The injector's orifice areas and the pump
   discharge pressures fix a mass flow split. A propellant utilisation valve trims a
   ratio of mass flows. Nobody has ever built a control loop on $\phi$.
2. **$r$ sizes the tanks directly.** Tank volume ratio is $(r/\rho_o) : (1/\rho_f)$.
   Going from $r$ to volumes is one division; going from $\phi$ requires knowing
   $r_{st}$ first.
3. **$r_{st}$ is ill-defined for some propellants.** For RP-1 it depends on an empirical
   formula. For a monopropellant or a solid it may not exist at all. $\phi$ inherits
   every uncertainty in $r_{st}$; $r$ inherits none.
4. **The optimum is nowhere near $\phi = 1$**, so the normalisation buys nothing. In
   air-breathing combustion $\phi = 1$ is a meaningful landmark; in a rocket it is a
   place you deliberately avoid.

Quote $\phi$ when you are talking to a combustion physicist about flame structure,
soot or NO$_x$. Quote $r$ when you are talking to anyone who builds hardware. Know both.

Useful conversions:

$$Y_f = \frac{1}{1+r}, \qquad Y_o = \frac{r}{1+r}, \qquad \phi = \frac{r_{st}}{r}$$

> **Eq. 3.3** — variables: $Y_f$, $Y_o$ fuel and oxidizer mass fractions of the total
> propellant flow (dimensionless). CEA prints `%FUEL` $= 100\,Y_f$. Assumes: nothing;
> these are definitions. Note CEA also prints two equivalence ratios, `R,EQ.RATIO` and
> `PHI,EQ.RATIO`, which coincide for the simple hydrocarbon/hydrogen cases here but
> differ when the propellants contain oxygen or nitrogen in ways that make "how much
> oxidizer is required" ambiguous. [F]

### 3.4 Adiabatic flame temperature from an enthalpy balance

A rocket chamber is, to good approximation, a steady-flow adiabatic reactor at constant
pressure with no shaft work. The first law then says the total enthalpy of the products
equals the total enthalpy of the reactants:

$$\sum_{\text{prod}} n_i\left[\Delta_f h^\circ_i + \int_{298.15}^{T_{ad}} c_{p,i}(T)\,dT\right] \;=\; \sum_{\text{react}} n_j\, h_j(T_j)$$

> **Eq. 3.4** — variables: $n$ kmol of each species per unit basis, $\Delta_f h^\circ$
> standard enthalpy of formation at 298.15 K (J/kmol), $c_p(T)$ molar heat capacity
> (J/(kmol·K)), $T_{ad}$ adiabatic flame temperature (K), $h_j(T_j)$ the absolute
> enthalpy of reactant $j$ *at the temperature and phase it is actually injected in*.
> Meaning: chemical energy released becomes sensible enthalpy of the products.
> Assumes: adiabatic, no shaft work, kinetic energy negligible in the chamber, complete
> mixing, and (in the hand version) a fixed product list. Fails when: the chamber loses
> significant heat to a regenerative jacket (it loses ~0.5–2 % of the total enthalpy, so
> the error is small but not zero), when mixing is incomplete, and — badly — when the
> product list is wrong, which it always is. [F]

Three details that separate a correct hand calculation from a wrong one.

**The reactant enthalpy is not zero for cryogens.** $\Delta_f h^\circ$ of an element in
its reference state is zero *as a gas at 298.15 K*. Liquid oxygen at its normal boiling
point is not that. CEA's own reactant library carries $h = -12{,}979$ kJ/kmol for O$_2$(L)
at 90.17 K and $-9{,}012$ kJ/kmol for H$_2$(L) at 20.27 K — the enthalpy of cooling and
condensing from the gaseous reference state [CEA]. Those are real heat sinks the flame
has to pay for. Ignore them and your LOX/LH2 flame temperature comes out about 250 K too
hot before you have made any other mistake.

**$c_p$ is strongly temperature-dependent.** For H$_2$O, $c_p$ rises from
33.6 kJ/(kmol·K) at 300 K to about 55 kJ/(kmol·K) at 3500 K. A constant-$c_p$
calculation is not an approximation, it is an error. Use tabulated $h(T)-h(298.15)$
[JANAF] or the NASA polynomial form that CEA itself uses:

$$\frac{c_p^\circ(T)}{R_u} = a_1 + a_2 T + a_3 T^2 + a_4 T^3 + a_5 T^4$$

> **Eq. 3.5** — the NASA 7-coefficient polynomial. Variables: $a_i$ species- and
> range-specific fitted coefficients (dimensionless), $T$ in K. CEA uses a 9-coefficient
> extension with two extra inverse-power terms for better low-temperature behaviour
> [RP-1311 Pt. I]. Assumes: ideal gas. Fails when: used outside its fitted temperature
> range — every set carries a range (typically 200–1000 K and 1000–6000 K) and
> extrapolating past the top of the high range is the single most common way to get a
> silently wrong flame temperature. [F]

**Do not carry more digits than the heats of formation support.** $\Delta_f h^\circ$ for
H$_2$O(g) is $-241.826$ MJ/kmol to about ±0.04 %; for RP-1 the fitted value is good to
perhaps ±1 %, which is ±30 K on flame temperature by itself.

Worked Example 2 (§5.2) does this calculation completely by hand for LOX/LH2 at
$r=6$ and gets **3926 K**. The equilibrium answer is **3602 K**. The next two sections
are about that 324 K.

### 3.5 Equilibrium chemistry: dissociation

At 4000 K, H$_2$O is not a stable molecule. It is a population in dynamic equilibrium
with H$_2$, O$_2$, OH, H, O, and (in trace) HO$_2$ and H$_2$O$_2$. Each dissociation
reaction absorbs enthalpy, which comes out of the sensible heat, which lowers the
temperature until the composition and the temperature are mutually consistent. That is
the coupled problem CEA solves.

For a reaction $\sum \nu_i A_i = 0$ among ideal gases,

$$K_p(T) = \prod_i \left(\frac{p_i}{p^\circ}\right)^{\nu_i} = \exp\!\left(-\frac{\Delta G^\circ(T)}{R_u T}\right)$$

> **Eq. 3.6** — variables: $p_i$ partial pressure of species $i$ (bar), $p^\circ = 1$ bar
> standard state, $\nu_i$ stoichiometric coefficient (positive for products), $\Delta
> G^\circ(T)$ standard Gibbs free energy change of the reaction (J/kmol), $R_u$
> universal gas constant. Meaning: $K_p$ is fixed by temperature alone; pressure enters
> only through the partial pressures. Assumes: ideal gas mixture, standard state 1 bar.
> Fails when: real-gas effects matter (at 200 bar and 3600 K they are small — a percent
> or two on the compressibility factor — but at 300+ bar in an oxygen-rich preburner
> they are not negligible). [F]

The three reactions that matter in a hydrogen/oxygen chamber, with $K_p$ computed from
NASA polynomial Gibbs functions:

| reaction | $\log_{10} K_p$ at 3000 K | at 3600 K | at 4000 K |
|---|---|---|---|
| H$_2$O $\rightleftharpoons$ H$_2$ + ½O$_2$ | $-1.349$ | $-0.617$ | $-0.251$ |
| H$_2$O $\rightleftharpoons$ OH + ½H$_2$ | $-1.281$ | $-0.447$ | $-0.031$ |
| H$_2$ $\rightleftharpoons$ 2H | $-1.603$ | $-0.266$ | $+0.405$ |

Read the middle column. At 3600 K, $K_p$ for OH formation is 0.36 — of order unity.
That is what "significant dissociation" means quantitatively: the reaction has no strong
preference for either side, and only the pressure and the excess hydrogen keep the
products intact.

**The pressure effect.** Take pure steam at 3600 K and let it dissociate by
H$_2$O → H$_2$ + ½O$_2$ only, with degree of dissociation $\alpha$:

$$K_p = \frac{\alpha\,(\alpha/2)^{1/2}}{1-\alpha}\left(\frac{p}{p^\circ(1+\alpha/2)}\right)^{1/2}$$

> **Eq. 3.7** — variables: $\alpha$ dissociated fraction of the initial H$_2$O
> (dimensionless), $p$ total pressure (bar). Meaning: the explicit $p^{1/2}$ is
> $p^{\Delta n}$ with $\Delta n = +\tfrac12$ moles of gas created per mole reacted.
> Assumes: only this one reaction, ideal gas. Fails when: other dissociation channels
> compete, which for real exhaust they do. [F]

Because $\Delta n > 0$, raising the pressure suppresses dissociation. With
$K_p = 0.2414$ at 3600 K:

| $p$ (bar) | $\alpha$ |
|---|---|
| 1 | 0.377 |
| 20 | 0.164 |
| 200 | 0.080 |

Suppressing dissociation raises $T_0$. In the real fuel-rich LOX/LH2 mixture at $r=6$,
a six-species equilibrium solve gives:

| $p_c$ (bar) | $T_0$ (K) | $\mathcal{M}$ (kg/kmol) | $x_{\mathrm{OH}}$ | $x_{\mathrm{H}}$ |
|---|---|---|---|---|
| 20 | 3348 | 13.279 | 0.0502 | 0.0459 |
| 100 | 3530 | 13.521 | 0.0401 | 0.0314 |
| 200 | 3602 | 13.619 | 0.0351 | 0.0260 |

**This is one of the two real thermodynamic benefits of high chamber pressure.** [F] The
other is the larger available pressure ratio for a given nozzle. Note the size: a
tenfold pressure increase buys 254 K, worth about 3.7 % on $c^*$ — real, but far smaller
than the $C_F$ benefit of the same pressure ratio. Anyone who tells you high $p_c$ raises
$I_{sp}$ "because the combustion is more complete" is right for the wrong reason and by
the wrong amount.

**The mixture-ratio effect.** Excess hydrogen suppresses H$_2$O dissociation by mass
action: the H$_2$ on the product side of H$_2$O $\rightleftharpoons$ H$_2$ + ½O$_2$
pushes the equilibrium back. This is why a fuel-rich chamber is less dissociated than a
stoichiometric one at the same temperature, and part of why the flame-temperature peak
is flatter than the naive calculation suggests.

**The energy accounting.** At $r=6$, $p_c = 200$ bar, the equilibrium mixture is
(mole fractions) H$_2$O 0.6878, H$_2$ 0.2467, OH 0.0351, H 0.0260, O$_2$ 0.0023,
O 0.0021, $\mathcal{M} = 13.619$. Compare its chemical enthalpy per kilogram with that
of the fully recombined mixture (2 H$_2$O + 0.6453 H$_2$ per kmol O$_2$):

- fully recombined: $2 \times (-241{,}826)/37.331 = -12{,}955$ kJ/kg
- equilibrium: $[0.6878(-241{,}826) + 0.0351(37{,}300) + 0.0260(217{,}999) + 0.0021(249{,}180)]/13.619 = -11{,}662$ kJ/kg

The difference, **1293 kJ/kg**, is chemical energy still locked up in broken bonds. At a
frozen $c_p$ of about 3.8 kJ/(kg·K), that is $1293/3.8 \approx 340$ K of temperature —
which is, to within the precision of the estimate, exactly the 324 K gap between the
hand calculation and the equilibrium answer. [A] Dissociation is not a mysterious
correction. It is a measurable amount of energy stored in a measurable number of broken
bonds.

Two consolations. First, dissociation lowers $\mathcal{M}$ as well as $T_0$ (three
moles of OH + H weigh the same as, but occupy more moles than, the H$_2$O and H$_2$
they came from), so the damage to $\sqrt{T_0/\mathcal{M}}$ is smaller than the damage to
$T_0$. Second, most of that 1293 kJ/kg is not lost — it is recovered in the nozzle when
the gas cools and recombines. That recovery is the subject of §3.7.

### 3.6 Products, molar mass, $\gamma$, and the optimum mixture ratio

Now assemble the pieces. Sweep $r$ for LOX/LH2 at $p_c = 200$ bar with a full
equilibrium expansion to $\varepsilon = 77.5$:

| $r$ | $\phi$ | $T_0$ (K) | $\mathcal{M}$ | $\gamma_s$ | $c^*$ (m/s) | $I_{vac}$ (s) |
|---|---|---|---|---|---|---|
| 3.0 | 2.65 | 2456 | 8.06 | 1.235 | 2425 | 434.4 |
| 4.0 | 1.98 | 2976 | 10.03 | 1.197 | 2420 | 459.8 |
| 5.0 | 1.59 | 3356 | 11.90 | 1.167 | 2382 | **466.1** |
| 6.0 | 1.32 | 3602 | 13.62 | 1.147 | 2323 | 464.8 |
| 7.0 | 1.13 | 3722 | 15.12 | 1.137 | 2250 | 460.2 |
| 8.0 | 0.99 | 3744 | 16.38 | 1.135 | 2170 | 450.2 |

Three things to read off this table, in order of importance.

**(a) $T_0$ and $\mathcal{M}$ both rise with $r$, but $\mathcal{M}$ rises faster.** From
$r = 4$ to $r = 8$, $T_0$ rises by 26 % while $\mathcal{M}$ rises by 63 %. The ratio
$T_0/\mathcal{M}$ therefore *falls* monotonically, and so does $c^*$, over the entire
range where the flame is getting hotter. That is the whole mechanism. The exhaust of a
fuel-rich hydrogen engine is roughly a quarter free H$_2$ by mole; that hydrogen
contributes almost nothing to the heat release and enormously to the mole count, and in
$\sqrt{T_0/\mathcal{M}}$ the mole count wins.

Why does $\mathcal{M}$ rise so fast? Because you are replacing H$_2$ ($\mathcal{M}=2$)
with H$_2$O ($\mathcal{M}=18$). Every kilogram of hydrogen you stop dumping into the
exhaust is a kilogram that stops being nine times lighter than the average.

**(b) The $c^*$ optimum and the $I_{sp}$ optimum are not the same point.** $c^*$ peaks
near $r \approx 3.5$; vacuum $I_{sp}$ at $\varepsilon = 77.5$ peaks near
$r \approx 5.0$. The difference is $C_F$, which improves with the *lower* $\gamma$ of the
richer mixture only weakly and with the higher temperature more strongly. High-$\varepsilon$
vacuum nozzles push the optimum toward higher $r$; sea-level nozzles pull it back down.
When someone quotes "the optimum mixture ratio," ask them: optimum in $c^*$, in
sea-level $I_{sp}$, or in vacuum $I_{sp}$ at what $\varepsilon$?

**(c) Both optima are far fuel-rich of stoichiometric.** $r_{st} = 7.94$; the vacuum
$I_{sp}$ optimum is near 5.0; flying engines sit at 5.0–6.1. Running stoichiometric would
cost about 16 s of vacuum $I_{sp}$ against the optimum, and would raise $T_0$ by nearly
400 K into a wall-heat-flux regime nobody wants.

For kerolox the same argument runs with different numbers: $r_{st} = 3.41$, the
theoretical $I_{sp}$ optimum sits near $r \approx 2.6$–2.8, and flying engines sit at
2.27 (F-1) to 2.72 (RD-180). For methalox, $r_{st} = 3.99$ and the optimum is near
3.2–3.4, with Raptor claimed at 3.6.

Note the pattern: **hydrogen engines run much further from stoichiometric than
hydrocarbon engines do.** The optimum $\phi$ is about 1.6 for LOX/LH2 and about 1.25 for
kerolox. That is because dumping excess hydrogen is a spectacularly effective way to
lower $\mathcal{M}$ — from 18 to 2 — while dumping excess kerosene lowers $\mathcal{M}$
only from about 22 to about 18, because the excess hydrocarbon cracks into CO, H$_2$,
CH$_4$ and soot rather than passing through as a very light gas.

#### 3.6.1 Why the real choice is not the $I_{sp}$ optimum

Every flying LOX/LH2 engine runs oxidizer-ward of the $I_{sp}$ optimum. That is
deliberate, and there are four reasons. [J]

1. **Bulk density.** LH2 is 71 kg/m³; LOX is 1141 kg/m³. Moving from $r=5$ to $r=6$
   cuts hydrogen volume by 17 % for the same total propellant mass. On a vehicle whose
   hydrogen tank dominates the stage's length, insulated area and dry mass, that buys
   more payload than the 1.3 s of $I_{sp}$ it costs. The optimum for the *vehicle* is
   not the optimum for the *engine*, and the vehicle wins the argument.
2. **Wall heat flux and cooling capacity.** Fuel-rich also means cool, and the fuel-rich
   film near the wall is a large part of how a chamber survives. But hydrogen is also the
   coolant, and in an expander cycle the coolant flow *is* the turbine drive flow, so
   mixture ratio and cycle power are coupled.
3. **Turbine inlet temperature.** In gas-generator and staged-combustion cycles the
   preburner runs at its own, much richer, mixture ratio — typically $r \approx 0.7$–0.9
   for a fuel-rich hydrogen preburner — chosen to hold turbine inlet temperature at
   700–900 K, which is a materials limit, not a performance choice. The main-chamber
   $r$ and the preburner $r$ are separate design variables tied together by the flow
   balance.
4. **Throttling and mixture-ratio excursions.** An engine that must throttle, or that
   uses a propellant-utilisation valve to run tanks dry simultaneously, has to tolerate
   $r$ excursions of ±5–10 % without exceeding a wall temperature limit. You site the
   nominal point so that the whole excursion band is survivable, not so that the nominal
   point is optimal.

### 3.7 Frozen versus equilibrium flow, and the reality in between

The composition that leaves the chamber is not the composition that leaves the nozzle.
As the gas expands and cools from 3600 K to 1200 K, OH and H want to recombine into
H$_2$O and H$_2$, releasing that stored 1293 kJ/kg back into the flow. Whether they
manage it depends on whether there is time.

**Equilibrium flow** assumes composition re-equilibrates instantaneously at every point:
infinitely fast chemistry, $Da \to \infty$. All the dissociation energy is recovered.
This is the optimistic bound.

**Frozen flow** assumes composition is fixed at its chamber value all the way down:
infinitely slow chemistry, $Da \to 0$. None of the dissociation energy is recovered.
This is the pessimistic bound.

For the LOX/LH2 case at $r=6$, $p_c = 200$ bar, $\varepsilon = 77.5$:

| | $c^*$ (m/s) | exit $T$ (K) | exit $\mathcal{M}$ | $I_{vac}$ (s) |
|---|---|---|---|---|
| equilibrium | 2323.4 | 1194.5 | 14.112 | **464.8** |
| frozen | 2291.0 | 950.4 | 13.619 | **447.3** |

A 17.5 s spread — 3.8 %. That is not a rounding difference; it is larger than the entire
difference between a good injector and a mediocre one. Notice that even $c^*$ differs by
1.4 %, because the throat itself is downstream of the chamber and the gas has already
begun to recombine there.

Which bound is right? Neither. Chemistry has a finite rate.

**The physical picture.** Near the throat, temperature is high, densities are high, and
three-body recombination reactions (H + OH + M → H$_2$O + M) are fast compared with the
residence time: the flow tracks equilibrium. As the gas accelerates and expands, the
temperature and density collapse, the recombination rates fall as roughly the square of
density and exponentially in $1/T$, while the residence time shrinks. At some station
the chemical time exceeds the flow time and the composition stops changing. That station
is the **Bray freezing point** [E], and the standard engineering approximation — the
"sudden freezing" or Bray criterion — is to run the expansion in equilibrium up to the
point where a suitable Damköhler number passes through unity, then frozen from there on.
Real engines freeze somewhere in the diverging section, typically in the range
$\varepsilon \approx 2$–10 for the recombination reactions that matter, so the delivered
performance sits much closer to the equilibrium bound than to the frozen one.

**What to use for what.** [J]

- **$c^*$, throat sizing, chamber pressure prediction:** use **equilibrium**. The gas is
  at 3400 K and 115 bar at the throat; chemistry there is fast, and the equilibrium
  value is right to well under 1 %.
- **Vacuum $I_{sp}$ of a high-area-ratio nozzle:** the truth is between the bounds, and
  closer to equilibrium. Quoting equilibrium and applying a nozzle efficiency (§3.10)
  that absorbs the kinetic loss is standard practice and is what the efficiency
  bookkeeping in [CPIA-246] is built around.
- **Frozen:** use it as a *lower bound* and a sanity check, and use it when the chemistry
  really is slow — low chamber pressure (below about 10 bar), small thrusters with short
  residence times, and any exhaust whose recombination involves a condensed phase.
- **Neither, when there is a condensed phase.** For aluminised solids, the Al$_2$O$_3$
  particles lag the gas in both velocity and temperature; the correct treatment is a
  two-phase flow loss, not a choice between frozen and equilibrium. See Module 24.
- **When you actually need the number:** a finite-rate one-dimensional kinetics code
  (the JANNAF standard method, TDK and its successors) integrates the species equations
  down the nozzle with real rate constants. That is what a programme does before
  committing to a nozzle. CEA's two bounds are what a designer uses in the week before
  that. [M]

For hydrocarbon and storable propellants the frozen/equilibrium spread is smaller —
typically 1.5–3 % rather than 4 % — because there is less dissociation to recover and
because CO/CO$_2$ shift chemistry is slower to matter than H/OH recombination.

### 3.8 NASA CEA: what it is and what it does

**History.** The lineage runs from Zeleznik and Gordon's free-energy minimisation work at
NASA Lewis in the early 1960s, through the widely used 1971 SP-273 program, to the
current code documented in NASA RP-1311 Part I (*Analysis*, 1994) and Part II (*Users
Manual and Program Description*, 1996) by Sanford Gordon and Bonnie McBride
[RP-1311]. The program is universally called CEA — Chemical Equilibrium with
Applications — and it is still maintained by NASA Glenn and distributed free, with a
browser front end (CEARUN) that is entirely adequate for coursework [CEA], [CEARUN].
It is the reference implementation: when a paper says "theoretical $I_{sp}$", it almost
always means CEA, and when two papers disagree about theoretical performance the usual
cause is that they ran different CEA options rather than different physics.

**What it does.** CEA minimises the Gibbs free energy of a mixture subject to
element-mass conservation, over a thermodynamic database of more than 2000 species
[CEA]. Free-energy minimisation is preferred over solving simultaneous equilibrium
constants because you do not have to choose a set of independent reactions, and because
the number of unknowns scales with the number of *elements* (via Lagrange multipliers,
the "element potentials") rather than the number of species. RP-1311 Part I is the
derivation; read it before you trust any output [RP-1311 Pt. I].

For a rocket problem, CEA then:

1. solves the constant-pressure, constant-enthalpy problem in the chamber to get $T_0$
   and the chamber composition (this is exactly Eq. 3.4 with the product list
   determined rather than assumed);
2. expands isentropically — at constant entropy — to the throat, defined as the station
   of maximum mass flux (equivalently $M=1$ on the equilibrium sound speed);
3. continues the isentropic expansion to each requested exit condition, either
   re-equilibrating at every step (equilibrium) or holding the chamber composition
   (frozen);
4. reports $c^*$, $C_F$, $I_{vac}$ and $I_{sp}$ from the resulting one-dimensional
   flow field.

**Inputs.** A rocket case needs, at minimum:

- `problem rocket` — the problem type. `equilibrium` and/or `frozen` selects the
  expansion model; `nfz=2` freezes at the throat rather than in the chamber.
- `p,bar=200` — chamber pressure. CEA's default rocket problem assumes an *infinite-area
  combustor* (`iac`), i.e. the chamber stagnation pressure equals the injector-face
  pressure and there is no Rayleigh loss from heat addition in a finite-area chamber.
  Specifying `fac ac/at=2.5` instead gives the finite-area-combustor treatment, which
  drops $c^*$ by a fraction of a percent and is the honest option for a chamber with
  contraction ratio below about 3.
- `o/f=6.0` — mixture ratio by mass. Alternatives are `%fuel`, `r,eq.ratio` or `phi`.
- `sup-ae/at=77.5` — supersonic area ratios at which to report the exit. `sub-ae/at` for
  subsonic stations, `pi/p` to specify pressure ratios instead.
- `reactant` lines: for each, whether it is `fuel` or `oxid`, its formula or library
  name, its weight fraction `wt%`, its enthalpy `h,kj/mol` and its temperature `t,k`.
  **This is where cryogens are handled**, and where most beginner errors live: if you
  enter O$_2$ at 298.15 K you have entered gaseous oxygen and your flame will be a
  couple of hundred kelvin too hot.

**A minimal input deck:**

```
problem  rocket  equilibrium  frozen  nfz=2
   p,bar = 200
   o/f   = 6.0
   sup-ae/at = 77.5
react
   oxid = O2(L)  wt%=100  t,k=90.17
   fuel = H2(L)  wt%=100  t,k=20.27
output  siunits  transport
end
```

### 3.9 Reading a CEA rocket output block, line by line

Below is a rocket output block for LOX/LH2 at $p_c = 200$ bar, $r = 6.0$,
$\varepsilon = 77.5$, equilibrium expansion, in the layout CEA prints. **Provenance:** the
values were reproduced with the six-species equilibrium model in
`tools/examples/04.py` and agree with published CEA results for these conditions to
within a few kelvin in $T_0$ and about 0.5 % in $c^*$; treat the final digit as
illustrative rather than as a CEA transcript [A]. Everything about how to *read* the
block is exact.

```
              THEORETICAL ROCKET PERFORMANCE ASSUMING EQUILIBRIUM
           COMPOSITION DURING EXPANSION FROM INFINITE AREA COMBUSTOR

 Pinj =  2900.8 PSIA
                 REACTANT              WT FRACTION   ENERGY(KJ/KG-MOL)   TEMP(K)
 OXIDANT     O2(L)                       1.0000000        -12979.000      90.170
 FUEL        H2(L)                       1.0000000         -9012.000      20.270

 O/F=    6.00000  %FUEL= 14.285714  R,EQ.RATIO= 1.322780  PHI,EQ.RATIO= 1.322780

                            CHAMBER     THROAT       EXIT
 Pinf/P                      1.0000      1.7404    1125.26
 P, BAR                      200.00     114.916    0.17774
 T, K                       3601.60     3384.34    1194.53
 RHO, KG/CU M               9.0957 0   5.6130 0   2.5250-2
 H, KJ/KG                   -986.26    -2162.26   -10658.5
 U, KJ/KG                  -3185.11    -4209.58   -11362.3
 G, KJ/KG                  -62885.1    -60327.2   -31188.4
 S, KJ/(KG)(K)             17.1865     17.1865     17.1865

 M, (1/n)                    13.619      13.744      14.112
 (dLV/dLP)t                -1.01900    -1.01410    -1.00000
 (dLV/dLT)p                  1.3296      1.2600      1.0000
 Cp, KJ/(KG)(K)              7.3209      6.6859      2.8827
 GAMMAs                      1.1473      1.1488      1.2569
 SON VEL,M/SEC               1588.3      1533.6       940.5
 MACH NUMBER                 0.000       1.000       4.676

 PERFORMANCE PARAMETERS
 Ae/At                                   1.0000      77.500
 CSTAR, M/SEC                            2323.4      2323.4
 CF                                      1.2347      1.9619
 Ivac, M/SEC                             2868.5      4558.3
 Isp,  M/SEC                             1533.6      4398.2

 MOLE FRACTIONS
 H2                         0.24671     0.24432     0.24395
 H2O                        0.68779     0.70631     0.75605
 OH                         0.03513     0.02585     0.00001
 H                          0.02596     0.02078     0.00000
 O2                         0.00228     0.00145     0.00000
 O                          0.00213     0.00129     0.00000
```

Now every line.

**`Pinj = 2900.8 PSIA`** — the chamber pressure you asked for, echoed in US units
(200 bar). With the default infinite-area combustor this is both the injector-face
pressure and the chamber stagnation pressure. With `fac` they differ, and the block
grows an extra `INJECTOR` column.

**Reactant table** — what you told CEA the propellants are. `ENERGY` is the absolute
enthalpy per kmol at the stated `TEMP`, negative here because both are cryogenic
liquids. **Check this table on every run.** If `TEMP` says 298.15 for O2, you have run
gaseous oxygen.

**`O/F`, `%FUEL`, `R,EQ.RATIO`, `PHI,EQ.RATIO`** — the mixture specification in four
equivalent forms. $\%\mathrm{FUEL} = 100/(1+r) = 14.2857$. $\phi = 7.936/6 = 1.3228$,
confirming fuel-rich by a third.

**`Pinf/P`** — chamber stagnation pressure divided by the local static pressure. At the
throat, 1.7404; a constant-$\gamma$ ideal gas with $\gamma = 1.1473$ would predict
$((\gamma+1)/2)^{\gamma/(\gamma-1)} = 1.7466$. The 0.4 % difference is real physics, not
round-off: $\gamma$ is not constant through the throat because the composition shifts.

**`P, BAR` / `T, K` / `RHO, KG/CU M`** — the state. Note CEA's exponent notation:
`9.0957 0` means $9.0957\times10^{0}$ and `2.5250-2` means $2.5250\times10^{-2}$. This
trips up everyone once. Check the chamber density against the ideal gas law:
$\rho = p\mathcal{M}/(R_u T) = (200\times10^5)(13.619)/(8314.46 \times 3601.60) = 9.096$
kg/m³. ✓

**`H, KJ/KG`** — total (formation-referenced) enthalpy. **The chamber value equals the
reactant enthalpy**, which is the definition of adiabatic combustion: per kmol of O$_2$,
$1(-12{,}979) + 2.6453(-9012) = -36{,}819$ kJ over 37.331 kg $= -986.3$ kJ/kg. ✓ This is
the single best check that you set the problem up correctly. And the enthalpy drop from
chamber to exit is the kinetic energy you got:
$v_e = \sqrt{2\,\Delta h} = \sqrt{2 \times (10658.5 - 986.26)\times 10^3} = 4398$ m/s,
which is exactly the printed `Isp, M/SEC` at the exit. ✓

**`U`, `G`** — internal energy $h - p/\rho$ and Gibbs function $h - Ts$. Rarely used
directly; `G` is what the solver minimises.

**`S, KJ/(KG)(K)`** — entropy. **It is identical in all three columns.** That is the
isentropic-expansion assumption, printed. If you ever see it change, you are not looking
at a CEA nozzle expansion.

**`M, (1/n)`** — mean molar mass, kg/kmol, written as the reciprocal of moles per unit
mass. It *rises* from 13.619 to 14.112 down the nozzle. That is recombination:
OH and H disappearing into H$_2$O. In a frozen run this row is constant, and that single
difference is the whole frozen-versus-equilibrium distinction made visible.

**`(dLV/dLP)t`** — $(\partial \ln V/\partial \ln p)_T$. For an ideal non-reacting gas
this is exactly $-1$. Here it is $-1.019$ in the chamber: dropping the pressure at fixed
temperature causes *extra* expansion because it also causes extra dissociation. It
relaxes to exactly $-1.00000$ at the exit, which tells you the exhaust has stopped
reacting — the chemistry is effectively finished by $\varepsilon = 77.5$.

**`(dLV/dLT)p`** — $(\partial \ln V/\partial \ln T)_p$, exactly $+1$ for an ideal
non-reacting gas, here 1.3296: heating at fixed pressure dissociates as well as expands.
These two derivatives are how CEA carries real chemistry into the thermodynamic
relations, and they are why `Cp` is so large.

**`Cp, KJ/(KG)(K)`** — the **equilibrium** specific heat, 7.32 kJ/(kg·K) in the chamber.
The frozen value for this same mixture is 3.80. The extra 3.5 is *reaction* $c_p$:
energy that goes into breaking bonds rather than into temperature. Do not put CEA's
chamber `Cp` into a Bartz heat-transfer correlation [Bartz57] without thinking about
which $c_p$ Bartz's correlation was fitted with; the frozen value is usually the
defensible choice. [J]

**`GAMMAs`** — the isentropic exponent $\gamma_s = -(\partial \ln p/\partial \ln V)_s$,
**not** $c_p/c_v$. The relation CEA uses is

$$\gamma_s = \frac{c_p/c_v}{-\left(\partial \ln V/\partial \ln p\right)_T}, \qquad
c_p - c_v = -\frac{R\left[(\partial \ln V/\partial \ln T)_p\right]^2}{(\partial \ln V/\partial \ln p)_T}$$

> **Eq. 3.8** — variables: $c_p$, $c_v$ equilibrium specific heats (J/(kg·K)), $R$
> specific gas constant of the local mixture (J/(kg·K)). Meaning: $\gamma_s$ is the
> exponent that makes $pV^{\gamma_s} = \mathrm{const}$ locally true along the isentrope,
> which is what you want for nozzle relations; $c_p/c_v$ is not that when the mixture
> reacts. Assumes: ideal-gas mixture with reaction. Fails when: real-gas or condensed
> phases are present. [F] Check the block: $R = 8314.46/13.619 = 610.5$ J/(kg·K);
> $c_p - c_v = -610.5(1.3296)^2/(-1.019) = 1059$ J/(kg·K); $c_v = 6262$ J/(kg·K);
> $c_p/c_v = 1.1691$; $\gamma_s = 1.1691/1.019 = 1.1473$. ✓
> The frozen $\gamma$ for the same mixture is 1.191 — use $\gamma_s$ for nozzle flow,
> never the frozen value, unless you are running a genuinely frozen expansion.

**`SON VEL,M/SEC`** — equilibrium speed of sound, $a = \sqrt{\gamma_s R T}$. Check:
$\sqrt{1.1473 \times 610.5 \times 3601.60} = 1588$ m/s. ✓

**`MACH NUMBER`** — exactly 1.000 at the throat, which is not a coincidence but a
validation: CEA locates the throat by maximising mass flux $\rho v$, and the
maximum-mass-flux point coincides with $M=1$ on the *equilibrium* sound speed. If you
locate a throat by maximising $\rho v$ and get $M \neq 1$, your sound speed is
inconsistent with your equation of state.

**`Ae/At`** — the area ratios reported. 1.0 is the throat; 77.5 is what you asked for.

**`CSTAR, M/SEC`** — $c^* = p_0 A_t/\dot m = p_0/(\rho^* v^*)$. Check:
$200\times10^5/(5.6130 \times 1533.6) = 2323$ m/s ✓. **`CSTAR` is identical in both
columns** because it is a chamber-and-throat property; nothing downstream can change it.
That is why $c^*$ is the diagnostic for combustion quality and $C_F$ for nozzle quality
— see Module 03 and §3.10.

**`CF`** — $C_F = F/(p_0 A_t)$, evaluated in vacuum. At the throat, 1.2347; at
$\varepsilon = 77.5$, 1.9619. Check: $C_F = I_{vac}/c^* = 4558.3/2323.4 = 1.9619$. ✓

**`Ivac, M/SEC`** — vacuum effective exhaust velocity, $v_e + p_e A_e/\dot m$. At the
exit: $4398.2 + (0.17774\times10^5)/(0.025250 \times 4398.2) = 4398.2 + 160.1 = 4558.3$.
✓ Divide by $g_0$: **464.8 s**.

**`Isp, M/SEC`** — CEA's `Isp` is the *momentum-only* effective exhaust velocity,
i.e. $v_e$, which is the correct effective exhaust velocity when the nozzle is perfectly
expanded ($p_a = p_e$). It is **not** the sea-level $I_{sp}$ and it is **not** the vacuum
$I_{sp}$. At the exit, 4398.2 m/s = 448.5 s. At the throat it equals `SON VEL`, which is
a useful sanity check on both. To get $I_{sp}$ at an ambient pressure $p_a$, use
$I_{sp} = [I_{vac} - p_a A_e/\dot m]/g_0 = [I_{vac} - p_a \varepsilon c^*/p_0]/g_0$.

**`MOLE FRACTIONS`** — the composition. Read the OH and H rows: 3.5 % and 2.6 % in the
chamber, essentially zero at the exit. Those species carried 1293 kJ/kg of chemical
energy that has been returned to the flow. In the frozen run the same rows would read
0.03513 and 0.02596 at the exit, and $I_{vac}$ would be 447.3 s instead of 464.8 s.

### 3.10 From CEA $I_{sp}$ to delivered $I_{sp}$

CEA gives a one-dimensional, perfectly-mixed, inviscid, infinitely-fast-or-slow-chemistry
answer. Real engines deliver less. The standard decomposition, which is the framework
of the JANNAF performance methodology [CPIA-246], separates the losses by where they
happen:

$$I_{sp,\text{del}} = \eta_{c^*} \cdot \eta_{C_F} \cdot \eta_{\text{cycle}} \cdot I_{sp,\text{CEA}}$$

> **Eq. 3.9** — variables: $\eta_{c^*}$ combustion (characteristic-velocity) efficiency,
> $\eta_{C_F}$ nozzle efficiency, $\eta_{\text{cycle}}$ the penalty for propellant that
> does not pass through the main chamber at full expansion. Meaning: multiplicative
> bookkeeping of independent loss mechanisms. Assumes: the efficiencies are separable,
> which is an approximation — injector quality affects the boundary layer, and the
> nozzle's divergence loss is coupled to the core flow profile. Fails when: losses are
> large enough to interact (deeply throttled operation, severe separation). [E]

**$\eta_{c^*}$: combustion efficiency, 0.92–0.995.** This is incomplete mixing,
incomplete vaporisation and finite residence time — the injector's report card. It is
measured directly from a hot fire: $\eta_{c^*} = p_0 A_t/(\dot m\, c^*_{\text{CEA}})$,
which needs only chamber pressure, throat area and the two propellant flow rates, and is
why $c^*$ efficiency is the first number quoted after any test. Coaxial-shear injectors
on hydrogen with adequate $L^*$: 0.98–0.995. Impinging doublets on kerosene: 0.96–0.98.
A heavily film-cooled chamber sacrifices 1–3 % deliberately, because the fuel curtain at
the wall does not burn at the core mixture ratio. Anything below 0.92 means the injector
is wrong, not merely imperfect.

**$\eta_{C_F}$: nozzle efficiency, 0.95–0.99.** Four separable pieces:

- *Divergence loss*: the exit flow is not axial. For a conical nozzle of half-angle
  $\alpha$, $\lambda = (1+\cos\alpha)/2$ — 1.7 % for a 15° cone. A Rao bell recovers most
  of it, to 0.3–0.8 % [Rao58].
- *Boundary-layer / friction loss*: 0.5–1.5 %, worse for small throats and long nozzles
  because it scales with wetted area over throat area.
- *Kinetic (finite-rate) loss*: 0.1–1.5 %; this is the gap between equilibrium and
  reality discussed in §3.7, and it grows with area ratio and shrinks with chamber
  pressure.
- *Two-phase loss*: zero for these propellants; 1–5 % for aluminised solids.

**$\eta_{\text{cycle}}$: 0.95–1.00.** A staged-combustion or expander engine burns
everything in the main chamber and expands it through the full nozzle:
$\eta_{\text{cycle}} = 1$. A gas-generator engine dumps 2–7 % of the total flow through a
turbine and overboard at a low area ratio; that flow produces perhaps 40–60 % of the main
chamber's $I_{sp}$, so the stage-level penalty is 1–4 %. This term is a cycle choice, not
a combustion or nozzle quality, and it is the reason the same propellant combination
delivers such different fractions of CEA in different engines.

**The check.** Taking published vacuum $I_{sp}$ against a full equilibrium calculation at
each engine's own $r$, $p_c$ and $\varepsilon$:

| engine | cycle | $r$ | $p_c$ (bar) | $\varepsilon$ | theoretical $I_{vac}$ (s) | delivered (s) | ratio |
|---|---|---|---|---|---|---|---|
| RS-25 | staged combustion | 6.03 | 206.4 | 69 | 463 | 452.3 | 0.977 |
| RL10A-3-3A | closed expander | 5.0 | 32.8 | 61 | 462 | 444.5 | 0.962 |
| Vulcain 1 | gas generator | 5.3 | 100 | 45.1 | 457 | 431 | 0.944 |
| Vulcain 2 | gas generator | 6.1 | 117.3 | 58.2 | 459 | 429 | 0.935 |

The pattern is exactly what Eq. 3.9 predicts: the closed cycles land at 96–98 % of
theoretical, the open cycles at 93–94 %, and the gap is the gas generator. [A] (Engine
figures from `reference/_verify-liquid.md`; the theoretical column is from the
six-species model in `tools/`, so the ratios are good to about ±0.5 %, not better.)

### 3.11 Where CEA is wrong

CEA is a model, and knowing its failure modes is more valuable than knowing its options.
[J]

1. **Real-gas effects.** CEA's species are ideal gases. At 200 bar and 3600 K the
   compressibility factor of the mixture is within a couple of percent of unity, so this
   is a small error in a main chamber. It is *not* small in an oxidizer-rich preburner at
   500+ bar and 800 K, where oxygen is a dense supercritical fluid, nor for injection
   conditions where you need real-fluid properties for the propellants themselves — go
   to [NIST-WB] or [REFPROP] for those.
2. **Two-phase flow.** CEA includes condensed species in the equilibrium (it will tell
   you Al$_2$O$_3$(L) is present) but the expansion is treated as a single fluid in
   velocity and thermal equilibrium. For aluminised solids that overpredicts $I_{sp}$ by
   1–5 %; the particle lag loss is a separate calculation.
3. **Kinetics.** Neither bound is the truth, and CEA offers no way to compute where the
   truth sits (§3.7).
4. **Injector-limited combustion.** CEA assumes the propellants are perfectly mixed at
   the stated mixture ratio. A real injector produces a distribution of local mixture
   ratios across the face, and $c^*$ is a concave function of $r$, so the *average of
   $c^*$ over the distribution is less than $c^*$ at the average $r$*. That is a large
   part of $\eta_{c^*}$, and it is invisible to CEA. Deliberate maldistribution — a
   fuel-rich outer ring for wall cooling — costs performance for exactly this reason and
   is charged to the same term.
5. **Boundary layers, heat loss, and geometry.** CEA has no wall. A regeneratively cooled
   chamber returns its heat to the flow (so the adiabatic assumption is nearly right for
   the whole engine even though it is wrong for the chamber alone); a radiation-cooled or
   ablative chamber does not.
6. **Chamber pressure definition.** CEA's default infinite-area combustor gives the
   stagnation pressure with no heat-addition (Rayleigh) loss. A real chamber with
   contraction ratio $A_c/A_t = 2$ loses about 1 % of stagnation pressure between
   injector face and throat. Compare like with like or you will find phantom 1 %
   discrepancies between prediction and test. This is the same injector-end versus
   nozzle-stagnation ambiguity that makes published chamber pressures disagree.

**Alternatives.** [M] **RPA** (Rocket Propulsion Analysis) wraps a CEA-equivalent
equilibrium solver in engine-level tooling — thrust chamber sizing, nozzle contour
generation, regenerative cooling analysis and cycle balance — and is the fastest route
from a propellant choice to a credible preliminary engine [RPA]. **Cantera** is an
open-source, scriptable chemical kinetics and thermodynamics library: it will do the same
equilibrium calculation from Python or C++, and unlike CEA it will also integrate
finite-rate chemistry, which makes it the right tool when you need to ask where the flow
freezes rather than assume it. Cantera is not in this course's bibliography because it
is a software package rather than a citable reference; it uses the same NASA polynomial
thermodynamic data [JANAF], so a Cantera equilibrium result should reproduce CEA to
within the differences in the two species databases. Neither replaces CEA as the
reference for published theoretical performance; both are better for automation.

---

## 4. Typical engineering ranges

| quantity | range | low end | high end |
|---|---|---|---|
| stoichiometric O/F | 0.99 (N$_2$H$_4$/N$_2$O$_4$) – 7.94 (LH2/LOX) | hydrazine/N$_2$O$_4$ | hydrogen/oxygen |
| operating O/F, LOX/LH2 | 5.0 – 6.1 | RL10A-3-3A (5.0) | Vulcain 2 (6.1) |
| operating O/F, LOX/RP-1 | 2.25 – 2.72 | F-1 (2.27) | RD-180 (2.72) |
| operating O/F, LOX/CH4 | 3.6 (claimed) | — | Raptor (3.6, company claim) |
| operating O/F, N$_2$O$_4$/hydrazines | 1.6 – 1.9 | Apollo SPS, LMDE (1.6) | Aestus (1.9) |
| equivalence ratio $\phi$ at operating point | 1.08 – 1.8 | methalox | UDMH/N$_2$O$_4$ |
| chamber temperature $T_0$ | 3000 – 3900 K | storables at low $p_c$ | LOX/LH2 near stoichiometric |
| exhaust molar mass $\mathcal{M}$ | 10 – 24 kg/kmol | hydrogen-rich LOX/LH2 | storables and kerolox |
| $\gamma_s$ (chamber) | 1.13 – 1.26 | hot, dissociated hydrogen exhaust | cool storable exhaust |
| $c^*$ (theoretical) | 1550 – 2430 m/s | cold-gas and monoprops | LOX/LH2 at $r\approx3.5$ |
| $\eta_{c^*}$ | 0.92 – 0.995 | heavily film-cooled ablative | coaxial-shear H2 with adequate $L^*$ |
| $\eta_{C_F}$ | 0.95 – 0.99 | short conical, small throat | optimised Rao bell |
| equilibrium − frozen $I_{sp}$ | 1.5 – 4 % | storables, low $\varepsilon$ | LOX/LH2, high $\varepsilon$ |
| $T_0$ gain from $p_c$: 20 → 200 bar | ~250 K | — | LOX/LH2 at $r=6$ |
| preburner/GG mixture ratio | 0.7 – 0.9 (fuel-rich H2) | — | set by 700–900 K turbine limit |

---

## 5. Worked examples

### 5.1 Worked Example 1 — Stoichiometric O/F for five real pairs

**Problem.** Compute $r_{st}$ by mass for LH2/LOX, CH$_4$/LOX, RP-1/LOX (as
CH$_{1.95}$), MMH/N$_2$O$_4$ and UDMH/N$_2$O$_4$, and for each state $\phi$ at the
mixture ratio a real engine uses.

**Method.** Balance atoms; multiply coefficients by molar masses; divide.
Atomic masses used: H 1.008, C 12.011, N 14.007, O 15.999 kg/kmol.

**(a) LH2/LOX.** $2\mathrm{H_2} + \mathrm{O_2} \to 2\mathrm{H_2O}$.
$\mathcal{M}(\mathrm{H_2}) = 2\times1.008 = 2.016$; $\mathcal{M}(\mathrm{O_2}) = 2\times15.999 = 31.998$.

$$r_{st} = \frac{1 \times 31.998\ \mathrm{kg}}{2 \times 2.016\ \mathrm{kg}} = \frac{31.998}{4.032} = 7.936$$

RS-25 runs $r = 6.03$, so $\phi = 7.936/6.03 = 1.316$.

**(b) CH$_4$/LOX.** $\mathrm{CH_4} + 2\mathrm{O_2} \to \mathrm{CO_2} + 2\mathrm{H_2O}$.
$\mathcal{M}(\mathrm{CH_4}) = 12.011 + 4(1.008) = 16.043$.

$$r_{st} = \frac{2 \times 31.998}{16.043} = \frac{63.996}{16.043} = 3.989$$

Raptor is claimed at $r = 3.6$, so $\phi = 3.989/3.6 = 1.108$.

**(c) RP-1/LOX as CH$_{1.95}$.** Carbon needs 1 O$_2$; the 1.95 hydrogens make
0.975 H$_2$O needing 0.4875 O$_2$. Total $1.4875$ O$_2$.
$\mathcal{M}(\mathrm{CH_{1.95}}) = 12.011 + 1.95(1.008) = 12.011 + 1.966 = 13.977$.

$$r_{st} = \frac{1.4875 \times 31.998}{13.977} = \frac{47.597}{13.977} = 3.406$$

F-1 runs $r = 2.27$, so $\phi = 3.406/2.27 = 1.501$. Merlin is not published but figures
near 2.3 circulate, giving $\phi \approx 1.48$.

**(d) MMH/N$_2$O$_4$.** CH$_6$N$_2$: $\mathcal{M} = 12.011 + 6(1.008) + 2(14.007) = 46.073$.
N$_2$O$_4$: $\mathcal{M} = 2(14.007) + 4(15.999) = 92.010$, 4 O atoms each.
Oxygen atoms needed: 2 (CO$_2$) + 3 (3 H$_2$O) = 5. Coefficient $= 5/4 = 1.25$.

$$r_{st} = \frac{1.25 \times 92.010}{46.073} = \frac{115.013}{46.073} = 2.496$$

Aestus runs $r = 1.9$, so $\phi = 2.496/1.9 = 1.314$.

**(e) UDMH/N$_2$O$_4$.** C$_2$H$_8$N$_2$: $\mathcal{M} = 2(12.011) + 8(1.008) + 2(14.007) = 60.100$.
Oxygen atoms needed: 4 (2 CO$_2$) + 4 (4 H$_2$O) = 8. Coefficient $= 2$.

$$r_{st} = \frac{2 \times 92.010}{60.100} = \frac{184.020}{60.100} = 3.062$$

Viking 2 ran $r = 1.86$ on UH-25 (a UDMH/hydrazine blend); on pure UDMH that would be
$\phi = 1.65$.

**Sanity check.** Every stoichiometric value exceeds every operating value, in every
case, by 30–65 %. If you compute an $r_{st}$ *below* the engine's operating point you
have made an arithmetic error or used the wrong fuel formula — no flying bipropellant
engine runs oxidizer-rich in the main chamber. (Oxidizer-rich *preburners*, as in the
RD-180 and Raptor, are a different component and a different argument: their job is to
make turbine drive gas, not thrust.)

### 5.2 Worked Example 2 — Adiabatic flame temperature by hand, LOX/LH2 at $r = 6$

**Problem.** Compute $T_{ad}$ for LOX/LH2 at $r = 6.0$ assuming the only products are
H$_2$O and excess H$_2$. Do it twice: once with reactants taken as gases at 298.15 K,
once with the real cryogenic liquids. Then compare with equilibrium.

**Step 1 — basis and product moles.** Take 1 kmol O$_2$ = 31.998 kg. Then fuel mass
$= 31.998/6 = 5.333$ kg, so

$$n_{\mathrm{H_2}} = \frac{5.333}{2.016} = 2.6453\ \mathrm{kmol}$$

The reaction $2\mathrm{H_2} + \mathrm{O_2} \to 2\mathrm{H_2O}$ consumes 2 kmol H$_2$ per
kmol O$_2$, so:

- products: $2$ kmol H$_2$O $+\; 0.6453$ kmol H$_2$; total $2.6453$ kmol
- total mass: $31.998 + 5.333 = 37.331$ kg
- $\mathcal{M} = 37.331/2.6453 = 14.112$ kg/kmol
- $\phi = 7.936/6 = 1.323$

**Step 2 — heat release.** With $\Delta_f h^\circ(\mathrm{H_2O,g}) = -241{,}826$ kJ/kmol
and zero for H$_2$(g) and O$_2$(g) at 298.15 K:

$$\Delta H_{rxn} = 2(-241{,}826) = -483{,}652\ \mathrm{kJ}$$

**Step 3 — $c_p(T)$ polynomials.** Linear least-squares fits to the NASA polynomials over
1500–4500 K, in kJ/(kmol·K), maximum error 2.2 and 0.9 respectively: [A]

$$c_{p,\mathrm{H_2O}} = 42.88 + 4.414\times10^{-3}\,T, \qquad
c_{p,\mathrm{H_2}} = 28.43 + 2.861\times10^{-3}\,T$$

These are *not* valid below 1500 K, so split the integral at 1000 K and take
$h(1000)-h(298.15)$ from tables [JANAF]: 25,980 kJ/kmol for H$_2$O and 20,680 kJ/kmol
for H$_2$.

$$\Delta H_{298\to1000} = 2(25{,}980) + 0.6453(20{,}680) = 51{,}960 + 13{,}345 = 65{,}305\ \mathrm{kJ}$$

**Step 4 — case A: gaseous reactants at 298.15 K.** Reactant enthalpy is zero, so all
483,652 kJ goes into the products. Above 1000 K the mixture must absorb
$483{,}652 - 65{,}305 = 418{,}347$ kJ. With

$$A = 2(42.88) + 0.6453(28.43) = 85.76 + 18.35 = 104.11\ \mathrm{kJ/K}$$
$$B = 2(4.414\times10^{-3}) + 0.6453(2.861\times10^{-3}) = 1.0674\times10^{-2}\ \mathrm{kJ/K^2}$$

$$A(T-1000) + \tfrac{B}{2}(T^2 - 10^6) = 418{,}347$$

Expanding, $104.11\,T - 104{,}110 + 5.337\times10^{-3}T^2 - 5{,}337 = 418{,}347$, so

$$5.337\times10^{-3}\,T^2 + 104.11\,T - 527{,}794 = 0$$

$$T = \frac{-104.11 + \sqrt{104.11^2 + 4(5.337\times10^{-3})(527{,}794)}}{2(5.337\times10^{-3})}
= \frac{-104.11 + \sqrt{10{,}839 + 11{,}267}}{1.0674\times10^{-2}}
= \frac{44.57}{1.0674\times10^{-2}} = \boxed{4176\ \mathrm{K}}$$

(Integrating the full NASA polynomials rather than the linear fits gives 4203 K; the
27 K is the fit error, which is the honest size of a hand calculation.)

**Step 5 — case B: cryogenic liquid reactants.** Now the reactant enthalpy is not zero:

$$H_{react} = 1(-12{,}979) + 2.6453(-9012) = -12{,}979 - 23{,}840 = -36{,}819\ \mathrm{kJ}$$

That enthalpy deficit must be made up out of the same heat release, so the products
absorb $483{,}652 - 36{,}819 = 446{,}833$ kJ, of which $446{,}833 - 65{,}305 = 381{,}528$
kJ goes above 1000 K:

$$5.337\times10^{-3}\,T^2 + 104.11\,T - 490{,}975 = 0$$
$$T = \frac{-104.11 + \sqrt{10{,}839 + 10{,}482}}{1.0674\times10^{-2}} = \frac{41.90}{1.0674\times10^{-2}} = \boxed{3926\ \mathrm{K}}$$

(Full polynomials: 3952 K.) **The cryogens cost 250 K.** That is the first thing the
freshman-chemistry calculation gets wrong.

**Step 6 — what equilibrium says.** A six-species equilibrium solve (H$_2$, H$_2$O,
O$_2$, OH, H, O) at 200 bar with the same reactant enthalpy gives

$$T_0 = 3602\ \mathrm{K}, \qquad \mathcal{M} = 13.619\ \mathrm{kg/kmol}$$

against the hand answer of 3926 K and 14.112 kg/kmol. **The hand calculation is 324 K
(9 %) too hot.** Published CEA results for these conditions agree with the 3600 K figure
to a few kelvin [CEA].

**Step 7 — where the 324 K went.** §3.5 accounted for it: the equilibrium mixture holds
1293 kJ/kg of chemical energy in OH, H and O that the hand calculation assumed was
released, and at a frozen $c_p$ of 3.80 kJ/(kg·K) that is 340 K. ✓

**Sanity check and consequences.** Propagate both answers through $c^* \propto
\sqrt{T_0/\mathcal{M}}$: the hand calculation gives
$\sqrt{3926/14.112} = 16.68$ against $\sqrt{3602/13.619} = 16.26$, i.e. **2.6 % high on
$c^*$** — about 12 s of $I_{sp}$ if you carried it all the way through, and the
$\gamma$ error partly cancels even that. The temperature error
is much worse than the $c^*$ error, because $\mathcal{M}$ moved the same way as $T_0$.
And a 324 K error in $T_0$ is a 10 % error in the driving temperature difference of every
heat-transfer calculation in Modules 10 and 11. **Never size a cooling jacket off a
hand-calculated flame temperature.**

### 5.3 Worked Example 3 — $c^*$ and $I_{sp}$ versus mixture ratio: finding the optimum

**Problem.** Given equilibrium chamber properties for LOX/LH2 at $p_c = 200$ bar,
compute $c^*$ and vacuum $I_{sp}$ at $\varepsilon = 77.5$ for $r = 4$, 6 and 8, and
identify the optimum. Stoichiometric is 7.936.

| $r$ | $T_0$ (K) | $\mathcal{M}$ (kg/kmol) | $\gamma_s$ |
|---|---|---|---|
| 4.0 | 2975.8 | 10.031 | 1.1968 |
| 6.0 | 3601.6 | 13.619 | 1.1473 |
| 8.0 | 3743.6 | 16.383 | 1.1345 |

**Step 1 — specific gas constants.** $R = R_u/\mathcal{M}$:

- $r=4$: $8314.46/10.031 = 828.88$ J/(kg·K)
- $r=6$: $8314.46/13.619 = 610.50$ J/(kg·K)
- $r=8$: $8314.46/16.383 = 507.51$ J/(kg·K)

**Step 2 — $c^*$ from Eq. 3.1.** For $r = 6$, $\gamma = 1.1473$:

$$\Gamma = \sqrt{1.1473}\left(\frac{2}{2.1473}\right)^{\frac{2.1473}{2(0.1473)}} = 1.07112 \times (0.931403)^{7.28887} = 1.07112 \times 0.59578 = 0.63815$$

$$c^* = \frac{\sqrt{610.50 \times 3601.60}}{0.63815} = \frac{\sqrt{2{,}198{,}777}}{0.63815} = \frac{1482.8}{0.63815} = 2323.7\ \mathrm{m/s}$$

`rocket.c_star(1.1473, 610.504, 3601.6)` returns 2323.8 m/s; the 0.1 m/s is rounding in
the hand $\Gamma$. The three results:

| $r$ | $\Gamma$ | $\sqrt{RT_0}$ (m/s) | $c^*$ (m/s) |
|---|---|---|---|
| 4.0 | 0.64792 | 1570.5 | **2424.0** |
| 6.0 | 0.63815 | 1482.8 | **2323.8** |
| 8.0 | 0.63553 | 1378.4 | **2169.0** |

**Step 3 — $C_F$ and $I_{sp}$ at $\varepsilon = 77.5$, $p_a = 0$.** Using
`rocket.Cf(gamma, eps, p0, pa)`:

| $r$ | $C_{F,vac}$ | $I_{vac} = c^* C_F/g_0$ (s) |
|---|---|---|
| 4.0 | 1.9390 | **479.3** |
| 6.0 | 2.0081 | **475.9** |
| 8.0 | 2.0278 | **448.5** |

**Step 4 — read the result.**

- From $r=4$ to $r=8$, $T_0$ rises 26 % but $\mathcal{M}$ rises 63 %. $T_0/\mathcal{M}$
  falls from 296.7 to 228.5 — a 23 % fall — so $\sqrt{T_0/\mathcal{M}}$ falls 12.2 %.
  $\Gamma$ falls 1.9 % over the same span, giving 1.9 % back, and the net fall in $c^*$
  is 10.5 %. **$\mathcal{M}$ beats $T_0$.**
- $C_F$ moves the *other* way (2.03 versus 1.94) because the hotter, higher-$\mathcal{M}$
  exhaust has a lower $\gamma$, but the effect is only 4.6 % against $c^*$'s 10.5 %, so
  $c^*$ wins the product.
- $I_{sp}$ therefore peaks fuel-rich. Net: $-10.5\,\% + 4.6\,\% = -6.4\,\%$ from $r=4$ to
  $r=8$, which is the 479.3 → 448.5 s in the table. Running near-stoichiometric costs
  about 31 s against $r=4$ in this constant-$\gamma$ estimate, and about 16 s against the
  true optimum in the full equilibrium calculation of §3.6.

**Step 5 — but where exactly is the optimum?** These three points bracket it but do not
locate it. A finer sweep (§3.6) puts the vacuum $I_{sp}$ maximum at $r \approx 5.0$ at
$\varepsilon = 77.5$, with 466.1 s, and the $c^*$ maximum near $r \approx 3.5$. Between
$r=5$ and $r=6$ the $I_{sp}$ penalty is only 1.3 s — a flat optimum — which is exactly
why designers feel free to move oxidizer-ward for tank volume.

**A caveat on method.** Steps 2–3 used a *single constant* $\gamma_s$ taken at the
chamber. That is exact for $c^*$ (2323.8 versus 2323.4 from a full equilibrium
integration — 0.02 %) because $c^*$ only involves the chamber and throat, where $\gamma$
has barely moved. It is optimistic for $I_{sp}$: the full equilibrium expansion gives
459.8, 464.8 and 450.2 s, so the constant-$\gamma$ shortcut is 4–20 s high, and worst at
the lowest mixture ratio where the composition shifts most. **Use constant-$\gamma$
formulas for $c^*$ and for trends; use CEA for the $I_{sp}$ number you put in a
proposal.** [J]

**Sanity check.** RS-25 runs $r = 6.03$ and delivers 452.3 s vacuum at $\varepsilon = 69$
[from `reference/_verify-liquid.md`]. Our $r=6$, $\varepsilon = 77.5$ equilibrium
theoretical is 464.8 s. Adjusting to $\varepsilon = 69$ gives about 463 s, so the RS-25
delivers 97.7 % of theoretical — precisely where a well-developed staged-combustion
engine should sit (§3.10).

### 5.4 Worked Example 4 — Picking $\varepsilon$ from a CEA table

**Problem.** You are sizing the nozzle for a sea-level-started LOX/LH2 booster engine:
$p_c = 117$ bar, $r = 6.1$, equilibrium expansion. Requirement: the nozzle must not
suffer flow separation at sea level. Use the Summerfield criterion, $p_e \geq 0.4\,p_a$
with $p_a = 1.013$ bar [E], to pick $\varepsilon$. Then compute what that costs in vacuum
$I_{sp}$ against a large-$\varepsilon$ alternative, and compare with what Vulcain 2
actually does.

**The CEA table** (equilibrium, $p_c = 117$ bar, $r = 6.1$, $T_0 = 3562$ K,
$\mathcal{M} = 13.70$, $c^* = 2308$ m/s, throat at 67.4 bar / 3360 K):

| $A_e/A_t$ | $P$, BAR | $T$, K | $I_{vac}$ (s) | $I_{sp}$ at 1.013 bar (s) | $C_{F,vac}$ |
|---|---|---|---|---|---|
| 5.0 | 4.0676 | 2365 | 391.0 | 380.9 | 1.6618 |
| 10.0 | 1.5918 | 2035 | 416.1 | 395.8 | 1.7684 |
| 20.0 | 0.6338 | 1733 | 436.0 | 395.2 | 1.8527 |
| 30.0 | 0.3715 | 1571 | 445.7 | 384.5 | 1.8939 |
| 40.0 | 0.2545 | 1462 | 451.8 | 370.3 | 1.9201 |
| 50.0 | 0.1899 | 1382 | 456.2 | 354.4 | 1.9388 |
| 58.5 | 0.1545 | 1327 | 459.2 | 340.0 | 1.9513 |
| 70.0 | 0.1221 | 1267 | 462.3 | 319.7 | 1.9647 |
| 90.0 | 0.0877 | 1185 | 466.5 | 283.1 | 1.9824 |

**Step 1 — the target exit pressure.** $p_e = 0.4 \times 1.013 = 0.405$ bar.

**Step 2 — interpolate.** The target lies between $\varepsilon = 20$ ($p_e = 0.6338$) and
$\varepsilon = 30$ ($p_e = 0.3715$). Because $p_e$ varies as roughly a power law in
$\varepsilon$, interpolate logarithmically:

$$f = \frac{\ln(0.405/0.6338)}{\ln(0.3715/0.6338)} = \frac{-0.4477}{-0.5343} = 0.838$$
$$\varepsilon = 20\left(\frac{30}{20}\right)^{0.838} = 20 \times 1.405 = 28.1$$

**Step 3 — cross-check with the constant-$\gamma$ formula.** With $\gamma_s = 1.147$ and
`rocket.optimum_eps_for_pa(1.1473, 117e5, 0.405e5)`: $\varepsilon = 31.4$. That is 12 %
higher than the table value. The table is right and the formula is wrong, for the same
reason as in §5.3: $\gamma$ rises from 1.147 in the chamber to about 1.26 at the exit as
the gas recombines, and a constant chamber $\gamma$ therefore under-predicts how fast the
pressure falls. **Read $\varepsilon$ off the CEA table; use the closed form only for
trend work.** [J]

**Step 4 — the cost.** At $\varepsilon = 28$, interpolating the $I_{vac}$ column gives
about 444 s. At $\varepsilon = 58.5$, 459.2 s. **The separation constraint costs 15 s of
vacuum $I_{sp}$** — over 3 %.

**Step 5 — what the real engine does.** Vulcain 2 uses $\varepsilon = 58.2$ at
$p_c = 117.3$ bar, i.e. $p_e \approx 0.155$ bar, which is $0.15\,p_a$ — a factor of 2.6
*below* the Summerfield limit. It is heavily over-expanded at liftoff and the nozzle runs
with separated flow and side loads during start-up and the first seconds of ascent. That
is a deliberate, and correct, trade: Ariane 5 lifts off with two solid boosters providing
most of the thrust, Vulcain spends nearly all of its 600 s burn above 20 km where the
large nozzle pays, and the design problem was moved from "avoid separation" to "survive
separation", which is a structural and start-transient problem rather than a performance
one.

**Sanity check.** Note the sea-level column: it peaks near $\varepsilon = 10$–20 at about
396 s and then collapses, reaching 340 s at Vulcain 2's actual 58.2. That is the
altitude-compensation problem in one column of numbers, and it is why the sea-level
$I_{sp}$ of a large-$\varepsilon$ engine is a nearly meaningless figure of merit for a
booster that spends its life in thin air.

---

## 6. Real engines — why is the mixture ratio there?

### 6.1 Rocketdyne F-1 (LOX/RP-1, $r = 2.27$) — historical

Stoichiometric kerolox is 3.41; the F-1 runs at 2.27, $\phi = 1.50$, which is the
richest mixture ratio of any major kerolox engine [from `reference/_verify-liquid.md`].
Total flow 2,577 kg/s: 1,789 kg/s LOX, 788 kg/s RP-1.

Why so rich? Three constraints, all of them cooling and stability rather than
performance. First, the chamber is a brazed 178-tube regenerative wall cooled by RP-1,
and RP-1 has a hard coking limit — above roughly 600 K the fuel deposits carbon inside
the tubes, the wall temperature runs away, and the tube burns through. A cooler chamber
means less heat into the coolant. Second, the F-1 dumps its gas-generator exhaust into
the nozzle extension as a film-cooling curtain, which only works if there is plenty of
fuel-rich gas to dump. Third, and decisively, the F-1's development was dominated by
combustion instability: about 2,000 tests across 210 injector designs before the "5U(f)"
baffled pattern was accepted. A richer, cooler, slower-burning mixture is a less
energetic driver for a pressure oscillation.

The alternatives available in 1961 were a smaller engine (rejected on vehicle grounds), a
different fuel (LH2 was not credible at that thrust in that decade), or a higher mixture
ratio with more film cooling (which costs the same $I_{sp}$ by a different route). The
choice was right. **Would a modern engineer do the same?** No: they would use a
milled-channel copper-alloy liner (which tolerates far higher heat flux than brazed
Inconel tubes), and they would move to $r \approx 2.5$–2.6 to buy back several seconds.
The RD-180 at 2.72 and the YF-100 at 2.6 show where the technology went.

### 6.2 Aerojet Rocketdyne RS-25 (LOX/LH2, $r = 6.03$) — historical and still flying

Stoichiometric is 7.94; the $I_{sp}$ optimum at $\varepsilon = 69$ is near 5.0; the RS-25
runs 6.03. It is deliberately oxidizer-ward of the engine optimum.

The reason is the Shuttle external tank. At $r = 5.0$ the hydrogen volume per unit
propellant mass is 20 % larger than at 6.03, and hydrogen tankage on that vehicle is the
dominant driver of tank length, insulation area, and therefore dry mass and aerodynamic
load. Trading 1–2 s of $I_{sp}$ for that much tank is straightforwardly worth it.

The second reason is the cycle. The RS-25 is fuel-rich staged combustion with two
preburners each running at their own very rich mixture ratio to hold turbine inlet
temperature near 1000 K; all of that hydrogen ends up in the main chamber. The main
chamber mixture ratio is therefore not a free variable but the outcome of a power
balance that also has to satisfy pump horsepower, turbine temperature and coolant flow
constraints simultaneously.

**Would a modern engineer do the same?** For a hydrogen core stage, yes. Vulcain 2's
independent arrival at 6.1 and the LE-7A's 5.9 and RD-0120's 6.0 are convergent
evolution: with hydrogen as fuel and a large tank, everybody ends up near 6.

### 6.3 Pratt & Whitney RL10 (LOX/LH2, $r = 5.0$–5.5) — historical and modern

The RL10A-3-3A runs $r = 5.0$; the RL10C-1 runs 5.5 [from
`reference/_verify-liquid.md`]. Both are lower than the RS-25's 6.03 and both sit
essentially on the theoretical $I_{sp}$ optimum.

Two reasons, and they are different from the RS-25's. First, an upper stage's figure of
merit is $I_{sp}$ almost to the exclusion of everything else: the stage is small, the
tank penalty per second of $I_{sp}$ is much lower than on a core stage, and the $\Delta V$
is applied at the top of the gravity well where $I_{sp}$ has maximum leverage. Second and
more interesting, the RL10 is a **closed expander**: the hydrogen that drives the turbine
is the hydrogen that cooled the chamber. Turbine power scales with hydrogen mass flow
and with the heat picked up in the jacket. Running richer means more hydrogen through the
jacket, more turbine power, and more pump head — the mixture ratio is a *cycle* variable
in an expander in a way it is not in a gas generator. Low $r$ is thermodynamically
convenient as well as performance-optimal.

The move from 5.0 to 5.5 across RL10 blocks tracks the same tank-volume argument that
put the RS-25 at 6.03, applied at upper-stage scale.

### 6.4 SpaceX Merlin 1D (LOX/RP-1) — modern

SpaceX does not publish Merlin's mixture ratio. Figures near 2.3 circulate — the compiled
reference gives about 2.34 with an explicit low-confidence label — and they should be
treated as unverified rather than as data [from `reference/_verify-liquid.md`].

What *is* published constrains it. Merlin is a gas-generator engine at $p_c = 97$ bar
with a milled-channel RP-1-cooled chamber and a pintle injector, sea-level $I_{sp}$ 282 s
and vacuum 311 s, and the vacuum variant reaches 348 s at $\varepsilon = 165$. Those
numbers are consistent with a mixture ratio in the 2.3–2.4 band and not with 2.7: at 2.7
you would expect a couple more seconds and a hotter wall than a milled-channel
copper-alloy chamber running RP-1 coolant would comfortably take at that throttle range.
The pintle injector also argues for the lower end: pintles mix by momentum-ratio-driven
impingement of a central fuel sheet against an annular oxidizer flow, and running richer
gives a more forgiving momentum ratio across a 40–100 % throttle range.

**Would a modern engineer do the same?** They did, and the reasoning is explicitly cost
and reuse rather than $I_{sp}$: at a gas-generator cycle and 97 bar the engine was never
going to be efficient, so mixture ratio was spent on wall life and throttle range.

### 6.5 SpaceX Raptor (LOX/CH$_4$, $r = 3.6$ claimed) — modern, and every figure is a claim

Everything in this subsection rests on SpaceX statements, several first made on social
media rather than in any document; the compiled reference labels the entire Raptor block
low-to-medium confidence and that label is part of the content
[from `reference/_verify-liquid.md`].

The claimed $r = 3.6$ against a stoichiometric 3.99 gives $\phi = 1.11$ — much closer to
stoichiometric than any hydrogen or kerosene engine in this list. Three reasons make that
plausible. First, methane's $I_{sp}$-optimal mixture ratio is genuinely higher in $\phi$
terms than hydrogen's, because excess methane does not lower $\mathcal{M}$ nearly as
effectively as excess hydrogen (it cracks to CO, H$_2$ and soot rather than surviving as
a light gas). Second, methane is an excellent regenerative coolant with no coking limit
worth the name below about 900 K, so the cooling constraint that forces kerolox rich does
not bind. Third, Raptor is full-flow staged combustion: *both* propellant streams pass
through preburners, one oxidizer-rich and one fuel-rich, and the two preburner mixture
ratios are set by turbine temperature limits while the main-chamber ratio falls out of
the overall balance. In a full-flow cycle there is no dumped flow and no film-cooling
budget to feed, which removes two of the three reasons the F-1 ran rich.

Densified propellants push the same way: subcooled LOX and LCH$_4$ raise the value of
oxidizer volume, so the density-optimal mixture ratio moves oxidizer-ward.

### 6.6 ArianeGroup Vulcain 1 → Vulcain 2 — the cleanest experiment in the literature

Vulcain 1: $r = 5.3$, $p_c = 100$ bar, $\varepsilon = 45.1$, vacuum $I_{sp}$ **431 s**.
Vulcain 2: $r = 6.1$, $p_c = 117.3$ bar, $\varepsilon = 58.2$, vacuum $I_{sp}$ **429 s**.

Chamber pressure went up 17 %, expansion ratio went up 29 %, and specific impulse went
*down* by 2 s. That is not a defect; it is the mixture-ratio curve, measured. The move
from 5.3 to 6.1 crosses the $I_{sp}$ optimum from the good side to the bad side and costs
more than the pressure and area ratio together return. Snecma made that trade knowingly
to get 19 % more thrust out of the same engine envelope for Ariane 5 ECA, and to shrink
the hydrogen tank. The higher $r$ also raised wall heat flux enough that Vulcain 2 had to
add turbine-exhaust film cooling to the lower nozzle that Vulcain 1 did not need — the
cooling penalty of running less rich, made physical.

If you ever need one example to prove that engine $I_{sp}$ is not the vehicle's objective
function, this is it. [from `reference/_verify-liquid.md`]

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade space around mixture ratio

Mixture ratio is chosen against at least six objectives, and it is never the engine's
$I_{sp}$ alone. [J]

| objective | pushes $r$ | mechanism |
|---|---|---|
| engine vacuum $I_{sp}$ | to the optimum (5.0 for LOX/LH2 at high $\varepsilon$) | $\sqrt{T_0/\mathcal{M}}$ |
| bulk propellant density / tank mass | up (oxidizer-ward) | LOX is 16× denser than LH2 |
| chamber wall heat flux | down (fuel-ward) | lower $T_0$, cooler boundary layer |
| coolant capacity (regen) | down for hydrogen, up for kerosene | more coolant flow vs coking limit |
| turbine inlet temperature | preburner $r$ down hard | materials limit, 700–1000 K |
| combustion stability | down | cooler, slower flame is a weaker driver |
| soot and coking (hydrocarbons) | up | rich hydrocarbon flames make carbon |

Note the last row contradicts the third: with kerosene, running rich cools the chamber
but sooty deposits on the wall are both an insulator (helpful) and a coking risk in the
coolant channels (fatal). This is why kerolox engines cluster in a narrow 2.3–2.7 band
while hydrogen engines spread over 5.0–6.1.

### 7.2 Failure modes traceable to thermochemistry

**Wall burn-through from a mixture-ratio excursion.** *Mechanism:* a propellant
utilisation valve, a pump cavitation transient or an injector element blockage shifts
local $r$ oxidizer-ward; $T_0$ and hence gas-side heat flux rise faster than the coolant
can absorb; wall temperature exceeds the liner's limit. *Symptom:* a localised hot streak,
then a coolant-channel breach and a sudden chamber-pressure drop with a coolant flow
spike. *Evidence:* thermocouple divergence between adjacent channels before the event;
post-test, a single melted channel with adjacent channels intact. *Fix:* mixture-ratio
excursion limits in the control law, and a wall-temperature margin sized on the *worst*
corner of the excursion box, never on nominal.

**Oxidizer-rich streaking at the injector face.** *Mechanism:* one fuel orifice partially
blocked, so its neighbouring oxidizer flow burns at a locally very high $r$ — locally
near-stoichiometric, hundreds of kelvin hotter than the design point. *Symptom:* injector
face erosion in a pattern matching the element layout. *Evidence:* face inspection;
$c^*$ efficiency drop of a percent or two before any visible damage. *Fix:* filtration,
orifice inspection, and face materials (or a face-cooling flow) sized for a
stoichiometric local excursion rather than the average.

**Over-prediction of performance from the wrong CEA option.** *Mechanism:* quoting
equilibrium $I_{sp}$ with no efficiency chain, or quoting an infinite-area-combustor
$c^*$ against a measured finite-area chamber pressure. *Symptom:* the engine appears to
be 4–6 % "underperforming" from its first test and never recovers. *Evidence:* the
discrepancy is constant across power levels, which no real loss mechanism is. *Fix:* fix
the bookkeeping, not the engine. This is the single most common way a programme
manufactures a crisis that does not exist.

### 7.3 Materials

Thermochemistry sets the material problem. LOX/LH2 exhaust at 3600 K contains 3.5 % OH
and 2.6 % atomic H, both of which are aggressive: atomic hydrogen embrittles nickel
alloys and diffuses through thin sections, which is one reason the RS-25's NARloy-Z
copper liner has an electroformed nickel closeout rather than the reverse. Kerolox
exhaust is cooler but carries soot and CO, and CO at high temperature will carburise
steels. Storable N$_2$O$_4$/hydrazine exhaust contains no free oxygen worth mentioning
(the fuel's nitrogen sweeps it up) but is corrosive on the propellant side long before
combustion.

### 7.4 Manufacturing and testing

**What is measured.** $c^*$ efficiency is the primary thermochemical measurement from any
hot fire, and it needs exactly four instruments: chamber pressure (injector-end and
throat-end, because the difference is the finite-area correction), oxidizer flow,
fuel flow, and a measured throat area (which changes with erosion and with thermal
growth — a hot throat is 0.5–1 % larger than a cold one, and forgetting that biases
$\eta_{c^*}$ by the same amount).

**What the data looks like when it is wrong.** A plot of $\eta_{c^*}$ against mixture
ratio across a test series should be a shallow inverted parabola peaking near the design
point. If it rises monotonically with $r$ across the whole range, your flowmeter
calibration is off and you are not running the mixture ratio you think you are. If it is
flat and low, the injector is not mixing. If it drops only at high $p_c$, the chamber is
too short — residence time, not mixing.

**A note on $L^*$.** Combustion needs time. The characteristic length $L^* = V_c/A_t$ is
the crude proxy for residence time, and $\eta_{c^*}$ climbs with $L^*$ until vaporisation
and mixing are complete and then flattens. Module 06 covers this; the thermochemical
point is that CEA's answer assumes $L^* = \infty$.

---

## 8. Misconceptions, and what engineers actually care about

**"Stoichiometric gives maximum performance."** It gives maximum, or near-maximum,
*temperature*. Performance goes as $\sqrt{T_0/\mathcal{M}}$, and running fuel-rich lowers
$\mathcal{M}$ faster than it lowers $T_0$. Every flying bipropellant engine is fuel-rich,
most of them by 25–60 %.

**"Engines run fuel-rich to protect the chamber walls."** That is a genuine secondary
reason, but it is not the primary one. Even with an infinitely capable wall you would
still run fuel-rich, because that is where $I_{sp}$ peaks. The cooling argument explains
why some engines (F-1 at 2.27) run *richer* than their $I_{sp}$ optimum, not why they run
rich at all.

**"Higher chamber pressure gives higher $I_{sp}$ because combustion is more complete."**
It gives higher $I_{sp}$ mainly because it gives a larger pressure ratio to expand
through, which is a $C_F$ effect and lives in Module 03. The dissociation suppression is
real (§3.5) but is worth only about 3–4 % on $c^*$ for a tenfold pressure increase.

**"CEA gives the specific impulse."** CEA gives *a* specific impulse, for a
one-dimensional, perfectly mixed, inviscid nozzle with either infinitely fast or
infinitely slow chemistry, at a chamber pressure defined in a way you may not have
noticed. Real engines deliver 93–98 % of it, and which end of that band depends mostly on
the engine cycle, not the propellant.

**"Frozen flow is the conservative choice, so use it."** It is a bound, not an estimate,
and it is a bad estimate for a large hydrogen nozzle — 17 s low in the example of §3.7.
Conservatism in the wrong place is as expensive as optimism: size a stage on frozen
$I_{sp}$ and you carry propellant you do not need.

**"$\gamma$ is about 1.2 for rocket exhaust, so just use 1.2."** For $c^*$ that is nearly
harmless, because $\Gamma(\gamma)$ varies only 3 % over the whole plausible range. For a
high-area-ratio $C_F$ it is not: $\gamma$ rises down the nozzle as the gas recombines,
and using the chamber value overpredicts $I_{sp}$ by 1–5 %.

**"CEA's `Isp` output is the specific impulse."** It is the momentum-only exhaust
velocity, correct only for a perfectly expanded nozzle. Use `Ivac` and subtract
$p_a A_e/\dot m$ yourself.

**"Molar mass is fixed by the propellants."** It is fixed by the propellants *and the
mixture ratio and the pressure and the expansion*. In the block of §3.9 it runs from
13.619 to 14.112 within one nozzle.

### What engineers actually care about

1. **$\eta_{c^*}$ on the last hot fire.** It is the one number that separates "the
   injector works" from "the injector does not", it is cheap to measure, and it moves
   first when anything is wrong.
2. **The mixture-ratio excursion box, not the nominal point.** Nominal $r$ is a
   spreadsheet entry; the range of $r$ the engine must survive across throttle, tank
   drainage, PU valve authority and off-nominal pump behaviour is what sizes the wall.
3. **Which $p_c$ everyone is quoting.** Injector-end, throat-end or CEA's infinite-area
   value: 1–3 % apart, and every performance comparison in the literature is polluted by
   people not saying which.
4. **The efficiency chain from CEA to delivered, itemised.** A programme that quotes
   "97 % of theoretical" without saying which theoretical, and without the four terms of
   Eq. 3.9 broken out, cannot tell you whether a shortfall is the injector, the nozzle or
   the cycle.
5. **Whether the propellant thermochemical data is the same data everyone else used.**
   RP-1's assumed formula and heat of formation vary between sources by enough to move
   $I_{sp}$ a second. Cite your reactant card.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can state that rocket engines run fuel-rich of
stoichiometric, explain in plain language that $I_{sp}$ goes as $\sqrt{T_0/\mathcal{M}}$
and that light exhaust beats hot exhaust, name the stoichiometric O/F of LOX/LH2 (7.9)
and LOX/RP-1 (3.4) and roughly where real engines run (6 and 2.3–2.7), say what CEA is
and who wrote it, and name RS-25 and F-1 as examples at the two ends of the O/F scale.

**Level 2 — Working engineering knowledge.** You can balance the combustion equation for
any of the five pairs and compute $r_{st}$ and $\phi$ without notes; set up and solve an
adiabatic-flame-temperature enthalpy balance with a $c_p(T)$ polynomial and correctly
handle cryogenic reactant enthalpy; write $K_p$ for a dissociation reaction and predict
the direction and rough size of the pressure effect; build a CEA input deck for a rocket
problem and read every line of the output block including `GAMMAs` and `(dLV/dLP)t`;
compute $c^*$ and $I_{vac}$ from $(T_0, \mathcal{M}, \gamma)$; and convert a theoretical
$I_{sp}$ to a delivered one with a defended efficiency chain.

**Level 3 — Interview mastery.** Given an unfamiliar engine's propellants, cycle,
chamber pressure and expansion ratio, you can estimate its mixture ratio to within about
10 % and defend the estimate from cooling, cycle and density arguments; explain why
Vulcain 2 has lower $I_{sp}$ than Vulcain 1; argue both sides of frozen versus
equilibrium for a specific nozzle and say what measurement would settle it; identify from
a $c^*$-efficiency-versus-mixture-ratio plot whether the problem is mixing, residence
time or instrumentation; and say which of CEA's assumptions you would abandon first for a
given unusual propellant (aluminised solid, oxidizer-rich preburner, gelled hydrocarbon)
and what tool you would reach for instead.

---

## 10. Problems

### Conceptual

**C1.** Two propellant combinations have identical $T_0 = 3400$ K. Combination A has
$\mathcal{M} = 12$ kg/kmol, combination B has $\mathcal{M} = 22$ kg/kmol. Without
computing $\Gamma$, estimate the ratio of their $c^*$ values and explain why $\gamma$ is
unlikely to change your conclusion.

**C2.** Explain, in terms of Le Chatelier's principle and $\Delta n$ for the reaction,
why raising chamber pressure raises $T_0$. Then explain why the effect saturates: what
happens to $\alpha$ as $p \to \infty$, and why does the flame temperature not keep
rising?

**C3.** A colleague argues that since dissociation absorbs energy in the chamber and
releases it in the nozzle, it is thermodynamically neutral and can be ignored for
$I_{sp}$ purposes. Give the strongest version of their argument, then say precisely where
it fails.

**C4.** Why do rocket engineers quote O/F by mass rather than equivalence ratio? Give
three reasons and identify which one would still apply if every propellant were a pure
compound with a known formula.

**C5.** CEA's chamber `Cp` for LOX/LH2 at $r=6$ is 7.32 kJ/(kg·K) while the frozen value
is 3.80. Explain the difference physically, and say which one you would use in (a) a
Bartz heat-transfer correlation, (b) a nozzle isentropic relation, (c) an estimate of how
much the chamber gas temperature drops if 1 % of the enthalpy is lost to the wall.

**C6.** The RL10 runs $r = 5.0$ and the RS-25 runs $r = 6.03$ on the same propellants.
Both are considered excellent engines. Explain how both can be right.

**C7.** In the CEA block of §3.9, `(dLV/dLP)t` is $-1.019$ in the chamber and exactly
$-1.00000$ at the exit. What physical statement is the exit value making, and what would
it mean if a run showed $-1.004$ at the exit instead?

**C8.** A solid motor's CEA output shows Al$_2$O$_3$(L) among the products. Explain why
both the equilibrium and the frozen $I_{sp}$ from that run are optimistic, and name the
loss mechanism neither captures.

### Calculation

**N1.** Balance the combustion of ethanol (C$_2$H$_5$OH) with liquid oxygen and compute
$r_{st}$ by mass. The V-2 ran 75 % ethanol / 25 % water by mass at an O/F of about 1.18;
compute $\phi$ for the pure-ethanol stoichiometry and comment on what the water does.

**N2.** For LOX/CH$_4$ at $r = 3.6$, compute the product moles per kmol of CH$_4$
assuming complete combustion to CO$_2$, H$_2$O and excess CH$_4$ only, and hence
$\mathcal{M}$ of that (unrealistic) product mixture. Then explain in one paragraph why
the real $\mathcal{M}$ is lower.

**N3.** Compute $T_{ad}$ for LOX/LH2 at $r = 5.0$ by the method of §5.2, cryogenic
reactants, no dissociation. Use the same $c_p$ fits and the same
$h(1000)-h(298.15)$ values. Compare with the equilibrium value of 3356 K from §3.6 and
state the percentage error.

**N4.** From the table in §3.6, compute $c^*$ at $r = 5.0$ and $r = 7.0$ using
Eq. 3.1 and confirm the tabulated values to within 1 %. Then compute the percentage
change in $T_0$, in $\mathcal{M}$ and in $c^*$ between those two points, and verify
numerically that $c^*$ tracks $\sqrt{T_0/\mathcal{M}}$.

**N5.** Using the $K_p$ table in §3.5 and Eq. 3.7, compute the degree of dissociation
of pure steam at 3000 K and 100 bar. Compare with the 3600 K, 100 bar case and explain
which of temperature or pressure has more leverage over this range.

**N6.** A LOX/RP-1 engine has measured injector-end $p_c = 68.0$ bar, hot throat area
$0.3050$ m², LOX flow 850 kg/s and RP-1 flow 340 kg/s. Theoretical $c^*$ at that mixture
ratio and pressure is 1795 m/s. Compute the mixture ratio, the delivered $c^*$ and
$\eta_{c^*}$, and say whether this injector is acceptable. Then state what happens to
your answer if you had used the cold throat area, which is 0.7 % smaller.

**N7.** From the CEA table in §5.4, find the area ratio at which the sea-level $I_{sp}$
is maximum, and the exit pressure there. Compare that exit pressure with ambient and
comment on the relationship you find.

**N8.** An engine delivers 340 s vacuum $I_{sp}$. CEA equilibrium at its operating point
gives 366 s. Its measured $\eta_{c^*}$ is 0.965 and it is a gas-generator cycle dumping
4 % of total flow at an effective $I_{sp}$ of 180 s. Compute the implied $\eta_{C_F}$ and
say whether the nozzle is good, average or poor.

### Engineering reasoning

**R1.** You are given two CEA runs for the same propellants, mixture ratio and area
ratio. Run A reports $I_{vac} = 452$ s, run B reports 437 s. Both are labelled
"equilibrium". List every input difference that could produce a 15 s gap, ranked by how
likely each is, and say what single line of each output block you would check first.

**R2.** A test series sweeps mixture ratio from 2.0 to 2.8 on a kerolox engine at fixed
chamber pressure. $\eta_{c^*}$ is 0.94 at $r=2.0$, 0.975 at $r=2.4$, and 0.955 at
$r=2.8$. Wall thermocouples show a monotonic rise across the whole sweep. Interpret both
trends physically and recommend the operating point, stating what additional data you
would want.

**R3.** An upper-stage engine programme proposes moving from $r = 5.2$ to $r = 5.8$ to
shorten the hydrogen tank by 1.1 m. CEA says the change costs 2.4 s of vacuum $I_{sp}$.
Set out the calculation you would demand before agreeing, name the three quantities you
need from the vehicle side, and state the condition under which the trade is clearly
good.

**R4.** A small 22 N hydrazine-family thruster is predicted by CEA equilibrium to deliver
310 s and by CEA frozen to deliver 292 s. It measures 285 s on the test stand. Give two
distinct explanations, say what measurement distinguishes them, and say which you would
bet on.

### Mini trade study

**T1.** You are selecting the main-chamber mixture ratio for a new LOX/methane
booster engine: 2 MN sea-level thrust, $p_c = 250$ bar, full-flow staged combustion,
methane-cooled milled-channel chamber, reusable for 20 flights, first stage of a
two-stage vehicle with a return-to-launch-site profile. Stoichiometric is 3.99.
The candidate operating points are:

- **Option A:** $r = 3.0$ ($\phi = 1.33$)
- **Option B:** $r = 3.4$ ($\phi = 1.17$)
- **Option C:** $r = 3.6$ ($\phi = 1.11$)
- **Option D:** $r = 3.8$ ($\phi = 1.05$)

Constraints: chamber liner peak wall temperature must stay below 800 K; the vehicle
returns 8 % of first-stage propellant mass as landing reserve, so bulk density has an
unusually high value; both preburners must hold turbine inlet temperature below 900 K.

Recommend one option. Justify it with (a) an explicit statement of which objective you
are optimising, (b) a quantitative argument on $\sqrt{T_0/\mathcal{M}}$, (c) the cooling
and cycle constraints, and (d) what single test or calculation would most change your
recommendation.

---

## 11. Quiz (100 points)

**Q1 (8).** Stoichiometric O/F by mass for LOX/LH2 is closest to:
(a) 4.0 (b) 6.0 (c) 7.9 (d) 8.9

**Q2 (8).** In CEA rocket output, `GAMMAs` is:
(a) $c_p/c_v$ of the frozen mixture
(b) $-(\partial \ln p/\partial \ln V)_s$ of the reacting mixture
(c) the ratio of stagnation to static temperature
(d) the same as $\Gamma$ in the $c^*$ formula

**Q3 (10).** For LOX/LH2 at $r=6$, $p_c = 200$ bar: $T_0 = 3601.6$ K,
$\mathcal{M} = 13.619$ kg/kmol, $\gamma_s = 1.1473$. Compute $c^*$ in m/s.

**Q4 (10).** The same mixture at $r=8$ has $T_0 = 3743.6$ K and
$\mathcal{M} = 16.383$. By what percentage does $c^*$ change from $r=6$ to $r=8$, and in
which direction? Explain the sign in one sentence.

**Q5 (8).** Raising chamber pressure from 20 to 200 bar for LOX/LH2 at $r=6$:
(a) lowers $T_0$ because the gas is compressed
(b) raises $T_0$ by about 250 K by suppressing dissociation
(c) raises $T_0$ by about 800 K
(d) leaves $T_0$ unchanged; only $C_F$ improves

**Q6 (12).** A hand adiabatic-flame calculation for LOX/LH2 at $r=6$ with cryogenic
reactants and no dissociation gives 3926 K. Equilibrium gives 3602 K. (i) State the
mechanism for the difference. (ii) Given that the equilibrium mixture stores about
1293 kJ/kg of chemical energy in dissociated species and its frozen $c_p$ is
3.80 kJ/(kg·K), show that the mechanism accounts for the gap.

**Q7 (10).** From the §5.4 CEA table ($p_c = 117$ bar, $r = 6.1$): you need
$p_e = 0.25$ bar. What area ratio, and what vacuum $I_{sp}$ do you get? Show the
interpolation.

**Q8 (12).** An engine's CEA equilibrium $I_{vac}$ is 460 s. It is a fuel-rich
staged-combustion cycle. Measured $\eta_{c^*} = 0.98$; you assess a nozzle efficiency of
0.985. Predict delivered vacuum $I_{sp}$. The engine measures 438 s. Give the two most
likely explanations for the 6 s shortfall and say which single measurement would
distinguish them.

**Q9 (10).** Vulcain 2 has higher chamber pressure and a larger expansion ratio than
Vulcain 1, yet 2 s lower vacuum $I_{sp}$. Explain, and state the design objective that
made the trade correct.

**Q10 (12).** You are asked to predict the vacuum $I_{sp}$ of a 5 N N$_2$O$_4$/MMH
attitude-control thruster at $\varepsilon = 100$ from a CEA run. Would you quote the
equilibrium or the frozen number, and why? Name two further corrections you would apply
before giving a number to the spacecraft team, and estimate their size.

---

## 12. Further reading

- **[RP-1311]** Gordon & McBride, Parts I and II. Part I is the derivation of
  free-energy minimisation and the rocket-performance formulation, including the
  frozen-versus-equilibrium treatment and the definitions of `(dLV/dLP)t` and `GAMMAs`.
  Read Part I before trusting any output; Part II for input syntax. Free on NTRS.
- **[CEA]** and **[CEARUN]** — the code itself and the browser front end. Run the
  example deck in §3.8 and reproduce the block in §3.9 before doing anything else in
  this course.
- **[SB §5]** Sutton & Biblarz, the chemical rocket propellant performance analysis
  chapter — the standard textbook treatment of everything in this module, with
  performance-versus-mixture-ratio plots for the major combinations.
- **[JANAF]** NIST-JANAF Thermochemical Tables — the critically evaluated $c_p$, $S$,
  $\Delta_f H$ and $\log K_f$ data underlying every equilibrium calculation, with the
  provenance and revision date for each substance. Use it when you need to know how good
  a number is, not just what it is.
- **[CPIA-246]** JANNAF Rocket Engine Performance Prediction and Evaluation Manual —
  where the efficiency decomposition of Eq. 3.9 is actually defined, and the reference
  for how a programme is contractually required to report performance.
- **[HP §9]** Hill & Peterson — a cleaner and more physical derivation of equilibrium
  composition and the effect of dissociation on rocket performance than most propulsion
  texts manage.
- **[RPA]** — read the technical papers on the site for how a modern equilibrium solver
  is coupled to chamber sizing and cooling analysis; it is the best short description of
  what sits between CEA and a preliminary engine design.
- **[NIST-WB]** / **[REFPROP]** — real-fluid properties for the propellants themselves.
  You will need these the moment you leave the ideal-gas exhaust and start designing an
  injector or a cooling jacket.
- **[Clark]** *Ignition!* — for why the propellant combinations in §3.2 are the ones that
  survived, and what happened to the several hundred that did not. Not a source of
  numbers; an indispensable source of judgment.
