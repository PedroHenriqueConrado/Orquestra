import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import Modal from '../components/ui/Modal';
import AppLayout from '../layouts/AppLayout';
import { getRoleDisplayName, getRoleColor, getRoleIcon, getRoleDescription } from '../utils/roleTranslations';

const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
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
    }

    if (showPasswordForm) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Senha atual é obrigatória';
      }
      if (!formData.newPassword) {
        errors.newPassword = 'Nova senha é obrigatória';
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
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
    <AppLayout>
      <div className="max-w-lg mx-auto bg-theme-surface rounded-xl shadow-lg p-8 mt-8 mb-8 border border-theme transition-colors">
        <h2 className="text-3xl font-bold text-center text-theme-primary mb-8 tracking-tight">Perfil do Usuário</h2>
        
        {/* Informações do usuário */}
        {user && (
          <div className="mb-6 p-4 bg-theme rounded-lg border border-theme">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">{user.name}</h3>
                <p className="text-sm text-theme-secondary">{user.email}</p>
              </div>
            </div>
            
            {/* Cargo do usuário */}
            {user.role && (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getRoleIcon(user.role)}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            )}
            
            {/* Descrição do cargo */}
            {user.role && (
              <p className="text-xs text-theme-secondary mt-2">
                {getRoleDescription(user.role)}
              </p>
            )}
          </div>
        )}
        
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="bg-theme-secondary text-theme-muted"
          />
          {!showPasswordForm ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
                disabled={loading}
              >
                Alterar Senha
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
              <div className="flex justify-center space-x-4">
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
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <Button
              type="submit"
              variant="save"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
        <div className="mt-8 pt-6 border-t border-theme flex justify-center">
          <Button
            type="button"
            variant="delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            Excluir Conta
          </Button>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Conta"
      >
        <div className="p-6">
          <p className="text-theme-secondary mb-4">
            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="delete"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default Profile; 