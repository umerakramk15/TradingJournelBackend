import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const model1Checklist = {
  preTrade: [
    { id: 1, label: "Daily Bias Confirmed (Bullish/Bearish)", checked: false },
    { id: 2, label: "1H Bias Aligned with Daily", checked: false },
    { id: 3, label: "No High-Impact News in 30min", checked: false },
    { id: 4, label: "London or NY Killzone Active", checked: false },
  ],
  manipulation: [
    { id: 5, label: "Liquidity Sweep on 1H", checked: false },
    { id: 6, label: "Stop Hunt Below/Above Structure", checked: false },
    { id: 7, label: "Market Structure Shift (MSS)", checked: false },
    { id: 8, label: "Inducement Taken Out", checked: false },
    { id: 9, label: "Clear Displacement in 5M", checked: false },
  ],
  confirmation: [
    { id: 10, label: "FVG Created on 5M", checked: false },
    { id: 11, label: "Order Block is Unmitigated", checked: false },
    {
      id: 12,
      label: "Entry in Discount (Buy) / Premium (Sell)",
      checked: false,
    },
    { id: 13, label: "Fibonacci Level Confluence", checked: false },
    {
      id: 14,
      label: "Killzone Entry Window (2-5AM or 8-11AM)",
      checked: false,
    },
  ],
  entry: [
    { id: 15, label: "RR Ratio Minimum 1:2", checked: false },
    { id: 16, label: "SL Behind Recent Structure/Swing", checked: false },
    { id: 17, label: "TP at Opposite Liquidity Level", checked: false },
    { id: 18, label: "Risk % Calculated (0.3-0.5%)", checked: false },
  ],
};

const model2Checklist = {
  preTrade: [
    { id: 1, label: "4H Bias Confirmed", checked: false },
    { id: 2, label: "15M Bias Aligned with 4H", checked: false },
    { id: 3, label: "No Major News Events", checked: false },
    { id: 4, label: "Session Killzone Active", checked: false },
  ],
  manipulation: [
    { id: 5, label: "Liquidity Sweep on 15M", checked: false },
    { id: 6, label: "Equal Highs/Lows Taken Out", checked: false },
    { id: 7, label: "Structure Break Confirmed", checked: false },
    { id: 8, label: "Inducement Identified", checked: false },
    { id: 9, label: "Displacement on 1M Chart", checked: false },
  ],
  confirmation: [
    { id: 10, label: "FVG Present on 1M", checked: false },
    { id: 11, label: "OB Not Yet Tested", checked: false },
    { id: 12, label: "Entry in Discount/Premium", checked: false },
    { id: 13, label: "Fibonacci Confluence Zone", checked: false },
    { id: 14, label: "Correct Session Time", checked: false },
  ],
  entry: [
    { id: 15, label: "Minimum 1:2 RR", checked: false },
    { id: 16, label: "SL Behind Valid Structure", checked: false },
    { id: 17, label: "TP at Liquidity Target", checked: false },
    { id: 18, label: "Position Size Properly Calculated", checked: false },
  ],
};

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

