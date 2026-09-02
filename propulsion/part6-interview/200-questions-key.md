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

## Intermediate (51–110)

### 51. [M04, M01]
Frozen composition holds the chamber's chemical makeup fixed all the way down
the nozzle; shifting equilibrium lets the mixture re-equilibrate continuously
as temperature and pressure fall. Shifting always predicts more because the
chamber gas is significantly dissociated — H, OH, O, CO at a few percent each
in a hot LOX/LH2 or LOX/RP-1 chamber — and recombination is exothermic, so
letting those radicals recombine on the way down pours chemical energy back
into the flow as thermal energy that the nozzle then converts to velocity.
[F] The gap is typically 1–4 % of $I_{sp}$, largest for the hottest, most
dissociated systems and for high chamber pressures where dissociation is
suppressed less than you would like. A real engine lands closer to shifting —
commonly 80–95 % of the way from frozen to shifting — because the residence
time in a large nozzle is long compared with recombination times at high
pressure; the shortfall is exactly what the industry calls the kinetic loss.
[A] Small thrusters and very high area ratios freeze earlier and sit closer to
the frozen number, which is one of the reasons small engines under-deliver
against CEA. [CEA][RP-1311]

**Probing:** whether you understand that the two predictions are bounds on a
rate problem, not two opinions.
**Follow-up:** "Where in the nozzle does the flow actually freeze, and what
controls it?"

### 52. [M02, M09, M33]
$I_{sp} \propto C_f$ at fixed $c^*$, and $C_f$ approaches an asymptote because
the exhaust velocity approaches the limiting value
$v_{max} = \sqrt{2\gamma R T_0/(\gamma-1)}$: each extra unit of area ratio
expands a gas that has already given up most of its enthalpy. For
$\gamma = 1.20$, $p_c = 100$ bar, $c^* = 2300$ m/s in vacuum, the ideal
$I_{sp}$ runs 427.0 s at $\varepsilon = 20$, 441.9 s at 40, 454.3 s at 80 and
464.7 s at 160 — each doubling of area buys 14.9 s, then 12.4 s, then 10.4 s,
while nozzle wall area and mass roughly double every time. [F] You stop where
the derivative of stage $\Delta v$ with respect to nozzle mass goes through
zero, which is a vehicle-level calculation, not a nozzle one, and which lands
around $\varepsilon = 40$–80 for a hydrocarbon upper stage and 200–300 for a
hydrogen one. Three other things stop you first in practice: the interstage
diameter, the gimbal envelope, and — for a stage that must fire at sea level —
flow separation.

**Probing:** whether you convert "diminishing returns" into an actual number
and then into a vehicle-level trade.
**Follow-up:** "Which of those three constraints stopped the RL10B-2, and what
did they do about it?"

### 53. [M02]
Supersonic root of the area–Mach relation at $A/A^* = 4.0$ with
$\gamma = 1.20$: $M_1 = \mathbf{2.62}$. Normal-shock static pressure ratio
$p_2/p_1 = 1 + \frac{2\gamma}{\gamma+1}(M_1^2-1) = 1 + 1.0909\times(6.862-1)
= \mathbf{7.39}$. Downstream Mach
$M_2 = \sqrt{\dfrac{1 + \frac{\gamma-1}{2}M_1^2}{\gamma M_1^2 -
\frac{\gamma-1}{2}}} = \mathbf{0.455}$. [F] Note the upstream static pressure
is only 4.4 % of chamber pressure, so even a 7.4× jump leaves the post-shock
gas at about 32 % of $p_c$ — which is why a shock this far down a nozzle is
always accompanied by separation rather than a clean normal shock spanning the
duct. The low $\gamma$ matters: at $\gamma = 1.4$ the same area ratio gives a
lower $M_1$ and a weaker shock.

**Probing:** whether you can run the isentropic and shock relations back to
back without confusing static and stagnation quantities.
**Follow-up:** "Is a normal shock the right model here at all?"

### 54. [M03, M18]
$\eta_{c^*} = c^*_{meas}/c^*_{ideal}$ and
$\eta_{C_f} = C_{f,meas}/C_{f,ideal}$, with $c^*_{meas} = p_c A_t/\dot m$ and
$C_{f,meas} = F/(p_c A_t)$. Everything upstream of the throat lands in
$\eta_{c^*}$: incomplete mixing, incomplete vaporisation, finite residence
time, heat lost to the walls, and any real chemistry that did not reach
equilibrium in the chamber. Everything downstream lands in $\eta_{C_f}$:
divergence, boundary-layer drag and displacement, kinetic freezing in the
expansion, two-phase lag, and — if you are at sea level — separation. [F] A
diagnostic engineer separates them because the fixes live in different
hardware: a low $\eta_{c^*}$ sends you to the injector and the chamber length,
a low $\eta_{C_f}$ sends you to the contour and the film-cooling budget.
Lumping them into one $I_{sp}$ efficiency destroys exactly the information you
went to the test stand to get. [M]

**Probing:** whether you have ever actually reduced test data, or only read
about it.
**Follow-up:** "Your $\eta_{c^*}$ is 0.96 and your $\eta_{C_f}$ is 0.99. Which
one do you chase?"

### 55. [M03, M09]
$C_f$ ideal at $\gamma = 1.19$, $\varepsilon = 69$, $p_c = 206$ bar, $p_a = 0$:
the exit Mach number is 4.55, giving $p_e = 22.6$ kPa, and
$C_f = \mathbf{1.939}$. With $c^* = 2330$ m/s,
$I_{sp} = c^* C_f/g_0 = 2330 \times 1.939/9.80665 = \mathbf{460.8\ s}$ against
the published **452.3 s**, so the engine delivers about 98.2 % of this ideal —
a completely normal overall efficiency for a large hydrogen engine once
divergence, boundary layer, kinetics and film cooling are paid for. [F][A]
Carry the caveat: the RS-25's expansion ratio is **contested — 69:1, 77.5:1
and 78:1 all appear in the literature**, and the 206.4 bar figure is
injector-face stagnation at 109 % power level. Redo the sum at
$\varepsilon = 77.5$ and the ideal rises, which would make the implied
efficiency lower; that sensitivity is precisely why you quote the expansion
ratio you assumed.

**Probing:** whether you flag the contested $\varepsilon$ instead of quoting
"69" as fact, and whether an implied efficiency of 98 % strikes you as
plausible rather than suspicious.
**Follow-up:** "Which of the loss terms is biggest on an engine like that?"

### 56. [M03, M18]
$c^*_{meas} = p_c A_t/\dot m = 5.5\times10^6 \times 0.0080/26.0 =
\mathbf{1692\ m/s}$, so $\eta_{c^*} = 1692/1755 = \mathbf{0.964}$.
$C_{f,meas} = F/(p_c A_t) = 65.0\times10^3/(5.5\times10^6\times0.0080) =
\mathbf{1.477}$, so $\eta_{C_f} = 1.477/1.52 = \mathbf{0.972}$. Delivered
$I_{sp} = c^* C_f/g_0 = \mathbf{255\ s}$ at sea level. [F] A 3.6 % $c^*$
shortfall is a mixing or vaporisation problem in the injector, not a
measurement artefact, and is worth chasing; the 2.8 % $C_f$ shortfall is about
what a sea-level nozzle with divergence and boundary-layer losses should show,
so I would leave it alone until the injector is fixed. Before believing either
number I would confirm $A_t$ was measured on this hardware after the test and
that $p_c$ is the injector-face tap.

**Probing:** whether you split the efficiencies and then act differently on
each.
**Follow-up:** "How much of that 3.6 % could a throat that eroded during the
test explain?"

### 57. [M04, M05]
$c^* \propto \sqrt{T_0/\mathcal{M}}$, and moving fuel-rich of stoichiometric
lowers $T_0$ but lowers the mean molar mass faster, so the ratio improves —
that is the first mechanism, and it is pure thermodynamics. The second is that
peak temperature is where dissociation is worst: near stoichiometric a large
fraction of the released energy is locked into H, OH and O rather than raising
enthalpy you can convert, so the true peak of $I_{sp}$ sits fuel-rich of the
peak of $T_0$ regardless of the molar-mass argument. [F] The two effects are
enormous for hydrogen — LOX/LH2 stoichiometric is O/F 8, engines run 5.5–6.0 —
and modest for kerosene, where O/F peaks around 2.7 stoichiometric and engines
run 2.2–2.4. There is a third, non-performance reason that often decides the
last few tenths: a cooler, fuel-rich chamber and a fuel-rich boundary layer are
what make the wall survivable and keep free oxygen away from hot metal. [J]

**Probing:** whether you give the molar-mass argument, the dissociation
argument and the wall argument, not just the first one.
**Follow-up:** "So why does the RS-25 run 6.03 and not 4.5, if lower O/F is
even better on $I_{sp}$?"

### 58. [M03, M04, M05]
$R = R_u/\mathcal{M}$: hydrogen case $8314.46/13.5 = 615.9$ J/(kg·K), kerosene
case $8314.46/23.0 = 361.5$ J/(kg·K). With
$c^* = \sqrt{R T_0}/\Gamma(\gamma)$ and $\Gamma(1.20) = 0.6485$:
LOX/LH2 $c^* = \mathbf{2296\ m/s}$, LOX/RP-1 $c^* = \mathbf{1776\ m/s}$, a
ratio of **1.29**. [F] Almost the whole advantage is molar mass — the two
flame temperatures are within 2 % of each other, and the hydrogen case is
actually the *cooler* of the two. That is the single most important number in
propellant selection, and it is also why the comparison reverses when you
divide by density: the same hydrogen that wins 29 % on $c^*$ loses a factor of
about three on bulk density.

**Probing:** whether you attribute the hydrogen advantage to molar mass rather
than to "hydrogen burns hotter", which it does not.
**Follow-up:** "Now do it per unit tank volume."

### 59. [M05, M32, M33]
Density impulse is $\rho_{bulk} I_{sp}$ (units kg·s/m³, or $\rho I_{sp} g_0$ in
N·s/m³ if you want impulse per unit volume directly), where $\rho_{bulk}$ is
the mixture-ratio-weighted mean density of the loaded propellants. It is the
right figure of merit whenever tank volume, not propellant mass, is the thing
that costs you: first stages and boosters, where tank structure and aerodynamic
drag scale with volume; volume-constrained upper stages inside a fixed fairing;
missiles and any airframe with a fixed outer mould line; and essentially every
CubeSat. [F][J] $I_{sp}$ is the right figure of merit when the mass ratio
dominates and volume is nearly free — deep-space stages, kick stages, on-orbit
propulsion. The clean way to say it in a review: $I_{sp}$ buys you $\Delta v$
per kilogram of propellant, density impulse buys you $\Delta v$ per litre of
vehicle, and only one of those two is the binding constraint on any given
design.

**Probing:** whether you can name the constraint that makes each metric the
correct one, rather than reciting that "density impulse matters for first
stages".
**Follow-up:** "Which metric decides for a solid-fuelled tactical missile, and
why is it neither of the ones you just described?"

### 60. [M05, M32]
LOX/LH2: $\rho I_{sp} = 360 \times 450 = \mathbf{1.62\times10^{5}}$ kg·s/m³.
LOX/RP-1: $1030 \times 340 = \mathbf{3.50\times10^{5}}$ kg·s/m³. The kerosene
combination wins by a factor of **2.16** despite giving up 110 s of $I_{sp}$.
[F] For a first stage that means the hydrogen version needs roughly twice the
tank volume for the same total impulse, and tank volume buys you dry mass,
insulation area, boil-off, drag and a taller vehicle — which is why hydrogen
first stages are rare and are always accompanied by solid boosters that supply
the thrust and the impulse density the core cannot. The counter-argument is
that the hydrogen stage still wins on $\Delta v$ per kilogram, so the answer
depends entirely on whether you are volume-limited or mass-limited, and a first
stage is volume-limited.

**Probing:** whether you get the direction right and can immediately say what
tank volume costs, which is the actual content of the number.
**Follow-up:** "Delta IV flew a hydrogen first stage anyway. What did that cost
them?"

### 61. [M06]
The contraction ratio $A_c/A_t$ sets the chamber Mach number, and through it
three things: the stagnation-pressure loss from Rayleigh heat addition in a
moving stream, the injector face area available for elements, and the gas
velocity past the wall that drives convective heat transfer. Too small (below
about 1.5–2 for a large engine) and the chamber Mach number climbs past 0.2–0.3,
so you lose measurable $p_c$ to Rayleigh losses, the injector face is cramped,
and the wall heat flux in the chamber rises toward throat values. [F][E] Too
large and you are carrying chamber wall mass and cooled surface area for nothing,
the residence time distribution gets worse rather than better because the flow
recirculates in the corners, and you have made a large-volume acoustic cavity
that is easier to excite. Typical practice is 2–3 for big engines and up to 4–8
for small ones, where the injector face area rather than the flow sets it.

