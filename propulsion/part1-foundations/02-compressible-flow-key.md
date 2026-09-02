# Module 02 — Compressible Flow and Nozzles — Answer Key

Do not read this before attempting `02-compressible-flow.md` §10 and §11.

Throughout: $\gamma = 1.2$, $R_u = 8314.46$ J/(kmol·K), $g_0 = 9.80665$ m/s²,
$p_{a,SL} = 101325$ Pa. Numbers are from `tools/rocket.py`; a hand calculation
agreeing to three significant figures is full marks. Equation numbers refer to
the module text.

---

## K1. Problem solutions

### Conceptual

**P1 — raising the ambient pressure on a nozzle firing into vacuum.**

Start in regime (g), deeply underexpanded. Raising $p_a$:

1. **Nothing at all happens inside the nozzle** until $p_a$ reaches $p_e$, the
   isentropic exit pressure. Below that, the exit flow is supersonic, so no
   pressure information can travel upstream into the nozzle (§3.3); the only
   change is outside, where the expansion fans at the lip weaken.
2. At $p_a = p_e$ the nozzle is ideally expanded (regime f). Still nothing has
   changed inside.
3. For $p_a > p_e$ the flow is overexpanded (regime e): oblique shocks form at
   the lip and turn/compress the jet. **Inviscid answer: the interior is still
   unaffected**, all the way up to $p_a = p_2^{shock@exit}$, the pressure behind
   a normal shock at the exit Mach number (Eq. 3.13).
4. Above that value a normal shock enters the diverging section (regime c) and
   moves upstream as $p_a$ rises further; now the interior *is* affected
   downstream of the shock, and thrust collapses.
5. When the shock reaches the throat, the nozzle unchokes and $\dot m$ begins to
   fall (regimes b then a).

**The pressure at which the interior first changes, inviscidly:** $p_a = p_e
\cdot [1 + \frac{2\gamma}{\gamma+1}(M_e^2-1)]$.

**Assumption and the real answer:** this is an inviscid argument. With a real
boundary layer, the adverse pressure gradient at the lip is communicated
upstream *through the subsonic part of the boundary layer*, so separation — and
therefore a change to the wall pressure distribution inside the nozzle — begins
at a much lower ambient pressure, roughly where $p_{wall}$ falls to
0.25–0.4 $p_a$ (Eqs. 3.21, 3.22). The nozzle interior therefore starts changing
well before the inviscid prediction, and by a mechanism (viscous, unsteady,
possibly asymmetric) the inviscid theory cannot see. Full marks require this
paragraph. [F]/[E]

**P2 — area minimum is necessary but not sufficient for sonic flow.**

Eq. 3.9 is $dA/A = (M^2-1)\,dV/V$. Sonic flow means $M=1$, which forces
$dA/A = 0$ regardless of $dV$; so sonic flow implies an area extremum
(necessary). The converse fails because $dA=0$ is satisfied by *either* $M=1$
*or* $dV=0$. The second branch is a physical flow: a subsonic venturi, in which
the throat is the point of maximum velocity and minimum pressure and $dV=0$
there by symmetry, with the flow decelerating downstream. Which branch is
realised is set by the back pressure, not by the geometry.

Physical example: any unchoked flow meter; also a rocket nozzle during the
first milliseconds of start-up, and a nozzle in an altitude test cell before
the diffuser has established. A common second example — a *maximum*-area
station in a duct — also satisfies $dA=0$; sonic conditions there are possible
only in contrived Fanno/Rayleigh flows and never in a nozzle.

**P3 — why $T_0$ survives a shock and $p_0$ does not.**

$T_0$: the energy equation for a steady adiabatic control volume with no shaft
work is $h_1 + V_1^2/2 = h_2 + V_2^2/2$ (Eq. 3.1). Nothing in that statement
requires reversibility — it is a bookkeeping identity for energy. For a
calorically perfect gas $h = c_pT$, so $T_{0,1} = T_{0,2}$. A shock is adiabatic
(it is too thin and too fast for conduction to the surroundings to matter), so
total temperature is conserved.

$p_0$: the definition of stagnation *pressure* invokes an **isentropic**
deceleration to rest. A shock generates entropy — the second law demands it,
because the compressive solution is the only one with $\Delta s > 0$ (the
expansion-shock branch has $\Delta s < 0$ and is forbidden). Since
$\Delta s = -R\ln(p_{0,2}/p_{0,1})$ for adiabatic flow (Eq. 3.8), positive
entropy generation *is* a stagnation-pressure drop. Total pressure is therefore
a bookkeeping device for irreversibility, not for energy.

Marks: full credit requires the words "adiabatic" for $T_0$ and "isentropic"
(or "reversible") for $p_0$, and the second-law argument for the sign.

**P4 — same $c^*$, same $p_c$, same $A_t$, $\varepsilon = 20$ versus 200.**

- **Vacuum thrust:** the 200 engine wins. $C_{F,vac}$ rises monotonically with
  $\varepsilon$, though with strongly diminishing returns (§3.7).
- **Vacuum $I_{sp}$:** the 200 engine wins, by the same ratio (same $c^*$).
- **Sea-level thrust and $I_{sp}$:** the 20 engine wins, and by a lot. The
  penalty term is $\varepsilon p_a/p_0$; at $\varepsilon=200$ it is ten times
  larger. Depending on $p_0$, the 200 engine may have *negative* net thrust
  contribution from its exit region and will almost certainly be separated.
