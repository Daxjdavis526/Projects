# Module 26 — Key: Historical large solid motors

Answer key for `26-historical-motors.md`. All arithmetic uses
$g_0 = 9.80665$ m/s². Every real-motor figure carries the confidence label of
its entry in `reference/_verify-solid-coldgas.md`; where that file says a
number is conf C or "needs primary," the solution says so rather than pretending
to precision.

---

## K1. Problem solutions

### Conceptual

**C1.** The first question is: **is 14.234 MN per motor or per vehicle?** The
two interpretations are (i) each booster produces 14.234 MN, so the pair
produces 28.5 MN; (ii) the pair produces 14.234 MN, so each produces 7.1 MN.
For the Titan IV-A UA1207 the second is correct — the widely reproduced figure
is per-vehicle [conf C on the number, B on the architecture]. A second question
follows immediately: **maximum or average**, and on what pressure basis. A
grader should look for the candidate spotting that the propellant mass (176,000
kg) is almost certainly *per motor* while the thrust is *per vehicle*, which is
exactly the mixed-basis trap: dividing one by the other gives nonsense.

**C2.** Eq. 3.2 gives
$\Delta v = I_{sp}g_0 \ln\!\big[(m_p/\zeta + m_u)/(m_p(1/\zeta-1) + m_u)\big]$.
The inert mass appears only in the denominator, together with $m_u$. When
$m_u \gg m_i$ — a Shuttle strap-on pushing an Orbiter and an External Tank — a
change in $m_i$ is a small fractional change in the denominator, so the Δv
sensitivity to $\zeta$ is muted. When $m_u$ is small compared with $m_i$ — a
strategic missile upper stage carrying only a re-entry bus — the same absolute
inert-mass saving is a large fractional change in $m_f$, and the Δv gain is
correspondingly larger. Hence the composite-case revolution reached strategic
upper stages and apogee kick motors a decade before it reached large boosters.
A strong answer notes the second reason: a silo or launch tube fixes the
*volume*, so performance cannot be bought with more propellant and must be
bought with inert mass.

**C3.** Under ignition pressurisation the tang-and-clevis joint **rotates**: the
tang and the inner clevis leg deflect apart because the load path is eccentric
and the two members have different stiffnesses, momentarily *opening* the gap
the O-rings must seal at the exact moment the chamber is pressurising. The seal
therefore depended on the elastomer extruding into a growing gap faster than the
gap opened — a rate-dependent process whose rate falls sharply with temperature.
On STS-51-L cold-stiffened rings failed to seat in the aft field joint of the
right-hand SRB, hot gas blew by and burned through, and the plume impinged on
the External Tank aft attachment and the tank [conf B, `[Rogers86]` ch. IV]. The
geometric fix is the **capture feature**: an inner lip on the tang that engages
the inside clevis leg and mechanically limits the rotation. (A complete answer
also lists the third O-ring on the capture feature, redesigned insulation and
joint heaters, but the *architectural* answer is the capture feature.)

**C4.** Total impulse scales with propellant mass; instantaneous thrust is set
by burning area and throat area, $F \approx C_F p_c A_t$ with
$p_c \propto (a\rho_p c^* A_b/A_t)^{1/(1-n)}$. GEM-46 spreads 43 % more
propellant over a 20 % longer burn (75.9 s vs 63.3 s), so its burning area at
any instant is smaller relative to its total propellant and its peak thrust is
lower (611 kN vs 644 kN `max`). The designers were optimising the **trajectory**
— Delta III wanted a lower, longer thrust contribution, not a higher peak.
"Bigger motor" and "more thrust" are independent statements.

**C5.** Any three of:
(i) The motor fires in vacuum, so there is no atmospheric back pressure and
nothing limits $\varepsilon$ except the fairing envelope — a booster is
overexpansion-limited at sea level and cannot use $\varepsilon > \sim 11$.
(ii) The stage is spin-stabilised, so there is no TVC requirement at all,
letting the entire actuator, bearing, power and hydraulic subsystem be deleted;
a first stage must steer.
(iii) There are no aerodynamic or bending loads and no max-Q box, so the case
can be optimised purely as a pressure vessel, and a sphere is the
minimum-surface-area (hence minimum-mass) pressure vessel for a given volume; a
booster's case is a structural member of the vehicle and must be a long
cylinder.
(iv) It fires once, briefly, and is discarded, so there is no recovery,
refurbishment or reflight constraint on the case material.

**C6.** Thrust termination opens ports (usually shaped charges cutting the
forward dome) so that the chamber vents through a large additional area. $K_n$
collapses, chamber pressure falls below the deflagration limit, and thrust stops
— physically, you break the $A_b/A_t$ balance rather than stopping the
combustion. It is not an abort system because it is one-shot, violent,
structurally destructive, and it produces a large forward-directed thrust
transient; it is used to **set final velocity** precisely on a missile whose
solid motor cannot be throttled. Its cost is dome structure, ordnance, a safe/arm
chain, and the failure modes those bring. Used on Minuteman third stages and on
the Titan UA1205 in crewed configurations [conf B].

