"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const boards_1 = __importDefault(require("./routes/boards"));
const cards_1 = __importDefault(require("./routes/cards"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const github_1 = __importDefault(require("./routes/github"));
// Initialize Firebase config
console.log('🔄 Checking Firebase connection...');
try {
    Promise.resolve().then(() => __importStar(require('./config/firebaseConfig')));
    console.log('Firebase config loaded');
}
catch (error) {
    console.log('Firebase connection error:', error instanceof Error ? error.message : 'Unknown error');
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/auth', auth_1.default);
app.use('/boards', boards_1.default);
app.use('/boards', cards_1.default); // Cards are nested under boards
app.use('/boards', tasks_1.default); // Tasks are nested under boards/cards
app.use('/', github_1.default); // GitHub routes
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
app.use((err, req, res, next) => {
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
//# sourceMappingURL=index.js.map