- **Which comparison misleads:** a datasheet that quotes only "$I_{sp}$" without
  saying vacuum or sea level. The 200 engine's vacuum $I_{sp}$ next to the 20
  engine's sea-level $I_{sp}$ is a meaningless comparison that is made
  constantly. Second-order trap: if the high-$\varepsilon$ engine is separated at
  sea level, its *measured* sea-level $I_{sp}$ will be **higher** than Eq. 3.24
  predicts, because separation truncates the most negative part of the pressure
  integral — so even the "honest" sea-level number is not a clean model output.

**P5 — why expansion is isentropic and compression is not.**

Both are turns, but they differ in how the waves organise. In a Prandtl–Meyer
expansion the flow turns away from itself, the Mach angle *increases*
downstream ($M$ rises so $\mu = \arcsin(1/M)$ falls — the characteristics
diverge), so the waves spread apart and each remains infinitesimal. An
infinitesimal wave is a reversible process; a fan of them is a sum of
reversible processes, so $\Delta s = 0$.

In compression the flow turns into itself, $M$ falls, $\mu$ rises, and the
characteristics **converge**: waves generated downstream catch up with waves
generated upstream and coalesce into a finite discontinuity. A finite-amplitude
compression has finite gradients of velocity and temperature inside it, so
viscous dissipation and heat conduction act over the shock thickness and
generate entropy.

The second-law closure: an "expansion shock" (a finite discontinuity in which
pressure drops) would require $\Delta s < 0$ in an adiabatic flow — apply
Eq. 3.13 with $M_1 < 1$ and evaluate the entropy — and is therefore forbidden.
So compressions may be finite and irreversible, while expansions are forced to
be gradual and are reversible. The asymmetry is thermodynamic, not geometric.

**P6 — why a TOC is better in steady state and worse during start.**

Steady state: a thrust-optimised (Rao) contour turns the flow more rapidly just
downstream of the throat and then straightens it, so the exit flow is more
nearly axial for a given length — less divergence loss, less wall friction,
less mass, for the same $\varepsilon$ ([Rao58], [Rao60], module 09).

Start transient: that same rapid initial turning generates an internal shock
which propagates downstream and interacts with the separation shock during
low-$p_c$ operation. The interaction can force the separated shear layer to
**reattach** — restricted shock separation — instead of remaining free (FSS).
As $p_c$ rises the pattern flips from FSS to RSS, and the flip is a step change
in the wall pressure distribution, is hysteretic, and does not occur
simultaneously around the circumference. The resulting asymmetric pressure
field is the dominant side-load mechanism ([OMK05], [Ostlund02]). A pure cone
has no internal shock of that kind and stays in FSS, so it is worse in steady
state and better-behaved in transient.

**P7 — why higher $p_c$ permits higher $\varepsilon$ at sea level.**

The wall pressure at a station is $p = p_0/(1+\frac{\gamma-1}{2}M^2)
^{\gamma/(\gamma-1)}$, and the separation criteria compare that pressure to
*ambient*, which is fixed. Both the isentropic ratio $p/p_0$ (a function of area
ratio alone) and the criterion are unchanged by $p_0$; only the absolute $p$
scales with $p_0$. So doubling $p_c$ doubles the wall pressure at every station,
and the station at which the wall pressure falls to the separation value moves
downstream. Concretely: at $p_0 = 20.64$ MPa, Schmucker puts the separation
station at $\varepsilon = 56$; at $p_0 = 10$ MPa, at $\varepsilon = 30$
(problem R1). High chamber pressure is what buys area ratio.

**The limits of the argument.** (i) $p_c$ costs turbomachinery, cycle
complexity, chamber wall heat flux (which scales roughly as $p_c^{0.8}$,
module 10) and structural mass. (ii) The separation *criteria* were fitted at
modest chamber pressures and the extrapolation is not guaranteed. (iii) It does
nothing for the start transient, when $p_c$ is by definition low — you still
traverse the whole dangerous window on the way up. (iv) Nothing here addresses
exit diameter, which is often the binding constraint on a clustered first
stage. [J]

### Calculation

**C1 — LOX/CH₄, $T_0 = 3500$ K, $\mathcal{M} = 20$, $p_0 = 30$ MPa,
$A_t = 0.02$ m².**

$R = 8314.46/20 = \mathbf{415.72}$ J/(kg·K).
$a_0 = \sqrt{1.2\times415.72\times3500} = \mathbf{1321.4}$ m/s.
Throat (from the $M=1$ table in §3.4):
$T^* = 0.9091\times3500 = \mathbf{3181.8}$ K;
$p^* = 0.56447\times30 = \mathbf{16.93}$ MPa;
$\rho^* = p^*/(RT^*) = 16.934\times10^6/(415.72\times3181.8) = \mathbf{12.80}$ kg/m³;
$V^* = a^* = \sqrt{1.2\times415.72\times3181.8} = \mathbf{1259.9}$ m/s.
Mass flow, Eq. 3.10 with $\Gamma(1.2) = 0.6485$:
$$\dot m = \frac{30\times10^6\times0.02}{\sqrt{415.72\times3500}}\times0.6485 = \mathbf{322.6\ \text{kg/s}}$$
Cross-check: $\rho^*A_tV^* = 12.80\times0.02\times1259.9 = 322.6$ kg/s. ✓

**C2 — $\varepsilon = 40$.**

