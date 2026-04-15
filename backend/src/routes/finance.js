const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/finance/summary
router.get('/summary', verifyAdmin, async (req, res) => {
  const { month } = req.query; // formato: YYYY-MM
  if (!month) return res.status(400).json({ error: 'Mês obrigatório' });

  const [year, m] = month.split('-');
  const start = `${year}-${m}-01`;
  const end = `${year}-${m}-31`;

  try {
    const db = getFirestore();

    // Receitas
    const revenueSnap = await db
      .collection('finance_records')
      .where('type', '==', 'revenue')
      .where('date', '>=', start)
      .where('date', '<=', end)
      .get();

    // Despesas
    const expenseSnap = await db
      .collection('finance_records')
      .where('type', '==', 'expense')
      .where('date', '>=', start)
      .where('date', '<=', end)
      .get();

    const totalRevenue = revenueSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
    const totalExpenses = expenseSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

    return res.json({
      month,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      revenueCount: revenueSnap.size,
      expenseCount: expenseSnap.size,
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
    let ref = db.collection('finance_records');

    if (type) ref = ref.where('type', '==', type);

    if (month) {
      const [year, m] = month.split('-');
      const start = `${year}-${m}-01`;
      const end = `${year}-${m}-31`;
      ref = ref.where('date', '>=', start).where('date', '<=', end);
    }

    const snapshot = await ref.orderBy('date', 'desc').get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ records });
  } catch (error) {
    // Fallback sem ordenação
    try {
      const db = getFirestore();
      let ref = db.collection('finance_records');
      if (type) ref = ref.where('type', '==', type);
      const snapshot = await ref.get();
      const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json({ records });
    } catch {
      return res.status(500).json({ error: 'Erro ao buscar registros' });
    }
  }
});

// GET /api/finance/monthly-chart - últimos 6 meses
router.get('/monthly-chart', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push({ label: `${year}-${m}`, year, month: m });
    }

    const chartData = await Promise.all(
      months.map(async ({ label, year, month }) => {
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-31`;

        const [revSnap, expSnap] = await Promise.all([
          db
            .collection('finance_records')
            .where('type', '==', 'revenue')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .get(),
          db
            .collection('finance_records')
            .where('type', '==', 'expense')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .get(),
        ]);

        const revenue = revSnap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);
        const expenses = expSnap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);

        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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
