# USU B.S. in Physics, Professional Emphasis: follow-up round (requirement blocks, degree map, round-one conflicts, upper-division PHYS courses, electives, catalog edition)

**How this round was done, and how far to trust it.** This file holds only **new or corrected** findings relative to `usu_program_and_physics_courses.md` and the USU passages of the sibling notes. Round-one facts reappear only in the consolidated table in Section 7.

**Access, re-tested on 2026-10-27:**
- `curl https://catalog.usu.edu/` returned `CONNECT tunnel failed, response 403`. The proxy reports this as a policy denial, and its README says not to retry or route around one.
- WebFetch of the program-requirements tab returned `getaddrinfo ENOTFOUND catalog.usu.edu`.
- **No USU page was opened directly.** Every fact below comes from the WebSearch tool, which returns a model-written summary of search-index snippets. This round used 42 queries, most restricted to `catalog.usu.edu`. No temporary files were needed.

**Tags:**
- **[excerpt]**: wording the search tool gave as quoted page text. Probably verbatim, but not checked against the live page.
- **[summary]**: the search tool's paraphrase of an indexed page.
- **[listing]**: only a URL or page title appeared.
- **[3rd-party]**: a non-USU aggregator such as Coursicle.
- **[INF]**: my own inference.

"Official" means a USU catalog page or a USU Physics department page.

**Edition key** (evidence in Section 6). Each label below is then used throughout:
- `catoid=39` is the **2024–2025** catalog.
- `catoid=40` is the **2025–2026** catalog.
- The new front end (`/programs/`, `/courses/`, `/pages/`) is almost certainly the **2026–2027** catalog.
- `catoid=38`, `35` and `12` are older editions. Their exact years are unverified; 38 is probably 2023–24 [INF].

---

## 1. Which exact courses sit inside each requirement block (28 / 13 / 26 credits, College of Science Sequence, PHYS 4900)? Are there choose-lists or elective credits?

### Takeaway
**The course rows inside the 28- and 26-credit blocks still could not be recovered.** More than 15 queries aimed at them returned the block headings, but the search tool described the rows as "truncated", "garbled" or "jumbled".

What is new, and narrows the blocks:
- **Math block.** Its credit values read 4/3/3/3, consistent with MATH 1220/2210/2270/2280. The plain Physics BS has a 13-credit math block of its own (Section 1, "13-credit math block"), so this block does not distinguish the emphasis.
- **College of Science Sequence.** The approved sequences are now known.
- **Assessment courses.** The department's Applied & Professional Emphasis assessment page names five "touchstone" courses: PHYS 3600, 3870, 3880, 4600 and 4900.
- **Department rules.** At most one P-D-F course, and at least a 2.3 GPA across required physics courses.
- **No elective rule.** No choose-list or elective-credit rule appears for the Professional Emphasis. The "6 additional Physics credits at 3500+" rule and the "PHYS 4650 if PHYS 3700 is not taken" rule both belong to the plain Physics BS.

### Cited Findings
**28-credit "Major Requirements" block**
- [excerpt] Plain Physics BS (2025–26): "Major Requirements (28 credits) All courses must be passed with a C- or better." The Professional Emphasis carries the same 28-credit heading. In both, the search tool said the course rows were "jumbled" and "not legible". Sources: [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337); [Physics: Professional Emphasis – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826).
- [excerpt] Course strings that do appear in the physics program pages (the search tool could not say which block each sits in):
  - "PHYS 2215 - Physics for Scientists and Engineers Lab I 1"
  - "PHYS 2500 - Introduction to Computer Methods in Physics 2"
  - "PHYS 3870 - Intermediate Physics Laboratory (CI) 3"
  - "PHYS 2225: Physics for Scientists and Engineers Lab II"

  Sources: [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337); [Physics: Applied Emphasis – BS, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298).

**13-credit math block**
- [excerpt] "Professional Emphasis Math Requirements (13 credits) All courses must be passed with a C- or better." — [catoid=40 program page](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826)
- [summary] The search tool read the block's credit values as **4, 3, 3, 3**. It matched them to MATH 1220 (4) + MATH 2210 (3) + MATH 2270 (3) + MATH 2280 (3), but said the course names themselves were not visible in the snippet. — [catoid=40 program page](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826)
- [summary] **Correction to round one, Section 8.** The plain Physics BS also has a "Required Math Courses (13 credits)" block. It appears in 2025–26 ([Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337)) and in 2024–25 ([Physics – BS, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39042&returnto=30112)). A 13-credit math block is therefore **not** what distinguishes the Professional Emphasis.
- [summary] The plain BS page also shows a 6-credit "BS degree requirements" block and "Select 6 additional Physics credits at the 3500 level and above". — [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337)

**26-credit block and the PHYS 4900 rule**
- [excerpt] "Professional Emphasis Additional Required Courses (26 credits) All courses must be passed with a grade of C- or better." In the snippets it is followed directly by "A total of 4 credits of PHYS 4900: Research in Physics (CI) is required for the Professional Emphasis." The course rows were not visible. — [catoid=40 program page](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826)

