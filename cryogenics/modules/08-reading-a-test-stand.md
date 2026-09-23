# Module 08 — Understanding a Cryogenic Rocket Test Stand

*Roughly 30 minutes. Prerequisite: Modules 01–07.*

Everything so far has been a part: a tank, a valve, a relief, a detector, a
property of a fluid. A test stand is what happens when those parts are bolted
together and the interactions matter more than the parts. This module teaches you
to **review** such a system — to see, in a schematic, the trapped volume, the
missing relief path, the vent that plugs, the single failure that opens two things
at once.

**There is no firing procedure here, and there will not be one.** A real procedure
is specific to real hardware: actual valves, actual set pressures verified against
actual relief calculations, actual trained people. It is written by the engineers who
built the stand, checked by someone who did not, and approved by an institution that
accepts the consequences. A generic sequence that merely *looks* like one is worse
than none, because it invites someone to follow it.

## What you'll be able to do

- Read a cryogenic P&ID and say what every valve, relief and instrument is for.
- Find the isolatable volumes and check each has a relief path that cannot itself
  be isolated.
- Trace every relief and vent to its discharge and judge whether it is acceptable.
- Apply seven standing review passes — trapped volume, relief path, oxygen
  compatibility, accumulation and ventilation, single failure, instrumentation
  coverage, loss of utilities — to any cryogenic drawing.
- Draft the failures a hazard review of a small methalox stand should investigate.

---

## 1. The conceptual stand

Figure 8.1 is a small LOX/liquid-methane engine test stand, tagged per ANSI/ISA-5.1
(2022). It is deliberately generic, and the set pressures are **illustrative
placeholders**, not design values — real ones come from a relief calculation against
CGA S-1.3 (10th ed., 2024) and ASME BPVC Section VIII Div. 1 (2025), and belong to
the vessel they protect. Study it before reading on.

