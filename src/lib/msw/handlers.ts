import { http, HttpResponse } from "msw";
import {
  mockUser,
  mockOrg,
  mockStorefront,
  mockTransactions,
  mockModules,
  mockApiKeys,
  MOCK_ORG_ID,
} from "./seed";
import type {
  MoneyBalance,
  TransactionsResponse,
  ApiKeysResponse,
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
} from "@/lib/schemas";

// In-memory state for mutations
let modules = [...mockModules];
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

  // Storefronts
  http.get(`*/api/orgs/${MOCK_ORG_ID}/storefronts`, () => {
    console.log(`[MSW] Handling: GET /api/orgs/${MOCK_ORG_ID}/storefronts`);
    return HttpResponse.json([mockStorefront]);
  }),

  // Balance
  http.get(`*/api/orgs/${MOCK_ORG_ID}/storefronts/:sfId/balance`, () => {
    console.log(
      `[MSW] Handling: GET /api/orgs/${MOCK_ORG_ID}/storefronts/:sfId/balance`
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

  // Transactions
  http.get(`*/api/orgs/${MOCK_ORG_ID}/transactions`, ({ request }) => {
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

  // Modules
  http.get(`*/api/orgs/${MOCK_ORG_ID}/modules`, () => {
    return HttpResponse.json(modules);
  }),

  http.post(`*/api/orgs/${MOCK_ORG_ID}/modules`, async ({ request }) => {
    const body = (await request.json()) as CreateModuleRequest;
    const newModule: Module = {
      id: `module_${modules.length + 1}`,
      ...body,
      status: "active",
    };
    modules.push(newModule);
    return HttpResponse.json(newModule);
  }),

  http.patch(
    `*/api/orgs/${MOCK_ORG_ID}/modules/:moduleId`,
    async ({ params, request }) => {
      const { moduleId } = params;
      const body = (await request.json()) as UpdateModuleRequest;
      const index = modules.findIndex((m) => m.id === moduleId);

      if (index === -1) {
        return HttpResponse.json(null, { status: 404 });
      }

      modules[index] = { ...modules[index], ...body };
      return HttpResponse.json(modules[index]);
    }
  ),

  // API Keys
  http.get(`*/api/orgs/${MOCK_ORG_ID}/apikeys`, () => {
    const response: ApiKeysResponse = {
      items: apiKeys,
    };
    return HttpResponse.json(response);
  }),

  http.post(`*/api/orgs/${MOCK_ORG_ID}/apikeys`, () => {
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
