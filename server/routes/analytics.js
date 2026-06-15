import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDashboard,
  getMonthlyAnalytics,
  getPerformance,
  getDailyAnalytics, // Add this import
  getFundingDashboard,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/monthly", getMonthlyAnalytics);
router.get("/performance", getPerformance);
router.get("/daily", getDailyAnalytics); // Add this route
router.get("/funding", getFundingDashboard);

export default router;
