# Whiteboard Problems — Answer Key

Part VI · Companion to
[`whiteboard-problems.md`](whiteboard-problems.md)

Every problem gets the same five sections, in this order:

- **Assumptions a strong candidate states out loud.** Say these *before* the
  first number. In half this set the problem is under-specified on purpose, and
  the assumptions are worth more marks than the arithmetic.
- **Worked solution.** SI, every step, every unit.
- **Sanity check.** Against a real engine from
  [`reference/engine-database.md`](../reference/engine-database.md), with that
  file's caveats carried across intact — company claims stay labelled claims,
  contested figures stay labelled contested, and "not reliably published" is
  never quietly replaced by a guess.
- **What a mediocre answer looks like.** Usually not wrong. Usually just
  stopped early.
- **Follow-up.** The question they ask next. Prepare that one too.

**Numbers.** Every quantitative result was computed with
[`tools/rocket.py`](../tools/rocket.py) and is registered in
[`tools/examples/whiteboard.py`](../tools/examples/whiteboard.py); run
`python3 tools/check_examples.py` to recompute the whole set. Where a step is
one multiplication or a pair of logarithms, the arithmetic is recorded in that
file's docstring rather than as a library entry, and the docstring says so.

**Standing conventions used throughout this key.** $g_0 = 9.80665$ m/s²,
$R_u = 8314.46$ J/(kmol·K). Unless a problem says otherwise:
$\gamma = 1.20$ and $M = 22$ kg/kmol at $T_0 = 3600$ K for LOX/RP-1
($R = 377.93$ J/(kg·K), $c^*_{ideal} = 1798.6$ m/s, delivered at
$\eta_{c^*}=0.96$: **1726.6 m/s**); $\gamma = 1.16$ and $M = 20$ kg/kmol at
$T_0 = 3500$ K for LOX/CH₄ ($c^*_{ideal} = 1882.9$ m/s, delivered 1807.5 m/s);
$\gamma = 1.40$ for GN₂ at 300 K. These are the numbers the problem set told
you to carry.

**Epistemic tags** are as in the course README: [F] fundamental, [E] empirical,
[H] historical, [M] modern practice, [R] research, [A] approximation,
[J] judgment. Citation tags are into
[`reference/sources.md`](../reference/sources.md).

---

# Block A — Thrust, throat, flow

## 1. Thrust from $p_c$, $A_t$, $\varepsilon$ — [M03, M09]

*Chamber pressure 100 bar, throat diameter 250 mm, area ratio 25.*

### Assumptions a strong candidate states out loud

- "You haven't told me the propellant, so I'll assume a hydrocarbon/LOX
  combustion gas: $\gamma = 1.20$, $M = 22$ kg/kmol, $T_0 = 3600$ K." [A]
- "You haven't told me the ambient pressure, so I'll give you both sea level
  and vacuum, and I'll check whether the nozzle even runs attached at sea
  level."
- "I'll carry $\eta_{c^*} = 0.96$ and ideal, frozen, isentropic, fully attached
  expansion for the nozzle." [A]
- "Thrust itself doesn't need $c^*$ — $F = C_F p_c A_t$ — so the propellant
  assumption only bites when you ask me for $I_{sp}$ or mass flow." That
  sentence alone separates candidates.

### Worked solution

$$A_t = \frac{\pi}{4}(0.250\ \mathrm{m})^2 = 0.0490874\ \mathrm{m^2}$$

Thrust coefficients at $\gamma = 1.20$, $\varepsilon = 25$ (`WB.P1a`,
`WB.P1b`):

$$C_{F,vac} = 1.8424, \qquad C_{F,SL} = 1.5891$$

$$F_{vac} = 1.8424 \times 10^{7}\ \mathrm{Pa} \times 0.0490874\ \mathrm{m^2}
= \mathbf{904.4\ kN}$$
$$F_{SL} = 1.5891 \times 10^{7} \times 0.0490874 = \mathbf{780.0\ kN}$$

**Separation check — do this before you trust $C_{F,SL}$.** The supersonic root
at $\varepsilon = 25$ is $M_e = 3.9128$ (`WB.P1c`), giving
$p_0/p_e = 262.86$ (`WB.P1e`) and $p_e = 38.0$ kPa. Schmucker's criterion
gives a separation wall pressure of $31.0$ kPa at that Mach number
(`WB.P1d`) [E] [Schmucker73]. Since $38.0 > 31.0$ kPa the nozzle runs
**attached at sea level**, with about 20 % margin. The sea-level number is
real.

Specific impulse at the delivered $c^*$ of 1726.6 m/s (`WB.P1f`, `WB.P1g`):

$$I_{sp,vac} = \frac{1726.6 \times 1.8424}{9.80665} = \mathbf{324.4\ s},
\qquad I_{sp,SL} = \mathbf{279.8\ s}$$

Mass flow $\dot m = p_c A_t / c^*_{del} = 10^7 \times 0.0490874 / 1726.6 =
\mathbf{284.3\ kg/s}$.

### Sanity check

Merlin 1D (sea-level variant): **845 kN SL / 981 kN vac**, $\varepsilon = 16$,
$I_{sp}$ 282 s SL / 311 s vac, at a **claimed** 97 bar chamber pressure
[engine-database §A.3]. Our hypothetical engine — 100 bar, $\varepsilon = 25$
— lands at 780 kN SL / 904 kN vac with 280 s / 324 s. Same class, slightly
better $I_{sp}$ because of the larger area ratio, slightly less thrust because
its throat is smaller. Everything is where it should be.

**Caveats to say out loud:** Merlin's 97 bar is a SpaceX claim, not
independently verified, and SpaceX does not publish the mixture ratio at all
[engine-database §A.3, §A.3.5]. Do not treat it as a measured figure.

### What a mediocre answer looks like

Writes $F = C_F p_c A_t$, pulls $C_F \approx 2$ from memory, reports "about
1 MN," and never says whether that is vacuum or sea level. Or computes
$C_{F,SL}$ from the isentropic formula and quotes it without ever asking
whether the flow is attached — which is the same error as trap **T6**, just
lucky this time.

### Follow-up

"Now make it a sea-level first-stage engine. Is 25:1 still the right area
ratio, and what changes if I raise $p_c$ to 200 bar?"

---

## 2. Throat area from thrust and $C_F$ — [M03]

*500 kN vacuum, 80 bar chamber.*

### Assumptions a strong candidate states out loud

- "Vacuum $C_F$ depends only on $\gamma$ and $\varepsilon$ — $p_c$ cancels — so
  I need an area ratio, which you haven't given me."
- "I'll do it twice: once with a carried number, $C_{F,vac} \approx 1.80$, and
  once with an honest $\varepsilon = 40$, which is what a 500 kN vacuum engine
  would plausibly have."
- "The answer will barely move, and that's the real point."

### Worked solution

Carried value, $C_{F,vac} = 1.80$ (`WB.P2a`):

$$A_t = \frac{F}{p_c C_F} = \frac{5\times10^{5}}{8\times10^{6} \times 1.80}
= 0.034722\ \mathrm{m^2}
\;\Rightarrow\; D_t = 2\sqrt{A_t/\pi} = \mathbf{210.3\ mm}$$

Honest value at $\gamma = 1.20$, $\varepsilon = 40$: $C_{F,vac} = 1.8843$
(`WB.P2b`), so (`WB.P2c`)

$$A_t = 0.033169\ \mathrm{m^2} \;\Rightarrow\; D_t = \mathbf{205.5\ mm}$$

A 4.7 % error in $C_F$ became a **2.3 % error in diameter**, because
$D \propto A^{1/2}$. Say that. Throat sizing is one of the most forgiving
calculations in the field, which is exactly why an interviewer uses it to see
whether you will commit to an assumption and move.

### Sanity check

LR91-AJ-11 (Titan upper stage): **467 kN vacuum at 59.3 bar**, $\varepsilon =
49.2$, $I_{sp,vac}$ 316 s [engine-database §A.2]. Back-solving its throat at
$C_{F,vac} \approx 1.90$ gives $A_t \approx 0.0414$ m², $D_t \approx 230$ mm.
Our engine makes 7 % more thrust at 35 % higher chamber pressure and gets a
**smaller** throat — 205 mm against 230 mm. That is the right direction and
roughly the right magnitude.

**Caveat:** the LR91's 59.3 bar is flagged `inj`† in the database — the
injector-end station is inferred from the US-convention rule, not stated by a
source [engine-database, "What Pc means"].

### What a mediocre answer looks like

"What's the expansion ratio?" and stops. Or works through $I_{sp}$ and $\dot m$
to get $A_t$, which needs $c^*$ and a mixture ratio you were not given — three
more assumptions for an answer you could have had in one line.

### Follow-up

"What $\varepsilon$ did you assume, and what does your answer become if I tell
you it's a sea-level engine?"

---

## 3. Mass flow and propellant load — [M03, M05]

*90 kN vacuum, 340 s. Flow rate, 400 s of propellant, split into ox and fuel.*

### Assumptions a strong candidate states out loud

- "Mass flow needs no propellant assumption: $\dot m = F/(I_{sp} g_0)$."
- "The **split** does. You haven't given me a mixture ratio, so I'll take
  LOX/RP-1 at MR = 2.3, and I'll tell you what MR = 2.7 and 3.6 do."
- "340 s vacuum on a hydrocarbon means a fairly large area ratio, so this is an
  upper stage or an in-space engine."
- "I'll give you volumes as well as masses, because the tank is what the
  vehicle person actually wants."

### Worked solution

$$\dot m = \frac{F}{I_{sp} g_0} = \frac{9\times10^{4}}{340 \times 9.80665}
= \mathbf{26.99\ kg/s}$$

(registered through the $I_{sp}$ identity, `WB.P3`: $I_{sp} = c/g_0$ with
$c = F/\dot m$ reproduces 340.000 s exactly).

$$m_p = 26.99 \times 400\ \mathrm{s} = \mathbf{10{,}797\ kg}$$

Split at MR $= \dot m_o/\dot m_f = 2.3$: $\dot m_o = \dot m \cdot
\mathrm{MR}/(1+\mathrm{MR}) = 18.81$ kg/s and $\dot m_f = 8.18$ kg/s, so over
400 s

$$m_{ox} = \mathbf{7{,}525\ kg\ LOX}, \qquad m_{fuel} = \mathbf{3{,}272\ kg\ RP\text{-}1}$$

At MR 2.7 it is 7,879 / 2,918 kg; at MR 3.6 (methalox) 8,450 / 2,347 kg.

Volumes, which is the number that sizes the stage: LOX at 1140 kg/m³ →
**6.60 m³**; RP-1 at 810 kg/m³ → **4.04 m³**; total **10.6 m³**. The oxidiser
tank is the big one in every bipropellant vehicle ever built, and a candidate
who says so unprompted is showing systems instinct.

### Sanity check

Apollo SPS (AJ10-137): **91.19 kN vacuum at 314.5 s**, N₂O₄ / Aerozine 50 at
MR 1.6 [engine-database §A.8] — almost exactly our thrust. Its flow is
$91190/(314.5 \times 9.80665) = 29.6$ kg/s against our 27.0 kg/s, the
difference being entirely the 25 s of $I_{sp}$. Good agreement in the class.

**Caveats:** the SPS block in the database is **medium confidence on thrust and
$I_{sp}$ and LOW on chamber pressure, expansion ratio, dry mass and cooling** —
four of its commonly quoted figures are Apollo-era documentation that the
verification pass could not source [engine-database §A.8.1]. Quote its thrust
and $I_{sp}$; do not quote its $\varepsilon$.

### What a mediocre answer looks like

Gives 27 kg/s and 10.8 tonnes and stops at "and you'd split it by mixture
ratio." The split *is* the question — the interviewer put "split it" in the
sentence.

### Follow-up

"Give me the tank volumes. Which one is bigger, and by how much?"

---

## 16. Thrust of a 300-bar methalox engine — [M03, M09]

*300 bar, 130 mm throat, $\varepsilon = 40$. Sea level and vacuum thrust, and
does it run attached on the pad?*

### Assumptions a strong candidate states out loud

- "Methalox, so $\gamma = 1.16$, not 1.20. That matters — it is a 0.6 % change
  in $C_F$ and a larger change in the Mach number at a given area ratio." [A]
- "$M \approx 20$ kg/kmol, $T_0 \approx 3500$ K, $\eta_{c^*} = 0.96$ for the
  $I_{sp}$ part."
- "At 300 bar with $\varepsilon$ only 40, I expect the exit pressure to be high
  and the nozzle to be comfortably attached — but I'll check with a criterion,
  not with a feeling."

### Worked solution

$$A_t = \frac{\pi}{4}(0.130)^2 = 0.0132732\ \mathrm{m^2}$$

At $\gamma = 1.16$, $\varepsilon = 40$ (`WB.P16a`, `WB.P16b`):

$$C_{F,vac} = 1.9294 \Rightarrow F_{vac} = 1.9294 \times 3\times10^{7} \times
0.0132732 = \mathbf{768.3\ kN}$$
$$C_{F,SL} = 1.7943 \Rightarrow F_{SL} = \mathbf{714.5\ kN}$$

**Attached?** $M_e = 4.0191$ (`WB.P16c`), $p_0/p_e = 409.2$ (`WB.P16d`), so

$$p_e = \frac{3\times10^{7}}{409.2} = 73.3\ \mathrm{kPa}$$

Schmucker gives $p_{sep} = 30.4$ kPa at that exit Mach number (`WB.P16e`)
[Schmucker73]. $73.3 \gg 30.4$ kPa: **attached, with a factor of 2.4 of
margin.** It is mildly overexpanded ($p_e/p_a = 0.72$) which is normal and
desirable for a booster nozzle. Summerfield's cruder $p_e \ge 0.4\,p_a$ rule
(40.5 kPa) agrees [SFS54].

$I_{sp}$ at the delivered methalox $c^*$ of 1807.5 m/s (`WB.P16f`, `WB.P16g`):
**355.6 s vacuum, 330.7 s sea level**. Mass flow $= p_c A_t/c^*_{del} =
\mathbf{220.3\ kg/s}$.

### Sanity check

Raptor 2: **2,256 kN SL** at a claimed **300 bar**, $I_{sp,SL}$ 347 s claimed,
$\varepsilon \approx 34.3$ for the sea-level variant [engine-database §A.3].
Our engine is about a third of a Raptor by thrust, at the same chamber
pressure, and comes out 16 s below Raptor's claimed sea-level $I_{sp}$ — which
is what you would expect from a conservative $\eta_{c^*}$ and a
frozen-flow $C_F$.

**Caveats, and say them:** *every* Raptor figure is a SpaceX claim. Thrust,
chamber pressure, $I_{sp}$, dry mass and T/W all originate from company
statements, several of them Musk posts, and **there is no independent
verification of Raptor chamber pressure, $I_{sp}$, dry mass or T/W at all**
[engine-database §A.3.5]. The only independent corroboration is of thrust, and
only indirectly, through FAA licensing and environmental documents and
third-party telemetry analysis (FAA licensing and environmental record, tagged
`FAA-SS` in engine-database Part E).

### What a mediocre answer looks like

Uses $\gamma = 1.20$ because that is the number they memorised, and never
notices that the problem said methalox. Or answers "yes, attached" with no
criterion — right answer, no evidence, no marks.

### Follow-up

"At 300 bar, how far could you take the area ratio before it separates on the
pad?"

---

## 17. Size a sea-level-optimum booster nozzle — [M03, M09]

*1.8 MN sea level, 110 bar, nozzle sized for optimum expansion at sea level.
Throat and exit diameter, then what it does in vacuum.*

### Assumptions a strong candidate states out loud

- "Optimum expansion means $p_e = p_a = 101{,}325$ Pa. That defines
  $\varepsilon$ uniquely once I fix $\gamma$."
- "$\gamma = 1.20$, LOX/RP-1, $\eta_{c^*} = 0.96$."
- "And I should say up front: **nobody actually builds this.** Sea-level-optimum
  is optimum at exactly one altitude, and the stage spends most of its burn
  above it. I'll answer the question you asked, then tell you what a real
  booster does."

### Worked solution

Optimum area ratio for $p_e = p_a$ at $p_c = 1.1\times10^7$ Pa (`WB.P17a`):

$$\varepsilon_{opt} = 12.638$$

$$C_{F,SL} = 1.6542 \ (\text{\texttt{WB.P17b}}) \Rightarrow
A_t = \frac{1.8\times10^{6}}{1.1\times10^{7} \times 1.6542}
= 0.098923\ \mathrm{m^2}$$
$$\boxed{D_t = 354.9\ \mathrm{mm}}$$

$$A_e = 12.638 \times 0.098923 = 1.2502\ \mathrm{m^2}
\Rightarrow \boxed{D_e = 1.262\ \mathrm{m}}$$

In vacuum, $C_{F,vac} = 1.7706$ (`WB.P17d`):

$$F_{vac} = 1.7706 \times 1.1\times10^{7} \times 0.098923 = \mathbf{1.927\ MN}$$

a gain of **7.0 %** over sea level — which is just $\varepsilon A_t p_a =
12.638 \times 0.098923 \times 101325 = 127$ kN, the pressure-thrust term, as it
must be. $I_{sp}$ goes 291.2 s → 311.7 s (`WB.P17e`, `WB.P17f`). Mass flow
**630.2 kg/s**.

**Then the engineering point.** Real boosters overexpand deliberately: you pick
$\varepsilon$ optimum somewhere in the 5–15 km band, accept mild overexpansion
on the pad, and push $\varepsilon$ until a separation criterion says you are
close, then back off with margin [SP-8120], [Schmucker73]. Sea-level-optimum
throws away the whole upper part of the trajectory.

### Sanity check

F-1: $\varepsilon = 16{:}1$ at roughly 70 bar, 6,770 kN SL
[engine-database §A.2]; Merlin 1D: $\varepsilon = 16$ at a claimed 97 bar;
RD-180: $\varepsilon = 36.87$ at 267 bar `noz`†. Every one of them is
*over*expanded on the pad. Our $\varepsilon = 12.6$ at 110 bar is more
conservative than all three, which confirms the premise is wrong rather than
the arithmetic.

**Caveats:** the F-1's ~70 bar chamber pressure is **contested and marked low
confidence** in the database [engine-database §A.2.2]; Merlin's 97 bar is a
claim; the RD-180's 267 bar is a nozzle-stagnation figure and is not directly
comparable to a US injector-end number without saying so.

### What a mediocre answer looks like

Produces $D_t$ and $D_e$ correctly and stops. The interviewer asked "then tell
me what it does in vacuum" precisely to see whether you know the pressure-thrust
term, and the unasked question — "should you build it this way?" — is the one
that separates a Level 2 answer from a Level 3 one.

