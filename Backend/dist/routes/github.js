"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const githubController_1 = require("../controllers/githubController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All GitHub routes require authentication (except OAuth callbacks)
router.use(auth_1.authenticateToken);
// GitHub repository information
router.get('/repositories/:repositoryId/github-info', githubController_1.GitHubController.getRepositoryInfo);
// GitHub attachments to tasks
router.post('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach', githubController_1.GitHubController.attachGitHubItem);
router.get('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments', githubController_1.GitHubController.getGitHubAttachments);
router.delete('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId', githubController_1.GitHubController.removeGitHubAttachment);
exports.default = router;
//# sourceMappingURL=github.js.map