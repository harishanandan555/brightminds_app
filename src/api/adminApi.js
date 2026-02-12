import api from './axios';

/**
 * List all users (Admin/Superadmin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page (max: 100)
 * @param {string} [params.role] - Filter by role: "teacher", "parent", "superadmin"
 * @returns {Promise<Object>} - Paginated users list
 */
export const listUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

/**
 * List all feedback (Admin/Superadmin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page (max: 100)
 * @param {string} [params.type] - Filter: "general", "bug", "feature", "improvement", "question"
 * @param {string} [params.status] - Filter: "pending", "reviewed", "in-progress", "resolved", "closed"
 * @returns {Promise<Object>} - Paginated feedback list
 */
export const listAllFeedback = async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
};

export default {
    listUsers,
    listAllFeedback
};
