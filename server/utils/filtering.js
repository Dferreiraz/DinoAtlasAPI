/**
 * filtering.js
 * Aplica filtros genéricos, sejam de correspondência exata ou de limites (min/max).
 */

/**
 * Filtra um array de objetos dinamicamente.
 * @param {Array} data - Os dados originais.
 * @param {Object} queryParams - Os parâmetros de query (ex: req.query).
 * @returns {Array} O novo array filtrado.
 */
const filterData = (data, queryParams) => {
  if (!queryParams || Object.keys(queryParams).length === 0) return data;

  return data.filter(item => {
    let isValid = true;

    for (const [key, value] of Object.entries(queryParams)) {
      // Ignora parâmetros que não são filtros (reservados para paginação/ordenação/busca)
      if (['page', 'limit', 'sort', 'order', 'search'].includes(key)) continue;

      // Filtros de Mínimo (ex: lengthMin, weightMin)
      if (key.endsWith('Min')) {
        const prop = key.replace('Min', '');
        if (item[prop] < Number(value)) isValid = false;
        continue;
      }

      // Filtros de Máximo (ex: lengthMax, weightMax)
      if (key.endsWith('Max')) {
        const prop = key.replace('Max', '');
        if (item[prop] > Number(value)) isValid = false;
        continue;
      }

      // Filtro Exato
      if (item[key] !== undefined) {
        const itemValue = item[key];
        
        // Trata quando o item do banco é um array (ex: countryId: [1, 5])
        if (Array.isArray(itemValue)) {
          // Verifica se o array contém o valor (convertendo ambos para string)
          if (!itemValue.some(v => String(v) === String(value))) {
            isValid = false;
          }
        } else {
          // Correspondência exata convertendo para string
          if (String(itemValue) !== String(value)) {
            isValid = false;
          }
        }
      }
    }

    return isValid;
  });
};

module.exports = filterData;

/*
EXEMPLO DE USO FUTURO:
const filterData = require('../utils/filtering');

// Considerando a query: ?dietId=1&lengthMin=5&weightMax=5000
const filters = { dietId: "1", lengthMin: "5", weightMax: "5000" };
const filteredDinos = filterData(dinosaurs, filters);
*/