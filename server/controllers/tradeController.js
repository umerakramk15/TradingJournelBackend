import Trade from "../models/Trade.js";
import User from "../models/User.js";

// Get all trades with filters
export const getTrades = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      model,
      direction,
      result,
      session,
      page = 1,
      limit = 20,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = { userId: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (model) filter.model = model;
    if (direction) filter.direction = direction;
    if (result) filter.result = result;
    if (session) filter.session = session;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [trades, total] = await Promise.all([
      Trade.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Trade.countDocuments(filter),
    ]);

    res.json({
      trades,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTrades: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get trades error:", error);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
};

// Get single trade
export const getTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(trade);
  } catch (error) {
    console.error("Get trade error:", error);
    res.status(500).json({ error: "Failed to fetch trade" });
  }
};

// Add trade
export const addTrade = async (req, res) => {
  try {
    const tradeData = {
      ...req.body,
      userId: req.user.id,
    };

    // Get user for balance calculation
    const user = await User.findById(req.user.id);

    // Calculate lot size based on risk
    if (tradeData.slPips > 0 && tradeData.entryPrice && tradeData.slPrice) {
      const slPips =
        tradeData.direction === "Long"
          ? Math.abs(tradeData.entryPrice - tradeData.slPrice)
          : Math.abs(tradeData.slPrice - tradeData.entryPrice);

      tradeData.slPips = Math.round(slPips * 10) / 10;

      const riskAmount = (user.accountBalance * tradeData.riskPercent) / 100;
      tradeData.lotSize = riskAmount / slPips;
    }

    // Calculate P&L
    if (tradeData.exitPrice && tradeData.entryPrice) {
      const pipDiff =
        tradeData.direction === "Long"
          ? tradeData.exitPrice - tradeData.entryPrice
          : tradeData.entryPrice - tradeData.exitPrice;

      tradeData.pnl = pipDiff * tradeData.lotSize;
      tradeData.pnlPercent = (tradeData.pnl / user.accountBalance) * 100;
    }

    const trade = await Trade.create(tradeData);

    res.status(201).json(trade);
  } catch (error) {
    console.error("Add trade error:", error);
    res.status(500).json({ error: "Failed to add trade" });
  }
};

// Update trade
export const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(trade);
  } catch (error) {
    console.error("Update trade error:", error);
    res.status(500).json({ error: "Failed to update trade" });
  }
};

// Delete trade
export const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    console.error("Delete trade error:", error);
    res.status(500).json({ error: "Failed to delete trade" });
  }
};

// Export trades to CSV
export const exportCSV = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();

    const headers = [
      "Date",
      "Session",
      "Model",
      "Trade Type",
      "Direction",
      "Entry Price",
      "SL Price",
      "TP Price",
      "Exit Price",
      "SL Pips",
      "RR Ratio",
      "Lot Size",
      "Risk %",
      "Checklist Score",
      "Emotional State",
      "Result",
      "P&L",
      "Notes",
    ];

    const rows = trades.map((trade) => [
      new Date(trade.date).toISOString(),
      trade.session,
      trade.model,
      trade.tradeType,
      trade.direction,
      trade.entryPrice,
      trade.slPrice,
      trade.tpPrice,
      trade.exitPrice || "",
      trade.slPips,
      trade.rrRatio,
      trade.lotSize,
      trade.riskPercent,
      trade.checklistScore,
      trade.emotionalState,
      trade.result,
      trade.pnl || 0,
      trade.notes || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=trades.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ error: "Failed to export trades" });
  }
};

// Upload trade screenshot
export const uploadScreenshot = async (req, res) => {
  try {
    // This would use Cloudinary in production
    // For now, just return success
    res.json({
      url: "screenshot-placeholder-url",
      message: "Screenshot upload ready (Cloudinary integration pending)",
    });
  } catch (error) {
    console.error("Upload screenshot error:", error);
    res.status(500).json({ error: "Failed to upload screenshot" });
  }
};
