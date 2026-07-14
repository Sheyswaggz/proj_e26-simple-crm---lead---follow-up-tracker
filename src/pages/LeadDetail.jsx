import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLeadById, getFollowUpsByLeadId, updateLead } from '../lib/storage.js';
import { LEAD_STATUSES, FOLLOWUP_TYPES } from '../lib/models.js';
import { isOverdue, formatDate } from '../lib/utils.js';
import { StatusBadge } from '../components/status-badge/StatusBadge.jsx';
import { ArrowLeft, Phone, Mail, Building2, Calendar, PhoneCall, Users, Pencil, Trash2, Clock } from 'lucide-react';

/**
 * LeadDetail Component
 * Displays full lead information including contact details, status, notes,
 * next follow-up date, and complete follow-up history
 *
 * Features:
 * - Contact information display with clickable email/phone links
 * - Inline editable status dropdown
 * - Follow-up history in reverse chronological order
 * - Placeholder Edit/Delete buttons for future implementation
 */
export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);

  // Load lead and follow-ups on component mount and when id changes
  useEffect(() => {
    if (!id) {
      setLead(null);
      return;
    }

    // Load lead data
    const loadedLead = getLeadById(id);
    if (!loadedLead) {
      setLead(null);
      return;
    }
    setLead(loadedLead);

    // Load follow-ups for this lead
    const loadedFollowUps = getFollowUpsByLeadId(id);

    // Sort follow-ups by date descending (newest first)
    const sortedFollowUps = loadedFollowUps.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order
    });

    setFollowUps(sortedFollowUps);
  }, [id]);

  /**
   * Handles status change from the inline dropdown
   * Updates both localStorage and local state
   */
  const handleStatusChange = (newStatus) => {
    if (!lead) return;

    const updatedLead = { ...lead, status: newStatus };

    // Update in storage
    updateLead(updatedLead);

    // Update local state
    setLead(updatedLead);
  };

  /**
   * Returns the appropriate icon component based on follow-up type
   */
  const getFollowUpIcon = (type) => {
    switch (type) {
      case FOLLOWUP_TYPES.CALL:
        return PhoneCall;
      case FOLLOWUP_TYPES.EMAIL:
        return Mail;
      case FOLLOWUP_TYPES.MEETING:
        return Users;
      default:
        return PhoneCall;
    }
  };

  /**
   * Returns human-readable label for follow-up type
   */
  const getFollowUpTypeLabel = (type) => {
    switch (type) {
      case FOLLOWUP_TYPES.CALL:
        return 'Phone Call';
      case FOLLOWUP_TYPES.EMAIL:
        return 'Email';
      case FOLLOWUP_TYPES.MEETING:
        return 'Meeting';
      default:
        return type;
    }
  };

  // Not found state
  if (lead === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Leads</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-gray-600 mb-6">
            The lead you are looking for does not exist or has been deleted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Lead List
          </Link>
        </div>
      </div>
    );
  }

  // Main lead detail view
  return (
    <div className="space-y-6">
      {/* Top bar with back button, name, and action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Edit button - placeholder for TASK-007 */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            disabled
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>

          {/* Delete button - placeholder for TASK-007 */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors"
            disabled
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-base text-gray-900">{lead.name}</p>
              </div>

              {/* Company */}
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                  <p className="text-base text-gray-900">{lead.company || '—'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-base text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <p className="text-base text-gray-900">—</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-base text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <p className="text-base text-gray-900">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            {lead.notes ? (
              <p className="text-base text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            ) : (
              <p className="text-base text-gray-500 italic">No notes</p>
            )}
          </div>

          {/* Next Follow-Up Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Follow-Up</h2>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-base text-gray-900">
                  {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : '—'}
                </p>
              </div>
              {isOverdue(lead) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right column - sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline Status</h2>

            <div className="mb-3">
              <StatusBadge status={lead.status} />
            </div>

            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              aria-label="Change lead status"
            >
              {Object.values(LEAD_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Follow-Up History Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Follow-Up History</h2>
            </div>

            {followUps.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No follow-ups logged yet</p>
            ) : (
              <div className="space-y-4">
                {followUps.map((followUp) => {
                  const IconComponent = getFollowUpIcon(followUp.type);
                  return (
                    <div
                      key={followUp.id}
                      className="border-l-2 border-gray-200 pl-4 py-2"
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-900">
                              {getFollowUpTypeLabel(followUp.type)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(followUp.date)}
                            </span>
                          </div>
                          {followUp.note && (
                            <p className="text-sm text-gray-700">{followUp.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
