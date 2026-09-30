/**
 * Content library for the simulated demo world.
 *
 * IMPORTANT: none of this is fed to the analytics pipeline as labels. The
 * pipeline only ever sees what a connector returns (titles, captions,
 * hashtags, counts). Theme keys exist so tests can check that clustering and
 * stage detection recover the structure the world was built with.
 *
 * Wording varies deliberately: posts in one theme often share no keywords
 * ("Stop doing half reps" / "How deep should you squat?"), so clustering has
 * to work on meaning rather than hashtags.
 */
import type { Platform } from '../domain/types'

export interface ThemeLifecycle {
  /** Day (relative to the world anchor) the theme starts rising. */
  startDay: number
  riseDays: number
  plateauDays: number
  decayDays: number
  /** The whole cycle repeats every `period` days so the demo never runs dry. */
  period: number
}

export interface DemoTheme {
  key: string
  platforms: Platform[]
  lifecycle: ThemeLifecycle
  /** Expected new posts per day across platforms when intensity is 1. */
  peakPostsPerDay: number
  /** How much a hot theme lifts a post above its creator's baseline (log scale). */
  heat: number
  titles: string[]
  captions: string[]
  hashtags: string[]
  durationRange: [number, number]
  likeRate: number
  commentRate: number
}

export const DEMO_THEMES: DemoTheme[] = [
  {
    key: 'squat_depth',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -5, riseDays: 9, plateauDays: 8, decayDays: 14, period: 58 },
    peakPostsPerDay: 15,
    heat: 1.7,
    titles: [
      'Full ROM squats build more muscle — here’s the study',
      'Stop doing half reps on squats',
      'How deep should you actually squat?',
      'Ass to grass vs parallel: which builds bigger quads?',
      'Partial squats are underrated (hear me out)',
      'I tried deep squats for 30 days — my quads changed',
      'Why your squat depth is costing you gains',
      'Squat depth myth: does going lower really matter?',
      'Parallel is enough? A coach reacts to the squat depth debate',
      'The truth about below-parallel squats and knee safety',
      'Deep squats vs quarter squats for hypertrophy',
      'Range of motion is the most underrated hypertrophy variable',
    ],
    captions: [
      'Going deeper isn’t always better… or is it? The new data on squat range of motion 👇',
      'Hot take: most of you are cutting your squats short and blaming genetics.',
      'Full range squats vs partials. Same load, very different quads after 10 weeks.',
      'Everyone’s arguing about squat depth this week so here’s what the research actually says.',
      'If your knees hurt going deep, try this before you give up on full range squats.',
    ],
    hashtags: ['squat', 'squatdepth', 'hypertrophy', 'legday', 'rangeofmotion', 'quads', 'strengthtraining'],
    durationRange: [28, 75],
    likeRate: 0.061,
    commentRate: 0.0065,
  },
  {
    key: 'lengthened_partials',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -18, riseDays: 7, plateauDays: 14, decayDays: 16, period: 62 },
    peakPostsPerDay: 12,
    heat: 1.45,
    titles: [
      'Lengthened partials explained in 60 seconds',
      'Are lengthened partials better than full reps?',
      'I only trained the stretch for 8 weeks',
      'The stretch position is where muscle is built',
      'Lengthened partial reps: the new hypertrophy cheat code?',
      'Why bottom-half reps are taking over the gym',
      'Training in the stretched position: what the studies show',
      'Stop skipping the stretch: partials done right',
    ],
    captions: [
      'Bottom half reps only? Here’s how to use lengthened partials without wrecking your joints.',
      'The stretch is the stimulus. Try this on your next set of RDLs.',
      'Lengthened partials after failure = free gains? Let’s talk about it.',
      'Everyone’s doing half reps in the stretch now. Here’s when it actually makes sense.',
    ],
    hashtags: ['lengthenedpartials', 'hypertrophy', 'musclegrowth', 'sciencebasedlifting', 'gymtips'],
    durationRange: [30, 90],
    likeRate: 0.055,
    commentRate: 0.0042,
  },
  {
    key: 'failure_proximity',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -2.5, riseDays: 9, plateauDays: 7, decayDays: 14, period: 55 },
    peakPostsPerDay: 12,
    heat: 1.8,
    titles: [
      'How close to failure should you really train?',
      'Training to failure is overrated',
      'RIR explained: stop leaving gains in the tank',
      'Why every set to failure might be killing your progress',
      'Reps in reserve vs failure: new meta-analysis',
      'I trained every set to failure for a month',
      'Failure training for beginners: yes or no?',
      'The truth about going to failure on compound lifts',
    ],
    captions: [
      'Unpopular opinion: you don’t need to hit failure to grow. Here’s the nuance.',
      '1–2 reps in reserve or all-out failure? The newest data surprised me.',
      'Stop grinding every set to failure on squats and deadlifts. Do this instead.',
      'Most lifters think they train to failure. Almost nobody actually does.',
    ],
    hashtags: ['trainingtofailure', 'rir', 'hypertrophy', 'gymtips', 'progressiveoverload', 'musclegrowth'],
    durationRange: [25, 70],
    likeRate: 0.058,
    commentRate: 0.0072,
  },
  {
    key: 'creatine_myths',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -30, riseDays: 6, plateauDays: 6, decayDays: 22, period: 70 },
    peakPostsPerDay: 12,
    heat: 1.5,
    titles: [
      'Does creatine cause hair loss? The real evidence',
      'Creatine myths you still believe',
      'Should you load creatine or not?',
      'Creatine makes you bloated? Let’s settle it',
      'The only supplement that actually works',
      'Creatine for women: myths vs facts',
    ],
    captions: [
      'Creatine and hair loss: one study started the panic. Here’s what happened next.',
      'Water weight, bloating, kidneys… let’s go through every creatine myth.',
      '5 grams a day. That’s the post. (Okay, a bit more nuance inside.)',
    ],
    hashtags: ['creatine', 'supplements', 'nutrition', 'fitnessmyths', 'gymtips'],
    durationRange: [25, 60],
    likeRate: 0.048,
    commentRate: 0.0051,
  },
  {
    key: 'gym_filming',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -5, riseDays: 9, plateauDays: 6, decayDays: 12, period: 50 },
    peakPostsPerDay: 15,
    heat: 1.75,
    titles: [
      'Filming in the gym: where is the line?',
      'Gym etiquette nobody tells you about',
      'Someone asked me to stop filming. Was I wrong?',
      'The unwritten rules of the weight room',
      'Is filming your workout disrespectful?',
      'Gym influencers ruined the gym? Let’s talk',
      'Tripod etiquette: a public service announcement',
    ],
    captions: [
      'Unpopular opinion: filming your sets is fine. Filming other people is not. Thoughts?',
      'This clip started a whole argument in the comments so let’s actually discuss it.',
      'Gym etiquette 101: re-rack, don’t hog the rack, and please keep your tripod out of the walkway.',
      'Would you be annoyed if someone set up a camera next to your bench?',
    ],
    hashtags: ['gymetiquette', 'gymculture', 'gymlife', 'gymtok', 'fitnesscommunity'],
    durationRange: [15, 45],
    likeRate: 0.066,
    commentRate: 0.0115,
  },
  {
    key: 'zone2_lifters',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -20, riseDays: 8, plateauDays: 20, decayDays: 16, period: 72 },
    peakPostsPerDay: 12,
    heat: 1.2,
    titles: [
      'Zone 2 cardio for lifters: will it kill your gains?',
      'Why every lifter should do zone 2',
      'Cardio won’t ruin your gains — here’s proof',
      'Hybrid training: lifting plus low intensity cardio',
      'How much cardio can you do while bulking?',
    ],
    captions: [
      'The interference effect is overblown. Here’s how I fit zone 2 around heavy lifting.',
      'Lifters hate cardio. Your heart doesn’t care. Easy zone 2 plan inside.',
      'Walking counts. Low intensity cardio for people who only want to lift.',
    ],
    hashtags: ['zone2', 'cardio', 'hybridtraining', 'conditioning', 'strengthtraining'],
    durationRange: [30, 90],
    likeRate: 0.043,
    commentRate: 0.0035,
  },
  {
    key: 'glutes_hipthrust',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -26, riseDays: 5, plateauDays: 5, decayDays: 18, period: 60 },
    peakPostsPerDay: 12,
    heat: 1.3,
    titles: [
      'Hip thrust vs squat for glute growth',
      'Are hip thrusts overrated?',
      'The best glute exercise according to research',
      'Squats don’t grow glutes? Let’s look at the data',
    ],
    captions: [
      'Hip thrusts or squats for glutes? The EMG argument is outdated. Here’s why.',
      'Glute growth debate: stretch vs squeeze. My take.',
    ],
    hashtags: ['glutes', 'hipthrust', 'glutegrowth', 'legday', 'hypertrophy'],
    durationRange: [25, 60],
    likeRate: 0.052,
    commentRate: 0.0044,
  },
  {
    key: 'protein_per_meal',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -1.5, riseDays: 8, plateauDays: 6, decayDays: 14, period: 57 },
    peakPostsPerDay: 12,
    heat: 1.65,
    titles: [
      'The 30g protein per meal limit is a myth',
      'Can your body only absorb 30 grams of protein?',
      'New study: 100g of protein in one meal',
      'Protein timing doesn’t matter (mostly)',
      'How much protein can you actually use at once?',
    ],
    captions: [
      'The “30 grams per meal” rule just got destroyed by a new study. Here’s what it means for you.',
      'Eat your protein however you want? Not so fast. The nuance matters.',
      'One huge protein meal vs spreading it out. The results were not what gym bros expected.',
    ],
    hashtags: ['protein', 'nutrition', 'musclegrowth', 'fitnessmyths', 'mealprep'],
    durationRange: [25, 70],
    likeRate: 0.054,
    commentRate: 0.0068,
  },
  {
    key: 'deadlift_cues',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -16, riseDays: 6, plateauDays: 16, decayDays: 14, period: 64 },
    peakPostsPerDay: 12,
    heat: 1.25,
    titles: [
      'Pull the slack out of the bar — deadlift cue explained',
      'Fix your deadlift lockout in one session',
      'Why your deadlift starts with your lats',
      'Conventional deadlift setup: 3 cues that changed everything',
      'Stop jerking the bar off the floor',
    ],
    captions: [
      'Wedge in, take the slack out, push the floor away. The setup that fixed my deadlift.',
      'If your hips shoot up first, this cue is for you.',
      'Deadlift form check: 3 cues I give every new lifter.',
    ],
    hashtags: ['deadlift', 'deadlifttips', 'powerlifting', 'strengthtraining', 'formcheck'],
    durationRange: [25, 60],
    likeRate: 0.049,
    commentRate: 0.0038,
  },
  {
    key: 'bench_arch',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -6, riseDays: 10, plateauDays: 6, decayDays: 14, period: 52 },
    peakPostsPerDay: 12,
    heat: 1.6,
    titles: [
      'Is a bench press arch cheating?',
      'Powerlifting arch vs flat back bench',
      'Why powerlifters arch (and should you?)',
      'The bench arch debate, settled by a coach',
      'Does arching your bench hurt your back?',
    ],
    captions: [
      'Arch = cheating? Every week someone in my comments says this. Let’s talk leverage.',
      'Big arch vs flat back for building a bigger chest. Different goals, different setup.',
      'This bench clip got 4,000 angry comments. Here’s the actual biomechanics.',
    ],
    hashtags: ['benchpress', 'powerlifting', 'benchtips', 'chestday', 'strengthtraining'],
    durationRange: [20, 55],
    likeRate: 0.057,
    commentRate: 0.0098,
  },
  {
    key: 'gym_humor',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -25, riseDays: 5, plateauDays: 40, decayDays: 10, period: 80 },
    peakPostsPerDay: 15,
    heat: 1.35,
    titles: [
      'POV: someone is curling in the squat rack',
      'Types of people at the gym at 6am',
      'When the gym crush finally talks to you',
      'Leg day survivors be like',
      'POV: you forgot your pre-workout',
      'Every gym has this guy',
    ],
    captions: [
      'Tag the friend who does this 😂',
      'POV: the gym at 5pm in January',
      'We all know that one guy… 💀',
      'Leg day hits different when you skipped the last three',
    ],
    hashtags: ['gymhumor', 'gymmemes', 'gymlife', 'fitnesshumor', 'gymtok'],
    durationRange: [8, 25],
    likeRate: 0.072,
    commentRate: 0.0045,
  },
  {
    key: 'rest_times',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -3, riseDays: 10, plateauDays: 6, decayDays: 14, period: 60 },
    peakPostsPerDay: 9,
    heat: 1.55,
    titles: [
      'How long should you rest between sets?',
      'Short rest periods are killing your gains',
      '3 minutes rest vs 1 minute: new data',
      'Rest longer, grow more? The research explained',
    ],
    captions: [
      'Resting 60 seconds because a magazine told you to? Here’s what the newer studies say.',
      'Longer rest = more reps = more growth. Mostly. Here’s the nuance.',
    ],
    hashtags: ['resttime', 'hypertrophy', 'gymtips', 'workouttips', 'sciencebasedlifting'],
    durationRange: [25, 60],
    likeRate: 0.051,
    commentRate: 0.0047,
  },
  {
    key: 'natty_debate',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -22, riseDays: 4, plateauDays: 4, decayDays: 18, period: 66 },
    peakPostsPerDay: 12,
    heat: 1.45,
    titles: [
      'Natty or not: reacting to fitness influencers',
      'Is this physique achievable naturally?',
      'The natural limit is real — here’s the math',
      'Why fake natties ruin expectations',
    ],
    captions: [
      'Natty or not? Let’s look at the realistic natural limit with FFMI.',
      'Stop comparing yourself to enhanced physiques. Here’s what natural progress looks like.',
    ],
    hashtags: ['nattyornot', 'naturalbodybuilding', 'fitnessinfluencer', 'bodybuilding'],
    durationRange: [30, 90],
    likeRate: 0.05,
    commentRate: 0.0105,
  },
  {
    key: 'beginner_mistakes',
    platforms: ['youtube', 'instagram'],
    lifecycle: { startDay: -40, riseDays: 10, plateauDays: 60, decayDays: 10, period: 95 },
    peakPostsPerDay: 9,
    heat: 0.9,
    titles: [
      '5 beginner gym mistakes I made',
      'What I wish I knew in my first year of lifting',
      'Beginner workout program: keep it simple',
      'Stop program hopping as a beginner',
    ],
    captions: [
      'If you’re in your first year of lifting, save this. The mistakes I see every week.',
      'Beginners: consistency beats the perfect program. Here’s a simple 3-day plan.',
    ],
    hashtags: ['beginnerworkout', 'gymtips', 'fitnessjourney', 'workoutplan', 'gymbeginner'],
    durationRange: [30, 80],
    likeRate: 0.046,
    commentRate: 0.0033,
  },
]

