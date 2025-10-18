# Streaming Platform - Test & Debug Guide

## ✅ Fixed Issues

### 1. **Server Configuration**
- ✅ Updated primary streaming servers to working alternatives
- ✅ Prioritized VidSrc.pro, VidSrc.to, VidSrc.xyz as main sources
- ✅ Added comprehensive backup URLs for all sources
- ✅ Configured proper URL formats for movies and TV shows

### 2. **Type System**
- ✅ Fixed StreamingSource interface mismatches
- ✅ Re-exported enhanced streaming service types
- ✅ Ensured consistent types across all components

### 3. **Error Handling**
- ✅ Added comprehensive console logging
- ✅ Improved auto-retry logic with backup URLs
- ✅ Better error messages for debugging

### 4. **VideoPlayer Improvements**
- ✅ Added safe currentSourceData initialization
- ✅ Enhanced error handling with detailed logs
- ✅ Fixed backup URL iteration
- ✅ Improved iframe error recovery

## 🎬 How to Test

### Step 1: Build and Run
```bash
npm install
npm run build
npm run preview -- --port 4173 --strictPort
```

### Step 2: Open Browser
Navigate to: `http://localhost:4173`

### Step 3: Test Movie Playback
1. Click on any movie poster
2. Click "Play Now" or "Watch" button
3. **Check Browser Console** for:
   ```
   🎬 Getting movie streaming sources for: [Movie Title]
   ✅ Found X active servers
   🎥 Adding X streaming servers
     ➡️ VidSrc Pro: https://vidsrc.pro/embed/movie/[TMDB_ID]
     ➡️ VidSrc.to: https://vidsrc.to/embed/movie/[TMDB_ID]
   ✅ Total movie sources generated: X
   ```

4. Video player should open with server list on the right
5. If first server fails, it will auto-retry with backups

### Step 4: Test TV Show Playback
1. Click on any TV show poster
2. Select season and episode
3. Click "Play" button
4. **Check Browser Console** for similar logs

### Step 5: Test Server Switching
1. While playing, click the "Settings" icon (⚙️) in player controls
2. Server list should appear on the right side
3. Click any server to switch
4. Verify playback continues with new server

## 🔍 Debugging

### Console Logs to Watch For

#### **Success Case:**
```
🎬 Getting movie streaming sources for: Inception (TMDB ID: 27205)
✅ Found 6 active servers
🎥 Adding 6 streaming servers
  ➡️ VidSrc Pro: https://vidsrc.pro/embed/movie/27205
  ➡️ VidSrc.to: https://vidsrc.to/embed/movie/27205
  ➡️ VidSrc.xyz: https://vidsrc.xyz/embed/movie/27205
✅ Total movie sources generated: 6
🔄 VideoPlayer: Loading source 0 of 6
✅ Iframe loaded successfully
Playing: Inception from VidSrc Pro (HD)
```

#### **Retry Case:**
```
❌ Iframe failed to load
Failed source: VidSrc Pro - https://vidsrc.pro/embed/movie/27205
🔄 Trying backup 1/15: https://vidsrc.to/embed/movie/27205
```

#### **Auto-Switch Case:**
```
🔄 Auto-retrying with next source...
Available sources: VidSrc Pro, VidSrc.to, VidSrc.xyz, VidSrc.me, 2Embed, Embed.su
🔄 Retrying with source 2/6: VidSrc.to
```

### Common Issues & Solutions

#### ❌ "No Streaming Sources Available"
**Cause:** All servers returned 0 sources
**Solution:** Check console for server initialization errors
**Check:**
```javascript
// In browser console
enhancedStreamingService.getMovieStreamingSources(27205, 'Inception')
```

#### ❌ Black screen / Infinite loading
**Cause:** Server URL is incorrect or blocked
**Solution:** 
1. Open Network tab in DevTools
2. Look for failed iframe requests
3. Try switching to different server manually
4. Check if URL format is correct

#### ❌ "All sources exhausted"
**Cause:** All servers failed to load
**Solution:**
1. Check internet connection
2. Try different content (different movie/show)
3. Some content may not be available on any server
4. Wait a few minutes and try again

## 📋 Working Server URLs

### Movies:
- `https://vidsrc.pro/embed/movie/{TMDB_ID}`
- `https://vidsrc.to/embed/movie/{TMDB_ID}`
- `https://vidsrc.xyz/embed/movie/{TMDB_ID}`
- `https://vidsrc.me/embed/movie/{TMDB_ID}`
- `https://www.2embed.cc/embed/tmdb/movie?id={TMDB_ID}`
- `https://embed.su/embed/movie/{TMDB_ID}`

### TV Shows:
- `https://vidsrc.pro/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`
- `https://vidsrc.to/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`
- `https://vidsrc.xyz/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`
- `https://vidsrc.me/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`
- `https://www.2embed.cc/embed/tmdb/tv?id={TMDB_ID}&s={SEASON}&e={EPISODE}`
- `https://embed.su/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`

## 🎯 Expected Behavior

### When Working Correctly:
1. ✅ Clicking "Play" opens video player immediately
2. ✅ Loading spinner shows for 1-3 seconds
3. ✅ Video starts playing in iframe
4. ✅ Controls are responsive (play, mute, fullscreen)
5. ✅ Server list shows all available sources
6. ✅ Switching servers works smoothly
7. ✅ Failed sources auto-retry with backups

### Performance Metrics:
- Initial load: < 2 seconds
- Server switch: < 1 second
- Auto-retry interval: 1.2-1.5 seconds

## 🚀 Production Deployment

Before deploying:
1. Test with multiple movies and TV shows
2. Verify all server URLs are accessible
3. Check console for any errors
4. Test on different devices (mobile, tablet, desktop)
5. Verify backup URLs are working

## 📞 Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify TMDB API key is working
3. Test individual server URLs directly in browser
4. Clear browser cache and try again

---

**Last Updated:** 2025-10-05
**Version:** 2.0 - Fixed Streaming

