/**
 * Offline writing for the local provider: trend names and recommendation
 * drafts assembled from a library of original angles and hook patterns,
 * tailored with the creator's own measured strengths.
 *
 * These are templates, and the UI says so. They never reuse another
 * creator's wording: example titles in the brief are ignored here.
 */
import type { RecommendationBeat } from '../../domain/types'
import type { ClusterDescription, ClusterDescriptionInput, RecommendationDraft, TrendBrief } from '../types'
import { TOPICS } from './lexicon'

type HookType = 'Contrarian claim' | 'Mistake callout' | 'Question' | 'List' | 'Story' | 'Bold claim' | 'POV'

interface TopicCopy {
  subject: string
  /** Whether `subject` is plural ("rest times"), for the generic hook grammar. */
  plural?: boolean
  question: string
  mistake: string
  angles: string[]
  titles: string[]
  caption: string
  /** Topic-specific opening lines by hook type; the generic templates fill the gaps. */
  hooks?: Partial<Record<HookType, string>>
}

const COPY: Record<string, TopicCopy> = {
  squat_depth_rom: {
    subject: 'squat depth',
    question: 'How deep do you actually need to squat to grow your quads?',
    mistake: 'stop every squat at parallel out of habit',
    angles: [
      'Explain what actually changes biomechanically between full-depth and partial squats — hip and knee angles, where the quads are most stretched — and who each version suits.',
      'Film one set at each depth with the same load and walk through what changed, instead of declaring a winner.',
      'Give a simple depth test viewers can do at home with a box, then tell them how to pick their working depth.',
    ],
    titles: ['Squat depth: what actually changes', 'Deep vs half squats — the part nobody measures'],
    caption: 'Where do you stop your squat, and why? Here’s what changes when you go deeper — and when it doesn’t matter.',
    hooks: {
      'Contrarian claim': 'Squatting deeper isn’t automatically better — here’s when it is.',
      'Mistake callout': 'Stopping every squat at parallel out of habit might be costing you quad growth.',
      'List': 'Three things that change when you squat deeper.',
      'Story': 'I filmed a set at every squat depth — here’s what changed.',
      'POV': 'POV: your training partner calls your squat “high” again.',
      'Bold claim': 'The squat depth debate has a simpler answer than you think.',
    },
  },
  lengthened_partials: {
    plural: true,
    subject: 'lengthened partials',
    question: 'Should you be doing half reps in the stretch?',
    mistake: 'add partials to every set without a plan',
    angles: [
      'Show where lengthened partials fit in a real session — which exercises, which sets, how many — rather than treating them as magic.',
      'Demonstrate the difference between a controlled stretch-position partial and a sloppy half rep on two exercises.',
    ],
    titles: ['Lengthened partials without the hype', 'Where half reps actually belong'],
    caption: 'Partials in the stretch can work — if you use them on the right lifts. Here’s my rule of thumb.',
    hooks: {
      'Contrarian claim': 'Half reps aren’t lazy — if you do them in the right half.',
      'Mistake callout': 'If your partials live in the easy half of the rep, you’re doing them backwards.',
      'List': 'Three lifts where lengthened partials actually make sense.',
      'Story': 'I added stretch-position partials to one lift for a month — here’s my verdict.',
      'POV': 'POV: someone in your gym is doing half reps on purpose.',
      'Bold claim': 'Partials in the stretch are a tool, not a cheat code.',
    },
  },
  failure_proximity: {
    subject: 'training to failure',
    question: 'How close to failure do you really need to train?',
    mistake: 'take every set to failure on heavy compounds',
    angles: [
      'Show a set filmed rep by rep and call out where most people think failure is versus where it actually is.',
      'Give a practical split: which exercises to push to failure and which to leave reps in reserve, and why.',
    ],
    titles: ['Failure isn’t where you think it is', 'Reps in reserve, explained on camera'],
    caption: 'Most lifters stop 3–4 reps early and call it failure. Here’s how to find your real limit safely.',
    hooks: {
      'Contrarian claim': 'You’re probably not training to failure — even when you think you are.',
      'Mistake callout': 'Taking every heavy set to failure costs you more than it gives.',
      'List': 'Three signs you stopped your set too early.',
      'Story': 'I filmed a set to true failure — look where I thought I was done.',
      'POV': 'POV: you said “last rep” four reps ago.',
      'Bold claim': 'Where failure really is, filmed rep by rep.',
    },
  },
  rest_periods: {
    plural: true,
    subject: 'rest times',
    question: 'How long should you actually rest between sets?',
    mistake: 'rest 60 seconds because that’s what you’ve always done',
    angles: [
      'Run a short on-camera test: same exercise, two rest times, count the reps you keep — then explain what that means for growth.',
      'Give a simple rest-time rule by exercise type viewers can screenshot.',
    ],
    titles: ['I timed my rest periods for a week', 'Rest longer, lift more (mostly)'],
    caption: 'Short rests feel productive. Here’s what they cost you in reps — and when they’re fine.',
    hooks: {
      'Contrarian claim': 'Resting longer between sets isn’t lazy — it can mean more growth.',
      'Mistake callout': 'Resting 60 seconds on heavy compounds is costing you reps.',
      'List': 'How long I rest on every type of exercise, in 30 seconds.',
      'Story': 'I timed my rest periods for a week — the numbers surprised me.',
      'POV': 'POV: you’re mid-rest and someone asks if you’re still using this.',
      'Bold claim': 'Your rest timer might be the weakest part of your program.',
    },
  },
  training_volume: {
    subject: 'training volume',
    question: 'How many sets per week does a muscle really need?',
    mistake: 'keep adding sets when progress stalls',
    angles: [
      'Translate the volume research into a weekly set count per muscle, with a quick way to tell if you’re doing too much.',
      'Audit a follower’s program on screen and cut the junk volume.',
    ],
    titles: ['The weekly set count I actually use', 'Junk volume, found and removed'],
    caption: 'More sets isn’t always more growth. Here’s how I decide how much is enough.',
    hooks: {
      'Contrarian claim': 'More sets won’t fix a stalled muscle — here’s what will.',
      'Mistake callout': 'If you add sets every time you stall, you’re probably doing too much.',
      'List': 'Three signs your training volume is too high.',
      'Story': 'I counted every working set in my program — here’s what I cut.',
      'POV': 'POV: your program has 28 sets of chest a week.',
      'Bold claim': 'Most programs have more junk volume than they need.',
    },
  },
  progressive_overload: {
    subject: 'progressive overload',
    question: 'Are you actually progressing, or just repeating workouts?',
    mistake: 'add weight every week no matter what',
    angles: [
      'Show a simple double-progression log across four sessions and how to know when to add load.',
      'Explain three ways to progress when adding weight stops working.',
    ],
    titles: ['Progressive overload, done simply', 'What to do when you can’t add weight'],
    caption: 'You don’t need a complicated program to keep progressing. Here’s the log I use.',
    hooks: {
      'Contrarian claim': 'Adding weight every week isn’t a plan — it’s a countdown.',
      'Mistake callout': 'Repeating the same workout every week isn’t progress. Here’s the fix.',
      'List': 'Three ways to progress when the weight won’t go up.',
      'Story': 'The simple log that keeps my lifts moving.',
      'POV': 'POV: you’ve done 3×10 at the same weight since spring.',
      'Bold claim': 'Progressive overload is simpler than your program makes it.',
    },
  },
  deadlift_technique: {
    subject: 'deadlift setup',
    question: 'Why does your deadlift feel different every rep?',
    mistake: 'yank the bar off the floor',
    angles: [
      'Break the setup into three filmed checkpoints — feet, grip, tension — and show what each one fixes.',
      'Side-by-side of a jerked pull and a braced pull, slowed down, with the one cue that changes it.',
    ],
    titles: ['The deadlift setup, three checkpoints', 'One cue that fixed my pull'],
    caption: 'Tension before the bar leaves the floor. Here’s how to find it every rep.',
    hooks: {
      'Contrarian claim': 'Your deadlift doesn’t start when the bar moves — it starts before.',
      'Mistake callout': 'If you yank the bar off the floor, your setup is doing the damage.',
      'List': 'Three deadlift setup checkpoints that fix most pulls.',
      'Story': 'One cue changed how every rep of my deadlift feels.',
      'POV': 'POV: your hips shoot up first on every pull.',
      'Bold claim': 'Most deadlift problems are setup problems.',
    },
  },
  bench_technique: {
    subject: 'the bench arch',
    question: 'Is arching on bench cheating — or smart?',
    mistake: 'copy a powerlifting arch for a chest-growth goal',
    angles: [
      'Separate the two goals — moving the most weight versus building the chest — and show the setup that fits each.',
      'Measure range of motion with and without an arch on camera and explain the trade-off without taking sides.',
    ],
    titles: ['The bench arch, measured', 'Arch or flat back? Depends what you want'],
    caption: 'Arch for strength, flatter for chest? Here’s how I set up for each goal.',
    hooks: {
      'Contrarian claim': 'Arching on bench isn’t cheating — but it isn’t for everyone.',
      'Mistake callout': 'Copying a powerlifting arch when you want a bigger chest? Watch this first.',
      'List': 'Three bench setups, depending on what you want.',
      'Story': 'I measured my bench range of motion with and without an arch.',
      'POV': 'POV: the comments say your arch is cheating.',
      'Bold claim': 'Your bench setup should depend on your goal.',
    },
  },
  squat_technique: {
    subject: 'squat technique',
    question: 'What should you actually be thinking about under the bar?',
    mistake: 'cue “chest up” and nothing else',
    angles: [
      'Pick the one bracing cue that matters most and show it working on a heavy set.',
      'Explain how stance width changes the squat, with three quick stance tests viewers can try.',
    ],
    titles: ['The squat cue I’d keep if I could only have one', 'Find your squat stance in 60 seconds'],
    caption: 'Fewer cues, better squats. Here’s the one I’d keep.',
    hooks: {
      'Contrarian claim': '“Chest up” isn’t the cue that fixes your squat.',
      'Mistake callout': 'If your only squat cue is “chest up”, this is for you.',
      'List': 'Three squat cues — and the one I’d keep.',
      'Story': 'The one squat cue I give every new client.',
      'POV': 'POV: you’re thinking about eight cues under a heavy bar.',
      'Bold claim': 'One cue beats eight under a heavy bar.',
    },
  },
  glute_training: {
    subject: 'glute training',
    question: 'Hip thrusts or squats: which actually grows your glutes?',
    mistake: 'rely on a single glute exercise',
    angles: [
      'Explain what each exercise loads best — stretch versus squeeze — and build a simple two-exercise glute pairing.',
      'Show three setup mistakes that turn a hip thrust into a lower-back exercise.',
    ],
    titles: ['Hip thrust vs squat, honestly', 'Stretch and squeeze: the glute pairing I use'],
    caption: 'It’s not either/or. Here’s how I pair them.',
    hooks: {
      'Contrarian claim': 'Hip thrusts vs squats is the wrong question for glute growth.',
      'Mistake callout': 'If hip thrusts are your only glute exercise, you’re missing half the picture.',
      'List': 'Three hip thrust mistakes that move the work to your lower back.',
      'Story': 'How I actually program glutes for my clients.',
      'POV': 'POV: you feel hip thrusts everywhere except your glutes.',
      'Bold claim': 'Glutes grow best with more than one exercise.',
    },
  },
  creatine: {
    subject: 'creatine',
    question: 'Is creatine actually as safe and simple as people say?',
    mistake: 'skip creatine because of a myth you heard once',
    angles: [
      'Take the three most common creatine worries and answer each in one sentence with where the evidence stands.',
      'Explain what to expect in the first month on creatine — scale weight, strength, nothing else — so viewers aren’t surprised.',
    ],
    titles: ['Creatine: three worries, three answers', 'Your first month on creatine'],
    caption: 'Cheap, well-studied, boring. Here’s what it does and doesn’t do.',
    hooks: {
      'Contrarian claim': 'Creatine is boring — and that’s the point.',
      'Mistake callout': 'Skipping creatine because of a rumour? Here’s where the evidence sits.',
      'List': 'Three creatine worries, answered in one line each.',
      'Story': 'What to actually expect in your first month on creatine.',
      'POV': 'POV: someone asks if creatine is a steroid.',
      'Bold claim': 'Creatine is one of the most-studied supplements there is.',
    },
  },
  protein_intake: {
    subject: 'protein per meal',
    question: 'Can your body really only use 30 grams of protein at once?',
    mistake: 'force your protein into tiny meals',
    angles: [
      'Explain what the per-meal limit got wrong and what actually matters: daily total first, distribution second.',
      'Show a normal day of eating that hits the target without counting obsessively.',
    ],
    titles: ['The protein-per-meal myth, explained simply', 'Daily protein without the stress'],
    caption: 'Total daily protein matters most. Here’s how I think about the rest.',
    hooks: {
      'Contrarian claim': 'The 30-grams-per-meal protein rule isn’t what you think.',
      'Mistake callout': 'Splitting protein into tiny meals to “absorb it all”? You can stop.',
      'List': 'Three protein rules I actually follow.',
      'Story': 'How I hit my protein without counting every gram.',
      'POV': 'POV: you ate 31 grams of protein and panicked.',
      'Bold claim': 'Your daily protein total matters more than your meal timing.',
    },
  },
  cardio_conditioning: {
    subject: 'cardio for lifters',
    question: 'Will cardio actually kill your gains?',
    mistake: 'skip cardio to protect your gains',
    angles: [
      'Show how you fit easy cardio around heavy lifting in a real week, and what you’ve noticed in your own lifts.',
      'Explain the interference effect in plain English and when it matters (rarely).',
    ],
    titles: ['Cardio didn’t kill my gains', 'The zone 2 week for people who only want to lift'],
    caption: 'Your heart is a muscle too. Here’s how I fit cardio in without losing strength.',
    hooks: {
      'Contrarian claim': 'Cardio won’t kill your gains — skipping it might cost you more.',
      'Mistake callout': 'Skipping cardio to protect your gains is backwards.',
      'List': 'Three ways to add cardio without hurting your lifts.',
      'Story': 'How I fit cardio into a heavy lifting week.',
      'POV': 'POV: a bodybuilder discovers the stair climber.',
      'Bold claim': 'Lifters need cardio more than they think.',
    },
  },
  gym_etiquette: {
    subject: 'gym etiquette',
    question: 'Where’s the line when you film in the gym?',
    mistake: 'set up a tripod in the walkway',
    angles: [
      'Give your own simple filming rules from a coach’s point of view — what you do, what you never do — and invite viewers to add theirs.',
      'Role-play the same filming situation done badly and done well, then explain the difference.',
    ],
    titles: ['My rules for filming in the gym', 'Gym etiquette from a coach'],
    caption: 'Film your sets, not other people. Here are the rules I follow.',
    hooks: {
      'Contrarian claim': 'Filming in the gym isn’t the problem — how you film is.',
      'Mistake callout': 'If your tripod lives in the walkway, this one’s for you.',
      'List': 'My three rules for filming in a busy gym.',
      'Story': 'The gym-filming rules I follow as a coach.',
      'POV': 'POV: you walk into someone’s shot mid-set.',
      'Bold claim': 'Gym etiquette comes down to one rule.',
    },
  },
  gym_humor: {
    subject: 'gym life',
    question: 'Which one are you?',
    mistake: 'take the gym too seriously',
    angles: [
      'A short skit built on a moment from your own coaching sessions, ending with one genuinely useful tip.',
      'Turn a common technique mistake into a quick character bit, then show the fix in the last few seconds.',
    ],
    titles: ['Every coach has seen this', 'POV: your client says “one more set”'],
    caption: 'Tag the training partner who does this.',
    hooks: {
      'Contrarian claim': 'Unpopular opinion: the warm-up is the hardest part of leg day.',
      'Mistake callout': 'Doing this between sets? We need to talk.',
      'List': 'Three people you meet at every gym.',
      'Story': 'Every coach has seen this one.',
      'POV': 'POV: your client says “one more set” with that look.',
      'Bold claim': 'Every gym has this person.',
    },
  },
  natural_limits: {
    subject: 'natural progress',
    question: 'What does realistic natural progress actually look like?',
    mistake: 'compare your first year to someone’s enhanced physique',
    angles: [
      'Set realistic expectations with your own training history — year by year — instead of judging anyone else.',
      'Explain what realistic progress looks like by training age, without naming or accusing anyone.',
    ],
    titles: ['Realistic natural progress, year by year', 'What natural progress actually looks like'],
    caption: 'Your timeline is your own. Here’s what realistic looks like.',
    hooks: {
      'Contrarian claim': 'Realistic natural progress is slower — and better — than you think.',
      'Mistake callout': 'Comparing your first year to an enhanced physique will wreck your motivation.',
      'List': 'What realistic natural progress looks like, year by year.',
      'Story': 'What natural progress really looks like, year by year.',
      'POV': 'POV: you compare your year one to someone’s year ten.',
      'Bold claim': 'Natural progress has a timeline — and it’s longer than social media shows.',
    },
  },
  beginner_guidance: {
    subject: 'your first year of lifting',
    question: 'What would you do differently in your first year of lifting?',
    mistake: 'change programs every three weeks',
    angles: [
      'Share the three first-year habits you’d keep and the three you’d drop, with a quick example for each.',
      'Build a no-nonsense first program on screen in under a minute.',
    ],
    titles: ['What I’d tell my first-year self', 'A first program you can actually stick to'],
    caption: 'Consistency beats the perfect plan. Save this if you’re just starting.',
    hooks: {
      'Contrarian claim': 'Beginners don’t need a perfect program — they need a boring one.',
      'Mistake callout': 'Changing programs every three weeks is why you’re not progressing.',
      'List': 'Three things I’d tell anyone in their first year of lifting.',
      'Story': 'What I’d do differently in my first year of lifting.',
      'POV': 'POV: it’s your first week and you don’t know where anything is.',
      'Bold claim': 'Your first program matters less than sticking to it.',
    },
  },
  program_design: {
    plural: true,
    subject: 'training splits',
    question: 'Which split is actually best for you?',
    mistake: 'pick a split because someone famous uses it',
    angles: [
      'Match splits to schedules: show which split fits 3, 4 and 5 training days and why.',
      'Rebuild a viewer’s split on screen and explain each change.',
    ],
    titles: ['The best split is the one that fits your week', 'Picking a split in 60 seconds'],
    caption: 'Your schedule picks the split. Here’s how to decide.',
    hooks: {
      'Contrarian claim': 'The best training split is the one your week can survive.',
      'Mistake callout': 'Picking a split because a pro uses it is how programs fall apart.',
      'List': 'Which split fits 3, 4 and 5 training days — in 60 seconds.',
      'Story': 'How I choose a split for a new client.',
      'POV': 'POV: you started a six-day split with a four-day life.',
      'Bold claim': 'Your schedule should pick your split.',
    },
  },
  nutrition_diet: {
    subject: 'dieting',
    question: 'What does eating for your goal actually look like day to day?',
    mistake: 'cut calories so hard your training falls apart',
    angles: [
      'Show one realistic day of eating for your current phase and the two rules that keep it simple.',
      'Explain how you adjust calories week to week using the scale and your lifts.',
    ],
    titles: ['A realistic day of eating on a cut', 'How I adjust calories each week'],
    caption: 'Simple beats perfect. Here’s how I actually eat.',
    hooks: {
      'Contrarian claim': 'Your diet doesn’t need to be perfect — it needs to be repeatable.',
      'Mistake callout': 'Cutting so hard your training falls apart isn’t a cut, it’s a stall.',
      'List': 'Three rules that keep my eating simple.',
      'Story': 'A realistic day of eating on a cut — no meal-prep montage.',
      'POV': 'POV: day three of your cut and someone brings donuts.',
      'Bold claim': 'Simple eating beats perfect eating.',
    },
  },
  mobility_injury: {
    subject: 'training around pain',
    question: 'Should you train through pain or back off?',
    mistake: 'push through joint pain with the same exercise',
    angles: [
      'Show how you’d swap exercises when something hurts, without stopping training altogether (and when to see a professional).',
      'A short warm-up that addresses the most common lifting aches.',
    ],
    titles: ['What I do when a lift hurts', 'The warm-up I actually use'],
    caption: 'Not medical advice — just how I adjust training when something aches.',
    hooks: {
      'Contrarian claim': 'Stopping training isn’t the only option when a lift hurts.',
      'Mistake callout': 'Pushing through joint pain with the same exercise rarely ends well.',
      'List': 'Three swaps I use when a lift hurts (not medical advice).',
      'Story': 'What I do when a lift starts to hurt — not medical advice.',
      'POV': 'POV: your knee clicks on every squat.',
      'Bold claim': 'Most lifting aches need a swap, not a stop.',
    },
  },
  motivation_mindset: {
    subject: 'staying consistent',
    question: 'What keeps you training when motivation is gone?',
    mistake: 'wait to feel motivated',
    angles: [
      'Share a real bad-week session and what got you through it.',
      'Explain the system you use so training doesn’t depend on motivation.',
    ],
    titles: ['Training on a bad week', 'Systems beat motivation'],
    caption: 'Motivation is unreliable. Here’s what I rely on instead.',
    hooks: {
      'Contrarian claim': 'Motivation is overrated — here’s what actually keeps you training.',
      'Mistake callout': 'Waiting to feel motivated is why you keep missing sessions.',
      'List': 'Three things that keep me training when motivation is gone.',
      'Story': 'What a bad-week session actually looks like.',
      'POV': 'POV: 5 a.m. alarm, zero motivation, gym bag already packed.',
      'Bold claim': 'Systems beat motivation every time.',
    },
  },
  powerlifting_meet: {
    subject: 'meet day',
    question: 'What should you actually expect at your first meet?',
    mistake: 'choose openers you can’t hit on a bad day',
    angles: [
      'Walk through how you pick openers and what happens on the day, step by step.',
      'Share the three meet-day mistakes you see most as a coach.',
    ],
    titles: ['How I pick meet openers', 'Your first meet, step by step'],
    caption: 'Open light, finish strong. Here’s the plan.',
    hooks: {
      'Contrarian claim': 'Your meet opener should feel almost too easy.',
      'Mistake callout': 'Picking openers you can’t hit on a bad day is the classic first-meet mistake.',
      'List': 'Three meet-day mistakes I see as a coach.',
      'Story': 'How I pick openers, step by step.',
      'POV': 'POV: first meet, and you just saw the warm-up room.',
      'Bold claim': 'Meets are won with openers, not PR attempts.',
    },
  },
  physique_posing: {
    subject: 'posing',
    question: 'Why does posing change how your physique looks so much?',
    mistake: 'leave posing practice until peak week',
    angles: ['Show the difference good posing makes on the same physique and one drill to practise daily.'],
    titles: ['Posing changes everything', 'One posing drill to start today'],
    caption: 'Practise posing like you practise lifting.',
    hooks: {
      'Contrarian claim': 'Posing is a skill — and most people start practising too late.',
      'Mistake callout': 'Leaving posing practice until peak week shows on stage.',
      'List': 'Three posing drills to start today.',
      'Story': 'The posing drill I’d start with.',
      'POV': 'POV: your first front double biceps in the gym mirror.',
      'Bold claim': 'Posing changes how a physique reads.',
    },
  },
}

