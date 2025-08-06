import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { tmdbService, Genre } from '../services/api';

interface GenreFilterProps {
  onGenreSelect: (genreId: number | null, genreName: string) => void;
  selectedGenre: number | null;
  type: 'movie' | 'tv';
}

export const GenreFilter: React.FC<GenreFilterProps> = ({ onGenreSelect, selectedGenre, type }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadGenres();
  }, [type]);

  const loadGenres = async () => {
    try {
      const genreData = type === 'movie' 
        ? await tmdbService.getMovieGenres()
        : await tmdbService.getTVGenres();
      setGenres(genreData);
    } catch (error) {
      console.error('Error loading genres:', error);
      setGenres([]);
    }
  };

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'All Genres';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>{selectedGenreName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onGenreSelect(null, 'All Genres');
                setIsOpen(false);
              }}
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
                onClick={() => {
                  onGenreSelect(genre.id, genre.name);
                  setIsOpen(false);
                }}
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
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};