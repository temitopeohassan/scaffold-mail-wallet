const { createApp } = require('../dist/app');
const serverless = require('serverless-http');

let cachedHandler = null;

module.exports = async function handler(req, res) {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
};
