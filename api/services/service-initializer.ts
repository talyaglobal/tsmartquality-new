import { Logger } from '../startup';
import { TokenService } from './token.service';
import { SecurityService } from './security.service';
import { MFAService } from './mfa.service';
import { AuditService } from './audit.service';
import { RBACService } from './rbac.service';

export class ServiceInitializer {
  static async initializeAll(): Promise<void> {
    try {
      Logger.info('Initializing authentication and security services...');

      // Initialize RBAC system first (as other services depend on it)
      RBACService.initialize();
      
      // Initialize cleanup intervals for all services
      TokenService.initializeCleanup();
      SecurityService.initializeCleanup();
      MFAService.initializeCleanup();
      AuditService.initializeCleanup();

      Logger.info('All authentication and security services initialized successfully');
    } catch (error: any) {
      Logger.error('Failed to initialize services', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static getServiceStatus(): {
    rbac: boolean;
    tokenService: boolean;
    securityService: boolean;
    mfaService: boolean;
    auditService: boolean;
  } {
    // Basic health check for services
    return {
      rbac: RBACService.getAllRoles().length > 0,
      tokenService: true, // TokenService is stateless
      securityService: true, // SecurityService is stateless
      mfaService: true, // MFAService is stateless
      auditService: true // AuditService is stateless
    };
  }
}