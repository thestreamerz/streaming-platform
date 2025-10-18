// Performance Monitoring Component
import React, { useState, useEffect } from 'react';
import { performanceOptimizer } from '../services/performanceOptimizer';
import { optimizedStreamingService } from '../services/optimizedStreamingService';
import { cdnService } from '../services/cdnService';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDetails = false, 
  position = 'top-right' 
}) => {
  const [metrics, setMetrics] = useState(performanceOptimizer.getMetrics());
  const [serverStatus, setServerStatus] = useState(optimizedStreamingService.getServerStatus());
  const [isVisible, setIsVisible] = useState(false);
  const [cacheStats, setCacheStats] = useState(cdnService.getCacheStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getMetrics());
      setServerStatus(optimizedStreamingService.getServerStatus());
      setCacheStats(cdnService.getCacheStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible && !showDetails) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed ${positionClasses[position]} bg-black bg-opacity-75 text-white p-2 rounded-lg text-xs hover:bg-opacity-90 transition-all z-50`}
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {/* Request Metrics */}
        <div className="border-b border-gray-700 pb-2">
          <h4 className="font-semibold text-xs mb-1">Requests</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Total: {metrics.totalRequests}</div>
            <div>Success: {metrics.successfulRequests}</div>
            <div>Failed: {metrics.failedRequests}</div>
            <div>Cache Hit: {metrics.cacheHitRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Response Time */}
        <div className="border-b border-gray-700 pb-2">
          <h4 className="font-semibold text-xs mb-1">Performance</h4>
          <div className="text-xs">
            Avg Response: {metrics.averageResponseTime.toFixed(0)}ms
          </div>
        </div>

        {/* Server Status */}
        <div className="border-b border-gray-700 pb-2">
          <h4 className="font-semibold text-xs mb-1">Servers</h4>
          <div className="space-y-1">
            {serverStatus.slice(0, 3).map((server) => (
              <div key={server.id} className="flex justify-between items-center">
                <span className="text-xs truncate">{server.name}</span>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${getHealthScoreColor(server.healthScore)}`}>
                    {server.healthScore}%
                  </span>
                  <span className={`text-xs ${getStatusColor(server.status)}`}>
                    ●
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cache Stats */}
        <div className="border-b border-gray-700 pb-2">
          <h4 className="font-semibold text-xs mb-1">Cache</h4>
          <div className="text-xs">
            Images: {cacheStats.size} entries
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              performanceOptimizer.clearCache();
              cdnService.clearCache();
              optimizedStreamingService.clearCache();
            }}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
          <button
            onClick={() => {
              optimizedStreamingService.getServerStatus();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
