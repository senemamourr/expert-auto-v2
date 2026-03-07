import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import BureauxPage from '@/pages/bureaux/BureauxPage';
import RapportsPage from '@/pages/rapports/RapportsPage';
import CreateRapportPage from '@/pages/rapports/CreateRapportPage';
import RapportDetailPage from '@/pages/rapports/RapportDetailPage';

// Composant pour protéger les routes
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Route publique - Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/bureaux"
          element={
            <PrivateRoute>
              <BureauxPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/rapports"
          element={
            <PrivateRoute>
              <RapportsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/rapports/nouveau"
          element={
            <PrivateRoute>
              <CreateRapportPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/rapports/:id"
          element={
            <PrivateRoute>
              <RapportDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/rapports/:id/modifier"
          element={
            <PrivateRoute>
              <CreateRapportPage />
            </PrivateRoute>
          }
        />

        {/* Statistiques (si vous avez une page dédiée) */}
        <Route
          path="/statistiques"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Route par défaut - Redirige vers dashboard si connecté, sinon login */}
        <Route
          path="/"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

        {/* 404 - Route non trouvée */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour au dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
