/**
 * pagination.js
 * Retorna uma fatia do array baseada na página e limite, e gera metadados.
 */

const { PAGINATION } = require('./constants');
const { parseStrictInteger } = require('./validation');

/**
 * Pagina um array de dados.
 * Os parâmetros já chegam validados do middleware; esta função mantém um
 * fallback seguro para uso direto (sem confiar em parseInt parcial).
 *
 * @param {Array} data - Array completo de dados.
 * @param {Number|String} page - Página desejada.
 * @param {Number|String} limit - Itens por página.
 * @returns {Object} Objeto contendo os metadados e os dados paginados.
 */
const paginate = (data, page, limit) => {
  const parsedPage = parseStrictInteger(page, { min: 1 });
  const currentPage = parsedPage === null ? PAGINATION.DEFAULT_PAGE : parsedPage;

  const parsedLimit = parseStrictInteger(limit, { min: 1 });
  let currentLimit = parsedLimit === null ? PAGINATION.DEFAULT_LIMIT : parsedLimit;

  // Impede sobrecarga do servidor limitando o máximo retornado em uso direto
  if (currentLimit > PAGINATION.MAX_LIMIT) {
    currentLimit = PAGINATION.MAX_LIMIT;
  }

  const total = data.length;
  const totalPages = Math.ceil(total / currentLimit);
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = startIndex + currentLimit;

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    meta: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages
    },
    data: paginatedData
  };
};

module.exports = paginate;
