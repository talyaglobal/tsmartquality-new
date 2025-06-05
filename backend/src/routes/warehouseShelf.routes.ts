import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as warehouseShelfController from '../controllers/warehouseShelf.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WarehouseShelf:
 *       type: object
 *       required:
 *         - name
 *         - warehouse_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The warehouse shelf ID
 *         name:
 *           type: string
 *           description: Shelf name
 *         code:
 *           type: string
 *           description: Shelf code
 *         description:
 *           type: string
 *           description: Shelf description
 *         warehouse_id:
 *           type: integer
 *           description: Warehouse ID
 *         location_id:
 *           type: integer
 *           description: Location ID
 *         shelf_level:
 *           type: integer
 *           description: Shelf level
 *         shelf_position:
 *           type: string
 *           description: Shelf position
 *         capacity_volume:
 *           type: number
 *           description: Capacity volume
 *         capacity_weight:
 *           type: number
 *           description: Capacity weight
 *         is_active:
 *           type: boolean
 *           description: Whether shelf is active
 *         is_blocked:
 *           type: boolean
 *           description: Whether shelf is blocked
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Shelf status
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
 *           description: User ID who created the shelf
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the shelf
 */

/**
 * @swagger
 * /api/warehouse-shelves:
 *   get:
 *     summary: Get all warehouse shelves
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of warehouse shelves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarehouseShelf'
 */
router.get('/', authenticate, warehouseShelfController.getAllWarehouseShelves);

/**
 * @swagger
 * /api/warehouse-shelves/warehouse/{warehouseId}:
 *   get:
 *     summary: Get shelves by warehouse ID
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: List of shelves for a warehouse
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarehouseShelf'
 */
router.get(
  '/warehouse/:warehouseId',
  authenticate,
  validate([param('warehouseId').isInt().withMessage('Warehouse ID must be an integer')]),
  warehouseShelfController.getShelvesByWarehouseId
);

/**
 * @swagger
 * /api/warehouse-shelves/location/{locationId}:
 *   get:
 *     summary: Get shelves by location ID
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       200:
 *         description: List of shelves for a location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarehouseShelf'
 */
router.get(
  '/location/:locationId',
  authenticate,
  validate([param('locationId').isInt().withMessage('Location ID must be an integer')]),
  warehouseShelfController.getShelvesByLocationId
);

/**
 * @swagger
 * /api/warehouse-shelves/{id}:
 *   get:
 *     summary: Get warehouse shelf by ID
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shelf ID
 *     responses:
 *       200:
 *         description: Warehouse shelf details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseShelf'
 *       404:
 *         description: Warehouse shelf not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  warehouseShelfController.getWarehouseShelfById
);

/**
 * @swagger
 * /api/warehouse-shelves:
 *   post:
 *     summary: Create a new warehouse shelf
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WarehouseShelf'
 *     responses:
 *       201:
 *         description: Warehouse shelf created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseShelf'
 */
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('warehouse_id').isInt().withMessage('Warehouse ID is required and must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('code').optional().isString().withMessage('Code must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('shelf_level').optional().isInt().withMessage('Shelf level must be an integer'),
    body('shelf_position').optional().isString().withMessage('Shelf position must be a string'),
    body('capacity_volume').optional().isNumeric().withMessage('Capacity volume must be a number'),
    body('capacity_weight').optional().isNumeric().withMessage('Capacity weight must be a number'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    body('is_blocked').optional().isBoolean().withMessage('Is blocked must be a boolean')
  ]),
  warehouseShelfController.createWarehouseShelf
);

/**
 * @swagger
 * /api/warehouse-shelves/update:
 *   put:
 *     summary: Update a warehouse shelf
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WarehouseShelf'
 *     responses:
 *       200:
 *         description: Warehouse shelf updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseShelf'
 */
router.put(
  '/update',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('warehouse_id').isInt().withMessage('Warehouse ID is required and must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('code').optional().isString().withMessage('Code must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('shelf_level').optional().isInt().withMessage('Shelf level must be an integer'),
    body('shelf_position').optional().isString().withMessage('Shelf position must be a string'),
    body('capacity_volume').optional().isNumeric().withMessage('Capacity volume must be a number'),
    body('capacity_weight').optional().isNumeric().withMessage('Capacity weight must be a number'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    body('is_blocked').optional().isBoolean().withMessage('Is blocked must be a boolean')
  ]),
  warehouseShelfController.updateWarehouseShelf
);

/**
 * @swagger
 * /api/warehouse-shelves/remove/{id}:
 *   get:
 *     summary: Delete a warehouse shelf (soft delete)
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shelf ID to delete
 *     responses:
 *       200:
 *         description: Warehouse shelf deleted successfully
 */
router.get(
  '/remove/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  warehouseShelfController.deleteWarehouseShelf
);

/**
 * @swagger
 * /api/warehouse-shelves/paginated/{limit}/{offset}:
 *   get:
 *     summary: Get paginated warehouse shelves
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of shelves to return
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of shelves to skip
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: integer
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: Filter by location ID
 *     responses:
 *       200:
 *         description: Paginated list of warehouse shelves
 */
router.get(
  '/paginated/:limit/:offset',
  authenticate,
  validate([
    param('limit').isInt().withMessage('Limit must be an integer'),
    param('offset').isInt().withMessage('Offset must be an integer'),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('locationId').optional().isInt().withMessage('Location ID must be an integer')
  ]),
  warehouseShelfController.getPaginatedShelves
);

/**
 * @swagger
 * /api/warehouse-shelves/filtered/{limit}/{offset}:
 *   get:
 *     summary: Get filtered warehouse shelves with pagination
 *     tags: [Warehouse Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of shelves to return
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of shelves to skip
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for shelf name, code, or position
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: integer
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: Filter by location ID
 *       - in: query
 *         name: shelfLevel
 *         schema:
 *           type: integer
 *         description: Filter by shelf level
 *       - in: query
 *         name: isBlocked
 *         schema:
 *           type: boolean
 *         description: Filter by blocked status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Filtered paginated list of warehouse shelves
 */
router.get(
  '/filtered/:limit/:offset',
  authenticate,
  validate([
    param('limit').isInt().withMessage('Limit must be an integer'),
    param('offset').isInt().withMessage('Offset must be an integer'),
    query('searchTerm').optional().isString(),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('locationId').optional().isInt().withMessage('Location ID must be an integer'),
    query('shelfLevel').optional().isInt().withMessage('Shelf level must be an integer'),
    query('isBlocked').optional().isBoolean().withMessage('Is blocked must be a boolean'),
    query('isActive').optional().isBoolean().withMessage('Is active must be a boolean')
  ]),
  warehouseShelfController.getFilteredShelves
);

export default router;