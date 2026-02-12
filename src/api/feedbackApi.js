import api from './axios';

/**
 * Submit feedback to the server
 * @param {Object} feedbackData - The feedback data to submit
 * @param {string} feedbackData.type - Feedback type: "general", "bug", "feature", "improvement", "question"
 * @param {number} [feedbackData.rating] - Rating 1-5
 * @param {string} feedbackData.message - Feedback message (min 10 characters)
 * @param {string} [feedbackData.email] - Contact email
 * @param {boolean} [feedbackData.allowContact] - Allow follow-up contact
 * @returns {Promise<Object>} - The submitted feedback response
 */
export const submitFeedback = async (feedbackData) => {
    const response = await api.post('/feedback', {
        type: feedbackData.type,
        rating: feedbackData.rating,
        message: feedbackData.message,
        email: feedbackData.email,
        allowContact: feedbackData.allowContact
    });
    return response.data;
};

/**
 * Get user's submitted feedback (future implementation)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.type] - Filter by feedback type
 * @returns {Promise<Object>} - List of user's feedback
 */
export const getMyFeedback = async (params = {}) => {
    const response = await api.get('/feedback/my-feedback', { params });
    return response.data;
};

export default {
    submitFeedback,
    getMyFeedback
};
