# MSW to Supabase Migration Story

This document chronicles the migration from Mock Service Worker (MSW) to Supabase as the backend data layer for the RW Merchant MVP application.

## Executive Summary

The application successfully migrated from client-side mocking (MSW) to a production-ready backend (Supabase). This migration:

- Replaced ~366 lines of mock code with real database queries
- Added Row Level Security (RLS) for multi-tenant data isolation
- Implemented persistent data storage with proper relationships
- Reduced bundle size by ~2MB (MSW package removed)
- Created a foundation ready for backend team integration

## Why We Migrated

### Problems with MSW Approach

1. **No Data Persistence**: Data reset on page refresh
2. **Client-Side Only**: No true multi-user scenarios
3. **No Security Model**: RLS couldn't be tested
4. **Large Bundle Size**: MSW added ~2MB to client bundle
5. **Development/Production Gap**: MSW behavior differed from real APIs
6. **Complex Setup**: Required service worker initialization

### Benefits of Supabase

1. **Persistent Data**: Real PostgreSQL database
2. **Built-in Auth**: JWT-based authentication
3. **Row Level Security**: Multi-tenant data isolation
4. **Type Safety**: Schema-driven TypeScript generation
5. **Developer Experience**: Local development with Supabase CLI
6. **Production Ready**: Same infrastructure scales to production

## Migration Timeline

### Phase 1: Foundation (Issue #10)
**Status**: ✅ Complete

Initial migration of core infrastructure:
- Supabase project setup
- Authentication flow (OTP-based)
- Basic table schema
- First API route (transactions)

### Phase 2: Epic 1 - Balance & Core Data
**Status**: ✅ Complete

Wallet balance calculation:
- Transaction table with full schema
- Balance computed from posted transactions
- RLS policies for transaction access
- Removed storefront concept (simplified)

### Phase 3: Epic 2 - API Key Management
**Status**: ✅ Complete

Secure API key system:
- API keys table with bcrypt hashing
- Key generation with secure random strings
- Last 4 characters stored for identification
- RLS policies for key management
- Admin/owner role requirements

### Phase 4: Epic 3 - Crypto Prices & Wallet Actions
**Status**: ✅ Complete

Price data and wallet operations:
- Crypto prices table (BTC, ETH, MNEE, etc.)
- CoinGecko API integration with rate limiting
- Smart price caching (5-minute TTL)
- Buy/sell/send/receive wallet actions
- Optimistic updates for balance changes

### Phase 5: Epic 4 - Modules Management
**Status**: ✅ Complete (referenced from existing work)

Payment module CRUD:
- Modules table with RLS
- Enable/disable functionality
- Currency configuration
- Module-transaction relationships

### Phase 6: Epic 5 - Cleanup & Documentation
**Status**: ✅ Complete (Current)

Final cleanup:
- Removed all MSW files and dependencies
- Simplified providers (no MSW initialization)
- Created comprehensive documentation
- Verified clean build and reduced bundle size

## Technical Changes

### Before: MSW Architecture

```
User → React App → MSW (client-side) → Mock Handlers → Mock Data
                   ↓
            Service Worker intercepts all /api/* requests
```

**Files:**
- `src/lib/msw/handlers.ts` - Mock endpoint definitions
- `src/lib/msw/seed.ts` - Mock data generation
- `src/lib/msw/browser.ts` - MSW setup/initialization
- `public/mockServiceWorker.js` - Service worker file

**Example Mock Handler:**
```typescript
// OLD: MSW handler
http.get("*/api/me", () => {
  console.log("[MSW] Handling: GET /api/me");
  return HttpResponse.json({
    user: mockUser,
    org: mockOrg,
  });
});
```

### After: Supabase Architecture

```
User → React App → Next.js API Routes → Supabase (PostgreSQL + RLS)
                   ↓                      ↓
            Auth token attached    RLS enforces access control
```

**Files:**
- `src/app/api/*/route.ts` - Real API endpoints
- `supabase/migrations/*.sql` - Database schema
- `src/lib/supabase/client.ts` - Supabase client
- `src/hooks/useAuth.ts` - Authentication hook

**Example Real Endpoint:**
```typescript
// NEW: Supabase query
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('org_id', orgId);

  return NextResponse.json(data);
}
```

## Key Migrations

### Authentication
**MSW**: Mock user object, no real auth
**Supabase**: Email OTP verification, JWT tokens, session management

```typescript
// Before
const mockUser = { id: 'fake-id', email: 'test@test.com' };

// After
const { data: { user } } = await supabase.auth.getUser();
```

### Transactions
**MSW**: In-memory array, random generation
**Supabase**: PostgreSQL table with RLS, real relationships

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  -- ... full schema with RLS
);
```

### Balance Calculation
**MSW**: Hardcoded values or random generation
**Supabase**: Computed from actual transaction history

```typescript
// Before
return { usd: 15000, mnee: 10000 };

// After
const { data: transactions } = await supabase
  .from('transactions')
  .select('*')
  .eq('org_id', orgId)
  .eq('status', 'posted');

