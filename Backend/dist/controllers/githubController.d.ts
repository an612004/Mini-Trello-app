import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class GitHubController {
    static getRepositoryInfo(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static attachGitHubItem(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getGitHubAttachments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeGitHubAttachment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static initiateGitHubAuth(req: Request, res: Response): Promise<void>;
    static handleGitHubCallback(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=githubController.d.ts.map