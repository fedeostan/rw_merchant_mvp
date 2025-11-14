"use client";

import { useState } from "react";
import { Key, Plus, AlertCircle } from "lucide-react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import type { CreateApiKeyResponse } from "@/lib/schemas/apikey";
import { formatDistanceToNow } from "date-fns";

export default function ApiKeysPage() {
  const { apiKeys, isLoading, isError, createApiKey, deleteApiKey, isCreating } = useApiKeys();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string | null } | null>(null);

  const handleCreateKey = async () => {
    try {
      const result = await createApiKey({ name: newKeyName || undefined });
      setCreatedKey(result);
      setIsCreateDialogOpen(false);
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to create API key:", error);
      // TODO: Show error toast
    }
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      await deleteApiKey(keyToRevoke.id);
      setKeyToRevoke(null);
      // TODO: Show success toast
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      // TODO: Show error toast
    }
  };

  const handleCloseSuccessDialog = () => {
    setCreatedKey(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-foreground" />
          <span className="text-foreground">/</span>
          <p className="text-sm font-normal text-foreground">API Keys</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isLoading}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
            <p className="text-sm text-destructive font-medium">
              Failed to load API keys. Please try again.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        )}

        {/* API Keys Table */}
        {!isLoading && !isError && (
          <>
            {apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Key className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No API keys yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Create your first API key to start integrating with the MNEE Pay API.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First API Key
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} className="border-border">
                        <TableCell className="font-medium">
                          {key.name || <span className="text-muted-foreground italic">Unnamed</span>}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            mnee_live_••••{key.last4}
                          </code>
                        </TableCell>
                        <TableCell>
                          {key.active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Revoked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {key.lastUsedAt
                            ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          {key.active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setKeyToRevoke({ id: key.id, name: key.name || null })}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your API key a descriptive name to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name (optional)</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production API"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - Show Key Once */}
      <Dialog open={!!createdKey} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-green-600" />
              </div>
              API Key Created Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  Save this key now!
                </p>
                <p className="text-sm text-amber-800">
                  This is the only time you'll see the full API key. Make sure to copy and store it securely.
                </p>
              </div>
            </div>

            {/* Key Display */}
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdKey?.key || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <CopyButton
                  text={createdKey?.key || ""}
                  variant="default"
                  size="default"
                  className="px-3"
                />
              </div>
            </div>

            {/* Key Details */}
            {createdKey?.name && (
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-sm text-foreground">{createdKey.name}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog}>
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke {keyToRevoke?.name ? `"${keyToRevoke.name}"` : "this API key"}?
              This action cannot be undone. Any applications using this key will no longer be able to access the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
