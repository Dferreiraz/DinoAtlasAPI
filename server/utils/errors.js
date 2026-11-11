/**
 * errors.js
 * Erros internos tipados e registro seguro de falhas.
 *
 * As mensagens destes erros podem conter caminhos e detalhes técnicos porque
 * são destinadas exclusivamente aos logs. O errorHandler nunca as repassa ao
 * cliente.
 */

class AppError extends Error {
  /**
   * @param {String} message - Mensagem técnica interna.
   * @param {Object} [options]
   * @param {String} [options.code] - Código interno estável.
   * @param {Number} [options.statusCode] - Status HTTP sugerido.
   * @param {Error} [options.cause] - Erro original.
   */
  constructor(message, { code = 'INTERNAL_ERROR', statusCode = 500, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.expose = false;
  }
}

/**
 * Registra um erro interno com contexto da requisição e stack trace.
 * Nunca deve ser usado para registrar corpos de requisição ou dados sensíveis.
 *
 * @param {String} context - Origem do erro (ex: 'dinosaurs').
 * @param {Error|*} error - Erro capturado.
 * @param {Object} [req] - Requisição Express, quando disponível.
 */
const logError = (context, error, req) => {
  const method = req && req.method ? req.method : 'N/A';
  const url = req && (req.originalUrl || req.url) ? (req.originalUrl || req.url) : 'N/A';
  const requestId = req && req.id ? req.id : 'N/A';
  const code = error && error.code ? ` code=${error.code}` : '';

  if (error instanceof Error) {
    console.error(`[${context}] ${method} ${url} requestId=${requestId}${code}`, error.stack || error.message);
  } else {
    console.error(`[${context}] ${method} ${url} requestId=${requestId}${code}`, error);
  }
};

module.exports = {
  AppError,
  logError
};
