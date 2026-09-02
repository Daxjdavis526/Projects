# Whiteboard Problems

Part VI · Prerequisites: all modules · Estimated time: 30 problems × 5–20 min,
plus the traps; ≈ 6–8 h to work the set once, honestly

These are not homework problems. They are the problems as an interviewer puts
them: one to four sentences, spoken, no given/find, no diagram, and — in about
half the set — **deliberately missing an input you need**. That omission is not
sloppiness on the interviewer's part. It is the question. A candidate who says
"assume $\gamma = 1.2$, frozen flow, ideal expansion, and I'll carry a $c^*$
efficiency of 0.95" and then computes has already passed most of the bar. A
candidate who asks "what's gamma?" and stops has not.

**Answers are in
[`whiteboard-problems-key.md`](whiteboard-problems-key.md).** Work each problem
on paper, out loud, on a timer, before you open it.

---

## How to use this set

- **Stand up and use a whiteboard or a sheet of paper.** Every one of these is
  reachable with arithmetic you can do in your head to one significant figure
  and on paper to three. If you reach for a calculator before you have written
  the governing equation, you are doing it in the wrong order.
- **Say your assumptions before your first number.** The key lists, for every
  problem, the assumptions a strong candidate states out loud. Score yourself
  on those separately from the arithmetic — they are worth more.
- **Carry an order-of-magnitude sanity check to the end.** Every solution in
  the key ends by comparing the answer to a real engine from
  [`reference/engine-database.md`](../reference/engine-database.md). If your
  answer says a 500 kN engine has a 2 m throat, the interview is over
  regardless of your algebra.
- **Expected time is the time to a defended answer**, spoken, including the
  assumptions and the sanity check — not the time to a number.
- **Under-specified problems are marked.** They are marked *here*, for study.
  In a real interview nobody marks them.

## Conventions

