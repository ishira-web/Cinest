import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Main Banner Component
export default function Banner() {
  // State for storing movies, current slide index, loading, and error status
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Key for TMDB. Best practice is to store this in an .env file.
  const API_KEY = "db3e712a7cf710da61c49d96a24eb240";
  const API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;

  // Fetch movies from the API when the component mounts
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Take the top 10 movies for the banner
        setMovies(data.results.slice(0, 10));
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [API_URL]);

  // --- Slider Navigation Functions ---

  // Go to the previous slide
  const goToPrevious = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? movies.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, movies.length]);

  // Go to the next slide
  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === movies.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, movies.length]);
  
  // Go to a specific slide using the dots
  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // --- Auto-play Functionality ---
  useEffect(() => {
    // Don't start the timer if there are no movies
    if (movies.length > 0) {
      const slideInterval = setInterval(goToNext, 5000); // Change slide every 5 seconds
      // Clear the interval when the component unmounts or dependencies change
      return () => clearInterval(slideInterval);
    }
  }, [movies.length, goToNext]);


  // --- Render Logic ---

  // Show a loading state
  if (loading) {
    return (
      <div className="w-full h-[550px] bg-neutral-800 flex justify-center items-center">
        <p className="text-white text-xl">Loading Banner...</p>
      </div>
    );
  }

  // Show an error state
  if (error) {
    return (
      <div className="w-full h-[550px] bg-red-900 flex justify-center items-center">
        <p className="text-white text-xl">Error: Could not load movies.</p>
      </div>
    );
  }

  // Render the main banner slider
  return (
    <div className='w-full h-[350px] md:h-[550px] relative group'>
      {/* Slide Content */}
      <div 
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/${movies[currentIndex]?.backdrop_path})` }}
        className='w-full h-full bg-center bg-cover duration-500'
      >
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Movie Details */}
        <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 text-white max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                {movies[currentIndex]?.title}
            </h1>
            <p className="text-sm md:text-base mt-4 max-w-lg drop-shadow-md hidden md:block">
                {movies[currentIndex]?.overview}
            </p>
            <button className="mt-6 bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-transform duration-300 hover:scale-105">
                More Info
            </button>
        </div>
      </div>

      {/* Left Arrow */}
      <div className='hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all'>
        <ChevronLeft onClick={goToPrevious} size={30} />
      </div>

      {/* Right Arrow */}
      <div className='hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all'>
        <ChevronRight onClick={goToNext} size={30} />
      </div>
      
      {/* Navigation Dots */}
      <div className='flex justify-center py-2 absolute bottom-4 w-full'>
        {movies.map((_, slideIndex) => (
          <div 
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`cursor-pointer text-2xl mx-1 transition-all duration-300 ${currentIndex === slideIndex ? 'text-white' : 'text-gray-500'}`}
          >
            ●
          </div>
        ))}
      </div>
    </div>
  );
}
