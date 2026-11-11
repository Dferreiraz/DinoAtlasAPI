/**
 * validation.js
 * Helpers de validação estrita compartilhados por rotas, controllers e utils.
 */

const { PAGINATION } = require('./constants');

/**
 * Converte um valor em inteiro estritamente válido.
 * Aceita apenas strings compostas por dígitos (zeros à esquerda são aceitos).
 * Rejeita arrays, objetos, decimais, sinais, notação científica e valores
 * fora do intervalo seguro de Number.
 *
 * @param {*} value - Valor recebido da query string ou da rota.
 * @param {Object} [options]
 * @param {Number|null} [options.min] - Valor mínimo aceito.
 * @param {Number|null} [options.max] - Valor máximo aceito.
 * @returns {Number|null} Número válido ou null quando inválido.
 */
const parseStrictInteger = (value, { min = null, max = null } = {}) => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    return null;
  }
  if (min !== null && number < min) {
    return null;
  }
  if (max !== null && number > max) {
    return null;
  }

  return number;
};

/**
 * Converte um valor em número decimal não negativo estritamente válido.
 * Aceita apenas dígitos e, opcionalmente, uma parte decimal.
 * Rejeita arrays, objetos, sinais, notação científica e strings parcialmente
 * numéricas.
 *
 * @param {*} value - Valor recebido da query string.
 * @param {Object} [options]
 * @param {Number|null} [options.min] - Valor mínimo aceito.
 * @param {Number|null} [options.max] - Valor máximo aceito.
 * @returns {Number|null} Número válido ou null quando inválido.
 */
const parseStrictNumber = (value, { min = 0, max = null } = {}) => {
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }
  if (min !== null && number < min) {
    return null;
  }
  if (max !== null && number > max) {
    return null;
  }

  return number;
};

/**
 * Retorna true apenas para uma string única (não array/objeto).
 * @param {*} value
 * @returns {Boolean}
 */
const isSingleString = (value) => typeof value === 'string';

// Filtros de relacionamento suportados atualmente pelo modelo de dinossauros.
const RELATION_FILTERS = Object.freeze([
  'periodId',
  'epochId',
  'dietId',
  'continentId',
  'countryId',
  'formationId',
  'familyId',
  'cladeId',
  'habitatId',
  'classificationId',
  'museumId'
]);

// Filtros numéricos de faixa suportados atualmente pelo modelo.
const NUMERIC_FILTERS = Object.freeze([
  'lengthMin',
  'lengthMax',
  'weightMin',
  'weightMax',
  'heightMin',
  'heightMax',
  'estimatedSpeedMin',
  'estimatedSpeedMax'
]);

// Campos realmente existentes em dinosaurs.json que podem ser ordenados.
// `year` pertence a discoveries.json e não é aceito aqui.
const DINOSAUR_SORT_FIELDS = Object.freeze([
  'id',
  'name',
  'scientificName',
  'meaning',
  'classificationId',
  'cladeId',
  'familyId',
  'periodId',
  'epochId',
  'dietId',
  'habitatId',
  'continentId',
  'discoveryId',
  'museumId',
  'imageId',
  'length',
  'height',
  'weight',
  'estimatedSpeed',
  'species',
  'genus',
  'status'
]);

const SORT_ORDERS = Object.freeze(['asc', 'desc']);

const LIMITS = Object.freeze({
  MAX_PAGE_SIZE: PAGINATION.MAX_LIMIT,
  MAX_RANDOM_SIZE: PAGINATION.MAX_RANDOM_LIMIT,
  MAX_SEARCH_LENGTH: PAGINATION.MAX_SEARCH_LENGTH
});

module.exports = {
  parseStrictInteger,
  parseStrictNumber,
  isSingleString,
  RELATION_FILTERS,
  NUMERIC_FILTERS,
  DINOSAUR_SORT_FIELDS,
  SORT_ORDERS,
  LIMITS
};
