import React, { useState } from 'react';
import { Search, Calendar, Star, Filter, X } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
}

export interface SearchFilters {
  query: string;
  year?: number;
  genre?: number;
  rating?: number;
  sortBy?: string;
  type?: 'movie' | 'tv';
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClose }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'popularity.desc',
    type: 'movie'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Query */}
          <div>
            <label className="block text-white font-medium mb-2">Search Term</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Enter movie or TV show name..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-white font-medium mb-2">Content Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="movie"
                  checked={filters.type === 'movie'}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as 'movie' | 'tv' })}
                  className="mr-2"
                />
                <span className="text-gray-300">Movies</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="tv"
                  checked={filters.type === 'tv'}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as 'movie' | 'tv' })}
                  className="mr-2"
                />
                <span className="text-gray-300">TV Shows</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Release Year</label>
              <select
                value={filters.year || ''}
                onChange={(e) => setFilters({ ...filters, year: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Any Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Minimum Rating</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="9">9+ Excellent</option>
                <option value="8">8+ Very Good</option>
                <option value="7">7+ Good</option>
                <option value="6">6+ Above Average</option>
                <option value="5">5+ Average</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-white font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Newest First</option>
              <option value="release_date.asc">Oldest First</option>
              <option value="title.asc">A-Z</option>
              <option value="title.desc">Z-A</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};