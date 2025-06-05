import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as userController from '../controllers/user.controller';
import { isAdmin, isCompanyAdmin } from '../middleware/role.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user ID (UUID)
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         full_name:
 *           type: string
 *           description: User's full name
 *         phone:
 *           type: string
 *           description: User's phone number
 *         job_title:
 *           type: string
 *           description: User's job title
 *         department:
 *           type: string
 *           description: User's department
 *         company_id:
 *           type: integer
 *           description: Company ID the user belongs to
 *         is_active:
 *           type: boolean
 *           description: Whether the user is active
 *         is_admin:
 *           type: boolean
 *           description: Whether the user is a system admin
 *         is_company_admin:
 *           type: boolean
 *           description: Whether the user is a company admin
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Update timestamp
 *         created_by:
 *           type: string
 *           format: uuid
 *           description: User ID who created the user
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the user
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin or company admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me', authenticate, userController.getCurrentUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/:id',
  authenticate,
  validate([
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ]),
  userController.getUserById
);

/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: User ID
 *               full_name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               job_title:
 *                 type: string
 *                 description: User's job title
 *               department:
 *                 type: string
 *                 description: User's department
 *               is_active:
 *                 type: boolean
 *                 description: Whether the user is active (admin only)
 *               is_company_admin:
 *                 type: boolean
 *                 description: Whether the user is a company admin (system admin only)
 *               company_id:
 *                 type: integer
 *                 description: Company ID (system admin only)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put(
  '/',
  authenticate,
  validate([
    body('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('full_name').optional().isString().notEmpty().withMessage('Full name is required'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('phone').optional().isString(),
    body('job_title').optional().isString(),
    body('department').optional().isString(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    body('is_company_admin').optional().isBoolean().withMessage('Is company admin must be a boolean'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Current password
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('current_password').isString().notEmpty().withMessage('Current password is required'),
    body('new_password').isString().notEmpty().isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ]),
  userController.changePassword
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (soft delete by deactivating)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  authenticate,
  validate([
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ]),
  userController.deleteUser
);

/**
 * @swagger
 * /api/users/company/{companyId}:
 *   get:
 *     summary: Get users by company ID (admin or company admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of users in the company
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/company/:companyId',
  authenticate,
  validate([
    param('companyId').isInt().withMessage('Company ID must be an integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  userController.getUsersByCompany
);

/**
 * @swagger
 * /api/users/roles/{userId}:
 *   get:
 *     summary: Get roles for a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of roles for the user
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/roles/:userId',
  authenticate,
  validate([
    param('userId').isUUID().withMessage('User ID must be a valid UUID')
  ]),
  userController.getUserRoles
);

/**
 * @swagger
 * /api/users/roles:
 *   post:
 *     summary: Assign role to user (admin or company admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID
 *               roleId:
 *                 type: integer
 *                 description: Role ID
 *     responses:
 *       201:
 *         description: Role assigned successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User or role not found
 */
router.post(
  '/roles',
  authenticate,
  validate([
    body('userId').isUUID().withMessage('User ID must be a valid UUID'),
    body('roleId').isInt().withMessage('Role ID must be an integer')
  ]),
  userController.assignRole
);

/**
 * @swagger
 * /api/users/roles/{userId}/{roleId}:
 *   delete:
 *     summary: Remove role from user (admin or company admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role assignment not found
 */
router.delete(
  '/roles/:userId/:roleId',
  authenticate,
  validate([
    param('userId').isUUID().withMessage('User ID must be a valid UUID'),
    param('roleId').isInt().withMessage('Role ID must be an integer')
  ]),
  userController.removeRole
);

/**
 * @swagger
 * /api/users/permissions/{permission}:
 *   get:
 *     summary: Check if current user has a specific permission
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission name to check
 *     responses:
 *       200:
 *         description: Permission check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hasPermission:
 *                   type: boolean
 */
router.get(
  '/permissions/:permission',
  authenticate,
  validate([
    param('permission').isString().notEmpty().withMessage('Permission name is required')
  ]),
  userController.checkPermission
);

export default router;