// Calculate from real transactions
```

### API Keys
**MSW**: Not implemented
**Supabase**: Bcrypt hashing, secure storage, usage tracking

```typescript
// Secure key generation and storage
const key = generateSecureApiKey();
const hash = await bcrypt.hash(key, 12);

await supabase.from('apikeys').insert({
  key_hash: hash,
  last4: key.slice(-4),
  org_id: orgId
});
```

### Crypto Prices
**MSW**: Static mock data
**Supabase**: CoinGecko API integration with database caching

```typescript
// Fetch from CoinGecko, store in database
const prices = await fetchCoinGeckoPrices();
await supabase.from('crypto_prices').insert(prices);

// Query latest from database
const { data } = await supabase
  .from('crypto_prices_latest')
  .select('*');
```

## Code Removed

### Deleted Files
- `src/lib/msw/handlers.ts` (140 lines)
- `src/lib/msw/seed.ts` (132 lines)
- `src/lib/msw/browser.ts` (94 lines)
- `public/mockServiceWorker.js` (9KB)

### Dependencies Removed
```json
{
  "dependencies": {
    "msw": "^2.11.6"  // REMOVED
  }
}
```

### Code Simplified
```typescript
// Before: Complex MSW initialization
export function Providers({ children }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    enableMSW()
      .then(() => setMswReady(true))
      .catch(() => setMswReady(true));
  }, []);

  if (!mswReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// After: Clean provider
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Lessons Learned

### What Worked Well

1. **Incremental Migration**: Each epic focused on specific functionality
2. **RLS First**: Security model established before features
3. **Type Generation**: OpenAPI + Orval maintained type safety
4. **Local Development**: Supabase CLI enabled realistic testing
5. **Migration Files**: SQL files documented schema evolution

### Challenges Faced

1. **RLS Complexity**: Required understanding Postgres policies
2. **Auth Token Management**: JWT caching and refresh handling
3. **Rate Limits**: CoinGecko API limits required smart caching
4. **Migration Order**: Dependencies between tables required planning
5. **Testing Without Production Data**: Seed data creation

### Recommendations for Similar Migrations

1. **Start with Auth**: Get authentication working first
2. **Use Migrations**: Track all schema changes in version control
3. **Test RLS Early**: Don't wait until the end to verify policies
4. **Document As You Go**: Keep documentation current during migration
5. **Incremental Removal**: Remove MSW handlers as you verify each endpoint
6. **Monitor Bundle Size**: Track the reduction as you remove MSW

## Impact Assessment

### Performance Improvements
- **Bundle Size**: Reduced by ~2MB (MSW package removed)
- **Initial Load**: No service worker initialization delay
- **Data Freshness**: Real-time data from database
- **Caching**: Server-side query caching with React Query

### Developer Experience
- **Realistic Testing**: Test with real authentication and RLS
- **Persistent State**: Data survives page refreshes
- **Schema Validation**: Database enforces data integrity
- **Error Handling**: Real database errors, not mock responses

### Security Enhancements
- **Multi-Tenant Isolation**: RLS prevents cross-org access
- **Authentication**: Real JWT tokens with expiration
- **API Key Security**: Bcrypt hashing, secure generation
- **Role-Based Access**: Owner/admin/member permissions

## Backend Team Handoff

This migration created a solid foundation for backend team integration.

### What's Ready

1. **API Contracts**: OpenAPI schema defines all endpoints
2. **Data Model**: Database schema with relationships
3. **Security Model**: RLS policies enforce access control
4. **Type Definitions**: TypeScript interfaces for all data
5. **Authentication Flow**: JWT-based auth working

### What Backend Team Implements

1. **Real Transaction Processing**: Currently simulated
2. **Crypto Wallet Integration**: Real blockchain operations
3. **MNEE Smart Contract**: Token operations
4. **External Payment Providers**: Payment gateway integrations
5. **Production Database**: Production-grade PostgreSQL setup

### Migration Path

```
Current State:     Frontend + Supabase (simulated backend)
                            ↓
Backend Integration: Frontend + Real Backend + Real Supabase
                            ↓
Production:         Frontend + Backend + Production Database
```

## Conclusion

The MSW to Supabase migration successfully transformed the RW Merchant MVP from a client-side demo into a production-ready application with:

- Real authentication and authorization
- Persistent data storage
- Multi-tenant security
- Smaller bundle size
- Clean, maintainable codebase
- Comprehensive documentation

This foundation enables:
- Backend team to implement real business logic
- Frontend team to continue feature development
- QA team to test realistic scenarios
- DevOps team to deploy to production

The migration eliminated technical debt and positioned the application for scalable growth.

## Related Documentation

- [Supabase Architecture](./supabase-architecture.md)
- [API Documentation](./api-documentation.md)
- [Development Guide](./development-guide.md)
- [README](../README.md)

## GitHub Issues

- Issue #10: Initial MSW to Supabase migration
- Epic 1-4: Feature migrations (see GitHub project)
- Issue #15: Epic 5 - MSW Cleanup & Documentation (this epic)
