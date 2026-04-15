const express = require('express');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings/schedule
router.get('/schedule', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('settings').doc('schedule').get();

    const defaults = {
      startTime: '09:00',
      endTime: '19:00',
      slotDuration: 30,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      closedDays: [0],
      phone: '',
      address: '',
    };

    return res.json({ schedule: doc.exists ? { ...defaults, ...doc.data() } : defaults });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT /api/settings/schedule
router.put('/schedule', verifyAdmin, async (req, res) => {
  const { startTime, endTime, slotDuration, lunchStart, lunchEnd, closedDays, phone, address } = req.body;

  try {
    const db = getFirestore();
    const updateData = { updatedAt: new Date().toISOString() };

    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (slotDuration) updateData.slotDuration = parseInt(slotDuration);
    if (lunchStart !== undefined) updateData.lunchStart = lunchStart;
    if (lunchEnd !== undefined) updateData.lunchEnd = lunchEnd;
    if (closedDays !== undefined) updateData.closedDays = closedDays;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    await db.collection('settings').doc('schedule').set(updateData, { merge: true });
    return res.json({ message: 'Configurações atualizadas' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// GET /api/settings/salon
router.get('/salon', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('settings').doc('salon').get();

    const defaults = {
      name: 'Vikings Barbearia',
      tagline: 'Tradição e estilo para guerreiros modernos',
      about: '',
      phone: '',
      email: '',
      address: '',
      instagram: '',
      facebook: '',
      whatsapp: '',
      heroVideoUrl: '',
    };

    return res.json({ salon: doc.exists ? { ...defaults, ...doc.data() } : defaults });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar dados do salão' });
  }
});

// PUT /api/settings/salon
router.put('/salon', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db
      .collection('settings')
      .doc('salon')
      .set({ ...req.body, updatedAt: new Date().toISOString() }, { merge: true });

    return res.json({ message: 'Dados do salão atualizados' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar dados do salão' });
  }
});

module.exports = router;
