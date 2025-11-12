import { ReactNode } from "react";

interface DocSectionProps {
  title: string;
  description?: string;
  id?: string;
  children: ReactNode;
}

export function DocSection({
  title,
  description,
  id,
  children,
}: DocSectionProps) {
  return (
    <div className="flex flex-col gap-4 mt-6" id={id}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
