import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { generateToken } from '../middlewares/auth';
import { sendVerificationCode } from '../services/email';

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export class AuthController {

  static async sendCode(req: Request, res: Response) {
    try {
      const { email, type = 'signin' } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!['signin', 'signup'].includes(type)) {
        return res.status(400).json({ error: 'Type must be signin or signup' });
      }

      // Check if user exists
      const existingUser = await FirebaseService.getUserByEmail(email);
      
      // Auto-detect type based on user existence if not explicitly provided
      let finalType = type;
      if (type === 'signin' && !existingUser) {
        // User doesn't exist but trying to signin, suggest signup
        return res.status(404).json({ 
          error: 'User not found. Please sign up first.',
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

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
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
        message: 'Verification code sent to your email',
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
        return res.status(400).json({ error: 'Email and verification code are required' });
      }

      // Verify code
      const validCode = await FirebaseService.getValidVerificationCode(email, verificationCode, 'signup');
      if (!validCode) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      // Check if user already exists
      const existingUser = await FirebaseService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
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

  // Sign in with verification code
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

  // GitHub OAuth (placeholder - requires GitHub OAuth setup)
  static async githubAuth(req: Request, res: Response) {
    // This would redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
    res.redirect(githubAuthUrl);
  }

  // GitHub OAuth callback (placeholder)
  static async githubCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      // Exchange code for access token (implement GitHub OAuth flow)
      // This is a simplified version - you'd need to implement the full OAuth flow
      
      res.status(200).json({ message: 'GitHub OAuth callback - implement OAuth flow here' });
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.status(500).json({ error: 'GitHub authentication failed' });
    }
  }
}