**College of Science Sequence (6–8 credits)**
- [summary] The student selects one full science series. The College of Science catalog page lists the approved sequences:
  - BIOL 1610 + BIOL 1620
  - CHEM 1210 + CHEM 1220
  - CS 1400 + (CS 1410 or CS 1440)
  - GEO 1110 + GEO 1115 + GEO 3200
  - PHYS 2110 + PHYS 2120
  - PHYS 2210 + PHYS 2220

  Sources: [College of Science, catoid=40](https://catalog.usu.edu/preview_entity.php?catoid=40&ent_oid=4264); [program page, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826).
- [summary] An older physics-specific catalog page, "PHYX - College of Science sequence requirement", gives the geology series as GEO 1110, GEO 1115 and **GEO 2200**. — [catoid=38](https://catalog.usu.edu/content.php?catoid=38&navoid=29079)
- [summary] "Teaching majors must also complete the first course of two of the other three series." The search tool did not pin which page this came from; it was in the same result set as the [College of Science page](https://catalog.usu.edu/preview_entity.php?catoid=40&ent_oid=4264) and the [PHYX sequence page](https://catalog.usu.edu/content.php?catoid=38&navoid=29079).

**Choose-lists and elective credits**
- [INF, from absence] No "select", "choose" or elective-credit rule surfaced for the Professional Emphasis in any of this round's queries. Its blocks are headed "Required". Absence from truncated snippets is not proof. — [catoid=40 program page](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826)
- [excerpt, reconfirmed] Plain Physics BS: "Select 6 additional Physics credits at the 3500 level and above." — [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337)
- [summary, seen in two separate queries] Plain Physics BS 4-Year Degree Plan (2025–26): "PHYS 4650 is required if PHYS 3700 is not taken, or it may be used as a physics elective." — [Physics BS 4-Year Degree Plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915)
- [summary] The old department core page lists PHYS 3600 Intermediate Electromagnetism as required, plus **"Optics (PHYS 3650) or Thermal Physics (PHYS 3700)"**, from which the student picks one. — [physics.usu.edu/core.html](https://www.physics.usu.edu/core.html)

**Department grade and GPA rules (new)**
- [excerpt] "Students may use no more than one course with the P-D-F option to satisfy a major or minor requirement in Physics. All other courses used to satisfy major or minor requirements must be completed with at least a C- grade, and the total GPA in all required Physics courses must be at least 2.3."
  - Source: a USU catalog Physics department page. The search tool did not say which edition. Candidates: [Physics department, catoid=40](https://usu.catalog.acalog.com/preview_entity.php?catoid=40&ent_oid=4270&returnto=30668); [Physics department, catoid=35](https://catalog.usu.edu/preview_entity.php?catoid=35&ent_oid=3566).

**Official evidence of which courses the emphasis contains: the department assessment plan (new)**
- [excerpt] The "physics department performs longitudinal assessment of learning objectives via five 'touchstone' courses". — [Applied & Professional Emphasis assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/)
- [summary] The five are **PHYS 3870, PHYS 3880, PHYS 3600, PHYS 4600 and PHYS 4900**. Same page.
- [excerpt] At the end of each touchstone course, "faculty members assess each students progress on the physics Learning Objectives using a standardized rubric". Same page.
  - PHYS 3880: "Intermediate proficiency is expected".
  - PHYS 4900: "Advanced proficiency is expected", with "final evaluation of attainment of learning objectives".
- [summary] In the same search, the tool said the Applied Emphasis requirements list PHYS 4700 Quantum Mechanics I. This is weak evidence. — [Applied Emphasis, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298)

**Credit-exclusion rules (new, minor)**
- [summary] "Students cannot receive credit for both MAE 2300 and PHYS 3700." The search tool did not identify the page. Its result set included the [Physics BS 4-Year Degree Plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915) and the [Applied Emphasis, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298).
- [summary] "Students cannot receive credit for both ENGR 2010 and PHYS 3550." This comes from an older-edition Electrical Engineering program page. — [EE – BS, catoid=12](https://catalog.usu.edu/preview_program.php?catoid=12&poid=9419&returnto=25195)

**Historical department requirement list (completes round one's partial capture)**
- [summary] The department's undated core page gives the B.S. with Professional Emphasis as **97 credits** — [physics.usu.edu/core.html](https://www.physics.usu.edu/core.html):
  - Common Requirements: 68 credits
  - Other Physics: 25 credits, made up of:
    - Physics 3650 Optics
    - Physics 3700 Thermal Physics
    - Physics 3750 Wave Phenomena
    - Physics 3880 Intermediate Laboratory II
    - Physics 4550 Advanced Mechanics
    - Physics 4600 Advanced Electromagnetism
    - Physics 4700 Quantum Mechanics I
    - Physics 4710 Quantum Mechanics II
    - Physics 5870 Advanced Laboratory
  - Other Mathematics: 4 credits, MATH 2250

  The plain B.S. is 83 credits. The page also says major requirement sheets "can be obtained from the department". Its numbers 3650, 4550 and 5870 do not appear in any current catalog snippet, so this is a superseded structure.
- [listing] The department also has an "Undergraduate Catalog" page. Not retrieved. — [physics.usu.edu/undercat.htm](http://www.physics.usu.edu/undercat.htm)

### Inferences
- [INF] **Courses with official evidence that they belong to the Professional Emphasis.** The location in the blocks is not known for any of them.
  - From the 2024–25 map: PHYS 2210 or PHYS 2310, PHYS 2215 and MATH 1220 (Year 1 Fall); PHYS 3550, PHYS 3600 and PHYS 3750 (Section 2).
  - From the program page: 4 credits of PHYS 4900, and MATH 2280 as the highest math.
  - From the assessment page for the Applied & Professional emphases: PHYS 3870, PHYS 3880, PHYS 3600, PHYS 4600 and PHYS 4900.
  - The College of Science Sequence.
- [INF] **Strongly implied, but no Professional page shows them:**
  - PHYS 2220/2320 and PHYS 2225: Year 1 Spring's credit pattern includes a 4 and a 1, and round one found PHYS 2220 in the plain BS 28-credit table.
  - PHYS 2710: round one found it in the plain BS 28-credit table, and it is a prerequisite of PHYS 3600, 3700, 3870 and 4650.
  - **CS 1400**: it is a prerequisite of the touchstone course PHYS 3870 (Section 4). It is also one of the College of Science series. A student who picks the CS series (CS 1400 + 1410/1440) covers both.
- [INF] **Probable members of the 26-credit block** (none shown on a current Professional page):
  - PHYS 4700 and PHYS 4710.
  - Both PHYS 3700 and PHYS 4650. The plain BS needs only one of the two; the old department list puts both optics and thermal physics in the Professional track.
  - PHYS 3880 and PHYS 4600 (touchstones).
  - The 4 credits of PHYS 4900. The research note sits directly under the 26-credit heading in the snippets.
- [INF] **Arithmetic hypothesis. Not a record; do not present it as USU's requirement.** One decomposition fits the shared 28-credit block exactly:

  PHYS 2210/2310 (4) + 2215 (1) + 2220/2320 (4) + 2225 (1) + 2710 (3) + 3550 (3) + 3600 (3) + 3750 (3) + 3870 (3) + [3700 or 4650] (3) = **28**

  It agrees with every clue:
  - the plain BS rule "PHYS 4650 if PHYS 3700 not taken"
  - the old core's choice of optics or thermal physics
  - the touchstone list
  - the map placements

  But no source lists it, and it fails if any PHYS 4900 credit sits in the 28-credit block. On this hypothesis, the identified candidates for the 26-credit block account for 19 credits: PHYS 3880, PHYS 4600, PHYS 4700, PHYS 4710, the other of 3700/4650 (3 credits each), plus 4 of PHYS 4900. Adding PHYS 3710 makes 22. That leaves **4–7 credits unexplained**; possible fillers are CS 1400 (4), PHYS 2500 (2), PHYS 4680 Optics II and PHYS 3710.
- [INF] **College of Science Sequence for physics majors.** The physics-specific page seems to offer four series: BIOL, CHEM, CS and GEO. Teaching majors take "the first course of two of the other three series", which implies four in all. A PHYS series would duplicate the major's own PHYS 2210/2220. Not verified.

### Gaps
- The actual course rows of the 28- and 26-credit blocks, in either 2025–26 or 2026–27.
- Whether any "choose" options exist inside the 26-credit block.
- The physics-specific list of eligible science series.
- Whether the 2026–27 page keeps the 28/13/26 headings. The new front end's pages appear in the search index with course links stripped (round one), and no 2026–27 heading text surfaced this round.
- One stray summary said "For the Physics BS, students select 3 additional credits from a PHYS course at the 3000 level and above". It conflicts with the 6-credit/3500-level rule, the search tool did not identify its page, and it may come from the Physics Teaching BS. Unresolved.
- No online copy of the department's "major requirement sheet" was found.

---

## 2. What is the semester-by-semester suggested degree map?

### Takeaway
Only the **2024–2025 (catoid=39)** Professional Emphasis map is partly visible:
- **Semester totals:** 16/15 | 14/15 | 15/16 | 15/15, which sums to 121 credits.
- **Year 1 Fall:** MATH 1220, PHYS 2210 *or* PHYS 2310, PHYS 2215, and 7 more credits that were not seen.
- **Year 3 Fall:** PHYS 3600 and PHYS 3750. PHYS 3550 is on the map, but its term is not pinned. Because it is a prerequisite of PHYS 3600, it must come in Year 2.
- **Year 4 Fall:** two 3-credit courses plus University Studies and elective slots. A separate snippet suggests PHYS 4650, PHYS 4700 and PHYS 4900 in that term.

The 2026–27 map grid on the new front end is invisible to search. The newer listing's "Total Credits: 123" exceeds the 121 of the 2024–25 map.

### Cited Findings
- [summary] Semester totals on the 2024–25 Professional map:
  - Year 1: Fall 16, Spring 15
  - Year 2: Fall 14, Spring 15
  - Year 3: Fall 15, Spring 16
  - Year 4: Fall 15, Spring 15

  These sum to 121 (my arithmetic). The search tool contrasted this with "Total Credits: 123" in the newer catalog listing. Sources: [4 Year Degree Map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [new-format program page](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR).
- [excerpt] **Year 1 Fall (16 credits):** "MATH 1220 - Calculus II (QL) 4 credit(s) PHYS 2210 - Physics for Scientists and Engineers I (BPS/QI) 4 credit(s) or PHYS 2310 - Physics for Scientists I (BPS/QI) 4 credit(s) PHYS 2215 - Physics for Scientists…" The snippet stops there. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- [summary] **Year 1 Spring (15 credits):** the credit values read 3; 4 (or an alternative 4); 1; a 4-credit "College of Science sequence requirement"; and 3. Course names were not visible. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- [summary] **Year 2 Fall (14 credits):** four courses, names not visible. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015). For comparison, Year 2 Fall of the 2025–26 plain Physics BS plan totals 13. — [Physics BS plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915)
- [summary] The search tool quoted "PHYS 3550 - Intermediate Classical Mechanics 3 credit(s)" together with "Year 3 Fall Semester: PHYS 3600 - Electromagnetism I 3 credit(s)". It read both courses as third-year. The quote may be stitched from separate fragments, so PHYS 3550's term is **not pinned**. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- [summary] **Year 3 Fall (15 credits)** lists PHYS 3600 and PHYS 3750. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015). This matches the round-one excerpt "MATH 2250 or MATH 2270 /MATH 2280 must be taken before PHYS 3750, fall of junior year."
- [summary] **Year 3 Spring (16 credits):** course names not visible. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- [summary] **Year 4 Fall (15 credits):** "University Studies and advisor-directed elective slots, plus two 3-credit courses". The course names were cut off. — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- [summary] A separate listing shows "PHYS 4650 - Optics I, PHYS 4700 - Quantum Mechanics I, and PHYS 4900 - Research in Physics" in the fall term of year four. The search tool called it "an older catalog" but did not pin the page. Its " - " format matches the 2024–26 Modern Campus pages, not the colon format of the catoid=38 Applied page. — result set incl. [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015) and [Physics BS plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915)
- [summary] **Year 4 Spring:** not seen for the Professional map. For the plain Physics BS (2025–26), Year 4 Spring is 14 credits: one physics elective at 3500+, "one credit of research registration", and 10 advisor-directed elective credits. — [Physics BS plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915)
- [summary] **Sibling Applied Emphasis (older, catoid=38), for comparison only:**
  - Year 1 Spring: MATH 2210 (3), PHYS 2220 (4), PHYS 2225 (1).
  - Year 2: one term shows "PHYS 2500: Introduction to Computer Methods in Physics 2 PHYS 3550: Intermediate Classical Mechanics 3".
  - Year 3 Fall: PHYS 3600.
  - PHYS 3870, followed by PHYS 3880.
  - Year 4: PHYS 4650 Optics I (3) and PHYS 3700 Thermal Physics (3). One summary puts 3700 in spring, another puts 4650 in fall.

  Source: [Applied Emphasis, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298).
- [listing] The new-format (2026–27) map tab exists, but no grid text was visible. — [suggested-degree-maps-o8Kzv](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR/suggested-degree-maps-o8Kzv)

### Inferences
- [INF] **Skeleton of the 2024–25 Professional map.** Only the cells marked "seen" are recovered; everything else is inferred.

| Term (credits) | Seen | Inferred fill (unverified) |
|---|---|---|
| Y1 Fall (16) | MATH 1220 (4); PHYS 2210 or 2310 (4); PHYS 2215 (1) | 7 credits of general education |
| Y1 Spring (15) | a 4-credit College of Science Sequence course; credit values 3, 4, 1, 3 | MATH 2210 (3); PHYS 2220 or 2320 (4); PHYS 2225 (1); a 3-credit general-education course |
| Y2 Fall (14) | four courses | PHYS 2710; MATH 2270 (or 2250); second sequence course; … |
| Y2 Spring (15) | — | PHYS 3550, which must precede PHYS 3600 (it may instead sit in Y2 Fall); MATH 2280; … |
| Y3 Fall (15) | PHYS 3600; PHYS 3750 | + 9 credits |
| Y3 Spring (16) | — | PHYS 4600 (needs 3600 + 3750); PHYS 3700 and/or 3870 |
| Y4 Fall (15) | two 3-credit courses + University Studies/elective slots | PHYS 4650 + PHYS 4700 + PHYS 4900 (per the unpinned listing) |
| Y4 Spring (15) | — | PHYS 4710; PHYS 3880; PHYS 4900 |

- [INF] The prerequisite chains support these placements. PHYS 3550 needs PHYS 2220/2320, MATH 2210 and MATH 2250/2280, and comes before PHYS 3600, which needs PHYS 3550 and PHYS 2710. PHYS 4600 and PHYS 4700 both need PHYS 3600 and PHYS 3750, so neither can come before Year 3 Spring.
- [INF] The newer listing's 123 credits is probably the sum of a later sample map (2025–26 or 2026–27) whose semester totals were not seen. The 120-credit figure is the degree minimum (Section 3a).

### Gaps
- The full course grid for any edition.
- The 2026–27 map itself.
- Map footnotes, apart from the PHYS 3750 math note and the sample-plan disclaimer.
- Whether the 2026–27 map still offers "PHYS 2210 or PHYS 2310" in Year 1.

---

## 3. Resolving round-one conflicts

### Takeaway
- **Resolved:** the QM numbering (PHYS 4700 = QM I, PHYS 4710 = QM II); Optics I (PHYS 4650 = ECE 4650/6650, no USU PHYS 5650); the PHYS 4900 credit question; the "PHYS 4650 if PHYS 3700 not taken" rule (real, but in the plain BS); the 120/121/123 totals (three different measures).
- **Not resolved:** the "74–76" coursework figure (unconfirmed, possibly a conflation) and the current catalog prerequisites of PHYS 3750.
- **2210/2220 vs 2310/2320:** both series are accepted, but the official reason for having two was not found.

### Cited Findings
**(a) Total credits: 120 vs 123 (and 121)**
- [summary] The degree minimum is 120 credits (round one, catoid=40) — [program page, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826).
- [summary] The 2024–25 sample map's semester totals sum to **121** — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015).
- [summary] A newer listing shows "Total Credits: 123" — [new-format program page](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR).
- [INF] These are not in conflict. 120 is the minimum for the degree; 121 and 123 are sample-plan totals from different editions.

**(b) Program coursework: "74–76" vs 73–75**
- [summary] A search aimed at "74" for this program found no such figure. The only "74" the tool saw was another program's map, Public Health Education, at 74–94 credits — [PUHE_PHEE_BS degree map](https://catalog.usu.edu/programs/PHEE-PUHE-PUHE_PHEE_BS-CONCENTRATION/suggested-degree-maps-o8Kzv). The tool's own arithmetic, 28 + 26 = 54 before the sequence, is consistent with headings alone.
- [INF] Round one's "74–76" is **unconfirmed**. The only total derivable from verified headings is 28 + 13 + 26 + (6–8) = **73–75**. If the 2026–27 page really says 74–76, one block has grown by a credit.

**(c) PHYS 4900: 4 credits (catalog) vs 2 (department page)**
- [excerpt] Professional Emphasis: "A total of 4 credits of PHYS 4900: Research in Physics (CI) is required for the Professional Emphasis." — [catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826)
- [summary] The Applied Emphasis requires 2 credits — [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298). The old department page puts 2 credits in the common core — [core.html](https://www.physics.usu.edu/core.html).
- [summary] The course itself: "Credit Hours Min 1, Credit Hours Max 3", repeat status "R" (repeatable) — [PHYS 4900 course page](https://catalog.usu.edu/courses/PHYS4900).
- [summary] USU policy: a course identified as repeatable in the General Catalog "may be taken more than once for credit". This is probably from [Student Records](https://catalog.usu.edu/pages/jONXSLXwVn877Sg53212), which was in the same result set.
- [INF] **Resolution.** 4 credits is the Professional Emphasis requirement; 2 credits is the Applied and old-common-core figure. Since one enrollment carries at most 3 credits, the 4 credits need at least two enrollments. The plain BS map's "one credit of research registration" in Year 4 Spring suggests 1-credit registrations per term are normal.

**(d) PHYS 2210/2220 vs PHYS 2310/2320**
- [excerpt] The 2024–25 Professional map offers "PHYS 2210 … (BPS/QI) 4 credit(s) **or** PHYS 2310 - Physics for Scientists I (BPS/QI) 4 credit(s)" — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015).
- [summary] The Applied Emphasis lists "PHYS 2210 or PHYS 2310" in the first semester and "PHYS 2220 or PHYS 2320" in the second — [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298).
- [summary] The Physics Teaching BS lists "PHYS 2210 or PHYS 2310" — [Physics Teaching – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40335&returnto=30826).
- **What distinguishes the two series in official text:**
  - [summary] PHYS 2310 "includes activities related to the profession of physics" and lists "Instructor permission" under special approval — [PHYS2310](https://catalog.usu.edu/courses/PHYS2310). Round one's intro notes reported the same two attributes for PHYS 2320 — [PHYS2320](https://catalog.usu.edu/courses/PHYS2320). Both courses probably carry them [INF].
  - [excerpt, round one] PHYS 2210 and 2220 have "lecture and required recitation" and are titled "Physics for Scientists and Engineers".
  - [summary] PHYS 2320 is 4 credits, BPS/QI, and covers waves, electromagnetism, quantum phenomena and relativity, including Maxwell's equations, optics and special relativity — [PHYS2320](https://catalog.usu.edu/courses/PHYS2320).
- [summary, weak] One search summary said an emeritus faculty page lists PHYS 2320 as "Physics for Physics Majors II" — [Farrell Edwards page](https://artsci.usu.edu/physics/directory/adjunct-emeritus/farrell-edwards). A follow-up search for that exact phrase found nothing, so treat it as unconfirmed. Another summary called 2310/2320 "the physics-major version" of 2210/2220; that was the search tool's characterization, not seen USU text.
- [summary] The college-wide College of Science Sequence list names "PHYS 2210 and PHYS 2220" (not 2310/2320) — [College of Science, catoid=40](https://catalog.usu.edu/preview_entity.php?catoid=40&ent_oid=4264).

**(e) QM numbering: PHYS 4700 = QM I and PHYS 4710 = QM II (resolved)**
- [excerpt] "PHYS 4700 - Quantum Mechanics I (3) PHYS 4710 - Quantum Mechanics II (3)" — [USU catalog "Math/Science Elective" list, catoid=35](https://catalog.usu.edu/content.php?catoid=35&navoid=26518)
- [excerpt] PHYS 4700's own catalog page: "PHYS 4700 - Quantum Mechanics I 3 credit(s) This course covers principles of quantum mechanics, operators in Hilbert space, matrix mechanics, angular momentum, spin, perturbation theory, and applications." — [PHYS 4700, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330722)
- [summary] The older catoid=12 listing has "Quantum Mechanics I and II (4700, 4710)" and "Optics I and II (4650, 4680)" — [catoid=12 course descriptions](https://catalog.usu.edu/content.php?catoid=12&filter%5B27%5D=-1&filter%5B29%5D=&filter%5B32%5D=1&filter%5B3%5D=1&filter%5Bcourse_type%5D=-1&filter%5Bcpage%5D=52&filter%5Bitem_type%5D=3&filter%5Bkeyword%5D=&filter%5Bonly_active%5D=1&navoid=3068&print=). The old department page also has "Physics 4700: Quantum Mechanics I, Physics 4710: Quantum Mechanics II" — [core.html](https://www.physics.usu.edu/core.html).
- [3rd-party] **Where the conflicting labels come from.** Coursicle's flattened USU list, as read by the search tool, gives:
  - "Quantum Mechanics I PHYS 4710"
  - "Optics I PHYS 4680 Optics II PHYS 4700"
  - "Physics Colloquium PHYS 5910 Relativity I PHYS 6010"

  The tool itself flagged its parse as uncertain — [Coursicle USU PHYS](https://www.coursicle.com/usu/courses/PHYS/).
- [INF] Each Coursicle title is paired with the *next* code: an off-by-one error from reading the list as "title, code" when it is "code, title". Read code-first, it gives PHYS 4650 Optics I, PHYS 4680 Optics II, PHYS 4700 QM I and PHYS 5910 Relativity I, exactly matching the catalog. Round one's garbled listing ("PHYS 4710 QM I / PHYS 4900 QM II") is the same artifact.

**(f) Optics I: PHYS 4650, not "PHYS 5650" (resolved)**
- [summary, reconfirmed] Optics I is ECE 4650, cross-listed as PHYS 4650 and dual-listed as ECE 6650. It covers the "mathematics of wave motion, electromagnetic theory of light, light propagation, geometrical optics, and superposition of waves" — [ECE 4650, catoid=40](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342752).
- [summary] A search for "PHYS 5650 Optics" across catalog.usu.edu, usu.edu and Coursicle returned **no USU course**. The only PHYS 5650 anywhere in the results was at the University of Lethbridge — [Coursicle, U of Lethbridge](https://www.coursicle.com/ulethca/courses/PHYS/). Round one also found none.
- [summary] The rule "PHYS 4650 is required if PHYS 3700 is not taken, or it may be used as a physics elective" is real. It is on the **plain Physics BS** 2025–26 4-Year Degree Plan — [catoid=40 poid=40915](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915) — and echoes the old core's "Optics or Thermal Physics" choice — [core.html](https://www.physics.usu.edu/core.html). It was **not** seen on any Professional Emphasis page.
- [INF] "PHYS 5650" in the brief is almost certainly an error for PHYS 4650. Optics II is PHYS 4680, with a graduate PHYS 6680 per round one's Coursicle listing.

**(g) PHYS 3750 prerequisites (still unresolved)**
- [summary] The search tool attached "MATH 1220 plus either PHYS 2220 or PHYS 2320" to PHYS 3750. It said it did so because the line sits "just before the course heading" in the 2024–25 expanded listing — [catoid=39 course descriptions](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
- [excerpt, round one] The degree-map rule is "MATH 2250 or MATH 2270 /MATH 2280 must be taken before PHYS 3750" — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015). The 2016 syllabus gives "Phyx 2710, Math 2210; Math 2250 (may be taken concurrently)" — [Riffe syllabus 2016](https://www.physics.usu.edu/riffe/3750/Syllabus%203750%202016.pdf).
- [INF] **The search tool's attribution is doubtful.** In Acalog's expanded course listings the "Prerequisite(s)" line normally *follows* the description. A prerequisite line sitting just before a course heading therefore normally belongs to the course *above* it. Two checks agree with that convention:
  - The "Prerequisite(s): PHYS 2710 …" line just before the PHYS 3710 heading matches the prerequisites the tool separately gave for PHYS 3700, the course above 3710.
  - The string "PHYS 2220 or PHYS 2320; MATH 2210; MATH 2250 or MATH 2280" is not PHYS 3600's own list, which adds PHYS 2710 and PHYS 3550. The tool assigned it to PHYS 3550.

  By the same convention, "MATH 1220 and PHYS 2220 or PHYS 2320", just before the PHYS 3750 heading, most likely belongs to **PHYS 3710**, the course listed above 3750. This rests on a general Acalog convention, not on the live page. The official current prerequisite list for PHYS 3750 was **not** found.

**(h) Correction: PHYS 3550's prerequisites**
- [excerpt] "Prerequisite(s): PHYS 2220 or PHYS 2320; MATH 2210; MATH 2250 or MATH 2280." This is from the 2024–25 listing. The search tool assigned it to PHYS 3550, and it is not PHYS 3600's own list — [catoid=39 course descriptions](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
- [INF] Round one's statement that PHYS 3550 "requires PHYS 2710" is not supported by this string. Treat PHYS 2710 as **not** a listed prerequisite of PHYS 3550 unless the live page shows it.

### Inferences
- [INF] For the Atlas, the QM numbering and the Optics number are settled facts: PHYS 4700/4710 QM I/II, and PHYS 4650 Optics I (= ECE 4650, dual-listed ECE 6650).
- [INF] Treat 2210/2220 and 2310/2320 as interchangeable for progress tracking. If the Atlas mentions the difference, it should say only what is official: 2310/2320 are titled "Physics for Scientists" and need instructor permission; 2210/2220 are titled "Physics for Scientists and Engineers" and include a required recitation.

### Gaps
- PHYS 3750's official 2026–27 prerequisites.
- The source and edition of "74–76".
- An official sentence stating whom PHYS 2310/2320 are for.

---

## 4. Official details of the upper-division PHYS courses (3550, 3600, 3700, 3710, 3750, 3870, 3880, 4600, 4650, 4700, 4710, 4900; plus 2215/2225/2310/2320)

### Takeaway
New official details this round:
- **PHYS 4700:** catalog description and prerequisites (PHYS 3600, PHYS 3750).
- **PHYS 3870:** prerequisites CS 1400 and PHYS 2710 (2710 may be concurrent), changed in Summer 2024.
- **PHYS 3880:** prerequisite PHYS 3870.
- **PHYS 4900:** 1–3 credits per enrollment, repeatable.
- **PHYS 3700:** prerequisites.
- **PHYS 3550:** verbatim description and prerequisites.
- **PHYS 3710:** two catalog descriptions.
- **PHYS 2215 and 2225:** official titles.

PHYS 4710 has an official title and credits only. Official per-course learning objectives and "terms offered" were found for **no** course. Department-level objectives and the assessment design are documented.

### Cited Findings
- **PHYS 2215 / PHYS 2225.** [excerpt] "PHYS 2215 - Physics for Scientists and Engineers Lab I 1" and "PHYS 2225: Physics for Scientists and Engineers Lab II" — [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337); [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298)
- **PHYS 2310.**
  - [excerpt] On the 2024–25 map: "PHYS 2310 - Physics for Scientists I (BPS/QI) 4 credit(s)" — [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015).
  - [excerpt] The new-format page is titled "PHYS2310 - Physics for Scientists I (BPS) - 4 - Credits." — [PHYS2310](https://catalog.usu.edu/courses/PHYS2310).
  - [summary] Special approval: "Instructor permission"; "includes activities related to the profession of physics" — [PHYS2310](https://catalog.usu.edu/courses/PHYS2310).
- **PHYS 3550 Intermediate Classical Mechanics (3).**
  - [excerpt] "Students learn Newtonian mechanics, including dynamics of single and multiple particle systems, conservation laws, harmonic oscillations, central-force motion, rotations, and the two-body problem."
  - Prerequisites: see Section 3(h).
  - Source: [catoid=39 course descriptions](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
  - Round one's "may also include Lagrangian/Hamiltonian…" sentence was not re-seen.
- **PHYS 3600 Electromagnetism I (3).**
  - [excerpt] Reconfirmed topic text: "Topics include the Maxwell equations, Coulomb's and Biot-Savart laws, scalar and vector potentials, boundary conditions, multipole expansions, and energy." — [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
  - [summary] It is one of the five assessment touchstones — [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/).
- **PHYS 3700 Thermal Physics (3).**
  - [summary] A thermodynamics and statistical mechanics course.
  - [summary] Prerequisites: "PHYS 2710 and PHYS 3550, with MATH 2210 or MATH 2250 or MATH 2280". By the layout rule in Section 3(g), the "Prerequisite(s): PHYS 2710…" line before the PHYS 3710 heading belongs to 3700, which is consistent.
  - [summary] No credit for both MAE 2300 and PHYS 3700 (page unpinned, Section 1).
  - Source: [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
- **PHYS 3710 Intermediate Modern Physics (3).** Two catalog descriptions, from different editions that the search tool did not pin:
  - [excerpt] "Introduction to the principles and applications of special and general relativity."
  - [excerpt] "Space-time, relativistic kinematics and dynamics, gravity and geometry, black holes, Big Bang, nuclei, radioactivity, and nuclear reactions." [summary] It also mentions links between cosmology and particle physics.

  Sources: [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1); [catoid=35 listing](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=50).
  - Prerequisite unresolved: "PHYS 2710" by the search tool's reading, or "MATH 1220 and PHYS 2220 or PHYS 2320" by the layout rule (Section 3g).
  - It is a prerequisite of Relativity I (Section 5).
- **PHYS 3750 Foundations of Wave Phenomena (3).** No new official text (Section 3g). [summary] Year 3 Fall on the 2024–25 map.
- **PHYS 3870 Intermediate Physics Laboratory (CI, 3).**
  - [summary] **Prerequisites: CS 1400 and PHYS 2710, with PHYS 2710 allowed concurrently.** The entry notes that "course changes took effect Summer 2024". Not repeatable for credit.
  - [summary] Assessment touchstone — [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/).
  - Source: [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1).
  - This supersedes the 2015 syllabus prerequisites, which included PHYS 2500 (round one).
- **PHYS 3880 Advanced Physics Laboratory (CI, 3).**
  - [summary] "modern experimental physics techniques, with emphasis on student-designed projects". **Prerequisite: PHYS 3870.** Not repeatable. — [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1)
  - [excerpt] Touchstone course with "Intermediate proficiency is expected" — [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/).
- **PHYS 4600 Electromagnetism II (3).** [excerpt, reconfirmed] "PHYS 4600 - Electromagnetism II 3 credit(s)", prerequisites "PHYS 3600 PHYS 3750" — [PHYS 4600, catoid=40](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338889). [summary] Assessment touchstone. It also appears in the Physics MS course list (Section 5).
- **PHYS 4650 Optics I (= ECE 4650; dual ECE 6650) (3).** See Section 3(f). The prerequisites remain round one's [summary]: PHYS 2710; a MATH 2210/2250/2280 course; or ECE 3870 — [ECE 4650, catoid=40](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342752).
- **PHYS 4700 Quantum Mechanics I (3).**
  - [excerpt] The description is in Section 3(e). [summary] **Prerequisites: PHYS 3600 and PHYS 3750** — [PHYS 4700, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330722).
  - [summary] A Fall 2017 course page by C. Torre lists learning objectives under "knowledge, skills, and thinking"; their content was not retrieved — [Physics 4700 Course information, Fall 2017](http://www.physics.usu.edu/torre/4700_Fall_2017/Course_Info.html).
- **PHYS 4710 Quantum Mechanics II (3).**
  - [excerpt] Title and credits only — [Math/Science Elective list, catoid=35](https://catalog.usu.edu/content.php?catoid=35&navoid=26518).
  - [summary] It has a class website in the department's Spring 2021 directory — [Class Websites](https://www.usu.edu/physics/students/class-websites).
  - No description or prerequisite was found.
- **PHYS 4900 Research in Physics (CI), 1–3 credits, repeatable.**
  - [excerpt] "Prior to registration, student must make arrangements with the Physics Department's undergraduate research advisor." — [PHYS4900](https://catalog.usu.edu/courses/PHYS4900)
  - [excerpt] "Written and oral presentations on the outcomes of the project are required." It appeared in a result set containing both the [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/) and the [PHYS4900 course page](https://catalog.usu.edu/courses/PHYS4900).
  - [excerpt] Capstone touchstone: "Advanced proficiency is expected" — [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/)
  - [summary] "CI" is the Communications Intensive designation of USU's University Studies program — [PHYS4900](https://catalog.usu.edu/courses/PHYS4900).
- **Program-level and department-level objectives (new).**
  - [summary] The touchstone objective matrix covers physics knowledge; problem solving and mathematical analysis; laboratory skills; computer skills; research; and communication — [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/).
  - [excerpt] "physics departments throughout the state of Utah have determined a set of learning objectives" (a statewide "tuning" process). Same page.
  - [summary] The catalog's department page lists objectives including knowledge of computer methods in physics, of mathematics to the undergraduate calculus and differential-equations level, of statistics, and of the philosophy of science. It refers to the assessment site for full details — [Physics department, catoid=38](https://catalog.usu.edu/preview_entity.php?catoid=38&ent_oid=3949).
  - [summary] Program purpose, assessment page: the emphasis is "primarily designed to prepare students for continued study in physics, astronomy, materials science, and other related areas of physical science and engineering". Graduates have "strong backgrounds in the fundamentals of physics used in industry or in research at national laboratories" — [physics.usu.edu/teaching/assessment.html](https://www.physics.usu.edu/teaching/assessment.html).

### Inferences
- [INF] **CS 1400 is a de facto requirement** of the Professional Emphasis through PHYS 3870, whether or not it is listed in a block. The Atlas should make its scientific-programming track a prerequisite of the intermediate-lab track.
- [INF] **Typical terms, inferred only from dated instructor pages.** These are not catalog "terms offered":
  - fall: PHYS 3550 (2011, 2013), 3600 (2015), 3750 (2015, 2016), 3870 (2015), 4700 (2017)
  - spring: PHYS 3700 (2015), 3710 (2018, 2020), 3880, 4710 (2021), 6910 (2013, 2015)

  These match the map's placements: PHYS 3600/3750 in Year 3 Fall, PHYS 4700 in Year 4 Fall.
- [INF] Peak's PHYS 3710 page includes "Rudiments of Quantum Mechanics" background notes (round one). That fits, weakly, with a 3710 prerequisite that does not include PHYS 2710.

### Gaps
- Official "course learning objectives" sub-pages: not retrieved for any course. The one known URL pattern is `catalog.usu.edu/courses/PHYS2225/course-learning-objectives-L3FLu`.
- Catalog "terms offered": not found for any course.
- Not found at all: PHYS 4710's description and prerequisites; PHYS 2710's and PHYS 3750's current prerequisites; PHYS 3710's prerequisite. PHYS 4680's credits are not verified.
- The PHYS 2310 vs 2320 attribute assignment (instructor permission and "profession of physics") was seen on different courses in different rounds.

---

## 5. USU electives in general relativity, astrophysics, cosmology, mathematical methods, computational physics, or space/plasma physics (4000–6000 level)

### Takeaway
The key find is an official GR course: **PHYS 5910 / PHYS 6910 Relativity I** (3 credits, dual-listed, prerequisites PHYS 3710 and PHYS 4600). It covers special and general relativity, curved spacetime, the Einstein equations, exact solutions and applications. Its official page seen is the 2024–25 edition.

Other courses found:
- PHYS 6920 Relativity II and PHYS 6930 Quantum Field Theory I (graduate)
- PHYS 6240 Space Environment and Engineering (graduate, 3 credits) and an MS "Upper Atmospheric Physics" specialization
- PHYS 3010 and PHYS 1040, both general education

**None** was found in upper-division astrophysics, cosmology, mathematical methods (beyond PHYS 3750), computational physics (beyond PHYS 2500), or undergraduate space/plasma physics.

### Cited Findings
- [summary] **PHYS 6910 Relativity I, 3 credits** — [PHYS 6910, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749):
  - Covers the "foundations of spacetime physics", including special and general relativity, curved spacetime and the Einstein equations, plus exact solutions and applications.
  - **Dual-listed as PHYS 5910.** Prerequisites PHYS 3710 and PHYS 4600.
  - "Graduate (6000-level) sections require additional assignments".
  - A second query reconfirmed the dual listing, and older listings show "PHYS 5910" titled "Relativity I" — [catoid=12 listing](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=52).
- [summary] PHYS 6920 (Relativity II) and PHYS 6930 (Quantum Field Theory I) appear in USU catalog course listings; their descriptions were not retrieved. No 5000-level Relativity II (e.g., "PHYS 5920") was confirmed. The listing page was not pinned; candidates are the [catoid=35 listing](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=50) and the [catoid=12 listing](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=52).
- [summary] Charles Torre's faculty page lists General Relativity among his teaching interests. It shows PHYS 6910 (Relativity) in Spring 2013 and Relativity I in Spring 2015 — [Charles Torre, USU Physics](https://physics.usu.edu/people/faculty-logan/charles-torre).
- [listing] Torre also has a graduate QM open courseware item, "PHYS 6210 - Quantum Mechanics, Spring 2007" — [DigitalCommons@USU](https://digitalcommons.usu.edu/ocw_phys/1/).
- **Space physics:**
  - [excerpt] Physics MS: "In consultation with his or her advisor, the student selects a minimum of 18 credits of classwork from the following courses: PHYS 4600 - Electromagnetism II 3 credit(s) PHYS 6240 - Space Environment and Engineering 3 credit(s)…" The edition was not pinned — [Physics – MS, catoid=39](https://usu.catalog.acalog.com/preview_program.php?catoid=39&poid=39043) or [catoid=35](https://catalog.usu.edu/preview_program.php?catoid=35&poid=33918&returnto=28333).
  - [summary] The MS has a Plan A "Upper Atmospheric Physics" specialization. It "was created for the Air Force and may not be available for all students"; three to six further credits may come from electrical engineering, computer science, mathematics and biometeorology — [Physics – MS, catoid=35](https://catalog.usu.edu/preview_program.php?catoid=35&poid=33918&returnto=28333).
  - No undergraduate space or plasma course was found.
- **Astronomy:**
  - [summary] PHYS 1040 Introductory Astronomy (BPS), 3 credits — [PHYS 1040, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330681); [PHYS1040](https://catalog.usu.edu/courses/PHYS1040).
  - [summary] PHYS 3010 Space Exploration from Earth to the Solar System (DSC/QI), 3 credits; a general-education depth course — [PHYS 3010, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330702).
  - [summary] No upper-division astrophysics, stars-and-galaxies or cosmology course turned up.
  - [summary] The department's "Fields, Astrophysics, and Spacetime Theory" research group works on topics including black-hole astrophysics. The search tool did not pin the page; the most likely source is the [Physics department page, catoid=35](https://catalog.usu.edu/preview_entity.php?catoid=35&ent_oid=3566).
- [summary] **Course-numbering policy** — [Overview of Course Numbering System](https://catalog.usu.edu/pages/jXYCHxurOSKR5Vy76v5m):
  - 5000–5999 "Advanced Upper Division Courses" serve extension beyond bachelor's requirements, preparation for a graduate degree, or both.
  - 6000–7999 graduate courses are restricted to graduate students.
  - A 5000-level course may run alongside a 6000-level section with the same instructor.

### Inferences
- [INF] **PHYS 5910 Relativity I is the official USU anchor for the Atlas's GR track.** Its prerequisite chain is PHYS 3710 + PHYS 4600, where 4600 requires PHYS 3600 + 3750. It is an elective for undergraduates (5000-level), not a Professional Emphasis requirement. Its 2026–27 active status was not seen, but it is present in the 2024–25 catalog.
- [INF] Cosmology appears in USU's official catalog only inside PHYS 3710 (Big Bang; cosmology–particle links) and in GR courses. The Atlas should label any standalone cosmology or astrophysics module "beyond USU's catalog".
- [INF] Graduate courses (6000+) are closed to undergraduates under the numbering policy. Only 5000-level dual listings such as PHYS 5910 are realistic undergraduate electives.

### Gaps
- Not found:
  - descriptions of PHYS 6920 and 6930, and whether 5000-level twins exist
  - a description of PHYS 6240
  - any USU course in mathematical methods, computational physics, plasma physics or astrophysics (4000–6000 level)
- Whether PHYS 5910 is active and offered in 2026–27.

---

## 6. Is the catalog currently displayed by catalog.usu.edu the 2026–2027 edition?

### Takeaway
**Very probably yes.**
- The new front end hosts a "2026-2027 Academic Calendar", Fall 2026 and Spring 2027 registration calendars, and 2026–27 tuition estimates.
- Its "Archived Catalogs" page lists **2025–2026** and **2024–2025** as archived editions.
- **Edition mapping now evidenced:** catoid=39 = 2024–2025 and catoid=40 = 2025–2026.

The Physics program page's own year label was still not seen.

### Cited Findings
- [summary] The new front end has a "2026-2027 Academic Calendar": Fall 2026 classes August 31 – December 11; Spring 2027 classes January 11 – April 27. — [2026-2027 Academic Calendar](https://catalog.usu.edu/pages/BE3eydcZFJn50bDP0zEQ). Also [Spring Semester 2027 Registration Calendar](https://catalog.usu.edu/pages/aFFbYl56bQLgQyeXCEJ1), [Fall Semester 2026 Registration Calendar](https://catalog.usu.edu/pages/c0AX76qC6T5h7kQJ8lZb) and [Tuition, Fees, and Refunds](https://catalog.usu.edu/pages/SQftPSs2oFWjW6XABGSd) (2026–27 estimates).
- [summary] The catalog home describes itself as "the official source of information for USU's academic programs and courses" — [catalog.usu.edu](https://catalog.usu.edu/).
- [summary] The new front end's "Archived Catalogs" page lists the "2025-2026 USU General Catalog" and the "2024-2025 USU General Catalog", plus earlier years back to 2019–2020 — [Archived Catalogs](https://catalog.usu.edu/pages/qkt6LJxwcPkbFi9EsnMB). Older archive views: [catoid=39 archived catalogs](https://catalog.usu.edu/content.php?catoid=39&navoid=30299), [catalog list](https://catalog.usu.edu/misc/catalog_list.php?catoid=39).
- [listing] catoid=39 contains a "2024-2025 Academic Calendar" — [catoid=39 navoid=30439](https://usu.catalog.acalog.com/content.php?catoid=39&navoid=30439). [summary] Its pages are labelled as archived.
- [summary] The search tool identified the catoid=40 Physics BS 4-Year Degree Plan as part of the "2025-2026 General Catalog" — [catoid=40 poid=40915](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915). One catoid=40 page, crawled earlier, was marked "Under Revision: Information not finalized until official publication".

### Inferences
- [INF, strong] The new front end (`/programs/…`, `/courses/…`, `/pages/…`) is the live 2026–2027 catalog. Every Acalog-derived requirement text in round one and this round is therefore **2025–26 (catoid=40) or older**, not 2026–27.
- [INF] Two 2026–27 continuity signals from the new front end's link-stripped snippets: "A total of 4 credits of [course] is required for the Professional Emphasis" and "The highest math requirement for this degree is [course]" (round one, math researcher). The 4-credit research rule and the MATH 2280 ceiling very probably persist in 2026–27.
- [INF] catoid=38 is probably 2023–24, and catoid=35 and 12 are older. Not verified.

### Gaps
- The year label on the Physics: Professional Emphasis page itself.
- A line-by-line 2026–27 vs 2025–26 comparison, which needs the live page.

---

## 7. Consolidated "best current record": requirement structure and every PHYS course

### Takeaway
Use these tables as the record for The Physics Atlas.

**Evidence levels:**
- **A** — official USU text seen as a quoted snippet.
- **B** — official USU page, search-tool paraphrase.
- **C** — page title or listing only, or third-party corroboration.
- **D** — inference. Never present D as an official requirement.

**Editions:** 24–25 = catoid=39; 25–26 = catoid=40; 26–27 = new front end; "old" = catoid 38/35/12 or undated department pages.

### Cited Findings

**Table A. Requirement structure**

| Component | Best current record | Evidence (edition) | Sources |
|---|---|---|---|
| Purpose | Prepares students "who wish to establish careers in research to enter graduate-level education studying physics, astronomy, materials science, applied mathematics, and other related areas" | A (25–26) | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| Admission | Calculus I (MATH 1210 or AP Calculus AB 4–5) for any USU physics program; transfer students need a 2.2 GPA | B (round one) | [usu.edu degree page](https://www.usu.edu/degrees-majors/physics_bs_ba); [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| Degree minimum | 120 credits; 30 at USU; 40 upper-division | B (25–26, round one) | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| Sample-plan total | 121 (2024–25 map: 16/15/14/15/15/16/15/15); "Total Credits: 123" on a newer listing | B; the sum is arithmetic (24–25 / newer) | [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [new-format program](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR) |
| Program coursework total | 73–75 = 28 + 13 + 26 + (6–8); "74–76" unconfirmed | D | Section 3(b) |
| Major Requirements | **28 credits**, every course C- or better; heading shared with the plain BS; rows **not recovered**. PHYS 2220 and PHYS 2710 appear in the plain BS 28-credit table (round one, A). The one exact-fit decomposition is in Section 1, Inferences | Heading A (25–26); rows D | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826); [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337) |
| Professional Emphasis Math Requirements | **13 credits**, C- or better. Credit values 4/3/3/3, which match MATH 1220 (4), 2210 (3), 2270 (3), 2280 (3). MATH 2250 is accepted in place of 2270/2280 before PHYS 3750. Highest math is MATH 2280. The plain BS has its own 13-credit math block | Heading A; contents B/D (25–26; 24–25 map) | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826); [map, catoid=39](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015) |
| Professional Emphasis Additional Required Courses | **26 credits**, C- or better; rows **not recovered**. Candidates in Section 1, Inferences | Heading A (25–26); rows D | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| PHYS 4900 research | **4 credits total** of PHYS 4900 (CI). The course is 1–3 credits per enrollment and repeatable, so at least two enrollments. Applied Emphasis and the old common core: 2 credits | A (25–26); 26–27 link-stripped echo B | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826); [PHYS4900](https://catalog.usu.edu/courses/PHYS4900) |
| College of Science Sequence | **6–8 credits; one full series.** College list: BIOL 1610/1620; CHEM 1210/1220; CS 1400 + 1410 or 1440; GEO 1110/1115/3200 (older: GEO 2200); PHYS 2110/2120; PHYS 2210/2220. For physics majors, probably one of BIOL, CHEM, CS or GEO (D) | B (25–26 + old) | [College of Science, catoid=40](https://catalog.usu.edu/preview_entity.php?catoid=40&ent_oid=4264); [PHYX sequence, catoid=38](https://catalog.usu.edu/content.php?catoid=38&navoid=29079) |
| Physics electives / choose-lists | **None found** for this emphasis. The plain BS has "Select 6 additional Physics credits at the 3500 level and above" and "PHYS 4650 required if PHYS 3700 not taken" | B (25–26) | [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337); [BS plan, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40915) |
| Grade and GPA rules | C- or better in all major and emphasis courses (A, 25–26). At most one P-D-F course toward major requirements; 2.3 GPA in all required physics courses (A, department page, edition unpinned) | A | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826); [Physics dept, catoid=40](https://usu.catalog.acalog.com/preview_entity.php?catoid=40&ent_oid=4270&returnto=30668) |
| General education | University-wide requirements, plus 2 credits each of approved 3000+ DHA and DSS depth courses | B (round one) | [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| De facto extra prerequisite | CS 1400 is a prerequisite of PHYS 3870 (since Summer 2024) | B (24–25) | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1) |
| Assessment touchstones | PHYS 3600, 3870, 3880, 4600, 4900, rubric-assessed for the Applied and Professional emphases | B/A (undated department page) | [assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/) |

**Table B. PHYS courses**

"Role" = where the course demonstrably sits in the Professional Emphasis.

| Course | Official title (attributes) | Cr | Best-record prerequisites | Role in the Professional Emphasis | Evidence (edition) | Sources |
|---|---|---|---|---|---|---|
| PHYS 2210 | Physics for Scientists and Engineers I (BPS/QI); lecture + required recitation | 4 | Not captured | Year 1 Fall, "2210 **or** 2310" | A (24–25 map; course page) | [map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [PHYS2210](https://catalog.usu.edu/courses/PHYS2210) |
| PHYS 2310 | Physics for Scientists I (BPS/QI on the 24–25 map; "(BPS)" in the new-format title); "includes activities related to the profession of physics" | 4 | Special approval: instructor permission | Year 1 Fall alternative to 2210 | A (map) / B | [map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [PHYS2310](https://catalog.usu.edu/courses/PHYS2310) |
| PHYS 2215 | Physics for Scientists and Engineers Lab I | 1 | — (serves 2210 and 2310) | Year 1 Fall | A (24–25; 25–26) | [map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [PHYS2215](https://catalog.usu.edu/courses/PHYS2215) |
| PHYS 2220 | Physics for Scientists and Engineers II (BPS/QI); lecture + required recitation | 4 | "MATH 1220 and PHYS 2210 or PHYS 2310" (round one; attribution uncertain) | In the plain-BS 28-credit table; Year 1 Spring by credit pattern (D) | A (plain BS) / D | [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337); [PHYS2220](https://catalog.usu.edu/courses/PHYS2220) |
| PHYS 2320 | Physics for Scientists II (BPS/QI) | 4 | Instructor permission (round one) | Accepted alternative to 2220 in sibling programs; probable here | B | [PHYS2320](https://catalog.usu.edu/courses/PHYS2320); [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298) |
| PHYS 2225 | Physics for Scientists and Engineers Lab II | 1 | — | Probable Year 1 Spring (D) | A (title) / D | [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298); [PHYS2225](https://catalog.usu.edu/courses/PHYS2225) |
| PHYS 2500 | Introduction to Computer Methods in Physics | 2 | — | Not shown for this emphasis (Applied: Year 2); no longer a 3870 prerequisite | A (old) | [Applied, catoid=38](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298) |
| PHYS 2710 | Introductory Modern Physics | 3 | Not confirmed | In the plain-BS 28-credit table; prerequisite of 3600, 3700, 3870, 4650, so de facto required | A (plain BS) / D | [Physics – BS, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40337) |
| PHYS 3550 | Intermediate Classical Mechanics | 3 | PHYS 2220 or 2320; MATH 2210; MATH 2250 or 2280 (assigned to 3550 by the search tool; PHYS 2710 is not in it) | On the 24–25 map, term not pinned; Year 2, since it is a prerequisite of Year 3 Fall PHYS 3600 (D) | A (24–25) | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1); [map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015) |
| PHYS 3600 | Electromagnetism I | 3 | PHYS 2710; PHYS 3550; MATH 2210; MATH 2250 or 2280 | Year 3 Fall; touchstone | A/B (24–25) | [PHYS 3600, catoid=39](https://usu.catalog.acalog.com/preview_course_nopop.php?catoid=39&coid=330709); [assessment](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/) |
| PHYS 3700 | Thermal Physics | 3 | PHYS 2710 and PHYS 3550, with MATH 2210 or 2250 or 2280; no credit for both 3700 and MAE 2300 | Probable (D). Plain BS: 3700 **or** 4650 | B (24–25) | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1) |
| PHYS 3710 | Intermediate Modern Physics ("principles and applications of special and general relativity"; another edition adds gravity and geometry, black holes, Big Bang, nuclei) | 3 | **Unresolved**: PHYS 2710, or MATH 1220 + PHYS 2220/2320 | Not shown in this emphasis; prerequisite of Relativity I | A (description) / D | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1) |
| PHYS 3750 | Foundations of Wave Phenomena | 3 | Catalog list **not found**. Map: MATH 2250 or 2270/2280 first. 2016 syllabus: PHYS 2710, MATH 2210, MATH 2250 (concurrent allowed) | Year 3 Fall | A (map rule) / B | [map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [Riffe 2016](https://www.physics.usu.edu/riffe/3750/Syllabus%203750%202016.pdf) |
| PHYS 3870 | Intermediate Physics Laboratory (CI) | 3 | **CS 1400; PHYS 2710 (may be concurrent)**; changes effective Summer 2024; not repeatable | Touchstone | A (title) / B (24–25) | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1); [assessment](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/) |
| PHYS 3880 | Advanced Physics Laboratory (CI): student-designed projects | 3 | **PHYS 3870**; not repeatable | Touchstone ("Intermediate proficiency is expected") | B/A (24–25) | [catoid=39 listing](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1); [assessment](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/) |
| PHYS 4600 | Electromagnetism II | 3 | PHYS 3600; PHYS 3750 | Touchstone | A (25–26) | [PHYS 4600, catoid=40](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338889) |
| PHYS 4650 (= ECE 4650; dual ECE 6650) | Optics I | 3 | PHYS 2710; MATH 2210/2250/2280 or ECE 3870 (round one) | Probable Year 4 Fall (unpinned listing). Plain BS: required if 3700 not taken | B (25–26) | [ECE 4650, catoid=40](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342752) |
| PHYS 4680 | Optics II | 3 (unverified) | — | Not shown for this emphasis | B / C (old) | [catoid=12 listing](https://catalog.usu.edu/content.php?catoid=12&filter%5B27%5D=-1&filter%5B29%5D=&filter%5B32%5D=1&filter%5B3%5D=1&filter%5Bcourse_type%5D=-1&filter%5Bcpage%5D=52&filter%5Bitem_type%5D=3&filter%5Bkeyword%5D=&filter%5Bonly_active%5D=1&navoid=3068&print=) |
| PHYS 4700 | Quantum Mechanics I (operators in Hilbert space, matrix mechanics, angular momentum, spin, perturbation theory, applications) | 3 | **PHYS 3600; PHYS 3750** | Probable Year 4 Fall (unpinned listing) | A (description) / B (prerequisites) (24–25) | [PHYS 4700, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330722) |
| PHYS 4710 | Quantum Mechanics II | 3 | **Not found** | Probable (D) | A (title, old) | [catoid=35 list](https://catalog.usu.edu/content.php?catoid=35&navoid=26518) |
| PHYS 4900 | Research in Physics (CI): capstone with a faculty mentor; written and oral presentation | 1–3 per enrollment, repeatable | Prior arrangement with the department's undergraduate research advisor | **4 credits required**; touchstone ("Advanced proficiency is expected") | A (25–26) | [PHYS4900](https://catalog.usu.edu/courses/PHYS4900); [program, catoid=40](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) |
| PHYS 5910 / 6910 | Relativity I (special and general relativity, curved spacetime, Einstein equations, exact solutions) | 3 | PHYS 3710; PHYS 4600 | Elective candidate only (not a requirement) | B (24–25) | [PHYS 6910, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749) |
| PHYS 6920 / 6930 | Relativity II / Quantum Field Theory I | — | — | Graduate only | B (listing) | [catoid=35 listing](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=50) |
| PHYS 6240 | Space Environment and Engineering | 3 | — | Graduate only (MS course list) | A (24–25) | [Physics – MS, catoid=39](https://usu.catalog.acalog.com/preview_program.php?catoid=39&poid=39043) |
| PHYS 3010 | Space Exploration from Earth to the Solar System (DSC/QI) | 3 | — | General-education depth course, not a major course | B (24–25) | [PHYS 3010, catoid=39](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330702) |
| PHYS 1040 | Introductory Astronomy (BPS) | 3 | — | General education | B | [PHYS1040](https://catalog.usu.edu/courses/PHYS1040) |
| PHYS 2110 / 2120 | (algebra-based series; title not captured) | — | — | A College of Science Sequence option college-wide; not for physics majors (D) | B | [College of Science, catoid=40](https://catalog.usu.edu/preview_entity.php?catoid=40&ent_oid=4264) |
| "PHYS 5650" | **No such USU course found** (the only PHYS 5650 found is at the University of Lethbridge) | — | — | Error in the brief: use PHYS 4650 | B (negative search) | [Coursicle, U of Lethbridge](https://www.coursicle.com/ulethca/courses/PHYS/) |

### Inferences
- [INF] **Labelling in the Atlas.** Present the Professional Emphasis as:
  1. **Verified blocks:** 28 / 13 / 26 credits, 4 credits of PHYS 4900, the College of Science Sequence, and the C-, P-D-F and 2.3-GPA rules.
  2. **Verified members:** the courses evidenced in Table B at level A or B.
  3. **Reconstructed fill**, explicitly labelled as such: 2220/2320 + 2225, 2710, 3700, 4650, 4700, 4710 and CS 1400.
- [INF] The only official GR course is PHYS 5910/6910 Relativity I. The Atlas's GR specialization should map its capstone to it and mark everything beyond it as supplementary.

### Gaps
- **Still missing:**
  - the course rows of the 28- and 26-credit blocks
  - the full degree-map grid, in both the 2024–25 and 2026–27 versions
  - catalog prerequisites for PHYS 2710, 3710, 3750 and 4710
  - PHYS 4710's description
  - per-course learning objectives and terms offered
- **Fastest fixes:**
  - allow `catalog.usu.edu` (and ideally `artsci.usu.edu` and `physics.usu.edu`) through the environment's egress policy, then render the requirements and degree-map tabs with Playwright; or
  - have the user paste the text of the two tabs, or a PDF export of them, from [program-requirements-3JzXU](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR/program-requirements-3JzXU) and [suggested-degree-maps-o8Kzv](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR/suggested-degree-maps-o8Kzv).

  Search snippets will not yield the rows: across both rounds, more than 30 targeted queries returned only headings.
