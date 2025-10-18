import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Server, Home, Film, Tv, TrendingUp, Radio } from 'lucide-react';
import { StreamingSource } from '../services/enhancedStreaming';

interface VideoPlayerProps {
  sources: StreamingSource[];
  title: string;
  onClose: () => void;
  user?: any;
  content?: any;
  contentType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onNavigate?: (view: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ sources, title, onClose, contentType: _contentType, season: _season, episode: _episode, onNavigate }) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current source data
  const currentSourceData = sources?.[currentSource];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowServerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle source changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentSource]);

  // VidLink Pro event listeners
  useEffect(() => {
    if (currentSourceData?.server === 'VidLink Pro') {
      const handleVidLinkMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://vidlink.pro') return;
        
        if (event.data?.type === 'MEDIA_DATA') {
          const mediaData = event.data.data;
          localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
          console.log('📊 VidLink progress saved:', mediaData);
        }
        
        if (event.data?.type === 'PLAYER_EVENT') {
          const { event: eventType, currentTime, duration } = event.data.data;
          console.log(`🎬 VidLink player ${eventType} at ${currentTime}s of ${duration}s`);
        }
      };
      
      window.addEventListener('message', handleVidLinkMessage);
      
      return () => {
        window.removeEventListener('message', handleVidLinkMessage);
      };
    }
  }, [currentSourceData]);

  // Get embed URL
  const getEmbedUrl = (source: StreamingSource): string => {
    if (!source?.url) return '';
    
    // For VidLink Pro, return the URL as-is
    if (source.server === 'VidLink Pro') {
      return source.url;
    }
    
    // For other APIs, wrap in iframe
    return source.url;
  };

  // Handle server change
  const handleServerChange = (index: number) => {
    if (index >= 0 && index < sources.length) {
      setCurrentSource(index);
      setShowServerDropdown(false);
    }
  };

  // Auto-retry with next server on error
  useEffect(() => {
    if (error && currentSource < sources.length - 1) {
      const timer = setTimeout(() => {
        console.log(`🔄 Auto-retrying with next server: ${currentSource + 1}`);
        setCurrentSource(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, currentSource, sources.length]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between p-4 bg-black/90 border-b border-gray-800">
        <div className="text-white">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-gray-400">
            {currentSourceData?.server} - {currentSourceData?.quality}
          </p>
        </div>
        
        {/* Navigation Buttons */}
        {onNavigate && (
          <div className="flex items-center space-x-2 mr-4">
            <button
              onClick={() => {
                console.log('Home button clicked');
                onNavigate('home');
              }}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Home"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                console.log('Movies button clicked');
                onNavigate('movies');
              }}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Movies"
            >
              <Film className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                console.log('TV Shows button clicked');
                onNavigate('tv');
              }}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="TV Shows"
            >
              <Tv className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                console.log('Trending button clicked');
                onNavigate('trending');
              }}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Trending"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                console.log('Live TV button clicked');
                onNavigate('live-tv');
              }}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Live TV"
            >
              <Radio className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Close Player"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Simple Video Player */}
      <div className="flex-1 relative bg-black">
          {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold mb-2">Loading...</p>
                    <p className="text-gray-400 text-sm">
                  {currentSourceData?.server} - {currentSourceData?.quality}
                </p>
            </div>
          </div>
        )}

          {error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white p-6">
                <h2 className="text-xl font-bold mb-2">Stream Failed</h2>
              <p className="text-gray-400 mb-4">
                  Failed to load from {currentSourceData?.server}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => setError(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
                {currentSource < sources.length - 1 && (
                <button
                    onClick={() => handleServerChange(currentSource + 1)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                      Next Server
                </button>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Video Iframe */}
        {currentSourceData && (
            <iframe
              ref={iframeRef}
            key={`${currentSourceData.id}-${currentSource}`}
            src={getEmbedUrl(currentSourceData)}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            onLoad={() => {
              setLoading(false);
              setError(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
          </div>

      {/* Footer with Server Dropdown */}
      <div className="bg-black/90 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="text-sm">
            <span className="text-gray-400">Server: </span>
            <span className="font-medium">{currentSourceData?.server}</span>
            <span className="text-gray-400 ml-4">Quality: </span>
            <span className="font-medium">{currentSourceData?.quality}</span>
        </div>

          {/* Smooth Server Dropdown */}
          <div className="relative" ref={dropdownRef}>
              <button
              onClick={() => setShowServerDropdown(!showServerDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <Server className="w-4 h-4" />
              <span>Change Server</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`} />
              </button>
              
            {/* Dropdown Menu */}
            {showServerDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {sources.map((source, index) => (
                <button 
                      key={index}
                      onClick={() => handleServerChange(index)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                        index === currentSource ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{source.server}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {source.quality} • {source.features?.slice(0, 2).join(', ')}
                          </div>
                        </div>
                        {index === currentSource && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
          </div>
        </div>
      </div>
    </div>
  );
};