$M_e = \mathbf{4.239}$ (Eq. 3.11, supersonic root).
$T_0/T_e = 1+0.1\times4.239^2 = 2.797 \Rightarrow T_e = \mathbf{1251.2}$ K.
$p_0/p_e = 2.797^6 = 479.1 \Rightarrow p_e = \mathbf{62.62}$ kPa.
$a_e = \sqrt{1.2\times415.72\times1251.2} = 790.1$ m/s, $V_e = M_e a_e =
\mathbf{3349}$ m/s.
Ideal expansion where $p_a = 62.62$ kPa: from the §5.2 table this lies between
0 km (101.3 kPa) and 5 km (54.0 kPa); the troposphere relation gives
$h = \mathbf{3.9\ \text{km}}$. (Linear interpolation on the table gives ~4.1 km
and is accepted.)

**C3 — separation check at sea level.**

$p_e/p_a = 62.62/101.325 = 0.618$.
Summerfield: $p_{sep} = 0.4\times101.325 = 40.5$ kPa. $p_e = 62.6$ kPa > 40.5 kPa
⟹ **no separation**, margin 55%.
Schmucker at $M_e = 4.239$: $p_{sep}/p_a = (1.88\times4.239-1)^{-0.64} = 0.289$,
i.e. 29.2 kPa. $p_e$ > that ⟹ **no separation**, margin 114%.
Disagreement between the criteria, expressed as the wall pressure at which they
predict separation: 40.5 versus 29.2 kPa, i.e. 39% — but since the exit pressure
is above both, the conclusion is the same and the disagreement does not matter
*at this operating point*. Saying that explicitly is worth marks; the criteria
only fight where the answer is close.

Comment for full marks: this is a 30 MPa engine. It is the chamber pressure, not
a modest area ratio, that makes $\varepsilon = 40$ safe at sea level (P7).

**C4 — normal shock at $M_1 = 2.8$, $R = 400$ J/(kg·K).**

$$M_2^2 = \frac{1+0.1\times7.84}{1.2\times7.84-0.1} = \frac{1.784}{9.308}
\Rightarrow M_2 = \mathbf{0.4378}$$
$$\frac{p_2}{p_1} = 1+\frac{2.4}{2.2}(7.84-1) = \mathbf{8.462}$$
$$\frac{\rho_2}{\rho_1} = \frac{2.2\times7.84}{0.2\times7.84+2} = \mathbf{4.834}
\qquad
\frac{T_2}{T_1} = \frac{8.462}{4.834} = \mathbf{1.7505}$$
$c_p = 1.2\times400/0.2 = 2400$ J/(kg·K).
$\Delta s = 2400\ln 1.7505 - 400\ln 8.462 = 1343.4 - 853.9 = \mathbf{489.5}$ J/(kg·K).
$p_{0,2}/p_{0,1} = e^{-489.5/400} = \mathbf{0.294}$ — 71% of the stagnation
pressure destroyed by a single $M=2.8$ shock.

**C5 — facility back pressure 40 kPa.**

The nozzle's isentropic exit pressure is 62.6 kPa (C2), which is *above* the
40 kPa the diffuser holds. The nozzle is therefore **underexpanded**, flowing
full, with expansion fans at the lip; the exit conditions are exactly those of
C2 and the facility pressure is irrelevant to everything upstream. Separation is
impossible — separation requires a *compression* at the lip. (Schmucker at
$p_a = 40$ kPa gives $p_{sep} = 11.5$ kPa, far below $p_e$.)

Measurement to confirm: wall static taps along the diverging section. If they
track the isentropic $p/p_0$ curve all the way to the exit plane, the nozzle is
flowing full; a plateau near the facility pressure starting at some station is
separation. Secondary confirmation: thrust matching $C_F$ computed with
$p_a = 40$ kPa, and a schlieren or high-speed view of the plume showing a
diverging (fan) rather than a converging (shock) boundary at the lip.

**C6 — shock at $A/A_t = 10$ in a $\varepsilon = 25$, $p_0 = 5$ MPa nozzle.**

1. $M_1 = $ Eq. 3.11 at $A/A_t = 10$, supersonic $= \mathbf{3.278}$.
2. $M_2 = $ Eq. 3.12 $= \mathbf{0.4027}$.
3. $p_2/p_1 = 1 + (2.4/2.2)(10.75-1) = 11.64$.
   $p_{0,2}/p_{0,1} = (p_2/p_1)\cdot\dfrac{(p_0/p)(M_2)}{(p_0/p)(M_1)}
   = 11.64\times\dfrac{1.1104}{80.44} = \mathbf{0.1606}$
   (an 84% stagnation-pressure loss).
4. $A^*$ jumps: $A_e/A_2^* = \varepsilon\,(p_{0,2}/p_{0,1}) = 25\times0.1606
   = 4.016$.
5. $M_{exit} = $ Eq. 3.11 at 4.016, **subsonic** root $= \mathbf{0.1492}$.
6. $p_{exit} = p_{0,2}/(p_0/p)(M_{exit}) = (5\times10^6\times0.1606)/1.01568
   = \mathbf{792.5\ \text{kPa}}$.

So the required back pressure is **$p_b = 792$ kPa**, and the exit Mach number
is 0.149. Marks are lost mainly at step 4: candidates who keep using the
original $A^*$ downstream of the shock get a supersonic exit and a wrong answer
by an order of magnitude.

