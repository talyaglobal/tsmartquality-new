import { Request, Response, NextFunction } from 'express';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    type?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean | string;
  };
}

export const validate = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction) => {
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