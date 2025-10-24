import { Router } from 'express';
import { sendOTPEmail, sendWelcomeEmail } from '../services/email-service';
import { generateOTP, storeOTP } from '../services/otp-service';
import transporter from '../config/mailer';

const router = Router();

// Send OTP email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const otp = generateOTP();
    storeOTP(email, otp);
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Your Login OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Login Verification</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Your OTP code for logging into Beiizetu Stream is:
            </p>
            <div style="background-color: #007bff; color: white; font-size: 24px; font-weight: bold; 
                        padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              This code will expire in 5 minutes.
            </p>
            <p style="color: #999; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
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
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to Beiizetu Stream',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Beiizetu Stream!</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Hi ${name || 'there'}, welcome to our platform! Your account has been successfully created.
            </p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              You can now log in and start using our video streaming services.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

export { router as emailRoutes };