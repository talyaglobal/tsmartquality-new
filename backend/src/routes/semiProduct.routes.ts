import express from 'express';
import {
  getAllSemiProducts,
  getSemiProductById,
  getSemiProductWithDetails,
  createSemiProduct,
  updateSemiProduct,
  deleteSemiProduct,
  getFilteredSemiProducts
} from '../controllers/semiProduct.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/semi-products:
 *   get:
 *     summary: Get all semi-products
 *     tags: [Semi-Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of semi-products
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllSemiProducts);

/**
 * @swagger
 * /api/v1/semi-products/filter:
 *   get:
 *     summary: Get filtered semi-products with pagination
 *     tags: [Semi-Products]
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
 *         description: Paginated list of filtered semi-products
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/filter', authMiddleware, getFilteredSemiProducts);

/**
 * @swagger
 * /api/v1/semi-products/{id}:
 *   get:
 *     summary: Get a semi-product by ID
 *     tags: [Semi-Products]
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
 *         description: Semi-product details
 *       404:
 *         description: Semi-product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getSemiProductById);

/**
 * @swagger
 * /api/v1/semi-products/{id}/details:
 *   get:
 *     summary: Get a semi-product with full details including recipes
 *     tags: [Semi-Products]
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
 *         description: Semi-product with detailed information
 *       404:
 *         description: Semi-product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/details', authMiddleware, getSemiProductWithDetails);

/**
 * @swagger
 * /api/v1/semi-products:
 *   post:
 *     summary: Create a new semi-product
 *     tags: [Semi-Products]
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
 *               semi_product_group_id:
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
 *         description: Created semi-product
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Semi-product with this code already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware,
  validate([
    { field: 'name', validation: 'required|string|min:3' },
    { field: 'code', validation: 'required|string|min:2' }
  ]), 
  createSemiProduct
);

/**
 * @swagger
 * /api/v1/semi-products/update:
 *   put:
 *     summary: Update an existing semi-product
 *     tags: [Semi-Products]
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
 *               semi_product_group_id:
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
 *         description: Updated semi-product
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Semi-product with this code already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware,
  validate([
    { field: 'id', validation: 'required|integer' }
  ]), 
  updateSemiProduct
);

/**
 * @swagger
 * /api/v1/semi-products/remove/{id}:
 *   get:
 *     summary: Delete a semi-product (soft delete)
 *     tags: [Semi-Products]
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
 *         description: Semi-product deleted successfully
 *       400:
 *         description: Semi-product cannot be deleted (used in recipes)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', authMiddleware, deleteSemiProduct);

export default router;