// filepath: src/pages/AddSong.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveSong, getSongById } from '../utils/storage';

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

export default function AddSong() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    originalKey: 'C',
    selectedKey: 'C',
    tempo: '',
    category: 'Worship',
    language: '',
    chordChart: '',
    notes: '',
    lyrics: '',
    lyricsSections: []
  });

  const [previewSection, setPreviewSection] = useState('all');

  useEffect(() => {
    async function loadSong() {
      if (isEdit && id) {
        const song = await getSongById(id);
        if (song) {
          setFormData({
            title: song.title || '',
            artist: song.artist || '',
            originalKey: song.original_key || 'C',
            selectedKey: song.selected_key || song.original_key || 'C',
            tempo: song.tempo || '',
            category: song.category || 'Worship',
            language: song.language || '',
            chordChart: song.chord_chart || '',
            notes: song.notes || '',
            lyrics: song.lyrics || '',
            lyricsSections: song.lyrics_sections || []
          });
        }
      }
    }
    loadSong();
  }, [id, isEdit]);

  const keys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
  const categories = ['Worship', 'Praise', 'Filipino', 'Hymn', 'Contemporary', 'Other'];
  const tempos = ['Slow', 'Medium Slow', 'Medium', 'Medium Fast', 'Fast'];
  const languages = ['English', 'Filipino', 'Tagalog', 'Spanish', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLyricsChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, lyrics: value }));
  };

  const handleAddSection = () => {
    setFormData(prev => ({
      ...prev,
      lyricsSections: [
        ...prev.lyricsSections,
        { section: 'Verse 1', text: '' }
      ]
    }));
  };

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      lyricsSections: prev.lyricsSections.filter((_, i) => i !== index)
    }));
  };

  const handleSectionTypeChange = (index, newType) => {
    setFormData(prev => ({
      ...prev,
      lyricsSections: prev.lyricsSections.map((item, i) =>
        i === index ? { ...item, section: newType } : item
      )
    }));
  };

  const handleSectionTextChange = (index, newText) => {
    setFormData(prev => ({
      ...prev,
      lyricsSections: prev.lyricsSections.map((item, i) =>
        i === index ? { ...item, text: newText } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const songData = {
        ...formData,
        id: isEdit ? id : undefined,
        selectedKey: formData.selectedKey || formData.originalKey
      };
      
      await saveSong(songData);
      navigate('/songs');
    } catch (err) {
      console.error('Error saving song:', err);
      alert('Error saving song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    if (previewSection === 'all') {
      return formData.lyricsSections.map(s => s.text).filter(Boolean).join('\n\n') || formData.lyrics || 'No lyrics available';
    }
    const section = formData.lyricsSections.find(s => s.section === previewSection);
    return section?.text || 'No lyrics for this section';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'Edit Song' : 'Add New Song'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Song Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Ikaw Lamang"
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Artist / Composer *
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Rommel Guevara"
              />
            </div>

            {/* Keys Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Original Key *
                </label>
                <select
                  name="originalKey"
                  value={formData.originalKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selected Key
                </label>
                <select
                  name="selectedKey"
                  value={formData.selectedKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Tempo Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tempo
                </label>
                <select
                  name="tempo"
                  value={formData.tempo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select tempo</option>
                  {tempos.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Chord Chart */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chord Chart <span className="text-gray-500 font-normal">(for musicians)</span>
              </label>
              <textarea
                name="chordChart"
                value={formData.chordChart}
                onChange={handleChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder={`Intro:
C  G  Am  F

Verse 1:
C            G
Lord, You are faithful...`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use section headers like "Intro:", "Verse:", "Chorus:", "Bridge:" to label sections
              </p>
            </div>

            {/* Full Lyrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Lyrics <span className="text-gray-500 font-normal">(for singers)</span>
              </label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleLyricsChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Paste full song lyrics here..."
              />
            </div>

            {/* Lyrics Section Builder */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lyrics Sections
                </h3>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium"
                >
                  + Add Section
                </button>
              </div>

              {formData.lyricsSections.length > 0 ? (
                <div className="space-y-4">
                  {formData.lyricsSections.map((section, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <select
                          value={section.section}
                          onChange={(e) => handleSectionTypeChange(index, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                        >
                          {SECTION_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        value={section.text}
                        onChange={(e) => handleSectionTextChange(index, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter lyrics for this section..."
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No lyrics sections added. Click "Add Section" to create sections for Verse, Chorus, Bridge, etc.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrangement Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Use soft intro, build up in chorus, adlib after 2nd verse"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEdit ? 'Update Song' : 'Add Song'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/songs')}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Vocals Monitor Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Vocals Monitor Preview
            </h2>
            
            {/* Section Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Section
              </label>
              <select
                value={previewSection}
                onChange={(e) => setPreviewSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Lyrics</option>
                {SECTION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Preview Display */}
            <div className="bg-slate-900 rounded-lg p-4 min-h-[300px]">
              <pre className="text-white text-lg leading-relaxed whitespace-pre-wrap font-medium">
{getPreviewText()}
              </pre>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              This preview shows how lyrics will appear on the Vocals Monitor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}