### Follow-up

"Take it to $\varepsilon = 25$. What's the sea-level thrust now, and does it
still run attached?"

---

## 18. Nine engines, 400 tonnes, how long? — [M03]

*7.6 MN liftoff, $I_{sp,SL}$ 282 s, 400 t of propellant. Burn time, and what
have you ignored?*

### Assumptions a strong candidate states out loud

- "Constant thrust, constant $I_{sp}$, all propellant burned. That gives a
  number in ten seconds, and then I'll spend the rest of the time telling you
  why it is a lower bound."
- "$I_{sp}$ at sea level with 7.6 MN at liftoff — that is a Falcon-9-class
  stage, and I'll sanity-check against it."

### Worked solution

$$\dot m = \frac{F}{I_{sp} g_0} = \frac{7.6\times10^{6}}{282 \times 9.80665}
= \mathbf{2{,}748\ kg/s}$$

(registered as `WB.P18` through the $I_{sp}$ identity.)

$$t = \frac{400{,}000\ \mathrm{kg}}{2748\ \mathrm{kg/s}} = \mathbf{145.6\ s}$$

**What has been ignored — in order of size:**

1. **Throttling.** Real first stages throttle down through max-Q and again near
   the end to hold an acceleration limit. Thirty seconds at 70 % saves about
   0.3 × 30 × 2748 ≈ 25 tonnes, which is roughly **+9 s of burn**.
2. **Thrust and $I_{sp}$ rise with altitude.** At constant chamber pressure
   $\dot m$ is roughly constant while thrust rises by the pressure-thrust term,
   so *this* calculation is not very wrong — but the 282 s is a sea-level
   number applied to a whole trajectory, which is the sloppy part.
3. **Residuals and unusables**: typically 1–2 % of the load never burns.
4. **The burn does not end at depletion.** It ends at a guidance condition
   (MECO), and a recoverable stage deliberately reserves propellant for boostback
   and landing.
5. Start and shutdown transients, ullage settling, autogenous pressurisation
   draw, and boiloff before liftoff.

The honest answer is "about 145 seconds if it burns to depletion at full
thrust, and the real number is 10–20 seconds different for reasons that are all
mission design, not propulsion."

### Sanity check

Falcon 9 stage 1: nine Merlin 1D at 845 kN SL each = **7.6 MN**, $I_{sp,SL}$
**282 s** [engine-database §A.3]. Those are exactly the problem's numbers. Real
Falcon 9 first-stage burns run roughly 155–165 s and end with reserve for the
return. Our 145.6 s sits just below, as a depletion-limited lower bound should.

**Caveat:** SpaceX does not publish the stage propellant load, so the 400 t in
the problem is the problem's number, not a database figure. The database has no
vehicle-level mass table at all — say so rather than inventing one.

### What a mediocre answer looks like

"145.6 seconds." Correct, complete, and worth about half marks, because the
second sentence of the question was "what have you ignored?"

### Follow-up

"You throttle to 70 % for 40 seconds through max-Q. What does that do to your
number?"

---

# Block B — Expansion ratio and altitude

## 4. Two expansion ratios, one first stage — [M09]

*Same chamber, $\varepsilon = 16$ and $\varepsilon = 60$. Sketch thrust against
altitude; where do they cross; which goes on the first stage?*

### Assumptions a strong candidate states out loud

- "Same chamber means same $p_c$, same $A_t$, same $c^*$. I'll take
  $p_c = 100$ bar and $\gamma = 1.20$." [A]
- "Thrust against altitude is a straight line in **ambient pressure**, not in
  altitude: $F = C_{F,vac} p_c A_t - \varepsilon A_t p_a$. Two straight lines
  with different slopes must cross exactly once."
- "I will check the big nozzle for separation before I believe any sea-level
  number it gives me."

### Worked solution

Vacuum coefficients (`WB.P4a`, `WB.P4b`):

$$C_{F,vac}(16) = 1.7971, \qquad C_{F,vac}(60) = 1.9164$$

Sea-level coefficient at $\varepsilon = 16$ (`WB.P4c`): $C_{F,SL} = 1.6350$.

**Where they cross.** Set the two thrusts equal:

$$C_{F,vac}(60) - \varepsilon_{60}\frac{p_a}{p_c} =
C_{F,vac}(16) - \varepsilon_{16}\frac{p_a}{p_c}$$
$$p_{a,BE} = \frac{p_c\left[C_{F,vac}(60)-C_{F,vac}(16)\right]}{60-16}
= \frac{10^{7}(1.9164-1.7971)}{44} = \mathbf{27.1\ kPa}$$

In the US 1976 standard troposphere,
$h = (T_0/L)\left[1-(p_a/p_{SL})^{R_{air}L/g_0}\right]$ with $T_0 = 288.15$ K,
$L = 0.0065$ K/m, $R_{air} = 287.05$ J/(kg·K):

$$\boxed{h_{BE} = 9.84\ \mathrm{km}}$$

**The trap in the problem.** If you evaluate $C_{F,SL}$ at $\varepsilon = 60$
you get 1.3084 (`WB.P4d`) — and it is meaningless. $M_e = 4.5245$
(`WB.P4e`) gives $p_e = 12.5$ kPa against a Schmucker separation pressure of
**27.9 kPa** (`WB.P4f`) [Schmucker73]. The nozzle is separated by more than a
factor of two at sea level, and Summerfield agrees [SFS54]. So the
$\varepsilon = 60$ line is **not valid below about 10 km** — which is
essentially the whole region where the crossing matters. Draw the curve dashed
below the separation altitude and say why.

$I_{sp}$ at the delivered LOX/RP-1 $c^*$ (`WB.P4g`–`WB.P4i`):
$\varepsilon=16$ gives **287.9 s SL / 316.4 s vac**;
$\varepsilon=60$ gives **337.4 s vac**.

**The board sketch.** Two straight lines against $p_a$ (or two curves against
altitude, both rising, both flattening above ~30 km where $p_a \to 0$):
$\varepsilon = 16$ starts higher and rises more gently; $\varepsilon = 60$
starts lower, rises steeply, and crosses at 27 kPa / 9.8 km — except that its
lower portion is dashed because the flow is separated there.

**Which one on the first stage:** $\varepsilon = 16$, unambiguously. Not
because of the crossing altitude, but because the $\varepsilon = 60$ nozzle
cannot be started on the pad without separated, asymmetric, unsteady flow and
the side loads that come with it [OMK05], [Ostlund02].

### Sanity check

F-1: $\varepsilon = 16{:}1$, first stage [engine-database §A.2]. Merlin 1D:
$\varepsilon = 16$ sea level, $\varepsilon = 165$ for the vacuum variant
[§A.3]. RL10B-2: $\varepsilon = 285{:}1$ deployed, upper stage only, and it
carries a **translating** extension so the engine is short enough to handle
[§A.2.7]. Sixteen for a booster and sixty-plus for an upper stage is exactly
what the flight hardware does.

**Caveat:** RL10B-2's expansion ratio is listed in the database as
**contested — 285:1 deployed / 77:1 retracted** [engine-database §A.2.7]; both
numbers are real and describe different configurations of the same nozzle.

### What a mediocre answer looks like

Computes the crossing, notes that $\varepsilon = 60$ wins above 9.8 km, and
recommends it for the first stage "because the stage spends most of its burn
above 10 km." Superficially reasonable, physically impossible — the engine
would have to survive the first ten kilometres, and it would not.

### Follow-up

"What actually happens to the $\varepsilon = 60$ nozzle on the pad, and what
does it do to your gimbal actuators?"

---

## 5. Sea-level test of a $\varepsilon = 150$ upper stage — [M09, M18]

*$\varepsilon = 150$, $p_c = 60$ bar, acceptance testing at sea level. Talk me
through it.*

### Assumptions a strong candidate states out loud

- "$\gamma = 1.20$. The propellant matters for $I_{sp}$ but not for the
  separation question, which is what this problem is about."
- "Acceptance testing means I have to demonstrate something specific — usually
  $c^*$ efficiency, mixture ratio, valve timing, thermal behaviour and no
  hardware damage. It does **not** necessarily mean demonstrating $I_{sp}$."
- "The engine will separate. The question is where, and whether the resulting
  side loads are survivable."

### Worked solution

**Vacuum performance, for reference.** $M_e = 5.1865$ (`WB.P5a`),
$C_{F,vac} = 1.9776$ (`WB.P5b`). On a hydrolox chamber ($c^*_{ideal} \approx
2350$ m/s, delivered ≈ 2256 m/s) that is $I_{sp,vac} \approx 455$ s.

**Where it separates.** The separation station is where the isentropic wall
pressure falls to Schmucker's separation pressure. Solving
$p_{wall}(M) = p_{sep}(M)$ simultaneously gives

$$M_{sep} = 3.7289, \qquad p_{sep} = 32.2\ \mathrm{kPa}\ (\text{\texttt{WB.P5c}}),
\qquad \varepsilon_{sep} = 19.16\ (\text{\texttt{WB.P5d}})$$

So the flow separates at an area ratio of about **19 out of 150** — the nozzle
is doing useful work over 13 % of its area and the remaining 87 % is a
separated, recirculating, unsteady flow field.

Summerfield's cruder criterion ($p_e \ge 0.4\,p_a$, i.e. 40.5 kPa,
`WB.P5e`) puts the station at $M = 3.606$ (`WB.P5f`),
$\varepsilon = 16.03$ (`WB.P5g`). Two independent [E] criteria agree to within
20 % on the area ratio — that agreement is worth stating, because it tells you
the conclusion is robust even though neither correlation is precise.

**What you actually do, in order:**

1. **Do not fire the flight nozzle at ambient.** The side loads from
   asymmetric, wandering separation are the documented cause of nozzle
   structural failures — this is the J-2S / Vulcain / RS-25-class problem
   [OMK05], [Ostlund02], [SP-8120].
2. **Altitude cell or supersonic diffuser.** A steam-ejector diffuser pulls the
   cell down far enough to keep the nozzle full-flowing. This is the standard
   answer and it costs a lot of steam.
3. **Test with a truncated nozzle.** Fire the chamber with a short
   ($\varepsilon \approx 15$–20) test nozzle, measure $c^*$, $\dot m$, mixture
   ratio, wall temperatures and stability, and get $I_{sp}$ analytically by
   applying the measured $\eta_{c^*}$ to the computed $C_F$ of the flight
   nozzle. You are measuring the chamber, and computing the nozzle.
4. **Verify the flight nozzle separately** by geometry (CMM), by proof and
   leak test, and by analysis — not by hot fire.
5. **If you must fire the flight nozzle ambient**, brace the extension, keep
   the run short, instrument for side load, and accept that you are doing a
   structural test, not a performance test.

**What acceptance can and cannot conclude.** From a sea-level firing with a
truncated nozzle you get $c^*$ efficiency, mixture ratio, start and shutdown
transients, thermal margins and stability — which is most of what acceptance is
for. You do not get delivered $I_{sp}$, and you should not claim it.

### Sanity check

Vinci: $\varepsilon = 240$, deployable extension, 60 bar, 180 kN, 457.2 s
[engine-database §A.4]. RL10B-2: $\varepsilon = 285$ deployed / 77 retracted,
with a 2.5 m carbon-carbon extension that translates into place after stage
separation [§A.2.7], and the carbon-carbon nozzle-extension test literature
tagged `RL10B2-CC` in engine-database Part E. Both are precisely our problem — a very large
area ratio that cannot exist at sea level — and both solve it with a nozzle
that is physically shorter on the ground. Meanwhile the RS-25 has
$\varepsilon = 69$ **because** it starts at sea level [§A.2.3].

**Caveats:** RL10B-2's chamber pressure is **not published** by manufacturer or
Wikipedia, and the Astronautix ~44 bar figure is flagged low confidence and
"do not print" [engine-database §A.2]. RS-25's expansion ratio is contested
(69 vs 77.5 vs 78) — see trap **T1**.

### What a mediocre answer looks like

Computes $C_{F,vac} = 1.978$, quotes the vacuum thrust, and never mentions
separation, side loads, diffusers or truncated nozzles. Or says "it'll
separate" without a criterion, a station or a plan.

### Follow-up

"The altitude cell is booked for six months. What can you still learn from an
ambient firing, and what would you refuse to sign?"

---

## 19. Is 80:1 worth it over 40:1? — [M09, M33]

*Marketing wants $\varepsilon$ from 40 to 80 on a vacuum engine. What does it
buy and what does it cost?*

### Assumptions a strong candidate states out loud

- "Vacuum engine, so $C_F$ is the vacuum value and $p_c$ cancels — the $I_{sp}$
  gain is a function of $\gamma$ and $\varepsilon$ only."
- "$\gamma = 1.20$, LOX/RP-1 at a delivered $c^*$ of 1726.6 m/s, and I'll reuse
  the 500 kN / 80 bar throat from earlier so the diameters are concrete."
- "The cost is mass, length, testability and — if you go extendible — a
  mechanism. I'll quantify the first and name the rest."

### Worked solution

$$C_{F,vac}(40) = 1.8843, \qquad C_{F,vac}(80) = 1.9371\ (\text{\texttt{WB.P19a}})$$

a gain of **2.80 %**. In $I_{sp}$ (`WB.P19b`, `WB.P19c`):

$$331.75\ \mathrm{s} \;\rightarrow\; 341.06\ \mathrm{s},
\qquad \Delta I_{sp} = \mathbf{+9.31\ s\ (+2.81\ \%)}$$

**The cost, in geometry.** With $A_t = 0.033169$ m²:

| $\varepsilon$ | $A_e$ (m²) | $D_e$ (m) |
|---|---|---|
| 40 | 1.3268 | **1.300** |
| 80 | 2.6535 | **1.838** |

Exit **area doubles**, exit **diameter grows 41 %**, and the nozzle skirt is
the piece that grows. Nozzle mass scales roughly with wetted area, so expect
the nozzle to roughly double — and on a vacuum engine the nozzle is already the
dominant mass item.

**Is +9.3 s worth it?** Convert to $\Delta v$: for a stage with mass ratio
$R = 3.4$,

$$\Delta(\Delta v) = g_0\,\Delta I_{sp}\ \ln R = 9.80665 \times 9.31 \times
1.223 = \mathbf{112\ m/s}$$

Then weigh that against the inert-mass penalty, which on a Vinci-class engine
would be several hundred kilograms. On a long-burn upper stage with room in the
interstage, +112 m/s usually wins. On a stage that is length-limited by the
fairing or the pad, it usually does not. [J]

**What else it costs, and marketing will not have thought of any of it:**
stage and interstage **length**; the loss of the ability to do a sea-level
acceptance firing at all (problem 5); gimbal envelope and actuator loads;
a plume that now impinges on the interstage during separation; and — if you
solve the length problem with a deployable extension — a single-shot mechanism
in the critical path of the mission.

### Sanity check

RL10B-2 bought its $\varepsilon = 285$ with a 2.5 m translating carbon-carbon
extension (NOVOLTEX®/SEPCARB® 3D C–C), worth **~30 s** of $I_{sp}$, reaching
**465.5 s — the highest $I_{sp}$ of any flown chemical rocket engine**
[engine-database §A.2] (extension testing tagged `RL10B2-CC` in Part E).
Vinci does the same at $\varepsilon = 240$
for 457.2 s, and its nozzle is **~70 % of engine mass** (~550 kg total, 160 kg
excluding the nozzle) [§A.4]. That 70 % figure is the single best answer to
"what does it cost."

**Caveats:** RL10B-2's $\varepsilon$ is contested (285 deployed / 77 retracted)
[§A.2.7], and its chamber pressure is not reliably published.

### What a mediocre answer looks like

"+9 seconds, obviously worth it." Or, worse, computes the $I_{sp}$ gain from a
$C_F$ ratio at *sea level*, where the answer is negative.

### Follow-up

"Marketing doesn't care about seconds. Tell me what it does to payload."

---

# Block C — Heat transfer and cooling

## 6. Throat heat flux, order of magnitude — [M10]

*LOX/RP-1, 100 bar, 200 mm throat. Order of magnitude is fine — but tell me how
confident you are.*

### Assumptions a strong candidate states out loud

State the whole property recipe out loud, because every one of these is a
guess and the interviewer wants to see that you know it:

- $\gamma = 1.20$, $M = 22$ kg/kmol → $R = 377.93$ J/(kg·K) (`WB.P6a`),
  $T_0 = 3600$ K. [A]
- $c_{p0} = \gamma R/(\gamma-1) = 2267.6$ J/(kg·K);
  $Pr_0 = 4\gamma/(9\gamma-5) = 0.8276$ (the Eucken-type estimate) [E].
- $\mu_0 = 1.0\times10^{-4}$ Pa·s — a *class* estimate for combustion gas, good
  to maybe a factor of 1.5. [A]
- Throat radius of curvature $r_c = 1.5\,r_t = 0.150$ m. [J]
- Gas-side wall temperature $T_{wg} = 800$ K — assumed, because it is an
  *output* of the cooling design, not an input. [A]
- $\eta_{c^*} = 0.96$, so $c^*_{del} = 1726.6$ m/s (`WB.P6b` gives the ideal
  1798.6 m/s).
- "And Bartz is a 1957 correlation that is ±20–30 % at the throat on a good
  day." [E] [Bartz57]

### Worked solution

Bartz property-variation factor at $M = 1$, $T_{wg}/T_0 = 0.2222$
(`WB.P6c`): $\sigma = 1.3651$.

