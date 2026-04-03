import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import type { Subcategory } from "@/types";
import { DEFAULT_CREDIT_SUBCATEGORIES, DEFAULT_DEBIT_SUBCATEGORIES } from "@/types";

interface SubcategoryContextType {
  subcategories: Subcategory[];
  creditSubcategories: Subcategory[];
  debitSubcategories: Subcategory[];
  loading: boolean;
  addSubcategory: (name: string, type: "credit" | "debit") => Promise<void>;
  updateSubcategory: (id: string, name: string) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  initializeDefaults: () => Promise<void>;
}

const SubcategoryContext = createContext<SubcategoryContextType | null>(null);

export function SubcategoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubcategories([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "subcategories"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setSubcategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subcategory)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const initializeDefaults = useCallback(async () => {
    if (!user) return;
    const batch: Promise<unknown>[] = [];
    DEFAULT_CREDIT_SUBCATEGORIES.forEach((name) => {
      batch.push(addDoc(collection(db, "subcategories"), {
        userId: user.uid, name, type: "credit", isDefault: true,
      }));
    });
    DEFAULT_DEBIT_SUBCATEGORIES.forEach((name) => {
      batch.push(addDoc(collection(db, "subcategories"), {
        userId: user.uid, name, type: "debit", isDefault: true,
      }));
    });
    await Promise.all(batch);
  }, [user]);

  const addSubcategory = useCallback(async (name: string, type: "credit" | "debit") => {
    if (!user || name.trim().length < 2) return;
    const exists = subcategories.some(
      (s) => s.type === type && s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) throw new Error("Subcategory already exists");
    await addDoc(collection(db, "subcategories"), {
      userId: user.uid, name: name.trim(), type, isDefault: false,
    });
  }, [user, subcategories]);

  const updateSubcategory = useCallback(async (id: string, name: string) => {
    if (name.trim().length < 2) return;
    await updateDoc(doc(db, "subcategories", id), { name: name.trim() });
  }, []);

  const deleteSubcategory = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "subcategories", id));
  }, []);

  const creditSubcategories = subcategories.filter((s) => s.type === "credit");
  const debitSubcategories = subcategories.filter((s) => s.type === "debit");

  return (
    <SubcategoryContext.Provider value={{
      subcategories, creditSubcategories, debitSubcategories,
      loading, addSubcategory, updateSubcategory, deleteSubcategory, initializeDefaults,
    }}>
      {children}
    </SubcategoryContext.Provider>
  );
}

export function useSubcategories() {
  const ctx = useContext(SubcategoryContext);
  if (!ctx) throw new Error("useSubcategories must be used within SubcategoryProvider");
  return ctx;
}
