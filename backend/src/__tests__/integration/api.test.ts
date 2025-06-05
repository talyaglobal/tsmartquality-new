import request from 'supertest';
import { app } from '../../app';
import { supabase } from '../../config/supabase';

// Mocking Supabase responses for integration tests
jest.mock('../../config/supabase', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: {
            user: { id: 'test-user-id', email: 'test@example.com' },
            session: { access_token: 'test-token', refresh_token: 'test-refresh-token' }
          },
          error: null
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null
        })
      },
      from: jest.fn().mockImplementation((table) => {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(() => {
            if (table === 'users') {
              return Promise.resolve({
                data: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  full_name: 'Test User',
                  company_id: 1,
                  is_admin: true,
                  is_company_admin: false,
                  is_active: true
                },
                error: null
              });
            }
            return Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            });
          })
        };
      })
    }
  };
});

describe('API Integration Tests', () => {
  let token: string;

  beforeAll(async () => {
    // Get authentication token for subsequent requests
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = res.body.data?.token || '';
  });

  describe('Authentication', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 for login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 when accessing protected route without token', async () => {
      const res = await request(app)
        .get('/api/v1/users');

      expect(res.status).toBe(401);
    });

    it('should allow access to protected route with valid token', async () => {
      // Mock the user data for the authenticated user
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-user-id',
                email: 'test@example.com',
                full_name: 'Test User',
                company_id: 1,
                is_admin: true,
                is_company_admin: false
              },
              error: null
            }),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  full_name: 'Test User',
                  company_id: 1,
                  is_admin: true
                }
              ],
              count: 1,
              error: null
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: [],
            count: 0,
            error: null
          })
        };
      });

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});