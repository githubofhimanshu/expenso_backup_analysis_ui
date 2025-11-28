import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import Passbook from './components/Passbook';
import { BarChart3, BookOpen, Sun, Moon } from 'lucide-react';

function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });

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

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '0',
            right: '1rem',
            padding: '0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
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

        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Expense Analysis
        </h1>
        <p className="text-secondary">Visualize your financial health with comprehensive insights</p>
      </header>

      {!dataLoaded ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <UploadZone onUploadSuccess={() => setDataLoaded(true)} />

          {/* Temporary button to skip upload for dev if data exists */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn" onClick={() => setDataLoaded(true)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
              View Dashboard (if data exists)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid var(--border)',
            padding: '0 1rem'
          }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '-2px',
                transition: 'all 0.3s'
              }}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('passbook')}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'passbook' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'passbook' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '-2px',
                transition: 'all 0.3s'
              }}
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
    </div>
  );
}

export default App;
