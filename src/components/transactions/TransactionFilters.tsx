"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Module } from "@/lib/api/generated/schemas";

interface TransactionFiltersProps {
  modules: Module[];
  selectedType?: string;
  selectedStatus?: string;
  selectedModuleId?: string;
  onTypeChange: (type: string | undefined) => void;
  onStatusChange: (status: string | undefined) => void;
  onModuleChange: (moduleId: string | undefined) => void;
  onClearFilters: () => void;
  onDownloadCsv: () => void;
  hasActiveFilters: boolean;
}

export function TransactionFilters({
  modules,
  selectedType,
  selectedStatus,
  selectedModuleId,
  onTypeChange,
  onStatusChange,
  onModuleChange,
  onClearFilters,
  onDownloadCsv,
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-3">
        {/* Type Filter */}
        <Select
          value={selectedType || "all"}
          onValueChange={(value) => onTypeChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="receive">Receive</SelectItem>
            <SelectItem value="send">Send</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="swap">Swap</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={selectedStatus || "all"}
          onValueChange={(value) =>
            onStatusChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="posted">Complete</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Module Filter */}
        <Select
          value={selectedModuleId || "all"}
          onValueChange={(value) =>
            onModuleChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module.id} value={module.id}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Download CSV */}
      <Button onClick={onDownloadCsv} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Download CSV
      </Button>
    </div>
  );
}
