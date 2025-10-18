#!/usr/bin/env node

/**
 * Streaming Platform Validation Script
 * Tests server connectivity and configuration
 */

console.log('🔍 Validating Streaming Platform Configuration...\n');

// Test Server URLs
const servers = [
  { name: 'VidSrc Pro', movie: 'https://vidsrc.pro/embed/movie/27205', tv: 'https://vidsrc.pro/embed/tv/1399/1/1' },
  { name: 'VidSrc.to', movie: 'https://vidsrc.to/embed/movie/27205', tv: 'https://vidsrc.to/embed/tv/1399/1/1' },
  { name: 'VidSrc.xyz', movie: 'https://vidsrc.xyz/embed/movie/27205', tv: 'https://vidsrc.xyz/embed/tv/1399/1/1' },
  { name: 'VidSrc.me', movie: 'https://vidsrc.me/embed/movie/27205', tv: 'https://vidsrc.me/embed/tv/1399/1/1' },
  { name: '2Embed', movie: 'https://www.2embed.cc/embed/tmdb/movie?id=27205', tv: 'https://www.2embed.cc/embed/tmdb/tv?id=1399&s=1&e=1' },
  { name: 'Embed.su', movie: 'https://embed.su/embed/movie/27205', tv: 'https://embed.su/embed/tv/1399/1/1' },
];

async function testServer(name, url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeout);

    if (response.ok || response.status === 403 || response.status === 405) {
      // 403/405 means server exists but blocks HEAD requests (acceptable)
      console.log(`✅ ${name} - ONLINE`);
      return true;
    } else {
      console.log(`⚠️  ${name} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name} - ${error.message}`);
    return false;
  }
}

async function validateAll() {
  console.log('Testing Movie Servers...');
  console.log('━'.repeat(50));
  
  let movieSuccess = 0;
  for (const server of servers) {
    const result = await testServer(server.name, server.movie);
    if (result) movieSuccess++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n\nTesting TV Show Servers...');
  console.log('━'.repeat(50));
  
  let tvSuccess = 0;
  for (const server of servers) {
    const result = await testServer(server.name, server.tv);
    if (result) tvSuccess++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n\n📊 Results:');
  console.log('━'.repeat(50));
  console.log(`Movie Servers: ${movieSuccess}/${servers.length} online`);
  console.log(`TV Servers: ${tvSuccess}/${servers.length} online`);
  console.log(`Overall: ${((movieSuccess + tvSuccess) / (servers.length * 2) * 100).toFixed(1)}% operational`);

  if (movieSuccess === 0 || tvSuccess === 0) {
    console.log('\n⚠️  WARNING: No servers available! Check your internet connection.');
    process.exit(1);
  } else if (movieSuccess < 2 || tvSuccess < 2) {
    console.log('\n⚠️  WARNING: Limited servers available. Some content may not play.');
  } else {
    console.log('\n✅ Configuration looks good! Multiple servers available.');
  }
}

validateAll().catch(error => {
  console.error('\n❌ Validation failed:', error);
  process.exit(1);
});

