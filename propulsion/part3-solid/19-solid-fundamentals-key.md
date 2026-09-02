# Module 19 — Solid Propellant Fundamentals — Answer Key

Numbers below use $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K), and the
same library relations as the module (`tools/rocket.py`). Where a figure is
quoted from a real motor it carries the same provenance and caveats as in
`reference/_verify-solid-coldgas.md`.

---

## K1. Problem solutions

### Conceptual

**P1 — $n = 1.05$.**

From Eq. 3.3, $p_c = (a\rho_p c^* K_n)^{1/(1-n)}$. For $n > 1$ the exponent is
negative and the "equilibrium" is unstable rather than merely peculiar. The
physical argument is cleaner than the algebraic one: mass generation is
$\dot m_{gen} \propto p_c^{\,n}$ and mass discharge is
$\dot m_{out} \propto p_c^{\,1}$. If $n < 1$, a small pressure excursion
upward increases discharge faster than generation, and the disturbance is
driven back — the equilibrium is stable. If $n > 1$, generation outruns
discharge, pressure runs away, and the motor bursts; a downward excursion
likewise runs away to extinction. There is no operating point, only an
unstable fixed point. This is why $n \ge 1$ is disqualifying and why real
propellants are formulated to $n \approx 0.2$–0.5.

The mechanism that holds composite $n$ near 0.35 is the **diffusion-limited
flame structure** (§3.3.2). In a composite, the rate-controlling step is
mixing of AP decomposition products with binder pyrolysis products in the gas
phase above the surface. Raising pressure compresses the flame toward the
surface and raises the heat feedback, but only sub-linearly, because the
diffusion length that must be crossed is set by the oxidizer particle size —
a geometric quantity that pressure does not change. Homogeneous double-base
propellants, whose flames are premixed and kinetically controlled, have
distinctly higher exponents and are correspondingly less forgiving.

Full marks require the stability argument stated in terms of the two mass
flows, not just "the exponent must be less than one."

**P2 — removing all the aluminium.**

In order of trouble:

1. **Combustion instability.** Losing the particle damping is the consequence
   most likely to end the proposal. An unmetallised large composite motor is
   at real risk of tangential and longitudinal acoustic instability, and there
   is no cheap fix available late in a program: you would have to redesign the
   grain, add inert damping particles (which costs the same performance
   aluminium was giving you, with none of the energy), or accept the risk.
2. **Energy.** $T_c$ falls by roughly 400–600 K, worth of order 18–25 s of
   ideal $I_{sp}$ depending on $\varepsilon$ (WE 19.4). Recovering ~2 % from
   the removed two-phase loss returns only about a quarter of it.
3. **Density.** $\rho_p$ falls by roughly 5 %, which at a fixed case volume is
   a straight loss of propellant mass and therefore of total impulse — and
   the case volume is exactly what a booster cannot get more of.
4. **Grain and structural rebalance.** Removing 16–19 % of the solids changes
   the mix rheology, the achievable loading, the modulus, and the thermal
   expansion of the grain. The structural analysis has to be redone.

Credit the ranking, not just the list. A student who puts energy first has
made the standard mistake of treating $I_{sp}$ as the only currency; the
answer that identifies instability as the program-killer is the strong one.

**P3 — oxidizer particle size.**

In a composite, oxidizer and fuel are in *separate condensed phases*. AP
decomposes at the surface to perchloric acid and ammonia; the binder pyrolyses
to hydrocarbon fragments. These two vapour streams are spatially separated at
the scale of the AP particles, and the exothermic reaction cannot proceed
until they interdiffuse. The characteristic diffusion length is therefore of
the order of the AP particle diameter, the flame stands off the surface by
roughly that distance, and the conductive heat feedback to the surface — which
is what sets the regression rate — scales inversely with it. Finer AP means a
shorter diffusion length, a flame closer to the surface, higher surface heat
flux, and a faster burn.

In a double-base propellant there is no separate oxidizer phase at all: NC and
NG are molecularly mixed nitrate esters, each carrying its own oxygen. The
flame is premixed and its structure is set by gas-phase chemical kinetics
(the two-stage fizz/dark/luminous zone structure), not by a diffusion length.
There is no particle size to specify, so no analogue exists.

**P4 — the twenty-year-old motor.**

Bulk composition is nearly unchanged; what has changed is the **mechanical
state of the binder network and its bond lines**, by three mechanisms (§3.4):
continued post-cure crosslinking; oxidative crosslinking of the polybutadiene
backbone; and migration of plasticiser and other small molecules into the
liner and insulation. The symptom of all three is the same — modulus up,
$\varepsilon_m$ down — but the third acts preferentially *at the bond line*,
not in the bulk.

The measurement that detects it: **uniaxial tensile testing at the cold spec
temperature**, comparing $\varepsilon_m$ and modulus against the as-cast
values and against the value the grain structural analysis assumed. For the
migration mechanism specifically, bulk tensile is not enough — you need bond
tensile or peel specimens taken across the propellant/liner interface, or
non-destructive interrogation of the bond line. A student who names only bulk
tensile has answered the question but missed the trap set again in P17.

**P5 — why upper stages get the better propellant.**