**C7 — F-1 thrust from the station table.**

$A_e = 16\times0.618 = 9.888$ m². $V_e = 3037$ m/s, $p_e = 47.39$ kPa,
$\dot m = 2577$ kg/s.
Vacuum: $F = 2577\times3037 + 47392\times9.888 = 7.826 + 0.469 = \mathbf{8296}$ kN.
Sea level: $F = 7.826\ \text{MN} + (47392-101325)\times9.888 =
7.826 - 0.533 = \mathbf{7294}$ kN.
Published: 7770 kN vacuum, 6770 kN sea level. Both computed values are ~7% high.

**One-sentence account:** the calculation mixes an inconsistent pair — the
published $\dot m$ (2577 kg/s) with a $V_e$ derived from $p_0 = 7.0$ MPa, which
only passes 2405 kg/s through this throat; using the self-consistent $\dot m$
gives 7.75 MN vacuum and 6.75 MN sea level, within 0.3% of published, and the
remaining error is the real losses (divergence, boundary layer, combustion
efficiency) partially cancelling the optimistic ideal-gas $V_e$. Full marks for
identifying the inconsistency; half marks for blaming "losses" alone, which
cannot explain an error in the *wrong direction*.

**C8 — $\varepsilon = 165$, $p_0 = 9.7$ MPa, fired at sea level.**

$M_e = \mathbf{5.257}$; $p_0/p_e = 2841 \Rightarrow p_e = \mathbf{3.41}$ kPa;
$p_e/p_a = \mathbf{0.0337}$ — overexpanded by a factor of 30.
Schmucker: solve $p_0/(1+0.1M^2)^6 = 101325(1.88M-1)^{-0.64}$; root at
$M_{sep} = 4.017$, $p_{wall} = 30.4$ kPa, $A_{sep}/A_t = \mathbf{29.1}$.
Fraction of the nozzle running separated: $(165-29.1)/165 = \mathbf{82\%}$ of the
exit area, i.e. everything outboard of $r/r_e = \sqrt{29.1/165} = 0.42$.
(Summerfield gives $A_{sep}/A_t = 23.2$, i.e. 86% separated — the criteria agree
that the answer is "catastrophically".)

Engineering reading: this is a vacuum nozzle. Firing it at sea level puts an
unsteady, asymmetric shock system over four-fifths of the exit cone; the
predicted side loads would destroy a radiatively cooled niobium or
carbon–carbon skirt, which is why vacuum engines are tested in altitude cells
and why extendible nozzles are deployed only after staging.

### Engineering reasoning

**R1 — reading the wall-pressure plot.**

*What happened:* the boundary layer separated at $A/A_t = 30$. The abrupt rise
and subsequent plateau is the signature: downstream of separation the wall no
longer sees the isentropic core flow, it sees the recirculating region, whose
pressure is set by ambient.

*$p_{sep}/p_a$ from the data:* at $A/A_t = 30$, Eq. 3.11 gives $M = 4.039$ and
Eq. 3.6 gives $p_0/p = 332.0$, so $p_{sep} = 10\times10^6/332.0 = 30.1$ kPa.
Hence $p_{sep}/p_a = 30.1/101 = \mathbf{0.298}$.

*Which criterion:* Schmucker (Eq. 3.22) at $M = 4.039$ predicts
$(1.88\times4.039-1)^{-0.64} = 0.299$ — agreement to three digits. Summerfield
predicts 0.40, which would have put separation at $A/A_t = 23.8$, 21% further
upstream. This hardware agrees with Schmucker. That is the expected result for a
Mach-4-class separation and is exactly why the Mach-dependent form exists.

*FSS or RSS, from this plot alone:* the plateau sits at 80 kPa, **below**
ambient (101 kPa). That is free shock separation — the separated jet is
surrounded by a recirculation region open to atmosphere, which sits slightly
sub-ambient because the jet entrains from it. In restricted shock separation the
shear layer reattaches and the wall pressure downstream of reattachment rises
**above** ambient before falling again. So: FSS, and you can tell because the
plateau is below $p_a$ and flat rather than showing a rise-then-fall.
[OMK05]

**R2 — $\varepsilon$ = 69 or 77.5 for a plume-impingement analysis.**

*How to decide.* (i) Establish what each source means: 69:1 is quoted by the
manufacturer as the geometric area ratio, 77.5:1 appears in aerodynamic and
training material and may be an effective or aerodynamic ratio referenced to a
different throat definition. (ii) Prefer the manufacturer's geometric number for
anything geometric; prefer the aerodynamic number only if the source states the
reference explicitly. (iii) Compute both and see whether the conclusion changes:
$\varepsilon = 69 \Rightarrow M_e = 4.62$, $p_e = 21.6$ kPa;
$\varepsilon = 77.5 \Rightarrow M_e = 4.71$, $p_e = 18.7$ kPa. A 13% difference
in exit pressure, 2% in exit Mach number. (iv) If the conclusion changes, run
the analysis at both and report the envelope — this is standard practice and
better than a false precision.

*Consequence of being wrong.* Plume impingement pressure and heat flux scale
with $p_e$ and with the plume boundary angle, which depends on $M_e$ through the
Prandtl–Meyer turn. 13% on $p_e$ propagates roughly linearly into impingement
pressure, and the plume half-angle changes by about a degree — which for a
far-field impingement geometry can move the footprint by a lot more than 13%.

