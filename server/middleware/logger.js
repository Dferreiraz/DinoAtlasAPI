/**
 * logger.js
 * Registra informações úteis de cada requisição (Método, Rota, Status Code e Tempo de Resposta).
 */

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const method = req.method;
  const url = req.originalUrl || req.url;

  // Escuta o evento 'finish' para capturar o código de status exato e o tempo final
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} ${status} ${duration}ms`);
  });
  
  next();
};

module.exports = logger;