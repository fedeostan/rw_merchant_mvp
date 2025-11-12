"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "typescript",
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-2 top-2 z-10">
        <CopyButton
          text={code}
          className="bg-muted/80 hover:bg-muted text-muted-foreground"
          size="sm"
        />
      </div>
      <div className="rounded-lg overflow-hidden border border-border">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            paddingTop: showLineNumbers ? "1rem" : "2.5rem",
            paddingRight: "3rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            background: "#1E1E1E",
          }}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
