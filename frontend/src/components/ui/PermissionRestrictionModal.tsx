import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getRoleDisplayName } from '../../utils/roleTranslations';

interface PermissionRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  requiredRoles: string[];
  currentRole: string;
}

const PermissionRestrictionModal: React.FC<PermissionRestrictionModalProps> = ({
  isOpen,
  onClose,
  action,
  requiredRoles,
  currentRole
}) => {
  const getRoleIcons = (role: string) => {
    const icons: Record<string, string> = {
      'team_leader': '👥',
      'project_manager': '📊',
      'admin': '⚙️',
      'supervisor': '👨‍💼',
      'tutor': '📚'
    };
    return icons[role] || '👤';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'team_leader': 'bg-blue-100 text-blue-800 border-blue-200',
      'project_manager': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'supervisor': 'bg-green-100 text-green-800 border-green-200',
      'tutor': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Acesso Restrito
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Você não pode <strong>{action}</strong> porque seu cargo atual é:
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                👨‍💻 {getRoleDisplayName(currentRole)}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-3">
                Esta ação requer um dos seguintes cargos:
              </p>
              <div className="space-y-2">
                {requiredRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <span className="text-lg">{getRoleIcons(role)}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role)}`}>
                      {getRoleDisplayName(role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Entre em contato com seu gerente de projeto ou administrador 
                para solicitar acesso a esta funcionalidade.
              </p>
            </div>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PermissionRestrictionModal; 