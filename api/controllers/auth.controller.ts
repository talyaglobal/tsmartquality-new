import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { TokenService } from '../services/token.service';
import { SecurityService } from '../services/security.service';
import { MFAService } from '../services/mfa.service';
import { AuditService } from '../services/audit.service';
import { RBACService } from '../services/rbac.service';
import { EnhancedAuthRequest } from '../middleware/enhanced-auth.middleware';
import { validateInput } from '../utils/validation';
import { Logger } from '../startup';

export class AuthController {
  /**
   * User login with comprehensive security checks
   */
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password, rememberMe = false, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Validate input
      const validation = validateInput({ email, password }, {
        email: { required: true, type: 'email' },
        password: { required: true, minLength: 1 }
      });

      if (!validation.isValid) {
        await AuditService.logAuthentication({
          action: 'login_failed',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Invalid input validation',
          metadata: { validationErrors: validation.errors }
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        await SecurityService.recordFailedLogin('unknown', ipAddress, userAgent, 'user_not_found');
        await AuditService.logAuthentication({
          action: 'login_failed',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'User not found'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (SecurityService.isAccountLocked(user.id)) {
        await AuditService.logAuthentication({
          userId: user.id,
          action: 'login_failed',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Account locked'
        });

        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        await SecurityService.recordFailedLogin(user.id, ipAddress, userAgent, 'invalid_password');
        await AuditService.logAuthentication({
          userId: user.id,
          action: 'login_failed',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Invalid password'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        await AuditService.logAuthentication({
          userId: user.id,
          action: 'login_failed',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Account inactive'
        });

        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Clear any failed login attempts
      SecurityService.clearFailedAttempts(user.id);

      // Validate security context
      const securityValidation = await SecurityService.validateRequest({
        userId: user.id,
        sessionId: 'temp', // Will be replaced by token generation
        ipAddress,
        userAgent,
        deviceId,
        token: 'temp'
      });

      if (!securityValidation.allowed) {
        await AuditService.logSecurity({
          userId: user.id,
          action: 'suspicious_activity',
          resource: 'user_session',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: securityValidation.message,
          metadata: { reason: securityValidation.reason }
        });

        return res.status(403).json({
          success: false,
          message: securityValidation.message || 'Access denied for security reasons',
          code: 'SECURITY_VIOLATION'
        });
      }

      // Check if MFA is required
      const mfaEnabled = MFAService.isMFAEnabled(user.id);
      if (mfaEnabled || securityValidation.requiresMFA) {
        // Generate temporary token for MFA verification
        const tempTokens = TokenService.generateTokenPair(
          {
            userId: user.id,
            companyId: user.companyId,
            role: user.role,
            username: user.username
          },
          {
            rememberMe: false,
            deviceId,
            ipAddress,
            userAgent
          }
        );

        await AuditService.logAuthentication({
          userId: user.id,
          action: 'login',
          success: true,
          ipAddress,
          userAgent,
          metadata: { mfaRequired: true, isNewDevice: securityValidation.isNewDevice }
        });

        return res.status(200).json({
          success: true,
          message: 'MFA verification required',
          mfaRequired: true,
          tempToken: tempTokens.accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            companyId: user.companyId
          }
        });
      }

      // Generate tokens
      const tokens = TokenService.generateTokenPair(
        {
          userId: user.id,
          companyId: user.companyId,
          role: user.role,
          username: user.username
        },
        {
          rememberMe,
          deviceId,
          ipAddress,
          userAgent
        }
      );

      // Log successful login
      await AuditService.logAuthentication({
        userId: user.id,
        action: 'login',
        success: true,
        ipAddress,
        userAgent,
        metadata: { 
          rememberMe, 
          isNewDevice: securityValidation.isNewDevice,
          riskScore: securityValidation.riskScore
        }
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          isActive: user.is_active
        },
        tokens,
        security: {
          isNewDevice: securityValidation.isNewDevice,
          riskScore: securityValidation.riskScore
        }
      });

    } catch (error: any) {
      Logger.error('Login error', { error: error.message, stack: error.stack });
      
      await AuditService.logAuthentication({
        action: 'login_failed',
        success: false,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        errorMessage: error.message
      });

      res.status(500).json({
        success: false,
        message: 'Login failed due to server error'
      });
    }
  }

  /**
   * Verify MFA and complete login
   */
  static async verifyMFA(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { mfaCode, rememberMe = false } = req.body;
      const userId = req.userId!;
      const deviceId = req.deviceId;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      if (!mfaCode) {
        return res.status(400).json({
          success: false,
          message: 'MFA code is required'
        });
      }

      // Validate MFA code
      const mfaValidation = MFAService.validateMFA(userId, mfaCode);
      if (!mfaValidation.valid) {
        await AuditService.logAuthentication({
          userId,
          action: 'mfa_verify',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: mfaValidation.error
        });

        return res.status(401).json({
          success: false,
          message: mfaValidation.error || 'Invalid MFA code'
        });
      }

      // Get user data
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate final tokens
      const tokens = TokenService.generateTokenPair(
        {
          userId: user.id,
          companyId: user.companyId,
          role: user.role,
          username: user.username
        },
        {
          rememberMe,
          deviceId,
          ipAddress,
          userAgent
        }
      );

      await AuditService.logAuthentication({
        userId,
        action: 'mfa_verify',
        success: true,
        ipAddress,
        userAgent,
        metadata: { method: mfaValidation.method, rememberMe }
      });

      res.status(200).json({
        success: true,
        message: 'MFA verification successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          isActive: user.is_active
        },
        tokens
      });

    } catch (error: any) {
      Logger.error('MFA verification error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'MFA verification failed'
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response): Promise<any> {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = TokenService.refreshAccessToken(refreshToken, {
        ipAddress,
        userAgent
      });

      if (!result.success) {
        await AuditService.logAuthentication({
          action: 'token_refresh',
          success: false,
          ipAddress,
          userAgent,
          errorMessage: result.error
        });

        return res.status(401).json({
          success: false,
          message: result.error || 'Token refresh failed'
        });
      }

      // Extract user ID from token for logging
      const payload = TokenService.validateRefreshToken(refreshToken).payload;
      const userId = payload?.userId;

      await AuditService.logAuthentication({
        userId,
        action: 'token_refresh',
        success: true,
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        tokens: result.tokens
      });

    } catch (error: any) {
      Logger.error('Token refresh error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * User logout
   */
  static async logout(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { logoutAllDevices = false } = req.body;
      const userId = req.userId!;
      const sessionId = req.sessionId;
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      if (token) {
        TokenService.revokeToken(token, 'user_logout');
      }

      if (logoutAllDevices) {
        TokenService.revokeAllUserTokens(userId, 'user_logout_all');
      } else if (sessionId) {
        TokenService.revokeSessionTokens(sessionId, 'user_logout');
      }

      await AuditService.logAuthentication({
        userId,
        sessionId,
        action: 'logout',
        success: true,
        ipAddress,
        userAgent,
        metadata: { logoutAllDevices }
      });

      res.status(200).json({
        success: true,
        message: logoutAllDevices ? 'Logged out from all devices' : 'Logout successful'
      });

    } catch (error: any) {
      Logger.error('Logout error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Setup MFA
   */
  static async setupMFA(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      const user = req.user;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      if (!user || !user.email) {
        return res.status(400).json({
          success: false,
          message: 'User email is required for MFA setup'
        });
      }

      const mfaSetup = await MFAService.setupMFA(userId, user.email);

      await AuditService.logAuthentication({
        userId,
        action: 'mfa_setup',
        success: true,
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        message: 'MFA setup initiated',
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes,
        instructions: [
          '1. Scan the QR code with your authenticator app',
          '2. Enter the 6-digit code from your app to verify',
          '3. Save your backup codes in a secure location'
        ]
      });

    } catch (error: any) {
      Logger.error('MFA setup error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'MFA setup failed'
      });
    }
  }

  /**
   * Enable MFA
   */
  static async enableMFA(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { totpCode } = req.body;
      const userId = req.userId!;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      if (!totpCode) {
        return res.status(400).json({
          success: false,
          message: 'TOTP code is required'
        });
      }

      const result = MFAService.enableMFA(userId, totpCode);

      await AuditService.logAuthentication({
        userId,
        action: 'mfa_setup',
        success: result.valid,
        ipAddress,
        userAgent,
        errorMessage: result.error,
        metadata: { enabled: result.valid }
      });

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to enable MFA'
        });
      }

      res.status(200).json({
        success: true,
        message: 'MFA enabled successfully'
      });

    } catch (error: any) {
      Logger.error('MFA enable error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to enable MFA'
      });
    }
  }

  /**
   * Disable MFA
   */
  static async disableMFA(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { totpCode, backupCode } = req.body;
      const userId = req.userId!;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      if (!totpCode && !backupCode) {
        return res.status(400).json({
          success: false,
          message: 'TOTP code or backup code is required'
        });
      }

      const result = MFAService.disableMFA(userId, totpCode, backupCode);

      await AuditService.logAuthentication({
        userId,
        action: 'mfa_setup',
        success: result.valid,
        ipAddress,
        userAgent,
        errorMessage: result.error,
        metadata: { disabled: result.valid, method: result.method }
      });

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to disable MFA'
        });
      }

      res.status(200).json({
        success: true,
        message: 'MFA disabled successfully'
      });

    } catch (error: any) {
      Logger.error('MFA disable error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to disable MFA'
      });
    }
  }

  /**
   * Get MFA status
   */
  static async getMFAStatus(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      const status = MFAService.getMFAStatus(userId);

      res.status(200).json({
        success: true,
        mfa: status
      });

    } catch (error: any) {
      Logger.error('Get MFA status error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get MFA status'
      });
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateBackupCodes(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { totpCode } = req.body;
      const userId = req.userId!;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      const result = MFAService.generateNewBackupCodes(userId, totpCode);

      await AuditService.logAuthentication({
        userId,
        action: 'mfa_setup',
        success: result.success,
        ipAddress,
        userAgent,
        errorMessage: result.error,
        metadata: { action: 'generate_backup_codes' }
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to generate backup codes'
        });
      }

      res.status(200).json({
        success: true,
        message: 'New backup codes generated',
        backupCodes: result.backupCodes
      });

    } catch (error: any) {
      Logger.error('Generate backup codes error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to generate backup codes'
      });
    }
  }

  /**
   * Get user sessions
   */
  static async getSessions(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      const sessions = TokenService.getUserSessions(userId);
      const devices = SecurityService.getUserDevices(userId);

      res.status(200).json({
        success: true,
        sessions,
        devices
      });

    } catch (error: any) {
      Logger.error('Get sessions error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get sessions'
      });
    }
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { sessionId } = req.params;
      const userId = req.userId!;
      const ipAddress = req.securityContext?.ipAddress || 'unknown';
      const userAgent = req.securityContext?.userAgent || 'unknown';

      TokenService.revokeSessionTokens(sessionId, 'user_revoke_session');

      await AuditService.logAuthentication({
        userId,
        sessionId,
        action: 'logout',
        success: true,
        ipAddress,
        userAgent,
        metadata: { revokedSession: sessionId }
      });

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully'
      });

    } catch (error: any) {
      Logger.error('Revoke session error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to revoke session'
      });
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const user = req.user;

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get additional info
      const mfaStatus = MFAService.getMFAStatus(user.id);
      const sessions = TokenService.getUserSessions(user.id);
      const devices = SecurityService.getUserDevices(user.id);

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          companyId: user.companyId,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        },
        security: {
          mfa: mfaStatus,
          activeSessions: sessions.length,
          trustedDevices: devices.filter(d => d.trustLevel === 'trusted').length
        }
      });

    } catch (error: any) {
      Logger.error('Get profile error', { 
        error: error.message, 
        userId: req.userId 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
}