import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class CardController {
    static getCards(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createCard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCardById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCardsByUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateCard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteCard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static acceptCardInvitation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=cardController.d.ts.map