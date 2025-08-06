import React, { useState } from 'react';
import { User, Settings, Heart, Clock, Star, LogOut, Edit } from 'lucide-react';

interface UserProfileProps {
  user: any;
  onSignOut: () => void;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'history', label: 'Watch History', icon: Clock },
    { id: 'ratings', label: 'My Ratings', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-800 p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <h3 className="text-white font-semibold">{user?.displayName || 'User'}</h3>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <button
                onClick={onSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                    <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                      <p className="text-white">{user?.displayName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Email</label>
                      <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Member Since</label>
                      <p className="text-white">January 2024</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Plan</label>
                      <p className="text-white">Premium</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">127</div>
                      <div className="text-gray-400 text-sm">Movies Watched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">43</div>
                      <div className="text-gray-400 text-sm">TV Shows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">89</div>
                      <div className="text-gray-400 text-sm">Hours Watched</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h3>
                <p className="text-gray-400">Start adding movies and TV shows to your watchlist!</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Watch History</h3>
                <p className="text-gray-400">Your recently watched content will appear here.</p>
              </div>
            )}

            {activeTab === 'ratings' && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Ratings Yet</h3>
                <p className="text-gray-400">Rate movies and TV shows to see them here.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Email Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Auto-play Trailers</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Dark Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};