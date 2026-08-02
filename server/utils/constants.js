/**
 * constants.js
 * Centraliza os valores fixos e de configuração da API.
 */

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

const API_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'DinoAPI'
};

module.exports = {
  STATUS_CODES,
  PAGINATION,
  API_CONFIG
};

/* 
EXEMPLO DE USO FUTURO:
const { STATUS_CODES, PAGINATION } = require('../utils/constants');

if (!data) return res.status(STATUS_CODES.NOT_FOUND).json(...);
const limit = req.query.limit || PAGINATION.DEFAULT_LIMIT;
*/