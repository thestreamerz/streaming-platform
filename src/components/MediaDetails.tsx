import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Heart, Star, Users, Globe, Download, RotateCcw } from 'lucide-react';
import { EpisodeSelector } from './EpisodeSelector';

interface MediaDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  contentType: 'movie' | 'tv';
  onWatch: (season?: number, episode?: number) => void;
}

export const MediaDetails: React.FC<MediaDetailsProps> = ({
  isOpen,
  onClose,
  content,
  contentType,
  onWatch
}) => {
  const [_showEpisodes, setShowEpisodes] = useState(false);

  useEffect(() => {
    if (isOpen && contentType === 'tv') {
      setShowEpisodes(true);
    } else {
      setShowEpisodes(false);
    }
  }, [isOpen, contentType]);

  if (!isOpen || !content) return null;

  // Derive TV vs Movie from the provided type first, then check payload
  const isTV = contentType === 'tv' || (contentType !== 'movie' && !!(content?.number_of_seasons || (content?.seasons && content.seasons.length > 0)));

  const handleWatch = () => {
    if (isTV) {
      // For TV shows, show episode selector first
      setShowEpisodes(true);
    } else {
      // For movies, watch directly
      onWatch();
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    onWatch(season, episode);
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (runtime: number) => {
    if (!runtime) return 'TBA';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {isTV ? 'TV Show Details' : 'Movie Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Left Side - Poster and Basic Info */}
          <div className="lg:w-1/3 p-6">
            <div className="relative">
              <img
                src={content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : '/The Streamerz Logo.png'}
                alt={content.title || content.name}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/The Streamerz Logo.png'; }}
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleWatch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>{contentType === 'tv' ? 'Watch Now' : 'Watch Now'}</span>
              </button>

              <div className="flex space-x-2">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add to List</span>
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>Like</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Quick action grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => alert('Download options coming soon')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button onClick={() => alert('Trailer playback coming soon')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Trailer</span>
                </button>
                <button onClick={() => alert('Cast list coming soon')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Cast</span>
                </button>
                <button onClick={() => alert('Similar titles coming soon')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Similar</span>
                </button>
              </div>
              {/* Quick actions row for faster navigation */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <button
                  onClick={handleWatch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  type="button"
                >
                  {contentType === 'tv' ? 'Watch Episode' : 'Watch Now'}
                </button>
              </div>
              {/* Episodes block at the very top for TV shows */}
              {isTV && (
                <div className="sticky top-0 z-10 bg-slate-900 pb-4 border-b border-slate-700">
                  <EpisodeSelector
                    showId={content.id}
                    showTitle={content.name}
                    totalSeasons={content.seasons?.length || content.number_of_seasons || 1}
                    onEpisodeSelect={handleEpisodeSelect}
                  />
                </div>
              )}
              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {content.title || content.name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold">{content.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <span>•</span>
                  <span>{content.release_date ? new Date(content.release_date).getFullYear() : 'TBA'}</span>
                  {!isTV && content.runtime && (
                    <>
                      <span>•</span>
                      <span>{formatRuntime(content.runtime)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {content.overview || 'No overview available.'}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Release Date</h4>
                  <p className="text-white">{formatDate(content.release_date || content.first_air_date)}</p>
                </div>
                
                {contentType === 'tv' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Seasons</h4>
                    <p className="text-white">{content.number_of_seasons || 'TBA'}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Status</h4>
                  <p className="text-white">{content.status || 'TBA'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Language</h4>
                  <p className="text-white">{content.original_language?.toUpperCase() || 'TBA'}</p>
                </div>
              </div>

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Episode Selector moved to top; keep nothing here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