*Rocket-equation argument.* Each stage's contribution is
$\Delta v_i = g_0 I_{sp,i}\ln(m_{0,i}/m_{f,i})$. An upper stage's $I_{sp}$
multiplies a mass ratio that acts on the whole remaining vehicle including the
payload, and — because the stage is small — its inert-mass fraction is larger
and every second of $I_{sp}$ is proportionally more valuable. Differentiating,
$\partial \Delta v/\partial I_{sp}$ is the same $g_0\ln(\text{MR})$ for each
stage, but the *payload* sensitivity is not: a second of $I_{sp}$ on the last
stage translates directly into delivered mass, while a second on the first
stage is partly eaten by the mass of everything above it.

*Program-cost argument.* The upper-stage propellant charge is a small
fraction of the vehicle's total. A hazard-class penalty, an expensive
ingredient, or a shorter service life applied to a few tonnes of propellant is
affordable; applied to hundreds of tonnes in the first stage it is not. Add
that the first stage carries the most flight history and is the hardest to
requalify, and the outcome is the observed gradient: robust class-1.3 AP/Al
composite low, high-energy nitramine or nitrate-ester propellant high.

**P6 — HCl in the exhaust.**

Two distinct penalties:

1. **Molar mass.** HCl at 36.5 kg/kmol is the heaviest gaseous species
   present in quantity, and it is ~15–20 % of the exhaust mass. Since
   $c^* \propto \sqrt{T_c/\bar M}$ (Eq. 3.4), that fraction drags $\bar M$ up
   and $c^*$ down.
2. **Wasted enthalpy.** The H–Cl bond is already formed; the hydrogen tied up
   in HCl is hydrogen that is not available to form H₂ or additional H₂O, and
   the chlorine contributes no exothermic chemistry. It is chemically spent
   mass being carried and heated for nothing.

A chlorine-free oxidizer (AN, ADN, a nitramine) removes **both** of these, plus
the corrosive and visible plume, and lowers $\bar M$ toward the low twenties.
What it does **not** fix is the condensed-phase problem: if the propellant is
still aluminized, Al₂O₃ at 102 kg/kmol and ~30 % of the exhaust mass is still
there, and the two-phase loss is untouched. Nor does it fix the fundamental
molar-mass floor set by carrying oxygen in the propellant. Full credit
requires naming the two distinct penalties *and* saying what survives.

**P7 — "both run at 3,400 K, so it must be the nozzle."**

Wrong, and the arithmetic settles it. The propellants differ far more in
$\bar M$ than in $T_c$: about 27.5 kg/kmol for an aluminized composite against
about 13 kg/kmol for fuel-rich LOX/LH2, a factor of 2.12. Since
$c^* \propto \sqrt{T_c/\bar M}$, that alone is a factor of $\sqrt{2.12} = 1.45$
in $c^*$ at equal temperature — i.e. the RS-25 would beat the SRB by about
45 % on chemistry alone with identical nozzles. The nozzle *also* matters
($\varepsilon = 69$ against 7.7 is worth roughly 25 s), but it is the smaller
term: $452/1.45 \approx 310$ s, which is about where a high-expansion solid
actually lands.

### Calculation

**P8 — 18 % aluminium.**

$$\xi = 0.18 \times \frac{101.96}{2 \times 26.98} = 0.18 \times 1.8896 = \mathbf{0.340}$$

against the Shuttle SRB's $\xi = 0.302$ at 16 % Al — 12.5 % more condensed
mass in the exhaust.

Effect on two-phase loss at fixed coupling efficiency: the *bracket width*
$1 - c_{lag}/c_{eq}$ widens roughly in proportion. Interpolating between the
module's 19.4 % at $\xi = 0.302$ and P13's 24.6 % at $\xi = 0.378$ gives about
22 % at $\xi = 0.340$. At $\lambda = 0.90$ the loss therefore goes from about
1.9 % to about **2.2 %** — a third of a second per 100 s of $I_{sp}$ for each
extra point of aluminium, roughly. Accept 2.0–2.4 %.

**P9 — density impulse, solid versus LOX/CH₄.**

Bulk density of LOX/CH₄ at $MR = 3.6$:

$$\rho_{bulk} = \frac{4.6}{\frac{1}{423}+\frac{3.6}{1141}} = \frac{4.6}{2.3641\times10^{-3}+3.1551\times10^{-3}} = \frac{4.6}{5.5192\times10^{-3}} = 833.5\ \mathrm{kg/m^3}$$

Density impulses:

- solid: $1810 \times 292 = \mathbf{528{,}500}$ kg·s/m³
- LOX/CH₄: $833.5 \times 380 = \mathbf{316{,}700}$ kg·s/m³
- ratio **1.67**

Volumes for $2.0\times10^{7}$ N·s, $V = I_{tot}/(g_0 I_d)$:

- solid: $2.0\times10^{7}/(9.80665 \times 528{,}500) = \mathbf{3.86\ m^3}$
- LOX/CH₄: $2.0\times10^{7}/(9.80665 \times 316{,}700) = \mathbf{6.44\ m^3}$

Comment worth a mark: the solid needs 60 % of the propellant volume while
delivering 77 % of the mass-specific impulse. Methalox closes the density gap
against a solid far better than hydrogen does — the solid's advantage over
LOX/LH2 was 2.9× (WE 19.1), here it is 1.67×.

