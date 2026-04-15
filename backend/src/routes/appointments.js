const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments - cliente: seus agendamentos | admin: todos
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    let ref = db.collection('appointments');

    if (req.user.role !== 'admin') {
      ref = ref.where('clientId', '==', req.user.uid);
    }

    const { date, status, month } = req.query;
    if (date) ref = ref.where('date', '==', date);
    if (status) ref = ref.where('status', '==', status);
    if (month) {
      const [year, m] = month.split('-');
      const start = `${year}-${m}-01`;
      const end = `${year}-${m}-31`;
      ref = ref.where('date', '>=', start).where('date', '<=', end);
    }

    // Sem orderBy para evitar exigência de índice composto no Firestore —
    // ordenação feita em memória abaixo.
    const snapshot = await ref.get();
    const appointments = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const da = `${a.date}T${a.time || '00:00'}`;
        const db2 = `${b.date}T${b.time || '00:00'}`;
        return db2.localeCompare(da); // desc
      });

    return res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// GET /api/appointments/available-slots
router.get('/available-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  try {
    const db = getFirestore();

    // Verificar se o dia está bloqueado
    const blockedDoc = await db.collection('blocked_days').doc(date).get();
    if (blockedDoc.exists && blockedDoc.data().blocked) {
      return res.json({ slots: [], blocked: true, message: blockedDoc.data().reason || 'Dia indisponível' });
    }

    // Buscar configurações de horário
    const settingsDoc = await db.collection('settings').doc('schedule').get();
    const settings = settingsDoc.exists
      ? settingsDoc.data()
      : { startTime: '09:00', endTime: '19:00', slotDuration: 30, lunchStart: '12:00', lunchEnd: '13:00' };

    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const closedDays = settings.closedDays || [0]; // domingo por padrão
    if (closedDays.includes(dayOfWeek)) {
      return res.json({ slots: [], blocked: true, message: 'Estabelecimento fechado neste dia' });
    }

    // Gerar slots
    const generateSlots = (start, end, duration, lunchStart, lunchEnd) => {
      const slots = [];
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const toTime = (minutes) => {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      let current = toMinutes(start);
      const endMin = toMinutes(end);
      const lunchStartMin = lunchStart ? toMinutes(lunchStart) : null;
      const lunchEndMin = lunchEnd ? toMinutes(lunchEnd) : null;

      while (current < endMin) {
        const timeStr = toTime(current);
        const isLunch = lunchStartMin && lunchEndMin && current >= lunchStartMin && current < lunchEndMin;
        if (!isLunch) slots.push(timeStr);
        current += duration;
      }
      return slots;
    };

    const allSlots = generateSlots(
      settings.startTime,
      settings.endTime,
      settings.slotDuration || 30,
      settings.lunchStart,
      settings.lunchEnd
    );

    // Buscar slots já agendados
    const bookedSnapshot = await db
      .collection('appointments')
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    const bookedTimes = new Set(bookedSnapshot.docs.map((d) => d.data().time));

    // Verificar horários bloqueados individualmente
    const blockedTimesSnapshot = await db
      .collection('blocked_times')
      .where('date', '==', date)
      .get();
    const blockedTimes = new Set(blockedTimesSnapshot.docs.map((d) => d.data().time));

    const slots = allSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time) && !blockedTimes.has(time),
    }));

    return res.json({ slots, blocked: false });
  } catch (error) {
    console.error('Available slots error:', error);
    return res.status(500).json({ error: 'Erro ao buscar horários' });
  }
});

