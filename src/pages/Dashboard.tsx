import HeroInsightCard from "@/components/HeroInsightCard";
import BudgetCard from "@/components/BudgetCard";
import RecentTransactions from "@/components/RecentTransactions";
import CategoryDonut from "@/components/CategoryDonut";
import AIChatButton from "@/components/AIChatButton";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const name = profile?.name || user?.displayName || "there";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <p className="text-xs text-muted-foreground">Welcome back,</p>
        <h1 className="font-heading text-xl font-bold text-foreground">{name} 👋</h1>
      </motion.div>

      <div className="space-y-4">
        <HeroInsightCard />
        <BudgetCard />
        <CategoryDonut />
        <RecentTransactions />
      </div>

      <AIChatButton />
    </div>
  );
}
