# API Documentation

Complete reference for the RW Merchant MVP REST API endpoints.

## Base URL

```
http://localhost:3000/api  (development)
https://your-domain.com/api  (production)
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <supabase_jwt_token>
```

### Getting a Token

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Optional detailed information"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Organization Endpoints

### Search Organizations

Search for organizations by name.

```http
GET /api/organizations/search?q={query}
```

**Query Parameters:**
- `q` (required): Search query string

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp"
  }
]
```

---

## Balance Endpoints

### Get Wallet Balance

Retrieve the current wallet balance for an organization.

```http
GET /api/orgs/{orgId}/balance
```

**Path Parameters:**
- `orgId` (UUID): Organization ID

**Response:**
```json
{
  "usd": 15000.00,
  "mnee": 10000.00,
  "btc": 0.5,
  "eth": 2.0,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Calculation:** Balance is computed from all `posted` transactions for the organization.

---

## Transaction Endpoints

### List Transactions

Get all transactions for an organization with optional filtering.

```http
GET /api/orgs/{orgId}/transactions
```

**Path Parameters:**
- `orgId` (UUID): Organization ID

**Query Parameters (optional):**
- `status`: Filter by status (pending, posted, failed)
- `type`: Filter by type (in, out)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "storefront_id": "uuid",
    "module_id": "uuid",
    "type": "in",
    "method": "stablecoin",
    "display_type": "receive",
    "amount": 100.00,
    "currency": "USD",
    "status": "posted",
    "customer_email": "customer@example.com",
    "send_hash": "0x...",
    "tx_hash_in": "0x...",
    "fee_usd": 0.50,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

---

## Module Endpoints

### List Modules

Get all payment modules for an organization.

```http
GET /api/orgs/{orgId}/modules
```

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "name": "Web Checkout",
    "slug": "web-checkout",
    "enabled": true,
    "currency": "USD",
    "description": "Online payment processing",
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

### Create Module

Create a new payment module.

```http
POST /api/orgs/{orgId}/modules
```

**Request Body:**
```json
{
  "name": "Mobile Payments",
  "slug": "mobile-payments",
  "currency": "USD",
  "description": "Mobile app payment integration"
}
```

**Response:** Returns the created module object.

### Get Module

Get a specific module by ID.

```http
GET /api/orgs/{orgId}/modules/{moduleId}
```

**Response:** Returns the module object.

### Update Module

Update an existing module.

```http
PATCH /api/orgs/{orgId}/modules/{moduleId}
```

**Request Body:** (partial update)
```json
{
  "name": "Updated Name",
  "enabled": false
}
```

**Response:** Returns the updated module object.

### Delete Module

Delete a module (owner only).

```http
DELETE /api/orgs/{orgId}/modules/{moduleId}
```

**Response:** 204 No Content on success.

---

## API Key Endpoints

### List API Keys

Get all API keys for an organization (shows last 4 digits only).

```http
GET /api/orgs/{orgId}/apikeys
```

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "last4": "x7k9",
    "name": "Production API",
    "active": true,
    "created_at": "2025-01-10T08:00:00Z",
    "last_used_at": "2025-01-15T10:30:00Z"
  }
]
```

**Note:** The full API key is never returned after creation. Only the last 4 characters are stored for identification.

### Create API Key

Generate a new API key.

```http
POST /api/orgs/{orgId}/apikeys
```

**Request Body:**
```json
{
  "name": "Development Key"
}
```

**Response:**
```json
{
  "id": "uuid",
  "key": "rw_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "last4": "s9t0",
  "name": "Development Key",
  "message": "Store this key securely. It will not be shown again."
}
```

**Important:** The full `key` is only returned once at creation time. Store it securely!

### Delete API Key

Revoke an API key.

```http
DELETE /api/orgs/{orgId}/apikeys/{keyId}
```

**Response:** 204 No Content on success.

---

## Wallet Action Endpoints

All wallet actions create transaction records and update balances.

### Buy Crypto

Purchase cryptocurrency with USD.

```http
POST /api/wallet/buy
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "amount": 100.00,
  "currency": "BTC",
  "payment_method": "usd_balance"
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "status": "posted",
  "amount_purchased": 0.0025,
  "currency": "BTC",
  "usd_spent": 100.00,
  "fee_usd": 1.00,
  "exchange_rate": 40000.00
}
```

### Sell Crypto

Sell cryptocurrency for USD.

```http
POST /api/wallet/sell
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "amount": 0.001,
  "currency": "BTC"
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "status": "posted",
  "amount_sold": 0.001,
  "currency": "BTC",
  "usd_received": 40.00,
  "fee_usd": 0.40,
  "exchange_rate": 40000.00
}
```

### Send Crypto

Send cryptocurrency to an external address.

```http
POST /api/wallet/send
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "amount": 0.5,
  "currency": "ETH",
  "recipient_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f9EFFF"
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "status": "pending",
  "amount": 0.5,
  "currency": "ETH",
  "recipient_address": "0x742d35...",
  "tx_hash": "0xabc123...",
  "fee_usd": 2.50
}
```

### Receive Crypto

Generate a receive address for incoming payments.

```http
POST /api/wallet/receive
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "currency": "BTC",
  "expected_amount": 0.01,
  "customer_email": "customer@example.com"
}
```

**Response:**
```json
{
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "currency": "BTC",
  "expected_amount": 0.01,
  "qr_code_data": "bitcoin:bc1qxy2...",
  "expires_at": "2025-01-15T11:30:00Z"
}
```

---

## Crypto Price Endpoints

### Get Current Prices

Retrieve latest cryptocurrency prices.

```http
GET /api/crypto/prices
```

**Query Parameters (optional):**
- `symbols`: Comma-separated list (e.g., "BTC,ETH,MNEE")

**Response:**
```json
{
  "prices": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price_usd": 42000.00,
      "price_change_24h_usd": 1200.00,
      "price_change_percentage_24h": 2.94,
      "market_cap_usd": 820000000000,
      "volume_24h_usd": 25000000000,
      "is_stablecoin": false,
      "data_timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "symbol": "MNEE",
      "name": "MNEE Stablecoin",
      "price_usd": 1.00,
      "price_change_24h_usd": 0,
      "price_change_percentage_24h": 0,
      "is_stablecoin": true,
      "data_timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "cached_at": "2025-01-15T10:30:00Z",
  "cache_ttl_seconds": 300
}
```

**Caching:**
- Prices cached for 5 minutes
- MNEE price is database-stored (always $1.00)
- Other prices fetched from CoinGecko API

**Rate Limits:**
- CoinGecko: 30 requests/minute
- Database queries: No explicit limit

---

## Rate Limiting

Currently, rate limiting is handled at the infrastructure level:

- **CoinGecko API**: 30 calls/minute
- **Supabase**: Based on plan limits
- **Next.js API Routes**: No built-in rate limiting

For production, consider implementing:
- Per-user rate limiting
- API key usage tracking
- Request throttling

---

## SDK Usage (Generated by Orval)

The API client is auto-generated from OpenAPI spec:

```typescript
import {
  useGetOrgsOrgIdTransactions,
  useGetOrgsOrgIdModules,
  useGetCryptoPrices
} from '@/lib/api/generated';

