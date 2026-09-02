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
