const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - listar todos os usuários (admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc) => {
      const { password, ...data } = doc.data();
      return { uid: doc.id, ...data };
    });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// POST /api/users - criar usuário (admin)
router.post(
  '/',
  verifyAdmin,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome obrigatório'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha mínima 6 caracteres'),
    body('role').isIn(['client', 'admin']).withMessage('Role inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, role } = req.body;

    try {
      const db = getFirestore();
      const existing = await db.collection('users').where('email', '==', email).get();
      if (!existing.empty) return res.status(400).json({ error: 'Email já cadastrado' });

      const hashed = await bcrypt.hash(password, 12);
      const ref = db.collection('users').doc();
      await ref.set({
        name,
        email,
        phone: phone || '',
        password: hashed,
        role,
        avatar: null,
        disabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.status(201).json({ message: 'Usuário criado', userId: ref.id });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
);

// PUT /api/users/:id/toggle - ativar/desativar
router.put('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Usuário não encontrado' });

    const current = doc.data().disabled;
    await doc.ref.update({ disabled: !current, updatedAt: new Date().toISOString() });

    return res.json({ message: `Usuário ${!current ? 'desativado' : 'ativado'}` });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  if (req.params.id === req.user.uid) {
    return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
  }

  try {
    const db = getFirestore();
    await db.collection('users').doc(req.params.id).delete();
    return res.json({ message: 'Usuário excluído' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

module.exports = router;