**Probing:** whether you know it is a Mach-number choice at heart, not a
geometry preference.
**Follow-up:** "Which end of that range does a 500 N thruster sit at, and why?"

### 62. [M06]
$V_c = L^* A_t = 1.0 \times 0.0125 = \mathbf{0.0125\ m^3}$ (12.5 litres).
Chamber gas density $\rho_c = p_c/(R T_0) = 8\times10^6/(370\times3500) =
\mathbf{6.18\ kg/m^3}$. Residence time
$t_s = V_c \rho_c/\dot m = 0.0125\times6.18/30 = \mathbf{2.57\times10^{-3}\ s}$
= 2.6 ms. [F][E] That is in the normal band — a few milliseconds is what a
well-mixed hydrocarbon or hydrogen chamber needs — and it is worth
saying out loud that $L^*$ is a proxy for this residence time, not a physical
length: the same $L^*$ at a different chamber pressure gives a different
residence time, because $\rho_c$ scales with $p_c$. That is why $L^*$
correlations from 1960s engines at 40 bar do not transfer cleanly to a 200 bar
modern engine, and why the number people should be comparing is $t_s$.

**Probing:** whether you understand that $L^*$ is an empirical stand-in and can
say what it stands in for.
**Follow-up:** "So does a 200 bar engine need a bigger or a smaller $L^*$ than
a 40 bar one for the same mixing quality?"

### 63. [M07]
The impinging doublet (like-on-like or unlike) atomises by collision: two jets
meet, form a fan, and the fan breaks into ligaments and drops. It suits
storable and kerosene combinations where both fluids are liquid at injection —
F-1, most hypergolic engines — and it is the element type with the longest data
record and the worst reputation for driving transverse instability, because the
spray pattern is periodic around the face. [H] The coaxial shear element
atomises by aerodynamic shear: a slow central liquid oxygen post inside a fast
annular gas-hydrogen stream, with the velocity ratio doing the work. It suits
LOX/LH2 and any combination where one side is gaseous or supercritical at
injection — RS-25, Vulcain, RL10. The pintle atomises by impinging a radial
sheet against an axial one at a single central element, which suits deep
throttling and rough-and-ready combinations (LMDE, Merlin) because the element
geometry moves with flow rate rather than being fixed. [M]

**Probing:** whether you can attach an atomisation mechanism, not just a
picture, to each element.
**Follow-up:** "Which of the three would you pick for a LOX/methane engine that
must throttle 5:1, and what does that cost you at full thrust?"

### 64. [M07]
$A = \dfrac{\dot m}{C_d\sqrt{2\rho\Delta p}} =
\dfrac{0.085}{0.75\sqrt{2\times1140\times1.8\times10^{6}}} =
\mathbf{1.77\times10^{-6}\ m^2}$, so
$d = \sqrt{4A/\pi} = \mathbf{1.50\ mm}$.
Injection velocity $v = C_d\sqrt{2\Delta p/\rho} = 0.75\times56.2 =
\mathbf{42.1\ m/s}$ (the ideal, loss-free velocity would be 56.2 m/s). [F]
A 1.5 mm LOX orifice is a manufacturable size but it is small enough that
contamination is now a system-level requirement: a 200 μm particle is 13 % of
the diameter and will change both $C_d$ and the spray pattern of that one
element permanently. The $\Delta p$ of 1.8 MPa is also a stability statement,
not just a flow statement — as a fraction of $p_c$ it is what decouples the
feed system from chamber oscillation.

**Probing:** whether you convert the orifice diameter into a cleanliness and
tolerance requirement without being asked.
**Follow-up:** "What injector $\Delta p$ as a fraction of $p_c$ would you
insist on, and where does that rule come from?"

### 65. [M07, M15]
The total momentum ratio is $\dot m_o v_o/(\dot m_f v_f)$ — the ratio of the
momentum fluxes the two streams bring to the element, not of their masses.
Designers care about it because mixing at the element scale is a momentum
problem: the resultant direction of the combined stream, the penetration depth
of one jet into the other, and the fineness of the resulting spray are all set
by how the momenta balance, and an element with the correct mass ratio but a
badly wrong momentum ratio will produce local zones far from the intended O/F
even though the chamber-average mixture ratio is exactly right. [F][E] Those
local zones are where you get hot streaks on the wall and where the local
combustion response is fastest, which is the link to instability: the
element-scale momentum ratio, not the global O/F, is what sets whether the flame
sits close to the face where it can couple to acoustics. Typical target values
run near unity for impinging elements and much higher for shear coaxials, where
the whole point is that the gas has most of the momentum.

**Probing:** whether you connect an injector-design number to a stability
outcome.
**Follow-up:** "You throttle to 50 %. What happens to that momentum ratio on a
fixed-geometry element?"

### 66. [M08]
Pyrotechnic: single shot, so no restart; extremely well-evidenced reliability
from decades of use and a simple lot-acceptance model; light; and if it fails
you get either no ignition, which is safe, or a delayed ignition into an
accumulated propellant charge, which is not. Hypergolic slug (TEA-TEB or a
cartridge): as many restarts as you carry slugs — typically one to three —
adds a plumbing and toxic-fluid handling burden, moderate mass, and its failure
mode is a clean no-start because the fluid either arrived or it did not. [H][M]
Torch (augmented spark igniter): unlimited restarts, needs a spark system, its
own small propellant feed and its own igniter-out detection; heaviest in
hardware and complexity; and if it fails you can detect it in milliseconds and
close the main valves before the chamber fills. That last property — that the
failure is detectable *before* the main event — is why every reusable and
every deep-space restartable engine has converged on torch or spark ignition,
and why the mass penalty is accepted.

**Probing:** whether "what happens if it fails" is a category you think in, or
an afterthought.
**Follow-up:** "How do you actually detect an igniter-out in 10 ms?"

### 67. [M08, M14, M15]
The oxidiser valve reached full open 10 ms before the fuel valve, so the chamber
saw an oxidiser-lead sequence, and the 60 ms delay to the spike says propellant
accumulated in the chamber and downstream dribble volumes before a light-off
propagated through it — the textbook hard start. [F][H] The pressure spike is
the accumulated charge burning in far less than the design residence time; on
an oxidiser-lead in a hydrocarbon engine you also get free oxygen against hot
metal, which is a second, worse failure mechanism. The first thing I would
change is the sequence: fuel lead by 30–50 ms, with a verified igniter
established before either main valve cracks. Then I would attack the cause of
the delay rather than the symptom — check that the igniter was actually lit
(chamber pressure or igniter thermocouple as a permissive rather than a
timer), and measure the dribble volume downstream of each valve, because that
volume is the size of the charge available for the next spike.

**Probing:** whether you read the valve traces as a sequence problem and reach
for a permissive rather than a longer timer.
**Follow-up:** "Fuel lead in a LOX/LH2 engine is standard. Is it still right in
LOX/RP-1?"

### 68. [M09]
A bell (Rao parabolic or truncated-ideal) contour turns the flow back toward
axial before the exit, so the divergence loss falls from the roughly 1.7 % of a
15° cone ($\lambda = (1+\cos15°)/2 = 0.983$) to a few tenths of a percent, and
it does that in 70–85 % of the length of the equivalent cone — which is the
bigger prize, because nozzle length is nozzle mass and vehicle length. [F][E]
What it costs: the contour must be designed by method of characteristics for a
specific $\gamma$ and area ratio, so it is not scalable by eye; the rapid
turn just after the throat produces a steeper adverse pressure gradient and an
internal compression wave that can coalesce into a weak shock; and the wall
pressure distribution is less forgiving at off-design, which matters for
separation at sea level. [Rao58][Rao60] Manufacturing is also harder — a cone
is a rolled sheet, a bell is a formed or machined contour.

**Probing:** whether you know length, not divergence angle, is the main win.
**Follow-up:** "How much length can you actually remove before you start losing
more than you gain?"

### 69. [M09, M02]
At $\varepsilon = 25$ and $\gamma = 1.20$, $M_e = \mathbf{3.91}$ and
$p_e = p_c/(p_0/p)_e = 60\times10^{5}/262.9 = \mathbf{22.8\ kPa}$. Schmucker:
$p_{sep} = p_a(1.88M_e - 1)^{-0.64} = 101325\times(6.356)^{-0.64} =
\mathbf{31.0\ kPa}$. Since $p_e = 22.8$ kPa $< 31.0$ kPa, **the flow is
separated** at sea level. [E] The cruder Summerfield rule ($p_e < 0.4p_a$, i.e.
below 40.5 kPa) says the same thing more emphatically. The practical
consequence is that this nozzle cannot be static-fired at sea level as designed
without either accepting separated flow — which means side loads, not just
performance loss — or truncating the nozzle for the sea-level test campaign,
which is what programmes routinely do.

**Probing:** whether you use a separation criterion at all rather than just
comparing $p_e$ to $p_a$, and whether you mention side loads.
**Follow-up:** "The two criteria disagree by 30 %. Which one do you design
with?"

### 70. [M10]
The dominant grouping is $(p_c/c^*)^{0.8}$ — the mass-flux term — multiplied by
$(A_t/A)^{0.9}$, which localises it to the throat, with a weak
$D_t^{-0.2}$ scale dependence. In plain terms $h_g$ scales almost linearly with
chamber pressure and is maximum at the throat, falling off fast in both
directions; that is why the throat is where the cooling problem lives and why
doubling $p_c$ costs you roughly 74 % more heat flux. [E][Bartz57] What it gets
badly wrong: it is a turbulent pipe-flow analogy with a property correction, so
it knows nothing about the injector — it cannot see streaks, unmixed zones or
a hot core, which are exactly what burn real hardware — and it assumes an
equilibrium boundary layer, which is false in the sharply accelerating throat
region. It is also blind to film cooling, to surface roughness, and to
chemistry in the boundary layer. Quoted accuracy is ±20–30 % at the throat and
worse elsewhere; treat it as a sizing tool and put the margin in the test plan,
not in the correlation.

**Probing:** whether you can state the error bar and, more importantly, what
the correlation is structurally incapable of seeing.
**Follow-up:** "Your test article burned through 40 mm downstream of the
injector, not at the throat. What does Bartz tell you about that?"

### 71. [M10, M11]
Bartz with $A/A_t = 1$ at the throat:
$h_g = \dfrac{0.026}{D_t^{0.2}}\left(\dfrac{\mu_0^{0.2}c_{p0}}{Pr_0^{0.6}}\right)
\left(\dfrac{p_c}{c^*}\right)^{0.8}\left(\dfrac{D_t}{r_c}\right)^{0.1}\sigma
= \mathbf{1.71\times10^{4}\ W/(m^2K)}$.
Heat flux $q = h_g(T_{aw}-T_{wg}) = 17{,}053\times(3300-800) =
\mathbf{4.26\times10^{7}\ W/m^2} = 42.6$ MW/m². [E][Bartz57] That is a
thoroughly normal throat flux for a 10 MPa engine — the RS-25 throat runs
higher — and it is the number that decides the whole cooling architecture:
42.6 MW/m² through a 0.8 mm copper wall is a 107 K drop through the wall alone,
so you are committed to a high-conductivity liner and a high-velocity coolant.
Quote it with the ±20–30 % Bartz band attached, and remember $T_{aw}$ of 3300 K
already assumes a recovery factor you chose.

**Probing:** whether you carry the correlation's uncertainty into the design
statement instead of treating 42.6 MW/m² as exact.
**Follow-up:** "Where would you put the margin — wall thickness, coolant flow,
or film cooling?"

### 72. [M11, M17]
The throat is where the gas-side flux peaks, so it needs the highest coolant-side
$h$ and the shortest thermal path. Narrowing the channel at fixed total flow
raises the coolant velocity, and $h \propto Re^{0.8}/D_h$ means both terms push
the same way; making it tall recovers the flow area you just lost and adds fin
surface, so the land between channels conducts heat sideways into a larger
wetted area. [F][E] The limits are four. Pressure drop scales as
$v^2 L/D_h$, so a high-aspect-ratio throat section is expensive in pump
discharge pressure, which is expensive in turbine power. Fin efficiency falls as
the land gets taller, so past a point the extra height conducts nothing. The
closeout — brazed, electroformed or printed — has to bridge a narrow slot
without slumping into it, which is the manufacturing limit and is why aspect
ratios of 4–8 were classic and 10–15 became reachable with additive
manufacturing. And the narrow hot-wall land is where low-cycle thermal fatigue
concentrates, so the geometry that cools best also fails first. [M][GradlAM]

