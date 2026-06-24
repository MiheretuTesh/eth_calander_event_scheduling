import jsPDF from 'jspdf';
import type {
  CalendarEvent,
  ManagedHoliday,
  ViewMode,
  GridDay,
} from '../types/calendar';
import {
  getGregorianMonthGrid,
  getEthiopianMonthGrid,
  GREGORIAN_MONTH_NAMES,
  WEEKDAY_NAMES,
  getGregorianYearMonths,
  getEthiopianYearMonths,
  getGregorianSpanForEthiopianMonth,
  AMHARIC_WEEKDAY_NAMES,
} from './gregorianDate';
import {
  getEthiopianMonthName,
  getEthiopianMonthDays,
  convertGregorianToEthiopian,
} from './ethiopianDate';
import { getHolidaysForDate } from './holidayUtils';
import { eventsForDate } from './recurrence';
import { toGeez } from './geez';
import { NOTO_SANS_ETHIOPIC_BASE64 } from '../assets/notoSansEthiopic';

// jsPDF's built-in Helvetica only covers Latin-1, so Amharic/Ge'ez text
// renders as garbage. We embed a subset of Noto Sans Ethiopic and switch to
// it for Ethiopic character runs, falling back to Helvetica for Latin.
const ETHIOPIC_FONT = 'NotoSansEthiopic';

function registerEthiopicFont(doc: jsPDF) {
  doc.addFileToVFS('NotoSansEthiopic.ttf', NOTO_SANS_ETHIOPIC_BASE64);
  doc.addFont('NotoSansEthiopic.ttf', ETHIOPIC_FONT, 'normal');
}

function isEthiopic(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x1200 && c <= 0x137f;
}

/** Splits text into consecutive runs of Ethiopic vs. Latin characters. */
function splitRuns(text: string): { text: string; eth: boolean }[] {
  const runs: { text: string; eth: boolean }[] = [];
  for (const ch of text) {
    const eth = isEthiopic(ch);
    const last = runs[runs.length - 1];
    if (last && last.eth === eth) last.text += ch;
    else runs.push({ text: ch, eth });
  }
  return runs;
}

/** Measures a string at a font size, using the correct font per run. */
function measureMixed(
  doc: jsPDF,
  text: string,
  fontSize: number,
  latinStyle: 'normal' | 'bold' = 'normal'
): number {
  doc.setFontSize(fontSize);
  let w = 0;
  for (const r of splitRuns(text)) {
    // The embedded Ethiopic font has no bold variant, so Ethiopic is always normal.
    doc.setFont(r.eth ? ETHIOPIC_FONT : 'helvetica', r.eth ? 'normal' : latinStyle);
    w += doc.getTextWidth(r.text);
  }
  return w;
}

/**
 * Word-wraps text to fit maxW, breaking over-long words mid-character.
 * Returns the wrapped lines (mixed Amharic/Latin aware).
 */
