/**
 * StatusBadge - Color-coded pill badge for lead pipeline statuses
 * @module StatusBadge
 */

/**
 * Status color mapping for Tailwind classes
 * Maps each lead status to appropriate background and text colors
 * @constant {Object.<string, string>}
 */
const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Proposal Sent': 'bg-purple-100 text-purple-800',
  'Won': 'bg-emerald-100 text-emerald-800',
  'Lost': 'bg-red-100 text-red-800'
};

/**
 * Default fallback color for unknown statuses
 * @constant {string}
 */
const DEFAULT_COLOR = 'bg-gray-100 text-gray-800';

/**
 * StatusBadge Component
 * Renders a color-coded pill badge for lead status
 *
 * @param {Object} props - Component props
 * @param {string} props.status - The status string to display
 * @returns {JSX.Element} Rendered status badge
 *
 * @example
 * <StatusBadge status="New" />
 * <StatusBadge status="Won" />
 */
export function StatusBadge({ status }) {
  // Input validation - handle null/undefined status
  if (!status) {
    console.warn('StatusBadge: status prop is required');
    return null;
  }

  // Get status-specific colors or fall back to default
  const colorClasses = STATUS_COLORS[status] || DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
