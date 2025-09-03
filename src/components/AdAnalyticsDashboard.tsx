import React, { useState, useEffect } from 'react';
import { adAnalytics, AdPerformanceMetrics } from '../services/adAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  className?: string;
}

const AdAnalyticsDashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const [performanceData, setPerformanceData] = useState<AdPerformanceMetrics[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'clicks' | 'impressions' | 'ctr'>('revenue');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const data = await adAnalytics.getOverallPerformance(selectedPeriod);
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMetrics = performanceData.reduce(
    (acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  const overallCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
  const overallConversionRate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0;

  const chartData = performanceData.map(ad => ({
    name: ad.adId.substring(0, 10) + '...',
    fullName: ad.adId,
    impressions: ad.impressions,
    clicks: ad.clicks,
    revenue: ad.revenue,
    ctr: ad.ctr,
    conversionRate: ad.conversionRate,
    adType: ad.adType
  }));

  const pieData = performanceData.map(ad => ({
    name: ad.adType,
    value: ad.revenue,
    adId: ad.adId
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
          📊 Ad Performance Analytics
        </h2>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Impressions</p>
              <p className="text-2xl font-bold text-white">{totalMetrics.impressions.toLocaleString()}</p>
            </div>
            <div className="text-blue-500 text-2xl">👁️</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clicks</p>
              <p className="text-2xl font-bold text-white">{totalMetrics.clicks.toLocaleString()}</p>
            </div>
            <div className="text-green-500 text-2xl">🖱️</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Click-Through Rate</p>
              <p className="text-2xl font-bold text-white">{overallCTR.toFixed(2)}%</p>
            </div>
            <div className="text-yellow-500 text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalMetrics.revenue.toFixed(2)}</p>
            </div>
            <div className="text-purple-500 text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'revenue', label: 'Revenue', icon: '💰' },
          { key: 'clicks', label: 'Clicks', icon: '🖱️' },
          { key: 'impressions', label: 'Impressions', icon: '👁️' },
          { key: 'ctr', label: 'CTR %', icon: '📈' },
        ].map(metric => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === metric.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {metric.icon} {metric.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Performance by Ad
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name
                ]}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item ? `Ad: ${item.fullName}` : label;
                }}
              />
              <Legend />
              <Bar 
                dataKey={selectedMetric} 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Revenue by Ad Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Detailed Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2 text-gray-300">Ad ID</th>
                <th className="text-left p-2 text-gray-300">Type</th>
                <th className="text-right p-2 text-gray-300">Impressions</th>
                <th className="text-right p-2 text-gray-300">Clicks</th>
                <th className="text-right p-2 text-gray-300">CTR</th>
                <th className="text-right p-2 text-gray-300">Conversions</th>
                <th className="text-right p-2 text-gray-300">Conv. Rate</th>
                <th className="text-right p-2 text-gray-300">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((ad, index) => (
                <tr key={ad.adId} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-2 text-white font-mono text-xs">
                    {ad.adId.substring(0, 20)}...
                  </td>
                  <td className="p-2 text-gray-300">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ad.adType === 'banner' ? 'bg-blue-600' :
                      ad.adType === 'popunder' ? 'bg-green-600' :
                      'bg-purple-600'
                    } text-white`}>
                      {ad.adType}
                    </span>
                  </td>
                  <td className="p-2 text-right text-white">{ad.impressions.toLocaleString()}</td>
                  <td className="p-2 text-right text-white">{ad.clicks.toLocaleString()}</td>
                  <td className="p-2 text-right text-white">{ad.ctr.toFixed(2)}%</td>
                  <td className="p-2 text-right text-white">{ad.conversions.toLocaleString()}</td>
                  <td className="p-2 text-right text-white">{ad.conversionRate.toFixed(2)}%</td>
                  <td className="p-2 text-right text-white font-semibold">${ad.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
        <h4 className="text-lg font-semibold text-blue-300 mb-2">📈 Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200">
              <strong>Best Performing Ad:</strong> {performanceData[0]?.adId.substring(0, 20) || 'N/A'}...
            </p>
            <p className="text-blue-200">
              <strong>Average CTR:</strong> {overallCTR.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-blue-200">
              <strong>Total Ads Active:</strong> {performanceData.length}
            </p>
            <p className="text-blue-200">
              <strong>Conversion Rate:</strong> {overallConversionRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdAnalyticsDashboard;
