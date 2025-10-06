# 📋 Mini-Trello-App - Kiến Trúc và Tài Liệu Hệ Thống

## 🏗️ Tổng Quan Kiến Trúc

Mini-Trello-App là một ứng dụng quản lý dự án theo mô hình Kanban, được xây dựng với:

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Firebase Firestore
- **Authentication:** JWT + Email Verification
- **Real-time:** Socket.io (chuẩn bị)

---

## 🎯 **BACKEND - Node.js + Express + TypeScript**

### 📁 Cấu Trúc Thư Mục Backend

```
Backend/
├── src/
│   ├── config/           # Cấu hình hệ thống
│   ├── controllers/      # Logic xử lý business
│   ├── middlewares/      # Middleware xử lý request
│   ├── models/          # Type definitions
│   ├── routes/          # API routes định nghĩa
│   ├── services/        # Data access layer
│   └── index.ts         # Entry point chính
├── dist/                # Compiled TypeScript
├── .env                 # Biến môi trường
├── package.json         # Dependencies và scripts
└── tsconfig.json        # TypeScript configuration
```

---

## 📄 Chi Tiết Từng File Backend

### 🔧 **Root Files**

#### `package.json`

**Chức năng:** Quản lý dependencies và scripts

- **Dependencies chính:**
  - `express`: Web framework
  - `firebase`: Database connection
  - `jsonwebtoken`: Authentication
  - `nodemailer`: Email service
  - `bcryptjs`: Password hashing
  - `cors`: Cross-origin requests

#### `tsconfig.json`

**Chức năng:** Cấu hình TypeScript compiler

- Target ES2020, strict type checking
- Output directory: `./dist`

#### `.env`

**Chức năng:** Biến môi trường bảo mật

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
apiKey=firebase-api-key
EMAIL_USER=hobinhan321@gmail.com
EMAIL_PASS=app-password
```

---

### 🚀 **Entry Point**

#### `src/index.ts`

**Chức năng:** Khởi tạo và cấu hình server

```typescript
- Cấu hình Express app
- CORS middleware
- Body parser
- Session management
- Routes registration
- Error handling
- Server startup
```

**Tính năng:**

- ✅ CORS để frontend kết nối
- ✅ JSON parsing
- ✅ Static files serving
- ✅ API documentation endpoint
- ✅ Health check endpoint

---

### 🔗 **Configuration**

#### `src/config/firebaseConfig.ts`

**Chức năng:** Kết nối Firebase Firestore

```typescript
- Firebase SDK initialization
- Firestore database connection
- Authentication configuration
- Export db instance for services
```

**Tính năng:**

- ✅ Firestore database connection
- ✅ Auto-reconnection on failure
- ✅ Environment-based configuration

---

### 🎮 **Controllers (Business Logic)**

#### `src/controllers/authController.ts`

**Chức năng:** Xử lý authentication và authorization

```typescript
class AuthController {
  // Đăng ký user mới
  static async register(req, res);

  // Đăng nhập và tạo JWT token
  static async login(req, res);

  // Gửi email xác thực
  static async sendVerificationEmail(req, res);

  // Xác thực email code
  static async verifyEmail(req, res);

  // Refresh JWT token
  static async refreshToken(req, res);
}
```

**Tính năng:**

- ✅ Password hashing với bcrypt
- ✅ JWT token generation/validation
- ✅ Email verification workflow
- ✅ Secure authentication flow

#### `src/controllers/boardController.ts`

**Chức năng:** Quản lý boards và members

```typescript
class BoardController {
  // CRUD Operations
  static async createBoard(req, res); // Tạo board mới
  static async getBoards(req, res); // Lấy danh sách boards
  static async getBoardById(req, res); // Lấy board theo ID
  static async updateBoard(req, res); // Cập nhật board
  static async deleteBoard(req, res); // Xóa board

  // Member Management
  static async inviteToBoard(req, res); // Mời thành viên
  static async acceptBoardInvitation(req, res); // Chấp nhận lời mời
  static async removeMember(req, res); // Xóa thành viên
}
```

**Tính năng:**

- ✅ Board CRUD với permission checking
- ✅ Member invitation via email
- ✅ Role-based access control (Owner/Member)
- ✅ Member removal with validation

#### `src/controllers/cardController.ts`

**Chức năng:** Quản lý cards và tasks

```typescript
class CardController {
  // Card CRUD
  static async createCard(req, res); // Tạo card mới
  static async getCards(req, res); // Lấy cards theo board
  static async updateCard(req, res); // Cập nhật card
  static async deleteCard(req, res); // Xóa card

