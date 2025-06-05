import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async controller function to ensure it conforms to Express's expected RequestHandler type
 * This solves TypeScript errors related to Promise<void> vs void return types
 */
export const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};
