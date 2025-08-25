// Multi-source content service inspired by watchug.to
import { tmdbService } from './api';

// Working fallback content when APIs fail
const FALLBACK_MOVIES = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop&auto=format",
    release_date: "1994-09-23",
    vote_average: 9.3,
    genre_ids: [18],
    type: 'movie'
  },
  {
    id: 2,
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=1280&h=720&fit=crop&auto=format",
    release_date: "1972-03-24",
    vote_average: 9.2,
    genre_ids: [18, 80],
    type: 'movie'
  },
  {
    id: 3,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop&auto=format",
    release_date: "2008-07-18",
    vote_average: 9.0,
    genre_ids: [28, 80, 18],
    type: 'movie'
  },
  {
    id: 4,
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop&auto=format",
    release_date: "1994-10-14",
    vote_average: 8.9,
    genre_ids: [80, 53],
    type: 'movie'
  },
  {
    id: 5,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=1280&h=720&fit=crop&auto=format",
    release_date: "1999-10-15",
    vote_average: 8.8,
    genre_ids: [18],
    type: 'movie'
  }
];

const FALLBACK_TV_SHOWS = [
  {
    id: 1,
    name: "Breaking Bad",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop&auto=format",
    first_air_date: "2008-01-20",
    vote_average: 9.5,
    genre_ids: [18, 80],
    type: 'tv'
  },
  {
    id: 2,
    name: "Game of Thrones",
    overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    poster_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop&auto=format",
    first_air_date: "2011-04-17",
    vote_average: 9.3,
    genre_ids: [18, 10765, 10759],
    type: 'tv'
  },
  {
    id: 3,
    name: "Stranger Things",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
    poster_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop&auto=format",
    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop&auto=format",
    first_air_date: "2016-07-15",
    vote_average: 8.7,
    genre_ids: [18, 10765, 9648],
    type: 'tv'
  }
];

interface ContentSource {
  name: string;
  baseUrl: string;
  apiKey?: string;
  priority: number;
}

interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  type: 'movie' | 'tv';
  trending?: boolean;
}

class ContentService {
  private sources: ContentSource[] = [
    {
      name: 'TMDB',
      baseUrl: 'https://api.themoviedb.org/3',
      apiKey: '8265bd1679663a7ea12ac168da84d2e8',
      priority: 1
    },
    {
      name: 'OMDB',
      baseUrl: 'https://www.omdbapi.com',
      apiKey: 'b8b1e6d7', // Free API key
      priority: 2
    }
  ];

  private cdnSources = [
    'https://image.tmdb.org/t/p',
    'https://img.omdbapi.com',
    'https://m.media-amazon.com/images/M'
  ];

  private cache = new Map();
  private fallbackContent = this.generateFallbackContent();

