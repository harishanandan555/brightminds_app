
import React, { useState, useEffect } from 'react';
import { listUsers } from '../api/adminApi';

const AdminUsersList = () => {
    const [users, setUsers] = useState({ users: [], pagination: {} });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ page: 1, limit: 10, role: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await listUsers(filter);
            setUsers(data.data || data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter.page, filter.role]);

    const handlePageChange = (newPage) => {
        setFilter(prev => ({ ...prev, page: newPage }));
    };

    const handleRoleChange = (e) => {
        setFilter(prev => ({ ...prev, role: e.target.value, page: 1 }));
    };

    return (
        <div className="admin-list-container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>👥 Users Management</h2>
                <select
                    value={filter.role}
                    onChange={handleRoleChange}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                >
                    <option value="">All Roles</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="superadmin">Superadmin</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-default)', background: '#f9fafb' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Created Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(users.users || []).length > 0 ? (
                                    (users.users || []).map((u) => (
                                        <tr key={u._id || u.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                                            <td style={{ padding: '1rem' }}>{u.name || '—'}</td>
                                            <td style={{ padding: '1rem' }}>{u.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: u.role === 'superadmin' ? '#fee2e2' : u.role === 'teacher' ? '#dbeafe' : '#d1fae5',
                                                    color: u.role === 'superadmin' ? '#991b1b' : u.role === 'teacher' ? '#1e40af' : '#065f46'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.pagination && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Page {users.pagination.currentPage || 1} of {users.pagination.totalPages || 1} ({users.pagination.totalItems || 0} user{users.pagination.totalItems !== 1 ? 's' : ''})
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="ghost-button"
                                    disabled={!users.pagination.currentPage || users.pagination.currentPage <= 1}
                                    onClick={() => handlePageChange((users.pagination.currentPage || 1) - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="ghost-button"
                                    disabled={!users.pagination.totalPages || users.pagination.currentPage >= users.pagination.totalPages}
                                    onClick={() => handlePageChange((users.pagination.currentPage || 1) + 1)}
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

export default AdminUsersList;
