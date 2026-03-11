export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => boolean | string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validate(values: Record<string, string>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = values[field] || '';

    if (rule.required && !value.trim()) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      continue;
    }

    if (value) {
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at most ${rule.maxLength} characters`;
      }

      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = 'Please enter a valid email address';
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
      }

      if (rule.min !== undefined && Number(value) < rule.min) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.min}`;
      }

      if (rule.max !== undefined && Number(value) > rule.max) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at most ${rule.max}`;
      }

      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          errors[field] = typeof customResult === 'string' ? customResult : 'Invalid value';
        }
      }
    }
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export const commonRules = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 6,
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  pin: {
    required: true,
    minLength: 4,
    maxLength: 6,
    pattern: /^\d+$/,
  },
};
