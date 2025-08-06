import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { tmdbService, Genre } from '../services/api';

interface GenreFilterProps {
  onGenreSelect: (genreId: number | null, genreName: string) => void;
  selectedGenre: number | null;
  type: 'movie' | 'tv';
}

export const GenreFilter: React.FC<GenreFilterProps> = ({ onGenreSelect, selectedGenre, type }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGenres();
  }, [type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadGenres = async () => {
    setLoading(true);
    try {
      const genreData = type === 'movie' 
        ? await tmdbService.getMovieGenres()
        : await tmdbService.getTVGenres();
      setGenres(genreData || []);
    } catch (error) {
      console.error('Error loading genres:', error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'All Genres';

  const handleGenreSelect = (genreId: number | null, genreName: string) => {
    onGenreSelect(genreId, genreName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center justify-between space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors min-w-[140px] disabled:opacity-50"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span className="truncate">{loading ? 'Loading...' : selectedGenreName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !loading && (
        <>
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto border border-slate-700">
            <div className="p-2">
              <button
                onClick={() => handleGenreSelect(null, 'All Genres')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedGenre === null
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id, genre.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedGenre === genre.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};