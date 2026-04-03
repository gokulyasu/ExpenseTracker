import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useTransactions } from "@/contexts/TransactionContext";
import { useBudget } from "@/contexts/BudgetContext";
import { getMonthlyInsight, getWeeklyInsight, getBudgetInsight } from "@/lib/gemini";
import { Sparkles } from "lucide-react";

const COLORS = [
  "hsl(152, 68%, 45%)", "hsl(262, 83%, 58%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(200, 80%, 50%)", "hsl(320, 70%, 55%)",
];

type FilterType = "daily" | "weekly" | "monthly" | "yearly";

export default function AnalyticsCharts() {
  const { transactions, totalCredit, totalDebit,updateTransaction,deleteTransaction } = useTransactions();
  const { currentBudget } = useBudget();
  const [filter, setFilter] = useState<FilterType>("monthly");
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const trendData = useMemo(() => {
    const map = new Map<string, { credit: number; debit: number }>();
    transactions.forEach((t) => {
      let key: string;
      const d = new Date(t.date);
      if (filter === "daily") key = t.date;
      else if (filter === "weekly") {
        const week = getISOWeek(d);
        key = `W${week}`;
      } else if (filter === "monthly") key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      else key = String(d.getFullYear());

      const existing = map.get(key) || { credit: 0, debit: 0 };
      if (t.type === "credit") existing.credit += t.amount;
      else existing.debit += t.amount;
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .map(([name, vals]) => ({ name, ...vals }))
      .reverse();
  }, [transactions, filter]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "debit")
      .forEach((t) => map.set(t.subcategory, (map.get(t.subcategory) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const fetchInsight = async () => {
    setInsightLoading(true);
    const breakdown: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "debit")
      .forEach((t) => { breakdown[t.subcategory] = (breakdown[t.subcategory] || 0) + t.amount; });

    const now = new Date();
    const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const spent = transactions
      .filter((t) => t.type === "debit" && t.date.startsWith(cm))
      .reduce((s, t) => s + t.amount, 0);

    const result = await getMonthlyInsight({
      totalCredit,
      totalDebit,
      breakdown,
      budget: currentBudget?.limit,
      spent,
    });
    setInsight(result);
    setInsightLoading(false);
  };


  const handleEdit = async (t) => {
  const newAmount = prompt("Enter new amount", String(t.amount));
  if (!newAmount) return;

  try {
    await updateTransaction(t.id, {
      ...t,
      amount: parseFloat(newAmount),
    });
  } catch (e) {
    console.error(e);
  }
};

const handleDelete = async (id: string) => {
  try {
    await deleteTransaction(id);
  } catch (e) {
    console.error(e);
  }
};



  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly", "yearly"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === f
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Income", value: totalCredit, color: "text-credit" },
          { label: "Expenses", value: totalDebit, color: "text-debit" },
          { label: "Balance", value: totalCredit - totalDebit, color: "text-foreground" },
        ].map((m) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className={`font-heading text-lg font-bold ${m.color}`}>
              ₹{m.value.toLocaleString("en-IN")}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="mb-3 font-heading text-sm font-semibold">Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
            />
            <Line type="monotone" dataKey="credit" stroke="hsl(152, 68%, 45%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="debit" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="mb-3 font-heading text-sm font-semibold">Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="credit" fill="hsl(152, 68%, 45%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="debit" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <h3 className="mb-3 font-heading text-sm font-semibold">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold">AI Insights</h3>
          <button
            onClick={fetchInsight}
            disabled={insightLoading}
            className="flex items-center gap-1 rounded-lg gradient-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {insightLoading ? "Analyzing..." : "Get Insight"}
          </button>
        </div>
        {insight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="whitespace-pre-wrap rounded-xl bg-muted p-3 text-xs leading-relaxed text-foreground"
          >
            {insight}
          </motion.div>
        )}
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="mb-3 font-heading text-sm font-semibold">
          All Transactions
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No transactions found
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{t.subcategory}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.date}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t.notes}</p>

                </div>

                <p
                  className={`text-sm font-semibold ${t.type === "credit"
                    ? "text-credit"
                    : "text-debit"
                    }`}
                >
                  {t.type === "credit" ? "+" : "-"}₹
                  {t.amount.toLocaleString("en-IN")}
                </p>

<div>
                {/* Edit */}
                <button
                  onClick={() => handleEdit(t)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  ✏️Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  🗑 Delete
                </button>
                </div>
              </div>

            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
