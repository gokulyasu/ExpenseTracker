import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { SubcategoryProvider } from "@/contexts/SubcategoryContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AddTransaction from "@/pages/AddTransaction";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SubcategoryProvider>
            <TransactionProvider>
              <BudgetProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddTransaction />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BudgetProvider>
            </TransactionProvider>
          </SubcategoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
