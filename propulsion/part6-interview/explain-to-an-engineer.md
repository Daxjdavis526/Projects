# "Explain this to an engineer"

Part VI · Prerequisites: all modules · Estimated time: 25–40 h to work
through out loud

**Model answers are in [`explain-to-an-engineer-key.md`](explain-to-an-engineer-key.md).**
Do not open it until you have spoken your answer. The failure mode this drill
exists to prevent is the candidate who can recognise a correct answer but
cannot generate one.

---

## What this drill is

The 200-question bank tests whether you *know* the material. This one tests
whether you can **transmit** it. Every prompt below is a "why", "how" or
"what happens if" that a senior propulsion engineer might drop on you across a
table, in a design review, or at a whiteboard between two other meetings.

The target is **60 to 120 seconds, spoken, no notes**. That is roughly 150 to
300 words. It is short enough that you cannot ramble and long enough that a
hand-wave is audible.

## The shape of an answer that lands

Every prompt in this file has a real mechanism behind it. A good spoken answer
has five parts, in this order:

1. **The one-sentence physics.** The conservation law, thermodynamic
   statement, or observed phenomenon the whole thing rests on. If you cannot
   say this in one sentence you do not understand the question yet.
2. **The mechanism.** *How* the physics produces the effect. This is the part
   that separates a candidate who read a table from one who read a chapter.
3. **The quantitative hook.** A scaling law, a ratio, or a number from a real
   engine — with its provenance. "Chamber pressure went from 70 bar on the F-1
   to 206 bar on the RS-25" is worth more than three sentences of adjectives.
4. **The trade-off or exception.** What you gave up, or the case where the
   argument fails. Senior engineers listen for this specifically; an answer
   with no cost in it reads as a sales pitch.
5. **Stop.** Do not fill the silence. Let them ask the follow-up.

The key gives a model answer in exactly that structure, plus the **follow-up
they will ask** — because the follow-up is usually the real question and the
first prompt was only the setup.

## Rules of the drill

- **Speak it, on a timer.** An answer you can only write is an answer you will
  not produce under pressure.
