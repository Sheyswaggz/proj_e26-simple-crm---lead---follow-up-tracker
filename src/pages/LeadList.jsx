/**
 * LeadList - Main Lead List page with search, sort, and filtering
 * @module LeadList
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, deleteLead, saveLead } from '../lib/storage.js';
import { createLead } from '../lib/models.js';
import { isOverdue, formatDate } from '../lib/utils.js';
import { StatusBadge } from '../components/status-badge/StatusBadge.jsx';
import { EmptyState } from '../components/empty-state/EmptyState.jsx';
import { LeadForm } from '../components/lead-form/LeadForm.jsx';
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react';

/**
 * LeadList Component
 * Primary screen displaying all leads in a sortable, searchable table
 * Features:
 * - Real-time search filtering by name or company
 * - Sortable columns (name, company, status, dateAdded, nextFollowUpDate)
 * - Visual highlighting for overdue leads (amber background)
 * - Action buttons for view, edit, and delete operations
 * - Empty states for no leads or no search results
 *
 * @returns {JSX.Element} Rendered lead list page
 */
export default function LeadList() {
  const navigate = useNavigate();

  // State management
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load leads from storage on mount
  useEffect(() => {
    setLeads(getLeads());
  }, []);

  /**
   * Filters and sorts leads based on current search and sort settings
   * Memoized to prevent unnecessary recalculations
   */
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => {
        const nameMatch = lead.name.toLowerCase().includes(query);
        const companyMatch = lead.company.toLowerCase().includes(query);
        return nameMatch || companyMatch;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle empty values
      if (!aValue) aValue = '';
      if (!bValue) bValue = '';

      // String comparison (works for dates in ISO format and text)
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [leads, searchQuery, sortField, sortDirection]);

  /**
   * Handles column header click for sorting
   * Toggles direction if same field, sets to 'asc' for new field
   *
   * @param {string} field - Field name to sort by
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction for same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field: start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Handles lead deletion with confirmation
   * Refreshes the leads list after successful deletion
   *
   * @param {string} id - Lead ID to delete
   */
  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this lead and all follow-ups?');
    if (confirmed) {
      deleteLead(id);
      setLeads(getLeads());
    }
  };

  /**
   * Handles adding a new lead
   * Creates lead from form data, saves to localStorage, and refreshes list
   *
   * @param {Object} formData - Form data from LeadForm component
   */
  const handleAddLead = (formData) => {
    saveLead(createLead(formData));
    setLeads(getLeads());
    setIsAddModalOpen(false);
  };

  /**
   * Renders sort indicator icon for column headers
   *
   * @param {string} field - Field name to check
   * @returns {JSX.Element} Icon component
   */
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
      : <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />;
  };

  // Empty state: no leads at all
  if (leads.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Users}
          title="No leads yet"
          subtitle="Add your first lead to get started"
          onAction={() => setIsAddModalOpen(true)}
          actionLabel="Add Lead"
        />
      </div>
    );
  }

  // Empty state: no search results
  if (filteredAndSortedLeads.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search leads"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </button>
        </div>

        <EmptyState
          icon={Search}
          title="No results found"
          subtitle="Try a different search term"
        />
      </div>
    );
  }

  // Main render: table with leads
  return (
    <div className="space-y-4">
      {/* Top bar: search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search leads"
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
          type="button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Name column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Company column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">
                  Company
                  {renderSortIcon('company')}
                </div>
              </th>

              {/* Status column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Date Added column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('dateAdded')}
              >
                <div className="flex items-center">
                  Date Added
                  {renderSortIcon('dateAdded')}
                </div>
              </th>

              {/* Next Follow-Up column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('nextFollowUpDate')}
              >
                <div className="flex items-center">
                  Next Follow-Up
                  {renderSortIcon('nextFollowUpDate')}
                </div>
              </th>

              {/* Actions column */}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedLeads.map((lead) => {
              const overdueStatus = isOverdue(lead);
              const rowClassName = overdueStatus
                ? 'bg-amber-50 border-l-4 border-amber-400'
                : '';

              return (
                <tr key={lead.id} className={rowClassName}>
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.company}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Date Added */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(lead.dateAdded)}
                    </div>
                  </td>

                  {/* Next Follow-Up */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${overdueStatus ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {formatDate(lead.nextFollowUpDate)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View button */}
                      <button
                        onClick={() => navigate(`/lead/${lead.id}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        aria-label={`View ${lead.name}`}
                        title="View details"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => navigate(`/lead/${lead.id}?edit=true`)}
                        className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50"
                        aria-label={`Edit ${lead.name}`}
                        title="Edit lead"
                        type="button"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        aria-label={`Delete ${lead.name}`}
                        title="Delete lead"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lead Form Modal */}
      <LeadForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLead}
      />
    </div>
  );
}
