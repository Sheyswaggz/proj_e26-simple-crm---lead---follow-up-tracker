/**
 * Shared utility functions for date formatting and lead status checks
 * @module utils
 */

/**
 * Determines if a lead is overdue based on follow-up date and status
 * A lead is overdue if:
 * - nextFollowUpDate is set (non-empty string)
 * - nextFollowUpDate is before today
 * - status is not 'Won' and not 'Lost'
 *
 * @param {Object} lead - Lead object
 * @param {string} lead.nextFollowUpDate - ISO date string or YYYY-MM-DD
 * @param {string} lead.status - Lead status
 * @returns {boolean} True if lead is overdue, false otherwise
 *
 * @example
 * isOverdue({ nextFollowUpDate: '2024-01-01', status: 'New' }) // true if today > 2024-01-01
 * isOverdue({ nextFollowUpDate: '', status: 'New' }) // false (no date set)
 * isOverdue({ nextFollowUpDate: '2024-01-01', status: 'Won' }) // false (Won status)
 */
export function isOverdue(lead) {
  // Input validation
  if (!lead || typeof lead !== 'object') {
    return false;
  }

  const { nextFollowUpDate, status } = lead;

  // Check if follow-up date is set
  if (!nextFollowUpDate || typeof nextFollowUpDate !== 'string' || nextFollowUpDate.trim() === '') {
    return false;
  }

  // Check if status is Won or Lost (these are never overdue)
  if (status === 'Won' || status === 'Lost') {
    return false;
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Extract date portion from nextFollowUpDate (handle ISO strings or YYYY-MM-DD)
  const followUpDateStr = nextFollowUpDate.split('T')[0];

  // Compare date strings (lexicographic comparison works for YYYY-MM-DD)
  return followUpDateStr < today;
}

/**
 * Formats an ISO date string to human-readable format
 * Returns '—' for empty/null values
 *
 * @param {string} isoString - ISO date string (e.g., '2025-01-15' or '2025-01-15T00:00:00')
 * @returns {string} Formatted date (e.g., 'Jan 15, 2025') or '—'
 *
 * @example
 * formatDate('2025-01-15') // 'Jan 15, 2025'
 * formatDate('2025-01-15T10:30:00') // 'Jan 15, 2025'
 * formatDate('') // '—'
 * formatDate(null) // '—'
 */
export function formatDate(isoString) {
  // Handle empty or null values
  if (!isoString || typeof isoString !== 'string' || isoString.trim() === '') {
    return '—';
  }

  try {
    // Append time component to ensure consistent parsing as local time
    // This prevents timezone offset issues
    const dateStr = isoString.includes('T') ? isoString : `${isoString}T00:00:00`;
    const date = new Date(dateStr);

    // Validate the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`formatDate: Invalid date string: ${isoString}`);
      return '—';
    }

    // Format using toLocaleDateString with specific options
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error(`formatDate: Error formatting date ${isoString}:`, error);
    return '—';
  }
}

/**
 * Formats an ISO date string for use in HTML date inputs
 * Returns empty string for empty/null values
 *
 * @param {string} isoString - ISO date string (e.g., '2025-01-15' or '2025-01-15T10:30:00')
 * @returns {string} Date in YYYY-MM-DD format or empty string
 *
 * @example
 * formatDateForInput('2025-01-15') // '2025-01-15'
 * formatDateForInput('2025-01-15T10:30:00.000Z') // '2025-01-15'
 * formatDateForInput('') // ''
 * formatDateForInput(null) // ''
 */
export function formatDateForInput(isoString) {
  // Handle empty or null values
  if (!isoString || typeof isoString !== 'string' || isoString.trim() === '') {
    return '';
  }

  try {
    // Extract date portion (YYYY-MM-DD)
    if (isoString.includes('T')) {
      // ISO string with time component
      return isoString.split('T')[0];
    }

    // Already in YYYY-MM-DD format
    return isoString;
  } catch (error) {
    console.error(`formatDateForInput: Error formatting date ${isoString}:`, error);
    return '';
  }
}
