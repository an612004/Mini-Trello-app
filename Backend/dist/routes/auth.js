"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const githubController_1 = require("../controllers/githubController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes (không cần authentication)
router.post('/send-code', authController_1.AuthController.sendCode);
router.post('/signup', authController_1.AuthController.signup);
router.post('/signin', authController_1.AuthController.signin);
// Test route để kiểm tra token
router.get('/me', auth_1.authenticateToken, (req, res) => {
    res.json({
        message: "✅ Token valid!",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// GitHub OAuth
router.get('/github', githubController_1.GitHubController.initiateGitHubAuth);
router.get('/github/callback', githubController_1.GitHubController.handleGitHubCallback);
exports.default = router;
//# sourceMappingURL=auth.js.map