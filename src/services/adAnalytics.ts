import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AdImpression {
  id?: string;
  adId: string;
  adType: 'banner' | 'popunder' | 'smartlink';
  userId?: string;
  sessionId: string;
  timestamp: Date;
  pageUrl: string;
  userAgent: string;
  referrer: string;
  viewDuration?: number; // in seconds
  isVisible: boolean;
}

export interface AdClick {
  id?: string;
  adId: string;
  adType: 'banner' | 'popunder' | 'smartlink';
  impressionId?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  clickedUrl: string;
  pageUrl: string;
  userAgent: string;
  referrer: string;
}

export interface AdConversion {
  id?: string;
  adId: string;
  clickId?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  conversionType: 'signup' | 'subscription' | 'engagement' | 'retention';
  value?: number;
}

export interface AdPerformanceMetrics {
  adId: string;
  adType: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  revenue: number;
  viewTime: number; // Average view time
  uniqueUsers: number;
  period: {
    start: Date;
    end: Date;
  };
}

class AdAnalyticsService {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSessionTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSessionTracking() {
    // Track session start
    this.trackSessionStart();
    
    // Track when user becomes visible/invisible
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Track ad impression
  async trackImpression(adId: string, adType: 'banner' | 'popunder' | 'smartlink', element?: HTMLElement): Promise<string> {
    try {
      const impressionData: Omit<AdImpression, 'id'> = {
        adId,
        adType,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        isVisible: !document.hidden
      };

      const docRef = await addDoc(collection(db, 'adImpressions'), impressionData);
      
      // If element is provided, track visibility
      if (element) {
        this.trackElementVisibility(element, docRef.id);
      }

      // Update daily statistics
      await this.updateDailyStats('impressions', adId, adType);

      console.log(`📊 Ad impression tracked: ${adId} (${adType})`);
      return docRef.id;
    } catch (error) {
      console.error('Error tracking impression:', error);
      return '';
    }
  }

  // Track ad click
  async trackClick(adId: string, adType: 'banner' | 'popunder' | 'smartlink', clickedUrl: string, impressionId?: string): Promise<string> {
    try {
      const clickData: Omit<AdClick, 'id'> = {
        adId,
        adType,
        impressionId,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date(),
        clickedUrl,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };

      const docRef = await addDoc(collection(db, 'adClicks'), clickData);

      // Update daily statistics
      await this.updateDailyStats('clicks', adId, adType);

      console.log(`🖱️ Ad click tracked: ${adId} (${adType}) -> ${clickedUrl}`);
      return docRef.id;
    } catch (error) {
      console.error('Error tracking click:', error);
      return '';
    }
  }

