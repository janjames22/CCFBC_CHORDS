// filepath: src/pages/LineupView.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLineupById, deleteLineup, getSongs } from '../utils/storage';
import { transposeChords, getTransposedKey } from '../utils/transpose';

export default function LineupView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lineup, setLineup] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [showChords, setShowChords] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [lineupData, songsData] = await Promise.all([
          id ? getLineupById(id) : Promise.resolve(null),
          getSongs()
        ]);
        
        if (lineupData) {
          setLineup(lineupData);
        }
        setAllSongs(songsData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const getSongChords = (song) => {
    const songData = allSongs.find(s => s.id === song.songId || s.title === song.title);
    if (!songData) return '';
    return transposeChords(songData.chord_chart || songData.chordChart || '', transposeAmount);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this lineup?')) {
      await deleteLineup(id);
      navigate('/lineup');
    }
  };

  const handleTranspose = (delta) => {
    setTransposeAmount(prev => Math.max(-12, Math.min(12, prev + delta)));
  };

  const handleReset = () => {
    setTransposeAmount(0);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!lineup) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Lineup not found.</p>
        <Link to="/lineup" className="text-blue-600 hover:text-blue-800">
          Back to Lineups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/lineup" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Lineups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Sunday Lineup
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {formatDate(lineup.date)} • {lineup.service_time}
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
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{lineup.service_time}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Worship Leader</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{lineup.worship_leader || '-'}</p>
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
            className="ml-4 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
                <span className="text-2xl font-bold text-blue-600">{index + 1}.</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {song.title}
                  </h3>
                  <span className="text-lg text-blue-600 font-medium">
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
            {lineup.musicians.keyboard && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Keyboard</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.keyboard}</p>
              </div>
            )}
            {lineup.musicians.acoustic && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Acoustic Guitar</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.acoustic}</p>
              </div>
            )}
            {lineup.musicians.electric && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Electric Guitar</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.electric}</p>
              </div>
            )}
            {lineup.musicians.bass && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Bass</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.bass}</p>
              </div>
            )}
            {lineup.musicians.drums && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Drums</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.drums}</p>
              </div>
            )}
            {lineup.musicians.multimedia && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Multimedia</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.multimedia}</p>
              </div>
            )}
            {lineup.musicians.vocals_1 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Vocals 1</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.vocals_1}</p>
              </div>
            )}
            {lineup.musicians.vocals_2 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Vocals 2</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.vocals_2}</p>
              </div>
            )}
            {lineup.musicians.vocals_3 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Vocals 3</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{lineup.musicians.vocals_3}</p>
              </div>
            )}
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