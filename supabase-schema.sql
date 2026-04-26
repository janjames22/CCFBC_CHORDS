-- Supabase SQL Schema for Worship Chords App
-- Run this in your Supabase SQL Editor

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  original_key TEXT DEFAULT 'C',
  selected_key TEXT,
  chord_chart TEXT DEFAULT '',
  category TEXT DEFAULT 'Worship',
  language TEXT DEFAULT 'English',
  tempo INTEGER DEFAULT 120,
  time_signature TEXT DEFAULT '4/4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lineups table
CREATE TABLE IF NOT EXISTS lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  service_time TEXT DEFAULT '9:00 AM',
  worship_leader TEXT DEFAULT '',
  songs JSONB DEFAULT '[]',
  musicians JSONB DEFAULT '{}',
  general_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public read access on songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on songs" ON songs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on songs" ON songs FOR DELETE USING (true);

CREATE POLICY "Allow public read access on lineups" ON lineups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on lineups" ON lineups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on lineups" ON lineups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on lineups" ON lineups FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
CREATE INDEX IF NOT EXISTS idx_lineups_date ON lineups(date);