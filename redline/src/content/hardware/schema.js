/* The custom-hardware schema for a cold-gas thruster stand. No DOM.

   A hardware configuration is a plain JSON object: for every field, the
   value in the units a DATASHEET uses (psig, mm, Cv, ms, W — not the SI the
   physics runs in), where the number came from, and a note:

     { v: 0.06, src: 'datasheet' | 'measured' | 'estimate' | 'default', note: 'Swagelok …, p. 4' }

   The builder (stands/custom-coldgas.js) turns it into a stand definition.
   Fields left at 'default' carry the TS-1 reference value, which is a
   plausible small stand, not anyone's hardware: the editor flags every one
   still at a default or an estimate, because each is a number the
   prediction is only as good as.

   The topology is TS-1's: bottle → bottle valve → isolation valve →
   regulator (relief and vent on its outlet) → feed line and filter → fire
   solenoid → thruster, on a load-cell stand. Components a stand does not
   have can be marked not fitted. */

export const SOURCES = [
  ['datasheet', 'Datasheet'],
  ['measured', 'Measured'],
  ['estimate', 'Estimate'],
  ['default', 'Default'],
];

/* type: 'num' (default), 'sel' (opts), 'bool', 'text'. unit is shown and is
   the unit the value is IN. */
export const GROUPS = [
  { id: 'gas', title: 'Gas and site', fields: [
    { k: 'gas', label: 'Test gas', type: 'sel', opts: [['N2', 'Nitrogen'], ['AIR', 'Air'], ['He', 'Helium'], ['AR', 'Argon']], d: 'N2' },
    { k: 'Tamb', label: 'Ambient temperature', unit: '°C', d: 20 },
    { k: 'Pamb', label: 'Ambient pressure (site)', unit: 'psia', d: 14.696, help: 'Sea level 14.70; 1500 m ≈ 12.2. Sets the back-pressure on the nozzle — thrust at altitude is higher.' },
  ] },
  { id: 'supply', title: 'Supply bottle', fields: [
    { k: 'bottleV', label: 'Bottle water volume', unit: 'L', d: 49, help: 'K-size ≈ 49 L, T-size ≈ 44 L, paintball/SCUBA tanks 0.2–12 L.' },
    { k: 'fillP', label: 'Fill pressure (start of test)', unit: 'psig', d: 2200 },
    { k: 'serviceP', label: 'Bottle service pressure (rating)', unit: 'psig', d: 2400 },
    { k: 'hvCv', label: 'Bottle valve Cv', unit: 'Cv', d: 1.18 },
  ] },
  { id: 'iso', title: 'Supply line and isolation valve', fields: [
    { k: 'supID', label: 'Supply line ID (bottle → regulator)', unit: 'mm', d: 4.57, help: '1/4-in OD × 0.035-in wall tube: 4.57 mm. 1/8-in × 0.028: 1.75 mm.' },
    { k: 'supL', label: 'Supply line length', unit: 'm', d: 1.0 },
    { k: 'supExtra', label: 'Extra volume (fittings, valve bodies)', unit: 'cc', d: 48 },
    { k: 'ivFitted', label: 'Remote isolation valve fitted', type: 'bool', d: true, help: 'If not, the bottle valve is the only isolation and the "IV-101" console control does nothing.' },
    { k: 'ivCv', label: 'Isolation valve Cv', unit: 'Cv', d: 1.47 },
    { k: 'ivStroke', label: 'Isolation valve open time', unit: 's', d: 0.7 },
  ] },
  { id: 'reg', title: 'Regulator', fields: [
    { k: 'regModel', label: 'Make / model', type: 'text', d: 'TS-1 PR-101 (fictional)' },
    { k: 'regLoading', label: 'Loading', type: 'sel', opts: [['dome', 'Dome-loaded, electronic pressure controller'], ['spring', 'Spring-loaded, hand knob']], d: 'dome' },
    { k: 'regCv', label: 'Flow coefficient Cv', unit: 'Cv', d: 0.088, help: 'The regulator\'s Cv (sometimes "Cv max" or "flow capacity"). The main driver of droop and of how much flow it can pass at all.' },
    { k: 'regOutMax', label: 'Outlet range, maximum', unit: 'psig', d: 250 },
    { k: 'regInMax', label: 'Maximum inlet pressure', unit: 'psig', d: 4000 },
    { k: 'droopP', label: 'Droop: outlet drop …', unit: 'psi', d: 5, help: 'One point off the flow curve: the outlet falls by this much …' },
    { k: 'droopQ', label: '… at this flow', unit: 'SCFM', d: 21.5, help: '… at this flow (standard cubic feet per minute of the test gas; 1 SCFM N₂ ≈ 0.558 g/s) …' },
    { k: 'droopPin', label: '… with this inlet pressure', unit: 'psig', d: 2200 },
    { k: 'spe', label: 'Supply-pressure effect', unit: 'psi / 100 psi', d: 1.2, help: 'How much the outlet rises when the inlet falls by 100 psi (datasheets: "SPE" or "inlet sensitivity").' },
    { k: 'regTau', label: 'Response time constant', unit: 'ms', d: 1.0, help: 'Rarely published. 0.5–5 ms for small regulators.' },
    { k: 'setRate', label: 'Setpoint slew rate', unit: 'psi/s', d: 25, help: 'Dome: the EPC\'s slew. Hand knob: how fast a person turns it.' },
  ] },
  { id: 'relief', title: 'Relief valve (regulator outlet)', fields: [
    { k: 'rvFitted', label: 'Relief valve fitted', type: 'bool', d: true },
    { k: 'rvSet', label: 'Set (cracking) pressure', unit: 'psig', d: 250 },
    { k: 'rvCv', label: 'Relief Cv', unit: 'Cv', d: 0.71 },
  ] },
  { id: 'feed', title: 'Feed line (regulator → fire valve)', fields: [
    { k: 'feedID', label: 'Feed line ID', unit: 'mm', d: 7.75, help: '3/8-in OD × 0.035-in wall: 7.75 mm. Small tube costs a lot of pressure at cold-gas flows: 1/4-in tube at 12 g/s of N₂ loses ≈ 25 psi over a metre with a few fittings.' },
    { k: 'feedL', label: 'Feed line length', unit: 'm', d: 0.6 },
    { k: 'feedFittings', label: 'Elbows / tees in the feed line', unit: '', d: 2 },
    { k: 'feedExtra', label: 'Extra volume (fittings, manifold)', unit: 'cc', d: 70 },
    { k: 'filtFitted', label: 'Filter fitted', type: 'bool', d: true },
    { k: 'filtCv', label: 'Filter Cv', unit: 'Cv', d: 4.0 },
    { k: 'flowmeter', label: 'Mass flowmeter (Coriolis) in the feed line', type: 'bool', d: true },
    { k: 'fmRange', label: 'Flowmeter range', unit: 'g/s', d: 30 },
  ] },
  { id: 'sv', title: 'Fire valve (solenoid)', fields: [
    { k: 'svModel', label: 'Make / model', type: 'text', d: 'TS-1 SV-301 (fictional)' },
    { k: 'svType', label: 'Type', type: 'sel', opts: [['direct', 'Direct-acting'], ['pilot', 'Pilot-operated']], d: 'direct' },
    { k: 'svCv', label: 'Flow coefficient Cv', unit: 'Cv', d: 0.854, help: 'If only an orifice size is published, leave Cv blank (0) and give the orifice.' },
    { k: 'svOrifice', label: 'Orifice diameter (if no Cv)', unit: 'mm', d: 0 },
    { k: 'svVolts', label: 'Coil voltage', unit: 'V DC', d: 28 },
    { k: 'svWatts', label: 'Coil power', unit: 'W', d: 32.7 },
    { k: 'svMOPD', label: 'Maximum operating pressure differential (MOPD)', unit: 'psi', d: 400, help: 'Above this the coil cannot pull the valve open.' },
    { k: 'svMinDP', label: 'Minimum pressure differential (pilot-operated)', unit: 'psi', d: 0 },
    { k: 'svTopen', label: 'Response time, open', unit: 'ms', d: 5.4, help: 'Command to full open. Often published as "response time"; often at a stated pressure.' },
    { k: 'svTclose', label: 'Response time, close', unit: 'ms', d: 7.0 },
  ] },
  { id: 'thruster', title: 'Thruster', fields: [
    { k: 'thrModel', label: 'Name', type: 'text', d: 'CGT-1 (fictional)' },
    { k: 'throat', label: 'Throat diameter', unit: 'mm', d: 2.50, help: 'Measure it: pin gauges. Thrust and flow go as its square.' },
    { k: 'exit', label: 'Exit diameter', unit: 'mm', d: 3.55 },
    { k: 'halfAngle', label: 'Divergence half-angle', unit: '°', d: 15 },
    { k: 'Cd', label: 'Throat discharge coefficient', unit: '', d: 0.97, help: '0.95–0.99 for a well-made convergent; lower for small or sharp-edged throats. The first number your own test data will calibrate.' },
    { k: 'plenum', label: 'Plenum volume (valve seat → throat)', unit: 'cc', d: 2.5 },
  ] },
  { id: 'stand', title: 'Thrust stand', fields: [
    { k: 'lcRange', label: 'Load cell range (±)', unit: 'N', d: 50 },
    { k: 'lcAcc', label: 'Load cell accuracy', unit: '% FS', d: 0.05 },
    { k: 'standFn', label: 'Stand natural frequency', unit: 'Hz', d: 120, help: 'Tap the stand with the DAQ running and read the ring frequency. Typically 50–300 Hz.' },
    { k: 'standZeta', label: 'Stand damping ratio', unit: '', d: 0.10 },
    { k: 'tare', label: 'Pressure tare', unit: 'N per 100 psi', d: 0.20, help: 'How much the feed line pushes on the stand when pressurised. Measure: pressurise, valve shut, read the load cell.' },
  ] },
  { id: 'inst', title: 'Pressure transducers', fields: [
    { k: 'ptSupFS', label: 'Supply PTs full scale', unit: 'psig', d: 5000 },
    { k: 'ptLpFS', label: 'Low-side PTs full scale', unit: 'psig', d: 500 },
    { k: 'ptAcc', label: 'Accuracy', unit: '% FS', d: 0.25 },
    { k: 'ptTau', label: 'Response time', unit: 'ms', d: 0.5 },
  ] },
  { id: 'ratings', title: 'Ratings and limits', fields: [
    { k: 'mawp', label: 'Low-side MAWP (weakest component)', unit: 'psig', d: 300 },
    { k: 'meop', label: 'Low-side MEOP (highest planned test pressure)', unit: 'psig', d: 200 },
    { k: 'personnel', label: 'Personnel limit (cell open)', unit: 'psig', d: 50 },
  ] },
];

export const FIELDS = GROUPS.flatMap(g => g.fields.map(f => ({ ...f, group: g.id })));
export const field = k => FIELDS.find(f => f.k === k);

/* A config with every field at its default. */
export function defaultConfig(name = 'New stand') {
  const c = { name, version: 1, f: {} };
  for (const f of FIELDS) c.f[f.k] = { v: f.d, src: 'default', note: '' };
  return c;
}

/* Fill any fields a stored or imported config lacks (an older version). */
export function complete(cfg) {
  const out = { name: cfg.name || 'Unnamed', version: 1, f: { ...(cfg.f || {}) } };
  for (const f of FIELDS) if (!out.f[f.k]) out.f[f.k] = { v: f.d, src: 'default', note: '' };
  return out;
}

export const val = (cfg, k) => cfg.f[k]?.v ?? field(k)?.d;
