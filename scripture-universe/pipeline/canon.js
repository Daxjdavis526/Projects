// canon.js — the canonical manifest for the whole pipeline and app.
//
// Everything downstream trusts this file: book order, Gospel Library API
// slugs, chapter counts, and the canon-level verse totals used as hard
// validation gates. Chapter counts and canon totals are standard published
// figures; per-chapter verse counts are NOT pinned here — parse.js derives
// them from the fetched text and validate.js checks the totals and a table
// of spot checks instead, so a single mistyped number can't poison the build.

'use strict';

const CANONS = [
  { key:'ot',   name:'Old Testament',           short:'OT'  },
  { key:'nt',   name:'New Testament',           short:'NT'  },
  { key:'bofm', name:'Book of Mormon',          short:'BoM' },
  { key:'dc',   name:'Doctrine and Covenants',  short:'D&C' },
  { key:'pgp',  name:'Pearl of Great Price',    short:'PGP' },
];

// b(canon, uriPath, slug, chapters, name, abbrevs...)
// uriPath is the piece between /scriptures/ and /<chapter>; for most books it
// is "<canonSlug>/<bookSlug>", D&C is special-cased.
function b(canon, uri, chapters, name, ...abbrevs){
  return { canon, uri, chapters, name, abbrevs };
}

