import express from 'express';
import { UserController } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/me', auth, UserController.getProfile);
router.patch('/me', auth, UserController.updateProfile);

export default router;