// List transactions with React Query
const { data, isLoading, error } = useGetOrgsOrgIdTransactions(orgId, {
  status: 'posted',
  limit: 50
});

// Get crypto prices
const { data: prices } = useGetCryptoPrices({
  symbols: 'BTC,ETH,MNEE'
});
```

---

## Webhook Integration (Future)

Planned webhook events:
- `transaction.created`
- `transaction.updated`
- `transaction.failed`
- `module.enabled`
- `module.disabled`
- `apikey.created`
- `apikey.revoked`

---

## Testing

### Using cURL

```bash
# Get balance
curl -X GET "http://localhost:3000/api/orgs/{orgId}/balance" \
  -H "Authorization: Bearer $TOKEN"

# List transactions
curl -X GET "http://localhost:3000/api/orgs/{orgId}/transactions" \
  -H "Authorization: Bearer $TOKEN"

# Create API key
curl -X POST "http://localhost:3000/api/orgs/{orgId}/apikeys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'

# Get crypto prices
curl -X GET "http://localhost:3000/api/crypto/prices?symbols=BTC,ETH"
```

### Using Postman

Import the OpenAPI spec from `openapi/schema.yaml` for automatic collection generation.

---

## OpenAPI Specification

The complete API specification is available at:
```
/openapi/schema.yaml
```

Generate client code:
```bash
pnpm generate:api
```

This uses Orval to generate TypeScript hooks and types from the OpenAPI spec.
