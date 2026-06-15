import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    name: String,
    checked: Boolean,
    section: {
      type: String,
      enum: ["Pre-Trade", "Manipulation", "Confirmation", "Entry"],
    },
  },
  { _id: false },
);

const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  fundingAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FundingAccount",
    required: false,
  },
  date: {
    type: Date,
    required: [true, "Trade date is required"],
    default: Date.now,
  },
  session: {
    type: String,
    enum: ["London Open", "NY Open", "Asian", "Other"],
    required: true,
  },
  model: {
    type: String,
    enum: ["Model1", "Model2"],
    required: true,
  },
  tradeType: {
    type: String,
    enum: ["Trend Trade", "Counter Trend Trade"],
    required: true,
  },
  direction: {
    type: String,
    enum: ["Long", "Short"],
    required: true,
  },
  entryPrice: {
    type: Number,
    required: [true, "Entry price is required"],
    min: 0,
  },
  slPrice: {
    type: Number,
    required: [true, "Stop loss price is required"],
    min: 0,
  },
  tpPrice: {
    type: Number,
    required: [true, "Take profit price is required"],
    min: 0,
  },
  exitPrice: {
    type: Number,
    min: 0,
  },
  slPips: {
    type: Number,
    default: 0,
  },
  rrRatio: {
    type: Number,
    default: 0,
  },
  lotSize: {
    type: Number,
    default: 0,
  },
  riskPercent: {
    type: Number,
    enum: [0.3, 0.4, 0.5],
    required: true,
  },
  checklistScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 18,
  },
  checklistItems: [checklistItemSchema],
  emotionalState: {
    type: String,
    enum: ["Calm", "Focused", "Anxious", "FOMO", "Revenge", "Overconfident"],
    required: true,
  },
  beforeScreenshot: {
    type: String,
    default: null,
  },
  afterScreenshot: {
    type: String,
    default: null,
  },
  result: {
    type: String,
    enum: ["Win", "Loss", "Breakeven"],
    required: true,
  },
  pnl: {
    type: Number,
    default: 0,
  },
  pnlPercent: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  lessonLearned: {
    type: String,
    maxlength: 500,
  },
  ruleBroken: {
    type: Boolean,
    default: false,
  },
  whichRule: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
tradeSchema.index({ userId: 1, date: -1 });
tradeSchema.index({ userId: 1, result: 1 });
tradeSchema.index({ userId: 1, model: 1 });

// Calculate SL in pips, RR ratio, and lot size before saving
tradeSchema.pre("save", function (next) {
  // Calculate SL in pips (for XAU/USD, 1 pip = $0.10, but we'll use standard calculation)
  // For gold, we treat 1.0 as 1 pip for simplicity
  if (this.entryPrice && this.slPrice) {
    if (this.direction === "Long") {
      this.slPips = Math.abs(this.entryPrice - this.slPrice);
    } else {
      this.slPips = Math.abs(this.slPrice - this.entryPrice);
    }
    this.slPips = Math.round(this.slPips * 10) / 10;
  }

  // Calculate RR ratio
  if (this.slPips > 0 && this.entryPrice && this.tpPrice) {
    const tpPips =
      this.direction === "Long"
        ? Math.abs(this.tpPrice - this.entryPrice)
        : Math.abs(this.entryPrice - this.tpPrice);
    this.rrRatio = Math.round((tpPips / this.slPips) * 100) / 100;
  }

  // Auto-calculate lot size based on risk
  if (this.slPips > 0) {
    const riskAmount = this.riskPercent / 100; // This will be injected from user balance
    // Lot size will be calculated in the controller with actual balance
  }

  next();
});

export default mongoose.model("Trade", tradeSchema);
