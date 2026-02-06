import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchChildren as fetchChildrenApi, addChild as addChildApi, updateChild as updateChildApi, deleteChild as deleteChildApi, getChild as getChildApi } from '../../api/parentApi';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchChildren = createAsyncThunk(
    'parent/fetchChildren',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchChildrenApi();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch children');
        }
    }
);

export const addChild = createAsyncThunk(
    'parent/addChild',
    async (childData, { rejectWithValue }) => {
        try {
            const data = await addChildApi(childData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to add child');
        }
    }
);

export const updateChild = createAsyncThunk(
    'parent/updateChild',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updateChildApi(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update child');
        }
    }
);

export const deleteChild = createAsyncThunk(
    'parent/deleteChild',
    async (id, { rejectWithValue }) => {
        try {
            await deleteChildApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete child');
        }
    }
);

const parentSlice = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Children
            .addCase(fetchChildren.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChildren.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchChildren.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Child
            .addCase(addChild.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addChild.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addChild.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Child
            .addCase(updateChild.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateChild.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateChild.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Child
            .addCase(deleteChild.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteChild.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(deleteChild.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = parentSlice.actions;
export default parentSlice.reducer;