**Probing:** whether "why not make it 30:1" gets four independent answers.
**Follow-up:** "Which of those limits moved when programmes went to laser
powder-bed fusion?"

### 73. [M11, M10]
Bulk rise: $\Delta T = Q/(\dot m c_p) = 12\times10^{6}/(28\times2100) =
\mathbf{204\ K}$. Wall drop: $\Delta T = qt/k =
60\times10^{6}\times8\times10^{-4}/320 = \mathbf{150\ K}$. [F] Both numbers are
alarming in the right way. A 204 K bulk rise on RP-1 entering near 290 K puts
the outlet near 500 K, which is into the coking regime for kerosene — around
420–480 K wall-side film temperature is where deposits start — so this circuit
needs either more flow, a split-flow or counterflow routing, or a fuel that
tolerates it. The 150 K drop across the wall means the gas-side face sits 150 K
above the coolant-side face, which is what drives the through-thickness thermal
strain that eventually fails the liner by low-cycle fatigue. Neither number is
improved by thinking harder about the correlation; they are architecture
statements.

**Probing:** whether you recognise 500 K RP-1 as a coking problem without being
prompted.
**Follow-up:** "Would methane change that answer, and by how much?"

### 74. [M12]
NPSH available is what the system delivers at the pump inlet:
$(p_{tank}-p_{vap}-\Delta p_{line})/\rho g_0$ plus the acceleration head, all
expressed in metres of the fluid. NPSH required is what the pump needs at that
flow and speed before cavitation degrades head by an agreed amount — usually
3 % — and it is a property of the pump, measured, not derived. [F] The inducer
exists because NPSHr for a high-speed centrifugal impeller is far above what a
launch vehicle can afford: raising tank pressure to satisfy it would put mass
into every square metre of tank wall, and tank mass is the one thing a stage
cannot spend. The inducer is a low-solidity axial stage that is *permitted to
cavitate* — it runs with an attached vapour cavity on the blade suction side by
design — and its job is to raise the static pressure enough that the main
impeller, which is not permitted to cavitate, sees a clean liquid inlet. That
trade is why suction specific speed is quoted for the inducer and specific
speed for the stage.

**Probing:** whether you know the inducer is a designed-cavitating component,
which is the whole trick.
**Follow-up:** "What limits how much cavitation the inducer can tolerate?"

### 75. [M12]
$P = \dot m \Delta p/(\rho\eta) = 250\times28\times10^{6}/(1140\times0.70) =
\mathbf{8.77\ MW}$. Equivalent head is
$\Delta p/(\rho g_0) = \mathbf{2505\ m}$ of liquid oxygen. [F] Two sanity
statements go with that: 8.8 MW is 11,800 hp from a pump that will fit inside a
metre, which is why turbopump power density is the extreme engineering in a
rocket engine; and every point of pump efficiency is worth 125 kW of turbine
gas, which at gas-generator $I_{sp}$ is real vehicle performance. The 30 %
inefficiency does not vanish — it goes into the fluid as heat, which raises the
LOX temperature toward saturation and eats NPSH margin at the next stage inlet.

**Probing:** whether the number means anything to you once you have it.
**Follow-up:** "Where does that 2.6 MW of loss actually go, and does it matter?"

### 76. [M12]
$\mathrm{NPSH}_a = \dfrac{p_{tank}-p_{vap}-\Delta p_{line}}{\rho g_0} +
z\dfrac{a}{g_0} = \dfrac{3.5\times10^{5}-1.0\times10^{5}-0.4\times10^{5}}
{1140\times9.80665} + 4.0\times1.3 = 18.78 + 5.20 = \mathbf{24.0\ m}$. [F]
Note how the two terms compare: the ullage margin over vapour pressure is worth
19 m and the 4 m column under 1.3 g is worth 5 m, so tank pressure is doing
most of the work — and that is the term that costs tank wall thickness. The
number to worry about is that the acceleration head disappears in coast and
reverses in a tumble, so an engine that must restart on orbit cannot count on
it at all; that is why restartable stages settle propellant with ullage
thrusters before spinning the pump.

**Probing:** whether you split the two contributions and notice one of them is
mission-phase dependent.
**Follow-up:** "The LOX has been sitting in a warm tank for an hour. What
happened to your 24 m?"

### 77. [M13, M11]
A closed expander has exactly one power source: the heat the chamber and nozzle
put into the coolant. That heat is an integral of flux over wetted area, and
with Bartz $h_g \propto D_t^{-0.2}$, the pickup scales roughly as $D_t^{1.8}$ —
call it thrust$^{0.9}$ — while the pump power the cycle has to produce scales
as $\dot m \Delta p$, i.e. thrust times chamber pressure, so it scales faster
than the supply does in both directions. [F] Grow the engine and the ratio of
available to required power falls; raise $p_c$ to compensate and it falls
faster, because pump power goes as $p_c^2$ at fixed thrust while heat pickup
goes as roughly $p_c^{0.8}$. The practical ceiling has historically sat in the
low hundreds of kN — RL10 at about 110 kN, Vinci at about 180 kN — with
chamber pressures under about 70 bar. The two standard escapes are to open the
cycle (expander bleed: dump the turbine exhaust overboard at low $I_{sp}$, as
LE-5B and BE-3U do, which removes the back-pressure constraint) or to buy more
heat-transfer area at fixed thrust — longer chambers, ribbed or roughened
channels, dual-pass circuits — which is a bounded improvement, not a
solution.

**Probing:** whether you produce a scaling argument rather than the memorised
sentence "expanders don't scale".
**Follow-up:** "Which escape would you pick for a 400 kN hydrogen upper stage,
and what does it cost in $I_{sp}$?"

### 78. [M13, M16, M35]
The Soviet programme had no hydrogen infrastructure and committed to getting
hydrogen-class staged-combustion performance out of kerosene. With kerosene you
cannot run a fuel-rich preburner: at preburner temperatures a fuel-rich
kerosene mixture cokes, laying carbon down on turbine blades and in the
injector, so the only staged-combustion architecture available is
oxidiser-rich. [H] The United States looked at oxidiser-rich staged combustion
and concluded that hot, high-pressure oxygen-rich gas would burn any structural
metal that took a scratch, which is a correct statement of the risk. The single
technology that made it survivable was materials: burn-resistant nickel-base
alloys plus protective enamel and metallic coatings on every surface wetted by
the oxidiser-rich gas, developed and qualified over decades of Soviet work, and
backed by process control on cleanliness and inspection that is at least as
important as the coating chemistry. When the RD-180 came to the US in the 1990s
the hardware was believed only after test; the metallurgy was the transferred
asset. [M]

**Probing:** whether you name the coking constraint as the *reason* for
oxidiser-rich, not just an incidental fact.
**Follow-up:** "So why is full-flow staged combustion possible with methane
where it was not with kerosene?"

### 79. [M12, M13]
$P = \eta\dot m c_p T_{in}\left[1-pr^{-(\gamma-1)/\gamma}\right] =
0.65\times18\times2800\times900\times\left[1-16^{-0.2308}\right]$.
$16^{-0.2308} = 0.5271$, so the bracket is 0.4729 and
$P = \mathbf{13.9\ MW}$. [F] Sanity: that is 18 kg/s doing 774 kJ/kg of
specific work, which is a reasonable single- or two-stage turbine duty at these
temperatures, and it is enough to drive a pump of roughly the size in question
75. Note how hard the pressure ratio works — going from 16 to 8 would cost
about 22 % of the power — which is why turbine back-pressure is such a fought-over
number in a staged-combustion power balance, where the exhaust must still be
above chamber pressure.

**Probing:** whether you get the exponent right and then say something about
sensitivity.
**Follow-up:** "In a staged-combustion engine, what sets the minimum turbine
back-pressure?"

### 80. [M14, M33]
An expendable engine fires once, so a pyrotechnic valve — a squib that cuts a
diaphragm or drives a piston — is the lightest, cheapest, most leak-tight and
most reliable way to get a single unambiguous open or close: no actuator, no
pneumatic supply, no position feedback, and a hermetic seal until the moment it
fires. [H] A reusable engine must open and close the same valve hundreds of
times, must be able to abort and re-arm, and must be checkable on the pad, so
it needs an actuated valve with position feedback, which brings an actuation
system with it. That decision propagates a long way: pyrotechnics require a
vehicle-level ordnance system with its own safe-and-arm devices, range-safety
paperwork, handling procedures and personnel exclusion zones, while actuated
valves require a helium or hydraulic supply, controllers, and the electrical
power and harness to run them — and they make the whole vehicle testable in a
way an ordnance-based one is not. [J][M] The second-order consequence is
operational: you can wet-dress-rehearse and abort an actuated vehicle
repeatedly; every abort on an ordnance-heavy design risks consuming
single-shot devices.

**Probing:** whether you follow the decision out of the engine and into ground
operations, which is where its real cost lives.
**Follow-up:** "You are designing a reusable stage but the customer wants
pyrotechnic isolation valves for safety. What do you say?"

### 81. [M15, M06]
Longitudinal modes are standing waves along the chamber axis, with a wavelength
set by chamber length and frequencies typically in the hundreds of hertz;
tangential modes run around the circumference, with the first tangential at
$f_{1T} = 1.8412\,a/(\pi D)$; radial modes stand between the axis and the wall,
the first at $f_{1R} = 3.8317\,a/(\pi D)$. [F] The first tangential is usually
the destructive one: it is the lowest-frequency transverse mode, it is the
easiest to excite because the injector face is full of elements at different
radii that can drive it, and its pressure antinode sits on the wall, where the
oscillating velocity scrubs the boundary layer and multiplies wall heat flux
several-fold. Engines have been destroyed by 1T in well under a second.
Hardware: radial baffles on the injector face break the transverse modes by
splitting the chamber into sectors whose individual 1T frequencies are far
higher; acoustic cavities or Helmholtz resonators at the injector face are
tuned absorbers for 1T and 1R; longitudinal modes and chug are attacked
upstream instead, with injector pressure drop and feed-system compliance, since
they couple to the feed system rather than to the transverse acoustics. [H][M]

**Probing:** whether you know why 1T is the killer — the wall antinode — and
match each suppression device to the mode it actually addresses.
**Follow-up:** "Baffles cost you injector face area and cooling. When would
you accept resonators instead?"

### 82. [M15, M07, M10]
A discrete, growing 2.8 kHz tone with the heat concentrated at the injector
periphery is a transverse acoustic instability — almost certainly first
tangential — coupling to the outer ring of elements. Sanity check the
identification: $f_{1T} = 1.8412a/(\pi D)$ gives 2.8 kHz for a chamber diameter
of about 0.24 m at a burnt-gas sound speed of 1150 m/s, so if the chamber is
roughly that size, 1T fits and you should not go looking for a feed-system
explanation. [F] The growth to 8 % of $p_c$ over two seconds says the driving
exceeds the damping and that the margin is negative, not marginal; the
peripheral heating says the mode's wall antinode is scrubbing the boundary
layer, and it is also the clue to what is driving it — the outer elements sit
where the tangential mode's velocity oscillation is largest, so their mixing
responds to the wave. My first two fixes: re-time the outer ring so it is no
longer the strongest responder — bias it fuel-rich, change its momentum ratio,
or recess the elements — and add tuned acoustic cavities at the face sized for
1T. If those fail, radial baffles, at a known cost in face area and cooling.
[M][J] I would also stop testing at that condition until a bomb test
establishes the damping time, because the next unit may not survive to two
seconds.

**Probing:** whether you identify the mode from the frequency and the heating
pattern together, and whether you propose a driving-side fix before a
damping-side one.
**Follow-up:** "You add cavities and the tone moves to 4.4 kHz. What
happened?"

### 83. [M16, M11]
Hydrogen embrittlement is a driver in LOX/LH2 engines because hydrogen is
everywhere at high pressure and, in several forms — high-pressure gaseous
environmental embrittlement, internal embrittlement from dissolved hydrogen,
and hydrogen reaction embrittlement — it reduces ductility and fracture
toughness in exactly the alloys you want for turbopumps and hot-gas manifolds:
high-strength steels, nickel-base superalloys, titanium. [F] Kerolox and
methalox engines have hydrogen present only as a combustion product in the
burnt gas, at low partial pressure and generally on the wrong side of a wall
from the load-bearing structure, so the mechanism has no time or concentration
to work. Standard mitigations: choose alloys with low susceptibility (many
austenitic stainless steels, copper alloys, aluminium bronzes); plate or coat
the exposed surface with copper, gold or nickel to keep hydrogen out of the
substrate; reduce sustained stress and eliminate notch-like stress raisers,
since the mechanism is stress-assisted; control heat treatment to avoid
susceptible microstructures; and test in the actual environment rather than
inferring from air data — the standard practice is to derate allowables from
hydrogen-environment testing. [M][MMPDS]

