import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import type { Transaction } from "@/types";

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  totalCredit: number;
  totalDebit: number;
  balance: number;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
      // orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(txns);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    const now = new Date().toISOString();
    const transactionData = {
      ...t,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };
    // console.log("Transaction data being sent to Firestore:", transactionData); // <-- Add this line
    await addDoc(collection(db, "transactions"), transactionData);
  }, [user]);

  const updateTransaction = useCallback(async (id: string, t: Partial<Transaction>) => {
    await updateDoc(doc(db, "transactions", id), {
      ...t,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  }, []);

  const { totalCredit, totalDebit, balance } = useMemo(() => {
    const credit = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    const debit = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalCredit: credit, totalDebit: debit, balance: credit - debit };
  }, [transactions]);

  return (
    <TransactionContext.Provider value={{
      transactions, loading, addTransaction, updateTransaction,
      deleteTransaction, totalCredit, totalDebit, balance,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
