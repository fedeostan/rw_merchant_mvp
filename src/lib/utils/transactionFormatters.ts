import { format, parseISO } from "date-fns";
import type { Transaction } from "@/lib/schemas/transaction";

/**
 * Format a transaction date to American format
 * Example: "17 Sep 2025, 11:16 PM"
 */
export function formatTransactionDate(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "d MMM yyyy, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Format a transaction amount with sign and currency
 * Positive: "+$120.00 USD"
 * Negative: "-$182.50 USD"
 */
export function formatTransactionAmount(
  amount: number,
  currency: string,
  displayType: Transaction["displayType"]
): string {
  const isPositive =
    displayType === "receive" || displayType === "buy" || displayType === "swap";
  const sign = isPositive ? "+" : "-";
  const absAmount = Math.abs(amount);

  // Format with 2 decimal places
  const formattedAmount = absAmount.toFixed(2);

  return `${sign}$${formattedAmount} ${currency.toUpperCase()}`;
}

/**
 * Truncate an address or hash to a shorter format with ellipsis
 * Example: "0x7a3f6b2c8d9e1a4b5c6d7e8f9a0b1c2d3e4f5a6b" -> "0x7a3f...5a6b"
 */
export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Get blockchain explorer URL for a transaction hash
 * Using Etherscan for Ethereum mainnet as default
 */
export function getBlockchainExplorerUrl(
  hash: string,
  network: "ethereum" | "polygon" | "bsc" = "ethereum"
): string {
  const explorers = {
    ethereum: "https://etherscan.io/tx/",
    polygon: "https://polygonscan.com/tx/",
    bsc: "https://bscscan.com/tx/",
  };

  return `${explorers[network]}${hash}`;
}

/**
 * Format a numeric transaction ID with # prefix
 * Example: 12347 -> "#12347"
 */
export function formatTransactionId(id: string | number): string {
  return `#${id}`;
}

/**
 * Get the color class for an amount based on display type
 */
export function getAmountColorClass(displayType: Transaction["displayType"]): string {
  const isPositive =
    displayType === "receive" || displayType === "buy" || displayType === "swap";
  return isPositive ? "text-green-600" : "text-gray-900";
}

/**
 * Format percentage change with sign and percentage symbol
 * @param value - The percentage value to format
 * @returns Formatted percentage string (e.g., "+5.23%", "-2.45%", "0.00%")
 *
 * @example
 * formatPercentageChange(5.23) // "+5.23%"
 * formatPercentageChange(-2.45) // "-2.45%"
 * formatPercentageChange(null) // "0.00%"
 */
export function formatPercentageChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format USD amount with currency symbol
 * @param value - The USD amount to format
 * @returns Formatted USD string (e.g., "$1,234.56")
 *
 * @example
 * formatUsdAmount(1234.56) // "$1,234.56"
 * formatUsdAmount(1000000) // "$1,000,000.00"
 */
export function formatUsdAmount(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
