// curated.js — stage 4: the hand-authored evidence table.
//
// This is the only hand-written data in the whole dataset, and every edge it
// produces is provenance-tagged "curated" so the app can say so. Rows cover
// famous, well-established relationships — block quotations, explicit
// citations, prophecy/fulfillment pairs — each with a short neutral note.
// Verse references use canon.js URIs directly (no name parsing to get wrong).
//
// Direction convention (dir:1): source → target reads "the target text quotes,
// cites, interprets, or claims fulfilment of the source text". The earlier
// text is always the source.

'use strict';
const { BOOKS, TYPE_BIT } = require('./canon');
const BI = Object.fromEntries(BOOKS.map((b, i) => [b.uri, i]));
BI['dc'] = BI['dc-testament/dc'];   // shorthand for the rows below
BI['od'] = BI['dc-testament/od'];

const rows = [];
// e(srcUri, sc, sv, dstUri, tc, tv, extS, extT, types, dir, note)
// sv/tv = 0 means chapter-level; extS/extT = extra verses in a range (0 = single)
function e(su, sc, sv, tu, tc, tv, extS, extT, types, dir, note){
  if (BI[su] === undefined || BI[tu] === undefined) throw new Error('bad uri ' + su + '/' + tu);
  rows.push({ sb:BI[su], sc, sv, tb:BI[tu], tc, tv, extS, extT,
              bits: types.map(t => TYPE_BIT[t]), dir, note });
}
// aligned chapter block: src chapters c1..c2 map one-to-one onto dst starting at d1
function block(su, c1, c2, tu, d1, types, note){
  for (let c = c1; c <= c2; c++) e(su, c, 0, tu, d1 + (c - c1), 0, 0, 0, types, 1, note);
}

const Q = ['quotation','parallel'], QC = ['quotation','citation'];

// ---- Isaiah in the Book of Mormon ----------------------------------------
block('ot/isa', 2, 14, 'bofm/2-ne', 12, Q,
  '2 Nephi 12–24 reproduces Isaiah 2–14, quoted from the brass plates, with textual variants.');
block('ot/isa', 48, 49, 'bofm/1-ne', 20, Q,
  'Nephi reads Isaiah 48–49 to his brothers; 1 Nephi 20–21 reproduces the two chapters.');
block('ot/isa', 50, 51, 'bofm/2-ne', 7, Q,
  'Jacob quotes Isaiah 50–51 in his discourse recorded in 2 Nephi 7–8.');
e('ot/isa', 53, 0, 'bofm/mosiah', 14, 0, 0, 0, Q, 1,
  'Abinadi recites Isaiah 53 in full before the court of King Noah (Mosiah 14).');
e('ot/isa', 54, 0, 'bofm/3-ne', 22, 0, 0, 0, Q, 1,
  'The risen Christ quotes Isaiah 54 in full to the Nephites (3 Nephi 22).');
e('ot/isa', 52, 0, 'bofm/3-ne', 20, 0, 0, 0, Q, 1,
  '3 Nephi 20:32–45 weaves extended quotations of Isaiah 52 into Christ’s covenant discourse.');
e('ot/isa', 29, 0, 'bofm/2-ne', 27, 0, 0, 0, ['quotation','prophecy','parallel'], 1,
  '2 Nephi 27 adapts and expands Isaiah 29 as a prophecy of a sealed book coming forth in the last days.');
// ---- Malachi ---------------------------------------------------------------
block('ot/mal', 3, 4, 'bofm/3-ne', 24, Q,
  'The risen Christ gives the Nephites Malachi 3–4, which they did not have (3 Nephi 24–25; see 3 Nephi 26:2).');
e('ot/mal', 4, 5, 'dc', 2, 1, 1, 2, ['quotation','prophecy'], 1,
  'D&C 2 is Moroni’s 1823 variation of Malachi 4:5–6 on Elijah turning the hearts of fathers and children.');
e('ot/mal', 4, 5, 'pgp/js-h', 1, 38, 1, 1, ['quotation','prophecy'], 1,
  'Moroni quotes Malachi 4:5–6 to Joseph Smith "with a little variation" (JS—History 1:38–39).');
e('ot/mal', 4, 1, 'pgp/js-h', 1, 37, 0, 0, ['quotation','prophecy'], 1,
  'Moroni quotes Malachi 4:1 with variation: "they that come shall burn them" (JS—History 1:37).');
e('ot/mal', 3, 0, 'pgp/js-h', 1, 36, 0, 0, QC, 1,
  'Moroni "quoted also the third chapter of Malachi" to Joseph Smith (JS—History 1:36).');
