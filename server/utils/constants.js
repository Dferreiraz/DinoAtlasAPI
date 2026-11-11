/**
 * constants.js
 * Centraliza os valores fixos e de configuração da API.
 */

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MAX_RANDOM_LIMIT: 50,
  MAX_SEARCH_LENGTH: 100
};

module.exports = {
  STATUS_CODES,
  PAGINATION
};

/* 
EXEMPLO DE USO:
const { STATUS_CODES, PAGINATION } = require('../utils/constants');
const { parseStrictInteger } = require('../utils/validation');

if (!data) return res.status(STATUS_CODES.NOT_FOUND).json(...);

// A validação é estrita: `null` indica valor inválido e deve resultar em 400,
// nunca em substituição silenciosa pelo valor padrão.
const limit = parseStrictInteger(req.query.limit, { min: 1, max: PAGINATION.MAX_LIMIT });
*/