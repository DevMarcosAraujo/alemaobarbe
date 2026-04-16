const admin = require('firebase-admin');

// Carrega .env.local em desenvolvimento (tem as chaves FIREBASE_*)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });
}

let db, auth, storage;

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const isProduction = process.env.NODE_ENV === 'production' ||
      !!process.env.FUNCTION_TARGET ||
      !!process.env.K_SERVICE ||
      !!process.env.GCLOUD_PROJECT;

    if (isProduction) {
      // Firebase Functions — usa Application Default Credentials automaticamente
      admin.initializeApp({
        storageBucket: process.env.STORAGE_BUCKET || 'cabelereiro-alemao.appspot.com',
      });
    } else {
      // Desenvolvimento local — usa service account do .env.local
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
  }

  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();

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
