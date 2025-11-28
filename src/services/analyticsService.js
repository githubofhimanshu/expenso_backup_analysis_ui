/**
 * Analytics Service - Client-side version
 * Replicates all the analytics calculations from the backend AnalyticsService
 */

/**
 * Parses budget amount string to number
 * Format: "amount,currency" like "1500.00,INR"
 */
const parseBudgetAmount = (amountStr) => {
  if (!amountStr || amountStr === '') return 0.0;
  try {
    const parts = amountStr.split(',');
    const amount = parseFloat(parts[0].trim());
    return isNaN(amount) ? 0.0 : amount;
  } catch {
    return 0.0;
  }
};

/**
 * Calculates daily average spending
 */
const calculateDailyAverage = (transactions) => {
  const expenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.transactionDate != null)
    .sort((a, b) => a.transactionDate - b.transactionDate);

  if (expenses.length === 0) {
    return { average: 0, totalDays: 0 };
  }

  const minDate = expenses[0].transactionDate;
  const maxDate = expenses[expenses.length - 1].transactionDate;

  const daysDiff = Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
  const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    average: daysDiff > 0 ? totalExpense / daysDiff : 0,
    totalDays: daysDiff,
  };
};

/**
 * Calculates weekly spending trends
 */
const calculateWeeklyTrends = (transactions) => {
  const weeklyExpenses = new Map();

  transactions
    .filter(t => t.type === 'EXPENSE' && t.transactionDate != null)
    .forEach(t => {
      const date = new Date(t.transactionDate);
      const year = date.getFullYear();
      
      // Calculate ISO week number
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
      
      const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
      
      const currentAmount = weeklyExpenses.get(weekKey) || 0;
      weeklyExpenses.set(weekKey, currentAmount + (t.amount || 0));
    });

  // Convert to array and sort by week (descending), limit to last 8 weeks
  return Array.from(weeklyExpenses.entries())
    .map(([week, amount]) => ({ week, amount }))
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, 8);
};

/**
 * Detects recurring expenses based on description
 */
const detectRecurringExpenses = (transactions) => {
  const descriptionGroups = new Map();

  // Group transactions by description
  transactions
    .filter(t => t.type === 'EXPENSE' && t.description && t.description !== '')
    .forEach(t => {
      const desc = t.description;
      if (!descriptionGroups.has(desc)) {
        descriptionGroups.set(desc, []);
      }
      descriptionGroups.get(desc).push(t);
    });

  // Filter groups with at least 2 transactions and calculate stats
  const recurring = Array.from(descriptionGroups.entries())
    .filter(([, group]) => group.length >= 2)
    .map(([description, group]) => {
      const totalAmount = group.reduce((sum, t) => sum + (t.amount || 0), 0);
      const avgAmount = totalAmount / group.length;

      return {
        description,
        frequency: group.length,
        averageAmount: avgAmount,
        totalAmount,
        category: group[0].categoryId,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  return recurring;
};

/**
 * Gets comprehensive analytics for all transactions and budgets
 */
export const getComprehensiveAnalytics = (transactions, budgets) => {
  const activeTransactions = transactions.filter(t => t.isDeleted === 0);

  // Basic totals
  const totalIncome = activeTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = activeTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Category breakdown - use categoryId for grouping
  const categoryBreakdown = {};
  activeTransactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const category = t.categoryId && t.categoryId !== '' ? t.categoryId : 'Uncategorized';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (t.amount || 0);
    });

  // Payment method analysis
  const paymentMethodBreakdown = {};
  activeTransactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const method = t.paymentMethod && t.paymentMethod !== '' ? t.paymentMethod : 'Unknown';
      paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + (t.amount || 0);
    });

  // Monthly trends
  const monthlyTrends = {};
  activeTransactions.forEach(t => {
    if (t.transactionDate != null) {
      const date = new Date(t.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {};
      }

      const type = t.type;
      const amount = t.amount || 0;
      monthlyTrends[monthKey][type] = (monthlyTrends[monthKey][type] || 0) + amount;
    }
  });

  // Weekly spending trends
  const weeklyTrends = calculateWeeklyTrends(activeTransactions);

  // Top expenses
  const topExpenses = activeTransactions
    .filter(t => t.type === 'EXPENSE')
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 10)
    .map(t => ({
      description: t.description,
      amount: t.amount,
      category: t.categoryId,
      date: t.transactionDate,
      paymentMethod: t.paymentMethod,
    }));

  // Transaction count by type
  const transactionCounts = {};
  activeTransactions.forEach(t => {
    const type = t.type || 'Unknown';
    transactionCounts[type] = (transactionCounts[type] || 0) + 1;
  });

  // Average transaction amount by category
  const categoryTotals = {};
  const categoryCounts = {};
  activeTransactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const category = t.categoryId && t.categoryId !== '' ? t.categoryId : 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + (t.amount || 0);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

  const averageByCategory = {};
  Object.keys(categoryTotals).forEach(category => {
    averageByCategory[category] = categoryTotals[category] / categoryCounts[category];
  });

  // Budget tracking from database (already synchronized)
  const budgetTracking = budgets.map(b => {
    const budgetAmount = parseBudgetAmount(b.budgetAmount);
    const spentAmount = parseBudgetAmount(b.spentAmount);
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - spentAmount;

    return {
      name: b.name,
      category: b.categoryName,
      categoryId: b.categoryId,
      budgetAmount,
      spentAmount,
      period: b.period,
      status: b.status,
      percentageUsed,
      remaining,
    };
  });

  // Spending velocity
  const dailyAverageSpending = calculateDailyAverage(activeTransactions);

  // Recurring expenses detection
  const recurringExpenses = detectRecurringExpenses(activeTransactions);

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    transactionCount: activeTransactions.length,
    categoryBreakdown,
    paymentMethodBreakdown,
    monthlyTrends,
    weeklyTrends,
    topExpenses,
    transactionCounts,
    averageByCategory,
    budgetTracking,
    dailyAverageSpending,
    recurringExpenses,
  };
};

/**
 * Filters transactions based on criteria
 */
export const filterTransactions = (transactions, filters = {}) => {
  return transactions.filter(t => {
    if (t.isDeleted !== 0) return false;
    
    if (filters.type && filters.type !== 'ALL' && t.type !== filters.type) {
      return false;
    }
    
    if (filters.categoryId && filters.categoryId !== 'ALL' && t.categoryId !== filters.categoryId) {
      return false;
    }
    
    if (filters.paymentMethod && filters.paymentMethod !== 'ALL' && t.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      const matchesDescription = t.description?.toLowerCase().includes(search);
      const matchesNotes = t.notes?.toLowerCase().includes(search);
      if (!matchesDescription && !matchesNotes) {
        return false;
      }
    }
    
    if (filters.startDate && t.transactionDate < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && t.transactionDate > filters.endDate) {
      return false;
    }
    
    return true;
  });
};

export default {
  getComprehensiveAnalytics,
  filterTransactions,
};

