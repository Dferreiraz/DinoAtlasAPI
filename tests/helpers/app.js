const createApp = require('../../server/createApp');

/**
 * Cria uma aplicação isolada sem rate limiting para a maioria dos testes.
 * A proteção de produção permanece intacta em server/createApp.js.
 */
const createTestApp = (options = {}) => createApp({
  rateLimiter: false,
  ...options
});

/**
 * Cria uma aplicação com rate limiting explícito e isolado.
 * @param {Object} [overrides]
 */
const createRateLimitedApp = (overrides = {}) => createApp({
  rateLimiter: {
    windowMs: 60 * 1000,
    max: 2,
    ...overrides
  }
});

module.exports = {
  createTestApp,
  createRateLimitedApp
};
