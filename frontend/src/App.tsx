import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import BureauxPage from '@/pages/bureaux/BureauxPage';
import RapportsPage from '@/pages/rapports/RapportsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initAuth();
    setIsInitialized(true);
  }, [initAuth]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        
        <Route path="/bureaux" element={
          <PrivateRoute>
            <BureauxPage />
          </PrivateRoute>
        } />
        
        <Route path="/rapports" element={
          <PrivateRoute>
            <RapportsPage />
          </PrivateRoute>
        } />
        
        <Route path="/sinistres" element={
          <PrivateRoute>
            <div className="p-8 text-center">Module Sinistres - En développement</div>
          </PrivateRoute>
        } />
        
        <Route path="/statistiques" element={
          <PrivateRoute>
            <div className="p-8 text-center">Module Statistiques - En développement</div>
          </PrivateRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
