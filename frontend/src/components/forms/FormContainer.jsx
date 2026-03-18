/**
 * Form Container Component
 * Dynamically renders form components based on FormRegistry
 * Handles form lifecycle: selection, submission, cancellation
 */

import React from 'react';
import { getFormConfig, getFormComponent } from './FormRegistry';
import FormSelector from './FormSelector';

const FormContainer = ({ selectedFormId, onFormSelect, onFormSubmit, onFormCancel }) => {
  // If no form selected, show form selector
  if (!selectedFormId) {
    return <FormSelector onFormSelect={onFormSelect} />;
  }

  // Get form configuration
  const formConfig = getFormConfig(selectedFormId);

  if (!formConfig) {
    return (
      <div className="form-error-container">
        <h2>Form Not Found</h2>
        <p>The requested form "{selectedFormId}" could not be loaded.</p>
        <button onClick={() => onFormSelect(null)} className="button-primary">
          Back to Form Selection
        </button>
      </div>
    );
  }

  // Get the form component
  const FormComponent = formConfig.component;

  // Handle form submission
  const handleSubmit = async (response) => {
    if (onFormSubmit) {
      await onFormSubmit(response, selectedFormId);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    if (onFormCancel) {
      onFormCancel();
    } else {
      onFormSelect(null); // Default: go back to form selector
    }
  };

  return (
    <div className="form-container">
      <div className="form-breadcrumb">
        <button onClick={handleCancel} className="breadcrumb-back">
          ← Back to Forms
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{formConfig.name}</span>
      </div>

      <FormComponent onSuccess={handleSubmit} onCancel={handleCancel} />

      <style jsx>{`
        .form-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .form-breadcrumb {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .breadcrumb-back {
          padding: 8px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          transition: background 0.2s ease;
        }

        .breadcrumb-back:hover {
          background: #e2e8f0;
        }

        .breadcrumb-separator {
          color: #94a3b8;
        }

        .breadcrumb-current {
          color: #0f172a;
          font-weight: 600;
        }

        .form-error-container {
          padding: 48px;
          text-align: center;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .form-error-container h2 {
          font-size: 24px;
          color: #dc2626;
          margin-bottom: 12px;
        }

        .form-error-container p {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .button-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .form-breadcrumb {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default FormContainer;
