import api from './axios';

export const fetchProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

export const createProject = async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const getProject = async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

export const analyzeProject = async (projectData) => {
    const response = await api.post('/projects/analysis', projectData);
    return response.data;
};

// Progress Item APIs
export const addProgressItem = async (projectId, data) => {
    const response = await api.post(`/projects/${projectId}/progress-item`, data);
    return response.data;
};

export const updateProgressItem = async (projectId, itemId, data) => {
    const response = await api.put(`/projects/${projectId}/progress-item/${itemId}`, data);
    return response.data;
};

export const deleteProgressItem = async (projectId, itemId) => {
    const response = await api.delete(`/projects/${projectId}/progress-item/${itemId}`);
    return response.data;
};

// IEP Document Extraction
export const extractIep = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/projects/extract-iep', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
