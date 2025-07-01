import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Tv, List } from 'lucide-react';

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

// --- FloatingNav Component ---
// This component now receives the user and a sign-out handler to display the correct button.
const FloatingNav = ({ navItems, user, handleSignOut, className }) => {
  const [visible, setVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 1 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={`flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-black/80 backdrop-blur-sm shadow-lg z-50 px-4 py-2 items-center justify-center ${className}`}
    >
      <div className="flex items-center space-x-6">
        {navItems.map((navItem, idx) => (
          <a key={`link=${idx}`} href={navItem.link} className="relative text-neutral-50 items-center flex space-x-2 hover:text-neutral-300 transition-colors">
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-base font-medium">{navItem.name}</span>
          </a>
        ))}
      </div>
      
      {/* Spacer */}
      <div className="w-px h-6 bg-white/10 mx-4"></div>

      {/* Auth Section: Shows Login or Logout based on user state */}
      <div className="flex items-center">
        {user ? (
          // --- Logged-In View ---
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border-2 border-blue-500" />
            <button onClick={handleSignOut} className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors">
              <span>Logout</span>
            </button>
          </div>
        ) : (
          // --- Logged-Out View ---
          <a href="/login">
            <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors">
              <span>Login</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
            </button>
          </a>
        )}
      </div>
    </motion.div>
  );
};


export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (err) {
      console.error("Firebase sign-out error:", err);
    }
  };

  const navItems = [
    { name: 'Home', link: '/', icon: <Home className="h-6 w-6 text-neutral-50" /> },
    { name: 'Trending', link: '/trending', icon: <TrendingUp className="h-6 w-6 text-neutral-50" /> },
    { name: 'TV Shows', link: '/tvshows', icon: <Tv className="h-6 w-6 text-neutral-50" /> },
    { name: 'My List', link: '/list', icon: <List className="h-6 w-6 text-neutral-50" /> },
  ];

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} user={user} handleSignOut={handleSignOut} />
    </div>
  );
}
