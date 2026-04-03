import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";

const COLORS = [
  "hsl(152, 68%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(200, 80%, 50%)",
  "hsl(320, 70%, 55%)",
  "hsl(60, 70%, 45%)",
  "hsl(180, 60%, 40%)",
];

export default function CategoryDonut() {
  const { transactions } = useTransactions();

  const data = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "debit")
      .forEach((t) => {
        map.set(t.subcategory, (map.get(t.subcategory) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="mb-2 font-heading text-sm font-semibold">Spending by Category</h3>
        <p className="text-xs text-muted-foreground">No expense data yet.</p>
      </motion.div>
    );
  }

  const top = data[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="mb-3 font-heading text-sm font-semibold">Spending by Category</h3>
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">Top</span>
            <span className="text-xs font-bold text-foreground">{top.name}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 4).map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-medium text-foreground">₹{d.value.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
