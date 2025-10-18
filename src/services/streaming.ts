// Streaming service for movie/TV show playback
// Re-export from enhanced streaming to ensure type compatibility
export { StreamingSource, enhancedStreamingService as streamingService } from './enhancedStreaming';

export interface EpisodeSource {
  season: number;
  episode: number;
  title: string;
  sources: StreamingSource[];
}