$$h_g = \frac{0.026}{D_t^{0.2}}
\left(\frac{\mu_0^{0.2} c_{p0}}{Pr_0^{0.6}}\right)
\left(\frac{p_c}{c^*}\right)^{0.8}
\left(\frac{D_t}{r_c}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

With $D_t = 0.200$ m, $A/A_t = 1$ at the throat (`WB.P6d`):

$$h_g = \mathbf{2.08\times10^{4}\ W/(m^2\,K)}$$

Adiabatic wall temperature with recovery factor $r = 0.9$ (`WB.P6e`):

$$T_{aw} = 3567.3\ \mathrm{K}$$

$$q = h_g (T_{aw} - T_{wg}) = 20{,}774 \times (3567.3 - 800)
= \mathbf{5.75\times10^{7}\ W/m^2}$$

**Say it as "about 6 × 10⁷ W/m², call it 50–60 MW/m², and I would not defend
the third digit."**

**Confidence, itemised** — this is the part the question is really asking for:

| source of error | effect on $q$ |
|---|---|
| Bartz correlation itself | **±20–30 %** [Bartz57] |
| $\mu_0$ wrong by 1.5× | $\mu^{0.2}$ → ±8 % |
| $T_{wg}$ 600 K vs 1000 K | ∓ ~7 % on $(T_{aw}-T_{wg})$, plus $\sigma$ |
| $T_0$ from CEA vs assumed 3600 K | ±5 % on $T_0$ → ~±5 % on $q$ |
| $r_c$ assumption | weak, $(D_t/r_c)^{0.1}$ |

Overall: **a factor of about 1.4 either way.** A cooling circuit designed to
57.5 MW/m² with no margin is a cooling circuit designed to fail — which is trap
**T9**.

### Sanity check

The course's carried number is "tens of MW/m² for a regen hydrocarbon engine at
100 bar; RS-25 throat ≈ 100–160 MW/m²." Running the identical recipe on RS-25
geometry ($D_t = 269.25$ mm, hydrolox $c_{p0}$ and $Pr_0$, $p_c = 206.4$ bar,
$c^* = 2287$ m/s) gives $h_g = 4.93\times10^{4}$ W/(m²·K) (`WB.P20c`) — which
against a hydrolox $T_{aw}$ lands in that 100–160 MW/m² band. The method
reproduces the one case we can check.

**Caveat:** the RS-25's 206.4 bar is the 109 % FPL figure; at 100 % RPL it is
~189 bar, and the ~189 figure is itself scaled and medium confidence
[engine-database §A.2].

### What a mediocre answer looks like

Quotes "about 80 MW/m²" from memory with no method — which might even be right,
and is worth nothing. Or runs Bartz correctly and reports **57.489 MW/m²**, six
significant figures on a correlation with 30 % scatter. The second is worse,
because it shows the candidate does not know what the number is made of.

### Follow-up

"Put a number on the temperature drop across a 1 mm liner at $k = 300$
W/(m·K)." — $\Delta T = qt/k = 5.75\times10^{7}\times0.001/300 =
\mathbf{192\ K}$. Then: "and what does that do to your thermal stress?"

---

## 20. Double the chamber pressure — [M10, M11]

*Same engine, $p_c$ 100 → 200 bar at the same thrust. What happens to throat
heat flux, and to the regen circuit?*

### Assumptions a strong candidate states out loud

- "Same propellants, same $c^*$, same $T_0$, same $T_{wg}$ assumption, so the
  only thing moving in Bartz is $p_c$ — and, because you said *same thrust*,
  the throat diameter."
- "Bartz gives $h_g \propto p_c^{0.8} D_t^{-0.2}$. At constant thrust,
  $A_t \propto 1/p_c$, so $D_t$ falls by $\sqrt2$."
- "I'll give you the constant-$D_t$ answer first because it is the clean
  scaling, then correct it."

### Worked solution

**Constant throat diameter (the clean scaling).** At $D_t = 200$ mm,
$p_c = 2\times10^{7}$ Pa (`WB.P20a`, `WB.P20b`):

$$h_g: 2.08\times10^{4} \rightarrow 3.62\times10^{4}\ \mathrm{W/(m^2 K)}
\qquad (\times 1.741 = 2^{0.8})$$
$$q: 57.5 \rightarrow \mathbf{100.1\ MW/m^2} \qquad (\times 1.741)$$

**At constant thrust**, the throat also shrinks: $D_t \to 141.4$ mm, and
$D_t^{-0.2}$ adds another $2^{0.1} = 1.072$:

$$q \approx 57.5 \times 2^{0.9} = \mathbf{107\ MW/m^2}$$

Say which one you are quoting. The difference is small; the discipline is not.

**What happens to the regen circuit — five consequences, in order of pain:**

1. **The wall gets hotter unless $h_c$ rises with $h_g$.** The film drop is
   $\Delta T_{film} = q/h_c$. To hold $T_{wg}$ you need $h_c$ up by 1.74×.
   Dittus–Boelter gives $h_c \propto v^{0.8}$, so coolant velocity must rise by
   $1.74^{1/0.8} = 2.09\times$ — and the jacket pressure drop goes as $v^2$,
   i.e. **×4.4**. In a 100-bar-class engine the jacket $\Delta p$ is already the
   largest single pressure loss in the machine. This is the real constraint.
2. **Bulk temperature rise barely changes.** Total heat load ≈ flux × area:
   flux ×1.74, chamber area ×~0.5, so $Q$ is roughly constant; $\dot m$ is
   unchanged at the same thrust and $I_{sp}$; so $\Delta T_{bulk}$ is roughly
   unchanged. The problem is *local*, not integrated. Candidates who only
   compute bulk rise miss the entire failure mode.
3. **RP-1 coking.** The coolant *film* temperature, not the bulk temperature,
   sets coking. RP-1 deposits carbon above roughly 500–600 K film temperature
   [E]; at 100+ MW/m² you may not be able to cool with RP-1 at all without
   film cooling. Methane and hydrogen do not coke the same way — which is a
   propellant argument arriving inside a heat-transfer question.
4. **Pump work doubles.** $P = \dot m \Delta p/(\rho\eta)$ with $\Delta p$
   doubled, plus the extra jacket loss. That is a turbine, a turbine inlet
   temperature and a cycle decision.
5. **Liner life falls.** $\Delta T$ through the wall doubles, so thermal strain
   per cycle doubles, and low-cycle fatigue life falls faster than linearly.
   For a reusable engine this, not the steady-state temperature, is the
   limit [SP-8087], [GRCop].

### Sanity check

RS-25 runs 206 bar with a **NARloy-Z liner containing 390 milled channels**,
cooled by hydrogen, and sits in the 100–160 MW/m² throat-flux band
[engine-database §A.2], [Biggs89]. Raptor claims 300 bar with methane
[§A.3, claim]. And the counter-example that answers the question directly:
**BE-4 deliberately runs at 140 bar**, which is low for an ORSC engine, and
Blue Origin states this is a **life-and-reusability choice, not a limitation**
[§A.3]. The industry's reusability-driven engines moved *away* from maximum
chamber pressure.

**Caveats:** Raptor's 300 bar is an unverified company claim [§A.3.5]; BE-4's
140 bar is listed `n.s.` — the station is not stated — and the whole BE-4 row
is medium confidence [§A.3].

### What a mediocre answer looks like

"$q \propto p_c^{0.8}$, so it goes up 74 %." True, and it is one sentence out of
the six the question wants. The interviewer said "and what happens to the
regenerative cooling circuit" — that is where the marks are.

### Follow-up

"Your programme director says fine, we'll add film cooling. What does that cost
you, and where does it show up in the data?"

---

## 15. Regen channel sanity check — [M11, M10]

*200 rectangular channels, 1.5 mm × 3 mm, carrying all 50 kg/s of RP-1,
$p_c = 100$ bar, $D_t = 200$ mm. Is that a sane channel?*

### Assumptions a strong candidate states out loud

- "RP-1 at $\rho = 810$ kg/m³, $\mu = 1.5\times10^{-3}$ Pa·s, $c_p = 2000$
  J/(kg·K), $k = 0.14$ W/(m·K) — jacket-inlet-ish properties." [A]
- "I'll check four things: velocity, Reynolds number, **pressure drop**, and
  the coolant-side film temperature drop. Any one of them can kill a channel
  design."
- "Darcy friction factor $f = 0.02$ for a smooth turbulent duct, and I'll take
  a 1 m flow length as a stand-in for one pass." [A]
- "Throat flux from problem 6 is ~50–60 MW/m²; I'll use 40 MW/m² as a
  chamber-average band value so I'm not double-counting the peak."

### Worked solution

**Geometry.**
$A_1 = 1.5\times10^{-3}\times3.0\times10^{-3} = 4.5\times10^{-6}$ m²;
200 channels → $A_{tot} = 9.0\times10^{-4}$ m².
Hydraulic diameter $D_h = 2wh/(w+h) = \mathbf{2.0\ mm}$.
Channel pitch at the throat: $\pi\times0.2/200 = 3.14$ mm, so the land between
channels is 1.6 mm — **that part is fine**, and saying so shows you checked.

**Velocity.**
$$v = \frac{\dot m}{\rho A_{tot}} = \frac{50}{810\times9.0\times10^{-4}}
= \mathbf{68.6\ m/s}$$

High. Regen channels run 20–80 m/s [E], so this is at the top of the band but
not by itself disqualifying.

**Reynolds number** (`WB.P15a`):
$Re = \rho v D_h/\mu = 7.41\times10^{4}$ — solidly turbulent, correlations
apply.

**Pressure drop — this is where it dies.**
$$\Delta p = f\frac{L}{D_h}\frac{\rho v^2}{2}
= 0.02 \times \frac{1.0}{0.002} \times \frac{810\times68.59^2}{2}
= 1.91\times10^{7}\ \mathrm{Pa} = \mathbf{190.5\ bar}$$

**Nearly twice the chamber pressure**, for one metre of channel, before you add
bends, manifolds, the injector $\Delta p$ (another ~20 bar) and the throat
curvature loss. The pump would have to deliver well over 300 bar to run a
100-bar chamber. **The channel is not sane.**

**And it fails thermally too, independently.** Dittus–Boelter with
$Pr = \mu c_p/k = 21.4$ (`WB.P15d`):

$$h_c = 0.023\frac{k}{D_h}Re^{0.8}Pr^{0.4}
= 4.31\times10^{4}\ \mathrm{W/(m^2 K)}$$
$$\Delta T_{film} = \frac{q}{h_c} = \frac{4\times10^{7}}{4.31\times10^{4}}
= \mathbf{927\ K}$$

RP-1 cokes above roughly 500–600 K film temperature [E]. A 927 K film drop on
top of a bulk temperature of 350–450 K puts the wetted wall far into the coking
regime, which will then choke the channel and make everything worse.

**What *is* fine.** Bulk temperature rise is not the problem. The throat band
alone ($\pi\times0.2\times0.05 = 0.0314$ m² at 40 MW/m² = 1.26 MW) gives
$\Delta T_{bulk} = 12.6$ K (`WB.P15b`), and a whole-jacket load of order 15 MW
gives 150 K (`WB.P15c`) — a lot, and right at the RP-1 bulk limit, but not the
first thing to fail.

**How to fix it.** Keep the pitch, increase the *depth*: high-aspect-ratio
channels add flow area without adding circumferential room. Going 1.5 mm ×
6 mm doubles the area, halves the velocity to 34.3 m/s, raises $D_h$ to
2.4 mm, and drops $\Delta p$ to about **40 bar** — still large, but now in the
region where a real engine lives. Splitting into up-pass and down-pass halves
the length per pass again. That is what the flight hardware does.

### Sanity check

RS-25's main combustion chamber liner has **390 milled channels**, hydrogen
cooled, with an electroformed-nickel closeout [engine-database §A.2]; the F-1
used **178 brazed tubes** in an up-pass/down-pass arrangement on a much larger
throat [§A.2], [F1-R3896]. Two hundred channels on a 200 mm throat is not
absurd as a *count*; it is the aspect ratio and the single long pass that are
wrong.

**Caveat:** neither the RS-25 nor the F-1 channel dimensions are in the
database, so the comparison is on architecture and channel count only, not on
$\Delta p$.

### What a mediocre answer looks like

Computes 68.6 m/s, says "that's a reasonable coolant velocity," and stops. The
velocity is the *least* diagnostic of the four numbers. Pressure drop is what
makes a channel design impossible, and it is the one nobody computes under
time pressure.

### Follow-up

"Fix it. Give me a channel count and aspect ratio, and tell me what your fix
does to the wall temperature."

---

# Block D — Propellant and cycle choice

## 7. Propellants for a lunar descent stage — [M05, M32]

*LOX/LH2, LOX/CH4, or NTO/MMH. Argue it.*

### Assumptions a strong candidate states out loud

- "First I need the mission: how long between launch and descent? Crewed or
  not? Is there an ascent stage using the same propellant? Is there a reuse or
  ISRU requirement? I'll assume a multi-day coast, crewed, single descent."
- "The figure of merit for a landing stage is **not** $I_{sp}$ alone. It is
  $\Delta v$ per unit of *stage* mass, which means density impulse
  $\rho_{bulk} I_{sp}$ matters, and so does the tank and insulation mass that
  $I_{sp}$ alone hides."
- "The hard requirements are deep throttling for the landing, restart, and
  storability across the coast."

### Worked solution

Density impulse, $\rho_{bulk} I_{sp}$ (`WB.P7a`–`WB.P7d`, in kg·s/m³):

| combination | $\rho_{bulk}$ (kg/m³) | $I_{sp,vac}$ (s) | $\rho I_{sp}$ |
|---|---|---|---|
| LOX/LH2 | 360 | 450 | **162,000** |
| LOX/CH4 | 830 | 360 | **298,800** |
| LOX/RP-1 (reference) | 1030 | 340 | **350,200** |
| NTO/MMH | 1180 | 330 | **389,400** |

LOX/LH2 has the best $I_{sp}$ by 90 s and the **worst density impulse by a
factor of 2.4**. For a lander — a stage that is volume- and
height-constrained, that must sit on legs, that must survive a coast — that is
decisive.

**The three-way argument:**

- **LOX/LH2.** +90 s of $I_{sp}$, and it is the wrong answer anyway. Hydrogen
  boils off; a multi-day coast needs active or heavy passive thermal control,
  and the tank is 2.4× the volume for the same impulse. Deep throttling of a
  hydrolox engine is possible (RL10 family) but not to 10:1. The insulation and
  tank mass eat the $I_{sp}$ advantage on a small stage. **Reject** unless the
  coast is hours, not days, and the stage is large.
- **NTO/MMH (or NTO/A-50).** Storable indefinitely, hypergolic so **no igniter
  and no ignition sequence to fail on the fifth restart**, pressure-feedable so
  no turbomachinery, best density impulse, and the deepest-throttling flight
  heritage in existence. Costs 120 s of $I_{sp}$ against hydrolox and brings
  toxicity, ground handling and crew-safety burdens. **This is the Apollo
  answer and it is still defensible.**
- **LOX/CH4.** Between the two on both axes: +30 s over hypergols, 2.3× the
  density impulse of hydrolox, non-toxic, space-storable with modest
  insulation (methane's boiling point is much closer to LOX's than RP-1's
  handling is to either), restartable with spark ignition, and **ISRU-relevant**
  if the architecture ever wants to make propellant on the Moon or Mars. Costs
  cryogenic ground handling and a restart system that must work cold.

**Recommendation [J].** For a single Apollo-class descent with a short coast:
**NTO/MMH** — the throttle and restart heritage, the pressure-fed simplicity
and the density impulse win, and the $I_{sp}$ deficit is small on a stage whose
$\Delta v$ is ~2 km/s. For a modern reusable or ISRU-forward architecture with
multiple landings: **LOX/CH4**, accepting the cryogenic complexity to get the
$I_{sp}$, the non-toxicity and the commonality with the rest of the
architecture.

### Sanity check

The LMDE (Apollo Lunar Module descent engine): **N₂O₄ / Aerozine 50, 46.7 kN
max, throttleable 4.67–30.36 kN (10–60 %), $I_{sp}$ 311 s at full thrust and
285 s at 10 %, pressure-fed with supercritical helium, variable-area pintle
injector** [engine-database §A.8], [Dressler00]. Chamber pressure turns down
10:1, from 7.6 bar to 0.76 bar — the single best illustration in the whole
database of what deep throttling demands of an injector. Confidence **A**; it
is one of the best-documented blocks in the file.

**The caveat everyone omits, so say it:** the LMDE's **60–100 % throttle band
was prohibited in operation** because of nozzle erosion. The engine ran at full
thrust or inside the throttle band, never between. A "10:1 throttleable engine"
was in practice an engine with a forbidden region — which is exactly the kind of
detail that separates a candidate who has read the source from one who has read
a summary.

### What a mediocre answer looks like

"LH2 has the highest $I_{sp}$, so LOX/LH2." Ranks propellants by a single
number and never mentions boiloff, tank volume, throttling, restart or the
coast duration.

### Follow-up

"You picked hypergols. Now the stage sits in a lunar halo orbit for six months
before descent. Does that change your answer?" (It strengthens it — storables
have no boiloff at all — but now the question is seal and valve life, and
propellant migration past check valves; see the SuperDraco NTO check-valve
incident, [engine-database §A.3.9].)

---

## 21. RP-1 or methane for a reusable booster — [M05, M32]

### Assumptions a strong candidate states out loud

- "Reusable means the discriminator is *what the engine looks like after the
  flight*, not $I_{sp}$."
- "I'll assume many flights with minimal inspection is the goal — if it's
  'recovered and overhauled', the answer changes."
- "Density impulse from the same table as problem 7."

### Worked solution

$\rho I_{sp}$: LOX/RP-1 **350,200** vs LOX/CH4 **298,800** kg·s/m³
(`WB.P7b`, `WB.P7c`). RP-1 wins tank volume by **17 %**. Methane wins $I_{sp}$
by roughly 15–20 s.

Then the reuse arguments, which dominate:

| axis | LOX/RP-1 | LOX/CH4 |
|---|---|---|
| **Coking** | RP-1 deposits carbon in the cooling jacket and injector; heat transfer and mixture distribution drift flight to flight | negligible — **the single biggest reuse discriminator** |
| Soot | sooty GG and turbine, sooty chamber; inspection burden | clean |
| Density / stage length | 17 % better; shorter, lighter stage to fly back and land | worse |
| Ground handling | ambient liquid, trivially simple | cryogenic, but boiling point near LOX's, so common bulkheads and shared thermal design get easier |
| Pressurisation | needs helium or a separate system | **autogenous** — tap warm methane, no helium |
| $I_{sp}$ | −15 to −20 s | + |
| ORSC compatibility | ox-rich kerosene chemistry is brutal; needs the enamel-coating technology | cleaner ox-rich environment |
| ISRU | no | yes |

**Recommendation [J]: LOX/CH4** for a booster designed for many flights with
minimal turnaround. Coking is the reason, not $I_{sp}$. Choose **LOX/RP-1** if
the vehicle is recovered but overhauled between flights, if stage length or
pad volume is the binding constraint, or if the programme cannot absorb
cryogenic fuel ground infrastructure.

### Sanity check

The strongest evidence is convergence among independent teams: **Raptor**
(methalox, FFSC), **BE-4** (methalox, ORSC), **Archimedes** (methalox, ORSC),
**Prometheus** (methalox, GG) — four organisations, four different power
cycles, one propellant, all of them targeting reuse
[engine-database §A.3, §A.4]. Meanwhile Falcon 9 demonstrates that LOX/RP-1
reuse absolutely works — 369 Rutherford engines flown, and Merlin boosters
reflown many times — but with overhaul between flights.

**Caveats, and they matter here:** Raptor, BE-4, Archimedes and Prometheus
figures are **company claims**; Archimedes and Prometheus have **never flown**;
BE-4 first flew 2024-01-08 and its thrust rating changed in 2025
[§A.3.4]. Rocket Lab's claimed ~95 % electric-pump efficiency compares
electrical-to-hydraulic efficiency against thermodynamic cycle efficiency and
should not be repeated uncritically [§A.3.7]. The convergence on methane is
evidence about *engineering judgment*, not about verified performance.

