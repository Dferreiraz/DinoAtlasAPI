/**
 * sorting.js
 * Sistema dinâmico de ordenação de arrays de objetos.
 */

/**
 * Ordena um array baseado em um campo específico.
 * @param {Array} data - Array a ser ordenado.
 * @param {String} sortField - Nome da propriedade usada para ordenar (ex: 'name').
 * @param {String} order - Direção ('asc' ou 'desc').
 * @returns {Array} Array ordenado; quando `sortField` é omitido ou inválido,
 *   retorna o próprio array de entrada sem criar uma cópia.
 */
const sortData = (data, sortField, order = 'asc') => {
  if (!sortField || typeof sortField !== 'string') return data;

  const normalizedOrder = typeof order === 'string' ? order.toLowerCase() : 'asc';
  const isDesc = normalizedOrder === 'desc';

  return [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    // Trata valores indefinidos/nulos jogando para o final
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    // Comparação para Strings (ordem alfabética correta)
    if (typeof valA === 'string' && typeof valB === 'string') {
      const comparison = valA.localeCompare(valB);
      return isDesc ? comparison * -1 : comparison;
    }

    // Comparação para Números
    if (valA < valB) return isDesc ? 1 : -1;
    if (valA > valB) return isDesc ? -1 : 1;

    return 0;
  });
};

module.exports = sortData;
