"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const firestore_1 = require("firebase/firestore");
const uuid_1 = require("uuid");
const app_1 = require("firebase/app");
// Initialize Firebase app
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: "minitrelooapp.firebaseapp.com",
    projectId: "minitrelooapp",
    storageBucket: "minitrelooapp.firebasestorage.app",
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
// Utility function to convert Firestore data
const convertFirestoreData = (doc) => {
    const data = doc.data();
    if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && data.updatedAt.toDate) {
        data.updatedAt = data.updatedAt.toDate();
    }
    if (data.expiresAt && data.expiresAt.toDate) {
        data.expiresAt = data.expiresAt.toDate();
    }
    return { id: doc.id, ...data };
};
class FirebaseService {
    // User operations
    static async createUser(userData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const user = {
            id,
            ...userData,
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'users', id), {
            ...user,
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now)
        });
        return user;
    }
    static async getUserById(id) {
        const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'users', id));
        return userDoc.exists() ? convertFirestoreData(userDoc) : null;
    }
    static async getUserByEmail(email) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'users'), (0, firestore_1.where)('email', '==', email));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        return querySnapshot.empty ? null : convertFirestoreData(querySnapshot.docs[0]);
    }
    static async getUserByGithubId(githubId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'users'), (0, firestore_1.where)('githubId', '==', githubId));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        return querySnapshot.empty ? null : convertFirestoreData(querySnapshot.docs[0]);
    }
    static async updateUser(id, updates) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'users', id), {
            ...updates,
            updatedAt: firestore_1.Timestamp.fromDate(new Date())
        });
    }
    // Verification Code operations
    static async createVerificationCode(codeData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const verificationCode = {
            id,
            ...codeData,
            createdAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'verificationCodes', id), {
            ...verificationCode,
            createdAt: firestore_1.Timestamp.fromDate(now),
            expiresAt: firestore_1.Timestamp.fromDate(codeData.expiresAt)
        });
        return verificationCode;
    }
    static async getValidVerificationCode(email, code, type) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'verificationCodes'), (0, firestore_1.where)('email', '==', email), (0, firestore_1.where)('code', '==', code), (0, firestore_1.where)('type', '==', type), (0, firestore_1.where)('used', '==', false));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        if (querySnapshot.empty)
            return null;
        const verificationCode = convertFirestoreData(querySnapshot.docs[0]);
        // Check if code is still valid (not expired)
        if (verificationCode.expiresAt < new Date()) {
            return null;
        }
        return verificationCode;
    }
    static async markVerificationCodeAsUsed(id) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'verificationCodes', id), { used: true });
    }
    // Board operations
    static async createBoard(boardData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const board = {
            id,
            ...boardData,
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'boards', id), {
            ...board,
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now)
        });
        return board;
    }
    static async getBoardById(id) {
        const boardDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'boards', id));
        return boardDoc.exists() ? convertFirestoreData(boardDoc) : null;
    }
    static async getBoardsByUserId(userId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'boards'), (0, firestore_1.where)('members', 'array-contains', userId));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const boards = querySnapshot.docs.map(convertFirestoreData);
        // Sort in memory instead of Firestore
        return boards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    static async updateBoard(id, updates) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'boards', id), {
            ...updates,
            updatedAt: firestore_1.Timestamp.fromDate(new Date())
        });
    }
    static async deleteBoard(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'boards', id));
    }
    // Card operations
    static async createCard(cardData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const card = {
            id,
            ...cardData,
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'cards', id), {
            ...card,
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now)
        });
        return card;
    }
    static async getCardsByBoardId(boardId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'cards'), (0, firestore_1.where)('boardId', '==', boardId));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const cards = querySnapshot.docs.map(convertFirestoreData);
        // Sort in memory instead of Firestore
        return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    static async getCardById(id) {
        const cardDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'cards', id));
        return cardDoc.exists() ? convertFirestoreData(cardDoc) : null;
    }
    static async getCardsByUserId(boardId, userId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'cards'), (0, firestore_1.where)('boardId', '==', boardId), (0, firestore_1.where)('members', 'array-contains', userId));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const cards = querySnapshot.docs.map(convertFirestoreData);
        // Sort in memory instead of Firestore
        return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    static async updateCard(id, updates) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'cards', id), {
            ...updates,
            updatedAt: firestore_1.Timestamp.fromDate(new Date())
        });
    }
    static async deleteCard(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'cards', id));
    }
    // Task operations
    static async createTask(taskData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const task = {
            id,
            ...taskData,
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'tasks', id), {
            ...task,
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now)
        });
        return task;
    }
    static async getTasksByCardId(cardId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'tasks'), (0, firestore_1.where)('cardId', '==', cardId), (0, firestore_1.orderBy)('createdAt', 'desc'));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        return querySnapshot.docs.map(convertFirestoreData);
    }
    static async getTaskById(id) {
        const taskDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'tasks', id));
        return taskDoc.exists() ? convertFirestoreData(taskDoc) : null;
    }
    static async updateTask(id, updates) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'tasks', id), {
            ...updates,
            updatedAt: firestore_1.Timestamp.fromDate(new Date())
        });
    }
    static async deleteTask(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'tasks', id));
    }
    // Invitation operations
    static async createInvitation(invitationData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const invitation = {
            id,
            ...invitationData,
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'invitations', id), {
            ...invitation,
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now)
        });
        return invitation;
    }
    static async getInvitationById(id) {
        const invitationDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'invitations', id));
        return invitationDoc.exists() ? convertFirestoreData(invitationDoc) : null;
    }
    static async updateInvitation(id, updates) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'invitations', id), {
            ...updates,
            updatedAt: firestore_1.Timestamp.fromDate(new Date())
        });
    }
    // GitHub Attachment operations
    static async createGitHubAttachment(attachmentData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const attachment = {
            id,
            ...attachmentData,
            createdAt: now
        };
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(db, 'githubAttachments', id), {
            ...attachment,
            createdAt: firestore_1.Timestamp.fromDate(now)
        });
        return attachment;
    }
    static async getGitHubAttachmentsByTaskId(taskId) {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'githubAttachments'), (0, firestore_1.where)('taskId', '==', taskId), (0, firestore_1.orderBy)('createdAt', 'desc'));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        return querySnapshot.docs.map(convertFirestoreData);
    }
    static async deleteGitHubAttachment(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'githubAttachments', id));
    }
}
exports.FirebaseService = FirebaseService;
//# sourceMappingURL=firebase.js.map