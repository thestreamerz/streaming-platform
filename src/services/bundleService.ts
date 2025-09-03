import { db } from '../firebase/config';

export interface BundleData {
  content: any[];
  servers: any[];
  settings: any[];
  users: any[];
}

export interface AnalyticsBundleData {
  impressions: any[];
  clicks: any[];
  dailyStats: any[];
}

class BundleService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch and load CMS data bundle
   */
  async fetchCMSBundle(): Promise<BundleData> {
    const cacheKey = 'cms-bundle';
    const cached = this.cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Using cached CMS bundle');
      return cached.data;
    }

    try {
      console.log('📦 Fetching CMS bundle from server...');
      
      // Fetch the bundle from Firebase Hosting
      const resp = await fetch('/createBundle');
      
      if (!resp.ok) {
        throw new Error(`Bundle fetch failed: ${resp.status}`);
      }

      // Check if CDN cache was hit
      const cacheStatus = resp.headers.get('X-Cache');
      console.log(`📦 Bundle cache status: ${cacheStatus || 'UNKNOWN'}`);

      // Load the bundle contents into the Firestore SDK
      await db.loadBundle(resp.body);

      // Query the results from the cache
      const contentQuery = await db.namedQuery('latest-content-query');
      const serversQuery = await db.namedQuery('streaming-servers-query');
      const settingsQuery = await db.namedQuery('site-settings-query');
      const usersQuery = await db.namedQuery('users-query');

      const [contentSnap, serversSnap, settingsSnap, usersSnap] = await Promise.all([
        contentQuery.get({ source: 'cache' }),
        serversQuery.get({ source: 'cache' }),
        settingsQuery.get({ source: 'cache' }),
        usersQuery.get({ source: 'cache' })
      ]);

      const bundleData: BundleData = {
        content: contentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        servers: serversSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        settings: settingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        users: usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };

      // Cache the results
      this.cache.set(cacheKey, { data: bundleData, timestamp: Date.now() });

      console.log('📦 CMS bundle loaded successfully:', {
        content: bundleData.content.length,
        servers: bundleData.servers.length,
        settings: bundleData.settings.length,
        users: bundleData.users.length
      });

      return bundleData;
    } catch (error) {
      console.error('❌ Error loading CMS bundle:', error);
      throw error;
    }
  }

  /**
   * Fetch and load analytics data bundle
   */
  async fetchAnalyticsBundle(): Promise<AnalyticsBundleData> {
    const cacheKey = 'analytics-bundle';
    const cached = this.cache.get(cacheKey);
    
    // Check if we have valid cached data (shorter cache for analytics)
    if (cached && (Date.now() - cached.timestamp) < (2 * 60 * 1000)) {
      console.log('📊 Using cached analytics bundle');
      return cached.data;
    }

    try {
      console.log('📊 Fetching analytics bundle from server...');
      
      // Fetch the bundle from Firebase Hosting
      const resp = await fetch('/createAnalyticsBundle');
      
      if (!resp.ok) {
        throw new Error(`Analytics bundle fetch failed: ${resp.status}`);
      }

      // Load the bundle contents into the Firestore SDK
      await db.loadBundle(resp.body);

      // Query the results from the cache
      const impressionsQuery = await db.namedQuery('ad-impressions-query');
      const clicksQuery = await db.namedQuery('ad-clicks-query');
      const dailyStatsQuery = await db.namedQuery('daily-stats-query');

      const [impressionsSnap, clicksSnap, dailyStatsSnap] = await Promise.all([
        impressionsQuery.get({ source: 'cache' }),
        clicksQuery.get({ source: 'cache' }),
        dailyStatsQuery.get({ source: 'cache' })
      ]);

      const bundleData: AnalyticsBundleData = {
        impressions: impressionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        clicks: clicksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        dailyStats: dailyStatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };

      // Cache the results
      this.cache.set(cacheKey, { data: bundleData, timestamp: Date.now() });

      console.log('📊 Analytics bundle loaded successfully:', {
        impressions: bundleData.impressions.length,
        clicks: bundleData.clicks.length,
        dailyStats: bundleData.dailyStats.length
      });

      return bundleData;
    } catch (error) {
      console.error('❌ Error loading analytics bundle:', error);
      throw error;
    }
  }

  /**
   * Clear all cached bundles
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Bundle cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[]; entries: Array<{ key: string; age: number }> } {
    const now = Date.now();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: now - value.timestamp
      }))
    };
  }
}

export const bundleService = new BundleService();
