export declare class GitHubService {
    private static makeGitHubRequest;
    static getRepositoryInfo(owner: string, repo: string, accessToken?: string): Promise<{
        branches: any;
        pulls: any;
        issues: any;
        commits: any;
    }>;
    static exchangeCodeForToken(code: string): Promise<string>;
    static getUserInfo(accessToken: string): Promise<{
        githubId: any;
        githubUsername: any;
        email: any;
        name: any;
    }>;
    static getPullRequest(owner: string, repo: string, number: number, accessToken?: string): Promise<any>;
    static getIssue(owner: string, repo: string, number: number, accessToken?: string): Promise<any>;
    static getCommit(owner: string, repo: string, sha: string, accessToken?: string): Promise<any>;
}
//# sourceMappingURL=github.d.ts.map