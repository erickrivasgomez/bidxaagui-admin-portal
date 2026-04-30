import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerifyMagicLink from './pages/VerifyMagicLink';
import Subscribers from './pages/SubscribersNew';
import Editions from './pages/EditionsNew';
import EditionPreview from './pages/EditionPreview';
import Campaigns from './pages/CampaignsNew';
import AntroponomadasHub from './pages/AntroponomadasHub';
import LabHub from './pages/LabHub';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { useAuthStore } from './store/authStore';
import { LabsIndex } from './pages/labs/LabsIndex';
import LabsSuppliersNew from './pages/LabsSuppliersNew';
import ProvidersPage from './pages/management/labs/suppliers/ProvidersPage';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Preview Route - DEBE estar ANTES del catch-all */}
        <Route
          path="/public/editions/:id/preview"
          element={<EditionPreview isPublic={true} />}
        />
        {/* Public Routes (Redirect to Dashboard if authenticated) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<VerifyMagicLink />} />
        </Route>

        {/* Protected Routes - Main Management */}
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <Navigate to="/management/labs/suppliers" replace />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Antroponomadas Module */}
        <Route
          path="/antroponomadas"
          element={
            <ProtectedRoute>
              <AntroponomadasHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/antroponomadas/editions"
          element={
            <ProtectedRoute>
              <Editions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/antroponomadas/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/antroponomadas/subscribers"
          element={
            <ProtectedRoute>
              <Subscribers />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Lab Module */}
        <Route
          path="/lab"
          element={
            <ProtectedRoute>
              <LabHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/proveedores"
          element={
            <ProtectedRoute>
              <LabsSuppliersNew />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Management Module */}
        <Route
          path="/management/labs/suppliers"
          element={
            <ProtectedRoute>
              <ProvidersPage />
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

        {/* Legacy Routes - For backward compatibility */}
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
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labs"
          element={
            <ProtectedRoute>
              <LabsIndex />
            </ProtectedRoute>
          }
        />

        {/* Default/Catch-all Redirect - DEBE estar AL FINAL */}
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
