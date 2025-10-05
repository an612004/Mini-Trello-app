"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
// Your web app's Firebase configuration
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
exports.db = db;
(async () => {
    try {
        console.log("🔄 Checking Firebase connection...");
        // Test với một document đơn giản
        const testDocRef = (0, firestore_1.doc)(db, "test", "connection");
        await (0, firestore_1.getDoc)(testDocRef);
        console.log("✅ Firebase Firestore connected successfully!");
        console.log("📊 Project ID:", app.options.projectId);
    }
    catch (error) {
        console.error("❌ Firebase connection error:", error instanceof Error ? error.message : String(error));
    }
})();
exports.default = app;
//# sourceMappingURL=firebaseConfig.js.map