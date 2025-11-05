# Database Migrations

This folder contains Supabase database migrations for the Exam Prepper application.

## Migrations

### 20250103_initial_schema.sql
Initial database schema with:
- `question_sets` table
- `questions` table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for updated_at timestamps

### 20250104_add_check_constraints.sql
Adds CHECK constraints to ensure data integrity and fixes the "string did not match expected pattern" error.

**Important:** This migration specifically **removes** any restrictive constraint on the `subject` field, as the application is designed to allow flexible subject input (users can enter any subject name, not just predefined ones like 'english', 'math', etc.).

The migration:
1. Drops any existing restrictive constraints (including subject constraints)
2. Adds proper CHECK constraints for:
   - `code`: Must match `^[A-Z0-9]{6}$` pattern
   - `difficulty`: Must be one of ('helppo', 'normaali', 'vaikea', 'mahdoton')
   - `question_type`: Must be one of ('multiple_choice', 'fill_blank', 'true_false', 'matching', 'short_answer')
   - `grade`: Must be NULL or between 1-13
   - `question_count`: Must be positive

3. Explicitly does NOT add a constraint on `subject` field - allows any string value

## Running Migrations

If you're using Supabase CLI:
```bash
supabase db push
```

If you're using the Supabase Dashboard:
1. Go to SQL Editor
2. Copy the migration file content
3. Execute the SQL

## Troubleshooting

### "The string did not match the expected pattern" Error

This error occurs when:
1. There's a CHECK constraint on the `subject` field limiting it to specific values
2. Users try to create question sets with free-form subject names

**Solution:** Run the `20250104_add_check_constraints.sql` migration to remove the restrictive subject constraint.

### Constraint Already Exists Error

The `20250104_add_check_constraints.sql` migration is designed to be idempotent - it first drops existing constraints before recreating them, so it's safe to run multiple times.
