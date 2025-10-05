export declare function sendVerificationCode(to: string, code: string, type?: 'signup' | 'signin'): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare function sendInvitationEmail(to: string, inviterEmail: string, boardName: string, inviteLink: string): Promise<void>;
//# sourceMappingURL=email.d.ts.map