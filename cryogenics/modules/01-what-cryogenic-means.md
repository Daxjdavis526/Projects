# Module 01 — What Cryogenic Actually Means

*Roughly 20 minutes. Prerequisite: none — this is the first module.*

Most people arrive at a cryogenic system with a model borrowed from water: a tank
holds a liquid, the liquid sits there, the pressure is whatever you put on it.
Every part of that is wrong for a cryogen, and the gap between the two models is
where people get hurt.

## What you'll be able to do

- State what qualifies as a cryogen, and why the boundary is a convention rather
  than a physical transition.
- Explain why a cryogen in a closed tank cannot have its pressure and temperature
  set independently, and read a tank state off a *P*–*T* curve.
- Say where a heat leak's energy goes, and why latent heat dominates.
- Recognise the hazard in a trapped volume of cryogenic liquid.
- Explain why an expansion ratio without its reference conditions is meaningless.

## 1. Where the line is drawn, and who drew it

The working definition used across the field is that a **cryogen is a fluid whose
normal boiling point is below about 120 K (−153 °C)**. Everything this course
handles passes that test:

| Fluid | Normal boiling point |
|---|---|
| Methane (CH₄) | 111.667 K |
| Oxygen (O₂) | 90.1875 K |
| Argon (Ar) | 87.302 K |
| Nitrogen (N₂) | 77.3549 K |
| Hydrogen (H₂, normal) | 20.3689 K |
| Helium (⁴He) | 4.2238 K |

All from the NIST reference equations of state `[NIST-FLUIDS]`, Confidence A in
`reference/properties.md` §1.

Now the honest part: **nothing happens at 120 K.** No property changes character
there; no phase transition occurs. It is a filing convention, and this course's
reference set holds no primary citation for it — so use it to sort fluids, never
as an argument. The nearest thing to a rationale is that 120 K sits just below the
critical temperatures of the "permanent" gases — nitrogen 126.192 K, argon
150.687 K, oxygen 154.581 K — which cannot be liquefied by pressure alone at
ordinary temperature. Methane breaks even that, at 190.564 K, and everybody still
calls LNG cryogenic.

The bodies that bind you draw their own lines. **CGA P-12, 7th edition, January
2023** is titled *Guideline for Safe Handling of Cryogenic and Refrigerated
Liquids* — the retitle tells you the industry needed two categories `[CGA-P-12]`.
**NFPA 55, 2026 edition** is what a fire marshal enforces; **49 CFR 173.316 and
173.318** govern cryogens in transport.

<div class="box"><span class="lbl">Worth knowing</span>
"Cryogenic" is a category imposed on a continuum. The useful question is never "is
this a cryogen?" but "is this fluid cold enough to condense air, embrittle my
material, or boil when I look at it?" Three questions, three thresholds, none of
them 120 K.
</div>

## 2. Why gases become liquids at all

Two things compete inside any collection of molecules. The first is
**intermolecular attraction**: even molecules with no charge and no permanent
dipole — N₂, O₂, Ar, CH₄ — pull weakly on each other through fluctuating electron
distributions, negligibly at distance and significantly when nearly touching. The
second is **thermal energy**: temperature is the kinetic energy of molecular
motion, and molecules moving fast enough are never caught by that weak attraction.
They fly past each other, and the substance is a gas.

Liquefaction is taking the thermal energy away until the attraction wins. There is
nothing else to it, and it explains the whole column above. Helium is a spherical
atom with two electrons and essentially no attraction to offer, so it condenses
only below 4.2238 K; hydrogen, tiny and light, manages 20.3689 K; nitrogen, larger
and more polarisable, 77.3549 K; methane, larger still, 111.667 K. Water has real
hydrogen bonds and holds together to 373 K — which is why nobody calls a water
tank cryogenic.

## 3. The mental model shift: a cryogen sits *on* its vapour-pressure curve

This is the section that matters most in the module.

