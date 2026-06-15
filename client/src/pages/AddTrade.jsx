import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

const INITIAL_CHECKLIST = {
  preTrade: [
    { id: 1, label: "HTF Bias Confirmed (Daily/4H)", checked: false },
    { id: 2, label: "No Major News in 30min", checked: false },
    { id: 3, label: "Session is Active (LON/NY)", checked: false },
    { id: 4, label: "Risk Within Daily Limit", checked: false },
  ],
  manipulation: [
    { id: 5, label: "Liquidity Sweep Detected", checked: false },
    { id: 6, label: "Stop Hunt Confirmed", checked: false },
    { id: 7, label: "Market Structure Shift", checked: false },
    { id: 8, label: "Inducement Taken Out", checked: false },
    { id: 9, label: "Displacement Occurred", checked: false },
  ],
  confirmation: [
    { id: 10, label: "FVG / Order Block Present", checked: false },
    { id: 11, label: "OB is Unmitigated", checked: false },
    { id: 12, label: "Entry in Discount/Premium Zone", checked: false },
    { id: 13, label: "Fibonacci Confluence", checked: false },
    { id: 14, label: "Killzone Entry Time", checked: false },
  ],
  entry: [
    { id: 15, label: "RR Ratio > 1:2", checked: false },
    { id: 16, label: "SL Behind Structure", checked: false },
    { id: 17, label: "TP at Liquidity Level", checked: false },
    { id: 18, label: "Position Size Calculated", checked: false },
  ],
};

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

