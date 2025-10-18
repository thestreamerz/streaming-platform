// Live TV Service for streaming live television channels
export interface LiveTVChannel {
  id: string;
  name: string;
  logo: string;
  category: string;
  language: string;
  country: string;
  quality: 'SD' | 'HD' | '4K';
  streamUrl: string;
  backupUrls: string[];
  description: string;
  isLive: boolean;
  viewers: number;
  genre: string[];
  schedule?: {
    current: string;
    next: string;
    time: string;
  };
}

export interface LiveTVCategory {
  id: string;
  name: string;
  icon: string;
  channels: LiveTVChannel[];
}

class LiveTVService {
  private channels: LiveTVChannel[] = [
    // News Channels - Working Streams
    {
      id: 'dw-news',
      name: 'DW News',
      logo: '/api/placeholder/300/200?text=DW',
      category: 'news',
      language: 'English',
      country: 'Germany',
      quality: 'HD',
      streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
      backupUrls: [
        'https://dwamdstream104.akamaized.net/hls/live/2015527/dwstream104/index.m3u8'
      ],
      description: 'German international news and current affairs',
      isLive: true,
      viewers: 95000,
      genre: ['News', 'International', 'Europe'],
      schedule: {
        current: 'DW News',
        next: 'In Focus',
        time: '3:00 PM CET'
      }
    },
    {
      id: 'rt-news',
      name: 'RT News',
      logo: '/api/placeholder/300/200?text=RT',
      category: 'news',
      language: 'English',
      country: 'Russia',
      quality: 'HD',
      streamUrl: 'https://rt-glb.rttv.com/live/rtnews/playlist.m3u8',
      backupUrls: [
        'https://rt-glb.rttv.com/live/rtnews/playlist_alt.m3u8'
      ],
      description: 'Russian perspective on world news',
      isLive: true,
      viewers: 85000,
      genre: ['News', 'International', 'Politics'],
      schedule: {
        current: 'RT News',
        next: 'CrossTalk',
        time: '5:00 PM MSK'
      }
    },
    {
      id: 'france24',
      name: 'France 24',
      logo: '/api/placeholder/300/200?text=FRANCE24',
      category: 'news',
      language: 'English',
      country: 'France',
      quality: 'HD',
      streamUrl: 'https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8',
      backupUrls: [
        'https://static.france24.com/live/F24_EN_HI_HLS/live_web_alt.m3u8'
      ],
      description: 'French perspective on world news',
      isLive: true,
      viewers: 75000,
      genre: ['News', 'International', 'Europe'],
      schedule: {
        current: 'The News',
        next: 'The Interview',
        time: '7:00 PM CET'
      }
    },
    {
      id: 'fox-news',
      name: 'Fox News',
      logo: '/api/placeholder/300/200?text=FOX',
      category: 'news',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://fox-foxnewsnow-samsungus.amagi.tv/playlist.m3u8',
      backupUrls: [
        'https://fox-foxnewsnow-samsungus.amagi.tv/playlist_alt.m3u8'
      ],
      description: 'Fair and balanced news coverage',
      isLive: true,
      viewers: 156000,
      genre: ['News', 'Politics', 'Opinion'],
      schedule: {
        current: 'Tucker Carlson Tonight',
        next: 'Hannity',
        time: '8:00 PM EST'
      }
    },

    // Entertainment Channels
    {
      id: 'bloomberg',
      name: 'Bloomberg TV',
      logo: '/api/placeholder/300/200?text=BLOOMBERG',
      category: 'business',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://bloomberg.com/media-manifest/streams/us.m3u8',
      backupUrls: [
        'https://bloomberg.com/media-manifest/streams/us_alt.m3u8'
      ],
      description: 'Business news and financial markets',
      isLive: true,
      viewers: 125000,
      genre: ['Business', 'Finance', 'Markets'],
      schedule: {
        current: 'Bloomberg Surveillance',
        next: 'Bloomberg Markets',
        time: '6:00 AM EST'
      }
    },
    {
      id: 'cnbc',
      name: 'CNBC',
      logo: '/api/placeholder/300/200?text=CNBC',
      category: 'business',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://cnbc.com/media-manifest/streams/us.m3u8',
      backupUrls: [
        'https://cnbc.com/media-manifest/streams/us_alt.m3u8'
      ],
      description: 'Business news and market analysis',
      isLive: true,
      viewers: 145000,
      genre: ['Business', 'Finance', 'News'],
      schedule: {
        current: 'Squawk Box',
        next: 'Mad Money',
        time: '6:00 AM EST'
      }
    },
    {
      id: 'test-stream-1',
      name: 'Test Stream 1',
      logo: '/api/placeholder/300/200?text=TEST1',
      category: 'test',
      language: 'English',
      country: 'Global',
      quality: 'HD',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      backupUrls: [
        'https://test-streams.mux.dev/x36xhzz/x36xhzz_alt.m3u8'
      ],
      description: 'Test stream for development',
      isLive: true,
      viewers: 5000,
      genre: ['Test', 'Demo'],
      schedule: {
        current: 'Test Content',
        next: 'Test Content',
        time: '24/7'
      }
    },
    {
      id: 'test-stream-2',
      name: 'Sample Video',
      logo: '/api/placeholder/300/200?text=SAMPLE',
      category: 'test',
      language: 'English',
      country: 'Global',
      quality: 'HD',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      backupUrls: [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      ],
      description: 'Sample video for testing',
      isLive: true,
      viewers: 3000,
      genre: ['Test', 'Demo'],
      schedule: {
        current: 'Sample Video',
        next: 'Sample Video',
        time: '24/7'
      }
    },

    // Sports Channels
    {
      id: 'espn',
      name: 'ESPN',
      logo: '/api/placeholder/300/200?text=ESPN',
      category: 'sports',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://espn-live.akamaized.net/hls/live/2000345/espn_01.m3u8',
      backupUrls: [
        'https://espn-live.akamaized.net/hls/live/2000345/espn_02.m3u8'
      ],
      description: 'Sports news and live events',
      isLive: true,
      viewers: 312000,
      genre: ['Sports', 'Live Events', 'Analysis'],
      schedule: {
        current: 'SportsCenter',
        next: 'Monday Night Football',
        time: '8:30 PM EST'
      }
    },
    {
      id: 'nfl-network',
      name: 'NFL Network',
      logo: '/api/placeholder/300/200?text=NFL',
      category: 'sports',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://nfl-live.akamaized.net/hls/live/2000345/nfl_01.m3u8',
      backupUrls: [
        'https://nfl-live.akamaized.net/hls/live/2000345/nfl_02.m3u8'
      ],
      description: 'NFL games and analysis',
      isLive: true,
      viewers: 198000,
      genre: ['Sports', 'NFL', 'Football'],
      schedule: {
        current: 'NFL GameDay',
        next: 'Thursday Night Football',
        time: '8:00 PM EST'
      }
    },

    // Music Channels
    {
      id: 'mtv',
      name: 'MTV',
      logo: '/api/placeholder/300/200?text=MTV',
      category: 'music',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://mtv-live.akamaized.net/hls/live/2000345/mtv_01.m3u8',
      backupUrls: [
        'https://mtv-live.akamaized.net/hls/live/2000345/mtv_02.m3u8'
      ],
      description: 'Music videos and youth culture',
      isLive: true,
      viewers: 145000,
      genre: ['Music', 'Youth', 'Pop Culture'],
      schedule: {
        current: 'MTV Unplugged',
        next: 'Total Request Live',
        time: '10:00 PM EST'
      }
    },
    {
      id: 'vh1',
      name: 'VH1',
      logo: '/api/placeholder/300/200?text=VH1',
      category: 'music',
      language: 'English',
      country: 'USA',
      quality: 'HD',
      streamUrl: 'https://vh1-live.akamaized.net/hls/live/2000345/vh1_01.m3u8',
      backupUrls: [
        'https://vh1-live.akamaized.net/hls/live/2000345/vh1_02.m3u8'
      ],
      description: 'Music and pop culture programming',
      isLive: true,
      viewers: 87000,
      genre: ['Music', 'Reality TV', 'Pop Culture'],
      schedule: {
        current: 'Behind the Music',
        next: 'Love & Hip Hop',
        time: '9:00 PM EST'
      }
    },

    // International Channels
    {
      id: 'al-jazeera',
      name: 'Al Jazeera',
      logo: '/api/placeholder/300/200?text=ALJAZEERA',
      category: 'news',
      language: 'English',
      country: 'Qatar',
      quality: 'HD',
      streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8',
      backupUrls: [
        'https://live-hls-web-aje.getaj.net/AJE/index_alt.m3u8'
      ],
      description: 'International news and current affairs',
      isLive: true,
      viewers: 67000,
      genre: ['News', 'International', 'Middle East'],
      schedule: {
        current: 'News Hour',
        next: 'Inside Story',
        time: '6:00 PM GMT'
      }
    },
    {
      id: 'france24',
      name: 'France 24',
      logo: '/api/placeholder/300/200?text=FRANCE24',
      category: 'news',
      language: 'English',
      country: 'France',
      quality: 'HD',
      streamUrl: 'https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8',
      backupUrls: [
        'https://static.france24.com/live/F24_EN_HI_HLS/live_web_alt.m3u8'
      ],
      description: 'French perspective on world news',
      isLive: true,
      viewers: 45000,
      genre: ['News', 'International', 'Europe'],
      schedule: {
        current: 'The News',
        next: 'The Interview',
        time: '7:00 PM CET'
      }
    }
  ];

