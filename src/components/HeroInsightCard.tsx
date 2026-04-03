import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { AnimatedNumber } from "./AnimatedNumber";

export default function HeroInsightCard() {
  const { totalCredit, totalDebit, balance } = useTransactions();
  const isPositive = balance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-hero rounded-2xl p-6 text-primary-foreground shadow-lg"
    >
      <div className="mb-1 flex items-center gap-2 text-primary-foreground/70">
        <Wallet className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
      </div>
      <div className="mb-4 flex items-baseline gap-1">
        <span className="font-heading text-3xl font-bold">
          ₹<AnimatedNumber value={balance} />
        </span>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-credit/20">
            <TrendingUp className="h-4 w-4 text-credit" />
          </div>
          <div>
            <p className="text-[10px] text-primary-foreground/60">Income</p>
            <p className="text-sm font-semibold">₹<AnimatedNumber value={totalCredit} /></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-debit/20">
            <TrendingDown className="h-4 w-4 text-debit" />
          </div>
          <div>
            <p className="text-[10px] text-primary-foreground/60">Expenses</p>
            <p className="text-sm font-semibold">₹<AnimatedNumber value={totalDebit} /></p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
