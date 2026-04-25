// filepath: src/utils/storage.js

const SONGS_KEY = 'worship_songs';
const LINEUPS_KEY = 'worship_lineups';

// Song functions
export function getSongs() {
  const data = localStorage.getItem(SONGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSong(song) {
  const songs = getSongs();
  const existingIndex = songs.findIndex(s => s.id === song.id);
  
  if (existingIndex >= 0) {
    songs[existingIndex] = { ...song, updatedAt: new Date().toISOString() };
  } else {
    songs.push({
      ...song,
      id: song.id || `song_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  return song.id ? songs.find(s => s.id === song.id) : songs[songs.length - 1];
}

export function deleteSong(id) {
  const songs = getSongs().filter(s => s.id !== id);
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function getSongById(id) {
  return getSongs().find(s => s.id === id);
}

// Lineup functions
export function getLineups() {
  const data = localStorage.getItem(LINEUPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLineup(lineup) {
  const lineups = getLineups();
  const existingIndex = lineups.findIndex(l => l.id === lineup.id);
  
  if (existingIndex >= 0) {
    lineups[existingIndex] = { ...lineup, updatedAt: new Date().toISOString() };
  } else {
    lineups.push({
      ...lineup,
      id: lineup.id || `lineup_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(LINEUPS_KEY, JSON.stringify(lineups));
  return lineup.id ? lineups.find(l => l.id === lineup.id) : lineups[lineups.length - 1];
}

export function deleteLineup(id) {
  const lineups = getLineups().filter(l => l.id !== id);
  localStorage.setItem(LINEUPS_KEY, JSON.stringify(lineups));
}

export function getLineupById(id) {
  return getLineups().find(l => l.id === id);
}

export function getUpcomingLineup() {
  const lineups = getLineups();
  const now = new Date();
  return lineups
    .filter(l => new Date(l.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}