/** Posts that belong to no trend: the everyday background of the niche. */
export const NOISE_POSTS = {
  titles: [
    'Push day full workout',
    'What I eat in a day to stay lean',
    'Morning routine of a powerlifter',
    'Back and biceps session',
    'Full body workout at home',
    'My current training split',
    'Leg day vlog',
    'Shoulder workout for width',
    'Arm day pump',
    'Meal prep for the week',
    'Road to my first meet: week 6',
    'Chest and triceps with my training partner',
    'Grocery haul on a budget',
    'Deload week thoughts',
    'Gym tour: my new home gym',
  ],
  captions: [
    'Another day, another session 💪',
    'Consistency over everything.',
    'Full workout below. Save it for later.',
    'Week 6 of prep, feeling good.',
    'Simple meals, big results.',
  ],
  hashtags: ['gym', 'workout', 'fitness', 'gymlife', 'fitnessmotivation', 'training'],
}

/** Name parts for simulated third-party creators. Deliberately generic; the UI labels all of them DEMO. */
export const CREATOR_NAME_PARTS = {
  first: [
    'Barbell',
    'Tempo',
    'Chalk',
    'Iron',
    'Plate',
    'Rack',
    'Grip',
    'Apex',
    'Forge',
    'Northside',
    'Summit',
    'Anvil',
    'Kinetic',
    'Garage',
    'Bench',
    'Hinge',
    'Lever',
    'Torque',
    'Harbor',
    'Granite',
    'Basement',
    'Atlas',
    'Pulse',
    'Vector',
  ],
  second: [
    'Lab',
    'Physique',
    'Strength',
    'Coaching',
    'Method',
    'Academy',
    'Lifts',
    'Club',
    'Collective',
    'Project',
    'Science',
    'Society',
    'Athletics',
    'Barbell',
    'Performance',
  ],
}

