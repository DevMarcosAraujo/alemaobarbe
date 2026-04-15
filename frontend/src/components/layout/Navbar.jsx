import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/parceiros', label: 'Parceiros' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (userMenu && !e.target.closest('[data-user-menu]')) {
        setUserMenu(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenu(false);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-viking-black/95 backdrop-blur-md border-b border-viking-gray-mid shadow-dark-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center group-hover:shadow-gold transition-all duration-300">
              <span className="text-viking-dark font-viking font-black text-sm">A</span>
            </div>
            <span className="font-viking font-bold text-xl tracking-wider text-gradient-gold">
              ALEMÃO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-viking-gold bg-viking-gold/5'
                      : 'text-viking-text-secondary hover:text-viking-gold hover:bg-viking-gold/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA + User */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/cliente/agendar'}
                  className="btn-outline-gold text-sm py-2 px-4"
                >
                  <Calendar size={16} className="inline mr-1.5" />
                  {isAdmin ? 'Dashboard' : 'Agendar'}
                </Link>

                <div className="relative" data-user-menu>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 bg-viking-gray-mid hover:bg-viking-gray-light px-3 py-2 rounded-xl transition-all duration-200"
                  >
                    <div className="w-7 h-7 bg-gold-gradient rounded-full flex items-center justify-center">
                      <span className="text-viking-dark font-bold text-xs">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-viking-text-primary font-medium max-w-20 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-viking-text-muted transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-viking-gray border border-viking-gray-mid rounded-xl shadow-dark-lg overflow-hidden"
                      >
                        <Link
                          to={isAdmin ? '/admin' : '/cliente'}
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-viking-text-secondary hover:text-viking-text-primary hover:bg-viking-gray-mid transition-colors"
                        >
                          <User size={14} />
                          Minha Área
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-viking-gray-mid transition-colors"
                        >
                          <LogOut size={14} />
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Entrar
                </Link>
                <Link to="/agendar" className="btn-gold text-sm py-2 px-5">
                  Agendar Agora
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-viking-gray-mid text-viking-text-secondary hover:text-viking-gold transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-viking-dark border-t border-viking-gray-mid overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-viking-gold/10 text-viking-gold'
                        : 'text-viking-text-secondary hover:bg-viking-gray-mid hover:text-viking-text-primary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-3 border-t border-viking-gray-mid space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
                        <span className="text-viking-dark font-bold text-sm">
                          {user?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-viking-text-primary">{user?.name}</p>
                        <p className="text-xs text-viking-text-muted">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to={isAdmin ? '/admin' : '/cliente'}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm text-viking-text-secondary hover:bg-viking-gray-mid"
                    >
                      Minha Área
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-viking-gray-mid"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-3 rounded-xl border border-viking-gray-light text-viking-text-secondary text-sm"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/agendar"
                      onClick={() => setIsOpen(false)}
                      className="block text-center btn-gold py-3 text-sm"
                    >
                      Agendar Agora
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
