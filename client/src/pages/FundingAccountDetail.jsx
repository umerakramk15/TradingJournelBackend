import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function FundingAccountDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

  const fetchAccountDetails = async () => {
    try {
      const response = await api.get(`/funding-accounts/${id}`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { account, stats } = data;
  const profitPercent =
    ((account.currentBalance - account.startingBalance) /
      account.startingBalance) *
    100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{account.accountName}</h1>
        <p className="text-gray-400 mt-1">
          {account.company} • {account.phase} • $
          {account.accountSize.toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-gray-400 text-sm">Current Balance</div>
          <div className="text-xl font-bold mt-2 text-white">
            ${account.currentBalance.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="text-gray-400 text-sm">Profit/Loss</div>
          <div
            className={`text-xl font-bold mt-2 ${profitPercent >= 0 ? "text-profit" : "text-loss"}`}
          >
            {profitPercent.toFixed(2)}%
          </div>
        </div>

        <div className="stat-card">
          <div className="text-gray-400 text-sm">Win Rate</div>
          <div className="text-xl font-bold mt-2 text-gold">
            {stats.winRate.toFixed(1)}%
          </div>
        </div>

        <div className="stat-card">
          <div className="text-gray-400 text-sm">Total Trades</div>
          <div className="text-xl font-bold mt-2 text-white">
            {stats.totalTrades}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-white">Challenge Progress</h3>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Profit Target ({account.profitTarget}%)
            </span>
            <span
              className={`font-mono ${profitPercent >= 0 ? "text-profit" : "text-loss"}`}
            >
              {profitPercent.toFixed(2)}% / {account.profitTarget}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-gold"
              style={{
                width: `${Math.min((profitPercent / account.profitTarget) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Daily Loss Limit ({account.maxDailyLoss}%)
            </span>
            <span className="text-gray-500">0% / {account.maxDailyLoss}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-loss" style={{ width: "0%" }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Total Loss Limit ({account.maxTotalLoss}%)
            </span>
            <span className="text-gray-500">
              {Math.abs(profitPercent).toFixed(2)}% / {account.maxTotalLoss}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-loss"
              style={{
                width: `${Math.min((Math.abs(profitPercent) / account.maxTotalLoss) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            Min Trading Days: {account.minTradingDays}
          </span>
          <span className="text-gray-400">Days Traded: {stats.daysTraded}</span>
        </div>
      </div>
    </div>
  );
}
