# Supabase Migrations

This folder contains SQL migration files for the database schema.

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Push migrations to your Supabase project
supabase db push

# Or apply a specific migration
supabase migration up
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL in the editor

### Option 3: Programmatically

You can also run migrations programmatically using the Supabase client with a service role key:

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
)

const migrationSQL = fs.readFileSync('./supabase/migrations/20241110_create_modules_table.sql', 'utf-8')

// Execute the migration
const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

if (error) {
  console.error('Migration failed:', error)
} else {
  console.log('Migration successful!')
}
```

## Migration Files

- `20241110_create_modules_table.sql` - Creates the modules table with RLS policies

## Notes

- Migrations are numbered by date (YYYYMMDD) to ensure they run in order
- Each migration should be idempotent (safe to run multiple times)
- Always test migrations in a development environment first
- RLS policies are enabled by default for security
