const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllDiets = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('diets.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('diets:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dietas.')
    );
  }
};

const getDietById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const item = await jsonRepository.getDatabaseById('diets.json', id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Dieta não encontrada.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    logError('diets:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a dieta.')
    );
  }
};

module.exports = { getAllDiets, getDietById };
