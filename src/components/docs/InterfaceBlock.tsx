import { CodeBlock } from "./CodeBlock";

interface InterfaceBlockProps {
  title: string;
  code: string;
  description?: string;
}

export function InterfaceBlock({
  title,
  code,
  description,
}: InterfaceBlockProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <CodeBlock code={code} language="typescript" />
    </div>
  );
}