Put liquid nitrogen in a closed, insulated tank and leave it alone. It evaporates
until the vapour above is dense enough that molecules return as fast as they
leave. That balance is the **saturation** condition, and the pressure it produces
is the **vapour pressure** — a property of the fluid and its temperature, and of
nothing else.

The consequence is what people get wrong: **in that tank, pressure and temperature
are not independent.** Pick one and the other is decided for you. The tank state
is a point sliding along a curve — here it is for nitrogen, from
`reference/properties.md` §7.

<figure>
<svg viewBox="0 0 640 270" role="img" aria-label="Pressure versus temperature saturation curve for nitrogen, rising from the triple point at 63 kelvin and 0.13 bar through the normal boiling point at 77.4 kelvin and 1.01 bar to the critical point at 126.2 kelvin and 34 bar. The liquid region lies above and left of the curve, the vapour region below and right. Two tank states are marked on the curve itself: a vented tank at 77.4 kelvin and 1.01 bar, and a warmer pressurised tank at 90 kelvin and 3.6 bar.">
  <g font-family="system-ui, sans-serif" font-size="13">
    <!-- axes -->
    <line x1="70" y1="200" x2="600" y2="200" stroke="currentColor" stroke-width="1.2"/>
    <line x1="70" y1="200" x2="70" y2="30" stroke="currentColor" stroke-width="1.2"/>
    <!-- y ticks 0,10,20,30 bar -->
    <g stroke="var(--muted)" stroke-width="1">
      <line x1="66" y1="151.4" x2="70" y2="151.4"/>
      <line x1="66" y1="102.9" x2="70" y2="102.9"/>
      <line x1="66" y1="54.3" x2="70" y2="54.3"/>
    </g>
    <g fill="var(--muted)" text-anchor="end">
      <text x="62" y="204">0</text>
      <text x="62" y="156">10</text>
      <text x="62" y="107">20</text>
      <text x="62" y="58">30</text>
    </g>
    <!-- x ticks 80,100,120 K -->
    <g stroke="var(--muted)" stroke-width="1">
      <line x1="218.6" y1="200" x2="218.6" y2="204"/>
      <line x1="367.1" y1="200" x2="367.1" y2="204"/>
      <line x1="515.7" y1="200" x2="515.7" y2="204"/>
    </g>
    <g fill="var(--muted)" text-anchor="middle">
      <text x="218.6" y="219">80 K</text>
      <text x="367.1" y="219">100 K</text>
      <text x="515.7" y="219">120 K</text>
    </g>
    <text x="335" y="240" fill="currentColor" text-anchor="middle">temperature</text>
    <text x="24" y="115" fill="currentColor" text-anchor="middle" transform="rotate(-90 24 115)">pressure (bar)</text>
    <!-- saturation curve -->
    <polyline points="93.4,199.4 144.3,198.1 198.9,195.1 218.6,193.4 292.9,182.5 367.1,162.2 441.4,128.8 515.7,78.1 561.7,35.1"
      fill="none" stroke="var(--inert)" stroke-width="2.6"/>
    <!-- region labels -->
    <text x="150" y="90" fill="currentColor" font-weight="600">LIQUID</text>
    <text x="150" y="108" fill="var(--muted)" font-size="13">above the curve</text>
    <text x="400" y="188" fill="currentColor" font-weight="600">VAPOUR</text>
    <text x="400" y="206" fill="var(--muted)" font-size="13" opacity="0">.</text>
    <!-- critical point -->
    <circle cx="561.7" cy="35.1" r="5" fill="var(--warn)"/>
    <text x="553" y="30" fill="var(--warn)" text-anchor="end">critical point</text>
    <text x="553" y="46" fill="var(--muted)" text-anchor="end">126.192 K, 33.958 bar — no liquid above here</text>
    <!-- state 1 -->
    <circle cx="198.9" cy="195.1" r="5.5" fill="var(--ok)"/>
    <line x1="198.9" y1="195.1" x2="150" y2="150" stroke="var(--ok)" stroke-width="1"/>
    <text x="146" y="140" fill="var(--ok)" text-anchor="end" font-weight="600">vented tank</text>
    <text x="146" y="156" fill="var(--muted)" text-anchor="end">77.355 K, 1.013 bar</text>
    <!-- state 2 -->
    <circle cx="292.9" cy="182.5" r="5.5" fill="var(--ok)"/>
    <line x1="292.9" y1="182.5" x2="330" y2="140" stroke="var(--ok)" stroke-width="1"/>
    <text x="336" y="134" fill="var(--ok)" font-weight="600">same tank, warmed</text>
    <text x="336" y="150" fill="var(--muted)">90 K, 3.605 bar</text>
  </g>
