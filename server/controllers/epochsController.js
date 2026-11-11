const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllEpochs = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('epochs.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('epochs:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar épocas.')
    );
  }
};

const getEpochById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const item = await jsonRepository.getDatabaseById('epochs.json', id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Época não encontrada.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    logError('epochs:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a época.')
    );
  }
};

module.exports = { getAllEpochs, getEpochById };
