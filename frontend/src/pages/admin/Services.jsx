import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Clock, ToggleLeft, ToggleRight, ImagePlus, X, Tag, Settings2 } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = ['corte', 'barba', 'tratamento', 'combo', 'outro'];

const EMPTY_FORM = { name: '', price: '', duration: 45, description: '', category: 'corte', image: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) { toast.error('Imagem muito grande. Máximo 5MB.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((p) => ({ ...p, image: data.url }));
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const load = () => {
    setLoading(true);
    api.get('/services/all')
      .then(({ data }) => setServices(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (svc) => {
    setForm({ name: svc.name, price: svc.price, duration: svc.duration, description: svc.description || '', category: svc.category || 'corte', image: svc.image || '' });
    setEditing(svc);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Nome e preço obrigatórios'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, form);
        toast.success('Serviço atualizado');
      } else {
        await api.post('/services', form);
        toast.success('Serviço criado');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (svc) => {
    try {
      await api.put(`/services/${svc.id}`, { active: !svc.active });
      setServices((p) => p.map((s) => s.id === svc.id ? { ...s, active: !s.active } : s));
      toast.success(`Serviço ${!svc.active ? 'ativado' : 'desativado'}`);
    } catch { toast.error('Erro ao atualizar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este serviço?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Serviço excluído');
      load();
    } catch { toast.error('Erro ao excluir'); }
  };

  // Categorias — começa com padrões + salvas no localStorage
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('svc_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const saveCategories = (list) => {
    setCategories(list);
    localStorage.setItem('svc_categories', JSON.stringify(list));
  };

  const addCategory = () => {
    const val = newCatInput.trim().toLowerCase();
    if (!val) return;
    if (categories.includes(val)) { toast.error('Categoria já existe'); return; }
    const updated = [...categories, val];
    saveCategories(updated);
    setForm((p) => ({ ...p, category: val }));
    setNewCatInput('');
    setShowNewCat(false);
    toast.success(`Categoria "${val}" criada`);
  };

  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatManagerInput, setNewCatManagerInput] = useState('');

  const deleteCategory = (cat) => {
    if (categories.length <= 1) { toast.error('Deve haver ao menos uma categoria'); return; }
    if (!window.confirm(`Excluir a categoria "${cat}"?`)) return;
    const updated = categories.filter((c) => c !== cat);
    saveCategories(updated);
    if (form.category === cat) setForm((p) => ({ ...p, category: updated[0] }));
    toast.success('Categoria excluída');
  };

  const addCategoryFromManager = () => {
    const val = newCatManagerInput.trim().toLowerCase();
    if (!val) return;
    if (categories.includes(val)) { toast.error('Categoria já existe'); return; }
    saveCategories([...categories, val]);
    setNewCatManagerInput('');
    toast.success(`Categoria "${val}" criada`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Serviços</h1>
          <p className="text-viking-text-muted text-sm">{services.length} serviço(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatManager((v) => !v)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-all ${
              showCatManager ? 'bg-viking-gold/10 border-viking-gold/40 text-viking-gold' : 'bg-viking-gray border-viking-gray-mid text-viking-text-muted hover:text-viking-text-primary'
            }`}>
            <Settings2 size={15} /> Categorias
          </button>
          <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-1.5">
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
      </div>

      {/* Gerenciador de Categorias */}
      {showCatManager && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 mb-6 border border-viking-gold/20">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-viking-gold" />
            <h3 className="font-semibold text-viking-text-primary text-sm">Gerenciar Categorias</h3>
          </div>

          {/* Lista de categorias */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <div key={cat} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm ${
                DEFAULT_CATEGORIES.includes(cat)
                  ? 'bg-viking-gray-mid border-viking-gray-light text-viking-text-muted'
                  : 'bg-viking-gold/10 border-viking-gold/30 text-viking-gold'
              }`}>
                <span className="capitalize">{cat}</span>
                <button type="button" onClick={() => deleteCategory(cat)}
                  className="hover:text-red-400 transition-colors ml-1">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Adicionar nova */}
          <div className="flex gap-2">
            <input value={newCatManagerInput}
              onChange={(e) => setNewCatManagerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategoryFromManager()}
              placeholder="Nome da nova categoria..."
              className="input-field flex-1 py-2 text-sm" />
            <button type="button" onClick={addCategoryFromManager}
              className="px-4 py-2 rounded-xl bg-viking-gold/20 border border-viking-gold/40 text-viking-gold hover:bg-viking-gold/30 transition-colors text-sm font-medium">
              Adicionar
            </button>
          </div>
          <p className="text-xs text-viking-text-muted mt-2">Deve haver ao menos uma categoria cadastrada.</p>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-viking-gray-mid rounded w-1/2 mb-3" />
              <div className="h-3 bg-viking-gray-mid rounded w-full mb-2" />
              <div className="h-3 bg-viking-gray-mid rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-viking-text-muted mb-4">Nenhum serviço cadastrado</p>
          <button onClick={openCreate} className="btn-gold">Criar primeiro serviço</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card p-5 ${!svc.active ? 'opacity-60' : ''}`}
            >
              {svc.image && (
                <div className="h-32 rounded-xl overflow-hidden mb-4">
                  <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-viking-gold uppercase tracking-widest font-semibold">{svc.category}</span>
                  <h3 className="font-viking font-bold text-viking-text-primary">{svc.name}</h3>
                </div>
                <span className="text-viking-gold font-bold">{formatCurrency(svc.price)}</span>
              </div>
              {svc.description && (
                <p className="text-viking-text-muted text-xs mb-3 line-clamp-2">{svc.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-viking-text-muted mb-4">
                <Clock size={12} />
                {svc.duration} min
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-viking-gray-mid">
                <button onClick={() => handleToggle(svc)} className={`flex items-center gap-1 text-xs ${svc.active ? 'text-green-400' : 'text-viking-text-muted'}`}>
                  {svc.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {svc.active ? 'Ativo' : 'Inativo'}
                </button>
                <div className="ml-auto flex gap-1.5">
                  <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg bg-viking-gray-mid hover:bg-viking-gray-light text-viking-text-secondary hover:text-viking-gold transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(svc.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">
              {editing ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="input-label">Nome *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Corte Masculino" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0.00" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Duração (min)</label>
                  <input type="number" min="15" step="15" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="input-label">Categoria</label>
                <div className="flex gap-2">
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field flex-1">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewCat((v) => !v)}
                    className="px-3 rounded-xl bg-viking-gray-mid border border-viking-gray-light hover:border-viking-gold/50 text-viking-gold transition-colors"
                    title="Nova categoria">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Input nova categoria inline */}
                {showNewCat && (
                  <div className="flex gap-2 mt-2">
                    <input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      placeholder="Nome da nova categoria..."
                      className="input-field flex-1 py-2 text-sm" autoFocus />
                    <button type="button" onClick={addCategory}
                      className="px-3 rounded-xl bg-viking-gold/20 border border-viking-gold/40 text-viking-gold hover:bg-viking-gold/30 transition-colors text-sm font-medium">
                      OK
                    </button>
                    <button type="button" onClick={() => { setShowNewCat(false); setNewCatInput(''); }}
                      className="px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="input-label">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field h-20 resize-none" placeholder="Descreva o serviço..." />
              </div>
              <div>
                <label className="input-label">Foto do Serviço (opcional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.image ? (
                  <div className="relative">
                    <img src={form.image} alt="preview" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image: '' }))}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed border-viking-gray-light rounded-xl flex flex-col items-center justify-center gap-2 hover:border-viking-gold/50 hover:bg-viking-gold/5 transition-all disabled:opacity-60"
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-viking-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImagePlus size={24} className="text-viking-text-muted" />
                    )}
                    <span className="text-sm text-viking-text-muted">
                      {uploading ? 'Enviando...' : 'Clique para adicionar foto'}
                    </span>
                    <span className="text-xs text-viking-text-muted">JPG, PNG ou WEBP — máx. 5MB</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancelar</button>
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