/** Copy for a topic outside the lexicon, built around the trend's own name. */
function genericCopy(trendLabel: string): TopicCopy {
  const subject = trendLabel.toLowerCase()
  return {
    subject,
    question: `What’s actually true about ${subject}?`,
    mistake: 'follow the loudest advice without checking it',
    angles: [
      `Explain the claim behind the ${subject} trend in plain English, show what the evidence supports, and give one practical takeaway.`,
      `Answer the most common question about ${subject} with a short demonstration instead of an opinion.`,
      `Try it yourself on camera and report honestly what you noticed — including what didn’t work.`,
    ],
    titles: [`${trendLabel}: what’s actually true`, `${trendLabel}, explained in a minute`],
    caption: `Everyone’s talking about ${subject}. Here’s my take — and the part most people skip.`,
  }
}

function copyFor(topicKey: string | null, trendLabel: string): TopicCopy {
  return (topicKey && COPY[topicKey]) || genericCopy(trendLabel)
}

function hookFor(hookType: string, copy: TopicCopy): string {
  const specific = copy.hooks?.[hookType as HookType]
  if (specific) return specific
  const subject = copy.subject.charAt(0).toUpperCase() + copy.subject.slice(1)
  switch (hookType) {
    case 'Contrarian claim':
      return `${subject} ${copy.plural ? 'aren’t' : 'isn’t'} what you’ve been told — here’s what actually matters.`
    case 'Mistake callout':
      return `If you ${copy.mistake}, you’re leaving progress on the table.`
    case 'List':
      return `Three things nobody tells you about ${copy.subject}.`
    case 'Story':
      return `I changed how I coach ${copy.subject} — here’s why.`
    case 'Bold claim':
      return `The honest answer on ${copy.subject}, in under a minute.`
    case 'POV':
      return `POV: someone asks you about ${copy.subject} mid-set.`
    default:
      return copy.question
  }
}

