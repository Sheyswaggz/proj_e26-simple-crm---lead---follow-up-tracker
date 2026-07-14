import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LeadDetail from '../LeadDetail.jsx';
import { LEAD_STATUSES, FOLLOWUP_TYPES } from '../../lib/models.js';

// Mock the storage module
vi.mock('../../lib/storage.js', () => ({
  getLeadById: vi.fn(),
  getFollowUpsByLeadId: vi.fn(),
  updateLead: vi.fn()
}));

// Mock the utils module
vi.mock('../../lib/utils.js', () => ({
  isOverdue: vi.fn((lead) => {
    // Mock implementation: overdue if nextFollowUpDate is '2024-01-01'
    return lead.nextFollowUpDate === '2024-01-01';
  }),
  formatDate: vi.fn((dateStr) => {
    // Mock implementation: simple format
    if (!dateStr) return '—';
    return 'Jan 15, 2025';
  })
}));

import { getLeadById, getFollowUpsByLeadId, updateLead } from '../../lib/storage.js';
import { isOverdue, formatDate } from '../../lib/utils.js';

describe('LeadDetail', () => {
  // Test fixtures
  const mockLead = {
    id: 'test-lead-id',
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com',
    phone: '555-1234',
    status: LEAD_STATUSES.CONTACTED,
    nextFollowUpDate: '2025-01-15',
    notes: 'Important client',
    dateAdded: '2025-01-01T00:00:00.000Z'
  };

  const mockFollowUps = [
    {
      id: 'followup-1',
      leadId: 'test-lead-id',
      date: '2025-01-10T10:00:00.000Z',
      type: FOLLOWUP_TYPES.CALL,
      note: 'Discussed project requirements'
    },
    {
      id: 'followup-2',
      leadId: 'test-lead-id',
      date: '2025-01-05T14:30:00.000Z',
      type: FOLLOWUP_TYPES.EMAIL,
      note: 'Sent initial proposal'
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  /**
   * Helper function to render LeadDetail with router context
   */
  const renderLeadDetail = (leadId = 'test-lead-id') => {
    return render(
      <MemoryRouter initialEntries={[`/leads/${leadId}`]}>
        <Routes>
          <Route path="/leads/:id" element={<LeadDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders lead name and company', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for lead name in heading
    expect(screen.getByRole('heading', { level: 1, name: 'John Doe' })).toBeInTheDocument();

    // Check for company in contact info
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders contact email and phone', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for email link
    const emailLink = screen.getByRole('link', { name: /john@acme\.com/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:john@acme.com');

    // Check for phone link
    const phoneLink = screen.getByRole('link', { name: /555-1234/i });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', 'tel:555-1234');
  });

  it('renders follow-up history items', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue(mockFollowUps);

    renderLeadDetail();

    // Check for follow-up notes
    expect(screen.getByText('Discussed project requirements')).toBeInTheDocument();
    expect(screen.getByText('Sent initial proposal')).toBeInTheDocument();

    // Check for follow-up type labels
    expect(screen.getByText('Phone Call')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('follow-ups shown in reverse date order', () => {
    getLeadById.mockReturnValue(mockLead);
    // Return unsorted follow-ups
    getFollowUpsByLeadId.mockReturnValue([...mockFollowUps].reverse());

    renderLeadDetail();

    const notes = screen.getAllByText(/Discussed|Sent/);

    // First item should be the most recent (followup-1 from Jan 10)
    expect(notes[0]).toHaveTextContent('Discussed project requirements');

    // Second item should be the older one (followup-2 from Jan 5)
    expect(notes[1]).toHaveTextContent('Sent initial proposal');
  });

  it('renders not found when getLeadById returns null', () => {
    getLeadById.mockReturnValue(null);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for not found message
    expect(screen.getByText('Lead Not Found')).toBeInTheDocument();
    expect(screen.getByText(/does not exist or has been deleted/i)).toBeInTheDocument();
  });

  it('status select shows current status', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Find the status select
    const statusSelect = screen.getByLabelText(/change lead status/i);
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect).toHaveValue(LEAD_STATUSES.CONTACTED);
  });

  it('changing status select calls updateLead with new status', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);
    updateLead.mockImplementation((lead) => lead);

    renderLeadDetail();

    // Find and change the status select
    const statusSelect = screen.getByLabelText(/change lead status/i);
    fireEvent.change(statusSelect, { target: { value: LEAD_STATUSES.QUALIFIED } });

    // Verify updateLead was called with the new status
    expect(updateLead).toHaveBeenCalledTimes(1);
    expect(updateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockLead,
        status: LEAD_STATUSES.QUALIFIED
      })
    );
  });

  it('empty follow-up history shows placeholder', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for empty state message
    expect(screen.getByText('No follow-ups logged yet')).toBeInTheDocument();
  });

  it('renders overdue badge when lead is overdue', () => {
    const overdueLead = {
      ...mockLead,
      nextFollowUpDate: '2024-01-01' // This will trigger isOverdue mock
    };

    getLeadById.mockReturnValue(overdueLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for overdue badge
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders all status options in select', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    const statusSelect = screen.getByLabelText(/change lead status/i);

    // Check that all status options are present
    Object.values(LEAD_STATUSES).forEach((status) => {
      const option = Array.from(statusSelect.options).find(
        (opt) => opt.value === status
      );
      expect(option).toBeDefined();
      expect(option.textContent).toBe(status);
    });
  });

  it('renders notes when present', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    expect(screen.getByText('Important client')).toBeInTheDocument();
  });

  it('renders placeholder when notes are empty', () => {
    const leadWithoutNotes = { ...mockLead, notes: '' };
    getLeadById.mockReturnValue(leadWithoutNotes);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    expect(screen.getByText('No notes')).toBeInTheDocument();
  });

  it('renders back button with link to home', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Find back link (there might be multiple, check for the one in top bar)
    const backLinks = screen.getAllByRole('link', { name: /back/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0]).toHaveAttribute('href', '/');
  });

  it('renders placeholder edit and delete buttons', () => {
    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Check for Edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    expect(editButton).toBeDisabled();

    // Check for Delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it('handles missing email gracefully', () => {
    const leadWithoutEmail = { ...mockLead, email: '' };
    getLeadById.mockReturnValue(leadWithoutEmail);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Should render em dash for missing email
    const emailSection = screen.getByText(/email/i).closest('div');
    expect(emailSection).toHaveTextContent('—');
  });

  it('handles missing phone gracefully', () => {
    const leadWithoutPhone = { ...mockLead, phone: '' };
    getLeadById.mockReturnValue(leadWithoutPhone);
    getFollowUpsByLeadId.mockReturnValue([]);

    renderLeadDetail();

    // Should render em dash for missing phone
    const phoneSection = screen.getByText(/phone/i).closest('div');
    expect(phoneSection).toHaveTextContent('—');
  });

  it('renders meeting type follow-up correctly', () => {
    const meetingFollowUp = {
      id: 'followup-3',
      leadId: 'test-lead-id',
      date: '2025-01-12T09:00:00.000Z',
      type: FOLLOWUP_TYPES.MEETING,
      note: 'In-person meeting scheduled'
    };

    getLeadById.mockReturnValue(mockLead);
    getFollowUpsByLeadId.mockReturnValue([meetingFollowUp]);

    renderLeadDetail();

    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('In-person meeting scheduled')).toBeInTheDocument();
  });
});
