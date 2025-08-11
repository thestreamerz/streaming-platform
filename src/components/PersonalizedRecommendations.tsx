import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Heart, Star, RefreshCw } from 'lucide-react';
import { EnhancedMediaCard } from './EnhancedMediaCard';
import { tmdbService } from '../services/api';

interface PersonalizedRecommendationsProps {
  onItemSelect: (item: any, type: 'movie' | 'tv') => void;
  onWatch: (item: any, type: 'movie' | 'tv') => void;
  user?: any;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  onItemSelect,
  onWatch,
  user
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('for-you');

  const categories = [
    { id: 'for-you', label: 'For You', icon: Sparkles, color: 'text-purple-400' },
    { id: 'trending', label: 'Trending Now', icon: TrendingUp, color: 'text-red-400' },
    { id: 'because-you-liked', label: 'Because You Liked', icon: Heart, color: 'text-pink-400' },
    { id: 'top-rated', label: 'Top Rated', icon: Star, color: 'text-yellow-400' }
  ];

  useEffect(() => {
    loadRecommendations();
  }, [activeCategory]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      let data = [];
      
      switch (activeCategory) {
        case 'trending':
          const [trendingMovies, trendingTV] = await Promise.all([
            tmdbService.getTrendingMovies(),
            tmdbService.getTrendingTVShows()
          ]);
          data = [...trendingMovies.slice(0, 6), ...trendingTV.slice(0, 6)];
          break;
          
        case 'top-rated':
          const topRated = await tmdbService.getTopRatedMovies();
          data = topRated.slice(0, 12);
          break;
          
        case 'because-you-liked':
          // Mock personalized recommendations based on user preferences
          const popular = await tmdbService.getPopularMovies();
          data = popular.slice(0, 12);
          break;
          
        default:
          // For You - mix of different content
          const [popularContent, trending] = await Promise.all([
            tmdbService.getPopularMovies(),
            tmdbService.getTrendingMovies()
          ]);
          data = [...popularContent.slice(0, 6), ...trending.slice(0, 6)];
      }
      
      setRecommendations(data.map(item => ({
        ...item,
        type: item.title ? 'movie' : 'tv'
      })));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedMessage = () => {
    const userName = user?.displayName?.split(' ')[0] || 'there';
    
    switch (activeCategory) {
      case 'for-you':
        return `Hey ${userName}, here's what we think you'll love`;
      case 'trending':
        return "What everyone's watching right now";
      case 'because-you-liked':
        return `More like what you've enjoyed, ${userName}`;
      case 'top-rated':
        return "The highest rated content on THE STREAMERZ";
      default:
        return "Discover something new";
    }
  };

  return (
    <section className="mb-12">
      {/* Category Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeCategory === category.id ? category.color : ''}`} />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Personalized Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {getPersonalizedMessage()}
        </h2>
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Updated just for you</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-slate-700 rounded-xl h-72 mb-2"></div>
              <div className="bg-slate-700 rounded h-4 mb-1"></div>
              <div className="bg-slate-700 rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {recommendations.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EnhancedMediaCard
                item={item}
                type={item.type}
                onSelect={onItemSelect}
                onWatch={onWatch}
                size="medium"
                showDetails={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Match Percentage Explanation */}
      {activeCategory === 'for-you' && (
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-2 text-green-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">How we personalize for you</span>
          </div>
          <p className="text-gray-400 text-sm">
            Our AI analyzes your viewing history, ratings, and preferences to suggest content 
            you're most likely to enjoy. The match percentage shows how well each title aligns 
            with your taste.
          </p>
        </div>
      )}
    </section>
  );
};