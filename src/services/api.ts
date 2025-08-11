const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

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
      console.log('Fetching from TMDB:', url.toString());
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} - ${response.statusText}`);
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TMDB Response:', data);
      return data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      // Return empty results instead of throwing to prevent app crashes
      return { results: [], genres: [] };
    }
  }

  // Get image URL with fallback
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) {
      return 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Get trending movies with fallback
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
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
      return this.getFallbackMovies();
    }
  }

  // Get trending TV shows with fallback
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromTMDB(`/trending/tv/${timeWindow}`);
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
      return this.getFallbackTVShows();
    }
  }

  // Get popular movies with fallback
  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/movie/popular', { page });
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

  // Get popular TV shows with fallback
  async getPopularTVShows(page: number = 1): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromTMDB('/tv/popular', { page });
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

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/movie/top_rated', { page });
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return this.getFallbackMovies();
    }
  }

  // Get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/movie/now_playing', { page });
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      return this.getFallbackMovies();
    }
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/movie/upcoming', { page });
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      return this.getFallbackMovies();
    }
  }

  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    if (!query.trim()) return [];
    
    try {
      const data = await this.fetchFromTMDB('/search/movie', { query: query.trim(), page });
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

  // Search TV shows
  async searchTVShows(query: string, page: number = 1): Promise<TVShow[]> {
    if (!query.trim()) return [];
    
    try {
      const data = await this.fetchFromTMDB('/search/tv', { query: query.trim(), page });
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

  // Get movie details
  async getMovieDetails(movieId: number): Promise<Movie | null> {
    try {
      const [details, credits, videos, similar] = await Promise.all([
        this.fetchFromTMDB(`/movie/${movieId}`),
        this.fetchFromTMDB(`/movie/${movieId}/credits`),
        this.fetchFromTMDB(`/movie/${movieId}/videos`),
        this.fetchFromTMDB(`/movie/${movieId}/similar`)
      ]);

      if (!details || !details.id) {
        throw new Error('Movie details not found');
      }

      const director = credits.crew?.find((person: any) => person.job === 'Director');

      return {
        ...details,
        overview: details.overview || 'No description available.',
        vote_average: details.vote_average || 0,
        poster_path: details.poster_path || '',
        backdrop_path: details.backdrop_path || details.poster_path || '',
        cast: (credits.cast || []).slice(0, 10),
        director: director?.name || 'Unknown',
        videos: (videos.results || []).filter((video: any) => video.site === 'YouTube'),
        similar: (similar.results || []).slice(0, 6)
      };
    } catch (error) {
      console.error('Error loading movie details:', error);
      return null;
    }
  }

  // Get TV show details
  async getTVShowDetails(showId: number): Promise<TVShow | null> {
    try {
      const [details, credits, videos, similar] = await Promise.all([
        this.fetchFromTMDB(`/tv/${showId}`),
        this.fetchFromTMDB(`/tv/${showId}/credits`),
        this.fetchFromTMDB(`/tv/${showId}/videos`),
        this.fetchFromTMDB(`/tv/${showId}/similar`)
      ]);

      if (!details || !details.id) {
        throw new Error('TV show details not found');
      }

      const creator = details.created_by?.[0];

      return {
        ...details,
        overview: details.overview || 'No description available.',
        vote_average: details.vote_average || 0,
        poster_path: details.poster_path || '',
        backdrop_path: details.backdrop_path || details.poster_path || '',
        cast: (credits.cast || []).slice(0, 10),
        creator: creator?.name || 'Unknown',
        videos: (videos.results || []).filter((video: any) => video.site === 'YouTube'),
        similar: (similar.results || []).slice(0, 6)
      };
    } catch (error) {
      console.error('Error loading TV show details:', error);
      return null;
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromTMDB('/discover/movie', {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      });
      return (data.results || []).map((movie: any) => ({
        ...movie,
        overview: movie.overview || 'No description available.',
        vote_average: movie.vote_average || 0,
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || movie.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  }

  // Get TV shows by genre
  async getTVShowsByGenre(genreId: number, page: number = 1): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromTMDB('/discover/tv', {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      });
      return (data.results || []).map((show: any) => ({
        ...show,
        overview: show.overview || 'No description available.',
        vote_average: show.vote_average || 0,
        poster_path: show.poster_path || '',
        backdrop_path: show.backdrop_path || show.poster_path || ''
      }));
    } catch (error) {
      console.error('Error fetching TV shows by genre:', error);
      return [];
    }
  }

  // Get movie genres
  async getMovieGenres(): Promise<Genre[]> {
    try {
      const data = await this.fetchFromTMDB('/genre/movie/list');
      return data.genres || this.getFallbackGenres();
    } catch (error) {
      console.error('Error fetching movie genres:', error);
      return this.getFallbackGenres();
    }
  }

  // Get TV genres
  async getTVGenres(): Promise<Genre[]> {
    try {
      const data = await this.fetchFromTMDB('/genre/tv/list');
      return data.genres || this.getFallbackGenres();
    } catch (error) {
      console.error('Error fetching TV genres:', error);
      return this.getFallbackGenres();
    }
  }

  // Fallback data when API fails
  private getFallbackMovies(): Movie[] {
    return [
      {
        id: 1,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster_path: "",
        backdrop_path: "",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre_ids: [18]
      },
      {
        id: 2,
        title: "The Godfather",
        overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        poster_path: "",
        backdrop_path: "",
        release_date: "1972-03-24",
        vote_average: 9.2,
        genre_ids: [18, 80]
      },
      {
        id: 3,
        title: "The Dark Knight",
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        poster_path: "",
        backdrop_path: "",
        release_date: "2008-07-18",
        vote_average: 9.0,
        genre_ids: [28, 80, 18]
      }
    ];
  }

  private getFallbackTVShows(): TVShow[] {
    return [
      {
        id: 1,
        name: "Breaking Bad",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        poster_path: "",
        backdrop_path: "",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
        genre_ids: [18, 80]
      },
      {
        id: 2,
        name: "Game of Thrones",
        overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        poster_path: "",
        backdrop_path: "",
        first_air_date: "2011-04-17",
        vote_average: 9.3,
        genre_ids: [18, 10765, 10759]
      },
      {
        id: 3,
        name: "Stranger Things",
        overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        poster_path: "",
        backdrop_path: "",
        first_air_date: "2016-07-15",
        vote_average: 8.7,
        genre_ids: [18, 10765, 9648]
      }
    ];
  }

  private getFallbackGenres(): Genre[] {
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
}

export const tmdbService = new TMDBService();