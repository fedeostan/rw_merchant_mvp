import type { Storefront, Transaction, Module, ApiKey, User, Org } from "@/lib/schemas";

export const MOCK_ORG_ID = "org_1";

export const mockUser: User = {
  id: "user_1",
  email: "merchant@example.com",
  name: "Merchant User",
};

export const mockOrg: Org = {
  id: MOCK_ORG_ID,
  name: "Merchant Org",
  kybStatus: "approved",
};

export const mockStorefront: Storefront = {
  id: "sf_1",
  label: "Default Wallet",
  type: "CRYPTO",
  currency: "MNEE",
  address: "0xabc1234567890def1234567890abcdef12345678",
};

export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const statuses: Transaction["status"][] = ["pending", "posted", "failed"];
  const types: Transaction["type"][] = ["in", "out"];
  const methods: Transaction["method"][] = ["stablecoin", "payout", "adjustment"];

  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(
      oneYearAgo + Math.random() * (now - oneYearAgo)
    ).toISOString();
    const amount = Math.random() * 10000 + 10;
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];

    transactions.push({
      id: `tx_${i + 1}`,
      storefrontId: "sf_1",
      moduleId: i % 3 === 0 ? `module_${Math.floor(i / 3) + 1}` : undefined,
      type,
      method,
      amount: Math.round(amount * 100) / 100,
      currency: "MNEE",
      status,
      createdAt: timestamp,
      txHashIn:
        type === "in"
          ? `0x${Math.random().toString(16).slice(2, 66)}`
          : undefined,
      txHashSwap:
        type === "out" && method === "stablecoin"
          ? `0x${Math.random().toString(16).slice(2, 66)}`
          : undefined,
      feeUsd: method === "payout" ? Math.round(Math.random() * 5 * 100) / 100 : undefined,
      customerAddress:
        type === "in"
          ? `0x${Math.random().toString(16).slice(2, 42)}`
          : undefined,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockTransactions = generateMockTransactions(100);

export const mockModules: Module[] = [
  {
    id: "module_1",
    name: "Checkout Widget",
    kind: "checkout",
    storefrontId: "sf_1",
    codeSnippet: '<div id="checkout-widget" data-module-id="module_1"></div>',
    status: "active",
    imageUrl: undefined,
  },
  {
    id: "module_2",
    name: "Payment Link #1",
    kind: "payment_link",
    storefrontId: "sf_1",
    codeSnippet: "https://pay.example.com/link/abc123",
    status: "active",
    imageUrl: undefined,
  },
  {
    id: "module_3",
    name: "Payment Link #2",
    kind: "payment_link",
    storefrontId: "sf_1",
    codeSnippet: "https://pay.example.com/link/def456",
    status: "inactive",
    imageUrl: undefined,
  },
];

export const generateMockApiKeys = (): ApiKey[] => {
  const keys: ApiKey[] = [];
  const now = Date.now();

  for (let i = 0; i < 3; i++) {
    keys.push({
      id: `key_${i + 1}`,
      last4: `${Math.floor(Math.random() * 10000)}`.padStart(4, "0"),
      createdAt: new Date(now - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
      active: i !== 2,
    });
  }

  return keys;
};

export const mockApiKeys = generateMockApiKeys();


