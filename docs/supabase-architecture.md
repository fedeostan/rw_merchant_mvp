# Supabase Architecture

This document describes the database schema, Row Level Security (RLS) policies, and data relationships in the RW Merchant MVP application.

## Overview

The application uses Supabase as its backend, providing:
- PostgreSQL database with RLS for multi-tenant security
- Built-in authentication (JWT-based)
- Real-time subscriptions (available but not currently used)
- Edge functions (optional for future use)

## Database Schema

### Core Tables

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│     users       │────▶│  user_organizations  │◀────│organizations│
│   (auth.users)  │     │    (membership)      │     │  (tenants)  │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                                   │                        │
                                   │                        │
                                   ▼                        ▼
                        ┌──────────────────┐      ┌─────────────┐
                        │    transactions  │      │   modules   │
                        │   (tx history)   │      │ (payments)  │
                        └──────────────────┘      └─────────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │   apikeys   │
                                                  │  (auth)     │
                                                  └─────────────┘

                        ┌──────────────────┐
                        │  crypto_prices   │
                        │  (price data)    │
                        └──────────────────┘
```

### Table Descriptions

#### `organizations`
Core tenant table representing merchant businesses.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization display name |
| slug | TEXT | URL-friendly identifier |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `user_organizations`
Many-to-many relationship between users and organizations with role-based access.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Reference to auth.users |
| org_id | UUID | Reference to organizations |
| role | TEXT | User role: 'owner', 'admin', 'member' |
| created_at | TIMESTAMPTZ | Membership timestamp |

**Roles:**
- `owner`: Full access, can delete org and manage all settings
- `admin`: Can manage transactions, API keys, and modules
- `member`: Read-only access to org data

#### `modules`
Payment integration modules for each organization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| org_id | UUID | Parent organization |
| name | TEXT | Module display name |
| slug | TEXT | URL identifier |
| enabled | BOOLEAN | Active status |
| currency | TEXT | Payment currency (USD, EUR, etc.) |
| description | TEXT | Module description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `transactions`
Transaction records for all payment activity.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| org_id | UUID | Parent organization |
| storefront_id | UUID | Associated storefront |
| module_id | UUID | Payment module (optional) |
| type | TEXT | 'in' or 'out' |
| method | TEXT | 'stablecoin', 'payout', 'adjustment' |
| display_type | TEXT | 'receive', 'send', 'buy', 'sell', 'swap' |
| amount | NUMERIC | Transaction amount |
| currency | TEXT | Currency code |
| status | TEXT | 'pending', 'posted', 'failed' |
| customer_email | TEXT | Customer identifier |
| send_hash | TEXT | Blockchain send hash |
| rock_wallet_id | TEXT | External wallet reference |
| tx_hash_in | TEXT | Incoming transaction hash |
| tx_hash_swap | TEXT | Swap transaction hash |
| fee_usd | NUMERIC | Transaction fee in USD |
| customer_address | TEXT | Customer wallet address |
| created_at | TIMESTAMPTZ | Transaction timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `apikeys`
API key management with secure hashing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| org_id | UUID | Parent organization |
| key_hash | TEXT | Bcrypt hash of full key |
| last4 | TEXT | Last 4 chars for display |
| name | TEXT | Optional key label |
| created_at | TIMESTAMPTZ | Creation timestamp |
| last_used_at | TIMESTAMPTZ | Last usage timestamp |
| active | BOOLEAN | Key active status |

**Security Note:** The `key_hash` column stores a bcrypt hash of the full API key. The actual key is only shown once at creation time and never stored in plaintext.

#### `crypto_prices`
Cryptocurrency price data storage.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| symbol | TEXT | Crypto symbol (BTC, ETH, MNEE) |
| name | TEXT | Full name (Bitcoin, Ethereum) |
| coin_id | TEXT | CoinGecko ID |
| price_usd | NUMERIC | Current USD price |
| market_cap_usd | NUMERIC | Market capitalization |
| volume_24h_usd | NUMERIC | 24-hour volume |
| circulating_supply | NUMERIC | Circulating supply |
| price_change_24h_usd | NUMERIC | 24-hour price change |
| price_change_percentage_24h | NUMERIC | 24-hour % change |
| market_cap_rank | INTEGER | CoinGecko ranking |
| is_stablecoin | BOOLEAN | Stablecoin flag |
| is_active | BOOLEAN | Active status |
| data_timestamp | TIMESTAMPTZ | Price data timestamp |

**View:** `crypto_prices_latest` provides the most recent price for each active cryptocurrency.

## Row Level Security (RLS) Policies

RLS ensures data isolation between organizations and role-based access control.

### Common Pattern

Most policies follow this pattern:
```sql
-- Check user belongs to the organization
EXISTS (
  SELECT 1 FROM public.user_organizations
  WHERE user_organizations.org_id = [table].org_id
    AND user_organizations.user_id = auth.uid()
    AND user_organizations.role IN ('required', 'roles')
)
```

### Policy Summary

| Table | Operation | Roles Required |
|-------|-----------|----------------|
| **organizations** | SELECT | any member |
| **user_organizations** | SELECT | any member |
| **modules** | SELECT | any member |
| **modules** | INSERT/UPDATE | admin, owner |
| **modules** | DELETE | owner |
| **transactions** | SELECT | any member |
| **transactions** | INSERT/UPDATE | admin, owner |
| **transactions** | DELETE | owner |
| **apikeys** | SELECT | any member |
| **apikeys** | INSERT/UPDATE/DELETE | admin, owner |
| **crypto_prices** | SELECT | anyone (public) |
| **crypto_prices** | INSERT/UPDATE/DELETE | service_role only |

### Example: Transactions RLS

```sql
-- Users can view transactions from their organizations
CREATE POLICY "Users can view transactions from their organizations"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
    )
  );

