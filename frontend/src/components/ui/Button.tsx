import React from 'react';
import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'create' | 'save' | 'delete';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
  isExternal?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  href,
  isExternal = false,
  rounded = false,
  disabled,
  ...props
}) => {
  // Base classes for all button variants
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-105 active:scale-95';
  
  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes with enhanced hover effects
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark border border-transparent focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-theme-secondary text-theme-primary hover:bg-theme-surface border border-theme focus:ring-primary shadow-sm hover:shadow-md',
    outline: 'bg-theme-surface text-theme-secondary hover:bg-theme-secondary border border-theme focus:ring-primary shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 border border-transparent focus:ring-green-500 shadow-sm hover:shadow-md',
    create: 'bg-yellow-500 text-white hover:bg-yellow-600 border border-transparent focus:ring-yellow-500 shadow-sm hover:shadow-md',
    save: 'bg-green-500 text-white hover:bg-green-600 border border-transparent focus:ring-green-500 shadow-sm hover:shadow-md',
    delete: 'bg-red-500 text-white hover:bg-red-600 border border-transparent focus:ring-red-500 shadow-sm hover:shadow-md'
  };

  // Additional classes
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed transform-none hover:scale-100' : '';
  const roundedClass = rounded ? 'rounded-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClass}
    ${widthClass}
    ${roundedClass}
    ${className}
  `;

  // Button content with loading state and icons
  const buttonContent = (
    <>
      {isLoading ? (
        <div className="flex items-center">
          <div className="mr-2 h-4 w-4 border-b-2 border-white rounded-full animate-spin"></div>
          {children}
        </div>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </>
  );

  // If href is provided, render a Link or anchor tag
  if (href) {
    if (isExternal) {
      return (
        <a 
          href={href}
          className={buttonClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonContent}
        </a>
      );
    }
    
    return (
      <Link 
        to={href}
        className={buttonClasses}
      >
        {buttonContent}
      </Link>
    );
  }

  // Otherwise render a button
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button; 