export default function Checklist() {
  const [activeModel, setActiveModel] = useState("model1");
  const [checklist, setChecklist] = useState(model1Checklist);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleModelChange = (model) => {
    setActiveModel(model);
    setChecklist(
      model === "model1" ? { ...model1Checklist } : { ...model2Checklist },
    );
    setShowConfetti(false);
  };

  const handleCheck = (section, itemId) => {
    const updated = { ...checklist };
    const item = updated[section].find((i) => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      setChecklist(updated);

      // Check if all items are now checked
      const newScore = getScoreFromChecklist(updated);
      if (newScore === 18 && !showConfetti) {
        setShowConfetti(true);
        toast.success("🎉 Perfect 18/18! Ready to trade!", {
          duration: 4000,
          icon: "🏆",
        });
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const resetChecklist = () => {
    setChecklist(
      activeModel === "model1"
        ? { ...model1Checklist }
        : { ...model2Checklist },
    );
    setShowConfetti(false);
    toast.success("Checklist reset");
  };

  const getScoreFromChecklist = (cl) => {
    let score = 0;
    Object.values(cl).forEach((section) => {
      section.forEach((item) => {
        if (item.checked) score++;
      });
    });
    return score;
  };

  const getScore = () => getScoreFromChecklist(checklist);

  const getSectionScore = (section) => {
    return checklist[section].filter((item) => item.checked).length;
  };

  const getScoreColor = (score) => {
    if (score >= 16) return "text-profit";
    if (score >= 12) return "text-gold";
    if (score >= 8) return "text-yellow-500";
    return "text-loss";
  };

  const getScoreBgColor = (score) => {
    if (score >= 16) return "bg-profit";
    if (score >= 12) return "bg-gold";
    if (score >= 8) return "bg-yellow-500";
    return "bg-loss";
  };

  const getScoreMessage = (score) => {
    if (score === 18) return { text: "Perfect! Ready to trade", emoji: "🏆" };
    if (score >= 15)
      return { text: "Almost there, review missing items", emoji: "⚠️" };
    if (score >= 10)
      return { text: "Several items missing, be cautious", emoji: "❌" };
    return { text: "Do NOT trade until checklist is complete", emoji: "🚫" };
  };

  const printChecklist = () => {
    window.print();
    toast.success("Checklist sent to printer");
  };

  const score = getScore();
  const scoreMessage = getScoreMessage(score);
  const sectionIcons = {
    preTrade: "📋",
    manipulation: "🔄",
    confirmation: "✅",
    entry: "🎯",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Trading Checklist</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive pre-trade verification for disciplined trading
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetChecklist}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={printChecklist}
            className="btn-primary text-sm flex items-center space-x-2"
          >
            <span>🖨️</span>
            <span>Print / Save PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Model Selector */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-1.5 flex gap-1"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModelChange("model1")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeModel === "model1"
              ? "bg-gradient-to-r from-gold-dark to-gold text-dark shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-dark-tertiary"
          }`}
        >
          Model 1 (1D/1H/5M)
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModelChange("model2")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeModel === "model2"
              ? "bg-gradient-to-r from-gold-dark to-gold text-dark shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-dark-tertiary"
          }`}
        >
          Model 2 (4H/15M/1M)
        </motion.button>
      </motion.div>

      {/* Score Card */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 relative overflow-hidden"
      >
        {/* Confetti Effect for Perfect Score */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    top: "50%",
                    left: "50%",
                    scale: 0,
                  }}
                  animate={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    scale: [0, 1.5, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: ["#D4AF37", "#10B981", "#8B5CF6", "#F59E0B"][
                      i % 4
                    ],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Checklist Score</span>
                <motion.span
                  key={score}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  {scoreMessage.emoji}
                </motion.span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">{scoreMessage.text}</p>
            </div>
            <div className="text-center">
              <motion.div
                key={score}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className={`text-5xl font-bold ${getScoreColor(score)}`}
              >
                {score}/18
              </motion.div>
              <div className="text-xs text-gray-500 mt-1">
                {((score / 18) * 100).toFixed(0)}% Complete
              </div>
            </div>
          </div>
          <div className="progress-bar mt-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / 18) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`progress-fill ${getScoreBgColor(score)}`}
            />
          </div>
        </div>
      </motion.div>

      {/* Checklist Sections */}
      <motion.div variants={itemVariants} className="space-y-4">
        {Object.entries(checklist).map(([sectionKey, items], sectionIndex) => (
          <motion.div
            key={sectionKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gold uppercase flex items-center space-x-2">
                <span className="text-lg">{sectionIcons[sectionKey]}</span>
                <span>
                  {sectionKey.replace(/([A-Z])/g, " $1").trim()} ({items.length}
                  )
                </span>
              </h3>
              <span
                className={`text-sm font-medium ${
                  getSectionScore(sectionKey) === items.length
                    ? "text-profit"
                    : "text-gray-400"
                }`}
              >
                {getSectionScore(sectionKey)}/{items.length}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {items.map((item, itemIndex) => (
                  <motion.label
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                      item.checked
                        ? "bg-profit/10 border border-profit/20"
                        : "bg-dark-tertiary/50 border border-transparent hover:border-dark-border hover:bg-dark-tertiary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheck(sectionKey, item.id)}
                      className="w-5 h-5 rounded border-dark-border bg-dark text-gold focus:ring-gold focus:ring-offset-0 cursor-pointer"
                    />
                    <span
                      className={`text-sm flex-1 transition-all ${
                        item.checked
                          ? "text-white line-through opacity-70"
                          : "text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.checked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-profit"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.label>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Object.entries(checklist).map(([sectionKey, items]) => (
          <motion.div
            key={sectionKey}
            whileHover={{ scale: 1.05 }}
            className="stat-card text-center"
          >
            <div className="text-2xl mb-2">{sectionIcons[sectionKey]}</div>
            <div
              className={`text-2xl font-bold ${
                getSectionScore(sectionKey) === items.length
                  ? "text-profit"
                  : "text-gold"
              }`}
            >
              {getSectionScore(sectionKey)}/{items.length}
            </div>
            <div className="text-xs text-gray-400 mt-1 capitalize">
              {sectionKey.replace(/([A-Z])/g, " $1").trim()}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Checklist Guide */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>📖</span>
          <span>How to Use This Checklist</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              step: "1",
              text: "Before each trade, go through every item honestly.",
              color: "text-gold",
            },
            {
              step: "2",
              text: "Don't skip items just because you 'feel' the setup is good.",
              color: "text-white",
            },
            {
              step: "3",
              text: "Minimum 15/18 is recommended before entering any trade.",
              color: "text-profit",
            },
            {
              step: "4",
              text: "18/18 is required for Counter Trend trades.",
              color: "text-loss",
            },
            {
              step: "5",
              text: "Review unchecked items after the session to improve.",
              color: "text-white",
            },
            {
              step: "6",
              text: "Use this alongside your trade journal for best results.",
              color: "text-gold",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-tertiary/30 transition-colors"
            >
              <span className={`font-bold ${item.color}`}>{item.step}.</span>
              <span className="text-sm text-gray-300">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
