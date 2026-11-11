/**
 * requestId.js
 * Gera ou reaproveita um identificador de requisição para correlação de logs.
 * O valor recebido do cliente é validado para evitar injeção de cabeçalhos.
 */

const { randomUUID } = require('crypto');

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

const requestId = (req, res, next) => {
  const incoming = req.get('X-Request-Id');
  const id = typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)
    ? incoming
    : randomUUID();

  req.id = id;
  res.set('X-Request-Id', id);
  next();
};

module.exports = requestId;
