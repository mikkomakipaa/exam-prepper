# Database Validation Scripts

This directory contains utility scripts for managing and validating the Supabase database.

## validate-database.ts

Comprehensive validation script that checks the integrity of all question sets and questions in the database.

### What it validates:

- **Question Sets:**
  - Checks that all question sets exist and are accessible
  - Verifies question count matches actual number of questions
  - Validates all required metadata fields

- **Questions:**
  - **Missing required fields** (question_text, question_type, explanation)
  - **Multiple Choice Questions:**
    - Missing or empty options arrays
    - Insufficient number of options (< 2)
    - Empty option strings
    - Correct answer not in options list
  - **Fill Blank Questions:**
    - Missing or invalid correct_answer
  - **True/False Questions:**
    - Missing or non-boolean correct_answer
  - **Matching Questions:**
    - Missing or empty pairs array
    - Invalid pair structures
    - Empty left/right values in pairs
  - **Short Answer Questions:**
    - Missing or invalid correct_answer

### How to run:

1. **Create `.env.local` file** (if not already present):
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials** to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the validation:**
   ```bash
   npm run validate:db
   ```

   Or directly:
   ```bash
   npx tsx scripts/validate-database.ts
   ```

   Or with inline environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key npm run validate:db
   ```

### Output:

The script provides detailed output including:
- Total number of question sets validated
- Issues found (categorized as errors or warnings)
- Specific details about each issue (question set, question text, error description)
- Summary report grouped by question set

### Exit codes:

- `0` - Validation passed (no errors, warnings are OK)
- `1` - Validation failed with errors

### Example output:

```
🔍 Starting database validation...

📊 Found 4 question sets

📝 Validating: English Grammar - Verbs (ABC123)
   Subject: English, Difficulty: normaali
   Questions: 30
❌ [ABC123] multiple_choice question has empty options array
   Question: What is the past tense of "go"?

================================================================================
📊 VALIDATION SUMMARY
================================================================================

✅ Validated 4 question sets
❌ Errors: 1
⚠️  Warnings: 0

📋 Issues by Question Set:

  ABC123 - English Grammar - Verbs
    Errors: 1
    Warnings: 0
```
