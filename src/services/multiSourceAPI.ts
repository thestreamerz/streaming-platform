// Multi-source API service inspired by watchug.to
export interface ContentSource {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  priority: number;
  timeout: number;
  active: boolean;
}

export interface CDNSource {
  id: string;
  name: string;
  baseUrl: string;
  priority: number;
  active: boolean;
}

export interface ServerOption {
  id: string;
  name: string;
  quality: string;
  type: 'primary' | 'backup' | 'premium';
  active: boolean;
}

class MultiSourceAPIService {
  private contentSources: ContentSource[] = [
    {
      id: 'tmdb-primary',
      name: 'TMDB Primary',
      baseUrl: 'https://api.themoviedb.org/3',
      apiKey: '8265bd1679663a7ea12ac168da84d2e8',
      priority: 1,
      timeout: 8000,
      active: true
    },
    {
      id: 'tmdb-backup',
      name: 'TMDB Backup',
      baseUrl: 'https://api.themoviedb.org/3',
      apiKey: 'b8e4e1d7c3f2a9b5e8d4c7f1a2b6e9d3',
      priority: 2,
      timeout: 10000,
      active: true
    },
    {
      id: 'omdb',
      name: 'OMDB',
      baseUrl: 'https://www.omdbapi.com',
      apiKey: 'b8b1e6d7',
      priority: 3,
      timeout: 12000,
      active: true
    },
    {
      id: 'tvmaze',
      name: 'TVMaze',
      baseUrl: 'https://api.tvmaze.com',
      priority: 4,
      timeout: 10000,
      active: true
    }
  ];

  private cdnSources: CDNSource[] = [
    {
      id: 'tmdb-images',
      name: 'TMDB Images',
      baseUrl: 'https://image.tmdb.org/t/p',
      priority: 1,
      active: true
    },
    {
      id: 'tmdb-backup',
      name: 'TMDB Backup',
      baseUrl: 'https://www.themoviedb.org/t/p',
      priority: 2,
      active: true
    },
    {
      id: 'unsplash',
      name: 'Unsplash',
      baseUrl: 'https://images.unsplash.com',
      priority: 3,
      active: true
    },
    {
      id: 'pexels',
      name: 'Pexels',
      baseUrl: 'https://images.pexels.com',
      priority: 4,
      active: true
    },
    {
      id: 'placeholder',
      name: 'Placeholder',
      baseUrl: 'https://via.placeholder.com',
      priority: 5,
      active: true
    }
  ];

  private serverOptions: ServerOption[] = [
    { id: 'alpha', name: 'Alpha', quality: 'HD', type: 'primary', active: true },
    { id: 'bravo', name: 'Bravo', quality: 'HD', type: 'primary', active: true },
    { id: 'charlie', name: 'Charlie', quality: 'HD', type: 'backup', active: true },
    { id: 'delta', name: 'Delta', quality: 'HD', type: 'backup', active: true },
    { id: 'echo', name: 'Echo', quality: 'HD', type: 'backup', active: true },
    { id: 'multi', name: 'Multi', quality: 'HD', type: 'premium', active: true },
    { id: '4k', name: '4K', quality: '4K', type: 'premium', active: true },
    { id: 'adfree', name: 'Ad Free', quality: 'HD', type: 'premium', active: true },
    { id: 'adfree-v2', name: 'Ad Free v2', quality: 'HD', type: 'premium', active: true }
  ];

  private cache = new Map<string, any>();
  private failedSources = new Set<string>();

