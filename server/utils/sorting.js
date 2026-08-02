/**
 * sorting.js
 * Sistema dinâmico de ordenação de arrays de objetos.
 */

/**
 * Ordena um array baseado em um campo específico.
 * @param {Array} data - Array a ser ordenado.
 * @param {String} sortField - Nome da propriedade usada para ordenar (ex: 'name').
 * @param {String} order - Direção ('asc' ou 'desc').
 * @returns {Array} Novo array ordenado.
 */
const sortData = (data, sortField, order = 'asc') => {
  if (!sortField) return data;

  const isDesc = order.toLowerCase() === 'desc';

  return [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    // Trata valores indefinidos jogando para o final
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

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

/*
EXEMPLO DE USO FUTURO:
const sortData = require('../utils/sorting');

const dinos = [{ name: "T-rex", weight: 8000 }, { name: "Velociraptor", weight: 15 }];
// Ordenar por peso decrescente: ?sort=weight&order=desc
const sorted = sortData(dinos, 'weight', 'desc'); 
*/