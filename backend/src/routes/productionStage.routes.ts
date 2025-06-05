import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as productionStageController from '../controllers/productionStage.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/production-stages
 * @desc Get all production stages with pagination and filtering
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/',
  [
    query('orderId').optional().isInt().withMessage('Order ID must be an integer'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionStageController.getAllProductionStages
);

/**
 * @route GET /api/v1/production-stages/:id
 * @desc Get a production stage by ID
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Production stage ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionStageController.getProductionStageById
);

/**
 * @route POST /api/v1/production-stages
 * @desc Create a new production stage
 * @access Private - Admin, Manager
 */
router.post(
  '/',
  [
    body('production_order_id').isInt().withMessage('Production order ID must be an integer'),
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('sequence_number').isInt({ min: 1 }).withMessage('Sequence number must be a positive integer'),
    body('estimated_duration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
    body('instructions').optional().isString().withMessage('Instructions must be a string'),
    body('quality_check_required').optional().isBoolean().withMessage('Quality check required must be a boolean'),
    body('resources').optional().isArray().withMessage('Resources must be an array'),
    body('resources.*.resource_id').optional().isInt().withMessage('Resource ID must be an integer'),
    body('resources.*.resource_type').optional().isString().withMessage('Resource type must be a string'),
    body('resources.*.quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionStageController.createProductionStage
);

/**
 * @route PUT /api/v1/production-stages/:id
 * @desc Update a production stage
 * @access Private - Admin, Manager
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Production stage ID must be an integer'),
    body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('sequence_number').optional().isInt({ min: 1 }).withMessage('Sequence number must be a positive integer'),
    body('estimated_duration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
    body('instructions').optional().isString().withMessage('Instructions must be a string'),
    body('quality_check_required').optional().isBoolean().withMessage('Quality check required must be a boolean'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionStageController.updateProductionStage
);

/**
 * @route PUT /api/v1/production-stages/status/:id
 * @desc Update a production stage status
 * @access Private - Admin, Manager, QualityManager
 */
router.put(
  '/status/:id',
  [
    param('id').isInt().withMessage('Production stage ID must be an integer'),
    body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be an integer between 0 and 100'),
    body('quality_approved').optional().isBoolean().withMessage('Quality approval must be a boolean'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionStageController.updateProductionStageStatus
);

/**
 * @route DELETE /api/v1/production-stages/:id
 * @desc Delete a production stage (soft delete)
 * @access Private - Admin, Manager
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Production stage ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionStageController.deleteProductionStage
);

/**
 * @route POST /api/v1/production-stages/:id/resources
 * @desc Add resources to a production stage
 * @access Private - Admin, Manager
 */
router.post(
  '/:id/resources',
  [
    param('id').isInt().withMessage('Production stage ID must be an integer'),
    body('resources').isArray({ min: 1 }).withMessage('Resources array is required'),
    body('resources.*.resource_id').isInt().withMessage('Resource ID must be an integer'),
    body('resources.*.resource_type').isString().withMessage('Resource type must be a string'),
    body('resources.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionStageController.addProductionStageResources
);

/**
 * @route DELETE /api/v1/production-stages/:stageId/resources/:resourceId
 * @desc Remove a resource from a production stage
 * @access Private - Admin, Manager
 */
router.delete(
  '/:stageId/resources/:resourceId',
  [
    param('stageId').isInt().withMessage('Production stage ID must be an integer'),
    param('resourceId').isInt().withMessage('Resource ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionStageController.removeProductionStageResource
);

export default router;