import express from 'express';
import {
  getAllProductToCustomers,
  getProductToCustomerById,
  getProductToCustomersByProductId,
  getProductToCustomersByCustomerId,
  createProductToCustomer,
  updateProductToCustomer,
  deleteProductToCustomer
} from '../controllers/productToCustomer.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/product-to-customers:
 *   get:
 *     summary: Get all product-customer relationships
 *     tags: [Product Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of product-customer relationships
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllProductToCustomers);

/**
 * @swagger
 * /api/v1/product-to-customers/{id}:
 *   get:
 *     summary: Get a product-customer relationship by ID
 *     tags: [Product Customers]
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
 *         description: Product-customer relationship details
 *       404:
 *         description: Relationship not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getProductToCustomerById);

/**
 * @swagger
 * /api/v1/product-to-customers/product/{productId}:
 *   get:
 *     summary: Get all customer relationships for a specific product
 *     tags: [Product Customers]
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
 *         description: Customer relationships for the specified product
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/product/:productId', authMiddleware, getProductToCustomersByProductId);

/**
 * @swagger
 * /api/v1/product-to-customers/customer/{customerId}:
 *   get:
 *     summary: Get all product relationships for a specific customer
 *     tags: [Product Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product relationships for the specified customer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/customer/:customerId', authMiddleware, getProductToCustomersByCustomerId);

/**
 * @swagger
 * /api/v1/product-to-customers:
 *   post:
 *     summary: Create a new product-customer relationship
 *     tags: [Product Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - customer_id
 *             properties:
 *               product_id:
 *                 type: integer
 *               customer_id:
 *                 type: integer
 *               custom_product_code:
 *                 type: string
 *               custom_product_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created product-customer relationship
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Relationship already exists
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware,
  validate([
    { field: 'product_id', validation: 'required|integer' },
    { field: 'customer_id', validation: 'required|integer' }
  ]), 
  createProductToCustomer
);

/**
 * @swagger
 * /api/v1/product-to-customers/update:
 *   put:
 *     summary: Update an existing product-customer relationship
 *     tags: [Product Customers]
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
 *               product_id:
 *                 type: integer
 *               customer_id:
 *                 type: integer
 *               custom_product_code:
 *                 type: string
 *               custom_product_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated product-customer relationship
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Relationship already exists
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authMiddleware,
  validate([
    { field: 'id', validation: 'required|integer' }
  ]), 
  updateProductToCustomer
);

/**
 * @swagger
 * /api/v1/product-to-customers/remove/{id}:
 *   get:
 *     summary: Delete a product-customer relationship (soft delete)
 *     tags: [Product Customers]
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
 *         description: Relationship deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/remove/:id', authMiddleware, deleteProductToCustomer);

export default router;