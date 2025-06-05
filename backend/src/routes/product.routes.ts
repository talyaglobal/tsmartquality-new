import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as productController from '../controllers/product.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The product ID
 *         code:
 *           type: string
 *           description: Product code
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         weight:
 *           type: number
 *           description: Product weight
 *         volume:
 *           type: number
 *           description: Product volume
 *         density:
 *           type: number
 *           description: Product density
 *         width:
 *           type: number
 *           description: Product width
 *         length:
 *           type: number
 *           description: Product length
 *         height:
 *           type: number
 *           description: Product height
 *         critical_stock_amount:
 *           type: number
 *           description: Critical stock amount
 *         shelflife_limit:
 *           type: integer
 *           description: Shelf life limit in days
 *         max_stack:
 *           type: integer
 *           description: Maximum stack
 *         stock_tracking:
 *           type: boolean
 *           description: Whether stock tracking is enabled
 *         bbd_tracking:
 *           type: boolean
 *           description: Whether BBD tracking is enabled
 *         lot_tracking:
 *           type: boolean
 *           description: Whether lot tracking is enabled
 *         is_blocked:
 *           type: boolean
 *           description: Whether product is blocked
 *         is_setted_product:
 *           type: boolean
 *           description: Whether product is setted
 *         seller_id:
 *           type: integer
 *           description: Seller ID
 *         product_group_id:
 *           type: integer
 *           description: Product group ID
 *         brand_id:
 *           type: integer
 *           description: Brand ID
 *         product_type_id:
 *           type: integer
 *           description: Product type ID
 *         storage_condition_id:
 *           type: integer
 *           description: Storage condition ID
 *         color_type_id:
 *           type: integer
 *           description: Color type ID
 *         cutting_type_id:
 *           type: integer
 *           description: Cutting type ID
 *         quality_type_id:
 *           type: integer
 *           description: Quality type ID
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Product status
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
 *           description: User ID who created the product
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the product
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', authenticate, productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isInt().withMessage('ID must be an integer')],
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  productController.getProductById
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post(
  '/',
  authenticate,
  validate([
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('product_group_id').optional().isInt().withMessage('Product group ID must be an integer'),
    body('brand_id').optional().isInt().withMessage('Brand ID must be an integer'),
    body('product_type_id').optional().isInt().withMessage('Product type ID must be an integer'),
    body('seller_id').optional().isInt().withMessage('Seller ID must be an integer'),
    body('storage_condition_id').optional().isInt().withMessage('Storage condition ID must be an integer'),
    body('color_type_id').optional().isInt().withMessage('Color type ID must be an integer'),
    body('cutting_type_id').optional().isInt().withMessage('Cutting type ID must be an integer'),
    body('quality_type_id').optional().isInt().withMessage('Quality type ID must be an integer'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('volume').optional().isNumeric().withMessage('Volume must be a number'),
    body('density').optional().isNumeric().withMessage('Density must be a number'),
    body('width').optional().isNumeric().withMessage('Width must be a number'),
    body('length').optional().isNumeric().withMessage('Length must be a number'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('critical_stock_amount').optional().isNumeric().withMessage('Critical stock amount must be a number'),
    body('shelflife_limit').optional().isInt().withMessage('Shelf life limit must be an integer'),
    body('max_stack').optional().isInt().withMessage('Max stack must be an integer'),
    body('stock_tracking').optional().isBoolean().withMessage('Stock tracking must be a boolean'),
    body('bbd_tracking').optional().isBoolean().withMessage('BBD tracking must be a boolean'),
    body('lot_tracking').optional().isBoolean().withMessage('Lot tracking must be a boolean'),
    body('is_blocked').optional().isBoolean().withMessage('Is blocked must be a boolean'),
    body('is_setted_product').optional().isBoolean().withMessage('Is setted product must be a boolean')
  ]),
  productController.createProduct
);

/**
 * @swagger
 * /api/products/update:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.put(
  '/update',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('product_group_id').optional().isInt().withMessage('Product group ID must be an integer'),
    body('brand_id').optional().isInt().withMessage('Brand ID must be an integer'),
    body('product_type_id').optional().isInt().withMessage('Product type ID must be an integer'),
    body('seller_id').optional().isInt().withMessage('Seller ID must be an integer'),
    body('storage_condition_id').optional().isInt().withMessage('Storage condition ID must be an integer'),
    body('color_type_id').optional().isInt().withMessage('Color type ID must be an integer'),
    body('cutting_type_id').optional().isInt().withMessage('Cutting type ID must be an integer'),
    body('quality_type_id').optional().isInt().withMessage('Quality type ID must be an integer'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('volume').optional().isNumeric().withMessage('Volume must be a number'),
    body('density').optional().isNumeric().withMessage('Density must be a number'),
    body('width').optional().isNumeric().withMessage('Width must be a number'),
    body('length').optional().isNumeric().withMessage('Length must be a number'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('critical_stock_amount').optional().isNumeric().withMessage('Critical stock amount must be a number'),
    body('shelflife_limit').optional().isInt().withMessage('Shelf life limit must be an integer'),
    body('max_stack').optional().isInt().withMessage('Max stack must be an integer'),
    body('stock_tracking').optional().isBoolean().withMessage('Stock tracking must be a boolean'),
    body('bbd_tracking').optional().isBoolean().withMessage('BBD tracking must be a boolean'),
    body('lot_tracking').optional().isBoolean().withMessage('Lot tracking must be a boolean'),
    body('is_blocked').optional().isBoolean().withMessage('Is blocked must be a boolean'),
    body('is_setted_product').optional().isBoolean().withMessage('Is setted product must be a boolean')
  ]),
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/remove/{id}:
 *   get:
 *     summary: Delete a product (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.get(
  '/remove/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  productController.deleteProduct
);

/**
 * @swagger
 * /api/products/GetWithDetails/{id}:
 *   get:
 *     summary: Get product with all details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Detailed product information
 */
router.get(
  '/GetWithDetails/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  productController.getProductWithDetails
);

/**
 * @swagger
 * /api/products/GetAllWithDetails:
 *   get:
 *     summary: Get all products with details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products with details
 */
router.get(
  '/GetAllWithDetails',
  authenticate,
  productController.getAllProductsWithDetails
);

/**
 * @swagger
 * /api/products/GetAllWithDetailsForWeb:
 *   get:
 *     summary: Get all products with details formatted for web
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products formatted for web
 */
router.get(
  '/GetAllWithDetailsForWeb',
  authenticate,
  productController.getAllProductsWithDetailsForWeb
);

/**
 * @swagger
 * /api/products/GetAllWithDetails/{limit}/{offset}:
 *   get:
 *     summary: Get paginated products with details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of products to return
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: Paginated list of products with details
 */
router.get(
  '/GetAllWithDetails/:limit/:offset',
  authenticate,
  validate([
    param('limit').isInt().withMessage('Limit must be an integer'),
    param('offset').isInt().withMessage('Offset must be an integer')
  ]),
  productController.getPaginatedProductsWithDetails
);

/**
 * @swagger
 * /api/products/GetProductsWithDetailsWithFilter/{limit}/{offset}:
 *   get:
 *     summary: Get filtered products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of products to return
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of products to skip
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for product name or code
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *         description: Filter by brand ID
 *       - in: query
 *         name: productGroupId
 *         schema:
 *           type: integer
 *         description: Filter by product group ID
 *       - in: query
 *         name: productTypeId
 *         schema:
 *           type: integer
 *         description: Filter by product type ID
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: integer
 *         description: Filter by seller ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Filtered paginated list of products
 */
router.get(
  '/GetProductsWithDetailsWithFilter/:limit/:offset',
  authenticate,
  validate([
    param('limit').isInt().withMessage('Limit must be an integer'),
    param('offset').isInt().withMessage('Offset must be an integer'),
    query('searchTerm').optional().isString(),
    query('brandId').optional().isInt().withMessage('Brand ID must be an integer'),
    query('productGroupId').optional().isInt().withMessage('Product group ID must be an integer'),
    query('productTypeId').optional().isInt().withMessage('Product type ID must be an integer'),
    query('sellerId').optional().isInt().withMessage('Seller ID must be an integer'),
    query('isActive').optional().isBoolean().withMessage('IsActive must be a boolean')
  ]),
  productController.getFilteredProductsWithDetails
);

/**
 * @swagger
 * /api/products/GetProductFilterItems:
 *   get:
 *     summary: Get filter options for products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options for products
 */
router.get(
  '/GetProductFilterItems',
  authenticate,
  productController.getProductFilterItems
);

/**
 * @swagger
 * /api/products/Dashboard:
 *   get:
 *     summary: Get product dashboard data
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data for products
 */
router.get(
  '/Dashboard',
  authenticate,
  productController.getProductDashboard
);

export default router;