const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

const getAllDiscoveries = async (req, res) => {
  try {
    const data = await jsonRepository.getDatabase('discoveries.json');
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    logError('discoveries:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar descobertas')
    );
  }
};

const getDiscoveryById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    const discovery = await jsonRepository.getDatabaseById('discoveries.json', id);

    if (!discovery) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Descoberta não encontrada.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(discovery));
  } catch (error) {
    logError('discoveries:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a descoberta.')
    );
  }
};

module.exports = {
  getAllDiscoveries,
  getDiscoveryById
};
