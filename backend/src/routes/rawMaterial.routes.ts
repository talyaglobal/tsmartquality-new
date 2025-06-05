import express from 'express';
import {
  getAllRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getFilteredRawMaterials
} from '../controllers/rawMaterial.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/raw-materials:
 *   get:
 *     summary: Get all raw materials
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of raw materials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllRawMaterials);

/**
 * @swagger
 * /api/v1/raw-materials/filter:
 *   get:
 *     summary: Get filtered raw materials with pagination
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: stockTracking
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: bbdTracking
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: lotTracking
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated list of filtered raw materials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/filter', authMiddleware, getFilteredRawMaterials);

/**
 * @swagger
 * /api/v1/raw-materials/{id}:
 *   get:
 *     summary: Get a raw material by ID
 *     tags: [Raw Materials]
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
 *         description: Raw material details
 *       404:
 *         description: Raw material not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getRawMaterialById);

/**
 * @swagger
 * /api/v1/raw-materials:
 *   post:
 *     summary: Create a new raw material
 *     tags: [Raw Materials]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               raw_material_group_id:
 *                 type: integer
 *               critical_stock_amount:
 *                 type: number
 *               stock_tracking:
 *                 type: boolean
 *               bbd_tracking:
 *                 type: boolean
 *               lot_tracking:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created raw material
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Raw material with this code already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware,
  validate([
    { field: 'name', validation: 'required|string|min:3' },
    { field: 'code', validation: 'required|string|min:2' }
  ]), 
  createRawMaterial
);

/**
 * @swagger
 * /api/v1/raw-materials/update:
 *   put:
 *     summary: Update an existing raw material
 *     tags: [Raw Materials]
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
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               raw_material_group_id:
 *                 type: integer
 *               critical_stock_amount:
 *                 type: number
 *               stock_tracking:
 *                 type: boolean
 *               bbd_tracking:
 *                 type: boolean
 *               lot_tracking:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated raw material
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Raw material with this code already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware,
  validate([
    { field: 'id', validation: 'required|integer' }
  ]), 
  updateRawMaterial
);

/**
 * @swagger
 * /api/v1/raw-materials/remove/{id}:
 *   get:
 *     summary: Delete a raw material (soft delete)
 *     tags: [Raw Materials]
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
 *         description: Raw material deleted successfully
 *       400:
 *         description: Raw material cannot be deleted (used in recipes)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', authMiddleware, deleteRawMaterial);

export default router;