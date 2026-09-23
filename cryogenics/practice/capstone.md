# Capstone — A Preliminary Safety and Design Review

*Practice section. Allow 90–120 minutes. Prerequisite: Modules 01–08, the
practical engineering section and the safety-committee questions.*

Everything in this course has been building to one skill: being handed a drawing
and a folder of claims about a system that does not exist yet, and saying — before
anyone buys anything, welds anything or fills anything — what is wrong with it.

This is the exercise. A fictional student group has submitted a proposal. You are
the reviewer. Nobody has been hurt, nothing has been built, and the only cost of
your being thorough is an afternoon.

**Do not open [`capstone-key.md`](capstone-key.md) until you have finished.** The
whole value of this exercise is the gap between what you found and what was there.

---

## 1. The situation

**Perihelion Rocketry** is a student group at Northfield University with about
twenty-four active members. For three years they have flown solid-motor sounding
rockets. Last spring they decided to build a liquid engine.

**Project IGNIS-1** is a 1.5 kN (≈340 lbf) ablative-chamber LOX/liquid-methane
engine, pressure-fed, intended for 8–12 second hot fires on a fixed thrust stand.
The long-term goal is a 5 kN flight engine; IGNIS-1 is the learning article.

**The site** is the north annex of Building 4, a former materials-testing bay on
the engineering quad. It is 14 m × 9 m × 5 m, concrete-floored, with a steel
roll-up door onto the service road and loading dock. A 0.9 m deep utility trench
crosses the floor beneath where the stand is being erected; it was cut for
hydraulic lines when the bay was a materials lab, and at its east end it opens
into a cable chase that runs into the Building 4 basement. The Building 4 machine
shop is 30 m away across the service road. A graduate office block is 45 m to the
south. The apron immediately outside the roll-up door is asphalt, resurfaced two
years ago, and graded very slightly back toward the bay and the trench.

**The people.** The team lead is a third-year mechanical engineering student who
has designed the stand and drawn the P&ID. The group's safety officer is a
second-year student. The faculty advisor is a combustion researcher who has run
atmospheric-pressure burner experiments for two decades and has never operated
cryogenic hardware. A machine-shop technician who is friendly with the group has
TIG-welded the tank penetrations for them as a favour.

**What they have already done.** Built the stand structure and the feed plumbing.
Run cold-flow water tests on the injector. Run two liquid-nitrogen chilldown flows
through the LOX-side plumbing. Bench-tested the igniter. Drawn Figure C.1. Priced
LOX and liquefied methane from a local industrial gas supplier, who will deliver a
180 L LOX portable dewar and a 160 L liquefied-natural-gas dewar. Emailed the
university EHS office once, in January.

They would like to hot-fire in six weeks.

---

## 2. What they submitted

### 2.1 The drawing

