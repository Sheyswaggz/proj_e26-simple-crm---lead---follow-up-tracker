/**
 * LeadForm - Modal component for creating and editing leads
 * @module LeadForm
 */

import { useState, useEffect, useRef } from 'react';
import { LEAD_STATUSES } from '../../lib/models.js';
import { X } from 'lucide-react';

/**
 * LeadForm Component
 * Modal form for creating and editing leads with validation
 * Features:
 * - Controlled form inputs for all lead fields
 * - Required field validation (name)
 * - Auto-focus on first input when opened
 * - Escape key to close
 * - Click outside (backdrop) to close
 * - Edit mode when initialData is provided
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {Function} props.onSave - Callback when form is submitted (receives formData)
 * @param {Object} [props.initialData] - Pre-populated data for edit mode
 * @returns {JSX.Element|null} Rendered modal or null if not open
 */
export function LeadForm({ isOpen, onClose, onSave, initialData }) {
  const firstInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: LEAD_STATUSES.NEW,
    dateAdded: new Date().toISOString().split('T')[0],
    nextFollowUpDate: '',
    notes: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Opening: reset to initialData or defaults
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          company: initialData.company || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          status: initialData.status || LEAD_STATUSES.NEW,
          dateAdded: initialData.dateAdded
            ? new Date(initialData.dateAdded).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          nextFollowUpDate: initialData.nextFollowUpDate
            ? new Date(initialData.nextFollowUpDate).toISOString().split('T')[0]
            : '',
          notes: initialData.notes || ''
        });
      } else {
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          status: LEAD_STATUSES.NEW,
          dateAdded: new Date().toISOString().split('T')[0],
          nextFollowUpDate: '',
          notes: ''
        });
      }
      setErrors({});
    } else {
      // Closing: clear errors
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Validates form data
   * Currently validates:
   * - name is required (non-empty after trim)
   *
   * @returns {Object} errors object with field names as keys
   */
  const validate = () => {
    const validationErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      validationErrors.name = 'Name is required';
    }

    return validationErrors;
  };

  /**
   * Handles form submission
   * Validates form, calls onSave with formData if valid, then closes modal
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  /**
   * Handles input field changes
   *
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Don't render if modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container - centers the modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal card */}
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Lead' : 'Add Lead'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Name field (required) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Company field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Phone field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Status field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.values(LEAD_STATUSES).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Added field (read-only) */}
              <div>
                <label htmlFor="dateAdded" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Added
                </label>
                <input
                  type="text"
                  id="dateAdded"
                  name="dateAdded"
                  value={formData.dateAdded}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
                />
              </div>

              {/* Next Follow-Up field */}
              <div>
                <label htmlFor="nextFollowUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Next Follow-Up
                </label>
                <input
                  type="date"
                  id="nextFollowUpDate"
                  name="nextFollowUpDate"
                  value={formData.nextFollowUpDate}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Notes field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
