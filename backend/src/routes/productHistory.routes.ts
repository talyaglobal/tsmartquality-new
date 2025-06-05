import express from 'express';
import {
  getAllProductHistory,
  getProductHistoryById,
  getProductHistoryByProductId,
  getPaginatedProductHistory,
  deleteProductHistory
} from '../controllers/productHistory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/product-history:
 *   get:
 *     summary: Get all product history records
 *     tags: [Product History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of product history records
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllProductHistory);

/**
 * @swagger
 * /api/v1/product-history/{id}:
 *   get:
 *     summary: Get a product history record by ID
 *     tags: [Product History]
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
 *         description: Product history record details
 *       404:
 *         description: Product history record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getProductHistoryById);

/**
 * @swagger
 * /api/v1/product-history/product/{productId}:
 *   get:
 *     summary: Get all history records for a specific product
 *     tags: [Product History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product history records for the specified product
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/product/:productId', authMiddleware, getProductHistoryByProductId);

/**
 * @swagger
 * /api/v1/product-history/paginated/{limit}/{offset}:
 *   get:
 *     summary: Get paginated product history records
 *     tags: [Product History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Paginated product history records
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/paginated/:limit/:offset', authMiddleware, getPaginatedProductHistory);

/**
 * @swagger
 * /api/v1/product-history/remove/{id}:
 *   get:
 *     summary: Delete a product history record (soft delete)
 *     tags: [Product History]
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
 *         description: Product history record deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deleteProductHistory
);

export default router;