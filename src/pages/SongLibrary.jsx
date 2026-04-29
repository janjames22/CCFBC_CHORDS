// filepath: src/pages/SongLibrary.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSongs, deleteSong } from '../utils/storage';

export default function SongLibrary() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    async function loadSongs() {
      try {
        const data = await getSongs();
        setSongs(data);
      } catch (err) {
        console.error('Error loading songs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, []);

  const keys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
  const categories = ['Worship', 'Praise', 'Filipino', 'Hymn', 'Contemporary', 'Other'];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKey = !filterKey || song.original_key === filterKey || song.selected_key === filterKey;
    const matchesCategory = !filterCategory || song.category === filterCategory;
    return matchesSearch && matchesKey && matchesCategory;
  });

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteSong(id);
        setSongs(songs.filter(s => s.id !== id));
      } catch (err) {
        console.error('Error deleting song:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Song Library
        </h1>
        <Link
          to="/songs/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Song
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Key
            </label>
            <select
              value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Keys</option>
              {keys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setFilterKey(''); setFilterCategory(''); }}
              className="w-full px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map(song => (
            <div
              key={song.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {song.title}
                </h3>
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-sm font-medium">
                  {song.selected_key || song.original_key}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {song.artist}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {song.category && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    {song.category}
                  </span>
                )}
                {song.language && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    {song.language}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/songs/${song.id}`}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-center rounded hover:bg-indigo-700 transition-colors"
                >
                  View
                </Link>
                <Link
                  to={`/songs/edit/${song.id}`}
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(song.id, song.title)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No songs found. Add your first song to get started!
          </p>
          <Link
            to="/songs/add"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Your First Song
          </Link>
        </div>
      )}
    </div>
  );
}