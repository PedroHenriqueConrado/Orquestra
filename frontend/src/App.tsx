import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import ProjectDetails from './pages/ProjectDetails';
import EditProject from './pages/EditProject';
import NewTask from './pages/NewTask';
import TaskDetails from './pages/TaskDetails';
import Dashboard from './pages/Dashboard';
import DirectMessages from './pages/DirectMessages';
import ChatDetails from './pages/ChatDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;
