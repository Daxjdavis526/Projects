# Module 01 — Thermodynamics for Propulsion: Answer Key

Key for `01-thermodynamics.md`. Constants: $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p^\circ = 1$ bar, $T^\circ = 298.15$ K.

Numbers are carried at full precision internally and reported to four
significant figures; last-digit differences from your own arithmetic are not
errors. Every calculation here is reproducible with `tools/rocket.py` and the
entries in `tools/examples/01.py`.

---

## K1. Problem solutions

### Conceptual

#### P1

| quantity | behaviour | reason |
|---|---|---|
| $h_0$ | **constant** | Eq. 3.4: adiabatic, no shaft work, no mass addition. Friction is an internal force and does no net work on the control volume, so it cannot change total enthalpy. |
| $T_0$ | **constant to the extent the gas is calorically perfect** | $T_0$ tracks $h_0$ only through $h = c_pT$. With $c_p$ varying ~15 % over a rocket nozzle, "constant $T_0$" is an approximation [A], and the exact statement is the $h_0$ one. |
| $p_0$ | **falls** | Friction generates entropy; Eq. 3.5 says $s_{gen} = -R\ln(p_{0,2}/p_{0,1})$, so $s_{gen}>0$ requires $p_{0,2}<p_{0,1}$. |
| $s$ | **rises** | Second law for adiabatic flow: $s_2-s_1 = s_{gen} \ge 0$, with equality only for a reversible process. |

A grader wants to see the candidate distinguish the *energy* statement
($h_0$, $T_0$) from the *availability* statement ($p_0$, $s$). Writing "the flow
is not isentropic so nothing is conserved" loses most of the marks.

#### P2

Enthalpy exists because a flowing fluid crossing a control surface must be
pushed across it against the local pressure, and that flow work is $p/\rho$ per
unit mass. Defining $h = u + p/\rho$ absorbs the flow work into the state
variable so the energy equation for an open system has the same shape as the
first law for a closed one. Track $u$ instead and you must carry the $p/\rho$
term explicitly at every station, and you will eventually drop it.

Magnitude:
$$\frac{p/\rho}{h} = \frac{RT}{c_pT} = \frac{R}{c_p} = \frac{600.54}{3742.1} = 0.1605$$

**16 % of the enthalpy is flow work.** (Equivalently $R/c_p = (\gamma-1)/\gamma =
0.1912/1.1912 = 0.1605$ ✓ — a useful identity: the flow-work fraction of enthalpy
is exactly $(\gamma-1)/\gamma$.)

#### P3

Both engines lose stagnation pressure between the injector face and the throat by
Eq. 3.8. Compute the chamber-exit Mach number from the subsonic root of the
area–Mach relation, then the loss factor
$\left(1+\tfrac{\gamma-1}{2}M^2\right)^{\gamma/(\gamma-1)}/(1+\gamma M^2)$, using
$\gamma = 1.20$:

| $\varepsilon_c$ | $M_2$ | $p_{0,t}/p_{inj}$ | loss |
|---|---|---|---|
| 1.8 | 0.3519 | 0.9373 | 6.27 % |
| 4.0 | 0.1498 | 0.9870 | 1.30 % |

Since $\dot m = \Gamma p_{0,t}A_t/\sqrt{RT_0}$ and, at the same $\gamma$,
$\mathcal{M}$, $T_0$ and $\varepsilon$, thrust is proportional to $p_{0,t}A_t$,
the $\varepsilon_c = 4.0$ engine delivers

$$\frac{0.9870}{0.9373} - 1 = 5.3\ \%$$

**more thrust for the same throat area and the same quoted chamber pressure.**
The lesson: two engines can quote identical $p_c$ and differ by 5 % in delivered
thrust purely because of chamber geometry, and the datasheet will not tell you.

#### P4

Three errors, ranked:

1. **Dissociation neglected — largest, ~390 K.** At 3600–4000 K roughly 4–6 % of
   the product moles are H, OH, O and O₂; forming them absorbed energy that never
   became sensible heat. This is physics, not bookkeeping, and it cannot be fixed
   by being careful. [F]
2. **Cryogenic reactant enthalpy omitted — ~260 K.** LH₂ at 20.3 K and LOX at
   90.2 K enter with about $-9.0$ and $-13.0$ kJ/mol relative to their 298 K
   gaseous references. This one is pure bookkeeping and is exactly calculable.
3. **Adiabatic assumption — smallest here, but not zero.** A real chamber loses
   heat to a regeneratively cooled wall. For a large engine this is well under
   1 % of the enthalpy flux and moves $T_0$ by tens of kelvin at most; for a small
   thruster with a high surface-to-volume ratio it is not negligible. [A]

A fourth answer earns credit: the *recovery* temperature that actually drives
convective heat flux is not $T_0$ but $T_{aw} = T_0(1+r\frac{\gamma-1}{2}M^2)/
(1+\frac{\gamma-1}{2}M^2)$ with $r \approx 0.9$ (Module 10), which is below $T_0$
in the accelerating flow.

#### P5

**Le Chatelier, in words.** $\mathrm{H_2O \rightarrow H_2 + \tfrac12 O_2}$ turns
1 mole into 1.5 moles. At fixed temperature and pressure, more moles means more
volume. Compressing the system therefore favours whichever side occupies less
volume — the undissociated side. Raise the pressure and the equilibrium retreats
toward H₂O.

**With $K_p$.** $K_p = \frac{x_{H_2}x_{O_2}^{1/2}}{x_{H_2O}}(p/p^\circ)^{1/2}$
depends on temperature only. The pressure appears raised to
$\Delta n = \sum\nu_i = +\tfrac12$. So if $p$ rises and $K_p$ cannot, the mole-
fraction group must fall — the composition must shift back toward the reactant.
In the small-$\alpha$ limit the group goes as $\alpha^{3/2}$, giving
$\alpha \propto p^{-1/3}$ (Eq. 3.16).

#### P6

| explanation | confirming/eliminating step |
|---|---|
| Reference $c^*_{ideal}$ computed frozen when the engine runs near equilibrium | recompute $c^*_{ideal}$ with a CEA equilibrium run at the same MR and $p_c$; a frozen-to-equilibrium shift of 2–4 % is expected for LOX/LH₂ |
| $p_c$ used is the injector-face value where $c^*$ needs throat stagnation | apply Eq. 3.8 with the engine's actual $\varepsilon_c$; the correction is 1–5 % and is a fixed multiplier across the throttle range |
| Throat area wrong — thermal growth, erosion, or a cold measurement used hot | measure $A_t$ before and after the test; for an uncooled or ablative throat, model the hot dimension |
| $\dot m$ under-counted — film coolant, turbine exhaust, or a mis-calibrated flowmeter | close the mass balance independently from tank level or a second meter; check whether the GG/preburner flow is inside or outside the accounting |

