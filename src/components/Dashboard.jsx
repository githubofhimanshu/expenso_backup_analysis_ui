import React from 'react';
import { useData } from '../context/DataContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, CreditCard, Calendar, PieChart as PieIcon, Target, Repeat, Zap } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Dashboard = () => {
    const { analytics, isLoading, isDataLoaded } = useData();

    if (isLoading) return <div className="loading-spinner"></div>;
    if (!isDataLoaded || !analytics) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text)' }}>No data available. Please upload your expense data.</div>;

    const categoryData = Object.entries(analytics.categoryBreakdown || {})
        .map(([name, value]) => ({
            name,
            value: Math.round(value)
        }))
        .sort((a, b) => b.value - a.value);

    const paymentData = Object.entries(analytics.paymentMethodBreakdown || {})
        .map(([name, value]) => ({
            name,
            value: Math.round(value)
        }))
        .sort((a, b) => b.value - a.value);

    const monthlyData = Object.entries(analytics.monthlyTrends || {}).map(([month, data]) => ({
        month,
        income: Math.round(data.INCOME || 0),
        expense: Math.round(data.EXPENSE || 0),
        savings: Math.round((data.INCOME || 0) - (data.EXPENSE || 0))
    }));

    // Clone before reversing to avoid mutating analytics.weeklyTrends,
    // which can otherwise cause order flipping on each render.
    const weeklyData = [...(analytics.weeklyTrends || [])].reverse();
    const budgetData = analytics.budgetTracking || [];
    const recurringExpenses = analytics.recurringExpenses || [];
    const dailyAvg = analytics.dailyAverageSpending || {};

    const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;
    const savingsRate = analytics.savingsRate || 0;

    return (
        <div className="grid">
            {/* Summary Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem' }}>
                            <TrendingUp size={28} color="#10b981" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Income</span>
                            <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{formatCurrency(analytics.totalIncome)}</h2>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem' }}>
                            <TrendingDown size={28} color="#ef4444" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Expenses</span>
                            <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{formatCurrency(analytics.totalExpense)}</h2>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem' }}>
                            <DollarSign size={28} color="#6366f1" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Net Savings</span>
                            <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', color: analytics.netSavings >= 0 ? '#10b981' : '#ef4444' }}>
                                {formatCurrency(analytics.netSavings)}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem' }}>
                            <Activity size={28} color="#8b5cf6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Savings Rate</span>
                            <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{savingsRate.toFixed(1)}%</h2>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.75rem' }}>
                            <Zap size={28} color="#f59e0b" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Daily Avg Spending</span>
                            <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{formatCurrency(dailyAvg.average || 0)}</h2>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Over {dailyAvg.totalDays || 0} days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Tracking */}
            {budgetData.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Target size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Budget Tracking (Actual vs Planned)</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        {budgetData.map((budget, idx) => {
                            const percentUsed = budget.percentageUsed || 0;
                            const isOverBudget = percentUsed > 100;
                            const isWarning = percentUsed > 80 && percentUsed <= 100;
                            return (
                                <div key={idx} style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${isOverBudget ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--border)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{budget.category}</span>
                                            <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{budget.period}</div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: isOverBudget ? 'rgba(239, 68, 68, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: isOverBudget ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'
                                        }}>
                                            {budget.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: '600' }}>Spent: {formatCurrency(budget.spentAmount)}</span>
                                            <span className="text-secondary">Budget: {formatCurrency(budget.budgetAmount)}</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '5px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(percentUsed, 100)}%`,
                                                height: '100%',
                                                background: isOverBudget ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                                                transition: 'width 0.3s',
                                                borderRadius: '5px'
                                            }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ fontWeight: '600', color: isOverBudget ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--text)' }}>
                                            {percentUsed.toFixed(1)}% used
                                        </span>
                                        <span style={{ fontWeight: '600', color: budget.remaining >= 0 ? '#10b981' : '#ef4444' }}>
                                            {formatCurrency(Math.abs(budget.remaining))} {budget.remaining >= 0 ? 'remaining' : 'over budget'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Trends Section */}
            <div className="grid grid-cols-2">
                {/* Monthly Trends */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Calendar size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Monthly Trends</h3>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                                <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2} name="Savings" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Spending */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Activity size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Weekly Spending (Last 8 Weeks)</h3>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="week" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="rgba(99, 102, 241, 0.3)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Category and Payment Analysis */}
            <div className="grid grid-cols-2">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <PieIcon size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Expense by Category</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CreditCard size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Payment Methods</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentData} layout="vertical">
                                <XAxis type="number" stroke="var(--text-secondary)" />
                                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                    formatter={(value) => formatCurrency(value)}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recurring Expenses */}
            {recurringExpenses.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Repeat size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Recurring Expenses Detected</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'center' }}>Frequency</th>
                                    <th style={{ textAlign: 'right' }}>Avg Amount</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringExpenses.map((expense, idx) => (
                                    <tr key={idx} className="data-row">
                                        <td>{expense.description}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#8b5cf6'
                                            }}>
                                                {expense.frequency}x
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(expense.averageAmount)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(expense.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Top Expenses */}
                <div className="card">
                <h3>Top 10 Expenses</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Payment Method</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'right' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(analytics.topExpenses || []).map((expense, idx) => (
                                <tr key={idx} className="data-row">
                                    <td>{expense.description || 'N/A'}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}>
                                            {expense.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {expense.paymentMethod || 'N/A'}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {new Date(expense.date).toLocaleDateString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Average Spending */}
            <div className="card">
                <h3>Average Spending by Category</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(analytics.averageByCategory || {}).map(([name, value]) => ({
                            name,
                            average: Math.round(value)
                        })).sort((a, b) => b.average - a.average).slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                formatter={(value) => formatCurrency(value)}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="average" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
