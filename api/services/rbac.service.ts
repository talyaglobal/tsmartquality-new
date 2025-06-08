import { Logger } from '../startup';

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: 'own' | 'company' | 'global';
  conditions?: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1 = highest authority
  permissions: Permission[];
  inherits?: string[]; // Role IDs this role inherits from
}

export interface AccessContext {
  userId: string;
  companyId: number;
  role: string;
  resourceOwnerId?: string;
  resourceCompanyId?: number;
  requestedResource: string;
  requestedAction: string;
  additionalContext?: any;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
  requiredRole?: string;
  requiredPermission?: string;
}

export class RBACService {
  private static roles: Map<string, Role> = new Map();
  private static permissions: Map<string, Permission> = new Map();

  /**
   * Initialize RBAC system with default roles and permissions
   */
  static initialize(): void {
    this.definePermissions();
    this.defineRoles();
    Logger.info('RBAC system initialized');
  }

  /**
   * Define all system permissions
   */
  private static definePermissions(): void {
    const permissions: Permission[] = [
      // User Management
      { id: 'user:create', resource: 'user', action: 'create', scope: 'company' },
      { id: 'user:read', resource: 'user', action: 'read', scope: 'company' },
      { id: 'user:read:own', resource: 'user', action: 'read', scope: 'own' },
      { id: 'user:update', resource: 'user', action: 'update', scope: 'company' },
      { id: 'user:update:own', resource: 'user', action: 'update', scope: 'own' },
      { id: 'user:delete', resource: 'user', action: 'delete', scope: 'company' },
      { id: 'user:manage_roles', resource: 'user', action: 'manage_roles', scope: 'company' },

      // Product Management
      { id: 'product:create', resource: 'product', action: 'create', scope: 'company' },
      { id: 'product:read', resource: 'product', action: 'read', scope: 'company' },
      { id: 'product:update', resource: 'product', action: 'update', scope: 'company' },
      { id: 'product:delete', resource: 'product', action: 'delete', scope: 'company' },
      { id: 'product:bulk_ops', resource: 'product', action: 'bulk_operations', scope: 'company' },
      { id: 'product:export', resource: 'product', action: 'export', scope: 'company' },
      { id: 'product:upload_photos', resource: 'product', action: 'upload_photos', scope: 'company' },

      // Quality Check Management
      { id: 'quality_check:create', resource: 'quality_check', action: 'create', scope: 'company' },
      { id: 'quality_check:read', resource: 'quality_check', action: 'read', scope: 'company' },
      { id: 'quality_check:read:own', resource: 'quality_check', action: 'read', scope: 'own' },
      { id: 'quality_check:update', resource: 'quality_check', action: 'update', scope: 'company' },
      { id: 'quality_check:update:own', resource: 'quality_check', action: 'update', scope: 'own' },
      { id: 'quality_check:delete', resource: 'quality_check', action: 'delete', scope: 'company' },
      { id: 'quality_check:delete:own', resource: 'quality_check', action: 'delete', scope: 'own' },
      { id: 'quality_check:approve', resource: 'quality_check', action: 'approve', scope: 'company' },

      // Company Management
      { id: 'company:read', resource: 'company', action: 'read', scope: 'own' },
      { id: 'company:update', resource: 'company', action: 'update', scope: 'own' },
      { id: 'company:manage_settings', resource: 'company', action: 'manage_settings', scope: 'own' },
      { id: 'company:view_analytics', resource: 'company', action: 'view_analytics', scope: 'own' },

      // Reports and Analytics
      { id: 'report:read', resource: 'report', action: 'read', scope: 'company' },
      { id: 'report:create', resource: 'report', action: 'create', scope: 'company' },
      { id: 'report:export', resource: 'report', action: 'export', scope: 'company' },
      { id: 'analytics:view', resource: 'analytics', action: 'view', scope: 'company' },

      // System Administration
      { id: 'system:admin', resource: 'system', action: 'admin', scope: 'global' },
      { id: 'system:logs', resource: 'system', action: 'view_logs', scope: 'global' },
      { id: 'system:health', resource: 'system', action: 'view_health', scope: 'global' },

      // Audit and Security
      { id: 'audit:read', resource: 'audit', action: 'read', scope: 'company' },
      { id: 'security:manage', resource: 'security', action: 'manage', scope: 'company' },
      { id: 'session:manage', resource: 'session', action: 'manage', scope: 'own' },
      { id: 'session:manage_all', resource: 'session', action: 'manage_all', scope: 'company' }
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    Logger.info('Permissions defined', { count: permissions.length });
  }

  /**
   * Define system roles with hierarchical structure
   */
  private static defineRoles(): void {
    const roles: Role[] = [
      // Super Admin (System Level)
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'System-wide administrative access',
        level: 1,
        permissions: Array.from(this.permissions.values())
      },

      // Company Admin
      {
        id: 'admin',
        name: 'Company Administrator',
        description: 'Full administrative access within company',
        level: 2,
        permissions: [
          ...this.getPermissionsByResource(['user', 'product', 'quality_check', 'company', 'report', 'analytics', 'audit', 'security', 'session'])
        ]
      },

      // Manager
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management access with oversight capabilities',
        level: 3,
        permissions: [
          // User management (limited)
          this.permissions.get('user:read')!,
          this.permissions.get('user:update:own')!,

          // Full product management
          ...this.getPermissionsByResource(['product']),

          // Quality check management
          ...this.getPermissionsByResource(['quality_check']),

          // Reports and analytics
          this.permissions.get('report:read')!,
          this.permissions.get('report:create')!,
          this.permissions.get('report:export')!,
          this.permissions.get('analytics:view')!,

          // Company read access
          this.permissions.get('company:read')!,
          this.permissions.get('company:view_analytics')!,

          // Session management
          this.permissions.get('session:manage')!
        ]
      },

      // Inspector
      {
        id: 'inspector',
        name: 'Quality Inspector',
        description: 'Quality control and inspection responsibilities',
        level: 4,
        permissions: [
          // Own profile management
          this.permissions.get('user:read:own')!,
          this.permissions.get('user:update:own')!,

          // Product read access
          this.permissions.get('product:read')!,

          // Quality check management (own checks + create new)
          this.permissions.get('quality_check:create')!,
          this.permissions.get('quality_check:read')!,
          this.permissions.get('quality_check:read:own')!,
          this.permissions.get('quality_check:update:own')!,
          this.permissions.get('quality_check:delete:own')!,

          // Basic reporting
          this.permissions.get('report:read')!,

          // Session management
          this.permissions.get('session:manage')!
        ]
      },

      // Standard User
      {
        id: 'user',
        name: 'User',
        description: 'Basic user with read-only access',
        level: 5,
        permissions: [
          // Own profile management
          this.permissions.get('user:read:own')!,
          this.permissions.get('user:update:own')!,

          // Read-only access to products
          this.permissions.get('product:read')!,

          // Read-only access to quality checks
          this.permissions.get('quality_check:read')!,

          // Basic reporting
          this.permissions.get('report:read')!,

          // Session management
          this.permissions.get('session:manage')!
        ]
      },

      // Viewer (Read-only)
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to basic information',
        level: 6,
        permissions: [
          // Own profile read
          this.permissions.get('user:read:own')!,

          // Read-only access
          this.permissions.get('product:read')!,
          this.permissions.get('quality_check:read')!,
          this.permissions.get('report:read')!,

          // Session management
          this.permissions.get('session:manage')!
        ]
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });

    Logger.info('Roles defined', { count: roles.length });
  }

  /**
   * Check if user has access to perform an action on a resource
   */
  static checkAccess(context: AccessContext): AccessResult {
    const role = this.roles.get(context.role);
    
    if (!role) {
      return {
        granted: false,
        reason: 'Invalid role'
      };
    }

    // Check for specific permission
    const requiredPermissionId = `${context.requestedResource}:${context.requestedAction}`;
    const hasPermission = this.hasPermission(role, requiredPermissionId, context);

    if (hasPermission) {
      Logger.debug('Access granted', {
        userId: context.userId,
        role: context.role,
        resource: context.requestedResource,
        action: context.requestedAction
      });

      return { granted: true };
    }

    // Check for scope-specific permission
    const scopedPermissionId = `${requiredPermissionId}:own`;
    const hasScopedPermission = this.hasPermission(role, scopedPermissionId, context);

    if (hasScopedPermission && this.checkScopeAccess(context)) {
      Logger.debug('Scoped access granted', {
        userId: context.userId,
        role: context.role,
        resource: context.requestedResource,
        action: context.requestedAction,
        scope: 'own'
      });

      return { granted: true };
    }

    Logger.warn('Access denied', {
      userId: context.userId,
      role: context.role,
      resource: context.requestedResource,
      action: context.requestedAction,
      reason: 'Insufficient permissions'
    });

    return {
      granted: false,
      reason: 'Insufficient permissions',
      requiredPermission: requiredPermissionId
    };
  }

  /**
   * Check if role has specific permission
   */
  private static hasPermission(role: Role, permissionId: string, context: AccessContext): boolean {
    // Direct permission check
    const hasDirectPermission = role.permissions.some(p => p.id === permissionId);
    if (hasDirectPermission) {
      return true;
    }

    // Check inherited roles
    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedRole = this.roles.get(inheritedRoleId);
        if (inheritedRole && this.hasPermission(inheritedRole, permissionId, context)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check scope-based access (own resources)
   */
  private static checkScopeAccess(context: AccessContext): boolean {
    // For 'own' scope, check if user owns the resource
    if (context.resourceOwnerId && context.resourceOwnerId === context.userId) {
      return true;
    }

    // For company scope, check if resource belongs to user's company
    if (context.resourceCompanyId && context.resourceCompanyId === context.companyId) {
      return true;
    }

    return false;
  }

  /**
   * Get permissions by resource
   */
  private static getPermissionsByResource(resources: string[]): Permission[] {
    return Array.from(this.permissions.values()).filter(p => 
      resources.includes(p.resource)
    );
  }

  /**
   * Get role by ID
   */
  static getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all roles
   */
  static getAllRoles(): Role[] {
    return Array.from(this.roles.values()).sort((a, b) => a.level - b.level);
  }

  /**
   * Get permissions for role
   */
  static getRolePermissions(roleId: string): Permission[] {
    const role = this.roles.get(roleId);
    return role ? role.permissions : [];
  }

  /**
   * Check if role exists and is valid
   */
  static isValidRole(roleId: string): boolean {
    return this.roles.has(roleId);
  }

  /**
   * Get role hierarchy (roles that can be assigned by current role)
   */
  static getAssignableRoles(currentRole: string): Role[] {
    const current = this.roles.get(currentRole);
    if (!current) return [];

    return Array.from(this.roles.values())
      .filter(role => role.level >= current.level) // Can only assign same or lower level roles
      .sort((a, b) => a.level - b.level);
  }

  /**
   * Can role A manage role B?
   */
  static canManageRole(managerRole: string, targetRole: string): boolean {
    const manager = this.roles.get(managerRole);
    const target = this.roles.get(targetRole);

    if (!manager || !target) return false;

    // Can manage roles of same or lower level
    return manager.level <= target.level;
  }

  /**
   * Get effective permissions for a user (including inherited)
   */
  static getEffectivePermissions(roleId: string): Permission[] {
    const role = this.roles.get(roleId);
    if (!role) return [];

    const permissions = new Set<Permission>();

    // Add direct permissions
    role.permissions.forEach(p => permissions.add(p));

    // Add inherited permissions
    if (role.inherits) {
      role.inherits.forEach(inheritedRoleId => {
        const inheritedPermissions = this.getEffectivePermissions(inheritedRoleId);
        inheritedPermissions.forEach(p => permissions.add(p));
      });
    }

    return Array.from(permissions);
  }

  /**
   * Create custom permission check function
   */
  static createPermissionChecker(context: Partial<AccessContext>) {
    return (resource: string, action: string, additionalContext?: any): boolean => {
      const fullContext: AccessContext = {
        ...context,
        requestedResource: resource,
        requestedAction: action,
        additionalContext,
      } as AccessContext;

      return this.checkAccess(fullContext).granted;
    };
  }
}

// Initialize RBAC when server starts (not during module load)
// RBACService.initialize(); // Will be called from startup