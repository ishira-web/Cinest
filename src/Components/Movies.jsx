import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { Heart, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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
const provider = new GoogleAuthProvider();

// --- API Configuration ---
const API_KEY = "db3e712a7cf710da61c49d96a24eb240";
const DISCOVER_URL_BASE = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US`;

// --- Reusable UI Components ---

const BackgroundGradient = ({ className, children }) => (
  <div className={`p-[1px] bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-[22px] ${className}`}>
    <div className="bg-zinc-900 rounded-[21px] h-full w-full">{children}</div>
  </div>
);

// --- Notification Toast Component ---
function Toast({ message, show, onDismiss }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-full shadow-lg z-50"
        >
          <AlertCircle size={20} />
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// --- MovieCard Component ---
function MovieCard({ movie, user, savedMovies, onToggleSave, showNotification }) {
  if (!movie) return null;

  const isSaved = savedMovies.some(saved => saved.id === movie.id);
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;

  const handleSaveClick = () => {
    if (!user) {
      // If user is not logged in, show a notification.
      showNotification('You must log in to save this');
    } else {
      onToggleSave(movie, isSaved);
    }
  };

  return (
    <div className="group relative">
       <Link to={`/show/${movie.id}`}>
      <BackgroundGradient className="transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-20 flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <button onClick={handleSaveClick} className="absolute top-3 left-3 bg-black/70 p-2 rounded-full z-20 transition-transform duration-200 hover:scale-110 active:scale-95">
            <Heart size={20} className={`transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white/80'}`} />
          </button>
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Image'}
            alt={`Poster for ${title || 'Unknown Title'}`}
            className="w-full h-auto object-cover aspect-[2/3] rounded-t-[21px] bg-zinc-800"
          />
        </div>
        <div className="p-4">
          <p className="text-lg font-bold text-white truncate" title={title}>{title || 'Title Not Available'}</p>
          <p className="text-sm text-neutral-400 mt-1">{releaseDate || 'No Release Date'}</p>
        </div>
      </BackgroundGradient>
      </Link>
    </div>
  );
}

// --- MyList Component ---
// This is your page for displaying the saved movies list.
function MyList({ user, savedMovies, onToggleSave, showNotification }) {
    if (!user) {
        return (
            <div className="text-center text-white py-20">
                <h1 className="text-3xl font-bold">My List</h1>
                <p className="mt-4 text-zinc-400">Please log in to see your saved movies.</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 bg-black min-h-screen text-white">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">My List</h1>
            {savedMovies.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
                    {savedMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} user={user} savedMovies={savedMovies} onToggleSave={onToggleSave} showNotification={showNotification} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-zinc-500">You haven't saved any movies yet.</p>
            )}
        </div>
    );
}

// --- Main App Component ---
export default function MovieApp() {
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Manage which page is visible
  const [currentPage, setCurrentPage] = useState('discover');

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
  }, []);

  useEffect(() => {
    if (currentPage !== 'discover') return;
    setLoading(true);
    fetch(DISCOVER_URL_BASE)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results);
        setLoading(false);
      })
      .catch(err => setError(err.message));
  }, [currentPage]);

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
    <div className="bg-black">
        <Toast message={notification.message} show={notification.show} onDismiss={() => setNotification({ show: false, message: '' })} />    
        {currentPage === 'discover' && (
            <div className="p-4 md:p-8 min-h-screen">
                {loading && <div className="text-center text-white">Loading...</div>}
                {error && <div className="text-center text-red-500">Error: {error}</div>}
                {!loading && !error && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} user={user} savedMovies={savedMovies} onToggleSave={handleToggleSave} showNotification={showNotification} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {currentPage === 'my-list' && (
            <MyList user={user} savedMovies={savedMovies} onToggleSave={handleToggleSave} showNotification={showNotification} />
        )}
    </div>
  );
}
