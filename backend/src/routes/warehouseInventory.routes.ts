import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as warehouseInventoryController from '../controllers/warehouseInventory.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all inventory items
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getAllInventoryItems
);

// Get inventory item by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Inventory ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getInventoryItemById
);

// Create a new inventory item
router.post(
  '/',
  [
    body('warehouse_id').isInt().withMessage('Warehouse ID must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('shelf_id').optional().isInt().withMessage('Shelf ID must be an integer'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional(),
    body('lot_number').optional(),
    body('batch_number').optional(),
    body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date'),
    body('production_date').optional().isISO8601().withMessage('Production date must be a valid date'),
    body('status').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseInventoryController.createInventoryItem
);

// Update an inventory item
router.put(
  '/update',
  [
    body('id').isInt().withMessage('Inventory ID must be an integer'),
    body('warehouse_id').optional().isInt().withMessage('Warehouse ID must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('shelf_id').optional().isInt().withMessage('Shelf ID must be an integer'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('original_quantity').optional().isNumeric().withMessage('Original quantity must be a number'),
    body('unit').optional(),
    body('lot_number').optional(),
    body('batch_number').optional(),
    body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date'),
    body('production_date').optional().isISO8601().withMessage('Production date must be a valid date'),
    body('status').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseInventoryController.updateInventoryItem
);

// Delete an inventory item
router.get(
  '/remove/:id',
  [
    param('id').isInt().withMessage('Inventory ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseInventoryController.deleteInventoryItem
);

// Get inventory by warehouse
router.get(
  '/warehouse/:warehouseId',
  [
    param('warehouseId').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getInventoryByWarehouse
);

// Get inventory by location
router.get(
  '/location/:locationId',
  [
    param('locationId').isInt().withMessage('Location ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getInventoryByLocation
);

// Get inventory by product
router.get(
  '/product/:productId',
  [
    param('productId').isInt().withMessage('Product ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getInventoryByProduct
);

// Get filtered inventory
router.get(
  '/filter',
  [
    query('searchTerm').optional(),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('locationId').optional().isInt().withMessage('Location ID must be an integer'),
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('rawMaterialId').optional().isInt().withMessage('Raw Material ID must be an integer'),
    query('semiProductId').optional().isInt().withMessage('Semi Product ID must be an integer'),
    query('status').optional(),
    query('lotNumber').optional(),
    query('batchNumber').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getFilteredInventory
);

// Get inventory summary
router.get(
  '/summary',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseInventoryController.getInventorySummary
);

export default router;