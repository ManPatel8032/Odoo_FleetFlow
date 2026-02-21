import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateVehicleSchema, UpdateVehicleSchema } from '../validation/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', requireRole('ADMIN', 'MANAGER'), validateRequest(CreateVehicleSchema), vehicleController.createVehicle);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(UpdateVehicleSchema.partial()), vehicleController.updateVehicle);
router.delete('/:id', requireRole('ADMIN'), vehicleController.deleteVehicle);
router.patch('/:id/status', requireRole('ADMIN', 'MANAGER'), vehicleController.updateVehicleStatus);

export default router;