<figure>
<svg viewBox="0 0 700 1080" role="img" aria-label="Piping and instrumentation diagram submitted by a student group for a small liquid-oxygen and liquid-methane rocket engine test stand inside a former materials-testing bay. A single common vent header runs across the top of the drawing and turns up into one vent stack at the left, terminating 2.4 metres above grade on the north wall beside the roll-up door and an air-handling intake. All relief and vent risers from both propellant tanks tie into that one header. On the left, the liquid-oxygen run tank V-101 carries a relief valve PSV-101 set at 175 psig with a manual block valve HV-102 beneath it, and a vent valve PV-103 annotated fail closed. On the right, the liquid-methane run tank V-201 carries a relief valve PSV-201 set at 175 psig and a vent valve FV-203 annotated fail open. A single gaseous-nitrogen pack P-301 at 6000 psig feeds a regulator PCV-301 and one 250 psig manifold that supplies both tank ullages through check valves CV-301 and CV-302 and both purge circuits through check valves CV-303 and CV-304. The oxidiser fill line enters at the left through a cam-lock quick disconnect QD-1 and a quarter-turn ball valve HV-105, is drawn without vacuum jacketing, and carries a polycarbonate sight tube LG-101 on the tank. Its drain HV-108 discharges to an asphalt apron graded toward a trench. The methane fill line HV-204 is vacuum jacketed and its drain HV-208 goes to the same apron. Each feed leg carries a filter, a flow transmitter, a manual ball valve, a purge tie-in and a main propellant valve: the oxidiser main valve MOV-110 is annotated fail open and has no thermal relief on the segment above it, while the fuel main valve MFV-210 is annotated fail closed and its segment carries relief valve PSV-209 at 200 psig discharging into the common vent header. The engine sits above a trench that drains to a cable chase into the building basement. Gas detection consists of a methane head at the bay roof, a second methane head inside a nitrogen-purged instrument box, and one oxygen monitor at the operator station, which is a plywood and sandbag barrier eight metres from the stand inside the same bay. Control cable is routed through the trench. A title block records revision A, drawn by one student, checked by nobody.">
  <text x="14" y="16" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">PROJECT IGNIS-1 — proposed test stand · 1.5 kN LOX/LCH₄ · Perihelion Rocketry, Northfield University</text>
  <rect x="14" y="26" width="672" height="870" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="9 6"/>
  <text x="22" y="44" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">TEST BAY — Bldg 4 north annex, 14 × 9 × 5 m, roll-up door to loading dock</text>

  <!-- ================= VENT STACK AND COMMON HEADER ================= -->
  <line x1="48" y1="136" x2="48" y2="72" stroke="currentColor" stroke-width="2.8"/>
  <path d="M48,72 L48,60 L62,52" stroke="currentColor" stroke-width="2.8" fill="none"/>
  <path d="M62,52 l-8,-1 l4,7 z" fill="currentColor"/>
  <text x="70" y="50" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">V-1 VENT STACK — 2.4 m, 1 in tube</text>
  <text x="70" y="66" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">north wall, above roll-up door</text>
  <text x="70" y="82" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">beside bay air-handling intake</text>
  <line x1="48" y1="136" x2="672" y2="136" stroke="currentColor" stroke-width="2.8"/>
  <text x="250" y="128" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">COMMON VENT HEADER — LOX · LCH₄ · GN₂</text>

  <!-- ================= GN2 PACK, REGULATOR, MANIFOLD ================= -->
  <rect x="300" y="158" width="140" height="44" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="370" y="178" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">GN₂ PACK  P-301</text>
  <text x="370" y="195" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">6 × 6000 psig</text>
  <circle cx="470" cy="180" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="470" y="177" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="470" y="191" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">301</text>
  <line x1="453" y1="180" x2="440" y2="180" stroke="currentColor" stroke-width="1"/>
  <line x1="370" y1="202" x2="370" y2="250" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M360,221 L380,221 L360,243 L380,243 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M361,213 A9 9 0 0 1 379,213 Z" fill="var(--inert)" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="370" y1="221" x2="370" y2="213" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="352" y="222" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PCV-301</text>
  <text x="352" y="238" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">250 psig</text>
  <line x1="250" y1="250" x2="450" y2="250" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="256" y="244" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ manifold</text>

  <!-- ================= OXIDISER TANK TOP ================= -->
  <line x1="90" y1="136" x2="90" y2="310" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="130" y1="136" x2="130" y2="310" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="90" y1="310" x2="215" y2="310" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="215" y1="310" x2="215" y2="330" stroke="var(--oxy)" stroke-width="2.4"/>
  <text x="170" y="302" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">GOX vent</text>
  <!-- PSV-101 -->
  <path d="M81,209 L99,209 L90,196 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M81,183 L99,183 L90,196 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <polyline points="99,190 106,186 98,182 106,178" fill="none" stroke="var(--oxy)" stroke-width="1.4"/>
  <text x="76" y="192" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PSV-101</text>
  <text x="76" y="208" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">175 psig</text>
  <!-- HV-102 -->
  <path d="M80,251 L100,251 L80,273 L100,273 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="90" y1="251" x2="90" y2="238" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="82" y1="238" x2="98" y2="238" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="76" y="258" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-102</text>
  <text x="76" y="274" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">tagged OPEN</text>
  <!-- PV-103 -->
  <path d="M120,221 L140,221 L120,243 L140,243 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <circle cx="130" cy="211" r="7" fill="var(--bg)" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="130" y1="221" x2="130" y2="218" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="146" y="222" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PV-103 vent</text>
  <text x="146" y="238" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FAIL CLOSED</text>
  <!-- pressurant into LOX ullage -->
  <line x1="250" y1="250" x2="250" y2="330" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M242,282 L258,282 L250,298 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="241" y1="298" x2="259" y2="298" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="264" y="286" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-301</text>
  <text x="264" y="302" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ press.</text>

  <!-- ================= FUEL TANK TOP ================= -->
  <line x1="570" y1="136" x2="570" y2="310" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="620" y1="136" x2="620" y2="310" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="485" y1="310" x2="620" y2="310" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="485" y1="310" x2="485" y2="330" stroke="var(--fuel)" stroke-width="2.4"/>
  <text x="528" y="302" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">CH₄ vent</text>
  <!-- FV-203 -->
  <path d="M560,221 L580,221 L560,243 L580,243 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <circle cx="570" cy="211" r="7" fill="var(--bg)" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="570" y1="221" x2="570" y2="218" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="554" y="222" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FV-203 vent</text>
  <text x="554" y="238" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FAIL OPEN</text>
  <!-- PSV-201 -->
  <path d="M611,209 L629,209 L620,196 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <path d="M611,183 L629,183 L620,196 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <polyline points="629,190 636,186 628,182 636,178" fill="none" stroke="var(--fuel)" stroke-width="1.4"/>
  <text x="644" y="272" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 644 272)">PSV-201  175 psig</text>
  <!-- pressurant into fuel ullage -->
  <line x1="450" y1="250" x2="450" y2="330" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M442,282 L458,282 L450,298 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="441" y1="298" x2="459" y2="298" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="464" y="286" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-302</text>
  <text x="464" y="302" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ press.</text>

  <!-- ================= RUN TANKS ================= -->
  <rect x="150" y="330" width="130" height="148" rx="26" fill="var(--side)" stroke="var(--oxy)" stroke-width="2.6"/>
  <text x="215" y="368" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">LOX RUN TANK</text>
  <text x="215" y="386" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">V-101 · 60 L</text>
  <text x="215" y="404" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">LOX  90.2 K</text>
  <circle cx="215" cy="442" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="215" y="439" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">TT</text>
  <text x="215" y="453" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">101</text>
  <circle cx="312" cy="352" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="312" y="349" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="312" y="363" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">101</text>
  <line x1="295" y1="352" x2="280" y2="352" stroke="currentColor" stroke-width="1"/>
  <!-- sight tube -->
  <polyline points="150,352 112,352 112,420 150,420" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <text x="104" y="380" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LG-101</text>
  <text x="104" y="398" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">sight tube</text>

  <rect x="420" y="330" width="130" height="148" rx="26" fill="var(--side)" stroke="var(--fuel)" stroke-width="2.6"/>
  <text x="485" y="368" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">LCH₄ RUN TANK</text>
  <text x="485" y="386" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">V-201 · 40 L</text>
  <text x="485" y="404" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄  111.7 K</text>
  <circle cx="455" cy="442" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="455" y="439" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LT</text>
  <text x="455" y="453" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">201</text>
  <circle cx="515" cy="442" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="515" y="439" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">TT</text>
  <text x="515" y="453" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">201</text>
  <circle cx="588" cy="352" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="588" y="349" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="588" y="363" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">202</text>
  <line x1="571" y1="352" x2="550" y2="352" stroke="currentColor" stroke-width="1"/>

  <!-- ================= FILL AND DRAIN — OXIDISER ================= -->
  <line x1="16" y1="456" x2="150" y2="456" stroke="var(--oxy)" stroke-width="2.8"/>
  <path d="M36,446 L28,446 L28,466 L36,466" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M46,446 L54,446 L54,466 L46,466" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M89,446 L89,466 L111,446 L111,466 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="100" y1="446" x2="100" y2="434" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="92" y1="434" x2="108" y2="434" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="16" y="420" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LOX FILL →</text>
  <text x="40" y="486" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">QD-1</text>
  <text x="104" y="420" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-105</text>
  <polyline points="125,456 125,520 30,520" fill="none" stroke="var(--oxy)" stroke-width="2.6"/>
  <path d="M30,520 l9,-4 l0,8 z" fill="var(--oxy)"/>
  <path d="M68,510 L88,510 L68,530 L88,530 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="78" y1="510" x2="78" y2="498" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="70" y1="498" x2="86" y2="498" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="78" y="494" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-108</text>
  <text x="16" y="546" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">→ asphalt apron,</text>
  <text x="16" y="564" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">graded to trench</text>

  <!-- ================= FILL AND DRAIN — FUEL ================= -->
  <line x1="684" y1="456" x2="550" y2="456" stroke="var(--fuel)" stroke-width="2.8"/>
  <line x1="560" y1="450" x2="650" y2="450" stroke="var(--muted)" stroke-width="1"/>
  <line x1="560" y1="462" x2="650" y2="462" stroke="var(--muted)" stroke-width="1"/>
  <path d="M609,446 L609,466 L631,446 L631,466 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <line x1="620" y1="446" x2="620" y2="434" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="612" y1="434" x2="628" y2="434" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="600" y="426" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">← LCH₄ FILL</text>
  <text x="620" y="486" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-204</text>
  <polyline points="560,456 560,510" fill="none" stroke="var(--fuel)" stroke-width="2.6"/>
  <path d="M560,510 l-4,-9 l8,0 z" fill="var(--fuel)" transform="rotate(180 560 514)"/>
  <path d="M550,478 L570,478 L550,498 L570,498 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <text x="542" y="484" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-208</text>
  <text x="542" y="502" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">→ same apron</text>

  <!-- ================= OXIDISER FEED LEG ================= -->
  <line x1="215" y1="478" x2="215" y2="760" stroke="var(--oxy)" stroke-width="2.8"/>
  <line x1="215" y1="760" x2="300" y2="760" stroke="var(--oxy)" stroke-width="2.8"/>
  <text x="228" y="500" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">LOX feed</text>
  <rect x="203" y="518" width="24" height="26" fill="var(--bg)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="203" y1="544" x2="227" y2="518" stroke="var(--oxy)" stroke-width="1.4"/>
  <text x="234" y="538" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">F-106 filter</text>
  <circle cx="268" cy="572" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="268" y="569" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FT</text>
  <text x="268" y="583" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">107</text>
  <line x1="251" y1="572" x2="221" y2="572" stroke="currentColor" stroke-width="1"/>
  <path d="M205,601 L225,601 L205,623 L225,623 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="215" y1="601" x2="215" y2="589" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="207" y1="589" x2="223" y2="589" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="234" y="608" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-107</text>
  <text x="234" y="624" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">manual ball</text>
  <path d="M205,694 L225,694 L205,716 L225,716 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M206,684 A9 9 0 0 1 224,684 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="215" y1="694" x2="215" y2="684" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="234" y="700" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">MOV-110</text>
  <text x="234" y="716" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FAIL OPEN</text>

  <!-- ================= FUEL FEED LEG ================= -->
  <line x1="485" y1="478" x2="485" y2="760" stroke="var(--fuel)" stroke-width="2.8"/>
  <line x1="479" y1="520" x2="479" y2="760" stroke="var(--muted)" stroke-width="1"/>
  <line x1="491" y1="520" x2="491" y2="760" stroke="var(--muted)" stroke-width="1"/>
  <line x1="485" y1="760" x2="400" y2="760" stroke="var(--fuel)" stroke-width="2.8"/>
  <text x="498" y="500" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄ feed (VJ)</text>
  <rect x="473" y="518" width="24" height="26" fill="var(--bg)" stroke="var(--fuel)" stroke-width="2"/>
  <line x1="473" y1="544" x2="497" y2="518" stroke="var(--fuel)" stroke-width="1.4"/>
  <text x="506" y="538" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">F-206 filter</text>
  <circle cx="432" cy="572" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="432" y="569" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FT</text>
  <text x="432" y="583" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">207</text>
  <line x1="449" y1="572" x2="479" y2="572" stroke="currentColor" stroke-width="1"/>
  <path d="M475,601 L495,601 L475,623 L495,623 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <line x1="485" y1="601" x2="485" y2="589" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="477" y1="589" x2="493" y2="589" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="506" y="612" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-207</text>
  <!-- PSV-209 branch to the common header -->
  <line x1="485" y1="678" x2="672" y2="678" stroke="var(--fuel)" stroke-width="2.4"/>
  <path d="M532,669 L532,687 L545,678 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <path d="M558,669 L558,687 L545,678 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <polyline points="545,669 549,662 541,658 549,654" fill="none" stroke="var(--fuel)" stroke-width="1.4"/>
  <text x="560" y="662" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PSV-209  200 psig</text>
  <line x1="672" y1="678" x2="672" y2="462" stroke="var(--fuel)" stroke-width="2.4"/>
  <path d="M672,462 A7 7 0 0 1 672,450" fill="none" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="672" y1="450" x2="672" y2="136" stroke="var(--fuel)" stroke-width="2.4"/>
  <path d="M475,694 L495,694 L475,716 L495,716 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <path d="M476,684 A9 9 0 0 1 494,684 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="485" y1="694" x2="485" y2="684" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="506" y="700" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">MFV-210</text>
  <text x="506" y="716" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FAIL CLOSED</text>

  <!-- ================= PURGE BRANCHES ================= -->
  <polyline points="345,250 345,650 215,650" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M288,642 L288,658 L272,650 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="272" y1="641" x2="272" y2="659" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="296" y="634" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-303</text>
  <text x="296" y="672" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ purge</text>
  <polyline points="400,250 400,650 485,650" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M432,642 L432,658 L448,650 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="448" y1="641" x2="448" y2="659" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="432" y="634" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-304</text>
  <text x="424" y="672" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ purge</text>

  <!-- ================= ENGINE ================= -->
  <circle cx="350" cy="692" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="350" y="689" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="350" y="703" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">111</text>
  <line x1="350" y1="709" x2="350" y2="736" stroke="currentColor" stroke-width="1"/>
  <rect x="300" y="736" width="100" height="54" rx="4" fill="var(--side)" stroke="currentColor" stroke-width="2.4"/>
  <path d="M300,790 L400,790 L418,850 L282,850 Z" fill="var(--side)" stroke="currentColor" stroke-width="2.4"/>
  <text x="350" y="758" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">E-1 ENGINE</text>
  <text x="350" y="776" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">1.5 kN</text>
  <text x="350" y="822" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">IG-1 igniter</text>

  <!-- ================= TRENCH ================= -->
  <rect x="250" y="856" width="220" height="28" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="250" y1="884" x2="278" y2="856" stroke="var(--warn)" stroke-width="1"/>
  <line x1="294" y1="884" x2="322" y2="856" stroke="var(--warn)" stroke-width="1"/>
  <line x1="338" y1="884" x2="366" y2="856" stroke="var(--warn)" stroke-width="1"/>
  <line x1="382" y1="884" x2="410" y2="856" stroke="var(--warn)" stroke-width="1"/>
  <line x1="426" y1="884" x2="454" y2="856" stroke="var(--warn)" stroke-width="1"/>
  <text x="180" y="874" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">TRENCH 0.9 m</text>
  <text x="478" y="864" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">→ cable chase to</text>
  <text x="478" y="882" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">Bldg 4 basement</text>

  <!-- ================= INSTRUMENT ENCLOSURE ================= -->
  <rect x="30" y="592" width="175" height="72" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <circle cx="58" cy="628" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="58" y="625" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="58" y="639" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">402</text>
  <text x="84" y="614" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">INSTR. BOX</text>
  <text x="84" y="634" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GN₂ purged</text>
  <text x="84" y="654" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">CH₄ cat. bead</text>

  <!-- ================= GAS DETECTION — ROOF ================= -->
  <circle cx="562" cy="78" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="562" y="75" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="562" y="89" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">401</text>
  <text x="540" y="64" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CH₄ — bay roof</text>
  <text x="540" y="82" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">4.2 m, catalytic bead</text>

  <!-- ================= OPERATOR STATION ================= -->
  <rect x="476" y="764" width="205" height="96" rx="6" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <text x="578" y="786" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">OPERATOR STATION</text>
  <text x="578" y="804" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">8 m · plywood + sandbags</text>
  <circle cx="511" cy="834" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="511" y="831" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="511" y="845" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">403</text>
  <text x="536" y="830" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">O₂ — station</text>
  <text x="536" y="848" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">ceiling, 3.0 m</text>

  <!-- ================= SIGNAL LINES ================= -->
  <polyline points="203,708 60,708 60,878 482,878 482,860" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <polyline points="497,708 545,708 545,764" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="66" y="866" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">control cable → trench</text>

  <!-- ================= LEGEND ================= -->
  <rect x="20" y="916" width="420" height="146" rx="5" fill="var(--side)" stroke="var(--line)" stroke-width="1.5"/>
  <path d="M28,938 L48,938 L28,956 L48,956 Z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
  <text x="58" y="952" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">normally closed</text>
  <path d="M28,962 L48,962 L28,980 L48,980 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="58" y="976" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">normally open</text>
  <path d="M29,1000 A9 9 0 0 1 47,1000 Z" fill="currentColor"/>
  <text x="58" y="1000" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">pneumatic</text>
  <circle cx="38" cy="1018" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="58" y="1023" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">solenoid</text>
  <line x1="38" y1="1046" x2="38" y2="1034" stroke="currentColor" stroke-width="1.5"/>
  <line x1="30" y1="1034" x2="46" y2="1034" stroke="currentColor" stroke-width="1.5"/>
  <text x="58" y="1046" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">manual</text>
  <path d="M242,938 L242,954 L258,946 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="258" y1="937" x2="258" y2="955" stroke="currentColor" stroke-width="1.6"/>
  <text x="272" y="951" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">check valve</text>
  <path d="M241,982 L259,982 L250,970 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M241,958 L259,958 L250,970 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="272" y="975" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">relief valve (set pressure shown)</text>
  <line x1="240" y1="1000" x2="260" y2="1000" stroke="currentColor" stroke-width="2.4"/>
  <line x1="240" y1="995" x2="260" y2="995" stroke="var(--muted)" stroke-width="1"/>
  <line x1="240" y1="1005" x2="260" y2="1005" stroke="var(--muted)" stroke-width="1"/>
  <text x="272" y="1004" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">vacuum-jacketed line</text>
  <line x1="240" y1="1023" x2="260" y2="1023" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="272" y="1027" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">signal / command</text>
  <path d="M246,1036 L240,1036 L240,1054 L246,1054" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M254,1036 L260,1036 L260,1054 L254,1054" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="272" y="1050" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">quick disconnect</text>

  <!-- ================= TITLE BLOCK ================= -->
  <rect x="452" y="916" width="234" height="146" rx="5" fill="var(--side)" stroke="var(--line)" stroke-width="1.5"/>
  <text x="462" y="938" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PROJECT IGNIS-1 — STAND P&amp;ID</text>
  <text x="462" y="957" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">Perihelion Rocketry</text>
  <text x="462" y="976" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">SHEET 1 OF 1 · REV A</text>
  <text x="462" y="995" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">DRAWN J.O. · CHECKED —</text>
  <text x="462" y="1014" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">Tags per ISA-5.1 (2022)</text>
  <text x="462" y="1033" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">Set pressures: team sheet</text>
  <text x="462" y="1052" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">Supersedes whiteboard sketch</text>
