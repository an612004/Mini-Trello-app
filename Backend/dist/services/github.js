"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const axios_1 = __importDefault(require("axios"));
class GitHubService {
    static async makeGitHubRequest(url, accessToken) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Trello-Clone-App'
        };
        if (accessToken) {
            headers.Authorization = `token ${accessToken}`;
        }
        const response = await axios_1.default.get(url, { headers });
        return response.data;
    }
    // Get repository information
    static async getRepositoryInfo(owner, repo, accessToken) {
        try {
            const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
            // Get branches
            const branches = await this.makeGitHubRequest(`${baseUrl}/branches`, accessToken);
            // Get pull requests
            const pulls = await this.makeGitHubRequest(`${baseUrl}/pulls?state=open`, accessToken);
            // Get issues
            const issues = await this.makeGitHubRequest(`${baseUrl}/issues?state=open`, accessToken);
            // Get recent commits
            const commits = await this.makeGitHubRequest(`${baseUrl}/commits?per_page=10`, accessToken);
            return {
                branches: branches.map((branch) => ({
                    name: branch.name,
                    lastCommitSha: branch.commit.sha
                })),
                pulls: pulls.map((pull) => ({
                    title: pull.title,
                    pullNumber: pull.number,
                    url: pull.html_url
                })),
                issues: issues.filter((issue) => !issue.pull_request).map((issue) => ({
                    title: issue.title,
                    issueNumber: issue.number,
                    url: issue.html_url
                })),
                commits: commits.map((commit) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    url: commit.html_url
                }))
            };
        }
        catch (error) {
            console.error('GitHub API error:', error);
            throw new Error('Failed to fetch GitHub repository information');
        }
    }
    // Exchange OAuth code for access token
    static async exchangeCodeForToken(code) {
        try {
            const response = await axios_1.default.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            }, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.data.access_token;
        }
        catch (error) {
            console.error('GitHub OAuth error:', error);
            throw new Error('Failed to exchange code for access token');
        }
    }
    // Get user info from GitHub
    static async getUserInfo(accessToken) {
        try {
            const response = await this.makeGitHubRequest('https://api.github.com/user', accessToken);
            return {
                githubId: response.id.toString(),
                githubUsername: response.login,
                email: response.email,
                name: response.name
            };
        }
        catch (error) {
            console.error('GitHub user info error:', error);
            throw new Error('Failed to get user information from GitHub');
        }
    }
    // Get specific pull request
    static async getPullRequest(owner, repo, number, accessToken) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
            return await this.makeGitHubRequest(url, accessToken);
        }
        catch (error) {
            console.error('GitHub PR error:', error);
            throw new Error('Failed to fetch pull request information');
        }
    }
    // Get specific issue
    static async getIssue(owner, repo, number, accessToken) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;
            return await this.makeGitHubRequest(url, accessToken);
        }
        catch (error) {
            console.error('GitHub issue error:', error);
            throw new Error('Failed to fetch issue information');
        }
    }
    // Get specific commit
    static async getCommit(owner, repo, sha, accessToken) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
            return await this.makeGitHubRequest(url, accessToken);
        }
        catch (error) {
            console.error('GitHub commit error:', error);
            throw new Error('Failed to fetch commit information');
        }
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.js.map