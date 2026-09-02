# Module 33 — Systems Engineering for Propulsion: answer key

Grading follows the course convention: method first. A correct setup with an
arithmetic slip loses at most 30 % of the marks; a right number from a wrong
setup scores zero. Reasoning problems are graded on whether the
counter-argument is stated and defeated, not on which side is taken — except
where noted.

---

## K1. Problem solutions

### Conceptual

**C1.** *"Fast and reliable start transient"* contains no measurable
predicate, no tolerance, and no verification hook. Three replacements, each
one shall:

1. *The engine shall reach 90 % of rated chamber pressure within 1.6 s of the
   start command, at every combination of inlet conditions in Table X.*
   Parent: the stage's ullage-settling propellant budget, which is
   proportional to the time between start command and thrust. Verification:
   test, on every acceptance hot fire.
2. *The impulse delivered between start command and 90 % chamber pressure
   shall be 1,850 ± 150 N·s.* Parent: guidance injection accuracy. Rationale:
   the mean is needed by the trajectory model and the dispersion by the
   injection error budget. Verification: test, with the dispersion
   established over the qualification population.
3. *The engine shall complete 20 consecutive starts without a chamber
   pressure overshoot exceeding 115 % of rated.* Parent: thrust structure
   design load and chamber life. Verification: test.

Had the original survived to critical design review it would have cost the
programme in three specific ways: the trajectory group would have had to
assume a start transient (and would have assumed a conservative one, costing
propellant); the thrust structure would have been sized on an assumed
overshoot; and at acceptance there would have been no pass/fail criterion, so
the first engine with a slow start would have triggered an argument with no
document to settle it. Marks: 2 per requirement (statement, tolerance,
rationale, verification), 2 for the consequence argument.

**C2.** In Eq. 3.5, acceleration enters only through the term $za/g_0$, and
$z$ — the liquid column above the inlet — goes to nearly zero at the end of
the burn. Their product therefore collapses even though $a$ is at maximum: in
WE3 the whole acceleration-head term was 0.26 m out of a 15 m requirement.
Meanwhile $\Delta p_{line}$ is at full flow, the ullage has expanded to its
largest volume so pressurisation is working hardest, and any warming of the
propellant over the burn has raised $p_v$. All three effects move the wrong
way together.

The start of a burn becomes the worst case when the burn follows a coast:
acceleration is at whatever the settling thrusters provide (10⁻³ to 10⁻²
$g_0$, so the $za/g_0$ term is negligible regardless of $z$), the propellant
has warmed and possibly stratified during the coast so $p_v$ is high, and the
tank pressure may have been vented for structural reasons. **Restart, not
end-of-burn, is the sizing case for a stage with long coasts** — which is
exactly the Centaur problem of §6.4.

**C3.** The second programme. Design margin is worth what the analysis is
worth; a bearing life model is an empirical correlation with scatter of a
factor of several, so 30 % on top of it is inside the noise. The second
programme has demonstrated margin on hardware.

What to ask the first: what is the validation basis of the life model, what
scatter does it have against the data it was fitted to, and does the
correlation's validity range cover this bearing's DN number, load and
lubrication regime? Also: what is the failure mode the margin is protecting
against, since a life model calibrated for fatigue spalling says nothing
about cage wear or lubricant degradation.

What to ask the second: were the three bearings from different production
lots, and were the test conditions representative — same loads, same speeds,
same lubricant, same thermal environment, same duty cycle including starts?
Three samples from one lot demonstrate that lot. And: what did teardown show
— three units that survived with heavy wear are a different result from three
that came back clean.

**C4.** Pogo is a loop (§3.4), and loop behaviour is set by gain *and phase*.
Filling the prevalve cavities with helium adds compliance $C$ at the pump
inlet, which lowers the feed system's resonant frequency as $C^{-1/2}$
(Eq. 3.2) and moves it away from the structural frequency $f_s$. Off
resonance, the feed system's response to an inlet pressure perturbation is
smaller and its phase relative to the structural motion is wrong for
sustained energy transfer. The gas volume also dissipates energy, adding
damping to the loop.

The apparent paradox — compliance usually makes things oscillate more — is
resolved by asking *which* oscillator. Adding compliance does make the
feed line a softer, lower-frequency oscillator; the point is that we are not
trying to stop the feed line oscillating, we are trying to stop it exchanging
energy with a 5–25 Hz structural mode. Detuning is the objective and
compliance is the cheapest knob. Full marks require this distinction.

**C5.** Three reasons:

1. **Repeatability.** Below the valve's own response time the impulse bit is
   dominated by opening and closing transients rather than by steady thrust,
   and its scatter grows from a few per cent to tens of per cent. A commanded
   2 ms pulse might deliver anything between 40 % and 140 % of the nominal, so
   the controller gets less precision than a longer, more repeatable pulse
   would give it.
2. **Life.** Impulse-bit requirements translate into cycle counts. A control
   law that fires 2 ms pulses instead of 10 ms pulses uses roughly five times
   as many actuations for the same impulse, and valve and catalyst-bed life
   are counted in cycles.
3. **Physics of the thruster.** A monopropellant thruster's catalyst bed is
   not at steady temperature in 2 ms, and a bipropellant thruster may not have
   established a stable flame; the first milliseconds of a cold pulse are
   inefficient and produce unburned propellant, which is a contamination
   source.

