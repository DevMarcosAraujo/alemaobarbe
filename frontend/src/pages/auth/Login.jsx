import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bem-vindo de volta, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/cliente');
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao fazer login';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-viking-black flex items-center justify-center px-4 py-20">
      {/* Background */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-viking-gold/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-viking-text-muted hover:text-viking-gold transition-colors text-sm mb-8"
        >
          <ArrowLeft size={14} />
          Voltar ao site
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
              <span className="font-viking font-black text-2xl text-viking-dark">V</span>
            </div>
            <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Bem-vindo de volta</h1>
            <p className="text-viking-text-muted text-sm mt-1">Entre na sua conta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="input-field"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="input-label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Sua senha"
                  className="input-field pr-12"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-text-muted hover:text-viking-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-viking-text-muted text-sm">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-viking-gold hover:underline font-medium">
                Cadastre-se grátis
              </Link>
            </p>
            <div className="border-t border-viking-gray-mid pt-3">
              <Link to="/admin/login" className="text-xs text-viking-text-muted hover:text-viking-text-secondary transition-colors">
                Acesso Administrativo
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
