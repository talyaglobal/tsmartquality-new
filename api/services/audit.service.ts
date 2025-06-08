import crypto from 'crypto';
import { Logger } from '../startup';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  companyId?: number;
  category: AuditCategory;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'user_management'
  | 'product_management'
  | 'quality_check'
  | 'data_access'
  | 'data_modification'
  | 'system_configuration'
  | 'security'
  | 'compliance'
  | 'api_access';

export interface AuditQuery {
  userId?: string;
  companyId?: number;
  category?: AuditCategory;
  action?: string;
  resource?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface AuditSummary {
  totalEvents: number;
  categoryCounts: Record<AuditCategory, number>;
  severityCounts: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
  recentEvents: AuditEvent[];
}

// In-memory storage (in production, use database with proper indexing)
const auditEvents = new Map<string, AuditEvent>();
const userEventCounts = new Map<string, number>();
const actionEventCounts = new Map<string, number>();

export class AuditService {
  private static readonly MAX_EVENTS = 50000; // Limit for in-memory storage
  private static readonly BATCH_SIZE = 1000;

  /**
   * Log an audit event
   */
  static async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    // Store the event
    auditEvents.set(auditEvent.id, auditEvent);

    // Update counters
    if (auditEvent.userId) {
      const currentCount = userEventCounts.get(auditEvent.userId) || 0;
      userEventCounts.set(auditEvent.userId, currentCount + 1);
    }

    const currentActionCount = actionEventCounts.get(auditEvent.action) || 0;
    actionEventCounts.set(auditEvent.action, currentActionCount + 1);

    // Clean up if we exceed max events
    if (auditEvents.size > this.MAX_EVENTS) {
      await this.cleanup();
    }

    // Log to application logger based on severity
    const logData = {
      auditId: auditEvent.id,
      userId: auditEvent.userId,
      action: auditEvent.action,
      resource: auditEvent.resource,
      success: auditEvent.success,
      ipAddress: auditEvent.ipAddress
    };

    switch (auditEvent.severity) {
      case 'critical':
        Logger.error(`AUDIT[${auditEvent.category}]: ${auditEvent.action}`, logData);
        break;
      case 'high':
        Logger.warn(`AUDIT[${auditEvent.category}]: ${auditEvent.action}`, logData);
        break;
      case 'medium':
        Logger.info(`AUDIT[${auditEvent.category}]: ${auditEvent.action}`, logData);
        break;
      default:
        Logger.debug(`AUDIT[${auditEvent.category}]: ${auditEvent.action}`, logData);
    }

    return auditEvent.id;
  }

