import React, { useEffect, useState } from 'react';
import { AnimatedLogo } from './AnimatedLogo';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Initializing...');

  const messages = [
    'Initializing...',
    'Loading content library...',
    'Connecting to servers...',
    'Preparing your experience...',
    'Almost ready...'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update message based on progress
        if (newProgress >= 20 && newProgress < 40) {
          setCurrentMessage(messages[1]);
        } else if (newProgress >= 40 && newProgress < 60) {
          setCurrentMessage(messages[2]);
        } else if (newProgress >= 60 && newProgress < 80) {
          setCurrentMessage(messages[3]);
        } else if (newProgress >= 80) {
          setCurrentMessage(messages[4]);
        }
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, duration / 50);

    return () => clearInterval(progressInterval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-l from-purple-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Main Logo Animation */}
        <div className="mb-12 transform animate-logo-entrance flex justify-center">
          <div className="scale-150">
            <AnimatedLogo size="large" animate={true} showText={false} />
          </div>
        </div>

        {/* Platform Name with Typewriter Effect */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent mb-2 animate-text-reveal">
          THE STREAMERZ
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-lg mb-8 animate-fade-in-up delay-500">
          Ultimate Streaming Experience
        </p>

        {/* Progress Section */}
        <div className="space-y-4 animate-fade-in-up delay-1000">
          {/* Loading Message */}
          <p className="text-gray-300 text-base h-6">
            {currentMessage}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto">
            <div className="bg-gray-700/50 rounded-full h-1 overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 text-xs animate-fade-in delay-2000">
          v2.0 • Enhanced Experience
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes logo-entrance {
          0% { 
            transform: scale(0.5) rotate(-10deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.1) rotate(5deg); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
          }
        }
        
        @keyframes text-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes fade-in-up {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-logo-entrance {
          animation: logo-entrance 1.5s ease-out;
        }
        
        .animate-text-reveal {
          animation: text-reveal 1s ease-out 0.5s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

