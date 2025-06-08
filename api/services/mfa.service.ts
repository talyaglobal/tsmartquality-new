import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { Logger } from '../startup';

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  uri: string;
}

export interface MFAValidationResult {
  valid: boolean;
  method?: 'totp' | 'backup_code';
  error?: string;
}

export interface UserMFAInfo {
  userId: string;
  isEnabled: boolean;
  secret?: string;
  backupCodes: string[];
  lastUsedCode?: string;
  lastUsedAt?: Date;
  setupAt?: Date;
  methods: ('totp' | 'backup_codes')[];
}

// In-memory storage (in production, use database)
const userMFAData = new Map<string, UserMFAInfo>();
const usedBackupCodes = new Set<string>();

export class MFAService {
  private static readonly APP_NAME = 'TSmart Quality';
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Setup MFA for a user
   */
  static async setupMFA(userId: string, userEmail: string): Promise<MFASetup> {
    try {
      // Generate secret
      const secret = authenticator.generateSecret();
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Create TOTP URI
      const uri = authenticator.keyuri(userEmail, this.APP_NAME, secret);
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(uri);
      
      // Store MFA info (not enabled yet)
      const mfaInfo: UserMFAInfo = {
        userId,
        isEnabled: false,
        secret,
        backupCodes,
        methods: ['totp', 'backup_codes'],
        setupAt: new Date()
      };
      
      userMFAData.set(userId, mfaInfo);
      
      Logger.info('MFA setup initiated', { userId, userEmail });
      
      return {
        secret,
        qrCode,
        backupCodes,
        uri
      };
      
    } catch (error: any) {
      Logger.error('MFA setup failed', { userId, error: error.message });
      throw new Error(`MFA setup failed: ${error.message}`);
    }
  }

  /**
   * Enable MFA after user confirms setup with TOTP
   */
  static enableMFA(userId: string, totpCode: string): MFAValidationResult {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.secret) {
      return {
        valid: false,
        error: 'MFA not set up for this user'
      };
    }

    if (mfaInfo.isEnabled) {
      return {
        valid: false,
        error: 'MFA is already enabled'
      };
    }

    // Verify TOTP code
    const isValid = authenticator.check(totpCode, mfaInfo.secret);
    
    if (!isValid) {
      Logger.warn('Invalid TOTP code during MFA enablement', { userId });
      return {
        valid: false,
        error: 'Invalid TOTP code'
      };
    }

    // Enable MFA
    mfaInfo.isEnabled = true;
    mfaInfo.lastUsedCode = totpCode;
    mfaInfo.lastUsedAt = new Date();
    userMFAData.set(userId, mfaInfo);

    Logger.info('MFA enabled successfully', { userId });
    