<figure>
<svg viewBox="0 0 740 1000" role="img" aria-label="Piping and instrumentation schematic of a small liquid-oxygen and liquid-methane rocket engine test stand, showing two run tanks with helium pressurisation, separate oxidiser and fuel vent stacks, relief valves and burst discs, fill and drain lines, filtered feed legs with fail-closed main propellant valves, nitrogen purge panels, an engine, gas detection, and a remote-operation boundary with a control room outside it.">
  <text x="14" y="15" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">TEST CELL — remote-operation boundary (dashed). No personnel inside during propellant operations.</text>
  <rect x="14" y="24" width="672" height="814" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="9 6"/>

  <!-- ============ VENT STACKS ============ -->
  <line x1="48" y1="76" x2="48" y2="585" stroke="var(--oxy)" stroke-width="2.4" fill="none"/>
  <path d="M48,76 L48,58 L60,50" stroke="var(--oxy)" stroke-width="2.4" fill="none"/>
  <path d="M60,50 l-8,-1 l4,7 z" fill="var(--oxy)"/>
  <text x="66" y="48" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">OX VENT STACK (A)</text>
  <text x="66" y="64" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">(GOX-enriched plume)</text>

  <line x1="652" y1="76" x2="652" y2="585" stroke="var(--fuel)" stroke-width="2.4" fill="none"/>
  <path d="M652,76 L652,58 L640,50" stroke="var(--fuel)" stroke-width="2.4" fill="none"/>
  <path d="M640,50 l8,-1 l-4,7 z" fill="var(--fuel)"/>
  <text x="634" y="48" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">FUEL VENT STACK (B)</text>
  <text x="634" y="64" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">(flammable) — never tied to A</text>

  <!-- ============ HELIUM PRESSURANT ============ -->
  <rect x="280" y="42" width="140" height="46" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="350" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">GHe PRESSURANT</text>
  <text x="350" y="79" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PACK  P-301</text>
  <line x1="350" y1="88" x2="350" y2="112" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="240" y1="112" x2="460" y2="112" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="352" y="106" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">GHe</text>
  <circle cx="432" cy="88" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="432" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="432" y="99" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">301</text>
  <line x1="432" y1="105" x2="432" y2="112" stroke="currentColor" stroke-width="1"/>
  <!-- helium header relief -->
  <line x1="266" y1="112" x2="266" y2="96" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M257,96 L275,96 L266,84 Z M254,74 L254,92 L266,84 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <polyline points="266,84 270,78 262,74 270,70" fill="none" stroke="var(--inert)" stroke-width="1.4"/>
  <line x1="254" y1="83" x2="230" y2="83" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M230,83 l8,-4 l0,8 z" fill="var(--inert)"/>
  <text x="226" y="80" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--inert)">PSV-303  350 psig</text>
  <text x="226" y="95" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">→ inert vent</text>

  <!-- ============ OXIDISER PRESSURISATION LEG ============ -->
  <polyline points="240,112 240,290 225,290 225,300" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M231,141 L231,159 L249,141 L249,159 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M231,133 A9 9 0 0 1 249,133 Z" fill="var(--inert)" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="240" y1="141" x2="240" y2="133" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="256" y="146" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PCV-101</text>
  <path d="M232,196 L248,204 L232,212 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="248" y1="195" x2="248" y2="213" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="256" y="209" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-101</text>
  <path d="M231,243 L231,261 L249,243 L249,261 Z" fill="var(--inert)" stroke="var(--inert)" stroke-width="1.8"/>
  <circle cx="240" cy="232" r="7" fill="var(--bg)" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="240" y1="243" x2="240" y2="239" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="256" y="256" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PV-104  FC</text>

  <!-- ============ FUEL PRESSURISATION LEG ============ -->
  <polyline points="460,112 460,290 475,290 475,300" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M451,141 L451,159 L469,141 L469,159 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M451,133 A9 9 0 0 1 469,133 Z" fill="var(--inert)" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="460" y1="141" x2="460" y2="133" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="444" y="146" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PCV-201</text>
  <path d="M452,196 L468,204 L452,212 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="468" y1="195" x2="468" y2="213" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="444" y="209" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-201</text>
  <path d="M451,243 L451,261 L469,243 L469,261 Z" fill="var(--inert)" stroke="var(--inert)" stroke-width="1.8"/>
  <circle cx="460" cy="232" r="7" fill="var(--bg)" stroke="var(--inert)" stroke-width="1.5"/>
  <line x1="460" y1="243" x2="460" y2="239" stroke="var(--inert)" stroke-width="1.5"/>
  <text x="444" y="256" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PV-204  FC</text>

  <!-- ============ OXIDISER TANK TOP ============ -->
  <line x1="48" y1="170" x2="200" y2="170" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="95" y1="282" x2="210" y2="282" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="150" y1="282" x2="150" y2="300" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="95" y1="282" x2="95" y2="170" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="150" y1="282" x2="150" y2="170" stroke="var(--oxy)" stroke-width="2.4"/>
  <line x1="210" y1="282" x2="210" y2="268" stroke="var(--oxy)" stroke-width="2.4"/>
  <!-- burst disc PSE-102 -->
  <path d="M86,252 A14 14 0 0 0 104,252" fill="none" stroke="var(--oxy)" stroke-width="2.2"/>
  <line x1="86" y1="244" x2="86" y2="260" stroke="var(--oxy)" stroke-width="2.2"/>
  <line x1="104" y1="244" x2="104" y2="260" stroke="var(--oxy)" stroke-width="2.2"/>
  <text x="106" y="276" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 106 276)">PSE-102  210 psig</text>
  <!-- vent valve PV-103 -->
  <path d="M141,242 L159,242 L141,262 L159,262 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <circle cx="150" cy="231" r="7" fill="var(--bg)" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="150" y1="242" x2="150" y2="238" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="161" y="276" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 161 276)">PV-103 vent  FO</text>
  <!-- relief PSV-101, angled: inlet below, outlet left -->
  <path d="M201,268 L219,268 L210,256 Z M200,247 L200,265 L210,256 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <polyline points="210,256 214,250 206,246 214,242" fill="none" stroke="var(--oxy)" stroke-width="1.4"/>
  <polyline points="200,256 190,256 190,170" fill="none" stroke="var(--oxy)" stroke-width="2.4"/>
  <text x="221" y="276" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 221 276)">PSV-101  145 psig</text>

  <!-- ============ FUEL TANK TOP ============ -->
  <line x1="500" y1="170" x2="652" y2="170" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="490" y1="282" x2="605" y2="282" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="550" y1="282" x2="550" y2="300" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="605" y1="282" x2="605" y2="170" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="550" y1="282" x2="550" y2="170" stroke="var(--fuel)" stroke-width="2.4"/>
  <line x1="490" y1="282" x2="490" y2="268" stroke="var(--fuel)" stroke-width="2.4"/>
  <path d="M596,252 A14 14 0 0 0 614,252" fill="none" stroke="var(--fuel)" stroke-width="2.2"/>
  <line x1="596" y1="244" x2="596" y2="260" stroke="var(--fuel)" stroke-width="2.2"/>
  <line x1="614" y1="244" x2="614" y2="260" stroke="var(--fuel)" stroke-width="2.2"/>
  <text x="616" y="276" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 616 276)">PSE-202  190 psig</text>
  <path d="M541,242 L559,242 L541,262 L559,262 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <circle cx="550" cy="231" r="7" fill="var(--bg)" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="550" y1="242" x2="550" y2="238" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="561" y="276" font-family="system-ui, sans-serif" font-size="13" fill="currentColor" transform="rotate(-90 561 276)">FV-203 vent  FO</text>
  <path d="M481,268 L499,268 L490,256 Z M500,247 L500,265 L490,256 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <polyline points="490,256 494,250 486,246 494,242" fill="none" stroke="var(--fuel)" stroke-width="1.4"/>
  <polyline points="500,256 510,256 510,170" fill="none" stroke="var(--fuel)" stroke-width="2.4"/>
  <text x="452" y="297" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PSV-201  130 psig</text>
  <line x1="456" y1="292" x2="481" y2="270" stroke="var(--muted)" stroke-width="1"/>

  <!-- ============ RUN TANKS ============ -->
  <rect x="115" y="300" width="130" height="152" rx="26" fill="var(--side)" stroke="var(--oxy)" stroke-width="2.6"/>
  <text x="180" y="356" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">LOX RUN TANK</text>
  <text x="180" y="374" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">V-101</text>
  <text x="180" y="392" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">LOX  90.2 K</text>
  <circle cx="150" cy="424" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="150" y="421" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LT</text>
  <text x="150" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">101</text>
  <circle cx="212" cy="424" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="212" y="421" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">TT</text>
  <text x="212" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">101</text>
  <circle cx="270" cy="330" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="270" y="327" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="270" y="341" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">102</text>
  <line x1="253" y1="330" x2="245" y2="330" stroke="currentColor" stroke-width="1"/>

  <rect x="455" y="300" width="130" height="152" rx="26" fill="var(--side)" stroke="var(--fuel)" stroke-width="2.6"/>
  <text x="520" y="356" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">LCH₄ RUN TANK</text>
  <text x="520" y="374" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">V-201</text>
  <text x="520" y="392" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄  111.7 K</text>
  <circle cx="550" cy="424" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="550" y="421" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LT</text>
  <text x="550" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">201</text>
  <circle cx="488" cy="424" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="488" y="421" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">TT</text>
  <text x="488" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">201</text>
  <circle cx="430" cy="330" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="430" y="327" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="430" y="341" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">202</text>
  <line x1="447" y1="330" x2="455" y2="330" stroke="currentColor" stroke-width="1"/>

  <!-- ============ FILL LINES (VJ) ============ -->
  <line x1="16" y1="395" x2="42" y2="395" stroke="var(--oxy)" stroke-width="2.8"/>
  <path d="M42,395 A6 6 0 0 1 54,395" fill="none" stroke="var(--oxy)" stroke-width="2.8"/>
  <line x1="54" y1="395" x2="115" y2="395" stroke="var(--oxy)" stroke-width="2.8"/>
  <line x1="60" y1="389" x2="115" y2="389" stroke="var(--muted)" stroke-width="1"/>
  <line x1="60" y1="401" x2="115" y2="401" stroke="var(--muted)" stroke-width="1"/>
  <path d="M79,386 L79,404 L97,386 L97,404 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="1.8"/>
  <line x1="88" y1="386" x2="88" y2="372" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="81" y1="372" x2="95" y2="372" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="22" y="368" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LOX FILL →</text>
  <text x="22" y="418" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-104  VJ</text>

  <line x1="684" y1="395" x2="658" y2="395" stroke="var(--fuel)" stroke-width="2.8"/>
  <path d="M658,395 A6 6 0 0 0 646,395" fill="none" stroke="var(--fuel)" stroke-width="2.8"/>
  <line x1="646" y1="395" x2="585" y2="395" stroke="var(--fuel)" stroke-width="2.8"/>
  <line x1="640" y1="389" x2="585" y2="389" stroke="var(--muted)" stroke-width="1"/>
  <line x1="640" y1="401" x2="585" y2="401" stroke="var(--muted)" stroke-width="1"/>
  <path d="M603,386 L603,404 L621,386 L621,404 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="1.8"/>
  <line x1="612" y1="386" x2="612" y2="372" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="605" y1="372" x2="619" y2="372" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="678" y="368" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">← LCH₄ FILL</text>
  <text x="684" y="418" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-204  VJ</text>

  <!-- ============ DRAINS ============ -->
  <polyline points="140,452 140,478 54,478" fill="none" stroke="var(--oxy)" stroke-width="2.6"/>
  <path d="M54,478 A6 6 0 0 0 42,478" fill="none" stroke="var(--oxy)" stroke-width="2.6"/>
  <line x1="42" y1="478" x2="16" y2="478" stroke="var(--oxy)" stroke-width="2.6"/>
  <path d="M16,478 l9,-4 l0,8 z" fill="var(--oxy)"/>
  <path d="M105,469 L105,487 L123,469 L123,487 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="1.8"/>
  <line x1="114" y1="469" x2="114" y2="457" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="107" y1="457" x2="121" y2="457" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="22" y="504" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-105 → LOX disposal</text>
  <text x="22" y="520" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">concrete, not asphalt</text>

  <polyline points="560,452 560,478 646,478" fill="none" stroke="var(--fuel)" stroke-width="2.6"/>
  <path d="M646,478 A6 6 0 0 1 658,478" fill="none" stroke="var(--fuel)" stroke-width="2.6"/>
  <line x1="658" y1="478" x2="684" y2="478" stroke="var(--fuel)" stroke-width="2.6"/>
  <path d="M684,478 l-9,-4 l0,8 z" fill="var(--fuel)"/>
  <path d="M577,469 L577,487 L595,469 L595,487 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="1.8"/>
  <line x1="586" y1="469" x2="586" y2="457" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="579" y1="457" x2="593" y2="457" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="678" y="504" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-205 → CH₄ disposal</text>
  <text x="678" y="520" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">separate from LOX pad</text>

  <!-- ============ OXIDISER FEED LEG ============ -->
  <line x1="215" y1="452" x2="215" y2="700" stroke="var(--oxy)" stroke-width="2.8"/>
  <line x1="209" y1="500" x2="209" y2="700" stroke="var(--muted)" stroke-width="1"/>
  <line x1="221" y1="500" x2="221" y2="700" stroke="var(--muted)" stroke-width="1"/>
  <line x1="215" y1="700" x2="310" y2="700" stroke="var(--oxy)" stroke-width="2.8"/>
  <text x="228" y="470" font-family="system-ui, sans-serif" font-size="13" fill="var(--oxy)">LOX feed (VJ)</text>
  <rect x="203" y="474" width="24" height="26" fill="var(--bg)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="203" y1="500" x2="227" y2="474" stroke="var(--oxy)" stroke-width="1.4"/>
  <text x="234" y="494" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">F-106 filter</text>
  <circle cx="262" cy="524" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="262" y="521" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FT</text>
  <text x="262" y="535" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">107</text>
  <line x1="245" y1="524" x2="221" y2="524" stroke="currentColor" stroke-width="1"/>
  <path d="M206,551 L224,551 L206,571 L224,571 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="215" y1="551" x2="215" y2="539" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="208" y1="539" x2="222" y2="539" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="234" y="562" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-108 vented</text>
  <!-- trapped volume relief -->
  <line x1="215" y1="585" x2="48" y2="585" stroke="var(--oxy)" stroke-width="2.4"/>
  <path d="M164,576 L182,576 L173,588 Z M154,579 L154,597 L164,588 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <text x="120" y="608" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PSV-109  200 psig</text>
  <path d="M206,631 L224,631 L206,651 L224,651 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M206,620 A9 9 0 0 1 224,620 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="1.5"/>
  <line x1="215" y1="631" x2="215" y2="620" stroke="var(--oxy)" stroke-width="1.5"/>
  <text x="234" y="638" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">MOV-110 main</text>
  <text x="234" y="654" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">FAIL CLOSED</text>

  <!-- ============ FUEL FEED LEG ============ -->
  <line x1="485" y1="452" x2="485" y2="700" stroke="var(--fuel)" stroke-width="2.8"/>
  <line x1="479" y1="500" x2="479" y2="700" stroke="var(--muted)" stroke-width="1"/>
  <line x1="491" y1="500" x2="491" y2="700" stroke="var(--muted)" stroke-width="1"/>
  <line x1="485" y1="700" x2="390" y2="700" stroke="var(--fuel)" stroke-width="2.8"/>
  <text x="472" y="470" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--fuel)">LCH₄ feed (VJ)</text>
  <rect x="473" y="474" width="24" height="26" fill="var(--bg)" stroke="var(--fuel)" stroke-width="2"/>
  <line x1="473" y1="500" x2="497" y2="474" stroke="var(--fuel)" stroke-width="1.4"/>
  <text x="466" y="494" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">filter F-206</text>
  <circle cx="438" cy="524" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="438" y="521" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">FT</text>
  <text x="438" y="535" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">207</text>
  <line x1="455" y1="524" x2="479" y2="524" stroke="currentColor" stroke-width="1"/>
  <path d="M476,551 L494,551 L476,571 L494,571 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <line x1="485" y1="551" x2="485" y2="539" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="478" y1="539" x2="492" y2="539" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="466" y="562" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-208 vented</text>
  <line x1="485" y1="585" x2="652" y2="585" stroke="var(--fuel)" stroke-width="2.4"/>
  <path d="M518,576 L536,576 L527,588 Z M536,579 L536,597 L527,588 Z" fill="none" stroke="var(--fuel)" stroke-width="2"/>
  <text x="580" y="608" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PSV-209  200 psig</text>
  <path d="M476,631 L494,631 L476,651 L494,651 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="2"/>
  <path d="M476,620 A9 9 0 0 1 494,620 Z" fill="var(--fuel)" stroke="var(--fuel)" stroke-width="1.5"/>
  <line x1="485" y1="631" x2="485" y2="620" stroke="var(--fuel)" stroke-width="1.5"/>
  <text x="466" y="638" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">MFV-210 main</text>
  <text x="466" y="654" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">FAIL CLOSED</text>

  <!-- ============ PURGE PANELS ============ -->
  <rect x="20" y="646" width="122" height="52" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="81" y="665" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">GN₂ PURGE — OX</text>
  <text x="81" y="681" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">O₂-clean, G-4.1</text>
  <text x="81" y="694" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">separate source</text>
  <line x1="142" y1="672" x2="215" y2="672" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M162,664 L178,672 L162,680 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="178" y1="663" x2="178" y2="681" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="152" y="712" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-303</text>

  <rect x="558" y="646" width="122" height="52" rx="5" fill="var(--side)" stroke="var(--inert)" stroke-width="2"/>
  <text x="619" y="665" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">GN₂ PURGE — FUEL</text>
  <text x="619" y="681" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-404 isolation</text>
  <text x="619" y="694" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">separate source</text>
  <line x1="558" y1="672" x2="485" y2="672" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M538,664 L522,672 L538,680 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="522" y1="663" x2="522" y2="681" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="548" y="712" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-403</text>

  <!-- ============ ENGINE ============ -->
  <rect x="310" y="690" width="80" height="52" rx="4" fill="var(--side)" stroke="currentColor" stroke-width="2.4"/>
  <path d="M310,742 L390,742 L406,800 L294,800 Z" fill="var(--side)" stroke="currentColor" stroke-width="2.4"/>
  <text x="350" y="714" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">E-1 ENGINE</text>
  <text x="350" y="731" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">LOX / LCH₄</text>
  <text x="350" y="775" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">IG-1 igniter</text>
  <circle cx="350" cy="600" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="350" y="597" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PT</text>
  <text x="350" y="611" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">111</text>
  <line x1="350" y1="617" x2="350" y2="690" stroke="currentColor" stroke-width="1"/>

  <!-- ============ TRENCH ============ -->
  <rect x="250" y="806" width="200" height="26" fill="none" stroke="var(--warn)" stroke-width="2"/>
  <line x1="250" y1="832" x2="276" y2="806" stroke="var(--warn)" stroke-width="1"/>
  <line x1="290" y1="832" x2="316" y2="806" stroke="var(--warn)" stroke-width="1"/>
  <line x1="330" y1="832" x2="356" y2="806" stroke="var(--warn)" stroke-width="1"/>
  <line x1="370" y1="832" x2="396" y2="806" stroke="var(--warn)" stroke-width="1"/>
  <line x1="410" y1="832" x2="436" y2="806" stroke="var(--warn)" stroke-width="1"/>
  <text x="458" y="794" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">FLAME TRENCH — low point</text>

  <!-- ============ GAS DETECTION ============ -->
  <circle cx="95" cy="545" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="95" y="542" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="95" y="556" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">402</text>
  <text x="116" y="543" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">O₂ enrichment</text>
  <text x="116" y="559" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">at LOX skid</text>

  <circle cx="200" cy="782" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="200" y="779" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="200" y="793" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">401</text>
  <text x="200" y="740" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">O₂ deficiency</text>
  <text x="200" y="756" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">breathing zone</text>

  <circle cx="600" cy="122" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="600" y="119" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="600" y="133" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">403</text>
  <text x="578" y="112" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CH₄ — high level</text>
  <text x="578" y="128" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">under cell roof</text>

  <circle cx="490" cy="819" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <text x="490" y="816" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AT</text>
  <text x="490" y="830" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">404</text>
  <line x1="473" y1="819" x2="450" y2="819" stroke="currentColor" stroke-width="1"/>
  <text x="512" y="820" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CH₄ — in trench</text>

  <!-- ============ LEGEND ============ -->
  <rect x="18" y="862" width="166" height="104" rx="5" fill="var(--side)" stroke="var(--line)" stroke-width="1.5"/>
  <path d="M28,878 L28,890 L40,878 L40,890 Z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
  <text x="48" y="889" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">normally closed</text>
  <path d="M28,898 L28,910 L40,898 L40,910 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="48" y="909" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">normally open</text>
  <path d="M28,924 A6 6 0 0 1 40,924 Z" fill="currentColor"/>
  <circle cx="34" cy="936" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="48" y="930" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">pneumatic/solenoid</text>
  <line x1="26" y1="948" x2="42" y2="948" stroke="currentColor" stroke-width="2.4"/>
  <line x1="26" y1="943" x2="42" y2="943" stroke="var(--muted)" stroke-width="1"/>
  <line x1="26" y1="953" x2="42" y2="953" stroke="var(--muted)" stroke-width="1"/>
  <text x="48" y="948" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">vacuum-jacketed</text>
  <line x1="26" y1="960" x2="42" y2="960" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="48" y="964" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">signal / command</text>

  <!-- ============ SIGNALS AND CONTROL ROOM ============ -->
  <polyline points="228,641 240,641 240,862 350,862 350,876" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <polyline points="472,641 460,641 460,862 350,862" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <rect x="190" y="876" width="320" height="92" rx="6" fill="var(--side)" stroke="currentColor" stroke-width="2"/>
  <text x="350" y="898" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">CONTROL ROOM / BLOCKHOUSE</text>
  <text x="350" y="915" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">outside the barricade — commands originate here</text>
  <circle cx="250" cy="944" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <line x1="233" y1="944" x2="267" y2="944" stroke="currentColor" stroke-width="1.4"/>
  <text x="250" y="940" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">PIC</text>
  <text x="250" y="957" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">101</text>
  <circle cx="350" cy="944" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <line x1="333" y1="944" x2="367" y2="944" stroke="currentColor" stroke-width="1.4"/>
  <text x="350" y="940" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HS</text>
  <text x="350" y="957" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">110</text>
  <circle cx="450" cy="944" r="17" fill="var(--bg)" stroke="currentColor" stroke-width="1.6"/>
  <line x1="433" y1="944" x2="467" y2="944" stroke="currentColor" stroke-width="1.4"/>
  <text x="450" y="940" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">AI</text>
  <text x="450" y="957" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">401</text>