*Single measurement that settles it.* Measure the hardware: exit-plane diameter
and throat diameter on the actual nozzle, geometrically. That is a tape measure
and a bore gauge, and it settles the geometric ratio permanently. If the
question is which *aerodynamic* ratio applies, the measurement is a wall static
tap at the exit plane during a hot fire compared against the isentropic
prediction for each candidate $\varepsilon$; they differ by 13%, which is well
outside transducer error.

**R3 — actuator-load exceedances only on post-tooling-change engines.**

Candidate mechanisms:

1. **Contour change moved the separation behaviour.** A small change in the
   diverging-section contour (particularly in the inflection region) can shift
   the internal shock and change the FSS/RSS transition point or make the
   transition more abrupt, raising start-transient side loads.
2. **Contour asymmetry / out-of-round.** New tooling with a circumferential
   variation produces a *steady* preferential separation azimuth — the
   separation line locks to the low spot rather than wandering, producing a
   larger, more repeatable lateral force.
3. **Something not in the nozzle at all**: a change in the start sequence,
   valve timing, or actuator/ mount stiffness coincident in time with the
   tooling change. Always check whether the correlation is causal.

Discriminating test: **instrument for azimuth**. Put a ring of wall static taps
at 3–4 axial stations and 8 circumferential positions and hot-fire one engine of
each build with the same start sequence.
- If the separation line is at the same axial station on both builds but is
  circumferentially locked on the new build ⟹ mechanism 2 (asymmetry). Confirm
  with a CMM scan of the contour.
- If the axial station and the transition timing differ between builds
  symmetrically ⟹ mechanism 1. Confirm with subscale cold-flow of both contours,
  which is cheaper than hot fire and resolves the FSS/RSS transition directly.
- If neither differs ⟹ mechanism 3; go and diff the start sequence and the
  actuator hardware between the two builds.

Ordering matters: do the CMM scan first because it costs nothing and may end the
investigation. [J]

**R4 — vacuum $I_{sp}$ 4 s low with $p_c$, mixture ratio and $\dot m$ all
matching.**

$I_{sp} = c^*C_F/g_0$. If $p_c$, O/F and $\dot m$ all match nominal then
$c^* = p_c A_t/\dot m$ is nominal, so **$c^*$ is not the problem — combustion is
fine.** The loss is in $C_F$, i.e. in the nozzle. Look, in order:

1. **Throat area.** $A_t$ is the common factor in $c^*$ and $\varepsilon$. If
   $A_t$ is larger than drawing, $c^*$ from the measured $p_c$ and $\dot m$
   would come out nominal only by coincidence, but $\varepsilon = A_e/A_t$ is
   reduced, and with it $C_F$. Measure the throat. Cheapest, most common.
2. **Exit area / contour.** Same argument from the other end; also check for a
   truncated or mis-assembled extension.
3. **Divergence and contour quality.** A contour that does not straighten the
   flow costs $\lambda$ (module 09). Compare measured wall pressures against the
   design distribution — a contour error shows up as a systematic offset, not a
   uniform scale factor.
4. **Facility.** Is "vacuum $I_{sp}$" measured or extrapolated? If the cell held
   a finite back pressure and the correction to vacuum used the *design*
   $A_e$ and $p_e$, an error in either propagates directly into the reported
   number. A 4 s error on 450 s is 0.9%, which is the size of a plausible
   cell-pressure correction error.
5. **Two-dimensional and kinetic losses** (frozen versus equilibrium
   recombination): real, but they are predictable, so they belong in the
   prediction, not in the anomaly. If the prediction did not include them, the
   engine is fine and the model is wrong — which is the answer about a third of
   the time. [J]

---

## K2. Quiz answers

**Q1 (8).** Conservation of **mass** ($\rho a = (\rho+d\rho)(a+dV)$) and
conservation of **momentum** ($dp = -\rho a\,dV$) across a control volume fixed
to the wave; eliminating $dV$ gives $a^2 = dp/d\rho$. The assumption that turns
this into $(\partial p/\partial\rho)_s$ is that the disturbance is
**infinitesimal** — hence reversible — **and adiabatic** (too fast for
conduction). Reversible + adiabatic = isentropic.
*Marking:* 3 for each conservation law, 2 for the isentropic argument. Saying
"adiabatic" alone scores 1 of the 2: adiabatic gets you $dp/d\rho$ at constant
entropy only if it is also reversible.

**Q2 (8).** $T^*/T_0 = 2/2.2 = \mathbf{0.909}$;
$p^*/p_0 = (2/2.2)^{6} = \mathbf{0.564}$;
$\rho^*/\rho_0 = (2/2.2)^{5} = \mathbf{0.621}$.
*Marking:* 3, 3, 2. Check: $p^*/p_0 = (T^*/T_0)\times(\rho^*/\rho_0)$ —
$0.909\times0.621 = 0.564$ ✓.

**Q3 (10).** **(c) and (d).**
- (a) Mass flow: **no**. The throat is choked; $\dot m$ is fixed by Eq. 3.10 and
  does not depend on ambient pressure.
- (b) Chamber pressure: **no**, for the same reason — no information crosses the
  sonic throat upstream.