### What a mediocre answer looks like

Compares $I_{sp}$, notes methane is 20 s better, picks methane, done. Right
answer, wrong reason — and the interviewer will find out with one follow-up.

### Follow-up

"You picked methane. The customer needs the stage to fit an existing 3.7 m
diameter and an existing pad. Does the 17 % volume penalty kill you?"

---

## 11. Cycle for a restartable hydrolox upper stage — [M13]

*100 kN, three restarts over six hours, best $I_{sp}$ you can give me.*

### Assumptions a strong candidate states out loud

- "100 kN is small enough that the expander heat balance closes. That is the
  key fact — above roughly 250–300 kN a closed expander runs out of wall area."
- "Six hours means the real problem is not the cycle, it is **thermal
  management and settling** over the coast."
- "Best $I_{sp}$ with no dumped flow means closed expander or staged
  combustion, and staged combustion is absurd at this size."

### Worked solution

**Answer: closed expander cycle.**

The argument:

1. **Nothing is dumped.** GG and expander-bleed cycles overboard 1–4 % of the
   flow at a fraction of main-chamber $I_{sp}$. A closed expander sends all of
   it through the nozzle. On a stage where $I_{sp}$ is the whole point, that is
   the first-order reason.
2. **The thrust ceiling is not binding at 100 kN.** Expander power comes from
   heat picked up in the jacket, which scales with chamber wall area ($\propto
   D^2$), while thrust scales with throat area. Above a few hundred kN the heat
   available cannot drive the pumps, which is why the biggest closed expander
   ever flown is Vinci at 180 kN [engine-database §A.4]. At 100 kN there is
   margin.
3. **Restart is easy and benign.** No preburner, no gas generator, no
   pyrotechnic or hypergolic start cartridge to expend per start, no hot
   turbine gas to re-establish. The cooling circuit *is* the power cycle, so
   bootstrap is a chilldown-and-tank-head problem, not a combustion-sequencing
   problem.
4. **Turbine environment is warm hydrogen, not combustion gas** — a few hundred
   kelvin instead of 800–1000 K. That is why expander engines have the longest
   demonstrated lives and the most restarts in the fleet.

**What the six hours actually costs you, and this is the part that earns the
job:** hydrogen boiloff and tank pressure control over six hours; ullage
settling before each restart; pump and line chilldown before each start (you
cannot start a pump on two-phase hydrogen); and the energy source for the
restarts. Those need an auxiliary system, and the auxiliary system is often
harder than the engine.

**Alternatives, and why they lose:** expander *bleed* (LE-5B, BE-3U) removes
the thrust ceiling by dumping the turbine flow — buy it only if you need more
than ~250 kN. Gas generator costs ~2–3 % of flow, roughly 8–10 s of $I_{sp}$,
and adds a GG that must relight three times. Fuel-rich staged combustion
(RS-25, RD-0120) gets you the $I_{sp}$ but at absurd complexity for 100 kN, and
you do not need 200 bar to make 100 kN.

### Sanity check

**RL10C-1: 101.8 kN vacuum, 449.7 s, closed expander** [engine-database §A.2],
(L3Harris datasheet, tagged `L3H` in engine-database Part E). That is the
requirement, at the requirement's thrust, with the
requirement's $I_{sp}$, flying since 2014. **Vinci** answers the restart half
directly: 180 kN, 457.2 s, $\varepsilon$ 240, **up to 900 s burn and up to 3
restarts**, with an **auxiliary propulsion unit using a 3D-printed gas
generator** to heat propellant, repressurise the tanks and provide settling and
orbital-adjust thrust [§A.4] (EUCASS 2019-481, tagged in engine-database
Part E). The APU is arguably more novel
than the engine, and it exists precisely because of the six-hours-and-three-
restarts problem.

**Caveats:** RL10C-1's chamber pressure is **not published by the manufacturer
— do not guess**; its thrust is quoted as 101.8 kN by L3Harris and 101.5 kN by
Wikipedia [§A.2.8]. Vinci's $I_{sp}$ and restart count are high confidence, but
some sources say 4+ restarts against the fetched figure of 3.

### What a mediocre answer looks like

"Staged combustion, it has the best $I_{sp}$." Ignores that staged combustion
has no meaning at 100 kN, that the RL10 has beaten it on $I_{sp}$ for sixty
years, and that the question's hard requirement was restarts.

### Follow-up

"What chamber pressure do you expect, and why isn't it 200 bar?" (Expander heat
balance caps it: RL10A-3-3A runs 32.8 bar, Vinci 60 bar, and the *reason* is
that heat input scales as $D^2$ while thrust scales as $A_t$
[engine-database §A.2].)

---

## 26. Cycle for a hundred-flight methalox booster — [M13, M16, M36]

*2.5 MN sea level, 100 flights between overhauls. GG, ORSC, or FFSC?*

### Assumptions a strong candidate states out loud

- "'A hundred flights between overhauls' is a *life* requirement, so I will
  answer on life first and performance second."
- "I'll quantify the GG penalty rather than hand-waving it."
- "And I'll say up front that the cycle is probably not the biggest lever on
  life. Derating is."

### Worked solution

**The GG penalty, quantified.** A gas generator dumps roughly 2–4 % of total
flow at perhaps 40 % of main-chamber $I_{sp}$. At 4 %:

$$\text{penalty} = 0.04\,(1 - 0.40) = 2.4\ \% \;\Rightarrow\;
\mathbf{8.4\ s}\ \text{on a 350 s vacuum engine}$$

For a **booster**, 8 s of vacuum $I_{sp}$ is worth much less than it would be
on an upper stage — most of the booster's impulse is delivered low and its
$\Delta v$ contribution is modest. So the GG's performance penalty is not
disqualifying by itself.

**The three cycles on the life axis:**

| | GG | ORSC | FFSC |
|---|---|---|---|
| dumped flow | 2–4 % | none | none |
| $p_c$ ceiling | low–moderate | high | highest |
| turbine gas | fuel-rich, sooty with kerosene, **much cleaner with methane** | **ox-rich at high pressure — attacks every metal it touches** | both, each on its own shaft |
| interpropellant seal | yes (one shaft) | yes | **no — each turbine sees its own propellant** |
| turbine inlet temperature for a given power | high (low flow) | high | **lowest — full flow means high mass flow, low ΔT** |
| part count / development risk | lowest | high | highest; flown once, ever |

**Recommendation [J]: full-flow staged combustion if you can afford the
development; oxidiser-rich staged combustion if you cannot; gas generator if
the schedule is the binding constraint and you will accept the 8 s.**

The life argument for FFSC is real and specific: (a) both turbines run at full
propellant flow, so for a given shaft power the temperature rise across each
turbine is small — cooler turbines last longer; (b) the **interpropellant seal
between turbine and pump is eliminated on both shafts**, and that dynamic seal
is one of the classic life-limiting and failure-prone items in a rocket
turbopump [SP-8107], [SP-8101].

**The honest counterargument, and say it before they do.** The biggest lever on
100-flight life is **not the cycle — it is derating**, plus inspectability. A
derated ORSC or even a derated GG engine may reach 100 flights sooner and more
cheaply than a maximum-performance FFSC engine, because life is driven by
low-cycle fatigue in the liner, bearing and seal wear, and turbine creep, all
of which respond directly to running below the design point.

**Supporting design choices, whichever cycle wins:** GRCop-42 liner with
printed high-aspect-ratio channels (problem 27); **hydrostatic rather than
rolling-element bearings**; integrated printed manifolds to remove joints and
welds; borescope ports and health-monitoring instrumentation designed in, not
added later.

### Sanity check

- **BE-4**: methalox **ORSC**, 2,460 kN SL as specified, **140 bar**,
  **hydrostatic bearings — a life-driven choice for reuse**, head-pressure
  start with no start cartridge, first flight 2024-01-08 [engine-database §A.3].
  That is our problem's thrust class and propellant, with reuse as the stated
  design driver.
- **Raptor**: methalox **FFSC**, the **first full-flow staged combustion engine
  ever flown** — a genuine first that does not depend on any contested number
  [§A.3.6].
- **Archimedes**: methalox **ORSC**, and Rocket Lab states it is
  **deliberately derated, running well below its structural capability to
  extend life between reflights** [§A.3]. That is the derating argument, made
  by a company that had to make the decision.
- The only engine in the database with a genuinely demonstrated hundred-mission
  life is the **AJ10-190 Shuttle OMS: reusable for 100 missions, 1,000 starts,
  15 hours cumulative burn** — at 8.6 bar, pressure-fed, 26.7 kN
  [§A.8]. Two orders of magnitude away in chamber pressure. Worth saying, to
  make the point that 100-flight life is easy at low pressure and very hard at
  high pressure.

**Caveats:** BE-4's thrust rating changed between the original 2,460 kN
specification and a 2,847 kN claim in November 2025, and it is not clear which
vehicles fly which [§A.3.4]. **There is no public life data for Raptor, BE-4 or
Archimedes at all.** Every claim in this comparison about reuse life is a
company statement.

### What a mediocre answer looks like

"FFSC, because Raptor." Names the fashionable cycle without the seal argument,
the turbine-temperature argument, or the derating counterargument — and without
noticing that FFSC has flown exactly once in the history of the field.

### Follow-up

"Name the three parts you would inspect between flights, how, and what you
would look for."

---

## 27. Chamber liner material at 300 bar — [M16, M11, M17]

*Reusable methalox at 300 bar: GRCop-42, NARloy-Z, or Inconel 718.*

### Assumptions a strong candidate states out loud

- "At 300 bar the throat flux is 100+ MW/m² by the problem-20 scaling. That
  number decides the material before anything else does."
- "The liner's job is to move that flux into the coolant with a survivable
  $\Delta T$, thousands of times."
- "I'll compare on thermal conductivity first, then on temperature capability,
  then on manufacturability, and I'll say what would change my mind."

### Worked solution

Wall $\Delta T = qt/k$ through a 1 mm liner at $q = 100$ MW/m²:

| material | $k$ (W/(m·K)) [E] | $\Delta T$ across 1 mm | verdict |
|---|---|---|---|
| **Inconel 718** | ≈ 11 | **9,090 K** | absurd — not a liner material at any sane thickness |
| **NARloy-Z** (Cu–Ag–Zr) | ≈ 310 | **323 K** | workable; flight-proven |
| **GRCop-42** (Cu–Cr–Nb) | ≈ 290–320 | **~330 K** | workable, and better at temperature |

**Inconel 718** is eliminated on one line of arithmetic. It is the right
material for the *jacket*, manifolds, injector body, turbine housings and
structural hardware, where strength, weldability and printability matter and
flux does not. It is never the hot wall of a 300-bar chamber.

**NARloy-Z vs GRCop-42** is the real trade:

- NARloy-Z has the flight heritage — it is the RS-25 main combustion chamber
  liner, with 390 milled channels and an electroformed-nickel closeout
  [engine-database §A.2] — and a mature, certified property database.
- GRCop-42 is a **dispersion-strengthened Cu–Cr–Nb** alloy: slightly lower
  conductivity, but it retains strength and creep resistance to substantially
  higher temperature, resists blanching, and has markedly better low-cycle
  fatigue life at temperature [GRCop].
- **The decisive difference is manufacturing.** GRCop-42 is the variant
  developed to be printable by laser powder-bed fusion, so the channels,
  manifolds and closeout can be printed as one part rather than milled and
  brazed or electroformed. That collapses part count, lead time and joint
  count, and it lets you use high-aspect-ratio channels — which is exactly what
  problem 15 said you need at high flux [Gradl18], [GradlAM], [RAMPT].

**Choose GRCop-42.** [M] For a **reusable** engine the driver is low-cycle
fatigue life at temperature, and GRCop's whole reason for existing is to beat
NARloy-Z on that axis while staying printable.

**What would change my mind — say four:**

1. **If the engine were expendable and low-rate**, NARloy-Z's flight heritage
   and certified allowables would win; GRCop-42's property data is still
   consolidating, whereas GRCop-84 is the well-documented baseline [GRCop].
2. **If the real throat flux turned out to be 40 MW/m² rather than 100** —
   because the design carries substantial film cooling — the conductivity
   requirement relaxes ($\Delta T$ falls to ~185 K in NARloy-Z), and the choice
   becomes about cost and manufacturability rather than heat.
3. **If oxygen-rich gas can ever contact the liner** (an ORSC main-injector
   fault, or an ox-rich streak of the kind in problem 8), copper alloys are
   badly exposed and a coated nickel superalloy or a thermal-barrier coating
   enters the trade. The RD-180's answer to ox-rich survival was **an inert
   enamel coating on every metal surface in contact with the hot oxygen-rich
   gas** — the single technology that made ORSC survivable and that the West
   could not simply copy [engine-database §A.6].
4. **If I need certified allowables for a crewed vehicle next year**, the
   maturity gap decides it regardless of the physics.

### Sanity check

RS-25: **NARloy-Z liner, 390 milled channels, electroformed nickel closeout, at
206 bar with hydrogen coolant** [engine-database §A.2, L3Harris datasheet],
[Biggs89].
Modern NASA additive-manufacturing chambers use GRCop-42/84 [Gradl18], [RAMPT].
Raptor is described only as "regen, methane-cooled milled channels" — **the
liner material is not published** [§A.3]; do not claim it uses GRCop.

**Caveat:** the conductivity values above are class figures for the alloy
families [E], not database entries; the engine database does not tabulate
material properties. Quote them as approximate and be ready to say so.

### What a mediocre answer looks like

"GRCop-42, it's what NASA uses now." Correct conclusion, zero evidence, and no
conductivity number — so no way to know whether the candidate could handle a
material that is *not* on the fashionable list.

### Follow-up

"Give me the liner thickness you'd design to, and tell me what sets it."
(Two competing limits: thinner reduces $\Delta T$ and thermal strain, thicker
resists the pressure differential between coolant and chamber and gives
erosion/blanching margin. Real liners land around 0.7–1.5 mm.)

---

# Block E — Injector diagnosis

## 8. Six scorch streaks and a burn-through — [M07, M10, M34]

*20-second hot fire. Six axial scorch streaks, evenly spaced around the
circumference. One has burned through the liner.*

### Assumptions a strong candidate states out loud

- "Six, evenly spaced, axial, and one worse than the others. **The periodicity
  is the diagnosis.** Something on the injector or in the coolant manifold
  comes in sixes."
- "Streaking is a wall-compatibility failure, not a combustion-instability
  failure. Those are different investigations with different fixes."
- "I'll want the injector drawing, the flow-bench data and the coolant-circuit
  layout before I commit."

### Worked solution

**Mechanism → symptom → evidence → fix.**

**Mechanism.** Locally oxidiser-rich gas is reaching the wall. Mixture ratio
maldistribution at the outer element row raises the local adiabatic wall
temperature *and* the local gas-side coefficient; where the fuel-film-cooling
curtain is thin or absent, $q$ goes up by a large factor over the design value,
the wall runs hot, and eventually the liner fails. This is the classic
"streaking" mode of SP-8089 [SP-8089].

**Why six.** Count the features on the injector that come in sixes:

- **six baffle compartments** (a baffled injector divides the face; the blades
  leave wakes and disturb the outer-row spray pattern) [SP-8113];
- **six fuel manifold inlets or six film-coolant feed ports**, so the coolant
  curtain has six thin sectors between feeds;
- **six element groups or spray fans** on an impinging pattern;
- six coolant-jacket inlet or crossover ports, giving six low-flow sectors on
  the coolant side rather than the gas side.

Six-fold symmetry is never random. It is a manifold, a fixture, or a baffle
count.

**Symptom.** Axial streaks beginning near the injector face and widening
downstream (the deposit and discolouration track the hot gas streak). The
burn-through will be at the streak with the worst combination of hot-gas
loading and coolant supply — typically where a hot streak happens to line up
with a coolant-side low-flow sector.

**Evidence to demand, in order:**

1. **The injector drawing and the coolant manifold drawing.** Do either have
   six of anything? This is a five-minute question that resolves most of the
   ambiguity.
2. **Injector water flow-bench data, element by element** — was the outer row
   uniform, and was the film-coolant split what the drawing says?
3. **Borescope the coolant channels** at the burn-through and at a healthy
   streak. Blocked or under-fed channels give a coolant-side story instead.
4. **Wall thermocouple map** and any post-test hardness or metallurgical
   section through the failure.
5. **Orientation.** Was the engine horizontal on the stand? Gravity-driven
   pooling of film coolant changes the picture and is a test-stand artefact,
   not a flight problem.

**Ruling things out.** Coolant-channel blockage alone would follow the *channel*
spacing (hundreds of channels), not six. Combustion instability would show in
the dynamic pressure data, would not be steady over 20 s, and would not produce
a stationary six-fold pattern. Manufacturing scatter would be random.

**Fix, cheapest first:** re-cant or re-orient the outer-row elements so their
spray does not impinge on the wall; rebalance or add film-cooling orifices to
close the six thin sectors; run the outer row deliberately fuel-rich; if the
cause is baffle-blade wakes, change the blade count or profile. Re-test with
wall thermocouples at all six clock positions before you believe the fix.

### Sanity check

The F-1 injector was a flat-face mixed doublet/triplet with a **copper baffle
assembly dividing the face into 13 compartments** [engine-database §A.2],
[F1-R3896] — a design driven by exactly this family of problems, and the
canonical example of the fact that injector face architecture, wall
compatibility and stability are one problem, not three. The J-2 used a
**porous sintered stainless faceplate transpiration-cooled with hydrogen**
[§A.2], which is a different answer to the same question.

**Caveat:** neither is a documented streak-burn-through case in the database;
they are cited for the architecture, not as precedent for this failure.

### What a mediocre answer looks like

"Combustion instability." Wrong category — instability is a dynamic-pressure
phenomenon and would not paint six stationary stripes over 20 seconds. Or
"injector problem" without ever explaining what the number six is doing in the
question.

### Follow-up

"The flow bench says every element is within 2 % and the coolant channels are
clear. Now what?" (Look at the *gas-side* geometry: baffle wakes, chamber
contraction ratio, the recirculation zone near the face, and whether the film
coolant is being stripped rather than mis-fed.)

---

## 22. A 120 Hz oscillation at 60 % throttle — [M07, M15]

*15 % peak-to-peak on chamber pressure, only at 60 % throttle. Clean at 100 %
and clean at 40 %.*

### Assumptions a strong candidate states out loud

- "First I want to know whether 120 Hz is an acoustic mode of the chamber or a
  feed-system mode. That is one calculation and it decides the entire
  investigation."
