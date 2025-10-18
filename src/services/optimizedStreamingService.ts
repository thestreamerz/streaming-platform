// Optimized Streaming Service with Advanced Performance Features
import { performanceOptimizer } from './performanceOptimizer';

export interface OptimizedStreamingServer {
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
  healthScore: number;
  lastHealthCheck: number;
  responseTime: number;
  successRate: number;
}

export interface OptimizedStreamingSource {
  id: string;
  title: string;
  url: string;
  quality: string;
  server: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  verified: boolean;
  healthScore: number;
  responseTime: number;
}

class OptimizedStreamingService {
  private servers: OptimizedStreamingServer[] = [
    // Primary Streaming Servers with Health Monitoring
    {
      id: '2embed',
      name: '2Embed',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://www.2embed.cc/embed',
      active: true,
      priority: 1,
      category: 'streaming',
      features: ['HD Quality', 'Fast Loading', 'Reliable', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'vidsrc-to',
      name: 'VidSrc.to',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://vidsrc.to/embed',
      active: true,
      priority: 2,
      category: 'streaming',
      features: ['HD Quality', 'Multiple Sources', 'TV Shows', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'vidsrc-me',
      name: 'VidSrc.me',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.me/embed',
      active: true,
      priority: 3,
      category: 'streaming',
      features: ['HD Quality', 'Backup Source', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'embed-su',
      name: 'Embed.su',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://embed.su/embed',
      active: true,
      priority: 4,
      category: 'streaming',
      features: ['HD Quality', 'Backup Source', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'vidsrc-xyz',
      name: 'VidSrc.xyz',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.xyz/embed',
      active: true,
      priority: 5,
      category: 'streaming',
      features: ['HD Quality', 'Backup Source', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'vidsrc-pro',
      name: 'VidSrc.pro',
      quality: '4K',
      type: 'premium',
      baseUrl: 'https://vidsrc.pro/embed',
      active: true,
      priority: 6,
      category: 'streaming',
      features: ['4K Quality', 'Premium Source', 'High Bitrate', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'multiembed',
      name: 'MultiEmbed',
      quality: 'HD',
      type: 'premium',
      baseUrl: 'https://multiembed.mov',
      active: true,
      priority: 7,
      category: 'streaming',
      features: ['HD Quality', 'Premium Source', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    },
    {
      id: 'smashy-stream',
      name: 'Smashy Stream',
      quality: 'HD',
      type: 'premium',
      baseUrl: 'https://player.smashy.stream',
      active: true,
      priority: 8,
      category: 'streaming',
      features: ['HD Quality', 'Premium Source', 'Health Monitoring'],
      healthScore: 100,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      successRate: 100
    }
  ];

  private healthCheckInterval: NodeJS.Timeout | null = null;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private serverLoadBalancer = new Map<string, number>();

  constructor() {
    this.startHealthMonitoring();
    this.initializeLoadBalancer();
  }

  // Initialize Load Balancer
  private initializeLoadBalancer(): void {
    this.servers.forEach(server => {
      this.serverLoadBalancer.set(server.id, 0);
    });
  }

  // Start Health Monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  // Perform Health Checks
  private async performHealthChecks(): Promise<void> {
    const healthChecks = this.servers.map(async (server) => {
      if (!server.active) return;

      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Test with a simple request
        const testUrl = `${server.baseUrl}/test`;
        const response = await fetch(testUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'STREAMERZ/2.0',
            'Accept': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // Update server health
        server.healthScore = response.ok ? Math.min(100, server.healthScore + 5) : Math.max(0, server.healthScore - 10);
        server.lastHealthCheck = Date.now();
        server.responseTime = responseTime;
        server.successRate = response.ok ? Math.min(100, server.successRate + 1) : Math.max(0, server.successRate - 5);

        console.log(`🏥 Health check ${server.name}: ${server.healthScore}% (${responseTime}ms)`);

      } catch (error) {
        server.healthScore = Math.max(0, server.healthScore - 15);
        server.lastHealthCheck = Date.now();
        server.responseTime = 9999;
        server.successRate = Math.max(0, server.successRate - 10);

        console.log(`❌ Health check failed ${server.name}: ${server.healthScore}%`);
      }
    });

    await Promise.allSettled(healthChecks);
  }

  // Get Best Server Based on Health and Load
  private getBestServer(): OptimizedStreamingServer | null {
    const activeServers = this.servers
      .filter(server => server.active && server.healthScore > 50)
      .sort((a, b) => {
        // Sort by health score, then by response time, then by load
        const healthDiff = b.healthScore - a.healthScore;
        if (healthDiff !== 0) return healthDiff;
        
        const responseDiff = a.responseTime - b.responseTime;
        if (responseDiff !== 0) return responseDiff;
        
        const loadA = this.serverLoadBalancer.get(a.id) || 0;
        const loadB = this.serverLoadBalancer.get(b.id) || 0;
        return loadA - loadB;
      });

    return activeServers[0] || null;
  }

  // Update Server Load
  private updateServerLoad(serverId: string, increment: boolean = true): void {
    const currentLoad = this.serverLoadBalancer.get(serverId) || 0;
    this.serverLoadBalancer.set(serverId, increment ? currentLoad + 1 : Math.max(0, currentLoad - 1));
  }

  // Get Movie Sources with Optimization
  async getMovieSources(movieId: number, title: string): Promise<OptimizedStreamingSource[]> {
    const cacheKey = `movie_${movieId}_${title}`;
    
    // Check cache first
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      console.log('🎯 Cache hit for movie sources:', title);
      return cached.data;
    }

    const bestServer = this.getBestServer();
    if (!bestServer) {
      console.error('❌ No healthy servers available');
      return this.getFallbackSources(movieId, title, 'movie');
    }

    try {
      this.updateServerLoad(bestServer.id, true);
      
      const sources = await this.fetchMovieSourcesFromServer(bestServer, movieId, title);
      
      // Cache successful result
      this.requestCache.set(cacheKey, {
        data: sources,
        timestamp: Date.now()
      });

      this.updateServerLoad(bestServer.id, false);
      return sources;

    } catch (error) {
      this.updateServerLoad(bestServer.id, false);
      console.error(`❌ Failed to get sources from ${bestServer.name}:`, error);
      
      // Try fallback servers
      return this.getFallbackSources(movieId, title, 'movie');
    }
  }

  // Get TV Show Sources with Optimization
  async getTVShowSources(showId: number, season: number, episode: number, title: string): Promise<OptimizedStreamingSource[]> {
    const cacheKey = `tv_${showId}_${season}_${episode}_${title}`;
    
    // Check cache first
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      console.log('🎯 Cache hit for TV sources:', title);
      return cached.data;
    }

    const bestServer = this.getBestServer();
    if (!bestServer) {
      console.error('❌ No healthy servers available');
      return this.getFallbackSources(showId, title, 'tv', season, episode);
    }

    try {
      this.updateServerLoad(bestServer.id, true);
      
      const sources = await this.fetchTVSourcesFromServer(bestServer, showId, season, episode, title);
      
      // Cache successful result
      this.requestCache.set(cacheKey, {
        data: sources,
        timestamp: Date.now()
      });

      this.updateServerLoad(bestServer.id, false);
      return sources;

    } catch (error) {
      this.updateServerLoad(bestServer.id, false);
      console.error(`❌ Failed to get sources from ${bestServer.name}:`, error);
      
      // Try fallback servers
      return this.getFallbackSources(showId, title, 'tv', season, episode);
    }
  }

  // Fetch Movie Sources from Specific Server
  private async fetchMovieSourcesFromServer(
    server: OptimizedStreamingServer,
    movieId: number,
    title: string
  ): Promise<OptimizedStreamingSource[]> {
    const url = `${server.baseUrl}/${movieId}`;
    
    const response = await performanceOptimizer.optimizedFetch(url, {}, {
      cache: true,
      deduplicate: true,
      rateLimit: `server_${server.id}`,
      timeout: 8000,
      retries: 2
    });

    return this.parseStreamingResponse(response, server, 'movie', title);
  }

  // Fetch TV Sources from Specific Server
  private async fetchTVSourcesFromServer(
    server: OptimizedStreamingServer,
    showId: number,
    season: number,
    episode: number,
    title: string
  ): Promise<OptimizedStreamingSource[]> {
    const url = `${server.baseUrl}/${showId}/${season}/${episode}`;
    
    const response = await performanceOptimizer.optimizedFetch(url, {}, {
      cache: true,
      deduplicate: true,
      rateLimit: `server_${server.id}`,
      timeout: 8000,
      retries: 2
    });

    return this.parseStreamingResponse(response, server, 'tv', title, season, episode);
  }

  // Parse Streaming Response
  private parseStreamingResponse(
    response: any,
    server: OptimizedStreamingServer,
    type: 'movie' | 'tv',
    title: string,
    season?: number,
    episode?: number
  ): OptimizedStreamingSource[] {
    const sources: OptimizedStreamingSource[] = [];

    if (response && response.sources) {
      response.sources.forEach((source: any, index: number) => {
        sources.push({
          id: `${server.id}_${index}`,
          title,
          url: source.url || source.file,
          quality: source.quality || server.quality,
          server: server.name,
          type,
          season,
          episode,
          verified: true,
          healthScore: server.healthScore,
          responseTime: server.responseTime
        });
      });
    }

    return sources;
  }

  // Get Fallback Sources
  private getFallbackSources(
    id: number,
    title: string,
    type: 'movie' | 'tv',
    season?: number,
    episode?: number
  ): OptimizedStreamingSource[] {
    return [{
      id: 'fallback_1',
      title,
      url: `https://vidsrc.to/embed/${type}/${id}${type === 'tv' ? `/${season}/${episode}` : ''}`,
      quality: 'HD',
      server: 'Fallback',
      type,
      season,
      episode,
      verified: false,
      healthScore: 50,
      responseTime: 0
    }];
  }

  // Get Server Status
  getServerStatus(): OptimizedStreamingServer[] {
    return this.servers.map(server => ({
      ...server,
      lastHealthCheck: Date.now() - server.lastHealthCheck
    }));
  }

  // Get Performance Metrics
  getPerformanceMetrics() {
    return performanceOptimizer.getMetrics();
  }

  // Clear Cache
  clearCache(): void {
    this.requestCache.clear();
    performanceOptimizer.clearCache();
    console.log('🧹 All caches cleared');
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

export const optimizedStreamingService = new OptimizedStreamingService();
