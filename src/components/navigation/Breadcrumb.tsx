import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex flex-col gap-2.5 h-16 justify-center">
      <div className="flex items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <div key={index} className="flex items-center gap-2">
                {Icon && (
                  <div className="flex items-center justify-center w-7 h-7 px-2">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                )}

                {!isLast && index === 0 && Icon && (
                  <div className="w-4 h-[17px] relative">
                    <ChevronRight className="w-4 h-4 text-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-sm font-normal text-foreground hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-normal text-foreground">
                      {item.label}
                    </span>
                  )}
                </div>

                {!isLast && (
                  <div className="w-4 h-[17px] relative ml-2">
                    <ChevronRight className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
