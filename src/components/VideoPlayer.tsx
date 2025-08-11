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

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        id="video-player-container"
        className="w-full h-full relative bg-black"
      >
        {/* Video Player Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-10 p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <p className="text-gray-400 text-sm">Server {currentSource + 1} - {sources[currentSource]?.quality}</p>
            </div>
            <div className="flex items-center space-x-2">
              {sources.length > 1 && (
                <select
                  value={currentSource}
                  onChange={(e) => setCurrentSource(Number(e.target.value))}
                  className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {sources.map((source, index) => (
                    <option key={source.id} value={index}>
                      Server {index + 1}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Iframe */}
        <div className="absolute top-16 left-0 right-0 bottom-0">
        {sources[currentSource] ? (
          <iframe
            src={sources[currentSource].url}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            frameBorder="0"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">No video sources available</p>
            </div>
          </div>
        )}
        </div>

      </div>
    </div>
  );
};