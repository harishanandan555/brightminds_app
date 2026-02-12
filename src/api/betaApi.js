import api from './axios';

/**
 * Accept beta program terms
 * @returns {Promise<Object>} - Acceptance confirmation with betaProgram data
 */
export const acceptBeta = async () => {
    const response = await api.post('/beta/accept');
    return response.data;
};

/**
 * Decline beta program terms (blocks future login access)
 * @returns {Promise<Object>} - Decline confirmation
 */
export const declineBeta = async () => {
    const response = await api.post('/beta/decline');
    return response.data;
};

/**
 * Get current user's beta program status
 * @returns {Promise<Object>} - { hasAccepted, hasDeclined, hasSeenConfirmation }
 */
export const getBetaStatus = async () => {
    const response = await api.get('/beta/status');
    return response.data;
};

/**
 * Mark the beta confirmation page as seen (one-time display)
 * @returns {Promise<Object>} - Confirmation update
 */
export const markConfirmationSeen = async () => {
    const response = await api.patch('/beta/confirmation-seen');
    return response.data;
};

export default {
    acceptBeta,
    declineBeta,
    getBetaStatus,
    markConfirmationSeen
};
