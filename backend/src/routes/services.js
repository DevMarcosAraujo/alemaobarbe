const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('services').where('active', '==', true).orderBy('order', 'asc').get();
    const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ services });
  } catch (error) {
    // Se não houver índice, busca sem ordenação
    try {
      const db = getFirestore();
      const snapshot = await db.collection('services').where('active', '==', true).get();
      const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json({ services });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar serviços' });
    }
  }
});

// GET /api/services/all (admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('services').get();
    const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ services });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/services
router.post(
  '/',
  verifyAdmin,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome obrigatório'),
    body('price').isFloat({ min: 0 }).withMessage('Preço inválido'),
    body('duration').isInt({ min: 15 }).withMessage('Duração mínima 15 minutos'),
    body('description').optional().trim(),
    body('category').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, price, duration, description, category, image } = req.body;

    try {
      const db = getFirestore();
      const countSnap = await db.collection('services').get();

      const ref = db.collection('services').doc();
      await ref.set({
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description: description || '',
        category: category || 'corte',
        image: image || null,
        active: true,
        order: countSnap.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.status(201).json({ message: 'Serviço criado', serviceId: ref.id });
    } catch (error) {
      console.error('Create service error:', error);
      return res.status(500).json({ error: 'Erro ao criar serviço' });
    }
  }
);

// PUT /api/services/:id
router.put('/:id', verifyAdmin, async (req, res) => {
  const { name, price, duration, description, category, image, active } = req.body;

  try {
    const db = getFirestore();
    const doc = await db.collection('services').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Serviço não encontrado' });

    const updateData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (active !== undefined) updateData.active = active;

    await doc.ref.update(updateData);
    return res.json({ message: 'Serviço atualizado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('services').doc(req.params.id).delete();
    return res.json({ message: 'Serviço excluído' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

module.exports = router;