**P10 — ideal $I_{sp}$ at $T_c = 3550$ K, $\bar M = 28.2$, $\gamma = 1.17$,
$p_c = 9.0$ MPa, $\varepsilon = 16$.**

$$R = 8314.46/28.2 = 294.84\ \mathrm{J/(kg\,K)}$$
$$\Gamma(1.17) = \sqrt{1.17}\,(2/2.17)^{2.17/0.34} = 1.0817 \times 0.5942 = 0.6427$$
$$c^* = \frac{\sqrt{294.84 \times 3550}}{0.6427} = \frac{1023.1}{0.6427} = \mathbf{1{,}592\ m/s}$$

Exit conditions: inverting the area relation at $\varepsilon = 16$,
$M_e = 3.495$, so $p_e/p_c = 7.44\times10^{-3}$ and $p_e = 66{,}990$ Pa.

$$C_{F,vac} = \sqrt{\frac{2(1.17)^2}{0.17}\left(\frac{2}{2.17}\right)^{2.17/0.17}\left[1-(7.44\times10^{-3})^{0.1453}\right]} + (7.44\times10^{-3})(16)$$
$$= \sqrt{16.105 \times 0.3531 \times 0.5093} + 0.1191 = 1.7018 + 0.1191 = \mathbf{1.821}$$

$$I_{sp,ideal} = \frac{1592 \times 1.821}{9.80665} = \mathbf{295.6\ s}$$

Required efficiency: $\eta = 280/295.6 = \mathbf{0.947}$.

Is it credible? Yes, but it is at the *low* end of the 0.94–0.97 band of §4.
It is consistent with a heavily aluminized propellant (high $\bar M$ implies a
large condensed fraction, so two-phase losses near the top of the 1–3 % range)
and a conical or short bell nozzle with a couple of percent of divergence
loss. If the propellant were unmetallised, $\eta = 0.947$ would be
suspiciously poor and you should suspect either the published figure or the
assumed products.

**P11 — $n = 0.32$, burn rate up 4 %.**

At fixed $K_n$, $p_c \propto (a)^{1/(1-n)}$, so a 4 % rise in $a$ gives

$$\frac{\Delta p_c}{p_c} = 1.04^{1/0.68} - 1 = 1.04^{1.4706} - 1 = 1.0594 - 1 = \mathbf{+5.94\ \%}$$

Thrust $F = C_F p_c A_t$; with $C_F$ unchanged, **+5.94 %**.

Burn time: mass flow $\dot m = p_c A_t/c^*$ rises 5.94 %, and the total
propellant mass is unchanged, so $t_b$ falls by $1/1.0594 - 1 =
\mathbf{-5.6\ \%}$. (Equivalently: $r \propto p_c$ at fixed $K_n$, so the web
is consumed 5.94 % faster.)

Total impulse: essentially **unchanged** — the same propellant mass leaves at
the same $I_{sp}$ (strictly, $C_F$ improves slightly with the higher $p_c$, so
impulse rises by a few tenths of a percent). This is the diagnostic signature
of a ballistic-rate anomaly and distinguishes it from a grain-geometry or
mass-loading problem, both of which move total impulse.

**P12 — molar masses.**

Mole fractions sum to 1.00. Gas-phase mean molar mass:

$$\bar M_{gas} = 0.26(28.010)+0.30(18.015)+0.15(36.461)+0.09(28.014)+0.04(44.010)+0.16(2.016)$$
$$= 7.283+5.405+5.469+2.521+1.760+0.323 = \mathbf{22.76\ kg/kmol}$$

Whole exhaust, mass-weighted ($\bar M = 1/\sum w_i/M_i$), with 70 % gas and
30 % Al₂O₃. The gas contribution collapses neatly:

$$\sum_{gas}\frac{w_i}{M_i} = \frac{0.70}{\bar M_{gas}} = \frac{0.70}{22.76} = 0.030755, \qquad \frac{0.30}{101.96} = 0.002942$$
$$\bar M_{total} = \frac{1}{0.033697} = \mathbf{29.7\ kg/kmol}$$

Which belongs in Eq. 3.4? Strictly, **neither is exactly right**, and saying so
is the point of the problem. Only the gas expands, so the *thermodynamics* of
the expansion is governed by the 22.76 figure; but the thrust is produced by
the whole mass flow through the throat, including the alumina. The standard
convention — and what CEA reports for a two-phase case — is the total-mass
basis, ≈ 29.7, precisely because feeding that into the single-phase ideal
formula reproduces the two-phase performance approximately. The error you
incur by doing so *is* the two-phase loss of WE 19.3. Answering "22.76,
because only the gas expands" earns partial credit; answering "29.7, and here
is why the approximation is defensible and what its error is" earns full
marks.

**P13 — two-phase bracket at 20 % aluminium.**

$$\xi = 0.20 \times 1.8896 = \mathbf{0.378}$$

$$c_{p,mix} = 0.622(2000)+0.378(1400) = 1{,}773\ \mathrm{J/(kg\,K)}$$
$$R_{eff} = 0.622(346.4) = 215.5,\qquad \gamma' = \frac{1773}{1773-215.5} = 1.138$$

At $\varepsilon = 7.72$ and $\gamma' = 1.138$: $M_e = 2.95$,
$p_e/p_c = 0.0207$.

