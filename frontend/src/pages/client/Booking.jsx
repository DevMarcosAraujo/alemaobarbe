import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Scissors, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfToday, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STEPS = ['Serviço', 'Data', 'Horário', 'Confirmação'];

export default function ClientBooking() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState({ service: null, date: null, time: null });
  const [slots, setSlots] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // Gerar próximos 30 dias
  const today = startOfToday();
  const dates = Array.from({ length: 30 }, (_, i) => addDays(today, i));

  useEffect(() => {
    Promise.all([
      api.get('/services'),
      api.get('/appointments/blocked-days'),
    ]).then(([svcRes, blkRes]) => {
      setServices(svcRes.data.services || []);
      setBlockedDays(blkRes.data.days?.map((d) => d.date) || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected.date) return;
    setSlotsLoading(true);
    api.get(`/appointments/available-slots?date=${selected.date}`)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selected.date]);

  const handleConfirm = async () => {
    if (!selected.service || !selected.date || !selected.time) return;
    setLoading(true);
    try {
      await api.post('/appointments', {
        serviceId: selected.service.id,
        date: selected.date,
        time: selected.time,
        notes,
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    return blockedDays.includes(dateStr) || dayOfWeek === 0; // Domingo bloqueado por padrão
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-viking text-2xl font-bold text-viking-text-primary mb-3">Agendamento Confirmado!</h2>
          <p className="text-viking-text-secondary mb-2">
            <strong>{selected.service?.name}</strong>
          </p>
          <p className="text-viking-text-muted mb-8">
            {format(parseISO(selected.date), "dd 'de' MMMM", { locale: ptBR })} às {selected.time}
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setDone(false); setStep(0); setSelected({ service: null, date: null, time: null }); }} className="btn-outline-gold flex-1">
              Novo Agendamento
            </button>
            <button onClick={() => navigate('/cliente/agendamentos')} className="btn-gold flex-1">
              Ver Agendamentos
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-viking text-2xl font-bold text-viking-text-primary mb-2">Novo Agendamento</h1>
        {/* Steps */}
        <div className="flex items-center gap-2 mt-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i <= step ? 'text-viking-gold' : 'text-viking-text-muted'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-viking-gold text-viking-dark' :
                  i === step ? 'border-2 border-viking-gold text-viking-gold' :
                  'border border-viking-gray-light text-viking-text-muted'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px w-4 sm:w-8 transition-colors ${i < step ? 'bg-viking-gold' : 'bg-viking-gray-mid'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Serviço */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step0">
          <h2 className="font-semibold text-viking-text-primary mb-4">Escolha o serviço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => { setSelected((p) => ({ ...p, service: svc })); setStep(1); }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selected.service?.id === svc.id
                    ? 'border-viking-gold bg-viking-gold/10'
                    : 'card hover:border-viking-gold/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-viking-text-primary">{svc.name}</span>
                  <span className="text-viking-gold font-bold text-sm">{formatCurrency(svc.price)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-viking-text-muted">
                  <Clock size={11} />
                  {svc.duration} min
                </div>
                {svc.description && (
                  <p className="text-xs text-viking-text-muted mt-1 line-clamp-2">{svc.description}</p>
                )}
              </button>
            ))}
          </div>
          {services.length === 0 && (
            <div className="card p-8 text-center">
              <Scissors size={32} className="text-viking-text-muted mx-auto mb-2" />
              <p className="text-viking-text-muted text-sm">Nenhum serviço disponível</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 1: Data */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step1">
          <h2 className="font-semibold text-viking-text-primary mb-4">Escolha a data</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const blocked = isDateBlocked(date);
              const isSelected = selected.date === dateStr;
              return (
                <button
                  key={dateStr}
                  disabled={blocked}
                  onClick={() => { setSelected((p) => ({ ...p, date: dateStr, time: null })); setStep(2); }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    blocked ? 'opacity-30 cursor-not-allowed bg-viking-gray' :
                    isSelected ? 'bg-gold-gradient text-viking-dark' :
                    'card hover:border-viking-gold/30'
                  }`}
                >
                  <p className="text-xs uppercase font-medium">
                    {format(date, 'EEE', { locale: ptBR })}
                  </p>
                  <p className="font-bold text-lg">{format(date, 'dd')}</p>
                  <p className="text-xs opacity-70">{format(date, 'MMM', { locale: ptBR })}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Step 2: Horário */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step2">
          <h2 className="font-semibold text-viking-text-primary mb-1">Escolha o horário</h2>
          <p className="text-viking-text-muted text-sm mb-4">
            {selected.date && format(parseISO(selected.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
          </p>
          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-viking-gray animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(({ time, available }) => (
                <button
                  key={time}
                  disabled={!available}
                  onClick={() => { setSelected((p) => ({ ...p, time })); setStep(3); }}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    !available ? 'opacity-30 cursor-not-allowed bg-viking-gray line-through text-viking-text-muted' :
                    selected.time === time ? 'bg-gold-gradient text-viking-dark' :
                    'bg-viking-gray hover:bg-viking-gray-mid text-viking-text-secondary hover:text-viking-text-primary border border-viking-gray-mid hover:border-viking-gold/30'
                  }`}
                >
                  {time}
                </button>
              ))}
              {slots.length === 0 && (
                <div className="col-span-4 card p-6 text-center">
                  <p className="text-viking-text-muted text-sm">Nenhum horário disponível neste dia</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Confirmação */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step3">
          <h2 className="font-semibold text-viking-text-primary mb-4">Confirmar agendamento</h2>
          <div className="card p-6 space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-viking-gray-mid rounded-xl flex items-center justify-center">
                <Scissors size={18} className="text-viking-gold" />
              </div>
              <div>
                <p className="text-xs text-viking-text-muted uppercase tracking-wider">Serviço</p>
                <p className="font-semibold text-viking-text-primary">{selected.service?.name}</p>
              </div>
              <span className="ml-auto text-viking-gold font-bold">{formatCurrency(selected.service?.price)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-viking-gray-mid rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-viking-gold" />
              </div>
              <div>
                <p className="text-xs text-viking-text-muted uppercase tracking-wider">Data</p>
                <p className="font-semibold text-viking-text-primary">
                  {selected.date && format(parseISO(selected.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-viking-gray-mid rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-viking-gold" />
              </div>
              <div>
                <p className="text-xs text-viking-text-muted uppercase tracking-wider">Horário</p>
                <p className="font-semibold text-viking-text-primary">{selected.time}</p>
              </div>
            </div>

            <div>
              <label className="input-label">Observações (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Prefiro navalha quente, corte específico..."
                className="input-field h-20 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={20} /> Confirmar Agendamento</>
            )}
          </button>
        </motion.div>
      )}

      {/* Navigation */}
      {step > 0 && (
        <button
          onClick={() => setStep((p) => p - 1)}
          className="mt-4 flex items-center gap-2 text-sm text-viking-text-muted hover:text-viking-text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
      )}
    </div>
  );
}
