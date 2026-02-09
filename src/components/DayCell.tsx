import { useMemo } from 'react';
import type { GridDay, ViewMode } from '../types/calendar';
import { getHolidaysForDate } from '../utils/holidayUtils';
import { useCalendarStore } from '../store/useCalendarStore';
import { isSameDay } from 'date-fns';

interface DayCellProps {
  day: GridDay;
  viewMode: ViewMode;
}

export function DayCell({ day, viewMode }: DayCellProps) {
  const { selectedDate, selectDate, events } = useCalendarStore();

  const isSelected = selectedDate ? isSameDay(day.gregorianDate, selectedDate) : false;

  const holidays = useMemo(
    () => getHolidaysForDate(day.gregorianDate),
    [day.gregorianDate]
  );

  const dayEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.gregorianDate ===
          `${day.gregorianDate.getFullYear()}-${String(
            day.gregorianDate.getMonth() + 1
          ).padStart(2, '0')}-${String(day.gregorianDate.getDate()).padStart(2, '0')}`
      ),
    [events, day.gregorianDate]
  );

  const hasEthHoliday = holidays.some((h) => h.type === 'ethiopian');
  const hasGregHoliday = holidays.some((h) => h.type === 'gregorian');

  const primaryDate =
    viewMode === 'gregorian'
      ? day.gregorianDate.getDate()
      : day.ethiopianDate.day;

  const secondaryDate =
    viewMode === 'gregorian'
      ? day.ethiopianDate.day
      : day.gregorianDate.getDate();

  return (
    <button
      type="button"
      onClick={() => selectDate(day.gregorianDate)}
      className={`
        relative flex flex-col items-center justify-start
        min-h-[60px] sm:min-h-[72px] p-1 sm:p-1.5
        rounded-lg transition-all duration-150 cursor-pointer
        border border-transparent
        ${!day.isCurrentMonth ? 'opacity-30' : ''}
        ${day.isToday ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''}
        ${isSelected && !day.isToday ? 'bg-blue-50 border-blue-300' : ''}
        ${!day.isToday && !isSelected && day.isCurrentMonth ? 'hover:bg-gray-50 hover:border-gray-200' : ''}
        ${hasEthHoliday ? 'bg-green-50/60' : ''}
        ${hasGregHoliday && !hasEthHoliday ? 'bg-amber-50/60' : ''}
      `}
      title={holidays.map((h) => h.name).join(', ') || undefined}
    >
      {/* Primary date */}
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

      {/* Secondary date */}
      <span
        className={`
          text-[10px] sm:text-xs leading-tight mt-0.5
          ${viewMode === 'gregorian' ? 'text-green-600' : 'text-gray-500'}
          ${!day.isCurrentMonth ? 'opacity-50' : ''}
        `}
      >
        {secondaryDate}
      </span>

      {/* Indicators row */}
      <div className="flex items-center gap-0.5 mt-auto pt-0.5">
        {/* Holiday indicators */}
        {hasEthHoliday && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        )}
        {hasGregHoliday && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
        )}

        {/* Event dots */}
        {dayEvents.slice(0, 3).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"
          />
        ))}
        {dayEvents.length > 3 && (
          <span className="text-[8px] text-indigo-500 font-medium">
            +{dayEvents.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
