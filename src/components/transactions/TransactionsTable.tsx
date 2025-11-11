"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { format } from "date-fns";
import type { Transaction } from "@/lib/schemas/transaction";
import type { Module } from "@/lib/api/generated/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { TransactionAmount } from "./TransactionAmount";
import { TransactionsEmptyState } from "./TransactionsEmptyState";
import { ArrowUpDown } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
  modules: Module[];
  onRowClick: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export function TransactionsTable({
  transactions,
  modules,
  onRowClick,
  isLoading = false,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Create a map of module IDs to modules for quick lookup
  const moduleMap = modules.reduce(
    (acc, module) => {
      acc[module.id] = module;
      return acc;
    },
    {} as Record<string, Module>,
  );

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "Transaction ID",
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row.original);
          }}
          className="text-foreground hover:text-foreground underline font-normal transition-colors"
        >
          #{row.original.id}
        </button>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return format(date, "d MMM yyyy, h:mm a");
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "displayType",
      header: "Type",
      cell: ({ row }) => (
        <TransactionTypeBadge displayType={row.original.displayType} />
      ),
    },
    {
      accessorKey: "moduleId",
      header: "Module type",
      cell: ({ row }) => {
        const moduleId = row.original.moduleId;
        if (!moduleId) return <span className="text-gray-500">-</span>;
        const module = moduleMap[moduleId];
        return module?.kind || <span className="text-gray-500">-</span>;
      },
    },
    {
      id: "moduleName",
      header: "Module name",
      cell: ({ row }) => {
        const moduleId = row.original.moduleId;
        if (!moduleId) return <span className="text-gray-500">-</span>;
        const module = moduleMap[moduleId];
        return module?.name || <span className="text-gray-500">-</span>;
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <TransactionAmount
          amount={row.original.amount}
          currency={row.original.currency}
          type={row.original.type}
        />
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <TransactionStatusBadge status={row.original.status} />
      ),
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              {columns.map((column, i) => (
                <TableHead key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/30">
                  {typeof column.header === "string"
                    ? column.header
                    : "Column"}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-b border-border last:border-0">
                {columns.map((_, j) => (
                  <TableCell key={j} className="p-4">
                    <div className="h-5 bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (transactions.length === 0) {
    return <TransactionsEmptyState />;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/30 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors duration-150 border-b border-border last:border-0"
                onClick={() => onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4 align-middle whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
