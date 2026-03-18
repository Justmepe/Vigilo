/**
 * Reusable Form Components and Utilities
 * Provides building blocks for all safety forms
 */

import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

/**
 * Form Section Component
 */
export const FormSection = ({ title, children, description }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
    <div className="bg-gray-50 rounded-lg p-4">{children}</div>
  </div>
);

/**
 * Form Field Component
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  options = [],
  rows = 4,
  disabled = false,
  maxLength,
  pattern,
  step
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded transition';
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500';
  const finalClasses = `${baseClasses} ${error ? errorClasses : normalClasses}`;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'select' ? (
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={finalClasses}
        >
          <option value="">-- Select {label} --</option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={finalClasses}
        />
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      ) : type === 'radio' ? (
        <div className="space-y-2">
          {options.map(option => (
            <label key={option.value || option} className="flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value || option}
                checked={value === (option.value || option)}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                {option.label || option}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
          step={step}
          className={finalClasses}
        />
      )}

      {maxLength && (
        <p className="text-xs text-gray-500 mt-1">
          {value?.length || 0}/{maxLength}
        </p>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Checkbox Array Component
 */
export const CheckboxArray = ({
  label,
  name,
  items,
  values = [],
  onChange,
  error,
  required = false
}) => {
  const handleCheck = (item) => {
    const newValues = values.includes(item)
      ? values.filter(v => v !== item)
      : [...values, item];
    onChange({ target: { name, value: newValues } });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {items.map(item => (
          <label key={item.id || item} className="flex items-center">
            <input
              type="checkbox"
              checked={values.includes(item.id || item)}
              onChange={() => handleCheck(item.id || item)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {item.label || item}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Form Button Group
 */
export const FormButtonGroup = ({ onSubmit, onCancel, isLoading = false, submitLabel = 'Submit' }) => (
  <div className="flex gap-3 mt-6">
    <button
      onClick={onSubmit}
      disabled={isLoading}
      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Submitting...
        </>
      ) : (
        <>
          <Check size={18} />
          {submitLabel}
        </>
      )}
    </button>
    {onCancel && (
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition"
      >
        Cancel
      </button>
    )}
  </div>
);

/**
 * Form Divider
 */
export const FormDivider = ({ label }) => (
  <div className="my-6 flex items-center">
    <div className="flex-1 border-t border-gray-300" />
    {label && <span className="px-4 text-sm text-gray-600">{label}</span>}
    <div className="flex-1 border-t border-gray-300" />
  </div>
);

/**
 * Alert/Message Box
 */
export const FormAlert = ({ type = 'info', title, message, onDismiss }) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconMap = { info: 'ⓘ', success: '✓', warning: '⚠', error: '✕' };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${typeStyles[type]}`}>
      <span className="mr-2">{iconMap[type]}</span>
      <div className="flex items-start justify-between">
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xl leading-none opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Form Indicator
 */
export const FormIndicator = ({ currentStep, totalSteps }) => (
  <div className="mb-6">
    <div className="flex justify-between text-sm text-gray-600 mb-2">
      <span>Step {currentStep} of {totalSteps}</span>
      <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

export default {
  FormSection,
  FormField,
  CheckboxArray,
  FormButtonGroup,
  FormDivider,
  FormAlert,
  FormIndicator
};
