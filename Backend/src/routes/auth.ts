import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { GitHubController } from '../controllers/githubController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Public routes (không cần authentication)
router.post('/send-code', AuthController.sendCode);
router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);

// Test route để kiểm tra token
router.get('/me', authenticateToken, (req: any, res) => {
  res.json({
    message: "✅ Token valid!",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// GitHub OAuth
router.get('/github', GitHubController.initiateGitHubAuth);
router.get('/github/callback', GitHubController.handleGitHubCallback);

export default router;