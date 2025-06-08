import express from 'express';
import { QualityCheckController } from '../controllers/quality-check.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', QualityCheckController.getAllQualityChecks);
router.get('/:id', QualityCheckController.getQualityCheckById);
router.get('/product/:productId', QualityCheckController.getQualityChecksByProduct);
router.post('/', auth, QualityCheckController.createQualityCheck);
router.put('/:id', auth, QualityCheckController.updateQualityCheck);
router.delete('/:id', auth, QualityCheckController.deleteQualityCheck);

export default router;