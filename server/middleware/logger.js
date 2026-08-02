/**
 * logger.js
 * Registra informações básicas de cada requisição HTTP recebida.
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const method = req.method;
  const url = req.originalUrl || req.url;

  console.log(`${method} ${url} - ${timestamp}`);
  
  next();
};

module.exports = logger;