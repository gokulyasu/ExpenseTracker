import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { chatWithAI } from "@/lib/gemini";
import { useTransactions } from "@/contexts/TransactionContext";
import { useBudget } from "@/contexts/BudgetContext";
import { useMemo } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { transactions, totalCredit, totalDebit } = useTransactions();
  const { currentBudget } = useBudget();

  const summary = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === "debit") {
        breakdown[t.subcategory] = (breakdown[t.subcategory] || 0) + t.amount;
      }
    });
    const now = new Date();
    const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const spent = transactions
      .filter((t) => t.type === "debit" && t.date.startsWith(cm))
      .reduce((s, t) => s + t.amount, 0);
    return { totalCredit, totalDebit, breakdown, budget: currentBudget?.limit, spent };
  }, [transactions, totalCredit, totalDebit, currentBudget]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    const answer = await chatWithAI(q, summary);
    setMessages((prev) => [...prev, { role: "ai", content: answer }]);
    setLoading(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-accent shadow-lg animate-pulse-glow"
      >
        <MessageCircle className="h-6 w-6 text-accent-foreground" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 flex h-[420px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gradient-accent px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm font-semibold text-accent-foreground">AI Financial Advisor</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-accent-foreground/80 hover:text-accent-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Ask me about your finances! e.g. "How can I save more?"
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-2 text-xs text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about your finances..."
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={send}
                  disabled={loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
