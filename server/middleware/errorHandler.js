/**
 * errorHandler.js
 * Captura exceções e erros não tratados na aplicação, retornando um JSON padronizado.
 */

const { STATUS_CODES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.statusCode ? err.message : "Erro interno do servidor.";

  // Loga o erro real no console para o desenvolvedor investigar
  console.error(`[Erro Crítico] ${err.message}`);

  return res.status(statusCode).json(
    errorResponse(message, err.message || err.toString())
  );
};

module.exports = errorHandler;