import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/projects';

export const createProjectRequest = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-request/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