A fifth: the reference $T_0$ or $\mathcal{M}$ was taken from a CEA run at a
different mixture ratio than the test actually ran.

#### P7

The argument confuses two roles that $\gamma$ and $\mathcal{M}$ play.

For a cold-gas thruster, $I_{sp} \propto c^* C_F$ and
$c^* = \sqrt{RT_0}/\Gamma(\gamma) = \sqrt{R_uT_0/\mathcal{M}}/\Gamma(\gamma)$.
Argon's $\mathcal{M} = 39.95$ against helium's 4.003 — a factor of 10. At the
same tank temperature that is a factor $\sqrt{10} = 3.16$ in $c^*$, and no
$\gamma$ argument touches it. Helium wins on $I_{sp}$ by roughly 3×.

Where the colleague has a point: helium's **storage density** is dreadful. It
must be stored at very high pressure with a real-gas $Z \approx 1.2$ at 300 bar,
in a heavy bottle, and it leaks through seals that hold nitrogen. Argon (or
nitrogen) gives far more impulse per unit of *tank volume and tank mass* even
though it gives far less per unit of propellant mass. That is the density-impulse
argument of Module 28, and it is why flight cold-gas systems overwhelmingly use
GN₂ rather than helium.

Full marks require both halves: helium wins decisively on $I_{sp}$; the argument
for the heavier gas is a systems argument about tankage, not a thermodynamic one,
and $\gamma$ is nearly irrelevant to the choice.

#### P8

Recombination consumes free radicals and combines them into stable molecules:
$\mathrm{H + OH + M \to H_2O + M}$ turns two particles into one. Fewer moles of
gas for the same mass means a higher molar mass, since
$\mathcal{M} = m_{tot}/n_{tot}$. In §5.4 the mole count falls from 1.0000 to
0.9789 per original mole and $\mathcal{M}$ rises from 13.845 to 14.14 kg/kmol,
a 2.1 % increase.

Higher $\mathcal{M}$ *hurts*: it lowers $R$ and therefore $c^*$, roughly as
$\mathcal{M}^{-1/2}$, i.e. about $-1.1$ % here.

The net is still strongly positive because the same recombination releases
0.792 MJ/kg of chemical energy — worth up to $+4$ % in $I_{sp}$ (§5.4). Energy
release beats the molar-mass penalty by roughly 4:1 in this case. A good answer
notes that this ratio is propellant-dependent and that the molar-mass penalty is
part of why the equilibrium gain is not simply proportional to stored chemical
energy.

### Calculation

#### C1

$$R = \frac{8314.46}{22.2} = 374.53\ \mathrm{J/(kg\,K)}$$
$$c_p = \frac{\gamma R}{\gamma-1} = \frac{1.22\times374.53}{0.22} = 2076.9\ \mathrm{J/(kg\,K)}$$
$$c_v = \frac{R}{\gamma-1} = \frac{374.53}{0.22} = 1702.4\ \mathrm{J/(kg\,K)}$$

Check: $2076.9 - 1702.4 = 374.5 = R$ ✓.

*Sanity:* $c_p$ here is about twice air's 1005 J/(kg·K) and about 55 % of the
LOX/LH₂ value of 3742 J/(kg·K) in §5.2 — exactly the ordering you would expect
from the molar masses 29, 22.2 and 13.8.

#### C2

$R = 8314.46/22.0 = 377.93\ \mathrm{J/(kg\,K)}$; $c_p = 1.20(377.93)/0.20 =
2267.6\ \mathrm{J/(kg\,K)}$.

**(a)** Subsonic root of the area–Mach relation at $A/A^* = 2.0$, $\gamma=1.20$:
$$M_2 = 0.3122$$

**(b)** $T_0/T = 1 + 0.10(0.3122)^2 = 1.009747 \Rightarrow T_2 = 3400/1.009747 =
3367.2\ \mathrm{K}$.
Isentropic static pressure would be $70/1.05995 = 66.04$ bar; the *correct*
static pressure from momentum is
$$p_2 = \frac{70}{1 + 1.20(0.3122)^2} = \frac{70}{1.11696} = 62.67\ \mathrm{bar}$$
Report 62.67 bar and say why: the acceleration is driven by heat release, not by
an isentropic area change, so the isentropic value is wrong.

**(c)** $a_2 = \sqrt{1.20\times377.93\times3367.2} = 1235.7$ m/s;
$V_2 = 0.3122\times1235.7 = 385.8$ m/s.

**(d)** $p_{0,2} = 62.67\times1.05995 = 66.43$ bar, so
$$\frac{p_{0,2}}{p_{inj}} = 0.94892 \Rightarrow \textbf{5.11 \% loss}$$

**(e)** $s_{gen} = -R\ln(0.94892) = 377.93\times0.052437 = 19.81\ \mathrm{J/(kg\,K)}$.

**(f)** $\Gamma(1.20) = 0.6485$; $c^*_{ideal} = \sqrt{377.93\times3400}/0.6485 =
1133.5/0.6485 = 1747.9$ m/s.

**Comment.** Against §5.1's 2.29 % at $\varepsilon_c = 3.0$, halving the
contraction ratio to 2.0 more than doubles the loss to 5.11 %. The loss scales
roughly as $M_2^2$ and $M_2 \sim 1/\varepsilon_c$, so it goes roughly as
$\varepsilon_c^{-2}$ — which is why the practical floor on contraction ratio is
around 2 and why small thrusters, where chamber mass hardly matters, run
$\varepsilon_c$ of 5–10.

#### C3

$\mathcal{M} = \sum x_i\mathcal{M}_i$:

