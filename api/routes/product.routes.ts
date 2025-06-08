import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { auth } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', auth, ProductController.getAllProducts);
router.get('/:id', auth, ProductController.getProductById);
router.post('/', auth, ProductController.createProduct);
router.put('/:id', auth, ProductController.updateProduct);
router.delete('/:id', auth, ProductController.deleteProduct);
router.patch('/bulk-status', auth, ProductController.bulkUpdateStatus);
router.post('/:id/photos', auth, upload.single('photo'), ProductController.uploadPhoto);

export default router;