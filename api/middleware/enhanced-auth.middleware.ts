import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { TokenService, TokenValidationResult } from '../services/token.service';
import { RBACService, AccessContext } from '../services/rbac.service';
import { SecurityService } from '../services/security.service';
import { Logger } from '../startup';

export interface EnhancedAuthRequest extends Request {
  user?: any;
  companyId?: number;
  userId?: string;
  role?: string;
  sessionId?: string;
  deviceId?: string;
  tokenPayload?: any;
  securityContext?: {
    ipAddress: string;
    userAgent: string;
    isNewDevice: boolean;
    riskScore: number;
  };
}

export interface AuthOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
  resource?: string;
  action?: string;
  allowOwner?: boolean;
  skipUserValidation?: boolean;
}

/**
 * Enhanced authentication middleware with comprehensive security
 */
export const enhancedAuth = (options: AuthOptions = {}) => {
  return async (req: EnhancedAuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const token = extractToken(req);
      const clientInfo = extractClientInfo(req);

      // If authentication is not required and no token provided
      if (!options.required && !token) {
        return next();
      }

      // If authentication is required but no token provided
      if (options.required !== false && !token) {
        return sendAuthError(res, 'Authentication token required', 401);
      }

      if (!token) {
        return next();
      }

      // Validate access token
      const validation = TokenService.validateAccessToken(token);
      
      if (!validation.isValid) {
        // Handle token refresh if needed
        if (validation.needsRefresh) {
          return sendAuthError(res, 'Token expired', 401, {
            code: 'TOKEN_EXPIRED',
            needsRefresh: true
          });
        }

        return sendAuthError(res, validation.error || 'Invalid token', 401);
      }

      const payload = validation.payload!;

      // Validate user exists and is active
      if (!options.skipUserValidation) {
        const user = await UserModel.findById(payload.userId);
        
        if (!user) {
          TokenService.revokeToken(token, 'user_not_found');
          return sendAuthError(res, 'User not found', 401);
        }

        if (!user.is_active) {
          TokenService.revokeToken(token, 'user_inactive');
          return sendAuthError(res, 'Account is inactive', 403);
        }

        req.user = user;
      }

      // Set request context
      req.userId = payload.userId;
      req.companyId = payload.companyId;
      req.role = payload.role;
      req.sessionId = payload.sessionId;
      req.deviceId = payload.deviceId;
      req.tokenPayload = payload;

      // Security checks
      const securityResult = await SecurityService.validateRequest({
        userId: payload.userId,
        sessionId: payload.sessionId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: payload.deviceId,
        token
      });

      if (!securityResult.allowed) {
        if (token) {
          TokenService.revokeToken(token, securityResult.reason);
        }
        return sendAuthError(res, securityResult.message || 'Security validation failed', 403, {
          code: 'SECURITY_VIOLATION',
          reason: securityResult.reason
        });
      }

      req.securityContext = {
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        isNewDevice: securityResult.isNewDevice,
        riskScore: securityResult.riskScore
      };

      // Role-based authorization
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(payload.role)) {
          return sendAuthError(res, 'Insufficient role permissions', 403, {
            code: 'INSUFFICIENT_ROLE',
            requiredRoles: options.roles,
            userRole: payload.role
          });
        }
      }

      // Permission-based authorization
      if (options.permissions && options.permissions.length > 0) {
        const hasPermission = await checkUserPermissions(payload, options.permissions);
        if (!hasPermission) {
          return sendAuthError(res, 'Insufficient permissions', 403, {
            code: 'INSUFFICIENT_PERMISSIONS',
            requiredPermissions: options.permissions
          });
        }
      }

      // Resource-based authorization
      if (options.resource && options.action) {
        const accessContext: AccessContext = {
          userId: payload.userId,
          companyId: payload.companyId,
          role: payload.role,
          requestedResource: options.resource,
          requestedAction: options.action,
          resourceOwnerId: req.params.userId || req.body.userId,
          resourceCompanyId: req.params.companyId || req.body.companyId
        };

        const accessResult = RBACService.checkAccess(accessContext);
        if (!accessResult.granted) {
          return sendAuthError(res, accessResult.reason || 'Access denied', 403, {
            code: 'ACCESS_DENIED',
            requiredPermission: accessResult.requiredPermission
          });
        }
      }

      // Log successful authentication
      Logger.debug('Authentication successful', {
        userId: payload.userId,
        role: payload.role,
        sessionId: payload.sessionId,
        ipAddress: clientInfo.ipAddress,
        endpoint: `${req.method} ${req.path}`
      });

      // Warn about token refresh if needed
      if (validation.needsRefresh) {
        res.setHeader('X-Token-Refresh-Needed', 'true');
      }

      next();

    } catch (error: any) {
      Logger.error('Authentication error', {
        error: error.message,
        stack: error.stack,
        endpoint: `${req.method} ${req.path}`,
        ipAddress: req.ip
      });

      return sendAuthError(res, 'Authentication failed', 500);
    }
  };
};

