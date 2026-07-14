import { Link } from 'react-router-dom';

/**
 * AppLayout - Shared layout wrapper with sticky header and main content area
 * @module AppLayout
 */

/**
 * AppLayout Component
 * Provides a consistent layout structure with a sticky top header
 * and a main content area. Used as a wrapper for all pages.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render inside the layout
 * @returns {JSX.Element} Rendered layout with header and main content
 *
 * @example
 * <AppLayout>
 *   <LeadList />
 * </AppLayout>
 */
export function AppLayout({ children }) {
  // Input validation
  if (!children) {
    console.warn('AppLayout: children prop is recommended');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 tracking-tight hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Simple CRM
          </Link>
          <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
            Lead & Follow-Up Tracker
          </span>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
