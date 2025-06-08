import { Router } from 'express';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import qualityCheckRoutes from './quality-check.routes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/quality-checks', qualityCheckRoutes);

export default router;