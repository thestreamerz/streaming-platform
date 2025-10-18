// Enhanced streaming service with multiple working servers and torrent integration
export interface StreamingServer {
  id: string;
  name: string;
  quality: string;
  type: 'primary' | 'backup' | 'premium' | 'torrent' | 'cloud';
  baseUrl: string;
  active: boolean;
  priority: number;
  category: 'streaming' | 'torrent' | 'cloud';
  features: string[];
  mirrors?: string[];
}

export interface StreamingSource {
  id: string;
  title: string;
  quality: string;
  url: string;
  type: 'movie' | 'tv';
  server: string;
  backup?: string[];
  category: 'streaming' | 'torrent' | 'cloud';
  features?: string[];
  size?: string;
  seeds?: number;
  leeches?: number;
  verified?: boolean;
}

class EnhancedStreamingService {
  private serverHealth: { [id: string]: boolean } = {};
  private serverPerformance: { [id: string]: { responseTime: number; successRate: number; lastChecked: number } } = {};
  private healthLastChecked = 0;
  private performanceCache: { [key: string]: { data: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private servers: StreamingServer[] = [
    // HIGH-PERFORMANCE STREAMING SERVERS - 2025 OPTIMIZED
    {
      id: 'vidsrc-xyz',
      name: 'VidSrc XYZ',
      quality: '4K',
      type: 'premium',
      baseUrl: 'https://vidsrc.xyz',
      active: true,
      priority: 1,
      category: 'streaming',
      features: ['4K Quality', 'Ultra Fast', 'Most Reliable', 'Global CDN', 'Auto Quality']
    },
    {
      id: 'vidsrc-to',
      name: 'VidSrc.to',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://vidsrc.to',
      active: true,
      priority: 2,
      category: 'streaming',
      features: ['HD Quality', 'Fast Loading', 'Multiple Sources', 'Stable']
    },
    {
      id: 'vidsrc-me',
      name: 'VidSrc.me',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://vidsrc.me',
      active: true,
      priority: 3,
      category: 'streaming',
      features: ['HD Quality', 'Backup Source', 'Reliable', 'Fast']
    },
    {
      id: '2embed',
      name: '2Embed',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://www.2embed.cc',
      active: true,
      priority: 4,
      category: 'streaming',
      features: ['HD Quality', 'Multiple Providers', 'Fast', 'Stable']
    },
    {
      id: 'embed-su',
      name: 'Embed.su',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://embed.su',
      active: true,
      priority: 5,
      category: 'streaming',
      features: ['HD Quality', 'Fast Loading', 'Reliable', 'Good Uptime']
    },
    {
      id: 'vidsrc-pro',
      name: 'VidSrc Pro',
      quality: '4K',
      type: 'premium',
      baseUrl: 'https://vidsrc.pro',
      active: true,
      priority: 6,
      category: 'streaming',
      features: ['4K Quality', 'Premium', 'High Speed', 'Multiple Sources']
    },
    {
      id: 'vidsrc-net',
      name: 'VidSrc Net',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.net',
      active: true,
      priority: 7,
      category: 'streaming',
      features: ['HD Quality', 'Backup', 'Alternative', 'Stable']
    },
    {
      id: 'vidsrc-cc',
      name: 'VidSrc CC',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.cc',
      active: true,
      priority: 8,
      category: 'streaming',
      features: ['HD Quality', 'Backup', 'Reliable', 'Fast']
    }
    // OPTIMIZED FOR MAXIMUM PERFORMANCE - 2025
  ];

  // Get movie streaming sources with intelligent performance-based selection
  getMovieStreamingSources(tmdbId: number, title: string): StreamingSource[] {
    console.log(`🎬 Getting movie streaming sources for: ${title} (TMDB ID: ${tmdbId})`);
    
    // Check cache first
    const cacheKey = `movie-${tmdbId}`;
    const cached = this.performanceCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached sources');
      return cached.data;
    }
    
    const activeServers = this.servers
      .filter(server => server.active)
      .sort((a, b) => {
        // Sort by performance metrics
        const aPerf = this.serverPerformance[a.id];
        const bPerf = this.serverPerformance[b.id];
        
        // Health first
        const ah = this.serverHealth[a.id] ? 0 : 1;
        const bh = this.serverHealth[b.id] ? 0 : 1;
        if (ah !== bh) return ah - bh;
        
        // Then by performance (response time + success rate)
        if (aPerf && bPerf) {
          const aScore = (aPerf.successRate * 100) - (aPerf.responseTime / 1000);
          const bScore = (bPerf.successRate * 100) - (bPerf.responseTime / 1000);
          return bScore - aScore;
        }
        
        // Finally by priority
        return a.priority - b.priority;
      });
    
    console.log(`✅ Found ${activeServers.length} active servers`);
    const sources: StreamingSource[] = [];
    
    // Add streaming sources
    const streamingServers = activeServers.filter(server => server.category === 'streaming');
    console.log(`🎥 Adding ${streamingServers.length} streaming servers`);
    
    streamingServers.forEach(server => {
      const url = this.buildMovieUrl(server, tmdbId);
      console.log(`  ➡️ ${server.name}: ${url}`);
      
      sources.push({
        id: `movie-${tmdbId}-${server.id}`,
        title: `${title} - ${server.name} (${server.quality})`,
        quality: server.quality,
        url: url,
        type: 'movie' as const,
        server: server.name,
        backup: this.getBackupUrls(server, 'movie', tmdbId),
        category: 'streaming',
        features: server.features
      });
    });
    
    // ONLY streaming sources - NO torrents or cloud services
    const sortedSources = sources.sort((a, b) => {
      const serverA = this.servers.find(s => s.name === a.server);
      const serverB = this.servers.find(s => s.name === b.server);
      return (serverA?.priority || 999) - (serverB?.priority || 999);
    });
    
    console.log(`✅ Total movie sources generated: ${sortedSources.length}`);
    sortedSources.forEach((src, idx) => {
      console.log(`  ${idx + 1}. ${src.server} (${src.quality}) - ${src.category}`);
    });
    
    // Cache the results
    this.performanceCache[cacheKey] = {
      data: sortedSources,
      timestamp: Date.now()
    };
    
    return sortedSources;
  }

  // Get TV show streaming sources with intelligent performance-based selection
  getTVShowStreamingSources(tmdbId: number, season: number, episode: number, title: string): StreamingSource[] {
    console.log(`📺 Getting TV show streaming sources for: ${title} S${season}E${episode} (TMDB ID: ${tmdbId})`);
    
    // Check cache first
    const cacheKey = `tv-${tmdbId}-${season}-${episode}`;
    const cached = this.performanceCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached sources');
      return cached.data;
    }
    
    const activeServers = this.servers
      .filter(server => server.active)
      .sort((a, b) => {
        // Sort by performance metrics
        const aPerf = this.serverPerformance[a.id];
        const bPerf = this.serverPerformance[b.id];
        
        // Health first
        const ah = this.serverHealth[a.id] ? 0 : 1;
        const bh = this.serverHealth[b.id] ? 0 : 1;
        if (ah !== bh) return ah - bh;
        
        // Then by performance (response time + success rate)
        if (aPerf && bPerf) {
          const aScore = (aPerf.successRate * 100) - (aPerf.responseTime / 1000);
          const bScore = (bPerf.successRate * 100) - (bPerf.responseTime / 1000);
          return bScore - aScore;
        }
        
        // Finally by priority
        return a.priority - b.priority;
      });
    
    console.log(`✅ Found ${activeServers.length} active servers`);
    const sources: StreamingSource[] = [];
    
    // Add streaming sources
    const streamingServers = activeServers.filter(server => server.category === 'streaming');
    console.log(`🎥 Adding ${streamingServers.length} streaming servers`);
    
    streamingServers.forEach(server => {
      const url = this.buildTVUrl(server, tmdbId, season, episode);
      console.log(`  ➡️ ${server.name}: ${url}`);
      
      sources.push({
        id: `tv-${tmdbId}-${season}-${episode}-${server.id}`,
        title: `${title} S${season}E${episode} - ${server.name} (${server.quality})`,
        quality: server.quality,
        url: url,
        type: 'tv' as const,
        server: server.name,
        backup: this.getBackupUrls(server, 'tv', tmdbId, season, episode),
        category: 'streaming',
        features: server.features
      });
    });
    
    // ONLY streaming sources - NO torrents or cloud services
    const sortedSources = sources.sort((a, b) => {
      const serverA = this.servers.find(s => s.name === a.server);
      const serverB = this.servers.find(s => s.name === b.server);
      return (serverA?.priority || 999) - (serverB?.priority || 999);
    });
    
    console.log(`✅ Total TV sources generated: ${sortedSources.length}`);
    sortedSources.forEach((src, idx) => {
      console.log(`  ${idx + 1}. ${src.server} (${src.quality}) - ${src.category}`);
    });
    
    // Cache the results
    this.performanceCache[cacheKey] = {
      data: sortedSources,
      timestamp: Date.now()
    };
    
    return sortedSources;
  }

