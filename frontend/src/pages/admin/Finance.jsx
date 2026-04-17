import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, RefreshCw, Pencil, Tag, Settings2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import api from '../../utils/api';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DEFAULT_REVENUE_CATS = ['serviço', 'produto', 'gorjeta', 'outro'];
const DEFAULT_EXPENSE_CATS = ['aluguel', 'salário', 'produto', 'energia', 'água', 'equipamento', 'outro'];

const EMPTY_FORM = { type: 'revenue', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), category: '' };

export default function AdminFinance() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('all');

  // Categorias gerenciáveis via localStorage
  const [revCats, setRevCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fin_rev_cats')) || DEFAULT_REVENUE_CATS; } catch { return DEFAULT_REVENUE_CATS; }
  });
  const [expCats, setExpCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fin_exp_cats')) || DEFAULT_EXPENSE_CATS; } catch { return DEFAULT_EXPENSE_CATS; }
  });
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [catType, setCatType] = useState('revenue');

  const saveRevCats = (list) => { setRevCats(list); localStorage.setItem('fin_rev_cats', JSON.stringify(list)); };
  const saveExpCats = (list) => { setExpCats(list); localStorage.setItem('fin_exp_cats', JSON.stringify(list)); };

  const currentCats = catType === 'revenue' ? revCats : expCats;
  const formCats = form.type === 'revenue' ? revCats : expCats;

  const addCat = () => {
    const val = newCatInput.trim().toLowerCase();
    if (!val) return;
    if (currentCats.includes(val)) { toast.error('Categoria já existe'); return; }
    catType === 'revenue' ? saveRevCats([...revCats, val]) : saveExpCats([...expCats, val]);
    setNewCatInput('');
    toast.success(`Categoria "${val}" criada`);
  };

  const deleteCat = (cat) => {
    const list = catType === 'revenue' ? revCats : expCats;
    if (list.length <= 1) { toast.error('Deve haver ao menos uma categoria'); return; }
    if (!window.confirm(`Excluir a categoria "${cat}"?`)) return;
    catType === 'revenue' ? saveRevCats(revCats.filter((c) => c !== cat)) : saveExpCats(expCats.filter((c) => c !== cat));
  };

  const load = async () => {
    setLoading(true);
    const [sumRes, recRes, chartRes] = await Promise.allSettled([
      api.get(`/finance/summary?month=${currentMonth}`),
      api.get(`/finance/records?month=${currentMonth}`),
      api.get('/finance/monthly-chart'),
    ]);
    if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
    else toast.error('Erro ao carregar resumo financeiro');
    if (recRes.status === 'fulfilled') setRecords(recRes.value.data.records || []);
    else toast.error('Erro ao carregar registros');
    if (chartRes.status === 'fulfilled') setChart(chartRes.value.data.chart || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentMonth]);

  const changeMonth = (dir) => {
    const [y, m] = currentMonth.split('-').map(Number);
    setCurrentMonth(format(new Date(y, m - 1 + dir, 1), 'yyyy-MM'));
  };

  const monthLabel = () => {
    const [y, m] = currentMonth.split('-');
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingRec(null); setShowForm(true); };
  const openEdit = (rec) => {
    setForm({ type: rec.type, amount: rec.amount, description: rec.description, date: rec.date, category: rec.category || '' });
    setEditingRec(rec);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingRec(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.date) { toast.error('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      if (editingRec) {
        await api.put(`/finance/records/${editingRec.id}`, form);
        toast.success('Registro atualizado');
      } else {
        await api.post('/finance/records', form);
        toast.success('Registro criado');
      }
      closeForm();
      load();
    } catch { toast.error('Erro ao salvar registro'); }
    setSaving(false);
  };

  const handleSync = async () => {
    if (!window.confirm('Importar todos os agendamentos concluídos que ainda não têm registro financeiro?')) return;
    setSyncing(true);
    try {
      const { data } = await api.post('/finance/sync-appointments');
      toast.success(data.message);
      load();
    } catch { toast.error('Erro ao sincronizar'); }
    setSyncing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este registro?')) return;
    try {
      await api.delete(`/finance/records/${id}`);
      toast.success('Registro excluído');
      load();
    } catch { toast.error('Erro ao excluir'); }
  };

  const filtered = filter === 'all' ? records : records.filter((r) => r.type === filter);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-viking-gray border border-viking-gray-mid rounded-xl p-3 text-xs">
        <p className="font-semibold text-viking-text-primary mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === 'revenue' ? 'Receita' : p.name === 'expenses' ? 'Despesas' : 'Lucro'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Financeiro</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => changeMonth(-1)} className="text-viking-text-muted hover:text-viking-gold p-1"><ChevronLeft size={16} /></button>
            <span className="text-viking-text-secondary text-sm font-medium">{monthLabel()}</span>
            <button onClick={() => changeMonth(1)} className="text-viking-text-muted hover:text-viking-gold p-1"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowCatManager((v) => !v)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-all ${
              showCatManager ? 'bg-viking-gold/10 border-viking-gold/40 text-viking-gold' : 'bg-viking-gray border-viking-gray-mid text-viking-text-muted hover:text-viking-text-primary'
            }`}>
            <Settings2 size={15} /> Categorias
          </button>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-viking-gray border border-viking-gray-mid text-viking-text-muted hover:text-viking-gold hover:border-viking-gold/40 transition-all disabled:opacity-60">
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Importando...' : 'Sincronizar'}
          </button>
          <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-1.5">
            <Plus size={16} /> Novo Registro
          </button>
        </div>
      </div>

      {/* Gerenciador de Categorias */}
      <AnimatePresence>
        {showCatManager && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-6 border border-viking-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-viking-gold" />
              <h3 className="font-semibold text-viking-text-primary text-sm">Gerenciar Categorias</h3>
            </div>
            {/* Tabs receita/despesa */}
            <div className="flex gap-1 mb-4">
              {[{ v: 'revenue', l: 'Receitas' }, { v: 'expense', l: 'Despesas' }].map(({ v, l }) => (
                <button key={v} onClick={() => setCatType(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    catType === v ? 'bg-viking-gold/20 text-viking-gold border border-viking-gold/40' : 'bg-viking-gray text-viking-text-muted border border-viking-gray-mid'
                  }`}>{l}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentCats.map((cat) => (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-viking-gold/10 border-viking-gold/30 text-viking-gold text-sm">
                  <span className="capitalize">{cat}</span>
                  <button type="button" onClick={() => deleteCat(cat)} className="hover:text-red-400 transition-colors ml-1"><X size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCat()}
                placeholder="Nova categoria..." className="input-field flex-1 py-2 text-sm" />
              <button type="button" onClick={addCat}
                className="px-4 py-2 rounded-xl bg-viking-gold/20 border border-viking-gold/40 text-viking-gold hover:bg-viking-gold/30 transition-colors text-sm font-medium">
                Adicionar
              </button>
            </div>
            <p className="text-xs text-viking-text-muted mt-2">Deve haver ao menos uma categoria por tipo.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Faturado', value: summary?.totalRevenue || 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'Total Despesas', value: summary?.totalExpenses || 0, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: 'Lucro Líquido', value: summary?.profit || 0, icon: DollarSign, color: 'text-viking-gold', bg: 'bg-viking-gold/10', border: 'border-viking-gold/20' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`card p-5 border ${border}`}>
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            {loading ? (
              <div className="h-8 w-28 bg-viking-gray-mid rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-3xl font-bold ${color} ${value < 0 ? '!text-red-400' : ''}`}>{formatCurrency(value)}</p>
            )}
            <p className="text-viking-text-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6 mb-6">
        <h2 className="font-viking font-semibold text-viking-text-primary mb-4">Últimos 6 meses</h2>
        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chart} barSize={10} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="label" tick={{ fill: '#6B6560', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B6560', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="expenses" fill="#8B0000" radius={[4, 4, 0, 0]} name="expenses" />
              <Bar dataKey="profit" fill="#4CAF50" radius={[4, 4, 0, 0]} name="profit" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-viking-text-muted text-sm">Sem dados disponíveis</div>
        )}
        <div className="flex gap-4 mt-3">
          {[{ color: 'bg-viking-gold', l: 'Receita' }, { color: 'bg-viking-red', l: 'Despesas' }, { color: 'bg-green-500', l: 'Lucro' }].map(({ color, l }) => (
            <div key={l} className="flex items-center gap-1.5 text-xs text-viking-text-muted">
              <div className={`w-2 h-2 rounded-full ${color}`} />{l}
            </div>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-viking-gray-mid flex items-center justify-between">
          <h2 className="font-viking font-semibold text-viking-text-primary">Registros</h2>
          <div className="flex gap-1">
            {['all', 'revenue', 'expense'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  filter === f ? 'bg-gold-gradient text-viking-dark' : 'bg-viking-gray text-viking-text-secondary border border-viking-gray-mid'
                }`}>
                {f === 'all' ? 'Todos' : f === 'revenue' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-viking-gray-mid">
                {['Descrição', 'Tipo', 'Categoria', 'Data', 'Valor', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-viking-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-viking-gray-mid">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-3 bg-viking-gray-mid rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-viking-text-muted">Nenhum registro este mês</td></tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-viking-gray-mid hover:bg-viking-gray-mid/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-viking-text-primary">{rec.description}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${rec.type === 'revenue' ? 'badge-completed' : 'badge-cancelled'}`}>
                        {rec.type === 'revenue' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-viking-text-muted capitalize">{rec.category || '-'}</td>
                    <td className="px-5 py-3 text-viking-text-muted">{formatDateShort(rec.date)}</td>
                    <td className={`px-5 py-3 font-bold ${rec.type === 'revenue' ? 'text-green-400' : 'text-red-400'}`}>
                      {rec.type === 'expense' ? '-' : '+'}{formatCurrency(rec.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(rec)}
                          className="p-1.5 rounded-lg bg-viking-gray-mid hover:bg-viking-gray-light text-viking-text-secondary hover:text-viking-gold transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal criar / editar */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="font-viking font-bold text-viking-text-primary mb-4">
                {editingRec ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="input-label">Tipo</label>
                  <div className="flex gap-2">
                    {[{ value: 'revenue', label: 'Receita' }, { value: 'expense', label: 'Despesa' }].map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setForm((p) => ({ ...p, type: value, category: '' }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          form.type === value
                            ? value === 'revenue' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-viking-gray text-viking-text-secondary border border-viking-gray-mid'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0.01" value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Descrição *</label>
                  <input value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Ex: Corte + Barba João" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field">
                    <option value="">Selecione...</option>
                    {formCats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Data *</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="input-field" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={closeForm} className="btn-ghost flex-1">Cancelar</button>
                  <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
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
