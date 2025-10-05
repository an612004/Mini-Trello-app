import { Request, Response } from 'express';
export declare class AuthController {
    static sendCode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static signin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static githubAuth(req: Request, res: Response): Promise<void>;
    static githubCallback(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=authController.d.ts.map