import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProjects as fetchProjectsApi, createProject as createProjectApi, updateProject as updateProjectApi, deleteProject as deleteProjectApi, analyzeProject as analyzeProjectApi } from '../../api/projectsApi';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchProjectsApi();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch projects');
        }
    }
);

export const createProject = createAsyncThunk(
    'projects/createProject',
    async (projectData, { rejectWithValue }) => {
        try {
            const data = await createProjectApi(projectData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create project');
        }
    }
);

export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updateProjectApi(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update project');
        }
    }
);

export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async (id, { rejectWithValue }) => {
        try {
            await deleteProjectApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete project');
        }
    }
);

export const analyzeProject = createAsyncThunk(
    'projects/analyzeProject',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await analyzeProjectApi(projectData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to analyze project');
        }
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Projects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Clear items on error to prevent stale/invalid state (e.g., 401 Unauthorized)
                state.items = [];
            })
            // Create Project
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update Project
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete Project
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default projectSlice.reducer;
