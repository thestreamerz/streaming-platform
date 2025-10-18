import React, { useState, useEffect } from 'react';
import { Play, Calendar } from 'lucide-react';
import { streamingService } from '../services/streaming';

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string;
  vote_average: number;
}

interface EpisodeSelectorProps {
  showId: number;
  showTitle: string;
  totalSeasons: number;
  onEpisodeSelect: (season: number, episode: number, title: string) => void;
}

export const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  showId,
  showTitle,
  totalSeasons,
  onEpisodeSelect
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEpisodes(selectedSeason);
  }, [selectedSeason, showId]);

  const loadEpisodes = async (seasonNumber: number) => {
    setLoading(true);
    try {
      console.log('Loading episodes for show:', showId, 'season:', seasonNumber);
      const episodeData = await streamingService.getTVShowEpisodes(showId, seasonNumber);
      console.log('Episodes loaded:', episodeData);
      setEpisodes(episodeData || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      // Fallback: create some sample episodes
      const fallbackEpisodes = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Episode ${i + 1}`,
        overview: `Episode ${i + 1} description`,
        episode_number: i + 1,
        season_number: seasonNumber,
        air_date: new Date().toISOString().split('T')[0],
        still_path: null,
        vote_average: Math.random() * 5 + 5
      }));
      setEpisodes(fallbackEpisodes);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 md:p-5 border border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-white">Episodes</h3>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          {Array.from({ length: Math.max(1, totalSeasons) }, (_, i) => i + 1).map(season => (
            <option key={season} value={season}>
              Season {season}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {episodes.length > 0 ? episodes.map((episode) => (
            <button
              key={`${episode.season_number}-${episode.episode_number}`}
              className="text-left rounded-lg border border-slate-600 hover:border-blue-500 bg-slate-700 hover:bg-slate-600 transition-colors flex min-h-[88px]"
              onClick={() => onEpisodeSelect(
                episode.season_number,
                episode.episode_number,
                `${showTitle} - S${episode.season_number}E${episode.episode_number}`
              )}
            >
              <div className="w-24 h-full hidden sm:block overflow-hidden rounded-l-lg bg-slate-600">
                {episode.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                    alt={episode.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/70">
                    <Play className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium truncate">
                    {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(episode.air_date)}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-xs md:text-sm line-clamp-2">
                  {episode.overview || 'No description available.'}
                </p>
              </div>
            </button>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-400">No episodes available for this season</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};