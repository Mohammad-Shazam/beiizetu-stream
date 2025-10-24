import { Router } from 'express';
import { otpRoutes } from './otp';
import { emailRoutes } from './email';

const router = Router();

// Mount routes
router.use('/otp', otpRoutes);
router.use('/email', emailRoutes);

export function setupRoutes(app: any) {
  app.use('/api', router);
}