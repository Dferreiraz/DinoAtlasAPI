const readJson = require('./readJson');

/**
 * Busca dinossauros que possuem um determinado ID em um campo específico.
 * Suporta campos que são arrays (ex: countryId: [1, 2]) ou valores únicos.
 * 
 * @param {string} dbPath - Caminho relativo ao arquivo dinosaurs.json
 * @param {string} fieldName - Nome do campo a ser verificado (ex: 'continentId')
 * @param {number} targetId - O ID que estamos buscando
 * @returns {Promise<Array>} - Lista de dinossauros correspondentes
 */
const getRelatedDinosaurs = async (dbPath, fieldName, targetId) => {
  const dinosaurs = await readJson(dbPath);
  
  return dinosaurs.filter(dino => {
    const fieldValue = dino[fieldName];
    
    // Se o campo for um array (ex: countryId: [1, 5]), verifica se o targetId está incluído
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(targetId);
    }
    
    // Se for um valor único (ex: continentId: 1), verifica igualdade estrita
    return fieldValue === targetId;
  });
};

module.exports = getRelatedDinosaurs;