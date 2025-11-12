import type { Storefront, Transaction, ApiKey, User, Org } from "@/lib/schemas";

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

const generateTransactionHash = (): string => {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;
};

const generateRockWalletId = (): string => {
  return `RW-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
};

const mockCustomerEmails = [
  "customer1@example.com",
  "buyer@email.com",
  "john.doe@gmail.com",
  "sarah.smith@yahoo.com",
  "michael.brown@hotmail.com",
  "emily.davis@outlook.com",
  "james.wilson@proton.me",
  "lisa.anderson@gmail.com",
  "david.martinez@email.com",
  "jennifer.taylor@icloud.com",
];

export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const statuses: Transaction["status"][] = ["pending", "posted", "failed"];
  const types: Transaction["type"][] = ["in", "out"];
  const methods: Transaction["method"][] = ["stablecoin", "payout", "adjustment"];
  const displayTypes: Transaction["displayType"][] = [
    "receive",
    "send",
    "buy",
    "sell",
    "swap",
  ];

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
    const displayType =
      displayTypes[Math.floor(Math.random() * displayTypes.length)];

    // Determine if transaction has customer info based on display type
    const hasCustomerInfo = ["receive", "buy", "sell"].includes(displayType);
    const hasSendHash = ["send", "receive"].includes(displayType);

    transactions.push({
      id: `tx_${i + 1}`,
      storefrontId: "sf_1",
      moduleId: i % 3 === 0 ? `module_${(i % 9) + 1}` : undefined,
      type,
      method,
      displayType,
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
      feeUsd:
        method === "payout" ? Math.round(Math.random() * 5 * 100) / 100 : undefined,
      customerAddress:
        type === "in"
          ? `0x${Math.random().toString(16).slice(2, 42)}`
          : undefined,
      customerEmail: hasCustomerInfo
        ? mockCustomerEmails[Math.floor(Math.random() * mockCustomerEmails.length)]
        : undefined,
      sendHash: hasSendHash ? generateTransactionHash() : undefined,
      rockWalletId: hasCustomerInfo ? generateRockWalletId() : undefined,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockTransactions = generateMockTransactions(100);

// NOTE: Modules are now stored in Supabase database, not MSW mocks
// Mock modules have been removed. Use the real API endpoints for modules.

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






