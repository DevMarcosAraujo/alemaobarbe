const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Helpers
const monthRange = (month) => {
  const [year, m] = month.split('-');
  return { start: `${year}-${m}-01`, end: `${year}-${m}-31` };
};

// Busca todos os registros do mês (sem filtro de tipo — evita índice composto)
const fetchMonthRecords = async (db, month) => {
  const { start, end } = monthRange(month);
  const snap = await db
    .collection('finance_records')
    .where('date', '>=', start)
    .where('date', '<=', end)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// GET /api/finance/summary
router.get('/summary', verifyAdmin, async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: 'Mês obrigatório' });

  try {
    const db = getFirestore();
    const records = await fetchMonthRecords(db, month);

    const totalRevenue = records
      .filter((r) => r.type === 'revenue')
      .reduce((s, r) => s + (r.amount || 0), 0);
    const totalExpenses = records
      .filter((r) => r.type === 'expense')
      .reduce((s, r) => s + (r.amount || 0), 0);

    return res.json({
      month,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      revenueCount: records.filter((r) => r.type === 'revenue').length,
      expenseCount: records.filter((r) => r.type === 'expense').length,
    });
  } catch (error) {
    console.error('Finance summary error:', error);
    return res.status(500).json({ error: 'Erro ao calcular resumo financeiro' });
  }
});

// GET /api/finance/records
router.get('/records', verifyAdmin, async (req, res) => {
  const { type, month } = req.query;

  try {
    const db = getFirestore();
    let records;

    if (month) {
      records = await fetchMonthRecords(db, month);
    } else {
      const snap = await db.collection('finance_records').get();
      records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    // Filtros em memória (evita índices compostos)
    if (type) records = records.filter((r) => r.type === type);
    records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return res.json({ records });
  } catch (error) {
    console.error('Finance records error:', error);
    return res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

// GET /api/finance/monthly-chart - últimos 6 meses
router.get('/monthly-chart', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push({ label: `${year}-${m}`, year, month: m });
    }

    const chartData = await Promise.all(
      months.map(async ({ label, month }) => {
        const records = await fetchMonthRecords(db, label);
        const revenue  = records.filter((r) => r.type === 'revenue').reduce((s, r) => s + (r.amount || 0), 0);
        const expenses = records.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0);
        return {
          month: label,
          label: monthNames[parseInt(month) - 1],
          revenue,
          expenses,
          profit: revenue - expenses,
        };
      })
    );

    return res.json({ chart: chartData });
  } catch (error) {
    console.error('Chart error:', error);
    return res.status(500).json({ error: 'Erro ao gerar gráfico' });
  }
});

// POST /api/finance/records
router.post(
  '/records',
  verifyAdmin,
  [
    body('type').isIn(['revenue', 'expense']).withMessage('Tipo inválido'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valor inválido'),
    body('description').trim().isLength({ min: 2 }).withMessage('Descrição obrigatória'),
    body('date').isDate().withMessage('Data inválida'),
    body('category').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, amount, description, date, category, appointmentId } = req.body;

    try {
      const db = getFirestore();
      const ref = db.collection('finance_records').doc();

      await ref.set({
        type,
        amount: parseFloat(amount),
        description,
        date,
        category: category || (type === 'revenue' ? 'serviço' : 'custo'),
        appointmentId: appointmentId || null,
        createdBy: req.user.uid,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ message: 'Registro criado', recordId: ref.id });
    } catch (error) {
      console.error('Create finance record error:', error);
      return res.status(500).json({ error: 'Erro ao criar registro' });
    }
  }
);

// POST /api/finance/sync-appointments — importa agendamentos concluídos sem registro
router.post('/sync-appointments', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();

    // Busca todos os agendamentos concluídos
    const apptSnap = await db
      .collection('appointments')
      .where('status', '==', 'completed')
      .get();

    if (apptSnap.empty) {
      return res.json({ message: 'Nenhum agendamento concluído encontrado', imported: 0 });
    }

    // Busca IDs de agendamentos que já têm registro
    const finSnap = await db
      .collection('finance_records')
      .where('appointmentId', '!=', null)
      .get();
    const existingIds = new Set(finSnap.docs.map((d) => d.data().appointmentId).filter(Boolean));

    // Cria registros para os que ainda não têm
    const batch = db.batch();
    let count = 0;

    apptSnap.docs.forEach((doc) => {
      if (existingIds.has(doc.id)) return;
      const appt = doc.data();
      if (!appt.servicePrice && !appt.serviceName) return; // skip inválidos

      const ref = db.collection('finance_records').doc();
      batch.set(ref, {
        type: 'revenue',
        amount: appt.servicePrice || 0,
        description: `${appt.serviceName || 'Serviço'} — ${appt.clientName || 'Cliente'}`,
        date: appt.date,
        category: 'serviço',
        appointmentId: doc.id,
        createdBy: req.user.uid,
        createdAt: new Date().toISOString(),
      });
      count++;
    });

    if (count > 0) await batch.commit();

    return res.json({ message: `${count} registro(s) importado(s)`, imported: count });
  } catch (error) {
    console.error('Sync appointments error:', error);
    return res.status(500).json({ error: 'Erro ao sincronizar agendamentos' });
  }
});

// PUT /api/finance/records/:id
router.put('/records/:id', verifyAdmin, async (req, res) => {
  const { type, amount, description, date, category } = req.body;
  if (!type || !amount || !description || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  try {
    const db = getFirestore();
    const doc = await db.collection('finance_records').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Registro não encontrado' });

    await doc.ref.update({
      type,
      amount: parseFloat(amount),
      description,
      date,
      category: category || (type === 'revenue' ? 'serviço' : 'custo'),
      updatedAt: new Date().toISOString(),
    });
    return res.json({ message: 'Registro atualizado' });
  } catch (error) {
    console.error('Update finance record error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

// DELETE /api/finance/records/:id
router.delete('/records/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('finance_records').doc(req.params.id).delete();
    return res.json({ message: 'Registro excluído' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});

module.exports = router;
