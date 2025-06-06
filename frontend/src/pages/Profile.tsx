import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Perfil do Usuário
        </h2>

        {error && (
          <Alert type="error" message={error} />
        )}

        {success && (
          <Alert type="success" message={success} />
        )}

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
            className="bg-gray-50"
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
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 