// filepath: src/pages/SongDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSongById } from '../utils/storage';
import { transposeChords, getTransposedKey } from '../utils/transpose';

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [lyricsSection, setLyricsSection] = useState('all');

  const SECTION_TYPES = [
    'Intro',
    'Verse 1',
    'Verse 2',
    'Verse 3',
    'Pre-Chorus',
    'Chorus',
    'Bridge',
    'Instrumental',
    'Ending'
  ];

  useEffect(() => {
    async function loadSong() {
      if (id) {
        const foundSong = await getSongById(id);
        if (foundSong) {
          setSong(foundSong);
          // Calculate transpose amount from original to selected key
          const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const originalIndex = keys.indexOf(foundSong.original_key);
          const selectedIndex = keys.indexOf(foundSong.selected_key || foundSong.original_key);
          setTransposeAmount(selectedIndex - originalIndex);
        }
      }
      setLoading(false);
    }
    loadSong();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Song not found.</p>
        <Link to="/songs" className="text-blue-600 hover:text-blue-800">
          Back to Song Library
        </Link>
      </div>
    );
  }

  const handleTranspose = (delta) => {
    const newAmount = Math.max(-12, Math.min(12, transposeAmount + delta));
    setTransposeAmount(newAmount);
  };

  const handleReset = () => {
    setTransposeAmount(0);
  };

  const currentKey = getTransposedKey(song.original_key, transposeAmount);
  const transposedChords = transposeChords(song.chord_chart || '', transposeAmount);

  const getLyricsText = () => {
    if (lyricsSection === 'all') {
      const sections = song.lyrics_sections?.map(s => s.text).filter(Boolean).join('\n\n');
      return sections || song.lyrics || 'No lyrics available';
    }
    const section = song.lyrics_sections?.find(s => s.section === lyricsSection);
    return section?.text || 'No lyrics for this section';
  };

  const hasLyrics = (song.lyrics && song.lyrics.length > 0) || 
                    (song.lyrics_sections && song.lyrics_sections.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/songs" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Songs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {song.title}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">{song.artist}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/songs/edit/${song.id}`}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Edit Song
          </Link>
        </div>
      </div>

      {/* Song Info & Transpose Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Original Key</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{song.original_key}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Current Key</span>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{currentKey}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
            <p className="text-gray-900 dark:text-white">{song.category || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Tempo</span>
            <p className="text-gray-900 dark:text-white">{song.tempo || '-'}</p>
          </div>
        </div>

        {/* Transpose Controls */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTranspose(-1)}
            disabled={transposeAmount <= -12}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">Transpose</span>
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
        </div>
      </div>

      {/* Chord Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Chord Chart {transposeAmount !== 0 && `(Transposed +${transposeAmount})`}
        </h2>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
{transposedChords || 'No chord chart added yet.'}
        </pre>
      </div>

      {/* Lyrics / Vocals Monitor */}
      {hasLyrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Vocals Monitor / Lyrics
          </h2>
          
          {/* Section Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Section
            </label>
            <select
              value={lyricsSection}
              onChange={(e) => setLyricsSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Lyrics</option>
              {SECTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Lyrics Display */}
          <div className="bg-slate-900 rounded-lg p-4">
            <pre className="text-white text-lg leading-relaxed whitespace-pre-wrap font-medium">
{getLyricsText()}
            </pre>
          </div>
        </div>
      )}

      {/* Notes */}
      {song.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Arrangement Notes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {song.notes}
          </p>
        </div>
      )}

      {/* Add to Lineup Button */}
      <div className="mt-6 text-center">
        <Link
          to="/lineup/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add to Sunday Lineup
        </Link>
      </div>
    </div>
  );
}