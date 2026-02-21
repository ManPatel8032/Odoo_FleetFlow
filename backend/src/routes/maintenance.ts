import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateMaintenanceSchema, UpdateMaintenanceSchema, MaintenanceStatusSchema } from '../validation/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', maintenanceController.getMaintenanceLogs);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', requireRole('ADMIN', 'MANAGER'), validateRequest(CreateMaintenanceSchema), maintenanceController.createMaintenance);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(UpdateMaintenanceSchema.partial()), maintenanceController.updateMaintenance);
router.patch('/:id/status', requireRole('ADMIN', 'MANAGER'), validateRequest(MaintenanceStatusSchema), maintenanceController.updateMaintenanceStatus);
router.delete('/:id', requireRole('ADMIN'), maintenanceController.deleteMaintenance);

export default router;
