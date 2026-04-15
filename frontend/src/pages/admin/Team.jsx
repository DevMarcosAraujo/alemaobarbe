import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ui/ImageUpload';

const EMPTY = { name: '', role: '', specialization: '', photo: '', years: '', bio: '', order: 99 };

export default function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/team').then(({ data }) => setMembers(data.members || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (m) => {
    setForm({ name: m.name, role: m.role, specialization: m.specialization || '', photo: m.photo || '', years: m.years || '', bio: m.bio || '', order: m.order ?? 99 });
    setEditing(m);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) { toast.error('Nome e função obrigatórios'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/team/${editing.id}`, form);
        toast.success('Membro atualizado');
      } else {
        await api.post('/team', form);
        toast.success('Membro adicionado');
      }
      setShowForm(false);
      load();
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover membro da equipe?')) return;
    try {
      await api.delete(`/team/${id}`);
      setMembers((p) => p.filter((m) => m.id !== id));
      toast.success('Membro removido');
    } catch { toast.error('Erro ao remover'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Equipe</h1>
          <p className="text-viking-text-muted text-sm">{members.length} membro(s)</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-1.5">
          <Plus size={16} /> Novo Membro
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-viking-gray-mid mx-auto mb-3" />
              <div className="h-4 bg-viking-gray-mid rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-viking-gray-mid rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="text-viking-text-muted mx-auto mb-3" />
          <p className="text-viking-text-muted mb-4">Nenhum membro cadastrado</p>
          <button onClick={openCreate} className="btn-gold">Adicionar primeiro membro</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5 text-center"
            >
              <div className="relative inline-block mb-3">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="w-24 h-24 object-cover rounded-2xl mx-auto border-2 border-viking-gray-mid" />
                ) : (
                  <div className="w-24 h-24 bg-viking-gray-mid rounded-2xl flex items-center justify-center mx-auto border-2 border-viking-gray-mid">
                    <span className="font-viking font-black text-3xl text-gradient-gold">{m.name?.[0]}</span>
                  </div>
                )}
                {m.years && (
                  <div className="absolute -bottom-1 -right-1 bg-viking-gold rounded-lg px-1.5 py-0.5">
                    <span className="text-viking-dark font-bold text-xs">{m.years}</span>
                  </div>
                )}
              </div>
              <h3 className="font-viking font-bold text-viking-text-primary">{m.name}</h3>
              <p className="text-viking-gold text-sm mt-0.5">{m.role}</p>
              {m.specialization && (
                <p className="text-viking-text-muted text-xs mt-1">{m.specialization}</p>
              )}
              {m.bio && (
                <p className="text-viking-text-muted text-xs mt-2 line-clamp-2">{m.bio}</p>
              )}
              <div className="flex gap-1.5 pt-4 mt-2 border-t border-viking-gray-mid">
                <button onClick={() => openEdit(m)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-viking-gray-mid hover:bg-viking-gray-light text-viking-text-secondary text-xs transition-colors">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleDelete(m.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">
              {editing ? 'Editar Membro' : 'Novo Membro'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <ImageUpload
                value={form.photo}
                onChange={(url) => setForm((p) => ({ ...p, photo: url }))}
                label="Foto"
                aspectRatio="square"
                placeholder="Clique para adicionar foto"
              />
              <div>
                <label className="input-label">Nome *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome completo" className="input-field" />
              </div>
              <div>
                <label className="input-label">Função / Cargo *</label>
                <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="Ex: Master Barber, Barbeiro" className="input-field" />
              </div>
              <div>
                <label className="input-label">Especialização</label>
                <input value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} placeholder="Ex: Degradê, Barba, Coloração" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Anos de Experiência</label>
                  <input value={form.years} onChange={(e) => setForm((p) => ({ ...p, years: e.target.value }))} placeholder="Ex: 5 anos" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Ordem de Exibição</label>
                  <input type="number" min="1" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="input-label">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="input-field h-16 resize-none" placeholder="Breve descrição..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
