// Jest setup file
import dotenv from 'dotenv';

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Mock Supabase
jest.mock('../config/supabase', () => {
  return {
    supabase: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        admin: {
          createUser: jest.fn(),
          updateUserById: jest.fn()
        },
      },
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn(),
          remove: jest.fn(),
          getPublicUrl: jest.fn()
        })
      }
    }
  };
});

// Global test setup
beforeAll(() => {
  console.log('Starting tests...');
});

// Global test teardown
afterAll(() => {
  console.log('All tests completed');
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});