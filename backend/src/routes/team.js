const express = require('express');
const router = express.Router();
const { getFirestore } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET /api/team — público
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('team').orderBy('order', 'asc').get();
    const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ members });
  } catch {
    // fallback sem ordenação
    try {
      const db = getFirestore();
      const snap = await db.collection('team').get();
      const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json({ members });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar equipe' });
    }
  }
});

// POST /api/team — admin
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, role, specialization, photo, years, bio, order } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'Nome e função obrigatórios' });

    const db = getFirestore();
    const ref = await db.collection('team').add({
      name,
      role,
      specialization: specialization || '',
      photo: photo || '',
      years: years || '',
      bio: bio || '',
      order: order ?? 99,
      active: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ id: ref.id, message: 'Membro adicionado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar membro' });
  }
});

// PUT /api/team/:id — admin
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const { name, role, specialization, photo, years, bio, order, active } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (role !== undefined) update.role = role;
    if (specialization !== undefined) update.specialization = specialization;
    if (photo !== undefined) update.photo = photo;
    if (years !== undefined) update.years = years;
    if (bio !== undefined) update.bio = bio;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;
    update.updatedAt = new Date().toISOString();

    await db.collection('team').doc(req.params.id).update(update);
    res.json({ message: 'Membro atualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar membro' });
  }
});

// DELETE /api/team/:id — admin
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('team').doc(req.params.id).delete();
    res.json({ message: 'Membro removido' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

module.exports = router;
