import { Router } from 'express';
import { generateOTP, storeOTP, verifyOTP, cleanupExpiredOTPs, getOTPRemainingTime } from '../services/otp-service';

const router = Router();

// Generate and store OTP
router.post('/generate', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if there's already an active OTP
    const remainingTime = getOTPRemainingTime(email);
    if (remainingTime > 0) {
      return res.status(429).json({ 
        error: 'OTP already sent. Please wait before requesting a new one.',
        remainingTime 
      });
    }
    
    const otp = generateOTP();
    storeOTP(email, otp);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP generated successfully',
      // In production, don't return the OTP in the response
      // This is just for demonstration
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const result = verifyOTP(email, otp);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error || 'Invalid or expired OTP' 
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Clean up expired OTPs
router.post('/cleanup', async (req, res) => {
  try {
    cleanupExpiredOTPs();
    res.status(200).json({ 
      success: true, 
      message: 'Expired OTPs cleaned up' 
    });
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    res.status(500).json({ error: 'Failed to cleanup OTPs' });
  }
});

export { router as otpRoutes };