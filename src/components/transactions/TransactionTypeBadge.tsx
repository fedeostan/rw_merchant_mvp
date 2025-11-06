import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/schemas/transaction";

interface TransactionTypeBadgeProps {
  displayType: Transaction["displayType"];
}

export function TransactionTypeBadge({
  displayType,
}: TransactionTypeBadgeProps) {
  const getVariant = () => {
    switch (displayType) {
      case "receive":
        return "default"; // Orange
      case "send":
        return "secondary"; // Gray
      case "buy":
      case "sell":
        return "default"; // Blue
      case "swap":
        return "default"; // Purple
      default:
        return "secondary";
    }
  };

  const getClassName = () => {
    switch (displayType) {
      case "receive":
        return "bg-orange-500 hover:bg-orange-600 text-white border-transparent";
      case "send":
        return "bg-gray-200 hover:bg-gray-300 text-gray-700 border-transparent";
      case "buy":
      case "sell":
        return "bg-blue-500 hover:bg-blue-600 text-white border-transparent";
      case "swap":
        return "bg-purple-500 hover:bg-purple-600 text-white border-transparent";
      default:
        return "";
    }
  };

  const getLabel = () => {
    return displayType.charAt(0).toUpperCase() + displayType.slice(1);
  };

  return (
    <Badge variant={getVariant()} className={getClassName()}>
      {getLabel()}
    </Badge>
  );
}
