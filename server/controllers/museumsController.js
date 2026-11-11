const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllMuseums = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('museums.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('museums:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar museus.')
    );
  }
};

const getMuseumById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const item = await jsonRepository.getDatabaseById('museums.json', id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Museu não encontrado.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    logError('museums:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o museu.')
    );
  }
};

module.exports = { getAllMuseums, getMuseumById };