</svg>
<figcaption>Figure 1.1 — Nitrogen's vapour-pressure curve, from <code>reference/properties.md</code> §7. A tank holding saturated liquid and vapour is a point <em>on this line</em>, never off it — note that a <em>P</em>–<em>T</em> plot turns the two-phase region into the line itself. At saturation there is one variable, not two.</figcaption>
</figure>

Read three things off it. **The curve is steep**: warm saturated nitrogen from
77.355 K to 90 K and saturation pressure goes from 1.013 bar to 3.605 bar; another
20 K and it is 14.659 bar (212.60 psia). **It ends**: above the critical point,
126.192 K and 33.958 bar for nitrogen, there is no liquid, no vapour and no
boiling, just one supercritical fluid — and helium's critical point is 5.1953 K
and 2.2832 bar, barely a degree above its boiling point, which is why helium
systems so often hold no liquid at all. And **where the tank sits on the curve is
a design choice**: a vented tank sits at the bottom, at the normal boiling point;
a pressurised run tank sits further up, and hotter, because you asked it to.

<div class="box remember"><span class="lbl">Remember this</span>
For a saturated cryogen, tank pressure <em>is</em> a temperature measurement and
tank temperature <em>is</em> a pressure measurement. If the PT and the TT disagree
with the saturation curve, either the fluid is not saturated — subcooled liquid,
superheated vapour, or a stratified tank — or one instrument is lying. Both are
worth understanding before you proceed.
</div>

## 4. Density, and the 694-versus-696 lesson

Cryogenic liquids are not especially dense: liquid nitrogen is 806.085 kg/m³,
lighter than water; liquid methane 422.355 kg/m³; liquid hydrogen only
70.8484 kg/m³, which is why hydrogen tanks are enormous. Liquid oxygen, at
1141.18 kg/m³, is one of the few that beats water. The gas is the other story, and
where the first data trap waits.

Air Products' *Safetygram-7* gives liquid nitrogen's expansion ratio as **1 : 694**
`[AP-SG-7]`; Air Products' *Safetygram-27* gives **1 : 696** `[AP-SG-27]`. Same
publisher, two numbers. Which is right?

Both are. Safetygram-7 quotes the ratio to gas at **68 °F (20 °C)**;
Safetygram-27 quotes it at **70 °F**. Two degrees Fahrenheit of reference
temperature, and the gas is slightly less dense at the higher one. Computed
independently from NIST data the values are 692.0 at 20 °C and 694.6 at 70 °F —
bracketing the published pair, and confirming the disagreement was never about
physics. This course uses **696 : 1, liquid at its boiling point to gas at 70 °F
and 1 atm**, and states that basis every time.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
An expansion ratio, a gas density or a "standard volume" without its reference
temperature and pressure is not a number, it is a rumour. Most published
disagreement in cryogenic safety literature is undeclared reference conditions,
not disagreement about physics. Ask "at what temperature?" every time — including
when the number is your own.
</div>