</svg>
<figcaption>Figure C.1 — The proposal as submitted, redrawn from the group's Rev A sheet without alteration. Oxidiser green, fuel orange, inert grey. Study it before reading §2.2.</figcaption>
</figure>

### 2.2 Design description, in the group's own words

**Storage and inventory.** Two run tanks: V-101, 60 L of LOX, and V-201, 40 L of
liquid methane. Both are surplus vacuum-jacketed 316L stainless dewars bought from
a laboratory-equipment reseller. Between tests the delivery containers — a 180 L
LOX portable dewar and a 160 L LNG dewar — stand against the west wall of the bay,
about four metres from the stand.

**Pressurisation and purge.** One nitrogen pack, P-301, six cylinders at 6000 psig
manifolded together, regulated by PCV-301 to 250 psig. That single 250 psig
manifold feeds both tank ullages through CV-301 and CV-302 and both purge circuits
through CV-303 and CV-304.

**Oxidiser side.** LOX enters through QD-1, a brass cam-lock quick disconnect, and
HV-105, a quarter-turn ball valve, along a braided flexible hose from the delivery
dewar. LG-101 is a polycarbonate sight tube on the side of V-101 for reading level
by eye. The feed leg runs from the tank bottom through F-106, FT-107, the manual
isolation valve HV-107 and the main oxidiser valve MOV-110 to the engine. HV-108
drains the tank to the apron outside the roll-up door. Flanged joints on the feed
leg are aluminium 6061 with Viton O-rings and zinc-plated cap screws; all ball
valves have PTFE seats.

