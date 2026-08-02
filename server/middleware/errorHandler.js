/**
 * errorHandler.js
 * Captura exceções e erros não tratados na aplicação, retornando um JSON padronizado.
 */

const { STATUS_CODES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.statusCode ? err.message : "Erro interno do servidor";

  return res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message || err.toString()
  });
};

module.exports = errorHandler;