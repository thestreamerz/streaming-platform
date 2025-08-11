import React from 'react';
import { Film } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-4">
          <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin mx-auto`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className={`${sizeClasses[size === 'large' ? 'medium' : 'small']} text-blue-500`} />
          </div>
        </div>
        
        {/* Loading Text */}
        <p className={`text-gray-300 ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};