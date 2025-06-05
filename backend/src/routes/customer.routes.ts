import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as customerController from '../controllers/customer.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The customer ID
 *         name:
 *           type: string
 *           description: Customer name
 *         code:
 *           type: string
 *           description: Customer code
 *         category:
 *           type: string
 *           description: Customer category (cash-cow, star, problem-child, dog)
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Customer rating (1-5)
 *         strategic:
 *           type: boolean
 *           description: Whether customer is strategic
 *         contact_person:
 *           type: string
 *           description: Contact person name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         address:
 *           type: string
 *           description: Customer address
 *         last_order:
 *           type: string
 *           format: date-time
 *           description: Date of last order
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Customer status
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
 *           description: User ID who created the customer
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the customer
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
router.get('/', authenticate, customerController.getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  customerController.getCustomerById
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 */
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('code').optional().isString(),
    body('category').optional().isString(),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('strategic').optional().isBoolean().withMessage('Strategic must be a boolean'),
    body('contact_person').optional().isString(),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('last_order').optional().isISO8601().withMessage('Last order must be a valid date'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  customerController.createCustomer
);

/**
 * @swagger
 * /api/customers/update:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 */
router.put(
  '/update',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('code').optional().isString(),
    body('category').optional().isString(),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('strategic').optional().isBoolean().withMessage('Strategic must be a boolean'),
    body('contact_person').optional().isString(),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('last_order').optional().isISO8601().withMessage('Last order must be a valid date'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  customerController.updateCustomer
);

/**
 * @swagger
 * /api/customers/remove/{id}:
 *   get:
 *     summary: Delete a customer (soft delete)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.get(
  '/remove/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  customerController.deleteCustomer
);

/**
 * @swagger
 * /api/customers/filter/{limit}/{offset}:
 *   get:
 *     summary: Get filtered customers with pagination
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of customers to return
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of customers to skip
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for customer name, code, contact person, or email
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filter by rating
 *       - in: query
 *         name: strategic
 *         schema:
 *           type: boolean
 *         description: Filter by strategic status
 *     responses:
 *       200:
 *         description: Filtered paginated list of customers
 */
router.get(
  '/filter/:limit/:offset',
  authenticate,
  validate([
    param('limit').isInt().withMessage('Limit must be an integer'),
    param('offset').isInt().withMessage('Offset must be an integer'),
    query('searchTerm').optional().isString(),
    query('category').optional().isString(),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    query('strategic').optional().isBoolean().withMessage('Strategic must be a boolean')
  ]),
  customerController.getFilteredCustomers
);

/**
 * @swagger
 * /api/customers/filter-items:
 *   get:
 *     summary: Get filter options for customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options for customers
 */
router.get(
  '/filter-items',
  authenticate,
  customerController.getCustomerFilterItems
);

/**
 * @swagger
 * /api/customers/with-products/{id}:
 *   get:
 *     summary: Get customer with products
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer with related products
 *       404:
 *         description: Customer not found
 */
router.get(
  '/with-products/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  customerController.getCustomerWithProducts
);

export default router;