| species | $x_i$ | $\mathcal{M}_i$ | $x_i\mathcal{M}_i$ | $Y_i$ | $\bar c_{p,i}$ | $x_i\bar c_{p,i}$ |
|---|---|---|---|---|---|---|
| H₂O | 0.30 | 18.0153 | 5.4046 | 0.2583 | 57.6 | 17.280 |
| CO | 0.24 | 28.0101 | 6.7224 | 0.3213 | 36.5 | 8.760 |
| CO₂ | 0.16 | 44.0095 | 7.0415 | 0.3366 | 61.0 | 9.760 |
| H₂ | 0.20 | 2.0159 | 0.4032 | 0.0193 | 38.3 | 7.660 |
| OH | 0.04 | 17.0073 | 0.6803 | 0.0325 | 37.4 | 1.496 |
| H | 0.03 | 1.0079 | 0.0302 | 0.0014 | 20.786 | 0.624 |
| O₂ | 0.01 | 31.9988 | 0.3200 | 0.0153 | 40.8 | 0.408 |
| O | 0.02 | 15.9994 | 0.3200 | 0.0153 | 20.9 | 0.418 |
| **sum** | 1.00 | | **20.9222** | **1.0000** | | **46.4056** |

$$\mathcal{M} = 20.92\ \mathrm{kg/kmol},\qquad R = \frac{8314.46}{20.9222} = 397.40\ \mathrm{J/(kg\,K)}$$
$$c_p = \frac{46.4056}{20.9222}\times1000 = 2218.0\ \mathrm{J/(kg\,K)},\qquad c_v = 2218.0-397.4 = 1820.6\ \mathrm{J/(kg\,K)}$$
$$\gamma = \frac{2218.0}{1820.6} = 1.2183$$
$$\Gamma(1.2183) = 0.6520,\qquad c^*_{ideal} = \frac{\sqrt{397.40\times3500}}{0.6520} = \frac{1179.3}{0.6520} = 1808.7\ \mathrm{m/s}$$

**Comparison with §5.2 (LOX/LH₂):** $\mathcal{M}$ is 20.92 against 13.845 — 51 %
higher, which alone costs $\sqrt{13.845/20.92} = 0.814$, i.e. **19 % of $c^*$**.
$\gamma$ is 1.218 against 1.191, slightly higher, which slightly *reduces* $C_F$
at a given area ratio (a higher $\gamma$ means less of the enthalpy is
recoverable before the temperature bottoms out). The temperature difference
(3500 vs 3600 K) is worth only $\sqrt{3500/3600} = 0.986$, 1.4 %. **The molar
mass is the whole story**, and it is why kerolox $c^*$ lands near 1800 m/s and
LOX/LH₂ near 2280 m/s. Full marks require identifying $\mathcal{M}$ as dominant
and quantifying it.

*Sanity:* 1808.7 m/s is right for a kerolox $c^*$; delivered values are 1650–1750
m/s (see §6.1's F-1 back-out at ~1663 m/s).

#### C4

Stoichiometry at MR = 4.0:
$$n_{O_2} = 4.0\times\frac{2.0159}{31.9988} = 0.25200,\quad
\mathrm{H_2} + 0.252\,\mathrm{O_2} \to 0.50399\,\mathrm{H_2O} + 0.49601\,\mathrm{H_2}$$
$$Q = 0.50399\times241.826 = 121.88\ \mathrm{kJ\ per\ mol\ H_2}$$

Solving $0.50399[H_{H_2O}(T)-H(298)] + 0.49601[H_{H_2}(T)-H(298)] = Q$ with
[JANAF] sensible enthalpies:

$$T_{ad}\ (\text{298 K gaseous reactants}) = \mathbf{3299\ K}$$

Cryogenic correction: $1(-9.012) + 0.252(-12.979) = -12.283$ kJ, so
$Q_{avail} = 109.60$ kJ and

$$T_{ad}\ (\text{cryogenic liquids}) = \mathbf{3038\ K}$$

Against a CEA-class equilibrium value of ~2980 K, the no-dissociation error is
**about 58 K (2 %)**, compared with 386 K (11 %) at MR 6.

**Physical reason.** Dissociation equilibria are exponential in temperature:
$K_p = \exp(-\Delta G^\circ/R_uT)$, and $\Delta G^\circ$ for water decomposition
is strongly positive and falling with $T$. Dropping the flame from ~3990 K to
~3040 K cuts $K_p$ by roughly an order of magnitude and the dissociated fraction
by a factor of several. Below about 2500 K, dissociation is a percent-level
correction and a hand calculation with an assumed product set becomes genuinely
useful — which is why the same method that is hopeless for LOX/LH₂ at MR 6 works
tolerably for cool storables and for many solid propellants.

A strong answer also notes that the *equilibrium* $T_c$ at MR 4 is lower than at
MR 6, but $c^*$ is *higher*, because $\mathcal{M}$ drops faster than $T_0$ does
(§3.16).

#### C5

**(a)**
$$K_p = \exp\!\left(-\frac{41\,000}{8.31446\times3600}\right) = \exp(-1.3697) = \mathbf{0.2542}$$

**(b)** Small-$\alpha$ form, Eq. 3.16:
$$\alpha \approx (\sqrt2\times0.2542)^{2/3}(p/p^\circ)^{-1/3} = 0.5045\,p^{-1/3}$$
- at 32.8 bar: $0.5045/3.201 = 0.1576$
- at 206.4 bar: $0.5045/5.911 = 0.0853$

**(c)** Solving the full expression
$\frac{\alpha(\alpha/2)^{1/2}}{(1-\alpha)(1+\alpha/2)^{1/2}}p^{1/2} = K_p$
numerically:

| $p$ [bar] | $\alpha$ exact | $\alpha$ small-$\alpha$ | error |
|---|---|---|---|
| 32.8 | 0.1456 | 0.1576 | +8.2 % |
| 206.4 | 0.0819 | 0.0853 | +4.2 % |

The approximation always overestimates, and its error grows with $\alpha$ — as
expected, since it drops the $(1-\alpha)$ and $(1+\alpha/2)^{1/2}$ factors, both
of which reduce $\alpha$.

**(d)** The RL10's chamber, at 32.8 bar, is roughly **1.8× more dissociated** than
the RS-25's at 206.4 bar (exact ratio 0.1456/0.0819 = 1.78; the $p^{-1/3}$
scaling predicts 1.85). So the RL10 sits further below its no-dissociation flame
temperature. It nevertheless reaches 444 s vacuum against the RS-25's 452.3 s,
with only 1/6 the chamber pressure — because $\varepsilon = 61$, a lower mixture
ratio (5.0 vs 6.03) and therefore a lower $\mathcal{M}$, and a vacuum-only duty
cycle matter far more than the dissociation difference. **Chamber pressure is not
what makes specific impulse.**

