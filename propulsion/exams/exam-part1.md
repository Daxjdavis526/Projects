# Part I Exam — Foundations (Modules 01–04)

**Time: 3 hours. Total: 100 points. Closed book except the permitted material below.**

Covers Module 01 (thermodynamics), Module 02 (compressible flow and nozzles),
Module 03 (thrust, $c^*$, $C_f$, $I_{sp}$) and Module 04 (thermochemistry and CEA).

---

## Instructions

- **SI units throughout.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p^\circ = 1$ bar, $T^\circ = 298.15$ K.
  Sea-level ambient $p_a = 101\,325$ Pa unless a question says otherwise.
- **Show every step and carry units.** Calculation questions are graded on method
  first: a correct setup with an arithmetic slip loses at most 30 % of the marks
  for that part; a correct number from a wrong setup scores zero.
- Quote answers to **four significant figures** unless the question says
  otherwise, and state the assumption behind any value you have to choose
  yourself.
- **Permitted:** a non-programmable calculator, the course equation sheet
  (`reference/equation-sheet.md`), and the printed extracts supplied inside the
  questions. Nothing else.
- Where a question hands you a published engine figure, **carry the
  verification file's caveat with it.** An answer that quotes a contested number
  as if it were exact loses marks even when the arithmetic is right.
- Marks are shown for every part. Sections may be attempted in any order.

| section | topic | points | suggested time |
|---|---|---|---|
| A | Thermodynamics | 20 | 30 min |
| B | Compressible flow and nozzles | 25 | 45 min |
| C | Rocket performance | 30 | 60 min |
| D | Thermochemistry and CEA | 25 | 45 min |

---

# Section A — Thermodynamics (20 points)

## A1 (4 points) — Multiple choice

A hot-fire test instruments a chamber at two stations: a transducer flush with
the **injector face**, and a wall tap immediately **upstream of the throat**
where the stagnation pressure is taken as the nozzle stagnation pressure. The
injector-face reading is consistently about 4 % higher than the nozzle
stagnation pressure. The chamber is regeneratively cooled, has a contraction
ratio of 2.2, and its walls are smooth.

The **dominant** cause of that 4 % is:

- **(a)** wall friction along the cylindrical section of the chamber;
- **(b)** heat release into a subsonic flow of finite cross-section, which
  raises the Mach number along the chamber and drops stagnation pressure
  (the Rayleigh effect), together with the static-to-stagnation difference
  associated with the chamber-exit Mach number;
- **(c)** the injector pressure drop, which is what the transducer is really
  reading;
- **(d)** dissociation in the chamber absorbing energy and thereby lowering the
  pressure downstream.

Choose one **and justify it in no more than two sentences.** State also which
of the two readings belongs in the denominator of $\eta_{c^*}$.

## A2 (8 points) — Mixture properties of a storable product gas

A CEA-class equilibrium run for **N$_2$O$_4$/MMH** at $r = 1.65$ and
$p_c = 12$ bar gives $T_0 = 3100$ K and the chamber composition below.

| species | H$_2$O | N$_2$ | CO | CO$_2$ | H$_2$ | OH | H | NO |
|---|---|---|---|---|---|---|---|---|
| mole fraction $x_i$ | 0.310 | 0.245 | 0.130 | 0.075 | 0.155 | 0.030 | 0.040 | 0.015 |
| $\mathcal{M}_i$ (kg/kmol) | 18.0153 | 28.0134 | 28.010 | 44.009 | 2.0159 | 17.0073 | 1.008 | 30.006 |
| $\bar c_{p,i}$ at 3100 K (J/(mol·K)) | 55.5 | 37.0 | 36.0 | 60.0 | 37.5 | 37.0 | 20.786 | 37.5 |

Compute, showing the mixture rule you use in each case:

