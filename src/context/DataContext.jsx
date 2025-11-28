/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { processZipFile, synchronizeBudgetWithTransactions } from '../services/dataParser';
import { getComprehensiveAnalytics } from '../services/analyticsService';

const isDev = import.meta.env?.DEV ?? false;

// Create context
const DataContext = createContext(null);

// Context provider component
export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [paymentReminders, setPaymentReminders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedTransactions = localStorage.getItem('expenseTransactions');
        const storedBudgets = localStorage.getItem('expenseBudgets');
        const storedReminders = localStorage.getItem('expensePaymentReminders');

        if (storedTransactions && storedBudgets) {
          const parsedTransactions = JSON.parse(storedTransactions);
          let parsedBudgets = JSON.parse(storedBudgets);
          const parsedReminders = storedReminders ? JSON.parse(storedReminders) : [];

          if (isDev) {
            console.log('Loaded from localStorage - Re-synchronizing budgets...');
          }
          
          // Re-synchronize budgets with transactions (in case of data inconsistency)
          parsedBudgets = synchronizeBudgetWithTransactions(parsedBudgets, parsedTransactions);

          setTransactions(parsedTransactions);
          setBudgets(parsedBudgets);
          setPaymentReminders(parsedReminders);
          
          // Calculate analytics
          const analyticsData = getComprehensiveAnalytics(parsedTransactions, parsedBudgets);
          setAnalytics(analyticsData);
          
          setIsDataLoaded(true);
          if (isDev) {
            console.log('Data loaded from localStorage');
          }
        }
      } catch (err) {
        if (isDev) {
          console.error('Error loading data from localStorage:', err);
        }
        // Clear corrupted data
        localStorage.removeItem('expenseTransactions');
        localStorage.removeItem('expenseBudgets');
        localStorage.removeItem('expensePaymentReminders');
      }
    };

    loadFromStorage();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isDataLoaded && transactions.length > 0) {
      try {
        localStorage.setItem('expenseTransactions', JSON.stringify(transactions));
        localStorage.setItem('expenseBudgets', JSON.stringify(budgets));
        localStorage.setItem('expensePaymentReminders', JSON.stringify(paymentReminders));
        if (isDev) {
          console.log('Data saved to localStorage');
        }
      } catch (err) {
        if (isDev) {
          console.error('Error saving data to localStorage:', err);
        }
      }
    }
  }, [transactions, budgets, paymentReminders, isDataLoaded]);

  /**
   * Processes a ZIP file and loads the data
   */
  const loadDataFromZip = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDev) {
        console.log('Processing ZIP file:', file.name);
      }
      const data = await processZipFile(file);

      setTransactions(data.transactions);
      setBudgets(data.budgets);
      setPaymentReminders(data.paymentReminders);

      // Calculate analytics
      const analyticsData = getComprehensiveAnalytics(data.transactions, data.budgets);
      setAnalytics(analyticsData);

      setIsDataLoaded(true);
      if (isDev) {
        console.log('Data loaded successfully');
        console.log('Transactions:', data.transactions.length);
        console.log('Budgets:', data.budgets.length);
        console.log('Payment Reminders:', data.paymentReminders.length);
        console.log('\n=== Budgets in DataContext State ===');
        data.budgets.forEach(b => {
          console.log(`${b.name}: Budget=${b.budgetAmount}, Spent=${b.spentAmount}, Status=${b.status}`);
        });
        console.log('\n=== Budget Tracking in Analytics ===');
        console.log(analyticsData.budgetTracking);
      }

      return { success: true };
    } catch (err) {
      if (isDev) {
        console.error('Error loading data from ZIP:', err);
      }
      setError(err.message || 'Failed to load data');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refreshes analytics calculations
   */
  const refreshAnalytics = useCallback(() => {
    if (transactions.length > 0) {
      const analyticsData = getComprehensiveAnalytics(transactions, budgets);
      setAnalytics(analyticsData);
      if (isDev) {
        console.log('Analytics refreshed');
      }
    }
  }, [transactions, budgets]);

  /**
   * Clears all data
   */
  const clearData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setPaymentReminders([]);
    setAnalytics(null);
    setIsDataLoaded(false);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('expenseTransactions');
    localStorage.removeItem('expenseBudgets');
    localStorage.removeItem('expensePaymentReminders');
    
    if (isDev) {
      console.log('Data cleared');
    }
  }, []);

  /**
   * Gets active (non-deleted) transactions
   */
  const getActiveTransactions = useCallback(() => {
    return transactions.filter(t => t.isDeleted === 0);
  }, [transactions]);

  const value = React.useMemo(() => ({
    // State
    transactions,
    budgets,
    paymentReminders,
    analytics,
    isDataLoaded,
    isLoading,
    error,

    // Actions
    loadDataFromZip,
    refreshAnalytics,
    clearData,
    getActiveTransactions,
  }), [transactions, budgets, paymentReminders, analytics, isDataLoaded, isLoading, error, loadDataFromZip, refreshAnalytics, clearData, getActiveTransactions]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;

