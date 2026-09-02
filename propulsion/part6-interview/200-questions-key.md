# 200 Propulsion Interview Questions — Answer Key

Part VI · Companion to [`200-questions.md`](200-questions.md)

Each entry gives a **model answer** at the depth a strong candidate delivers
out loud — typically three to eight sentences, with the full arithmetic where
the question is quantitative. Under each answer:

- **Probing** — one line on what the interviewer is actually testing. This is
  usually not the surface topic.
- **Follow-up** — the question they will ask next, where there is an obvious
  one. Prepare that answer too; a candidate who has clearly stopped thinking
  at the first answer is easy to spot.

**Numbers.** Every quantitative answer was computed with
[`tools/rocket.py`](../tools/rocket.py) and is registered in
[`tools/examples/q200.py`](../tools/examples/q200.py); run
`python3 tools/check_examples.py` to reproduce them. Real-engine figures come
from [`reference/_verify-liquid.md`](../reference/_verify-liquid.md),
[`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
and [`reference/engine-database.md`](../reference/engine-database.md), with
their confidence labels and contested-figure notes carried across. Where a
worksheet says a figure is a company claim or is contested, this key says so
too; an interview answer that launders a claim into a fact is a worse answer
than one that flags it.

**Epistemic tags** are as in the course README: [F] fundamental, [E]
empirical, [H] historical, [M] modern practice, [R] research, [A]
approximation, [J] judgment.

---

## Beginner (1–50)

### 1. [M01, M03]
Draw the control volume around the engine, cutting the propellant feed inlets
and the nozzle exit plane. Momentum conservation gives
$F = \dot m v_e + (p_e - p_a)A_e$: the first term is the rate at which
momentum leaves the control volume, the second is the net pressure force on
the closed surface. The pressure term is not the exhaust shoving against the
atmosphere — it is the residual of integrating pressure over the whole outside
of the engine, where $p_a$ acts everywhere except the exit disc, and over the
inside, where the chamber and nozzle walls see combustion pressure. [F] You can
draw a different control volume — one that follows a streamtube to where the
plume has fully expanded to ambient — and get the same thrust with no exit
pressure term at all, which proves the term is bookkeeping, not physics. It
matters because it is the reason thrust rises with altitude on a fixed engine
by $ (p_a^{SL})A_e$, roughly 15–20 % for a first-stage nozzle.

**Probing:** whether you understand thrust as a control-volume result rather
than a memorised formula — and whether you can be trusted with a sign.
**Follow-up:** "So why does an engine on a test stand at sea level read lower
than the same engine in an altitude cell, if nothing about the combustion
changed?"

### 2. [M03]
Specific impulse is total impulse per unit propellant consumed. In coherent SI
that is the effective exhaust velocity $c = F/\dot m$ in m/s; the "seconds"
version is $I_{sp} = c/g_0$, i.e. impulse per unit propellant *weight* at
Earth's surface. [F] $g_0 = 9.80665$ m/s² is a defined constant, not local
gravity — it is a unit conversion and nothing more, which is why $I_{sp}$ in
seconds is the same number on Mars. The seconds convention survives because it
is numerically identical in metric and US customary units, which mattered
enormously in 1960 and matters not at all now. If you are ever unsure, work in
m/s and convert at the end.

**Probing:** whether you know $g_0$ is a conversion constant. A surprising
number of candidates think $I_{sp}$ changes with local gravity.
**Follow-up:** "Give me the exhaust velocity of an engine with 450 s vacuum
$I_{sp}$." (4413 m/s.)

### 3. [M01, M02]
Stagnation enthalpy $h_0 = h + v^2/2$ is conserved because the nozzle is
adiabatic and does no shaft work, so the steady-flow energy equation reduces to
$h_0 = \mathrm{const}$ — this holds even across a shock and even with
friction. [F] Stagnation *pressure* is not conserved because it is an entropy
statement, not an energy statement: $p_0$ falls whenever entropy is generated,
which happens through wall friction, shock waves, heat addition and
non-equilibrium chemistry. In an ideal isentropic nozzle both are conserved; in
a real one, the drop in $p_0$ is exactly the measure of how far from ideal you
are. That is why nozzle efficiency is fundamentally a stagnation-pressure-loss
accounting problem.

**Probing:** whether you can separate the first law from the second law.
**Follow-up:** "Where in a rocket nozzle is stagnation pressure lost fastest?"

### 4. [M02]
Choking means the mass flux per unit area has reached its maximum for the given
stagnation state, and downstream conditions can no longer send information
upstream. Physically, disturbances propagate at the speed of sound relative to
the fluid; once the local flow speed equals the local sound speed, no pressure
signal from downstream can travel back through the throat. [F] The Mach number
locks at exactly 1 because the quasi-1D area–velocity relation
$\frac{dA}{A} = (M^2-1)\frac{dv}{v}$ has $dA = 0$ at either $M = 1$ or
$dv = 0$; at the minimum area of an accelerating flow the only consistent
solution is $M = 1$. The consequence for engines is that $\dot m$ depends only
on $p_c$, $T_0$, gas properties and $A_t$ — which is exactly what makes $c^*$ a
meaningful measurement.

**Probing:** whether "choked" is a physical concept for you or a word.
**Follow-up:** "If I drop the ambient pressure to a hard vacuum, does the mass
flow change?"

### 5. [M02, M09]
A converging nozzle can only accelerate a flow to $M = 1$ at its exit, because
in subsonic flow area reduction accelerates and in supersonic flow it
decelerates. To go supersonic you must pass through $M = 1$ at a minimum area
and then *increase* area, because above $M = 1$ the density falls faster than
the velocity rises, so continuity demands a growing cross-section. [F] A purely
converging nozzle would give you sonic exhaust — for a typical combustion gas
around 1000–1200 m/s, so an $I_{sp}$ of roughly 110 s. The diverging section is
what turns that into 3000–4500 m/s, so it is worth a factor of three in
performance and is not optional.

**Probing:** the area–velocity relation, and whether you can quote the size of
the prize.
**Follow-up:** "What sets the limit on how far you can keep expanding?"

### 6. [M03]
$c^* = p_c A_t/\dot m$ contains everything upstream of and including the
throat: propellant chemistry, flame temperature, molecular mass, combustion
completeness, mixing quality. $C_f = F/(p_c A_t)$ contains everything
downstream of the throat: expansion ratio, nozzle contour, ambient pressure,
divergence and separation. [F] Their product is the effective exhaust velocity,
$I_{sp} = c^* C_f/g_0$. The dividing line is the throat, and it is a real
dividing line precisely because the throat is choked — nothing downstream can
influence the chamber. The practical value is diagnostic: if an engine
underperforms, $\eta_{c^*}$ tells you to look at the injector and
$\eta_{C_f}$ tells you to look at the nozzle, and you can measure both
separately on one test.

**Probing:** whether you use the split diagnostically or just recite it.
**Follow-up:** "Which of the two is easier to measure accurately, and why?"

### 7. [M01, M03, M04]
The one with $\mathcal{M} = 12$, by roughly $\sqrt{2} \approx 1.41$. Ideal
$c^* = \sqrt{R T_0}/\Gamma(\gamma)$ with $R = R_u/\mathcal{M}$, so
$c^* \propto \sqrt{T_0/\mathcal{M}}$ at fixed $\gamma$. [F] Halving molecular
mass at constant temperature therefore buys 41 %, whereas you would have to
*double* the flame temperature to get the same gain — and flame temperature is
capped by dissociation and by what the wall can survive, while molecular mass
is a chemistry choice that costs you nothing thermally. This is the entire
argument for hydrogen: LOX/LH2 does not burn especially hot, it produces a very
light exhaust ($\mathcal{M} \approx 13.5$ against 23 for kerolox).

**Probing:** whether you know which lever is worth pulling. The
$\sqrt{T_0/\mathcal{M}}$ grouping is the single most useful scaling in
propulsion.
**Follow-up:** "So why not run LOX/LH2 at O/F 3, where the exhaust is even
lighter?"

### 8. [M04]
A heat of combustion tells you the energy released to a fixed set of products
at a reference temperature; a rocket chamber does not produce that set of
products and is not at that temperature. The two effects you must capture are
**dissociation** — at 3500 K a large fraction of H₂O and CO₂ is broken into
OH, H, O, CO, which absorbs energy and caps the flame temperature — and the
**temperature dependence of the composition itself**, since the equilibrium
mix and hence $c_p$, $\gamma$ and $\mathcal{M}$ all shift with $T$. [F] CEA
solves this by minimising Gibbs free energy over all candidate species at the
given pressure and enthalpy, iterating to a self-consistent temperature and
composition `[CEA]`. Ignoring dissociation typically overpredicts flame
temperature by several hundred kelvin and $I_{sp}$ by 5–10 %.

**Probing:** whether you know what a CEA run is actually doing, or treat it as
a black box that emits $I_{sp}$.
**Follow-up:** "Does dissociation cost you performance, or does recombination
in the nozzle get it back?"

### 9. [M05, M32]
First, bulk density: LOX/LH2 at O/F 6 has a bulk density around 360 kg/m³
against roughly 1030 kg/m³ for kerolox, so tanks are about three times the
volume for the same propellant mass, and on a first stage that mass is
dominated by dry structure and drag, not by $I_{sp}$. Second, thrust-to-weight
and operability: hydrogen engines are large, low-density-flow machines with
big turbomachinery, and liquid hydrogen at 20 K forces insulation, boil-off
management and a much harder ground operation. [F][J] The clean way to say it
is that a first stage is a density-impulse problem and an upper stage is an
$I_{sp}$ problem — LOX/RP-1 has roughly twice the density impulse of LOX/LH2.
The Saturn V is the canonical statement of this: kerolox S-IC underneath,
hydrogen S-II and S-IVB above.

**Probing:** whether you have internalised that $I_{sp}$ is not the objective
function.
**Follow-up:** "Where does methane sit on that trade?"

### 10. [M05, M08]
Hypergolic means the propellants ignite on contact with no external energy
source, because the chemistry has a fast, exothermic, low-activation-energy
initiation path — classically an amine fuel such as MMH or UDMH with a
nitrogen-tetroxide-based oxidiser. The advantage is ignition reliability and
restart: no igniter to fail, no spark, no pyrotechnic cartridge, so it is the
default for spacecraft engines that must light after years in orbit — the
Apollo SPS, the Shuttle OMS, and the R-4D class of thrusters all rely on it.
[F][H] The cost is toxicity and handling: NTO and hydrazines require SCAPE
suits, dedicated facilities and long propellant-loading timelines, which is
real money and real schedule. There is also an ignition-delay hazard — if the
propellants pool before they light, you get a hard start.

**Probing:** whether you name the operational cost, not just the chemistry.
**Follow-up:** "What is ignition delay, and why does it matter more at low
temperature?"

### 11. [M06]
$L^* = V_c/A_t$ is the chamber volume divided by throat area, with units of
length. It is a proxy for **residence time**: the characteristic time a
propellant particle spends in the chamber before being swept out through the
throat, since $t_{res} \approx L^* \rho_c / (\text{mass flux})$. [E] If $L^*$
is too small, propellant leaves before atomisation, vaporisation and mixing are
complete, and $\eta_{c^*}$ falls — you literally burn part of your propellant
in the nozzle or outside it. Typical values are 0.8–1.3 m for LOX/RP-1,
shorter for hypergolics and pre-vaporised hydrogen, and the trade against it is
mass, cooled surface area and low-frequency stability, so nobody uses a bigger
$L^*$ than they must.

**Probing:** that $L^*$ is a time in disguise, and that bigger is not free.
**Follow-up:** "What happens to chug stability if you increase $L^*$?"

### 12. [M07, M15]
Two reasons, and the second is the important one. First, the injector pressure
drop is what sets and stabilises the flow split: $\dot m \propto \sqrt{\Delta
p}$, so a large drop makes each element's flow insensitive to chamber-pressure
wobble and to manifold pressure variation across the face. Second, and more
critically, it **decouples the feed system from the chamber**: if $\Delta
p_{inj}$ is small compared to $p_c$, a chamber pressure oscillation feeds
straight back into the flow rate, closing a loop and producing chug. [F][E] The
15–25 % rule of thumb is the empirical margin at which that coupling is weak
enough. The drop also does useful work — it is the energy source for
atomisation, since injection velocity and hence Weber number come from it.

**Probing:** whether you can connect injector $\Delta p$ to stability, not just
to spray quality.
**Follow-up:** "What is the cost of that 20 %, in terms of the rest of the
vehicle?"

### 13. [M08, M13, M14]
Chill down the pump and lines with cryogen until inlet temperatures are stable
and the pump is not ingesting vapour; spin the turbopump using a start
cartridge, a stored-gas start tank, or tank head, depending on the cycle; open
the igniter circuit and confirm ignition (spark on, torch light, or hypergolic
slug fired); then open the main propellant valves in a sequence with a small
lead on one propellant; then ramp the main valve or the gas generator/preburner
to mainstage and hand over to closed-loop control. [F][M] The sequencing exists
because each step must be *confirmed* before the next commits more propellant —
the whole design intent is that no step puts a large mass of unburnt
propellant into the chamber before there is an established flame. Every hard
start in history is a violation of that principle.

**Probing:** whether you understand the sequence as a series of verified
commits, not a list to memorise.
**Follow-up:** "Which propellant do you lead with, and why does the answer
depend on the propellant combination?"

### 14. [M02, M09]
Over-expanded means $p_e < p_a$: the nozzle has expanded the flow below ambient
pressure, so the pressure term in the thrust equation is negative and, if the
mismatch is large enough, the exit flow separates from the wall. Under-expanded
means $p_e > p_a$: the flow is still at higher-than-ambient pressure at the
exit and continues to expand outside the nozzle, which is a loss of available
work but is structurally benign. [F] A sea-level first stage runs
over-expanded at lift-off and moves toward under-expanded as it climbs,
because the nozzle is sized for a compromise altitude — you accept a few
percent of $C_f$ at sea level to gain much more over the rest of the trajectory.
Design practice is to sit just inside the separation limit at sea level.

**Probing:** the sign convention and the fact that a first stage deliberately
lives on the bad side of optimum at lift-off.
**Follow-up:** "How do you know how far over-expanded you can safely go?"

### 15. [M10]
Peak heat flux is at or just upstream of the throat, typically 30–160 MW/m² in
a high-pressure engine. The gas is slightly *cooler* there than in the chamber
because it has already begun to expand, but heat flux goes as the product of
the heat-transfer coefficient and the driving temperature difference, and the
coefficient scales roughly as $(A_t/A)^{0.9}$ in the Bartz correlation — i.e.
with the local mass flux per unit area, which is by definition maximal at the
throat. [E] Higher velocity and density mean a thinner boundary layer and a
much larger convective coefficient. That is why the throat is where the cooling
channels are narrowest and fastest, and where liners fail.

**Probing:** whether you distinguish driving temperature from transfer
coefficient.
**Follow-up:** "Roughly what heat flux would you expect at the throat of a
200 bar engine?"

### 16. [M11]
One of the propellants — usually the fuel — is routed through channels or tubes
in the chamber and nozzle wall before being injected, so the wall is cooled
convectively by a liquid at high velocity. The heat absorbed is not lost: it is
carried into the chamber with the propellant and shows up as extra enthalpy in
the combustion gas, so a regenerative circuit is very nearly thermodynamically
free. [F] The design closes when the gas-side flux, the wall conduction and the
coolant-side coefficient give a wall temperature the material survives for the
required life, at a coolant pressure drop the feed system can pay for. In an
expander cycle that absorbed heat is doing double duty: it is also the entire
energy source for the turbopump.

**Probing:** whether you say "the heat comes back". Candidates who think
regenerative cooling is a loss have not thought about it.
**Follow-up:** "What limits the pressure drop you can accept in the circuit?"

### 17. [M12, M33]
A pressure-fed system buys simplicity and reliability: no turbomachinery, no
start transient to speak of, no bearings or seals, and a far shorter
development. It costs tank mass, because the tanks must hold the full chamber
pressure plus injector and line drops, and tank mass scales with pressure ×
volume. [F][J] The deciding quantity is the product of chamber pressure and
propellant volume — equivalently, the total impulse at the required $p_c$. Small
in-space stages and RCS systems are pressure-fed almost universally; anything
that needs high $p_c$ and a lot of propellant must be pump-fed, because the
tank walls would otherwise weigh more than the payload. The AJ10 SPS and the
LMDE are the classic pressure-fed examples; every booster engine is pump-fed.

**Probing:** whether you can state the trade as a scaling law rather than a
list of pros and cons.
**Follow-up:** "At what chamber pressure does pressure-feeding stop making
sense?"

### 18. [M13]
An open cycle dumps the turbine drive gas overboard — a gas generator or a
bleed — so that flow does work on the turbine but expands through a low-area-
ratio duct at poor efficiency instead of through the main nozzle. A closed cycle
routes all the turbine exhaust into the main chamber, so every gram of
propellant is expanded through the full nozzle. [F] The open-cycle penalty is
typically 1–3 % of flow diverted at an $I_{sp}$ of perhaps 100–150 s against a
main-chamber 340–450 s, which works out to roughly 5–15 s of engine $I_{sp}$,
or 2–4 %. You buy back development cost, lower turbine inlet pressure, and a
far more forgiving power balance — which is why the F-1, the J-2 and the Merlin
are all gas generator engines and are all perfectly good engines.

**Probing:** whether you can put a number on the penalty rather than saying
"open is less efficient".
**Follow-up:** "Work out the engine $I_{sp}$ if 3 % of flow leaves at 130 s and
the rest at 340 s."

### 19. [M14, M08]
Valve sequencing sets the mixture ratio during the milliseconds when the
chamber is filling but not yet burning, and that transient mixture ratio
determines whether you get a smooth light or an explosion. Leading with the
propellant that produces the less energetic and less detonable accumulation is
the rule; in practice most LOX engines lead with fuel, so the initial mixture
in the chamber is fuel-rich rather than oxidiser-rich, which is both cooler and
much kinder to the injector face and chamber wall. [F][J] The other reason is
hardware: an oxidiser-rich transient in a LOX engine can ignite the metal
itself. Hypergolic engines have the opposite constraint — you want both
propellants arriving nearly together, because a large lead lets one pool.

**Probing:** whether you connect a valve schedule to a materials failure mode.
**Follow-up:** "What would you see on the $p_c$ trace if the lead were
backwards?"

### 20. [M15]
Chug is a low-frequency instability, roughly 10–400 Hz, driven by coupling
between the feed system and the chamber: a chamber pressure rise reduces
injector $\Delta p$, which reduces flow, which reduces pressure, with the
chamber filling time and the feed-line inertance setting the period. It
implicates the injector pressure drop and the feed system, and the fix is more
$\Delta p$, a cavitating venturi, or changed line compliance. Screech (or
screaming) is high-frequency, roughly 1–10 kHz, and is an acoustic mode of the
chamber itself coupling to the combustion response; it implicates the injector
element pattern and the chamber geometry, and the fixes are baffles, acoustic
cavities and changes to element spacing or impingement. [F][E] The practical
distinction is that chug will not usually destroy an engine and screech will —
high-frequency modes scrub away the boundary layer and burn through a wall in
under a second.

**Probing:** frequency band, mechanism, and correct fix for each — this is the
single most commonly asked instability question.
**Follow-up:** "Which one killed engines during F-1 development, and what did
Rocketdyne do about it?"

### 21. [M10, M11, M16]
Because the wall never reaches gas temperature. Copper's value is its thermal
conductivity — around 320–380 W/(m·K) for alloys like NARloy-Z — which lets it
carry 50–160 MW/m² through a wall under a millimetre thick with only a
100–200 K drop, dumping the heat into the coolant before the hot face can climb.
[F] The hot-gas-side wall sits at 700–900 K, comfortably below copper's melting
point, and the design constraint is not melting at all but low-cycle fatigue
from the thermal strain cycle. A low-conductivity superalloy in the same place
would need a much larger temperature drop across the wall to pass the same flux,
which would put the hot face above its own melting point. This is why the RS-25
uses a NARloy-Z (Cu-Ag-Zr) liner with an electroformed nickel closeout.

**Probing:** whether you reason from flux and conductivity rather than from
melting points.
**Follow-up:** "So why is the RS-25 nozzle a nickel-alloy tube wall rather than
copper?"

### 22. [M17]
Internal conformal cooling channels of arbitrary cross-section and path — you
can vary channel height, width and helix along the contour without a
manufacturable-tool constraint, which lets you put cooling exactly where the
flux is instead of where a milling cutter can reach. And integrated
manifolds and injector bodies: swirl passages, distribution manifolds and
element internals printed as one part, removing hundreds of braze joints and
welds, each of which was a leak path and an inspection. [M] SpaceX's SuperDraco
chamber and a large fraction of modern channel-wall nozzles are the standard
examples `[Gradl22]`. The second-order benefit is cycle time — an injector
iteration that took months of tooling now takes days, which changes how a
development programme is run.

**Probing:** whether you name a *geometric* capability rather than saying "AM
is faster and cheaper".
**Follow-up:** "What did AM make harder?"

### 23. [M18]
Chamber pressure at the injector face; thrust from a calibrated load cell;
propellant mass flow on each side, usually by turbine or Coriolis meter, plus
tank level or weight as a cross-check; propellant inlet temperatures and
pressures; valve positions and timings; high-frequency chamber pressure for
stability; and wall or coolant temperatures. [M] If I could keep only one it
would be **chamber pressure**, because with a known throat area it gives you
$c^*$ (with flow) and it is the primary indicator of essentially every failure
mode — ignition, instability, throat erosion, flow anomalies all show up in
$p_c$ first. Thrust is the number the customer buys, but $p_c$ is the number
that tells you what happened.

**Probing:** whether you have thought about instrument priority, which is what
you actually do when a stand has limited channels.
**Follow-up:** "How accurately can you really measure throat area, and what
does that do to your $c^*$?"

### 24. [M19]
An **oxidiser**, almost always ammonium perchlorate, which supplies the oxygen
and typically makes up 65–70 % of the mass; a **metallic fuel**, almost always
aluminium at 16–19 %, which raises flame temperature and density; and a
**polymeric binder** — HTPB now, PBAN historically — at 8–14 %, which is both
the structural matrix holding the grain together and a fuel in its own right.
[F] Minor constituents do the real engineering: curing agents, plasticisers,
bonding agents at the AP/binder interface, and burn-rate modifiers such as iron
oxide. The Shuttle RSRM's published composition is AP 69.6 %, Al 16 %, iron
oxide 0.4 %, PBAN 12.04 %, epoxy curative 1.96 %, which is worth memorising as
the canonical example.

**Probing:** whether you know the binder is structural, not just glue.
**Follow-up:** "Which of those percentages would you change to raise burn rate,
and what does it cost you?"

### 25. [M20]
Saint-Robert's (Vieille's) law is $r = a p_c^n$, an empirical fit of linear
burn rate to chamber pressure over a limited pressure range, with $a$ carrying
the units and the initial-temperature dependence and $n$ typically 0.2–0.5 for
composite propellants. [E] The stability requirement comes from the equilibrium
condition: mass generated $= \rho_p A_b r$ must equal mass discharged
$= p_c A_t/c^*$, giving $p_c = (a \rho_p c^* K_n)^{1/(1-n)}$. If $n < 1$, a
small pressure rise increases discharge faster than generation and the motor
returns to equilibrium; if $n \ge 1$ the exponent diverges and any perturbation
runs away — the motor either extinguishes or bursts. [F] This is why $n$ near
or above 1 is disqualifying regardless of how attractive the propellant looks
otherwise.

**Probing:** whether you can derive the stability criterion rather than
recalling "n must be less than one".
**Follow-up:** "What is $\pi_K$, and why do you care about it for a missile?"

---

### 26. [M21]
The terms describe how burning surface area $A_b$ evolves as the web is
consumed, and since $p_c \propto K_n^{1/(1-n)}$ and thrust $\propto p_c$, the
$A_b$ history *is* the thrust trace. Progressive means $A_b$ grows — an
internal-burning cylindrical bore (BATES) is the archetype, because the port
diameter increases as it burns. Regressive means $A_b$ shrinks — an
end-burning (cigarette) grain of constant cross-section is neutral, but any
externally burning or rod-and-tube outer surface is regressive. Neutral means
$A_b$ is roughly constant, and the standard ways to get it are a star
perforation, a wagon-wheel, or a slotted-tube where the growing bore area is
offset by shrinking slot area. [F] In practice large motors combine geometries
along their length — the Shuttle RSRM uses an 11-point star forward and
double-truncated-cone perforations aft to shape a deliberately regressive
mid-burn dip that keeps the vehicle inside its max-Q load box.

**Probing:** whether you connect grain geometry to a *vehicle* requirement
rather than treating it as a shape catalogue.
**Follow-up:** "Why would a vehicle deliberately want a thrust dip?"

### 27. [M22, M26]
Because case mass is inert mass that must be accelerated the whole way, and a
filament-wound composite case carries hoop and helical loads along the fibre
direction at a far higher specific strength than isotropic steel. The one
number is **propellant mass fraction**: the segmented D6AC steel Shuttle SRB
sits at about 0.85, while the monolithic carbon-fibre filament-wound P120C is
0.924. [B, from `_verify-solid-coldgas.md`] That difference — roughly 7 points
of the total motor mass moving from structure to propellant — is worth a large
fraction of a stage's $\Delta v$ and it is why every new solid stage that does
not have a transport constraint is filament wound. The cost is that composite
cases cannot be segmented easily, are harder to inspect, and fail differently.

**Probing:** whether you reach for mass fraction, which is the correct figure
of merit for a solid stage.
**Follow-up:** "So why are the SLS boosters still segmented steel?"

### 28. [M23]
First, it keeps the case below the temperature at which its strength collapses
— for a steel case that is a few hundred kelvin, and the case is holding 6 MPa,
so this is a structural requirement, not a comfort one. Second, it protects
regions the propellant does not cover for the whole burn: the forward dome, the
slots, the joints and the aft closure are exposed to combustion gas for
progressively longer as the web burns back, and the insulation is the only
thing standing between the gas and the case. [F] The aft end needs more because
it is exposed longest — the propellant burns away from the aft closure early
and the aft region then sees the full burn duration of hot, particle-laden,
high-velocity gas, with aluminium oxide impingement adding erosive attack that
the forward dome never sees.

**Probing:** whether you know insulation thickness is a *time-of-exposure* map,
not a constant.
**Follow-up:** "How do you size it, given that the char layer does the
insulating?"

### 29. [M24, M09]
Because a solid motor's throat has to survive one burn of 60–150 s, and there
is no coolant available — the propellant is a solid, so there is nothing to
route through a channel. The design therefore accepts a sacrificial ablative or
a high-temperature carbon material and budgets the erosion, typically a few
percent of throat area over the burn. [F][J] A liquid engine has a coolant by
construction and may need to fly dozens of times, so it holds throat area
constant to a fraction of a percent — an eroding throat would change $p_c$,
$C_f$ and mixture ratio flight to flight and would eventually violate the
performance spec. The consequence is that solid motor performance predictions
must include the throat area history, which is why nozzle-material
qualification is a performance issue and not just a structural one.

**Probing:** whether you see erosion as a budgeted design allowance rather than
a failure.
**Follow-up:** "Which way does chamber pressure move as the throat erodes, and
what happens to thrust?"

### 30. [M25]
Because the propellant must bond structurally to the liner and case, and
because you cannot handle a 100-tonne monolithic rubber casting any other way.
The grain is a structural member: it carries its own weight, survives
acceleration and thermal cycling, and must not debond from the case wall,
because a debond gives combustion gas a path to the case and an uncontrolled
increase in burning surface. [F] Casting in place, over a liner applied to the
insulated case and around a mandrel that forms the port, produces that bond
directly and lets the grain cure under controlled conditions in its final
geometry. The alternative — cartridge-loading a separately cast grain — is used
for small tactical motors where the grain is small enough to handle and a free-
standing grain is acceptable, but it wastes volume and cannot scale.

**Probing:** whether you treat the grain as structure.
**Follow-up:** "What does the mandrel extraction do to the bore, and what
defect does it cause?"

### 31. [M27, M32]
Storability and readiness: a solid motor sits sealed and loaded for decades and
fires on command in milliseconds, with no propellant loading, no cryogens and
no ullage settling — a liquid ICBM has to be either kept fuelled with toxic
storables or fuelled before launch, and both were operational disasters.
Second, simplicity and survivability: no turbopumps, no feed system, no
valves in the propellant path, so far fewer failure modes to maintain over a
30-year deployed life and far more tolerance of shock and vibration. Third,
density impulse and packaging: a solid stage puts more total impulse into a
fixed silo or launch-tube volume than a liquid stage of the same length. [F][H]
The costs — no throttling, no shutdown except by a destructive thrust
termination, and lower $I_{sp}$ — are acceptable for a mission whose trajectory
is fixed and whose figure of merit is readiness.

**Probing:** whether "readiness" appears before "$I_{sp}$".
**Follow-up:** "How *do* you terminate thrust on a solid, and what does it cost
you?"

### 32. [M28]
Because there is no combustion, so the stagnation temperature is whatever the
tank is — around 300 K — instead of 3000–3600 K. $I_{sp} \propto
\sqrt{T_0/\mathcal{M}}$, and the nozzle is doing its job perfectly well; it
simply has almost no thermal energy to convert. [F] For nitrogen at 300 K with
$\gamma = 1.40$, $\mathcal{M} = 28.014$, the ideal vacuum $I_{sp}$ at
$\varepsilon = 50$ is 76.8 s `[CALC]`, and a real thruster delivers about 90 %
of that, so 65–73 s. The trade is deliberate: what cold gas buys is absolute
simplicity, no contamination, no ignition, indefinite restartability and
millinewton-level impulse bits, all of which a chemical thruster struggles to
provide.

**Probing:** whether you attribute the low $I_{sp}$ to temperature rather than
to something wrong with the nozzle.
**Follow-up:** "How much would you gain by heating the gas to 500 K, and what
would that cost?"

### 33. [M28, M30, M31]
Because propellant $I_{sp}$ is not the system figure of merit — impulse per
unit *stored volume and tank mass* is. Helium at 241 bar stores at only about
0.04 g/cm³, so a helium system needs an enormous high-pressure COPV, and the
tank mass swamps the $I_{sp}$ advantage on any small vehicle. Helium also leaks
through seals and even through some materials at rates nitrogen does not, which
is fatal for a multi-year mission. [F][E] Nitrogen at 0.28 g/cm³ is seven times
denser stored, and a self-pressurising liquid like R-236fa at 1.36 g/cm³ and
2.7 bar is thirty times denser and needs a thin-walled can rather than a
pressure vessel. For a CubeSat, the tank *is* the system.

**Probing:** whether you can reframe a propellant question as a system-mass
question.
**Follow-up:** "Where would helium win?"

### 34. [M29, M30]
Blowdown has no regulator: the tank pressure falls as gas is expended, so
thrust and mass flow decay through the mission and the thruster must work over
a wide inlet pressure range. Regulated holds a constant downstream pressure
until the tank falls to the regulator's dropout, so thrust is constant and the
usable propellant fraction is higher, at the cost of a regulator — mass, cost,
and a component with its own failure modes including lock-up creep and
oscillation. [F][J] The deciding mission property is whether performance must
be **repeatable**: an attitude-control system with a tight impulse-bit
requirement, or one that must deliver a specified $\Delta v$ late in life,
wants regulation; a system that just needs total impulse and can recalibrate
its pulse widths against measured tank pressure can blow down. Most CubeSats
blow down; most crewed and launch-vehicle systems regulate.

**Probing:** whether you identify the requirement that decides, rather than
listing both architectures.
**Follow-up:** "How do you fly a blowdown system with a tight impulse-bit
spec?"

### 35. [M30, M31]
Because storage density and tank pressure dominate the design at that scale.
A saturated liquid such as R-236fa or n-butane self-pressurises at its own
vapour pressure — roughly 2.7 bar and 2.6 bar respectively at room temperature
— so the tank is a thin-walled welded aluminium can rather than a 200-bar COPV,
and the stored density is 0.57–1.36 g/cm³ against 0.28 for compressed nitrogen.
[B, `_verify-solid-coldgas.md` §B.1] You give up $I_{sp}$ — around 40 s
realised for R-236fa against 65–73 s for GN₂ — but you win far more on tank
mass and volume, and you get near-constant feed pressure for free as long as
liquid remains. MarCO flew exactly this: 755 N·s and >40 m/s of $\Delta v$ from
a 3.49 kg all-welded module with no regulator and no high-pressure vessel.
[A, `_verify-solid-coldgas.md` §B.4]

**Probing:** whether you know why a liquefiable propellant is a *tank* decision.
**Follow-up:** "What is the catch with a self-pressurising propellant?"

### 36. [M32]
Cold gas for the 3 m/s self-rescue case: the total impulse is tiny (a few
hundred newton-seconds), the system must be absolutely safe next to a crew
member, and simplicity and non-toxicity outweigh $I_{sp}$ entirely — this is
SAFER, 1.4 kg of GN₂ for 3.05 m/s. [A] Solid or liquid for the 4 km/s launch
vehicle, with liquid for the sustained core because you need throttling,
shutdown and high $I_{sp}$ over a long burn — cold gas is arithmetically
impossible here, since 4 km/s at 70 s $I_{sp}$ demands a mass ratio of
$e^{5.8} \approx 340$. Cold gas again for the 40 m/s CubeSat trajectory
correction, because at 3.5 kg the propellant mass is under 2 kg even at 40 s
$I_{sp}$ and no other technology fits the volume, power and safety envelope of
a rideshare CubeSat — this is MarCO. [A]

**Probing:** whether you sanity-check with the rocket equation before answering.
**Follow-up:** "At what $\Delta v$ does cold gas stop closing for a small
satellite?"

### 37. [M33]
Requirement flowdown is the process of decomposing a mission-level need into
verifiable requirements on progressively lower-level items, with every derived
requirement traceable to a parent and each one having an assigned verification
method. A derived propulsion requirement is one nobody asked for explicitly: a
customer specifies payload mass to a given orbit and a launch window, and from
that you derive stage $\Delta v$, then $I_{sp}$ and mass fraction, then chamber
pressure and expansion ratio, then — several levels down — a minimum NPSH at the
pump inlet and hence a tank ullage pressure and a helium mass. [M][J] Nobody
wrote "the helium bottle shall hold 12 kg"; it fell out. The discipline matters
because derived requirements are where unjustified conservatism accumulates,
and where a change at the top silently invalidates a qualification three levels
down.

**Probing:** whether you can name a *derived* requirement, which shows you have
worked inside a real requirements tree.
**Follow-up:** "Give me a case where a derived requirement turned out to be
wrong and nobody noticed for years."

### 38. [M34]
The Challenger SRB field joint. Under ignition pressure the tang-and-clevis
joint rotated: the legs deflected apart and momentarily opened the gap that the
primary and secondary fluorocarbon O-rings had to seal, so sealing depended on
the rings extruding into the gap faster than the gap opened. Elastomer
extrusion rate is strongly temperature-dependent, so at the low launch
temperature the rings were too stiff to seal in time, hot gas blew by, and the
joint burned through. [B, `_verify-solid-coldgas.md` §A.1] The industry
consequences were larger than the redesign: it produced the modern treatment of
launch-commit criteria, the rejection of "it worked last time" as evidence, and
the recognition that a rate-dependent seal is a different animal from a static
one.

**Probing:** whether you can state a failure mechanism precisely instead of
saying "the O-rings failed in the cold".
**Follow-up:** "What did the redesigned joint actually change?"

### 39. [M05, M35]
Because $I_{sp}$ is not the only axis and the industry moved along the ones
that were binding at the time. Kerosene came first because it is dense,
storable, room-temperature and could be handled with 1950s infrastructure —
and for a first stage, density impulse beats $I_{sp}$. Hydrogen arrived when
upper-stage performance became the constraint and cryogenic handling had been
learned, and it dominates upper stages where $I_{sp}$ is king. Methane is a
recent move driven not by performance — it sits between the two — but by
*reuse*: it does not coke the cooling channels and injector the way RP-1 does,
it is a mild cryogen storable at LOX-compatible temperatures so tank and
insulation design simplifies, and it is a candidate for in-situ production.
[M][J] Each transition solved the binding constraint of its decade rather than
maximising a single number.

**Probing:** whether you can articulate that engineering history is a sequence
of binding constraints.
**Follow-up:** "Is methane actually better than kerosene for a *expendable*
first stage?"

### 40. [M36, M33]
A single authoritative model rather than a set of documents that disagree.
Concretely: requirements, interfaces, mass and power budgets, and the analysis
models live in one linked structure, so a change to chamber pressure
automatically propagates to the tank pressure requirement, the helium mass, the
stage dry mass and the payload number, and the tool tells you which
verifications are now invalid. [M] A digital twin adds the run-time half — a
calibrated model of the specific serial-numbered unit, updated with its own
acceptance and flight data, so anomaly investigation compares a measurement
against that unit's model rather than a nominal one. The honest caveat is that
the value is in the discipline of maintaining the model, and a badly maintained
digital twin is worse than no model at all because people believe it. [J]

**Probing:** whether you can describe the benefit mechanically rather than
repeating marketing language.
**Follow-up:** "What would make you distrust a digital twin's prediction?"

### 41. [M01, M03]
$R = R_u/\mathcal{M} = 8314.46/22.0 = \mathbf{377.93}$ J/(kg·K).
$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}
{2(\gamma-1)}} = 0.64853$ at $\gamma = 1.20$.
$c^*_{ideal} = \sqrt{R T_0}/\Gamma = \sqrt{377.93 \times 3400}/0.64853
= 1133.4/0.64853 = \mathbf{1748\ m/s}$.
That is a normal kerolox-class number; a real engine with
$\eta_{c^*} \approx 0.96$ would measure about 1678 m/s. [F]

**Probing:** clean unit handling and whether you recognise 1750 m/s as
plausible without being told.
**Follow-up:** "What would $c^*$ be for LOX/LH2, and why is it so much higher?"

### 42. [M02, M03]
$A_t = \frac{\pi}{4}(0.100)^2 = 7.854\times10^{-3}$ m².
$\dot m = \Gamma \dfrac{p_0 A_t}{\sqrt{R T_0}}
= 0.64853 \times \dfrac{6.0\times10^{6} \times 7.854\times10^{-3}}{1133.4}
= \mathbf{26.96\ kg/s}$.
Equivalently $\dot m = p_c A_t/c^* = 6.0\times10^6 \times 7.854\times10^{-3}
/1748 = 26.96$ kg/s, which is the form worth remembering because it makes the
definition of $c^*$ obvious. [F]

**Probing:** whether you spot that $\dot m = p_c A_t/c^*$ is the same equation
and saves you the $\Gamma$ arithmetic.
**Follow-up:** "What thrust would that give at $C_f = 1.75$?" (≈103 kN.)

### 43. [M03]
$A_t = \dfrac{F}{p_c C_f} = \dfrac{250\times10^{3}}{10\times10^{6} \times 1.80}
= \mathbf{1.389\times10^{-2}\ m^2}$, so
$D_t = \sqrt{4A_t/\pi} = \mathbf{0.133\ m}$ (133 mm).
This is the single most-used sizing equation in the field: thrust, chamber
pressure and $C_f$ fix the throat, and everything else in the engine follows
from it. [F] Note that $C_f = 1.80$ implies a fairly high area ratio and a
vacuum or high-altitude application.

**Probing:** whether you can do this in ten seconds. It is the propulsion
equivalent of $F = ma$.
**Follow-up:** "Now give me the chamber diameter for a contraction ratio of 2."

### 44. [M03]
$c = c^* C_f = 1780 \times 1.72 = \mathbf{3061.6\ m/s}$.
$I_{sp} = c/g_0 = 3061.6/9.80665 = \mathbf{312.2\ s}$.
That combination — a kerolox-class $c^*$ with a moderately high $C_f$ — is a
sea-level-to-early-altitude booster engine; for comparison the F-1's published
figures are 263 s at sea level and 304 s in vacuum. [B,
`_verify-liquid.md`] [F]

**Probing:** fluency with the $I_{sp} = c^* C_f/g_0$ decomposition.
**Follow-up:** "If I told you the same engine measured 300 s, where would you
look first?"

### 45. [M02, M09]
Invert the area-ratio relation
$\varepsilon = \frac{1}{M_e}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}
M_e^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$ for $\varepsilon = 40$,
$\gamma = 1.22$: $M_e = \mathbf{4.356}$.
Then $p_0/p_e = \left(1+\frac{\gamma-1}{2}M_e^2\right)^{\gamma/(\gamma-1)}
= \mathbf{518.2}$, so $p_e/p_c = \mathbf{1.93\times10^{-3}}$.
For a 4 MPa chamber that is 7.7 kPa — well below sea-level ambient, so this
nozzle is a vacuum nozzle and would separate badly on a sea-level stand. [F]

**Probing:** whether you can invert the area–Mach relation, and whether you
immediately convert the answer into a statement about where the nozzle can be
used.
**Follow-up:** "What ambient pressure is this nozzle optimum for?"

### 46. [M03]
$\Delta v = I_{sp} g_0 \ln(m_0/m_f) = 340 \times 9.80665 \times \ln(30000/4000)
= 3334.3 \times \ln(7.5) = 3334.3 \times 2.0149 = \mathbf{6718\ m/s}$.
Note the mass ratio of 7.5 is aggressive — it implies a stage structural
fraction under about 12 % including residuals — so this is an upper stage with
a small payload, not a first stage. [F]

**Probing:** whether you sanity-check the mass ratio instead of just turning
the crank.
**Follow-up:** "What payload could that stage actually carry?"

### 47. [M20, M21]
$K_n = A_b/A_t = 12.0/0.030 = 400$.
$p_c = \left(a \rho_p c^* K_n\right)^{1/(1-n)}$ with $a$ in SI (m/s per
Pa$^n$): $a \rho_p c^* K_n = 3.5\times10^{-5} \times 1770 \times 1550 \times
400 = 3.841\times10^{4}$, and $1/(1-n) = 1/0.65 = 1.5385$, so
$p_c = (3.841\times10^{4})^{1.5385} = \mathbf{1.13\times10^{7}\ Pa} = 11.3$ MPa.
[F] That is high for a large booster (the RSRM runs about 6.25 MPa) and
suggests either a tactical motor or a $K_n$ that needs to come down; note also
how violently $p_c$ responds to $K_n$ through the $1/(1-n)$ exponent — a 10 %
error in burning area is a 16 % error in pressure.

**Probing:** whether you get the $1/(1-n)$ exponent right and comment on the
sensitivity. That exponent is the whole of solid-motor internal ballistics.
**Follow-up:** "How much does $p_c$ change if the propellant is 30 K colder?"

### 48. [M29]
Isothermal: the gas obeys $m \propto p$ at constant $T$ and $V$, so usable
fraction $= 1 - p_f/p_i = 1 - 20/240 = \mathbf{0.917}$.
Adiabatic: $m \propto p^{1/\gamma}$, so the fraction is
$1 - (p_f/p_i)^{1/\gamma} = 1 - (1/12)^{0.714} = \mathbf{0.831}$.
[F][A] Reality sits between the two and moves with duty cycle: a slow blowdown
with good thermal contact to a warm structure approaches isothermal, a rapid
one approaches adiabatic. The 9-point difference is a real 9 % of your
$\Delta v$ budget, which is why cold-gas system sizing must state the
assumption.

**Probing:** whether you know the answer is bracketed rather than a single
number, and which way reality leans.
**Follow-up:** "Which assumption do you size the tank with, and which one do
you advertise?"

### 49. [M12, M29]
$R_{He} = 8314.46/4.003 = 2077.1$ J/(kg·K).
$m = \dfrac{p V}{R T} = \dfrac{25\times10^{5} \times 0.60}{2077.1 \times 280}
= \mathbf{2.58\ kg}$.
[F][A] This is a floor, not an answer: it ignores the gas that must remain in
the pressurant bottle at the end (which is often more than the gas delivered),
the cooling of the helium as it expands out of the bottle, and the heating it
gets from contact with warm tank walls and cold propellant. A real
collapse-factor-corrected number for a cryogenic tank is typically 1.5–3 times
the ideal isothermal estimate.

**Probing:** whether you flag that the ideal number is an underestimate. A
candidate who hands over 2.58 kg with no caveat has never sized a real
pressurisation system.
**Follow-up:** "What is a collapse factor and which way does it go?"

### 50. [M29, M30]
Model the pulse as a trapezoid: $I_{bit} \approx F\left(t_{on} -
\frac{t_{rise}}{2} + \frac{t_{fall}}{2}\right) = 0.050 \times (0.020 - 0.002 +
0.003) = \mathbf{1.05\times10^{-3}\ N\cdot s}$ = 1.05 mN·s.
[A] The tail is worth as much as the rise here — the fall contributes +0.15
mN·s and the rise −0.10 mN·s — and in real hardware the tail-off is the least
repeatable part of the pulse because it depends on valve seat closure, plenum
dead volume and residual gas desorption. That is why minimum-impulse-bit
repeatability, not nominal $I_{bit}$, is the number that appears in a pointing
budget.

**Probing:** whether you know that pulse-mode performance is dominated by the
transients, not the steady thrust.
**Follow-up:** "How would you reduce the dead volume between valve and throat,
and what would that cost?"

---
