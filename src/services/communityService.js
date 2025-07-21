import axios from '../api/axios';

// Remove duplicate interceptors - use only the original ones
export const getAllPosts = async () => {
  const response = await axios.get('/api/community/posts');
  return response.data;
};

export const createPost = async (postData) => {
  const response = await axios.post('/api/community/posts', postData);
  return response.data;
};
