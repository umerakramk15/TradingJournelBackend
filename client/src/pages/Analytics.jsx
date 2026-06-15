import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const COLORS = [
  "#D4AF37",
  "#10B981",
  "#EF4444",
  "#6B7280",
  "#8B5CF6",
  "#F59E0B",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export default function Analytics() {
  const [data, setData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "daily") {
      fetchDailyData();
    }
  }, [selectedMonth, selectedYear, activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [perfRes, monthlyRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/performance`, config),
        axios.get(`${API_URL}/analytics/monthly`, config),
      ]);
      setData(perfRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get(
        `${API_URL}/analytics/daily?month=${selectedMonth + 1}&year=${selectedYear}`,
        config,
      );
      setDailyData(response.data);
    } catch (error) {
      console.error("Daily analytics error:", error);
      toast.error("Failed to load daily data");
    }
  };

  // Generate calendar days for the selected month
  const generateMonthDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = dailyData[dateStr] || null;
      days.push({
        day,
        date: dateStr,
        data: dayData,
      });
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "daily", label: "Daily View", icon: "📅" },
    { id: "monthly", label: "Monthly", icon: "📈" },
    { id: "models", label: "Models", icon: "🎯" },
    { id: "psychology", label: "Psychology", icon: "🧠" },
  ];

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

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-2xl font-bold text-white mb-3">No Analytics Yet</h2>
        <p className="text-gray-400">
          Add some trades to see your performance analytics
        </p>
      </motion.div>
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
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Deep dive into your trading performance
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-1.5 flex gap-1 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-gold-dark to-gold text-dark shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-dark-tertiary"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && <OverviewTab data={data} />}

          {activeTab === "daily" && (
            <DailyViewTab
              dailyData={dailyData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedYear={setSelectedYear}
              monthNames={monthNames}
              dayNames={dayNames}
              generateMonthDays={generateMonthDays}
            />
          )}

          {activeTab === "monthly" && <MonthlyTab monthlyData={monthlyData} />}

          {activeTab === "models" && <ModelsTab data={data} />}

          {activeTab === "psychology" && <PsychologyTab data={data} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Overview Tab Component
function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Win Rate by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(data.modelPerformance).map(([name, d]) => ({
              name,
              winRate: d.winRate,
              trades: d.total,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                background: "rgba(26, 26, 26, 0.95)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
              }}
            />
            <Bar dataKey="winRate" fill="#D4AF37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Win Rate by Direction
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(data.directionPerformance).map(
                  ([name, d]) => ({
                    name,
                    value: d.wins,
                  }),
                )}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {Object.keys(data.directionPerformance).map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(26, 26, 26, 0.95)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Win Rate by Session
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={Object.entries(data.sessionPerformance).map(
                ([name, d]) => ({
                  name,
                  winRate: d.winRate,
                  trades: d.total,
                }),
              )}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  background: "rgba(26, 26, 26, 0.95)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="winRate" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

// Daily View Tab Component
function DailyViewTab({
  dailyData,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  monthNames,
  dayNames,
  generateMonthDays,
}) {
  const days = generateMonthDays();

  // Calculate monthly stats
  const monthlyStats = Object.values(dailyData).reduce(
    (acc, day) => {
      acc.totalTrades += day.trades || 0;
      acc.totalPnL += day.pnl || 0;
      acc.wins += day.wins || 0;
      acc.losses += day.losses || 0;
      acc.winningDays += (day.pnl || 0) > 0 ? 1 : 0;
      acc.losingDays += (day.pnl || 0) < 0 ? 1 : 0;
      return acc;
    },
    {
      totalTrades: 0,
      totalPnL: 0,
      wins: 0,
      losses: 0,
      winningDays: 0,
      losingDays: 0,
    },
  );

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation & Summary */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeMonth("prev")}
            className="p-2 rounded-lg hover:bg-dark-tertiary transition-colors text-gray-400 hover:text-white"
          >
            ←
          </motion.button>
          <h2 className="text-2xl font-bold gradient-text">
            {monthNames[selectedMonth]} {selectedYear}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeMonth("next")}
            className="p-2 rounded-lg hover:bg-dark-tertiary transition-colors text-gray-400 hover:text-white"
          >
            →
          </motion.button>
        </div>

        {/* Monthly Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Trades",
              value: monthlyStats.totalTrades,
              color: "text-white",
              icon: "📊",
            },
            {
              label: "Monthly P&L",
              value: `${monthlyStats.totalPnL >= 0 ? "+" : "-"}$${Math.abs(monthlyStats.totalPnL).toFixed(2)}`,
              color: monthlyStats.totalPnL >= 0 ? "text-profit" : "text-loss",
              icon: monthlyStats.totalPnL >= 0 ? "📈" : "📉",
            },
            {
              label: "Winning Days",
              value: monthlyStats.winningDays,
              color: "text-profit",
              icon: "✅",
            },
            {
              label: "Losing Days",
              value: monthlyStats.losingDays,
              color: "text-loss",
              icon: "❌",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Calendar Grid */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              className={`
                aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                transition-all duration-200 cursor-pointer relative
                ${!day ? "opacity-0" : ""}
                ${
                  day?.data
                    ? (day.data.pnl || 0) > 0
                      ? "bg-profit/10 border border-profit/20 hover:bg-profit/20"
                      : (day.data.pnl || 0) < 0
                        ? "bg-loss/10 border border-loss/20 hover:bg-loss/20"
                        : "bg-dark-tertiary/50 border border-dark-border hover:bg-dark-tertiary"
                    : "bg-dark-tertiary/30 border border-dark-border hover:bg-dark-tertiary"
                }
              `}
            >
              {day && (
                <>
                  <span className="text-sm font-medium text-gray-300">
                    {day.day}
                  </span>
                  {day.data && (
                    <div className="mt-1 space-y-0.5">
                      <div className="text-xs font-mono text-gray-400">
                        {day.data.trades}T
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold ${
                          (day.data.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                        }`}
                      >
                        {(day.data.pnl || 0) >= 0 ? "+" : ""}
                        {Math.abs(day.data.pnl || 0).toFixed(0)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-dark-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-profit/20 border border-profit/20"></div>
            <span className="text-xs text-gray-400">Profit Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-loss/20 border border-loss/20"></div>
            <span className="text-xs text-gray-400">Loss Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-dark-tertiary/50 border border-dark-border"></div>
            <span className="text-xs text-gray-400">No Trades</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Monthly Tab Component
function MonthlyTab({ monthlyData }) {
  return (
    <motion.div variants={itemVariants} className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Monthly P&L Performance
      </h3>
      {monthlyData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                background: "rgba(26, 26, 26, 0.95)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "12px",
              }}
            />
            <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#10B981" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center py-12">No monthly data yet</p>
      )}
    </motion.div>
  );
}

// Models Tab Component
function ModelsTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(data.modelPerformance).map(([model, stats], index) => (
          <motion.div
            key={model}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full"></div>
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">
              {model}
            </h3>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-2">
                <div className="text-3xl font-bold gradient-text">
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-profit">
                  {stats.wins}
                </div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-loss">
                  {stats.total - stats.wins}
                </div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Psychology Tab Component
function PsychologyTab({ data }) {
  return (
    <motion.div variants={itemVariants} className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Win Rate by Emotional State
      </h3>
      {Object.keys(data.emotionPerformance).length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={Object.entries(data.emotionPerformance).map(([name, d]) => ({
              name,
              winRate: d.winRate,
              trades: d.total,
            }))}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#9CA3AF"
              width={120}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(26, 26, 26, 0.95)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "12px",
              }}
            />
            <Bar dataKey="winRate" fill="#F59E0B" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-400">
            Track emotions in your trades to see this data
          </p>
        </div>
      )}
    </motion.div>
  );
}