e('ot/mal', 4, 5, 'dc', 110, 13, 1, 3, ['prophecy'], 1,
  'Elijah’s appearance in the Kirtland Temple (D&C 110:13–16) is presented as the fulfilment of Malachi 4:5–6.');
// ---- Sermon on the Mount / at the Temple ----------------------------------
block('nt/matt', 5, 7, 'bofm/3-ne', 12, Q,
  'The Sermon at the Temple (3 Nephi 12–14) parallels the Sermon on the Mount (Matthew 5–7) with covenant-framed variants.');
// ---- Matthew 24 -----------------------------------------------------------
e('nt/matt', 24, 0, 'pgp/js-m', 1, 0, 0, 0, ['quotation','parallel'], 1,
  'Joseph Smith—Matthew is an inspired revision of Matthew 23:39–24:51, reordering and expanding the Olivet discourse.');
e('nt/matt', 24, 0, 'dc', 45, 16, 0, 43, ['citation','parallel','prophecy'], 1,
  'D&C 45:16–59 retells the Olivet discourse: the Lord resumes "as I said unto my disciples" on the Mount of Olives.');
// ---- Genesis / Moses / Abraham --------------------------------------------
block('ot/gen', 1, 5, 'pgp/moses', 2, Q,
  'The Book of Moses (Moses 2–8) is the Joseph Smith revision of Genesis 1–6; chapters align with substantial expansion.');
e('ot/gen', 5, 0, 'pgp/moses', 7, 0, 0, 0, ['narrative','person','prophecy'], 1,
  'Moses 7 expands Genesis 5:21–24 into Enoch’s vision: his city Zion, its translation, and the covenant of the last days.');
e('ot/gen', 5, 0, 'pgp/moses', 8, 0, 0, 0, ['narrative','parallel'], 1,
  'Moses 8 parallels the genealogy of Genesis 5:25–32 and the corruption narrative opening Genesis 6.');
e('ot/gen', 6, 0, 'pgp/moses', 8, 0, 0, 0, ['narrative','parallel'], 1,
  'Moses 8 parallels Genesis 6:1–13 — the wickedness before the flood and the call of Noah.');
e('ot/gen', 1, 0, 'pgp/abr', 4, 0, 0, 0, ['narrative','parallel'], 1,
  'Abraham 4 retells the Genesis 1 creation account in the plural: "the Gods organized and formed the heavens and the earth."');
e('ot/gen', 2, 0, 'pgp/abr', 5, 0, 0, 0, ['narrative','parallel'], 1,
  'Abraham 5 parallels Genesis 2 — the completion of creation and the planting of Eden.');
e('ot/gen', 12, 0, 'pgp/abr', 2, 0, 0, 0, ['event','person','doctrine'], 1,
  'Abraham 2 parallels Genesis 12: the departure from Haran and the covenant that all families of the earth be blessed.');
e('ot/gen', 14, 18, 'nt/heb', 7, 1, 2, 3, ['citation','person'], 1,
  'Hebrews 7 builds its priesthood argument on Melchizedek, king of Salem, who blessed Abram (Genesis 14:18–20).');
e('ot/gen', 14, 18, 'bofm/alma', 13, 14, 2, 5, ['citation','person','doctrine'], 1,
  'Alma 13:14–19 preaches the priesthood through Melchizedek, "the king of Salem" to whom Abraham paid tithes.');
e('nt/heb', 7, 0, 'bofm/alma', 13, 0, 0, 0, ['doctrine','person','parallel'], 0,
  'Hebrews 7 and Alma 13 develop the same Melchizedek-priesthood teaching from the Genesis 14 episode.');
e('ot/gen', 14, 18, 'dc', 84, 14, 2, 0, ['citation','person'], 1,
  'D&C 84:14 traces priesthood lineage through Melchizedek back to Noah, anchored in the Genesis 14 figure.');
e('ot/gen', 50, 0, 'bofm/2-ne', 3, 0, 0, 0, ['person','prophecy','narrative'], 1,
  'Lehi rehearses prophecies of Joseph of Egypt (compare Genesis 50:24–25) about a future seer named Joseph (2 Nephi 3).');
e('ot/ezek', 37, 16, 'bofm/2-ne', 3, 12, 1, 0, ['typology','prophecy'], 1,
  'The writings of Judah and of Joseph growing together (2 Nephi 3:12) is read with Ezekiel’s two sticks (Ezekiel 37:16–17).');
e('ot/ex', 20, 0, 'bofm/mosiah', 13, 0, 0, 0, QC, 1,
  'Abinadi recites the Ten Commandments of Exodus 20 to Noah’s priests (Mosiah 12:34–36; 13:12–24).');
