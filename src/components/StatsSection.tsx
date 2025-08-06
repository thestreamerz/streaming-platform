import React from 'react';
import { Film, Tv, Users, Star, TrendingUp, Play } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Film,
      value: '50K+',
      label: 'Movies',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Tv,
      value: '15K+',
      label: 'TV Shows',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Users,
      value: '2M+',
      label: 'Active Users',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Star,
      value: '4.8',
      label: 'Average Rating',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Play,
      value: '100M+',
      label: 'Hours Watched',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: TrendingUp,
      value: '99.9%',
      label: 'Uptime',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join millions of users who trust THE STREAMERZ for their entertainment needs
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};