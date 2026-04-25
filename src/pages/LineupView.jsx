// filepath: src/pages/LineupView.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLineupById, deleteLineup, getSongs } from '../utils/storage';
import { transposeChords, getTransposedKey } from '../utils/transpose';

export default function LineupView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lineup, setLineup] = useState(null);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [showChords, setShowChords] = useState(false);

  useEffect(() => {
    if (id) {
      const foundLineup = getLineupById(id);
      if (foundLineup) {
        setLineup(foundLineup);
      }
    }
  }, [id]);

  if (!lineup) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Lineup not found.</p>
        <Link to="/lineup" className="text-indigo-600 hover:text-indigo-800">
          Back to Lineups
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this lineup?')) {
      deleteLineup(id);
      navigate('/lineup');
    }
  };

  const handleTranspose = (delta) => {
    setTransposeAmount(prev => Math.max(-12, Math.min(12, prev + delta)));
  };

  const handleReset = () => {
    setTransposeAmount(0);
  };

  const getSongChords = (song) => {
    const songs = getSongs();
    const songData = songs.find(s => s.id === song.songId || s.title === song.title);
    if (!songData) return '';
    return transposeChords(songData.chordChart || '', transposeAmount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/lineup" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← Back to Lineups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Sunday Lineup
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {formatDate(lineup.date)} • {lineup.serviceTime}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/lineup/edit/${lineup.id}`}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Service Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(lineup.date)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Service Time</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{lineup.serviceTime}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Worship Leader</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{lineup.worshipLeader || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Songs</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{lineup.songs?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Transpose Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleTranspose(-1)}
            disabled={transposeAmount <= -12}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">Transpose All</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount}
            </span>
          </div>
          <button
            onClick={() => handleTranspose(1)}
            disabled={transposeAmount >= 12}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
          <button
            onClick={handleReset}
            className="ml-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowChords(!showChords)}
            className="ml-4 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            {showChords ? 'Hide Chords' : 'Show Chords'}
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-4">
        {lineup.songs?.map((song, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-indigo-600">{index + 1}.</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {song.title}
                  </h3>
                  <span className="text-lg text-indigo-600 font-medium">
                    Key: {getTransposedKey(song.selectedKey, transposeAmount)}
                  </span>
                </div>
              </div>
              {song.notes && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-sm">
                  {song.notes}
                </span>
              )}
            </div>
            
            {showChords && (
              <pre className="mt-4 whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
{getSongChords(song) || 'No chord chart available.'}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Team */}
      {lineup.musicians && Object.values(lineup.musicians).some(v => v) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Team Assignments
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(lineup.musicians).map(([role, name]) => (
              name && (
                <div key={role}>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {role.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* General Notes */}
      {lineup.generalNotes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            General Notes
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{lineup.generalNotes}</p>
        </div>
      )}

      {/* Print Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🖨 Print / Export
        </button>
      </div>
    </div>
  );
}