**Probing:** whether you name a mechanism and an alloy class, not just the
phrase.
**Follow-up:** "Which does more damage in an RS-25 turbopump: hydrogen or
thermal fatigue?"

### 84. [M17, M16, M36]
The new problem is that in additive manufacturing the material and the part are
made at the same time, so material properties are an output of the build rather
than an input from a certified mill. Two nominally identical parts from
different machines, different powder lots, or different positions on the same
build plate can have different porosity, different residual stress, different
grain morphology and therefore different fatigue lives — and the defects that
matter most are internal, where conventional surface NDE cannot see them. [M]
Programmes address it on four fronts: freeze the process, not just the drawing
— machine, parameter set, powder specification, recoater, atmosphere, build
orientation — and treat a change to any of them as a change to the part;
build witness coupons on every plate and test them; use volumetric NDE, mainly
computed tomography, with an explicit statement of the smallest defect the
scan can detect at that wall thickness; and use post-processing to close the
gap where it can — hot isostatic pressing for internal porosity, heat treatment
for residual stress and microstructure, machining or abrasive flow for surface
roughness in flow passages. The residual and honest problem is statistical
allowables: there is no MMPDS-equivalent database for most AM alloy-process
combinations, so programmes generate their own, which is slow and is the real
schedule cost of AM. [GradlAM][RAMPT]

**Probing:** whether you say "the process is the material" in some form.
**Follow-up:** "Your supplier wants to move the part to a different machine of
the same model. Do you requalify?"

### 85. [M18]
$c^* = p_c A_t/\dot m$ is a product of independent measurements, so relative
uncertainties combine in quadrature:
$\sqrt{0.005^2 + 0.008^2 + 0.012^2} = \mathbf{0.0153}$, i.e. **±1.53 %**. [F]
The mass-flow term dominates: it contributes $0.012^2 = 1.44\times10^{-4}$ of
the total $2.33\times10^{-4}$, about 62 % of the variance, and halving it alone
would take the combined figure to 1.03 %. So $\dot m$ is what I would attack —
usually by moving from a turbine or venturi flow measurement to a calibrated
Coriolis meter, or by cross-checking with tank-level rate. Worth saying out
loud: at ±1.53 % you cannot resolve a 1 % $c^*$ efficiency change between two
injectors on single tests, which is exactly the comparison programmes most want
to make, so either you improve the instrument or you buy resolution with
repeats.

**Probing:** whether you convert the uncertainty into a statement about what
the test can and cannot decide.
**Follow-up:** "How many repeat tests would let you resolve 1 % at 95 %
confidence?"

### 86. [M18, M03, M24]
$c^*_{meas} = p_c A_t/\dot m$ is only defined against a stated throat area, and
the throat grew 1.5 % over the series. If the reduction used the original
$A_t$, then as the real throat opened, $p_c$ fell at fixed $\dot m$ and the
computed $c^*$ fell with it — an artefact, not a combustion change. [F] But do
the arithmetic before concluding: 0.97 to 0.93 is a 4.1 % relative fall, and
1.5 % of throat area accounts for only about a third of it. So there are two
things happening: a measurement bookkeeping error worth 1.5 points, and a real
2.5-point degradation that needs an explanation — injector face erosion,
element blockage from coking or contamination, or a shifting mixture ratio
that the instrumentation is not resolving. The $c^*$ number is meaningful only
if you re-measure $A_t$ after every test and use the test-average area, and
even then it is a chamber-plus-throat number, so the right next step is to
inspect the injector face and the throat separately and to plot $c^*$ against
measured area rather than against test number.

**Probing:** whether you check whether the artefact explains the whole effect,
rather than stopping at "it's the throat".
**Follow-up:** "What is eroding the throat on a liquid engine at all?"

### 87. [M19, M20, M24]
Aluminium is loaded at 16–19 % because that is close to the optimum of the
performance curve: it raises the flame temperature substantially and it raises
propellant density, so both $I_{sp}$ and density impulse improve, and past
about 20 % the extra condensed-phase mass costs more in two-phase loss and
molar mass than the added energy returns. [E][Davenas] Three penalties come
with it. First, two-phase flow loss: molten and solidified Al₂O₃ particles lag
the gas in velocity and temperature through the nozzle, and that lag is a
direct $I_{sp}$ loss of typically 1–3 %, worse in small motors and at high
expansion ratios. Second, slag and erosion: liquid alumina collects in the aft
dome and pools, adding inert mass that is expelled unpredictably at burnout,
and the particle-laden flow is far more erosive on the throat insert and the
nozzle than clean gas. Third, the exhaust: alumina makes the plume opaque, a
strong infrared and radar-attenuating smoke, which for a defence application is
a signature problem and for any application is a range-safety and environmental
consideration alongside the HCl from the ammonium perchlorate. There is a
fourth that people forget: the particles are also a strong acoustic damper, so
removing aluminium to fix the plume can hand you a combustion-stability
problem. [J]

**Probing:** whether you name particle damping — the penalty that is also a
benefit.
**Follow-up:** "You need a reduced-smoke motor. What do you lose?"

### 88. [M20, M21]
Erosive burning is the augmentation of the local burn rate by high-velocity
cross-flow of combustion gas over the propellant surface: the flow thins the
thermal and reaction layer above the surface and increases convective heat
feedback, so $r$ exceeds $a p^n$ by a factor that can reach 1.5–3 locally.
[E][F] The governing group is the local mass flux over the surface — Lenoir and
Robert correlate the augmentation against $G$ — which in practice is expressed
as the local port Mach number, with onset typically above about $M \approx
0.2$–0.3, or equivalently as the port-to-throat area ratio $J = A_p/A_t$, where
values falling toward unity are the warning. It shows up first at the *aft* end
of a long grain, because mass flux accumulates along the port: every square
metre of upstream burning surface adds to the gas flowing past the downstream
surface. The consequences are a pressure spike early in the burn when the port
is smallest, a locally deeper web consumption at the aft end that can burn
through the insulation before the rest of the grain is done, and a mismatch
between the predicted and delivered thrust trace in exactly the first second,
where a motor is most highly loaded.

**Probing:** whether you get the location right and say *why* it is the aft
end.
**Follow-up:** "How would you design it out without changing propellant?"

### 89. [M20, M27]
Burn-rate ratio between the two conditioning temperatures:
$r_{322}/r_{244} = \exp\left[\sigma_p(T_2-T_1)\right] = \exp(0.0025\times78) =
\mathbf{1.215}$ — the hot motor burns 21.5 % faster than the cold one.
Pressure sensitivity $\pi_K = \sigma_p/(1-n) = 0.0025/0.65 =
\mathbf{3.85\times10^{-3}\ K^{-1}}$, so over the same 78 K span the chamber
pressure ratio is $\exp(0.003846\times78) = \mathbf{1.35}$. [F][E] That 35 %
pressure swing across the qualification temperature range is the single most
important number in solid-motor design: the case, the nozzle and the grain
structure must survive the hot-day MEOP while the vehicle must still fly on the
cold-day thrust and the longer, lower burn. It is also why $n$ matters twice —
once for stability and once here, because $1/(1-n)$ amplifies the burn-rate
sensitivity into a pressure sensitivity.

**Probing:** whether you go from burn rate to pressure through $1/(1-n)$
instead of quoting the same number twice.
**Follow-up:** "What does that do to the delivered total impulse — is it the
same on a hot and a cold day?"

### 90. [M21]
A BATES cylindrical grain (a set of cylindrical segments burning on the bore
and both ends) gives a nearly neutral trace, because the growing bore area is
offset by the shrinking end area; it is the standard research and
characterisation geometry, cheap to make and easy to model, and you accept its
modest volumetric loading because you are buying analytical clarity. An
11-point star burns regressive-to-neutral with a large initial surface area,
which is what you want when you need high initial thrust from a short motor —
and its penalty is the sliver, the propellant left in the star points at
burnout, which burns at falling area and produces a long, weak tail-off you
must either accept or pay to remove. [F][E] A finocyl — a cylindrical bore with
fins at one end — gives a progressive-then-neutral trace with a high volumetric
loading and, crucially, a burn-back that can be tuned almost arbitrarily by
fin count, depth and length; it is the modern upper-stage and tactical choice,
and you accept a harder manufacturing and structural analysis problem
(three-dimensional burn-back, stress concentrations at the fin roots) in
exchange for the trace and the loading. [M] The choice is a vehicle question:
neutral for a simple $\Delta v$ stage, progressive where you want to build
thrust as the vehicle lightens, regressive where max-q or a launcher's
structural limit caps early thrust.

**Probing:** whether "sliver" and "web fraction" are costs you can name and
price, not vocabulary.
**Follow-up:** "Which of the three would you pick for a booster that must
limit max-q, and what happens to your burn time?"

### 91. [M21, M20]
Ignoring the ends, the burning surface of a cylindrical-bore grain is the port
wall: $A_b = \pi D_p L = \pi\times1.6\times25 = \mathbf{125.7\ m^2}$, so
$K_n = A_b/A_t = 125.7/0.62 = \mathbf{203}$. [F] Two comments belong with the
number. First, $K_n \approx 200$ is a normal booster value — it is the ratio
that, with the propellant's $a$, $n$, $\rho_p$ and $c^*$, fixes chamber
pressure — and it will *rise* as the bore opens, so this grain is progressive
and the initial pressure is the low point, not the high point. Second, the port
is 1.6 m in a 3.2 m case, so the port area is a quarter of the case area and
the web is 0.8 m; check the port-to-throat area ratio
$J = A_p/A_t = 2.01/0.62 = 3.2$, which is comfortably clear of erosive burning
at ignition. A real grain would have shaped ends and a taper, which is why this
is a first-cut number.

**Probing:** whether you immediately say which way $K_n$ moves and check the
port for erosive burning.
**Follow-up:** "What is $K_n$ at burnout, and what does that do to the trace?"

### 92. [M22]
Design pressure is $\mathrm{MEOP}\times$ burst factor $= 7.0\times1.5 =
10.5$ MPa. Thin-wall hoop: $t = pr/\sigma =
10.5\times10^{6}\times1.5/1400\times10^{6} = \mathbf{0.01125\ m} = 11.3$ mm.
[F][A] The real layup is thicker for reasons that have nothing to do with this
equation. A filament-wound case is not an isotropic shell: the hoop plies carry
hoop load, the helical plies carry the axial load and wrap the domes, and the
helical layer contributes only $\cos^2\alpha$ of its strength in the hoop
direction, so the total wall must include both families. The 1400 MPa allowable
is a fibre-direction number that must be knocked down for translation
efficiency (fibre misalignment, waviness, void content — typically 10–20 %),
for the dome and boss discontinuities where the geodesic path forces a build-up,
for the skirt-attachment and joint regions, and for handling and pressure-cycle
damage tolerance. And the case must also survive axial loads, bending during
transport, and — for a booster — the vehicle's flight loads, none of which
appear in the hoop equation. [J]

**Probing:** whether you know a filament-wound wall is two ply families and the
hoop formula sizes only one of them.
**Follow-up:** "What winding angle would you use for the helicals, and where
does that number come from?"

### 93. [M22, M16]
Netting analysis assumes the fibres carry all the load, the matrix carries
none, and the fibres are perfectly aligned along their winding paths — a
truss made of strings. It survives because for a filament-wound pressure vessel
that assumption is nearly true where it matters: the composite is 60 %-plus
fibre by volume with a modulus ratio of order 20:1, so at burst the matrix
really is a spectator, and netting gives you the hoop/helical thickness balance
and the classic geodesic angle in about three lines of algebra with no
stiffness data. [E][H] It misleads you everywhere the load path is not pure
membrane tension: it predicts zero matrix stress, so it cannot see matrix
cracking, interlaminar shear failure at ply drops, or delamination — which are
the actual failure modes in service and in handling damage. It says nothing
about stiffness or deflection, so it cannot predict joint rotation or the strain
compatibility at the dome-to-cylinder transition or at the metal boss. It has no
concept of fatigue, of residual cure stress, or of the pressure-cycle
degradation that governs a reusable or a long-stored case. Use it to size, then
use finite element analysis with real ply properties to check everything it
cannot see.

