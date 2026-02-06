import api from './axios';

// Get all children for the logged-in parent
export const fetchChildren = async () => {
    const response = await api.get('/parent/children');
    return response.data;
};

// Add a new child profile
export const addChild = async (childData) => {
    const response = await api.post('/parent/children', childData);
    return response.data;
};

// Get specific child details
export const getChild = async (id) => {
    const response = await api.get(`/parent/children/${id}`);
    return response.data;
};

// Update child profile
export const updateChild = async (id, childData) => {
    const response = await api.put(`/parent/children/${id}`, childData);
    return response.data;
};

// Delete child profile
export const deleteChild = async (id) => {
    const response = await api.delete(`/parent/children/${id}`);
    return response.data;
};
