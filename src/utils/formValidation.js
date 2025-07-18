import React from 'react';

/**
 * Enhanced Form Validation Utility
 * Provides precise field-level validation with specific error messages
 */

export const ValidationTypes = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  NUMERIC: 'numeric',
  POSITIVE_NUMBER: 'positiveNumber',
  ZIP_CODE: 'zipCode',
  VEHICLE_NUMBER: 'vehicleNumber',
  NIC: 'nic',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  URL: 'url',
  DATE: 'date',
  FUTURE_DATE: 'futureDate',
  BUSINESS_REGISTRATION: 'businessRegistration',
  LICENSE_NUMBER: 'licenseNumber',
  TAX_ID: 'taxId'
};

export const ValidationRules = {
  [ValidationTypes.REQUIRED]: {
    test: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
    message: 'This field is required'
  },
  
  [ValidationTypes.EMAIL]: {
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  
  [ValidationTypes.PHONE]: {
    test: (value) => /^[0-9]{10}$/.test(value.replace(/\D/g, '')),
    message: 'Please enter a valid 10-digit phone number'
  },
  
  [ValidationTypes.MIN_LENGTH]: {
    test: (value, minLength) => value && value.toString().length >= minLength,
    message: (minLength) => `Must be at least ${minLength} characters long`
  },
  
  [ValidationTypes.MAX_LENGTH]: {
    test: (value, maxLength) => !value || value.toString().length <= maxLength,
    message: (maxLength) => `Must not exceed ${maxLength} characters`
  },
  
  [ValidationTypes.NUMERIC]: {
    test: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
    message: 'Please enter a valid number'
  },
  
  [ValidationTypes.POSITIVE_NUMBER]: {
    test: (value) => !isNaN(value) && parseFloat(value) > 0,
    message: 'Please enter a positive number'
  },
  
  [ValidationTypes.ZIP_CODE]: {
    test: (value) => /^[0-9]{5}(-[0-9]{4})?$/.test(value),
    message: 'Please enter a valid zip code'
  },
  
  [ValidationTypes.VEHICLE_NUMBER]: {
    test: (value) => /^[A-Z]{3}-\d{4}$|^\d{2}-\d{4}$|^[A-Z]{2}-\d{4}$|^\d{1}-\d{4}$/.test(value),
    message: 'Please enter a valid vehicle number (e.g., ABC-1234)'
  },
  
  [ValidationTypes.NIC]: {
    test: (value) => /^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value),
    message: 'Please enter a valid NIC number'
  },
  
  [ValidationTypes.PASSWORD]: {
    test: (value) => value && value.length >= 6,
    message: 'Password must be at least 6 characters long'
  },
  
  [ValidationTypes.CONFIRM_PASSWORD]: {
    test: (value, originalPassword) => value === originalPassword,
    message: 'Passwords do not match'
  },
  
  [ValidationTypes.URL]: {
    test: (value) => !value || /^https?:\/\/.+\..+/.test(value),
    message: 'Please enter a valid URL'
  },
  
  [ValidationTypes.DATE]: {
    test: (value) => value && !isNaN(Date.parse(value)),
    message: 'Please enter a valid date'
  },
  
  [ValidationTypes.FUTURE_DATE]: {
    test: (value) => value && new Date(value) > new Date(),
    message: 'Date must be in the future'
  },
  
  [ValidationTypes.BUSINESS_REGISTRATION]: {
    test: (value) => value && value.length >= 5,
    message: 'Please enter a valid business registration number'
  },
  
  [ValidationTypes.LICENSE_NUMBER]: {
    test: (value) => value && value.length >= 3,
    message: 'Please enter a valid license number'
  },
  
  [ValidationTypes.TAX_ID]: {
    test: (value) => value && /^[0-9]{9,12}$/.test(value),
    message: 'Please enter a valid tax ID'
  }
};

/**
 * Validates a single field
 * @param {any} value - The field value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    const { type, param, customMessage } = rule;
    const validationRule = ValidationRules[type];
    
    if (!validationRule) {
      console.warn(`Unknown validation type: ${type}`);
      continue;
    }
    
    const isValid = param !== undefined 
      ? validationRule.test(value, param)
      : validationRule.test(value);
    
    if (!isValid) {
      const message = customMessage || 
        (typeof validationRule.message === 'function' 
          ? validationRule.message(param)
          : validationRule.message);
      
      return { isValid: false, error: message };
    }
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates an entire form
 * @param {Object} formData - Object containing form field values
 * @param {Object} validationSchema - Object defining validation rules for each field
 * @returns {Object} - { isValid: boolean, errors: Object, firstErrorField: string }
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let firstErrorField = null;
  
  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldRules = validationSchema[fieldName];
    
    const { isValid, error } = validateField(fieldValue, fieldRules);
    
    if (!isValid) {
      errors[fieldName] = error;
      if (!firstErrorField) {
        firstErrorField = fieldName;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField
  };
};

/**
 * Creates validation schema for common form patterns
 */
