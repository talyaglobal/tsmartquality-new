import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/config';
import { Logger } from '../startup';

export interface TokenPayload {
  userId: string;
  companyId: number;
  role: string;
  username: string;
  sessionId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
  needsRefresh?: boolean;
}

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set<string>();
const refreshTokenStore = new Map<string, {
  userId: string;
  sessionId: string;
  createdAt: Date;
  lastUsed: Date;
  deviceInfo: any;
}>();

export class TokenService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
  private static readonly REMEMBER_ME_EXPIRY = '30d'; // 30 days

  /**
   * Generate access and refresh token pair
   */
  static generateTokenPair(
    userData: {
      userId: string;
      companyId: number;
      role: string;
      username: string;
    },
    options: {
      rememberMe?: boolean;
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): TokenPair {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    // Access token payload
    const accessPayload: TokenPayload = {
      ...userData,
      sessionId,
      deviceId: options.deviceId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      type: 'access',
      iat: Math.floor(now / 1000)
    };

    // Refresh token payload
    const refreshPayload: TokenPayload = {
      ...userData,
      sessionId,
      deviceId: options.deviceId,
      type: 'refresh',
      iat: Math.floor(now / 1000)
    };

    const accessExpiry = options.rememberMe ? '24h' : this.ACCESS_TOKEN_EXPIRY;
    const refreshExpiry = options.rememberMe ? this.REMEMBER_ME_EXPIRY : this.REFRESH_TOKEN_EXPIRY;

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
      expiresIn: accessExpiry,
      issuer: 'tsmartquality-api',
      audience: 'tsmartquality-client'
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret || config.jwt.secret, {
      expiresIn: refreshExpiry,
      issuer: 'tsmartquality-api',
      audience: 'tsmartquality-client'
    });

    // Store refresh token info
    refreshTokenStore.set(refreshToken, {
      userId: userData.userId,
      sessionId,
      createdAt: new Date(),
      lastUsed: new Date(),
      deviceInfo: {
        deviceId: options.deviceId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent
      }
    });

    // Calculate expiry times
    const accessExpiresIn = options.rememberMe ? 24 * 3600 : 15 * 60; // seconds
    const refreshExpiresIn = options.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600; // seconds

    Logger.info('Token pair generated', {
      userId: userData.userId,
      sessionId,
      deviceId: options.deviceId,
      rememberMe: options.rememberMe,
      ipAddress: options.ipAddress
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: refreshExpiresIn
    };
  }

  /**
   * Validate access token
   */
  static validateAccessToken(token: string): TokenValidationResult {
    try {
      // Check if token is blacklisted
      if (tokenBlacklist.has(token)) {
        return {
          isValid: false,
          error: 'Token has been revoked'
        };
      }

      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'tsmartquality-api',
        audience: 'tsmartquality-client'
      }) as TokenPayload;

      // Check if it's an access token
      if (payload.type !== 'access') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      // Check if token is close to expiry (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const needsRefresh = payload.exp ? (payload.exp - now) < 300 : false;

      return {
        isValid: true,
        payload,
        needsRefresh
      };

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          isValid: false,
          error: 'Token has expired',
          needsRefresh: true
        };
      }

      return {
        isValid: false,
        error: error.message || 'Invalid token'
      };
    }
  }

  /**
   * Validate refresh token
   */
  static validateRefreshToken(token: string): TokenValidationResult {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret, {
        issuer: 'tsmartquality-api',
        audience: 'tsmartquality-client'
      }) as TokenPayload;

      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      // Check if refresh token exists in store
      const tokenInfo = refreshTokenStore.get(token);
      if (!tokenInfo) {
        return {
          isValid: false,
          error: 'Refresh token not found'
        };
      }

      // Update last used time
      tokenInfo.lastUsed = new Date();

      return {
        isValid: true,
        payload
      };

    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Invalid refresh token'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshAccessToken(
    refreshToken: string,
    deviceInfo?: { ipAddress?: string; userAgent?: string }
  ): { success: boolean; tokens?: TokenPair; error?: string } {
    const validation = this.validateRefreshToken(refreshToken);
    
    if (!validation.isValid || !validation.payload) {
      return {
        success: false,
        error: validation.error
      };
    }

    const payload = validation.payload;
    
    // Generate new token pair
    const newTokens = this.generateTokenPair(
      {
        userId: payload.userId,
        companyId: payload.companyId,
        role: payload.role,
        username: payload.username
      },
      {
        deviceId: payload.deviceId,
        ipAddress: deviceInfo?.ipAddress || payload.ipAddress,
        userAgent: deviceInfo?.userAgent || payload.userAgent
      }
    );

    // Invalidate old refresh token
    refreshTokenStore.delete(refreshToken);

    Logger.info('Access token refreshed', {
      userId: payload.userId,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId
    });

    return {
      success: true,
      tokens: newTokens
    };
  }

  /**
   * Revoke token (add to blacklist)
   */
  static revokeToken(token: string, reason: string = 'user_logout'): void {
    tokenBlacklist.add(token);
    
    try {
      const payload = jwt.decode(token) as TokenPayload;
      if (payload) {
        Logger.info('Token revoked', {
          userId: payload.userId,
          sessionId: payload.sessionId,
          reason,
          tokenType: payload.type
        });
      }
    } catch (error) {
      Logger.warn('Failed to decode token for logging', { reason });
    }
  }

  /**
   * Revoke all tokens for a user
   */
  static revokeAllUserTokens(userId: string, reason: string = 'security_event'): void {
    // Remove all refresh tokens for the user
    for (const [token, info] of refreshTokenStore.entries()) {
      if (info.userId === userId) {
        refreshTokenStore.delete(token);
      }
    }

    Logger.warn('All user tokens revoked', { userId, reason });
  }

  /**
   * Revoke session tokens
   */
  static revokeSessionTokens(sessionId: string, reason: string = 'session_logout'): void {
    // Remove refresh tokens for the session
    for (const [token, info] of refreshTokenStore.entries()) {
      if (info.sessionId === sessionId) {
        refreshTokenStore.delete(token);
      }
    }

    Logger.info('Session tokens revoked', { sessionId, reason });
  }

  /**
   * Get active sessions for a user
   */
  static getUserSessions(userId: string): Array<{
    sessionId: string;
    createdAt: Date;
    lastUsed: Date;
    deviceInfo: any;
  }> {
    const sessions: Array<{
      sessionId: string;
      createdAt: Date;
      lastUsed: Date;
      deviceInfo: any;
    }> = [];

    for (const [token, info] of refreshTokenStore.entries()) {
      if (info.userId === userId) {
        sessions.push({
          sessionId: info.sessionId,
          createdAt: info.createdAt,
          lastUsed: info.lastUsed,
          deviceInfo: info.deviceInfo
        });
      }
    }

    return sessions;
  }

  /**
   * Clean up expired tokens
   */
  static cleanupExpiredTokens(): void {
    let cleanedCount = 0;

    for (const [token, info] of refreshTokenStore.entries()) {
      try {
        // Try to verify the token
        jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret);
      } catch (error) {
        // Token is expired or invalid, remove it
        refreshTokenStore.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      Logger.info('Cleaned up expired refresh tokens', { count: cleanedCount });
    }
  }

  /**
   * Generate secure session ID
   */
  private static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get token statistics
   */
  static getTokenStats(): {
    activeRefreshTokens: number;
    blacklistedTokens: number;
    sessionsCount: number;
  } {
    const uniqueSessions = new Set();
    for (const info of refreshTokenStore.values()) {
      uniqueSessions.add(info.sessionId);
    }

    return {
      activeRefreshTokens: refreshTokenStore.size,
      blacklistedTokens: tokenBlacklist.size,
      sessionsCount: uniqueSessions.size
    };
  }

  /**
   * Initialize cleanup intervals
   */
  static initializeCleanup(): void {
    // Clean up expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);

    // Clean up old blacklisted tokens every day
    setInterval(() => {
      tokenBlacklist.clear(); // Simple cleanup, in production use more sophisticated approach
      Logger.info('Blacklist cleared');
    }, 24 * 60 * 60 * 1000);

    Logger.info('Token cleanup intervals initialized');
  }
}

// Initialize cleanup when server starts (not during module load)
// TokenService.initializeCleanup(); // Will be called from startup