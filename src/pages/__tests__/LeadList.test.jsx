/**
 * Unit tests for LeadList component
 * Tests rendering, search filtering, sorting, overdue highlighting, empty states, delete flow, and edit-from-list functionality
 * @module LeadList.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import LeadList from '../LeadList.jsx';
import * as storage from '../../lib/storage.js';
import { isOverdue, formatDate } from '../../lib/utils.js';

// Mock the storage module
vi.mock('../../lib/storage.js', () => ({
  getLeads: vi.fn(),
  deleteLead: vi.fn(),
  updateLead: vi.fn()
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

/**
 * Test fixture: Sample leads with varied statuses and dates
 */
const mockLeads = [
  {
    id: 'lead-1',
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com',
    phone: '555-0101',
    status: 'New',
    nextFollowUpDate: '2025-01-20',
    notes: 'Initial contact',
    dateAdded: '2025-01-15T10:00:00.000Z'
  },
  {
    id: 'lead-2',
    name: 'Jane Smith',
    company: 'Tech Solutions',
    email: 'jane@tech.com',
    phone: '555-0102',
    status: 'Contacted',
    nextFollowUpDate: '2024-12-01', // Past date - overdue
    notes: 'Follow up needed',
    dateAdded: '2025-01-10T10:00:00.000Z'
  },
  {
    id: 'lead-3',
    name: 'Bob Johnson',
    company: 'Widget Inc',
    email: 'bob@widget.com',
    phone: '555-0103',
    status: 'Won',
    nextFollowUpDate: '2024-11-15', // Past date but Won status - not overdue
    notes: 'Deal closed',
    dateAdded: '2025-01-05T10:00:00.000Z'
  }
];

/**
 * Helper function to render LeadList with Router wrapper
 */
function renderLeadList() {
  return render(
    <MemoryRouter>
      <LeadList />
    </MemoryRouter>
  );
}

