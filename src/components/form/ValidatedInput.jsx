import React from 'react';
import { getFieldClasses } from '../../utils/formValidation';

/**
 * Validated Input Component
 * Provides visual feedback for validation errors with red borders and error messages
 */
const ValidatedInput = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  containerClassName = '',
  showErrorIcon = true,
  ...props
}) => {
  const hasError = !!error;
  
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;
  
  const inputClasses = getFieldClasses(
    hasError,
    `${baseInputClasses} ${inputClassName}`
  );

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClasses} ${className}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        
        {hasError && showErrorIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 flex items-center space-x-1"
          role="alert"
        >
          <svg 
            className="h-4 w-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Validated Textarea Component
 */
export const ValidatedTextarea = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  containerClassName = '',
  showErrorIcon = true,
  ...props
}) => {
  const hasError = !!error;
  
  const baseTextareaClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition-colors duration-200 resize-vertical
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;
  
  const textareaClasses = getFieldClasses(
    hasError,
    `${baseTextareaClasses} ${className}`
  );

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={id || name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={textareaClasses}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        
        {hasError && showErrorIcon && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <svg 
              className="h-5 w-5 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 flex items-center space-x-1"
          role="alert"
        >
          <svg 
            className="h-4 w-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Validated Select Component
 */
export const ValidatedSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  options = [],
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  showErrorIcon = true,
  ...props
}) => {
  const hasError = !!error;
  
  const baseSelectClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;
  
  const selectClasses = getFieldClasses(
    hasError,
    `${baseSelectClasses} ${className}`
  );

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={id || name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={selectClasses}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={option.value || index} 
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>
        
        {hasError && showErrorIcon && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 flex items-center space-x-1"
          role="alert"
        >
          <svg 
            className="h-4 w-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Form Error Summary Component
 * Shows a summary of all form errors at the top
 */
export const FormErrorSummary = ({ errors, title = "Please fix the following errors:" }) => {
  const errorEntries = Object.entries(errors).filter(([, error]) => error);
  
  if (errorEntries.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {errorEntries.map(([fieldName, error]) => (
                <li key={fieldName}>
                  <button
                    type="button"
                    className="underline hover:text-red-900 text-left"
                    onClick={() => {
                      const element = document.getElementById(fieldName) || 
                        document.querySelector(`[name="${fieldName}"]`);
                      if (element) {
                        element.focus();
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    <strong>{fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {error}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatedInput; 