**C7.** Steel → glass filament wound → Kevlar/epoxy → graphite (carbon)/epoxy,
each step roughly a **20–30 % case-mass reduction at equal burst pressure**
[conf B]. The documented non-mass reason: the Trident II D-5 third-stage case
change from Kevlar to graphite/epoxy in 1988 was made for inert-weight reduction
**and** to eliminate the electrostatic potential difference between Kevlar and
graphite structures [conf B, `[FAS]`]. Credit for noting that this second reason
appears in no performance equation and would have driven the change alone.

**C8.** The technical reason is **casting location relative to the launch site**,
which sets the maximum transportable piece. The Ariane 5 EAP case segments were
manufactured in Europe and the motor was assembled from three bolted steel
segments; P120C is cast as one piece at Regulus in Kourou (and at Colleferro),
so nothing has to be shipped as a loaded segment and the case can be a single
filament-wound monolith 13.5 m long. Once you can cast where you launch,
segmentation buys nothing and costs six to eight points of propellant mass
fraction plus three sets of field joints. A weak answer says "composites got
better"; materials capability was necessary but not sufficient — the Titan SRMU
was a *segmented* composite motor in 1997, precisely because it still had to
travel.

### Calculation

**P1.** Zefiro 40: $\zeta = 36{,}239/40{,}477 = \mathbf{0.8953}$.
GEM-63XL: $\zeta = 47{,}853/53{,}030 = \mathbf{0.9024}$.
GEM-63XL is higher by 0.7 points. A reason unrelated to case material: **size
and fixed overheads**. Zefiro 40 is a 2.4 m diameter upper stage of 40 t; GEM-63XL
is a 1.62 m × 22.0 m strap-on of 53 t. Nozzle, igniter, insulation, skirts and
joints do not scale with volume, so the larger motor carries them more cheaply
per kilogram of propellant. Also acceptable: Zefiro 40's high-$\varepsilon$
upper-stage nozzle and its flexseal/EMA TVC hardware are inert mass that the
fixed-nozzle GEM-63XL does not carry. (Both cases are carbon/epoxy filament
wound, so material cannot be the explanation — that is the point of the
question.)

**P2.** $m_i = m_p(1/\zeta - 1)$.

At $\zeta = 0.86$: $m_i = 60{,}000 \times 0.162791 = 9{,}767.4$ kg;
$m_0 = 109{,}767.4$ kg, $m_f = 49{,}767.4$ kg;
$\Delta v = 272 \times 9.80665 \times \ln(2.20558) = \mathbf{2109.9\ m/s}$.

At $\zeta = 0.93$: $m_i = 60{,}000 \times 0.075269 = 4{,}516.1$ kg;
$m_0 = 104{,}516.1$ kg, $m_f = 44{,}516.1$ kg;
$\Delta v = 272 \times 9.80665 \times \ln(2.34784) = \mathbf{2276.6\ m/s}$.

**Difference: +166.7 m/s, +7.9 %.** Sanity: 7 points of $\zeta$ for ~167 m/s is
about 24 m/s per point, lower than WE1's 33 m/s per point because the stack here
is relatively heavier compared with the propellant load — consistent with C2.

**P3.** $I_t = 141{,}400 \times 280 \times 9.80665 = 3.883 \times 10^8$ N·s.

| $t_b$ | $\bar F$ | $F_{max}/\bar F$ |
|---|---|---|
| 130 s | 2.987 MN | **1.600** |
| 140 s | 2.773 MN | **1.724** |

Credibility: a ratio of 1.6–1.7 is very high. It is not impossible for a single
monolithic cast grain — a star or finocyl port with a large initial burning area
that regresses hard will do it, and P120C's job (Vega-C first stage and Ariane 6
strap-on) rewards a high initial thrust followed by a fall through max-Q. But it
is at the top of the range in §4, above the LVM3 S200's published 1.44. **The
input I trust least is the burn time**, which is conf C in the source and is
given as a 10-second range; $I_{sp}$ is conf B, propellant mass conf B, and the
4,780 kN is conf B but the source does not confirm whether it is a vacuum or
sea-level maximum. A defensible answer says: quote the total impulse (which
depends only on two conf-B numbers), and refuse to quote $F_{max}/\bar F$ until
the burn time and the thrust basis are pinned to a primary source.

**P4.** Sum $= 27{,}100 + 97{,}380 + 82{,}210 = \mathbf{206{,}690}$ kg against a
published 205,000 kg — a discrepancy of $+1{,}690$ kg, **+0.824 %**.

