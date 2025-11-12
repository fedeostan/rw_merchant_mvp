import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
}

interface DocNavigationProps {
  previous?: NavLink;
  next?: NavLink;
}

export function DocNavigation({ previous, next }: DocNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      <div>
        {previous && (
          <Link href={previous.href}>
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {previous.label}
            </Button>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link href={next.href}>
            <Button variant="ghost" className="gap-2">
              {next.label}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
