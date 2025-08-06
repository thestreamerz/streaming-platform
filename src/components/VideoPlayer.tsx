import React, { useState } from 'react';
import { X, Play, Maximize, Volume2, Settings } from 'lucide-react';
import { StreamingSource } from '../services/streaming';

interface VideoPlayerProps {
  sources: StreamingSource[];
  title: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ sources, title, onClose }) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const element = document.getElementById('video-player-container');
    if (element) {
      if (!isFullscreen) {
        element.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        id="video-player-container"
        className="w-full h-full relative bg-black"
      >
        {/* Video Player Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <p className="text-gray-300 text-sm">{sources[currentSource]?.quality}</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={currentSource}
                onChange={(e) => setCurrentSource(Number(e.target.value))}
                className="bg-black/50 text-white border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {sources.map((source, index) => (
                  <option key={source.id} value={index}>
                    Server {index + 1} - {source.quality}
                  </option>
                ))}
              </select>
              <button
                onClick={handleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Iframe */}
        <iframe
          src={sources[currentSource]?.url}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          frameBorder="0"
          title={title}
        />

        {/* Loading State */}
        {!sources[currentSource] && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Loading video...</p>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white hover:bg-white/20 rounded transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/20 rounded transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-white hover:bg-white/20 rounded transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};