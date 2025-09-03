const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Create bundle for latest content
exports.createBundle = functions.https.onRequest(async (request, response) => {
  try {
    // Query the 50 latest content items
    const latestContent = await db.collection('customContent')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    // Query streaming servers
    const streamingServers = await db.collection('streamingServers')
      .get();

    // Query site settings
    const siteSettings = await db.collection('siteSettings')
      .get();

    // Query users (admin only)
    const users = await db.collection('users')
      .orderBy('lastLoginAt', 'desc')
      .limit(20)
      .get();

    // Build the bundle from the query results
    const bundleBuffer = db.bundle('cms-data')
      .add('latest-content-query', latestContent)
      .add('streaming-servers-query', streamingServers)
      .add('site-settings-query', siteSettings)
      .add('users-query', users)
      .build();

    // Cache the response for up to 5 minutes
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.set('Content-Type', 'application/octet-stream');
    
    response.end(bundleBuffer);
  } catch (error) {
    console.error('Error creating bundle:', error);
    response.status(500).send('Error creating bundle');
  }
});

// Create bundle for ad analytics
exports.createAnalyticsBundle = functions.https.onRequest(async (request, response) => {
  try {
    // Query ad impressions from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const adImpressions = await db.collection('adImpressions')
      .where('timestamp', '>=', yesterday)
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    // Query ad clicks from last 24 hours
    const adClicks = await db.collection('adClicks')
      .where('timestamp', '>=', yesterday)
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    // Query daily stats
    const dailyStats = await db.collection('adDailyStats')
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    // Build the analytics bundle
    const bundleBuffer = db.bundle('analytics-data')
      .add('ad-impressions-query', adImpressions)
      .add('ad-clicks-query', adClicks)
      .add('daily-stats-query', dailyStats)
      .build();

    // Cache the response for up to 2 minutes (analytics data changes more frequently)
    response.set('Cache-Control', 'public, max-age=120, s-maxage=300');
    response.set('Content-Type', 'application/octet-stream');
    
    response.end(bundleBuffer);
  } catch (error) {
    console.error('Error creating analytics bundle:', error);
    response.status(500).send('Error creating analytics bundle');
  }
});
