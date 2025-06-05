import express from 'express';
import {
  getAllGroupInRoles,
  getGroupInRoleById,
  createGroupInRole,
  updateGroupInRole,
  deleteGroupInRole
} from '../controllers/groupInRole.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/group-in-roles:
 *   get:
 *     summary: Get all group-role associations
 *     tags: [Group Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of group-role associations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllGroupInRoles);

/**
 * @swagger
 * /api/v1/group-in-roles/{id}:
 *   get:
 *     summary: Get a group-role association by ID
 *     tags: [Group Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group-role association details
 *       404:
 *         description: Group-role association not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getGroupInRoleById);

/**
 * @swagger
 * /api/v1/group-in-roles:
 *   post:
 *     summary: Create a new group-role association
 *     tags: [Group Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *               - role_id
 *             properties:
 *               group_id:
 *                 type: integer
 *               role_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created group-role association
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Association already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  validate([
    { field: 'group_id', validation: 'required|integer' },
    { field: 'role_id', validation: 'required|integer' }
  ]), 
  createGroupInRole
);

/**
 * @swagger
 * /api/v1/group-in-roles/update:
 *   put:
 *     summary: Update an existing group-role association
 *     tags: [Group Roles]
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
 *               - group_id
 *               - role_id
 *             properties:
 *               id:
 *                 type: integer
 *               group_id:
 *                 type: integer
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated group-role association
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Association already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  validate([
    { field: 'id', validation: 'required|integer' },
    { field: 'group_id', validation: 'required|integer' },
    { field: 'role_id', validation: 'required|integer' }
  ]), 
  updateGroupInRole
);

/**
 * @swagger
 * /api/v1/group-in-roles/remove/{id}:
 *   get:
 *     summary: Delete a group-role association (soft delete)
 *     tags: [Group Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group-role association deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deleteGroupInRole
);

export default router;