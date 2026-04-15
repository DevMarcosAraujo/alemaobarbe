const express = require('express');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/partners
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('partners').where('active', '==', true).get();
    const partners = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ partners });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// POST /api/partners
router.post('/', verifyAdmin, async (req, res) => {
  const { name, logoUrl, website, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do parceiro obrigatório' });

  try {
    const db = getFirestore();
    const ref = db.collection('partners').doc();
    await ref.set({
      name,
      logoUrl: logoUrl || null,
      website: website || null,
      description: description || '',
      active: true,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Parceiro cadastrado', partnerId: ref.id });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar parceiro' });
  }
});

// PUT /api/partners/:id
router.put('/:id', verifyAdmin, async (req, res) => {
  const { name, logoUrl, website, description, active } = req.body;

  try {
    const db = getFirestore();
    const doc = await db.collection('partners').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Parceiro não encontrado' });

    const updateData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    await doc.ref.update(updateData);
    return res.json({ message: 'Parceiro atualizado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar parceiro' });
  }
});

// DELETE /api/partners/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('partners').doc(req.params.id).delete();
    return res.json({ message: 'Parceiro removido' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover parceiro' });
  }
});

module.exports = router;
