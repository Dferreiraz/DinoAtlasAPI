const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');
const version = require('../utils/version');

const DINOSAURS_FILE = 'dinosaurs.json';

const getApiInfo = async (req, res) => {
  try {
    const [metadata, dinosaurs] = await Promise.all([
      jsonRepository.getDatabase('metadata.json'),
      jsonRepository.getDatabase(DINOSAURS_FILE)
    ]);

    const endpointCount = req.app && req.app.locals
      ? req.app.locals.publicEndpointCount
      : undefined;

    const apiInfo = {
      name: metadata.apiName,
      version,
      description: metadata.description,
      status: metadata.status || 'Online',
      totalDinosaurs: dinosaurs.length,
      totalEndpoints: Number.isInteger(endpointCount) ? endpointCount : 0,
      author: metadata.author,
      github: metadata.github,
      lastUpdate: metadata.lastUpdate
    };

    return res.status(STATUS_CODES.OK).json(successResponse(apiInfo));
  } catch (error) {
    logError('api-info', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao recuperar informações da API')
    );
  }
};

const getStatus = (req, res) => {
  return res.status(STATUS_CODES.OK).json(
    successResponse({
      status: 'online',
      version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  );
};

const countDistinct = (values) => new Set(
  values.filter((value) => value !== undefined && value !== null)
).size;

const getStatistics = async (req, res) => {
  try {
    const [
      dinosaurs,
      families,
      periods,
      continents,
      countries,
      discoveries
    ] = await Promise.all([
      jsonRepository.getDatabase(DINOSAURS_FILE),
      jsonRepository.getDatabase('families.json'),
      jsonRepository.getDatabase('periods.json'),
      jsonRepository.getDatabase('continents.json'),
      jsonRepository.getDatabase('countries.json'),
      jsonRepository.getDatabase('discoveries.json')
    ]);

    const countryIds = dinosaurs.flatMap((dinosaur) => {
      if (Array.isArray(dinosaur.countryId)) return dinosaur.countryId;
      return [dinosaur.countryId];
    });

    return res.status(STATUS_CODES.OK).json(
      successResponse({
        // Totais de registros existentes nas tabelas de referência.
        totalDinosaurs: dinosaurs.length,
        totalFamilies: families.length,
        totalPeriods: periods.length,
        totalContinents: continents.length,
        totalCountries: countries.length,
        totalDiscoveries: discoveries.length,

        // Valores distintos efetivamente referenciados pelos dinossauros.
        usage: {
          families: countDistinct(dinosaurs.map((dinosaur) => dinosaur.familyId)),
          periods: countDistinct(dinosaurs.map((dinosaur) => dinosaur.periodId)),
          continents: countDistinct(dinosaurs.map((dinosaur) => dinosaur.continentId)),
          countries: countDistinct(countryIds)
        }
      })
    );
  } catch (error) {
    logError('api-statistics', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar estatísticas da API.')
    );
  }
};

module.exports = {
  getApiInfo,
  getStatus,
  getStatistics
};
