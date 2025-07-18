# Enhanced Form Validation System

This enhanced form validation system provides precise field-level validation with visual feedback, including red borders and specific error messages for each field.

## Features

✅ **Precise Field-Level Validation** - Know exactly which field has what error  
✅ **Visual Error Indicators** - Red borders and error icons for invalid fields  
✅ **Specific Error Messages** - Clear, actionable error messages  
✅ **Error Summary Component** - Overview of all errors with clickable navigation  
✅ **Auto-Focus on Errors** - Automatically scroll to the first error field  
✅ **Real-time Validation** - Validate fields as users type or on blur  
✅ **Pre-built Validation Rules** - Common patterns like email, phone, etc.  
✅ **Reusable Components** - Drop-in replacements for standard inputs  

## Quick Start

### 1. Import the Validation Components

```jsx
import ValidatedInput, { 
  ValidatedTextarea, 
  ValidatedSelect, 
  FormErrorSummary 
} from '../components/form/ValidatedInput';

import { 
  validateForm, 
  validateField, 
  ValidationTypes, 
  CommonSchemas 
} from '../utils/formValidation';
```

### 2. Basic Usage Example

```jsx
const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = {
    name: [{ type: ValidationTypes.REQUIRED }],
    email: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    phone: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PHONE }
    ]
  };

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Validate field on blur
    if (validationSchema[field]) {
      const { isValid, error } = validateField(formData[field], validationSchema[field]);
      if (!isValid) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleSubmit = () => {
    const validation = validateForm(formData, validationSchema);
    setErrors(validation.errors);
    
    if (validation.isValid) {
      // Submit form
      console.log('Form is valid!', formData);
    } else {
      // Focus on first error
      focusOnField(validation.firstErrorField);
    }
  };

  const getFieldError = (field) => touched[field] ? errors[field] : null;

  return (
    <form onSubmit={handleSubmit}>
      <FormErrorSummary errors={errors} />
      
      <ValidatedInput
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleInputChange('name')}
        onBlur={() => handleBlur('name')}
        error={getFieldError('name')}
        required
        placeholder="Enter your full name"
      />

      <ValidatedInput
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleInputChange('email')}
        onBlur={() => handleBlur('email')}
        error={getFieldError('email')}
        required
        placeholder="Enter your email"
      />

      <ValidatedInput
        name="phone"
        type="tel"
        label="Phone Number"
        value={formData.phone}
        onChange={handleInputChange('phone')}
        onBlur={() => handleBlur('phone')}
        error={getFieldError('phone')}
        required
        placeholder="Enter your phone number"
      />

      <button type="submit">Submit</button>
    </form>
  );
};
```

## Validation Rules

### Available Validation Types

| Type | Description | Example |
|------|-------------|---------|
| `REQUIRED` | Field must not be empty | `[{ type: ValidationTypes.REQUIRED }]` |
| `EMAIL` | Valid email format | `[{ type: ValidationTypes.EMAIL }]` |
| `PHONE` | 10-digit phone number | `[{ type: ValidationTypes.PHONE }]` |
| `MIN_LENGTH` | Minimum character length | `[{ type: ValidationTypes.MIN_LENGTH, param: 5 }]` |
| `MAX_LENGTH` | Maximum character length | `[{ type: ValidationTypes.MAX_LENGTH, param: 100 }]` |
| `NUMERIC` | Must be a number | `[{ type: ValidationTypes.NUMERIC }]` |
| `POSITIVE_NUMBER` | Must be positive number | `[{ type: ValidationTypes.POSITIVE_NUMBER }]` |
| `ZIP_CODE` | Valid ZIP code format | `[{ type: ValidationTypes.ZIP_CODE }]` |
| `VEHICLE_NUMBER` | Valid vehicle number | `[{ type: ValidationTypes.VEHICLE_NUMBER }]` |
| `NIC` | Valid NIC number | `[{ type: ValidationTypes.NIC }]` |
| `PASSWORD` | Password (min 6 chars) | `[{ type: ValidationTypes.PASSWORD }]` |
| `CONFIRM_PASSWORD` | Password confirmation | `[{ type: ValidationTypes.CONFIRM_PASSWORD, param: originalPassword }]` |
| `URL` | Valid URL format | `[{ type: ValidationTypes.URL }]` |
| `DATE` | Valid date | `[{ type: ValidationTypes.DATE }]` |
| `FUTURE_DATE` | Date in the future | `[{ type: ValidationTypes.FUTURE_DATE }]` |

