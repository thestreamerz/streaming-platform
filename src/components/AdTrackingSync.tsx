import React, { useEffect } from 'react';
import { adAnalytics } from '../services/adAnalytics';

interface AdTrackingEvent {
  type: 'impression' | 'click';
  data: any;
}

const AdTrackingSync: React.FC = () => {
  useEffect(() => {
    // Function to sync data from localStorage to Firebase
    const syncStoredData = async () => {
      try {
        // Sync impressions
        const storedImpressions = localStorage.getItem('adImpressions');
        if (storedImpressions) {
          const impressions = JSON.parse(storedImpressions);
          for (const impression of impressions) {
            if (!impression.synced) {
              await adAnalytics.trackImpression(
                impression.adId,
                impression.adType
              );
              impression.synced = true;
            }
          }
          localStorage.setItem('adImpressions', JSON.stringify(impressions));
        }

        // Sync clicks
        const storedClicks = localStorage.getItem('adClicks');
        if (storedClicks) {
          const clicks = JSON.parse(storedClicks);
          for (const click of clicks) {
            if (!click.synced) {
              await adAnalytics.trackClick(
                click.adId,
                click.adType,
                click.clickedUrl,
                click.impressionId
              );
              click.synced = true;
            }
          }
          localStorage.setItem('adClicks', JSON.stringify(clicks));
        }
      } catch (error) {
        console.error('Error syncing ad data:', error);
      }
    };

    // Function to handle real-time tracking events
    const handleAdTrackingEvent = async (event: CustomEvent<AdTrackingEvent>) => {
      const { type, data } = event.detail;
      
      try {
        if (type === 'impression') {
          await adAnalytics.trackImpression(data.adId, data.adType);
          console.log('🔄 Synced impression to Firebase:', data.adId);
        } else if (type === 'click') {
          await adAnalytics.trackClick(
            data.adId,
            data.adType,
            data.clickedUrl,
            data.impressionId
          );
          console.log('🔄 Synced click to Firebase:', data.adId);
        }
      } catch (error) {
        console.error('Error handling ad tracking event:', error);
      }
    };

    // Add event listener for custom ad tracking events
    window.addEventListener('adTracking', handleAdTrackingEvent as EventListener);

    // Sync any stored data on component mount
    syncStoredData();

    // Periodically sync data (every 30 seconds)
    const syncInterval = setInterval(syncStoredData, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('adTracking', handleAdTrackingEvent as EventListener);
      clearInterval(syncInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AdTrackingSync;
