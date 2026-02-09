import jsPDF from 'jspdf';
import type { CalendarEvent, ViewMode, GridDay } from '../types/calendar';
import {
  getGregorianMonthGrid,
  getEthiopianMonthGrid,
  GREGORIAN_MONTH_NAMES,
  WEEKDAY_NAMES,
  getGregorianYearMonths,
  getEthiopianYearMonths,
  formatGregorianDateString,
} from './gregorianDate';
import {
  getEthiopianMonthName,
  getEthiopianMonthDays,
  convertGregorianToEthiopian,
  convertEthiopianToGregorian,
} from './ethiopianDate';
import { getHolidaysForDate } from './holidayUtils';

// ─── Constants ─────────────────────────────────────────────────
const PAGE_W = 210; // A4 width mm
const MARGIN = 12;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const CELL_W = CONTENT_W / 7;
const CELL_H = 22;
const HEADER_Y = 18;
const GRID_START_Y = 40;

// ─── Colors ────────────────────────────────────────────────────
const COLOR_INDIGO = [79, 70, 229] as const;
const COLOR_GREEN = [22, 163, 74] as const;
const COLOR_GRAY = [107, 114, 128] as const;
const COLOR_LIGHT_GRAY = [229, 231, 235] as const;
const COLOR_AMBER = [217, 119, 6] as const;

// ─── Helpers ───────────────────────────────────────────────────
function setColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function getEventsForGridDay(
  day: GridDay,
  events: CalendarEvent[]
): CalendarEvent[] {
  const key = formatGregorianDateString(day.gregorianDate);
  return events.filter((e) => e.gregorianDate === key);
}

// ─── Render One Month Page ─────────────────────────────────────
function renderMonthPage(
  doc: jsPDF,
  title: string,
  subtitle: string,
  gridDays: GridDay[],
  viewMode: ViewMode,
  events: CalendarEvent[]
) {
  // ── Title ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(doc, [17, 24, 39]);
  doc.text(title, PAGE_W / 2, HEADER_Y, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLOR_GRAY);
  doc.text(subtitle, PAGE_W / 2, HEADER_Y + 7, { align: 'center' });

  // ── Weekday Headers ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLOR_GRAY);
  for (let i = 0; i < 7; i++) {
    const x = MARGIN + i * CELL_W + CELL_W / 2;
    doc.text(WEEKDAY_NAMES[i], x, GRID_START_Y - 2, { align: 'center' });
  }

  // ── Grid ──
  const monthEvents: Array<{ day: number; title: string }> = [];

  for (let idx = 0; idx < gridDays.length; idx++) {
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const x = MARGIN + col * CELL_W;
    const y = GRID_START_Y + row * CELL_H;

    const day = gridDays[idx];
    const holidays = getHolidaysForDate(day.gregorianDate);
    const dayEvts = getEventsForGridDay(day, events);

    // Cell background
    if (day.isToday) {
      setFillColor(doc, [238, 242, 255]);
      doc.rect(x, y, CELL_W, CELL_H, 'F');
    } else if (!day.isCurrentMonth) {
      setFillColor(doc, [249, 250, 251]);
      doc.rect(x, y, CELL_W, CELL_H, 'F');
    }

    // Cell border
    setDrawColor(doc, COLOR_LIGHT_GRAY);
    doc.rect(x, y, CELL_W, CELL_H);

    // Primary date
    const primaryDate =
      viewMode === 'gregorian'
        ? day.gregorianDate.getDate()
        : day.ethiopianDate.day;
    const secondaryDate =
      viewMode === 'gregorian'
        ? day.ethiopianDate.day
        : day.gregorianDate.getDate();

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, day.isCurrentMonth ? [17, 24, 39] : [156, 163, 175]);
    doc.text(String(primaryDate), x + 2, y + 6);

    // Secondary date
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    setColor(doc, viewMode === 'gregorian' ? COLOR_GREEN : COLOR_GRAY);
    doc.text(String(secondaryDate), x + 2, y + 11);

    // Holiday indicator
    if (holidays.length > 0) {
      const hasEth = holidays.some((h) => h.type === 'ethiopian');
      const dotColor = hasEth ? COLOR_GREEN : COLOR_AMBER;
      setFillColor(doc, dotColor);
      doc.circle(x + CELL_W - 4, y + 4, 1.2, 'F');

      // Truncated holiday name
      doc.setFontSize(4.5);
      setColor(doc, hasEth ? COLOR_GREEN : COLOR_AMBER);
      const hName = holidays[0].name.substring(0, 18);
      doc.text(hName, x + 2, y + CELL_H - 2);
    }

    // Event dots
    if (dayEvts.length > 0) {
      for (let d = 0; d < Math.min(dayEvts.length, 3); d++) {
        setFillColor(doc, COLOR_INDIGO);
        doc.circle(x + CELL_W - 4 - d * 3, y + CELL_H - 4, 1, 'F');
      }
      // Collect for event list
      if (day.isCurrentMonth) {
        for (const evt of dayEvts) {
          monthEvents.push({
            day: primaryDate,
            title: evt.title,
          });
        }
      }
    }
  }

  // ── Events List Below Grid ──
  const eventsStartY = GRID_START_Y + 6 * CELL_H + 8;
  if (monthEvents.length > 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(doc, [17, 24, 39]);
    doc.text('Events:', MARGIN, eventsStartY);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLOR_GRAY);

    let ey = eventsStartY + 5;
    const maxEvents = Math.min(monthEvents.length, 15);
    for (let i = 0; i < maxEvents; i++) {
      const evt = monthEvents[i];
      doc.text(`  Day ${evt.day}: ${evt.title}`, MARGIN, ey);
      ey += 4;
    }
    if (monthEvents.length > 15) {
      doc.text(`  ... and ${monthEvents.length - 15} more`, MARGIN, ey);
    }
  }
}

