import React, { useState, useEffect } from 'react';
import { Menu, X, Star, Play, Plus, Heart, User, TrendingUp as Trending, Film, Home, Tv, Calendar, Clock, Filter as FilterIcon, Settings } from 'lucide-react';
import { AnimatedLogo } from './components/AnimatedLogo';
import { tmdbService, Movie, TVShow, Genre } from './services/api';
import { streamingService, StreamingSource } from './services/streaming';
import { VideoPlayer } from './components/VideoPlayer';
import { EpisodeSelector } from './components/EpisodeSelector';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { Footer } from './components/Footer';
import { GenreFilter } from './components/GenreFilter';
import { AdvancedSearch, SearchFilters } from './components/AdvancedSearch';
import { SearchDropdown } from './components/SearchDropdown';
import { FeaturedSection } from './components/FeaturedSection';
import { StatsSection } from './components/StatsSection';
import { NewsletterSection } from './components/NewsletterSection';
import { SplashScreen } from './components/SplashScreen';
import { onAuthStateChange, signOut } from './services/auth';

const Header = ({ activeView, setActiveView, searchQuery, setSearchQuery, mobileMenuOpen, setMobileMenuOpen, onSearch, onAdvancedSearch, onSearchResultSelect, user, onAuthClick }) => (
  <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <AnimatedLogo size="medium" animate={true} showText={true} />
          
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
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block relative">
            <SearchDropdown
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={onSearch}
              onResultSelect={onSearchResultSelect}
            />
          </div>
          
          <button 
            onClick={onAuthClick}
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

const MediaCard = ({ item, type, onSelect, onWatch }) => {
  const title = type === 'movie' ? item.title : item.name;
  const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  
  return (
    <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
      <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-xl">
        <img 
          src={tmdbService.getImageUrl(item.poster_path, 'w500')} 
          alt={title}
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
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
                  onSelect(item, type);
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
        
        {item.trending && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Trending
          </div>
        )}
      </div>
    </div>
  );
};