**Probing:** whether you can say precisely which assumption fails and which
failure mode that hides.
**Follow-up:** "Where on a motor case is netting analysis most wrong?"

### 94. [M23, M24]
Through the thickness, from the flame side inward: a receding surface where
mechanical erosion and oxidation remove char; a porous char layer of mostly
carbon left behind by the decomposed resin; a pyrolysis (reaction) zone a few
millimetres thick where the resin is actively decomposing and evolving gas at
some hundreds of degrees; and virgin material at essentially the initial
temperature. [F][E][SP-8115] The char does the insulating — it is porous
carbon, its conductivity is low, and it is thick — but the pyrolysis gases are
doing at least as much work by a different mechanism: they percolate outward
through the char and blow into the boundary layer, thickening it and cutting
the convective heat transfer to the surface, which is transpiration cooling by
another name. That is why an ablator's performance is not simply "a low
conductivity material": you are paying for the endothermic decomposition, the
blowing, and the insulation together, and it is why a char that spalls off is a
much worse failure than the erosion number suggests, since you lose the
insulation and the gas source at once.

**Probing:** whether you credit the blowing, not just the char conductivity.
**Follow-up:** "What makes a char spall, and how do you design against it?"

### 95. [M24, M25]
Carbon–carbon erodes very little — often a few tenths of a millimetre over a
burn — is dimensionally stable, so the throat area and therefore the pressure
trace stay where you designed them, and it is stiff and strong hot. It is
expensive and slow: a dense C–C billet takes many chemical-vapour-infiltration
or pitch-impregnation cycles over months, and its failure mode is bad —
it is brittle, so a manufacturing flaw or a thermal-shock crack can take the
insert out abruptly rather than gracefully. Carbon-phenolic erodes far more —
a fraction of a millimetre per second — but it does so predictably, it is far
cheaper, its supply chain is mature, and its failure mode is progressive
erosion and ply lift rather than fracture. [E][M] For a 130 s first-stage burn
I would take carbon-phenolic and design the throat for the erosion: the burn is
long, so a C–C insert would have to survive a very large total heat load
without a crack, the throat is large, so a C–C billet is expensive and
schedule-driving, and the pressure trace change from a known erosion rate is
something the grain design can absorb. I would reserve C–C for small,
short-burn, high-precision throats where a shifting throat area is what breaks
the mission. [J] The Vega-C VV22 failure is the cautionary counterexample about
assuming a carbon–carbon insert's erosion behaviour transfers across a supplier
change.

**Probing:** whether you pick on burn duration and throat size, and whether you
mention failure mode, not just erosion rate.
**Follow-up:** "How much throat erosion can your pressure trace tolerate before
the case is in trouble?"

### 96. [M24, M20]
At equilibrium $p_c \propto (A_b/A_t)^{1/(1-n)}$, so at fixed burning area a
6 % throat-area growth gives
$p_c'/p_c = 1.06^{-1/0.65} = 1.06^{-1.5385} = \mathbf{0.914}$ —
an **8.6 % pressure drop**, from 6.2 MPa to **5.67 MPa**. [F] The exponent is
the whole story again: erosion is amplified, not attenuated, by the internal
ballistics. Consequences are mixed. Thrust does not fall by 8.6 %, because the
larger throat raises the mass flow coefficient at the lower pressure and the
thrust coefficient changes too — thrust falls much less, which is why designers
tolerate erosion at all — but burn time lengthens because a lower pressure
means a lower burn rate ($r = ap^n$), and the delivered $I_{sp}$ falls slightly
with the expansion ratio, which the growing throat has just reduced. In a
motor sized against a max-q or a thrust-tail requirement, the burn-time change
is often what actually bites.

**Probing:** whether you use $1/(1-n)$ and then resist saying thrust falls by
the same 8.6 %.
**Follow-up:** "So what happens to total impulse?"

### 97. [M25, M21]
Voids and porosity from entrapped air during mix or cast: extra burning surface
when the flame reaches them, so an unexplained pressure rise or a spike, and
they are found by radiography at accept. Cracks in the grain, from cure
shrinkage, thermal cycling or rough handling: the same signature but worse,
because a crack presents a large area at once and can raise pressure through
MEOP in milliseconds — this is the classic ignition-spike-then-case-failure
sequence, and it is why grain structural analysis and cold-conditioning
qualification exist. Debonds at the liner-to-insulation or
insulation-to-propellant interface: these do not add burning area at first, but
they let hot gas track along the interface toward the case wall, so the
signature is a *late* pressure or thermal anomaly and a burnthrough, and they
are found by ultrasonic inspection, tap test and radiography. [E][M] Fourth,
non-uniform cure or mis-proportioned mix — poor propellant properties or a
burn-rate off-nominal batch — which shows up not as a discrete feature but as a
whole-motor shift: the pressure trace is the right shape at the wrong level,
and the evidence is in the cure witness samples and strand-burner lot
acceptance data rather than in the radiograph.

**Probing:** whether you match each defect to *when* in the trace it appears —
that is the diagnostic skill.
**Follow-up:** "You see a 3 % pressure rise at 40 % of burn. Which of those is
it?"

### 98. [M25, M23, M33]
None of the three is answerable from the geometry alone; the answer is a
disposition process, and I would say so. The 40 mm interface unbond is a hot-gas
path to the case wall, and it is 300 mm from the aft end, which is where the
gas is hottest and fastest and where the exposure time after the flame front
reaches it is longest — the worst place for it. [J] What decides: does the
motor's structural and thermal analysis show the unbond growing under
pressurisation and thermal load, or arresting? Is 40 mm within the flaw size
the insulation design was qualified to tolerate, with a stated margin, or is it
outside the qualification basis? And is there a repair with an equal-or-better
qualification record — some liner repairs are qualified processes, most are
not. My default is: if the flaw is outside the qualified tolerance envelope and
no qualified repair exists, it does not fly, because the failure mode is case
burnthrough on a motor you cannot shut down. If the analysis shows arrest with
margin and there is a qualified repair, repair and re-inspect. The wrong answer
is to fly it on the argument that similar flaws have flown before, because that
is precisely the reasoning that normalised the Shuttle field-joint erosion.
[M34]

**Probing:** whether you refuse to answer without the qualification basis, and
whether you name normalisation of deviance without being led there.
**Follow-up:** "Your programme is two weeks from a launch commitment. Does that
change your answer?"

### 99. [M26, M22, M34]
At ignition the case pressurises in about half a second and the cylindrical
segments balloon; because the tang-and-clevis field joint is stiffer than the
membrane either side of it, the joint *rotates* — the clevis opens away from
the tang — and the O-ring gap grows in the first tens of milliseconds, exactly
when the pressure driving gas into the joint is rising fastest. [F][H] The seal
survives that only if the elastomer can extrude into the growing gap faster
than the gap opens, and elastomer response is strongly rate- and
temperature-dependent: cold O-rings are stiffer and slower, so below roughly
12 °C the primary seal could not follow the joint rotation, and on the 31 °F
launch morning it did not. Hot gas past the primary seal then eroded the
secondary, and the resulting flame path impinged on the external tank
attachment. [Rogers86] The redesign changed three things: a capture feature on
the tang that mechanically limits joint rotation, a third O-ring plus a
J-seal/insulation change that prevents gas from reaching the seals in the first
place, and joint heaters plus a launch-temperature constraint so the elastomer
is never cold. The deeper change was procedural — the erosion had been observed
on prior flights and accepted as within experience, and the redesign was
accompanied by a rule that flight-observed anomalies are not evidence of
safety.

**Probing:** whether you say "joint rotation" and "rate-dependent seal
response" — the two mechanical facts — before you say "cold O-ring".
**Follow-up:** "The P120C has no field joints at all. Is that a real safety
argument or an accident of size?"

### 100. [M27, M24]
Jet vanes and jetavators put a refractory surface into the exhaust and turned
the whole plume: simple, fast-responding, works from the first millisecond of
the burn, and available with a fixed nozzle — which is why the V-2 and early
tactical missiles used vanes. The cost is a permanent axial thrust loss of a
few percent whether you are steering or not, plus a vane that must survive an
aluminised exhaust for the whole burn. [H] Liquid injection TVC (LITVC) injects
a fluid — Freon, N₂O₄, or strontium perchlorate solution — into the divergent
section to make an oblique shock and a side force: no moving structural joint,
no thrust loss when not steering, and it was the Titan and early Minuteman
answer. It costs you a tank of injectant, a distribution manifold and valves,
mass that is dead once the burn is over, and a side force that is nonlinear and
limited to a few degrees equivalent. [H] The flexseal gimballed nozzle — a
laminated elastomer-and-shim bearing that lets the whole nozzle vector on
electromechanical or hydraulic actuators — gives large, linear, essentially
loss-free vector angles and is the modern standard on RSRM, P120C, S200 and
every large motor built since. It costs a structurally demanding joint that
must seal 6–10 MPa while moving, significant actuator power, and a hot-gas
sealing and insulation problem right at the flexseal. [M] Each step traded
hardware complexity for the elimination of a continuous performance penalty.

**Probing:** whether you frame the evolution as trading a standing loss for a
harder joint, rather than reciting three names.
**Follow-up:** "For a small tactical motor with a 4 s burn, which would you
pick today?"

### 101. [M28, M29]
Ideal gas fails when the stored state is dense or near saturation — which for a
cold-gas system is most of the interesting cases. Nitrogen at 300 K and 300 bar
has a compressibility factor around 1.12, so $m = pV/RT$ overpredicts the
stored mass by about 12 %: you think you have loaded more propellant than you
have, and your $\Delta v$ budget is wrong in the dangerous direction. [F][A]
For a liquefiable propellant — butane, R-236fa — ideal gas is not merely
inaccurate, it is the wrong model: the tank contains two phases at the vapour
pressure, so the pressure does not fall as gas is withdrawn until the liquid is
exhausted, and every blowdown formula you would apply is meaningless. The
second failure is thermal: real gases cool on expansion by more than the ideal
prediction (Joule–Thomson), which drops the feed temperature, drops the thrust,
and can drive a liquefiable propellant to condense in the line or the valve. If
you ignore all this, the symptoms are a system that under-delivers total
impulse, a thruster whose $I_{sp}$ droops more than modelled, and a tank you
cannot empty as far as you planned.

**Probing:** whether you name both the density error and the two-phase case,
and whether you know which way the error goes.
**Follow-up:** "What would you use instead of the ideal gas law, and where does
the data come from?"

### 102. [M28, M29]
$R_{N_2} = 8314.46/28.014 = 296.8$ J/(kg·K);
$R_{He} = 8314.46/4.003 = 2077.1$ J/(kg·K). At $\varepsilon = 50$,
$T_0 = 300$ K:
nitrogen $I_{sp,vac} = \mathbf{76.8\ s}$, helium $\mathbf{178.1\ s}$, a ratio
of **2.32** — which is $\sqrt{\gamma\text{-corrected }\mathcal{M}}$ doing
exactly what the $1/\sqrt{\mathcal{M}}$ scaling says it should. [F] A real
thruster delivers roughly **85–92 %** of these ideal values: the losses are
boundary layer in a small, cold, low-Reynolds-number nozzle, divergence,
non-isentropic expansion through the valve and plenum, and heat leak. So expect
about 65–70 s of realised $I_{sp}$ for nitrogen and 150–165 s for helium, and
note that published MarCO-class refrigerant systems land near 40 s against a
40–43 s cold ideal — that is a ~90 % efficiency and it is the honest number to
carry. [E][MarCO][VACCO]

**Probing:** whether you attach a realisation factor rather than quoting the
ideal as if it flew.
**Follow-up:** "Why is the efficiency lower for a small thruster than a large
one, at the same area ratio?"

### 103. [M29, M31]
$m_p = \dfrac{I_{tot}}{I_{sp}g_0} = \dfrac{755}{40\times9.80665} =
\mathbf{1.92\ kg}$. Tank volume
$V = m_p/\rho = 1.92/1360 = \mathbf{1.42\times10^{-3}\ m^3} = 1.42$ litres.
[F] Those are the MarCO numbers — 755 N·s of total impulse at about 40 s from
R-236fa stored as a saturated liquid at roughly 1.36 g/cm³ — and the point of
doing the arithmetic is that 1.4 litres fits inside a 6U CubeSat with room to
spare, at a tank design pressure of about 2.7 bar rather than 240. [MarCO] The
same impulse from cold nitrogen at 70 s would need 1.10 kg of propellant but
about 5.5 litres of 300 bar COPV, and the COPV, not the gas, is what does not
fit. That comparison is the whole reason CubeSats use refrigerants.

