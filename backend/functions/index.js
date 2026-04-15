const functions = require('firebase-functions');
const app = require('../src/app');

// Exporta o Express como Firebase Function chamada "server"
// URL: https://us-central1-cabelereiro-alemao.cloudfunctions.net/server
// Frontend usa: VITE_API_URL=https://us-central1-cabelereiro-alemao.cloudfunctions.net/server/api
exports.server = functions.https.onRequest(app);
