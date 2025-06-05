import express from 'express';
import {
  getAllSemiProductGroups,
  getSemiProductGroupById,
  createSemiProductGroup,
  updateSemiProductGroup,
  deleteSemiProductGroup,
  getSemiProductGroupWithProducts
} from '../controllers/semiProductGroup.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/semi-product-groups:
 *   get:
 *     summary: Get all semi-product groups
 *     tags: [Semi-Product Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of semi-product groups
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllSemiProductGroups);

/**
 * @swagger
 * /api/v1/semi-product-groups/{id}:
 *   get:
 *     summary: Get a semi-product group by ID
 *     tags: [Semi-Product Groups]
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
 *         description: Semi-product group details
 *       404:
 *         description: Semi-product group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getSemiProductGroupById);

/**
 * @swagger
 * /api/v1/semi-product-groups/{id}/products:
 *   get:
 *     summary: Get semi-product group with associated products
 *     tags: [Semi-Product Groups]
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
 *         description: Semi-product group with products
 *       404:
 *         description: Semi-product group not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/products', authMiddleware, getSemiProductGroupWithProducts);

/**
 * @swagger
 * /api/v1/semi-product-groups:
 *   post:
 *     summary: Create a new semi-product group
 *     tags: [Semi-Product Groups]
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
 *         description: Created semi-product group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Semi-product group with this name already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware,
  validate([
    { field: 'name', validation: 'required|string|min:3' }
  ]), 
  createSemiProductGroup
);

/**
 * @swagger
 * /api/v1/semi-product-groups/update:
 *   put:
 *     summary: Update an existing semi-product group
 *     tags: [Semi-Product Groups]
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
 *         description: Updated semi-product group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Semi-product group with this name already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware,
  validate([
    { field: 'id', validation: 'required|integer' }
  ]), 
  updateSemiProductGroup
);

/**
 * @swagger
 * /api/v1/semi-product-groups/remove/{id}:
 *   get:
 *     summary: Delete a semi-product group (soft delete)
 *     tags: [Semi-Product Groups]
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
 *         description: Semi-product group deleted successfully
 *       400:
 *         description: Semi-product group cannot be deleted (used by products)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', authMiddleware, deleteSemiProductGroup);

export default router;