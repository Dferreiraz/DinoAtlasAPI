/**
 * validator.js
 * Valida rigorosamente os parâmetros de entrada (IDs, paginação e limites).
 */

const { STATUS_CODES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');

// Valida se o ID da URL é um número inteiro positivo
const validateId = (req, res, next) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return res.status(STATUS_CODES.BAD_REQUEST || 400).json(
      errorResponse("O ID fornecido é inválido. Deve ser um número inteiro positivo.")
    );
  }
  next();
};

// Valida se os limites numéricos da Query String estão corretos
const validatePaginationAndLimits = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(STATUS_CODES.BAD_REQUEST || 400).json(
        errorResponse("O parâmetro 'page' deve ser um número inteiro maior ou igual a 1.")
      );
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(STATUS_CODES.BAD_REQUEST || 400).json(
        errorResponse("O parâmetro 'limit' deve ser um número inteiro entre 1 e 100.")
      );
    }
  }

  next();
};

module.exports = {
  validateId,
  validatePaginationAndLimits
};