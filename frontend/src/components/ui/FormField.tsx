import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
  name?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  id,
  name,
  type = 'text',
  className = '',
  required,
  ...props
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && (
          <p className="text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
      <input
        id={id}
        name={name || id}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`appearance-none block w-full px-3 py-2 border bg-gray-800 ${
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-primary-light focus:border-primary-light'
        } rounded-md shadow-sm placeholder-gray-500 text-primary-lighter focus:outline-none focus:ring-2 sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

export default FormField; 