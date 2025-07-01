import React, { useState, useEffect } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// --- API Configuration ---
const API_KEY = "db3e712a7cf710da61c49d96a24eb240";
const DISCOVER_TV_URL = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`;

// --- Reusable UI Components ---

// A fallback for Aceternity UI's BackgroundGradient to make the component self-contained.
const BackgroundGradient = ({ className, children }) => (
  <div className={`p-[1px] bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-[22px] ${className}`}>
    <div className="bg-zinc-900 rounded-[21px] h-full w-full">
      {children}
    </div>
  </div>
);

// A dedicated card component for displaying a TV show.
function TVShowCard({ show }) {
  const [isSaved, setIsSaved] = useState(false);
  if (!show) return null;

  const title = show.name;
  const releaseDate = show.first_air_date;

  return (
    <div className="group relative">
      <BackgroundGradient className="transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full z-20 flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>{show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <button onClick={() => setIsSaved(!isSaved)} className="absolute top-3 left-3 bg-black/70 p-2 rounded-full z-20 transition-transform duration-200 hover:scale-110 active:scale-95">
            <Heart size={20} className={`transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white/80'}`} />
          </button>
          <img
            src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Image'}
            alt={`Poster for ${title || 'Unknown Title'}`}
            className="w-full h-auto object-cover aspect-[2/3] rounded-t-[21px] bg-zinc-800"
          />
        </div>
        <div className="p-4">
          <p className="text-lg font-bold text-white truncate" title={title}>{title || 'Title Not Available'}</p>
          <p className="text-sm text-neutral-400 mt-1">{releaseDate || 'No Release Date'}</p>
        </div>
      </BackgroundGradient>
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    // TMDB API has a limit of 500 pages
    if (currentPage < totalPages && currentPage < 500) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      <button 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      <span className="text-neutral-400">
        Page {currentPage} of {Math.min(totalPages, 500)}
      </span>
      <button 
        onClick={handleNext} 
        disabled={currentPage >= totalPages || currentPage >= 500}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}


// --- Main Page Component ---
export default function TShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    // Fetch data for the current page
    fetch(`${DISCOVER_TV_URL}&page=${currentPage}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch TV shows.');
        return res.json();
      })
      .then(data => {
        setShows(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
        // Scroll to the top of the page when new data loads
        window.scrollTo(0, 0);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage]);

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <h1 className="text-4xl md:text-5xl font-bold text-center mt-24">Popular TV Shows</h1>
      
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-5' >
            {shows.map((show) => (
              <TVShowCard key={show.id} show={show} />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
