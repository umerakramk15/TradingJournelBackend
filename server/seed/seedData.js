import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Fixed: using __filename, not __dirname

// Load env from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import models from parent directory
import User from "../models/User.js";
import Trade from "../models/Trade.js";
import FundingAccount from "../models/FundingAccount.js";

const generateRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const dummyTrades = [];

// Generate 50 dummy trades over the last 90 days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 90);
const endDate = new Date();

const models = ["Model1", "Model2"];
const sessions = ["London Open", "NY Open", "Asian", "Other"];
const directions = ["Long", "Short"];
const tradeTypes = ["Trend Trade", "Counter Trend Trade"];
const results = ["Win", "Loss", "Breakeven"];
const emotionalStates = [
  "Calm",
  "Focused",
  "Anxious",
  "FOMO",
  "Revenge",
  "Overconfident",
];

for (let i = 0; i < 50; i++) {
  const direction = getRandomItem(directions);
  const entryPrice = 2600 + Math.random() * 100;
  const slPips = 5 + Math.random() * 15;
  const slPrice =
    direction === "Long" ? entryPrice - slPips : entryPrice + slPips;
  const tpPips = slPips * (1 + Math.random() * 2);
  const tpPrice =
    direction === "Long" ? entryPrice + tpPips : entryPrice - tpPips;
  const result = getRandomItem(results);

  let pnl = 0;
  if (result === "Win") {
    pnl = tpPips * 0.1 * (100 + Math.random() * 50);
  } else if (result === "Loss") {
    pnl = -(slPips * 0.1) * (100 + Math.random() * 50);
  } else {
    pnl = 0;
  }

  const checklistScore = Math.floor(Math.random() * 18) + 1;
  const checklistItems = [];
  for (let j = 1; j <= 18; j++) {
    checklistItems.push({
      name: `Checklist Item ${j}`,
      checked: j <= checklistScore,
      section:
        j <= 4
          ? "Pre-Trade"
          : j <= 9
            ? "Manipulation"
            : j <= 14
              ? "Confirmation"
              : "Entry",
    });
  }

  dummyTrades.push({
    date: generateRandomDate(startDate, endDate),
    session: getRandomItem(sessions),
    model: getRandomItem(models),
    tradeType: getRandomItem(tradeTypes),
    direction: direction,
    entryPrice: Math.round(entryPrice * 100) / 100,
    slPrice: Math.round(slPrice * 100) / 100,
    tpPrice: Math.round(tpPrice * 100) / 100,
    exitPrice:
      result === "Breakeven"
        ? entryPrice
        : Math.round(
            (direction === "Long"
              ? entryPrice + (result === "Win" ? tpPips : -slPips)
              : entryPrice - (result === "Win" ? tpPips : -slPips)) * 100,
          ) / 100,
    slPips: Math.round(slPips * 10) / 10,
    rrRatio: Math.round((tpPips / slPips) * 100) / 100,
    lotSize: Math.round((0.1 + Math.random() * 1) * 100) / 100,
    riskPercent: getRandomItem([0.3, 0.4, 0.5]),
    checklistScore: checklistScore,
    checklistItems: checklistItems,
    emotionalState: getRandomItem(emotionalStates),
    result: result,
    pnl: Math.round(pnl * 100) / 100,
    pnlPercent: Math.round((pnl / 10000) * 10000) / 100,
    notes: `Sample trade ${i + 1} - ${result === "Win" ? "Great setup!" : result === "Loss" ? "Needs improvement" : "Breakeven trade"}`,
    lessonLearned:
      result === "Loss"
        ? "Should have waited for better confirmation"
        : "Followed the rules perfectly",
    ruleBroken: result === "Loss" && Math.random() > 0.7,
    whichRule:
      result === "Loss" && Math.random() > 0.7
        ? "Rule 2: Always use stop loss"
        : null,
  });
}

// Using ONLY valid values from your FundingAccount model
// Valid accountSize: [5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000]
// Valid phase: ['Challenge', 'Phase 1', 'Phase 2', 'Funded', 'Live']
const dummyFundingAccounts = [
  {
    company: "FTMO",
    accountSize: 10000,
    phase: "Challenge",
    profitTarget: 10,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 4,
    startingBalance: 10000,
    currentBalance: 10500,
    highestBalance: 10500,
    lowestBalance: 9800,
    profitShare: 80,
    isActive: true,
  },
  {
    company: "FTMO",
    accountSize: 50000,
    phase: "Phase 2",
    profitTarget: 5,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 4,
    startingBalance: 50000,
    currentBalance: 52000,
    highestBalance: 52500,
    lowestBalance: 49000,
    profitShare: 80,
    isActive: true,
  },
  {
    company: "The Funded Trader",
    accountSize: 25000,
    phase: "Funded",
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 5,
    startingBalance: 25000,
    currentBalance: 28000,
    highestBalance: 28500,
    lowestBalance: 24800,
    profitShare: 80,
    isActive: true,
  },
  {
    company: "FundedNext",
    accountSize: 10000,
    phase: "Phase 1",
    profitTarget: 10,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 5,
    startingBalance: 10000,
    currentBalance: 9200,
    highestBalance: 10200,
    lowestBalance: 9200,
    profitShare: 80,
    isActive: false,
    breachReason: "Daily loss limit breached",
    breachDate: new Date(),
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get existing user
    let user = await User.findOne();

    if (!user) {
      console.log("No user found. Creating a test user...");
      user = await User.create({
        name: "Test Trader",
        email: "test@example.com",
        password: "test123",
        accountBalance: 25000,
        maxDailyRisk: 2,
        maxTradesPerDay: 2,
      });
      console.log(
        `✅ Test user created with email: test@example.com, password: test123`,
      );
    } else {
      console.log(`\n📌 Using existing user: ${user.name} (${user.email})`);
    }

    // Check existing data
    const existingTrades = await Trade.countDocuments({ userId: user._id });
    const existingAccounts = await FundingAccount.countDocuments({
      userId: user._id,
    });

    if (existingTrades > 0 || existingAccounts > 0) {
      console.log(`\n⚠️  Existing data found for this user:`);
      console.log(`   - Trades: ${existingTrades}`);
      console.log(`   - Funding Accounts: ${existingAccounts}`);
      console.log(`\nThe script will ADD more data on top of existing data.`);
      console.log(`To start fresh, run clearData.js first.\n`);
    }

    // Add funding accounts with userId
    const accountsWithUserId = dummyFundingAccounts.map((acc) => ({
      ...acc,
      userId: user._id,
      accountName: `${acc.company} - $${acc.accountSize.toLocaleString()} ${acc.phase}`,
      startDate: new Date(),
    }));

    const createdAccounts = await FundingAccount.insertMany(accountsWithUserId);
    console.log(`✅ Added ${createdAccounts.length} funding accounts`);

    // Add trades with userId and random fundingAccountId
    const tradesWithUserId = dummyTrades.map((trade) => ({
      ...trade,
      userId: user._id,
      fundingAccountId:
        createdAccounts.length > 0
          ? createdAccounts[Math.floor(Math.random() * createdAccounts.length)]
              ._id
          : null,
    }));

    await Trade.insertMany(tradesWithUserId);
    console.log(`✅ Added ${tradesWithUserId.length} dummy trades`);

    console.log("\n🎉 Data seeding complete!");
    console.log("📊 Summary:");
    console.log(`   - User: ${user.name} (${user.email})`);
    console.log(`   - New Funding Accounts: ${createdAccounts.length}`);
    console.log(`   - New Trades: ${tradesWithUserId.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
