import { motion } from "framer-motion";
import { useTransactions } from "@/contexts/TransactionContext";
import { useBudget } from "@/contexts/BudgetContext";
import { useMemo } from "react";

export default function BudgetCard() {
  const { transactions } = useTransactions();
  const { currentBudget } = useBudget();

  const monthlySpent = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions
      .filter((t) => t.type === "debit" && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const limit = currentBudget?.limit || 0;
  const percent = limit > 0 ? Math.min((monthlySpent / limit) * 100, 100) : 0;
  const status = percent >= 100 ? "exceeded" : percent >= 90 ? "critical" : percent >= 70 ? "warning" : "safe";

  const barColor = {
    safe: "bg-primary",
    warning: "bg-warning",
    critical: "bg-debit",
    exceeded: "bg-debit",
  }[status];

  const statusLabel = {
    safe: "On Track",
    warning: "⚠️ 70%+ Used",
    critical: "🔴 90%+ Used",
    exceeded: "❌ Budget Exceeded",
  }[status];

  if (!currentBudget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">Monthly Budget</h3>
        <p className="text-xs text-muted-foreground">No budget set. Go to Profile to set one.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-foreground">Monthly Budget</h3>
        <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
      </div>
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{monthlySpent.toLocaleString("en-IN")} spent</span>
        <span>₹{limit.toLocaleString("en-IN")} limit</span>
      </div>
    </motion.div>
  );
}