- "$\gamma = 1.20$, $M = 22$, $T_0 = 3600$ K for the chamber sound speed;
  chamber diameter of order 300 mm and length of order 0.5 m." [A]

### Worked solution

**Step 1 — is it acoustic?** Chamber speed of sound (`WB.P22`):

$$a = \sqrt{\gamma R T_0} = \sqrt{1.20 \times 377.93 \times 3600}
= \mathbf{1278\ m/s}$$

First tangential mode of a 300 mm chamber:
$f_{1T} = 1.841\,a/(\pi D) = \mathbf{2.50\ kHz}$.
First longitudinal of a 0.5 m chamber: $f_{1L} = a/2L = \mathbf{1.28\ kHz}$.

**120 Hz is ten to twenty times below the lowest chamber acoustic mode.** It is
not a combustion-acoustic instability. Meanwhile a 3 m propellant feed line at
a liquid sound speed of ~1300 m/s has a quarter-wave resonance at
$c/4L = \mathbf{108\ Hz}$ — the right neighbourhood.

**Diagnosis: chug** — low-frequency instability from coupling between the
injector pressure drop, the feed-line dynamics and the combustion time lag
[SP-194], [SP-8089], [Casiano10].

**Step 2 — why only at 60 %?** Injector stiffness is the ratio
$\Delta p_{inj}/p_c$. Through an orifice at fixed area,
$\Delta p \propto \dot m^2$, while $p_c \propto \dot m$. So

$$\frac{\Delta p_{inj}}{p_c} \propto \dot m$$

At 60 % flow the stiffness is **0.6×** its full-thrust value. If the design was
a healthy 0.20 at 100 %, it is **0.12 at 60 %** — right at the ~0.10 threshold
below which chug is expected. That single scaling explains the whole symptom
and is the number to put on the board.

Why clean at 40 %? Several plausible reasons, and you should offer them as
hypotheses to test rather than as an answer: the combustion time lag shifts
with pressure and mixture ratio, so the gain–phase condition is satisfied only
in a band; a cavitating venturi or a regulator may begin choking and decoupling
the feed at low flow; and the feed-line acoustic length changes if a component
saturates. Chug has a *band*, not a threshold.

**Step 3 — what you do, in order:**

1. **Look at the data before touching hardware.** Plot injector manifold
   pressure (ox and fuel separately) and pump discharge alongside $p_c$ at
   120 Hz, and get the **phase**. In-phase manifold and chamber oscillation
   confirms feed coupling; chamber-only says look again at acoustics.
2. **Compute $\Delta p_{inj}/p_c$ at each throttle point** from measured
   manifold and chamber pressures. If it dips near 0.10 at 60 %, you are done
   diagnosing.
3. **Fixes, cheapest first:** cavitating venturis upstream of the injector to
   decouple the feed from the chamber (the classic and usually sufficient fix);
   raise low-throttle injection $\Delta p$ — which is exactly what a
   variable-area pintle does by construction; a tuned accumulator or
   quarter-wave stub near 120 Hz in the feed line; shorten or stiffen the line.
4. **Do not reach for baffles or acoustic cavities.** Those address
   high-frequency chamber acoustics — 1–5 kHz — and will do precisely nothing
   to a 120 Hz feed-system mode, while costing you performance and cooling
   [SP-8113].
5. If nothing works in schedule, restrict the throttle band — and say so
   explicitly in the engine's operating limits.

### Sanity check

The **LMDE** solved deep throttling with Elverum's **variable-area pintle**,
which moves a sleeve to change injection area with flow so injection velocity
and $\Delta p$ stay roughly constant across a **10:1** turndown
[engine-database §A.8], [Dressler00]. That is the structural answer to
"stiffness falls with throttle." Merlin 1D — a pintle, tracing its lineage
directly to the LMDE — throttles **40–100 %** on the sea-level engine and
39–100 % on MVac [§A.3]. RD-191 throttles **27–105 %**, exceptionally wide for
staged combustion [§A.6].

**Caveat, and it is a good one:** the LMDE's **60–100 % band was prohibited in
operation** for a completely different reason — nozzle erosion, not stability
[§A.8]. Real engines carry throttle-band restrictions, and the reason is not
always the one you expect.

### What a mediocre answer looks like

"Combustion instability — add baffles." Two errors in four words: it is not
combustion instability in the acoustic sense, and baffles are the wrong tool by
an order of magnitude in frequency.

### Follow-up

"The manifold pressures are flat at 120 Hz and only $p_c$ oscillates. Now what?"
(Then it is not classic chug. Look at a chamber bulk mode, at a
combustion-response phenomenon, at the coolant circuit feeding the injector,
or — check this first — at the pressure transducer and its sense line.)

---

## 23. $c^*$ down 3 %, mixture ratio shifted, face eroded — [M07, M18]

*Between test 4 and test 5, identical valve positions and tank pressures.
$\eta_{c^*}$ 0.96 → 0.93; measured MR 2.30 → 2.10; injector face shows erosion
around the central elements.*

### Assumptions a strong candidate states out loud

- "Identical valve positions and tank pressures means the **hardware** changed,
  not the command. Something is passing more fuel or less oxidiser than it did."
- "Before I blame hardware I will eliminate instrumentation, because a 9 % MR
  shift is exactly the size of a flowmeter calibration drift and it is the
  cheapest hypothesis to kill."
- "I need to know whether the MR shift alone can explain the $c^*$ drop. If it
  cannot, there are two things going on."

### Worked solution

**Step 1 — the flow split.** MR 2.30 → 2.10 at roughly constant total flow:

$$\frac{\dot m_f}{\dot m} = \frac{1}{1+\mathrm{MR}}: \quad
0.3030 \rightarrow 0.3226 \quad (\mathbf{+6.5\ \%\ fuel})$$
$$\frac{\dot m_o}{\dot m} = \frac{\mathrm{MR}}{1+\mathrm{MR}}: \quad
0.6970 \rightarrow 0.6774 \quad (\mathbf{-2.8\ \%\ oxidiser})$$

Fuel went **up** at fixed feed pressure. That points at **enlarged fuel
orifices** — which is consistent with erosion of the central elements, if the
central elements are fuel-carrying (on most coax and many impinging designs
they are, or they carry the igniter's fuel).

**Step 2 — can the MR shift alone explain the 3 % $c^*$ drop?** No, and this
decomposition is the answer.

For LOX/RP-1, $c^*$ peaks near MR 2.3–2.5 and the curve is **flat near the
peak** — that is the whole reason engines are tuned there. Moving 2.30 → 2.10
walks a short way down a shallow slope: **on the order of 0.5–1 % of ideal
$c^*$**, not 3.1 % (the drop from 0.96 to 0.93 is
$(0.93-0.96)/0.96 = -3.1\ \%$). [A]

So **at most a third** of the loss is mixture ratio. The remaining ~2 % is
**mixing and atomisation degradation**: the eroded elements no longer produce
the designed impingement geometry, spray fan, or momentum ratio, so
propellants that used to mix in the first few centimetres now do not. That is a
$\eta_{c^*}$ loss by definition [SP-8089], [Rupe65].

**Step 3 — the story, stated as a causal chain.**

> Something damaged the central elements during or before test 4. The damage
> enlarged fuel-side flow area, so at unchanged feed pressure the engine drew
> more fuel and the mixture ratio fell. Independently, the damaged elements mix
> worse, so combustion efficiency fell by more than the mixture-ratio shift can
> account for. The two effects are separable and both point at the same
> hardware.

**Step 4 — what damaged the centre? Candidate mechanisms, and how to
discriminate:**

| hypothesis | discriminating evidence |
|---|---|
| **Igniter/ASI torch impingement** — the torch sits at the face centre on many designs and can scrub the surrounding elements | ASI flow and timing record; did it stay lit past mainstage? Erosion pattern radially symmetric about the torch? |
| **Shutdown blowback** — hot gas driven back into a fuel orifice as chamber pressure decays faster than the manifold | test-4 shutdown traces: $p_c$ decay rate vs valve closure sequence; any reverse $\Delta p$ across the injector |
| **Hard start on test 4** — a pressure spike that damaged the face | test-4 start transient: $p_c$ overshoot, ignition delay |
| **Local O/F maldistribution** from a central-manifold flow imbalance | injector flow-bench, element by element, before and after |
| **Instrumentation drift**, not hardware at all | pre- and post-test flowmeter calibration; does $p_c$ agree with $\dot m\,c^*/A_t$? |

**Step 5 — the closure check nobody does.** $p_c = \dot m c^*/A_t$. You have
measured $p_c$, $\dot m$ and $A_t$. Compute $c^*$ from them and compare against
the reported $\eta_{c^*}$. If the three do not close, the problem is
measurement, not combustion — and you have just saved the programme a hardware
teardown.

### Sanity check

Face erosion and streaking are the two canonical injector-hardware failures of
[SP-8089], and every major engine carries a face-protection provision: the J-2's
**porous sintered faceplate transpiration-cooled with hydrogen**, the RS-25's
ASI at the face centre with **acoustic-resonator cavities** in the face
[engine-database §A.2].

**Caveat:** the database does not record any specific test-to-test $c^*$
regression case, so this comparison is architectural, not precedent. Say so
rather than inventing a program history.

### What a mediocre answer looks like

"The injector eroded." True, visible in the photograph, and not an analysis.
The question is *what fraction of the $c^*$ loss the mixture-ratio shift
explains* — and whether the instruments can be trusted at all.

### Follow-up

"Test 6 with a brand-new injector gives $\eta_{c^*} = 0.96$ again, but the
mixture ratio reads 2.20. Are you happy?" (No — 2.20 is not 2.30 either, so
either the new injector differs from the drawing, or the flowmeters really have
drifted, and you now have the controlled experiment to tell which.)

---

# Block F — Cold gas

## 9. Cold-gas tank for a 6U CubeSat — [M28, M29, M31]

*12 kg, 25 m/s of $\Delta v$. Size me a system.*

### Assumptions a strong candidate states out loud

- "You haven't given me the propellant, the storage pressure or the blowdown
  range, so I'll pick all three and defend them."
- "GN₂ first because it's the default, then I'll show you why the answer is
  probably a liquefiable refrigerant."
- "$T_0 = 300$ K, $\varepsilon = 50$, and a delivered/ideal efficiency of
  **0.90** — that ~0.90 factor is the one physically interesting number in
  cold-gas performance [engine-database §C.1.3]."
- "$m_{final} = 12$ kg — I'm treating 12 kg as the dry mass, which is slightly
  conservative."

### Worked solution

**Option A — GN₂ at 250 bar.**

$R = R_u/28.014 = 296.80$ J/(kg·K) (`WB.P9a`). Ideal vacuum $I_{sp}$ at
$\gamma = 1.40$, $\varepsilon = 50$, $T_0 = 300$ K (`WB.P9b`):

$$I_{sp,ideal} = 76.84\ \mathrm{s} \;\Rightarrow\;
I_{sp,del} = 0.90 \times 76.84 = \mathbf{69.16\ s}$$

Propellant for 25 m/s on 12 kg final mass (`WB.P9c`):

$$m_p = m_f\left(e^{\Delta v/(I_{sp}g_0)} - 1\right) = \mathbf{0.451\ kg\ usable}$$

Blowdown from 250 bar to 50 bar, isothermal, gives a usable fraction of
$1 - p_f/p_i = 0.80$ (`WB.P9d`), so the **loaded** mass is

$$m_{load} = 0.451/0.80 = \mathbf{0.563\ kg}$$

Tank volume at 250 bar, 293 K, ideal gas (`WB.P9e` confirms the round trip):

$$V = \frac{mRT}{p} = \mathbf{1.96\ L}$$

A 6U CubeSat is about 6 L of internal volume. **A third of the spacecraft is
now a 250-bar COPV**, plus a regulator or a high-pressure latch valve, plus
range-safety paperwork for a high-pressure vessel. It closes, but only just.

**Option B — R-236fa (a liquefiable refrigerant), self-pressurising.**

$R = 8314.46/152.04 = 54.69$ J/(kg·K), $\gamma \approx 1.08$; ideal $I_{sp}$ at
$\varepsilon = 50$, 293 K (`WB.P9f`) is **42.74 s**, delivered
$0.90 \times 42.74 = \mathbf{38.46\ s}$. Then (`WB.P9g`)

$$m_p = \mathbf{0.822\ kg}$$

Nearly twice the propellant mass — but it is stored as a **saturated liquid at
its ~2.7 bar vapour pressure** at $\rho \approx 1360$ kg/m³, so

$$V \approx 0.60\ \mathrm{L}$$

in a thin-walled aluminium can with **no COPV, no regulator and no
high-pressure system at all**.

**Recommendation: R-236fa.** The impulse-density argument is decisive:
$\rho I_{sp} g_0$ is ≈ 0.53–0.58 N·s/cm³ for R-236fa against ≈ 0.18–0.20 for
compressed GN₂ and ≈ 0.06–0.07 for 241-bar helium
[engine-database §C.1, §C.1.1]. **For a CubeSat, the tank is the system.**
$I_{sp}$ scales as $1/\sqrt M$, so light gases win on propellant *mass*;
impulse density scales the other way and wins by more, and it also removes the
pressure vessel.

The counter-argument, which you should raise yourself: R-236fa's performance
depends on staying at its vapour pressure, which means the tank must be kept
warm enough (thermal design), the thruster sees two-phase flow at the valve if
you are careless, and $\gamma$ for a heavy refrigerant near saturation is not
really a constant — the database labels those $\gamma$ values confidence **C**
[§C.1].

### Sanity check

**MarCO MiPS (VACCO), the two MarCO 6U CubeSats that flew to Mars with InSight
in 2018:** R-236fa stored as a self-pressurising saturated liquid,
**8 thrusters, 755 N·s total impulse, 3,490 g wet, >40 m/s of TCM $\Delta v$**,
single all-welded aluminium module, **no regulator and no high-pressure COPV**
[engine-database §C.2], [MarCO] (VACCO data sheets are tagged `VACCO` in
engine-database Part E). Confidence **A**.

Our requirement is $12\ \mathrm{kg} \times 25\ \mathrm{m/s} \approx 300$ N·s —
comfortably inside MarCO's envelope, on a spacecraft of the same form factor,
using the same propellant, and reaching the same conclusion about the tank.

**Caveats:** MarCO's per-thruster thrust is contested — VACCO's catalogue says
">50 mN per thruster" for the cold-gas line generally, while some accounts
quote **~25 mN** for MarCO specifically, and the database marks this **C**
[§C.2]. And the whole stored-density column in §C.1 is **confidence C and
internally inconsistent** — it is ideal-gas for the light gases and something
else for the heavy ones — so treat 1360 kg/m³ as approximate and check NIST
before designing to it [§C.1.2].

### What a mediocre answer looks like

Picks nitrogen, computes 0.45 kg, quotes 69 s, and never sizes the tank — which
is the entire engineering content of the problem. Or uses the ideal 76.8 s with
no efficiency factor, and no $T_0$ or $\varepsilon$ in the statement, which
makes the number meaningless (trap **T8**).

### Follow-up

"Your ADCS wants 0.05 mN·s impulse bits for fine pointing. Does your propellant
choice survive that?" (See problem 24: VACCO's Micro MiPS delivers 93 N·s in up
to 1,860,000 firings — a mean bit of 5×10⁻⁵ N·s — so yes, but only with valves
built for it.)

---

## 24. Minimum impulse bit and pointing — [M29, M30]

*50 mN thruster, 10 ms minimum electrical pulse.*

### Assumptions a strong candidate states out loud

- "The **electrical** pulse is 10 ms. The **thrust** pulse is not a rectangle —
  there is valve opening delay, plenum fill, and a tail as the feed volume
  empties. I'll assume 4 ms rise and 6 ms fall and model it as a trapezoid."
  [A] [J]
- "For the pointing half I need a moment arm and a moment of inertia, which you
  haven't given me. I'll take $L = 0.10$ m and $I = 0.05$ kg·m² for a 12 kg 6U
  class."
- "And I'll say now that the number that actually limits fine pointing is not
  the mean impulse bit but its **repeatability**."

### Worked solution

**Impulse bit** (`WB.P24a`, trapezoidal):

$$I_{bit} = F\left(t_{on} - \tfrac{t_{rise}}{2} + \tfrac{t_{fall}}{2}\right)
= 0.050 \times (0.010 - 0.002 + 0.003)
= \mathbf{5.5\times10^{-4}\ N\,s} = 0.55\ \mathrm{mN\,s}$$

The ideal square pulse would give $5.0\times10^{-4}$ N·s (`WB.P24b`), so the
valve tails add **10 %** — and the tail is the part with the worst
repeatability.

**What it means for pointing.** One bit produces an angular rate step

$$\Delta\Omega = \frac{I_{bit}L}{I_{sc}}
= \frac{5.5\times10^{-4} \times 0.10}{0.05}
= 1.10\times10^{-3}\ \mathrm{rad/s} = \mathbf{0.063\ ^\circ/s}$$

In a deadband limit cycle with half-width $\theta = 0.1°$, the vehicle crosses
the deadband in $0.2/0.063 = 3.2$ s, so the limit-cycle period is about
**6.3 s** and each cycle costs two bits, $1.1\times10^{-3}$ N·s. Over a day:

$$\frac{86400}{6.35} \times 1.1\times10^{-3} \approx \mathbf{15\ N\,s/day}$$

That is a very expensive way to hold attitude — a MarCO-class 755 N·s budget
would be gone in about **50 days** on attitude control alone. The systems
conclusion follows immediately: **use reaction wheels for fine pointing and
cold gas only for desaturation and translation**, or get a much smaller
impulse bit.

**Three points that separate a strong answer:**

1. **Minimum impulse bit sets pointing *stability*, not pointing *accuracy*.**
   Accuracy is set by the attitude sensor; the bit sets how tightly you can
   hold a limit cycle and how much propellant that costs.
2. **Repeatability, not the mean, is the limit.** Solenoid cold-gas valves in
   short-pulse mode typically scatter 5–15 % bit-to-bit [E], and in pulse mode
   the delivered $I_{sp}$ also falls below the steady-state value because the
   tails contribute impulse at poor efficiency.
3. **Levers to shrink the bit:** a smaller thruster, a faster valve, a smaller
   plenum volume between valve and throat (this is often the dominant term), or
   a shorter moment arm.

### Sanity check

VACCO catalogue CubeSat modules: **Standard MiPS, 44 N·s in up to 880,000
firings** → mean bit $5.0\times10^{-5}$ N·s; **Micro MiPS, 93 N·s in up to
1,860,000 firings** → the same $5.0\times10^{-5}$ N·s
[engine-database §C.2, VACCO data sheets]. GomSpace NanoProp CGP3: **1 mN
thrusters with
5 μN resolution**, flown on TW-1 [§C.2].

