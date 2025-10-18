// CDN Service for Image Optimization and Caching
export interface CDNConfig {
  baseUrl: string;
  quality: 'low' | 'medium' | 'high' | 'original';
  format: 'webp' | 'jpg' | 'png' | 'auto';
  width?: number;
  height?: number;
  blur?: number;
  fallback?: string;
}

export interface ImageOptimization {
  url: string;
  optimizedUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
  quality: number;
}

class CDNService {
  private cdnProviders = [
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      baseUrl: 'https://res.cloudinary.com/thestreamerz/image/fetch',
      features: ['auto-format', 'auto-quality', 'responsive', 'lazy-loading'],
      priority: 1,
      active: true
    },
    {
      id: 'imgix',
      name: 'Imgix',
      baseUrl: 'https://thestreamerz.imgix.net',
      features: ['auto-format', 'auto-quality', 'responsive', 'lazy-loading'],
      priority: 2,
      active: true
    },
    {
      id: 'imagekit',
      name: 'ImageKit',
      baseUrl: 'https://ik.imagekit.io/thestreamerz',
      features: ['auto-format', 'auto-quality', 'responsive', 'lazy-loading'],
      priority: 3,
      active: true
    },
    {
      id: 'fallback',
      name: 'Fallback',
      baseUrl: 'https://via.placeholder.com',
      features: ['basic'],
      priority: 4,
      active: true
    },
    {
      id: 'local-fallback',
      name: 'Local Fallback',
      baseUrl: '/api/placeholder',
      features: ['reliable', 'fast'],
      priority: 5,
      active: true
    }
  ];

  private imageCache = new Map<string, { url: string; timestamp: number }>();
  private lazyLoadObserver: IntersectionObserver | null = null;

  constructor() {
    this.initializeLazyLoading();
  }

  // Initialize Lazy Loading
  private initializeLazyLoading(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.lazyLoadObserver?.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
    }
  }

  // Load Image with Lazy Loading
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    img.src = src;
    img.classList.remove('lazy');
    img.classList.add('loaded');
  }

  // Optimize Image URL
  optimizeImageUrl(
    originalUrl: string,
    config: CDNConfig = {
      quality: 'high',
      format: 'auto',
      width: 800,
      height: 600
    }
  ): string {
    // Check cache first
    const cacheKey = `${originalUrl}_${JSON.stringify(config)}`;
    const cached = this.imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.url;
    }

    const provider = this.cdnProviders.find(p => p.active) || this.cdnProviders[this.cdnProviders.length - 1];
    let optimizedUrl: string;

    switch (provider.id) {
      case 'cloudinary':
        optimizedUrl = this.optimizeWithCloudinary(originalUrl, config);
        break;
      case 'imgix':
        optimizedUrl = this.optimizeWithImgix(originalUrl, config);
        break;
      case 'imagekit':
        optimizedUrl = this.optimizeWithImageKit(originalUrl, config);
        break;
      default:
        optimizedUrl = this.optimizeWithFallback(originalUrl, config);
    }

    // Cache the result
    this.imageCache.set(cacheKey, {
      url: optimizedUrl,
      timestamp: Date.now()
    });

    return optimizedUrl;
  }

  // Cloudinary Optimization
  private optimizeWithCloudinary(originalUrl: string, config: CDNConfig): string {
    const params = new URLSearchParams();
    
    // Quality
    const qualityMap = { low: 'q_auto:low', medium: 'q_auto:medium', high: 'q_auto:high', original: 'q_auto' };
    params.append('f', qualityMap[config.quality] || 'q_auto');

    // Format
    if (config.format === 'auto') {
      params.append('f', 'f_auto');
    } else {
      params.append('f', config.format);
    }

    // Dimensions
    if (config.width) {
      params.append('w', config.width.toString());
    }
    if (config.height) {
      params.append('h', config.height.toString());
    }

    // Blur effect
    if (config.blur) {
      params.append('e', `blur:${config.blur}`);
    }

    // Responsive
    params.append('c', 'c_fill,g_auto');

    return `${this.cdnProviders[0].baseUrl}/${params.toString()}/${encodeURIComponent(originalUrl)}`;
  }

  // Imgix Optimization
  private optimizeWithImgix(originalUrl: string, config: CDNConfig): string {
    const params = new URLSearchParams();
    
    // Quality
    const qualityMap = { low: 'q=30', medium: 'q=60', high: 'q=80', original: 'q=auto' };
    params.append('q', qualityMap[config.quality] || 'q=auto');

    // Format
    if (config.format === 'auto') {
      params.append('fm', 'auto');
    } else {
      params.append('fm', config.format);
    }

    // Dimensions
    if (config.width) {
      params.append('w', config.width.toString());
    }
    if (config.height) {
      params.append('h', config.height.toString());
    }

    // Blur effect
    if (config.blur) {
      params.append('blur', config.blur.toString());
    }

    // Responsive
    params.append('fit', 'crop');
    params.append('crop', 'faces,entropy');

    return `${this.cdnProviders[1].baseUrl}/${originalUrl}?${params.toString()}`;
  }

  // ImageKit Optimization
  private optimizeWithImageKit(originalUrl: string, config: CDNConfig): string {
    const params = new URLSearchParams();
    
    // Quality
    const qualityMap = { low: 'q_30', medium: 'q_60', high: 'q_80', original: 'q_auto' };
    params.append('tr', qualityMap[config.quality] || 'q_auto');

    // Format
    if (config.format === 'auto') {
      params.append('f', 'auto');
    } else {
      params.append('f', config.format);
    }

    // Dimensions
    if (config.width) {
      params.append('w', config.width.toString());
    }
    if (config.height) {
      params.append('h', config.height.toString());
    }

    // Blur effect
    if (config.blur) {
      params.append('bl', config.blur.toString());
    }

    // Responsive
    params.append('c', 'maintain_ratio');

    return `${this.cdnProviders[2].baseUrl}/${originalUrl}?${params.toString()}`;
  }

  // Fallback Optimization
  private optimizeWithFallback(originalUrl: string, config: CDNConfig): string {
    // Simple fallback - just return original URL with basic parameters
    if (config.width && config.height) {
      return `${this.cdnProviders[3].baseUrl}/${config.width}x${config.height}?text=${encodeURIComponent('Loading...')}`;
    }
    return originalUrl;
  }

  // Create Responsive Image Set
  createResponsiveImageSet(
    originalUrl: string,
    sizes: Array<{ width: number; height: number; quality: 'low' | 'medium' | 'high' }>
  ): { srcSet: string; sizes: string } {
    const srcSet = sizes.map(size => {
      const url = this.optimizeImageUrl(originalUrl, {
        quality: size.quality,
        format: 'auto',
        width: size.width,
        height: size.height
      });
      return `${url} ${size.width}w`;
    }).join(', ');

    const sizesAttr = sizes.map(size => `(max-width: ${size.width}px) ${size.width}px`).join(', ') + ', 100vw';

    return { srcSet, sizes: sizesAttr };
  }

  // Preload Critical Images
  preloadImages(urls: string[], priority: 'high' | 'low' = 'high'): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });
  }

  // Lazy Load Image Element
  lazyLoadImage(img: HTMLImageElement, config?: CDNConfig): void {
    if (!this.lazyLoadObserver) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
      return;
    }

    const originalUrl = img.dataset.src || img.src;
    if (!originalUrl) return;

    const optimizedUrl = this.optimizeImageUrl(originalUrl, config);
    img.dataset.src = optimizedUrl;
    img.src = config?.fallback || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
    img.classList.add('lazy');

    this.lazyLoadObserver.observe(img);
  }

  // Get Image Dimensions
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }

  // Clear Cache
  clearCache(): void {
    this.imageCache.clear();
    console.log('🧹 Image cache cleared');
  }

  // Get Cache Stats
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.imageCache.size,
      entries: Array.from(this.imageCache.keys())
    };
  }
}

export const cdnService = new CDNService();
