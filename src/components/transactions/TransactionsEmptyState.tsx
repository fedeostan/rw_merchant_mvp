import { Receipt } from "lucide-react";

export function TransactionsEmptyState() {
  return (
    <div className="rounded-lg border border-border bg-card p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
        {/* Icon */}
        <div className="rounded-lg bg-muted/30 p-4">
          <Receipt className="w-12 h-12 text-muted-foreground/40" />
        </div>

        {/* Heading */}
        <h3 className="text-lg font-semibold text-foreground">
          No transactions yet
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your transactions will appear here once customers start making
          payments. To receive payments, make sure your payment module is set
          up on your site.
        </p>
      </div>
    </div>
  );
}