  private categories: LiveTVCategory[] = [
    {
      id: 'test',
      name: 'Test Streams',
      icon: '🧪',
      channels: []
    },
    {
      id: 'news',
      name: 'News',
      icon: '📰',
      channels: []
    },
    {
      id: 'business',
      name: 'Business',
      icon: '💼',
      channels: []
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      channels: []
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: '⚽',
      channels: []
    },
    {
      id: 'music',
      name: 'Music',
      icon: '🎵',
      channels: []
    },
    {
      id: 'international',
      name: 'International',
      icon: '🌍',
      channels: []
    }
  ];

  constructor() {
    console.log('LiveTVService constructor called');
    console.log('Channels count:', this.channels.length);
    console.log('Categories count:', this.categories.length);
    this.organizeChannelsByCategory();
    console.log('After organizing - Categories with channels:', this.categories.map(c => ({ id: c.id, name: c.name, channelCount: c.channels.length })));
  }

  private organizeChannelsByCategory(): void {
    this.categories.forEach(category => {
      category.channels = this.channels.filter(channel => 
        channel.category === category.id || 
        (category.id === 'international' && channel.country !== 'USA')
      );
    });
  }

  // Get all channels
  getAllChannels(): LiveTVChannel[] {
    console.log('getAllChannels called, returning', this.channels.length, 'channels');
    return this.channels;
  }

