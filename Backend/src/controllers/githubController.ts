import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { GitHubService } from '../services/github';
import { AuthRequest } from '../middlewares/auth';
import { generateToken } from '../middlewares/auth';

export class GitHubController {
  // Get GitHub repository information
  static async getRepositoryInfo(req: AuthRequest, res: Response) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user!.id;

      // For this example, we'll parse repositoryId as "owner/repo"
      // In a real app, you'd store repository info in your database
      const [owner, repo] = repositoryId.split('/');

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Invalid repository ID format. Use "owner/repo"' });
      }

      // Get user's GitHub access token (you'd store this when user connects GitHub)
      // For now, we'll use public API calls
      const repoInfo = await GitHubService.getRepositoryInfo(owner, repo);

      res.status(200).json({
        repositoryId: repositoryId,
        ...repoInfo
      });
    } catch (error) {
      console.error('Get repository info error:', error);
      res.status(500).json({ error: 'Failed to fetch repository information' });
    }
  }

  // Attach GitHub item to task
  static async attachGitHubItem(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const { type, number, sha, repositoryId } = req.body;
      const userId = req.user!.id;

      if (!type || !['pull_request', 'commit', 'issue'].includes(type)) {
        return res.status(400).json({ error: 'Valid type (pull_request, commit, issue) is required' });
      }

      // Check access to board/card/task
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);
      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      let githubId: string;
      let title: string;
      let url: string;

      // Parse repository info
      const [owner, repo] = (repositoryId || 'unknown/unknown').split('/');

      try {
        if (type === 'pull_request' && number) {
          const prInfo = await GitHubService.getPullRequest(owner, repo, number);
          githubId = prInfo.id.toString();
          title = prInfo.title;
          url = prInfo.html_url;
        } else if (type === 'issue' && number) {
          const issueInfo = await GitHubService.getIssue(owner, repo, number);
          githubId = issueInfo.id.toString();
          title = issueInfo.title;
          url = issueInfo.html_url;
        } else if (type === 'commit' && sha) {
          const commitInfo = await GitHubService.getCommit(owner, repo, sha);
          githubId = commitInfo.sha;
          title = commitInfo.commit.message;
          url = commitInfo.html_url;
        } else {
          return res.status(400).json({ error: 'Invalid parameters for the specified type' });
        }
      } catch (githubError) {
        // If GitHub API fails, still create attachment with provided info
        githubId = (number || sha || 'unknown').toString();
        title = `${type} ${number || sha || 'unknown'}`;
        url = `https://github.com/${owner}/${repo}/${type === 'commit' ? 'commit' : type === 'pull_request' ? 'pull' : 'issues'}/${number || sha}`;
      }

      const attachment = await FirebaseService.createGitHubAttachment({
        taskId,
        type: type as 'pull_request' | 'commit' | 'issue',
        githubId,
        number: type !== 'commit' ? number : undefined,
        sha: type === 'commit' ? sha : undefined,
        title,
        url
      });

      res.status(201).json({
        taskId: taskId,
        attachmentId: attachment.id,
        type: attachment.type,
        number: attachment.number,
        sha: attachment.sha
      });
    } catch (error) {
      console.error('Attach GitHub item error:', error);
      res.status(500).json({ error: 'Failed to attach GitHub item' });
    }
  }

  // Get GitHub attachments for a task
  static async getGitHubAttachments(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const userId = req.user!.id;

      // Check access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);
      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const attachments = await FirebaseService.getGitHubAttachmentsByTaskId(taskId);

      res.status(200).json(attachments.map(attachment => ({
        attachmentId: attachment.id,
        type: attachment.type,
        number: attachment.number,
        sha: attachment.sha,
        title: attachment.title,
        url: attachment.url
      })));
    } catch (error) {
      console.error('Get GitHub attachments error:', error);
      res.status(500).json({ error: 'Failed to retrieve GitHub attachments' });
    }
  }

  // Remove GitHub attachment
  static async removeGitHubAttachment(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId, attachmentId } = req.params;
      const userId = req.user!.id;

      // Check access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);
      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await FirebaseService.deleteGitHubAttachment(attachmentId);

      res.status(204).send();
    } catch (error) {
      console.error('Remove GitHub attachment error:', error);
      res.status(500).json({ error: 'Failed to remove GitHub attachment' });
    }
  }

  // GitHub OAuth initiation
  static async initiateGitHubAuth(req: Request, res: Response) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email,repo&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
    res.redirect(githubAuthUrl);
  }

  // GitHub OAuth callback
  static async handleGitHubCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      // Exchange code for access token
      const accessToken = await GitHubService.exchangeCodeForToken(code as string);

      // Get user info from GitHub
      const githubUserInfo = await GitHubService.getUserInfo(accessToken);

      // Check if user exists with this GitHub ID
      let user = await FirebaseService.getUserByGithubId(githubUserInfo.githubId);

      if (!user) {
        // Check if user exists with this email
        if (githubUserInfo.email) {
          user = await FirebaseService.getUserByEmail(githubUserInfo.email);
          if (user) {
            // Update existing user with GitHub info
            await FirebaseService.updateUser(user.id, {
              githubId: githubUserInfo.githubId,
              githubUsername: githubUserInfo.githubUsername
            });
            user = await FirebaseService.getUserById(user.id);
          }
        }

        if (!user) {
          // Create new user
          user = await FirebaseService.createUser({
            email: githubUserInfo.email || `${githubUserInfo.githubUsername}@github.local`,
            githubId: githubUserInfo.githubId,
            githubUsername: githubUserInfo.githubUsername
          });
        }
      }

      // Generate JWT token
      const token = generateToken(user!);

      // Redirect to frontend with token in URL params
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/auth/github/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user!.id,
        email: user!.email,
        githubUsername: user!.githubUsername
      }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.status(500).json({ error: 'GitHub authentication failed' });
    }
  }
}