const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllClassifications = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('classifications.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('classifications:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar classificações.')
    );
  }
};

const getClassificationById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const item = await jsonRepository.getDatabaseById('classifications.json', id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Classificação não encontrada.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    logError('classifications:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a classificação.')
    );
  }
};

module.exports = { getAllClassifications, getClassificationById };