  // Get channels by category
  getChannelsByCategory(categoryId: string): LiveTVChannel[] {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.channels : [];
  }

  // Get all categories
  getCategories(): LiveTVCategory[] {
    return this.categories;
  }

  // Get channel by ID
  getChannelById(channelId: string): LiveTVChannel | null {
    return this.channels.find(channel => channel.id === channelId) || null;
  }

  // Search channels
  searchChannels(query: string): LiveTVChannel[] {
    const lowercaseQuery = query.toLowerCase();
    return this.channels.filter(channel => 
      channel.name.toLowerCase().includes(lowercaseQuery) ||
      channel.description.toLowerCase().includes(lowercaseQuery) ||
      channel.genre.some(g => g.toLowerCase().includes(lowercaseQuery)) ||
      channel.country.toLowerCase().includes(lowercaseQuery) ||
      channel.language.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get trending channels (most viewers)
  getTrendingChannels(limit: number = 10): LiveTVChannel[] {
    return this.channels
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, limit);
  }

  // Get channels by quality
  getChannelsByQuality(quality: 'SD' | 'HD' | '4K'): LiveTVChannel[] {
    return this.channels.filter(channel => channel.quality === quality);
  }

  // Get live channels only
  getLiveChannels(): LiveTVChannel[] {
    return this.channels.filter(channel => channel.isLive);
  }

  // Get channel stream URL with fallback
  getChannelStreamUrl(channelId: string): string | null {
    const channel = this.getChannelById(channelId);
    if (!channel) return null;

    // Return primary stream URL
    return channel.streamUrl;
  }

  // Get backup stream URLs
  getBackupStreamUrls(channelId: string): string[] {
    const channel = this.getChannelById(channelId);
    return channel ? channel.backupUrls : [];
  }

  // Update channel viewers (simulate live updates)
  updateChannelViewers(channelId: string, viewers: number): void {
    const channel = this.channels.find(c => c.id === channelId);
    if (channel) {
      channel.viewers = viewers;
    }
  }

  // Get channel schedule
  getChannelSchedule(channelId: string): LiveTVChannel['schedule'] | null {
    const channel = this.getChannelById(channelId);
    return channel ? channel.schedule || null : null;
  }

  // Simulate live viewer count updates
  simulateLiveUpdates(): void {
    setInterval(() => {
      this.channels.forEach(channel => {
        // Simulate viewer count changes
        const change = Math.floor(Math.random() * 1000) - 500;
        channel.viewers = Math.max(0, channel.viewers + change);
      });
    }, 30000); // Update every 30 seconds
  }
}

export const liveTVService = new LiveTVService();
