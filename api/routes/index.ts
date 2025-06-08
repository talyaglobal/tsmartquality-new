import { Router } from 'express';
import { authRoutes } from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import qualityCheckRoutes from './quality-check.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/quality-checks', qualityCheckRoutes);

export default router;