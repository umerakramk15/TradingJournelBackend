import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  RefreshCw,
  AlertTriangle,
  Calendar,
  CalendarDays,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const v = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const PIE_COLORS = ["#00C853", "#FF3D57", "#546E7A"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: v("--bg-secondary"),
        border: `1px solid ${v("--border")}`,
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "0.8rem",
      }}
    >
      <p style={{ color: v("--text-muted"), marginBottom: "4px" }}>{label}</p>
      <p
        style={{
          color: payload[0].value >= 0 ? v("--profit") : v("--loss"),
          fontWeight: 600,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {payload[0].value >= 0 ? "+" : ""}${payload[0].value?.toFixed(2)}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/analytics/dashboard",
      );
      setData(response.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              width: "36px",
              height: "36px",
              border: `2px solid ${v("--accent")}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: v("--text-muted"), fontSize: "0.875rem" }}>
            Loading dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "5rem 1rem" }}
      >
        <Activity
          size={48}
          style={{ color: v("--text-muted"), margin: "0 auto 1rem" }}
        />
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: v("--text-primary"),
            marginBottom: "0.5rem",
          }}
        >
          No Data Yet
        </h2>
        <p
          style={{
            color: v("--text-muted"),
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          Add your first trade to see performance analytics.
        </p>
        <Link to="/add-trade">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={15} /> Add First Trade
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  const statCards = [
    {
      label: "Today's P&L",
      value: `${data.todayPnL >= 0 ? "+" : "-"}$${Math.abs(data.todayPnL).toFixed(2)}`,
      sub: `${data.todayPnLPercent?.toFixed(2)}%`,
      type: data.todayPnL >= 0 ? "profit" : "loss",
      icon: DollarSign,
    },
    {
      label: "Weekly P&L",
      value: `${data.weeklyPnL >= 0 ? "+" : "-"}$${Math.abs(data.weeklyPnL).toFixed(2)}`,
      sub: "This week",
      type: data.weeklyPnL >= 0 ? "profit" : "loss",
      icon: Calendar,
    },
    {
      label: "Monthly P&L",
      value: `${data.monthlyPnL >= 0 ? "+" : "-"}$${Math.abs(data.monthlyPnL).toFixed(2)}`,
      sub: "This month",
      type: data.monthlyPnL >= 0 ? "profit" : "loss",
      icon: CalendarDays,
    },
    {
      label: "Win Rate",
      value: `${data.winRate}%`,
      sub: `${data.totalTrades} trades`,
      type: "accent",
      icon: Target,
    },
    {
      label: "Avg R:R",
      value: `1:${data.avgRR?.toFixed(1)}`,
      sub: "Risk/Reward",
      type: "neutral",
      icon: BarChart2,
    },
    {
      label: "Total Trades",
      value: data.totalTrades,
      sub: "All time",
      type: "neutral",
      icon: Activity,
    },
    {
      label: "Trades Today",
      value: `${data.tradesToday}/${data.maxTrades}`,
      sub: "Daily limit",
      type: data.tradesToday >= data.maxTrades ? "loss" : "neutral",
      icon: RefreshCw,
    },
  ];

  const typeStyles = {
    profit: {
      color: v("--profit"),
      bg: v("--profit-bg"),
      border: "rgba(0,200,83,0.2)",
    },
    loss: {
      color: v("--loss"),
      bg: v("--loss-bg"),
      border: "rgba(255,61,87,0.2)",
    },
    accent: {
      color: v("--accent-light"),
      bg: v("--accent-bg"),
      border: v("--accent-border"),
    },
    neutral: {
      color: v("--text-secondary"),
      bg: v("--bg-tertiary"),
      border: v("--border"),
    },
  };

  const riskPct = Math.min(
    (data.dailyRiskUsed / data.dailyRiskLimit) * 100,
    100,
  );
  const riskColor =
    data.dailyRiskUsed > data.dailyRiskLimit
      ? v("--loss")
      : data.dailyRiskUsed > data.dailyRiskLimit * 0.8
        ? "#F59E0B"
        : v("--accent");

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: v("--text-primary"),
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            color: v("--text-muted"),
            fontSize: "0.8rem",
            marginTop: "4px",
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={stagger}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const s = typeStyles[stat.type];
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -2 }}
              style={{
                background: v("--bg-secondary"),
                border: `1px solid ${v("--border")}`,
                borderRadius: "10px",
                padding: "1rem 1.1rem",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                {(stat.type === "profit" || stat.type === "loss") && (
                  <div style={{ color: s.color }}>
                    {stat.type === "profit" ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: "-0.02em",
                  marginBottom: "2px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: v("--text-muted"),
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
              {stat.sub && (
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: v("--text-muted"),
                    marginTop: "2px",
                    opacity: 0.7,
                  }}
                >
                  {stat.sub}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Risk Card */}
        <motion.div
          variants={fadeUp}
          custom={statCards.length}
          style={{
            background: v("--bg-secondary"),
            border: `1px solid ${data.dailyRiskUsed > data.dailyRiskLimit * 0.8 ? "rgba(255,61,87,0.3)" : v("--border")}`,
            borderRadius: "10px",
            padding: "1rem 1.1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: v("--loss-bg"),
                border: "1px solid rgba(255,61,87,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={14} style={{ color: v("--loss") }} />
            </div>
            {data.dailyRiskUsed > data.dailyRiskLimit * 0.8 && (
              <span
                style={{
                  fontSize: "0.65rem",
                  color: v("--loss"),
                  background: v("--loss-bg"),
                  border: "1px solid rgba(255,61,87,0.2)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontWeight: 600,
                }}
              >
                WARN
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: riskColor,
              marginBottom: "2px",
            }}
          >
            {data.dailyRiskUsed?.toFixed(2)}%
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: v("--text-muted"),
              marginBottom: "10px",
            }}
          >
            Daily Risk Used
          </div>
          <div
            style={{
              height: "4px",
              borderRadius: "9999px",
              background: v("--bg-tertiary"),
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: "9999px",
                background: riskColor,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
            }}
          >
            <span style={{ fontSize: "0.65rem", color: v("--text-muted") }}>
              {data.dailyRiskUsed?.toFixed(2)}% used
            </span>
            <span style={{ fontSize: "0.65rem", color: v("--text-muted") }}>
              {data.dailyRiskLimit}% max
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={stagger}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {/* P&L Area Chart */}
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{
            background: v("--bg-secondary"),
            border: `1px solid ${v("--border")}`,
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: v("--text-primary"),
                }}
              >
                P&L — Last 30 Days
              </h3>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: v("--text-muted"),
                  marginTop: "2px",
                }}
              >
                Cumulative performance
              </p>
            </div>
            <TrendingUp size={16} style={{ color: v("--accent-light") }} />
          </div>
          {data.pnlChartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={data.pnlChartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={v("--accent")}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={v("--accent")}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={v("--border")}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: v("--text-muted") }}
                  stroke="transparent"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: v("--text-muted") }}
                  stroke="transparent"
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke={v("--accent")}
                  strokeWidth={2}
                  fill="url(#pnlGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: v("--text-muted"), fontSize: "0.8rem" }}>
                No data yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Win/Loss Donut */}
        <motion.div
          variants={fadeUp}
          custom={1}
          style={{
            background: v("--bg-secondary"),
            border: `1px solid ${v("--border")}`,
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: v("--text-primary"),
                }}
              >
                Win / Loss Ratio
              </h3>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: v("--text-muted"),
                  marginTop: "2px",
                }}
              >
                Trade outcomes
              </p>
            </div>
            <Target size={16} style={{ color: v("--accent-light") }} />
          </div>
          {data.winLossData?.some((d) => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.winLossData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: v("--bg-secondary"),
                      border: `1px solid ${v("--border")}`,
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      color: v("--text-primary"),
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1.5rem",
                  marginTop: "0.75rem",
                }}
              >
                {[
                  {
                    color: "#00C853",
                    label: "Win",
                    value: data.winLossData[0]?.value || 0,
                  },
                  {
                    color: "#FF3D57",
                    label: "Loss",
                    value: data.winLossData[1]?.value || 0,
                  },
                  {
                    color: "#546E7A",
                    label: "BE",
                    value: data.winLossData[2]?.value || 0,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: item.color,
                      }}
                    />
                    <span
                      style={{ fontSize: "0.75rem", color: v("--text-muted") }}
                    >
                      {item.label}{" "}
                      <span
                        style={{
                          color: v("--text-primary"),
                          fontWeight: 600,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {item.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: v("--text-muted"), fontSize: "0.8rem" }}>
                No data yet
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Recent Trades */}
      <motion.div
        variants={fadeUp}
        custom={2}
        style={{
          background: v("--bg-secondary"),
          border: `1px solid ${v("--border")}`,
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={15} style={{ color: v("--accent-light") }} />
            <h3
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: v("--text-primary"),
              }}
            >
              Recent Trades
            </h3>
          </div>
          {data.recentTrades?.length > 0 && (
            <Link
              to="/history"
              style={{
                fontSize: "0.75rem",
                color: v("--accent-light"),
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View all <ArrowUpRight size={12} />
            </Link>
          )}
        </div>

        {data.recentTrades?.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Model</th>
                  <th>Direction</th>
                  <th>Result</th>
                  <th style={{ textAlign: "right" }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrades.map((trade, i) => (
                  <motion.tr
                    key={trade._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.78rem",
                        color: v("--text-muted"),
                      }}
                    >
                      {new Date(trade.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          color: v("--accent-light"),
                          background: v("--accent-bg"),
                          border: `1px solid ${v("--accent-border")}`,
                        }}
                      >
                        {trade.model}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color:
                            trade.direction === "Long"
                              ? v("--profit")
                              : v("--loss"),
                        }}
                      >
                        {trade.direction === "Long" ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {trade.direction}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          color:
                            trade.result === "Win"
                              ? v("--profit")
                              : trade.result === "Loss"
                                ? v("--loss")
                                : "#F59E0B",
                          background:
                            trade.result === "Win"
                              ? v("--profit-bg")
                              : trade.result === "Loss"
                                ? v("--loss-bg")
                                : "rgba(245,158,11,0.1)",
                          border: `1px solid ${trade.result === "Win" ? "rgba(0,200,83,0.2)" : trade.result === "Loss" ? "rgba(255,61,87,0.2)" : "rgba(245,158,11,0.2)"}`,
                        }}
                      >
                        {trade.result}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: trade.pnl >= 0 ? v("--profit") : v("--loss"),
                      }}
                    >
                      {trade.pnl >= 0 ? "+" : "-"}$
                      {Math.abs(trade.pnl).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <FileText
              size={36}
              style={{ color: v("--text-muted"), margin: "0 auto 0.75rem" }}
            />
            <p
              style={{
                color: v("--text-muted"),
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              No trades recorded yet
            </p>
            <Link to="/add-trade">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <Plus size={14} /> Add First Trade
              </motion.button>
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