What goes in the interface document instead: **the minimum *repeatable*
impulse bit, its nominal value and its 3σ scatter, as a function of on-time
and inlet pressure**, together with the on-time below which the thruster is
not qualified for use. Give the controller a curve, not a single number.

**C6.** Residuals are unusable — trapped in sumps, lines, jackets and the
engine at cut-off, plus hold-back to prevent gas ingestion. They are consumed
on every flight in the sense that they are *always* left behind; none of them
does work. Reserves are usable propellant held back to cover dispersions; on
a nominal flight **none** of the reserve is consumed and it is left in the
tank at cut-off.

Cost in payload: at an upper-stage exchange ratio of roughly 1 kg payload per
kg of final mass, both cost their own mass in payload if you want to keep the
same Δv, but they do so for different reasons. Residuals are pure loss and the
only remedy is design. The reserve is insurance whose premium is paid every
flight and which is claimed on the bad ones; its size is set by the Δv
dispersion of WE2, and shrinking it requires shrinking that dispersion, not
courage. A good answer notes that Eq. 3.10 makes residual propellant strictly
more expensive per kilogram than dry mass, because it was carried *and*
delivered no impulse.

**C7.** Because a requirement is a claim about the delivered article, and a
claim that cannot be shown true or false does not constrain anything. It
cannot be used to accept or reject hardware, it cannot be costed (nobody
knows what proving it would take), and it cannot be traced to a test, so at
the end of the programme somebody signs it off on the basis of opinion. In
practice unverifiable requirements are either deleted or quietly ignored, and
the second is worse because the design decisions that were made in their name
survive.

Example: *"The engine shall be robust to propellant contamination."*
Unverifiable — no contaminant, no quantity, no criterion. Repaired: *"The
engine shall complete a full mission duty cycle with no performance change
exceeding 1 % after ingesting 5 g of particulate to the specification of
Table Y through the fuel inlet."* Now it names a contaminant, a quantity, a
measurable effect and a test.

### Calculation

**P1.** $c = 340 \times 9.80665 = 3{,}334.3$ m/s.

$$\Delta v = 3334.3\ln(12000/3500) = 3334.3 \times 1.23217 = 4{,}108.3\ \mathrm{m/s}$$

$$\frac{\partial \Delta v}{\partial I_{sp}} = \frac{\Delta v}{I_{sp}}
= \frac{4108.3}{340} = 12.08\ \mathrm{m/s\ per\ s}$$

$$\frac{\partial \Delta v}{\partial m_d} = c\left(\frac{1}{12000}-\frac{1}{3500}\right)
= 3334.3\,(8.3333-28.5714)\times10^{-5} = -0.6748\ \mathrm{m/s\ per\ kg}$$

$$\frac{\partial \Delta v}{\partial m_{res}} = -\frac{3334.3}{3500} = -0.9526\ \mathrm{m/s\ per\ kg}$$

Residual propellant is more expensive by a factor of $0.9526/0.6748 = 1.412$.
The factor is exactly $m_0/m_p = 12000/8500 = 1.412$, which is worth stating:
from Eqs. 3.9 and 3.10 the ratio of the two sensitivities is $m_0/(m_0-m_f)$,
so residuals hurt relatively more on stages with a *small* propellant mass
fraction.

**P2.** 1σ inputs: $\sigma_{I} = 0.008\times340 = 2.72$ s;
$\sigma_{m_d} = 0.04\times2000 = 80$ kg;
$\sigma_{res} = 0.004\times8500 = 34$ kg.

| source | sensitivity | 1σ Δv term | variance share |
|---|---|---|---|
| $I_{sp}$ | 12.083 m/s per s | 32.87 m/s | 21.4 % |
| dry mass | −0.6748 m/s per kg | −53.98 m/s | 57.8 % |
| residuals | −0.9526 m/s per kg | −32.39 m/s | 20.8 % |

$$\sigma_{\Delta v} = \sqrt{32.87^2+53.98^2+32.39^2} = 71.0\ \mathrm{m/s} = 1.73\ \%$$

3σ = 213 m/s. **Dry mass dominates at 58 % of the variance** and is where to
spend money: a ±4 % dry-mass uncertainty on a stage at preliminary design is
a statement that the mass properties are not under control, and it is
reducible by ordinary discipline — a component-level mass tracking system,
weighing hardware as it arrives, and per-item MGA rather than a flat
allowance. Reducing it to ±2 % alone drops $\sigma_{\Delta v}$ to 52.0 m/s.
Reducing the Isp uncertainty by the same relative amount would drop it only
to 66.5 m/s, for far more money. Marks: 4 for the RSS, 3 for the variance
decomposition, 3 for a recommendation that follows from the decomposition
rather than from taste.

**P3.** Required head $= 1.4 \times 18 = 25.2$ m.
Acceleration head term $= z a/g_0 = 0.4 \times 2.2 = 0.88$ m.

Warm case ($\rho = 1{,}125$, $\rho g_0 = 11{,}032$ Pa/m):

$$p_t = 155{,}000 + 25{,}000 + 11{,}032\,(25.2-0.88) = 155{,}000+25{,}000+268{,}310
= 448{,}310\ \mathrm{Pa} = 4.48\ \mathrm{bar}$$

Subcooled to 85 K ($\rho = 1{,}178$, $\rho g_0 = 11{,}552$ Pa/m):