**Fuel side.** Mirrored, with a vacuum-jacketed fill line through HV-204, the same
filter and flow transmitter arrangement, and PSV-209 at 200 psig on the segment
between HV-207 and MFV-210. HV-208 drains to the same apron.

**Venting.** PSV-101, PV-103, PSV-201, FV-203 and PSV-209 all discharge into one
header, which turns up the north wall as V-1, a 2.4 m run of one-inch tube ending
above the roll-up door, next to the bay's air-handling intake.

**Engine and stand.** E-1 sits on a thrust frame directly over the utility trench,
firing downward into it. IG-1 is a spark igniter driven by an automotive ignition
coil.

**Control.** MOV-110 and MFV-210 are pneumatic, commanded from the operator
station eight metres away, behind a barrier of plywood sheet and sandbags inside
the bay. Control and instrument cable is run along the trench. Everything else —
HV-102, HV-105, HV-107, HV-108, HV-204, HV-207, HV-208 and the sight glass — is
manual and at the stand.

### 2.3 The group's claims and assumptions

These are quoted from the proposal document and the group's answers at their
internal review. They are numbered so you can cite them.

**C1.** "Maximum inventory is 60 L LOX and 40 L LCH₄ in the run tanks. We will
start there and scale to the 5 kN engine next year."

