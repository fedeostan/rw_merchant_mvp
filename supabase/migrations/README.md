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

### Core Schema Migrations

- `20250111_fix_user_organizations_rls_allow_owner.sql` - Fix RLS policies for user organizations (allow owner access)
- `20250111_fix_organizations_rls_with_trigger.sql` - Fix organizations RLS with proper trigger support
- `20250111_fix_rls_policies_use_authenticated_role.sql` - Update RLS policies to use authenticated role
- `20250111_fix_user_organizations_rls_use_authenticated_role.sql` - User organizations RLS authenticated role fix

### Feature Tables

- `20250112_create_transactions_table.sql` - Transactions table with full schema and RLS policies
- `20250112_fix_trigger_security_context.sql` - Fix trigger security context for transactions
- `20250114_create_apikeys_table.sql` - API keys table with bcrypt hashing and RLS
- `20250114_seed_test_apikeys.sql` - Seed test API keys for development
- `20250115_create_crypto_prices_table.sql` - Crypto prices table with CoinGecko integration
- `20250115_seed_crypto_prices.sql` - Seed initial crypto price data (BTC, ETH, MNEE, etc.)

### Migration Order

Migrations are applied in timestamp order (YYYYMMDD format). Dependencies:

1. RLS policy fixes (foundation)
2. Transactions table (core feature)
3. API keys table (security feature)
4. Crypto prices table (price data)

## Notes

- Migrations are numbered by date (YYYYMMDD) to ensure they run in order
- Each migration should be idempotent (safe to run multiple times)
- Always test migrations in a development environment first
- RLS policies are enabled by default for security
