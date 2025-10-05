import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from "firebase/app";

// Initialize Firebase app
const firebaseConfig = {
  apiKey: process.env.apiKey!,
  authDomain: "minitrelooapp.firebaseapp.com",
  projectId: "minitrelooapp",
  storageBucket: "minitrelooapp.firebasestorage.app",
  messagingSenderId: process.env.messagingSenderId!,
  appId: process.env.appId!,
  measurementId: process.env.measurementId!,
};

const app = initializeApp(firebaseConfig);
import { 
  User, 
  VerificationCode, 
  Board, 
  Card, 
  Task, 
  Invitation,
  GitHubAttachment 
} from '../models/types';

const db = getFirestore(app);

// Utility function to convert Firestore data
const convertFirestoreData = (doc: any) => {
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

export class FirebaseService {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, 'users', id), {
      ...user,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return user;
  }

  static async getUserById(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', id));
    return userDoc.exists() ? convertFirestoreData(userDoc) : null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : convertFirestoreData(querySnapshot.docs[0]);
  }

  static async getUserByGithubId(githubId: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('githubId', '==', githubId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : convertFirestoreData(querySnapshot.docs[0]);
  }

  static async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'users', id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Verification Code operations
  static async createVerificationCode(codeData: Omit<VerificationCode, 'id' | 'createdAt'>): Promise<VerificationCode> {
    const id = uuidv4();
    const now = new Date();
    const verificationCode: VerificationCode = {
      id,
      ...codeData,
      createdAt: now
    };
    
    await setDoc(doc(db, 'verificationCodes', id), {
      ...verificationCode,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(codeData.expiresAt)
    });
    
    return verificationCode;
  }

  static async getValidVerificationCode(email: string, code: string, type: 'signup' | 'signin'): Promise<VerificationCode | null> {
    const q = query(
      collection(db, 'verificationCodes'), 
      where('email', '==', email),
      where('code', '==', code),
      where('type', '==', type),
      where('used', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const verificationCode = convertFirestoreData(querySnapshot.docs[0]);
    
    // Check if code is still valid (not expired)
    if (verificationCode.expiresAt < new Date()) {
      return null;
    }
    
    return verificationCode;
  }

  static async markVerificationCodeAsUsed(id: string): Promise<void> {
    await updateDoc(doc(db, 'verificationCodes', id), { used: true });
  }

  // Board operations
  static async createBoard(boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board> {
    const id = uuidv4();
    const now = new Date();
    const board: Board = {
      id,
      ...boardData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, 'boards', id), {
      ...board,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return board;
  }

  static async getBoardById(id: string): Promise<Board | null> {
    const boardDoc = await getDoc(doc(db, 'boards', id));
    return boardDoc.exists() ? convertFirestoreData(boardDoc) : null;
  }

  static async getBoardsByUserId(userId: string): Promise<Board[]> {
    const q = query(
      collection(db, 'boards'), 
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const boards = querySnapshot.docs.map(convertFirestoreData);
    // Sort in memory instead of Firestore
    return boards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async updateBoard(id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'boards', id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  static async deleteBoard(id: string): Promise<void> {
    await deleteDoc(doc(db, 'boards', id));
  }

  // Card operations
  static async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const id = uuidv4();
    const now = new Date();
    const card: Card = {
      id,
      ...cardData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, 'cards', id), {
      ...card,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return card;
  }

  static async getCardsByBoardId(boardId: string): Promise<Card[]> {
    const q = query(
      collection(db, 'cards'), 
      where('boardId', '==', boardId)
    );
    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map(convertFirestoreData);
    // Sort in memory instead of Firestore
    return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getCardById(id: string): Promise<Card | null> {
    const cardDoc = await getDoc(doc(db, 'cards', id));
    return cardDoc.exists() ? convertFirestoreData(cardDoc) : null;
  }

  static async getCardsByUserId(boardId: string, userId: string): Promise<Card[]> {
    const q = query(
      collection(db, 'cards'), 
      where('boardId', '==', boardId),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map(convertFirestoreData);
    // Sort in memory instead of Firestore
    return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'cards', id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  static async deleteCard(id: string): Promise<void> {
    await deleteDoc(doc(db, 'cards', id));
  }

  // Task operations
  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = uuidv4();
    const now = new Date();
    const task: Task = {
      id,
      ...taskData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, 'tasks', id), {
      ...task,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return task;
  }

  static async getTasksByCardId(cardId: string): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'), 
      where('cardId', '==', cardId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreData);
  }

  static async getTaskById(id: string): Promise<Task | null> {
    const taskDoc = await getDoc(doc(db, 'tasks', id));
    return taskDoc.exists() ? convertFirestoreData(taskDoc) : null;
  }

  static async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'tasks', id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  static async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', id));
  }

  // Invitation operations
  static async createInvitation(invitationData: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invitation> {
    const id = uuidv4();
    const now = new Date();
    const invitation: Invitation = {
      id,
      ...invitationData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, 'invitations', id), {
      ...invitation,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return invitation;
  }

  static async getInvitationById(id: string): Promise<Invitation | null> {
    const invitationDoc = await getDoc(doc(db, 'invitations', id));
    return invitationDoc.exists() ? convertFirestoreData(invitationDoc) : null;
  }

  static async updateInvitation(id: string, updates: Partial<Omit<Invitation, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'invitations', id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // GitHub Attachment operations
  static async createGitHubAttachment(attachmentData: Omit<GitHubAttachment, 'id' | 'createdAt'>): Promise<GitHubAttachment> {
    const id = uuidv4();
    const now = new Date();
    const attachment: GitHubAttachment = {
      id,
      ...attachmentData,
      createdAt: now
    };
    
    await setDoc(doc(db, 'githubAttachments', id), {
      ...attachment,
      createdAt: Timestamp.fromDate(now)
    });
    
    return attachment;
  }

  static async getGitHubAttachmentsByTaskId(taskId: string): Promise<GitHubAttachment[]> {
    const q = query(
      collection(db, 'githubAttachments'), 
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreData);
  }

  static async deleteGitHubAttachment(id: string): Promise<void> {
    await deleteDoc(doc(db, 'githubAttachments', id));
  }
}