  // Comprehensive fallback content
  private fallbackContent = {
    movies: [
      {
        id: 550,
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        backdrop_path: "/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
        release_date: "1999-10-15",
        vote_average: 8.4,
        genre_ids: [18, 53],
        type: 'movie'
      },
      {
        id: 13,
        title: "Forrest Gump",
        overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man.",
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        backdrop_path: "/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
        release_date: "1994-06-23",
        vote_average: 8.8,
        genre_ids: [35, 18, 10749],
        type: 'movie'
      },
      {
        id: 155,
        title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
        release_date: "2008-07-18",
        vote_average: 9.0,
        genre_ids: [18, 28, 80, 53],
        type: 'movie'
      },
      {
        id: 278,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        backdrop_path: "/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre_ids: [18, 80],
        type: 'movie'
      },
      {
        id: 680,
        title: "Pulp Fiction",
        overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
        release_date: "1994-10-14",
        vote_average: 8.9,
        genre_ids: [80, 18],
        type: 'movie'
      },
      {
        id: 424,
        title: "Schindler's List",
        overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives during the Holocaust.",
        poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
        backdrop_path: "/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
        release_date: "1993-12-15",
        vote_average: 9.0,
        genre_ids: [18, 36, 10752],
        type: 'movie'
      }
    ],
    tvShows: [
      {
        id: 1399,
        name: "Game of Thrones",
        overview: "Seven noble families fight for control of the mythical land of Westeros.",
        poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
        backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
        first_air_date: "2011-04-17",
        vote_average: 9.3,
        genre_ids: [18, 10765, 10759],
        type: 'tv'
      },
      {
        id: 1396,
        name: "Breaking Bad",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
        genre_ids: [18, 80],
        type: 'tv'
      },
      {
        id: 66732,
        name: "Stranger Things",
        overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
        first_air_date: "2016-07-15",
        vote_average: 8.7,
        genre_ids: [18, 10765, 9648],
        type: 'tv'
      },
      {
        id: 85271,
        name: "WandaVision",
        overview: "Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems.",
        poster_path: "/glKDfE6btIRcVB5zrjspRIs4r52.jpg",
        backdrop_path: "/57vVjteucIF3bGnZj6PmaoJRScw.jpg",
        first_air_date: "2021-01-15",
        vote_average: 8.2,
        genre_ids: [10765, 9648, 18],
        type: 'tv'
      },
      {
        id: 94605,
        name: "Arcane",
        overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
        poster_path: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
        backdrop_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg",
        first_air_date: "2021-11-06",
        vote_average: 9.0,
        genre_ids: [16, 18, 10765],
        type: 'tv'
      },
      {
        id: 60625,
        name: "Rick and Morty",
        overview: "A sociopathic scientist drags his unintelligent grandson on insanely dangerous adventures across the universe.",
        poster_path: "/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg",
        backdrop_path: "/eV3XnUul4UfIivz3kxgeIozeo50.jpg",
        first_air_date: "2013-12-02",
        vote_average: 8.7,
        genre_ids: [16, 35, 10765],
        type: 'tv'
      }
    ]
  };

  // Fetch with multiple source fallback
  private async fetchWithFallback(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('🎯 Cache hit for:', endpoint);
      return this.cache.get(cacheKey);
    }

    // Try each active source in priority order
    const activeSources = this.contentSources
      .filter(source => source.active && !this.failedSources.has(source.id))
      .sort((a, b) => a.priority - b.priority);

    for (const source of activeSources) {
      try {
        console.log(`🔄 Trying ${source.name} for:`, endpoint);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), source.timeout);

