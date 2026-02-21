import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateTripSchema, UpdateTripSchema, TripStatusUpdateSchema } from '../validation/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);
router.post('/', requireRole('ADMIN', 'MANAGER'), validateRequest(CreateTripSchema), tripController.createTrip);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(UpdateTripSchema.partial()), tripController.updateTrip);
router.patch('/:id/status', validateRequest(TripStatusUpdateSchema), tripController.updateTripStatus);

export default router;
