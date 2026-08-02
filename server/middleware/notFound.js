/**
 * notFound.js
 * Trata requisições para rotas inexistentes (404).
 */

const { STATUS_CODES } = require('../utils/constants');

const notFound = (req, res, next) => {
  return res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    message: "Rota não encontrada"
  });
};

module.exports = notFound;