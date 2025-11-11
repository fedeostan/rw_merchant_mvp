"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  generateComponentOnly,
  generateTypesOnly,
} from "@/lib/services/codeGenerator";
import type { Module } from "@/lib/api/generated/schemas/module";
import type { ModuleConfiguration } from "@/lib/schemas/module";

interface CodeTabProps {
  module: Module;
  configuration: ModuleConfiguration;
}

export function CodeTab({ module, configuration }: CodeTabProps) {
  const [copiedComponent, setCopiedComponent] = useState(false);
  const [copiedTypes, setCopiedTypes] = useState(false);

  // Generate code in real-time based on live configuration
  const componentCode = useMemo(() => {
    const moduleForGeneration = {
      ...module,
      configuration,
    } as any;
    return generateComponentOnly(moduleForGeneration);
  }, [module, configuration]);

  const typeDefinitions = useMemo(() => {
    return generateTypesOnly(module.kind);
  }, [module.kind]);

  const handleCopyComponent = () => {
    navigator.clipboard.writeText(componentCode);
    setCopiedComponent(true);
    setTimeout(() => setCopiedComponent(false), 2000);
  };

  const handleCopyTypes = () => {
    navigator.clipboard.writeText(typeDefinitions);
    setCopiedTypes(true);
    setTimeout(() => setCopiedTypes(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-sm text-yellow-600 dark:text-yellow-500">
          <strong>Note:</strong> This code requires the MNEE checkout library to
          be installed in your project. See the{" "}
          <a
            href="#"
            className="underline hover:no-underline"
            onClick={(e) => e.preventDefault()}
          >
            installation guide
          </a>{" "}
          for more details.
        </p>
      </div>

      {/* Component Code Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Component Code
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyComponent}
            className="h-8"
          >
            {copiedComponent ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border border-border">
          <SyntaxHighlighter
            language="tsx"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
            showLineNumbers
          >
            {componentCode}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Type Definitions Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Type Definitions
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTypes}
            className="h-8"
          >
            {copiedTypes ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border border-border">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
            showLineNumbers
          >
            {typeDefinitions}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          How to use
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Copy the component code and paste it into your React component</li>
          <li>Copy the type definitions to use with TypeScript</li>
          <li>
            Implement the <code className="text-xs">onSuccess</code> callback to
            handle successful payments
          </li>
          <li>Send the payment result to your backend for verification</li>
        </ol>
      </div>
    </div>
  );
}
