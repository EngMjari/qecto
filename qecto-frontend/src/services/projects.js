import axios from 'axios';
import {BASE_URL} from "./../utils/config";

const API_BASE_URL = `"${BASE_URL}/api/projects`;

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