$$p_t = 55{,}000 + 25{,}000 + 11{,}552\,(24.32) = 55{,}000+25{,}000+280{,}950
= 360{,}950\ \mathrm{Pa} = 3.61\ \mathrm{bar}$$

**Saving: 0.87 bar**, i.e. 19 % of the tank pressure. Note two things a good
answer catches. First, almost the whole saving comes from the 100 kPa drop in
vapour pressure, not from the density change — and the density change
actually works *against* the saving, because denser propellant costs more
pascals per metre of head. Second, subcooling buys tank volume as well
(4.7 % more mass in the same tank), so the real benefit is larger than the
pressure saving alone; against that, it costs ground complexity and puts a
warming clock on the count.

**P4.** Midpoints of the §3.13 bands: existing qualified hardware in a new
application 4 %; preliminary layout 17.5 %; existing hardware identical
application 1.5 %; conceptual 27.5 %.

| item | CBE (kg) | MGA | allocated (kg) | growth (kg) |
|---|---|---|---|---|
| engine | 120 | 4 % | 124.8 | 4.8 |
| tanks | 210 | 17.5 % | 246.8 | 36.8 |
| structure | 130 | 17.5 % | 152.8 | 22.8 |
| avionics | 45 | 1.5 % | 45.7 | 0.7 |
| pressurisation | 60 | 27.5 % | 76.5 | 16.5 |
| **total** | **565** | **14.4 % effective** | **646.5** | **81.5** |

A flat 15 % on the total gives 649.8 kg — **3.3 kg heavier, a 0.5 %
difference**. The totals agree almost exactly, and *that near-agreement is the
trap*. The two methods make completely different statements about risk: the
per-item method says 65 % of the expected growth (53.3 of 81.5 kg) sits in
the tanks and the pressurisation system, and only 6 % in the engine and
avionics. That is actionable — it says where to spend design and analysis
effort, and it says that if the tanks come in on their CBE the programme gets
37 kg back. The flat method says nothing at all. Marks: 6 for the table, 4 for
the flat comparison, 5 for the interpretation, and full marks require the
observation that similar totals do not mean the methods are equivalent.

**P5.** Applying the 4× service life factor: **16 starts and 3,600 s** of
cumulative firing must be demonstrated on qualification engines.

Per engine, the duration drives the count: $\lceil 3600/500 \rceil = 8$
firings. Those 8 firings deliver at most $8 \times 3 = 24$ starts, which
covers the 16 required, so duration and not starts is the binding constraint.
Two engines, each independently demonstrating the full life:

$$2 \times 8 = 16\ \text{firings}, \qquad 16 \times 380{,}000 = 6{,}080{,}000\ \text{currency units}$$

Two observations worth marks. First, the life demonstration alone costs about
six million before any development, performance, transient, off-nominal or
environmental testing — this is why the 4× factor is a programme-level cost
decision disguised as a technical standard. Second, if the facility limit were
600 s rather than 500 s the firing count would drop to 6 per engine and the
cost by 25 %; facility capability is a first-order driver of qualification
cost, which is an argument for choosing the test facility before writing the
qualification plan.

**P6.** Eq. 3.6 with $R = 1.1$ m.

Start of burn, $h = 2.0$ m, $a = 0.6 g_0 = 5.884$ m/s²:
$1.841h/R = 3.347$, $\tanh(3.347) = 0.99754$.

$$\omega_1 = \sqrt{\frac{1.841\times5.884}{1.1}\times0.99754} = 3.134\ \mathrm{rad/s}
\Rightarrow f_1 = 0.499\ \mathrm{Hz}$$

End of burn, $h = 0.3$ m, $a = 1.4 g_0 = 13.729$ m/s²:
$1.841h/R = 0.502$, $\tanh(0.502) = 0.4638$.

$$\omega_1 = \sqrt{\frac{1.841\times13.729}{1.1}\times0.4638} = 3.264\ \mathrm{rad/s}
\Rightarrow f_1 = 0.520\ \mathrm{Hz}$$

**The interaction is not merely plausible, it is near-certain**: the slosh
mode sits at 0.50–0.52 Hz against a 0.5 Hz control frequency for the whole
burn. And the second half of the question is the important half: the frequency
*barely moves*, because the falling liquid depth (which lowers $\tanh$) is
almost exactly offset by the rising acceleration. The usual comfort — "the
mode sweeps through the control band quickly, so little energy is exchanged" —
does not apply here. The mode parks on the controller.

Remedies: ring baffles to raise the damping ratio from the 0.5–1 % of a bare
tank to several per cent, which is the primary fix and costs mass in the tank;
a notch filter in the control law, which costs phase margin and is fragile
because the notch must track a frequency that changes with fill and
acceleration; and, at design level, changing the tank aspect ratio, since
$f_1 \propto R^{-1/2}$. A good answer says baffles first, filter only as
support, and demands a coupled slosh–control simulation over the full burn
rather than at two points.

**P7.** Effective offset:

$$e_{eff} = 2.0\times10^{-3} + (0.15° \times \pi/180)\times 1.8
= 0.0020 + 0.00471 = 0.00671\ \mathrm{m}$$

Note that the angular misalignment contributes more than twice as much as the
lateral offset — this is normal, and it is why thrust-vector *angular*
alignment is measured at acceptance while a millimetre of lateral offset is
often tolerated.

$$T = F e_{eff} = 445 \times 0.006712 = 2.987\ \mathrm{N\,m}$$
$$H = T\,t = 2.987 \times 2400 = 7{,}169\ \mathrm{N\,m\,s}$$

