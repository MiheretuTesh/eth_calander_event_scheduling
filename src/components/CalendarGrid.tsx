import { useMemo } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { DayCell } from './DayCell';
import {
  getGregorianMonthGrid,
  getEthiopianMonthGrid,
  WEEKDAY_NAMES,
  AMHARIC_WEEKDAY_NAMES,
} from '../utils/gregorianDate';
import { convertGregorianToEthiopian } from '../utils/ethiopianDate';

export function CalendarGrid() {
  const { viewMode, currentDate } = useCalendarStore();

  const weekdayNames =
    viewMode === 'ethiopian' ? AMHARIC_WEEKDAY_NAMES : WEEKDAY_NAMES;

  const gridDays = useMemo(() => {
    if (viewMode === 'gregorian') {
      return getGregorianMonthGrid(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
    }
    const eth = convertGregorianToEthiopian(currentDate);
    return getEthiopianMonthGrid(eth.year, eth.month);
  }, [viewMode, currentDate]);

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {gridDays.map((day, idx) => (
          <div key={idx} className="bg-white">
            <DayCell day={day} viewMode={viewMode} />
          </div>
        ))}
      </div>

      {/* Legend — adapts to current view mode */}
      <div className="flex flex-wrap items-center gap-4 mt-3 px-1 text-xs text-gray-500">
        {viewMode === 'ethiopian' ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Ethiopian Holiday
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Holiday
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Event
        </span>
      </div>
    </div>
  );
}
