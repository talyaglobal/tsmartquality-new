import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as productionOrderController from '../controllers/productionOrder.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all production orders
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  productionOrderController.getAllProductionOrders
);

// Get production order by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Production order ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionOrderController.getProductionOrderById
);

// Create a new production order
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('plan_id').optional().isInt().withMessage('Plan ID must be an integer'),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi product ID must be an integer'),
    body('recipe_id').optional().isInt().withMessage('Recipe ID must be an integer'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional(),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['draft', 'pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be an integer between 0 and 100'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('description').optional(),
    body('notes').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionOrderController.createProductionOrder
);

// Update a production order
router.put(
  '/update',
  [
    body('id').isInt().withMessage('Production order ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('plan_id').optional().isInt().withMessage('Plan ID must be an integer'),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi product ID must be an integer'),
    body('recipe_id').optional().isInt().withMessage('Recipe ID must be an integer'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional(),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['draft', 'pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be an integer between 0 and 100'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('description').optional(),
    body('notes').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionOrderController.updateProductionOrder
);

// Delete a production order
router.get(
  '/remove/:id',
  [
    param('id').isInt().withMessage('Production order ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionOrderController.deleteProductionOrder
);

// Get production order with detailed information
router.get(
  '/details/:id',
  [
    param('id').isInt().withMessage('Production order ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionOrderController.getProductionOrderWithDetails
);

// Get filtered production orders
router.get(
  '/filter',
  [
    query('status').optional().isIn(['draft', 'pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    query('planId').optional().isInt().withMessage('Plan ID must be an integer'),
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('semiProductId').optional().isInt().withMessage('Semi product ID must be an integer'),
    query('recipeId').optional().isInt().withMessage('Recipe ID must be an integer'),
    query('startDateFrom').optional().isISO8601().withMessage('Start date from must be a valid date'),
    query('startDateTo').optional().isISO8601().withMessage('Start date to must be a valid date'),
    query('endDateFrom').optional().isISO8601().withMessage('End date from must be a valid date'),
    query('endDateTo').optional().isISO8601().withMessage('End date to must be a valid date'),
    query('searchTerm').optional(),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  productionOrderController.getFilteredProductionOrders
);

// Update production order status
router.put(
  '/status/:id',
  [
    param('id').isInt().withMessage('Production order ID must be an integer'),
    body('status').isIn(['draft', 'pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be an integer between 0 and 100'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  productionOrderController.updateProductionOrderStatus
);

export default router;