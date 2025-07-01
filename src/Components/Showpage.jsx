import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, PlayCircle, ArrowLeft, Clapperboard, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

// --- API Configuration ---
const API_KEY = "db3e712a7cf710da61c49d96a24eb240";
const MOVIE_DETAILS_BASE_URL = `https://api.themoviedb.org/3/movie/`;
const TV_DETAILS_BASE_URL = `https://api.themoviedb.org/3/tv/`;

// --- Bento Grid Item Wrapper (Aceternity UI inspired) ---
const BentoGridItem = ({ className, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`relative group flex flex-col justify-between space-y-4 rounded-2xl bg-zinc-900/60 border border-white/[0.1] p-6 shadow-xl backdrop-blur-sm ${className}`}
  >
    {children}
  </motion.div>
);


// --- Main Showpage Component ---
export default function Showpage({ user, savedMovies = [], onToggleSave, showNotification }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('movie');
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSaved = savedMovies.some(saved => saved.id === parseInt(id));

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
        const movieDetailsRes = await fetch(`${MOVIE_DETAILS_BASE_URL}${id}?api_key=${API_KEY}`);
        let detailsUrl, creditsUrl, videosUrl, relatedUrl;

        if (movieDetailsRes.ok) {
          setMediaType('movie');
          detailsUrl = `${MOVIE_DETAILS_BASE_URL}${id}?api_key=${API_KEY}`;
          creditsUrl = `${MOVIE_DETAILS_BASE_URL}${id}/credits?api_key=${API_KEY}`;
          videosUrl = `${MOVIE_DETAILS_BASE_URL}${id}/videos?api_key=${API_KEY}`;
          relatedUrl = `${MOVIE_DETAILS_BASE_URL}${id}/similar?api_key=${API_KEY}`;
        } else {
          const tvDetailsRes = await fetch(`${TV_DETAILS_BASE_URL}${id}?api_key=${API_KEY}`);
          if (!tvDetailsRes.ok) throw new Error('Media not found.');
          
          setMediaType('tv');
          detailsUrl = `${TV_DETAILS_BASE_URL}${id}?api_key=${API_KEY}`;
          creditsUrl = `${TV_DETAILS_BASE_URL}${id}/credits?api_key=${API_KEY}`;
          videosUrl = `${TV_DETAILS_BASE_URL}${id}/videos?api_key=${API_KEY}`;
          relatedUrl = `${TV_DETAILS_BASE_URL}${id}/similar?api_key=${API_KEY}`;
        }

        const [detailsRes, creditsRes, videosRes, relatedRes] = await Promise.all([
          fetch(detailsUrl), fetch(creditsUrl), fetch(videosUrl), fetch(relatedUrl)
        ]);

        const details = await detailsRes.json();
        const credits = await creditsRes.json();
        const videos = await videosRes.json();
        const relatedData = await relatedRes.json();

        setMedia(details);
        setCast(credits.cast.slice(0, 10));
        setRelated(relatedData.results.slice(0, 10));
        setTrailer(videos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube'));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDetails();
  }, [id]);
  
  const handleSaveClick = () => {
    if (!user) {
      showNotification('You must log in to save this');
    } else {
      onToggleSave(media, isSaved);
    }
  };

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center text-white"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div><p>Loading details...</p></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center text-red-500"><p className="text-2xl">Error: {error}</p><button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Go Back</button></div>
    </div>
  );
  
  if (!media) return null;

  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;
  const runtime = media.runtime || (media.episode_run_time && media.episode_run_time[0]);

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          src={media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`:''}
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-neutral-300 hover:text-white transition-colors bg-black/50 rounded-full px-4 py-2 mt-[5rem]">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BentoGridItem className="lg:col-span-1 p-0 overflow-hidden">
            <div className="relative w-full h-full">
              <img 
                src={media.poster_path ? `https://image.tmdb.org/t/p/w780${media.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Poster'} 
                alt={title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          </BentoGridItem>

          <BentoGridItem className="lg:col-span-2">
            <div>
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-4xl md:text-6xl font-bold tracking-tighter">{title}</motion.h1>
              <p className="text-neutral-400 mt-2 italic">{media.tagline}</p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-neutral-300">
                <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /><span>{media.vote_average?.toFixed(1) || 'N/A'}</span></div>
                <span>•</span><span>{releaseDate ? releaseDate.split('-')[0] : 'Unknown'}</span>
                {runtime && (<><span>•</span><span>{runtime} min</span></>)}
                {media.number_of_seasons && (<><span>•</span><span>{media.number_of_seasons} season{media.number_of_seasons > 1 ? 's' : ''}</span></>)}
              </div>
            </div>
            <p className="text-neutral-300 max-w-2xl text-base">{media.overview || 'No description available.'}</p>
            <div className="flex items-center gap-4 mt-4">
              {trailer && (<a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 font-semibold bg-white text-black rounded-full hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-lg"><PlayCircle size={24}/> Watch Trailer</a>)}
              <button onClick={handleSaveClick} className="flex items-center justify-center p-4 bg-white/10 rounded-full transition-colors hover:bg-white/20 transform hover:scale-110"><Heart size={24} className={`transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} /></button>
            </div>
          </BentoGridItem>

          <BentoGridItem className="lg:col-span-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><Tag size={20} /> Genres</h3>
            <div className="flex flex-wrap gap-2">{media.genres.map(genre => (<div key={genre.id} className="px-3 py-1 bg-zinc-800 text-neutral-300 text-sm rounded-full">{genre.name}</div>))}</div>
          </BentoGridItem>
        </div>

        {cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Clapperboard size={28}/> Cast</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-6">
              {cast.map((person, index) => (<motion.div key={person.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }} className="text-center group"><img src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://placehold.co/200x300/18181b/ffffff?text=?'} alt={person.name} className="rounded-full w-24 h-24 object-cover mx-auto mb-2 border-2 border-transparent group-hover:border-red-500 transition-all"/><p className="font-medium">{person.name}</p><p className="text-sm text-neutral-400 truncate">{person.character}</p></motion.div>))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Related {mediaType === 'movie' ? 'Movies' : 'Shows'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map(rel => (<a href={`/show/${rel.id}`} key={rel.id} className="group block relative overflow-hidden rounded-lg"><img src={rel.poster_path ? `https://image.tmdb.org/t/p/w500${rel.poster_path}` : 'https://placehold.co/500x750/18181b/ffffff?text=No+Image'} alt={rel.title || rel.name} className="transition-transform duration-300 group-hover:scale-105 w-full"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div><p className="absolute bottom-2 left-2 right-2 text-center font-medium truncate">{rel.title || rel.name}</p></a>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
