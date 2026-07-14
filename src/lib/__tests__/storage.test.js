/**
 * Comprehensive unit tests for storage.js
 * Tests all CRUD functions, cascade delete behavior, error handling, and ID uniqueness
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  LEADS_KEY,
  FOLLOWUPS_KEY,
  getLeads,
  getLeadById,
  saveLead,
  updateLead,
  deleteLead,
  getFollowUps,
  getFollowUpsByLeadId,
  saveFollowUp,
  deleteFollowUpsByLeadId
} from '../storage.js';
import { createLead, createFollowUp, LEAD_STATUSES, FOLLOWUP_TYPES } from '../models.js';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getLeads', () => {
    it('returns empty array when no data exists', () => {
      const leads = getLeads();
      expect(leads).toEqual([]);
    });

    it('returns parsed array when data exists', () => {
      const testLeads = [
        createLead({ name: 'John Doe', company: 'Acme Inc' }),
        createLead({ name: 'Jane Smith', company: 'Tech Corp' })
      ];
      localStorage.setItem(LEADS_KEY, JSON.stringify(testLeads));

      const leads = getLeads();
      expect(leads).toHaveLength(2);
      expect(leads[0].name).toBe('John Doe');
      expect(leads[1].name).toBe('Jane Smith');
    });

    it('returns empty array on corrupt JSON', () => {
      localStorage.setItem(LEADS_KEY, 'invalid json{]');

      const leads = getLeads();
      expect(leads).toEqual([]);
    });

    it('handles malformed data gracefully', () => {
      localStorage.setItem(LEADS_KEY, '{not an array}');

      const leads = getLeads();
      expect(leads).toEqual([]);
    });
  });

  describe('getLeadById', () => {
    it('returns null when lead not found', () => {
      const lead = getLeadById('nonexistent-id');
      expect(lead).toBeNull();
    });

    it('returns lead when found', () => {
      const testLead = createLead({ name: 'John Doe', email: 'john@example.com' });
      localStorage.setItem(LEADS_KEY, JSON.stringify([testLead]));

      const lead = getLeadById(testLead.id);
      expect(lead).not.toBeNull();
      expect(lead.id).toBe(testLead.id);
      expect(lead.name).toBe('John Doe');
      expect(lead.email).toBe('john@example.com');
    });

    it('returns correct lead from multiple leads', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      const lead3 = createLead({ name: 'Lead 3' });
      localStorage.setItem(LEADS_KEY, JSON.stringify([lead1, lead2, lead3]));

      const found = getLeadById(lead2.id);
      expect(found.name).toBe('Lead 2');
    });
  });

  describe('saveLead', () => {
    it('appends lead to empty storage', () => {
      const lead = createLead({ name: 'New Lead', company: 'New Co' });

      const savedLead = saveLead(lead);

      expect(savedLead).toEqual(lead);
      const allLeads = getLeads();
      expect(allLeads).toHaveLength(1);
      expect(allLeads[0].name).toBe('New Lead');
    });

    it('appends lead to existing leads', () => {
      const existingLead = createLead({ name: 'Existing Lead' });
      localStorage.setItem(LEADS_KEY, JSON.stringify([existingLead]));

      const newLead = createLead({ name: 'New Lead' });
      saveLead(newLead);

      const allLeads = getLeads();
      expect(allLeads).toHaveLength(2);
      expect(allLeads[0].name).toBe('Existing Lead');
      expect(allLeads[1].name).toBe('New Lead');
    });

    it('returns the saved lead', () => {
      const lead = createLead({ name: 'Test Lead' });
      const returned = saveLead(lead);

      expect(returned).toEqual(lead);
      expect(returned.id).toBe(lead.id);
    });

    it('preserves all lead properties', () => {
      const lead = createLead({
        name: 'John Doe',
        company: 'Acme Inc',
        email: 'john@acme.com',
        phone: '555-1234',
        status: LEAD_STATUSES.CONTACTED,
        nextFollowUpDate: '2024-12-31',
        notes: 'Important client'
      });

      saveLead(lead);
      const retrieved = getLeadById(lead.id);

      expect(retrieved.name).toBe('John Doe');
      expect(retrieved.company).toBe('Acme Inc');
      expect(retrieved.email).toBe('john@acme.com');
      expect(retrieved.phone).toBe('555-1234');
      expect(retrieved.status).toBe(LEAD_STATUSES.CONTACTED);
      expect(retrieved.nextFollowUpDate).toBe('2024-12-31');
      expect(retrieved.notes).toBe('Important client');
    });
  });

  describe('updateLead', () => {
    it('replaces lead by id', () => {
      const lead = createLead({ name: 'Original Name', email: 'old@example.com' });
      saveLead(lead);

      const updatedLead = { ...lead, name: 'Updated Name', email: 'new@example.com' };
      updateLead(updatedLead);

      const retrieved = getLeadById(lead.id);
      expect(retrieved.name).toBe('Updated Name');
      expect(retrieved.email).toBe('new@example.com');
    });

    it('leaves other leads unchanged', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      const lead3 = createLead({ name: 'Lead 3' });
      saveLead(lead1);
      saveLead(lead2);
      saveLead(lead3);

      const updatedLead2 = { ...lead2, name: 'Updated Lead 2' };
      updateLead(updatedLead2);

      const retrieved1 = getLeadById(lead1.id);
      const retrieved2 = getLeadById(lead2.id);
      const retrieved3 = getLeadById(lead3.id);

      expect(retrieved1.name).toBe('Lead 1');
      expect(retrieved2.name).toBe('Updated Lead 2');
      expect(retrieved3.name).toBe('Lead 3');
    });

    it('returns the updated lead', () => {
      const lead = createLead({ name: 'Original' });
      saveLead(lead);

      const updatedLead = { ...lead, name: 'Updated' };
      const returned = updateLead(updatedLead);

      expect(returned.name).toBe('Updated');
      expect(returned.id).toBe(lead.id);
    });

    it('handles non-existent lead gracefully', () => {
      const fakeLead = createLead({ name: 'Fake' });

      const returned = updateLead(fakeLead);

      expect(returned).toEqual(fakeLead);
      const allLeads = getLeads();
      expect(allLeads).toHaveLength(0);
    });
  });

  describe('deleteLead', () => {
    it('removes lead from storage', () => {
      const lead = createLead({ name: 'To Delete' });
      saveLead(lead);

      deleteLead(lead.id);

      const retrieved = getLeadById(lead.id);
      expect(retrieved).toBeNull();
      expect(getLeads()).toHaveLength(0);
    });

    it('cascades to delete associated follow-ups', () => {
      const lead = createLead({ name: 'Lead with Follow-ups' });
      saveLead(lead);

      const followUp1 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL, note: 'Called' });
      const followUp2 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL, note: 'Emailed' });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);

      deleteLead(lead.id);

      const followUps = getFollowUpsByLeadId(lead.id);
      expect(followUps).toHaveLength(0);
    });

    it('does not delete follow-ups for other leads', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      saveLead(lead1);
      saveLead(lead2);

      const followUp1 = createFollowUp({ leadId: lead1.id, type: FOLLOWUP_TYPES.CALL });
      const followUp2 = createFollowUp({ leadId: lead2.id, type: FOLLOWUP_TYPES.EMAIL });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);

      deleteLead(lead1.id);

      const lead2FollowUps = getFollowUpsByLeadId(lead2.id);
      expect(lead2FollowUps).toHaveLength(1);
      expect(lead2FollowUps[0].leadId).toBe(lead2.id);
    });

    it('leaves other leads unchanged', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      const lead3 = createLead({ name: 'Lead 3' });
      saveLead(lead1);
      saveLead(lead2);
      saveLead(lead3);

      deleteLead(lead2.id);

      expect(getLeads()).toHaveLength(2);
      expect(getLeadById(lead1.id)).not.toBeNull();
      expect(getLeadById(lead2.id)).toBeNull();
      expect(getLeadById(lead3.id)).not.toBeNull();
    });
  });

  describe('getFollowUps', () => {
    it('returns empty array when no data exists', () => {
      const followUps = getFollowUps();
      expect(followUps).toEqual([]);
    });

    it('returns all follow-ups when data exists', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp1 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL });
      const followUp2 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);

      const allFollowUps = getFollowUps();
      expect(allFollowUps).toHaveLength(2);
    });

    it('returns empty array on corrupt JSON', () => {
      localStorage.setItem(FOLLOWUPS_KEY, 'invalid json{]');

      const followUps = getFollowUps();
      expect(followUps).toEqual([]);
    });
  });

  describe('getFollowUpsByLeadId', () => {
    it('filters by leadId correctly', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      saveLead(lead1);
      saveLead(lead2);

      const followUp1 = createFollowUp({ leadId: lead1.id, type: FOLLOWUP_TYPES.CALL, note: 'For Lead 1' });
      const followUp2 = createFollowUp({ leadId: lead2.id, type: FOLLOWUP_TYPES.EMAIL, note: 'For Lead 2' });
      const followUp3 = createFollowUp({ leadId: lead1.id, type: FOLLOWUP_TYPES.MEETING, note: 'Also for Lead 1' });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);
      saveFollowUp(followUp3);

      const lead1FollowUps = getFollowUpsByLeadId(lead1.id);
      expect(lead1FollowUps).toHaveLength(2);
      expect(lead1FollowUps[0].note).toBe('For Lead 1');
      expect(lead1FollowUps[1].note).toBe('Also for Lead 1');

      const lead2FollowUps = getFollowUpsByLeadId(lead2.id);
      expect(lead2FollowUps).toHaveLength(1);
      expect(lead2FollowUps[0].note).toBe('For Lead 2');
    });

    it('returns empty array when no follow-ups for lead', () => {
      const lead = createLead({ name: 'Lead' });
      saveLead(lead);

      const followUps = getFollowUpsByLeadId(lead.id);
      expect(followUps).toEqual([]);
    });

    it('returns empty array for non-existent lead', () => {
      const followUps = getFollowUpsByLeadId('nonexistent-id');
      expect(followUps).toEqual([]);
    });
  });

  describe('saveFollowUp', () => {
    it('appends follow-up to storage', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL, note: 'Initial call' });
      saveFollowUp(followUp);

      const allFollowUps = getFollowUps();
      expect(allFollowUps).toHaveLength(1);
      expect(allFollowUps[0].note).toBe('Initial call');
    });

    it('appends to existing follow-ups', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp1 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL });
      const followUp2 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);

      const allFollowUps = getFollowUps();
      expect(allFollowUps).toHaveLength(2);
    });

    it('returns the saved follow-up', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.MEETING, note: 'Meeting notes' });
      const returned = saveFollowUp(followUp);

      expect(returned).toEqual(followUp);
      expect(returned.id).toBe(followUp.id);
    });

    it('preserves all follow-up properties', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp = createFollowUp({
        leadId: lead.id,
        type: FOLLOWUP_TYPES.EMAIL,
        date: '2024-12-25T10:00:00.000Z',
        note: 'Holiday greeting email'
      });

      saveFollowUp(followUp);
      const allFollowUps = getFollowUpsByLeadId(lead.id);

      expect(allFollowUps[0].leadId).toBe(lead.id);
      expect(allFollowUps[0].type).toBe(FOLLOWUP_TYPES.EMAIL);
      expect(allFollowUps[0].date).toBe('2024-12-25T10:00:00.000Z');
      expect(allFollowUps[0].note).toBe('Holiday greeting email');
    });
  });

  describe('deleteFollowUpsByLeadId', () => {
    it('removes only matching follow-ups', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      saveLead(lead1);
      saveLead(lead2);

      const followUp1 = createFollowUp({ leadId: lead1.id, type: FOLLOWUP_TYPES.CALL });
      const followUp2 = createFollowUp({ leadId: lead1.id, type: FOLLOWUP_TYPES.EMAIL });
      const followUp3 = createFollowUp({ leadId: lead2.id, type: FOLLOWUP_TYPES.MEETING });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);
      saveFollowUp(followUp3);

      deleteFollowUpsByLeadId(lead1.id);

      const lead1FollowUps = getFollowUpsByLeadId(lead1.id);
      const lead2FollowUps = getFollowUpsByLeadId(lead2.id);

      expect(lead1FollowUps).toHaveLength(0);
      expect(lead2FollowUps).toHaveLength(1);
      expect(lead2FollowUps[0].leadId).toBe(lead2.id);
    });

    it('handles non-existent leadId gracefully', () => {
      const lead = createLead({ name: 'Test Lead' });
      saveLead(lead);

      const followUp = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL });
      saveFollowUp(followUp);

      deleteFollowUpsByLeadId('nonexistent-id');

      const allFollowUps = getFollowUps();
      expect(allFollowUps).toHaveLength(1);
    });

    it('works when no follow-ups exist', () => {
      deleteFollowUpsByLeadId('any-id');

      const allFollowUps = getFollowUps();
      expect(allFollowUps).toEqual([]);
    });
  });

  describe('ID uniqueness', () => {
    it('generates unique IDs for leads', () => {
      const lead1 = createLead({ name: 'Lead 1' });
      const lead2 = createLead({ name: 'Lead 2' });
      const lead3 = createLead({ name: 'Lead 3' });

      expect(lead1.id).not.toBe(lead2.id);
      expect(lead1.id).not.toBe(lead3.id);
      expect(lead2.id).not.toBe(lead3.id);
    });

    it('generates unique IDs for follow-ups', () => {
      const lead = createLead({ name: 'Test Lead' });
      const followUp1 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL });
      const followUp2 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL });
      const followUp3 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.MEETING });

      expect(followUp1.id).not.toBe(followUp2.id);
      expect(followUp1.id).not.toBe(followUp3.id);
      expect(followUp2.id).not.toBe(followUp3.id);
    });
  });

  describe('Integration tests', () => {
    it('handles complete lead lifecycle with follow-ups', () => {
      // Create and save lead
      const lead = createLead({
        name: 'John Doe',
        company: 'Acme Inc',
        email: 'john@acme.com',
        status: LEAD_STATUSES.NEW
      });
      saveLead(lead);

      // Add follow-ups
      const followUp1 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL, note: 'Initial contact' });
      const followUp2 = createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL, note: 'Sent proposal' });
      saveFollowUp(followUp1);
      saveFollowUp(followUp2);

      // Update lead status
      const updatedLead = { ...lead, status: LEAD_STATUSES.PROPOSAL_SENT };
      updateLead(updatedLead);

      // Verify state
      const retrieved = getLeadById(lead.id);
      const followUps = getFollowUpsByLeadId(lead.id);

      expect(retrieved.status).toBe(LEAD_STATUSES.PROPOSAL_SENT);
      expect(followUps).toHaveLength(2);

      // Delete lead (cascade)
      deleteLead(lead.id);

      // Verify cleanup
      expect(getLeadById(lead.id)).toBeNull();
      expect(getFollowUpsByLeadId(lead.id)).toHaveLength(0);
    });

    it('handles multiple leads with multiple follow-ups', () => {
      // Create multiple leads
      const leads = [
        createLead({ name: 'Lead 1' }),
        createLead({ name: 'Lead 2' }),
        createLead({ name: 'Lead 3' })
      ];
      leads.forEach(lead => saveLead(lead));

      // Add follow-ups to each
      leads.forEach(lead => {
        saveFollowUp(createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.CALL }));
        saveFollowUp(createFollowUp({ leadId: lead.id, type: FOLLOWUP_TYPES.EMAIL }));
      });

      // Verify totals
      expect(getLeads()).toHaveLength(3);
      expect(getFollowUps()).toHaveLength(6);

      // Delete one lead
      deleteLead(leads[1].id);

      // Verify selective deletion
      expect(getLeads()).toHaveLength(2);
      expect(getFollowUps()).toHaveLength(4);
      expect(getFollowUpsByLeadId(leads[0].id)).toHaveLength(2);
      expect(getFollowUpsByLeadId(leads[1].id)).toHaveLength(0);
      expect(getFollowUpsByLeadId(leads[2].id)).toHaveLength(2);
    });
  });
});
