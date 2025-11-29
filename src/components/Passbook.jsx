import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Filter, ArrowUpDown, Calendar, CreditCard, Tag, TrendingUp, TrendingDown, Search } from 'lucide-react';

const Passbook = () => {
    const { transactions: allTransactions, isLoading } = useData();

    // Filter states
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Sorting state
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Responsive table layout
    const [isMobileTable, setIsMobileTable] = useState(false);

    // Get active transactions
    const transactions = React.useMemo(
        () => allTransactions.filter(t => t.isDeleted === 0),
        [allTransactions]
    );

    const filteredTransactions = React.useMemo(() => {
        let filtered = [...transactions];

        // Type filter
        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Category filter
        if (categoryFilter !== 'ALL') {
            filtered = filtered.filter(t => t.categoryId === categoryFilter);
        }

        // Payment method filter
        if (paymentMethodFilter !== 'ALL') {
            filtered = filtered.filter(t => t.paymentMethod === paymentMethodFilter);
        }

        // Search filter
        if (searchTerm) {
            const lowered = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.description?.toLowerCase().includes(lowered) ||
                t.notes?.toLowerCase().includes(lowered)
            );
        }

        // Date range filter
        if (dateRange.start) {
            const startDate = new Date(dateRange.start).getTime();
            filtered = filtered.filter(t => (t.transactionDate || 0) >= startDate);
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end).getTime() + 86400000; // Add 1 day
            filtered = filtered.filter(t => (t.transactionDate || 0) < endDate);
        }

        // Sorting
        filtered.sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case 'date':
                    compareValue = (a.transactionDate || 0) - (b.transactionDate || 0);
                    break;
                case 'amount':
                    compareValue = (a.amount || 0) - (b.amount || 0);
                    break;
                case 'category':
                    compareValue = (a.categoryId || '').localeCompare(b.categoryId || '');
                    break;
                default:
                    compareValue = 0;
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });

        return filtered;
    }, [transactions, typeFilter, categoryFilter, paymentMethodFilter, searchTerm, dateRange, sortBy, sortOrder]);

    const uniqueCategories = React.useMemo(() => {
        return [...new Set(transactions.map(t => t.categoryId).filter(Boolean))].sort();
    }, [transactions]);

    const uniquePaymentMethods = React.useMemo(() => {
        return [...new Set(transactions.map(t => t.paymentMethod).filter(Boolean))].sort();
    }, [transactions]);

    const formatCurrency = (value) => `₹${value?.toLocaleString('en-IN') || 0}`;
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Detect small screens for compact 3-column passbook table
    useEffect(() => {
        const checkIsMobile = () => {
            if (typeof window !== 'undefined') {
                setIsMobileTable(window.innerWidth <= 640);
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    if (isLoading) return <div className="loading-spinner"></div>;

    return (
        <div className="grid">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <CreditCard size={24} color="var(--primary)" />
                        Passbook
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {filteredTransactions.length} transactions
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.85rem',
                    marginBottom: '1.25rem',
                    padding: '0.9rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.75rem'
                }}>
                    {/* Search */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Search size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Description or notes..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Filter size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="ALL">All Types</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Tag size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="ALL">All Categories</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <CreditCard size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Payment Method
                        </label>
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => {
                                setPaymentMethodFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="ALL">All Methods</option>
                            {uniquePaymentMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => {
                                setDateRange({ ...dateRange, start: e.target.value });
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => {
                                setDateRange({ ...dateRange, end: e.target.value });
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                </div>

                {/* Sorting Options */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <ArrowUpDown size={16} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '0.5rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                            <option value="category">Category</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '0.5rem 0.6rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>

                {/* Transactions Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table data-table--passbook">
                        <thead>
                            {isMobileTable ? (
                                <tr>
                                    <th style={{ minWidth: '120px' }}>Date &amp; Time</th>
                                    <th style={{ minWidth: '180px' }}>Details</th>
                                    <th style={{ textAlign: 'right', minWidth: '100px' }}>Amount</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th style={{ minWidth: '120px' }}>Date &amp; Time</th>
                                    <th style={{ minWidth: '140px' }}>Description</th>
                                    <th>Category</th>
                                    <th>Payment Method</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ textAlign: 'center' }}>Type</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {paginatedTransactions.map((transaction, idx) => (
                                isMobileTable ? (
                                    <tr key={transaction.id || idx} className="data-row">
                                        {/* 1. Date & Time */}
                                        <td>
                                            <div className="data-cell--nowrap">{formatDate(transaction.transactionDate)}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="data-cell--nowrap">
                                                {formatTime(transaction.transactionDate)}
                                            </div>
                                        </td>

                                        {/* 2. Description + Category + Payment (with inline labels) */}
                                        <td
                                            style={{
                                                verticalAlign: 'top',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                Description:
                                            </div>
                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                                {transaction.description || 'N/A'}
                                            </div>
                                            {transaction.notes && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                    {transaction.notes}
                                                </div>
                                            )}
                                            <div style={{ marginTop: '0.15rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                Category:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', marginBottom: '0.1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {transaction.categoryId || 'Uncategorized'}
                                                </span>
                                            </div>
                                            {transaction.paymentMethod && (
                                                <>
                                                    <div style={{ marginTop: '0.15rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                        Payment:
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: '500' }}>
                                                        {transaction.paymentMethod}
                                                    </div>
                                                </>
                                            )}
                                        </td>

                                        {/* 3. Amount + Type Icon */}
                                        <td style={{ textAlign: 'right' }}>
                                            <div
                                                className="data-cell--nowrap"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    gap: '0.3rem',
                                                    fontWeight: '600',
                                                    color: transaction.type === 'INCOME' ? '#10b981' : '#ef4444'
                                                }}
                                            >
                                                {formatCurrency(transaction.amount)}
                                                {transaction.type === 'INCOME' ? (
                                                    <TrendingUp size={16} color="#10b981" />
                                                ) : (
                                                    <TrendingDown size={16} color="#ef4444" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={transaction.id || idx} className="data-row">
                                        <td>
                                            <div className="data-cell--nowrap">{formatDate(transaction.transactionDate)}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="data-cell--nowrap">
                                                {formatTime(transaction.transactionDate)}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                maxWidth: '220px',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            <div style={{ fontWeight: '500' }}>{transaction.description || 'N/A'}</div>
                                            {transaction.notes && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                    {transaction.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="data-cell--nowrap">
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                {transaction.categoryId || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }} className="data-cell--nowrap">
                                            {transaction.paymentMethod || 'N/A'}
                                        </td>
                                        <td
                                            className="data-cell--nowrap"
                                            style={{
                                                padding: '0.75rem',
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: transaction.type === 'INCOME' ? '#10b981' : '#ef4444'
                                            }}
                                        >
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {transaction.type === 'INCOME' ? (
                                                <TrendingUp size={18} color="#10b981" />
                                            ) : (
                                                <TrendingDown size={18} color="#ef4444" />
                                            )}
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1.25rem',
                        padding: '0.75rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                background: currentPage === 1 ? 'var(--surface)' : 'var(--primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 1rem',
                                background: currentPage === totalPages ? 'var(--surface)' : 'var(--primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Passbook;