    return {
      valid: true,
      method: 'totp'
    };
  }

  /**
   * Disable MFA
   */
  static disableMFA(userId: string, totpCode?: string, backupCode?: string): MFAValidationResult {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.isEnabled) {
      return {
        valid: false,
        error: 'MFA is not enabled for this user'
      };
    }

    // Verify either TOTP or backup code
    let validationResult: MFAValidationResult;
    
    if (totpCode) {
      validationResult = this.validateTOTP(userId, totpCode);
    } else if (backupCode) {
      validationResult = this.validateBackupCode(userId, backupCode);
    } else {
      return {
        valid: false,
        error: 'TOTP code or backup code required'
      };
    }

    if (!validationResult.valid) {
      return validationResult;
    }

    // Disable MFA
    userMFAData.delete(userId);

    Logger.info('MFA disabled', { userId, method: validationResult.method });
    
    return {
      valid: true,
      method: validationResult.method
    };
  }

  /**
   * Validate MFA code (TOTP or backup code)
   */
  static validateMFA(userId: string, code: string): MFAValidationResult {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.isEnabled) {
      return {
        valid: false,
        error: 'MFA is not enabled for this user'
      };
    }

    // Try TOTP first
    if (code.length === 6 && /^\d+$/.test(code)) {
      const totpResult = this.validateTOTP(userId, code);
      if (totpResult.valid) {
        return totpResult;
      }
    }

    // Try backup code
    if (code.length === this.BACKUP_CODE_LENGTH) {
      const backupResult = this.validateBackupCode(userId, code);
      if (backupResult.valid) {
        return backupResult;
      }
    }

    Logger.warn('MFA validation failed', { userId, codeLength: code.length });
    
    return {
      valid: false,
      error: 'Invalid MFA code'
    };
  }

  /**
   * Validate TOTP code
   */
  private static validateTOTP(userId: string, code: string): MFAValidationResult {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.secret) {
      return {
        valid: false,
        error: 'TOTP not configured'
      };
    }

    // Check for code reuse
    if (mfaInfo.lastUsedCode === code && mfaInfo.lastUsedAt) {
      const timeSinceLastUse = Date.now() - mfaInfo.lastUsedAt.getTime();
      if (timeSinceLastUse < 30000) { // 30 seconds window
        return {
          valid: false,
          error: 'TOTP code already used recently'
        };
      }
    }

    const isValid = authenticator.check(code, mfaInfo.secret);

    if (isValid) {
      // Update last used info
      mfaInfo.lastUsedCode = code;
      mfaInfo.lastUsedAt = new Date();
      userMFAData.set(userId, mfaInfo);

      Logger.debug('TOTP validation successful', { userId });
      
      return {
        valid: true,
        method: 'totp'
      };
    }

    return {
      valid: false,
      error: 'Invalid TOTP code'
    };
  }

  /**
   * Validate backup code
   */
  private static validateBackupCode(userId: string, code: string): MFAValidationResult {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo) {
      return {
        valid: false,
        error: 'MFA not configured'
      };
    }

    // Check if backup code exists and hasn't been used
    const normalizedCode = code.toLowerCase().replace(/\s+/g, '');
    const codeExists = mfaInfo.backupCodes.includes(normalizedCode);
    const codeUsed = usedBackupCodes.has(`${userId}:${normalizedCode}`);

    if (!codeExists) {
      return {
        valid: false,
        error: 'Invalid backup code'
      };
    }

    if (codeUsed) {
      return {
        valid: false,
        error: 'Backup code already used'
      };
    }

    // Mark backup code as used
    usedBackupCodes.add(`${userId}:${normalizedCode}`);
    
    // Remove the used backup code from user's list
    mfaInfo.backupCodes = mfaInfo.backupCodes.filter(bc => bc !== normalizedCode);
    mfaInfo.lastUsedAt = new Date();
    userMFAData.set(userId, mfaInfo);

    Logger.info('Backup code used successfully', { 
      userId, 
      remainingCodes: mfaInfo.backupCodes.length 
    });

    // Warn if running low on backup codes
    if (mfaInfo.backupCodes.length <= 3) {
      Logger.warn('User running low on backup codes', { 
        userId, 
        remainingCodes: mfaInfo.backupCodes.length 
      });
    }

    return {
      valid: true,
      method: 'backup_code'
    };
  }

  /**
   * Generate new backup codes
   */
  static generateNewBackupCodes(userId: string, totpCode?: string): { success: boolean; backupCodes?: string[]; error?: string } {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.isEnabled) {
      return {
        success: false,
        error: 'MFA is not enabled for this user'
      };
    }

    // Verify TOTP if provided (recommended for security)
    if (totpCode) {
      const validation = this.validateTOTP(userId, totpCode);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }
    }

    // Generate new backup codes
    const newBackupCodes = this.generateBackupCodes();
    
    // Invalidate old backup codes
    mfaInfo.backupCodes.forEach(code => {
      usedBackupCodes.add(`${userId}:${code}`);
    });

    // Update user's backup codes
    mfaInfo.backupCodes = newBackupCodes;
    userMFAData.set(userId, mfaInfo);

    Logger.info('New backup codes generated', { userId });

    return {
      success: true,
      backupCodes: newBackupCodes
    };
  }

  /**
   * Get MFA status for user
   */
  static getMFAStatus(userId: string): {
    isEnabled: boolean;
    methods: string[];
    backupCodesCount: number;
    setupAt?: Date;
    lastUsedAt?: Date;
  } {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo) {
      return {
        isEnabled: false,
        methods: [],
        backupCodesCount: 0
      };
    }

    return {
      isEnabled: mfaInfo.isEnabled,
      methods: mfaInfo.methods,
      backupCodesCount: mfaInfo.backupCodes.length,
      setupAt: mfaInfo.setupAt,
      lastUsedAt: mfaInfo.lastUsedAt
    };
  }

  /**
   * Check if user has MFA enabled
   */
  static isMFAEnabled(userId: string): boolean {
    const mfaInfo = userMFAData.get(userId);
    return mfaInfo?.isEnabled || false;
  }

  /**
   * Get QR code for existing setup (admin function)
   */
  static async getQRCode(userId: string, userEmail: string): Promise<string | null> {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo || !mfaInfo.secret) {
      return null;
    }

    try {
      const uri = authenticator.keyuri(userEmail, this.APP_NAME, mfaInfo.secret);
      return await QRCode.toDataURL(uri);
    } catch (error: any) {
      Logger.error('QR code generation failed', { userId, error: error.message });
      return null;
    }
  }

  /**
   * Generate secure backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = crypto.randomBytes(this.BACKUP_CODE_LENGTH / 2).toString('hex');
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Clean up expired data
   */
  static cleanup(): void {
    const now = Date.now();
    const expiryThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days

    let cleanedCodes = 0;
    for (const codeKey of usedBackupCodes) {
      // In a real implementation, you'd track when codes were used
      // For now, we'll clean up based on a simple count
      cleanedCodes++;
    }

    // Clear old used codes (simplified - in production, track usage timestamps)
    if (usedBackupCodes.size > 10000) {
      usedBackupCodes.clear();
      Logger.info('Used backup codes cleared', { count: cleanedCodes });
    }
  }

  /**
   * Get MFA statistics
   */
  static getMFAStats(): {
    totalUsers: number;
    enabledUsers: number;
    totpUsers: number;
    averageBackupCodes: number;
  } {
    const allUsers = Array.from(userMFAData.values());
    const enabledUsers = allUsers.filter(u => u.isEnabled);
    const totpUsers = enabledUsers.filter(u => u.methods.includes('totp'));
    
    const totalBackupCodes = enabledUsers.reduce((sum, u) => sum + u.backupCodes.length, 0);
    const averageBackupCodes = enabledUsers.length > 0 ? totalBackupCodes / enabledUsers.length : 0;

    return {
      totalUsers: allUsers.length,
      enabledUsers: enabledUsers.length,
      totpUsers: totpUsers.length,
      averageBackupCodes: Math.round(averageBackupCodes * 100) / 100
    };
  }

  /**
   * Force disable MFA for user (admin function)
   */
  static forceDisableMFA(userId: string, adminUserId: string): boolean {
    const mfaInfo = userMFAData.get(userId);
    
    if (!mfaInfo) {
      return false;
    }

    // Invalidate backup codes
    mfaInfo.backupCodes.forEach(code => {
      usedBackupCodes.add(`${userId}:${code}`);
    });

    userMFAData.delete(userId);

    Logger.warn('MFA force disabled by admin', { 
      userId, 
      adminUserId,
      wasEnabled: mfaInfo.isEnabled 
    });

    return true;
  }

  /**
   * Initialize cleanup interval
   */
  static initializeCleanup(): void {
    // Run cleanup weekly
    setInterval(() => {
      this.cleanup();
    }, 7 * 24 * 60 * 60 * 1000);

    Logger.info('MFA service cleanup interval initialized');
  }
}

// Initialize cleanup when server starts (not during module load)
// MFAService.initializeCleanup(); // Will be called from startup