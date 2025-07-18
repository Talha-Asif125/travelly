import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const AdminBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-1" />
      <span>Back</span>
    </button>
  );
};

export default AdminBackButton; 