import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import Modal from '../components/ui/Modal';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      errors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (showPasswordForm) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Senha atual é obrigatória';
      }

      if (!formData.newPassword) {
        errors.newPassword = 'Nova senha é obrigatória';
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'Nova senha deve ter no mínimo 6 caracteres';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não conferem';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setSaveAnimation(true);
      
      // Se estiver alterando a senha
      if (showPasswordForm) {
        try {
          await updatePassword(formData.currentPassword, formData.newPassword);
          setShowPasswordForm(false);
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
          setSuccess('Senha alterada com sucesso!');
        } catch (err: any) {
          console.error('Erro ao alterar senha:', err);
          if (err.message === 'Senha atual incorreta') {
            setFormErrors(prev => ({
              ...prev,
              currentPassword: 'A senha atual está incorreta'
            }));
            setLoading(false);
            setSaveAnimation(false);
            return;
          }
          let errorMessage = 'Erro ao alterar senha';
          
          if (err.message.includes('network')) {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
          } else if (err.message.includes('401')) {
            errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
          }
          
          setError(errorMessage);
          setLoading(false);
          setSaveAnimation(false);
          return;
        }
      }
      
      // Atualizar perfil
      await updateProfile({
        name: formData.name
      });
      
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      let errorMessage = 'Erro ao atualizar perfil';
      
      if (err.message.includes('network')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setSaveAnimation(false), 1000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      await deleteAccount();
      navigate('/');
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      let errorMessage = 'Erro ao excluir conta';
      
      if (err.message === 'Usuário não autenticado') {
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (err.message.includes('network')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-50'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs />
        </div>

        <div className={`${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <div className={`px-6 py-8 ${theme === 'dark' ? 'border-b border-dark-border' : 'border-b border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
              Perfil do Usuário
            </h2>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6">
                <Alert type="error" message={error} />
              </div>
            )}

            {success && (
              <div className="mb-6">
                <Alert type="success" message={success} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  id="name"
                  label="Nome"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  required
                />

                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className={`${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-50'}`}
                />
              </div>

              {!showPasswordForm ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPasswordForm(true)}
                    disabled={loading}
                    tooltip="Clique para alterar sua senha"
                  >
                    Alterar Senha
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                    Alterar Senha
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      id="currentPassword"
                      label="Senha Atual"
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      error={formErrors.currentPassword}
                      required
                    />

                    <FormField
                      id="newPassword"
                      label="Nova Senha"
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      error={formErrors.newPassword}
                      required
                    />

                    <FormField
                      id="confirmPassword"
                      label="Confirmar Nova Senha"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={formErrors.confirmPassword}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                {showPasswordForm && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setFormData(prev => ({
                        ...prev,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      }));
                      setFormErrors({});
                    }}
                    disabled={loading}
                    tooltip="Cancelar alteração de senha"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="save"
                  isLoading={loading}
                  tooltip="Salvar alterações do perfil"
                  className={saveAnimation ? 'animate-pulse' : ''}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>

          <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-dark-accent border-t border-dark-border' : 'bg-gray-50 border-t border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                  Excluir Conta
                </h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Exclua permanentemente sua conta e todos os seus dados
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={loading || deleteLoading}
                tooltip="Excluir sua conta permanentemente"
              >
                Excluir Conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Conta"
      >
        <div className="mt-4">
          <p className={`${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'} mb-4`}>
            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              tooltip="Cancelar exclusão da conta"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={deleteLoading}
              tooltip="Confirmar exclusão da conta"
            >
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile; 