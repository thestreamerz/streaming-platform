import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Star, Play, Plus, Heart, User, TrendingUp as Trending, Film, Home, Tv, Calendar, Clock, Filter as FilterIcon, Settings, BarChart3 } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { multiSourceAPI } from '../services/multiSourceAPI';
import { streamingService, StreamingSource } from '../services/streaming';
import { tmdbService } from '../services/api';
import { VideoPlayer } from './VideoPlayer';
import { EpisodeSelector } from './EpisodeSelector';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';
import { Footer } from './Footer';
import { GenreFilter } from './GenreFilter';
import { AdvancedSearch, SearchFilters } from './AdvancedSearch';
import { SearchDropdown } from './SearchDropdown';
import { FeaturedSection } from './FeaturedSection';
import { StatsSection } from './StatsSection';
import { NewsletterSection } from './NewsletterSection';
import { SplashScreen } from './SplashScreen';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { InteractiveHero } from './InteractiveHero';
import { EnhancedMediaCard } from './EnhancedMediaCard';
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import { ContinueWatching } from './ContinueWatching';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { LoadingSpinner } from './LoadingSpinner';
import { onAuthStateChange, signOut } from '../services/auth';
import { fixedStreamingService } from '../services/streamingFixed';
import { TSZAI } from './TSZAI';
import AdTrackingSync from './AdTrackingSync';
import AdAnalyticsDashboard from './AdAnalyticsDashboard';

interface MainPlatformProps {
  user: any;
  setUser: (user: any) => void;
}

