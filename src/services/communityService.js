import axios from '../api/axios';

export const getAllPosts = async (page = 1) => {
  const response = await axios.get(`/api/community/posts?page=${page}`);
  return response.data;
};

export const searchPosts = async (query, page = 1) => {
  const response = await axios.get(`/api/community/posts/search?query=${query}&page=${page}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await axios.post('/api/community/posts', postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axios.delete(`/api/community/posts/${postId}`);
  return response.data;
};

export const updatePost = async (postId, postData) => {
  const response = await axios.put(`/api/community/posts/${postId}`, postData);
  return response.data;
};

export const toggleLike = async (postId) => {
  const response = await axios.post(`/api/community/posts/${postId}/like`);
  return response.data;
};

export const addReply = async (postId, replyData) => {
  const response = await axios.post(`/api/community/posts/${postId}/reply`, replyData);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axios.post(`/api/community/posts/${postId}/like`);
  return response.data;
};

export const addComment = async (postId, commentData) => {
  const response = await axios.post(`/api/community/posts/${postId}/comments`, commentData);
  return response.data;
};
