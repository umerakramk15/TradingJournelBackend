import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTrades: 0,
  });
  const [filters, setFilters] = useState({
    model: "",
    direction: "",
    result: "",
    session: "",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [filters, pagination.currentPage]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", pagination.currentPage);
      params.append("limit", 20);

      const response = await api.get(`/trades?${params}`);
      setTrades(response.data.trades);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get("/trades/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `trades-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const deleteTrade = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this trade? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/trades/${id}`);
      toast.success("Trade deleted successfully");
      setSelectedTrade(null);
      fetchTrades();
    } catch (error) {
      toast.error("Failed to delete trade");
    }
  };

  const clearFilters = () => {
    setFilters({
      model: "",
      direction: "",
      result: "",
      session: "",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== "date" && v !== "desc",
  );

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

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Trade History</span>
          </h1>
          <p className="text-gray-400 mt-2">
            {pagination.totalTrades} total trades recorded
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>{showFilters ? "🔍" : "🔎"}</span>
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold rounded-full"></span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Filter Trades
              </h3>
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="text-sm text-gold hover:text-gold-light transition-colors"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Model
                </label>
                <select
                  value={filters.model}
                  onChange={(e) =>
                    setFilters({ ...filters, model: e.target.value })
                  }
                  className="input-field w-full text-sm"
                >
                  <option value="">All Models</option>
                  <option value="Model1">Model 1</option>
                  <option value="Model2">Model 2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Direction
                </label>
                <select
                  value={filters.direction}
                  onChange={(e) =>
                    setFilters({ ...filters, direction: e.target.value })
                  }
                  className="input-field w-full text-sm"
                >
                  <option value="">All Directions</option>
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Result
                </label>
                <select
                  value={filters.result}
                  onChange={(e) =>
                    setFilters({ ...filters, result: e.target.value })
                  }
                  className="input-field w-full text-sm"
                >
                  <option value="">All Results</option>
                  <option value="Win">Win</option>
                  <option value="Loss">Loss</option>
                  <option value="Breakeven">Breakeven</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Session
                </label>
                <select
                  value={filters.session}
                  onChange={(e) =>
                    setFilters({ ...filters, session: e.target.value })
                  }
                  className="input-field w-full text-sm"
                >
                  <option value="">All Sessions</option>
                  <option>London Open</option>
                  <option>NY Open</option>
                  <option>Asian</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="input-field w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="input-field w-full text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trades Table */}
      <motion.div
        variants={itemVariants}
        className="glass-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full"
            ></motion.div>
          </div>
        ) : trades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">
              {hasActiveFilters ? "No Trades Match Filters" : "No Trades Yet"}
            </h3>
            <p className="text-gray-400 mb-8">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Start building your trading journal by adding your first trade"}
            </p>
            {hasActiveFilters ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </motion.button>
            ) : (
              <Link to="/add-trade">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  + Add Your First Trade
                </motion.button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-glass w-full">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:text-white transition-colors"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        sortBy: "date",
                        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {filters.sortBy === "date" && (
                        <span>{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th>Session</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Direction</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Exit</th>
                  <th className="text-right">R:R</th>
                  <th className="text-center">Score</th>
                  <th>Emotion</th>
                  <th>Result</th>
                  <th className="text-right">P&L</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {trades.map((trade, index) => (
                    <motion.tr
                      key={trade._id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedTrade(trade)}
                      className="cursor-pointer"
                    >
                      <td className="text-gray-300 whitespace-nowrap">
                        {new Date(trade.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className="text-xs bg-dark-tertiary/50 px-2 py-1 rounded-full text-gray-400">
                          {trade.session}
                        </span>
                      </td>
                      <td>
                        <span className="badge-gold">{trade.model}</span>
                      </td>
                      <td className="text-xs text-gray-400">
                        {trade.tradeType}
                      </td>
                      <td>
                        <span
                          className={`font-semibold ${
                            trade.direction === "Long"
                              ? "text-profit"
                              : "text-loss"
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </td>
                      <td className="text-right font-mono text-gray-300">
                        {trade.entryPrice?.toFixed(2)}
                      </td>
                      <td className="text-right font-mono text-gray-300">
                        {trade.exitPrice?.toFixed(2) || "-"}
                      </td>
                      <td className="text-right font-mono">
                        <span
                          className={
                            trade.rrRatio >= 2 ? "text-profit" : "text-gray-400"
                          }
                        >
                          1:{trade.rrRatio?.toFixed(1) || "0"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            trade.checklistScore >= 15
                              ? "bg-profit/10 text-profit border border-profit/20"
                              : trade.checklistScore >= 10
                                ? "bg-gold/10 text-gold border border-gold/20"
                                : "bg-loss/10 text-loss border border-loss/20"
                          }`}
                        >
                          {trade.checklistScore}/18
                        </span>
                      </td>
                      <td className="text-xs text-gray-400">
                        {trade.emotionalState}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            trade.result === "Win"
                              ? "border-profit/20 text-profit bg-profit/10"
                              : trade.result === "Loss"
                                ? "border-loss/20 text-loss bg-loss/10"
                                : "border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
                          }`}
                        >
                          {trade.result}
                        </span>
                      </td>
                      <td
                        className={`text-right font-mono font-semibold ${
                          (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                        }`}
                      >
                        {(trade.pnl || 0) >= 0 ? "+" : "-"}$
                        {Math.abs(trade.pnl || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrade(trade._id);
                          }}
                          className="text-gray-500 hover:text-loss transition-colors p-2"
                        >
                          🗑️
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setPagination({
                ...pagination,
                currentPage: pagination.currentPage - 1,
              })
            }
            disabled={pagination.currentPage === 1}
            className={`btn-secondary text-sm ${
              pagination.currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            ← Previous
          </motion.button>

          <div className="flex items-center space-x-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setPagination({ ...pagination, currentPage: i + 1 })
                }
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  pagination.currentPage === i + 1
                    ? "bg-gold text-dark"
                    : "text-gray-400 hover:bg-dark-tertiary"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1,
              })
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className={`btn-secondary text-sm ${
              pagination.currentPage === pagination.totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Next →
          </motion.button>
        </motion.div>
      )}

      {/* Trade Detail Modal */}
      <AnimatePresence>
        {selectedTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedTrade(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-dark-secondary/95 backdrop-blur-xl border-b border-dark-border p-6 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Trade Details
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(selectedTrade.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTrade(null)}
                  className="text-gray-400 hover:text-white text-2xl p-2"
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Session",
                      value: selectedTrade.session,
                      color: "text-white",
                    },
                    {
                      label: "Model",
                      value: selectedTrade.model,
                      color: "text-gold",
                    },
                    {
                      label: "Direction",
                      value: selectedTrade.direction,
                      color:
                        selectedTrade.direction === "Long"
                          ? "text-profit"
                          : "text-loss",
                    },
                    {
                      label: "Trade Type",
                      value: selectedTrade.tradeType,
                      color: "text-white",
                    },
                    {
                      label: "Result",
                      value: selectedTrade.result,
                      color:
                        selectedTrade.result === "Win"
                          ? "text-profit"
                          : selectedTrade.result === "Loss"
                            ? "text-loss"
                            : "text-yellow-500",
                    },
                    {
                      label: "Checklist Score",
                      value: `${selectedTrade.checklistScore}/18`,
                      color:
                        selectedTrade.checklistScore >= 15
                          ? "text-profit"
                          : selectedTrade.checklistScore >= 10
                            ? "text-gold"
                            : "text-loss",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-3"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {item.label}
                      </div>
                      <div className={`font-semibold ${item.color}`}>
                        {item.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Price Details */}
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Price Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Entry",
                        value: selectedTrade.entryPrice,
                        color: "text-white",
                      },
                      {
                        label: "Stop Loss",
                        value: selectedTrade.slPrice,
                        color: "text-loss",
                      },
                      {
                        label: "Take Profit",
                        value: selectedTrade.tpPrice,
                        color: "text-profit",
                      },
                      {
                        label: "Exit",
                        value: selectedTrade.exitPrice || "N/A",
                        color: "text-white",
                      },
                      {
                        label: "SL Pips",
                        value: selectedTrade.slPips,
                        color: "text-white",
                      },
                      {
                        label: "R:R Ratio",
                        value: `1:${selectedTrade.rrRatio}`,
                        color: "text-white",
                      },
                      {
                        label: "Lot Size",
                        value: selectedTrade.lotSize,
                        color: "text-white",
                      },
                      {
                        label: "P&L",
                        value: `${(selectedTrade.pnl || 0) >= 0 ? "+" : "-"}$${Math.abs(selectedTrade.pnl || 0).toFixed(2)}`,
                        color:
                          (selectedTrade.pnl || 0) >= 0
                            ? "text-profit"
                            : "text-loss",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-dark-tertiary/50 rounded-lg p-3"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {item.label}
                        </div>
                        <div
                          className={`font-mono font-semibold ${item.color}`}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist */}
                {selectedTrade.checklistItems?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Checklist Items
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTrade.checklistItems.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            item.checked ? "bg-profit/5" : "bg-loss/5"
                          }`}
                        >
                          <span>{item.checked ? "✅" : "❌"}</span>
                          <span
                            className={`text-sm ${
                              item.checked ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {item.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                {selectedTrade.notes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Notes
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {selectedTrade.notes}
                    </p>
                  </motion.div>
                )}

                {/* Lesson Learned */}
                {selectedTrade.lessonLearned && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-semibold text-gold mb-2">
                      💡 Lesson Learned
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {selectedTrade.lessonLearned}
                    </p>
                  </motion.div>
                )}

                {/* Rule Broken Warning */}
                {selectedTrade.ruleBroken && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-loss/10 border border-loss/30 rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="text-loss font-semibold">Rule Broken</p>
                        <p className="text-loss/80 text-sm mt-1">
                          {selectedTrade.whichRule}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Emotional State */}
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    🧠 Emotional State
                  </h4>
                  <span className="badge-gold text-sm">
                    {selectedTrade.emotionalState}
                  </span>
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteTrade(selectedTrade._id)}
                  className="w-full bg-loss/10 hover:bg-loss/20 text-loss border border-loss/30 
                           font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  🗑️ Delete Trade
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
