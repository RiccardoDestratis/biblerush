# Database Schema Documentation

## Overview

The database uses a flat table structure with separate columns for each language (English, German, Italian). This approach provides:
- Simple queries without joins
- Easy filtering and sorting
- Clear data structure
- Good performance

### UUID Generation

**Supabase automatically generates UUIDs** for all primary keys using `uuid_generate_v4()`. You don't need to provide IDs when inserting records - they're generated automatically. Both `question_sets.id` and `questions.id` are auto-generated.

## Question Sets Table (`question_sets`)

Stores collections of questions grouped by theme.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name_en` | TEXT | Question set name in English (required) |
| `name_de` | TEXT | Question set name in German |
| `name_it` | TEXT | Question set name in Italian |
| `description_en` | TEXT | Description in English |
| `description_de` | TEXT | Description in German |
| `description_it` | TEXT | Description in Italian |
| `difficulty` | TEXT | Difficulty level: `beginner`, `intermediate`, `advanced` |
| `question_count` | INT | Number of questions in this set |
| `tier_required` | TEXT | Required tier: `free`, `pro`, `church` |
| `is_published` | BOOLEAN | Whether the set is published |
| `created_at` | TIMESTAMP | Creation timestamp |

### Example Query

```sql
-- Get all question sets in English
SELECT id, name_en, description_en, difficulty 
FROM question_sets 
WHERE is_published = true;
```

## Questions Table (`questions`)

Stores individual quiz questions with multilingual content.

### Core Fields

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `question_set_id` | UUID | Foreign key to `question_sets` |
| `order_index` | INT | Order within the question set (1, 2, 3, ...) |

### Multilingual Question Text

| Column | Type | Description |
|--------|------|-------------|
| `question_en` | TEXT | Question text in English (required) |
| `question_de` | TEXT | Question text in German |
| `question_it` | TEXT | Question text in Italian |

### Multilingual Options

Each option (A, B, C, D) has three language columns:

| Column | Type | Description |
|--------|------|-------------|
| `option_a_en` | TEXT | Option A in English (required) |
| `option_a_de` | TEXT | Option A in German |
| `option_a_it` | TEXT | Option A in Italian |
| `option_b_en` | TEXT | Option B in English (required) |
| `option_b_de` | TEXT | Option B in German |
| `option_b_it` | TEXT | Option B in Italian |
| `option_c_en` | TEXT | Option C in English (required) |
| `option_c_de` | TEXT | Option C in German |
| `option_c_it` | TEXT | Option C in Italian |
| `option_d_en` | TEXT | Option D in English (required) |
| `option_d_de` | TEXT | Option D in German |
| `option_d_it` | TEXT | Option D in Italian |

### Answer Fields

| Column | Type | Description |
|--------|------|-------------|
| `correct_answer` | CHAR(1) | Correct answer letter: `A`, `B`, `C`, or `D` |
| `right_answer_en` | TEXT | Full text of correct answer in English (required) |
| `right_answer_de` | TEXT | Full text of correct answer in German |
| `right_answer_it` | TEXT | Full text of correct answer in Italian |

### Verse/Reference Fields

| Column | Type | Description |
|--------|------|-------------|
| `verse_reference_en` | TEXT | Bible verse reference in English (e.g., "Luke 2:4,7") |
| `verse_reference_de` | TEXT | Bible verse reference in German |
| `verse_reference_it` | TEXT | Bible verse reference in Italian |
| `verse_content_en` | TEXT | Full verse text in English |
| `verse_content_de` | TEXT | Full verse text in German |
| `verse_content_it` | TEXT | Full verse text in Italian |

### Media Fields

| Column | Type | Description |
|--------|------|-------------|
| `image_location` | TEXT | URL or path to question image (Supabase Storage) - nullable |
| `video_location` | TEXT | URL or path to question video (Supabase Storage) - nullable |
| `image_prompt` | TEXT | DALL-E prompt for AI image generation |
| `image_style` | TEXT | DALL-E style specification |
| `is_custom_image` | BOOLEAN | True if uploaded, false if AI-generated |

### Metadata Fields

| Column | Type | Description |
|--------|------|-------------|
| `created_at` | TIMESTAMP | Creation timestamp |

### Example Queries

```sql
-- Get all questions for a set in English
SELECT 
  id,
  question_en,
  option_a_en,
  option_b_en,
  option_c_en,
  option_d_en,
  correct_answer,
  right_answer_en,
  verse_reference_en,
  verse_content_en
FROM questions
WHERE question_set_id = '...'
ORDER BY order_index;

-- Get questions in German
SELECT 
  id,
  question_de,
  option_a_de,
  option_b_de,
  option_c_de,
  option_d_de,
  correct_answer,
  right_answer_de,
  verse_reference_de,
  verse_content_de
FROM questions
WHERE question_set_id = '...'
ORDER BY order_index;
```

## Data Import

Use the import script to load JSON question data:

```bash
pnpm tsx scripts/import-questions.ts path/to/questions.json
```

The script expects JSON in this format:

```json
{
  "question_sets": [
    {
      "set_name": {
        "en": "English name",
        "de": "German name",
        "it": "Italian name"
      },
      "set_description": {
        "en": "English description",
        "de": "German description",
        "it": "Italian description"
      },
      "difficulty": "beginner",
      "questions": [
        {
          "question": { "en": "...", "de": "...", "it": "..." },
          "option_a": { "en": "...", "de": "...", "it": "..." },
          "option_b": { "en": "...", "de": "...", "it": "..." },
          "option_c": { "en": "...", "de": "...", "it": "..." },
          "option_d": { "en": "...", "de": "...", "it": "..." },
          "right_answer": { "en": "...", "de": "...", "it": "..." },
          "verse_reference": { "en": "...", "de": "...", "it": "..." },
          "verse_content": { "en": "...", "de": "...", "it": "..." },
          "image_prompt": "...",
          "image_style": "..."
        }
      ]
    }
  ]
}
```

## Migration History

1. **001_initial_schema.sql** - Initial schema with English-only support
2. **002_add_multilingual_support.sql** - Added multilingual columns (en, de, it) with flat table structure

