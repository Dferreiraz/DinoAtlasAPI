const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllClades = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('clades.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('clades:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar clados.')
    );
  }
};

const getCladeById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const item = await jsonRepository.getDatabaseById('clades.json', id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Clado não encontrado.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    logError('clades:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o clado.')
    );
  }
};

module.exports = { getAllClades, getCladeById };
