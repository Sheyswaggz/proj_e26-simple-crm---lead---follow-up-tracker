/**
 * Unit tests for FollowUpForm component
 * @module FollowUpForm.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FollowUpForm } from '../follow-up-form/FollowUpForm.jsx';
import { FOLLOWUP_TYPES } from '../../lib/models.js';

// Mock the storage module
vi.mock('../../lib/storage.js', () => ({
  saveFollowUp: vi.fn((followUp) => followUp)
}));

// Mock the models module partially
vi.mock('../../lib/models.js', async () => {
  const actual = await vi.importActual('../../lib/models.js');
  return {
    ...actual,
    FOLLOWUP_TYPES: actual.FOLLOWUP_TYPES,
    createFollowUp: vi.fn((data) => ({
      id: 'test-followup-id',
      ...data
    }))
  };
});

describe('FollowUpForm', () => {
  let mockOnSave;
  const testLeadId = 'test-lead-123';

  beforeEach(() => {
    mockOnSave = vi.fn();
  });

  describe('Rendering', () => {
    it('renders date, type, and note fields', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Check for form fields
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/note/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /add follow-up/i })).toBeInTheDocument();
    });

    it('renders Log Follow-Up heading', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      expect(screen.getByText('Log Follow-Up')).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('date defaults to today', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const dateInput = screen.getByLabelText(/date/i);
      const today = new Date().toISOString().split('T')[0];

      expect(dateInput).toHaveValue(today);
    });

    it('type defaults to call', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const typeSelect = screen.getByLabelText(/type/i);

      expect(typeSelect).toHaveValue('call');
    });

    it('note defaults to empty', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const noteTextarea = screen.getByLabelText(/note/i);

      expect(noteTextarea).toHaveValue('');
    });
  });

  describe('Type Options', () => {
    it('all three type options are in the select', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const typeSelect = screen.getByLabelText(/type/i);
      const options = Array.from(typeSelect.querySelectorAll('option'));
      const optionValues = options.map(opt => opt.value);

      expect(optionValues).toContain('call');
      expect(optionValues).toContain('email');
      expect(optionValues).toContain('meeting');
      expect(options).toHaveLength(3);
    });

    it('type options have correct labels', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      expect(screen.getByRole('option', { name: /call/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /meeting/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error when note is empty on submit', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/note is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when note is only whitespace', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const noteTextarea = screen.getByLabelText(/note/i);
      fireEvent.change(noteTextarea, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/note is required/i)).toBeInTheDocument();
      });
    });

    it('does not call onSave when validation fails', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/note is required/i)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('clears error when user starts typing', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Submit empty form to trigger error
      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/note is required/i)).toBeInTheDocument();
      });

      // Type in note field
      const noteTextarea = screen.getByLabelText(/note/i);
      fireEvent.change(noteTextarea, { target: { value: 'A' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/note is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Valid Submission', () => {
    it('calls saveFollowUp and onSave on valid submit', async () => {
      const { saveFollowUp } = await import('../../lib/storage.js');
      const { createFollowUp } = await import('../../lib/models.js');

      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Fill in form
      const dateInput = screen.getByLabelText(/date/i);
      const typeSelect = screen.getByLabelText(/type/i);
      const noteTextarea = screen.getByLabelText(/note/i);

      fireEvent.change(dateInput, { target: { value: '2024-02-15' } });
      fireEvent.change(typeSelect, { target: { value: 'email' } });
      fireEvent.change(noteTextarea, { target: { value: 'Follow-up email sent' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createFollowUp).toHaveBeenCalled();
        expect(saveFollowUp).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('passes correct data to createFollowUp', async () => {
      const { createFollowUp } = await import('../../lib/models.js');

      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Fill in form
      const dateInput = screen.getByLabelText(/date/i);
      const typeSelect = screen.getByLabelText(/type/i);
      const noteTextarea = screen.getByLabelText(/note/i);

      fireEvent.change(dateInput, { target: { value: '2024-02-15' } });
      fireEvent.change(typeSelect, { target: { value: 'meeting' } });
      fireEvent.change(noteTextarea, { target: { value: 'Client meeting scheduled' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createFollowUp).toHaveBeenCalledWith(
          expect.objectContaining({
            leadId: testLeadId,
            type: 'meeting',
            note: 'Client meeting scheduled'
          })
        );
      });
    });
  });

  describe('Form Reset', () => {
    it('form resets after successful submit', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Fill in form
      const dateInput = screen.getByLabelText(/date/i);
      const typeSelect = screen.getByLabelText(/type/i);
      const noteTextarea = screen.getByLabelText(/note/i);

      fireEvent.change(dateInput, { target: { value: '2024-02-15' } });
      fireEvent.change(typeSelect, { target: { value: 'email' } });
      fireEvent.change(noteTextarea, { target: { value: 'Test note' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Check form is reset
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput).toHaveValue(today);
      expect(typeSelect).toHaveValue('call');
      expect(noteTextarea).toHaveValue('');
    });

    it('errors are cleared after successful submit', async () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      // Submit empty form to trigger error
      const submitButton = screen.getByRole('button', { name: /add follow-up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/note is required/i)).toBeInTheDocument();
      });

      // Fill in note and submit
      const noteTextarea = screen.getByLabelText(/note/i);
      fireEvent.change(noteTextarea, { target: { value: 'Valid note' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Error should be cleared
      expect(screen.queryByText(/note is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Placeholder Text', () => {
    it('note textarea has placeholder', () => {
      render(<FollowUpForm leadId={testLeadId} onSave={mockOnSave} />);

      const noteTextarea = screen.getByLabelText(/note/i);

      expect(noteTextarea).toHaveAttribute('placeholder', 'What happened or was agreed...');
    });
  });
});
