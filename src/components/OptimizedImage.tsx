// Optimized Image Component with CDN Integration
import React, { useState, useRef, useEffect } from 'react';
import { cdnService } from '../services/cdnService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high' | 'original';
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  className?: string;
  lazy?: boolean;
  placeholder?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 'high',
  format = 'auto',
  className = '',
  lazy = true,
  placeholder,
  sizes,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    // Optimize image URL
    const optimizedUrl = cdnService.optimizeImageUrl(src, {
      quality,
      format,
      width,
      height,
      fallback: placeholder
    });

    setImageSrc(optimizedUrl);
    setIsLoading(true);
    setHasError(false);
    setIsLoaded(false);

    // Preload critical images
    if (!lazy) {
      preloadImage(optimizedUrl);
    }
  }, [src, quality, format, width, height, placeholder, lazy]);

  useEffect(() => {
    if (lazy && imgRef.current) {
      cdnService.lazyLoadImage(imgRef.current, {
        quality,
        format,
        width,
        height,
        fallback: placeholder
      });
    }
  }, [lazy, quality, format, width, height, placeholder]);

  const preloadImage = (url: string) => {
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };
    img.src = url;
  };

  const handleLoad = () => {
    setIsLoading(false);
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    // Fallback to original src if optimization fails
    if (src && imageSrc !== src) {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    // Generate a simple placeholder based on dimensions
    const w = width || 400;
    const h = height || 300;
    const text = encodeURIComponent(alt || 'Loading...');
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
          ${text}
        </text>
      </svg>
    `)}`;
  };

  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    if (width && height) {
      return `(max-width: ${width}px) 100vw, ${width}px`;
    }
    
    return '100vw';
  };

  const getSrcSet = () => {
    if (!width || !height) return undefined;
    
    const sizes = [
      { width: Math.floor(width * 0.5), height: Math.floor(height * 0.5), quality: 'low' as const },
      { width: Math.floor(width * 0.75), height: Math.floor(height * 0.75), quality: 'medium' as const },
      { width, height, quality: 'high' as const },
      { width: Math.floor(width * 1.5), height: Math.floor(height * 1.5), quality: 'high' as const }
    ];

    return sizes.map(size => {
      const url = cdnService.optimizeImageUrl(src, {
        quality: size.quality,
        format,
        width: size.width,
        height: size.height
      });
      return `${url} ${size.width}w`;
    }).join(', ');
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={lazy ? getPlaceholder() : imageSrc}
        data-src={lazy ? imageSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={getResponsiveSizes()}
        srcSet={getSrcSet()}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${lazy ? 'lazy' : ''}`}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
