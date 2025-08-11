import React, { useState, useEffect } from 'react';
import { Play, Plus, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { contentService } from '../services/contentService';

interface InteractiveHeroProps {
  movies: any[];
  onMovieSelect: (movie: any, type: string) => void;
  onWatch: (movie: any, type: string) => void;
}

export const InteractiveHero: React.FC<InteractiveHeroProps> = ({ movies, onMovieSelect, onWatch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const heroMovies = movies.slice(0, 5);

  useEffect(() => {
    if (heroMovies.length === 0 || !isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroMovies.length, isPlaying]);

  if (heroMovies.length === 0) return null;

  const currentMovie = heroMovies[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  return (
    <div 
      className="relative h-[70vh] md:h-[80vh] overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {heroMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img 
              src={tmdbService.getImageUrl(movie.backdrop_path, 'w1280')} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 z-10 ${
          showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 z-10 ${
          showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Movie Title with Animation */}
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 animate-slide-up">
              {currentMovie.title}
            </h1>
            
            {/* Movie Info */}
            <div className="flex items-center space-x-4 mb-4 text-gray-300 animate-fade-in">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                ★ {currentMovie.vote_average?.toFixed(1)}
              </span>
              <span>{new Date(currentMovie.release_date).getFullYear()}</span>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">HD</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-200 text-lg mb-8 leading-relaxed line-clamp-3 animate-fade-in-up">
              {currentMovie.overview}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up">
              <button 
                onClick={() => onWatch(currentMovie, 'movie')}
                className="flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Play Now</span>
              </button>
              
              <button 
                onClick={() => onMovieSelect(currentMovie, 'movie')}
                className="flex items-center space-x-3 bg-gray-600/80 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm shadow-xl"
              >
                <Info className="w-6 h-6" />
                <span>More Info</span>
              </button>
              
              <button className="flex items-center space-x-3 bg-transparent border-2 border-white/50 hover:border-white text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                <Plus className="w-6 h-6" />
                <span>My List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Control */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`absolute bottom-20 right-8 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="relative group"
          >
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/30'
            }`}>
              {index === currentSlide && (
                <div className="absolute inset-0 bg-red-600 rounded-full animate-progress"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Floating Movie Cards Preview */}
      <div className={`absolute bottom-8 right-8 flex space-x-2 transition-all duration-500 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {heroMovies.slice(currentSlide + 1, currentSlide + 4).map((movie, index) => (
          <div
            key={movie.id}
            className="w-16 h-24 rounded-lg overflow-hidden cursor-pointer transform hover:scale-110 transition-transform duration-300 shadow-lg"
            onClick={() => setCurrentSlide((currentSlide + index + 1) % heroMovies.length)}
          >
            <img
              src={contentService.getImageUrl(movie.poster_path, 'w200')}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};