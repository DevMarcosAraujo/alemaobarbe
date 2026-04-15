/**
 * Script para criar o primeiro usuário admin e dados iniciais
 * Execute: node src/utils/seedAdmin.js
 */
require('dotenv').config({ path: '../../.env' });
const bcrypt = require('bcryptjs');
const { initializeFirebase } = require('../config/firebase');

async function seed() {
  const { db } = initializeFirebase();

  const email = process.env.ADMIN_EMAIL || 'admin@vikingssalao.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  console.log('🌱 Iniciando seed...\n');

  // Verificar se admin já existe
  const existing = await db.collection('users').where('email', '==', email).get();
  if (!existing.empty) {
    console.log('✅ Admin já existe:', email);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    const ref = db.collection('users').doc();
    await ref.set({
      name: 'Administrador Vikings',
      email,
      phone: '(00) 00000-0000',
      password: hashed,
      role: 'admin',
      avatar: null,
      disabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Admin criado:', email);
    console.log('🔑 Senha:', password);
  }

  // Configurações iniciais
  await db.collection('settings').doc('schedule').set({
    startTime: '09:00',
    endTime: '19:00',
    slotDuration: 30,
    lunchStart: '12:00',
    lunchEnd: '13:00',
    closedDays: [0],
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await db.collection('settings').doc('salon').set({
    name: 'Vikings Barbearia',
    tagline: 'Tradição e estilo para guerreiros modernos',
    about: 'Uma barbearia premium com tradição Viking.',
    phone: '(00) 00000-0000',
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Serviços iniciais
  const servicesSnap = await db.collection('services').get();
  if (servicesSnap.empty) {
    const services = [
      { name: 'Corte Masculino', price: 40, duration: 45, description: 'Corte clássico ou moderno com tesoura e máquina.', category: 'corte', active: true, order: 0 },
      { name: 'Barba Completa', price: 35, duration: 30, description: 'Modelagem e hidratação de barba com navalha.', category: 'barba', active: true, order: 1 },
      { name: 'Corte + Barba', price: 65, duration: 75, description: 'Combo completo para uma transformação total.', category: 'combo', active: true, order: 2 },
      { name: 'Sobrancelha', price: 20, duration: 20, description: 'Design e alinhamento de sobrancelha.', category: 'barba', active: true, order: 3 },
    ];

    for (const svc of services) {
      await db.collection('services').add({ ...svc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    console.log('✅ Serviços iniciais criados');
  }

  console.log('\n🪓 Seed concluído! Acesse: admin@vikingssalao.com\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
