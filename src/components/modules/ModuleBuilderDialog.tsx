"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { ConfigureTab } from "./ConfigureTab";
import { CodeTab } from "./CodeTab";
import { PreviewTab } from "./PreviewTab";
import { useUpdateModule } from "@/hooks/useUpdateModule";
import { useDeleteModule } from "@/hooks/useDeleteModule";
import { useModules } from "@/hooks/useModules";
import type { Module } from "@/lib/api/generated/schemas/module";
import type { ModuleConfiguration } from "@/lib/schemas/module";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModuleBuilderDialogProps {
  moduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleBuilderDialog({
  moduleId,
  open,
  onOpenChange,
}: ModuleBuilderDialogProps) {
  const [activeTab, setActiveTab] = useState("configure");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const { getModuleById, isLoading: isLoadingModules } = useModules();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const module = moduleId ? getModuleById(moduleId) : null;

  // Lifted configuration state for real-time preview
  const [draftConfiguration, setDraftConfiguration] =
    useState<ModuleConfiguration | null>(null);

  // Sync draft configuration with saved module when it changes
  useEffect(() => {
    if (module) {
      setDraftConfiguration(module.configuration as ModuleConfiguration);
    }
  }, [module?.configuration, moduleId]);

  // Show loading skeleton while module is being fetched
  if (!module && isLoadingModules && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div className="flex-1 space-y-2">
              <div className="h-7 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </DialogHeader>
          <div className="flex-1 flex flex-col gap-6 py-6">
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-24 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!module || !draftConfiguration) {
    return null;
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    JSON.stringify(draftConfiguration) !==
    JSON.stringify(module.configuration);

  const handleSave = () => {
    updateModule.mutate({
      moduleId: module.id,
      configuration: draftConfiguration,
    });
  };

  const handleDelete = () => {
    deleteModule.mutate(module.id, {
      onSuccess: () => {
        onOpenChange(false);
        setShowDeleteDialog(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!updateModule.isPending && !deleteModule.isPending) {
      // Check for unsaved changes before closing
      if (!newOpen && hasUnsavedChanges) {
        setPendingClose(true);
        setShowUnsavedDialog(true);
        return;
      }

      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset to configure tab when dialog closes
        setActiveTab("configure");
        // Reset draft configuration
        setDraftConfiguration(module.configuration as ModuleConfiguration);
      }
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
    onOpenChange(false);
    setActiveTab("configure");
    setDraftConfiguration(module.configuration as ModuleConfiguration);
  };

  const handleCancelClose = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div className="flex-1">
              <DialogTitle className="text-xl">{module.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Module builder
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                disabled={updateModule.isPending || deleteModule.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                disabled={updateModule.isPending || deleteModule.isPending}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="configure"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Configure
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Preview
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-6 px-1">
              <TabsContent value="configure" className="mt-0">
                <ConfigureTab
                  module={module}
                  configuration={draftConfiguration}
                  onChange={setDraftConfiguration}
                  onSave={handleSave}
                  isLoading={updateModule.isPending}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <CodeTab
                  module={module}
                  configuration={draftConfiguration}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <PreviewTab
                  module={module}
                  configuration={draftConfiguration}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete module?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{module.name}&quot;? This
              action cannot be undone. Any websites using this module will stop
              working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteModule.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteModule.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteModule.isPending ? "Deleting..." : "Delete module"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to &quot;{module.name}&quot;. Do you
              want to discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