const MediaDetails = ({ item, type, onClose, onWatch }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const detailsData = type === 'movie' 
          ? await tmdbService.getMovieDetails(item.id)
          : await tmdbService.getTVShowDetails(item.id);
        setDetails(detailsData);
      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [item.id, type]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!details) return null;

  const title = type === 'movie' ? details.title : details.name;
  const releaseDate = type === 'movie' ? details.release_date : details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const runtime = type === 'movie' ? `${details.runtime} min` : `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? 's' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl max-w-6xl w-full overflow-hidden">
          <div className="relative">
            <img 
              src={tmdbService.getImageUrl(details.backdrop_path, 'w1280')} 
              alt={title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="absolute bottom-4 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>{year}</span>
                <span>•</span>
                <span>{runtime}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{details.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {details.genres?.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
            
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{details.overview}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-white font-semibold mb-2">
                  {type === 'movie' ? 'Director' : 'Creator'}
                </h3>
                <p className="text-gray-300">{details.director || details.creator || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Cast</h3>
                <p className="text-gray-300">
                  {details.cast?.slice(0, 3).map(actor => actor.name).join(", ") || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={() => onWatch(details, type)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Watch Now</span>
              </button>
              {details.videos?.length > 0 && (
                <button 
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${details.videos[0].key}`, '_blank')}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Trailer</span>
                </button>
              )}
              <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add to Watchlist</span>
              </button>
              <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
                <span>Favorite</span>
              </button>
            </div>

            {/* Episode Selector for TV Shows */}
            {type === 'tv' && details.number_of_seasons && (
              <EpisodeSelector
                showId={details.id}
                showTitle={title}
                totalSeasons={details.number_of_seasons}
                onEpisodeSelect={(season, episode, episodeTitle) => {
                  const sources = streamingService.getTVShowStreamingSources(details.id, season, episode, episodeTitle);
                  onWatch({ ...details, sources, episodeTitle }, 'tv', season, episode);
                }}
              />
            )}

            {/* Similar Content */}
            {details.similar?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Similar {type === 'movie' ? 'Movies' : 'TV Shows'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {details.similar.slice(0, 6).map((similar) => (
                    <div key={similar.id} className="cursor-pointer group">
                      <img 
                        src={tmdbService.getImageUrl(similar.poster_path, 'w300')} 
                        alt={type === 'movie' ? similar.title : similar.name}
                        className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <p className="text-white text-sm mt-2 truncate">
                        {type === 'movie' ? similar.title : similar.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = ({ movies, onMovieSelect, onWatch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroMovies = movies.slice(0, 3);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  if (heroMovies.length === 0) return null;

  const currentMovie = heroMovies[currentSlide];

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      <img 
        src={tmdbService.getImageUrl(currentMovie.backdrop_path, 'w1280')} 
        alt={currentMovie.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {currentMovie.title}
            </h1>
            <p className="text-gray-200 text-lg mb-6 leading-relaxed line-clamp-3">
              {currentMovie.overview}
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => onWatch(currentMovie, 'movie')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Watch Now</span>
              </button>
              <button 
                onClick={() => onMovieSelect(currentMovie, 'movie')}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

function App() {
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
  const [user, setUser] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreName, setGenreName] = useState('All Genres');
  
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
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('Auth state changed:', authUser);
      setUser(authUser);
    });

    return () => unsubscribe();
  }, [showSplash]);

  const loadInitialContent = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.searchMovies(searchQuery),
        tmdbService.searchTVShows(searchQuery)
      ]);
      
      setSearchResults([
        ...movieResults.map(movie => ({ ...movie, type: 'movie' })),
        ...tvResults.map(show => ({ ...show, type: 'tv' }))
      ]);
      setActiveView('search');
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      let results = [];
      
      if (filters.type === 'movie') {
        results = await tmdbService.searchMovies(filters.query);
      } else {
        results = await tmdbService.searchTVShows(filters.query);
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
      
      setSearchResults(results.map(item => ({ ...item, type: filters.type })));
      setActiveView('search');
      setShowAdvancedSearch(false);
    } catch (error) {
      console.error('Error in advanced search:', error);
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
        
        setPopularMovies(movieResults);
        setPopularTVShows(tvResults);
        // Keep trending content as is for genre filtering
      }
    } catch (error) {
      console.error('Error loading genre content:', error);
      // Fallback to original content on error
      loadInitialContent();
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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWatch = (item, type, season = null, episode = null) => {
    let sources;
    let title;

    if (type === 'movie') {
      sources = streamingService.getMovieStreamingSources(item.id, item.title);
      title = item.title;
    } else {
      if (season && episode) {
        sources = streamingService.getTVShowStreamingSources(item.id, season, episode, item.episodeTitle || item.name);
        title = item.episodeTitle || `${item.name} S${season}E${episode}`;
      } else {
        // Default to first episode of first season
        sources = streamingService.getTVShowStreamingSources(item.id, 1, 1, item.name);
        title = `${item.name} S1E1`;
      }
    }

    setVideoPlayer({ sources, title });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'home':
        return (
          <>
            <HeroSection movies={trendingMovies} onMovieSelect={setSelectedItem} onWatch={handleWatch} />
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <FeaturedSection onItemSelect={setSelectedItem} onWatch={handleWatch} />
            </section>
            
            <StatsSection />
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-3xl font-bold text-white mb-8">Trending Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
                {trendingMovies.slice(0, 12).map((movie) => (
                  <MediaCard 
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

              <h2 className="text-3xl font-bold text-white mb-8">Trending TV Shows</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingTVShows.slice(0, 12).map((show) => (
                  <MediaCard 
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

      case 'movies':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                {selectedGenre ? `${genreName} Movies` : 'Popular Movies'}
              </h2>
              <GenreFilter
                onGenreSelect={handleGenreSelect}
                selectedGenre={selectedGenre}
                type="movie"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : popularMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularMovies.map((movie) => (
                <MediaCard 
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No movies found for {genreName}</p>
              </div>
            )}
          </section>
        );

      case 'tv':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                {selectedGenre ? `${genreName} TV Shows` : 'Popular TV Shows'}
              </h2>
              <GenreFilter
                onGenreSelect={handleGenreSelect}
                selectedGenre={selectedGenre}
                type="tv"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : popularTVShows.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularTVShows.map((show) => (
                <MediaCard 
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No TV shows found for {genreName}</p>
              </div>
            )}
          </section>
        );

      case 'trending':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-white mb-8">Trending Now</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...trendingMovies, ...trendingTVShows].map((item) => (
                <MediaCard 
                  key={`${item.id}-${item.title ? 'movie' : 'tv'}`} 
                  item={item} 
                  type={item.title ? 'movie' : 'tv'}
                  onSelect={(item, type) => {
                    setSelectedItem(item);
                    setSelectedType(type);
                  }}
                  onWatch={handleWatch}
                />
              ))}
            </div>
          </section>
        );

      case 'search':
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-400">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </p>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.map((item) => (
                  <MediaCard 
                    key={`${item.id}-${item.type}`} 
                    item={item} 
                    type={item.type}
                    onSelect={(item, type) => {
                      setSelectedItem(item);
                      setSelectedType(type);
                    }}
                    onWatch={handleWatch}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
              </div>
            )}
          </section>
        );

      default:
        return null;
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
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onSearch={handleSearch}
        onAdvancedSearch={() => setShowAdvancedSearch(true)}
        onSearchResultSelect={handleSearchResultSelect}
        user={user}
        onAuthClick={handleAuthClick}
      />

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
            
            {['home', 'movies', 'tv', 'trending'].map((view) => (
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
                <span>{view === 'tv' ? 'TV Shows' : view}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <main>
        {renderContent()}
      </main>
      
      <Footer />

      {selectedItem && (
        <MediaDetails 
          item={selectedItem} 
          type={selectedType}
          onClose={() => setSelectedItem(null)}
          onWatch={handleWatch}
        />
      )}

      {videoPlayer && (
        <VideoPlayer
          sources={videoPlayer.sources}
          title={videoPlayer.title}
          onClose={() => setVideoPlayer(null)}
        />
      )}

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
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
}

export default App;