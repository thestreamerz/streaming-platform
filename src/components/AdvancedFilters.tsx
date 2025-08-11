import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Star, Clock, Zap, Award, TrendingUp } from 'lucide-react';
import { tmdbService, Genre } from '../services/api';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  type: 'movie' | 'tv';
}

export interface FilterOptions {
  genres: number[];
  yearRange: { min: number; max: number };
  ratingRange: { min: number; max: number };
  runtime: { min: number; max: number };
  sortBy: string;
  includeAdult: boolean;
  language: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    yearRange: { min: 1900, max: new Date().getFullYear() + 2 },
    ratingRange: { min: 0, max: 10 },
    runtime: { min: 0, max: 300 },
    sortBy: 'popularity.desc',
    includeAdult: false,
    language: 'en'
  });

  useEffect(() => {
    loadGenres();
  }, [type]);

  const loadGenres = async () => {
    try {
      const genreData = type === 'movie' 
        ? await tmdbService.getMovieGenres()
        : await tmdbService.getTVGenres();
      setGenres(genreData || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    const newFilters = { ...filters, genres: newGenres };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      genres: [],
      yearRange: { min: 1900, max: new Date().getFullYear() + 2 },
      ratingRange: { min: 0, max: 10 },
      runtime: { min: 0, max: 300 },
      sortBy: 'popularity.desc',
      includeAdult: false,
      language: 'en'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular', icon: TrendingUp },
    { value: 'vote_average.desc', label: 'Highest Rated', icon: Star },
    { value: 'release_date.desc', label: 'Newest First', icon: Calendar },
    { value: 'release_date.asc', label: 'Oldest First', icon: Clock },
    { value: 'vote_count.desc', label: 'Most Voted', icon: Award }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
      >
        <Filter className="w-4 h-4" />
        <span>Advanced Filters</span>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl z-50 border border-slate-700 animate-slide-up">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Advanced Filters</span>
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-white font-medium mb-3">Sort By</label>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleRangeChange('sortBy', option.value)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          filters.sortBy === option.value
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-white font-medium mb-3">Genres</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        filters.genres.includes(genre.id)
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="block text-white font-medium mb-3">Release Year</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1900"
                      max={new Date().getFullYear() + 2}
                      value={filters.yearRange.min}
                      onChange={(e) => handleRangeChange('yearRange', { ...filters.yearRange, min: Number(e.target.value) })}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-gray-300 text-sm w-12">{filters.yearRange.min}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1900"
                      max={new Date().getFullYear() + 2}
                      value={filters.yearRange.max}
                      onChange={(e) => handleRangeChange('yearRange', { ...filters.yearRange, max: Number(e.target.value) })}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-gray-300 text-sm w-12">{filters.yearRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <label className="block text-white font-medium mb-3">Rating Range</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={filters.ratingRange.min}
                      onChange={(e) => handleRangeChange('ratingRange', { ...filters.ratingRange, min: Number(e.target.value) })}
                      className="flex-1 accent-yellow-500"
                    />
                    <span className="text-gray-300 text-sm w-8">{filters.ratingRange.min}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={filters.ratingRange.max}
                      onChange={(e) => handleRangeChange('ratingRange', { ...filters.ratingRange, max: Number(e.target.value) })}
                      className="flex-1 accent-yellow-500"
                    />
                    <span className="text-gray-300 text-sm w-8">{filters.ratingRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-white font-medium mb-3">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => handleRangeChange('language', e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};