-- Migration: 003_add_question_set_status.sql
-- Description: Add status column to question_sets table for "locked" / "coming soon" functionality
-- Created: 2025-01-27

ALTER TABLE question_sets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT NULL;
COMMENT ON COLUMN question_sets.status IS 'Status of question set: NULL or "locked" for coming soon sets';

