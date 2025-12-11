import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerifyMagicLink from './pages/VerifyMagicLink';
import Dashboard from './pages/Dashboard';
import Subscribers from './pages/Subscribers';
import Editions from './pages/Editions';
import EditionPreview from './pages/EditionPreview';
import Campaigns from './pages/Campaigns';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Redirect to Dashboard if authenticated) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<VerifyMagicLink />} />
        </Route>

        {/* Public Preview Route - DEBE estar ANTES del catch-all */}
        <Route
          path="/public/editions/:id/preview"
          element={<EditionPreview isPublic={true} />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscribers"
          element={
            <ProtectedRoute>
              <Subscribers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editions"
          element={
            <ProtectedRoute>
              <Editions />
            </ProtectedRoute>
          }
        />
        {/* Protected Preview Route */}
        <Route
          path="/editions/:id/preview"
          element={
            <ProtectedRoute>
              <EditionPreview isPublic={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        {/* Default/Catch-all Redirect - DEBE estar AL FINAL */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
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