const BOOKS = [
  // ---- Old Testament (39) ------------------------------------------------
  b(0,'ot/gen',   50,'Genesis','Gen'),
  b(0,'ot/ex',    40,'Exodus','Ex','Exod'),
  b(0,'ot/lev',   27,'Leviticus','Lev'),
  b(0,'ot/num',   36,'Numbers','Num'),
  b(0,'ot/deut',  34,'Deuteronomy','Deut','Dt'),
  b(0,'ot/josh',  24,'Joshua','Josh'),
  b(0,'ot/judg',  21,'Judges','Judg'),
  b(0,'ot/ruth',   4,'Ruth'),
  b(0,'ot/1-sam', 31,'1 Samuel','1 Sam','1Sam'),
  b(0,'ot/2-sam', 24,'2 Samuel','2 Sam','2Sam'),
  b(0,'ot/1-kgs', 22,'1 Kings','1 Kgs','1Kgs','1 Ki'),
  b(0,'ot/2-kgs', 25,'2 Kings','2 Kgs','2Kgs','2 Ki'),
  b(0,'ot/1-chr', 29,'1 Chronicles','1 Chr','1Chr'),
  b(0,'ot/2-chr', 36,'2 Chronicles','2 Chr','2Chr'),
  b(0,'ot/ezra',  10,'Ezra'),
  b(0,'ot/neh',   13,'Nehemiah','Neh'),
  b(0,'ot/esth',  10,'Esther','Esth'),
  b(0,'ot/job',   42,'Job'),
  b(0,'ot/ps',   150,'Psalms','Ps','Psalm','Pss'),
  b(0,'ot/prov',  31,'Proverbs','Prov'),
  b(0,'ot/eccl',  12,'Ecclesiastes','Eccl'),
  b(0,'ot/song',   8,'Song of Solomon','Song','Song of Sol'),
  b(0,'ot/isa',   66,'Isaiah','Isa'),
  b(0,'ot/jer',   52,'Jeremiah','Jer'),
  b(0,'ot/lam',    5,'Lamentations','Lam'),
  b(0,'ot/ezek',  48,'Ezekiel','Ezek'),
  b(0,'ot/dan',   12,'Daniel','Dan'),
  b(0,'ot/hosea', 14,'Hosea','Hos'),
  b(0,'ot/joel',   3,'Joel'),
  b(0,'ot/amos',   9,'Amos'),
  b(0,'ot/obad',   1,'Obadiah','Obad'),
  b(0,'ot/jonah',  4,'Jonah'),
  b(0,'ot/micah',  7,'Micah'),
  b(0,'ot/nahum',  3,'Nahum','Nah'),
  b(0,'ot/hab',    3,'Habakkuk','Hab'),
  b(0,'ot/zeph',   3,'Zephaniah','Zeph'),
  b(0,'ot/hag',    2,'Haggai','Hag'),
  b(0,'ot/zech',  14,'Zechariah','Zech'),
  b(0,'ot/mal',    4,'Malachi','Mal'),
  // ---- New Testament (27) ------------------------------------------------
  b(1,'nt/matt',  28,'Matthew','Matt','Mt'),
  b(1,'nt/mark',  16,'Mark','Mk'),
  b(1,'nt/luke',  24,'Luke','Lk'),
  b(1,'nt/john',  21,'John','Jn'),
  b(1,'nt/acts',  28,'Acts'),
  b(1,'nt/rom',   16,'Romans','Rom'),
  b(1,'nt/1-cor', 16,'1 Corinthians','1 Cor','1Cor'),
  b(1,'nt/2-cor', 13,'2 Corinthians','2 Cor','2Cor'),
  b(1,'nt/gal',    6,'Galatians','Gal'),
  b(1,'nt/eph',    6,'Ephesians','Eph'),
  b(1,'nt/philip', 4,'Philippians','Philip','Phil'),
  b(1,'nt/col',    4,'Colossians','Col'),
  b(1,'nt/1-thes', 5,'1 Thessalonians','1 Thes','1Thes','1 Thess'),
  b(1,'nt/2-thes', 3,'2 Thessalonians','2 Thes','2Thes','2 Thess'),
  b(1,'nt/1-tim',  6,'1 Timothy','1 Tim','1Tim'),
  b(1,'nt/2-tim',  4,'2 Timothy','2 Tim','2Tim'),
  b(1,'nt/titus',  3,'Titus'),
  b(1,'nt/philem', 1,'Philemon','Philem'),
  b(1,'nt/heb',   13,'Hebrews','Heb'),
  b(1,'nt/james',  5,'James','Jas'),
  b(1,'nt/1-pet',  5,'1 Peter','1 Pet','1Pet'),
  b(1,'nt/2-pet',  3,'2 Peter','2 Pet','2Pet'),
  b(1,'nt/1-jn',   5,'1 John','1 Jn','1Jn'),
  b(1,'nt/2-jn',   1,'2 John','2 Jn','2Jn'),
  b(1,'nt/3-jn',   1,'3 John','3 Jn','3Jn'),
  b(1,'nt/jude',   1,'Jude'),
  b(1,'nt/rev',   22,'Revelation','Rev'),
  // ---- Book of Mormon (15) -----------------------------------------------
  b(2,'bofm/1-ne',  22,'1 Nephi','1 Ne','1Ne','1 Nephi'),
  b(2,'bofm/2-ne',  33,'2 Nephi','2 Ne','2Ne','2 Nephi'),
  b(2,'bofm/jacob',  7,'Jacob'),
  b(2,'bofm/enos',   1,'Enos'),
  b(2,'bofm/jarom',  1,'Jarom'),
  b(2,'bofm/omni',   1,'Omni'),
  b(2,'bofm/w-of-m', 1,'Words of Mormon','W of M','WofM'),
  b(2,'bofm/mosiah',29,'Mosiah'),
  b(2,'bofm/alma',  63,'Alma'),
  b(2,'bofm/hel',   16,'Helaman','Hel'),
  b(2,'bofm/3-ne',  30,'3 Nephi','3 Ne','3Ne','3 Nephi'),
  b(2,'bofm/4-ne',   1,'4 Nephi','4 Ne','4Ne','4 Nephi'),
  b(2,'bofm/morm',   9,'Mormon','Morm'),
  b(2,'bofm/ether', 15,'Ether'),
  b(2,'bofm/moro',  10,'Moroni','Moro'),
  // ---- Doctrine and Covenants (2 "books": Sections + Official Declarations)
  b(3,'dc-testament/dc',138,'Doctrine and Covenants','D&C','DC','D & C','Doctrine & Covenants'),
  b(3,'dc-testament/od',  2,'Official Declaration','OD','Official Declarations'),
  // ---- Pearl of Great Price (5) ------------------------------------------
  b(4,'pgp/moses',  8,'Moses'),
  b(4,'pgp/abr',    5,'Abraham','Abr'),
  b(4,'pgp/js-m',   1,'Joseph Smith—Matthew','JS—M','JS-M','JSM','Joseph Smith Matthew'),
  b(4,'pgp/js-h',   1,'Joseph Smith—History','JS—H','JS-H','JSH','Joseph Smith History'),
  b(4,'pgp/a-of-f', 1,'Articles of Faith','A of F','AofF'),
];

