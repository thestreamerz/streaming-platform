import React, { useState, useEffect } from 'react';
import { Play, Server, Zap, Shield, Crown, CheckCircle, XCircle } from 'lucide-react';
import { enhancedStreamingService, StreamingServer } from '../services/enhancedStreaming';

interface ServerSelectorProps {
  onServerSelect: (serverId: string) => void;
  selectedServer?: string;
  contentType: 'movie' | 'tv';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  onServerSelect,
  selectedServer,
  contentType
}) => {
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [serverStatus, setServerStatus] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    const activeServers = enhancedStreamingService.getActiveServers();
    setServers(activeServers);
    
    // Set default selection to first primary server
    if (!selectedServer && activeServers.length > 0) {
      const primaryServer = activeServers.find(s => s.type === 'primary');
      if (primaryServer) {
        onServerSelect(primaryServer.id);
      }
    }
  };

  const testServer = async (serverId: string) => {
    setTesting(prev => ({ ...prev, [serverId]: true }));
    
    try {
      const isOnline = await enhancedStreamingService.testServer(serverId);
      setServerStatus(prev => ({ ...prev, [serverId]: isOnline }));
    } catch (error) {
      setServerStatus(prev => ({ ...prev, [serverId]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const getServerIcon = (server: StreamingServer) => {
    switch (server.type) {
      case 'primary':
        return <Server className="w-4 h-4" />;
      case 'premium':
        return <Crown className="w-4 h-4" />;
      case 'backup':
        return <Shield className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getServerColor = (server: StreamingServer) => {
    switch (server.type) {
      case 'primary':
        return 'from-blue-500 to-blue-600';
      case 'premium':
        return 'from-yellow-500 to-orange-500';
      case 'backup':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      '4K': 'bg-purple-600',
      'HD': 'bg-green-600',
      'SD': 'bg-blue-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${colors[quality] || 'bg-gray-600'}`}>
        {quality}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span>Choose Server</span>
        </h3>
        <div className="text-sm text-gray-400">
          {servers.length} servers available
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map((server) => {
          const isSelected = selectedServer === server.id;
          const isOnline = serverStatus[server.id];
          const isTesting = testing[server.id];
          
          return (
            <div
              key={server.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
              }`}
              onClick={() => onServerSelect(server.id)}
            >
              {/* Server Type Badge */}
              <div className="absolute top-2 right-2">
                {server.type === 'premium' && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
              </div>

              {/* Server Info */}
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getServerColor(server)}`}>
                  {getServerIcon(server)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{server.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {getQualityBadge(server.quality)}
                    <span className="text-xs text-gray-400 capitalize">
                      {server.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isTesting ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : isOnline === true ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : isOnline === false ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-400">
                    {isTesting ? 'Testing...' : isOnline === true ? 'Online' : isOnline === false ? 'Offline' : 'Unknown'}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    testServer(server.id);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={isTesting}
                >
                  Test
                </button>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-lg transition-all duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Server Stats */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {Object.values(serverStatus).filter(Boolean).length}
            </div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {Object.values(serverStatus).filter(status => status === false).length}
            </div>
            <div className="text-xs text-gray-400">Offline</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {servers.length}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> If one server doesn't work, try another. Premium servers offer ad-free experience and better quality.
        </p>
      </div>
    </div>
  );
};