// POST /api/appointments - criar agendamento
router.post(
  '/',
  verifyToken,
  [
    body('serviceId').notEmpty().withMessage('Serviço obrigatório'),
    body('date').isDate().withMessage('Data inválida'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Horário inválido'),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, date, time, notes } = req.body;

    try {
      const db = getFirestore();

      // Verificar se slot está disponível
      const existing = await db
        .collection('appointments')
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      if (!existing.empty) {
        return res.status(400).json({ error: 'Horário não disponível' });
      }

      // Buscar serviço
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      if (!serviceDoc.exists) {
        return res.status(400).json({ error: 'Serviço não encontrado' });
      }

      const service = serviceDoc.data();
      const ref = db.collection('appointments').doc();

      await ref.set({
        clientId: req.user.uid,
        clientName: req.user.name,
        clientEmail: req.user.email,
        clientPhone: req.user.phone,
        serviceId,
        serviceName: service.name,
        servicePrice: service.price,
        date,
        time,
        notes: notes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.status(201).json({
        message: 'Agendamento criado com sucesso',
        appointmentId: ref.id,
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      return res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }
);

// PUT /api/appointments/:id/cancel - cancelar (cliente)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('appointments').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const appt = doc.data();

    if (req.user.role !== 'admin' && appt.clientId !== req.user.uid) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    if (appt.status === 'cancelled') {
      return res.status(400).json({ error: 'Agendamento já cancelado' });
    }

    await doc.ref.update({
      status: 'cancelled',
      cancelledBy: req.user.role,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ message: 'Agendamento cancelado' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

// PUT /api/appointments/:id/status - admin: atualizar status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const db = getFirestore();
    const doc = await db.collection('appointments').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await doc.ref.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ message: 'Status atualizado' });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// POST /api/appointments/block-day - admin: bloquear dia
router.post('/block-day', verifyAdmin, async (req, res) => {
  const { date, reason } = req.body;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  try {
    const db = getFirestore();
    await db.collection('blocked_days').doc(date).set({
      blocked: true,
      reason: reason || 'Dia bloqueado',
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: 'Dia bloqueado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao bloquear dia' });
  }
});

// DELETE /api/appointments/block-day/:date - admin: desbloquear dia
router.delete('/block-day/:date', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('blocked_days').doc(req.params.date).delete();
    return res.json({ message: 'Dia desbloqueado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao desbloquear dia' });
  }
});

// GET /api/appointments/blocked-days
router.get('/blocked-days', async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('blocked_days').where('blocked', '==', true).get();
    const days = snapshot.docs.map((d) => ({ date: d.id, ...d.data() }));
    return res.json({ days });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar dias bloqueados' });
  }
});

// POST /api/appointments/block-time — bloquear horário individual
router.post('/block-time', verifyAdmin, async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Data e horário obrigatórios' });
  try {
    const db = getFirestore();
    const id = `${date}_${time.replace(':', '')}`;
    await db.collection('blocked_times').doc(id).set({
      date, time, blockedAt: new Date().toISOString(),
    });
    return res.json({ message: 'Horário bloqueado' });
  } catch {
    return res.status(500).json({ error: 'Erro ao bloquear horário' });
  }
});

// DELETE /api/appointments/block-time/:date/:time — desbloquear horário individual
router.delete('/block-time/:date/:time', verifyAdmin, async (req, res) => {
  const { date, time } = req.params;
  try {
    const db = getFirestore();
    const id = `${date}_${time.replace(':', '')}`;
    await db.collection('blocked_times').doc(id).delete();
    return res.json({ message: 'Horário desbloqueado' });
  } catch {
    return res.status(500).json({ error: 'Erro ao desbloquear horário' });
  }
});

// Admin: criar agendamento manual
router.post('/manual', verifyAdmin, async (req, res) => {
  const { clientName, clientPhone, serviceId, barberId, date, time, notes } = req.body;
  if (!clientName || !serviceId || !date || !time) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const db = getFirestore();
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (!serviceDoc.exists) return res.status(400).json({ error: 'Serviço não encontrado' });

    const service = serviceDoc.data();

    // Resolve barber name if provided
    let barberName = '';
    if (barberId) {
      const barberDoc = await db.collection('team').doc(barberId).get();
      if (barberDoc.exists) barberName = barberDoc.data().name || '';
    }

    const ref = db.collection('appointments').doc();

    await ref.set({
      clientId: null,
      clientName,
      clientPhone: clientPhone || '',
      clientEmail: '',
      serviceId,
      serviceName: service.name,
      servicePrice: service.price,
      barberId: barberId || null,
      barberName: barberName || '',
      date,
      time,
      notes: notes || '',
      status: 'confirmed',
      manual: true,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Agendamento manual criado', appointmentId: ref.id });
  } catch (error) {
    console.error('Manual appointment error:', error);
    return res.status(500).json({ error: 'Erro ao criar agendamento manual' });
  }
});

module.exports = router;