### Custom Validation Rules

```jsx
const customValidation = {
  username: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.MIN_LENGTH, param: 3 },
    { 
      type: 'custom', 
      customMessage: 'Username must contain only letters and numbers',
      test: (value) => /^[a-zA-Z0-9]+$/.test(value)
    }
  ]
};
```

## Components

### ValidatedInput

Standard text input with validation support.

```jsx
<ValidatedInput
  name="fieldName"
  label="Field Label"
  type="text" // text, email, tel, password, etc.
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={error}
  required={true}
  placeholder="Placeholder text"
  disabled={false}
  className="custom-classes"
/>
```

### ValidatedTextarea

Multi-line text input with validation.

```jsx
<ValidatedTextarea
  name="description"
  label="Description"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={error}
  required={true}
  rows={4}
  placeholder="Enter description..."
/>
```

### ValidatedSelect

Dropdown select with validation.

```jsx
<ValidatedSelect
  name="category"
  label="Category"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={error}
  options={[
    'Option 1',
    'Option 2',
    { value: 'opt3', label: 'Option 3' }
  ]}
  required={true}
  placeholder="Select an option..."
/>
```

### FormErrorSummary

Displays a summary of all form errors at the top.

```jsx
<FormErrorSummary 
  errors={errors} 
  title="Please fix the following errors:" 
/>
```

## Pre-built Schemas

Use pre-built validation schemas for common forms:

```jsx
import { CommonSchemas } from '../utils/formValidation';

// User registration form
const userSchema = CommonSchemas.userRegistration;

// Hotel details form  
const hotelSchema = CommonSchemas.hotelDetails;

// Service provider request
const providerSchema = CommonSchemas.serviceProviderRequest;

// Vehicle details
const vehicleSchema = CommonSchemas.vehicleDetails;
```

## Advanced Usage

### Step-by-Step Validation

For multi-step forms, validate each step separately:

```jsx
const getValidationSchema = (step) => {
  switch (step) {
    case 1:
      return {
        firstName: [{ type: ValidationTypes.REQUIRED }],
        lastName: [{ type: ValidationTypes.REQUIRED }]
      };
    case 2:
      return {
        email: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.EMAIL }
        ]
      };
    default:
      return {};
  }
};

const validateCurrentStep = () => {
  const schema = getValidationSchema(currentStep);
  const validation = validateForm(formData, schema);
  setErrors(validation.errors);
  return validation.isValid;
};
```

### Real-time Validation Hook

For more complex forms, use the built-in hook:

```jsx
import { useFormValidation } from '../utils/formValidation';

const MyComponent = () => {
  const {
    formData,
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    isFieldInvalid,
    getFieldError
  } = useFormValidation(initialData, validationSchema);

  return (
    <ValidatedInput
      name="email"
      value={formData.email}
      onChange={(value) => handleFieldChange('email', value)}
      onBlur={() => handleFieldBlur('email')}
      error={getFieldError('email')}
      required
    />
  );
};
```

## Error Messages

All error messages are specific and actionable:

- ❌ **Generic**: "Please fill in all required fields"
- ✅ **Specific**: "Email address is required"
- ✅ **Specific**: "Please enter a valid 10-digit phone number"
- ✅ **Specific**: "Business name must be at least 3 characters long"

## Visual Feedback

- **Red borders** on invalid fields
- **Error icons** in input fields
- **Error messages** below each field
- **Error summary** at the top of forms
- **Auto-focus** to first error field
- **Smooth scrolling** to error fields

## Migration from Existing Forms

To upgrade existing forms:

1. Replace standard inputs with `ValidatedInput`
2. Define validation schema
3. Add error state management
4. Update submit handlers to use validation
5. Add `FormErrorSummary` component

## Example: Complete Form

See `frontend/src/pages/OwnerRequestEnhanced.js` for a complete example of the enhanced validation system in action.

This example demonstrates:
- Multi-step form validation
- Field-level error handling
- Error summary with navigation
- Visual feedback and styling
- Proper error state management
- Auto-focus on validation errors

The enhanced system provides a much better user experience with precise, actionable feedback instead of generic error messages. 