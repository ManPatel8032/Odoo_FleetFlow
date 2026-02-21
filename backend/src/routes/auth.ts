import { Router } from 'express';
import * as authController from '@/controllers/authController';
import { authMiddleware } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { LoginSchema, RegisterSchema } from '../../../shared/validation/schemas';

const router = Router();

router.post('/login', validateRequest(LoginSchema), authController.login);
router.post('/register', validateRequest(RegisterSchema), authController.register);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

export default router;