        const url = new URL(`${source.baseUrl}${endpoint}`);
        if (source.apiKey) {
          url.searchParams.append('api_key', source.apiKey);
        }
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });

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
        console.log(`✅ Success with ${source.name}:`, data);
        
        // Cache successful response
        this.cache.set(cacheKey, data);
        
        // Remove from failed sources if it was there
        this.failedSources.delete(source.id);
        
        return data;

      } catch (error) {
        console.warn(`❌ ${source.name} failed:`, error.message);
        
        // Mark source as failed temporarily
        this.failedSources.add(source.id);
        
        // Remove failed sources after 5 minutes
        setTimeout(() => {
          this.failedSources.delete(source.id);
        }, 300000);
        
        continue;
      }
    }

    console.warn('🚨 All sources failed, using fallback');
    return { results: [], genres: [] };
  }

  // Get image URL with multiple CDN fallback
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) {
      return this.getPlaceholderImage(size);
    }

    const activeCDNs = this.cdnSources
      .filter(cdn => cdn.active)
      .sort((a, b) => a.priority - b.priority);

    // Try TMDB first
    if (path.startsWith('/')) {
      for (const cdn of activeCDNs) {
        if (cdn.id.includes('tmdb')) {
          return `${cdn.baseUrl}/${size}${path}`;
        }
      }
    }

    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }

    // Fallback to placeholder
    return this.getPlaceholderImage(size);
  }

  private getPlaceholderImage(size: string): string {
    const width = parseInt(size.replace('w', ''));
    const height = Math.floor(width * 1.5);
    
    const placeholders = [
      `https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=${width}&h=${height}&fit=crop&auto=format`,
      `https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=${width}&h=${height}&fit=crop&auto=format`,
      `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=${width}&h=${height}&fit=crop&auto=format`,
      `https://via.placeholder.com/${width}x${height}/1e293b/64748b?text=Movie+Poster`
    ];

    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  // Get trending movies with guaranteed content
  async getTrendingMovies(): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/trending/movie/week');
      const movies = (data.results || []).map((movie: any) => ({
        ...movie,
        type: 'movie',
        trending: true,
        overview: movie.overview || 'An exciting movie experience awaits you.',
        vote_average: movie.vote_average || 7.5,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));

      if (movies.length > 0) {
        console.log('📽️ Loaded trending movies:', movies.length);
        return movies;
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }

    console.log('🎬 Using fallback trending movies');
    return this.fallbackContent.movies.map(movie => ({ ...movie, trending: true }));
  }

  // Get trending TV shows with guaranteed content
  async getTrendingTVShows(): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/trending/tv/week');
      const shows = (data.results || []).map((show: any) => ({
        ...show,
        type: 'tv',
        trending: true,
        overview: show.overview || 'An amazing TV series you will love.',
        vote_average: show.vote_average || 7.5,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));

      if (shows.length > 0) {
        console.log('📺 Loaded trending TV shows:', shows.length);
        return shows;
      }
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
    }

    console.log('📺 Using fallback trending TV shows');
    return this.fallbackContent.tvShows.map(show => ({ ...show, trending: true }));
  }

  // Get popular movies with guaranteed content
  async getPopularMovies(): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/movie/popular');
      const movies = (data.results || []).map((movie: any) => ({
        ...movie,
        type: 'movie',
        overview: movie.overview || 'A popular movie that audiences love.',
        vote_average: movie.vote_average || 7.0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));

      if (movies.length > 0) {
        console.log('🎭 Loaded popular movies:', movies.length);
        return movies;
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    }

    console.log('🎭 Using fallback popular movies');
    return this.fallbackContent.movies;
  }

  // Get popular TV shows with guaranteed content
  async getPopularTVShows(): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/tv/popular');
      const shows = (data.results || []).map((show: any) => ({
        ...show,
        type: 'tv',
        overview: show.overview || 'A popular TV series with great ratings.',
        vote_average: show.vote_average || 7.0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));

      if (shows.length > 0) {
        console.log('📻 Loaded popular TV shows:', shows.length);
        return shows;
      }
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
    }

    console.log('📻 Using fallback popular TV shows');
    return this.fallbackContent.tvShows;
  }

  // Search with guaranteed results
  async searchMovies(query: string): Promise<any[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/movie', { query: query.trim() });
      const movies = (data.results || []).map((movie: any) => ({
        ...movie,
        type: 'movie',
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

    // Return filtered fallback content for search
    console.log('🔍 Using fallback search results');
    return this.fallbackContent.movies
      .filter(item => 
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.overview?.toLowerCase().includes(query.toLowerCase())
      );
  }

  // Search TV shows with guaranteed results
  async searchTVShows(query: string): Promise<any[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/tv', { query: query.trim() });
      const shows = (data.results || []).map((show: any) => ({
        ...show,
        type: 'tv',
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

    // Return filtered fallback content for search
    console.log('🔍 Using fallback search results');
    return this.fallbackContent.tvShows
      .filter(item => 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.overview?.toLowerCase().includes(query.toLowerCase())
      );
  }

  // Get all content (mixed)
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

      console.log('🎯 Total content loaded:', allContent.length);
      return allContent;
    } catch (error) {
      console.error('Error loading all content:', error);
      return [...this.fallbackContent.movies, ...this.fallbackContent.tvShows];
    }
  }

  // Get server options
  getServerOptions(): ServerOption[] {
    return this.serverOptions.filter(server => server.active);
  }

  // Get CDN sources
  getCDNSources(): CDNSource[] {
    return this.cdnSources.filter(cdn => cdn.active);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.failedSources.clear();
    console.log('🗑️ Cache and failed sources cleared');
  }

  // Get system status
  getSystemStatus(): {
    activeSources: number;
    failedSources: number;
    cacheSize: number;
    activeCDNs: number;
    activeServers: number;
  } {
    return {
      activeSources: this.contentSources.filter(s => s.active && !this.failedSources.has(s.id)).length,
      failedSources: this.failedSources.size,
      cacheSize: this.cache.size,
      activeCDNs: this.cdnSources.filter(c => c.active).length,
      activeServers: this.serverOptions.filter(s => s.active).length
    };
  }
}

export const multiSourceAPI = new MultiSourceAPIService();