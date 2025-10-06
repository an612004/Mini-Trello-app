import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { generateToken } from '../middlewares/auth';
import { sendVerificationCode } from '../services/email';

// Tạo ngẫu nhiên 1 đoạn mã 6 chữ số 
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export class AuthController {

  static async sendCode(req: Request, res: Response) {
    try {
      const { email, type = 'signin' } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc' });
      }

      if (!['signin', 'signup'].includes(type)) {
        return res.status(400).json({ error: 'Type phải là signin hoặc signup' });
      }

      // Check if user exists
      const existingUser = await FirebaseService.getUserByEmail(email);
      
      // Auto-detect type based on user existence if not explicitly provided
      let finalType = type;
      if (type === 'signin' && !existingUser) {
        // User does not exist but trying to signin, suggest signup
        return res.status(404).json({ 
          error: 'Người dùng không tồn tại. Vui lòng đăng ký trước.',
          suggestSignup: true 
        });
      }
      
      if (type === 'signup' && existingUser) {
        // User exists but trying to signup, suggest signin
        return res.status(409).json({ 
          error: 'User already exists. Please sign in instead.',
          suggestSignin: true 
        });
      }
      // Tạo mã xác minh
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      // Lưu mã xác minh
      await FirebaseService.createVerificationCode({
        email,
        code,
        type: type as 'signup' | 'signin',
        expiresAt,
        used: false
      });

      // Send email
      await sendVerificationCode(email, code, type as 'signup' | 'signin');

      res.status(200).json({ 
        message: 'Mã xác minh đã được gửi đến email của bạn',
        expiresAt 
      });
    } catch (error) {
      console.error('Send code error:', error);
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  }

  // Sign up with verification code
  static async signup(req: Request, res: Response) {
    try {
      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ error: 'Email và mã xác minh là bắt buộc' });
      }

      // Verify code
      const validCode = await FirebaseService.getValidVerificationCode(email, verificationCode, 'signup');
      if (!validCode) {
        return res.status(400).json({ error: 'Mã xác minh không hợp lệ hoặc đã hết hạn' });
      }

      // Check if user already exists
      const existingUser = await FirebaseService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Người dùng đã tồn tại' });
      }

      // Create user
      const user = await FirebaseService.createUser({ email });

      // Mark verification code as used
      await FirebaseService.markVerificationCodeAsUsed(validCode.id);

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        token: token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Đăng nhập bằng mã xác minh
  static async signin(req: Request, res: Response) {
    try {
      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ error: 'Email and verification code are required' });
      }

      // Verify code
      const validCode = await FirebaseService.getValidVerificationCode(email, verificationCode, 'signin');
      if (!validCode) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      // Get user
      const user = await FirebaseService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Mark verification code as used
      await FirebaseService.markVerificationCodeAsUsed(validCode.id);

      // Generate token
      const token = generateToken(user);

      res.status(200).json({
        token: token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  }

  // GitHub OAuth (trình giữ chỗ - yêu cầu thiết lập GitHub OAuth)
  static async githubAuth(req: Request, res: Response) {
    // Điều này sẽ chuyển hướng đến GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
    res.redirect(githubAuthUrl);
  }

  // GitHub OAuth callback (trình giữ chỗ)
  static async githubCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Mã xác thực là bắt buộc' });
      }

    // Mã trao đổi để lấy mã thông báo truy cập (triển khai luồng GitHub OAuth)
// Đây là phiên bản đơn giản hóa - bạn cần triển khai luồng OAuth đầy đủ
      
      res.status(200).json({ message: 'GitHub OAuth callback - implement OAuth flow here' });
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.status(500).json({ error: 'Xác thực GitHub thất bại' });
    }
  }
}