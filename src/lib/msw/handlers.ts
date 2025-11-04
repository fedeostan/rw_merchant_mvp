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
  // Auth endpoints
  http.post("/api/auth/otp/send", () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  http.post("/api/auth/otp/verify", async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };
    
    // Mock: accept any email/code
    const accessToken = `mock_token_${Date.now()}`;
    
    // Store session in localStorage (handled by client)
    return HttpResponse.json({
      accessToken,
      user: mockUser,
      org: mockOrg,
    });
  }),

  // Me endpoint
  http.get("/api/me", () => {
    return HttpResponse.json({
      user: mockUser,
      org: mockOrg,
    });
  }),

  // Storefronts
  http.get(`/api/orgs/${MOCK_ORG_ID}/storefronts`, () => {
    return HttpResponse.json([mockStorefront]);
  }),

  // Balance
  http.get(`/api/orgs/${MOCK_ORG_ID}/storefronts/:sfId/balance`, () => {
    const balance: MoneyBalance = {
      storefrontId: "sf_1",
      currency: "MNEE",
      available: 12540.33,
      pending: 210.0,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(balance);
  }),

  // Transactions
  http.get(`/api/orgs/${MOCK_ORG_ID}/transactions`, ({ request }) => {
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
  http.get(`/api/orgs/${MOCK_ORG_ID}/modules`, () => {
    return HttpResponse.json(modules);
  }),

  http.post(`/api/orgs/${MOCK_ORG_ID}/modules`, async ({ request }) => {
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
    `/api/orgs/${MOCK_ORG_ID}/modules/:moduleId`,
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
  http.get(`/api/orgs/${MOCK_ORG_ID}/apikeys`, () => {
    const response: ApiKeysResponse = {
      items: apiKeys,
    };
    return HttpResponse.json(response);
  }),

  http.post(`/api/orgs/${MOCK_ORG_ID}/apikeys`, () => {
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

