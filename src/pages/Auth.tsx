import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useSubcategories } from "@/contexts/SubcategoryContext";

export default function Auth() {
  const { user, signIn, signUp, loading,googleSignIn } = useAuth();
  const { initializeDefaults, subcategories } = useSubcategories();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
const handleGoogleLogin = async () => {
  setSubmitting(true);
  try {
    await googleSignIn();
    toast.success("Signed in with Google!");
  } catch (err: any) {
    toast.error(err.message || "Google sign-in failed");
  }
  setSubmitting(false);
};
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
          {/* Divider */}
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">Or</span>
  </div>
</div>

{/* Google Button */}
<motion.button
  whileTap={{ scale: 0.98 }}
  type="button"
  onClick={handleGoogleLogin}
  disabled={submitting}
  className="w-full flex items-center justify-center gap-3 rounded-xl border border-input bg-card py-3 text-sm font-medium shadow-sm hover:bg-muted transition disabled:opacity-50"
>
  {/* Google Logo */}
  <svg className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.36 1.22 8.29 3.04l6.2-6.2C34.64 2.64 29.74 0 24 0 14.64 0 6.73 5.4 2.69 13.26l7.21 5.6C11.7 12.14 17.33 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.14-.4-4.64H24v9.3h12.7c-.55 2.96-2.23 5.48-4.75 7.18l7.3 5.68C43.9 37.36 46.5 31.46 46.5 24.5z"/>
    <path fill="#FBBC05" d="M9.9 28.86A14.5 14.5 0 0 1 9.5 24c0-1.68.29-3.3.8-4.86l-7.21-5.6A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.69 10.74l7.21-5.6z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.3-5.68c-2.03 1.36-4.64 2.16-8.59 2.16-6.67 0-12.3-2.64-15.1-9.36l-7.21 5.6C6.73 42.6 14.64 48 24 48z"/>
  </svg>

  Continue with Google
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
