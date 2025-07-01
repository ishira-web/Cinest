import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyByTwvftMk_I_o_HqQRKt5jKaWzSeKgEoQ",
  authDomain: "cinebuz-7960e.firebaseapp.com",
  projectId: "cinebuz-7960e",
  storageBucket: "cinebuz-7960e.firebasestorage.app",
  messagingSenderId: "740322505207",
  appId: "1:740322505207:web:25c1f7dab054761890fef2",
  measurementId: "G-DBXJG08SV1"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- Google Icon SVG ---
// Replaced the react-icons import with a self-contained SVG to fix the compilation error.
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);


// --- Main LoginPage Component ---
export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // If a user is logged in, update state and redirect.
        setUser(currentUser);
        window.location.href = '/'; // Redirect to homepage
      } else {
        // If no user is logged in, stop loading.
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setError(null);
    try {
      // The onAuthStateChanged listener will handle the redirect upon success.
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error("Firebase sign-in error:", err);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-2xl shadow-blue-500/10">
        {/* This view will only be shown if the user is not logged in */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Join Now</h1>
            <p className="text-zinc-400 mt-2">Sign in to continue to your account.</p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
