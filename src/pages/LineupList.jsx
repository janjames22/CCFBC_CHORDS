// filepath: src/pages/LineupList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLineups, deleteLineup } from '../utils/storage';

export default function LineupList() {
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLineups() {
      try {
        const data = await getLineups();
        setLineups(data);
      } catch (err) {
        console.error('Error loading lineups:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLineups();
  }, []);

  // Sort by date, upcoming first
  const sortedLineups = [...lineups].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id, date) => {
    if (confirm(`Are you sure you want to delete the lineup for ${new Date(date).toLocaleDateString()}?`)) {
      try {
        await deleteLineup(id);
        setLineups(lineups.filter(l => l.id !== id));
      } catch (err) {
        console.error('Error deleting lineup:', err);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
          Sunday Lineups
        </h1>
        <Link
          to="/lineup/create"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Create Lineup
        </Link>
      </div>

      {sortedLineups.length > 0 ? (
        <div className="space-y-4">
          {sortedLineups.map(lineup => (
            <div
              key={lineup.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatDate(lineup.date)}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm">
                      {lineup.service_time}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    <strong>Worship Leader:</strong> {lineup.worship_leader || 'Not assigned'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lineup.songs?.slice(0, 3).map((song, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm">
                        {index + 1}. {song.title} ({song.selectedKey})
                      </span>
                    ))}
                    {lineup.songs?.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-sm">
                        +{lineup.songs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/lineup/${lineup.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/lineup/edit/${lineup.id}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(lineup.id, lineup.date)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No lineups yet. Create your first Sunday lineup!
          </p>
          <Link
            to="/lineup/create"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create Your First Lineup
          </Link>
        </div>
      )}
    </div>
  );
}