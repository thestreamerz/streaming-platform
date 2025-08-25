import React, { useState } from 'react';
import { Star, Play, Plus, Heart, Info, Clock, Calendar } from 'lucide-react';
import { contentService } from '../services/contentService';

interface EnhancedMediaCardProps {
  item: any;
  type: 'movie' | 'tv';
  onSelect: (item: any, type: 'movie' | 'tv') => void;
  onWatch: (item: any, type: 'movie' | 'tv') => void;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export const EnhancedMediaCard: React.FC<EnhancedMediaCardProps> = ({ 
  item, 
  type, 
  onSelect, 
  onWatch, 
  size = 'medium',
  showDetails = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const title = type === 'movie' ? item.title : item.name;
  const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';

  const sizeClasses = {
    small: 'w-full h-48',
    medium: 'w-full h-72',
    large: 'w-full h-80'
  };

  const getGenreNames = () => {
    if (!item.genre_ids || item.genre_ids.length === 0) return '';
    // This would need genre mapping - simplified for now
    return item.genre_ids.slice(0, 2).join(', ');
  };

  // Enhanced main card click handler - opens video player
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isClicked) return; // Prevent double-clicking
    
    console.log('🎬 Card clicked:', title, 'Type:', type);
    setIsClicked(true);
    
    // Call the onWatch function immediately
    try {
      onWatch(item, type);
    } catch (error) {
      console.error('Error calling onWatch:', error);
    }
    
    // Reset click state after animation
    setTimeout(() => setIsClicked(false), 300);
  };

  // Enhanced button click handlers with proper event handling
  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('▶️ Watch button clicked:', title);
    onWatch(item, type);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ℹ️ Info button clicked:', title);
    onSelect(item, type);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
    console.log('📝 Watchlist toggled for:', title);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    console.log('❤️ Like toggled for:', title);
  };

  return (
    <div 
      className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:z-10 relative transform hover:shadow-2xl w-full ${
        isClicked ? 'scale-95' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick} // Make entire card clickable
      title={`Click to watch ${title}`} // Add tooltip
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
    >
      <div className={`relative overflow-hidden rounded-xl bg-slate-800 shadow-xl transition-all duration-300 w-full ${
        isHovered ? 'ring-2 ring-blue-500/50 shadow-blue-500/25' : ''
      }`}>
        {/* Main Image */}
        <div className="relative w-full">
          <img 
            src={contentService.getImageUrl(item.poster_path, 'w500')} 
            alt={title}
            className={`${sizeClasses[size]} w-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-110 brightness-75' : 'scale-100'
            }`}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-movie.jpg';
            }}
            draggable={false}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Quality Badge */}
          <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            4K
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current" />
            <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>

          {/* Trending Badge */}
          {item.trending && (
            <div className="absolute top-12 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
              🔥 Trending
            </div>
          )}

          {/* Loading Indicator - Shows when clicked */}
          {isClicked && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-30">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm">Opening...</p>
              </div>
            </div>
          )}

          {/* Play Button Overlay - Shows on hover */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/30 mb-2">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              Click to Watch
            </div>
          </div>
        </div>

        {/* Hover Content */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          {showDetails && (
            <div className="mb-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{title}</h3>
              <div className="flex items-center space-x-2 text-gray-300 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span>{year}</span>
                <span>•</span>
                <span className="capitalize">{type}</span>
              </div>
              {item.overview && (
                <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                  {item.overview}
                </p>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button 
                onClick={handleWatchClick}
                className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-110 shadow-lg"
                title="Play Now"
                type="button"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
              
              <button 
                onClick={handleWatchlistClick}
                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                  isInWatchlist 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
                title="Add to Watchlist"
                type="button"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleLikeClick}
                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                  isLiked 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
                title="Like"
                type="button"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <button 
              onClick={handleInfoClick}
              className="p-2 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
              title="More Info"
              type="button"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar (for continue watching) */}
        {Math.random() > 0.7 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
            />
          </div>
        )}
      </div>

      {/* Expanded Card on Hover (Netflix-style) */}
      {isHovered && size === 'medium' && (
        <div className="absolute top-0 left-0 right-0 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-20 transform -translate-y-2 animate-fade-in">
          <div className="relative">
            <img 
              src={contentService.getImageUrl(item.backdrop_path || item.poster_path, 'w500')} 
              alt={title}
              className="w-full h-32 object-cover rounded-t-xl"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent rounded-t-xl" />
          </div>
          
          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <div className="flex items-center space-x-2 text-gray-300 text-sm mb-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                {Math.floor(Math.random() * 20) + 80}% Match
              </span>
              <span>{year}</span>
              <span className="border border-gray-500 px-1 text-xs">HD</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={handleWatchClick}
                  className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
                <button 
                  onClick={handleWatchlistClick}
                  className={`p-2 rounded-full transition-colors ${
                    isInWatchlist 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  type="button"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button 
                  onClick={handleLikeClick}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  type="button"
                >
                  <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
              <button 
                onClick={handleInfoClick}
                className="p-2 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition-colors"
                type="button"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};