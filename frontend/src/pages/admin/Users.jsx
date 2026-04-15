import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserX, UserCheck, Trash2, Shield, User, Search } from 'lucide-react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'client' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/users').then(({ data }) => setUsers(data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Preencha todos os campos obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('Usuário criado');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', password: '', role: 'client' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao criar'); }
    setSaving(false);
  };

  const handleToggle = async (u) => {
    if (u.uid === currentUser.uid) { toast.error('Não é possível desativar sua própria conta'); return; }
    try {
      await api.put(`/users/${u.uid}/toggle`);
      setUsers((p) => p.map((user) => user.uid === u.uid ? { ...user, disabled: !user.disabled } : user));
      toast.success(`Usuário ${u.disabled ? 'ativado' : 'desativado'}`);
    } catch { toast.error('Erro ao atualizar'); }
  };

  const handleDelete = async (uid) => {
    if (uid === currentUser.uid) { toast.error('Não é possível excluir sua própria conta'); return; }
    if (!window.confirm('Excluir este usuário permanentemente?')) return;
    try {
      await api.delete(`/users/${uid}`);
      setUsers((p) => p.filter((u) => u.uid !== uid));
      toast.success('Usuário excluído');
    } catch { toast.error('Erro ao excluir'); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Usuários</h1>
          <p className="text-viking-text-muted text-sm">{users.length} usuário(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold text-sm flex items-center gap-1.5">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-viking-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="input-field pl-9 py-2 text-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-viking-gray-mid">
                {['Usuário', 'Email', 'Telefone', 'Role', 'Status', 'Criado em', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-viking-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-viking-gray-mid">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-viking-gray-mid rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-viking-text-muted">Nenhum usuário encontrado</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.uid} className={`border-b border-viking-gray-mid hover:bg-viking-gray-mid/20 transition-colors ${u.disabled ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gold-gradient rounded-full flex items-center justify-center shrink-0">
                          <span className="text-viking-dark font-bold text-xs">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-viking-text-primary">{u.name}</span>
                        {u.uid === currentUser.uid && <span className="text-xs bg-viking-gold/10 text-viking-gold px-1.5 py-0.5 rounded">Você</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-viking-text-secondary">{u.email}</td>
                    <td className="px-4 py-3 text-viking-text-muted">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {u.role === 'admin' ? <Shield size={12} className="text-viking-gold" /> : <User size={12} className="text-viking-text-muted" />}
                        <span className={`text-xs ${u.role === 'admin' ? 'text-viking-gold' : 'text-viking-text-muted'}`}>{u.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.disabled ? 'badge-cancelled' : 'badge-completed'}`}>
                        {u.disabled ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-viking-text-muted text-xs">{formatDateTime(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.uid !== currentUser.uid && (
                          <>
                            <button
                              onClick={() => handleToggle(u)}
                              className={`p-1.5 rounded-lg transition-colors ${u.disabled ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'}`}
                              title={u.disabled ? 'Ativar' : 'Desativar'}
                            >
                              {u.disabled ? <UserCheck size={13} /> : <UserX size={13} />}
                            </button>
                            <button
                              onClick={() => handleDelete(u.uid)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">Criar Usuário</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="input-label">Nome *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Nome completo" />
              </div>
              <div>
                <label className="input-label">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="input-label">Telefone</label>
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="input-label">Senha *</label>
                <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="input-field" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="input-label">Tipo de conta</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="input-field">
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1">
                  {saving ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin mx-auto" /> : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
