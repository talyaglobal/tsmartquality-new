import crypto from 'crypto';
import { Logger } from '../startup';

export interface SecurityValidationRequest {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  token: string;
}

export interface SecurityValidationResult {
  allowed: boolean;
  reason?: string;
  message?: string;
  isNewDevice: boolean;
  riskScore: number;
  requiresMFA?: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  fingerprint: string;
  firstSeen: Date;
  lastSeen: Date;
  trustLevel: 'trusted' | 'unknown' | 'suspicious';
  loginCount: number;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  sessionId?: string;
  eventType: 'login_success' | 'login_failure' | 'suspicious_activity' | 'device_change' | 'security_violation';
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  riskScore: number;
}

// In-memory storage (in production, use Redis or database)
const deviceRegistry = new Map<string, DeviceInfo>();
const securityEvents = new Map<string, SecurityEvent[]>();
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date; locked: boolean }>();
const suspiciousIPs = new Set<string>();

export class SecurityService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly SUSPICIOUS_THRESHOLD = 3;

  /**
   * Validate security context for a request
   */
  static async validateRequest(request: SecurityValidationRequest): Promise<SecurityValidationResult> {
    const deviceFingerprint = this.generateDeviceFingerprint(request.userAgent, request.ipAddress);
    const deviceId = request.deviceId || deviceFingerprint;
    
    // Check if account is locked
    const lockoutInfo = failedLoginAttempts.get(request.userId);
    if (lockoutInfo?.locked) {
      const timeSinceLock = Date.now() - lockoutInfo.lastAttempt.getTime();
      if (timeSinceLock < this.LOCKOUT_DURATION) {
        await this.logSecurityEvent({
          userId: request.userId,
          sessionId: request.sessionId,
          eventType: 'security_violation',
          details: { reason: 'account_locked', attemptsCount: lockoutInfo.count },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          riskScore: 10
        });

        return {
          allowed: false,
          reason: 'account_locked',
          message: 'Account is temporarily locked due to multiple failed login attempts',
          isNewDevice: true,
          riskScore: 10
        };
      } else {
        // Reset lockout after duration
        failedLoginAttempts.delete(request.userId);
      }
    }

    // Check for suspicious IP
    if (suspiciousIPs.has(request.ipAddress)) {
      await this.logSecurityEvent({
        userId: request.userId,
        sessionId: request.sessionId,
        eventType: 'suspicious_activity',
        details: { reason: 'suspicious_ip', ipAddress: request.ipAddress },
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        riskScore: 8
      });

      return {
        allowed: false,
        reason: 'suspicious_ip',
        message: 'Access denied from suspicious IP address',
        isNewDevice: true,
        riskScore: 8
      };
    }

    // Get or create device info
    const device = this.getOrCreateDevice({
      deviceId,
      userId: request.userId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      fingerprint: deviceFingerprint
    });

    const isNewDevice = device.loginCount === 0;
    const riskScore = this.calculateRiskScore({
      device,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      userId: request.userId
    });

    // Update device info
    device.lastSeen = new Date();
    device.loginCount++;
    device.ipAddress = request.ipAddress; // Update current IP
    deviceRegistry.set(deviceId, device);

    // Check if high risk requires additional verification
    const requiresMFA = riskScore >= 7 || isNewDevice;

    // Log successful validation
    await this.logSecurityEvent({
      userId: request.userId,
      sessionId: request.sessionId,
      eventType: 'login_success',
      details: { 
        deviceId, 
        isNewDevice, 
        riskScore,
        trustLevel: device.trustLevel 
      },
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      riskScore
    });

    return {
      allowed: true,
      isNewDevice,
      riskScore,
      requiresMFA
    };
  }

  /**
   * Record failed login attempt
   */
  static async recordFailedLogin(userId: string, ipAddress: string, userAgent: string, reason: string): Promise<void> {
    const now = new Date();
    const attempts = failedLoginAttempts.get(userId) || { count: 0, lastAttempt: now, locked: false };
    
    attempts.count++;
    attempts.lastAttempt = now;

    // Lock account after max attempts
    if (attempts.count >= this.MAX_FAILED_ATTEMPTS) {
      attempts.locked = true;
      
      await this.logSecurityEvent({
        userId,
        eventType: 'security_violation',
        details: { reason: 'account_locked_failed_attempts', attemptsCount: attempts.count },
        ipAddress,
        userAgent,
        riskScore: 10
      });

      // Add IP to suspicious list if multiple different users fail from same IP
      this.checkSuspiciousIP(ipAddress);
    } else {
      await this.logSecurityEvent({
        userId,
        eventType: 'login_failure',
        details: { reason, attemptsCount: attempts.count },
        ipAddress,
        userAgent,
        riskScore: 5 + attempts.count
      });
    }

    failedLoginAttempts.set(userId, attempts);
  }

  /**
   * Clear failed login attempts (on successful login)
   */
  static clearFailedAttempts(userId: string): void {
    failedLoginAttempts.delete(userId);
  }

  /**
   * Generate device fingerprint
   */
  private static generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(userAgent + ipAddress);
    return hash.digest('hex').substring(0, 16);
  }

  /**
   * Get or create device info
   */
  private static getOrCreateDevice(params: {
    deviceId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    fingerprint: string;
  }): DeviceInfo {
    let device = deviceRegistry.get(params.deviceId);
    
    if (!device) {
      device = {
        deviceId: params.deviceId,
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        fingerprint: params.fingerprint,
        firstSeen: new Date(),
        lastSeen: new Date(),
        trustLevel: 'unknown',
        loginCount: 0
      };
      deviceRegistry.set(params.deviceId, device);
    }

    return device;
  }

  /**
   * Calculate risk score based on various factors
   */
  private static calculateRiskScore(params: {
    device: DeviceInfo;
    ipAddress: string;
    userAgent: string;
    userId: string;
  }): number {
    let score = 0;

    // Base score for new devices
    if (params.device.loginCount === 0) {
      score += 5;
    }

    // IP address change
    if (params.device.ipAddress !== params.ipAddress) {
      score += 3;
    }

    // User agent change (device characteristics)
    if (params.device.userAgent !== params.userAgent) {
      score += 2;
    }

    // Trust level
    switch (params.device.trustLevel) {
      case 'suspicious':
        score += 7;
        break;
      case 'unknown':
        score += 3;
        break;
      case 'trusted':
        score -= 2;
        break;
    }

    // Recent security events for this user
    const userEvents = securityEvents.get(params.userId) || [];
    const recentEvents = userEvents.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24 hours
    );
    
    const suspiciousEvents = recentEvents.filter(
      event => ['security_violation', 'suspicious_activity'].includes(event.eventType)
    );
    
    score += suspiciousEvents.length * 2;

    // Login frequency (rapid successive logins can be suspicious)
    const recentLogins = recentEvents.filter(
      event => event.eventType === 'login_success' && 
      Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // 1 hour
    );
    
    if (recentLogins.length > 5) {
      score += 3;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Log security event
   */
  private static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      ...event,
      timestamp: new Date()
    };

    // Store event
    const userEvents = securityEvents.get(event.userId) || [];
    userEvents.push(securityEvent);
    
    // Keep only last 100 events per user
    if (userEvents.length > 100) {
      userEvents.splice(0, userEvents.length - 100);
    }
    
    securityEvents.set(event.userId, userEvents);

    // Log to application logger
    Logger.info('Security event logged', {
      eventId: securityEvent.id,
      userId: event.userId,
      eventType: event.eventType,
      riskScore: event.riskScore,
      ipAddress: event.ipAddress
    });

    // Alert on high-risk events
    if (event.riskScore >= 8) {
      Logger.warn('High-risk security event detected', {
        eventId: securityEvent.id,
        userId: event.userId,
        eventType: event.eventType,
        details: event.details,
        riskScore: event.riskScore
      });
    }
  }

  /**
   * Check if IP should be marked as suspicious
   */
  private static checkSuspiciousIP(ipAddress: string): void {
    // Count failed attempts from this IP across all users
    let failureCount = 0;
    for (const attempts of failedLoginAttempts.values()) {
      if (attempts.count >= this.SUSPICIOUS_THRESHOLD) {
        failureCount++;
      }
    }

    if (failureCount >= 3) {
      suspiciousIPs.add(ipAddress);
      Logger.warn('IP marked as suspicious', { ipAddress, failureCount });
    }
  }

  /**
   * Get device information for user
   */
  static getUserDevices(userId: string): DeviceInfo[] {
    const devices: DeviceInfo[] = [];
    for (const device of deviceRegistry.values()) {
      if (device.userId === userId) {
        devices.push(device);
      }
    }
    return devices.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }

  /**
   * Revoke device access
   */
  static revokeDevice(userId: string, deviceId: string): boolean {
    const device = deviceRegistry.get(deviceId);
    if (device && device.userId === userId) {
      deviceRegistry.delete(deviceId);
      
      Logger.info('Device access revoked', {
        userId,
        deviceId,
        deviceFingerprint: device.fingerprint
      });
      
      return true;
    }
    return false;
  }

  /**
   * Update device trust level
   */
  static updateDeviceTrust(deviceId: string, trustLevel: DeviceInfo['trustLevel']): boolean {
    const device = deviceRegistry.get(deviceId);
    if (device) {
      device.trustLevel = trustLevel;
      deviceRegistry.set(deviceId, device);
      
      Logger.info('Device trust level updated', {
        deviceId,
        userId: device.userId,
        trustLevel
      });
      
      return true;
    }
    return false;
  }

  /**
   * Get security events for user
   */
  static getUserSecurityEvents(userId: string, limit: number = 50): SecurityEvent[] {
    const events = securityEvents.get(userId) || [];
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Check if user account is locked
   */
  static isAccountLocked(userId: string): boolean {
    const lockoutInfo = failedLoginAttempts.get(userId);
    if (!lockoutInfo?.locked) return false;

    const timeSinceLock = Date.now() - lockoutInfo.lastAttempt.getTime();
    if (timeSinceLock >= this.LOCKOUT_DURATION) {
      // Auto-unlock after duration
      failedLoginAttempts.delete(userId);
      return false;
    }

    return true;
  }

  /**
   * Manually unlock user account
   */
  static unlockAccount(userId: string): boolean {
    const existed = failedLoginAttempts.has(userId);
    if (existed) {
      failedLoginAttempts.delete(userId);
      Logger.info('Account manually unlocked', { userId });
    }
    return existed;
  }

  /**
   * Get security statistics
   */
  static getSecurityStats(): {
    totalDevices: number;
    suspiciousIPs: number;
    lockedAccounts: number;
    recentEvents: number;
    averageRiskScore: number;
  } {
    const now = Date.now();
    const recentThreshold = 24 * 60 * 60 * 1000; // 24 hours
    
    let recentEventCount = 0;
    let totalRiskScore = 0;
    let eventCount = 0;

    for (const events of securityEvents.values()) {
      const recentEvents = events.filter(e => now - e.timestamp.getTime() < recentThreshold);
      recentEventCount += recentEvents.length;
      
      for (const event of events) {
        totalRiskScore += event.riskScore;
        eventCount++;
      }
    }

    const lockedCount = Array.from(failedLoginAttempts.values())
      .filter(info => info.locked)
      .length;

    return {
      totalDevices: deviceRegistry.size,
      suspiciousIPs: suspiciousIPs.size,
      lockedAccounts: lockedCount,
      recentEvents: recentEventCount,
      averageRiskScore: eventCount > 0 ? totalRiskScore / eventCount : 0
    };
  }

  /**
   * Clean up old data
   */
  static cleanup(): void {
    const now = Date.now();
    const deviceThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days
    const eventThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean up old devices
    let devicesCleaned = 0;
    for (const [deviceId, device] of deviceRegistry.entries()) {
      if (now - device.lastSeen.getTime() > deviceThreshold) {
        deviceRegistry.delete(deviceId);
        devicesCleaned++;
      }
    }

    // Clean up old events
    let eventsCleaned = 0;
    for (const [userId, events] of securityEvents.entries()) {
      const filteredEvents = events.filter(
        event => now - event.timestamp.getTime() < eventThreshold
      );
      
      eventsCleaned += events.length - filteredEvents.length;
      
      if (filteredEvents.length === 0) {
        securityEvents.delete(userId);
      } else {
        securityEvents.set(userId, filteredEvents);
      }
    }

    // Clean up old lockout info
    let lockoutsCleaned = 0;
    for (const [userId, info] of failedLoginAttempts.entries()) {
      if (now - info.lastAttempt.getTime() > this.LOCKOUT_DURATION * 2) {
        failedLoginAttempts.delete(userId);
        lockoutsCleaned++;
      }
    }

    if (devicesCleaned > 0 || eventsCleaned > 0 || lockoutsCleaned > 0) {
      Logger.info('Security data cleanup completed', {
        devicesRemoved: devicesCleaned,
        eventsRemoved: eventsCleaned,
        lockoutsCleared: lockoutsCleaned
      });
    }
  }

  /**
   * Initialize cleanup interval
   */
  static initializeCleanup(): void {
    // Run cleanup daily
    setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000);

    Logger.info('Security service cleanup interval initialized');
  }
}

// Initialize cleanup when server starts (not during module load)
// SecurityService.initializeCleanup(); // Will be called from startup