export default function AddTrade() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fundingAccounts, setFundingAccounts] = useState([]);
  const [form, setForm] = useState({
    fundingAccountId: "",
    date: new Date().toISOString().slice(0, 16),
    session: "London Open",
    model: "Model1",
    tradeType: "Trend Trade",
    direction: "Long",
    entryPrice: "",
    slPrice: "",
    tpPrice: "",
    exitPrice: "",
    riskPercent: 0.3,
    emotionalState: "Calm",
    result: "",
    notes: "",
    lessonLearned: "",
    ruleBroken: false,
    whichRule: "",
    checklistItems: [],
    checklistScore: 0,
  });

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [calculated, setCalculated] = useState({
    slPips: 0,
    tpPips: 0,
    rrRatio: 0,
    lotSize: 0,
    riskAmount: 0,
    potentialProfit: 0,
    pnl: 0,
  });

  useEffect(() => {
    fetchFundingAccounts();
  }, []);

  const fetchFundingAccounts = async () => {
    try {
      const response = await api.get("/funding-accounts");
      const active = response.data.filter((a) => a.isActive);
      setFundingAccounts(active);
      if (active.length > 0) {
        setForm((prev) => ({ ...prev, fundingAccountId: active[0]._id }));
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  // Auto-calculate whenever prices change
  useEffect(() => {
    calculateMetrics();
  }, [
    form.entryPrice,
    form.slPrice,
    form.tpPrice,
    form.exitPrice,
    form.direction,
    form.riskPercent,
  ]);

  const calculateMetrics = () => {
    const entry = parseFloat(form.entryPrice);
    const sl = parseFloat(form.slPrice);
    const tp = parseFloat(form.tpPrice);
    const exit = parseFloat(form.exitPrice);

    if (!entry || !sl || !tp) return;

    // Calculate SL pips
    const slPips =
      form.direction === "Long" ? Math.abs(entry - sl) : Math.abs(sl - entry);

    // Calculate TP pips
    const tpPips =
      form.direction === "Long" ? Math.abs(tp - entry) : Math.abs(entry - tp);

    // Calculate RR ratio
    const rrRatio = slPips > 0 ? tpPips / slPips : 0;

    // Calculate lot size based on risk (simplified)
    const account = fundingAccounts.find(
      (a) => a._id === form.fundingAccountId,
    );
    const balance = account ? account.currentBalance : 10000;
    const riskAmount = (balance * form.riskPercent) / 100;
    const lotSize = slPips > 0 ? riskAmount / slPips : 0;

    // Calculate potential profit
    const potentialProfit = lotSize * tpPips;

    // Calculate actual P&L if exit price provided
    let pnl = 0;
    if (exit) {
      const exitPips = form.direction === "Long" ? exit - entry : entry - exit;
      pnl = lotSize * exitPips;
    }

    setCalculated({
      slPips: Math.round(slPips * 10) / 10,
      tpPips: Math.round(tpPips * 10) / 10,
      rrRatio: Math.round(rrRatio * 100) / 100,
      lotSize: Math.round(lotSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      pnl: Math.round(pnl * 100) / 100,
    });
  };

  // Calculate checklist score
  const calculateChecklistScore = (updatedChecklist) => {
    let score = 0;
    const items = [];

    Object.values(updatedChecklist).forEach((section) => {
      section.forEach((item) => {
        items.push({
          name: item.label,
          checked: item.checked,
          section: getSectionName(item.id),
        });
        if (item.checked) score++;
      });
    });

    setForm((prev) => ({
      ...prev,
      checklistScore: score,
      checklistItems: items,
    }));
  };

  const getSectionName = (id) => {
    if (id <= 4) return "Pre-Trade";
    if (id <= 9) return "Manipulation";
    if (id <= 14) return "Confirmation";
    return "Entry";
  };

  const handleChecklistChange = (section, itemId) => {
    const updated = { ...checklist };
    const item = updated[section].find((i) => i.id === itemId);
    if (item) item.checked = !item.checked;
    setChecklist(updated);
    calculateChecklistScore(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.entryPrice || !form.slPrice || !form.tpPrice) {
      toast.error("Entry, SL, and TP prices are required");
      return;
    }

    if (!form.result) {
      toast.error("Please select trade result");
      return;
    }

    setLoading(true);

    try {
      const tradeData = {
        ...form,
        entryPrice: parseFloat(form.entryPrice),
        slPrice: parseFloat(form.slPrice),
        tpPrice: parseFloat(form.tpPrice),
        exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : undefined,
        slPips: calculated.slPips,
        rrRatio: calculated.rrRatio,
        lotSize: calculated.lotSize,
        pnl: calculated.pnl,
      };

      await api.post("/trades", tradeData);
      toast.success("Trade added successfully!");
      navigate("/history");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add trade");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.entryPrice && form.slPrice && form.tpPrice && form.result;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">Add Trade</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Log your trade with complete details and checklist
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Trade Info */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Trade Details</h2>
            <span className="text-xs text-gray-500">Step 1 of 4</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Funding Account
              </label>
              <select
                value={form.fundingAccountId}
                onChange={(e) =>
                  setForm({ ...form, fundingAccountId: e.target.value })
                }
                className="input-field w-full"
              >
                {fundingAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Session
              </label>
              <select
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className="input-field w-full"
              >
                <option>London Open</option>
                <option>NY Open</option>
                <option>Asian</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Model</label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="input-field w-full"
              >
                <option value="Model1">Model 1 (1D/1H/5M)</option>
                <option value="Model2">Model 2 (4H/15M/1M)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Trade Type
              </label>
              <select
                value={form.tradeType}
                onChange={(e) =>
                  setForm({ ...form, tradeType: e.target.value })
                }
                className="input-field w-full"
              >
                <option>Trend Trade</option>
                <option>Counter Trend Trade</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Direction
              </label>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForm({ ...form, direction: "Long" })}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    form.direction === "Long"
                      ? "bg-profit text-white shadow-lg shadow-profit/25"
                      : "bg-dark-tertiary text-gray-400 hover:bg-dark-border"
                  }`}
                >
                  Long ↑
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForm({ ...form, direction: "Short" })}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    form.direction === "Short"
                      ? "bg-loss text-white shadow-lg shadow-loss/25"
                      : "bg-dark-tertiary text-gray-400 hover:bg-dark-border"
                  }`}
                >
                  Short ↓
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Price Inputs & Calculations */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Entry & Risk Management
            </h2>
            <span className="text-xs text-gray-500">Step 2 of 4</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Entry Price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.entryPrice}
                onChange={(e) =>
                  setForm({ ...form, entryPrice: e.target.value })
                }
                className="input-field w-full"
                placeholder="e.g. 2650.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.01"
                value={form.slPrice}
                onChange={(e) => setForm({ ...form, slPrice: e.target.value })}
                className="input-field w-full"
                placeholder="e.g. 2645.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Take Profit
              </label>
              <input
                type="number"
                step="0.01"
                value={form.tpPrice}
                onChange={(e) => setForm({ ...form, tpPrice: e.target.value })}
                className="input-field w-full"
                placeholder="e.g. 2660.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Exit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.exitPrice}
                onChange={(e) =>
                  setForm({ ...form, exitPrice: e.target.value })
                }
                className="input-field w-full"
                placeholder="e.g. 2660.00"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Risk %</label>
              <select
                value={form.riskPercent}
                onChange={(e) =>
                  setForm({ ...form, riskPercent: parseFloat(e.target.value) })
                }
                className="input-field w-full"
              >
                <option value={0.3}>0.3%</option>
                <option value={0.4}>0.4%</option>
                <option value={0.5}>0.5%</option>
              </select>
            </div>

            {/* Calculated Fields */}
            {[
              {
                label: "SL Distance",
                value: `${calculated.slPips} pips`,
                color: "text-white",
              },
              {
                label: "RR Ratio",
                value: `1:${calculated.rrRatio}`,
                color:
                  calculated.rrRatio >= 2 ? "text-profit" : "text-gray-400",
              },
              {
                label: "Lot Size",
                value: calculated.lotSize,
                color: "text-white",
              },
              {
                label: "Risk Amount",
                value: `$${calculated.riskAmount}`,
                color: "text-loss",
              },
              {
                label: "Potential Profit",
                value: `$${calculated.potentialProfit}`,
                color: "text-profit",
              },
            ].map((field, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-3"
              >
                <div className="text-xs text-gray-500">{field.label}</div>
                <div
                  className={`text-lg font-mono font-semibold ${field.color}`}
                >
                  {field.value}
                </div>
              </motion.div>
            ))}

            {calculated.pnl !== 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="glass-card p-3"
              >
                <div className="text-xs text-gray-500">Actual P&L</div>
                <div
                  className={`text-lg font-mono font-bold ${calculated.pnl >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {calculated.pnl >= 0 ? "+" : "-"}${Math.abs(calculated.pnl)}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Pre-Trade Checklist
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Step 3 of 4</span>
              <motion.span
                key={form.checklistScore}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className={`badge text-sm ${
                  form.checklistScore >= 15
                    ? "badge-profit"
                    : form.checklistScore >= 10
                      ? "badge-gold"
                      : "badge-loss"
                }`}
              >
                Score: {form.checklistScore}/18
              </motion.span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre-Trade Section */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gold mb-3 flex items-center space-x-2">
                <span>📋</span>
                <span>Pre-Trade (4)</span>
              </h3>
              <div className="space-y-2">
                {checklist.preTrade.map((item) => (
                  <motion.label
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        handleChecklistChange("preTrade", item.id)
                      }
                      className="w-4 h-4 rounded border-dark-border bg-dark-tertiary text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        item.checked
                          ? "text-gray-200"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Manipulation Section */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gold mb-3 flex items-center space-x-2">
                <span>🔄</span>
                <span>Manipulation (5)</span>
              </h3>
              <div className="space-y-2">
                {checklist.manipulation.map((item) => (
                  <motion.label
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        handleChecklistChange("manipulation", item.id)
                      }
                      className="w-4 h-4 rounded border-dark-border bg-dark-tertiary text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        item.checked
                          ? "text-gray-200"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gold mb-3 flex items-center space-x-2">
                <span>✅</span>
                <span>Confirmation (5)</span>
              </h3>
              <div className="space-y-2">
                {checklist.confirmation.map((item) => (
                  <motion.label
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        handleChecklistChange("confirmation", item.id)
                      }
                      className="w-4 h-4 rounded border-dark-border bg-dark-tertiary text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        item.checked
                          ? "text-gray-200"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Entry Section */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gold mb-3 flex items-center space-x-2">
                <span>🎯</span>
                <span>Entry (4)</span>
              </h3>
              <div className="space-y-2">
                {checklist.entry.map((item) => (
                  <motion.label
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleChecklistChange("entry", item.id)}
                      className="w-4 h-4 rounded border-dark-border bg-dark-tertiary text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        item.checked
                          ? "text-gray-200"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result & Psychology */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Result & Psychology
            </h2>
            <span className="text-xs text-gray-500">Step 4 of 4</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Result</label>
              <div className="flex gap-2">
                {["Win", "Loss", "Breakeven"].map((result) => (
                  <motion.button
                    key={result}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setForm({ ...form, result })}
                    className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                      form.result === result
                        ? result === "Win"
                          ? "bg-profit text-white shadow-lg shadow-profit/25"
                          : result === "Loss"
                            ? "bg-loss text-white shadow-lg shadow-loss/25"
                            : "bg-neutral text-white shadow-lg shadow-neutral/25"
                        : "bg-dark-tertiary text-gray-400 hover:bg-dark-border"
                    }`}
                  >
                    {result}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Emotional State
              </label>
              <select
                value={form.emotionalState}
                onChange={(e) =>
                  setForm({ ...form, emotionalState: e.target.value })
                }
                className="input-field w-full"
              >
                <option>Calm</option>
                <option>Focused</option>
                <option>Anxious</option>
                <option>FOMO</option>
                <option>Revenge</option>
                <option>Overconfident</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field w-full"
                rows={3}
                placeholder="Trade notes, setup details, what you saw..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Lesson Learned
              </label>
              <textarea
                value={form.lessonLearned}
                onChange={(e) =>
                  setForm({ ...form, lessonLearned: e.target.value })
                }
                className="input-field w-full"
                rows={2}
                placeholder="What did you learn from this trade?"
              />
            </div>

            <div>
              <motion.label
                whileHover={{ x: 5 }}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={form.ruleBroken}
                  onChange={(e) =>
                    setForm({ ...form, ruleBroken: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-dark-border bg-dark-tertiary text-loss focus:ring-loss focus:ring-offset-0"
                />
                <span
                  className={`text-sm transition-colors ${
                    form.ruleBroken
                      ? "text-loss"
                      : "text-gray-300 group-hover:text-gray-200"
                  }`}
                >
                  Rule Broken?
                </span>
              </motion.label>
            </div>

            {form.ruleBroken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-gray-400 mb-2">
                  Which Rule?
                </label>
                <select
                  value={form.whichRule}
                  onChange={(e) =>
                    setForm({ ...form, whichRule: e.target.value })
                  }
                  className="input-field w-full"
                >
                  <option value="">Select rule...</option>
                  <option>Rule 1: Never risk more than 2%</option>
                  <option>Rule 2: Always use stop loss</option>
                  <option>Rule 3: No trading during news</option>
                  <option>Rule 4: Wait for confirmation</option>
                  <option>Rule 5: Don't chase price</option>
                </select>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <motion.button
            type="submit"
            disabled={loading || !isFormValid}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            className={`btn-primary flex-1 ${
              !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full"
                ></motion.div>
                <span>Saving...</span>
              </span>
            ) : (
              "Save Trade"
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigate("/history")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Cancel
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