Implied $I_{sp} = \bar F t_b/(m_p g_0) = 3{,}578{,}200 \times 128 /
(205{,}000 \times 9.80665) = \mathbf{227.8\ s}$, against a published **274.5 s
vacuum** — 17 % low.

Which number to challenge first: **the average thrust**. Reasons: (i) 227.8 s is
too low even for a sea-level-basis figure on a modern HTPB/AP/Al motor (the PSLV
S139 is quoted at 237 s SL), so it cannot be explained by an SL/vacuum basis
change alone; (ii) the published $I_{sp}$ of 274.5 s and the maximum thrust of
5,150 kN are mutually consistent with the burn time under a plausible trace,
while the "average" is not; (iii) the 0.8 % segment-mass discrepancy shows this
data set is a compilation from more than one source, and "average thrust" is the
figure most often quoted on an inconsistent basis. Full credit also for
challenging the burn time and computing what it would have to be
($t_b = 205{,}000 \times 9.80665 \times 274.5/3{,}578{,}200 = 154$ s) and noting
that 154 s is implausibly long against the published 128 s. Half credit for
challenging the $I_{sp}$ alone without argument.

**P5.** $m_f = 900 + 128 = 1{,}028$ kg; $m_0 = 1{,}028 + 2{,}010 = 3{,}038$ kg;
$m_0/m_f = 2.95525$, $\ln = 1.08360$.

(a) Short: $\Delta v = 286.2 \times 9.80665 \times 1.08360 = \mathbf{3041.3\ m/s}$.
(b) Long: $\Delta v = 292.2 \times 9.80665 \times 1.08360 = \mathbf{3105.0\ m/s}$.
Gain **+63.8 m/s**.

Extra inert mass $x$ the long nozzle may carry before the advantage vanishes:
solve $292.2 g_0 \ln[(3038+x)/(1028+x)] = 3041.3$ m/s. Iterating,
$x = \mathbf{35.4\ kg}$. Sanity: that is 28 % of the entire motor inert mass, so
a longer carbon-phenolic exit cone will not come close to cancelling the gain —
consistent with WE3, where the same trade at fixed Δv survived an assumed 8 kg
penalty comfortably. Note the payload here (900 kg) is smaller than in WE3, so
the mass-ratio is larger and the Δv margin per second of $I_{sp}$ is bigger.

**P6.** $I_t = 241{,}000 \times 275 \times 9.80665 = 6.499 \times 10^8$ N·s.
$\bar F = 6.499\times10^8/140 = \mathbf{4.642\ MN}$.
$F_{max}/\bar F = 7.08/4.642 = \mathbf{1.525}$.

