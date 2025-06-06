import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Register from './views/Register';
import User from './views/User';
import AdminForecast from './views/AdminForecast';
import AdminActivities from './views/AdminDActivities';
import AdminDActivities from './views/AdminDActivities';
import AdminTags from './views/AdminTags';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('UserLoged') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        } />
        <Route path="/admin/tags" element={
          <ProtectedRoute>
            <AdminTags />
          </ProtectedRoute>
        } />
        <Route path="/admin/activities" element={
          <ProtectedRoute>
            <AdminDActivities />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

