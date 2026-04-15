const jwt = require('jsonwebtoken');
const { getFirestore } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();
    if (userData.disabled) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    req.user = { uid: decoded.uid, ...userData };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Erro de autenticação' });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
      }
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro de autorização' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (userDoc.exists) {
      req.user = { uid: decoded.uid, ...userDoc.data() };
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { verifyToken, verifyAdmin, optionalAuth };