**Probing:** whether you finish the calculation with the volume, which is the
answer that decides the architecture.
**Follow-up:** "1.92 kg of propellant on a 3.5 kg module. Where did the rest of
the mass go?"

### 104. [M29, M30]
The gas expanding out of the tank does work and cools — approaching the
adiabatic limit for a fast firing — and $I_{sp}\propto\sqrt{T_0}$, so a falling
plenum and tank temperature directly lowers thrust and specific impulse through
the burn. In a blowdown system the pressure is falling at the same time, which
lowers thrust further and, in a small nozzle, lowers the throat Reynolds number
and hence the discharge and nozzle efficiency as well. [F][A] A 30 % drop in
absolute temperature is a 16 % drop in $I_{sp}$, and it does not recover until
heat leaks back in from the structure, which takes minutes to hours. What that
does to the advertised duty cycle is the real answer: you cannot quote a single
$I_{sp}$ for the system, only an $I_{sp}$ at a stated duty cycle, and the
specification has to say "these many pulses of this width with this
inter-pulse spacing", because a long continuous firing and a train of short
pulses with recovery time between them are different machines. Systems that
need a firm number either heat the gas, oversize the plenum, or use a
liquefiable propellant whose latent heat holds the tank near constant pressure.

**Probing:** whether you finish with the specification consequence, not just
the physics.
**Follow-up:** "How would you test that, on the ground, honestly?"

### 105. [M30]
A latching solenoid uses power only during the transition and holds its state
magnetically, so a system that must stay open or closed for long periods pays
no continuous power and generates no continuous coil heat — which on a CubeSat,
where the whole bus may run on a few watts, is often the deciding factor. It
also fails in its last commanded state rather than springing to a default,
which is either a safety feature or a hazard depending on the design; that is
why latching valves are usually used as isolation valves in series with a
non-latching thruster valve, so a stuck-open thruster can still be isolated.
[M][J] For leakage, the number that matters is not a rate but a mission total:
a one-year mission is $3.15\times10^{7}$ s, so a system-level allowance of
$1\times10^{-4}$ scc/s of helium would lose about 3,150 scc — half a gram of
helium, but a substantial fraction of a small propellant load if the same path
leaks propellant. A defensible spec for a one-year mission is $10^{-5}$ to
$10^{-4}$ scc/s helium at the *system* level, and $10^{-6}$ scc/s per joint,
with the requirement stated after vibration and thermal cycling, not on a
pristine unit. [J]

**Probing:** whether you turn a leak rate into a mission-total mass before
calling it acceptable.
**Follow-up:** "Your latching valve fails open in flight. What in your design
saves the mission?"

### 106. [M30, M31, M33]
Total allowed leakage $= 1\times10^{-4}\times14\times(3\times3.156\times10^{7})
= \mathbf{1.33\times10^{5}\ scc}$ = 133 standard litres of helium, which at
0.1786 mg/scc is **23.7 g of helium**. [F][A] Whether that is acceptable is a
budget question, not a number question, and it needs three things. First: is
the leaking fluid the propellant? For a self-pressurising refrigerant system
the propellant is not helium and the conversion between a helium leak rate and
a propellant leak rate depends on the leak's flow regime — molecular flow scales
as $1/\sqrt{\mathcal{M}}$, viscous flow with viscosity — so a 23.7 g helium
figure might be several times more or less propellant mass. Second: what is the
propellant load? 24 g against MarCO's 1.9 kg is 1.3 % and probably acceptable;
against a 200 g module it is not. Third: leakage is not the only loss — permeation
through elastomer seals is often larger than joint leakage over three years and
is not covered by this spec at all. What I would measure: a system-level
accumulation or pressure-decay test at flight pressure, held long enough to
resolve the rate, run *after* vibration and thermal cycling, plus a
helium-mass-spectrometer sniff of each joint to find which one is the outlier,
and a separate permeation test on the seal materials at the flight temperature.

**Probing:** whether you notice the spec is written in helium and the mission
flies something else.
**Follow-up:** "The measured system rate is twice the spec. What do you do?"

### 107. [M31, M30]
MarCO's constraint was volume and safety on a rideshare, not performance. A
self-pressurising R-236fa system stores propellant as a saturated liquid at
about 2.7 bar, which means no COPV, no high-pressure regulator, no pyro valve
and no high-pressure joint anywhere in the module — so the whole thing is an
all-welded aluminium block that a launch provider's safety panel will accept as
a secondary payload next to a flagship spacecraft, and it fits in a fraction of
a 6U bus. [MarCO][VACCO] The propellant's own vapour pressure does the
pressurisation, so the feed pressure is nearly constant while liquid remains
rather than blowing down, which also removes the regulator's failure modes. What
it gave up: specific impulse, about 40 s against 60–70 s for nitrogen and far
less than any chemical option, so total impulse per kilogram is poor; thrust,
tens of millinewtons, so every manoeuvre is long; and temperature sensitivity,
because the feed pressure *is* the vapour pressure and therefore tracks the
module's thermal state directly — a cold module is a low-thrust module. For a
mission needing 40 m/s of trajectory correction on a 14 kg spacecraft with
months of cruise to do it in, all three concessions were free. [J]

**Probing:** whether you identify "no COPV" as the actual architectural win.
**Follow-up:** "What would you have had to change to get the same impulse with
nitrogen?"

### 108. [M22, M26, M32, M33]
On mass fraction alone the monolithic filament-wound case wins and it is not
close: **0.924 for the P120C against about 0.85 for the Shuttle SRB**, which on
a 150 t-class booster is tens of tonnes of inert mass, and inert booster mass is
carried to a significant fraction of the mission velocity. [P120C] I would pick
the monolithic composite. But the mass-fraction argument is overturnable by
things that are not physics. Segmentation exists because of transport: the
Shuttle SRBs were cast in Utah and shipped by rail, and the segment length is a
rail-clearance number, so if your casting facility is not adjacent to your
launch site, monolithic may be impossible at any price. It is also overturned by
casting capacity — a monolithic 140 t grain needs a pit, a mixer train and a
cure oven that exist in very few places — by the carbon-fibre supply chain and
its cost and qualification lead time, by recoverability if you intend to reuse
the case (steel tolerates salt-water recovery in a way a wound composite does
not), and by heritage: a qualified segmented design with fifty flights behind it
is a schedule and risk asset that a paper composite is not. [J][M] The honest
answer names the mass fraction, commits, and then says which of those five
would make me reverse.

**Probing:** whether you can say why segments exist at all — shipping, not
engineering preference.
**Follow-up:** "SLS still flies segmented steel. Give me the strongest defence
of that choice."

### 109. [M33, M15]
You cannot put a margin on a number you cannot measure, so early in a programme
you convert the unmeasurable requirement into measurable proxies plus a
demonstration plan, and you hold margin in all three. For combustion stability
the requirement is written as a *demonstrated* damping requirement — an induced
disturbance of stated amplitude must decay to a stated fraction within a stated
time, at every operating point in the box — because that is testable, and the
industry convention is the bomb test with a specified recovery time. [M][CPIA-246]
The proxies you hold margin on before hardware exists are design-rule based:
injector pressure drop as a fraction of $p_c$ above a threshold, acoustic
cavity or baffle provisions carried in the design even if you hope not to need
them, and a chamber geometry whose predicted mode frequencies you have
deliberately separated from the injector's characteristic response times. [J]
Then you hold *schedule and configuration* margin: you keep the injector face
modifiable — a bolt-on face plate, a cavity ring you can re-tune — because the
real historical answer to instability has always been iteration on hardware,
and a programme that has designed out the ability to iterate has no margin at
all, whatever its documents say.

**Probing:** whether you propose demonstrable criteria and preserved design
freedom, rather than a number with a percentage on it.
**Follow-up:** "How many bomb tests, at which operating points, before you
would sign?"

### 110. [M34, M24, M25]
It tells you that a qualification argument attaches to a *process and a supply
chain*, not to a drawing: the insert met its specification on paper, and the
material change was invisible at the level the specification controlled, so the
qualification evidence — which was generated on the old material — no longer
applied to the flight article. [M34][J] What I would have required of the
supplier: a change-notification obligation covering raw material source, fibre
and matrix precursor, densification cycle and any process parameter, with the
right to reject or requalify; first-article and periodic lot testing on the
properties that actually govern erosion, not just the ones easy to measure
(density, porosity distribution, ply architecture, thermal conductivity, and an
erosion or oxidation coupon test in a representative environment); retained
samples from every lot; and traceability to the specific billet in the specific
motor. Programme-side, I would require at least one hot-fire on the new
material before flight — the general lesson is that a material substitution in
an ablative or erosive application is a qualification event, because the
governing behaviour is a rate that no room-temperature acceptance test measures.
The systemic version of the lesson: write qualification plans so that "same
part number" is never sufficient evidence, and identify in advance which
suppliers are single-source for a property you cannot inspect.

**Probing:** whether you go after the change-control clause, which is the
actual mechanism, rather than "test more".
**Follow-up:** "Your supplier says the change is proprietary and they will not
disclose it. Now what?"

---

## Advanced (111–165)

### 111. [M01, M04]
Two reasons, and they are different in kind. The first is that the products are
polyatomic — H₂O, CO₂, CO — and at 3000–3600 K their vibrational modes are
fully active, so the molar heat capacity is far above the $\frac{5}{2}R$ of a
diatomic gas at room temperature and $\gamma = c_p/c_v$ falls toward 1.15–1.25.
[F] The second is chemical: the mixture is partially dissociated and shifts
composition as it expands, and an equilibrium mixture's *effective* $\gamma$ —
the isentropic exponent that actually relates pressure and density along the
expansion — is lower still, because some of the energy added or removed goes
into changing composition rather than temperature. What the designer gains is
real: at fixed $T_0$ and molar mass, a lower $\gamma$ converts a larger
fraction of enthalpy per unit pressure ratio, and the numbers say so — at
$T_0 = 3400$ K, $\mathcal{M} = 22$, $p_c = 100$ bar, $\varepsilon = 40$, ideal
vacuum $I_{sp}$ is 351.4 s at $\gamma = 1.15$ against 322.3 s at 1.25. What
they lose is that you do not get to hold $T_0$ fixed: the same internal modes
and dissociation that lowered $\gamma$ are what absorbed the energy that would
otherwise have raised the flame temperature, and they also stretch the nozzle,
since the area ratio needed for a given pressure ratio grows as $\gamma$ falls
(sea-level-optimum $\varepsilon$ is 13.2 at $\gamma = 1.15$ against 10.6 at
1.25).

**Probing:** whether you separate the thermodynamic bookkeeping from the
chemistry, and resist claiming low $\gamma$ is a free gain.
**Follow-up:** "What single $\gamma$ would you use for a first-cut nozzle
design of a methalox engine, and where would you take it from?"

### 112. [M02, M09]
A full ideal contour, generated by method of characteristics, produces exactly
axial, uniform flow at the exit and therefore zero divergence loss — and it is
absurdly long, because the last third of it is turning flow that is already
nearly axial and adding almost no velocity. [F][Rao58] Truncating it, or
replacing it with Rao's parabolic approximation to a truncated ideal contour,
gives up a few tenths of a percent of divergence efficiency and gets back
20–40 % of the length. What is actually being traded is $I_{sp}$ against nozzle
mass, vehicle length and — for a first stage — the base area and gimbal
envelope, and the correct optimum is not a nozzle-level calculation at all: it
is the point where the payload derivative with respect to nozzle mass balances
the payload derivative with respect to $I_{sp}$. [J] A second, subtler trade
hides inside it: an aggressive short bell turns the flow harder just downstream
of the throat, which strengthens the internal compression wave and steepens the
wall pressure gradient, and that makes the contour less forgiving of separation
at low altitude. So the truncation optimum for an upper stage and for a
sea-level stage are not the same number even at the same area ratio.

**Probing:** whether you say the optimum is a vehicle calculation.
**Follow-up:** "Rao's method is 1958 and assumes a fixed $\gamma$. What would
you do differently now?"

