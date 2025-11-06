"use client";

import { CreditCard } from "lucide-react";
import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransactions } from "@/hooks/useTransactions";
import { useModules } from "@/hooks/useModules";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionDetailSheet } from "@/components/transactions/TransactionDetailSheet";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import type { Transaction } from "@/lib/schemas/transaction";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { exportTransactionsToCSV } from "@/lib/utils";

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Fetch data
  const { transactions, isLoading, isError, nextCursor, filters } =
    useTransactions();
  const { modules, getModuleById, modulesMap, isLoading: modulesLoading } = useModules();

  // Handle filter changes with URL params
  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset cursor when filters change
      params.delete("cursor");

      router.push(`/dashboard/transactions?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleTypeChange = useCallback(
    (type: string | undefined) => {
      updateFilters({ type });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (status: string | undefined) => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  const handleModuleChange = useCallback(
    (moduleId: string | undefined) => {
      updateFilters({ moduleId });
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    router.push("/dashboard/transactions");
  }, [router]);

  const handleDownloadCsv = useCallback(() => {
    if (transactions.length === 0) {
      console.warn("No transactions to export");
      return;
    }

    // Generate filename with filters
    const filterParts = [];
    if (filters.type) filterParts.push(filters.type);
    if (filters.status) filterParts.push(filters.status);
    const filterSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
    const filename = `transactions${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

    exportTransactionsToCSV(transactions, modulesMap, filename);
  }, [transactions, modulesMap, filters]);

  const handleRowClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("cursor", nextCursor);
      router.push(`/dashboard/transactions?${params.toString()}`);
    }
  }, [nextCursor, searchParams, router]);

  const handlePreviousPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cursor");
    router.push(`/dashboard/transactions?${params.toString()}`);
  }, [searchParams, router]);

  const hasActiveFilters = !!(
    filters.type ||
    filters.status ||
    filters.moduleId
  );

  const hasCursor = !!searchParams.get("cursor");

  return (
    <div className="flex flex-col h-full p-2">
      <div className="bg-background rounded-xl flex flex-col h-full">
        {/* Page Header */}
        <div className="h-16 flex items-center px-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-foreground" />
            <span className="text-foreground">/</span>
            <p className="text-sm font-normal text-foreground">Transactions</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Filters */}
        <TransactionFilters
          modules={modules}
          selectedType={filters.type}
          selectedStatus={filters.status}
          selectedModuleId={filters.moduleId}
          onTypeChange={handleTypeChange}
          onStatusChange={handleStatusChange}
          onModuleChange={handleModuleChange}
          onClearFilters={handleClearFilters}
          onDownloadCsv={handleDownloadCsv}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">
              Failed to load transactions. Please try again.
            </p>
          </div>
        )}

        {/* Transactions Table */}
        <div className="w-full overflow-x-auto">
          <TransactionsTable
            transactions={transactions}
            modules={modules}
            onRowClick={handleRowClick}
            isLoading={isLoading || modulesLoading}
          />
        </div>

        {/* Pagination */}
        {!isLoading && transactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!hasCursor}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!nextCursor}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Sheet */}
      <TransactionDetailSheet
        transaction={selectedTransaction}
        module={getModuleById(selectedTransaction?.moduleId)}
        open={!!selectedTransaction}
        onClose={handleCloseSheet}
      />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full p-2">
          <div className="bg-background rounded-xl flex flex-col h-full">
            <div className="h-16 flex items-center px-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-foreground" />
                <span className="text-foreground">/</span>
                <p className="text-sm font-normal text-foreground">Transactions</p>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-64 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
