const { onRequest } = require('firebase-functions/v2/https');
const app = require('../src/app');

exports.server = onRequest(
  {
    cors: ['https://alemaobarbe.netlify.app', 'http://localhost:5173'],
    invoker: 'public',
    region: 'us-central1',
  },
  app
);
