import React from 'react';
import { Film } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  showText?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 'medium', 
  animate = false,
  showText = true 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`relative ${animate ? 'animate-spin-slow' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-75"></div>
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 shadow-lg">
          <Film className={`${sizeClasses[size]} text-white`} />
        </div>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
          THE STREAMERZ
        </span>
      )}
    </div>
  );
};