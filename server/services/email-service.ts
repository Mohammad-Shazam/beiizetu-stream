import transporter from '../config/mailer.js';
import { generateOTP, storeOTP } from './otp-service.js';

export async function sendOTPEmail(email: string): Promise<boolean> {
  try {
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
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
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
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}