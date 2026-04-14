import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70';
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/40 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/30 hover:bg-secondary-600 hover:shadow-xl hover:shadow-secondary-500/40 focus:ring-secondary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const opacityClass = disabled || isLoading ? 'opacity-70 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes.md} ${widthClass} ${opacityClass} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      <span className={isLoading ? 'opacity-0' : 'opacity-100 flex items-center justify-center gap-2'}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
           {/* Loader is already rendered above, but if we wanted to center it perfectly irrespective of content... */}
        </span>
      )}
    </button>
  );
};
