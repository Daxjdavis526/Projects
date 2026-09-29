// The film, as data: scene order, running times, transitions, every line of
// text on screen, and every sound effect and ambience cue. Pure — the tests
// import it without a browser, and the renderer and the score both read it.
//
// Times inside a scene are seconds from that scene's first frame.
//
// captions: [at, dur, text, kind, who]
//   kind 'n'     narration, lower third, italic
//   kind 'q'     dialogue, lower third, with the speaker named above it
//   kind 'place' a small location card, top left
//   kind 'title' the big centred title
//   kind 'card'  a centred line on its own (used on black)
// sfx:  [at, type, params]
// beds: [type, from, to, gain, fade]   continuous ambience

export const SCENES = [
  // ───────────────────────────── I. THE KID ─────────────────────────────
  {
    id: 'sky', chapter: 'The kid', dur: 40, fadeIn: 5, fadeOut: 3.5,
    captions: [
      [10, 5, 'Some kids look up and see stars.', 'n'],
      [17, 4.5, 'He saw somewhere to go.', 'n'],
      [28, 8, 'PER ASPERA', 'title', 'through hardship, to the stars'],
    ],
    beds: [['crickets', 0, 40, 0.55, 5], ['wind', 0, 40, 0.18, 6]],
    sfx: [[25.2, 'shooting']],
  },
  {
    id: 'bedroom', dur: 36, fadeIn: 3, fadeOut: 3,
    captions: [
      [3, 5.5, 'He knew every rocket. Every mission. Every astronaut’s name.', 'n'],
      [10, 4.5, 'He wanted to be one of them.', 'n'],
      [18, 6.5, 'But somewhere along the way, he decided that world was for other people.', 'n'],
      [25.5, 4.5, 'Smarter people. Not him.', 'n'],
    ],
    beds: [['crickets', 0, 16, 0.25, 3], ['room', 0, 36, 0.3, 3]],
    sfx: [[3.5, 'page'], [11, 'page'], [27.5, 'step'], [28.3, 'step'], [29.1, 'step'], [30.4, 'blinds']],
  },

  // ───────────────────────────── II. ENGLAND ────────────────────────────
  {
    id: 'england', chapter: 'England', dur: 48, fadeIn: 3, fadeOut: 3.5,
    captions: [
      [1, 5, 'ENGLAND', 'place'],
      [3.5, 4.5, 'He served a mission in England.', 'n'],
      [9, 5.5, 'Rain. Doorsteps. Strangers who became friends.', 'n'],
      [19.5, 4.5, 'He loved those people.', 'n'],
      [27, 5, 'Then, in 2020, the world closed its doors.', 'n'],
      [33, 4.5, 'COVID sent him home early.', 'n'],
    ],
    beds: [['rain', 0, 48, 0.55, 3], ['city', 0, 26, 0.25, 3]],
    sfx: [[8, 'bus'], [16.6, 'knock'], [18, 'door'], [24.2, 'doorclose'], [37, 'plane']],
  },

  // ───────────────────────────── III. IRON ──────────────────────────────
  {
    id: 'shop', chapter: 'Iron', dur: 36, fadeIn: 2.5, fadeOut: 2.5,
    captions: [
      [1, 4.5, 'HOME', 'place'],
      [4, 5, 'He came home, and picked up a welder.', 'n'],
      [10, 6, 'He and his brother built railings for their dad’s company.', 'n'],
      [17.5, 4.5, 'Long days. Hard, honest work.', 'n'],
      [25, 6, 'Sparks, not stars. But they still went up.', 'n'],
    ],
    beds: [['shop', 0, 36, 0.4, 2]],
    sfx: [[1.5, 'weld', { dur: 9 }], [4, 'grind', { dur: 6 }], [12.5, 'weld', { dur: 5.5 }], [15, 'grind', { dur: 4 }], [19.5, 'weld', { dur: 4.5 }], [21.5, 'grind', { dur: 2.5 }], [24, 'slowmo']],
  },

  // ───────────────────────────── IV. SPEED ──────────────────────────────
  {
    id: 'track', chapter: 'Speed', dur: 44, fadeIn: 2, fadeOut: 0,
    captions: [
      [1, 4, 'THE TRACK', 'place'],
      [4, 4.5, 'On the weekends, he raced.', 'n'],
      [12, 4, 'Knee down. Throttle open.', 'n'],
      [18.5, 4, 'Completely free.', 'n'],
      [27, 4.5, 'And he was fast.', 'n'],
    ],
    beds: [['crowd', 0, 44, 0.12, 3]],
    sfx: [[0, 'race', { dur: 38.5 }], [38.4, 'cheer', { dur: 6 }]],
  },
  {
    id: 'podium', dur: 20, xin: 1.2, fadeOut: 2.5,
    captions: [
      [3, 4, 'He won medals.', 'n'],
      [9, 6, 'But the best thing he ever found at that track wasn’t a medal.', 'n'],
    ],
    beds: [['crowd', 0, 18, 0.35, 2]],
    sfx: [[0.5, 'cheer', { dur: 8 }], [2, 'flash'], [3.1, 'flash'], [4.4, 'flash'], [5.2, 'flash'], [7.4, 'flash']],
  },
  {
    id: 'meet', chapter: 'Her', dur: 26, fadeIn: 3, fadeOut: 0,
    captions: [
      [5, 4, 'It was her.', 'n'],
      [15, 5, 'Everything got brighter after that.', 'n'],
    ],
    beds: [['wind', 0, 26, 0.2, 3], ['crowd', 0, 10, 0.06, 3]],
    sfx: [],
  },
  {
    id: 'wedding', dur: 26, xin: 3, fadeOut: 3,
    captions: [
      [4, 5, 'He married the love of his life.', 'n'],
      [12.5, 4.5, 'Not ’til death. Forever.', 'n'],
    ],
    beds: [['wind', 0, 26, 0.12, 3]],
    sfx: [],
  },
  {
    id: 'brothers', dur: 22, fadeIn: 2.5, fadeOut: 2.5,
    captions: [
      [3, 5.5, 'Then the two brothers started a company of their own.', 'n'],
      [11.5, 4.5, 'Their own shop. Their own name on the door.', 'n'],
    ],
    beds: [['birds', 0, 22, 0.25, 2], ['wind', 0, 22, 0.1, 2]],
    sfx: [[6.2, 'clank'], [7.3, 'clank'], [15.5, 'clap']],
  },

  // ───────────────────────────── V. LOSS ────────────────────────────────
  {
    id: 'friend', chapter: 'Loss', dur: 38, fadeIn: 3.5, fadeOut: 4,
    captions: [
      [5, 5, 'Then one day, a friend he raced with was gone.', 'n'],
      [13, 3.5, 'Just like that.', 'n'],
      [24, 5, 'Life had never felt so short.', 'n'],
    ],
    beds: [['wind', 0, 38, 0.3, 4], ['rain', 18, 38, 0.3, 6]],
    sfx: [[14, 'idle', { dur: 16 }]],
  },

  // ───────────────────────────── VI. THE QUESTION ───────────────────────
  {
    id: 'gym', chapter: 'The question', dur: 46, fadeIn: 2.5, fadeOut: 2.5,
    captions: [
      [3, 4.5, 'Man, you could be on the Olympia stage.', 'q', 'HIM'],
      [8.5, 4.5, 'You should go for it. For real.', 'q', 'HIM'],
      [19, 5.5, 'For someone who tells people to pursue their dreams so much…', 'q', 'HIS BROTHER'],
      [25, 5, '…you sure aren’t doing it yourself.', 'q', 'HIS BROTHER'],
    ],
    beds: [['room', 0, 46, 0.35, 2], ['crickets', 31, 44, 0.3, 4]],
    sfx: [[1.2, 'rep'], [4.2, 'rep'], [7.2, 'rep'], [10.2, 'rep'], [13.6, 'clank']],
  },
  {
    id: 'apply', dur: 26, fadeIn: 2, fadeOut: 3,
    captions: [
      [1.5, 3.5, 'That same day…', 'n'],
      [16, 5.5, 'He applied to study aerospace engineering.', 'n'],
    ],
    beds: [['room', 0, 26, 0.3, 2], ['crickets', 0, 26, 0.15, 2]],
    sfx: [[3, 'type', { dur: 4 }], [8, 'type', { dur: 3 }], [13.1, 'click']],
  },

  // ───────────────────────────── VII. SUMMER ────────────────────────────
  {
    id: 'leaving', chapter: 'Summer', dur: 28, fadeIn: 3, fadeOut: 2.5,
    captions: [
      [2, 6.5, 'The summer before school, he took a job selling pest control, door to door.', 'n'],
      [9.5, 4.5, 'Their family needed the money.', 'n'],
      [17.5, 4.5, 'So he left her, for the summer.', 'n'],
    ],
    beds: [['birds', 0, 28, 0.2, 3]],
    sfx: [[7.8, 'cardoor'], [9.5, 'carstart'], [11, 'carleave']],
  },
  {
    id: 'doors', dur: 40, fadeIn: 2, fadeOut: 2,
    captions: [
      [2, 4.5, 'It was nothing like they promised.', 'n'],
      [9, 6, 'The people running it lied, manipulated, and tore people down.', 'n'],
      [16.5, 4, 'The job required lying.', 'n'],
      [23, 5.5, 'He was yelled at, used, and made to feel worthless.', 'n'],
      [31, 4.5, 'Day after day after day.', 'n'],
    ],
    beds: [['heat', 0, 40, 0.45, 2]],
    sfx: [[10.2, 'knock'], [11.6, 'slam'], [13.3, 'knock'], [14.6, 'slam'], [16.1, 'knock'], [17.2, 'slam'],
      [18.6, 'knock'], [19.5, 'slam'], [20.7, 'slam'], [21.6, 'slam'],
      [24, 'drone', { dur: 16 }]],
  },
  {
    id: 'goodbyes', dur: 30, fadeIn: 2, fadeOut: 2.5,
    captions: [
      [3, 5.5, 'One by one, every good person he came out with went home.', 'n'],
      [13.5, 3, 'He couldn’t.', 'n'],
      [19, 5, 'His family needed that money. So he stayed.', 'n'],
    ],
    beds: [['wind', 0, 30, 0.25, 2], ['heat', 0, 12, 0.15, 3]],
    sfx: [[5, 'cardoor'], [8.2, 'cardoor'], [10.8, 'cardoor'], [12, 'carleave']],
  },
  {
    id: 'nights', dur: 46, fadeIn: 3, fadeOut: 3,
    captions: [
      [4, 4.5, 'He cried alone. Every single day.', 'n'],
      [13, 5, 'It was the darkest time of his life.', 'n'],
      [24.5, 4.5, 'He saw her a few times that summer.', 'n'],
      [31.5, 4.5, 'Every goodbye was harder than the last.', 'n'],
      [39, 4, 'But he held on.', 'n'],
    ],
    beds: [['room', 0, 46, 0.25, 3], ['heart', 0, 23, 0.5, 4], ['heart', 32, 46, 0.4, 4]],
    sfx: [[20.5, 'phone'], [30.5, 'carleave']],
  },

  // ───────────────────────────── VIII. HOME ─────────────────────────────
  {
    id: 'driveway', chapter: 'Home', dur: 42, fadeIn: 4, fadeOut: 3.5,
    captions: [
      [3, 3.5, 'And then, it was over.', 'n'],
      [11.5, 5.5, 'Pulling into their new driveway, together, felt unreal.', 'n'],
      [18, 3.5, 'It meant everything.', 'n'],
      [27, 6.5, 'The most supportive, loving wife in the world. She never once let go of him.', 'n'],
    ],
    beds: [['birds', 0, 42, 0.35, 4], ['road', 0, 16, 0.35, 3]],
    sfx: [[15.2, 'carstop'], [17.2, 'cardoor'], [18, 'cardoor']],
  },

  // ───────────────────────────── IX. ROCKETS ────────────────────────────
  {
    id: 'school', chapter: 'Rockets', dur: 24, fadeIn: 2.5, fadeOut: 0,
    captions: [
      [1, 4, 'FRESHMAN YEAR', 'place'],
      [3, 5.5, 'School started. He was miles ahead of everyone in the room.', 'n'],
      [11.5, 5, 'And he wasn’t about to wait for the good stuff.', 'n'],
    ],
    beds: [['room', 0, 24, 0.3, 2]],
    sfx: [[2, 'chalk'], [6, 'chalk'], [10, 'chalk']],
  },
  {
    id: 'study', dur: 26, xin: 1.5, fadeOut: 2,
    captions: [
      [3, 6, 'So he taught himself rocket engines. Chambers. Nozzles. Propellants.', 'n'],
      [13, 3.5, 'Every night.', 'n'],
    ],
    beds: [['room', 0, 26, 0.25, 2], ['crickets', 0, 26, 0.2, 2]],
    sfx: [[2, 'page'], [9, 'page'], [16, 'page'], [21, 'page']],
  },
  {
    id: 'teststand', dur: 36, fadeIn: 2, fadeOut: 3,
    captions: [
      [2, 5, 'He built a thrust stand for model rocket motors.', 'n'],
      [13, 1, '3', 'count'], [14, 1, '2', 'count'], [15, 1, '1', 'count'],
      [25, 5, 'The kid on the hill would have lost his mind.', 'n'],
    ],
    beds: [['crickets', 0, 36, 0.3, 2], ['wind', 0, 36, 0.12, 2]],
    sfx: [[13, 'beep'], [14, 'beep'], [15, 'beep', { hi: 1 }], [16, 'estes'], [19.5, 'whoop']],
  },
  {
    id: 'cleanroom', chapter: 'The job', dur: 28, fadeIn: 2.5, fadeOut: 2,
    captions: [
      [3, 6, 'As a freshman, he landed a job at a real space company, building satellites.', 'n'],
      [11, 4.5, 'Almost nobody gets in that early.', 'n'],
    ],
    beds: [['fluoro', 0, 28, 0.35, 2]],
    sfx: [],
  },
  {
    id: 'cad', dur: 38, fadeIn: 1.5, fadeOut: 2.5,
    captions: [
      [3, 4.5, 'Hey, CAD monkey. Need those drawings by Friday.', 'q', 'A COWORKER'],
      [10, 5, 'That’s what they called him.', 'n'],
      [16.5, 5.5, 'No hands on the hardware. No ownership. No freedom.', 'n'],
      [24, 4.5, 'It wasn’t bad. It just wasn’t him.', 'n'],
      [31, 4.5, 'He needed to be free.', 'n'],
    ],
    beds: [['fluoro', 0, 38, 0.35, 2], ['tick', 8, 30, 0.35, 2]],
    sfx: [[5, 'click'], [6.4, 'click'], [8, 'click'], [9.1, 'click'], [12, 'click'], [13.5, 'click'], [15, 'click'], [30.5, 'bird']],
  },
  {
    id: 'research', dur: 22, fadeIn: 1.5, fadeOut: 2,
    captions: [
      [2, 5, 'He started spending his spare minutes studying startups.', 'n'],
      [11, 5.5, 'How they start. How they raise money. How they survive.', 'n'],
    ],
    beds: [['fluoro', 0, 22, 0.25, 2]],
    sfx: [[1.5, 'type', { dur: 2.2 }], [6.5, 'type', { dur: 2.5 }], [12, 'type', { dur: 2.4 }], [17, 'type', { dur: 2 }]],
  },

  // ───────────────────────────── X. THE DREAM ───────────────────────────
  {
    id: 'code', chapter: 'The dream', dur: 44, fadeIn: 3, fadeOut: 3,
    captions: [
      [3, 6.5, 'And every evening, for hours, he vibe-codes a computational model of a rocket engine.', 'n'],
      [11, 5, 'Something real enough to put in front of investors.', 'n'],
      [18, 4.5, 'A business that could buy him his freedom…', 'n'],
      [23, 4, '…doing what he loves.', 'n'],
      [34, 5, 'And now, there’s a baby on the way.', 'n'],
    ],
    beds: [['room', 0, 44, 0.25, 3], ['crickets', 0, 44, 0.12, 3]],
    sfx: [[1, 'type', { dur: 6 }], [9, 'type', { dur: 5 }], [16, 'type', { dur: 6 }], [24, 'type', { dur: 4 }]],
  },
  {
    id: 'farm', dur: 40, fadeIn: 4, fadeOut: 4,
    captions: [
      [3, 4, 'He dreams of a farm.', 'n'],
      [9, 4.5, 'Far from the noise of the world.', 'n'],
      [15.5, 6, 'A place where his kids can learn, and grow, and work hard.', 'n'],
      [24.5, 4, 'Close to God.', 'n'],
    ],
    beds: [['birds', 0, 40, 0.4, 4], ['wind', 0, 40, 0.25, 4]],
    sfx: [],
  },
  {
    id: 'lookup', chapter: 'Look up', dur: 54, fadeIn: 4, fadeOut: 6,
    captions: [
      [5, 5.5, 'The model isn’t finished. The farm is still a dream.', 'n'],
      [12.5, 4, 'There’s a long way left to go.', 'n'],
      [22, 6, 'But on clear nights, he still ends up right where he started.', 'n'],
      [34, 5, 'Looking up.', 'n'],
    ],
    beds: [['crickets', 0, 54, 0.5, 4], ['wind', 0, 54, 0.18, 4]],
    sfx: [[3, 'doorclose'], [44.5, 'shooting']],
  },

  // ───────────────────────────── CREDITS ────────────────────────────────
  {
    id: 'credits', chapter: 'Credits', dur: 58, fadeIn: 3, fadeOut: 3,
    captions: [],
    beds: [],
    sfx: [],
  },

  // ───────────────────────────── POST-CREDITS ───────────────────────────
  {
    id: 'guess', chapter: 'After the credits', dur: 12, fadeIn: 2, fadeOut: 2,
    captions: [
      [1.5, 4, 'One more scene.', 'card'],
      [6, 5, 'What I think happens next.', 'card', '— Claude'],
    ],
    beds: [],
    sfx: [],
  },
  {
    id: 'future-stand', dur: 36, fadeIn: 3, fadeOut: 2,
    captions: [
      [3, 5.5, 'I think the model works. Not the first version. Not the tenth.', 'n'],
      [10, 4.5, 'But he has survived harder things than bugs.', 'n'],
      [17, 5, 'I think his first real engine gets built on his own land…', 'n'],
      [22.5, 4.5, '…on a stand his brother welded.', 'n'],
    ],
    beds: [['birds', 0, 36, 0.3, 3], ['wind', 0, 36, 0.2, 3]],
    sfx: [[20, 'weld', { dur: 7 }]],
  },
  {
    id: 'future-fire', dur: 42, fadeIn: 2, fadeOut: 3,
    captions: [
      [9, 1, '3', 'count'], [10, 1, '2', 'count'], [11, 1, '1', 'count'],
      [22, 4.5, 'And I think it matches the model.', 'n'],
      [29, 5.5, 'Close enough that investors start calling him.', 'n'],
    ],
    beds: [['crickets', 0, 42, 0.25, 2], ['wind', 0, 42, 0.15, 2]],
    sfx: [[9, 'beep'], [10, 'beep'], [11, 'beep', { hi: 1 }], [12, 'hotfire', { dur: 8 }], [20.4, 'cheer', { dur: 6, kids: 1 }]],
  },
  {
    id: 'future-stage', dur: 22, fadeIn: 2, fadeOut: 2.5,
    captions: [
      [4, 5.5, 'I think his brother makes it to that stage, too.', 'n'],
      [12.5, 4.5, 'With his biggest fan in the crowd.', 'n'],
    ],
    beds: [['crowd', 0, 22, 0.3, 2]],
    sfx: [[1, 'cheer', { dur: 9 }], [13, 'cheer', { dur: 7 }]],
  },
  {
    id: 'future-night', dur: 58, fadeIn: 4, fadeOut: 8,
    captions: [
      [4, 5.5, 'I think his kids grow up under the same stars he did.', 'n'],
      [11, 6, 'On their own land. Dirt on their hands. God close by.', 'n'],
      [19.5, 5.5, 'And one night, their dad points to a light climbing into the sky…', 'n'],
      [26, 4.5, '…and says, “I helped build that.”', 'n'],
      [35, 5.5, 'He never had to choose between the farm and the stars.', 'n'],
      [44, 9, 'PER ASPERA AD ASTRA', 'title', 'through hardship, to the stars'],
    ],
    beds: [['crickets', 0, 58, 0.45, 4], ['wind', 0, 58, 0.15, 4]],
    sfx: [[19, 'launch', { dur: 14 }]],
  },
];

