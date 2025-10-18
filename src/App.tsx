import { useState, useEffect } from 'react';
import { onAuthStateChange } from './services/auth';
import MainPlatform from './components/MainPlatform';

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('Auth state changed:', authUser);
      setUser(authUser);
    });

    // Register service worker for performance optimization (production only)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }

    // Preload critical resources
    preloadCriticalResources();

    return () => unsubscribe();
  }, []);

  // Preload critical resources for better performance
  const preloadCriticalResources = () => {
    const criticalImages = [
      'https://image.tmdb.org/t/p/w500/placeholder.jpg',
      'https://image.tmdb.org/t/p/w780/placeholder.jpg'
    ];

    // Preload critical images
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
  };

  return (
    <MainPlatform user={user} setUser={setUser} />
  );
}

export default App;
