/**
 * pagination.js
 * Retorna uma fatia do array baseada na página e limite, e gera metadados.
 */

const { PAGINATION } = require('./constants');

/**
 * Pagina um array de dados.
 * @param {Array} data - Array completo de dados.
 * @param {Number|String} page - Página desejada.
 * @param {Number|String} limit - Itens por página.
 * @returns {Object} Objeto contendo os metadados e os dados paginados.
 */
const paginate = (data, page, limit) => {
  // Conversão e validação
  const currentPage = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  let currentLimit = Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT);
  
  // Impede sobrecarga do servidor limitando o máximo retornado
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

/*
EXEMPLO DE USO FUTURO:
const paginate = require('../utils/pagination');

const dinosaurs = await readJson('./database/dinosaurs.json');
// Considerando query: ?page=2&limit=5
const result = paginate(dinosaurs, req.query.page, req.query.limit);

res.json({
  success: true,
  ...result.meta, // Espalha paginação no root ou usa como meta
  data: result.data
});
*/