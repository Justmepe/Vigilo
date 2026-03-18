/* eslint-disable no-unused-vars, react/function-component-definition, react-hooks/exhaustive-deps */
/**
 * Form Preview Modal
 * Displays a formatted preview of form data before submission
 * Allows user to confirm submission or go back to edit
 */

import React from 'react';
import { CheckCircle, Edit2, X, Loader } from 'lucide-react';

export const FormPreviewModal = ({
  isOpen,
  formTitle,
  formData,
  onConfirm,
  onEdit,
  onClose,
  isSubmitting = false,
  submitButtonText = 'Confirm & Submit'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={28} className="text-white" />
            <h2 className="text-2xl font-bold text-white">Preview & Confirm</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto bg-gray-50">
          <p className="text-gray-700 mb-4">
            Please review the information below before submitting your <strong>{formTitle}</strong>
          </p>
          <FormPreviewDisplay data={formData} />
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex gap-3 justify-end rounded-b-lg border-t">
          <button
            onClick={onEdit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded transition"
          >
            <Edit2 size={18} />
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition"
          >
            {isSubmitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Preview Display
 * Renders form data in a formatted, read-only way
 */
export const FormPreviewDisplay = ({ data }) => {
  const renderValue = (value) => {
    if (!value && value !== 0 && value !== false) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }
    if (typeof value === 'boolean') {
      return value ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-600 font-medium">No</span>;
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : <span className="text-gray-400 italic">None</span>;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  const importantFields = [
    'facility',
    'incidentDate',
    'incidentTime',
    'description',
    'severity',
    'employeeName',
    'employeeId',
    'department',
    'injuryType',
    'bodyPartAffected',
    'medicalAttention',
    'treatmentAtWork',
    'witnesses',
    'immediateActor',
    'preventiveMeasures'
  ];

  const groupedData = {};
  const filteredData = {};

  // Filter out technical fields and photos
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'photos' && key !== 'userId') {
      filteredData[key] = value;
    }
  });

  return (
    <div className="space-y-4">
      {/* Important fields at top */}
      {Object.entries(filteredData).map(([key, value]) => {
        if (importantFields.includes(key)) {
          return (
            <div key={key} className="bg-white p-3 rounded border border-blue-200">
              <dt className="font-semibold text-gray-800 text-sm">{formatLabel(key)}</dt>
              <dd className="text-gray-700 mt-1">{renderValue(value)}</dd>
            </div>
          );
        }
        return null;
      })}

      {/* Other fields */}
      <div className="bg-white rounded border">
        <details className="p-3">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            Additional Details
          </summary>
          <div className="space-y-2 mt-3 pt-3 border-t">
            {Object.entries(filteredData).map(([key, value]) => {
              if (!importantFields.includes(key)) {
                return (
                  <div key={key} className="pb-2 border-b last:border-b-0">
                    <dt className="font-semibold text-gray-700 text-sm">{formatLabel(key)}</dt>
                    <dd className="text-gray-600 mt-1 break-words">{renderValue(value)}</dd>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </details>
      </div>
    </div>
  );
};

export default FormPreviewModal;
