-- Migration: 002_add_multilingual_support.sql
-- Description: Add multilingual support (en, de, it) with flat table structure
-- Created: 2025-01-27

-- Update question_sets table to support multilingual names and descriptions
ALTER TABLE question_sets
  -- Add multilingual name columns (replacing title)
  ADD COLUMN name_en TEXT,
  ADD COLUMN name_de TEXT,
  ADD COLUMN name_it TEXT,
  -- Add multilingual description columns
  ADD COLUMN description_en TEXT,
  ADD COLUMN description_de TEXT,
  ADD COLUMN description_it TEXT;

-- Migrate existing title to name_en if data exists
UPDATE question_sets SET name_en = title WHERE title IS NOT NULL;

-- Make name_en NOT NULL (at least one language required)
ALTER TABLE question_sets
  ALTER COLUMN name_en SET NOT NULL;

-- Drop old title column (after migration)
ALTER TABLE question_sets
  DROP COLUMN title;

-- Update questions table to support multilingual content
ALTER TABLE questions
  -- Rename image_url to image_location for consistency
  RENAME COLUMN image_url TO image_location;

-- Add video_location column
ALTER TABLE questions
  ADD COLUMN video_location TEXT;

-- Add multilingual question text columns
ALTER TABLE questions
  ADD COLUMN question_en TEXT,
  ADD COLUMN question_de TEXT,
  ADD COLUMN question_it TEXT;

-- Migrate existing question_text to question_en if data exists
UPDATE questions SET question_en = question_text WHERE question_text IS NOT NULL;

-- Add multilingual option columns
ALTER TABLE questions
  ADD COLUMN option_a_en TEXT,
  ADD COLUMN option_a_de TEXT,
  ADD COLUMN option_a_it TEXT,
  ADD COLUMN option_b_en TEXT,
  ADD COLUMN option_b_de TEXT,
  ADD COLUMN option_b_it TEXT,
  ADD COLUMN option_c_en TEXT,
  ADD COLUMN option_c_de TEXT,
  ADD COLUMN option_c_it TEXT,
  ADD COLUMN option_d_en TEXT,
  ADD COLUMN option_d_de TEXT,
  ADD COLUMN option_d_it TEXT;

-- Migrate existing options to English columns if data exists
UPDATE questions SET 
  option_a_en = option_a,
  option_b_en = option_b,
  option_c_en = option_c,
  option_d_en = option_d
WHERE option_a IS NOT NULL;

-- Add multilingual right_answer columns (full text answer)
ALTER TABLE questions
  ADD COLUMN right_answer_en TEXT,
  ADD COLUMN right_answer_de TEXT,
  ADD COLUMN right_answer_it TEXT;

-- Add multilingual verse_reference columns
ALTER TABLE questions
  ADD COLUMN verse_reference_en TEXT,
  ADD COLUMN verse_reference_de TEXT,
  ADD COLUMN verse_reference_it TEXT;

-- Migrate existing scripture_reference to verse_reference_en if data exists
UPDATE questions SET verse_reference_en = scripture_reference WHERE scripture_reference IS NOT NULL;

-- Add multilingual verse_content columns
ALTER TABLE questions
  ADD COLUMN verse_content_en TEXT,
  ADD COLUMN verse_content_de TEXT,
  ADD COLUMN verse_content_it TEXT;

-- Migrate existing verse_content to verse_content_en if data exists
UPDATE questions SET verse_content_en = verse_content WHERE verse_content IS NOT NULL;

-- Rename image_content_prompt to image_prompt for consistency with JSON structure
ALTER TABLE questions
  RENAME COLUMN image_content_prompt TO image_prompt;

-- Update constraints: at least one language version required for question
ALTER TABLE questions
  ALTER COLUMN question_en SET NOT NULL,
  ALTER COLUMN option_a_en SET NOT NULL,
  ALTER COLUMN option_b_en SET NOT NULL,
  ALTER COLUMN option_c_en SET NOT NULL,
  ALTER COLUMN option_d_en SET NOT NULL,
  ALTER COLUMN right_answer_en SET NOT NULL;

-- Drop old columns after migration (if they exist and are no longer needed)
-- Note: Keeping correct_answer as it's still useful for quick validation
-- Dropping old single-language columns
ALTER TABLE questions
  DROP COLUMN IF EXISTS question_text,
  DROP COLUMN IF EXISTS option_a,
  DROP COLUMN IF EXISTS option_b,
  DROP COLUMN IF EXISTS option_c,
  DROP COLUMN IF EXISTS option_d,
  DROP COLUMN IF EXISTS scripture_reference,
  DROP COLUMN IF EXISTS verse_content;

-- Add comments for documentation
COMMENT ON COLUMN question_sets.name_en IS 'Question set name in English';
COMMENT ON COLUMN question_sets.name_de IS 'Question set name in German';
COMMENT ON COLUMN question_sets.name_it IS 'Question set name in Italian';
COMMENT ON COLUMN question_sets.description_en IS 'Question set description in English';
COMMENT ON COLUMN question_sets.description_de IS 'Question set description in German';
COMMENT ON COLUMN question_sets.description_it IS 'Question set description in Italian';

COMMENT ON COLUMN questions.image_location IS 'URL or path to question image (Supabase Storage)';
COMMENT ON COLUMN questions.video_location IS 'URL or path to question video (Supabase Storage)';
COMMENT ON COLUMN questions.question_en IS 'Question text in English';
COMMENT ON COLUMN questions.question_de IS 'Question text in German';
COMMENT ON COLUMN questions.question_it IS 'Question text in Italian';
COMMENT ON COLUMN questions.right_answer_en IS 'Full text of correct answer in English';
COMMENT ON COLUMN questions.right_answer_de IS 'Full text of correct answer in German';
COMMENT ON COLUMN questions.right_answer_it IS 'Full text of correct answer in Italian';
COMMENT ON COLUMN questions.verse_reference_en IS 'Bible verse reference in English (e.g., "Luke 2:4,7")';
COMMENT ON COLUMN questions.verse_reference_de IS 'Bible verse reference in German';
COMMENT ON COLUMN questions.verse_reference_it IS 'Bible verse reference in Italian';
COMMENT ON COLUMN questions.verse_content_en IS 'Full verse text in English';
COMMENT ON COLUMN questions.verse_content_de IS 'Full verse text in German';
COMMENT ON COLUMN questions.verse_content_it IS 'Full verse text in Italian';

