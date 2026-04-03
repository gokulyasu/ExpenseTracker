import { motion } from "framer-motion";
import { useTransactions } from "@/contexts/TransactionContext";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function RecentTransactions() {
  const { transactions } = useTransactions();
  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="mb-3 font-heading text-sm font-semibold">Recent Transactions</h3>
        <p className="text-xs text-muted-foreground">No transactions yet. Add your first one!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="mb-4 font-heading text-sm font-semibold">Recent Transactions</h3>
      <div className="space-y-3">
        {recent.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  t.type === "credit" ? "bg-credit/10" : "bg-debit/10"
                }`}
              >
                {t.type === "credit" ? (
                  <ArrowUpRight className="h-4 w-4 text-credit" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-debit" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.subcategory}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.type === "credit" ? "text-credit" : "text-debit"
              }`}
            >
              {t.type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
