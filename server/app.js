const createApp = require('./createApp');

// Instância padrão compatível com `require('./app')`.
const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
module.exports.DEFAULT_RATE_LIMIT = createApp.DEFAULT_RATE_LIMIT;
