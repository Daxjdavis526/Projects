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
$I_{sp}$ optimum is near 5.0; flying engines sit at 5.0–6.1. Running stoichiometric
would cost about 16 s of vacuum $I_{sp}$ against the optimum, and would raise $T_0$ by
140 K into a wall-heat-flux regime nobody wants.

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
