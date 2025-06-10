import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        theme === 'dark' 
          ? 'bg-dark-accent text-dark-text hover:bg-dark-secondary' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
      aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle; 