</svg>
<figcaption>Figure 8.1 — A conceptual LOX/LCH₄ test stand. Oxidiser green, fuel orange, inert grey; set pressures are illustrative placeholders. The two vent stacks terminate separately and share no pipework anywhere on the drawing.</figcaption>
</figure>

---

## 2. A guided walkthrough

A bubble on a line is field-mounted; one with a horizontal bar lives in the control
room, which is why PIC-101, HS-110 and AI-401 sit inside the blockhouse and PT-102
does not. `FC`/`FO` is the **fail** position — a different question from the normal
position.

### 2.1 The pressurant leg — GHe, PCV-101, CV-101, PV-104

PCV-101 knocks helium down from pack P-301 to the ullage pressure the feed system
needs. Why helium, not the nitrogen already on site for purging? Nitrogen's
saturation temperature climbs steeply with pressure: at 90 K, liquid oxygen's
boiling point, nitrogen condenses at only **3.6 bar (~52 psia)**, so GN₂ pressurant
above that liquefies on V-101's cold ullage walls, putting liquid where gas was
intended and taking tank pressure down with it.

CV-101 stops propellant vapour migrating back into the common helium header, where
it would meet the other tank's line — but note what it is *not*: not an isolation
device, not testable in place, and the only thing between the LOX ullage and the
methane ullage. PV-104 fails closed; failed *open* instead, the tank would ride up
to the relief setting and sit there venting oxygen.

