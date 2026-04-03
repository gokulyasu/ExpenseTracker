import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTransactions } from "@/contexts/TransactionContext";
import { useSubcategories } from "@/contexts/SubcategoryContext";
import { toast } from "sonner";

export default function TransactionForm() {
  const { addTransaction } = useTransactions();
  const { creditSubcategories, debitSubcategories } = useSubcategories();

  const [type, setType] = useState<"credit" | "debit">("debit");
  const [amount, setAmount] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subs = useMemo(
    () => (type === "credit" ? creditSubcategories : debitSubcategories),
    [type, creditSubcategories, debitSubcategories]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (!subcategory) {
      toast.error("Please select a category");
      return;
    }
    setSubmitting(true);
    try {
      await addTransaction({ amount: amt, type, subcategory, date, notes });
      toast.success("Transaction added!");
      setAmount("");
      setSubcategory("");
      setNotes("");
    } catch {
      toast.error("Failed to add transaction");
    }
    setSubmitting(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Type Toggle */}
      <div className="flex overflow-hidden rounded-xl border border-border bg-muted p-1">
        {(["credit", "debit"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setSubcategory(""); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              type === t
                ? t === "credit"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-debit text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t === "credit" ? "Income" : "Expense"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-foreground">₹</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-input bg-background py-3.5 pl-10 pr-4 text-lg font-semibold outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
        <div className="flex flex-wrap gap-2">
          {subs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubcategory(s.name)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                subcategory === s.name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting}
        className={`w-full rounded-xl py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all disabled:opacity-50 ${
          type === "credit" ? "gradient-primary" : "bg-debit"
        }`}
      >
        {submitting ? "Adding..." : `Add ${type === "credit" ? "Income" : "Expense"}`}
      </motion.button>
    </motion.form>
  );
}