So real CubeSat cold-gas hardware delivers bits **an order of magnitude
smaller** than our 0.55 mN·s — which tells you that a 50 mN thruster with a
10 ms floor is a *translation* thruster, not a fine-pointing thruster. That is
the answer to the second half of the question.

**Caveats:** the firing counts are catalogue figures (confidence **B**), the
mean bit is derived by division, not published, and the general cold-gas
envelope quoted by NASA is **10 μN – 3.6 N thrust, 40–110 s $I_{sp}$**, with the
top of that $I_{sp}$ band reachable only with warm gas [§C.2, NASA *State of
the Art of Small Spacecraft Technology*, ch. 4].

### What a mediocre answer looks like

$I_{bit} = 0.050 \times 0.010 = 0.5$ mN·s, full stop. No valve dynamics, no
scatter, no moment arm, and no answer at all to "what does it mean for how
finely you can point" — which was half the question.

### Follow-up

"Your customer wants 0.01° pointing. Does cold gas do that?" (Not by itself.
Wheels for fine control, cold gas for momentum dumping — and now the cold-gas
requirement is total impulse and lifetime firings, not bit size.)

---

# Block G — Solid motors

## 10. Two firings, one throat change: find $n$ — [M19, M20]

*Same design, same lot, same conditioning temperature. Second motor's throat is
5 % larger. First ran 7.00 MPa, second 6.49 MPa.*

### Assumptions a strong candidate states out loud

- "Same lot and same conditioning temperature means $a$, $\rho_p$, $c^*$ and
  $\sigma_p$ are all constant. That's what makes this a clean two-point
  inversion — and it's why the interviewer put those words in the sentence."
- "Equilibrium operation, compared at the **same web position**, not at the
  peaks. Comparing peak-to-peak would fold grain geometry into the answer."
- "Negligible throat erosion during the burn, or at least equal erosion in the
  two motors."
- "Burning area identical at the compared instant."

### Worked solution

Equilibrium chamber pressure for a solid motor:

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{1/(1-n)},
\qquad K_n = \frac{A_b}{A_t}$$

With $A_b$, $a$, $\rho_p$ and $c^*$ fixed, $p_c \propto A_t^{-1/(1-n)}$, so

$$\frac{p_B}{p_A} = \left(\frac{A_{t,A}}{A_{t,B}}\right)^{1/(1-n)}
\;\Longrightarrow\;
n = 1 - \frac{\ln(A_{t,A}/A_{t,B})}{\ln(p_B/p_A)}$$

$$n = 1 - \frac{\ln(1/1.05)}{\ln(6.49/7.00)}
= 1 - \frac{-0.048790}{-0.075646} = 1 - 0.6450 = \boxed{0.355}$$

**Forward check** (`WB.P10a`, `WB.P10b`): a generic AP composite at $n = 0.355$
with $A_t$ and $1.05A_t$ gives 8.4658 MPa and 7.8491 MPa, a ratio of
**0.927147** against the observed $6.49/7.00 = 0.927143$. Four figures. The
inversion is self-consistent. (`WB.P10c` gives the corresponding burn rate,
8.61 mm/s at 7.0 MPa.)

**The uncertainty, which is the part that earns the marks.** $n$ from two
points has no error bar unless you give it one. Differentiating,

$$\delta n \approx \frac{\ln(A_{t,A}/A_{t,B})}{\left[\ln(p_B/p_A)\right]^2}
\,\delta\!\left[\ln\frac{p_B}{p_A}\right]$$

The pressure ratio's logarithm is only $-0.0757$, so a **1 % error in either
pressure measurement is a 13 % error in that logarithm and moves $n$ by about
$\pm0.08$.** A 0.5 % error in throat area adds more. So the honest statement is
**"$n \approx 0.36 \pm 0.1$ from these two firings"** — and if you need $n$ to
better than that you use a strand burner or a series of five or more motors
with deliberately varied $K_n$, fitted by regression [SP-8064], [SP-8039],
[Kubota].

**Range check.** 0.355 sits squarely inside the 0.2–0.5 band for civil AP
composites, and inside the 0.25–0.40 band quoted for large boosters [E]
[SP-8076], [Davenas].

### Sanity check

Space Shuttle SRB/RSRM: PBAN-bound AP/Al composite at **≈62.5 bar average
chamber pressure** [engine-database §B.1]. Our recovered exponent is a
plausible value for that propellant family, and the recovered pressures
(6.5–7.0 MPa) are in the same range as a large segmented booster runs.

**Caveat, and it is important:** the RSRM's own pressure exponent is **not
published in the database** — the propellant composition is (AP 69.6 %, Al 16 %,
Fe₂O₃ 0.4 %, PBAN 12.04 %, epoxy 1.96 %, with a competing figure of AP 69.8 /
Fe₂O₃ 0.2), but not $a$ or $n$ [§B.1, §B.1.1]. So this is a family-level sanity
check, not a comparison to a published number. Say that rather than quoting an
exponent you cannot source.

### What a mediocre answer looks like

Applies $r = ap^n$ directly to the pressure ratio and gets
$n = \ln(1.05)/\ln(7.00/6.49) = 0.645$ — missing the $1/(1-n)$ that comes from
the fact that changing $A_t$ changes $p_c$ which changes $r$ which changes
$p_c$ again. That factor is the entire physics of solid-motor equilibrium, and
0.645 would be an unstable motor. Or gets 0.355 and reports it to three
decimals with no uncertainty.

### Follow-up

"How wrong would $n$ have to be before your MEOP is wrong? And what is $\pi_K$
at that $n$?" ($\pi_K = \sigma_p/(1-n)$; at $\sigma_p = 0.0020$/K and
$n = 0.355$, $\pi_K = 3.10\times10^{-3}$ per K, so a 20 K conditioning spread
is a 6 % pressure spread — before you add any $n$ uncertainty at all.)

---

## 25. A 12 % pressure step at $t = 4$ s — [M20, M21, M34]

*Head-end pressure nominal through ignition and four seconds, then steps up
~12 % in ~200 ms and holds, same trace shape, for the rest of the burn.*

### Assumptions a strong candidate states out loud

- "A step in equilibrium pressure at constant $A_t$ means a step in **burning
  area**. I'll convert 12 % of pressure into a percentage of $A_b$, because
  that number tells me what kind of defect I'm looking for."
- "$n \approx 0.35$; I'll show how the answer moves for $n$ between 0.2 and
  0.5, because I don't know the propellant."
- "$\sigma_p \approx 0.0020$/K for the temperature-sensitivity hypothesis."
- "'Same trace shape afterwards' is a strong clue and I'll use it to eliminate
  a designed geometry transition."

### Worked solution

**Step 1 — how much burning area?** From $p \propto K_n^{1/(1-n)}$,

$$\frac{A_{b,2}}{A_{b,1}} = \left(\frac{p_2}{p_1}\right)^{1-n}
= 1.12^{0.65} = 1.0764$$

**A 12 % pressure step is only a 7.6 % burning-area step** at $n = 0.35$
(`WB.P25a`, `WB.P25b` reproduce the pair: 7.488 MPa → 8.387 MPa for a 7.64 %
area step). At $n = 0.5$ it is 5.8 %; at $n = 0.2$ it is 9.5 %. The pressure
exponent *amplifies* area errors, which is the whole reason $n$ matters.

**Step 2 — kill the competing hypotheses quantitatively.**

| hypothesis | test | verdict |
|---|---|---|
| **Throat erosion** | erosion *increases* $A_t$, which **lowers** $p_c$, and does so gradually | **wrong sign and wrong shape — rejected** |
| **Nozzle blockage by slag** | can raise $p_c$, but slag accumulates raggedly and shows as a noisy ramp or spikes, not a clean 200 ms step that holds | unlikely; check the tail-off and post-fire nozzle |
| **Propellant temperature** | $\pi_K = \sigma_p/(1-n) = 0.0020/0.65 = 3.077\times10^{-3}$ per K (`WB.P25c`). A 12 % step needs $\ln(1.12)/\pi_K = \mathbf{37\ K}$ of bulk propellant temperature change **in 200 ms** | **physically impossible — rejected quantitatively.** This calculation is the one that earns the point |
| **Designed geometry transition** (star points burning out into the cylindrical bore) | produces a step — but afterwards $dA_b/dw$ changes, so the **trace shape changes**. The problem says it does not | rejected *unless* the predicted trace has a transition at 4 s — check that first |

**Step 3 — what is left, and it fits everything.** A **crack in the grain, or a
liner/insulation debond that opened and ignited**, exposing new burning surface
that then burns back in parallel with the bore.

- It adds area **in a step** — the crack pressurises and ignites along its
  length in a time set by flame spreading, which is exactly the 100–300 ms
  scale.
- It **holds**, because the crack face keeps burning for the rest of the burn.
- The **trace shape is unchanged** afterwards, because a longitudinal crack
  regresses roughly in parallel with the bore, adding a nearly constant
  increment to $A_b(w)$.

**Step 4 — evidence to demand:**

1. The **predicted** $A_b(w)$ curve and whether a step is designed at 4 s.
2. **Pre-fire radiographs or CT** of the grain, and the cure and handling record
   for that motor (cold-soak cracking is a real and documented mode).
3. **Case external thermocouples** and post-fire case discolouration — a
   liner/insulation debond exposes case and shows thermally.
4. **The tail-off shape.** A crack usually gives a longer, dirtier tail-off
   because the extra surface burns out at a different time from the bore.
5. Whether the same lot produced other motors, and whether they show it.

**Step 5 — say the consequence.** A 12 % excursion above nominal eats a large
part of the margin between nominal and MEOP; typical structural design factors
[STD-5001] do not leave room for many such surprises, and the *combination* of
a grain defect with a hot conditioning day is the case that actually breaks
cases [SP-8073], [SP-8025].

### Sanity check

Grain cracks and liner debonds are the primary structural failure modes
treated in the solid-motor design monographs [SP-8073], [SP-8076], and the
head-end pressure trace is the primary diagnostic for them [SP-8039],
[SP-8041]. The most famous solid-motor pressure-trace anomaly, STS-51-L, was a
**field joint seal failure**, not a grain crack [Rogers86] — a different
mechanism, and worth naming precisely so you do not blur them together.

**Caveat:** the database publishes no motor-specific crack or debond case
history, so this is a mechanism argument from the design literature, not a
precedent from a named motor.

### What a mediocre answer looks like

"Throat erosion" — wrong sign, and the interviewer will let you keep talking.
Or "the grain transitioned to a different geometry," without checking whether
the design has a transition at 4 s and without noticing that the trace shape
did not change.

### Follow-up

"Your radiographs are clean and the design has no transition at 4 s. What's
your next hypothesis?" (Insulation or liner debond that was not radiographically
visible; a case-bond separation at an end; an igniter fragment or unbonded
inhibitor that came loose; or, if the case thermocouples are also clean, take
the instrumentation seriously — a transducer sense-line partial blockage that
cleared at 4 s.)

---

# Block H — Feed system

## 13. Turbopump shaft power — [M12]

*LOX/RP-1, 500 kN vacuum, 100 bar chamber. Estimate the shaft power.*

### Assumptions a strong candidate states out loud

- "$I_{sp,vac} \approx 311$ s for a Merlin-class LOX/RP-1 engine, MR = 2.3,
  $\rho_{LOX} = 1140$, $\rho_{RP-1} = 810$ kg/m³." [A]
- "**Pump discharge is not chamber pressure.** I'll take discharge = 1.7 $p_c$
  to cover injector $\Delta p$ (~20 %), the cooling jacket, lines, valves and
  margin, with a 3.5 bar tank inlet." [J]
- "$\eta_{pump} = 0.70$ — a real rocket pump is 0.65–0.80 [E]."
- "Two pumps, two densities, two powers. Adding them is the answer."

### Worked solution

$$\dot m = \frac{5\times10^{5}}{311 \times 9.80665} = 163.94\ \mathrm{kg/s}
\;\Rightarrow\; \dot m_o = 114.26,\quad \dot m_f = 49.68\ \mathrm{kg/s}$$

$$\Delta p = 1.7 \times 100\ \mathrm{bar} - 3.5\ \mathrm{bar}
= 166.5\ \mathrm{bar} = 1.665\times10^{7}\ \mathrm{Pa}$$

$$P = \frac{\dot m\,\Delta p}{\rho\,\eta}$$

$$P_{ox} = \frac{114.26 \times 1.665\times10^{7}}{1140 \times 0.70}
= \mathbf{2.384\ MW} \quad (\text{\texttt{WB.P13a}})$$
$$P_{fuel} = \frac{49.68 \times 1.665\times10^{7}}{810 \times 0.70}
= \mathbf{1.459\ MW} \quad (\text{\texttt{WB.P13b}})$$

$$\boxed{P_{total} \approx 3.84\ \mathrm{MW} \approx 5{,}150\ \mathrm{hp}}$$

**The insight to volunteer:** the heads are very different even though the
pressure rise is the same, because head is pressure over *density*:

$$H_{RP\text{-}1} = \frac{\Delta p}{\rho g_0} = 2096\ \mathrm{m}
\quad (\text{\texttt{WB.P13c}}), \qquad
H_{LOX} = 1489\ \mathrm{m} \quad (\text{\texttt{WB.P13d}})$$

The fuel pump needs **41 % more head** for the same pressure rise. This is why
the light-propellant pump is always the hard one, why hydrogen pumps are
multistage and run at extreme speed, and why the RS-25's HPFTP turns at 35,360
rpm while its HPOTP turns at 28,120 rpm.

### Sanity check

Normalise by thrust:

| engine | shaft power | thrust | kW per kN | $p_c$ |
|---|---|---|---|---|
| **this estimate** | 3.84 MW | 500 kN vac | **7.7** | 100 bar |
| **F-1** | 41 MW (55,000 bhp) | 6,770 kN SL | **6.1** | ~70 bar (contested) |
| **RS-25** (HPFTP alone) | 53.05 MW (71,140 hp) | 2,279 kN vac | **23** | 206 bar |
| **RD-170** | ~170–190 MW (contested) | 7,900 kN vac | **22–24** | 245 bar `noz`† |

Our 7.7 kW/kN sits just above the F-1's 6.1, which is exactly right: same
propellants, similar $I_{sp}$, but 40 % more chamber pressure. The
hydrogen and high-pressure staged-combustion engines are three times higher,
which is also exactly right. The estimate is defensible.

**Caveats, all from the database:** the **F-1's ~70 bar chamber pressure is
contested and marked low confidence** [§A.2.2]; the **RD-170's turbopump power
is contested at 170 MW (article body) vs 192 MW (specification table) — a 13 %
disagreement inside a single source**, and the database instructs quoting
"approximately 170–190 MW" [§A.6.1]; the RD-170's 245.2 bar is a **nozzle
stagnation** figure, not directly comparable to the F-1's injector-end number.

### What a mediocre answer looks like

Uses one density for both propellants; or sets pump discharge equal to chamber
pressure, which understates the power by ~40 %; or computes one pump and calls
it the answer.

### Follow-up

"Now size the turbine. What inlet temperature and what flow do you need to make
3.8 MW, and what does that cost you in $I_{sp}$?" (On a gas generator, roughly
2–4 % of flow at 800–1000 K — see problem 26's 8.4 s penalty.)

---

## 14. NPSH on a LOX pump — [M12]

*Tank ullage 3.5 bar, 8 m of propellant above the pump, 0.5 bar of line loss.
Is the NPSH adequate?*

### Assumptions a strong candidate states out loud

- "'Adequate' has no meaning without NPSH**r**, which depends on the pump's
  speed and inducer. You haven't given me the temperature, the speed or the
  acceleration environment, so I'll assume all three and show what each is
  worth."
- "LOX at its normal boiling point, 90.2 K, so $p_{vap} \approx 1.0$ bar and
  $\rho = 1140$ kg/m³. If the LOX is warm — say 92 K — $p_{vap}$ is ~1.4 bar
  and I lose head."
- "1 g of axial acceleration, i.e. on the pad or early in flight. This changes
  through the burn and I'll do the worst case too."
- "6,000 rpm for the suction-specific-speed check." [A]

### Worked solution

$$\mathrm{NPSH}_a = \frac{p_{tank} - p_{vap} - \Delta p_{line}}{\rho g_0}
+ z\frac{a}{g_0}$$

**Nominal, cold LOX, 1 g** (`WB.P14a`):

$$\frac{(3.5 - 1.0 - 0.5)\times10^{5}}{1140 \times 9.80665} + 8.0
= 17.89 + 8.0 = \mathbf{25.9\ m}$$

**Warm LOX at 92 K, $p_{vap} = 1.4$ bar** (`WB.P14b`): **22.3 m.** Four hundred
millibars of vapour pressure cost 3.6 m — **14 % of the margin for 2 K of
propellant temperature.** That is the number to put on the board, because it
tells the systems engineer that LOX conditioning is an NPSH requirement.

**End of burn, tank nearly empty (z → 0), cold** (`WB.P14c`): **17.9 m.**

**Worst credible case — end of burn *and* warm LOX**: 14.3 m. That is the
number the pump has to be designed against, and it is **45 % below** the
headline figure.

**Is it adequate?** Compare to what the pump needs. Suction specific speed at
6,000 rpm (628.3 rad/s) on $Q = \dot m/\rho = 114.26/1140 = 0.1002$ m³/s
(`WB.P14d`):

$$S_s = \frac{\omega\sqrt{Q}}{(g_0\,\mathrm{NPSH})^{0.75}} = \mathbf{3.13}$$

in the SI dimensionless form. A plain centrifugal impeller is generally limited
to roughly $S_s \lesssim 3$–4 before cavitation degrades head; an **inducer**
raises the usable value substantially [E] [SP-8052], [Brennen-Pumps]. So at
6,000 rpm this is **marginal-to-adequate for a plain impeller and comfortable
with an inducer** — and at the 14.3 m worst case, $S_s$ rises and the plain
impeller is no longer viable.

**What a strong candidate adds:**

- **The answer is a margin, not a yes.** State NPSHa/NPSHr with the worst-case
  NPSHa, not the nominal.
- **Rotating cavitation and cavitation surge** occur *above* the head-breakdown
  point — a pump can be "not cavitating" by head and still be shedding
  cavitation instabilities that drive feed-system oscillation [SP-8052],
  [Brennen-Pumps].
- **POGO.** Feed-system compliance from cavitation bubbles couples to the
  vehicle structure. Accumulators exist for this.
- **If you cannot get the NPSH, add a boost pump.** That is an architectural
  answer, not a hack.

### Sanity check

