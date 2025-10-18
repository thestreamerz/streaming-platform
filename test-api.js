// Simple test script to verify API functionality
const { contentService } = require('./src/services/contentService.ts');

async function testAPI() {
  console.log('🧪 Testing API functionality...\n');
  
  try {
    // Test trending movies
    console.log('1. Testing trending movies...');
    const trendingMovies = await contentService.getTrendingMovies();
    console.log(`✅ Found ${trendingMovies.length} trending movies`);
    
    // Test top rated movies
    console.log('2. Testing top rated movies...');
    const topRatedMovies = await contentService.getTopRatedMovies();
    console.log(`✅ Found ${topRatedMovies.length} top rated movies`);
    
    // Test upcoming movies
    console.log('3. Testing upcoming movies...');
    const upcomingMovies = await contentService.getUpcomingMovies();
    console.log(`✅ Found ${upcomingMovies.length} upcoming movies`);
    
    // Test popular TV shows
    console.log('4. Testing popular TV shows...');
    const popularTV = await contentService.getPopularTVShows();
    console.log(`✅ Found ${popularTV.length} popular TV shows`);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();
