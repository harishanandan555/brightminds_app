import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBetaStatus, acceptBeta, declineBeta, markConfirmationSeen } from '../../api/betaApi';

const initialState = {
    hasAccepted: false,
    hasDeclined: false,
    hasSeenConfirmation: false,
    statusChecked: false,
    loading: false,
    error: null,
};

// Fetch beta program status for the current user
export const fetchBetaStatus = createAsyncThunk(
    'beta/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getBetaStatus();
            // getBetaStatus returns { success, data: { hasAccepted, hasDeclined, hasSeenConfirmation, acceptedAt } }
            // response is already the axios response.data from betaApi.js
            // So response = { success: true, data: { hasAccepted, ... } }
            console.log('[Beta] Full response from getBetaStatus:', response);
            
            // Extract the actual beta data from the nested structure
            const betaData = response?.data || response;
            console.log('[Beta] Extracted betaData:', betaData);
            
            return betaData;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch beta status';
            return rejectWithValue(message);
        }
    }
);

// Accept beta program terms
export const acceptBetaTerms = createAsyncThunk(
    'beta/accept',
    async (_, { rejectWithValue }) => {
        try {
            const response = await acceptBeta();
            // API returns { success, message, data: { userId, betaProgram: {...} } }
            return response.data?.betaProgram || response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to accept beta terms';
            return rejectWithValue(message);
        }
    }
);

// Decline beta program terms
export const declineBetaTerms = createAsyncThunk(
    'beta/decline',
    async (_, { rejectWithValue }) => {
        try {
            const response = await declineBeta();
            // API returns { success, message, data: { userId, betaProgram: {...} } }
            return response.data?.betaProgram || response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to decline beta terms';
            return rejectWithValue(message);
        }
    }
);

// Mark confirmation page as seen
export const markBetaConfirmationSeen = createAsyncThunk(
    'beta/confirmationSeen',
    async (_, { rejectWithValue }) => {
        try {
            const response = await markConfirmationSeen();
            // API returns { success, message, data: { userId, betaProgram: {...} } }
            return response.data?.betaProgram || response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to mark confirmation as seen';
            return rejectWithValue(message);
        }
    }
);

const betaSlice = createSlice({
    name: 'beta',
    initialState,
    reducers: {
        resetBetaState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch status
            .addCase(fetchBetaStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBetaStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.statusChecked = true;
                state.hasAccepted = action.payload.hasAccepted || false;
                state.hasDeclined = action.payload.hasDeclined || false;
                state.hasSeenConfirmation = action.payload.hasSeenConfirmation || false;
            })
            .addCase(fetchBetaStatus.rejected, (state, action) => {
                state.loading = false;
                state.statusChecked = true;
                state.error = action.payload || 'Failed to fetch beta status';
            })
            // Accept
            .addCase(acceptBetaTerms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(acceptBetaTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.hasAccepted = true;
                state.hasSeenConfirmation = action.payload?.hasSeenConfirmation || false;
            })
            .addCase(acceptBetaTerms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to accept beta terms';
            })
            // Decline
            .addCase(declineBetaTerms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(declineBetaTerms.fulfilled, (state) => {
                state.loading = false;
                state.hasDeclined = true;
            })
            .addCase(declineBetaTerms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to decline beta terms';
            })
            // Confirmation seen
            .addCase(markBetaConfirmationSeen.pending, (state) => {
                state.loading = true;
            })
            .addCase(markBetaConfirmationSeen.fulfilled, (state) => {
                state.loading = false;
                state.hasSeenConfirmation = true;
            })
            .addCase(markBetaConfirmationSeen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to mark confirmation as seen';
            })
            // Reset state on logout
            .addCase('auth/logout', () => initialState);
    },
});

export const { resetBetaState } = betaSlice.actions;
export default betaSlice.reducer;
