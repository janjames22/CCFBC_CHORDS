// filepath: src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSongs, getUpcomingLineup } from '../utils/storage';

export default function Dashboard() {
  const [songs, setSongs] = useState([]);
  const [upcomingLineup, setUpcomingLineup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [songsData, lineupData] = await Promise.all([
          getSongs(),
          getUpcomingLineup()
        ]);
        setSongs(songsData);
        setUpcomingLineup(lineupData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentSongs = songs.slice(-5).reverse();

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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to Praise and Worship Chords
      </h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/songs/add"
          className="p-6 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">➕ Add Song</h3>
          <p className="text-blue-200 mt-1">Add a new song to the library</p>
        </Link>
        
        <Link
          to="/lineup/create"
          className="p-6 bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">📋 Create Lineup</h3>
          <p className="text-blue-200 mt-1">Plan this Sunday's service</p>
        </Link>
        
        <Link
          to="/songs"
          className="p-6 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">🎵 View Songs</h3>
          <p className="text-blue-200 mt-1">Browse song library</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Lineup */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📅 Upcoming Sunday Lineup
          </h2>
          {upcomingLineup ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Date:</strong> {new Date(upcomingLineup.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Time:</strong> {upcomingLineup.service_time}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Worship Leader:</strong> {upcomingLineup.worship_leader || 'Not assigned'}
              </p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Songs:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {upcomingLineup.songs?.map((song, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">
                      {song.title} <span className="text-indigo-600">({song.selected_key || song.original_key})</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Link
                to={`/lineup/${upcomingLineup.id}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800"
              >
                View Full Lineup →
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming lineup. Create one to get started!</p>
          )}
        </div>

        {/* Recent Songs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎵 Recently Added Songs
          </h2>
          {recentSongs.length > 0 ? (
            <div className="space-y-3">
              {recentSongs.map(song => (
                <Link
                  key={song.id}
                  to={`/songs/${song.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {song.title}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {song.selected_key || song.original_key}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {song.artist}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No songs yet. Add your first song!</p>
          )}
          <Link
            to="/songs"
            className="inline-block mt-4 text-indigo-600 hover:text-indigo-800"
          >
            View All Songs →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{songs.length}</div>
          <div className="text-sm text-gray-500">Total Songs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {songs.filter(s => s.category === 'Worship').length}
          </div>
          <div className="text-sm text-gray-500">Worship</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {songs.filter(s => s.category === 'Praise').length}
          </div>
          <div className="text-sm text-gray-500">Praise</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {songs.filter(s => s.category === 'Filipino').length}
          </div>
          <div className="text-sm text-gray-500">Filipino</div>
        </div>
      </div>
    </div>
  );
}