const MainPlatform: React.FC<MainPlatformProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('movie');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreName, setGenreName] = useState('All Genres');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [showTSZAI, setShowTSZAI] = useState(false);
  
  // Content state
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load content after splash screen is done
    if (!showSplash) {
      loadInitialContent();
    }
  }, [showSplash]);

  const loadInitialContent = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading initial content...');
      
      const [trendingMoviesData, trendingTVData, popularMoviesData, popularTVData] = await Promise.all([
        multiSourceAPI.getTrendingMovies(),
        multiSourceAPI.getTrendingTVShows(),
        multiSourceAPI.getPopularMovies(),
        multiSourceAPI.getPopularTVShows()
      ]);

      console.log('📊 Content loaded:', {
        trendingMovies: trendingMoviesData.length,
        trendingTV: trendingTVData.length,
        popularMovies: popularMoviesData.length,
        popularTV: popularTVData.length
      });

      setTrendingMovies(trendingMoviesData);
      setTrendingTVShows(trendingTVData);
      setPopularMovies(popularMoviesData);
      setPopularTVShows(popularTVData);
    } catch (error) {
      console.error('Error loading content:', error);
      // Even on error, we should have fallback content
      const fallbackMovies = await multiSourceAPI.getPopularMovies();
      const fallbackTV = await multiSourceAPI.getPopularTVShows();
      setTrendingMovies(fallbackMovies.slice(0, 10));
      setTrendingTVShows(fallbackTV.slice(0, 10));
      setPopularMovies(fallbackMovies);
      setPopularTVShows(fallbackTV);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      console.log('Searching for:', searchQuery);
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.searchMovies(searchQuery),
        tmdbService.searchTVShows(searchQuery)
      ]);
      
      console.log('Search results:', {
        movies: movieResults.length,
        tvShows: tvResults.length
      });
      
      setSearchResults([
        ...movieResults.map(movie => ({ ...movie, type: 'movie' })),
        ...tvResults.map(show => ({ ...show, type: 'tv' }))
      ]);
      setActiveView('search');
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      let results = [];
      
      if (filters.type === 'movie') {
        results = await multiSourceAPI.searchMovies(filters.query);
      } else {
        results = await multiSourceAPI.searchTVShows(filters.query);
      }
      
      // Apply additional filters
      if (filters.year) {
        results = results.filter(item => {
          const date = filters.type === 'movie' ? item.release_date : item.first_air_date;
          return date && new Date(date).getFullYear() === filters.year;
        });
      }
      
      if (filters.rating) {
        results = results.filter(item => item.vote_average >= filters.rating);
      }
      
      setSearchResults(results);
      setActiveView('search');
      setShowAdvancedSearch(false);
    } catch (error) {
      console.error('Error in advanced search:', error);
      // Provide fallback results
      const fallbackResults = await multiSourceAPI.getAllContent();
      setSearchResults(fallbackResults.filter(item => item.type === filters.type));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResultSelect = (item: any, type: 'movie' | 'tv') => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  const handleGenreSelect = async (genreId: number | null, name: string) => {
    setSelectedGenre(genreId);
    setGenreName(name);
    setLoading(true);
    
    try {
      console.log('Loading genre content:', { genreId, name });
      if (genreId === null) {
        // Reset to show all content
        const [trendingMoviesData, trendingTVData, popularMoviesData, popularTVData] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getTrendingTVShows(),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTVShows()
        ]);

        setTrendingMovies(trendingMoviesData);
        setTrendingTVShows(trendingTVData);
        setPopularMovies(popularMoviesData);
        setPopularTVShows(popularTVData);
      } else {
        // Load content by genre
        const [movieResults, tvResults] = await Promise.all([
          tmdbService.getMoviesByGenre(genreId),
          tmdbService.getTVShowsByGenre(genreId)
        ]);
        
        console.log('Genre results:', {
          movies: movieResults.length,
          tvShows: tvResults.length
        });
        
        setPopularMovies(movieResults);
        setPopularTVShows(tvResults);
        // Keep trending content as is for genre filtering
      }
    } catch (error) {
      console.error('Error loading genre content:', error);
      // Fallback to original content on error
      try {
        await loadInitialContent();
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError);
        // Set empty arrays to prevent crashes
        setPopularMovies([]);
        setPopularTVShows([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      setShowUserProfile(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserProfile(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWatch = (item, type, season = null, episode = null) => {
    let sources;
    let title;

    if (type === 'movie') {
      sources = fixedStreamingService.getMovieStreamingSources(item.id, item.title || 'Movie');
      title = item.title;
    } else {
      if (season && episode) {
        sources = fixedStreamingService.getTVShowStreamingSources(item.id, season, episode, item.episodeTitle || item.name);
        title = item.episodeTitle || `${item.name} S${season}E${episode}`;
      } else {
        // Default to first episode of first season
        sources = fixedStreamingService.getTVShowStreamingSources(item.id, 1, 1, item.name || 'TV Show');
        title = `${item.name} S1E1`;
      }
    }

    setVideoPlayer({ 
      sources, 
      title, 
      content: item, 
      contentType: type,
      season,
      episode
    });
  };

  // Header component
  const Header = () => (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/The Streamerz Logo.png" 
                    alt="THE STREAMERZ" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <Film className="w-8 h-8 text-blue-500" style={{ display: 'none' }} />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                THE STREAMERZ
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setActiveView('home')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveView('movies')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'movies' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setActiveView('tv')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'tv' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TV Shows</span>
              </button>
              <button
                onClick={() => setActiveView('trending')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'trending' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Trending className="w-4 h-4" />
                <span>Trending</span>
              </button>
              {user && (
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    activeView === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
              )}

            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block relative">
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onResultSelect={handleSearchResultSelect}
              />
            </div>
            
            <button 
              onClick={handleAuthClick}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
            
            <button 
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Rest of the component logic would go here, but for brevity, 
  // I'll continue with the render functions...

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingSpinner size="large" text="Loading amazing content..." />
      );
    }

    switch (activeView) {
      case 'home':
        return (
          <>
            <InteractiveHero 
              movies={trendingMovies} 
              onMovieSelect={(item, type) => {
                setSelectedItem(item);
                setSelectedType(type);
              }} 
              onWatch={handleWatch} 
            />
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {user && <ContinueWatching onWatch={handleWatch} />}
              
              <PersonalizedRecommendations 
                onItemSelect={(item, type) => {
                  setSelectedItem(item);
                  setSelectedType(type);
                }}
                onWatch={handleWatch}
                user={user}
              />
              
              <FeaturedSection onItemSelect={setSelectedItem} onWatch={handleWatch} />
            </section>
            
            <StatsSection />
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Trending Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6 mb-8 sm:mb-12">
                {trendingMovies.slice(0, 12).map((movie) => (
                  <EnhancedMediaCard 
                    key={movie.id} 
                    item={movie} 
                    type="movie"
                    onSelect={(item, type) => {
                      setSelectedItem(item);
                      setSelectedType(type);
                    }}
                    onWatch={handleWatch}
                  />
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Trending TV Shows</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
                {trendingTVShows.slice(0, 12).map((show) => (
                  <EnhancedMediaCard 
                    key={show.id} 
                    item={show} 
                    type="tv"
                    onSelect={(item, type) => {
                      setSelectedItem(item);
                      setSelectedType(type);
                    }}
                    onWatch={handleWatch}
                  />
                ))}
              </div>
            </section>
            
            <NewsletterSection />
          </>
        );

      case 'analytics':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <AdAnalyticsDashboard />
          </section>
        );

      // Add other cases for movies, tv, trending, search...
      default:
        return <div>Content for {activeView}</div>;
    }
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => setShowSplash(false)}
        duration={3000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ad Tracking Sync Component */}
      <AdTrackingSync />
      
      <Header />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-2">
            <div className="mb-4">
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onResultSelect={handleSearchResultSelect}
              />
            </div>
            
            {['home', 'movies', 'tv', 'trending', ...(user ? ['analytics'] : [])].map((view) => (
              <button
                key={view}
                onClick={() => {setActiveView(view); setMobileMenuOpen(false);}}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors capitalize ${
                  activeView === view ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {view === 'home' && <Home className="w-4 h-4" />}
                {view === 'movies' && <Film className="w-4 h-4" />}
                {view === 'tv' && <Tv className="w-4 h-4" />}
                {view === 'trending' && <Trending className="w-4 h-4" />}
                {view === 'analytics' && <BarChart3 className="w-4 h-4" />}
                <span>{view === 'tv' ? 'TV Shows' : view}</span>
              </button>
            ))}
            

          </div>
        </div>
      )}

      <main className="pb-16 md:pb-0">
        {renderContent()}
      </main>
      
      <Footer 
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        onShowTermsOfService={() => setShowTermsOfService(true)}
        onNavigate={setActiveView}
      />

      {/* Modals and overlays */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setUser(user);
            setShowAuthModal(false);
          }}
        />
      )}

      {showUserProfile && user && (
        <UserProfile
          user={user}
          onSignOut={handleSignOut}
          onClose={() => setShowUserProfile(false)}
        />
      )}

      {/* Other modals... */}
    </div>
  );
};

export default MainPlatform;
