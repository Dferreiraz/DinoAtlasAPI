const readJson = require('../utils/readJson');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const DB_PATH = 'server/database/families.json';

const getAllFamilies = async (req, res) => {
  try {
    const data = await readJson(DB_PATH);
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar famílias.', error.message)
    );
  }
};

const getFamilyById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await readJson(DB_PATH);
    const item = data.find(d => d.id === id);

    if (!item) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Família não encontrada.'));
    }
    return res.status(STATUS_CODES.OK).json(successResponse(item));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a família.', error.message)
    );
  }
};

module.exports = { getAllFamilies, getFamilyById };