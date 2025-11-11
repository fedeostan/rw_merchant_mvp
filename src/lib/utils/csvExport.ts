import { Transaction } from '@/lib/schemas/transaction';
import type { Module } from '@/lib/api/generated/schemas';
import { formatTransactionDate, formatTransactionAmount } from './transactionFormatters';

/**
 * Convert transactions to CSV format
 */
export function generateTransactionCSV(
  transactions: Transaction[],
  modulesMap?: Map<string, Module>
): string {
  // Define CSV headers
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Module Type',
    'Module Name',
    'Amount',
    'Status',
    'Customer Email',
    'Send Hash',
    'Rock Wallet ID',
    'Incoming Currency',
    'Amount (Raw)',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((transaction) => {
    const module = transaction.moduleId ? modulesMap?.get(transaction.moduleId) : undefined;

    return [
      transaction.id,
      formatTransactionDate(transaction.createdAt),
      transaction.displayType,
      module?.kind || '-',
      module?.name || '-',
      formatTransactionAmount(
        transaction.amount,
        transaction.currency,
        transaction.displayType
      ),
      transaction.status,
      transaction.customerEmail || '-',
      transaction.sendHash || '-',
      transaction.rockWalletId || '-',
      transaction.currency,
      transaction.amount.toString(),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape cells that contain commas, quotes, or newlines
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'transactions.csv'): void {
  // Create a blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary link element
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export transactions to CSV and trigger download
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  modulesMap?: Map<string, Module>,
  filename?: string
): void {
  const csvContent = generateTransactionCSV(transactions, modulesMap);
  const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
}
