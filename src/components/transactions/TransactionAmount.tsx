import type { Transaction } from "@/lib/schemas/transaction";

interface TransactionAmountProps {
  amount: number;
  currency: string;
  type: Transaction["type"];
}

export function TransactionAmount({
  amount,
  currency,
  type,
}: TransactionAmountProps) {
  const isPositive = type === "in";
  const sign = isPositive ? "+" : "-";
  const formattedAmount = Math.abs(amount).toFixed(2);

  return (
    <span
      className={isPositive ? "text-green-600 font-medium" : "font-medium"}
    >
      {sign} ${formattedAmount} {currency}
    </span>
  );
}
