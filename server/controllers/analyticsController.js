import Trade from "../models/Trade.js";
import User from "../models/User.js";

// Dashboard analytics
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's trades
    const todayTrades = await Trade.find({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    const todayPnL = todayTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0,
    );
    const todayPnLPercent =
      user.accountBalance > 0 ? (todayPnL / user.accountBalance) * 100 : 0;

    // Weekly P&L
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyTrades = await Trade.find({
      userId: req.user.id,
      date: { $gte: weekStart, $lt: tomorrow },
    });
    const weeklyPnL = weeklyTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0,
    );

    // Monthly P&L
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyTrades = await Trade.find({
      userId: req.user.id,
      date: { $gte: monthStart, $lt: tomorrow },
    });
    const monthlyPnL = monthlyTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0,
    );

    // Win rate
    const allTrades = await Trade.find({ userId: req.user.id });
    const wins = allTrades.filter((t) => t.result === "Win").length;
    const totalTrades = allTrades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    // Average RR
    const avgRR =
      totalTrades > 0
        ? allTrades.reduce((sum, t) => sum + (t.rrRatio || 0), 0) / totalTrades
        : 0;

    // Last 30 days P&L for chart
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysTrades = await Trade.find({
      userId: req.user.id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    const pnlByDay = {};
    last30DaysTrades.forEach((trade) => {
      const day = trade.date.toISOString().split("T")[0];
      pnlByDay[day] = (pnlByDay[day] || 0) + (trade.pnl || 0);
    });

    const pnlChartData = Object.entries(pnlByDay).map(([date, pnl]) => ({
      date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    // Win/Loss pie data
    const losses = allTrades.filter((t) => t.result === "Loss").length;
    const breakevens = allTrades.filter((t) => t.result === "Breakeven").length;

    // Recent trades
    const recentTrades = await Trade.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Current streak
    let currentStreak = 0;
    let streakType = null;
    const sortedTrades = allTrades.sort((a, b) => b.date - a.date);

    for (const trade of sortedTrades) {
      if (
        trade.result === "Win" &&
        (streakType === "win" || streakType === null)
      ) {
        currentStreak++;
        streakType = "win";
      } else if (
        trade.result === "Loss" &&
        (streakType === "loss" || streakType === null)
      ) {
        currentStreak++;
        streakType = "loss";
      } else {
        break;
      }
    }

    res.json({
      todayPnL,
      todayPnLPercent,
      weeklyPnL,
      monthlyPnL,
      winRate: Math.round(winRate * 100) / 100,
      avgRR: Math.round(avgRR * 100) / 100,
      totalTrades,
      tradesToday: todayTrades.length,
      maxTrades: user.maxTradesPerDay,
      dailyRiskUsed: Math.abs(todayPnLPercent),
      dailyRiskLimit: user.maxDailyRisk,
      pnlChartData,
      winLossData: [
        { name: "Wins", value: wins },
        { name: "Losses", value: losses },
        { name: "Breakeven", value: breakevens },
      ],
      recentTrades,
      currentStreak:
        currentStreak > 0 ? { type: streakType, count: currentStreak } : null,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard analytics" });
  }
};

// Monthly analytics
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ date: 1 });

    const monthlyData = {};
    trades.forEach((trade) => {
      const monthKey = `${trade.date.getFullYear()}-${String(trade.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          pnl: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        };
      }
      monthlyData[monthKey].pnl += trade.pnl || 0;
      monthlyData[monthKey].trades++;
      if (trade.result === "Win") monthlyData[monthKey].wins++;
      if (trade.result === "Loss") monthlyData[monthKey].losses++;
    });

    res.json(Object.values(monthlyData));
  } catch (error) {
    console.error("Monthly analytics error:", error);
    res.status(500).json({ error: "Failed to fetch monthly analytics" });
  }
};

// Performance analytics
export const getPerformance = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id });

    const modelPerformance = {
      Model1: { total: 0, wins: 0 },
      Model2: { total: 0, wins: 0 },
    };
    const directionPerformance = {
      Long: { total: 0, wins: 0 },
      Short: { total: 0, wins: 0 },
    };
    const sessionPerformance = {};
    const emotionPerformance = {};
    const dayPerformance = {};

    trades.forEach((trade) => {
      // Model performance
      if (modelPerformance[trade.model]) {
        modelPerformance[trade.model].total++;
        if (trade.result === "Win") modelPerformance[trade.model].wins++;
      }

      // Direction
      if (directionPerformance[trade.direction]) {
        directionPerformance[trade.direction].total++;
        if (trade.result === "Win")
          directionPerformance[trade.direction].wins++;
      }

      // Session
      if (!sessionPerformance[trade.session]) {
        sessionPerformance[trade.session] = { total: 0, wins: 0 };
      }
      sessionPerformance[trade.session].total++;
      if (trade.result === "Win") sessionPerformance[trade.session].wins++;

      // Emotion
      if (!emotionPerformance[trade.emotionalState]) {
        emotionPerformance[trade.emotionalState] = { total: 0, wins: 0 };
      }
      emotionPerformance[trade.emotionalState].total++;
      if (trade.result === "Win")
        emotionPerformance[trade.emotionalState].wins++;

      // Day of week
      const dayName = trade.date.toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (!dayPerformance[dayName]) {
        dayPerformance[dayName] = { total: 0, wins: 0 };
      }
      dayPerformance[dayName].total++;
      if (trade.result === "Win") dayPerformance[dayName].wins++;
    });

    const calculateWinRate = (perf) => {
      const result = {};
      Object.entries(perf).forEach(([key, data]) => {
        result[key] = {
          ...data,
          winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        };
      });
      return result;
    };

    res.json({
      modelPerformance: calculateWinRate(modelPerformance),
      directionPerformance: calculateWinRate(directionPerformance),
      sessionPerformance: calculateWinRate(sessionPerformance),
      emotionPerformance: calculateWinRate(emotionPerformance),
      dayPerformance: calculateWinRate(dayPerformance),
    });
  } catch (error) {
    console.error("Performance analytics error:", error);
    res.status(500).json({ error: "Failed to fetch performance analytics" });
  }
};

// Daily analytics - NEW FUNCTION
export const getDailyAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    // Parse month and year (month is 1-based in query)
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Create date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    console.log(`Fetching daily analytics from ${startDate} to ${endDate}`);

    // Get all trades for the month
    const trades = await Trade.find({
      userId: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // Group trades by date
    const dailyStats = {};

    trades.forEach((trade) => {
      const dateKey = trade.date.toISOString().split("T")[0];

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          trades: 0,
          pnl: 0,
          wins: 0,
          losses: 0,
          breakeven: 0,
          volume: 0,
          bestTrade: null,
          worstTrade: null,
        };
      }

      dailyStats[dateKey].trades++;
      dailyStats[dateKey].pnl += trade.pnl || 0;
      dailyStats[dateKey].volume += trade.lotSize || 0;

      if (trade.result === "Win") {
        dailyStats[dateKey].wins++;
      } else if (trade.result === "Loss") {
        dailyStats[dateKey].losses++;
      } else {
        dailyStats[dateKey].breakeven++;
      }

      // Track best and worst trades
      if (trade.pnl) {
        if (
          !dailyStats[dateKey].bestTrade ||
          trade.pnl > dailyStats[dateKey].bestTrade
        ) {
          dailyStats[dateKey].bestTrade = trade.pnl;
        }
        if (
          !dailyStats[dateKey].worstTrade ||
          trade.pnl < dailyStats[dateKey].worstTrade
        ) {
          dailyStats[dateKey].worstTrade = trade.pnl;
        }
      }
    });

    // Round values
    Object.keys(dailyStats).forEach((date) => {
      dailyStats[date].pnl = Math.round(dailyStats[date].pnl * 100) / 100;
      if (dailyStats[date].bestTrade) {
        dailyStats[date].bestTrade =
          Math.round(dailyStats[date].bestTrade * 100) / 100;
      }
      if (dailyStats[date].worstTrade) {
        dailyStats[date].worstTrade =
          Math.round(dailyStats[date].worstTrade * 100) / 100;
      }
    });

    res.json(dailyStats);
  } catch (error) {
    console.error("Daily analytics error:", error);
    res.status(500).json({ error: "Failed to fetch daily analytics" });
  }
};

// Funding dashboard analytics
export const getFundingDashboard = async (req, res) => {
  try {
    const FundingAccount = (await import("../models/FundingAccount.js"))
      .default;
    const Trade = (await import("../models/Trade.js")).default;

    const activeAccounts = await FundingAccount.find({
      userId: req.user.id,
      isActive: true,
    });

    const accountsStats = await Promise.all(
      activeAccounts.map(async (account) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTrades = await Trade.find({
          fundingAccountId: account._id,
          date: { $gte: today },
        });

        const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const dailyLossPercent =
          (Math.abs(todayPnL) / account.startingBalance) * 100;
        const totalProfit =
          ((account.currentBalance - account.startingBalance) /
            account.startingBalance) *
          100;

        return {
          id: account._id,
          name: account.accountName,
          company: account.company,
          size: account.accountSize,
          phase: account.phase,
          balance: account.currentBalance,
          profitTarget: account.profitTarget,
          profitAchieved: totalProfit,
          targetProgress: (totalProfit / account.profitTarget) * 100,
          dailyLossLimit: account.maxDailyLoss,
          dailyLossUsed: dailyLossPercent,
          dailyLossRemaining: account.maxDailyLoss - dailyLossPercent,
          totalLossLimit: account.maxTotalLoss,
          totalLossUsed: Math.abs(totalProfit),
          minTradingDays: account.minTradingDays,
          daysTraded: [
            ...new Set(todayTrades.map((t) => t.date.toDateString())),
          ].length,
          isBreached: false,
          riskLevel:
            dailyLossPercent > account.maxDailyLoss * 0.8 ? "high" : "normal",
        };
      }),
    );

    res.json(accountsStats);
  } catch (error) {
    console.error("Funding dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch funding dashboard" });
  }
};