  // Enhanced server health monitoring with performance metrics
  async refreshServerHealth(force = false): Promise<void> {
    if (!force && Date.now() - this.healthLastChecked < 5 * 60 * 1000) return;
    
    console.log('🔄 Refreshing server health and performance metrics...');
    
    const checks = this.servers.map(async (server) => {
      if (!server.active) {
        this.serverHealth[server.id] = false;
        this.serverPerformance[server.id] = { responseTime: 9999, successRate: 0, lastChecked: Date.now() };
        return;
      }
      
      try {
        const startTime = Date.now();
        const testUrl = server.baseUrl.replace(/\/embed$/, '');
        const signal = (AbortSignal as any)?.timeout
          ? (AbortSignal as any).timeout(3000) // Reduced timeout for faster checks
          : (() => { const c = new AbortController(); setTimeout(() => c.abort(), 3000); return c.signal; })();
        
        const res = await fetch(testUrl, { 
          method: 'HEAD', 
          mode: 'no-cors' as any, 
          signal,
          headers: {
            'User-Agent': 'STREAMERZ/2.0',
            'Cache-Control': 'no-cache'
          }
        });
        
        const responseTime = Date.now() - startTime;
        const isHealthy = true; // If no error, consider healthy
        
        this.serverHealth[server.id] = isHealthy;
        
        // Update performance metrics
        const currentPerf = this.serverPerformance[server.id] || { responseTime: 0, successRate: 0, lastChecked: 0 };
        const newResponseTime = (currentPerf.responseTime + responseTime) / 2; // Moving average
        const newSuccessRate = isHealthy ? Math.min(1, currentPerf.successRate + 0.1) : Math.max(0, currentPerf.successRate - 0.1);
        
        this.serverPerformance[server.id] = {
          responseTime: newResponseTime,
          successRate: newSuccessRate,
          lastChecked: Date.now()
        };
        
        console.log(`✅ ${server.name}: ${responseTime}ms, ${(newSuccessRate * 100).toFixed(1)}% success`);
        
      } catch (error) {
        this.serverHealth[server.id] = false;
        
        // Update performance metrics for failed server
        const currentPerf = this.serverPerformance[server.id] || { responseTime: 9999, successRate: 0, lastChecked: 0 };
        this.serverPerformance[server.id] = {
          responseTime: 9999,
          successRate: Math.max(0, currentPerf.successRate - 0.2),
          lastChecked: Date.now()
        };
        
        console.log(`❌ ${server.name}: Failed (${error})`);
      }
    });
    
    await Promise.allSettled(checks);
    this.healthLastChecked = Date.now();
    
    // Log performance summary
    const healthyServers = Object.values(this.serverHealth).filter(Boolean).length;
    const totalServers = this.servers.filter(s => s.active).length;
    console.log(`📊 Server Health: ${healthyServers}/${totalServers} servers healthy`);
  }

