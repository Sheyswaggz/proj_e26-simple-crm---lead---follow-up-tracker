/**
 * FollowUpForm - Inline form component for logging follow-up activities
 * @module FollowUpForm
 */

import { useState } from 'react';
import { createFollowUp, FOLLOWUP_TYPES } from '../../lib/models.js';
import { saveFollowUp } from '../../lib/storage.js';

/**
 * FollowUpForm Component
 * Inline form for logging a new follow-up activity to a lead
 * Features:
 * - Inline form (not modal)
 * - Date input with default to today
 * - Type selector (call, email, meeting)
 * - Note textarea with validation
 * - Auto-resets after successful submission
 *
 * @param {Object} props - Component props
 * @param {string} props.leadId - ID of the lead to attach follow-up to
 * @param {Function} props.onSave - Callback when follow-up is saved (receives followUp object)
 * @returns {JSX.Element} Rendered form
 */
export function FollowUpForm({ leadId, onSave }) {
  // Get today's date in YYYY-MM-DD format for default value
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Form state
  const [date, setDate] = useState(getTodayDate());
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Validates form data
   * Currently validates:
   * - note is required (non-empty after trim)
   *
   * @returns {Object} errors object with field names as keys
   */
  const validate = () => {
    const validationErrors = {};

    if (!note || note.trim() === '') {
      validationErrors.note = 'Note is required';
    }

    return validationErrors;
  };

  /**
   * Handles form submission
   * Validates form, creates follow-up, saves to storage, calls onSave, then resets form
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create follow-up object
    const followUp = createFollowUp({
      leadId,
      date: new Date(date).toISOString(),
      type,
      note: note.trim()
    });

    // Save to localStorage
    saveFollowUp(followUp);

    // Call parent callback
    onSave(followUp);

    // Reset form
    setDate(getTodayDate());
    setType('call');
    setNote('');
    setErrors({});
  };

  /**
   * Handles note input changes
   * Clears error when user starts typing
   *
   * @param {Event} e - Input change event
   */
  const handleNoteChange = (e) => {
    setNote(e.target.value);

    // Clear error when user starts typing
    if (errors.note) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.note;
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Log Follow-Up</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date input */}
        <div>
          <label htmlFor="followup-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="followup-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Type select */}
        <div>
          <label htmlFor="followup-type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="followup-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
        </div>

        {/* Note textarea */}
        <div>
          <label htmlFor="followup-note" className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            id="followup-note"
            value={note}
            onChange={handleNoteChange}
            rows={3}
            placeholder="What happened or was agreed..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-required="true"
            aria-invalid={errors.note ? 'true' : 'false'}
            aria-describedby={errors.note ? 'note-error' : undefined}
          />
          {errors.note && (
            <p id="note-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.note}
            </p>
          )}
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Add Follow-Up
          </button>
        </div>
      </form>
    </div>
  );
}