Reaction control propellant, single thruster at 1.2 m:

$$m_p = \frac{H}{r\,I_{sp}\,g_0} = \frac{7169}{1.2\times220\times9.80665} = 2.77\ \mathrm{kg}$$

If the torque is countered by a **couple** (two thrusters firing to avoid
imparting translation, the usual arrangement), the propellant doubles to
**5.5 kg**. Either way this is a serious fraction of a small spacecraft's RCS
load, delivered entirely by a 0.15° misalignment — which is the point of the
problem. Full marks require the couple observation and a comment that the
cheap fix is to trim the alignment at integration, or to bias the main engine
mounting to cancel the measured offset.

### Engineering reasoning

**R1.** Options, with what each costs and what it risks:

1. **Raise tank pressure.** Costs 40 kg of wall plus additional pressurant
   mass and bottle. Retires the risk completely by analysis. At an upper-stage
   exchange ratio this is ~40 kg of payload — the honest baseline against
   which everything else is measured.
2. **Subcool the propellant at loading.** Buys NPSH by lowering $p_v$ (P3
   showed 0.87 bar from a 10 K subcool on LOX), and buys tank volume at the
   same time. Costs ground system complexity, a boil-off clock during the
   count, and a new set of hold criteria. Zero flight mass. Schedule risk is
   in the ground segment, which is often where there is least margin.
3. **Reduce end-of-burn flow.** Throttle the last few seconds, or accept a
   longer, lower-thrust tail. Raises $\mathrm{NPSH}_r$ margin by lowering
   $\mathrm{NPSH}_r$ itself and $\Delta p_{line}$. Costs a small Δv loss and
   requires the engine to be qualified at that condition.
4. **Add a boost pump.** Definitive, and it is what large engines do. Costs
   hardware mass (likely more than 40 kg at this scale), a drive, and a new
   qualification article. Almost certainly wrong for a small stage.
5. **Redesign the sump and outlet** to reduce hold-back and line loss, and
   re-examine the $\mathrm{NPSH}_r$ figure itself, which may be a conservative
   supplier number rather than a measured one. Cheapest of all if it works.
6. **Challenge the 1.5 margin policy** for this specific case with a measured
   pump suction curve. Legitimate but slow, and a review board will want the
   test data before the waiver.

Recommendation: pursue 5 and 6 first because they are cheap and may make the
problem disappear, with 2 as the primary technical solution and 1 held as the
fallback that must be decided by a date early enough to allow the tank
redesign. **The test that retires the risk is a pump inlet suction
performance test**: run the actual pump (or its inducer) at flight flow with
inlet pressure walked down until head falls off by the criterion percentage,
and establish the real $\mathrm{NPSH}_r$ with its uncertainty. Everything else
in this problem is an argument about a number nobody has measured. Marks: 3
per option properly costed (max 12), 4 for the recommendation, 4 for naming
the right test.