/**
 * The opening to use: one that works for this creator *and* appears in the
 * trend if possible, then the creator's strengths, then the trend's own
 * patterns. Later recommendations in a batch rotate through the next-best
 * options so a day's list does not open seven videos the same way.
 */
export function pickHookType(brief: Pick<TrendBrief, 'creatorBestHookTypes' | 'hookTypes' | 'variant'>): string {
  const usable = (h: string) => h !== 'None' && h !== 'Statement'
  const mine = brief.creatorBestHookTypes.filter(usable)
  const trend = brief.hookTypes.filter(usable)
  const ordered = [...new Set([...mine.filter((h) => trend.includes(h)), ...mine.slice(0, 2), ...trend.slice(0, 2), 'Question'])]
  const pool = ordered.slice(0, 3)
  return pool[brief.variant % pool.length] ?? 'Question'
}

/** Target duration in seconds for a length bucket like "30–45s". */
export function targetSeconds(bucket: string | null): number {
  if (!bucket) return 40
  if (bucket.startsWith('Under 30')) return 25
  if (bucket.startsWith('30')) return 40
  if (bucket.startsWith('45')) return 55
  if (bucket.startsWith('60')) return 75
  if (bucket.startsWith('90')) return 120
  if (bucket.startsWith('3')) return 360
  return 600
}