// ---------------------------------------------------------------------------
// The demo creator's own content
// ---------------------------------------------------------------------------

/**
 * Categories of the demo creator's own posts, with the performance effect
 * each carries in the simulation (natural-log lift over baseline). The
 * personalization engine never sees these numbers; a test checks that it
 * rediscovers them from the collected metrics alone. exp(0.74) ≈ 2.1×.
 */
export interface OwnCategory {
  key: string
  effect: number
  weight: number
  titles: string[]
}

export const OWN_CATEGORIES: OwnCategory[] = [
  {
    key: 'technique_controversy',
    effect: 0.74,
    weight: 0.24,
    titles: [
      'Stop doing half reps on leg press',
      'Your squat depth is lying to you',
      'Bench arch isn’t cheating (and here’s why)',
      'Everyone is wrong about deadlift form',
      'Unpopular opinion: high bar squats are better for most lifters',
      'The biggest myth about knee position in squats',
      'Why I stopped telling people to squat ass to grass',
      'Stop cueing “chest up” on squats',
      'Most people do Romanian deadlifts wrong',
      'Upright rows are not dangerous (stop saying this)',
    ],
  },
  {
    key: 'technique_tutorial',
    effect: 0.24,
    weight: 0.2,
    titles: [
      'How to fix your deadlift lockout',
      '3 cues for a stronger bench press',
      'How to brace properly for heavy squats',
      'Pull-up technique for beginners',
      'How to set up a barbell row',
      'Fix your hip hinge in 2 minutes',
      'Overhead press technique breakdown',
      'How to find your squat stance',
    ],
  },
  {
    key: 'science_breakdown',
    effect: 0.36,
    weight: 0.14,
    titles: [
      'New study on training volume explained',
      'What the research says about sets per week',
      'Is muscle soreness a sign of growth? The data',
      'Does time under tension matter? Study breakdown',
      'The science of progressive overload, simplified',
    ],
  },
  {
    key: 'program_design',
    effect: 0.0,
    weight: 0.14,
    titles: [
      'My 4-day upper lower split explained',
      'How many sets per week for muscle growth',
      'How I would program a beginner’s first year',
      'Push pull legs vs upper lower',
      'How to run a deload week',
    ],
  },
  {
    key: 'nutrition',
    effect: -0.22,
    weight: 0.1,
    titles: [
      'What I eat on a cut',
      'High protein breakfast ideas',
      'How I track macros without losing my mind',
      'Bulking without getting fat',
    ],
  },
  {
    key: 'gym_humor',
    effect: -0.38,
    weight: 0.1,
    titles: [
      'POV: someone asks how many sets you have left',
      'When your spotter says “all you”',
      'Types of lifters on bench press day',
      'POV: leg day tomorrow',
    ],
  },
  {
    key: 'motivation_vlog',
    effect: -0.5,
    weight: 0.08,
    titles: [
      'A day in my life as a strength coach',
      'Why I started lifting',
      'Training through a bad week',
      'Road to 600: session vlog',
    ],
  },
]

/** Hook framings applied to own titles/captions, with their simulated effect. */
export const OWN_HOOKS: Array<{ key: string; effect: number; weight: number; captionLead: string[] }> = [
  {
    key: 'contrarian',
    effect: 0.28,
    weight: 0.3,
    captionLead: ['Unpopular opinion:', 'Hot take:', 'Everyone gets this wrong:'],
  },
  {
    key: 'mistake',
    effect: 0.2,
    weight: 0.22,
    captionLead: ['You’re probably doing this wrong.', 'The mistake I see every week:', 'Stop making this mistake:'],
  },
  { key: 'question', effect: 0.0, weight: 0.2, captionLead: ['Quick question:', 'Ever wondered why', 'What’s the deal with'] },
  { key: 'list', effect: 0.05, weight: 0.13, captionLead: ['3 things to fix today:', '5 tips:', 'Save these cues:'] },
  { key: 'story', effect: -0.15, weight: 0.15, captionLead: ['Story time:', 'When I started lifting', 'Last week at the gym'] },
]
