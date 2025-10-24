import { Router } from 'express';
import { sendOTPEmail, sendWelcomeEmail } from '../services/email-service.js';

const router = Router();

// Send OTP email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const success = await sendOTPEmail(email);
    
    if (success) {
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Send welcome email
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const success = await sendWelcomeEmail(email, name);
    
    if (success) {
      return res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send welcome email' });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

export { router as emailRoutes };