### 113. [M02, M09]
Ideal exit conditions at $\varepsilon = 40$, $\gamma = 1.20$: $M_e = 4.24$,
$p_0/p_e = 479$, so $p_e = \mathbf{20.9\ kPa}$. A normal shock at that Mach
number gives $p_2/p_1 = 1 + \frac{2\gamma}{\gamma+1}(M_e^2-1) =
\mathbf{19.5}$ and $M_2 = \mathbf{0.361}$, so the post-shock static pressure
would be $20.9\times19.5 = \mathbf{407\ kPa}$ — four times ambient. [F] That is
the argument: a normal shock standing at the exit plane cannot exist here,
because it would have to discharge into 101 kPa a stream at 407 kPa. The shock
system must therefore stand well inside the nozzle, where the local Mach number
is low enough that the pressure rise across it lands near ambient, and it will
be a separated, oblique-shock structure with the boundary layer detaching from
the wall rather than a clean normal shock. Cross-check with Schmucker: the
separation pressure at this exit Mach number is 29.2 kPa, above the ideal
$p_e$ of 20.9 kPa, which says the same thing independently. The practical
consequence is side loads during the sea-level start transient, which is a
structural requirement on the nozzle and the gimbal, not a performance
footnote.

**Probing:** whether you use the impossible post-shock pressure as the actual
argument rather than asserting separation.
**Follow-up:** "Roughly what area ratio does the separation sit at?"

### 114. [M03, M04, M18]
First I would establish that 4 s is outside the measurement uncertainty. A
vacuum $I_{sp}$ reconstruction typically carries ±0.5–1.5 %, and 4 s on a
360-second engine is 1.1 %, so "repeatable across five units" may only mean a
repeatable bias in the instrumentation — a $p_c$ tap location, a flowmeter
calibration, a thrust-stand tare, or an altitude-cell back-pressure correction.
[M18] That is the cheapest place to find 4 s and the most embarrassing place to
leave it. Then I would split with $\eta_{c^*}$ and $\eta_{C_f}$, because the
partition is the diagnosis: a $c^*$ shortfall points at mixing, vaporisation or
residence time in the chamber; a $C_f$ shortfall points at the contour, the
boundary layer, kinetic freezing, or film cooling that is doing more than the
budget assumed. Third, I would question the prediction rather than the engine:
CEA shifting equilibrium at the assumed O/F and $p_c$ is only as good as the
assumed mixture ratio, and a 1 % O/F error is easily worth a couple of seconds
— so I would reconstruct the actual delivered O/F from the flowmeters and
re-run the prediction, and check whether the assumed efficiencies were
themselves inherited from a different engine. [J] The order matters:
instrumentation, then partition, then prediction, then physics. Chasing a
kinetics explanation before checking the thrust-stand calibration is how
programmes lose six months.

**Probing:** whether you attack the measurement and the prediction before the
engine.
**Follow-up:** "The uncertainty analysis says ±0.4 %. Now where do you look?"

### 115. [M03, M09]
With $\gamma = 1.20$ and $p_c = 100$ bar:

| | sea level | vacuum |
|---|---|---|
| $\varepsilon = 16$ | 1.635 | 1.797 |
| $\varepsilon = 40$ | 1.479 | 1.884 |

[F] Read across and down. In vacuum the big nozzle wins by 4.8 %; at sea level
the small nozzle wins by 10.5 %. No fixed nozzle can have both, and the spread
— roughly 15 % of thrust coefficient between the best sea-level and the best
vacuum choice — is the altitude-compensation problem stated quantitatively. It
is worse than the table suggests: at sea level the $\varepsilon = 40$ nozzle
has $p_e = 20.9$ kPa against a Schmucker separation pressure of 29.2 kPa, so it
is separated and the 1.479 is not even achievable — the real number is
whatever the separated flow delivers, with side loads attached. The
sea-level-optimum expansion ratio here is 11.8, giving $C_f = 1.643$, so
$\varepsilon = 16$ is already slightly overexpanded, deliberately, which is
what real first stages do to buy some of the vacuum performance back.

**Probing:** whether you notice the $\varepsilon = 40$ sea-level number is
fictional because the flow has separated.
**Follow-up:** "Given that spread, why has nobody flown an aerospike?"

### 116. [M04, M02]
The justification is a comparison of two times: the residence time available at
each station, and the characteristic recombination time of the dominant
reactions. In the chamber, pressure is high and velocity is low, so residence
time is milliseconds and three-body recombination — whose rate scales as the
square or cube of concentration and therefore steeply with pressure — is fast
compared with it; equilibrium is a good model. [F][A] Downstream of the throat
the flow accelerates while density collapses, so the residence time falls by
orders of magnitude at the same moment the reaction rates do, and the
composition stops being able to follow the local equilibrium: the chemistry
freezes. The station is not sharp, and where it sits depends on the propellant,
the chamber pressure and the nozzle scale — for a large, high-pressure engine
it is usually placed somewhere between the throat and an area ratio of about
5–10, and it moves *downstream* with increasing chamber pressure (more
collisions) and *upstream* for a small engine (less residence time). Real
practice either picks a freezing station and does equilibrium-then-frozen, or
runs a finite-rate kinetics solution and reports the answer between the two
bounds; the difference between the bounds is the kinetic loss, typically
0.5–1.5 % for large engines. [CEA][RP-1311]

**Probing:** whether you argue from a ratio of two timescales rather than
asserting a rule.
**Follow-up:** "Which propellant combination has the largest gap between frozen
and equilibrium, and why?"

### 117. [M04, M05]
$c^* = \sqrt{RT_0}/\Gamma(1.20)$ with $R = R_u/\mathcal{M}$:
O/F 3.6 gives $R = 386.7$ J/(kg·K), $c^* = \mathbf{1807\ m/s}$;
O/F 3.2 gives $R = 409.6$ J/(kg·K), $c^* = \mathbf{1817\ m/s}$.
The cooler mixture is 0.6 % *better*. [F] The reason is the one that governs
all of mixture-ratio selection: $c^*\propto\sqrt{T_0/\mathcal{M}}$, and moving
fuel-rich dropped $T_0$ by 4.5 % but dropped the molar mass by 5.6 %, so the
ratio improved. That is before you count the two effects that are not in this
calculation and both favour the cooler mixture as well: a 160 K lower flame
temperature is a materially easier cooling problem — Bartz flux scales with the
temperature difference to the wall, and the wall material's life scales far
more steeply than that — and a fuel-rich boundary layer keeps free oxygen away
from the liner. Against it: lower density (methane is the light component you
are adding), so the tank grows slightly, and a real engine's $\eta_{c^*}$ may
not be the same at both mixture ratios.

**Probing:** whether you compute rather than assume that hotter means better.
**Follow-up:** "So why not go to O/F 2.8?"

### 118. [M05, M11, M12]
Coking is the clearest split. RP-1 lays carbon down in cooling channels and
injector passages above roughly 450–500 K wall-side film temperature, so a
reusable kerosene engine either accepts channel fouling and a rising wall
temperature flight over flight, or uses a fuel with a controlled sulphur and
aromatics specification and still inspects. Methane does not coke in any
practical sense, and hydrogen cannot; that is the single biggest reason methane
is the reusability propellant. [M][E] Boil-off runs the other way: hydrogen at
20 K boils off through any practical insulation and cannot be stored on a
vehicle for long, methane at 111 K is close enough to LOX's 90 K that one
insulation system and one tank structure serve both (which is also a structural
and plumbing simplification), and RP-1 is storable at ambient and boils off not
at all. Tank volume: hydrogen at ~71 kg/m³ needs roughly four times the volume
of methane and six times RP-1 for the same mass, which for a reusable stage
that must also carry landing propellant, legs and thermal protection is a
compounding penalty. Turbomachinery: hydrogen's low density means enormous
volumetric flow and multi-stage, very high-speed pumps — the RS-25 HPFTP is a
three-stage machine at ~35,400 rpm drawing 53 MW — while methane and kerosene
pumps are single-stage and comparatively benign, which matters when the same
machine must run 25 times. [SSME-Orient] Net: methane wins on reusability,
kerosene wins on density and ground handling, hydrogen wins only where
$I_{sp}$ is everything and the stage is expendable or short-lived.

**Probing:** whether coking, boil-off and pump architecture each get a specific
consequence rather than a general remark.
**Follow-up:** "Then why is anyone still building hydrogen upper stages?"

### 119. [M05, M16, M14]
"LOX compatible" means the material will not ignite and sustain combustion in
oxygen under the mechanical and thermal insults it will actually see: impact,
friction, particle impingement, adiabatic compression of a gas volume against
it, and elevated temperature. It is established by test, not by reasoning from
chemistry — mechanical impact testing in liquid oxygen, promoted-combustion and
autogenous-ignition testing in gaseous oxygen at pressure, and configurational
testing of the actual part where geometry matters — and by the material and
configuration acceptance procedures those tests feed — the ASTM mechanical-impact
and promoted-combustion methods and NASA's materials flammability standard are
the usual basis. [M]
Monel and other high-nickel alloys are the classic "fine": they are used for
LOX valve internals and high-pressure oxygen service precisely because they are
very difficult to ignite and do not sustain burning. Titanium is the classic
"not": it is impact-sensitive in liquid oxygen and burns readily in oxygen once
started, and it is prohibited from LOX-wetted service in essentially every
programme despite being a wonderful structural material everywhere else.
Two things candidates miss: compatibility is configuration- and
pressure-dependent, so a material that passes at 10 bar may not at 300 bar; and
cleanliness is part of the requirement, because a hydrocarbon film or a
particle can be the ignition source in an otherwise compatible system.

**Probing:** whether you say "it is established by test" and name a specific
test class.
**Follow-up:** "Aluminium is used for LOX tanks and also burns in oxygen. How
do you reconcile that?"

### 120. [M06, M03]
$A_t = F/(p_c C_f) = 800\times10^{3}/(12\times10^{6}\times1.85) =
\mathbf{0.03604\ m^2}$, so $D_t = \sqrt{4A_t/\pi} = \mathbf{0.2142\ m}$.
Delivered $c^* = 0.96\times1820 = 1747.2$ m/s, so
$\dot m = p_c A_t/c^* = 12\times10^{6}\times0.03604/1747.2 =
\mathbf{247.5\ kg/s}$.
$V_c = L^*A_t = 1.05\times0.03604 = \mathbf{0.03784\ m^3}$ (37.8 litres).
$A_c = 2.5A_t = \mathbf{0.0901\ m^2}$, $D_c = \mathbf{0.3387\ m}$.
Cross-check: $I_{sp} = c^*C_f/g_0 = \mathbf{329.6\ s}$, and
$\dot m \times c^* \times C_f = 800$ kN, which closes. [F] Sanity: a 214 mm
throat in a 339 mm chamber, 38 litres of chamber volume, 248 kg/s — that is a
compact, high-pressure engine of roughly Merlin scale, and the numbers hang
together. The one I would flag in a review is $\eta_{c^*} = 0.96$: that is an
assumption about an injector that does not exist yet, and every downstream
number inherits it.

**Probing:** whether you close the loop with a thrust cross-check and then name
the assumption everything rests on.
**Follow-up:** "Your first hot-fire gives $\eta_{c^*} = 0.93$. What changes,
and what does not?"

### 121. [M06, M15]
Chug is a low-frequency (roughly 20–200 Hz) coupling between the feed system and
the chamber, and the chamber volume is the gas capacitance in that loop: a
pressure rise in the chamber reduces the injector $\Delta p$, which reduces the
flow, which — one combustion time lag later — reduces the chamber pressure, and
if the phase around that loop comes back in step the oscillation grows. [F] The
chamber's gas-filling time $t_s = V_c\rho_c/\dot m$ sets how fast chamber
pressure can respond, so increasing $L^*$ lowers the chug frequency and moves
it around relative to the feed-line acoustic and the combustion time lag —
which can either stabilise or destabilise depending on where you started. The
reason increasing $L^*$ is nonetheless a standard cure for one problem is that
more residence time means more complete mixing and vaporisation, which raises
$\eta_{c^*}$ and reduces the combustion-response sensitivity that drives
high-frequency instability. What it creates is a bigger acoustic cavity: the
transverse mode frequencies fall as the chamber grows, and a larger volume of
burning gas is a larger energy reservoir for whatever mode does get excited, so
the classic outcome is that you cure a rough-combustion problem and inherit a
chug or a lower-frequency transverse one. [J][M] The lesson is that $L^*$ is
not a monotone knob and the honest way to set it is against measured
$\eta_{c^*}$ with a stability check at both ends.

**Probing:** whether you name chamber volume as a capacitance in a loop and can
say what the time lag is.
**Follow-up:** "What is the cheapest fix for chug, and why is it not free?"

