import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class BoardController {
    static createBoard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getBoards(req: AuthRequest, res: Response): Promise<void>;
    static getBoardById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateBoard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteBoard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static inviteToBoard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static acceptBoardInvitation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeMember(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=boardController.d.ts.map