  private buildMovieUrl(server: StreamingServer, tmdbId: number): string {
    // Optimized URL building for maximum performance
    switch (server.id) {
      case 'vidsrc-xyz':
      case 'vidsrc-to':
      case 'vidsrc-me':
      case 'vidsrc-pro':
      case 'vidsrc-net':
      case 'vidsrc-cc':
        // VidSrc family - fastest and most reliable
        return `${server.baseUrl}/embed/movie/${tmdbId}`;
      case '2embed':
        // 2Embed format - optimized
        return `${server.baseUrl}/embed/${tmdbId}`;
      case 'embed-su':
        // Embed.su format - optimized
        return `${server.baseUrl}/embed/movie/${tmdbId}`;
      default:
        // Fallback to VidSrc format
        return `${server.baseUrl}/embed/movie/${tmdbId}`;
    }
  }

  private buildTVUrl(server: StreamingServer, tmdbId: number, season: number, episode: number): string {
    // Optimized URL building for maximum performance
    switch (server.id) {
      case 'vidsrc-xyz':
      case 'vidsrc-to':
      case 'vidsrc-me':
      case 'vidsrc-pro':
      case 'vidsrc-net':
      case 'vidsrc-cc':
        // VidSrc family - fastest and most reliable
        return `${server.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
      case '2embed':
        // 2Embed format - optimized
        return `${server.baseUrl}/embed/${tmdbId}&s=${season}&e=${episode}`;
      case 'embed-su':
        // Embed.su format - optimized
        return `${server.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
      default:
        // Fallback to VidSrc format
        return `${server.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
    }
  }

  private buildTorrentUrl(server: StreamingServer, tmdbId: number, title: string, type: 'movie' | 'tv', season?: number, episode?: number): string {
    const searchQuery = type === 'movie' ? title : `${title} S${season}E${episode}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    switch (server.id) {
      case 'piratebay':
        return `${server.baseUrl}/search/${encodedQuery}/0/99/0`;
      case '1337x':
        return `${server.baseUrl}/search/${encodedQuery}/1/`;
      case 'yts':
        return `${server.baseUrl}/browse-movies/${encodedQuery}/all/all/0/latest`;
      case 'torrentdownloads':
        return `${server.baseUrl}/search/${encodedQuery}/`;
      case 'limetorrents':
        return `${server.baseUrl}/search/${encodedQuery}/`;
      case 'bolly2tolly':
        return `${server.baseUrl}/search/${encodedQuery}/`;
      case 'internetarchive':
        return `${server.baseUrl}/search.php?query=${encodedQuery}`;
      case 'torrentz2':
        return `${server.baseUrl}/search?q=${encodedQuery}`;
      case 'extratorrents':
        return `${server.baseUrl}/search/${encodedQuery}/`;
      default:
        return `${server.baseUrl}/search/${encodedQuery}/`;
    }
  }

  private buildCloudUrl(server: StreamingServer, tmdbId: number, title: string, type: 'movie' | 'tv', season?: number, episode?: number): string {
    const searchQuery = type === 'movie' ? title : `${title} S${season}E${episode}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    switch (server.id) {
      case 'multcloud':
        return `${server.baseUrl}/torrent-to-cloud?q=${encodedQuery}`;
      case 'seedr':
        return `${server.baseUrl}/torrents?q=${encodedQuery}`;
      case 'bitport':
        return `${server.baseUrl}/search?q=${encodedQuery}`;
      default:
        return `${server.baseUrl}/search?q=${encodedQuery}`;
    }
  }

  private getBackupUrls(server: StreamingServer, type: 'movie' | 'tv', tmdbId: number, season?: number, episode?: number): string[] {
    const backupUrls: string[] = [];

    // Optimized backup URLs with high-performance servers
    if (type === 'movie') {
      // VidSrc family - most reliable
      backupUrls.push(`https://vidsrc.xyz/embed/movie/${tmdbId}`);
      backupUrls.push(`https://vidsrc.to/embed/movie/${tmdbId}`);
      backupUrls.push(`https://vidsrc.me/embed/movie/${tmdbId}`);
      backupUrls.push(`https://vidsrc.pro/embed/movie/${tmdbId}`);
      backupUrls.push(`https://vidsrc.net/embed/movie/${tmdbId}`);
      backupUrls.push(`https://vidsrc.cc/embed/movie/${tmdbId}`);
      
      // Alternative high-performance servers
      backupUrls.push(`https://www.2embed.cc/embed/${tmdbId}`);
      backupUrls.push(`https://embed.su/embed/movie/${tmdbId}`);
    } else {
      if (season && episode) {
        // VidSrc family - most reliable
        backupUrls.push(`https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://vidsrc.cc/embed/tv/${tmdbId}/${season}/${episode}`);
        
        // Alternative high-performance servers
        backupUrls.push(`https://www.2embed.cc/embed/${tmdbId}&s=${season}&e=${episode}`);
        backupUrls.push(`https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`);
      }
    }
    
    return backupUrls;
  }

  private getTorrentBackupUrls(server: StreamingServer, type: 'movie' | 'tv', tmdbId: number, title: string, season?: number, episode?: number): string[] {
    const backupUrls: string[] = [];
    const searchQuery = type === 'movie' ? title : `${title} S${season}E${episode}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    // Add mirror URLs for torrent sites
    if (server.mirrors) {
      server.mirrors.forEach(mirror => {
        switch (server.id) {
          case 'piratebay':
            backupUrls.push(`${mirror}/search/${encodedQuery}/0/99/0`);
            break;
          case '1337x':
            backupUrls.push(`${mirror}/search/${encodedQuery}/1/`);
            break;
          case 'limetorrents':
            backupUrls.push(`${mirror}/search/${encodedQuery}/`);
            break;
          case 'torrentdownloads':
            backupUrls.push(`${mirror}/search/${encodedQuery}/`);
            break;
          case 'extratorrents':
            backupUrls.push(`${mirror}/search/${encodedQuery}/`);
            break;
        }
      });
    }

    return backupUrls;
  }

  private getCloudBackupUrls(server: StreamingServer, type: 'movie' | 'tv', tmdbId: number, title: string, season?: number, episode?: number): string[] {
    const backupUrls: string[] = [];
    const searchQuery = type === 'movie' ? title : `${title} S${season}E${episode}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    // Add alternative cloud services
    backupUrls.push(`https://www.multcloud.com/torrent-to-cloud?q=${encodedQuery}`);
    backupUrls.push(`https://www.seedr.cc/torrents?q=${encodedQuery}`);
    backupUrls.push(`https://bitport.io/search?q=${encodedQuery}`);

    return backupUrls;
  }

  private generateFileSize(): string {
    const sizes = ['1.2 GB', '2.5 GB', '4.7 GB', '8.9 GB', '15.2 GB', '25.6 GB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private generateSeedCount(): number {
    return Math.floor(Math.random() * 1000) + 10;
  }

  private generateLeechCount(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  // Get TV show episodes with enhanced fallback
  async getTVShowEpisodes(tmdbId: number, seasonNumber: number): Promise<any[]> {
    try {
      // Try to fetch from TMDB first
      const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=8265bd1679663a7ea12ac168da84d2e8`);
      
        if (response.ok) {
          const data = await response.json();
          return data.episodes || [];
        }
      } catch (error) {
      console.warn('Failed to fetch episodes from TMDB, using fallback');
    }
    
    // Fallback: generate dummy episodes
    return this.generateFallbackEpisodes(seasonNumber);
  }

  private generateFallbackEpisodes(seasonNumber: number): any[] {
    const episodes = [];
    const episodeCount = Math.floor(Math.random() * 10) + 10; // 10-20 episodes
    
    for (let i = 1; i <= episodeCount; i++) {
      episodes.push({
        id: i,
        episode_number: i,
        name: `Episode ${i}`,
        overview: `Episode ${i} of Season ${seasonNumber}`,
        still_path: null,
        air_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return episodes;
  }

  // Get embed URL for iframe with enhanced error handling and fallbacks
  getEmbedUrl(source: StreamingSource): string {
    if (!source || !source.url) {
      console.error('Invalid source provided to getEmbedUrl');
      return this.getFallbackPlayerUrl(source);
    }
    
    // For torrent and cloud sources, return a placeholder or redirect URL
    if (source.category === 'torrent' || source.category === 'cloud') {
      return `https://thestreamerz.web.app/torrent-redirect?url=${encodeURIComponent(source.url)}&title=${encodeURIComponent(source.title)}`;
    }
    
    // For local player, return a special URL
    if (source.server === 'Local Player') {
      return this.getLocalPlayerUrl(source);
    }
    
    // Validate URL format for streaming sources and normalize known patterns
    try {
      const u = new URL(source.url);
      // Normalize vidsrc variations
      if (/vidsrc\.(to|me|xyz|pro|ru|net|cc|io|tv|movie|stream)/.test(u.hostname)) {
        // leave as-is but ensure https
        u.protocol = 'https:';
        return u.toString();
      }
      return u.toString();
    } catch (error) {
      console.error('Invalid URL format:', source.url);
      return this.getFallbackPlayerUrl(source);
    }
  }

  // Get fallback player URL when external services fail
  private getFallbackPlayerUrl(source: StreamingSource): string {
    const title = encodeURIComponent(source.title);
    const quality = encodeURIComponent(source.quality);
    return `https://thestreamerz.web.app/fallback-player?title=${title}&quality=${quality}&server=${encodeURIComponent(source.server || 'Unknown')}`;
  }

  // Get local player URL for internal streaming
  private getLocalPlayerUrl(source: StreamingSource): string {
    const title = encodeURIComponent(source.title);
    const quality = encodeURIComponent(source.quality);
    return `https://thestreamerz.web.app/local-player?title=${title}&quality=${quality}`;
  }

  // Get demo content URL for testing
  getDemoContentUrl(): string {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }

  // Get sample streaming sources for demo
  getSampleStreamingSources(): StreamingSource[] {
    return [
      {
        id: 'demo-1',
        title: 'Demo Content - Big Buck Bunny',
        quality: 'HD',
        url: this.getDemoContentUrl(),
        type: 'movie',
        server: 'Demo Server',
        category: 'streaming',
        features: ['HD Quality', 'Demo Content', 'Reliable']
      },
      {
        id: 'demo-2',
        title: 'Demo Content - Sample Video',
        quality: 'HD',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'movie',
        server: 'Sample Server',
        category: 'streaming',
        features: ['HD Quality', 'Sample Content', 'Fast Loading']
      }
    ];
  }

  // Test server connectivity
  async testServerConnectivity(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const server of this.servers) {
      if (!server.active) {
        results[server.name] = false;
        continue;
      }
      
      try {
        const testUrl = server.baseUrl.replace('/embed', '');
        const signal = (AbortSignal as any)?.timeout
          ? (AbortSignal as any).timeout(5000)
          : (() => { const c = new AbortController(); setTimeout(() => c.abort(), 5000); return c.signal; })();
        const response = await fetch(testUrl, { 
          method: 'HEAD', 
          signal
        });
      
        results[server.name] = response.ok;
    } catch (error) {
        results[server.name] = false;
      }
    }
    
    return results;
  }

  // Get working servers only
  getWorkingServers(): StreamingServer[] {
    return this.servers.filter(server => server.active);
  }

  // Update server status
  updateServerStatus(serverId: string, active: boolean): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.active = active;
      console.log(`Server ${server.name} status updated to: ${active}`);
    }
  }