$$c_{eq} = \sqrt{2(1773)(3400)(0.3758)} = \mathbf{2{,}129\ m/s}$$
$$c_{lag} = 0.622\sqrt{2(2000)(3400)(0.4892)} = 0.622 \times 2{,}579 = \mathbf{1{,}605\ m/s}$$

$$\frac{c_{lag}}{c_{eq}} = 0.754 \quad\Rightarrow\quad \text{maximum loss} = \mathbf{24.6\ \%}$$

For a loss below 2 %: $(1-\lambda)(0.246) < 0.02 \Rightarrow 1-\lambda <
0.0812 \Rightarrow \lambda > \mathbf{0.919}$.

The comparison with the 16 % case is the answer's substance: the bracket
widened from 19.4 % to 24.6 %, and the coupling efficiency you must achieve
to hold a 2 % loss went from 0.897 to 0.919. **The same nozzle and the same
aluminium particle size give you a worse loss at higher metal loading**, so
the extra energy per point of aluminium is progressively taxed. That is the
quantitative form of the diminishing return in §3.6.

**P14 — P120C versus Shuttle SRB, impulse per unit gross mass.**

Propellant mass fractions:

- P120C: $141{,}400/153{,}000 = \mathbf{0.924}$
- Shuttle SRB: $500{,}000/590{,}000 = \mathbf{0.847}$

Delivered total impulse per unit gross stage mass,
$I_{tot}/m_{gross} = g_0 I_{sp}\,\zeta$ where $\zeta$ is the propellant mass
fraction:

- P120C: $9.80665 \times 280 \times 0.924 = \mathbf{2{,}538\ N\,s/kg}$
- Shuttle SRB (vacuum $I_{sp}$): $9.80665 \times 268 \times 0.847 = \mathbf{2{,}227\ N\,s/kg}$
- ratio **1.14**

Which $I_{sp}$? The **vacuum** figure for both. It is defensible because both
are published on the same basis and the comparison is then like-for-like; the
P120C's ≈ 280 s is quoted as a vacuum figure in the verification file, and
quoting it against the SRB's sea-level 242 s would flatter the P120C by a
further 12 % (ratio 1.26) for no physical reason. State the basis explicitly —
a comparison that does not name SL or vacuum is worthless, and half the marks
are for saying so.

The engineering point: 14 % more impulse per kilogram of stage on the launch
pad, from a case change and a modest composition change, on a motor a quarter
the size. Note also that the SRB is segmented steel because it is 3.71 m in
diameter and must be shipped by rail — the P120C's advantage is not available
to it at that scale.

### Engineering reasoning

**P15 — trace matches for 8 s, then runs 6 % high, burn time 4 % short,
impulse within 1 %.**

The impulse closing to 1 % is the controlling clue: the propellant *mass* and
its energy are right. Only the rate is wrong, and only after 8 s. Candidates:

1. **Burn-rate anomaly confined to part of the grain** — e.g. a segregated or
   differently catalysed region, or a cast in two batches where the second is
   fast. *Trace shape:* an inflection at the moment the surface reaches the
   affected material, then a sustained offset; the shape of the trace after
   the step still follows the designed $K_n$ curve, just scaled.
2. **Grain geometry error or a partial debond exposing extra surface** —
   $K_n$ higher than designed after the surface reaches the affected region.
   *Trace shape:* also a step, but the post-step trace shape *departs* from the
   designed $K_n$ curve, because the burning surface is no longer evolving as
   designed; expect a different slope, not just a different level.
3. **Progressive throat erosion running backwards** — i.e. a throat that is
   *smaller* than nominal, or an insert that swelled or accumulated deposits.
   *Trace shape:* a gradual rise rather than a step, and specifically not
   flat-offset; the pressure would drift up continuously, and the trace would
   depart from prediction from early on, not at a definite instant.

The single discriminating measurement: **post-test throat area measurement**,
combined with the pre-test throat area. Together with the recorded $p_c$ trace
that yields $c^*$ as a function of time via $c^* = p_c A_t/\dot m$; a normal
$c^*$ with abnormal $p_c$ points to $K_n$ (cause 2) or $r$ (cause 1), and an
abnormal $A_t$ history settles cause 3 immediately. If the throat is nominal,
X-ray or sectioning of a sister motor from the same cast discriminates 1 from
2 — cause 1 leaves the geometry intact.

Credit any three plausible causes provided the answer states what each
predicts about the *shape*, not just the level, and names a measurement that
actually separates them.

**P16 — the $\varepsilon = 12$ and $\varepsilon = 45$ motors.**

The colleague has confused $I_{sp}$ with a propellant property. $I_{sp} =
c^* C_F/g_0$; $c^*$ is the propellant-and-chamber term and $C_F$ is the
nozzle-and-ambient term. Same propellant lot and same grain means the same
$c^*$; the entire difference must live in $C_F$, and indeed the given ideal
$C_F$ values differ by 7.3 % while the $I_{sp}$ figures differ by 8.8 %.

Back out delivered $c^*$ from $c^*_{del} = I_{sp}g_0/C_F$:

- $\varepsilon = 12$: $272 \times 9.80665/1.79 = 1{,}490$ m/s
- $\varepsilon = 45$: $296 \times 9.80665/1.92 = 1{,}512$ m/s

Efficiencies against the ideal 1,590 m/s: **0.937** and **0.951**.

