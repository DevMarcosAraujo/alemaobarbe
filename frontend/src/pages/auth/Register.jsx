import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const formatPhone = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handlePhone = (e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }));

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Nome muito curto';
    if (!form.email.includes('@')) return 'Email inválido';
    if (form.phone.replace(/\D/g, '').length < 10) return 'Telefone inválido';
    if (form.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (!/\d/.test(form.password)) return 'Senha deve conter um número';
    if (form.password !== form.confirm) return 'As senhas não coincidem';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}! Conta criada com sucesso.`);
      navigate('/cliente');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Erro ao criar conta';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-viking-black flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-viking-text-muted hover:text-viking-gold transition-colors text-sm mb-8"
        >
          <ArrowLeft size={14} />
          Voltar ao site
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
              <span className="font-viking font-black text-2xl text-viking-dark">V</span>
            </div>
            <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Criar conta</h1>
            <p className="text-viking-text-muted text-sm mt-1">Junte-se aos guerreiros Vikings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Nome completo</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="input-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhone}
                placeholder="(00) 00000-0000"
                className="input-field"
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
                  placeholder="Min. 6 caracteres com número"
                  className="input-field pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-text-muted"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirmar senha</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repita a senha"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => {
                  const score =
                    (form.password.length >= 6 ? 1 : 0) +
                    (/\d/.test(form.password) ? 1 : 0) +
                    (/[A-Z]/.test(form.password) ? 1 : 0) +
                    (form.password.length >= 10 ? 1 : 0);
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= score
                          ? score <= 1 ? 'bg-red-500'
                            : score <= 2 ? 'bg-yellow-500'
                            : score <= 3 ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-viking-gray-mid'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-viking-text-muted text-sm">
            Já tem conta?{' '}
            <Link to="/login" className="text-viking-gold hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
