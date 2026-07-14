/**
 * localStorage persistence layer for Lead and FollowUp entities
 * Provides CRUD operations with error handling and data validation
 * @module storage
 */

/**
 * localStorage key for leads data
 * @constant {string}
 */
export const LEADS_KEY = 'crm_leads';

/**
 * localStorage key for follow-ups data
 * @constant {string}
 */
export const FOLLOWUPS_KEY = 'crm_followups';

/**
 * Retrieves all leads from localStorage
 * @returns {Array<Object>} Array of Lead objects, empty array on error or no data
 */
export function getLeads() {
  try {
    const data = localStorage.getItem(LEADS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leads from localStorage:', error);
    return [];
  }
}

/**
 * Retrieves a single lead by ID
 * @param {string} id - Lead ID
 * @returns {Object|null} Lead object or null if not found
 */
export function getLeadById(id) {
  const leads = getLeads();
  return leads.find(lead => lead.id === id) || null;
}

/**
 * Saves a new lead to localStorage
 * @param {Object} lead - Lead object to save
 * @returns {Object} The saved lead object
 */
export function saveLead(lead) {
  const leads = getLeads();
  leads.push(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  return lead;
}

/**
 * Updates an existing lead in localStorage
 * @param {Object} updatedLead - Lead object with updated data (must include id)
 * @returns {Object} The updated lead object
 */
export function updateLead(updatedLead) {
  const leads = getLeads();
  const index = leads.findIndex(lead => lead.id === updatedLead.id);

  if (index !== -1) {
    leads[index] = updatedLead;
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }

  return updatedLead;
}

/**
 * Deletes a lead and all associated follow-ups from localStorage
 * @param {string} id - Lead ID to delete
 * @returns {void}
 */
export function deleteLead(id) {
  const leads = getLeads();
  const filteredLeads = leads.filter(lead => lead.id !== id);
  localStorage.setItem(LEADS_KEY, JSON.stringify(filteredLeads));

  // Cascade delete: remove all follow-ups associated with this lead
  deleteFollowUpsByLeadId(id);
}

/**
 * Retrieves all follow-ups from localStorage
 * @returns {Array<Object>} Array of FollowUp objects, empty array on error or no data
 */
export function getFollowUps() {
  try {
    const data = localStorage.getItem(FOLLOWUPS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading follow-ups from localStorage:', error);
    return [];
  }
}

/**
 * Retrieves all follow-ups for a specific lead
 * @param {string} leadId - Lead ID to filter by
 * @returns {Array<Object>} Array of FollowUp objects for the specified lead
 */
export function getFollowUpsByLeadId(leadId) {
  const followUps = getFollowUps();
  return followUps.filter(followUp => followUp.leadId === leadId);
}

/**
 * Saves a new follow-up to localStorage
 * @param {Object} followUp - FollowUp object to save
 * @returns {Object} The saved follow-up object
 */
export function saveFollowUp(followUp) {
  const followUps = getFollowUps();
  followUps.push(followUp);
  localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps));
  return followUp;
}

/**
 * Deletes all follow-ups associated with a specific lead
 * @param {string} leadId - Lead ID to delete follow-ups for
 * @returns {void}
 */
export function deleteFollowUpsByLeadId(leadId) {
  const followUps = getFollowUps();
  const filteredFollowUps = followUps.filter(followUp => followUp.leadId !== leadId);
  localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(filteredFollowUps));
}
