# Experimental Physics, Research Skills and Scientific Computing for The Physics Atlas (USU PHYS 3870/3880, PHYS 4900, CS 1400, and computational physics)

How to read the evidence tags used throughout:
- **[USU-verified]**: a fact about USU taken from a usu.edu page. These pages could only be read through search-engine summaries, because the session's egress proxy blocked usu.edu with a 403. Treat the wording as a paraphrase, not a quote.
- **[primary-verified]**: read in this session from the primary source itself, either a GitHub-hosted repository or documentation, or the docstrings of installed packages (NumPy 2.5.4, SciPy 1.18.1, SymPy 1.14.0, Matplotlib 3.11.2).
- **[computed]**: calculated in this session from CODATA 2022 constants (via `scipy.constants`) or from public data files. Each one can be reproduced from the formula given next to it.
- **[not re-fetched]**: standard reference material cited from the canonical document. It could not be re-opened this session, so the report writer should treat it as reliable but unverified here.

## 1. Experimental physics content: module tree, problem archetypes, misconceptions

### Takeaway
The skills content of an experimental-physics curriculum is standard and stable. It runs: measurement → GUM-style uncertainty (Type A/B) → statistics and distributions → propagation (analytic and Monte Carlo) → least-squares fitting with χ² and residuals → calibration → noise and signal processing → DAQ (Nyquist, ADC, lock-in) → design → communication. AAPT's 2014 lab guidelines frame the goals as six *practices*, not as physics content. So the virtual lab should teach practices, using simulated instruments whose noise and systematics are realistic enough that χ², residuals and uncertainty budgets actually decide the outcome.

