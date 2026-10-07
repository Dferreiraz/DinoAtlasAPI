const readJson = require('../utils/readJson');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const DB_PATH = 'server/database/dinosaurs.json';

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

const getStatus = (req, res) => {
  return res.status(STATUS_CODES.OK).json(
    successResponse({
      status: "online",
      version: "2.3.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  );
};

const getStatistics = async (req, res) => {
  try {
    const dinosaurs = await readJson(DB_PATH);
    
    // Calcula as contagens baseadas em Sets (valores únicos)
    const totalDinosaurs = dinosaurs.length;
    const totalFamilies = new Set(dinosaurs.map(d => d.familyId)).size;
    const totalPeriods = new Set(dinosaurs.map(d => d.periodId)).size;
    const totalContinents = new Set(dinosaurs.map(d => d.continentId)).size;
    
    // Arrays aninhados precisam de tratamento para count único
    const allCountries = [];
    dinosaurs.forEach(d => {
      if (Array.isArray(d.countryId)) {
        allCountries.push(...d.countryId);
      }
    });
    const totalCountries = new Set(allCountries).size;

    return res.status(STATUS_CODES.OK).json(
      successResponse({
        totalDinosaurs,
        totalFamilies,
        totalPeriods,
        totalContinents,
        totalCountries
      })
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar estatísticas da API.', error.message)
    );
  }
};

module.exports = {
  getApiInfo,
  getStatus,
  getStatistics
};