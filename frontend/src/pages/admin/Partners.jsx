import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ui/ImageUpload';

const EMPTY = { name: '', logoUrl: '', website: '', description: '' };

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/partners').then(({ data }) => setPartners(data.partners || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ name: p.name, logoUrl: p.logoUrl || '', website: p.website || '', description: p.description || '' }); setEditing(p); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/partners/${editing.id}`, form);
        toast.success('Parceiro atualizado');
      } else {
        await api.post('/partners', form);
        toast.success('Parceiro cadastrado');
      }
      setShowForm(false);
      load();
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover parceiro?')) return;
    try {
      await api.delete(`/partners/${id}`);
      setPartners((p) => p.filter((partner) => partner.id !== id));
      toast.success('Parceiro removido');
    } catch { toast.error('Erro ao remover'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Parceiros</h1>
          <p className="text-viking-text-muted text-sm">{partners.length} parceiro(s)</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-1.5">
          <Plus size={16} /> Novo Parceiro
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-viking-gray-mid" />
              <div className="flex-1">
                <div className="h-4 bg-viking-gray-mid rounded w-2/3 mb-2" />
                <div className="h-3 bg-viking-gray-mid rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-viking-text-muted mb-4">Nenhum parceiro cadastrado</p>
          <button onClick={openCreate} className="btn-gold">Cadastrar primeiro parceiro</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.name} className="w-14 h-14 object-contain rounded-xl border border-viking-gray-mid" />
                ) : (
                  <div className="w-14 h-14 bg-viking-gray-mid rounded-xl flex items-center justify-center">
                    <span className="font-viking font-black text-xl text-gradient-gold">{p.name?.[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-viking font-bold text-viking-text-primary truncate">{p.name}</h3>
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-viking-gold hover:underline flex items-center gap-1 mt-0.5">
                      {p.website.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
              {p.description && <p className="text-viking-text-muted text-xs mb-4 line-clamp-2">{p.description}</p>}
              <div className="flex gap-1.5 pt-3 border-t border-viking-gray-mid">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-viking-gray-mid hover:bg-viking-gray-light text-viking-text-secondary text-xs transition-colors">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">{editing ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="input-label">Nome *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome da empresa" className="input-field" />
              </div>
              <ImageUpload
                value={form.logoUrl}
                onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
                label="Logo da Empresa"
                aspectRatio="square"
                placeholder="Clique para adicionar logo"
              />
              <div>
                <label className="input-label">Website</label>
                <input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://..." className="input-field" />
              </div>
              <div>
                <label className="input-label">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field h-16 resize-none" placeholder="Breve descrição..." />
              </div>
              <div className="flex gap-2">
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