function beats(format: string, total: number): RecommendationBeat[] {
  const plans: Record<string, Array<[number, string, string]>> = {
    'Myth busting': [
      [0.08, 'Hook', 'State the belief in one line, on screen and out loud.'],
      [0.25, 'Why people believe it', 'Show where the idea comes from — fairly.'],
      [0.62, 'What actually holds up', 'Demonstrate on camera; keep it to one clear point.'],
      [0.9, 'Takeaway', 'One thing to do differently next session.'],
      [1, 'Close', 'Ask viewers what they were told.'],
    ],
    'Debate / reaction': [
      [0.08, 'Hook', 'Name the argument everyone is having.'],
      [0.3, 'Both sides', 'Give the strongest version of each side in a sentence.'],
      [0.65, 'Your take', 'Your position as a coach, with the reason and a demo.'],
      [0.9, 'Who it applies to', 'Say who should ignore your advice.'],
      [1, 'Close', 'Invite disagreement in the comments.'],
    ],
    'Tutorial / how-to': [
      [0.08, 'Hook', 'Show the mistake in one clip.'],
      [0.3, 'The fix', 'Show the corrected version immediately.'],
      [0.65, 'Cue breakdown', 'Two cues, each with a close-up.'],
      [0.9, 'Common errors', 'What to watch for when trying it.'],
      [1, 'Recap', 'Repeat the cues over a clean rep.'],
    ],
    'Study breakdown': [
      [0.08, 'Hook', 'The finding in plain words.'],
      [0.35, 'What they did', 'Who, how long, what was compared.'],
      [0.65, 'What it means', 'What it changes for a normal lifter.'],
      [0.88, 'Caveats', 'The honest limitation.'],
      [1, 'Apply it', 'One change to try this week.'],
    ],
    'Skit / POV': [
      [0.12, 'Setup', 'Establish the situation in one shot.'],
      [0.6, 'Escalation', 'Play the moment out, bigger each beat.'],
      [0.85, 'Punchline', 'The payoff.'],
      [1, 'Useful tag', 'A one-line genuine tip so it teaches as well as entertains.'],
    ],
    'List / tips': [
      [0.1, 'Hook', 'Promise the list and why it matters.'],
      [0.4, 'Point 1', 'Show, don’t just say.'],
      [0.65, 'Point 2', 'Show, don’t just say.'],
      [0.9, 'Point 3', 'The most surprising one last.'],
      [1, 'Close', 'Tell them to save it.'],
    ],
  }
  const plan = plans[format] ?? plans['Myth busting']!
  const out: RecommendationBeat[] = []
  let start = 0
  for (const [fraction, label, direction] of plan) {
    const end = Math.max(start + 2, Math.round(total * fraction))
    out.push({ startSec: start, endSec: end, label, direction })
    start = end
  }
  return out
}

