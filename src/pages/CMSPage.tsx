import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { onAuthStateChange } from '../services/auth';
import AdminCMS from '../components/AdminCMS';
import CMSLogin from '../components/CMSLogin';

const CMSPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === 'admin@thestreamerz.com';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading CMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <CMSLogin onLoginSuccess={setUser} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  THE STREAMERZ CMS
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Signed in as: {user.email}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              Your account ({user.email}) doesn't have administrator privileges to access the CMS.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Return to Streaming Platform
              </button>
              <p className="text-sm text-gray-500">
                Administrator access required for CMS
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin user - show full CMS
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Back to Streaming Platform"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-red-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent">
                  THE STREAMERZ CMS
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Admin Panel Active</span>
              </div>
              <div className="text-sm text-gray-400">
                Welcome, {user.displayName || user.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Content Management System</h1>
              <p className="text-gray-400">
                Manage your streaming platform content, users, servers, and analytics
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-white">Live Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CMS Content */}
      <AdminCMS 
        user={user} 
        onClose={() => navigate('/')} 
      />
    </div>
  );
};

export default CMSPage;
