/**
 * Unit tests for LeadForm component
 * @module LeadForm.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadForm } from '../lead-form/LeadForm.jsx';
import { LEAD_STATUSES } from '../../lib/models.js';

// Mock the models module for createLead
vi.mock('../../lib/models.js', async () => {
  const actual = await vi.importActual('../../lib/models.js');
  return {
    ...actual,
    createLead: vi.fn((data) => ({
      id: 'test-id',
      ...data,
      dateAdded: new Date().toISOString()
    }))
  };
});

describe('LeadForm', () => {
  let mockOnClose;
  let mockOnSave;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSave = vi.fn();
  });

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(
        <LeadForm
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Lead')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Add Lead')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('shows all form fields', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Check for all input labels
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date added/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next follow-up/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();

      // Check for buttons
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows validation error when submitted with empty name', async () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('does not call onSave when validation fails', async () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('calls onSave with form data on valid submit', async () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const companyInput = screen.getByLabelText(/company/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(companyInput, { target: { value: 'Acme Corp' } });
      fireEvent.change(emailInput, { target: { value: 'john@acme.com' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('John Doe');
      expect(savedData.company).toBe('Acme Corp');
      expect(savedData.email).toBe('john@acme.com');
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Cancel clicked', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const backdrop = document.querySelector('.fixed.inset-0.bg-black');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when clicking inside modal content', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const modalContent = document.querySelector('.relative.bg-white');
      fireEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('pre-populates fields when initialData provided', () => {
      const initialData = {
        name: 'Jane Smith',
        company: 'Tech Inc',
        email: 'jane@techinc.com',
        phone: '555-1234',
        status: LEAD_STATUSES.CONTACTED,
        dateAdded: '2024-01-15T00:00:00.000Z',
        nextFollowUpDate: '2024-02-01T00:00:00.000Z',
        notes: 'Important client'
      };

      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialData={initialData}
        />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/company/i)).toHaveValue('Tech Inc');
      expect(screen.getByLabelText(/email/i)).toHaveValue('jane@techinc.com');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('555-1234');
      expect(screen.getByLabelText(/status/i)).toHaveValue(LEAD_STATUSES.CONTACTED);
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Important client');
    });

    it('title shows Edit Lead when initialData provided', () => {
      const initialData = {
        name: 'Jane Smith',
        company: 'Tech Inc'
      };

      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialData={initialData}
        />
      );

      expect(screen.getByText('Edit Lead')).toBeInTheDocument();
      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('clears validation errors when user starts typing', async () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Submit empty form to trigger validation error
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      // Start typing in name field
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'J' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });

    it('status dropdown includes all lead statuses', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const statusSelect = screen.getByLabelText(/status/i);
      const options = Array.from(statusSelect.querySelectorAll('option'));
      const optionValues = options.map(opt => opt.value);

      Object.values(LEAD_STATUSES).forEach(status => {
        expect(optionValues).toContain(status);
      });
    });

    it('date added field is read-only', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const dateAddedInput = screen.getByLabelText(/date added/i);
      expect(dateAddedInput).toHaveAttribute('readonly');
    });
  });

  describe('Close Button', () => {
    it('calls onClose when X button clicked', () => {
      render(
        <LeadForm
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
