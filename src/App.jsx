import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login      from './pages/Login';
import Dashboard  from './pages/admin/Dashboard';
import Users      from './pages/admin/Users';
import Clients    from './pages/admin/Clients';
import Audit      from './pages/admin/Audit';
import Versements from './pages/guichetier/Versements';
import MonSolde   from './pages/client/MonSolde';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#F5F5F7' }}>
      <div style={{ fontSize:13, color:'#A1A1AA', fontFamily:'Inter, sans-serif' }}>Chargement...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/dashboard"  element={<PrivateRoute roles={['admin']}><Dashboard /></PrivateRoute>} />
      <Route path="/admin/users"      element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
      <Route path="/admin/clients"    element={<PrivateRoute roles={['admin']}><Clients /></PrivateRoute>} />
      <Route path="/admin/audit"      element={<PrivateRoute roles={['admin']}><Audit /></PrivateRoute>} />
      <Route path="/guichetier/versements" element={<PrivateRoute roles={['guichetier','admin']}><Versements /></PrivateRoute>} />
      <Route path="/client/solde"     element={<PrivateRoute roles={['client']}><MonSolde /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover
          style={{ fontFamily:'Inter, sans-serif', fontSize:13 }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}