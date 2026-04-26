// filepath: src/utils/storage.js
import { supabase } from '../lib/supabase';

// Song functions
export async function getSongs() {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching songs:', err);
    return [];
  }
}

export async function saveSong(song) {
  try {
    const songData = {
      title: song.title,
      artist: song.artist,
      original_key: song.originalKey,
      selected_key: song.selectedKey || song.originalKey,
      tempo: song.tempo || null,
      category: song.category || null,
      language: song.language || null,
      chord_chart: song.chordChart || null,
      notes: song.notes || null,
      updated_at: new Date().toISOString()
    };

    if (song.id) {
      // Update existing song
      const { data, error } = await supabase
        .from('songs')
        .update(songData)
        .eq('id', song.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new song
      songData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('songs')
        .insert(songData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('Error saving song:', err);
    throw err;
  }
}

export async function deleteSong(id) {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting song:', err);
    throw err;
  }
}

export async function getSongById(id) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching song:', err);
    return null;
  }
}

// Lineup functions
export async function getLineups() {
  try {
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching lineups:', err);
    return [];
  }
}

export async function saveLineup(lineup) {
  try {
    const lineupData = {
      date: lineup.date,
      service_time: lineup.serviceTime,
      worship_leader: lineup.worshipLeader || null,
      songs: lineup.songs || [],
      musicians: lineup.musicians || {},
      general_notes: lineup.generalNotes || null,
      updated_at: new Date().toISOString()
    };

    if (lineup.id) {
      // Update existing lineup
      const { data, error } = await supabase
        .from('lineups')
        .update(lineupData)
        .eq('id', lineup.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new lineup
      lineupData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('lineups')
        .insert(lineupData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('Error saving lineup:', err);
    throw err;
  }
}

export async function deleteLineup(id) {
  try {
    const { error } = await supabase
      .from('lineups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting lineup:', err);
    throw err;
  }
}

export async function getLineupById(id) {
  try {
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching lineup:', err);
    return null;
  }
}

export async function getUpcomingLineup() {
  try {
    const now = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .gte('date', now)
      .order('date', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error fetching upcoming lineup:', err);
    return null;
  }
}