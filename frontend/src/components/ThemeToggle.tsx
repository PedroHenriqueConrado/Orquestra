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
      className={`relative p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        theme === 'dark' 
          ? 'bg-dark-accent text-dark-text hover:bg-dark-surface hover:scale-105' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
      } ${className}`}
      aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <div className="relative">
        {theme === 'dark' ? (
          <SunIcon className="h-5 w-5 transition-transform duration-300 rotate-0" />
        ) : (
          <MoonIcon className="h-5 w-5 transition-transform duration-300 rotate-0" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle; 