- **(a)** the mean molar mass $\mathcal{M}$ and the specific gas constant $R$; **(2)**
- **(b)** the mass fractions of H$_2$O and of H$_2$; **(2)**
- **(c)** $c_p$ in J/(kg·K), $c_v$, and $\gamma$; **(2)**
- **(d)** the ideal characteristic velocity $c^*$ at this $T_0$. **(2)**

Finish with a one-line sanity check against the $c^*$ you would expect for a
storable bipropellant, and say which single property in the table is doing most
of the damage relative to LOX/LH$_2$.

## A3 (8 points) — Stagnation state, and two ways to get it wrong

A pressure tap in the cylindrical section of a chamber reads a **static**
pressure of 95.00 bar. At that station the gas has $\gamma = 1.20$,
$\mathcal{M} = 22.0$ kg/kmol, static temperature 3350 K, and Mach number 0.350.

- **(a)** Compute $R$, the local speed of sound, the flow velocity, the density,
  and the exact stagnation temperature and stagnation pressure at that
  station. **(3)**
- **(b)** A test engineer estimates the stagnation pressure as
  $p + \tfrac12\rho V^2$. Compute that estimate. Express its error **twice**:
  as a percentage of $p_0$, and as a percentage of the quantity it is really
  trying to estimate, $(p_0 - p)$. Explain in one sentence why the second
  number is the honest one. **(3)**
- **(c)** The gas is now brought to rest in a real diffuser that generates
  12.0 J/(kg·K) of entropy per kilogram. Compute the stagnation pressure
  actually recovered and the percentage lost, and state the relation you used
  and the assumption it rests on. **(2)**

---

# Section B — Compressible flow and nozzles (25 points)

## B1 (10 points) — Derivation: the area–Mach relation

**Derive**

$$
\frac{A}{A^{*}} \;=\; \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M^{2}\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}
$$

starting from **exactly these three statements and nothing else**:

1. steady quasi-one-dimensional continuity, $\rho V A = \dot m = \mathrm{const}$;
2. the isentropic relations for a calorically perfect gas,
   $T_0/T = 1 + \tfrac{\gamma-1}{2}M^2$ with
   $p_0/p = (T_0/T)^{\gamma/(\gamma-1)}$ and $\rho_0/\rho = (T_0/T)^{1/(\gamma-1)}$;
3. the flow is sonic ($M = 1$) at the station of area $A^{*}$.

Requirements:

- **(a)** Write $\rho V A$ at a general station and at the sonic station in terms
  of stagnation quantities and $M$, and take the ratio. Show every algebraic
  step; do not write "it can be shown". **(6)**
- **(b)** State every assumption you used, and name **two** distinct physical
  situations in a real rocket nozzle in which the result you have just derived
  is quantitatively wrong. **(2)**
- **(c)** Evaluate your result for $\gamma = 1.20$ at $M = 3.000$, to four
  significant figures. **(2)**

## B2 (9 points) — A nozzle on a test stand

An engine has $\gamma = 1.19$, $\mathcal{M} = 13.8$ kg/kmol, $T_0 = 3500$ K,
chamber stagnation pressure $p_0 = 8.50$ MPa, and a fixed bell of
$\varepsilon = 45.0$. Assume isentropic, attached, calorically perfect flow
except where a question says otherwise.

- **(a)** Compute $R$, the exit Mach number, the exit static pressure and
  temperature, and the exit velocity. Verify $V_e$ a second way, from $M_e$ and
  the local speed of sound. **(3)**
- **(b)** The engine is fired on an open-air sea-level stand. Apply the
  **Schmucker** criterion, $p_{sep}/p_a = (1.88 M - 1)^{-0.64}$, at the exit
  plane. Does the nozzle flow full? **(2)**
- **(c)** If it does not, set up the **two simultaneous equations** that locate
  the separation station and solve them for the local Mach number, the wall
  static pressure and the area ratio at separation. State the fraction of the
  bell (by area ratio) that is running separated. **(2)**