There is a sharper version of the trap. The 696 : 1 figure assumes the gas reaches
room temperature; in the first seconds of a spill it does not, and the immediate
ratio for nitrogen is only **174.8 : 1**. The big number says how much gas will
*eventually* exist — the right basis for asphyxiation inventory and relief sizing.
The small number is closer to how fast the cloud is growing now.

## 5. Latent heat versus sensible heat

**Sensible heat** changes a fluid's temperature — for saturated liquid nitrogen,
2.0415 kJ/kg·K, about 2 kJ per kilogram per degree. **Latent heat** changes its
phase at constant temperature, spending the energy on pulling molecules out of the
liquid's grip rather than speeding them up: for nitrogen at 1 atm, 199.18 kJ/kg.

The ratio is the point. **Boiling a kilogram of liquid nitrogen costs about the
same energy as warming a kilogram of it by 98 K** — more than the fluid's entire
liquid range. Latent heat is not one term in a cryogenic thermal budget, it is
essentially the whole budget. The others agree: 213.06 kJ/kg for oxygen,
510.83 kJ/kg for methane, and only 20.564 kJ/kg for helium — a tenth of
nitrogen's, which is why a given heat leak destroys helium inventory so fast. It
is also why chilldown is expensive: cooling warm hardware means boiling liquid
against it.

## 6. Heat leak in, vapour out

Put those pieces together and you have everything a cryogenic tank does while
nobody is watching.

<figure>
<svg viewBox="0 0 640 300" role="img" aria-label="Energy flow diagram. Heat leak from radiation, conduction through supports and piping, and convection enters an insulated tank. Almost all of the energy goes into latent heat and generates vapour; a small part goes into sensible heat and warms the fluid. The vapour then follows one of two paths: if the tank is vented, pressure holds steady and liquid inventory is lost; if the tank is closed, pressure climbs the saturation curve until the relief valve lifts, or the vessel fails.">
  <g font-family="system-ui, sans-serif" font-size="13">
    <!-- ambient -->
    <text x="16" y="28" fill="var(--warn)" font-weight="600">ambient ≈ 293 K</text>
    <g stroke="var(--warn)" stroke-width="2" fill="none">
      <path d="M16 46 H150" marker-end="url(#ar-w)"/>
      <path d="M16 76 H150" marker-end="url(#ar-w)"/>
      <path d="M16 106 H150" marker-end="url(#ar-w)"/>
    </g>
    <g fill="var(--muted)" font-size="13">
      <text x="18" y="42">radiation</text>
      <text x="18" y="72">conduction: supports, piping, instrument leads</text>
      <text x="18" y="102">convection / warm gas ingress</text>
    </g>
    <!-- tank -->
    <rect x="150" y="30" width="150" height="150" rx="12" fill="var(--side)" stroke="currentColor" stroke-width="1.6"/>
    <rect x="156" y="36" width="138" height="138" rx="8" fill="none" stroke="var(--inert)" stroke-width="1"/>
    <path d="M158 110 H292 V168 a6 6 0 0 1 -6 6 H164 a6 6 0 0 1 -6 -6 Z" fill="var(--inert)" opacity="0.30"/>
    <text x="225" y="60" text-anchor="middle" fill="currentColor" font-weight="600">insulated tank</text>
    <text x="225" y="80" text-anchor="middle" fill="var(--muted)">vapour</text>
    <text x="225" y="150" text-anchor="middle" fill="currentColor">saturated liquid</text>
    <text x="225" y="196" text-anchor="middle" fill="var(--muted)">on the curve of Fig. 1.1</text>
    <!-- split -->
    <path d="M300 90 H360" stroke="currentColor" stroke-width="2.5" fill="none" marker-end="url(#ar-c)"/>
    <text x="368" y="72" fill="currentColor" font-weight="600">latent heat — almost all of it</text>
    <text x="368" y="90" fill="var(--muted)">liquid → vapour, 199.18 kJ/kg for N₂</text>
    <path d="M300 140 H360" stroke="var(--muted)" stroke-width="1.4" fill="none" marker-end="url(#ar-m)"/>
    <text x="368" y="134" fill="var(--muted)">sensible heat — a small share</text>
    <text x="368" y="152" fill="var(--muted)">fluid warms, 2.0415 kJ/kg·K</text>
    <!-- outcomes -->
    <line x1="150" y1="220" x2="600" y2="220" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="150" y="242" fill="var(--ok)" font-weight="600">Tank vented:</text>
    <text x="252" y="242" fill="currentColor">pressure holds — you pay in lost inventory (boiloff)</text>
    <text x="150" y="268" fill="var(--warn)" font-weight="600">Tank closed:</text>
    <text x="252" y="268" fill="currentColor">pressure climbs the curve — relief lifts, or the vessel does</text>
    <defs>
      <marker id="ar-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>
      <marker id="ar-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--muted)"/></marker>
      <marker id="ar-w" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--warn)"/></marker>
    </defs>
  </g>
