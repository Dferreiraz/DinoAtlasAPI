/**
 * errorHandler.js
 * Captura exceções e erros não tratados na aplicação, retornando um JSON
 * padronizado e seguro. Detalhes técnicos são enviados apenas aos logs.
 */

const { STATUS_CODES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');
const { logError } = require('../utils/errors');

const SAFE_MESSAGES = Object.freeze({
  400: 'Requisição inválida.',
  401: 'Não autorizado.',
  403: 'Acesso negado.',
  404: 'Recurso não encontrado.',
  405: 'Método não permitido.',
  408: 'Tempo limite da requisição excedido.',
  413: 'Payload muito grande.',
  415: 'Tipo de conteúdo não suportado.',
  429: 'Muitas requisições. Tente novamente mais tarde.',
  500: 'Erro interno do servidor.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Tempo limite do serviço excedido.'
});

/**
 * Normaliza o status HTTP. Apenas inteiros entre 400 e 599 são aceitos.
 * @param {*} error
 * @returns {Number}
 */
const resolveStatus = (error) => {
  const candidate = Number(error && (error.statusCode || error.status));
  if (Number.isInteger(candidate) && candidate >= 400 && candidate <= 599) {
    return candidate;
  }
  return STATUS_CODES.INTERNAL_SERVER_ERROR;
};

/**
 * Retorna uma mensagem pública genérica baseada apenas no status.
 * Nunca utiliza error.message, error.stack, error.expose ou dados do parser.
 * @param {Number} status
 * @returns {String}
 */
const resolvePublicMessage = (status) => {
  if (SAFE_MESSAGES[status]) {
    return SAFE_MESSAGES[status];
  }
  return status >= 500 ? SAFE_MESSAGES[500] : SAFE_MESSAGES[400];
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = resolveStatus(err);
  const message = resolvePublicMessage(statusCode);

  logError('error-handler', err, req);

  return res.status(statusCode).json(errorResponse(message));
};

module.exports = errorHandler;
module.exports.resolveStatus = resolveStatus;
module.exports.resolvePublicMessage = resolvePublicMessage;
