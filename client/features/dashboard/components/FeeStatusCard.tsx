import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeeSummary } from "@/services/api/client";
import { ReceiptText } from "lucide-react";

interface FeeStatusCardProps {
  feeSummary?: FeeSummary | null;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

export function FeeStatusCard({ feeSummary }: FeeStatusCardProps) {
  const currency = feeSummary?.currency || "INR";
  const paidAmount = Number(feeSummary?.paidAmount || 0);
  const remainingAmount = feeSummary?.remainingAmount;
  const totalFee = Number(feeSummary?.totalFee || 0);
  const isConfigured = Boolean(feeSummary?.configured);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-brand-orange" />
            Fees
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            {currency}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Fees Paid
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(paidAmount, currency)}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
            Fees Remaining
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {remainingAmount == null
              ? "Not set"
              : formatCurrency(remainingAmount, currency)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {isConfigured
            ? `Class fee total: ${formatCurrency(totalFee, currency)}`
            : "Class fee is not configured yet."}
        </p>
      </CardContent>
    </Card>
  );
}
