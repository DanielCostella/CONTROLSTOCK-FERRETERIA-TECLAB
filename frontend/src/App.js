import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Reportes from './pages/Reportes';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

// Componente que maneja las rutas principales
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta de autenticación */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
      />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      
      {/* Redireccionar rutas no encontradas */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