- **(d)** The stand is fitted with an ejector-diffuser that can hold the cell at
  any pressure you specify. Compute the **highest** cell pressure at which this
  nozzle still flows full to the exit plane, and comment on whether that is a
  demanding requirement. **(2)**

## B3 (6 points) — A normal shock at the exit plane

Same nozzle and same chamber conditions as B2.

- **(a)** Compute the back pressure at which a normal shock stands exactly at
  the exit plane, and the Mach number immediately downstream of it. **(3)**
- **(b)** Sketch or describe the wall-static-pressure trace along the divergent
  section for a back pressure **halfway between** your answer to B3(a) and the
  fully-expanded exit pressure of B2(a), and say where the shock sits. **(1)**
- **(c)** Your answer to B3(a) is an inviscid, one-dimensional result. Compare
  it with your answer to B2(d) and explain, in no more than three sentences,
  why the "shock at the exit plane" condition can never actually be observed on
  this hardware, and what is seen instead. **(2)**

---

# Section C — Rocket performance (30 points)

## C1 (12 points) — Engine reconstruction: RL10A-3-3A

`reference/_verify-liquid.md` publishes the following for the **Pratt & Whitney
RL10A-3-3A** (closed expander, LOX/LH$_2$, Centaur):

| quantity | published value | file's confidence note |
|---|---|---|
| vacuum thrust | 73.4 kN (16,500 lbf) | medium-high |
| chamber pressure | 475 psia (32.8 bar) | medium-high |
| expansion ratio | 61:1 | medium-high |
| vacuum $I_{sp}$ | **444–445 s** | medium-high, quoted as a range |
| mixture ratio | 5.0 | medium-high |
| dry mass | ~136 kg | **medium** |
| turbopump speed | ~31,000 rpm | **medium** |

The file's own caution applies: the two NTRS engine-model reports were located
but their text could not be extracted, so the figures come from a search summary
and the manufacturer page. The file also warns (systemic item 18) that chamber
pressure may be quoted injector-end or nozzle-stagnation depending on the
source.

Take $\gamma = 1.17$ for the expansion, and take the theoretical characteristic
velocity at this operating point as $c^*_{ideal} = 2330$ m/s (CEA-class,
equilibrium, LOX/LH$_2$ at $r = 5.0$ and 32.8 bar — treat as given).

- **(a)** Convert 475 psia to Pa and to bar. Compute the total propellant mass
  flow and the mass flows of oxidiser and fuel separately. Use $I_{sp} = 444.5$
  s as the mid-range value. **(2)**
- **(b)** Compute the ideal vacuum thrust coefficient $C_{f,vac}$ at
  $\varepsilon = 61$ and this chamber pressure. **(2)**
- **(c)** Reconstruct the **implied** characteristic velocity from the published
  performance, and hence a ratio against $c^*_{ideal}$. **(2)**
- **(d)** State precisely what efficiency your answer to (c) is — it is **not**
  $\eta_{c^*}$ — and prove the statement algebraically from
  $c = c^* C_f$. Name the **one** additional published number that would let you
  separate $\eta_{c^*}$ from $\eta_{C_f}$, and say how. **(3)**
- **(e)** Compute the throat area, throat diameter and exit diameter implied by
  your reconstruction. Compare the exit diameter with what you would expect of a
  Centaur-class engine and say whether the reconstruction is credible. **(2)**
- **(f)** Quantify the effect of the **published $I_{sp}$ range** (444 vs 445 s)
  and of your **assumed $\gamma$** (try 1.14 and 1.20) on the implied $c^*$.
  Which uncertainty dominates, and what does that tell you about reconstructions
  of this kind? **(1)**

## C2 (10 points) — Sizing an upper-stage engine

You must size a new LOX/LH$_2$ upper-stage engine to the following requirement
and predicted properties.

