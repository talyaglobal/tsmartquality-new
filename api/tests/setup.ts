// Test setup configuration

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Mock external dependencies
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

// Mock crypto for deterministic testing
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => Buffer.from('test-random-bytes')),
  randomUUID: jest.fn(() => 'test-uuid-1234')
}));

// Mock bcrypt for faster tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('$2a$10$salt')
}));

// Mock console methods to reduce test noise
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();

// Global test utilities
(global as any).testUtils = {
  // Wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate test data
  generateTestUser: () => ({
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  generateTestProduct: () => ({
    id: 1,
    code: 'TEST001',
    name: 'Test Product',
    description: 'Test product description',
    sellerId: 1,
    categoryId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  generateTestQualityCheck: () => ({
    id: 1,
    productId: 1,
    checkerId: 1,
    status: 'pending' as const,
    notes: 'Test quality check',
    scheduledDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

// Global error handler for unhandled rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      };
    }
  },
  
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false
      };
    }
  }
});