import React, { useState, useEffect } from 'react';
import { User, Settings, Heart, Clock, Star, LogOut, Edit } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { userTrackingService, UserStats, WatchHistory, WatchlistItem, UserRating } from '../services/userTracking';

interface UserProfileProps {
  user: any;
  onSignOut: () => void;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  
  // Real user data state
  const [userStats, setUserStats] = useState<UserStats>({
    moviesWatched: 0,
    tvShowsWatched: 0,
    totalHoursWatched: 0,
    lastUpdated: new Date()
  });
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'history', label: 'Watch History', icon: Clock },
    { id: 'ratings', label: 'My Ratings', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          setLoading(true);
          
          // Load user statistics
          const stats = await userTrackingService.getUserStats(user.uid);
          setUserStats(stats);
          
          // Load watch history
          const history = await userTrackingService.getWatchHistory(user.uid);
          setWatchHistory(history);
          
          // Load watchlist
          const watchlistData = await userTrackingService.getWatchlist(user.uid);
          setWatchlist(watchlistData);
          
          // Load user ratings
          const ratings = await userTrackingService.getUserRatings(user.uid);
          setUserRatings(ratings);
          
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user?.uid]);

  const handleSaveProfile = async () => {
    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: editForm.displayName,
          updatedAt: new Date().toISOString(),
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
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
                    <button 
                      onClick={() => {
                        if (isEditing) {
                          handleSaveProfile();
                        } else {
                          setIsEditing(true);
                          setEditForm({
                            displayName: user?.displayName || '',
                            email: user?.email || ''
                          });
                        }
                      }}
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{isEditing ? 'Save' : 'Edit'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        />
                      ) : (
                        <p className="text-white">{user?.displayName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Email</label>
                      <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Member Since</label>
                      <p className="text-white">{formatDate(user?.metadata?.creationTime)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Account Type</label>
                      <p className="text-white capitalize">{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                  {loading ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">...</div>
                        <div className="text-gray-400 text-sm">Movies Watched</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">...</div>
                        <div className="text-gray-400 text-sm">TV Shows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">...</div>
                        <div className="text-gray-400 text-sm">Hours Watched</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{userStats.moviesWatched}</div>
                        <div className="text-gray-400 text-sm">Movies Watched</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{userStats.tvShowsWatched}</div>
                        <div className="text-gray-400 text-sm">TV Shows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{Math.round(userStats.totalHoursWatched)}</div>
                        <div className="text-gray-400 text-sm">Hours Watched</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400">Loading watchlist...</div>
                  </div>
                ) : watchlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h3>
                    <p className="text-gray-400">Start adding movies and TV shows to your watchlist!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {watchlist.map((item) => (
                      <div key={item.id} className="bg-slate-800 rounded-lg overflow-hidden">
                        {item.posterPath ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} 
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-slate-700 flex items-center justify-center">
                            <Heart className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        <div className="p-3">
                          <h4 className="text-white font-medium text-sm truncate">{item.title}</h4>
                          <p className="text-gray-400 text-xs capitalize">{item.contentType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400">Loading watch history...</div>
                  </div>
                ) : watchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Watch History</h3>
                    <p className="text-gray-400">Your recently watched content will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchHistory.map((item) => (
                      <div key={item.id} className="bg-slate-800 rounded-lg p-4 flex items-center space-x-4">
                        {item.posterPath ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} 
                            alt={item.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-slate-700 rounded flex items-center justify-center">
                            <Clock className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.title}</h4>
                          <p className="text-gray-400 text-sm capitalize">{item.contentType}</p>
                          <p className="text-gray-500 text-xs">
                            Watched {item.watchedAt.toLocaleDateString()} at {item.watchedAt.toLocaleTimeString()}
                          </p>
                          {item.duration > 0 && (
                            <p className="text-gray-500 text-xs">Duration: {item.duration} minutes</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ratings' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400">Loading ratings...</div>
                  </div>
                ) : userRatings.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Ratings Yet</h3>
                    <p className="text-gray-400">Rate movies and TV shows to see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRatings.map((rating) => (
                      <div key={rating.id} className="bg-slate-800 rounded-lg p-4 flex items-center space-x-4">
                        {rating.posterPath ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${rating.posterPath}`} 
                            alt={rating.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-slate-700 rounded flex items-center justify-center">
                            <Star className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{rating.title}</h4>
                          <p className="text-gray-400 text-sm capitalize">{rating.contentType}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">{rating.rating}/5</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            Rated on {rating.ratedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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