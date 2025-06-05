import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as productionOutputController from '../controllers/productionOutput.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/production-outputs
 * @desc Get all production outputs with pagination and filtering
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/',
  [
    query('orderId').optional().isInt().withMessage('Order ID must be an integer'),
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('qualityStatus').optional().isString().withMessage('Quality status must be a string'),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('locationId').optional().isInt().withMessage('Location ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionOutputController.getAllProductionOutputs
);

/**
 * @route GET /api/v1/production-outputs/:id
 * @desc Get a production output by ID
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionOutputController.getProductionOutputById
);

/**
 * @route POST /api/v1/production-outputs
 * @desc Create a new production output
 * @access Private - Admin, Manager
 */
router.post(
  '/',
  [
    body('production_order_id').isInt().withMessage('Production order ID must be an integer'),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('lot_number').optional().isString().withMessage('Lot number must be a string'),
    body('batch_number').optional().isString().withMessage('Batch number must be a string'),
    body('quality_status').optional().isString().withMessage('Quality status must be a string'),
    body('warehouse_id').optional().isInt().withMessage('Warehouse ID must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionOutputController.createProductionOutput
);

/**
 * @route PUT /api/v1/production-outputs/:id
 * @desc Update a production output
 * @access Private - Admin, Manager
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('lot_number').optional().isString().withMessage('Lot number must be a string'),
    body('batch_number').optional().isString().withMessage('Batch number must be a string'),
    body('quality_status').optional().isString().withMessage('Quality status must be a string'),
    body('warehouse_id').optional().isInt().withMessage('Warehouse ID must be an integer'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionOutputController.updateProductionOutput
);

/**
 * @route DELETE /api/v1/production-outputs/:id
 * @desc Delete a production output (soft delete)
 * @access Private - Admin, Manager
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionOutputController.deleteProductionOutput
);

/**
 * @route POST /api/v1/production-outputs/:id/quality-checks
 * @desc Link a quality check to a production output
 * @access Private - Admin, Manager, QualityManager
 */
router.post(
  '/:id/quality-checks',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    body('quality_check_id').isInt().withMessage('Quality check ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionOutputController.linkQualityCheck
);

/**
 * @route DELETE /api/v1/production-outputs/:id/quality-checks/:checkId
 * @desc Unlink a quality check from a production output
 * @access Private - Admin, Manager
 */
router.delete(
  '/:id/quality-checks/:checkId',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    param('checkId').isInt().withMessage('Quality check ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionOutputController.unlinkQualityCheck
);

/**
 * @route GET /api/v1/production-outputs/:id/quality-checks
 * @desc Get quality checks for a production output
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id/quality-checks',
  [
    param('id').isInt().withMessage('Production output ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionOutputController.getOutputQualityChecks
);

export default router;