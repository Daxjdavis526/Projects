// The bestiary of THERA.
//
// Every animal is a row in this table: a body plan for anatomy.js, a set of
// numbers the AI reads, and the text the scanner prints. Nothing here is a
// real genus — these are convergent alien analogues, which is the excuse for
// the teal blood-warm colouring and the occasional extra horn.

import { BIOME } from '../world/field.js';

export const DIET = { HERBIVORE: 'HERBIVORE', CARNIVORE: 'CARNIVORE', OMNIVORE: 'OMNIVORE', PISCIVORE: 'PISCIVORE' };

export const SPECIES = {

  // ---------------------------------------------------------------- herbivores
  titanospine: {
    id: 'titanospine',
    name: 'TITANOSPINE',
    binomial: 'Vastadon colossus',
    klass: 'MEGAFAUNAL SAUROPOD',
    diet: DIET.HERBIVORE,
    danger: 1,
    massT: 42,
    lengthM: 26,
    body: {
      hipHeight: 4.6, shoulderHeight: 5.0, bodyLength: 6.2, bodyRadius: 1.9, bodyDepth: 2.1,
      spineCount: 4, barrel: 1.15, flatBelly: 0.10,
      neck: { count: 6, length: 9.2, rise: 0.62, arch: 0.9, radius0: 1.1, radius1: 0.34, headRise: 0.15 },
      tail: { count: 7, length: 9.0, radius0: 0.95, radius1: 0.05, droop: 0.22 },
      head: { length: 1.35, width: 0.72, height: 0.70, snout: 0.62, snoutHeight: 0.72, eyeSize: 0.1305, eyeAt: 0.30 },
      biped: false,
      legs: {
        thigh: 2.1, shin: 1.9, foot: 0.55, spread: 1.05, thickness: 0.40, bend: 0.16,
        frontThigh: 2.4, frontShin: 2.0, frontFoot: 0.5, frontSpread: 1.0, frontThickness: 0.37, frontBend: 0.12,
      },
      colors: { back: '#4a4436', side: '#6b6350', belly: '#8d8672', accent: '#2f4a3c' },
      pattern: 'dorsal',
      patternFreq: 1.2,
    },
    stats: {
      health: 4200, walk: 1.5, run: 3.4, turn: 0.28, sight: 70, hearing: 80, fov: 2.6,
      damage: 90, reach: 5.2, cooldown: 3.4, aggression: 0.04, flee: 16, stamina: 1e9,
      stepShake: 0.24, stepPeriod: 1.35,
    },
    behavior: { herd: 3, spacing: 22, nocturnal: 0, curiosity: 0.15, territorial: 0.05 },
    spawn: { weight: 1.0, biomes: { [BIOME.PLAINS]: 1.0, [BIOME.JUNGLE]: 0.65, [BIOME.SWAMP]: 0.3 }, maxAlive: 3 },
    loot: { meat: 14, hide: 6 },
    voice: { pitch: 0.28, callEvery: [40, 110], range: 900 },
    scan: 'Walks a fixed circuit between water and canopy and does not deviate for anything smaller than itself. Reports of trampling are almost always the animal failing to notice the trampled.',
  },

  crestwail: {
    id: 'crestwail',
    name: 'CRESTWAIL',
    binomial: 'Lophovox gregaria',
    klass: 'CRESTED HERD BROWSER',
    diet: DIET.HERBIVORE,
    danger: 2,
    massT: 3.1,
    lengthM: 8.4,
    body: {
      hipHeight: 2.0, shoulderHeight: 1.85, bodyLength: 2.5, bodyRadius: 0.72, bodyDepth: 0.86,
      spineCount: 3, flatBelly: 0.2,
      neck: { count: 3, length: 1.5, rise: 0.62, arch: 0.18, radius0: 0.42, radius1: 0.26 },
      tail: { count: 6, length: 3.3, radius0: 0.55, radius1: 0.04, droop: 0.14, flat: true },
      head: {
        length: 0.92, width: 0.38, height: 0.42, snout: 0.75, snoutHeight: 0.8,
        crest: 0.72, crestBack: 0.9, eyeSize: 0.0798, eyeAt: 0.3,
      },
      biped: false,
      legs: {
        thigh: 1.0, shin: 0.85, foot: 0.32, spread: 0.42, thickness: 0.17, bend: 0.62,
        frontThigh: 0.72, frontShin: 0.62, frontFoot: 0.24, frontSpread: 0.36, frontThickness: 0.12, frontBend: 0.42,
      },
      colors: { back: '#4c5a34', side: '#7d8352', belly: '#b3ad84', accent: '#d4762e' },
      pattern: 'stripes',
      patternFreq: 2.0,
    },
    stats: {
      health: 340, walk: 2.4, run: 11.5, turn: 1.5, sight: 95, hearing: 130, fov: 4.4,
      damage: 22, reach: 2.2, cooldown: 2.0, aggression: 0.05, flee: 42, stamina: 26,
      stepShake: 0.02, stepPeriod: 0.52,
    },
    behavior: { herd: 9, spacing: 7, nocturnal: 0, curiosity: 0.4, territorial: 0.05, skittish: 0.8 },
    spawn: { weight: 2.4, biomes: { [BIOME.PLAINS]: 1.0, [BIOME.JUNGLE]: 0.55, [BIOME.BEACH]: 0.3, [BIOME.SWAMP]: 0.35 }, maxAlive: 14 },
    loot: { meat: 5, hide: 2 },
    voice: { pitch: 1.0, callEvery: [12, 34], range: 700 },
    scan: 'The crest is a resonating chamber. A herd passes alarm calls across four kilometres of open ground in under a minute, which is why you will hear them panic long before you learn why.',
  },

  ironback: {
    id: 'ironback',
    name: 'IRONBACK',
    binomial: 'Scutocauda clava',
    klass: 'ARMOURED GRAZER',
    diet: DIET.HERBIVORE,
    danger: 4,
    massT: 4.4,
    lengthM: 6.2,
    body: {
      hipHeight: 1.25, shoulderHeight: 1.20, bodyLength: 2.4, bodyRadius: 1.05, bodyDepth: 0.72,
      spineCount: 3, barrel: 1.2, flatBelly: 0.35,
      neck: { count: 2, length: 0.62, rise: 0.1, radius0: 0.44, radius1: 0.34 },
      tail: { count: 5, length: 2.5, radius0: 0.42, radius1: 0.14, droop: 0.02 },
      head: { length: 0.66, width: 0.52, height: 0.36, snout: 0.78, snoutHeight: 0.9, horns: 0.16, eyeSize: 0.058, eyeAt: 0.36 },
      biped: false,
      legs: {
        thigh: 0.52, shin: 0.44, foot: 0.24, spread: 0.62, thickness: 0.20, bend: 0.42,
        frontThigh: 0.46, frontShin: 0.40, frontFoot: 0.22, frontSpread: 0.60, frontThickness: 0.19, frontBend: 0.36,
      },
      armor: { plates: 8, plateSize: 0.26, spikes: 4, spikeSize: 0.34, club: 0.52 },
      colors: { back: '#3b3a2e', side: '#57543f', belly: '#7a7458', accent: '#8a6a34' },
      pattern: 'dorsal',
      patternFreq: 1.6,
    },
    stats: {
      health: 1500, walk: 1.6, run: 5.4, turn: 1.0, sight: 45, hearing: 70, fov: 3.4,
      damage: 110, reach: 3.4, cooldown: 2.2, aggression: 0.22, flee: 12, stamina: 40,
      stepShake: 0.05, stepPeriod: 0.6, armorFront: 0.82,
    },
    behavior: { herd: 2, spacing: 12, nocturnal: 0.2, curiosity: 0.2, territorial: 0.4, standsGround: 1 },
    spawn: { weight: 1.5, biomes: { [BIOME.PLAINS]: 0.9, [BIOME.HIGHLAND]: 1.0, [BIOME.JUNGLE]: 0.4, [BIOME.VOLCANIC]: 0.5 }, maxAlive: 5 },
    loot: { meat: 7, hide: 5, plate: 2 },
    voice: { pitch: 0.6, callEvery: [30, 80], range: 400 },
    scan: 'Does not run. Rotates to keep its armoured flank toward a threat and waits for the threat to make a mistake. The tail club swings at roughly twenty metres per second.',
  },

  palisade: {
    id: 'palisade',
    name: 'PALISADE',
    binomial: 'Triceros vallum',
    klass: 'HORNED BROWSER',
    diet: DIET.HERBIVORE,
    danger: 5,
    massT: 6.8,
    lengthM: 7.6,
    body: {
      hipHeight: 1.85, shoulderHeight: 2.05, bodyLength: 2.8, bodyRadius: 1.05, bodyDepth: 1.05,
      spineCount: 3, barrel: 1.1, flatBelly: 0.2,
      neck: { count: 2, length: 0.7, rise: 0.05, radius0: 0.66, radius1: 0.56 },
      tail: { count: 4, length: 1.7, radius0: 0.48, radius1: 0.08, droop: 0.12 },
      head: {
        length: 1.35, width: 0.72, height: 0.62, snout: 0.42, snoutHeight: 0.62,
        horns: 0.92, frill: 1.15, brow: 0.06, eyeSize: 0.0798, eyeAt: 0.30,
      },
      biped: false,
      legs: {
        thigh: 0.86, shin: 0.72, foot: 0.3, spread: 0.66, thickness: 0.26, bend: 0.30,
        frontThigh: 0.8, frontShin: 0.68, frontFoot: 0.28, frontSpread: 0.66, frontThickness: 0.26, frontBend: 0.22,
      },
      colors: { back: '#5a4630', side: '#7d6242', belly: '#a08a67', accent: '#c25a3a' },
      pattern: 'plain',
      patternFreq: 1.4,
    },
    stats: {
      health: 1900, walk: 1.9, run: 10.5, turn: 1.15, sight: 80, hearing: 90, fov: 3.6,
      damage: 145, reach: 3.8, cooldown: 2.6, aggression: 0.34, flee: 10, stamina: 34,
      stepShake: 0.08, stepPeriod: 0.62, chargeSpeed: 13.5,
    },
    behavior: { herd: 3, spacing: 11, nocturnal: 0, curiosity: 0.25, territorial: 0.75, standsGround: 1 },
    spawn: { weight: 1.4, biomes: { [BIOME.PLAINS]: 1.0, [BIOME.JUNGLE]: 0.45, [BIOME.HIGHLAND]: 0.5 }, maxAlive: 6 },
    loot: { meat: 9, hide: 4, horn: 1 },
    voice: { pitch: 0.5, callEvery: [22, 60], range: 550 },
    scan: 'Territorial to a fault. The frill is display, the brow horns are not. It will give one warning — a short hard bark and a head-down stance — and then it commits.',
  },

  dartleg: {
    id: 'dartleg',
    name: 'DARTLEG',
    binomial: 'Cursor minimus',
    klass: 'SMALL CURSORIAL BROWSER',
    diet: DIET.OMNIVORE,
    danger: 0,
    massT: 0.02,
    lengthM: 1.1,
    body: {
      hipHeight: 0.52, shoulderHeight: 0.44, bodyLength: 0.38, bodyRadius: 0.11, bodyDepth: 0.14,
      spineCount: 2,
      neck: { count: 2, length: 0.22, rise: 0.7, radius0: 0.07, radius1: 0.05 },
      tail: { count: 4, length: 0.52, radius0: 0.08, radius1: 0.012, droop: 0.02 },
      head: { length: 0.17, width: 0.09, height: 0.10, snout: 0.5, eyeSize: 0.0319, eyeAt: 0.32 },
      biped: true,
      arms: { at: 0.9, upper: 0.11, fore: 0.10, thickness: 0.014, claw: 0.05 },
      legs: { thigh: 0.24, shin: 0.24, foot: 0.11, spread: 0.07, thickness: 0.034, bend: 0.85 },
      colors: { back: '#5c5326', side: '#8a7c3e', belly: '#cbbd86', accent: '#2e6b52' },
      pattern: 'spots',
      patternFreq: 11,
    },
    stats: {
      health: 28, walk: 1.6, run: 9.8, turn: 4.5, sight: 55, hearing: 70, fov: 4.8,
      damage: 2, reach: 0.6, cooldown: 1.5, aggression: 0.0, flee: 30, stamina: 12,
      stepShake: 0, stepPeriod: 0.3,
    },
    behavior: { herd: 5, spacing: 3, nocturnal: 0.3, curiosity: 0.55, territorial: 0, skittish: 1.0 },
    spawn: { weight: 3.2, biomes: { [BIOME.JUNGLE]: 1.0, [BIOME.PLAINS]: 1.0, [BIOME.BEACH]: 0.6, [BIOME.SWAMP]: 0.7, [BIOME.HIGHLAND]: 0.5 }, maxAlive: 16 },
    loot: { meat: 1 },
    voice: { pitch: 2.6, callEvery: [6, 20], range: 120 },
    scan: 'Two kilos of muscle and panic. Edible, fast, and the first thing on this planet you will successfully kill.',
  },

  // ---------------------------------------------------------------- predators
  sicklerunner: {
    id: 'sicklerunner',
    name: 'SICKLERUNNER',
    binomial: 'Falcapes venator',
    klass: 'PACK-HUNTING THEROPOD',
    diet: DIET.CARNIVORE,
    danger: 6,
    massT: 0.09,
    lengthM: 2.6,
    body: {
      hipHeight: 1.02, shoulderHeight: 1.02, bodyLength: 0.78, bodyRadius: 0.20, bodyDepth: 0.26,
      spineCount: 3,
      neck: { count: 3, length: 0.48, rise: 0.55, arch: 0.1, radius0: 0.13, radius1: 0.085 },
      tail: { count: 6, length: 1.35, radius0: 0.115, radius1: 0.016, droop: -0.02 },
      head: { length: 0.36, width: 0.15, height: 0.17, snout: 0.42, snoutHeight: 0.62, teeth: 6, toothScale: 0.8, eyeSize: 0.0406, eyeAt: 0.30, brow: 0.02 },
      biped: true,
      arms: { at: 0.9, upper: 0.30, fore: 0.28, thickness: 0.030, claw: 0.14 },
      legs: { thigh: 0.44, shin: 0.42, foot: 0.20, spread: 0.13, thickness: 0.060, bend: 0.88 },
      colors: { back: '#243a2c', side: '#3d5a3a', belly: '#8a8f63', accent: '#c9a227' },
      pattern: 'stripes',
      patternFreq: 4.6,
    },
    stats: {
      health: 120, walk: 2.6, run: 14.2, turn: 3.4, sight: 130, hearing: 150, fov: 3.0,
      damage: 17, reach: 1.6, cooldown: 1.1, aggression: 0.82, flee: 0, stamina: 22,
      stepShake: 0, stepPeriod: 0.34, leap: 6.5,
    },
    behavior: {
      herd: 4, spacing: 9, nocturnal: 0.45, curiosity: 0.8, territorial: 0.5,
      pack: true, stalk: 1.0, flank: 1.0,
    },
    spawn: { weight: 2.0, biomes: { [BIOME.JUNGLE]: 1.0, [BIOME.PLAINS]: 0.8, [BIOME.SWAMP]: 0.5, [BIOME.HIGHLAND]: 0.4 }, maxAlive: 8 },
    loot: { meat: 3, claw: 1 },
    voice: { pitch: 1.8, callEvery: [8, 22], range: 320 },
    scan: 'Hunts in coordinated groups of three to six. One animal shows itself and holds your attention. The others are already behind you. Do not treat a single Sicklerunner as a single Sicklerunner.',
  },

  fenstalker: {
    id: 'fenstalker',
    name: 'FENSTALKER',
    binomial: 'Paludomorph insidiator',
    klass: 'AMBUSH SEMI-AQUATIC PREDATOR',
    diet: DIET.CARNIVORE,
    danger: 8,
    massT: 5.5,
    lengthM: 9.5,
    body: {
      hipHeight: 0.78, shoulderHeight: 0.80, bodyLength: 2.6, bodyRadius: 0.78, bodyDepth: 0.52,
      spineCount: 4, barrel: 1.1, flatBelly: 0.45,
      neck: { count: 2, length: 0.8, rise: 0.05, radius0: 0.52, radius1: 0.42 },
      tail: { count: 7, length: 4.2, radius0: 0.62, radius1: 0.05, droop: 0.0, flat: true },
      head: { length: 1.85, width: 0.62, height: 0.44, snout: 0.42, snoutHeight: 0.7, teeth: 11, eyeSize: 0.0725, eyeAt: 0.18, brow: 0.07 },
      biped: false,
      legs: {
        thigh: 0.42, shin: 0.36, foot: 0.26, spread: 0.72, thickness: 0.16, bend: 0.72,
        frontThigh: 0.36, frontShin: 0.32, frontFoot: 0.24, frontSpread: 0.68, frontThickness: 0.14, frontBend: 0.72,
      },
      armor: { plates: 6, plateSize: 0.14 },
      colors: { back: '#25301f', side: '#3a4229', belly: '#6d6a4a', accent: '#1a2b30' },
      pattern: 'spots',
      patternFreq: 2.2,
    },
    stats: {
      health: 1400, walk: 1.4, run: 9.5, turn: 1.6, sight: 60, hearing: 110, fov: 3.2,
      damage: 78, reach: 3.4, cooldown: 2.4, aggression: 0.9, flee: 0, stamina: 14,
      stepShake: 0.06, stepPeriod: 0.62, lunge: 9.0, amphibious: 1,
    },
    behavior: { herd: 1, spacing: 40, nocturnal: 0.6, curiosity: 0.3, territorial: 0.9, ambush: 1.0 },
    spawn: { weight: 1.2, biomes: { [BIOME.SWAMP]: 1.0, [BIOME.JUNGLE]: 0.35, [BIOME.BEACH]: 0.25 }, maxAlive: 3, nearWater: 1 },
    loot: { meat: 8, hide: 4 },
    voice: { pitch: 0.42, callEvery: [30, 90], range: 480 },
    scan: 'Holds station in shallow water with only the eye ridges above the surface, for hours. Heart rate under four beats per minute while waiting. It is not asleep.',
  },

  ashmaw: {
    id: 'ashmaw',
    name: 'ASHMAW',
    binomial: 'Pyrothere rex',
    klass: 'APEX THEROPOD',
    diet: DIET.CARNIVORE,
    danger: 9,
    massT: 9.2,
    lengthM: 13.0,
    body: {
      hipHeight: 3.15, shoulderHeight: 3.30, bodyLength: 3.2, bodyRadius: 0.82, bodyDepth: 0.98,
      spineCount: 4, flatBelly: 0.15,
      neck: { count: 3, length: 1.85, rise: 0.42, arch: 0.26, radius0: 0.56, radius1: 0.40 },
      tail: { count: 7, length: 5.6, radius0: 0.60, radius1: 0.05, droop: 0.08 },
      head: {
        length: 1.72, width: 0.86, height: 0.98, snout: 0.55, snoutHeight: 0.66,
        teeth: 9, toothScale: 1.35, brow: 0.12, eyeSize: 0.1087, eyeAt: 0.26,
      },
      biped: true,
      arms: { at: 0.88, upper: 0.62, fore: 0.5, thickness: 0.09, claw: 0.22 },
      legs: { thigh: 1.62, shin: 1.42, foot: 0.62, spread: 0.62, thickness: 0.29, bend: 0.78 },
      armor: { plates: 5, plateSize: 0.13 },
      colors: { back: '#2b2620', side: '#463b30', belly: '#7d6c56', accent: '#b03a1e' },
      pattern: 'dorsal',
      patternFreq: 1.1,
    },
    stats: {
      health: 3400, walk: 2.4, run: 13.0, turn: 1.05, sight: 150, hearing: 190, fov: 3.1,
      damage: 165, reach: 4.6, cooldown: 2.1, aggression: 0.95, flee: 0, stamina: 30,
      stepShake: 0.30, stepPeriod: 0.78, roarShake: 0.5,
    },
    behavior: { herd: 1, spacing: 300, nocturnal: 0.35, curiosity: 0.6, territorial: 1.0, stalk: 0.7 },
    spawn: { weight: 0.55, biomes: { [BIOME.JUNGLE]: 0.9, [BIOME.PLAINS]: 1.0, [BIOME.SWAMP]: 0.7, [BIOME.VOLCANIC]: 0.6, [BIOME.HIGHLAND]: 0.5 }, maxAlive: 2 },
    loot: { meat: 12, hide: 6, tooth: 2 },
    voice: { pitch: 0.24, callEvery: [25, 70], range: 1600 },
    scan: 'Nine tonnes. Bite force somewhere past fifty kilonewtons. Hunts by walking in a straight line toward whatever it has decided about, and it decides quickly. An arrow will annoy it.',
  },

  dreadcrown: {
    id: 'dreadcrown',
    name: 'DREADCROWN',
    binomial: 'Pyrothere imperator',
    klass: 'APEX THEROPOD — AGED',
    diet: DIET.CARNIVORE,
    danger: 10,
    massT: 21,
    lengthM: 18.5,
    rare: true,
    body: {
      hipHeight: 4.5, shoulderHeight: 4.7, bodyLength: 4.4, bodyRadius: 1.14, bodyDepth: 1.32,
      spineCount: 4, flatBelly: 0.12,
      neck: { count: 3, length: 2.5, rise: 0.42, arch: 0.34, radius0: 0.78, radius1: 0.54 },
      tail: { count: 8, length: 7.8, radius0: 0.82, radius1: 0.06, droop: 0.08 },
      head: {
        length: 2.35, width: 1.16, height: 1.32, snout: 0.55, snoutHeight: 0.66,
        teeth: 11, toothScale: 1.6, brow: 0.22, horns: 0.34, eyeSize: 0.145, eyeAt: 0.25,
      },
      biped: true,
      arms: { at: 0.88, upper: 0.85, fore: 0.68, thickness: 0.12, claw: 0.32 },
      legs: { thigh: 2.25, shin: 2.0, foot: 0.86, spread: 0.86, thickness: 0.40, bend: 0.74 },
      armor: { plates: 7, plateSize: 0.24, sail: 0.5 },
      colors: { back: '#1c1a19', side: '#332c27', belly: '#5f5346', accent: '#e0561c' },
      pattern: 'dorsal',
      patternFreq: 0.8,
    },
    stats: {
      health: 11000, walk: 2.2, run: 12.0, turn: 0.85, sight: 190, hearing: 240, fov: 3.2,
      damage: 340, reach: 6.4, cooldown: 2.4, aggression: 1.0, flee: 0, stamina: 60,
      stepShake: 0.55, stepPeriod: 0.94, roarShake: 1.0, armorFront: 0.35,
    },
    behavior: { herd: 1, spacing: 900, nocturnal: 0.3, curiosity: 0.5, territorial: 1.0, stalk: 0.5 },
    spawn: { weight: 0.06, biomes: { [BIOME.VOLCANIC]: 1.0, [BIOME.HIGHLAND]: 0.35, [BIOME.PLAINS]: 0.2 }, maxAlive: 1, minDistance: 260 },
    loot: { meat: 30, hide: 14, tooth: 6, crown: 1 },
    voice: { pitch: 0.16, callEvery: [40, 120], range: 2600 },
    scan: 'One of these is alive on this continent. Scar tissue across sixty percent of the dorsal surface, healed. Whatever put it there is no longer alive. Recommend you are not the next entry in that sequence.',
  },

  // ---------------------------------------------------------------- small life
  glimmerfin: {
    id: 'glimmerfin',
    name: 'GLIMMERFIN',
    binomial: 'Argentopiscis fluvius',
    klass: 'FRESHWATER SHOAL FISH',
    diet: DIET.OMNIVORE,
    danger: 0,
    massT: 0.004,
    lengthM: 0.42,
    aquatic: true,
    body: {
      hipHeight: 0.09, shoulderHeight: 0.09, bodyLength: 0.16, bodyRadius: 0.045, bodyDepth: 0.075,
      spineCount: 2,
      neck: { count: 1, length: 0.05, rise: 0, radius0: 0.04, radius1: 0.03 },
      tail: { count: 4, length: 0.2, radius0: 0.05, radius1: 0.012, droop: 0, flat: true },
      head: { length: 0.08, width: 0.05, height: 0.055, snout: 0.4, eyeSize: 0.0203, eyeAt: 0.3 },
      biped: true,
      legs: { thigh: 0.01, shin: 0.01, foot: 0.01, spread: 0.02, thickness: 0.006, bend: 0 },
      armor: { sail: 0.06 },
      colors: { back: '#2a4657', side: '#6d97a8', belly: '#d5e2e0', accent: '#7fe3c8' },
      pattern: 'countershade',
      patternFreq: 26,
    },
    stats: {
      health: 6, walk: 0.9, run: 3.6, turn: 5.0, sight: 18, hearing: 22, fov: 5.0,
      damage: 0, reach: 0.2, cooldown: 1, aggression: 0, flee: 9, stamina: 8, stepShake: 0, stepPeriod: 0.2,
    },
    behavior: { herd: 8, spacing: 1.2, nocturnal: 0, curiosity: 0.2, territorial: 0, skittish: 1 },
    spawn: { weight: 4.0, biomes: {}, maxAlive: 24, aquatic: 1 },
    loot: { meat: 2 },
    voice: { pitch: 3, callEvery: [999, 999], range: 1 },
    scan: 'Shoals in the slack water behind gravel bars. High oil content. The single most reliable calorie on this planet, if you can hit one.',
  },

  skylance: {
    id: 'skylance',
    name: 'SKYLANCE',
    binomial: 'Aeropteryx longus',
    klass: 'COASTAL PTEROSAUR',
    diet: DIET.PISCIVORE,
    danger: 1,
    massT: 0.03,
    lengthM: 2.0,
    wingspanM: 6.2,
    flying: true,
    body: {
      hipHeight: 0.22, shoulderHeight: 0.24, bodyLength: 0.42, bodyRadius: 0.11, bodyDepth: 0.13,
      spineCount: 2,
      neck: { count: 3, length: 0.62, rise: 0.35, radius0: 0.075, radius1: 0.05 },
      tail: { count: 3, length: 0.3, radius0: 0.06, radius1: 0.01, droop: 0 },
      head: { length: 0.62, width: 0.10, height: 0.13, snout: 0.22, snoutHeight: 0.45, crest: 0.26, crestBack: 0.2, eyeSize: 0.0319, eyeAt: 0.16 },
      biped: false,
      legs: {
        thigh: 0.18, shin: 0.16, foot: 0.08, spread: 0.09, thickness: 0.022, bend: 0.7,
        // The wings are front limbs, held out sideways and not scaled to reach
        // the ground — hence frontFit: false.
        frontThigh: 1.5, frontShin: 1.35, frontFoot: 0.35, frontSpread: 0.11,
        frontThickness: 0.032, frontBend: 0.06, frontFit: false, frontOut: 1.46,
      },
      colors: { back: '#4a4038', side: '#7a6d5c', belly: '#cfc7b4', accent: '#c1462f' },
      pattern: 'plain',
      patternFreq: 6,
    },
    stats: {
      health: 40, walk: 1.2, run: 18.0, turn: 1.8, sight: 200, hearing: 60, fov: 4.2,
      damage: 8, reach: 1.2, cooldown: 2, aggression: 0.05, flee: 60, stamina: 1e9,
      stepShake: 0, stepPeriod: 0.4,
    },
    behavior: { herd: 5, spacing: 18, nocturnal: 0, curiosity: 0.3, territorial: 0 },
    spawn: { weight: 1.6, biomes: { [BIOME.BEACH]: 1.0, [BIOME.OCEAN]: 0.8, [BIOME.SWAMP]: 0.4, [BIOME.HIGHLAND]: 0.3 }, maxAlive: 8, flying: 1 },
    loot: { meat: 2 },
    voice: { pitch: 2.1, callEvery: [10, 30], range: 400 },
    scan: 'Six-metre wingspan on thirty kilos. Rides the thermal off the volcanic slopes at dawn and does not flap for hours at a time.',
  },
};

export const SPECIES_LIST = Object.values(SPECIES);
export const GROUND_SPECIES = SPECIES_LIST.filter(s => !s.aquatic && !s.flying);

/** Rough shoulder-to-ground distance, used for camera and collision sizing. */
export function creatureHeight(sp) {
  return Math.max(sp.body.hipHeight, sp.body.shoulderHeight)
    + (sp.body.neck.length * (sp.body.neck.rise ?? 0.4));
}

/** Body radius used for hit tests and separation. */
export function creatureRadius(sp) {
  return Math.max(0.35, sp.body.bodyRadius * 1.15);
}

export function dangerWord(d) {
  if (d <= 0) return 'HARMLESS';
  if (d <= 2) return 'LOW';
  if (d <= 4) return 'MODERATE';
  if (d <= 6) return 'HIGH';
  if (d <= 8) return 'SEVERE';
  return 'DO NOT ENGAGE';
}
