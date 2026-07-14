/**
 * EmptyState - Centered empty state component for zero-data scenarios
 * @module EmptyState
 */

/**
 * EmptyState Component
 * Displays a centered layout with an icon, title, subtitle, and optional CTA button
 * Used for scenarios like no leads, no search results, or empty collections
 *
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.icon - Lucide React icon component
 * @param {string} props.title - Main heading text
 * @param {string} [props.subtitle] - Optional subtext
 * @param {Function} [props.onAction] - Optional click handler for CTA button
 * @param {string} [props.actionLabel] - Optional label for CTA button
 * @returns {JSX.Element} Rendered empty state
 *
 * @example
 * import { Users } from 'lucide-react';
 *
 * <EmptyState
 *   icon={Users}
 *   title="No leads yet"
 *   subtitle="Start by creating your first lead"
 *   onAction={() => navigate('/create')}
 *   actionLabel="Add Lead"
 * />
 */
export function EmptyState({ icon: Icon, title, subtitle, onAction, actionLabel }) {
  // Input validation
  if (!Icon) {
    console.error('EmptyState: icon prop is required');
    return null;
  }

  if (!title) {
    console.error('EmptyState: title prop is required');
    return null;
  }

  // Validate that if onAction is provided, actionLabel must also be provided
  if (onAction && !actionLabel) {
    console.warn('EmptyState: actionLabel should be provided when onAction is specified');
  }

  // Only render button if both onAction and actionLabel are provided
  const shouldShowButton = onAction && actionLabel;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <Icon
        className="w-12 h-12 text-gray-300 mb-4"
        aria-hidden="true"
      />

      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-500 mb-4">
          {subtitle}
        </p>
      )}

      {shouldShowButton && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
