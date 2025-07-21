import axios from '../api/axios';

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log('Making request to:', config.url, 'with token:', token ? 'present' : 'missing');
  return config;
});

// Response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    // console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // console.log('Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Unused helper function - keeping for potential future use
// const makeRequest = async (config) => {
//   try {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
//     }
//     
//     const response = await axios(config);
//     return response.data;
//   } catch (error) {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     throw error;
//   }
// };

// Get all posts with pagination
export const getAllPosts = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (query, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

// Get posts by location
export const getPostsByLocation = async (location, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`/posts/location/${encodeURIComponent(location)}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts by location:', error);
    throw error;
  }
};

// Get user's posts
export const getUserPosts = async (userId, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (formData) => {
  try {
    const response = await axios.post('/api/community/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error.response?.data || error.message);
    throw error;
  }
};

// Add reply to a post
export const addReply = async (postId, replyData) => {
  try {
    let requestData;
    let config = {};
    
    // Check if image is included in reply data
    if (replyData.image) {
      // Use FormData for image upload
      requestData = new FormData();
      requestData.append('content', replyData.content || '');
      if (replyData.image) {
        requestData.append('image', replyData.image);
      }
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    } else {
      // Use regular JSON for text-only replies
      requestData = { content: replyData.content };
      config.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    const response = await axios.post(`/posts/${postId}/reply`, requestData, config);
    return response.data;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// Toggle like on a post
export const toggleLike = async (postId) => {
  try {
    const response = await axios.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await axios.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

const communityService = {
  getAllPosts,
  searchPosts,
  getPostsByLocation,
  getUserPosts,
  createPost,
  addReply,
  toggleLike,
  deletePost,
};

export default communityService; 