### 2.2 The tank tops — where the relief philosophy lives

Three risers come off the oxidiser tank's cross-header: PSE-102, a burst disc;
PV-103, the commanded vent valve; PSV-101, the relief valve. All three discharge
into the oxidiser vent header and leave via stack A. The disc and the valve are not
redundancy but two sizing cases. **PSV-101, set lower, recloses** and covers steady
boiloff from ordinary heat leak. **PSE-102, set higher, does not reclose** and
covers the accident — fire, or loss of the insulating vacuum, where air entering the
annulus condenses on the cold inner wall and drives fluxes of **1–7 kW/m² insulated
and 25–40 kW/m² bare** against roughly **0.6 W/m²** for healthy MLI, a step beyond
any reclosing valve of sensible size. PV-103 fails *open* (Figure 8.3).

<div class="box remember"><span class="lbl">Remember this</span>
Every isolatable volume that could contain cryogen needs its own relief path, and
that path must not itself be isolatable. The test is <em>isolatable</em>, not
<em>normally isolated</em>: if some combination of valve positions can strand
liquid, that segment needs relief whether or not anyone intends to create the
combination.
</div>

### 2.3 Fill and drain — HV-104, HV-105

The fill line enters low through HV-104 and is vacuum-jacketed, because a bare cold
line is both a boiloff source and a condensation surface: at LN₂ or LOX temperature
it condenses **liquid air of roughly 50 % oxygen** out of the atmosphere, which
drips onto whatever is underneath.