  // Generate comprehensive fallback content
  private generateFallbackContent(): ContentItem[] {
    return [
      {
        id: 1,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=1280&h=720&fit=crop",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre_ids: [18],
        type: 'movie' as const,
        trending: true
      },
      {
        id: 2,
        title: "The Dark Knight",
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        poster_path: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1280&h=720&fit=crop",
        release_date: "2008-07-18",
        vote_average: 9.0,
        genre_ids: [28, 80, 18],
        type: 'movie' as const,
        trending: true
      },
      {
        id: 3,
        title: "Inception",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop",
        release_date: "2010-07-16",
        vote_average: 8.8,
        genre_ids: [28, 878, 53],
        type: 'movie' as const,
        trending: true
      },
      {
        id: 4,
        title: "Pulp Fiction",
        overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        poster_path: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1280&h=720&fit=crop",
        release_date: "1994-10-14",
        vote_average: 8.9,
        genre_ids: [80, 18],
        type: 'movie' as const
      },
      {
        id: 5,
        title: "The Matrix",
        overview: "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
        poster_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop",
        release_date: "1999-03-31",
        vote_average: 8.7,
        genre_ids: [28, 878],
        type: 'movie' as const
      },
      {
        id: 6,
        title: "Forrest Gump",
        overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man.",
        poster_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1280&h=720&fit=crop",
        release_date: "1994-07-06",
        vote_average: 8.8,
        genre_ids: [18, 10749],
        type: 'movie' as const
      },
      {
        id: 101,
        name: "Breaking Bad",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        poster_path: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1280&h=720&fit=crop",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
        genre_ids: [18, 80],
        type: 'tv' as const,
        trending: true
      },
      {
        id: 102,
        name: "Stranger Things",
        overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        poster_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1280&h=720&fit=crop",
        first_air_date: "2016-07-15",
        vote_average: 8.7,
        genre_ids: [18, 10765, 9648],
        type: 'tv' as const,
        trending: true
      },
      {
        id: 103,
        name: "Game of Thrones",
        overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        poster_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1280&h=720&fit=crop",
        first_air_date: "2011-04-17",
        vote_average: 9.3,
        genre_ids: [18, 10765, 10759],
        type: 'tv' as const,
        trending: true
      },
      {
        id: 104,
        name: "The Office",
        overview: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
        poster_path: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1280&h=720&fit=crop",
        first_air_date: "2005-03-24",
        vote_average: 8.9,
        genre_ids: [35],
        type: 'tv' as const
      },
      {
        id: 105,
        name: "Friends",
        overview: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.",
        poster_path: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1280&h=720&fit=crop",
        first_air_date: "1994-09-22",
        vote_average: 8.9,
        genre_ids: [35, 18],
        type: 'tv' as const
      },
      {
        id: 106,
        name: "The Crown",
        overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
        poster_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=750&fit=crop",
        backdrop_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=720&fit=crop",
        first_air_date: "2016-11-04",
        vote_average: 8.6,
        genre_ids: [18, 36],
        type: 'tv' as const
      }
    ];
  }

  // Enhanced fetch with multiple source fallback and better error handling
  private async fetchWithFallback(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('🎯 Cache hit for:', endpoint);
      return this.cache.get(cacheKey);
    }

    // Try each source in priority order with improved error handling
    for (const source of this.sources) {
      try {
        console.log(`🔄 Trying ${source.name} for:`, endpoint);
        
        const url = new URL(`${source.baseUrl}${endpoint}`);
        if (source.apiKey) {
          url.searchParams.append('api_key', source.apiKey);
        }
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'THE STREAMERZ/2.0',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate response data
        if (data && (data.results || data.genres || data.id)) {
          console.log(`✅ Success with ${source.name}:`, data);
          
          // Cache successful response
          this.cache.set(cacheKey, data);
          return data;
        } else {
          throw new Error('Invalid response format');
        }

      } catch (error: any) {
        console.warn(`❌ ${source.name} failed:`, error.message);
        continue;
      }
    }

