import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import ProjectDetails from './pages/ProjectDetails';
import ProjectDashboard from './pages/ProjectDashboard';
import EditProject from './pages/EditProject';
import NewTask from './pages/NewTask';
import TaskDetails from './pages/TaskDetails';
import Dashboard from './pages/Dashboard';
import AdvancedDashboard from './pages/AdvancedDashboard';
import DirectMessages from './pages/DirectMessages';
import ChatDetails from './pages/ChatDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Templates from './pages/Templates';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import { usePermissionRestriction } from './hooks/usePermissionRestriction';
import PermissionRestrictionModal from './components/ui/PermissionRestrictionModal';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/dashboard/advanced" element={
              <PrivateRoute>
                <AdvancedDashboardRoute />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/projects" element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            } />
            
            <Route path="/projects/new" element={
              <PrivateRoute>
                <NewProject />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:id" element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:projectId/dashboard" element={
              <PrivateRoute>
                <ProjectDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:id/edit" element={
              <PrivateRoute>
                <EditProject />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:projectId/tasks/new" element={
              <PrivateRoute>
                <NewTask />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:projectId/tasks/:taskId" element={
              <PrivateRoute>
                <TaskDetails />
              </PrivateRoute>
            } />
            
            <Route path="/templates" element={
              <PrivateRoute>
                <Templates />
              </PrivateRoute>
            } />
            
            <Route path="/messages" element={
              <PrivateRoute>
                <DirectMessages />
              </PrivateRoute>
            } />
            
            <Route path="/messages/:chatId" element={
              <PrivateRoute>
                <ChatDetails />
              </PrivateRoute>
            } />
            
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

// Componente para proteger o dashboard avançado
const AdvancedDashboardRoute: React.FC = () => {
  const { user } = useAuth();
  const { handleRestrictedAction, isModalOpen, currentRestriction, closeModal } = usePermissionRestriction();
  
  // Verificar se pode acessar o dashboard avançado
  if (!handleRestrictedAction('advanced_dashboard')) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
        <PermissionRestrictionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          action={currentRestriction?.action || ''}
          requiredRoles={currentRestriction?.requiredRoles || []}
          currentRole={user?.role || ''}
        />
      </>
    );
  }
  
  return <AdvancedDashboard />;
};

export default App;