**C2.** "The run tanks are 316L vacuum-jacketed dewars. They have no nameplate, but
the reseller's website lists that model at 250 psig, so we have taken MAWP as
250 psig."

**C3.** "Relief set pressures are 175 psig on both tanks. We took them from the
[other university] stand, which runs a similar engine on the same propellants."

**C4.** "The assembled system was proof-tested to 375 psig — 1.5 × MAWP — using the
shop's compressed-air line, held for ten minutes, with two members watching for
leaks. We then leak-checked all joints with soap solution at 100 psig."

**C5.** "All LOX-side parts were degreased with acetone, wiped with lint-free
cloth, blown dry with shop air and inspected under a UV torch. They are clean."

**C6.** "Materials: 316L tube throughout; aluminium 6061 flanges with Viton
O-rings and zinc-plated cap screws; PTFE-seated ball valves; brass cam-lock QD
lubricated with white lithium grease; polycarbonate sight tube."

**C7.** "One nitrogen supply is sufficient. CV-301 through CV-304 prevent any
cross-flow between the fuel and oxidiser systems."

**C8.** "One vent stack. Two stacks would double the cost, and the mixture is far
too dilute to burn by the time it leaves the pipe."

**C9.** "MOV-110 fails open so that a momentary drop in shop air does not scrub a
test. PV-103 fails closed so that we do not lose tank pressure during a run."

