import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { tmdbService, Movie, TVShow } from '../services/api';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

interface SearchDropdownProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onResultSelect: (item: any, type: 'movie' | 'tv') => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onResultSelect
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch();
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.searchMovies(searchQuery),
        tmdbService.searchTVShows(searchQuery)
      ]);

      const combinedResults: SearchResult[] = [
        ...movieResults.slice(0, 5).map(movie => ({ ...movie, type: 'movie' as const })),
        ...tvResults.slice(0, 5).map(show => ({ ...show, type: 'tv' as const }))
      ];

      setResults(combinedResults);
      setIsOpen(combinedResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result, result.type);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch();
      setIsOpen(false);
    }
  };

  const getTitle = (result: SearchResult) => {
    return result.type === 'movie' ? result.title : result.name;
  };

  const getYear = (result: SearchResult) => {
    const date = result.type === 'movie' ? result.release_date : result.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="flex">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies & TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="pl-10 pr-4 py-2 w-64 bg-slate-800 border border-slate-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors font-medium"
        >
          Search
        </button>
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 hover:bg-slate-700 transition-colors text-left flex items-center space-x-3"
                >
                  <img
                    src={tmdbService.getImageUrl(result.poster_path, 'w92')}
                    alt={getTitle(result)}
                    className="w-10 h-14 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{getTitle(result)}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span className="capitalize">{result.type}</span>
                      {getYear(result) && (
                        <>
                          <span>•</span>
                          <span>{getYear(result)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {searchQuery.trim() && (
                <div className="border-t border-slate-700 mt-2 pt-2">
                  <button
                    onClick={() => {
                      onSearch();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-blue-400 hover:bg-slate-700 transition-colors text-left"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};