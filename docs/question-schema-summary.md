# Question Schema Summary

## Quick Reference

### Question Sets Structure

```
question_sets
├── id (UUID)
├── name_en (TEXT) *required
├── name_de (TEXT)
├── name_it (TEXT)
├── description_en (TEXT)
├── description_de (TEXT)
├── description_it (TEXT)
├── difficulty (TEXT: beginner|intermediate|advanced)
├── question_count (INT)
├── tier_required (TEXT: free|pro|church)
├── is_published (BOOLEAN)
└── created_at (TIMESTAMP)
```

### Questions Structure

```
questions
├── id (UUID)
├── question_set_id (UUID → question_sets.id)
├── order_index (INT)
│
├── Question Text (Multilingual)
│   ├── question_en (TEXT) *required
│   ├── question_de (TEXT)
│   └── question_it (TEXT)
│
├── Options (Multilingual - A, B, C, D)
│   ├── option_a_en (TEXT) *required
│   ├── option_a_de (TEXT)
│   ├── option_a_it (TEXT)
│   ├── option_b_en (TEXT) *required
│   ├── option_b_de (TEXT)
│   ├── option_b_it (TEXT)
│   ├── option_c_en (TEXT) *required
│   ├── option_c_de (TEXT)
│   ├── option_c_it (TEXT)
│   ├── option_d_en (TEXT) *required
│   ├── option_d_de (TEXT)
│   └── option_d_it (TEXT)
│
├── Answers
│   ├── correct_answer (CHAR(1): A|B|C|D) *required
│   ├── right_answer_en (TEXT) *required
│   ├── right_answer_de (TEXT)
│   └── right_answer_it (TEXT)
│
├── Verse Information (Multilingual)
│   ├── verse_reference_en (TEXT)
│   ├── verse_reference_de (TEXT)
│   ├── verse_reference_it (TEXT)
│   ├── verse_content_en (TEXT)
│   ├── verse_content_de (TEXT)
│   └── verse_content_it (TEXT)
│
├── Media
│   ├── image_location (TEXT, nullable)
│   ├── video_location (TEXT, nullable)
│   ├── image_prompt (TEXT)
│   ├── image_style (TEXT)
│   └── is_custom_image (BOOLEAN)
│
└── Metadata
    └── created_at (TIMESTAMP)
```

## Key Design Decisions

1. **Flat Structure**: Separate columns for each language instead of JSON or separate translation tables
   - ✅ Simple queries without joins
   - ✅ Easy filtering and sorting
   - ✅ Good performance
   - ✅ Clear data structure

2. **Required Fields**: English (`_en`) columns are required as the base language
   - Other languages (`_de`, `_it`) are optional

3. **Answer Storage**: 
   - `correct_answer`: Stores the letter (A, B, C, D) for quick validation
   - `right_answer_en`, `right_answer_de`, `right_answer_it`: Stores the full text answer in each language

4. **UUIDs**: 
   - Supabase/PostgreSQL automatically generates UUIDs using `uuid_generate_v4()` 
   - You don't need to provide IDs when inserting - they're auto-generated

5. **Question Order**: 
   - `order_index` field already exists in the schema (from initial migration)
   - Use this to control the sequence of questions within a set
   - The import script automatically sets this based on array position

6. **Media Fields**: 
   - `image_location` and `video_location` are nullable (can be null initially)
   - `image_prompt` and `image_style` are stored for AI generation

## Usage Examples

### Insert a Question Set

```sql
INSERT INTO question_sets (
  name_en, name_de, name_it,
  description_en, description_de, description_it,
  difficulty, question_count, is_published
) VALUES (
  'Jesus'' Life: The Greatest Story',
  'Das Leben Jesu: Die größte Geschichte',
  'La Vita di Gesù: La Storia più Grande',
  'Essential moments from the life of Jesus Christ for beginners',
  'Wesentliche Momente aus dem Leben Jesu Christi für Anfänger',
  'Momenti essenziali della vita di Gesù Cristo per principianti',
  'beginner',
  20,
  true
);
```

### Insert a Question

```sql
INSERT INTO questions (
  question_set_id, order_index,
  question_en, question_de, question_it,
  option_a_en, option_a_de, option_a_it,
  option_b_en, option_b_de, option_b_it,
  option_c_en, option_c_de, option_c_it,
  option_d_en, option_d_de, option_d_it,
  correct_answer,
  right_answer_en, right_answer_de, right_answer_it,
  verse_reference_en, verse_reference_de, verse_reference_it,
  verse_content_en, verse_content_de, verse_content_it,
  image_prompt, image_style,
  image_location, video_location
) VALUES (
  '...', 1,
  'In which town was Jesus born?',
  'In welcher Stadt wurde Jesus geboren?',
  'In quale città nacque Gesù?',
  'Nazareth', 'Nazareth', 'Nazaret',
  'Bethlehem', 'Bethlehem', 'Betlemme',
  'Jerusalem', 'Jerusalem', 'Gerusalemme',
  'Capernaum', 'Kapernaum', 'Cafarnao',
  'B',
  'Bethlehem', 'Bethlehem', 'Betlemme',
  'Luke 2:4,7', 'Lukas 2:4,7', 'Luca 2:4,7',
  'Joseph also went up...', 'Da machte sich auf...', 'Dalla Galilea...',
  'Biblical times, ancient town...', 'Photorealistic, historically accurate...',
  NULL, NULL
);
```

### Query Questions by Language

```typescript
// English
const questions = await supabase
  .from('questions')
  .select(`
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
  `)
  .eq('question_set_id', setId)
  .order('order_index');

// German
const questions = await supabase
  .from('questions')
  .select(`
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
  `)
  .eq('question_set_id', setId)
  .order('order_index');
```

## Import Script

Use the provided import script to load JSON data:

```bash
pnpm import:questions path/to/questions.json
```

The script automatically:
- Creates question sets with multilingual names/descriptions
- Creates questions with all multilingual fields
- Determines the correct answer letter (A/B/C/D) from the right_answer text
- Sets image_location and video_location to null initially

