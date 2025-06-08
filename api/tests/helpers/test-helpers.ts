import request from 'supertest';
import { Application } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config-manager';

export class TestHelpers {
  /**
   * Generate a test JWT token
   */
  static generateTestToken(payload: any = {}, options: any = {}): string {
    const defaultPayload = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
      ...payload
    };
    
    const defaultOptions = {
      expiresIn: '1h',
      ...options
    };
    
    return jwt.sign(defaultPayload, config.jwt.secret, defaultOptions);
  }
  
  /**
   * Generate an admin token
   */
  static generateAdminToken(): string {
    return this.generateTestToken({ role: 'admin' });
  }
  
  /**
   * Generate an expired token
   */
  static generateExpiredToken(): string {
    return this.generateTestToken({}, { expiresIn: '-1h' });
  }
  
  /**
   * Create authenticated request
   */
  static authenticatedRequest(app: Application, token?: string) {
    const authToken = token || this.generateTestToken();
    return request(app).set('Authorization', `Bearer ${authToken}`);
  }
  
  /**
   * Create admin request
   */
  static adminRequest(app: Application) {
    return this.authenticatedRequest(app, this.generateAdminToken());
  }
  
  /**
   * Wait for async operations
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Generate random email
   */
  static randomEmail(): string {
    return `test-${this.randomString(8)}@example.com`;
  }
  
  /**
   * Validate response structure
   */
  static validateApiResponse(response: any, expectedKeys: string[] = []) {
    expect(response).toBeDefined();
    expect(response.body).toBeDefined();
    
    expectedKeys.forEach(key => {
      expect(response.body).toHaveProperty(key);
    });
  }
  
  /**
   * Validate error response
   */
  static validateErrorResponse(response: any, expectedStatus: number = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  }
  
  /**
   * Validate success response
   */
  static validateSuccessResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
  }
  
  /**
   * Validate pagination response
   */
  static validatePaginationResponse(response: any) {
    this.validateSuccessResponse(response);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  }
  
  /**
   * Mock database operations
   */
  static mockDatabase() {
    const mockDb = {
      users: new Map(),
      products: new Map(),
      qualityChecks: new Map(),
      
      // Mock query methods
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      
      // Helper to set up mock data
      setupMockData: (entity: string, data: any[]) => {
        const entityMap = mockDb[entity as keyof typeof mockDb] as Map<any, any>;
        if (entityMap instanceof Map) {
          data.forEach((item, index) => {
            entityMap.set(item.id || index + 1, item);
          });
        }
      }
    };
    
    return mockDb;
  }
  
  /**
   * Create test database transaction mock
   */
  static mockTransaction() {
    return {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined)
    };
  }
  
  /**
   * Create test file upload
   */
  static createTestFile(filename: string = 'test.txt', content: string = 'test content') {
    return Buffer.from(content);
  }
  
  /**
   * Validate file upload response
   */
  static validateFileUploadResponse(response: any) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('filename');
    expect(response.body.data).toHaveProperty('path');
    expect(response.body.data).toHaveProperty('size');
  }
}