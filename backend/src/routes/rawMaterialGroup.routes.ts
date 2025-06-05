import express from 'express';
import {
  getAllRawMaterialGroups,
  getRawMaterialGroupById,
  createRawMaterialGroup,
  updateRawMaterialGroup,
  deleteRawMaterialGroup,
  getRawMaterialGroupWithMaterials
} from '../controllers/rawMaterialGroup.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/raw-material-groups:
 *   get:
 *     summary: Get all raw material groups
 *     tags: [Raw Material Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of raw material groups
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllRawMaterialGroups);

/**
 * @swagger
 * /api/v1/raw-material-groups/{id}:
 *   get:
 *     summary: Get a raw material group by ID
 *     tags: [Raw Material Groups]
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
 *         description: Raw material group details
 *       404:
 *         description: Raw material group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getRawMaterialGroupById);

/**
 * @swagger
 * /api/v1/raw-material-groups/{id}/materials:
 *   get:
 *     summary: Get raw material group with associated materials
 *     tags: [Raw Material Groups]
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
 *         description: Raw material group with materials
 *       404:
 *         description: Raw material group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/materials', authMiddleware, getRawMaterialGroupWithMaterials);

/**
 * @swagger
 * /api/v1/raw-material-groups:
 *   post:
 *     summary: Create a new raw material group
 *     tags: [Raw Material Groups]
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
 *         description: Created raw material group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Raw material group with this name already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware,
  validate([
    { field: 'name', validation: 'required|string|min:3' }
  ]), 
  createRawMaterialGroup
);

/**
 * @swagger
 * /api/v1/raw-material-groups/update:
 *   put:
 *     summary: Update an existing raw material group
 *     tags: [Raw Material Groups]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated raw material group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Raw material group with this name already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware,
  validate([
    { field: 'id', validation: 'required|integer' }
  ]), 
  updateRawMaterialGroup
);

/**
 * @swagger
 * /api/v1/raw-material-groups/remove/{id}:
 *   get:
 *     summary: Delete a raw material group (soft delete)
 *     tags: [Raw Material Groups]
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
 *         description: Raw material group deleted successfully
 *       400:
 *         description: Raw material group cannot be deleted (used by materials)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', authMiddleware, deleteRawMaterialGroup);

export default router;