import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/authContext';
import CommunityFeed from '../components/community/CommunityFeed';
import CreatePost from '../components/community/CreatePost';
import CommunitySearch from '../components/community/CommunitySearch';
import { getAllPosts, searchPosts } from '../services/communityService';

const Community = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMode, setSearchMode] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllPosts(currentPage);
      if (response.success) {
        setPosts(response.posts);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchMode(false);
      setSearchQuery('');
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      setSearchQuery(query);
      const response = await searchPosts(query);
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !searchMode) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel Community</h1>
              <p className="text-gray-600 mt-2">
                Share your travel experiences and get advice from fellow travelers
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {posts.reduce((acc, post) => acc + post.replies.length, 0)}
                </div>
                <div className="text-sm text-gray-500">Replies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CommunitySearch onSearch={handleSearch} />
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Popular Destinations</h3>
                <div className="space-y-2">
                  {['Hunza', 'Skardu', 'Naran', 'Murree', 'Swat'].map((location) => (
                    <button
                      key={location}
                      onClick={() => handleSearch(location)}
                      className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      #{location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Tips */}
              <div className="bg-white rounded-lg shadow p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Travel Tips</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Share photos of your destination</p>
                  <p>• Include location in your posts</p>
                  <p>• Ask specific questions</p>
                  <p>• Help fellow travelers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {user && (
              <div className="mb-6">
                <CreatePost onPostCreated={handlePostCreated} />
              </div>
            )}

            {searchMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">
                    Search results for: <strong>"{searchQuery}"</strong>
                  </span>
                  <button
                    onClick={() => handleSearch('')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}

            <CommunityFeed
              posts={posts}
              loading={loading}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />

            {/* Pagination */}
            {!searchMode && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNum = Math.max(1, currentPage - 2) + index;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'text-blue-600 bg-blue-50 border border-blue-500'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 