Interpretation: a ratio of about 1.5 says a strongly shaped trace — high initial
burning area (the forward segment's star), then a substantial fall. That is the
same max-Q load-limiting logic as the Shuttle SRB, and consistent with the
qualitative description of the EAP grain (forward star, aft cylindrical bore
[conf C]).

**The correction not applied:** the published 7.08 MN is a **sea-level maximum**
while the 275 s is a **vacuum** $I_{sp}$. Reconstructing a vacuum-basis average
and comparing it with a sea-level peak inflates the ratio. Correcting to a
common basis would reduce it — a sea-level-basis average would be roughly
$(242/268)$-scale lower if the RSRM's SL/vac ratio is representative, i.e.
$\bar F_{SL} \approx 4.19$ MN and a ratio of about 1.69, or conversely a vacuum
peak would be higher than 7.08 MN and the ratio lower. Full credit requires
naming the basis mismatch explicitly and saying which direction it pushes; also
credit for noting the burn time and the thrust are both conf C, so the ratio
should be quoted as "about 1.5" and not to three figures.

**P7.**
- Inert mass $= 590{,}000 - 500{,}000 = \mathbf{90{,}000}$ kg (published inert
  ≈ 91,000 kg — internally consistent to ~1 %).
- $\zeta = 500{,}000/590{,}000 = \mathbf{0.8475}$.
- $I_t^{SL} = 500{,}000 \times 242 \times 9.80665 = \mathbf{1.1866\times10^9}$ N·s;
  $I_t^{vac} = 500{,}000 \times 268 \times 9.80665 = \mathbf{1.3141\times10^9}$ N·s.
- $\bar F^{SL} = 1.1866\times10^9/123 = \mathbf{9.647\ MN}$;
  $\bar F^{vac} = 1.3141\times10^9/123 = \mathbf{10.684\ MN}$.
- Constant liftoff thrust assumption:
  $I_t = 12.5\times10^6 \times 123 = \mathbf{1.5375\times10^9}$ N·s, which is
  **+17.0 %** against the vacuum-basis reconstruction (and +29.6 % against the
  sea-level basis).

The point: liftoff thrust is not average thrust and it is not even peak thrust
(the RSRM peaks near 14.7 MN at about t+20 s). Treating any single quoted thrust
as constant over the burn of a shaped-grain motor produces double-digit errors
in total impulse.

**P8.** $m_p = I_t/(I_{sp} g_0) = 2.0\times10^9/(278 \times 9.80665) =
\mathbf{733{,}609\ kg}$ (≈ 734 t).

At $\zeta = 0.85$: gross $= 733{,}609/0.85 = 863{,}069$ kg, inert
$= \mathbf{129{,}460\ kg}$.
At $\zeta = 0.92$: gross $= 733{,}609/0.92 = 797{,}401$ kg, inert
$= \mathbf{63{,}792\ kg}$.

**The case technology decision is worth 65.7 tonnes of structure** on one motor
— slightly more than the propellant load of a Zefiro 40 stage. Sanity check: the
propellant mass is about 1.5× a Shuttle RSRM, and the computed inert mass at
$\zeta = 0.85$ (129 t) is about 1.4× the RSRM's ≈ 91 t, so the numbers scale
sensibly.

### Engineering reasoning

**R1.** Predictions and justifications:

- **Case material and construction:** $\zeta = 120/148 = 0.811$. That is *below*
  every composite motor in §3.2 and below even PSLV S139's 0.821. Combined with
  a plant 900 km inland, predict a **segmented metal case** — steel or maraging
  steel. A composite monolith at 0.811 would be an engineering failure; a
  segmented steel case at 0.811 is ordinary.
- **Segment count:** 3.0 m diameter, 120 t of propellant, over-land transport.
  Compare: Ariane 5 EAP is 3.06 m and 241 t in 3 segments; LVM3 S200 is 3.2 m
  and 205 t in 3 segments; the RSRM is 3.71 m and 500 t in 4 flight segments.
  Scaling by propellant per segment (≈ 60–80 t), predict **2 or 3 segments**,
  most likely 3 if rail length is the binding constraint. Accept 2–4.
- **TVC:** at 3 m diameter and 3.9 MN, both flexseal gimbal and LITVC/SITVC are
  feasible. Modern practice ([M]) is a flexseal nozzle with electromechanical or
  electro-hydraulic actuation; predict that, but note that if the low $\zeta$ is
  partly explained by injectant tanks, secondary injection is possible (this is
  exactly the PSLV S139 situation). A strong answer flags the ambiguity rather
  than guessing confidently.
- **$F_{max}/\bar F$:** $I_t = 120{,}000 \times 271 \times 9.80665 =
  3.189\times10^8$ N·s; $\bar F = 3.189\times10^8/105 = 3.037$ MN; against a
  quoted 3.9 MN, ratio **1.28** — a mildly shaped, near-neutral-to-progressive
  trace, similar to GEM-40. (Caveat: the 3.9 MN is untagged, so this is
  provisional.)
- **The single most valuable extra datum:** *where the motor is fired relative to
  where it is cast* is already given, so the best remaining answer is **whether
  the 3.9 MN is maximum or average and on what pressure basis** — it changes the
  trace conclusion completely. Also fully acceptable: the segment count itself,
  or the inert-mass breakdown (which would settle whether the low $\zeta$ is
  case or TVC).

**R2.** The two most likely mechanisms:
(i) **Throat erosion.** A growing $A_t$ reduces $K_n = A_b/A_t$, and since
$p_c \propto K_n^{1/(1-n)}$, chamber pressure falls progressively. Thrust
$F = C_F p_c A_t$ falls **less than** $p_c$ because $A_t$ is simultaneously
growing, and $C_F$ changes only slowly. This is the mechanism consistent with the
stated observation.
(ii) **Lower-than-predicted burn rate** (bad propellant batch, wrong bulk
temperature, mis-set $a$ in the prediction). Here $A_b$ regresses more slowly
than predicted, $p_c$ is low, but $A_t$ is unchanged, so **thrust falls in
proportion to pressure**, not less. This is inconsistent with the observation.

So **(i), throat erosion, is more consistent**, and it is the same signature as
Vega-C VV22, where the inquiry attributed the second-stage under-pressure to
unexpected erosion of the carbon–carbon throat insert [conf C on the
attribution]. **The measurement to ask for first: post-test throat diameter**,
compared with pre-test. It is a five-minute measurement that discriminates the
two hypotheses outright. Second choice: the pressure-thrust ratio history, i.e.
compute $A_t(t)$ from $F/(C_F p_c)$ and see whether it grows.

**R3.** Structure the comparison in three layers.

*Performance layer.* With the given $\zeta$ values, apply Eq. 3.2 to the
vehicle's actual propellant load and stack mass. From WE1's sensitivity of
roughly 30 m/s per point of $\zeta$ for a booster-class stage, 8 points is
roughly 240 m/s — comfortably more than the 180 m/s shortfall. **Team B closes
the gap on case technology alone; Team A does not**, so Team A must find 180 m/s
somewhere else: more propellant (bigger boosters, if the pad and structure
allow), higher $I_{sp}$ (higher $\varepsilon$, better nozzle), a lighter upper
stage, or a trajectory change.

*Schedule and cost layer.* Three years of delay is not a rounding error; for a
commercial launcher it can be the whole business case. The facility capital cost
must be amortised over the production rate — a low-rate programme cannot pay for
a winding hall, a high-rate one can (this is exactly the P120C logic, where one
motor serves Vega-C and Ariane 6).

*Risk layer.* Team A's technology is in production; Team B is a new facility, a
new process and a first article. The 0.92 is a *prediction*, not a measurement.

*Missing information — a strong answer lists at least four:*
1. Can Team A's 180 m/s be closed another way, and at what mass/cost?
2. What is the flight rate, and therefore the amortisation of B's facility?
3. Is the 0.92 an analysis, a subscale demonstration, or a full-scale article?
4. What is the cost of the four-year option's *extra propellant* if the boosters
   must grow, including pad, transport and structural knock-ons?
5. Is there a customer commitment inside the seven-year window?

*What makes each right.* **A is right** if the Δv shortfall can be closed
cheaply elsewhere, if the flight rate is low, or if there is a hard near-term
commitment. **B is right** if the programme is a long-lived high-rate family
where the facility amortises, if the shortfall cannot be closed any other way, or
if the roadmap needs a larger monolithic motor later that only a coastal site
can produce. A hybrid answer — fly A, develop B for block 2 — is defensible and
should be credited if the candidate prices the cost of qualifying two boosters.

**R4.** Three of the five failure modes in §7.2 are at interfaces — a field
joint, a nozzle throat insert, a nozzle — because interfaces are where the
design's assumptions are least verifiable and where the loads are least
one-dimensional. Specifically: (a) an interface is where two different materials
with different stiffnesses, thermal expansions and erosion rates meet, so the
governing physics is a coupled thermostructural problem rather than a bulk
property; (b) interfaces are where the **manufacturing** and **assembly**
variability lives — a field joint is assembled by people at a pad, a throat
insert comes from a supplier whose process can change; (c) bulk propellant
behaviour is characterised by decades of strand-burner and subscale data and is
statistically well bounded, while a specific joint geometry under a specific
pressurisation transient is characterised by however many tests that programme
ran.

The implication: **qualification budget should be spent on interfaces,
assembly-condition testing and supplier configuration control, not on more bulk
propellant characterisation.** Concretely — instrument joints in every static
test, treat any subcomponent supplier or material-lot change as a design change
requiring requalification (the VV22 lesson), and test at the cold and hot
extremes of the assembly and launch temperature envelope (the STS-51-L lesson).

**R5.**

*The case for.* Requalifying a propellant formulation on a crew-rated vehicle is
an enormous cost — new ballistic characterisation, new ageing data, new
mechanical properties, new hazard classification, new full-scale static tests —
for a performance gain (PBAN → HTPB is worth a few seconds of $I_{sp}$) that SLS
does not need. The steel case segments already exist, are already qualified, and
have flight history; using them converts an inventory into performance. Every
change carries risk, and on a vehicle flying at a rate of about one per year the
learning curve that would justify a change never arrives. NASA changed exactly
what the fifth segment forced it to change — the nozzle, the insulation, the
liner, the avionics — and nothing else [conf A]. That is disciplined
configuration control.

*The case against.* Reusing hardware freezes an architecture that was itself
chosen for a 1970s constraint (inland casting, water recovery, reflight) that no
longer applies — SLS boosters are expended and never recovered, so the whole
reason steel beat composite has evaporated, and the programme is carrying a
6–8-point mass-fraction penalty for a reason that no longer exists. The
inventory is finite by construction, so the change must happen anyway (hence
BOLE); deferring it means paying the development cost later, at a higher rate,
with less schedule margin, and with the workforce that built the original
hardware retired. And an asbestos-filled-insulation, PBAN-propellant, refurbished
1980s-case motor is not a supply chain a programme can sustain for decades.

*Which is stronger.* **[J]** For the first eight flights, the case *for* is
stronger — the cost and risk arithmetic of requalifying a crew-rated booster is
brutal and the mass penalty is muted because SLS boosters push a very heavy stack
(the §3.4 argument). Over the programme's life the case *against* wins, and NASA
evidently agrees, which is why BOLE exists. Evidence that would change the
judgment: a credible flight rate above a few per year (which changes the
amortisation of a new booster entirely), a demonstrated failure or ageing problem
in the refurbished cases, or a payload requirement that the current booster
cannot meet.

### Mini trade study — T1

See K3.

---

## K2. Quiz answers with explanations

**Q1 (8).** Per motor: $14.234/2 = \mathbf{7.117\ MN}$. The second qualifier
still needed is **maximum or average** (and, strictly, the pressure basis — sea
level or vacuum). Full marks require both the division and the naming of the
max/avg qualifier. This is the Titan IV-A UA1207 figure; the source infobox is
per-vehicle and the number is conf C.

**Q2 (8).** **(b)** — a capture feature on the tang that mechanically limits
joint rotation.
(a) is wrong because the elastomer was not the root cause; the joint geometry
was. A better elastomer would have widened the temperature margin without
removing the mechanism. (Note that the redesign *did* include a third O-ring —
but that is a redundancy addition, not the architectural fix.)
(c) is wrong — the putty was part of the problem, not the solution.
(d) is wrong: chamber pressure was not reduced, and lowering it would have cost
performance without addressing rotation.

**Q3 (10).** RSRM: $500{,}000/590{,}000 = \mathbf{0.8475}$.
P120C: $141{,}400/153{,}000 = \mathbf{0.9242}$.
Gap: **7.67 percentage points.** Award full marks only if both are quoted to at
least three figures and the gap is stated in *percentage points*, not per cent.

**Q4 (12).** $m_i = 80{,}000(1/\zeta - 1)$.
$\zeta = 0.85$: $m_i = 14{,}117.6$ kg, $m_0 = 139{,}117.6$, $m_f = 59{,}117.6$,
$\Delta v = 276 \times 9.80665 \times \ln(2.35322) = \mathbf{2316.3\ m/s}$.
$\zeta = 0.92$: $m_i = 6{,}956.5$ kg, $m_0 = 131{,}956.5$, $m_f = 51{,}956.5$,
$\Delta v = 276 \times 9.80665 \times \ln(2.53973) = \mathbf{2522.8\ m/s}$.
**Gain +206.5 m/s (+8.9 %).** Method marks: correct inert-mass expression,
correct inclusion of $m_u$ in *both* $m_0$ and $m_f$ (the most common error is
omitting it from $m_f$), correct $g_0$.

**Q5 (8).** (i) Titan UA1205 → **LITVC with N₂O₄**, injected through exit-cone
ports from external nacelles. (ii) PSLV S139 → **SITVC with aqueous strontium
perchlorate** (roll handled by a separate liquid RCS). (iii) LVM3 S200 → **flex
nozzle ±8° with electro-hydraulic actuators**. (iv) Star 48B → **fixed nozzle,
no TVC** (spin-stabilised; the Star 48BV variant adds TVC and does not spin).
Two marks each.

**Q6 (10).** **Steel → glass filament wound → Kevlar/epoxy → graphite (carbon)/
epoxy**, roughly **20–30 % case-mass reduction per step at equal burst pressure**
[conf B]. Documented non-mass reason: the Trident II D-5 stage-3 change from
Kevlar to graphite/epoxy in 1988 was also made to **eliminate the electrostatic
potential difference between Kevlar and graphite structures** [conf B, `[FAS]`].
6 marks for the ordered progression, 2 for the mass benefit, 2 for the
electrostatic reason.

**Q7 (12).** $I_{sp} = \bar F t_b/(m_p g_0) = 3{,}578{,}200 \times 128/
(205{,}000 \times 9.80665) = \mathbf{227.8\ s}$, against a published **274.5 s
vacuum** — 17 % low, and low even against a plausible sea-level figure of
~240 s.

Which input to challenge: **the average thrust**, because (i) an SL/vacuum basis
change cannot account for a 17 % gap on a modern HTPB/AP/Al motor, (ii) the
published maximum thrust of 5,150 kN and the published $I_{sp}$ are mutually
consistent under a plausible trace while the average is not, and (iii) the same
data set already shows a 0.8 % internal inconsistency in its segment masses, so
it is a multi-source compilation. Also full credit for challenging the burn time
with the calculation that it would have to be 154 s to reconcile, and for noting
that 154 s contradicts the published 128 s. **No credit** for "average the two"
or for asserting that the 274.5 s is wrong without an argument.

**Q8 (10).** One sentence: **the governing constraint is the distance between
the casting plant and the launch pad, which sets the largest piece that can be
transported** — the RSRM is cast in Utah and flown from Florida, so it must ship
in rail-sized segments; P120C is cast at Kourou and Colleferro, so it can be a
single monolithic piece.

Consequences: the RSRM has **three field joints** assembled at the launch site,
each a seal and an insulation discontinuity, and joint rotation under
pressurisation is a real failure mode — the STS-51-L mechanism. P120C has **no
field joints at all**, so that entire class of failure does not exist; its
failure modes migrate to the case winding process, the single large propellant
casting (voids, cracks, bond line over a 141 t grain) and the nozzle.

**Q9 (10).** Both are correct because they are **two different nozzles**: the
short-nozzle configuration at $\varepsilon \approx 47.7$ delivers 286.2 s and the
long-nozzle configuration at $\varepsilon \approx 54.8$–70.4 delivers 292.2 s
vacuum [conf C]. A table quoting one figure as "the Star 48B Isp" without the
nozzle configuration has (i) silently selected a variant, (ii) presented a
configuration difference as though it were a measurement, and (iii) made itself
unusable for a mission analysis, because the 6-second difference is worth about
3 % of GTO payload (WE3). A specific impulse without a configuration and a
pressure basis is not a number.

**Q10 (12).** Two sentences of the form:

> "The manufacturer claims +11 % total impulse over the current five-segment
> booster; this is a contractor figure for a motor that has not flown."
> "The first full-scale static test, on 2025-06-26, ran a 156 ft motor for just
> over two minutes at more than 4 million pounds of thrust from a single booster,
> and an anomaly was observed in the nozzle near the end of the burn."

Why both must appear together: a development motor's claimed performance and its
test anomalies are a **single data set**. Quoting the +11 % alone presents an
unverified projection as a specification and implies a maturity the hardware does
not have; quoting the anomaly alone would be equally unbalanced. Course hard rule
3 requires company-claimed figures for engines in development to be labelled as
claims. Marks: 4 for the claim sentence with the "in development / not flown"
label, 4 for the anomaly sentence with its date and location on the motor, 4 for
the justification.

---

## K3. Trade-study reference solution (T1)

### Setup

Required total impulse per booster $I_t = 4.0\times10^8$ N·s at flight-average
$I_{sp} = 274$ s:

$$m_p = \frac{I_t}{I_{sp} g_0} = \frac{4.0\times10^8}{274 \times 9.80665}
= 148{,}864\ \mathrm{kg}$$

Average thrust: $\bar F = I_t/t_b$ = 3.64 MN at 110 s, 3.08 MN at 130 s. Both are
in family for a 3 m-class booster.

Apply Eq. 3.2 with $m_u = 55{,}000$ kg:

| option | $\zeta$ | $m_i$ (kg) | $m_0$ (kg) | $m_f$ (kg) | Δv (m/s) | vs A |
|---|---|---|---|---|---|---|
| **A** segmented D6AC steel, PBAN, flexseal, inland | 0.85 | 26,270 | 230,134 | 81,270 | **2796.9** | — |
| **B** segmented maraging steel, HTPB, SITVC, inland | 0.83 | 30,490 | 234,354 | 85,490 | **2709.7** | −87.2 |
| **C** monolithic carbon fibre, HTPB, EMA flexseal, new coastal site | 0.92 | 12,945 | 216,809 | 67,945 | **3117.8** | **+320.9** |
| **D** bought-in monolithic composite | 0.90 | 16,540 | 220,404 | 71,540 | **3023.4** | +226.6 |

### The recommendation

**Recommend D as the baseline, with C as the block-2 upgrade — unless the flight
rate is high enough to amortise the coastal facility, in which case go straight
to C.** [**J**]

Reasoning:

1. **B is dominated and should be eliminated first.** It is worse than A on Δv
   (−87 m/s) because SITVC injectant and tankage sit in the inert mass, and it
   buys nothing A does not have: same inland site, same segmentation, same joint
   count, and it introduces a fluid-injection subsystem with its own qualification
   programme. Its only merit is a non-toxic injectant relative to an N₂O₄ LITVC —
   but nobody is proposing N₂O₄ here, so that merit is unclaimed. A candidate who
   does not eliminate B explicitly has not done the trade.
2. **C is the performance answer and the strategic answer.** +321 m/s over A, no
   field joints, and the only option with a growth path to a larger monolith. It
   is also the current-practice architecture (P120C, GEM-63XL, SRB-A3). The
   objection is entirely economic and schedule-based: the facility costs three
   years of booster production budget, which only amortises at rate.
3. **D captures most of C's benefit with none of the capital.** +227 m/s over A
   for zero facility investment. The cost is strategic: no roadmap control, a
   single point of supply, and a competitor may own the supplier. That is a
   business risk, not an engineering one, and it should be named as such.
4. **A is the low-risk default and should not be dismissed.** If the mission does
   not need the extra 227–321 m/s, A is in production, proven and cheap. The
   trap is assuming performance is free; A's mass penalty only matters if it is
   on the critical path to the mission requirement.

### The two pieces of information to demand before signing

1. **The programme's committed flight rate over ten years**, because it decides
   whether C's facility amortises and whether D's single-supplier risk is
   tolerable. Nothing else in the trade moves the answer as much.
2. **The actual Δv requirement and its margin** — is the vehicle short by
   200 m/s, or is it comfortable? If A meets the requirement, most of this
   analysis is decoration.

Also strong: the provenance of each quoted $\zeta$ (analysis, subscale, or
full-scale article), and whether the inland plant's transport route can even
accommodate the segment size at 3 m class diameter.

### Rubric

A strong answer contains:

- The propellant-mass calculation from total impulse (2 marks) and a Δv figure
  for **all four** options with the stack mass in both $m_0$ and $m_f$ (6 marks).
- Explicit elimination of B with the reason that its inert mass includes the
  injectant system (3 marks).
- A statement that the **transport constraint** is what forces A and B to be
  segmented, and that C and D escape it by being cast coastally or bought in
  (4 marks).
- Non-performance factors named and separated from performance: capital cost and
  its amortisation, schedule, supply-chain control, qualification risk, joint
  count as a reliability term (5 marks).
- A recommendation with a stated condition that would flip it (3 marks).
- The two information demands, with a reason each (2 marks).

Marks are lost for:

- Recommending C on Δv alone without pricing the facility, or recommending A on
  cost alone without checking the Δv requirement (−4).
- Omitting $m_u$ from the burnout mass, which inflates every Δv (−4; this is the
  single most common error).
- Treating $\zeta$ as a property of the case material rather than of the stage —
  B's 0.83 is a TVC decision, not a steel decision (−3).
- Quoting a Δv difference to four significant figures when the inputs are
  one-or-two-figure planning numbers (−2).
- Ignoring that C's 0.92 is a prediction for hardware that does not exist (−2).

---

## K4. Common wrong answers

**Omitting the upper stack from the burnout mass.** By far the most frequent
error in every Δv problem in this module. Students compute
$\Delta v = I_{sp} g_0 \ln[(m_p + m_i + m_u)/m_i]$, forgetting that the stack
above the booster is still there at burnout. It inflates Δv by hundreds of m/s
and it inverts the conclusion of C2, because it removes exactly the term that
mutes the $\zeta$ sensitivity for boosters. What it reveals: the student is
pattern-matching on the rocket equation rather than asking what mass is actually
being accelerated at the end of the burn.

**Treating mass fraction as a case-material property.** "PSLV S139 is 0.821, so
maraging steel is a bad case material." No: the S139's inert mass includes SITVC
injectant and tankage and a segmented architecture. $\zeta$ is a **stage**
property. The same error in the other direction produces "Zefiro 9A is 0.881, so
composite is no better than steel," which ignores that Zefiro 9A is a 12 t motor
and GEM-40 is a 13 t motor at 0.908 — small motors carry fixed overheads.

**Using a peak thrust as an average.** Multiplying 14.7 MN by 123 s gives a
total impulse 37–52 % too high, and back-computing $I_{sp}$ from it gives 369 s
for an APCP motor, which is thermodynamically impossible. The tell is always the
implausible $I_{sp}$; a student who never back-checks never catches it.

**Using a per-vehicle thrust with a per-motor mass.** The Titan IV trap. It
usually shows up as a thrust-to-weight ratio that is twice what any booster
achieves, or a mass fraction above 1.0, both of which should stop the
calculation.

**Quoting "the" Star 48B Isp.** Picking 292.2 s because it is the better number,
or 286.2 s because it appeared first, without stating the nozzle. It reveals a
student who treats published tables as measurements rather than as
configuration-dependent specifications.

**Believing Ariane 5's "270,000 kg propellant."** Producing a mass fraction of
0.98–0.99 and not stopping. Any solid-motor mass fraction above about 0.95 should
trigger an immediate audit; 0.98 is not achievable with a case, insulation, a
nozzle and an igniter.

**Averaging away an inconsistency.** Given the LVM3 S200's 227.8 s implied
$I_{sp}$ against a published 274.5 s, students split the difference or quote a
range. Both numbers cannot be right on the same basis; the correct response is to
identify which input is least trustworthy and say so. Averaging inconsistent data
manufactures a number that no source supports.

**Explaining the Challenger joint failure as a materials problem.** "They should
have used a silicone O-ring." This misses the mechanism entirely: the gap opened
because the joint rotated. It reveals a student who reads a failure report for
the component that broke rather than for the load path that broke it — the single
most valuable habit this module is trying to build.

**Treating BOLE's +11 % as a specification.** Quoting an unflown contractor
figure without the label, and without the DM-1 nozzle anomaly. It reveals a
student who has not internalised the difference between a claim and a
measurement, which is the difference course hard rule 3 exists to enforce.

**Assuming segmentation is obsolete.** "Nobody segments any more, composites
won." The Titan SRMU was a segmented *composite* motor in 1997, and RSRMV is a
segmented steel motor flying today, because both are cast far from their pads.
Segmentation is a transport answer, not a materials answer.
