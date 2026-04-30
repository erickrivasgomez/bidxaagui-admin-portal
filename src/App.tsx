import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerifyMagicLink from './pages/VerifyMagicLink';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { useAuthStore } from './store/authStore';
import ProvidersPage from './pages/management/labs/suppliers/ProvidersPage';
import { ManagementLayout } from './pages/management';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<VerifyMagicLink />} />
        </Route>

        {/* Protected Routes - Management Module */}
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <ManagementLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="labs/suppliers" replace />} />
          <Route path="labs/suppliers" element={<ProvidersPage />} />
        </Route>

        {/* Default/Catch-all Redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/management/labs/suppliers" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