Drain HV-105 goes to a disposal pad, and the drawing says what the pad is: concrete,
graded away, not asphalt. NASA's testing found LOX-soaked asphalt reacting on impact
in 20 of 20 laboratory drops and a dry field slab throwing fragments 48 m; concrete
gave no reaction at all. And ask where each drain *stops*: close HV-105 with liquid
in the leg above and you have made a trap.

### 2.4 The feed legs — filters, flow meters, and the trap

Follow the LOX down from the tank: filter F-106, flow transmitter FT-107, manual
isolation ball valve HV-108, main oxidiser valve MOV-110, engine.

**F-106 is also a trap for solids** — water, CO₂ and hydrocarbons that are harmless
gases at ambient are particles at 90 K — so it catches them, then plugs, showing as
nothing at all on PT-102. **FT-107 means nothing unless the flow is single-phase.**
**HV-108 is a vented ball**, its cavity drilled to one side so trapped liquid can
never exceed line pressure, which makes it **directional**: installed backwards it
leaks by design, so check the arrow against the direction the valve must *hold*
pressure.

Now close HV-108, close MOV-110, and let CV-303 hold. The segment between them
contains liquid oxygen, has no path out, and is warming.

<figure>
<svg viewBox="0 0 660 300" role="img" aria-label="Detail of the trapped volume in the oxidiser feed leg between the isolation valve, the main valve and the purge check valve, and the same segment protected by a thermal relief.">
  <text x="40" y="30" font-family="system-ui, sans-serif" font-size="14" fill="var(--warn)">the trap</text>
  <rect x="92" y="74" width="36" height="112" fill="var(--warn-bg)" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="110" y1="60" x2="110" y2="200" stroke="var(--oxy)" stroke-width="3"/>
  <path d="M101,50 L119,50 L101,70 L119,70 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <text x="130" y="56" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">HV-108 closed</text>
  <path d="M101,190 L119,190 L101,210 L119,210 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <text x="130" y="214" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">MOV-110 closed</text>
  <line x1="110" y1="140" x2="196" y2="140" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M186,132 L170,140 L186,148 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="170" y1="131" x2="170" y2="149" stroke="var(--inert)" stroke-width="1.8"/>
  <text x="204" y="144" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">CV-303 holds ← GN₂</text>
  <text x="40" y="248" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">Isolated volume: LOX, ~1.5 L,</text>
  <text x="40" y="266" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">no path out, warming from ambient.</text>
  <text x="40" y="284" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">Confined cryogen: over 10 000 psig.</text>

  <text x="400" y="30" font-family="system-ui, sans-serif" font-size="14" fill="var(--ok)">the answer</text>
  <rect x="452" y="74" width="36" height="112" fill="var(--ok-bg)" stroke="var(--ok)" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="470" y1="60" x2="470" y2="200" stroke="var(--oxy)" stroke-width="3"/>
  <path d="M461,50 L479,50 L461,70 L479,70 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <path d="M461,190 L479,190 L461,210 L479,210 Z" fill="var(--oxy)" stroke="var(--oxy)" stroke-width="2"/>
  <line x1="470" y1="140" x2="400" y2="140" stroke="var(--inert)" stroke-width="1.8"/>
  <path d="M440,132 L424,140 L440,148 Z" fill="none" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="424" y1="131" x2="424" y2="149" stroke="var(--inert)" stroke-width="1.8"/>
  <line x1="470" y1="100" x2="520" y2="100" stroke="var(--oxy)" stroke-width="2.4"/>
  <path d="M520,91 L538,91 L529,103 Z M538,94 L538,112 L529,103 Z" fill="none" stroke="var(--oxy)" stroke-width="2"/>
  <polyline points="529,103 534,97 524,93 534,89" fill="none" stroke="var(--oxy)" stroke-width="1.4"/>
  <line x1="538" y1="103" x2="600" y2="103" stroke="var(--oxy)" stroke-width="2.4"/>
  <path d="M600,103 l-1,-5 l10,5 l-10,5 z" fill="var(--oxy)"/>
  <text x="512" y="76" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">PSV-109</text>
  <text x="400" y="248" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">Relieved to the oxidiser vent</text>
  <text x="400" y="266" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">header, then stack A, by a path</text>
  <text x="400" y="284" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">that cannot itself be isolated.</text>
