/**
 * searching.js
 * Realiza buscas textuais em campos específicos de um objeto.
 */

const { PAGINATION } = require('./constants');

/**
 * Busca texto em múltiplos campos de um array de objetos.
 * @param {Array} data - Array de dados.
 * @param {String} searchTerm - O texto a ser procurado (ex: "rex").
 * @param {Array<String>} fieldsToSearch - Os campos onde a busca deve ser feita.
 * @returns {Array} Dados que contêm o termo de busca em pelo menos um dos campos.
 */
const searchData = (data, searchTerm, fieldsToSearch = []) => {
  if (!searchTerm || typeof searchTerm !== 'string' || fieldsToSearch.length === 0) {
    return data;
  }

  const term = searchTerm.toLowerCase().trim();

  // Busca vazia após normalização significa ausência de filtro
  if (term.length === 0 || term.length > PAGINATION.MAX_SEARCH_LENGTH) {
    return data;
  }

  return data.filter(item => {
    // Percorre os campos desejados e verifica se o termo está incluso neles
    return fieldsToSearch.some(field => {
      const value = item[field];
      if (value && typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    });
  });
};

module.exports = searchData;
