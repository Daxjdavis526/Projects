// PRIMEVAL — global tunables. One place to poke when something feels wrong.

export const WORLD_SEED = 20260908;

export const QUALITY = {
  PERFORMANCE: {
    name: 'PERFORMANCE',
    ao: false,
    msaa: 0,                 // multisample count on the post-chain target
    renderScale: 0.72,
    shadows: true,
    shadowSize: 1024,
    shadowDistance: 90,
    terrainRange: 1.0,        // multiplier on quadtree LOD aggressiveness
    lodBias: 1.5,             // higher = coarser terrain sooner
    vegDensity: 0.42,
    vegRange: 260,
    grassRange: 78,
    bloom: false,
    maxDinos: 16,
    fogDetail: false,
    waterQuality: 0,
    cloudLayers: 1,
    particleScale: 0.5,
  },
  BALANCED: {
    name: 'BALANCED',
    ao: true,
    aoOpts: { intensity: 0.85, radius: 1.1, bias: 0.03, power: 2.6 },
    msaa: 4,                 // multisample count on the post-chain target
    renderScale: 1.0,
    shadows: true,
    shadowSize: 2048,
    shadowDistance: 140,
    terrainRange: 1.35,
    lodBias: 1.0,
    vegDensity: 1.0,
    vegRange: 420,
    grassRange: 132,
    bloom: true,
    maxDinos: 28,
    fogDetail: true,
    waterQuality: 1,
    cloudLayers: 2,
    particleScale: 1.0,
  },
  ULTRA: {
    name: 'ULTRA',
    ao: true,
    aoOpts: { intensity: 0.92, radius: 1.3, bias: 0.028, power: 2.8 },
    msaa: 8,                 // multisample count on the post-chain target
    renderScale: 1.0,
    shadows: true,
    shadowSize: 4096,
    shadowDistance: 210,
    terrainRange: 1.9,
    lodBias: 0.75,
    vegDensity: 1.7,
    vegRange: 620,
    grassRange: 190,
    bloom: true,
    maxDinos: 42,
    fogDetail: true,
    waterQuality: 2,
    cloudLayers: 3,
    particleScale: 1.5,
  },
};

export const PLANET = {
  name: 'THERA',
  seaLevel: 0,
  // Visual curvature radius (m). Not the real radius — it is tuned so the
  // horizon bends convincingly at the distances you can actually see.
  curveRadius: 420000,
  gravity: 11.4,
  dayLength: 1080,            // seconds of real time for a full day/night cycle
  atmosphereTop: 62000,       // where the sky is fully black
  cloudDeck: 1250,
  stormCloudDeck: 900,
};

export const MOON = {
  name: 'ANVIL',
  gravity: 2.05,
  curveRadius: 90000,
  dayLength: 4200,
};

export const PLAYER = {
  eyeHeight: 1.68,
  crouchHeight: 1.02,
  radius: 0.42,
  walkSpeed: 4.3,
  sprintSpeed: 8.1,
  crouchSpeed: 2.0,
  swimSpeed: 3.0,
  jumpSpeed: 5.4,
  maxHealth: 100,
  maxStamina: 100,
  maxHunger: 100,
  hungerRate: 0.38,           // per minute
  staminaDrain: 17,           // per second sprinting
  staminaRegen: 12,
  stepUp: 0.62,
  // Walking down a slope leaves you a few centimetres airborne every frame.
  // Without a snap the ground flag flickers, which stutters the footsteps and
  // the head bob and silently eats jumps.
  groundSnap: 0.45,
  coyoteTime: 0.14,           // still jumpable just after leaving the ground
  jumpBuffer: 0.16,           // jump pressed just before landing still fires
  jumpCost: 7,
};

export const MECH = {
  height: 4.1,                // ~13.5 feet
  eyeHeight: 3.35,
  radius: 1.5,
  walkSpeed: 8.5,
  sprintSpeed: 19.5,
  jumpSpeed: 11.5,
  boostForce: 26,
  maxArmor: 600,
  maxEnergy: 100,
  maxBoost: 100,
  stepUp: 2.2,
};

export const SHIP = {
  name: 'HALBERD',
  maxThrust: 34,              // m/s^2 at full throttle
  // Multiple of local gravity available in VTOL. This being a multiple of the
  // LOCAL value meant the moon, at a fifth of a g, got thrusters that barely
  // beat the ship's own weight: six seconds of full lift bought four metres.
  hoverPower: 3.4,
  maxFuel: 100,
  cruiseCeiling: 20000,
  spaceAltitude: 62000,
  orbitAltitude: 140000,
  // The trip between the two worlds is meant to be a journey, not a chore.
  // Fuel management and a two-minute climb to the transit altitude were the
  // chore; both are off.
  infiniteFuel: true,
  transitNeedsSpace: false,   // airborne is enough
  transitFromGround: true,    // and so is sitting on the pad
  transitNeedsAlignment: false,
  transitArrivalAltitude: 9000,
  transitArrivalSpeed: 200,
};

export const KEYS = {
  forward: ['KeyW'], back: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
  jump: ['Space'], sprint: ['ShiftLeft', 'ShiftRight'], crouch: ['KeyC'],
  interact: ['KeyE'], flashlight: ['KeyF'], reload: ['KeyR'],
  inventory: ['Tab'], scan: ['KeyQ'], map: ['KeyM'],
};

export function loadQuality() {
  try {
    const q = localStorage.getItem('primeval.quality');
    if (q && QUALITY[q]) return QUALITY[q];
  } catch (e) { /* private browsing */ }
  return QUALITY.BALANCED;
}

export function saveQuality(name) {
  try { localStorage.setItem('primeval.quality', name); } catch (e) { /* ignore */ }
}
