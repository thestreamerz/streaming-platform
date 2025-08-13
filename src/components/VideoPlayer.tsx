import React, { useState, useEffect } from 'react';
import { X, Play, Maximize, Volume2, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { StreamingSource } from '../services/streaming';
import { ServerSelector } from './ServerSelector';

interface VideoPlayerProps {
  sources: StreamingSource[];
  title: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ sources, title, onClose }) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [showServerSelector, setShowServerSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [currentSource]);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    if (retryCount < sources.length - 1) {
      setCurrentSource((prev) => (prev + 1) % sources.length);
      setRetryCount(prev => prev + 1);
    } else {
      // Reset to first source after trying all
      setCurrentSource(0);
      setRetryCount(0);
    }
  };

  const handleServerChange = (newSourceIndex: number) => {
    setCurrentSource(newSourceIndex);
    setShowServerSelector(false);
  };

  if (!sources || sources.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">No Streaming Sources Available</h2>
          <p className="text-gray-400 mb-4">Unable to find streaming sources for this content.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Player
          </button>
        </div>
      </div>
    );
  }

  const currentSourceData = sources[currentSource];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full h-full relative bg-black">
        {/* Video Player Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-10 p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <p className="text-gray-400 text-sm">
                {currentSourceData?.server} - {currentSourceData?.quality} 
                {error && <span className="text-red-400 ml-2">(Connection Error)</span>}
                {loading && <span className="text-yellow-400 ml-2">(Loading...)</span>}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {sources.length > 1 && (
                <select
                  value={currentSource}
                  onChange={(e) => handleServerChange(Number(e.target.value))}
                  className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {sources.map((source, index) => (
                    <option key={source.id} value={index}>
                      {source.server} ({source.quality})
                    </option>
                  ))}
                </select>
              )}
              
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Next Server</span>
                </button>
              )}
              
              <button
                onClick={() => setShowServerSelector(!showServerSelector)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Choose Server
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Server Selector Modal */}
        {showServerSelector && (
          <div className="absolute top-20 left-4 right-4 bg-slate-900 rounded-xl shadow-2xl z-20 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Choose Server</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.map((source, index) => (
                  <button
                    key={source.id}
                    onClick={() => handleServerChange(index)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      currentSource === index
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{source.server}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                        source.quality === '4K' ? 'bg-purple-600' : 
                        source.quality === 'HD' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {source.quality}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {source.type === 'movie' ? 'Movie' : 'TV Show'} Stream
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowServerSelector(false)}
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Loading video from {currentSourceData?.server}...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we connect to the server</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && !loading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <div className="text-center text-white max-w-md mx-auto p-6">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-bold mb-2">Connection Failed</h3>
              <p className="text-gray-400 mb-4">
                Unable to load video from {currentSourceData?.server}. This might be due to server maintenance or regional restrictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Next Server</span>
                </button>
                <button
                  onClick={() => setShowServerSelector(true)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Choose Different Server
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Iframe */}
        <div className="absolute top-16 left-0 right-0 bottom-0">
          {currentSourceData && (
            <iframe
              key={`${currentSourceData.id}-${retryCount}`}
              src={currentSourceData.url}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              frameBorder="0"
              title={title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: loading ? 'none' : 'block' }}
            />
          )}
        </div>

        {/* Tips */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-sm text-gray-300">
              💡 <strong>Tip:</strong> If the video doesn't load, try switching to a different server using the dropdown above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};