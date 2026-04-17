import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, User, Plus, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/cliente', label: 'Início', icon: Home, end: true },
  { to: '/cliente/agendamentos', label: 'Meus Agendamentos', icon: Calendar },
  { to: '/cliente/agendar', label: 'Novo Agendamento', icon: Plus },
  { to: '/cliente/perfil', label: 'Meu Perfil', icon: User },
];

export default function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-viking-black flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <aside
            className={`fixed lg:sticky top-0 left-0 h-full lg:h-screen w-72 bg-viking-dark border-r border-viking-gray-mid z-40 flex flex-col
              transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-viking-gray-mid">
              <div className="flex items-center justify-between mb-5">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gold-gradient rounded-lg flex items-center justify-center">
                    <span className="text-viking-dark font-viking font-black text-xs">V</span>
                  </div>
                  <span className="font-viking font-bold tracking-wider text-gradient-gold">ALEMÃO</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-viking-text-muted hover:text-viking-text-primary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center shrink-0">
                  <span className="text-viking-dark font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-viking-text-primary truncate">{user?.name}</p>
                  <p className="text-xs text-viking-text-muted truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1 text-sm">{label}</span>
                  <ChevronRight size={14} className="opacity-30" />
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-viking-gray-mid space-y-2">
              <Link
                to="/"
                className="sidebar-item text-sm"
                onClick={() => setSidebarOpen(false)}
              >
                <Home size={16} />
                <span>Voltar ao Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="sidebar-item w-full text-red-400 hover:text-red-300"
              >
                <LogOut size={16} />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-viking-dark border-b border-viking-gray-mid px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-viking-text-secondary hover:text-viking-gold"
          >
            <Menu size={22} />
          </button>
          <span className="font-viking font-bold tracking-wider text-gradient-gold text-sm">
            VIKINGS
          </span>
          <div className="w-7 h-7 bg-gold-gradient rounded-full flex items-center justify-center">
            <span className="text-viking-dark font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
