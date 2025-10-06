export interface User {
  id: string;
  email: string;
  githubId?: string;
  githubUsername?: string;
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian cập nhật
}
// Thời gian cập nhật
export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  type: 'signup' | 'signin';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
export interface Board {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  boardId: string;
  name: string;
  title?: string;
  description: string;
  ownerId: string;
  members: string[];
  tasksCount: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignees?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  status?: string;
  commentsCount?: number;
  attachmentsCount?: number;
  completedTasks?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  cardId: string;
  boardId: string;
  ownerId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignedMembers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  boardId: string;
  cardId?: string;
  inviterUserId: string;
  invitedUserId?: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'board' | 'card';
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubAttachment {
  id: string;
  taskId: string;
  type: 'pull_request' | 'commit' | 'issue';
  githubId: string;
  number?: number;
  sha?: string;
  title?: string;
  url: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userAvatar?: string | null;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GitHubRepository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  owner: string;
  url: string;
  userId: string;
}