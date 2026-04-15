const express = require('express');
const { getFirestore } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('gallery').where('active', '==', true).get();
    const photos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ photos });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar galeria' });
  }
});

// POST /api/gallery
router.post('/', verifyAdmin, async (req, res) => {
  const { url, caption, category } = req.body;
  if (!url) return res.status(400).json({ error: 'URL da imagem obrigatória' });

  try {
    const db = getFirestore();
    const ref = db.collection('gallery').doc();
    await ref.set({
      url,
      caption: caption || '',
      category: category || 'geral',
      active: true,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Foto adicionada', photoId: ref.id });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao adicionar foto' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('gallery').doc(req.params.id).delete();
    return res.json({ message: 'Foto removida' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover foto' });
  }
});

// GET /api/gallery/banners
router.get('/banners', async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('banners').where('active', '==', true).get();
    const banners = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ banners });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar banners' });
  }
});

// POST /api/gallery/banners
router.post('/banners', verifyAdmin, async (req, res) => {
  const { title, description, imageUrl, buttonText, buttonLink } = req.body;
  if (!title || !imageUrl) return res.status(400).json({ error: 'Título e imagem obrigatórios' });

  try {
    const db = getFirestore();
    const ref = db.collection('banners').doc();
    await ref.set({
      title,
      description: description || '',
      imageUrl,
      buttonText: buttonText || 'Agendar',
      buttonLink: buttonLink || '/agendar',
      active: true,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Banner criado', bannerId: ref.id });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar banner' });
  }
});

// DELETE /api/gallery/banners/:id
router.delete('/banners/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('banners').doc(req.params.id).delete();
    return res.json({ message: 'Banner removido' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover banner' });
  }
});

module.exports = router;
