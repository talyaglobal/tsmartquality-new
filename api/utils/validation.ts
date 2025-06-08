import { Request, Response, NextFunction } from 'express';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean | string;
  };
}

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateInput(data: any, rules: ValidationRules): ValidationResult {
  const errors: ValidationError[] = [];
  
  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];
    
    // Check if required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED'
      });
      continue;
    }
    
    // Skip validation if value is not provided and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              field,
              message: `${field} must be a valid email address`,
              code: 'INVALID_EMAIL'
            });
          }
          break;
        case 'string':
          if (typeof value !== 'string') {
            errors.push({
              field,
              message: `${field} must be a string`,
              code: 'INVALID_TYPE'
            });
          }
          break;
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push({
              field,
              message: `${field} must be a number`,
              code: 'INVALID_TYPE'
            });
          }
          break;
      }
    }
    
    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters long`,
          code: 'MIN_LENGTH'
        });
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must be no more than ${rule.maxLength} characters long`,
          code: 'MAX_LENGTH'
        });
      }
    }
    
    // Number range validation
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
          code: 'MIN_VALUE'
        });
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field,
          message: `${field} must be no more than ${rule.max}`,
          code: 'MAX_VALUE'
        });
      }
    }
    
    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push({
        field,
        message: `${field} format is invalid`,
        code: 'INVALID_FORMAT'
      });
    }
    
    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${rule.enum.join(', ')}`,
        code: 'INVALID_ENUM'
      });
    }
    
    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : `${field} is invalid`,
          code: 'CUSTOM_VALIDATION'
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export const validate = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors: { [key: string]: string } = {};
    
    for (const field in rules) {
      const rule = rules[field];
      const value = req.body[field];
      
      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      // Skip validation if value is not provided and not required
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Check type
      if (rule.type) {
        const actualType = typeof value;
        if (rule.type !== actualType) {
          errors[field] = `${field} must be a ${rule.type}`;
          continue;
        }
      }
      
      // Check min length for strings
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        errors[field] = `${field} must be at least ${rule.min} characters`;
        continue;
      }
      
      // Check max length for strings
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        errors[field] = `${field} must be at most ${rule.max} characters`;
        continue;
      }
      
      // Check pattern
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors[field] = `${field} has an invalid format`;
        continue;
      }
      
      // Check enum
      if (rule.enum && !rule.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rule.enum.join(', ')}`;
        continue;
      }
      
      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (typeof result === 'string') {
          errors[field] = result;
          continue;
        } else if (result === false) {
          errors[field] = `${field} is invalid`;
          continue;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
};