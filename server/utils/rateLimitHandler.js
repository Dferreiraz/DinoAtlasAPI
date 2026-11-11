/**
 * rateLimitHandler.js
 * Registra bloqueios do rate limiter sem expor dados sensíveis.
 *
 * O logger comum roda depois do rate limiter e, portanto, não vê respostas 429.
 * Este handler preserva o contrato atual da resposta (status e mensagem) e
 * registra apenas evento, origem da chave, método, rota sem query string e
 * status. IP, valor de `CF-Connecting-IP`, headers completos, tokens e outros
 * dados pessoais nunca são registrados.
 */

const MAX_ROUTE_LOG_LENGTH = 200;
const MAX_REQUEST_ID_LOG_LENGTH = 128;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/**
 * Extrai apenas o caminho da requisição, descartando query string e fragmento.
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
const safeRoute = (req) => {
  const raw = typeof req.originalUrl === 'string'
    ? req.originalUrl
    : (typeof req.url === 'string' ? req.url : '/');

  const path = raw.split('?')[0].split('#')[0].replace(CONTROL_CHARS, '');
  return (path || '/').slice(0, MAX_ROUTE_LOG_LENGTH);
};

/**
 * Normaliza a origem da chave para os dois valores públicos possíveis.
 *
 * @param {import('express').Request} req
 * @returns {'public'|'unidentified'}
 */
const resolveKeySource = (req) => (
  req.rateLimitKeySource === 'public' ? 'public' : 'unidentified'
);

/**
 * Sanitiza o request ID usado apenas para correlação de logs.
 *
 * O middleware de request ID já valida o valor recebido do cliente; esta
 * função é uma segunda camada para objetos de requisição sintéticos.
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
const safeRequestId = (req) => {
  if (typeof req.id !== 'string' || req.id.length === 0) return 'N/A';

  const sanitized = req.id.replace(CONTROL_CHARS, '').slice(0, MAX_REQUEST_ID_LOG_LENGTH);
  return sanitized || 'N/A';
};

/**
 * Resolve o status HTTP efetivamente usado na resposta e no log.
 *
 * @param {Object} [options]
 * @returns {number}
 */
const resolveStatusCode = (options = {}) => (
  Number.isInteger(options.statusCode)
  && options.statusCode >= 100
  && options.statusCode <= 999
    ? options.statusCode
    : 429
);

/**
 * Registra um bloqueio do rate limiter sem PII.
 *
 * @param {import('express').Request} req
 * @param {number} [statusCode]
 * @returns {void}
 */
const logRateLimitExceeded = (req, statusCode = 429) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const method = typeof req.method === 'string'
    ? req.method.replace(CONTROL_CHARS, '')
    : 'UNKNOWN';
  const route = safeRoute(req);
  const keySource = resolveKeySource(req);
  const requestId = safeRequestId(req);

  console.log(`[${timestamp}] rate_limit_exceeded method=${method} route=${route} status=${statusCode} requestId=${requestId} keySource=${keySource}`);
};

/**
 * Cria o `handler` do `express-rate-limit`.
 *
 * Mantém o comportamento padrão de status e corpo, aceitando `message` estático
 * ou funcional, e adiciona o registro seguro do bloqueio.
 *
 * O `express-rate-limit@8.7.1` chama o handler sem aguardar a Promise; a
 * assinatura assíncrona é mantida para permitir `message` funcional, assim como
 * no handler padrão da biblioteca.
 *
 * @returns {import('express').RequestHandler}
 */
const createRateLimitHandler = () => async (req, res, _next, options = {}) => {
  const statusCode = resolveStatusCode(options);

  res.status(statusCode);
  logRateLimitExceeded(req, statusCode);

  if (res.writableEnded) return;

  const message = typeof options.message === 'function'
    ? await options.message(req, res)
    : options.message;

  if (!res.writableEnded) {
    res.send(message);
  }
};

module.exports = {
  MAX_ROUTE_LOG_LENGTH,
  MAX_REQUEST_ID_LOG_LENGTH,
  safeRoute,
  resolveKeySource,
  safeRequestId,
  resolveStatusCode,
  logRateLimitExceeded,
  createRateLimitHandler
};