  // Track conversion
  async trackConversion(
    adId: string, 
    conversionType: 'signup' | 'subscription' | 'engagement' | 'retention',
    clickId?: string,
    value?: number
  ): Promise<void> {
    try {
      const conversionData: Omit<AdConversion, 'id'> = {
        adId,
        clickId,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date(),
        conversionType,
        value
      };

      await addDoc(collection(db, 'adConversions'), conversionData);

      // Update daily statistics
      await this.updateDailyStats('conversions', adId, 'unknown', value || 0);

      console.log(`💰 Ad conversion tracked: ${adId} (${conversionType})`);
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  // Track element visibility (for view time)
  private trackElementVisibility(element: HTMLElement, impressionId: string) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Element is visible, start tracking view time
            const startTime = Date.now();
            element.setAttribute('data-view-start', startTime.toString());
          } else {
            // Element is not visible, calculate view duration
            const startTime = element.getAttribute('data-view-start');
            if (startTime) {
              const viewDuration = (Date.now() - parseInt(startTime)) / 1000;
              this.updateImpressionViewTime(impressionId, viewDuration);
              element.removeAttribute('data-view-start');
            }
          }
        });
      },
      { threshold: 0.5 } // 50% of element must be visible
    );

    observer.observe(element);
  }

  // Update impression with view time
  private async updateImpressionViewTime(impressionId: string, viewDuration: number) {
    try {
      const impressionRef = doc(db, 'adImpressions', impressionId);
      await updateDoc(impressionRef, {
        viewDuration
      });
    } catch (error) {
      console.error('Error updating view time:', error);
    }
  }

  // Update daily statistics
  private async updateDailyStats(metric: 'impressions' | 'clicks' | 'conversions', adId: string, adType: string, value: number = 1) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const statsId = `${today}_${adId}`;
      const statsRef = doc(db, 'adDailyStats', statsId);
      
      const updateData: any = {};
      updateData[metric] = increment(value);
      updateData.adId = adId;
      updateData.adType = adType;
      updateData.date = today;
      updateData.lastUpdated = new Date();

      await updateDoc(statsRef, updateData);
    } catch (error) {
      // Document might not exist, create it
      try {
        const statsData = {
          adId,
          adType,
          date: new Date().toISOString().split('T')[0],
          impressions: metric === 'impressions' ? value : 0,
          clicks: metric === 'clicks' ? value : 0,
          conversions: metric === 'conversions' ? value : 0,
          revenue: metric === 'conversions' ? value : 0,
          lastUpdated: new Date()
        };
        
        const statsRef = doc(db, 'adDailyStats', `${statsData.date}_${adId}`);
        await setDoc(statsRef, statsData, { merge: true });
      } catch (createError) {
        console.error('Error creating daily stats:', createError);
      }
    }
  }

  // Get performance metrics for a specific ad
  async getAdPerformance(adId: string, days: number = 30): Promise<AdPerformanceMetrics | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily stats for the period
      const statsQuery = query(
        collection(db, 'adDailyStats'),
        where('adId', '==', adId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const statsSnapshot = await getDocs(statsQuery);
      
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let totalRevenue = 0;
      let adType = 'unknown';

      statsSnapshot.forEach(doc => {
        const data = doc.data();
        totalImpressions += data.impressions || 0;
        totalClicks += data.clicks || 0;
        totalConversions += data.conversions || 0;
        totalRevenue += data.revenue || 0;
        if (data.adType) adType = data.adType;
      });

      // Calculate view time average
      const impressionsQuery = query(
        collection(db, 'adImpressions'),
        where('adId', '==', adId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const impressionsSnapshot = await getDocs(impressionsQuery);
      let totalViewTime = 0;
      let viewTimeCount = 0;
      const uniqueUsers = new Set();

      impressionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.viewDuration) {
          totalViewTime += data.viewDuration;
          viewTimeCount++;
        }
        if (data.userId) {
          uniqueUsers.add(data.userId);
        }
      });

      const avgViewTime = viewTimeCount > 0 ? totalViewTime / viewTimeCount : 0;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      return {
        adId,
        adType,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        ctr,
        conversionRate,
        revenue: totalRevenue,
        viewTime: avgViewTime,
        uniqueUsers: uniqueUsers.size,
        period: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      console.error('Error getting ad performance:', error);
      return null;
    }
  }

  // Get overall platform ad performance
  async getOverallPerformance(days: number = 30): Promise<AdPerformanceMetrics[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const statsQuery = query(
        collection(db, 'adDailyStats'),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const statsSnapshot = await getDocs(statsQuery);
      const adPerformance = new Map();

      statsSnapshot.forEach(doc => {
        const data = doc.data();
        const adId = data.adId;

        if (!adPerformance.has(adId)) {
          adPerformance.set(adId, {
            adId,
            adType: data.adType || 'unknown',
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0
          });
        }

        const current = adPerformance.get(adId);
        current.impressions += data.impressions || 0;
        current.clicks += data.clicks || 0;
        current.conversions += data.conversions || 0;
        current.revenue += data.revenue || 0;
      });

      const results: AdPerformanceMetrics[] = [];
      
      for (const [adId, data] of adPerformance) {
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

        results.push({
          ...data,
          ctr,
          conversionRate,
          viewTime: 0, // Would need to calculate separately
          uniqueUsers: 0, // Would need to calculate separately
          period: {
            start: startDate,
            end: endDate
          }
        });
      }

      return results.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error getting overall performance:', error);
      return [];
    }
  }

  // Session tracking
  private async trackSessionStart() {
    try {
      await addDoc(collection(db, 'adSessions'), {
        sessionId: this.sessionId,
        userId: this.userId,
        startTime: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        pageUrl: window.location.href
      });
    } catch (error) {
      console.error('Error tracking session start:', error);
    }
  }

  private async trackSessionEnd() {
    try {
      // This would typically be handled by a cloud function
      // due to beforeunload limitations
      navigator.sendBeacon('/api/session-end', JSON.stringify({
        sessionId: this.sessionId,
        endTime: new Date()
      }));
    } catch (error) {
      console.error('Error tracking session end:', error);
    }
  }

  private handleVisibilityChange() {
    // Track when user switches tabs/minimizes window
    // This affects ad visibility and engagement
    console.log(`Page visibility changed: ${document.hidden ? 'hidden' : 'visible'}`);
  }
}

// Export singleton instance
export const adAnalytics = new AdAnalyticsService();
export default AdAnalyticsService;
