# Trello Clone Backend API

## 🚀 Overview
Complete Express.js backend with TypeScript, Firebase Firestore, and GitHub integration for a Trello-like application.

## 📋 Features Implemented

### ✅ Authentication System
- **Email-based authentication** with verification codes
- **GitHub OAuth integration**
- **JWT token authentication**
- **Secure password-less login**

### ✅ Core Functionality
- **Board Management**: CRUD operations for boards
- **Card Management**: CRUD operations for cards within boards
- **Task Management**: CRUD operations for tasks within cards
- **Member Management**: Invite and manage team members
- **GitHub Integration**: Attach GitHub PRs, issues, commits to tasks

### ✅ API Endpoints

#### Authentication
- `POST /auth/send-code` - Send verification code
- `POST /auth/signup` - Sign up with verification code
- `POST /auth/signin` - Sign in with verification code
- `GET /auth/github` - GitHub OAuth initiation
- `GET /auth/github/callback` - GitHub OAuth callback

#### Boards
- `GET /boards` - Get all user boards
- `POST /boards` - Create new board
- `GET /boards/:id` - Get board details
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board
- `POST /boards/:boardId/invite` - Invite to board

#### Cards
- `GET /boards/:boardId/cards` - Get all cards in board
- `POST /boards/:boardId/cards` - Create new card
- `GET /boards/:boardId/cards/:id` - Get card details
- `PUT /boards/:boardId/cards/:id` - Update card
- `DELETE /boards/:boardId/cards/:id` - Delete card
- `GET /boards/:boardId/cards/user/:userId` - Get user's cards
- `POST /boards/:boardId/cards/:id/invite/accept` - Accept card invitation

#### Tasks
- `GET /boards/:boardId/cards/:cardId/tasks` - Get all tasks in card
- `POST /boards/:boardId/cards/:cardId/tasks` - Create new task
- `GET /boards/:boardId/cards/:cardId/tasks/:taskId` - Get task details
- `PUT /boards/:boardId/cards/:cardId/tasks/:taskId` - Update task
- `DELETE /boards/:boardId/cards/:cardId/tasks/:taskId` - Delete task
- `POST /boards/:boardId/cards/:cardId/tasks/:taskId/assign` - Assign member
- `GET /boards/:boardId/cards/:cardId/tasks/:taskId/assign` - Get assigned members
- `DELETE /boards/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId` - Remove assignment

#### GitHub Integration
- `GET /repositories/:repositoryId/github-info` - Get GitHub repo info
- `POST /boards/:boardId/cards/:cardId/tasks/:taskId/github-attach` - Attach GitHub item
- `GET /boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments` - Get attachments
- `DELETE /boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId` - Remove attachment

## 🔧 Technology Stack

- **Framework**: Express.js with TypeScript
- **Database**: Firebase Firestore
- **Authentication**: JWT + GitHub OAuth
- **Email Service**: NodeMailer
- **API Integration**: GitHub REST API
- **Validation**: Custom middleware
- **CORS**: Configured for frontend integration

## 📁 Project Structure

```
src/
├── config/
│   └── firebaseConfig.ts          # Firebase configuration
├── controllers/
│   ├── authController.ts          # Authentication logic
│   ├── boardController.ts         # Board operations
│   ├── cardController.ts          # Card operations
│   ├── taskController.ts          # Task operations
│   └── githubController.ts        # GitHub integration
├── middlewares/
│   └── auth.ts                    # JWT authentication middleware
├── models/
│   └── types.ts                   # TypeScript interfaces
├── routes/
│   ├── auth.ts                    # Authentication routes
│   ├── boards.ts                  # Board routes
│   ├── cards.ts                   # Card routes
│   ├── tasks.ts                   # Task routes
│   └── github.ts                  # GitHub routes
├── services/
│   ├── firebase.ts                # Firebase operations
│   ├── email.ts                   # Email service
│   └── github.ts                  # GitHub API service
└── index.ts                       # Main server file
```

## 🚀 Running the Server

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (.env):**
   ```
   JWT_SECRET=your-secret-key
   USER_EMAIL=your-gmail@gmail.com
   PASS_EMAIL=your-app-password
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
   PORT=3000
   NODE_ENV=development
   ```

3. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

## 🔐 Security Features

- **JWT token authentication**
- **Input validation**
- **CORS configuration**
- **Secure session management**
- **Environment variable protection**

## 📊 Database Schema

### Users
- id, email, githubId, githubUsername, createdAt, updatedAt

### Boards
- id, name, description, ownerId, members[], createdAt, updatedAt

### Cards
- id, boardId, name, description, ownerId, members[], tasksCount, createdAt, updatedAt

### Tasks
- id, cardId, boardId, ownerId, title, description, status, assignedMembers[], createdAt, updatedAt

### Invitations
- id, boardId, cardId, inviterUserId, invitedUserId, invitedEmail, status, type, createdAt, updatedAt

### GitHub Attachments
- id, taskId, type, githubId, number, sha, title, url, createdAt

## 🎯 Ready for Production

This backend is fully functional and ready to be connected with a React frontend. All the required endpoints from the specification have been implemented with proper error handling, authentication, and data validation.

**Next steps:**
1. Set up Firebase Firestore project
2. Configure GitHub OAuth app
3. Set up email service (Gmail + App Password)
4. Deploy to your preferred hosting platform
5. Connect with React frontend

**Happy coding! 🚀**