import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { strictAuth, requirePermission } from '../middleware/enhanced-auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', strictAuth(), ProductController.getAllProducts);
router.get('/:id', strictAuth(), ProductController.getProductById);
router.post('/', strictAuth(), ProductController.createProduct);
router.put('/:id', strictAuth(), ProductController.updateProduct);
router.delete('/:id', strictAuth(), ProductController.deleteProduct);
router.patch('/bulk-status', strictAuth(), ProductController.bulkUpdateStatus);
router.post('/:id/photos', strictAuth(), upload.single('photo'), ProductController.uploadPhoto);

export default router;