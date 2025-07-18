import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Standardized Button Component
 * Provides consistent button styling and behavior across the application
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const disabledClass = disabled || loading ? 'btn--disabled' : '';
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = loading ? 'btn--loading' : '';

  const buttonClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    disabledClass,
    fullWidthClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <span className="btn__spinner" aria-hidden="true" />;
    }
    if (icon) {
      return <span className="btn__icon" aria-hidden="true">{icon}</span>;
    }
    return null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          {renderIcon()}
          <span className="btn__text">Loading...</span>
        </>
      );
    }

    if (iconPosition === 'right') {
      return (
        <>
          <span className="btn__text">{children}</span>
          {renderIcon()}
        </>
      );
    }

    return (
      <>
        {renderIcon()}
        <span className="btn__text">{children}</span>
      </>
    );
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {renderContent()}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'outline-primary',
    'outline-secondary',
    'outline-success',
    'outline-danger',
    'outline-warning',
    'outline-info',
    'link',
    'ghost'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
};

Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  icon: null,
  iconPosition: 'left',
  fullWidth: false,
  onClick: null,
  type: 'button',
  className: ''
};

export default Button; 