</svg>
<figcaption>Figure 1.2 — Where a heat leak's energy goes. There is no third option at the bottom: vapour generation is continuous, so the tank either vents it or contains it, and containing it means the pressure rises.</figcaption>
</figure>

Work it in your head. A modest 100 W heat leak puts 360 kJ into a nitrogen tank
every hour; divide by 199.18 kJ/kg and that is 1.8 kg of liquid boiled per hour,
whether or not anyone is on site. **Boiloff is not a fault, it is the arithmetic
consequence of heat leak**, and a tank with zero boiloff is a tank whose vent is
blocked.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
A dewar is moved indoors and its vent path is obstructed — a valve left shut, a
frozen relief, a bag over the neck to "keep dirt out". The heat leak does not
stop, and the vapour has nowhere to go, so pressure climbs the saturation curve of
Figure 1.1, dragging the liquid temperature with it. The outcome is a relief
device doing its job loudly, or a rupture. Verifying that a vent path is truly
open is trained work under a written procedure; what this module gives you is the
recognition that a sealed cryogenic vessel is an energy store being charged from
the room.
</div>

## 7. The sealed volume

Now remove the vent *and* the vapour space. Trap liquid in a rigid volume — pipe
isolated between two closed valves, a dead leg, an instrument tap, a strainer
body — and let it warm.