*Caveat a good answer states:* this calculation is for pure H₂O. A real fuel-rich
chamber has a large excess of H₂, which by Le Chatelier suppresses the
decomposition well below these values. The numbers are correct as a *scaling*
demonstration and wrong as absolute composition.

#### C6

$R = 8314.46/21.0 = 395.93$ J/(kg·K); $\Gamma(1.20) = 0.6485$;
$$c^*_{ideal} = \frac{\sqrt{395.93\times3500}}{0.6485} = \frac{1177.1}{0.6485} = 1815.1\ \mathrm{m/s}$$

**(a) As reported:**
$$c^*_{delivered} = \frac{p_{inj}A_t}{\dot m} = \frac{100\times10^5\times0.0500}{290.0} = 1724.1\ \mathrm{m/s}$$
$$\eta_{c^*} = \frac{1724.1}{1815.1} = \mathbf{0.9499}$$

**(b) Corrected to throat stagnation.** At $\varepsilon_c = 2.5$, $\gamma = 1.20$:
$M_2 = 0.2447$, and
$$\frac{p_{0,t}}{p_{inj}} = \frac{(1+0.10\times0.2447^2)^{6}}{1+1.20\times0.2447^2} = 0.96698
\Rightarrow p_{0,t} = 96.70\ \mathrm{bar}$$
$$c^*_{delivered} = \frac{96.70\times10^5\times0.0500}{290.0} = 1667.2\ \mathrm{m/s},\qquad \eta_{c^*} = \mathbf{0.9185}$$

**(c)** Report **0.9185**, and write next to it: *"$\eta_{c^*}$ referenced to a
CEA equilibrium $c^*$ of 1815.1 m/s at MR/$p_c$ as tested, with chamber pressure
corrected from the injector-face tap to throat stagnation using a
one-dimensional Rayleigh momentum balance at $\varepsilon_c = 2.5$
($p_{0,t}/p_{inj} = 0.967$). Throat area from post-test measurement."*

That sentence is the answer. The 3.1-point difference between 0.950 and 0.919 is
larger than most injector development programmes ever recover, and a report that
does not say which convention it used is not auditable. A candidate who reports
0.95 without comment has made the exact error §3.17 warns about.

#### C7

**Direct.** With $\gamma = 1.1912$, $R = 600.54$ J/(kg·K), $T_0 = 3600$ K,
$p_e = 22\,480$ Pa fixed, comparing $p_0 = 206.4$ bar with $0.96\times206.4$ bar:
$$V_e: 4234.0 \to 4227.0\ \mathrm{m/s},\qquad \Delta V_e = 7.00\ \mathrm{m/s} = \mathbf{0.714\ s}\ I_{sp}$$

**Gouy–Stodola.**
$$s_{gen} = -600.54\ln(0.96) = 24.52\ \mathrm{J/(kg\,K)}$$
$$\text{lost work} = T_es_{gen} = 1205\times24.52 = 29\,550\ \mathrm{J/kg}$$
$$\Delta V_e \approx \frac{29\,550}{4234} = 6.98\ \mathrm{m/s}$$

**Comment.** 6.98 against 7.00 m/s — agreement to 0.3 %. The two calculations are
the same physics: the availability destroyed by irreversibility is exactly the
kinetic energy that never got made. The linearisation $\Delta(V^2/2) \approx
V\Delta V$ is what makes the second method approximate, and it is excellent as
long as the loss is small. Note also that the loss is very nearly linear in the
percentage: 2 % cost 0.35 s (§3.6) and 4 % costs 0.71 s.

The engineering reading: even a 4 % supersonic $p_0$ loss is under a second. The
same 4 % lost *upstream* of the throat costs 4 % of the mass flow and therefore
4 % of the thrust — two orders of magnitude more damaging in absolute terms.
**Where the loss happens matters more than how big it is.**

### Engineering reasoning

#### R1

The two sheets are almost certainly describing the **same** engine with
different conventions on both quantities, not two different engines.

