import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { LoginSchema, RegisterSchema } from '../validation/schemas';

const router = Router();

router.post('/login', validateRequest(LoginSchema), authController.login);
router.post('/register', validateRequest(RegisterSchema), authController.register);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

export default router;
