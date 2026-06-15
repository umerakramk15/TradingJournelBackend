import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export default function FundingAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/funding-accounts",
      );
      setAccounts(response.data);
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  // Summary statistics
  const summary = accounts.reduce(
    (acc, account) => {
      if (account.isActive) {
        acc.active++;
        if (account.phase === "Funded") acc.funded++;
        if (
          account.phase.includes("Challenge") ||
          account.phase.includes("Phase")
        )
          acc.challenge++;
        acc.totalBalance += account.currentBalance || 0;
        acc.totalStarting += account.startingBalance || 0;
      } else {
        acc.breached++;
      }
      return acc;
    },
    {
      active: 0,
      funded: 0,
      challenge: 0,
      breached: 0,
      totalBalance: 0,
      totalStarting: 0,
    },
  );

  const totalProfit = summary.totalBalance - summary.totalStarting;
  const totalProfitPercent =
    summary.totalStarting > 0
      ? ((totalProfit / summary.totalStarting) * 100).toFixed(2)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Funding Accounts</span>
          </h1>
          <p className="text-gray-400 mt-2">Manage your prop firm challenges</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          + Add Account
        </motion.button>
      </motion.div>

      {/* Summary Stats */}
      {accounts.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Active Accounts",
              value: summary.active,
              icon: "💼",
              color: "text-white",
            },
            {
              label: "Funded",
              value: summary.funded,
              icon: "✅",
              color: "text-profit",
            },
            {
              label: "In Challenge",
              value: summary.challenge,
              icon: "🎯",
              color: "text-gold",
            },
            {
              label: "Total P&L",
              value: `${totalProfit >= 0 ? "+" : "-"}$${Math.abs(totalProfit).toLocaleString()}`,
              icon: totalProfit >= 0 ? "📈" : "📉",
              color: totalProfit >= 0 ? "text-profit" : "text-loss",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Account Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <CreateAccountForm
              onClose={() => setShowCreate(false)}
              onCreated={() => {
                setShowCreate(false);
                fetchAccounts();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts Grid or Empty State */}
      {accounts.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="text-6xl mb-6">🏦</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            No Funding Accounts
          </h2>
          <p className="text-gray-400 mb-8">
            Add your first prop firm challenge to start tracking your progress
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            + Add Your First Account
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {accounts.map((account, index) => (
            <motion.div key={account._id} variants={cardVariants} layout>
              <AccountCard
                account={account}
                onClick={() => navigate(`/funding-accounts/${account._id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function AccountCard({ account, onClick }) {
  const profitPercent =
    ((account.currentBalance - account.startingBalance) /
      account.startingBalance) *
    100;
  const isPassed = profitPercent >= account.profitTarget;
  const isActive = account.isActive;

  // Calculate daily loss (example - you can fetch actual data)
  const dailyLossUsed = 0; // This should come from actual trade data
  const dailyLossPercent = (dailyLossUsed / account.maxDailyLoss) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`glass-card p-6 cursor-pointer relative overflow-hidden group ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {account.company}
          </div>
          <h3 className="text-xl font-bold text-white">
            ${account.accountSize.toLocaleString()}
          </h3>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            account.phase === "Funded"
              ? "border-profit/20 text-profit bg-profit/10"
              : account.phase === "Challenge" || account.phase.includes("Phase")
                ? "border-gold/20 text-gold bg-gold/10"
                : "border-gray-500/20 text-gray-400 bg-gray-500/10"
          }`}
        >
          {account.phase}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 relative z-10">
        {/* Balance */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Balance</span>
            <span className="text-white font-mono font-semibold">
              ${account.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Profit Target */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Profit Target ({account.profitTarget}%)
            </span>
            <span
              className={`font-mono font-semibold ${
                profitPercent >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {profitPercent.toFixed(2)}%
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(Math.abs(profitPercent / account.profitTarget) * 100, 100)}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                profitPercent >= account.profitTarget
                  ? "bg-gradient-to-r from-profit to-green-400"
                  : "bg-gradient-to-r from-gold-dark to-gold"
              }`}
            />
          </div>
        </div>

        {/* Daily Loss Limit */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Daily Loss Limit ({account.maxDailyLoss}%)
            </span>
            <span
              className={`font-mono text-sm ${
                dailyLossPercent > 80 ? "text-loss" : "text-gray-500"
              }`}
            >
              {dailyLossUsed.toFixed(1)}% used
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyLossPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                dailyLossPercent > 80
                  ? "bg-gradient-to-r from-loss to-red-400"
                  : "bg-gradient-to-r from-gray-500 to-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Breached Warning */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-loss/10 border border-loss/30 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">❌</span>
              <div>
                <p className="text-loss font-semibold text-sm">
                  Account Breached
                </p>
                <p className="text-loss/80 text-xs mt-1">
                  {account.breachReason || "Daily loss limit exceeded"}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(account.breachDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Target Achieved */}
        {isPassed && account.phase !== "Funded" && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-profit/10 border border-profit/30 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-profit font-semibold text-sm">
                  Target Achieved!
                </p>
                <p className="text-profit/80 text-xs mt-1">
                  Ready for next phase
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-gold text-sm">View Details →</span>
      </div>
    </motion.div>
  );
}

function CreateAccountForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    company: "FTMO",
    accountSize: 10000,
    phase: "Challenge",
  });
  const [loading, setLoading] = useState(false);

  const companies = [
    "FTMO",
    "The Funded Trader",
    "FundedNext",
    "Maven",
    "E8 Funding",
    "Other",
  ];
  const sizes = [5000, 10000, 25000, 50000, 100000, 200000];
  const phases = ["Challenge", "Phase 1", "Phase 2", "Funded"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/funding-accounts", form);
      toast.success("Account created successfully!");
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">New Funding Account</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2"
        >
          ✕
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company</label>
            <select
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="input-field w-full"
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Account Size
            </label>
            <select
              value={form.accountSize}
              onChange={(e) =>
                setForm({ ...form, accountSize: Number(e.target.value) })
              }
              className="input-field w-full"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  ${s.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Phase</label>
            <select
              value={form.phase}
              onChange={(e) => setForm({ ...form, phase: e.target.value })}
              className="input-field w-full"
            >
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full"
                ></motion.div>
                <span>Creating...</span>
              </span>
            ) : (
              "Create Account"
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
