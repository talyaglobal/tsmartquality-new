import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { validate, validateFileUpload } from '../../middleware/validation.middleware';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  ValidationChain: class {}
}));

// Mock Request and Response
const mockRequest = () => {
  const req = {} as Request;
  req.headers = {};
  req.params = {};
  req.query = {};
  req.body = {};
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Validation Middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  
  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('validate middleware', () => {
    it('should call next if there are no validation errors', async () => {
      // Mock validation chain
      const mockValidationChain = {
        run: jest.fn().mockResolvedValue(undefined)
      } as unknown as ValidationChain;
      
      // Mock validationResult to return no errors
      (validationResult as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });
      
      const validationMiddleware = validate([mockValidationChain]);
      await validationMiddleware(req, res, next);
      
      expect(mockValidationChain.run).toHaveBeenCalledWith(req);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 status with errors if validation fails', async () => {
      // Mock validation chain
      const mockValidationChain = {
        run: jest.fn().mockResolvedValue(undefined)
      } as unknown as ValidationChain;
      
      // Mock validation errors
      const mockErrors = [
        { param: 'email', msg: 'Must be a valid email', location: 'body' }
      ];
      
      // Mock validationResult to return errors
      (validationResult as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });
      
      const validationMiddleware = validate([mockValidationChain]);
      await validationMiddleware(req, res, next);
      
      expect(mockValidationChain.run).toHaveBeenCalledWith(req);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: mockErrors });
    });
  });
  
  describe('validateFileUpload middleware', () => {
    it('should call next if file is present', () => {
      req.file = { fieldname: 'file', originalname: 'test.jpg' } as any;
      
      validateFileUpload(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next if files array is present', () => {
      req.files = [{ fieldname: 'files', originalname: 'test1.jpg' }] as any;
      
      validateFileUpload(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 if no file is uploaded', () => {
      // No file or files property set
      
      validateFileUpload(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
    });
  });
});