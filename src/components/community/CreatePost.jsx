import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { createPost } from '../../services/communityService';
import { PhotoIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProviderBadge from '../ui/ProviderBadge';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Helper function to get display name
  const getDisplayName = (userObj) => {
    return userObj?.name || userObj?.username || 'Anonymous User';
  };

  // Helper function to get user initial
  const getUserInitial = (userObj) => {
    const name = getDisplayName(userObj);
    return name.charAt(0).toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please write something before posting!');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('content', content.trim());
      if (location.trim()) formData.append('location', location.trim());
      if (hashtags.trim()) formData.append('hashtags', hashtags.trim());
      if (image) formData.append('image', image);

      const response = await createPost(formData);
      if (response.success) {
        onPostCreated(response.post);
        // Reset form
        setContent('');
        setLocation('');
        setHashtags('');
        setImage(null);
        setImagePreview(null);
        setShowLocationInput(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Please log in to share your travel experiences!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {getUserInitial(user)}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            {/* User info line */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="font-medium text-gray-900">{getDisplayName(user)}</span>
              <ProviderBadge user={user} size="sm" showText={false} />
            </div>
            
            {/* Main content textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's your travel experience? Ask about destinations, share tips..."
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              maxLength="500"
            />
            
            {/* Character count */}
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/500
            </div>

            {/* Location input */}
            {showLocationInput && (
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (e.g., Hunza Valley, Pakistan)"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationInput(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Hashtags input */}
            <div className="mt-3">
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Add hashtags (e.g., #Hunza, #Summer, #Adventure)"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                {/* Image upload */}
                <label className="cursor-pointer text-blue-600 hover:text-blue-800">
                  <PhotoIcon className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Location toggle */}
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`${
                    showLocationInput ? 'text-blue-600' : 'text-gray-400'
                  } hover:text-blue-600`}
                >
                  <MapPinIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Post button */}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 