- (c) Exit Mach number: **yes, but with a caveat that earns the marks.** In the
  *fully supersonic, attached* regime the internal $M_e$ is fixed by
  $\varepsilon$ and does not change either. It changes here because at
  $p_a = 50$ kPa a high-$\varepsilon$ nozzle may be separated, so the effective
  exit is upstream of the physical exit; at 5 kPa it flows full and the true
  exit Mach number is reached. An answer of "no, $M_e$ is set by area ratio"
  with that reasoning stated also scores full marks; an unreasoned "yes" scores
  half.
- (d) Thrust: **yes**. $F = \dot m V_e + (p_e-p_a)A_e$; only $p_a$ changed, so
  thrust rises by $45\times10^3 \times A_e$ N.
- (e) is wrong because (d) is certainly true.

**Q4 (12).** $\varepsilon = 60$, $\gamma=1.2$: $M_e = \mathbf{4.524}$.
$p_0/p_e = (1+0.1\times20.47)^{6} = 800.4$, so
$p_e = 15\times10^6/800.4 = \mathbf{18.74}$ kPa.
At 10 km, $p_a = 26.4$ kPa, so $p_e/p_a = \mathbf{0.71} < 1$ ⟹ **yes, still
overexpanded** at 10 km. (It reaches ideal expansion at about 12.2 km.)
*Marking:* 5 for $M_e$, 4 for $p_e$, 3 for the comparison and the word
"overexpanded".

**Q5 (12).** $M_1 = 3.5$, $\gamma = 1.2$:
$p_2/p_1 = 1+(2.4/2.2)(12.25-1) = \mathbf{13.27}$;
$M_2 = \sqrt{(1+0.1\times12.25)/(1.2\times12.25-0.1)} = \mathbf{0.390}$.
$\rho_2/\rho_1 = 2.2\times12.25/(0.2\times12.25+2) = 5.86$;
$T_2/T_1 = 13.27/5.86 = 2.265$; $c_p = 1.2\times500/0.2 = 3000$;
$\Delta s = 3000\ln2.265 - 500\ln13.27 = 2452 - 1291 = 1061$ J/(kg·K);
$p_{0,2}/p_{0,1} = e^{-1061/500} = 0.120$, i.e. **88% of the stagnation pressure
is lost.**
*Marking:* 4 + 4 + 4. A candidate who quotes the loss without computing
$\Delta s$ (e.g. from a table) gets the 4 marks if the number is right.

**Q6 (10).** **(b) decelerates.** From $dA/A = (M^2-1)dV/V$: for $M>1$ the
factor $(M^2-1)>0$, so $dA<0$ requires $dV<0$.
(a) is the incompressible intuition and is wrong above $M=1$. (c) is wrong —
choking is a phenomenon of *accelerating* subsonic flow reaching $M=1$ at a
minimum; a decelerating supersonic flow can reach $M=1$ at a minimum too, which
is how a supersonic diffuser works, but "chokes" is not the right description.
(d) is wrong: supersonic converging ducts are ordinary hardware — every
supersonic inlet and every supersonic diffuser in a test facility.
*Marking:* 4 for the answer, 6 for the justification from Eq. 3.9.

**Q7 (12).** $\varepsilon = 45$, $p_0 = 12$ MPa, $p_a = 101.325$ kPa.
Set-up — two equations, one unknown $M$:
$$p_{wall}(M) = \frac{12\times10^6}{(1+0.1M^2)^{6}},\qquad
p_{sep}(M) = 101325\,(1.88M-1)^{-0.64}$$
solved simultaneously (bisect on $1 < M < M_e = 4.322$).
Root: $M_{sep} = \mathbf{4.146}$, $p_{wall} = \mathbf{29.7}$ kPa
($p_{sep}/p_a = 0.293$), and Eq. 3.11 gives $A_{sep}/A_t = \mathbf{35.0}$.
So **yes, it separates**, at 78% of the exit area — the outer 22% of the exit
cone is running separated at sea level.
Cross-check available for full marks: $p_e = 12\times10^6/556.3 = 21.6$ kPa and
$p_e/p_a = 0.213$, below both criteria, so separation was expected.
*Marking:* 5 for the correct two-equation set-up (this is the point of the
question), 4 for the root, 3 for converting to area ratio and interpreting.

**Q8 (10).** Two questions worth asking, with the data that answers each:

1. **"What does the separation margin look like at the *worst* condition, not
   the nominal one?"** $\varepsilon = 34$ at full $p_c$ may be fine while the
   same nozzle at minimum throttle is separated, because $p_e$ scales with
   $p_c$. Data: the Schmucker/Summerfield station computed at minimum throttle
   and at the lowest expected $p_c$ during start and shutdown, plus the
   trajectory's maximum dynamic-pressure ambient condition.
2. **"What do the side loads do in the start transient, and can the structure
   take them?"** Data: subscale cold-flow of the *actual* contour through the
   start pressure ramp, to establish whether and when FSS/RSS transition occurs;
   then nozzle and actuator load capability against the predicted loads.

Also creditable: "what does the trajectory integration say the +6 s is actually
worth in payload?" (often less than it sounds, for a first stage that spends
its early burn in the atmosphere); "what does the extra nozzle mass cost, and
where is it on the vehicle?"; "does the exit diameter still fit the base?"
*Marking:* 5 per question, of which 2 for naming the data. Answers that only
discuss $I_{sp}$ score at most 4 of 10 — the question is about what could go
wrong, and that is the whole point of §3.14.

**Q9 (10).** Three things:

