import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterData } from '../services/auth.service';

type Role = 'developer' | 'supervisor' | 'tutor' | 'project_manager' | 'team_leader' | 'admin';

const Register: React.FC = () => {
  const { register: registerUser, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'developer' as Role
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      setFormData((prev) => ({ ...prev, [name]: value as Role }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Limpar erros ao digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Limpar erro global do contexto
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      valid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      valid = false;
    }
    
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      valid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await registerUser(formData as RegisterData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Botão para voltar para home */}
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            className="mx-auto h-20 w-auto"
            src="/src/assets/favicon.svg"
            alt="Orquestra"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-dark">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Já possui uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Faça login aqui
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <Alert type="error" message={error} onClose={clearError} />
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              id="name"
              name="name"
              type="text"
              label="Nome completo"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              placeholder="Seu nome completo"
            />

            <FormField
              id="email"
              name="email"
              type="email"
              label="E-mail"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              placeholder="seu@email.com"
            />

            <FormField
              id="password"
              name="password"
              type="password"
              label="Senha"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••"
            />

            <FormField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar senha"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              placeholder="••••••"
            />

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="developer">Desenvolvedor</option>
                <option value="project_manager">Gerente de Projeto</option>
                <option value="team_leader">Líder de Equipe</option>
                <option value="supervisor">Supervisor</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary-light border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Eu concordo com os{' '}
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
              >
                Cadastrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 