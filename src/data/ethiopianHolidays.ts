import type { Holiday } from '../types/calendar';

/**
 * Ethiopian public holidays.
 * Dates are in Ethiopian calendar (month/day).
 * Note: Some holidays like Fasika (Easter), Arefa, and Eid al-Fitr
 * are moveable and not included here.
 */
export const ETHIOPIAN_HOLIDAYS: Holiday[] = [
  // Meskerem (Month 1)
  { name: 'Enkutatash (Ethiopian New Year)', month: 1, day: 1, type: 'ethiopian' },
  { name: 'Meskel (Finding of the True Cross)', month: 1, day: 17, type: 'ethiopian' },

  // Tahsas (Month 4)
  { name: 'Genna (Ethiopian Christmas)', month: 4, day: 29, type: 'ethiopian' },

  // Tir (Month 5)
  { name: 'Timkat (Epiphany)', month: 5, day: 11, type: 'ethiopian' },

  // Yekatit (Month 6)
  { name: 'Adwa Victory Day', month: 6, day: 23, type: 'ethiopian' },

  // Megabit (Month 7)
  { name: 'Tsome Nebiyat Begins', month: 7, day: 1, type: 'ethiopian' },

  // Miyazia (Month 8)
  { name: 'Ethiopian Patriots Day', month: 8, day: 23, type: 'ethiopian' },

  // Ginbot (Month 9)
  { name: 'Patriots Victory Day', month: 9, day: 5, type: 'ethiopian' },
  { name: 'Downfall of the Derg', month: 9, day: 20, type: 'ethiopian' },

  // Nehase (Month 12)
  { name: 'Buhe (Transfiguration)', month: 12, day: 13, type: 'ethiopian' },

  // Pagume (Month 13)
  { name: 'Pagume - End of Year', month: 13, day: 5, type: 'ethiopian' },
];
