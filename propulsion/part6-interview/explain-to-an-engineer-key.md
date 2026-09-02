# "Explain this to an engineer" — model answers

Key to [`explain-to-an-engineer.md`](explain-to-an-engineer.md). One model
spoken answer per prompt, 120–250 words, in the five-part structure the drill
teaches:

> **Physics** (one sentence) → **Mechanism** → **Quantitative hook** →
> **Trade-off or exception** → **Follow-up they will ask**

These are *model* answers, not the only correct ones. Where the prompt admits
several defensible framings, the answer says so.

**Every real-engine number here comes from
[`reference/_verify-liquid.md`](../reference/_verify-liquid.md),
[`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
or [`reference/engine-database.md`](../reference/engine-database.md), and
carries that file's caveat.** Where the worksheets say a figure is contested,
a company claim, or not published, the answer says that out loud — because
saying it out loud is part of the answer.

**Arithmetic** is computed with [`tools/rocket.py`](../tools/rocket.py) and
registered in [`tools/examples/explain.py`](../tools/examples/explain.py), so
every number below can be recomputed with `python3 tools/check_examples.py`.
Registered results are marked `[EX nn.x]`.

**Working gas models used throughout** (consistent with Modules 01–03, tagged
[A] approximation): LOX/RP-1 products $\gamma = 1.20$, $M = 23.0$ kg/kmol
($R = 361.5$ J/(kg·K)), $T_0 = 3600$ K, $c^*_{ideal} = 1759$ m/s; LOX/LH2
products $\gamma = 1.19$, $R = 615.9$ J/(kg·K), $T_0 = 3600$ K,
$c^*_{ideal} = 2303$ m/s. The F-1 is worked at $\gamma = 1.21$. Real engines
run a few percent below these ideals.

---

## A. Thermodynamics and compressible flow

### 1. Why does chamber pressure matter? `[M01][M03][M09]` — *seed*

**Physics.** Chamber pressure does not change $c^*$ at all; it buys you thrust
coefficient, and it buys you every quantity that scales with size.

**Mechanism.** $c^* = \sqrt{RT_0}/\Gamma$ contains no pressure term — it is set
by the propellant chemistry alone [F]. What raising $p_c$ does is raise the
pressure *ratio* the nozzle works across, $p_c/p_a$, so at a given ambient
pressure you can carry a larger expansion ratio before the flow separates, and
you recover more of the available enthalpy. It also shrinks the engine: for
fixed thrust, $A_t = F/(p_c C_F)$, so doubling $p_c$ roughly halves the throat
and shrinks every part downstream of it.

**Quantitative hook.** Kerolox, $\varepsilon = 16$ fixed, sea level: $C_F$ goes
1.2567 → 1.5655 → 1.6350 → 1.7430 as $p_c$ goes 30 → 70 → 100 → 300 bar, i.e.
sea-level Isp 225 → 281 → 293 → 313 s `[EX 01.a–d]`. That is +56 s from 30 to
70 bar and only +20 s from 100 to 300. The returns are steeply diminishing.

**Trade-off.** Everything else gets worse. Throat heat flux goes as
$p_c^{0.8}$ (Bartz), so 70 → 300 bar is a 3.2× flux increase `[EX 57.a]`; the
feed system has to deliver it, which is why 300 bar means staged combustion,
and the RS-25 at 206 bar needs a 53 MW fuel turbopump.

**Follow-up they will ask:** *"So why did the RS-68 stop at 102 bar?"*

---

### 2. Why is the flow at the throat sonic, and what changes downstream if I raise the back pressure? `[M02]`

**Physics.** In steady one-dimensional flow, area change and Mach number are
coupled by $\frac{dA}{A} = (M^2-1)\frac{dV}{V}$, so the only place a flow can
pass through $M=1$ is where $dA = 0$ — the throat.

**Mechanism.** Once the throat is sonic, information cannot travel upstream
past it: acoustic waves move at the local speed of sound relative to the fluid,
and at $M=1$ they stand still. The chamber therefore cannot know what the
ambient pressure is. Mass flow is fixed by $p_c$, $T_0$ and $A_t$ alone.

**Quantitative hook.** Choking begins at $p_c/p_a = \left(\frac{\gamma+1}{2}
\right)^{\gamma/(\gamma-1)}$, about 1.83 for $\gamma=1.2$. Every flight rocket
runs at 30–300 times that, so it is choked from a fraction of a second after
ignition until shutdown.

**Trade-off / exception.** Raising back pressure changes nothing in the chamber
but everything in the divergent section: the exit static pressure is fixed by
area ratio, so as $p_a$ rises past it the nozzle goes from underexpanded to
overexpanded, then a shock system moves in from the exit, and eventually the
boundary layer separates. Thrust falls, and it falls *unevenly* if separation
is asymmetric — that is where start-up side loads come from.

**Follow-up:** *"At what pressure ratio does it actually separate?"*

---

### 3. How does choked mass flow depend on chamber pressure and temperature, and why is the throat the engine's flow meter? `[M02][M03]`

**Physics.** $\dot m = \Gamma\, p_0 A_t/\sqrt{RT_0}$ with
$\Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}
{2(\gamma-1)}}$ — linear in pressure, inverse-square-root in temperature.

**Mechanism.** At the throat, density is a fixed fraction of chamber density
and velocity is the local sound speed. Density scales with $p_0/T_0$ and sound
speed with $\sqrt{T_0}$, so their product scales as $p_0/\sqrt{T_0}$. That is
the whole result.

**Quantitative hook.** For the RS-25 at 206.4 bar, $\gamma=1.19$, $R=615.9$,
$T_0 = 3600$ K, a throat of 0.05694 m² (269 mm diameter) passes 510 kg/s
`[EX 17.a–c]` — within 1% of the 514 kg/s the published 2,279 kN and 452.3 s
vacuum Isp imply [_verify-liquid, RS-25 block]. That agreement is not luck; it
is why the relation is trusted.

**Trade-off / exception.** Because $\dot m \propto 1/\sqrt{T_0}$ and only
weakly on chemistry, the throat is the most reliable flow measurement on the
engine — better than any turbine meter in a cryogenic line. But it is only as
good as your $p_c$ measurement and your assumed $\gamma$, and a 2% throat
erosion in a solid moves it 2% with no warning.

**Follow-up:** *"So how do you separate a $c^*$ shortfall from a bad $p_c$
transducer?"*

---

### 4. Why does a converging–diverging duct accelerate a gas that a converging duct cannot? `[M02]`

**Physics.** Below $M=1$ density falls more slowly than velocity rises, so
continuity demands a contraction to accelerate; above $M=1$ density falls
*faster* than velocity rises, so acceleration demands an expansion.

**Mechanism.** Write continuity as $\rho A V = $ const and differentiate:
$\frac{d\rho}{\rho} + \frac{dA}{A} + \frac{dV}{V} = 0$. Combine with the
isentropic momentum relation $dp = -\rho V\,dV$ and $a^2 = dp/d\rho$, and you
get $\frac{dA}{A} = (M^2 - 1)\frac{dV}{V}$. The sign of $(M^2-1)$ flips at
sonic conditions and the required area change flips with it.

**Quantitative hook.** A convergent nozzle can never exceed $M=1$, which caps
exit velocity at the throat sound speed — around 1,100 m/s for LOX/LH2 products
at 3,600 K, i.e. about 110 s of Isp. The RS-25's $\varepsilon = 69$ bell reaches
$M_e = 4.55$ and 452.3 s vacuum [_verify-liquid, RS-25 block]. The divergent
section is worth a factor of four.

**Trade-off.** All of that expansion happens at falling pressure and falling
temperature, which is exactly when the chemistry freezes out and the boundary
layer thickens — so the last third of a big nozzle earns a small fraction of
the performance while carrying most of the mass.

**Follow-up:** *"Where does the flow stop recombining?"*

---

### 5. What happens to exhaust velocity if I double the flame temperature? `[M01][M03]`

**Physics.** Ideal exhaust velocity goes as $\sqrt{T_0}$, so doubling $T_0$
buys you 41%, not 100% — and you never get the doubling anyway.

**Mechanism.** $v_e = \sqrt{\frac{2\gamma}{\gamma-1}\frac{R_u T_0}{M}\left[1 -
(p_e/p_c)^{(\gamma-1)/\gamma}\right]}$. Everything about the propellant enters
through $T_0/M$, under a square root. So a 2× temperature rise is a 1.41×
velocity rise at best.

**Quantitative hook.** But the temperature rise is not free: it comes from
moving toward stoichiometric, which raises $M$ at the same time — and the
product gases at high temperature dissociate, absorbing enthalpy. LOX/LH2 at
MR 6 runs *cooler* than at MR 4–5 and delivers more Isp, because $M$ falls
faster than $T_0$ does. The RS-25 runs MR 6.03 for 452.3 s
[_verify-liquid, RS-25 block]; nobody runs it at the temperature peak.

**Trade-off.** Every kelvin of $T_0$ is paid for in the cooling circuit. Bartz
heat flux goes as $T$-driven $\Delta T$ across the film and as $p_c^{0.8}$; the
V-2 put water into its fuel specifically to hold $T_0$ down, and that was a
performance choice made in favour of wall survival
[_verify-liquid, V-2 block].

**Follow-up:** *"Then why does anyone quote flame temperature at all?"*

---

### 6. Why does molecular weight matter more than temperature? `[M01][M04]`

**Physics.** Exhaust velocity goes as $\sqrt{T_0/M}$, and in practical
chemistry you can move $M$ by a factor of three but $T_0$ by only tens of
percent.

**Mechanism.** $R = R_u/M$, so a light exhaust has more energy per kilogram
available at the same temperature — the same joules are carried by fewer,
faster molecules. Hydrogen-rich exhaust is mostly H₂O and unburnt H₂;
kerosene-rich exhaust adds CO and CO₂ at 28 and 44 kg/kmol.

**Quantitative hook.** LOX/LH2 products at MR 6 sit near $M = 13.8$ kg/kmol;
kerolox products near $M = 23$. At the same $T_0 = 3600$ K that alone is a
$c^*$ of 2,303 m/s versus 1,759 m/s `[EX 06.a–b]` — a 31% difference, from
molecular weight only. The flight numbers follow: RS-25 452.3 s vac versus
Merlin 1D 311 s vac [_verify-liquid, RS-25 and Merlin blocks].

**Trade-off.** Low $M$ means low density. Hydrogen bulk density at MR 6 is
about 362 kg/m³ against 1,017 kg/m³ for kerolox, so per unit *volume* of
propellant the kerosene stage wins by a factor of 1.93 in density impulse
`[EX 16.a–c]`. Which one matters depends entirely on whether the stage is
volume-limited or mass-limited.

**Follow-up:** *"So why not fly monatomic hydrogen, or a lighter exhaust
still?"*

---

### 7. Why is the stagnation pressure at the injector face higher than at the throat, and by how much? `[M01][M02]`

**Physics.** The chamber flow is not stationary — it is accelerating from the
injector to the throat, and adding heat to a moving compressible flow drops its
stagnation pressure (Rayleigh-line loss).

**Mechanism.** Two separate effects are usually conflated. First, the *static*
pressure falls from the injector to the throat simply because the gas
accelerates. Second, the *stagnation* pressure falls because combustion adds
heat at finite Mach number. The first is a few percent for a normal contraction
ratio; the second is smaller still but real.

**Quantitative hook.** At a contraction ratio of 3, chamber Mach number is
about 0.20, so $p_0/p = 1.0246$ — the injector-face static pressure is 2.5%
above the throat stagnation value for that alone. Worked for a 206 bar RS-25
class chamber, the two stations give 9,080 versus 8,871 kg/s per m² of throat —
2.3% apart [Module 01, WE1].

**Trade-off / exception.** This is not academic. Apollo-era American practice
quotes injector-end pressure; Soviet and Russian practice quotes nozzle
stagnation, which is a few percent lower [_verify-liquid, standing note on
conventions]. Comparing the RD-180's 267 bar with the RS-25's 206 bar without
saying which convention each uses overstates the gap. It is also most of why
the F-1's chamber pressure appears in the literature as 965, 982, 1,015 and
1,125 psia.

**Follow-up:** *"Which one do you use when you size the throat?"*

---

### 8. What happens if $\gamma$ drops from 1.25 to 1.15? `[M01][M02]`

**Physics.** $\gamma$ is the gas's ability to convert thermal energy into
directed kinetic energy; a lower $\gamma$ means more energy hiding in internal
modes, but also a steeper expansion.

**Mechanism.** It appears in three places at once. In $\Gamma(\gamma)$, which
sets choked mass flow and $c^*$ — $\Gamma$ rises from 0.65806 at $\gamma=1.25$
to 0.63864 at $\gamma=1.15$, so $c^*$ *rises* about 3% at fixed $RT_0$. In the
area-ratio relation, so the same $\varepsilon$ gives a different exit Mach. And
in $C_F$, where the lower $\gamma$ recovers more of the available enthalpy at
large expansion.

**Quantitative hook.** $\Gamma(1.15) = 0.63864$, $\Gamma(1.25) = 0.65806$
[Module 03, table]. Since $c^* = \sqrt{RT_0}/\Gamma$, the 3% change in $\Gamma$
is a 3% change in $c^*$ — which is the same order as the entire difference
between a good and a mediocre injector.

**Trade-off / exception.** Low $\gamma$ is what heavy, polyatomic, highly
dissociated products look like. It comes packaged with high $M$, and the $M$
penalty usually swamps the $\gamma$ benefit. This is also why cold-gas
refrigerants with $\gamma \approx 1.08$ have high $C_F$ (2.05 at
$\varepsilon = 50$) and terrible Isp — the $C_F$ cannot rescue a $c^*$ of
205 m/s [_verify-solid-coldgas, B.1 table].

**Follow-up:** *"Which $\gamma$ do you use — chamber, throat or exit?"*

---

### 9. Why is chemical rocket exhaust velocity stuck near 4,500 m/s? `[M01][M04]`

**Physics.** The exhaust velocity is set by the chemical energy released per
kilogram of propellant, and that is bounded by the strength of chemical bonds —
a few electron-volts per molecule, no more.

**Mechanism.** All of the reaction enthalpy that is not lost to dissociation,
to unrecovered chemical energy at the exit plane, or to the cooling circuit
appears as directed kinetic energy: $v_e \approx \sqrt{2\eta\,\Delta h_r}$. For
LOX/LH2 the heat of reaction is around 13 MJ/kg of mixture at MR 6; even at
perfect conversion that is $\sqrt{2 \times 13\times10^6} \approx 5{,}100$ m/s.
No arrangement of hardware beats the chemistry.

**Quantitative hook.** The best flown chemical engine is the RL10B-2 at 465.5 s
vacuum, i.e. $c = 4{,}566$ m/s [_verify-liquid, RL10B-2 block]. The best
*demonstrated* is the RD-0146 at 470 s — and that is a bureau test-stand figure
for an engine that has never flown, which is exactly the kind of number you
should flag rather than quote flat [_verify-liquid, RD-0146 block].

**Trade-off / exception.** The ceiling is on $v_e$, not on mission capability.
Staging, density impulse, and $\Delta v$ splits all move the answer without
moving the chemistry. And electric propulsion breaks the bound entirely by
adding energy from outside the propellant — at four orders of magnitude less
thrust.

**Follow-up:** *"So what would a 500-second chemical engine have to be?"*

---

## B. Performance

### 10. Why isn't maximum flame temperature necessarily maximum Isp? `[M03][M04][M05]` — *seed*

**Physics.** Isp scales with $\sqrt{T_0/M}$, not with $T_0$ — so the optimum is
where that *ratio* peaks, and that is always on the fuel-rich side of the
temperature peak.

**Mechanism.** As you move from fuel-rich toward stoichiometric, $T_0$ rises,
but so does $M$: you are converting light H₂ into heavier H₂O, and light CO
into heavier CO₂. Past some mixture ratio, $M$ climbs faster than $T_0$, and
$\sqrt{T_0/M}$ turns over. Dissociation makes it worse — near the temperature
peak, a large fraction of the released enthalpy goes into breaking H₂O into OH
and H rather than into directed motion, and unless it recombines in the nozzle
that energy is thrown away.

**Quantitative hook.** LOX/LH2 peaks in flame temperature near MR 4.5–5 but
essentially every flown hydrogen engine runs richer: J-2 at 5.5, RL10A at 5.0,
RS-25 at 6.03, Vulcain 2 at 6.1 [_verify-liquid, respective blocks]. The RS-25
gets 452.3 s at MR 6.03 — well past the temperature peak.

**Trade-off.** The Isp optimum is not the *vehicle* optimum either. Vulcain 2
went from Vulcain 1's MR 5.3 to 6.1 and its vacuum Isp *fell* from 431 s to
429 s — because the richer ratio gave more thrust and denser bulk propellant,
which the Ariane 5 stage wanted more than it wanted two seconds
[_verify-liquid, Vulcain block].

**Follow-up:** *"So what does the vehicle actually optimise?"*

---

### 11. Why split Isp into $c^*$ and $C_F$? `[M03][M18]`

**Physics.** $I_{sp} = c^* C_F / g_0$ factors performance into a chemistry-and-
combustion term and a gas-dynamics-and-geometry term, and those two fail for
completely different reasons.

**Mechanism.** $c^* = p_c A_t/\dot m$ depends only on what happens upstream of
the throat: propellant, mixture ratio, mixing quality, residence time.
$C_F = F/(p_c A_t)$ depends only on what happens downstream: area ratio,
ambient pressure, contour, separation. So a hot fire that comes in low
partitions cleanly.

**Quantitative hook.** Measure $p_c$, $\dot m$ and $A_t$ and you have $c^*$
directly; measure $F$ as well and you have $C_F$. A 2% $c^*$ shortfall at
otherwise nominal $C_F$ points at the injector — poor mixing, wrong mixture
ratio, too short an $L^*$. A nominal $c^*$ with 3% low $C_F$ points at the
nozzle — separation, erosion, or an area-ratio you do not actually have.

**Trade-off / exception.** The split only works if your $A_t$ is right. Throat
erosion moves both terms and looks like neither: in a solid motor a 2% throat
area growth drops chamber pressure 3.0% at $n = 0.35$ `[EX 53.a]`, and if you
compute $c^*$ with the pre-fire throat you will blame the propellant.

**Follow-up:** *"Your $c^*$ efficiency is 97%. Is that good?"*

---

### 12. Why does Isp climb with altitude, and how much of that is pressure thrust? `[M03][M09]`

**Physics.** Thrust is $\dot m v_e + (p_e - p_a)A_e$; the mass-flow term does
not know about altitude, so the entire gain is the ambient-pressure term
$-p_a A_e$ disappearing.

**Mechanism.** At sea level the ambient atmosphere pushes on the exit plane
against you. As $p_a$ falls to zero that push vanishes. Nothing inside the
engine changes at all — same $\dot m$, same $p_c$, same $v_e$ once the flow is
attached.

**Quantitative hook.** F-1 class, $\varepsilon = 16$, $p_c = 70$ bar,
$\gamma = 1.21$: $C_F$ goes from 1.5580 at sea level to 1.7896 in vacuum, a
14.9% gain `[EX 12.a–b]`. With $c^* = 1655$ m/s that is 263 s → 302 s, and the
published F-1 numbers are 263 s SL / 304 s vac [_verify-liquid, F-1 block].
The ambient term alone is $p_a A_e / F_{SL} = 14.9\%$ of sea-level thrust
`[EX 12.c]`.

**Trade-off.** The gain is bigger for a bigger nozzle, which is why sustainer
and upper-stage engines look badly overexpanded on the pad. The Atlas LR-105
sustainer delivers only 220 s at sea level and 309 s in vacuum — an 89-second
spread, and the low number is real, not a typo [_verify-liquid, MA-5 block].

**Follow-up:** *"So why not fly the biggest nozzle that fits?"*

---

### 13. How does HM7B at 37 bar beat the RD-180 at 267 bar by 100+ seconds? `[M03][M09]`

**Physics.** Isp is set by propellant chemistry and by pressure *ratio*, not by
chamber pressure. In vacuum, the ratio is set by expansion ratio, and expansion
ratio is free of chamber pressure entirely.

**Mechanism.** Two things stack. First, propellant: HM7B burns LOX/LH2 at MR 5,
$M \approx 14$; the RD-180 burns LOX/RP-1 at MR 2.72, $M \approx 23$. That is
most of the gap. Second, expansion: HM7B carries $\varepsilon = 83.1$ into
vacuum; the RD-180 carries 36.87 and has to survive sea level with it.

**Quantitative hook.** HM7B: 62.2 kN vacuum, 37 bar, 444.6 s, $\varepsilon =
83.1$, dry mass 165 kg [_verify-liquid, HM7B block]. RD-180: 4,150 kN vacuum,
267 bar, 338 s vac, $\varepsilon = 36.87$ [_verify-liquid, RD-180 block]. The
worksheet's own verdict on HM7B is the line worth borrowing: 444.6 s from a
gas-generator cycle at only 37 bar "is the demonstration that upper-stage Isp
is dominated by expansion ratio, not chamber pressure."

**Trade-off.** The RD-180 is not trying to win that comparison. It has to lift
an Atlas V off the pad, so it needs 3,830 kN at sea level from an engine that
fits under a 3.8 m stage, and 267 bar is how you get thrust density. HM7B makes
62 kN and takes 735–950 s to do its job.

**Follow-up:** *"Then what is chamber pressure actually for on an upper
stage?"*

---

### 14. Why does one engine have three published thrust ratings? `[M03][M18]`

**Physics.** "Thrust" is not one quantity. It depends on ambient pressure, on
what hardware you draw the control volume around, and on what power level you
are quoting.

**Mechanism.** Sea level versus vacuum is the obvious one — 15% for a booster
engine. Then there is what counts as the engine: turbine exhaust dumped
overboard produces real, measurable thrust. Then there is the rating: nameplate
rating, uprated flight rating, and development peak are three different
numbers.

**Quantitative hook.** The Redstone A-7 is the cleanest example in the
literature. 75,000 lbf is the NAA 75-110 nameplate (75,000 lbf for 110 s);
78,000 lbf is that plus about 3,000 lbf of steam-generator exhaust thrust;
82,977 lbf is the uprated A-7 as actually flown on Mercury-Redstone, with
93,565 lbf in vacuum [_verify-liquid, A-7 block and contested item 8]. All
three numbers are correct and they mean different things.

**Trade-off / exception.** The same trap in solids is worse because it is a
factor of two: Wikipedia lists the Titan IV UA1207 at 14.234 MN and the SRMU
at 15.12 MN, and both are *two-booster vehicle totals* presented as one motor
[_verify-solid-coldgas, contested item 1]. Always attach `/motor` or
`/vehicle`, and `max` or `avg`.

**Follow-up:** *"Which one goes in the trajectory model?"*

---

### 15. What happens if $c^*$ efficiency comes in 2% low? `[M03][M07][M18]`

**Physics.** $c^*$ efficiency multiplies straight through to Isp, and Isp
enters the rocket equation inside an exponential — so a small performance miss
is a large payload miss.

**Mechanism.** $I_{sp} = \eta_{c^*} c^*_{ideal} C_F/g_0$. At fixed $\dot m$ and
$A_t$, a 2% $c^*$ shortfall shows up as 2% low chamber pressure, which drags
$C_F$ down slightly as well, so delivered Isp falls a little more than 2%.
Thrust falls by roughly the same 2%.

**Quantitative hook.** On a 450 s upper stage, 2% is 9 seconds. Through
$\Delta v = I_{sp} g_0 \ln(m_0/m_f)$ at a typical upper-stage mass ratio of 5,
9 seconds is about 140 m/s — which for a GTO mission is a few hundred kilograms
of payload. This is why $c^*$ efficiency is quoted to a tenth of a percent and
why 97% is a *problem*, not a pass.

**Trade-off / exception.** The fix is usually the injector: smaller elements,
more of them, or more residence time via a longer $L^*$. All three cost you.
Smaller elements are more expensive and more prone to plugging; longer $L^*$
means more chamber wall to cool and more mass. The V-2 ran about 94% $c^*$ with
its 18-pot injector, and the flat-face impinging injectors that replaced it
were the direct answer [_verify-liquid, V-2 and XLR43 blocks].

**Follow-up:** *"How would you tell 2% low $c^*$ from a 2% error in your flow
measurement?"*

---

### 16. Why care about density impulse and not just Isp? `[M03][M05][M33]`

**Physics.** A stage carries propellant in tanks, and tanks are sized by volume
while the rocket equation is written in mass. Density impulse $\rho I_{sp}$ is
the quantity that connects them.

**Mechanism.** Halving propellant density does not halve tank mass — it roughly
doubles tank *volume*, and tank mass tracks volume and surface area, not
propellant mass. Bigger tanks also mean a longer, heavier vehicle with more
aerodynamic and structural load. So the stage-level optimum is not the
propellant with the best Isp.

**Quantitative hook.** LOX/LH2 at MR 6.03 has a bulk density of 362 kg/m³ and
452.3 s vacuum Isp, giving $\rho I_{sp} = 163{,}800$ kg·s/m³. LOX/RP-1 at MR
2.34 is 1,017 kg/m³ at 311 s, giving 316,200 — a factor of 1.93 in kerosene's
favour `[EX 16.a–c]`. LOX/methane at MR 3.6 sits between them at about 833
kg/m³ `[EX 16.d]`.

**Trade-off.** Which one wins depends on where the stage sits. Hydrogen's Isp
advantage compounds through the exponential and its density penalty is paid
once, so hydrogen wins on upper stages and loses on boosters. That is why the
Saturn V burned kerosene in the first stage and hydrogen above it, and why no
one has ever flown a hydrogen first stage that was not also carrying solids.

**Follow-up:** *"Where exactly does the crossover sit?"*

---

### 17. How would you size a throat from thrust, $p_c$ and $\varepsilon$? `[M03][M09]`

**Physics.** $F = C_F p_c A_t$, and $C_F$ is a pure function of $\gamma$,
$\varepsilon$ and $p_a/p_c$. So the throat falls straight out.

**Mechanism.** Three steps, all doable on a whiteboard. Assume a $\gamma$ from
the propellant (1.20 kerolox, 1.19 hydrolox). Compute $C_F(\gamma,
\varepsilon, p_c, p_a)$. Then $A_t = F/(C_F p_c)$, and
$D_t = 2\sqrt{A_t/\pi}$. If you want mass flow too,
$\dot m = \Gamma p_c A_t/\sqrt{RT_0}$.

**Quantitative hook.** RS-25 at 109%: $F_{vac} = 2{,}279$ kN, $p_c = 206.4$
bar, $\varepsilon = 69$, $\gamma = 1.19$ gives $C_F = 1.9393$, so
$A_t = 0.05694$ m² and $D_t = 269$ mm `[EX 17.a–b]`. Then
$\dot m = 510$ kg/s `[EX 17.c]`, against the 514 kg/s the published thrust and
Isp imply [_verify-liquid, RS-25 block]. Under a percent, in three lines.

**Trade-off / exception.** It is only as good as your $\gamma$ and your
$\varepsilon$ definition. Use the RS-25's other published expansion ratio,
77.5, and $C_F$ moves to 1.9479 — 0.45% — so the throat moves 0.45% the other
way `[EX 52.a–b]`. That is small here but it is not always: at
$\varepsilon = 285$ versus 77 the $C_F$ difference is 4% `[EX 51.a–b]`.

**Follow-up:** *"Now do it for a sea-level engine and tell me if it
separates."*

---

## C. Thermochemistry

### 18. Why do rockets run fuel-rich? `[M04][M05]`

**Physics.** Three reasons stack in the same direction: lower mean molecular
weight, less dissociation, and a cooler wall — and all three want you rich.

**Mechanism.** Excess fuel leaves light unburnt species in the exhaust — H₂ at
2 kg/kmol for hydrogen engines, H₂ and CO for hydrocarbons — pulling $M$ down.
Running below the temperature peak also means less of the released enthalpy is
tied up in dissociated OH, H and O that may never recombine. And the gas that
touches the wall is fuel-rich, which for a hydrocarbon means reducing rather
than oxidising conditions on your copper liner.

**Quantitative hook.** Every flown engine is rich of stoichiometric.
Stoichiometric LOX/LH2 is MR 8; engines fly 5.0–6.1 [_verify-liquid, RL10 and
Vulcain blocks]. Stoichiometric LOX/RP-1 is about MR 3.4; engines fly 2.23–2.72
[_verify-liquid, H-1 and RD-180 blocks].

**Trade-off.** Rich costs you density and it costs you thrust per unit flow,
which is why Vulcain 2 went the *other* way — 5.3 to 6.1 — and gave up 2 s of
Isp to gain thrust and bulk density [_verify-liquid, Vulcain block]. And in
oxidizer-rich staged combustion the *preburner* runs the other way entirely,
for turbine-life reasons, which is a different optimisation altogether.

**Follow-up:** *"So why is the RD-180's preburner oxidizer-rich?"*

---

### 19. Frozen versus equilibrium expansion — which is closer to the truth? `[M04][M09]`

**Physics.** Real nozzle flow is neither: it starts in equilibrium near the
throat, where residence times are long compared with chemical times, and
freezes somewhere in the divergent section as temperature and density collapse.

**Mechanism.** Equilibrium assumes composition re-adjusts instantly at every
station, so recombination releases its enthalpy and you recover it as kinetic
energy. Frozen assumes composition is locked at the chamber value, so
dissociation energy is thrown away. The truth is set by the Damköhler
number — the ratio of flow time to chemical time — which falls through the
nozzle until the chemistry stops keeping up.

**Quantitative hook.** The two bracket the answer by roughly 2–5% in Isp for
LOX/LH2, more for aluminised solids where condensation of Al₂O₃ is part of the
same question. In Module 01's worked case the frozen and equilibrium exit
velocities at $\varepsilon = 69$ differ by a few percent, and CEA reports both
columns precisely because neither is right [CEA].

**Trade-off / exception.** Engineering practice is to compute both, use
equilibrium as the optimistic bound, and apply an empirical kinetic-loss
factor — typically 1–2% for hydrogen, more for hydrocarbon and much more for
solids with two-phase flow. Never quote an Isp without saying which column it
came from; that is how a paper claim becomes a flight surprise.

**Follow-up:** *"Where in the nozzle does it freeze?"*

---

### 20. Why does recombination give back Isp, and where does it stop? `[M04][M09]`

**Physics.** Dissociation in the chamber stores enthalpy chemically; if those
radicals recombine while still upstream in the nozzle, that enthalpy is
released where there is still nozzle left to convert it into velocity.

**Mechanism.** Recombination reactions like $H + OH + M \rightarrow H_2O + M$
are three-body, so their rate goes as the *square* of density times the third
body. Through the nozzle, density falls by orders of magnitude while flow
velocity rises, so the chemical time grows explosively while the residence time
shrinks. There is a station where the two cross and the composition freezes.

**Quantitative hook.** For a typical hydrolox nozzle that crossover happens
somewhere in the first few area ratios past the throat — well before
$\varepsilon = 10$, let alone 69. That is why the recovered fraction is
largely determined by chamber pressure: higher $p_c$ means higher density at
every station, later freezing, more recovery. It is one of the few genuine
Isp benefits of chamber pressure beyond the $C_F$ effect.

**Trade-off / exception.** In an aluminised solid the analogous process is
Al₂O₃ condensation and it releases a great deal of heat — but the condensed
phase then has to be accelerated by the gas, which costs you through two-phase
flow lag and particle drag. Recombination helps; condensation helps and hurts.

**Follow-up:** *"How much Isp does that actually buy on the RS-25?"*

---

### 21. Why did Vulcain 2 raise MR to 6.1 and accept lower Isp? `[M04][M05][M33]`

**Physics.** The stage optimises $\Delta v$ for a given tank volume and dry
mass, not Isp — and moving oxidizer-rich raises bulk density and thrust while
costing a small amount of Isp.

**Mechanism.** Hydrogen is 71 kg/m³; LOX is 1,141. Shifting mixture ratio from
5.3 to 6.1 means carrying proportionally less of the bulky fluid and more of
the dense one, so the same tank volume holds more propellant mass. It also
raises mass flow and thus thrust at the same chamber size. The Isp penalty is
small because you are already well past the $T_0$ peak and the $\sqrt{T_0/M}$
curve is flat there.

**Quantitative hook.** Vulcain 1: MR 5.3, 1,140 kN vacuum, $p_c$ 100 bar,
431 s vac, $\varepsilon$ 45.1, 1,300 kg. Vulcain 2: MR 6.1, 1,359 kN vacuum,
117.3 bar, **429 s** vac, $\varepsilon$ 58.2, 1,800 kg
[_verify-liquid, Vulcain block]. Thrust up 19%, Isp down 2 s.

**Trade-off.** It is not free anywhere else either: the richer mixture and
higher $p_c$ raised wall heat flux enough that Vulcain 2 had to add film
cooling to the lower nozzle using turbine exhaust — cooling that Vulcain 1 did
not need [_verify-liquid, Vulcain block]. A mixture-ratio decision propagated
into the thermal design.

**Follow-up:** *"How would you have shown that trade closes?"*

---

### 22. How does aluminium raise solid performance while lowering $\gamma$? `[M04][M19]`

**Physics.** Aluminium adds a very large heat of combustion per kilogram, which
raises $T_0$ sharply; the product Al₂O₃ is heavy and condenses, which raises
effective $M$ and lowers effective $\gamma$.

**Mechanism.** $\sqrt{T_0/M}$ improves on net because the temperature gain
dominates. But the condensed alumina is a *particulate*: it carries mass and
enthalpy through the nozzle while contributing nothing to pressure. Treated as
part of a pseudo-gas it depresses the mixture's ratio of specific heats and
introduces velocity and thermal lag — the particles never fully accelerate to
the gas velocity, so you lose a couple of percent of Isp to two-phase flow.

**Quantitative hook.** The Shuttle RSRM propellant is 16% aluminium by mass,
with 69.6% AP, 0.4% iron oxide, 12.04% PBAN binder and 1.96% epoxy curative
[_verify-solid-coldgas, A.1, NASA fact-sheet figure; a competing 69.8/0.2 split
also circulates]. Delivered performance is 242 s SL / 268 s vac.

**Trade-off.** The alumina is also the reason solid exhaust is opaque white,
the reason solid nozzles erode as fast as they do, and a significant part of
the plume's radiative heat load. It is a good bargain, not a free one.

**Follow-up:** *"Why not push aluminium loading past 18–20%?"*

---

### 23. What do you do when CEA and measured $c^*$ disagree by 5%? `[M04][M18]`

**Physics.** CEA computes an *ideal* equilibrium $c^*$ for perfectly mixed
propellant at a stated mixture ratio and pressure; the engine delivers
whatever its mixing, residence time and heat loss allow.

**Mechanism.** Work the list in order of prior probability, not in order of
interest. First, is the mixture ratio what you think it is? A flow-meter
calibration error or an unaccounted film-cooling fraction moves MR and moves
CEA's answer. Second, is $A_t$ what you think it is — measured cold, or eroded?
Third, is $p_c$ measured at the station you assumed? Fourth, is the CEA case
set up right: frozen versus equilibrium, correct $p_c$, correct enthalpy of
formation for a real kerosene? Only then start blaming mixing.

**Quantitative hook.** 5% is far too big for injector inefficiency alone in a
developed engine — a well-designed impinging or coaxial injector delivers
95–99% $c^*$. The V-2 managed about 94% with its 18-pot pre-mixing injector
[_verify-liquid, V-2 block], and that was considered poor in 1943. So 5% on
modern hardware says instrumentation or setup, not combustion.

**Trade-off / exception.** The exception is a heavily film-cooled engine. If
10% of your fuel is going down the wall as a curtain, as on the V-2, the core
mixture ratio is not the injected one and CEA at the overall MR will
overpredict. Compute the core MR separately.

**Follow-up:** *"Show me on the data how you would isolate the throat area."*

---

## D. Propellants

### 24. Why does hydrogen provide excellent Isp but poor density? `[M05][M01]` — *seed*

**Physics.** Both properties come from the same fact: the hydrogen molecule is
the lightest thing there is. Low molecular weight is exactly what raises
$\sqrt{T_0/M}$, and low molecular weight at cryogenic temperature is exactly
what gives you a liquid at 71 kg/m³.

**Mechanism.** In the exhaust, hydrogen-rich combustion leaves H₂O plus unburnt
H₂, so mean $M$ lands near 13.8 kg/kmol instead of the 23 you get from
kerosene. In the tank, liquid hydrogen has no polar interactions and boils at
20 K, so it is fourteen times less dense than LOX and it needs vacuum-jacketed
or foam-insulated tankage that a kerosene stage does not.

**Quantitative hook.** LOX/LH2 at MR 6.03 gives a bulk density of 362 kg/m³
and 452.3 s (RS-25); LOX/RP-1 at MR 2.34 gives 1,017 kg/m³ and 311 s (Merlin
1D). Density impulse: 163,800 versus 316,200 kg·s/m³ — kerosene wins by 1.93×
`[EX 16.a–c]` [_verify-liquid, RS-25 and Merlin blocks].

**Trade-off.** So hydrogen wins where the exponential in the rocket equation
dominates — upper stages, long $\Delta v$ — and loses where tank and structure
mass dominate. It also brings boil-off, embrittlement, a very wide flammability
range, and the largest turbopump on the vehicle: the RS-25 HPFTP delivers 53 MW
from a package the size of a car engine [_verify-liquid, RS-25 block]. Almost
nobody flies a pure-hydrogen first stage without solids beside it.

**Follow-up:** *"So is the RS-68's 21.5:1 nozzle a hydrogen decision or a cost
decision?"*

---

### 25. Why did methane displace kerosene for reusable engines? `[M05][M13][M16]`

**Physics.** Methane sits between hydrogen and kerosene on almost every axis,
and the properties it buys — no coking, high cooling capacity, mild
cryogenics — are exactly the ones reuse cares about.

**Mechanism.** Kerosene cracks and deposits carbon on hot coolant-channel walls
(coking), which reduces channel area and raises wall temperature run over run.
Methane does not: it is a single small molecule with no aromatics, so it can be
run to higher wall temperature as a regenerative coolant. It is also
non-toxic, leaves no residue in the chamber to inspect between flights,
and its 111 K boiling point is close enough to LOX's 90 K that both tanks share
a thermal environment.

**Quantitative hook.** Bulk density at MR 3.6 is about 833 kg/m³ `[EX 16.d]` —
82% of kerolox, with 10–20 s more Isp. Every new large engine designed for
reuse since 2010 chose it: Raptor (LOX/subcooled CH₄, MR 3.6), BE-4 (LOX/LNG),
Archimedes, Prometheus [_verify-liquid, respective blocks]. **All of those
performance figures are company claims**, and Raptor's especially — the Raptor
2 thrust numbers trace to an August 2020 Musk post [_verify-liquid, contested
item 4].

**Trade-off.** Methane's density is worse than kerosene's, its tanks are
bigger, and it needs cryogenic ground handling that RP-1 does not. And the
argument is a *reuse* argument: for an expendable booster, kerosene is still
perfectly reasonable, which is why the RD-180 and Merlin remained competitive.

**Follow-up:** *"How much of the coking argument is real, and how much is
that everyone copied SpaceX?"*

---

### 26. Why is RP-1 coking a design constraint, and where does it bite? `[M05][M10][M11]`

**Physics.** Above roughly 700 K the heavier hydrocarbons in RP-1 pyrolyse and
deposit solid carbon on the hot side of the coolant passage — an insulating
layer that makes the problem worse the longer it runs.

**Mechanism.** The deposit has a thermal conductivity two orders of magnitude
below the copper it sits on, so it raises the gas-side wall temperature at
constant heat flux, which raises the fuel-side film temperature, which
accelerates further deposition. It is a positive feedback with a runaway at the
end of it. It also physically reduces the channel cross-section, which raises
pressure drop and reduces coolant flow.

**Quantitative hook.** The practical design limit is a fuel-side wall
temperature ceiling — commonly stated around 600–700 K for RP-1 — and that
ceiling, not the copper's strength, sets your allowable heat flux. It bites
first at the throat, where Bartz flux is highest: 26 MW/m² for a 70 bar kerolox
engine at an 800 K gas-side wall `[EX 57.b]`.

**Trade-off.** The escape routes all cost something. Film cooling on the
gas side reduces the flux but costs Isp. Higher coolant velocity raises the
heat-transfer coefficient but costs pump head. Or you change fuel — which is
half of why methane engines exist. RP-1's own answer historically was to accept
lower chamber pressure: the RS-27A ran 48 bar with a tube-wall chamber and
never had the problem [_verify-liquid, RS-27A block].

**Follow-up:** *"Would you accept RP-1 at 300 bar? What would you have to
change?"*

---

### 27. Why are toxic hypergolic storables still the default on spacecraft? `[M05][M08][M33]`

**Physics.** Hypergols ignite on contact, so a hypergolic engine has no ignition
system at all — and an ignition system is the thing most likely to fail after
five years in orbit.

**Mechanism.** N₂O₄/MMH and N₂O₄/Aerozine 50 are liquid across the whole
spacecraft thermal range, need no cryogenic insulation, do not boil off, and
can be pressure-fed with helium through valves that never have to move more
than once. The failure tree is short: no igniter, no turbopump, no chilldown,
no start transient to sequence.

**Quantitative hook.** The Apollo SPS did every lunar orbit insertion and
trans-Earth injection with no failures, at 314.5 s vacuum, using redundant
series-parallel valve trains and "no igniter, no turbopump, no valve that must
move more than once" [_verify-liquid, SPS block]. The R-4D has been in
production for sixty years and is qualified for 20,000 individual firings and
40,000 s of accumulated burn [_verify-liquid, R-4D block]. Fifty years apart,
the R-4D at 490 N / 312 s and SpaceX's Draco at 400 N / 300 s are essentially
the same engine [_verify-liquid, Draco block].

**Trade-off.** The cost is entirely on the ground: NTO and hydrazines are
carcinogenic, corrosive and lethal, and the handling infrastructure is
enormous. The Shuttle OMS pods were a persistent toxic-handling burden between
flights [_verify-liquid, AJ10-190 block]. That is a launch-site cost, and for a
one-shot spacecraft it is cheaper than an ignition failure.

**Follow-up:** *"What would it take to displace them — green monoprops, or
storable methane?"*

---

### 28. What actually changes when you subcool propellants? `[M05][M12][M33]`

**Physics.** Cooling a cryogen below its boiling point raises its density and
lowers its vapour pressure — the first buys you propellant mass in a fixed
tank, the second buys you pump suction margin.

**Mechanism.** More mass in the same tank is a direct mass-ratio gain with no
structural change. Lower vapour pressure means higher NPSH available for the
same tank pressure, so the pump can run faster or the tank can run at lower
pressure and be lighter. Subcooling also increases the thermal margin before
two-phase flow appears anywhere in the feed system.

**Quantitative hook.** NPSH available is
$(p_{tank} - p_{vap})/(\rho g_0)$ plus static head. For LOX at a 3 bar tank
with 1 bar vapour pressure that is 17.9 m `[EX 65.a]`; drop the vapour pressure
to 0.3 bar by subcooling and the same tank gives 24.1 m. Raptor's propellants
are described as subcooled by design, "integral to the design, not an
operational nicety" [_verify-liquid, Raptor block] — though as with all Raptor
detail, that is a company statement.

**Trade-off.** You pay for it on the ground with chillers and a much tighter
load timeline, because the propellant warms from the moment loading stops. It
also drives the launch scrub logic: a hold long enough to warm the load costs
you performance. The NK-33 shows the other end of the same physics — it
*requires* subcooled LOX for bearing cooling, which constrains ground
operations permanently [_verify-liquid, NK-33 block].

**Follow-up:** *"How much performance does a 30-minute hold cost you?"*

---

### 29. Why is HTP attractive on paper, and why did it lose? `[M05][M08]`

**Physics.** High-test hydrogen peroxide is a storable, non-cryogenic,
non-toxic oxidiser that decomposes exothermically over a catalyst — so it is
its own igniter and its own turbine drive fluid.

**Mechanism.** Pass 85–90% HTP over a silver-plated nickel-gauze pack and you
get 600 °C steam and oxygen with no ignition source. Inject kerosene into that
stream and it lights spontaneously. That single property removes the igniter,
the hypergolic slug, and the separate turbine working fluid all at once.

**Quantitative hook.** Black Arrow's Gamma 8 ran 85% HTP/kerosene at MR 8:1,
47.4 bar, 265 s vacuum, and the family flew **128 engines across 26 launches
with zero failures** [_verify-solid-coldgas... no — _verify-liquid, Gamma
block]. The Rocketdyne AR2-3 used 90% HTP and the aircraft's own JP-4, giving a
pilot a throttle lever on a rocket engine at 245 s [_verify-liquid, AR2-3
block].

**Trade-off.** 250–265 s is the whole problem: it is 40–50 s below LOX/RP-1 and
the mission planner notices. HTP also decomposes in storage, and its
sensitivity to contamination is absolute — any contaminant is a catalyst, so
cleanliness requirements are punishing. The reliability record says the
architecture was sound; the Isp says it could not compete once LOX handling
became routine.

**Follow-up:** *"Would you use it today on a small launcher?"*

---

### 30. Why does the fuel constrain the cooling method more than the reverse? `[M05][M11]`

**Physics.** In a regenerative engine the fuel *is* the coolant, so its
thermophysical properties — heat capacity, thermal conductivity, decomposition
temperature — set the maximum heat flux you can remove before you have chosen
any hardware at all.

**Mechanism.** The wall temperature is fixed by a chain: gas-side flux in,
conduction across the liner, convection into the coolant out. The coolant end
of that chain is bounded by the fuel. Hydrogen has an enormous specific heat
and no decomposition limit worth worrying about, so hydrogen engines can run
206 bar chambers with milled channels. RP-1 cokes above ~700 K. Hypergolic
fuels are poor coolants outright.

**Quantitative hook.** The engines line up exactly along this axis. Hydrogen:
RS-25, 206 bar, 390 milled channels in a NARloy-Z liner. Kerosene: RS-27A,
48 bar, tube wall. Hypergolic: the LR91 uses a regen chamber with an
*ablative* nozzle skirt, and the SPS and LM engines are ablative outright
[_verify-liquid, respective blocks]. The Viking is the exhibit that proves the
rule: SEP could not cool a hypergolic engine with its own fuel, so it carried a
dedicated water tank and water pump and injected water — three coaxial pumps on
one shaft, 2,500 kW at 10,000 rpm [_verify-liquid, Viking block].

**Trade-off.** You can break the constraint by adding film cooling, ablation,
or a third fluid, but each costs Isp, burn time or mass. The Viking bought
cooling with dead mass and got 958 engines across 144 launches with two
failures — a defensible trade, and one nobody has repeated.

**Follow-up:** *"So what limits a methane engine's chamber pressure?"*

---

## E. Combustion chambers

### 31. Why does a chamber need a characteristic length $L^*$? `[M06][M07]`

**Physics.** $L^* = V_c/A_t$ is a residence-time proxy: it says how long the
propellant has to atomise, vaporise, mix and react before it is accelerated out
of the throat.

**Mechanism.** The stay time is
$t_s = V_c \rho_c/\dot m$, and the physical processes it has to accommodate —
droplet breakup, evaporation, turbulent mixing, chemical reaction — each have
their own characteristic time. Whichever is slowest sets your minimum $L^*$.
For a hydrocarbon that is usually droplet evaporation; for hydrogen, which
arrives as a gas, it is mixing.

**Quantitative hook.** An RS-25-class chamber at $L^* = 0.9$ m has
$V_c = 0.051$ m³ and a stay time of 0.94 ms `[EX 31.a–b]`. Typical ranges are
$L^*$ = 0.8–1.0 m for LOX/LH2, 1.0–1.3 m for LOX/RP-1, and up to 2 m for
hypergolics with poor mixing.

**Trade-off.** Too short and you get incomplete combustion — low $c^*$ — plus
unburnt propellant reaching the throat, which erodes it. Too long and you pay
in chamber mass, in wall area to cool (heat load scales with wall area), in
pressure drop, and in an increased risk of low-frequency instability because
the longer stay time changes the phase relationship between injection and heat
release. It is a genuine optimum, not a "bigger is safer" parameter.

**Follow-up:** *"How would you shorten $L^*$ without losing $c^*$?"*

---

### 32. Why does contraction ratio matter if the chamber flow is subsonic? `[M06][M02]`

**Physics.** A finite chamber Mach number means finite stagnation-pressure loss
across the combustion zone and a real dynamic-pressure difference between the
injector face and the throat.

**Mechanism.** Contraction ratio $A_c/A_t$ sets chamber Mach number. Too small
a ratio and the chamber Mach number rises, the Rayleigh loss from heat addition
grows, and injector-face pressure diverges from throat stagnation pressure —
which corrupts every performance number you compute from $p_c$. Too large and
you carry chamber wall and mass you do not need, and the flow near the wall
becomes slow and recirculating, which is bad for wall heat transfer and for
mixing uniformity.

**Quantitative hook.** At $A_c/A_t = 3$, chamber Mach is about 0.20 and
$p_{0,inj}/p_{0,throat}$ is 1.025 — 2.5% [Module 01, WE1]. Typical values run
2 to 4 for large engines and up to 8–10 for small thrusters, where the throat
is tiny and the chamber cannot usefully be made smaller.

**Trade-off / exception.** Small thrusters get high contraction ratios almost
by accident, and that is fine — the losses scale with $M^2$ and are negligible
there. For a large booster chamber, dropping contraction ratio to save mass is
a real temptation and it eats directly into your $c^*$ bookkeeping.

**Follow-up:** *"At what contraction ratio does the correction stop being
negligible?"*

---

### 33. What happens if the chamber is too short for the propellant? `[M06][M07]`

**Physics.** Propellant that has not finished reacting when it reaches the
throat contributes mass flow but not full enthalpy — so $c^*$ falls, and you
have raw propellant in the highest-heat-flux region of the engine.

**Mechanism.** The symptom chain is specific enough to diagnose from data.
$c^*$ efficiency drops. Throat erosion appears where it should not, because
droplets are burning *at* the wall instead of in the core. Exhaust looks wrong.
And because the heat-release distribution has moved downstream, the acoustic
coupling changes — a chamber that was stable can become unstable.

**Quantitative hook.** Droplet lifetime scales as $d_0^2$ under a $D^2$ law, so
halving mean droplet diameter cuts evaporation time by four. This is why the
answer to a short chamber is usually a finer injector rather than a longer
chamber: it is cheaper to make the droplets smaller than to make the chamber
bigger and then cool it.

**Trade-off / exception.** Not always. The V-2 chose the opposite route — a
long, almost spherical chamber with pre-mixing pot injectors — and still only
made about 94% $c^*$ [_verify-liquid, V-2 block]. A short chamber with a good
injector beats a long chamber with a bad one, every time.

**Follow-up:** *"Show me what that looks like on the $p_c$ and thrust
traces."*

---

### 34. Why did Glushko put four chambers on one turbopump? `[M06][M15][M26]`

**Physics.** Acoustic instability frequencies scale inversely with chamber
diameter, and instability amplitude at a given frequency is far easier to
suppress in a small chamber. Four small chambers dodge a problem one big
chamber has to solve.

**Mechanism.** The first tangential mode frequency goes roughly as $a/D$. Make
the chamber smaller and you push the mode up in frequency, where acoustic
damping is stronger and where the combustion response is weaker. You also get
shorter injector-to-wall distances and better mixing per unit volume. The cost
is four sets of everything downstream of the manifold.

**Quantitative hook.** The architecture defines the whole Soviet lineage:
RD-107/108 (four main chambers plus verniers on one turbopump, still flying on
Soyuz in 2026), RD-253 (single chamber), RD-170 (four chambers, 7,250 kN SL,
24.52 MPa), RD-180 (two), RD-191 (one) — a modular family derived by halving
and quartering one chamber design [_verify-liquid, RD-107 and RD-170 blocks].

**Trade-off.** The RD-170 is "enormous, complex, and four chambers where one
would be preferable", and one turbopump failure loses all four chambers
[_verify-liquid, RD-170 block]. The American answer was the opposite bet: the
F-1 solved single-chamber stability at 1.5 million lbf with a baffled injector,
after ~2,000 tests across 210 injector designs [_verify-liquid, F-1 block].
Both worked. One took a decade of testing; the other took a permanent mass
penalty.

**Follow-up:** *"Which bet would you make today?"*

---

### 35. Why can't you scale a small chamber up by ten? `[M06][M15][M10]`

**Physics.** Nothing in the chamber scales with the same exponent. Mass flow
goes as $D^2$, wall area as $D^2$ but with a different constant, acoustic
frequency as $1/D$, heat flux per unit area as $D^{-0.2}$, and injector element
count as $D^2$ while element *size* stays fixed.

**Mechanism.** Three specific things break. Acoustically, the transverse-mode
frequencies drop into the band where the combustion process responds, so a
chamber stable at 100 mm can be violently unstable at 1 m. Thermally, the
per-area flux falls only as $D_t^{-0.2}$ (Bartz), so total heat load grows
almost as $D^2$ while coolant flow grows as $D^2$ too — that part scales, but
the pressure drop through longer channels does not. And in the injector,
scaling a working element means using thousands of them, and manifold
distribution error grows with the number of feeds.

**Quantitative hook.** Bartz gives $h_g \propto D_t^{-0.2}$: tripling throat
diameter from 0.30 to 0.90 m cuts the flux only 20% `[EX 35.a]`. Meanwhile the
first tangential frequency falls by three. The F-1 needed 13 baffle
compartments and 45 ms demonstrated damping to a bomb detonation
[_verify-liquid, F-1 block] — hardware that a 100 mm chamber never needs.

**Trade-off / exception.** Subscale testing is still worth doing; it just
answers different questions. Use it for injector element performance and
$c^*$, not for stability.

**Follow-up:** *"What would you test at subscale and what would you refuse
to?"*

---

## F. Injectors

### 36. Why does an injector need pressure drop? `[M07][M15]` — *seed*

**Physics.** The pressure drop across the injector is what decouples the feed
system from the chamber. Without it, chamber pressure oscillations feed
straight back into the propellant flow and the engine oscillates.

**Mechanism.** Flow through an orifice goes as $\dot m \propto \sqrt{\Delta p}$,
so a chamber pressure perturbation $\delta p_c$ produces a flow perturbation of
relative size $\frac{1}{2}\frac{\delta p_c}{\Delta p}$. Make $\Delta p$ large
and that feedback gain is small. Make it small and the gain approaches one:
the chamber modulates its own propellant supply, and if the delay from
injection to heat release lines up with the chamber's fill time, you get chug.
The drop also sets injection velocity, which drives atomisation — Weber number
goes as $v^2$.

**Quantitative hook.** The classical rule is
$\Delta p/p_c \geq 15\text{–}20\%$ [E]. At $p_c = 100$ bar and 20% drop, a
kerosene orifice at $C_d = 0.75$ injects at 52.7 m/s; at 5% drop it is
26.4 m/s `[EX 36.a–b]` — half the velocity, a quarter of the Weber number, and
much coarser droplets. You lose stability and $c^*$ together.

**Trade-off.** That 20% is paid for by the feed system: on a pump-fed engine it
is pump discharge pressure and turbine power; on a pressure-fed engine it is
tank wall thickness, and it is why the Aestus runs at 11 bar
[_verify-liquid, Aestus block]. Deep-throttling engines have it worst — flow
falls, $\Delta p$ falls as flow squared, and the margin evaporates exactly when
you need it. That is what the variable-area pintle exists to fix.

**Follow-up:** *"So what is the LMDE's $\Delta p/p_c$ at 10% thrust?"*

---

### 37. Why coaxial shear for LOX/LH2 and impinging doublets for kerolox? `[M07][M05]`

**Physics.** The element type is chosen by the *phase* of the propellants at
the injector face. Hydrogen arrives as a low-density gas; kerosene arrives as a
liquid of similar density to LOX.

**Mechanism.** In a hydrogen engine the fuel is warm gas from the regen jacket
at maybe 20–70 kg/m³ against LOX at 1,100. You cannot usefully impinge a gas
jet on a liquid jet — the momentum ratio is hopeless. But you can run the gas
as a high-velocity annulus around a slow LOX post and let the velocity
*difference* shear the liquid core apart. In a kerolox engine both streams are
liquids of comparable density, so direct impingement converts their momentum
into a fan-shaped sheet that breaks into fine droplets, and mixes them at the
same time.

**Quantitative hook.** The J-2 established the archetype: 614 hollow oxidizer
posts with concentric fuel annuli through a porous sintered stainless faceplate
transpiration-cooled with hydrogen; the RS-25 uses 600 coaxial elements
[_verify-liquid, J-2 and RS-25 blocks]. The kerolox lineage runs the other way:
XLR43's F-O-F triplet, the F-1's mixed doublet/triplet "5U(f)" pattern
[_verify-liquid, XLR43 and F-1 blocks].

**Trade-off.** Coaxial elements are stable and forgiving but mix relatively
slowly, so hydrogen chambers are long. Impinging elements mix fast but their
performance is exquisitely sensitive to orifice geometry, and misimpingement
puts a hot streak on the wall. And neither is the whole answer: the Aestus uses
132 coaxial *swirl* elements on a hypergolic engine, which is unusual and worth
knowing about [_verify-liquid, Aestus block].

**Follow-up:** *"What would you use for LOX/methane?"*

---

### 38. How does a pintle throttle 10:1 when a fixed orifice cannot? `[M07][M13]`

**Physics.** A fixed orifice has $\Delta p \propto \dot m^2$, so a 10:1 flow
turndown is a 100:1 pressure-drop turndown — the injector stops working long
before you get there. A variable-area injector moves the *area* instead, and
keeps $\Delta p$ and injection velocity roughly constant.

**Mechanism.** The pintle is a central post with a movable sleeve. One
propellant comes radially out of an annular slot in the post; the other flows
axially down the outside; they meet on a conical impingement surface. Sliding
the sleeve changes the slot height, so flow area tracks flow rate. Momentum
ratio and mixing quality stay roughly constant across the range, which is
exactly what a fixed-orifice injector cannot do.

**Quantitative hook.** The Apollo LM descent engine, TRW, Gerard Elverum's
design: throttleable 10%–60% of 46.7 kN, with chamber pressure going from
110 psia at full thrust to 11 psia at 10% — a 10:1 chamber-pressure turndown
[_verify-liquid, LMDE block]. Isp held 311 s at full thrust and 285 s at 10%.

**Trade-off.** The LMDE also had a **prohibited 60–100% throttle band**, avoided
in operation because of nozzle erosion — the pintle solved the injector problem
and exposed a different one [_verify-liquid, LMDE block]. Pintles are also
single-element, so mixing uniformity depends entirely on one geometry, and
their inherent stability comes partly from that: there is no element-to-element
coupling to drive a tangential mode. SpaceX's Merlin traces directly to this
TRW lineage [_verify-liquid, Merlin block].

**Follow-up:** *"Why is a pintle inherently stable?"*

---

### 39. Why does an injector face have a cooling problem? `[M07][M10]`

**Physics.** The face sits at the upstream end of a 3,600 K chamber, sees
radiation from the flame and recirculating hot gas, and — unlike the chamber
wall — has propellant passing *through* it rather than *along* it.

**Mechanism.** The face is riddled with orifices, so you cannot run a
continuous coolant channel behind it. Between the orifices are lands with no
active cooling and a direct radiative view of the flame. Recirculation zones
between elements can bring hot gas right back onto the face. And if any element
runs oxidizer-rich locally, the face material is attacked chemically as well as
thermally.

**Quantitative hook.** The classic solutions are transpiration and film. The J-2
used a **porous sintered stainless-steel faceplate** so hydrogen bleeds
uniformly through the face itself; the RS-25 inherited the idea
[_verify-liquid, J-2 and RS-25 blocks]. The F-1 went the other way and used a
**copper baffle assembly dividing the face into 13 compartments**, which is
structural, thermal and acoustic hardware in one part [_verify-liquid, F-1
block].

**Trade-off.** Transpiration flow is fuel that does not participate in core
combustion, so it costs $c^*$; porous faceplates are also a manufacturing and
contamination nightmare, since any particulate plugs them permanently.
Baffles cost Isp too — they are wetted area and they disturb the flow field.

**Follow-up:** *"How would you inspect a sintered faceplate between
flights?"*

---

### 40. What happens if the manifolds fill at different rates at start? `[M07][M08]`

**Physics.** During the fill transient the local mixture ratio at each element
is whatever the two manifold pressures make it — not the design value — and it
can pass through the entire range from pure fuel to pure oxidizer.

**Mechanism.** Manifold fill time scales with volume divided by flow, and the
two circuits rarely match: the oxidizer side is usually denser and shorter, the
fuel side often runs through the regen jacket first and is much larger. If
oxidizer arrives first at full flow with only a trickle of fuel, you get an
oxidizer-rich transient — hot, oxidising gas on a copper wall and on the face.
If fuel arrives first you accumulate unburnt propellant in the chamber, and
when it does light you get a pressure spike.

**Quantitative hook.** This is *the* start-transient problem, and every engine
solves it with sequencing rather than symmetry: valve open rates, ignition
timing relative to valve position, and often deliberate lead. The V-2 used a
gravity-fed preliminary stage before turbopump mainstage precisely to get a
controlled low-flow light-off before committing full flow [_verify-liquid, V-2
block].

**Trade-off / exception.** You can shrink manifold volumes to shorten fill
times, but small manifolds have poor distribution — the design rule is a
manifold cross-section large compared with the summed orifice area, or
element-to-element flow varies. So you are trading start transient against
steady-state distribution uniformity.

**Follow-up:** *"Which lead would you choose, and why?"*

---

### 41. Why does element size trade against efficiency and stability oppositely? `[M07][M15]`

**Physics.** Smaller elements atomise better and mix faster — which raises
$c^*$ — but they also shorten the characteristic combustion time, which moves
heat release closer to the injector and increases coupling with high-frequency
acoustic modes.

**Mechanism.** Finer sprays mean smaller droplets, and droplet lifetime goes as
$d^2$. So the heat release concentrates in a shorter axial distance near the
face. That is exactly the region where the pressure antinode of a transverse
acoustic mode sits, so the Rayleigh criterion — heat added in phase with
pressure — becomes easier to satisfy. Coarser elements spread the heat release
out and detune the coupling, at the cost of $c^*$.

**Quantitative hook.** This is why development programmes converge slowly.
Project Go on the F-1 ran about 2,000 tests across 210 injector designs, 15
baffle designs and 14 injector configurations between 1962 and 1964
[_verify-liquid, F-1 block]. That is not incompetence; it is what searching a
two-objective space with opposing gradients looks like.

**Trade-off / exception.** The escape is to decouple the two: get efficiency
from element design, and get stability from damping hardware — baffles,
acoustic cavities — rather than from detuning. That is the RS-25's approach:
600 fine coaxial elements *plus* acoustic-resonator cavities in the injector
face [_verify-liquid, RS-25 block].

**Follow-up:** *"Why did the RD-0120 not need the cavities?"*

---

### 42. When is cavitation in an injector orifice useful? `[M07][M14]`

**Physics.** A fully cavitating orifice chokes: once the vena contracta reaches
vapour pressure, further reduction in downstream pressure does not increase
flow. The injector becomes flow-insensitive to chamber pressure.

**Mechanism.** In normal operation, $\dot m \propto \sqrt{p_{feed} - p_c}$, so
chamber oscillations modulate flow. In a cavitating orifice the flow depends
only on $p_{feed} - p_{vap}$, so the coupling to $p_c$ is broken *completely*.
That is a much stronger decoupling than any finite $\Delta p$ can give, and it
is a genuine stability tool for low-frequency (chug) modes.

**Quantitative hook.** The onset is set by cavitation number
$K = (p_{up} - p_{vap})/(p_{up} - p_{down})$; below about 1.8 for a
sharp-edged orifice, the flow separates at the inlet and cavitates
[Nurick76]. Discharge coefficient drops from ~0.8 to ~0.6 and stops changing.

**Trade-off.** You buy stability with a permanent $C_d$ penalty and with
erosion: collapsing cavities pit the orifice, so geometry drifts over life.
Cavitation is also *partial* over a range of conditions, and partial cavitation
is unstable — the orifice flips between attached and separated, which is worse
than either. So the design has to be firmly on one side or the other, never in
between.

**Follow-up:** *"How would you tell from the data that an orifice is
cavitating?"*

---

## G. Ignition

### 43. Why is a hard start a pressure problem, not a temperature problem? `[M08][M15]`

**Physics.** A hard start is a detonation-like pressure spike from igniting an
accumulated volume of mixed propellant all at once, rather than igniting a
small flow continuously.

**Mechanism.** If ignition is late, propellant keeps flowing into the chamber
unburnt. The chamber fills with a premixed, near-stoichiometric charge. When it
finally lights, the energy release is a constant-volume explosion rather than a
constant-pressure burn — and constant-volume combustion of a stoichiometric
charge gives a pressure ratio of order eight to ten over the initial pressure,
in a chamber designed for steady flow.

**Quantitative hook.** The engineering countermeasures are all about limiting
accumulated mass: ignition *before* main valves reach full flow, a low-flow
preliminary stage, a fuel lead so the accumulation is fuel not oxidiser, and a
hard ignition-detection interlock that shuts the main valves if chamber
pressure has not risen within a set window. The V-2's pyrotechnic igniter,
gravity-fed preliminary stage, then turbopump mainstage is the ancestral
version [_verify-liquid, V-2 block].

**Trade-off / exception.** Hypergols do not remove the problem, they change it —
ignition delay in a hypergolic pair produces exactly the same accumulation, and
that is what killed engines in the early storable programmes. Contaminated or
cold propellant lengthens the delay, which is why hypergolic engines have
propellant temperature limits.

**Follow-up:** *"What ignition-detection signal would you use, and how fast?"*

---

### 44. Why does an ASI beat a pyrotechnic for a restartable engine? `[M08][M13]`

**Physics.** A pyrotechnic cartridge is consumed by use; a spark torch is not.
Restart count is the whole argument.

**Mechanism.** An augmented spark igniter is a small chamber at the centre of
the injector face fed with a trickle of the engine's own propellants and lit by
redundant spark plugs. It produces a hot torch that lights the main chamber.
Because it draws on the main propellants, it can be relit as often as the
spark plugs survive, and it is verifiable before commitment — you can see the
torch light and only then open the main valves.

**Quantitative hook.** The J-2 established it and the RS-25 uses the same idea,
with separate ASIs in each preburner [_verify-liquid, J-2 and RS-25 blocks].
The J-2 restarted in flight for translunar injection, which needed a separate
ambient helium start tank and settling motors. The LE-5 family was qualified
for up to **16 starts** [_verify-solid-coldgas... — _verify-liquid, LE-5
block]. Compare the F-1: a TEA/TEB hypergolic cartridge, one shot, never
restarted [_verify-liquid, F-1 block].

**Trade-off.** The ASI is a small engine with its own valves, its own igniter
circuit, its own propellant taps and its own failure modes, and it must work
in vacuum after hours of cold soak. TEA-TEB is simpler and utterly reliable
per use — Merlin still uses it, carried aboard for MVac restarts — but the
number of restarts is the number of slugs you brought [_verify-liquid, Merlin
block]. Raptor went further and eliminated the main-chamber igniter entirely
from Raptor 2 onward, lighting the main chamber off the preburner torches
[_verify-liquid, Raptor block, company claim].

**Follow-up:** *"How many restarts before TEA-TEB stops making sense?"*

---

### 45. What happens when a hypergolic pair has ignition delay? `[M08][M05]`

**Physics.** Hypergolic ignition delay is a chemical induction time, and during
it propellant accumulates — so delay converts directly into hard-start energy.

**Mechanism.** The delay is the time from first liquid contact to sustained
flame, typically a few milliseconds for NTO/hydrazines. It lengthens with
falling propellant temperature, with contamination, and with poor mixing at the
impingement point. Because injection is continuing throughout, accumulated mass
grows linearly with the delay while the resulting spike grows with the
accumulated mass — a mild nonlinearity that turns a 10 ms delay into a
qualitatively different event from a 3 ms one.

**Quantitative hook.** It is the reason hypergolic spacecraft engines carry
propellant temperature limits and heaters, and the reason ignition delay is a
qualification measurement, not an assumed property. Nothing in the verification
worksheets publishes delay figures for a specific engine, so quote the
mechanism and the temperature dependence rather than a number you cannot
source.

**Trade-off / exception.** The most instructive counter-example is that
hypergolicity does not buy stability. Bell could not solve combustion
instability on the Apollo LM **ascent** engine and had to fly a Rocketdyne
injector in a Bell engine — on the one engine in history with no redundancy and
no abort mode [_verify-liquid, APS block].

**Follow-up:** *"What would you measure in qualification to bound it?"*

---

### 46. Why does oxidizer-lead versus fuel-lead matter so much? `[M08][M07][M16]`

**Physics.** During the lead interval one propellant is present without the
other, and hot oxidiser in contact with a copper or nickel wall is a chemical
attack, not just a thermal load.

**Mechanism.** With an oxidizer lead you get oxygen-rich gas across the
injector face and chamber wall at ignition — which oxidises copper liners,
attacks nickel closeouts, and can ignite the metal itself if the surface is
hot and the oxygen is dense. With a fuel lead you get unburnt fuel
accumulating, a cooler start, and a fuel-rich film on the wall — but a bigger
pressure spike when it lights, and on a hydrogen engine an external
hydrogen cloud.

**Quantitative hook.** The choice is visible from outside. The RS-68 has a
large pre-ignition hydrogen bloom — the "hydrogen burnoff" that scorches the
booster — because it runs a fuel lead and lights the accumulated hydrogen
deliberately [_verify-liquid, RS-68 block]. Almost every hydrogen engine leads
with fuel for exactly this reason.

**Trade-off.** Oxidizer lead is chosen in some hypergolic and oxidizer-rich
systems where fuel accumulation is the greater hazard, and in engines where
the oxidiser circuit is the slow one and matching it is easier than fighting
it. The rule of thumb is: lead with whichever propellant your materials
tolerate. For copper chambers that is fuel, always.

**Follow-up:** *"What sets the length of the lead?"*

---