e('ot/ex', 3, 0, 'pgp/moses', 1, 0, 0, 0, ['narrative','event','person'], 0,
  'Moses 1, like Exodus 3, records God speaking to Moses face to face and commissioning him to deliver Israel.');
// ---- prophets quoted across the canon -------------------------------------
e('ot/deut', 18, 15, 'nt/acts', 3, 22, 4, 1, ['quotation','prophecy'], 1,
  'Peter quotes Moses’ prophecy of a prophet like unto him (Deuteronomy 18:15–19) and applies it to Christ (Acts 3:22–23).');
e('ot/deut', 18, 15, 'pgp/js-h', 1, 40, 0, 0, QC, 1,
  'Moroni quotes Acts 3:22–23 "precisely as they stand in our New Testament" — Moses’ prophecy of Deuteronomy 18 (JS—History 1:40).');
e('nt/acts', 3, 22, 'pgp/js-h', 1, 40, 1, 0, QC, 1,
  'Moroni quotes Acts 3:22–23 to Joseph Smith, saying that prophet was Christ (JS—History 1:40).');
e('ot/deut', 18, 15, 'bofm/3-ne', 20, 23, 0, 0, ['quotation','prophecy'], 1,
  'The risen Christ declares "I am he of whom Moses spake," quoting the Deuteronomy 18:15 prophecy (3 Nephi 20:23).');
e('ot/joel', 2, 28, 'nt/acts', 2, 17, 4, 4, ['quotation','prophecy'], 1,
  'At Pentecost Peter quotes Joel 2:28–32: "I will pour out of my Spirit upon all flesh" (Acts 2:17–21).');
e('ot/joel', 2, 28, 'pgp/js-h', 1, 41, 4, 0, ['citation','prophecy'], 1,
  'Moroni quotes Joel 2:28–32 and says it was not yet fulfilled, but soon would be (JS—History 1:41).');
e('ot/isa', 11, 0, 'pgp/js-h', 1, 40, 0, 0, ['citation','prophecy'], 1,
  'Moroni quotes Isaiah 11, "saying that it was about to be fulfilled" (JS—History 1:40).');
e('ot/isa', 11, 0, 'dc', 113, 1, 0, 5, ['citation'], 1,
  'D&C 113:1–6 answers questions on Isaiah 11 — the stem, rod, and root of Jesse.');
e('ot/isa', 29, 13, 'pgp/js-h', 1, 19, 0, 0, QC, 1,
  'In the First Vision the Lord echoes Isaiah 29:13: "they draw near to me with their lips, but their hearts are far from me."');
e('nt/matt', 15, 8, 'pgp/js-h', 1, 19, 1, 0, ['parallel','citation'], 1,
  'JS—History 1:19 parallels Christ’s use of Isaiah’s words in Matthew 15:8–9 about lip-honour and vain worship.');
e('ot/isa', 7, 14, 'nt/matt', 1, 23, 0, 0, ['quotation','prophecy'], 1,
  'Matthew reads the virgin-and-Immanuel sign of Isaiah 7:14 as fulfilled in the birth of Jesus (Matthew 1:23).');
e('ot/isa', 40, 3, 'nt/matt', 3, 3, 0, 0, ['quotation','prophecy'], 1,
  'The voice crying in the wilderness (Isaiah 40:3) is applied to John the Baptist (Matthew 3:3).');
e('ot/isa', 40, 3, 'bofm/1-ne', 10, 8, 0, 0, ['citation','prophecy'], 1,
  'Lehi prophesies of the Baptist in Isaiah’s words: "Prepare ye the way of the Lord" (1 Nephi 10:8).');
e('ot/isa', 61, 1, 'nt/luke', 4, 18, 1, 1, ['quotation','prophecy'], 1,
  'In Nazareth Jesus reads Isaiah 61:1–2 — "the Spirit of the Lord is upon me" — and declares it fulfilled (Luke 4:18–21).');
e('ot/isa', 53, 7, 'nt/acts', 8, 32, 1, 1, ['quotation'], 1,
  'The Ethiopian eunuch is reading Isaiah 53:7–8 when Philip joins his chariot (Acts 8:32–33).');
e('ot/ps', 82, 6, 'nt/john', 10, 34, 0, 0, ['quotation'], 1,
  'Jesus answers his accusers from Psalm 82:6: "Is it not written in your law, I said, Ye are gods?" (John 10:34).');
