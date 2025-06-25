import React from 'react';
import Dialog from './Dialog';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          icon: (
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'success':
        return {
          icon: (
            <svg className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'info':
      default:
        return {
          icon: (
            <svg className="h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
    >
      <div className="text-center">
        {styles.icon}
        
        <p className="text-theme-secondary mb-6 text-sm leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-center">
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${styles.button}`}
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default AlertDialog; 