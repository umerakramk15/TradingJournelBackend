import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

// Update settings
router.put('/update', async (req, res) => {
  try {
    const { name, accountBalance, maxDailyRisk, maxTradesPerDay, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Update basic fields
    if (name) user.name = name;
    if (accountBalance) user.accountBalance = accountBalance;
    if (maxDailyRisk) user.maxDailyRisk = maxDailyRisk;
    if (maxTradesPerDay) user.maxTradesPerDay = maxTradesPerDay;
    
    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      accountBalance: user.accountBalance,
      maxDailyRisk: user.maxDailyRisk,
      maxTradesPerDay: user.maxTradesPerDay
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;