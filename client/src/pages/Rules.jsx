import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const rules = [
  {
    id: 1,
    title: "The Golden Rule",
    description:
      "Protect your capital at all costs. No single trade should risk more than 2% of your account.",
    isGolden: true,
    icon: "👑",
    details:
      "This is the foundation of all trading. If you protect your capital, you live to trade another day. Break this rule and you risk blowing your account.",
  },
  {
    id: 2,
    title: "Wait for the Killzone",
    description:
      "Only trade during London Open (2-5 AM EST) or NY Open (8-11 AM EST). No trading outside killzones.",
    icon: "🕐",
    details:
      "The highest probability setups occur during killzones when institutional volume enters the market. Trading outside these times dramatically reduces your edge.",
  },
  {
    id: 3,
    title: "HTF Alignment First",
    description:
      "Confirm Daily and 4H bias before entering. Never trade against the higher timeframe trend.",
    icon: "📈",
    details:
      "Model 1 requires 1D/1H/5M alignment. Model 2 requires 4H/15M/1M alignment. Trading against HTF is the fastest way to losses.",
  },
  {
    id: 4,
    title: "Liquidity Grab Required",
    description:
      "Wait for stop hunt or liquidity sweep before entry. No FOMO entries without manipulation.",
    icon: "🎯",
    details:
      "The market moves from liquidity to liquidity. A valid setup requires a clear stop hunt, inducement taken, or equal highs/lows sweep before your entry.",
  },
  {
    id: 5,
    title: "FVG or Order Block Entry",
    description:
      "Enter only at Fair Value Gaps or unmitigated Order Blocks. No market orders without these.",
    icon: "📊",
    details:
      "Your entry must be at a discounted price in a FVG or at an unmitigated OB. Chasing price without these confluences leads to poor RR ratios.",
  },
  {
    id: 6,
    title: "Risk-Reward Minimum 1:2",
    description:
      "Never take a trade with less than 1:2 RR. If the setup doesn't offer at least 1:2, skip it.",
    icon: "⚖️",
    details:
      "With a 40% win rate, you need minimum 1:2 RR to be profitable. Anything less requires an unrealistically high win rate to overcome.",
  },
  {
    id: 7,
    title: "No Trading During News",
    description:
      "Avoid trading 30 minutes before and after high-impact news events. Check economic calendar daily.",
    icon: "📰",
    details:
      "News events cause unpredictable volatility and slippage. Even perfect setups can fail during news. FOMC, NFP, CPI are trade killers.",
  },
  {
    id: 8,
    title: "Max 2 Trades Per Day",
    description:
      "Maximum two trades per day. After two losses, stop. After two wins, stop. Discipline over volume.",
    icon: "✋",
    details:
      "Overtrading is a leading cause of account failure. Two quality setups per day is more than enough. More trades = more exposure = more risk.",
  },
  {
    id: 9,
    title: "Move SL to Breakeven",
    description:
      "Once price moves 1R in your favor, move stop loss to breakeven. Protect profits.",
    icon: "🛡️",
    details:
      "A breakeven trade is always better than a loss. Moving SL to BE removes risk while keeping profit potential alive.",
  },
  {
    id: 10,
    title: "Journal Every Trade",
    description:
      "Every trade must be journaled with screenshots, emotions, and checklist. No exceptions.",
    icon: "📝",
    details:
      "You cannot improve what you don't measure. Review your journal weekly. Find patterns in your losses and eliminate them systematically.",
  },
];

const tradeTypes = [
  {
    type: "Trend Trade",
    icon: "📈",
    description: "Trade in the direction of the higher timeframe trend.",
    rules: [
      "HTF trend is clearly defined",
      "Entry after pullback to discount zone",
      "Target previous highs/lows",
      "Higher probability, lower RR typically",
      "Wait for displacement in trend direction",
    ],
  },
  {
    type: "Counter Trend Trade",
    icon: "🔄",
    description: "Trade against the higher timeframe trend at key levels.",
    rules: [
      "Only at extreme premium/discount zones",
      "Clear liquidity sweep in opposite direction",
      "Must have strong FVG/OB confluence",
      "Higher RR but lower probability",
      "Requires 18/18 checklist score",
    ],
  },
];

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

export default function Rules() {
  const [expandedRule, setExpandedRule] = useState(null);

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
          <span className="gradient-text">Trading Rules</span>
        </h1>
        <p className="text-gray-400 mt-2">
          10 non-negotiable rules for consistent profitability
        </p>
      </motion.div>

      {/* Trade Types Reference */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {tradeTypes.map((tt) => (
          <motion.div
            key={tt.type}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/5 to-transparent rounded-bl-full"></div>
            <div className="flex items-center space-x-3 mb-4 relative z-10">
              <span className="text-4xl">{tt.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{tt.type}</h3>
                <p className="text-sm text-gray-400">{tt.description}</p>
              </div>
            </div>
            <ul className="space-y-2 relative z-10">
              {tt.rules.map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start space-x-2 text-sm text-gray-300"
                >
                  <span className="text-gold mt-1">•</span>
                  <span>{rule}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Sharp Leg Rule Reminder */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="glass-card p-6 border-l-4 border-gold relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            ⚠️
          </motion.span>
          <div>
            <h3 className="text-xl font-bold text-gold">Sharp Leg Rule</h3>
            <p className="text-gray-300 mt-2">
              Never enter immediately after a sharp leg without displacement
              confirmation. Wait for the market to show clear displacement in
              your direction before committing. Sharp legs often trap early
              entries.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Rules Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`glass-card cursor-pointer transition-all relative overflow-hidden ${
              rule.isGolden ? "border-gold/30 bg-gold/5" : ""
            } ${expandedRule === rule.id ? "ring-2 ring-gold/50 border-gold" : ""}`}
            onClick={() =>
              setExpandedRule(expandedRule === rule.id ? null : rule.id)
            }
          >
            {/* Golden Rule Gradient */}
            {rule.isGolden && (
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
            )}

            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                <motion.div
                  animate={rule.isGolden ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-2xl ${rule.isGolden ? "text-4xl" : ""}`}
                >
                  {rule.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-500">
                      Rule #{rule.id}
                    </span>
                    {rule.isGolden && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold border border-gold/30"
                      >
                        👑 GOLDEN
                      </motion.span>
                    )}
                  </div>
                  <h3
                    className={`font-bold mb-2 ${
                      rule.isGolden ? "text-gold text-lg" : "text-white"
                    }`}
                  >
                    {rule.title}
                  </h3>
                  <p className="text-sm text-gray-400">{rule.description}</p>

                  <AnimatePresence>
                    {expandedRule === rule.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-dark-border overflow-hidden"
                      >
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {rule.details}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  animate={{ rotate: expandedRule === rule.id ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-500 text-xl font-light"
                >
                  +
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily Checklist Reminder */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="glass-card p-8 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent"></div>
        <div className="relative z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            ✅
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Daily Pre-Trading Checklist
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Before every trading session, review these rules. Check economic
            calendar. Mark key levels. Set max loss for the day.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📰", label: "Check news calendar" },
              { icon: "📊", label: "Mark HTF levels" },
              { icon: "💎", label: "Set daily max loss" },
              { icon: "📝", label: "Review yesterday's trades" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm text-gray-300">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