### Cited Findings
- AAPT's 2014 "Recommendations for the Undergraduate Physics Laboratory Curriculum" sets six focus areas: (1) constructing knowledge (using data to draw conclusions about the physical world); (2) modeling, with models treated as abstract representations of physical *and measurement* systems that have limitations and approximations; (3) designing experiments, including developing, evaluating and troubleshooting experiments that test models; (4) developing technical and practical laboratory skills, such as using oscilloscopes; (5) analyzing and visualizing data, meaning statistical and graphical methods for data and their uncertainties; (6) communicating physics, meaning argumentation from evidence and synthesizing methods and outcomes for broad audiences. The AAPT Executive Board endorsed it on 10 Nov 2014, and it is meant for both introductory and beyond-first-year labs. — [AAPT guidelines PDF (Ohio Univ. copy)](https://cas-web-lp001.phy.ohio.edu/~rochej/advanced_lab_doc/LabGuidlinesDocument_EBendorsed_nov10.pdf); [Smith & Holmes, "Operationalizing the AAPT Learning Goals for the Lab", arXiv:1809.00059](https://arxiv.org/pdf/1809.00059); [APS News Back Page, May 2018](https://www.aps.org/apsnews/2018/05/the-back-page) (all via search summary)
- None of the AAPT lab outcomes targets students' conceptual understanding of physics content. — [arXiv:1809.00059](https://arxiv.org/pdf/1809.00059) / [APS Back Page](https://www.aps.org/apsnews/2018/05/the-back-page) (via search summary)
- Research-based instruments and course designs exist for lab-skills learning. These include the Physics Lab Inventory of Critical thinking (PLIC) and the "Design, Analysis, Tools, and Apprenticeship (DATA) Lab" model. — [PLIC paper (Cornell)](https://cperl.lassp.cornell.edu/sites/cperl/files/publications/170719_PLIC.pdf); [DATA Lab, arXiv:1904.01713](https://ar5iv.labs.arxiv.org/html/1904.01713); [Holmes, AAPT New Faculty Workshop slides](https://aapt.org/Conferences/newfaculty/upload/Holmes_Using-physics-labs-to-teach-experimentation-and-critical-thinking.pdf) (existence and titles via search; contents not retrieved)
- GUM vocabulary [not re-fetched]. A Type A evaluation of standard uncertainty is a "method of evaluation of uncertainty by the statistical analysis of series of observations". A Type B evaluation uses "means other than the statistical analysis of series of observations", such as specifications, calibration certificates, resolution or prior data. Combined standard uncertainty is formed by the law of propagation of uncertainty, and expanded uncertainty is U = k·u_c with coverage factor k (typically 2). — [JCGM 100:2008 (GUM)](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf); [NIST TN 1297](https://www.nist.gov/pml/nist-technical-note-1297)
- JCGM 101:2008 (GUM Supplement 1) sets out the Monte Carlo "propagation of distributions" as the reference method when linearization is inadequate [not re-fetched]. — [JCGM 101:2008](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)
- SciPy's `curve_fit` docstring [primary-verified, SciPy 1.18.1]: "If False (default), only the relative magnitudes of the `sigma` values matter… `pcov(absolute_sigma=False) = pcov(absolute_sigma=True) * chisq(popt)/(M-N)`." The default therefore rescales the parameter covariance to force reduced χ² = 1. — [scipy.optimize.curve_fit](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html)
- NumPy's `polyfit` docstring [primary-verified, NumPy 2.5.4]: by default, "the covariance are scaled by chi2/dof … This scaling is omitted if `cov='unscaled'`, as is relevant for the case that the weights are w = 1/sigma, with sigma known to be a reliable estimate of the uncertainty." Note that the weight argument is 1/σ, not 1/σ². — [numpy.polyfit](https://numpy.org/doc/stable/reference/generated/numpy.polyfit.html)
- `scipy.odr`, the usual tool for fits with x- and y-errors, is deprecated [primary-verified]. Importing it in SciPy 1.18.1 warns: "`scipy.odr` is deprecated as of version 1.17.0 and will be removed in SciPy 1.19.0. Please use https://pypi.org/project/odrpack/ instead." — [scipy.odr](https://docs.scipy.org/doc/scipy/reference/odr.html)
- `np.std` defaults to ddof=0 (population formula). For x = [1, 2, 3, 4] it returns 1.1180, while `np.std(x, ddof=1)` and `statistics.stdev` both return 1.2910 [primary-verified/computed]. — [numpy.std](https://numpy.org/doc/stable/reference/generated/numpy.std.html)
- `scipy.constants` ships the 2022 CODATA recommended values [primary-verified]. — [scipy.constants](https://docs.scipy.org/doc/scipy/reference/constants.html); [NIST CODATA](https://physics.nist.gov/cuu/Constants/)
- Standard texts and the topic maps they support [not re-fetched]: Taylor, *An Introduction to Error Analysis* (Part I: reporting uncertainties, propagation, statistical analysis, normal distribution, rejection of data, weighted averages; Part II: least squares, covariance/correlation, binomial, Poisson, χ² test). Bevington & Robinson, *Data Reduction and Error Analysis* (distributions, Monte Carlo, linear, polynomial and arbitrary-function least squares, maximum likelihood, testing the fit). Hughes & Hase, *Measurements and their Uncertainties* (error propagation, least-squares fitting of complex functions, computer minimisation and the error matrix, hypothesis testing). — [Taylor (University Science Books)](https://uscibooks.aip.org/); [Bevington & Robinson (McGraw-Hill)](https://www.mheducation.com/); [Hughes & Hase (OUP)](https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334)

### Inferences

#### Module tree, track (a) Virtual Experimental Physics. Each module is 2–5 lessons in the house format.
- **A0 Lab mindset and notebook.** Every number carries a unit and an uncertainty. Dated notebook entries record raw data, settings and sketches. The model of a measurement covers the measurand, the instrument and the environment.
- **A1 Measurement basics.** Resolution vs precision vs accuracy (target diagram plus a simulated biased/unbiased instrument). Reading analog scales, verniers and digital displays. Reading instrument specs such as "±(0.5 % of reading + 2 digits)". Significant figures as a *reporting convention*: uncertainty to 1–2 significant figures, value rounded to the same decimal place.
- **A2 Standard uncertainty (GUM).** Type A vs Type B. Rectangular distribution u = a/√3, triangular u = a/√6. Uncertainty budget tables. Combined standard uncertainty, coverage factor and expanded uncertainty. (Advanced: effective degrees of freedom.)
- **A3 Descriptive statistics.** Mean, SD (N−1), standard error σ/√N, and when to use which. Histograms and bin choice. A central limit theorem demonstration. Student-t for small N.
- **A4 Distributions.** Gaussian, uniform, binomial, Poisson (√N for counts, rates, background subtraction, dead time), exponential waiting times, χ² distribution. Lorentzian/Cauchy lineshapes (no defined mean).
- **A5 Error propagation.** The partial-derivative formula. Independent vs correlated inputs (covariance term). Fractional-error shortcuts for products and powers. The logarithmic-derivative trick. Monte Carlo propagation (JCGM 101 idea) and when linearization fails: large relative errors, ratios of noisy quantities, functions with curvature. Identifying the dominant term ("error-budget pie").
- **A6 Comparing results and hypothesis tests.** Discrepancy significance |A−B|/√(u_A²+u_B²). Weighted mean and its uncertainty. Internal vs external consistency (Birge ratio). Null hypothesis, p-value, Type I/II errors. χ² test of a distribution. (Advanced: the look-elsewhere effect, linked to the GW and particle-physics projects.) Outlier rejection is taught critically: Chauvenet's criterion as history, robust statistics as practice.
- **A7 Least squares.** Unweighted straight line (closed form), weighted (1/σ²), parameter covariance and slope–intercept correlation (and centering x to remove it). General linear models through the design matrix (`np.linalg.lstsq`). Linearization traps, where a log transform requires transforming the errors. Nonlinear least squares (Levenberg–Marquardt via `curve_fit`/`least_squares`), initial guesses, bounds and local minima. χ², reduced χ², goodness-of-fit p-value. Covariance errors vs Δχ² = 1 contours. `absolute_sigma` semantics. x- and y-errors (effective variance; ODR via `odrpack`). Poisson-likelihood fits at low counts vs biased Neyman χ². Model comparison (F-test, AIC/BIC).
- **A8 Residual analysis.** Residual and normalized-residual plots, runs and autocorrelation (lag plot, Durbin–Watson), Q–Q plot, heteroscedasticity, leverage. Structure in the residuals means the model is wrong.
- **A9 Calibration.** Calibration curves against standards. Gain/offset/nonlinearity. Inverse prediction with uncertainty, including the fit covariance. Traceability chain. Drift and recalibration. Zero and background subtraction. Energy calibration of a gamma spectrometer from known lines.
- **A10 Noise and signal processing.** Sources: Johnson (4kTRΔf), shot (2qIΔf), 1/f, quantization, 60 Hz pickup (US mains), vibration, thermal drift. SNR in amplitude and power (dB). Averaging (√N for white noise, failure for 1/f; Allan deviation). Filters: moving average, single-pole RC, Butterworth, zero-phase `filtfilt`, notch. FFT, PSD/ASD (Welch), windows and leakage. Whitening and matched filtering (bridge to GW150914).
- **A11 Instrumentation and DAQ.** Transducers, loading and input impedance, grounding, ground loops and shielding. Oscilloscope bandwidth, triggering, 10× probes. Sampling theorem, Nyquist frequency, aliasing (anti-alias filtering must come *before* the ADC). ADC range, LSB, quantization noise LSB/√12, ideal SNR = 6.02N + 1.76 dB, ENOB, dynamic range. Counters, discriminators, coincidence, dead time. Lock-in detection: reference, mixing, low-pass, time constant, ENBW, phase, harmonics. Boxcar averaging.
- **A12 Experimental design.** Question and hypothesis, variables and controls. Choosing range and spacing for leverage on the target parameter (σ_slope ∝ 1/(√N·σ_x)). Randomizing order to decorrelate drift. Replication and pilot runs. Writing an uncertainty budget *before* taking data. Systematic checks: reverse polarity, swap detectors, vary nuisance parameters. Blinding and stopping rules.
- **A13 Scientific communication.** Notebook to report: title; abstract (purpose, method, result with uncertainty, comparison, conclusion); theory; methods; results (figures with error bars and a residual panel; tables); discussion (significance of the discrepancy; systematics); conclusion. Figure craft: units, labels, legends, colour-blind-safe palettes. Number formats "9.79 ± 0.03 m s⁻²" and "9.794(28)". Citing, peer review, posters and talks.

#### Problem archetypes (practice problems and checkpoints). Auto-graded unless noted.
1. **Read the instrument.** A rendered vernier, meter or scope trace; report value ± Type B u. Grading: tolerance on value; u within an accepted band.
2. **Classify sources** as Type A/B and random/systematic (drag-and-drop).
3. **Repeat-measurement statistics** on a seeded dataset: mean, SD, SEM (numeric tolerance).
4. **Formatting/significant figures**: the student string is parsed and the rounding rule checked.
5. **Analytic propagation**: enter a formula (graded by SymPy equivalence) and then a number.
6. **Monte Carlo propagation**: write a sampler; grade mean and SD within statistical tolerance.
7. **How many repeats** are needed to reach a target SEM? (integer answer)
8. **Discrepancy test**: compute z or t′ and decide whether the values are consistent.
9. **Weighted mean of inconsistent data**: Birge ratio; decide whether to inflate errors.
10. **Fit and report**: seeded noisy data → parameters ± σ. Grading: |p − p_ref| < 0.1σ_ref, and σ itself checked so that an `absolute_sigma` misuse is caught.
11. **Diagnose residuals**: four residual plots matched to wrong model / underestimated σ / outlier / drift.
12. **Interpret χ²_red**: p-value and the most likely explanation.
13. **Linearization pitfall**: a log-linear fit vs a nonlinear fit of the same exponential data.
14. **Calibration inversion with covariance.**
15. **Counting**: background subtraction, and the optimal split of counting time between source and background.
16. **Noise identification** from a PSD (white, 1/f, 60 Hz lines); compute Johnson noise.
17. **Averaging vs drift**: choose the averaging time from an Allan-deviation plot.
18. **Sampling and ADC**: alias frequency, minimum sample rate, bits needed, quantization noise.
19. **Lock-in**: choose the time constant, compute ENBW and output noise, set the phase.
20. **Design for leverage**: choose x-values to minimize σ of the slope.
21. **Communication**: abstract checklist (result with uncertainty plus comparison); figure critique. Rubric- or self-graded.

#### Misconceptions, and the simulator behaviour that should expose each
- **"Error = mistake"/"human error".** Require named mechanisms; the simulator logs its true error sources so feedback can reveal them.
- **More digits = more precise**; copying calculator output. Use formatting graders.
- **SD vs SEM confusion.** Animate SEM shrinking with N while SD stays flat.
- **Averaging removes systematic error.** Give an instrument an offset: the mean converges to the wrong value, and only calibration reveals it.
- **"Within 5 % of accepted" as the success criterion.** Require significance expressed in σ instead.
- **Overlapping error bars mean "equal"; non-overlap means "significant".** Contrast with the quantitative test.
- **Linear addition of independent uncertainties; ignoring correlations** (e.g., the same ruler used for two lengths). Run a Monte Carlo demonstration.
- **R² ≈ 1 means a good model.** Show a high-R² fit with structured residuals.
- **χ²_red ≪ 1 means "excellent".** It actually means errors are overestimated or correlated. The Pantheon+ diagonal-error fit gives χ²/dof = 0.44 (§4).
- **Software defaults are physics.** `curve_fit` rescales pcov by χ²_red by default; `np.std` uses ddof=0 by default.
- **Poisson errors.** √N applied to rates; forgetting background variance; Gaussian approximation at N < 10; taking logs of zero counts.
- **Nyquist "2× is enough" and aliasing can be filtered after sampling.** Show irreversible folding.
- **ADC bits = accuracy.** Simulate offset, gain and INL errors.
- **Filtering always helps.** Show phase delay and distortion; causal vs zero-phase filtering.
- **Longer lock-in time constant is always better.** Show response time and drift.
- **The accepted value is "the right answer"** (confirmation bias). Run a blinded-offset exercise; treat the historical drift of e after Millikan as a case study [not re-fetched].
- **Rejecting outliers by eye.**
- **Type B uncertainty = half the resolution.** Contrast with the rectangular a/√3.

#### [computed] reference answers for A-module items
- 95 % central interval of χ²_red: ν = 5 → [0.166, 2.567]; ν = 10 → [0.325, 2.048]; ν = 20 → [0.480, 1.708]; ν = 50 → [0.647, 1.428] (SD √(2/ν) = 0.632, 0.447, 0.316, 0.200). Source: `scipy.stats.chi2.ppf`.
- Student t₀.₉₇₅: dof 2 → 4.303; dof 4 → 2.776; dof 9 → 2.262; dof 29 → 2.045.
- Counting: 400 source+background counts in 100 s and 100 background counts in 100 s give a net rate of 3.000 ± 0.224 s⁻¹.
- Non-paralyzable dead time: τ = 2 µs with 5.0×10⁴ s⁻¹ measured gives a true rate of 55 556 s⁻¹ (n = m/(1 − mτ)).
- Pendulum g = 4π²L/T² with L = 1.000 ± 0.002 m and T = 2.006 ± 0.004 s: analytic 9.8107 ± 0.0438 m s⁻²; Monte Carlo (10⁶ draws) 9.8107 ± 0.0437.
- Ideal ADC with a full-scale sine: simulated SNR 49.93 / 74.01 / 98.04 / 146.25 dB for 8/12/16/24 bits, vs 6.02N + 1.76 = 49.92 / 74.00 / 98.08 / 146.24 dB.
- Single-pole RC ENBW, integrated numerically: τ = 0.1 s → 2.4999 Hz; τ = 1 s → 0.2500 Hz. Both equal 1/(4τ).
- Aliasing: a 60 Hz tone sampled at 100 Hz appears at 40 Hz.
- Johnson noise of 10 kΩ at 300 K in 10 kHz: 1.29 µV rms. Shot noise of 1 mA in 10 kHz: 1.79 nA rms.

### Gaps
- **Access constraints (applies to the whole file).** The session's proxy returned HTTP 403 for usu.edu, arxiv.org, gwosc.org, nist.gov, bipm.org, docs.scipy.org, exoplanetarchive.ipac.caltech.edu and most other sites, and WebFetch could not resolve DNS. The shared WebSearch budget (200 calls per turn across all agents) ran out partway through. Primary verification was therefore limited to GitHub-hosted sources and installed-package docstrings.
- The GUM, JCGM 101 and textbook tables of contents were cited from knowledge, not re-opened. The current JCGM revision programme was not verified; my recollection is that newer parts such as JCGM GUM-6:2020 and GUM-1:2023 exist, but this is unverified.
- No physics-education-research paper was opened to source the misconception list. It reflects standard instructional knowledge; the point/set paradigm literature and the Holmes–Bonn t′ comparisons are well-known sources but are [not re-fetched].

## 2. What USU PHYS 3870/3880 include, the standard advanced-lab set, and per-experiment simulator specs

### Takeaway
**USU-verified:** PHYS 3870 (Intermediate Lab, 3 cr, CI) covers modern experimental techniques, data and error analysis, design and communication, including "experiments of historical importance". PHYS 3880 (Advanced Lab, 3 cr, CI) emphasizes student-designed projects. The 2013–2015 USU experiment lists include Millikan oil drop, Thomson e/m, Michelson and Fabry–Pérot interferometry, coupled pendulum, Cavendish balance and fiber optics, grouped under mechanics, E&M, optics and electronics. A pandemic-era PHYS 3880 syllabus requires a hypothesis-driven design, a research proposal and time-series/filtering analysis.

**Standard practice elsewhere:** the full list of USU apparatus could not be retrieved, so the rest of the set (Franck–Hertz, photoelectric, Zeeman, Compton/gamma, NMR/ESR, speed of light, Hall, superconductivity, chaotic pendulum, blackbody, diffraction, X-ray, muon lifetime) comes from standard advanced-lab practice. The simulator specs below give each experiment's model, realistic numbers, error and noise model, and intended conclusion.

### Cited Findings
- [USU-verified] **PHYS 3870, Intermediate Physics Laboratory (CI), 3 credits.** Description covers modern experimental techniques, data and error analysis, experimental design and communication skills. The exercises complement upper-level theory courses and include some experiments of historical importance. — [USU catalog PHYS 3870](https://catalog.usu.edu/courses/PHYS3870) (via search summary)
- [USU-verified] **PHYS 3880, Advanced Physics Laboratory (CI), 3 credits.** Description covers modern experimental physics techniques with an emphasis on student-designed and implemented projects. — [USU catalog PHYS 3880](https://catalog.usu.edu/courses/PHYS3880) (via search summary)
- [USU-verified, dated 2015] **Fall 2015 materials (taught as PHYX 3870 by Prof. J. R. Dennison).**
  - Prerequisites: PHYS 2210 and 2220 (General Physics), PHYS 2710 (Introduction to Modern Physics) and PHYS 2500 (Introduction to Computer Methods in Physics), or instructor permission.
  - A $40 per-semester fee.
  - Experiments grouped as mechanics, electricity & magnetism, optics and electronics. Examples: Millikan's oil drop and Thomson's e/m (E&M); Michelson and Fabry–Pérot interferometry (optics).
  - Lab reports graded on understanding of concepts conveyed in the report, plus data and error analysis.
  - Sources: [Syllabus 3870 Fall 2015](https://www.physics.usu.edu/dennison/3870-3880/Syllabus%203870%20Fall%202015.pdf); [List of Experiments](https://www.physics.usu.edu/dennison/3870-3880/Experiments/List%20of%20Experiments.pdf); [course page](https://www.physics.usu.edu/dennison/3870-3880/IntermediateLab.htm); [Lecture 1 intro](https://www.physics.usu.edu/dennison/3870-3880/Class_Notes/Lectures/PHYS%203870%20Lecture%201%20Intro-F2015.pdf); [Content of Lab Report](https://www.physics.usu.edu/dennison/3870-3880/References/Content%20of%20Lab%20Report.pdf) (all via search summary)
- [USU-verified, dated 2013] The Spring 2013 list for the PHYX 3870–3880 series includes a coupled pendulum and Thomson's e/m. A later, undated list also includes Millikan's oil drop, a Cavendish balance and fiber optics. — [List of Experiments Sp2013](https://www.physics.usu.edu/dennison/3870-3880/List%20of%20Experiments%20Sp2013.pdf); [List of Experiments](https://www.physics.usu.edu/dennison/3870-3880/Experiments/List%20of%20Experiments.pdf) (via search summary)
- [USU-verified, pandemic-era spring] The PHYS 3880 syllabus lists these goals: design a physics experiment with a testable hypothesis; write a research proposal; analyze data with time-series and filtering techniques. It charges a $40 lab-kit fee and requires a paper lab notebook. — [PHYS 3880 spring syllabus](https://artsci.usu.edu/physics/files/students/class-websites-and-pdfs/phys-3880-spring.pdf) (via search summary). Other documents exist but were not summarized: a 2013 PHYS 3880 syllabus ([Syllabus 3880 Spring 2013](https://www.physics.usu.edu/dennison/3870-3880/Syllabus%203880%20Spring%202013.pdf)) and an undergraduate research poster-preparation page in the same course folder ([Undergrad_research_2003.pdf](https://www.physics.usu.edu/dennison/3870-3880/Undergraduate%20Research%20Poster%20Preparation%20Web%20Page/Undergrad_research_2003.pdf)).
- A 2024 survey of undergraduate physics lab courses names Franck–Hertz and the Hall effect among common topics. — [Development of a global landscape of undergraduate physics laboratory courses, arXiv:2407.09712](https://arxiv.org/pdf/2407.09712) (via search summary)
- ALPhA (Advanced Laboratory Physics Association) runs "Laboratory Immersions", hands-on workshops whose topics range from single-photon quantum mechanics to plasma probes and holographic measurements. Named immersions include silicon-photomultiplier particle detectors, modern interferometry and diode-laser spectroscopy (the snippet mixed institutions, so the exact pairings are unconfirmed). — [ComPADRE Advanced Labs](https://compadre.org/AdvLabs); [AdvLabs wiki](https://advlabs.aapt.org/wiki/view.cfm?OID=9269) (via search summary)
- The Jonathan F. Reichert Foundation runs an equipment-grant programme for advanced labs, administered through ALPhA (2024 application form exists; terms not retrieved). — [JFR–ALPhA grant application (Oct 2024)](https://jfreichertfoundation.org/wp-content/uploads/2024/10/JFR-alpha-grant-application-10-24.pdf). AAPT also publishes advanced-lab workshop material. — [Essick, Advanced Labs slides](https://aapt.org/Conferences/newfaculty/upload/Essick_Advanced-Labs-1.pdf) (existence only)
- Comparable published experiment lists exist and could be used to benchmark the set (not read this session): [U. Toronto Advanced Physics Lab experiment list](https://www.physics.utoronto.ca/apl/explist.htm); [Tarleton Advanced Lab](https://www.tarleton.edu/tpc/wp-content/uploads/sites/128/2022/05/Advanced_Lab.pdf).
- Franck–Hertz has a modern literature on its subtleties, which supports simulating its non-ideal features. — [The Franck–Hertz experiment re-considered, arXiv:physics/0106029](https://arxiv.org/pdf/physics/0106029); [Franck–Hertz in a magnetic field, arXiv:1010.1440](https://arxiv.org/pdf/1010.1440) (existence via search)
- [primary-verified] **CODATA 2022 values used below (via `scipy.constants`):**
  - e = 1.602176634×10⁻¹⁹ C (exact); |e/mₑ| = 1.75882000838×10¹¹ C kg⁻¹
  - h = 6.62607015×10⁻³⁴ J s (exact); h/e = 4.135667697×10⁻¹⁵ V s
  - c = 299 792 458 m s⁻¹; G = 6.67430(15)×10⁻¹¹ m³ kg⁻¹ s⁻²
  - μ_B/h = 13.9962449171 GHz T⁻¹; γ_p/2π = 42.577478461 MHz T⁻¹; g_e = −2.00231930436092
  - Wien b = 2.897771955×10⁻³ m K; mₑc² = 0.51099895069 MeV; σ_SB = 5.670374419×10⁻⁸ W m⁻² K⁻⁴; μ₀ = 1.25663706127×10⁻⁶ N A⁻²
  - Source: [scipy.constants](https://docs.scipy.org/doc/scipy/reference/constants.html); [NIST CODATA](https://physics.nist.gov/cuu/Constants/)

### Inferences

#### Simulator specs. Each entry gives the physics, the model to fit, numbers [computed] or typical apparatus values (marked *typ.*, design assumptions to check against real equipment), the errors and noise to simulate, and what the learner should conclude.

**E1. e/m by electron-beam deflection in Helmholtz coils (USU list)**
- *Physics/model:* ½mv² = eV and r = mv/(eB), so e/m = 2V/(B²r²), with B = (4/5)^{3/2} μ₀NI/R. A design that exposes systematics: fit 1/r = √(e/2mV)·(kI + B_stray) against I. The intercept measures the ambient field, which changes sign when the coil current is reversed.
- *Numbers:* *typ.* N = 130, R = 0.15 m. Then V = 200 V, I = 1.4 A gives B = 1.091 mT and r = 4.37 cm; V = 300 V, I = 1.7 A gives 1.325 mT and 4.41 cm [computed]. Earth's field (~50 µT, *typ.*) is 4–5 % of B.
- *Errors/noise:* radius reading with parallax (±1–2 mm, Type B); diffuse beam edge; ambient-field projection; field non-uniformity off axis; offset between accelerating voltage and true beam energy (filament/contact potential, a few V); gas scattering. Small random reading noise; systematics dominate.
- *Conclude:* e/m to roughly 3–10 %, a systematics-dominated budget, and the value of field-reversal tricks.

**E2. Millikan oil drop (USU list)**
- *Physics/model:* Stokes drag with Cunningham slip correction (1 + b/(pr)), buoyancy, terminal velocities v_f and v_r. Then q = 6πηr(v_f + v_r)/E with r = √(9ηv_f/(2ρg)) (iterated with the slip correction). Fit charges q_i ≈ n_i·e, scanning e with an integer assignment. Warn about spurious minima at e/k.
- *Numbers [computed],* with η = 1.83×10⁻⁵ Pa s, ρ = 886 kg m⁻³, b = 8.2×10⁻³ Pa m, T = 296 K:

  | r | Terminal speed | Time to fall 0.5 mm | Brownian rms during fall | Balancing voltage (d = 6 mm), n = 1 / 3 / 10 |
  |---|---|---|---|---|
  | 0.4 µm | 20.3 µm/s | 24.7 s | 38 µm (7.6 %) | — |
  | 0.7 µm | 57.6 µm/s | 8.7 s | 17 µm (3.4 %) | 467 / 156 / 47 V |
  | 1.0 µm | 114 µm/s | 4.4 s | 10 µm (2.0 %) | 1362 / 454 / 136 V |

  Air viscosity rises about 0.26 % per K (Sutherland law).
- *Errors/noise:* stopwatch reaction (~0.1–0.2 s); Brownian scatter (above); temperature dependence of η; plate separation; voltage; droplet evaporation; charge changing mid-run (shows up as a velocity jump); selection bias toward "nice" drops.
- *Conclude:* charge is quantized, with e to ~1–3 %. Include a control run on synthetic *non*-quantized charges so learners see that a histogram can deceive.

**E3. Photoelectric effect, h/e**
- *Model:* V_s = (h/e)ν − W/e. Fit a weighted straight line; only the slope is meaningful, because the intercept includes the contact potential.
- *Numbers [computed]:* hν/e for the Hg lines is 365.0 nm → 3.397 V; 404.7 → 3.064 V; 435.8 → 2.845 V; 546.1 → 2.270 V; 577.0 → 2.149 V; 579.1 → 2.141 V. h/e = 4.1357×10⁻¹⁵ V s.
- *Errors:* where the stopping voltage is read on a soft I–V knee (method-dependent bias); reverse anode current; stray light; filter leakage; electrometer input bias.
- *Conclude:* slope within ~5 % of h/e, and V_s independent of intensity.

**E4. Franck–Hertz (Hg or Ne)**
- *Model:* current minima spaced by the first excitation energy. Locate peaks with `find_peaks` plus local parabola or Gaussian fits, then fit peak position against order. Simulate the known increase of spacing with order (mean-free-path effect) and a first-peak offset from the contact potential.
- *Numbers:* the Hg 253.65 nm resonance line corresponds to 4.888 eV [computed]. Ne spacing is about 18–19 V (*typ.*). The Hg oven runs at ~150–200 °C (*typ.*).
- *Noise:* pA–nA current noise, oven temperature drift, onset of ionization at high voltage.
- *Conclude:* atomic energy levels are quantized (≈4.9 eV for Hg); the absolute offset is not the excitation energy.

**E5. Michelson interferometer (USU list)**
- *Model:* 2d = Nλ. For a gas cell, N = 2L(n − 1)/λ, linear in pressure.
- *Numbers [computed]:* 10 µm of mirror travel gives 31.6 fringes at 632.8 nm. A 3 cm air cell with n − 1 ≈ 2.7×10⁻⁴ (*typ.*) gives 25.6 fringes from 1 atm to vacuum.
- *Errors:* micrometer backlash and lever-arm calibration (the dominant systematic); fringe miscount (±1); vibration and thermal drift.
- *Conclude:* λ to ~1 %; n − 1 ∝ p; coherence length set by the source (He–Ne vs Na vs white light).

**E6. Fabry–Pérot etalon (USU list)**
- *Model:* ring radii r_p² linear in ring index. FSR = λ²/(2nd); finesse F = π√R/(1 − R).
- *Numbers [computed]:* a d = 3 mm, n = 1.457 etalon at 643.8 nm has FSR = 47.4 pm (34.29 GHz). Finesse is 19.3 at R = 0.85 and 29.8 at R = 0.90. The Na D doublet spacing is 0.597 nm, with coincidence spacing λ²/(2Δλ) ≈ 0.291 mm.
- *Errors:* alignment, ring-centre fitting, pixel quantization.
- *Conclude:* resolution and finesse; sets up E16.

**E7. Speed of light**
- *Model:* pulsed time of flight (or modulated-beam phase). Fit delay against path length: the slope is 1/c and the intercept is electronics delay.
- *Numbers [computed]:* 33.36 ns per 10 m.
- *Errors:* trigger jitter (~ns), timebase calibration, cable delays (cancelled by a differential measurement), path-length measurement.
- *Conclude:* c to ~1 %, and why differential measurements matter.

**E8. Cavendish torsion balance (USU list)**
- *Model:* damped oscillation θ(t) = θ_eq + A e^{−t/τ} cos(ωt + φ) + (linear drift).
  - Equilibrium shift: θ = GMT²/(4π²db²), independent of the small mass.
  - Light-lever spot shift between the two extreme positions: ΔS = 4Lθ.
  - Hence G = π²b²dΔS/(MLT²) [computed check: returns 6.674×10⁻¹¹].
- *Numbers:* *typ.* M = 1.5 kg, d = 50 mm, b = 46.5 mm, T = 600 s, L = 5 m. Then θ_eq = 8.44 mrad and ΔS = 16.9 cm [computed].
- *Errors:* far-sphere attraction (geometry correction); rod mass; air currents and seismic torques (low-frequency noise); thermal drift of the zero (fit a drift term); hour-long runs.
- *Conclude:* G to ~5–10 %. Extracting equilibrium from a fit beats waiting for the swing to settle.

**E9. Coupled pendulums (USU list)**
- *Model:* normal modes ω₁ = √(g/L) and ω₂ = √(g/L + 2k/m); beat period 2π/(ω₂ − ω₁). Fit FFT peaks and sinusoids.
- *Errors:* damping, large-amplitude nonlinearity, location of the coupling point.
- *Conclude:* normal modes and superposition (links to the eigenvalue exercises in §5).

**E10. Driven damped (chaotic) pendulum**
- *Model:* θ̈ + γθ̇ + ω₀² sin θ = F cos ω_d t. Fit the small-amplitude resonance to get ω₀, γ and Q. Then explore period doubling, Poincaré sections and Lyapunov exponents.
- *Errors:* Coulomb friction, encoder resolution, drive jitter.
- *Conclude:* deterministic chaos and sensitive dependence on initial conditions.

**E11. Hall effect (metal foil or doped Ge)**
- *Model:* V_H = IB/(nqt) and R_H = 1/(nq); the sign gives the carrier type. Extension: Ge conductivity against T gives the band gap (~0.67 eV, *typ.*).
- *Numbers [computed]:*
  - Cu foil (t = 25 µm, I = 1 A, B = 0.5 T): V_H = 1.47 µV, R_H = −7.35×10⁻¹¹ m³ C⁻¹ (n = 8.49×10²⁸ m⁻³).
  - Doped Ge (n = 10²¹ m⁻³, t = 1 mm, I = 30 mA, B = 0.25 T): V_H = 46.8 mV.
- *Errors:* misalignment offset ∝ I (remove by reversing the field); thermoelectric voltages; B calibration; thickness. For metals, µV thermal EMFs dominate, which motivates AC excitation or a lock-in.
- *Conclude:* carrier density and sign; reversal techniques.

**E12. Blackbody / Stefan–Boltzmann with a tungsten lamp**
- *Model:* P = εσAT⁴ + losses, with T inferred from tungsten R(T)/R₃₀₀. Spectral version: prism plus detector.
- *Numbers [computed]:* λ_max = 1.932 / 1.449 / 1.159 / 0.966 µm at 1500 / 2000 / 2500 / 3000 K.
- *Errors:* emissivity well below 1 and wavelength-dependent (~0.3–0.45, *typ.*); prism calibration; detector spectral response; conduction losses at low T (fitted exponent below 4); IR background.
- *Conclude:* approximately T⁴ at high T; tungsten is a grey body, not a black body.

**E13. Single- and double-slit diffraction**
- *Model:* I = I₀ sinc²β cos²α (plus background), convolved with the detector-slit width.
- *Numbers [computed]:* a = 0.08 mm, L = 1 m, 632.8 nm puts the first minimum at 7.91 mm.
- *Errors:* L and slit calibration; laser intensity drift (normalize to a reference photodiode); detector saturation; ambient light; Fresnel number a²/(Lλ) not small.
- *Conclude:* extract slit width ± uncertainty; know when the Fraunhofer approximation holds.

**E14. Fiber optics (USU list)**
- *Model:* NA = √(n₁² − n₂²). Cut-back attenuation P(L) = P₀·10^{−αL/10}; far-field profile.
- *Errors:* coupling and connector repeatability (dominant); launch conditions; detector linearity.
- *Conclude:* attenuation and NA; insertion loss dominated by coupling.

**E15. Electronics and noise (USU "electronics" category)**
- *Content:* RC/RLC Bode plots, op-amp gain–bandwidth, Johnson noise (V² = 4kTRΔf → k_B) and shot noise (i² = 2qIΔf → e).
- *Numbers [computed]:* 10 kΩ at 300 K in 10 kHz gives 1.29 µV rms; 1 mA in 10 kHz gives 1.79 nA rms.
- *Errors:* amplifier noise floor (subtract it); gain and ENBW calibration of the filter chain; pickup.
- *Conclude:* fundamental constants recovered from noise; why ENBW matters.

**E16. Zeeman effect (Cd 643.8 nm normal; Hg 546.1 nm anomalous) with a Fabry–Pérot**
- *Model:* normal splitting Δν = μ_B B/h. Fit Δ(r²)/(ring spacing in r²) against B to get μ_B/h (or e/m). Add π/σ polarization in transverse vs longitudinal viewing.
- *Numbers [computed]:* 7.00 GHz at 0.5 T and 14.00 GHz at 1 T. For the Cd red line, Δλ = 9.68 pm at 0.5 T and 19.35 pm at 1 T, against a 47.4 pm FSR for a 3 mm etalon.
- *Errors:* B calibration and field gradient across the lamp; pole-piece heating; ring measurement.
- *Conclude:* μ_B to ~5 %; quantized angular momentum.

**E17. Compton scattering (Cs-137 + NaI)**
- *Model:* E′ = E/[1 + (E/mₑc²)(1 − cos θ)]. Fit 1/E′ − 1/E against 1 − cos θ: the slope is 1/(mₑc²). Optional: Klein–Nishina rates.
- *Numbers [computed],* E = 661.657 keV:

  | θ | 30° | 45° | 60° | 90° | 120° | 135° | 180° |
  |---|---|---|---|---|---|---|---|
  | E′ (keV) | 563.8 | 479.7 | 401.6 | 288.3 | 224.9 | 206.1 | 184.3 |

  The Compton edge is at 477.3 keV.
- *Errors:* energy-calibration nonlinearity; finite angular acceptance; room and shield backscatter; NaI resolution (~6–8 % FWHM at 662 keV, *typ.*); Poisson statistics.
- *Conclude:* photons scatter as particles; mₑc² ≈ 511 keV to a few %.

**E18. Gamma spectroscopy and attenuation**
- *Calibration lines (standard values, [not re-fetched]):* Cs-137 661.7; Co-60 1173.2 and 1332.5; Na-22 511 and 1274.5; Ba-133 81 and 356; Am-241 59.5 keV.
- *Model:* Gaussian plus step/linear background per peak (centroid, FWHM, area); linear energy calibration; FWHM² = a + bE; I = I₀e^{−μx} + background, compared against NIST XCOM.
- *Errors:* gain drift with temperature, pile-up, dead time, geometry; Poisson noise.
- *Conclude:* identify an unknown source; measure μ/ρ.

**E19. Pulsed NMR**
- *Model:* f = γB/2π. FID gives T₂*; Hahn echo gives e^{−2τ/T₂}; inversion recovery M = M₀(1 − 2e^{−t/T₁}); CPMG suppresses diffusion. Fit exponentials.
- *Numbers [computed]:* f = 21.289 MHz at 0.5 T and 42.577 MHz at 1 T. The inversion-recovery null falls at T₁ln2, e.g. 13.9 ms for T₁ = 20 ms.
- *Errors:* B inhomogeneity; pulse-angle error; magnet temperature drift; diffusion bias in the Hahn T₂; receiver dead time. Magnitude signals are Rician-biased at low SNR, so simulate quadrature channels.
- *Conclude:* T₁ and T₂ and their dependence on sample (viscosity, paramagnetic doping); why CPMG.

**E20. ESR (DPPH)**
- *Model:* hν = gμ_B B. Field modulation plus lock-in gives a derivative-Lorentzian line; fit resonance field against frequency.
- *Numbers [computed]* for g = 2.0036: 28.043 GHz T⁻¹, i.e. 28.04 MHz per mT. X-band 9.5 GHz resonates at 338.8 mT.
- *Errors:* coil calibration and Earth's field; modulation broadening.
- *Conclude:* g ≈ 2.00, close to the free-electron |g_e| = 2.0023; the lock-in derivative lineshape.

**E21. Superconductivity (YBCO)**
- *Model:* four-probe R(T); T_c midpoint and width. T_c ≈ 92 K (*typ.*, [not re-fetched]).
- *Errors:* thermocouple calibration near 77 K; thermal lag (cooling/warming hysteresis); thermal EMFs (reverse the current); contact resistance (removed by four-probe).
- *Conclude:* T_c to ~2 K; zero resistance within resolution; Meissner levitation as a qualitative check.

**E22. X-ray diffraction (Bragg)**
- *Model:* nλ = 2d sin θ, fitting a goniometer zero offset as a parameter. Duane–Hunt limit λ_min = hc/(eV) gives h.
- *Numbers [computed]:* Cu Kα (0.15406 nm) on NaCl (d = 0.2820 nm) gives θ₁ = 15.85° and θ₂ = 33.11°.
- *Conclude:* lattice spacing, and h from Duane–Hunt.

**E23. Muon lifetime and cosmic-ray counting**
- *Model:* N(t) = Ae^{−t/τ} + B fitted by Poisson likelihood. Exclude the first few hundred ns (afterpulsing). Free-muon τ = 2.1969811 µs (PDG, [not re-fetched]). μ⁻ capture in the scintillator lowers the observed mean somewhat.
- *Errors:* TDC calibration, accidental coincidences, background.
- *Conclude:* τ to a few %; time dilation (muons reach the ground).

**E24. Radioactive decay and counting statistics**
- *Model:* Ba-137m generator with T½ = 2.552 min (NNDC, [not re-fetched]); dead-time and background corrections; Poisson vs Gaussian regimes. Compare a weighted χ² fit with Poisson MLE at low counts.
- *Conclude:* Poisson statistics and half-life with honest uncertainty.

**E25. Optional ALPhA-style: optical pumping of Rb**
- *Model:* resonance f = g_F μ_B B/h.
- *Numbers [computed]:* μ_B/h = 1.39962 MHz/G; g_F = 1/2 (⁸⁷Rb, F = 2) gives 0.6998 MHz/G; g_F = 1/3 (⁸⁵Rb, F = 3) gives 0.4665 MHz/G. Fit f against coil current; the intercept is the residual field.
- *Conclude:* the g_F ratio identifies the nuclear spins.

**E26. Lock-in skills station**
- *Task:* recover a µV signal buried in noise; trade time constant against ENBW (1/(4τ) for a single pole, [computed]); adjust phase; reject harmonics.

#### Sequencing for the USU-shaped track
- **3870-level, guided:** E1–E15, with the "historically important" set foregrounded (Millikan, e/m, Cavendish, photoelectric, Franck–Hertz, Michelson). The data-analysis modules A3–A9 are interleaved.
- **3880-level, project mode:** E16–E26 plus learner-designed variants. Each project requires a written proposal with a testable hypothesis and an *a-priori* uncertainty budget (mirroring the USU 3880 syllabus), a time-series/filtering analysis step, and a report or poster.

#### Report template enforced by the virtual lab
Abstract (≤150 words, result with uncertainty and significance against the reference) → theory and model → apparatus (simulated instrument specs) → method → results (figure with residual panel) → uncertainty budget table → discussion → conclusion.

### Gaps
- The current (2025–26) USU PHYS 3870/3880 experiment lists, manuals, prerequisites and fees could not be retrieved; the lists above date from 2013–2015. In particular, it is unknown whether USU currently runs Franck–Hertz, photoelectric, Zeeman, NMR/ESR, Compton/gamma, Hall or superconductivity stations.
- Parameters marked *typ.* (coil geometry, oil density, NaI resolution, tungsten emissivity, T_c, Hg oven temperature, air index) are typical teaching-apparatus values, not checked against specific USU equipment or manufacturer manuals (those were unreachable).
- Detailed ALPhA guidance (an immersion catalogue, Beyond-the-First-Year conference recommendations) could not be retrieved beyond the items cited.
- The Franck–Hertz "spacing increases with order" effect is described from the literature as known (Rapior, Sengstock & Baev, Am. J. Phys. 74, 423 (2006), [not re-fetched]).

## 3. Introductory lab skills for PHYS 2210/2220 (USU labs PHYS 2215/2225)

### Takeaway
**USU-verified:** the calculus-based sequence PHYS 2210/2220 (4 cr each) has *separate* 1-credit lab courses, PHYS 2215 and PHYS 2225. The specific USU intro-lab experiments were not found. The intro track can therefore reuse modules A0–A8 at lower depth, wrapped around ~16 canonical mechanics/thermal and E&M/optics experiments.

### Cited Findings
- [USU-verified] PHYS 2210, Physics for Scientists and Engineers I (4 cr, General Education), covers kinematics, Newton's laws, rotations, momentum, energy, gravity, fluids and thermodynamics. Its lab is PHYS 2215 (1 cr). The follow-on pair is PHYS 2220 with PHYS 2225 (Lab II). — [USU catalog PHYS 2210](https://catalog.usu.edu/courses/PHYS2210); [Physics Applied Emphasis BS program page](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298); [USU exploratory advising, physical sciences](https://www.usu.edu/advising/exploratory/focus-area-physical-sciences-engineering-math) (via search summary)
- [USU-verified] The physics department lists PHYS 2210 sections in person and online across several semesters, e.g. Fall 2020 and Spring 2021. — [USU Physics class websites](https://www.usu.edu/physics/students/class-websites) (via search summary)
- The AAPT lab recommendations are intended to apply to introductory as well as advanced labs. — [arXiv:1809.00059](https://arxiv.org/pdf/1809.00059) (via search summary)

### Inferences
- **Minimal intro skill set, an "A-lite" path:**
  - units and significant figures; reading instruments
  - mean, SD, SEM
  - propagation with simple rules, plus Monte Carlo as a visual
  - graphing with error bars; linearization and slope; reading the slope ± uncertainty from a fit
  - percent difference *and* discrepancy in σ
  - a one-page lab write-up
- **Canonical virtual intro experiments, with the primary skill each trains:**

  | # | Experiment | Primary skill |
  |---|---|---|
  | 1 | Pendulum period vs length | T² vs L slope → g; small-angle limit (ties to §4 P5) |
  | 2 | Cart on track with motion sensor | Numerical derivatives of noisy x(t) |
  | 3 | Atwood machine / Newton's 2nd law | Linear fit a vs net force; friction offset as intercept |
  | 4 | Projectile / launcher range | MC propagation |
  | 5 | Energy conservation on an incline or loop | Systematic loss identification |
  | 6 | Collisions / momentum | Uncertainty in ratios |
  | 7 | Rotational inertia | Parallel-axis check |
  | 8 | Spring SHM | k from static vs dynamic methods: consistency test |
  | 9 | Standing waves on a string | f vs n fit |
  | 10 | Speed of sound in a resonance tube | End correction as fit intercept |
  | 11 | Ideal gas law | Absolute zero by extrapolation, with extrapolation uncertainty |
  | 12 | Calorimetry / specific heat | Heat-loss systematic |
  | 13 | Equipotential mapping | Field = −gradient (`np.gradient`) |
  | 14 | Ohm's law, series/parallel, Kirchhoff | Meter loading |
  | 15 | RC time constant | Exponential fit vs log-linearization |
  | 16 | Magnetic field of a coil/solenoid and Earth's field (tangent galvanometer) | Fitting with a background field |
  | 17 | Faraday induction | — |
  | 18 | Oscilloscope and AC / RLC resonance | Lorentzian fit, Q |
  | 19 | Snell's law and thin lenses | 1/s + 1/s′ linearization |
  | 20 | Single/double-slit diffraction | Shared with E13 at lower depth |
- **Intro problem archetypes:** the same as §1 items 1–4, 7, 8, 10 and 21, with tolerance-graded numeric answers and figure checklists.

### Gaps
- The USU PHYS 2215/2225 lab manual, experiment list, software (e.g., PASCO Capstone vs Vernier) and grading were not found.
- The detailed PHYS 2220 catalog content was not retrieved; the E&M emphasis is assumed from the course title and standard practice.

## 4. Research skills (USU PHYS 4900) and miniature research projects feasible in a browser

### Takeaway
**USU-verified:** PHYS 4900 Research in Physics (CI, 1–3 cr) is a faculty-mentored research capstone, normally taken late in the degree. It requires written and oral presentation of outcomes; the Applied Emphasis needs 2 credits and the Professional Emphasis 4.

Research-skills content is not specified by the catalog, so the Atlas track should be built on general practice:
- literature search: arXiv, ADS and INSPIRE syntax (arXiv and ADS verified here)
- reading papers and formulating a question
- modelling, simulation and uncertainty
- reproducibility (versions, seeds, environment)
- communication

Seven mini-projects with public data are specified below, with [computed] reference answers so they can be auto-checked.

### Cited Findings
- [USU-verified] PHYS 4900 Research in Physics (CI), 1–3 credits: research experience pursued with a faculty mentor; before registering, students must make arrangements with the department's undergraduate research advisor. It serves as the capstone, in which students work with a faculty mentor over one or more semesters. Written and oral presentations of the outcomes are required. — [USU catalog PHYS 4900](https://catalog.usu.edu/courses/PHYS4900); [Physics: Professional Emphasis BS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826); [Applied & Professional Emphasis assessment page](https://artsci.usu.edu/physics/assessments/applied-professional-emphasis/index) (via search summary)
- [USU-verified] Credit requirements differ by emphasis. The Applied Emphasis BS lists PHYS 4900 for 2 credits; the Professional Emphasis BS requires a total of 4 credits. This is probably a real difference between emphases, not a contradiction. — [Applied Emphasis BS](https://catalog.usu.edu/preview_program.php?catoid=38&poid=37070&returnto=29298); [Professional Emphasis BS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826) (via search summary)
- [USU-verified] USU publishes physics capstone projects on DigitalCommons, a source of realistic examples of student research products. — [DigitalCommons@USU Physics Capstone Projects](https://digitalcommons.usu.edu/phys_capstoneproject/index.html)
- [primary-verified] **arXiv API.**
  - Field prefixes: `ti` (title), `au` (author), `abs` (abstract), `co` (comment), `jr` (journal ref), `cat` (subject category), `rn` (report number), `id` (use `id_list` instead), `all`.
  - Terms of use: no more than one request every three seconds.
  - Paper licenses chosen by authors: CC BY 4.0, CC BY-SA 4.0, CC BY-NC-SA 4.0, CC BY-NC-ND 4.0, the arXiv perpetual non-exclusive license 1.0, or CC0.
  - Metadata is released under CC0 1.0.
  - Reusing figures is allowed only if the paper's license permits; otherwise contact the copyright holder.
  - Source: [arXiv/arxiv-docs (source of info.arxiv.org help)](https://github.com/arXiv/arxiv-docs), files `source/help/api/user-manual.md`, `source/help/api/tou.md`, `source/help/license/index.md`, `source/help/license/reuse.md`
- [primary-verified] **NASA ADS search syntax.**
  - Fielded searches: `author:"^Last, F"` (first author), `abs:"phrase"`, `full:"phrase"`, `aff:"…"`, `bibstem:ApJ`, `citation_count:[10 TO *]`, `database:astronomy`, `doctype:catalog`, `object:…`, `orcid:…`.
  - Second-order operators: `reviews()`, `similar()`, `trending()`, `useful()`, and `topn(100, database:astronomy, citation_count desc)`.
  - Source: [adsabs/adsabs.github.io](https://github.com/adsabs/adsabs.github.io), files `_includes/_help/search/_posts/search-syntax.md` and `second-order.md` (rendered at [ADS help: search syntax](https://ui.adsabs.harvard.edu/help/search/search-syntax))
- [primary-verified] **GW Open Data Workshop #6 (2023) structure.**
  - Day 1: discovering open data, GWpy `TimeSeries`, FFT/PSD/Q-transform, segment lists, glitches and hardware injections, CBC signals.
  - Day 2: matched filtering, signal consistency and significance.
  - Day 3: parameter estimation with Bilby, published posterior samples, skymaps.
  - A graded "Data Challenge" ordered by difficulty. Challenge 1: a loud BBH in white Gaussian noise (load, plot, spectrogram, merger time). Challenge 2: m₁ = m₂ = 30 M☉ in coloured noise (template, PSD, SNR time series, matched-filter SNR).
  - The 2024 workshop repository carries a GPL-3.0 licence file.
  - Source: [gw-odw/odw-2023](https://github.com/gw-odw/odw-2023) (Tutorials/README.md, Challenge/README.md); [gw-odw/odw-2024](https://github.com/gw-odw/odw-2024)
- [primary-verified] **GWOSC "LOSC Event tutorial" repository.**
  - Contents: 32 s H1 and L1 strain files at 4096 Hz in HDF5 (~1.0 MB each) plus the GW150914 template.
  - Event metadata: `tevent` = 1126259462.44 (UTC 2015-09-14T09:50:45.44); bandpass `fband` [43, 300] Hz; template m₁ = 41.743, m₂ = 29.237 (detector-frame), SEOBNRv2.
  - Pipeline: Welch PSD with NFFT = 4·fs, Blackman window, 50 % overlap; whitening by dividing by the ASD; 4th-order Butterworth band-pass via `filtfilt`; frequency-domain matched filter with a Tukey (α = 1/8) data window.
  - Requirements: h5py, matplotlib, scipy (Python 3.9). No licence file is present.
  - The tutorial warns that its "parameters (SNR, masses, spins, D_eff) are somewhat different from what you will see in our papers."
  - Source: [losc-tutorial/LOSC_Event_tutorial](https://github.com/losc-tutorial/LOSC_Event_tutorial) (home page stated as https://www.gwosc.org/tutorials/)
- [primary-verified] **Pantheon+ data release.**
  - `Pantheon+SH0ES.dat` provides distances used in Pantheon+ (arXiv:2202.04077) and SH0ES (arXiv:2112.04510).
  - Covariance files: `Pantheon+SH0ES_STATONLY.cov` and `Pantheon+SH0ES_STAT+SYS.cov` (1701×1701, read sequentially after a first line giving N).
  - The README warns: "DO NOT FIT COSMOLOGICAL PARAMETERS WITH THESE UNCERTAINTIES. YOU MUST USE THE FULL COVARIANCE … ONLY FOR PLOTTING/VISUAL PURPOSES" (of `m_b_corr_err_DIAG` and `MU_SH0ES_ERR_DIAG`).
  - Column definitions include zHD, zHEL, m_b_corr, MU_SH0ES, CEPH_DIST, IS_CALIBRATOR and USED_IN_SH0ES_HF.
  - The repository has no LICENSE file (404).
  - Source: [PantheonPlusSH0ES/DataRelease](https://github.com/PantheonPlusSH0ES/DataRelease), file `Pantheon+_Data/4_DISTANCES_AND_COVAR/README`
- [primary-verified] **Lightkurve.**
  - The "recover a known planet" tutorial uses Kepler-10b: download Kepler quarter-3 data, `flatten(window_length=301)`, BLS periodogram over 0.5–1.5 d in 0.001 d steps (`period_at_max_power`), fold; it reports "a strong signal with a periodicity near 0.8 days".
  - Lightkurve is MIT-licensed and requests the acknowledgment "This research made use of Lightkurve, a Python package for Kepler and TESS data analysis (Lightkurve Collaboration, 2018)" (ascl:1812.013).
  - Source: [lightkurve/lightkurve](https://github.com/lightkurve/lightkurve) (`docs/source/about/citing.rst`; `docs/source/tutorials/3-science-examples/exoplanets-recover-a-known-planet.ipynb`)
- [primary-verified] **astroquery documentation.**
  - The NASA Exoplanet Archive is queried through its TAP service. The Planetary Systems table is `ps`; the Planetary Systems Composite Parameters table is `pscomppars`.
  - The Gaia docs point users to ESA's credits page for how to acknowledge and cite Gaia data (https://gea.esac.esa.int/archive/documentation/credits.html); DR3 `gaiadr3.gaia_source` is the default table.
  - JPL Horizons `vectors()` returns state vectors usable as integration initial conditions.
  - Source: [astropy/astroquery docs](https://github.com/astropy/astroquery) (`docs/ipac/nexsci/nasa_exoplanet_archive.rst`, `docs/gaia/gaia.rst`, `docs/jplhorizons/jplhorizons.rst`)
- [primary-verified] The CosmicWatch v2 desktop muon detector repository is marked deprecated in favour of v3X, links the paper arXiv:1801.03029, and has no licence file. — [CosmicWatch v2 repo](https://github.com/spenceraxani/CosmicWatch-Desktop-Muon-Detector-v2)
- **Published reference values [not re-fetched]:**
  - GW150914 (Abbott et al. 2016, PRL 116, 061102): network matched-filter SNR 24; peak strain 1.0×10⁻²¹; 35→250 Hz; source-frame masses 36 and 29 M☉, final 62 M☉, 3.0 M☉c² radiated; 410 Mpc (z ≈ 0.09); L1 leads H1 by ~6.9 ms. — [PRL 116, 061102](https://doi.org/10.1103/PhysRevLett.116.061102)
  - Pantheon+ flat ΛCDM Ω_m = 0.334 ± 0.018. — [Brout et al. 2022, arXiv:2202.04077](https://arxiv.org/abs/2202.04077)
  - SH0ES H₀ = 73.04 ± 1.04 km s⁻¹ Mpc⁻¹. — [Riess et al. 2022, arXiv:2112.04510](https://arxiv.org/abs/2112.04510)
  - Observed GR perihelion advance of Mercury ≈ 42.98″/century. — [Will, Living Rev. Relativ. 17, 4 (2014)](https://doi.org/10.12942/lrr-2014-4)

### Inferences

#### Research-skills module tree, track (b)
- **R0 What research is.** The question → model → test loop; the roles of simulation and data; ethics, authorship and credit.
- **R1 Finding literature.**
  - arXiv listings by category (gr-qc, astro-ph.HE, astro-ph.CO, physics.data-an) and the API with `cat:` and `au:` queries, respecting the 3-second rate limit.
  - ADS fielded and second-order queries (`author:"^…"`, `citations()`, `references()`, `reviews()`, `useful()`). `citations()` and `references()` are standard ADS operators, not re-verified here.
  - INSPIRE for GR and HEP.
  - Citation-chasing forward and backward; building a reading list.
- **R2 Reading a paper.** A three-pass method: abstract and figures → structure → derivations. Extract the claim, evidence and uncertainty. Practise on licence-permitting (CC BY) arXiv papers so figures can be reproduced in-app.
- **R3 Formulating a research question.** Specific, testable, scoped to the available data; state the null hypothesis and the observable.
- **R4 Modelling.** Choose the minimal model; dimensional analysis; identify parameters and nuisance parameters.
- **R5 Simulation.** Turn the model into code; validate against analytic limits (convergence tests); separate simulation state from plotting.
- **R6 Uncertainty and inference.** Statistical vs systematic; covariance; likelihoods; MCMC as an optional extension.
- **R7 Reproducibility.** Pin library versions; record seeds; keep raw data immutable; script every figure; use version control. Case study: the 2016 GWOSC tutorial's `signal.tukey` call, and its bare-`except` fallback `signal.blackman`, both no longer exist in SciPy 1.18.1 [primary-verified], so the unpinned notebook now fails.
- **R8 Presenting.** Abstract, figure, 5-minute talk, poster (mirrors PHYS 4900's written-plus-oral requirement and the 3870/3880 poster page).
- **R9 Project proposal and retrospective.**

#### Mini research projects. Each one: question → data → methods → checkable outputs → licence.

**P1. "Hearing GW150914": whitening, band-pass and matched filtering**
- *Data:* LOSC tutorial files (32 s, 4096 Hz H1 and L1 plus template, about 3 MB total).
- *Steps:* plot raw strain; Welch ASD; whiten; band-pass 43–300 Hz; spectrogram or Q-transform; matched filter; time lag between detectors; optional Newtonian chirp-mass estimate from f and ḟ, using M_c = (c³/G)[(5/96)π^{−8/3} f^{−11/3} ḟ]^{3/5}.
- *[computed] reference outputs,* from my re-implementation of the tutorial method with SciPy 1.18.1 `welch`:
  - H1 peak SNR 18.56 at GPS 1126259462.4395; L1 peak SNR 13.21 at 1126259462.4324, so L1 leads by ≈7.1 ms.
  - ASD at 100 Hz: H1 1.08×10⁻²³ Hz^-½, L1 8.17×10⁻²⁴ Hz^-½.
  - Raw H1 max |h| is 7.7×10⁻¹⁹ (low-frequency noise), compared with the ~10⁻²¹ signal.
  - Chirp check: M_c = 30 M☉ at f_GW = 100 Hz implies ḟ ≈ 3617 Hz s⁻¹, and the inverse formula recovers 30.00 M☉.
- *Lesson:* single-detector SNRs ≈ 18.6 and 13.2 are below the published network value of 24, because the tutorial is simplified.
- *Libraries:* numpy, scipy.signal (welch, butter, filtfilt/sosfiltfilt, windows.tukey), h5py, matplotlib.
- *Licence:* GWOSC data. The tutorial repository itself has no licence file. See Gaps.

**P2. Pantheon+ Hubble diagram: H₀ and Ω_m**
- *Data:* `Pantheon+SH0ES.dat` (1701 rows; 1543 unique CID strings; 77 calibrator rows covering 43 CIDs) [computed]. The `STAT+SYS.cov` file is 33.3 MB of text (2 893 402 lines = 1 + 1701²) and is not exactly symmetric at `allclose` tolerance, so symmetrize it before use.
- *[computed] reference outputs:*
  - M_B = −19.252 ± 0.040 mag (weighted mean of m_b_corr − CEPH_DIST over calibrators, diagonal errors).
  - H₀ = 73.21 ± 1.38 km s⁻¹ Mpc⁻¹, from 496 Hubble-flow SNe at 0.023 < z < 0.15 with a q₀ = −0.55, j₀ = 1 cosmographic d_L and diagonal errors.
  - Ω_m (flat ΛCDM, z > 0.01, analytically marginalized offset):
    - diagonal errors: 0.350 (Δχ² = 1 range 0.332–0.369), χ²/dof = 0.440, N = 1580
    - full STAT+SYS covariance, all z > 0.01: 0.332 (0.314–0.349), χ²/dof = 0.883, N = 1590
    - full covariance, non-calibrators only: 0.333 (0.315–0.351)
- *Lesson:* the full-covariance result reproduces the published 0.334 ± 0.018. The diagonal-only fit is biased, and its tiny χ²/dof is the warning sign.
- *Libraries:* numpy, scipy.integrate (cumulative_trapezoid/quad), scipy.optimize, matplotlib; optionally astropy.cosmology for checking.
- *Licence:* not stated in the repository. Cite Scolnic et al. 2022, Brout et al. 2022 and Riess et al. 2022.

**P3. Transiting exoplanet: Kepler-10b**
- *Data:* Kepler long-cadence light curve from MAST (via lightkurve or pre-extracted CSV); comparison parameters from the NASA Exoplanet Archive `pscomppars` table via TAP.
- *Steps:* detrend (median filter or Savitzky–Golay); BLS search over 0.5–1.5 d; fold; fit depth → (R_p/R★)²; duration; compare with the archive; injection–recovery test of detection threshold vs SNR.
- *Check:* the BLS peak "near 0.8 days" (tutorial). The precise archive period should be pulled from `pscomppars` at build time; not verified here.
- *Libraries:* numpy, scipy.signal (medfilt, savgol_filter), astropy.timeseries.BoxLeastSquares (optional; BLS is easy to hand-code).
- *Licence:* Lightkurve code is MIT. For Kepler/MAST and Exoplanet Archive data, see Gaps.

**P4. Mercury's perihelion precession by numerical integration (bridge to GR)**
- *Model:* Newtonian two-body plus the Schwarzschild-derived correction a = −(GM/r³)r·[1 + λ·3L²/(c²r²)], with an exaggeration factor λ.
- *Steps:* initial conditions at perihelion (a = 0.387098 AU, e = 0.205630) or from JPL Horizons `vectors()`; perihelia found via an event on r·v = 0; slope of perihelion angle per orbit.
- *[computed] reference outputs:*
  - P = 87.969 d; Δφ = 6πGM/(c²a(1 − e²)) = 5.0187×10⁻⁷ rad (0.1035″) per orbit, i.e. 42.98″ per Julian century.
  - DOP853 with rtol = 10⁻¹²: numerical/analytic ratio 1.0000 for λ = 1, 10, 100 and 1.0002 for λ = 1000. The exaggerate-and-extrapolate technique therefore works.
- *Extensions:* integrator comparison (RK4 vs leapfrog energy and precession error); planetary perturbations by N-body.
- *Libraries:* numpy, scipy.integrate.solve_ivp (events, DOP853).
- *Licence:* own simulation; Horizons data are public (citation conventions unverified).

**P5. Measuring g with a pendulum, honestly**
- *Virtual-lab data, or optional phone-sensor data.*
- *Model:* exact period T = (2/π)K(m = sin²(θ₀/2))·T₀. Note that SciPy's `ellipk` takes the *parameter* m, not the modulus k [primary-verified].
- *[computed] T/T₀ values:*

  | θ₀ | 5° | 10° | 20° | 30° | 45° | 60° | 90° | 120° | 170° |
  |---|---|---|---|---|---|---|---|---|---|
  | T/T₀ | 1.000476 | 1.001907 | 1.007669 | 1.017409 | 1.039973 | 1.073182 | 1.180341 | 1.372881 | 2.439363 |

  The series 1 + θ₀²/16 + 11θ₀⁴/3072 (confirmed with SymPy) matches to <10⁻⁵ up to 30° but gives 1.1760 at 90°. Passing k instead of m gives 1.0229 at 10°, a 2 % error trap.
- *Steps:* fit T(θ₀) and extrapolate to 0; physical-pendulum corrections (bob size, string mass); damping-induced amplitude decay during timing; MC uncertainty budget. With L = 1.000 ± 0.002 m and T = 2.006 ± 0.004 s, g = 9.811 ± 0.044 m s⁻².
- *Libraries:* numpy, scipy.special, scipy.optimize.

**P6. Counting statistics: radioactive decay or cosmic-ray muons**
- *Data:* simulated, with realistic dead time, background and afterpulsing. Optionally CosmicWatch-style detector logs (repository has no licence, so treat as illustrative only).
- *Questions:* is the count distribution Poisson? What is the half-life or lifetime? How do binning and χ² vs likelihood change the answer at low counts? Is the rate stable over time (χ² test of constancy)?
- *[computed] checks:* the net-rate and dead-time examples from §1.
- *Libraries:* numpy, scipy.stats, scipy.optimize.

**P7. Gaia parallaxes: distance to an open cluster and an HR diagram (optional)**
- *Data:* Gaia DR3 `gaia_source` cone search.
- *Lessons:* parallax-inversion bias at large σ_ϖ/ϖ; zero-point offsets; selection effects; credit per ESA's guide.
- *Libraries:* numpy, matplotlib; astroquery or a pre-extracted CSV.
- *Licence:* see Gaps.

#### Licensing summary for the report writer
- **Verified:**
  - Software Carpentry lessons: CC BY 4.0
  - arXiv metadata: CC0; papers: per-paper licence
  - Lightkurve: MIT
  - ODW 2024 repository: GPL-3.0
  - LOSC tutorial, Pantheon+ and CosmicWatch v2 repositories: no licence file
- **Unverified (see Gaps):** GWOSC data licence; NASA Exoplanet Archive and MAST acknowledgment terms; Gaia licence and credit wording.

### Gaps
- The GWOSC data licence and acknowledgment text could not be checked (gwosc.org blocked; search budget exhausted). My understanding is that GWOSC releases data under CC BY 4.0 with a requested acknowledgment. This must be confirmed at gwosc.org before shipping.
- The NASA Exoplanet Archive and MAST/Kepler acknowledgment wording was not retrieved. These are generally public NASA data with requested acknowledgments; unverified.
- The Gaia licence (my understanding is CC BY-SA 3.0 IGO with credit "ESA/Gaia/DPAC") was not verified; only the credits-page pointer is verified.
- The Pantheon+ reuse licence is not stated in the repository. Contact the authors or rely on academic citation.
- INSPIRE-HEP search syntax was not verified.
- No PHYS 4900 syllabus or learning outcomes beyond the catalog were found, nor whether USU runs a research-methods seminar.
- Kepler-10b's precise period, and how stable NumPy's seeded `Generator` streams are across versions, were not verified.

## 5. CS 1400 at USU and the scientific programming curriculum

### Takeaway
**USU-verified:** CS 1400 "Introduction to Computer Science–CS 1" is the first programming course, covering problem solving, programming, program development, algorithm analysis and data structures "in a current programming language environment". The language is Python: the only form of the challenge exam is Python. The scientific-programming track should start from that CS 1400 level and add NumPy, SciPy, Matplotlib and SymPy, along with the numerical-analysis core: floating point, differentiation, integration, roots, linear algebra, ODEs, FFT, Monte Carlo and fitting. Each module comes with physics exercises whose answers are computed and tolerance-checkable.

Current library APIs differ from textbook-era code: `np.trapz`, `scipy.integrate.simps/trapz/cumtrapz/romberg`, `scipy.misc.derivative` and `scipy.signal.tukey/blackman` are all gone, and `scipy.odr` is deprecated. Exercises must be written against current names.

### Cited Findings
- [USU-verified] CS 1400 covers the "science of problem solving, programming, program development, algorithm analysis, and data structures" in a current programming language environment.
  - Credits: 4 per the catalog; the ECE/CE FAQ lists 3, a discrepancy.
  - Prerequisites: MATH 1050 (C− or better), a Math ACT ≥ 25 or equivalent SAT, or AP Calculus AB ≥ 3.
  - It is followed by CS 1410 and is required, at C− or better, in the CS Pre-Professional Program.
  - The challenge exam is "currently available only in Python", needs 70 % on each section, and charges $50 for the programming section.
  - Sources: [USU catalog CS 1400](https://catalog.usu.edu/courses/CS1400); [CS 1400 catalog entry](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=328234); [USU CS challenge exams](https://engineering.usu.edu/cs/students/undergraduate/challenge-exams); [CS Pre-Professional Program](https://www.usu.edu/cs/students/undergraduate/pre-professional-program); [ECE FAQ](https://engineering.usu.edu/ece/students/undergraduate/faq) (via search summary)
- [USU-verified, 2015] PHYS 2500 "Introduction to Computer Methods in Physics" was a prerequisite for PHYS 3870, so USU had a physics-specific computing course. Its current status was not verified. — [Syllabus 3870 Fall 2015](https://www.physics.usu.edu/dennison/3870-3880/Syllabus%203870%20Fall%202015.pdf) (via search summary)
- AAPT computing recommendations:
  - AAPT's 2011 statement urged every physics department to give majors appropriate instruction in computational physics. The AAPT Undergraduate Curriculum Task Force (formed 2013) approved computational-physics recommendations in Oct 2016, summarized in an AJP guest editorial (Behringer & Engelhardt, AJP 85(5), 325–326, 2017).
  - One secondary analysis describes the structure as foundational technical-computing skills (processing data, visual representation, documents and presentations) underpinning "computational physics thinking", "a synthesis of physics principles and algorithmic thinking".
  - Sources: [AAPT Statement on Computational Physics](https://aapt.org/Resources/policy/Statement-on-Computational-Physics.cfm); [APS abstract on the AAPT recommendations](https://meetings-archive.aps.org/oss/2017/b5/2); [AAPT Undergraduate Physics Curriculum page](https://aapt.org/Resources/HigherEd/Undergraduate_Physics_Curriculum.cfm); [Learning-goal framework for computational thinking, arXiv:2105.07981](https://arxiv.org/pdf/2105.07981) (via search summary)
- PICUP (Partnership for Integration of Computation into Undergraduate Physics) hosts integration resources and exercise sets on ComPADRE. — [PICUP "Why should you integrate computation"](https://www.compadre.org/picup/resources/Entry.cfm?ID=120013) (existence via search). The Astro2020 white paper on training computational researchers recommends an early programming course plus an upper-division computational-methods course; this is not AAPT text. — [arXiv:1907.04460](https://arxiv.org/pdf/1907.04460) (via search summary)
- [primary-verified, NumPy 2.5.4 / SciPy 1.18.1 / SymPy 1.14.0 / Matplotlib 3.11.2] **API status:**
  - **Absent:** `numpy.trapz`; `scipy.integrate.simps`, `.trapz`, `.cumtrapz`, `.romberg`; `scipy.misc.derivative`; `scipy.signal.tukey` and `scipy.signal.blackman`.
  - **Present:** `numpy.trapezoid`; `scipy.integrate.simpson`, `.trapezoid`, `.cumulative_trapezoid`, `.quad`, `.solve_ivp`, `.odeint` (legacy); `scipy.differentiate.derivative`; `scipy.signal.windows.tukey/blackman`; `scipy.signal.welch`, `.find_peaks`, `.lombscargle`; `scipy.optimize.curve_fit`, `.least_squares`, `.root_scalar`, `.brentq`, `.minimize`; `matplotlib.mlab.psd`; `scipy.special.ellipk(m)`.
  - **`solve_ivp` methods:** 'RK45' (default), 'RK23', 'DOP853', 'Radau', 'BDF', 'LSODA'.
  - Sources: [SciPy release notes](https://docs.scipy.org/doc/scipy/release.html); [NumPy release notes](https://numpy.org/doc/stable/release.html); [scipy.integrate.solve_ivp](https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html)
- [primary-verified] Software Carpentry's lessons give a model progression.
  - "Programming with Python" (inflammation data), episodes: intro, numpy, matplotlib, lists, loop, files, cond, func, errors, defensive programming, debugging, command line.
  - "Plotting and Programming in Python" (gapminder): run/quit, variables, types and conversion, built-ins, libraries, reading tabular data, data frames, plotting, lists, for loops, conditionals, looping over data sets, writing functions, scope, style.
  - Source: [swcarpentry/python-novice-inflammation](https://github.com/swcarpentry/python-novice-inflammation); [swcarpentry/python-novice-gapminder](https://github.com/swcarpentry/python-novice-gapminder) (`config.yaml`)
- Newman's *Computational Physics* (Python) chapter sequence [not re-fetched]: Python programming → graphics and visualization → accuracy and speed → integrals and derivatives → linear and nonlinear equations → Fourier transforms → ODEs → PDEs → random processes and Monte Carlo. Landau, Páez & Bordeianu, *Computational Physics: Problem Solving with Python*, covers similar ground. — [Newman, Computational Physics (book site)](http://www-personal.umich.edu/~mejn/cp/); [Landau, Páez & Bordeianu (Wiley)](https://www.wiley.com/)

### Inferences

#### Module tree, track (c) Scientific Programming. Each module lists the specific skills and functions, then physics exercises with [computed] checkable outputs.
- **P0 Workflow.** Notebook vs script; reading tracebacks; printing library versions; seeding RNGs. *Exercise:* fix a NameError or TypeError from a traceback.
- **P1 Python fundamentals (CS 1400 refresher).**
  - Skills: int/float/complex/bool/str; `//`, `%`, `**`; f-string formats (`{x:.3f}`, `{x:.2e}`); list/tuple/dict/set; comprehensions; for/while with `range`, `enumerate`, `zip`; if/elif; functions (defaults, keyword arguments, multiple returns, docstrings); scope; modules; try/except/raise; `with open(...)`; dataclasses for a `State`; `sorted(key=…)`.
  - Exercises: eV↔J and pc↔m converters (tolerance check); bouncing ball with restitution e, counting bounces until h < 1 cm (integer); Kepler's third law from a dict of planets (T²/a³ constant within 1 %).
- **P2 Algorithms and computational reasoning.**
  - Skills: complexity O(N) vs O(N²); loop vs vectorization timing (`timeit`); bisection as an algorithm; compensated summation (`math.fsum`); time-stepping loops; testing with `assert`.
  - Exercise: bisection for √2 to 10⁻¹² needs 40 halvings on [1, 2] [computed]. Summing 0.1 a million times gives 100000.00000133288; `fsum` gives 100000.0 [computed].
- **P3 NumPy.**
  - Skills: array creation (`array`, `zeros`, `arange`, `linspace`, `logspace`, `meshgrid`); dtype and shape; slicing, boolean masks, fancy indexing; broadcasting; ufuncs; reductions (`sum`, `mean`, `std(ddof=1)`, `argmax`); `cumsum`, `diff`, `gradient`, `trapezoid`, `interp`, `where`, `histogram`; `loadtxt`/`genfromtxt`; `np.random.default_rng` (`normal`, `uniform`, `poisson`, `exponential`); `np.linalg` (`solve`, `eigh`, `svd`, `lstsq`, `norm`, `cond`); `np.fft` (`rfft`, `rfftfreq`); `Polynomial.fit`; `isclose`/`allclose`; `einsum` (tensor contractions, to prepare for GR).
  - Exercises:
    - Vectorized Planck spectrum peak; b = hc/(kx) with x = 4.965114231744276, giving 2.8977719551851727×10⁻³ m K, equal to CODATA.
    - Monte Carlo π: N = 10⁶ with seed 42 gives 3.14298, while the expected SD is 0.00164. Grade by tolerance, not by exact value.
    - Poisson histogram with mean ≈ variance.
    - Dipole potential on a meshgrid, with E = −∇V via `np.gradient`.
    - `einsum` check that g_{μν}u^μu^ν = −1 for a static observer in Schwarzschild.
- **P4 Matplotlib.**
  - Skills: the object-oriented API (`fig, ax = plt.subplots()`); `plot`, `scatter`, `errorbar`, `hist`, `loglog`, `semilogy`, `imshow`/`pcolormesh`, `contour`, `quiver`/`streamplot`; shared-x residual panels; mathtext labels with units; legends; `savefig`; perceptual colormaps; optional `FuncAnimation`.
  - Exercises: fit-plus-residual figure (auto-check two axes, non-empty labels, presence of an errorbar container); log–log ASD of GW strain.
- **P5 SymPy.**
  - Skills: `symbols` with assumptions; `diff`, `integrate`, `limit`, `series`, `simplify`, `solve`, `nsolve`, `dsolve`, `Matrix`, `lambdify`, `latex`. Symbolic error propagation u_f² = Σ(∂f/∂x_i)²u_i².
  - Exercises [computed]:
    - Series of (2/π)K(sin²(θ₀/2)) gives 1 + θ₀²/16 + 11θ₀⁴/3072.
    - From V_eff = −M/r + L²/(2r²) − ML²/r³ (G = c = 1), setting V′ = V″ = 0 gives the ISCO at r = 6M with L = 2√3 M.
    - Schwarzschild Christoffel symbols: Γ^r_tt = M(r − 2M)/r³, Γ^t_tr = M/(r(r − 2M)), Γ^θ_rθ = 1/r.
- **P6 Floating point and stability.** Exercises [computed]:
  - Machine epsilon 2.220446049250313×10⁻¹⁶; 0.1 + 0.2 = 0.30000000000000004.
  - (1 − cos x)/x² at x = 10⁻⁸ gives 0.0 naively, 0.5 via 2sin²(x/2)/x².
  - Small root of x² + 10⁸x + 1: naive −7.450580596923828×10⁻⁹, stable −1×10⁻⁸.
  - Condition number of the Hilbert matrix: 4.77×10⁵ (n = 5), 1.60×10¹³ (n = 10), 1.62×10¹⁶ (n = 12).
  - Also: `expm1`, `log1p`, overflow (`np.exp(710)`).
- **P7 Numerical differentiation.**
  - Skills: forward/central differences, the truncation–roundoff trade-off, Richardson extrapolation, `np.gradient(edge_order=2)`, `scipy.differentiate.derivative`, noise amplification when differentiating data.
  - Exercise: d(sin x)/dx at x = 1 [computed]. Forward-difference error is 4.2×10⁻³ at h = 10⁻², falls to 3.0×10⁻⁹ at 10⁻⁸, then rises to 4.3×10⁻⁵ at 10⁻¹². Central-difference error is 9.0×10⁻⁶ at h = 10⁻², 9.0×10⁻¹⁰ at 10⁻⁴, a minimum of 2.8×10⁻¹¹ at 10⁻⁶, then 5.9×10⁻⁸ at 10⁻¹⁰.
- **P8 Integration.**
  - Skills: trapezoid/Simpson (`np.trapezoid`, `scipy.integrate.simpson`); checking error order by halving h; Gauss–Legendre (`np.polynomial.legendre.leggauss`, `fixed_quad`); adaptive `quad` with its error estimate; improper integrals; `cumulative_trapezoid`; Monte Carlo in many dimensions.
  - Exercises [computed]:
    - ∫₀²(x⁴ − 2x + 1)dx = 4.4: trapezoid N = 10 gives 4.50656, Simpson N = 10 gives 4.400426666666667; at N = 100, 4.401066656 and 4.400000042666666.
    - ∫₀^∞ x³/(eˣ − 1)dx = 6.49393940226683 = π⁴/15, from which σ_SB = 2π⁵k⁴/(15h³c²). Use `expm1` and watch for overflow warnings.
- **P9 Roots and optimization.**
  - Skills: bisection, Newton (failure modes), secant, `brentq`/`root_scalar` with brackets, `fsolve`/`root` for systems, `minimize_scalar`, `minimize` (Nelder–Mead/BFGS).
  - Exercises [computed]:
    - Wien: 5e^{−x} + x − 5 = 0 gives x = 4.965114231744276.
    - Earth–Moon L1 with G = 6.674×10⁻¹¹, M = 5.974×10²⁴, m = 7.348×10²², R = 3.844×10⁸ m, ω = 2.662×10⁻⁶ s⁻¹: r = 3.2605×10⁸ m.
    - Kepler's equation for Mercury (e = 0.20563, M = 1 rad): E = 1.190974928331404.
- **P10 Linear algebra.**
  - Skills: `solve` rather than `inv`; conditioning; `eigh` for symmetric problems; SVD and `lstsq`; `scipy.sparse` for PDE matrices; `einsum` index gymnastics.
  - Exercises [computed]:
    - Three-mass chain: ω²/(k/m) = 2 − √2, 2, 2 + √2 = 0.5858, 2, 3.4142.
    - Finite-difference infinite well (ħ = m = L = 1, N = 1000): E₁..₃ = 4.93480, 19.73914, 44.41289 vs exact 4.93480, 19.73921, 44.41322 (E₂/E₁ = 3.99999).
- **P11 ODEs.**
  - Skills: explicit Euler; Euler–Cromer/symplectic Euler; velocity Verlet/leapfrog; RK4; `solve_ivp` (rtol/atol, `dense_output`, events); stiffness (Radau/BDF/LSODA); convergence-order checks; conserved quantities as tests.
  - Exercises [computed]: SHO energy after 100 periods with h = T/100 is explicit Euler 1.29×10¹⁷ E₀ (matches (1 + h²)^N), symplectic Euler 0.99357, Verlet 0.999989, RK4 0.999991. Also: the nonlinear pendulum period table (P5 above); Kepler-orbit conservation; Mercury's 42.98″/century (§4 P4); driven damped pendulum Poincaré sections; Lorenz sensitivity; projectile with quadratic drag; decay chains vs the Bateman analytic solution.
- **P12 Fourier and signals.**
  - Skills: `rfft`/`rfftfreq`, sampling and aliasing, `scipy.signal.windows.*`, leakage, `welch` PSD/ASD, `spectrogram`, `butter` + `sosfiltfilt`, convolution and correlation, whitening and matched filtering, Lomb–Scargle for uneven sampling.
  - Exercises [computed]: 60 Hz sampled at 100 Hz aliases to 40 Hz; ideal 12-bit ADC SNR 74.0 dB; GW150914 SNRs (§4 P1).
- **P13 Random numbers, Monte Carlo and statistics.**
  - Skills: `default_rng(seed)`; inverse-transform and rejection sampling; random walks (⟨x²⟩ = 2Dt); MC error ∝ 1/√N; bootstrap; Metropolis Ising (advanced); `scipy.stats` (`norm`, `t`, `chi2`, `poisson`; `ppf`/`cdf`/`sf`); χ² and KS tests.
  - Exercises [computed]: the χ²_red intervals, t-values and pendulum MC propagation from §1.
- **P14 Fitting and modelling (bridge to track a).**
  - Skills: normal equations from scratch; weighted fits; `curve_fit` with `p0`, `sigma`, `absolute_sigma=True` for known σ, and `bounds`; `least_squares` with robust loss; covariance and correlation matrices; χ² and p-values; Poisson MLE via `minimize`; optional MCMC (emcee); x- and y-errors via `odrpack`.
  - Exercises [computed]: Pantheon+ H₀ and Ω_m (§4 P2); Compton mₑc² from synthetic data (§2 E17).
- **P15 Simulation development and software practice.**
  - Skills: state + step function + diagnostics; model separate from rendering; unit and property tests; git; documentation; performance through vectorization; pinned versions and seeds.
  - Capstones: solar-system leapfrog with energy-drift budget; 1-D heat equation (explicit stability r ≤ ½); 1-D wave equation (CFL ≤ 1); Laplace relaxation (Jacobi/Gauss–Seidel/SOR).
- **P16 Data visualization for communication.** Error bars and bands, corner plots for posteriors, colour-blind-safe perceptual colormaps, figure checklists.

#### Python libraries and features the three tracks need
- **Language and standard library:** Python 3 with complex numbers, f-strings, exceptions, dataclasses and generators; `math`, `cmath`, `random`, `statistics`, `fractions`, `decimal`, `itertools`, `functools`, `collections`, `json`, `csv`, `timeit`, and file I/O to a virtual filesystem.
- **NumPy:** core, `linalg`, `fft`, `random.Generator`, `polynomial`.
- **SciPy:** `integrate`, `optimize`, `signal` (+ `windows`), `stats`, `special`, `linalg`, `sparse`, `interpolate`, `fft`, `constants`, `differentiate`.
- **Matplotlib:** pyplot, mathtext, optionally animation.
- **SymPy:** core; optionally `physics.units` and `diffgeom`.
- **h5py:** for GWOSC HDF5.
- **Optional:** pandas; astropy (units, constants, cosmology, `timeseries.BoxLeastSquares`/`LombScargle`, `io.fits`); lightkurve; emcee; uncertainties; `odrpack`.
- **Grading:** pytest-style asserts; optionally hypothesis for property tests.
- **Heavy and likely avoidable:** gwpy, pycbc, bilby. Pre-extract their outputs or reimplement the steps with numpy/scipy, as P1 does.

### Gaps
- The USU CS 1400 syllabus details (textbook, week-by-week topics, whether it covers NumPy or file I/O) were not retrieved, and neither was the CS 1410 language.
- PHYS 2500's current status in the USU catalog is unknown.
- The exact text of the AAPT 2016 computational recommendations, and PICUP's exercise catalogue, were not retrieved.
- The SciPy and NumPy versions in which each removal happened were not checked against release notes; only their status in SciPy 1.18.1 and NumPy 2.5.4 is verified.

## 6. How existing interactive tools teach this, and which exercise formats auto-grade robustly

### Takeaway
The successful models share three habits:
- They interleave short explanations with challenges that have hidden or collapsible solutions, stating objectives and key points per episode (Software Carpentry).
- They use real data with staged notebooks and an escalating "data challenge" (GW Open Data Workshop; Lightkurve tutorials).
- They grade code by running tests (nbgrader; otter-grader's exception-based or OK-format tests with points, hidden tests and custom failure messages).

For physics code, the robust auto-graded formats are numeric comparison with tolerances, convergence-order and conservation (property) tests, statistically toleranced tests for stochastic output, fit checks scaled by the reference uncertainty, symbolic equivalence via SymPy, and introspection of Matplotlib objects. Image diffs and exact matches on seeded random values are fragile.

### Cited Findings
- [primary-verified] Software Carpentry episodes carry YAML metadata (`teaching` and `exercises` minutes) plus fenced blocks for objectives, questions, callouts, challenges with nested solutions, and key points. For example, "Analyzing Patient Data" allots 40 min teaching and 20 min exercises. The instructional material is licensed CC BY 4.0. — [python-novice-inflammation episode 02-numpy.md](https://github.com/swcarpentry/python-novice-inflammation); [LICENSE.md](https://github.com/swcarpentry/python-novice-inflammation)
- [primary-verified] nbgrader is "a system for assigning and grading Jupyter notebooks". It has an instructor toolbar, a "formgrader" that generates the student version of an assignment, releases, collects, autogrades and supports manual grading, and a student assignment-list extension to fetch, submit and *validate*. — [jupyter/nbgrader README](https://github.com/jupyter/nbgrader)
- [primary-verified] otter-grader supports two Python test formats.
  - *Exception-based* tests: functions decorated with `test_case`, with `name`, `points`, `hidden`, `success_message` and `failure_message`; test arguments are filled from the student's global environment, or via `env`; options include `all_or_nothing` scoring.
  - *OK-format* tests.
  - A failing assert's message is shown to the student, e.g. `assert fib(1) == 0, "Your fib function didn't handle the base case correctly."`
  - Source: [ucbds-infra/otter-grader docs/test_files/python_format.rst](https://github.com/ucbds-infra/otter-grader)
- [primary-verified] The GW Open Data Workshop teaches through day-by-day notebooks followed by quizzes and a points-weighted Data Challenge. The challenges ask concrete, gradable questions: sampling rate and duration, merger time, PSD plot, SNR time series, matched-filter SNR. — [gw-odw/odw-2023](https://github.com/gw-odw/odw-2023)
- [primary-verified] Lightkurve's tutorials progress from "getting started" (periodogram objects, interactive BLS) to science examples: recovering a known planet, identifying transiting-planet signals, river plots, asteroseismology, rotation periods, SNR optimization of periodograms. — [lightkurve docs/source/tutorials](https://github.com/lightkurve/lightkurve)
- [primary-verified] Real tutorial code rots. The GWOSC event tutorial's `try: signal.tukey(...) except: signal.blackman(...)` fails on SciPy 1.18.1, because both names were removed from `scipy.signal` and now live in `scipy.signal.windows`. Its `requirements.txt` pins no versions. — [losc-tutorial/LOSC_Event_tutorial](https://github.com/losc-tutorial/LOSC_Event_tutorial); [scipy.signal.windows](https://docs.scipy.org/doc/scipy/reference/signal.windows.html)
- Teaching and assessment research instruments for lab and computation exist (PLIC, the DATA Lab model, computational-thinking learning-goal frameworks), but their contents were not retrieved. — [PLIC](https://cperl.lassp.cornell.edu/sites/cperl/files/publications/170719_PLIC.pdf); [arXiv:1904.01713](https://ar5iv.labs.arxiv.org/html/1904.01713); [arXiv:2105.07981](https://arxiv.org/pdf/2105.07981)

### Inferences

#### Exercise formats ranked by robustness of auto-grading

**Very robust**
1. Numeric answers with explicit tolerances (`np.isclose(ans, ref, rtol, atol)`). Use rtol ≈ 10⁻⁸ for deterministic computations and physically motivated tolerances for estimates. Accept equivalent forms (list, array, scalar).
2. Function tests against a reference implementation on fixed plus randomized inputs, including hidden tests and per-assert hint messages (the otter/nbgrader pattern).
3. Property tests:
   - conservation (|ΔE/E| < bound after N periods)
   - symmetry and time reversal
   - normalization
   - limiting cases (small-angle pendulum → T₀; low-z cosmology → Hubble law)
   - dimensional consistency through a units library
4. Convergence-order tests. Run the student's integrator at h, h/2 and h/4 and check that the error ratio ≈ 2^p (p = 1 Euler, 2 trapezoid/Verlet, 4 Simpson/RK4). This works regardless of implementation detail.

**Robust if designed carefully**
5. Stochastic outputs: test the mean within 5σ/√N and the variance, or use a KS test with a low p-threshold. Never grade an exact seeded value: generator streams and algorithms may change between versions (my unverified understanding of NumPy's stream policy), so an exact-value check would be fragile.
6. Fit results: accept when |p − p_ref| < 0.1–0.3σ_ref, *and* check the reported σ to catch `absolute_sigma` or `ddof` mistakes, *and* check χ².
7. Plots: introspect `Figure`/`Axes` (number of axes, labels and units present, line data arrays, errorbar containers, log scales). Avoid pixel or image diffs.
8. Symbolic answers: SymPy `simplify(a − b) == 0`, with a fallback of random numeric evaluation at several points (handles branch and assumption issues).

**Semi-automatic**
9. Parsons problems (reorder lines), fill-in-the-blank, and "fix the failing test" debugging tasks.
10. Data-challenge questions with numeric answers (ODW style), e.g. "merger GPS time to ±5 ms" or "SNR to ±0.5".
11. Lab-report checks:
    - automated presence checks: the abstract contains a number with uncertainty and a comparison in σ; the figure has axis labels with units
    - human or self-assessed rubric for argument quality
    - one-sentence micro-explanations scored against keyword rubrics, with self-assessment as backup

#### Engineering rules for graders
- Pin library versions per course release.
- Run with timeouts and sandboxing.
- Never rely on defaults that differ between libraries (`np.std` ddof = 0 vs `statistics.stdev`; `polyfit` weights are 1/σ; `curve_fit` `absolute_sigma` = False).
- Make test failure messages *teach* one sentence. This maps directly onto the lesson format's "one-sentence micro-teaching" hints.

#### Mapping to the house lesson format (intro → manipulable visual → worked example → 4–8 practice problems → checkpoint)
- **Lab track:** the manipulable visual is the simulated instrument (noise, systematic and sample-size sliders).
- **Programming track:** a live code cell with a pre-wired test panel.
- **Research track:** a real-data notebook stage with one ODW-style challenge question as the checkpoint.

### Gaps
- No comparative study of auto-grader robustness (false-pass and false-fail rates for tolerance vs property tests) was found or searched; the ranking above is design judgment.
- PICUP's exercise formats and any physics-specific auto-grading guidance were not retrieved.
- Commercial platforms (Gradescope autograder, PrairieLearn, WeBWorK) were not examined, because the search budget was exhausted.
