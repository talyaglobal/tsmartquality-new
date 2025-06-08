import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import { EnhancedAuthRequest } from '../middleware/enhanced-auth.middleware';
import { ControllerHelpers, ValidationError } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { AuditService } from '../services/audit.service';
import { RBACService } from '../services/rbac.service';
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
      
      // For registration, we'll use the new TokenService instead of direct JWT
      // This is handled by the auth controller now

      Logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role
      });
      
      ControllerHelpers.sendSuccess(res, {
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
        message: 'User registered successfully. Please login to get your access token.'
      }, 'User registered successfully', 201);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.register');
    }
  }
  
  // Login functionality moved to AuthController
  
  static async getProfile(req: EnhancedAuthRequest, res: Response): Promise<any> {
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
        permissions: RBACService.getRolePermissions(user.role)
      }, 'Profile retrieved successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.getProfile', req.userId);
    }
  }
  
  static async updateProfile(req: EnhancedAuthRequest, res: Response): Promise<any> {
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
        await AuditService.logUserManagement({
          userId,
          action: 'user_update',
          success: false,
          ipAddress: req.securityContext?.ipAddress || 'unknown',
          userAgent: req.securityContext?.userAgent || 'unknown',
          errorMessage: 'Failed to update profile'
        });
        return ControllerHelpers.sendError(res, 'Failed to update profile', 500);
      }

      await AuditService.logUserManagement({
        userId,
        action: 'user_update',
        resourceId: userId,
        oldValues: { 
          name: currentUser.name, 
          surname: currentUser.surname, 
          email: currentUser.email 
        },
        newValues: updateData,
        success: true,
        ipAddress: req.securityContext?.ipAddress || 'unknown',
        userAgent: req.securityContext?.userAgent || 'unknown',
        metadata: { 
          updatedFields: Object.keys(updateData),
          emailChanged: !!updateData.email,
          passwordChanged: !!updateData.password
        }
      });

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
  static async changePassword(req: EnhancedAuthRequest, res: Response): Promise<any> {
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

      await AuditService.logUserManagement({
        userId,
        action: 'password_change',
        resourceId: userId,
        success: true,
        ipAddress: req.securityContext?.ipAddress || 'unknown',
        userAgent: req.securityContext?.userAgent || 'unknown'
      });

      Logger.info('User password changed', { userId });

      ControllerHelpers.sendSuccess(res, null, 'Password changed successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UserController.changePassword', req.userId);
    }
  }

  // Logout functionality moved to AuthController

  // Permissions functionality moved to RBACService

  /**
   * Admin only: Get all users with pagination
   */
  static async getAllUsers(req: EnhancedAuthRequest, res: Response): Promise<any> {
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

      await AuditService.logDataAccess({
        userId: req.userId!,
        companyId: req.companyId!,
        action: 'list',
        resource: 'user',
        ipAddress: req.securityContext?.ipAddress || 'unknown',
        userAgent: req.securityContext?.userAgent || 'unknown',
        metadata: { page, pageSize, totalCount: result.totalCount }
      });

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