e('ot/micah', 4, 1, 'ot/isa', 2, 2, 2, 2, ['parallel'], 0,
  'Micah 4:1–3 and Isaiah 2:2–4 carry the same mountain-of-the-Lord’s-house oracle nearly word for word.');
e('ot/dan', 2, 34, 'dc', 65, 2, 11, 0, ['citation','prophecy','typology'], 1,
  'D&C 65:2 takes up Daniel’s stone cut without hands (Daniel 2:34–45): the kingdom rolling forth to fill the earth.');
e('ot/zech', 13, 6, 'dc', 45, 51, 0, 2, ['citation','prophecy'], 1,
  'D&C 45:51–53 develops Zechariah 13:6 — "What are these wounds in thine hands?" — as a latter-day scene.');
e('ot/isa', 63, 0, 'dc', 133, 46, 0, 7, QC, 1,
  'D&C 133:46–53 reworks Isaiah 63:1–9: "Who is this that cometh with dyed garments?"');
// ---- New Testament in Restoration scripture -------------------------------
e('nt/james', 1, 5, 'pgp/js-h', 1, 11, 0, 1, QC, 1,
  'James 1:5 — "If any of you lack wisdom, let him ask of God" — is the verse that sent Joseph Smith to the grove (JS—History 1:11–13).');
e('nt/john', 10, 16, 'bofm/3-ne', 15, 17, 0, 4, ['quotation','prophecy'], 1,
  'The risen Christ tells the Nephites they are the "other sheep" of John 10:16 (3 Nephi 15:17–24).');
e('nt/john', 5, 29, 'dc', 76, 17, 0, 0, QC, 1,
  'D&C 76 opens from a pondering of John 5:29 on the resurrection of the just and the unjust (D&C 76:15–17).');
e('nt/1-cor', 15, 0, 'dc', 76, 0, 0, 0, ['citation','doctrine'], 1,
  'D&C 76 is the vision of the three degrees of glory, elaborating Paul’s resurrection chapter (1 Corinthians 15).');
e('nt/1-cor', 15, 40, 'dc', 76, 70, 2, 28, ['citation','doctrine'], 1,
  'The celestial, terrestrial, and telestial glories of D&C 76 elaborate Paul’s bodies celestial and terrestrial and the differing glory of sun, moon, and stars (1 Corinthians 15:40–42).');
e('nt/1-cor', 15, 29, 'dc', 128, 16, 0, 0, QC, 1,
  'D&C 128:16 quotes 1 Corinthians 15:29 — "Else what shall they do which are baptized for the dead?"');
e('nt/matt', 16, 18, 'dc', 128, 10, 1, 0, QC, 1,
  'D&C 128:10 quotes Matthew 16:18–19 on the keys of the kingdom and binding on earth and in heaven.');
e('nt/1-cor', 12, 0, 'bofm/moro', 10, 0, 0, 0, ['doctrine','parallel'], 0,
  'Moroni 10:8–17 lists the gifts of the Spirit in close parallel to 1 Corinthians 12:4–11.');
e('nt/1-cor', 12, 0, 'dc', 46, 0, 0, 0, ['doctrine','parallel'], 0,
  'D&C 46:11–26 gives the catalogue of spiritual gifts parallel to 1 Corinthians 12.');
e('bofm/moro', 10, 0, 'dc', 46, 0, 0, 0, ['doctrine','parallel'], 0,
  'Moroni 10 and D&C 46 carry parallel catalogues of the gifts of the Spirit.');
e('nt/1-cor', 13, 0, 'bofm/moro', 7, 0, 0, 0, ['doctrine','parallel','quotation'], 0,
  'Moroni 7:44–48 on faith, hope, and charity parallels 1 Corinthians 13, phrase for phrase in places.');
e('nt/heb', 11, 0, 'bofm/ether', 12, 0, 0, 0, ['doctrine','parallel'], 0,
  'Ether 12 is Moroni’s discourse on faith with a catalogue of examples parallel to Hebrews 11.');
e('nt/heb', 11, 1, 'bofm/ether', 12, 6, 0, 0, ['parallel','doctrine'], 0,
  '"Faith is the substance of things hoped for" (Hebrews 11:1) and "faith is things which are hoped for and not seen" (Ether 12:6).');
e('nt/luke', 22, 44, 'dc', 19, 16, 0, 3, ['citation','event','doctrine'], 1,
  'D&C 19:16–19 — blood at every pore — speaks of the agony Luke places in Gethsemane (Luke 22:44).');
