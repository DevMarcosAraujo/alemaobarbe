import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        toast.error('Acesso restrito a administradores');
        return;
      }
      toast.success('Bem-vindo ao painel, Administrador!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-viking-black flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-viking-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-viking-text-muted hover:text-viking-gold text-sm mb-8">
          <ArrowLeft size={14} />
          Voltar ao site
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-viking-red rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Painel Administrativo</h1>
            <p className="text-viking-text-muted text-sm mt-1">Acesso restrito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email do Administrador</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@vikings.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="input-label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Senha de administrador"
                  className="input-field pr-12"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-text-muted">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-viking-red hover:bg-viking-red-light text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Shield size={18} /> Acessar Painel</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-viking-text-muted">
            Cliente?{' '}
            <Link to="/login" className="text-viking-gold hover:underline">Fazer login aqui</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
