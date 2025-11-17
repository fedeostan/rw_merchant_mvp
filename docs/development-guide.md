# Development Guide

Complete guide for setting up and developing the RW Merchant MVP application.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v10.0.0 or higher
- **Git**: For version control
- **Supabase CLI**: For local database
- **VSCode** (recommended): With TypeScript and Prettier extensions

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/fedeostan/rw_merchant_mvp.git
cd rw_merchant_mvp
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Supabase (get from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key

# API Base URL
NEXT_PUBLIC_API_BASE_URL=/api

# CoinGecko API Key (optional for development)
COINGECKO_API_KEY=your_api_key
```

### 4. Start Local Supabase

```bash
# Start all Supabase services
supabase start

# This will output connection URLs and keys
# Copy the anon key to your .env.local
```

### 5. Apply Database Migrations

```bash
# Push all migrations to local database
supabase db push

# Or apply migrations manually
supabase migration up
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Code Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Public auth pages
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # Base UI components (shadcn)
│   ├── dashboard/        # Dashboard-specific components
│   └── shared/           # Shared components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useOrg.ts         # Organization context
│   └── useWalletBalance.ts # Balance management
├── lib/
│   ├── api/              # API client configuration
│   ├── supabase/         # Supabase client setup
│   ├── query/            # React Query client
│   └── utils.ts          # Utility functions
└── types/                 # TypeScript definitions
```

### Adding a New Feature

1. **Create Database Migration** (if needed)
   ```bash
   supabase migration new feature_name
   ```

2. **Update OpenAPI Schema**
   Edit `openapi/schema.yaml` with new endpoints

3. **Regenerate API Client**
   ```bash
   pnpm generate:api
   ```

4. **Create API Route**
   ```bash
   # Create route handler
   mkdir -p src/app/api/your-route
   touch src/app/api/your-route/route.ts
   ```

5. **Create React Hook** (if needed)
   ```bash
   touch src/hooks/useYourFeature.ts
   ```

6. **Create UI Components**
   ```bash
   touch src/components/your-feature/FeatureComponent.tsx
   ```

7. **Add Page Route**
   ```bash
   mkdir -p src/app/dashboard/your-feature
   touch src/app/dashboard/your-feature/page.tsx
   ```

### API Route Pattern

```typescript
// src/app/api/orgs/[orgId]/example/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify org membership (RLS will also enforce this)
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .eq('org_id', params.orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### React Hook Pattern

```typescript
// src/hooks/useExample.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from './useOrg';
import { customInstance } from '@/lib/api/fetcher';

export function useExample() {
  const { selectedOrg } = useOrg();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['example', selectedOrg?.id],
    queryFn: () => customInstance({
      url: `/orgs/${selectedOrg?.id}/example`,
      method: 'GET'
    }),
    enabled: !!selectedOrg?.id
  });

  const mutation = useMutation({
    mutationFn: (data: CreateExampleDto) => customInstance({
      url: `/orgs/${selectedOrg?.id}/example`,
      method: 'POST',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['example'] });
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    create: mutation.mutate,
    isCreating: mutation.isPending
  };
}
```

## Database Management

### Creating Migrations

```bash
# Create new migration file
supabase migration new your_migration_name

# This creates:
# supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql
```

### Migration Best Practices

```sql
-- Always include header comments
-- Migration: Create example table
-- Description: Brief description of what this does
-- Date: 2025-01-15

-- Use IF NOT EXISTS for idempotency
CREATE TABLE IF NOT EXISTS public.example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drop policies before recreating (for re-runnability)
DROP POLICY IF EXISTS "Example policy" ON public.example;

-- Create RLS policies
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Example policy"
  ON public.example
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON public.example TO authenticated;

-- Add documentation
COMMENT ON TABLE public.example IS 'Description of table purpose';
```

### Viewing Database

```bash
# Open Supabase Studio (local)
supabase status
# Navigate to Studio URL (usually http://127.0.0.1:54323)

# Or use psql directly
supabase db remote set
psql $(supabase db url)
```

### Seeding Test Data

Create seed files in migrations:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_seed_example_data.sql
INSERT INTO public.example (name, value)
VALUES
  ('Test 1', 100),
  ('Test 2', 200)
ON CONFLICT (id) DO NOTHING;
```

## Code Generation

### OpenAPI Schema

Edit `openapi/schema.yaml`:

```yaml
paths:
  /orgs/{orgId}/example:
    get:
      summary: Get examples
      parameters:
        - name: orgId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Example'

components:
  schemas:
    Example:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
```

### Generate API Client

```bash
pnpm generate:api

# This generates:
# - src/lib/api/generated/hooks.ts (React Query hooks)
# - src/lib/api/generated/types.ts (TypeScript types)
```

### Using Generated Code

```typescript
import { useGetOrgsOrgIdExample } from '@/lib/api/generated';

function ExampleComponent() {
  const { data, isLoading } = useGetOrgsOrgIdExample(orgId);

  if (isLoading) return <Loading />;

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Testing

### Manual Testing

1. Start dev server: `pnpm dev`
2. Sign up with email/OTP
3. Navigate through dashboard
4. Test CRUD operations
5. Check console for errors

### API Testing with cURL

```bash
# Get token from browser dev tools (Application > Cookies > sb-access-token)
export TOKEN="your_jwt_token"

# Test endpoint
curl -X GET "http://localhost:3000/api/orgs/{orgId}/balance" \
  -H "Authorization: Bearer $TOKEN"
```

### Type Checking

```bash
pnpm tsc --noEmit
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

## Debugging

### Server-Side Logs

API route console.log statements appear in terminal:

```typescript
// src/app/api/example/route.ts
export async function GET() {
  console.log('[API] Processing request...');
  // Terminal will show: [API] Processing request...
}
```

### Client-Side Debugging

```typescript
// Enable React Query DevTools (already configured)
// Access via browser: Icon in bottom-right corner

// Manual debugging
console.log('[Hook] Data:', data);
console.log('[Hook] Error:', error);
```

### Common Issues

**1. RLS Policy Blocking Access**
```sql
-- Check if user has org membership
SELECT * FROM user_organizations
WHERE user_id = 'your-user-id'
AND org_id = 'your-org-id';
```

**2. Auth Token Issues**
```typescript
// Check if token is valid
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

**3. Migration Not Applied**
```bash
# Check migration status
supabase migration list

# Reapply migrations
supabase db reset
```

## Deployment Checklist

Before deploying:

- [ ] All migrations applied: `supabase migration list`
- [ ] Type check passes: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Environment variables configured
- [ ] RLS policies tested
- [ ] API keys secured (not in code)
- [ ] Error handling complete

## Performance Optimization

### React Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['balance', orgId],
  queryFn: fetchBalance,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

### Database Indexes

```sql
-- Add indexes for common queries
CREATE INDEX idx_transactions_org_created
  ON transactions(org_id, created_at DESC);
```

### Component Memoization

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
});
```

## Recommended VSCode Extensions

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: CSS class suggestions
- **Supabase**: Database management
- **Thunder Client**: API testing
- **GitLens**: Git history and blame

## Getting Help

- Check existing documentation in `/docs`
- Review OpenAPI spec: `openapi/schema.yaml`
- Check Supabase logs: `supabase logs`
- Review migration history: `git log --oneline supabase/migrations/`

## Next Steps

1. Explore the codebase structure
2. Run the app locally
3. Try creating a test transaction
4. Modify an existing feature
5. Add your own feature following the patterns above
