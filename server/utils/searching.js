/**
 * searching.js
 * Realiza buscas textuais em campos específicos de um objeto.
 */

/**
 * Busca texto em múltiplos campos de um array de objetos.
 * @param {Array} data - Array de dados.
 * @param {String} searchTerm - O texto a ser procurado (ex: "rex").
 * @param {Array<String>} fieldsToSearch - Os campos onde a busca deve ser feita.
 * @returns {Array} Dados que contém o termo de busca em pelo menos um dos campos.
 */
const searchData = (data, searchTerm, fieldsToSearch = []) => {
  if (!searchTerm || typeof searchTerm !== 'string' || fieldsToSearch.length === 0) {
    return data;
  }

  const term = searchTerm.toLowerCase().trim();

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

/*
EXEMPLO DE USO FUTURO:
const searchData = require('../utils/searching');

// Considerando a query: ?search=lagarto
const searchTerm = req.query.search;
const fieldsToSearch = ['name', 'scientificName', 'meaning', 'description'];

const foundDinos = searchData(dinosaurs, searchTerm, fieldsToSearch);
*/