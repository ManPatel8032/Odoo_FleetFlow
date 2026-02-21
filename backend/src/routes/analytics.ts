import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', analyticsController.getAnalytics);
router.get('/export', analyticsController.exportReport);

export default router;
