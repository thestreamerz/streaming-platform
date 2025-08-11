const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  cast?: CastMember[];
  director?: string;
  videos?: Video[];
  similar?: Movie[];
  trending?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  cast?: CastMember[];
  creator?: string;
  videos?: Video[];
  similar?: TVShow[];
  trending?: boolean;
}

class TMDBService {
  private async fetchFromTMDB(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  // Get image URL
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Get trending movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
    return data.results.map((movie: any) => ({
      ...movie,
      trending: true
    }));
  }

  // Get trending TV shows
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TVShow[]> {
    const data = await this.fetchFromTMDB(`/trending/tv/${timeWindow}`);
    return data.results.map((show: any) => ({
      ...show,
      trending: true
    }));
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/movie/popular', { page });
    return data.results;
  }

  // Get popular TV shows
  async getPopularTVShows(page: number = 1): Promise<TVShow[]> {
    const data = await this.fetchFromTMDB('/tv/popular', { page });
    return data.results;
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/movie/top_rated', { page });
    return data.results;
  }

  // Get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/movie/now_playing', { page });
    return data.results;
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/movie/upcoming', { page });
    return data.results;
  }

  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/search/movie', { query, page });
    return data.results;
  }

  // Search TV shows
  async searchTVShows(query: string, page: number = 1): Promise<TVShow[]> {
    const data = await this.fetchFromTMDB('/search/tv', { query, page });
    return data.results;
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<Movie> {
    const [details, credits, videos, similar] = await Promise.all([
      this.fetchFromTMDB(`/movie/${movieId}`),
      this.fetchFromTMDB(`/movie/${movieId}/credits`),
      this.fetchFromTMDB(`/movie/${movieId}/videos`),
      this.fetchFromTMDB(`/movie/${movieId}/similar`)
    ]);

    const director = credits.crew.find((person: any) => person.job === 'Director');

    return {
      ...details,
      cast: credits.cast.slice(0, 10),
      director: director?.name,
      videos: videos.results.filter((video: any) => video.site === 'YouTube'),
      similar: similar.results.slice(0, 6)
    };
  }

  // Get TV show details
  async getTVShowDetails(showId: number): Promise<TVShow> {
    const [details, credits, videos, similar] = await Promise.all([
      this.fetchFromTMDB(`/tv/${showId}`),
      this.fetchFromTMDB(`/tv/${showId}/credits`),
      this.fetchFromTMDB(`/tv/${showId}/videos`),
      this.fetchFromTMDB(`/tv/${showId}/similar`)
    ]);

    const creator = details.created_by?.[0];

    return {
      ...details,
      cast: credits.cast.slice(0, 10),
      creator: creator?.name,
      videos: videos.results.filter((video: any) => video.site === 'YouTube'),
      similar: similar.results.slice(0, 6)
    };
  }

  // Get movies by genre
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    });
    return data.results;
  }

  // Get TV shows by genre
  async getTVShowsByGenre(genreId: number, page: number = 1): Promise<TVShow[]> {
    const data = await this.fetchFromTMDB('/discover/tv', {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    });
    return data.results;
  }

  // Get movie genres
  async getMovieGenres(): Promise<Genre[]> {
    const data = await this.fetchFromTMDB('/genre/movie/list');
    return data.genres;
  }

  // Get TV genres
  async getTVGenres(): Promise<Genre[]> {
    const data = await this.fetchFromTMDB('/genre/tv/list');
    return data.genres;
  }
}

export const tmdbService = new TMDBService();