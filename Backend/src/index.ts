import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";

// Import routes
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';
import cardRoutes from './routes/cards';
import taskRoutes from './routes/tasks';
import githubRoutes from './routes/github';

// Initialize Firebase config
console.log('🔄 Checking Firebase connection...');
try {
  import('./config/firebaseConfig');
  console.log('Firebase config loaded');
} catch (error) {
  console.log('Firebase connection error:', error instanceof Error ? error.message : 'Unknown error');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, 
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret", 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/boards', cardRoutes);  // Cards are nested under boards
app.use('/boards', taskRoutes);  // Tasks are nested under boards/cards
app.use('/', githubRoutes);      // GitHub routes

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Trello Clone Backend API is running!",
    version: "1.0.0",
    status: "✅ Online",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth/*",
      boards: "/boards/*", 
      cards: "/boards/:boardId/cards/*",
      tasks: "/boards/:boardId/cards/:cardId/tasks/*",
      github: "/repositories/:repositoryId/github-info"
    },
    testEndpoints: {
      health: "GET /",
      authTest: "GET /test",
      sendCode: "POST /auth/send-code",
      signup: "POST /auth/signup",
      signin: "POST /auth/signin"
    }
  });
});

// Test endpoint without authentication
app.get("/test", (req, res) => {
  res.json({
    message: "✅ API Test successful!",
    timestamp: new Date().toISOString(),
    server: "Backend API v1.0.0",
    firebase: "Connected to minitrelooapp",
    instructions: {
      step1: "First, send verification code: POST /auth/send-code with {email: 'your@email.com'}",
      step2: "Then signup: POST /auth/signup with {email, code, name, avatar}",
      step3: "Or signin: POST /auth/signin with {email, code}",
      step4: "Use the returned token in Authorization header: 'Bearer <token>'"
    }
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
