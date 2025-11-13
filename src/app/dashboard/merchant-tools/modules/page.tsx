"use client";

import { Wrench, AlertCircle, Search } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModules } from "@/hooks/useModules";
import { useCreateModule } from "@/hooks/useCreateModule";
import { useState } from "react";
import type { Module } from "@/lib/api/generated/schemas/module";
import { CreateModuleDialog } from "@/components/modules/CreateModuleDialog";
import { ModuleBuilderDialog } from "@/components/modules/ModuleBuilderDialog";
import type { ModuleKind } from "@/lib/schemas/module";

// Helper function to format module kind for display
function formatModuleKind(kind: string): string {
  const kindMap: Record<string, string> = {
    paywall: "Paywall",
    "e-commerce": "E-commerce",
    donation: "Donation",
  };
  return kindMap[kind] || kind;
}

// Helper function to get default configuration based on module kind
function getDefaultConfiguration(kind: ModuleKind) {
  const baseConfig = {
    amount: "1.00",
    mneeDepositAddress: "1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC",
    collectEmail: true,
    showConfetti: true,
    theme: "dark" as const,
  };

  if (kind === "paywall") {
    return {
      ...baseConfig,
      paywall: {
        title: "Premium Content",
        description: "Unlock this content with a one-time payment",
        buttonText: "Unlock Now",
      },
    };
  }

  if (kind === "e-commerce") {
    return {
      ...baseConfig,
      ecommerce: {
        productName: "Product Name",
        showQuantitySelector: false,
        collectShipping: false,
      },
    };
  }

  if (kind === "donation") {
    return {
      ...baseConfig,
      donation: {
        title: "Support Us",
        description: "Your contribution helps us continue our work",
        suggestedAmounts: [0.5, 1.0, 1.5, 2.0],
        allowCustomAmount: true,
      },
    };
  }

  return baseConfig;
}

// Skeleton loader component for module cards
function ModuleCardSkeleton() {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 flex flex-col gap-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-14" />
      </div>
    </div>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <ModuleCardSkeleton />
      <ModuleCardSkeleton />
      <ModuleCardSkeleton />
    </div>
  );
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">Failed to load modules</p>
      </div>
      <p className="text-sm text-muted-foreground">
        There was an error loading your modules. Please try again.
      </p>
      <Button onClick={onRetry} variant="outline" className="h-9 px-4">
        Retry
      </Button>
    </div>
  );
}

// Empty state component
function EmptyState({ onCreateModule }: { onCreateModule: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <p className="text-sm font-medium text-foreground">No modules yet</p>
      <p className="text-sm text-muted-foreground">
        Create your first module to get started.
      </p>
      <Button onClick={onCreateModule} className="h-9 px-4">
        Create module
      </Button>
    </div>
  );
}

// Module card component
function ModuleCard({
  module,
  onOpen,
}: {
  module: Module;
  onOpen: (module: Module) => void;
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-medium text-card-foreground leading-5">
            {module.name}
          </p>
          <p className="text-sm text-muted-foreground leading-5">
            Module type: {formatModuleKind(module.kind)}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 px-3"
          onClick={() => onOpen(module)}
        >
          Open
        </Button>
      </div>
    </div>
  );
}

export default function ModulesPage() {
  const { modules, isLoading, isError, refetch } = useModules();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKind, setFilterKind] = useState<ModuleKind | "all">("all");

  const createModule = useCreateModule();

  // Phase 5: Filter modules based on search query and kind
  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      searchQuery === "" ||
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatModuleKind(module.kind).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKind = filterKind === "all" || module.kind === filterKind;

    return matchesSearch && matchesKind;
  });

  const handleOpenModule = (module: Module) => {
    setSelectedModuleId(module.id);
    setShowBuilderDialog(true);
  };

  const handleCreateModule = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = (data: { name: string; kind: ModuleKind }) => {
    // Create module with default configuration based on kind
    const defaultConfig = getDefaultConfiguration(data.kind);

    createModule.mutate(
      {
        name: data.name,
        kind: data.kind,
        configuration: defaultConfig,
      },
      {
        onSuccess: (newModule) => {
          setShowCreateDialog(false);
          // Open the builder dialog for the newly created module
          setSelectedModuleId(newModule.id);
          setShowBuilderDialog(true);
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 h-full pl-0 pr-2 py-2">
        <Breadcrumb
          items={[
            {
              label: "Merchant tools",
              icon: Wrench,
            },
            {
              label: "Modules",
            },
          ]}
        />

        <div className="flex-1 flex flex-col gap-6 px-0 py-6">
          <div className="flex flex-col gap-4 px-6">
            <div className="bg-card border border-border flex flex-col gap-6 px-0 py-6 rounded-xl">
              <div className="flex items-start justify-end gap-1.5 px-6">
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-lg font-semibold text-foreground leading-7">
                    Your modules
                  </p>
                  <p className="text-base text-muted-foreground leading-6">
                    Add the option to pay with crypto to your React-based
                    website or application.
                  </p>
                </div>
                <Button
                  className="h-9 px-4 py-2"
                  onClick={handleCreateModule}
                >
                  Create module
                </Button>
              </div>

              <div className="px-6">
                {isLoading && <LoadingState />}
                {isError && <ErrorState onRetry={refetch} />}
                {!isLoading && !isError && modules.length === 0 && (
                  <EmptyState onCreateModule={handleCreateModule} />
                )}
                {!isLoading && !isError && modules.length > 0 && (
                  <>
                    {/* Phase 5: Search and Filter UI */}
                    <div className="flex gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search modules..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select
                        value={filterKind}
                        onValueChange={(value) =>
                          setFilterKind(value as ModuleKind | "all")
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="e-commerce">E-commerce</SelectItem>
                          <SelectItem value="paywall">Paywall</SelectItem>
                          <SelectItem value="donation">Donation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filteredModules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <p className="text-sm font-medium text-foreground">
                          No modules found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {filteredModules.map((module) => (
                          <ModuleCard
                            key={module.id}
                            module={module}
                            onOpen={handleOpenModule}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Module Dialog */}
      <CreateModuleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateSubmit}
        isLoading={createModule.isPending}
      />

      {/* Module Builder Dialog */}
      <ModuleBuilderDialog
        moduleId={selectedModuleId}
        open={showBuilderDialog}
        onOpenChange={setShowBuilderDialog}
      />
    </>
  );
}
