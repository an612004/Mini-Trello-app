import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class TaskController {
    static getTasks(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createTask(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getTaskById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateTask(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteTask(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static assignMember(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAssignedMembers(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeMemberAssignment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=taskController.d.ts.map