| quantity | value |
|---|---|
| vacuum thrust $F_{vac}$ | 45.0 kN |
| chamber stagnation pressure $p_c$ | 60.0 bar |
| $\gamma$ | 1.22 |
| $\mathcal{M}$ | 13.5 kg/kmol |
| $T_0$ | 3450 K |
| expansion ratio $\varepsilon$ | 100 |
| mixture ratio $r$ | 5.5 |
| $\eta_{c^*}$ (assumed) | 0.980 |
| $\eta_{C_f}$ (assumed) | 0.985 |
| $L^*$ | 0.900 m |

Compute, in this order and showing the chain:

- **(a)** $R$, $\Gamma(\gamma)$ and the ideal $c^*$; then the delivered $c^*$. **(2)**
- **(b)** the ideal vacuum $C_f$ and the delivered $C_f$. **(2)**
- **(c)** the delivered effective exhaust velocity and vacuum $I_{sp}$, and the
  ideal $I_{sp}$ you would have quoted with both efficiencies set to 1. **(2)**
- **(d)** total mass flow, oxidiser and fuel flows. **(1)**
- **(e)** throat area and diameter, exit area and diameter — and verify the
  throat area a second way, from $\dot m$ and $c^*$. **(2)**
- **(f)** the chamber volume from $L^*$, and one sentence on what physical
  quantity $L^*$ is standing in for and why the value is empirical. **(1)**

## C3 (8 points) — Engineering judgment: where to spend 12 kilograms

*There is no single correct answer to this question. It is marked on the quality
of the argument, the correctness of any numbers you choose to bring, and your
honesty about what you do not know.*

An upper stage is in preliminary design. Its engine currently has
$\varepsilon = 80$ and a fixed bell. The mass budget has just released **12 kg**
of stage dry mass, and the programme must decide where to spend it. Three
proposals are on the table:

- **Option 1 — a longer fixed bell**, taking $\varepsilon$ from 80 to 130. The
  extra bell is estimated at 11 kg and lengthens the stowed stage by 0.45 m,
  which the current interstage can just absorb.
- **Option 2 — an extendible radiatively-cooled carbon–carbon extension**,
  taking the deployed $\varepsilon$ from 80 to 200 while stowing at
  $\varepsilon = 80$. Extension plus deployment mechanism is estimated at
  12 kg. It has never been flown by this organisation.
- **Option 3 — spend nothing on the nozzle** and carry 12 kg of extra
  propellant instead.

Write a recommendation of **not more than 400 words**. It must:

1. name the objective you are optimising and say why that is the right
   objective for an upper stage;
2. bring at least **two quantitative arguments** — you may estimate the
   $I_{sp}$ gain of each option from the $C_f$ behaviour you know, and you may
   use the rocket equation; state your assumptions explicitly;
3. address reliability and the failure mode of Option 2 specifically, citing a
   flown engine that took that route;
4. state which **single** number, if you could measure or obtain it tomorrow,
   would most change your recommendation, and why;
5. say what you would recommend if the stage's mission were changed from a high-
   energy escape trajectory to a low-Earth-orbit delivery with a short burn.

---

# Section D — Thermochemistry and CEA (25 points)

## D1 (4 points) — Multiple choice

In a CEA rocket output block run at $\varepsilon = 40$, the `CSTAR, M/SEC` row
prints the **same** value in the throat column and in the exit column. This is
because:

- **(a)** CEA assumes the expansion is isentropic, so no property can change
  downstream of the throat;
- **(b)** $c^* = p_0 A_t/\dot m$ is fixed entirely by the chamber stagnation
  state and the choked throat, and no geometry or condition downstream of the
  throat enters its definition;
- **(c)** the expansion was run in equilibrium mode, so the composition — and
  therefore $c^*$ — is the same at both stations;
- **(d)** the exit column is evaluated at the same area ratio as the throat
  column.

Choose one, **justify it in two sentences**, and state in one further sentence
what this property of $c^*$ makes it useful for on a test stand.

## D2 (9 points) — Reading a CEA output block