- **Quote a number, own its provenance.** Every real-engine figure in the key
  comes from [`reference/_verify-liquid.md`](../reference/_verify-liquid.md),
  [`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
  or [`reference/engine-database.md`](../reference/engine-database.md), with
  its caveat attached. "About 70 bar, though the F-1 literature runs from 965
  to 1,125 psia depending on which measurement station you're reading" is a
  *stronger* answer than a confident "70 bar", not a weaker one. If you do not
  know a number, say the scaling law instead — never invent a figure.
- **Say when a figure is a company claim.** Raptor, BE-4, BE-3U, Archimedes,
  Prometheus and BOLE numbers are unaudited manufacturer statements. Treating
  them as measured data is the fastest way to lose a technical interviewer.
- **Do not answer a question you were not asked.** If the prompt is about
  injector pressure drop, do not deliver a lecture on instability. Mention the
  coupling in one clause and stop.

## Conventions

SI throughout. $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$. $p_c$ is injector-face stagnation
pressure unless stated. "Isp" means seconds; vacuum or sea level is always
specified. Bracketed tags give the module(s) the prompt draws on — `[M07]` is
Module 07, Injectors.

## Index

| # | group | prompts |
|---|---|---|
| A | Thermodynamics and compressible flow | 1–9 |
| B | Performance | 10–17 |
| C | Thermochemistry | 18–23 |
| D | Propellants | 24–30 |
| E | Combustion chambers | 31–35 |
| F | Injectors | 36–42 |
| G | Ignition | 43–46 |
| H | Nozzles | 47–54 |
| I | Heat transfer and cooling | 55–62 |
| J | Feed systems and turbopumps | 63–69 |
| K | Engine cycles | 70–76 |
| L | Valves and plumbing | 77–80 |
| M | Combustion instability | 81–85 |
| N | Materials | 86–90 |
| O | Manufacturing | 91–94 |
| P | Testing | 95–98 |
| Q | Solid rocket motors | 99–110 |
| R | Cold gas | 111–116 |
| S | Systems, history and judgment | 117–123 |

Six of these — 1, 10, 24, 36, 55 and 99 — are the course's seed prompts. If
you can only rehearse six, rehearse those; they are the ones that actually get
asked.

---

## A. Thermodynamics and compressible flow (1–9)

1. **Why does chamber pressure matter?** `[M01][M03][M09]`

2. **Why is the flow at the throat sonic, and what actually changes downstream
   if I raise the back pressure on a running engine?** `[M02]`

3. **How does the mass flow through a choked throat depend on chamber
   pressure and chamber temperature, and why does that make the throat the
   engine's flow meter?** `[M02][M03]`

4. **Why does a converging–diverging duct accelerate a gas that a purely
   converging duct cannot?** `[M02]`

5. **What happens to exhaust velocity if I double the flame temperature?**
   `[M01][M03]`

6. **Why does the molecular weight of the exhaust matter more than its
   temperature?** `[M01][M04]`

7. **Why is the stagnation pressure at the injector face higher than at the
   throat, and roughly by how much?** `[M01][M02]`

8. **What happens if the ratio of specific heats of my product gas drops from
   1.25 to 1.15 — where does that show up in the engine?** `[M01][M02]`

9. **Why is chemical rocket exhaust velocity stuck at around 4,500 m/s, no
   matter how clever the engine is?** `[M01][M04]`

---

## B. Performance (10–17)

10. **Why isn't maximum flame temperature necessarily maximum Isp?**
    `[M03][M04][M05]`

11. **Why do we split specific impulse into $c^*$ and $C_F$, and what does each
    one tell you about a hot fire that came in low?** `[M03][M18]`

12. **Why does an engine's Isp climb with altitude, and how much of that is the
    pressure-thrust term?** `[M03][M09]`

13. **How can HM7B at 37 bar beat the RD-180 at 267 bar by more than 100
    seconds of Isp?** `[M03][M09]`

14. **Why does the same engine have three different published thrust ratings,
    and how do you tell which one somebody means?** `[M03][M18]`

15. **What happens to delivered Isp and to the vehicle if $c^*$ efficiency
    comes in 2% low?** `[M03][M07][M18]`

16. **Why do we care about density impulse and not just Isp?**
    `[M03][M05][M33]`

17. **How would you estimate a throat diameter given only thrust, chamber
    pressure and expansion ratio?** `[M03][M09]`

---

## C. Thermochemistry (18–23)

18. **Why do rockets run fuel-rich rather than at the stoichiometric mixture
    ratio?** `[M04][M05]`

19. **What is the difference between frozen and equilibrium expansion, and
    which one is closer to what the engine actually does?** `[M04][M09]`

20. **Why does recombination in the nozzle give you Isp back, and where in the
    nozzle does it stop happening?** `[M04][M09]`

21. **Why did Vulcain 2 raise mixture ratio from 5.3 to 6.1 and accept a
    *lower* Isp than Vulcain 1?** `[M04][M05][M33]`

22. **How does aluminium in a solid propellant raise performance while
    lowering the effective ratio of specific heats?** `[M04][M19]`

23. **What do you do when your CEA prediction and your measured $c^*$ disagree
    by 5%?** `[M04][M18]`

---

## D. Propellants (24–30)

24. **Why does hydrogen provide excellent Isp but poor density?** `[M05][M01]`

25. **Why did methane displace kerosene for the current generation of
    reusable engines?** `[M05][M13][M16]`

26. **Why is RP-1 coking a design constraint, and where exactly does it
    bite?** `[M05][M10][M11]`

27. **Why are toxic hypergolic storables still the default on spacecraft in
    2026?** `[M05][M08][M33]`

28. **What actually changes when you subcool your propellants?**
    `[M05][M12][M33]`

29. **Why is high-test peroxide such an attractive propellant on paper, and
    why did it lose?** `[M05][M08]`

30. **Why does the choice of fuel constrain the cooling method more than the
    cooling method constrains the fuel?** `[M05][M11]`

---

## E. Combustion chambers (31–35)

31. **Why does a chamber need a characteristic length $L^*$, and what goes
    wrong at each end of the range?** `[M06][M07]`

32. **Why does contraction ratio matter if the chamber flow is subsonic
    anyway?** `[M06][M02]`

33. **What happens if the chamber is too short for the propellant you
    chose?** `[M06][M07]`

34. **Why did Glushko put four small chambers on one turbopump instead of
    building one big chamber?** `[M06][M15][M26]`

35. **Why can't you scale a working small chamber up by a factor of ten?**
    `[M06][M15][M10]`

---

## F. Injectors (36–42)

36. **Why does an injector need pressure drop?** `[M07][M15]`

37. **Why do LOX/LH2 engines use coaxial shear elements while kerolox engines
    use impinging doublets?** `[M07][M05]`

38. **How does a pintle injector throttle 10:1 when a fixed-orifice injector
    cannot?** `[M07][M13]`

39. **Why does an injector face have a cooling problem at all, when everything
    arriving at it is cold?** `[M07][M10]`

40. **What happens if the fuel and oxidizer manifolds fill at different rates
    during start?** `[M07][M08]`

41. **Why does element size trade against combustion efficiency and stability
    in opposite directions?** `[M07][M15]`

42. **When is cavitation in an injector orifice actually useful?**
    `[M07][M14]`

---

## G. Ignition (43–46)

43. **Why is a hard start a pressure problem rather than a temperature
    problem?** `[M08][M15]`

44. **Why does an augmented spark igniter beat a pyrotechnic cartridge for a
    restartable engine?** `[M08][M13]`

45. **What happens when a hypergolic pair has an ignition delay?**
    `[M08][M05]`

46. **Why does oxidizer-lead versus fuel-lead sequencing matter so much?**
    `[M08][M07][M16]`

---

## H. Nozzles (47–54)

47. **Why does a bell nozzle beat a cone at the same expansion ratio and the
    same length?** `[M09]`

48. **Why is there an optimum expansion ratio for a first stage, and why is it
    lower than students expect?** `[M09][M03]`

49. **What happens when a nozzle is overexpanded enough to separate, and why
    is that not automatically a failure?** `[M09][M16]`

50. **Why do start-up side loads damage gimbal actuators, and what did the
    LE-7A do about it?** `[M09][M16][M18]`

51. **Why bother with an extendible nozzle instead of just building a longer
    fixed one?** `[M09][M33]`

52. **Why do two credible sources give the RS-25's expansion ratio as 69 and
    as 77.5?** `[M09][M03]`

53. **What happens to performance if the throat erodes by 2%?**
    `[M09][M24][M03]`

54. **Why does nozzle divergence angle cost you thrust, and how much?**
    `[M09]`

---

## I. Heat transfer and cooling (55–62)

55. **Why does regenerative cooling complicate engine design?**
    `[M11][M12][M13]`

56. **Why is the throat the hottest place in the engine, and what sets the
    heat flux there?** `[M10][M09]`

57. **What does raising chamber pressure from 70 to 300 bar do to your cooling
    problem?** `[M10][M11]`

58. **Why does film cooling cost Isp, and when is that the right trade?**
    `[M11][M03]`

59. **Why use copper for a chamber liner when it melts at 1,356 K and the gas
    is at 3,600 K?** `[M11][M16]`

60. **Why does an ablative chamber have a burn-time limit while a regen
    chamber has a cycle limit?** `[M11][M16]`

61. **What happens if a coolant channel goes two-phase?** `[M11][M05]`

62. **Why can a coolant with excellent heat capacity still fail you?**
    `[M11][M12]`

---

## J. Feed systems and turbopumps (63–69)

63. **Why does a pressure-fed engine have low chamber pressure, and what
    exactly sets the ceiling?** `[M12][M13]`

64. **Why do rocket pumps need an inducer?** `[M12]`

65. **How does NPSH available connect to the mass of the propellant tank?**
    `[M12][M33]`

66. **Why does the F-1 turbopump need 41 MW — can you get that number from the
    propellant flows?** `[M12][M03]`

67. **Why do rocket turbopumps run so fast, and what stops them running
    faster?** `[M12][M16]`

68. **What breaks first when you throttle a turbopump-fed engine deeply?**
    `[M12][M13]`

69. **Why did Rutherford use electric pumps, and where does that argument stop
    working?** `[M12][M33]`

---

## K. Engine cycles (70–76)

70. **Why does the gas generator cycle cost you Isp, and how much?**
    `[M13][M03]`

71. **Why does the closed expander cycle have a thrust ceiling?**
    `[M13][M11]`

72. **How does expander bleed escape that ceiling, and what does it pay?**
    `[M13][M11]`

73. **Why did the West avoid oxidizer-rich staged combustion for thirty
    years?** `[M13][M16]`

74. **What does full-flow staged combustion buy you that oxidizer-rich staged
    combustion does not?** `[M13][M16]`

75. **Why is the tap-off cycle attractive, and why is it so rare?**
    `[M13][M08]`

76. **Why would a company deliberately choose a lower-performing cycle?**
    `[M13][M33]`

---

## L. Valves and plumbing (77–80)

77. **Why does a main valve's opening rate matter as much as its flow area?**
    `[M14][M08]`

78. **Why is water hammer a real design load in a rocket feed line?**
    `[M14][M12]`

79. **What happens if a check valve lets oxidizer back into a helium line?**
    `[M14][M34]`

80. **Why do engines use burst discs and pyrotechnic devices where a valve
    would seem more sensible?** `[M14][M08]`

---

## M. Combustion instability (81–85)

81. **Why does combustion instability appear suddenly rather than growing
    gradually?** `[M15]`

82. **What is the difference between chug, buzz and screech, and what fixes
    each?** `[M15][M07]`

83. **Why do baffles work, and what do they cost you?** `[M15][M07]`

84. **Why would you detonate a bomb inside a working engine?** `[M15][M18]`

85. **Why does the RS-25 need acoustic cavities when the RD-0120 apparently
    did not?** `[M15][M16]`

---

## N. Materials (86–90)

86. **Why does hydrogen embrittle the metals that contain it?** `[M16][M05]`

87. **Why does low-cycle thermal fatigue kill a regen chamber before creep
    does?** `[M16][M11]`

88. **Why is a copper liner closed out with electroformed nickel rather than
    just made thicker?** `[M16][M17]`

89. **What does an enamel coating actually do in an oxidizer-rich turbine?**
    `[M16][M13]`

90. **Why is niobium the default radiatively cooled nozzle material, and what
    displaced it?** `[M16][M11]`

---

## O. Manufacturing (91–94)

91. **Why did tube-wall chambers give way to milled channels, and then to
    printed ones?** `[M17][M11]`

92. **What does additive manufacturing actually change about an engine's
    cost?** `[M17][M33]`

93. **Why does one brazed joint set the schedule for a whole chamber build?**
    `[M17][M16]`

94. **Why is the Vulcain 2.1 nozzle the most-quoted manufacturing result in
    European propulsion?** `[M17][M09]`

---

## P. Testing (95–98)

95. **What do you measure on a hot fire, and which measurement do you trust
    least?** `[M18]`

96. **Why is $c^*$ efficiency the first number you look at after a test?**
    `[M18][M03]`

97. **How would you tell an injector problem from a nozzle problem from the
    data alone?** `[M18][M07][M09]`

98. **Why does altitude-simulation testing cost so much, and when can you skip
    it?** `[M18][M09]`

---

## Q. Solid rocket motors (99–110)

99. **Why are solid motors attractive for some missions?** `[M19][M32]`

100. **Why does the burn-rate exponent $n$ have to be less than 1?**
     `[M20][M19]`

101. **What happens if the grain is 10 K colder than the temperature it was
     qualified at?** `[M20][M19]`

102. **Why does grain geometry determine the thrust trace, and how do you get
     neutral burning?** `[M21]`

103. **Why is $K_n$ the variable a solid designer actually works in?**
     `[M20][M21]`

104. **Why do filament-wound composite cases beat segmented steel, and by how
     much?** `[M22][M32]`

105. **Why did the Shuttle field joint fail, and what was actually
     redesigned?** `[M22][M34]`

106. **What does the liner do that the insulation does not?** `[M23]`

107. **Why does a solid nozzle throat erode, and what does that do to the
     thrust trace?** `[M24][M20]`

108. **Why is thrust vector control harder on a solid than on a liquid?**
     `[M24][M27]`

109. **Why can a solid motor only be shut down violently?** `[M21][M27]`

110. **Why does a 0.2 percentage-point change in iron oxide loading matter?**
     `[M20][M25]`

---

## R. Cold gas (111–116)

111. **Why does a cold-gas thruster get 70 seconds when a bipropellant gets
     300?** `[M28][M01]`

112. **Why did MarCO fly a 40-second-Isp propellant to Mars?**
     `[M28][M31][M33]`

113. **Why does a real cold-gas thruster deliver only about 90% of its ideal
     Isp?** `[M29][M28]`

114. **How does blowdown regulation change your mission design?**
     `[M29][M30]`

115. **Why does a cold-gas system's leak rate matter more than its Isp?**
     `[M30][M31]`

116. **What happens if you heat the gas, and why isn't that always done?**
     `[M29][M28]`

---

## S. Systems, history and judgment (117–123)

117. **Why is the propulsion choice a vehicle decision rather than an engine
     decision?** `[M32][M33]`

118. **Why did the RS-68 deliberately give up performance?**
     `[M13][M33][M35]`

119. **Why is engine reliability more about part count than about margin?**
     `[M33][M34]`

120. **What does a propulsion failure investigation actually look for?**
     `[M34][M18]`

121. **Why did the same lesson get learned three times — V-2, Atlas,
     Vega-C?** `[M34][M35]`

122. **What does it cost to develop an engine decoupled from a vehicle
     commitment?** `[M33][M35]`

123. **Why should you be suspicious of a published Raptor number, and how do
     you say so without sounding like a crank?** `[M36][M33]`

---

## Scoring yourself

Record three of your answers and listen back. Score each out of 5:

| | criterion |
|---|---|
| 1 | Did you open with the physics in one sentence, or did you start narrating? |
| 2 | Did you name a mechanism, or only an outcome? |
| 3 | Did you give a number or a scaling law, with its provenance? |
| 4 | Did you name the cost, the exception, or the case where it fails? |
| 5 | Did you stop, or did you keep talking after you were finished? |

Below 15/25 across three answers, you are not ready to be interviewed on this
material regardless of what you know. Criterion 5 is the one nearly everyone
fails first.
