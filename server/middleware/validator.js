/**
 * validator.js
 * Valida rigorosamente os parâmetros de entrada (IDs, paginação, limites,
 * filtros, busca e ordenação).
 */

const { STATUS_CODES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');
const {
  parseStrictInteger,
  parseStrictNumber,
  isSingleString,
  RELATION_FILTERS,
  NUMERIC_FILTERS,
  DINOSAUR_SORT_FIELDS,
  SORT_ORDERS,
  LIMITS
} = require('../utils/validation');

const badRequest = (res, message) => res.status(STATUS_CODES.BAD_REQUEST).json(
  errorResponse(message)
);

// Valida se o ID da URL é um inteiro positivo e seguro para JavaScript.
const validateId = (req, res, next) => {
  const numericId = parseStrictInteger(req.params.id, { min: 1 });

  if (numericId === null) {
    return badRequest(
      res,
      "O ID fornecido é inválido. Deve ser um número inteiro positivo."
    );
  }

  req.validatedId = numericId;
  next();
};

// Valida os parâmetros de paginação da Query String.
const validatePaginationAndLimits = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseStrictInteger(page, { min: 1 });
    if (pageNum === null) {
      return badRequest(
        res,
        "O parâmetro 'page' deve ser um número inteiro maior ou igual a 1."
      );
    }
  }

  if (limit !== undefined) {
    const limitNum = parseStrictInteger(limit, { min: 1, max: LIMITS.MAX_PAGE_SIZE });
    if (limitNum === null) {
      return badRequest(
        res,
        `O parâmetro 'limit' deve ser um número inteiro entre 1 e ${LIMITS.MAX_PAGE_SIZE}.`
      );
    }
  }

  next();
};

// Valida o limite específico do endpoint /random (1 a 50).
const validateRandomLimit = (req, res, next) => {
  const { limit } = req.query;

  if (limit === undefined) {
    req.validatedRandomLimit = 1;
    return next();
  }

  const limitNum = parseStrictInteger(limit, { min: 1, max: LIMITS.MAX_RANDOM_SIZE });
  if (limitNum === null) {
    return badRequest(
      res,
      `O parâmetro 'limit' deve ser um número inteiro entre 1 e ${LIMITS.MAX_RANDOM_SIZE}.`
    );
  }

  req.validatedRandomLimit = limitNum;
  next();
};

// Valida os campos de ordenação realmente existentes no modelo.
const validateSorting = (req, res, next) => {
  const { sort, order } = req.query;

  if (sort !== undefined) {
    if (!isSingleString(sort) || !DINOSAUR_SORT_FIELDS.includes(sort)) {
      return badRequest(
        res,
        `O parâmetro 'sort' deve ser um dos campos suportados: ${DINOSAUR_SORT_FIELDS.join(', ')}.`
      );
    }
  }

  if (order !== undefined) {
    if (!isSingleString(order) || !SORT_ORDERS.includes(order.toLowerCase())) {
      return badRequest(
        res,
        "O parâmetro 'order' deve ser 'asc' ou 'desc'."
      );
    }
  }

  next();
};

// Valida a busca textual.
const validateSearch = (req, res, next) => {
  const { search } = req.query;

  if (search !== undefined) {
    if (!isSingleString(search)) {
      return badRequest(
        res,
        "O parâmetro 'search' deve ser um texto único."
      );
    }

    const normalized = search.trim();

    if (normalized.length > LIMITS.MAX_SEARCH_LENGTH) {
      return badRequest(
        res,
        `O parâmetro 'search' deve ter no máximo ${LIMITS.MAX_SEARCH_LENGTH} caracteres.`
      );
    }

    req.validatedSearch = normalized;
  }

  next();
};

// Valida filtros de relacionamento e filtros numéricos suportados.
const validateFilters = (req, res, next) => {
  for (const key of RELATION_FILTERS) {
    if (req.query[key] === undefined) continue;

    if (parseStrictInteger(req.query[key], { min: 1 }) === null) {
      return badRequest(
        res,
        `O parâmetro '${key}' deve ser um número inteiro positivo.`
      );
    }
  }

  for (const key of NUMERIC_FILTERS) {
    if (req.query[key] === undefined) continue;

    if (parseStrictNumber(req.query[key], { min: 0 }) === null) {
      return badRequest(
        res,
        `O parâmetro '${key}' deve ser um número maior ou igual a zero.`
      );
    }
  }

  next();
};

// Valida o parâmetro de rota /name/:name.
const validateNameParam = (req, res, next) => {
  const name = req.params.name;

  if (!isSingleString(name) || name.trim().length > LIMITS.MAX_SEARCH_LENGTH) {
    return badRequest(
      res,
      `O parâmetro 'name' deve ter no máximo ${LIMITS.MAX_SEARCH_LENGTH} caracteres.`
    );
  }

  req.validatedName = name.trim();
  next();
};

module.exports = {
  validateId,
  validatePaginationAndLimits,
  validateRandomLimit,
  validateSorting,
  validateSearch,
  validateFilters,
  validateNameParam
};
