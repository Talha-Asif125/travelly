import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

/**
 * ProviderBadge component - displays verification badge for provider users
 * 
 * @param {Object} user - User object with type property
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showText - Whether to show "Verified Provider" text (default: true)
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * // Basic usage
 * <ProviderBadge user={user} />
 * 
 * @example
 * // Small size with no text (icon only)
 * <ProviderBadge user={user} size="sm" showText={false} />
 * 
 * @example
 * // Large size with custom styling
 * <ProviderBadge user={user} size="lg" className="ml-4" />
 */
const ProviderBadge = ({ user, size = 'md', showText = true, className = '' }) => {
  if (!user || user.type !== 'provider') {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm', 
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const badgeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <div className={`flex items-center provider-badge ${className}`}>
      <FaCheckCircle className={`text-blue-500 mr-1 ${iconSizes[size]}`} />
      {showText && (
        <span className={`bg-blue-100 text-blue-800 rounded-full font-medium ${badgeClasses[size]}`}>
          Verified Provider
        </span>
      )}
    </div>
  );
};

export default ProviderBadge; 