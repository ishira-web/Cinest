import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Heart, Star, Home, TrendingUp, Tv, List as ListIcon } from 'lucide-react';
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

// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Navigation Component ---
const FloatingNav = ({ navItems, user, handleSignOut }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 1 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-black/80 backdrop-blur-sm shadow-lg z-50 px-4 py-2 items-center justify-center"
    >
      <div className="flex items-center space-x-6">
        {navItems.map((navItem) => (
          <a key={navItem.name} href={navItem.link} className="relative text-neutral-50 items-center flex space-x-2 hover:text-neutral-300 transition-colors">
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-base font-medium">{navItem.name}</span>
          </a>
        ))}
      </div>
      <div className="w-px h-6 bg-white/10 mx-4"></div>
      <div className="flex items-center">
        {user ? (
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border-2 border-blue-500" />
            <button onClick={handleSignOut} className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors">
              <span>Logout</span>
            </button>
          </div>
        ) : (
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

function Navbar() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Home', link: '/', icon: <Home className="h-6 w-6 text-neutral-50" /> },
    { name: 'Trending', link: '/trending', icon: <TrendingUp className="h-6 w-6 text-neutral-50" /> },
    { name: 'TV Shows', link: '/tvshows', icon: <Tv className="h-6 w-6 text-neutral-50" /> },
    { name: 'My List', link: '/list', icon: <ListIcon className="h-6 w-6 text-neutral-50" /> },
  ];

  return <FloatingNav navItems={navItems} user={user} handleSignOut={handleSignOut} />;
}


// --- MyList Page Components ---
const BackgroundGradient = ({ className, children }) => (
  <div className={`p-[1px] bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-[22px] ${className}`}>
    <div className="bg-zinc-900 rounded-[21px] h-full w-full">{children}</div>
  </div>
);

function MovieCard({ movie, onUnsave }) {
  if (!movie) return null;
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;

  return (
    <a href={`/show/${movie.id}`} className="group relative block">
      <BackgroundGradient className="transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-20 flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnsave(movie.firestoreDocId); }} className="absolute top-3 left-3 bg-black/70 p-2 rounded-full z-20 transition-transform duration-200 hover:scale-110 active:scale-95" aria-label="Unsave movie">
            <Heart size={20} className="text-red-500 fill-red-500" />
          </button>
          <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Image'} alt={`Poster for ${title}`} className="w-full h-auto object-cover aspect-[2/3] rounded-t-[21px] bg-zinc-800" />
        </div>
        <div className="p-4">
          <p className="text-lg font-bold text-white truncate" title={title}>{title}</p>
          <p className="text-sm text-neutral-400 mt-1">{releaseDate ? releaseDate.split('-')[0] : 'Unknown'}</p>
        </div>
      </BackgroundGradient>
    </a>
  );
}

function MyListContent() {
  const [user, setUser] = useState(null);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const savedMoviesCol = collection(db, 'users', user.uid, 'saved_movies');
      const unsubscribe = onSnapshot(savedMoviesCol, (snapshot) => {
        const savedList = snapshot.docs.map(doc => ({ firestoreDocId: doc.id, ...doc.data() }));
        setSavedMovies(savedList);
      }, (err) => {
        setError("Could not fetch your list.");
      });
      return () => unsubscribe();
    } else {
      setSavedMovies([]);
    }
  }, [user]);

  const handleUnsave = async (firestoreDocId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved_movies', firestoreDocId));
    } catch (err) {
      setError("Could not remove the movie.");
    }
  };

  if (loading) {
    return <div className="p-8 bg-black min-h-screen text-white text-center">Loading your list...</div>;
  }
  
  if (!user) {
    return (
      <div className="p-8 bg-black min-h-screen text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mt-24">My List</h1>
        <p className="text-zinc-400">Please <a href="/login" className="text-blue-500 underline">log in</a> to see your saved movies.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 mt-24">My List</h1>
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {savedMovies.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
          {savedMovies.map((movie) => (
            <MovieCard key={movie.firestoreDocId} movie={movie} onUnsave={handleUnsave} />
          ))}
        </div>
      ) : (
        <p className="text-center text-zinc-500">You haven't saved any movies yet.</p>
      )}
    </div>
  );
}

// --- Main Exported Component ---
// This renders the Navbar and the MyList content together.
export default function MyListPageWithNav() {
  return (
    <div className="relative">
      <Navbar />
      <MyListContent />
    </div>
  );
}
