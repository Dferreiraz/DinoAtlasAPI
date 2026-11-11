const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { databasePath } = require('../utils/paths');
const { logError } = require('../utils/errors');
const getRelatedDinosaurs = require('../utils/getRelatedDinosaurs');

const DINOS_PATH = databasePath('dinosaurs.json');

const getAllCountries = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('countries.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('countries:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar países')
    );
  }
};

const getCountryById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const country = await jsonRepository.getDatabaseById('countries.json', id);

    if (!country) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('País não encontrado.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(country));
  } catch (error) {
    logError('countries:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o país.')
    );
  }
};

const getDinosaursByCountry = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const country = await jsonRepository.getDatabaseById('countries.json', id);

    if (!country) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('País não encontrado.'));
    }

    const relatedDinosaurs = await getRelatedDinosaurs(DINOS_PATH, 'countryId', id);

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, {
        message: `Dinossauros encontrados no país: ${country.name}`,
        count: relatedDinosaurs.length
      })
    );
  } catch (error) {
    logError('countries:dinosaurs', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por país.')
    );
  }
};

module.exports = {
  getAllCountries,
  getCountryById,
  getDinosaursByCountry
};