**C10.** "HV-102 lets us change the relief valve without draining the tank. It is
tagged OPEN and only the safety officer is permitted to close it."

**C11.** "Gas detection: two catalytic-bead methane heads, one at the bay roof and
one inside the instrument box, and one oxygen monitor at the operator station.
Methane is lighter than air, so the roof head sees it first."

**C12.** "The bay is 14 × 9 × 5 m and we keep the roll-up door open, so ventilation
is not an issue and an oxygen-deficiency analysis is not needed."

**C13.** "No hazardous area classification is required: with the door open the bay
is effectively outdoors, and oxygen is not flammable. Power is a 30 m extension
lead to the operator station, which also runs a laptop and, in winter, a fan
heater."

**C14.** "The trench is a cable route. We will cover it with steel plate during
tests. The apron drains toward it, which keeps spills off the service road."

**C15.** "During fill and pressurisation two members stand at the stand to operate
HV-105 and HV-107, watch LG-101 and confirm HV-102 is open. They talk to the
operator station on handheld radios. Once the tanks are up to pressure they walk
back behind the barrier."

**C16.** "We held a design review: the P&ID was projected at a team meeting and
everyone was asked what could go wrong. Eleven items were raised and nine are
closed. Our faculty advisor has reviewed and approved the design."

**C17.** "Training: all members have completed the university's online laboratory
safety module. Three have watched a liquid-nitrogen handling video. Two ran the
LN₂ cold flows. The team lead, who designed the stand, graduates in May."

