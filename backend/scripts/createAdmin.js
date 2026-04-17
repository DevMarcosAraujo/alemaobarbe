require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const bcrypt = require('bcryptjs');
const { initializeFirebase, getFirestore } = require('../src/config/firebase');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vikingssalao.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const ADMIN_NAME = 'Administrador';

async function createAdmin() {
  initializeFirebase();
  const db = getFirestore();

  // Verifica se já existe
  const existing = await db.collection('users').where('email', '==', ADMIN_EMAIL).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    // Garante que o role está como admin
    await doc.ref.update({ role: 'admin' });
    console.log(`✅ Usuário já existe. Role atualizado para admin.`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const ref = db.collection('users').doc();

  await ref.set({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phone: '',
    password: hashedPassword,
    role: 'admin',
    avatar: null,
    preferredService: null,
    disabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('✅ Admin criado com sucesso!');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Senha: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