e('nt/rev', 4, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77 is a question-and-answer key to the book of Revelation, beginning with the sea of glass and the four beasts of Revelation 4.');
e('nt/rev', 5, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:6–7 answers questions on the sealed book of Revelation 5.');
e('nt/rev', 6, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:6–7 reads the seven seals of Revelation 6 as seven thousand years.');
e('nt/rev', 7, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:8–11 answers on the four angels and the 144,000 of Revelation 7.');
e('nt/rev', 8, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:12 interprets the trumpets of Revelation 8.');
e('nt/rev', 9, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:13 places the things of Revelation 9 after the opening of the seventh seal.');
e('nt/rev', 10, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:14 reads the little book eaten by John (Revelation 10) as a mission to gather Israel.');
e('nt/rev', 11, 0, 'dc', 77, 0, 0, 0, ['citation'], 1,
  'D&C 77:15 answers on the two witnesses of Revelation 11.');
// ---- Articles of Faith anchors --------------------------------------------
e('nt/heb', 6, 1, 'pgp/a-of-f', 1, 4, 1, 0, ['doctrine'], 1,
  'The first principles and ordinances of Articles of Faith 1:4 track the foundation list of Hebrews 6:1–2.');
e('nt/heb', 5, 4, 'pgp/a-of-f', 1, 5, 0, 0, QC, 1,
  '"A man must be called of God … as was Aaron": Articles of Faith 1:5 takes its phrase from Hebrews 5:4.');
e('ot/isa', 11, 12, 'pgp/a-of-f', 1, 10, 0, 0, ['doctrine','prophecy'], 1,
  'The gathering of Israel in Articles of Faith 1:10 rests on prophecies like Isaiah 11:12.');
e('nt/philip', 4, 8, 'pgp/a-of-f', 1, 13, 0, 0, ['allusion','parallel'], 1,
  '"If there is anything virtuous, lovely, or of good report" — Articles of Faith 1:13 echoes Philippians 4:8.');
// ---- premortal / foreordination -------------------------------------------
e('ot/jer', 1, 5, 'pgp/abr', 3, 22, 0, 1, ['doctrine'], 0,
  '"Before I formed thee … I knew thee" (Jeremiah 1:5) and the noble and great premortal intelligences of Abraham 3:22–23.');
e('ot/job', 38, 7, 'pgp/abr', 3, 22, 0, 4, ['doctrine','allusion'], 0,
  'The morning stars singing at creation (Job 38:7) is read alongside the premortal council of Abraham 3.');

// ---- persons for person mode ----------------------------------------------
// Postings are computed honestly at pack time as the union of (a) Topical
// Guide tags whose slug contains one of `tg`, and (b) verses whose text
// contains one of `tokens` (or a `bigrams` word pair). The app labels the
// result "passages naming / tagged for X" — no biography claims.
const PERSONS = [
  { name:'Jesus Christ',  tg:['jesus-christ'],  tokens:['jesus'] },
  { name:'Adam',          tg:['adam'],          tokens:['adam'] },
  { name:'Eve',           tg:[],                tokens:['eve'] },
  { name:'Enoch',         tg:['enoch'],         tokens:['enoch'] },
  { name:'Noah',          tg:['noah'],          tokens:['noah','noe'] },
  { name:'Abraham',       tg:['abraham'],       tokens:['abraham','abram'] },
  { name:'Isaac',         tg:['isaac'],         tokens:['isaac'] },
  { name:'Jacob (Israel)',tg:[],                tokens:['jacob'] },
  { name:'Joseph',        tg:['joseph'],        tokens:['joseph'] },
  { name:'Moses',         tg:['moses'],         tokens:['moses'] },
  { name:'Elijah',        tg:['elijah'],        tokens:['elijah','elias'] },
  { name:'Isaiah',        tg:['isaiah'],        tokens:['isaiah','esaias'] },
  { name:'Daniel',        tg:['daniel'],        tokens:['daniel'] },
  { name:'Peter',         tg:['peter'],         tokens:['peter','cephas'] },
  { name:'Paul',          tg:['paul'],          tokens:['paul'] },
  { name:'John',          tg:['john'],          tokens:['john'] },
  { name:'Mary',          tg:['mary'],          tokens:['mary'] },
  { name:'Melchizedek',   tg:['melchizedek'],   tokens:['melchizedek','melchisedec'] },
  { name:'Nephi',         tg:['nephi'],         tokens:['nephi'] },
  { name:'Moroni',        tg:['moroni'],        tokens:['moroni'] },
  { name:'Joseph Smith',  tg:['joseph-smith'],  tokens:[], bigrams:[['joseph','smith']] },
];
const isPersonSlug = slug => PERSONS.some(p => p.tg.some(t => slug.includes(t)));

module.exports = { rows, PERSONS, isPersonSlug };
