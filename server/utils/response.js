/**
 * response.js
 * Padroniza o formato de saída de todas as requisições da API.
 */

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
 * Apenas a mensagem pública é aceita. Detalhes técnicos nunca fazem parte do
 * contrato de resposta e devem ser registrados exclusivamente nos logs.
 *
 * @param {String} message - Mensagem amigável para o usuário.
 * @returns {Object}
 */
const errorResponse = (message) => ({
  success: false,
  message
});

module.exports = {
  successResponse,
  errorResponse
};
