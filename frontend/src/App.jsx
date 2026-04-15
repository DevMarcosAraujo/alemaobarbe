import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Páginas públicas
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Gallery from './pages/public/Gallery';
import Partners from './pages/public/Partners';
import Booking from './pages/public/Booking';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// Cliente
import ClientDashboard from './pages/client/Dashboard';
import ClientProfile from './pages/client/Profile';
import ClientAppointments from './pages/client/Appointments';
import ClientBooking from './pages/client/Booking';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminServices from './pages/admin/Services';
import AdminGallery from './pages/admin/Gallery';
import AdminFinance from './pages/admin/Finance';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminPartners from './pages/admin/Partners';
import AdminTeam from './pages/admin/Team';

// Guards
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-viking-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-viking-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-viking-text-muted font-viking tracking-wider">CARREGANDO...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/cliente" replace />;

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/cliente'} replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Público */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/servicos" element={<Services />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/parceiros" element={<Partners />} />
      <Route path="/agendar" element={<Booking />} />
    </Route>

    {/* Auth */}
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/cadastro" element={<GuestRoute><Register /></GuestRoute>} />
    <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

    {/* Cliente */}
    <Route
      path="/cliente"
      element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}
    >
      <Route index element={<ClientDashboard />} />
      <Route path="perfil" element={<ClientProfile />} />
      <Route path="agendamentos" element={<ClientAppointments />} />
      <Route path="agendar" element={<ClientBooking />} />
    </Route>

    {/* Admin */}
    <Route
      path="/admin"
      element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}
    >
      <Route index element={<AdminDashboard />} />
      <Route path="agendamentos" element={<AdminAppointments />} />
      <Route path="servicos" element={<AdminServices />} />
      <Route path="galeria" element={<AdminGallery />} />
      <Route path="financeiro" element={<AdminFinance />} />
      <Route path="usuarios" element={<AdminUsers />} />
      <Route path="equipe" element={<AdminTeam />} />
      <Route path="parceiros" element={<AdminPartners />} />
      <Route path="configuracoes" element={<AdminSettings />} />
    </Route>

    {/* 404 */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