Conclusion: the two motors delivered the same propellant performance to within
1.5 points of $c^*$ efficiency — which is inside the noise of this kind of
inference, since the ideal $C_F$ values quoted contain no divergence or
two-phase correction and those corrections are not identical at the two
expansion ratios. The 24 s difference is the nozzle, entirely. A strong answer
notes the residual 1.4-point gap and attributes it to the loss terms folded
into the ideal $C_F$ rather than claiming a real propellant difference.

**P17 — the surveillance program that measured the wrong thing.**

The program measured **bulk** properties in the **mid-web** at (presumably)
ambient conditions. Three things it therefore could not see:

1. **The bond line.** Plasticiser and species migration (§3.4, mechanism 3)
   act down a concentration gradient into the liner and insulation. The
   depleted, embrittled material is a thin layer at the propellant/liner
   interface. A mid-web sample is by construction the furthest point from it,
   and will look pristine while the interface has lost most of its
   compliance.
2. **The temperature.** Strain capability falls steeply toward $T_g$, and
   aging shifts that curve. A sample tested at 20 °C can be within 10 % of
   as-cast while the same material at −40 °C has lost half its
   $\varepsilon_m$. The relevant number is $\varepsilon_m$ *at the cold spec
   temperature*, not at ambient.
3. **The failure mode.** "Grain motion at the aft end" is a bond or
   stress-relief-boot failure, not a bulk cohesive failure. Bulk tensile
   measures cohesive strength of the propellant; it says nothing about
   adhesive strength across an interface.

The bulk data was reassuring and irrelevant in exactly the way a
well-instrumented program can be: it measured a real quantity, accurately,
that was not the quantity governing the failure. Fix: bond-tensile or peel
specimens taken across the interface, conditioned to the cold spec
temperature, plus non-destructive interrogation of the bond line on stored
units.

**P18 — the two plumes.**

*Bright dense white trail.* Primary smoke from condensed Al₂O₃ plus secondary
smoke from HCl taking up atmospheric water. This is a **metallised AP
composite** — APCP, essentially certainly. Likely application: a launch
vehicle booster or a large motor where signature is simply not a requirement.
It tells you the propellant is in the 1.3 hazard class family and that the
motor has a two-phase loss and an alumina-erosion problem at the throat.

*Nearly invisible plume.* No metal and little or no chlorine: a **double-base,
minimum-signature nitramine, or reduced-smoke unmetallised composite**. Likely
application: a tactical missile where a visible trail would betray the
launcher's position or give a countermeasure system a track, or a
gun-launched round.

*What it tells you about $I_{sp}$:* usefully little on its own, and the honest
answer says so. The smoky propellant is probably higher-energy per unit mass
and certainly higher in density impulse, but $I_{sp}$ also depends on the
nozzle expansion ratio and on the operating altitude, neither of which a plume
photograph reveals. A tactical minimum-signature motor with a high-$\varepsilon$
nozzle can out-perform a booster on $I_{sp}$ while being the lower-energy
propellant. Signature class constrains the propellant family; it does not
determine $I_{sp}$.

---

## K2. Quiz answers with explanations

**Q1 (8) — (b), $\bar M$.**
$c^* \propto \sqrt{T_c/\bar M}$. A solid propellant carries its oxidizer as a
condensed salt and its metal as a condensed fuel; the products are CO, H₂O,
HCl, N₂, CO₂ and Al₂O₃, giving $\bar M \approx 27$–30 against LOX/LH2's ~13.
The solid cannot fix it because the only way to lower $\bar M$ substantially
is to leave excess hydrogen in the exhaust, and the propellant's hydrogen is
locked in a polymer that is 12–14 % of the mass.
*(a) is wrong*: aluminized composites run at 3,400–3,600 K, comparable to the
RS-25's ~3,600 K — temperature is *not* the discriminator. *(c) is wrong*: a
lower $\gamma$ actually raises $c^*$ slightly via $\Gamma$, and in any case
the effect is a few percent, not a factor. *(d) is a category error*: $R_u$ is
universal; it is $\bar M$ that differs.

**Q2 (8) — (c), 8.5 %.**
$p_c \propto a^{1/(1-n)} = a^{1/0.6} = a^{1.667}$;
$1.05^{1.667} = 1.0847$, i.e. **+8.5 %**.
*(b) 5 %* is the answer of someone who forgot the $1/(1-n)$ amplification —
the most common wrong answer, and it is wrong by a factor of 1.7.
*(a) 3 %* has the amplification inverted (applying $1-n$ instead of
$1/(1-n)$). *(d) 12.5 %* corresponds to $n \approx 0.5$.

**Q3 (10) —**
$$\xi = 0.145 \times \frac{101.96}{2 \times 26.98} = 0.145 \times 1.8896 = \mathbf{0.274}$$
Marks: 4 for the stoichiometric factor 1.8896 (i.e. recognising that one mole
of Al₂O₃ comes from two moles of Al, so the mass multiplier is
$M_{\mathrm{Al_2O_3}}/2M_{\mathrm{Al}}$), 4 for the arithmetic, 2 for stating
the assumption of complete combustion with oxygen available from the AP.
A common wrong answer is $0.145 \times 101.96/26.98 = 0.548$, which double-
counts the aluminium.