**C18.** "In an emergency we call 911 and evacuate the quad. There is a burn kit in
the bay."

**C19.** "Rev A was drawn in the autumn. Since then we added HV-102 and moved
FT-107 downstream of the filter. The drawing will be updated before the test."

**C20.** "Instrumentation: PT on each ullage, PT on the pressurant pack, chamber
PT, TT on each tank, FT on each feed leg, LT on the methane tank. LOX tank level is
read off LG-101 by eye, which is simpler and puts no electrical parts near the
oxygen."

**C21.** "We emailed EHS in January describing the project as a cold-flow test rig.
They replied that we should follow the university's compressed-gas policy. We have
taken that as approval."

**C22.** "Filling: two members connect the delivery dewar to QD-1 by hand and open
HV-105 quickly, so the line chills fast instead of sitting there boiling."

**C23.** "First hot fire is scheduled in six weeks, during the engineering open-day
weekend, with spectators watching from the bay door."

---

## 3. Your assignment

Perform a **preliminary safety and design review** of this proposal and produce a
findings list.

### What to produce

One entry per finding. Each entry needs five things, and the last two are what
separate a review from a complaint:

1. **Severity.** Use four bands: **Critical** — stops the project until closed;
   **Major** — must be closed before the next gate; **Minor** — should be fixed,
   does not stop anything; **Question** — you cannot tell from what is in front of
   you, and the answer may be perfectly acceptable.