The RS-25 carries a **low-pressure oxidiser turbopump at ~5,150 rpm whose sole
purpose is to raise the inlet pressure of the high-pressure oxidiser turbopump
at ~28,120 rpm**, and a low-pressure fuel turbopump at ~16,185 rpm ahead of the
35,360 rpm HPFTP [engine-database §A.2, L3Harris datasheet]. That two-stage
architecture is
the field's standard answer to exactly this problem. The **NK-33 requires
subcooled LOX for bearing cooling**, which constrains ground operations
[§A.6] — a related reminder that propellant temperature is a systems
requirement, not a detail.

**Caveat:** the database does not publish NPSH values, inducer designs or
suction specific speeds for any engine. This comparison is architectural.

### What a mediocre answer looks like

Computes 25.9 m, says "yes, adequate," and never states a vapour pressure, an
end-of-burn case, or an NPSHr to compare against. It is a number without a
requirement.

### Follow-up

"Now it's 8 m of liquid hydrogen instead of LOX. Same answer?" (No. At
$\rho \approx 71$ kg/m³ the static pressure term is 16× larger in metres of
head for the same pressure, but LH2 is almost always near saturation, so
$p_{tank} - p_{vap}$ is small and the margin is thin — which is precisely why
hydrogen pumps get low-pressure boost stages and long inducers.)

---

# Block I — Vehicle, test, and measurement

## 12. Two-stage payload fraction — [M03, M33]

*9.4 km/s ideal $\Delta v$; $I_{sp}$ 300 s and 450 s; structural fraction 0.08
on both stages.*

### Assumptions a strong candidate states out loud

- "You haven't given me the $\Delta v$ **split**, and payload fraction depends
  on it strongly. I'll take 4.0 / 5.4 km/s as a plausible launcher split and
  then tell you where the mathematical optimum is and why nobody flies it."
- "Structural fraction defined as inert mass over (inert + propellant) for each
  stage."
- "Payload fraction is the **product** of the stage payload fractions, because
  each stage's 'payload' is everything above it."

### Worked solution

For a stage with mass ratio $R = e^{\Delta v/(I_{sp}g_0)}$ and structural
fraction $\varepsilon_s$,

$$\lambda = \frac{1 - R\,\varepsilon_s}{R\,(1-\varepsilon_s)}$$

**Stage 1**, 4.0 km/s at 300 s (`WB.P12a` confirms $R_1$):

$$R_1 = e^{4000/(300 \times 9.80665)} = 3.8947,
\qquad \lambda_1 = \frac{1 - 0.31158}{3.8947 \times 0.92} = \mathbf{0.19213}$$

**Stage 2**, 5.4 km/s at 450 s (`WB.P12b`):

$$R_2 = 3.3996, \qquad \lambda_2 = \mathbf{0.23277}$$

$$\boxed{\lambda_{total} = 0.19213 \times 0.23277 = 0.0447 \approx 4.5\ \%}$$

**Two checks a strong candidate does without being asked:**

1. **Is the stage feasible at all?** $R\varepsilon_s < 1$ is required, or the
   stage has negative payload. $R_1\varepsilon_s = 0.312$, $R_2\varepsilon_s =
   0.272$ — both fine.
2. **Single stage?** At 300 s alone, 9.4 km/s needs $m_p/m_f = 23.41$
   (`WB.P12c`), i.e. $R = 24.41$, and $R\varepsilon_s = 1.95 > 1$. **A
   single-stage vehicle at these numbers has negative payload.** That is the
   quantitative statement of why we stage, and it takes ten seconds.

**The optimum split, and why it is a trap.** Maximising
$\lambda_1\lambda_2$ over the split drives stage-1 $\Delta v$ down to about
**1.9 km/s** (giving 5.4 %), because the 450 s stage is always the cheaper
place to buy $\Delta v$. Nobody builds that: stage 1 must lift the entire stack
with $T/W > 1.2$, must survive max-Q, and must push through the atmosphere —
and the 9.4 km/s figure already contains 1.2–1.8 km/s of gravity and drag
losses that are *incurred by stage 1*. The split is set by trajectory and
structural reality, not by this optimisation. Say that; it is the difference
between an analyst and an engineer.

### Sanity check

A real two-stage kerolox launcher delivers roughly 3–4 % of gross liftoff mass
to low Earth orbit. Our idealised 4.5 % is optimistic — as it should be, since
$\varepsilon_s = 0.08$ is generous for an upper stage with a large nozzle and
long-coast provisions, and the ideal $\Delta v$ treatment absorbs losses
crudely.

**Caveat, and state it:** `reference/engine-database.md` is an **engine and
motor database — it carries no vehicle-level mass fractions at all.** So this
sanity check is against general industry knowledge, not against the course's
sourced numbers. Say that rather than pretending to a citation.

### What a mediocre answer looks like

Runs one Tsiolkovsky for the whole 9.4 km/s with an averaged $I_{sp}$; or adds
the stage payload fractions instead of multiplying them; or never checks
$R\varepsilon_s < 1$ and cheerfully reports a positive payload for an
infeasible stage.

### Follow-up

"Stage 2's structural fraction is really 0.12, not 0.08. Redo it." —
$\lambda_2 = (1 - 3.3996\times0.12)/(3.3996\times0.88) = 0.1979$, so
$\lambda_{total} = 0.19213 \times 0.1979 = \mathbf{0.0380}$, a **15 % relative
loss of payload** for four points of upper-stage structural fraction. That
sensitivity is why upper-stage mass is fought over gram by gram.

---

## 28. Uncertainty on a measured Isp — [M18]

*Thrust cell ±0.5 %, oxidiser flowmeter ±1.0 %, fuel flowmeter ±1.5 %,
MR = 2.3.*

### Assumptions a strong candidate states out loud

- "All three uncertainties are independent, and they are quoted at the same
  coverage — I'll assume 1σ, and I'll say what happens if they're 2σ."
- "**$\dot m$ is a sum, not a product.** That is the whole problem. Absolute
  uncertainties add in quadrature and are *then* divided by the total."
- "These are *instrument* accuracies. They are not the measurement uncertainty,
  and I'll list what's missing."

### Worked solution

$I_{sp} = F/(\dot m g_0)$ with $\dot m = \dot m_o + \dot m_f$.

Normalise total flow to $1 + \mathrm{MR} = 3.3$ units, so $\dot m_o = 2.3$ and
$\dot m_f = 1.0$:

$$u(\dot m_o) = 0.010 \times 2.3 = 0.0230, \qquad
u(\dot m_f) = 0.015 \times 1.0 = 0.0150$$

$$u(\dot m) = \sqrt{0.0230^2 + 0.0150^2} = 0.02746
\;\Rightarrow\; \frac{u(\dot m)}{\dot m} = \frac{0.02746}{3.3}
= \mathbf{0.832\ \%}$$

Then, for a quotient, relative uncertainties combine in quadrature:

$$\frac{u(I_{sp})}{I_{sp}} = \sqrt{0.005^2 + 0.008321^2} = \mathbf{0.971\ \%}$$

**On a reported 340 s: $\pm 3.30$ s at 1σ, $\pm 6.6$ s at 95 % coverage.**

**Where to spend money — the useful part of the answer.** The oxidiser meter
dominates *because it carries 70 % of the flow*, even though the fuel meter is
the sloppier instrument:

| change | $u(\dot m)/\dot m$ | $u(I_{sp})$ on 340 s |
|---|---|---|
| baseline (ox ±1.0 %, fuel ±1.5 %) | 0.832 % | **3.30 s** |
| fuel meter improved to ±1.0 % | 0.760 % | 3.09 s |
| **ox meter improved to ±0.5 %** | 0.573 % | **2.59 s** |

Halving the ox meter's error buys twice what halving the fuel meter's does.
That is a procurement decision made from three lines of arithmetic.

**What is *not* in this number, and a strong candidate lists at least four:**

- thrust-stand **alignment and tare**, and the "line tare" from propellant and
  purge lines crossing the stand — the classic systematic that a stated
  load-cell accuracy does not cover;
- load-cell **calibration drift, hysteresis and creep** over the run;
- **ambient pressure correction** to vacuum, if a vacuum $I_{sp}$ is being
  reported from a sea-level test;
- flowmeter **K-factor temperature and density dependence**, and two-phase or
  cavitating flow at a cryogenic turbine meter;
- the fact that "the $I_{sp}$" is a **time average over a window** that the
  analyst chose, on a trace that is never perfectly steady;
- and whether the reported figure has been corrected to a **standard mixture
  ratio and chamber pressure**, which is what makes engine-to-engine
  comparisons meaningful [CPIA-246], [SP-8041].

**Report it properly**: "$I_{sp} = 340.0 \pm 3.3$ s (1σ, instrument only),
averaged over $t = 8$–14 s, at MR 2.30, corrected to vacuum" — or the number
means nothing.

### Sanity check

Published engine performance figures almost never carry an uncertainty, which
is exactly why the engine database is full of pairs that look like
contradictions: **Star 48B at 286.2 s or 292.2 s** (two nozzles, both correct)
[§B.4.1]; **RS-25 expansion ratio 69 vs 77.5 vs 78** [§A.2.3]; **RD-170
turbopump power 170 vs 192 MW inside a single article** [§A.6.1]. A ±1 % 1σ
uncertainty on $I_{sp}$ is ±6.6 s at 95 % — **larger than most of the
differences people argue about.**

### What a mediocre answer looks like

RSS's the three *relative* numbers directly:
$\sqrt{0.5^2 + 1.0^2 + 1.5^2} = 1.87\ \%$, reporting **±6.4 s**. Nearly double
the correct answer, and wrong for a reason that matters: it treats a sum as a
product. This is the single most common error on this problem.

### Follow-up

"Which single instrument do you upgrade first, and by how much does it help?"
(The oxidiser meter; ±1.0 % → ±0.5 % takes 3.30 s to 2.59 s.)

---

## 29. What would you measure first? — [M18, M34]

*First hot fire of a new 50 kN engine. Aborted 1.2 s after start; chamber
pressure was falling before the abort. Thirty channels on the screen.*

### Assumptions a strong candidate states out loud

- "Before any data: **is the stand safe?** Abort sequence complete, propellants
  isolated, no fire, no trapped pressure, nobody approaches. Then preserve the
  data and the hardware — no one touches the DAQ and nobody disassembles
  anything."
- "I will form the hypothesis set *before* I open channels, so I am testing, not
  browsing."
- "$p_c = \dot m c^*/A_t$ — three ways for chamber pressure to fall, and my
  whole triage is built on separating them."

### Worked solution

**The organising question.** Chamber pressure fell. From $p_c = \dot m
c^*/A_t$, exactly three things can cause that:

1. **$\dot m$ fell** → a feed-system problem (valve, regulator, pressurisation,
   cavitation, blockage);
2. **$c^*$ fell** → a combustion problem (igniter dropped out, mixture ratio
   excursion, injector fault);
3. **$A_t$ grew** → throat erosion or a coolant breach into the chamber.

Everything below is designed to tell those apart. **Say this first**; the
channel list is the consequence, not the answer.

**Order of channels, and why each:**

| # | channel | what it decides |
|---|---|---|
| 1 | **Abort logic / redline record**: which redline, what value, what time | tells you what the system *thought* was wrong. A false redline on a bad sensor is one of the most common causes of a first-fire abort |
| 2 | **$p_c$ and $dp_c/dt$** against the commanded sequence | did $p_c$ ever reach nominal? A rise-then-fall is a different failure from a never-arrived |
| 3 | **Main valve positions and timings** (ox, fuel, igniter) vs the sequence | a lagging or out-of-order valve is the classic first-fire fault |
| 4 | **Injector manifold pressures**, ox and fuel, and $\Delta p$ across the injector | manifold nominal + $p_c$ low ⇒ combustion problem. Manifold falling with $p_c$ ⇒ feed problem. **This single comparison splits the hypothesis set in half** |
| 5 | **Tank ullage pressures and flowmeters** | did pressurisation keep up? Regulator droop or lockup as tanks drain is a documented first-fire finding [SP-8080] |
| 6 | **Igniter**: torch/ASI pressure, spark monitor, slug fire signal | an igniter that dropped out at ~1 s and let the flame blow out produces exactly "$p_c$ falling" |
| 7 | **Coolant circuit**: jacket inlet/outlet pressure and temperature | rising $\Delta T$ with falling outlet pressure ⇒ possible breach; a coolant leak into the chamber shows as a mixture-ratio shift with $p_c$ holding |
| 8 | **Wall and skin thermocouples** | a localised hot spot points at the injector (problem 8) |
| 9 | **High-frequency $p_c$ and accelerometers** | was there a dynamic event before the decay? Look in the frequency domain, not the time domain |
| 10 | **Video** — plume colour, shape, mach-diamond structure, and hardware | often the fastest single diagnostic, and always the one people look at last |

**Then compute, don't just look.** Reduce $c^*(t) = p_c A_t/\dot m(t)$ across
the whole 1.2 s. If $c^*$ is nominal and $\dot m$ fell, it is feed. If $\dot m$
is nominal and $c^*$ fell, it is combustion. If neither moved but $p_c$ did,
distrust the $p_c$ transducer or its sense line before you distrust the engine.

**Two habits worth stating:** write the hypothesis list down *before* opening
channels, and record which channels you would need to *falsify* each one; and
resist the pull to explain everything with one cause on a first fire — first
fires commonly have two independent problems.

### Sanity check

There is no first-fire abort case with published channel-level data in
`reference/engine-database.md`, and inventing one would be worse than saying so.
The methodology references are [SP-8041] (captive-fire testing, measurement and
data reduction) and [CPIA-246] (performance prediction and evaluation). The
database's own reminder is relevant here: figures without their qualifiers —
which station, which power level, which window — cause exactly this kind of
confusion in test analysis, not just in publication.

### What a mediocre answer looks like

"Look at chamber pressure." Then lists twenty channels in the order they appear
on the screen, with no hypothesis, no organising equation and no statement of
what each channel would rule out. Under interview conditions this is what most
candidates do, and it is why the question is asked.

### Follow-up

"$c^*$ was nominal the whole time and total flow was nominal. What's left?"
(Throat area — erosion or a coolant breach — or the $p_c$ measurement itself.
And check that the thrust measurement agrees with $p_c$: if thrust and $p_c$
disagree, one of the two instruments is lying.)

---

## 30. Size the whole engine — [M03, M06, M09]

*250 kN vacuum, LOX/CH4, 90 bar. Throat diameter, exit diameter, mass flow, and
a chamber length.*

### Assumptions a strong candidate states out loud

Say all of these before writing a number. There are seven, and the interviewer
is counting.

- $\gamma = 1.16$, $M = 20$ kg/kmol, $T_0 = 3500$ K for LOX/CH₄ at
  MR ≈ 3.4–3.6. [A]
- $\varepsilon = 45$ — "you didn't tell me the stage; I'm assuming a
  vacuum-ish engine and I'll say what changes if it's a booster."
- $\eta_{c^*} = 0.96$ and a nozzle efficiency $\eta_{noz} = 0.98$ (divergence,
  friction, kinetic losses). [E]
- $L^* = 1.0$ m — mid-band for a hydrocarbon chamber (0.8–1.3 m). [E]
- Chamber contraction ratio $A_c/A_t = 2.5$. [J]
- Vacuum, so no separation question.
- "And I'll cross-check the mass flow two independent ways at the end."

### Worked solution

**Gas properties** (`WB.P30a`, `WB.P30b`):

$$R = \frac{8314.46}{20} = 415.72\ \mathrm{J/(kg\,K)},
\qquad c^*_{ideal} = \frac{\sqrt{R T_0}}{\Gamma(\gamma)} = 1882.9\ \mathrm{m/s}$$
$$c^*_{del} = 0.96 \times 1882.9 = 1807.5\ \mathrm{m/s}$$

**Thrust coefficient** at $\varepsilon = 45$ (`WB.P30c`):
$C_{F,vac} = 1.9408$; effective $C_F = 0.98 \times 1.9408 = 1.9020$.

**Throat** (`WB.P30d`):

$$A_t = \frac{F}{p_c C_F} = \frac{2.5\times10^{5}}{9\times10^{6} \times 1.9020}
= 0.0146048\ \mathrm{m^2}
\;\Rightarrow\; \boxed{D_t = 136.4\ \mathrm{mm}}$$

**Exit:**

$$A_e = 45 A_t = 0.657217\ \mathrm{m^2}
\;\Rightarrow\; \boxed{D_e = 914.8\ \mathrm{mm}}$$

**Specific impulse and mass flow** (`WB.P30e`):

$$I_{sp,vac} = \frac{0.96 \times 1882.9 \times 0.98 \times 1.9408}{9.80665}
= \mathbf{350.6\ s}$$
$$\dot m = \frac{F}{I_{sp}g_0} = \mathbf{72.72\ kg/s}$$

**Cross-check** (do this out loud): $\dot m = p_c A_t/c^*_{del} =
9\times10^{6} \times 0.0146048 / 1807.5 = 72.72$ kg/s. ✓ The two routes agree,
which confirms the $C_F$/$c^*$ bookkeeping.

At MR 3.6: $\dot m_{ox} = 56.9$ kg/s, $\dot m_{fuel} = 15.8$ kg/s.

**Chamber** (`WB.P30f`, `WB.P30g`):

$$V_c = L^* A_t = 0.0146048\ \mathrm{m^3} = \mathbf{14.6\ L}$$
$$A_c = 2.5 A_t = 0.0365\ \mathrm{m^2}
\;\Rightarrow\; \boxed{D_c = 215.6\ \mathrm{mm}}$$
$$L_c = \frac{V_c}{A_c} = \boxed{0.400\ \mathrm{m}}$$

Be precise about the convention: $L^*$ is defined on the **whole chamber volume
up to the throat plane**, including the convergent section, so 0.400 m is an
*equivalent cylindrical* length; the actual barrel is shorter once you subtract
the convergent cone's volume. Say which you are quoting.

**Residence-time check.** $\rho_c = p_c/(R T_0) = 9\times10^{6}/(415.72 \times
3500) = 6.185$ kg/m³, so

$$t_{stay} = \frac{V_c \rho_c}{\dot m} = \mathbf{1.24\ ms}$$

Typical is 1–3 ms [E], so $L^* = 1.0$ m is defensible — at the short end,
which for methane (fast-vaporising, well-mixed with a good coax swirl injector)
is reasonable. If the injector were poor you would want $L^* = 1.2$–1.3 m.

### Sanity check

There is no flown methalox engine in this thrust class with chamber pressure,
expansion ratio and $I_{sp}$ all published together — say so. The nearest
comparisons:

- **Rocket Lab Archimedes**: LOX/CH₄, **890 kN vacuum, 365 s vacuum** — both
  **claims** for an **unflown** engine, with $p_c$, $\varepsilon$ and mass all
  **not published** [engine-database §A.3].
