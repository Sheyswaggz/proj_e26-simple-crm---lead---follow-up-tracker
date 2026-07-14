/**
 * Data model schemas and factory functions for Lead and FollowUp entities
 * @module models
 */

/**
 * Lead status constants
 * @constant {Object.<string, string>}
 */
export const LEAD_STATUSES = Object.freeze({
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost'
});

/**
 * Follow-up type constants
 * @constant {Object.<string, string>}
 */
export const FOLLOWUP_TYPES = Object.freeze({
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting'
});

/**
 * Creates a new Lead object with generated ID and defaults
 * @param {Object} data - Lead data
 * @param {string} [data.name=''] - Lead name
 * @param {string} [data.company=''] - Company name
 * @param {string} [data.email=''] - Email address
 * @param {string} [data.phone=''] - Phone number
 * @param {string} [data.status] - Lead status (defaults to LEAD_STATUSES.NEW)
 * @param {string} [data.nextFollowUpDate=''] - Next follow-up date (ISO string)
 * @param {string} [data.notes=''] - Notes about the lead
 * @returns {Object} Complete Lead object
 */
export function createLead({
  name = '',
  company = '',
  email = '',
  phone = '',
  status = LEAD_STATUSES.NEW,
  nextFollowUpDate = '',
  notes = ''
}) {
  return {
    id: crypto.randomUUID(),
    name,
    company,
    email,
    phone,
    status,
    nextFollowUpDate,
    notes,
    dateAdded: new Date().toISOString()
  };
}

/**
 * Creates a new FollowUp object with generated ID and defaults
 * @param {Object} data - FollowUp data
 * @param {string} data.leadId - Associated lead ID
 * @param {string} [data.date] - Follow-up date (ISO string, defaults to today)
 * @param {string} data.type - Type of follow-up (call, email, meeting)
 * @param {string} [data.note=''] - Follow-up notes
 * @returns {Object} Complete FollowUp object
 */
export function createFollowUp({
  leadId,
  date = new Date().toISOString(),
  type,
  note = ''
}) {
  return {
    id: crypto.randomUUID(),
    leadId,
    date,
    type,
    note
  };
}
