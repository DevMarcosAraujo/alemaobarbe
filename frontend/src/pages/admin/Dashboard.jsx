import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../utils/api';
import { formatCurrency, getStatusLabel, getStatusClass, formatDateShort } from '../../utils/formatters';
import { format } from 'date-fns';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const month = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, apptRes, chartRes] = await Promise.allSettled([
          api.get(`/finance/summary?month=${month}`),
          api.get(`/appointments?month=${month}`),
          api.get('/finance/monthly-chart'),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data.appointments || []);
        if (chartRes.status === 'fulfilled') setChart(chartRes.value.data.chart || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAppts = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled');
  const pendingAppts = appointments.filter((a) => a.status === 'pending');
  const completedAppts = appointments.filter((a) => a.status === 'completed');

  const statCards = [
    {
      label: 'Faturamento (mês)',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Lucro (mês)',
      value: formatCurrency(stats?.profit || 0),
      icon: TrendingUp,
      color: 'text-viking-gold',
      bg: 'bg-viking-gold/10',
      border: 'border-viking-gold/20',
    },
    {
      label: 'Agendamentos Hoje',
      value: todayAppts.length,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Pendentes',
      value: pendingAppts.length,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-viking text-2xl md:text-3xl font-bold text-viking-text-primary">
          Dashboard
        </h1>
        <p className="text-viking-text-muted mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM")} — Visão geral do mês
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card p-5 border ${border}`}
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            {loading ? (
              <div className="h-7 w-20 bg-viking-gray-mid rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            )}
            <p className="text-viking-text-muted text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-viking font-semibold text-viking-text-primary">Financeiro (6 meses)</h2>
            <Link to="/admin/financeiro" className="text-xs text-viking-gold hover:underline">Ver detalhes</Link>
          </div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart} barSize={8} barGap={2}>
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
            <div className="h-52 flex items-center justify-center text-viking-text-muted text-sm">
              Sem dados financeiros ainda
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            {[
              { color: 'bg-viking-gold', label: 'Receita' },
              { color: 'bg-viking-red', label: 'Despesas' },
              { color: 'bg-green-500', label: 'Lucro' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-viking-text-muted">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-viking font-semibold text-sm text-viking-text-primary">Hoje</h2>
            <Link to="/admin/agendamentos" className="text-xs text-viking-gold hover:underline">Ver todos</Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-viking-text-muted mx-auto mb-2" />
              <p className="text-viking-text-muted text-xs">Nenhum agendamento hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.slice(0, 5).map((appt) => (
                <div key={appt.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-viking-gray-mid rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-viking-gold">{appt.time?.slice(0, 5)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-viking-text-primary truncate">{appt.clientName}</p>
                    <p className="text-xs text-viking-text-muted truncate">{appt.serviceName}</p>
                  </div>
                  <span className={`${getStatusClass(appt.status)} shrink-0`}>
                    {getStatusLabel(appt.status)}
                  </span>
                </div>
              ))}
              {todayAppts.length > 5 && (
                <p className="text-xs text-viking-text-muted text-center">+{todayAppts.length - 5} mais</p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mt-6 overflow-hidden"
      >
        <div className="p-5 border-b border-viking-gray-mid flex items-center justify-between">
          <h2 className="font-viking font-semibold text-viking-text-primary">Agendamentos do Mês</h2>
          <Link to="/admin/agendamentos" className="text-xs text-viking-gold hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-viking-gray-mid">
                {['Cliente', 'Serviço', 'Data', 'Horário', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-viking-text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-viking-gray-mid">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 bg-viking-gray-mid rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.slice(0, 8).map((appt) => (
                <tr key={appt.id} className="border-b border-viking-gray-mid hover:bg-viking-gray-mid/30 transition-colors">
                  <td className="px-5 py-3 text-viking-text-primary font-medium">{appt.clientName}</td>
                  <td className="px-5 py-3 text-viking-text-secondary">{appt.serviceName}</td>
                  <td className="px-5 py-3 text-viking-text-muted">{formatDateShort(appt.date)}</td>
                  <td className="px-5 py-3 text-viking-text-muted">{appt.time}</td>
                  <td className="px-5 py-3">
                    <span className={getStatusClass(appt.status)}>{getStatusLabel(appt.status)}</span>
                  </td>
                </tr>
              ))}
              {!loading && appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-viking-text-muted text-sm">
                    Nenhum agendamento este mês
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
