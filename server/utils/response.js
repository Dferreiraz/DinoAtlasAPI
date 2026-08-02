/**
 * response.js
 * Padroniza o formato de saída de todas as requisições da API.
 */

const { STATUS_CODES } = require('./constants');

/**
 * Retorna um objeto de resposta bem-sucedida.
 * @param {Array|Object} data - Os dados a serem retornados.
 * @param {Object} [meta] - Metadados adicionais opcionais (ex: paginação).
 * @returns {Object}
 */
const successResponse = (data, meta = null) => {
  const response = {
    success: true,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Retorna um objeto de resposta de erro.
 * @param {String} message - Mensagem amigável para o usuário.
 * @param {String|Object} [errorDetails] - Detalhes técnicos do erro (opcional).
 * @returns {Object}
 */
const errorResponse = (message, errorDetails = null) => {
  const response = {
    success: false,
    message
  };

  if (errorDetails) {
    response.error = errorDetails;
  }

  return response;
};

module.exports = {
  successResponse,
  errorResponse
};

/*
EXEMPLO DE USO FUTURO:
const { successResponse, errorResponse } = require('../utils/response');

// Sucesso
res.status(200).json(successResponse(dinosaurs, paginationMeta));

// Erro
res.status(404).json(errorResponse("Dinossauro não encontrado"));
*/