SI throughout. $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. $p_c$ is injector-face stagnation
pressure unless stated. "Isp" means seconds; vacuum or sea level is always
specified. Bracketed tags give the module(s) the problem draws on — `[M09]` is
Module 09, Nozzles. Real-engine numbers used as sanity checks come from
[`reference/_verify-liquid.md`](../reference/_verify-liquid.md),
[`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
and [`reference/engine-database.md`](../reference/engine-database.md), and
carry those files' caveats: several are company claims, several are contested,
and a few are marked "not reliably published" and are not quoted at all.

## Numbers worth memorising before you start

You will not be given these. Carry them.

| quantity | value to carry |
|---|---|
| $\gamma$, hydrocarbon/LOX or hydrolox combustion gas | 1.20 (methalox ≈ 1.16, hydrolox ≈ 1.19) |
| $c^*$, LOX/RP-1 | ≈ 1800 m/s ideal, ≈ 1730 m/s delivered |
| $c^*$, LOX/LH2 | ≈ 2350 m/s ideal |
| $c^*$, LOX/CH4 | ≈ 1880 m/s ideal |
| $C_F$ vacuum | 1.8 at $\varepsilon\approx16$, 1.9 at $\varepsilon\approx60$, 2.0 at $\varepsilon\approx240$ |
| $C_F$ sea level, near-optimum | 1.5–1.65 |
| $\eta_{c^*}$ | 0.92–0.99; assume 0.95–0.96 unless told |
| throat heat flux, regen hydrocarbon at 100 bar | tens of MW/m²; RS-25 throat ≈ 100–160 MW/m² |
| $L^*$ | 0.8–1.3 m hydrocarbon, 0.6–1.0 m hydrolox |
| injector $\Delta p / p_c$ | 0.15–0.25 stable; below ~0.10 expect chug |
| cold-gas GN₂ Isp | ≈ 77 s frozen-ideal at $\varepsilon=50$, ≈ 65–73 s delivered |
| solid pressure exponent $n$ | 0.2–0.5 for civil AP composites; large boosters 0.25–0.40 |

## Index

| # | problem | min | modules |
|---|---|---|---|
| 1 | Thrust from $p_c$, $A_t$, $\varepsilon$ | 8 | M03, M09 |
| 2 | Throat area from thrust and $C_F$ | 5 | M03 |
| 3 | Mass flow and propellant load from thrust and Isp | 5 | M03, M05 |
| 4 | Two expansion ratios, one first stage | 15 | M09 |
| 5 | Sea-level test of a $\varepsilon=150$ upper stage | 12 | M09, M18 |
| 6 | Throat heat flux, order of magnitude | 15 | M10 |
| 7 | Propellants for a lunar descent stage | 15 | M05, M32 |
| 8 | Six scorch streaks and a burn-through | 10 | M07, M10, M34 |
| 9 | Cold-gas tank for a 6U CubeSat | 15 | M28, M29, M31 |
| 10 | Two firings, one throat change: find $n$ | 10 | M19, M20 |
| 11 | Cycle for a restartable hydrolox upper stage | 12 | M13 |
| 12 | Two-stage payload fraction | 15 | M03, M33 |
| 13 | Turbopump shaft power | 12 | M12 |
| 14 | NPSH on a LOX pump | 12 | M12 |
| 15 | Regen channel sanity check | 15 | M11, M10 |
| 16 | Thrust of a 300-bar methalox engine | 8 | M03, M09 |
| 17 | Size the nozzle for a sea-level-optimum booster | 12 | M03, M09 |
| 18 | Nine engines, 400 tonnes, how long? | 5 | M03 |
| 19 | Is 80:1 worth it over 40:1? | 10 | M09, M33 |
| 20 | Double the chamber pressure | 10 | M10, M11 |
| 21 | RP-1 or methane for a reusable booster | 15 | M05, M32 |
| 22 | A 120 Hz oscillation at 60 % throttle | 12 | M07, M15 |
| 23 | $c^*$ down 3 %, mixture ratio shifted, face eroded | 15 | M07, M18 |
| 24 | Minimum impulse bit and pointing | 10 | M29, M30 |
| 25 | A 12 % pressure step at t = 4 s | 12 | M20, M21, M34 |
| 26 | Cycle for a hundred-flight methalox booster | 15 | M13, M16, M36 |
| 27 | Chamber liner material at 300 bar | 12 | M16, M11, M17 |
| 28 | Uncertainty on a measured Isp | 12 | M18 |
| 29 | What would you measure first? | 12 | M18, M34 |
| 30 | Size the whole engine | 20 | M03, M06, M09 |

---

# The problems

## Block A — Thrust, throat, flow

**1.** Chamber pressure 100 bar, throat diameter 250 mm, area ratio 25. How
much thrust? *(Under-specified: nothing is said about propellant, ambient
pressure, or efficiency.)* — **8 min** — [M03, M09]

**2.** I need 500 kN of vacuum thrust and my chamber runs at 80 bar. How big is
the throat? *(Under-specified.)* — **5 min** — [M03]

**3.** An engine makes 90 kN in vacuum at 340 s. What is the propellant flow
rate, and how much propellant does a 400-second burn consume? Split it into
oxidiser and fuel. *(Under-specified: the split.)* — **5 min** — [M03, M05]

**16.** A methalox engine runs at 300 bar with a 130 mm throat and an area
ratio of 40. Give me sea-level and vacuum thrust, and tell me whether that
nozzle will run attached on the pad. — **8 min** — [M03, M09]

**17.** Booster engine, 1.8 MN at sea level, chamber pressure 110 bar, nozzle
sized for optimum expansion at sea level. Give me the throat diameter and the
exit diameter. Then tell me what it does in vacuum. — **12 min** — [M03, M09]

**18.** Nine engines, 7.6 MN of liftoff thrust, sea-level Isp 282 s. The first
stage carries 400 tonnes of propellant. How long does it burn? What have you
ignored? — **5 min** — [M03]

## Block B — Expansion ratio and altitude

**4.** Same combustion chamber, two nozzles: area ratio 16 and area ratio 60.
Sketch thrust against altitude for both on the board. Where do they cross, and
which one goes on the first stage? — **15 min** — [M09]

**5.** Your upper-stage engine has an area ratio of 150 and a chamber pressure
of 60 bar. Acceptance testing is at sea level. Talk me through it. — **12 min**
— [M09, M18]

**19.** Marketing wants the area ratio taken from 40 to 80 on a vacuum engine.
How much Isp does that buy, and what does it cost? — **10 min** — [M09, M33]

## Block C — Heat transfer and cooling

**6.** Rough out the throat heat flux for a LOX/RP-1 engine at 100 bar with a
200 mm throat. Order of magnitude is fine, but tell me how confident you are.
*(Under-specified: gas properties, wall temperature.)* — **15 min** — [M10]

**20.** Same engine, and the programme doubles the chamber pressure to 200 bar
with the same thrust. What happens to the throat heat flux, and what happens to
the regenerative cooling circuit? — **10 min** — [M10, M11]

**15.** A regen jacket has 200 rectangular channels, 1.5 mm wide and 3 mm deep,
carrying all 50 kg/s of the RP-1. Chamber pressure is 100 bar and the throat is
200 mm. Is that a sane channel? — **15 min** — [M11, M10]

## Block D — Propellant and cycle choice

**7.** Lunar descent stage. LOX/LH2, LOX/CH4, or NTO/MMH. Argue it. — **15 min**
— [M05, M32]

**21.** First stage of a reusable launch vehicle: LOX/RP-1 or LOX/CH4. Pick one
and defend it. — **15 min** — [M05, M32]

**11.** Hydrolox upper stage, 100 kN, has to restart three times over six hours
and has to have the best Isp you can give me. What cycle? — **12 min** — [M13]

**26.** Methalox booster engine, 2.5 MN sea level, and the customer wants a
hundred flights between overhauls. Gas generator, oxidiser-rich staged
combustion, or full-flow staged combustion? — **15 min** — [M13, M16, M36]

**27.** You are choosing the combustion-chamber liner material for a reusable
methalox engine at 300 bar. GRCop-42, NARloy-Z, or Inconel 718. Which, and what
would change your mind? — **12 min** — [M16, M11, M17]

## Block E — Injector diagnosis

**8.** We pulled the engine after a 20-second hot fire. There are six axial
scorch streaks on the chamber wall, evenly spaced around the circumference, and
one of them has burned through the liner. Diagnose it. — **10 min** — [M07,
M10, M34]

**22.** Chamber pressure shows a 120 Hz oscillation at about 15 % peak-to-peak,
only at 60 % throttle. It is clean at full thrust and clean at 40 %. What is it
and what do you do? — **12 min** — [M07, M15]

**23.** Between test 4 and test 5, with identical valve positions and identical
tank pressures, $c^*$ efficiency dropped from 0.96 to 0.93 and the measured
mixture ratio moved from 2.30 to 2.10. Post-test, the injector face shows
erosion around the central elements. What is your story? — **15 min** — [M07,
M18]

## Block F — Cold gas

**9.** A 12 kg 6U CubeSat needs 25 m/s of Δv. Size me a cold-gas system.
*(Under-specified: propellant, storage pressure, blowdown range.)* — **15 min**
— [M28, M29, M31]

**24.** A 50 mN cold-gas attitude thruster has a 10 ms minimum electrical pulse.
What is the minimum impulse bit, and what does it mean for how finely you can
point the spacecraft? — **10 min** — [M29, M30]

## Block G — Solid motors

**10.** Two static firings of the same motor design, same propellant lot, same
conditioning temperature. The only difference is that the second motor's throat
area is 5 % larger. The first ran at 7.00 MPa, the second at 6.49 MPa. What is
the propellant's pressure exponent? — **10 min** — [M19, M20]

**25.** A motor's head-end pressure trace looks nominal through ignition and the
first four seconds. Then at t = 4 s the pressure steps up about 12 % in roughly
200 ms and holds the new level, with the same trace shape, for the rest of the
burn. What happened? — **12 min** — [M20, M21, M34]

## Block H — Feed system

**13.** LOX/RP-1 engine, 500 kN vacuum, 100 bar chamber. Estimate the turbopump
shaft power. — **12 min** — [M12]

**14.** LOX pump inlet: tank ullage 3.5 bar, 8 m of propellant above the pump,
half a bar of line loss. Is the NPSH adequate? *(Under-specified: propellant
temperature, pump speed, acceleration.)* — **12 min** — [M12]

## Block I — Vehicle, test, and measurement

**12.** Two-stage vehicle, 9.4 km/s of ideal Δv. Stage 1 Isp 300 s, stage 2 Isp
450 s, structural fraction 0.08 on both. What payload fraction do you get?
— **15 min** — [M03, M33]

**28.** Test stand: thrust cell good to ±0.5 %, oxidiser flowmeter ±1.0 %, fuel
flowmeter ±1.5 %, mixture ratio 2.3. What is the uncertainty on the Isp you
report? — **12 min** — [M18]

**29.** First hot fire of a new 50 kN engine. It aborted 1.2 seconds after
start; chamber pressure was falling before the abort. You have thirty channels
of data on the screen. What do you look at, and in what order? — **12 min** —
[M18, M34]

**30.** Size me an engine on the board: 250 kN vacuum, LOX/CH4, 90 bar chamber.
I want throat diameter, exit diameter, mass flow, and a chamber length. — **20
min** — [M03, M06, M09]

---

# Interviewer's traps

Ten short prompts. None of them takes five minutes. All of them are testing
whether you know what **not** to assume. Say what you would need to know before
you answer, and say why the obvious answer is a trap.

**T1.** "The RS-25's expansion ratio is 69:1." Is it?

**T2.** "Our engine makes 981 kN in vacuum, and the vacuum variant makes 981 kN
too, so the nozzle extension buys nothing." What is wrong with that sentence?

**T3.** "This solid motor produces 14.7 MN." Before you write that on the
board, what four questions do you ask?

**T4.** I tell you the chamber pressure is 250 bar. What have I not told you,
and how much could it matter?

**T5.** "Isp is 465 seconds, so the exhaust velocity is 4560 m/s." When is that
sentence false?

**T6.** You compute $C_F$ at sea level for an area ratio of 60 and get 1.31.
Why might that number be meaningless?

**T7.** A vendor quotes a Star 48B at 292.2 s. Your colleague's datasheet says
286.2 s. Who is wrong?

**T8.** "We measured 40 seconds of Isp on the cold-gas thruster, but the ideal
is 77, so the thruster is only 52 % efficient and we should redesign it." Take
that apart.

**T9.** "Bartz says the throat flux is 31 MW/m², so we need a 31 MW/m² cooling
circuit." Name three reasons that is the wrong number to design to.

**T10.** "Raptor runs at 300 bar, which beats the RS-25's 206 bar and the
RD-180's 267 bar." Everything in that sentence is a number someone published.
What is still wrong with it?
