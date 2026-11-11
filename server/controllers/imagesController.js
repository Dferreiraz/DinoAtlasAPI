const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const IMAGES_FILE = 'images.json';
const DINOSAURS_FILE = 'dinosaurs.json';

exports.getAllImages = async (req, res) => {
  try {
    const imagens = await jsonRepository.getDatabase(IMAGES_FILE);

    return res.status(STATUS_CODES.OK).json(
      successResponse(imagens, { total: imagens.length })
    );
  } catch (error) {
    logError('images:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro interno no servidor ao buscar imagens.')
    );
  }
};

exports.getImagesByDinosaur = async (req, res) => {
  try {
    const dinosaurId = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const dinossauro = await jsonRepository.getDatabaseById(DINOSAURS_FILE, dinosaurId);

    if (!dinossauro) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Dinossauro não encontrado.')
      );
    }

    const index = await jsonRepository.getDatabaseGroupedIndex(
      IMAGES_FILE,
      'dinosaurId'
    );
    const imagensDoDino = index.get(dinosaurId) || [];

    return res.status(STATUS_CODES.OK).json(
      successResponse(imagensDoDino, { dinosaurId, total: imagensDoDino.length })
    );
  } catch (error) {
    logError('images:by-dinosaur', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro interno no servidor ao buscar imagens do dinossauro.')
    );
  }
};