function pickFormat(brief: TrendBrief): string {
  const preferred = brief.creatorBestFormats.find((f) => brief.formats.includes(f))
  return preferred ?? brief.creatorBestFormats[0] ?? brief.formats[0] ?? 'Myth busting'
}

export function draftLocally(brief: TrendBrief, topicKey: string | null): RecommendationDraft {
  const copy = copyFor(topicKey, brief.trendLabel)
  const hookType = pickHookType(brief)
  const format = pickFormat(brief)
  const total = targetSeconds(brief.targetLength)
  const reason = brief.fitReasons[0]
  // The one-liner states the headline facts; "why it matters" adds the rest of the evidence and the fit.
  const supporting = brief.evidenceLines.slice(1, 3).map((l) => `${l.replace(/\.$/, '')}.`).join(' ')
  return {
    oneLiner: oneLiner(brief),
    whyItMatters: [supporting, reason ? `Why you: ${lowerFirst(reason)}` : ''].filter(Boolean).join(' '),
    suggestedAngle: copy.angles[0]!,
    suggestedHook: hookFor(hookType, copy),
    titleConcept: copy.titles[brief.variant % 2 === 0 ? 0 : Math.min(1, copy.titles.length - 1)]!,
    captionConcept: copy.caption,
    structure: beats(format, total),
    alternativeAngles: copy.angles.slice(1, 3),
  }
}

