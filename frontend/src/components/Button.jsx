import React from 'react';

const Button = ({
  backgroundColor,
  color,
  size,
  onClick,
  disabled,
  type,
  className,
  style,
  children,
  ...rest
}) => {
  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '12px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '20px',
    },
  };

  const baseStyles = {
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    ...baseStyles,
    ...style,
    ...(sizes[size] || sizes.medium),
    backgroundColor: backgroundColor || 'var(--primary-color)',
    color: color || 'white',
    ...(disabled && { opacity: 0.7, cursor: 'not-allowed' }),
  };

  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className || ''}`}
      style={buttonStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;