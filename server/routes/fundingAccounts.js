import express from "express";
import { protect } from "../middleware/auth.js";
import FundingAccount from "../models/FundingAccount.js";
import { getFirmConfig } from "../config/propFirms.js";

const router = express.Router();

router.use(protect);

// Get all funding accounts
router.get("/", async (req, res) => {
  try {
    const accounts = await FundingAccount.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch funding accounts" });
  }
});

// Get single funding account with stats
router.get("/:id", async (req, res) => {
  try {
    const account = await FundingAccount.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Get all trades for this account
    const Trade = (await import("../models/Trade.js")).default;
    const trades = await Trade.find({ fundingAccountId: account._id });

    // Calculate statistics
    const stats = {
      totalTrades: trades.length,
      wins: trades.filter((t) => t.result === "Win").length,
      losses: trades.filter((t) => t.result === "Loss").length,
      winRate:
        trades.length > 0
          ? (trades.filter((t) => t.result === "Win").length / trades.length) *
            100
          : 0,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      profitTarget: account.profitTarget,
      profitAchieved:
        ((account.currentBalance - account.startingBalance) /
          account.startingBalance) *
        100,
      daysTraded: [...new Set(trades.map((t) => t.date.toDateString()))].length,
      isPassed:
        ((account.currentBalance - account.startingBalance) /
          account.startingBalance) *
          100 >=
        account.profitTarget,
    };

    res.json({ account, stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account details" });
  }
});

// Create funding account
router.post("/", async (req, res) => {
  try {
    const { company, accountSize, phase } = req.body;

    // Get firm configuration
    const firmConfig = getFirmConfig(company, accountSize);
    if (!firmConfig) {
      return res.status(400).json({ error: "Invalid firm or account size" });
    }

    const account = await FundingAccount.create({
      userId: req.user.id,
      company,
      accountSize,
      phase: phase || firmConfig.phases[0],
      accountName: `${company} - $${accountSize.toLocaleString()} ${phase || firmConfig.phases[0]}`,
      profitTarget: firmConfig.profitTarget,
      maxDailyLoss: firmConfig.maxDailyLoss,
      maxTotalLoss: firmConfig.maxTotalLoss,
      minTradingDays: firmConfig.minTradingDays,
      profitShare: firmConfig.profitShare,
      startingBalance: accountSize,
      currentBalance: accountSize,
      highestBalance: accountSize,
      lowestBalance: accountSize,
      startDate: new Date(),
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: "Failed to create funding account" });
  }
});

// Update funding account
router.put("/:id", async (req, res) => {
  try {
    const account = await FundingAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true },
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

// Get prop firms list
router.get("/firms/list", async (req, res) => {
  try {
    const { PROP_FIRMS } = await import("../config/propFirms.js");
    res.json(PROP_FIRMS);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prop firms" });
  }
});

export default router;
