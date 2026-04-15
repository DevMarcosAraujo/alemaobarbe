import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr + 'T12:00:00') : dateStr;
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const formatPhone = (phone) => {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não compareceu',
  };
  return labels[status] || status;
};

export const getStatusClass = (status) => {
  const classes = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    no_show: 'badge-cancelled',
  };
  return `badge ${classes[status] || 'badge-pending'}`;
};

export const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayIndex] || '';
};

export const generateDateOptions = (daysAhead = 30) => {
  const dates = [];
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
};
