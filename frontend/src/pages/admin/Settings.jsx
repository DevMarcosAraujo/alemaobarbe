import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, Store, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Ban, CheckCircle, Loader2 } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, isBefore,
  startOfToday, addDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_FULL   = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AdminSettings() {
  const { changePassword } = useAuth();
  const [tab, setTab] = useState('schedule');

  // Schedule / calendar
  const [schedule, setSchedule] = useState({
    startTime: '09:00', endTime: '19:00', slotDuration: 30,
    lunchStart: '12:00', lunchEnd: '13:00', closedDays: [0],
  });
  const [blockedDays, setBlockedDays] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Selected date + slots
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [blockingDay, setBlockingDay] = useState(false);
  const [stagedTimes, setStagedTimes] = useState(new Set()); // horários selecionados (disponíveis)
  const [savingSlots, setSavingSlots] = useState(false);

  // Salon
  const [salon, setSalon] = useState({
    name: 'ALEMÃO Barbearia', tagline: '', about: '',
    phone: '', email: '', address: '', instagram: '', facebook: '', whatsapp: '',
  });

  // Password
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [schRes, salRes, blkRes] = await Promise.all([
          api.get('/settings/schedule'),
          api.get('/settings/salon'),
          api.get('/appointments/blocked-days'),
        ]);
        setSchedule(schRes.data.schedule);
        setSalon(salRes.data.salon);
        setBlockedDays(blkRes.data.days?.map((d) => d.date) || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // ── Load slots for a given date ─────────────────────────────────────────────
  const loadSlots = useCallback(async (dateStr) => {
    if (!dateStr) return;
    setSlotsLoading(true);
    setSlots([]);
    setStagedTimes(new Set());
    try {
      const { data } = await api.get(`/appointments/available-slots?date=${dateStr}`);
      const s = data.slots || [];
      setSlots(s);
      // Só pré-seleciona se o dia já foi configurado antes; dia novo começa vazio
      if (data.dayConfigured) {
        setStagedTimes(new Set(s.filter((sl) => sl.available).map((sl) => sl.time)));
      } else {
        setStagedTimes(new Set());
      }
    } catch { setSlots([]); }
    setSlotsLoading(false);
  }, []);

  // ── Select date from calendar or input ─────────────────────────────────────
  const selectDate = (dateStr) => {
    setSelectedDate(dateStr);
    // Sync calendar month to the selected date
    const d = new Date(dateStr + 'T12:00:00');
    setCalendarMonth(d);
    loadSlots(dateStr);
  };

  const handleCalendarClick = (dateStr, isClosedWk, isPast, isCurrentMonth) => {
    if (!isCurrentMonth || isPast || isClosedWk) return;
    selectDate(dateStr);
  };

  const handleInputDate = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    if (val) {
      const d = new Date(val + 'T12:00:00');
      setCalendarMonth(d);
      loadSlots(val);
    } else {
      setSlots([]);
    }
  };

  // ── Toggle block entire day ─────────────────────────────────────────────────
  const toggleBlockDay = async () => {
    if (!selectedDate) return;
    setBlockingDay(true);
    try {
      if (blockedDays.includes(selectedDate)) {
        await api.delete(`/appointments/block-day/${selectedDate}`);
        setBlockedDays((p) => p.filter((d) => d !== selectedDate));
        toast.success('Dia desbloqueado');
        await loadSlots(selectedDate);
      } else {
        await api.post('/appointments/block-day', { date: selectedDate, reason: '' });
        setBlockedDays((p) => [...p, selectedDate]);
        setSlots([]);
        toast.success('Dia bloqueado');
      }
    } catch { toast.error('Erro ao atualizar dia'); }
    setBlockingDay(false);
  };

  // ── Toggle horário de trabalho (apenas visual, salva em lote) ─────────────
  const toggleSlot = (time, booked) => {
    if (booked) return; // horário com agendamento real — não pode alterar
    setStagedTimes((prev) => {
      const next = new Set(prev);
      next.has(time) ? next.delete(time) : next.add(time);
      return next;
    });
  };

  const saveWorkingHours = async () => {
    if (!selectedDate || slots.length === 0) return;
    setSavingSlots(true);
    try {
      const allTimes = slots.map((s) => s.time);
      const selectedTimes = [...stagedTimes];
      await api.post('/appointments/set-working-hours', { date: selectedDate, allTimes, selectedTimes });
      toast.success('Horários de trabalho salvos');
      await loadSlots(selectedDate);
    } catch { toast.error('Erro ao salvar horários'); }
    setSavingSlots(false);
  };

  // ── Toggle weekday closed ──────────────────────────────────────────────────
  const toggleClosedDay = (dayIndex) => {
    setSchedule((p) => ({
      ...p,
      closedDays: p.closedDays.includes(dayIndex)
        ? p.closedDays.filter((d) => d !== dayIndex)
        : [...p.closedDays, dayIndex],
    }));
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await api.put('/settings/schedule', schedule);
      toast.success('Horários salvos');
    } catch { toast.error('Erro ao salvar'); }
    setSaving(false);
  };

  const saveSalon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/salon', salon);
      toast.success('Dados do salão salvos');
    } catch { toast.error('Erro ao salvar'); }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) { toast.error('Preencha todos os campos'); return; }
    if (passwords.new.length < 6) { toast.error('Nova senha muito curta (mín. 6 caracteres)'); return; }
    if (passwords.new !== passwords.confirm) { toast.error('As senhas não coincidem'); return; }
    setSaving(true);
    try {
      await changePassword(passwords.current, passwords.new);
      toast.success('Senha alterada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha');
    }
    setSaving(false);
  };

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const today       = startOfToday();
  const monthStart  = startOfMonth(calendarMonth);
  const monthEnd    = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad    = getDay(monthStart);
  const leadingDays = Array.from({ length: startPad }, (_, i) => addDays(monthStart, -(startPad - i)));
  const totalCells  = Math.ceil((startPad + daysInMonth.length) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - startPad - daysInMonth.length }, (_, i) => addDays(monthEnd, i + 1));
  const allCells    = [...leadingDays, ...daysInMonth, ...trailingDays];

  const isDayBlocked = selectedDate && blockedDays.includes(selectedDate);

  // ────────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="max-w-5xl mx-auto">
      <div className="h-8 w-48 bg-viking-gray-mid rounded animate-pulse mb-6" />
      <div className="card p-6 h-96 animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-viking text-2xl font-bold text-viking-text-primary mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-viking-gray rounded-xl p-1 mb-6 flex-wrap">
        {[
          { value: 'schedule', label: 'Horários', icon: Clock },
          { value: 'salon',    label: 'Barbearia', icon: Store },
          { value: 'password', label: 'Senha',    icon: Lock  },
        ].map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === value ? 'bg-viking-gold text-viking-dark' : 'text-viking-text-secondary hover:text-viking-text-primary'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── HORÁRIOS ──────────────────────────────────────────────────────── */}
      {tab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* ── LEFT: Calendar ─────────────────────────────────────────── */}
            <div className="card overflow-hidden">
              {/* Gold month header */}
              <div className="bg-gold-gradient px-5 py-4 flex items-center justify-between">
                <button type="button" onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                  className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-viking-dark transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <p className="font-viking font-black text-viking-dark text-lg tracking-wider capitalize">
                    {format(calendarMonth, 'MMMM', { locale: ptBR })}
                  </p>
                  <p className="text-viking-dark/70 text-xs font-semibold">{format(calendarMonth, 'yyyy')}</p>
                </div>
                <button type="button" onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                  className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-viking-dark transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers — clickable to toggle weekly closed */}
              <div className="grid grid-cols-7 gap-px px-4 pt-4 pb-1">
                {DAY_LABELS.map((d, i) => {
                  const isClosed = schedule.closedDays?.includes(i);
                  return (
                    <button key={d} type="button" onClick={() => toggleClosedDay(i)}
                      title={`${isClosed ? 'Abrir' : 'Fechar'} ${DAY_FULL[i]}s`}
                      className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                        isClosed ? 'text-red-400 bg-red-500/10' : 'text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 gap-1 px-4 pb-4 pt-1">
                {allCells.map((date, idx) => {
                  const dateStr        = format(date, 'yyyy-MM-dd');
                  const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                  const dow            = getDay(date);
                  const isClosedWk     = schedule.closedDays?.includes(dow);
                  const isBlocked      = blockedDays.includes(dateStr);
                  const isPast         = isBefore(date, today);
                  const isCurrent      = isToday(date);
                  const isSelected     = selectedDate === dateStr;

                  let cls = 'h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all select-none ';

                  if (!isCurrentMonth)  cls += 'text-viking-text-muted opacity-20 cursor-default ';
                  else if (isClosedWk)  cls += 'text-viking-text-muted opacity-20 cursor-not-allowed ';
                  else if (isPast)      cls += 'text-viking-text-muted opacity-35 cursor-default ';
                  else if (isSelected)  cls += 'bg-viking-gold text-viking-dark font-black cursor-pointer ';
                  else if (isBlocked)   cls += 'bg-red-500/20 text-red-400 border border-red-500/40 cursor-pointer hover:bg-red-500/30 ';
                  else if (isCurrent)   cls += 'border-2 border-viking-gold text-viking-gold cursor-pointer hover:bg-viking-gold/10 ';
                  else                  cls += 'text-viking-text-secondary hover:bg-viking-gray-mid hover:text-viking-text-primary cursor-pointer ';

                  return (
                    <button key={`${dateStr}-${idx}`} type="button"
                      onClick={() => handleCalendarClick(dateStr, isClosedWk, isPast, isCurrentMonth)}
                      className={cls}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 px-4 pb-4 text-xs text-viking-text-muted border-t border-viking-gray-mid pt-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-viking-gold" />Hoje</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-viking-gold" />Selecionado</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Bloqueado</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-viking-gray-mid opacity-50" />Fechado</span>
              </div>
            </div>

            {/* ── RIGHT: Slots panel ─────────────────────────────────────── */}
            <div className="card overflow-hidden flex flex-col" style={{ minHeight: 420 }}>

              {/* Date input — always visible */}
              <div className="px-5 py-4 border-b border-viking-gray-mid">
                <label className="input-label">Selecione a Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleInputDate}
                  className="input-field mt-1"
                />
              </div>

              {!selectedDate ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-viking-gray-mid flex items-center justify-center">
                    <Clock size={26} className="text-viking-text-muted" />
                  </div>
                  <p className="font-viking font-semibold text-viking-text-secondary">Selecione uma Data</p>
                  <p className="text-xs text-viking-text-muted">Clique no calendário ou use o campo acima</p>
                </div>
              ) : (
                <>
                  {/* Block entire day button */}
                  <div className="px-5 py-3 border-b border-viking-gray-mid">
                    <button
                      type="button"
                      onClick={toggleBlockDay}
                      disabled={blockingDay}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isDayBlocked
                          ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {blockingDay
                        ? <Loader2 size={15} className="animate-spin" />
                        : isDayBlocked
                          ? <><CheckCircle size={15} />Desbloquear dia inteiro</>
                          : <><Ban size={15} />Bloquear dia inteiro</>
                      }
                    </button>
                  </div>

                  {/* Slots */}
                  <div className="flex-1 p-5 overflow-y-auto">
                    <p className="text-xs text-viking-text-muted uppercase tracking-widest font-semibold mb-3">
                      Selecione os horários de trabalho
                    </p>

                    {isDayBlocked ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <Ban size={32} className="text-red-400/50" />
                        <p className="text-sm text-viking-text-muted">Dia bloqueado — nenhum agendamento permitido</p>
                      </div>
                    ) : slotsLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-11 rounded-xl bg-viking-gray-mid animate-pulse" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <Clock size={32} className="text-viking-text-muted/50" />
                        <p className="text-sm text-viking-text-muted">Nenhum horário disponível</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(({ time, booked }) => {
                            const isSelected = stagedTimes.has(time);
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => toggleSlot(time, booked)}
                                title={booked ? 'Horário ocupado — agendamento confirmado' : isSelected ? 'Clique para desmarcar' : 'Clique para trabalhar neste horário'}
                                className={`h-11 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                  booked
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-viking-gold/20 border border-viking-gold/60 text-viking-gold font-bold cursor-pointer hover:bg-viking-gold/30'
                                      : 'bg-viking-gray border border-viking-gray-mid text-viking-text-muted cursor-pointer hover:border-viking-gold/30 hover:text-viking-text-secondary'
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-4 text-xs text-viking-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-viking-gold/20 border border-viking-gold/60" />
                            Selecionado (vou trabalhar)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-viking-gray border border-viking-gray-mid" />
                            Não selecionado (bloqueado)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-blue-500/10 border border-blue-500/20" />
                            Ocupado (agendado)
                          </span>
                        </div>

                        {/* Salvar horários */}
                        <button type="button" onClick={saveWorkingHours} disabled={savingSlots}
                          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-viking-gold/20 border border-viking-gold/40 text-viking-gold hover:bg-viking-gold/30 transition-all font-medium text-sm disabled:opacity-60">
                          {savingSlots
                            ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                            : <><Save size={15} /> Salvar horários do dia</>
                          }
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Save weekly schedule */}
          <button type="button" onClick={saveSchedule} disabled={saving}
            className="btn-gold w-full flex items-center justify-center gap-2">
            {saving
              ? <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
              : <><Save size={16} />Salvar Dias de Funcionamento</>
            }
          </button>
        </motion.div>
      )}

      {/* ── SALÃO ──────────────────────────────────────────────────────────── */}
      {tab === 'salon' && (
        <motion.form onSubmit={saveSalon} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-viking font-semibold text-viking-text-primary">Informações da Barbearia</h3>
            {[
              { key: 'name',      label: 'Nome da Barbearia',          placeholder: 'ALEMÃO Barbearia' },
              { key: 'tagline',   label: 'Slogan',                     placeholder: 'Tradição e estilo...' },
              { key: 'phone',     label: 'Telefone',                   placeholder: '(00) 00000-0000' },
              { key: 'email',     label: 'Email',                      placeholder: 'contato@alemao.com' },
              { key: 'address',   label: 'Endereço',                   placeholder: 'Rua, Número - Bairro' },
              { key: 'instagram', label: 'Instagram',                  placeholder: '@alemao.barbearia' },
              { key: 'facebook',  label: 'Facebook',                   placeholder: 'facebook.com/...' },
              { key: 'whatsapp',  label: 'WhatsApp (somente números)', placeholder: '5511900000000' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input value={salon[key] || ''} onChange={(e) => setSalon((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} className="input-field" />
              </div>
            ))}
            <div>
              <label className="input-label">Sobre a Barbearia</label>
              <textarea value={salon.about || ''} onChange={(e) => setSalon((p) => ({ ...p, about: e.target.value }))}
                className="input-field h-28 resize-none" placeholder="Conte a história da sua barbearia..." />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
            {saving
              ? <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
              : <><Save size={16} />Salvar</>
            }
          </button>
        </motion.form>
      )}

      {/* ── SENHA ──────────────────────────────────────────────────────────── */}
      {tab === 'password' && (
        <motion.form onSubmit={handlePasswordChange} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card p-6 space-y-4">
            <h3 className="font-viking font-semibold text-viking-text-primary">Alterar Senha do Administrador</h3>
            {[
              { key: 'current', label: 'Senha atual',         placeholder: 'Digite a senha atual' },
              { key: 'new',     label: 'Nova senha',           placeholder: 'Mínimo 6 caracteres'  },
              { key: 'confirm', label: 'Confirmar nova senha', placeholder: 'Repita a nova senha'  },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <input type={showPass[key] ? 'text' : 'password'} value={passwords[key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} className="input-field pr-12" />
                  <button type="button"
                    onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-text-muted hover:text-viking-text-primary">
                    {showPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="btn-gold w-full mt-4 flex items-center justify-center gap-2">
            {saving
              ? <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
              : <><Lock size={16} />Alterar Senha</>
            }
          </button>
        </motion.form>
      )}
    </div>
  );
}
