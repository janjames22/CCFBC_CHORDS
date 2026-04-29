// filepath: src/pages/CreateLineup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveLineup, getLineupById, getSongs } from '../utils/storage';

export default function CreateLineup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [songsList, setSongsList] = useState([]);

  const [formData, setFormData] = useState({
    date: '',
    serviceTime: '9:00 AM',
    worshipLeader: '',
    songs: [],
    musicians: {
      keyboard: '',
      acoustic: '',
      electric: '',
      bass: '',
      drums: '',
      multimedia: '',
      vocals_1: '',
      vocals_2: '',
      vocals_3: ''
    },
    generalNotes: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const songsData = await getSongs();
        setSongsList(songsData);
        
        if (isEdit && id) {
          const lineup = await getLineupById(id);
          if (lineup) {
            setFormData({
              date: lineup.date || '',
              serviceTime: lineup.service_time || '9:00 AM',
              worshipLeader: lineup.worship_leader || '',
              songs: lineup.songs || [],
              musicians: lineup.musicians || {},
              generalNotes: lineup.general_notes || ''
            });
          }
        } else {
          // Set default date to next Sunday
          const nextSunday = getNextSunday();
          setFormData(prev => ({ ...prev, date: nextSunday }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadData();
  }, [id, isEdit]);

  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMusicianChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      musicians: { ...prev.musicians, [name]: value }
    }));
  };

  const handleAddSong = (songId) => {
    const song = songsList.find(s => s.id === songId);
    if (song && !formData.songs.find(s => s.songId === songId)) {
      setFormData(prev => ({
        ...prev,
        songs: [...prev.songs, {
          songId: song.id,
          title: song.title,
          selectedKey: song.selected_key || song.original_key,
          order: prev.songs.length + 1,
          notes: ''
        }]
      }));
    }
  };

  const handleRemoveSong = (index) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index).map((song, i) => ({ ...song, order: i + 1 }))
    }));
  };

  const handleSongKeyChange = (index, newKey) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, selectedKey: newKey } : song
      )
    }));
  };

  const handleSongNotesChange = (index, notes) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, notes } : song
      )
    }));
  };

  const handleMoveSong = (index, direction) => {
    const newSongs = [...formData.songs];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newSongs.length) {
      [newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]];
      setFormData(prev => ({
        ...prev,
        songs: newSongs.map((song, i) => ({ ...song, order: i + 1 }))
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const lineupData = {
        ...formData,
        id: isEdit ? id : undefined
      };
      
      await saveLineup(lineupData);
      navigate('/lineup');
    } catch (err) {
      console.error('Error saving lineup:', err);
      alert('Error saving lineup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableSongs = songsList.filter(s => !formData.songs.find(ls => ls.songId === s.id));
  const keys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'Edit Sunday Lineup' : 'Create Sunday Lineup'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Time
              </label>
              <input
                type="text"
                name="serviceTime"
                value={formData.serviceTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 9:00 AM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Worship Leader
              </label>
              <input
                type="text"
                name="worshipLeader"
                value={formData.worshipLeader}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Jan James"
              />
            </div>
          </div>
        </div>

        {/* Song Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Songs</h2>
          
          {/* Add Song */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Song to Lineup
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue=""
              >
                <option value="">Select a song...</option>
                {availableSongs.map(song => (
                  <option key={song.id} value={song.id}>
                    {song.title} - {song.originalKey}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => {
                  const select = e.target.previousElementSibling;
                  if (select.value) handleAddSong(select.value);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Song List */}
          {formData.songs.length > 0 ? (
            <div className="space-y-3">
              {formData.songs.map((song, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-indigo-600">{index + 1}.</span>
                      <span className="font-medium text-gray-900 dark:text-white">{song.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveSong(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSong(index, 1)}
                        disabled={index === formData.songs.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSong(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Key</label>
                      <select
                        value={song.selectedKey}
                        onChange={(e) => handleSongKeyChange(index, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                      >
                        {keys.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Notes</label>
                      <input
                        type="text"
                        value={song.notes}
                        onChange={(e) => handleSongNotesChange(index, e.target.value)}
                        placeholder="e.g., Start with full band"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No songs added yet. Add songs from the library above.</p>
          )}
        </div>

        {/* Team Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keyboard
              </label>
              <input
                type="text"
                name="keyboard"
                value={formData.musicians.keyboard}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Acoustic Guitar
              </label>
              <input
                type="text"
                name="acoustic"
                value={formData.musicians.acoustic}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Electric Guitar
              </label>
              <input
                type="text"
                name="electric"
                value={formData.musicians.electric}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bass
              </label>
              <input
                type="text"
                name="bass"
                value={formData.musicians.bass}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drums
              </label>
              <input
                type="text"
                name="drums"
                value={formData.musicians.drums}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Multimedia
              </label>
              <input
                type="text"
                name="multimedia"
                value={formData.musicians.multimedia}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vocals 1
              </label>
              <input
                type="text"
                name="vocals_1"
                value={formData.musicians.vocals_1}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vocals 2
              </label>
              <input
                type="text"
                name="vocals_2"
                value={formData.musicians.vocals_2}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vocals 3
              </label>
              <input
                type="text"
                name="vocals_3"
                value={formData.musicians.vocals_3}
                onChange={handleMusicianChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Notes</h2>
          <textarea
            name="generalNotes"
            value={formData.generalNotes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Practice at 7:30 AM before service"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEdit ? 'Update Lineup' : 'Create Lineup'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/lineup')}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}