import JSZip from 'jszip';
import Papa from 'papaparse';

/**
 * Parses a CSV string into an array of objects
 * @param {string} csvText - CSV content as string
 * @param {Function} rowMapper - Function to map each row to desired object structure
 * @returns {Array} Array of parsed objects
 */
const parseCSV = (csvText, rowMapper) => {
  const result = Papa.parse(csvText, {
    skipEmptyLines: true,
  });

  const lines = result.data;
  
  // Skip version header if present
  let startIndex = 0;
  if (lines.length > 0 && lines[0][0]?.startsWith('CSV_VERSION')) {
    startIndex = 2; // Skip version and header row
  } else {
    startIndex = 1; // Skip header row only
  }

  const parsedData = [];
  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i];
    if (row && row.length > 0) {
      const mappedRow = rowMapper(row);
      if (mappedRow) {
        parsedData.push(mappedRow);
      }
    }
  }

  return parsedData;
};

/**
 * Maps transaction CSV row to transaction object
 */
const mapTransaction = (row) => {
  if (row.length < 24) return null;
  
  return {
    id: row[0],
    userId: row[1],
    amount: parseFloat(row[2]) || null,
    currencyCode: row[3],
    exchangeRate: parseFloat(row[4]) || null,
    type: row[5],
    categoryId: row[6],
    subcategory: row[7],
    description: row[8],
    notes: row[9],
    transactionDate: parseInt(row[10]) || null,
    transactionTime: parseInt(row[11]) || null,
    accountName: row[12],
    paymentMethod: row[13],
    referenceNumber: row[14],
    location: row[15],
    tags: row[16],
    isRecurring: parseInt(row[17]) || 0,
    recurringPattern: row[18],
    receiptImagePath: row[19],
    isTaxDeductible: parseInt(row[20]) || 0,
    createdAt: parseInt(row[21]) || null,
    updatedAt: parseInt(row[22]) || null,
    isDeleted: parseInt(row[23]) || 0,
  };
};

/**
 * Maps budget CSV row to budget object
 */
const mapBudget = (row) => {
  if (row.length < 16) return null;
  
  return {
    id: row[0],
    userId: row[1],
    name: row[2],
    description: row[3],
    categoryId: row[4],
    categoryName: row[5],
    budgetAmount: row[6],
    spentAmount: row[7],
    period: row[8],
    startDate: row[9],
    endDate: row[10],
    status: row[11],
    isActive: parseInt(row[12]) || 0,
    isRecurring: parseInt(row[13]) || 0,
    createdAt: parseInt(row[14]) || null,
    updatedAt: parseInt(row[15]) || null,
  };
};

/**
 * Maps payment reminder CSV row to payment reminder object
 */
const mapPaymentReminder = (row) => {
  if (row.length < 25) return null;
  
  return {
    id: row[0],
    userId: row[1],
    title: row[2],
    category: row[3],
    amount: parseFloat(row[4]) || null,
    currencyCode: row[5],
    dueDate: parseInt(row[6]) || null,
    dueTime: row[7],
    repeatType: row[8],
    repeatInterval: parseInt(row[9]) || 0,
    repeatUnit: row[10],
    nextDueDate: parseInt(row[11]) || null,
    notificationTime: parseInt(row[12]) || 0,
    notificationEnabled: parseInt(row[13]) || 0,
    notificationId: parseInt(row[14]) || 0,
    status: row[15],
    isActive: parseInt(row[16]) || 0,
    snoozeUntil: parseInt(row[17]) || null,
    notes: row[18],
    paymentMethod: row[19],
    autoCreateTransaction: parseInt(row[20]) || 0,
    createdAt: parseInt(row[21]) || null,
    updatedAt: parseInt(row[22]) || null,
    lastNotifiedAt: parseInt(row[23]) || null,
    completionCount: parseInt(row[24]) || 0,
  };
};

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
 * Extracts currency code from budget amount string
 */
const extractCurrencyCode = (amountStr) => {
  if (!amountStr || amountStr === '') return 'INR';
  try {
    const parts = amountStr.split(',');
    return parts.length > 1 ? parts[1].trim() : 'INR';
  } catch {
    return 'INR';
  }
};

/**
 * Synchronizes budget spent amounts with actual transactions
 */
