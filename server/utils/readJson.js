/**
 * readJson.js
 * Módulo responsável pela leitura assíncrona de arquivos JSON.
 * Erros são tipados e mantêm a causa original para investigação nos logs.
 */

const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('./errors');

/**
 * Lê e faz o parse de um arquivo JSON.
 * @param {String} filePath - Caminho relativo ou absoluto do arquivo.
 * @returns {Promise<Array|Object>}
 */
const readJson = async (filePath) => {
  const absolutePath = path.resolve(filePath);

  let fileContent;
  try {
    fileContent = await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError(`Arquivo não encontrado: ${absolutePath}`, {
        code: 'FILE_NOT_FOUND',
        cause: error
      });
    }

    throw new AppError(`Falha ao ler o arquivo: ${absolutePath}`, {
      code: 'FILE_READ_FAILED',
      cause: error
    });
  }

  try {
    return JSON.parse(fileContent);
  } catch (error) {
    throw new AppError(`JSON inválido no arquivo: ${absolutePath}`, {
      code: 'INVALID_JSON',
      cause: error
    });
  }
};

module.exports = readJson;
