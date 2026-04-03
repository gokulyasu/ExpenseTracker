import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSubcategories } from "@/contexts/SubcategoryContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { toast } from "sonner";

export default function SubcategoryManager() {
  const { subcategories, addSubcategory, updateSubcategory, deleteSubcategory } = useSubcategories();
  const { transactions } = useTransactions();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"credit" | "debit">("debit");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (newName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    try {
      await addSubcategory(newName, newType);
      setNewName("");
      toast.success("Subcategory added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const inUse = transactions.some((t) => t.subcategory === name);
    if (inUse) {
      toast.warning("This category is used in transactions. Delete those first.");
      return;
    }
    await deleteSubcategory(id);
    toast.success("Deleted");
  };

  const handleUpdate = async (id: string) => {
    if (editName.trim().length < 2) return;
    await updateSubcategory(id, editName);
    setEditId(null);
    toast.success("Updated");
  };

  const grouped = {
    credit: subcategories.filter((s) => s.type === "credit"),
    debit: subcategories.filter((s) => s.type === "debit"),
  };

  return (
    <div className="space-y-6">
      {/* Add new */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 font-heading text-sm font-semibold">Add Subcategory</h3>
        <div className="flex gap-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as "credit" | "debit")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs"
          >
            <option value="credit">Income</option>
            <option value="debit">Expense</option>
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
          <button onClick={handleAdd} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      {(["credit", "debit"] as const).map((type) => (
        <div key={type} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 font-heading text-sm font-semibold">
            {type === "credit" ? "Income" : "Expense"} Categories
          </h3>
          <div className="space-y-2">
            {grouped[type].map((s) => (
              <motion.div
                key={s.id}
                layout
                className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
              >
                {editId === s.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleUpdate(s.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(s.id)}
                    className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-medium text-foreground">{s.name}</span>
                )}
                {!s.isDefault && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditId(s.id); setEditName(s.name); }}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="rounded p-1 text-muted-foreground hover:text-debit"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
