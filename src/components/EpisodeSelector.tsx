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
      const episodeData = await streamingService.getTVShowEpisodes(showId, seasonNumber);
      setEpisodes(episodeData || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setEpisodes([]);
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
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Episodes</h3>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2"
        >
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(season => (
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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {episodes.length > 0 ? episodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer group"
              onClick={() => onEpisodeSelect(
                episode.season_number,
                episode.episode_number,
                `${showTitle} - S${episode.season_number}E${episode.episode_number}`
              )}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-10 bg-slate-600 rounded flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium truncate">
                      {episode.episode_number}. {episode.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(episode.air_date)}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {episode.overview || 'No description available.'}
                  </p>
                  {episode.vote_average > 0 && (
                    <div className="flex items-center mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-gray-300 text-sm">{episode.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No episodes available for this season</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};