1. **Vacuum or sea level?** The same engine differs by 10–20%; 348 s is the
   Merlin Vacuum's *vacuum* figure and its sea-level counterpart's vacuum figure
   is 311 s. Using the wrong one is a first-order error in a $\Delta V$ budget.
2. **Delivered or theoretical (and at what power level / mixture ratio)?** CEA
   or a vendor's ideal number runs 3–8% above delivered; and engines are quoted
   at a specific power level and O/F which may not be the one you will fly.
3. **What does the vehicle actually see?** Nozzle-exit ambient during the real
   trajectory, throttle profile, and any duty-cycle effects (start/shutdown
   impulse, which for short burns can be several percent of total impulse).
   Related: whether the number is per-engine or vehicle-average.
*Marking:* 3+3+3, +1 for saying which single question you would ask the vendor
first. Only listing "vacuum vs sea level" scores 4.

**Q10 (8).** The throat is choked, so the flow there is sonic and no pressure
information can travel upstream from the nozzle into the chamber; chamber
pressure and mass flow are therefore fixed by the injector, the combustion and
the throat area alone, independent of altitude. Thrust, however, contains the
term $(p_e - p_a)A_e$, which acts on the *downstream* side of the sonic point
and depends directly on ambient pressure. As $p_a$ falls, that term grows by
$A_e$ per pascal, so thrust rises with altitude — by exactly $p_{a,SL}A_e$
between sea level and vacuum, to the accuracy of the quasi-1D model.
*Marking:* 4 for the choking/no-upstream-information argument, 4 for
identifying the $-p_aA_e$ term. Answers claiming "the nozzle expands more in
vacuum" score 2 — it does not; the internal flow is identical.

---

## K3. Trade-study reference solution (T1)

**Recap of the problem.** First stage, methalox, $p_c = 25$ MPa,
$\gamma = 1.2$, $\mathcal{M} = 20$ kg/kmol, $T_0 = 3500$ K, nine engines,
sea-level start, exit diameter limit 1.8 m per engine, throttle to 40%.
$c^* = \sqrt{RT_0}/\Gamma = \sqrt{415.72\times3500}/0.6485 = 1860$ m/s.

**The numbers a strong answer produces.**

| | A: $\varepsilon=20$ | B: $\varepsilon=34$ | C: $\varepsilon=55$ | D: $\varepsilon=34$ dual-bell |
|---|---|---|---|---|
| $M_e$ | 3.759 | 4.126 | 4.463 | 4.126 / higher in high mode |
| $p_e$ at 100% (kPa) | 126.8 | 64.2 | 34.9 | 64.2 |
| $p_e/p_a$ at 100%, SL | 1.25 (under) | 0.633 | 0.344 | 0.633 |
| ideal-expansion altitude | −1.9 km (never) | 3.7 km | 8.1 km | two design points |
| $p_e$ at 40% throttle (kPa) | 50.7 | 25.7 | 13.9 | 25.7 |
| $p_e/p_a$ at 40%, SL | 0.500 | 0.253 | 0.138 | 0.253 |
| Schmucker sep. at 100%, SL | none | none | none | none |
| Schmucker sep. at 40%, SL | none | $A/A_t = 29.8$ (88% of exit) | $A/A_t = 29.8$ (54% of exit) | 29.8, but bell 1 ends earlier |
| ideal $I_{sp}$ vac (s) | 345.3 | 354.7 | 362.2 | ~354.7 (low mode) |
| ideal $I_{sp}$ SL at 100% (s) | 329.9 | 328.6 | 319.9 | 328.6 |
| exit diameter (m)* | 0.70 | 0.92 | 1.19 | 0.92 |

\* for ~845 kN sea-level thrust per engine; scale as $\sqrt{F}$. **None of the
options is limited by the 1.8 m constraint** — noticing that the stated
constraint is not binding is itself worth marks.

**Key observations a strong answer must contain.**

1. **A is underexpanded even at sea level** ($p_e/p_a = 1.25$). It cannot
   separate, ever, but it is leaving 17 s of vacuum $I_{sp}$ on the table
   against C and 9 s against B, for the entire burn. At $p_c = 25$ MPa,
   $\varepsilon = 20$ is simply too small: high chamber pressure is what buys
   area ratio (P7), and A does not spend it.
2. **The separation station depends on $p_0/p_a$, not on $\varepsilon$.** At 40%
   throttle both B and C separate at the same station, $A/A_t \approx 29.8$.
   That is the single most important line in the table: it means the question is
   not "does it separate" but "how much of my nozzle is outboard of the
   separation station". For B that is 12% of the exit area — a shallow, marginal
   separation right at the lip. For C it is 46% — deep, unsteady, and squarely
   in side-load territory.
3. **Sea-level $I_{sp}$ at 100% barely distinguishes A and B** (329.9 versus
   328.6 s) while vacuum $I_{sp}$ differs by 9.4 s. B gets nearly all of A's
   sea-level performance and most of C's vacuum performance.
4. **The trajectory weighting matters.** 55% of the propellant burns below
   15 km, so the sea-level-ish $I_{sp}$ carries slightly more than half the
   weight — but the *upper* half of the burn is at higher vehicle velocity where
   $\Delta V$ is worth more per unit mass. A defensible answer states which
   weighting it used.

**Recommendation: B ($\varepsilon = 34$), with two conditions.**