2. **Where.** A tag from Figure C.1, or a claim number, or both. A finding without
   a location cannot be dispositioned by anyone.
3. **What is wrong**, in one sentence.
4. **Why it matters physically** — the mechanism, and where you can, the number.
   "That is bad practice" is not a finding. "That segment holds about a litre of
   LOX with no path out, and confined cryogen warming to ambient goes past
   10,000 psig" is.
5. **What you demand.** The specific question, calculation, record or drawing you
   want back, and from whom. Where the answer is facility-specific, say so and
   name who owns it — that is a correct finding, not a cop-out.

### How long

Ninety minutes to two hours. Work the drawing first and the text second; do not
read them together, because you will otherwise stop looking at the picture as soon
as the words explain it.

**Do not stop at five findings.** A system at this maturity, reviewed properly,
returns well over a dozen. If your list is short you are describing the drawing
rather than reviewing it.

### Method reminder

Module 08 §3 gives you seven passes. Run them, one at a time, over the whole
drawing, and do not let yourself find a different class of problem mid-pass:

1. **Trapped volume** — close every valve mentally; list what is now isolated.
2. **Relief path** — trace every relief device to where it comes out.
3. **Oxygen compatibility** — highlight everything above 23.5 % oxygen and ask
   what qualifies it.
4. **Accumulation and ventilation** — where does a release go, and where does it
   stop?
5. **Single failure** — fail one component at a time in the worst plausible way.
6. **Instrumentation coverage** — for each failure you imagined, what would tell
   anyone it is happening, and how fast?
7. **Loss of utilities** — cut power, air and comms, and write down the resulting
   whole-system state.

Then two habits that ride on top: *where does a person have to stand, and when?*
and *does this drawing describe the system that exists?*

And then read §2.2 and §2.3 again as **evidence**. A review is not only about the
picture. Some of what is wrong here has never been drawn, because it is a claim
nobody has tested, a record nobody has kept, or an approval nobody has actually
given.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Write the findings you would be willing to say out loud to the group, in the room,
with their advisor present. That constraint is not politeness — it forces every
finding to carry a mechanism and a demand instead of a verdict.
</div>

---

## 4. Before you open the solution

Finish first. Write the list down — on paper, in a file, anywhere it is fixed
before you look. Then open [`capstone-key.md`](capstone-key.md) and compare.

The key groups the findings by severity, gives the reasoning and the standard for
each, and ends by naming the items that are genuinely ambiguous, where a good
reviewer asks a question rather than writing a defect. Count what you found, and
more usefully, notice *which lens* you were not running.

**One closing note on what this exercise is not.** Finding fifteen problems in a
fictional drawing does not make you competent to review a real one, and reviewing
a real one is not the same as operating it. What it does is give you the habit —
seven cheap passes, in a conference room, before anyone buys a valve. That habit
is worth having, and this is where it starts.
