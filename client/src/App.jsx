import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { motion } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import TradeHistory from "./pages/TradeHistory";
import Analytics from "./pages/Analytics";
import Rules from "./pages/Rules";
import Checklist from "./pages/Checklist";
import Settings from "./pages/Settings";
import FundingAccounts from "./pages/FundingAccounts";
import FundingAccountDetail from "./pages/FundingAccountDetail";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen bg-grid flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ color: "var(--text-secondary)" }}
            className="text-lg"
          >
            Loading your trading journal...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" />}
      />

      {/* Protected */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-trade" element={<AddTrade />} />
        <Route path="history" element={<TradeHistory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="rules" element={<Rules />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="settings" element={<Settings />} />
        <Route path="funding-accounts" element={<FundingAccounts />} />
        <Route path="funding-accounts/:id" element={<FundingAccountDetail />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