The block below is in the layout CEA prints, for **LOX/CH$_4$ at
$p_c = 100$ bar, $r = 3.4$, equilibrium expansion to $\varepsilon = 40$**. It is
internally consistent and CEA-class, but it was **constructed for this exam**
and is not a transcript of a CEA run [A]. Every check asked for below closes on
the numbers as printed.

```
              THEORETICAL ROCKET PERFORMANCE ASSUMING EQUILIBRIUM
           COMPOSITION DURING EXPANSION FROM INFINITE AREA COMBUSTOR

 Pinj =  1450.4 PSIA
                 REACTANT              WT FRACTION   ENERGY(KJ/KG-MOL)   TEMP(K)
 OXIDANT     O2(L)                       1.0000000        -12979.000      90.170
 FUEL        CH4(L)                      1.0000000        -89233.000     111.640

 O/F=    3.40000  %FUEL= 22.727273  R,EQ.RATIO= 1.173235  PHI,EQ.RATIO= 1.173235

                            CHAMBER     THROAT       EXIT
 Pinf/P                      1.0000      1.7361    381.108
 P, BAR                      100.00     57.6004    0.26239
 T, K                       3550.00     3314.66    1695.48
 RHO, KG/CU M               7.2318 0   4.5614 0   4.1713-2
 H, KJ/KG                  -1245.00    -1967.31   -7054.47
 S, KJ/(KG)(K)              12.4100     12.4100     12.4100

 M, (1/n)                    21.346      21.825      22.410
 (dLV/dLP)t                -1.02240    -1.01610    -1.00000
 (dLV/dLT)p                  1.3910      1.2870      1.0000
 Cp, KJ/(KG)(K)              5.1240      4.6180      2.0870
 GAMMAs                      1.1420      1.1440      1.2450
 SON VEL,M/SEC               1256.6      1201.9       885.0
 MACH NUMBER                 0.000       1.000       3.852

 PERFORMANCE PARAMETERS
 Ae/At                                   1.0000      40.000
 CSTAR, M/SEC                            1824.0      1824.0
 CF                                      1.2350      1.9737
 Ivac, M/SEC                             2252.6      3600.1
 Isp,  M/SEC                             1201.9      3408.7

 MOLE FRACTIONS
 H2O                        0.40000     0.42787     0.46194
 CO                         0.22000     0.21407     0.20682
 CO2                        0.15000     0.16423     0.18163
 H2                         0.15000     0.14982     0.14961
 OH                         0.04000     0.02200     0.00000
 H                          0.02500     0.01375     0.00000
 O2                         0.00800     0.00440     0.00000
 O                          0.00700     0.00385     0.00000
```

- **(a)** Verify the printed chamber density from the ideal-gas law using the
  printed `M` and `T`. Show the number and state the agreement. **(2)**
- **(b)** Verify the printed chamber `M, (1/n)` from the chamber mole fractions.
  Molar masses (kg/kmol): H$_2$O 18.0153, CO 28.010, CO$_2$ 44.009, H$_2$
  2.0159, OH 17.0073, H 1.008, O$_2$ 31.998, O 15.999. **(1)**
- **(c)** Compute $c^*$ from the **throat column alone**, using
  $c^* = p_0/(\rho^{*}a^{*})$, and confirm the printed `CSTAR`. Then compute
  what the constant-$\gamma$ closed form $\sqrt{RT_0}/\Gamma(\gamma)$ would give
  using the chamber `GAMMAs` and chamber `M`, and account for the difference in
  one sentence. **(2)**
- **(d)** Convert the exit `Ivac` and exit `Isp` rows to seconds. State which of
  the two is the vacuum specific impulse and what the other one physically is. **(2)**
- **(e)** The engine will actually fly a stage that stages at an ambient
  pressure of 40.0 kPa. Compute the delivered $I_{sp}$ there, using only rows
  printed in the block. **(1)**
