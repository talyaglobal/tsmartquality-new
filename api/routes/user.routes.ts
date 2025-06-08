import express from 'express';
import { UserController } from '../controllers/user.controller';
import { strictAuth, requirePermission } from '../middleware/enhanced-auth.middleware';

const router = express.Router();

// Registration (public)
router.post('/register', UserController.register);

// Profile management (authenticated users)
router.get('/me', strictAuth(), UserController.getProfile);
router.patch('/me', strictAuth(), UserController.updateProfile);
router.post('/change-password', strictAuth(), UserController.changePassword);

// Admin operations
router.get('/', requirePermission('user', 'read'), UserController.getAllUsers);

export default router;