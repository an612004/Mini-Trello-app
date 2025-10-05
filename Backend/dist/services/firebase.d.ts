import { User, VerificationCode, Board, Card, Task, Invitation, GitHubAttachment } from '../models/types';
export declare class FirebaseService {
    static createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    static getUserById(id: string): Promise<User | null>;
    static getUserByEmail(email: string): Promise<User | null>;
    static getUserByGithubId(githubId: string): Promise<User | null>;
    static updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void>;
    static createVerificationCode(codeData: Omit<VerificationCode, 'id' | 'createdAt'>): Promise<VerificationCode>;
    static getValidVerificationCode(email: string, code: string, type: 'signup' | 'signin'): Promise<VerificationCode | null>;
    static markVerificationCodeAsUsed(id: string): Promise<void>;
    static createBoard(boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board>;
    static getBoardById(id: string): Promise<Board | null>;
    static getBoardsByUserId(userId: string): Promise<Board[]>;
    static updateBoard(id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>): Promise<void>;
    static deleteBoard(id: string): Promise<void>;
    static createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
    static getCardsByBoardId(boardId: string): Promise<Card[]>;
    static getCardById(id: string): Promise<Card | null>;
    static getCardsByUserId(boardId: string, userId: string): Promise<Card[]>;
    static updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>): Promise<void>;
    static deleteCard(id: string): Promise<void>;
    static createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    static getTasksByCardId(cardId: string): Promise<Task[]>;
    static getTaskById(id: string): Promise<Task | null>;
    static updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void>;
    static deleteTask(id: string): Promise<void>;
    static createInvitation(invitationData: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invitation>;
    static getInvitationById(id: string): Promise<Invitation | null>;
    static updateInvitation(id: string, updates: Partial<Omit<Invitation, 'id' | 'createdAt'>>): Promise<void>;
    static createGitHubAttachment(attachmentData: Omit<GitHubAttachment, 'id' | 'createdAt'>): Promise<GitHubAttachment>;
    static getGitHubAttachmentsByTaskId(taskId: string): Promise<GitHubAttachment[]>;
    static deleteGitHubAttachment(id: string): Promise<void>;
}
//# sourceMappingURL=firebase.d.ts.map