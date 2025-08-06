// Streaming service for movie/TV show playback
export interface StreamingSource {
  id: string;
  title: string;
  quality: string;
  url: string;
  type: 'movie' | 'tv';
}

export interface EpisodeSource {
  season: number;
  episode: number;
  title: string;
  sources: StreamingSource[];
}

class StreamingService {
  private baseUrl = 'https://vidsrc.to/embed';
  private altBaseUrl = 'https://www.2embed.to/embed';
  
  // Get movie streaming sources
  getMovieStreamingSources(tmdbId: number, title: string): StreamingSource[] {
    return [
      {
        id: `movie-${tmdbId}-1`,
        title: `${title} - HD`,
        quality: 'HD',
        url: `${this.baseUrl}/movie/${tmdbId}`,
        type: 'movie'
      },
      {
        id: `movie-${tmdbId}-2`,
        title: `${title} - HD Alt`,
        quality: 'HD',
        url: `${this.altBaseUrl}/tmdb/movie?id=${tmdbId}`,
        type: 'movie'
      }
    ];
  }

  // Get TV show streaming sources
  getTVShowStreamingSources(tmdbId: number, season: number, episode: number, title: string): StreamingSource[] {
    return [
      {
        id: `tv-${tmdbId}-${season}-${episode}-1`,
        title: `${title} S${season}E${episode} - HD`,
        quality: 'HD',
        url: `${this.baseUrl}/tv/${tmdbId}/${season}/${episode}`,
        type: 'tv'
      },
      {
        id: `tv-${tmdbId}-${season}-${episode}-2`,
        title: `${title} S${season}E${episode} - HD Alt`,
        quality: 'HD',
        url: `${this.altBaseUrl}/tmdb/tv?id=${tmdbId}&s=${season}&e=${episode}`,
        type: 'tv'
      }
    ];
  }

  // Get TV show seasons and episodes info
  async getTVShowEpisodes(tmdbId: number, seasonNumber: number): Promise<any[]> {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=8265bd1679663a7ea12ac168da84d2e8`);
      const data = await response.json();
      return data.episodes || [];
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return [];
    }
  }

  // Generate embed URL for iframe
  getEmbedUrl(source: StreamingSource): string {
    return source.url;
  }
}

export const streamingService = new StreamingService();