**Q4 (8) — (c).**
PBAN's low-temperature strain capability is *worse* than HTPB's, not better;
that is one of the main reasons HTPB displaced it everywhere it was free to.
(a), (b) and (d) are all defensible and all appear in §6.1: qualified process
and ballistic database at booster scale; a small $I_{sp}$ delta at
$\varepsilon \approx 7$; and requalification cost dominating a program that
reuses Shuttle-era cases and tooling.

**Q5 (12) —**
$$R = 8314.46/26.8 = 310.24\ \mathrm{J/(kg\,K)}$$
$$\Gamma(1.19) = \sqrt{1.19}\,(2/2.19)^{2.19/0.38} = 1.0909 \times 0.5928 = 0.6466$$
$$c^* = \frac{\sqrt{310.24 \times 3300}}{0.6466} = \frac{1011.8}{0.6466} = \mathbf{1{,}565\ m/s}$$
$$\eta_{c^*} = 1505/1565 = \mathbf{0.962}$$

What $\eta_{c^*}$ lumps together: incomplete combustion (unburned or partially
burned aluminium, unreacted binder fragments) in the finite residence time;
heat loss from the combustion gas to the insulation and the grain itself;
non-equilibrium chemistry — the products not reaching the equilibrium
composition assumed by the CEA calculation; the condensed-phase mass appearing
in $\dot m$ without contributing to the gas-phase thermodynamics; and any
error in the assumed $T_c$, $\bar M$ and $\gamma$ themselves. Note that
$\eta_{c^*}$ does **not** contain nozzle divergence, boundary layer, or the
particle *velocity* lag — those live in $\eta_{C_F}$. Marks: 6 for the
computation, 6 for naming at least three loss mechanisms and correctly
excluding the nozzle terms.

**Q6 (10) —**
1. HCl raises the mean molar mass of the exhaust (36.5 kg/kmol at 15–20 % of
   the mass), which lowers $c^*$ directly through $\sqrt{T_c/\bar M}$.
2. HCl is chemically spent: the H–Cl bond is already formed, so the chlorine
   contributes no energy and it sequesters hydrogen that would otherwise be
   available as H₂ or H₂O.

A chlorine-free oxidizer removes both, plus the corrosive and highly visible
plume. It does **not** remove the condensed-phase (Al₂O₃) penalty if the
propellant stays aluminized. 4 + 4 + 2.

**Q7 (10) —**
| rank | propellant | $I_d$ (kg·s/m³) |
|---|---|---|
| 1 | (i) AP/Al/HTPB | **522,000** |
| 2 | (iv) unmetallised AP/HTPB | 467,500 |
| 3 | (iii) LOX/RP-1 | 353,900 |
| 4 | (ii) LOX/LH2 | 163,600 |

Highest is **≈ 5.2 × 10⁵ kg·s/m³**. The instructive feature is that the
*unmetallised solid* still beats LOX/RP-1 comfortably, and that LOX/LH2 —
with by far the best $I_{sp}$ — is last by a factor of three. 6 for the
ranking, 4 for the value.

**Q8 (12) —**
*Mechanism.* The grain is cured at elevated temperature and is stress-free at
that temperature. On cooling, the propellant wants to shrink by
$\alpha_{prop}\Delta T$ with $\alpha_{prop}$ of order $10^{-4}$ K⁻¹, an order
of magnitude above the steel or composite case's. Because the grain is bonded
to the case at its outer surface, it cannot shrink freely; the constraint puts
the *inner* (bore) surface into hoop tension, concentrated at any geometric
feature — star tips, slots, the ends of the bore. The induced strain scales
with $(\alpha_{prop}-\alpha_{case})(T_{cure}-T)$ and with the web-to-bore
geometry. Meanwhile the allowable, $\varepsilon_m(T,\text{age})$, is falling:
down with temperature as the binder approaches $T_g$, and down with age as
post-cure and oxidative crosslinking stiffen the network. The grain cracks
when the induced strain crosses the falling allowable — which is why cracking
is a *cold* and *old* failure, and why neither cold nor age alone is
sufficient.

*Pressure trace.* On the subsequent firing the crack faces are additional
burning surface, exposed essentially at ignition. $K_n$ is higher than
designed, so by Eq. 3.3 $p_c$ is higher than designed and *amplified* by
$1/(1-n)$. The trace shows an early, sharp over-pressure — within the first
fraction of a second, since the crack is at the bore and is lit immediately —
followed either by a return toward nominal as the crack faces burn out and
merge into the design surface, or by continued escalation to case burst if the
crack keeps opening under the higher pressure. The signature that
distinguishes it from a fast propellant lot is that it appears *immediately*
and does not scale the whole trace uniformly.

Marks: 6 for the mechanism with all three ingredients (cure/stress-free
temperature, CTE mismatch with constraint, falling allowable), 6 for the trace
with the $1/(1-n)$ amplification and the timing.

**Q9 (12) —**
The most likely reason both are correct is that they are **two different
nozzles on the same motor**: a short-nozzle and a long-nozzle variant, with
different expansion ratios. Since $I_{sp} = c^*C_F/g_0$ and $C_F$ rises with
$\varepsilon$, the same propellant and the same chamber give different
$I_{sp}$. (This is exactly the Star 48B case: 286.2 s at $\varepsilon \approx
47.7$ against 292.2 s at $\varepsilon \approx 54.8$–70.4; the short nozzle was
built to fit inside the Shuttle PAM-D cradle.)

