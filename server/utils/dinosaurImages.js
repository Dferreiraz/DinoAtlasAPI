/**
 * dinosaurImages.js
 * Associa registros de `images.json` aos dinossauros usando um índice agrupado
 * por `dinosaurId`, evitando `find()` dentro de loops.
 */

const jsonRepository = require('../repositories/jsonRepository');

const IMAGE_FIELDS = Object.freeze([
  ['imagem', 'image'],
  ['thumbnail', 'thumbnail'],
  ['imageAuthor', 'author'],
  ['imageLicense', 'license']
]);

/**
 * Aplica os dados da primeira imagem encontrada para o dinossauro.
 * @param {Object} dinosaur
 * @param {Map<any, Array>} index
 * @returns {Object}
 */
const applyImage = (dinosaur, index) => {
  const images = index.get(dinosaur.id);
  const image = Array.isArray(images) && images.length > 0 ? images[0] : null;

  const enriched = { ...dinosaur };

  for (const [outputField, sourceField] of IMAGE_FIELDS) {
    enriched[outputField] = image ? image[sourceField] : null;
  }

  return enriched;
};

/**
 * Aplica os dados de imagem a um dinossauro ou a uma lista de dinossauros.
 * Não altera os objetos originais.
 *
 * @param {Object|Array} dinosaurs
 * @param {Map<any, Array>} index - Índice agrupado por `dinosaurId`.
 * @returns {Object|Array}
 */
const applyImages = (dinosaurs, index) => {
  if (Array.isArray(dinosaurs)) {
    return dinosaurs.map((dinosaur) => applyImage(dinosaur, index));
  }

  return applyImage(dinosaurs, index);
};

/**
 * Obtém o índice de imagens do repositório e associa aos dinossauros.
 * Mantém o comportamento anterior de degradação silenciosa: se as imagens não
 * puderem ser lidas, os dinossauros são retornados sem os campos extras.
 *
 * @param {Object|Array} dinosaurs
 * @param {Map<any, Array>} [index] - Índice opcional (injeção em testes).
 * @returns {Promise<Object|Array>}
 */
const attachImages = async (dinosaurs, index) => {
  try {
    const imageIndex = index || await jsonRepository.getDatabaseGroupedIndex(
      'images.json',
      'dinosaurId'
    );

    return applyImages(dinosaurs, imageIndex);
  } catch (error) {
    return dinosaurs;
  }
};

module.exports = {
  applyImages,
  attachImages
};
