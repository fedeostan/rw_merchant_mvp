"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./CodeBlock";

interface PackageManagerTabsProps {
  packageName: string;
  className?: string;
}

export function PackageManagerTabs({
  packageName,
  className,
}: PackageManagerTabsProps) {
  return (
    <Tabs defaultValue="npm" className={className}>
      <TabsList className="grid w-full grid-cols-3 bg-muted">
        <TabsTrigger value="npm">npm</TabsTrigger>
        <TabsTrigger value="yarn">yarn</TabsTrigger>
        <TabsTrigger value="pnpm">pnpm</TabsTrigger>
      </TabsList>
      <TabsContent value="npm" className="mt-4">
        <CodeBlock code={`npm install ${packageName}`} language="bash" />
      </TabsContent>
      <TabsContent value="yarn" className="mt-4">
        <CodeBlock code={`yarn add ${packageName}`} language="bash" />
      </TabsContent>
      <TabsContent value="pnpm" className="mt-4">
        <CodeBlock code={`pnpm add ${packageName}`} language="bash" />
      </TabsContent>
    </Tabs>
  );
}