The information that must always accompany a solid motor $I_{sp}$ figure: the
**expansion ratio and the ambient condition** (sea level or vacuum) it was
computed or measured at. A close second, worth credit if stated: whether it is
delivered or theoretical, and whether it is burn-average or peak. Marks: 8 for
the two-nozzle explanation with the $C_F$ reasoning, 4 for the required
qualifier. Answering "one is theoretical and one is delivered" earns partial
credit — it is a real possibility, but a 2 % gap is small for that and the
two-nozzle explanation is the documented one.

**Q10 (10) —**
1. **Hazard class.** A NEPE-class propellant is class 1.1 — mass-detonating —
   against 1.3 for AP/Al/HTPB. That reclassifies the casting facility, the
   storage magazines, the quantity-distance separations, the transport
   packaging and routing, and the launch-site handling. It is a
   rebuild-the-factory decision, not a formulation decision, and it will cost
   more than 10 s of booster $I_{sp}$ is worth on any commercial launcher.
   **This is not a propulsion argument.**
2. **The 10 s is worth very little on a strap-on booster.** A booster burns
   early, at low altitude, on a low-$\varepsilon$ nozzle, and its $I_{sp}$
   improvement is multiplied by the smallest mass ratio in the vehicle. The
   same 10 s on the upper stage would buy several times the payload. And per
   §6.3, the case and the propellant mass fraction dominate: the P120C's move
   from 0.85 to 0.924 mass fraction dwarfs 10 s of $I_{sp}$.
   **This is the propulsion argument.**

Also creditable: aging and service-life risk from a nitrate-ester
plasticiser that migrates; loss of the qualified supply chain; and no flight
heritage in a commercial launcher. Marks: 5 + 5, with 2 of those for correctly
identifying which argument is which. A student who gives only the propulsion
argument has missed the more decisive one.

---

## K3. Trade-study reference solution (P19)

### Recommendation: **Option A** — AP/Al/HTPB, 88 % solids, 18 % Al, class 1.3.

### The argument, constraint by constraint

**Volume hard-capped.** This is the constraint that at first sight argues for
C or D, because density impulse (Eq. 3.5) is the right figure of merit under a
volume cap and D offers +5 % density and +10 s. Take that seriously and price
it: $I_d$ for A is roughly $1800 \times 270 = 4.86\times10^{5}$ kg·s/m³;
for D roughly $1890 \times 280 = 5.29\times10^{5}$, about **+9 %**. That is a
real gain and it is the only strong argument for D.

**Class 1.3 versus 1.1, with road transport to dispersed sites.** This kills C
and D. A 1.1-class motor moving by road to dispersed sites drives escorted
transport, route restrictions, quantity-distance at every site, and magazine
construction at every site. The requirement says "dispersed sites" — the cost
scales with the *number* of sites, not with the number of motors. A strategic
missile in a hardened silo or a submarine tube absorbs 1.1 because the
infrastructure already exists and volume-limited range is the mission; a
road-mobile ground interceptor does not have that excuse. The 9 % density
impulse is not worth multiplying the infrastructure cost across every site.

**−40 °C to +60 °C, unconditioned, 20 years.** This is what selects A over B
and what makes HTPB non-negotiable. HTPB's polybutadiene backbone has a $T_g$
well below the −40 °C requirement and its urethane cure gives the most uniform
network and therefore the best strain at failure (§3.4). A nitrate-ester
plasticised system (D) would be actively bad here: the plasticiser that keeps
it compliant is the species that migrates, and 20 years unconditioned with a
+60 °C upper bound is an accelerated-migration environment. Option B trades
solids loading for cold margin, which is the *correct instinct* but the wrong
answer if the structural analysis closes at 88 %.

**Time-to-intercept: thrust-to-weight and burn rate dominate.** This
substantially devalues $I_{sp}$ and revalues burn rate and density. A high-Al,
high-solids AP/HTPB gives a high $\rho_p$ (more propellant in the fixed
volume), a high $T_c$, and a burn rate that is freely tunable by AP grind and
iron-oxide catalyst over a wide range without leaving the family (§3.7).
Nothing in C or D buys time-to-intercept that A cannot buy more cheaply.

**No boost-phase signature requirement.** Removes the only remaining argument
for the reduced-signature C. State this explicitly — a student who
recommends C on signature grounds has not read the constraints.

### What you are giving up by choosing A

- About 9 % of density impulse relative to D, which under a hard volume cap
  translates fairly directly into burnout velocity. This is a real loss and
  the recommendation must own it rather than pretending 1.3 is free.
- About 5 s of $I_{sp}$ relative to C.
- Cold margin relative to B. 88 % solids at −40 °C is aggressive; if the grain
  structural analysis does not close, the fallback is B, at a cost of roughly
  2 points of density and a few seconds.

### The two qualification measurements to retire the largest risk

The largest risk in choosing A is **grain structural failure at −40 °C at end
of life** — the high solids loading is bought against exactly the margin the
cold requirement consumes. Therefore:

1. **Uniaxial tensile ($\sigma_m$, $\varepsilon_m$, modulus) at −40 °C on
   real-time-aged and accelerated-aged samples**, compared against the strain
   demanded by the grain structural analysis at the worst-case thermal cycle,
   with the required margin. Real-time surveillance units must be laid down at
   qualification, not later, because the accelerated Arrhenius extrapolation
   is the thing you are trying to validate.
