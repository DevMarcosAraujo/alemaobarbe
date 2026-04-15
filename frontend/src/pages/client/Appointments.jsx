import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Scissors, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { formatDateShort, getStatusLabel, getStatusClass } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/appointments')
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(() => toast.error('Erro ao carregar agendamentos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    setCancelling(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Agendamento cancelado');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Meus Agendamentos</h1>
          <p className="text-viking-text-muted text-sm mt-1">{appointments.length} agendamento(s) no total</p>
        </div>
        <Link to="/cliente/agendar" className="btn-gold text-sm py-2 flex items-center gap-1.5">
          <Plus size={16} />
          <span className="hidden sm:block">Novo</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === value
                ? 'bg-gold-gradient text-viking-dark'
                : 'bg-viking-gray text-viking-text-secondary hover:text-viking-text-primary border border-viking-gray-mid'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-viking-gray-mid" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-viking-gray-mid rounded w-1/3" />
                  <div className="h-3 bg-viking-gray-mid rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="text-viking-text-muted mx-auto mb-4" />
          <h3 className="font-viking font-semibold text-viking-text-primary mb-2">
            {filter === 'all' ? 'Nenhum agendamento' : `Nenhum agendamento ${FILTERS.find((f) => f.value === filter)?.label?.toLowerCase()}`}
          </h3>
          <p className="text-viking-text-muted text-sm mb-6">
            {filter === 'all' && 'Que tal agendar seu primeiro horário?'}
          </p>
          {filter === 'all' && (
            <Link to="/cliente/agendar" className="btn-gold inline-block">
              Agendar Agora
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered
            .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
            .map((appt, i) => {
              const canCancel = appt.status === 'pending' || appt.status === 'confirmed';
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-viking-gray-mid rounded-xl flex items-center justify-center shrink-0">
                      <Scissors size={20} className="text-viking-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-viking-text-primary truncate">{appt.serviceName}</h3>
                        <span className={getStatusClass(appt.status)}>{getStatusLabel(appt.status)}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-viking-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDateShort(appt.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {appt.time}
                        </span>
                        {appt.servicePrice && (
                          <span className="text-viking-gold font-medium">
                            R$ {appt.servicePrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-viking-text-muted mt-2 flex items-start gap-1">
                          <AlertCircle size={11} className="mt-0.5 shrink-0" />
                          {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {canCancel && (
                    <div className="mt-4 pt-4 border-t border-viking-gray-mid flex justify-end">
                      <button
                        onClick={() => handleCancel(appt.id)}
                        disabled={cancelling === appt.id}
                        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        {cancelling === appt.id ? (
                          <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        Cancelar agendamento
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
}
