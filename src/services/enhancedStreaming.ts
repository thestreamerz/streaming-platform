// Enhanced streaming service with working embed URLs and improved fallback
export interface StreamingServer {
  id: string;
  name: string;
  quality: string;
  type: 'primary' | 'backup' | 'premium';
  baseUrl: string;
  active: boolean;
  priority: number;
}

export interface StreamingSource {
  id: string;
  title: string;
  quality: string;
  url: string;
  type: 'movie' | 'tv';
  server: string;
  backup?: string[];
}

class EnhancedStreamingService {
  private servers: StreamingServer[] = [
    {
      id: '2embed',
      name: '2Embed',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://www.2embed.cc/embed',
      active: true,
      priority: 1
    },
    {
      id: 'embed-su',
      name: 'Embed.su',
      quality: 'HD',
      type: 'primary',
      baseUrl: 'https://embed.su/embed',
      active: true,
      priority: 2
    },
    {
      id: 'multiembed',
      name: 'MultiEmbed',
      quality: 'HD',
      type: 'premium',
      baseUrl: 'https://multiembed.mov',
      active: true,
      priority: 3
    },
    {
      id: 'vidsrc-primary',
      name: 'VidSrc Primary',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.to/embed',
      active: true,
      priority: 4
    },
    {
      id: 'vidsrc-backup',
      name: 'VidSrc Backup',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.me/embed',
      active: true,
      priority: 5
    },
    {
      id: 'vidsrc-xyz',
      name: 'VidSrc XYZ',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.xyz/embed',
      active: true,
      priority: 6
    },
    {
      id: 'vidsrc-pro',
      name: 'VidSrc Pro',
      quality: '4K',
      type: 'premium',
      baseUrl: 'https://vidsrc.pro/embed',
      active: true,
      priority: 7
    },
    {
      id: 'smashy-stream',
      name: 'Smashy Stream',
      quality: 'HD',
      type: 'premium',
      baseUrl: 'https://player.smashy.stream',
      active: true,
      priority: 8
    },
    {
      id: 'watchug-inspired',
      name: 'WatchUG Inspired',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.to/embed',
      active: true,
      priority: 9
    },
    {
      id: 'working-server-1',
      name: 'Working Server 1',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.to/embed',
      active: true,
      priority: 10
    },
    {
      id: 'working-server-2',
      name: 'Working Server 2',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://www.2embed.cc/embed',
      active: true,
      priority: 11
    },
    {
      id: 'working-server-3',
      name: 'Working Server 3',
      quality: 'HD',
      type: 'backup',
      baseUrl: 'https://vidsrc.me/embed',
      active: true,
      priority: 12
    }
  ];

  // Get movie streaming sources with multiple servers and enhanced fallback
  getMovieStreamingSources(tmdbId: number, title: string): StreamingSource[] {
    const activeServers = this.servers.filter(server => server.active);
    
    return activeServers.map(server => ({
      id: `movie-${tmdbId}-${server.id}`,
      title: `${title} - ${server.name} (${server.quality})`,
      quality: server.quality,
      url: this.buildMovieUrl(server, tmdbId),
      type: 'movie' as const,
      server: server.name,
      backup: this.getBackupUrls(server, 'movie', tmdbId)
    }));
  }

  // Get TV show streaming sources with multiple servers and enhanced fallback
  getTVShowStreamingSources(tmdbId: number, season: number, episode: number, title: string): StreamingSource[] {
    const activeServers = this.servers.filter(server => server.active);
    
    return activeServers.map(server => ({
      id: `tv-${tmdbId}-${season}-${episode}-${server.id}`,
      title: `${title} - ${server.name} (${server.quality})`,
      quality: server.quality,
      url: this.buildTVUrl(server, tmdbId, season, episode),
      type: 'tv' as const,
      server: server.name,
      backup: this.getBackupUrls(server, 'tv', tmdbId, season, episode)
    }));
  }

  private buildMovieUrl(server: StreamingServer, tmdbId: number): string {
    switch (server.id) {
      case 'vidsrc-primary':
      case 'vidsrc-backup':
      case 'vidsrc-xyz':
      case 'vidsrc-pro':
      case 'working-server-1':
      case 'working-server-3':
        return `${server.baseUrl}/movie/${tmdbId}`;
      case '2embed':
      case 'working-server-2':
        return `${server.baseUrl}/${tmdbId}`;
      case 'embed-su':
        return `${server.baseUrl}/movie/${tmdbId}`;
      case 'multiembed':
        return `${server.baseUrl}/?video_id=${tmdbId}&tmdb=1`;
      case 'smashy-stream':
        return `${server.baseUrl}/movie/${tmdbId}`;
      case 'watchug-inspired':
        return `${server.baseUrl}/movie/${tmdbId}`;
      default:
        return `${server.baseUrl}/movie/${tmdbId}`;
    }
  }

  private buildTVUrl(server: StreamingServer, tmdbId: number, season: number, episode: number): string {
    switch (server.id) {
      case 'vidsrc-primary':
      case 'vidsrc-backup':
      case 'vidsrc-xyz':
      case 'vidsrc-pro':
      case 'working-server-1':
      case 'working-server-3':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      case '2embed':
      case 'working-server-2':
        return `${server.baseUrl}/${tmdbId}&s=${season}&e=${episode}`;
      case 'embed-su':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      case 'multiembed':
        return `${server.baseUrl}/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      case 'smashy-stream':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      case 'watchug-inspired':
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
      default:
        return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
    }
  }

  private getBackupUrls(server: StreamingServer, type: 'movie' | 'tv', tmdbId: number, season?: number, episode?: number): string[] {
    const backupUrls: string[] = [];
    
    // Add alternative server URLs as backup
    if (type === 'movie') {
      backupUrls.push(`https://vidsrc.to/embed/movie/${tmdbId}`);
      backupUrls.push(`https://www.2embed.cc/embed/${tmdbId}`);
      backupUrls.push(`https://vidsrc.me/embed/movie/${tmdbId}`);
    } else {
      if (season && episode) {
        backupUrls.push(`https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`);
        backupUrls.push(`https://www.2embed.cc/embed/${tmdbId}&s=${season}&e=${episode}`);
        backupUrls.push(`https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`);
      }
    }
    
    return backupUrls;
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

  // Get embed URL for iframe with enhanced error handling
  getEmbedUrl(source: StreamingSource): string {
    if (!source || !source.url) {
      console.error('Invalid source provided to getEmbedUrl');
      return '';
    }
    
    // Validate URL format
    try {
      new URL(source.url);
      return source.url;
    } catch (error) {
      console.error('Invalid URL format:', source.url);
      return '';
    }
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
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
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

  // Get server statistics
  getServerStats(): { total: number; active: number; inactive: number } {
    const total = this.servers.length;
    const active = this.servers.filter(s => s.active).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  }
}

export const enhancedStreamingService = new EnhancedStreamingService();