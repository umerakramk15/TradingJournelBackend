import mongoose from 'mongoose';

const fundingAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    enum: ['FTMO', 'The Funded Trader', 'FundedNext', 'Maven', 'E8 Funding', 'Lux Trading', 'Other'],
    required: true
  },
  accountSize: {
    type: Number,
    required: true,
    enum: [5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000]
  },
  phase: {
    type: String,
    enum: ['Challenge', 'Phase 1', 'Phase 2', 'Funded', 'Live'],
    default: 'Challenge'
  },
  accountName: {
    type: String,
    trim: true
  },
  // Prop firm specific rules
  profitTarget: {
    type: Number, // Percentage (e.g., 10 for FTMO Challenge)
    required: true
  },
  maxDailyLoss: {
    type: Number, // Percentage (e.g., 5 for FTMO)
    required: true
  },
  maxTotalLoss: {
    type: Number, // Percentage (e.g., 10 for FTMO)
    required: true
  },
  minTradingDays: {
    type: Number,
    default: 4
  },
  maxLeverage: {
    type: String,
    default: '1:100'
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  breachReason: {
    type: String,
    default: null
  },
  breachDate: {
    type: Date,
    default: null
  },
  // Financial tracking
  startingBalance: {
    type: Number,
    required: true
  },
  currentBalance: {
    type: Number,
    required: true
  },
  highestBalance: {
    type: Number,
    default: 0
  },
  lowestBalance: {
    type: Number,
    default: 0
  },
  // Achievement tracking
  profitShare: {
    type: Number,
    default: 80 // percentage
  },
  totalPayouts: {
    type: Number,
    default: 0
  },
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  fundedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for profit percentage
fundingAccountSchema.virtual('profitPercentage').get(function() {
  return ((this.currentBalance - this.startingBalance) / this.startingBalance) * 100;
});

// Virtual for daily loss used
fundingAccountSchema.virtual('dailyLossUsed').get(function() {
  return this.maxDailyLoss; // Will be calculated based on today's trades
});

// Method to check if account breached
fundingAccountSchema.methods.checkBreach = async function(todayPnL) {
  const dailyLossPercent = (todayPnL / this.startingBalance) * 100;
  const totalLossPercent = ((this.currentBalance - this.startingBalance) / this.startingBalance) * 100;
  
  if (Math.abs(dailyLossPercent) >= this.maxDailyLoss) {
    this.isActive = false;
    this.breachReason = 'Daily loss limit breached';
    this.breachDate = new Date();
    await this.save();
    return { breached: true, reason: 'Daily loss limit' };
  }
  
  if (Math.abs(totalLossPercent) >= this.maxTotalLoss) {
    this.isActive = false;
    this.breachReason = 'Total loss limit breached';
    this.breachDate = new Date();
    await this.save();
    return { breached: true, reason: 'Total loss limit' };
  }
  
  return { breached: false };
};

export default mongoose.model('FundingAccount', fundingAccountSchema);