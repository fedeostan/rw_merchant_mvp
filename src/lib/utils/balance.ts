import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export interface OrgBalance {
  available: number;
  pending: number;
  currency: "MNEE";
  priceUsd: number;
  totalUsd: number;
  priceChangePercentage24h: number | null;
  updatedAt: string;
}

/**
 * Calculate organization balance from transactions
 * Logic: SUM(amount WHERE type='in' AND status='posted') - SUM(amount WHERE type='out' AND status='posted')
 * Pending: SUM(amount WHERE type='in' AND status='pending') - SUM(amount WHERE type='out' AND status='pending')
 */
export async function calculateOrgBalance(
  orgId: string
): Promise<OrgBalance> {
  const supabase = await createClient();

  // Fetch all transactions for the organization
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("type, amount, status")
    .eq("org_id", orgId);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  // Fetch MNEE price from crypto_prices_latest view
  const { data: priceData, error: priceError } = await supabase
    .from("crypto_prices_latest")
    .select("price_usd, price_change_percentage_24h")
    .eq("symbol", "MNEE")
    .single();

  if (priceError) {
    console.error("Failed to fetch MNEE price:", priceError);
    throw new Error(`Failed to fetch MNEE price: ${priceError.message}`);
  }

  const priceUsd = Number(priceData.price_usd);
  const priceChangePercentage24h = priceData.price_change_percentage_24h
    ? Number(priceData.price_change_percentage_24h)
    : null;

  if (!transactions) {
    return {
      available: 0,
      pending: 0,
      currency: "MNEE",
      priceUsd,
      totalUsd: 0,
      priceChangePercentage24h,
      updatedAt: new Date().toISOString(),
    };
  }

  // Calculate available balance (posted transactions)
  const postedTransactions = transactions.filter((t) => t.status === "posted");
  const available = postedTransactions.reduce((sum, transaction) => {
    if (transaction.type === "in") {
      return sum + transaction.amount;
    } else if (transaction.type === "out") {
      return sum - transaction.amount;
    }
    return sum;
  }, 0);

  // Calculate pending balance (pending transactions)
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  );
  const pending = pendingTransactions.reduce((sum, transaction) => {
    if (transaction.type === "in") {
      return sum + transaction.amount;
    } else if (transaction.type === "out") {
      return sum - transaction.amount;
    }
    return sum;
  }, 0);

  // Calculate total USD value
  const totalUsd = (available + pending) * priceUsd;

  return {
    available,
    pending,
    currency: "MNEE",
    priceUsd,
    totalUsd,
    priceChangePercentage24h,
    updatedAt: new Date().toISOString(),
  };
}
