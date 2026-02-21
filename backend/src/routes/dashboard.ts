import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/fleet-stats', dashboardController.getFleetStats);

export default router;
