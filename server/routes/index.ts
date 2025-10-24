import { Router } from 'express';
import { otpRoutes } from './otp.js';
import { emailRoutes } from './email.js';

const router = Router();

// Mount routes
router.use('/otp', otpRoutes);
router.use('/email', emailRoutes);

export function setupRoutes(app: any) {
  app.use('/api', router);
}