</svg>
<figcaption>Figure 8.2 — The canonical cryogenic finding: two closed valves and a check valve define an isolated volume of liquid. PSV-109 exists solely to give it somewhere to go.</figcaption>
</figure>

### 2.5 The purge circuits — and the rule that has no exceptions

Two purge panels, fed from **separate sources**, one per propellant. A shared purge
manifold would be a flow path between a fuel system and an oxygen system with only a
check valve in the way — a device that leaks, hangs open on debris and cannot be
tested in place. Treating a check valve as a fuel/oxidiser barrier is the commonest
finding here.

The oxidiser purge is annotated *O₂-clean*, because a purge line is a direct
injection path for compressor oil, hydrocarbon residue and particulate — and CGA
G-4.1 (7th ed., 2018) governs every surface contacting fluid above 23.5 % oxygen.

### 2.6 The vents — two stacks, and why they never meet

Everything oxidiser-side — PSV-101, PSE-102, PV-103, PSV-109 — reaches stack A,
everything fuel-side stack B. They share no pipe.

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
Combine those two headers "to save a stack" and you have built a mixing chamber with
an ignition source at the end of it. Methane's flammable window in air is narrow —
<strong>5.0 % to 15.0 %</strong> — but in oxygen it is
<strong>5.15 % to 60.5 %</strong>, four times wider on the rich side. Inside a
shared header you pick neither the composition nor the moment. Even without
simultaneous flow, gas from one system sits in the header waiting for the other, and
a cold oxygen-carrying line that has also carried fuel can hold condensed
hydrocarbon as a detonable deposit.
</div>

Boiloff we expect continuously, from both tanks, for the whole cold period — that
is what PSV-101 and PSV-201 are sized for. And the cold gas leaving a stack freezes
atmospheric moisture at the outlet: the component whose whole job is never to be
blocked is the one that ices up.

### 2.7 Detection, and the line around the stand

Four analysers, three siting logics, because there is no general "gas detector
height". **AT-401** watches for oxygen deficiency in the breathing zone, threshold
19.5 % by volume; **AT-402** watches the opposite direction at the LOX skid, since
above 23.5 % ordinary materials become ignitable and clothing becomes a fuel;
**AT-403** sits under the cell roof, where warm methane at 0.55 times the density of
air collects; and **AT-404** sits in the trench, because cold methane vapour does
not rise — it must warm by **52.6 K, from 111.7 K to 164.3 K**, before it is as
light as ambient air, and until then it runs along the floor and pools.

