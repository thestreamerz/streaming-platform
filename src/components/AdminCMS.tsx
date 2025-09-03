import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Eye, 
  Users, 
  Film, 
  Tv, 
  Settings, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Shield,
  Monitor
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface CMSProps {
  user: any;
  onClose: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  type: 'movie' | 'tv';
  featured?: boolean;
  trending?: boolean;
  custom_content?: boolean;
  streaming_links?: string[];
  created_at?: any;
  updated_at?: any;
}

interface StreamingServer {
  id: string;
  name: string;
  baseUrl: string;
  active: boolean;
  priority: number;
  quality: string;
  type: string;
}

interface CMSUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'user';
  lastActive: any;
  totalWatched: number;
}

const AdminCMS: React.FC<CMSProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'servers' | 'users' | 'analytics' | 'settings'>('content');
  const [loading, setLoading] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [streamingServers, setStreamingServers] = useState<StreamingServer[]>([]);
  const [cmsUsers, setCmsUsers] = useState<CMSUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  // Form state for adding/editing content
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    title: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    vote_average: 5.0,
    genre_ids: [],
    type: 'movie',
    featured: false,
    trending: false,
    streaming_links: []
  });

  useEffect(() => {
    loadCMSData();
  }, [activeTab]);

  const loadCMSData = async () => {
    setLoading(true);
    try {
      console.log('Loading CMS data for tab:', activeTab);
      if (activeTab === 'content') {
        await loadContent();
      } else if (activeTab === 'servers') {
        await loadServers();
      } else if (activeTab === 'users') {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error loading CMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const contentQuery = query(
        collection(db, 'customContent'),
        orderBy('created_at', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(contentQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[];
      setContentItems(items);
      console.log('Loaded content items:', items.length);
    } catch (error) {
      console.error('Error loading content:', error);
      // Add fallback content when Firestore is not available
      setContentItems([
        {
          id: 'fallback-1',
          title: 'Sample Movie',
          overview: 'This is a sample movie. Firestore needs to be initialized to load real content.',
          poster_path: 'https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=500&h=750&fit=crop',
          backdrop_path: 'https://images.unsplash.com/photo-1489599735734-79b4212bea40?w=1280&h=720&fit=crop',
          release_date: '2024-01-01',
          vote_average: 8.5,
          genre_ids: [18],
          type: 'movie',
          featured: true,
          trending: false,
          custom_content: true
        }
      ]);
    }
  };

  const loadServers = async () => {
    try {
      const serversQuery = query(collection(db, 'streamingServers'));
      const snapshot = await getDocs(serversQuery);
      const servers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StreamingServer[];
      setStreamingServers(servers);
      console.log('Loaded servers:', servers.length);
    } catch (error) {
      console.error('Error loading servers:', error);
      // Add fallback servers when Firestore is not available
      setStreamingServers([
        {
          id: 'fallback-server-1',
          name: 'Primary Server',
          baseUrl: 'https://stream1.thestreamerz.com',
          active: true,
          priority: 1,
          quality: '1080p',
          type: 'primary'
        },
        {
          id: 'fallback-server-2',
          name: 'Backup Server',
          baseUrl: 'https://stream2.thestreamerz.com',
          active: true,
          priority: 2,
          quality: '720p',
          type: 'backup'
        }
      ]);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('lastActivity', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CMSUser[];
      setCmsUsers(users);
      console.log('Loaded users:', users.length);
    } catch (error) {
      console.error('Error loading users:', error);
      // Add fallback user when Firestore is not available
      setCmsUsers([
        {
          id: 'fallback-admin',
          email: 'admin@thestreamerz.com',
          displayName: 'CMS Administrator',
          role: 'admin',
          lastActive: new Date(),
          totalWatched: 0
        }
      ]);
    }
  };

  const handleSaveContent = async () => {
    if (!formData.title || !formData.overview) {
      alert('Please fill in required fields (title and overview)');
      return;
    }

    setLoading(true);
    try {
      const contentData = {
        ...formData,
        custom_content: true,
        updated_at: serverTimestamp(),
        ...(editingItem ? {} : { created_at: serverTimestamp() })
      };

      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, 'customContent', editingItem.id), contentData);
      } else {
        // Add new item
        await addDoc(collection(db, 'customContent'), contentData);
      }

      await loadContent();
      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'customContent', id));
      await loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      overview: '',
      poster_path: '',
      backdrop_path: '',
      release_date: '',
      vote_average: 5.0,
      genre_ids: [],
      type: 'movie',
      featured: false,
      trending: false,
      streaming_links: []
    });
  };

  const startEditing = (item: ContentItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(true);
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {resetForm(); setShowAddForm(true); setEditingItem(null);}}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content</span>
          </button>
          <button
            onClick={loadContent}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>
      </div>

      {/* Content list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                <p className="text-sm text-gray-400">
                  {item.type === 'movie' ? 'Movie' : 'TV Show'} • {item.release_date}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {item.featured && (
                    <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">Featured</span>
                  )}
                  {item.trending && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Trending</span>
                  )}
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    ⭐ {item.vote_average}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startEditing(item)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteContent(item.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {item.poster_path && (
              <img
                src={item.poster_path}
                alt={item.title}
                className="w-full h-32 object-cover rounded"
              />
            )}
            
            <p className="text-gray-300 text-sm line-clamp-3">{item.overview}</p>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {searchQuery || filterType !== 'all' ? 'No content matches your filters' : 'No custom content added yet'}
          </p>
        </div>
      )}
    </div>
  );

  const renderServersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Streaming Servers</h2>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Server</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamingServers.map((server) => (
          <div key={server.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">{server.name}</h3>
              <div className={`w-3 h-3 rounded-full ${server.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-gray-400 text-sm truncate">{server.baseUrl}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Priority: {server.priority}</span>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">{server.quality}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="text-sm text-gray-400">
          {cmsUsers.length} total users
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-white">User</th>
              <th className="px-4 py-3 text-left text-white">Role</th>
              <th className="px-4 py-3 text-left text-white">Last Active</th>
              <th className="px-4 py-3 text-left text-white">Content Watched</th>
              <th className="px-4 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cmsUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-700">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-white font-medium">{user.displayName || 'Anonymous'}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-600 text-white' :
                    user.role === 'editor' ? 'bg-yellow-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {user.lastActive ? new Date(user.lastActive.toDate()).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {user.totalWatched || 0} items
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Content</p>
              <p className="text-2xl font-bold text-white">{contentItems.length}</p>
            </div>
            <Film className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">{cmsUsers.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Streaming Servers</p>
              <p className="text-2xl font-bold text-white">{streamingServers.filter(s => s.active).length}</p>
            </div>
            <Monitor className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Featured Content</p>
              <p className="text-2xl font-bold text-white">{contentItems.filter(c => c.featured).length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Movies vs TV Shows</span>
            <span className="text-white">
              {contentItems.filter(c => c.type === 'movie').length} / {contentItems.filter(c => c.type === 'tv').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trending Content</span>
            <span className="text-white">{contentItems.filter(c => c.trending).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Average Rating</span>
            <span className="text-white">
              {contentItems.length > 0 ? 
                (contentItems.reduce((acc, item) => acc + item.vote_average, 0) / contentItems.length).toFixed(1) : 
                'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user || user.email !== 'admin@thestreamerz.com') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">🎬 Streamerz Admin CMS</h1>
          </div>

          {/* Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'content', label: 'Content', icon: Film },
              { id: 'servers', label: 'Servers', icon: Monitor },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {!loading && activeTab === 'content' && renderContentTab()}
            {!loading && activeTab === 'servers' && renderServersTab()}
            {!loading && activeTab === 'users' && renderUsersTab()}
            {!loading && activeTab === 'analytics' && renderAnalyticsTab()}
            {!loading && activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>

      {/* Add/Edit Content Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Content' : 'Add New Content'}
              </h2>
              <button
                onClick={() => {setShowAddForm(false); setEditingItem(null); resetForm();}}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Content title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'movie' | 'tv'})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Overview *</label>
                <textarea
                  value={formData.overview}
                  onChange={(e) => setFormData({...formData, overview: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Content description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={formData.poster_path}
                    onChange={(e) => setFormData({...formData, poster_path: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Backdrop URL</label>
                  <input
                    type="url"
                    value={formData.backdrop_path}
                    onChange={(e) => setFormData({...formData, backdrop_path: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com/backdrop.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Release Date</label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.vote_average}
                    onChange={(e) => setFormData({...formData, vote_average: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Featured</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => setFormData({...formData, trending: e.target.checked})}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Trending</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {setShowAddForm(false); setEditingItem(null); resetForm();}}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMS;
