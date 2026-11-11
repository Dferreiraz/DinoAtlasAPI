/**
 * filtering.js
 * Aplica filtros genéricos, sejam de correspondência exata ou de limites (min/max).
 * A validação sintática dos parâmetros é feita pelo middleware antes daqui.
 */

/**
 * Filtra um array de objetos dinamicamente.
 * @param {Array} data - Os dados originais.
 * @param {Object} queryParams - Os parâmetros de query (ex: req.query).
 * @returns {Array} O novo array filtrado.
 */
/**
 * Compara um valor do registro com o valor recebido na query.
 * Campos numéricos aceitam representações com zeros à esquerda (ex: "01" = 1).
 * Campos textuais continuam usando comparação por string.
 *
 * @param {*} itemValue - Valor armazenado no registro.
 * @param {*} queryValue - Valor validado recebido na query.
 * @returns {Boolean}
 */
const valuesMatch = (itemValue, queryValue) => {
  if (typeof itemValue === 'number') {
    if (typeof queryValue === 'string' && /^\d+$/.test(queryValue)) {
      return Number(queryValue) === itemValue;
    }
    return itemValue === queryValue;
  }

  return String(itemValue) === String(queryValue);
};

const filterData = (data, queryParams) => {
  if (!queryParams || Object.keys(queryParams).length === 0) return data;

  return data.filter(item => {
    let isValid = true;

    for (const [key, value] of Object.entries(queryParams)) {
      // Ignora parâmetros que não são filtros (reservados para paginação/ordenação/busca)
      if (['page', 'limit', 'sort', 'order', 'search'].includes(key)) continue;

      // Filtros de Mínimo (ex: lengthMin, weightMin)
      if (key.endsWith('Min')) {
        const prop = key.slice(0, -3);
        const boundary = Number(value);
        if (!Number.isFinite(boundary) || typeof item[prop] !== 'number' || item[prop] < boundary) {
          isValid = false;
        }
        continue;
      }

      // Filtros de Máximo (ex: lengthMax, weightMax)
      if (key.endsWith('Max')) {
        const prop = key.slice(0, -3);
        const boundary = Number(value);
        if (!Number.isFinite(boundary) || typeof item[prop] !== 'number' || item[prop] > boundary) {
          isValid = false;
        }
        continue;
      }

      // Filtro Exato
      if (item[key] !== undefined) {
        const itemValue = item[key];

        // Trata quando o item do banco é um array (ex: countryId: [1, 5])
        if (Array.isArray(itemValue)) {
          // Verifica se o array contém o valor (aceitando zeros à esquerda)
          if (!itemValue.some(v => valuesMatch(v, value))) {
            isValid = false;
          }
        } else {
          // Correspondência exata (numérica ou textual conforme o tipo do campo)
          if (!valuesMatch(itemValue, value)) {
            isValid = false;
          }
        }
      }
    }

    return isValid;
  });
};

module.exports = filterData;