- $p_c$: 206 bar versus 200 bar is about 3 %, consistent with one sheet quoting
  injector-face pressure and the other quoting nozzle/throat stagnation
  (§3.8, and item 18 of the verification file's contested-figures list).
- $\varepsilon$: 69 versus 77.5 is the documented RS-25 discrepancy. 69:1 is the
  geometric exit area over throat area from the manufacturer's datasheet; ~77.5:1
  appears in NASA/Rocketdyne training material and much of the aerodynamics
  literature, most plausibly against a different throat reference (effective or
  sonic rather than geometric) or an effective aerodynamic area ratio.

**The test.** Compute $C_F$ from the quoted thrust and each sheet's own $p_c$ and
$A_t$: $C_F = F/(p_0A_t)$. If both sheets are internally consistent descriptions
of one engine, the two $C_F$ values must differ by exactly the $p_c$ ratio, and
the *product* $c^*C_F$ — i.e. $I_{sp}g_0$ — must come out identical, which it
does by hypothesis. Then check each $\varepsilon$ against the isentropic
area–Mach relation using that sheet's $p_c$ and the quoted exit pressure: only
one of them will close. That identifies which $\varepsilon$ is geometric.

**Counter-argument, and why it loses.** One could argue these are genuinely
different engine blocks — e.g. a nozzle extension change. That is a real
possibility in general and must be checked against the programme history; but a
nozzle extension from 69:1 to 77.5:1 would change vacuum $I_{sp}$ by roughly
1–2 s, and the sheets quote the *same* $I_{sp}$. Identical thrust and identical
$I_{sp}$ with different $\varepsilon$ is the signature of a bookkeeping
difference, not a hardware one.

#### R2

**For raising $p_c$ (100 → 150 bar).** Thrust at fixed $A_t$ scales with $p_0$,
so the engine gets smaller and lighter for the same thrust: $A_t$ falls by a
third. The available pressure ratio grows, so $C_F$ rises at fixed $\varepsilon$
and — more importantly — the same $\varepsilon$ now corresponds to a lower exit
pressure, giving room to expand further in the same envelope. Dissociation falls
by $(1.5)^{-1/3} = 0.87$, buying perhaps 30–60 K of $T_c$ [A] — real but minor.

**For raising $\varepsilon$ (40 → 60).** This acts directly on $C_F$ and therefore
on $I_{sp}$ with no change to the chamber, the cycle, the turbomachinery or the
feed pressures. For a vacuum-optimised engine it is nearly free thermodynamically.

**Thermodynamically the $\varepsilon$ route is the better buy**: raising $p_c$
by 50 % raises the heat flux by roughly $1.5^{0.8} = 1.38$ (Bartz, [Bartz57]),
raises every feed pressure by 50 %, and demands more turbine power, which in a
staged-combustion or gas-generator cycle costs either efficiency or preburner
temperature. Raising $\varepsilon$ costs none of that.

**What actually decides it: the envelope.** Expansion ratio is limited by the
vehicle base area and, for a first stage, by flow separation at sea level
(Module 09). If the engine must start at sea level, $\varepsilon = 60$ at
$p_c = 100$ bar gives an exit pressure well below the separation limit and the
nozzle will be damaged. That is why booster engines chase chamber pressure and
upper stages chase area ratio — the RS-25 at 206 bar and $\varepsilon = 69$ on a
sea-level-start vehicle versus the RL10 at 32.8 bar and $\varepsilon = 61$ (and
the RL10B-2 at 280:1) in vacuum is exactly this trade, made twice, in opposite
directions. Secondary deciders: gimbal clearance, engine-out spacing, and
nozzle mass.

#### R3

$L^*$ is a residence-time proxy: $t_{res} \approx L^*\rho_c/c^*$ (Module 06). A
curve that climbs steeply and then flattens is the signature of a **rate-limited
process completing**.

- **Low end (0.8 m, $\eta = 0.93$):** the dominant deficit is **incomplete
  vaporisation and mixing**. Droplets and unmixed streams are still finishing
  their business when the gas reaches the throat. Adding residence time converts
  directly into converted propellant, so the curve is steep.
- **High end (1.4 m, $\eta = 0.97$):** the residence-time-limited losses are
  exhausted. What remains is not a rate problem and will not respond to more
  length: mixture-ratio maldistribution across the injector face (including the
  deliberately fuel-rich film-cooling layer at the wall), and reference-model
  error in the $\eta_{c^*}$ definition itself (§3.17 item 4).

**What to measure next.** In order of information per dollar:
1. Recompute the reference $c^*_{ideal}$ with an equilibrium CEA run at the
   as-tested MR, and correct $p_c$ to throat stagnation. This costs nothing and
   may account for 1–3 of the missing 3 points.
2. Close the mass balance including film coolant, and compute the *core*
   $\eta_{c^*}$ with the film flow removed from both $\dot m$ and the mixture
   ratio. If the core is at 0.99 you have a wall-cooling cost, not a combustion
   problem, and lengthening further is wasted mass.
3. Chamber-wall and face temperature/streak measurements, plus a chamber
   pressure axial profile, to localise where the heat release finishes.

A candidate who recommends "make it longer" without item 2 has missed the point:
past the knee, extra $L^*$ buys nothing but mass and heat load.

#### R4

**Yes, this is exactly what §3.8 predicts.** The tap-to-tap difference is
essentially $1 - 1/(1+\gamma M_2^2)$, and $M_2$ is set by the contraction ratio,
which is fixed geometry. So at first sight the ratio should be constant with
power level, not growing.

It grows because the *gas properties* shift with power level. As chamber pressure
rises with throttle: dissociation falls slightly, $T_0$ rises slightly, and
$\mathcal{M}$ and $\gamma$ both move. A rising $\gamma$ raises $\gamma M_2^2$
directly. More significantly, real chambers are not perfectly one-dimensional:
at higher power level the heat release finishes further downstream relative to
the chamber length, so more of the acceleration and more of the Rayleigh loss
occurs downstream of the injector tap and upstream of the throat tap. A 3.5 % →
4.9 % growth over a 60–105 % ramp is a plausible magnitude for these effects
combined. [A]

**What would make it shrink with power level, and should it worry you?** A
shrinking difference means the flow at the throat tap is *slowing* relative to
the injector-face condition as power rises. The benign explanation is a shifting
$\gamma$; the malign ones are:

- **Throat area growing** — erosion of an ablative or graphite throat, or thermal
  growth beyond prediction. A larger $A_t$ at fixed $\dot m$ lowers the throat
  Mach-number station and shifts the whole pressure profile. This is a
  time-dependent effect and would also show as a falling chamber pressure at
  constant flow.
- **Blockage or a partially detached liner** upstream of the throat tap.
- **A failing tap** — plugged, or reading a recirculation zone.

Yes, it should worry you, and the discriminator is time: plot the difference
against *time* as well as against power level. A geometry change drifts
monotonically with accumulated burn time and does not retrace on a throttle-down;
a property effect retraces exactly.

#### R5

**Most likely explanation: kinetic (recombination) loss, which is far larger for
LOX/LH₂ than for storables.**

The storable engine's chamber runs near 3000 K, where dissociation is a
percent-level effect; the stored chemical energy in radicals is small, so the
frozen and equilibrium predictions are close together and the delivered value
sits within 1 % of either. The hydrogen engine runs near 3600 K with 4–6 % of its
product moles dissociated, storing ~0.8 MJ/kg. Its equilibrium prediction assumes
*all* of that recombines; in reality the three-body recombination rates fall
steeply with density and the composition freezes somewhere in the divergent
section, typically between $\varepsilon \approx 5$ and 25. Whatever has not
recombined by then is lost. A 3 % shortfall against equilibrium is squarely in
the expected range.

**Competing explanations and why they lose.** Divergence and boundary-layer
losses scale with area ratio and are similar for two engines of similar
$\varepsilon$ — they cannot explain a 2-point *difference*. Injector quality is
stipulated as excellent for both. Film cooling would show up as a $c^*$ deficit,
not specifically as a shortfall against an *equilibrium* $I_{sp}$ prediction, and
would be visible in the $\eta_{c^*}$ data.

**What to compute to confirm.** Run CEA both frozen and equilibrium for each
engine at its as-flown MR, $p_c$ and $\varepsilon$. If the hydrogen engine's
delivered $I_{sp}$ falls between its frozen and equilibrium values while the
storable's frozen and equilibrium values are within 1 % of each other and of the
delivered value, the diagnosis is confirmed. Then run a one-dimensional
finite-rate kinetics case (or apply the JANNAF kinetic-loss methodology,
[CPIA-246]) to predict the freeze point and check that the recovered fraction
matches.

---

## K2. Quiz answers with explanations

**Q1 (6) — (c) $h_0$.**
Eq. 3.4: adiabatic with no shaft work gives $h_0 = $ const regardless of
friction, shocks or chemical reaction.
(a) $T_0$ is conserved only if $c_p$ is additionally constant; over a rocket
nozzle $c_p$ varies ~15 %, so $T_0$ is an approximation, not an exact result.
(b) $p_0$ falls with any irreversibility (Eq. 3.5) — this is the single most
common wrong answer and it inverts the physics.
(d) $s$ *increases*; only in the reversible limit is it constant.

**Q2 (6) — (b).**
$\gamma = c_p/c_v$ and $c_v$ grows by $\tfrac12R$ per excited quadratic degree of
freedom. Hot polyatomic molecules (H₂O, CO₂) have many vibrational modes excited
at 3000 K+, so $c_v$ is large and $\gamma$ is small.
(a) For an ideal gas $\gamma$ is a function of temperature and composition, not
pressure; pressure only matters through real-gas effects, which are negligible
here ($Z \approx 1$, §3.9).
(c) Molar mass affects $R$ and $c^*$, not $\gamma$ — helium ($\mathcal{M}=4$) has
$\gamma = 1.667$, the highest of any gas.
(d) Being a mixture is irrelevant by itself; a mixture of diatomics at 300 K
still has $\gamma \approx 1.4$.

**Q3 (8).**
$$\frac{T_0}{T} = 1 + \frac{1.20-1}{2}(0.30)^2 = 1 + 0.10\times0.09 = \mathbf{1.0090}$$
$$\frac{p_0}{p} = (1.0090)^{1.20/0.20} = (1.0090)^{6} = \mathbf{1.0552}$$
Common error: using $\gamma = 1.4$, which gives 1.0180 and 1.0644 — a 0.9 %
error in $p_0/p$ that compounds badly at higher Mach number.

**Q4 (10).**
Subsonic root of the area–Mach relation at $A/A^* = 2.5$, $\gamma = 1.21$:
$$M_2 = 0.2444$$
$$\frac{p_{0,t}}{p_{inj}} = \frac{\left(1+\frac{0.21}{2}(0.2444)^2\right)^{1.21/0.21}}{1+1.21(0.2444)^2}
= \frac{1.006297^{5.7619}}{1.072278} = \frac{1.036672}{1.072278} = 0.96679$$
$$p_{0,t} = 120\times0.96679 = \mathbf{116.0\ bar},\qquad \textbf{loss} = \mathbf{3.32\ \%}$$
Marks: 4 for $M_2$, 4 for the corrected pressure, 2 for the percentage. Using the
purely isentropic relation (giving 119.25 bar, 0.63 %) scores at most 3 — it
misses the entire Rayleigh mechanism.

**Q5 (10).**
$$\mathcal{M} = 0.60(18.0153) + 0.30(2.0159) + 0.10(17.0073)$$
$$= 10.8092 + 0.6048 + 1.7007 = \mathbf{13.115\ kg/kmol}$$
$$Y_{H_2} = \frac{0.30\times2.0159}{13.1147} = \frac{0.60477}{13.1147} = \mathbf{0.0461}$$
(For reference: $Y_{H_2O} = 0.8242$, $Y_{OH} = 0.1297$; they sum to 1.0000.)
The point of the question is the 30 % → 4.6 % mole-to-mass collapse for hydrogen.

**Q6 (10).**
$$\bar c_p = 0.60(57.6)+0.30(38.3)+0.10(37.4) = 34.56+11.49+3.74 = 49.79\ \mathrm{J/(mol\,K)}$$
$$c_p = \frac{49.79}{13.1147}\times1000 = \mathbf{3796.5\ J/(kg\,K)}$$
$$R = \frac{8314.46}{13.1147} = \mathbf{634.0\ J/(kg\,K)}$$
$$c_v = 3796.5-634.0 = 3162.5,\qquad \gamma = \frac{3796.5}{3162.5} = \mathbf{1.2005}$$
The classic error is mass-weighting the molar $c_p$ values, or forgetting the
$\times1000$ when converting kg/kmol to g/mol. Both give answers off by large
factors; a units check ($c_p$ must be a few thousand J/(kg·K) for this gas)
catches them.

**Q7 (12).**
**(a)** $\alpha \propto p^{-1/3}$, so
$$\alpha(25) = 0.082\left(\frac{206}{25}\right)^{1/3} = 0.082\times2.020 = \mathbf{0.166}$$
**(b)** *Why the estimate is optimistic:* the small-$\alpha$ derivation drops the
$(1-\alpha)$ and $(1+\alpha/2)^{1/2}$ factors, both of which suppress $\alpha$;
at $\alpha \approx 0.17$ the approximation overestimates by roughly 8–10 %
(C5(c)). *Why a real chamber dissociates less:* a rocket chamber is fuel-rich, so
there is a large excess of H₂ among the products. By Le Chatelier, adding a
product of the decomposition reaction pushes the equilibrium back toward H₂O. The
pure-H₂O calculation is a scaling demonstration, not a composition prediction.

Also accepted for the second half: the real chamber has multiple coupled
equilibria (H₂O ⇌ OH + ½H₂, H₂ ⇌ 2H, and others) which redistribute the
dissociation rather than concentrating it in one reaction; and the chamber
temperature is itself depressed *by* the dissociation, which is a stabilising
feedback the fixed-$T$ calculation ignores.

**Q8 (12).**
**(a)** $$c^*_{delivered} = \frac{85\times10^5\times0.030}{145} = 1758.6\ \mathrm{m/s},\qquad \eta_{c^*} = \frac{1758.6}{1830} = \mathbf{0.9610}$$
**(b)** At $\varepsilon_c = 3.5$, $\gamma = 1.21$: $M_2 = 0.1717$,
$p_{0,t}/p_{inj} = 0.98290$, so $p_{0,t} = 83.55$ bar,
$$c^*_{delivered} = \frac{83.55\times10^5\times0.030}{145} = 1728.6\ \mathrm{m/s},\qquad \eta_{c^*} = \mathbf{0.9446}$$
**Which to report:** (b), because $c^*$ is *defined* with the throat stagnation
pressure. Report it with the reference model and the correction stated
explicitly. Note that the larger contraction ratio here (3.5 vs C6's 2.5) makes
the correction much smaller — 1.7 % instead of 3.3 % — which is itself the
argument for a generous contraction ratio.

**Q9 (13).**
**(a)** $c_{frozen} = 441\times9.80665 = 4324.7$ m/s.
$$c_{eq} = \sqrt{4324.7^2 + 2(0.65\times10^6)} = \sqrt{1.8703\times10^7 + 1.30\times10^6} = 4472.5\ \mathrm{m/s}$$
$$I_{sp,eq}^{max} = \frac{4472.5}{9.80665} = \mathbf{456.1\ s}$$
**(b)** Delivered $c = 448\times9.80665 = 4393.4$ m/s.
$$f = \frac{c_{del}^2 - c_{frozen}^2}{2\Delta h_{chem}} = \frac{4393.4^2-4324.7^2}{1.30\times10^6} = \frac{5.985\times10^5}{1.30\times10^6} = \mathbf{0.46}$$
About 46 % of the recombination energy appears to have been recovered.

**Why this over-estimates the recovered fraction:** the calculation credits *all*
of the excess over frozen to recombination, when in reality the delivered value
is already *reduced* by divergence loss, boundary-layer loss, injector mixing
loss and film-cooling dilution. Strip those out and the true equilibrium-side
performance is higher than 448 s, so the actual recovered fraction is higher than
46 %. Equivalently: real losses and the recombination gain act in opposite
directions on the same number, and a single measurement cannot separate them.
That separation is exactly what the JANNAF methodology exists to do
[CPIA-246].

**Q10 (13).** Model answer (recommendation and defence):

> **Recommend MR 2.3.** For a volume-limited vehicle, the figure of merit is
> density impulse $\rho_{bulk}I_{sp}$, not $I_{sp}$. Moving from 2.3 to 2.8
> raises the bulk density (LOX at 1141 kg/m³ against RP-1 at ~810), which helps —
> but stoichiometric kerolox is ~3.4, so 2.8 also moves substantially closer to
> peak flame temperature, and the wall is the binding constraint here. A firm
> hot-gas-wall temperature limit means the extra heat flux must be bought with
> film cooling, and film cooling is a direct $\eta_{c^*}$ debit that eats the
> $I_{sp}$ the higher MR was supposed to deliver. At 2.3 the engine is already
> deep fuel-rich, the wall runs cooler, and the film-cooling fraction can be
> small.
>
> **The two quantities I would compute first:** (1) $\rho_{bulk}I_{sp}$ at both
> mixture ratios from a CEA run at the design $p_c$ and $\varepsilon$, because
> that is the actual objective for a volume-limited stage; (2) the peak gas-side
> heat flux from Bartz at both mixture ratios and the resulting film-cooling
> fraction needed to hold the liner at its limit, because that fraction converts
> directly into an $\eta_{c^*}$ penalty. If (1) favours 2.8 by more than the
> $\eta_{c^*}$ penalty from (2), reverse the recommendation.

Full marks require: naming density impulse as the objective (not $I_{sp}$),
identifying the wall-temperature limit as converting into a film-cooling and
hence $\eta_{c^*}$ cost, and giving a falsifiable condition under which the
recommendation flips. Recommending 2.8 is acceptable **if** the candidate makes
the density-impulse case quantitatively and acknowledges the cooling cost;
recommending either without mentioning the film-cooling debit scores at most half.

---

## K3. Trade-study reference solution (T1)

**Recommendation: MR 5.5, with 5.0 as the fallback if the expander heat balance
closes with margin.**

### The reasoning, constraint by constraint

**(i) $c^*$ and $I_{sp}$.** From §3.16's table, $\sqrt{T_c/\mathcal{M}}$ runs
17.3 (MR 4), 16.8 (5.0), ~16.5 (5.5, interpolated), 16.2 (6.0). Relative to
MR 5.0, MR 5.5 gives up about 1.8 % of $c^*$ and MR 6.0 about 3.6 %. $C_F$ is
nearly unaffected by MR (it depends on $\gamma$ and $\varepsilon$, and $\gamma$
moves only from ~1.20 to ~1.19 across this range). So the $I_{sp}$ cost of
moving from 5.0 to 5.5 is roughly **1–2 %, i.e. 5–9 seconds** on a ~450 s engine.
MR 4.5 buys roughly another 1 % over 5.0. [A]

**(ii) Bulk density and tank volume.** With $r = \dot m_o/\dot m_f$, unit fuel
mass gives total mass $1+r$ and total volume $r/\rho_o + 1/\rho_f$, so
$$\rho_{bulk} = \frac{1+r}{\dfrac{r}{\rho_o} + \dfrac{1}{\rho_f}}$$
with LOX 1141 kg/m³ and LH₂ 70.8 kg/m³ at their normal boiling points
[NIST-WB]:

| MR | $\rho_{bulk}$ [kg/m³] | volume for the same propellant mass |
|---|---|---|
| 4.5 | 304.4 | 1.000 (reference) |
| 5.0 | 324.2 | 0.939 |
| 5.5 | 343.1 | 0.887 |
| 6.0 | 361.1 | 0.843 |

Going from 4.5 to 5.5 cuts propellant volume by **11 %**, essentially all of it
out of the hydrogen tank, which is the long one. For a stage already at its
structural length limit, this is the constraint the problem statement is pointing
at, and it is worth more than 5–9 seconds of $I_{sp}$ on most upper-stage
$\Delta V$ budgets — *but the candidate must check that against the actual
mission $\Delta V$*, because for a very high-energy stage the $I_{sp}$ can win.

**(iii) Chamber temperature and the expander heat balance — the subtle one.**
This is the trap in the question. In a *regular* engine, lower $T_c$ is
unambiguously good for the wall. In a **closed expander** the chamber wall is the
turbine's only heat source: the cycle needs a *specified* heat pickup to close.
$T_c$ rises steeply with MR across this range (~3320 K at 5.0, ~3600 K at 6.0),
and with it the gas-side heat flux (roughly $\propto T_{aw} - T_{wg}$ at fixed
$p_c$). So here, higher MR *helps the cycle close* — more available turbine
power for the same wall area — while simultaneously making the wall harder to
keep alive. That is a genuine two-sided constraint and the candidate must
recognise that it does not simply reinforce (ii).

At MR 4.5 the chamber is ~500 K cooler than at 6.0. For a 100 kN closed expander
at the modest chamber pressure such a cycle implies (RL10-class, 30–45 bar), the
heat balance is the thing most likely to fail to close, and it fails *toward low
MR*. This is the strongest argument against 4.5.

**(iv) Hydrogen pump.** Hydrogen volumetric flow at MR 4.5 is 22 % higher than at
5.5 for the same total mass flow. Hydrogen pumps are the hardest turbomachinery
in the business — the RL10's runs at ~31,000 rpm through a reduction gearbox, and
the RS-25's HPFTP is a three-stage centrifugal machine at 35,360 rpm absorbing
53 MW. Every percent of hydrogen flow you remove makes the pump smaller, the
inducer cavitation margin easier, and the shaft dynamics friendlier. This argues
consistently for higher MR.

**(v) If it were a booster engine instead.** Every argument shifts toward higher
MR, hard. A booster stage carries far more propellant, so tank volume dominates
vehicle length and aerodynamic loads; sea-level operation caps $\varepsilon$ so
the $I_{sp}$ on offer is lower anyway and the marginal seconds are worth less;
and no expander cycle survives at booster thrust, so constraint (iii) inverts
completely — a gas-generator or staged-combustion cycle wants the wall heat load
*minimised*, not maximised. The RS-25's 6.03 is exactly this answer.

### Binding constraint and next step

**Binding: the expander heat balance (iii), not the stage length.** Length can be
traded against a small mass penalty; a cycle that does not close is not an
engine. MR 5.5 sits high enough to give the cycle comfortable margin, low enough
to keep most of the $I_{sp}$, and delivers 11 % of the volume saving.

**Next computation to retire the biggest uncertainty:** a coupled expander cycle
balance — wall heat pickup (Bartz-based [Bartz57], with the real chamber contour
and a realistic hot-wall temperature) against required turbine power at each
candidate MR — run before anything else. If that closes with >30 % margin at
MR 5.0, move to 5.0 and take the seconds back. The second computation is the
mission $\Delta V$ sensitivity: $\partial(\text{payload})/\partial I_{sp}$ versus
$\partial(\text{payload})/\partial(\text{stage dry mass})$ at the vehicle level,
which converts the 5–9 s and the 11 % volume into a single currency.

### Rubric

| element | marks |
|---|---|
| Quantitative $c^*$ / $I_{sp}$ variation across the MR range, with a stated method | 15 |
| Bulk-density calculation and the volume consequence, in numbers | 15 |
| Recognises that a **closed expander** inverts the usual "cooler is better" wall argument, and treats it as two-sided | 20 |
| Hydrogen pump / turbomachinery argument | 10 |
| Correct and reasoned answer for the booster case, including why the cycle argument inverts | 15 |
| Names a binding constraint and defends the choice | 10 |
| Names a specific, decisive next computation | 10 |
| Uses engine data from the verification file with its caveats (RL10 at MR 5.0, RS-25 at 6.03) | 5 |

**Loses marks for:** optimising $I_{sp}$ alone and ignoring volume; treating
lower $T_c$ as unambiguously good in an expander; picking a mixture ratio without
naming the binding constraint; quoting a chamber temperature or $c^*$ to four
significant figures from a table labelled illustrative; using CEA-class numbers
without saying they are CEA-class.

**Answers that recommend 6.0** can score well if they argue the length constraint
is hard and the mission $\Delta V$ is modest — but they must address why they are
accepting a ~3.6 % $c^*$ penalty and a wall at ~3600 K on an expander engine
whose liner has to survive without a preburner-driven cooling budget.

---

## K4. Common wrong answers and what they reveal

**"$p_0$ is conserved because the flow is adiabatic."** The single most common
error in the module, and it appears in P1, Q1 and R1. It reveals that the student
has memorised "stagnation properties are constant in isentropic flow" without
noticing which word is load-bearing. The fix is Eq. 3.5: in adiabatic flow,
$p_0$ loss and entropy generation are the same statement.

**Mass-weighting molar specific heats (or mole-weighting mass ones).** Appears in
Q6 and C3. Produces answers off by a factor of order $\mathcal{M}_i/\mathcal{M}$
per species — sometimes close enough to look plausible, which is what makes it
dangerous. Reveals no habit of dimensional checking. The discipline: write the
units on every intermediate ($\bar c_p$ in J/(mol·K), $c_p$ in J/(kg·K)) and the
error cannot survive.

**Forgetting the 1000 in $c_p = \bar c_p/\mathcal{M}$.** $\mathcal{M}$ in kg/kmol
equals g/mol, so $\bar c_p\ [\mathrm{J/(mol\,K)}]/\mathcal{M}\
[\mathrm{g/mol}]$ gives J/(g·K), not J/(kg·K). Answers come out 1000× too small.
Catchable in one second by asking whether $c_p$ for a hot gas should be ~4 or
~4000.

**Using $\gamma = 1.4$.** Reveals a student reaching for air. In a rocket
context, $\gamma$ between 1.14 and 1.28 should be the reflex, and 1.4 should feel
wrong immediately.

**Reporting $\eta_{c^*} > 1$ without comment.** Reveals that the student treats
efficiency as a measurement rather than a ratio of a measurement to a model. Any
efficiency above 1 is a statement about the reference, and the professional
response is to name which of the four error sources in §3.17 is responsible.

**Computing the adiabatic flame temperature and calling it the chamber
temperature.** Reveals that dissociation has been learned as a word rather than
as an energy sink. The tell is a number above 4000 K for LOX/LH₂: no chemical
rocket reaches that, and a student who does not flinch at 4245 K has no
calibration.

**Treating the isentropic contraction result as the chamber pressure loss.**
In C2 and Q4 this gives 0.63 % where the answer is 3.32 %. Reveals a failure to
notice that the chamber's acceleration is produced by *heat release*, not by an
area change acting on an already-moving flow. The isentropic relation gives the
static-to-stagnation relationship *at* a station; it says nothing about what
happened between stations.

**Confusing $T_0$ with the wall's heat-transfer driving temperature.** Reveals
that §3.7's stagnation state has not been connected to Module 10's recovery
temperature. $T_{aw} < T_0$ in accelerating flow, by an amount set by the
recovery factor $r \approx \mathrm{Pr}^{1/3} \approx 0.9$.

**Claiming higher chamber pressure raises $I_{sp}$ "because the chamber is
hotter".** Reveals the causal chain has been learned backwards. Pressure acts on
$I_{sp}$ almost entirely through the nozzle pressure ratio and the achievable
$\varepsilon$; the temperature effect is a saturating cube-root correction worth
tens of kelvin, and it comes with a heat flux penalty scaling as $p_c^{0.8}$.

**Quoting a single unqualified chamber pressure for the F-1.** Reveals no habit
of asking where a number came from. The published values span 965–1125 psia, and
the spread is measurement station and programme phase, not sloppiness. The
professional answer states the value, the convention and the range.
