import type { FixedHoliday, MoveableHoliday } from '../types/calendar';

// ─────────────────────────────────────────────────────────────────
// FIXED ETHIOPIAN HOLIDAYS (by Ethiopian calendar month/day)
// These are national public holidays and major Orthodox religious dates.
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_FIXED_HOLIDAYS: FixedHoliday[] = [
  // ── Meskerem (Month 1) ──
  { name: 'Enkutatash (Ethiopian New Year)', month: 1, day: 1 },
  { name: 'Kidus Yohannes (St. John\'s Day)', month: 1, day: 1 },
  { name: 'Demera (Eve of Meskel)', month: 1, day: 16 },
  { name: 'Meskel (Finding of True Cross)', month: 1, day: 17 },

  // ── Tikimt (Month 2) ──
  { name: 'Kidus Mikael (St. Michael)', month: 2, day: 12 },

  // ── Hidar (Month 3) ──
  { name: 'Hidar Tsion (St. Mary of Zion)', month: 3, day: 21 },
  { name: 'Kidus Gabriel (St. Gabriel)', month: 3, day: 19 },

  // ── Tahsas (Month 4) ──
  { name: 'Genna Eve (Christmas Eve)', month: 4, day: 28 },
  { name: 'Genna / Lidet (Ethiopian Christmas)', month: 4, day: 29 },

  // ── Tir (Month 5) ──
  { name: 'Ketera (Eve of Timkat)', month: 5, day: 10 },
  { name: 'Timkat (Ethiopian Epiphany)', month: 5, day: 11 },
  { name: 'Kidus Mikael (St. Michael)', month: 5, day: 12 },

  // ── Yekatit (Month 6) ──
  { name: 'Adwa Victory Day', month: 6, day: 23 },

  // ── Megabit (Month 7) ──
  { name: 'Kidus Gabriel (St. Gabriel)', month: 7, day: 19 },

  // ── Miyazia (Month 8) ──
  { name: 'Kidus Giorgis (St. George)', month: 8, day: 23 },
  { name: 'Miyazia 27 - Patriots\' Day (Arbegnoch Qen)', month: 8, day: 27 },

  // ── Ginbot (Month 9) ──
  { name: 'Downfall of the Derg', month: 9, day: 20 },

  // ── Sene (Month 10) ──
  { name: 'Kidus Petros we Paulos (Sts. Peter & Paul)', month: 10, day: 29 },

  // ── Hamle (Month 11) ──
  { name: 'Tsome Filseta Begins (Assumption Fast)', month: 11, day: 1 },

  // ── Nehase (Month 12) ──
  { name: 'Kidane Mihret (Covenant of Mercy)', month: 12, day: 1 },
  { name: 'Buhe (Transfiguration of Jesus)', month: 12, day: 13 },
  { name: 'Filseta (Assumption of Mary)', month: 12, day: 16 },

  // ── Pagume (Month 13) ──
  { name: 'Kidus Yohannes Eve', month: 13, day: 5 },
];

// ─────────────────────────────────────────────────────────────────
// ETHIOPIAN HOLIDAYS OBSERVED BY GREGORIAN DATE
// Some Ethiopian public holidays are defined by their Gregorian date
// (international observances recognized in Ethiopia).
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_GC_HOLIDAYS: FixedHoliday[] = [
  { name: 'International Labour Day', month: 5, day: 1 },
  { name: 'Patriots\' Victory Day (May 5)', month: 5, day: 5 },
];

// ─────────────────────────────────────────────────────────────────
// MOVEABLE ETHIOPIAN HOLIDAYS (relative to Ethiopian Easter)
//
// Ethiopian Easter (Fasika/Tensae) follows the Julian/Alexandrian
// Computus. These holidays are computed as offsets from Easter Sunday.
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_MOVEABLE_HOLIDAYS: MoveableHoliday[] = [
  { name: 'Abiy Tsom (Great Lent Begins)', offsetFromEaster: -55 },
  { name: 'Debre Zeit (Mount of Olives)', offsetFromEaster: -41 },
  { name: 'Hosanna (Palm Sunday)', offsetFromEaster: -7 },
  { name: 'Hamus (Holy Thursday)', offsetFromEaster: -3 },
  { name: 'Siklet (Good Friday)', offsetFromEaster: -2 },
  { name: 'Kidus Kidame (Holy Saturday)', offsetFromEaster: -1 },
  { name: 'Fasika / Tensae (Easter Sunday)', offsetFromEaster: 0 },
  { name: 'Dagme Tensae (Easter Monday)', offsetFromEaster: 1 },
  { name: 'Erget (Ascension)', offsetFromEaster: 39 },
  { name: 'Paraklitos (Pentecost)', offsetFromEaster: 49 },
  { name: 'Tsome Hawariat Begins (Apostles\' Fast)', offsetFromEaster: 50 },
];