- **(f)** Name the **single row** that proves this run was equilibrium and not
  frozen, and say in one sentence what that row would look like in a frozen
  run. **(1)**

## D3 (6 points) — Reading an $I_{sp}$-versus-O/F plot

**Figure D3** *(described; the underlying sweep is the LOX/LH$_2$ equilibrium
sweep of Module 04 §3.6, at $p_c = 200$ bar with expansion to
$\varepsilon = 77.5$, replotted).*

The horizontal axis is mixture ratio $r$, running from 3.0 to 8.0. Two curves
are drawn against two vertical axes.

- **Curve X**, read on the **left** axis, labelled in **seconds**: 434.4 at
  $r = 3.0$; 459.8 at 4.0; a maximum of **466.1** at 5.0; 464.8 at 6.0; 460.2 at
  7.0; 450.2 at 8.0.
- **Curve Y**, read on the **right** axis, labelled in **m/s**: 2425 at
  $r = 3.0$; a shallow maximum of about **2430 near $r = 3.5$**; 2420 at 4.0;
  2382 at 5.0; 2323 at 6.0; 2250 at 7.0; 2170 at 8.0.

A vertical dashed line is drawn at $r = 7.94$ and labelled "stoichiometric".

- **(a)** Identify which curve is vacuum $I_{sp}$ and which is $c^*$, and give
  the two features of the plot that tell you, without reading the axis labels. **(1)**
- **(b)** The two maxima are at different mixture ratios. Explain the mechanism,
  naming the quantity that separates them and saying which way it pushes. **(2)**
- **(c)** A vehicle study wants to move the engine from $r = 5.0$ to $r = 6.0$
  to shorten the hydrogen tank. Read off and compute: the change in $c^*$ as a
  percentage, and the change in $I_{sp}$ in seconds and as a percentage. Explain
  why the two percentages are so different. **(2)**
- **(d)** No flying LOX/LH$_2$ engine operates at the $c^*$ maximum near
  $r = 3.5$. Give the single strongest reason. **(1)**

## D4 (6 points) — Stoichiometry of a peroxide engine

`reference/_verify-liquid.md` records the **Bristol Siddeley Gamma 8** (Black
Arrow first stage): **85 % high-test hydrogen peroxide (HTP) / kerosene**,
mixture ratio **8:1**, $p_c = 47.4$ bar, $I_{sp}$ **265 s vacuum / 251 s sea
level**. The file records that the **expansion ratio and dry mass are not
published**, and that the sea-level thrust is contested between 234.8 kN
(Wikipedia) and 222.4 kN (Encyclopedia Astronautica).

Model the oxidiser as 85 % H$_2$O$_2$ / 15 % H$_2$O **by mass**, decomposing
completely as $\mathrm{H_2O_2 \to H_2O + \tfrac12 O_2}$, and the fuel as
CH$_{1.95}$. Atomic masses: H 1.008, C 12.011, O 15.999.

- **(a)** Write the fuel-oxygen balance for CH$_{1.95}$ and state the O$_2$
  coefficient. **(1)**
- **(b)** Compute the stoichiometric mixture ratio $r_{st}$ **by mass of 85 %
  HTP to kerosene**, showing the decomposition bookkeeping. **(3)**
- **(c)** Compute the equivalence ratio $\phi$ at the engine's operating
  $r = 8.0$. Compare it with the $\phi$ of every LOX and N$_2$O$_4$ engine in
  the Module 04 table (which lie between 1.08 and 1.80) and say what is unusual. **(1)**
- **(d)** Running this close to stoichiometric would destroy a kerolox chamber.
  Explain in two sentences why it is survivable here, and name the single
  performance figure in the data above that is the price paid. **(1)**

---

## End of examination

Before you hand in, check that every numerical answer carries a unit, that every
engine figure you used carries the verification file's caveat, and that you have
stated your assumed $\gamma$ wherever you chose one.