  /**
   * Log authentication event
   */
  static async logAuthentication(params: {
    userId?: string;
    sessionId?: string;
    action: 'login' | 'logout' | 'login_failed' | 'token_refresh' | 'mfa_setup' | 'mfa_verify' | 'demo_login';
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'authentication',
      resource: 'user_session',
      severity: params.success ? 'low' : 'medium'
    });
  }

  /**
   * Log authorization event
   */
  static async logAuthorization(params: {
    userId: string;
    sessionId?: string;
    companyId?: number;
    action: 'access_granted' | 'access_denied' | 'permission_check';
    resource: string;
    resourceId?: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'authorization',
      severity: params.success ? 'low' : 'medium'
    });
  }

  /**
   * Log data access event
   */
  static async logDataAccess(params: {
    userId: string;
    sessionId?: string;
    companyId?: number;
    action: 'read' | 'list' | 'search' | 'export';
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'data_access',
      success: true,
      severity: 'low'
    });
  }

  /**
   * Log data modification event
   */
  static async logDataModification(params: {
    userId: string;
    sessionId?: string;
    companyId?: number;
    action: 'create' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete';
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'data_modification',
      severity: params.action.includes('delete') ? 'high' : 'medium'
    });
  }

  /**
   * Log user management event
   */
  static async logUserManagement(params: {
    userId: string;
    sessionId?: string;
    companyId?: number;
    action: 'user_create' | 'user_update' | 'user_delete' | 'role_change' | 'password_change' | 'account_lock' | 'account_unlock';
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'user_management',
      resource: 'user',
      severity: ['user_delete', 'role_change'].includes(params.action) ? 'high' : 'medium'
    });
  }

  /**
   * Log security event
   */
  static async logSecurity(params: {
    userId?: string;
    sessionId?: string;
    companyId?: number;
    action: 'suspicious_activity' | 'brute_force' | 'account_lockout' | 'mfa_bypass_attempt' | 'token_hijack' | 'ip_blacklist';
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: any;
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'security',
      severity: 'critical'
    });
  }

  /**
   * Log API access event
   */
  static async logAPIAccess(params: {
    userId?: string;
    sessionId?: string;
    companyId?: number;
    action: string; // HTTP method + endpoint
    resource: string;
    resourceId?: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    metadata?: {
      method?: string;
      endpoint?: string;
      statusCode?: number;
      responseTime?: number;
      requestSize?: number;
      responseSize?: number;
    };
  }): Promise<string> {
    return await this.logEvent({
      ...params,
      category: 'api_access',
      severity: 'low'
    });
  }

  /**
   * Query audit events
   */
  static queryEvents(query: AuditQuery = {}): AuditEvent[] {
    let events = Array.from(auditEvents.values());

    // Apply filters
    if (query.userId) {
      events = events.filter(e => e.userId === query.userId);
    }

    if (query.companyId) {
      events = events.filter(e => e.companyId === query.companyId);
    }

    if (query.category) {
      events = events.filter(e => e.category === query.category);
    }

    if (query.action) {
      events = events.filter(e => e.action === query.action);
    }

    if (query.resource) {
      events = events.filter(e => e.resource === query.resource);
    }

    if (query.severity) {
      events = events.filter(e => e.severity === query.severity);
    }

    if (query.startDate) {
      events = events.filter(e => e.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      events = events.filter(e => e.timestamp <= query.endDate!);
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      events = events.filter(e => 
        e.action.toLowerCase().includes(searchLower) ||
        e.resource.toLowerCase().includes(searchLower) ||
        (e.errorMessage && e.errorMessage.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return events.slice(offset, offset + limit);
  }

  /**
   * Get audit summary
   */
  static getSummary(query: Partial<AuditQuery> = {}): AuditSummary {
    const events = this.queryEvents({ ...query, limit: undefined, offset: undefined });

    // Category counts
    const categoryCounts = {} as Record<AuditCategory, number>;
    const categories: AuditCategory[] = [
      'authentication', 'authorization', 'user_management', 'product_management',
      'quality_check', 'data_access', 'data_modification', 'system_configuration',
      'security', 'compliance', 'api_access'
    ];
    
    categories.forEach(cat => categoryCounts[cat] = 0);
    
    // Severity counts
    const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };

    // User counts
    const userCounts = new Map<string, number>();
    
    // Action counts
    const actionCounts = new Map<string, number>();

    events.forEach(event => {
      categoryCounts[event.category]++;
      severityCounts[event.severity]++;
      
      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }
      
      actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
    });

    // Top users
    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top actions
    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent events
    const recentEvents = events.slice(0, 20);

    return {
      totalEvents: events.length,
      categoryCounts,
      severityCounts,
      topUsers,
      topActions,
      recentEvents
    };
  }

  /**
   * Get events for specific user
   */
  static getUserEvents(userId: string, limit: number = 100): AuditEvent[] {
    return this.queryEvents({ userId, limit });
  }

  /**
   * Get events for specific company
   */
  static getCompanyEvents(companyId: number, limit: number = 100): AuditEvent[] {
    return this.queryEvents({ companyId, limit });
  }

  /**
   * Get security events
   */
  static getSecurityEvents(limit: number = 100): AuditEvent[] {
    return this.queryEvents({ 
      category: 'security', 
      limit,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    });
  }

  /**
   * Get failed authentication events
   */
  static getFailedAuthentications(timeRange: number = 24 * 60 * 60 * 1000): AuditEvent[] {
    return this.queryEvents({
      category: 'authentication',
      startDate: new Date(Date.now() - timeRange),
      limit: 1000
    }).filter(e => !e.success);
  }

  /**
   * Check for suspicious patterns
   */
  static detectSuspiciousPatterns(): {
    suspiciousUsers: Array<{ userId: string; reason: string; eventCount: number }>;
    suspiciousIPs: Array<{ ipAddress: string; reason: string; eventCount: number }>;
  } {
    const suspiciousUsers: Array<{ userId: string; reason: string; eventCount: number }> = [];
    const suspiciousIPs: Array<{ ipAddress: string; reason: string; eventCount: number }> = [];

    const recentEvents = this.queryEvents({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      limit: 10000
    });

    // Group by user
    const userEventCounts = new Map<string, number>();
    const userFailedLogins = new Map<string, number>();
    
    // Group by IP
    const ipEventCounts = new Map<string, number>();
    const ipFailedLogins = new Map<string, number>();

    recentEvents.forEach(event => {
      if (event.userId) {
        userEventCounts.set(event.userId, (userEventCounts.get(event.userId) || 0) + 1);
        
        if (event.category === 'authentication' && !event.success) {
          userFailedLogins.set(event.userId, (userFailedLogins.get(event.userId) || 0) + 1);
        }
      }

      if (event.ipAddress) {
        ipEventCounts.set(event.ipAddress, (ipEventCounts.get(event.ipAddress) || 0) + 1);
        
        if (event.category === 'authentication' && !event.success) {
          ipFailedLogins.set(event.ipAddress, (ipFailedLogins.get(event.ipAddress) || 0) + 1);
        }
      }
    });

    // Detect suspicious users
    userEventCounts.forEach((count, userId) => {
      if (count > 1000) {
        suspiciousUsers.push({
          userId,
          reason: 'Excessive API activity',
          eventCount: count
        });
      }
    });

    userFailedLogins.forEach((count, userId) => {
      if (count > 10) {
        suspiciousUsers.push({
          userId,
          reason: 'Multiple failed login attempts',
          eventCount: count
        });
      }
    });

    // Detect suspicious IPs
    ipEventCounts.forEach((count, ipAddress) => {
      if (count > 2000) {
        suspiciousIPs.push({
          ipAddress,
          reason: 'Excessive requests',
          eventCount: count
        });
      }
    });

    ipFailedLogins.forEach((count, ipAddress) => {
      if (count > 20) {
        suspiciousIPs.push({
          ipAddress,
          reason: 'Multiple failed login attempts',
          eventCount: count
        });
      }
    });

    return { suspiciousUsers, suspiciousIPs };
  }

  /**
   * Export audit events to CSV
   */
  static exportToCSV(query: AuditQuery = {}): string {
    const events = this.queryEvents(query);
    
    const headers = [
      'ID', 'Timestamp', 'User ID', 'Company ID', 'Category', 'Action', 
      'Resource', 'Resource ID', 'Success', 'IP Address', 'Severity', 'Error Message'
    ];

    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.userId || '',
      event.companyId?.toString() || '',
      event.category,
      event.action,
      event.resource,
      event.resourceId || '',
      event.success.toString(),
      event.ipAddress || '',
      event.severity,
      event.errorMessage || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Clean up old events
   */
  private static async cleanup(): Promise<void> {
    const events = Array.from(auditEvents.values());
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Keep only the most recent events
    const eventsToKeep = events.slice(-this.MAX_EVENTS * 0.8); // Keep 80% of max
    const eventsToRemove = events.slice(0, events.length - eventsToKeep.length);

    // Remove old events
    eventsToRemove.forEach(event => {
      auditEvents.delete(event.id);
    });

    Logger.info('Audit events cleanup completed', {
      removed: eventsToRemove.length,
      remaining: auditEvents.size
    });
  }

  /**
   * Get audit statistics
   */
  static getStatistics(): {
    totalEvents: number;
    eventsLast24h: number;
    eventsLast7d: number;
    topCategories: Array<{ category: string; count: number }>;
    averageEventsPerDay: number;
  } {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;

    const events = Array.from(auditEvents.values());
    const eventsLast24h = events.filter(e => now - e.timestamp.getTime() < day).length;
    const eventsLast7d = events.filter(e => now - e.timestamp.getTime() < week).length;

    // Category counts
    const categoryCounts = new Map<string, number>();
    events.forEach(event => {
      categoryCounts.set(event.category, (categoryCounts.get(event.category) || 0) + 1);
    });

    const topCategories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const averageEventsPerDay = eventsLast7d / 7;

    return {
      totalEvents: events.length,
      eventsLast24h,
      eventsLast7d,
      topCategories,
      averageEventsPerDay: Math.round(averageEventsPerDay)
    };
  }

  /**
   * Initialize cleanup interval
   */
  static initializeCleanup(): void {
    // Run cleanup daily
    setInterval(() => {
      if (auditEvents.size > this.MAX_EVENTS) {
        this.cleanup();
      }
    }, 24 * 60 * 60 * 1000);

    Logger.info('Audit service cleanup interval initialized');
  }
}

// Initialize cleanup when server starts (not during module load)
// AuditService.initializeCleanup(); // Will be called from startup