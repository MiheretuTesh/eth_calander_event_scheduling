import { useMemo } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { formatGregorianDateLabel } from '../utils/gregorianDate';
import {
  convertGregorianToEthiopian,
  formatEthiopianDateLabel,
} from '../utils/ethiopianDate';
import { getHolidaysForDate } from '../utils/holidayUtils';

export function DayEventsPanel() {
  const {
    selectedDate,
    selectDate,
    events,
    openEventModal,
    deleteEvent,
  } = useCalendarStore();

  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return events.filter((e) => e.gregorianDate === key);
  }, [selectedDate, events]);

  const holidays = useMemo(
    () => (selectedDate ? getHolidaysForDate(selectedDate) : []),
    [selectedDate]
  );

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-400">
        <svg
          className="w-10 h-10 mx-auto mb-2 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <p className="text-sm">Select a day to view events</p>
      </div>
    );
  }

  const ethDate = convertGregorianToEthiopian(selectedDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {formatGregorianDateLabel(selectedDate)}
            </h3>
            <p className="text-xs text-green-600 mt-0.5">
              {formatEthiopianDateLabel(ethDate)}
            </p>
          </div>
          <button
            onClick={() => selectDate(null)}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors text-gray-400"
            aria-label="Close panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Holidays */}
      {holidays.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          {holidays.map((h, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  h.type === 'ethiopian' ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-medium text-gray-700">
                {h.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-600">
            Events ({dayEvents.length})
          </h4>
          <button
            onClick={() => openEventModal()}
            className="px-2.5 py-1 text-xs font-medium text-indigo-600
                       bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            + Add
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No events for this day
          </p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="group relative p-3 rounded-lg border border-gray-100
                           hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <h5 className="text-sm font-medium text-gray-900">
                  {event.title}
                </h5>
                {event.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEventModal(event)}
                    className="px-2 py-0.5 text-xs text-indigo-600 bg-indigo-50
                               rounded hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="px-2 py-0.5 text-xs text-red-600 bg-red-50
                               rounded hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
