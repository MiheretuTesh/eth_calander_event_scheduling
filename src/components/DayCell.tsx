import { useMemo } from 'react';
import type { GridDay, ViewMode } from '../types/calendar';
import { getHolidaysForDate } from '../utils/holidayUtils';
import { useCalendarStore } from '../store/useCalendarStore';
import { eventsForDate } from '../utils/recurrence';
import { toGeez } from '../utils/geez';
import { isSameDay } from 'date-fns';

interface DayCellProps {
  day: GridDay;
  viewMode: ViewMode;
}

export function DayCell({ day, viewMode }: DayCellProps) {
  const { selectedDate, selectDate, events, holidays } = useCalendarStore();

  const isSelected = selectedDate ? isSameDay(day.gregorianDate, selectedDate) : false;

  const dayHolidays = useMemo(
    () => getHolidaysForDate(day.gregorianDate, viewMode, holidays),
    [day.gregorianDate, viewMode, holidays]
  );

  const dayEvents = useMemo(
    () => eventsForDate(events, day.gregorianDate),
    [events, day.gregorianDate]
  );

  const hasHoliday = dayHolidays.length > 0;

  // Holiday color: green for Ethiopian mode, amber for Gregorian mode
  const holidayBg = viewMode === 'ethiopian' ? 'bg-green-50/60' : 'bg-amber-50/60';
  const holidayText = viewMode === 'ethiopian' ? 'text-green-700' : 'text-amber-700';
  const holidayChipBg = viewMode === 'ethiopian' ? 'bg-green-100' : 'bg-amber-100';

  const primaryDate =
    viewMode === 'gregorian'
      ? String(day.gregorianDate.getDate())
      : toGeez(day.ethiopianDate.day);

  const secondaryDate =
    viewMode === 'gregorian'
      ? toGeez(day.ethiopianDate.day)
      : String(day.gregorianDate.getDate());

  return (
    <button
      type="button"
      onClick={() => selectDate(day.gregorianDate)}
      className={`
        relative flex flex-col items-stretch text-left
        min-h-[96px] sm:min-h-[120px] p-1 sm:p-1.5
        rounded-lg transition-all duration-150 cursor-pointer
        border border-transparent overflow-hidden
        ${!day.isCurrentMonth ? 'opacity-40' : ''}
        ${day.isToday ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''}
        ${isSelected && !day.isToday ? 'bg-blue-50 border-blue-300' : ''}
        ${!day.isToday && !isSelected && day.isCurrentMonth ? 'hover:bg-gray-50 hover:border-gray-200' : ''}
        ${hasHoliday && !day.isToday && !isSelected ? holidayBg : ''}
      `}
      title={[...dayHolidays.map((h) => h.name), ...dayEvents.map((e) => e.title)].join(', ') || undefined}
    >
      {/* Date row */}
      <div className="flex items-baseline justify-between gap-1 flex-shrink-0">
        <span
          className={`
            text-sm sm:text-base font-semibold leading-tight
            ${day.isToday ? 'text-indigo-700' : ''}
            ${isSelected && !day.isToday ? 'text-blue-700' : ''}
            ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
          `}
        >
          {primaryDate}
        </span>
        <span
          className={`
            text-[10px] sm:text-xs leading-tight
            ${viewMode === 'gregorian' ? 'text-green-600' : 'text-gray-500'}
            ${!day.isCurrentMonth ? 'opacity-50' : ''}
          `}
        >
          {secondaryDate}
        </span>
      </div>

      {/* Holiday + event names */}
      <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
        {dayHolidays.map((h, i) => (
          <span
            key={`h-${i}`}
            className={`block truncate rounded px-1 py-px text-[9px] sm:text-[10px] font-medium leading-tight ${holidayChipBg} ${holidayText}`}
          >
            {h.name}
          </span>
        ))}
        {dayEvents.map((e) => (
          <span
            key={e.id}
            className="block truncate rounded px-1 py-px text-[9px] sm:text-[10px] font-medium leading-tight bg-indigo-100 text-indigo-700"
          >
            {e.title}
          </span>
        ))}
      </div>
    </button>
  );
}
