import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/expressHandler';

/**
 * Middleware factory for validating request data using Zod schemas
 * This follows the Single Responsibility Principle by focusing only on validation
 * It also follows the Open/Closed Principle by being extensible through different schemas
 */
export const validate = {
  /**
   * Validates request body against a Zod schema
   */
  body: (schema: z.ZodType<any>) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: {
              message: 'Invalid request body',
              details: error.errors
            }
          });
        } else {
          next(error);
        }
      }
    });
  },

  /**
   * Validates request query parameters against a Zod schema
   */
  query: (schema: z.ZodType<any>) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.query = schema.parse(req.query) as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: {
              message: 'Invalid query parameters',
              details: error.errors
            }
          });
        } else {
          next(error);
        }
      }
    });
  },

  /**
   * Validates request route parameters against a Zod schema
   */
  params: (schema: z.ZodType<any>) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.params = schema.parse(req.params) as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: {
              message: 'Invalid route parameters',
              details: error.errors
            }
          });
        } else {
          next(error);
        }
      }
    });
  },

  /**
   * Validates multiple parts of the request against respective schemas
   */
  request: (schemas: {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    params?: z.ZodType<any>;
  }) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (schemas.body) {
          req.body = schemas.body.parse(req.body);
        }
        
        if (schemas.query) {
          req.query = schemas.query.parse(req.query) as any;
        }
        
        if (schemas.params) {
          req.params = schemas.params.parse(req.params) as any;
        }
        
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: {
              message: 'Validation error',
              details: error.errors
            }
          });
        } else {
          next(error);
        }
      }
    });
  }
};
