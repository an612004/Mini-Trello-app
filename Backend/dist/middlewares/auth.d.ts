import { Request, Response, NextFunction } from 'express';
import { User } from '../models/types';
interface AuthRequest extends Request {
    user?: User;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const generateToken: (user: User) => string;
export { AuthRequest };
//# sourceMappingURL=auth.d.ts.map