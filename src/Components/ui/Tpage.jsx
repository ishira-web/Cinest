import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { Heart, Star, Home, TrendingUp, Tv, List as ListIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- API Configuration ---
const API_KEY = "db3e712a7cf710da61c49d96a24eb240";
const TRENDING_URL = `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`;


// --- Reusable UI Components ---

const BackgroundGradient = ({ className, children }) => (
  <div className={`p-[1px] bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-[22px] ${className}`}>
    <div className="bg-zinc-900 rounded-[21px] h-full w-full">{children}</div>
  </div>
);

function Toast({ message, show, onDismiss }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onDismiss(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-full shadow-lg z-50"
        >
          <AlertCircle size={20} />
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MovieCard({ movie, user, savedMovies, onToggleSave, showNotification }) {
  if (!movie) return null;

  const isSaved = savedMovies.some(saved => saved.id === movie.id);
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showNotification('You must log in to save this');
    } else {
      onToggleSave(movie, isSaved);
    }
  };

  return (
    <a href={`/show/${movie.id}`} className="group relative block">
      <BackgroundGradient className="transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-20 flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <button onClick={handleSaveClick} className="absolute top-3 left-3 bg-black/70 p-2 rounded-full z-20 transition-transform duration-200 hover:scale-110 active:scale-95">
            <Heart size={20} className={`transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white/80'}`} />
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

// --- Navigation Component ---
const FloatingNav = ({ navItems, user, handleSignOut }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) setVisible(false);
      else setVisible(true);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: visible ? 0 : -100 }}
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


// --- Main Tpage Content Component ---
function TpageContent() {
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(TRENDING_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch trending movies.');
        return res.json();
      })
      .then(data => {
        setMovies(data.results);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      const savedMoviesCol = collection(db, 'users', user.uid, 'saved_movies');
      const unsubscribe = onSnapshot(savedMoviesCol, (snapshot) => {
        setSavedMovies(snapshot.docs.map(doc => ({ firestoreDocId: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else {
      setSavedMovies([]);
    }
  }, [user]);

  const handleToggleSave = async (movie, isCurrentlySaved) => {
    if (!user) return;
    const savedMoviesCol = collection(db, 'users', user.uid, 'saved_movies');
    if (isCurrentlySaved) {
      const movieToDelete = savedMovies.find(saved => saved.id === movie.id);
      if (movieToDelete) await deleteDoc(doc(db, 'users', user.uid, 'saved_movies', movieToDelete.firestoreDocId));
    } else {
      await addDoc(savedMoviesCol, {
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date
      });
    }
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <Toast message={notification.message} show={notification.show} onDismiss={() => setNotification({ show: false, message: '' })} />
      <h1 className="text-4xl md:text-5xl font-bold text-center mt-24">Trending Now</h1>
      
      {loading && <div className="text-center mt-10">Loading...</div>}
      {error && <div className="text-center text-red-500 mt-10">Error: {error}</div>}
      
      {!loading && !error && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-10'>
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              user={user} 
              savedMovies={savedMovies} 
              onToggleSave={handleToggleSave} 
              showNotification={showNotification} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TpageWithNav() {
  return (
    <div className="relative">
      <Navbar />
      <TpageContent />
    </div>
  );
}
