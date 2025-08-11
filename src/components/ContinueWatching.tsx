import React from 'react';
import { Play, Clock, MoreHorizontal } from 'lucide-react';
import { tmdbService } from '../services/api';

interface ContinueWatchingProps {
  onWatch: (item: any, type: 'movie' | 'tv') => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onWatch }) => {
  // Mock data for continue watching - in real app this would come from user's watch history
  const continueWatchingItems = [
    {
      id: 1,
      title: "Stranger Things",
      type: "tv",
      season: 4,
      episode: 7,
      progress: 65,
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      lastWatched: "2 hours ago"
    },
    {
      id: 2,
      title: "The Batman",
      type: "movie",
      progress: 23,
      backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
      poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      lastWatched: "Yesterday"
    },
    {
      id: 3,
      title: "Ozark",
      type: "tv",
      season: 4,
      episode: 3,
      progress: 89,
      backdrop_path: "/mYylcfkJGqW8ywkqYhVBkVRJnAp.jpg",
      poster_path: "/m73QiJOFyQIDdWXk0rZAy4t1jVa.jpg",
      lastWatched: "3 days ago"
    },
    {
      id: 4,
      title: "Dune",
      type: "movie",
      progress: 45,
      backdrop_path: "/iopYFB1b6Bh7FWZh3onQhph1sih.jpg",
      poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      lastWatched: "1 week ago"
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Clock className="w-6 h-6 text-blue-400" />
          <span>Continue Watching</span>
        </h2>
        <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {continueWatchingItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-300 hover:scale-105"
            onClick={() => onWatch(item, item.type as 'movie' | 'tv')}
          >
            <div className="relative">
              <img
                src={contentService.getImageUrl(item.backdrop_path, 'w500')}
                alt={item.title}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-6 h-6 text-white fill-current ml-1" />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate mb-1">{item.title}</h3>
                  <div className="text-gray-400 text-sm">
                    {item.type === 'tv' ? (
                      <span>S{item.season}:E{item.episode}</span>
                    ) : (
                      <span>{item.progress}% watched</span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{item.lastWatched}</div>
                </div>
                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};