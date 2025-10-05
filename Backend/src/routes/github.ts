import { Router } from 'express';
import { GitHubController } from '../controllers/githubController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All GitHub routes require authentication (except OAuth callbacks)
router.use(authenticateToken);

// GitHub repository information
router.get('/repositories/:repositoryId/github-info', GitHubController.getRepositoryInfo);

// GitHub attachments to tasks
router.post('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach', GitHubController.attachGitHubItem);
router.get('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments', GitHubController.getGitHubAttachments);
router.delete('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId', GitHubController.removeGitHubAttachment);

export default router;