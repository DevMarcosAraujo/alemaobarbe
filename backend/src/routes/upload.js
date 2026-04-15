const express = require('express');
const multer = require('multer');
const path = require('path');
const { getStorage } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer em memória (sem salvar no disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas (jpg, png, webp)'));
  },
});

// POST /api/upload/image
router.post('/image', verifyAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }

  try {
    const storage = getStorage();
    const bucket = storage.bucket();

    const ext = path.extname(req.file.originalname) || '.jpg';
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    // Tornar público
    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

module.exports = router;
