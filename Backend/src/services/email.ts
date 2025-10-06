import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Log để debug
// Ẩn mật khẩu trong log
console.log('📧 Email Configuration:', {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL ? '***' + process.env.PASS_EMAIL.slice(-4) : 'undefined'
});
// Tạo transporter sử dụng Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
transporter.verify()
  .then(() => console.log('✅ Email service ready'))
  .catch((err) => console.error('❌ Email service error:', err));
export async function sendVerificationCode(to: string, code: string, type: 'signup' | 'signin' = 'signin') {
    try {
        console.log(`📤 Sending ${type} code to:`, to);
        
        const subject = type === 'signup' ? 'Welcome to Mini Trello - Verify Your Account' : 'Mini Trello Sign In - Verification Code';
        const text = type === 'signup' 
            ? `Welcome to Mini Trello! Your verification code to complete registration is: ${code}. This code will expire in 10 minutes.`
            : `Your Mini Trello sign-in verification code is: ${code}. This code will expire in 10 minutes.`;

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to,
            subject,
            text, // Plain text fallback
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #3B82F6; font-size: 28px;">Mini Trello</h1>
                    </div>
                    <h2 style="color: #374151; margin-bottom: 20px;">${subject}</h2>
                    <p style="color: #6B7280; font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="color: #6B7280; font-size: 16px; line-height: 1.5;">${text}</p>
                    
                    <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px;">
                        <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold;">${code}</h1>
                    </div>
                    
                    <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="color: #92400E; margin: 0; font-size: 14px;">
                            ⚠️ This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                    
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
                        Best regards,<br>
                        <strong>The Mini Trello Team</strong>
                    </p>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return result;
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Gửi email mời cộng tác vào board
export async function sendInvitationEmail(to: string, inviterEmail: string, boardName: string, inviteLink: string) {
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to,
        subject: `You're invited to join "${boardName}" on Trello`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0079bf;">You're invited to collaborate!</h2>
                <p>Hello,</p>
                <p><strong>${inviterEmail}</strong> has invited you to join the board "<strong>${boardName}</strong>" on Trello.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #0079bf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
                </div>
                <p>If the button doesn't work, copy and paste this link in your browser:</p>
                <p>${inviteLink}</p>
                <p>Happy collaborating!<br>The Trello Team</p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
}