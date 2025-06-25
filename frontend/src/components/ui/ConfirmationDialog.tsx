import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      case 'info':
        return {
          icon: (
            <svg className="h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      default:
        return {
          icon: (
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
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
        
        <div className="flex justify-center space-x-3">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${styles.cancelButton}`}
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${styles.confirmButton}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog; 