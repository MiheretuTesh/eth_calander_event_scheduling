import { useMemo, useState } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import type { HolidayKind, ManagedHoliday } from '../types/calendar';
import { GREGORIAN_MONTH_NAMES } from '../utils/gregorianDate';
import { ETHIOPIAN_MONTH_NAMES } from '../utils/ethiopianDate';

const KIND_LABELS: Record<HolidayKind, string> = {
  'gregorian-fixed': 'Gregorian holidays',
  'ethiopian-fixed': 'Ethiopian holidays (by Ethiopian date)',
  'ethiopian-gc': 'Ethiopian holidays (by Gregorian date)',
  'ethiopian-moveable': 'Ethiopian moveable holidays (Easter-based)',
};

const KIND_ORDER: HolidayKind[] = [
  'ethiopian-fixed',
  'ethiopian-gc',
  'ethiopian-moveable',
  'gregorian-fixed',
];

function describeHoliday(h: ManagedHoliday): string {
  switch (h.kind) {
    case 'gregorian-fixed':
    case 'ethiopian-gc':
      return `${GREGORIAN_MONTH_NAMES[(h.month ?? 1) - 1]} ${h.day}`;
    case 'ethiopian-fixed':
      return `${ETHIOPIAN_MONTH_NAMES[h.month ?? 1]} ${h.day}`;
    case 'ethiopian-moveable': {
      const o = h.offsetFromEaster ?? 0;
      if (o === 0) return 'Easter Sunday';
      return `Easter ${o > 0 ? '+' : '−'}${Math.abs(o)} days`;
    }
  }
}

export function HolidayManagerDialog() {
  const {
    isHolidayDialogOpen,
    closeHolidayDialog,
    holidays,
    toggleHoliday,
    deleteHoliday,
    addHoliday,
    resetHolidays,
  } = useCalendarStore();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<HolidayKind>('ethiopian-fixed');
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [offset, setOffset] = useState(0);

  const grouped = useMemo(() => {
    const map: Record<HolidayKind, ManagedHoliday[]> = {
      'ethiopian-fixed': [],
      'ethiopian-gc': [],
      'ethiopian-moveable': [],
      'gregorian-fixed': [],
    };
    for (const h of holidays) map[h.kind].push(h);
    return map;
  }, [holidays]);

  if (!isHolidayDialogOpen) return null;

  const isEthiopianFixed = kind === 'ethiopian-fixed';
  const isMoveable = kind === 'ethiopian-moveable';
  const monthNames = isEthiopianFixed
    ? ETHIOPIAN_MONTH_NAMES.slice(1)
    : GREGORIAN_MONTH_NAMES;
  const maxDay = isEthiopianFixed ? 30 : 31;

  const handleAdd = () => {
    if (!name.trim()) return;
    if (isMoveable) {
      addHoliday({ name: name.trim(), kind, offsetFromEaster: offset });
    } else {
      addHoliday({ name: name.trim(), kind, month, day });
    }
    setName('');
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeHolidayDialog}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Holidays</h2>
          <button
            onClick={closeHolidayDialog}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="px-6 pt-3 text-xs text-gray-500">
          Uncheck a holiday to hide it, or delete it entirely. Toggle and delete
          changes are saved automatically.
        </p>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-5">
          {KIND_ORDER.map((k) =>
            grouped[k].length === 0 ? null : (
              <div key={k}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {KIND_LABELS[k]}
                </h3>
                <div className="space-y-1">
                  {grouped[k].map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center gap-2 py-1 group"
                    >
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={() => toggleHoliday(h.id)}
                        className="w-4 h-4 rounded accent-indigo-600 flex-shrink-0"
                      />
                      <span
                        className={`flex-1 text-sm truncate ${
                          h.enabled ? 'text-gray-800' : 'text-gray-400 line-through'
                        }`}
                      >
                        {h.name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {describeHoliday(h)}
                      </span>
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="px-2 py-0.5 text-xs text-red-600 bg-red-50 rounded
                                   opacity-0 group-hover:opacity-100 transition-opacity
                                   hover:bg-red-100 flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Holiday name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as HolidayKind);
                  setMonth(1);
                  setDay(1);
                }}
                className="flex-1 px-2 py-2 rounded-lg border border-gray-300 text-sm bg-white"
              >
                <option value="ethiopian-fixed">Ethiopian date</option>
                <option value="ethiopian-gc">Ethiopian (Gregorian date)</option>
                <option value="ethiopian-moveable">Easter-based</option>
                <option value="gregorian-fixed">Gregorian date</option>
              </select>

              {isMoveable ? (
                <input
                  type="number"
                  value={offset}
                  onChange={(e) => setOffset(parseInt(e.target.value || '0', 10))}
                  placeholder="Days from Easter"
                  className="w-32 px-2 py-2 rounded-lg border border-gray-300 text-sm"
                  title="Days from Easter Sunday (negative = before)"
                />
              ) : (
                <>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                    className="px-2 py-2 rounded-lg border border-gray-300 text-sm bg-white"
                  >
                    {monthNames.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={maxDay}
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value || '1', 10))}
                    className="w-16 px-2 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 text-sm text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="px-3 py-1.5 text-sm text-white rounded-lg bg-indigo-600
                           hover:bg-indigo-700 disabled:opacity-50"
              >
                Add Holiday
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={resetHolidays}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg
                       border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Reset to defaults
          </button>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-3 py-1.5 text-sm font-medium text-white rounded-lg
                         bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              + Add Holiday
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
