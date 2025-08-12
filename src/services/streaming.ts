// Streaming service for movie/TV show playback
import { enhancedStreamingService } from './enhancedStreaming';

export interface StreamingSource {
  id: string;
  title: string;
  quality: string;
  url: string;
  type: 'movie' | 'tv';
  server?: string;
}

export interface EpisodeSource {
  season: number;
  episode: number;
  title: string;
  sources: StreamingSource[];
}

class StreamingService {
  // Get movie streaming sources
  getMovieStreamingSources(tmdbId: number, title: string): StreamingSource[] {
    return enhancedStreamingService.getMovieStreamingSources(tmdbId, title);
  }

  // Get TV show streaming sources
  getTVShowStreamingSources(tmdbId: number, season: number, episode: number, title: string): StreamingSource[] {
    return enhancedStreamingService.getTVShowStreamingSources(tmdbId, season, episode, title);
  }

  // Get TV show seasons and episodes info
  async getTVShowEpisodes(tmdbId: number, seasonNumber: number): Promise<any[]> {
    return enhancedStreamingService.getTVShowEpisodes(tmdbId, seasonNumber);
  }

  // Generate embed URL for iframe
  getEmbedUrl(source: StreamingSource): string {
    return enhancedStreamingService.getEmbedUrl(source);
  }
}

export const streamingService = new StreamingService();