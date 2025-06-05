import express from 'express';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupWithDetails
} from '../controllers/group.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of groups
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllGroups);

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   get:
 *     summary: Get a group by ID
 *     tags: [Groups]
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
 *         description: Group details
 *       404:
 *         description: Group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getGroupById);

/**
 * @swagger
 * /api/v1/groups/{id}/details:
 *   get:
 *     summary: Get group with associated users and roles
 *     tags: [Groups]
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
 *         description: Detailed group information
 *       404:
 *         description: Group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/details', authMiddleware, getGroupWithDetails);

/**
 * @swagger
 * /api/v1/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  validate([
    { field: 'name', validation: 'required|string|min:3' }
  ]), 
  createGroup
);

/**
 * @swagger
 * /api/v1/groups/update:
 *   put:
 *     summary: Update an existing group
 *     tags: [Groups]
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
 *               - name
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  validate([
    { field: 'id', validation: 'required|integer' },
    { field: 'name', validation: 'required|string|min:3' }
  ]), 
  updateGroup
);

/**
 * @swagger
 * /api/v1/groups/remove/{id}:
 *   get:
 *     summary: Delete a group (soft delete)
 *     tags: [Groups]
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
 *         description: Group deleted successfully
 *       400:
 *         description: Group cannot be deleted (has associations)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deleteGroup
);

export default router;