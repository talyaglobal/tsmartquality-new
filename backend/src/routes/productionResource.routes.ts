import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as productionResourceController from '../controllers/productionResource.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/production-resources
 * @desc Get all production resources with pagination and filtering
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/',
  [
    query('name').optional().isString().withMessage('Name must be a string'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionResourceController.getAllProductionResources
);

/**
 * @route GET /api/v1/production-resources/types
 * @desc Get all resource types
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/types',
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionResourceController.getResourceTypes
);

/**
 * @route GET /api/v1/production-resources/:id
 * @desc Get a production resource by ID
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Production resource ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionResourceController.getProductionResourceById
);

/**
 * @route POST /api/v1/production-resources
 * @desc Create a new production resource
 * @access Private - Admin, Manager
 */
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('resource_type').isString().notEmpty().withMessage('Resource type is required'),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number'),
    body('unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('cost_per_unit').optional().isNumeric().withMessage('Cost per unit must be a number'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionResourceController.createProductionResource
);

/**
 * @route PUT /api/v1/production-resources/:id
 * @desc Update a production resource
 * @access Private - Admin, Manager
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Production resource ID must be an integer'),
    body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('resource_type').optional().isString().notEmpty().withMessage('Resource type must be a non-empty string'),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number'),
    body('unit_of_measure').optional().isString().withMessage('Unit of measure must be a string'),
    body('cost_per_unit').optional().isNumeric().withMessage('Cost per unit must be a number'),
    body('location_id').optional().isInt().withMessage('Location ID must be an integer'),
    body('availability_status').optional().isString().withMessage('Availability status must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionResourceController.updateProductionResource
);

/**
 * @route PUT /api/v1/production-resources/:id/availability
 * @desc Update resource availability
 * @access Private - Admin, Manager
 */
router.put(
  '/:id/availability',
  [
    param('id').isInt().withMessage('Production resource ID must be an integer'),
    body('availability_status').isIn(['available', 'maintenance', 'reserved', 'inactive']).withMessage('Invalid availability status'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionResourceController.updateResourceAvailability
);

/**
 * @route GET /api/v1/production-resources/:id/availability-history
 * @desc Get resource availability history
 * @access Private - Admin, Manager, QualityManager
 */
router.get(
  '/:id/availability-history',
  [
    param('id').isInt().withMessage('Production resource ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  roleMiddleware(['admin', 'manager', 'qualityManager']),
  productionResourceController.getResourceAvailabilityHistory
);

/**
 * @route DELETE /api/v1/production-resources/:id
 * @desc Delete a production resource (soft delete)
 * @access Private - Admin, Manager
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Production resource ID must be an integer'),
    validate
  ],
  roleMiddleware(['admin', 'manager']),
  productionResourceController.deleteProductionResource
);

export default router;