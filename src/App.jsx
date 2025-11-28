import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import Passbook from './components/Passbook';
import { BarChart3, BookOpen, Sun, Moon, RotateCcw } from 'lucide-react';

function AppContent() {
  const { isDataLoaded, clearData, analytics } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will remove all transactions, budgets, and reminders from storage.')) {
      clearData();
      setActiveTab('dashboard');
    }
  };

  const handleUploadSuccess = () => {
    setToast({
      type: 'success',
      message: 'Expense data loaded successfully.',
    });
  };

  const handleUploadError = (message) => {
    setToast({
      type: 'error',
      message,
    });
  };

  const transactionsCount = analytics?.transactionCount || 0;
  const monthsCount = analytics ? Object.keys(analytics.monthlyTrends || {}).length : 0;

  return (
    <div className="container">
      <header className="app-header">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`pill-button pill-button--ghost ${isDataLoaded ? 'pill-button--with-clear' : ''}`}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              Light
            </>
          ) : (
            <>
              <Moon size={18} />
              Dark
            </>
          )}
        </button>

        {/* Clear Data Button (shown when data is loaded) */}
        {isDataLoaded && (
          <button
            onClick={handleClearData}
            className="pill-button pill-button--danger"
          >
            <RotateCcw size={18} />
            Clear Data
          </button>
        )}

        <div className="app-header-text">
          <h1 className="app-title">
            Expense Analysis
          </h1>
          <p className="text-secondary">Visualize your financial health with comprehensive insights</p>
          <p className="text-secondary app-subtitle">
            ✨ 100% Client-Side • Your data never leaves your browser
          </p>
          {isDataLoaded && (
            <div className="summary-chip-row">
              <div className="summary-chip">
                {transactionsCount.toLocaleString('en-IN')} transactions
              </div>
              {monthsCount > 0 && (
                <div className="summary-chip">
                  {monthsCount} month{monthsCount === 1 ? '' : 's'} of history
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {!isDataLoaded ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab-button ${activeTab === 'dashboard' ? 'tab-button--active' : ''}`}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('passbook')}
              className={`tab-button ${activeTab === 'passbook' ? 'tab-button--active' : ''}`}
            >
              <BookOpen size={20} />
              Passbook
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'passbook' && <Passbook />}
        </>
      )}

      {toast && (
        <div
          className={`toast toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
