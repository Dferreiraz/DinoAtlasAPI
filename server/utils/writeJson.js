/**
 * writeJson.js
 * Módulo responsável pela escrita segura em arquivos JSON.
 */

const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('./errors');
const { invalidate } = require('../repositories/jsonRepository');

/**
 * Escreve dados em um arquivo JSON.
 * @param {String} filePath - Caminho do arquivo a ser salvo.
 * @param {Array|Object} data - Dados para salvar.
 * @returns {Promise<void>}
 */
const writeJson = async (filePath, data) => {
  const absolutePath = path.resolve(filePath);

  try {
    const jsonString = JSON.stringify(data, null, 2); // 2 espaços de indentação
    await fs.writeFile(absolutePath, jsonString, 'utf-8');
    // Mantém o cache do repositório consistente com o arquivo recém-gravado.
    invalidate(absolutePath);
  } catch (error) {
    throw new AppError(`Falha ao escrever o arquivo: ${absolutePath}`, {
      code: 'FILE_WRITE_FAILED',
      cause: error
    });
  }
};

module.exports = writeJson;