const synchronizeBudgetWithTransactions = (budgets, transactions) => {
  const activeTransactions = transactions.filter(t => t.isDeleted === 0);
  
  console.log('=== Budget Synchronization Debug ===');
  console.log('Total budgets:', budgets.length);
  console.log('Total active transactions:', activeTransactions.length);

  return budgets.map(budget => {
    const budgetCategoryId = budget.categoryId;
    const budgetCategoryName = budget.categoryName;

    if (!budgetCategoryId || budgetCategoryId.trim() === '') {
      console.log('Skipping budget with no categoryId:', budget.name);
      return budget;
    }

    console.log('\n=== Processing budget:', budget.name, '===');
    console.log('  Budget Category ID:', `"${budgetCategoryId}"`);
    console.log('  Budget Category Name:', `"${budgetCategoryName}"`);
    console.log('  Budget Amount:', budget.budgetAmount);

    // Calculate actual spent from transactions matching this budget's category ID
    // Normalize category ID: trim, lowercase, and replace underscores with spaces
    const normalizedBudgetCategoryId = budgetCategoryId.trim().toLowerCase().replace(/_/g, ' ');
    console.log('  → Normalized budget category for matching:', `"${normalizedBudgetCategoryId}"`);
    
    // First, let's see all unique transaction categories for debugging
    const uniqueTransactionCategories = [...new Set(
      activeTransactions
        .filter(t => t.type === 'EXPENSE' && t.categoryId)
        .map(t => t.categoryId.trim())
    )];
    console.log('  → All expense categories in transactions (original):', uniqueTransactionCategories);
    console.log('  → All expense categories (normalized):', 
      uniqueTransactionCategories.map(c => c.toLowerCase().replace(/_/g, ' ')));
    
    const matchedTransactions = [];
    const actualSpent = activeTransactions
      .filter(t => t.type === 'EXPENSE')
      .filter(t => {
        const transactionCategoryId = t.categoryId;
        if (!transactionCategoryId) return false;
        
        // Normalize transaction category: trim, lowercase, and replace underscores with spaces
        const normalizedTransactionCategoryId = transactionCategoryId.trim().toLowerCase().replace(/_/g, ' ');
        const matches = normalizedBudgetCategoryId === normalizedTransactionCategoryId;
        
        if (matches) {
          matchedTransactions.push(t);
          console.log('    ✓ Matched:', t.description, '→ ₹', t.amount);
        }
        return matches;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    console.log('  → Total transactions matched:', matchedTransactions.length);

    console.log('  → Total spent calculated:', actualSpent);

    // Update budget with actual spent amount
    const currencyCode = extractCurrencyCode(budget.budgetAmount);
    const updatedSpentAmount = `${actualSpent.toFixed(2)},${currencyCode}`;

    // Update status based on actual spending
    const budgetAmount = parseBudgetAmount(budget.budgetAmount);
    let status;
    if (actualSpent > budgetAmount) {
      status = 'OVER_BUDGET';
    } else if (actualSpent > budgetAmount * 0.8) {
      status = 'WARNING';
    } else {
      status = 'ON_TRACK';
    }

    console.log('  → Parsed budget amount:', budgetAmount);
    console.log('  → Updated spent amount:', updatedSpentAmount);
    console.log('  → Percentage used:', ((actualSpent / budgetAmount) * 100).toFixed(2) + '%');
    console.log('  → Status:', status);

    return {
      ...budget,
      spentAmount: updatedSpentAmount,
      status,
    };
  });
};

/**
 * Processes a ZIP file and extracts transaction, budget, and payment reminder data
 * @param {File} file - ZIP file from file input
 * @returns {Promise<Object>} Object containing transactions, budgets, and paymentReminders arrays
 */
/**
 * Synchronizes budget spent amounts with actual transactions (exported for use in DataContext)
 */
export { synchronizeBudgetWithTransactions };

/**
 * Processes a ZIP file and extracts transaction, budget, and payment reminder data
 * @param {File} file - ZIP file from file input
 * @returns {Promise<Object>} Object containing transactions, budgets, and paymentReminders arrays
 */
export const processZipFile = async (file) => {
  try {
    const zip = await JSZip.loadAsync(file);
    
    let transactions = [];
    let budgets = [];
    let paymentReminders = [];

    // Process each file in the ZIP
    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      
      if (filename.endsWith('.csv')) {
        const csvText = await zipEntry.async('text');
        
        if (filename.includes('transactions.csv')) {
          console.log('Parsing transactions.csv');
          transactions = parseCSV(csvText, mapTransaction);
          console.log('Parsed transactions:', transactions.length);
        } else if (filename.includes('budgets.csv') && !filename.includes('budget_history')) {
          console.log('Parsing budgets.csv');
          budgets = parseCSV(csvText, mapBudget);
          console.log('Parsed budgets:', budgets.length);
        } else if (filename.includes('payment_reminders.csv')) {
          console.log('Parsing payment_reminders.csv');
          paymentReminders = parseCSV(csvText, mapPaymentReminder);
          console.log('Parsed payment reminders:', paymentReminders.length);
        }
      }
    }

    // Synchronize budget spent amounts with actual transactions
    budgets = synchronizeBudgetWithTransactions(budgets, transactions);
    console.log('=== Budget Synchronization Complete ===');
    
    // Log final synchronized budgets
    console.log('\n=== Final Synchronized Budgets ===');
    budgets.forEach(b => {
      console.log(`${b.name}: Budget=${b.budgetAmount}, Spent=${b.spentAmount}, Status=${b.status}`);
    });

    return {
      transactions,
      budgets,
      paymentReminders,
    };
  } catch (error) {
    console.error('Error processing ZIP file:', error);
    throw new Error('Failed to process ZIP file: ' + error.message);
  }
};

export default {
  processZipFile,
};

