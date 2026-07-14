import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Users } from 'lucide-react';
import { EmptyState } from '../empty-state/EmptyState.jsx';

describe('EmptyState', () => {
  describe('Basic rendering', () => {
    it('renders title text', () => {
      render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      expect(screen.getByText('No leads found')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          subtitle="Start by creating your first lead"
        />
      );

      expect(screen.getByText('Start by creating your first lead')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      // Should only have the title heading
      const paragraphs = screen.queryAllByRole('paragraph');
      expect(paragraphs).toHaveLength(0);
    });
  });

  describe('Icon rendering', () => {
    it('renders the provided icon component', () => {
      const { container } = render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      // lucide-react icons render as SVG elements
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-12', 'h-12', 'text-gray-300');
    });
  });

  describe('Button rendering', () => {
    it('does not render button when onAction not provided', () => {
      render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('does not render button when actionLabel not provided', () => {
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          onAction={handleAction}
        />
      );

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('renders button with actionLabel when onAction provided', () => {
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          onAction={handleAction}
          actionLabel="Add Lead"
        />
      );

      const button = screen.getByRole('button', { name: 'Add Lead' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Add Lead');
    });
  });

  describe('Button interaction', () => {
    it('clicking button calls onAction', () => {
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          onAction={handleAction}
          actionLabel="Add Lead"
        />
      );

      const button = screen.getByRole('button', { name: 'Add Lead' });
      fireEvent.click(button);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('clicking button multiple times calls onAction multiple times', () => {
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          onAction={handleAction}
          actionLabel="Add Lead"
        />
      );

      const button = screen.getByRole('button', { name: 'Add Lead' });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component structure', () => {
    it('renders with correct container classes', () => {
      const { container } = render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-16',
        'px-4',
        'text-center'
      );
    });

    it('includes accessibility attributes', () => {
      const { container } = render(
        <EmptyState
          icon={Users}
          title="No leads found"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveAttribute('role', 'status');
      expect(wrapper).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge cases', () => {
    it('handles missing icon gracefully', () => {
      const { container } = render(
        <EmptyState
          icon={null}
          title="No leads found"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles missing title gracefully', () => {
      const { container } = render(
        <EmptyState
          icon={Users}
          title=""
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Full component with all props', () => {
    it('renders complete component with all props provided', () => {
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Users}
          title="No leads found"
          subtitle="Get started by adding your first lead"
          onAction={handleAction}
          actionLabel="Create Lead"
        />
      );

      // Verify all parts are present
      expect(screen.getByText('No leads found')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding your first lead')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Lead' })).toBeInTheDocument();

      // Verify icon is rendered
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
