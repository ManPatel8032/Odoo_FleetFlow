import { Router } from 'express';
import * as driverController from '../controllers/driverController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', driverController.getDrivers);
router.get('/license-expiry', driverController.checkLicenseExpiry);
router.get('/:id', driverController.getDriverById);
router.post('/', requireRole('ADMIN', 'MANAGER'), driverController.createDriver);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), driverController.updateDriver);
router.patch('/:id/status', requireRole('ADMIN', 'MANAGER'), driverController.updateDriverStatus);
router.delete('/:id', requireRole('ADMIN'), driverController.deleteDriver);

export default router;
