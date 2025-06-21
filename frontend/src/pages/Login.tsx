import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(formData);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-theme-primary">
          Entre na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-theme-secondary">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            Cadastre-se gratuitamente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-theme-surface py-8 px-4 shadow-sm border border-theme sm:rounded-lg sm:px-10">
          {error && (
            <Alert type="error" message={error} onClose={clearError} />
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary-light border-theme rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-theme-primary">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
              >
                Entrar
              </Button>
              
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => navigate('/register')}
              >
                Criar nova conta
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-theme-surface text-theme-muted">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  <span>Google</span>
                </Button>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  <span>Twitter</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 