<figure>
<svg viewBox="0 0 640 250" role="img" aria-label="Two panels. On the left, a pipe section isolated between two closed valves is nearly full of cold liquid with a small vapour bubble. On the right, the same section after warming: the liquid has boiled but the volume cannot change, so instead of expanding the fluid presses outward on the walls and the pressure rises steeply, tracking the saturation curve.">
  <g font-family="system-ui, sans-serif" font-size="13">
    <!-- left panel -->
    <text x="20" y="26" fill="currentColor" font-weight="600">Cold: liquid trapped between two closed valves</text>
    <line x1="60" y1="70" x2="270" y2="70" stroke="currentColor" stroke-width="1.6"/>
    <line x1="60" y1="110" x2="270" y2="110" stroke="currentColor" stroke-width="1.6"/>
    <rect x="86" y="72" width="158" height="37" fill="var(--inert)" opacity="0.35"/>
    <text x="165" y="96" text-anchor="middle" fill="currentColor">liquid</text>
    <!-- closed valves: filled bow-ties -->
    <g fill="currentColor" stroke="currentColor" stroke-width="1.4">
      <path d="M62 74 L84 106 L84 74 L62 106 Z"/>
      <path d="M246 74 L268 106 L268 74 L246 106 Z"/>
    </g>
    <g stroke="currentColor" stroke-width="1.4">
      <line x1="73" y1="74" x2="73" y2="58"/><line x1="66" y1="58" x2="80" y2="58"/>
      <line x1="257" y1="74" x2="257" y2="58"/><line x1="250" y1="58" x2="264" y2="58"/>
    </g>
    <text x="73" y="132" text-anchor="middle" fill="var(--muted)">closed</text>
    <text x="257" y="132" text-anchor="middle" fill="var(--muted)">closed</text>
    <text x="60" y="164" fill="var(--muted)">Volume is fixed by the steel.</text>
    <text x="60" y="182" fill="var(--muted)">The fluid does not know that yet.</text>
    <!-- right panel -->
    <text x="340" y="26" fill="var(--warn)" font-weight="600">Warming: the expansion has nowhere to go</text>
    <line x1="380" y1="70" x2="590" y2="70" stroke="currentColor" stroke-width="1.6"/>
    <line x1="380" y1="110" x2="590" y2="110" stroke="currentColor" stroke-width="1.6"/>
    <rect x="406" y="72" width="158" height="37" fill="var(--warn)" opacity="0.22"/>
    <g fill="currentColor" stroke="currentColor" stroke-width="1.4">
      <path d="M382 74 L404 106 L404 74 L382 106 Z"/>
      <path d="M566 74 L588 106 L588 74 L566 106 Z"/>
    </g>
    <g stroke="var(--warn)" stroke-width="2" fill="none">
      <path d="M440 72 V52" marker-end="url(#ar-w2)"/><path d="M485 72 V52" marker-end="url(#ar-w2)"/>
      <path d="M530 72 V52" marker-end="url(#ar-w2)"/>
      <path d="M440 109 V129" marker-end="url(#ar-w2)"/><path d="M485 109 V129" marker-end="url(#ar-w2)"/>
      <path d="M530 109 V129" marker-end="url(#ar-w2)"/>
    </g>
    <text x="485" y="96" text-anchor="middle" fill="var(--warn)" font-weight="600">P ↑↑</text>
    <text x="380" y="164" fill="currentColor">1 volume of liquid N₂ wants 696 volumes of gas</text>
    <text x="380" y="182" fill="var(--muted)">(at 70 °F, 1 atm). It cannot have them.</text>
    <text x="380" y="200" fill="var(--warn)">So it takes pressure instead.</text>
    <text x="20" y="228" fill="var(--muted)">Every isolatable section that can hold cryogenic liquid needs its own relief path. There are no exceptions worth arguing about.</text>
    <defs>
      <marker id="ar-w2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--warn)"/></marker>
    </defs>
  </g>
</svg>
<figcaption>Figure 1.3 — The trapped-volume hazard: the same physics as Figure 1.1 with the vent removed. The final pressure depends on how full the section was and how far it warms — not a number worth memorising, because it is always far above the rating of ordinary pipework.</figcaption>
</figure>

Follow it on the saturation curve. The trapped liquid warms and the pressure rises
to match — at 110 K a nitrogen-filled section is already at 14.659 bar, and the
curve steepens as it climbs. Past 126.192 K there is no liquid left to boil and
you are compressing a dense supercritical fluid in a fixed volume. Nothing in that
chain requires a fire, a leak or a mistake, only ambient temperature and time.

Hence the absolute wording of laboratory rules: SLAC requires overpressure
protection for "each and every isolatable volume" `[SLAC-CH36]`, and Jefferson
Lab's overpressure supplement says the same, including relieving the insulating
vacuum space `[JLAB-OVERPRESSURE]`.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
Two valves are closed to isolate a section "for a minute" while a transfer is
paused. The section holds a few litres of LOX, and ambient does the rest. The
failure — a fitting letting go at pressure, in a LOX-soaked environment, with
people nearby — is mechanical and combustive at once. On a schematic, train
yourself to trace every closed-valve pair and ask what is between them.
</div>

## 8. Two-phase flow, and why the pump is the fussiest thing on the pad

A saturated cryogen needs little provocation to become a liquid–vapour mixture,
and that mixture behaves like neither. At 1 atm, liquid nitrogen is 806.085 kg/m³
and its saturated vapour 4.6121 kg/m³ — a factor of 174.8 — so fluid that flashes
needs 175 times the passage area to carry the same mass. A line sized for liquid
then gets violent acceleration, chugging flow and swinging pressure.