**R2.** Diagnosis: **pogo**, or at minimum a feed-system/structure coupling.
The evidence is that the same frequency appears in chamber pressure and in
vehicle accelerometers, that it grows (so the loop gain exceeds unity), that
onset is 140 s into the burn (propellant depletion has moved the structural
frequency, the feed-line inertance, or the pump's cavitation state), and that
it stops at a throttle-down (which changes pump operating point, inlet flow
and cavitation compliance — a strong pogo signature, since a pure structural
or combustion problem would not care).

Additional data wanted: pump inlet and discharge pressure traces at high
sample rate, to establish whether the pump is amplifying and with what phase;
tank ullage pressure and level; the structural model's predicted first
longitudinal frequency as a function of propellant remaining, overlaid on the
observed 11 Hz; the pump's measured transfer function from a stand test with
an inlet oscillator; and confirmation that this is not a combustion
instability by checking whether the frequency matches any chamber acoustic
mode (11 Hz is far too low, so this check is quick and should be stated).

Two fixes to evaluate: **(a)** add compliance at the pump inlet — a
gas-charged accumulator sized to move $f_{feed}$ well below the structural
frequency band across the whole burn; **(b)** stiffen or re-tune the
structure, or change the propellant management so the structural frequency
does not cross the feed frequency. Choose on three grounds: which one keeps
margin across the *whole* burn rather than at the observed condition (the
accumulator usually wins, because it detunes over a range); which one is
verifiable before flight (accumulator behaviour can be tested on a feed-system
rig; a structural retune requires a modal survey of the whole stage); and mass
and schedule. History has repeatedly chosen the accumulator (§3.4, §6.2), and
a strong answer says so while noting that an accumulator is a new pressurised
component with its own failure modes and charging requirements.

**R3.** For: nine months and real money on a programme where schedule may be
the binding constraint; the article flown is one you have personally tested,
which has value; protoflight is standard and accepted practice for many space
systems; and a dedicated qualification article on a low-rate programme may
cost a large fraction of the total hardware budget.

Against: this is a **pump-fed, restartable** engine — rotating machinery with
bearings, seals and dynamic seals, and a restart function. Its dominant
failure modes are wear-out and cumulative damage, exactly the class that
protoflight handles worst, because protoflight explicitly declines to
demonstrate life. The 4× service life factor cannot be satisfied on an article
you intend to fly. Random vibration at qualification amplitude consumes
fatigue life you then fly with, and for turbomachinery the consumed fraction
is not negligible or easily bounded. There is also no article left to tear
down, so you never see the wear state that qualification would have revealed.

Conditions under which to accept: (i) life and duration demonstration is
carved out and performed on separate, dedicated hardware — a "life engine" —
so protoflight covers only the environmental qualification; (ii) the design is
genuinely a derivative of qualified hardware, so the wear-out modes are
already characterised; (iii) an analysis, not an assertion, bounds the fatigue
life consumed by the protoflight environments and shows adequate remaining
life with margin; (iv) teardown and inspection of the protoflight article
after test, with acceptance criteria written in advance. Absent (i), refuse.
Marks: 5 for the case in favour, 7 for the specific wear-out argument against,
6 for conditions, with full marks only if the answer separates *environmental*
qualification (protoflightable) from *life* qualification (not).

**R4.** Outage with a biased load. The two error sources are loading accuracy
(0.4 % of each tank, 1σ) and mixture ratio (±1.5 %, which shifts the ratio in
which the tanks are drawn down). On an 18 t load, a 1.5 % mixture ratio error
alone mis-draws roughly 1.5 % of the smaller tank's contents — of order
$0.015 \times 18{,}000/(1+\mathrm{MR})\times\mathrm{MR}$, i.e. a couple of
hundred kilograms if uncorrected — and loading error adds
$0.004\times18{,}000 = 72$ kg (1σ, root-sum-squared across two tanks, so about
100 kg at 3σ). A bias must be sized to cover the *3σ* combination in the
direction that matters, so the bias itself is of order 250–350 kg of
deliberately mis-loaded propellant, essentially all of which becomes outage on
a nominal flight.

With a propellant utilisation system, the residual outage is set by the
system's own measurement accuracy and its authority, typically a few tens of
kilograms, at the cost of running off optimum mixture ratio for part of the
burn. Because $\partial I_{sp}/\partial\mathrm{MR} = 0$ at the optimum, a
±1.5 % excursion costs a fraction of a second of $I_{sp}$ — call it 0.1–0.3 %
of Δv — while 250–350 kg of outage on an 18 t stage costs far more.

**Ruling: the propellant utilisation system wins on this stage**, and the
margin is not close. The reason is the size: PU hardware mass and complexity
are roughly fixed, while outage scales with the propellant load, so PU pays
above some load and not below it. On a 2 t stage the same analysis reverses.
A strong answer states the crossover argument explicitly and notes that the
J-2 case (§3.8) is the historical precedent, on a stage of exactly this
character. Full marks require the second-order/first-order comparison, not
just a preference.

**R5.** The answer is that the redline set is not a safety device in the
abstract; it is a decision rule whose costs and benefits change with flight
phase, and holding it constant would be the compromise.

On the pad, a shutdown costs a scrub. Detection of a degrading engine is worth
almost any false-alarm rate, so redlines are tight, numerous, and act fast.
After lift-off on a stage with no engine-out capability, a shutdown costs the
mission and possibly the vehicle. A redline that fires on a marginal
indication now converts a *possible* engine problem into a *certain* mission
loss. The expected-value calculation reverses, and the correct response is
fewer parameters with shutdown authority, wider limits, longer persistence
requirements, and multi-channel agreement.

The board should also be told what is *not* being relaxed: the parameters
protecting against a failure that would endanger the vehicle or the range
(a leak that could cause an explosion, an overspeed that could liberate
turbine debris) keep their authority throughout, because their cost of missed
detection is not "mission loss" but "loss of vehicle plus hazard". The
distinction is by consequence class, not by convenience. And STS-51F (§6.1) is
the direct evidence that the alternative policy has its own body count in
missions. Marks: 6 for the asymmetric-cost argument, 6 for the phase
dependence, 4 for the consequence-class carve-out, 4 for citing evidence.

---

## K2. Quiz answers with explanations

**Q1 (8).** Statement, parent, rationale, verification method (and level).
The rationale is most often missing because it is the only field that cannot
be produced mechanically — it requires the author to remember why the number
was chosen — and its absence is invisible until somebody wants to change the
number, at which point nobody can say what breaks. The verification method is
most often missing because at the time of writing it is nobody's cost: it is
the field that turns a sentence into a budget line, and deferring it is the
cheapest thing in the room until the verification matrix must close.
*(2 marks per field, 2 marks for each explanation, capped at 8.)*

**Q2 (10).** $c = 320\times9.80665 = 3{,}138.1$ m/s;
$\Delta v = 3138.1\ln(6000/2400) = 3138.1\times0.91629 = 2{,}875.4$ m/s.

$\partial\Delta v/\partial m_d = 3138.1(1/6000-1/2400) = -0.7845$ m/s per kg,
so 50 kg of dry mass costs **39.2 m/s** (exact recomputation: 38.7 m/s).

$\partial\Delta v/\partial m_{res} = -3138.1/2400 = -1.3075$ m/s per kg, so
50 kg of residual costs **65.4 m/s** (exact: 64.7 m/s).

Residual is worse by a factor of $m_0/m_p = 6000/3600 = 1.667$. Marks: 3 for
Δv, 3 for each sensitivity, 1 for the ratio; 1 bonus-equivalent for noting the
linearisation error is under 1.5 %.

**Q3 (8).** The intended answer is **(b)** for a stage that burns once from
ignition to depletion: the acceleration head term collapses with the liquid
column while line loss is at maximum and pressurisation is working hardest.
**(d) is fully defensible and earns full marks if argued**, because for a
stage with a long coast the restart is the true sizing case — settling
acceleration is three orders of magnitude below burn acceleration, so the
$za/g_0$ term is negligible whatever $z$ is, and the propellant has warmed.
(a) is wrong as stated: at ignition the tank is full, so $z$ is at maximum and
the column head compensates for low acceleration. (c) is irrelevant — dynamic
pressure is an external aerodynamic quantity and does not appear in Eq. 3.5.
Marks: 4 for the choice, 4 for the justification; an unjustified (b) scores 4.

**Q4 (10).** $\rho g_0 = 1140\times9.80665 = 11{,}179.6$ Pa/m.
Acceleration head $= 0.5\times1.8 = 0.9$ m.

$$p_t = 115{,}000 + 20{,}000 + 11{,}179.6\,(20-0.9) = 115{,}000+20{,}000+213{,}530
= 348{,}530\ \mathrm{Pa} = \mathbf{3.49\ bar}$$

Marks: 3 for the correct form of the inversion, 3 for the acceleration term
handled correctly (a common error is to add $za$ in pascals or to omit the
$g_0$ normalisation), 4 for the arithmetic and units.

**Q5 (10).** Verification: does the article meet its specification —
reference is the specification. Validation: does the article satisfy the
need — reference is the mission.

Example: an upper-stage engine that meets every line of a specification
written without a coast-duration requirement, and cannot restart after five
hours because the propellant has warmed above the pump's inlet temperature
limit and the batteries powering the chill-down valves have run down. Every
requirement passes; the mission fails. (Any example with the same structure —
specification silent on a real mission condition — earns full marks.)

Last realistic opportunity: the **flight readiness review**, where the
mission-specific duty cycle, propellant load and environments are examined
against the article's demonstrated capability for the first time as a
*mission* rather than as a specification. A defensible alternative answer is
the system requirements review, on the grounds that validation failures are
created there and merely discovered later; award full marks for either if the
reasoning is given. Marks: 4 for definitions, 4 for the example, 2 for the
review.

**Q6 (12).** At preliminary layout maturity, MGA 15–20 %; take the 17.5 %
midpoint. Allocated mass $= 84 \times 1.175 = 98.7$ kg.

Measured at 97 kg: **the allocation is met, with 1.7 kg to spare** (1.7 % of
allocation). The 12 % system margin is untouched and remains available to the
programme; it was never this component's to spend.

What to report at the mass review: *"CBE was 84 kg at preliminary layout;
allocation 98.7 kg at 17.5 % MGA; as-measured 97.0 kg; allocation met with
1.7 kg margin; MGA is now retired for this item and replaced by measurement
uncertainty of ±0.3 kg; I am returning 1.7 kg to the system margin pool."*
The last clause is what distinguishes a good answer: growth allowance that
turns out not to be needed belongs back in the programme's pool, not quietly
retained in the subsystem as private margin. Marks: 3 for the MGA choice with
justification, 3 for the allocation, 3 for the verdict, 3 for the reporting
statement including the return of unused allowance.

**Q7 (10).** **(b).** The logic has one input and two hypotheses to
distinguish — "the engine is failing" and "the sensor is failing" — and one
measurement cannot separate them. (a) is a red herring: the sensors are
accurate enough, and accuracy is not the failure mode; a *failed* sensor is
not an inaccurate one. (c) is wrong: redlines with shutdown authority are
correct and necessary, particularly on the ground. (d) describes a real
maintenance issue but is second-order and is handled by periodic limit
review, not by architecture. Marks: 5 for the choice, 5 for the justification
including why (a) and (c) are wrong.

**Q8 (12).** Four questions, from a longer defensible list:

1. Were any of the criteria really constraints? An option that violates a
   constraint should have been eliminated, not scored, and scoring it lets a
   fatal flaw be outweighed.
2. Are the criteria independent, or is the same underlying property (say,
   propellant density) scored under two names and thus double-weighted?
3. Where did the weights come from, and what happens to the ranking when they
   move by the amount their owners would concede as arguable?
4. What is the uncertainty in the individual scores? A −1 that is really a
   guess about a supplier's schedule is not the same object as a −1 backed by
   a mass estimate.
5. Is a 4-point gap out of 100 larger than the noise in the scoring? On
   ordinal judgments it usually is not.

Reject the recommendation if the weight sweep shows the ranking flipping
inside the range of weights that no one in the room could defend choosing
between — as in WE4, where the winner changed twice between performance
weights of 30 and 45. The correct output in that case is not the top-scoring
option but a statement of which criterion the decision turns on and a plan to
reduce its uncertainty. Marks: 2 per question (max 8), 4 for the rejection
criterion.

**Q9 (10).** Sequence: inspection and mass properties, proof pressure,
functional and performance baseline, random (then sine) vibration, shock,
thermal cycling and thermal vacuum, functional and performance repeat, life
or duration testing, and finally burst or destructive examination on the
qualification article.

(i) Functional tests bracket each environment so that any change in
performance can be **attributed**. If you run vibration, shock and thermal
back to back and then find a leak, you have learned that the article leaks
and nothing about which environment caused it — which means you cannot fix
the design, only the article. Attribution is the entire diagnostic value of a
test sequence.

(ii) Burst comes last for two reasons: it destroys the article, so nothing
can follow it; and, more importantly, a burst demonstrated on hardware that
has already absorbed the full environmental and life history is a margin
statement about **used** hardware, which is the condition the flight article
will be in. Bursting a pristine article would overstate the margin. Marks: 4
for the sequence, 3 for each justification.

**Q10 (10).** Four from: released drawings and specifications (answers "can
this be built as drawn?"); completed stress, thermal and dynamic analyses
with margins of safety on final geometry ("does it survive its environments
as designed, not as conceived?"); the completed verification matrix with a
method and a procedure against every requirement ("is there a plan to prove
every claim?"); qualification test plans with levels, durations and pass/fail
criteria ("do we know what success looks like before we spend the money?");
a signed interface control document ("has the other side agreed?"); closed
TBRs ("are the numbers real?"); worst-case tolerance-combination analysis
("does it work at the corners, not just at nominal?"); component
qualification status ("is the long-lead hardware actually qualified?").
Marks: 2.5 each for a valid item plus the question it answers; an item that
would equally have been brought to the preliminary design review scores zero.

---

## K3. Trade-study reference solution (T1)

### Sizing

Δv requirement $= 1{,}750 \times 1.02 = 1{,}785$ m/s. Payload 900 kg.
Structure, avionics and harness 240 kg CBE; 15 % MGA applied to all dry items
including tanks and pressurisation; residuals 1.2 % of usable propellant.
Iterating $m_{dry} = 1.15\,(240 + m_{eng} + f\,m_{load})$ with
$m_f = 900 + m_{dry} + 0.012\,m_p$ and
$m_p = m_f(e^{\Delta v/(I_{sp}g_0)}-1)$:

| | Option P (pressure-fed) | Option U (pump-fed) |
|---|---|---|
| $I_{sp}$ | 322 s | 338 s |
| engine dry mass | 40 kg | 85 kg |
| tank + pressurisation fraction | 22 % of load | 9 % of load |
| usable propellant | 1,166 kg | 991 kg |
| loaded propellant | 1,180 kg | 1,003 kg |
| stage dry mass (allocated) | 621 kg | 478 kg |
| burnout mass $m_f$ | 1,535 kg | 1,390 kg |
| ignition mass $m_0$ | 2,701 kg | 2,381 kg |
| **stage wet mass (excl. payload)** | **1,801 kg** | **1,481 kg** |

**Option U is 320 kg lighter wet — 18 % of the stage.** Put the other way: at
the same 2,701 kg injected mass, option U would carry **1,071 kg** of payload
instead of 900 kg, a 19 % payload increase. That is a large, real, and
entirely expected result: the pump-fed stage wins twice, once on specific
impulse (322 → 338 s) and once, larger, on tankage, because pressure feeding
forces the tanks to hold roughly $p_c$ plus feed losses and that mass scales
with the whole propellant load.

### The schedule, which is the actual decision

| | Option P | Option U |
|---|---|---|
| development estimate | 22 months | 30 months |
| stated uncertainty | ±4 months | ±9 months |
| need date | 30 months | 30 months |
| months of schedule margin at the estimate | 8 | 0 |
| rough probability of meeting the date | high — the estimate plus its full stated uncertainty (26 months) still fits | at best even — the estimate exactly equals the need date, so any overrun misses it |

Option U's schedule estimate has no margin at all against the need date and a
±9 month uncertainty around it. A programme that accepts option U is
accepting roughly a coin-flip on its first flight date in exchange for 19 %
payload.

### A defensible matrix

Datum: option P. Scores on −2…+2, weights summing to 100.

| criterion | $w$ | P | U |
|---|---|---|---|
| delivered payload / stage mass | 25 | 0 | +2 |
| schedule confidence against the 30-month date | 30 | 0 | −2 |
| development cost and risk (new turbopump) | 20 | 0 | −2 |
| recurring cost | 10 | 0 | −1 |
| growth potential for future payloads | 10 | 0 | +2 |
| operations and propellant handling | 5 | 0 | 0 |
| **total** | **100** | **0** | **−60** |

Sweep the schedule weight $w_{sched} = y$ with the payload weight taking up
the slack ($w_{pay} = 55 - y$):

$$S_U(y) = 2(55-y) - 2y - 40 - 10 + 20 + 0 = 80 - 4y$$

$S_U > 0$ when $y < 20$. So option U wins only if schedule confidence is
weighted below 20 out of 100 — which, given a customer who wrote a 30-month
date into the requirement, it is not. **Recommendation: option P**, the
pressure-fed storable stage, with the pump-fed architecture identified as the
block upgrade.

### What would most change the answer, and how to get it

The single most decision-relevant unknown is **the firmness of the 30-month
date**, not any propulsion parameter. If the date is a hard contractual gate
with penalties, option P is correct at almost any payload penalty; if it is a
target with, say, six months of real tolerance, option U's schedule score
moves from −2 to −1 or 0 and the answer flips. That information costs one
conversation with the customer and is worth more than any analysis in this
study — which is itself the lesson.

Second most decision-relevant: **the credibility of option U's 30 ± 9 month
turbopump estimate**, which is the least well-supported number in the matrix.
Get it by (i) asking the supplier for the actual duration distribution of
their last several pump developments rather than a point estimate, and (ii)
funding an early pump risk-reduction activity — inducer suction testing and a
bearing rig — whose completion date is itself the leading indicator. If that
activity slips, the estimate is wrong and you find out in month 6 rather than
month 26.

A third possibility that a strong answer will raise unprompted: **the trade as
posed is a false dichotomy.** A pressure-fed stage at a higher chamber
pressure, or a pump-fed stage using an existing qualified pump from another
programme, or a pressure-fed first flight followed by a pump-fed block
upgrade, may dominate both options. The most valuable output of a two-option
trade study is frequently a third option.

### Rubric

**A strong answer must contain:**
- Both stages sized numerically, with the iteration on residuals handled
  (they scale with the load) and MGA applied. ±5 % on the masses is fine;
  the *ratio* between the options must be right.
- The explicit observation that option U's advantage comes more from tankage
  than from specific impulse, with the arithmetic to support it.
- The payload-at-fixed-injected-mass comparison, or an equivalent conversion
  of the mass saving into something the customer values.
- A weighted matrix with at least five criteria, schedule among them, and a
  **sweep** showing the weight at which the ranking flips.
- A recommendation that follows from the sweep rather than from the raw
  score, and a statement of what would change it.
- Identification of the schedule estimate — not a propulsion parameter — as
  the decision driver.

**Loses marks for:**
- Treating the 30-month date as a criterion to be traded rather than
  examining whether it is a constraint. If it is a hard constraint, option U
  is *eliminated*, not penalised, and the trade study is over in one line.
  A top answer addresses this explicitly.
- Reporting a single weighted score to two decimal places and stopping.
- Applying MGA to the propellant, or forgetting it on the tanks.
- Claiming a specific-impulse advantage without noting that 322 → 338 s is
  only 5 % while the mass difference is 18 %.
- Ignoring the ±9 month uncertainty, or treating ±4 and ±9 months as
  equivalent risk because both estimates "fit on the chart".

---

## K4. Common wrong answers and what they reveal

**Applying mass growth allowance to the total instead of per item.** The
totals often land within a per cent of each other (P4: 646.5 versus 649.8 kg),
which makes the error invisible and lets students conclude the methods are
equivalent. They are not: the flat method produces no information about where
the mass risk lives, and it therefore cannot be used to direct effort or to
release margin when an item comes in light. Reveals: treating margin as a
number rather than as a budget with owners.

**Confusing the two dry-mass sensitivities.** Adding inert mass changes both
$m_0$ and $m_f$ (Eq. 3.9); leaving residual propellant changes only $m_f$
(Eq. 3.10). Students routinely use $-c/m_f$ for both, which overstates the
cost of dry mass by the factor $m_0/m_p$. Reveals: differentiating the formula
without asking what is being held constant — the single most common error in
all sensitivity analysis.

**Sizing NPSH at the start of the burn.** The instinct is that the tank is
fullest at ignition so that must be worst. It is the opposite: full tank means
maximum $z$. The correct instinct is to look for where $z$, $p_t$ and $p_v$
are simultaneously unfavourable, which is end of burn — or, on a stage with
coasts, restart. Reveals: not having read the equation as a design tool.

**Adding the acceleration term in pascals.** $z a$ has units of m²/s², not
pascals; the term in Eq. 3.5 is $za/g_0$ in metres of head. Students who write
$p_t = p_v + \Delta p + \rho g_0 \mathrm{NPSH} - \rho z a$ get a plausible
number with the wrong scaling and never notice. Reveals: not carrying units.

**Reporting a Monte Carlo result to four significant figures.** The output
cannot be more precise than the input distributions, which were assumed. The
correct reporting is one or two significant figures plus a sentence on which
assumption dominates. Reveals: mistaking computational precision for
knowledge.

**Declaring a trade-study winner from the raw score.** A 4-point gap out of
100 on ordinal scores multiplied by weights chosen in a meeting is not a
result. Students who do not sweep the weights have not done the study; they
have done the arithmetic. Reveals: not understanding what the method is for.

**Treating a constraint as a criterion.** If the requirement says first flight
in 30 months, an option that cannot meet it is eliminated. Scoring it −2 on
"schedule" and letting a payload advantage outweigh that is the single most
common structural error in student trade studies, and it always favours the
technically exciting option. Reveals: wanting a particular answer.

**Saying "verification and validation" as one phrase.** Students who cannot
separate them will also fail to notice a specification that is silent on a
mission condition, which is where real vehicles are lost. Reveals: having
learned the vocabulary rather than the distinction.

**Arguing that looser in-flight redlines are a safety compromise.** This is
the intuitive answer and it is wrong; the asymmetry of costs reverses after
lift-off. Students who miss it are treating "safe" as a property of a setting
rather than of a decision rule evaluated against consequences. Reveals: no
model of what the redline is *for*.

**Answering "engine-out capability" without saying with respect to what.**
The Falcon 9 CRS-1 case (§6.3) exists precisely because that qualification was
missing. A capability statement with no stated mission objective, flight
phase, and resource budget is not a requirement. Reveals: writing
requirements as slogans.

**Giving the 4× service life factor as a rule without its cost.** Students
quote it correctly and then fail to notice that it multiplies the test
programme by four and is therefore one of the largest cost decisions on the
engine. Reveals: reading standards as constraints rather than as budget
commitments.

**Recommending "more margin" as the answer to an uncertainty problem.**
WE2 and P2 are both designed so that the correct answer is to reduce a
specific variance contributor, not to carry more propellant. Adding margin is
always available and is almost never the cheapest fix; a student who reaches
for it first has not decomposed the variance. Reveals: no habit of asking
where the uncertainty actually comes from.