function times(n: number | null | undefined): string | null {
  if (n === null || n === undefined || !Number.isFinite(n)) return null
  return `${n >= 10 ? Math.round(n) : Math.round(n * 10) / 10}×`
}

/** One sentence: what is happening, with the numbers that show it. */
export function oneLiner(brief: Pick<TrendBrief, 'trendLabel' | 'stage' | 'facts'>): string {
  const f = brief.facts
  const stage = brief.stage.toLowerCase()
  const running = times(f.medianOutperformance)
  const beating = running && (f.medianOutperformance ?? 0) >= 1.15 ? `, running ${running} their creators’ usual views` : ''
  const momentum = times(f.momentumPerDay)
  const where = f.platforms.length ? ` on ${f.platforms.join(' and ')}` : ''
  switch (stage) {
    case 'emerging':
    case 'accelerating':
      return `${brief.trendLabel} is ${stage}: ${f.postsLast3Days} new post${f.postsLast3Days === 1 ? '' : 's'}${where} in the last 3 days${momentum ? ` (momentum ${momentum} per day)` : ''}${beating}.`
    case 'declining':
      return `${brief.trendLabel} is declining: ${f.postsLast3Days} post${f.postsLast3Days === 1 ? '' : 's'} in the last 3 days against ${f.postsPrevious3Days} before — only worth it with a clearly different angle.`
    default:
      return `${brief.trendLabel} is steady: ${f.posts} posts from ${f.creators} creators${where}, ${f.postsLast3Days} in the last 3 days${beating}.`
  }
}

function lowerFirst(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text
}

export function describeLocally(input: ClusterDescriptionInput): ClusterDescription {
  const top = input.topTopics[0]
  const known = top && TOPICS.some((t) => t.label === top.value && !t.generic)
  const label = known ? top!.value : input.keywords.slice(0, 3).join(' · ') || top?.value || 'Unnamed trend'
  const formats = new Map<string, number>()
  for (const m of input.members) if (m.format) formats.set(m.format, (formats.get(m.format) ?? 0) + 1)
  const topFormat = [...formats.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return {
    label: label.length > 60 ? `${label.slice(0, 59)}…` : label,
    summary: `${input.members.length} posts about ${label.toLowerCase()}${topFormat ? `, mostly ${topFormat.toLowerCase()}` : ''}.`,
  }
}
