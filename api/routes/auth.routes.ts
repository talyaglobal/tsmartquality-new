import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { enhancedAuth, strictAuth, optionalAuth } from '../middleware/enhanced-auth.middleware';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for token refresh
    return req.path === '/refresh';
  }
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // More strict for login attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    code: 'LOGIN_RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const mfaRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Allow more attempts for MFA codes
  message: {
    success: false,
    message: 'Too many MFA attempts, please try again later',
    code: 'MFA_RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public authentication routes
router.post('/login', loginRateLimit, AuthController.login);
router.post('/demo', AuthController.demoLogin);
router.post('/refresh', authRateLimit, AuthController.refresh);

// MFA verification (requires temporary token from login)
router.post('/mfa/verify', mfaRateLimit, enhancedAuth({ required: true }), AuthController.verifyMFA);

// Protected authentication routes (require valid authentication)
router.post('/logout', strictAuth(), AuthController.logout);
router.get('/profile', strictAuth(), AuthController.getProfile);
router.get('/sessions', strictAuth(), AuthController.getSessions);
router.delete('/sessions/:sessionId', strictAuth(), AuthController.revokeSession);

// MFA management routes
router.get('/mfa/status', strictAuth(), AuthController.getMFAStatus);
router.post('/mfa/setup', strictAuth(), AuthController.setupMFA);
router.post('/mfa/enable', mfaRateLimit, strictAuth(), AuthController.enableMFA);
router.post('/mfa/disable', mfaRateLimit, strictAuth(), AuthController.disableMFA);
router.post('/mfa/backup-codes', mfaRateLimit, strictAuth(), AuthController.generateBackupCodes);

export { router as authRoutes };