Three things break at once. **Flow meters lie**: turbine, differential-pressure
and Coriolis measurements all infer mass flow from an assumed density, so a slug
mixture makes the reading wrong in an unpredictable direction, not merely noisy.
**Flow control loses authority**: a valve sized for liquid passes far less mass
when passing vapour, shifting the loop gain under the controller. **Pumps stop
pumping**: vapour is compressible, so an impeller ingesting it does no useful
work, head collapses, and bearings and seals lose the liquid that cooled them.

The last one deserves the concept behind the acronym. **NPSH** is the margin by
which inlet pressure exceeds the fluid's vapour pressure at the inlet temperature,
and **a saturated cryogen reaches the pump inlet already at its boiling point** —
on the curve of Figure 1.1, with the margin starting near zero. The inlet is also
the worst place in the system, because flow accelerating into the impeller eye
drops the local static pressure. Below the vapour pressure, the liquid boils right
there. That is **cavitation**: bubbles forming in the low-pressure region and
collapsing violently millimetres later, destroying performance and eroding metal.

Two standard answers, both now obvious. **Raise the inlet pressure** — pressurise
the tank above saturation, or fit a boost pump. **Or lower the vapour pressure
relative to the fluid's state** — subcool the liquid so it sits below the
saturation line instead of on it `[SUTTON-BIBLARZ]`, `[BARRON-NELLIS]`.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Tank pressurisation, boost pumps and subcooling are not three unrelated
subsystems. They are three ways of buying the same thing: distance between the
fluid's state and its saturation line. A design review that cannot say how much
margin it bought — and at what condition — has not reviewed the feed system.
</div>

## 9. A cryogenic tank is not a water tank

A water tank stores an inert, stable liquid at whatever pressure you apply. Left
alone, nothing happens. A cryogenic tank is doing all of this continuously, from
the moment it is filled:

- **Boiling**, because heat leaks in through insulation, supports, piping and
  instrument leads, and that energy goes almost entirely into latent heat.
- **Self-pressurising**, because the vapour raises the pressure, which raises the
  saturation temperature, which warms the liquid — a ratchet, not a steady state.
- **Venting**, or the ratchet ends at a relief device or a rupture.
- **Losing inventory**, whether or not anyone is using the fluid.
- **Stratifying**, so one temperature reading rarely represents the bulk.
- **Condensing the atmosphere** on cold external surfaces — and below 90.1875 K
  that means liquefying oxygen out of the air, which is why an innocuous-looking
  LN₂ line is not necessarily innocuous.

None of that is a malfunction; it is what the fluid does. Design, procedure and
review exist to keep the consequences bounded.

---

## Checkpoint quiz

**1.** A closed, insulated tank of saturated liquid nitrogen reads 3.6 bar. Which
statement is best supported?

  a) The liquid is at 77.4 K, because that is nitrogen's boiling point.
  b) The liquid is near 90 K, and warming it further will raise the pressure again.
  c) Pressure and liquid temperature are independent here; you cannot say.
  d) The tank must hold a non-condensable gas, because saturated nitrogen cannot exceed 1 atm.

**2.** *Short answer.* A colleague writes: "LN₂ expands 696 : 1, so a 50-litre
spill fills the room with 34.8 m³ of gas." What is missing from the statement, and
how is it misleading about the first thirty seconds of the spill?

**3.** *Identify the hazard.* During a hold, a two-metre vacuum-jacketed LOX line
is isolated by closing the valves at each end while full of liquid. The hold lasts
an hour. What is the hazard, what drives it, and what feature on the drawing would
tell you whether it is controlled?

**4.** *Conceptual calculation.* A nitrogen dewar has a steady 100 W heat leak.
Roughly how many kilograms of liquid boil in an hour, and roughly what volume of
gas does that make at 70 °F and 1 atm? Show the two divisions.

