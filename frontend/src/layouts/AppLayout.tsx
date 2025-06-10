import React from 'react';
import type { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-background' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
