/**
 * index.js
 * Centraliza e exporta todos os middlewares da aplicação.
 */

const logger = require('./logger');
const notFound = require('./notFound');
const errorHandler = require('./errorHandler');
const requestId = require('./requestId');

module.exports = {
  logger,
  notFound,
  errorHandler,
  requestId
};