describe('LeadList', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Mock window.confirm to always return true
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Table Rendering', () => {
    it('renders table headers', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Check for all column headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date Added')).toBeInTheDocument();
      expect(screen.getByText('Next Follow-Up')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders lead rows with data', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Check that all leads are rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Widget Inc')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('filters leads by name', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const searchInput = screen.getByPlaceholderText(/search by name or company/i);

      // Search for "John"
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Only John Doe and Bob Johnson should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('filters leads by company', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const searchInput = screen.getByPlaceholderText(/search by name or company/i);

      // Search for "Tech"
      fireEvent.change(searchInput, { target: { value: 'Tech' } });

      // Only Tech Solutions should be visible
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const searchInput = screen.getByPlaceholderText(/search by name or company/i);

      // Search with lowercase
      fireEvent.change(searchInput, { target: { value: 'acme' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no leads exist', () => {
      storage.getLeads.mockReturnValue([]);

      renderLeadList();

      expect(screen.getByText('No leads yet')).toBeInTheDocument();
      expect(screen.getByText('Add your first lead to get started')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add lead/i })).toBeInTheDocument();
    });

    it('shows no-results empty state when search returns nothing', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const searchInput = screen.getByPlaceholderText(/search by name or company/i);

      // Search for something that doesn't exist
      fireEvent.change(searchInput, { target: { value: 'NonExistentCompany' } });

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term')).toBeInTheDocument();
    });
  });

  describe('Overdue Highlighting', () => {
    it('highlights overdue lead with amber background', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      const { container } = renderLeadList();

      // Find the row for Jane Smith (lead-2) which is overdue
      const janeRow = container.querySelector('tr.bg-amber-50.border-l-4.border-amber-400');
      expect(janeRow).toBeInTheDocument();
      expect(janeRow.textContent).toContain('Jane Smith');
    });

    it('does not highlight Won lead with past date', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      const { container } = renderLeadList();

      // Bob Johnson has Won status with past date - should NOT be highlighted
      // We need to verify that Bob's row does NOT have the amber classes
      const rows = container.querySelectorAll('tbody tr');
      const bobRow = Array.from(rows).find(row => row.textContent.includes('Bob Johnson'));

      expect(bobRow).toBeInTheDocument();
      expect(bobRow).not.toHaveClass('bg-amber-50');
      expect(bobRow).not.toHaveClass('border-amber-400');
    });

    it('displays overdue date in red text', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      const { container } = renderLeadList();

      // Find Jane Smith's row (overdue)
      const rows = container.querySelectorAll('tbody tr');
      const janeRow = Array.from(rows).find(row => row.textContent.includes('Jane Smith'));

      // Find the follow-up date cell (5th cell)
      const followUpCell = janeRow.querySelectorAll('td')[4];
      expect(followUpCell).toHaveClass('text-red-600');
      expect(followUpCell).toHaveClass('font-medium');
    });
  });

  describe('Sorting', () => {
    it('sorts leads by name ascending', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Click Name header to sort
      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader);

      // Get all rows
      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1); // Skip header row

      // Check order: Bob, Jane, John (alphabetical ascending)
      expect(dataRows[0].textContent).toContain('Bob Johnson');
      expect(dataRows[1].textContent).toContain('Jane Smith');
      expect(dataRows[2].textContent).toContain('John Doe');
    });

    it('toggles sort direction when clicking same column', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const nameHeader = screen.getByText('Name').closest('th');

      // First click: ascending
      fireEvent.click(nameHeader);
      let rows = screen.getAllByRole('row');
      let dataRows = rows.slice(1);
      expect(dataRows[0].textContent).toContain('Bob Johnson');

      // Second click: descending
      fireEvent.click(nameHeader);
      rows = screen.getAllByRole('row');
      dataRows = rows.slice(1);
      expect(dataRows[0].textContent).toContain('John Doe');
    });

    it('sorts by company', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const companyHeader = screen.getByText('Company').closest('th');
      fireEvent.click(companyHeader);

      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1);

      // Alphabetical: Acme Corp, Tech Solutions, Widget Inc
      expect(dataRows[0].textContent).toContain('Acme Corp');
      expect(dataRows[1].textContent).toContain('Tech Solutions');
      expect(dataRows[2].textContent).toContain('Widget Inc');
    });

    it('sorts by status', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const statusHeader = screen.getByText('Status').closest('th');
      fireEvent.click(statusHeader);

      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1);

      // Alphabetical: Contacted, New, Won
      expect(dataRows[0].textContent).toContain('Contacted');
      expect(dataRows[1].textContent).toContain('New');
      expect(dataRows[2].textContent).toContain('Won');
    });
  });

  describe('Delete Flow', () => {
    it('calls deleteLead and refreshes list on delete', async () => {
      storage.getLeads
        .mockReturnValueOnce(mockLeads)
        .mockReturnValueOnce(mockLeads.filter(l => l.id !== 'lead-1'));

      renderLeadList();

      // Find and click delete button for John Doe
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      const johnDeleteButton = deleteButtons.find(btn => btn.getAttribute('aria-label').includes('Delete lead'));

      fireEvent.click(johnDeleteButton);

      // Verify confirm was called
      expect(window.confirm).toHaveBeenCalledWith('Delete this lead and all follow-ups?');

      // Verify deleteLead was called with correct ID
      await waitFor(() => {
        expect(storage.deleteLead).toHaveBeenCalledWith('lead-1');
      });

      // Verify getLeads was called again to refresh
      await waitFor(() => {
        expect(storage.getLeads).toHaveBeenCalledTimes(2);
      });
    });

    it('does not delete when user cancels confirmation', () => {
      storage.getLeads.mockReturnValue(mockLeads);
      window.confirm = vi.fn(() => false); // User clicks Cancel

      renderLeadList();

      const deleteButtons = screen.getAllByLabelText(/delete/i);
      const johnDeleteButton = deleteButtons[0];

      fireEvent.click(johnDeleteButton);

      // Verify confirm was called
      expect(window.confirm).toHaveBeenCalledWith('Delete this lead and all follow-ups?');

      // Verify deleteLead was NOT called
      expect(storage.deleteLead).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('navigates to lead detail on view button click', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Find and click view button for John Doe
      const viewButtons = screen.getAllByLabelText(/view/i);
      const johnViewButton = viewButtons.find(btn => btn.getAttribute('aria-label').includes('View lead'));

      fireEvent.click(johnViewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/lead/lead-1');
    });
  });

  describe('Edit From List', () => {
    it('clicking Edit button opens LeadForm with initialData set to that lead', async () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Find and click edit button (first one - for John Doe)
      const editButtons = screen.getAllByLabelText('Edit lead');
      const johnEditButton = editButtons[0];

      fireEvent.click(johnEditButton);

      // Wait for modal to appear
      await waitFor(() => {
        // Check that the modal title is "Edit Lead"
        expect(screen.getByText('Edit Lead')).toBeInTheDocument();
      });

      // Verify the form is populated with John Doe's data
      const nameInput = screen.getByLabelText('Name *');
      expect(nameInput).toHaveValue('John Doe');

      const companyInput = screen.getByLabelText('Company');
      expect(companyInput).toHaveValue('Acme Corp');

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveValue('john@acme.com');

      const phoneInput = screen.getByLabelText('Phone');
      expect(phoneInput).toHaveValue('555-0101');
    });

    it('saving edit calls updateLead and refreshes list', async () => {
      storage.getLeads
        .mockReturnValueOnce(mockLeads)
        .mockReturnValueOnce([
          {
            ...mockLeads[0],
            name: 'John Updated',
            company: 'Updated Corp'
          },
          mockLeads[1],
          mockLeads[2]
        ]);

      renderLeadList();

      // Find and click edit button for John Doe
      const editButtons = screen.getAllByLabelText('Edit lead');
      const johnEditButton = editButtons[0];

      fireEvent.click(johnEditButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Edit Lead')).toBeInTheDocument();
      });

      // Update the name field
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Updated' } });

      // Update the company field
      const companyInput = screen.getByLabelText('Company');
      fireEvent.change(companyInput, { target: { value: 'Updated Corp' } });

      // Click Save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Verify updateLead was called
      await waitFor(() => {
        expect(storage.updateLead).toHaveBeenCalled();
      });

      // Verify the updateLead was called with merged data
      const updateCall = storage.updateLead.mock.calls[0][0];
      expect(updateCall).toMatchObject({
        id: 'lead-1',
        name: 'John Updated',
        company: 'Updated Corp'
      });

      // Verify getLeads was called again to refresh
      await waitFor(() => {
        expect(storage.getLeads).toHaveBeenCalledTimes(2);
      });
    });

    it('Edit button has aria-label="Edit lead"', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const editButtons = screen.getAllByLabelText('Edit lead');
      expect(editButtons.length).toBeGreaterThan(0);
      expect(editButtons[0]).toHaveAttribute('aria-label', 'Edit lead');
    });

    it('Delete button has aria-label="Delete lead"', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const deleteButtons = screen.getAllByLabelText('Delete lead');
      expect(deleteButtons.length).toBeGreaterThan(0);
      expect(deleteButtons[0]).toHaveAttribute('aria-label', 'Delete lead');
    });

    it('View button has aria-label="View lead"', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      const viewButtons = screen.getAllByLabelText('View lead');
      expect(viewButtons.length).toBeGreaterThan(0);
      expect(viewButtons[0]).toHaveAttribute('aria-label', 'View lead');
    });
  });

  describe('Integration with Utils', () => {
    it('uses isOverdue to determine row highlighting', () => {
      const testLeads = [
        {
          id: 'test-1',
          name: 'Test Lead',
          company: 'Test Co',
          email: 'test@test.com',
          phone: '555-0000',
          status: 'Contacted',
          nextFollowUpDate: '2024-01-01', // Definitely overdue
          notes: '',
          dateAdded: '2025-01-01T10:00:00.000Z'
        }
      ];

      storage.getLeads.mockReturnValue(testLeads);

      // Verify isOverdue returns true for this lead
      expect(isOverdue(testLeads[0])).toBe(true);

      const { container } = renderLeadList();

      // Row should have amber highlighting
      const overdueRow = container.querySelector('tr.bg-amber-50.border-l-4.border-amber-400');
      expect(overdueRow).toBeInTheDocument();
      expect(overdueRow.textContent).toContain('Test Lead');
    });

    it('uses formatDate to display dates', () => {
      storage.getLeads.mockReturnValue(mockLeads);

      renderLeadList();

      // Test formatDate utility
      expect(formatDate('2025-01-15')).toMatch(/Jan 15, 2025/);
      expect(formatDate('')).toBe('—');
      expect(formatDate(null)).toBe('—');

      // Verify dates are formatted in the table
      expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });
  });
});