-- Only admins and owners can insert
CREATE POLICY "Admins can insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );
```

## Authentication Flow

1. **User Signs Up/In**: Supabase Auth handles email/OTP verification
2. **Session Created**: JWT token issued with user claims
3. **API Request**: Client includes JWT in Authorization header
4. **RLS Enforced**: Database checks `auth.uid()` against policies
5. **Data Returned**: Only authorized data visible to user

```typescript
// Client-side auth check
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// API request with auth
fetch('/api/orgs/{orgId}/transactions', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Balance Calculation

Wallet balance is computed from transactions:

```typescript
async function calculateBalance(orgId: string): Promise<Balance> {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'posted');

  let balance = { usd: 0, mnee: 0, btc: 0, eth: 0 };

  for (const tx of transactions) {
    const amount = tx.type === 'in' ? tx.amount : -tx.amount;
    balance[tx.currency.toLowerCase()] += amount;
  }

  return balance;
}
```

## Crypto Price System

### Price Sources

1. **CoinGecko API**: BTC, ETH, and other major cryptocurrencies
2. **Database Storage**: MNEE (stablecoin, pegged at $1.00)

### Update Strategy

```typescript
// Fetch from CoinGecko (rate limited: 30/min)
const response = await fetch('https://api.coingecko.com/api/v3/coins/markets', {
  headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
});

// Store in database
await supabase.from('crypto_prices').insert(priceData);

// Query latest prices
const { data } = await supabase
  .from('crypto_prices_latest')
  .select('*');
```

### Smart Refresh

The frontend uses intelligent caching:
- Cache prices for 5 minutes (configurable)
- Use stale data while fetching (stale-while-revalidate)
- Background refresh on price-sensitive pages
- Manual refresh button for user control

## Data Relationships

### Organization Access

All org-scoped data requires membership verification:

```sql
-- User must be member of org
user_id IN (
  SELECT user_id FROM user_organizations
  WHERE org_id = :requested_org_id
)
```

### Module-Transaction Link

Transactions can optionally reference modules:
```sql
transactions.module_id -> modules.id
```

This enables:
- Filtering transactions by payment module
- Module performance analytics
- Revenue attribution

## Indexes

Performance optimization through strategic indexing:

```sql
-- Transactions
CREATE INDEX idx_transactions_org_created
  ON transactions(org_id, created_at DESC);
CREATE INDEX idx_transactions_status
  ON transactions(status);

-- API Keys
CREATE INDEX idx_apikeys_org_id
  ON apikeys(org_id);
CREATE INDEX idx_apikeys_active
  ON apikeys(active) WHERE active = true;

-- Crypto Prices
CREATE INDEX idx_crypto_prices_symbol_timestamp
  ON crypto_prices(symbol, data_timestamp DESC);
```

## Triggers

Auto-updating timestamps:

```sql
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Security Considerations

1. **Never expose key_hash**: API keys are hashed with bcrypt
2. **Validate org membership**: Always check user-org relationship
3. **Use service_role sparingly**: Only for admin operations
4. **Rate limit external APIs**: CoinGecko has strict limits
5. **Sanitize inputs**: All user inputs validated before DB queries

## Migration Strategy

Migrations are stored in `supabase/migrations/` and applied sequentially:

```bash
# View migrations
supabase migration list

# Apply migrations
supabase db push

# Create new migration
supabase migration new your_migration_name
```

## Future Considerations

1. **Real-time Subscriptions**: Enable live transaction updates
2. **Audit Logging**: Track all data modifications
3. **Soft Deletes**: Archive instead of hard delete
4. **Data Retention**: Implement cleanup policies
5. **Backup Strategy**: Configure automated backups
