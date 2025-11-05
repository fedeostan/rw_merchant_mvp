import { CreditCard } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center gap-2 h-16 px-4 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7">
          <CreditCard className="w-4 h-4 text-foreground" />
        </div>
        <div className="w-4 h-4 text-foreground">/</div>
        <p className="text-sm font-normal text-foreground">Transactions</p>
      </div>

      {/* Content Area - Blank */}
      <div className="flex-1 p-6">
        {/* Content will be added later */}
      </div>
    </div>
  );
}