2. **Bond-line integrity across the propellant/liner/insulation stack at
   −40 °C, after thermal cycling** — bond-tensile or peel specimens, plus
   non-destructive interrogation of stored units. Bulk tensile alone will miss
   migration-driven interface embrittlement (P17), and the aft-end bond under
   axial acceleration is the documented failure location.

A third, if the answer has room: **subscale ballistic motors conditioned to
both temperature extremes** to measure $\sigma_p$ and confirm the cold-day and
hot-day pressure spread stays inside the case and nozzle design envelope.

### Rubric

| element | marks |
|---|---|
| Names a single option and commits | 5 |
| Correctly identifies hazard class + road transport to *dispersed* sites as the decisive constraint against C and D | 20 |
| Uses density impulse, not $I_{sp}$, as the figure of merit under a volume cap — and quantifies the gain being given up | 20 |
| Argues HTPB explicitly from $T_g$ / cure network / cold strain, not by assertion | 15 |
| Recognises that time-to-intercept devalues $I_{sp}$ and revalues $\rho_p$ and $r$ | 10 |
| Notes the signature constraint is absent, removing the case for C | 5 |
| States what is given up, with a number | 10 |
| Two qualification measurements, both aimed at the *actual* largest risk (cold structural + bond line) | 15 |

**Loses marks for:** recommending D on $I_{sp}$ alone (this is the trap — the
question is engineered so that the highest-performance propellant is the wrong
answer); ignoring the storage temperature range; treating hazard class as a
paperwork issue; proposing qualification tests that measure ballistics when
the risk is structural; failing to give up anything, i.e. presenting the
recommendation as free.

**Option B is a defensible alternative** and should score well if the argument
is that the structural analysis at 88 % solids and −40 °C does not close with
margin. The distinguishing feature of a strong B answer is that it *states the
condition* under which B beats A, rather than choosing B out of vague caution.

---

## K4. Common wrong answers and what they reveal

**Forgetting the $1/(1-n)$ amplification.** By far the most common error, and
it appears in Q2, P11, and Q8. Students compute a burn-rate change and quote it
as the pressure change. It reveals that Eq. 3.3 has been memorised as a formula
rather than understood as an equilibrium between two mass flows with different
pressure dependences. The diagnostic: ask what happens if $n \to 1$.

**Quoting an $I_{sp}$ without an expansion ratio.** Appears in Q9, P16, and
throughout the trade study. It reveals the belief that $I_{sp}$ is a property
of the propellant. It is a property of the *motor*, and $c^*$ is the property
of the propellant. Any student who cannot immediately separate $c^*$ from
$C_F$ when handed a performance figure has not reached Level 2.

**Crediting a generational performance jump entirely to chemistry.** The Titan
UA1207 → SRMU case (§6.2). Students see +14 s and say "HTPB." The correct
response is to decompose: how much of the delta is $c^*$ and how much is the
nozzle and expansion ratio? In that case a substantial share is the nozzle.
This reveals the same $c^*$/$C_F$ confusion in a historical costume.

**Treating aluminium as a pure $I_{sp}$ additive.** Students remember "metal
raises specific impulse" and forget both the two-phase debit and the two
reasons aluminium is really there — density and acoustic damping. WE 19.4
exists to fix this. The tell is a student who cannot say what happens to a
large unmetallised composite motor's stability.

**Using $\bar M$ of the gaseous products in Eq. 3.4 for an aluminized
propellant.** P12's trap. It reveals a student who understands that only gas
expands — which is genuinely good — but has not thought about what the thrust
integral is actually taken over. The full answer requires knowing that the
total-mass-basis $\bar M$ is a deliberate approximation whose error is the
two-phase loss.

**Confusing the Trident "aerospike" with an aerospike nozzle.** Every year.
It is a telescoping drag-reduction spike on the nose. Reveals nothing about
propulsion understanding; it is a vocabulary collision, and the course flags
it precisely so it stops costing marks.

**Dismissing a 0.2 percentage-point ingredient discrepancy as rounding.**
§3.10. Reveals that the student has not internalised that catalysts operate at
tenths of a percent and that everything downstream of burn rate is amplified.
The instructive follow-up: which number in the SRB composition table would you
check first, and why is it the smallest one?

**Answering the trade study by picking the highest-$I_{sp}$ option.** P19 is
built to punish this. It reveals that the student has a single scalar notion of
"performance" and has not absorbed the module's central claim: that hazard
class, volume, storage temperature, and case mass fraction each routinely beat
$I_{sp}$ in deciding what a real motor burns.

**Assuming an aging program that measures the right quantity is measuring it
in the right place.** P17. Reveals a habit of trusting instrumented data
without asking what the failure mode is and whether the sample location and
test temperature are relevant to it. This one generalises far beyond solid
propellant.

**Treating the module's two-phase bracket as a prediction.** WE 19.3 and P13
produce a 19–25 % *bound*, and some students report that as the loss. It is a
bracket; real motors sit at 1–3 %. The failure is not arithmetic but
epistemic — not distinguishing a bounding calculation from an estimate, which
is the same failure that makes people quote unqualified numbers from
secondary sources.
