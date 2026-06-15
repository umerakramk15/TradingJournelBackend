export const PROP_FIRMS = {
  FTMO: {
    name: 'FTMO',
    challenges: [
      {
        size: 10000,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 4,
        profitShare: 80,
        phases: ['Challenge', 'Verification', 'Funded']
      },
      {
        size: 25000,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 4,
        profitShare: 80,
        phases: ['Challenge', 'Verification', 'Funded']
      },
      {
        size: 50000,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 4,
        profitShare: 80,
        phases: ['Challenge', 'Verification', 'Funded']
      },
      {
        size: 100000,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 4,
        profitShare: 80,
        phases: ['Challenge', 'Verification', 'Funded']
      }
    ]
  },
  THE_FUNDED_TRADER: {
    name: 'The Funded Trader',
    challenges: [
      {
        size: 25000,
        profitTarget: 8,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 5,
        profitShare: 80,
        phases: ['Challenge', 'Phase 1', 'Phase 2', 'Funded']
      },
      {
        size: 50000,
        profitTarget: 8,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 5,
        profitShare: 80,
        phases: ['Challenge', 'Phase 1', 'Phase 2', 'Funded']
      }
    ]
  },
  FUNDEDNEXT: {
    name: 'FundedNext',
    challenges: [
      {
        size: 15000,
        profitTarget: 10,
        maxDailyLoss: 5,
        maxTotalLoss: 10,
        minTradingDays: 5,
        profitShare: 80,
        phases: ['Challenge', 'Phase 1', 'Phase 2', 'Funded']
      }
    ]
  }
};

// Helper function to get firm rules
export const getFirmConfig = (firmName, accountSize) => {
  const firm = PROP_FIRMS[firmName];
  if (!firm) return null;
  
  return firm.challenges.find(c => c.size === accountSize) || firm.challenges[0];
};