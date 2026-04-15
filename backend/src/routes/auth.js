const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const generateToken = (uid, role) => {
  return jwt.sign({ uid, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('phone').isMobilePhone('pt-BR').withMessage('Telefone inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/\d/)
      .withMessage('Senha deve conter pelo menos um número'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    try {
      const db = getFirestore();
      const existing = await db
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!existing.empty) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userRef = db.collection('users').doc();

      await userRef.set({
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'client',
        preferredService: null,
        avatar: null,
        disabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const token = generateToken(userRef.id, 'client');

      return res.status(201).json({
        message: 'Cadastro realizado com sucesso',
        token,
        user: {
          uid: userRef.id,
          name,
          email,
          phone,
          role: 'client',
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Erro ao criar conta' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha obrigatória'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const db = getFirestore();
      const snapshot = await db
        .collection('users')
        .where('email', '==', email)
        .get();

      if (snapshot.empty) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();

      if (user.disabled) {
        return res.status(401).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const token = generateToken(userDoc.id, user.role);

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          uid: userDoc.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          preferredService: user.preferredService,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  const { password, ...userData } = req.user;
  return res.json({ user: { uid: req.user.uid, ...userData } });
});

// PUT /api/auth/profile
router.put(
  '/profile',
  verifyToken,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone('pt-BR'),
    body('preferredService').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, preferredService, avatar } = req.body;

    try {
      const db = getFirestore();
      const updateData = { updatedAt: new Date().toISOString() };

      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (preferredService !== undefined) updateData.preferredService = preferredService;
      if (avatar !== undefined) updateData.avatar = avatar;

      await db.collection('users').doc(req.user.uid).update(updateData);

      return res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Senha atual obrigatória'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter pelo menos 6 caracteres')
      .matches(/\d/)
      .withMessage('Nova senha deve conter pelo menos um número'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const user = userDoc.data();

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await db.collection('users').doc(req.user.uid).update({
        password: hashed,
        updatedAt: new Date().toISOString(),
      });

      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
);

module.exports = router;
