/**
 * Fitness vocabulary for the local provider.
 *
 * This is general strength-training language, written for real content —
 * not a copy of the demo world's templates. A term matches on word
 * boundaries with an optional plural; a `re` entry is a raw regular
 * expression for co-occurrences ("squat" near "depth").
 */

export interface Term {
  phrase?: string
  re?: RegExp
  weight: number
}

export interface TopicDef {
  key: string
  label: string
  terms: Term[]
  /** Generic topics never get a concept feature, so they do not clump together. */
  generic?: boolean
  /** Default audience when this topic dominates. */
  audience?: string
}

const t = (phrase: string, weight: number): Term => ({ phrase, weight })
const r = (re: RegExp, weight: number): Term => ({ re, weight })

export const TOPICS: TopicDef[] = [
  {
    key: 'squat_depth_rom',
    label: 'Squat depth & range of motion',
    terms: [
      r(/\bsquat\w*\b[^.?!]{0,40}\b(deep|depth|deeper|parallel|half|partial|quarter|atg)\b/, 3),
      r(/\b(deep|depth|deeper|parallel|half|partial|quarter|atg)\b[^.?!]{0,40}\bsquat/, 3),
      t('squat depth', 3),
      t('deep squat', 3),
      t('ass to grass', 3),
      t('atg', 2.2),
      t('below parallel', 3),
      t('how deep', 2),
      t('full depth', 2),
      t('full rom', 2.2),
      t('full range', 1.6),
      t('range of motion', 1.6),
      t('rom', 1.2),
      t('half rep', 1.8),
      t('quarter squat', 3),
      t('squat', 0.6),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'lengthened_partials',
    label: 'Lengthened partials & stretch training',
    terms: [
      t('lengthened partial', 4.5),
      t('lengthened', 2.2),
      t('stretch position', 3),
      t('stretched position', 3),
      t('in the stretch', 2.5),
      t('the stretch', 1.4),
      t('bottom half', 2.4),
      t('partials', 1.3),
      t('stretch mediated', 3),
      t('long length', 2),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'failure_proximity',
    label: 'Training to failure & reps in reserve',
    terms: [
      t('to failure', 3),
      t('failure', 2),
      t('reps in reserve', 3.5),
      t('rir', 3),
      t('rpe', 2),
      t('close to failure', 3),
      t('all out', 1.4),
      t('in the tank', 1.8),
      t('grinding', 1.2),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'rest_periods',
    label: 'Rest times between sets',
    terms: [
      t('rest time', 3.5),
      t('rest period', 3.5),
      t('between sets', 2.5),
      t('rest longer', 3),
      t('minutes rest', 3),
      t('minute rest', 3),
      t('rest between', 3),
      t('short rest', 2.4),
      t('resting', 1.2),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'training_volume',
    label: 'Training volume & sets per week',
    terms: [t('sets per week', 3.5), t('training volume', 3.5), t('junk volume', 3.5), t('how many sets', 3), t('weekly sets', 3), t('volume', 1.3)],
    audience: 'Intermediate lifters',
  },
  {
    key: 'progressive_overload',
    label: 'Progressive overload',
    terms: [t('progressive overload', 3.5), t('double progression', 3.5), t('add weight', 1.4), t('plateau', 1.6), t('overload', 1.6)],
  },
  {
    key: 'deadlift_technique',
    label: 'Deadlift technique & cues',
    terms: [
      t('slack out of the bar', 3.5),
      t('pull the slack', 3.5),
      t('slack', 1.4),
      t('lockout', 2),
      t('hips shoot', 3),
      t('hip hinge', 2),
      t('deadlift form', 3.5),
      t('deadlift setup', 3.5),
      t('push the floor', 2.2),
      t('jerking the bar', 2.6),
      t('deadlift', 1.6),
      t('conventional deadlift', 2),
      t('sumo', 1.6),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'bench_technique',
    label: 'Bench press technique & the arch debate',
    terms: [
      r(/\bbench\w*\b[^.?!]{0,30}\barch/, 3.5),
      r(/\barch\w*\b[^.?!]{0,30}\bbench/, 3.5),
      t('arching', 2),
      t('arch', 1.6),
      t('leg drive', 2.2),
      t('touch point', 2.2),
      t('elbow flare', 2.2),
      t('flat back', 1.4),
      t('bench press', 1.6),
      t('bench', 1),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'squat_technique',
    label: 'Squat technique & bracing',
    terms: [
      t('brace', 2),
      t('bracing', 2),
      t('squat stance', 3),
      t('high bar', 2.6),
      t('low bar', 2.6),
      t('knees cave', 2.6),
      t('knee position', 2.6),
      t('chest up', 2.2),
      t('butt wink', 2.6),
      t('bar position', 2),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'glute_training',
    label: 'Glute training (hip thrust vs squat)',
    terms: [t('hip thrust', 3.5), t('glute growth', 3.5), t('glute', 2.6), t('glute bridge', 2.6), t('booty', 2)],
  },
  {
    key: 'creatine',
    label: 'Creatine myths & facts',
    terms: [t('creatine', 4.5), t('creatine monohydrate', 4.5), t('loading phase', 2), t('hair loss', 1.6)],
    audience: 'General fitness audience',
  },
  {
    key: 'protein_intake',
    label: 'Protein intake & the per-meal limit',
    terms: [
      t('protein per meal', 4.5),
      t('grams of protein', 3.2),
      t('protein timing', 4),
      t('anabolic window', 3.5),
      t('absorb', 1.6),
      t('30g', 2),
      t('30 grams', 2),
      t('protein', 2.4),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'cardio_conditioning',
    label: 'Cardio & zone 2 for lifters',
    terms: [
      t('zone 2', 4.5),
      t('zone two', 4.5),
      t('cardio', 3),
      t('conditioning', 2),
      t('hybrid athlete', 3.5),
      t('hybrid training', 3.5),
      t('hybrid', 1.8),
      t('interference effect', 3.5),
      t('vo2', 2.6),
      t('running', 1.4),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'gym_etiquette',
    label: 'Gym etiquette & filming in the gym',
    terms: [
      t('etiquette', 4),
      t('filming', 3),
      t('tripod', 3),
      t('camera', 1.6),
      t('re rack', 2.6),
      t('rerack', 2.6),
      t('unwritten rules', 3),
      t('hog the rack', 2.4),
      t('gym influencer', 2.4),
      t('weight room', 1.2),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'gym_humor',
    label: 'Gym humor & POV skits',
    terms: [
      t('pov', 3),
      t('types of', 2),
      t('be like', 2.4),
      t('that one guy', 2.6),
      t('every gym has', 3),
      t('gym crush', 3),
      t('meme', 2.4),
      t('tag the friend', 2.2),
      t('tag a friend', 2.2),
      t('funny', 2),
      t('skit', 2.4),
      t('survivors', 1.2),
      t('gymhumor', 3),
      r(/[😂🤣💀]/u, 1.6),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'natural_limits',
    label: 'Natty or not & natural limits',
    terms: [t('natty', 4.5), t('natural limit', 4.5), t('fake natty', 4.5), t('ffmi', 3.5), t('steroid', 3.5), t('enhanced', 2.4), t('peds', 3), t('trt', 3)],
    audience: 'General fitness audience',
  },
  {
    key: 'beginner_guidance',
    label: 'Beginner mistakes & first-year advice',
    terms: [
      t('beginner', 3),
      t('first year', 2.6),
      t('wish i knew', 2.6),
      t('program hopping', 3),
      t('newbie', 2.6),
      t('new to the gym', 3),
      t('gymtimidation', 3),
    ],
    audience: 'Beginners',
  },
  {
    key: 'program_design',
    label: 'Programming & training splits',
    terms: [
      t('upper lower', 3),
      t('push pull legs', 3),
      t('ppl', 2.4),
      t('training split', 3),
      t('split', 1.6),
      t('deload', 2.6),
      t('periodization', 3),
      t('mesocycle', 3),
      t('program', 1.4),
      t('frequency', 1.4),
    ],
    audience: 'Intermediate lifters',
  },
  {
    key: 'nutrition_diet',
    label: 'Diet, cutting & bulking',
    terms: [
      t('on a cut', 3),
      t('cutting', 2),
      t('bulking', 2.6),
      t('bulk', 2.4),
      t('macros', 3),
      t('calories', 2.4),
      t('what i eat', 3),
      t('meal prep', 3),
      t('diet', 2),
      t('deficit', 2.4),
      t('surplus', 2.4),
      t('grocery', 2),
      t('breakfast', 1.6),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'mobility_injury',
    label: 'Mobility, pain & injury',
    terms: [t('mobility', 3), t('stretching', 2.4), t('knee pain', 3), t('back pain', 3), t('shoulder pain', 3), t('injury', 3), t('rehab', 3), t('warm up', 1.8)],
  },
  {
    key: 'motivation_mindset',
    label: 'Motivation & mindset',
    terms: [
      t('motivation', 3),
      t('discipline', 3),
      t('mindset', 3),
      t('why i started', 3),
      t('consistency over everything', 3),
      t('consistency', 1.6),
      t('stay consistent', 2.5),
      t('keep showing up', 2.5),
      t('no excuses', 2.5),
      t('bad week', 2),
      t('journey', 1.2),
    ],
    audience: 'General fitness audience',
  },
  {
    key: 'powerlifting_meet',
    label: 'Powerlifting meets & competition',
    terms: [t('powerlifting meet', 4), t('first meet', 3.5), t('meet prep', 3.5), t('openers', 3), t('meet', 2), t('competition', 2)],
    audience: 'Competitive lifters',
  },
  {
    key: 'physique_posing',
    label: 'Bodybuilding prep & posing',
    terms: [t('posing', 3.5), t('peak week', 3.5), t('show day', 3), t('bodybuilding show', 3), t('classic physique', 3), t('stage', 1.4)],
    audience: 'Competitive lifters',
  },
  {
    key: 'general_training',
    label: 'General training content',
    generic: true,
    terms: [
      t('push day', 1.5),
      t('pull day', 1.5),
      t('leg day', 1.2),
      t('arm day', 1.5),
      t('back day', 1.5),
      t('chest day', 1.5),
      t('full body', 1.2),
      t('full workout', 1.5),
      t('session', 1),
      t('vlog', 1.2),
      t('routine', 1),
      t('home gym', 1.2),
    ],
  },
]

export const EXERCISES: Array<{ name: string; re: RegExp }> = [
  { name: 'squat', re: /\bsquat(s|ting)?\b/ },
  { name: 'bench press', re: /\bbench( press(ing)?)?\b/ },
  { name: 'deadlift', re: /\bdeadlift(s|ing)?\b/ },
  { name: 'romanian deadlift', re: /\b(romanian deadlift|rdls?)\b/ },
  { name: 'hip thrust', re: /\bhip thrusts?\b/ },
  { name: 'overhead press', re: /\b(overhead press|ohp)\b/ },
  { name: 'pull-up', re: /\b(pull[ -]?ups?|chin[ -]?ups?)\b/ },
  { name: 'row', re: /\b(barbell |dumbbell |cable )?rows?\b/ },
  { name: 'leg press', re: /\bleg press\b/ },
  { name: 'lunge', re: /\blunges?\b/ },
  { name: 'curl', re: /\bcurl(s|ing)?\b/ },
  { name: 'lateral raise', re: /\blateral raises?\b/ },
  { name: 'dip', re: /\bdips?\b/ },
  { name: 'upright row', re: /\bupright rows?\b/ },
]

export const FORMATS: Array<{ label: string; terms: Term[] }> = [
  {
    label: 'Skit / POV',
    terms: [r(/^pov\b|\bpov:/, 4), t('types of', 2.4), t('be like', 2.4), t('every gym has', 3), t('that one guy', 2.6), t('tag the friend', 2), r(/[😂🤣💀]/u, 1.5), t('when your', 1.5)],
  },
  {
    label: 'Debate / reaction',
    terms: [
      t('reacts', 3),
      t('reacting', 3),
      t('responding to', 3),
      t('debate', 3),
      t('settled', 2.4),
      t('hot take', 2.4),
      t('unpopular opinion', 2.4),
      t('hear me out', 2.4),
      t('thoughts', 1.4),
      t('cheating', 2),
      r(/\bvs\.?\b|\bversus\b/, 1.6),
      t('was i wrong', 2.4),
      t('where is the line', 2.4),
    ],
  },
  {
    label: 'Myth busting',
    terms: [t('myth', 3), t('the truth about', 3), t('debunk', 3), t('lying to you', 2.6), t('wrong about', 2.4), t('stop believing', 3), t('overrated', 2), t('underrated', 1.8), t('not dangerous', 2)],
  },
  {
    label: 'Study breakdown',
    terms: [t('study', 2.6), t('research', 2.4), t('meta analysis', 3), t('the data', 2), t('evidence', 2), t('science', 1.8), t('studies', 2.4), t('what the research says', 3)],
  },
  {
    label: 'Experiment / challenge',
    terms: [t('i tried', 3), r(/\bfor (30|\d+) days\b/, 3), t('for a month', 3), r(/\b\d+ weeks\b/, 2), t('i only', 2), t('i trained every', 3), t('challenge', 2)],
  },
  {
    label: 'List / tips',
    terms: [r(/\b\d+\s+(tips|mistakes|things|cues|exercises|reasons|ways|rules|signs)\b/, 3.5), t('save these', 2.4), t('save this', 1.6)],
  },
  {
    label: 'Tutorial / how-to',
    terms: [t('how to', 3), t('fix your', 3), t('cue', 1.8), t('cues', 2), t('step by step', 2.6), t('technique', 1.8), t('setup', 1.8), t('tutorial', 3), t('explained', 2.2), t('guide', 2), t('form check', 2.4), t('breakdown', 1.8)],
  },
  {
    label: 'Vlog / routine',
    terms: [
      t('day in the life', 3),
      t('a day in my life', 3),
      t('vlog', 3),
      t('routine', 2),
      t('full workout', 2.4),
      t('what i eat', 2.6),
      t('haul', 2.4),
      t('tour', 2),
      t('road to', 2),
      r(/\bweek \d+\b/, 2),
      t('session', 1.4),
    ],
  },
  { label: 'Q&A', terms: [t('you asked', 3), t('q&a', 3), t('answering your', 3), t('quick question', 1.6)] },
]

export const CONTROVERSY_MARKERS: Term[] = [
  r(/\bvs\.?\b|\bversus\b/, 1),
  t('debate', 1.2),
  t('myth', 1),
  t('wrong', 1),
  t('overrated', 1.2),
  t('underrated', 0.8),
  t('unpopular opinion', 1.5),
  t('hot take', 1.5),
  t('cheating', 1.2),
  t('settled', 0.8),
  t('truth about', 0.8),
  t('nobody', 0.8),
  r(/^stop\b/, 1),
  t('ruin', 1),
  t('disrespectful', 1.2),
  t('natty', 1.2),
  t('fake', 0.8),
  t('angry', 1),
  t('argument', 1),
  t('controversial', 1.5),
  t('hear me out', 1),
  t('lying', 1),
  t('killing your', 0.8),
  t('dangerous', 0.8),
  t('where is the line', 1),
]

export const AUDIENCE_CUES: Array<{ label: string; terms: Term[] }> = [
  { label: 'Beginners', terms: [t('beginner', 3), t('first year', 2), t('newbie', 2.5), t('new to', 1.5), t('first time', 1.2), t('program hopping', 2)] },
  { label: 'Competitive lifters', terms: [t('meet', 2), t('openers', 3), t('peak week', 3), t('periodization', 2.4), t('competition', 2), t('total', 1)] },
]

// ---------------------------------------------------------------------------
// Compilation
// ---------------------------------------------------------------------------

export interface CompiledTerm {
  re: RegExp
  weight: number
  label: string
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function compileTerm(term: Term): CompiledTerm {
  if (term.re) return { re: new RegExp(term.re.source, `${term.re.flags.replace('g', '')}g`), weight: term.weight, label: term.re.source }
  const words = term.phrase!.split(/\s+/).map(escapeRe)
  const last = words.pop()!
  const body = [...words, `${last}(?:s|es)?`].join('[\\s-]+')
  return { re: new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'gu'), weight: term.weight, label: term.phrase! }
}

export function scoreTerms(text: string, terms: CompiledTerm[], cap = 3): { score: number; matched: string[] } {
  let score = 0
  const matched: string[] = []
  for (const term of terms) {
    term.re.lastIndex = 0
    const hits = text.match(term.re)?.length ?? 0
    if (hits > 0) {
      score += term.weight * Math.min(cap, 1 + 0.35 * (hits - 1))
      matched.push(term.label)
    }
  }
  return { score, matched }
}

/** Every word used in the lexicon, for hashtag segmentation. */
export function lexiconVocabulary(): Set<string> {
  const words = new Set<string>()
  const add = (phrase: string) => phrase.split(/\s+/).forEach((w) => w.length >= 2 && words.add(w.replace(/[^a-z0-9]/g, '')))
  for (const topic of TOPICS) for (const term of topic.terms) if (term.phrase) add(term.phrase)
  for (const f of FORMATS) for (const term of f.terms) if (term.phrase) add(term.phrase)
  for (const e of EXERCISES) add(e.name.replace('-', ' '))
  const extra =
    'gym tips day leg legs arm arms back chest glutes quads hamstrings muscle muscles growth strength strong science based lifting ' +
    'training tok life motivation fitness workout form check humor memes culture community hypertrophy powerlifting bodybuilding ' +
    'natural beginner beginners mistakes coach tips press bench squat squats deadlift deadlifts protein creatine cardio zone rest ' +
    'time etiquette range motion depth failure progressive overload myths recovery sleep meal prep plan program split upper lower ' +
    'push pull full body home tech technique rep reps sets set weight weights plate plates bar barbell dumbbell cable machine ' +
    'hip thrust thrusts gains gain bulk cut shred shredded lean mass stretch lengthened partials partial nutrition diet'
  add(extra)
  words.delete('')
  return words
}
