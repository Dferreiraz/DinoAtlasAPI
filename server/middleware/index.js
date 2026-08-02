/**
 * index.js
 * Centraliza e exporta todos os middlewares da aplicação.
 */

const logger = require('./logger');
const notFound = require('./notFound');
const errorHandler = require('./errorHandler');

module.exports = {
  logger,
  notFound,
  errorHandler
};