  // Get servers by category
  getServersByCategory(category: 'streaming' | 'torrent' | 'cloud'): StreamingServer[] {
    return this.servers.filter(server => server.category === category && server.active);
  }

  // Get server statistics with performance metrics
  getServerStats(): { total: number; active: number; inactive: number; byCategory: { [key: string]: number }; performance: { [key: string]: any } } {
    const total = this.servers.length;
    const active = this.servers.filter(s => s.active).length;
    const inactive = total - active;
    
    const byCategory = {
      streaming: this.servers.filter(s => s.category === 'streaming' && s.active).length,
      torrent: this.servers.filter(s => s.category === 'torrent' && s.active).length,
      cloud: this.servers.filter(s => s.category === 'cloud' && s.active).length
    };
    
    // Performance metrics
    const performance = Object.entries(this.serverPerformance).reduce((acc, [serverId, metrics]) => {
      const server = this.servers.find(s => s.id === serverId);
      if (server) {
        acc[server.name] = {
          ...metrics,
          healthy: this.serverHealth[serverId] || false,
          responseTimeMs: Math.round(metrics.responseTime),
          successRatePercent: Math.round(metrics.successRate * 100)
        };
      }
      return acc;
    }, {} as { [key: string]: any });
    
    return { total, active, inactive, byCategory, performance };
  }

  // Search torrents across multiple sources
  async searchTorrents(query: string, category: 'movie' | 'tv' = 'movie'): Promise<StreamingSource[]> {
    const torrentServers = this.servers.filter(server => server.category === 'torrent' && server.active);
    const results: StreamingSource[] = [];
    
    for (const server of torrentServers) {
      try {
        const searchUrl = this.buildTorrentUrl(server, 0, query, category);
        // In a real implementation, you would fetch and parse the search results
        // For now, we'll generate mock results
        results.push({
          id: `search-${server.id}-${Date.now()}`,
          title: `${query} - ${server.name} (${server.quality})`,
          quality: server.quality,
          url: searchUrl,
          type: category,
          server: server.name,
          category: 'torrent',
          features: server.features,
          size: this.generateFileSize(),
          seeds: this.generateSeedCount(),
          leeches: this.generateLeechCount(),
          verified: server.id === 'piratebay' || server.id === '1337x'
        });
      } catch (error) {
        console.warn(`Failed to search ${server.name}:`, error);
      }
    }
    
    return results;
  }
}

export const enhancedStreamingService = new EnhancedStreamingService();