  // Card Members
  static async addMemberToCard(req, res); // Thêm member vào card
  static async removeMemberFromCard(req, res); // Xóa member khỏi card

  // Comments System
  static async createComment(req, res); // Tạo comment
  static async getComments(req, res); // Lấy comments
}
```

**Tính năng:**

- ✅ Card management với status tracking
- ✅ Drag-and-drop status update
- ✅ Member assignment to cards
- ✅ Comment system với user attribution

#### `src/controllers/taskController.ts`

**Chức năng:** Quản lý subtasks trong cards

```typescript
class TaskController {
  static async createTask(req, res); // Tạo task
  static async getTasks(req, res); // Lấy tasks
  static async updateTask(req, res); // Cập nhật task
  static async deleteTask(req, res); // Xóa task
}
```

#### `src/controllers/githubController.ts`

**Chức năng:** Tích hợp GitHub (Future feature)

```typescript
class GitHubController {
  static async authenticate(req, res); // GitHub OAuth
  static async getRepositories(req, res); // Lấy repos
  static async syncIssues(req, res); // Sync GitHub issues
}
```

---

### 🛡️ **Middlewares**

#### `src/middlewares/auth.ts`

**Chức năng:** JWT Authentication middleware

```typescript
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction)
```

**Tính năng:**

- ✅ JWT token validation
- ✅ User information extraction
- ✅ Request authorization
- ✅ Error handling for expired tokens

---

### 🏗️ **Models & Types**

#### `src/models/types.ts`

**Chức năng:** Định nghĩa kiểu TypeScript

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  status: "Todo" | "Doing" | "Done";
  boardId: string;
  assignedTo?: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

### 🛣️ **Routes (API Endpoints)** CÁC API

#### `src/routes/auth.ts`

**Endpoints:** Authentication routes

```
POST /auth/register          - Đăng ký user
POST /auth/login            - Đăng nhập
POST /auth/send-verification - Gửi email xác thực
POST /auth/verify-email     - Xác thực email
POST /auth/refresh-token    - Refresh JWT
```

#### `src/routes/boards.ts`

**Endpoints:** Board management routes

```
GET    /boards                    - Lấy danh sách boards
POST   /boards                    - Tạo board mới
GET    /boards/:id                - Lấy board theo ID
PUT    /boards/:id                - Cập nhật board
DELETE /boards/:id                - Xóa board
POST   /boards/:boardId/invite    - Mời thành viên
POST   /boards/invitations/accept - Chấp nhận lời mời
DELETE /boards/:id/members/:memberId - Xóa thành viên
```

#### `src/routes/cards.ts`

**Endpoints:** Card management routes

```
GET    /boards/:boardId/cards              - Lấy cards
POST   /boards/:boardId/cards              - Tạo card
PUT    /boards/:boardId/cards/:cardId      - Cập nhật card
DELETE /boards/:boardId/cards/:cardId      - Xóa card
POST   /boards/:boardId/cards/:cardId/members - Thêm member
DELETE /boards/:boardId/cards/:cardId/members/:memberId - Xóa member
```

#### `src/routes/tasks.ts`

**Endpoints:** Task management routes

```
GET    /cards/:cardId/tasks        - Lấy tasks
POST   /cards/:cardId/tasks        - Tạo task
PUT    /tasks/:taskId              - Cập nhật task
DELETE /tasks/:taskId              - Xóa task
```

---

### 🔧 **Services (Data Access Layer)**

#### `src/services/firebase.ts`

**Chức năng:** Hoạt động của Firebase Firestore

```typescript
export class FirebaseService {
  // User Management
  static async createUser(userData: any);
  static async getUserByEmail(email: string);
  static async getUserById(id: string);

  // Board Management
  static async createBoard(boardData: any);
  static async getBoardsByUserId(userId: string);
  static async getBoardById(boardId: string);
  static async updateBoard(boardId: string, updateData: any);
  static async deleteBoard(boardId: string);

  // Card Management
  static async createCard(cardData: any);
  static async getCardsByBoardId(boardId: string);
  static async updateCard(cardId: string, updateData: any);
  static async deleteCard(cardId: string);

