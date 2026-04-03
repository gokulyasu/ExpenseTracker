import AnalyticsCharts from "@/components/AnalyticsCharts";
import AIChatButton from "@/components/AIChatButton";
import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-5 font-heading text-xl font-bold text-foreground"
      >
        Analytics
      </motion.h1>
      <AnalyticsCharts />
      <AIChatButton />
    </div>
  );
}
