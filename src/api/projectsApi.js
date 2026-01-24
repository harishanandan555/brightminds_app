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