function wrapMixed(
  doc: jsPDF,
  text: string,
  fontSize: number,
  maxW: number
): string[] {
  const lines: string[] = [];
  let cur = '';

  const pushLongWord = (word: string) => {
    let chunk = '';
    for (const ch of word) {
      if (measureMixed(doc, chunk + ch, fontSize) <= maxW) {
        chunk += ch;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    cur = chunk;
  };

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const trial = cur ? `${cur} ${word}` : word;
    if (measureMixed(doc, trial, fontSize) <= maxW) {
      cur = trial;
    } else {
      if (cur) lines.push(cur);
      if (measureMixed(doc, word, fontSize) > maxW) pushLongWord(word);
      else cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Draws mixed-font text centered horizontally on centerX at baseline y. */
function drawMixedCentered(
  doc: jsPDF,
  text: string,
  centerX: number,
  y: number,
  fontSize: number,
  latinStyle: 'normal' | 'bold' = 'normal'
) {
  const w = measureMixed(doc, text, fontSize, latinStyle);
  drawMixed(doc, text, centerX - w / 2, y, fontSize, latinStyle);
}

/**
 * Draws left-aligned text starting at (x, y), switching fonts per run so
 * Amharic/Ge'ez renders with the embedded font and Latin with Helvetica.
 * The text color must be set by the caller.
 */
function drawMixed(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  latinStyle: 'normal' | 'bold' = 'normal'
) {
  doc.setFontSize(fontSize);
  let cx = x;
  for (const r of splitRuns(text)) {
    doc.setFont(r.eth ? ETHIOPIC_FONT : 'helvetica', r.eth ? 'normal' : latinStyle);
    doc.text(r.text, cx, y);
    cx += doc.getTextWidth(r.text);
  }
}

// ─── Page geometry (A6 landscape: 148 × 105 mm) ────────────────
const PAGE_W = 148;
const PAGE_H = 105;
const MARGIN = 6;

// Left half: month calendar. Right half: notes.
const CAL_X = MARGIN;
const CAL_W = 86;
const NOTES_X = CAL_X + CAL_W + 6;
const NOTES_W = PAGE_W - NOTES_X - MARGIN;

const GRID_TOP = 24; // y where the day grid begins
const GRID_BOTTOM = PAGE_H - MARGIN;
const CELL_W = CAL_W / 7;
const ROWS = 6;
const CELL_H = (GRID_BOTTOM - GRID_TOP) / ROWS;

// ─── Colors ────────────────────────────────────────────────────
const COLOR_INK = [17, 24, 39] as const;
const COLOR_INDIGO = [79, 70, 229] as const;
const COLOR_GREEN = [22, 163, 74] as const;
const COLOR_GRAY = [107, 114, 128] as const;
const COLOR_LIGHT_GRAY = [229, 231, 235] as const;
const COLOR_AMBER = [217, 119, 6] as const;

// ─── Helpers ───────────────────────────────────────────────────
function setColor(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function setFill(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

// ─── Notes Panel (right half of the A6 page) ───────────────────
function renderNotes(doc: jsPDF) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLOR_INK);
  doc.text('Notes', NOTES_X, GRID_TOP - 4);

  setDraw(doc, COLOR_LIGHT_GRAY);
  doc.setLineWidth(0.2);
  const lineGap = 7;
  for (let y = GRID_TOP + 2; y <= GRID_BOTTOM; y += lineGap) {
    doc.line(NOTES_X, y, NOTES_X + NOTES_W, y);
  }
}

// ─── Month Calendar (left half of the A6 page) ─────────────────
function renderMonthCalendar(
  doc: jsPDF,
  title: string,
  subtitle: string,
  gridDays: GridDay[],
  viewMode: ViewMode,
  events: CalendarEvent[],
  holidays: ManagedHoliday[]
) {
  // ── Title + subtitle (may contain Ge'ez year) ──
  setColor(doc, COLOR_INK);
  drawMixed(doc, title, CAL_X, 10, 12, 'bold');

  setColor(doc, COLOR_GRAY);
  drawMixed(doc, subtitle, CAL_X, 15, 7, 'normal');

  // ── Weekday headers (Monday-first; Amharic in Ethiopian view) ──
  const weekdayNames = viewMode === 'ethiopian' ? AMHARIC_WEEKDAY_NAMES : WEEKDAY_NAMES;
  setColor(doc, COLOR_GRAY);
  for (let i = 0; i < 7; i++) {
    const x = CAL_X + i * CELL_W + CELL_W / 2;
    drawMixedCentered(doc, weekdayNames[i], x, GRID_TOP - 2, 6, 'bold');
  }

  // ── Day cells ──
  const lineH = 2.6;
  const nameSize = 3.6;
  const maxTextW = CELL_W - 1.5;

  for (let idx = 0; idx < gridDays.length; idx++) {
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const x = CAL_X + col * CELL_W;
    const y = GRID_TOP + row * CELL_H;

    const day = gridDays[idx];

    // Cell border (always drawn so the grid stays intact)
    setDraw(doc, COLOR_LIGHT_GRAY);
    doc.setLineWidth(0.1);
    doc.rect(x, y, CELL_W, CELL_H);

    // Days outside the current month are left blank.
    if (!day.isCurrentMonth) continue;

    const dayHolidays = getHolidaysForDate(day.gregorianDate, viewMode, holidays);
    const dayEvts = eventsForDate(events, day.gregorianDate);

    // Cell background
    if (day.isToday) {
      setFill(doc, [238, 242, 255]);
      doc.rect(x, y, CELL_W, CELL_H, 'F');
    } else if (dayHolidays.length > 0) {
      setFill(doc, viewMode === 'ethiopian' ? [240, 253, 244] : [255, 251, 235]);
      doc.rect(x, y, CELL_W, CELL_H, 'F');
    }
    // Re-stroke the border in case a fill painted over it.
    setDraw(doc, COLOR_LIGHT_GRAY);
    doc.rect(x, y, CELL_W, CELL_H);

    // Date numbers — Ethiopian dates render in Ge'ez via the embedded font.
    const ethDay = day.ethiopianDate.day;
    const gregDay = day.gregorianDate.getDate();
    const primaryIsEth = viewMode === 'ethiopian';

    setColor(doc, COLOR_INK);
    doc.setFontSize(7);
    if (primaryIsEth) {
      doc.setFont(ETHIOPIC_FONT, 'normal');
      doc.text(toGeez(ethDay), x + 1, y + 4);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text(String(gregDay), x + 1, y + 4);
    }

    setColor(doc, viewMode === 'gregorian' ? COLOR_GREEN : COLOR_GRAY);
    doc.setFontSize(4.5);
    if (primaryIsEth) {
      doc.setFont('helvetica', 'normal');
      doc.text(String(gregDay), x + CELL_W - 1, y + 3.5, { align: 'right' });
    } else {
      doc.setFont(ETHIOPIC_FONT, 'normal');
      doc.text(toGeez(ethDay), x + CELL_W - 1, y + 3.5, { align: 'right' });
    }

    // Holiday + event names beneath the date, word-wrapped (mixed Amharic/Latin)
    let textY = y + 7.5;
    const entries = [
      ...dayHolidays.map((h) => ({
        text: h.name,
        color: viewMode === 'ethiopian' ? COLOR_GREEN : COLOR_AMBER,
      })),
      ...dayEvts.map((e) => ({ text: e.title, color: COLOR_INDIGO })),
    ];

    for (const entry of entries) {
      setColor(doc, entry.color);
      for (const line of wrapMixed(doc, entry.text, nameSize, maxTextW)) {
        if (textY > y + CELL_H - 0.8) break;
        drawMixed(doc, line, x + 1, textY, nameSize);
        textY += lineH;
      }
      if (textY > y + CELL_H - 0.8) break;
    }
  }
}

// ─── Title / subtitle builders ─────────────────────────────────
/** Title + Ethiopian-span subtitle for a Gregorian month (month is 0-indexed). */
function gregorianMonthHeading(year: number, month: number) {
  const startEth = convertGregorianToEthiopian(new Date(year, month, 1));
  const endEth = convertGregorianToEthiopian(new Date(year, month + 1, 0));
  const ethYearLabel = `${toGeez(endEth.year)} (${endEth.year})`;
  const ethSpan =
    startEth.month === endEth.month
      ? `${getEthiopianMonthName(startEth.month)} ${ethYearLabel} EC`
      : `${getEthiopianMonthName(startEth.month)} – ${getEthiopianMonthName(
          endEth.month
        )} ${ethYearLabel} EC`;
  return { title: `${GREGORIAN_MONTH_NAMES[month]} ${year}`, subtitle: ethSpan };
}

/** Title + Gregorian-span subtitle for an Ethiopian month (month is 1-13). */
function ethiopianMonthHeading(year: number, month: number) {
  return {
    title: `${getEthiopianMonthName(month)} ${toGeez(year)} (${year}) EC`,
    subtitle: `${getGregorianSpanForEthiopianMonth(year, month)} GC`,
  };
}

// ─── Public Export API ─────────────────────────────────────────
/**
 * Exports a full year calendar to PDF — one A6 (landscape) page per month,
 * with the month calendar on the left half and a lined notes area on the right.
 */
export function exportYearToPdf(
  viewMode: ViewMode,
  year: number,
  events: CalendarEvent[],
  holidays: ManagedHoliday[]
): void {
  const doc = new jsPDF('landscape', 'mm', 'a6');
  registerEthiopicFont(doc);
  let first = true;

  const addMonthPage = (
    title: string,
    subtitle: string,
    grid: GridDay[]
  ) => {
    if (!first) doc.addPage('a6', 'landscape');
    first = false;
    renderMonthCalendar(doc, title, subtitle, grid, viewMode, events, holidays);
    renderNotes(doc);
  };

  if (viewMode === 'gregorian') {
    for (const month of getGregorianYearMonths(year)) {
      const { title, subtitle } = gregorianMonthHeading(year, month);
      addMonthPage(title, subtitle, getGregorianMonthGrid(year, month));
    }
  } else {
    for (const month of getEthiopianYearMonths()) {
      // Skip Pagume if it somehow has no days (defensive).
      if (getEthiopianMonthDays(year, month) <= 0) continue;
      const { title, subtitle } = ethiopianMonthHeading(year, month);
      addMonthPage(title, subtitle, getEthiopianMonthGrid(year, month));
    }
  }

  const yearLabel = viewMode === 'gregorian' ? `${year}` : `${year}-EC`;
  doc.save(`calendar-${yearLabel}.pdf`);
}

/**
 * Exports a single month to a one-page A6 PDF.
 *
 * @param month - Gregorian month (0-11) or Ethiopian month (1-13) per viewMode.
 */
export function exportMonthToPdf(
  viewMode: ViewMode,
  year: number,
  month: number,
  events: CalendarEvent[],
  holidays: ManagedHoliday[]
): void {
  const doc = new jsPDF('landscape', 'mm', 'a6');
  registerEthiopicFont(doc);

  let title: string;
  let subtitle: string;
  let grid: GridDay[];
  let fileTag: string;

  if (viewMode === 'gregorian') {
    ({ title, subtitle } = gregorianMonthHeading(year, month));
    grid = getGregorianMonthGrid(year, month);
    fileTag = `${year}-${String(month + 1).padStart(2, '0')}`;
  } else {
    ({ title, subtitle } = ethiopianMonthHeading(year, month));
    grid = getEthiopianMonthGrid(year, month);
    fileTag = `${year}EC-${String(month).padStart(2, '0')}`;
  }

  renderMonthCalendar(doc, title, subtitle, grid, viewMode, events, holidays);
  renderNotes(doc);
  doc.save(`calendar-${fileTag}.pdf`);
}
