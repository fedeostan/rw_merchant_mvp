import { http, HttpResponse } from "msw";
import {
  mockUser,
  mockOrg,
  mockStorefront,
  mockTransactions,
  mockApiKeys,
} from "./seed";
import type {
  MoneyBalance,
  TransactionsResponse,
  ApiKeysResponse,
} from "@/lib/schemas";

// In-memory state for mutations
let apiKeys = [...mockApiKeys];

export const handlers = [
  // Me endpoint
  http.get("*/api/me", () => {
    console.log("[MSW] Handling: GET /api/me");
    return HttpResponse.json({
      user: mockUser,
      org: mockOrg,
    });
  }),

  // Storefronts - support any org ID
  http.get("*/api/orgs/:orgId/storefronts", ({ params }) => {
    console.log(`[MSW] Handling: GET /api/orgs/${params.orgId}/storefronts`);
    return HttpResponse.json([mockStorefront]);
  }),

  // Balance - support any org ID
  http.get("*/api/orgs/:orgId/storefronts/:sfId/balance", ({ params }) => {
    console.log(
      `[MSW] Handling: GET /api/orgs/${params.orgId}/storefronts/${params.sfId}/balance`
    );
    const balance: MoneyBalance = {
      storefrontId: "sf_1",
      currency: "MNEE",
      available: 24567.0,
      pending: 0.0,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(balance);
  }),

  // MNEE Price
  http.get("*/api/mnee/price", () => {
    console.log("[MSW] Handling: GET /api/mnee/price");
    return HttpResponse.json({
      price: 1.1,
      currency: "USD",
      change24h: 2.5,
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Wallet Actions
  http.post("*/api/wallet/buy", async ({ request }) => {
    const body = (await request.json()) as { amount: number };
    return HttpResponse.json({
      success: true,
      transactionId: `tx_buy_${Date.now()}`,
      amount: body.amount,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post("*/api/wallet/sell", async ({ request }) => {
    const body = (await request.json()) as { amount: number };
    return HttpResponse.json({
      success: true,
      transactionId: `tx_sell_${Date.now()}`,
      amount: body.amount,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post("*/api/wallet/send", async ({ request }) => {
    const body = (await request.json()) as {
      amount: number;
      recipient: string;
    };
    return HttpResponse.json({
      success: true,
      transactionId: `tx_send_${Date.now()}`,
      amount: body.amount,
      recipient: body.recipient,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post("*/api/wallet/receive", async () => {
    return HttpResponse.json({
      success: true,
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      qrCode:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    });
  }),

  // Transactions - support any org ID
  http.get("*/api/orgs/:orgId/transactions", ({ params, request }) => {
    console.log(`[MSW] Handling: GET /api/orgs/${params.orgId}/transactions`);
    const url = new URL(request.url);
    const storefrontId = url.searchParams.get("storefrontId");
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const cursor = url.searchParams.get("cursor");

    let filtered = [...mockTransactions];

    if (storefrontId) {
      filtered = filtered.filter((t) => t.storefrontId === storefrontId);
    }
    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    const pageSize = 20;
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    const response: TransactionsResponse = {
      items,
      nextCursor: hasMore ? endIndex.toString() : undefined,
    };

    return HttpResponse.json(response);
  }),

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

  // API Keys - support any org ID
  http.get("*/api/orgs/:orgId/apikeys", ({ params }) => {
    console.log(`[MSW] Handling: GET /api/orgs/${params.orgId}/apikeys`);
    const response: ApiKeysResponse = {
      items: apiKeys,
    };
    return HttpResponse.json(response);
  }),

  http.post("*/api/orgs/:orgId/apikeys", ({ params }) => {
    console.log(`[MSW] Handling: POST /api/orgs/${params.orgId}/apikeys`);
    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      last4: `${Math.floor(Math.random() * 10000)}`.padStart(4, "0"),
      createdAt: new Date().toISOString(),
      active: true,
    };
    apiKeys.push(newKey);
    return HttpResponse.json({ id: newKey.id });
  }),
];
