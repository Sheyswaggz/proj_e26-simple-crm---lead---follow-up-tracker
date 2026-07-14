import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../status-badge/StatusBadge.jsx';

describe('StatusBadge', () => {
  describe('Status rendering', () => {
    it('renders New status with correct text and blue styling', () => {
      render(<StatusBadge status="New" />);
      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders Contacted status with correct text and yellow styling', () => {
      render(<StatusBadge status="Contacted" />);
      const badge = screen.getByText('Contacted');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders Qualified status with correct text and green styling', () => {
      render(<StatusBadge status="Qualified" />);
      const badge = screen.getByText('Qualified');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders Proposal Sent status with correct text and purple styling', () => {
      render(<StatusBadge status="Proposal Sent" />);
      const badge = screen.getByText('Proposal Sent');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('renders Won status with correct text and emerald styling', () => {
      render(<StatusBadge status="Won" />);
      const badge = screen.getByText('Won');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800');
    });

    it('renders Lost status with correct text and red styling', () => {
      render(<StatusBadge status="Lost" />);
      const badge = screen.getByText('Lost');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Unknown status handling', () => {
    it('renders unknown status with fallback gray styling', () => {
      render(<StatusBadge status="Unknown Status" />);
      const badge = screen.getByText('Unknown Status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Component structure', () => {
    it('renders as a span element', () => {
      render(<StatusBadge status="New" />);
      const badge = screen.getByText('New');
      expect(badge.tagName).toBe('SPAN');
    });

    it('includes base styling classes', () => {
      render(<StatusBadge status="New" />);
      const badge = screen.getByText('New');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'px-2.5',
        'py-0.5',
        'rounded-full',
        'text-xs',
        'font-medium'
      );
    });

    it('includes accessibility attributes', () => {
      render(<StatusBadge status="New" />);
      const badge = screen.getByText('New');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Status: New');
    });
  });

  describe('Edge cases', () => {
    it('handles null status gracefully', () => {
      const { container } = render(<StatusBadge status={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles undefined status gracefully', () => {
      const { container } = render(<StatusBadge status={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles empty string status', () => {
      const { container } = render(<StatusBadge status="" />);
      expect(container.firstChild).toBeNull();
    });
  });
});
