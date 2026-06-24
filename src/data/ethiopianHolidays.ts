import type { FixedHoliday, MoveableHoliday } from '../types/calendar';

// ─────────────────────────────────────────────────────────────────
// FIXED ETHIOPIAN HOLIDAYS (by Ethiopian calendar month/day)
// These are national public holidays and major Orthodox religious dates.
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_FIXED_HOLIDAYS: FixedHoliday[] = [
  // ── መስከረም (Month 1) ──
  { name: 'እንቁጣጣሽ', month: 1, day: 1 },
  { name: 'ቅዱስ ዮሐንስ', month: 1, day: 1 },
  { name: 'ደመራ', month: 1, day: 16 },
  { name: 'መስቀል', month: 1, day: 17 },

  // ── ጥቅምት (Month 2) ──
  { name: 'ቅዱስ ሚካኤል', month: 2, day: 12 },

  // ── ኅዳር (Month 3) ──
  { name: 'ኅዳር ጽዮን', month: 3, day: 21 },
  { name: 'ቅዱስ ገብርኤል', month: 3, day: 19 },

  // ── ታኅሣሥ (Month 4) ──
  { name: 'የገና ዋዜማ', month: 4, day: 28 },
  { name: 'ገና / ልደት', month: 4, day: 29 },

  // ── ጥር (Month 5) ──
  { name: 'ከተራ', month: 5, day: 10 },
  { name: 'ጥምቀት', month: 5, day: 11 },
  { name: 'ቅዱስ ሚካኤል', month: 5, day: 12 },

  // ── የካቲት (Month 6) ──
  { name: 'የአድዋ ድል በዓል', month: 6, day: 23 },

  // ── መጋቢት (Month 7) ──
  { name: 'ቅዱስ ገብርኤል', month: 7, day: 19 },

  // ── ሚያዝያ (Month 8) ──
  { name: 'ቅዱስ ጊዮርጊስ', month: 8, day: 23 },
  { name: 'የአርበኞች ቀን', month: 8, day: 27 },

  // ── ግንቦት (Month 9) ──
  { name: 'የደርግ ውድቀት', month: 9, day: 20 },

  // ── ሰኔ (Month 10) ──
  { name: 'ቅዱስ ጴጥሮስ ወጳውሎስ', month: 10, day: 29 },

  // ── ሐምሌ (Month 11) ──
  { name: 'የፍልሰታ ጾም መግቢያ', month: 11, day: 1 },

  // ── ነሐሴ (Month 12) ──
  { name: 'ኪዳነ ምሕረት', month: 12, day: 1 },
  { name: 'ቡሄ', month: 12, day: 13 },
  { name: 'ፍልሰታ', month: 12, day: 16 },

  // ── ጳጉሜ (Month 13) ──
  { name: 'የቅዱስ ዮሐንስ ዋዜማ', month: 13, day: 5 },
];

// ─────────────────────────────────────────────────────────────────
// ETHIOPIAN HOLIDAYS OBSERVED BY GREGORIAN DATE
// Some Ethiopian public holidays are defined by their Gregorian date
// (international observances recognized in Ethiopia).
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_GC_HOLIDAYS: FixedHoliday[] = [
  { name: 'የዓለም የሠራተኞች ቀን', month: 5, day: 1 },
  { name: 'የአርበኞች የድል ቀን', month: 5, day: 5 },
];

// ─────────────────────────────────────────────────────────────────
// MOVEABLE ETHIOPIAN HOLIDAYS (relative to Ethiopian Easter)
//
// Ethiopian Easter (Fasika/Tensae) follows the Julian/Alexandrian
// Computus. These holidays are computed as offsets from Easter Sunday.
// ─────────────────────────────────────────────────────────────────

export const ETHIOPIAN_MOVEABLE_HOLIDAYS: MoveableHoliday[] = [
  { name: 'ዐቢይ ጾም', offsetFromEaster: -55 },
  { name: 'ደብረ ዘይት', offsetFromEaster: -41 },
  { name: 'ሆሣዕና', offsetFromEaster: -7 },
  { name: 'ጸሎተ ሐሙስ', offsetFromEaster: -3 },
  { name: 'ስቅለት', offsetFromEaster: -2 },
  { name: 'ቅዱስ ቅዳሜ', offsetFromEaster: -1 },
  { name: 'ፋሲካ / ትንሣኤ', offsetFromEaster: 0 },
  { name: 'ዳግማይ ትንሣኤ', offsetFromEaster: 1 },
  { name: 'ዕርገት', offsetFromEaster: 39 },
  { name: 'ጰራቅሊጦስ', offsetFromEaster: 49 },
  { name: 'የሐዋርያት ጾም መግቢያ', offsetFromEaster: 50 },
];
