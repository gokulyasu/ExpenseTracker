import TransactionForm from "@/components/TransactionForm";
import { motion } from "framer-motion";

export default function AddTransaction() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-5 font-heading text-xl font-bold text-foreground"
      >
        Add Transaction
      </motion.h1>
      <TransactionForm />
    </div>
  );
}