The dashed boundary is the remote-operation line: everything inside is unoccupied
during propellant operations and every command originates in the blockhouse, which is
why MOV-110 and MFV-210 are pneumatic rather than handwheeled. Where that boundary
goes is a facility-specific decision from an explosive-siting analysis, not
something readable off a generic drawing.

---

## 3. The review lenses

This is the transferable part. An experienced reviewer does not read a schematic
once; they read it seven times, hunting one class of problem per pass. The
questions are the same whatever the fluid or the facility.

**1. The trapped-volume pass.** *Mentally close every valve. What is now isolated?*
Two block valves with nothing between them is the canonical finding; the rest of the
family is valve body cavities, dead legs and sense lines, the volume downstream of a
check valve, a pump casing, a vacuum annulus that could take an inner-wall leak, and
anything under an isolated relief. A plug of ice or solid air counts too: the
blockage *is* the closed valve, and it forms without anyone touching anything.

**2. The relief-path pass.** *Trace every relief to where it comes out.* Each must
terminate somewhere the drawing shows. Is anything in that path unsized for the
accident case? Can the outlet ice over? Is the stack restrained — a relieving vent
is a rocket nozzle and produces a reaction force. And do any two reliefs from
different fluids share anything at all?

**3. The oxygen-compatibility pass.** *Highlight everything that sees more than
23.5 % oxygen and ask whether it is qualified for it.* Tank, fill and drain lines,
the feed leg, the vent header and stack A, the pressurisation line back to CV-101,
the purge line downstream of CV-303, and every seal and seat inside those. Then walk
the ignition mechanisms — particle impact, rapid pressurisation,
mechanical impact, galling and friction — asking whether the design has removed at
least one characteristic element of each. If a material's flammability is unknown,
it is flammable.

**4. The accumulation-and-ventilation pass.** *Where does a release go, and where
does it stop?* Follow gravity for cold vapour, buoyancy for warm; mark every trench,
pit, sump, cable chase and dead corner. The methalox question is whether any single
volume can receive both a fuel and an oxidiser release, because that volume carries
a hazard neither system creates alone. Then check the detectors against those paths
— one downstream of a fan may never see the plume.

**5. The single-failure pass.** *Fail one component at a time, in the worst
plausible way* — not "does it break" but "what does its failure enable". The
governing rule: no single failure may open a fuel path and an oxidiser path into a
common volume.

**6. The instrumentation-coverage pass.** *For each failure I just imagined — what
would tell me it is happening, and how fast?* A leak into the cell shows on AT-403
or AT-404 in seconds; a degrading vacuum jacket shows only as a rising boiloff rate
over hours, and only if someone trends it. Ask each instrument what it does *not*
see: catalytic beads need oxygen, so they under-read in exactly the depleted
atmosphere a cryogenic leak creates.

**7. The loss-of-utilities pass.** *Cut the power, the instrument air, the comms
link.* Read every fail position off the drawing and write down the resulting
whole-system state.

<figure>
<svg viewBox="0 0 660 250" role="img" aria-label="Comparison of a fail-closed main propellant valve and a fail-open vent valve, showing the state each takes on loss of instrument air and why the two philosophies are opposite.">
  <line x1="120" y1="60" x2="120" y2="160" stroke="currentColor" stroke-width="3"/>
  <path d="M111,100 L129,100 L111,120 L129,120 Z" fill="currentColor" stroke="currentColor" stroke-width="2"/>
  <path d="M111,89 A9 9 0 0 1 129,89 Z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="100" x2="120" y2="89" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="46" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">MOV-110 / MFV-210</text>
  <text x="120" y="182" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--warn)">FAIL CLOSED</text>
  <text x="120" y="200" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">stop adding propellant</text>
  <line x1="440" y1="60" x2="440" y2="160" stroke="currentColor" stroke-width="3"/>
  <path d="M431,100 L449,100 L431,120 L449,120 Z" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="440" cy="89" r="7" fill="var(--bg)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="440" y1="100" x2="440" y2="96" stroke="currentColor" stroke-width="1.5"/>
  <text x="440" y="46" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="currentColor">PV-103 / FV-203</text>
  <text x="440" y="182" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--ok)">FAIL OPEN</text>
  <text x="440" y="200" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">never bottle up a cryogen</text>
  <text x="190" y="95" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">loss of air →</text>
  <text x="190" y="112" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">flow stops</text>
  <text x="510" y="95" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">loss of air →</text>
  <text x="510" y="112" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">tank vents</text>
  <text x="330" y="232" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="var(--muted)">opposite logic, same objective: the least dangerous state</text>
</svg>
<figcaption>Figure 8.3 — Fail-safe is per-valve, not per-system: isolation and pressurisation valves fail closed, vent and relief paths fail open. Both answers come from one question — which position is least dangerous when the utility disappears?</figcaption>
</figure>

*Fail-safe* describes what an actuator does when it loses its motive utility, and
says nothing about a valve that sticks — Artemis I was delayed by a hydrogen vent
valve with a perfectly well-defined fail position. It is a design layer, which is
exactly why relief devices are independent of the control system.

And one habit rides on top of all seven: *where does a person have to stand, and
when?*

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
A schematic review is seven cheap passes, not one expensive one. The cheapness is
the point: you find the two-block-valves-with-liquid-between-them on pass one, in a
conference room, for the cost of an afternoon.
</div>

---

## 4. What a hazard review of this stand would investigate

A formal review works through a structured method — a HAZOP walking guide words
across each node, an FMEA from the component up, a fault tree down from a defined
top event; OSHA's process-safety rule names all three. HAZOP fits here, because "no
flow", "reverse flow" and "more pressure" on an isolated node are exactly the
deviations this drawing hides. The items that would earn their own line:

1. **The shared helium header (CV-101 / CV-201).** One header serving both
   propellant ullages, separated only by check valves; reverse flow past one puts
   methane vapour into a line that later feeds the LOX tank. Refuse a non-return
   device as a fuel/oxidiser barrier.
