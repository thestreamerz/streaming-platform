// Live TV Page Component
import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Search, Filter, Grid, List, Radio, Users, Clock, Globe } from 'lucide-react';
import { liveTVService, LiveTVChannel, LiveTVCategory } from '../services/liveTVService';
import OptimizedImage from './OptimizedImage';

interface LiveTVPageProps {
  onChannelSelect: (channel: LiveTVChannel) => void;
}

const LiveTVPage: React.FC<LiveTVPageProps> = ({ onChannelSelect }) => {
  const [channels, setChannels] = useState<LiveTVChannel[]>([]);
  const [categories, setCategories] = useState<LiveTVCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'viewers' | 'quality'>('name');
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<LiveTVChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    loadChannels();
    loadCategories();
    
    // Start live updates simulation
    liveTVService.simulateLiveUpdates();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const allChannels = liveTVService.getAllChannels();
      console.log('Loaded channels:', allChannels);
      setChannels(allChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = liveTVService.getCategories();
      console.log('Loaded categories:', allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChannelClick = (channel: LiveTVChannel) => {
    // Open channel in new window
    const streamUrl = liveTVService.getChannelStreamUrl(channel.id);
    if (streamUrl) {
      // Create a new window with the player
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=no,resizable=yes');
      
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${channel.name} - Live TV</title>
            <style>
              body { margin: 0; padding: 0; background: #000; font-family: Arial, sans-serif; }
              .player-container { width: 100vw; height: 100vh; position: relative; }
              video { width: 100%; height: 100%; object-fit: cover; }
              .channel-info { 
                position: absolute; 
                top: 20px; 
                left: 20px; 
                background: rgba(0,0,0,0.7); 
                color: white; 
                padding: 15px; 
                border-radius: 8px; 
                max-width: 300px;
                z-index: 10;
              }
              .live-indicator {
                position: absolute;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                animation: pulse 2s infinite;
                z-index: 10;
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              .controls {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(0,0,0,0.7);
                padding: 15px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 10;
              }
              .control-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px;
                border-radius: 50%;
                cursor: pointer;
                margin: 0 5px;
              }
              .control-btn:hover {
                background: rgba(255,255,255,0.3);
              }
              .volume-slider {
                width: 100px;
                margin: 0 10px;
              }
            </style>
          </head>
          <body>
            <div class="player-container">
              <video id="videoPlayer" autoplay muted playsinline controls>
                <source src="${streamUrl}" type="application/x-mpegURL">
                Your browser does not support the video tag.
              </video>
              
              <div class="channel-info">
                <h2>${channel.name}</h2>
                <p>${channel.description}</p>
                <div style="margin-top: 10px;">
                  <span style="background: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${channel.quality}</span>
                  <span style="margin-left: 10px; color: #ccc;">${channel.country}</span>
                </div>
              </div>
              
              <div class="live-indicator">
                🔴 LIVE
              </div>
              
              <div class="controls">
                <div>
                  <button class="control-btn" onclick="togglePlayPause()">⏯️</button>
                  <button class="control-btn" onclick="toggleMute()">🔊</button>
                  <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1" onchange="setVolume(this.value)">
                </div>
                <div>
                  <button class="control-btn" onclick="toggleFullscreen()">⛶</button>
                  <button class="control-btn" onclick="window.close()">✕</button>
                </div>
              </div>
            </div>
            
            <script>
              const video = document.getElementById('videoPlayer');
              let isPlaying = true;
              let isMuted = false;
              
              function togglePlayPause() {
                if (video.paused) {
                  video.play();
                  isPlaying = true;
                } else {
                  video.pause();
                  isPlaying = false;
                }
              }
              
              function toggleMute() {
                video.muted = !video.muted;
                isMuted = video.muted;
              }
              
              function setVolume(value) {
                video.volume = value;
                video.muted = value == 0;
              }
              
              function toggleFullscreen() {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }
              
              // Auto-hide controls
              let controlsTimeout;
              document.addEventListener('mousemove', () => {
                document.querySelector('.controls').style.opacity = '1';
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(() => {
                  document.querySelector('.controls').style.opacity = '0.3';
                }, 3000);
              });
              
              // Handle video errors
              video.addEventListener('error', () => {
                alert('Failed to load stream. Please try again.');
              });
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else {
      alert('Stream URL not available for this channel');
    }
    
    onChannelSelect(channel);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const player = document.getElementById('live-tv-player');
    if (player) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  console.log('Filtered channels:', filteredChannels.length, 'out of', channels.length);

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    switch (sortBy) {
      case 'viewers':
        return b.viewers - a.viewers;
      case 'quality':
        const qualityOrder = { '4K': 3, 'HD': 2, 'SD': 1 };
        return qualityOrder[b.quality] - qualityOrder[a.quality];
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'text-purple-400 bg-purple-900/20';
      case 'HD': return 'text-blue-400 bg-blue-900/20';
      case 'SD': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Live TV Channels...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering LiveTVPage with channels:', channels.length, 'categories:', categories.length);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Radio className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Live TV</h1>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                LIVE
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'viewers' | 'quality')}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="viewers">Sort by Viewers</option>
                <option value="quality">Sort by Quality</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              All Channels
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPlayer && selectedChannel && (
          <div className="mb-8">
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <div className="relative aspect-video" id="live-tv-player">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={isMuted}
                  controls
                  poster={selectedChannel.logo}
                >
                  <source src={liveTVService.getChannelStreamUrl(selectedChannel.id) || ''} type="application/x-mpegURL" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Custom Controls Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                    </button>
                    <button
                      onClick={handleMuteToggle}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                    </button>
                    <button
                      onClick={handleFullscreen}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors"
                    >
                      <Maximize className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Channel Info Overlay */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <img src={selectedChannel.logo} alt={selectedChannel.name} className="w-12 h-12 rounded" />
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedChannel.name}</h3>
                      <p className="text-gray-300 text-sm">{selectedChannel.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getQualityColor(selectedChannel.quality)}`}>
                          {selectedChannel.quality}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{formatViewerCount(selectedChannel.viewers)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Globe className="w-4 h-4" />
                          <span>{selectedChannel.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Channels Grid/List */}
        {sortedChannels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No channels found</div>
            <div className="text-gray-500 text-sm">
              {channels.length === 0 ? 'Loading channels...' : 'Try adjusting your search or filter criteria'}
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {sortedChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleChannelClick(channel)}
              className={`bg-slate-900 rounded-lg overflow-hidden hover:bg-slate-800 transition-colors cursor-pointer group ${
                viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="relative aspect-video bg-slate-800">
                    <video
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      poster={channel.logo}
                      onError={(e) => {
                        // Fallback to static image if video fails
                        const video = e.target as HTMLVideoElement;
                        video.style.display = 'none';
                        const fallback = video.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    >
                      <source src={liveTVService.getChannelStreamUrl(channel.id) || ''} type="application/x-mpegURL" />
                    </video>
                    <div 
                      className="w-full h-full object-cover hidden"
                      style={{
                        background: `linear-gradient(135deg, #1e293b 0%, #334155 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    >
                      {channel.name}
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                      LIVE
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {channel.quality}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold truncate">{channel.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getQualityColor(channel.quality)}`}>
                        {channel.quality}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{channel.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{formatViewerCount(channel.viewers)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{channel.country}</span>
                      </div>
                    </div>
                    {channel.schedule && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Now: {channel.schedule.current}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-24 h-16 bg-slate-800 rounded flex-shrink-0">
                    <video
                      className="w-full h-full object-cover rounded"
                      muted
                      loop
                      playsInline
                      poster={channel.logo}
                      onError={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.style.display = 'none';
                        const fallback = video.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    >
                      <source src={liveTVService.getChannelStreamUrl(channel.id) || ''} type="application/x-mpegURL" />
                    </video>
                    <div 
                      className="w-full h-full object-cover rounded hidden"
                      style={{
                        background: `linear-gradient(135deg, #1e293b 0%, #334155 100%)`,
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {channel.name}
                    </div>
                    <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold animate-pulse">
                      LIVE
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold truncate">{channel.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getQualityColor(channel.quality)}`}>
                        {channel.quality}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-1">{channel.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{formatViewerCount(channel.viewers)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{channel.country}</span>
                      </div>
                      {channel.schedule && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{channel.schedule.current}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTVPage;
