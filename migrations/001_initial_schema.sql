-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for BibleRush quiz game
-- Created: 2025-01-27

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'church'
  locale_preference TEXT DEFAULT 'en', -- 'en', 'de', 'it'
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Question Sets Table
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  question_count INT DEFAULT 0,
  tier_required TEXT DEFAULT 'free', -- 'free', 'pro', 'church'
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL, -- English (MVP)
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  image_url TEXT, -- Supabase Storage URL
  scripture_reference TEXT,
  verse_content TEXT, -- Full verse text (optional)
  image_content_prompt TEXT, -- DALL-E prompt for AI generation
  image_style TEXT, -- DALL-E style specification
  is_custom_image BOOLEAN DEFAULT false, -- True if uploaded, false if AI-generated
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games Table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_code TEXT UNIQUE NOT NULL, -- 6-character code
  question_set_id UUID REFERENCES question_sets(id),
  question_count INT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  current_question_index INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game Players Table
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  total_score INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Player Answers Table
CREATE TABLE player_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES game_players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  response_time_ms INT, -- milliseconds to answer
  points_earned INT,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_host_id ON games(host_id);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_player_answers_game_id ON player_answers(game_id);
CREATE INDEX idx_player_answers_player_id ON player_answers(player_id);
CREATE INDEX idx_player_answers_question_id ON player_answers(question_id);
CREATE INDEX idx_questions_question_set_id ON questions(question_set_id);
CREATE INDEX idx_questions_order_index ON questions(question_set_id, order_index);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and tier information';
COMMENT ON TABLE question_sets IS 'Collections of questions grouped by theme';
COMMENT ON TABLE questions IS 'Individual quiz questions with multiple choice answers';
COMMENT ON TABLE games IS 'Game sessions created by hosts';
COMMENT ON TABLE game_players IS 'Players who have joined a game';
COMMENT ON TABLE player_answers IS 'Answers submitted by players during gameplay';

