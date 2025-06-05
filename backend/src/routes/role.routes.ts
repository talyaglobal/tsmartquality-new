import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { isAdmin, isCompanyAdmin } from '../middleware/role.middleware';
import * as roleController from '../controllers/role.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The role ID
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *         company_id:
 *           type: integer
 *           description: Company ID the role belongs to
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
 *           description: User ID who created the role
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the role
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
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
 *         description: List of roles
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
 *                     $ref: '#/components/schemas/Role'
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get(
  '/',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  roleController.getAllRoles
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 */
router.get(
  '/:id',
  authenticate,
  validate([
    param('id').isInt().withMessage('Role ID must be an integer')
  ]),
  roleController.getRoleById
);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role (admin or company admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  authenticate,
  isCompanyAdmin,
  validate([
    body('name').isString().notEmpty().withMessage('Role name is required'),
    body('description').optional().isString()
  ]),
  roleController.createRole
);

/**
 * @swagger
 * /api/roles:
 *   put:
 *     summary: Update a role (admin or company admin only)
 *     tags: [Roles]
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
 *                 type: integer
 *                 description: Role ID
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.put(
  '/',
  authenticate,
  isCompanyAdmin,
  validate([
    body('id').isInt().withMessage('Role ID must be an integer'),
    body('name').optional().isString().notEmpty().withMessage('Role name is required'),
    body('description').optional().isString()
  ]),
  roleController.updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role (admin or company admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.delete(
  '/:id',
  authenticate,
  isCompanyAdmin,
  validate([
    param('id').isInt().withMessage('Role ID must be an integer')
  ]),
  roleController.deleteRole
);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Get permissions for a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of permissions for the role
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
 *                     type: string
 *       404:
 *         description: Role not found
 */
router.get(
  '/:id/permissions',
  authenticate,
  validate([
    param('id').isInt().withMessage('Role ID must be an integer')
  ]),
  roleController.getRolePermissions
);

/**
 * @swagger
 * /api/roles/permissions:
 *   post:
 *     summary: Add permission to role (admin or company admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permission
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: Role ID
 *               permission:
 *                 type: string
 *                 description: Permission name
 *     responses:
 *       201:
 *         description: Permission added successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.post(
  '/permissions',
  authenticate,
  isCompanyAdmin,
  validate([
    body('roleId').isInt().withMessage('Role ID must be an integer'),
    body('permission').isString().notEmpty().withMessage('Permission name is required')
  ]),
  roleController.addPermission
);

/**
 * @swagger
 * /api/roles/{roleId}/permissions/{permission}:
 *   delete:
 *     summary: Remove permission from role (admin or company admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission name
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.delete(
  '/:roleId/permissions/:permission',
  authenticate,
  isCompanyAdmin,
  validate([
    param('roleId').isInt().withMessage('Role ID must be an integer'),
    param('permission').isString().notEmpty().withMessage('Permission name is required')
  ]),
  roleController.removePermission
);

/**
 * @swagger
 * /api/roles/permissions/all:
 *   get:
 *     summary: Get all available permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all available permissions
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
 *                     type: string
 */
router.get('/permissions/all', authenticate, roleController.getAllPermissions);

export default router;