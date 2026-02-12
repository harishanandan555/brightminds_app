
import React, { useState, useEffect } from 'react';
import { listAllFeedback } from '../api/adminApi';

const AdminFeedbackList = () => {
    const [feedback, setFeedback] = useState({ feedback: [], pagination: {} });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ page: 1, limit: 10, type: '', status: '' });

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const data = await listAllFeedback(filter);
            setFeedback(data.data || data);
        } catch (err) {
            console.error('Failed to fetch feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [filter.page, filter.type, filter.status]);

    const handlePageChange = (newPage) => {
        setFilter(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="admin-list-container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>📋 All Feedback</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={filter.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                    >
                        <option value="">All Types</option>
                        <option value="general">General</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="question">Question</option>
                    </select>
                    <select
                        value={filter.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading feedback...</div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-default)', background: '#f9fafb' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Message</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Rating</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(feedback.feedback || []).length > 0 ? (
                                    (feedback.feedback || []).map((f) => (
                                        <tr key={f._id || f.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: f.type === 'bug' ? '#fee2e2' : f.type === 'feature' ? '#dbeafe' : '#f3f4f6',
                                                    color: f.type === 'bug' ? '#991b1b' : f.type === 'feature' ? '#1e40af' : '#374151'
                                                }}>
                                                    {f.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.message}>
                                                {f.message}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {f.rating ? '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating) : '—'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: f.status === 'resolved' ? '#d1fae5' : f.status === 'pending' ? '#fef3c7' : '#e5e7eb',
                                                    color: f.status === 'resolved' ? '#065f46' : f.status === 'pending' ? '#92400e' : '#374151'
                                                }}>
                                                    {f.status || 'pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{f.email || f.userRole || '—'}</td>
                                            <td style={{ padding: '1rem' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No feedback found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {feedback.pagination && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Page {feedback.pagination.currentPage || 1} of {feedback.pagination.totalPages || 1} ({feedback.pagination.totalItems || 0} items)
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="ghost-button"
                                    disabled={!feedback.pagination.currentPage || feedback.pagination.currentPage <= 1}
                                    onClick={() => handlePageChange((feedback.pagination.currentPage || 1) - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="ghost-button"
                                    disabled={!feedback.pagination.totalPages || feedback.pagination.currentPage >= feedback.pagination.totalPages}
                                    onClick={() => handlePageChange((feedback.pagination.currentPage || 1) + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminFeedbackList;
