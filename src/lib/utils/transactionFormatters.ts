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