/**
 * Middleware for specific resource authorization
 */
export const requirePermission = (resource: string, action: string, options: {
  allowOwner?: boolean;
  resourceIdParam?: string;
} = {}) => {
  return async (req: EnhancedAuthRequest, res: Response, next: NextFunction): Promise<any> => {
    if (!req.userId || !req.role) {
      return sendAuthError(res, 'Authentication required', 401);
    }

    const resourceId = options.resourceIdParam ? req.params[options.resourceIdParam] : req.params.id;
    
    const accessContext: AccessContext = {
      userId: req.userId,
      companyId: req.companyId!,
      role: req.role,
      requestedResource: resource,
      requestedAction: action,
      resourceOwnerId: resourceId,
      resourceCompanyId: req.companyId
    };

    const accessResult = RBACService.checkAccess(accessContext);
    
    if (!accessResult.granted) {
      return sendAuthError(res, accessResult.reason || 'Access denied', 403, {
        code: 'PERMISSION_DENIED',
        resource,
        action,
        requiredPermission: accessResult.requiredPermission
      });
    }

    next();
  };
};

/**
 * Middleware for role-based authorization
 */
export const requireRole = (roles: string | string[]) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return enhancedAuth({
    required: true,
    roles: roleArray
  });
};

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = () => requireRole(['admin', 'super_admin']);

/**
 * Middleware for manager or higher roles
 */
export const requireManager = () => requireRole(['admin', 'super_admin', 'manager']);

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check for token in cookies as fallback
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Extract client information from request
 */
function extractClientInfo(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  };
}

/**
 * Check if user has required permissions
 */
async function checkUserPermissions(payload: any, permissions: string[]): Promise<boolean> {
  const userPermissions = RBACService.getRolePermissions(payload.role);
  const userPermissionIds = userPermissions.map(p => p.id);

  return permissions.every(permission => userPermissionIds.includes(permission));
}

/**
 * Send authentication error response
 */
function sendAuthError(
  res: Response, 
  message: string, 
  statusCode: number = 401, 
  additional?: any
): void {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...additional
  };

  res.status(statusCode).json(response);
}

/**
 * Optional authentication - proceed regardless of token validity
 */
export const optionalAuth = () => enhancedAuth({ required: false });

/**
 * Strict authentication - require valid token
 */
export const strictAuth = () => enhancedAuth({ required: true });

/**
 * Owner or admin authorization - allow resource owner or admin
 */
export const ownerOrAdmin = (resourceIdParam: string = 'id') => {
  return async (req: EnhancedAuthRequest, res: Response, next: NextFunction): Promise<any> => {
    if (!req.userId || !req.role) {
      return sendAuthError(res, 'Authentication required', 401);
    }

    const resourceId = req.params[resourceIdParam];
    const isOwner = resourceId === req.userId;
    const isAdmin = ['admin', 'super_admin'].includes(req.role);

    if (!isOwner && !isAdmin) {
      return sendAuthError(res, 'Access denied - must be owner or admin', 403);
    }

    next();
  };
};