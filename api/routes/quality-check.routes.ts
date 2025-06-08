import express from 'express';
import { QualityCheckController } from '../controllers/quality-check.controller';
import { strictAuth, optionalAuth } from '../middleware/enhanced-auth.middleware';

const router = express.Router();

router.get('/', strictAuth(), QualityCheckController.getAllQualityChecks);
router.get('/:id', optionalAuth(), QualityCheckController.getQualityCheckById);
router.get('/product/:productId', strictAuth(), QualityCheckController.getQualityChecksByProduct);
router.post('/', strictAuth(), QualityCheckController.createQualityCheck);
router.put('/:id', strictAuth(), QualityCheckController.updateQualityCheck);
router.delete('/:id', strictAuth(), QualityCheckController.deleteQualityCheck);

export default router;