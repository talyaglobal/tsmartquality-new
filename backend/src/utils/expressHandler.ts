import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Utility function to convert async controller functions to Express-compatible request handlers
 * This wrapper ensures that async controller functions properly handle Express's expected types
 * and properly propagate errors to Express error handling middleware
 */
export const expressHandler = (
  fn: (req: Request, res: Response) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};
