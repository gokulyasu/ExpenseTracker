import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, doc, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import type { Budget } from "@/types";

interface BudgetContextType {
  budgets: Budget[];
  currentBudget: Budget | null;
  loading: boolean;
  setBudget: (month: string, limit: number) => Promise<void>;
  budgetUsagePercent: number;
  budgetStatus: "safe" | "warning" | "critical" | "exceeded";
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "budgets"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Budget)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const currentBudget = useMemo(
    () => budgets.find((b) => b.month === currentMonth) || null,
    [budgets, currentMonth]
  );

  const setBudgetFn = useCallback(async (month: string, limit: number) => {
    if (!user) return;
    const existing = budgets.find((b) => b.month === month);
    if (existing) {
      await updateDoc(doc(db, "budgets", existing.id), { limit });
    } else {
      await addDoc(collection(db, "budgets"), { userId: user.uid, month, limit });
    }
  }, [user, budgets]);

  // These will be computed with transaction data in components
  const budgetUsagePercent = 0;
  const budgetStatus: "safe" | "warning" | "critical" | "exceeded" = "safe";

  return (
    <BudgetContext.Provider value={{
      budgets, currentBudget, loading,
      setBudget: setBudgetFn, budgetUsagePercent, budgetStatus,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
