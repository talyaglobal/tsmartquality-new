import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as warehouseMovementController from '../controllers/warehouseMovement.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all movement history
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseMovementController.getAllMovements
);

// Get movement by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Movement ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseMovementController.getMovementById
);

// Create a new movement record
router.post(
  '/',
  [
    body('movement_type').isIn(['in', 'out', 'transfer', 'adjustment']).withMessage('Invalid movement type'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional(),
    body('lot_number').optional(),
    body('batch_number').optional(),
    body('reference_number').optional(),
    body('notes').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseMovementController.createMovement
);

// Get movements by warehouse
router.get(
  '/warehouse/:warehouseId',
  [
    param('warehouseId').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseMovementController.getMovementsByWarehouse
);

// Get movements by product, raw material, or semi-product
router.get(
  '/item/:itemType/:itemId',
  [
    param('itemType').isIn(['product', 'raw-material', 'semi-product']).withMessage('Invalid item type'),
    param('itemId').isInt().withMessage('Item ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseMovementController.getMovementsByItem
);

// Get movement history with filtering
router.get(
  '/filter',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    query('movementType').optional().isIn(['in', 'out', 'transfer', 'adjustment']).withMessage('Invalid movement type'),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('rawMaterialId').optional().isInt().withMessage('Raw Material ID must be an integer'),
    query('semiProductId').optional().isInt().withMessage('Semi Product ID must be an integer'),
    query('lotNumber').optional(),
    query('batchNumber').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseMovementController.getFilteredMovements
);

// Get movement report (aggregated summary)
router.get(
  '/report',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseMovementController.getMovementReport
);

export default router;