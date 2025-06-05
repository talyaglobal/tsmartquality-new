import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as brandController from '../controllers/brand.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The brand ID
 *         name:
 *           type: string
 *           description: Brand name
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Brand status
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
 *           description: User ID who created the brand
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the brand
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 */
router.get('/', authenticate, brandController.getAllBrands);

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  brandController.getBrandById
);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brand'
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 */
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  brandController.createBrand
);

/**
 * @swagger
 * /api/brands/update:
 *   put:
 *     summary: Update a brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brand'
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 */
router.put(
  '/update',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  brandController.updateBrand
);

/**
 * @swagger
 * /api/brands/remove/{id}:
 *   get:
 *     summary: Delete a brand (soft delete)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brand ID to delete
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Cannot delete brand that is in use
 */
router.get(
  '/remove/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  brandController.deleteBrand
);

export default router;