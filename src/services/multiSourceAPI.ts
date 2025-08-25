// Multi-source API service inspired by watchug.to with enhanced connectivity
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
  baseUrl?: string;
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

  private streamingServers: ServerOption[] = [
    {
      id: '2embed',
      name: '2Embed',
      quality: 'HD',
      type: 'primary',
      active: true,
      baseUrl: 'https://www.2embed.cc/embed'
    },
    {
      id: 'embed-su',
      name: 'Embed.su',
      quality: 'HD',
      type: 'primary',
      active: true,
      baseUrl: 'https://embed.su/embed'
    },
    {
      id: 'multiembed',
      name: 'MultiEmbed',
      quality: 'HD',
      type: 'premium',
      active: true,
      baseUrl: 'https://multiembed.mov'
    },
    {
      id: 'vidsrc-primary',
      name: 'VidSrc Primary',
      quality: 'HD',
      type: 'backup',
      active: true,
      baseUrl: 'https://vidsrc.to/embed'
    },
    {
      id: 'vidsrc-backup',
      name: 'VidSrc Backup',
      quality: 'HD',
      type: 'backup',
      active: true,
      baseUrl: 'https://vidsrc.me/embed'
    },
    {
      id: 'vidsrc-pro',
      name: 'VidSrc Pro',
      quality: '4K',
      type: 'premium',
      active: true,
      baseUrl: 'https://vidsrc.pro/embed'
    }
  ];

  // Enhanced fetch with multiple source fallback
  private async fetchWithFallback(endpoint: string, params: Record<string, any> = {}, sourceType: 'content' | 'streaming' = 'content'): Promise<any> {
    const sources = sourceType === 'content' ? this.contentSources : this.streamingServers;
    const activeSources = sources.filter(source => source.active);

    for (const source of activeSources) {
      try {
        console.log(`🔄 Trying ${source.name} for:`, endpoint);
        
        let url: string;
        if (sourceType === 'content') {
          const contentSource = source as ContentSource;
          const urlObj = new URL(`${contentSource.baseUrl}${endpoint}`);
          if (contentSource.apiKey) {
            urlObj.searchParams.append('api_key', contentSource.apiKey);
        }
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
              urlObj.searchParams.append(key, value.toString());
            }
          });
          
          url = urlObj.toString();
        } else {
          const streamingSource = source as ServerOption;
          const urlObj = new URL(`${streamingSource.baseUrl || 'https://vidsrc.to/embed'}${endpoint}`);
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              urlObj.searchParams.append(key, value.toString());
            }
          });
          
          url = urlObj.toString();
        }

        const controller = new AbortController();
        const timeout = sourceType === 'content' ? (source as ContentSource).timeout : 10000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
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
        if (data && (data.results || data.genres || data.id || data.Response)) {
        console.log(`✅ Success with ${source.name}:`, data);
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
    return this.getFallbackData(endpoint, sourceType);
  }

  // Get fallback data when all sources fail
  private getFallbackData(endpoint: string, sourceType: 'content' | 'streaming'): any {
    if (sourceType === 'content') {
      if (endpoint.includes('/trending/movie')) {
        return { results: this.getFallbackMovies() };
      } else if (endpoint.includes('/trending/tv')) {
        return { results: this.getFallbackTVShows() };
      } else if (endpoint.includes('/movie/popular')) {
        return { results: this.getFallbackMovies() };
      } else if (endpoint.includes('/tv/popular')) {
        return { results: this.getFallbackTVShows() };
      } else if (endpoint.includes('/genre/')) {
        return { genres: this.getFallbackGenres() };
      } else if (endpoint.includes('/search/')) {
        return { results: this.getFallbackMovies().slice(0, 5) };
      }
    }
    return { results: [] };
  }

  // Get fallback movies
  private getFallbackMovies(): any[] {
    return [
      {
        id: 1,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster_path: "https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop&auto=format",
        backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=720&fit=crop&auto=format",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre_ids: [18]
      },
      {
        id: 2,
        title: "The Dark Knight",
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&auto=format",
        backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop&auto=format",
        release_date: "2008-07-18",
        vote_average: 9.0,
        genre_ids: [28, 80, 18]
      }
    ];
  }

  // Get fallback TV shows
  private getFallbackTVShows(): any[] {
    return [
      {
        id: 1,
        name: "Breaking Bad",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&auto=format",
        backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop&auto=format",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
        genre_ids: [18, 80]
      }
    ];
  }

  // Get fallback genres
  private getFallbackGenres(): any[] {
    return [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 16, name: "Animation" },
      { id: 35, name: "Comedy" },
      { id: 80, name: "Crime" },
      { id: 99, name: "Documentary" },
      { id: 18, name: "Drama" },
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" },
      { id: 36, name: "History" },
      { id: 27, name: "Horror" },
      { id: 10402, name: "Music" },
      { id: 9648, name: "Mystery" },
      { id: 10749, name: "Romance" },
      { id: 878, name: "Science Fiction" },
      { id: 10770, name: "TV Movie" },
      { id: 53, name: "Thriller" },
      { id: 10752, name: "War" },
      { id: 37, name: "Western" }
    ];
  }

  // Get trending movies from multiple sources
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback(`/trending/movie/${timeWindow}`, {}, 'content');
      return (data.results || []).map((movie: any) => ({
        ...movie,
        trending: true,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return this.getFallbackMovies().map(movie => ({ ...movie, trending: true }));
    }
  }

  // Get trending TV shows from multiple sources
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback(`/trending/tv/${timeWindow}`, {}, 'content');
      return (data.results || []).map((show: any) => ({
        ...show,
        trending: true,
        overview: show.overview || 'No description available.',
        vote_average: show.vote_average || 0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      return this.getFallbackTVShows().map(show => ({ ...show, trending: true }));
    }
  }

  // Get popular movies from multiple sources
  async getPopularMovies(page: number = 1): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/movie/popular', { page }, 'content');
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return this.getFallbackMovies();
    }
  }

  // Get popular TV shows from multiple sources
  async getPopularTVShows(page: number = 1): Promise<any[]> {
    try {
      const data = await this.fetchWithFallback('/tv/popular', { page }, 'content');
      return (data.results || []).map((show: any) => ({
        ...show,
        overview: show.overview || 'No description available.',
        vote_average: show.vote_average || 0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return this.getFallbackTVShows();
    }
  }

  // Search movies from multiple sources
  async searchMovies(query: string, page: number = 1): Promise<any[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/movie', { query: query.trim(), page }, 'content');
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }

  // Search TV shows from multiple sources
  async searchTVShows(query: string, page: number = 1): Promise<any[]> {
    if (!query.trim()) return [];

    try {
      const data = await this.fetchWithFallback('/search/tv', { query: query.trim(), page }, 'content');
      return (data.results || []).map((show: any) => ({
        ...show,
        overview: show.overview || 'No description available.',
        vote_average: show.vote_average || 0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));
    } catch (error) {
      console.error('Error searching TV shows:', error);
      return [];
    }
  }

  // Get streaming sources for movies
  getMovieStreamingSources(tmdbId: number, title: string): any[] {
    return this.streamingServers
      .filter(server => server.active)
      .map(server => ({
        id: `movie-${tmdbId}-${server.id}`,
        title: `${title} - ${server.name} (${server.quality})`,
        quality: server.quality,
        url: this.buildMovieStreamingUrl(server, tmdbId),
        type: 'movie',
        server: server.name
      }));
  }

  // Get streaming sources for TV shows
  getTVShowStreamingSources(tmdbId: number, season: number, episode: number, title: string): any[] {
    return this.streamingServers
      .filter(server => server.active)
      .map(server => ({
        id: `tv-${tmdbId}-${season}-${episode}-${server.id}`,
        title: `${title} - ${server.name} (${server.quality})`,
        quality: server.quality,
        url: this.buildTVStreamingUrl(server, tmdbId, season, episode),
        type: 'tv',
        server: server.name
      }));
  }

  // Build movie streaming URL
  private buildMovieStreamingUrl(server: ServerOption, tmdbId: number): string {
    switch (server.id) {
      case 'vidsrc-primary':
      case 'vidsrc-backup':
      case 'vidsrc-pro':
        return `${server.baseUrl}/movie/${tmdbId}`;
      case '2embed':
        return `${server.baseUrl}/${tmdbId}`;
      case 'embed-su':
        return `${server.baseUrl}/movie/${tmdbId}`;
      case 'multiembed':
        return `${server.baseUrl}/?video_id=${tmdbId}&tmdb=1`;
      default:
        return `${server.baseUrl}/movie/${tmdbId}`;
    }
  }

  // Build TV streaming URL
  private buildTVStreamingUrl(server: ServerOption, tmdbId: number, season: number, episode: number): string {
    switch (server.id) {
      case 'vidsrc-primary':
      case 'vidsrc-backup':
      case 'vidsrc-pro':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      case '2embed':
        return `${server.baseUrl}/${tmdbId}&s=${season}&e=${episode}`;
      case 'embed-su':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      case 'multiembed':
        return `${server.baseUrl}/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      default:
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
    }
  }

  // Test connectivity of all sources
  async testConnectivity(): Promise<{ content: { [key: string]: boolean }; streaming: { [key: string]: boolean } }> {
    const contentResults: { [key: string]: boolean } = {};
    const streamingResults: { [key: string]: boolean } = {};

    // Test content sources
    for (const source of this.contentSources) {
      try {
        const testUrl = `${source.baseUrl}/configuration`;
        const url = new URL(testUrl);
        if (source.apiKey) {
          url.searchParams.append('api_key', source.apiKey);
        }
        
        const response = await fetch(url.toString(), { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        contentResults[source.name] = response.ok;
      } catch (error) {
        contentResults[source.name] = false;
      }
    }

    // Test streaming sources
    for (const server of this.streamingServers) {
      try {
        const testUrl = this.buildMovieStreamingUrl(server, 550); // Test with Fight Club
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        streamingResults[server.name] = response.ok;
      } catch (error) {
        streamingResults[server.name] = false;
      }
    }

    return { content: contentResults, streaming: streamingResults };
  }

  // Get source statistics
  getSourceStats(): { content: { total: number; active: number }; streaming: { total: number; active: number } } {
    return {
      content: {
        total: this.contentSources.length,
        active: this.contentSources.filter(s => s.active).length
      },
      streaming: {
        total: this.streamingServers.length,
        active: this.streamingServers.filter(s => s.active).length
      }
    };
  }

  // Update source status
  updateSourceStatus(sourceId: string, active: boolean, sourceType: 'content' | 'streaming'): void {
    const sources = sourceType === 'content' ? this.contentSources : this.streamingServers;
    const source = sources.find(s => s.id === sourceId);
    
    if (source) {
      source.active = active;
      console.log(`${sourceType} source ${source.name} status updated to: ${active}`);
    }
  }
}

export const multiSourceAPI = new MultiSourceAPIService();