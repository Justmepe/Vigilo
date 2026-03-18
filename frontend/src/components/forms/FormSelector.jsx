/**
 * Form Selector Component
 * Displays available forms grouped by category
 * Uses FormRegistry for dynamic form loading
 */

import React from 'react';
import { FORM_REGISTRY, getFormsByCategory } from './FormRegistry';

const FormSelector = ({ onFormSelect }) => {
  const formsByCategory = getFormsByCategory();

  return (
    <div className="form-selector-container">
      <h1 className="form-selector-title">New Assessment</h1>
      <p className="form-selector-subtitle">Select a form type to begin</p>

      {Object.entries(formsByCategory).map(([category, forms]) => (
        <div key={category} className="form-category-section">
          <h2 className="form-category-title">{category}</h2>
          <div className="form-selection-grid">
            {forms.map((form) => {
              const IconComponent = form.icon;
              return (
                <div
                  key={form.id}
                  className="form-card"
                  onClick={() => onFormSelect(form.id)}
                >
                  <div className="form-card-icon">
                    <IconComponent size={40} />
                  </div>
                  <h3>{form.name}</h3>
                  <p className="form-description">{form.description}</p>
                  <p className="form-sections">{form.sections} sections</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <style jsx>{`
        .form-selector-container {
          max-width: 1200px;
        }

        .form-selector-title {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .form-selector-subtitle {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 32px;
        }

        .form-category-section {
          margin-bottom: 48px;
        }

        .form-category-title {
          font-size: 20px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .form-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          text-align: center;
        }

        .form-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .form-card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
          margin-bottom: 20px;
        }

        .form-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .form-description {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .form-sections {
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .form-selection-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .form-card {
            padding: 20px;
          }

          .form-card-icon {
            width: 60px;
            height: 60px;
          }

          .form-selector-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default FormSelector;
