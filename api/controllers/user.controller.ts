import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthRequest } from '../middleware/auth.middleware';
import { ControllerHelpers, ValidationError } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { Logger } from '../startup';

// Rate limiting storage for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export class UserController {
  static async register(req: Request, res: Response): Promise<any> {
    try {
      const { username, name, surname, email, password, companyId, role } = req.body;
      
      // Comprehensive validation
      const validationErrors: ValidationError[] = [];
      
      // Business rules validation
      const businessRuleErrors = BusinessRules.validateUserData({
        username,
        name,
        surname,
        email,
        password,
        companyId,
        role
      });
      validationErrors.push(...businessRuleErrors);

      // Password strength validation
      if (password) {
        const passwordErrors = ControllerHelpers.validatePassword(password);
        validationErrors.push(...passwordErrors);
      }

      // Email format validation
      if (email) {
        const emailError = ControllerHelpers.validateEmail(email);
        if (emailError) validationErrors.push(emailError);
      }

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      // Check for existing user by email
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        return ControllerHelpers.sendError(res, 'Email already in use', 409, [{
          field: 'email',
          message: 'This email address is already registered',
          code: 'EMAIL_EXISTS'
        }]);
      }

      // Check for existing user by username
      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        return ControllerHelpers.sendError(res, 'Username already in use', 409, [{
          field: 'username',
          message: 'This username is already taken',
          code: 'USERNAME_EXISTS'
        }]);
      }

      // Hash password with salt rounds based on environment
      const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const user = await UserModel.create({
        username: ControllerHelpers.sanitizeString(username),
        name: ControllerHelpers.sanitizeString(name),
        surname: ControllerHelpers.sanitizeString(surname),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        companyId,
        role: role || 'user'
      });
      
      // Generate JWT token with appropriate expiration
      const tokenPayload = { 
        userId: user.id, 
        companyId: user.companyId, 
        role: user.role,
        username: user.username
      };
      
      const token = jwt.sign(
        tokenPayload,
        config.jwt.secret, 
        { expiresIn: '24h' }
      );

      Logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role
      });
      
      ControllerHelpers.sendSuccess(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
          emailVerified: user.email_verified
        },
        expiresIn: 24 * 3600 // 24 hours
      }, 'User registered successfully', 201);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.register');
    }
  }
  
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password, rememberMe } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Validate required fields
      const validationErrors = ControllerHelpers.validateRequiredFields(
        { email, password },
        ['email', 'password']
      );

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      // Email format validation
      const emailError = ControllerHelpers.validateEmail(email);
      if (emailError) {
        return ControllerHelpers.sendValidationError(res, [emailError]);
      }

      // Rate limiting check
      const rateLimit = ControllerHelpers.checkRateLimit(
        `login:${clientIp}`,
        5, // max 5 attempts
        15 * 60 * 1000, // 15 minutes window
        loginAttempts
      );

      if (!rateLimit.allowed) {
        Logger.warn('Rate limit exceeded for login attempts', {
          ip: clientIp,
          email,
          resetTime: new Date(rateLimit.resetTime)
        });

        return ControllerHelpers.sendError(res, 'Too many login attempts. Please try again later.', 429, undefined, {
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        });
      }

      // Check if account is locked
      if (await UserModel.isAccountLocked(email)) {
        Logger.warn('Login attempt on locked account', { email, ip: clientIp });
        return ControllerHelpers.sendError(res, 'Account temporarily locked due to multiple failed login attempts', 423);
      }
      
      const user = await UserModel.findByEmail(email.toLowerCase().trim());
      if (!user) {
        Logger.warn('Login attempt with non-existent email', { email, ip: clientIp });
        return ControllerHelpers.sendError(res, 'Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.is_active) {
        Logger.warn('Login attempt on inactive account', { userId: user.id, email, ip: clientIp });
        return ControllerHelpers.sendError(res, 'Account is inactive. Please contact administrator.', 403);
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await UserModel.incrementFailedLoginAttempts(email);
        Logger.warn('Invalid password attempt', { userId: user.id, email, ip: clientIp });
        return ControllerHelpers.sendError(res, 'Invalid credentials', 401);
      }

      // Reset failed login attempts on successful login
      await UserModel.resetFailedLoginAttempts(email);
      
      // Generate JWT token with appropriate expiration
      const expiresIn = rememberMe ? '30d' : '24h';
      const tokenPayload = { 
        userId: user.id, 
        companyId: user.companyId, 
        role: user.role,
        username: user.username,
        sessionId: Math.random().toString(36).substring(2) // Add session ID for token tracking
      };
      
      const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn });

      // Update last login timestamp
      await UserModel.updateLastLogin(user.id);

      Logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ip: clientIp,
        rememberMe: !!rememberMe
      });
      
      ControllerHelpers.sendSuccess(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
          emailVerified: user.email_verified,
          lastLogin: user.last_login
        },
        expiresIn: rememberMe ? 30 * 24 * 3600 : 24 * 3600,
        permissions: await this.getUserPermissions(user.role)
      }, 'Login successful');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.login');
    }
  }
  
  static async getProfile(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return ControllerHelpers.sendError(res, 'User not found', 404);
      }

      ControllerHelpers.sendSuccess(res, {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
          emailVerified: user.email_verified,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login
        },
        permissions: await this.getUserPermissions(user.role)
      }, 'Profile retrieved successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.getProfile', req.userId);
    }
  }
  
  static async updateProfile(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      const { name, surname, email, currentPassword, newPassword } = req.body;
      
      // Get current user
      const currentUser = await UserModel.findById(userId);
      if (!currentUser) {
        return ControllerHelpers.sendError(res, 'User not found', 404);
      }

      const validationErrors: ValidationError[] = [];
      const updateData: any = {};

      // Validate name
      if (name !== undefined) {
        const nameErrors = ControllerHelpers.validateStringLength(name, 'name', { min: 2, max: 100 });
        validationErrors.push(...nameErrors);
        if (nameErrors.length === 0) {
          updateData.name = ControllerHelpers.sanitizeString(name);
        }
      }

      // Validate surname
      if (surname !== undefined) {
        const surnameErrors = ControllerHelpers.validateStringLength(surname, 'surname', { min: 2, max: 100 });
        validationErrors.push(...surnameErrors);
        if (surnameErrors.length === 0) {
          updateData.surname = ControllerHelpers.sanitizeString(surname);
        }
      }

      // Validate email if changing
      if (email && email !== currentUser.email) {
        const emailError = ControllerHelpers.validateEmail(email);
        if (emailError) {
          validationErrors.push(emailError);
        } else {
          // Check if email is already in use
          const existingUser = await UserModel.findByEmail(email.toLowerCase().trim());
          if (existingUser && existingUser.id !== userId) {
            validationErrors.push({
              field: 'email',
              message: 'Email address is already in use',
              code: 'EMAIL_EXISTS'
            });
          } else {
            updateData.email = email.toLowerCase().trim();
            updateData.email_verified = false; // Reset email verification
          }
        }
      }

      // Password change validation
      if (newPassword) {
        if (!currentPassword) {
          validationErrors.push({
            field: 'currentPassword',
            message: 'Current password is required to change password',
            code: 'REQUIRED'
          });
        } else {
          // Verify current password
          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
          if (!isCurrentPasswordValid) {
            validationErrors.push({
              field: 'currentPassword',
              message: 'Current password is incorrect',
              code: 'INVALID_PASSWORD'
            });
          } else {
            // Validate new password strength
            const passwordErrors = ControllerHelpers.validatePassword(newPassword);
            validationErrors.push(...passwordErrors);
            
            if (passwordErrors.length === 0) {
              const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
              updateData.password = await bcrypt.hash(newPassword, saltRounds);
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      // If no changes, return current profile
      if (Object.keys(updateData).length === 0) {
        return ControllerHelpers.sendSuccess(res, {
          user: {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            surname: currentUser.surname,
            email: currentUser.email,
            companyId: currentUser.companyId,
            role: currentUser.role,
            emailVerified: currentUser.email_verified,
            isActive: currentUser.is_active
          }
        }, 'No changes to update');
      }

      const updatedUser = await UserModel.update(userId, updateData);
      
      if (!updatedUser) {
        return ControllerHelpers.sendError(res, 'Failed to update profile', 500);
      }

      Logger.info('User profile updated', {
        userId,
        updatedFields: Object.keys(updateData),
        emailChanged: !!updateData.email,
        passwordChanged: !!updateData.password
      });
      
      ControllerHelpers.sendSuccess(res, {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          surname: updatedUser.surname,
          email: updatedUser.email,
          companyId: updatedUser.companyId,
          role: updatedUser.role,
          emailVerified: updatedUser.email_verified,
          isActive: updatedUser.is_active
        }
      }, 'Profile updated successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.updateProfile', req.userId);
    }
  }

  /**
   * Change password (alternative endpoint)
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      const validationErrors = ControllerHelpers.validateRequiredFields(
        { currentPassword, newPassword, confirmPassword },
        ['currentPassword', 'newPassword', 'confirmPassword']
      );

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        validationErrors.push({
          field: 'confirmPassword',
          message: 'Password confirmation does not match',
          code: 'PASSWORD_MISMATCH'
        });
      }

      // Validate new password strength
      if (newPassword) {
        const passwordErrors = ControllerHelpers.validatePassword(newPassword);
        validationErrors.push(...passwordErrors);
      }

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return ControllerHelpers.sendError(res, 'User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return ControllerHelpers.sendError(res, 'Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await UserModel.update(userId, { password: hashedPassword });

      Logger.info('User password changed', { userId });

      ControllerHelpers.sendSuccess(res, null, 'Password changed successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.changePassword', req.userId);
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  static async logout(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.userId!;
      
      Logger.info('User logged out', { userId });
      
      ControllerHelpers.sendSuccess(res, null, 'Logged out successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.logout', req.userId);
    }
  }

  /**
   * Get user permissions based on role
   */
  private static async getUserPermissions(role: string): Promise<string[]> {
    const permissions: Record<string, string[]> = {
      admin: [
        'user:create', 'user:read', 'user:update', 'user:delete',
        'product:create', 'product:read', 'product:update', 'product:delete',
        'quality_check:create', 'quality_check:read', 'quality_check:update', 'quality_check:delete',
        'report:read', 'report:create', 'company:manage'
      ],
      manager: [
        'user:read', 'product:create', 'product:read', 'product:update', 'product:delete',
        'quality_check:create', 'quality_check:read', 'quality_check:update',
        'report:read', 'report:create'
      ],
      inspector: [
        'product:read', 'quality_check:create', 'quality_check:read', 'quality_check:update'
      ],
      user: [
        'product:read', 'quality_check:read'
      ]
    };

    return permissions[role] || permissions.user;
  }

  /**
   * Admin only: Get all users with pagination
   */
  static async getAllUsers(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userRole = req.user?.role;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'user:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      const { page, pageSize, offset } = ControllerHelpers.parsePagination(req.query);
      const companyId = req.companyId!;

      const result = await UserModel.findAllPaginated(companyId, page, pageSize, offset);

      ControllerHelpers.sendPaginatedSuccess(
        res,
        result.items.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLogin: user.last_login
        })),
        { page, pageSize, totalCount: result.totalCount },
        'Users retrieved successfully'
      );

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.getAllUsers', req.userId, req.companyId);
    }
  }
}