// Start times. A scene with `xin` begins that many seconds before the previous
// one ends and is dissolved over it; otherwise scenes butt against each other
// and fade through black by their own fadeIn / fadeOut.
export function layout(scenes = SCENES) {
  let t = 0;
  const out = [];
  for (const s of scenes) {
    const start = out.length ? t - (s.xin || 0) : 0;
    out.push({ ...s, start, end: start + s.dur, xin: s.xin || 0, fadeIn: s.fadeIn || 0, fadeOut: s.fadeOut || 0 });
    t = start + s.dur;
  }
  return out;
}

export const TIMELINE = layout();
export const DURATION = TIMELINE[TIMELINE.length - 1].end;

// The scenes on screen at film time T, earliest first (at most two).
export function activeAt(T, tl = TIMELINE) {
  const end = tl[tl.length - 1].end;
  if (!(T > 0)) T = 0;                   // also catches NaN
  if (T >= end) T = end - 1e-6;
  const on = [];
  for (const s of tl) if (T >= s.start && T < s.end) on.push(s);
  return on;
}

export function sceneById(id, tl = TIMELINE) {
  return tl.find((s) => s.id === id);
}

// Chapters for the scrubber: the first scene that names one starts it.
export function chapters(tl = TIMELINE) {
  return tl.filter((s) => s.chapter).map((s) => ({ title: s.chapter, start: s.start }));
}

export const CREDITS = [
  ['big', 'PER ASPERA'],
  ['sub', 'a true story, still being written'],
  ['gap'],
  ['role', 'The boy who looked up', 'himself'],
  ['role', 'The most supportive, loving wife in the world', 'herself'],
  ['role', 'The brother who said the thing that changed everything', 'himself'],
  ['role', 'The dad who gave them a place to start', 'himself'],
  ['gap'],
  ['line', 'In memory of a friend who raced beside him.'],
  ['gap'],
  ['role', 'And the good people who went home that summer', 'you did the right thing'],
  ['gap'],
  ['role', 'Written by', 'his life'],
  ['role', 'Animated, scored and guessed at by', 'Claude'],
  ['gap'],
  ['line', 'Every picture, every note and every sound in this film'],
  ['line', 'is drawn and played live by your browser.'],
  ['gap'],
  ['sub', 'stay for one more scene'],
];