    console.warn('🚨 All sources failed, using fallback');
    return { results: [], genres: [] };
  }

  // Get image URL with enhanced CDN fallback
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) {
      return `https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=${size.replace('w', '')}&h=${Math.floor(parseInt(size.replace('w', '')) * 1.5)}&fit=crop&auto=format`;
    }

    // Try TMDB first
    if (path.startsWith('/')) {
      return `${this.cdnSources[0]}/${size}${path}`;
    }

    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }

    // Enhanced fallback to placeholder
    return `https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=${size.replace('w', '')}&h=${Math.floor(parseInt(size.replace('w', '')) * 1.5)}&fit=crop&auto=format`;
  }

  // Get trending movies with enhanced fallback
  async getTrendingMovies(): Promise<any[]> {
    try {
      const movies = await tmdbService.getTrendingMovies();
      if (movies && movies.length > 0) {
        return movies.map(movie => ({ ...movie, type: 'movie' }));
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
    
    // Return enhanced fallback content
    console.log('Using enhanced fallback trending movies');
    return FALLBACK_MOVIES.map(movie => ({ ...movie, trending: true }));
  }

  // Get trending TV shows with enhanced fallback
  async getTrendingTVShows(): Promise<any[]> {
    try {
      const shows = await tmdbService.getTrendingTVShows();
      if (shows && shows.length > 0) {
        return shows.map(show => ({ ...show, type: 'tv' }));
      }
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
    }
    
    // Return enhanced fallback content
    console.log('Using enhanced fallback trending TV shows');
    return FALLBACK_TV_SHOWS.map(show => ({ ...show, trending: true }));
  }

  // Get popular movies with enhanced fallback
  async getPopularMovies(): Promise<any[]> {
    try {
      const movies = await tmdbService.getPopularMovies();
      if (movies && movies.length > 0) {
        return movies.map(movie => ({ ...movie, type: 'movie' }));
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    }
    
    // Return enhanced fallback content
    console.log('Using enhanced fallback popular movies');
    return FALLBACK_MOVIES;
  }

  // Get popular TV shows with enhanced fallback
  async getPopularTVShows(): Promise<any[]> {
    try {
      const shows = await tmdbService.getPopularTVShows();
      if (shows && shows.length > 0) {
        return shows.map(show => ({ ...show, type: 'tv' }));
      }
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
    }
    
    // Return enhanced fallback content
    console.log('Using enhanced fallback popular TV shows');
    return FALLBACK_TV_SHOWS;
  }

  // Enhanced search with guaranteed results
  async searchMovies(query: string): Promise<ContentItem[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/movie', { query: query.trim() });
      const movies = (data.results || []).map((movie: any) => ({
        ...movie,
        type: 'movie' as const,
        overview: movie.overview || `Search result for "${query}"`,
        vote_average: movie.vote_average || 6.0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));

      if (movies.length > 0) {
        console.log('🔍 Found movies for search:', movies.length);
        return movies;
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    }

    // Return enhanced filtered fallback content for search
    console.log('🔍 Using enhanced fallback search results');
    return this.fallbackContent
      .filter(item => item.type === 'movie')
      .filter(item => 
        (item.title?.toLowerCase().includes(query.toLowerCase())) ||
        (item.overview?.toLowerCase().includes(query.toLowerCase()))
      );
  }

  // Enhanced search TV shows with guaranteed results
  async searchTVShows(query: string): Promise<ContentItem[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/tv', { query: query.trim() });
      const shows = (data.results || []).map((show: any) => ({
        ...show,
        type: 'tv' as const,
        overview: show.overview || `Search result for "${query}"`,
        vote_average: show.vote_average || 6.0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));

      if (shows.length > 0) {
        console.log('🔍 Found TV shows for search:', shows.length);
        return shows;
      }
    } catch (error) {
      console.error('Error searching TV shows:', error);
    }

    // Return enhanced filtered fallback content for search
    console.log('🔍 Using enhanced fallback search results');
    return this.fallbackContent
      .filter(item => item.type === 'tv')
      .filter(item => 
        (item.name?.toLowerCase().includes(query.toLowerCase())) ||
        (item.overview?.toLowerCase().includes(query.toLowerCase()))
      );
  }

  // Get all content (mixed) with enhanced fallback
  async getAllContent(): Promise<any[]> {
    try {
      const [trendingMovies, trendingTV, popularMovies, popularTV] = await Promise.all([
        this.getTrendingMovies(),
        this.getTrendingTVShows(),
        this.getPopularMovies(),
        this.getPopularTVShows()
      ]);

      const allContent = [
        ...trendingMovies.slice(0, 10),
        ...trendingTV.slice(0, 10),
        ...popularMovies.slice(0, 10),
        ...popularTV.slice(0, 10)
      ];

      if (allContent.length > 0) {
        console.log('Total content loaded:', allContent.length);
        return allContent;
      }
    } catch (error) {
      console.error('Error loading all content:', error);
    }

    // Return enhanced fallback content
    console.log('Using enhanced fallback all content');
    return [...FALLBACK_MOVIES, ...FALLBACK_TV_SHOWS];
  }

  // Enhanced cache management
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Test API connectivity
  async testAPIConnectivity(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const source of this.sources) {
      try {
        const testUrl = `${source.baseUrl}/configuration`;
        if (source.apiKey) {
          const url = new URL(testUrl);
          url.searchParams.append('api_key', source.apiKey);
          
          const response = await fetch(url.toString(), { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          results[source.name] = response.ok;
        } else {
          results[source.name] = false;
        }
      } catch (error) {
        results[source.name] = false;
      }
    }
    
    return results;
  }
}

export const contentService = new ContentService();
export type { ContentItem };