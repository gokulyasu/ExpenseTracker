import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useSubcategories } from "@/contexts/SubcategoryContext";

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const { initializeDefaults, subcategories } = useSubcategories();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        if (name.trim().length < 2) {
          toast.error("Name must be at least 2 characters");
          setSubmitting(false);
          return;
        }
        await signUp(email, password, name.trim());
        // Initialize default subcategories for new user
        await initializeDefaults();
        toast.success("Account created!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">₹</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">ExpenseTracker</h1>
          <p className="mt-1 text-xs text-muted-foreground">Smart money management, powered by AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={6}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition disabled:opacity-50"
          >
            {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-primary hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