**5.** *What would concern you here?* A pump takes suction from a vented LN₂ tank
through six metres of uninsulated stainless line. The downstream flow meter reads
erratically and the discharge pressure oscillates. Name the most likely mechanism
and two independent changes that would address it.

<details>
<summary>Show answers</summary>

**1 — (b).** With liquid and vapour in equilibrium the state must lie on the
saturation curve of Figure 1.1, and nitrogen's 3.6046 bar corresponds to 90 K.
(a) is wrong because 77.355 K is the boiling point *at 1 atm only* — a boiling
point is a property of the fluid at a stated pressure, not of the fluid alone.
(c) is the misconception this module exists to remove: at saturation there is one
independent variable, not two. (d) is wrong both ways — saturated nitrogen reaches
33.958 bar at its critical point, and although a non-condensable in the ullage
*would* raise total pressure above the vapour pressure, nothing here requires that
explanation.

**2 —** Missing: the reference condition. 696 : 1 means liquid at its normal
boiling point expanding to gas **at 70 °F and 1 atm**; Safetygram-7 quotes 694 at
68 °F, and both are correct. Without the basis the number cannot be checked. The
arithmetic is right for that basis (0.05 m³ × 696 = 34.8 m³), but for the first
half-minute it is **pessimistic about volume and optimistic about behaviour**:
straight off the liquid, nitrogen gives only 174.8 : 1, and that cold vapour is
4.6121 kg/m³ — nearly four times the density of room air — so it does not rise and
disperse. It pools and runs downhill into pits and trenches.

**3 —** **Trapped-volume overpressure** (Figure 1.3), driven by ordinary ambient
heat leak: the section warms, the LOX boils, the expansion has nowhere to go in a
rigid volume, and pressure climbs the saturation curve — with no plateau once the
fluid passes oxygen's critical point at 154.581 K. The vacuum jacket slows this;
it does not stop it, and an hour is ample. A component failing at pressure while
saturated with liquid oxygen is an ignition hazard as well as a mechanical one.
On the drawing, look for **a relief path belonging to that isolatable section
itself** — a thermal relief or burst disc between the two block valves,
discharging somewhere the drawing shows. A relief on the tank protects nothing
isolated from the tank `[SLAC-CH36]`, `[JLAB-OVERPRESSURE]`.

**4 —** Energy in an hour: 100 W × 3600 s = 360 kJ. Divide by the latent heat,
360 ÷ 199.18 kJ/kg ≈ **1.8 kg/h** — latent heat alone is the right first cut,
since sensible heating is a small correction and a vented tank stays near its
boiling point. Divide by the warm gas density, 1.8 ÷ 1.16042 kg/m³ ≈ **1.6 m³/h at
70 °F and 1 atm**. As liquid that is barely 2.2 litres; as gas it is a cubic metre
and a half every hour, which is why the vent matters and why an unventilated room
with a leaking dewar becomes an oxygen-deficiency problem before it becomes
anything else.

**5 —** **Two-phase flow reaching the pump, and cavitation at the impeller
inlet.** The tank is vented, so liquid leaves it saturated — on the curve, with
essentially no NPSH margin — then crosses six metres of uninsulated line that adds
heat and pressure loss. Vapour forms; the pump ingests a mixture it cannot work
on; head collapses and recovers, which is the discharge oscillation, and the
meter's density assumption breaks, which is the erratic reading. The instrument is
reporting an upstream problem faithfully.

Two independent changes, one per side of the margin: **raise the inlet pressure**
(pressurise the tank above saturation, or add a boost pump) or **lower the vapour
pressure relative to the fluid's state** by subcooling. Insulating the suction line
is a supporting measure, not a fix — it cuts vapour generation, but a fluid with
zero margin still flashes at the impeller eye. Credit also for a shorter suction
run or a flooded inlet.

</details>