### 122. [M07, M13]
A pintle has one element whose geometry moves: the annular slot area is set by
the axial position of a sleeve, so as flow falls you close the gap and keep the
injection velocity — and therefore the injector pressure drop and the
momentum ratio between the radial and axial sheets — roughly where they were at
full thrust. [F][M] That is the whole trick, and it is why 10:1 is achievable
for a pintle and not for a fixed-orifice injector, where $\Delta p\propto
\dot m^2$ means throttling to 30 % flow leaves you with 9 % of the design
pressure drop, an injector that no longer atomises and no longer isolates the
chamber from the feed system. What limits it: at the low end the gap becomes
small enough that manufacturing tolerance and thermal growth are a significant
fraction of it, so flow calibration and pattern repeatability degrade; the
actuator and its seals must work in the propellant at full chamber pressure;
the single central element means mixing quality depends on one interaction, so
$\eta_{c^*}$ is usually a point or two below a good multi-element face; and the
chamber wall sees a spray fan whose impingement location moves with throttle
setting, which is a cooling problem across the range rather than at one point.
The LMDE demonstrated the architecture at 10:1 in flight, which is why the
claim is credible rather than aspirational. [H]

**Probing:** whether you state the fixed-orifice $\Delta p\propto\dot m^2$
problem that the pintle exists to solve.
**Follow-up:** "What is your $\eta_{c^*}$ penalty at full thrust for choosing a
pintle, and would you accept it?"

### 123. [M07]
LOX: $A_o = \dot m/(C_d\sqrt{2\rho\Delta p}) =
0.12/(0.78\sqrt{2\times1140\times2\times10^{6}}) =
\mathbf{2.28\times10^{-6}\ m^2}$, $d_o = \mathbf{1.70\ mm}$,
$v_o = C_d\sqrt{2\Delta p/\rho} = \mathbf{46.2\ m/s}$.
RP-1: $A_f = 0.052/(0.78\sqrt{2\times810\times2\times10^{6}}) =
\mathbf{1.17\times10^{-6}\ m^2}$ total, $d_f = \mathbf{1.22\ mm}$ if it were
one hole — but this is a fuel-oxidiser-fuel triplet, so it is two holes of
$5.86\times10^{-7}$ m² each, $d = 0.86$ mm; $v_f = \mathbf{54.8\ m/s}$.
Total momentum ratio $= \dot m_o v_o/(\dot m_f v_f) =
(0.12\times46.2)/(0.052\times54.8) = \mathbf{1.95}$. [F] Two comments. The
fuel is the faster stream despite the common pressure drop, purely because it
is less dense — that is always true and it is why equal-$\Delta p$ designs do
not give equal velocities. And a momentum ratio near 2 with the oxidiser
dominating means the resultant spray leans toward the oxidiser jet's direction;
for an F-O-F triplet you usually want the two fuel streams to balance the
central oxidiser, so I would check whether 1.95 is the intended design point or
an artefact of picking a common $\Delta p$.

**Probing:** whether you split the fuel flow between the two holes and whether
you interpret the momentum ratio rather than just reporting it.
**Follow-up:** "How would you get the momentum ratio to 1.0 without changing
the mixture ratio?"

### 124. [M07, M10, M11]
A circumferential erosion pattern that maps one-to-one onto the outer element
ring is a spray-impingement problem, not a general heat-transfer problem: the
outer elements' spray fans are reaching the wall before combustion is complete,
so you have near-stoichiometric or oxidiser-rich combustion happening *at* the
wall instead of in the core, and locally the gas-side temperature and the
oxidising environment are both far worse than the design assumption. [F][M]
Bartz cannot see this — it is exactly the injector-driven non-uniformity the
correlation is blind to — which is why the wall failed where the model said it
was comfortable. Two candidate fixes, in order of preference. First, change the
outer row: cant or rotate the elements so the fans point inward, recess them,
reduce their flow, or bias them fuel-rich so that whatever does reach the wall
is a fuel-rich, reducing mixture rather than an oxidising one. Second, add or
increase film cooling from a fuel ring just inside the wall, which is the
reliable fix and the one that costs you $I_{sp}$, so I would try to buy the
result with pattern changes before spending performance. Thickening the wall or
adding coolant flow treats the symptom and will fail again at a slightly later
time.

**Probing:** whether you go to the injector rather than the cooling circuit
first.
**Follow-up:** "The programme has no schedule for an injector rebuild. Defend
the film-cooling fix."

### 125. [M08, M14, M15]
A hard start is the ignition of an accumulated charge: propellant enters the
chamber, fails to ignite promptly, collects in the chamber, the dribble volumes
downstream of the valves and the injector manifolds, and then ignites all at
once, releasing in a millisecond the energy that the design assumed would be
released over a residence time. The peak pressure can be several times $p_c$
and it is a detonation-like transient, so it loads the injector face, the
chamber, and — through the feed lines — the pumps. [F][H] In a pump-fed engine
the mechanism has an extra ingredient: the pumps are spinning up, so flow and
pressure are transient and the mixture ratio during the first tens of
milliseconds is whatever the two pumps' spin-up characteristics happen to
produce, which is frequently far from nominal and often oxidiser-rich. Three
design features that prevent it: an ignition *permissive* — igniter-established
detection (torch chamber pressure or thermocouple) as a hard interlock before
either main valve opens, rather than an open-loop timer; a controlled sequence
with fuel lead and staged valve opening so the chamber never contains an
unignited stoichiometric charge, with the dribble volumes minimised by putting
the valves as close to the injector as the design allows; and a start
sequence that brings the chamber up at a controlled rate — ramped valve
opening, a start orifice or a low-flow start position — so that even a delayed
light-off has a small charge to consume. [M] The fourth, which is procedural
but real, is a purge that guarantees the chamber is inert before the sequence
begins.

**Probing:** whether you name the dribble volume and the permissive, which are
the two things that actually change the outcome.
**Follow-up:** "How would you size the maximum dribble volume you can tolerate?"

### 126. [M09, M03]
With $\gamma = 1.22$ and $c^* = 2300$ m/s, vacuum:
$\varepsilon = 77$ gives $C_f = 1.910$ and $I_{sp} = \mathbf{447.9\ s}$;
$\varepsilon = 285$ gives $C_f = 1.981$ and $I_{sp} = \mathbf{464.5\ s}$;
the ideal gain is **16.6 s**. [F] The RL10B-2's extendible carbon–carbon
nozzle is credited with about **30 s**, roughly double, and the difference is
instructive rather than embarrassing. The 77:1 "retracted" figure is not a
firing configuration — the engine does not run stowed — so the honest baseline
for the ~30 s claim is the nozzle the stage could carry *without* extension
given its interstage length, which is nearer 40:1; redo the sum from 40:1 to
285:1 and you get 27.4 s, which is the same claim. Carry the caveats: the
RL10B-2's area ratio is **contested at 280:1 versus 285:1**, its chamber
pressure is not published by the manufacturer at all, and the 465.5 s flight
$I_{sp}$ is the highest of any flown chemical engine, so it is a figure people
quote loosely. (Engine database note A.2.7.)

**Probing:** whether you interrogate the baseline instead of concluding the
published figure is wrong.
**Follow-up:** "What does the extension mechanism cost you in mass and
reliability, and does the 30 s survive that?"

### 127. [M09, M35]
Dual-bell: the contour has a deliberate inflection so the flow separates at the
inflection at low altitude (running at the lower area ratio) and attaches to
the full extension in vacuum. The technical problems are that the transition is
hysteretic and not perfectly repeatable, that it happens at a particular
ambient pressure which is a particular altitude and therefore a particular
trajectory — so a trajectory change moves the transition into a phase where you
did not want it — and that during transition the flow is unsteady and generates
significant side loads on a nozzle that is, by construction, long. [R][J]
Sea-level operation also means the extension is a large piece of hardware doing
nothing but adding mass and wetted area during the phase when thrust matters
most. Aerospike: the performance argument is sound but the hardware is not. The
spike is a large, continuously curved surface exposed to the full combustion
gas along its entire length, so it must be cooled everywhere — the ratio of
cooled surface area to thrust is far worse than a bell — and truncating it to
manage that reintroduces a base region whose base pressure, and hence thrust,
is a difficult and Reynolds-number-sensitive prediction. Segmented combustion
around the annulus multiplies the number of injector and ignition interfaces,
and gimballing a linear or annular aerospike is a structural problem with no
good answer. [Dressler00] Neither has failed on physics; both have failed on
mass, cooling and controllability, which is a different and more stubborn kind
of problem.

**Probing:** whether you say "cooled area per unit thrust" for the aerospike and
"transition repeatability and side loads" for the dual-bell.
**Follow-up:** "If you had to fly one of them next year, which, and on what
stage?"

### 128. [M10, M11]
Bartz scales $h_g$ with $(A_t/A)^{0.9}$, so relative to the throat:
at $A/A_t = 2.5$ in the chamber, $h_g/h_{g,t} = (1/2.5)^{0.9} =
\mathbf{0.438}$; at $A/A_t = 10$ in the nozzle,
$(1/10)^{0.9} = \mathbf{0.126}$. [E][Bartz57] So the chamber runs at about 44 %
of throat coefficient and the downstream nozzle at 13 %, and the actual heat
*flux* ratios are a little different again because $T_{aw}$ falls with Mach
number downstream while the wall temperature target does not. The cooling
circuit therefore needs its margin concentrated in a short axial band around
the throat — that is where the channels get narrow and tall, where the coolant
is fastest and where the wall is thinnest — and it can afford to be generous
downstream, which is why nozzle extensions can be film-cooled, dump-cooled,
ablative or radiatively cooled while the throat cannot. The trap is the chamber
number: 44 % of a large flux is still a large flux, over a much larger area
than the throat, so the chamber dominates the *total* heat load and therefore
the coolant bulk temperature rise even though the throat dominates the *peak*.

**Probing:** whether you distinguish peak flux from total load, which are
managed by different design decisions.
**Follow-up:** "So which one sizes your coolant flow rate?"

### 129. [M11, M10, M06]
Film-cooling propellant is not thrown away — it goes out of the nozzle like
everything else and produces thrust. What it loses is only the difference
between the $I_{sp}$ of the core flow and the $I_{sp}$ of a cooler, off-mixture
peripheral layer, and since that layer still expands through the same nozzle
and still has substantial enthalpy, the loss is a fraction of its mass flow
rather than all of it. [F][A] A typical rule is that 3–5 % of the fuel diverted
to a film costs 0.5–1.5 % of $I_{sp}$ — roughly a third of the naive
expectation. Two further effects push the same way: the film mixes into the
core as it travels, so downstream of the first few chamber diameters it is
mostly part of the main flow anyway, and by protecting the wall it lets you run
a hotter core or a higher chamber pressure that you could not otherwise afford,
which can return more than it costs. The argument breaks down when the film is
so heavy that a genuinely unburnt, cold fuel layer survives all the way to the
exit — then you really are paying full price for that mass — and it breaks
down in the other direction for small chambers, where the wall area per unit
flow is large, the film must be a bigger fraction, and the mixing length is
short compared with the chamber. That is one of the reasons small thrusters
deliver a lower fraction of theoretical $I_{sp}$.

**Probing:** whether you can say why the loss is much less than the diverted
fraction, and then find the case where it is not.
**Follow-up:** "How would you measure the film-cooling $I_{sp}$ penalty on a
test stand?"

### 130. [M11, M10]
Hydraulic diameter $D_h = 4A/P = 4(0.0015\times0.0045)/
(2(0.0015+0.0045)) = \mathbf{2.25\times10^{-3}\ m}$.
$Re = \rho v D_h/\mu = 810\times6.0\times0.00225/7.5\times10^{-4} =
\mathbf{1.46\times10^{4}}$.
$Pr = \mu c_p/k = 7.5\times10^{-4}\times2100/0.13 = \mathbf{12.1}$.
Dittus–Boelter: $h = 0.023(k/D_h)Re^{0.8}Pr^{0.4} =
\mathbf{7.72\times10^{3}\ W/(m^2K)}$. [E] Comment before you hand that over:
$Re = 1.5\times10^{4}$ is only just turbulent, and Dittus–Boelter is a
correlation for fully developed turbulent flow in a smooth straight round tube
with modest property variation — this is a short high-aspect-ratio rectangular
channel with a strongly heated wall, curvature, and a fluid whose viscosity
falls by a large factor across the film. Expect the correlation to be optimistic
on the heated side and to miss the corner effects entirely; a Sieder–Tate
viscosity correction or a rectangular-duct and entrance-length correction is the
minimum fix, and the real number comes from a heated-tube test with the actual
fluid. 6 m/s is also on the low side for a throat channel — most designs run
10–30 m/s there, which is what buys the $Re^{0.8}$.

**Probing:** whether you challenge the correlation's applicability rather than
just evaluating it.
**Follow-up:** "Raise the velocity to 20 m/s. What happens to $h$, and what
happens to your pump discharge pressure?"
