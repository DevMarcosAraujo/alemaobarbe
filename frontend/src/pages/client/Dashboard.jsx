import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Scissors, Plus, ChevronRight, Star, MessageCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatDateShort, getStatusLabel, getStatusClass } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsapp = import.meta.env.VITE_WHATSAPP || '5500000000000';
  const whatsappMsg = encodeURIComponent('Olá! Gostaria de agendar um horário na ALEMÃO Barbearia.');

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => {
        const sorted = (data.appointments || [])
          .sort((a, b) => {
            const da = new Date(`${a.date}T${a.time}`);
            const db = new Date(`${b.date}T${b.time}`);
            return db - da;
          })
          .slice(0, 5);
        setAppointments(sorted);
      })
      .catch(() => toast.error('Erro ao carregar agendamentos'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.find((a) => {
    const d = new Date(`${a.date}T${a.time}`);
    return d >= new Date() && (a.status === 'pending' || a.status === 'confirmed');
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-viking text-2xl md:text-3xl font-bold text-viking-text-primary">
          Olá, <span className="text-gradient-gold">{user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className="text-viking-text-muted mt-1">Bem-vindo ao seu espaço ALEMÃO.</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/cliente/agendar', icon: Plus, label: 'Novo Agendamento', desc: 'Marque seu horário', primary: true },
          { to: '/cliente/agendamentos', icon: Calendar, label: 'Meus Agendamentos', desc: 'Ver histórico' },
          { to: '/cliente/perfil', icon: Scissors, label: 'Meu Perfil', desc: 'Editar informações' },
        ].map(({ to, icon: Icon, label, desc, primary }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={to}
              className={`block p-5 rounded-2xl border transition-all group ${
                primary
                  ? 'bg-viking-gold/10 border-viking-gold/30 hover:bg-viking-gold/20 hover:border-viking-gold/50'
                  : 'card hover:border-viking-gold/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                primary ? 'bg-viking-gold/20' : 'bg-viking-gray-mid'
              }`}>
                <Icon size={20} className={primary ? 'text-viking-gold' : 'text-viking-text-secondary'} />
              </div>
              <p className={`font-semibold text-sm ${primary ? 'text-viking-gold' : 'text-viking-text-primary'}`}>
                {label}
              </p>
              <p className="text-viking-text-muted text-xs mt-0.5">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointment */}
      {upcoming && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-viking-gold/5 border border-viking-gold/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-viking-gold animate-pulse" />
              <h3 className="font-viking font-semibold text-sm text-viking-gold tracking-wider">PRÓXIMO AGENDAMENTO</h3>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-viking-text-primary">{upcoming.serviceName}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-viking-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {formatDateShort(upcoming.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {upcoming.time}
                  </span>
                </div>
              </div>
              <span className={getStatusClass(upcoming.status)}>
                {getStatusLabel(upcoming.status)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-viking font-semibold text-viking-text-primary">Agendamentos Recentes</h2>
          <Link to="/cliente/agendamentos" className="text-sm text-viking-gold hover:underline flex items-center gap-1">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-viking-gray-mid rounded w-1/3 mb-2" />
                <div className="h-3 bg-viking-gray-mid rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="card p-8 text-center">
            <Calendar size={40} className="text-viking-text-muted mx-auto mb-3" />
            <p className="text-viking-text-muted text-sm">Nenhum agendamento ainda</p>
            <Link to="/cliente/agendar" className="btn-outline-gold text-sm mt-4 inline-block">
              Fazer primeiro agendamento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="card-hover p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-viking-gray-mid rounded-xl flex items-center justify-center shrink-0">
                  <Scissors size={16} className="text-viking-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-viking-text-primary truncate">{appt.serviceName}</p>
                  <p className="text-xs text-viking-text-muted mt-0.5">
                    {formatDateShort(appt.date)} às {appt.time}
                  </p>
                </div>
                <span className={getStatusClass(appt.status)}>{getStatusLabel(appt.status)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* WhatsApp + Map row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WhatsApp CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors shrink-0">
              <MessageCircle size={24} className="text-green-400" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <p className="font-semibold text-viking-text-primary text-sm">Fale pelo WhatsApp</p>
              <p className="text-xs text-viking-text-muted mt-0.5">Tire dúvidas ou agende diretamente</p>
            </div>
          </a>
        </motion.div>

        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center gap-4 p-5 rounded-2xl card">
            <div className="w-12 h-12 bg-viking-gold/10 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-viking-gold" />
            </div>
            <div>
              <p className="font-semibold text-viking-text-primary text-sm">Nossa Localização</p>
              <p className="text-xs text-viking-text-muted mt-0.5">Rua dos Vikings, 123 — Centro</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Preferred service info */}
      {user?.preferredService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-2 text-sm text-viking-text-muted"
        >
          <Star size={14} className="text-viking-gold" />
          <span>Serviço favorito: <span className="text-viking-text-secondary">{user.preferredService}</span></span>
        </motion.div>
      )}
    </div>
  );
}
