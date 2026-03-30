import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw",
    authDomain: "wanderlust-ai-planner-99.firebaseapp.com",
    projectId: "wanderlust-ai-planner-99",
    storageBucket: "wanderlust-ai-planner-99.firebasestorage.app",
    messagingSenderId: "698329960097",
    appId: "1:698329960097:web:3887b6e4cf5dc55f306ae0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};