  // Comment System
  static async createComment(commentData: any);
  static async getTasksByCardId(cardId: string);
}
```

**Tính năng:**

- ✅ Firestore CRUD operations
- ✅ Query optimization
- ✅ Error handling và logging
- ✅ Data validation

#### `src/services/email.ts`

**Chức năng:** Email service với Nodemailer

```typescript
export class EmailService {
  static async sendVerificationEmail(email: string, code: string);
  static async sendBoardInvitation(
    email: string,
    boardName: string,
    inviteLink: string
  );
}
```

**Tính năng:**

- ✅ SMTP email sending
- ✅ HTML email templates
- ✅ Verification code generation
- ✅ Board invitation emails

#### `src/services/github.ts`

**Chức năng:** GitHub API integration (Future)

```typescript
export class GitHubService {
  static async authenticateUser(code: string);
  static async getUserRepositories(token: string);
  static async syncRepositoryIssues(repoId: string);
}
```

---

## 🎨 **FRONTEND - React + Vite + TypeScript**

### 📁 Cấu Trúc Thư Mục Frontend

```
Frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── store/           # Redux store
│   ├── assets/          # Static assets
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Public assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS config
```

---

## 📱 Chi Tiết Frontend Components

### 🏠 **Pages**

#### `src/pages/Login.jsx`

**Chức năng:** Trang đăng nhập/đăng ký

- ✅ Form validation
- ✅ JWT token handling
- ✅ Email verification workflow
- ✅ Auto-redirect after login

#### `src/pages/Dashboard.jsx`

**Chức năng:** Trang chính hiển thị boards

- ✅ Board list display
- ✅ Create new board
- ✅ Board search/filter
- ✅ Board card với preview

#### `src/pages/Board.jsx`

**Chức năng:** Trang board với Kanban view

- ✅ Drag-and-drop cards
- ✅ Column management (Todo/Doing/Done)
- ✅ Real-time updates
- ✅ Member sidebar
- ✅ Board settings

#### `src/pages/InvitationPage.jsx`

**Chức năng:** Trang chấp nhận lời mời board

- ✅ Invitation link processing
- ✅ Board preview
- ✅ Accept/decline invitation

#### `src/pages/GitHubCallback.jsx`

**Chức năng:** GitHub OAuth callback

- ✅ OAuth token processing
- ✅ User account linking

---

### 🧩 **Components**

#### `src/components/BoardCard.jsx`

**Chức năng:** Component hiển thị board card

- ✅ Board preview information
- ✅ Member count display
- ✅ Quick actions (Edit/Delete)
- ✅ Board settings modal trigger

#### `src/components/TaskCard.jsx`

**Chức năng:** Component hiển thị card trong board

- ✅ Drag-and-drop support
- ✅ Card information display
- ✅ Member avatars
- ✅ Status indicators

#### `src/components/Column.jsx`

**Chức năng:** Column container cho cards

- ✅ Drop zone for drag-and-drop
- ✅ Column header với actions
- ✅ Card sorting và filtering

#### `src/components/CreateBoardModal.jsx`

**Chức năng:** Modal tạo board mới

- ✅ Form validation
- ✅ Board template selection
- ✅ Privacy settings

#### `src/components/CreateCardModal.jsx`

**Chức năng:** Modal tạo card mới

- ✅ Rich text editor
- ✅ Member assignment
- ✅ Due date setting
- ✅ Attachment support

#### `src/components/CardDetailModal.jsx`

**Chức năng:** Modal chi tiết card

- ✅ Full card editing
- ✅ Comment system
- ✅ Member management
- ✅ Activity timeline
- ✅ Scrollable interface

#### `src/components/BoardSettingsModal.jsx`

**Chức năng:** Modal cài đặt board

- ✅ Board information editing
- ✅ Member management
- ✅ Permission settings
- ✅ Board deletion với confirmation

#### `src/components/InviteMembersModal.jsx`

**Chức năng:** Modal mời thành viên

- ✅ Email validation
- ✅ Batch invitation
- ✅ Permission level selection

#### `src/components/MembersList.jsx`

**Chức năng:** Sidebar hiển thị members

- ✅ Member avatars với colors
- ✅ Role indicators (Owner/Member)
- ✅ Member removal (owner only)
- ✅ Member count display

---

### 🔌 **Services & Utilities**

#### `src/services/api.js`

**Chức năng:** API service layer

```javascript
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  verifyEmail: (code) => api.post("/auth/verify-email", { code }),
};

