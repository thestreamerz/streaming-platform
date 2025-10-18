import React, { useState, useEffect } from 'react';
import { Menu, X, Star, Play, Plus, Heart, User, TrendingUp as Trending, Film, Home, Tv, Calendar, Clock, Filter as FilterIcon, Settings, BarChart3, Sparkles, Radio } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { multiSourceAPI } from '../services/multiSourceAPI';
import { streamingService, StreamingSource } from '../services/streaming';
import { tmdbService } from '../services/api';
import { VideoPlayer } from './VideoPlayer';
import { EpisodeSelector } from './EpisodeSelector';
import { MediaDetails } from './MediaDetails';
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
import { enhancedStreamingService } from '../services/enhancedStreaming';
import { liveTVService } from '../services/liveTVService';
import { SZAI } from './SZAI';
import AdTrackingSync from './AdTrackingSync';
import AdSlot from './AdSlot';
import AdAnalyticsDashboard from './AdAnalyticsDashboard';
import LiveTVPage from './LiveTVPage';
import LiveTVPlayer from './LiveTVPlayer';

interface MainPlatformProps {
  user: any;
  setUser: (user: any) => void;
}

const MainPlatform: React.FC<MainPlatformProps> = ({ user, setUser }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('movie');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState(null);
  const [showMediaDetails, setShowMediaDetails] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'movie' | 'tv'>('movie');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreName, setGenreName] = useState('All Genres');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [showSZAI, setShowSZAI] = useState(false);
  const [showLiveTVPlayer, setShowLiveTVPlayer] = useState(false);
  const [selectedLiveTVChannel, setSelectedLiveTVChannel] = useState(null);
  
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

  // Hard kill any legacy ad banners injected by stale HTML or external scripts
  useEffect(() => {
    const removeAds = () => {
      try {
        const ids = ['ad-container'];
        const classes = ['ad-banner'];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el && el.parentElement) el.parentElement.removeChild(el);
        });
        classes.forEach(cls => {
          document.querySelectorAll(`.${cls}`).forEach(el => el.remove());
        });
        // Also neutralize known popunder creates if any leaked to window
        (window as any).triggerPopunder = () => {};
        (window as any).triggerSmartLink = () => {};

        // HARD BLOCK: third-party banner script variants
        // 1) Kill global atOptions used by invoke.js-based networks
        try {
          (window as any).atOptions = {};
        } catch {}

        // 2) Remove any scripts/iframes referencing sunkendifferextreme or invoke.js
        const badHosts = ['sunkendifferextreme.com','googlesyndication.com','doubleclick.net'];
        const badPaths = ['invoke.js'];
        document.querySelectorAll('script[src], iframe[src]').forEach((el: Element) => {
          const src = (el as HTMLScriptElement).src || (el as HTMLIFrameElement).src || '';
          if (badHosts.some(h => src.includes(h)) || badPaths.some(p => src.includes(p))) {
            el.parentElement?.removeChild(el);
          }
        });
        // 3) Remove common ad containers with precise selectors only
        const preciseSelectors = [
          'div[id^="aswift_"]',
          'ins.adsbygoogle'
        ];
        preciseSelectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => el.remove());
        });
      } catch {}
    };
    removeAds();
    // Keep a lightweight observer that only reacts to added scripts/iframes
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          removeAds();
          break;
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // Refresh streaming server health on mount (must be declared before any return)
  useEffect(() => {
    enhancedStreamingService.refreshServerHealth().catch(() => {});
  }, []);

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

  const handleSearchResultSelect = async (item: any, type: 'movie' | 'tv') => {
    // Always fetch full details so the modal (and episode selector) has seasons/genres/etc.
    try {
      let detailed: any = null;
      if (type === 'tv') {
        detailed = await tmdbService.getTVShowDetails(item.id);
      } else {
        detailed = await tmdbService.getMovieDetails(item.id);
      }
      setSelectedMedia(detailed || item);
      setSelectedMediaType(type);
      setShowMediaDetails(true);
    } catch (e) {
      // Fallback to original item
      setSelectedMedia(item);
      setSelectedMediaType(type);
      setShowMediaDetails(true);
    }
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

  // Open details modal with full TMDB data so seasons/genres are present
  const normalize = (s: string) => (s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[:\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const yearFrom = (v?: string) => {
    if (!v) return undefined;
    const y = parseInt(v.slice(0,4));
    return isNaN(y) ? undefined : y;
  };

  const tryFindTVByTitle = async (rawTitle: string, referenceYear?: number) => {
    if (!rawTitle) return null;
    const candidates = Array.from(new Set([
      rawTitle,
      rawTitle.split(':')[0],
      rawTitle.replace(/\([^)]*\)/g, '').trim(),
      rawTitle.replace(/[-–]/g, ' ').trim(),
    ].filter(Boolean)));
    for (const q of candidates) {
      try {
        const tvResults = await tmdbService.searchTVShows(q);
        const nq = normalize(q);
        let picked = tvResults.find((r: any) => normalize(r.name) === nq);
        if (!picked) {
          picked = tvResults.find((r: any) => normalize(r.name).includes(nq)) || tvResults[0];
        }
        if (referenceYear && picked) {
          // Prefer a candidate with a year close to the reference year
          const close = tvResults.find((r: any) => {
            const y = yearFrom(r.first_air_date);
            return y && Math.abs(y - referenceYear) <= 2 && normalize(r.name).includes(nq);
          });
          if (close) picked = close;
        }
        if (picked) {
          const tvDetails = await tmdbService.getTVShowDetails(picked.id);
          if (tvDetails && (tvDetails.seasons?.length || tvDetails.number_of_seasons)) {
            return tvDetails;
          }
        }
      } catch {}
    }
    return null;
  };

  const openDetails = async (item: any, type: 'movie' | 'tv') => {
    try {
      let detailed = item;
      let finalType = type;
      
      if (type === 'tv') {
        detailed = await tmdbService.getTVShowDetails(item.id) || item;
      } else {
        // For movies, get movie details and keep it as a movie
        detailed = await tmdbService.getMovieDetails(item.id) || item;
        finalType = 'movie'; // Ensure it stays as a movie
        
        // Only try TV fallback if the movie details are incomplete or invalid
        if (!detailed || !detailed.title || detailed.runtime === 0) {
          const title = item?.title || item?.name || '';
          const refYear = yearFrom(item?.release_date);
          let tvDetails = await tryFindTVByTitle(title, refYear);
          
          if (tvDetails && tvDetails.name) {
            detailed = tvDetails;
            finalType = 'tv';
          }
        }
      }
      
      setSelectedMedia(detailed);
      setSelectedMediaType(finalType);
      setShowMediaDetails(true);
    } catch (e) {
      console.error('Error opening details:', e);
      setSelectedMedia(item);
      setSelectedMediaType(type);
      setShowMediaDetails(true);
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
      sources = enhancedStreamingService.getMovieStreamingSources(item.id, item.title || 'Movie');
      title = item.title;
    } else {
      if (season && episode) {
        sources = enhancedStreamingService.getTVShowStreamingSources(item.id, season, episode, item.episodeTitle || item.name);
        title = item.episodeTitle || `${item.name} S${season}E${episode}`;
      } else {
        // Default to first episode of first season
        sources = enhancedStreamingService.getTVShowStreamingSources(item.id, 1, 1, item.name || 'TV Show');
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
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
                setShowMediaDetails(false);
                setSelectedMedia(null);
              }}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to Home"
            >
              <div className="relative">
                <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/The Streamerz Logo.png" 
                    alt="STREAMERZ" 
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
                STREAMERZ
              </span>
            </button>
            
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => {
                  setActiveView('home');
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`inline-flex items-center space-x-1 h-9 px-3 rounded-lg transition-colors ${
                  activeView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('movies');
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`inline-flex items-center space-x-1 h-9 px-3 rounded-lg transition-colors ${
                  activeView === 'movies' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movies</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('tv');
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`inline-flex items-center space-x-1 h-9 px-3 rounded-lg transition-colors ${
                  activeView === 'tv' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TV Shows</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('trending');
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`inline-flex items-center space-x-1 h-9 px-3 rounded-lg transition-colors ${
                  activeView === 'trending' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Trending className="w-4 h-4" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('live-tv');
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                  activeView === 'live-tv'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg hover:scale-105'
                }`}
                title="Live TV"
                aria-label="Live TV"
              >
                <Radio className="w-4 h-4" />
              </button>
              {user && (
                <button
                  onClick={() => {
                    setActiveView('analytics');
                    setMobileMenuOpen(false);
                    setShowMediaDetails(false);
                    setSelectedMedia(null);
                  }}
                  className={`inline-flex items-center space-x-1 h-9 px-3 rounded-lg transition-colors ${
                    activeView === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
              )}

            </nav>
          </div>

          <div className="flex items-center space-x-4 ml-6">
            <div className="hidden sm:block relative ml-3">
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onResultSelect={handleSearchResultSelect}
              />
            </div>
            
            <button 
              onClick={() => setShowSZAI(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Ask SZ AI"
              aria-label="Open AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            
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
              onMovieSelect={(item, type) => openDetails(item, type)} 
              onWatch={handleWatch} 
            />
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {user && <ContinueWatching onWatch={handleWatch} />}
              
              <PersonalizedRecommendations 
                onItemSelect={(item, type) => openDetails(item, type)}
                onWatch={handleWatch}
                user={user}
              />
              
              <FeaturedSection 
                onItemSelect={(item, type) => openDetails(item, type)} 
                onWatch={handleWatch} 
              />
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
                    onSelect={openDetails}
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
                    onSelect={openDetails}
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

      case 'movies':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Movies</h1>
              <div className="flex items-center space-x-4">
                <GenreFilter 
                  onGenreSelect={handleGenreSelect}
                  selectedGenre={selectedGenre}
                  genreName={genreName}
                />
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FilterIcon className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
              {popularMovies.map((movie) => (
                <EnhancedMediaCard 
                  key={movie.id} 
                  item={movie} 
                  type="movie"
                  onSelect={openDetails}
                  onWatch={handleWatch}
                />
              ))}
            </div>
          </section>
        );

      case 'tv':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">TV Shows</h1>
              <div className="flex items-center space-x-4">
                <GenreFilter 
                  onGenreSelect={handleGenreSelect}
                  selectedGenre={selectedGenre}
                  genreName={genreName}
                />
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FilterIcon className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
              {popularTVShows.map((show) => (
                <EnhancedMediaCard 
                  key={show.id} 
                  item={show} 
                  type="tv"
                  onSelect={openDetails}
                  onWatch={handleWatch}
                />
              ))}
            </div>
          </section>
        );

      case 'trending':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Trending Now</h1>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Trending Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
                {trendingMovies.map((movie) => (
                  <EnhancedMediaCard 
                    key={movie.id} 
                    item={movie} 
                    type="movie"
                    onSelect={openDetails}
                    onWatch={handleWatch}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Trending TV Shows</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
                {trendingTVShows.map((show) => (
                  <EnhancedMediaCard 
                    key={show.id} 
                    item={show} 
                    type="tv"
                    onSelect={openDetails}
                    onWatch={handleWatch}
                  />
                ))}
              </div>
            </div>
          </section>
        );

      case 'live-tv':
        return (
          <LiveTVPage 
            onChannelSelect={(channel) => {
              console.log('Selected channel:', channel);
              // Open Live TV player in fullscreen
              setShowLiveTVPlayer(true);
              setSelectedLiveTVChannel(channel);
            }}
          />
        );

      case 'search':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Search Results for "{searchQuery}"
              </h1>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Advanced Search</span>
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
                {searchResults.map((item) => (
                  <EnhancedMediaCard 
                    key={`${item.type}-${item.id}`} 
                    item={{
                      ...item,
                      // Ensure the card knows the type, even if TMDB returns ambiguous hits
                      type: item.type,
                    }} 
                    type={item.type as 'movie' | 'tv'}
                    onSelect={openDetails}
                    onWatch={handleWatch}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No results found</div>
                <p className="text-gray-500">Try adjusting your search terms or use advanced filters</p>
              </div>
            )}
          </section>
        );

      default:
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
              <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
              <button
                onClick={() => setActiveView('home')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </section>
        );
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

      {/* Optional banner (sandboxed). Remove/comment to disable. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 hidden">
        <AdSlot src="//sunkendifferextreme.com/7a/e6/28/7ae628ab1566dfc5ffc9c6efbc9fed77.js" height={60} />
      </div>

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
            
            {['home', 'movies', 'tv', 'trending', 'live-tv', ...(user ? ['analytics'] : [])].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view); 
                  setMobileMenuOpen(false);
                  setShowMediaDetails(false);
                  setSelectedMedia(null);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors capitalize ${
                  activeView === view ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {view === 'home' && <Home className="w-4 h-4" />}
                {view === 'movies' && <Film className="w-4 h-4" />}
                {view === 'tv' && <Tv className="w-4 h-4" />}
                {view === 'trending' && <Trending className="w-4 h-4" />}
                {view === 'live-tv' && <Radio className="w-4 h-4" />}
                {view === 'analytics' && <BarChart3 className="w-4 h-4" />}
                <span className={view === 'live-tv' ? 'text-red-500 font-bold' : ''}>{view === 'tv' ? 'TV Shows' : view}</span>
              </button>
            ))}
            

          </div>
        </div>
      )}

      <main className="pb-16 md:pb-0">
        {renderContent()}
      </main>
      
      {/* Floating AI Assistant button */}
      <button
        onClick={() => setShowSZAI(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title="Ask SZ AI"
        aria-label="Ask SZ AI"
      >
        <Sparkles className="w-5 h-5" />
      </button>
      
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

      {showAdvancedSearch && (
        <AdvancedSearch
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onSearch={handleAdvancedSearch}
        />
      )}

      {showPrivacyPolicy && (
        <PrivacyPolicy
          isOpen={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      )}

      {showTermsOfService && (
        <TermsOfService
          isOpen={showTermsOfService}
          onClose={() => setShowTermsOfService(false)}
        />
      )}

      {showSZAI && (
        <SZAI
          isOpen={showSZAI}
          onClose={() => setShowSZAI(false)}
          movies={[...trendingMovies, ...popularMovies]}
          tvShows={[...trendingTVShows, ...popularTVShows]}
        />
      )}

      {showMediaDetails && selectedMedia && (
        <MediaDetails
          isOpen={showMediaDetails}
          onClose={() => {
            setShowMediaDetails(false);
            setSelectedMedia(null);
          }}
          content={selectedMedia}
          contentType={selectedMediaType}
          onWatch={(season, episode) => {
            handleWatch(selectedMedia, selectedMediaType, season, episode);
            setShowMediaDetails(false);
            setSelectedMedia(null);
          }}
          user={user}
        />
      )}

      {videoPlayer && (
        <VideoPlayer
          sources={videoPlayer.sources}
          title={videoPlayer.title}
          onClose={() => setVideoPlayer(null)}
          content={videoPlayer.content}
          contentType={videoPlayer.contentType}
          season={videoPlayer.season}
          episode={videoPlayer.episode}
          onNavigate={(view) => {
            console.log('Navigating to:', view);
            setActiveView(view);
            setVideoPlayer(null); // Close video player
            setMobileMenuOpen(false);
            setShowMediaDetails(false);
            setSelectedMedia(null);
          }}
        />
      )}

      {/* Live TV Player */}
      {showLiveTVPlayer && selectedLiveTVChannel && (
        <LiveTVPlayer
          channel={selectedLiveTVChannel}
          streamUrl={liveTVService.getChannelStreamUrl(selectedLiveTVChannel.id)}
          onClose={() => {
            setShowLiveTVPlayer(false);
            setSelectedLiveTVChannel(null);
          }}
        />
      )}
    </div>
  );
};

export default MainPlatform;
