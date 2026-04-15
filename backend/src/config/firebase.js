const admin = require('firebase-admin');
require('dotenv').config();

let db, auth, storage;

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();

  // Configurações do Firestore
  db.settings({ ignoreUndefinedProperties: true });

  return { db, auth, storage };
};

const getFirestore = () => {
  if (!db) initializeFirebase();
  return db;
};

const getAuth = () => {
  if (!auth) initializeFirebase();
  return auth;
};

const getStorage = () => {
  if (!storage) initializeFirebase();
  return storage;
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getStorage,
  admin,
};
