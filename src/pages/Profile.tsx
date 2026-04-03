import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useBudget } from "@/contexts/BudgetContext";
import SubcategoryManager from "@/components/SubcategoryManager";
import { LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { currentBudget, setBudget } = useBudget();
  const [budgetInput, setBudgetInput] = useState(String(currentBudget?.limit || ""));
  const [showCategories, setShowCategories] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const saveBudget = async () => {
    const limit = parseFloat(budgetInput);
    if (isNaN(limit) || limit <= 0) {
      toast.error("Enter a valid budget amount");
      return;
    }
    await setBudget(currentMonth, limit);
    toast.success("Budget updated!");
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-5 font-heading text-xl font-bold text-foreground"
      >
        Profile
      </motion.h1>

      {/* User info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-xl font-bold text-primary-foreground">
            {(profile?.name || user?.displayName || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">
              {profile?.name || user?.displayName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Budget */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold">Monthly Budget</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="e.g. 50000"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={saveBudget}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Save
          </button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="mb-4 w-full rounded-2xl border border-border bg-card p-4 text-left"
        >
          <span className="font-heading text-sm font-semibold text-foreground">
            {showCategories ? "Hide" : "Manage"} Categories
          </span>
        </button>
        {showCategories && <SubcategoryManager />}
      </motion.div>

      {/* Sign out */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={signOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-debit/20 bg-debit/5 py-3 text-sm font-semibold text-debit transition hover:bg-debit/10"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </motion.button>
    </div>
  );
}
