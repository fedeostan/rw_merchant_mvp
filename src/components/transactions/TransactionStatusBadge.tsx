import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/schemas/transaction";

interface TransactionStatusBadgeProps {
  status: Transaction["status"];
}

export function TransactionStatusBadge({
  status,
}: TransactionStatusBadgeProps) {
  const getClassName = () => {
    switch (status) {
      case "posted":
        return "bg-green-600 hover:bg-green-700 text-white border-transparent";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent";
      case "failed":
        return "bg-red-500 hover:bg-red-600 text-white border-transparent";
      default:
        return "";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "posted":
        return "Complete";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <Badge variant="default" className={getClassName()}>
      {getLabel()}
    </Badge>
  );
}
