/* =============================================================================
   FEATURED SITES — the places worth flying to, and how wide to draw them
   -----------------------------------------------------------------------------
   `data/sites.json` is the catalogue: forty-seven real places with real
   coordinates and real citations. This is the shortlist, and it exists because
   the catalogue was being presented badly. Four of the eight sites the picker
   offered were deliberately flat or deliberately non-topographic — `imbrium`'s
   own blurb reads "Flat, dark and vast: the best driving on the Moon", and
   Apollo 11's two-kilometre keep-out sets you down on featureless mare — while
   Tycho's central peak, Copernicus' terraces, Schröter's Valley, Hadley Rille
   under the Apennines, the tallest mountain on the Moon and the deepest hole
   anybody has found were all in the file and advertised nowhere.

   `span` is how wide the preview should be, in kilometres, chosen so the
   feature fills its frame rather than sitting in the middle of a grey square.
   It is a presentation choice, which is why it lives here in code rather than
   in the data: nothing about Tycho changes if the thumbnail is drawn wider.

   `why` is one line on what you actually get when you stand there. It is
   deliberately not the catalogue's `blurb`, which is about the place; this is
   about the visit.
   ========================================================================== */

/* Order matters: this is the order they are offered in. Apollo 11 first
   because it is the one everybody wants, then the big relief, then the far
   side and the poles, then the pit. */
export const FEATURED = [
  {
    id: 'apollo11', span: 90,
    why: 'Tranquility Base. Flat mare by design — Armstrong needed it to be. '
       + 'You land 2 km out and walk in.',
  },
  {
    id: 'tycho', span: 200,
    why: 'A 2 km central peak inside an 85 km crater, and the brightest ray '
       + 'system on the Moon thrown across the southern highlands.',
  },
  {
    id: 'copernicus', span: 230,
    why: 'Terraced walls 3.8 km deep. The floor is 3.3 km below the rim and '
       + 'the central peaks stand back up out of it.',
  },
  {
    id: 'aristarchus', span: 150,
    why: 'The brightest large feature on the Moon, and the steepest walls '
       + 'you can drive a rover at.',
  },
  {
    id: 'schroteri', span: 290,
    why: "Vallis Schroteri: the Moon's largest sinuous rille, 160 km long and "
       + 'up to 10 km wide. Drive down the inside of it.',
  },
  {
    id: 'hadley', span: 150,
    why: 'Rima Hadley under the Apennine front, where Apollo 15 drove. A '
       + 'canyon on one side and a 3.5 km mountain on the other.',
  },
  {
    id: 'mons_huygens', span: 190,
    why: "5.5 km — the tallest mountain on the Moon, and nothing between it "
       + 'and Mare Imbrium.',
  },
  {
    id: 'apollo17', span: 110,
    why: 'Taurus-Littrow: a valley with massifs on both sides taller than the '
       + 'Grand Canyon is deep. The best terrain anybody has actually stood in.',
  },
  {
    id: 'orientale', span: 1300,
    why: 'Three concentric mountain rings around a 900 km basin. The largest '
       + 'intact impact structure on the near side, seen edge-on.',
  },
  {
    id: 'tsiolkovskiy', span: 380,
    why: 'Far side, no Earth in the sky. A dark flooded floor with a bright '
       + 'central peak standing out of it.',
  },
  {
    id: 'spa', span: 2400,
    why: 'South Pole-Aitken: 2500 km across and eight deep, the biggest '
       + 'impact basin in the solar system. You are standing inside it.',
  },
  {
    id: 'shackleton_rim', span: 110,
    why: 'A 4.4 km wall above a floor that has been dark for billions of '
       + 'years. The sun never gets more than a degree and a half up.',
  },
  {
    id: 'tranquillitatis_pit', span: 70,
    /* Honest about what the preview cannot show. The global elevation is
       1.9 km per pixel; the hole is 125 m across. */
    why: 'The deepest known lunar pit, 125 m down, with the one cave anybody '
       + 'has evidence for under its west wall. Too small to see from orbit.',
  },
];

/** The ids, in order, for anything that just wants the list. */
export const FEATURED_IDS = FEATURED.map(f => f.id);

/** How wide to draw a given site, in km, or a sensible default. */
export function featuredSpan(id) {
  const f = FEATURED.find(x => x.id === id);
  return f ? f.span : 150;
}
