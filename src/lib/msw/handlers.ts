import { http, HttpResponse } from "msw";
import {
  mockUser,
  mockOrg,
} from "./seed";

export const handlers = [
  // Me endpoint
  http.get("*/api/me", () => {
    console.log("[MSW] Handling: GET /api/me");
    return HttpResponse.json({
      user: mockUser,
      org: mockOrg,
    });
  }),

  // ============================================================================
  // WALLET ENDPOINTS - NOT MOCKED (Bypass MSW)
  // ============================================================================
  // Wallet action endpoints are NOT intercepted by MSW. They hit the real Next.js
  // API routes which create real transactions in Supabase database:
  //
  // API Routes:
  //   - src/app/api/wallet/buy/route.ts (POST)
  //   - src/app/api/wallet/sell/route.ts (POST)
  //   - src/app/api/wallet/send/route.ts (POST)
  //   - src/app/api/wallet/receive/route.ts (POST)
  //
  // These routes:
  //   - Use Supabase server client for database operations
  //   - Include authentication and authorization checks
  //   - Create real transactions in the 'transactions' table
  //   - Validate sufficient balance for sell/send operations
  //   - Assign transactions to default "Wallet" module
  //   - Generate mock blockchain hashes for transaction tracking
  //
  // Requests to /api/wallet/* will pass through MSW and hit the real API,
  // ensuring wallet actions create real transactions that persist and update balances.
  // ============================================================================

  // ============================================================================
  // TRANSACTIONS ENDPOINT - NOT MOCKED (Bypass MSW)
  // ============================================================================
  // Transaction endpoints are NOT intercepted by MSW. They hit the real Next.js
  // API route which fetches data from Supabase database:
  //
  // API Route:
  //   - src/app/api/orgs/[orgId]/transactions/route.ts (GET)
  //
  // This route:
  //   - Uses Supabase server client for database operations
  //   - Includes authentication and authorization checks
  //   - Enforces RLS policies for data security
  //   - Supports filtering by moduleId, type, and status
  //   - Implements cursor-based pagination
  //   - Fetches real persisted transactions from the 'transactions' table
  //
  // Requests to /api/orgs/:orgId/transactions will pass through MSW and hit the
  // real API, ensuring data is fetched from Supabase and persists across page
  // refreshes.
  // ============================================================================

  // --- LEGACY TRANSACTION HANDLER (Commented out - using real API now) ---
  // http.get("*/api/orgs/:orgId/transactions", ({ params, request }) => {
  //   console.log(`[MSW] Handling: GET /api/orgs/${params.orgId}/transactions`);
  //   const url = new URL(request.url);
  //   const moduleId = url.searchParams.get("moduleId");
  //   const type = url.searchParams.get("type");
  //   const status = url.searchParams.get("status");
  //   const cursor = url.searchParams.get("cursor");
  //
  //   let filtered = [...mockTransactions];
  //
  //   if (moduleId) {
  //     filtered = filtered.filter((t) => t.moduleId === moduleId);
  //   }
  //   if (type) {
  //     filtered = filtered.filter((t) => t.type === type);
  //   }
  //   if (status) {
  //     filtered = filtered.filter((t) => t.status === status);
  //   }
  //
  //   const pageSize = 20;
  //   const startIndex = cursor ? parseInt(cursor, 10) : 0;
  //   const endIndex = startIndex + pageSize;
  //   const items = filtered.slice(startIndex, endIndex);
  //   const hasMore = endIndex < filtered.length;
  //
  //   const response: TransactionsResponse = {
  //     items,
  //     nextCursor: hasMore ? endIndex.toString() : undefined,
  //   };
  //
  //   return HttpResponse.json(response);
  // }),

  // ============================================================================
  // MODULES ENDPOINTS - NOT MOCKED (Bypass MSW)
  // ============================================================================
  // Module endpoints are NOT intercepted by MSW. They hit the real Next.js API
  // routes which persist data to Supabase database:
  //
  // API Routes:
  //   - src/app/api/orgs/[orgId]/modules/route.ts (GET, POST)
  //   - src/app/api/orgs/[orgId]/modules/[moduleId]/route.ts (GET, PATCH, DELETE)
  //
  // These routes:
  //   - Use Supabase server client for database operations
  //   - Include authentication and authorization checks
  //   - Enforce RLS policies for data security
  //   - Generate code snippets via generateCodeSnippet()
  //   - Persist all changes to the 'modules' table
  //
  // Requests to /api/orgs/:orgId/modules/* will pass through MSW and hit the
  // real API, ensuring data persists across page refreshes.
  // ============================================================================

  // ============================================================================
  // API KEYS ENDPOINTS - NOT MOCKED (Bypass MSW)
  // ============================================================================
  // API Key endpoints are NOT intercepted by MSW. They hit the real Next.js API
  // routes which persist data to Supabase database:
  //
  // API Routes:
  //   - src/app/api/orgs/[orgId]/apikeys/route.ts (GET, POST)
  //   - src/app/api/orgs/[orgId]/apikeys/[keyId]/route.ts (DELETE)
  //
  // These routes:
  //   - Use Supabase server client for database operations
  //   - Include authentication and authorization checks
  //   - Enforce RLS policies for data security
  //   - Hash API keys with bcrypt before storing (never store plaintext)
  //   - Return full key ONLY ONCE during creation
  //   - Persist all changes to the 'apikeys' table
  //
  // Requests to /api/orgs/:orgId/apikeys/* will pass through MSW and hit the
  // real API, ensuring secure key management and persistence across sessions.
  // ============================================================================
];
