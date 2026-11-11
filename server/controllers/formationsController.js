const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { databasePath } = require('../utils/paths');
const { logError } = require('../utils/errors');
const getRelatedDinosaurs = require('../utils/getRelatedDinosaurs');

const DINOS_PATH = databasePath('dinosaurs.json');

const getAllFormations = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('formations.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('formations:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar formações geológicas')
    );
  }
};

const getFormationById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const formation = await jsonRepository.getDatabaseById('formations.json', id);

    if (!formation) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Formação geológica não encontrada.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(formation));
  } catch (error) {
    logError('formations:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a formação geológica.')
    );
  }
};

const getDinosaursByFormation = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const formation = await jsonRepository.getDatabaseById('formations.json', id);

    if (!formation) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Formação geológica não encontrada.'));
    }

    const relatedDinosaurs = await getRelatedDinosaurs(DINOS_PATH, 'formationId', id);

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, {
        message: `Dinossauros encontrados na formação: ${formation.name}`,
        count: relatedDinosaurs.length
      })
    );
  } catch (error) {
    logError('formations:dinosaurs', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por formação geológica.')
    );
  }
};

module.exports = {
  getAllFormations,
  getFormationById,
  getDinosaursByFormation
};
