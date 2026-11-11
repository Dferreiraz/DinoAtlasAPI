/**
 * logger.js
 * Registra informações úteis de cada requisição (método, rota, status e tempo).
 */

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const method = req.method;
  const url = req.originalUrl || req.url;
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
