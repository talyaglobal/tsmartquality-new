import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as qualityCheckController from '../controllers/qualityCheck.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/quality-checks
 * @desc Get all quality checks with pagination and filtering
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/',
  [
    query('productionStageId').optional().isInt().withMessage('Production stage ID must be an integer'),
    query('productionOrderId').optional().isInt().withMessage('Production order ID must be an integer'),
    query('passed').optional().isIn(['true', 'false']).withMessage('Passed must be true or false'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.getAllQualityChecks
);

/**
 * @route GET /api/v1/quality-checks/:id
 * @desc Get a quality check by ID
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Quality check ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.getQualityCheckById
);

/**
 * @route POST /api/v1/quality-checks
 * @desc Create a new quality check
 * @access Private - Admin, Manager, QualityManager
 */
router.post(
  '/',
  [
    body('production_stage_id').isInt().withMessage('Production stage ID must be an integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('passed').isBoolean().withMessage('Passed must be a boolean'),
    body('check_items').optional().isArray().withMessage('Check items must be an array'),
    body('check_items.*.parameter').optional().isString().withMessage('Parameter must be a string'),
    body('check_items.*.expected_value').optional().isString().withMessage('Expected value must be a string'),
    body('check_items.*.actual_value').optional().isString().withMessage('Actual value must be a string'),
    body('check_items.*.unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('check_items.*.passed').optional().isBoolean().withMessage('Passed must be a boolean'),
    body('check_items.*.notes').optional().isString().withMessage('Notes must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.createQualityCheck
);

/**
 * @route PUT /api/v1/quality-checks/:id
 * @desc Update a quality check
 * @access Private - Admin, Manager, QualityManager
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Quality check ID must be an integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('passed').optional().isBoolean().withMessage('Passed must be a boolean'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.updateQualityCheck
);

/**
 * @route DELETE /api/v1/quality-checks/:id
 * @desc Delete a quality check (soft delete)
 * @access Private - Admin
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Quality check ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin']),
  qualityCheckController.deleteQualityCheck
);

/**
 * @route GET /api/v1/quality-checks/stage/:stageId
 * @desc Get quality checks for a production stage
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/stage/:stageId',
  [
    param('stageId').isInt().withMessage('Production stage ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.getQualityChecksByStage
);

/**
 * @route GET /api/v1/quality-checks/order/:orderId
 * @desc Get quality checks for a production order
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/order/:orderId',
  [
    param('orderId').isInt().withMessage('Production order ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.getQualityChecksByOrder
);

/**
 * @route POST /api/v1/quality-checks/:id/items
 * @desc Add or update quality check items
 * @access Private - Admin, Manager, QualityManager
 */
router.post(
  '/:id/items',
  [
    param('id').isInt().withMessage('Quality check ID must be an integer'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.id').optional().isInt().withMessage('Item ID must be an integer'),
    body('items.*.parameter').isString().withMessage('Parameter is required'),
    body('items.*.expected_value').isString().withMessage('Expected value is required'),
    body('items.*.actual_value').isString().withMessage('Actual value is required'),
    body('items.*.unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('items.*.passed').isBoolean().withMessage('Passed is required'),
    body('items.*.notes').optional().isString().withMessage('Notes must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.updateQualityCheckItems
);

/**
 * @route DELETE /api/v1/quality-checks/:checkId/items/:itemId
 * @desc Delete a quality check item
 * @access Private - Admin, Manager, QualityManager
 */
router.delete(
  '/:checkId/items/:itemId',
  [
    param('checkId').isInt().withMessage('Quality check ID must be an integer'),
    param('itemId').isInt().withMessage('Item ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  qualityCheckController.deleteQualityCheckItem
);

export default router;