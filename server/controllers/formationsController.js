const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

const DB_PATH = path.join(__dirname, '../database/formations.json');
const DINOS_PATH = path.join(__dirname, '../database/dinosaurs.json');

const getAllFormations = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de formações não encontrado.')
      );
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return res.status(STATUS_CODES.OK).json(successResponse(data));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar formações geológicas', error.message)
    );
  }
};

const getFormationById = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivo de formações não encontrado.')
      );
    }
    const id = parseInt(req.params.id, 10);
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const formation = data.find(f => f.id === id);

    if (!formation) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Formação geológica não encontrada.'));
    }

    return res.status(STATUS_CODES.OK).json(successResponse(formation));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar a formação geológica.', error.message)
    );
  }
};

const getDinosaursByFormation = async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH) || !fs.existsSync(DINOS_PATH)) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
        errorResponse('Arquivos de dados não encontrados.')
      );
    }
    
    const id = parseInt(req.params.id, 10);
    const formations = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const formation = formations.find(f => f.id === id);
    
    if (!formation) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Formação geológica não encontrada.'));
    }

    const dinosaurs = JSON.parse(fs.readFileSync(DINOS_PATH, 'utf8'));
    // Filtra dinossauros onde o formationId (que é um array) inclui o ID da formação
    const relatedDinosaurs = dinosaurs.filter(dino => 
      Array.isArray(dino.formationId) ? dino.formationId.includes(id) : dino.formationId === id
    );

    return res.status(STATUS_CODES.OK).json(
      successResponse(relatedDinosaurs, { 
        message: `Dinossauros encontrados na formação: ${formation.name}`,
        count: relatedDinosaurs.length 
      })
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros por formação geológica.', error.message)
    );
  }
};

module.exports = {
  getAllFormations,
  getFormationById,
  getDinosaursByFormation
};