- **Raptor** vacuum variant: $\varepsilon \approx 80$, 350 s vacuum claimed
  [§A.3].
- **Vinci**, for scale rather than propellant: 180 kN, 457.2 s, 60 bar,
  $\varepsilon = 240$, ~550 kg with the nozzle [§A.4].

Our 350.6 s at $\varepsilon = 45$ is consistent with Raptor's claimed 350 s at
$\varepsilon \approx 80$ *only if* our efficiencies are optimistic or theirs is
— which is itself the honest observation to make, since the Raptor figure has
**no independent verification whatsoever** [§A.3.5].

### What a mediocre answer looks like

Produces $D_t$ and stops, or produces $D_t$ and $D_e$ without ever stating the
expansion ratio they assumed. Or omits $\eta_{c^*}$ and $\eta_{noz}$ entirely
and reports an ideal $I_{sp}$ of 372 s as though it were deliverable. Or never
cross-checks the mass flow, and so never notices when the $C_F$ and $c^*$
bookkeeping has been double-counted.

### Follow-up

"Now the injector: how many elements, and what $\Delta p$?" (Injector $\Delta p
= 0.15$–0.25 $p_c$ ⇒ 13–22 bar at 90 bar; at typical coaxial element flow rates
of 0.3–0.7 kg/s, 72.7 kg/s wants of order 100–250 elements — then the real
question is the element type and the wall row.)

---

# Interviewer's traps

Each trap is answered in the same shape: **what the sentence assumes**, **why
that is wrong or unprovable**, and **what you would need to know**.

---

## T1. "The RS-25's expansion ratio is 69:1." Is it?

**It is one of three published numbers, and the question is which quantity you
mean.**

| value | source |
|---|---|
| **69:1** | **L3Harris (manufacturer) datasheet**, labelled "area ratio"; Wikipedia infobox |
| 77.5:1 | NASA/Rocketdyne SSME training material; widely repeated in the nozzle-flow literature |
| 78:1 | Wikipedia body text |

[engine-database §A.2.3; the L3Harris datasheet and the Rocketdyne *SSME
Orientation* training document are tagged `L3H` and `NASA-SSME-OR` in
engine-database Part E]

69:1 is the **geometric** exit-area-over-throat-area of the bell as built. The
~77.5 figures come from a different reference — most plausibly a different
throat definition, or an effective/aerodynamic area ratio rather than a
geometric one.

**The answer to give:** "69:1 as the geometric expansion ratio, per the
manufacturer — and I'd flag that ~77.5:1 is widely quoted and has not been
reconciled against a primary document. 'Expansion ratio' is not a single
unambiguous quantity, any more than 'chamber pressure' is."

**What you'd need:** the Rocketdyne *SSME Orientation* training document, to
establish what the 77.5 figure actually measures. The database records that as
an open action [§A.2.3].

**Why the interviewer asks it:** to see whether you will assert a spec-sheet
number, or ask what it measures.

---

## T2. "981 kN in vacuum, and the vacuum variant makes 981 kN too, so the nozzle extension buys nothing."

**Three things are wrong with that sentence.**

1. **The two 981 kN figures belong to different engines.** 981 kN
   (221,000 lbf) is the **sea-level Merlin 1D's vacuum rating**; 981 kN
   (220,500 lbf) is the **MVac's** rating. They coincide numerically, and the
   database calls this out as "a known and persistent source of confusion"
   [engine-database §A.3.1]. Never place them side by side without saying which
   engine each belongs to.
2. **Thrust is the wrong metric.** The extension buys **specific impulse**, not
   thrust: **311 s** (SL engine, in vacuum) versus **348 s** (MVac), at
   $\varepsilon = 16$ versus $\varepsilon = 165$. That is a **12 % gain**. The
   physical reason the thrusts land in the same place is that the MVac trades
   chamber-pressure headroom for nozzle area rather than for thrust [§A.3.1].
3. **The figures themselves are not clean.** Values near **932 kN** also
   circulate for the Merlin 1D vacuum rating in derivative tables, and 981 and
   932 cannot both be the same quantity; the discrepancy is unreconciled
   against a primary source [§A.3.1]. And the MVac's $I_{sp}$ has at times been
   listed as **311 s** in Wikipedia's infobox — which is the *sea-level
   engine's* vacuum $I_{sp}$ in the MVac's field, an error that has propagated
   widely [§A.3.2].

**What you'd need:** which engine each number describes, and whether the
speaker is comparing thrust or $I_{sp}$. Then the comparison becomes trivial
and the "buys nothing" claim evaporates.

---

## T3. "This solid motor produces 14.7 MN." Four questions before you write it.

1. **Per motor or per vehicle?** This is the most common error in the secondary
   literature on solids and it is a factor-of-two (or four) mistake. The
   database tags every solid figure `/motor` or `/vehicle` explicitly,
   *including* for single-motor vehicles where it looks redundant
   [engine-database, "Thrust tags"].
2. **Maximum or burn-averaged?** A solid motor's thrust is a curve. The LVM3
   S200 has **max/avg = 1.44** — quoting one for the other is a 44 % error
   [engine-database, "Thrust tags"].
3. **Sea level or vacuum?**
4. **At what time in the burn, and at what propellant conditioning
   temperature?** Grain geometry shapes the trace; and $\pi_K = \sigma_p/(1-n)$
   means a 20 K conditioning spread moves chamber pressure and thrust by
   several percent (problem 10's follow-up).

A fifth, if you are allowed one: **what does the published figure's own source
cite?**

**For reference:** the Shuttle SRB/RSRM is **≈14,700 kN `/motor` `max` at sea
level, at about t+20 s**, and **≈12,500 kN `/motor` at liftoff** [§B.1]. So
"14.7 MN" is very likely one RSRM at its peak — not the pair, and not its
average.

---

## T4. "The chamber pressure is 250 bar." What have you not told me?

**Three things, and the first is the big one.**

1. **Which station.** Chamber pressure is not one quantity. The database
   distinguishes four flags [engine-database, "What Pc means"]:
   - `inj` — injector-face stagnation, the course default and standard US
     Apollo-era practice;
   - `noz` — nozzle stagnation, standard Soviet/Russian practice and many
     modern datasheets, **typically a few percent lower**;
   - `dev` — a development peak, not a flight rating;
   - `n.s.` — station not stated by any source consulted, which is depressingly
     common.

   "Comparing the RD-180's 267 bar to the RS-25's 206 bar without stating the
   convention overstates the gap slightly" — the database says so explicitly,
   and it is the single largest recurring source of apparent disagreement in
   the liquid file.
2. **At what power level.** RS-25 is **206.4 bar at 109 % FPL**, ~198 bar at
   104.5 %, ~189 bar at 100 % RPL — and the lower two are *scaled*, medium
   confidence [§A.2].
3. **Flight-nominal or ground-development, and which engine block.** The Atlas
   MA-5 vs MA-5A chamber-pressure disagreement (580 psia vs 48 bar) turned out
   to be **different engine blocks**, not a contradiction [§A.1.2].

**How much it could matter.** For thrust, $F \propto p_c$, so the station
convention is worth a few percent — small. For a *records claim*, decisive. For
heat flux, $h_g \propto p_c^{0.8}$, so a 10 % $p_c$ error is 8 % on flux. And
for the power-level question, 109 % versus 100 % is a **9 %** difference —
larger than every other effect combined.

---

## T5. "Isp is 465 seconds, so the exhaust velocity is 4560 m/s." When is that false?

$465 \times 9.80665 = 4560$ m/s, and that product is always the **effective
exhaust velocity** $c \equiv F/\dot m$. [F] The sentence is false whenever it is
read as the **actual** velocity of the gas at the exit plane, $v_e$, because

$$F = \dot m v_e + (p_e - p_a)A_e
\;\Longrightarrow\; c = v_e + \frac{(p_e-p_a)A_e}{\dot m}$$

so $c = v_e$ **only when $p_e = p_a$** — ideal expansion. Specifically:

- **In vacuum with a finite $\varepsilon$** (which is where a 465 s figure
  comes from — the RL10B-2 at $\varepsilon = 285$ is the only flown engine at
  465.5 s [engine-database §A.2]), $p_e > 0 = p_a$, so **$c > v_e$**: the gas
  actually leaves *slower* than 4560 m/s, and the pressure term makes up the
  rest.
- **At sea level, overexpanded**, $p_e < p_a$, so **$c < v_e$**.
- If the quoted $I_{sp}$ is **sea level** and you use it as vacuum, or the
  reverse, the number is simply the wrong number.
- On a **gas-generator cycle** the exhaust is two streams at different
  velocities. $c = F/\dot m_{total}$ is still well defined, but **no single
  stream is moving at 4560 m/s**.

**The correct statement:** $c = I_{sp}g_0$, always, by definition; $v_e = c$
only at ideal expansion. If someone wants the real exit velocity, they need
$p_e$, $A_e$ and $\dot m$ as well.

---

## T6. You compute $C_F$ at sea level for $\varepsilon = 60$ and get 1.31. Why might that number be meaningless?

**Because the nozzle is almost certainly separated, and the formula you used
assumes it is not.**

The isentropic thrust-coefficient expression assumes attached, fully-expanded
flow all the way to the exit plane. Check it. At $p_c = 100$ bar,
$\gamma = 1.20$, $\varepsilon = 60$ (problem 4's registered numbers):

$$M_e = 4.5245, \qquad p_e = 12.5\ \mathrm{kPa}$$

against a **Schmucker separation wall pressure of 27.9 kPa** [E] [Schmucker73].
$p_e$ is **less than half** the separation pressure. Summerfield's cruder
criterion ($p_e \ge 0.4\,p_a$, i.e. 40.5 kPa) agrees emphatically [SFS54].

**Three consequences:**

1. The real flow separates at an area ratio of roughly 19, not 60, so the
   *effective* expansion is far smaller and the **actual $C_F$ is higher than
   1.31** — nature refuses to pay the overexpansion penalty you computed.
2. The separation line is **asymmetric and unsteady**. It wanders, and it
   generates **side loads** capable of destroying the nozzle extension and
   overloading the gimbal actuators [OMK05], [Ostlund02], [SP-8120].
3. So the number is wrong *and* it describes an operating point no sane
   programme would run.

**What you'd need:** the chamber pressure (the whole question is $p_e/p_a$, and
$p_e$ scales with $p_c$), the ambient pressure, and a separation criterion. At
a high enough $p_c$, $\varepsilon = 60$ *can* run attached at sea level — that
is exactly what problem 16 shows at 300 bar.

---

## T7. A vendor quotes a Star 48B at 292.2 s. Your colleague's datasheet says 286.2 s. Who is wrong?

**Nobody. They are quoting different nozzles.**

| quantity | value A | value B | resolution |
|---|---|---|---|
| $I_{sp}$ vac | **286.2 s** | **292.2 s** | **both correct** — short-nozzle and long-nozzle variants |
| $\varepsilon$ | 47.7 | 54.8 / 70.4 | same cause |
| thrust | 66.0 kN | 66.4 kN | within quoting noise |

[engine-database §B.4.1]

The **short-nozzle** variant ($\varepsilon \approx 47.7$) was built to fit
inside the Shuttle PAM-D cradle; the **long-nozzle** variant is the
higher-performing motor. **Never quote "Star 48B $I_{sp}$" without the
expansion ratio.** The database uses this pair as the canonical worked example
for the principle that **$I_{sp}$ is a property of the motor *and* its nozzle,
not of the propellant** [§B.4.1].

**But do not conclude that all disagreements are like this.** The same motor
has an inert mass quoted as **28 kg** (McDowell's catalogue) and **126 kg**
(Encyclopedia Astronautica) — and
those cannot both be right. The arithmetic settles it: $2{,}137 - 2{,}009 =
\mathbf{128}$ kg, so **the 28 kg figure is almost certainly a dropped digit**,
and the correct value is ≈128 kg with a mass fraction of ≈0.94 [§B.4.1].

**The lesson to say out loud:** "who is wrong" is sometimes a real question and
sometimes a category error. The way to tell them apart is a **consistency
check**, not an appeal to which source you trust.

---

## T8. "We measured 40 s on the cold-gas thruster, but the ideal is 77, so it's 52 % efficient and we should redesign it."

**Take it apart in six pieces.**

1. **77 s is nitrogen, at $\varepsilon = 50$, at $T_0 = 300$ K.** [§C.1] If the
   thruster runs something else, the ideal is something else. If it runs
   **R-236fa**, the ideal at $\varepsilon = 50$ and 293 K is **43.2 s** — and
   40 s against that is **93 % efficient**, not 52 %. Which gas is it?
2. **Any cold-gas $I_{sp}$ is meaningless without $T_0$ and $\varepsilon$.** The
   database says this in bold: the spread between $\varepsilon = 20$ and
   $\varepsilon = 100$ is **3–10 %** depending on $\gamma$ [§C.1]. Was the
   quoted ideal computed at the thruster's actual area ratio?
3. **The realistic ceiling is about 0.90, not 1.0.** Cross-checking the
   worksheet's ideal values against measured values across the whole gas table
   gives a **measured/theoretical ratio of ~0.91** [§C.1.3]. A cold-gas
   thruster that hit 100 % of frozen-ideal would be a physics problem, not an
   engineering success.
4. **Steady or pulsed?** A 40 s figure measured in **pulse mode** is not
   comparable to a steady-state ideal at all — the valve opening and closing
   tails contribute impulse at poor efficiency, and wall heat losses dominate
   at millinewton scale.
5. **Blowdown or regulated?** If the test averaged over a blowdown, $T_0$ fell
   as the tank cooled, and $I_{sp} \propto \sqrt{T_0}$.
6. **Low-Reynolds-number nozzle losses.** At millinewton thrust the nozzle
   boundary layer occupies a large fraction of the throat, and a large
   geometric $\varepsilon$ simply does not deliver its ideal $C_F$.

**What you'd need before agreeing to a redesign:** the gas, $T_0$,
$\varepsilon$, the duty cycle, the inlet pressure history, and whether the
"ideal" was computed for the same three. Then compare like with like. Most of
the time the 52 % evaporates.

---

## T9. "Bartz says 31 MW/m², so we need a 31 MW/m² cooling circuit." Three reasons that's the wrong number to design to.

1. **Bartz is a correlation, not a measurement.** It is **±20–30 % at the
   throat at best**, and worse in the chamber and downstream [E] [Bartz57]. On
   top of that, the inputs you fed it — $\mu_0$, $c_{p0}$, $Pr_0$, the throat
   radius of curvature, and above all the assumed gas-side wall temperature —
   are estimates you chose. Designing to the nominal is designing to the middle
   of a distribution, with a 50 % chance of being under.
2. **It is one station at one operating point, not a load.** The circuit has to
   survive the **peak local** flux, and the local peak is not the
   one-dimensional throat value: injector streaks (problem 8), the
   recirculation zone near the face, the convergent section, and any hot spot
   can exceed the axisymmetric estimate substantially. And the design case is
   the **worst operating point** — high mixture-ratio excursion, maximum
   $p_c$, throttle transients, restart — not the nominal steady state.
3. **You do not design a cooling circuit to a flux.** You design it to a
   **wall temperature**, a **coolant film temperature** (the coking limit for
   RP-1), a **bulk temperature rise**, a **pressure drop you can afford**, and a
   **low-cycle fatigue life** — all of which must close simultaneously
   [SP-8087]. Problem 15 is the demonstration: a channel that passes on
   velocity and Reynolds number fails on pressure drop by a factor of two and
   on film temperature independently. A single flux number tells you nothing
   about whether any of that closes.

**A fourth, if invited:** **transients**. Start and shutdown produce thermal
gradients worse than steady state, and LCF life is counted in cycles, not in
steady-state hours. For a reusable engine that is the design driver.

---

## T10. "Raptor runs at 300 bar, which beats the RS-25's 206 bar and the RD-180's 267 bar." Everything is a published number. What is still wrong?

**Five things, in increasing order of importance.**

1. **The three numbers are at different stations.** The RS-25's 206.4 bar is
   **injector-face** (`inj`); the RD-180's 267 bar is **nozzle stagnation**
   (`noz`†, Soviet/Russian convention), typically a few percent lower than the
   injector-end value would be. The database says explicitly that comparing
   them without stating the convention "overstates the gap slightly"
   [engine-database, "What Pc means"; §A.6].
2. **They are at different power levels.** RS-25's 206.4 bar is the **109 %
   FPL** figure; at 100 % RPL it is ~189 bar [§A.2]. And "Raptor" is three
   engines: Raptor 1 at 250 bar, Raptor 2 at 300, Raptor 3 at 330 — all claimed
   [§A.3].
3. **They have completely different evidentiary status.** The RS-25 figure is
   published by the manufacturer and NASA and agreed exactly between
   independent sources (L3Harris datasheet). The RD-180 figure is high
   confidence.
   **Raptor's chamber pressure is a SpaceX claim with no independent
   verification of any kind.** The database is blunt: "There is no independent
   verification of Raptor chamber pressure, $I_{sp}$, dry mass or T/W at all,"
   and the only corroboration of *anything* about Raptor is thrust, indirectly,
   via FAA licensing and environmental documents and third-party analysis of
   flight telemetry and acoustics [§A.3.5, FAA licensing and environmental
   record]. Several Raptor figures
   trace to executive posts on Twitter/X.
4. **Chamber pressure is not a figure of merit.** It is an *input* to a design,
   not an output you maximise. Higher $p_c$ buys a smaller, lighter engine for
   a given thrust and raises the achievable $C_F$; it costs heat flux
   ($\propto p_c^{0.8}$), pump power ($\propto p_c$), liner life and
   development risk. **BE-4 deliberately runs at 140 bar, and Blue Origin
   states this is a life-and-reusability choice, not a limitation** [§A.3]. A
   sentence that ranks engines by chamber pressure is measuring the wrong
   thing.
5. **The genuinely defensible claim about Raptor is a different one.** Raptor
   is the **first full-flow staged combustion engine ever flown** — only the
   Soviet RD-270 (never flown) and the American Integrated Powerhead
   Demonstrator (test only) preceded it. That fact **does not depend on any
   contested number** [§A.3.6]. If you want to say something impressive about
   Raptor, say that.

**What you'd need:** the station for each figure, the power level for each, and
a primary source for the Raptor number — which, as of the database's last
verification pass, does not exist.

---

*Numbers verified against `tools/rocket.py` via
`python3 tools/check_examples.py`; the registered set for this file is
`tools/examples/whiteboard.py`. Real-engine figures and their confidence
labels are from `reference/engine-database.md`, which carries them from
`reference/_verify-liquid.md` and `reference/_verify-solid-coldgas.md`.
Citation tags resolve in `reference/sources.md`.*
