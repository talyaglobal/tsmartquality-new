import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as warehouseController from '../controllers/warehouse.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all warehouses
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getAllWarehouses
);

// Get warehouse by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getWarehouseById
);

// Create a new warehouse
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').optional(),
    body('address').optional(),
    body('country_id').optional().isInt().withMessage('Country ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseController.createWarehouse
);

// Update a warehouse
router.put(
  '/update',
  [
    body('id').isInt().withMessage('Warehouse ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('code').optional(),
    body('address').optional(),
    body('country_id').optional().isInt().withMessage('Country ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseController.updateWarehouse
);

// Delete a warehouse
router.get(
  '/remove/:id',
  [
    param('id').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseController.deleteWarehouse
);

// Get warehouse with detailed information
router.get(
  '/details/:id',
  [
    param('id').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getWarehouseWithDetails
);

// Get all warehouses with detailed information
router.get(
  '/withdetails',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getAllWarehousesWithDetails
);

// Get warehouses with filtered search
router.get(
  '/filter',
  [
    query('searchTerm').optional(),
    query('countryId').optional().isInt().withMessage('Country ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getFilteredWarehouses
);

// Get warehouses by country
router.get(
  '/bycountry/:countryId',
  [
    param('countryId').isInt().withMessage('Country ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseController.getWarehousesByCountry
);

export default router;