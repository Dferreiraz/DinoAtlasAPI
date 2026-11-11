const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { databasePath } = require('../utils/paths');
const { logError } = require('../utils/errors');
const getRelatedDinosaurs = require('../utils/getRelatedDinosaurs');

const DINOS_PATH = databasePath('dinosaurs.json');

const getAllContinents = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('continents.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('continents:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar continentes')
    );
  }
};

const getContinentById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const continent = await jsonRepository.getDatabaseById('continents.json', id);

    if (!continent) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Continente não encontrado.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(continent));
  } catch (error) {
    logError('continents:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o continente.')
    );
  }
};

const getDinosaursByContinent = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const continent = await jsonRepository.getDatabaseById('continents.json', id);

    if (!continent) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Continente não encontrado.'));
    }

    const relatedDinosaurs = await getRelatedDinosaurs(DINOS_PATH, 'continentId', id);

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, {
        message: `Dinossauros encontrados no continente: ${continent.name}`,
        count: relatedDinosaurs.length
      })
    );
  } catch (error) {
    logError('continents:dinosaurs', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por continente.')
    );
  }
};

module.exports = {
  getAllContinents,
  getContinentById,
  getDinosaursByContinent
};
