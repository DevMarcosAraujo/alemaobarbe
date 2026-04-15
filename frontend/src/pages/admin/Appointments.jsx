import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Search, Check, X, Ban } from 'lucide-react';
import api from '../../utils/api';
import { formatDateShort, getStatusLabel, getStatusClass, formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Manual booking form
  const [manual, setManual] = useState({
    clientName: '', clientPhone: '', serviceId: '', barberId: '',
    date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', notes: '',
  });

  // Client search autocomplete
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const searchTimer = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, svcRes, teamRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/services'),
        api.get('/team'),
      ]);
      setAppointments(apptRes.data.appointments || []);
      setServices(svcRes.data.services || []);
      setTeam(teamRes.data.members?.filter((m) => m.active !== false) || []);
    } catch { toast.error('Erro ao carregar agendamentos'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Debounced client search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!clientSearch.trim() || clientSearch.length < 2) {
      setClientResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearchingClients(true);
      try {
        const { data } = await api.get('/users');
        const q = clientSearch.toLowerCase();
        const filtered = (data.users || []).filter(
          (u) => u.name?.toLowerCase().includes(q) || u.phone?.includes(q)
        ).slice(0, 5);
        setClientResults(filtered);
      } catch {}
      setSearchingClients(false);
    }, 350);
  }, [clientSearch]);

  const selectClient = (client) => {
    setManual((p) => ({ ...p, clientName: client.name, clientPhone: client.phone || '' }));
    setClientSearch(client.name);
    setClientResults([]);
  };

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .filter((a) => !search || a.clientName?.toLowerCase().includes(search.toLowerCase()) || a.serviceName?.toLowerCase().includes(search.toLowerCase()));

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setAppointments((p) => p.map((a) => a.id === id ? { ...a, status } : a));
      toast.success('Status atualizado');
    } catch { toast.error('Erro ao atualizar'); }
    setUpdating(null);
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!manual.clientName || !manual.serviceId || !manual.date || !manual.time) {
      toast.error('Preencha os campos obrigatórios'); return;
    }
    try {
      await api.post('/appointments/manual', manual);
      toast.success('Agendamento manual criado');
      setShowManual(false);
      setManual({ clientName: '', clientPhone: '', serviceId: '', barberId: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', notes: '' });
      setClientSearch('');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao criar'); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Agendamentos</h1>
          <p className="text-viking-text-muted text-sm mt-0.5">{appointments.length} no total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowManual(true)} className="btn-gold text-sm py-2 px-3">
            <Plus size={15} className="inline mr-1" />
            Manual
          </button>
          <button onClick={load} className="text-viking-text-muted hover:text-viking-gold p-2 rounded-xl bg-viking-gray">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-viking-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === s ? 'bg-gold-gradient text-viking-dark' : 'bg-viking-gray text-viking-text-secondary border border-viking-gray-mid'
              }`}
            >
              {s === 'all' ? 'Todos' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-viking-gray-mid">
                {['Cliente', 'Serviço', 'Data / Hora', 'Valor', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-viking-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-viking-gray-mid">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-viking-gray-mid rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-viking-text-muted">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id} className="border-b border-viking-gray-mid hover:bg-viking-gray-mid/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-viking-text-primary">{appt.clientName}</p>
                      {appt.clientPhone && <p className="text-xs text-viking-text-muted">{appt.clientPhone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-viking-text-secondary">{appt.serviceName}</p>
                      {appt.barberName && <p className="text-xs text-viking-text-muted">{appt.barberName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-viking-text-primary">{formatDateShort(appt.date)}</p>
                      <p className="text-xs text-viking-text-muted">{appt.time}</p>
                    </td>
                    <td className="px-4 py-3 text-viking-gold font-medium">{formatCurrency(appt.servicePrice)}</td>
                    <td className="px-4 py-3"><span className={getStatusClass(appt.status)}>{getStatusLabel(appt.status)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => handleStatus(appt.id, 'confirmed')}
                            disabled={updating === appt.id}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Confirmar"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {(appt.status === 'pending' || appt.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleStatus(appt.id, 'completed')}
                              disabled={updating === appt.id}
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                              title="Concluir"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatus(appt.id, 'cancelled')}
                              disabled={updating === appt.id}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Cancelar"
                            >
                              <X size={14} />
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

      {/* Modal: Agendamento Manual */}
      {showManual && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowManual(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">Agendamento Manual</h3>
            <form onSubmit={handleManual} className="space-y-3">
              {/* Client search */}
              <div className="relative">
                <label className="input-label">Cliente *</label>
                <input
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setManual((p) => ({ ...p, clientName: e.target.value }));
                  }}
                  placeholder="Buscar por nome ou digitar..."
                  className="input-field"
                  autoComplete="off"
                />
                {(clientResults.length > 0 || searchingClients) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-viking-gray border border-viking-gray-mid rounded-xl z-10 shadow-lg overflow-hidden">
                    {searchingClients ? (
                      <div className="p-3 text-center text-xs text-viking-text-muted">Buscando...</div>
                    ) : (
                      clientResults.map((c) => (
                        <button
                          key={c.uid || c.id}
                          type="button"
                          onClick={() => selectClient(c)}
                          className="w-full text-left px-4 py-2.5 hover:bg-viking-gray-mid transition-colors"
                        >
                          <p className="text-sm text-viking-text-primary">{c.name}</p>
                          {c.phone && <p className="text-xs text-viking-text-muted">{c.phone}</p>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Telefone</label>
                <input
                  value={manual.clientPhone}
                  onChange={(e) => setManual((p) => ({ ...p, clientPhone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Serviço *</label>
                <select value={manual.serviceId} onChange={(e) => setManual((p) => ({ ...p, serviceId: e.target.value }))} className="input-field">
                  <option value="">Selecione...</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {team.length > 0 && (
                <div>
                  <label className="input-label">Profissional</label>
                  <select value={manual.barberId} onChange={(e) => setManual((p) => ({ ...p, barberId: e.target.value }))} className="input-field">
                    <option value="">Qualquer profissional</option>
                    {team.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Data *</label>
                  <input type="date" value={manual.date} onChange={(e) => setManual((p) => ({ ...p, date: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Horário *</label>
                  <input type="time" value={manual.time} onChange={(e) => setManual((p) => ({ ...p, time: e.target.value }))} className="input-field" />
                </div>
              </div>

              <div>
                <label className="input-label">Observações</label>
                <textarea value={manual.notes} onChange={(e) => setManual((p) => ({ ...p, notes: e.target.value }))} className="input-field h-16 resize-none" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowManual(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" className="btn-gold flex-1">Criar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Block Day shortcut banner */}
      <div className="mt-4 flex items-center gap-2 text-xs text-viking-text-muted">
        <Ban size={13} />
        <span>Para bloquear dias, acesse <strong className="text-viking-gold">Configurações → Dias Bloqueados</strong></span>
      </div>
    </div>
  );
}
