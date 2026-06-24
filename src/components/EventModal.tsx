import { useState, useEffect, useCallback } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import type { Recurrence } from '../types/calendar';

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (every 3 months)' },
  { value: 'yearly', label: 'Yearly' },
];

export function EventModal() {
  const {
    isEventModalOpen,
    editingEvent,
    closeEventModal,
    addEvent,
    updateEvent,
    selectedDate,
    viewMode,
  } = useCalendarStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setRecurrence(editingEvent.recurrence ?? 'none');
    } else {
      setTitle('');
      setDescription('');
      setRecurrence('none');
    }
  }, [editingEvent, isEventModalOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      if (editingEvent) {
        updateEvent(editingEvent.id, title.trim(), description.trim(), recurrence);
      } else if (selectedDate) {
        addEvent(title.trim(), description.trim(), selectedDate, recurrence);
      }
    },
    [title, description, recurrence, editingEvent, selectedDate, addEvent, updateEvent]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') closeEventModal();
    },
    [closeEventModal]
  );

  if (!isEventModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeEventModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {editingEvent ? 'Edit Event' : 'New Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full px-3 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-shadow text-sm"
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-shadow text-sm resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="event-recurrence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Repeats
            </label>
            <select
              id="event-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-shadow text-sm bg-white"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {recurrence !== 'none' && recurrence !== 'daily' &&
              recurrence !== 'weekly' && recurrence !== 'biweekly' && (
                <p className="text-xs text-gray-400 mt-1">
                  Repeats on the {viewMode === 'ethiopian' ? 'Ethiopian' : 'Gregorian'} calendar
                </p>
              )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeEventModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg
                         border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg
                         bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors"
            >
              {editingEvent ? 'Update' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