// ─── Public Export API ─────────────────────────────────────────
/**
 * Exports a full year calendar to PDF.
 *
 * @param viewMode - 'gregorian' or 'ethiopian'
 * @param year - The year number to export (Gregorian year or Ethiopian year)
 * @param events - All stored calendar events
 */
export function exportYearToPdf(
  viewMode: ViewMode,
  year: number,
  events: CalendarEvent[]
): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');

  // Cover page
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, [17, 24, 39]);
  const yearLabel =
    viewMode === 'gregorian' ? `${year}` : `${year} EC`;
  doc.text(`Calendar ${yearLabel}`, PAGE_W / 2, 80, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLOR_GRAY);
  doc.text(
    viewMode === 'gregorian'
      ? 'Gregorian Calendar with Ethiopian Dates'
      : 'Ethiopian Calendar with Gregorian Dates',
    PAGE_W / 2,
    95,
    { align: 'center' }
  );

  doc.setFontSize(9);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, PAGE_W / 2, 110, {
    align: 'center',
  });

  // Legend
  const legendY = 130;
  doc.setFontSize(8);
  setFillColor(doc, COLOR_GREEN);
  doc.circle(MARGIN + 50, legendY - 1, 2, 'F');
  setColor(doc, COLOR_GRAY);
  doc.text('Ethiopian Holiday', MARGIN + 54, legendY);

  setFillColor(doc, COLOR_AMBER);
  doc.circle(MARGIN + 100, legendY - 1, 2, 'F');
  doc.text('Gregorian Holiday', MARGIN + 104, legendY);

  setFillColor(doc, COLOR_INDIGO);
  doc.circle(MARGIN + 155, legendY - 1, 2, 'F');
  doc.text('Event', MARGIN + 159, legendY);

  // Month pages
  if (viewMode === 'gregorian') {
    const months = getGregorianYearMonths(year);
    for (const month of months) {
      doc.addPage();
      const grid = getGregorianMonthGrid(year, month);
      const monthName = GREGORIAN_MONTH_NAMES[month];

      // Get Ethiopian equivalent for subtitle
      const midDate = new Date(year, month, 15);
      const eth = convertGregorianToEthiopian(midDate);

      renderMonthPage(
        doc,
        `${monthName} ${year}`,
        `≈ ${getEthiopianMonthName(eth.month)} ${eth.year} EC`,
        grid,
        viewMode,
        events
      );
    }
  } else {
    const months = getEthiopianYearMonths();
    for (const month of months) {
      doc.addPage();
      const grid = getEthiopianMonthGrid(year, month);
      const monthName = getEthiopianMonthName(month);

      // Get Gregorian equivalent for subtitle
      const midGreg = convertEthiopianToGregorian({
        year,
        month,
        day: Math.min(15, getEthiopianMonthDays(year, month)),
      });

      renderMonthPage(
        doc,
        `${monthName} ${year} EC`,
        `≈ ${GREGORIAN_MONTH_NAMES[midGreg.getMonth()]} ${midGreg.getFullYear()} GC`,
        grid,
        viewMode,
        events
      );
    }
  }

  doc.save(`calendar-${yearLabel.replace(' ', '-')}.pdf`);
}
