const readJson = require('../utils/readJson');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const getApiInfo = async (req, res) => {
  try {
    const metadata = await readJson('server/database/metadata.json');
    const dinosaurs = await readJson('server/database/dinosaurs.json');
    
    const apiInfo = {
      name: metadata.apiName,
      version: metadata.version,
      description: metadata.description,
      status: "Online",
      totalDinosaurs: dinosaurs.length,
      totalEndpoints: 15, // Quantidade mapeada nesta etapa
      author: metadata.author,
      github: metadata.github,
      lastUpdate: metadata.lastUpdate
    };

    return res.status(STATUS_CODES.OK).json(successResponse(apiInfo));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao recuperar informações da API', error.message)
    );
  }
};

module.exports = {
  getApiInfo
};