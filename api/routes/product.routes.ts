import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', auth, ProductController.createProduct);
router.put('/:id', auth, ProductController.updateProduct);
router.delete('/:id', auth, ProductController.deleteProduct);

export default router;