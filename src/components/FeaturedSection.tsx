import React, { useState, useEffect } from 'react';
import { Star, Play, Plus, TrendingUp, Award, Calendar, Clock } from 'lucide-react';
import { tmdbService, Movie, TVShow } from '../services/api';

interface FeaturedSectionProps {
  onItemSelect: (item: any, type: 'movie' | 'tv') => void;
  onWatch: (item: any, type: 'movie' | 'tv') => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onItemSelect, onWatch }) => {
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      const [topRated, upcoming] = await Promise.all([
        tmdbService.getTopRatedMovies(),
        tmdbService.getUpcomingMovies()
      ]);
      
      setTopRatedMovies(topRated.slice(0, 8));
      setUpcomingMovies(upcoming.slice(0, 8));
    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const FeaturedCard = ({ item, type, badge }: { item: Movie | TVShow, type: 'movie' | 'tv', badge?: string }) => {
    const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
    const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';

    return (
      <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-xl">
          <img 
            src={tmdbService.getImageUrl(item.poster_path, 'w500')} 
            alt={title}
            className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-movie.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {badge && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>{badge}</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{item.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatch(item, type);
                  }}
                  className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect(item, type);
                  }}
                  className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1 truncate">{title}</h3>
            <p className="text-gray-300 text-sm">{year}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Top Rated Movies */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <Award className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-white">Top Rated Movies</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {topRatedMovies.map((movie) => (
            <FeaturedCard 
              key={movie.id} 
              item={movie} 
              type="movie"
              badge="Top Rated"
            />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <Calendar className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {upcomingMovies.map((movie) => (
            <FeaturedCard 
              key={movie.id} 
              item={movie} 
              type="movie"
              badge="Coming Soon"
            />
          ))}
        </div>
      </section>
    </div>
  );
};