// Hard validation gates. Canon verse totals are the standard published
// counts; OD is prose (paragraph "verses" counted at first fetch, pinned by
// parse into build metadata, and only sanity-ranged here).
const CANON_VERSE_TOTALS = [23145, 7957, 6604, 3654 /* sections only */, 635];
const OD_PARA_RANGE = [10, 60];      // sanity range for OD1+OD2 paragraphs
const CHAPTER_TOTAL = 1584;          // 929+260+239+(138+2)+16

// Spot checks used by parse.js/validate.js: [book slug, chapter, verses]
const SPOT_CHECKS = [
  ['ot/gen',1,31],   ['ot/ps',119,176], ['ot/ps',117,2],   ['ot/isa',53,12],
  ['ot/mal',4,6],    ['nt/matt',5,48],  ['nt/matt',24,51], ['nt/john',11,57],
  ['nt/rev',22,21],  ['nt/james',1,27], ['bofm/1-ne',1,20],['bofm/mosiah',14,12],
  ['bofm/3-ne',12,48],['bofm/alma',17,39],['dc-testament/dc',76,119],
  ['dc-testament/dc',1,39],['pgp/moses',1,42],['pgp/js-m',1,55],
  ['pgp/js-h',1,75], ['pgp/a-of-f',1,13],
];

// Book-level verse totals for PGP (small enough to pin safely; these must sum
// to the canon total 635): Moses 356, Abraham 136, JS—M 55, JS—H 75, AofF 13.
const PGP_BOOK_TOTALS = { 'pgp/moses':356, 'pgp/abr':136, 'pgp/js-m':55, 'pgp/js-h':75, 'pgp/a-of-f':13 };

// Relationship-type vocabulary — bit order is FROZEN (edges.bin typeMask and
// the app's legend both index into this).
const TYPES = [
  'official footnote',        // 0
  'direct quotation',         // 1
  'explicit citation',        // 2
  'close textual parallel',   // 3
  'shared phrase',            // 4
  'prophecy / fulfillment',   // 5
  'shared event',             // 6
  'shared person',            // 7
  'shared teaching',          // 8
  'typology',                 // 9
  'narrative parallel',       // 10
  'intertextual allusion',    // 11
  'shared topic',             // 12 (derived from Topical Guide tags)
];
const TYPE_BIT = Object.fromEntries(
  ['footnote','quotation','citation','parallel','phrase','prophecy','event',
   'person','doctrine','typology','narrative','allusion','topic'].map((k,i)=>[k,i]));

const API = 'https://www.churchofjesuschrist.org/study/api/v3/language-pages/type/content?lang=eng&uri=';

function chapterList(){
  const out = [];
  BOOKS.forEach((bk, bi) => {
    for (let ch = 1; ch <= bk.chapters; ch++)
      out.push({ book: bi, uri: `/scriptures/${bk.uri}/${ch}`, ch,
                 cacheName: `${String(bi).padStart(2,'0')}-${bk.uri.split('/').pop()}-${ch}.json` });
  });
  return out;
}

module.exports = { CANONS, BOOKS, CANON_VERSE_TOTALS, OD_PARA_RANGE,
                   CHAPTER_TOTAL, SPOT_CHECKS, PGP_BOOK_TOTALS, API, chapterList,
                   TYPES, TYPE_BIT };
