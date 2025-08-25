import React, { useState, useEffect } from 'react';
import { X, Play, Maximize, Volume2, Settings, RefreshCw, AlertCircle, Server } from 'lucide-react';
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
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [currentSource]);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
    console.log('✅ Iframe loaded successfully');
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
    console.error('❌ Iframe failed to load');
    
    // Auto-retry with next source if enabled
    if (autoRetry && retryCount < sources.length - 1) {
      setTimeout(() => {
        console.log('🔄 Auto-retrying with next source...');
        handleRetry();
      }, 2000);
    }
  };

  const handleRetry = () => {
    if (retryCount < sources.length - 1) {
      const nextSource = (currentSource + 1) % sources.length;
      console.log(`🔄 Retrying with source ${nextSource + 1}/${sources.length}: ${sources[nextSource]?.server}`);
      setCurrentSource(nextSource);
      setRetryCount(prev => prev + 1);
    } else {
      // Reset to first source after trying all
      console.log('🔄 All sources tried, resetting to first source');
      setCurrentSource(0);
      setRetryCount(0);
    }
  };

  const handleServerChange = (newSourceIndex: number) => {
    console.log(`🔄 Switching to server: ${sources[newSourceIndex]?.server}`);
    setCurrentSource(newSourceIndex);
    setShowServerSelector(false);
    setRetryCount(0);
  };

  const handleManualRetry = () => {
    console.log('🔄 Manual retry requested');
    setRetryCount(0);
    setCurrentSource(0);
    setError(false);
    setLoading(true);
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
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Video Player Header */}
        <div className="relative top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-[10000] p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <p className="text-gray-400 text-sm">
                {currentSourceData?.server} - {currentSourceData?.quality} 
                {error && <span className="text-red-400 ml-2">(Connection Error)</span>}
                {loading && <span className="text-yellow-400 ml-2">(Loading...)</span>}
                <span className="text-gray-500 ml-2">({currentSource + 1}/{sources.length})</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Server Selector */}
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowServerSelector(!showServerSelector)}
                    className="flex items-center space-x-2 bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
                  >
                    <Server className="w-4 h-4" />
                    <span>{currentSourceData?.server}</span>
                  </button>
                  
                  {showServerSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-[10001] min-w-48">
                      <div className="p-2">
                        <h3 className="text-white text-sm font-semibold mb-2 px-2">Select Server</h3>
                        {sources.map((source, index) => (
                          <button
                            key={source.id}
                            onClick={() => handleServerChange(index)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              index === currentSource
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{source.server}</span>
                              <span className="text-xs opacity-75">{source.quality}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Error Actions */}
              {error && (
                <button
                  onClick={handleManualRetry}
                  className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="bg-slate-800 text-white p-2 rounded hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Player Content */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-semibold mb-2">Loading Stream...</p>
                <p className="text-gray-400 text-sm">
                  {currentSourceData?.server} - {currentSourceData?.quality}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center text-white">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold mb-2">Stream Failed</h2>
                <p className="text-gray-400 mb-4">
                  Failed to load from {currentSourceData?.server}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManualRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  {retryCount < sources.length - 1 && (
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Next Server
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Video Iframe */}
          <iframe
            key={`${currentSource}-${retryCount}`}
            src={currentSourceData?.url}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`${title} - ${currentSourceData?.server}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          />
        </div>

        {/* Player Controls Footer */}
        <div className="bg-black/95 backdrop-blur-sm border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-slate-800 rounded transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Server: {currentSourceData?.server}
              </span>
              <span className="text-sm text-gray-400">
                Quality: {currentSourceData?.quality}
              </span>
              <button className="p-2 hover:bg-slate-800 rounded transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};