export const boardsAPI = {
  getAll: () => api.get("/boards"),
  create: (data) => api.post("/boards", data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  removeMember: (boardId, memberId) =>
    api.delete(`/boards/${boardId}/members/${memberId}`),
};

export const cardsAPI = {
  getAll: (boardId) => api.get(`/boards/${boardId}/cards`),
  create: (boardId, data) => api.post(`/boards/${boardId}/cards`, data),
  update: (boardId, cardId, data) =>
    api.put(`/boards/${boardId}/cards/${cardId}`, data),
  delete: (boardId, cardId) => api.delete(`/boards/${boardId}/cards/${cardId}`),
};
```

**Tính năng:**

- ✅ Axios interceptors for auth
- ✅ Error handling và retry logic
- ✅ Request/response logging
- ✅ JWT token auto-attachment

#### `src/hooks/useSocket.js`

**Chức năng:** Socket.io hook for real-time updates

- ✅ Board subscription
- ✅ Card updates broadcasting
- ✅ Member activity tracking
- ✅ Auto-reconnection

---

### 🗄️ **State Management (Redux)**

#### `src/store/index.js`

**Chức năng:** Redux store configuration

```javascript
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    boards: boardsSlice.reducer,
    cards: cardsSlice.reducer,
    tasks: tasksSlice.reducer,
  },
});
```

#### `src/store/authSlice.js`

**Chức năng:** Authentication state management

- ✅ User login/logout
- ✅ Token management
- ✅ Authentication status

#### `src/store/boardsSlice.js`

**Chức năng:** Boards state management

- ✅ Board list state
- ✅ Current board state
- ✅ Board CRUD actions

#### `src/store/cardsSlice.js`

**Chức năng:** Cards state management

- ✅ Cards list state
- ✅ Drag-and-drop updates
- ✅ Real-time sync

---

## 🚀 **Tính Năng Chính**

### ✅ **Authentication System**

- Đăng ký/đăng nhập với email
- Email verification workflow
- JWT token-based authentication
- Password hashing với bcrypt

### ✅ **Board Management**

- Tạo/sửa/xóa boards
- Mời members qua email
- Role-based permissions (Owner/Member)
- Board settings và configuration

### ✅ **Card Management**

- Drag-and-drop Kanban workflow
- Card CRUD operations
- Member assignment to cards
- Comment system với real-time updates

### ✅ **Member Management**

- Board member invitation
- Member removal (owner only)
- Role indicators và permissions
- Member activity tracking

### ✅ **UI/UX Features**

- Responsive design với Tailwind CSS
- Smooth animations và transitions
- Loading states và error handling
- Accessibility support

---

## 🛠️ **Technologies Stack**

### Backend:

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Firebase Firestore
- **Authentication:** JWT + bcryptjs
- **Email:** Nodemailer (Gmail SMTP)
- **Validation:** Express-validator

### Frontend:

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **Drag & Drop:** @dnd-kit/core
- **Icons:** Lucide React
- **Routing:** React Router DOM

---

## 📊 **Database Schema**

### Users Collection

```typescript
{
  id: string,
  email: string,
  password: string, // hashed
  name?: string,
  emailVerificationCode?: string,
  isEmailVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Boards Collection

```typescript
{
  id: string,
  name: string,
  description?: string,
  ownerId: string,
  members: string[], // array of user IDs
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Cards Collection

```typescript
{
  id: string,
  title: string,
  description?: string,
  status: 'Todo' | 'Doing' | 'Done',
  boardId: string,
  assignedTo: string[], // array of user IDs
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Tasks Collection (Comments)

```typescript
{
  id: string,
  cardId: string,
  content: string,
  userId: string,
  userEmail: string,
  createdAt: timestamp
}
```

---

## 🔧 **Development Setup**

### Prerequisites:

- Node.js 18+
- npm hoặc yarn
- Firebase project account
- Gmail account (for SMTP)

### Installation:

```bash
# Clone repository
git clone <repo-url>

# Backend setup
cd Backend
npm install
cp .env.example .env # Configure environment variables
npm run dev

# Frontend setup
cd ../Frontend
npm install
npm run dev
```

### Environment Variables:

```env
# Backend .env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-complex-and-long
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
apiKey=firebase-api-key
authDomain=your-project.firebaseapp.com
projectId=your-project-id
```

---

## 📈 **Future Enhancements**

### 🔄 Real-time Features:

- Socket.io integration
- Live cursor tracking
- Real-time notifications

### 🔗 Integrations:

- GitHub issues sync
- Google Drive attachments
- Slack notifications

### 📱 Advanced Features:

- Mobile app (React Native)
- Offline support
- Advanced analytics
- Custom board templates

---

## 📞 **Support & Contact**

- **Developer:** Mini-Trello Team
- **Email:** support@mini-trello.com
- **GitHub:** https://github.com/an612004/Mini-Trello-app
- **Documentation:** https://docs.mini-trello.com

---

_Tài liệu này được cập nhật định kỳ để phản ánh các thay đổi mới nhất của hệ thống._
