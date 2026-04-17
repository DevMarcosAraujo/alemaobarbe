import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserX, UserCheck, Trash2, Shield, User, Search, Pencil, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal criar
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'client' });
  const [savingCreate, setSavingCreate] = useState(false);

  // Modal editar
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'client' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal senha
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/users').then(({ data }) => setUsers(data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Criar
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) { toast.error('Preencha todos os campos obrigatórios'); return; }
    setSavingCreate(true);
    try {
      await api.post('/users', createForm);
      toast.success('Usuário criado');
      setShowCreate(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'client' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao criar'); }
    setSavingCreate(false);
  };

  // Editar
  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ name: u.name || '', phone: u.phone || '', role: u.role || 'client' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name) { toast.error('Nome obrigatório'); return; }
    setSavingEdit(true);
    try {
      await api.put(`/users/${editTarget.uid}`, editForm);
      toast.success('Usuário atualizado');
      setUsers((p) => p.map((u) => u.uid === editTarget.uid ? { ...u, ...editForm } : u));
      setEditTarget(null);
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao atualizar'); }
    setSavingEdit(false);
  };

  // Senha
  const openPwd = (u) => { setPwdTarget(u); setNewPassword(''); setShowPwd(false); };

  const handlePwd = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Senha deve ter mínimo 6 caracteres'); return; }
    setSavingPwd(true);
    try {
      await api.put(`/users/${pwdTarget.uid}/password`, { password: newPassword });
      toast.success('Senha redefinida com sucesso');
      setPwdTarget(null);
      setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao redefinir senha'); }
    setSavingPwd(false);
  };

  // Toggle / Delete
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
        <button onClick={() => setShowCreate(true)} className="btn-gold text-sm flex items-center gap-1.5">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-viking-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..." className="input-field pl-9 py-2 text-sm" />
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
                        {/* Editar — disponível para todos, inclusive o próprio */}
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg bg-viking-gray-mid hover:bg-viking-gray-light text-viking-text-secondary hover:text-viking-gold transition-colors"
                          title="Editar dados">
                          <Pencil size={13} />
                        </button>
                        {/* Redefinir senha */}
                        <button onClick={() => openPwd(u)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Redefinir senha">
                          <KeyRound size={13} />
                        </button>
                        {u.uid !== currentUser.uid && (
                          <>
                            <button onClick={() => handleToggle(u)}
                              className={`p-1.5 rounded-lg transition-colors ${u.disabled ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'}`}
                              title={u.disabled ? 'Ativar' : 'Desativar'}>
                              {u.disabled ? <UserCheck size={13} /> : <UserX size={13} />}
                            </button>
                            <button onClick={() => handleDelete(u.uid)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Excluir">
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

      {/* Modal: Criar Usuário */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="font-viking font-bold text-viking-text-primary mb-4">Criar Usuário</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="input-label">Nome *</label>
                  <input value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} className="input-field" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="input-label">Telefone</label>
                  <input value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="input-label">Senha *</label>
                  <input type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} className="input-field" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="input-label">Tipo de conta</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))} className="input-field">
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancelar</button>
                  <button type="submit" disabled={savingCreate} className="btn-gold flex-1 flex items-center justify-center gap-2">
                    {savingCreate ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Criar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Usuário */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="font-viking font-bold text-viking-text-primary mb-1">Editar Usuário</h3>
              <p className="text-xs text-viking-text-muted mb-4">{editTarget.email}</p>
              <form onSubmit={handleEdit} className="space-y-3">
                <div>
                  <label className="input-label">Nome *</label>
                  <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="input-label">Telefone</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="input-label">Tipo de conta</label>
                  <select value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} className="input-field"
                    disabled={editTarget.uid === currentUser.uid}>
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {editTarget.uid === currentUser.uid && (
                    <p className="text-xs text-viking-text-muted mt-1">Não é possível alterar o próprio tipo de conta.</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditTarget(null)} className="btn-ghost flex-1">Cancelar</button>
                  <button type="submit" disabled={savingEdit} className="btn-gold flex-1 flex items-center justify-center gap-2">
                    {savingEdit ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Redefinir Senha */}
      <AnimatePresence>
        {pwdTarget && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPwdTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={18} className="text-blue-400" />
                <h3 className="font-viking font-bold text-viking-text-primary">Redefinir Senha</h3>
              </div>
              <p className="text-xs text-viking-text-muted mb-4">
                Usuário: <span className="text-viking-text-primary font-medium">{pwdTarget.name}</span>
              </p>
              <form onSubmit={handlePwd} className="space-y-3">
                <div>
                  <label className="input-label">Nova senha *</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-text-muted hover:text-viking-text-primary">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setPwdTarget(null)} className="btn-ghost flex-1">Cancelar</button>
                  <button type="submit" disabled={savingPwd} className="flex-1 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30 font-medium text-sm transition-all flex items-center justify-center gap-2">
                    {savingPwd ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : 'Redefinir'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
