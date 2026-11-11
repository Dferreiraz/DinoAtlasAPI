/**
 * logger.js
 * Registra informações úteis de cada requisição (método, rota, status e tempo).
 *
 * Apenas o caminho da requisição é registrado: query string e fragmento são
 * descartados para evitar a exposição de dados sensíveis enviados na URL.
 */

/**
 * Extrai somente o caminho de uma URL, descartando query string e fragmento.
 * Valores ausentes, vazios ou de tipo inesperado resultam em `/`, sem lançar
 * exceções.
 *
 * @param {unknown} value
 * @returns {string}
 */
const sanitizePath = (value) => {
  if (typeof value !== 'string') return '/';

  const [path] = value.split(/[?#]/);
  return path || '/';
};

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const method = req.method;
  const url = sanitizePath(req.originalUrl || req.url);
  const requestId = req.id || 'N/A';

  // Escuta o evento 'finish' para capturar o código de status exato e o tempo final
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} ${status} ${duration}ms requestId=${requestId}`);
  });

  next();
};

module.exports = logger;
module.exports.sanitizePath = sanitizePath;