export const CommonSchemas = {
  userRegistration: {
    name: [{ type: ValidationTypes.REQUIRED }],
    email: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    phone: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PHONE }
    ],
    password: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PASSWORD }
    ]
  },
  
  hotelDetails: {
    name: [{ type: ValidationTypes.REQUIRED }],
    title: [{ type: ValidationTypes.REQUIRED }],
    type: [{ type: ValidationTypes.REQUIRED }],
    city: [{ type: ValidationTypes.REQUIRED }],
    province: [{ type: ValidationTypes.REQUIRED }],
    address: [{ type: ValidationTypes.REQUIRED }],
    zip: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.ZIP_CODE }
    ],
    contactName: [{ type: ValidationTypes.REQUIRED }],
    contactNo: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PHONE }
    ],
    description: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, param: 20 }
    ],
    cheapestPrice: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.POSITIVE_NUMBER }
    ],
    rating: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.NUMERIC }
    ]
  },
  
  serviceProviderRequest: {
    firstName: [{ type: ValidationTypes.REQUIRED }],
    lastName: [{ type: ValidationTypes.REQUIRED }],
    email: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    phone: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PHONE }
    ],
    businessName: [{ type: ValidationTypes.REQUIRED }],
    businessAddress: [{ type: ValidationTypes.REQUIRED }],
    businessCity: [{ type: ValidationTypes.REQUIRED }],
    businessState: [{ type: ValidationTypes.REQUIRED }],
    businessZip: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.ZIP_CODE }
    ],
    businessPhone: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PHONE }
    ],
    businessEmail: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    registrationNumber: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.BUSINESS_REGISTRATION }
    ],
    licenseNumber: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.LICENSE_NUMBER }
    ],
    taxId: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.TAX_ID }
    ],
    serviceDetails: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, param: 50 }
    ],
    experience: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.POSITIVE_NUMBER }
    ]
  },
  
  vehicleDetails: {
    ownerName: [{ type: ValidationTypes.REQUIRED }],
    brandName: [{ type: ValidationTypes.REQUIRED }],
    model: [{ type: ValidationTypes.REQUIRED }],
    vehicleType: [{ type: ValidationTypes.REQUIRED }],
    vehicleNumber: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.VEHICLE_NUMBER }
    ],
    numberOfSeats: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.POSITIVE_NUMBER }
    ],
    rentPrice: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.POSITIVE_NUMBER }
    ],
    description: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, param: 20 }
    ],
    location: [{ type: ValidationTypes.REQUIRED }]
  }
};

/**
 * Helper function to generate CSS classes for field validation state
 * @param {boolean} hasError - Whether the field has an error
 * @param {string} baseClasses - Base CSS classes
 * @returns {string} - Combined CSS classes
 */
export const getFieldClasses = (hasError, baseClasses = '') => {
  const errorClasses = hasError 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  return `${baseClasses} ${errorClasses}`.trim();
};

/**
 * Helper function to focus on the first error field
 * @param {string} fieldName - Name of the field to focus
 */
export const focusOnField = (fieldName) => {
  const element = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * Custom hook for form validation
 * @param {Object} initialData - Initial form data
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} - Form utilities and state
 */
export const useFormValidation = (initialData, validationSchema) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  
  const validateSingleField = (fieldName, value) => {
    if (validationSchema[fieldName]) {
      const { isValid, error } = validateField(value, validationSchema[fieldName]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: isValid ? null : error
      }));
      return isValid;
    }
    return true;
  };
  
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (touched[fieldName]) {
      validateSingleField(fieldName, value);
    }
  };
  
  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateSingleField(fieldName, formData[fieldName]);
  };
  
  const validateForm = () => {
    const validation = validateForm(formData, validationSchema);
    setErrors(validation.errors);
    setTouched(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    
    if (!validation.isValid && validation.firstErrorField) {
      focusOnField(validation.firstErrorField);
    }
    
    return validation;
  };
  
  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };
  
  return {
    formData,
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    isFieldInvalid: (fieldName) => touched[fieldName] && !!errors[fieldName],
    getFieldError: (fieldName) => touched[fieldName] ? errors[fieldName] : null
  };
}; 