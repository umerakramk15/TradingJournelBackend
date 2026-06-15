import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

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

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    accountBalance: user?.accountBalance || 10000,
    maxDailyRisk: user?.maxDailyRisk || 2,
    maxTradesPerDay: user?.maxTradesPerDay || 2,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        name: form.name,
        accountBalance: form.accountBalance,
        maxDailyRisk: form.maxDailyRisk,
        maxTradesPerDay: form.maxTradesPerDay,
      };

      if (form.currentPassword && form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        if (form.newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        data.currentPassword = form.currentPassword;
        data.newPassword = form.newPassword;
      }

      const response = await axios.put(
        "http://localhost:5000/api/settings/update",
        data,
      );
      updateUser(response.data);
      toast.success("Settings updated successfully!");

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account and trading preferences
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">👤</span>
          <h2 className="text-xl font-bold text-white">Profile</h2>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Trader Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            className="input-field w-full opacity-50 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">💼</span>
          <h2 className="text-xl font-bold text-white">Trading Account</h2>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Account Balance ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={form.accountBalance}
              onChange={(e) =>
                setForm({ ...form, accountBalance: parseFloat(e.target.value) })
              }
              className="input-field w-full pl-8"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Max Daily Risk Limit (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={form.maxDailyRisk}
              onChange={(e) =>
                setForm({ ...form, maxDailyRisk: parseFloat(e.target.value) })
              }
              className="input-field w-full"
              min="0.1"
              max="100"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              Recommended: 2% for prop firms, 1% for personal accounts
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(form.maxDailyRisk / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Max Trades Per Day
          </label>
          <select
            value={form.maxTradesPerDay}
            onChange={(e) =>
              setForm({ ...form, maxTradesPerDay: parseInt(e.target.value) })
            }
            className="input-field w-full"
          >
            <option value={1}>1 trade</option>
            <option value={2}>2 trades</option>
            <option value={3}>3 trades</option>
            <option value={5}>5 trades</option>
            <option value={10}>10 trades</option>
          </select>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">🔒</span>
          <h2 className="text-xl font-bold text-white">Change Password</h2>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            className="input-field w-full"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="input-field w-full"
            placeholder="Enter new password (min. 6 characters)"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="input-field w-full"
            placeholder="Confirm new password"
          />
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-bold text-white">Notifications</h2>
        </div>

        {[
          {
            title: "Daily Loss Limit Warning",
            description: "Alert when approaching daily loss limit",
            defaultChecked: true,
            icon: "⚠️",
          },
          {
            title: "Trade Limit Reminder",
            description: "Notify when you're approaching max trades",
            defaultChecked: true,
            icon: "📊",
          },
          {
            title: "Weekly Summary",
            description: "Receive weekly performance summary",
            defaultChecked: false,
            icon: "📧",
          },
        ].map((notification, index) => (
          <motion.label
            key={index}
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-dark-tertiary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{notification.icon}</span>
              <div>
                <div className="text-white text-sm font-medium">
                  {notification.title}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {notification.description}
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                defaultChecked={notification.defaultChecked}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-tertiary rounded-full peer peer-checked:bg-gold peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </motion.label>
        ))}
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="btn-primary w-full py-4 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full"
              ></motion.div>
              <span>Saving...</span>
            </span>
          ) : (
            "Save Settings"
          )}
        </motion.button>
      </motion.div>

      {/* Account Info */}
      <motion.div variants={itemVariants} className="glass-card p-6 text-sm">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">ℹ️</span>
          <h2 className="text-lg font-bold text-white">Account Information</h2>
        </div>
        <div className="space-y-2 text-gray-400">
          <div className="flex justify-between">
            <span>Account Created</span>
            <span className="text-white">
              {new Date(user?.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User ID</span>
            <span className="text-white font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="text-white">Trading Journal Pro v1.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
