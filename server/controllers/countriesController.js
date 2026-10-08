const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const DB_PATH = path.join(__dirname, '../database/countries.json');
const DINOS_PATH = path.join(__dirname, '../database/dinosaurs.json');

const getAllCountries = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de países não encontrado.')
      );
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar países', error.message)
    );
  }
};

const getCountryById = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de países não encontrado.')
      );
    }
    const id = parseInt(req.params.id, 10);
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const country = data.find(c => c.id === id);

    if (!country) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('País não encontrado.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(country));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o país.', error.message)
    );
  }
};

const getDinosaursByCountry = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH) || !fs.existsSync(DINOS_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivos de dados não encontrados.')
      );
    }
    
    const id = parseInt(req.params.id, 10);
    const countries = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const country = countries.find(c => c.id === id);
    
    if (!country) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('País não encontrado.'));
    }

    const dinosaurs = JSON.parse(fs.readFileSync(DINOS_PATH, 'utf8'));
    // Filtra dinossauros onde o countryId (que é um array) inclui o ID do país
    const relatedDinosaurs = dinosaurs.filter(dino => 
      Array.isArray(dino.countryId) ? dino.countryId.includes(id) : dino.countryId === id
    );

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, { 
        message: `Dinossauros encontrados no país: ${country.name}`,
        count: relatedDinosaurs.length 
      })
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por país.', error.message)
    );
  }
};

module.exports = {
  getAllCountries,
  getCountryById,
  getDinosaursByCountry
};