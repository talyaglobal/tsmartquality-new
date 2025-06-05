import express, { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as specController from '../controllers/spec.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Spec:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The specification ID
 *         code:
 *           type: string
 *           description: Specification code
 *         name:
 *           type: string
 *           description: Specification name
 *         description:
 *           type: string
 *           description: Specification description
 *         product_id:
 *           type: integer
 *           description: Product ID this specification belongs to
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Specification status
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
 *           description: User ID who created the specification
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the specification
 *     SpecDetail:
 *       type: object
 *       required:
 *         - spec_id
 *         - parameter_name
 *       properties:
 *         id:
 *           type: integer
 *           description: The specification detail ID
 *         spec_id:
 *           type: integer
 *           description: Specification ID this detail belongs to
 *         parameter_name:
 *           type: string
 *           description: Parameter name
 *         min_value:
 *           type: number
 *           description: Minimum value
 *         max_value:
 *           type: number
 *           description: Maximum value
 *         target_value:
 *           type: number
 *           description: Target value
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *         is_mandatory:
 *           type: boolean
 *           description: Whether this parameter is mandatory
 *         sequence:
 *           type: integer
 *           description: Order sequence in the specification
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Specification detail status
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
 *           description: User ID who created the specification detail
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the specification detail
 */

/**
 * @swagger
 * /api/specs:
 *   get:
 *     summary: Get all specifications
 *     tags: [Specs]
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
 *         description: List of specifications
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
 *                     $ref: '#/components/schemas/Spec'
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
  specController.getAllSpecs
);

/**
 * @swagger
 * /api/specs/all-with-details:
 *   get:
 *     summary: Get all specifications with their details
 *     tags: [Specs]
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
 *         description: List of specifications with details
 */
router.get(
  '/all-with-details',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  specController.getAllSpecsWithDetails
);

/**
 * @swagger
 * /api/specs/with-details/{specId}:
 *   get:
 *     summary: Get a specification with its details
 *     tags: [Specs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specification ID
 *     responses:
 *       200:
 *         description: Specification with details
 *       404:
 *         description: Specification not found
 */
router.get(
  '/with-details/:specId',
  authenticate,
  validate([param('specId').isInt().withMessage('Specification ID must be an integer')]),
  specController.getSpecWithDetails
);

/**
 * @swagger
 * /api/specs/{id}:
 *   get:
 *     summary: Get specification by ID
 *     tags: [Specs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specification ID
 *     responses:
 *       200:
 *         description: Specification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Spec'
 *       404:
 *         description: Specification not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  specController.getSpecById
);

/**
 * @swagger
 * /api/specs/product/{productId}:
 *   get:
 *     summary: Get specifications by product ID
 *     tags: [Specs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
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
 *         description: List of specifications for the product
 */
router.get(
  '/product/:productId',
  authenticate,
  validate([
    param('productId').isInt().withMessage('Product ID must be an integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  specController.getSpecsByProductId
);

/**
 * @swagger
 * /api/specs:
 *   post:
 *     summary: Create a new specification
 *     tags: [Specs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 description: Specification code
 *               name:
 *                 type: string
 *                 description: Specification name
 *               description:
 *                 type: string
 *                 description: Specification description
 *               product_id:
 *                 type: integer
 *                 description: Product ID
 *     responses:
 *       201:
 *         description: Specification created successfully
 */
router.post(
  '/',
  authenticate,
  validate([
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer')
  ]),
  specController.createSpec
);

/**
 * @swagger
 * /api/specs:
 *   put:
 *     summary: Update a specification
 *     tags: [Specs]
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
 *                 description: Specification ID
 *               code:
 *                 type: string
 *                 description: Specification code
 *               name:
 *                 type: string
 *                 description: Specification name
 *               description:
 *                 type: string
 *                 description: Specification description
 *               product_id:
 *                 type: integer
 *                 description: Product ID
 *               status:
 *                 type: boolean
 *                 description: Specification status
 *     responses:
 *       200:
 *         description: Specification updated successfully
 */
router.put(
  '/',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('code').optional().isString(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean')
  ]),
  specController.updateSpec
);

/**
 * @swagger
 * /api/specs/{id}:
 *   delete:
 *     summary: Delete a specification
 *     tags: [Specs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specification ID to delete
 *     responses:
 *       200:
 *         description: Specification deleted successfully
 */
router.delete(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  specController.deleteSpec
);

/**
 * @swagger
 * /api/specs/details/{specId}:
 *   get:
 *     summary: Get all specification details for a specification
 *     tags: [SpecDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Specification ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: A list of specification details
 *       404:
 *         description: Specification not found
 */
router.get(
  '/details/:specId',
  authenticate,
  validate([
    param('specId').isInt().withMessage('Specification ID must be an integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  specController.getSpecDetails
);

/**
 * @swagger
 * /api/specs/details/item/{id}:
 *   get:
 *     summary: Get a specification detail by ID
 *     tags: [SpecDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Specification detail ID
 *     responses:
 *       200:
 *         description: Specification detail
 *       404:
 *         description: Specification detail not found
 */
router.get(
  '/details/item/:id',
  authenticate,
  validate([param('id').isInt().withMessage('Specification detail ID must be an integer')]),
  specController.getSpecDetailById
);

/**
 * @swagger
 * /api/specs/details:
 *   post:
 *     summary: Create a new specification detail
 *     tags: [SpecDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spec_id
 *               - parameter_name
 *             properties:
 *               spec_id:
 *                 type: integer
 *                 description: Specification ID
 *               parameter_name:
 *                 type: string
 *                 description: Parameter name
 *               min_value:
 *                 type: number
 *                 description: Minimum value
 *               max_value:
 *                 type: number
 *                 description: Maximum value
 *               target_value:
 *                 type: number
 *                 description: Target value
 *               unit:
 *                 type: string
 *                 description: Unit of measurement
 *               is_mandatory:
 *                 type: boolean
 *                 description: Whether this parameter is mandatory
 *               sequence:
 *                 type: integer
 *                 description: Order sequence in the specification
 *     responses:
 *       201:
 *         description: Specification detail created successfully
 */
router.post(
  '/details',
  authenticate,
  validate([
    body('spec_id').isInt().withMessage('Specification ID must be an integer'),
    body('parameter_name').isString().notEmpty().withMessage('Parameter name is required'),
    body('min_value').optional().isNumeric().withMessage('Minimum value must be a number'),
    body('max_value').optional().isNumeric().withMessage('Maximum value must be a number'),
    body('target_value').optional().isNumeric().withMessage('Target value must be a number'),
    body('unit').optional().isString(),
    body('is_mandatory').optional().isBoolean().withMessage('Is mandatory must be a boolean'),
    body('sequence').optional().isInt().withMessage('Sequence must be an integer')
  ]),
  specController.createSpecDetail
);

/**
 * @swagger
 * /api/specs/details:
 *   put:
 *     summary: Update a specification detail
 *     tags: [SpecDetails]
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
 *                 description: Specification detail ID
 *               spec_id:
 *                 type: integer
 *                 description: Specification ID
 *               parameter_name:
 *                 type: string
 *                 description: Parameter name
 *               min_value:
 *                 type: number
 *                 description: Minimum value
 *               max_value:
 *                 type: number
 *                 description: Maximum value
 *               target_value:
 *                 type: number
 *                 description: Target value
 *               unit:
 *                 type: string
 *                 description: Unit of measurement
 *               is_mandatory:
 *                 type: boolean
 *                 description: Whether this parameter is mandatory
 *               sequence:
 *                 type: integer
 *                 description: Order sequence in the specification
 *               status:
 *                 type: boolean
 *                 description: Specification detail status
 *     responses:
 *       200:
 *         description: Specification detail updated successfully
 */
router.put(
  '/details',
  authenticate,
  validate([
    body('id').isInt().withMessage('Specification detail ID must be an integer'),
    body('spec_id').optional().isInt().withMessage('Specification ID must be an integer'),
    body('parameter_name').optional().isString().notEmpty().withMessage('Parameter name is required'),
    body('min_value').optional().isNumeric().withMessage('Minimum value must be a number'),
    body('max_value').optional().isNumeric().withMessage('Maximum value must be a number'),
    body('target_value').optional().isNumeric().withMessage('Target value must be a number'),
    body('unit').optional().isString(),
    body('is_mandatory').optional().isBoolean().withMessage('Is mandatory must be a boolean'),
    body('sequence').optional().isInt().withMessage('Sequence must be an integer'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean')
  ]),
  specController.updateSpecDetail
);

/**
 * @swagger
 * /api/specs/details/{id}:
 *   delete:
 *     summary: Delete a specification detail
 *     tags: [SpecDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Specification detail ID
 *     responses:
 *       200:
 *         description: Specification detail deleted successfully
 */
router.delete(
  '/details/:id',
  authenticate,
  validate([param('id').isInt().withMessage('Specification detail ID must be an integer')]),
  specController.deleteSpecDetail
);

export default router;