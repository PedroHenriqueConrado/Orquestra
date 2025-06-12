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
import DirectMessages from './pages/DirectMessages';
import ChatDetails from './pages/ChatDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rotas protegidas com MainLayout */}
            <Route element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProject />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/projects/:projectId/dashboard" element={<ProjectDashboard />} />
              <Route path="/projects/:id/edit" element={<EditProject />} />
              <Route path="/projects/:projectId/tasks/new" element={<NewTask />} />
              <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
              <Route path="/messages" element={<DirectMessages />} />
              <Route path="/messages/:chatId" element={<ChatDetails />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
