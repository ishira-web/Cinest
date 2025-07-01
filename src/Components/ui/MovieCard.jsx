import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const BackgroundGradient = ({ className, children }) => (
  <div className={`p-[1px] bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-[22px] ${className}`}>
    <div className="bg-zinc-900 rounded-[21px] h-full w-full">{children}</div>
  </div>
);

export default function MovieCard({ movie, user, savedMovies, onToggleSave, showNotification }) {
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
    <motion.div 
      className="group relative"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/show/${movie.id}`}>
        <BackgroundGradient className="transition-all duration-300 group-hover:scale-105">
          <div className="relative">
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-20 flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Image'}
              alt={`Poster for ${title || 'Unknown Title'}`}
              className="w-full h-auto object-cover aspect-[2/3] rounded-t-[21px] bg-zinc-800"
            />
          </div>
          <div className="p-4">
            <p className="text-lg font-bold text-white truncate" title={title}>{title || 'Title Not Available'}</p>
            <p className="text-sm text-neutral-400 mt-1">{releaseDate ? releaseDate.split('-')[0] : 'No Release Date'}</p>
          </div>
        </BackgroundGradient>
      </Link>
      <button 
        onClick={handleSaveClick} 
        className="absolute top-3 left-3 bg-black/70 p-2 rounded-full z-20 transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <Heart size={20} className={`transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white/80'}`} />
      </button>
    </motion.div>
  );
}