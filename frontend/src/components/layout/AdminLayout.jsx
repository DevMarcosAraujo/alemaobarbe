import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Scissors, Image, DollarSign,
  Users, Settings, Handshake, LogOut, Menu, X, ChevronRight,
  Shield, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { to: '/admin/servicos', label: 'Serviços', icon: Scissors },
  { to: '/admin/equipe', label: 'Equipe', icon: UserCheck },
  { to: '/admin/galeria', label: 'Galeria & Banners', icon: Image },
  { to: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/parceiros', label: 'Parceiros', icon: Handshake },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
            className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-full lg:h-screen w-72 bg-viking-darker border-r border-viking-gray-mid z-40 flex flex-col
          transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-viking-gray-mid">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gold-gradient rounded-lg flex items-center justify-center">
                <span className="text-viking-dark font-viking font-black text-xs">V</span>
              </div>
              <div>
                <span className="font-viking font-bold tracking-wider text-gradient-gold text-sm block">ALEMÃO</span>
                <span className="text-xs text-viking-text-muted">Admin Panel</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-viking-text-muted">
              <X size={18} />
            </button>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-3 bg-viking-gold/5 border border-viking-gold/20 rounded-xl p-3">
            <div className="w-9 h-9 bg-gold-gradient rounded-full flex items-center justify-center shrink-0">
              <span className="text-viking-dark font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-viking-text-primary truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-viking-gold" />
                <span className="text-xs text-viking-gold">Administrador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
        <div className="p-4 border-t border-viking-gray-mid space-y-1">
          <Link to="/" className="sidebar-item text-sm" onClick={() => setSidebarOpen(false)}>
            <span className="text-sm">Ver Site</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400">
            <LogOut size={16} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-viking-darker border-b border-viking-gray-mid px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-viking-text-secondary">
            <Menu size={22} />
          </button>
          <span className="font-viking font-bold tracking-wider text-gradient-gold text-sm">
            ADMIN PANEL
          </span>
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-viking-gold" />
            <span className="text-xs text-viking-gold">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
