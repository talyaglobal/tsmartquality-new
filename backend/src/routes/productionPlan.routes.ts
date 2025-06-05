import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as productionPlanController from '../controllers/productionPlan.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all production plans
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  productionPlanController.getAllProductionPlans
);

// Get production plan by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Production plan ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionPlanController.getProductionPlanById
);

// Create a new production plan
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('description').optional(),
    body('notes').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionPlanController.createProductionPlan
);

// Update a production plan
router.put(
  '/update',
  [
    body('id').isInt().withMessage('Production plan ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('description').optional(),
    body('notes').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionPlanController.updateProductionPlan
);

// Delete a production plan
router.get(
  '/remove/:id',
  [
    param('id').isInt().withMessage('Production plan ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionPlanController.deleteProductionPlan
);

// Get production plan with detailed information
router.get(
  '/details/:id',
  [
    param('id').isInt().withMessage('Production plan ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionPlanController.getProductionPlanWithDetails
);

// Get filtered production plans
router.get(
  '/filter',
  [
    query('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    query('startDateFrom').optional().isISO8601().withMessage('Start date from must be a valid date'),
    query('startDateTo').optional().isISO8601().withMessage('Start date to must be a valid date'),
    query('endDateFrom').optional().isISO8601().withMessage('End date from must be a valid date'),
    query('endDateTo').optional().isISO8601().withMessage('End date to must be a valid date'),
    query('searchTerm').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionPlanController.getFilteredProductionPlans
);

// Update production plan status
router.put(
  '/status/:id',
  [
    param('id').isInt().withMessage('Production plan ID must be an integer'),
    body('status').isIn(['draft', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionPlanController.updateProductionPlanStatus
);

// Get production plan dashboard
router.get(
  '/dashboard',
  roleMiddleware(['admin', 'manager', 'user']),
  productionPlanController.getProductionPlanDashboard
);

export default router;