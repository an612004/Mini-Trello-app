// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
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
const db = getFirestore(app);

(async () => {
    try {
        console.log("🔄 Checking Firebase connection...");
        
        // Test với một document đơn giản
        const testDocRef = doc(db, "test", "connection");
        await getDoc(testDocRef);
        
        console.log("✅ Firebase Firestore connected successfully!");
        console.log("📊 Project ID:", app.options.projectId);
        
    } catch (error) {
        console.error("❌ Firebase connection error:", error instanceof Error ? error.message : String(error));
    }
})();

export default app;
export { db };