2. **The feed-leg trapped volume (HV-108 / MOV-110 / CV-303).** Confirm the relief
   exists, is sized for the credible heat input and cannot be isolated.
3. **Loss of insulating vacuum on V-101.** The case that sizes PSE-102. Could
   anything in the relief path — a baffle, insulation, ice — pass normal boiloff
   invisibly and choke at full flow?
4. **Vent-stack icing** — a relief that cannot relieve — and **plume interaction
   between stacks A and B**: separate pipes, yes, but separate *plumes* under every
   wind and building wake? Separation is about where the gas goes, not where the
   pipe ends.
5. **A methane leak into the trench.** Is it ventilated and graded, is AT-404 sited
   where the layer forms, and what electrical equipment is down there?
6. **A LOX spill onto the ground.** Which surfaces receive it, and whether any
   hydrocarbon — grease, drips, debris, asphalt — is present. Housekeeping is an
   engineering control here, not tidiness.
7. **Coincident fuel and oxidiser release into one volume.** NASA's NESC work on
   LO₂/LNG notes the two liquids are *miscible*, admitting condensed-phase
   detonation — a hazard unlike LOX/RP-1 or LOX/LH₂, whose assessment guidance NASA
   itself called interim as recently as 2023.
8. **Oxygen cleanliness downstream of CV-303** — the documented cleanliness level
   and how it was verified, not an assurance.
9. **Instrument failure the control system trusts.** A frozen sense line gives a
   plausible, wrong pressure, and an interlock depending on it now depends on a
   blockage.
10. **Loss of power, air and comms together** — one case, not three.
11. **Ignition of a methane release.** Methane's minimum ignition energy in air is
    about **0.28 mJ**; a static discharge from a person is around **10 mJ**. Neither
    margin is a margin — hence bonding, grounding and area classification as
    structural requirements.

<div class="box"><span class="lbl">Worth knowing</span>
Notice how often the answer was <em>it depends on the facility</em>. Set pressures
depend on the vessel's MAWP and its relief calculation; stack heights and
separations on the site, the terrain and the AHJ; the barricade on an
explosive-siting analysis. A course can teach which questions have
facility-specific answers, but it cannot supply the answers.
</div>

---

## Where this leaves you

You can now look at a cryogenic schematic and see what is not drawn: the volume with
no way out, the relief discharging into a pipe that will plug, the failure that
opens two valves at once.

That does not make you qualified to operate a stand. Operating one requires
hardware-specific procedures, independent review, documented training and
institutional approval — because reading a drawing and running a system safely are
different competencies. Bring the review skill; let the procedure come from the
institution that owns the consequences.

---

## Checkpoint quiz

1. **Schematic reading.** HV-108 and MOV-110 are both closed and CV-303 is holding.
   Name the hazard, name the device that addresses it, and state the one
   requirement its discharge must satisfy.

2. **Short answer.** V-101 carries PSV-101 (145 psig, reclosing) *and* PSE-102
   (210 psig, non-reclosing). Why two rather than one larger one, and which is sized
   by the loss-of-vacuum case?

3. **Identify the failure state.** Instrument air is lost. From Figure 8.1, what
   state do MOV-110, MFV-210, PV-103, FV-203, PV-104 and PV-204 go to, why is the
   vent logic the reverse of the main-valve logic, and what failure does fail-safe
   design not protect against?

4. **What would concern you here?** A reviewer proposes deleting AT-404, because
   methane is lighter than air and AT-403 under the roof covers it. Reject this,
   with the temperature involved.

5. **Conceptual calculation.** The isolated segment in Figure 8.2 holds roughly
   1.5 L of liquid oxygen. Estimate the gas volume at 70 °F and 1 atm, and say what
   it tells you about a segment of fixed volume.

<details>
<summary>Show answers</summary>

1. **Trapped cryogenic liquid** — an isolatable volume of LOX with no path out,
   warming from ambient. LBNL gives pressures "in excess of 10 000 psig" for confined
   cryogen warming to ambient; no feed-line component is rated for that, and the
   failure is a fragmentation event. The device is **PSV-109**, and its discharge
   must reach somewhere the drawing shows — the oxidiser vent header, then stack A —
   by a path that **cannot itself be isolated**.

2. They answer **two different sizing cases**. PSV-101 covers steady boiloff and
   *recloses*, so the test continues. The **burst disc is sized by loss of vacuum**
   (and by fire): air into the annulus condenses on the cold inner wall, driving
   1–7 kW/m² insulated or 25–40 kW/m² bare against about 0.6 W/m² for healthy MLI.

3. **MOV-110, MFV-210, PV-104 and PV-204 go closed; PV-103 and FV-203 go open.**
   Isolation logic is "stop adding propellant, stop adding pressure"; vent logic is
   the reverse, because a sealed cryogenic volume with heat leaking into it has only
   one direction to go. Both answer the same question — which position is least
   dangerous when the utility disappears? What fail-safe does **not** cover is a
   valve that **sticks**, which is why relief devices sit outside the control
   system.

4. Because **cold** methane vapour is not lighter than air. It must warm from
   111.7 K to about **164.3 K — a rise of 52.6 K** — before its density matches
   ambient air, and until then it flows along the floor and pools in low points,
   which is what a trench is. AT-403 covers the warm buoyant regime, AT-404 the cold
   dense one. The reviewer is importing hydrogen practice, where the crossover comes
   within about 1.7 K of the boiling point.

5. Oxygen's ratio is **860 : 1** (liquid at NBP to gas at 70 °F, 1 atm), so 1.5 L
   becomes roughly **1 290 L, about 1.3 m³**. The segment is fixed at 1.5 L, so the
   gas cannot expand and the pressure goes wherever it must. The hazard is not
   proportional to how much you trapped: a very small volume is entirely sufficient
   to burst the pipe.

</details>
