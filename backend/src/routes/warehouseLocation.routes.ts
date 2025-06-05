import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as warehouseLocationController from '../controllers/warehouseLocation.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all warehouse locations
router.get(
  '/',
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseLocationController.getAllLocations
);

// Get warehouse location by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Location ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseLocationController.getLocationById
);

// Create a new warehouse location
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('warehouse_id').isInt().withMessage('Warehouse ID must be an integer'),
    body('code').optional(),
    body('description').optional(),
    body('floor_level').optional().isInt().withMessage('Floor level must be an integer'),
    body('aisle').optional(),
    body('section').optional(),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseLocationController.createLocation
);

// Update a warehouse location
router.put(
  '/update',
  [
    body('id').isInt().withMessage('Location ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('warehouse_id').optional().isInt().withMessage('Warehouse ID must be an integer'),
    body('code').optional(),
    body('description').optional(),
    body('floor_level').optional().isInt().withMessage('Floor level must be an integer'),
    body('aisle').optional(),
    body('section').optional(),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseLocationController.updateLocation
);

// Delete a warehouse location
router.get(
  '/remove/:id',
  [
    param('id').isInt().withMessage('Location ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager']),
  warehouseLocationController.deleteLocation
);

// Get locations by warehouse ID
router.get(
  '/warehouse/:warehouseId',
  [
    param('warehouseId').isInt().withMessage('Warehouse ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseLocationController.getLocationsByWarehouse
);

// Get location with detailed information
router.get(
  '/details/:id',
  [
    param('id').isInt().withMessage('Location ID must be an integer'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseLocationController.getLocationWithDetails
);

// Get locations with filtered search
router.get(
  '/filter',
  [
    query('searchTerm').optional(),
    query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
    query('isActive').optional().isBoolean().withMessage('Is active must be a boolean'),
    validate,
  ],
  roleMiddleware(['admin', 'manager', 'user']),
  warehouseLocationController.getFilteredLocations
);

export default router;