Reasoning: B captures 9.4 s of the 16.9 s available between A and C at
essentially no sea-level cost, keeps the full-thrust sea-level operating point
comfortably attached ($p_e/p_a = 0.63$, margin of 2.2× on Schmucker), and its
worst case — deep throttle at sea level — separates only in the last 12% of the
exit area, which is a nozzle-lip phenomenon rather than a structural one. C's
extra 7.5 s is bought with a 46%-separated nozzle at deep throttle, on a
sea-level-started booster whose landing burn is a deep-throttle sea-level
operation *by design*. That is the wrong risk to take for 2% of $I_{sp}$.

Conditions: (i) impose a **throttle-versus-altitude constraint** — no operation
below ~60% $p_c$ below 5 km except in the landing burn, which must be
separately analysed; (ii) commit to **subscale cold-flow characterisation** of
the actual contour through the start ramp before contour freeze.

**Reject D** on maturity, not on physics. A dual bell would in principle give
B's sea-level behaviour and C's vacuum behaviour, and altitude-compensating
nozzles have been proposed for decades — but nothing of the kind has flown at
scale, the transition between modes is itself a side-load event, and its
behaviour under throttling is not established. [R] Putting an unflown nozzle
concept on the critical path of a first stage for ~7 s of $I_{sp}$ is not a
defensible programme decision. If the organisation wants it, it belongs on a
technology-development path with its own test article.

**Rubric.**

| element | marks |
|---|---|
| $p_e$ and $p_e/p_a$ correct for all options at 100% | 15 |
| Same at 40% throttle (the point of the question) | 15 |
| Schmucker applied correctly at both conditions, with the observation that the separation station is set by $p_0/p_a$ | 20 |
| Vacuum and sea-level $I_{sp}$ estimates for each option | 10 |
| Explicit side-load argument citing FSS/RSS, not just "it separates" | 15 |
| A clear recommendation with stated conditions | 10 |
| Statement of what would be tested before committing | 10 |
| Noticing the 1.8 m constraint is not binding | 5 |

Loses marks for: choosing C on vacuum $I_{sp}$ alone with no throttle analysis
(cap 55); choosing D without acknowledging its maturity (cap 60); computing
only the 100% condition (cap 50); quoting a single "optimum expansion ratio for
sea level" as if a first stage had one operating point (cap 45); any answer
whose $p_e$ values are wrong by more than 3% (arithmetic, cap 70 regardless of
the argument quality).

An answer recommending **C** can reach 90 if — and only if — it does the deep-
throttle analysis, quantifies the side-load exposure, and proposes a concrete
mitigation (e.g. no deep throttle below 8 km, structural margin sized to the
predicted transient, contour truncation as a fallback). The recommendation is
not the graded object; the argument is.

---

## K4. Common wrong answers and what they reveal

**"Mass flow increases as the rocket climbs."** Reveals that choking has not
been internalised as an *information* barrier. It usually comes with the belief
that lower back pressure "sucks more flow through", which is true in an
unchoked duct and false in every rocket above the first few milliseconds of
start. Fix: re-derive that mass flux is maximised at $M=1$ and note that the
throat has already reached it.

**Using $A/A^*$ with the *chamber* $A^*$ downstream of a shock.** The single
most common calculation error in this module (problem C6). It reveals that the
student is treating $A^*$ as a piece of hardware rather than as a *reference
state* that moves when $p_0$ changes. The tell is an exit Mach number that comes
out supersonic when the whole point of the shock was to make the exit subsonic.

**Treating overexpanded and separated as synonyms.** Reveals a purely inviscid
picture. The F-1 was overexpanded at liftoff and attached; the RS-25 is
overexpanded 5.4× and attached at mainstage. Separation is a viscous,
Mach-dependent, contour-dependent, transient-sensitive phenomenon, and it starts
somewhere below $p_e/p_a \approx 0.3$–0.4, not at 1.0.

**Quoting Summerfield's 0.4 as if it were a law.** Reveals that the student has
read one textbook. [SFS54] is a three-page 1954 correlation for conical nozzles;
[Schmucker73] surveyed the alternatives and showed they disagree by tens of
percent; [OMK05] explained why. Using 0.4 is fine as a sanity check; using it
without saying it is a sanity check is not.

**Claiming a shock "reflects off the nozzle wall and cancels".** Confuses free-
boundary reflection (a shock reflects off a constant-pressure free jet boundary
as an expansion — this is why plume cells are periodic) with solid-wall
reflection (a shock reflects off a wall as a shock). Both appear in this module;
they behave oppositely.

**Reporting $I_{sp}$ to four significant figures from a $\gamma$-constant
model.** Reveals no feel for model error. The single-$\gamma$ perfect-gas model
is good to 1–3% on $I_{sp}$ (§3.17). Three significant figures is the honest
maximum, and a stated uncertainty is better.

**Believing the plume's visible diamonds are the shock structure.** Common,
harmless in a lecture, embarrassing in a test report. The luminosity is largely
afterburning of fuel-rich exhaust with entrained air; the wave structure is
still there in a vacuum plume where there is nothing to see.

**Answering the trade study with "pick the highest $\varepsilon$ that fits".**
Reveals that the student optimised the engine instead of the stage, and did it
at one operating point. Every real programme that has done this has met §3.15 on
a test stand.

**Quoting a single expansion ratio for the RS-25 without a caveat.** Reveals
that the student took the first number they found. The reference file flags
69:1, 77.5:1 and 78:1 in circulation from credible sources meaning different
things. Whichever you print, print where it came from.
