const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const DB_PATH = path.join(__dirname, '../database/continents.json');
const DINOS_PATH = path.join(__dirname, '../database/dinosaurs.json');

const getAllContinents = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de continentes não encontrado.')
      );
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar continentes', error.message)
    );
  }
};

const getContinentById = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de continentes não encontrado.')
      );
    }
    const id = parseInt(req.params.id, 10);
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const continent = data.find(c => c.id === id);

    if (!continent) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Continente não encontrado.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(continent));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o continente.', error.message)
    );
  }
};

const getDinosaursByContinent = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH) || !fs.existsSync(DINOS_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivos de dados não encontrados.')
      );
    }
    
    const id = parseInt(req.params.id, 10);
    const continents = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const continent = continents.find(c => c.id === id);
    
    if (!continent) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Continente não encontrado.'));
    }

    const dinosaurs = JSON.parse(fs.readFileSync(DINOS_PATH, 'utf8'));
    const relatedDinosaurs = dinosaurs.filter(dino => dino.continentId === id);

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, { 
        message: `Dinossauros encontrados no continente: ${continent.name}`,
        count: relatedDinosaurs.length 
      })
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por continente.', error.message)
    );
  }
};

module.exports = {
  getAllContinents,
  getContinentById,
  getDinosaursByContinent
};